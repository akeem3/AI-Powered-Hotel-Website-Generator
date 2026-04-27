# Story 21.8: Comparative Evaluation Report + Decision Recommendation

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 5: Report & Decision
**Status:** Draft
**Priority:** Critical

## User Story

**As a** product owner deciding whether to invest in AI-assisted variant generation infrastructure,
**I want** a comprehensive research report comparing all 5 prototyped approaches with scores and recommendations,
**So that** I can make an informed decision about whether to proceed with implementation, and if so, which approach to use.

## Business Value

After completing Stories 21.1-21.7, we will have prototyped 5 different approaches for AI-assisted structural variant generation. This story synthesizes all findings into a comprehensive evaluation report that answers the fundamental question: **Is AI-assisted variant generation worth the infrastructure investment compared to hand-crafting?** If yes, which approach gives the best quality-to-risk ratio?

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Evaluation Matrix

**Given** all 5 directions (A, B, C, D, E) have been prototyped in Stories 21.3, 21.4, 21.5, 21.6, and 21.7
**When** the comparative evaluation matrix is produced
**Then** each direction is scored on 7 criteria:
- **Integration Risk (25%)**: How many existing files/contracts need modification?
- **Output Quality (25%)**: Visual quality, professional appearance, passes design review
- **Generation Reliability (15%)**: Success rate across 10 attempts
- **Cost Efficiency (10%)**: Token cost per successful variant generation
- **Human Control (10%)**: How much control human retains over final result
- **Maintenance Burden (10%)**: What new code/systems must be maintained?
- **Scalability (5%)**: Does this work for all block types or only Hero?

### Visual Comparison

**Given** all 5 directions have produced a HeroAsymmetric variant
**When** rendered in the browser with 3 archetypes (Heritage Opulence, Urban Tech, Coastal Resort)
**Then** screenshots are captured for visual comparison
**And** all variants are tested against existing test suites (contract validation, CVA validation)
**And** a code review assessment is recorded: "Would you accept this in a PR?"

### Report Contents

**Given** the evaluation matrix and prototype results
**When** the final report is produced
**Then** it includes:
1. **Comparison matrix** with scores for all 5 directions (weighted totals and per-criteria breakdown)
2. **Prototype code** for each direction (even abandoned ones — they inform the decision)
3. **Rendered screenshots** of generated variants across archetypes
4. **Recommended approach** with justification (or "none" if hand-crafting is superior)
5. **Epic 21 story breakdown** based on the chosen approach (or cancellation plan if rejected)
6. **Risk assessment** — what could still go wrong and how to mitigate
7. **Cost analysis** — token cost per variant vs developer hours for hand-crafting

### Decision Criteria

**Given** the final recommendation
**When** the decision criteria are applied
**Then** the report answers:
1. **Is AI-assisted variant generation worth it vs hand-crafting?** (Cost/benefit analysis)
2. **Which approach gives the best quality-to-risk ratio?** (We prefer fewer high-quality variants over many mediocre ones)
3. **Does the approach fit our team's workflow?** (Is the human review step natural or burdensome?)

### Next Steps

**Given** the Epic 21 research is complete
**When** the report is finalized
**Then** next steps are clear:
- If recommended: Proceed with implementation epic (new stories based on chosen approach)
- If rejected: Document why hand-crafting remains superior and close Epic 21

## Technical Requirements

### Output Files

Create the following deliverables:

#### `docs/research/epic-21-comparative-evaluation-report.md`

Comprehensive research report containing:
- Executive summary
- Comparison matrix with scores
- Visual comparison screenshots
- Recommended approach with justification
- Risk assessment
- Cost analysis
- Next steps

#### `docs/research/epic-21-prototype-code/`

Directory containing working prototypes for all 5 directions:
- Direction A: Full TSX generation code
- Direction B: Layout descriptor schema + renderer
- Direction C: Mutation catalog implementations
- Direction D: Primitives library
- Direction E: Skeleton filler implementations

#### `docs/research/epic-21-screenshots/`

Directory containing rendered screenshots:
- HeroAsymmetric variant from each direction
- Across 3 archetypes (Heritage Opulence, Urban Tech, Coastal Resort)
- Side-by-side comparison images

### Implementation Notes

- This is a research documentation story, not an implementation story
- The report must be actionable: it either leads to implementation epic or provides clear rationale for cancellation
- Screenshots must show the same archetype rendered across all 5 approaches for fair visual comparison
- Cost analysis must use actual token costs measured during prototyping, not estimates
- The recommendation should consider: upfront infrastructure cost, per-variant marginal cost, long-term maintenance burden

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| **Output** | `docs/research/epic-21-comparative-evaluation-report.md` | Final research report | Create comprehensive report document |
| **Output** | `docs/research/epic-21-prototype-code/` | Prototype code for all 5 directions | Store working prototypes for reference |
| **Output** | `docs/research/epic-21-screenshots/` | Rendered screenshots | Visual comparison across archetypes |
| **Input** | Stories 21.1-21.5, 21.6, 21.7 | Prototype results | Compile findings from all prototyping stories |

## Dependencies

### Prerequisites

- **Stories 21.1, 21.2** (foundational infrastructure)
- **Story 21.3** (Direction A prototype)
- **Story 21.4** (Direction B prototype)
- **Story 21.5** (Direction C prototype)
- **Story 21.6** (Direction D prototype)
- **Story 21.7** (Direction E prototype)

### Blocks

- Blocked by: Stories 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7

## Testing Requirements

- All 5 direction prototypes completed and documented
- HeroAsymmetric variant generated by each approach
- All variants rendered with 3 archetypes
- Screenshots captured for visual comparison
- All variants pass contract validation
- All variants pass CVA validation
- Code review assessment completed
- Token costs measured and recorded
- Generation success rates calculated

## Definition of Done

- [ ] All 5 direction prototypes completed (Stories 21.3-21.7)
- [ ] Comparison matrix created with all 7 criteria scores
- [ ] Each direction scored on Integration Risk (25%)
- [ ] Each direction scored on Output Quality (25%)
- [ ] Each direction scored on Generation Reliability (15%)
- [ ] Each direction scored on Cost Efficiency (10%)
- [ ] Each direction scored on Human Control (10%)
- [ ] Each direction scored on Maintenance Burden (10%)
- [ ] Each direction scored on Scalability (5%)
- [ ] Weighted totals calculated for each direction
- [ ] HeroAsymmetric screenshots captured for all 5 directions
- [ ] Screenshots rendered across 3 archetypes
- [ ] All variants tested against existing test suites
- [ ] Code review assessment recorded for each
- [ ] Comparative evaluation report created
- [ ] Report includes comparison matrix with scores
- [ ] Report includes prototype code reference
- [ ] Report includes rendered screenshots
- [ ] Report includes recommended approach with justification
- [ ] Report includes risk assessment
- [ ] Report includes cost analysis (tokens vs hours)
- [ ] Report answers 3 decision criteria questions
- [ ] Next steps clearly defined (proceed or cancel)
- [ ] Prototype code stored in `docs/research/epic-21-prototype-code/`
- [ ] Screenshots stored in `docs/research/epic-21-screenshots/`

## Relevant NFRs

- **NFR14:** Component Reusability — recommendation considers cross-block applicability

---

**Story Points:** 5
**Estimated Duration:** 2-3 sessions
**Risk Level:** Low (documentation and synthesis; no new implementation)

## Decision Framework

This story is the **go/no-go gate** for Epic 21. The possible outcomes are:

### Proceed with Implementation
One approach is recommended with clear justification:
- Direction A: Full TSX generation (highest expressiveness, higher risk)
- Direction B: JSON layout descriptor (lower risk, limited expressiveness)
- Direction C: AST mutation (good for incremental variants, limited diversity)
- Direction D: Layout primitives (reusable, template-like results)
- Direction E: Skeleton filler (highest reliability, lowest diversity)

### Cancel Epic 21
Hand-crafting is determined to be superior:
- AI-assisted generation not cost-effective
- Output quality below acceptable threshold
- Infrastructure investment too high for return
- Team workflow not compatible with AI-assisted approach
