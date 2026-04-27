# Epics

This directory contains epic documentation for the project.

## Creating Epics

Use the `/create-epic` command:
```
/create-epic "Epic Name"
```

## Naming Convention

```
epic-{NN}.{domain}_{name}_{status}_{date}.md
```

Example: `epic-01.auth_user-login_planning_2025-01-15.md`

---

## Epic Index

| # | Epic Title | Status | FRs/NFRs Covered | Description |
|---|------------|--------|-------------|-------------|
| 1 | Core Structure | ✅ completed | Foundation | Project setup and core infrastructure |
| 2 | Foundation Validation | ✅ completed | Validation | CVA variants and ZOD contracts |
| 7 | LLM Generation Infrastructure | 🟢 ready | LLM | LangGraph multi-agent workflow |
| 11 | JSON-Based Content & Localization System | ✅ completed | FR6, FR13, FR14 | Runtime content updates and multi-language support (**superseded by Epic 14**) |
| 12 | Visual Excellence & Design System | ⚠️ blocked | N/A | Storybook integration and visual polish (BLOCKED: Story 7.12 incomplete) |
| 13 | Production Foundation & Technical Debt | 🟢 ready | NFR5, NFR11, NFR13, NFR14, NFR15, NFR16 | CRITICAL bug fixes for multi-hotel deployment, documentation cleanup, LangGraph completion |
| 14 | Build-Time Content Injection with ISR | 🟢 ready | NFR3, NFR4, NFR15 | SEO optimization with SSG/ISR for 10,000+ hotel sites |
| 15 | Algorithmic Design System - Typography Tokens | 🟢 ready | NFR1, NFR8, NFR14 | Semantic typography tokens, fluid scaling, spacing fixes |
| 16 | Dynamic Preview & Config Validation | ✅ closed | FR1, FR7, FR8, NFR14 | Phase 1 proof of concept: Multi-config preview via ComponentRenderer with gap analysis |
| 17 | Hero Section Structural Variants | ✅ done | FR1, FR7, FR8, FR10, NFR14 | Phase 2: Router pattern for 3 structural hero layouts (centered, split, minimal) - 3x diversity multiplier |
| 18 | Navigation Structural Variants & Section Wrapper System | 🟢 ready | FR5, FR7, FR8, FR10, NFR14 | Phase 3: Router pattern for 3 structural navigation layouts (classic, centered, minimal) + 4-variant configurable section wrapper system |
| 19 | Extended Block Library (Footer, About, FAQ, Features) | 🟡 planning | FR1, FR7, FR8, FR10, NFR7, NFR8, NFR12, NFR14 | Phase 4: 4 new block types with router pattern — Footer(3 variants), About(3), FAQ(2), Features(2) — multiplies structural combinations from 729 to 26,244 |
| 20 | AI-Driven Design Token + CVA Diversity | 🟡 planning | FR7, FR8, FR10, FR15 | Layer 1+2: AI archetype classification, OKLCH token generation with APCA contrast, typography diversity (6 personalities), CVA mood expansion (12 archetypes) |
| 21 | Structural Variant Generation | 🟡 research | FR7, FR8 | NFR14 | Research plan to evaluate 5 AI-assisted approaches for generating new structural variants that fit existing component system. Compares risk, cost, quality, and integration complexity. One-time generation (not per-hotel). |
| 22 | E2E Generation Diversity Validation | ✅ done | FR1, FR7, FR8, FR10, FR15, FR16, FR17 | Diversity scoring framework, generate 12 hotels (one per archetype), visual comparison matrix, prompt tuning, 50-hotel scale test |
| 23 | Spacing System Architecture Fix | 🟢 ready | NFR1, NFR8, NFR14 | Fix 3 compounding spacing bugs: outdated values, broken runtime density overrides, duplicate config key — aligns spacing with color system var() pattern |
| 24 | Multi-Page Architecture with i18n Routing | 🟢 ready | FR5, FR6, NFR4, NFR14 | Transitions from single-page to multi-page: 8 new i18n-routed sub-pages, curated homepage landing, individual room pages, extended navigation, full sitemap coverage. Story 24.14 WebsiteConfigSchema superseded by Epic 25 Story 25.1 |
| 25 | LangGraph Multi-Page Config Generation | 🟢 ready | FR7, FR8, NFR4, NFR14 | Extends LangGraph preview pipeline to produce WebsiteConfig: splitToPages() distributes components to pages, multiplyContent() clones LLM templates with seeded data, preview route gains page navigation, documentation purged of single-page references |

---

## Epic Details

### Epic 25: LangGraph Multi-Page Config Generation

**Status:** 🟢 ready
**File:** `epic-25.generation_multi-page-config_ready_2026-03-18.md`
**FRs:** FR7, FR8
**NFRs:** NFR4, NFR14

Extends the LangGraph generation pipeline from single-page `HomepageConfig` output to full `WebsiteConfig` covering homepage, rooms, gallery, amenities, reviews, contact, about, and FAQ pages. Three $0-cost post-processing utilities — `splitToPages()`, `multiplyContent()`, and a static seed bank — transform the existing LLM output without any LLM agent changes (except a trivial `pageMetadata` addition to ContentGenerator). The preview route at `/preview?config=name&page=rooms` renders the rooms page with realistic content volumes. All documentation is updated to describe only the multi-page architecture.

**Stories:**
- 25.1: WebsiteConfigSchema and splitToPages() Utility - ready
- 25.2: Content Seed Bank - ready
- 25.3: multiplyContent() Deterministic Cloner - ready
- 25.4: ContentGenerator pageMetadata Update - ready
- 25.5: Preview Route Multi-Page Support - ready
- 25.6: Generation Scripts Update - ready
- 25.7: Test Updates for Multi-Page Generation - ready
- 25.8: Documentation Alignment — Purge Single-Page References - ready

**Dependencies:**
- Depends on: Epic 24 (establishes multi-page routing concepts and page type vocabulary)
- Supersedes: Epic 24 Story 24.14 (WebsiteConfigSchema now defined in Epic 25 Story 25.1)

---

### Epic 24: Multi-Page Architecture with i18n Routing

**Status:** 🟢 ready
**File:** `epic-24.routing_multi-page-i18n_ready_2026-03-18.md`
**FRs:** FR5, FR6
**NFRs:** NFR3, NFR4, NFR14

Transitions the hotel website generator from single-page (all sections on one URL) to multi-page architecture following "Option C: Multi-Page with Homepage Summaries." The homepage becomes a curated landing page showing teasers with "View All" links. Eight new SSG/ISR pages are created under `app/[lang]/`: rooms listing, individual room detail (with slug generation), gallery, amenities, reviews, contact, about, and FAQ. All pages use `generateStaticParams()` + `generateMetadata()` + `revalidate = 3600` following the Epic 14 pattern. Navigation components are extended with all sub-page links and a configurable `menuItems` field. The sitemap is expanded to include all sub-pages with per-language hreflang. Legacy root `/rooms` and `/contact` pages become redirect stubs. The LangGraph `HomepageConfigSchema` is extended additively to `WebsiteConfigSchema` with page-level component configs.

**Stories:**
- 24.1: Section-Specific Data Loaders and Room Slug Utility - ready
- 24.2: Homepage Refactored to Curated Landing Page - ready
- 24.3: Rooms Listing Page (`/[lang]/rooms/`) - ready
- 24.4: Individual Room Detail Page (`/[lang]/rooms/[room-slug]/`) - ready
- 24.5: Gallery Page (`/[lang]/gallery/`) - ready
- 24.6: Amenities Page (`/[lang]/amenities/`) - ready
- 24.7: Reviews Page (`/[lang]/reviews/`) - ready
- 24.8: Contact Page Under `[lang]` Route - ready
- 24.9: About Page (`/[lang]/about/`) - ready
- 24.10: FAQ Page (`/[lang]/faq/`) - ready
- 24.11: Navigation Extension with All Sub-Page Links - ready
- 24.12: Sitemap Extension for All Sub-Pages - ready
- 24.13: Legacy Redirect Stubs for Root-Level Pages - ready
- 24.14: LangGraph Schema Extension and Tests - ready

**Dependencies:**
- Depends on: Epic 14 (SSG/ISR foundation - provides `generateStaticParams()` and ISR patterns)
- Compatible with: Epic 18 (Navigation structural variants), Epic 19 (About/FAQ blocks)
- Does NOT block any existing epics

---

### Epic 16: Dynamic Preview & Config Validation

**Status:** ✅ closed
**File:** `epic-16.preview_dynamic-preview-config-validation_ready_2026-02-12.md`
**FRs:** FR1, FR7, FR8
**NFRs:** NFR14
**Validation:** Hallucination Check CLEAN (0.94 confidence, 2 issues fixed) | Complexity VALID (1.6/5.0)

Phase 1 of Component Diversity plan - proof of concept that validates the interchangeable blocks architecture. Extends the existing `/preview` route (from Epic 7) to support URL-parameter-based fixture loading, feeds it 3 hand-crafted HomepageConfig JSONs (luxury boutique, budget hostel, business hotel), and visually verifies the system produces genuinely different websites. Gap analysis identifies which blocks need structural variants (Epic 17: Hero, Epic 18: Navigation).

**Stories:**
- 16.1: Dynamic Preview Page - Extend `/preview` route to accept URL-param-based config loading
- 16.2: Sample HomepageConfig Fixtures - Hand-craft 3 diverse JSON configs
- 16.3: Visual Comparison & Gap Analysis - Screenshots and diversity analysis document

**Dependencies:**
- Depends on: Epic 15 (Typography tokens - provides semantic typography system)
- Blocks: Epic 17 (Hero Structural Variants), Epic 18 (Navigation + Section Wrappers)

---

### Epic 17: Hero Section Structural Variants

**Status:** ✅ done
**File:** `epic-17.diversity_hero-structural-variants_done_2026-02-27.md`
**FRs:** FR1, FR7, FR8, FR10
**NFRs:** NFR14
**Validation:** Hallucination Check CLEAN (0.93 confidence, 2 issues fixed) | Complexity VALID (1.7/5.0)

Phase 2 of Component Diversity plan - transforms `HeroSection` from a single-structure component with 240 cosmetic CVA combinations into a router that delegates to three structurally distinct sub-components. Gap analysis from Epic 16 confirmed Hero is the #1 priority for structural variants (MEDIUM-LOW diversity rating). All 240 current combinations produce identical HTML; the three layout values only change Tailwind classes. After this epic, the `StylingAgent` can select from three genuinely different structures, tripling Hero diversity and increasing total structural combinations from 81 to 243.

**Stories:**
- 17.1: Hero Router Refactor - Update `HeroSection/index.tsx` to delegate based on `variant.layout`; update `HeroSectionContract` and `StylingAgentOutputSchema`
- 17.2: HeroCentered Sub-Component - Extract current `HeroContent` behavior into dedicated sub-component
- 17.3: HeroSplit Sub-Component - True CSS Grid two-column layout (text panel + image column)
- 17.4: HeroMinimal Sub-Component - Typography-focused design with no full-bleed background image
- 17.5: ComponentRenderer and Preview Integration - Update 3 Epic 16 fixtures to use distinct layouts; verify end-to-end rendering
- 17.6: Hero Variant Tests - Router delegation, fallback, sub-component rendering, contract validation

**Dependencies:**
- Depends on: Epic 16 (Dynamic Preview and Config Validation - completed, provides fixture infrastructure and gap analysis)
- Blocks: Epic 19 (Extended Block Library), Epic 20 (E2E Generation Validation)
- Epic 18 references Epic 17's router pattern but can run after Epic 17.1 is complete

---

### Epic 18: Navigation Structural Variants & Section Wrapper System

**Status:** 🟢 ready
**File:** `epic-18.diversity_navigation-variants-section-wrappers_ready_2026-02-24.md`
**FRs:** FR5, FR7, FR8, FR10
**NFRs:** NFR14
**Validation:** Hallucination Check ISSUES_FOUND (0.91 confidence, 2 issues fixed) | Complexity NEEDS_REVIEW (2.1/5.0, 0 principle violations)

Phase 3 of the Component Diversity plan - transforms `Navigation` from a single-structure component with cosmetic-only CVA variants into a router that delegates to three structurally distinct sub-components (Classic, Compact, Extended), and simultaneously evolves the existing `SectionRenderer` from Epic 16 into a configurable 4-variant section wrapper system (accent, simple, numbered, none). Gap analysis from Epic 16 confirmed Navigation as MEDIUM-LOW diversity (all fixtures produce identical HTML structures). All three Epic 16 fixtures will be updated with distinct nav layouts and wrapper configs to demonstrate genuine structural diversity.

**Stories:**
- 18.1: Navigation Router Refactor - Update `Navigation/index.tsx` to delegate based on `variant.layout`; update `NavigationContract` and `StylingAgentOutputSchema`; create 3 stub sub-components
- 18.2: NavigationClassic Sub-Component - Extract current NavigationDesktop + NavigationMobile behavior (logo left, links center, CTA right)
- 18.3: NavigationExtended Sub-Component - New asymmetric layout with logo top-left, nav links top-right, dummy booking widget bar below
- 18.4: NavigationCompact Sub-Component - New always-visible single-row layout with centered links (Home, Rooms, Contact)
- 18.5: Section Wrapper System - Evolve `SectionRenderer` to support 4 configurable wrapper variants; add `wrapper` field to `HomepageConfigSchema`; create `SectionWrapperContract`
- 18.6: Fixture Updates, Preview Integration & Tests - Update 3 fixtures with distinct nav layouts + wrapper configs; router delegation tests; wrapper variant tests

**Dependencies:**
- Depends on: Epic 16 (Dynamic Preview and Config Validation), Epic 17 (Hero Structural Variants - provides router pattern reference)
- Blocks: Epic 19 (Extended Block Library), Epic 20 (E2E Generation Diversity Validation)

---

### Epic 19: Extended Block Library (Footer, About, FAQ, Features)

**Status:** 🟡 planning
**File:** `epic-19.diversity_extended-block-library_planning_2026-02-27.md`
**FRs:** FR1, FR7, FR8, FR10
**NFRs:** NFR7, NFR8, NFR12, NFR14
**Validation:** Hallucination Check ISSUES_FOUND (0.88 confidence, 2 issues fixed) | Complexity NEEDS_REVIEW (2.2/5.0, 0 principle violations)

Phase 4 of the Component Diversity plan — adds 4 new block types (Footer, About, FAQ, Features) each with 2-3 structural variants using the router pattern proven in Epics 17-18. Footer has 3 layouts (Classic, Minimal, Stacked), About has 3 layouts (SideBySide, Timeline, FullWidth), FAQ has 2 layouts (Accordion, Grid), Features has 2 layouts (IconGrid, Cards). All new blocks integrate with ComponentRenderer, LangGraph agents, and CVA validation system. Multiplies structural combinations from 729 to 26,244 (36× increase).

**Stories:**
- 19.1: Footer Block - 3 structural variants (Classic, Minimal, Stacked) with Zod contract + CVA + router
- 19.2: About / Hotel Story Block - 3 structural variants (SideBySide, Timeline, FullWidth) with image position support
- 19.3: FAQ Block - 2 structural variants (Accordion using shadcn/ui, Grid) with WCAG keyboard navigation
- 19.4: Features / USP Block - 2 structural variants (IconGrid with Lucide icons, Cards with images)
- 19.5: Registry & Pipeline Updates - Update ComponentRenderer, schemas, CVAValidator, all 5 LangGraph agents, fixtures
- 19.6: New Block Tests - Router delegation, contract validation, sub-component rendering, CVA validation tests (~23 test suites)

**Dependencies:**
- Depends on: Epic 17 (Hero Structural Variants - provides router pattern), Epic 18 (Navigation Variants & Section Wrappers)
- Blocks: Epic 21 (AI-Driven Structural Variant Generation), Epic 22 (E2E Generation Diversity Validation)

---

### Epic 20: AI-Driven Design Token + CVA Diversity

**Status:** 🟡 planning
**File:** `epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md`
**FRs:** FR7, FR8, FR10, FR15
**NFRs:** NFR1, NFR7, NFR12, NFR14
**Validation:** Hallucination Check ISSUES_FOUND (0.88 confidence, 2 issues fixed) | Complexity NEEDS_REVIEW (2.4/5.0, 2 principle violations)

Layers 1-2 of the AI-Driven Block Style Diversity plan. Introduces AI-driven style generation: (1) an ArchetypeClassifier agent classifying hotels into 12 visual archetypes, (2) a TokenGenerator agent producing archetype-specific OKLCH color palettes with APCA contrast validation, (3) a typography diversity system with 6 font personalities pre-loaded via `next/font/google`, (4) a CVAVariantAgent generating archetype-specific Tailwind class strings, and (5) a build-time code generation script that writes into the 3 CVA enforcement layers atomically. Key paradigm: AI generates styling data (Zod-validated JSON), not code.

**Stories (11):**
- 20.1: HotelDesignTokens Schema + Archetype Token Map
- 20.2: ArchetypeClassifier Agent
- 20.3: TokenGenerator Agent + APCA Contrast Retry Loop
- 20.4a: Font Injection Pipeline (pre-load 7 Google Fonts)
- 20.4: Typography Mapper
- 20.5: Token Pipeline Integration
- 20.6: Update LangGraph Workflow
- 20.7: Semantic Token Allowlist
- 20.8: CVAVariantMap Schema + CVAVariantAgent
- 20.9: Build-Time CVA Code Generation Script
- 20.10: StylingAgent Enhancement

**Dependencies:**
- Depends on: Epic 18 (Navigation Variants + Section Wrappers)
- Blocks: Epic 21 (AI Structural Variant Generation), Epic 22 (E2E Diversity Validation)
- Can run in parallel with Epic 19

---

### Epic 21: Structural Variant Generation

**Status:** 🟡 research
**File:** `epic-21.structural-variant-generation-research-plan_research-planning_2026-03-11.md`
**FRs:** FR7, FR8
**NFRs:** NFR14

Research plan to evaluate 5 AI-assisted approaches for generating new structural variants that fit the existing component system, comparing risk, cost, quality, and integration complexity. Goal: Find safe, reliable way for AI to generate production-quality React component variants that follow strict rules (semantic tokens, Zod contracts, router pattern, CVA validation). Output is one-time generation committed to codebase (not per-hotel runtime generation).

**Research Directions (5):**
- Direction A: Full TSX Generation with AST Validation Gates — LLM generates complete .tsx file, validated by 5 AST-based gates
- Direction B: JSON Layout Descriptor + Deterministic Renderer — LLM generates JSON describing layout structure
- Direction C: AST Mutation of Existing Variants — Apply controlled transformations from a mutation catalog
- Direction D: Composable Layout Primitives — AI selects and arranges reusable structural building blocks
- Direction E: Hybrid Skeleton + AI Fill — Human creates skeleton, AI fills in CVA classes

**Phases:**
1. Approach Discovery & Prototyping — Build proof-of-concept for each direction (one Hero variant)
2. Comparative Evaluation — Test all 5 against quality, reliability, cost, safety criteria
3. Deep Dive on Top 2 — Stress test on multiple block types, build pipeline prototype
4. Production Design — Developer workflow, validation gates, registry updates, cost analysis
5. Research Report — Comparison matrix, prototype code, recommendation, risk assessment

**Dependencies:**
- Depends on: Epic 19 (Extended Block Library), Epic 20 (AI-Driven Design Token + CVA Diversity)
- Blocks: Epic 22 (E2E Generation Diversity Validation)

---

### Epic 22: E2E Generation Diversity Validation

**Status:** 🟢 ready
**File:** `epic-22.validation_e2e-diversity-validation_planning_2026-03-06.md`
**FRs:** FR1, FR7, FR8, FR10, FR15, FR16, FR17
**Validation:** Hallucination Check ISSUES_FOUND (0.82 confidence, 3 issues fixed) | Complexity NEEDS_REVIEW (2.1/5.0, 2 principle violations)

Validates that the generation system produces perceptually diverse websites across all 12 hotel visual archetypes. Creates a diversity scoring framework (structural + thematic + visual dimensions), generates 12 hotel websites (one per archetype), produces a visual comparison matrix with diversity report, tunes LangGraph agent prompts based on findings, and runs a 50-hotel scale test to validate diversity at volume and cost targets. Designed to work with or without Epic 20 completion.

**Stories (5):**
- 22.1: Diversity Scoring Framework (structural + thematic + visual)
- 22.2: Generate 12 Hotel Websites (one per archetype)
- 22.3: Visual Comparison Matrix + Diversity Report
- 22.4: LangGraph Agent Prompt Tuning
- 22.5: Scale Test: Generate 50 Hotels

**Dependencies:**
- Depends on: Epic 19 (Extended Block Library), Epic 20 (AI-Driven Design Token + CVA Diversity — optional, epic works without it)
- Flexible: Works with current 5-type system if Epic 20 not complete

---

### Epic 23: Spacing System Architecture Fix

**Status:** 🟢 ready
**File:** `epic-23.design-system_spacing-architecture-fix_ready_2026-03-11.md`
**NFRs:** NFR1, NFR8, NFR14
**Validation:** Hallucination Check ISSUES_FOUND (0.90 confidence, 2 issues fixed) | Complexity VALID (1.4/5.0)

Fixes 3 compounding spacing bugs: (1) `globals.css` has outdated section spacing values (48-80px instead of Story 15.1's validated 32-64px), (2) `@theme inline` uses literal clamp() values instead of `var()` references, preventing the density system from working at runtime, (3) duplicate `spacing` key in `tailwind.config.js` silently drops semantic tokens. Aligns spacing architecture with the proven color system `var(--*-val)` indirection pattern.

**Stories (4):**
- 23.1: Align Spacing Tokens with Color System Architecture (globals.css var() indirection + corrected defaults)
- 23.2: Update Spacing Mapper to Target `-val` Variables (spacing-mapper.ts key rename)
- 23.3: Fix Duplicate Spacing Key in Tailwind Config (merge/remove JS config spacing)
- 23.4: Update Tests for Spacing Variable Rename (test assertions + build verification)

**Dependencies:**
- Depends on: Epic 15 (Story 15.1 provides validated clamp() formulas)
- Epic 20 Story 20.5 introduced the broken pattern (already complete)

---

### Epic 24: Multi-Page Architecture with i18n Routing

**Status:** 🟢 ready
**File:** `epic-24.routing_multi-page-i18n_ready_2026-03-18.md`
**FRs:** FR5, FR6
**NFRs:** NFR4, NFR14
**Validation:** Hallucination Check ISSUES_FOUND (0.83 confidence, 5 issues fixed) | Complexity NEEDS_REVIEW (2.2/5.0, 1 principle violation)

Transitions the hotel website from single-page architecture (all sections on homepage with anchor links) to multi-page architecture where each content section has its own dedicated, language-aware, statically generated URL. Homepage becomes a curated landing page with teasers and "View All" links. Individual room pages enable long-tail SEO. Navigation extends to link all sub-pages. Sitemap covers all pages with full hreflang support.

**Stories (14):**
- 24.1: Section-Specific Data Loaders and Room Slug Utility
- 24.2: Homepage Refactored to Curated Landing Page
- 24.3: Rooms Listing Page
- 24.4: Individual Room Detail Page
- 24.5: Gallery Page
- 24.6: Amenities Page
- 24.7: Reviews Page
- 24.8: Contact Page Under [lang] Route
- 24.9: About Page
- 24.10: FAQ Page
- 24.11: Navigation Extension with All Sub-Page Links
- 24.12: Sitemap Extension for All Sub-Pages
- 24.13: Legacy Redirect Stubs for Root-Level Pages
- 24.14: LangGraph Schema Extension and Tests

**Dependencies:**
- Depends on: Epic 14 (SSG/ISR foundation)
- Soft dependency: Epic 19 (About/FAQ blocks - graceful fallback if not available)

---

### Epic 11: JSON-Based Content & Localization System

**Status:** 🟢 ready
**File:** `epic-11.content_json-content-system_ready_2026-01-14.md`
**FRs:** FR6, FR13, FR14
**Validation:** Hallucination Check PASSED (0.94 confidence) | Complexity VALID (2.1/5.0)

Enable runtime content updates without rebuilding 10,000+ hotel websites by separating text content, media references, and configuration from React components into JSON files hosted on CDN. Implements foundation for multi-language support (4+ locales) and instant content updates critical for platform scalability.

**Stories:**
- 11.1: Content Schema Foundation - planning
- 11.2: Content Loading Hooks - planning
- 11.3: Variable Resolution System - planning
- 11.4: Component Content Migration (Homepage) - planning
- 11.5: Localization Support - planning
- 11.6: LangGraph Content Generation - planning
- 11.7: Comprehensive Edge Testing - planning

---

### Epic 12: Visual Excellence & Design System

**Status:** ⚠️ blocked (Story 7.12 incomplete - 81% complete, 4 pending human review tasks)
**File:** `epic-12-visual-excellence_design-system_storybook_needs-review_2025-01-14.md`
**FRs:** N/A (Visual polish epic - no new FRs)
**Validation:** Hallucination Check CRITICAL_ISSUES (0.77 confidence) | Complexity VALID (1.8/5.0)

Transform the homepage into a visually stunning, production-ready showcase with comprehensive Storybook integration and consistent Tailwind variant patterns. Includes visual polish (animations, transitions, hover states), variant consistency validation, responsive design validation at 4 breakpoints, and Chromatic visual regression integration.

**BLOCKING DEPENDENCY:** Story 7.12 must be complete before Epic 12 can proceed. Story 7.12 has 4 pending human review tasks (AC2.2 naming decision, AC4.3 CTA scaling, AC4.4 mobile spacing, AC4.5 overlay contrast).

**Tasks (8 implementation tasks, 12-15 days):**
- Task 1: Storybook Setup (2-3 days)
- Task 2: Design System Documentation (1 day)
- Task 3: Component Stories (3-4 days)
- Task 4: Visual Polish (2-3 days)
- Task 5: Variant Consistency Validation (1-2 days)
- Task 6: Responsive Validation (1 day)
- Task 7: Chromatic Integration (1 day)
- Task 8: Documentation & Handoff (1 day)

**Open Questions (4):**
1. Chromatic budget: Free tier vs paid plan?
2. Storybook hosting: Chromatic vs Vercel vs internal?
3. Animation scope: Minimal vs moderate vs comprehensive?
4. Variant coverage: All 900+ combos or representative subset?

---

### Epic 13: Production Foundation & Technical Debt

**Status:** 🟢 ready
**File:** `epic-13.production-foundation_technical-debt_ready_2026-01-28.md`
**NFRs:** NFR5, NFR11, NFR13, NFR14, NFR15, NFR16
**Validation:** Hallucination Check CLEAN (0.95 confidence) | Complexity VALID (2.2/5.0)

Addresses **CRITICAL and HIGH priority technical debt** discovered after Epic 12 completion that blocks production deployment for multi-hotel platform. Two CRITICAL bugs make 10,000+ hotel deployment impossible: (1) hardcoded "The Sterling Executive" defaults that would appear on all hotels when content system fails (FIXED), and (2) 36 findings of outdated HSL/HEX color system documentation that mislead AI agents. Also completes incomplete LangGraph workflow (Stories 7.8-7.10), removes ContentGenerator TODOs for production deployment, enables content system by default, and fixes pre-existing test failures.

**FIXES APPLIED (2026-01-28):**
- ✅ Stories 13.1.1 and 13.1.2 marked as "Already Complete" (defaults.ts exists with generic placeholders, components use CONTENT_DEFAULTS)
- ✅ Story 13.3.3 kept as XL (accepted complexity - combining tests, benchmarks, documentation)
- ✅ Story 13.3.5 kept as-is (accepted YAGNI concern - human-in-the-loop integration)
- ✅ Story 13.6.1 updated - removed specific test count, using generic "pre-existing test failures"
- ✅ Story 13.3.1 kept as-is (accepted KISS concern - complex orchestration in single story)

**Sub-Epics (6):**
- 13.1: Fix Epic 11 Hardcoded Defaults (CRITICAL) - 2 days ✅ **2 stories already complete**
- 13.2: Documentation Cleanup (CRITICAL) - 1-2 days
- 13.3: Complete LangGraph Workflow (HIGH) - 3-5 days
- 13.4: ContentGenerator Production Readiness (HIGH) - 1 day
- 13.5: Content System Feature Flags (MEDIUM) - 0.5 day
- 13.6: Test Suite Health (MEDIUM) - 1-2 days

**Total Stories:** 19 (2 complete + 17 remaining)
**Estimated Effort:** 6-10 days

**Research References:**
- `docs/research/epic-11-hardcoded-defaults-analysis_2026-01-22_f7a9.md`
- `docs/research/old-color-system-remnants-audit_2026-01-28_d7e3.md`

---

### Epic 14: Directus-Powered SSG with ISR for Multi-Language Hotel Websites

**Status:** 🟢 ready
**File:** `epic-14.static-site-generation_isr_ready_2026-01-28.md`
**NFRs:** NFR3, NFR4, NFR15
**Validation:** Hallucination Check CLEAN (1.0 confidence) | Complexity VALID (2.4/5.0)

Enable immediate SEO indexing and optimal Core Web Vitals for 100,000+ hotel websites by implementing build-time content injection using Directus headless CMS as the data source, with Incremental Static Regeneration (ISR) for content freshness.

**Architecture Change (2026-01-29):** This epic **replaces** Epic 11's JSON file approach with **Directus API calls at build-time**. The JSON synchronization pipeline is eliminated in favor of direct API integration, providing simplified architecture, real-time content updates via ISR, and full TypeScript support.

**Key Benefits:**
- ✅ Immediate SEO indexing (content in initial HTML)
- ✅ Superior performance (LCP ~0.8-1.2s vs ~1.5-2.5s)
- ✅ Works without JavaScript for core content
- ✅ Lower infrastructure costs (20-40% cheaper)
- ✅ CDN-cached full HTML pages

**Stories (8):**
- 14.1: SSG Foundation - generateStaticParams Implementation (2-3 days)
- 14.2: Build-Time Content Injection Pipeline (2-3 days)
- 14.3: ISR Implementation (Time-Based + On-Demand) (2-3 days)
- 14.4: SEO Metadata Generation at Build Time (2-3 days)
- 14.5: Hybrid Architecture - Client Components for Dynamic Features (1-2 days)
- 14.6: Sitemap Generation for Static Sites (2 days)
- 14.7: Build Time Optimization for 10,000 Sites (4-5 days)
- 14.8: Performance Testing - Core Web Vitals (2-3 days)

**Total Stories:** 8
**Estimated Effort:** 14-20 days

**Research Reference:**
- `docs/research/build-time-vs-runtime-content-seo_2026-01-28_a7f2.md`

---

## FR/NFR Coverage Summary

| FR | Epic(s) | Coverage Status |
|----|---------|-----------------|
| FR1 | Epic 16, Epic 17 | Homepage Hero Section - dynamic rendering and structural variants |
| FR5 | Epic 18 | Navigation with Responsive Variants - 3 structural layouts (Classic, Centered, Minimal) |
| FR6 | Epic 11 (replaced by Epic 14) | Multi-language support with 4+ locales |
| FR7 | Epic 16, Epic 17, Epic 18, Epic 25 | 4-Tier Component Architecture - ComponentRenderer + HeroSection Tier 3 + Navigation Tier 3 + SectionRenderer Tier 2 + splitToPages() page distribution |
| FR8 | Epic 16, Epic 17, Epic 18, Epic 25 | Component Registry with Formal Zod Contracts - NavigationContract, SectionWrapperContract, WebsiteConfigSchema |
| FR10 | Epic 17, Epic 18 | Component Variant Specifications - HeroSection (Centered, Split, Minimal) + Navigation (Classic, Centered, Minimal) |
| FR13 | Epic 11 (replaced by Epic 14) | CMS integration via Directus API |
| FR14 | Epic 11 (replaced by Epic 14) | BackBlaze B2 extended for content storage |

**NFR Coverage (Epic 13 + 14 + 15 + 16 + 17):**
| NFR | Coverage Status |
|-----|-----------------|
| NFR1 | Typography - Epic 15: Semantic typography tokens, fluid scaling |
| NFR3 | SEO - Epic 14: Build-time content injection for immediate indexing | Core Web Vitals compliance (LCP <2.0s desktop, <2.5s mobile) |
| NFR4 | Performance - Epic 14: SSG/ISR optimization | Page load performance, build time <45 min for 10k sites |
| NFR5 | Security Framework - HTTPS, CSP headers, JWT validation |
| NFR8 | Responsive Design - Epic 15: Typography tokens + responsive breakpoints |
| NFR11 | Backend Integration Reliability - <1% error rate |
| NFR13 | LangFuse Observability Requirements - 100% LLM call tracking |
| NFR14 | Component Reusability - Epic 16 (gap analysis), Epic 17 (3 hero variants), Epic 18 (3 nav variants + 4 wrapper styles across hotel types) |
| NFR15 | Website Availability - 99.5%+ uptime |
| NFR16 | API Error Handling - <1% error rate, graceful degradation |

---

## Epic 14: Build-Time Content Injection with ISR

**Status:** 🟡 planning
**File:** `epic-14.static-site-generation_isr_planning_2026-01-28.md`
**NFRs:** NFR3, NFR4, NFR15

Enable immediate SEO indexing and optimal Core Web Vitals for 10,000+ hotel websites by implementing build-time content injection with Incremental Static Regeneration (ISR). Epic 11 implemented runtime JSON loading, which has SEO limitations according to research findings. This epic **enhances** Epic 11 by adding build-time compilation while keeping JSON files as the source of truth.

**Research Basis:** `docs/research/build-time-vs-runtime-content-seo_2026-01-28_a7f2.md`
- Google JavaScript rendering has median 10-second delay, 90th percentile ~3 hours
- Runtime JSON loading risks: content may take hours to index, JavaScript dependency, crawl budget inefficiency
- Build-time injection provides immediate SEO indexing, superior performance (LCP ~0.8-1.2s vs ~1.5-2.5s)

**Stories (8):**
- 14.1: SSG Foundation - generateStaticParams Implementation (2-3 days)
- 14.2: Build-Time Content Injection Pipeline (2-3 days)
- 14.3: ISR Implementation - Time-Based + On-Demand (2-3 days)
- 14.4: SEO Metadata Generation at Build Time (2-3 days)
- 14.5: Hybrid Architecture - Client Components for Dynamic Features (2-3 days)
- 14.6: Sitemap Generation for Static Sites (1-2 days)
- 14.7: Build Time Optimization for 10,000 Sites (2-3 days)
- 14.8: Performance Testing - Core Web Vitals (1-2 days)

**Total Estimated Effort:** 14-20 days

---

### Epic 15: Algorithmic Design System - Typography Tokens

**Status:** 🟢 ready
**File:** `epic-15.design-system_algorithmic-typography_ready_2026-02-03.md`
**NFRs:** NFR1, NFR8, NFR14
**Validation:** Hallucination Check ISSUES_FOUND (0.96 confidence, 1 LOW fixed) | Complexity VALID (1.6/5.0)

Extends the design system with **semantic typography tokens** following the established OKLCH color token pattern. Fixes broken spacing clamp() formulas, creates fluid typography tokens, adds text-trim utility, and migrates key components (HeroSection, RoomCard) to semantic tokens.

**Research Basis:**
- `docs/research/fluid_clamp_formula_validation_2026-02-03_b7e4.md` - Mathematical validation of spacing fixes
- `docs/research/fontkit_capsize_algorithmic_typography_2026-02-03_a1f2.md` - Text-trim approach using CSS text-box-trim
- `docs/research/font-orchestrations-deferral-analysis_2026-02-03_f8a2.md` - Font orchestrations SAFE TO DEFER

**Stories (5):**
- 15.1: Fix Broken Spacing clamp() Formulas (0.25 day)
- 15.2: Create Typography Tokens CSS File (0.5 day)
- 15.3: Add Text-Trim Alignment Utility (0.5 day)
- 15.4: Migrate HeroSection to Semantic Typography (0.5-1 day)
- 15.5: Migrate RoomCard Variants to Semantic Typography (0.5-1 day)

**Total Estimated Effort:** 2.5-3.5 days

**Future Extensions (SAFE TO DEFER):**
- Font Orchestrations - predefined font combinations for AI selection
- useHotelTheme Typography Extensions - custom font sizes per hotel

---

## Status Legend

- 🟢 ready
- 🟡 planning
- 🔵 in-progress
- ✅ completed
- 🔴 blocked

---

**Last Updated:** 2026-03-18 (Epic 25 added)
