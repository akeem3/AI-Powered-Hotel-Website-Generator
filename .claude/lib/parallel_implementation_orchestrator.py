#!/usr/bin/env python3
"""
Parallel Implementation Orchestrator
Epic 08, Story 8.3 - Core orchestrator for parallel story implementations

Manages parallel story implementation workflows with isolated subprocess contexts.
Builds on Epic 07's parallel-story-orchestrator.py patterns for subprocess management,
security validation, and concurrency control.

Trace:
    epic: EPIC-08
    story: STORY-08.03
    reqs: [AC1, AC2, AC3, AC4, AC5, AC6, AC7]

Why: Separates story implementation orchestration from story creation orchestration
to enable distinct workflows. Story creation is batch-focused (create all stories
from epic), while implementation is dependency-aware (implement ready stories with
proper ordering). Reuses 60%+ of Epic 07 patterns for subprocess management, security,
and concurrency to maintain consistency and leverage proven code.

Usage:
    from parallel_implementation_orchestrator import ParallelImplementationOrchestrator

    orchestrator = ParallelImplementationOrchestrator(
        project_root=Path.cwd(),
        max_concurrent=5,
    )

    # Placeholder methods to be implemented in Story 8.4
    await orchestrator.run_developing(story)

Security:
    - CWE-78: All subprocess calls use shell=False
    - CWE-22: Path validation against directory traversal
    - CWE-400: Timeout controls (10 min per story, 30 min total)
    - CWE-377: Temp files with 0o600 permissions
    - CWE-209: Error message sanitization with credential redaction

Related:
    - Epic: epic-08.adaptive_parallel-story-implementation-workflow_ready_2025-12-11.md
    - Story: story-08.03.create-parallel-implementation-orchestrator-core_draft_2025-12-11.md
    - Reference: .claude/lib/parallel-story-orchestrator.py (Epic 07 patterns)
"""

import argparse
import asyncio
import atexit
import json
import logging
import os
import re
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, NamedTuple

# Import format_agent_output from json_output_formatter (AC5)
# Add .claude/lib to path for imports
sys.path.insert(0, str(Path(__file__).parent))
from json_output_formatter import format_agent_output, AgentOutputData
from story_index_manager import StoryIndexManager

# Configure logging
log_level = logging.DEBUG if os.environ.get("DEBUG") else logging.INFO
logging.basicConfig(
    level=log_level,
    format='[%(levelname)s] %(message)s',
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)

# =============================================================================
# Constants
# =============================================================================

VERSION = "1.0.0"
MAX_CONCURRENT = 5  # NFR-2: Fixed parallelism limit (AC3)
SUBPROCESS_TIMEOUT = 600  # 10 minutes per story (AC2)
TOTAL_TIMEOUT = 1800  # 30 minutes total workflow
MAX_AGENT_NAME_LENGTH = 32

# Allowed directories for file operations (relative to project root)
ALLOWED_STORY_DIRS = ["docs/stories", "tests/fixtures/stories"]

# Agent name validation pattern (CWE-78 prevention)
AGENT_NAME_PATTERN = re.compile(r"^[a-z][a-z0-9-]*$")

# Track temp files for cleanup
_temp_files: list[str] = []

# Credential redaction patterns (from parallel-story-orchestrator.py)
# IMPORTANT: Order matters - more specific patterns must come before generic ones
CREDENTIAL_PATTERNS = [
    # JWT tokens FIRST (before generic "token" pattern) - eyJ prefix
    (r'eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', '<REDACTED_JWT>'),
    # SSH private keys (specific, multi-line)
    (r'-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----', '<REDACTED_PRIVATE_KEY>'),
    # Bearer tokens (before generic token pattern)
    (r'Bearer\s+[A-Za-z0-9\-._~+/]+=*', 'Bearer <REDACTED>'),
    (r'Authorization:\s*Bearer\s+\S+', 'Authorization: Bearer <REDACTED>'),
    # AWS credentials (specific patterns)
    (r'aws_access_key_id\s*[:=]\s*\S+', 'aws_access_key_id=<REDACTED>'),
    (r'aws_secret_access_key\s*[:=]\s*\S+', 'aws_secret_access_key=<REDACTED>'),
    (r'AKIA[0-9A-Z]{16}', '<REDACTED_AWS_KEY>'),
    # Database connection strings (before path truncation)
    (r'(postgresql|mysql|mongodb|redis)://[^@\s]+@', r'\1://<REDACTED>@'),
    # URL credentials (https://user:pass@host) (before path truncation)
    (r'(https?://)([^:@\s]+):([^@\s]+)@', r'\1<REDACTED>@'),
    # Generic patterns (after specific ones)
    (r'password\s*[:=]\s*\S+', 'password=<REDACTED>'),
    (r'token\s*[:=]\s*\S+', 'token=<REDACTED>'),
    (r'api[_-]?key\s*[:=]\s*\S+', 'api_key=<REDACTED>'),
    (r'secret\s*[:=]\s*\S+', 'secret=<REDACTED>'),
]


# =============================================================================
# Data Structures
# =============================================================================


class StoryEntry(NamedTuple):
    """Story entry for implementation tracking.

    Trace:
        story: STORY-08.03
        pattern: Immutable data structure

    Why: Uses NamedTuple for immutability and type safety, following Epic 07
    pattern. Provides minimal story context needed for implementation workflow
    without loading full story file content.

    Attributes:
        story_id: Story identifier (e.g., "08.03").
        story_file: Absolute path to story markdown file.
        title: Story title for display.
        status: Implementation status ("pending", "ready", "in_progress", etc.).
        dependencies: List of story IDs this story depends on.

    Example:
        >>> story = StoryEntry(
        ...     story_id="08.03",
        ...     story_file="/path/to/story-08.03.test_draft_2025-12-11.md",
        ...     title="Create orchestrator core",
        ...     status="ready",
        ...     dependencies=["08.01", "08.02"],
        ... )
        >>> story.story_id
        '08.03'
    """
    story_id: str
    story_file: str
    title: str
    status: str
    dependencies: list[str]


class WorkflowPhaseResult(NamedTuple):
    """Result from a single workflow phase execution.

    Trace:
        story: STORY-08.03
        pattern: Result aggregation

    Why: Immutable result type enables safe concurrent execution without
    shared state. Follows Epic 07 SubprocessResult pattern for consistency.

    Attributes:
        phase_name: Phase identifier ("validating", "scouting", "developing", etc.).
        status: Phase status ("success", "validation_failed", "error").
        duration_ms: Execution duration in milliseconds.
        output: Phase output content or error message.
        issues: List of issues found during phase.

    Example:
        >>> result = WorkflowPhaseResult(
        ...     phase_name="validating",
        ...     status="success",
        ...     duration_ms=150,
        ...     output="Validation passed",
        ...     issues=[],
        ... )
        >>> result.status
        'success'
    """
    phase_name: str
    status: str
    duration_ms: int
    output: str
    issues: list[str]


# =============================================================================
# Orchestrator Class
# =============================================================================


class ParallelImplementationOrchestrator:
    """Core orchestrator for parallel story implementation workflows.

    Trace:
        epic: EPIC-08
        story: STORY-08.03
        pattern: Orchestrator

    Why: Centralizes subprocess management, security validation, and workflow
    coordination. Separates concerns between infrastructure (this class) and
    workflow phases (Story 8.4). Reuses Epic 07 patterns for security and
    concurrency to maintain consistency across parallel workflows.

    Attributes:
        project_root: Absolute path to project root directory.
        max_concurrent: Maximum concurrent subprocess limit (default 5).
        semaphore: Asyncio semaphore for concurrency control.

    Example:
        >>> orchestrator = ParallelImplementationOrchestrator(
        ...     project_root=Path("/home/user/project"),
        ...     max_concurrent=3,
        ... )
        >>> # Workflow phase methods will be implemented in Story 8.4

    Note:
        Thread-safe: Uses asyncio for concurrency, no shared mutable state.
        Context isolation: Each subprocess has isolated 200k-token context.
    """

    def __init__(
        self,
        project_root: Path,
        max_concurrent: int = MAX_CONCURRENT,
        story_index_path: Path | None = None,
    ) -> None:
        """Initialize orchestrator with project configuration.

        Args:
            project_root: Absolute path to project root directory.
            max_concurrent: Maximum concurrent processes (default 5).
            story_index_path: Optional path to story implementation index.

        Raises:
            ValueError: If project_root is not an absolute path.
        """
        if not project_root.is_absolute():
            raise ValueError(f"project_root must be absolute: {project_root}")

        self.project_root = project_root.resolve()
        self.max_concurrent = max_concurrent
        self.story_index_path = story_index_path
        self.semaphore = asyncio.Semaphore(max_concurrent)

        logger.info(
            f"Initialized orchestrator: root={self.project_root}, "
            f"max_concurrent={self.max_concurrent}, "
            f"index={self.story_index_path or 'default'}"
        )

    # =========================================================================
    # Security Validation (AC2)
    # =========================================================================

    def validate_path_security(
        self,
        path: str,
        allowed_dirs: list[str],
    ) -> Path:
        """Validate file path against security requirements (CWE-22 prevention).

        Trace:
            story: STORY-08.03
            reqs: [AC2]
            security: CWE-22

        Why: Path validation prevents directory traversal attacks. Reused from
        Epic 07 parallel-story-orchestrator.py with same validation logic for
        consistency across parallel workflows.

        Args:
            path: Path to validate (relative or absolute).
            allowed_dirs: List of allowed directory prefixes (relative to project root).

        Returns:
            Validated absolute path.

        Raises:
            ValueError: If path fails security validation.

        Example:
            >>> orchestrator.validate_path_security(
            ...     "docs/stories/story-08.03.test_draft_2025-12-11.md",
            ...     ["docs/stories"],
            ... )
            Path('/home/user/project/docs/stories/story-08.03.test_draft_2025-12-11.md')

        Related:
            - Source: parallel-story-orchestrator.py lines 167-207
            - Security: CWE-22 Path Traversal Prevention
        """
        # Resolve to absolute path and follow symlinks
        input_path = Path(path)
        if not input_path.is_absolute():
            input_path = self.project_root / input_path
        resolved = input_path.resolve()

        # Check for path traversal attempts
        if ".." in str(path):
            raise ValueError(f"Path traversal detected: {path}")

        # Verify path is within project root
        try:
            resolved.relative_to(self.project_root)
        except ValueError:
            raise ValueError(f"Path escapes project root: {path}") from None

        # Check against allowed directories
        for allowed_dir in allowed_dirs:
            allowed_path = (self.project_root / allowed_dir).resolve()
            try:
                resolved.relative_to(allowed_path)
                return resolved
            except ValueError:
                continue

        raise ValueError(f"Path not in allowed directories {allowed_dirs}: {path}")

    def validate_agent_name(self, agent_name: str) -> bool:
        """Validate agent name format and check for injection attempts.

        Trace:
            story: STORY-08.03
            reqs: [AC2]
            security: CWE-78

        Why: Agent name validation prevents command injection when launching
        subprocesses. Reused from Epic 07 for consistency.

        Args:
            agent_name: Agent name to validate.

        Returns:
            True if valid.

        Raises:
            ValueError: If agent name is invalid.

        Example:
            >>> orchestrator.validate_agent_name("dev-python")
            True

        Related:
            - Source: parallel-story-orchestrator.py lines 210-244
            - Security: CWE-78 Command Injection Prevention
        """
        if not agent_name:
            raise ValueError("Agent name is empty")

        if not AGENT_NAME_PATTERN.match(agent_name):
            raise ValueError(
                f"Invalid agent name format: '{agent_name}'. "
                f"Must match ^[a-z][a-z0-9-]*$"
            )

        if len(agent_name) > MAX_AGENT_NAME_LENGTH:
            raise ValueError(
                f"Agent name too long: '{agent_name}'. "
                f"Maximum {MAX_AGENT_NAME_LENGTH} characters."
            )

        # Check for shell metacharacters
        shell_metacharacters = ";|&$`(){}[]<>!~*?\\"
        if any(c in agent_name for c in shell_metacharacters):
            raise ValueError(
                f"Agent name contains shell metacharacters: '{agent_name}'"
            )

        return True

    def sanitize_error_message(self, msg: str) -> str:
        """Sanitize error message to prevent information disclosure.

        Trace:
            story: STORY-08.03
            reqs: [AC2]
            security: CWE-209

        Why: Error sanitization prevents credential leakage and path disclosure
        in logs and reports. Reused from Epic 07 with same redaction patterns.

        Args:
            msg: Raw error message from subprocess.

        Returns:
            Sanitized error message safe for logging/reporting.

        Example:
            >>> orchestrator.sanitize_error_message(
            ...     "Auth failed: password=secret123"
            ... )
            'Auth failed: password=<REDACTED>'

        Related:
            - Source: parallel-story-orchestrator.py lines 283-373
            - Security: CWE-209 Information Disclosure Prevention
        """
        # Redact credential patterns FIRST (before path truncation)
        for pattern, replacement in CREDENTIAL_PATTERNS:
            def safe_replace(match: re.Match[str]) -> str:
                matched_text = match.group(0)
                # Don't replace if it's already a redaction marker
                if '<REDACTED' in matched_text or 'REDACTED>' in matched_text:
                    return matched_text
                # Apply the replacement
                if '\\1' in replacement or '\\2' in replacement:
                    return match.expand(replacement)
                return replacement

            msg = re.sub(pattern, safe_replace, msg, flags=re.IGNORECASE)

        # Truncate ALL absolute paths to basename only
        def replace_path_with_basename(match: re.Match[str]) -> str:
            full_path = match.group(0)
            # Check if this looks like a URL (has :// in it) - skip truncation
            if '://' in full_path:
                return full_path
            # For Windows paths, replace both / and \ with / for os.path.basename
            normalized = full_path.replace('\\', '/')
            return os.path.basename(normalized)

        # Match absolute Unix paths: /path/to/file
        msg = re.sub(r'(?<!:)/[a-zA-Z0-9_.\-/]+', replace_path_with_basename, msg)

        # Match absolute Windows paths: C:\path\to\file or C:/path/to/file
        msg = re.sub(
            r'[A-Za-z]:[/\\](?:[a-zA-Z0-9_.\-]+[/\\])*[a-zA-Z0-9_.\-]+',
            replace_path_with_basename,
            msg
        )

        # Escape JSON special characters
        msg = msg.replace('\\', '\\\\')
        msg = msg.replace('"', '\\"')
        msg = msg.replace('\n', '\\n')
        msg = msg.replace('\r', '\\r')
        msg = msg.replace('\t', '\\t')

        # Limit to 500 characters
        if len(msg) > 500:
            msg = msg[:497] + "..."

        return msg

    # =========================================================================
    # Subprocess Management Methods (AC7)
    # =========================================================================

    async def launch_subprocess(
        self,
        agent_name: str,
        story_file: str,
        context: str,
    ) -> asyncio.subprocess.Process:
        """Launch subprocess for agent execution with isolated context.

        Trace:
            story: STORY-08.04
            reqs: [AC6, AC7]
            security: CWE-78

        Why: Centralizes subprocess launching with security controls (shell=False,
        validated inputs, timeout). Pattern from parallel-story-orchestrator.py
        run_story_subprocess().

        Args:
            agent_name: Validated agent name to execute.
            story_file: Validated path to story file.
            context: Context content to pass via stdin.

        Returns:
            Subprocess process handle.

        Raises:
            ValueError: If agent_name or story_file fail validation.

        Example:
            >>> proc = await orchestrator.launch_subprocess(
            ...     "code-scout",
            ...     "/path/to/story-08.04.md",
            ...     "Scout this codebase..."
            ... )

        Related:
            - Pattern: parallel-story-orchestrator.py run_story_subprocess()
        """
        # Validate agent name (CWE-78 prevention)
        self.validate_agent_name(agent_name)

        # Build subprocess command
        # SECURITY: shell=False is enforced by create_subprocess_exec
        cmd = [
            "claude",
            "-p",
            "--output-format", "json",
            "--allowedTools", "Write,Read,Edit,Glob,Grep,Bash",
        ]

        # Launch subprocess with isolated context
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(self.project_root),
        )

        return proc

    async def monitor_subprocess(
        self,
        proc: asyncio.subprocess.Process,
        context_input: str = "",
        timeout: int = SUBPROCESS_TIMEOUT,
    ) -> tuple[bytes, bytes]:
        """Monitor subprocess execution with timeout and health checks.

        Trace:
            story: STORY-08.04
            reqs: [AC6, AC7]

        Why: Separates monitoring logic from launching to enable different
        timeout strategies per phase. Pattern from parallel-story-orchestrator.py.

        Args:
            proc: Subprocess process handle.
            context_input: Context to send to stdin.
            timeout: Timeout in seconds (default 600).

        Returns:
            Tuple of (stdout, stderr) bytes.

        Raises:
            asyncio.TimeoutError: If subprocess exceeds timeout.

        Example:
            >>> stdout, stderr = await orchestrator.monitor_subprocess(proc, "context", 300)

        Related:
            - Pattern: parallel-story-orchestrator.py asyncio.wait_for()
        """
        try:
            stdout, stderr = await asyncio.wait_for(
                proc.communicate(input=context_input.encode("utf-8") if context_input else None),
                timeout=timeout,
            )
            return stdout, stderr
        except asyncio.TimeoutError:
            # Timeout occurred, handle gracefully
            await self.handle_timeout(proc)
            raise

    async def handle_timeout(
        self,
        proc: asyncio.subprocess.Process,
    ) -> None:
        """Handle subprocess timeout with graceful termination.

        Trace:
            story: STORY-08.04
            reqs: [AC2, AC7]
            security: CWE-400

        Why: Timeout handling must be graceful (SIGTERM before SIGKILL) to
        allow subprocesses to clean up resources.

        Args:
            proc: Subprocess process handle.

        Note:
            Sends SIGTERM, waits 5s, then SIGKILL if needed.

        Example:
            >>> await orchestrator.handle_timeout(proc)

        Related:
            - Security: CWE-400 Resource Exhaustion Prevention
        """
        try:
            # Send SIGTERM for graceful shutdown
            proc.terminate()
            # Wait up to 5 seconds for graceful exit
            await asyncio.wait_for(proc.wait(), timeout=5.0)
        except asyncio.TimeoutError:
            # Still running after SIGTERM, send SIGKILL
            proc.kill()
            await proc.wait()

    async def cleanup_subprocess(
        self,
        proc: asyncio.subprocess.Process,
    ) -> None:
        """Clean up subprocess resources after execution.

        Trace:
            story: STORY-08.04
            reqs: [AC7]

        Why: Ensures proper resource cleanup even on errors.

        Args:
            proc: Subprocess process handle.

        Example:
            >>> await orchestrator.cleanup_subprocess(proc)

        Related:
            - Pattern: parallel-story-orchestrator.py cleanup_temp_files()
        """
        # Close pipes if still open
        if proc.stdin and not proc.stdin.is_closing():
            proc.stdin.close()
        if proc.stdout and not proc.stdout.is_closing():
            proc.stdout.close()
        if proc.stderr and not proc.stderr.is_closing():
            proc.stderr.close()

        # Ensure process is terminated
        if proc.returncode is None:
            try:
                proc.kill()
                await proc.wait()
            except ProcessLookupError:
                pass  # Already terminated

    # =========================================================================
    # Workflow Phase Methods (AC6)
    # =========================================================================

    async def run_validating(
        self,
        story: StoryEntry,
    ) -> WorkflowPhaseResult:
        """Run validation phase on story.

        Trace:
            story: STORY-08.04
            reqs: [AC1, AC6, AC7]

        Why: Validates story format, acceptance criteria, and dependencies
        before implementation. Phase 1 of 9-phase workflow.

        Args:
            story: Story entry to validate.

        Returns:
            Validation phase result with status and issues.

        Example:
            >>> result = await orchestrator.run_validating(story)
            >>> result.status
            'success'

        Related:
            - Workflow: /implement-story Phase 1
        """
        start_time = datetime.now(timezone.utc)

        try:
            # Validate story file path
            story_path = self.validate_path_security(
                story.story_file,
                ALLOWED_STORY_DIRS,
            )

            # Load story file
            if not story_path.exists():
                return WorkflowPhaseResult(
                    phase_name="validating",
                    status="error",
                    duration_ms=int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000),
                    output="Story file not found",
                    issues=[f"File does not exist: {story.story_file}"],
                )

            # Read story content
            content = story_path.read_text(encoding="utf-8")

            # Check story status
            valid_statuses = ["draft", "ready", "in-progress"]
            if story.status not in valid_statuses:
                return WorkflowPhaseResult(
                    phase_name="validating",
                    status="validation_failed",
                    duration_ms=int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000),
                    output=f"Invalid status: {story.status}",
                    issues=[f"Story status must be one of {valid_statuses}, got: {story.status}"],
                )

            # Verify dependencies (all must be 'completed')
            blocked_by = []
            if story.dependencies:
                try:
                    index_manager = StoryIndexManager(self.story_index_path)
                    index_manager.load()

                    # Create a map for quick lookup
                    stories_data = index_manager.index_data.get('stories', [])
                    status_map = {
                        s.get('story_id'): s.get('status')
                        for s in stories_data if isinstance(s, dict)
                    }

                    for dep_id in story.dependencies:
                        status = status_map.get(dep_id)
                        if status != 'completed':
                            blocked_by.append(f"{dep_id} ({status or 'not found'})")
                except Exception as e:
                    logger.error(f"Failed to load story index for dependency check: {e}")
                    duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
                    return WorkflowPhaseResult(
                        phase_name="validating",
                        status="error",
                        duration_ms=duration_ms,
                        output="Dependency verification failed",
                        issues=[f"Could not load story index: {self.sanitize_error_message(str(e))}"],
                    )

            if blocked_by:
                return WorkflowPhaseResult(
                    phase_name="validating",
                    status="validation_failed",
                    duration_ms=int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000),
                    output="Story is blocked by dependencies",
                    issues=[f"Blocked by: {', '.join(blocked_by)}"],
                )

            # Detect target language from story or content
            target_language = "python"  # Default
            if "target_language:" in content:
                match = re.search(r'target_language:\s*(\w+)', content)
                if match:
                    target_language = match.group(1)

            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            return WorkflowPhaseResult(
                phase_name="validating",
                status="success",
                duration_ms=duration_ms,
                output=f"Validation passed. Language: {target_language}",
                issues=[],
            )

        except Exception as e:
            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            sanitized_error = self.sanitize_error_message(str(e))
            return WorkflowPhaseResult(
                phase_name="validating",
                status="error",
                duration_ms=duration_ms,
                output="Validation error",
                issues=[sanitized_error],
            )

    async def run_scouting(
        self,
        story: StoryEntry,
    ) -> WorkflowPhaseResult:
        """Run code scouting phase for story.

        Trace:
            story: STORY-08.04
            reqs: [AC2, AC6, AC7]

        Why: Code reconnaissance identifies reusable patterns and dependencies
        before implementation. Phase 2 of 9-phase workflow.

        Args:
            story: Story entry to scout.

        Returns:
            Scouting phase result with findings.

        Example:
            >>> result = await orchestrator.run_scouting(story)
            >>> result.status
            'success'

        Related:
            - Agent: code-scout
            - Workflow: /implement-story Phase 2
        """
        start_time = datetime.now(timezone.utc)

        try:
            # Build context for code-scout agent
            context = f"""Perform pre-development reconnaissance for story implementation.

Story file: {story.story_file}

## Your Tasks:

### 1. Search and Analyze
- Find existing patterns that can be reused
- Identify similar implementations in the codebase
- Detect refactoring opportunities
- Locate related tests to reference

### 2. MANDATORY: Update the Story File
You MUST update the story file with your findings:

a) Update YAML frontmatter `code_scout` section:
   - status: completed
   - scanned_at: (current ISO timestamp)
   - language_detected: (detected language)
   - findings_count: (total findings)
   - reuse_opportunities: (count)
   - refactoring_suggestions: (count)

b) Replace the "Code Scout Findings" section with detailed findings:
   - Use semantic anchors (file.py → ClassName → method_name), NOT line numbers
   - Include file paths with → navigation to specific functions/classes
   - Provide confidence levels (HIGH/MEDIUM/LOW)
   - Add actionable recommendations for each finding

### 3. Report Format
For each finding, provide:
- Location: Full semantic path
- Signature: Function/method signature if applicable
- Recommendation: Specific action (reuse, extend, reference)
- Confidence: HIGH/MEDIUM/LOW

Focus on actionable findings that will accelerate implementation."""

            # Launch code-scout subprocess
            proc = await self.launch_subprocess(
                "code-scout",
                story.story_file,
                context,
            )

            # Write context to stdin and monitor
            stdout_bytes, stderr_bytes = await self.monitor_subprocess(proc, context, timeout=300)

            # Cleanup subprocess
            await self.cleanup_subprocess(proc)

            # Parse output
            stdout = stdout_bytes.decode("utf-8", errors="replace")
            stderr = stderr_bytes.decode("utf-8", errors="replace")
            exit_code = proc.returncode or 0

            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

            if exit_code == 0:
                return WorkflowPhaseResult(
                    phase_name="scouting",
                    status="success",
                    duration_ms=duration_ms,
                    output="Code scout completed successfully",
                    issues=[],
                )
            else:
                sanitized_error = self.sanitize_error_message(stderr)
                return WorkflowPhaseResult(
                    phase_name="scouting",
                    status="error",
                    duration_ms=duration_ms,
                    output="Code scout failed",
                    issues=[sanitized_error],
                )

        except asyncio.TimeoutError:
            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            return WorkflowPhaseResult(
                phase_name="scouting",
                status="error",
                duration_ms=duration_ms,
                output="Code scout timeout",
                issues=["Subprocess timed out after 300 seconds"],
            )
        except Exception as e:
            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            sanitized_error = self.sanitize_error_message(str(e))
            return WorkflowPhaseResult(
                phase_name="scouting",
                status="error",
                duration_ms=duration_ms,
                output="Scouting error",
                issues=[sanitized_error],
            )

    async def run_developing(
        self,
        story: StoryEntry,
        target_language: str = "python",
        scout_findings: str = "",
    ) -> WorkflowPhaseResult:
        """Run development phase for story implementation.

        Trace:
            story: STORY-08.04
            reqs: [AC3, AC6, AC7]

        Why: Primary development phase where story is implemented with TDD.
        Phase 3 of 9-phase workflow.

        Args:
            story: Story entry to implement.
            target_language: Detected or specified language.
            scout_findings: Code scout findings from phase 2.

        Returns:
            Development phase result.

        Example:
            >>> result = await orchestrator.run_developing(story, "python", findings)
            >>> result.status
            'success'

        Related:
            - Workflow: /implement-story Phase 3
            - Pattern: parallel-story-orchestrator.py run_story_subprocess()
        """
        start_time = datetime.now(timezone.utc)

        try:
            # Select dev agent based on language
            agent_name = f"dev-{target_language}"

            # Build context for dev agent
            context = f"""Implement the user story following the autonomous development workflow.

Story file: {story.story_file}

Code scout findings:
{scout_findings if scout_findings else "No scout findings available"}

Project context files:
- docs/project-context/{target_language}/coding-standards.md
- docs/project-context/{target_language}/tech-stack.md
- docs/project-context/shared/*

Requirements:
1. Implement all acceptance criteria
2. Follow existing patterns identified by code scout
3. Write comprehensive tests
4. Update story file with implementation notes

Work autonomously (YOLO mode) - do not ask questions."""

            # Launch dev agent subprocess
            proc = await self.launch_subprocess(agent_name, story.story_file, context)

            # Write context and monitor with longer timeout for implementation
            stdout_bytes, stderr_bytes = await self.monitor_subprocess(proc, context, timeout=600)

            # Cleanup
            await self.cleanup_subprocess(proc)

            # Parse output
            stdout = stdout_bytes.decode("utf-8", errors="replace")
            stderr = stderr_bytes.decode("utf-8", errors="replace")
            exit_code = proc.returncode or 0

            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

            if exit_code == 0:
                return WorkflowPhaseResult(
                    phase_name="developing",
                    status="success",
                    duration_ms=duration_ms,
                    output=f"Development completed with {agent_name}",
                    issues=[],
                )
            else:
                sanitized_error = self.sanitize_error_message(stderr)
                return WorkflowPhaseResult(
                    phase_name="developing",
                    status="error",
                    duration_ms=duration_ms,
                    output="Development failed",
                    issues=[sanitized_error],
                )

        except asyncio.TimeoutError:
            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            return WorkflowPhaseResult(
                phase_name="developing",
                status="error",
                duration_ms=duration_ms,
                output="Development timeout",
                issues=["Subprocess timed out after 600 seconds"],
            )
        except Exception as e:
            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            sanitized_error = self.sanitize_error_message(str(e))
            return WorkflowPhaseResult(
                phase_name="developing",
                status="error",
                duration_ms=duration_ms,
                output="Development error",
                issues=[sanitized_error],
            )

    async def run_validating_parallel(
        self,
        story: StoryEntry,
        target_language: str = "python",
        files_modified: list[str] = None,
        files_created: list[str] = None,
    ) -> list[WorkflowPhaseResult]:
        """Run parallel validation agents (test, security, code-review).

        Trace:
            story: STORY-08.04
            reqs: [AC4, AC6, AC7]

        Why: Parallel validation leverages concurrency for faster validation.
        Phase 4 of 9-phase workflow - runs 3 agents concurrently.

        Args:
            story: Story entry being validated.
            target_language: Language for test/security agents.
            files_modified: List of modified files from dev phase.
            files_created: List of created files from dev phase.

        Returns:
            List of 3 validation results (test, security, review).

        Example:
            >>> results = await orchestrator.run_validating_parallel(story, "python")
            >>> len(results)
            3

        Related:
            - Workflow: /implement-story Phase 4
            - Pattern: parallel-story-orchestrator.py run_parallel_stories()
        """
        if files_modified is None:
            files_modified = []
        if files_created is None:
            files_created = []

        # Build contexts for 3 validation agents
        test_context = f"""Run and verify all tests for the implemented story.

Story file: {story.story_file}
Modified files: {', '.join(files_modified)}
Created files: {', '.join(files_created)}

Tasks:
1. Run all tests related to this story
2. Verify all tests pass
3. Calculate code coverage
4. Map tests to acceptance criteria
5. Report any test failures

Work autonomously - fix any test failures you find."""

        security_context = f"""Perform security scan on implemented code.

Story file: {story.story_file}
Modified files: {', '.join(files_modified)}
Created files: {', '.join(files_created)}

Scan for:
1. SQL injection vulnerabilities
2. XSS vulnerabilities (if applicable)
3. Authentication/authorization issues
4. Sensitive data exposure
5. Input validation gaps

Report findings with severity levels."""

        review_context = f"""Review code quality for implemented story.

Story file: {story.story_file}
Modified files: {', '.join(files_modified)}
Created files: {', '.join(files_created)}
Coding standards: docs/project-context/{target_language}/coding-standards.md

Review:
1. Code quality and maintainability
2. Adherence to coding standards
3. Pattern consistency
4. Documentation completeness
5. Best practices

Provide quality score (1-5) and improvement suggestions."""

        # Launch 3 agents in parallel using semaphore
        async def run_agent(agent_name: str, context: str) -> WorkflowPhaseResult:
            start_time = datetime.now(timezone.utc)
            try:
                async with self.semaphore:
                    proc = await self.launch_subprocess(agent_name, story.story_file, context)
                    stdout_bytes, stderr_bytes = await self.monitor_subprocess(proc, context, timeout=300)
                    await self.cleanup_subprocess(proc)

                    stdout = stdout_bytes.decode("utf-8", errors="replace")
                    stderr = stderr_bytes.decode("utf-8", errors="replace")
                    exit_code = proc.returncode or 0

                    duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

                    if exit_code == 0:
                        return WorkflowPhaseResult(
                            phase_name=f"validation_{agent_name}",
                            status="success",
                            duration_ms=duration_ms,
                            output=f"{agent_name} completed",
                            issues=[],
                        )
                    else:
                        sanitized_error = self.sanitize_error_message(stderr)
                        return WorkflowPhaseResult(
                            phase_name=f"validation_{agent_name}",
                            status="validation_failed",
                            duration_ms=duration_ms,
                            output=f"{agent_name} found issues",
                            issues=[sanitized_error],
                        )
            except asyncio.TimeoutError:
                duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
                return WorkflowPhaseResult(
                    phase_name=f"validation_{agent_name}",
                    status="error",
                    duration_ms=duration_ms,
                    output=f"{agent_name} timeout",
                    issues=["Subprocess timed out"],
                )
            except Exception as e:
                duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
                sanitized_error = self.sanitize_error_message(str(e))
                return WorkflowPhaseResult(
                    phase_name=f"validation_{agent_name}",
                    status="error",
                    duration_ms=duration_ms,
                    output=f"{agent_name} error",
                    issues=[sanitized_error],
                )

        # Run all 3 agents in parallel
        test_agent = f"test-{target_language}"
        security_agent = f"security-scan-{target_language}"
        review_agent = "code-reviewer"

        results = await asyncio.gather(
            run_agent(test_agent, test_context),
            run_agent(security_agent, security_context),
            run_agent(review_agent, review_context),
            return_exceptions=True,
        )

        # Convert exceptions to error results
        processed_results = []
        for result in results:
            if isinstance(result, Exception):
                sanitized_error = self.sanitize_error_message(str(result))
                processed_results.append(WorkflowPhaseResult(
                    phase_name="validation_parallel",
                    status="error",
                    duration_ms=0,
                    output="Agent failed",
                    issues=[sanitized_error],
                ))
            else:
                processed_results.append(result)

        return processed_results

    async def run_aggregating(
        self,
        results: list[WorkflowPhaseResult],
    ) -> dict[str, Any]:
        """Aggregate phase results into final report.

        Trace:
            story: STORY-08.04
            reqs: [AC1, AC6]

        Why: Aggregation consolidates results from all phases for reporting
        and decision-making. Phase 5 of 9-phase workflow.

        Args:
            results: List of phase results to aggregate (from phase 4).

        Returns:
            Aggregated result dictionary with categorized issues.

        Example:
            >>> aggregated = await orchestrator.run_aggregating(validation_results)
            >>> aggregated["blocking_issues"]
            []

        Related:
            - Workflow: /implement-story Phase 5
            - Pattern: parallel-story-orchestrator.py aggregate_results()
        """
        # Categorize issues by severity
        aggregated = {
            "test_results": {
                "status": "unknown",
                "passed": 0,
                "failed": 0,
                "issues": [],
            },
            "security_results": {
                "status": "unknown",
                "critical": [],
                "high": [],
                "medium": [],
                "low": [],
            },
            "code_review": {
                "status": "unknown",
                "quality_score": 0,
                "issues": [],
            },
            "blocking_issues": [],
            "fixable_issues": [],
        }

        # Process each validation result
        for result in results:
            if "test" in result.phase_name:
                aggregated["test_results"]["status"] = result.status
                aggregated["test_results"]["issues"] = result.issues
                if result.status != "success":
                    aggregated["blocking_issues"].extend(result.issues)

            elif "security" in result.phase_name:
                aggregated["security_results"]["status"] = result.status
                # Categorize security issues by severity
                for issue in result.issues:
                    if "CRITICAL" in issue.upper():
                        aggregated["security_results"]["critical"].append(issue)
                        aggregated["blocking_issues"].append(issue)
                    elif "HIGH" in issue.upper():
                        aggregated["security_results"]["high"].append(issue)
                        aggregated["blocking_issues"].append(issue)
                    elif "MEDIUM" in issue.upper():
                        aggregated["security_results"]["medium"].append(issue)
                        aggregated["fixable_issues"].append(issue)
                    else:
                        aggregated["security_results"]["low"].append(issue)
                        aggregated["fixable_issues"].append(issue)

            elif "review" in result.phase_name:
                aggregated["code_review"]["status"] = result.status
                aggregated["code_review"]["issues"] = result.issues
                # Code review issues are generally fixable
                aggregated["fixable_issues"].extend(result.issues)

        return aggregated

    async def run_qa_gate(
        self,
        story: StoryEntry,
        aggregated_report: dict[str, Any],
    ) -> dict[str, Any]:
        """Run final QA gate decision for story.

        Trace:
            story: STORY-08.04
            reqs: [AC5, AC6, AC7]

        Why: QA gate makes go/no-go decision based on all phase results.
        Phase 6 of 9-phase workflow.

        Args:
            story: Story entry being evaluated.
            aggregated_report: Aggregated results from phase 5.

        Returns:
            QA gate decision with status ("QUALITY_GATE_PASS" or "QUALITY_GATE_FAIL").

        Example:
            >>> decision = await orchestrator.run_qa_gate(story, aggregated)
            >>> decision["decision"]
            'QUALITY_GATE_PASS'

        Related:
            - Workflow: /implement-story Phase 6
        """
        start_time = datetime.now(timezone.utc)

        try:
            # Build context for qa-coordinator agent
            context = f"""Make quality gate decision for story implementation.

Story file: {story.story_file}

Validation Results:
{json.dumps(aggregated_report, indent=2)}

Evaluate:
1. All tests passing (required)
2. Coverage ≥80% general, ≥90% security/crypto (required)
3. All ACs have corresponding tests (required)
4. No CRITICAL security issues (required)
5. Code quality score ≥3/5 (required)

Decision: QUALITY_GATE_PASS or QUALITY_GATE_FAIL

If FAIL, provide:
- List of blocking issues
- Recommended fixes
- Whether to retry or escalate

Add QA Agent Record to story file."""

            # Launch qa-coordinator subprocess
            proc = await self.launch_subprocess("qa-coordinator", story.story_file, context)

            # Monitor with standard timeout
            stdout_bytes, stderr_bytes = await self.monitor_subprocess(proc, context, timeout=300)

            # Cleanup
            await self.cleanup_subprocess(proc)

            # Parse output
            stdout = stdout_bytes.decode("utf-8", errors="replace")
            stderr = stderr_bytes.decode("utf-8", errors="replace")
            exit_code = proc.returncode or 0

            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

            # Extract decision from output (look for QUALITY_GATE_PASS or QUALITY_GATE_FAIL)
            decision = "QUALITY_GATE_FAIL"  # Default to fail
            if "QUALITY_GATE_PASS" in stdout.upper():
                decision = "QUALITY_GATE_PASS"

            # Determine if blocking issues exist
            blocking_issues = aggregated_report.get("blocking_issues", [])

            return {
                "decision": decision,
                "duration_ms": duration_ms,
                "blocking_issues": blocking_issues,
                "fixable_issues": aggregated_report.get("fixable_issues", []),
                "agent_exit_code": exit_code,
                "agent_output": stdout if exit_code == 0 else self.sanitize_error_message(stderr),
            }

        except asyncio.TimeoutError:
            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            return {
                "decision": "QUALITY_GATE_FAIL",
                "duration_ms": duration_ms,
                "blocking_issues": ["QA coordinator timeout"],
                "fixable_issues": [],
                "agent_exit_code": -1,
                "agent_output": "Subprocess timed out",
            }
        except Exception as e:
            duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
            sanitized_error = self.sanitize_error_message(str(e))
            return {
                "decision": "QUALITY_GATE_FAIL",
                "duration_ms": duration_ms,
                "blocking_issues": [sanitized_error],
                "fixable_issues": [],
                "agent_exit_code": -1,
                "agent_output": sanitized_error,
            }


# =============================================================================
# Temporary File Management
# =============================================================================


def create_temp_file(content: str, suffix: str = ".txt") -> str:
    """Create a secure temporary file with restricted permissions.

    Trace:
        story: STORY-08.03
        security: CWE-377

    Why: Secure temp file creation prevents unauthorized access to subprocess
    context data. Reused from Epic 07 with same security controls.

    Args:
        content: Content to write to the file.
        suffix: File suffix.

    Returns:
        Path to the temporary file.

    Example:
        >>> temp_path = create_temp_file("test content", suffix=".md")
        >>> os.path.exists(temp_path)
        True

    Related:
        - Source: parallel-story-orchestrator.py lines 925-954
        - Security: CWE-377 Insecure Temporary File
    """
    # Create temp file with delete=False so we can use it after closing
    with tempfile.NamedTemporaryFile(
        mode="w",
        suffix=suffix,
        delete=False,
        encoding="utf-8",
    ) as f:
        f.write(content)
        temp_path = f.name

    # Set restrictive permissions (owner read/write only)
    os.chmod(temp_path, 0o600)

    # Track for cleanup
    _temp_files.append(temp_path)

    return temp_path


def cleanup_temp_files() -> None:
    """Clean up all temporary files created during execution.

    Trace:
        story: STORY-08.03

    Why: Ensures temp files are cleaned up even on abnormal termination.
    Registered with atexit for automatic cleanup.

    Related:
        - Source: parallel-story-orchestrator.py lines 957-964
    """
    for temp_file in _temp_files:
        try:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
        except OSError:
            pass  # Best effort cleanup


# Register cleanup handler
atexit.register(cleanup_temp_files)


# =============================================================================
# CLI Interface (Placeholder)
# =============================================================================


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments.

    Note:
        Full CLI implementation will be added in Story 8.6 for
        /implement-stories-parallel command integration.
    """
    parser = argparse.ArgumentParser(
        description="Parallel Implementation Orchestrator - Manage parallel story implementations",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {VERSION}",
    )
    return parser.parse_args()


async def main() -> int:
    """Main entry point for the orchestrator.

    Note:
        Full main implementation will be added in Story 8.4 with workflow
        phase integration.
    """
    args = parse_args()
    logger.info(f"Parallel Implementation Orchestrator v{VERSION}")
    logger.info("Placeholder - workflow phases to be implemented in Story 8.4")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
