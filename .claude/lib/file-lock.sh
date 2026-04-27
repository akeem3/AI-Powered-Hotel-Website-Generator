#!/usr/bin/env bash
#
# File Lock Library
# Epic 04, Story 4.5 - Exclusive Write Pattern with Lock Mechanism
#
# Coordinates exclusive write access to shared state files using file-based locks.
# Prevents concurrent agents from corrupting coordination files like task-queue.yaml.
#
# Usage:
#   source .claude/lib/file-lock.sh
#   lock_token=$(acquire_lock "task-queue.yaml" "story-creator")
#   # ... modify file ...
#   release_lock "task-queue.yaml" "$lock_token"
#
# Or CLI:
#   ./file-lock.sh --acquire task-queue.yaml story-creator
#   ./file-lock.sh --check task-queue.yaml
#   ./file-lock.sh --release task-queue.yaml <token>
#

set -eo pipefail

# ============================================================================
# Configuration
# ============================================================================

readonly FL_VERSION="1.0.0"
readonly FL_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Lock configuration
readonly FL_LOCK_TTL_SECONDS=300  # 5 minutes
readonly FL_TOKEN_BYTES=16       # 128 bits of entropy

# Global state
FL_ERROR_MSG=""
FL_PROJECT_ROOT=""

# ============================================================================
# Logging
# ============================================================================

fl_log() {
    local level="$1"
    shift
    local msg="$*"
    local log_level="${CLAUDE_LOG_LEVEL:-INFO}"

    case "$level" in
        DEBUG)
            [[ "$log_level" == "DEBUG" ]] && echo "[DEBUG] $msg" >&2
            ;;
        INFO)
            [[ "$log_level" =~ ^(DEBUG|INFO)$ ]] && echo "[INFO] $msg" >&2
            ;;
        WARNING)
            [[ "$log_level" =~ ^(DEBUG|INFO|WARNING)$ ]] && echo "[WARNING] $msg" >&2
            ;;
        ERROR)
            echo "[ERROR] $msg" >&2
            ;;
    esac
}

# ============================================================================
# Project Root Discovery
# ============================================================================

fl_get_project_root() {
    if [[ -n "$FL_PROJECT_ROOT" ]]; then
        echo "$FL_PROJECT_ROOT"
        return 0
    fi

    if [[ -n "${CLAUDE_PROJECT_ROOT:-}" ]]; then
        FL_PROJECT_ROOT="$CLAUDE_PROJECT_ROOT"
        echo "$FL_PROJECT_ROOT"
        return 0
    fi

    local git_root
    git_root=$(git rev-parse --show-toplevel 2>/dev/null) || true

    if [[ -n "$git_root" ]]; then
        FL_PROJECT_ROOT="$git_root"
    else
        FL_PROJECT_ROOT="$(pwd)"
    fi

    echo "$FL_PROJECT_ROOT"
}

# ============================================================================
# Cryptographically Secure Token Generation
# ============================================================================

# Generate a cryptographically secure lock token
# Uses /dev/urandom or falls back to openssl
generate_lock_token() {
    local token=""

    # Try /dev/urandom first (most portable on Linux/macOS)
    if [[ -r /dev/urandom ]]; then
        token=$(head -c "$FL_TOKEN_BYTES" /dev/urandom | xxd -p | tr -d '\n')
    # Fall back to openssl
    elif command -v openssl &>/dev/null; then
        token=$(openssl rand -hex "$FL_TOKEN_BYTES")
    # Fall back to Python if available
    elif command -v python3 &>/dev/null; then
        token=$(python3 -c "import secrets; print(secrets.token_hex($FL_TOKEN_BYTES))")
    else
        FL_ERROR_MSG="No secure random source available"
        return 1
    fi

    if [[ -z "$token" ]] || [[ ${#token} -lt $((FL_TOKEN_BYTES * 2)) ]]; then
        FL_ERROR_MSG="Failed to generate secure token"
        return 1
    fi

    echo "$token"
}

# ============================================================================
# Lock File Operations
# ============================================================================

# Get the lock file path for a target file
get_lock_file_path() {
    local target_file="$1"
    local project_root
    project_root=$(fl_get_project_root)

    # Lock file is stored alongside the target with .lock extension
    echo "${project_root}/${target_file}.lock"
}

# Read lock status from lock file
# Returns JSON with lock info or empty if no lock
read_lock_status() {
    local target_file="$1"
    local lock_file
    lock_file=$(get_lock_file_path "$target_file")

    if [[ ! -f "$lock_file" ]]; then
        echo '{"locked": false}'
        return 0
    fi

    cat "$lock_file"
}

# Write lock status to lock file
write_lock_status() {
    local target_file="$1"
    local lock_json="$2"
    local lock_file
    lock_file=$(get_lock_file_path "$target_file")

    # Ensure directory exists
    mkdir -p "$(dirname "$lock_file")"

    echo "$lock_json" > "$lock_file"
}

# ============================================================================
# Lock Expiration
# ============================================================================

# Get current timestamp in ISO format
get_timestamp() {
    date -Iseconds
}

# Get timestamp N seconds from now (for expiration)
get_expiration_timestamp() {
    local seconds="${1:-$FL_LOCK_TTL_SECONDS}"
    date -d "+${seconds} seconds" -Iseconds 2>/dev/null || \
    date -v "+${seconds}S" -Iseconds 2>/dev/null || \
    echo "$(date -Iseconds)"  # Fallback
}

# Check if timestamp is expired
is_timestamp_expired() {
    local expiration="$1"

    if [[ -z "$expiration" ]]; then
        return 0  # No expiration = expired
    fi

    local current_epoch
    local expire_epoch

    # Convert to epoch for comparison
    current_epoch=$(date +%s)
    expire_epoch=$(date -d "$expiration" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%S" "$expiration" +%s 2>/dev/null || echo "0")

    if [[ $current_epoch -ge $expire_epoch ]]; then
        return 0  # Expired
    fi

    return 1  # Not expired
}

# ============================================================================
# Lock Acquisition
# ============================================================================

# Acquire exclusive lock on a file
# Returns lock token on success, empty on failure
acquire_lock() {
    local target_file="$1"
    local agent_name="$2"
    local wait_timeout="${3:-0}"  # Seconds to wait (0 = don't wait)

    FL_ERROR_MSG=""

    # Validate inputs
    if [[ -z "$target_file" ]] || [[ -z "$agent_name" ]]; then
        FL_ERROR_MSG="Target file and agent name required"
        return 1
    fi

    local lock_file
    lock_file=$(get_lock_file_path "$target_file")

    # Check current lock status
    local current_lock
    current_lock=$(read_lock_status "$target_file")

    local is_locked
    is_locked=$(echo "$current_lock" | grep -o '"locked"[[:space:]]*:[[:space:]]*true' | head -1)

    if [[ -n "$is_locked" ]]; then
        # Lock exists - check if expired
        local expires_at
        expires_at=$(echo "$current_lock" | grep -o '"expires_at"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        local locked_by
        locked_by=$(echo "$current_lock" | grep -o '"locked_by"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

        if is_timestamp_expired "$expires_at"; then
            # Lock expired - can reclaim
            fl_log WARNING "Reclaiming expired lock on '$target_file' (was held by '$locked_by')"

            # Log to memory-bank.md
            log_to_memory_bank "Lock expired: '$target_file' held by '$locked_by' reclaimed by '$agent_name'"
        else
            # Lock still valid
            FL_ERROR_MSG="Lock held by '$locked_by' until '$expires_at'"
            fl_log DEBUG "Lock acquisition failed: $FL_ERROR_MSG"
            return 1
        fi
    fi

    # Generate secure token
    local lock_token
    lock_token=$(generate_lock_token)
    if [[ -z "$lock_token" ]]; then
        FL_ERROR_MSG="Failed to generate lock token"
        return 1
    fi

    # Create lock record
    local acquired_at
    acquired_at=$(get_timestamp)
    local expires_at
    expires_at=$(get_expiration_timestamp "$FL_LOCK_TTL_SECONDS")

    local lock_json
    lock_json=$(cat << EOF
{
  "locked": true,
  "lock_token": "$lock_token",
  "locked_by": "$agent_name",
  "acquired_at": "$acquired_at",
  "expires_at": "$expires_at",
  "target_file": "$target_file"
}
EOF
)

    # Write lock file (atomic on most filesystems)
    write_lock_status "$target_file" "$lock_json"

    # Verify lock was acquired (read back and check token)
    local verify_lock
    verify_lock=$(read_lock_status "$target_file")
    local verify_token
    verify_token=$(echo "$verify_lock" | grep -o '"lock_token"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

    if [[ "$verify_token" != "$lock_token" ]]; then
        FL_ERROR_MSG="Lock acquisition race - another agent acquired first"
        return 1
    fi

    fl_log INFO "Lock acquired on '$target_file' by '$agent_name' (expires: $expires_at)"
    echo "$lock_token"
}

# ============================================================================
# Lock Release
# ============================================================================

# Release lock on a file
# Verifies token before releasing to prevent unauthorized release
release_lock() {
    local target_file="$1"
    local expected_token="$2"

    FL_ERROR_MSG=""

    if [[ -z "$target_file" ]] || [[ -z "$expected_token" ]]; then
        FL_ERROR_MSG="Target file and lock token required"
        return 1
    fi

    local lock_file
    lock_file=$(get_lock_file_path "$target_file")

    # Read current lock status
    local current_lock
    current_lock=$(read_lock_status "$target_file")

    # Verify token matches
    local current_token
    current_token=$(echo "$current_lock" | grep -o '"lock_token"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

    if [[ "$current_token" != "$expected_token" ]]; then
        FL_ERROR_MSG="Lock token mismatch - cannot release lock you don't hold"
        fl_log WARNING "Unauthorized lock release attempt on '$target_file'"
        return 1
    fi

    # Clear lock by writing unlocked state
    local unlock_json='{"locked": false}'
    write_lock_status "$target_file" "$unlock_json"

    fl_log INFO "Lock released on '$target_file'"
    return 0
}

# ============================================================================
# Lock Verification
# ============================================================================

# Check if we still hold the lock (for validation before write)
verify_lock() {
    local target_file="$1"
    local expected_token="$2"

    FL_ERROR_MSG=""

    if [[ -z "$target_file" ]] || [[ -z "$expected_token" ]]; then
        FL_ERROR_MSG="Target file and lock token required"
        return 1
    fi

    local current_lock
    current_lock=$(read_lock_status "$target_file")

    # Check if locked
    local is_locked
    is_locked=$(echo "$current_lock" | grep -o '"locked"[[:space:]]*:[[:space:]]*true' | head -1)

    if [[ -z "$is_locked" ]]; then
        FL_ERROR_MSG="Lock not held - file is unlocked"
        return 1
    fi

    # Verify token matches
    local current_token
    current_token=$(echo "$current_lock" | grep -o '"lock_token"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

    if [[ "$current_token" != "$expected_token" ]]; then
        FL_ERROR_MSG="Lock token mismatch - lock was stolen"
        return 1
    fi

    # Check not expired
    local expires_at
    expires_at=$(echo "$current_lock" | grep -o '"expires_at"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

    if is_timestamp_expired "$expires_at"; then
        FL_ERROR_MSG="Lock expired"
        return 1
    fi

    fl_log DEBUG "Lock verified for '$target_file'"
    return 0
}

# ============================================================================
# Lock Status
# ============================================================================

# Get human-readable lock status
get_lock_status() {
    local target_file="$1"

    local lock_status
    lock_status=$(read_lock_status "$target_file")

    local is_locked
    is_locked=$(echo "$lock_status" | grep -o '"locked"[[:space:]]*:[[:space:]]*true' | head -1)

    if [[ -z "$is_locked" ]]; then
        echo "unlocked"
        return 0
    fi

    local locked_by
    locked_by=$(echo "$lock_status" | grep -o '"locked_by"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
    local expires_at
    expires_at=$(echo "$lock_status" | grep -o '"expires_at"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

    if is_timestamp_expired "$expires_at"; then
        echo "expired (was: $locked_by)"
    else
        echo "locked by $locked_by until $expires_at"
    fi
}

# ============================================================================
# Memory Bank Logging (Append-Only)
# ============================================================================

# Append to memory bank (no lock required - append-only is safe)
log_to_memory_bank() {
    local message="$1"
    local project_root
    project_root=$(fl_get_project_root)

    local memory_bank="${project_root}/.claude/context/coordination/memory-bank.md"

    if [[ ! -f "$memory_bank" ]]; then
        fl_log DEBUG "Memory bank not found, skipping log"
        return 0
    fi

    local timestamp
    timestamp=$(get_timestamp)

    # Append to memory bank (atomic on most filesystems)
    echo "- [$timestamp] LOCK: $message" >> "$memory_bank"

    fl_log DEBUG "Logged to memory bank: $message"
}

# ============================================================================
# Five-Step Locked Update Pattern
# ============================================================================

# Execute a locked update following the five-step pattern:
# 1. Acquire lock
# 2. Read current state
# 3. Modify state
# 4. Write new state (with lock verification)
# 5. Release lock
#
# Usage:
#   locked_update "task-queue.yaml" "story-creator" 'update_func "$content"'
#
# where update_func receives current content and outputs new content
locked_update() {
    local target_file="$1"
    local agent_name="$2"
    local update_command="$3"

    local project_root
    project_root=$(fl_get_project_root)
    local full_path="${project_root}/${target_file}"

    # Step 1: Acquire lock
    local lock_token
    lock_token=$(acquire_lock "$target_file" "$agent_name")
    if [[ -z "$lock_token" ]]; then
        echo "Failed to acquire lock: $FL_ERROR_MSG" >&2
        return 1
    fi

    # Step 2: Read current state
    local current_content=""
    if [[ -f "$full_path" ]]; then
        current_content=$(cat "$full_path")
    fi

    # Step 3: Modify state (run update command)
    local new_content
    new_content=$(echo "$current_content" | eval "$update_command")
    local update_status=$?

    if [[ $update_status -ne 0 ]]; then
        release_lock "$target_file" "$lock_token"
        echo "Update function failed" >&2
        return 1
    fi

    # Step 4: Write new state (with lock verification)
    if ! verify_lock "$target_file" "$lock_token"; then
        echo "Lock verification failed before write: $FL_ERROR_MSG" >&2
        return 1
    fi

    echo "$new_content" > "$full_path"

    # Step 5: Release lock
    release_lock "$target_file" "$lock_token"

    fl_log INFO "Locked update completed for '$target_file'"
    return 0
}

# ============================================================================
# CLI Interface
# ============================================================================

show_help() {
    cat << 'EOF'
File Lock Library - Epic 04, Story 4.5

Usage:
  ./file-lock.sh [OPTIONS] [ARGS]

Options:
  --acquire <file> <agent>    Acquire lock, returns token
  --release <file> <token>    Release lock with token
  --verify <file> <token>     Verify lock is still held
  --check <file>              Check lock status
  --generate-token            Generate a secure token
  --help                      Show this help
  --version                   Show version

Examples:
  token=$(./file-lock.sh --acquire task-queue.yaml story-creator)
  ./file-lock.sh --check task-queue.yaml
  ./file-lock.sh --release task-queue.yaml "$token"

Lock TTL: 5 minutes (300 seconds)
Token Size: 128 bits (32 hex characters)

Environment:
  CLAUDE_LOG_LEVEL    Set log level (DEBUG, INFO, WARNING, ERROR)
  CLAUDE_PROJECT_ROOT Override project root discovery
EOF
}

# CLI entry point
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    if [[ $# -eq 0 ]]; then
        show_help
        exit 1
    fi

    action=""
    args=()

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --acquire)
                action="acquire"
                shift
                args+=("$1" "$2")
                shift 2
                ;;
            --release)
                action="release"
                shift
                args+=("$1" "$2")
                shift 2
                ;;
            --verify)
                action="verify"
                shift
                args+=("$1" "$2")
                shift 2
                ;;
            --check)
                action="check"
                shift
                args+=("$1")
                shift
                ;;
            --generate-token)
                action="generate-token"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            --version)
                echo "file-lock.sh version $FL_VERSION"
                exit 0
                ;;
            *)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
        esac
    done

    case "$action" in
        acquire)
            token=$(acquire_lock "${args[0]}" "${args[1]}")
            if [[ -n "$token" ]]; then
                echo "$token"
            else
                echo "Error: $FL_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        release)
            if release_lock "${args[0]}" "${args[1]}"; then
                echo "Lock released"
            else
                echo "Error: $FL_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        verify)
            if verify_lock "${args[0]}" "${args[1]}"; then
                echo "Lock valid"
            else
                echo "Lock invalid: $FL_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        check)
            status=$(get_lock_status "${args[0]}")
            echo "Status: $status"
            ;;
        generate-token)
            token=$(generate_lock_token)
            if [[ -n "$token" ]]; then
                echo "$token"
                echo "Entropy: $((FL_TOKEN_BYTES * 8)) bits"
            else
                echo "Error: $FL_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
fi
