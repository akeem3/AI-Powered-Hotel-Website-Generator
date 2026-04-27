#!/usr/bin/env bash
#
# Error Handler Library
# Epic 04, Story 4.4 - Error Handling and Retry Logic
#
# Handles agent failures gracefully with retry logic and escalation.
# Distinguishes transient vs permanent failures and provides structured errors.
#
# Usage:
#   source .claude/lib/error-handler.sh
#   if ! execute_with_retry "command" 3; then
#       echo "Failed: $(get_last_error)"
#   fi
#
# Or CLI:
#   ./error-handler.sh --classify "Connection timeout"
#   ./error-handler.sh --format-error TRANSIENT "Network error" "context"
#

set -eo pipefail

# ============================================================================
# Configuration
# ============================================================================

readonly EH_VERSION="1.0.0"
readonly EH_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Retry configuration
readonly EH_MAX_RETRIES=3
readonly EH_BACKOFF_BASE=1  # Base backoff in seconds (1s, 2s, 4s)

# Error classification patterns
declare -a TRANSIENT_ERROR_PATTERNS=(
    "timeout"
    "connection refused"
    "network"
    "temporary"
    "EAGAIN"
    "ETIMEDOUT"
    "ECONNRESET"
    "503"  # Service Unavailable
    "502"  # Bad Gateway
    "504"  # Gateway Timeout
    "rate limit"
    "too many requests"
    "overloaded"
)

declare -a PERMANENT_ERROR_PATTERNS=(
    "file not found"
    "no such file"
    "permission denied"
    "invalid input"
    "syntax error"
    "parse error"
    "not found"
    "does not exist"
    "400"  # Bad Request
    "401"  # Unauthorized
    "403"  # Forbidden
    "404"  # Not Found
    "422"  # Unprocessable Entity
    "invalid"
    "malformed"
)

# Critical error patterns (stop workflow immediately)
declare -a CRITICAL_ERROR_PATTERNS=(
    "out of memory"
    "disk full"
    "quota exceeded"
    "fatal"
    "panic"
    "segfault"
    "core dump"
)

# Global state
EH_LAST_ERROR=""
EH_LAST_ERROR_TYPE=""
EH_RETRY_COUNT=0
EH_PROJECT_ROOT=""

# ============================================================================
# Logging
# ============================================================================

eh_log() {
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

eh_get_project_root() {
    if [[ -n "$EH_PROJECT_ROOT" ]]; then
        echo "$EH_PROJECT_ROOT"
        return 0
    fi

    if [[ -n "${CLAUDE_PROJECT_ROOT:-}" ]]; then
        EH_PROJECT_ROOT="$CLAUDE_PROJECT_ROOT"
        echo "$EH_PROJECT_ROOT"
        return 0
    fi

    local git_root
    git_root=$(git rev-parse --show-toplevel 2>/dev/null) || true

    if [[ -n "$git_root" ]]; then
        EH_PROJECT_ROOT="$git_root"
    else
        EH_PROJECT_ROOT="$(pwd)"
    fi

    echo "$EH_PROJECT_ROOT"
}

# ============================================================================
# Error Classification
# ============================================================================

# Classify an error as TRANSIENT, PERMANENT, or CRITICAL
classify_error() {
    local error_msg="$1"
    local error_lower
    error_lower=$(echo "$error_msg" | tr '[:upper:]' '[:lower:]')

    # Check critical patterns first
    for pattern in "${CRITICAL_ERROR_PATTERNS[@]}"; do
        if [[ "$error_lower" == *"$pattern"* ]]; then
            echo "CRITICAL"
            return 0
        fi
    done

    # Check permanent patterns
    for pattern in "${PERMANENT_ERROR_PATTERNS[@]}"; do
        if [[ "$error_lower" == *"$pattern"* ]]; then
            echo "PERMANENT"
            return 0
        fi
    done

    # Check transient patterns
    for pattern in "${TRANSIENT_ERROR_PATTERNS[@]}"; do
        if [[ "$error_lower" == *"$pattern"* ]]; then
            echo "TRANSIENT"
            return 0
        fi
    done

    # Default to PERMANENT for unknown errors (fail safe)
    echo "PERMANENT"
}

# Check if error is retryable
is_retryable() {
    local error_type="$1"
    [[ "$error_type" == "TRANSIENT" ]]
}

# ============================================================================
# Error Sanitization (Security)
# ============================================================================

# Remove sensitive data from error messages
sanitize_error_message() {
    local msg="$1"

    # Remove potential credentials
    msg=$(echo "$msg" | sed -E 's/password[[:space:]]*[:=][[:space:]]*[^[:space:]]*/password=<REDACTED>/gi')
    msg=$(echo "$msg" | sed -E 's/token[[:space:]]*[:=][[:space:]]*[^[:space:]]*/token=<REDACTED>/gi')
    msg=$(echo "$msg" | sed -E 's/api[_-]?key[[:space:]]*[:=][[:space:]]*[^[:space:]]*/api_key=<REDACTED>/gi')
    msg=$(echo "$msg" | sed -E 's/secret[[:space:]]*[:=][[:space:]]*[^[:space:]]*/secret=<REDACTED>/gi')

    # Truncate file paths to basename
    msg=$(echo "$msg" | sed -E 's|/[^ ]*/(([^/ ]+/)?[^/ ]+)|...\1|g')

    # Remove file content previews
    msg=$(echo "$msg" | sed -E 's/content[[:space:]]*[:=][[:space:]]*"[^"]{100,}"/content="<TRUNCATED>"/gi')

    # Escape special characters for JSON
    msg="${msg//\\/\\\\}"
    msg="${msg//\"/\\\"}"
    msg="${msg//$'\n'/\\n}"
    msg="${msg//$'\r'/\\r}"

    echo "$msg"
}

# ============================================================================
# Error Suggestions
# ============================================================================

# Generate actionable suggestions based on error type
get_error_suggestions() {
    local error_msg="$1"
    local error_lower
    error_lower=$(echo "$error_msg" | tr '[:upper:]' '[:lower:]')

    declare -a suggestions=()

    # File not found suggestions
    if [[ "$error_lower" == *"file not found"* ]] || [[ "$error_lower" == *"no such file"* ]]; then
        suggestions+=("Check if the file path is correct")
        suggestions+=("Verify the file was created by a previous step")
        suggestions+=("Create the file first if it's a prerequisite")
    fi

    # Permission denied suggestions
    if [[ "$error_lower" == *"permission denied"* ]]; then
        suggestions+=("Check file permissions with 'ls -la'")
        suggestions+=("Ensure the user has read/write access")
        suggestions+=("Check if the file is locked by another process")
    fi

    # Epic/story not found
    if [[ "$error_lower" == *"epic"* ]] && [[ "$error_lower" == *"not found"* ]]; then
        suggestions+=("Create epic file first using epic-creator agent")
        suggestions+=("Check epic file naming convention")
    fi

    # Timeout suggestions
    if [[ "$error_lower" == *"timeout"* ]]; then
        suggestions+=("Retry the operation - may be a temporary issue")
        suggestions+=("Check network connectivity")
        suggestions+=("Consider increasing timeout value")
    fi

    # Rate limit suggestions
    if [[ "$error_lower" == *"rate limit"* ]] || [[ "$error_lower" == *"too many requests"* ]]; then
        suggestions+=("Wait a few minutes before retrying")
        suggestions+=("Reduce the number of parallel operations")
    fi

    # Invalid input suggestions
    if [[ "$error_lower" == *"invalid"* ]] || [[ "$error_lower" == *"malformed"* ]]; then
        suggestions+=("Check input format against expected schema")
        suggestions+=("Validate input data before passing to agent")
    fi

    # Default suggestion
    if [[ ${#suggestions[@]} -eq 0 ]]; then
        suggestions+=("Check the error details for more information")
        suggestions+=("Review workflow logs for context")
    fi

    printf '%s\n' "${suggestions[@]}"
}

# ============================================================================
# Structured Error Format
# ============================================================================

# Format error as structured JSON (per PRD FR-17)
format_error_json() {
    local error_type="$1"
    local error_msg="$2"
    local context="${3:-}"
    local task_id="${4:-unknown}"
    local agent="${5:-unknown}"

    local sanitized_msg
    sanitized_msg=$(sanitize_error_message "$error_msg")

    local sanitized_context=""
    if [[ -n "$context" ]]; then
        sanitized_context=$(sanitize_error_message "$context")
    fi

    local suggestions_json="[]"
    local suggestions_array=()
    while IFS= read -r suggestion; do
        [[ -n "$suggestion" ]] && suggestions_array+=("\"$suggestion\"")
    done < <(get_error_suggestions "$error_msg")

    if [[ ${#suggestions_array[@]} -gt 0 ]]; then
        suggestions_json="[$(IFS=,; echo "${suggestions_array[*]}")]"
    fi

    cat << EOF
{
  "error": true,
  "error_type": "$error_type",
  "message": "$sanitized_msg",
  "task_id": "$task_id",
  "agent": "$agent",
  "context": "$sanitized_context",
  "suggestions": $suggestions_json,
  "retryable": $(is_retryable "$error_type" && echo "true" || echo "false"),
  "timestamp": "$(date -Iseconds)"
}
EOF
}

# ============================================================================
# Retry Logic with Exponential Backoff
# ============================================================================

# Calculate backoff delay for retry attempt
calculate_backoff() {
    local attempt="$1"
    # Exponential backoff: 1s, 2s, 4s
    echo $((EH_BACKOFF_BASE * (2 ** (attempt - 1))))
}

# Execute command with retry logic
# Returns 0 on success, 1 on failure (all retries exhausted)
execute_with_retry() {
    local command="$1"
    local max_retries="${2:-$EH_MAX_RETRIES}"
    local task_id="${3:-task}"
    local agent="${4:-unknown}"

    EH_RETRY_COUNT=0
    EH_LAST_ERROR=""
    EH_LAST_ERROR_TYPE=""

    local attempt=0
    while [[ $attempt -lt $max_retries ]]; do
        ((attempt++))

        eh_log DEBUG "Attempt $attempt/$max_retries for task $task_id"

        # Execute command and capture output/error
        local output
        local exit_code
        if output=$(eval "$command" 2>&1); then
            # Success
            echo "$output"
            return 0
        else
            exit_code=$?
            local error_msg="$output"

            EH_LAST_ERROR="$error_msg"
            EH_LAST_ERROR_TYPE=$(classify_error "$error_msg")
            EH_RETRY_COUNT=$attempt

            eh_log WARNING "Attempt $attempt failed: $error_msg (type: $EH_LAST_ERROR_TYPE)"

            # Check if error is retryable
            if ! is_retryable "$EH_LAST_ERROR_TYPE"; then
                eh_log ERROR "Permanent error detected, not retrying"
                return 1
            fi

            # Check if critical
            if [[ "$EH_LAST_ERROR_TYPE" == "CRITICAL" ]]; then
                eh_log ERROR "Critical error detected, stopping immediately"
                return 2
            fi

            # Wait before retry (if not last attempt)
            if [[ $attempt -lt $max_retries ]]; then
                local backoff
                backoff=$(calculate_backoff "$attempt")
                eh_log INFO "Retrying in ${backoff}s..."
                sleep "$backoff"
            fi
        fi
    done

    eh_log ERROR "All $max_retries retries exhausted for task $task_id"
    return 1
}

# Get last error information
get_last_error() {
    echo "$EH_LAST_ERROR"
}

get_last_error_type() {
    echo "$EH_LAST_ERROR_TYPE"
}

get_retry_count() {
    echo "$EH_RETRY_COUNT"
}

# ============================================================================
# Failed Task Logging
# ============================================================================

# Log failed task to task-queue.yaml format
format_failed_task() {
    local task_id="$1"
    local agent="$2"
    local error_msg="$3"
    local retry_count="${4:-0}"
    local max_retries="${5:-$EH_MAX_RETRIES}"

    local sanitized_msg
    sanitized_msg=$(sanitize_error_message "$error_msg")

    cat << EOF
- id: $task_id
  failed_at: "$(date -Iseconds)"
  failed_by: $agent
  error: "$sanitized_msg"
  error_type: "$(classify_error "$error_msg")"
  retry_count: $retry_count
  max_retries: $max_retries
EOF
}

# ============================================================================
# Partial Results Handling
# ============================================================================

# Create partial results report when some agents succeed
format_partial_results() {
    local workflow_name="$1"
    local successful_count="$2"
    local failed_count="$3"
    local total_count="$4"

    local confidence
    if [[ $total_count -gt 0 ]]; then
        confidence=$(echo "scale=2; $successful_count / $total_count" | bc 2>/dev/null || echo "0.0")
    else
        confidence="0.0"
    fi

    cat << EOF
{
  "workflow": "$workflow_name",
  "status": "PARTIAL",
  "partial_results": {
    "successful_agents": $successful_count,
    "failed_agents": $failed_count,
    "total_agents": $total_count,
    "confidence_score": $confidence
  },
  "note": "Some agents failed. Results may be incomplete.",
  "timestamp": "$(date -Iseconds)"
}
EOF
}

# ============================================================================
# Critical Error Handling
# ============================================================================

# Handle critical error (stop workflow immediately)
handle_critical_error() {
    local error_msg="$1"
    local task_id="${2:-unknown}"
    local agent="${3:-unknown}"

    eh_log ERROR "CRITICAL ERROR in task $task_id: $error_msg"

    format_error_json "CRITICAL" "$error_msg" "Workflow stopped immediately" "$task_id" "$agent"

    # Return special exit code for critical
    return 2
}

# ============================================================================
# CLI Interface
# ============================================================================

show_help() {
    cat << 'EOF'
Error Handler Library - Epic 04, Story 4.4

Usage:
  ./error-handler.sh [OPTIONS] [ARGS]

Options:
  --classify <error_msg>              Classify error type
  --format-error <type> <msg> [ctx]   Format structured error
  --suggestions <error_msg>           Get actionable suggestions
  --format-failed <id> <agent> <msg>  Format failed task entry
  --partial <wf> <ok> <fail> <total>  Format partial results
  --sanitize <msg>                    Sanitize error message
  --help                              Show this help
  --version                           Show version

Error Types:
  TRANSIENT - Retryable (timeout, network, rate limit)
  PERMANENT - Not retryable (not found, invalid input, permission)
  CRITICAL  - Stop workflow (out of memory, fatal, panic)

Retry Policy:
  Max Retries: 3
  Backoff: 1s, 2s, 4s (exponential)

Examples:
  ./error-handler.sh --classify "Connection timeout"
  ./error-handler.sh --format-error TRANSIENT "Network error" "context"
  ./error-handler.sh --suggestions "file not found"

Environment:
  CLAUDE_LOG_LEVEL  Set log level (DEBUG, INFO, WARNING, ERROR)
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
            --classify)
                action="classify"
                shift
                args+=("$1")
                shift
                ;;
            --format-error)
                action="format-error"
                shift
                args+=("$1" "$2" "${3:-}")
                shift
                [[ $# -gt 0 ]] && shift
                [[ $# -gt 0 ]] && shift
                ;;
            --suggestions)
                action="suggestions"
                shift
                args+=("$1")
                shift
                ;;
            --format-failed)
                action="format-failed"
                shift
                args+=("$1" "$2" "$3")
                shift 3
                ;;
            --partial)
                action="partial"
                shift
                args+=("$1" "$2" "$3" "$4")
                shift 4
                ;;
            --sanitize)
                action="sanitize"
                shift
                args+=("$1")
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            --version)
                echo "error-handler.sh version $EH_VERSION"
                exit 0
                ;;
            *)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
        esac
    done

    case "$action" in
        classify)
            error_type=$(classify_error "${args[0]}")
            echo "Error Type: $error_type"
            echo "Retryable: $(is_retryable "$error_type" && echo "yes" || echo "no")"
            ;;
        format-error)
            format_error_json "${args[0]}" "${args[1]}" "${args[2]:-}"
            ;;
        suggestions)
            echo "Suggestions:"
            get_error_suggestions "${args[0]}" | while read -r suggestion; do
                echo "  - $suggestion"
            done
            ;;
        format-failed)
            format_failed_task "${args[0]}" "${args[1]}" "${args[2]}"
            ;;
        partial)
            format_partial_results "${args[0]}" "${args[1]}" "${args[2]}" "${args[3]}"
            ;;
        sanitize)
            sanitize_error_message "${args[0]}"
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
fi
