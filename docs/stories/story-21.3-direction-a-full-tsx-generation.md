# Story 21.3: Direction A — Full TSX Generation with AST Validation Gates

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 1: Approach Discovery & Prototyping
**Direction:** A — Full TSX Generation
**Status:** Draft
**Priority:** High

## User Story

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction A (full TSX generation with few-shot prompting and 5-gate validation),
**So that** I can measure generation success rate, code quality, and cost per variant.

## Business Value

Direction A represents the most direct approach: ask the LLM to generate complete TSX files using few-shot sibling examples as the pattern. By measuring this approach's success rate, code quality, and token cost, we establish a baseline for comparing against other approaches (B, C, D, E).

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Prompt Construction

**Given** the few-shot context from Story 21.1 is assembled for HeroSection
**When** the LLM generation prompt is constructed and executed
**Then** the prompt includes:
- System role: "You are a React component engineer generating a new structural variant"
- Constraint: "Use ONLY imports from existing siblings. Use ONLY semantic token classes. Match the props interface exactly."
- Sibling files: 2-3 complete Hero variant TSX files
- Zod contract: HeroSectionContract
- CVA definitions: heroVariants from cva-variants.ts
- Allowlist: All ~50-80 semantic token classes
- Design brief: "Generate a HeroAsymmetric variant with CSS Grid columns ['2fr', '1fr'], image clip-path, vertically offset text"

### Validation Loop

**Given** the LLM returns a complete `.tsx` file string
**When** the 5-gate validation pipeline from Story 21.2 is executed
**Then** gates validate in sequence: imports → props → classes → compliance → compilation
**And** if any gate fails, the error messages are fed back to the LLM for retry (max 3 attempts)
**And** the retry prompt includes: "Fix these errors in your generated TSX file: {errors}"

### Metrics Collection

**Given** 10 generation attempts for "HeroAsymmetric"
**When** results are recorded
**Then** metrics include:
- First-attempt pass rate (percentage that pass all gates on first try)
- After-retry pass rate (percentage that pass within 3 attempts)
- Per-gate failure rate (which gates fail most often)
- Most common error types (specific patterns that recur)
- Token cost per successful generation
- Total time per successful generation (including retries)

### Output Validation

**Given** the successfully generated HeroAsymmetric variant
**When** it is rendered in the browser
**Then** it renders correctly with proper layout, styling, and responsive behavior
**And** it visually differs from HeroCentered, HeroSplit, and HeroMinimal (different DOM structure)

### Cost Tracking

**Given** the generation attempt
**When** cost tracking is enabled
**Then** token usage is recorded: prompt tokens + completion tokens per attempt
**And** cost is calculated using current LLM API pricing

## Technical Requirements

### LLM Integration

- Use Claude 3.5 Sonnet or GPT-4 Turbo for code generation (test both if feasible)
- Retry loop: if gates fail, feed errors back to LLM with original prompt + error context
- Success definition: All 5 gates pass AND code renders correctly in browser
- Control experiment: also test with GPT-3.5 Turbo to measure quality difference vs cost
- Document all prompts used for reproducibility

### Generation Target

Generate a **HeroAsymmetric** variant with:
- CSS Grid columns: `['2fr', '1fr']`
- Image clip-path or other special effect
- Vertically offset text positioning
- Distinct DOM structure from existing variants

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Use | Story 21.1 output | Context assemblies | Use for prompt construction |
| Use | Story 21.2 output | Validation pipeline | Use for generated code validation |
| Reference | `docs/plans/ai-driven-block-style-diversity-plan.md` | "Layer 3: Structural Sub-Component Generation" | Original spec for this approach |
| Test Target | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Sibling variant | Few-shot example |
| Test Target | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Sibling variant | Few-shot example |
| Test Target | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Sibling variant | Few-shot example |

## Dependencies

### Prerequisites

- **Story 21.1** (context assembler)
- **Story 21.2** (5-gate validation pipeline)
- **HeroSection** has 3 existing variants (Epic 17 — complete)

### Blocks

- Blocked by: Story 21.1, Story 21.2

## Testing Requirements

- Run 10 generation attempts for HeroAsymmetric
- Record all metrics listed in acceptance criteria
- Validate generated variant renders correctly
- Test retry loop with intentional failures
- Compare GPT-3.5 Turbo vs Claude 3.5 Sonnet vs GPT-4 Turbo
- Document all prompts used

## Definition of Done

- [ ] LLM generation prompt constructed with all required elements
- [ ] Retry loop implemented with error feedback
- [ ] 10 generation attempts completed for HeroAsymmetric
- [ ] First-attempt pass rate recorded
- [ ] After-retry pass rate recorded
- [ ] Per-gate failure rate recorded
- [ ] Token cost per successful generation calculated
- [ ] Total time per successful generation recorded
- [ ] Generated HeroAsymmetric variant renders correctly in browser
- [ ] Generated variant has different DOM structure from siblings
- [ ] All prompts documented for reproducibility
- [ ] Comparison of GPT-3.5, Claude 3.5, and GPT-4 completed (if feasible)

## Relevant NFRs

- **NFR14:** Component Reusability — generated variant integrates with existing router pattern

---

**Story Points:** 8
**Estimated Duration:** 3-4 sessions
**Risk Level:** Medium (LLM generation unpredictability, validation dependency)
