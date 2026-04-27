# Story 21.5: Direction C — AST Mutation of Existing Variants

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 1: Approach Discovery & Prototyping
**Direction:** C — AST Mutation
**Status:** Draft
**Priority:** High

## User Story

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction C (AST mutation with mutation catalog),
**So that** I can measure mutation expressiveness, AST stability, and code coherence after N mutations.

## Business Value

Direction C transforms existing code rather than generating from scratch. By applying atomic mutations to an existing variant's AST, we can potentially create new variants with higher success rates and lower token costs. However, cumulative mutations may lead to incoherent code. This research measures whether the mutation catalog is expressive enough for useful diversity.

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Mutation Catalog Definition

**Given** the mutation catalog is defined
**When** catalog entries are implemented
**Then** the catalog includes atomic transformations:
- `swapGridLayout(cols)` — Change grid columns (e.g., `grid-cols-2` → `grid-cols-[2fr_1fr]`)
- `reorderChildren(order)` — Swap element order (image/text positions)
- `changeContainerType(type)` — flex → grid, grid → stack
- `addOverlayLayer(position)` — Add/remove/reposition overlay elements
- `changeAlignment(axis, value)` — Modify justify/align on containers
- `wrapInContainer(className)` — Add wrapper div with classes
- `toggleResponsiveStack(breakpoint)` — Add mobile stacking behavior
- `changeSpacingScale(dimension, scale)` — Modify gap/padding ratios

### Mutation Application

**Given** HeroCentered.tsx is parsed into an AST using ts-morph
**When** a sequence of mutations is applied: `changeContainerType("grid")` → `swapGridLayout(["2fr", "1fr"])` → `reorderChildren(["image", "text"])`
**Then** the resulting AST is serialized back to TSX
**And** the output passes the 5-gate validation pipeline
**And** the output is structurally different from the input (genuinely new layout)

### Existing Variant Reconstruction

**Given** the mutation catalog is applied to reconstruct existing variants
**When** starting from HeroCentered and applying mutations to reach HeroSplit
**Then** the mutation sequence exists and produces a result similar to HeroSplit
**And** starting from HeroSplit and applying mutations to reach HeroMinimal succeeds
**And** this validates the mutation catalog is expressive enough

### LLM-Guided Mutation

**Given** the LLM is prompted to suggest 3-5 mutations to create HeroAsymmetric from HeroSplit
**When** the LLM returns a mutation list (JSON array)
**When** those mutations are applied deterministically
**Then** the result passes the 5-gate validation pipeline
**And** the result is structurally distinct from HeroSplit

### Structural Diversity Evaluation

**Given** 5 new variants are generated using mutation combinations
**When** structural diversity is evaluated
**Then** each variant has a different DOM structure
**And** cumulative mutations beyond 5 begin to produce incoherent results (identify the limit)

## Technical Requirements

### New File: `web-app/lib/mutation-catalog.ts`

Create mutation catalog and implementations:

```typescript
import { SourceFile } from 'ts-morph';

export type Mutation = (ast: SourceFile) => SourceFile | void;

export const MUTATION_CATALOG: Record<string, Mutation> = {
  swapGridLayout: (ast, cols) => { /* implementation */ },
  reorderChildren: (ast, order) => { /* implementation */ },
  changeContainerType: (ast, type) => { /* implementation */ },
  addOverlayLayer: (ast, position) => { /* implementation */ },
  changeAlignment: (ast, axis, value) => { /* implementation */ },
  wrapInContainer: (ast, className) => { /* implementation */ },
  toggleResponsiveStack: (ast, breakpoint) => { /* implementation */ },
  changeSpacingScale: (ast, dimension, scale) => { /* implementation */ },
};
```

### Implementation Notes

- ts-morph is used for AST parsing and transformation
- Each mutation is a pure function: `(ast: SourceFile) => SourceFile` or `(ast: SourceFile) => void`
- Mutations are applied sequentially: `ast = mutate1(ast); ast = mutate2(ast);`
- The LLM's role is selecting which mutations to apply, not applying them (application is deterministic)
- The key research question is whether the mutation catalog is expressive enough for useful diversity

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| **New File** | `web-app/lib/mutation-catalog.ts` | Mutation catalog and implementations | Define and implement atomic transformations |
| Use | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Source AST for mutations | Test mutation expressiveness |
| Use | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Target for reconstruction | Test mutation expressiveness |
| Use | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Target for reconstruction | Test mutation expressiveness |
| Use | Story 21.2 | Validation pipeline | Validate mutated AST output |

## Dependencies

### Prerequisites

- **Story 21.1** (context assembler for reference patterns)
- **Story 21.2** (5-gate validation pipeline)
- **HeroSection** has 3 existing variants (Epic 17 — complete)

### Blocks

- Blocked by: Story 21.1, Story 21.2

## Testing Requirements

- Define all 8 atomic mutations in catalog
- Implement each mutation with ts-morph
- Test mutation sequence: HeroCentered → HeroSplit
- Test mutation sequence: HeroSplit → HeroMinimal
- Test LLM mutation suggestion for HeroSplit → HeroAsymmetric
- Validate all generated variants pass 5-gate pipeline
- Test cumulative mutations to identify incoherence limit
- Document mutation expressiveness coverage

## Definition of Done

- [ ] `web-app/lib/mutation-catalog.ts` created with all 8 mutations
- [ ] All mutations implemented with ts-morph
- [ ] Mutations are pure functions with no side effects
- [ ] HeroCentered → HeroSplit mutation sequence succeeds
- [ ] HeroSplit → HeroMinimal mutation sequence succeeds
- [ ] LLM suggests mutations for HeroSplit → HeroAsymmetric
- [ ] HeroAsymmetric generated via mutations passes 5-gate pipeline
- [ ] 5 new variants generated with different DOM structures
- [ ] Cumulative mutation limit identified (incoherence point)
- [ ] Mutation expressiveness documented

## Relevant NFRs

- **NFR14:** Component Reusability — mutation catalog works for any block type with AST structure

---

**Story Points:** 8
**Estimated Duration:** 3-4 sessions
**Risk Level:** Medium-High (AST transformation complexity, cumulative mutation instability)
