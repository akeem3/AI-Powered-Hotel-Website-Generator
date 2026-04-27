# Semantic Color System Manual

**Purpose:** Comprehensive reference for the generated semantic color system, covering usage, architecture, and deployment.
**Epic Reference:** [Epic 15: Algorithmic Design System](../epics/epic-15.design-system_algorithmic-typography_ready_2026-02-03.md)

---

## 1. Quick Start

### Using Color Tokens in Components

```tsx
// BEFORE: Hardcoded generic colors
<div className="bg-blue-600 text-white hover:bg-blue-700">
  <h2 className="text-gray-900">Title</h2>
  <p className="text-gray-500">Description</p>
</div>

// AFTER: Semantic tokens with theme support
<div className="bg-brand-primary text-on-brand hover:bg-brand-primary-hover">
  <h2 className="text-text-primary">Title</h2>
  <p className="text-text-secondary">Description</p>
</div>
```

### Available Tokens

| Token Category | Prefix | Purpose | Typical Usage |
|----------------|--------|---------|---------------|
| **Brand** | `brand-*` | Core identity colors | Primary buttons, active states, key accents |
| **Surface** | `surface-*` | Background layers | Page backgrounds, cards, modals |
| **Text** | `text-*` | Typography colors | Headings, body text, metadata |
| **Border** | `border-*` | Component boundaries | Card borders, inputs, dividers |
| **Status** | `status-*` | Feedback & states | Success, error, warning badges |
| **Interactive** | `interactive-*` | Actionable elements | Links, clickable items |
| **Radius** | `rounded-*` | Shape/Corner styling | Cards, buttons, inputs (tokens: `radius-sm` to `radius-full`) |
| **Z-Index** | `z-*` | Layering depth | Modals, sticky headers (tokens: `z-nav`, `z-modal`) |

---

## 2. System Architecture

The color system automatically generates a comprehensive palette from a small set of base input colors using **OKLCH** perceptual color space.

### Input Contract: Hotel Base Colors

Hotels provide between 2 and 5 base OKLCH colors. If optional colors are omitted, defaults are generated.

```typescript
interface HotelBaseColors {
  // REQUIRED (minimum 2)
  brandPrimary: string;     // oklch(L C H) — Main brand identity
  brandSecondary: string;   // oklch(L C H) — Accent / CTA color

  // OPTIONAL
  brandAccent?: string;     // oklch(L C H) — Additional accent (default: complementary of primary)
  statusSuccess?: string;   // oklch(L C H) — Custom success color (default: hue 150)
  statusError?: string;     // oklch(L C H) — Custom error color (default: hue 27)
}
```

### Palette Generation Algorithm

The system generates a full theme from these base colors:

1.  **Lightness-Clamped Shade Scale**:
    *   Generates 11 shades (50–950) for each hue.
    *   Uses **Culori** to clamp chroma, ensuring all colors remain within the sRGB gamut.
    *   Lightness steps are fixed (e.g., 500=L0.65, 950=L0.24) to ensure consistency across hues.

2.  **Semantic Mapping**:
    *   Shades are mapped to semantic tokens (e.g., `brand-primary` maps to the `500` or `600` shade of the primary scale).
    *   **Text & Surfaces**: Use **Neutral Variants** (very low chroma) rather than pure grays or heavy tints. This keeps interfaces clean while ensuring harmony.

3.  **Dark Mode Generation**:
    *   **Surfaces**: Become **Achromatic** (chroma=0) for true dark appearance.
    *   **Text**: High lightness achromatic values.
    *   **Brand**: Lightness is shifted (L=0.55–0.78) and desaturated (15%) to reduce eye strain on dark backgrounds.

4.  **Hover States**: Automatically calculated using `darken()` logic (subtracting lightness channel) for consistent interaction feedback.

### The Shader/UI Token Bridge

To support **shadcn/ui** components without modifying their source code, we implement a **Token Bridge** in `globals.css` inside the `@theme inline` block.

This maps shadcn/ui primitives (like `--primary`, `--card`, `--input`) directly to our generated semantic tokens.

```css
@theme inline {
  /* ...project tokens... */

  /* shadcn/ui compatibility bridge */
  --color-primary: var(--brand-primary-val);
  --color-primary-foreground: var(--on-brand-val);
  --color-muted: var(--surface-muted-val);
  --color-muted-foreground: var(--text-muted-val);
  --color-card: var(--surface-primary-val);
  --color-card-foreground: var(--text-primary-val);
  --color-border: var(--border-default-val);
  /* ...others mapped similarly... */
}
```

**Benefit**: When the palette generator updates the `--brand-primary-val` variable at runtime, every shadcn/ui Button and Input automatically updates to match the new hotel theme.

---

## 3. Implementation Details

### File Locations

| File | Purpose |
|------|---------|
| `web-app/app/globals.css` | **Source of Truth.** Defines all CSS variables and registers tokens. |
| `web-app/lib/hooks/useHotelTheme.ts` | **Runtime Engine.** Generates palettes and overrides CSS variables. |
| `web-app/lib/color/palette-generator.ts` | **Core Logic.** Culori-based algorithm for shade generation. |
| `web-app/lib/cva-variants.ts` | **Component Variants.** Maps tokens to component states (CVA). |
| `web-app/stories/1-Design-System/ColorPalette.stories.tsx` | **Visual Documentation.** View all generated colors. |

### Development Context for AI

1.  **Strictly Semantic**: NEVER use raw color names like `blue-500` or `slate-900`.
2.  **Contrast Pairs**: Always pair background and text tokens correctly:
    *   `bg-brand-primary` + `text-on-brand`
    *   `bg-surface-primary` + `text-text-primary`
3.  **Opacity Modifiers**: Use Tailwind v4 opacity modifiers: `bg-brand-primary/10`.
4.  **Token Decision Tree**:
    *   Background? `bg-surface-primary` (Page) vs `bg-surface-elevated` (Card).
    *   Text? `text-text-primary` (Headings) vs `text-text-secondary` (Body).
    *   Border? `border-border-default`.

---

## 4. Troubleshooting

*   **Colors transparent/white?** Check if `useHotelTheme` is running and if `globals.css` has fallback defaults in `:root`.
*   **Dark mode broken?** Ensure `data-mode="dark"` attribute is present on `<html>`.
*   **Shadcn component wrong color?** Check the **Token Bridge** mappings in `globals.css`.

---

## 5. Related Documentation

*   [**Semantic Typography System**](./semantic-typography-system.md)
*   [**Storybook Management**](./storybook-management.md)
*   [**Tailwind Config**](../../web-app/tailwind.config.js)
