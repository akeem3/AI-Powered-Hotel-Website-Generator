# Style System Architecture

> **Project:** LLM-Driven Hotel Website Generator
> **Version:** 1.0.0
> **Last Updated:** 2026-01-28
> **Purpose:** Definitive reference for style system implementation, patterns, and guidelines

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Design Tokens (The DNA)](#2-design-tokens-the-dna)
3. [Tailwind Configuration (The Skeleton)](#3-tailwind-configuration-the-skeleton)
4. [CVA Variant System (The Muscle)](#4-cva-variant-system-the-muscle)
5. [ZOD Contract System (The Immune System)](#5-zod-contract-system-the-immune-system)
6. [4-Tier Component Architecture](#6-4-tier-component-architecture)
7. [Style Propagation Flow](#7-style-propagation-flow)
8. [Theme Customization & LLM Integration](#8-theme-customization--llm-integration)
9. [Anti-Patterns & Forbidden Practices](#9-anti-patterns--forbidden-practices)
10. [File Reference Index](#10-file-reference-index)
11. [Cross-References](#11-cross-references)

---

## 1. Architecture Overview

### The Two-Layer Style Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 1: DNA (CSS Variables + Token Registration)               │
│ File: web-app/app/globals.css                                   │
│ Purpose: Single source of truth for all color tokens            │
│                                                                 │
│  @theme inline { --color-brand-primary: var(--brand-primary-val); }  │
│  @layer theme {                                                 │
│    :root { --brand-primary-val: oklch(0.346 0.074 256); }       │
│    [data-mode='dark'] { --brand-primary-val: oklch(0.55 0.10 256); } │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ LAYER 2: BODY (Components)                                      │
│ Files: web-app/components/**/*.tsx                              │
│ Purpose: Consume tokens via className                           │
│ Example: className="bg-brand-primary text-on-brand"            │
└─────────────────────────────────────────────────────────────────┘
```

> **Note:** `tailwind.config.js` no longer defines colors. Tailwind v4 auto-generates
> utility classes from `@theme inline` in globals.css. The config only extends
> non-color properties (fonts, spacing, shadows, etc.).

### Why This Architecture?

**Business Model Dependency:** The $2/site generation cost depends entirely on this architecture. The LLM (StylingAgent) customizes websites by modifying CSS variables only—it cannot touch component code. If components use hardcoded colors, per-site customization becomes impossible.

**Key Principle:** Changes flow DOWN only. Modify the DNA (CSS variables), and all components automatically update.

---

## 2. Design Tokens (The DNA)

### File: `/web-app/app/globals.css`

Design tokens use OKLCH color format with `@theme inline` for Tailwind v4 integration.

The architecture has three sections in globals.css:

1. **`@theme inline { }`** — Registers Tailwind utility tokens pointing to CSS vars
2. **`@layer theme { :root { } }`** — Provides default OKLCH values (overridden by palette generator)
3. **`@layer theme { [data-mode='dark'] { } }`** — Provides default dark mode overrides

### Dynamic Palette Generation

**All color tokens are algorithmically generated** from 2-5 base OKLCH colors provided by hotels.

The `useHotelTheme` hook generates and applies approximately 100+ CSS variables at runtime:

- 11-step shade scales (50-950) for each base color
- Semantic tokens (text, surface, border, status)
- Dark mode variants
- Hover states (derived via `color-mix()`)

The `globals.css :root` values serve as **defaults** when no hotel theme is applied, ensuring development/testing environments work correctly.

### Token Categories

#### Brand Colors (Generated from Base Colors)

```css
/* Generated from hotel-provided brandPrimary and brandSecondary */
@layer theme {
  :root {
    --brand-primary-val: oklch(0.346 0.074 256); /* Default: Deep navy */
    --brand-secondary-val: oklch(0.748 0.099 86.1); /* Default: Gold accent */
    --brand-primary-hover-val: color-mix(
      in oklch,
      var(--brand-primary-val),
      black 20%
    );
    --brand-secondary-hover-val: color-mix(
      in oklch,
      var(--brand-secondary-val),
      black 15%
    );
  }
}
```

#### Surface Colors (Generated from Primary Shade Scale)

```css
/* Derived from primary-50, primary-100, etc. */
@layer theme {
  :root {
    --surface-default-val: oklch(1 0 0); /* Default: White */
    --surface-primary-val: oklch(1 0 0); /* Default: Primary background */
    --surface-elevated-val: oklch(
      0.984 0.003 247.9
    ); /* Default: Cards, modals */
    --surface-muted-val: oklch(
      0.968 0.007 247.9
    ); /* Default: Subtle backgrounds */
    --surface-secondary-val: oklch(
      0.968 0.007 247.9
    ); /* Default: Secondary areas */
  }
}
```

#### Text Colors (Generated with Contrast Validation)

```css
/* Derived from primary shade scale with APCA contrast checks */
@layer theme {
  :root {
    --text-primary-val: oklch(0.208 0.04 265.8); /* Default: Main text */
    --text-secondary-val: oklch(
      0.554 0.041 257.4
    ); /* Default: Secondary text */
    --text-muted-val: oklch(0.711 0.035 256.8); /* Default: Subtle text */
    --text-inverted-val: oklch(
      0.984 0.003 247.9
    ); /* Default: Text on dark backgrounds */
  }
}
```

#### Interactive States (Aliases)

```css
/* Aliases to brand-secondary tokens */
@layer theme {
  :root {
    --interactive-primary-val: var(--brand-secondary-val);
    --interactive-primary-hover-val: var(--brand-secondary-hover-val);
  }
}
```

#### Status Colors (Generated or Defaulted)

```css
/* Generated from optional statusSuccess, statusError inputs or sensible defaults */
@layer theme {
  :root {
    --status-success-val: oklch(0.448 0.108 151.3);
    --status-warning-val: oklch(0.795 0.162 86);
    --status-error-val: oklch(0.577 0.215 27.3);
    --status-info-val: oklch(0.588 0.139 242);
  }
}
```

#### Shadows

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-card: var(--shadow-md);
  --shadow-card-hover: var(--shadow-lg);
}
```

#### Border Radius

```css
:root {
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
}
```

#### Typography

```css
:root {
  --font-display: "Playfair Display", serif;
  --font-body: "Inter", system-ui, sans-serif;
  --font-mono: "Fira Code", monospace;
}
```

### Dark Mode (Generated Automatically)

Dark mode colors are algorithmically derived from base colors by the palette generator:

```css
@layer theme {
  [data-theme="dark"],
  [data-mode="dark"] {
    /* Generated from primary shade scale (800-950) with low chroma */
    --surface-default-val: oklch(0.145 0 0);
    --surface-primary-val: oklch(0.145 0 0);
    --surface-elevated-val: oklch(0.168 0 0);

    /* Generated as high-lightness achromatic */
    --text-primary-val: oklch(0.985 0 0);
    --text-secondary-val: oklch(0.715 0 0);

    /* Lightened brand colors (L=0.55-0.78) for visibility on dark backgrounds */
    --brand-primary-val: oklch(0.55 0.1 256);
  }
}
```

**Generation rules:**

- **Surfaces:** Shade scale steps 800-950 with low chroma (near-neutral but slightly tinted)
- **Text:** High lightness achromatic (L: 0.55-0.99, C: 0)
- **Brand:** Lightened by shifting to L=0.55-0.78 range
- **Status:** Brightened by shifting to L=0.65-0.85 range

### OKLCH Format Rationale

Using OKLCH (CSS Color Level 4) for all color tokens:

- **Perceptually uniform**: Equal numeric steps = equal perceived change
- **Better color-mix()**: Mixing in OKLCH produces natural intermediates
- **Wider gamut**: Supports Display P3 and future wide-gamut displays
- **Algorithmic generation**: Predictable shade scales from any base hue

Opacity modifiers work natively via Tailwind v4's `color-mix(in oklab)`:

```tsx
className = "bg-brand-primary/50"; // → 50% opacity via color-mix
className = "bg-brand-primary/wash"; // → 10% opacity via semantic scale
```

### Semantic Opacity Scale

Defined in `tailwind.config.js`:

```javascript
opacity: {
  'faint': '0.05',   // Barely visible
  'wash': '0.1',     // Light tint
  'subtle': '0.2',   // Subtle overlay
  'soft': '0.3',     // Soft version
  'mid': '0.5',      // Half opacity
  'high': '0.8',     // Mostly visible
  'strong': '0.9',   // Very visible
  'glass': '0.95',   // Glass effect
}
```

---

## 3. Tailwind Configuration

### File: `/web-app/tailwind.config.js`

> **Important:** Colors are NO LONGER defined in tailwind.config.js.
> Tailwind v4 auto-generates utility classes from `@theme inline` in globals.css.
> This config only extends non-color properties (fonts, spacing, shadows, etc.).

### Token Registration Pattern (in globals.css)

```css
/* @theme inline registers tokens — Tailwind auto-generates utility classes */
@theme inline {
  --color-brand-primary: var(--brand-primary-val);
  --color-brand-secondary: var(--brand-secondary-val);
  --color-surface-primary: var(--surface-primary-val);
  --color-text-primary: var(--text-primary-val);
  /* ... etc */
}
```

This generates `bg-brand-primary`, `text-text-primary`, `border-surface-primary`, etc.
Opacity modifiers like `bg-brand-primary/50` work automatically via Tailwind v4's
native `color-mix(in oklab, color, transparent)` — no `<alpha-value>` wrappers needed.

### Font Configuration

```javascript
fontFamily: {
  display: ['var(--font-display)', 'serif'],
  body: ['var(--font-body)', 'sans-serif'],
  mono: ['var(--font-mono)', 'monospace'],
}
```

### Fluid Typography Scale

```javascript
fontSize: {
  'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.4vw, 1rem)',
  'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
  'fluid-lg': 'clamp(1.125rem, 1rem + 0.6vw, 1.5rem)',
  'fluid-xl': 'clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)',
  'fluid-2xl': 'clamp(2.25rem, 1.8rem + 2.25vw, 3.75rem)',
}
```

### Semantic Spacing

```javascript
spacing: {
  section: 'clamp(2rem, 0.0915rem + 8.143vw, 4rem)',     // Fluid: 32px→64px (375px→768px)
  container: 'clamp(1rem, 0.0459rem + 4.071vw, 2rem)',   // Fluid: 16px→32px (375px→768px)
}
```

**Note:** These formulas use the `base + coefficient * vw` pattern for proper fluid scaling across the mobile-to-tablet range (375px-768px).

### Breakpoints

```javascript
screens: {
  sm: '375px',   // Mobile
  md: '768px',   // Tablet
  lg: '1280px',  // Desktop
  xl: '1440px',  // Large desktop
}
```

---

## 4. CVA Variant System (The Muscle)

### File: `/web-app/lib/cva-variants.ts`

CVA (Class Variance Authority) provides type-safe, composable variant definitions.

### CVA Pattern

```typescript
import { cva, type VariantProps } from "class-variance-authority";

export const componentVariants = cva("base-classes-always-applied", {
  variants: {
    dimension1: { option1: "classes", option2: "classes" },
    dimension2: { optionA: "classes", optionB: "classes" },
  },
  compoundVariants: [
    { dimension1: "option1", dimension2: "optionA", class: "special-combo" },
  ],
  defaultVariants: {
    dimension1: "option1",
    dimension2: "optionA",
  },
});

export type ComponentVariantProps = VariantProps<typeof componentVariants>;
```

### Complete CVA Inventory

#### Hero Section (`heroVariants`)

| Dimension | Options                                 | Purpose             |
| --------- | --------------------------------------- | ------------------- |
| `style`   | modern, classic, minimal, bold, elegant | Visual theme        |
| `layout`  | centered, split, minimal                | Content arrangement |
| `overlay` | none, light, dark, gradient             | Image overlay       |
| `height`  | small, medium, large, fullscreen        | Vertical space      |

**Compound Variants:**

- `minimal + dark/gradient` → `text-text-primary`
- `centered + fullscreen` → `py-20`

#### Gallery (`galleryVariants`)

| Dimension     | Options                          | Purpose           |
| ------------- | -------------------------------- | ----------------- |
| `layout`      | grid, masonry, carousel          | Display pattern   |
| `spacing`     | tight, normal, loose             | Gap between items |
| `aspectRatio` | square, landscape, portrait      | Image aspect      |
| `columns`     | 2, 3, 4                          | Grid columns      |
| `cardStyle`   | default, minimal, flat, elevated | Card styling      |

#### Navigation (`navigationVariants`)

| Dimension | Options                   | Purpose          |
| --------- | ------------------------- | ---------------- |
| `style`   | transparent, solid, glass | Background style |
| `layout`  | default, compact, tall    | Size/padding     |

#### Room Card (`roomCardVariants`)

| Dimension | Options                 | Purpose            |
| --------- | ----------------------- | ------------------ |
| `variant` | detailed, compact, grid | Display complexity |

#### Room Card Image (`roomCardImageVariants`)

| Dimension | Options             | Purpose      |
| --------- | ------------------- | ------------ |
| `height`  | default, tall, wide | Aspect ratio |

#### Booking Widget (`bookingWidgetVariants`)

| Dimension | Options            | Purpose      |
| --------- | ------------------ | ------------ |
| `variant` | desktop, mobile    | Form layout  |
| `theme`   | light, dark, glass | Color scheme |

#### Contact Form (`contactFormVariants`)

| Dimension    | Options                    | Purpose          |
| ------------ | -------------------------- | ---------------- |
| `style`      | default, minimal, floating | Form style       |
| `background` | none, brand, muted         | Background color |

#### Testimonials (`testimonialsVariants`)

| Dimension   | Options                    | Purpose         |
| ----------- | -------------------------- | --------------- |
| `layout`    | carousel, grid, featured   | Display pattern |
| `columns`   | 2, 3                       | Grid columns    |
| `cardStyle` | default, minimal, elevated | Card styling    |

#### Amenities (`amenitiesVariants`)

| Dimension   | Options                    | Purpose         |
| ----------- | -------------------------- | --------------- |
| `layout`    | grid, list, featured       | Display pattern |
| `columns`   | 2, 3, 4                    | Grid columns    |
| `iconSize`  | small, medium, large       | Icon dimensions |
| `iconStyle` | default, muted, colored    | Icon color      |
| `cardStyle` | default, minimal, elevated | Card styling    |

### Variant Naming Conventions

| Term        | Meaning                | Example                     |
| ----------- | ---------------------- | --------------------------- |
| `variant`   | Component display mode | detailed, compact, grid     |
| `style`     | Visual theme           | modern, classic, elegant    |
| `layout`    | Structural arrangement | centered, split, fullscreen |
| `cardStyle` | Child element styling  | default, minimal, elevated  |
| `theme`     | Color scheme           | light, dark, glass          |

### Using CVA in Components

```typescript
import { heroVariants, type HeroVariantProps } from '@/lib/cva-variants';
import { cn } from '@/lib/utils';

interface HeroProps extends HeroVariantProps {
  title: string;
  className?: string;
}

export function Hero({ style, layout, overlay, height, title, className }: HeroProps) {
  return (
    <section className={cn(heroVariants({ style, layout, overlay, height }), className)}>
      <h1>{title}</h1>
    </section>
  );
}
```

### Child Selectors Pattern

CVA uses Tailwind child selectors for nested element styling:

```typescript
cardStyle: {
  default: "[&_.card]:bg-surface-primary [&_.card]:shadow-card",
  elevated: "[&_.card]:bg-surface-elevated [&_.card]:shadow-lg",
}
```

**Usage:** Add `.card` class to child elements:

```tsx
<div className={cn(galleryVariants({ cardStyle: "elevated" }))}>
  <article className="card">
    {" "}
    {/* Gets elevated styles */}
    ...
  </article>
</div>
```

---

## 5. ZOD Contract System (The Immune System)

### Directory: `/web-app/lib/contracts/`

ZOD schemas validate component props at runtime, preventing invalid LLM outputs.

### Contract Registry

```typescript
// web-app/lib/contracts/index.ts
export const ComponentContractRegistry = {
  heroSection: HeroSectionContract,
  navigation: NavigationContract,
  roomCard: RoomCardFlatSchema,
  imageGallery: ImageGalleryContract,
  testimonials: TestimonialsContract,
  amenities: AmenitiesContract,
  bookingWidget: BookingWidgetContract,
  contactForm: ContactFormContract,
};
```

### Contract Pattern

```typescript
export const HeroSectionContract = z
  .object({
    variant: z
      .object({
        style: z
          .enum(["modern", "classic", "minimal", "bold", "elegant"])
          .optional(),
        layout: z.enum(["centered", "split", "minimal"]).optional(),
        overlay: z.enum(["none", "light", "dark", "gradient"]).optional(),
        height: z.enum(["small", "medium", "large", "fullscreen"]).optional(),
      })
      .optional(),
    title: z.string().min(1).max(100),
    headline: z.string().min(1).max(200),
    tagline: z.string().max(200).optional(),
    primaryCTA: ctaSchema.optional(),
    image: z.string().optional(),
    className: z.string().optional(),
  })
  .strict(); // Rejects unexpected properties
```

### Key Validation Patterns

#### Enum Constraints (Prevents Free-Form Styles)

```typescript
style: z.enum(["modern", "classic", "minimal"]); // Only these values allowed
```

#### Length Constraints

```typescript
title: z.string().min(1).max(100);
description: z.string().max(500).optional();
```

#### Array Constraints

```typescript
images: z.array(ImageSchema).min(3).max(20);
testimonials: z.array(TestimonialSchema).min(1).max(10);
```

#### URL Validation (XSS Prevention)

```typescript
// web-app/lib/urlValidation.ts
export const safeUrlSchema = z.string().refine((url) => isValidSafeUrl(url), {
  message: "URL must start with http://, https://, or /",
});

// Rejects: javascript:, data:, vbscript:
```

#### Strict Mode

```typescript
.strict()  // Rejects any properties not defined in schema
```

### Progressive Enforcement

```typescript
// web-app/lib/contractValidation.ts
export type EnforcementLevel = "WARNING" | "STRICT";

// WARNING: Logs violations, continues rendering
// STRICT: Throws error, stops rendering
```

### Using Contracts in Components

```typescript
import { validateInDev } from "@/lib/contracts/validate.dev";
import { ImageGalleryContract } from "@/lib/contracts";

export function ImageGallery(rawProps: unknown) {
  // Validates props, logs warnings in dev, returns validated data
  const props = validateInDev(ImageGalleryContract, rawProps, "ImageGallery");

  // Safe to use props.variant, props.images, etc.
}
```

---

## 6. 4-Tier Component Architecture

### Tier Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ TIER 4: PAGES                                                   │
│ Location: web-app/app/                                          │
│ Example: page.tsx, rooms/page.tsx                              │
│ Purpose: Compose sections into full pages                       │
└─────────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│ TIER 3: SECTIONS                                                │
│ Location: web-app/components/sections/                          │
│ Example: HeroSection, ContactForm                               │
│ Purpose: Page regions that compose blocks                       │
└─────────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│ TIER 2: BLOCKS                                                  │
│ Location: web-app/components/blocks/                            │
│ Example: RoomCard, Navigation, ImageGallery                    │
│ Purpose: Hotel-specific building blocks                         │
└─────────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│ TIER 1: PRIMITIVES                                              │
│ Location: web-app/components/ui/                                │
│ Example: Button, Card, Input (shadcn/ui)                       │
│ Purpose: Base UI components with CVA variants                   │
└─────────────────────────────────────────────────────────────────┘
```

### Components by Tier

**Tier 1 (Primitives):**

- `Button`, `Card`, `Input`, `Select`, `Label`, `Form`
- Source: shadcn/ui with custom CVA variants

**Tier 2 (Blocks):**

- `Navigation`, `RoomCard`, `BookingWidget`, `ImageGallery`
- `Testimonials`, `Amenities`, `AmenityCard`, `TestimonialCard`

**Tier 3 (Sections):**

- `HeroSection`, `RoomsGrid`, `ContactForm`
- `GallerySection`, `AmenitiesSection`, `TestimonialsSection`

**Tier 4 (Pages):**

- `Homepage`, `Rooms`, `Contact`, `Gallery`, `Amenities`

---

## 7. Style Propagation Flow

### Config → Component Pipeline

```
LLM Generated Config (JSON)
        ↓
[HomepageConfigSchema Validation] ← STRICT mode
        ↓
[ComponentRenderer.tsx]
        ↓ Maps type string to React component
[transformProps()]
        ↓ Transforms config fields, validates URLs
[filterSafeVariant()]
        ↓ Sanitizes variant object
[Component receives props]
        ↓
[CVA generates className]
        ↓
[cn() merges classes]
        ↓
[Tailwind resolves utilities]
        ↓
[CSS variables applied]
        ↓
[Rendered DOM]
```

### The `cn()` Utility

```typescript
// web-app/lib/utils/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Purpose:**

1. `clsx()` - Removes false/null values, concatenates strings
2. `twMerge()` - Resolves Tailwind class conflicts (last wins)

**Example:**

```typescript
cn(
  heroVariants({ style: "modern" }), // "bg-brand-primary text-on-brand"
  "py-8", // Added
  className, // Override (highest priority)
);
```

### Variant Propagation Patterns

#### Pattern 1: Direct Application

Parent component applies variant directly, no propagation to children.

```typescript
// HeroSection applies variant to self
<section className={cn(heroVariants(variant), className)}>
```

#### Pattern 2: Routing by Variant

Parent routes to sub-component based on variant value.

```typescript
// ImageGallery routes based on layout
switch (variant.layout) {
  case 'grid': return <GalleryGrid {...props} />;
  case 'masonry': return <GalleryMasonry {...props} />;
  case 'carousel': return <GalleryCarousel {...props} />;
}
```

#### Pattern 3: Props Spreading

Parent passes variant props to children.

```typescript
// Amenities passes variant values to AmenitiesGrid
<AmenitiesGrid
  columns={variant.columns}
  iconSize={variant.iconSize}
  cardStyle={variant.cardStyle}
/>
```

#### Pattern 4: Child Selectors

Parent applies classes that style children via CSS selectors.

```typescript
// CVA variant
elevated: "[&_.amenity-card]:bg-surface-elevated"

// Child component
<article className="amenity-card">  {/* Styled by parent */}
```

---

## 8. Theme Customization & LLM Integration

### Runtime Theme Application with Palette Generation

```typescript
// web-app/lib/hooks/useHotelTheme.ts
export function useHotelTheme(hotelId: string, theme: HotelTheme) {
  useEffect(() => {
    // Generate full palette from 2-5 base colors
    const generatedTheme = generateFullTheme(theme.colors);
    const cssVars = mapShadesToCssVariables(generatedTheme);

    const root = document.documentElement;

    // Apply all generated color variables (~100+ CSS variables)
    Object.entries(cssVars).forEach(([varName, value]) => {
      root.style.setProperty(varName, value);
    });

    // Apply typography
    root.style.setProperty("--font-display", theme.typography.displayFont);
    root.style.setProperty("--font-body", theme.typography.bodyFont);

    // Set theme identifier
    root.setAttribute("data-theme", `hotel-${hotelId}`);
  }, [hotelId, theme]);
}
```

**What gets generated:**

- 11-step shade scales for each base color (e.g., `--primary-50-val` through `--primary-950-val`)
- All semantic tokens (`--text-primary-val`, `--surface-elevated-val`, etc.)
- Dark mode variants
- Hover states
- Status colors (if not provided, sensible defaults)

### Theme Schema

```typescript
// web-app/lib/validation/theme-schema.ts
const oklchRegex = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;

export const HotelThemeSchema = z.object({
  colors: z.object({
    brandPrimary: z.string().regex(oklchRegex, "Must be OKLCH format"),
    brandSecondary: z.string().regex(oklchRegex, "Must be OKLCH format"),
    brandAccent: z.string().regex(oklchRegex).optional(),
    statusSuccess: z.string().regex(oklchRegex).optional(),
    statusError: z.string().regex(oklchRegex).optional(),
  }),
  typography: z.object({
    displayFont: z.string().min(1),
    bodyFont: z.string().min(1),
  }),
});
```

**Input contract:**

- **Required:** `brandPrimary` and `brandSecondary` (2 colors minimum)
- **Optional:** `brandAccent`, `statusSuccess`, `statusError` (up to 5 colors total)
- **Format:** OKLCH only (e.g., `"oklch(0.55 0.12 230)"`)
- **Generated automatically:** All other tokens derived from these base colors

### LangGraph StylingAgent Integration

The StylingAgent (Epic 7) generates variant selections:

```json
{
  "componentVariants": {
    "hero": {
      "style": "elegant",
      "layout": "split",
      "overlay": "gradient",
      "height": "large"
    },
    "gallery": {
      "layout": "masonry",
      "spacing": "normal",
      "aspectRatio": "landscape"
    }
  }
}
```

**Validation Flow:**

1. StylingAgent output → `StylingAgentOutputSchema.parse()`
2. Validated variants → `CVAValidator.validateOutput()`
3. CVA validator checks against `VALID_VARIANTS` registry
4. Invalid variants flagged before rendering

### CVA Validator

```typescript
// web-app/app/langgraph/utils/cva-validator.ts
export class CVAValidator {
  private static readonly VALID_VARIANTS = {
    hero: {
      style: ["modern", "classic", "minimal", "bold", "elegant"],
      layout: ["centered", "split", "minimal"],
      overlay: ["none", "light", "dark", "gradient"],
      height: ["small", "medium", "large", "fullscreen"],
    },
    // ... other components
  };

  static validateOutput(variants: Record<string, unknown>): ValidationResult {
    // Checks each variant value against VALID_VARIANTS
  }
}
```

---

## 9. Anti-Patterns & Forbidden Practices

### ❌ FORBIDDEN

#### Hardcoded Colors

```tsx
// WRONG
<div className="bg-blue-500 text-white">
<div className="bg-[#c9a961]">

// CORRECT
<div className="bg-brand-primary text-on-brand">
```

#### Inline Styles

```tsx
// WRONG
<div style={{ color: '#D4AF37', padding: '20px' }}>

// CORRECT
<div className="text-brand-secondary p-5">
```

#### Arbitrary Tailwind Values

```tsx
// WRONG
<h1 className="text-[2.5rem]">
<div className="p-[23px]">

// CORRECT
<h1 className="text-fluid-2xl">
<div className="p-6">
```

#### One-Off Custom Classes

```tsx
// WRONG - Creating a one-time fix
<Button className="hero-page-button-2px-left">

// CORRECT - Use or extend CVA variant
<Button className={roomCardButtonVariants({ variant: 'outline' })}>
```

#### Direct Color Numbers in CVA

```typescript
// WRONG
style: {
  modern: "bg-blue-600 text-white";
}

// CORRECT
style: {
  modern: "bg-brand-primary text-on-brand";
}
```

### ✅ REQUIRED PATTERNS

#### Always Use Semantic Tokens

```typescript
// Colors
bg-brand-primary, text-text-secondary, bg-surface-elevated

// Shadows
shadow-card, shadow-lg

// Borders
border-border-default, rounded-lg
```

#### Use `cn()` for Class Merging

```tsx
className={cn(componentVariants({ variant }), 'extra-class', className)}
```

#### Validate Props with ZOD

```tsx
const props = validateInDev(Contract, rawProps, "ComponentName");
```

#### Trace Bugs to Global Patterns

When fixing a style bug:

1. Identify which CVA variant or token is wrong
2. Fix the global definition, not the component
3. Verify fix propagates to all affected components

---

## 10. File Reference Index

### Core Configuration Files

| File                          | Purpose                            |
| ----------------------------- | ---------------------------------- |
| `web-app/app/globals.css`     | CSS variables, design tokens       |
| `web-app/tailwind.config.js`  | Tailwind extensions, token mapping |
| `web-app/lib/cva-variants.ts` | All CVA variant definitions        |
| `web-app/lib/utils/utils.ts`  | `cn()` utility                     |

### Contract Files

| File                                             | Purpose               |
| ------------------------------------------------ | --------------------- |
| `web-app/lib/contracts/index.ts`                 | Contract registry     |
| `web-app/lib/contracts/hero.contract.ts`         | Hero section schema   |
| `web-app/lib/contracts/gallery.contract.ts`      | Gallery schema        |
| `web-app/lib/contracts/amenities.contract.ts`    | Amenities schema      |
| `web-app/lib/contracts/testimonials.contract.ts` | Testimonials schema   |
| `web-app/lib/contracts/room.contract.ts`         | Room card schema      |
| `web-app/lib/contracts/booking.contract.ts`      | Booking widget schema |
| `web-app/lib/contracts/contact.contract.ts`      | Contact form schema   |
| `web-app/lib/contracts/navigation.contract.ts`   | Navigation schema     |

### Validation & Theming

| File                                           | Purpose                 |
| ---------------------------------------------- | ----------------------- |
| `web-app/lib/contractValidation.ts`            | Progressive enforcement |
| `web-app/lib/validation/theme-schema.ts`       | Theme validation        |
| `web-app/lib/hooks/useHotelTheme.ts`           | Runtime theme hook      |
| `web-app/lib/urlValidation.ts`                 | URL safety validation   |
| `web-app/app/langgraph/utils/cva-validator.ts` | LLM output validation   |

### Component Files

| File                                                       | Purpose           |
| ---------------------------------------------------------- | ----------------- |
| `web-app/components/sections/HeroSection/index.tsx`        | Hero section      |
| `web-app/components/blocks/ImageGallery/index.tsx`         | Gallery component |
| `web-app/components/blocks/Testimonials/index.tsx`         | Testimonials      |
| `web-app/components/blocks/Amenities/index.tsx`            | Amenities         |
| `web-app/components/blocks/RoomCard/index.tsx`             | Room cards        |
| `web-app/components/blocks/Navigation/index.tsx`           | Navigation        |
| `web-app/components/blocks/BookingWidget/index.tsx`        | Booking widget    |
| `web-app/components/sections/ContactForm/index.tsx`        | Contact form      |
| `web-app/components/renderers/ComponentRenderer/index.tsx` | Config renderer   |

### UI Primitives

| File                               | Purpose         |
| ---------------------------------- | --------------- |
| `web-app/components/ui/button.tsx` | Button with CVA |
| `web-app/components/ui/card.tsx`   | Card component  |
| `web-app/components/ui/input.tsx`  | Input component |
| `web-app/components/ui/label.tsx`  | Label component |

---

## 11. Cross-References

### Epics

| Epic                                                                         | Relevance                       |
| ---------------------------------------------------------------------------- | ------------------------------- |
| [Epic 1: Foundation Components](/docs/epics/epic-planning-roadmap.md#epic-1) | Established 4-tier architecture |
| [Epic 2: Foundation Validation](/docs/epics/epic-planning-roadmap.md#epic-2) | Validated CVA + ZOD patterns    |
| [Epic 7: LLM Generation](/docs/epics/epic-planning-roadmap.md#epic-7)        | StylingAgent uses this system   |

### Stories

| Story                                                                         | Relevance               |
| ----------------------------------------------------------------------------- | ----------------------- |
| [Story 1.11: Centralized Tailwind Design System](/docs/stories/1.11.story.md) | Established tokens      |
| [Story 2.2: CVA Variants + ZOD Schemas](/docs/stories/2.2.story.md)           | CVA implementation      |
| [Story 7.4: StylingAgent Implementation](/docs/stories/)                      | Uses this architecture  |
| [Story 7.12: Style System Polishing](/docs/stories/7.12.story.md)             | Fixes identified issues |

### Documentation

| Document                                                            | Relevance             |
| ------------------------------------------------------------------- | --------------------- |
| [PRD](/docs/prd.md)                                                 | Business requirements |
| [Architecture](/docs/architecture.md)                               | System architecture   |
| [Design Tokens](/docs/design-system/design-tokens.md)               | Token documentation   |
| [Coding Standards](/docs/project-context/react/coding-standards.md) | Style guidelines      |

### External References

| Resource                                                    | Purpose          |
| ----------------------------------------------------------- | ---------------- |
| [CVA Documentation](https://cva.style/docs)                 | CVA library docs |
| [ZOD Documentation](https://zod.dev)                        | ZOD library docs |
| [Tailwind Merge](https://github.com/dcastil/tailwind-merge) | Class merging    |
| [shadcn/ui](https://ui.shadcn.com)                          | Base components  |

---

## Appendix A: Quick Reference Card

### Token Cheat Sheet

```
COLORS:
bg-brand-primary        → Main brand color
bg-brand-secondary      → Accent color
bg-surface-primary      → Main background
bg-surface-elevated     → Cards, modals
text-text-primary       → Main text
text-text-secondary     → Secondary text
text-on-brand           → Text on brand colors

OPACITY:
/faint (5%)  /wash (10%)  /subtle (20%)  /mid (50%)  /high (80%)

TYPOGRAPHY:
font-display → Headings (Playfair Display)
font-body    → Body text (Inter)
text-fluid-* → Responsive sizes

SHADOWS:
shadow-card       → Default card shadow
shadow-card-hover → Hover state shadow
shadow-lg         → Large shadow

RADIUS:
rounded-sm   → 0.25rem
rounded-md   → 0.5rem
rounded-lg   → 0.75rem
rounded-full → Full circle
```

### CVA Quick Reference

```typescript
// Import
import { heroVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils';

// Use
<div className={cn(heroVariants({ style, layout }), className)}>

// Available variants
heroVariants: style, layout, overlay, height
galleryVariants: layout, spacing, aspectRatio, columns, cardStyle
navigationVariants: style, layout
roomCardVariants: variant
bookingWidgetVariants: variant, theme
contactFormVariants: style, background
testimonialsVariants: layout, columns, cardStyle
amenitiesVariants: layout, columns, iconSize, iconStyle, cardStyle
```

---

**Document Version:** 1.0.0
**Maintainer:** Architecture Team
**Review Cycle:** Every epic completion

---

_🤖 Generated with [Claude Code](https://claude.com/claude-code)_
