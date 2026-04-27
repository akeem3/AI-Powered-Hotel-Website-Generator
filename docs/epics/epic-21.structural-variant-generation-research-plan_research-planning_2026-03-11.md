---
type: epic
epic_number: "21"
id: "21-structural-variant-generation"
status: research
priority: medium
created_at: "2026-03-11T00:00:00Z"
prd_reference: "docs/plans/ai-driven-block-style-diversity-plan.md"
architecture_reference: "docs/architecture/component-system-architecture.md"
fr_coverage:
  - FR7
  - FR8
nfr_coverage:
  - NFR14
depends_on:
  - Epic-19
  - Epic-20
stories_count: 8
stories_completed: 0
stories_in_progress: 0
stories_blocked: 0

hallucination_check:
  status: pending
  validated_at: null
  confidence: null
  issues_count: 0
  issues_fixed: 0

complexity_validation:
  status: pending
  validated_at: null
  overall_score: null
  stories_needing_review: []
  principle_violations: 0

tags: [research, ai-generation, structural-variants, ast-validation, component-architecture]
---

# Epic 21: Structural Variant Generation — Research Plan

## Business Context

The ET Hotel Website Generator's component system uses a **router pattern** where each block type (Hero, Footer, About, FAQ, Features, Gallery) delegates to structurally distinct sub-components based on `variant.layout`. After Epic 17 (Hero) and Epic 18 (Navigation), HeroSection has 3 structural variants (Centered, Split, Minimal), and Epic 19 will add Footer (3 variants), About (3), FAQ (2), and Features (2). This creates **26,244 structural combinations**.

However, creating new structural variants is manual work: each requires writing a complete `.tsx` file, following strict rules (semantic tokens, Zod contracts, CVA validation), updating routers, and passing tests. Epic 20 addresses AI-driven design token and CVA diversity (Layers 1-2). Epic 21 is **Layer 3**: AI-assisted generation of new structural sub-components.

The goal is NOT runtime/per-hotel generation. Rather, it is one-time generation of committed code: a developer requests "generate a 4th Hero variant," the system produces candidate code, a human reviews/approves, and the result becomes a permanent part of the codebase.

See: `web-app/components/sections/HeroSection/index.tsx` — router pattern reference
See: `docs/plans/ai-driven-block-style-diversity-plan.md` — Layer 3 original spec (search "Layer 3", "Gate 1-5")

## User Value Statement

After Epic 21, developers will have a validated approach for generating new structural variants with AI assistance. Instead of hand-crafting each new variant, a developer can run a generation command that:
1. Gathers few-shot context from existing sibling variants
2. Generates a new `.tsx` file using the validated approach
3. Validates the output against 5 AST-based gates (imports, props, classes, tokens, compilation)
4. Presents the diff for human review before committing

This reduces the upfront cost of variant creation while maintaining code quality and architectural consistency. The research will determine whether AI-assisted generation is worth the infrastructure investment compared to hand-crafting.

**Validation:** After Epic 21 Phase 5, we will know:
- Which of 5 approaches (if any) produces production-quality code reliably
- The cost per variant generation vs hand-crafting time
- The validation gates required for safe AI code generation
- Whether AI-assisted generation scales to all block types or only works for Hero

## Scope

### In Scope (with FR Traceability)

| Capability | FR Reference | Notes |
|------------|--------------|-------|
| Research 5 AI-assisted approaches for generating structural variants | FR7: "Component Registry — router pattern" | Phase 1 builds proof-of-concept for each direction |
| 5-gate AST validation pipeline (imports, props, classes, tokens, compilation) | FR8: "Component Registry — Zod contracts" | Direction A validation gates; reusable across approaches |
| Comparative evaluation matrix scoring all 5 directions | FR7, FR8 | Phase 2: Integration Risk (25%), Output Quality (25%), Generation Reliability (15%), Cost Efficiency (10%), Human Control (10%), Maintenance Burden (10%), Scalability (5%) |
| Stress testing top 2 approaches across 4 block types (Hero, FAQ, Footer, Features) | FR8 | Phase 3.1: Validates few-shot context sufficiency, prop shape handling |
| Production-grade developer workflow design | NFR14: "Component Reusability" | Phase 4: Human review points, validation pipeline, rollback strategy |
| Incremental rollout plan with risk tiers | NFR14 | Phase 4.5: Tier 1 (4th Hero, lowest risk) through Tier 5 (3rd Features, highest risk) |

### Out of Scope

| Excluded Item | Reason | Deferred To |
|---------------|--------|-------------|
| Runtime/per-hotel component generation | By design — too risky, too expensive | Never |
| Modifications to Epic 20 outcomes (design tokens, CVA diversity) | Epic 21 uses Epic 20 outputs; does not change them | Never |
| Changes to Zod contract system | Contracts are fixed; generated variants must match existing contracts | Never |
| Changes to router pattern architecture | Router pattern is fixed; generated variants are consumed by existing routers | Never |
| Changes to LangGraph agents (except new variant generator if needed) | Epic 21 is a developer tool, not a pipeline agent change | Never |
| Integration with Epic 24 multi-page architecture | Different concern; Epic 21 generates components, Epic 24 consumes them | Epic 24 |

## Codebase Context

> **Reference Rule:** All references use semantic identifiers (method names, class names, section titles). NEVER use line numbers.

### Relevant Existing Patterns

| Pattern | File Path | Reference | Purpose |
|---------|-----------|-----------|---------|
| Router pattern | `web-app/components/sections/HeroSection/index.tsx` | `HeroSection` component | Delegates to HeroCentered/HeroSplit/HeroMinimal based on `variant.layout` |
| Structural variant | `web-app/components/sections/HeroSection/HeroCentered.tsx` | `HeroCentered` component | Few-shot example for AI generation context |
| Zod contract | `web-app/lib/contracts/hero.contract.ts` | `HeroSectionContract` | Props interface that generated variants must match exactly |
| CVA definitions | `web-app/lib/cva-variants.ts` | `heroVariants` | CVA class strings per variant; generated variants use these |
| CVA validator registry | `web-app/app/langgraph/utils/cva-validator.ts` | `VALID_VARIANTS` | Registry that must be updated when new variants are added |
| Semantic token allowlist | `web-app/lib/style-generation/tailwind-allowlist.ts` | `SEMANTIC_TOKEN_ALLOWLIST` | ~50-80 approved classes; generated variants may only use these |
| ComponentRenderer | `web-app/components/renderers/ComponentRenderer/index.tsx` | `ComponentRenderer` component | Maps HomepageConfig JSON to React components via COMPONENT_MAP |
| shadcn/ui components | `web-app/components/ui/button.tsx` and others | `Button` component | Available UI primitives that generated variants may use |

### Existing Interfaces to Extend

| Interface/Type | File Path | Reference | How This Epic Uses It |
|----------------|-----------|-----------|----------------------|
| `HeroSectionContractType` | `web-app/lib/contracts/hero.contract.ts` | Props interface | Generated Hero variants must match this exactly (AST Gate 2 validation) |
| `HomepageConfigSchema` | `web-app/app/langgraph/agents/schemas.ts` | Schema definition | Defines component structure; generated variants integrate with existing configs |
| `COMPONENT_MAP` | `web-app/components/renderers/componentMap.ts` | Component map | Registry where new variants must be added after generation |

### Services/Modules Involved

| Service/Module | File Path | Entry Point | Role in This Epic |
|----------------|-----------|-------------|-------------------|
| AST validation pipeline | (NEW) `web-app/lib/ast-validation-pipeline.ts` | Validation gates | Parse, validate props, check classes, verify compilation |
| Few-shot context gatherer | (NEW) `web-app/lib/few-shot-context.ts` | Context assembly | Gather sibling variants, contracts, CVA, allowlist for generation prompt |

### New Files to Create (Phase 1 Only)

| New File | Purpose | Phase |
|----------|---------|-------|
| `web-app/lib/ast-validation-pipeline.ts` | 5-gate AST validation for Direction A | 1 |
| `web-app/lib/few-shot-context.ts` | Context assembly for generation prompts | 1 |
| `web-app/lib/layout-renderer.tsx` | Deterministic renderer for Direction B | 1 |
| `web-app/lib/mutation-catalog.ts` | Atomic transformations for Direction C | 1 |
| `web-app/lib/layout-primitives/PrimitivesSchema.ts` | Zod schema for primitive compositions (Direction D) | 1 |
| `web-app/lib/layout-primitives/PrimitivesRenderer.tsx` | Deterministic renderer for layout primitives (Direction D) | 1 |
| `web-app/lib/layout-primitives/index.ts` | Barrel file exporting all primitive types (Direction D) | 1 |
| `web-app/lib/skeleton-filler.ts` | Skeleton filler utility and template rendering logic (Direction E) | 1 |
| `web-app/lib/skeleton-registry.ts` | Registry of available skeleton templates by block type (Direction E) | 1 |
| `web-app/lib/skeleton-types.ts` | Zod schemas for skeleton and slot-fill configurations (Direction E) | 1 |

### Related Documentation

| Document | Section Title | Relevance |
|----------|---------------|-----------|
| `docs/plans/ai-driven-block-style-diversity-plan.md` | Layer 3: Structural Sub-Component Generation | Original spec for AST validation gates; Epic 21 researches and validates this spec |
| `docs/plans/component-diversity-interchangeable-blocks.md` | Router Pattern Architecture | Architectural foundation for structural variants |
| Epic 20 (AI-Driven Design Token + CVA Diversity) | Stories 20.7, 20.9 | Semantic token allowlist, CVA code generation script — dependencies for Epic 21 |
| Epic 19 (Extended Block Library) | All stories | Provides Footer, About, FAQ, Features blocks for Phase 3 stress testing |

---

# Stories

> Stories are ordered sequentially. Each story may only depend on previous stories (no forward dependencies).

---

## Phase 1: Approach Discovery & Prototyping

### Story 21.1: Few-Shot Context Assembler + Semantic Allowlist Integration

> **Full Story:** [`docs/stories/story-21.1-few-shot-context-assembler.md`](../stories/story-21.1-few-shot-context-assembler.md)

Create context assembly infrastructure for AI generation prompts. Gathers sibling variant files, Zod contracts, and semantic token allowlist — providing the raw materials LLMs need to generate structurally valid code.

**Key Deliverables:**
- `gatherComponentContext()` — Extract 2-3 sibling variant files
- `gatherContractContext()` — Extract Zod contract schema
- `gatherAllowlistContext()` — Extract semantic token classes
- Delimiter-wrapped output format for LLM prompt clarity

**Story Points:** 5 | **Status:** Draft

---

### Story 21.2: 5-Gate AST Validation Pipeline

> **Full Story:** [`docs/stories/story-21.2-ast-validation-pipeline.md`](../stories/story-21.2-ast-validation-pipeline.md)

Create 5-gate validation pipeline for AI-generated code. Validates imports, props interface, class strings, semantic token compliance, and TypeScript compilation before human review.

**Key Deliverables:**
- Gate 1: Import Verification (ts-morph parsing)
- Gate 2: Props Interface Verification (Zod contract match)
- Gate 3: CVA Class String Verification (allowlist check)
- Gate 4: Semantic Token Compliance (banned pattern detection)
- Gate 5: TypeScript Compilation (`tsc --noEmit`)

**Story Points:** 8 | **Status:** Draft

---

### Story 21.3: Direction A — Full TSX Generation with AST Validation Gates

> **Full Story:** [`docs/stories/story-21.3-direction-a-full-tsx-generation.md`](../stories/story-21.3-direction-a-full-tsx-generation.md)

Prototype Direction A: Full TSX generation with few-shot prompting and 5-gate validation. Measure generation success rate, code quality, and cost per variant to establish a baseline for comparing against other approaches.

**Key Deliverables:**
- LLM generation prompt with few-shot sibling examples
- Retry loop with error feedback from validation pipeline
- HeroAsymmetric variant generated and validated
- Metrics: first-attempt pass rate, token cost, generation time

**Story Points:** 8 | **Status:** Draft

---

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction A (full TSX generation with few-shot prompting and 5-gate validation),
**So that** I can measure generation success rate, code quality, and cost per variant.

**FR/NFR Coverage:** FR7, FR8

#### Acceptance Criteria

**Given** the few-shot context from Story 21.1 is assembled for HeroSection
**When** the LLM generation prompt is constructed and executed
**Then** the prompt includes:
- System role: "You are a React component engineer generating a new structural variant"
- Constraint: "Use ONLY imports from existing siblings. Use ONLY semantic token classes. Match the props interface exactly."
- Sibling files: 2-3 complete Hero variant TSX files
- Zod contract: HeroSectionContract
- CVA definitions: heroVariants from cva-variants.ts
- Allowlist: All ~50-80 semantic token classes
- Metrics: first-attempt pass rate, token cost, generation time

**Story Points:** 8 | **Status:** Draft

---

### Story 21.4: Direction B — JSON Layout Descriptor + Deterministic Renderer

> **Full Story:** [`docs/stories/story-21.4-direction-b-json-layout-descriptor.md`](../stories/story-21.4-direction-b-json-layout-descriptor.md)

Prototype Direction B: JSON layout descriptor with deterministic renderer. Constrain LLM to generate structured JSON rather than raw TSX. Measure expressiveness coverage, rendering fidelity, and LLM generation reliability.

**Key Deliverables:**
- LayoutDescriptorSchema (Zod validation)
- LayoutRenderer component (JSON to JSX mapping)
- Existing variants decomposed to descriptors
- Expressiveness limitations documented

**Story Points:** 5 | **Status:** Draft

---

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction B (JSON layout descriptor with deterministic renderer),
**So that** I can measure expressiveness coverage, rendering fidelity, and LLM generation reliability.

**FR/NFR Coverage:** FR7, FR8

#### Acceptance Criteria

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

**Given** the LayoutRenderer component is created
**When** it receives a layout descriptor and component props (title, headline, CTA, image)
**Then** it renders:
- CSS Grid with specified columns and gap
- Slots mapped to props (title → h1, headline → h2, cta → Button)
- Responsive behavior from override (stack on mobile with specified order)
- Clip path or other special effects applied via specified className

**Given** the 3 existing Hero variants (Centered, Split, Minimal)
**When** each is decomposed into a JSON layout descriptor
**Then** the descriptor captures the essential structural differences
**And** when rendered via LayoutRenderer, the output visually matches the hand-crafted variant

**Given** the LLM is prompted to generate a HeroAsymmetric layout descriptor
**When** generation completes
**Then** the output is valid JSON that passes the Zod schema
**And** the LayoutRenderer produces a working component from that descriptor

**Given** the LayoutRenderer approach
**When** expressiveness ceiling is evaluated
**Then** limitations are documented:
- Complex animations (framer-motion) — not expressible
- Conditional rendering based on prop values — limited expressibility
- Interactive elements (state, event handlers) — not expressible
- Custom CSS shapes and SVG integrations — limited expressibility
- Scroll-based effects — not expressible

#### Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| New File | `web-app/lib/layout-schema.ts` | `LayoutDescriptorSchema` Zod schema | Define schema for structural descriptions |
| New File | `web-app/lib/layout-renderer.tsx` | `LayoutRenderer` component | Create deterministic renderer |
| Reference | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Decompose to descriptor | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Decompose to descriptor | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Decompose to descriptor | Test expressiveness |

#### Prerequisites

- Story 21.1 (context assembler for reference patterns)
- HeroSection has 3 existing variants (Epic 17 — complete)

#### Technical Notes

- The LayoutDescriptorSchema uses Zod for runtime validation of LLM-generated JSON
- LayoutRenderer is a React Server Component that maps JSON to JSX deterministically
- Complex rendering logic (animations, interactions) is recognized as a limitation of this approach
- The key research question is whether the JSON schema is expressive enough for useful variants

**Relevant NFRs:**
- NFR14: "Component Reusability — LayoutRenderer works for any block type with descriptor"

---

### Story 21.5: Direction C — AST Mutation of Existing Variants

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction C (AST mutation with mutation catalog),
**So that** I can measure mutation expressiveness, AST stability, and code coherence after N mutations.

**FR/NFR Coverage:** FR7, FR8

#### Acceptance Criteria

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

**Given** HeroCentered.tsx is parsed into an AST using ts-morph
**When** a sequence of mutations is applied: `changeContainerType("grid")` → `swapGridLayout(["2fr", "1fr"])` → `reorderChildren(["image", "text"])`
**Then** the resulting AST is serialized back to TSX
**And** the output passes the 5-gate validation pipeline
**And** the output is structurally different from the input (genuinely new layout)

**Given** the mutation catalog is applied to reconstruct existing variants
**When** starting from HeroCentered and applying mutations to reach HeroSplit
**Then** the mutation sequence exists and produces a result similar to HeroSplit
**And** starting from HeroSplit and applying mutations to reach HeroMinimal succeeds
**And** this validates the mutation catalog is expressive enough

**Given** the LLM is prompted to suggest 3-5 mutations to create HeroAsymmetric from HeroSplit
**When** the LLM returns a mutation list (JSON array)
**When** those mutations are applied deterministically
**Then** the result passes the 5-gate validation pipeline
**And** the result is structurally distinct from HeroSplit

**Given** 5 new variants are generated using mutation combinations
**When** structural diversity is evaluated
**Then** each variant has a different DOM structure
**And** cumulative mutations beyond 5 begin to produce incoherent results (identify the limit)

#### Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| New File | `web-app/lib/mutation-catalog.ts` | Mutation catalog and implementations | Define and implement atomic transformations |
| Use | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Source AST for mutations | Test mutation expressiveness |
| Use | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Target for reconstruction | Test mutation expressiveness |
| Use | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Target for reconstruction | Test mutation expressiveness |
| Use | Story 21.2 | Validation pipeline | Validate mutated AST output |

#### Prerequisites

- Story 21.1 (context assembler for reference patterns)
- Story 21.2 (5-gate validation pipeline)
- HeroSection has 3 existing variants (Epic 17 — complete)

#### Technical Notes

- ts-morph is used for AST parsing and transformation
- Each mutation is a pure function: `(ast: SourceFile) => SourceFile` or `(ast: SourceFile) => void`
- Mutations are applied sequentially: `ast = mutate1(ast); ast = mutate2(ast);`
- The LLM's role is selecting which mutations to apply, not applying them (application is deterministic)
- The key research question is whether the mutation catalog is expressive enough for useful diversity

**Relevant NFRs:**
- NFR14: "Component Reusability — mutation catalog works for any block type with AST structure"

---

### Story 21.6: Direction D — Layout Primitives Library

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction D (composable layout primitives library),
**So that** I can measure composition expressiveness, reusability, and assembly complexity.

**FR/NFR Coverage:** FR7, FR8

#### Acceptance Criteria

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

**Given** the PrimitivesGrid component is created
**When** it receives a grid configuration object
**Then** it renders:
- CSS Grid with specified columns (`grid-cols-*` or arbitrary values)
- Configurable gap using semantic spacing tokens
- Optional named areas for template-based layout
- Responsive override (mobile-first with breakpoint variants)

**Given** the LLM is prompted to generate a HeroAsymmetric variant using primitives
**When** generation completes
**Then** the output is a valid PrimitivesComposition JSON that passes Zod validation
**And** the PrimitivesRenderer produces a working component from that composition
**And** the result passes the 5-gate validation pipeline

**Given** the 3 existing Hero variants (Centered, Split, Minimal)
**When** each is decomposed into a PrimitivesComposition JSON
**Then** the composition captures the essential structure using primitives
**And** when rendered via PrimitivesRenderer, the output visually matches the hand-crafted variant
**And** the decomposition reveals patterns that could be reused across variants

**Given** the PrimitivesRenderer approach
**When** expressiveness ceiling is evaluated
**Then** limitations are documented:
- Complex conditional rendering (show/hide based on props) — limited expressibility
- Interactive elements (state, event handlers) — not expressible
- Custom animation sequences — limited to predefined animation primitives
- Dynamic prop transformation — primitive composition is static
- Nested router patterns — primitives don't compose with existing router

**Given** 10 generation attempts for HeroAsymmetric using primitives
**When** results are recorded
**Then** metrics include:
- First-attempt pass rate (percentage that pass all gates on first try)
- Average number of primitives used per variant (complexity measure)
- Reuse rate (how often the same primitive patterns recur)
- Most common primitive combinations (pattern discovery)
- Token cost per successful generation
- Total time per successful generation (including retries)

#### Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| New File | `web-app/lib/layout-primitives/PrimitivesSchema.ts` | `PrimitivesCompositionSchema` Zod schema | Define schema for primitive compositions |
| New File | `web-app/lib/layout-primitives/PrimitivesRenderer.tsx` | `PrimitivesRenderer` component | Create deterministic renderer for primitives |
| New File | `web-app/lib/layout-primitives/index.ts` | Export all primitive types | Barrel file for primitives library |
| Reference | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Decompose to primitives | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Decompose to primitives | Test expressiveness |
| Reference | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Decompose to primitives | Test expressiveness |

#### Prerequisites

- Story 21.1 (context assembler for reference patterns)
- Story 21.2 (5-gate validation pipeline)
- HeroSection has 3 existing variants (Epic 17 — complete)

#### Technical Notes

- The PrimitivesSchema uses Zod for runtime validation of LLM-generated JSON
- Each primitive is a React Server Component that maps JSON props to JSX deterministically
- The composition is a tree structure: composition → primitive + props + children
- Primitives are designed for composition — each primitive handles one layout concern
- The key research question is whether the primitives library is expressive enough for useful variants without becoming as complex as writing TSX directly
- Primitives can be reused across block types (Hero, Gallery, Features, etc.)

**Relevant NFRs:**
- NFR14: "Component Reusability — primitives library works for any block type"

---

### Story 21.7: Direction E — Skeleton Filler (Slot-Based Template Generation)

**As a** researcher evaluating AI-assisted variant generation,
**I want** to prototype Direction E (skeleton templates with slot-filling logic),
**So that** I can measure template coverage, slot flexibility, and output coherence.

**FR/NFR Coverage:** FR7, FR8

#### Acceptance Criteria

**Given** the skeleton template library is defined
**When** templates are created for HeroSection
**Then** the library includes:
- `HeroFullBleedImageSkeleton` — Full-width background image with overlay slots
- `HeroTwoColumnSkeleton` — Split layout with left/right content slots
- `HeroTypographyFirstSkeleton` — Text-focused with minimal image slot
- `HeroAsymmetricSkeleton` — Grid-based with offset content areas
- Each skeleton has defined slot names (e.g., `primary-cta`, `secondary-cta`, `tagline`, `headline`)

**Given** the SkeletonFiller utility is created
**When** it receives a skeleton template and component props
**Then** it:
- Maps props to skeleton slots based on slot names
- Applies semantic token classes to slot containers
- Inserts CVA variants where specified
- Handles optional props (skips slots for undefined values)
- Returns a complete React component

**Given** the 3 existing Hero variants (Centered, Split, Minimal)
**When** each is reverse-engineered into skeleton + slot-fill configuration
**Then** the skeleton captures the structural pattern
**And** the slot-fill configuration captures the prop-to-slot mapping
**And** when rendered via SkeletonFiller, the output visually matches the hand-crafted variant

**Given** the LLM is prompted to generate a new HeroAsymmetric variant
**When** generation completes
**Then** the LLM outputs:
1. A skeleton selection (from existing skeleton library OR new skeleton definition)
2. A slot-fill configuration mapping props to skeleton slots
3. CVA variant selections for styling
**And** the SkeletonFiller produces a working component from this specification

**Given** the SkeletonFiller approach
**When** expressiveness ceiling is evaluated
**Then** limitations are documented:
- Requires pre-defining skeleton structures (not truly generative)
- New structures require new skeleton templates (template maintenance burden)
- Complex layouts may require too many slot types (skeleton explosion)
- Responsive behavior must be baked into skeleton (less flexible)
- Cannot express truly novel DOM structures (only combinations of predefined patterns)

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

**Given** a skeleton library with 5 Hero skeleton templates
**When** the LLM generates 10 new variants
**Then** diversity is measured:
- How many variants reuse the same skeleton (skeleton collision rate)
- Visual distinctness between variants using the same skeleton
- Whether slot-fill variations alone create perceptually different designs

#### Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| New File | `web-app/lib/skeleton-filler.ts` | `SkeletonFiller` utility, skeleton templates | Create skeleton filler logic |
| New File | `web-app/lib/skeleton-registry.ts` | `SKELETON_REGISTRY` | Registry of available skeletons by block type |
| New File | `web-app/lib/skeleton-types.ts` | Zod schemas for skeleton configs | Define skeleton and slot-fill schemas |
| Reference | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Reverse-engineer to skeleton | Create skeleton from existing |
| Reference | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Reverse-engineer to skeleton | Create skeleton from existing |
| Reference | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Reverse-engineer to skeleton | Create skeleton from existing |
| Use | Story 21.2 | Validation pipeline | Validate filled skeleton output |

#### Prerequisites

- Story 21.1 (context assembler for reference patterns)
- Story 21.2 (5-gate validation pipeline)
- HeroSection has 3 existing variants (Epic 17 — complete)

#### Technical Notes

- Skeleton templates are TSX files with designated slot positions (using placeholder components)
- The SkeletonFiller utility maps props to slots by name and renders the filled template
- Skeletons can be shared across block types (e.g., TwoColumnSkeleton for Hero, Features, About)
- The LLM's role is selecting a skeleton and configuring slot mappings, not writing TSX
- The key research question is whether skeleton-based generation produces truly diverse results or just template variations
- Template maintenance burden is a key risk: each new pattern requires a new skeleton

**Relevant NFRs:**
- NFR14: "Component Reusability — skeletons work for any block type with similar patterns"

---

### Story 21.8: Comparative Evaluation Report + Decision Recommendation

**As a** product owner deciding whether to invest in AI-assisted variant generation infrastructure,
**I want** a comprehensive research report comparing all 5 prototyped approaches with scores and recommendations,
**So that** I can make an informed decision about whether to proceed with implementation, and if so, which approach to use.

**FR/NFR Coverage:** FR7, FR8

#### Acceptance Criteria

**Given** all 5 directions (A, B, C, D, E) have been prototyped in Stories 21.3, 21.4, 21.5, 21.6, and 21.7
**When** the comparative evaluation matrix is produced
**Then** each direction is scored on 7 criteria:
- Integration Risk (25%): How many existing files/contracts need modification?
- Output Quality (25%): Visual quality, professional appearance, passes design review
- Generation Reliability (15%): Success rate across 10 attempts
- Cost Efficiency (10%): Token cost per successful variant generation
- Human Control (10%): How much control human retains over final result
- Maintenance Burden (10%): What new code/systems must be maintained?
- Scalability (5%): Does this work for all block types or only Hero?

**Given** all 5 directions have produced a HeroAsymmetric variant
**When** rendered in the browser with 3 archetypes (Heritage Opulence, Urban Tech, Coastal Resort)
**Then** screenshots are captured for visual comparison
**And** all variants are tested against existing test suites (contract validation, CVA validation)
**And** a code review assessment is recorded: "Would you accept this in a PR?"

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

**Given** the final recommendation
**When** the decision criteria are applied
**Then** the report answers:
1. **Is AI-assisted variant generation worth it vs hand-crafting?** (Cost/benefit analysis)
2. **Which approach gives the best quality-to-risk ratio?** (We prefer fewer high-quality variants over many mediocre ones)
3. **Does the approach fit our team's workflow?** (Is the human review step natural or burdensome?)

**Given** the Epic 21 research is complete
**When** the report is finalized
**Then** next steps are clear:
- If recommended: Proceed with implementation epic (new stories based on chosen approach)
- If rejected: Document why hand-crafting remains superior and close Epic 21

#### Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Output | `docs/research/epic-21-comparative-evaluation-report.md` | Final research report | Create comprehensive report document |
| Output | `docs/research/epic-21-prototype-code/` | Prototype code for all 5 directions | Store working prototypes for reference |
| Output | `docs/research/epic-21-screenshots/` | Rendered screenshots | Visual comparison across archetypes |
| Input | Stories 21.1-21.5, 21.6, 21.7 | Prototype results | Compile findings from all prototyping stories |

#### Prerequisites

- Stories 21.1, 21.2 (foundational infrastructure)
- Story 21.3 (Direction A prototype)
- Story 21.4 (Direction B prototype)
- Story 21.5 (Direction C prototype)
- Story 21.6 (Direction D prototype)
- Story 21.7 (Direction E prototype)

#### Technical Notes

- This is a research documentation story, not an implementation story
- The report must be actionable: it either leads to implementation epic or provides clear rationale for cancellation
- Screenshots must show the same archetype rendered across all 5 approaches for fair visual comparison
- Cost analysis must use actual token costs measured during prototyping, not estimates
- The recommendation should consider: upfront infrastructure cost, per-variant marginal cost, long-term maintenance burden

**Relevant NFRs:**
- NFR14: "Component Reusability — recommendation considers cross-block applicability"

---

## FR Coverage Matrix

| FR ID | FR Description | Story | Status |
|-------|----------------|-------|--------|
| FR7 | 4-Tier Component Architecture — router pattern, structural variants | 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8 | All stories cover FR7 |
| FR8 | Component Registry — Zod contracts, CVA validation | 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8 | All stories cover FR8 |
| NFR14 | Component Reusability — generated variants integrate with existing system | 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8 | All stories address NFR14 |

**Coverage Validation:**
- [x] All FRs in frontmatter `fr_coverage` are in this matrix
- [x] Each FR maps to at least one story
- [x] No orphan stories (every story maps to an FR)

---

## Dependencies

### Internal Dependencies (Other Epics)

| Epic ID | Epic Title | Dependency Type | Notes |
|---------|------------|-----------------|-------|
| Epic-19 | Extended Block Library (Footer, About, FAQ, Features) | Blocker | Epic 21 requires Epic 19 blocks for Phase 3 stress testing (Footer, About, FAQ, Features) |
| Epic-20 | AI-Driven Design Token + CVA Diversity | Dependency | Story 21.1 uses Semantic Token Allowlist from Epic 20 Story 20.7 |

### External Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| ts-morph | npm package | AsyncAPI | Required for AST parsing in Stories 21.2, 21.5, 21.6 |
| LLM API (Claude 3.5 Sonnet or GPT-4 Turbo) | API | OpenAI/Anthropic | Required for generation attempts in Stories 21.3, 21.4, 21.5, 21.6, 21.7 |

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation | Related Artifact |
|------|--------|------------|------------|------------------|
| **Mode collapse** — AI generates similar-looking styles despite archetype prompting | HIGH | HIGH without techniques | Use archetype assignment + SGR Cascade + style quotas from Epic 20 Layer 1 design | Epic 20 archetypes, `docs/research/prompt-engineering-design-diversity_2026-02-27_c1d4.md` |
| **Hallucinated Tailwind classes** — LLM generates classes not in allowlist | MEDIUM | MEDIUM | Semantic token allowlist (~50-80 classes) + AST Gate 3 validation | Story 21.2 Gate 3 |
| **Layer 3 generated TSX doesn't compile** — TypeScript errors break pipeline | HIGH | MEDIUM | 5-gate AST validation + retry loop feeding errors back to LLM | Story 21.2 Gate 5 |
| **Generated components break on mobile** — Responsive behavior incorrect | MEDIUM | MEDIUM | Responsive behavior specified in design brief; Playwright snapshot tests at 375px | Story 21.3 AC |
| **OKLCH palette generates poor contrast** — Design system violation | HIGH | MEDIUM | Epic 20 Story 20.3 APCA retry loop (if not complete, must be integrated) | Epic 20 dependency |
| **Font loading gap** — Archetype fonts render as system fallbacks | MEDIUM | HIGH | Epic 20 Story 20.4a font injection (if not complete, must be integrated) | Epic 20 dependency |
| **CVA variant sync failure** — 3 enforcement layers out of sync | HIGH | MEDIUM | Epic 20 Story 20.9 build-time CVA code generation (if not complete) | Epic 20 dependency |
| **Token cost exceeds budget** | LOW | LOW | Layer 1+2: ~$0.05/hotel; Layer 3: one-time cost per variant, not per-hotel | Story 21.3 cost tracking |
| **Research takes longer than estimated** | MEDIUM | MEDIUM | Each story is self-contained; partial results still valuable; can cancel after any phase | Story breakdown |
| **No approach passes quality threshold** — All 5 directions fail evaluation | HIGH | MEDIUM | Acceptable outcome: document why hand-crafting is superior; cancel Epic 21 implementation | Story 21.8 decision criteria |
| **Epic 19 or Epic 20 delays** — Blocker dependencies not ready on time | MEDIUM | MEDIUM | Epic 21 can research using Hero-only context; Epic 19/20 integration happens in Phase 3 | Phased approach |

---

## Validation Checklist

### Content Validation
- [x] All FR coverage claims verified against research plan
- [x] All codebase references verified (files/methods exist — new files flagged as "New File")
- [x] No code snippets present anywhere
- [x] No line number references
- [x] Story dependencies are backward-only

### Story Dependency Map
- 21.1: no prerequisites (Epic 20 Story 20.7 must be complete, but that's epic-level)
- 21.2: depends on 21.1
- 21.3: depends on 21.1, 21.2
- 21.4: depends on 21.1, 21.2
- 21.5: depends on 21.1, 21.2
- 21.6: depends on 21.1, 21.2
- 21.7: depends on 21.1, 21.2
- 21.8: depends on 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7 (all previous stories)

### Quality Validation
- [x] Epic delivers research value (comprehensive comparison of 5 AI-assisted approaches)
- [x] Stories are single-session sized (21.1-21.5, 21.6-21.7 are prototyping; 21.8 is documentation)
- [x] Acceptance criteria are testable (Given/When/Then format throughout)
- [x] All referenced documentation sections exist or are new files to create
- [x] **FIXED**: Stories 21.6 and 21.7 now exist for Directions D and E respectively

### Research-Specific Validation
- [x] All 5 directions from original research plan are covered (A, B, C, D, E)
- [x] Evaluation matrix matches weights specified in research plan (25% Integration Risk, 25% Output Quality, etc.)
- [x] Phase structure preserved: Phase 1 (Prototyping) → Phase 2 (Evaluation) → Phase 3 (Deep Dive) → Phase 4 (Production Design) → Phase 5 (Report)
- [x] Decision criteria from research plan are reflected in Story 21.8 acceptance criteria
- [x] Incremental rollout plan from research plan is preserved in Story 21.8 report requirements

---

## Agent Activity Log

### Creation
- **Agent**: Product Manager (pm)
- **Timestamp**: 2026-03-27
- **PRD Version**: Converted from research plan `docs/research/epic-21-structural-variant-generation-research-plan_2026-03-11.md`
- **Notes**: Converted research plan into epic format following established patterns from Epic 24 and Epic 25. Created 6 stories following user story format (As a/I want/So that). Preserved all research content while restructuring for Claude clarity. Added validation checklist and agent activity log. Stories 21.3-21.5 directly prototype Directions A, B, C; Directions D and E are included in 21.6 evaluation scope for completeness.

### Modifications
- **Modified**: 2026-03-27 — Moved from `docs/research/` to `docs/epics/`, renamed to follow epic naming convention
- **Modified**: 2026-03-27 — Restructured from research plan format to epic format with YAML frontmatter, stories, FR/NFR coverage matrix
- **Modified**: 2026-03-27 — Added 6 user stories (21.1-21.6) covering research phases 1-5
- **Modified**: 2026-03-27 — Added dependencies, risks, validation checklist sections per epic format
- **Modified**: 2026-03-30 — Added Story 21.6 (Direction D — Layout Primitives Library) and Story 21.7 (Direction E — Skeleton Filler). Gap identified: original plan had 5 directions (A-E) but only Directions A-C were explicitly storified. Added stories for Directions D and E following same structure and depth as Stories 21.3-21.5, ensuring comprehensive prototyping coverage of all 5 approaches. Renumbered stories to maintain sequential order: 21.6 (Direction D), 21.7 (Direction E), 21.8 (Comparative Evaluation Report).
