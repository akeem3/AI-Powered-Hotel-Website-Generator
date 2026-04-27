# Story 21.4: Direction B — JSON Layout Descriptor + Deterministic Renderer

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 1: Approach Discovery & Prototyping
**Direction:** B — JSON Layout Descriptor
**Status:** Draft
**Priority:** High

## User Story

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction B (JSON layout descriptor with deterministic renderer),
**So that** I can measure expressiveness coverage, rendering fidelity, and LLM generation reliability.

## Business Value

Direction B constrains the LLM to generate structured JSON (a layout descriptor) rather than raw TSX code. This approach should reduce hallucinations and improve generation reliability, but may limit expressiveness. By measuring these trade-offs, we can determine whether the constrained output space is sufficient for useful variant diversity.

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Layout Descriptor Schema

**Given** the Layout Descriptor Schema is defined as a Zod schema
**When** a HeroAsymmetric descriptor is generated
**Then** the schema includes:
- `name`: "HeroAsymmetric"
- `structure.type`: "grid"
- `structure.columns`: ["2fr", "1fr"]
- `structure.gap`: "hero"
- `structure.areas`: Array of slot definitions with slot, children, align, justify
- `responsiveOverride.mobile.type`: "stack"
- `responsiveOverride.mobile.order`: ["media", "content"]

### LayoutRenderer Component

**Given** the LayoutRenderer component is created
**When** it receives a layout descriptor and component props (title, headline, CTA, image)
**Then** it renders:
- CSS Grid with specified columns and gap
- Slots mapped to props (title → h1, headline → h2, cta → Button)
- Responsive behavior from override (stack on mobile with specified order)
- Clip path or other special effects applied via specified className

### Existing Variant Decomposition

**Given** the 3 existing Hero variants (Centered, Split, Minimal)
**When** each is decomposed into a JSON layout descriptor
**Then** the descriptor captures the essential structural differences
**And** when rendered via LayoutRenderer, the output visually matches the hand-crafted variant

### LLM Generation

**Given** the LLM is prompted to generate a HeroAsymmetric layout descriptor
**When** generation completes
**Then** the output is valid JSON that passes the Zod schema
**And** the LayoutRenderer produces a working component from that descriptor

### Expressiveness Evaluation

**Given** the LayoutRenderer approach
**When** expressiveness ceiling is evaluated
**Then** limitations are documented:
- Complex animations (framer-motion) — not expressible
- Conditional rendering based on prop values — limited expressibility
- Interactive elements (state, event handlers) — not expressible
- Custom CSS shapes and SVG integrations — limited expressibility
- Scroll-based effects — not expressible

## Technical Requirements

### New File: `web-app/lib/layout-schema.ts`

Create Zod schema for layout descriptors:

```typescript
import { z } from 'zod';

export const LayoutDescriptorSchema = z.object({
  name: z.string(),
  structure: z.object({
    type: z.enum(['grid', 'flex', 'stack']),
    columns: z.array(z.string()).optional(),
    gap: z.string().optional(),
    areas: z.array(z.object({
      slot: z.string(),
      children: z.string(),
      align: z.enum(['start', 'center', 'end']).optional(),
      justify: z.enum(['start', 'center', 'end']).optional(),
    })),
  }),
  responsiveOverride: z.object({
    mobile: z.object({
      type: z.enum(['stack', 'grid', 'flex']),
      order: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
});

export type LayoutDescriptor = z.infer<typeof LayoutDescriptorSchema>;
```

### New File: `web-app/lib/layout-renderer.tsx`

Create deterministic renderer that maps JSON to JSX:

```typescript
import type { LayoutDescriptor } from './layout-schema';
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';

interface LayoutRendererProps {
  descriptor: LayoutDescriptor;
  props: HeroSectionContractType;
}

export function LayoutRenderer({ descriptor, props }: LayoutRendererProps) {
  // Deterministic mapping of descriptor to JSX
  // CSS Grid with specified columns
  // Slots mapped to props
  // Responsive behavior from override
}
```

### Implementation Notes

- The LayoutDescriptorSchema uses Zod for runtime validation of LLM-generated JSON
- LayoutRenderer is a React Server Component that maps JSON to JSX deterministically
- Complex rendering logic (animations, interactions) is recognized as a limitation of this approach
- The key research question is whether the JSON schema is expressive enough for useful variants

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| **New File** | `web-app/lib/layout-schema.ts` | `LayoutDescriptorSchema` Zod schema | Define schema for structural descriptions |
| **New File** | `web-app/lib/layout-renderer.tsx` | `LayoutRenderer` component | Create deterministic renderer |
| Reference | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Decompose to descriptor | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Decompose to descriptor | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Decompose to descriptor | Test expressiveness |

## Dependencies

### Prerequisites

- **Story 21.1** (context assembler for reference patterns)
- **HeroSection** has 3 existing variants (Epic 17 — complete)

### Blocks

- Blocked by: Story 21.1

## Testing Requirements

- Define LayoutDescriptorSchema
- Implement LayoutRenderer
- Decompose all 3 existing Hero variants into descriptors
- Verify LayoutRenderer produces matching output for each
- Generate HeroAsymmetric descriptor via LLM
- Validate generated descriptor passes Zod schema
- Test HeroAsymmetric renders correctly via LayoutRenderer
- Document expressiveness limitations

## Definition of Done

- [ ] `web-app/lib/layout-schema.ts` created with LayoutDescriptorSchema
- [ ] `web-app/lib/layout-renderer.tsx` created with LayoutRenderer component
- [ ] LayoutDescriptorSchema validates all required fields
- [ ] LayoutRenderer renders CSS Grid with specified columns
- [ ] LayoutRenderer maps slots to props correctly
- [ ] LayoutRenderer applies responsive override behavior
- [ ] HeroCentered decomposed into descriptor + matches rendering
- [ ] HeroSplit decomposed into descriptor + matches rendering
- [ ] HeroMinimal decomposed into descriptor + matches rendering
- [ ] LLM generates valid HeroAsymmetric descriptor
- [ ] Generated descriptor passes Zod validation
- [ ] HeroAsymmetric renders correctly via LayoutRenderer
- [ ] Expressiveness limitations documented

## Relevant NFRs

- **NFR14:** Component Reusability — LayoutRenderer works for any block type with descriptor

---

**Story Points:** 5
**Estimated Duration:** 2-3 sessions
**Risk Level:** Low-Medium (schema design complexity, expressiveness evaluation)
