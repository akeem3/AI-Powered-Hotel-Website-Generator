# BookingWidget Theme System - Architectural Fix & Standards Document

> **Document Purpose:** This document serves as the authoritative reference for implementing theme-aware components in the ET Hotel AI project. All future development must follow these patterns.
>
> **Created:** 2026-01-28
> **Epic:** Design System Foundation
> **Related Stories:** Epic 2 - Foundation Validation, Epic 12 - Visual Excellence

---

## Table of Contents

1. [Problem Discovery](#1-problem-discovery)
2. [Root Cause Analysis](#2-root-cause-analysis)
3. [The Correct Solution](#3-the-correct-solution)
4. [Changes Made](#4-changes-made)
5. [Architectural Alignment](#5-architectural-alignment)
6. [Git Context & Commit Reference](#6-git-context--commit-reference)
7. [Component Implementation Standards](#7-component-implementation-standards)
8. [Testing & Verification](#8-testing--verification)
9. [References](#9-references)

---

## 1. Problem Discovery

### Initial Issue Report

**Date:** 2026-01-28
**Reporter:** User via Claude Code
**Component:** BookingWidget
**Variants Affected:** `desktop-dark`, `mobile-dark`

**Symptoms:**
- Light theme (`desktop-default`) works correctly - good contrast
- Dark theme (`desktop-dark`) shows only title, rest of form invisible
- Glass theme (`desktop-glass`) became visible (unexpected behavior)

**Story URLs:**
- Light: http://localhost:6006/?path=/story/components-blocks-bookingwidget--desktop-default
- Dark: http://localhost:6006/?path=/story/components-blocks-bookingwidget--desktop-dark
- Glass: http://localhost:6006/?path=/story/components-blocks-bookingwidget--desktop-glass

---

### Investigation Process

Used Storybook MCP tools to analyze the issue:
1. `list_stories()` - Discovered 6 booking widget stories
2. `get_story()` - Compared props and configuration between variants
3. `get_story_docs()` - Retrieved full implementation details
4. Traced CSS variable cascade through `globals.css` and `tailwind.config.js`

---

## 2. Root Cause Analysis

### ⚠️ CRITICAL: CSS Variable Cascade and `@theme inline`

**The ROOT CAUSE:** The dark mode override requires proper CSS variable cascade via the `@theme inline` directive and `-val` suffix convention.

The color system uses a two-layer architecture:

#### Layer 1: `@theme inline` (Token Registration)

```css
@theme inline {
  --color-surface-primary: var(--surface-primary-val);
  --color-text-primary: var(--text-primary-val);
  --color-border-default: var(--border-default-val);
}
```

- **Format:** Points to `-val` variables via `var()` references
- **Purpose:** Tailwind v4 class generation with runtime resolution
- **Usage:** When you write `bg-surface-primary`, Tailwind compiles to `background-color: var(--color-surface-primary)`
- **CRITICAL:** The `inline` keyword ensures runtime resolution, not build-time static values

#### Layer 2: `@layer theme` (Color Values)

```css
@layer theme {
  :root {
    --surface-primary-val: oklch(1 0 0);     /* Light mode */
    --text-primary-val: oklch(0.208 0.04 265.8);
    --border-default-val: oklch(0.929 0.013 255.5);
  }

  [data-mode='dark'] {
    --surface-primary-val: oklch(0.145 0 0);  /* Dark mode override */
    --text-primary-val: oklch(0.985 0 0);
    --border-default-val: oklch(0.297 0 0);
  }
}
```

- **Format:** OKLCH values
- **Purpose:** Generated palette values applied at runtime by `useHotelTheme`
- **Cascade:** When `data-mode="dark"` is set, the dark mode overrides apply automatically

---

### How the Cascade Works

When you use `bg-surface-primary` in your component:

1. Tailwind compiles to: `background-color: var(--color-surface-primary)`
2. `--color-surface-primary` resolves to: `var(--surface-primary-val)`
3. `--surface-primary-val` resolves based on `data-mode` attribute:
   - Light mode: `oklch(1 0 0)` (white)
   - Dark mode: `oklch(0.145 0 0)` (dark gray)

The `data-mode` attribute triggers CSS variable overrides automatically.

---

### The Fix Applied

The BookingWidget required:

1. **Setting `data-mode` attribute** on the parent wrapper to enable CSS variable cascade
2. **Fixing CVA text colors** to use `text-text-primary` (not `text-text-inverted`)
3. **Removing conflicting backgrounds** from CVA variants (child components handle backgrounds)
4. **Explicit borders** on nested shadcn/ui components (PopoverContent, SelectContent)

```tsx
// Parent wrapper enables cascade
<div data-mode={theme}>
  {/* All children respond to dark mode automatically */}
</div>
```

Now `bg-surface-primary` correctly resolves based on the `data-mode` attribute.

---

### Additional Issues Found

#### Issue 1: Border Inconsistencies

**File:** `BookingWidgetDesktop.tsx:79`

```tsx
// ❌ BEFORE - Used border-border-default but PopoverContent had no border
<div className="...border-border-default...">
<PopoverContent className="w-auto p-0">  /* Missing border! */
```

**Fix:** Added `border-border-default` to all popover and select content for consistency.

---

### Problem 2: CVA Theme Variant Used Wrong Text Color (Pre-Fix Issue)

**File:** `web-app/lib/cva-variants.ts:351`

```tsx
// ❌ BEFORE - Wrong text color for dark mode
theme: {
  light: "text-text-primary",
  dark: "text-text-inverted",  // ❌ BECOMES DARK IN DARK MODE
  glass: "bg-surface-primary/strong backdrop-blur-lg border-on-brand/subtle"
}
```

**Why This Was Wrong:**
- In dark mode, `--text-inverted-val` = `oklch(0.145 0 0)` (nearly black)
- This made text invisible on dark backgrounds

**Fix Applied:** Changed all theme variants to use `text-text-primary` which becomes white in dark mode.

**File:** `web-app/components/blocks/BookingWidget/index.tsx:69`

```tsx
// ❌ BEFORE - No data-mode attribute
<div className={cn(bookingWidgetVariants({ variant, theme }), className)}>
```

**Why This Matters:**
- The `data-mode` attribute triggers CSS variable overrides in `globals.css`
- Without it, semantic tokens like `bg-surface-primary` don't respond to theme
- This broke the CSS variable cascade system

---

### Problem 4: Inconsistent Styling Between Parent and Child

**Architectural Issue:** The BookingWidget had a **split responsibility** for styling:
- Parent (CVA variants): Attempted to set backgrounds
- Child components: Overrode with their own backgrounds
- Result: Conflicting styling, theme didn't cascade

---

## 3. The Correct Solution

### Core Principle

**Theme propagation follows the CSS variable cascade via `data-mode` attribute.**

```
Parent Wrapper
├── Sets: data-mode="dark" attribute
├── Applies: CVA text colors
└── Enables: CSS variable overrides for all nested elements

Child Component
├── Uses: bg-surface-primary (responds to data-mode)
├── Uses: text-text-primary (responds to data-mode)
└── Result: Automatic theme adaptation
```

---

### Solution Architecture

#### Layer 1: Parent Wrapper (`BookingWidget/index.tsx`)

**Responsibility:**
- Set `data-mode` attribute to enable CSS variable cascade
- Apply CVA text color variants (explicit text theming)
- Provide layout/positioning classes

```tsx
<div
  className={cn(bookingWidgetVariants({ variant, theme }), className)}
  data-mode={theme}  // ✅ Enables CSS variable cascade
>
  <BookingWidgetDesktop ... />
</div>
```

#### Layer 2: CVA Variants (`lib/cva-variants.ts`)

**Responsibility:**
- Define text color per theme
- Define layout/positioning per variant
- **Do NOT** define backgrounds (handled by children)

```tsx
export const bookingWidgetVariants = cva(
  "w-full transition-all duration-300",
  {
    variants: {
      variant: {
        // Layout/positioning only - NO backgrounds
        desktop: "shadow-lg rounded-xl border border-border-default",
        mobile: "fixed bottom-0 left-0 right-0 border-t border-border-default z-40 shadow-lg"
      },
      theme: {
        // Text color theming only - using text-primary for ALL themes
        light: "text-text-primary",  // Dark gray on light bg
        dark: "text-text-primary",   // White on dark bg (via data-mode override)
        glass: "text-text-primary"
      }
    }
  }
);
```

**Key Change:** Dark theme now uses `text-text-primary` (not `text-text-inverted`), which resolves to white in dark mode.

#### Layer 3: Child Components (`BookingWidgetDesktop.tsx`, `BookingWidgetMobile.tsx`)

**Responsibility:**
- Provide container with semantic token backgrounds
- Use semantic tokens for all text, borders, backgrounds
- Respond to `data-mode` attribute automatically

```tsx
// ✅ Child component uses semantic tokens
<div className="p-6 bg-surface-primary rounded-2xl shadow-md border border-border-default">
  <h3 className="text-text-primary">Book Your Stay</h3>  {/* Semantic token */}

  <Input className="... bg-surface-elevated ... " />  {/* Semantic token */}
  <Label className="...">Check-in</Label>  {/* Inherits text color */}

  <PopoverContent className="bg-surface-primary border-border-default">
</div>
```

---

## 4. Changes Made

### Critical Fix: CSS Variable Cascade

**File:** `web-app/app/globals.css`

**Architecture:** The color system uses `@theme inline` + `-val` variables to enable runtime dark mode switching.

```css
@theme inline {
  /* Tailwind utility registration */
  --color-surface-primary: var(--surface-primary-val);
  --color-text-primary: var(--text-primary-val);
  --color-border-default: var(--border-default-val);
}

@layer theme {
  :root {
    /* Light mode defaults or generated palette values */
    --surface-primary-val: oklch(1 0 0);
    --text-primary-val: oklch(0.208 0.04 265.8);
    --border-default-val: oklch(0.929 0.013 255.5);
  }

  [data-mode='dark'] {
    /* Dark mode overrides or generated palette values */
    --surface-primary-val: oklch(0.145 0 0);
    --text-primary-val: oklch(0.985 0 0);
    --border-default-val: oklch(0.297 0 0);
  }
}
```

**Why This Works:**
- `@theme inline` uses `var()` references (not static values) for runtime resolution
- Tailwind utility classes resolve to `var(--color-surface-primary)` → `var(--surface-primary-val)`
- Setting `data-mode="dark"` triggers `-val` variable overrides automatically
- The palette generator updates all `-val` variables at runtime via `useHotelTheme`

---

### Summary of Files Modified

| File | Change | Lines | Purpose |
|------|--------|-------|---------|
| `globals.css` | **Added `@theme` variable overrides for dark mode** | 169-182 | **ROOT CAUSE FIX: Makes Tailwind utilities respond to dark mode** |
| `BookingWidget/index.tsx` | Added `data-mode={theme}` attribute | 69 | Enable CSS variable cascade |
| `lib/cva-variants.ts` | Fixed dark theme text color | 351 | Changed from `text-text-inverted` to `text-text-primary` |
| `lib/cva-variants.ts` | Removed backgrounds from variants | 334-346 | Child components now handle backgrounds |
| `BookingWidgetDesktop.tsx` | Added semantic token to title | 79 | Ensure title uses `text-text-primary` |
| `BookingWidgetDesktop.tsx` | Added borders to PopoverContent | 101, 128 | Explicit borders for theme awareness |
| `BookingWidgetDesktop.tsx` | Added border to SelectContent | 182 | Explicit border for theme awareness |
| `BookingWidgetDesktop.tsx` | Changed status to `text-text-muted` | 207 | Use proper semantic token |
| `BookingWidgetMobile.tsx` | Changed container from `bg-surface-secondary` to `bg-surface-primary` | 83 | Proper semantic token that responds to data-mode |
| `BookingWidgetMobile.tsx` | Added borders to PopoverContent | 109, 132 | Explicit borders for theme awareness |
| `BookingWidgetMobile.tsx` | Added border to SelectContent | 193 | Explicit border for theme awareness |
| `BookingWidgetMobile.tsx` | Changed status to `text-text-muted` | 209 | Use proper semantic token |

---

### Detailed File Changes

#### File 1: `web-app/components/blocks/BookingWidget/index.tsx`

**Change:** Added `data-mode` attribute to enable CSS variable cascade

```diff
  // Render chosen variant and pass down handlers and defaultValues.
+ // CRITICAL: Set data-mode attribute to enable CSS variable cascade for theme-aware semantic tokens
+ // This follows the established pattern used in Storybook (see .storybook/preview.ts)
+ // Enables nested components using bg-surface-primary, text-text-primary, etc. to respond to theme
  return (
-   <div className={cn(bookingWidgetVariants({ variant, theme }), className)}>
+   <div
+     className={cn(bookingWidgetVariants({ variant, theme }), className)}
+     data-mode={theme}
+   >
```

**Why:** Without `data-mode`, semantic tokens like `bg-surface-primary` don't respond to theme. This attribute triggers the CSS variable overrides defined in `globals.css`.

---

#### File 2: `web-app/lib/cva-variants.ts`

**Change:** Fixed dark theme text color and removed conflicting backgrounds

```diff
 export const bookingWidgetVariants = cva(
   "w-full transition-all duration-300",
   {
     variants: {
       variant: {
-         desktop: "bg-surface-primary shadow-lg rounded-xl border border-border-default p-6",
-         mobile: "fixed bottom-0 left-0 right-0 bg-surface-primary border-t border-border-default p-4 z-40 shadow-lg"
+         // Layout/positioning only - backgrounds handled by child components
+         desktop: "shadow-lg rounded-xl border border-border-default",
+         mobile: "fixed bottom-0 left-0 right-0 border-t border-border-default z-40 shadow-lg"
       },
       theme: {
-         light: "bg-surface-primary text-text-primary",
-         dark: "bg-brand-primary text-text-inverted",
-         glass: "bg-surface-primary/strong backdrop-blur-lg border-on-brand/subtle"
+         // Text color theming - use text-primary (white in dark mode) for visibility
+         // CRITICAL: text-text-inverted becomes dark (0 0% 3.9%) in dark mode, making text invisible
+         light: "text-text-primary",  // Dark gray in light mode
+         dark: "text-text-primary",   // White in dark mode (via data-mode CSS variable override)
+         glass: "text-text-primary"
       }
     },
   },
   defaultVariants: {
     variant: "desktop",
     theme: "light"
   }
 });
```

**Why:**
1. Backgrounds removed to avoid conflicts with child components
2. Dark theme fixed: `text-text-inverted` → `text-text-primary` (was causing invisible text)
3. Padding removed from variants (now handled by child components)

---

#### File 3: `web-app/components/blocks/BookingWidget/BookingWidgetDesktop.tsx`

**Changes:** Made form elements theme-aware with proper semantic tokens

```diff
  return (
-   <div className="p-6 bg-surface-primary rounded-2xl shadow-md border border-surface-muted max-w-lg w-full">
-     <h3 className="text-xl font-semibold mb-4">Book Your Stay</h3>
+   // Container uses semantic tokens that respond to data-mode attribute set by parent
+   // Note: Padding p-6 is duplicated from CVA variant to maintain spacing when variant changes
+   <div className="p-6 bg-surface-primary rounded-2xl shadow-md border border-border-default max-w-lg w-full">
+     <h3 className="text-xl font-semibold mb-4 text-text-primary">Book Your Stay</h3>

       // ... form content ...

-     <PopoverContent className="w-auto p-0" align="start">
+     <PopoverContent className="w-auto p-0 bg-surface-primary border-border-default" align="start">

       // ... more form content ...

-     <SelectContent className="bg-surface-primary">
+     <SelectContent className="bg-surface-primary border-border-default">

       // ... rest of form ...

-     {status && <p className="mt-3 text-sm text-center text-text-secondary">{status}</p>}
+     {status && <p className="mt-3 text-sm text-center text-text-muted">{status}</p>}
```

**Why:** Semantic tokens (`bg-surface-primary`, `text-text-primary`, etc.) now respond to `data-mode` attribute. Explicit borders ensure visibility.

---

#### File 4: `web-app/components/blocks/BookingWidget/BookingWidgetMobile.tsx`

**Changes:** Similar theme-aware fixes for mobile variant

```diff
  return (
-   <div className="p-4 bg-surface-secondary rounded-xl">
+   // Container uses semantic tokens that respond to data-mode attribute set by parent
+   // Note: Padding p-4 is duplicated from CVA variant to maintain spacing when variant changes
+   <div className="p-4 bg-surface-primary rounded-xl">

      // ... form content ...

-     <PopoverContent className="p-0">
+     <PopoverContent className="p-0 bg-surface-primary border-border-default">

      // ... more form content ...

-     <SelectContent className="bg-surface-primary">
+     <SelectContent className="bg-surface-primary border-border-default">

      // ... rest of form ...

-     {status && <p className="mt-3 text-sm text-center text-text-secondary">{status}</p>}
+     {status && <p className="mt-3 text-sm text-center text-text-muted">{status}</p>}
   </div>
 );
```

**Why:** Mobile variant needs same theme-aware treatment. Changed from `bg-surface-secondary` to `bg-surface-primary` to properly respond to data-mode.

---

## 5. Architectural Alignment

### How This Solution Aligns with Our System

#### ✅ Follows Three-Layer Architecture

**From:** `docs/architecture/STYLE-SYSTEM-ARCHITECTURE.md`

```
LAYER 1: CSS Variables (globals.css) - The DNA
├── data-mode='dark' triggers variable overrides
└── Enables theme cascade without prop drilling

LAYER 2: @theme inline (globals.css) - Token Registration
├── Registers CSS variables as Tailwind utility tokens
└── bg-surface-primary → var(--surface-primary-val) via @theme inline

LAYER 3: Components - The Body
├── Consume tokens via className
└── bg-surface-primary responds to data-mode automatically
```

---

#### ✅ Uses Semantic Tokens Exclusively

**From:** `docs/architecture/STYLE-SYSTEM-ARCHITECTURE.md` Lines 888-905

```tsx
// ✅ CORRECT - Semantic tokens
bg-brand-primary        → Main brand color
bg-surface-elevated     → Cards, modals
text-text-primary       → Main text

// ❌ FORBIDDEN (was used incorrectly)
bg-brand-primary        → Would override theme cascade
```

**Our Fix:** All backgrounds and text colors now use semantic tokens that respond to `data-mode`.

---

#### ✅ Follows CVA Best Practices

**From:** `docs/architecture/CVA-ARCHITECTURE.md`

**Pattern:** Child selectors for nested styling

Our solution doesn't use child selectors because BookingWidgetDesktop is a separate component file, not nested markup. Instead, we use the **`data-mode` attribute pattern** which is more appropriate for component boundaries.

---

#### ✅ Aligns with Storybook Pattern

**From:** `.storybook/preview.tsx`

```typescript
decorators: [
  withThemeByDataAttribute({
    themes: { light: 'light', dark: 'dark' },
    attributeName: 'data-mode',  // ✅ Same pattern!
  }),
],
```

**Our Fix:** Uses the same `data-mode` attribute that Storybook uses for theming.

**See also:**
- [Storybook Developer Guide](../guides/storybook-guide.md) — Complete Storybook documentation including `withGeneratedPalette` decorator
- [Design Tokens](../design-system/design-tokens.md) — Token reference with Storybook integration section

---

#### ✅ Follows cn() Utility Pattern

**From:** `docs/architecture/STYLE-SYSTEM-ARCHITECTURE.md` Lines 619-627

```tsx
className={cn(componentVariants({ variant }), 'extra-class', className)}
//                                            ^^^^         ^^^^^^^^
//                                            CVA           Override (highest priority)
```

**Our Fix:** The `data-mode` attribute works alongside the `cn()` pattern without conflicts.

---

## 6. Git Context & Commit Reference

### Commit Message Suggestion

```
fix(bookingwidget): Fix dark theme visibility and establish theme-aware component pattern

PROBLEM:
- Dark theme (desktop-dark) showed invisible text - only title visible
- Child components had hardcoded backgrounds overriding parent theme
- CVA theme variant used wrong text color (text-text-inverted)
- Missing data-mode attribute prevented CSS variable cascade

ROOT CAUSE:
1. BookingWidgetDesktop hardcoded bg-surface-primary background
2. CVA dark theme used text-text-inverted which becomes dark (0 0% 3.9%) in dark mode
3. Parent wrapper didn't set data-mode attribute
4. CSS variable cascade system was broken

SOLUTION:
1. Added data-mode attribute to BookingWidget parent wrapper
2. Fixed CVA dark theme: text-text-inverted → text-text-primary
3. Removed backgrounds from CVA variants (child components handle them)
4. Updated child components to use semantic tokens with explicit borders
5. Changed mobile from bg-surface-secondary to bg-surface-primary

ARCHITECTURAL ALIGNMENT:
- Follows three-layer architecture (CSS vars → Tailwind → Components)
- Uses semantic tokens exclusively (no hardcoded colors)
- Matches Storybook's data-mode pattern
- Enables proper CSS variable cascade

FILES CHANGED:
- web-app/components/blocks/BookingWidget/index.tsx
- web-app/components/blocks/BookingWidget/BookingWidgetDesktop.tsx
- web-app/components/blocks/BookingWidget/BookingWidgetMobile.tsx
- web-app/lib/cva-variants.ts

TESTING:
- Verified light theme (desktop-default) still works
- Verified dark theme (desktop-dark) now visible with proper contrast
- Verified glass theme (desktop-glass) works correctly
- All form elements (inputs, selects, calendars) now theme-aware

Refs: #bookingwidget-theme-fix
```

### Related Epic/Story References

- **Epic 2:** Foundation Validation - CVA variants + ZOD schemas
- **Story 2.2:** CVA Variants + ZOD Schemas implementation
- **Story 12.4:** Visual Polish - Focus on WCAG AA contrast compliance

---

## 7. Component Implementation Standards

### Standard Pattern for Theme-Aware Components

When creating components with theme variants, follow this pattern:

#### Step 1: Parent Wrapper Sets `data-mode`

```tsx
export function ThemedComponent({ theme, children, className }) {
  return (
    <div
      className={cn(componentVariants({ theme }), className)}
      data-mode={theme}  // ✅ CRITICAL: Enables CSS variable cascade
    >
      {children}
    </div>
  );
}
```

#### Step 2: CVA Defines Text Colors Only (No Backgrounds)

```tsx
export const componentVariants = cva("base", {
  variants: {
    theme: {
      light: "text-text-primary",   // ✅ Semantic token
      dark: "text-text-primary",    // ✅ Semantic token (white via data-mode)
    }
  }
});
```

#### Step 3: Child Components Use Semantic Tokens

```tsx
export function ChildComponent() {
  return (
    <div className="bg-surface-primary border-border-default">
      {/* All colors respond to data-mode automatically */}
    </div>
  );
}
```

---

### When to Use Backgrounds in CVA vs Child

**Use CVA backgrounds when:**
- Component controls all its own markup (no nested components)
- Background is part of the variant's identity (e.g., button backgrounds)

**Use child component backgrounds when:**
- Component contains nested components (like BookingWidget → BookingWidgetDesktop)
- Background should respond to theme context
- Following semantic token system

---

### Forbidden Patterns

```tsx
// ❌ FORBIDDEN: Hardcoded colors
<div className="bg-blue-500 text-white">

// ❌ FORBIDDEN: Arbitrary values
<div className="bg-[#1e3a5f] text-white">

// ❌ FORBIDDEN: Text-inverted in dark mode CVA
theme: {
  dark: "text-text-inverted"  // Becomes dark in dark mode!
}

// ❌ FORBIDDEN: Parent background without data-mode
<div className="bg-brand-primary">  // Child won't respond
```

---

### Required Patterns

```tsx
// ✅ REQUIRED: Semantic tokens
<div className="bg-surface-primary text-text-primary">

// ✅ REQUIRED: data-mode attribute for theme cascade
<div data-mode={theme}>

// ✅ REQUIRED: text-primary for all themes (white in dark mode)
theme: {
  light: "text-text-primary",
  dark: "text-text-primary",  // NOT text-text-inverted
}
```

---

## 8. Testing & Verification

### How to Verify Theme Implementation

#### 1. Check Storybook Stories

```bash
# Light theme
http://localhost:6006/?path=/story/components-blocks-bookingwidget--desktop-default

# Dark theme
http://localhost:6006/?path=/story/components-blocks-bookingwidget--desktop-dark

# Glass theme
http://localhost:6006/?path=/story/components-blocks-bookingwidget--desktop-glass
```

#### 2. Use Storybook MCP to Verify

```typescript
// Get story documentation
get_story_docs({
  storyId: "components-blocks-bookingwidget--desktop-dark"
})

// Get URL for visual verification
get_story_urls({
  stories: [{
    absoluteStoryPath: "/path/to/BookingWidget.stories.tsx",
    exportName: "DesktopDark"
  }]
})
```

#### 3. Manual Visual Checklist

For dark theme, verify:
- [ ] Container background is dark (not white)
- [ ] Title text is white (visible)
- [ ] Labels are white (visible)
- [ ] Input backgrounds are lighter than container (contrast)
- [ ] Input text is white (visible)
- [ ] Buttons have proper contrast
- [ ] Calendar popover has proper background
- [ ] Select dropdown has proper background
- [ ] All borders are visible

---

### WCAG AA Contrast Requirements

**From:** `docs/epics/epic-12-visual-excellence_design-system_storybook` Story 12.4

| Element | Minimum Contrast | Typical Implementation |
|---------|-----------------|----------------------|
| Normal text | 4.5:1 | `text-text-primary` on `bg-surface-primary` |
| Large text | 3:1 | `text-fluid-xl` on `bg-surface-primary` |
| UI components | 3:1 | Buttons, inputs, borders |

---

## 9. References

### Project Documentation

| Document | Path | Purpose |
|----------|------|---------|
| **Style System Architecture** | `/docs/architecture/STYLE-SYSTEM-ARCHITECTURE.md` | Complete styling system reference |
| **CVA Architecture** | `/docs/architecture/CVA-ARCHITECTURE.md` | CVA pattern documentation |
| **Design Tokens** | `/docs/design-system/design-tokens.md` | Token definitions with Storybook integration |
| **Storybook Guide** | `/docs/guides/storybook-guide.md` | Storybook usage and palette generation documentation |
| **Design System Quick Reference** | `/docs/guides/design-system-quick-ref.md` | Quick token reference |
| **Storybook MCP Guide** | `/docs/guides/storybook-mcp-guide.md` | MCP tool reference |

---

### Configuration Files

| File | Purpose | Key Settings |
|------|---------|--------------|
| **globals.css** | `/web-app/app/globals.css` | CSS variables, dark mode overrides, @theme directive |
| **tailwind.config.js** | `/web-app/tailwind.config.js` | Maps CSS variables to utility classes |
| **.storybook/preview.ts** | `/web-app/.storybook/preview.ts` | Storybook theme decorator (data-mode pattern) |
| **cva-variants.ts** | `/web-app/lib/cva-variants.ts` | All CVA variant definitions |

---

### Key Code Locations

```
web-app/
├── app/
│   └── globals.css                    # CSS variables, dark mode [data-mode='dark']
├── .storybook/
│   └── preview.ts                     # Storybook theme decorator (data-mode pattern)
├── components/
│   └── blocks/
│       └── BookingWidget/
│           ├── index.tsx                # Wrapper with data-mode attribute ✅
│           ├── BookingWidgetDesktop.tsx # Child with semantic tokens ✅
│           └── BookingWidgetMobile.tsx  # Child with semantic tokens ✅
├── lib/
│   ├── cva-variants.ts               # CVA variants (text-colors only) ✅
│   └── utils/utils.ts                # cn() utility for class merging
└── stories/
    └── 2-Components/
        └── BookingWidget/
            └── BookingWidget.stories.tsx
```

---

### Semantic Token Reference

**From:** `docs/design-system/design-tokens.md`

#### Colors (all respond to `data-mode`)

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `bg-surface-primary` | White (0 0% 100%) | Dark (0 0% 3.9%) | Main backgrounds |
| `bg-surface-elevated` | Light gray (0 0% 98%) | Medium dark (0 0% 6%) | Cards, inputs |
| `text-text-primary` | Dark gray (222 47% 11%) | White (0 0% 98%) | Main text |
| `text-text-muted` | Medium gray (215 16% 57%) | Medium dark (0 0% 45.1%) | Secondary text |
| `text-text-inverted` | Light gray (0 0% 98%) | **Dark (0 0% 3.9%)** | Text on dark brand (DO NOT use in dark mode CVA!) |

---

### Critical Insights for Future Development

1. **NEVER use `text-text-inverted` in dark theme CVA variants** - it becomes dark in dark mode
2. **ALWAYS set `data-mode={theme}` on parent wrappers** when child components use semantic tokens
3. **CVA variants should control text colors, NOT backgrounds** when child components have their own containers
4. **Semantic tokens automatically respond to `data-mode`** - no need for conditional styling
5. **Add explicit borders to nested components** (PopoverContent, SelectContent) for theme visibility
6. **Test all theme variants** in Storybook before committing changes

---

## Appendix: Quick Decision Tree

```
Creating themed component?
│
├─→ Does it have nested components with their own containers?
│   │
│   ├─→ YES → Set data-mode attribute on parent wrapper
│   │        → CVA defines text colors only
│   │        → Child components use semantic tokens
│   │
│   └─→ NO → Can use CVA for both background and text
│            → Still consider data-mode for future extensibility
│
├─→ What text color for dark theme?
│   └─→ ALWAYS use text-text-primary (white in dark mode)
│        NEVER use text-text-inverted (dark in dark mode)
│
└─→ Testing checklist?
   └─→ Storybook all theme variants
       → Check contrast ratios
       → Verify form elements visible
       → Test with Storybook MCP tools
```

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-01-28 | Initial creation - documented BookingWidget theme fix | Claude Code (glm-4.7) |
| 2026-01-28 | Fixed CVA dark theme text-color bug | Claude Code (glm-4.7) |
| 2026-01-28 | Established standards for future component development | Claude Code (glm-4.7) |

---

**Next Steps:**
1. Review this document with the team
2. Apply these patterns to other components if needed
3. Update `docs/architecture/STYLE-SYSTEM-ARCHITECTURE.md` with learnings
4. Run full test suite to verify no regressions

---

*This document is maintained as part of the ET Hotel AI design system. All changes should be documented and this file updated accordingly.*
