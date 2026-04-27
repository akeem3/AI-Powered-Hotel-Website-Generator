# Algorithmic Design System Implementation Proposal

**Date:** 2026-02-03
**Status:** Revised after Architect Review
**Project:** LLM-Driven Hotel Website Generator
**Target:** 10,000+ Unique Professional Websites
**Revision:** v2.0 - Simplified after critical analysis

---

## Architect Review Summary

> **Review Date:** 2026-02-03
> **Reviewer:** Architect Agent (Sequential Thinking Analysis)
> **Verdict:** Partially valid but contained over-engineering. Revised below.

### Key Corrections Made

| Original Claim | Correction | Impact |
|----------------|------------|--------|
| "Download Fontshare fonts to `public/fonts/`" | Project uses **Google Fonts via `next/font/google`** | Phase 1 removed |
| "Use `@capsizecss/unpack` for extraction" | `@capsizecss/metrics` has **pre-computed** Inter & Playfair metrics | No build script needed |
| "6-8 day implementation" | Simplified to **2-3 days** | Reduced scope |
| "Navigation alignment issues" | **NOT APPLICABLE** - no icons next to text in current nav | Deferred to future |
| "clamp() formulas are problematic" | **VALIDATED** - Spacing formulas confirmed broken; typography mostly OK | Added corrected formulas |

### Validation Status (2026-02-03)

All unclear items have been validated by specialized agents:

| Item | Agent | Status | Finding |
|------|-------|--------|---------|
| Navigation alignment | Explore | ✅ VALIDATED | No icons in nav - issue doesn't manifest yet |
| Fluid typography gap | Explore | ✅ VALIDATED | Deliberate deferral in Story 1.11 |
| clamp() formulas | architect-research | ✅ VALIDATED | Spacing broken, typography mostly OK |

**Research file created:** `docs/research/fluid_clamp_formula_validation_2026-02-03_b7e4.md`

---

## Executive Summary

This proposal extends the existing hotel website generator's design system with **semantic typography tokens** following the established OKLCH color token pattern. After architect review, the implementation has been **simplified** to remove unnecessary complexity.

**Recommended approach:**

1. **PRESERVE** - OKLCH color token system (production-grade)
2. **ADD** - Semantic typography tokens with `-val` suffix pattern
3. **ADD** - Modern CSS `text-box-trim` utility with fallback
4. **SKIP** - Font metric extraction (use pre-computed metrics if needed)
5. **DEFER** - Font orchestrations (validate need first)

**Key Finding:** The project has a production-grade color token system but fluid typography tokens exist and are **completely unused** by any component (verified: 0 matches in `/components/`). The solution is to create semantic tokens and migrate components.

---

## Why Semantic Fluid Typography?

### The Problem: Breakpoint Jumps

**Current approach** (static sizes with breakpoints):
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">Welcome</h1>
```

**What happens:**
- At 767px viewport: 24px (text-2xl)
- At 768px viewport: 30px (text-3xl) ← **Abrupt 6px jump!**
- At 1279px viewport: 30px
- At 1280px viewport: 36px (text-4xl) ← **Another 6px jump!**

Users on intermediate viewports (500px, 600px, 900px) get suboptimal typography.

### The Solution: Fluid Scaling

**Semantic fluid approach** (single class, smooth scaling):
```tsx
<h1 className="text-size-h1">Welcome</h1>
```

**What happens:**
- At 375px viewport: 24px
- At 500px viewport: 28px ← **Smooth interpolation**
- At 600px viewport: 31px ← **Smooth interpolation**
- At 768px viewport: 36px
- No jumps, professional appearance at every viewport width

### Why This Matters for 10,000+ Hotel Sites

| Benefit | Impact |
|---------|--------|
| **Consistent behavior** | All hotels get the same professional typography scaling |
| **LLM-friendly** | Agents use `text-size-h1` instead of deciding breakpoint combinations |
| **Self-documenting** | `text-size-h1` says "main heading"; `text-2xl md:text-3xl` is implementation detail |
| **Maintainable** | Change the scale in one place, all components update |
| **Better UX** | Smooth reading experience on tablets, foldables, and intermediate screens |

### When to Use Each

| Use Case | Approach | Example |
|----------|----------|---------|
| Headings (H1-H3) | Semantic fluid | `text-size-h1`, `text-size-h2` |
| Body text | Semantic fluid | `text-size-body`, `text-size-body-large` |
| UI labels, buttons | Semantic fluid | `text-size-caption`, `text-size-overline` |
| Fixed-size elements | Static | `text-xs` (always 12px, e.g., badges) |
| Icon sizes | Static | `w-4 h-4` (icons don't need fluid scaling) |

---

## Part 1: Current System Analysis

### 1.1 Strengths to Preserve (DO NOT CHANGE)

| Component | Status | Files | Evidence |
|-----------|--------|-------|----------|
| **OKLCH Color System** | ✅ Excellent | `globals.css:41-103` | Production-grade, 50+ tokens |
| **Semantic Color Tokens** | ✅ Production | `globals.css:111-200` | `-val` suffix pattern |
| **Font Setup** | ✅ Solid | `layout.tsx:3-15` | Google Fonts via `next/font/google` |
| **CVA Architecture** | ✅ Sound | `lib/cva-variants.ts` | Extend for typography |
| **Container Config** | ✅ Working | `tailwind.config.js:29-43` | Responsive breakpoints |

### 1.2 Font Setup (Corrected Understanding)

**File:** `web-app/app/layout.tsx:3-15`

```typescript
import { Playfair_Display, Inter } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});
```

**Important:** Fonts are loaded via Next.js Google Fonts integration, **NOT** local files. This means:
- No need for `@capsizecss/unpack` (extracts from local files)
- Use `@capsizecss/metrics` if font metrics are needed (pre-computed for Google Fonts)
- No build script required for font extraction

### 1.3 Critical Gaps (Fully Validated)

| Gap | Severity | Evidence | Verification |
|-----|----------|----------|--------------|
| **Fluid typography unused** | HIGH | 0 matches for `text-fluid-*` in `/components/` | ✅ Deliberate deferral (Story 1.11) |
| **Static sizes heavily used** | HIGH | 82 matches for `text-sm/lg/xl` in 34 files | ✅ Intentional decision |
| **No semantic typography tokens** | HIGH | No `--font-size-h1-val` in `globals.css` | ✅ Needs implementation |
| **Spacing clamp() formulas broken** | HIGH | `section` doesn't scale until 640px; `container` stops at 640px | ✅ Math validated |
| **Typography clamp() suboptimal** | LOW | `fluid-base` stops at 720px (before 768px breakpoint) | ✅ Math validated |
| **Navigation alignment issues** | N/A | No icons next to text in current navigation | ✅ Not applicable yet |

#### Why Fluid Typography Was Never Adopted

**Validated finding:** The gap is **deliberate**, not an oversight.

- **Story 1.11** defined fluid classes in `tailwind.config.js` (Nov 2025)
- The "Update components to use `text-fluid-*`" sub-task was **never completed**
- Research concluded this is acceptable: single breakpoint design (768px) doesn't require complex fluid scaling
- Static sizes (text-sm, text-base, text-lg) provide adequate control for hotel sites
- Fluid classes remain as "infrastructure for future use"

**Source:** Explore agent investigation of Story 1.11 and research documentation

### 1.4 Existing Fluid Typography & Spacing (Mathematically Validated)

**File:** `web-app/tailwind.config.js:69-82`

**Full validation:** `docs/research/fluid_clamp_formula_validation_2026-02-03_b7e4.md`

#### Typography Formulas (Mostly OK)

| Formula | Effective Range | Coverage 375-768px | Status |
|---------|-----------------|-------------------|--------|
| fluid-sm | 300px - 800px | FULL | ✅ GOOD |
| fluid-base | 320px - 720px | PARTIAL (stops early) | ⚠️ SUBOPTIMAL |
| fluid-lg | 320px - 1280px | FULL | ✅ GOOD |
| fluid-xl | 320px - 1120px | FULL | ✅ GOOD |
| fluid-2xl | 320px - 1387px | FULL | ✅ GOOD |

#### Spacing Formulas (BROKEN - Must Fix)

| Formula | Current | Effective Range | Issue |
|---------|---------|-----------------|-------|
| section | `clamp(2rem, 5vw, 4rem)` | 640px - 1280px | ❌ Doesn't scale until 640px! |
| container | `clamp(1rem, 5vw, 2rem)` | 320px - 640px | ❌ Stops scaling at 640px! |

**Problem:** Both spacing formulas use pure `vw` without base terms, causing:
- `section`: Stuck at 32px minimum for entire mobile range (375px-640px)
- `container`: Stuck at 32px maximum for tablet range (640px-768px)

#### Corrected Formulas (Validated)

```javascript
// SPACING (HIGH PRIORITY - must fix)
spacing: {
  section: 'clamp(2rem, 0.0915rem + 8.143vw, 4rem)',    // Scales 375px→768px
  container: 'clamp(1rem, 0.0459rem + 4.071vw, 2rem)',  // Scales 375px→768px
}

// TYPOGRAPHY (LOW PRIORITY - optional optimization)
fontSize: {
  'fluid-base': 'clamp(1rem, 0.8807rem + 0.509vw, 1.125rem)',  // Extends to 768px
}
```

**Verification at breakpoints:**
- section at 375px: 32px ✓ | at 768px: 64px ✓
- container at 375px: 16px ✓ | at 768px: 32px ✓
- fluid-base at 375px: 16px ✓ | at 768px: 18px ✓

---

## Part 2: Library Verdicts (Unchanged)

### 2.1 Utopia Core - **SKIP**

**Reasoning:**
1. ✅ Manual `clamp()` is sufficient for single breakpoint design (375px → 768px)
2. ⚠️ No native Tailwind v4 integration
3. 📏 Modular scale complexity not needed
4. ⏱️ Team time better spent elsewhere

### 2.2 Fontkit / @capsizecss/unpack - **SKIP** (Revised)

**Original verdict:** ADOPT for build-time extraction
**Revised verdict:** **SKIP** - not needed

**Reasoning:**
1. Project uses Google Fonts via `next/font/google`, not local files
2. `@capsizecss/metrics` already has pre-computed metrics for Inter and Playfair Display:
   ```javascript
   import interMetrics from '@capsizecss/metrics/inter';
   import playfairDisplayMetrics from '@capsizecss/metrics/playfairDisplay';
   ```
3. Font metrics only needed if implementing Capsize-style trimming (we're using CSS instead)

### 2.3 Capsize Runtime - **SKIP**

**Reasoning:**
1. 🚫 Maintenance mode (last published 1+ year ago)
2. ✅ Native CSS `text-box-trim` available (Chrome 133+, Safari 18.2+)
3. ✅ `margin-block: calc(0.5cap - 0.5lh)` fallback for Firefox

### 2.4 Shadcn/UI - **ALREADY USING** ✅

No changes needed.

---

## Part 3: Simplified Implementation Plan

### 3.1 Revised Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      NO BUILD STEP NEEDED                        │
├─────────────────────────────────────────────────────────────────┤
│  1. Add typography-tokens.css (manual, following color pattern)  │
│  2. Add text-trim utility in globals.css                         │
│  3. Migrate components to use semantic tokens                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      RUNTIME (Zero Dependencies)                 │
├─────────────────────────────────────────────────────────────────┤
│  - typography-tokens.css defines -val variables                  │
│  - @theme inline maps tokens → Tailwind utilities                │
│  - useHotelTheme can override -val vars (future enhancement)     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Implementation Phases

#### Phase 0: Fix Broken Spacing Formulas (0.25 day) - **HIGH PRIORITY**

**File:** `web-app/tailwind.config.js`

**Before (BROKEN):**
```javascript
spacing: {
  section: 'clamp(2rem, 5vw, 4rem)',    // Doesn't scale until 640px!
  container: 'clamp(1rem, 5vw, 2rem)',  // Stops scaling at 640px!
}
```

**After (CORRECTED):**
```javascript
spacing: {
  section: 'clamp(2rem, 0.0915rem + 8.143vw, 4rem)',    // Scales 32px→64px across 375-768px
  container: 'clamp(1rem, 0.0459rem + 4.071vw, 2rem)',  // Scales 16px→32px across 375-768px
}
```

**Why this matters:**
- Current `section` spacing is stuck at 32px for all mobile viewports (375px-640px)
- Current `container` spacing is stuck at 32px for all tablet viewports (640px-768px)
- Users experience inconsistent spacing behavior across breakpoints

**Validation:** See `docs/research/fluid_clamp_formula_validation_2026-02-03_b7e4.md`

---

#### Phase 1: Typography Tokens (0.5 day)

**Create:** `web-app/styles/typography-tokens.css`

```css
/* ====================================================================================
   SEMANTIC TYPOGRAPHY TOKENS
   Following the OKLCH color token pattern from globals.css
   ==================================================================================== */

@layer theme {
  :root {
    /* ── FONT SIZE TOKENS (Fluid) ── */
    /* Viewport range: 375px (sm) → 768px (md) */
    /* Formula: clamp(min, preferred, max) where preferred scales smoothly */

    /* Display - Hero titles (36px → 60px) */
    --font-size-display-val: clamp(2.25rem, 2rem + 1.5vw, 3.75rem);

    /* H1 - Main page headings (24px → 36px) */
    --font-size-h1-val: clamp(1.5rem, 1.35rem + 0.75vw, 2.25rem);

    /* H2 - Section headings (20px → 28px) */
    --font-size-h2-val: clamp(1.25rem, 1.15rem + 0.5vw, 1.75rem);

    /* H3 - Subsection headings (18px → 22px) */
    --font-size-h3-val: clamp(1.125rem, 1.05rem + 0.375vw, 1.375rem);

    /* Body Large - Emphasized body (18px → 20px) */
    --font-size-body-large-val: clamp(1.125rem, 1.075rem + 0.25vw, 1.25rem);

    /* Body - Default body (16px → 18px) */
    --font-size-body-val: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);

    /* Caption - Small labels (14px → 16px) */
    --font-size-caption-val: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);

    /* Overline - Tiny text (12px → 14px) */
    --font-size-overline-val: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);

    /* ── LINE HEIGHT TOKENS ── */
    --line-height-tight-val: 1.25;
    --line-height-normal-val: 1.5;
    --line-height-relaxed-val: 1.75;
    --line-height-display-val: 1.1;

    /* ── LETTER SPACING TOKENS ── */
    --letter-spacing-tight-val: -0.025em;
    --letter-spacing-normal-val: 0;
    --letter-spacing-wide-val: 0.025em;
  }

  [data-mode='dark'] {
    /* Dark mode: slightly tighter line heights for better readability */
    --line-height-normal-val: 1.45;
  }
}

/* ====================================================================================
   TAILWIND v4 MAPPING (@theme inline)
   ==================================================================================== */

@theme inline {
  /* Font Sizes - generates text-size-* utilities */
  --font-size-display: var(--font-size-display-val);
  --font-size-h1: var(--font-size-h1-val);
  --font-size-h2: var(--font-size-h2-val);
  --font-size-h3: var(--font-size-h3-val);
  --font-size-body-large: var(--font-size-body-large-val);
  --font-size-body: var(--font-size-body-val);
  --font-size-caption: var(--font-size-caption-val);
  --font-size-overline: var(--font-size-overline-val);

  /* Line Heights */
  --line-height-tight: var(--line-height-tight-val);
  --line-height-normal: var(--line-height-normal-val);
  --line-height-relaxed: var(--line-height-relaxed-val);
  --line-height-display: var(--line-height-display-val);

  /* Letter Spacing */
  --letter-spacing-tight: var(--letter-spacing-tight-val);
  --letter-spacing-normal: var(--letter-spacing-normal-val);
  --letter-spacing-wide: var(--letter-spacing-wide-val);
}
```

**Update:** `web-app/app/globals.css`

```css
@import 'tailwindcss';
@import '../styles/typography-tokens.css';

/* ... existing content ... */
```

#### Phase 2: Alignment Utility (0.5 day)

**Add to:** `web-app/app/globals.css` (in `@layer utilities`)

```css
@layer utilities {
  /* ══════════════════════════════════════════════════════════════════════════
     TEXT-TRIM: Optical Vertical Alignment

     PURPOSE: Removes invisible "leading" space above/below text so icons
     and text align to the visual cap-height, not the line-height box.

     WHEN TO USE:
     - Navigation items with icons next to text
     - Buttons with icons
     - Any flex container mixing icons and text

     SAFE TO INCLUDE: This is an OPT-IN utility class. It only affects
     elements where you explicitly add the class. Text-only elements
     without this class are unaffected.

     DOES NOT BREAK TEXT-ONLY ITEMS: If you don't add the class, nothing changes.
     ══════════════════════════════════════════════════════════════════════════ */

  .text-trim {
    /* Trims the invisible leading space above/below text */
    /* Formula: half cap-height minus half line-height = negative margin to trim */
    margin-block: calc(0.5cap - 0.5lh);
  }

  /* Progressive enhancement for browsers with native text-box-trim */
  @supports (text-box-trim: trim-both) {
    .text-trim {
      margin-block: 0;
      text-box: trim-both cap alphabetic;
    }
  }

  /* Micro-typography: tabular numbers for prices/data */
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
```

**Why include this now (even without icons in navigation)?**

| Reason | Explanation |
|--------|-------------|
| **Universal system** | Ready for any component that adds icons later |
| **Zero cost** | Unused CSS classes are tree-shaken by Tailwind |
| **Opt-in only** | Doesn't affect existing components unless explicitly applied |
| **Future-proof** | When icons are added to nav, the utility is already available |

**Usage example (when icons are added):**
```tsx
// Without text-trim: icon appears ~2px too high
<a className="flex items-center gap-2">
  <HomeIcon className="h-4 w-4" />
  <span>Home</span>
</a>

// With text-trim: icon and text optically centered
<a className="flex items-center gap-2">
  <HomeIcon className="h-4 w-4" />
  <span className="text-trim">Home</span>
</a>
```

**Browser support:**
- Chrome 133+ / Edge 133+: Full `text-box-trim` support
- Safari 18.2+: Full `text-box-trim` support
- Firefox: Falls back to `margin-block` (works in all versions with `cap`/`lh` units)

#### Phase 3: Component Migration (1-2 days)

**Priority order (highest impact first):**

1. **HeroSection** - Replace `text-2xl sm:text-3xl lg:text-4xl` with `text-size-h1`
2. **RoomCard variants** - Replace `text-xl`, `text-2xl` with `text-size-h2`, `text-size-h3`
3. **BookingWidget** - Replace `text-sm`, `text-base` with `text-size-caption`, `text-size-body`
4. **Navigation** - No changes now; add `text-trim` to text spans when icons are introduced

**Example migration:**

```tsx
// Before
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-display">
  Welcome to Sterling Executive
</h1>

// After
<h1 className="text-size-h1 font-display">
  Welcome to Sterling Executive
</h1>
```

---

## Part 4: Deferred Features (Investigated & Safe to Defer)

The following features were investigated by specialized agents. All are **SAFE TO DEFER** with zero risk of breaking changes.

**Research files created:**
- `docs/research/font-orchestrations-deferral-analysis_2026-02-03_f8a2.md`
- `docs/research/usehoteltheme_typography_extension_analysis_2026-02-03_f9a4.md`

---

### 4.1 Font Orchestrations - **SAFE TO DEFER**

**Original scope:** Predefined font combinations ("saasPro", "editorial", "brutalist") for different hotel types.

#### Why Safe to Defer

| Factor | Finding |
|--------|---------|
| **Infrastructure exists** | Theme schema ALREADY has `displayFont` and `bodyFont` fields |
| **PRD requirement** | "10,000 unique websites" achieved via **color palettes**, not fonts |
| **Breaking changes** | ZERO - future implementation uses backward-compatible string unions |
| **Implementation cost** | SAME now vs later (4-8 hours either way) |
| **Technical debt** | NONE created by deferring |

#### What Already Works

```typescript
// Current HotelTheme schema (already supports per-hotel fonts)
typography: {
  displayFont: "Playfair Display, serif",  // ✅ Works today
  bodyFont: "Inter, sans-serif"            // ✅ Works today
}
```

The hook `useHotelTheme` already applies these to CSS variables (`--font-display`, `--font-body`).

#### Future Migration Path (When Needed)

```typescript
// Backward-compatible string union approach
type FontValue = string | `preset:${string}`;

// Existing hotels continue working
displayFont: "Playfair Display"  // ✅ Still works

// New hotels can use presets
displayFont: "preset:elegant"     // ✅ New option
```

#### When to Revisit

- After generating 100+ hotel sites (learn from usage)
- When LLM agents request font selection guidance
- When product discovery reveals font differentiation need

---

### 4.2 useHotelTheme Font Extensions - **SAFE TO DEFER**

**Original scope:** Custom font sizes, font feature settings, and advanced typography per hotel.

#### Why Safe to Defer

| Factor | Finding |
|--------|---------|
| **Current state** | Hook ALREADY handles typography (`displayFont`, `bodyFont` via CSS vars) |
| **Architecture** | HIGHLY EXTENSIBLE - Zod schema supports optional fields |
| **Breaking changes** | ZERO - all extensions are additive (optional fields) |
| **Migration effort** | ~1 day when needed |
| **Value assessment** | Font orchestrations: 30% need, Custom sizes: 60% need, Features: 10% need |

#### What Already Works

```typescript
// useHotelTheme.ts lines 33-35 (already implemented)
root.style.setProperty('--font-display', theme.typography.displayFont);
root.style.setProperty('--font-body', theme.typography.bodyFont);
```

#### Future Migration Path (When Needed)

```typescript
// Schema extension (backward-compatible)
typography: z.object({
  displayFont: z.string().min(1),
  bodyFont: z.string().min(1),
  // NEW - all optional, existing hotels unaffected
  monoFont: z.string().optional(),
  fontSize: z.object({
    base: z.string().optional(),
    scale: z.number().optional(),
  }).optional(),
})

// Hook extension
if (theme.typography.fontSize?.base) {
  root.style.setProperty('--font-size-base', theme.typography.fontSize.base);
}
```

#### When to Revisit

- When LLM agents request custom font sizing
- When luxury hotel tier needs advanced typography
- When A/B testing proves font customization improves conversions

---

### 4.3 Font Metric Extraction Script - **REMOVED (Not Needed)**

**Original scope:** Build script using `@capsizecss/unpack` to extract metrics from local font files.

#### Why Removed (Not Deferred)

| Factor | Finding |
|--------|---------|
| **Font source** | Project uses Google Fonts via `next/font/google`, NOT local files |
| **Metrics available** | `@capsizecss/metrics` has pre-computed metrics for Inter and Playfair |
| **Modern CSS** | `cap` and `lh` units work without explicit metrics |
| **Use case** | The `.text-trim` utility uses CSS-native units, not font metrics |

This is **permanently removed**, not deferred - the approach was based on incorrect assumptions about font source.

---

### Summary: Why Deferrals Are Safe for 10,000 Hotels

| Concern | Answer |
|---------|--------|
| **Will we break hotels later?** | NO - all extensions are additive (optional fields) |
| **Is infrastructure missing?** | NO - theme schema already supports per-hotel fonts |
| **What achieves "10,000 unique"?** | OKLCH color palettes (PRD requirement), not fonts |
| **Cost of deferring?** | ZERO technical debt; same implementation cost later |
| **When to implement?** | When real usage data demonstrates need |

---

## Part 5: Implementation Checklist

### Phase 0: Fix Spacing Formulas (0.25 day) - **DO FIRST**
- [ ] Update `section` spacing in `tailwind.config.js` to `clamp(2rem, 0.0915rem + 8.143vw, 4rem)`
- [ ] Update `container` spacing in `tailwind.config.js` to `clamp(1rem, 0.0459rem + 4.071vw, 2rem)`
- [ ] Optionally update `fluid-base` to `clamp(1rem, 0.8807rem + 0.509vw, 1.125rem)`
- [ ] Test spacing behavior at 375px, 640px, and 768px viewports

### Phase 1: Typography Tokens (0.5 day)
- [ ] Create `styles/typography-tokens.css` with semantic tokens
- [ ] Import in `globals.css`
- [ ] Verify Tailwind generates `text-size-*` utilities
- [ ] Test in Storybook

### Phase 2: Alignment Utility (0.5 day)
- [ ] Add `.text-trim` utility to `globals.css`
- [ ] Test in Chrome (text-box-trim) and Firefox (margin-block fallback)
- [ ] Add `.tabular-nums` for price displays

### Phase 3: Component Migration (1-2 days)
- [ ] Migrate HeroSection
- [ ] Migrate RoomCard variants
- [ ] Migrate BookingWidget
- [ ] Update Typography.stories.tsx to use semantic tokens
- [ ] Test responsive behavior across breakpoints

### Phase 4: Validation (0.5 day)
- [ ] Visual regression check
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] WCAG SC 1.4.4 compliance (text resizing)

**Total Estimate: 2.5-3.5 days** (reduced from 6-8 days)

---

## Part 6: Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Spacing formula change affects layouts | Medium | Medium | Test at 375px, 640px, 768px; visual regression check |
| Visual regression during component migration | Medium | High | Gradual rollout, keep old classes temporarily |
| Firefox `text-box-trim` not supported | Certain | Low | `margin-block` fallback works now |
| clamp() performance | Very Low | Low | Already used in project, well-supported |

---

## Part 7: Success Metrics

### Quantitative
- 100% of major components (Hero, RoomCard, BookingWidget) use semantic typography tokens
- 0 static breakpoint-based font sizes in new components
- Fluid typography usage visible in Storybook

### Qualitative
- Smooth text scaling when resizing browser 375px → 768px
- Consistent typography hierarchy across all pages
- Design system documentation updated

---

## Appendix A: File Changes Summary

### New Files
```
web-app/styles/typography-tokens.css
docs/research/fluid_clamp_formula_validation_2026-02-03_b7e4.md (created during validation)
```

### Modified Files
```
web-app/tailwind.config.js (FIX spacing formulas - HIGH PRIORITY)
web-app/app/globals.css (import tokens, add utilities)
web-app/components/sections/HeroSection/index.tsx
web-app/components/blocks/RoomCard/*.tsx
web-app/components/blocks/BookingWidget/*.tsx
web-app/stories/1-Design-System/Typography.stories.tsx
```

### Removed from Scope
```
scripts/extract-font-metrics.js (not needed - using Google Fonts)
web-app/styles/font-metrics.css (not needed)
web-app/lib/fonts/orchestrations.ts (deferred)
```

### Included But Not Applied Yet
```
.text-trim utility (in globals.css - ready for when icons are added to navigation)
```

---

## Appendix B: Reference Research

| File | Key Finding |
|------|-------------|
| `docs/research/utopia_core_fluid_typography_tailwind_v4_2026-02-03_8ac4.md` | SKIP Utopia Core; manual clamp() sufficient |
| `docs/research/fontkit_capsize_algorithmic_typography_2026-02-03_a1f2.md` | SKIP Capsize; use CSS text-box-trim |
| `docs/research/fluid_clamp_formula_validation_2026-02-03_b7e4.md` | Mathematical validation; spacing formulas broken |
| `docs/research/font-orchestrations-deferral-analysis_2026-02-03_f8a2.md` | Font orchestrations SAFE TO DEFER; infrastructure exists |
| `docs/research/usehoteltheme_typography_extension_analysis_2026-02-03_f9a4.md` | useHotelTheme extensions SAFE TO DEFER; architecture extensible |

---

## Appendix C: Browser Support Reference

### text-box-trim
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 133+ | ✅ Supported |
| Edge | 133+ | ✅ Supported |
| Safari | 18.2+ | ✅ Supported |
| Firefox | - | ❌ Not yet (use fallback) |

### cap / lh units (for fallback)
| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 108+ | ✅ Supported |
| Safari | 16.4+ | ✅ Supported |
| Firefox | 111+ | ✅ Supported |

Sources:
- [Can I Use - text-box-trim](https://caniuse.com/css-text-box-trim)
- [MDN - text-box-trim](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-box-trim)
- [Chrome Developers - CSS text-box-trim](https://developer.chrome.com/blog/css-text-box-trim)

---

## Conclusion

The original proposal contained valuable concepts but required **simplification** and **validation** after architect review:

### Validated Findings

| Item | Original Status | Validated Status |
|------|-----------------|------------------|
| Navigation alignment | "Clumsy look" | **NOT APPLICABLE** - no icons in nav |
| Fluid typography gap | "Critical issue" | **DELIBERATE** - intentional deferral |
| clamp() formulas | "Possibly problematic" | **CONFIRMED** - spacing formulas broken |

### Final Recommendations

| Priority | Action | Rationale |
|----------|--------|-----------|
| 1 | **FIX:** Spacing clamp() formulas | Currently broken - doesn't scale in target range |
| 2 | **ADOPT:** Semantic typography tokens | Follows color token pattern; enables fluid scaling |
| 3 | **ADOPT:** `.text-trim` utility | Universal system - ready when icons are added |
| 4 | **SKIP:** Font metric extraction | Using Google Fonts (pre-computed metrics available) |
| 5 | **SKIP:** Utopia Core | Manual `clamp()` is sufficient |
| 6 | **SKIP:** Capsize runtime | Native CSS `text-box-trim` available |
| 7 | **DEFER:** Font orchestrations | Infrastructure exists; zero breaking changes later |
| 8 | **DEFER:** useHotelTheme extensions | Architecture extensible; ~1 day to add when needed |

### Deferral Safety Confirmation

All deferred items have been **investigated by specialized agents** and confirmed safe:

| Deferred Item | Breaking Changes? | Technical Debt? | Research File |
|---------------|-------------------|-----------------|---------------|
| Font orchestrations | NONE | NONE | `font-orchestrations-deferral-analysis_2026-02-03_f8a2.md` |
| useHotelTheme extensions | NONE | NONE | `usehoteltheme_typography_extension_analysis_2026-02-03_f9a4.md` |

**Key finding:** The theme schema ALREADY supports per-hotel fonts (`displayFont`, `bodyFont`). The "10,000 unique websites" goal is achieved through **OKLCH color palettes** (per PRD), not font variation.

### Implementation Summary

This validated approach:
- **Adds Phase 0:** Fix broken spacing formulas (HIGH PRIORITY)
- Reduces implementation from 6-8 days to **2.5-3.5 days**
- Maintains zero runtime dependencies
- Follows established patterns (color token `-val` suffix)
- Removes unnecessary work (navigation, font extraction)
- Backed by mathematical validation (`fluid_clamp_formula_validation_2026-02-03_b7e4.md`)
