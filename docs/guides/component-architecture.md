# Component Architecture Guide

> **Version:** 1.0
> **Last Updated:** 2026-03-06
> **Audience:** Developers, AI Agents
> **Scope:** How components are structured, validated, and rendered.

---

## Overview

This guide covers the architectural patterns that govern how React components work in the hotel website generator. For a list of all components, see [Component Inventory](./component-inventory.md). For the full pipeline context, see [End-to-End Architecture](./end-to-end-architecture.md).

---

## 4-Tier Component System

Components are organized into four tiers of increasing complexity:

| Tier | Role | Example | Location |
|------|------|---------|----------|
| **Primitives** | Atomic UI elements | Button, Input | `web-app/components/primitives/` |
| **Blocks** | Composed, reusable units | Navigation, Footer, RoomCard | `web-app/components/blocks/` |
| **Sections** | Full-width page regions | HeroSection, About, FAQ | `web-app/components/sections/` |
| **Pages** | Complete page layouts | HomePage | `web-app/app/` |

For quick reference on tiers and tokens, see [Design System Quick Reference](./design-system-quick-ref.md).

---

## Component Registration

Every renderable component must be registered in `COMPONENT_MAP`:

```
web-app/components/renderers/componentMap.ts
```

This file maps the `type` string from `HomepageConfig` to the actual React component. When adding a new component type, you must:

1. Create the component in the appropriate tier directory
2. Add the import and mapping entry in `componentMap.ts`
3. Add the type to the `ComponentType` union
4. Register allowed props in `web-app/lib/propsTransformation.ts`

---

## Router Pattern

Components with **structurally distinct variants** use the router pattern. Instead of conditionally rendering different layouts inside one component, a router component delegates to specialized sub-components based on `variant.layout`.

### How It Works

```
HomepageConfig → COMPONENT_MAP["footer"] → Footer (router)
                                              ├── layout="classic"  → FooterClassic
                                              ├── layout="minimal"  → FooterMinimal
                                              └── layout="stacked"  → FooterStacked
```

### Router Implementation

Every router follows the same structure:

```typescript
// web-app/components/blocks/Footer/index.tsx (router)

import FooterClassic from './FooterClassic';
import FooterMinimal from './FooterMinimal';
import FooterStacked from './FooterStacked';

export default function Footer(rawProps: FooterProps) {
  // 1. Validate props against Zod contract
  const props = validateInDev(FooterContract, rawProps, 'Footer');

  // 2. Resolve layout with fallback to default
  const layout = resolveLayout(props.variant?.layout); // defaults to 'classic'

  // 3. Delegate to sub-component
  switch (layout) {
    case 'minimal':  return <FooterMinimal {...props} />;
    case 'stacked':  return <FooterStacked {...props} />;
    default:         return <FooterClassic {...props} />;
  }
}
```

### Key Characteristics

- **Router = Server Component** — no `'use client'` directive
- **Sub-components can be either** — Server (SEO-friendly) or Client (`'use client'` for interactivity like accordion toggles)
- **Unknown layout values fall back** to the default without errors
- **All sub-components accept the same props interface** (the contract type)

### Components Using Router Pattern

| Component | Router | Sub-components | Default |
|-----------|--------|---------------|---------|
| Hero | `HeroSection` | HeroCentered, HeroSplit, HeroMinimal | centered |
| Footer | `Footer` | FooterClassic, FooterMinimal, FooterStacked | classic |
| About | `About` | AboutSideBySide, AboutTimeline, AboutFullWidth | side-by-side |
| FAQ | `FAQ` | FAQAccordion, FAQGrid | accordion |
| Features | `Features` | FeaturesIconGrid, FeaturesCards | icon-grid |
| ImageGallery | `ImageGallery` | GalleryGrid, GalleryMasonry, GalleryCarousel | grid |

---

## Contract Validation

Every component has a **Zod contract** that defines the shape of its props. Contracts serve as the interface specification between the LLM generation pipeline and React components.

### Contract Files

All contracts live in `web-app/lib/contracts/` and follow the naming pattern `{component}.contract.ts`:

```
web-app/lib/contracts/
├── footer.contract.ts      # FooterContract, FooterConfig type
├── about.contract.ts       # AboutContract, AboutConfig type
├── faq.contract.ts         # FAQContract, FAQConfig type
├── features.contract.ts    # FeaturesContract, FeaturesConfig type
├── hero.contract.ts        # HeroContract
├── navigation.contract.ts  # NavigationContract
├── room.contract.ts        # RoomContract
├── ...
└── index.ts                # Re-exports all contracts
```

### Contract Structure

Each contract exports a Zod schema and a TypeScript type:

```typescript
// web-app/lib/contracts/footer.contract.ts

export const FooterContract = z.object({
  hotelName: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().max(100).optional(),
  socialLinks: z.array(z.object({
    platform: socialPlatformEnum,  // facebook | instagram | twitter | ...
    url: z.string().min(1).max(500)
  })).optional(),
  variant: z.object({
    layout: z.enum(['classic', 'minimal', 'stacked']).optional()
  }).optional(),
  // ...
});

export type FooterConfig = z.infer<typeof FooterContract>;
```

### Validation Modes

Validation runs via `validateInDev()` (components) or `validateContract()` (preview route):

| Mode | Behavior | When Used |
|------|----------|-----------|
| **WARNING** | Logs violations to console, continues rendering | Development, early generations |
| **STRICT** | Throws on violation, blocks rendering | Production, preview route, mature pipelines |

Source: `web-app/lib/contractValidation.ts`

### Pipeline-Level Validation

The LangGraph pipeline also validates using Zod schemas at agent boundaries:

- `HomepageConfigSchema` in `web-app/app/langgraph/agents/schemas.ts` — validates the complete config
- `CVAValidator` in `web-app/app/langgraph/utils/cva-validator.ts` — validates variant values against registered CVA dimensions

---

## CVA Variant System

**Class Variance Authority (CVA)** manages visual styling through variant dimensions. Each component type has registered variant dimensions with allowed values.

### How Variants Flow

```
StylingAgent (LLM) → assigns variant values (e.g., footerLayout: "classic")
         ↓
AssemblyAgent → maps to component variant (e.g., variant: { layout: "classic" })
         ↓
CVAValidator → checks value exists in VALID_VARIANTS registry
         ↓
React Component → applies CVA classes based on variant
```

### Variant Registry

Valid variant values are defined in two places:

1. **CVA definitions**: `web-app/lib/cva-variants.ts` — Tailwind class mappings
2. **CVAValidator**: `web-app/app/langgraph/utils/cva-validator.ts` — validation registry

The CVAValidator also handles **field name mapping** from StylingAgent naming to CVA dimension naming:

```
StylingAgent output       →  CVA dimension
─────────────────────────────────────────
footerLayout              →  footer.layout
aboutLayout               →  about.layout
aboutImagePosition        →  about.imagePosition
faqLayout                 →  faq.layout
featuresLayout            →  features.layout
featuresColumns           →  features.columns
```

For the complete list of variant dimensions and values, see [Design System Quick Reference — CVA Variants](./design-system-quick-ref.md#cva-variants).

---

## Props Security

Props pass through two security layers before reaching components. This is handled automatically by the preview route and `ComponentRenderer`.

### 1. Props Transformation (`transformProps`)

- **Whitelist enforcement** — Only keys listed in `ALLOWED_PROP_KEYS[componentType]` are passed through
- **Prototype pollution blocking** — Keys like `__proto__`, `constructor` are rejected
- **URL validation** — All URL-like values checked against `javascript:` injection
- **Field mapping** — Some fields are renamed for backward compatibility (e.g., Hero: `heading` → `title`)

### 2. Variant Filtering (`filterSafeVariant`)

- Strips dangerous keys from variant objects
- Ensures only string/number/boolean values pass through

Source: `web-app/lib/propsTransformation.ts`

When adding a new component, you **must** add its allowed prop keys to `ALLOWED_PROP_KEYS` in this file.

---

## Adding a New Component

Checklist for adding a new component type to the system:

1. **Create the component** in the appropriate tier directory (`blocks/` or `sections/`)
2. **Create a Zod contract** in `web-app/lib/contracts/{name}.contract.ts`
3. **If using router pattern**: Create sub-components and a router `index.tsx`
4. **Register in `componentMap.ts`** — Add import and mapping entry
5. **Add allowed props** in `web-app/lib/propsTransformation.ts` → `ALLOWED_PROP_KEYS`
6. **Register CVA variants** in:
   - `web-app/lib/cva-variants.ts` — Tailwind class mappings
   - `web-app/app/langgraph/utils/cva-validator.ts` → `VALID_VARIANTS` and `FIELD_MAPPINGS`
7. **Update LangGraph schemas** in `web-app/app/langgraph/agents/schemas.ts`
8. **Update Langfuse prompts** — All 4 agent prompts need awareness of the new component
9. **Write tests** — Contract validation, rendering, variant switching
10. **Update [Component Inventory](./component-inventory.md)**

For coding standards and conventions, see [Coding Standards](./coding-standards.md). For component documentation requirements, see [Component Documentation Guide](./component-documentation.md).

---

## Related Documentation

- [End-to-End Architecture](./end-to-end-architecture.md) — Full pipeline overview
- [Component Inventory](./component-inventory.md) — All 12 components with variants
- [Design System Quick Reference](./design-system-quick-ref.md) — Tokens, CVA values, tiers
- [Coding Standards](./coding-standards.md) — TypeScript, React, Tailwind conventions
- [Component Documentation Guide](./component-documentation.md) — JSDoc, Storybook, README standards
- [API Reference](./api-reference.md) — LangGraph agent schemas
