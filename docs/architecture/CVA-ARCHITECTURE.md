# CVA Architecture Documentation

> **Story:** 7.12 - Style System Polishing & Consistency Enforcement
> **Version:** 1.0
> **Last Updated:** 2026-01-14

## Overview

This document defines the CVA (Class Variance Authority) architecture used for component styling in the hotel website generator. All visual variants are centrally defined in `/web-app/lib/cva-variants.ts` and consumed by components via semantic design tokens.

---

## Variant Naming Conventions

### `variant` - Component Display Mode
Controls **how** the component is displayed structurally.

**Values:** `detailed`, `compact`, `grid`, `featured`, `carousel`

**Used by:** RoomCard, Testimonials, Amenities

```tsx
// Example: RoomCard display modes
<RoomCard variant="detailed" />  // Full card with all details
<RoomCard variant="compact" />   // Condensed card
<RoomCard variant="grid" />      // Grid-optimized layout
```

### `style` - Visual Theme
Controls the **visual appearance** of the component.

**Values:** `modern`, `classic`, `minimal`, `bold`, `elegant`

**Used by:** Hero, ContactForm, Navigation

```tsx
// Example: Hero visual themes
<HeroSection variant={{ style: 'modern' }} />   // Gradient background
<HeroSection variant={{ style: 'classic' }} />  // Gold accent
<HeroSection variant={{ style: 'minimal' }} />  // Clean white
```

### `layout` - Structural Arrangement
Controls the **positioning** of content within the component.

**Values:** `centered`, `split`, `fullscreen`, `grid`, `list`

**Used by:** Hero, Gallery, Testimonials, Amenities, Navigation

```tsx
// Example: Hero content layout
<HeroSection variant={{ layout: 'centered' }} />    // Centered content
<HeroSection variant={{ layout: 'split' }} />       // Side-by-side
<HeroSection variant={{ layout: 'fullscreen' }} />  // Full viewport
```

### `cardStyle` - Child Element Styling
Controls the appearance of **nested child elements** (cards within galleries, testimonials, amenities).

**Values:** `default`, `minimal`, `flat`, `elevated`

**Used by:** Gallery, Testimonials, Amenities

```tsx
// Example: Gallery card appearance
<ImageGallery variant={{ cardStyle: 'elevated' }} />  // Shadow + border
<ImageGallery variant={{ cardStyle: 'minimal' }} />   // No shadow
<ImageGallery variant={{ cardStyle: 'flat' }} />      // Border only
```

---

## Variant Propagation Patterns

### Parent Applies vs Child Receives

**Rule:** If the variant affects the **container**, apply at parent level. If it affects **children**, use child selectors.

```tsx
// CORRECT: Parent applies layout
export const galleryVariants = cva({
  variants: {
    layout: {
      grid: "grid",           // Applied to container
      carousel: "flex"        // Applied to container
    }
  }
});

// CORRECT: Parent controls children via child selectors
export const galleryVariants = cva({
  variants: {
    cardStyle: {
      elevated: "[&_figure]:shadow-xl"   // Child selector syntax
    }
  }
});
```

### Child Selector Syntax

Use Tailwind's `[&_.child-class]` syntax for targeting nested elements:

```tsx
export const testimonialsVariants = cva({
  variants: {
    cardStyle: {
      // Applies to elements with class="testimonial-card"
      elevated: "[&_.testimonial-card]:bg-surface-elevated [&_.testimonial-card]:shadow-card"
    }
  }
});
```

---

## Storybook Integration

### Viewing Variants in Storybook

All CVA variants are documented and explorable in Storybook:

```bash
cd web-app
npm run storybook
```

Open http://localhost:6006 to view:
- **1-Design-System/**: Color palette, typography, spacing tokens
- **2-Components/**: All homepage components with variant controls

### Story Organization

Stories follow the CVA variant structure:

```
stories/2-Components/HeroSection/
└── HeroSection.stories.tsx
    ├── ModernCentered       # style=modern, layout=centered
    ├── ClassicSplit         # style=classic, layout=split
    ├── MinimalDarkOverlay   # style=minimal, overlay=dark
    └── Mobile               # Responsive variant
```

### Variant Controls

Each story exposes CVA variant props through Storybook controls:

```typescript
// HeroSection.stories.tsx
export default {
  argTypes: {
    variant: {
      control: 'object',
      description: 'CVA variant props (style, layout, overlay, height)',
    },
  },
};
```

### Adding New Variants

When adding a new CVA variant:

1. Add to `web-app/lib/cva-variants.ts`
2. Create corresponding story in `stories/2-Components/`
3. Add Storybook controls for the variant
4. Run Chromatic to capture visual baseline

### Chromatic Visual Regression

All variant changes are tracked via Chromatic:
- PRs automatically capture visual snapshots
- Changes must be approved in Chromatic UI
- Baselines update on merge to main

---

## Contract-CVA Synchronization Process

### AC1.3: Automated Sync

The CVA validator in `/web-app/app/langgraph/utils/cva-validator.ts` automatically extracts variants from `cva-variants.ts` at build time.

### Sync Workflow

1. **Add variant to CVA definition:**
   ```tsx
   // cva-variants.ts
   export const heroVariants = cva({
     variants: {
       style: {
         newStyle: "bg-surface-primary"  // Add new variant
       }
     }
   });
   ```

2. **Update contract schema:**
   ```tsx
   // hero.contract.ts
   export const HeroContract = z.object({
     variant: z.object({
       style: z.enum(['modern', 'classic', 'minimal', 'newStyle'])  // Add here
     })
   });
   ```

3. **Run validation script:**
   ```bash
   npm run validate:cva-sync
   ```

---

## Forbidden Patterns

### ❌ NEVER Create One-Off className Fixes

```tsx
// WRONG
<Button className="w-full px-4 py-2 border-2 border-brand-primary">

// CORRECT - Use CVA variant
<Button className={roomCardButtonVariants({ variant: 'outline' })}>
```

### ❌ NEVER Use Inline Styles (Except scrollBehavior)

```tsx
// WRONG
<div style={{ backgroundColor: '#1e3a5f' }}>

// CORRECT - Use semantic tokens
<div className="bg-brand-primary">

// EXCEPTION: scrollBehavior (until utility class added)
<div style={{ scrollBehavior: 'smooth' }}>
```

### ❌ NEVER Use Hardcoded Status Colors

```tsx
// WRONG
<div className="bg-red-50 border border-red-200">

// CORRECT - Use semantic status tokens
<div className="bg-status-error/faint border border-status-error/subtle">
```

---

## Correct vs Incorrect Patterns

| Pattern | ❌ Incorrect | ✅ Correct |
|---------|-------------|------------|
| **Color** | `bg-blue-500`, `#1e3a5f` | `bg-brand-primary` |
| **Status** | `bg-red-50`, `text-green-600` | `bg-status-error/faint`, `text-status-success` |
| **Spacing** | `p-[17px]`, `m-[123px]` | `p-4`, `m-8` |
| **Buttons** | Custom className strings | `buttonVariants({ variant: 'outline' })` |
| **Shadows** | `shadow-[0_4px_6px]` | `shadow-card`, `shadow-lg` |

---

## Decision Tree: Adding New Variants

```
Is this a reusable visual pattern?
├─ YES → Add to cva-variants.ts
│   ├─ Does it affect container structure?
│   │   └─ YES → Use `layout` dimension
│   ├─ Is it a visual theme?
│   │   └─ YES → Use `style` dimension
│   └─ Does it affect nested elements?
│       └─ YES → Use `cardStyle` dimension with child selectors
└─ NO → Use inline className with semantic tokens
```

---

## Type Safety

All variant props are exported as TypeScript types:

```tsx
import type { HeroVariantProps, GalleryVariantProps } from '@/lib/cva-variants';

interface ComponentProps extends HeroVariantProps {
  // Your additional props
}
```

---

## Compound Variants

Use compound variants for conditional styling based on multiple variant values:

```tsx
export const heroVariants = cva({
  variants: { /* ... */ },
  compoundVariants: [
    {
      // When height is fullscreen AND layout is centered
      height: 'fullscreen',
      layout: 'centered',
      class: 'py-20'  // Add extra padding
    }
  ]
});
```

---

## Testing CVA Variants

```tsx
import { roomCardButtonVariants } from '@/lib/cva-variants';

describe('roomCardButtonVariants', () => {
  it('applies outline variant correctly', () => {
    const classes = roomCardButtonVariants({ variant: 'outline' });
    expect(classes).toContain('border-brand-primary/subtle');
    expect(classes).not.toContain('bg-brand-primary');
  });

  it('applies primary variant correctly', () => {
    const classes = roomCardButtonVariants({ variant: 'primary' });
    expect(classes).toContain('bg-brand-primary');
    expect(classes).toContain('text-on-brand');
  });
});
```

---

## Related Files

| File | Purpose |
|------|---------|
| `/web-app/lib/cva-variants.ts` | CVA definitions (source of truth) |
| `/web-app/lib/contracts/*.ts` | ZOD contracts for validation |
| `/web-app/app/langgraph/utils/cva-validator.ts` | Runtime variant validation |
| `/web-app/app/globals.css` | Semantic design tokens |
| `/docs/stories/1.11.story.md` | Design system story |
| `/docs/stories/2.2.story.md` | CVA + ZOD implementation story |

---

---

## Variant Validation (Story 12.5)

### Automated Validation Scripts

Two validation scripts ensure CVA variant consistency:

#### 1. CVA Token Validation (`scripts/validate-cva-tokens.sh`)

Validates that all CVA variants use semantic design tokens instead of hardcoded colors.

**Run manually:**
```bash
./scripts/validate-cva-tokens.sh
# or
npm run validate:cva-tokens
```

**Forbidden patterns:**
- `bg-[color]-[shade]` (e.g., bg-blue-500)
- `text-white`, `text-black`
- `border-[color]-[shade]`
- Hex colors (#fff, #000000)
- Arbitrary values ([#hex], [12px])
- RGB/HSL functions

**Required patterns:**
- `brand-primary`, `brand-secondary`
- `surface-*` tokens
- `text-*` semantic tokens

#### 2. Contract-CVA Sync Validation (`web-app/scripts/validate-contract-cva-sync.ts`)

Validates that contract schema enum values match CVA variant definitions.

**Run manually:**
```bash
cd web-app
npx tsx scripts/validate-contract-cva-sync.ts
# or
npm run validate:contract-sync
```

**What it checks:**
- Contract enum values exist in CVA variants
- CVA variants have corresponding contract coverage
- Component name mapping (e.g., room.contract.ts → roomCardVariants)

**Issue severity:**
- **Critical:** Contract references non-existent CVA variant (breaks runtime)
- **Warning:** CVA variant not in contract (intentionally restrictive is OK)

### CI/CD Integration

Both validation scripts run automatically on:
- Pull requests to `main` branch
- Push to `main` or `Epic-*` branches
- When `cva-variants.ts` or `contracts/*.contract.ts` files change

See `.github/workflows/validate-cva.yml` for workflow details.

### When to Run Validation

Run `npm run validate:all` before:
1. Adding new CVA variants
2. Modifying contract schemas
3. Creating new component contracts
4. Before every PR that touches styling

### Fixing Validation Errors

**CVA Token Error:**
```
❌ FORBIDDEN: Found hardcoded color pattern 'bg-blue-500' in cva-variants.ts
```
Fix: Replace with semantic token (e.g., `bg-brand-primary`)

**Contract Sync Error:**
```
❌ Missing in CVA: ultrawide
   (Contract references non-existent variant!)
```
Fix: Either add `ultrawide` to CVA variants or remove from contract schema

---

*Generated for Story 7.12 - Style System Polishing*
*Updated for Story 12.5 - Variant Consistency Validation*
