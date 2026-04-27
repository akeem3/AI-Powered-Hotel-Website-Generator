# Design System Tokens

This document serves as the reference for the centralized design system using dynamic palette generation.

## Core Philosophy

- **Semantic Naming**: Tokens describe *what* they are for (e.g., `bg-surface-elevated`), not *what* they look like (e.g., `bg-gray-100`).
- **Generated Palettes**: All color tokens are algorithmically derived from 2-5 base OKLCH colors provided by hotels.
- **CSS Variables**: All tokens map to CSS variables to enable runtime theming by the palette generator.
- **Fluidity**: Typography and spacing use fluid scales (`clamp()`) to adapt to any viewport.

---

## Color System Architecture

### Input: Base Colors

Hotels provide 2-5 OKLCH base colors:

```typescript
interface HotelBaseColors {
  // REQUIRED (minimum 2)
  brandPrimary: string;     // oklch(L C H) — Main brand identity
  brandSecondary: string;   // oklch(L C H) — Accent / CTA color

  // OPTIONAL (defaults provided if omitted)
  brandAccent?: string;     // oklch(L C H) — Additional accent
  statusSuccess?: string;   // oklch(L C H) — Custom success color
  statusError?: string;     // oklch(L C H) — Custom error color
}
```

**Example:**
```typescript
const hotelTheme = {
  colors: {
    brandPrimary: 'oklch(0.346 0.074 256)',    // Deep navy
    brandSecondary: 'oklch(0.748 0.099 86.1)', // Gold accent
  },
  typography: { /* ... */ }
};
```

### Generation: Culori-Based Palette Generator

For each base color, the system generates an 11-step shade scale (50-950) using perceptually uniform OKLCH math:

1. **Extract hue (H)** from the base OKLCH color
2. **Define lightness steps** matching Tailwind convention (50=lightest at L=0.98, 950=darkest at L=0.24)
3. **Compute max chroma** for each lightness level (hue-dependent)
4. **Clamp chroma** to stay within displayable sRGB gamut using Culori's `clampChroma()`

**Generated shade scales:**
- `--primary-50-val` through `--primary-950-val` (11 shades)
- `--secondary-50-val` through `--secondary-950-val` (11 shades)
- Additional scales if accent/success/error colors provided

### Mapping: Semantic Tokens

Semantic tokens are derived from specific shade indices or neutral variants:

| Semantic Token | Light Mode Source | Dark Mode Source |
|----------------|-------------------|------------------|
| `brand-primary` | `primary-500` (or nearest to input) | Lightened variant (L=0.55-0.78) |
| `brand-secondary` | `secondary-500` (or nearest to input) | Lightened variant |
| `text-primary` | **Neutral variant** (L=0.208, C=0.04) | `oklch(0.985 0 0)` (white) |
| `text-secondary` | **Neutral variant** (L=0.554, C=0.041) | `oklch(0.715 0 0)` (gray) |
| `text-muted` | **Neutral variant** (L=0.711, C=0.035) | `oklch(0.556 0 0)` (muted gray) |
| `text-inverted` | **Neutral variant** (L=0.984, C=0.003) | `oklch(0.145 0 0)` (dark) |
| `text-on-brand` | `oklch(1 0 0)` (white) | `oklch(1 0 0)` (white) |
| `surface-default` | `oklch(1 0 0)` (white) | **Achromatic** `oklch(0.145 0 0)` |
| `surface-primary` | `oklch(1 0 0)` (white) | **Achromatic** `oklch(0.145 0 0)` |
| `surface-elevated` | **Neutral variant** (L=0.984, C=0.003) | **Achromatic** `oklch(0.168 0 0)` |
| `surface-secondary` | **Neutral variant** (L=0.968, C=0.007) | **Achromatic** `oklch(0.168 0 0)` |
| `surface-muted` | **Neutral variant** (L=0.968, C=0.007) | **Achromatic** `oklch(0.218 0 0)` |
| `border-default` | **Neutral variant** (L=0.929, C=0.013) | **Achromatic** `oklch(0.297 0 0)` |
| `border-strong` | **Neutral variant** (L=0.711, C=0.035) | **Achromatic** `oklch(0.371 0 0)` |
| `status-success` | `success-600` | Brightened variant |
| `status-warning` | Derived from error hue + 59° | Brightened variant |
| `status-error` | `error-500` | Brightened variant |
| `status-info` | Derived from primary hue | Brightened variant |

**Important:** Text, borders, and light surfaces use **neutral variants** (very low chroma) rather than direct palette shades. This ensures text appears as neutral gray, not tinted with the brand hue. Dark mode uses **achromatic** colors (chroma = 0) for true black/gray appearance.

### Application: useHotelTheme Hook

The `useHotelTheme` hook orchestrates palette generation and application:

```typescript
// web-app/lib/hooks/useHotelTheme.ts
export function useHotelTheme(hotelId: string, theme: HotelTheme) {
  useEffect(() => {
    const generatedTheme = generateFullTheme(theme.colors);
    const cssVars = mapShadesToCssVariables(generatedTheme);

    const root = document.documentElement;
    Object.entries(cssVars).forEach(([varName, value]) => {
      root.style.setProperty(varName, value);
    });

    root.setAttribute('data-theme', `hotel-${hotelId}`);
  }, [hotelId, theme]);
}
```

When called:
1. Generates ~100+ CSS variables from 2-5 base colors
2. Applies all `-val` variables to `:root`
3. Triggers CSS variable cascade for all dependent tokens

> **Note:** `useHotelTheme` sets CSS variable *values* but does NOT load font files. Font availability depends on which fonts are pre-loaded in `layout.tsx` via `next/font/google`. Currently only Playfair Display and Inter are loaded.

### Dark Mode: Automatic Generation

Dark mode colors are algorithmically derived:

- **Surfaces:** Achromatic (chroma = 0) for true black/gray appearance (not tinted)
- **Text:** High lightness achromatic (L: 0.55-0.99, C: 0)
- **Brand:** Lightened by shifting to L=0.55-0.78 range with 15% desaturation (chroma reduced to 85%)
- **Status:** Brightened by shifting to L=0.65-0.85 range with 15% desaturation

Toggling `data-mode="dark"` on the root element applies the generated dark mode values automatically.

### Fallbacks: Default Palette in globals.css

The `globals.css :root` block provides default values when no hotel theme is applied:

```css
@layer theme {
  :root {
    /* Default values — overridden by useHotelTheme when hotel theme applied */
    --brand-primary-val: oklch(0.346 0.074 256);
    --brand-secondary-val: oklch(0.748 0.099 86.1);
    --text-primary-val: oklch(0.208 0.04 265.8);
    /* ... etc */
  }
}
```

This ensures:
- Pages without a hotel theme still render correctly
- Development and testing environments work without runtime theme application
- Storybook displays sensible defaults (overridden by `withGeneratedPalette` decorator)

### Contrast: APCA Validation

The project includes APCA (Advanced Perceptual Contrast Algorithm) contrast measurement (`web-app/lib/color/contrast-validator.ts`) with these thresholds:

- **Body text:** Minimum Lc 75 (WCAG AA equivalent)
- **Large text:** Minimum Lc 60
- **UI components:** Minimum Lc 45

> **Current limitation:** `validateThemeContrast()` is currently **test-only** — it is NOT integrated into the palette generation pipeline or QualityValidator. The palette generator handles gamut clamping but does not automatically adjust colors for APCA contrast. Integration is planned in [Story 20.3](../plans/ai-driven-block-style-diversity-plan.md).

### shadcn/ui Token Bridge

The system bridges shadcn/ui component tokens to project semantic tokens via `@theme inline` aliases:

```css
@theme inline {
  /* shadcn/ui compatibility — aliases to project semantic tokens */
  --color-primary: var(--brand-primary-val);
  --color-primary-foreground: var(--on-brand-val);
  --color-accent: var(--surface-secondary-val);
  --color-muted: var(--surface-muted-val);
  --color-muted-foreground: var(--text-muted-val);
  --color-destructive: var(--status-error-val);
  --color-popover: var(--surface-primary-val);
  --color-card: var(--surface-primary-val);
  --color-input: var(--border-default-val);
  --color-ring: var(--brand-primary-val);
  --color-border: var(--border-default-val);
  /* ... etc */
}
```

This ensures:
- Button, Input, Calendar, Select, Popover, and other shadcn/ui primitives automatically use generated brand colors
- No modifications needed to shadcn/ui component files
- `npx shadcn add` and `npx shadcn diff` continue to work without conflicts

### Storybook Integration

Storybook uses the same palette generation system as production to ensure visual consistency.

**The `withGeneratedPalette` Decorator**

Located in `.storybook/preview.tsx` (lines 17-81), this decorator:

1. **Generates a default palette** using the same `generateFullTheme()` function as production
2. **Maps to CSS variables** using `mapShadesToCssVariables()` and `mapDarkModeCssVariables()`
3. **Applies light mode variables** initially to the `:root` element
4. **Watches for theme changes** via MutationObserver
5. **Conditionally applies dark mode** when `data-mode="dark"` is set

**Why this is necessary:**

Without this decorator, Storybook would only display the hardcoded defaults from `globals.css`. Since production uses `useHotelTheme` to generate and apply hotel-specific palettes, Storybook needs the same behavior to display accurate colors.

**Default Storybook palette:**

```typescript
const defaultColors: HotelBaseColors = {
  brandPrimary: 'oklch(0.346 0.074 256)',   // Deep blue
  brandSecondary: 'oklch(0.748 0.099 86.1)', // Gold
  brandAccent: 'oklch(0.65 0.15 200)',       // Cyan (optional)
  statusSuccess: 'oklch(0.448 0.108 151.3)', // Green (optional)
  statusError: 'oklch(0.577 0.215 27.3)',    // Red (optional)
};
```

This matches the `DEFAULT_BASE_COLORS` used in `ColorPalette.stories.tsx`.

**MutationObserver pattern:**

```typescript
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.attributeName === 'data-mode' || mutation.attributeName === 'data-theme') {
      applyDarkMode();
    }
  }
});

observer.observe(root, { attributes: true, attributeFilter: ['data-mode', 'data-theme'] });
```

This pattern ensures that:
- Storybook's theme toolbar triggers the same variable updates as production
- Dark mode variables are only applied when `data-mode="dark"` is set
- The palette system works identically in both Storybook and production

**Dual attribute support:**

The observer watches both `data-mode` and `data-theme` attributes:
- `data-mode` - Used by Storybook's theme decorator for light/dark switching
- `data-theme` - Used by production components for hotel theme identification

Both attributes are supported to ensure seamless theming across environments.

**See also:**
- [Storybook Developer Guide](../guides/storybook-guide.md) — Complete Storybook documentation
- [Theme Fix Standards](../architecture/bookingwidget-theme-fix-standards.md) — CSS variable cascade pattern

---

## Token Categories

### Brand Colors

Generated from `brandPrimary` and `brandSecondary` inputs:

| Token | Class | Description |
|-------|-------|-------------|
| `--brand-primary-val` | `bg-brand-primary` | Main brand color |
| `--brand-primary-hover-val` | `bg-brand-primary-hover` | Hover state (darken by 0.08 lightness) |
| `--brand-secondary-val` | `bg-brand-secondary` | Accent color |
| `--brand-secondary-hover-val` | `bg-brand-secondary-hover` | Hover state (darken by 0.06 lightness) |
| `--brand-white-val` | `bg-brand-white` | Pure white for brand contrast |

### Surface Colors (Backgrounds)

Generated from primary shade scale:

| Token | Class | Description |
|-------|-------|-------------|
| `--surface-default-val` | `bg-surface-default` | Page background |
| `--surface-primary-val` | `bg-surface-primary` | Primary background |
| `--surface-elevated-val` | `bg-surface-elevated` | Cards, modals |
| `--surface-muted-val` | `bg-surface-muted` | Subtle backgrounds |
| `--surface-secondary-val` | `bg-surface-secondary` | Secondary areas |

### Text Colors

Generated from primary shade scale with contrast validation:

| Token | Class | Description |
|-------|-------|-------------|
| `--text-primary-val` | `text-text-primary` | Main text |
| `--text-secondary-val` | `text-text-secondary` | Secondary text |
| `--text-muted-val` | `text-text-muted` | Subtle text |
| `--text-inverted-val` | `text-text-inverted` | Text on dark backgrounds |
| `--text-on-brand-val` | `text-on-brand` | Text on brand colors |

### Border Colors

Generated from primary shade scale:

| Token | Class | Description |
|-------|-------|-------------|
| `--border-default-val` | `border-border-default` | Default borders |
| `--border-strong-val` | `border-border-strong` | Emphasized borders |

### Interactive States

Aliases and derived colors:

| Token | Class | Description |
|-------|-------|-------------|
| `--interactive-primary-val` | `bg-interactive-primary` | Interactive elements (alias to brand-secondary) |
| `--interactive-primary-hover-val` | `bg-interactive-primary-hover` | Hover state |

### Status Colors

Generated from optional inputs or sensible defaults:

| Token | Class | Description |
|-------|-------|-------------|
| `--status-success-val` | `text-status-success` | Success messages |
| `--status-warning-val` | `text-status-warning` | Warnings |
| `--status-error-val` | `text-status-error` | Errors |
| `--status-error-strong-val` | `text-status-error-strong` | Critical errors |
| `--status-info-val` | `text-status-info` | Informational messages |

---

## Typography

> **Full Reference:** See [Semantic Typography System Manual](../manual/semantic-typography-system.md) for comprehensive usage guidelines.

### Fonts

| Token | Class | Usage |
|-------|-------|-------|
| `--font-display` | `font-display` | Headings (Playfair Display) |
| `--font-body` | `font-body` | Paragraphs, UI (Inter) |
| `--font-mono` | `font-mono` | Code, technical data (Fira Code) |

> **Current limitation:** Only Playfair Display and Inter are loaded via `next/font/google` in `layout.tsx`. The `useHotelTheme` hook can set `--font-display`/`--font-body` CSS variables to other font families, but the font files will NOT be loaded — they fall back to system fonts. Additional fonts must be pre-loaded in `layout.tsx` before they can be used. See [Story 20.4a](../plans/ai-driven-block-style-diversity-plan.md).

### Semantic Typography Tokens (Recommended)

Fluid scaling between 375px → 768px viewport:

| Token | Class | Min → Max | Usage |
|-------|-------|-----------|-------|
| `display` | `text-size-display` | 36px → 60px | Hero titles |
| `h1` | `text-size-h1` | 24px → 36px | Page headings |
| `h2` | `text-size-h2` | 20px → 28px | Section headings |
| `h3` | `text-size-h3` | 18px → 22px | Card titles, nav |
| `body-large` | `text-size-body-large` | 18px → 20px | Lead text |
| `body` | `text-size-body` | 16px → 18px | Default body |
| `caption` | `text-size-caption` | 14px → 16px | Labels, metadata |
| `overline` | `text-size-overline` | 12px → 14px | Badges, tags |

**Source:** `web-app/styles/typography-tokens.css`

### Legacy Fluid Scale (Deprecated)

> **Note:** Use semantic tokens (`text-size-*`) instead. Legacy `text-fluid-*` classes remain for backward compatibility but are not recommended for new components.

| Class | Min Size | Max Size |
|-------|----------|----------|
| `text-fluid-sm` | 0.875rem | 1rem |
| `text-fluid-base` | 1rem | 1.125rem |
| `text-fluid-lg` | 1.125rem | 1.5rem |
| `text-fluid-xl` | 1.5rem | 2.25rem |
| `text-fluid-2xl` | 2.25rem | 3.75rem |

### Utility Classes

| Class | Purpose |
|-------|---------|
| `text-trim` | Optical text alignment (cap-height based) |
| `tabular-nums` | Fixed-width numbers for price alignment |

---

## Spacing

| Token | Class | Value |
|-------|-------|-------|
| `spacing.section` | `p-section` | `clamp(2rem, 5vw, 4rem)` |
| `spacing.container` | `p-container` | `clamp(1rem, 5vw, 2rem)` |

---

## Shadows

| Token | Class | Value |
|-------|-------|-------|
| `--shadow-sm` | `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |
| `--shadow-md` | `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` |
| `--shadow-lg` | `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1)` |
| `--shadow-card` | `shadow-card` | Alias to `--shadow-md` |
| `--shadow-card-hover` | `shadow-card-hover` | Alias to `--shadow-lg` |

---

## Border Radius

| Token | Class | Value |
|-------|-------|-------|
| `--radius-sm` | `rounded-sm` | `0.25rem` |
| `--radius-md` | `rounded-md` | `0.5rem` |
| `--radius-lg` | `rounded-lg` | `0.75rem` |
| `--radius-xl` | `rounded-xl` | `1rem` |
| `--radius-2xl` | `rounded-2xl` | `1.5rem` |
| `--radius-full` | `rounded-full` | `9999px` |

---

## Usage Guidelines

### Always Use Semantic Tokens

**❌ Bad:** Hardcoded colors
```tsx
<div className="bg-blue-500 text-white">
```

**✅ Good:** Semantic tokens
```tsx
<div className="bg-brand-primary text-on-brand">
```

### Opacity Modifiers Work Automatically

Tailwind v4 handles opacity via `color-mix(in oklab)`:

```tsx
<div className="bg-brand-primary/50">     {/* 50% opacity */}
<div className="bg-status-error/faint">   {/* 5% opacity */}
<div className="bg-surface-primary/wash"> {/* 10% opacity */}
```

### Dark Mode Follows the Data Attribute

Set `data-mode="dark"` on the root element:

```html
<html data-mode="dark">
  <!-- All generated tokens switch to dark mode values -->
</html>
```

### Hover States Are Derived

Hover states are generated by the `darken()` function which subtracts from lightness:

- **Primary brand hover:** `darken(color, 0.08)` — subtracts 0.08 from lightness
- **Secondary brand hover:** `darken(color, 0.06)` — subtracts 0.06 from lightness
- **Interactive hover:** `darken(color, 0.06)` — subtracts 0.06 from lightness

Use Tailwind hover modifiers:

```tsx
<button className="bg-brand-primary hover:bg-brand-primary-hover">
  {/* Hover state automatically darker via lighten() function */}
</button>
```

---

## Why OKLCH?

The system uses OKLCH (CSS Color Level 4) for all color tokens:

- **Perceptually uniform**: Equal numeric steps = equal perceived change
- **Better color-mix()**: Mixing in OKLCH produces natural intermediates
- **Wider gamut**: Supports Display P3 and future wide-gamut displays
- **Algorithmic generation**: Predictable shade scales from any base hue

---

## Technical Implementation

### File Structure

| File | Purpose |
|------|---------|
| `web-app/lib/color/palette-generator.ts` | Core shade scale generation using Culori |
| `web-app/lib/color/semantic-mapper.ts` | Maps shade indices to semantic token names |
| `web-app/lib/color/contrast-validator.ts` | APCA contrast validation |
| `web-app/lib/hooks/useHotelTheme.ts` | Runtime palette application |
| `web-app/app/globals.css` | Default palette + @theme inline registration |

### CSS Variable Pipeline

```
Hotel provides 2-5 base OKLCH colors
        ↓
[palette-generator.ts] Generates 11-step shade scales
        ↓
[semantic-mapper.ts] Derives semantic tokens from shades
        ↓
[useHotelTheme.ts] Applies ~100+ CSS variables to :root
        ↓
[@theme inline] Tailwind utilities resolve to generated values
        ↓
[Components] Use semantic classes (bg-brand-primary, etc.)
        ↓
[Rendered DOM] Displays hotel-specific brand colors
```

### Testing & Validation

- **Unit tests**: `web-app/tests/color/*.test.ts` (palette generation, OKLCH parsing, semantic mapping, contrast validation)
- **Integration tests**: End-to-end pipeline from base colors to rendered tokens
- **Validation script**: `npm run validate:colors` (verifies token coverage and semantic token compliance)

---

## Related Documentation

- [Semantic Typography System Manual](../manual/semantic-typography-system.md) — **Typography usage guide for developers**
- [Style System Architecture](../architecture/STYLE-SYSTEM-ARCHITECTURE.md) — Complete styling system reference
- [CVA Architecture](../architecture/CVA-ARCHITECTURE.md) — Component variant patterns
- [Storybook Developer Guide](../guides/storybook-guide.md) — Storybook usage and palette generation
- [Theme Fix Standards](../architecture/bookingwidget-theme-fix-standards.md) — CSS variable cascade and data-mode pattern
- [Design System Quick Reference](../guides/design-system-quick-ref.md) — Quick token reference
- [Epic 15: Typography Tokens](../epics/epic-15.design-system_algorithmic-typography_ready_2026-02-03.md) — Implementation specification
- [Research: Fluid Typography](../research/utopia_core_fluid_typography_tailwind_v4_2026-02-03_8ac4.md) — Fluid typography approach
- [Research: OKLCH Culori Palette Generation](../research/oklch_culori_palette_generation_2026-01-28_f4a2.md) — Technical foundation
- [Research: Tailwind v4 Theming](../research/tailwind_v4_theming_color_system_2026-01-28_a7b3.md) — CSS variable architecture
- [Research: shadcn/ui Customization](../research/shadcn_ui_customization_tailwind_v4_design_tokens_2026-01-28_c8f1.md) — Token bridge pattern
