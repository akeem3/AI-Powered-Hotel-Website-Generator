# Component Inventory

> **Version:** 1.0
> **Last Updated:** 2026-03-06
> **Audience:** Developers, AI Agents
> **Scope:** Complete list of all renderable components, their variants, and contracts.

---

## Overview

The system has **12 component types** registered in `COMPONENT_MAP` (`web-app/components/renderers/componentMap.ts`). Components are organized into blocks (reusable units) and sections (full-width page regions).

For architecture patterns (router, contracts, CVA), see [Component Architecture](./component-architecture.md). For the full generation-to-rendering pipeline, see [End-to-End Architecture](./end-to-end-architecture.md).

---

## Blocks (7 components)

Blocks are composed, reusable UI units in `web-app/components/blocks/`.

### Navigation

| | |
|---|---|
| **Type** | `navigation` |
| **Path** | `@/components/blocks/Navigation` |
| **Contract** | `navigation.contract.ts` |
| **Structural variants** | No (single component) |
| **CVA dimensions** | `style`: transparent, solid, glass / `layout`: classic, compact, extended |
| **Required props** | `hotelName`, `navigationLinks[]` |
| **Render order** | Always first (order 0) |

### RoomCard

| | |
|---|---|
| **Type** | Part of `rooms` section (not standalone in config) |
| **Path** | `@/components/blocks/RoomCard/` |
| **Contract** | `room.contract.ts` |
| **Structural variants** | Yes — RoomCardDetailed, RoomCardCompact, RoomCardGrid |
| **CVA dimensions** | `variant`: detailed, compact, grid / `imageHeight`: default, tall, wide |

### ImageGallery

| | |
|---|---|
| **Type** | `gallery` |
| **Path** | `@/components/blocks/ImageGallery/` |
| **Contract** | `gallery.contract.ts` |
| **Structural variants** | Yes — GalleryGrid, GalleryMasonry, GalleryCarousel |
| **CVA dimensions** | `layout`: grid, masonry, carousel / `spacing`: tight, normal, loose / `aspectRatio`: square, landscape, portrait / `columns`: 2, 3, 4 / `cardStyle`: default, minimal, flat, elevated |

### Testimonials

| | |
|---|---|
| **Type** | `testimonials` |
| **Path** | `@/components/blocks/Testimonials/` |
| **Contract** | `testimonials.contract.ts` |
| **Structural variants** | No |
| **CVA dimensions** | `layout`: carousel, grid, featured / `columns`: 2, 3 / `cardStyle`: default, minimal, elevated |

### Amenities

| | |
|---|---|
| **Type** | `amenities` |
| **Path** | `@/components/blocks/Amenities/` |
| **Contract** | `amenities.contract.ts` |
| **Structural variants** | No |
| **CVA dimensions** | `layout`: grid, list, featured / `columns`: 2, 3, 4 / `iconSize`: small, medium, large / `iconStyle`: default, muted, colored / `cardStyle`: default, minimal, elevated |

### BookingWidget

| | |
|---|---|
| **Type** | `booking` |
| **Path** | `@/components/blocks/BookingWidget/` |
| **Contract** | `booking.contract.ts` |
| **Structural variants** | No |
| **CVA dimensions** | `variant`: desktop, mobile / `theme`: light, dark, glass |
| **Render order** | Late (conversion-focused) |

### Footer *(Epic 19)*

| | |
|---|---|
| **Type** | `footer` |
| **Path** | `@/components/blocks/Footer/` |
| **Contract** | `footer.contract.ts` |
| **Structural variants** | Yes (router pattern) |
| **Sub-components** | FooterClassic (multi-column), FooterMinimal (single row), FooterStacked (vertical sections + newsletter) |
| **CVA dimensions** | `layout`: classic, minimal, stacked |
| **Required props** | `hotelName` |
| **Optional props** | `address`, `phone`, `email`, `socialLinks[]`, `navigationLinks[]`, `newsletter` |
| **Social platforms** | facebook, instagram, twitter, tripadvisor, google, linkedin |
| **Render order** | Always last |
| **Notes** | FooterStacked is a Client Component (`'use client'`) for newsletter form interactivity |

---

## Sections (5 components)

Sections are full-width page regions in `web-app/components/sections/`.

### HeroSection

| | |
|---|---|
| **Type** | `hero` |
| **Path** | `@/components/sections/HeroSection/` |
| **Contract** | `hero.contract.ts` |
| **Structural variants** | Yes (router pattern) |
| **Sub-components** | HeroCentered, HeroSplit, HeroMinimal |
| **CVA dimensions** | `style`: modern, classic, minimal, bold, elegant / `layout`: centered, split, minimal / `overlay`: none, light, dark, gradient / `height`: small, medium, large, fullscreen |
| **Render order** | Always second (order 1) |

### RoomsGrid

| | |
|---|---|
| **Type** | `rooms` |
| **Path** | `@/components/sections/RoomsGrid/` |
| **Contract** | `room.contract.ts` (for individual rooms) |
| **Structural variants** | No (delegates to RoomCard variants) |
| **CVA dimensions** | `variant`: detailed, compact, grid / `imageHeight`: default, tall, wide |

### ContactForm

| | |
|---|---|
| **Type** | `contact` |
| **Path** | `@/components/sections/ContactForm/` |
| **Contract** | `contact.contract.ts` |
| **Structural variants** | No |
| **CVA dimensions** | `style`: default, minimal, floating / `background`: none, brand, muted |

### About *(Epic 19)*

| | |
|---|---|
| **Type** | `about` |
| **Path** | `@/components/sections/About/` |
| **Contract** | `about.contract.ts` |
| **Structural variants** | Yes (router pattern) |
| **Sub-components** | AboutSideBySide (two-column), AboutTimeline (vertical milestones), AboutFullWidth (background image overlay) |
| **CVA dimensions** | `layout`: side-by-side, timeline, full-width / `imagePosition`: left, right / `overlay`: none, light, dark, gradient / `textAlign`: left, center |
| **Required props** | `heading`, `content` |
| **Optional props** | `image`, `highlights[]` (max 4, each with `label` + `value`) |
| **Recommended for** | Luxury, boutique, resort hotels |
| **Render order** | Early (order 2-3, brand storytelling) |

### FAQ *(Epic 19)*

| | |
|---|---|
| **Type** | `faq` |
| **Path** | `@/components/sections/FAQ/` |
| **Contract** | `faq.contract.ts` |
| **Structural variants** | Yes (router pattern) |
| **Sub-components** | FAQAccordion (expandable/collapsible), FAQGrid (all visible, two-column) |
| **CVA dimensions** | `layout`: accordion, grid |
| **Required props** | `heading`, `questions[]` (min 3, max 15, each with `question` + `answer`) |
| **Recommended for** | Business, budget hotels |
| **Render order** | Late (order 5-7, before footer) |
| **Notes** | FAQAccordion is a Client Component (`'use client'`) for toggle interactivity |

### Features *(Epic 19)*

| | |
|---|---|
| **Type** | `features` |
| **Path** | `@/components/sections/Features/` |
| **Contract** | `features.contract.ts` |
| **Structural variants** | Yes (router pattern) |
| **Sub-components** | FeaturesIconGrid (compact icon grid), FeaturesCards (larger cards with images) |
| **CVA dimensions** | `layout`: icon-grid, cards / `columns`: 2, 3, 4 |
| **Required props** | `heading`, `features[]` (min 2, max 8, each with `title` + `description`) |
| **Optional props** | Per feature: `icon`, `image` |
| **Recommended for** | All hotel types |
| **Render order** | Mid-page (order 4-6) |

---

## Component Selection by Hotel Type

The ComponentSelector agent uses these recommendations:

| Component | Luxury | Boutique | Resort | Business | Budget |
|-----------|--------|----------|--------|----------|--------|
| navigation | Required | Required | Required | Required | Required |
| hero | Required | Required | Required | Required | Required |
| footer | Required | Required | Required | Required | Required |
| rooms | Required | Required | Required | Required | Required |
| booking | Required | Required | Required | Required | Required |
| about | Recommended | Recommended | Recommended | - | - |
| features | Recommended | Recommended | Recommended | Recommended | Recommended |
| faq | Optional | Optional | - | Recommended | Recommended |
| gallery | Optional | Optional | Recommended | - | - |
| amenities | Optional | - | Recommended | Optional | - |
| testimonials | Recommended | Optional | Optional | Optional | Optional |
| contact | Optional | Optional | Optional | Optional | Optional |

---

## File Structure Summary

```
web-app/
├── components/
│   ├── renderers/
│   │   └── componentMap.ts          # COMPONENT_MAP (type → React component)
│   ├── blocks/
│   │   ├── Navigation/
│   │   ├── RoomCard/                # RoomCardDetailed, RoomCardCompact, RoomCardGrid
│   │   ├── ImageGallery/            # GalleryGrid, GalleryMasonry, GalleryCarousel
│   │   ├── Testimonials/
│   │   ├── Amenities/
│   │   ├── BookingWidget/
│   │   └── Footer/                  # FooterClassic, FooterMinimal, FooterStacked (Epic 19)
│   └── sections/
│       ├── HeroSection/             # HeroCentered, HeroSplit, HeroMinimal
│       ├── RoomsGrid/
│       ├── ContactForm/
│       ├── About/                   # AboutSideBySide, AboutTimeline, AboutFullWidth (Epic 19)
│       ├── FAQ/                     # FAQAccordion, FAQGrid (Epic 19)
│       └── Features/               # FeaturesIconGrid, FeaturesCards (Epic 19)
├── lib/
│   ├── contracts/                   # Zod contracts per component
│   ├── cva-variants.ts             # CVA Tailwind class mappings
│   ├── propsTransformation.ts      # Security: prop whitelisting
│   └── contractValidation.ts       # Validation modes (WARNING/STRICT)
└── app/langgraph/
    ├── agents/schemas.ts            # HomepageConfigSchema (pipeline validation)
    └── utils/cva-validator.ts       # CVA variant validation registry
```

---

## Related Documentation

- [Component Architecture](./component-architecture.md) — Router pattern, contracts, CVA system
- [End-to-End Architecture](./end-to-end-architecture.md) — Full pipeline overview
- [Design System Quick Reference](./design-system-quick-ref.md) — Tokens, breakpoints, tiers
- [Component Documentation Guide](./component-documentation.md) — JSDoc, Storybook requirements
- [Coding Standards](./coding-standards.md) — Development conventions
