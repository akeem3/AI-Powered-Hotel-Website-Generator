---
type: epic
epic_number: "18"
id: "18-diversity-navigation-variants-section-wrappers"
status: done
priority: high
created_at: "2026-02-24T00:00:00Z"
prd_reference: "docs/architecture/prd.md"
architecture_reference: "docs/architecture/component-system-architecture.md"
plan_reference: "docs/plans/component-diversity-interchangeable-blocks.md"
fr_coverage: [FR5, FR7, FR8, FR10]
nfr_coverage: [NFR14]
depends_on: ["16-preview-dynamic-preview-config-validation", "17-diversity-hero-structural-variants"]
tags: [navigation, structural-variants, router-pattern, section-wrapper, component-diversity, phase-3]
stories_count: 6
stories_completed: 6
stories_in_progress: 0
stories_blocked: 0

complexity_validation:
  status: COMPLETED
  validated_at: "2026-02-27T00:00:00Z"
  overall_score: 2.1
  stories_needing_review: []
  stories_completed: ["18.1", "18.2", "18.3", "18.4", "18.5", "18.6"]
  stories_done: ["18.1", "18.2", "18.3", "18.4", "18.5", "18.6"]
  principle_violations: 0

estimated_days: "5-8"
---

# Epic 18: Navigation Structural Variants & Section Wrapper System

## High-Level Overview
This epic implements Phase 3 of the Component Diversity plan - transforming the `Navigation` block from a single-structure component with cosmetic-only CVA variants into a router component that delegates to three structurally distinct sub-components (`NavigationClassic`, `NavigationCompact`, `NavigationExtended`), and simultaneously evolving the existing `SectionRenderer` into a configurable multi-variant wrapper system.

## Global Rationale
The ET Hotel Website Generator's core promise is generating 10,000+ **unique** hotel websites. The gap analysis from Epic 16 rated the Navigation component as MEDIUM-LOW diversity - all three Epic 16 fixtures produce identical HTML navigation structures, with only CSS utility classes differing. By creating true structural variants for the navigation and making section wrapper styles configurable, the visual diversity of generated websites is significantly increased, matching the different needs of various hotel types (e.g., luxury, business, budget).

## Completed Stories
- 18.1: Navigation Router Refactor
- 18.2: NavigationClassic Sub-Component
- 18.3: NavigationExtended Sub-Component
- 18.4: NavigationCompact Sub-Component
- 18.5: Section Wrapper System
- 18.6: Fixture Updates, Preview Integration & Tests