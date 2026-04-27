---
type: story
id: "15.4-herosection-typography-migration"
epic_number: "15"
story_number: "04"
status: closed
priority: high
tags: [epic-15, components, migration, typography, hero-section]
---

# Story: Migrate HeroSection to Semantic Typography

## 1. The "Why" (Rationale)
To replace deprecated, breakpoint-based `text-fluid-*` classes in the HeroSection component with semantic fluid typography tokens (`text-size-display`, `text-size-body`), ensuring smooth scaling across all viewports and consistent design system usage.

## 2. The "What" (Description)
Refactored the `HeroSection` component to use semantic typography tokens instead of static utility classes, mapping each text element (Tagline, Title, Headline, Description) to its appropriate semantic role while preserving existing visual hierarchy and CVA variants.

## 3. The "How" (Acceptance Criteria)
- [x] Migrated Tagline from `text-fluid-sm` (14px) to `text-size-overline` (12px→14px).
- [x] Migrated Title from `text-fluid-lg` (18px) to `text-size-body-large` (18px→20px).
- [x] Migrated Headline from `text-fluid-3xl` (48px) to `text-size-display` (36px→60px).
- [x] Migrated Description from `text-fluid-base` (16px) to `text-size-body` (16px→18px).
- [x] Verified all variants (centered, split, minimal) use semantic tokens.
- [x] Confirmed no visual regressions and smooth scaling between 375px and 768px.
- [x] Updated integration test snapshots.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/components/sections/HeroSection/index.tsx`
*   *Test Files:*
    *   `web-app/tests/integration/__snapshots__/Story14Integration.test.tsx.snap`
*   *Reference Files:*
    *   `docs/qa/gates/15.4-herosection-typography-migration.yml`
