# Semantic Typography System Manual

**Purpose:** Developer reference for using semantic typography tokens in component development.
**Epic Reference:** [Epic 15: Algorithmic Design System - Typography Tokens](../epics/epic-15.design-system_algorithmic-typography_ready_2026-02-03.md)

---

## Quick Start

### Using Typography Tokens in Components

```tsx
// BEFORE: Static sizes with breakpoint jumps
<h1 className="text-2xl md:text-3xl lg:text-4xl">Hero Title</h1>
<p className="text-sm md:text-base">Description</p>

// AFTER: Semantic tokens with fluid scaling
<h1 className="text-size-display">Hero Title</h1>
<p className="text-size-body">Description</p>
```

### Available Tokens

| Token | Class | Min → Max | Typical Usage |
|-------|-------|-----------|---------------|
| `display` | `text-size-display` | 36px → 60px | Hero titles, splash screens |
| `h1` | `text-size-h1` | 24px → 36px | Page headings, section headers |
| `h2` | `text-size-h2` | 20px → 28px | Subsection headings |
| `h3` | `text-size-h3` | 18px → 22px | Card titles, navigation links |
| `body-large` | `text-size-body-large` | 18px → 20px | Lead paragraphs, descriptions |
| `body` | `text-size-body` | 16px → 18px | Default body text, buttons |
| `caption` | `text-size-caption` | 14px → 16px | Labels, metadata, captions |
| `overline` | `text-size-overline` | 12px → 14px | Badges, tiny labels, tags |

---

## System Architecture

### How It Works

```
┌─────────────────────────────────────────────────────────────────────┐
│  typography-tokens.css                                               │
│  ├── Defines --font-size-*-val CSS variables with clamp() formulas  │
│  └── Viewport range: 375px (mobile) → 768px (tablet)                │
└────────────────────────────────────┬────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│  globals.css (@theme inline)                                         │
│  ├── Registers --font-size-* tokens pointing to -val variables      │
│  └── Tailwind generates text-size-* utility classes automatically   │
└────────────────────────────────────┬────────────────────────────────┘
                                     ↓
┌─────────────────────────────────────────────────────────────────────┐
│  Components                                                          │
│  └── Use text-size-h1, text-size-body, etc. → fluid scaling         │
└─────────────────────────────────────────────────────────────────────┘
```

### File Locations

| File | Purpose |
|------|---------|
| `web-app/styles/typography-tokens.css` | Token definitions with clamp() formulas |
| `web-app/app/globals.css` | Imports tokens, registers with Tailwind |
| `web-app/stories/1-Design-System/Typography.stories.tsx` | Visual documentation |

### Cross-References

| Document | Section | Purpose |
|----------|---------|---------|
| [design-tokens.md](../design-system/design-tokens.md) | Typography section | Overall design system context |
| [utopia_core_fluid_typography_tailwind_v4_2026-02-03_8ac4.md](../research/utopia_core_fluid_typography_tailwind_v4_2026-02-03_8ac4.md) | Recommendations | Why we use manual clamp() |
| [tailwind_v4_theming_color_system_2026-01-28_a7b3.md](../research/tailwind_v4_theming_color_system_2026-01-28_a7b3.md) | @theme inline | CSS variable architecture |

---

## Token Mapping Guidelines

### By Component Type

| Component Type | Token Recommendations |
|----------------|----------------------|
| **Hero Sections** | `text-size-display` for title, `text-size-body-large` for subtitle |
| **Section Headers** | `text-size-h1` for main, `text-size-h2` for subsections |
| **Cards** | `text-size-h3` for title, `text-size-body` for description, `text-size-caption` for metadata |
| **Navigation** | `text-size-h3` for logo, `text-size-body` for menu items |
| **Forms** | `text-size-body` for inputs, `text-size-caption` for labels/errors |
| **Buttons** | `text-size-body` for standard, `text-size-caption` for small |
| **Badges/Tags** | `text-size-overline` for all badge text |
| **Prices** | `text-size-body-large` + `tabular-nums` for alignment |
| **Error Messages** | `text-size-caption` for inline, `text-size-h2` for error headings |

### Component Migration Examples

**RoomCard:**
```tsx
// Room name
<h3 className="text-size-h3 font-semibold">{room.name}</h3>

// Price display (with numeric alignment)
<span className="text-size-body-large tabular-nums">${room.price}</span>

// Description
<p className="text-size-body text-text-secondary">{room.description}</p>

// Amenities
<span className="text-size-caption">{amenity.name}</span>
```

**Navigation:**
```tsx
// Logo text
<span className="text-size-h3 font-bold">{hotelName}</span>

// Menu items
<a className="text-size-body hover:text-brand-primary">{item.label}</a>
```

**Contact Section:**
```tsx
// Section heading
<h2 className="text-size-h1 font-display">Contact Us</h2>

// Description
<p className="text-size-body-large text-text-secondary">{description}</p>

// Form labels
<label className="text-size-caption">{labelText}</label>
```

---

## What NOT to Migrate

### Keep Static Sizes For:

1. **Text Alignment Classes** - `text-center md:text-left` (layout, not typography)
2. **Decorative Icons** - Large icon-only elements (e.g., `text-6xl` for error icon)
3. **Specific Design Requirements** - When a fixed size is intentionally required

### Examples of Non-Typography Classes

```tsx
// These are LAYOUT classes, not typography - DO NOT change
<div className="text-center md:text-left">  // text alignment
<div className="text-left lg:text-right">   // text alignment

// Decorative - intentionally fixed
<span className="text-6xl">!</span>  // Error icon
```

---

## Fluid Scaling Mechanics

### The clamp() Formula

Each token uses the CSS `clamp()` function:

```css
/* Formula: clamp(min, preferred, max) */
--font-size-h1-val: clamp(1.5rem, 0.8931rem + 2.5954vw, 2.25rem);
```

**How it works:**
- **min** (`1.5rem` = 24px): Size at 375px viewport
- **preferred** (`0.8931rem + 2.5954vw`): Scales smoothly with viewport
- **max** (`2.25rem` = 36px): Size at 768px+ viewport

### Viewport Range

All tokens scale between:
- **Minimum:** 375px (iPhone SE, small mobile)
- **Maximum:** 768px (iPad portrait, tablet)

Above 768px, sizes stay at their maximum. This is intentional - desktop typography doesn't need to keep growing.

### Why This Matters

**Before (breakpoint-based):**
```
375px  →  text-2xl (24px)
640px  →  ⬆ JUMP to text-3xl (30px)
768px  →  ⬆ JUMP to text-4xl (36px)
```

**After (fluid scaling):**
```
375px  →  24px
500px  →  28.5px (smooth)
640px  →  33px (smooth)
768px  →  36px
```

---

## Utility Classes

### Text Trim (Optical Alignment)

For icon + text alignment:

```tsx
// Without text-trim: Text box includes line-height padding
<span className="flex items-center gap-2">
  <Icon />
  <span className="text-trim">Label</span>  // Optically centers text
</span>
```

**Browser Support:**
- Chrome 133+, Safari 18.2+: Native `text-box-trim`
- Firefox: Fallback via `margin-block: calc(0.5cap - 0.5lh)`

### Tabular Numbers (Price Alignment)

For prices and numbers that should align vertically:

```tsx
<div className="flex flex-col">
  <span className="tabular-nums">$129.00</span>
  <span className="tabular-nums">$1,299.99</span>
  <span className="tabular-nums">$99.00</span>  // All digits align
</div>
```

---

## AI Development Context

### For LLM/AI Agents Generating Components

When generating new hotel website components:

1. **Always use semantic tokens** - Never use `text-lg md:text-xl lg:text-2xl`
2. **Follow the token hierarchy** - `display` > `h1` > `h2` > `h3` > `body-large` > `body` > `caption` > `overline`
3. **Combine with font families** - Headings get `font-display`, body gets no explicit class (defaults to body font)
4. **Use color tokens together** - `text-size-body text-text-secondary` is the pattern

### Token Selection Decision Tree

```
Is this a main page/hero title?
├── YES → text-size-display
└── NO → Is this a section heading?
    ├── YES → text-size-h1
    └── NO → Is this a subsection/card title?
        ├── YES → text-size-h2 or text-size-h3
        └── NO → Is this emphasized/lead text?
            ├── YES → text-size-body-large
            └── NO → Is this regular content?
                ├── YES → text-size-body
                └── NO → Is this metadata/labels?
                    ├── YES → text-size-caption
                    └── NO → text-size-overline (smallest)
```

### Consistency Rules

1. **Same element type = same token** across all components
   - All card titles use `text-size-h3`
   - All body text uses `text-size-body`

2. **Hierarchy must be maintained**
   - Section heading > Card title > Card description
   - `text-size-h1` > `text-size-h3` > `text-size-body`

3. **Never mix static and semantic** in the same component
   - If migrating, convert all typography classes

---

## Token Definitions Reference

Source: `web-app/styles/typography-tokens.css`

```css
:root {
  /* Display - Hero titles */
  --font-size-display-val: clamp(2.25rem, 1.0153rem + 5.2749vw, 3.75rem);
  --line-height-display-val: 1.1;

  /* H1 - Page headings */
  --font-size-h1-val: clamp(1.5rem, 0.8931rem + 2.5954vw, 2.25rem);
  --line-height-h1-val: 1.2;

  /* H2 - Section headings */
  --font-size-h2-val: clamp(1.25rem, 0.8550rem + 1.6539vw, 1.75rem);
  --line-height-h2-val: 1.3;

  /* H3 - Subsection headings */
  --font-size-h3-val: clamp(1.125rem, 0.9275rem + 0.8473vw, 1.375rem);
  --line-height-h3-val: 1.4;

  /* Body Large - Emphasized body */
  --font-size-body-large-val: clamp(1.125rem, 1.0260rem + 0.4237vw, 1.25rem);
  --line-height-body-large-val: 1.6;

  /* Body - Default body */
  --font-size-body-val: clamp(1rem, 0.9008rem + 0.4237vw, 1.125rem);
  --line-height-body-val: 1.6;

  /* Caption - Small labels */
  --font-size-caption-val: clamp(0.875rem, 0.7760rem + 0.4237vw, 1rem);
  --line-height-caption-val: 1.5;

  /* Overline - Tiny text */
  --font-size-overline-val: clamp(0.75rem, 0.6512rem + 0.4237vw, 0.875rem);
  --line-height-overline-val: 1.4;
}
```

---

## Migrated Components Reference

The following components have been migrated to semantic typography:

### Sections
- `HeroSection` - All variants (centered, split, minimal)
- `ContactForm`, `ContactHeader`, `ContactInfo`
- `RoomsHeader`

### Blocks
- `RoomCard` - All variants (compact, detailed, grid)
- `Amenities` - AmenityCard, AmenitiesList, AmenitiesFeatured
- `Testimonials` - TestimonialCard, TestimonialFeatured, TestimonialCarousel
- `Navigation` - NavigationDesktop, NavigationMobile
- `BookingWidget` - BookingWidgetDesktop, BookingWidgetMobile
- `ImageGallery` - GalleryGrid, GalleryCarousel, GalleryMasonry, Lightbox
- `LanguageSelector`

### Renderers
- `ComponentRenderer` - Error display states

---

## Research Context

### Why Manual clamp() Instead of Libraries

From [utopia_core_fluid_typography_tailwind_v4_2026-02-03_8ac4.md](../research/utopia_core_fluid_typography_tailwind_v4_2026-02-03_8ac4.md):

> **Verdict: SKIP Utopia Core**
> 1. Manual clamp() is sufficient for single-breakpoint design (375px → 768px)
> 2. Zero dependencies, zero bundle impact
> 3. Full Tailwind v4 native support
> 4. Team doesn't need modular scale complexity

### Why -val Suffix Pattern

From the color token system architecture:

```css
/* Pattern: -val suffix for overridable values */
--font-size-h1-val: clamp(...);  /* The actual value */
--font-size-h1: var(--font-size-h1-val);  /* The reference */
```

This pattern enables future extensions like per-hotel typography customization via `useHotelTheme`. Note: `useHotelTheme` can set font CSS variable *values* but does NOT load font files — additional fonts must be pre-loaded in `layout.tsx` via `next/font/google` before they render (currently only Playfair Display + Inter are loaded).

---

## Troubleshooting

### Token Not Working

1. **Check import:** Ensure `typography-tokens.css` is imported in `globals.css`
2. **Check class name:** Use `text-size-h1`, not `text-h1` or `font-size-h1`
3. **Check Tailwind build:** Run `npm run build` to regenerate utilities

### Text Not Scaling

1. **Check viewport:** Scaling only happens between 375px-768px
2. **Check clamp() support:** All modern browsers support it (Chrome 79+)

### Wrong Size Displayed

1. **Verify token hierarchy:** display > h1 > h2 > h3 > body-large > body > caption > overline
2. **Check for conflicting classes:** Remove old `text-lg`, `text-xl`, etc.

---

## Version History

| Date | Change | Epic/Story |
|------|--------|------------|
| 2026-02-03 | Initial typography tokens system | Epic 15 / Stories 15.1-15.5 |
| 2026-02-03 | Full component migration | Post-Epic 15 cleanup |

---

## Related Documentation

- [Design Tokens Reference](../design-system/design-tokens.md) - Complete design system
- [Epic 15 Specification](../epics/epic-15.design-system_algorithmic-typography_ready_2026-02-03.md) - Implementation details
- [Storybook Typography Stories](../../web-app/stories/1-Design-System/Typography.stories.tsx) - Visual examples
