#!/usr/bin/env bash
#
# Task Dispatcher Library
# Epic 04, Story 4.2 - Parallel Task Dispatcher
#
# Dispatches independent tasks to agents in parallel with isolated contexts.
# Integrates with dependency-graph.sh for wave computation.
#
# Usage:
#   source .claude/lib/task-dispatcher.sh
#   dispatch_wave 1 "workflow.yaml"
#
# Or CLI:
#   ./task-dispatcher.sh --validate-agent story-creator
#   ./task-dispatcher.sh --dispatch-format task-id workflow.yaml
#   ./task-dispatcher.sh --update-status task-id in-progress
#

set -eo pipefail

# ============================================================================
# Configuration
# ============================================================================

readonly TD_VERSION="1.0.0"
readonly TD_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load dependency graph library
if [[ -f "$TD_SCRIPT_DIR/dependency-graph.sh" ]]; then
    source "$TD_SCRIPT_DIR/dependency-graph.sh"
fi

# Agent classification (from orchestrator.md)
declare -A PARALLEL_SAFE_AGENTS=(
    [hallucination-checker]=1
    [security-validator]=1
    [code-reviewer]=1
    [story-verifier]=1
)

declare -A SEQUENTIAL_AGENTS=(
    [story-creator]=1
    [test-generator]=1  # Partially - writes tests
    [epic-creator]=1
)

# Allowed context directories
declare -a ALLOWED_CONTEXT_DIRS=(
    ".claude/context"
    ".claude/agents"
    ".claude/workflows"
    "docs/stories"
    "docs/epics"
    "docs/reports"
)

# Global state
TD_ERROR_MSG=""
TD_PROJECT_ROOT=""

# ============================================================================
# Logging
# ============================================================================

td_log() {
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

discover_project_root() {
    if [[ -n "$TD_PROJECT_ROOT" ]]; then
        echo "$TD_PROJECT_ROOT"
        return 0
    fi

    # Check for environment override
    if [[ -n "${CLAUDE_PROJECT_ROOT:-}" ]]; then
        TD_PROJECT_ROOT="$CLAUDE_PROJECT_ROOT"
        echo "$TD_PROJECT_ROOT"
        return 0
    fi

    # Find git root
    local git_root
    git_root=$(git rev-parse --show-toplevel 2>/dev/null) || true

    if [[ -n "$git_root" ]]; then
        TD_PROJECT_ROOT="$git_root"
        echo "$TD_PROJECT_ROOT"
        return 0
    fi

    # Fall back to current directory
    TD_PROJECT_ROOT="$(pwd)"
    echo "$TD_PROJECT_ROOT"
}

# ============================================================================
# Agent Validation (Security Critical)
# ============================================================================

# Validate agent name format and existence
# Returns 0 if valid, 1 if invalid (sets TD_ERROR_MSG)
validate_agent() {
    local agent_name="$1"
    local project_root
    project_root=$(discover_project_root)

    TD_ERROR_MSG=""

    # Check empty
    if [[ -z "$agent_name" ]]; then
        TD_ERROR_MSG="Agent name is empty"
        return 1
    fi

    # Validate format: lowercase letters and hyphens only
    if [[ ! "$agent_name" =~ ^[a-z][a-z0-9-]*$ ]]; then
        TD_ERROR_MSG="Invalid agent name format: '$agent_name'. Must match ^[a-z][a-z0-9-]*$"
        return 1
    fi

    # Check for shell metacharacters
    if [[ "$agent_name" =~ [\;\|\&\$\`\(\)\{\}\[\]\<\>\!\~\*\?\\] ]]; then
        TD_ERROR_MSG="Agent name contains shell metacharacters: '$agent_name'"
        return 1
    fi

    # Check length
    if [[ ${#agent_name} -gt 32 ]]; then
        TD_ERROR_MSG="Agent name too long: '$agent_name'. Maximum 32 characters."
        return 1
    fi

    # Check path traversal
    if [[ "$agent_name" == *".."* ]] || [[ "$agent_name" == *"/"* ]]; then
        TD_ERROR_MSG="Path traversal detected in agent name: '$agent_name'"
        return 1
    fi

    # Check agent file exists
    local agent_file="$project_root/.claude/agents/${agent_name}.md"
    if [[ ! -f "$agent_file" ]]; then
        TD_ERROR_MSG="Agent file not found: $agent_file"
        return 1
    fi

    td_log DEBUG "Agent validated: $agent_name"
    return 0
}

# Check if agent is parallel-safe
is_parallel_safe() {
    local agent_name="$1"
    [[ -n "${PARALLEL_SAFE_AGENTS[$agent_name]:-}" ]]
}

# Check if agent requires sequential execution
is_sequential_required() {
    local agent_name="$1"
    [[ -n "${SEQUENTIAL_AGENTS[$agent_name]:-}" ]]
}

# Get agent classification
get_agent_classification() {
    local agent_name="$1"

    if is_parallel_safe "$agent_name"; then
        echo "parallel-safe"
    elif is_sequential_required "$agent_name"; then
        echo "sequential-required"
    else
        echo "unknown"
    fi
}

# ============================================================================
# Context Path Validation
# ============================================================================

# Validate context file path is within allowed directories
validate_context_path() {
    local path="$1"
    local project_root
    project_root=$(discover_project_root)

    # Check for path traversal
    if [[ "$path" == *".."* ]]; then
        TD_ERROR_MSG="Path traversal detected: $path"
        return 1
    fi

    # Normalize path (remove leading ./ if present)
    path="${path#./}"

    # Check against allowed directories
    local allowed=false
    for dir in "${ALLOWED_CONTEXT_DIRS[@]}"; do
        if [[ "$path" == "$dir"* ]] || [[ "$path" == "$project_root/$dir"* ]]; then
            allowed=true
            break
        fi
    done

    if [[ "$allowed" != true ]]; then
        TD_ERROR_MSG="Path not in allowed directories: $path"
        return 1
    fi

    return 0
}

# ============================================================================
# Task Dispatch Format Generation
# ============================================================================

# Generate Task tool dispatch format per orchestrator.md
# Args: task_id, agent_name, objective, context_files (space-separated), output_format, output_path
generate_dispatch_format() {
    local task_id="$1"
    local agent_name="$2"
    local objective="$3"
    local context_files="$4"
    local output_format="${5:-Markdown}"
    local output_path="${6:-}"

    local project_root
    project_root=$(discover_project_root)

    # Validate agent
    if ! validate_agent "$agent_name"; then
        return 1
    fi

    # Validate context files
    for ctx_file in $context_files; do
        if ! validate_context_path "$ctx_file"; then
            return 1
        fi
    done

    # Generate dispatch format
    cat << EOF
## Task for ${agent_name}

**Task ID**: ${task_id}

**Objective**: ${objective}

**Context Files**:
EOF

    for ctx_file in $context_files; do
        echo "- ${ctx_file}"
    done

    cat << EOF

**Expected Output**:
- Format: ${output_format}
EOF

    if [[ -n "$output_path" ]]; then
        echo "- Save to: ${output_path}"
    fi

    cat << EOF

**Constraints**:
- Complete within allocated context window
- Return structured output for aggregation
- Do not modify files outside designated output path
EOF
}

# Generate JSON dispatch format for machine processing
generate_dispatch_json() {
    local task_id="$1"
    local agent_name="$2"
    local objective="$3"
    local context_files="$4"
    local output_format="${5:-markdown}"
    local output_path="${6:-}"

    # Validate agent
    if ! validate_agent "$agent_name"; then
        echo '{"error": "'"$TD_ERROR_MSG"'"}'
        return 1
    fi

    # Build context files array
    local ctx_array="[]"
    if [[ -n "$context_files" ]]; then
        ctx_array="["
        local first=true
        for ctx_file in $context_files; do
            if ! validate_context_path "$ctx_file"; then
                echo '{"error": "'"$TD_ERROR_MSG"'"}'
                return 1
            fi
            [[ "$first" != true ]] && ctx_array+=","
            ctx_array+="\"$ctx_file\""
            first=false
        done
        ctx_array+="]"
    fi

    cat << EOF
{
  "task_id": "${task_id}",
  "agent": "${agent_name}",
  "objective": "${objective}",
  "context_files": ${ctx_array},
  "output_format": "${output_format}",
  "output_path": "${output_path}",
  "classification": "$(get_agent_classification "$agent_name")",
  "timestamp": "$(date -Iseconds)"
}
EOF
}

# ============================================================================
# Task Queue Status Management
# ============================================================================

# Get task queue file path
get_task_queue_path() {
    local project_root
    project_root=$(discover_project_root)
    echo "$project_root/.claude/context/coordination/task-queue.yaml"
}

# Update task status in task-queue.yaml
# Status values: pending, in-progress, completed, failed, blocked
update_task_status() {
    local task_id="$1"
    local status="$2"
    local agent="${3:-}"
    local task_queue_file
    task_queue_file=$(get_task_queue_path)

    # Validate status
    if [[ ! "$status" =~ ^(pending|in-progress|completed|failed|blocked)$ ]]; then
        TD_ERROR_MSG="Invalid status: $status"
        return 1
    fi

    local timestamp
    timestamp=$(date -Iseconds)

    # Check if task-queue.yaml exists
    if [[ ! -f "$task_queue_file" ]]; then
        TD_ERROR_MSG="Task queue file not found: $task_queue_file"
        return 1
    fi

    td_log INFO "Task status update: $task_id -> $status"

    # For now, log the update (actual YAML modification would require more complex logic)
    # The orchestrator should handle actual file updates with lock mechanism (Story 4.5)
    echo "task_status_update:"
    echo "  task_id: $task_id"
    echo "  status: $status"
    echo "  agent: $agent"
    echo "  timestamp: $timestamp"
}

# Update agent status in task-queue.yaml
update_agent_status() {
    local agent_name="$1"
    local available="$2"
    local current_task="${3:-}"

    local timestamp
    timestamp=$(date -Iseconds)

    td_log INFO "Agent status update: $agent_name available=$available"

    echo "agent_status_update:"
    echo "  agent: $agent_name"
    echo "  available: $available"
    echo "  current_task: $current_task"
    echo "  last_activity: $timestamp"
}

# ============================================================================
# Wave Dispatch Planning
# ============================================================================

# Plan dispatch for a specific wave
# Returns JSON with tasks to dispatch
plan_wave_dispatch() {
    local wave_number="$1"
    local workflow_file="$2"

    # Build dependency graph
    if ! build_graph "$workflow_file"; then
        TD_ERROR_MSG="Failed to build graph: $(get_error)"
        return 1
    fi

    local wave_tasks
    wave_tasks=$(get_wave_tasks "$wave_number")

    if [[ -z "$wave_tasks" ]]; then
        TD_ERROR_MSG="No tasks in wave $wave_number"
        return 1
    fi

    echo "{"
    echo "  \"wave\": $wave_number,"
    echo "  \"workflow\": \"$DG_WORKFLOW_NAME\","
    echo "  \"tasks\": ["

    local first=true
    local parallel_count=0
    local sequential_tasks=()

    for task_id in $wave_tasks; do
        local task_data="${DG_TASKS[$task_id]}"
        local agent=""

        if [[ "$task_data" =~ agent:([a-z0-9-]+) ]]; then
            agent="${BASH_REMATCH[1]}"
        fi

        [[ "$first" != true ]] && echo ","
        first=false

        echo "    {"
        echo "      \"task_id\": \"$task_id\","
        echo "      \"agent\": \"${agent:-null}\","

        if [[ -n "$agent" ]]; then
            local classification
            classification=$(get_agent_classification "$agent")
            echo "      \"classification\": \"$classification\","

            if [[ "$classification" == "parallel-safe" ]]; then
                echo "      \"can_parallel\": true"
                ((parallel_count++)) || true
            else
                echo "      \"can_parallel\": false"
                sequential_tasks+=("$task_id")
            fi
        else
            echo "      \"classification\": \"context-operation\","
            echo "      \"can_parallel\": true"
        fi

        echo -n "    }"
    done

    echo ""
    echo "  ],"
    echo "  \"parallel_count\": $parallel_count,"
    echo "  \"sequential_tasks\": [$(printf '"%s",' "${sequential_tasks[@]}" | sed 's/,$//')]"
    echo "}"
}

# Check if all tasks in a wave are complete
check_wave_completion() {
    local wave_number="$1"
    local workflow_file="$2"

    # For this implementation, return a status check format
    # Actual implementation would check task-queue.yaml
    echo "wave_completion_check:"
    echo "  wave: $wave_number"
    echo "  check_time: $(date -Iseconds)"
    echo "  # Check task-queue.yaml for actual status"
}

# ============================================================================
# Concurrent Execution Tracking
# ============================================================================

# Track running instances of an agent
declare -A AGENT_INSTANCES=()

# Check if agent can be started (respects parallel/sequential rules)
can_start_agent() {
    local agent_name="$1"

    if is_sequential_required "$agent_name"; then
        local current_instances="${AGENT_INSTANCES[$agent_name]:-0}"
        if [[ $current_instances -gt 0 ]]; then
            TD_ERROR_MSG="Sequential agent '$agent_name' already has $current_instances instance(s) running"
            return 1
        fi
    fi

    return 0
}

# Register agent instance start
register_agent_start() {
    local agent_name="$1"
    local current="${AGENT_INSTANCES[$agent_name]:-0}"
    AGENT_INSTANCES[$agent_name]=$((current + 1))
    td_log DEBUG "Agent '$agent_name' instance started (count: ${AGENT_INSTANCES[$agent_name]})"
}

# Register agent instance completion
register_agent_complete() {
    local agent_name="$1"
    local current="${AGENT_INSTANCES[$agent_name]:-0}"
    if [[ $current -gt 0 ]]; then
        AGENT_INSTANCES[$agent_name]=$((current - 1))
    fi
    td_log DEBUG "Agent '$agent_name' instance completed (count: ${AGENT_INSTANCES[$agent_name]:-0})"
}

# Get running instance count for agent
get_agent_instance_count() {
    local agent_name="$1"
    echo "${AGENT_INSTANCES[$agent_name]:-0}"
}

# ============================================================================
# CLI Interface
# ============================================================================

show_help() {
    cat << 'EOF'
Task Dispatcher - Epic 04, Story 4.2

Usage:
  ./task-dispatcher.sh [OPTIONS] [ARGS]

Options:
  --validate-agent <name>       Validate agent name and existence
  --classify-agent <name>       Get agent classification (parallel-safe/sequential)
  --dispatch-format <task> <wf> Generate dispatch format for a task
  --dispatch-json <task> <wf>   Generate JSON dispatch for a task
  --plan-wave <num> <workflow>  Plan dispatch for a wave
  --update-status <id> <status> Update task status
  --validate-path <path>        Validate context file path
  --help                        Show this help
  --version                     Show version

Examples:
  ./task-dispatcher.sh --validate-agent story-creator
  ./task-dispatcher.sh --classify-agent hallucination-checker
  ./task-dispatcher.sh --plan-wave 1 workflow.yaml
  ./task-dispatcher.sh --validate-path .claude/context/stories/test.md

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
            --validate-agent)
                action="validate-agent"
                shift
                args+=("$1")
                shift
                ;;
            --classify-agent)
                action="classify-agent"
                shift
                args+=("$1")
                shift
                ;;
            --dispatch-format)
                action="dispatch-format"
                shift
                args+=("$1" "$2")
                shift 2
                ;;
            --dispatch-json)
                action="dispatch-json"
                shift
                args+=("$1" "$2")
                shift 2
                ;;
            --plan-wave)
                action="plan-wave"
                shift
                args+=("$1" "$2")
                shift 2
                ;;
            --update-status)
                action="update-status"
                shift
                args+=("$1" "$2")
                shift 2
                ;;
            --validate-path)
                action="validate-path"
                shift
                args+=("$1")
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            --version)
                echo "task-dispatcher.sh version $TD_VERSION"
                exit 0
                ;;
            *)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
        esac
    done

    case "$action" in
        validate-agent)
            if validate_agent "${args[0]}"; then
                echo "Agent '${args[0]}' is valid"
                echo "Classification: $(get_agent_classification "${args[0]}")"
            else
                echo "Error: $TD_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        classify-agent)
            if validate_agent "${args[0]}"; then
                classification=$(get_agent_classification "${args[0]}")
                echo "Agent: ${args[0]}"
                echo "Classification: $classification"
                if is_parallel_safe "${args[0]}"; then
                    echo "Can run multiple instances simultaneously"
                elif is_sequential_required "${args[0]}"; then
                    echo "Must run one instance at a time"
                else
                    echo "Classification unknown - treat as sequential for safety"
                fi
            else
                echo "Error: $TD_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        dispatch-format)
            task_id="${args[0]}"
            workflow_file="${args[1]}"

            # Build graph to get task info
            if build_graph "$workflow_file"; then
                task_data="${DG_TASKS[$task_id]:-}"
                if [[ -z "$task_data" ]]; then
                    echo "Error: Task '$task_id' not found in workflow" >&2
                    exit 1
                fi

                agent=""
                if [[ "$task_data" =~ agent:([a-z0-9-]+) ]]; then
                    agent="${BASH_REMATCH[1]}"
                fi

                if [[ -n "$agent" ]]; then
                    generate_dispatch_format "$task_id" "$agent" "Execute task $task_id" "" "Markdown"
                else
                    echo "# Context Operation: $task_id"
                    echo "Type: $(echo "$task_data" | grep -o 'type:[a-z-]*' | cut -d: -f2)"
                fi
            else
                echo "Error: $(get_error)" >&2
                exit 1
            fi
            ;;
        dispatch-json)
            task_id="${args[0]}"
            workflow_file="${args[1]}"

            if build_graph "$workflow_file"; then
                task_data="${DG_TASKS[$task_id]:-}"
                if [[ -z "$task_data" ]]; then
                    echo '{"error": "Task not found"}' >&2
                    exit 1
                fi

                agent=""
                if [[ "$task_data" =~ agent:([a-z0-9-]+) ]]; then
                    agent="${BASH_REMATCH[1]}"
                fi

                if [[ -n "$agent" ]]; then
                    generate_dispatch_json "$task_id" "$agent" "Execute task $task_id" "" "markdown"
                else
                    echo '{"task_id": "'"$task_id"'", "type": "context-operation", "agent": null}'
                fi
            else
                echo '{"error": "'"$(get_error)"'"}' >&2
                exit 1
            fi
            ;;
        plan-wave)
            wave_num="${args[0]}"
            workflow_file="${args[1]}"
            plan_wave_dispatch "$wave_num" "$workflow_file"
            ;;
        update-status)
            update_task_status "${args[0]}" "${args[1]}"
            ;;
        validate-path)
            if validate_context_path "${args[0]}"; then
                echo "Path '${args[0]}' is valid"
            else
                echo "Error: $TD_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
fi
