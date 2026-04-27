# Story 21.7: Direction E — Skeleton Filler (Slot-Based Template Generation)

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 1: Approach Discovery & Prototyping
**Direction:** E — Skeleton Filler
**Status:** Draft
**Priority:** High

## User Story

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction E (skeleton templates with slot-filling logic),
**So that** I can measure template coverage, slot flexibility, and output coherence.

## Business Value

Direction E uses pre-built skeleton templates with designated slots that the LLM fills with content. This approach may offer higher success rates and lower token costs than full generation, but risks producing template-like results rather than truly diverse designs. This research measures whether skeleton-based generation produces perceptually distinct variants or just template variations.

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Skeleton Template Library

**Given** the skeleton template library is defined
**When** templates are created for HeroSection
**Then** the library includes:
- `HeroFullBleedImageSkeleton` — Full-width background image with overlay slots
- `HeroTwoColumnSkeleton` — Split layout with left/right content slots
- `HeroTypographyFirstSkeleton` — Text-focused with minimal image slot
- `HeroAsymmetricSkeleton` — Grid-based with offset content areas
- Each skeleton has defined slot names (e.g., `primary-cta`, `secondary-cta`, `tagline`, `headline`)

### SkeletonFiller Utility

**Given** the SkeletonFiller utility is created
**When** it receives a skeleton template and component props
**Then** it:
- Maps props to skeleton slots based on slot names
- Applies semantic token classes to slot containers
- Inserts CVA variants where specified
- Handles optional props (skips slots for undefined values)
- Returns a complete React component

### Existing Variant Reverse-Engineering

**Given** the 3 existing Hero variants (Centered, Split, Minimal)
**When** each is reverse-engineered into skeleton + slot-fill configuration
**Then** the skeleton captures the structural pattern
**And** the slot-fill configuration captures the prop-to-slot mapping
**And** when rendered via SkeletonFiller, the output visually matches the hand-crafted variant

### LLM Generation with Skeletons

**Given** the LLM is prompted to generate a new HeroAsymmetric variant
**When** generation completes
**Then** the LLM outputs:
1. A skeleton selection (from existing skeleton library OR new skeleton definition)
2. A slot-fill configuration mapping props to skeleton slots
3. CVA variant selections for styling
**And** the SkeletonFiller produces a working component from this specification

### Expressiveness Evaluation

**Given** the SkeletonFiller approach
**When** expressiveness ceiling is evaluated
**Then** limitations are documented:
- Requires pre-defining skeleton structures (not truly generative)
- New structures require new skeleton templates (template maintenance burden)
- Complex layouts may require too many slot types (skeleton explosion)
- Responsive behavior must be baked into skeleton (less flexible)
- Cannot express truly novel DOM structures (only combinations of predefined patterns)

### Metrics Collection

**Given** 10 generation attempts for HeroAsymmetric using skeleton filler
**When** results are recorded
**Then** metrics include:
- First-attempt pass rate (percentage that pass all gates on first try)
- Skeleton reuse rate (how often existing skeletons are selected vs new ones requested)
- Average number of unique slots per generated variant
- Most common slot combinations (pattern discovery)
- Token cost per successful generation
- Total time per successful generation (including retries)
- Human review assessment: "Does this feel like a template or a unique design?"

### Diversity Evaluation

**Given** a skeleton library with 5 Hero skeleton templates
**When** the LLM generates 10 new variants
**Then** diversity is measured:
- How many variants reuse the same skeleton (skeleton collision rate)
- Visual distinctness between variants using the same skeleton
- Whether slot-fill variations alone create perceptually different designs

## Technical Requirements

### New File: `web-app/lib/skeleton-filler.ts`

Create skeleton filler utility:

```typescript
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';

interface SkeletonConfig {
  skeleton: string;
  slotFillConfig: Record<string, SlotFill>;
  cvaVariants?: Record<string, string>;
}

interface SlotFill {
  propSource: keyof HeroSectionContractType;
  className?: string;
}

export function SkeletonFiller(
  skeleton: React.ComponentType,
  config: SkeletonConfig,
  props: HeroSectionContractType
): JSX.Element {
  // Map props to skeleton slots
  // Apply semantic token classes
  // Insert CVA variants
  // Return filled component
}
```

### New File: `web-app/lib/skeleton-registry.ts`

Create registry of available skeletons:

```typescript
export const SKELETON_REGISTRY = {
  HeroFullBleedImageSkeleton: { component: /* ... */, slots: [...] },
  HeroTwoColumnSkeleton: { component: /* ... */, slots: [...] },
  HeroTypographyFirstSkeleton: { component: /* ... */, slots: [...] },
  HeroAsymmetricSkeleton: { component: /* ... */, slots: [...] },
};
```

### New File: `web-app/lib/skeleton-types.ts`

Create Zod schemas for skeleton configs:

```typescript
import { z } from 'zod';

export const SkeletonFillConfigSchema = z.object({
  skeleton: z.string(),
  slotFillConfig: z.record(z.string(), z.object({
    propSource: z.string(),
    className: z.string().optional(),
  })),
  cvaVariants: z.record(z.string(), z.string()).optional(),
});
```

### Implementation Notes

- Skeleton templates are TSX files with designated slot positions (using placeholder components)
- The SkeletonFiller utility maps props to slots by name and renders the filled template
- Skeletons can be shared across block types (e.g., TwoColumnSkeleton for Hero, Features, About)
- The LLM's role is selecting a skeleton and configuring slot mappings, not writing TSX
- The key research question is whether skeleton-based generation produces truly diverse results or just template variations
- Template maintenance burden is a key risk: each new pattern requires a new skeleton

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| **New File** | `web-app/lib/skeleton-filler.ts` | `SkeletonFiller` utility, skeleton templates | Create skeleton filler logic |
| **New File** | `web-app/lib/skeleton-registry.ts` | `SKELETON_REGISTRY` | Registry of available skeletons by block type |
| **New File** | `web-app/lib/skeleton-types.ts` | Zod schemas for skeleton configs | Define skeleton and slot-fill schemas |
| Reference | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Reverse-engineer to skeleton | Create skeleton from existing |
| Reference | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Reverse-engineer to skeleton | Create skeleton from existing |
| Reference | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Reverse-engineer to skeleton | Create skeleton from existing |
| Use | Story 21.2 | Validation pipeline | Validate filled skeleton output |

## Dependencies

### Prerequisites

- **Story 21.1** (context assembler for reference patterns)
- **Story 21.2** (5-gate validation pipeline)
- **HeroSection** has 3 existing variants (Epic 17 — complete)

### Blocks

- Blocked by: Story 21.1, Story 21.2

## Testing Requirements

- Define SkeletonFillConfigSchema
- Implement SkeletonFiller utility
- Create SKELETON_REGISTRY with 4 Hero skeletons
- Reverse-engineer HeroCentered into skeleton + config
- Reverse-engineer HeroSplit into skeleton + config
- Reverse-engineer HeroMinimal into skeleton + config
- Verify SkeletonFiller produces matching output for each
- Generate HeroAsymmetric via LLM skeleton selection + slot-fill
- Validate generated config passes Zod schema
- Test HeroAsymmetric renders correctly via SkeletonFiller
- Document expressiveness limitations
- Record all metrics from 10 generation attempts
- Measure diversity: skeleton collision rate, visual distinctness

## Definition of Done

- [ ] `web-app/lib/skeleton-filler.ts` created with SkeletonFiller utility
- [ ] `web-app/lib/skeleton-registry.ts` created with 4 Hero skeletons
- [ ] `web-app/lib/skeleton-types.ts` created with Zod schemas
- [ ] SkeletonFiller maps props to slots correctly
- [ ] SkeletonFiller applies semantic token classes
- [ ] SkeletonFiller inserts CVA variants where specified
- [ ] SkeletonFiller handles optional props (skips undefined slots)
- [ ] HeroCentered reverse-engineered + matches rendering
- [ ] HeroSplit reverse-engineered + matches rendering
- [ ] HeroMinimal reverse-engineered + matches rendering
- [ ] LLM generates valid HeroAsymmetric skeleton selection + config
- [ ] Generated config passes Zod validation
- [ ] HeroAsymmetric renders correctly via SkeletonFiller
- [ ] Expressiveness limitations documented
- [ ] Metrics recorded for 10 generation attempts
- [ ] Diversity evaluation completed (collision rate, visual distinctness)
- [ ] Human review assessment recorded

## Relevant NFRs

- **NFR14:** Component Reusability — skeletons work for any block type with similar patterns

---

**Story Points:** 8
**Estimated Duration:** 3-4 sessions
**Risk Level:** Medium (skeleton design complexity, template diversity evaluation)
