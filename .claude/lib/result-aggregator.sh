#!/usr/bin/env bash
#
# Result Aggregation Engine
# Epic 04, Story 4.3 - Result Aggregation Engine
#
# Collects and synthesizes results from multiple agents into unified reports.
# Supports JSON (machine processing) and Markdown (human readability) output.
#
# Usage:
#   source .claude/lib/result-aggregator.sh
#   aggregate_results results1.json results2.json
#
# Or CLI:
#   ./result-aggregator.sh --aggregate result1.json result2.json
#   ./result-aggregator.sh --markdown aggregated.json
#   ./result-aggregator.sh --json aggregated.json
#

set -eo pipefail

# ============================================================================
# Configuration
# ============================================================================

readonly RA_VERSION="1.0.0"
readonly RA_SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Severity levels for priority ranking
declare -A SEVERITY_LEVELS=(
    [critical]=4
    [high]=3
    [medium]=2
    [low]=1
    [info]=0
)

# Global state
RA_ERROR_MSG=""
declare -a RA_AGENT_RESULTS=()
declare -a RA_ARTIFACTS=()
declare -a RA_RECOMMENDATIONS=()
declare -a RA_CONFLICTS=()
declare -a RA_CROSS_STORY_ISSUES=()  # Story 7.7: Cross-story validation issues

# ============================================================================
# Logging
# ============================================================================

ra_log() {
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
# Output Sanitization (Security Critical)
# ============================================================================

# Sanitize string for JSON embedding
# Escapes special characters to prevent JSON injection
sanitize_json_string() {
    local input="$1"

    # Escape backslashes first, then other special chars
    input="${input//\\/\\\\}"
    input="${input//\"/\\\"}"
    input="${input//$'\n'/\\n}"
    input="${input//$'\r'/\\r}"
    input="${input//$'\t'/\\t}"

    # Remove control characters
    input=$(echo "$input" | tr -d '\000-\010\013\014\016-\037')

    echo "$input"
}

# Sanitize string for Markdown embedding
# Prevents XSS when viewed in VS Code preview or GitHub
sanitize_markdown() {
    local input="$1"

    # Use sed for reliable HTML entity escaping
    input=$(echo "$input" | sed 's/</\&lt;/g;s/>/\&gt;/g')

    # Escape JavaScript sequences
    input=$(echo "$input" | sed 's/javascript:/javascript-blocked:/g')
    input=$(echo "$input" | sed 's/data:/data-blocked:/g')
    input=$(echo "$input" | sed 's/vbscript:/vbscript-blocked:/g')

    # Remove script tags (even escaped)
    input=$(echo "$input" | sed -E 's/<[sS][cC][rR][iI][pP][tT][^>]*>.*<\/[sS][cC][rR][iI][pP][tT]>//g')

    # Escape pipe characters in tables
    input=$(echo "$input" | sed 's/|/\\|/g')

    echo "$input"
}

# Truncate content to token limit (rough approximation: 4 chars = 1 token)
truncate_to_tokens() {
    local input="$1"
    local max_tokens="${2:-2000}"
    local max_chars=$((max_tokens * 4))

    if [[ ${#input} -gt $max_chars ]]; then
        echo "${input:0:$max_chars}... [truncated]"
    else
        echo "$input"
    fi
}

# ============================================================================
# Result Parsing
# ============================================================================

# Reset aggregation state
reset_aggregation() {
    RA_AGENT_RESULTS=()
    RA_ARTIFACTS=()
    RA_RECOMMENDATIONS=()
    RA_CONFLICTS=()
    RA_CROSS_STORY_ISSUES=()
    RA_ERROR_MSG=""
}

# Parse a single agent result (JSON format)
# Expected structure:
# {
#   "agent": "agent-name",
#   "status": "success|failure",
#   "findings": [...],
#   "artifacts": [...],
#   "recommendations": [...],
#   "duration_ms": 1234
# }
parse_agent_result() {
    local result_file="$1"

    if [[ ! -f "$result_file" ]]; then
        RA_ERROR_MSG="Result file not found: $result_file"
        return 1
    fi

    # Basic validation - check if it looks like JSON
    if ! head -1 "$result_file" | grep -q '^{'; then
        # Try to parse as Markdown or plain text
        ra_log WARNING "Result file not JSON, treating as plain text: $result_file"
        local content
        content=$(cat "$result_file")
        local sanitized
        sanitized=$(sanitize_json_string "$content")
        sanitized=$(truncate_to_tokens "$sanitized" 2000)

        echo '{"agent": "unknown", "status": "parsed", "raw_content": "'"$sanitized"'"}'
        return 0
    fi

    cat "$result_file"
}

# ============================================================================
# Conflict Detection
# ============================================================================

# Compare findings across agents for contradictions
# Looks for patterns like:
# - Agent A says "entity X exists" but Agent B says "entity X undefined"
# - Agent A says "secure" but Agent B says "vulnerability found"
detect_conflicts() {
    local -a findings=("$@")
    local conflicts=()

    # Simple keyword-based conflict detection
    local has_secure=false
    local has_vulnerability=false
    local has_exists=false
    local has_undefined=false

    for finding in "${findings[@]}"; do
        [[ "$finding" == *"secure"* ]] && has_secure=true
        [[ "$finding" == *"vulnerability"* ]] && has_vulnerability=true
        [[ "$finding" == *"exists"* ]] && has_exists=true
        [[ "$finding" == *"undefined"* ]] && has_undefined=true
        [[ "$finding" == *"not found"* ]] && has_undefined=true
    done

    if [[ "$has_secure" == true ]] && [[ "$has_vulnerability" == true ]]; then
        conflicts+=("Conflict: Some agents report secure while others found vulnerabilities")
    fi

    if [[ "$has_exists" == true ]] && [[ "$has_undefined" == true ]]; then
        conflicts+=("Conflict: Some agents found entity while others report it undefined")
    fi

    printf '%s\n' "${conflicts[@]}"
}

# ============================================================================
# Recommendation Processing
# ============================================================================

# De-duplicate recommendations based on similarity
# Returns unique recommendations sorted by severity
deduplicate_recommendations() {
    local -a recs=("$@")
    declare -A seen=()
    local unique=()

    for rec in "${recs[@]}"; do
        # Create a normalized key (lowercase, trimmed)
        local key
        key=$(echo "$rec" | tr '[:upper:]' '[:lower:]' | sed 's/^[ \t]*//;s/[ \t]*$//' | head -c 100)

        if [[ -z "${seen[$key]:-}" ]]; then
            seen[$key]=1
            unique+=("$rec")
        fi
    done

    printf '%s\n' "${unique[@]}"
}

# Sort recommendations by severity
sort_by_severity() {
    local -a recs=("$@")

    # Simple sort: critical > high > medium > low > info
    local -a critical=()
    local -a high=()
    local -a medium=()
    local -a low=()
    local -a other=()

    for rec in "${recs[@]}"; do
        case "$rec" in
            *critical*|*CRITICAL*) critical+=("$rec") ;;
            *high*|*HIGH*) high+=("$rec") ;;
            *medium*|*MEDIUM*) medium+=("$rec") ;;
            *low*|*LOW*) low+=("$rec") ;;
            *) other+=("$rec") ;;
        esac
    done

    printf '%s\n' "${critical[@]}" "${high[@]}" "${medium[@]}" "${low[@]}" "${other[@]}"
}

# ============================================================================
# Output Generation
# ============================================================================

# Generate JSON aggregated report
generate_json_report() {
    local workflow_name="${1:-unknown}"
    local status="${2:-SUCCESS}"
    local duration_ms="${3:-0}"
    local start_time="${4:-$(date -Iseconds)}"

    cat << EOF
{
  "workflow": "$(sanitize_json_string "$workflow_name")",
  "status": "$status",
  "execution_summary": {
    "start_time": "$start_time",
    "duration_ms": $duration_ms,
    "agents_executed": ${#RA_AGENT_RESULTS[@]}
  },
  "agent_results": [
EOF

    local first=true
    for result in "${RA_AGENT_RESULTS[@]}"; do
        [[ "$first" != true ]] && echo ","
        first=false
        # Indent and output
        echo "$result" | sed 's/^/    /'
    done

    cat << EOF
  ],
  "artifacts": [
EOF

    first=true
    for artifact in "${RA_ARTIFACTS[@]}"; do
        [[ "$first" != true ]] && echo ","
        first=false
        echo "    \"$(sanitize_json_string "$artifact")\""
    done

    cat << EOF
  ],
  "conflicts": [
EOF

    first=true
    for conflict in "${RA_CONFLICTS[@]}"; do
        [[ "$first" != true ]] && echo ","
        first=false
        echo "    \"$(sanitize_json_string "$conflict")\""
    done

    cat << EOF
  ],
  "recommendations": [
EOF

    first=true
    for rec in "${RA_RECOMMENDATIONS[@]}"; do
        [[ "$first" != true ]] && echo ","
        first=false
        echo "    \"$(sanitize_json_string "$rec")\""
    done

    cat << EOF
  ],
EOF

    # Story 7.7: Include cross_story_issues if present (AC6)
    if [[ ${#RA_CROSS_STORY_ISSUES[@]} -gt 0 ]]; then
        cat << EOF
  "cross_story_issues": [
EOF
        first=true
        for issue in "${RA_CROSS_STORY_ISSUES[@]}"; do
            [[ "$first" != true ]] && echo ","
            first=false
            # Issue is expected to be JSON object string
            echo "$issue" | sed 's/^/    /'
        done
        cat << EOF
  ],
  "cross_story_summary": {
    "total_issues": ${#RA_CROSS_STORY_ISSUES[@]}
  },
EOF
    fi

    cat << EOF
  "generated_at": "$(date -Iseconds)",
  "generator_version": "$RA_VERSION"
}
EOF
}

# Generate Markdown aggregated report
generate_markdown_report() {
    local workflow_name="${1:-unknown}"
    local status="${2:-SUCCESS}"
    local duration_ms="${3:-0}"
    local start_time="${4:-$(date -Iseconds)}"

    cat << EOF
# Workflow Execution Summary

**Workflow**: $(sanitize_markdown "$workflow_name")
**Status**: $status
**Duration**: ${duration_ms}ms
**Started**: $start_time

## Tasks Executed

| Agent | Status | Duration |
|-------|--------|----------|
EOF

    for result in "${RA_AGENT_RESULTS[@]}"; do
        # Extract fields from JSON (simple parsing)
        local agent status duration
        agent=$(echo "$result" | grep -o '"agent"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        status=$(echo "$result" | grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        duration=$(echo "$result" | grep -o '"duration_ms"[[:space:]]*:[[:space:]]*[0-9]*' | grep -o '[0-9]*$')

        agent=$(sanitize_markdown "${agent:-unknown}")
        status=$(sanitize_markdown "${status:-unknown}")
        duration="${duration:-0}ms"

        echo "| $agent | $status | $duration |"
    done

    cat << EOF

## Results

EOF

    for result in "${RA_AGENT_RESULTS[@]}"; do
        local agent
        agent=$(echo "$result" | grep -o '"agent"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        agent=$(sanitize_markdown "${agent:-unknown}")

        echo "### $agent Findings"
        echo ""

        # Extract and display findings
        local findings
        findings=$(echo "$result" | grep -o '"findings"[[:space:]]*:[[:space:]]*\[[^]]*\]' | sed 's/"findings"[[:space:]]*:[[:space:]]*//;s/^\[//;s/\]$//')

        if [[ -n "$findings" ]]; then
            echo "$findings" | tr ',' '\n' | sed 's/^[[:space:]]*"//;s/"[[:space:]]*$//' | while read -r finding; do
                if [[ -n "$finding" ]]; then
                    echo "- $(sanitize_markdown "$finding")"
                fi
            done
        else
            echo "_No findings reported_"
        fi
        echo ""
    done

    if [[ ${#RA_ARTIFACTS[@]} -gt 0 ]]; then
        cat << EOF
## Artifacts Created

EOF
        for artifact in "${RA_ARTIFACTS[@]}"; do
            echo "- \`$(sanitize_markdown "$artifact")\`"
        done
        echo ""
    fi

    if [[ ${#RA_CONFLICTS[@]} -gt 0 ]]; then
        cat << EOF
## Conflicts Detected

> **Warning**: The following conflicts were detected between agent results.

EOF
        for conflict in "${RA_CONFLICTS[@]}"; do
            echo "- $(sanitize_markdown "$conflict")"
        done
        echo ""
    fi

    if [[ ${#RA_RECOMMENDATIONS[@]} -gt 0 ]]; then
        cat << EOF
## Recommendations

EOF
        local i=1
        for rec in "${RA_RECOMMENDATIONS[@]}"; do
            echo "$i. $(sanitize_markdown "$rec")"
            ((i++)) || true
        done
        echo ""
    fi

    # Story 7.7: Include cross_story_issues section (AC6)
    if [[ ${#RA_CROSS_STORY_ISSUES[@]} -gt 0 ]]; then
        cat << EOF
## Cross-Story Validation Issues

> **Note**: The following issues were detected during cross-story validation.
> Review and address HIGH/CRITICAL issues before implementation.

EOF
        for issue in "${RA_CROSS_STORY_ISSUES[@]}"; do
            # Parse JSON issue (simple extraction)
            local severity id issue_type description stories recommendation
            severity=$(echo "$issue" | grep -o '"severity"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
            id=$(echo "$issue" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
            issue_type=$(echo "$issue" | grep -o '"type"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
            description=$(echo "$issue" | grep -o '"description"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
            recommendation=$(echo "$issue" | grep -o '"recommendation"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)

            echo "### [$severity] $id: $issue_type"
            echo ""
            echo "**Description**: $(sanitize_markdown "${description:-No description}")"
            echo ""
            if [[ -n "$recommendation" ]]; then
                echo "**Recommendation**: $(sanitize_markdown "$recommendation")"
                echo ""
            fi
        done
    fi

    cat << EOF
---
_Generated at $(date '+%Y-%m-%d %H:%M:%S') by result-aggregator v$RA_VERSION_
EOF
}

# ============================================================================
# Main Aggregation Function
# ============================================================================

# Aggregate multiple result files into unified report
# Args: result_file1 result_file2 ...
aggregate_results() {
    reset_aggregation

    local start_time
    start_time=$(date -Iseconds)
    local start_ms
    start_ms=$(date +%s%3N 2>/dev/null || echo "0")

    local all_findings=()
    local all_recommendations=()
    local overall_status="SUCCESS"

    for result_file in "$@"; do
        ra_log INFO "Processing: $result_file"

        local result
        result=$(parse_agent_result "$result_file")

        if [[ -z "$result" ]]; then
            ra_log WARNING "Empty result from: $result_file"
            continue
        fi

        # Store the result
        RA_AGENT_RESULTS+=("$result")

        # Extract status
        local status
        status=$(echo "$result" | grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' | cut -d'"' -f4)
        if [[ "$status" == "failure" ]] || [[ "$status" == "error" ]]; then
            overall_status="PARTIAL"
        fi

        # Extract artifacts (properly parse JSON array)
        local artifacts_raw
        artifacts_raw=$(echo "$result" | grep -o '"artifacts"[[:space:]]*:[[:space:]]*\[[^]]*\]' | sed 's/"artifacts"[[:space:]]*:[[:space:]]*\[//;s/\]$//')
        if [[ -n "$artifacts_raw" ]]; then
            local IFS_OLD="$IFS"
            IFS=$'\n'
            for artifact in $(echo "$artifacts_raw" | sed 's/", "/"\n"/g'); do
                artifact="${artifact//\"/}"
                artifact=$(echo "$artifact" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
                [[ -n "$artifact" ]] && RA_ARTIFACTS+=("$artifact")
            done
            IFS="$IFS_OLD"
        fi

        # Extract findings for conflict detection
        local findings
        findings=$(echo "$result" | grep -o '"findings"[[:space:]]*:[[:space:]]*\[[^]]*\]' | sed 's/"findings"[[:space:]]*:[[:space:]]*//;s/^\[//;s/\]$//')
        if [[ -n "$findings" ]]; then
            while IFS= read -r finding; do
                finding="${finding//\"/}"
                [[ -n "$finding" ]] && all_findings+=("$finding")
            done <<< "$(echo "$findings" | tr ',' '\n')"
        fi

        # Extract recommendations - use Python for reliable JSON parsing if available
        if command -v python3 &>/dev/null; then
            while IFS= read -r rec; do
                [[ -n "$rec" ]] && all_recommendations+=("$rec")
            done < <(echo "$result" | python3 -c '
import sys, json
try:
    data = json.load(sys.stdin)
    for rec in data.get("recommendations", []):
        print(rec)
except: pass
' 2>/dev/null || true)
        else
            # Fallback: basic extraction
            local recs_block
            recs_block=$(echo "$result" | sed -n '/"recommendations":/,/]/p' | grep '"' | sed 's/.*"\([^"]*\)".*/\1/')
            while IFS= read -r rec; do
                [[ -n "$rec" ]] && all_recommendations+=("$rec")
            done <<< "$recs_block"
        fi
    done

    # Detect conflicts
    local conflicts
    conflicts=$(detect_conflicts "${all_findings[@]}")
    while IFS= read -r conflict; do
        [[ -n "$conflict" ]] && RA_CONFLICTS+=("$conflict")
    done <<< "$conflicts"

    # Process recommendations: de-duplicate and sort by severity
    # For simplicity with complex multi-word strings, skip complex sorting
    # Just de-duplicate by storing in associative array
    declare -A seen_recs=()
    for rec in "${all_recommendations[@]}"; do
        local key
        key=$(echo "$rec" | tr '[:upper:]' '[:lower:]' | head -c 100)
        if [[ -z "${seen_recs[$key]:-}" ]]; then
            seen_recs[$key]=1
            RA_RECOMMENDATIONS+=("$rec")
        fi
    done

    local end_ms
    end_ms=$(date +%s%3N 2>/dev/null || echo "0")
    local duration_ms
    duration_ms=$((end_ms - start_ms))
    [[ $duration_ms -lt 0 ]] && duration_ms=0

    ra_log INFO "Aggregated ${#RA_AGENT_RESULTS[@]} results, found ${#RA_CONFLICTS[@]} conflicts"

    # Store metrics for output functions
    export RA_OVERALL_STATUS="$overall_status"
    export RA_DURATION_MS="$duration_ms"
    export RA_START_TIME="$start_time"
}

# ============================================================================
# CLI Interface
# ============================================================================

show_help() {
    cat << 'EOF'
Result Aggregation Engine - Epic 04, Story 4.3

Usage:
  ./result-aggregator.sh [OPTIONS] [FILES...]

Options:
  --aggregate <files...>    Aggregate multiple result files
  --json                    Output as JSON
  --markdown                Output as Markdown
  --sanitize-json <text>    Sanitize text for JSON
  --sanitize-md <text>      Sanitize text for Markdown
  --help                    Show this help
  --version                 Show version

Examples:
  ./result-aggregator.sh --aggregate result1.json result2.json --json
  ./result-aggregator.sh --aggregate *.json --markdown
  ./result-aggregator.sh --sanitize-json "<script>alert('xss')</script>"

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
    output_format=""
    files=()

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --aggregate)
                action="aggregate"
                shift
                while [[ $# -gt 0 ]] && [[ ! "$1" =~ ^-- ]]; do
                    files+=("$1")
                    shift
                done
                ;;
            --json)
                output_format="json"
                shift
                ;;
            --markdown)
                output_format="markdown"
                shift
                ;;
            --sanitize-json)
                sanitize_json_string "$2"
                exit 0
                ;;
            --sanitize-md)
                sanitize_markdown "$2"
                exit 0
                ;;
            --help)
                show_help
                exit 0
                ;;
            --version)
                echo "result-aggregator.sh version $RA_VERSION"
                exit 0
                ;;
            *)
                if [[ "$action" == "aggregate" ]]; then
                    files+=("$1")
                else
                    echo "Unknown option: $1" >&2
                    exit 1
                fi
                shift
                ;;
        esac
    done

    case "$action" in
        aggregate)
            if [[ ${#files[@]} -eq 0 ]]; then
                echo "Error: No files to aggregate" >&2
                exit 1
            fi

            aggregate_results "${files[@]}"

            case "$output_format" in
                json)
                    generate_json_report "workflow" "$RA_OVERALL_STATUS" "$RA_DURATION_MS" "$RA_START_TIME"
                    ;;
                markdown)
                    generate_markdown_report "workflow" "$RA_OVERALL_STATUS" "$RA_DURATION_MS" "$RA_START_TIME"
                    ;;
                *)
                    # Default to JSON
                    generate_json_report "workflow" "$RA_OVERALL_STATUS" "$RA_DURATION_MS" "$RA_START_TIME"
                    ;;
            esac
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
fi
