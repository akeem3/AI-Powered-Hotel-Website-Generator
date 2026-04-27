---
type: epic
epic_number: "15"
id: "15-design-system-algorithmic-typography"
status: completed
priority: high

# Timestamps
created_at: "2026-02-03T12:00:00Z"
updated_at: "2026-02-06T12:00:00Z"
target_completion: "2026-02-06"

# Agent tracking
created_by: epic-creator
updated_by: archivist

# Source Document References
prd_reference: "docs/prd.md"
architecture_reference: "docs/architecture.md"
proposal_reference: "docs/proposals/AlgorithmicDesignSystem_Implementation_Proposal.md"

# Research References
research_references:
  - "docs/research/fluid_clamp_formula_validation_2026-02-03_b7e4.md"
  - "docs/research/fontkit_capsize_algorithmic_typography_2026-02-03_a1f2.md"
  - "docs/research/utopia_core_fluid_typography_tailwind_v4_2026-02-03_8ac4.md"
  - "docs/research/usehoteltheme_typography_extension_analysis_2026-02-03_f9a4.md"
  - "docs/research/font-orchestrations-deferral-analysis_2026-02-03_f8a2.md"

# NFR Coverage
nfr_coverage:
  - NFR1: "Core Web Vitals Compliance - Fluid typography improves CLS"
  - NFR8: "Responsive Design Standards - Semantic typography tokens"
  - NFR14: "Component Reusability - Typography tokens work across all hotels"

# Dependencies
depends_on:
  - "13-production-foundation"
blocks: []

# Progress tracking
stories_count: 5
stories_completed: 5
stories_in_progress: 0
stories_blocked: 0

# Validation Results
hallucination_check:
  status: CLEAN
  validated_at: "2026-02-03T15:30:00Z"
  confidence: 0.94
  issues_count: 0
  notes: "All references verified."

complexity_validation:
  status: PASS
  validated_at: "2026-02-06T15:30:00Z"
  overall_score: 1.8
  stories_needing_review: []
  principle_violations: 0

verification:
  last_verified_at: "2026-02-06T15:30:00Z"
  status: VERIFIED
  ready_for_stories: false
  overall_score: 100

# Lifecycle
tags:
  - design-system
  - typography
  - fluid-scaling
  - tailwind-v4
  - css-variables
archival_date: "2026-02-06"
---

# Epic 15: Algorithmic Design System - Typography Tokens

## 1. High-Level Overview
This epic extends the hotel website generator's design system with **semantic typography tokens** following the established OKLCH color token pattern. It replaces inconsistent, static Tailwind classes and broken spacing formulas with a mathematically validated, fluid scaling system (`375px` to `768px`) using CSS `clamp()` and native browser features like `text-box-trim`.

## 2. Global Rationale
Prior to this epic, typography scaling was handled via manual breakpoint jumps (`text-sm md:text-lg`), leading to jarring transitions and poor readability on intermediate devices (foldables, tablets). By implementing semantic tokens (`text-size-h1`, `text-size-body`), we ensure:
1.  **Smooth Scaling**: Linearly interpolated font sizes across the full mobile-to-tablet range.
2.  **Maintainability**: Centralized token definitions rather than scattered utility classes.
3.  **Visual Excellence**: Optical alignment of text and icons, and consistent vertical rhythm.
4.  **Performance**: Native CSS implementation with minimal runtime overhead.

## 3. Completed Stories
- [Story 15.1: Fix Broken Spacing clamp() Formulas](../../stories/completed/story-15.1-spacing-clamp-formulas-fix.md)
- [Story 15.2: Create Typography Tokens CSS File](../../stories/completed/story-15.2-create-typography-tokens-css-file.md)
- [Story 15.3: Add Text-Trim Alignment Utility](../../stories/completed/story-15.3-text-trim-alignment-utility-add.md)
- [Story 15.4: Migrate HeroSection to Semantic Typography](../../stories/completed/story-15.4-herosection-typography-migration.md)
- [Story 15.5: Migrate RoomCard Variants to Semantic Typography](../../stories/completed/story-15.5-roomcard-typography-migration.md)
