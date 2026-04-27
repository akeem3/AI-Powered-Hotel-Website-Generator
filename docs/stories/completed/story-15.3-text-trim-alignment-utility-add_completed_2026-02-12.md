---
type: story
id: "15.3-text-trim-alignment-utility-add"
epic_number: "15"
story_number: "03"
status: closed
priority: high
tags: [epic-15, typography, css, alignment, text-trim]
---

# Story: Add Text-Trim Alignment Utility

## 1. The "Why" (Rationale)
To ensure optical alignment of text with icons (removing leading whitespace) and perfect vertical alignment of numeric prices in lists, improving the overall polish of UI components.

## 2. The "What" (Description)
Implemented the `.text-trim` utility using the modern `text-box-trim` property (with a `margin-block` fallback for Firefox) and the `.tabular-nums` utility for monospace numeric alignment.

## 3. The "How" (Acceptance Criteria)
- [x] Verified native `text-box-trim: trim-both` implementation for Chrome/Safari.
- [x] Implemented `@supports` fallback for Firefox using `margin-block: calc(0.5cap - 0.5lh)`.
- [x] Added `tabular-nums` utility (`font-variant-numeric: tabular-nums`) for price displays.
- [x] Documented both utilities with examples in `Typography.stories.tsx`.
- [x] Fixed pre-existing test assertions in `Navigation.test.tsx` related to spacing changes.
- [x] Validated no visual regressions via Storybook.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/globals.css`
    *   `web-app/stories/1-Design-System/Typography.stories.tsx`
*   *Test Files:*
    *   `web-app/tests/components/navigation/Navigation.test.tsx`
    *   `web-app/tests/components/ui/__snapshots__/Button.test.tsx.snap`
    *   `web-app/tests/components/blocks/__snapshots__/RoomCard.test.tsx.snap`
    *   `web-app/tests/components/blocks/__snapshots__/RoomCardVariants.test.tsx.snap`
    *   `web-app/tests/integration/__snapshots__/Story14Integration.test.tsx.snap`
*   *Reference Files:*
    *   `docs/qa/gates/15.3-add-text-trim-alignment-utility.yml`
