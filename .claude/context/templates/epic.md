---
# Epic Context Template - Enhanced with Cross-Reference Support
# Copy this template to create new epics in docs/epics/
# Naming: epic-{NN}.{domain}_{name}_{status}_{date}.md
#   NN = Epic number (01, 02, 03...) - sequential across project
#
# CRITICAL RULES:
# 1. NO CODE - This is a specification document, not implementation
# 2. NO LINE NUMBERS - Reference methods, classes, sections by name
# 3. TRACE EVERYTHING - Every claim must link to PRD/codebase/docs

type: epic
epic_number: "{NN}"                  # Epic number (01, 02, 03...)
id: "{NN}-{domain}-{name}"           # e.g., "01-agents-core-definitions"
status: planning                     # planning | in-progress | testing | completed | blocked
priority: high                       # high | medium | low

# Timestamps
created_at: "{timestamp}"
updated_at: "{timestamp}"
target_completion: null              # Target completion date

# Agent tracking
created_by: epic-creator             # Agent that created this
updated_by: null                     # Last agent to modify

# Source Document References (paths relative to project root)
prd_reference: null                  # e.g., "docs/prd.md"
architecture_reference: null         # e.g., "docs/architecture.md"
ux_reference: null                   # e.g., "docs/ux-design.md"
domain_brief_reference: null         # e.g., "docs/domain-brief.md"

# Functional Requirement Coverage
# List which FRs from PRD this epic addresses
fr_coverage:
  - FR1                              # e.g., FR1, FR2, FR5
  - FR2

# Dependencies
depends_on: []                       # Epics this depends on (by id)
blocks: []                           # Epics this blocks (by id)

# Progress tracking
stories_count: 0                     # Total stories in epic
stories_completed: 0                 # Completed stories
stories_in_progress: 0               # Currently active stories
stories_blocked: 0                   # Blocked stories

# Validation Results (populated by /create-epic workflow)
hallucination_check:
  status: null                       # CLEAN | ISSUES_FOUND | CRITICAL_ISSUES
  validated_at: null
  confidence: null                   # 0.0 - 1.0
  issues_count: 0

complexity_validation:
  status: null                       # VALID | NEEDS_REVIEW | OVERSIZED
  validated_at: null
  overall_score: null                # 1.0 - 5.0
  stories_needing_review: []
  principle_violations: 0            # KISS/YAGNI/DRY violations

# Lifecycle
tags: []                             # Searchable tags
archival_date: null                  # Set when ready to archive
---

# Epic: {Title}

## Business Context

{Why this epic exists and the business problem it solves}

**Source:** `{prd_path}` → Section "{section_name}"

## User Value Statement

{Concrete statement of what users can DO after this epic is complete that they couldn't do before}

**Validation:** After this epic, users will be able to:
- {Specific user action 1}
- {Specific user action 2}

---

## Scope

### In Scope (with FR Traceability)

| Capability | FR Reference | PRD Section |
|------------|--------------|-------------|
| {Capability 1} | FR{X}: "{brief description}" | Section "{name}" |
| {Capability 2} | FR{Y}: "{brief description}" | Section "{name}" |

### Out of Scope

| Excluded Item | Reason | Deferred To |
|---------------|--------|-------------|
| {Item 1} | Not in MVP scope | Epic {N} |
| {Item 2} | Per PRD Section "{name}" | Future release |

---

## Codebase Context

> **Reference Rule:** All references use semantic identifiers (method names, class names, section titles).
> **NEVER use line numbers** - they change with every edit.

### Relevant Existing Patterns

| Pattern | File Path | Reference (method/class/interface) | Purpose |
|---------|-----------|-----------------------------------|---------|
| {Pattern name} | `{relative/path/to/file}` | `{functionName}()` or `{ClassName}` | {How to apply} |
| {Pattern name} | `{relative/path/to/file}` | `{interfaceName}` interface | {How to extend} |

### Existing Interfaces to Extend

| Interface/Type | File Path | Reference | How This Epic Uses It |
|----------------|-----------|-----------|----------------------|
| `{InterfaceName}` | `{path}` | `{InterfaceName}` | {Extension description} |

### Services/Modules Involved

| Service/Module | File Path | Entry Point | Role in This Epic |
|----------------|-----------|-------------|-------------------|
| {ServiceName} | `{path}` | `{mainFunction}()` | {What it provides} |

### Related Documentation

| Document | Section Title | Relevance |
|----------|---------------|-----------|
| `{doc_path}` | "{Section Name}" | {Why relevant to this epic} |
| `{doc_path}` | "{Section Name}" | {Why relevant to this epic} |

---

## Stories

> Stories are ordered sequentially. Each story may only depend on previous stories (no forward dependencies).

### Story {N}.1: {Title}

**As a** {user type},
**I want** {specific capability},
**So that** {clear benefit/value}.

**FR Coverage:** FR{X}, FR{Y}

#### Acceptance Criteria

**Given** {precondition or initial state}
**When** {user action or system trigger}
**Then** {expected outcome}

**And** {additional criterion}
**And** {additional criterion}

#### Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Pattern | `{path}` | `{methodName}()` | Follow this pattern |
| Extend | `{path}` | `{InterfaceName}` | Add new properties |
| Test | `{test_path}` | `{describe block}` | Follow test style |

#### Prerequisites

- None (first story in epic)
- OR: Story {N}.{M} - {brief reason}

#### Technical Notes

{Non-code guidance: constraints, performance requirements, security considerations}

**Relevant NFRs:**
- NFR{X}: "{description}" - {how it applies}

---

### Story {N}.2: {Title}

{Repeat story structure...}

---

## FR Coverage Matrix

> Verify EVERY FR listed in `fr_coverage` frontmatter is addressed by at least one story.

| FR ID | FR Description | Story | Status |
|-------|----------------|-------|--------|
| FR{X} | {description from PRD} | {N}.{M} | Covered |
| FR{Y} | {description from PRD} | {N}.{M}, {N}.{P} | Covered |

**Coverage Validation:**
- [ ] All FRs in frontmatter `fr_coverage` are in this matrix
- [ ] Each FR maps to at least one story
- [ ] No orphan stories (every story maps to an FR)

---

## Dependencies

### Internal Dependencies (Other Epics)

| Epic ID | Epic Title | Dependency Type | Notes |
|---------|------------|-----------------|-------|
| {epic-id} | {title} | Must complete first | {reason} |

### External Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| {External API/Service} | External | {Team/Vendor} | {Available/Pending} |

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation | Related Artifact |
|------|--------|------------|------------|------------------|
| {Risk description} | High/Med/Low | High/Med/Low | {Strategy} | `{doc}` → "{section}" |

---

## Validation Checklist

### Content Validation
- [ ] All FR coverage claims verified against PRD
- [ ] All codebase references verified (files/methods exist)
- [ ] No code snippets present anywhere
- [ ] No line number references
- [ ] Story dependencies are backward-only

### Quality Validation
- [ ] Epic delivers user-visible value (not just technical)
- [ ] Stories are single-session sized
- [ ] Acceptance criteria are testable (Given/When/Then)
- [ ] All referenced documentation sections exist

---

## Agent Activity Log

### Creation
- **Agent**: epic-creator
- **Timestamp**: {timestamp}
- **PRD Version**: {version if available}
- **Notes**: Initial epic creation from PRD

<!--
Agents append entries here in format:
### {Action Type}
- **Agent**: {agent-name}
- **Timestamp**: {timestamp}
- **Notes**: {what was done}
-->
