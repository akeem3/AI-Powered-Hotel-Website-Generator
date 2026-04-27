---
type: story
id: "11.08-content-generic-defaults-migration"
status: complete
priority: high
tags: [epic-11, content, defaults, multi-hotel, bugfix, follow-up]
---

# Story: Centralized Generic Defaults Migration

## 1. The "Why" (Rationale)
To prevent hotel-specific branding (e.g., "The Sterling Executive") from appearing on other hotels' websites when the content system fails or content is unavailable, ensuring a truly multi-tenant platform.

## 2. The "What" (Description)
Migrated hardcoded hotel-specific defaults to a centralized `CONTENT_DEFAULTS` configuration containing generic, hotel-agnostic placeholders.

## 3. The "How" (Acceptance Criteria)
- [x] Centralized defaults config created at `web-app/lib/content/defaults.ts` with TypeScript types.
- [x] All default values are generic and hotel-agnostic (e.g., "Hotel Name").
- [x] `HeroSection` updated to use `CONTENT_DEFAULTS.hero`.
- [x] `Amenities` updated to use `CONTENT_DEFAULTS.amenities`.
- [x] `Testimonials` updated to use `CONTENT_DEFAULTS.testimonials`.
- [x] Fallback behavior maintained (content > props > defaults).
- [x] Component tests updated to verify generic defaults.
- [x] Code audit confirmed zero hotel-specific strings remain in migrated components.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/lib/content/defaults.ts`
    *   `web-app/lib/content/index.ts`
    *   `web-app/components/sections/HeroSection/index.tsx`
    *   `web-app/components/blocks/Amenities/index.tsx`
    *   `web-app/components/blocks/Testimonials/index.tsx`
*   *Test Files:*
    *   `web-app/tests/simple/content/defaults.test.ts`
    *   `web-app/tests/simple/components/migration-edge-cases.test.tsx`
    *   `web-app/tests/components/sections/HeroSection.test.tsx`
*   *Reference Files:*
    *   `docs/research/epic-11-hardcoded-defaults-analysis_2026-01-22_f7a9.md`
