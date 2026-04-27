# Story 21.6: Direction D — Layout Primitives Library

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 1: Approach Discovery & Prototyping
**Direction:** D — Layout Primitives Library
**Status:** Draft
**Priority:** High

## User Story

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction D (composable layout primitives library),
**So that** I can measure composition expressiveness, reusability, and assembly complexity.

## Business Value

Direction D provides a library of pre-built layout primitives that can be composed together to create variants. The LLM selects and arranges primitives rather than generating raw TSX. This approach may offer better reusability and lower maintenance, but the primitives library must be expressive enough to avoid template-like repetition. This research measures whether the composition model is sufficiently expressive.

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Primitives Library Definition

**Given** the layout primitives library is defined as a Zod schema
**When** primitives are implemented
**Then** the library includes atomic layout building blocks:
- `Primitives.Container` — Base wrapper with spacing, alignment, max-width
- `Primitives.Grid` — CSS Grid with configurable columns, gap, areas
- `Primitives.Flex` — Flexbox with direction, alignment, justification
- `Primitives.Stack` — Vertical stacking with gap between children
- `Primitives.Overlay` — Positioned overlay with z-index layering
- `Primitives.Slot` — Named placeholder for content injection
- `Primitives.Image` — Next.js Image wrapper with object-fit options
- `Primitives.Text` — Typography component with semantic token classes

### PrimitivesGrid Component

**Given** the PrimitivesGrid component is created
**When** it receives a grid configuration object
**Then** it renders:
- CSS Grid with specified columns (`grid-cols-*` or arbitrary values)
- Configurable gap using semantic spacing tokens
- Optional named areas for template-based layout
- Responsive override (mobile-first with breakpoint variants)

### LLM Generation with Primitives

**Given** the LLM is prompted to generate a HeroAsymmetric variant using primitives
**When** generation completes
**Then** the output is a valid PrimitivesComposition JSON that passes Zod validation
**And** the PrimitivesRenderer produces a working component from that composition
**And** the result passes the 5-gate validation pipeline

### Existing Variant Decomposition

**Given** the 3 existing Hero variants (Centered, Split, Minimal)
**When** each is decomposed into a PrimitivesComposition JSON
**Then** the composition captures the essential structure using primitives
**And** when rendered via PrimitivesRenderer, the output visually matches the hand-crafted variant
**And** the decomposition reveals patterns that could be reused across variants

### Expressiveness Evaluation

**Given** the PrimitivesRenderer approach
**When** expressiveness ceiling is evaluated
**Then** limitations are documented:
- Complex conditional rendering (show/hide based on props) — limited expressibility
- Interactive elements (state, event handlers) — not expressible
- Custom animation sequences — limited to predefined animation primitives
- Dynamic prop transformation — primitive composition is static
- Nested router patterns — primitives don't compose with existing router

### Metrics Collection

**Given** 10 generation attempts for HeroAsymmetric using primitives
**When** results are recorded
**Then** metrics include:
- First-attempt pass rate (percentage that pass all gates on first try)
- Average number of primitives used per variant (complexity measure)
- Reuse rate (how often the same primitive patterns recur)
- Most common primitive combinations (pattern discovery)
- Token cost per successful generation
- Total time per successful generation (including retries)

## Technical Requirements

### New File: `web-app/lib/layout-primitives/PrimitivesSchema.ts`

Create Zod schema for primitive compositions:

```typescript
import { z } from 'zod';

export const PrimitivesCompositionSchema = z.object({
  name: z.string(),
  root: z.object({
    type: z.enum(['Container', 'Grid', 'Flex', 'Stack']),
    props: z.record(z.string()),
    children: z.array(z.lazy(() => PrimitiveNodeSchema)),
  }),
});

export type PrimitivesComposition = z.infer<typeof PrimitivesCompositionSchema>;
```

### New File: `web-app/lib/layout-primitives/PrimitivesRenderer.tsx`

Create deterministic renderer for primitives:

```typescript
import type { PrimitivesComposition } from './PrimitivesSchema';
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';

interface PrimitivesRendererProps {
  composition: PrimitivesComposition;
  props: HeroSectionContractType;
}

export function PrimitivesRenderer({ composition, props }: PrimitivesRendererProps) {
  // Deterministic mapping of composition tree to JSX
  // Each primitive maps to its corresponding React component
}
```

### New File: `web-app/lib/layout-primitives/index.ts`

Barrel file for primitives library:

```typescript
export * from './PrimitivesSchema';
export * from './PrimitivesRenderer';
export * from './primitives/Container';
export * from './primitives/Grid';
export * from './primitives/Flex';
// ... other primitives
```

### Implementation Notes

- The PrimitivesSchema uses Zod for runtime validation of LLM-generated JSON
- Each primitive is a React Server Component that maps JSON props to JSX deterministically
- The composition is a tree structure: composition → primitive + props + children
- Primitives are designed for composition — each primitive handles one layout concern
- The key research question is whether the primitives library is expressive enough for useful variants without becoming as complex as writing TSX directly
- Primitives can be reused across block types (Hero, Gallery, Features, etc.)

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| **New File** | `web-app/lib/layout-primitives/PrimitivesSchema.ts` | `PrimitivesCompositionSchema` Zod schema | Define schema for primitive compositions |
| **New File** | `web-app/lib/layout-primitives/PrimitivesRenderer.tsx` | `PrimitivesRenderer` component | Create deterministic renderer for primitives |
| **New File** | `web-app/lib/layout-primitives/index.ts` | Export all primitive types | Barrel file for primitives library |
| Reference | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Decompose to primitives | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Decompose to primitives | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Decompose to primitives | Test expressiveness |

## Dependencies

### Prerequisites

- **Story 21.1** (context assembler for reference patterns)
- **Story 21.2** (5-gate validation pipeline)
- **HeroSection** has 3 existing variants (Epic 17 — complete)

### Blocks

- Blocked by: Story 21.1, Story 21.2

## Testing Requirements

- Define PrimitivesCompositionSchema
- Implement all 8 primitive components
- Implement PrimitivesRenderer
- Decompose all 3 existing Hero variants into primitive compositions
- Verify PrimitivesRenderer produces matching output for each
- Generate HeroAsymmetric composition via LLM
- Validate generated composition passes Zod schema
- Test HeroAsymmetric renders correctly via PrimitivesRenderer
- Document expressiveness limitations
- Record all metrics from 10 generation attempts

## Definition of Done

- [ ] `web-app/lib/layout-primitives/PrimitivesSchema.ts` created with schema
- [ ] `web-app/lib/layout-primitives/PrimitivesRenderer.tsx` created
- [ ] `web-app/lib/layout-primitives/index.ts` barrel file created
- [ ] All 8 primitive components implemented
- [ ] PrimitivesCompositionSchema validates composition structure
- [ ] PrimitivesRenderer maps compositions to JSX deterministically
- [ ] HeroCentered decomposed into primitives + matches rendering
- [ ] HeroSplit decomposed into primitives + matches rendering
- [ ] HeroMinimal decomposed into primitives + matches rendering
- [ ] LLM generates valid HeroAsymmetric composition
- [ ] Generated composition passes Zod validation
- [ ] HeroAsymmetric renders correctly via PrimitivesRenderer
- [ ] Expressiveness limitations documented
- [ ] Metrics recorded for 10 generation attempts

## Relevant NFRs

- **NFR14:** Component Reusability — primitives library works for any block type

---

**Story Points:** 5
**Estimated Duration:** 2-3 sessions
**Risk Level:** Medium (primitives library design complexity, expressiveness evaluation)
