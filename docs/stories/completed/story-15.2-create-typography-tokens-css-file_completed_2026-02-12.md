---
type: story
id: "15.2-create-typography-tokens-css-file"
epic_number: "15"
story_number: "02"
status: closed
priority: high
tags: [epic-15, typography, css, tokens, fluid-scaling]
---

# Story: Create Typography Tokens CSS File

## 1. The "Why" (Rationale)
To establish a semantic typography system using fluid scaling tokens (`text-size-h1`, `text-size-body`, etc.) that follow the existing OKLCH color token pattern (`-val` suffix), enabling consistent and responsive typography across the application.

## 2. The "What" (Description)
Created `typography-tokens.css` defining 8 semantic font-size/line-height token pairs using `clamp()` formulas for the 375px-768px range. Integrated these into Tailwind v4 via `globals.css` `@theme inline` registration and updated Storybook documentation.

## 3. The "How" (Acceptance Criteria)
- [x] Created `web-app/styles/typography-tokens.css` with 8 semantic tokens (`display` to `overline`).
- [x] Implemented `-val` suffix pattern for tokens to allow theme overrides.
- [x] Added fluid `clamp()` formulas mathematically validated for linear interpolation.
- [x] Registered tokens in `globals.css` under `@theme inline` for Tailwind utility generation.
- [x] Updated `Typography.stories.tsx` to document semantic tokens and replace deprecated examples.
- [x] Validated build and verified no regressions in existing tests.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/styles/typography-tokens.css`
    *   `web-app/app/globals.css`
    *   `web-app/stories/1-Design-System/Typography.stories.tsx`
*   *Test Files:*
    *   `web-app/tests/langgraph/state/workflow-state.ts` (Fixed TS error)
    *   `web-app/tests/components/blocks/__snapshots__/RoomCard.test.tsx.snap`
    *   `web-app/tests/components/blocks/__snapshots__/RoomCardVariants.test.tsx.snap`
*   *Reference Files:*
    *   `docs/qa/gates/15.2-create-typography-tokens-css-file.yml`
