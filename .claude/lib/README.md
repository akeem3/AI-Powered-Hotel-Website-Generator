# Shell & Python Libraries

Universal libraries for Claude Code micro-agents.

## Overview

| Library | Language | Purpose |
|---------|----------|---------|
| `path-resolver.sh` | Bash | Project discovery, template variables, configuration |
| `dependency-graph.sh` | Bash | Task dependency tracking |
| `task-dispatcher.sh` | Bash | Parallel agent dispatch |
| `result-aggregator.sh` | Bash | Result collection |
| `file-lock.sh` | Bash | Exclusive write access |
| `error-handler.sh` | Bash | Retry logic with exponential backoff |
| `workflow-runner.sh` | Bash | Workflow execution |
| `parallel-story-orchestrator.py` | Python | OS-level parallel story creation |
| `single-story-workflow.sh` | Bash | Per-story validation pipeline |
| `json_output_formatter.py` | Python | Structured JSON output for agents |

---

# Path Resolution Library

Universal path resolution for Claude Code micro-agents.

## Quick Start

```bash
# Get project root
./path-resolver.sh --root

# Resolve template variables
./path-resolver.sh --resolve "{project_root}/docs/{date}"

# List all variables
./path-resolver.sh --list-vars

# Get configuration
./path-resolver.sh --config log_level
```

## Template Variables (FR-12)

| Variable | Description | Example |
|----------|-------------|---------|
| `{project_root}` | Git repository root (or cwd) | `/home/user/project` |
| `{context_dir}` | Context directory | `{project_root}/.claude/context` |
| `{agents_dir}` | Agents directory | `{project_root}/.claude/agents` |
| `{commands_dir}` | Commands directory | `{project_root}/.claude/commands` |
| `{templates_dir}` | Templates directory | `{context_dir}/templates` |
| `{current_dir}` | Current working directory | `/home/user/project/src` |
| `{timestamp}` | ISO 8601 timestamp | `2025-01-15T10:30:00Z` |
| `{date}` | YYYY-MM-DD date | `2025-01-15` |
| `{user}` | Current system user | `developer` |
| `{git_branch}` | Current git branch | `main` |

## Configuration Hierarchy

Configuration loads in this order (later overrides earlier):

1. **System** - `/etc/claude/config.yaml`
2. **User** - `~/.claude/config.yaml`
3. **Project** - `{project_root}/.claude/config.yaml`
4. **Environment** - `CLAUDE_*` variables

### Configuration Keys

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `context_dir` | path | `.claude/context` | Context directory |
| `agents_dir` | path | `.claude/agents` | Agents directory |
| `commands_dir` | path | `.claude/commands` | Commands directory |
| `templates_dir` | path | `.claude/context/templates` | Templates directory |
| `log_level` | enum | `INFO` | DEBUG, INFO, WARNING, ERROR |
| `auto_create_skeleton` | bool | `true` | Auto-create .claude/ structure |
| `default_branch` | string | - | Default git branch |
| `archive_days` | integer | - | Days before archiving |

### Example config.yaml

```yaml
# .claude/config.yaml
log_level: DEBUG
archive_days: 90
auto_create_skeleton: true
```

## Environment Variables

All configuration can be overridden via environment variables:

| Variable | Description |
|----------|-------------|
| `CLAUDE_PROJECT_ROOT` | Override project root discovery |
| `CLAUDE_CONTEXT_DIR` | Override context directory |
| `CLAUDE_AGENTS_DIR` | Override agents directory |
| `CLAUDE_LOG_LEVEL` | Set log level |
| `CLAUDE_DISABLE_AUTO_CREATE` | Disable skeleton auto-creation |

### CI/CD Examples

#### GitHub Actions
```yaml
env:
  CLAUDE_PROJECT_ROOT: ${{ github.workspace }}
  CLAUDE_DISABLE_AUTO_CREATE: true
```

#### Docker
```dockerfile
ENV CLAUDE_PROJECT_ROOT=/app
ENV CLAUDE_LOG_LEVEL=DEBUG
```

## Migration Guide

### Converting Hardcoded Paths

**Before (hardcoded):**
```bash
CONTEXT_DIR="/home/user/project/.claude/context"
TEMPLATES="${CONTEXT_DIR}/templates"
```

**After (portable):**
```bash
source path-resolver.sh
CONTEXT_DIR=$(get_context_dir)
TEMPLATES=$(get_templates_dir)
```

Or using template resolution:
```bash
./path-resolver.sh --resolve "{context_dir}/templates/{date}"
```

### Common Patterns

```bash
# Source the library
source .claude/lib/path-resolver.sh

# Discover project root
PROJECT=$(discover_project_root)

# Get configuration value
LOG_LEVEL=$(get_config log_level)

# Resolve a template path
OUTPUT=$(resolve_template "{context_dir}/output/{date}.md")

# Get a template (with built-in fallback)
TEMPLATE=$(get_template story)
```

## Troubleshooting

### Enable Debug Logging
```bash
CLAUDE_LOG_LEVEL=DEBUG ./path-resolver.sh --root
```

### Check Configuration Sources
```bash
./path-resolver.sh --config-sources
```

### Validate Configuration
```bash
./path-resolver.sh --validate-config
```

### Common Issues

1. **"Not in a git repository"** - Working outside git repo, falls back to cwd
2. **"Bad array subscript"** - Bash version < 4.0 may have issues
3. **"Auto-creation disabled"** - `CLAUDE_DISABLE_AUTO_CREATE=true` is set
4. **"Path traversal"** - Path contains `..` (security rejection)

## API Reference

### CLI Options

```
--root              Project root directory
--context           Context directory
--agents            Agents directory
--commands          Commands directory
--templates         Templates directory
--lib               Lib directory
--resolve <template>  Resolve template string
--list-vars         List template variables
--config [key]      Get configuration
--config-sources    Show config with sources
--validate-config   Validate configuration
--template <name>   Get template (story, epic, decision)
--create-skeleton   Create .claude/ structure
--git-branch        Current git branch
--timestamp         ISO 8601 timestamp
--date              YYYY-MM-DD date
--user              Current user
--help              Show help
```

### Functions (when sourced)

```bash
discover_project_root    # Get project root
get_context_dir         # Get context directory path
get_agents_dir          # Get agents directory path
get_templates_dir       # Get templates directory path
resolve_template        # Resolve template variables
get_config              # Get configuration value
get_config_source       # Get config value source
load_config_hierarchy   # Load all configuration
validate_config         # Validate configuration
get_template            # Get template with fallback
reset_variable_cache    # Reset cached values
```

---

# Parallel Story Orchestrator

Python library for OS-level parallel story creation.

## Usage

```bash
# Run parallel story creation for an epic
python3 .claude/lib/parallel-story-orchestrator.py epic-07

# With cross-story validation
python3 .claude/lib/parallel-story-orchestrator.py epic-07 --cross-validate
```

## Key Features

- **True OS-level parallelism** via `asyncio.subprocess`
- **Isolated 200k-token contexts** per story (no cross-contamination)
- **Configurable concurrency** (default: 5 parallel processes)
- **Graceful error handling** with partial result preservation
- **JSON output aggregation** for main thread consumption

## Architecture

```
Main Thread                    Subprocess Pool (max 5)
    │                              │
    ├─→ Parse Epic ────────────────┼─→ Story 1: create → validate → verify
    │                              │
    │                              ├─→ Story 2: create → validate → verify
    │                              │
    │                              ├─→ Story 3: create → validate → verify
    │                              │
    │                              ├─→ Story 4: create → validate → verify
    │                              │
    │                              └─→ Story 5: create → validate → verify
    │                                      │
    └─← Aggregate JSON ←───────────────────┘
```

---

# Single Story Workflow

Bash script for per-story validation pipeline.

## Usage

```bash
# Process a single story with full validation
.claude/lib/single-story-workflow.sh \
    --epic docs/epics/epic-07.*.md \
    --story-number 01 \
    --story-title "Create Stories Parallel Command"
```

## Pipeline Stages

1. **story-creator** → Generate story content from epic
2. **hallucination-checker** → Verify factual claims
3. **security-validator** → Check security considerations
4. **story-verifier** → Final validation and approval

## Output

Returns JSON summary:
```json
{
  "story_number": "07.01",
  "status": "PASS",
  "file_path": "docs/stories/story-07.01..._completed_2025-12-11.md",
  "phases_completed": ["story-creator", "hallucination-checker", "security-validator", "story-verifier"],
  "issues_count": 0
}
```

---

# JSON Output Formatter

Python library for structured agent output.

## Usage

```python
from json_output_formatter import JSONOutputFormatter

formatter = JSONOutputFormatter()
formatter.add_story_result("07.01", "PASS", "docs/stories/story-07.01.md")
formatter.add_issue("MEDIUM", "hallucination", "Config file not found")
print(formatter.to_json())
```

## Features

- Consistent JSON schema across all agents
- Automatic timestamp and metadata injection
- Issue severity levels: CRITICAL, HIGH, MEDIUM, LOW
- Aggregation support for multi-story workflows
