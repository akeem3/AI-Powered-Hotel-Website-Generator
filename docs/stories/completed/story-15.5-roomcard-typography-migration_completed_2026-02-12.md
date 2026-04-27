---
type: story
id: "15.5-roomcard-typography-migration"
epic_number: "15"
story_number: "05"
status: closed
priority: high
tags: [epic-15, components, migration, typography, room-card]
---

# Story: Migrate RoomCard Variants to Semantic Typography

## 1. The "Why" (Rationale)
To unify typography across all RoomCard variants (Compact, Detailed, Grid) using the semantic system, ensuring consistent hierarchy, fluid scaling, and proper numeric alignment for prices.

## 2. The "What" (Description)
Refactored all RoomCard variants to use semantic typography tokens (`text-size-h3`, `text-size-caption`, etc.) instead of static utility classes. Applied `tabular-nums` to price elements for vertical alignment and updated component tests.

## 3. The "How" (Acceptance Criteria)
- [x] Migrated 17 instances of `text-fluid-*` classes across all RoomCard files.
- [x] Mapped Room Names to `text-size-h3` (subsection heading).
- [x] Mapped Prices to `text-size-body-large` with `tabular-nums` utility.
- [x] Mapped Metadata (type, capacity, amenities) to `text-size-caption`.
- [x] Verified consistent token usage across Compact, Detailed, and Grid variants.
- [x] Validated no visual regressions and verified price alignment.
- [x] Updated all relevant snapshot tests.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/components/blocks/RoomCard/RoomCardCompact.tsx`
    *   `web-app/components/blocks/RoomCard/RoomCardDetailed.tsx`
    *   `web-app/components/blocks/RoomCard/RoomCardGrid.tsx`
    *   `web-app/components/blocks/RoomCard/AmenityList.tsx`
*   *Test Files:*
    *   `web-app/tests/components/blocks/__snapshots__/RoomCard.test.tsx.snap`
    *   `web-app/tests/components/blocks/__snapshots__/RoomCardVariants.test.tsx.snap`
*   *Reference Files:*
    *   `docs/qa/gates/15.5-roomcard-typography-migration.yml`
