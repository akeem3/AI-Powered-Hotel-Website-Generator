---
type: story
id: "15.1-spacing-clamp-formulas-fix"
epic_number: "15"
story_number: "01"
status: closed
priority: high
tags: [epic-15, spacing, clamp, css, tailwind]
---

# Story: Fix Broken Spacing clamp() Formulas

## 1. The "Why" (Rationale)
To ensure consistent spacing that scales smoothly from mobile to tablet viewports (375px → 768px), fixing previous formulas that were static or unresponsive at certain breakpoints.

## 2. The "What" (Description)
Replaced the broken `spacing.section` and `spacing.container` formulas in `tailwind.config.js` with mathematically validated `clamp()` formulas that use a proper `base + coefficient * vw` structure for linear interpolation.

## 3. The "How" (Acceptance Criteria)
- [x] Verified current broken formulas failed to scale correctly.
- [x] Replaced `spacing.section` with `clamp(2rem, 0.0915rem + 8.143vw, 4rem)`.
- [x] Replaced `spacing.container` with `clamp(1rem, 0.0459rem + 4.071vw, 2rem)`.
- [x] Verified existing components using `p-section` and `p-container` work without modification.
- [x] Validated scaling behavior across 375px to 768px viewport range.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/tailwind.config.js`
*   *Test Files:*
    *   (None)
*   *Reference Files:*
    *   `docs/qa/gates/15.1-spacing-clamp-formulas-fix.yml`
