---
type: epic
epic_number: "17"
id: "17-diversity-hero-structural-variants"
status: done
priority: high
created_at: "2026-02-19T00:00:00Z"
prd_reference: "docs/architecture/prd.md"
architecture_reference: "docs/architecture/component-system-architecture.md"
plan_reference: "docs/plans/component-diversity-interchangeable-blocks.md"
fr_coverage: [FR1, FR7, FR8, FR10]
nfr_coverage: [NFR14]
depends_on: ["16-preview-dynamic-preview-config-validation"]
tags: [hero-section, structural-variants, router-pattern, component-diversity, phase-2]
stories_count: 6
stories_completed: 6
stories_in_progress: 0
stories_blocked: 0

hallucination_check:
  status: CLEAN
  validated_at: "2026-02-19T00:00:00Z"
  confidence: 0.93
  issues_count: 0
  notes: "2 issues found and fixed: H001 (compound variant count 6→9), H002 (fabricated PRD quotes in Out of Scope rewritten)"

complexity_validation:
  status: VALID
  validated_at: "2026-02-19T00:00:00Z"
  overall_score: 1.7
  stories_needing_review: []
  principle_violations: 0

estimated_days: "5-8"
---

# Epic 17: Hero Section Structural Variants

## High-Level Overview
This epic implements Phase 2 of the Component Diversity plan - transforming the `HeroSection` from a single-structure component with cosmetic-only CVA variants into a router component that delegates to three structurally distinct sub-components: `HeroCentered`, `HeroSplit`, and `HeroMinimal`. This increases structural diversity and allows the `StylingAgent` to select distinct layouts for different hotel types (Luxury, Business, Budget).

## Global Rationale
The previous `HeroSection` implementation relied solely on CSS variants, resulting in identical HTML structures across all hotel types. To achieve the goal of 10,000+ unique hotel websites, we needed genuine structural diversity. By implementing a router pattern (Tier 3 architecture), we separate concerns into distinct sub-components, enabling vastly different layouts (full-bleed overlay vs. split grid vs. typography-focused) while maintaining a consistent contract.

## Completed Stories
- **17.1: Hero Router Refactor**: `HeroSection/index.tsx` delegates to sub-components based on `variant.layout`.
- **17.2: HeroCentered Sub-Component**: Full-bleed background image with centered text overlay.
- **17.3: HeroSplit Sub-Component**: CSS Grid two-column layout with text column and image column.
- **17.4: HeroMinimal Sub-Component**: Typography-focused design with no full-bleed image.
- **17.5: ComponentRenderer and Preview Integration**: Updates to fixtures (`luxury-boutique`, `budget-hostel`, `business-hotel`) to use new layouts.
- **17.6: Hero Variant Tests**: Comprehensive unit and integration tests for the router and sub-components.
