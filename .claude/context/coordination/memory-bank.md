---
type: coordination
name: memory-bank
updated_at: "2026-03-06T00:00:00Z"
---

# Memory Bank

Shared learnings and patterns discovered during development.

## Project Patterns

### Router Pattern (Component Diversity)
- Proven pattern for structural variants: parent component routes to sub-components based on `layout` or `variant` prop
- Used by: RoomCard (routes on `variant`), ImageGallery (routes on `layout`), Testimonials (routes on `layout`)
- Each sub-component has its own scoped CVA for cosmetic fine-tuning
- Contract validation happens in the router BEFORE delegation

### Dependency Parallelization
- When multiple sub-components share only a router/contract interface, they can be developed in parallel
- Epic 17 optimized: 17.2/17.3/17.4 all depend on 17.1 only (not on each other), reducing critical path from 5 to 3 levels

### Fixture-Driven Validation
- Epic 16 established: 3 fixture JSON configs (luxury/budget/business) + preview page for visual comparison
- New variants should update all 3 fixtures to demonstrate diversity across hotel types

## Common Issues

### Hallucination: Fabricated Source Quotes
- Epic 17 H002: Out of Scope table claimed PRD "explicitly" said "(OUT OF SCOPE)" when the PRD contains no such language
- Fix pattern: Attribute scope decisions to the plan document, not the PRD, when the PRD lists all variants without restrictions

### Hallucination: Numeric Count Errors
- Epic 17 H001: CVA compound variant count was "6" but actual is 9
- Fix pattern: Always verify numeric claims by reading the actual source file

### Hallucination: Archetype/Taxonomy Name Drift
- Epic 22 H002: 8 of 12 archetype names were invented instead of using canonical names from the diversity plan Section 3 (e.g., "Tropical Resort" instead of "Coastal Resort", "Alpine Lodge" instead of "Mountain/Wilderness")
- Fix pattern: When referencing domain taxonomies (archetypes, hotel types, etc.), always copy exact names from the authoritative source document. Never paraphrase or "improve" taxonomy labels — they are implementation keys.

### Hallucination: Wrong File Paths in Service Layer
- Epic 22 H001: CostMonitor referenced at `web-app/app/langgraph/utils/cost-monitor.ts` but actual location is `web-app/app/langgraph/services/CostMonitor.ts`
- Fix pattern: The LangGraph codebase has both `utils/` and `services/` directories. Always verify service class paths with glob/grep before referencing.

### Hallucination: Referencing Unimplemented Epic Features as Existing
- Epic 19 H001: Navigation router pattern (NavigationClassic/Centered/Minimal) described as "most recent router implementation" — actually planned in Epic 18 (status: ready, not completed). The current Navigation uses responsive split (Desktop/Mobile), not layout routing.
- Epic 19 H002: SectionRenderer described as having 4 configurable wrapper variants (accent/simple/numbered/none) — actually has hardcoded GoldAccentHeader from Epic 16. The 4-variant system is Epic 18 scope.
- Fix pattern: When an epic depends on another epic, verify whether the dependency is "completed" or merely "ready/planning". Only reference patterns that are actually implemented in the codebase.

## Agent Notes

### epic-creator
- When referencing PRD FR scope, be precise about what the PRD says vs what the plan says. PRD lists requirements; plan defines epic scope boundaries.
- CVA compound variant counts in cva-variants.ts should be counted from the actual compoundVariants array, not estimated.
- Dependencies between sub-component stories should be evaluated for true hard dependencies vs over-constrained linear chains. Independent sub-components typically only need the router interface, not each other.
- CVAValidator.VALID_VARIANTS is `private static readonly` — build-time code generation scripts must use AST manipulation within the class body, not external access.
- contrast-validator.ts has 7 light + 3 dark pairs (10 total), thresholds: Lc 75 body/AAA, Lc 60 non-body/AA.
- When embedding Zod field-level types as AC, group by sub-object (colorScheme types, typography types) rather than listing each field individually — prevents AC count inflation.
- For shared Zod enums used across multiple schemas, export a single `XxxSchema = z.enum([...])` constant and import it (DRY principle).
- cva-variants.ts has 578 lines (not 579).
- When referencing codebase patterns from dependency epics, verify the epic is status "completed" (not just "ready"). Epic 18 features (Navigation router, SectionRenderer 4-variant wrapper) are not yet in the codebase.
- Integration/registry stories that touch many files (10+) tend to exceed 8 AC. Pre-emptively merge related criteria (e.g., "renderer + schema registration" as one AC) to stay within limits.
- HeroSection router is currently the most reliable pattern reference for new router implementations (Epic 17 is complete).
- CostMonitor is at `services/CostMonitor.ts`, not `utils/cost-monitor.ts` — the langgraph directory has both `utils/` and `services/` subdirs.
- About component is at `components/sections/About/` (NOT `components/blocks/About`). FAQ is at `components/sections/FAQ/` (NOT `components/blocks/FAQ`). Both are Tier 3 section components, not Tier 2 blocks, despite being referenced as "blocks" in Epic 19 planning docs.
- `buildHreflangUrls()` in `lib/metadata/hotel-metadata.ts` is hard-coded for `/{lang}/hotels/{slug}` pattern. Any new route types need either generalization of this function or new utility functions.
- PRD's NFR3 is "Bundle Size and Optimization" (JS/CSS limits), NOT "SEO indexability". SEO indexability of sub-pages should be traced to FR6 ("SEO optimization, hreflang tags, language-specific sitemaps"). This mistake was made in Epic 24 and corrected during validation.
- The 12 canonical hotel visual archetypes are defined in `docs/plans/ai-driven-block-style-diversity-plan.md` Section 3. Always use exact names from there: Heritage Opulence, Quiet Luxury, Boutique Editorial, Urban Tech-Forward, Coastal Resort, Mountain/Wilderness, Wellness/Spa, Heritage Cultural, Eco Lodge, Design/Art Hotel, Family Resort, Business Hotel.
- For validation epics that depend on optional infrastructure (e.g., Epic 22 works with or without Epic 20), document "Dependency Flexibility" section explicitly listing what works at each level of completion. This was well-received by both validators.

### story-creator
_No notes yet._

### code-reviewer
_No notes yet._
