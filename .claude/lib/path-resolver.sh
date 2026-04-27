#!/usr/bin/env bash
# path-resolver.sh - Universal path resolution for Claude Code micro-agents
#
# Implements FR-12 (Template Variables), FR-13 (Project Discovery Algorithm),
# and FR-14 (Portability Requirements) from the Universal Claude Code Micro-Agent Framework PRD.
#
# Usage:
#   source path-resolver.sh
#   discover_project_root
#   echo "$PROJECT_ROOT"
#
#   # Resolve template variables
#   resolve_template "{project_root}/docs/{date}"
#
# Or as a standalone:
#   ./path-resolver.sh [--root|--context|--agents|--templates|--resolve "template"]

set -euo pipefail

# Cache for discovered paths (prevents repeated git calls)
declare -g PROJECT_ROOT=""
declare -g PROJECT_ROOT_CACHED=false
declare -g GIT_AVAILABLE=""

# Cache for dynamic variables (consistency within invocation)
declare -g CACHED_TIMESTAMP=""
declare -g CACHED_DATE=""
declare -g CACHED_GIT_BRANCH=""
declare -g CACHED_USER=""

# Valid template variables from FR-12
declare -a VALID_VARIABLES=(
    "project_root"
    "context_dir"
    "agents_dir"
    "commands_dir"
    "templates_dir"
    "current_dir"
    "timestamp"
    "date"
    "user"
    "git_branch"
)

# Lock file for concurrent skeleton creation
LOCK_FILE="/tmp/.claude-skeleton-creation.lock"
LOCK_TIMEOUT=30

# ============================================================================
# Core Functions
# ============================================================================

# Check if git is available on the system
check_git_available() {
    if [[ -z "$GIT_AVAILABLE" ]]; then
        if command -v git &>/dev/null; then
            GIT_AVAILABLE="true"
        else
            GIT_AVAILABLE="false"
            log_warning "Git command not available. Falling back to current directory for project root."
        fi
    fi
    [[ "$GIT_AVAILABLE" == "true" ]]
}

# Discover the project root directory
# Implements FR-13 steps 1-4
discover_project_root() {
    # Return cached value if available
    if [[ "$PROJECT_ROOT_CACHED" == "true" && -n "$PROJECT_ROOT" ]]; then
        echo "$PROJECT_ROOT"
        return 0
    fi

    local root=""

    # Check for environment variable override first
    if [[ -n "${CLAUDE_PROJECT_ROOT:-}" ]]; then
        root="$CLAUDE_PROJECT_ROOT"
        log_info "Using PROJECT_ROOT from environment variable: $root"
    elif check_git_available; then
        # Try to get git repository root
        if root=$(git rev-parse --show-toplevel 2>/dev/null); then
            log_debug "Discovered project root via git: $root"
        else
            # Not in a git repository - use fallback
            root="$(pwd)"
            log_warning "Not in a git repository. Using current directory as project root: $root"
        fi
    else
        # Git not available - use current directory
        root="$(pwd)"
    fi

    # Cache the result
    PROJECT_ROOT="$root"
    PROJECT_ROOT_CACHED=true

    # Ensure .claude directory exists (FR-13 step 4)
    # This may fail if auto-create is disabled, but we still return the root
    ensure_claude_directory "$root" || true

    echo "$root"
}

# Ensure the .claude directory structure exists
# Creates skeleton if missing (FR-8)
ensure_claude_directory() {
    local root="${1:-$PROJECT_ROOT}"
    local claude_dir="$root/.claude"

    if [[ -d "$claude_dir" ]]; then
        log_debug ".claude directory already exists at $claude_dir"
        return 0
    fi

    # Check for CI/CD mode that disables auto-creation
    if [[ "${CLAUDE_DISABLE_AUTO_CREATE:-false}" == "true" ]]; then
        log_error ".claude directory does not exist and auto-creation is disabled (CLAUDE_DISABLE_AUTO_CREATE=true)"
        return 1
    fi

    # Use lock for concurrent safety (AC5)
    create_skeleton_with_lock "$root"
}

# Create skeleton with file lock for concurrency safety
create_skeleton_with_lock() {
    local root="$1"
    local lock_acquired=false

    # Try to acquire lock
    if mkdir "$LOCK_FILE" 2>/dev/null; then
        lock_acquired=true
        trap 'rmdir "$LOCK_FILE" 2>/dev/null || true' EXIT
    else
        # Lock exists - wait for it
        local wait_time=0
        while [[ -d "$LOCK_FILE" && $wait_time -lt $LOCK_TIMEOUT ]]; do
            sleep 1
            ((wait_time++))
        done

        if [[ -d "$LOCK_FILE" ]]; then
            log_warning "Lock timeout reached. Another process may be creating the skeleton."
        fi

        # Check if skeleton was created by another process
        if [[ -d "$root/.claude" ]]; then
            log_info "Skeleton structure was created by another process."
            return 0
        fi

        # Try to acquire lock again
        if mkdir "$LOCK_FILE" 2>/dev/null; then
            lock_acquired=true
            trap 'rmdir "$LOCK_FILE" 2>/dev/null || true' EXIT
        fi
    fi

    # Double-check in case another process created it
    if [[ -d "$root/.claude" ]]; then
        [[ "$lock_acquired" == "true" ]] && rmdir "$LOCK_FILE" 2>/dev/null || true
        return 0
    fi

    # Create skeleton structure
    create_skeleton_structure "$root"

    # Release lock
    [[ "$lock_acquired" == "true" ]] && rmdir "$LOCK_FILE" 2>/dev/null || true
}

# Create the skeleton directory structure per FR-8
create_skeleton_structure() {
    local root="$1"
    local claude_dir="$root/.claude"

    log_info "Creating .claude skeleton structure at $claude_dir"

    # Create directory structure
    mkdir -p "$claude_dir/context/decisions"
    mkdir -p "$claude_dir/context/coordination"
    mkdir -p "$claude_dir/context/templates"
    mkdir -p "$claude_dir/context/archive"
    mkdir -p "$claude_dir/agents"
    mkdir -p "$claude_dir/commands"
    mkdir -p "$claude_dir/lib"

    # Create placeholder README files
    echo "# Context Directory" > "$claude_dir/context/README.md"
    echo "" >> "$claude_dir/context/README.md"
    echo "This directory contains agent coordination files and templates." >> "$claude_dir/context/README.md"
    echo "See the PRD for directory structure details." >> "$claude_dir/context/README.md"

    echo "# Archive" > "$claude_dir/context/archive/README.md"
    echo "" >> "$claude_dir/context/archive/README.md"
    echo "Archived context files (90+ days old) are stored here." >> "$claude_dir/context/archive/README.md"

    echo "# Decisions" > "$claude_dir/context/decisions/README.md"
    echo "" >> "$claude_dir/context/decisions/README.md"
    echo "Architecture decision records for agent reference." >> "$claude_dir/context/decisions/README.md"

    # Create task-queue.yaml
    cat > "$claude_dir/context/coordination/task-queue.yaml" << 'EOF'
# Task Queue - Multi-agent coordination
# Format: YAML
# Updated by orchestrator agent

version: "1.0"
tasks: []
last_updated: null
EOF

    # Create memory-bank.md
    cat > "$claude_dir/context/coordination/memory-bank.md" << 'EOF'
---
type: memory-bank
id: shared-learnings
status: active
created_at: null
updated_at: null
---

# Memory Bank

Shared learnings and patterns discovered by agents.

## Lessons Learned

<!-- Add lessons learned here -->

## Patterns

<!-- Add discovered patterns here -->

## Warnings

<!-- Add warnings and anti-patterns here -->
EOF

    log_info "Skeleton structure created successfully:"
    log_info "  - $claude_dir/context/ (coordination files)"
    log_info "  - $claude_dir/agents/ (agent definitions)"
    log_info "  - $claude_dir/commands/ (slash commands)"
    log_info "  - $claude_dir/lib/ (shared utilities)"
}

# ============================================================================
# Path Resolution Functions
# ============================================================================

# Get the context directory path
get_context_dir() {
    local root
    root=$(discover_project_root)
    echo "$root/.claude/context"
}

# Get the agents directory path
get_agents_dir() {
    local root
    root=$(discover_project_root)
    echo "$root/.claude/agents"
}

# Get the commands directory path
get_commands_dir() {
    local root
    root=$(discover_project_root)
    echo "$root/.claude/commands"
}

# Get the templates directory path
get_templates_dir() {
    local root
    root=$(discover_project_root)
    echo "$root/.claude/context/templates"
}

# Get the lib directory path
get_lib_dir() {
    local root
    root=$(discover_project_root)
    echo "$root/.claude/lib"
}

# ============================================================================
# Template Variable Resolution (FR-12)
# ============================================================================

# Get the current git branch (with fallback to "main")
get_git_branch() {
    # Return cached value if available
    if [[ -n "$CACHED_GIT_BRANCH" ]]; then
        echo "$CACHED_GIT_BRANCH"
        return 0
    fi

    local branch="main"

    if check_git_available; then
        if branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null); then
            log_debug "Git branch detected: $branch"
        else
            branch="main"
            log_debug "Not in git repo, using default branch: main"
        fi
    else
        log_debug "Git not available, using default branch: main"
    fi

    CACHED_GIT_BRANCH="$branch"
    echo "$branch"
}

# Get the current timestamp in ISO 8601 format
get_timestamp() {
    if [[ -n "$CACHED_TIMESTAMP" ]]; then
        echo "$CACHED_TIMESTAMP"
        return 0
    fi

    CACHED_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    echo "$CACHED_TIMESTAMP"
}

# Get the current date in YYYY-MM-DD format
get_date() {
    if [[ -n "$CACHED_DATE" ]]; then
        echo "$CACHED_DATE"
        return 0
    fi

    CACHED_DATE=$(date +"%Y-%m-%d")
    echo "$CACHED_DATE"
}

# Get the current system user
get_user() {
    if [[ -n "$CACHED_USER" ]]; then
        echo "$CACHED_USER"
        return 0
    fi

    CACHED_USER="${USER:-$(whoami)}"
    echo "$CACHED_USER"
}

# Get the current working directory
get_current_dir() {
    pwd
}

# Check if a variable name is valid (in FR-12 list)
is_valid_variable() {
    local var_name="$1"
    for valid_var in "${VALID_VARIABLES[@]}"; do
        if [[ "$valid_var" == "$var_name" ]]; then
            return 0
        fi
    done
    return 1
}

# Get the value of a single template variable
# Returns: the resolved value, or empty string with error exit code
get_variable_value() {
    local var_name="$1"

    case "$var_name" in
        project_root)
            discover_project_root
            ;;
        context_dir)
            get_context_dir
            ;;
        agents_dir)
            get_agents_dir
            ;;
        commands_dir)
            get_commands_dir
            ;;
        templates_dir)
            get_templates_dir
            ;;
        current_dir)
            get_current_dir
            ;;
        timestamp)
            get_timestamp
            ;;
        date)
            get_date
            ;;
        user)
            get_user
            ;;
        git_branch)
            get_git_branch
            ;;
        *)
            return 1
            ;;
    esac
}

# Normalize path separators (use forward slashes for portability)
normalize_path() {
    local path="$1"
    # Convert backslashes to forward slashes (for Windows/WSL compatibility)
    echo "$path" | sed 's|\\|/|g'
}

# Resolve all template variables in a string
# Usage: resolve_template "{project_root}/docs/{date}/file.md"
# Returns: resolved string with all variables substituted
resolve_template() {
    local template="$1"
    local result="$template"
    local max_iterations=10  # Prevent infinite loops
    local iteration=0

    # Find all variables in the template
    while [[ "$result" =~ \{([a-z_]+)\} ]]; do
        local var_name="${BASH_REMATCH[1]}"

        # Check if variable is valid
        if ! is_valid_variable "$var_name"; then
            log_error "Undefined template variable: {$var_name}"
            log_error "Valid variables are: ${VALID_VARIABLES[*]}"
            return 1
        fi

        # Get the variable value
        local var_value
        if ! var_value=$(get_variable_value "$var_name"); then
            log_error "Failed to resolve variable: {$var_name}"
            return 1
        fi

        # Replace the variable in the result
        result="${result//\{$var_name\}/$var_value}"

        # Safety check for infinite loops
        iteration=$((iteration + 1))
        if [[ $iteration -ge $max_iterations ]]; then
            log_error "Too many variable substitutions (possible circular reference)"
            return 1
        fi
    done

    # Normalize path separators
    result=$(normalize_path "$result")

    echo "$result"
}

# Resolve a template and return an absolute path
# Usage: resolve_path "{context_dir}/templates/story.md"
resolve_path() {
    local template="$1"
    local resolved

    resolved=$(resolve_template "$template") || return 1

    # If path is not absolute, make it absolute
    if [[ "$resolved" != /* ]]; then
        resolved="$(pwd)/$resolved"
    fi

    echo "$resolved"
}

# List all available template variables with their current values
list_variables() {
    echo "Available Template Variables (FR-12):"
    echo "======================================"
    for var_name in "${VALID_VARIABLES[@]}"; do
        local var_value
        var_value=$(get_variable_value "$var_name" 2>/dev/null) || var_value="(error)"
        printf "  {%-15s} = %s\n" "$var_name}" "$var_value"
    done
}

# Reset the variable cache (useful for testing or new invocations)
reset_variable_cache() {
    CACHED_TIMESTAMP=""
    CACHED_DATE=""
    CACHED_GIT_BRANCH=""
    CACHED_USER=""
    PROJECT_ROOT=""
    PROJECT_ROOT_CACHED=false
    log_debug "Variable cache reset"
}

# ============================================================================
# Configuration Hierarchy Loader (FR-13)
# ============================================================================

# Configuration cache
declare -g CONFIG_LOADED=false
declare -gA CONFIG_VALUES=()
declare -gA CONFIG_SOURCES=()

# Default configuration values
declare -gA CONFIG_DEFAULTS=(
    [context_dir]=".claude/context"
    [agents_dir]=".claude/agents"
    [commands_dir]=".claude/commands"
    [templates_dir]=".claude/context/templates"
    [log_level]="INFO"
    [auto_create_skeleton]="true"
)

# Valid configuration keys (for schema validation)
declare -a VALID_CONFIG_KEYS=(
    "context_dir"
    "agents_dir"
    "commands_dir"
    "templates_dir"
    "log_level"
    "auto_create_skeleton"
    "default_branch"
    "archive_days"
)

# Configuration file paths in hierarchy order (lowest to highest priority)
get_config_paths() {
    local project_root
    project_root=$(discover_project_root 2>/dev/null) || project_root="."

    echo "/etc/claude/config.yaml"
    echo "${HOME}/.claude/config.yaml"
    echo "$project_root/.claude/config.yaml"
}

# Check if yq is available for YAML parsing
check_yaml_parser() {
    if command -v yq &>/dev/null; then
        echo "yq"
    elif command -v python3 &>/dev/null && python3 -c "import yaml" 2>/dev/null; then
        echo "python"
    else
        echo "none"
    fi
}

# Parse YAML file and extract key-value pairs
# Returns key=value pairs, one per line
parse_yaml_file() {
    local file="$1"

    if [[ ! -f "$file" ]]; then
        return 1
    fi

    local parser
    parser=$(check_yaml_parser)

    case "$parser" in
        yq)
            # Use yq to extract keys and values
            if ! yq eval '. | to_entries | .[] | .key + "=" + (.value | tostring)' "$file" 2>/dev/null; then
                log_warning "Failed to parse YAML file with yq: $file"
                return 1
            fi
            ;;
        python)
            # Use Python for YAML parsing
            if ! python3 -c "
import yaml
import sys
try:
    with open('$file', 'r') as f:
        data = yaml.safe_load(f)
    if data and isinstance(data, dict):
        for key, value in data.items():
            print(f'{key}={value}')
except Exception as e:
    sys.exit(1)
" 2>/dev/null; then
                log_warning "Failed to parse YAML file with Python: $file"
                return 1
            fi
            ;;
        none)
            # Basic bash parsing for simple key: value YAML
            local parse_key parse_value
            while IFS=': ' read -r parse_key parse_value || [[ -n "$parse_key" ]]; do
                # Skip comments and empty lines
                [[ "$parse_key" =~ ^[[:space:]]*# ]] && continue
                [[ -z "$parse_key" ]] && continue
                # Remove leading/trailing whitespace
                parse_key=$(echo "$parse_key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
                parse_value=$(echo "$parse_value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
                # Skip if no key
                [[ -z "$parse_key" ]] && continue
                echo "${parse_key}=${parse_value}"
            done < "$file"
            ;;
    esac
}

# Validate a configuration key against the schema
is_valid_config_key() {
    local key="$1"
    for valid_key in "${VALID_CONFIG_KEYS[@]}"; do
        if [[ "$valid_key" == "$key" ]]; then
            return 0
        fi
    done
    return 1
}

# Sanitize configuration value to prevent injection
sanitize_config_value() {
    local value="$1"
    # Remove any potential shell metacharacters for safety
    # Allow alphanumeric, slashes, dots, underscores, hyphens, and spaces
    echo "$value" | sed 's/[^a-zA-Z0-9/._ -]//g'
}

# Load configuration from a single file
load_config_file() {
    local file="$1"
    local source_name="$2"

    if [[ ! -f "$file" ]]; then
        log_debug "Configuration file not found: $file"
        return 0
    fi

    log_debug "Loading configuration from: $file"

    local parsed
    parsed=$(parse_yaml_file "$file") || {
        log_warning "Skipping invalid YAML file: $file"
        return 0
    }

    local cfg_file_key cfg_file_value
    while IFS='=' read -r cfg_file_key cfg_file_value || [[ -n "$cfg_file_key" ]]; do
        [[ -z "$cfg_file_key" ]] && continue

        # Validate key against schema
        if ! is_valid_config_key "$cfg_file_key"; then
            log_warning "Unknown configuration key '$cfg_file_key' in $file - ignoring"
            continue
        fi

        # Sanitize value
        cfg_file_value=$(sanitize_config_value "$cfg_file_value")

        # Store value and source
        CONFIG_VALUES["$cfg_file_key"]="$cfg_file_value"
        CONFIG_SOURCES["$cfg_file_key"]="$source_name"

        log_debug "Config: $cfg_file_key = $cfg_file_value (from $source_name)"
    done <<< "$parsed"
}

# Load configuration from all hierarchy levels
# Order: defaults → system → user → project → environment
load_config_hierarchy() {
    # Return cached config if available
    if [[ "$CONFIG_LOADED" == "true" ]]; then
        return 0
    fi

    log_debug "Loading configuration hierarchy..."

    # Start with defaults
    local cfg_key  # Use different variable name to avoid conflicts
    for cfg_key in "${!CONFIG_DEFAULTS[@]}"; do
        CONFIG_VALUES["$cfg_key"]="${CONFIG_DEFAULTS[$cfg_key]}"
        CONFIG_SOURCES["$cfg_key"]="default"
    done

    # Load from file hierarchy
    local config_paths
    config_paths=$(get_config_paths)

    while IFS= read -r config_file; do
        local source_name
        case "$config_file" in
            /etc/*)
                source_name="system"
                ;;
            "$HOME"*)
                source_name="user"
                ;;
            *)
                source_name="project"
                ;;
        esac
        load_config_file "$config_file" "$source_name"
    done <<< "$config_paths"

    # Environment variables override (integration point for Story 3.6)
    # Check for CLAUDE_* environment variables
    local env_key env_var
    for env_key in "${VALID_CONFIG_KEYS[@]}"; do
        env_var="CLAUDE_${env_key^^}"  # Convert to uppercase
        env_var="${env_var//-/_}"  # Replace hyphens with underscores
        if [[ -n "${!env_var:-}" ]]; then
            CONFIG_VALUES["$env_key"]="${!env_var}"
            CONFIG_SOURCES["$env_key"]="environment"
            log_debug "Config override from env: $env_key = ${!env_var}"
        fi
    done

    CONFIG_LOADED=true
    log_debug "Configuration hierarchy loaded successfully"
}

# Get a configuration value
get_config() {
    local key="$1"
    local default="${2:-}"

    # Ensure config is loaded
    load_config_hierarchy

    if [[ -n "${CONFIG_VALUES[$key]:-}" ]]; then
        echo "${CONFIG_VALUES[$key]}"
    else
        echo "$default"
    fi
}

# Get the source of a configuration value
get_config_source() {
    local key="$1"

    # Ensure config is loaded
    load_config_hierarchy

    echo "${CONFIG_SOURCES[$key]:-unknown}"
}

# Get all configuration as key=value pairs
get_all_config() {
    load_config_hierarchy

    local all_key
    for all_key in "${!CONFIG_VALUES[@]}"; do
        echo "$all_key=${CONFIG_VALUES[$all_key]}"
    done | sort
}

# Get configuration with source metadata
get_config_with_sources() {
    load_config_hierarchy

    echo "Configuration Values (with sources):"
    echo "====================================="
    local src_key src_source
    for src_key in "${!CONFIG_VALUES[@]}"; do
        src_source="${CONFIG_SOURCES[$src_key]:-unknown}"
        printf "  %-20s = %-30s (from %s)\n" "$src_key" "${CONFIG_VALUES[$src_key]}" "$src_source"
    done | sort
}

# Reset configuration cache
reset_config_cache() {
    CONFIG_LOADED=false
    CONFIG_VALUES=()
    CONFIG_SOURCES=()
    log_debug "Configuration cache reset"
}

# ============================================================================
# Fallback Mechanism (NFR-9 Zero Configuration)
# ============================================================================

# Built-in default templates (used when template files don't exist)
get_default_story_template() {
    cat << 'TEMPLATE'
---
type: story
id: "{story_id}"
status: draft
created_at: "{timestamp}"
---

# Story: {title}

## User Story

**As a** [role],
**I want** [feature],
**So that** [benefit].

## Acceptance Criteria

- [ ] AC1: [criterion]
- [ ] AC2: [criterion]

## Technical Notes

[Add technical considerations here]
TEMPLATE
}

get_default_epic_template() {
    cat << 'TEMPLATE'
---
type: epic
id: "{epic_id}"
status: draft
created_at: "{timestamp}"
---

# Epic: {title}

## Overview

[Epic description]

## Stories

1. [Story 1]
2. [Story 2]

## Success Criteria

- [Criterion]
TEMPLATE
}

get_default_decision_template() {
    cat << 'TEMPLATE'
---
type: decision
id: "{decision_id}"
status: proposed
created_at: "{timestamp}"
---

# Decision: {title}

## Context

[Why this decision is needed]

## Options Considered

1. **Option A**: [Description]
2. **Option B**: [Description]

## Decision

[The chosen option and why]

## Consequences

- [Impact]
TEMPLATE
}

# Get a template, falling back to built-in default if file doesn't exist
get_template() {
    local template_name="$1"
    local templates_dir
    templates_dir=$(get_templates_dir 2>/dev/null)

    local template_file="$templates_dir/${template_name}.md"

    if [[ -f "$template_file" ]]; then
        cat "$template_file"
    else
        log_warning "Template file not found: $template_file. Using built-in default."

        case "$template_name" in
            story)
                get_default_story_template
                ;;
            epic)
                get_default_epic_template
                ;;
            decision)
                get_default_decision_template
                ;;
            *)
                log_error "No built-in template for: $template_name"
                return 1
                ;;
        esac
    fi
}

# Validate environment variable value (reject malformed values)
validate_env_value() {
    local env_name="$1"
    local env_value="$2"
    local value_type="${3:-string}"

    case "$value_type" in
        path)
            # Reject paths with directory traversal or invalid characters
            if [[ "$env_value" == *".."* ]]; then
                log_error "Malformed path in $env_name: contains directory traversal"
                return 1
            fi
            if [[ "$env_value" =~ [[:cntrl:]] ]]; then
                log_error "Malformed path in $env_name: contains control characters"
                return 1
            fi
            ;;
        boolean)
            local lower_value="${env_value,,}"
            if [[ ! "$lower_value" =~ ^(true|false|yes|no|1|0)$ ]]; then
                log_error "Malformed boolean in $env_name: must be true/false/yes/no/1/0"
                return 1
            fi
            ;;
        integer)
            if [[ ! "$env_value" =~ ^[0-9]+$ ]]; then
                log_error "Malformed integer in $env_name: must be a number"
                return 1
            fi
            ;;
        log_level)
            if [[ ! "$env_value" =~ ^(DEBUG|INFO|WARNING|ERROR)$ ]]; then
                log_error "Malformed log level in $env_name: must be DEBUG/INFO/WARNING/ERROR"
                return 1
            fi
            ;;
    esac

    return 0
}

# Display first-run welcome message
display_first_run_message() {
    local project_root="$1"

    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║     Claude Code Micro-Agent Framework - First Run Setup     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Created .claude/ directory structure in: $project_root"
    echo ""
    echo "Directory structure:"
    echo "  .claude/"
    echo "  ├── context/           # Agent coordination files"
    echo "  │   ├── coordination/  # Task queue, memory bank"
    echo "  │   ├── decisions/     # Architecture decisions"
    echo "  │   ├── templates/     # Story/epic templates"
    echo "  │   └── archive/       # Archived old files"
    echo "  ├── agents/            # Agent definitions"
    echo "  ├── commands/          # Slash commands"
    echo "  └── lib/               # Shared utilities"
    echo ""
    echo "You can customize agent behavior via:"
    echo "  - Project config: .claude/config.yaml"
    echo "  - User config: ~/.claude/config.yaml"
    echo "  - Environment: CLAUDE_* variables"
    echo ""
}

# Validate entire configuration against schema
validate_config() {
    load_config_hierarchy

    local errors=0
    local val_key val_value

    # Check for any values that don't pass validation
    for val_key in "${!CONFIG_VALUES[@]}"; do
        val_value="${CONFIG_VALUES[$val_key]}"

        # Type-specific validation
        case "$val_key" in
            log_level)
                if [[ ! "$val_value" =~ ^(DEBUG|INFO|WARNING|ERROR)$ ]]; then
                    log_error "Invalid log_level: $val_value (must be DEBUG, INFO, WARNING, or ERROR)"
                    errors=$((errors + 1))
                fi
                ;;
            auto_create_skeleton)
                # Case-insensitive boolean check
                local lower_value="${val_value,,}"  # Convert to lowercase
                if [[ ! "$lower_value" =~ ^(true|false)$ ]]; then
                    log_error "Invalid auto_create_skeleton: $val_value (must be true or false)"
                    errors=$((errors + 1))
                fi
                ;;
            archive_days)
                if [[ -n "$val_value" && ! "$val_value" =~ ^[0-9]+$ ]]; then
                    log_error "Invalid archive_days: $val_value (must be a number)"
                    errors=$((errors + 1))
                fi
                ;;
            *_dir)
                # Path validation - check for directory traversal
                if [[ "$val_value" == *".."* ]]; then
                    log_error "Invalid path in $val_key: $val_value (contains directory traversal)"
                    errors=$((errors + 1))
                fi
                ;;
        esac
    done

    if [[ $errors -gt 0 ]]; then
        log_error "Configuration validation failed with $errors error(s)"
        return 1
    fi

    log_debug "Configuration validation passed"
    return 0
}

# ============================================================================
# Logging Functions
# ============================================================================

# Log level: DEBUG < INFO < WARNING < ERROR
LOG_LEVEL="${CLAUDE_LOG_LEVEL:-INFO}"

log_debug() {
    [[ "$LOG_LEVEL" == "DEBUG" ]] && echo "[DEBUG] $*" >&2 || true
}

log_info() {
    [[ "$LOG_LEVEL" =~ ^(DEBUG|INFO)$ ]] && echo "[INFO] $*" >&2 || true
}

log_warning() {
    [[ "$LOG_LEVEL" =~ ^(DEBUG|INFO|WARNING)$ ]] && echo "[WARNING] $*" >&2 || true
}

log_error() {
    echo "[ERROR] $*" >&2
}

# ============================================================================
# CLI Interface
# ============================================================================

print_usage() {
    cat << EOF
Usage: path-resolver.sh [OPTIONS]

Universal path resolution for Claude Code micro-agents.
Implements FR-12 (Template Variables), FR-13 (Project Discovery), FR-14 (Portability).

Options:
  --root              Print the project root directory
  --context           Print the context directory path
  --agents            Print the agents directory path
  --commands          Print the commands directory path
  --templates         Print the templates directory path
  --lib               Print the lib directory path
  --create-skeleton   Create the .claude skeleton structure
  --check-git         Check if git is available
  --resolve <template>  Resolve a template string (e.g., "{project_root}/docs")
  --list-vars         List all available template variables
  --config [key]      Get configuration value (all if no key specified)
  --config-sources    List all configuration with their sources
  --config-source <key>  Get the source of a configuration value
  --validate-config   Validate configuration against schema
  --help              Show this help message

Template Variables (FR-12):
  {project_root}      Git repository root (or current dir)
  {context_dir}       {project_root}/.claude/context
  {agents_dir}        {project_root}/.claude/agents
  {commands_dir}      {project_root}/.claude/commands
  {templates_dir}     {context_dir}/templates
  {current_dir}       Current working directory
  {timestamp}         ISO 8601 timestamp (2025-01-15T10:30:00Z)
  {date}              YYYY-MM-DD date (2025-01-15)
  {user}              Current system user
  {git_branch}        Current git branch (or "main")

Environment Variables:
  CLAUDE_PROJECT_ROOT         Override project root discovery
  CLAUDE_DISABLE_AUTO_CREATE  Set to 'true' to disable skeleton auto-creation
  CLAUDE_LOG_LEVEL            Set log level (DEBUG, INFO, WARNING, ERROR)

Examples:
  # Get project root
  ./path-resolver.sh --root

  # Resolve a template path
  ./path-resolver.sh --resolve "{context_dir}/templates/{date}/story.md"

  # List all variables and their values
  ./path-resolver.sh --list-vars

  # Use with environment override
  CLAUDE_PROJECT_ROOT=/custom/path ./path-resolver.sh --root
EOF
}

# Main CLI handler
main() {
    case "${1:-}" in
        --root)
            discover_project_root
            ;;
        --context)
            get_context_dir
            ;;
        --agents)
            get_agents_dir
            ;;
        --commands)
            get_commands_dir
            ;;
        --templates)
            get_templates_dir
            ;;
        --lib)
            get_lib_dir
            ;;
        --create-skeleton)
            local root
            root=$(discover_project_root)
            create_skeleton_structure "$root"
            ;;
        --check-git)
            if check_git_available; then
                echo "Git is available"
                exit 0
            else
                echo "Git is not available"
                exit 1
            fi
            ;;
        --resolve)
            if [[ -z "${2:-}" ]]; then
                log_error "Missing template argument for --resolve"
                echo "Usage: $0 --resolve \"template string\""
                exit 1
            fi
            resolve_template "$2"
            ;;
        --list-vars)
            list_variables
            ;;
        --git-branch)
            get_git_branch
            ;;
        --timestamp)
            get_timestamp
            ;;
        --date)
            get_date
            ;;
        --user)
            get_user
            ;;
        --config)
            if [[ -z "${2:-}" ]]; then
                get_all_config
            else
                get_config "$2"
            fi
            ;;
        --config-sources)
            get_config_with_sources
            ;;
        --config-source)
            if [[ -z "${2:-}" ]]; then
                log_error "Missing key argument for --config-source"
                exit 1
            fi
            get_config_source "$2"
            ;;
        --validate-config)
            validate_config
            ;;
        --template)
            if [[ -z "${2:-}" ]]; then
                log_error "Missing template name (story, epic, decision)"
                exit 1
            fi
            get_template "$2"
            ;;
        --help|-h)
            print_usage
            ;;
        "")
            # When sourced, don't do anything
            if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
                print_usage
            fi
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
}

# Run main if script is executed directly (not sourced)
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
