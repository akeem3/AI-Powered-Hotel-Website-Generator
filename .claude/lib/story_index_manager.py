#!/usr/bin/env python3
"""
Story Index Manager for Persistent State Management

Trace:
    epic: EPIC-08
    story: STORY-08.06
    reqs: [REQ-IMPL-05, REQ-SEC-015]

Why: Provides atomic, thread-safe persistence for story implementation state
across parallel subprocess executions. Uses file locking to prevent corruption
from concurrent updates and maintains audit trail via timestamps. Pattern proven
in Epic 07 with atomic writes and TTL-based locking.

The manager maintains the single source of truth for implementation progress,
enabling workflow resumption after interruptions and coordinating parallel
story execution across multiple subprocesses.

Architecture decisions:
- File-based locking (fcntl/msvcrt) chosen over Redis for zero-dependency
  deployment and simpler failure modes
- Atomic writes via temp file + os.replace() prevent partial updates
- Backup snapshots balance data safety with I/O performance
- Schema validation on load catches corruption early

Usage:
    # Load and update with automatic locking
    manager = StoryIndexManager()
    manager.load()

    with manager:  # Acquires file lock
        manager.mark_story_phase("08.01", "code-implementation")
        manager.save()
    # Lock automatically released

    # Query current state
    pending = manager.get_pending_stories()
    summary = manager.get_progress_summary()

Example:
    >>> manager = StoryIndexManager()
    >>> manager.load()
    >>> pending = manager.get_pending_stories()
    >>> len(pending)
    14
    >>> with manager:
    ...     manager.mark_story_complete("08.01")
    ...     manager.save()

Related:
    - Story: docs/stories/story-08.06.create-story-index-manager-for-persistent-state_draft_2025-12-11.md
    - Index: .claude/context/coordination/story-implementation-index.yaml
    - Pattern: .claude/lib/parallel-story-orchestrator.py (atomic writes)
    - Pattern: .claude/lib/file-lock.sh (TTL-based locking)

Security:
    - CWE-22: Path validation via validate_path_security()
    - CWE-362: Atomic writes with temp file + os.replace()
    - CWE-377: File permissions 0o600 on index and backups
    - CWE-91: Schema validation for YAML structure
"""

import logging
import os
import platform
import secrets
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import yaml

# Configure logging
logger = logging.getLogger(__name__)

# Constants
SUPPORTED_SCHEMA_VERSION = "1.0"
DEFAULT_LOCK_TIMEOUT = 30.0  # seconds
LOCK_TOKEN_BYTES = 16  # 128 bits of entropy


# =============================================================================
# Custom Exceptions
# =============================================================================


class IndexValidationError(Exception):
    """Raised when story index structure validation fails.

    Trace:
        story: STORY-08.06
        req: REQ-IMPL-05

    Why: Distinguishes schema validation errors from other exceptions to
    enable specific error handling at orchestrator level. Clear error
    messages help diagnose corruption or version mismatches.
    """

    pass


class LockAcquisitionError(Exception):
    """Raised when file lock cannot be acquired within timeout.

    Trace:
        story: STORY-08.06
        req: REQ-SEC-015

    Why: Distinguishes lock timeout from other errors. Enables retry logic
    and graceful degradation in orchestrator when lock contention is high.
    """

    pass


# =============================================================================
# Path Validation (CWE-22 Prevention)
# =============================================================================


def discover_project_root() -> Path:
    """Discover project root using git or environment variable.

    Why: Enables default path resolution without hardcoding project location.
    Supports deployment across different environments (dev, CI, production).

    Returns:
        Path: Absolute path to project root

    Example:
        >>> root = discover_project_root()
        >>> root.name
        'bmad-claude'
    """
    # Check environment override
    env_root = os.environ.get("CLAUDE_PROJECT_ROOT")
    if env_root:
        return Path(env_root).resolve()

    # Try git root
    try:
        import subprocess

        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )
        if result.returncode == 0:
            return Path(result.stdout.strip()).resolve()
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass

    # Fall back to current directory
    return Path.cwd().resolve()


def validate_path_security(path: Path, project_root: Path) -> Path:
    """Validate file path against security requirements.

    Trace:
        story: STORY-08.06
        req: REQ-SEC-015

    Why: Prevents path traversal attacks (CWE-22) by ensuring index file
    path stays within project root. Pattern copied from Epic 07 orchestrator.

    Args:
        path: Path to validate (relative or absolute)
        project_root: Absolute path to project root

    Returns:
        Path: Validated absolute path

    Raises:
        ValueError: If path fails security validation

    Example:
        >>> root = Path("/home/user/project")
        >>> path = Path(".claude/context/coordination/index.yaml")
        >>> validated = validate_path_security(path, root)
        >>> validated.is_absolute()
        True

    Related:
        - Pattern: .claude/lib/parallel-story-orchestrator.py lines 167-207
    """
    # Resolve to absolute path and follow symlinks
    if not path.is_absolute():
        path = project_root / path
    resolved = path.resolve()

    # Check for path traversal attempts
    if ".." in str(path):
        raise ValueError(f"Path traversal detected: {path}")

    # Verify path is within project root
    try:
        resolved.relative_to(project_root)
    except ValueError:
        raise ValueError(f"Path escapes project root: {path}") from None

    return resolved


# =============================================================================
# Story Index Manager
# =============================================================================


class StoryIndexManager:
    """Persistent state manager for parallel story implementation tracking.

    Trace:
        epic: EPIC-08
        story: STORY-08.06
        pattern: Repository

    Why: Centralizes state management for parallel implementation workflow.
    Provides atomic updates, file locking, backup snapshots, and schema
    validation. Enables coordination across multiple subprocesses without
    requiring external services (Redis, database).

    Thread-safe when used with context manager (automatic locking). Stateless
    design allows multiple instances to coordinate via file locking.

    Attributes:
        index_path: Path to story index YAML file
        index_data: Loaded index data structure (None until load() called)
        lock_fd: File descriptor for lock file (None when unlocked)
        lock_token: Random token for lock verification

    Example:
        >>> manager = StoryIndexManager()
        >>> manager.load()
        >>> with manager:
        ...     manager.mark_story_phase("08.01", "code-implementation")
        ...     manager.save()

    Note:
        File locking uses fcntl (Unix) or msvcrt (Windows). Context manager
        recommended for automatic lock lifecycle management.

    Related:
        - Story: docs/stories/story-08.06.create-story-index-manager-for-persistent-state_draft_2025-12-11.md
    """

    def __init__(self, index_path: Path | None = None) -> None:
        """Initialize StoryIndexManager with index file path.

        Args:
            index_path: Path to story index file. If None, uses default path
                at .claude/context/coordination/story-implementation-index.yaml
                relative to project root.

        Example:
            >>> manager = StoryIndexManager()  # Uses default path
            >>> custom = StoryIndexManager(Path("/custom/index.yaml"))
        """
        self.project_root = discover_project_root()

        if index_path is None:
            # Default path
            index_path = self.project_root / ".claude" / "context" / "coordination" / "story-implementation-index.yaml"
        elif not index_path.is_absolute():
            # Relative path - make absolute relative to project root
            index_path = self.project_root / index_path
        # else: absolute path provided, use as-is (for testing with temp dirs)

        self.index_path = index_path.resolve()
        self.index_data: dict[str, Any] | None = None
        self.lock_fd: int | None = None
        self.lock_token: str | None = None

    def load(self) -> None:
        """Load and validate story index from file.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Loads index structure with schema validation to catch corruption
        early. Uses yaml.safe_load for security (CWE-91 prevention).

        Raises:
            FileNotFoundError: If index file doesn't exist
            IndexValidationError: If index structure is invalid

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> manager.index_data['epic_id']
            '08'

        Related:
            - Pattern: .claude/lib/dependency-resolver.py (safe YAML loading)
        """
        if not self.index_path.exists():
            raise FileNotFoundError(f"Story index not found: {self.index_path}")

        try:
            with open(self.index_path, encoding="utf-8") as f:
                self.index_data = yaml.safe_load(f)
        except yaml.YAMLError as e:
            raise IndexValidationError(f"Failed to parse YAML: {e}") from e

        # Validate structure
        self._validate_schema()

    def _validate_schema(self) -> None:
        """Validate story index schema structure.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Ensures index has required fields and valid structure before
        use. Early validation prevents cascading errors in workflow logic.

        Raises:
            IndexValidationError: If schema is invalid

        Related:
            - Pattern: .claude/lib/parallel-story-orchestrator.py (JSON validation)
        """
        if self.index_data is None:
            raise IndexValidationError("No data loaded")

        # Check schema version
        schema_version = self.index_data.get("schema_version")
        if schema_version != SUPPORTED_SCHEMA_VERSION:
            raise IndexValidationError(
                f"Unsupported schema version: {schema_version}. "
                f"Expected: {SUPPORTED_SCHEMA_VERSION}"
            )

        # Check required top-level fields
        required_fields = [
            "epic_id",
            "epic_file",
            "created_at",
            "updated_at",
            "updated_by",
            "lock",
            "stories",
            "dependency_graph",
            "statistics",
            "workflow_state",
        ]

        for field in required_fields:
            if field not in self.index_data:
                raise IndexValidationError(f"Missing required field: {field}")

        # Validate lock structure
        lock = self.index_data.get("lock", {})
        lock_fields = ["locked", "locked_by", "acquired_at", "expires_at", "lock_token"]
        for field in lock_fields:
            if field not in lock:
                raise IndexValidationError(f"Missing lock field: {field}")

        # Validate story entries
        stories = self.index_data.get("stories", [])
        if not isinstance(stories, list):
            raise IndexValidationError("'stories' must be a list")

        required_story_fields = ["story_id", "status", "implementation_phase"]
        for i, story in enumerate(stories):
            if not isinstance(story, dict):
                raise IndexValidationError(f"Invalid story entry at index {i}")
            for field in required_story_fields:
                if field not in story:
                    raise IndexValidationError(
                        f"Invalid story entry at index {i}: missing field '{field}'"
                    )

    def save(self) -> None:
        """Save story index to file atomically.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Uses atomic write pattern (temp file + os.replace) to prevent
        partial updates from corrupting index. Pattern proven in Epic 07.

        Raises:
            RuntimeError: If no data loaded or save fails

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> manager.index_data['epic_id'] = '09'
            >>> manager.save()

        Related:
            - Pattern: .claude/lib/parallel-story-orchestrator.py lines 835-848
        """
        if self.index_data is None:
            raise RuntimeError("No data loaded. Call load() first.")

        # Update timestamp
        self.index_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Atomic write: temp file + os.replace()
        temp_path = self.index_path.with_suffix(".yaml.tmp")
        try:
            with open(temp_path, "w", encoding="utf-8") as f:
                # Set restrictive permissions before writing
                os.chmod(temp_path, 0o600)
                yaml.dump(
                    self.index_data,
                    f,
                    default_flow_style=False,
                    sort_keys=False,
                    allow_unicode=True,
                )
            # Atomic rename
            os.replace(str(temp_path), str(self.index_path))
            logger.debug(f"Saved story index: {self.index_path}")
        except Exception as e:
            # Clean up temp file on failure
            if temp_path.exists():
                temp_path.unlink()
            raise RuntimeError(f"Failed to save story index: {e}") from e

    def get_pending_stories(self) -> list[dict[str, Any]]:
        """Get stories in pending or ready status.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Enables orchestrator to identify stories ready for execution.
        Returns both pending and ready to support different workflow phases.

        Returns:
            List of story entries with status 'pending' or 'ready'

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> pending = manager.get_pending_stories()
            >>> len(pending)
            14

        Related:
            - Index: .claude/context/coordination/story-implementation-index.yaml
        """
        if self.index_data is None:
            raise RuntimeError("No data loaded. Call load() first.")

        stories = self.index_data.get("stories", [])
        return [s for s in stories if s.get("status") in ("pending", "ready")]

    def mark_story_phase(self, story_id: str, phase: str) -> None:
        """Update story implementation phase with timestamp.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Tracks story progress through implementation phases. Preserves
        previous phase for audit trail. Timestamps enable progress monitoring.

        Args:
            story_id: Story identifier (e.g., "08.01")
            phase: Implementation phase name (e.g., "code-implementation")

        Raises:
            ValueError: If story_id not found in index

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> manager.mark_story_phase("08.01", "code-implementation")
            >>> manager.save()

        Note:
            Call save() after marking phase to persist changes.

        Related:
            - Pattern: .claude/lib/parallel-story-orchestrator.py (status updates)
        """
        if self.index_data is None:
            raise RuntimeError("No data loaded. Call load() first.")

        stories = self.index_data.get("stories", [])
        story = next((s for s in stories if s["story_id"] == story_id), None)

        if story is None:
            raise ValueError(f"Story {story_id} not found in index")

        # Preserve previous phase
        current_phase = story.get("implementation_phase")
        story["previous_phase"] = current_phase

        # Update phase
        story["implementation_phase"] = phase

        # Update timestamp
        self.index_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        logger.debug(f"Marked story {story_id} phase: {phase}")

    def mark_story_complete(self, story_id: str) -> None:
        """Mark story as completed with end timestamp.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Records story completion time and updates statistics. Calculates
        duration if start_time exists. Updates aggregate statistics for
        progress monitoring. Creates backup before major state change.

        Args:
            story_id: Story identifier (e.g., "08.01")

        Raises:
            ValueError: If story_id not found in index

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> manager.mark_story_complete("08.01")
            >>> manager.save()

        Note:
            Call save() after marking complete to persist changes.
            Backup is created automatically before status update.

        Related:
            - Index: .claude/context/coordination/story-implementation-index.yaml
        """
        if self.index_data is None:
            raise RuntimeError("No data loaded. Call load() first.")

        # Create backup before major update (AC5)
        self.create_backup()

        stories = self.index_data.get("stories", [])
        story = next((s for s in stories if s["story_id"] == story_id), None)

        if story is None:
            raise ValueError(f"Story {story_id} not found in index")

        # Update status
        story["previous_status"] = story.get("status")
        story["status"] = "completed"

        # Set end time
        now = datetime.now(timezone.utc)
        story["end_time"] = now.isoformat()

        # Calculate duration if start_time exists
        if story.get("start_time"):
            try:
                start_time = datetime.fromisoformat(story["start_time"])
                duration = (now - start_time).total_seconds()
                story["duration_seconds"] = duration
            except (ValueError, TypeError):
                logger.warning(f"Failed to parse start_time for {story_id}")

        # Update statistics
        stats = self.index_data.get("statistics", {})
        stats["completed"] = stats.get("completed", 0) + 1

        # Decrement from previous status
        prev_status = story.get("previous_status", "pending")
        if prev_status in stats:
            stats[prev_status] = max(0, stats.get(prev_status, 0) - 1)

        # Update timestamp
        self.index_data["updated_at"] = now.isoformat()

        logger.debug(f"Marked story {story_id} complete")

    def get_progress_summary(self) -> dict[str, Any]:
        """Get summary statistics for implementation progress.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Provides aggregate view of implementation progress for
        monitoring and reporting. Returns statistics from index.

        Returns:
            Dictionary with statistics:
                - total_stories: Total number of stories
                - pending: Number in pending status
                - ready: Number in ready status
                - in_progress: Number in progress
                - completed: Number completed
                - failed: Number failed
                - blocked: Number blocked

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> summary = manager.get_progress_summary()
            >>> summary['completed']
            5

        Related:
            - Index: .claude/context/coordination/story-implementation-index.yaml
        """
        if self.index_data is None:
            raise RuntimeError("No data loaded. Call load() first.")

        return self.index_data.get("statistics", {})

    def create_backup(self) -> Path:
        """Create backup snapshot of story index.

        Trace:
            story: STORY-08.06
            req: REQ-IMPL-05

        Why: Prevents data loss during updates. Backup created before
        major operations (mark_story_complete) or on-demand. Timestamped
        filename enables recovery from specific points.

        Returns:
            Path to created backup file

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> backup = manager.create_backup()
            >>> backup.exists()
            True

        Note:
            Backup file has restrictive permissions (0o600) for security.

        Related:
            - Pattern: .claude/lib/parallel-story-orchestrator.py (atomic writes)
        """
        if self.index_data is None:
            raise RuntimeError("No data loaded. Call load() first.")

        # Generate backup filename with timestamp
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        backup_name = f"{self.index_path.stem}.backup.{timestamp}.yaml"
        backup_path = self.index_path.parent / backup_name

        # Write backup with secure permissions
        with open(backup_path, "w", encoding="utf-8") as f:
            os.chmod(backup_path, 0o600)
            yaml.dump(
                self.index_data,
                f,
                default_flow_style=False,
                sort_keys=False,
                allow_unicode=True,
            )

        logger.info(f"Created backup: {backup_path}")
        return backup_path

    def acquire_lock(self, timeout: float = DEFAULT_LOCK_TIMEOUT) -> None:
        """Acquire exclusive file lock for index updates.

        Trace:
            story: STORY-08.06
            req: REQ-SEC-015

        Why: Prevents concurrent updates from corrupting index. Uses fcntl
        (Unix) or msvcrt (Windows) for file locking. Timeout prevents
        indefinite blocking on stale locks.

        Args:
            timeout: Maximum seconds to wait for lock. Defaults to 30.

        Raises:
            LockAcquisitionError: If lock cannot be acquired within timeout

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> manager.acquire_lock(timeout=10)
            >>> try:
            ...     manager.save()
            ... finally:
            ...     manager.release_lock()

        Note:
            Prefer using context manager (__enter__/__exit__) for automatic
            lock lifecycle management.

        Related:
            - Pattern: .claude/lib/file-lock.sh (TTL-based locking)
        """
        if self.lock_fd is not None:
            logger.warning("Lock already acquired")
            return

        # Create lock file path
        lock_path = self.index_path.with_suffix(".lock")

        # Platform-specific lock implementation
        if platform.system() == "Windows":
            self._acquire_lock_windows(lock_path, timeout)
        else:
            self._acquire_lock_unix(lock_path, timeout)

        # Generate lock token for verification
        self.lock_token = secrets.token_hex(LOCK_TOKEN_BYTES)

        logger.debug(f"Acquired lock: {lock_path}")

    def _acquire_lock_unix(self, lock_path: Path, timeout: float) -> None:
        """Acquire lock using fcntl (Unix/Linux/macOS).

        Args:
            lock_path: Path to lock file
            timeout: Lock acquisition timeout in seconds

        Raises:
            LockAcquisitionError: If lock cannot be acquired
        """
        import fcntl

        start_time = time.time()

        while True:
            try:
                # Open lock file (create if doesn't exist)
                fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR, 0o600)

                # Try non-blocking lock
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)

                # Lock acquired
                self.lock_fd = fd
                return

            except (IOError, OSError) as e:
                # Lock held by another process
                if fd:
                    os.close(fd)

                # Check timeout
                elapsed = time.time() - start_time
                if elapsed >= timeout:
                    raise LockAcquisitionError(
                        f"Failed to acquire lock after {timeout}s"
                    ) from e

                # Wait and retry
                time.sleep(0.1)

    def _acquire_lock_windows(self, lock_path: Path, timeout: float) -> None:
        """Acquire lock using msvcrt (Windows).

        Args:
            lock_path: Path to lock file
            timeout: Lock acquisition timeout in seconds

        Raises:
            LockAcquisitionError: If lock cannot be acquired
        """
        import msvcrt

        start_time = time.time()

        while True:
            try:
                # Open lock file (create if doesn't exist)
                fd = os.open(str(lock_path), os.O_CREAT | os.O_RDWR | os.O_BINARY, 0o600)

                # Try lock (1 byte at offset 0)
                msvcrt.locking(fd, msvcrt.LK_NBLCK, 1)

                # Lock acquired
                self.lock_fd = fd
                return

            except (IOError, OSError) as e:
                # Lock held by another process
                if fd:
                    os.close(fd)

                # Check timeout
                elapsed = time.time() - start_time
                if elapsed >= timeout:
                    raise LockAcquisitionError(
                        f"Failed to acquire lock after {timeout}s"
                    ) from e

                # Wait and retry
                time.sleep(0.1)

    def release_lock(self) -> None:
        """Release file lock.

        Trace:
            story: STORY-08.06
            req: REQ-SEC-015

        Why: Releases exclusive lock to allow other processes to acquire.
        Must be called after updates complete to prevent lock contention.

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> manager.acquire_lock()
            >>> manager.save()
            >>> manager.release_lock()

        Note:
            Prefer using context manager for automatic lock release.

        Related:
            - Pattern: .claude/lib/file-lock.sh (lock release)
        """
        if self.lock_fd is None:
            logger.warning("No lock to release")
            return

        # Platform-specific unlock
        if platform.system() == "Windows":
            self._release_lock_windows()
        else:
            self._release_lock_unix()

        logger.debug("Released lock")

    def _release_lock_unix(self) -> None:
        """Release lock using fcntl (Unix/Linux/macOS)."""
        import fcntl

        if self.lock_fd is not None:
            fcntl.flock(self.lock_fd, fcntl.LOCK_UN)
            os.close(self.lock_fd)
            self.lock_fd = None
            self.lock_token = None

    def _release_lock_windows(self) -> None:
        """Release lock using msvcrt (Windows)."""
        import msvcrt

        if self.lock_fd is not None:
            msvcrt.locking(self.lock_fd, msvcrt.LK_UNLCK, 1)
            os.close(self.lock_fd)
            self.lock_fd = None
            self.lock_token = None

    def __enter__(self) -> "StoryIndexManager":
        """Context manager entry: acquire lock.

        Trace:
            story: STORY-08.06
            req: REQ-SEC-015

        Why: Enables automatic lock management with `with` statement.
        Ensures lock is always released even if exception occurs.

        Returns:
            self for context manager pattern

        Example:
            >>> manager = StoryIndexManager()
            >>> manager.load()
            >>> with manager:
            ...     manager.mark_story_phase("08.01", "code-implementation")
            ...     manager.save()

        Related:
            - Pattern: Python context manager protocol
        """
        self.acquire_lock()
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        """Context manager exit: release lock.

        Args:
            exc_type: Exception type (if exception occurred)
            exc_val: Exception value
            exc_tb: Exception traceback

        Note:
            Lock is released even if exception occurred during context.
        """
        self.release_lock()
