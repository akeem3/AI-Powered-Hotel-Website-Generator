---
# Story Context Template
# Copy this template to create new stories in docs/stories/
# Naming: story-{NN}.{SS}.{domain}_{name}_{status}_{date}.md
#   NN = Epic number (01, 02, 03...)
#   SS = Story number within epic (01, 02, 03...)

type: story
id: "{NN}.{SS}-{domain}-{name}"      # e.g., "01.03-agents-hallucination-checker"
epic_number: "{NN}"                  # Parent epic number
story_number: "{SS}"                 # Story number within epic
status: draft                        # draft | in-progress | in-review | approved | completed | blocked
priority: medium                     # high | medium | low

# Timestamps
created_at: "{timestamp}"
updated_at: "{timestamp}"

# Agent tracking
created_by: story-creator            # Agent that created this
updated_by: null                     # Last agent to modify

# Dependencies and relationships
depends_on: []                       # List of files this depends on
  # - epic-{NN}.{domain}_{epic-name}_{status}_{date}.md
related_artifacts: []                # Related files
  # - decision_{domain}_{decision-name}_{status}_{date}.md

# Target implementation
target_language: auto                # python | react | go | rust | auto (detect from codebase)
target_stack: auto                   # backend | frontend | fullstack | auto

# Story-specific fields
acceptance_criteria_met: "0/0"       # Progress: completed/total
hallucination_check: pending         # pending | passed | failed
security_check: pending              # pending | passed | failed
test_coverage: pending               # pending | generated | verified
code_review_status: not_started      # not_started | in_review | approved | changes_requested

# Code scout tracking (auto-populated by code-scout agent)
code_scout:
  status: pending                    # pending | completed | skipped
  scanned_at: null
  language_detected: null
  findings_count: 0
  reuse_opportunities: 0
  refactoring_suggestions: 0

# Lifecycle
tags: []                             # Searchable tags
archival_date: null                  # Set when ready to archive
---

# Story: {Title}

## User Story

**As a** {role}
**I want** {feature/capability}
**So that** {benefit/value}

## Context

{Brief background on why this story exists, link to epic if applicable}

## Acceptance Criteria

- [ ] **AC1**: {Specific, measurable criterion}
- [ ] **AC2**: {Specific, measurable criterion}
- [ ] **AC3**: {Specific, measurable criterion}
- [ ] **AC4**: {Specific, measurable criterion}
- [ ] **AC5**: {Specific, measurable criterion}

## Technical Considerations

- {Technical constraint or consideration}
- {Integration point}
- {Performance requirement}

## Code Scout Findings

<!-- This section is auto-populated by the code-scout agent before development -->
<!-- Do not edit manually - will be overwritten on next scout run -->

_Pending code-scout analysis_

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| {dependency} | {internal/external} | {available/pending} |

## Out of Scope

- {Explicitly excluded item}

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Deployed to staging environment

---

## Agent Activity Log

### Creation
- **Agent**: story-creator
- **Timestamp**: {timestamp}
- **Notes**: Initial story creation

<!-- Agents append entries here -->
