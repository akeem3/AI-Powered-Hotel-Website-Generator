#!/usr/bin/env bash
#
# Dependency Graph Builder Library
# Epic 04, Story 4.1 - Task Dependency Graph Builder
#
# Builds execution dependency graphs from workflow definitions,
# identifies parallelizable tasks, detects cycles, and groups
# tasks into execution waves.
#
# Usage:
#   source .claude/lib/dependency-graph.sh
#   build_graph "workflow.yaml"
#
# Or CLI:
#   ./dependency-graph.sh --parse workflow.yaml
#   ./dependency-graph.sh --waves workflow.yaml
#   ./dependency-graph.sh --validate workflow.yaml
#   ./dependency-graph.sh --visual workflow.yaml
#

set -eo pipefail

# ============================================================================
# Configuration
# ============================================================================

readonly DG_VERSION="1.0.0"
readonly DG_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Global state for graph operations
declare -A DG_TASKS=()           # task_id -> task_data (serialized)
declare -A DG_DEPS=()            # task_id -> space-separated dependency list
declare -A DG_WAVES=()           # task_id -> wave_number
declare -a DG_TASK_ORDER=()      # ordered list of task IDs
declare -A DG_VISITED=()         # for cycle detection
declare -A DG_REC_STACK=()       # recursion stack for cycle detection
declare DG_WORKFLOW_NAME=""
declare DG_ERROR_MSG=""

# ============================================================================
# Logging
# ============================================================================

dg_log() {
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
# Input Validation (Security)
# ============================================================================

# Validate task ID format (alphanumeric, hyphens, underscores only)
validate_task_id() {
    local task_id="$1"

    if [[ ! "$task_id" =~ ^[a-z0-9_-]+$ ]]; then
        DG_ERROR_MSG="Invalid task ID format: '$task_id'. Must be lowercase alphanumeric with hyphens/underscores."
        return 1
    fi

    if [[ ${#task_id} -gt 64 ]]; then
        DG_ERROR_MSG="Task ID too long: '$task_id'. Maximum 64 characters."
        return 1
    fi

    return 0
}

# Validate agent name format (matches .claude/agents/{name}.md)
validate_agent_name() {
    local agent_name="$1"

    if [[ -z "$agent_name" ]]; then
        return 0  # Agent is optional for some task types
    fi

    if [[ ! "$agent_name" =~ ^[a-z][a-z0-9-]*$ ]]; then
        DG_ERROR_MSG="Invalid agent name format: '$agent_name'. Must be lowercase with hyphens."
        return 1
    fi

    if [[ ${#agent_name} -gt 32 ]]; then
        DG_ERROR_MSG="Agent name too long: '$agent_name'. Maximum 32 characters."
        return 1
    fi

    return 0
}

# Validate file path (no path traversal)
validate_file_path() {
    local path="$1"

    if [[ "$path" == *".."* ]]; then
        DG_ERROR_MSG="Path traversal detected in: '$path'"
        return 1
    fi

    if [[ "$path" =~ [*?] ]]; then
        DG_ERROR_MSG="Glob characters not allowed in path: '$path'"
        return 1
    fi

    return 0
}

# ============================================================================
# YAML Parsing (Simple, safe parsing - no code execution)
# ============================================================================

# Reset graph state
reset_graph() {
    DG_TASKS=()
    DG_DEPS=()
    DG_WAVES=()
    DG_TASK_ORDER=()
    DG_VISITED=()
    DG_REC_STACK=()
    DG_WORKFLOW_NAME=""
    DG_ERROR_MSG=""
}

# Parse a YAML workflow file into graph structures
# Returns 0 on success, 1 on error (check DG_ERROR_MSG)
parse_workflow() {
    local workflow_file="$1"

    reset_graph

    # Validate file exists and is readable
    if [[ ! -f "$workflow_file" ]]; then
        DG_ERROR_MSG="Workflow file not found: $workflow_file"
        return 1
    fi

    if [[ ! -r "$workflow_file" ]]; then
        DG_ERROR_MSG="Workflow file not readable: $workflow_file"
        return 1
    fi

    # Validate path
    if ! validate_file_path "$workflow_file"; then
        return 1
    fi

    dg_log DEBUG "Parsing workflow: $workflow_file"

    local current_task=""
    local current_field=""
    local in_tasks=false
    local in_depends_on=false
    local line_num=0
    local task_index=0
    declare -a defined_tasks=()

    while IFS= read -r line || [[ -n "$line" ]]; do
        ((line_num++))

        # Skip comments and empty lines
        [[ "$line" =~ ^[[:space:]]*# ]] && continue
        [[ -z "${line// /}" ]] && continue

        # Check for YAML unsafe constructs
        if [[ "$line" =~ !![a-z]+ ]] || [[ "$line" =~ \&[a-zA-Z] ]] || [[ "$line" =~ \*[a-zA-Z] ]]; then
            DG_ERROR_MSG="Unsafe YAML construct at line $line_num: anchors/aliases not allowed"
            return 1
        fi

        # Parse workflow name
        if [[ "$line" =~ ^workflow:[[:space:]]*(.+)$ ]]; then
            DG_WORKFLOW_NAME="${BASH_REMATCH[1]}"
            dg_log DEBUG "Workflow name: $DG_WORKFLOW_NAME"
            continue
        fi

        # Start of tasks section
        if [[ "$line" =~ ^tasks:[[:space:]]*$ ]]; then
            in_tasks=true
            continue
        fi

        # Inside tasks section
        if [[ "$in_tasks" == true ]]; then
            # New task entry (starts with "- id:")
            if [[ "$line" =~ ^[[:space:]]*-[[:space:]]+id:[[:space:]]*(.+)$ ]]; then
                current_task="${BASH_REMATCH[1]}"
                in_depends_on=false

                # Validate task ID
                if ! validate_task_id "$current_task"; then
                    DG_ERROR_MSG="$DG_ERROR_MSG (line $line_num)"
                    return 1
                fi

                # Check for duplicate
                if [[ -n "${DG_TASKS[$current_task]:-}" ]]; then
                    DG_ERROR_MSG="Duplicate task ID: '$current_task' at line $line_num"
                    return 1
                fi

                DG_TASKS[$current_task]="index:$task_index"
                DG_TASK_ORDER+=("$current_task")
                DG_DEPS[$current_task]=""
                defined_tasks+=("$current_task")
                ((task_index++))

                dg_log DEBUG "Found task: $current_task"
                continue
            fi

            # Task type
            if [[ "$line" =~ ^[[:space:]]+type:[[:space:]]*(.+)$ ]]; then
                local task_type="${BASH_REMATCH[1]}"
                DG_TASKS[$current_task]+=" type:$task_type"
                continue
            fi

            # Agent assignment
            if [[ "$line" =~ ^[[:space:]]+agent:[[:space:]]*(.+)$ ]]; then
                local agent_name="${BASH_REMATCH[1]}"

                if ! validate_agent_name "$agent_name"; then
                    DG_ERROR_MSG="$DG_ERROR_MSG (line $line_num)"
                    return 1
                fi

                DG_TASKS[$current_task]+=" agent:$agent_name"
                continue
            fi

            # Start of depends_on list
            if [[ "$line" =~ ^[[:space:]]+depends_on:[[:space:]]*$ ]]; then
                in_depends_on=true
                continue
            fi

            # Inline depends_on (single value or array notation)
            if [[ "$line" =~ ^[[:space:]]+depends_on:[[:space:]]*\[(.+)\]$ ]]; then
                local deps="${BASH_REMATCH[1]}"
                deps="${deps//,/ }"  # Replace commas with spaces
                deps="${deps//\"/}"  # Remove quotes
                deps="${deps//\'/}"

                for dep in $deps; do
                    if ! validate_task_id "$dep"; then
                        DG_ERROR_MSG="$DG_ERROR_MSG (line $line_num)"
                        return 1
                    fi
                    DG_DEPS[$current_task]+="$dep "
                done
                in_depends_on=false
                continue
            fi

            # Dependency list item
            if [[ "$in_depends_on" == true ]] && [[ "$line" =~ ^[[:space:]]+-[[:space:]]*(.+)$ ]]; then
                local dep="${BASH_REMATCH[1]}"

                if ! validate_task_id "$dep"; then
                    DG_ERROR_MSG="$DG_ERROR_MSG (line $line_num)"
                    return 1
                fi

                DG_DEPS[$current_task]+="$dep "
                continue
            fi

            # Other fields end depends_on parsing
            if [[ "$line" =~ ^[[:space:]]+[a-z_]+: ]]; then
                in_depends_on=false
            fi

            # Source/target paths (validate)
            if [[ "$line" =~ ^[[:space:]]+(source|target):[[:space:]]*(.+)$ ]]; then
                local field_name="${BASH_REMATCH[1]}"
                local path="${BASH_REMATCH[2]}"
                if ! validate_file_path "$path"; then
                    DG_ERROR_MSG="$DG_ERROR_MSG (line $line_num)"
                    return 1
                fi
                DG_TASKS[$current_task]+=" ${field_name}:$path"
                continue
            fi

            # parallel_with (informational, for visualization)
            if [[ "$line" =~ ^[[:space:]]+parallel_with:[[:space:]]*\[(.+)\]$ ]]; then
                local parallel="${BASH_REMATCH[1]}"
                parallel="${parallel//,/ }"
                parallel="${parallel//\"/}"
                parallel="${parallel//\'/}"
                DG_TASKS[$current_task]+=" parallel_with:$parallel"
                continue
            fi

            # Condition (optional)
            if [[ "$line" =~ ^[[:space:]]+condition:[[:space:]]*(.+)$ ]]; then
                DG_TASKS[$current_task]+=" condition:${BASH_REMATCH[1]}"
                continue
            fi
        fi

    done < "$workflow_file"

    # Validate all dependencies reference defined tasks (no forward references to undefined)
    for task_id in "${DG_TASK_ORDER[@]}"; do
        local deps="${DG_DEPS[$task_id]:-}"
        for dep in $deps; do
            if [[ -z "${DG_TASKS[$dep]:-}" ]]; then
                DG_ERROR_MSG="Task '$task_id' depends on undefined task '$dep'"
                return 1
            fi
        done
    done

    dg_log INFO "Parsed ${#DG_TASK_ORDER[@]} tasks from workflow '$DG_WORKFLOW_NAME'"
    return 0
}

# ============================================================================
# Cycle Detection (DFS-based)
# ============================================================================

# Check for cycles using DFS
# Returns 0 if no cycles, 1 if cycle found (check DG_ERROR_MSG)
detect_cycles() {
    DG_VISITED=()
    DG_REC_STACK=()

    for task_id in "${DG_TASK_ORDER[@]}"; do
        if [[ -z "${DG_VISITED[$task_id]:-}" ]]; then
            if ! _dfs_cycle_check "$task_id"; then
                return 1
            fi
        fi
    done

    dg_log DEBUG "No cycles detected"
    return 0
}

# DFS helper for cycle detection
_dfs_cycle_check() {
    local task_id="$1"

    DG_VISITED[$task_id]=1
    DG_REC_STACK[$task_id]=1

    local deps="${DG_DEPS[$task_id]:-}"
    for dep in $deps; do
        if [[ -z "${DG_VISITED[$dep]:-}" ]]; then
            if ! _dfs_cycle_check "$dep"; then
                return 1
            fi
        elif [[ -n "${DG_REC_STACK[$dep]:-}" ]]; then
            DG_ERROR_MSG="Circular dependency detected: '$task_id' -> '$dep'"
            return 1
        fi
    done

    unset "DG_REC_STACK[$task_id]"
    return 0
}

# ============================================================================
# Wave Grouping (Topological Sort)
# ============================================================================

# Compute execution waves for maximum parallelization
# Wave 0 = no dependencies, Wave N = depends on Wave N-1
compute_waves() {
    DG_WAVES=()

    # Initialize: tasks with no dependencies are Wave 1
    for task_id in "${DG_TASK_ORDER[@]}"; do
        local deps="${DG_DEPS[$task_id]:-}"
        if [[ -z "${deps// /}" ]]; then
            DG_WAVES[$task_id]=1
        fi
    done

    # Iteratively assign waves based on dependencies
    local changed=true
    local max_iterations=${#DG_TASK_ORDER[@]}
    local iteration=0

    while [[ "$changed" == true ]] && [[ $iteration -lt $max_iterations ]]; do
        changed=false
        ((iteration++))

        for task_id in "${DG_TASK_ORDER[@]}"; do
            if [[ -n "${DG_WAVES[$task_id]:-}" ]]; then
                continue
            fi

            local deps="${DG_DEPS[$task_id]:-}"
            local max_dep_wave=0
            local all_deps_resolved=true

            for dep in $deps; do
                if [[ -z "${DG_WAVES[$dep]:-}" ]]; then
                    all_deps_resolved=false
                    break
                fi
                local dep_wave="${DG_WAVES[$dep]}"
                if [[ $dep_wave -gt $max_dep_wave ]]; then
                    max_dep_wave=$dep_wave
                fi
            done

            if [[ "$all_deps_resolved" == true ]]; then
                DG_WAVES[$task_id]=$((max_dep_wave + 1))
                changed=true
            fi
        done
    done

    # Verify all tasks have waves assigned
    for task_id in "${DG_TASK_ORDER[@]}"; do
        if [[ -z "${DG_WAVES[$task_id]:-}" ]]; then
            DG_ERROR_MSG="Could not compute wave for task '$task_id' - possible cycle or missing dependency"
            return 1
        fi
    done

    dg_log INFO "Computed waves: $(get_max_wave) total waves"
    return 0
}

# Get maximum wave number
get_max_wave() {
    local max=0
    for wave in "${DG_WAVES[@]}"; do
        if [[ $wave -gt $max ]]; then
            max=$wave
        fi
    done
    echo "$max"
}

# Get tasks in a specific wave
get_wave_tasks() {
    local target_wave="$1"
    local result=()

    for task_id in "${DG_TASK_ORDER[@]}"; do
        if [[ "${DG_WAVES[$task_id]:-0}" == "$target_wave" ]]; then
            result+=("$task_id")
        fi
    done

    echo "${result[*]:-}"
}

# ============================================================================
# Forward Reference Validation
# ============================================================================

# Validate no forward references (task A depends on task B defined later)
validate_no_forward_refs() {
    declare -A defined_so_far=()

    for task_id in "${DG_TASK_ORDER[@]}"; do
        local deps="${DG_DEPS[$task_id]:-}"

        for dep in $deps; do
            if [[ -z "${defined_so_far[$dep]:-}" ]]; then
                # Check if dependency exists at all
                if [[ -n "${DG_TASKS[$dep]:-}" ]]; then
                    DG_ERROR_MSG="Forward reference: task '$task_id' depends on '$dep' which is defined later in workflow"
                    return 1
                fi
            fi
        done

        defined_so_far[$task_id]=1
    done

    dg_log DEBUG "No forward references detected"
    return 0
}

# ============================================================================
# Output Formats
# ============================================================================

# Output graph as YAML (machine-readable format per FR-19)
output_yaml() {
    echo "# Dependency Graph Output"
    echo "# Generated by dependency-graph.sh v$DG_VERSION"
    echo "# $(date -Iseconds)"
    echo ""
    echo "workflow: $DG_WORKFLOW_NAME"
    echo "total_tasks: ${#DG_TASK_ORDER[@]}"
    echo "total_waves: $(get_max_wave)"
    echo ""
    echo "# Execution waves (parallelizable groups)"
    echo "waves:"

    local max_wave=$(get_max_wave)
    for ((wave=1; wave<=max_wave; wave++)); do
        echo "  - wave: $wave"
        echo "    tasks:"
        for task_id in "${DG_TASK_ORDER[@]}"; do
            if [[ "${DG_WAVES[$task_id]:-0}" == "$wave" ]]; then
                echo "      - id: $task_id"

                # Extract agent from task data
                local task_data="${DG_TASKS[$task_id]}"
                if [[ "$task_data" =~ agent:([a-z0-9-]+) ]]; then
                    echo "        agent: ${BASH_REMATCH[1]}"
                fi

                # Extract type
                if [[ "$task_data" =~ type:([a-z-]+) ]]; then
                    echo "        type: ${BASH_REMATCH[1]}"
                fi

                # Dependencies
                local deps="${DG_DEPS[$task_id]:-}"
                if [[ -n "${deps// /}" ]]; then
                    echo "        depends_on: [$(echo $deps | tr ' ' ',' | sed 's/,$//')] "
                fi
            fi
        done
        echo ""
    done

    echo "# Full task list with metadata"
    echo "tasks:"
    for task_id in "${DG_TASK_ORDER[@]}"; do
        echo "  - id: $task_id"
        echo "    wave: ${DG_WAVES[$task_id]}"

        local task_data="${DG_TASKS[$task_id]}"

        if [[ "$task_data" =~ agent:([a-z0-9-]+) ]]; then
            echo "    agent: ${BASH_REMATCH[1]}"
        fi

        if [[ "$task_data" =~ type:([a-z-]+) ]]; then
            echo "    type: ${BASH_REMATCH[1]}"
        fi

        local deps="${DG_DEPS[$task_id]:-}"
        if [[ -n "${deps// /}" ]]; then
            echo "    depends_on: [$(echo $deps | tr ' ' ',' | sed 's/,$//')]"
        else
            echo "    depends_on: []"
        fi
    done
}

# Output visual graph as Markdown (human-readable format)
output_visual() {
    echo "# Dependency Graph: $DG_WORKFLOW_NAME"
    echo ""
    echo "**Generated:** $(date '+%Y-%m-%d %H:%M:%S')"
    echo "**Tasks:** ${#DG_TASK_ORDER[@]}"
    echo "**Waves:** $(get_max_wave)"
    echo ""
    echo "## Execution Waves"
    echo ""
    echo "Tasks grouped by execution wave. All tasks in a wave can run in parallel."
    echo ""

    local max_wave=$(get_max_wave)
    for ((wave=1; wave<=max_wave; wave++)); do
        echo "### Wave $wave"
        echo ""

        local wave_tasks=$(get_wave_tasks "$wave")

        if [[ -n "$wave_tasks" ]]; then
            echo "| Task | Agent | Dependencies |"
            echo "|------|-------|--------------|"

            for task_id in $wave_tasks; do
                local task_data="${DG_TASKS[$task_id]}"
                local agent="-"
                local deps="${DG_DEPS[$task_id]:-}"
                deps="${deps// /, }"
                deps="${deps%, }"
                [[ -z "$deps" ]] && deps="-"

                if [[ "$task_data" =~ agent:([a-z0-9-]+) ]]; then
                    agent="${BASH_REMATCH[1]}"
                fi

                echo "| \`$task_id\` | $agent | $deps |"
            done
            echo ""
        fi
    done

    echo "## Dependency Flow"
    echo ""
    echo "\`\`\`"

    # Simple ASCII visualization
    for ((wave=1; wave<=max_wave; wave++)); do
        local wave_tasks=$(get_wave_tasks "$wave")
        local task_count=$(echo "$wave_tasks" | wc -w)

        printf "Wave %d: " "$wave"

        local first=true
        for task_id in $wave_tasks; do
            if [[ "$first" == true ]]; then
                printf "[%s]" "$task_id"
                first=false
            else
                printf " + [%s]" "$task_id"
            fi
        done
        echo ""

        if [[ $wave -lt $max_wave ]]; then
            echo "    |"
            echo "    v"
        fi
    done

    echo "\`\`\`"
    echo ""
    echo "## Legend"
    echo ""
    echo "- **Wave N**: Tasks that can execute after Wave N-1 completes"
    echo "- **+**: Tasks in same wave can run in parallel"
    echo "- Tasks with same dependencies are automatically grouped"
}

# Output JSON format (for API consumption)
output_json() {
    echo "{"
    echo "  \"workflow\": \"$DG_WORKFLOW_NAME\","
    echo "  \"total_tasks\": ${#DG_TASK_ORDER[@]},"
    echo "  \"total_waves\": $(get_max_wave),"
    echo "  \"waves\": ["

    local max_wave=$(get_max_wave)
    for ((wave=1; wave<=max_wave; wave++)); do
        echo "    {"
        echo "      \"wave\": $wave,"
        echo "      \"tasks\": ["

        local wave_tasks=$(get_wave_tasks "$wave")
        local first=true

        for task_id in $wave_tasks; do
            [[ "$first" != true ]] && echo ","
            first=false

            local task_data="${DG_TASKS[$task_id]}"
            local agent="null"
            local task_type="null"
            local deps="${DG_DEPS[$task_id]:-}"

            if [[ "$task_data" =~ agent:([a-z0-9-]+) ]]; then
                agent="\"${BASH_REMATCH[1]}\""
            fi

            if [[ "$task_data" =~ type:([a-z-]+) ]]; then
                task_type="\"${BASH_REMATCH[1]}\""
            fi

            # Format dependencies as JSON array
            local deps_json="[]"
            if [[ -n "${deps// /}" ]]; then
                deps_json="[$(echo $deps | sed 's/ *$//;s/ /", "/g;s/^/"/;s/$/"/')]"
            fi

            printf '        {"id": "%s", "agent": %s, "type": %s, "depends_on": %s}' \
                "$task_id" "$agent" "$task_type" "$deps_json"
        done

        echo ""
        echo "      ]"

        if [[ $wave -lt $max_wave ]]; then
            echo "    },"
        else
            echo "    }"
        fi
    done

    echo "  ]"
    echo "}"
}

# ============================================================================
# Main API Functions
# ============================================================================

# Build and validate complete dependency graph
# Returns 0 on success, 1 on error
build_graph() {
    local workflow_file="$1"

    # Step 1: Parse workflow
    if ! parse_workflow "$workflow_file"; then
        dg_log ERROR "Parse failed: $DG_ERROR_MSG"
        return 1
    fi

    # Step 2: Validate no forward references
    if ! validate_no_forward_refs; then
        dg_log ERROR "Validation failed: $DG_ERROR_MSG"
        return 1
    fi

    # Step 3: Detect cycles
    if ! detect_cycles; then
        dg_log ERROR "Cycle detection failed: $DG_ERROR_MSG"
        return 1
    fi

    # Step 4: Compute execution waves
    if ! compute_waves; then
        dg_log ERROR "Wave computation failed: $DG_ERROR_MSG"
        return 1
    fi

    dg_log INFO "Graph built successfully: ${#DG_TASK_ORDER[@]} tasks, $(get_max_wave) waves"
    return 0
}

# Get graph summary
get_graph_summary() {
    echo "workflow=$DG_WORKFLOW_NAME"
    echo "tasks=${#DG_TASK_ORDER[@]}"
    echo "waves=$(get_max_wave)"
}

# Get last error message
get_error() {
    echo "$DG_ERROR_MSG"
}

# ============================================================================
# CLI Interface
# ============================================================================

show_help() {
    cat << 'EOF'
Dependency Graph Builder - Epic 04, Story 4.1

Usage:
  ./dependency-graph.sh [OPTIONS] <workflow-file>

Options:
  --parse           Parse workflow and show task list
  --validate        Validate workflow (cycles, forward refs)
  --waves           Compute and show execution waves
  --yaml            Output full graph as YAML
  --visual          Output visual graph as Markdown
  --json            Output graph as JSON
  --summary         Show brief summary
  --help            Show this help
  --version         Show version

Examples:
  ./dependency-graph.sh --validate workflow.yaml
  ./dependency-graph.sh --waves workflow.yaml
  ./dependency-graph.sh --visual workflow.yaml > graph.md
  ./dependency-graph.sh --json workflow.yaml | jq .

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
    workflow_file=""

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --parse)
                action="parse"
                shift
                ;;
            --validate)
                action="validate"
                shift
                ;;
            --waves)
                action="waves"
                shift
                ;;
            --yaml)
                action="yaml"
                shift
                ;;
            --visual)
                action="visual"
                shift
                ;;
            --json)
                action="json"
                shift
                ;;
            --summary)
                action="summary"
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            --version)
                echo "dependency-graph.sh version $DG_VERSION"
                exit 0
                ;;
            -*)
                echo "Unknown option: $1" >&2
                exit 1
                ;;
            *)
                workflow_file="$1"
                shift
                ;;
        esac
    done

    if [[ -z "$workflow_file" ]]; then
        echo "Error: No workflow file specified" >&2
        exit 1
    fi

    case "$action" in
        parse)
            if parse_workflow "$workflow_file"; then
                echo "Tasks parsed: ${#DG_TASK_ORDER[@]}"
                for task_id in "${DG_TASK_ORDER[@]}"; do
                    echo "  - $task_id: ${DG_TASKS[$task_id]}"
                done
            else
                echo "Error: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        validate)
            if build_graph "$workflow_file"; then
                echo "Validation passed: ${#DG_TASK_ORDER[@]} tasks, no cycles, no forward refs"
            else
                echo "Validation failed: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        waves)
            if build_graph "$workflow_file"; then
                max_wave_num=$(get_max_wave)
                echo "Execution Waves:"
                for ((wave_num=1; wave_num<=max_wave_num; wave_num++)); do
                    echo "  Wave $wave_num: $(get_wave_tasks $wave_num)"
                done
            else
                echo "Error: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        yaml)
            if build_graph "$workflow_file"; then
                output_yaml
            else
                echo "Error: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        visual)
            if build_graph "$workflow_file"; then
                output_visual
            else
                echo "Error: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        json)
            if build_graph "$workflow_file"; then
                output_json
            else
                echo "# Error: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        summary)
            if build_graph "$workflow_file"; then
                get_graph_summary
            else
                echo "Error: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
        *)
            # Default: validate and show summary
            if build_graph "$workflow_file"; then
                echo "Graph valid: $(get_graph_summary | tr '\n' ', ' | sed 's/, $//')"
            else
                echo "Error: $DG_ERROR_MSG" >&2
                exit 1
            fi
            ;;
    esac
fi
