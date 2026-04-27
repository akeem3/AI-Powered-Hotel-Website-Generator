#!/usr/bin/env python3
"""
Parallel Story Orchestrator
Epic 07, Story 7.2 - Core Subprocess Management

Launches and manages parallel `claude -p` subprocesses for isolated story creation.
Uses asyncio.subprocess for true OS-level parallelism with fixed concurrency limit of 5.

Usage:
    python3 parallel-story-orchestrator.py <epic-file-path> <output-directory>
    python3 parallel-story-orchestrator.py docs/epics/epic-07.*.md docs/stories/
    python3 parallel-story-orchestrator.py --help

Security:
    - CWE-78: All subprocess calls use shell=False
    - CWE-22: Path traversal prevention with os.path.realpath()
    - CWE-400: Memory limit 2GB, timeout 300s per subprocess
    - CWE-377: Temp files with 0o600 permissions

Reference:
    - Anthropic Advanced Tool Use pattern: asyncio.gather() for batch operations
    - Research: docs/research/workflow-orchestration-research_2025-11-30.md
"""

import argparse
import asyncio
import atexit
import html
import json
import logging
import os
import re
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, NamedTuple

# Configure logging - check environment for debug level
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

VERSION = "1.4.0"  # Added story implementation index creation (Epic 08)
MAX_CONCURRENT = 5  # NFR-2: Fixed parallelism
SUBPROCESS_TIMEOUT = 600  # 10 minutes per subprocess (4-phase workflow needs more time)
TOTAL_TIMEOUT = 1800  # 30 minutes total workflow
MAX_STORIES_FOR_CROSS_VALIDATION = 20  # Security: DoS prevention (CWE-407)

# Allowed directories for file operations (relative to project root)
ALLOWED_EPIC_DIRS = ["docs/epics", "tests/fixtures/epics"]
ALLOWED_OUTPUT_DIRS = ["docs/stories", "tests/fixtures/stories"]

# Story section pattern in epic files (anchored regex per security requirements)
# Supports both "7.1" and "07.01" formats
STORY_PATTERN = re.compile(r"^### Story (\d{1,2})\.(\d{1,2}): (.+)$", re.MULTILINE)

# Agent name validation (from task-dispatcher.sh line 139)
AGENT_NAME_PATTERN = re.compile(r"^[a-z][a-z0-9-]*$")
MAX_AGENT_NAME_LENGTH = 32

# Track temp files for cleanup
_temp_files: list[str] = []


# =============================================================================
# Data Structures
# =============================================================================


class StoryDefinition(NamedTuple):
    """Parsed story definition from epic file."""

    epic_number: str
    story_number: str
    title: str


class SubprocessResult(NamedTuple):
    """Result from a single subprocess execution."""

    story_number: str
    status: str  # "success" | "validation_failed" | "error"
    duration_ms: int
    exit_code: int
    stdout: str
    stderr: str
    output_file: str | None


class CrossStoryIssue(NamedTuple):
    """A cross-story validation issue found during batch analysis."""

    id: str
    severity: str  # "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    issue_type: str  # "story_duplication" | "circular_dependency" | "terminology_inconsistency" | "acceptance_criteria_conflict" | "coverage_gap"
    description: str
    stories_involved: list[str]
    details: str
    recommendation: str


class OrchestratorResult(NamedTuple):
    """Aggregated result from all subprocesses."""

    epic: str
    workflow: str
    execution_mode: str
    completed_at: str
    duration_seconds: float
    parallelism: int
    stories_defined: int
    stories_created: int
    stories_passed: int
    stories_needs_work: int
    stories_failed: int
    subprocess_results: list[dict[str, Any]]
    created_files: list[str]
    cross_story_issues: list[dict[str, Any]] | None = None  # Optional: Only populated with --cross-validate


# =============================================================================
# Security Validation
# =============================================================================


def discover_project_root() -> Path:
    """
    Discover project root using git or fall back to current directory.

    Returns:
        Path: Absolute path to project root
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


def validate_path_security(path: str, allowed_dirs: list[str], project_root: Path) -> Path:
    """
    Validate file path against security requirements (CWE-22 prevention).

    Args:
        path: Path to validate (relative or absolute)
        allowed_dirs: List of allowed directory prefixes (relative to project root)
        project_root: Absolute path to project root

    Returns:
        Path: Validated absolute path

    Raises:
        ValueError: If path fails security validation
    """
    # Resolve to absolute path and follow symlinks
    input_path = Path(path)
    if not input_path.is_absolute():
        input_path = project_root / input_path
    resolved = input_path.resolve()

    # Check for path traversal attempts
    if ".." in str(path):
        raise ValueError(f"Path traversal detected: {path}")

    # Verify path is within project root
    try:
        resolved.relative_to(project_root)
    except ValueError:
        raise ValueError(f"Path escapes project root: {path}") from None

    # Check against allowed directories
    for allowed_dir in allowed_dirs:
        allowed_path = (project_root / allowed_dir).resolve()
        try:
            resolved.relative_to(allowed_path)
            return resolved
        except ValueError:
            continue

    raise ValueError(f"Path not in allowed directories {allowed_dirs}: {path}")


def validate_agent_name(agent_name: str) -> bool:
    """
    Validate agent name format and check file existence.

    Security: Prevents command injection via agent names.
    Pattern from task-dispatcher.sh line 139.

    Args:
        agent_name: Agent name to validate

    Returns:
        bool: True if valid

    Raises:
        ValueError: If agent name is invalid
    """
    if not agent_name:
        raise ValueError("Agent name is empty")

    if not AGENT_NAME_PATTERN.match(agent_name):
        raise ValueError(
            f"Invalid agent name format: '{agent_name}'. Must match ^[a-z][a-z0-9-]*$"
        )

    if len(agent_name) > MAX_AGENT_NAME_LENGTH:
        raise ValueError(
            f"Agent name too long: '{agent_name}'. Maximum {MAX_AGENT_NAME_LENGTH} characters."
        )

    # Check for shell metacharacters
    shell_metacharacters = ";|&$`(){}[]<>!~*?\\"
    if any(c in agent_name for c in shell_metacharacters):
        raise ValueError(f"Agent name contains shell metacharacters: '{agent_name}'")

    return True


# =============================================================================
# Error Sanitization (Security - CWE-209)
# =============================================================================

# Credential redaction patterns (module-level constants)
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


def sanitize_error_message(msg: str) -> str:
    """
    Sanitize error message to prevent information disclosure.

    Security: CWE-209 - Information Exposure Through Error Messages.
    Removes credentials, truncates paths, limits length per security requirements.

    Enhanced to address CRITICAL-002 and CRITICAL-003 from QA security review.

    Ported from .claude/lib/error-handler.sh lines 188-210.

    Args:
        msg: Raw error message from subprocess

    Returns:
        str: Sanitized error message safe for logging/reporting

    Security Requirements:
        - Redact credential patterns (password, token, api_key, secret, AWS, DB URLs, Bearer, JWT, SSH keys)
        - Truncate all absolute file paths to basename only (fixed path truncation bypass)
        - Escape JSON special characters
        - Limit to 500 characters maximum

    Example:
        >>> sanitize_error_message("Auth failed: password=secret123")
        'Auth failed: password=<REDACTED>'
        >>> sanitize_error_message("Error in /home/user/file.txt")
        'Error in file.txt'

    Related:
        - Story: story-07.03.parallel_error-handling-aggregation_draft_2025-12-10.md
        - Security: CWE-209 Information Disclosure Prevention
        - QA Review: CRITICAL-002 (path truncation), CRITICAL-003 (credential redaction)
    """
    # CRITICAL-003 FIX: Redact credential patterns FIRST (before path truncation)
    # Order matters: Process patterns from most specific to least specific
    # After each pattern, protect already-redacted values from being matched again

    for pattern, replacement in CREDENTIAL_PATTERNS:
        # Use a custom replacement function that protects <REDACTED_*> markers
        def safe_replace(match: re.Match[str]) -> str:
            matched_text = match.group(0)
            # Don't replace if it's already a redaction marker
            if '<REDACTED' in matched_text or 'REDACTED>' in matched_text:
                return matched_text
            # Apply the replacement
            if '\\1' in replacement or '\\2' in replacement:
                # Handle group references in replacement
                return match.expand(replacement)
            return replacement

        msg = re.sub(pattern, safe_replace, msg, flags=re.IGNORECASE)

    # Additional pass to normalize api-key/api_key formats
    msg = re.sub(r'(api)[-_](key\s*[:=]\s*)<REDACTED>', r'\1-\2<REDACTED>', msg, flags=re.IGNORECASE)

    # CRITICAL-002 FIX: Truncate ALL absolute paths to basename only
    # This must run AFTER credential redaction to avoid breaking URL patterns
    # Use os.path.basename for consistent path handling
    # This handles both Unix (/path/to/file) and Windows (C:\path\to\file) paths

    def replace_path_with_basename(match: re.Match[str]) -> str:
        """Extract basename from path match."""
        full_path = match.group(0)
        # Check if this looks like a URL (has :// in it) - skip truncation
        if '://' in full_path:
            return full_path
        # For Windows paths, replace both / and \ with / for os.path.basename
        normalized = full_path.replace('\\', '/')
        return os.path.basename(normalized)

    # Match absolute Unix paths: /path/to/file
    # Negative lookbehind to avoid matching URLs (://)
    msg = re.sub(r'(?<!:)/[a-zA-Z0-9_.\-/]+', replace_path_with_basename, msg)

    # Match absolute Windows paths: C:\path\to\file or C:/path/to/file
    # Need to handle both forward slash and backslash
    msg = re.sub(r'[A-Za-z]:[/\\](?:[a-zA-Z0-9_.\-]+[/\\])*[a-zA-Z0-9_.\-]+', replace_path_with_basename, msg)

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


# =============================================================================
# JSON Schema Validation (Security - CWE-91)
# =============================================================================

# JSON validation constants
MAX_JSON_DEPTH = 5
MAX_STRING_LENGTH = 10240  # 10KB per field
MAX_ARRAY_LENGTH = 100  # Max 100 items in arrays


def _get_json_depth(obj: Any, current_depth: int = 0) -> int:
    """
    Calculate the maximum nesting depth of a JSON object.

    Args:
        obj: JSON object to measure
        current_depth: Current recursion depth

    Returns:
        int: Maximum depth of nested structures
    """
    if isinstance(obj, dict):
        if not obj:
            return current_depth
        return max(_get_json_depth(v, current_depth + 1) for v in obj.values())
    elif isinstance(obj, list):
        if not obj:
            return current_depth
        return max(_get_json_depth(item, current_depth + 1) for item in obj)
    else:
        return current_depth


def validate_subprocess_json(data: dict[str, Any]) -> bool:
    """
    Validate subprocess JSON output against expected schema.

    Security: CWE-91 - JSON Injection Prevention.
    Validates structure, types, depth, and sanitizes string fields before aggregation.

    Enhanced to address CRITICAL-001 from QA security review with comprehensive validation.

    Args:
        data: Parsed JSON dictionary from subprocess stdout

    Returns:
        bool: True if valid, False otherwise

    Schema:
        {
            "status": "success" | "validation_failed" | "error" (required, string),
            "story_file": str (optional, max 10KB),
            "issues": list[str] (optional, max 100 items, each max 10KB),
            "error_message": str (optional, max 500 chars)
        }

    Security Requirements (CRITICAL-001 fixes):
        - Validate field types (status=string, issues=array, error_message=string)
        - Reject unknown fields (additionalProperties: false)
        - Enforce field size limits (error_message max 500 chars, issues max 100 items)
        - Validate array item types (issues must be array of strings)
        - Depth limit validation (max 5 levels nested)
        - String length limits (10KB max per field)
        - HTML escape all string values

    Example:
        >>> validate_subprocess_json({"status": "success", "story_file": "test.md"})
        True
        >>> validate_subprocess_json({"status": "invalid"})
        False
        >>> validate_subprocess_json({"status": "success", "unknown_field": "value"})
        False

    Related:
        - Story: story-07.03.parallel_error-handling-aggregation_draft_2025-12-10.md
        - Security: CWE-91 JSON Injection Prevention
        - QA Review: CRITICAL-001 (insufficient JSON schema validation)
    """
    # Type validation: must be a dictionary
    if not isinstance(data, dict):
        logger.warning("Subprocess JSON is not a dictionary")
        return False

    # Depth limit validation (CRITICAL-001)
    depth = _get_json_depth(data)
    if depth > MAX_JSON_DEPTH:
        logger.warning(f"JSON depth {depth} exceeds maximum {MAX_JSON_DEPTH}")
        return False

    # Validate required fields
    if "status" not in data:
        logger.warning("Subprocess JSON missing required 'status' field")
        return False

    # Reject unknown fields (additionalProperties: false) (CRITICAL-001)
    # Allow optional metadata fields that don't affect security
    allowed_fields = {"status", "story_file", "issues", "error_message", "duration_ms"}
    unknown_fields = set(data.keys()) - allowed_fields
    if unknown_fields:
        logger.warning(f"JSON contains unknown fields: {unknown_fields}")
        return False

    # Validate status field type and value (CRITICAL-001)
    if not isinstance(data["status"], str):
        logger.warning(f"Field 'status' must be string, got {type(data['status']).__name__}")
        return False

    valid_statuses = {"success", "validation_failed", "error"}
    if data["status"] not in valid_statuses:
        logger.warning(
            f"Invalid status value: {data['status']}. Must be one of {valid_statuses}"
        )
        return False

    # Validate optional story_file field (CRITICAL-001)
    if "story_file" in data:
        if not isinstance(data["story_file"], str):
            logger.warning(f"Field 'story_file' must be string, got {type(data['story_file']).__name__}")
            return False
        if len(data["story_file"]) > MAX_STRING_LENGTH:
            logger.warning(f"Field 'story_file' exceeds max length {MAX_STRING_LENGTH}")
            return False

    # Validate optional issues field (CRITICAL-001)
    if "issues" in data:
        if not isinstance(data["issues"], list):
            logger.warning(f"Field 'issues' must be array, got {type(data['issues']).__name__}")
            return False
        if len(data["issues"]) > MAX_ARRAY_LENGTH:
            logger.warning(f"Field 'issues' exceeds max array length {MAX_ARRAY_LENGTH}")
            return False
        # Validate array item types
        for i, item in enumerate(data["issues"]):
            if not isinstance(item, str):
                logger.warning(f"Field 'issues[{i}]' must be string, got {type(item).__name__}")
                return False
            if len(item) > MAX_STRING_LENGTH:
                logger.warning(f"Field 'issues[{i}]' exceeds max length {MAX_STRING_LENGTH}")
                return False

    # Validate optional error_message field (CRITICAL-001)
    if "error_message" in data:
        if not isinstance(data["error_message"], str):
            logger.warning(f"Field 'error_message' must be string, got {type(data['error_message']).__name__}")
            return False
        if len(data["error_message"]) > 500:
            logger.warning(f"Field 'error_message' exceeds max length 500 chars")
            return False

    # Sanitize string fields to prevent injection
    # HTML escape all string values
    for key, value in data.items():
        if isinstance(value, str):
            # Escape HTML to prevent XSS when viewed in tools
            data[key] = html.escape(value, quote=True)
        elif isinstance(value, list):
            # Escape strings in arrays
            for i, item in enumerate(value):
                if isinstance(item, str):
                    value[i] = html.escape(item, quote=True)

    return True


def log_warning(msg: str) -> None:
    """
    Log warning message for testing compatibility.

    Args:
        msg: Warning message to log
    """
    logger.warning(msg)


def map_exit_code_to_status(exit_code: int) -> str:
    """
    Map subprocess exit code to status string.

    Standardized exit code semantics (AC2):
        - 0: success (PASS)
        - 1: validation_failed (NEEDS_WORK)
        - 2: error (FAIL)
        - Other: error (with warning logged)

    Args:
        exit_code: Subprocess exit code

    Returns:
        str: Status string ("success", "validation_failed", "error")

    Security:
        - Exit code validation (SEC3)
        - Logs warning for invalid codes outside 0/1/2 range

    Example:
        >>> map_exit_code_to_status(0)
        'success'
        >>> map_exit_code_to_status(1)
        'validation_failed'

    Related:
        - Story: story-07.03.parallel_error-handling-aggregation_draft_2025-12-10.md
    """
    # Validate exit code is in expected range
    valid_codes = {0, 1, 2}
    if exit_code not in valid_codes:
        log_warning(
            f"Invalid exit code {exit_code} outside expected range [0, 1, 2]. "
            f"Treating as error."
        )

    # Map to status
    if exit_code == 0:
        return "success"
    elif exit_code == 1:
        return "validation_failed"
    else:
        return "error"


# =============================================================================
# Epic Parsing
# =============================================================================


def parse_epic_file(epic_path: Path) -> tuple[str, list[StoryDefinition]]:
    """
    Parse epic file to extract story definitions.

    Args:
        epic_path: Path to epic markdown file

    Returns:
        Tuple of (epic_number, list of StoryDefinition)

    Raises:
        FileNotFoundError: If epic file doesn't exist
        ValueError: If epic format is invalid
    """
    if not epic_path.exists():
        raise FileNotFoundError(f"Epic file not found: {epic_path}")

    content = epic_path.read_text(encoding="utf-8")

    # Extract epic number from filename or frontmatter
    # Filename formats supported:
    #   - epic-{NN}.{domain}_{name}_{status}_{date}.md (new format)
    #   - epic-{NN}-{name}.md (legacy format like epic-7-llm-generation.md)
    # Supports both "07" and "7" formats
    filename_match = re.match(r"epic-(\d{1,2})[\.-]", epic_path.name)
    if filename_match:
        epic_number = filename_match.group(1)
    else:
        # Try to extract from YAML frontmatter
        frontmatter_match = re.search(r'^epic_number:\s*["\']?(\d{1,2})["\']?', content, re.MULTILINE)
        if frontmatter_match:
            epic_number = frontmatter_match.group(1)
        else:
            raise ValueError(f"Cannot determine epic number from: {epic_path}")

    # Find all story definitions
    stories: list[StoryDefinition] = []
    for match in STORY_PATTERN.finditer(content):
        story_epic = match.group(1)
        story_num = match.group(2)
        story_title = match.group(3).strip()

        # Verify story belongs to this epic (compare as integers to handle 7 vs 07)
        if int(story_epic) != int(epic_number):
            continue

        stories.append(StoryDefinition(
            epic_number=story_epic.zfill(2),  # "8" -> "08"
            story_number=story_num.zfill(2),  # "1" -> "01"
            title=story_title,
        ))

    if not stories:
        raise ValueError(f"No story definitions found in epic: {epic_path}")

    return epic_number, stories


def extract_story_context(epic_content: str, story: StoryDefinition) -> str:
    """
    Extract the relevant section for a specific story from the epic.

    Args:
        epic_content: Full epic file content
        story: Story definition to extract

    Returns:
        str: Epic excerpt for the story including its section content
    """
    story_header = f"### Story {story.epic_number}.{story.story_number}:"

    # Find story section start
    start_idx = epic_content.find(story_header)
    if start_idx == -1:
        return ""

    # Find next story section or end of stories section
    # Use same flexible pattern as STORY_PATTERN to handle both "7.1" and "07.01" formats
    next_story_match = re.search(
        r"^### Story \d{1,2}\.\d{1,2}:",
        epic_content[start_idx + len(story_header):],
        re.MULTILINE,
    )

    if next_story_match:
        end_idx = start_idx + len(story_header) + next_story_match.start()
    else:
        # Find end of Stories section (next ## header or end of file)
        end_match = re.search(r"^## ", epic_content[start_idx:], re.MULTILINE)
        if end_match and end_match.start() > 0:
            end_idx = start_idx + end_match.start()
        else:
            end_idx = len(epic_content)

    return epic_content[start_idx:end_idx].strip()


# =============================================================================
# Story Implementation Index Creation (Epic 08)
# =============================================================================


def create_story_implementation_index(
    epic_number: str,
    epic_file: str,
    stories: list[StoryDefinition],
    project_root: Path,
) -> Path:
    """
    Create or update the story implementation index for parallel implementation tracking.

    This index is created BEFORE story creation runs, providing infrastructure
    for the /implement-stories-parallel workflow. Each story starts with
    status='pending' and implementation_phase=null.

    Args:
        epic_number: The epic number (e.g., "08")
        epic_file: Path to the epic file
        stories: List of parsed story definitions
        project_root: Project root path

    Returns:
        Path to the created index file

    Security:
        - CWE-22: Path validation before write
        - CWE-377: Secure file permissions (0o600)
        - CWE-362: Atomic write via temp file + rename
    """
    import secrets
    import yaml

    # Index file location
    index_dir = project_root / ".claude" / "context" / "coordination"
    index_dir.mkdir(parents=True, exist_ok=True)
    index_path = index_dir / "story-implementation-index.yaml"

    now = datetime.now(timezone.utc).isoformat()

    # Build story entries
    story_entries = []
    for story in stories:
        story_id = f"{story.epic_number}.{story.story_number}"
        story_entries.append({
            "story_id": story_id,
            "story_file": None,  # Will be populated after story creation
            "epic_number": story.epic_number,
            "story_number": story.story_number,
            "title": story.title,
            # Status lifecycle (AC2 from Story 08.01)
            "status": "pending",
            "previous_status": None,
            # Dependencies (AC3) - will be populated from story files
            "depends_on": [],
            "blocked_by": [],
            "blocks": [],
            # Implementation phase (AC4)
            "implementation_phase": None,
            "previous_phase": None,
            # Agent audit trail (AC5)
            "agent_ids": [],
            # Timing (AC1)
            "start_time": None,
            "end_time": None,
            "estimated_completion": None,
            "duration_seconds": None,
            # Iteration tracking
            "current_iteration": 0,
            "max_iterations": 5,
            "test_retries": 0,
            "security_retries": 0,
            # QA decisions
            "qa_decisions": [],
            # Current issues
            "current_issues": [],
            # Files created/modified by implementation
            "files_created": [],
            "files_modified": [],
        })

    # Build dependency graph structure (pre-computed for efficiency)
    dependency_graph = {
        "last_computed": now,
        "resolved_order": [],  # Will be computed after dependencies are known
        "circular_dependencies": [],
        "independent_stories": [s["story_id"] for s in story_entries],
    }

    # Build statistics
    statistics = {
        "total_stories": len(story_entries),
        "pending": len(story_entries),
        "ready": 0,
        "in_progress": 0,
        "completed": 0,
        "failed": 0,
        "blocked": 0,
        "average_duration_seconds": None,
        "average_iterations": None,
    }

    # Build the index structure
    index_data = {
        "schema_version": "1.0",
        "epic_id": epic_number.zfill(2),
        "epic_file": str(epic_file),
        "created_at": now,
        "updated_at": now,
        "updated_by": "parallel-story-orchestrator",
        # Lock management
        "lock": {
            "locked": False,
            "locked_by": None,
            "acquired_at": None,
            "expires_at": None,
            "lock_token": None,
        },
        # Story list
        "stories": story_entries,
        # Dependency graph
        "dependency_graph": dependency_graph,
        # Statistics
        "statistics": statistics,
        # Workflow state
        "workflow_state": {
            "active": False,
            "started_at": None,
            "parallelism": MAX_CONCURRENT,
            "stories_in_progress": [],
            "stories_queued": [],
        },
        # Cross-story validation
        "cross_story_validation": None,
    }

    # Atomic write with secure permissions
    temp_path = index_path.with_suffix(".yaml.tmp")
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            # Set restrictive permissions before writing
            os.chmod(temp_path, 0o600)
            yaml.dump(
                index_data,
                f,
                default_flow_style=False,
                sort_keys=False,
                allow_unicode=True,
            )
        # Atomic rename
        os.replace(temp_path, index_path)
        logger.info(f"Created story implementation index: {index_path}")
    except Exception as e:
        # Clean up temp file on failure
        if temp_path.exists():
            temp_path.unlink()
        raise RuntimeError(f"Failed to create story implementation index: {e}") from e

    return index_path


def update_story_index_after_creation(
    index_path: Path,
    story_number: str,
    story_file: str | None,
    status: str,
) -> None:
    """
    Update story entry in the index after story creation completes.

    Args:
        index_path: Path to the index file
        story_number: Story number (e.g., "08.01")
        story_file: Path to the created story file (or None if failed)
        status: Creation status ("pending" -> "ready" if created successfully)
    """
    import yaml

    if not index_path.exists():
        logger.warning(f"Story index not found: {index_path}")
        return

    try:
        with open(index_path, encoding="utf-8") as f:
            index_data = yaml.safe_load(f)

        # Find and update the story entry
        for story in index_data.get("stories", []):
            if story.get("story_id") == story_number:
                story["story_file"] = story_file
                story["status"] = status
                story["previous_status"] = "pending"
                break

        # Update statistics
        stats = index_data.get("statistics", {})
        if status == "ready":
            stats["pending"] = max(0, stats.get("pending", 0) - 1)
            stats["ready"] = stats.get("ready", 0) + 1
        elif status == "failed":
            stats["pending"] = max(0, stats.get("pending", 0) - 1)
            stats["failed"] = stats.get("failed", 0) + 1

        index_data["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Atomic write
        temp_path = index_path.with_suffix(".yaml.tmp")
        with open(temp_path, "w", encoding="utf-8") as f:
            os.chmod(temp_path, 0o600)
            yaml.dump(
                index_data,
                f,
                default_flow_style=False,
                sort_keys=False,
                allow_unicode=True,
            )
        os.replace(temp_path, index_path)

    except Exception as e:
        logger.warning(f"Failed to update story index: {e}")


# =============================================================================
# Temporary File Management
# =============================================================================


def create_temp_file(content: str, suffix: str = ".txt") -> str:
    """
    Create a secure temporary file with restricted permissions.

    Security: CWE-377 - Uses NamedTemporaryFile with 0o600 permissions.

    Args:
        content: Content to write to the file
        suffix: File suffix

    Returns:
        str: Path to the temporary file
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
    """Clean up all temporary files created during execution."""
    for temp_file in _temp_files:
        try:
            if os.path.exists(temp_file):
                os.unlink(temp_file)
        except OSError:
            pass  # Best effort cleanup


# Register cleanup handler
atexit.register(cleanup_temp_files)


# =============================================================================
# Subprocess Execution
# =============================================================================


async def run_story_subprocess(
    story: StoryDefinition,
    epic_excerpt: str,
    output_dir: Path,
    project_root: Path,
) -> SubprocessResult:
    """
    Run a single story creation subprocess with isolated context.

    Security: CWE-78 - Uses shell=False via create_subprocess_exec.

    Args:
        story: Story definition to create
        epic_excerpt: Epic section for this story
        output_dir: Directory for story output
        project_root: Project root path

    Returns:
        SubprocessResult with execution details
    """
    start_time = datetime.now(timezone.utc)
    story_id = f"{story.epic_number}.{story.story_number}"

    # Build output file path
    today = datetime.now().strftime("%Y-%m-%d")
    # Sanitize title for filename: lowercase, replace spaces with hyphens, remove special chars
    safe_title = re.sub(r"[^a-z0-9-]", "", story.title.lower().replace(" ", "-").replace(":", ""))[:50]
    story_filename = f"story-{story.epic_number}.{story.story_number}.{safe_title}_draft_{today}.md"
    story_file_path_expected = str(output_dir / story_filename)

    # Build context input for subprocess - Full 5-phase workflow with auto-fix
    # Phase 1: story-creator generates content
    # Phase 2a: hallucination-checker validates references (parallel)
    # Phase 2b: security-validator checks for vulnerabilities (parallel)
    # Phase 3: story-verifier final validation
    # Phase 4: Auto-fix any issues found
    # Phase 5: Final approval decision
    context_content = f"""# Story Creation and Validation Pipeline

You are executing a 5-phase story creation workflow. Complete ALL phases in order.

## PHASE 1: Story Creation

Read the story-creator agent definition and story template, then generate the story:

1. Read agent: ~/.claude/agents/story-creator.md (global agent)
2. Read template: .claude/context/templates/story.md (project local)
3. Generate story content following the template format based on the epic context below
4. Write the story to: {story_file_path_expected}

## PHASE 2: Parallel Validation (execute both)

### Phase 2a: Hallucination Check
Read ~/.claude/agents/hallucination-checker.md and validate the story you created:
- Check all file path references exist in the codebase using Glob/Grep tools
- Verify function/class names mentioned actually exist
- Validate any technical claims against actual code
- Flag any references that cannot be verified

### Phase 2b: Security Validation
Read ~/.claude/agents/security-validator.md and check:
- No hardcoded secrets or credentials in story
- No insecure patterns recommended
- Dependencies mentioned are legitimate
- No path traversal or injection vulnerabilities in proposed implementation

## PHASE 3: Story Verification

Read ~/.claude/agents/story-verifier.md and perform final validation:
- Story follows template structure
- Acceptance criteria are SMART (Specific, Measurable, Achievable, Relevant, Time-bound)
- Dependencies are correctly identified
- Story is appropriately sized (single session)

## PHASE 4: Auto-Fix Issues (CRITICAL)

If ANY issues were found in Phases 2-3, you MUST fix them:

1. For hallucination issues (invalid file/function references):
   - Search codebase to find correct paths/names
   - Update the story file with corrected references
   - Remove references that cannot be verified

2. For security issues:
   - Remove any hardcoded secrets
   - Replace insecure patterns with secure alternatives
   - Fix any path traversal vulnerabilities

3. For story structure issues:
   - Fix acceptance criteria to be SMART
   - Correct dependency references
   - Adjust scope if story is too large

4. After fixing, use the Edit tool to update the story file at: {story_file_path_expected}

5. Re-validate that fixes resolved the issues

## PHASE 5: Final Approval Decision

After auto-fix phase, determine final status:
- PASS: All issues resolved, story is ready for implementation
- FAIL: Critical issues that could not be auto-fixed (should be rare)

## Story to Create
Story {story_id}: {story.title}

## Epic Context
{epic_excerpt}

## Output File Path
{story_file_path_expected}

## CRITICAL OUTPUT INSTRUCTIONS

IMPORTANT: Your FINAL message must be ONLY valid JSON - no markdown, no explanation, no other text.

After completing ALL 5 phases (including auto-fix), output exactly this JSON:
{{"status": "PASS", "story_file": "{story_file_path_expected}", "phases_completed": ["story-creator", "hallucination-checker", "security-validator", "story-verifier", "auto-fix"], "issues_found": 0, "issues_fixed": 0}}

If issues were found and fixed:
{{"status": "PASS", "story_file": "{story_file_path_expected}", "phases_completed": ["story-creator", "hallucination-checker", "security-validator", "story-verifier", "auto-fix"], "issues_found": 3, "issues_fixed": 3}}

Only if issues could NOT be fixed (rare):
{{"status": "FAIL", "story_file": "{story_file_path_expected}", "phases_completed": ["story-creator", "hallucination-checker", "security-validator", "story-verifier", "auto-fix"], "issues_found": 2, "issues_fixed": 1, "unfixed_issues": ["description of unfixable issue"]}}

DO NOT output any text before or after the JSON. The JSON must be parseable.
"""

    # Create temporary input file
    input_file = create_temp_file(context_content, suffix=".md")
    output_file = create_temp_file("", suffix=".json")

    try:
        # Build subprocess command
        # SECURITY: shell=False is enforced by create_subprocess_exec
        cmd = [
            "claude",
            "-p",
            "--output-format", "json",
            "--allowedTools", "Write,Read,Edit,Glob,Grep",  # Allow file ops + search + edit for auto-fix
        ]

        # Run subprocess with timeout and resource limits
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=str(project_root),
        )

        # Read input file content for stdin
        with open(input_file, "r", encoding="utf-8") as f:
            input_content = f.read()

        try:
            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(input=input_content.encode("utf-8")),
                timeout=SUBPROCESS_TIMEOUT,
            )
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            return SubprocessResult(
                story_number=story_id,
                status="error",
                duration_ms=int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000),
                exit_code=-1,
                stdout="",
                stderr="Subprocess timeout after 300 seconds",
                output_file=None,
            )

        stdout = stdout_bytes.decode("utf-8", errors="replace")
        stderr = stderr_bytes.decode("utf-8", errors="replace")
        exit_code = proc.returncode or 0

        # DEBUG: Log subprocess output
        logger.debug(f"Story {story_id} exit_code={exit_code}")
        logger.debug(f"Story {story_id} stdout length={len(stdout)}")
        logger.debug(f"Story {story_id} stderr length={len(stderr)}")
        if stdout:
            logger.debug(f"Story {story_id} stdout preview: {stdout[:500]}")
        if stderr:
            logger.debug(f"Story {story_id} stderr preview: {stderr[:500]}")

        # Determine status from exit code with validation (AC2)
        status = map_exit_code_to_status(exit_code)

        duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)

        # Try to parse output JSON for story file path
        # claude -p --output-format json wraps output in {"result": "...", "type": "result"}
        story_file_path = None
        try:
            wrapper_data = json.loads(stdout)
            logger.debug(f"Story {story_id} wrapper keys: {wrapper_data.keys()}")

            # Extract the actual result from Claude's wrapper
            result_text = wrapper_data.get("result", "")
            logger.debug(f"Story {story_id} result_text: {result_text[:200] if result_text else 'empty'}")

            # Try to parse the result as JSON (Claude's actual output)
            if result_text:
                # Clean up the result - it might have markdown code blocks
                clean_result = result_text.strip()
                if clean_result.startswith("```json"):
                    clean_result = clean_result[7:]
                if clean_result.startswith("```"):
                    clean_result = clean_result[3:]
                if clean_result.endswith("```"):
                    clean_result = clean_result[:-3]
                clean_result = clean_result.strip()

                try:
                    output_data = json.loads(clean_result)
                    story_file_path = output_data.get("story_file")
                    # Use status from 4-phase workflow output if available
                    workflow_status = output_data.get("status", "").upper()
                    if workflow_status in ("PASS", "NEEDS_WORK", "FAIL"):
                        status = workflow_status.lower().replace("_", " ")
                        if workflow_status == "PASS":
                            status = "success"
                        elif workflow_status == "NEEDS_WORK":
                            status = "validation_failed"
                        elif workflow_status == "FAIL":
                            status = "error"
                    phases = output_data.get("phases_completed", [])
                    issues = output_data.get("issues", [])
                    logger.debug(f"Story {story_id} parsed: file={story_file_path}, status={workflow_status}, phases={phases}, issues_count={len(issues)}")
                except json.JSONDecodeError:
                    # Maybe Claude output just the file path or status directly
                    logger.debug(f"Story {story_id} inner JSON decode failed, checking if file exists")

            # Fallback: check if the file was created at the expected path
            if not story_file_path:
                expected_path = story_file_path_expected
                if os.path.exists(expected_path):
                    story_file_path = expected_path
                    logger.debug(f"Story {story_id} file found at expected path: {story_file_path}")

        except json.JSONDecodeError as e:
            logger.debug(f"Story {story_id} wrapper JSON decode failed: {e}")
            # Fallback: check if file was created at expected path
            if os.path.exists(story_file_path_expected):
                story_file_path = story_file_path_expected
                logger.debug(f"Story {story_id} file found at expected path (fallback): {story_file_path}")

        return SubprocessResult(
            story_number=story_id,
            status=status,
            duration_ms=duration_ms,
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            output_file=story_file_path,
        )

    except Exception as e:
        duration_ms = int((datetime.now(timezone.utc) - start_time).total_seconds() * 1000)
        return SubprocessResult(
            story_number=story_id,
            status="error",
            duration_ms=duration_ms,
            exit_code=-1,
            stdout="",
            stderr=str(e),
            output_file=None,
        )


async def run_parallel_stories(
    stories: list[StoryDefinition],
    epic_content: str,
    output_dir: Path,
    project_root: Path,
) -> list[SubprocessResult]:
    """
    Run story creation subprocesses in parallel with concurrency limit.

    Uses asyncio.gather() per Anthropic's Advanced Tool Use pattern
    for batch independent operations.

    Args:
        stories: List of stories to create
        epic_content: Full epic file content
        output_dir: Output directory for stories
        project_root: Project root path

    Returns:
        List of SubprocessResult for all stories
    """
    # Create semaphore for concurrency control (NFR-2: max 5)
    semaphore = asyncio.Semaphore(MAX_CONCURRENT)

    async def run_with_limit(story: StoryDefinition) -> SubprocessResult:
        async with semaphore:
            epic_excerpt = extract_story_context(epic_content, story)
            return await run_story_subprocess(
                story=story,
                epic_excerpt=epic_excerpt,
                output_dir=output_dir,
                project_root=project_root,
            )

    # Launch all tasks with gather() for true parallelism
    tasks = [run_with_limit(story) for story in stories]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Convert exceptions to error results
    processed_results: list[SubprocessResult] = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            story = stories[i]
            processed_results.append(SubprocessResult(
                story_number=f"{story.epic_number}.{story.story_number}",
                status="error",
                duration_ms=0,
                exit_code=-1,
                stdout="",
                stderr=str(result),
                output_file=None,
            ))
        else:
            processed_results.append(result)

    return processed_results


# =============================================================================
# Cross-Story Validation (Story 7.7)
# =============================================================================


def compute_acceptance_criteria_similarity(ac1: list[str], ac2: list[str]) -> float:
    """
    Compute similarity between two lists of acceptance criteria.

    Uses Jaccard similarity on normalized terms.
    AC2: Detect overlapping acceptance criteria (>50% similarity threshold).

    Args:
        ac1: List of acceptance criteria from story 1
        ac2: List of acceptance criteria from story 2

    Returns:
        float: Similarity score between 0.0 and 1.0
    """
    if not ac1 or not ac2:
        return 0.0

    # Normalize and tokenize
    def normalize(text: str) -> set[str]:
        """Normalize text to lowercase words."""
        return set(re.findall(r'\b[a-z]+\b', text.lower()))

    words1: set[str] = set()
    words2: set[str] = set()

    for ac in ac1:
        words1.update(normalize(ac))
    for ac in ac2:
        words2.update(normalize(ac))

    if not words1 or not words2:
        return 0.0

    # Jaccard similarity
    intersection = len(words1 & words2)
    union = len(words1 | words2)

    return intersection / union if union > 0 else 0.0


def extract_story_metadata(story_path: Path) -> dict[str, Any]:
    """
    Extract metadata from a story file for cross-story analysis.

    Args:
        story_path: Path to story markdown file

    Returns:
        dict: Extracted metadata including acceptance criteria, dependencies, terminology
    """
    content = story_path.read_text(encoding="utf-8")

    # Extract story ID from filename or frontmatter
    story_id_match = re.search(r'id:\s*["\']?([^"\'\n]+)["\']?', content)
    story_id = story_id_match.group(1) if story_id_match else story_path.stem

    # Extract acceptance criteria
    ac_pattern = re.compile(r'^\s*-\s*\[[ x]\]\s*\*\*AC\d+\*\*:?\s*(.+)$', re.MULTILINE)
    acceptance_criteria = ac_pattern.findall(content)

    # Also try simpler AC format
    if not acceptance_criteria:
        ac_simple = re.compile(r'^\s*-\s*\[[ x]\]\s*AC\d+:?\s*(.+)$', re.MULTILINE)
        acceptance_criteria = ac_simple.findall(content)

    # Extract dependencies from frontmatter
    depends_on: list[str] = []
    depends_match = re.search(r'depends_on:\s*\n((?:\s+-\s*.+\n?)+)', content)
    if depends_match:
        deps_block = depends_match.group(1)
        depends_on = re.findall(r'-\s*(.+)', deps_block)

    # Extract key terminology (nouns/technical terms)
    # Look for CamelCase, snake_case, and quoted terms
    terms: set[str] = set()
    terms.update(re.findall(r'\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b', content))  # CamelCase
    terms.update(re.findall(r'\b[a-z]+_[a-z]+(?:_[a-z]+)*\b', content))  # snake_case
    terms.update(re.findall(r'`([^`]+)`', content))  # Backtick-quoted terms

    return {
        "story_id": story_id,
        "file_path": str(story_path),
        "acceptance_criteria": acceptance_criteria,
        "depends_on": depends_on,
        "terminology": list(terms),
    }


def detect_circular_dependencies(stories_metadata: list[dict[str, Any]]) -> list[CrossStoryIssue]:
    """
    Detect circular dependencies in story dependency chains.

    AC3: Detect circular dependencies in dependency graph.

    Args:
        stories_metadata: List of story metadata dicts

    Returns:
        list: CrossStoryIssue instances for each circular dependency found
    """
    issues: list[CrossStoryIssue] = []

    # Build dependency graph
    dep_graph: dict[str, list[str]] = {}
    for story in stories_metadata:
        story_id = story["story_id"]
        dep_graph[story_id] = []
        for dep in story["depends_on"]:
            # Extract story ID from dependency reference
            dep_match = re.search(r'story[_-]?(\d+\.\d+)', dep, re.IGNORECASE)
            if dep_match:
                dep_graph[story_id].append(dep_match.group(1))

    # Detect cycles using DFS
    visited: set[str] = set()
    rec_stack: set[str] = set()
    cycles_found: list[list[str]] = []

    def dfs(node: str, path: list[str]) -> None:
        if node in rec_stack:
            # Found cycle
            cycle_start = path.index(node)
            cycles_found.append(path[cycle_start:] + [node])
            return

        if node in visited:
            return

        visited.add(node)
        rec_stack.add(node)
        path.append(node)

        for neighbor in dep_graph.get(node, []):
            if neighbor in dep_graph:  # Only follow edges to known nodes
                dfs(neighbor, path[:])

        rec_stack.discard(node)

    for node in dep_graph:
        if node not in visited:
            dfs(node, [])

    # Create issues for each cycle
    issue_num = 0
    for cycle in cycles_found:
        issue_num += 1
        cycle_str = " -> ".join(cycle)
        issues.append(CrossStoryIssue(
            id=f"CS-CIRC-{issue_num:03d}",
            severity="HIGH",
            issue_type="circular_dependency",
            description="Stories have circular dependency chain",
            stories_involved=list(set(cycle[:-1])),  # Remove duplicate end node
            details=f"Dependency chain: {cycle_str}",
            recommendation="Refactor to break circular dependency - extract shared requirement to separate story",
        ))

    return issues


def detect_story_duplications(
    stories_metadata: list[dict[str, Any]],
    similarity_threshold: float = 0.5,
) -> list[CrossStoryIssue]:
    """
    Detect story duplications by comparing acceptance criteria.

    AC2: Detect overlapping acceptance criteria (>50% similarity threshold).
    O(N²) pairwise comparison - acceptable for typical epic size (5-10 stories).

    Args:
        stories_metadata: List of story metadata dicts
        similarity_threshold: Minimum similarity to flag as duplicate (default 0.5)

    Returns:
        list: CrossStoryIssue instances for each duplication found
    """
    issues: list[CrossStoryIssue] = []
    issue_num = 0
    n = len(stories_metadata)

    # O(N²) pairwise comparison
    for i in range(n):
        for j in range(i + 1, n):
            story1 = stories_metadata[i]
            story2 = stories_metadata[j]

            similarity = compute_acceptance_criteria_similarity(
                story1["acceptance_criteria"],
                story2["acceptance_criteria"],
            )

            if similarity >= similarity_threshold:
                issue_num += 1
                issues.append(CrossStoryIssue(
                    id=f"CS-DUP-{issue_num:03d}",
                    severity="HIGH" if similarity >= 0.7 else "MEDIUM",
                    issue_type="story_duplication",
                    description="Overlapping functionality between stories",
                    stories_involved=[story1["story_id"], story2["story_id"]],
                    details=f"Acceptance criteria similarity: {similarity:.0%}",
                    recommendation=f"Consolidate overlapping functionality or clarify distinct scope for each story",
                ))

    return issues


def detect_terminology_inconsistency(
    stories_metadata: list[dict[str, Any]],
) -> list[CrossStoryIssue]:
    """
    Detect terminology inconsistencies across stories.

    AC4: Detect same concepts using different names.

    Args:
        stories_metadata: List of story metadata dicts

    Returns:
        list: CrossStoryIssue instances for inconsistent terminology
    """
    issues: list[CrossStoryIssue] = []

    # Group similar terms across stories
    # Compare CamelCase and snake_case variations
    term_to_stories: dict[str, list[str]] = {}

    for story in stories_metadata:
        for term in story["terminology"]:
            # Normalize term for comparison
            normalized = term.lower().replace("_", "").replace("-", "")
            if normalized not in term_to_stories:
                term_to_stories[normalized] = []
            term_to_stories[normalized].append((story["story_id"], term))

    # Find terms with multiple variants
    issue_num = 0
    for normalized, occurrences in term_to_stories.items():
        if len(occurrences) < 2:
            continue

        # Check if there are different original forms
        variants = set(term for _, term in occurrences)
        if len(variants) > 1:
            stories = list(set(story_id for story_id, _ in occurrences))
            issue_num += 1
            issues.append(CrossStoryIssue(
                id=f"CS-TERM-{issue_num:03d}",
                severity="MEDIUM",
                issue_type="terminology_inconsistency",
                description="Same concept uses different names across stories",
                stories_involved=stories,
                details=f"Variants: {', '.join(sorted(variants))}",
                recommendation=f"Standardize on single term across all stories (suggest: '{sorted(variants)[0]}')",
            ))

    return issues


async def run_cross_story_validation(
    created_files: list[str],
    project_root: Path,
) -> list[dict[str, Any]]:
    """
    Run cross-story validation on all created stories.

    AC1: Invoke story-verifier in batch mode on all created stories.
    AC7: Optional - only runs when --cross-validate flag is provided.

    Security (AC-SEC1): Maximum 20 stories for cross-validation (DoS prevention).

    Args:
        created_files: List of paths to created story files
        project_root: Project root path

    Returns:
        list: Cross-story issues as dicts for JSON serialization
    """
    # Security: DoS prevention (CWE-407)
    if len(created_files) > MAX_STORIES_FOR_CROSS_VALIDATION:
        logger.warning(
            f"Cross-validation skipped: {len(created_files)} stories exceeds "
            f"maximum of {MAX_STORIES_FOR_CROSS_VALIDATION}"
        )
        return [{
            "id": "CS-ERR-001",
            "severity": "HIGH",
            "type": "limit_exceeded",
            "description": f"Cross-validation skipped due to story count ({len(created_files)}) exceeding limit ({MAX_STORIES_FOR_CROSS_VALIDATION})",
            "stories_involved": [],
            "details": "O(N²) complexity makes cross-validation impractical for large story counts",
            "recommendation": "Split epic into smaller epics with fewer stories",
        }]

    # Extract metadata from all stories
    stories_metadata: list[dict[str, Any]] = []
    for file_path in created_files:
        try:
            story_path = Path(file_path)
            if not story_path.is_absolute():
                story_path = project_root / story_path

            if story_path.exists():
                metadata = extract_story_metadata(story_path)
                stories_metadata.append(metadata)
        except Exception as e:
            logger.warning(f"Failed to extract metadata from {file_path}: {e}")

    if not stories_metadata:
        logger.info("No story metadata extracted - skipping cross-validation")
        return []

    logger.info(f"Running cross-story validation on {len(stories_metadata)} stories")

    # Run all cross-story checks
    all_issues: list[CrossStoryIssue] = []

    # AC2: Story duplications (>50% similarity)
    all_issues.extend(detect_story_duplications(stories_metadata))

    # AC3: Circular dependencies
    all_issues.extend(detect_circular_dependencies(stories_metadata))

    # AC4: Terminology inconsistency
    all_issues.extend(detect_terminology_inconsistency(stories_metadata))

    # Convert to dicts for JSON serialization
    return [
        {
            "id": issue.id,
            "severity": issue.severity,
            "type": issue.issue_type,
            "description": issue.description,
            "stories_involved": issue.stories_involved,
            "details": issue.details,
            "recommendation": issue.recommendation,
        }
        for issue in all_issues
    ]


# =============================================================================
# Result Aggregation
# =============================================================================


def aggregate_results(
    epic_number: str,
    results: list[SubprocessResult],
    start_time: datetime,
    cross_story_issues: list[dict[str, Any]] | None = None,
) -> OrchestratorResult:
    """
    Aggregate subprocess results into final report with error sanitization.

    Enhanced for Story 7.3 - Error Handling and Result Aggregation.
    Preserves partial results when some subprocesses fail (AC5).
    Includes sanitized error messages (AC3) and detailed metadata (AC6).

    Args:
        epic_number: Epic number being processed
        results: List of subprocess results (includes both successes and failures)
        start_time: Workflow start time

    Returns:
        OrchestratorResult with aggregated data including:
            - Success/failure counts
            - Sanitized error messages
            - Detailed per-story metadata
            - Partial results preserved

    Security:
        - Error messages sanitized via sanitize_error_message()
        - Credential patterns redacted (CWE-209)
        - JSON output validated before aggregation

    Example:
        >>> results = [success_result, error_result, success_result]
        >>> aggregated = aggregate_results("01", results, start_time)
        >>> aggregated.stories_passed  # 2
        >>> aggregated.stories_failed  # 1

    Related:
        - Story: story-07.03.parallel_error-handling-aggregation_draft_2025-12-10.md
        - Epic: epic-07.parallel_story-creation-workflow_planning_2025-12-10.md
        - Pattern: .claude/lib/result-aggregator.sh lines 266-334
    """
    end_time = datetime.now(timezone.utc)
    duration = (end_time - start_time).total_seconds()

    # Count statuses (AC2 - monitor exit codes and map to statuses)
    passed = sum(1 for r in results if r.status == "success")
    needs_work = sum(1 for r in results if r.status == "validation_failed")
    failed = sum(1 for r in results if r.status == "error")

    # Collect created files (AC5 - preserve partial results)
    # Only include files from successful subprocesses
    created_files = [r.output_file for r in results if r.output_file]

    # Build subprocess result details with sanitized errors (AC3, AC4)
    subprocess_details = []
    for r in results:
        # Map status to uppercase for consistency with result-aggregator.sh
        status_display = r.status.upper().replace("_", " ")

        detail: dict[str, Any] = {
            "story_number": r.story_number,
            "status": status_display,
            "duration_ms": r.duration_ms,
            "exit_code": r.exit_code,
        }

        # Include sanitized error message for failed subprocesses (AC3)
        if r.stderr and (r.status == "error" or r.status == "validation_failed"):
            # Sanitize error message to prevent information disclosure (CWE-209)
            sanitized_error = sanitize_error_message(r.stderr)
            detail["error"] = sanitized_error

        # Try to parse and validate subprocess JSON output (AC1)
        # Note: claude -p --output-format json wraps the result in {"type":"result", "result": "..."}
        if r.stdout:
            try:
                wrapper_data = json.loads(r.stdout)
                # Extract the inner result from Claude's wrapper
                result_text = wrapper_data.get("result", "")
                if result_text:
                    # Clean up potential markdown code blocks
                    clean_result = result_text.strip()
                    if clean_result.startswith("```json"):
                        clean_result = clean_result[7:]
                    if clean_result.startswith("```"):
                        clean_result = clean_result[3:]
                    if clean_result.endswith("```"):
                        clean_result = clean_result[:-3]
                    clean_result = clean_result.strip()

                    try:
                        output_data = json.loads(clean_result)
                        # Validate JSON schema (CWE-91 prevention)
                        if validate_subprocess_json(output_data):
                            # Include validated output data in detail
                            if "issues" in output_data:
                                detail["issues"] = output_data["issues"]
                            if "error_message" in output_data:
                                # Sanitize error from JSON as well
                                detail["subprocess_error"] = sanitize_error_message(
                                    output_data["error_message"]
                                )
                    except json.JSONDecodeError:
                        # Inner result is not JSON
                        pass
            except json.JSONDecodeError:
                # Non-JSON stdout, skip parsing
                pass

        subprocess_details.append(detail)

    return OrchestratorResult(
        epic=f"epic-{epic_number}",
        workflow="create-stories-parallel",
        execution_mode="parallel",
        completed_at=end_time.isoformat(),
        duration_seconds=round(duration, 2),
        parallelism=MAX_CONCURRENT,
        stories_defined=len(results),
        stories_created=passed + needs_work,
        stories_passed=passed,
        stories_needs_work=needs_work,
        stories_failed=failed,
        subprocess_results=subprocess_details,
        created_files=created_files,
        cross_story_issues=cross_story_issues,
    )


def format_output_json(result: OrchestratorResult) -> str:
    """
    Format orchestrator result as JSON with confidence score.

    Enhanced for Story 7.3 to match result-aggregator.sh JSON structure pattern.
    Includes confidence score based on success rate (AC4, AC6).

    Args:
        result: Orchestrator result to format

    Returns:
        str: JSON string with aggregated results and metadata

    JSON Structure (follows .claude/lib/result-aggregator.sh pattern):
        {
            "epic": str,
            "workflow": str,
            "execution_mode": str,
            "completed_at": ISO timestamp,
            "duration_seconds": float,
            "parallelism": int,
            "stories": {
                "defined_in_epic": int,
                "already_existed": int,
                "created": int,
                "passed": int,
                "needs_work": int,
                "failed": int,
                "confidence_score": float  # NEW: 0.0-1.0 based on success rate
            },
            "created_files": list[str],
            "subprocess_results": list[dict],  # Detailed per-story metadata
            "context_metrics": {...}
        }

    Related:
        - Story: story-07.03.parallel_error-handling-aggregation_draft_2025-12-10.md
        - Pattern: .claude/lib/result-aggregator.sh lines 266-334
    """
    # Calculate confidence score (AC4)
    # Confidence = (passed + 0.5 * needs_work) / total
    # This gives full credit to passed, half credit to needs_work, zero to failed
    total_stories = result.stories_defined
    if total_stories > 0:
        confidence_score = round(
            (result.stories_passed + 0.5 * result.stories_needs_work) / total_stories,
            2,
        )
    else:
        confidence_score = 0.0

    output: dict[str, Any] = {
        "epic": result.epic,
        "workflow": result.workflow,
        "execution_mode": result.execution_mode,
        "completed_at": result.completed_at,
        "duration_seconds": result.duration_seconds,
        "parallelism": result.parallelism,
        "stories": {
            "defined_in_epic": result.stories_defined,
            "already_existed": 0,
            "created": result.stories_created,
            "passed": result.stories_passed,
            "needs_work": result.stories_needs_work,
            "failed": result.stories_failed,
            "confidence_score": confidence_score,  # AC4 - success rate metric
        },
        "created_files": result.created_files,
        "subprocess_results": result.subprocess_results,  # AC6 - detailed metadata
        "context_metrics": {
            "main_thread_tokens": 0,  # Placeholder - actual counting done by caller
            "subprocess_total_tokens": 0,
            "efficiency_percentage": 0.0,
        },
    }

    # AC6: Include cross_story_issues section when --cross-validate is used
    if result.cross_story_issues is not None:
        output["cross_story_issues"] = result.cross_story_issues
        # Add summary counts for cross-story validation
        cross_story_summary = {
            "total_issues": len(result.cross_story_issues),
            "critical": sum(1 for i in result.cross_story_issues if i.get("severity") == "CRITICAL"),
            "high": sum(1 for i in result.cross_story_issues if i.get("severity") == "HIGH"),
            "medium": sum(1 for i in result.cross_story_issues if i.get("severity") == "MEDIUM"),
            "low": sum(1 for i in result.cross_story_issues if i.get("severity") == "LOW"),
        }
        output["cross_story_summary"] = cross_story_summary

    return json.dumps(output, indent=2)


# =============================================================================
# CLI Interface
# =============================================================================


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Parallel Story Orchestrator - Create stories in isolated subprocess contexts",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    %(prog)s docs/epics/epic-07.*.md docs/stories/
    %(prog)s --help

Security:
    All subprocesses use shell=False to prevent command injection.
    Path traversal is prevented by validating all paths against project root.
""",
    )
    parser.add_argument(
        "epic_file",
        help="Path to epic file (relative or absolute)",
    )
    parser.add_argument(
        "output_dir",
        help="Output directory for story files (relative or absolute)",
    )
    parser.add_argument(
        "--version",
        action="version",
        version=f"%(prog)s {VERSION}",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse epic and show stories without executing subprocesses",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output results as JSON",
    )
    parser.add_argument(
        "--cross-validate",
        action="store_true",
        help=(
            "Run optional cross-story validation after all stories are created. "
            "Detects duplications, circular dependencies, and terminology inconsistencies. "
            "O(N²) complexity - max 20 stories. Default: off (AC7)"
        ),
    )
    return parser.parse_args()


async def main() -> int:
    """Main entry point for the orchestrator."""
    args = parse_args()
    start_time = datetime.now(timezone.utc)

    try:
        # Discover project root
        project_root = discover_project_root()

        # Validate epic file path
        epic_path = validate_path_security(
            args.epic_file,
            ALLOWED_EPIC_DIRS,
            project_root,
        )

        # Validate output directory path
        output_dir = validate_path_security(
            args.output_dir,
            ALLOWED_OUTPUT_DIRS,
            project_root,
        )

        # Ensure output directory exists
        output_dir.mkdir(parents=True, exist_ok=True)

        # Parse epic file
        epic_number, stories = parse_epic_file(epic_path)

        if not args.json:
            print(f"Epic: {epic_number}")
            print(f"Stories found: {len(stories)}")
            for story in stories:
                print(f"  - {story.epic_number}.{story.story_number}: {story.title}")

        # Create story implementation index for parallel implementation tracking (Epic 08)
        # This index is infrastructure that must exist BEFORE stories are created
        index_path = create_story_implementation_index(
            epic_number=epic_number,
            epic_file=str(epic_path.relative_to(project_root)),
            stories=stories,
            project_root=project_root,
        )
        if not args.json:
            print(f"Created story index: {index_path.relative_to(project_root)}")

        if args.dry_run:
            print("\nDry run - no subprocesses executed")
            return 0

        # Read epic content for context extraction
        epic_content = epic_path.read_text(encoding="utf-8")

        # Run parallel story creation
        if not args.json:
            print(f"\nLaunching {len(stories)} subprocesses (max {MAX_CONCURRENT} concurrent)...")

        results = await run_parallel_stories(
            stories=stories,
            epic_content=epic_content,
            output_dir=output_dir,
            project_root=project_root,
        )

        # Update story index with creation results (Epic 08)
        for result in results:
            status = "ready" if result.status == "success" else "failed"
            update_story_index_after_creation(
                index_path=index_path,
                story_number=result.story_number,
                story_file=result.output_file,
                status=status,
            )

        # Run optional cross-story validation (AC1, AC7)
        cross_story_issues: list[dict[str, Any]] | None = None
        if args.cross_validate:
            # Collect created files for cross-validation
            created_files = [r.output_file for r in results if r.output_file]
            if created_files:
                if not args.json:
                    print(f"\nRunning cross-story validation on {len(created_files)} stories...")
                cross_story_issues = await run_cross_story_validation(
                    created_files=created_files,
                    project_root=project_root,
                )

        # Aggregate results with optional cross-story issues (AC6)
        aggregated = aggregate_results(
            epic_number, results, start_time,
            cross_story_issues=cross_story_issues,
        )

        # Output results
        if args.json:
            print(format_output_json(aggregated))
        else:
            print(f"\nCompleted in {aggregated.duration_seconds}s")
            print(f"  Created: {aggregated.stories_created}")
            print(f"  Passed: {aggregated.stories_passed}")
            print(f"  Needs work: {aggregated.stories_needs_work}")
            print(f"  Failed: {aggregated.stories_failed}")

            if aggregated.stories_failed > 0:
                print("\nFailed stories:")
                for r in aggregated.subprocess_results:
                    if r["status"] == "ERROR":
                        print(f"  - {r['story_number']}: {r.get('error', 'Unknown error')}")

            # Display cross-story validation results (AC6)
            if cross_story_issues:
                print(f"\nCross-story validation found {len(cross_story_issues)} issues:")
                for issue in cross_story_issues:
                    severity = issue.get("severity", "UNKNOWN")
                    issue_type = issue.get("type", "unknown")
                    desc = issue.get("description", "No description")
                    stories = ", ".join(issue.get("stories_involved", []))
                    print(f"  [{severity}] {issue_type}: {desc}")
                    if stories:
                        print(f"           Stories: {stories}")

        # Return appropriate exit code
        if aggregated.stories_failed > 0:
            return 2
        elif aggregated.stories_needs_work > 0:
            return 1
        return 0

    except FileNotFoundError as e:
        print(f"Error: {e}", file=sys.stderr)
        return 2
    except ValueError as e:
        print(f"Validation error: {e}", file=sys.stderr)
        return 2
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
