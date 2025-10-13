# Source Tree Structure: LLM-Driven Hotel Website Generator

> **Version:** 1.0  
> **Last Updated:** 2025-01-19  
> **Structure:** Monorepo with clear separation of concerns

## Overview

This document defines the complete source tree structure for the LLM-Driven Hotel Website Generator platform, including both the generation platform and the template structure for generated sites.

## Platform Repository Structure

```
et-frontend-llm/
├── README.md
├── package.json
├── .env.example
├── .env.local
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
│
├── .bmad-core/                    # BMAD2 core files
│   ├── core-config.yaml
│   ├── tasks/
│   ├── templates/
│   └── data/
│
├── docs/                          # BMAD2 documentation
│   ├── brief.md
│   ├── prd.md
│   ├── architecture.md
│   ├── prd/                       # Sharded PRD documents
│   ├── architecture/              # Sharded architecture docs
│   ├── qa/                        # QA documentation
│   └── stories/                   # User stories
│
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/                   # API routes
│   │   │   ├── generate/
│   │   │   ├── directus/
│   │   │   └── effective-tours/
│   │   └── dashboard/             # Generation dashboard
│   │
│   ├── components/                # Component library
│   │   ├── ui/                    # Primitive components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── modal.tsx
│   │   ├── blocks/                # Block components
│   │   │   ├── RoomCard.tsx
│   │   │   ├── TestimonialCard.tsx
│   │   │   └── FeatureList.tsx
│   │   ├── sections/              # Section components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── GallerySection.tsx
│   │   │   ├── RoomsSection.tsx
│   │   │   └── BookingSection.tsx
│   │   └── layouts/               # Page layouts
│   │       ├── MainLayout.tsx
│   │       └── BookingLayout.tsx
│   │
│   ├── lib/                       # Core utilities
│   │   ├── utils.ts
│   │   ├── langfuse.ts
│   │   ├── openrouter.ts
│   │   ├── directus.ts
│   │   ├── effective-tours.ts
│   │   └── storage.ts
│   │
│   ├── hooks/                     # React hooks
│   │   ├── useDirectus.ts
│   │   ├── useEffectiveTours.ts
│   │   └── useGeneration.ts
│   │
│   ├── types/                     # TypeScript types
│   │   ├── index.ts
│   │   ├── components.ts
│   │   ├── hotel.ts
│   │   └── api.ts
│   │
│   ├── langgraph/                 # LangGraph workflows
│   │   ├── agents/
│   │   │   ├── InputAnalyzer.ts
│   │   │   ├── ComponentSelector.ts
│   │   │   ├── StylingAgent.ts
│   │   │   ├── AssemblyAgent.ts
│   │   │   ├── QualityValidator.ts
│   │   │   └── DeploymentAgent.ts
│   │   ├── workflows/
│   │   │   ├── GenerationWorkflow.ts
│   │   │   └── ValidationWorkflow.ts
│   │   └── utils/
│   │       ├── prompts.ts
│   │       └── state-management.ts
│   │
│   ├── data/                      # Static data and configs
│   │   ├── components.json        # Component manifest
│   │   ├── wireframes.json        # Wireframe definitions
│   │   ├── design-tokens.json     # Design token library
│   │   └── prompts/               # LLM prompt templates
│   │       ├── component-selection.md
│   │       ├── styling-generation.md
│   │       └── quality-validation.md
│   │
│   └── tests/                     # Test files
│       ├── __mocks__/
│       ├── components/
│       ├── langgraph/
│       └── utils/
│
├── public/                        # Static assets
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── scripts/                       # Build and deployment scripts
│   ├── generate-site.ts
│   ├── deploy-to-cloudflare.ts
│   ├── validate-components.ts
│   └── sync-to-backblaze.ts
│
└── .ai/                          # AI development logs
    └── debug-log.md
```

## Generated Site Structure

```
generated-hotel-site/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── next.config.js
├── tailwind.config.ts              # LLM-generated custom config
├── tsconfig.json
│
├── src/
│   ├── app/
│   │   ├── globals.css             # LLM-generated custom styles
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Home page
│   │   ├── rooms/
│   │   │   ├── page.tsx            # Rooms listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx        # Individual room
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   └── booking/
│   │       └── page.tsx
│   │
│   ├── components/                 # Selected and assembled components
│   │   ├── ui/                     # Copied primitive components
│   │   ├── blocks/                 # Selected block components
│   │   ├── sections/               # Selected section components
│   │   └── hotel-specific/         # Generated custom components
│   │
│   ├── lib/                        # Essential utilities
│   │   ├── utils.ts
│   │   ├── directus.ts
│   │   ├── effective-tours.ts
│   │   └── hotel-config.ts         # Hotel-specific configuration
│   │
│   ├── hooks/                      # Required hooks
│   │   ├── useDirectus.ts
│   │   └── useEffectiveTours.ts
│   │
│   ├── types/                      # TypeScript types
│   │   ├── index.ts
│   │   └── hotel.ts
│   │
│   └── data/                       # Hotel-specific data
│       ├── hotel-info.json         # Basic hotel information
│       ├── rooms.json              # Room data structure
│       └── site-config.json        # Site configuration
│
├── public/                         # Static assets
│   ├── images/                     # Hotel-specific images
│   ├── icons/
│   └── favicon.ico                 # Custom favicon
│
└── docs/                          # Site documentation
    ├── README.md
    ├── deployment.md
    └── customization.md
```

## Component Library Structure

### Primitive Components (`src/components/ui/`)
```
ui/
├── button.tsx                     # Core button component
├── input.tsx                      # Form input component
├── card.tsx                       # Basic card layout
├── modal.tsx                      # Modal/dialog component
├── badge.tsx                      # Status badges
├── skeleton.tsx                   # Loading skeletons
└── index.ts                       # Export barrel
```

### Block Components (`src/components/blocks/`)
```
blocks/
├── RoomCard.tsx                   # Hotel room display card
├── TestimonialCard.tsx            # Customer review card
├── FeatureList.tsx                # Hotel amenities list
├── PricingTable.tsx               # Room pricing display
├── ContactCard.tsx                # Contact information
├── BookingWidget.tsx              # Booking form widget
└── index.ts                       # Export barrel
```

### Section Components (`src/components/sections/`)
```
sections/
├── HeroSection.tsx                # Main hero banner
├── GallerySection.tsx             # Image gallery
├── RoomsSection.tsx               # Rooms overview
├── ReviewsSection.tsx             # Customer testimonials
├── BookingSection.tsx             # Booking interface
├── ContactSection.tsx             # Contact information
├── AboutSection.tsx               # Hotel story/about
├── AmenitiesSection.tsx           # Hotel facilities
└── index.ts                       # Export barrel
```

## LangGraph Workflows Structure

### Agents (`src/langgraph/agents/`)
```
agents/
├── InputAnalyzer.ts               # Analyzes hotel parameters
├── ComponentSelector.ts           # Selects appropriate components
├── StylingAgent.ts                # Generates custom CSS
├── AssemblyAgent.ts               # Assembles pages
├── QualityValidator.ts            # Validates output quality
├── DeploymentAgent.ts             # Handles deployment
└── index.ts                       # Agent orchestration
```

### Workflows (`src/langgraph/workflows/`)
```
workflows/
├── GenerationWorkflow.ts          # Main generation workflow
├── ValidationWorkflow.ts          # Quality validation workflow
├── DeploymentWorkflow.ts          # Deployment workflow
└── index.ts                       # Workflow exports
```

## Data Structure

### Component Manifest (`src/data/components.json`)
```json
{
  "primitives": [
    {
      "name": "Button",
      "path": "ui/button.tsx",
      "props": { "variant": "string", "size": "string" },
      "tags": ["interactive", "form"],
      "variants": ["primary", "secondary", "outline"]
    }
  ],
  "blocks": [
    {
      "name": "RoomCard",
      "path": "blocks/RoomCard.tsx",
      "props": { "title": "string", "price": "number" },
      "tags": ["room", "booking", "card"],
      "variants": ["default", "compact", "featured"],
      "backendIntegration": "directus"
    }
  ],
  "sections": [
    {
      "name": "HeroSection",
      "path": "sections/HeroSection.tsx",
      "props": { "title": "string", "subtitle": "string" },
      "tags": ["hero", "landing", "banner"],
      "variants": ["centered", "left-aligned", "with-video"],
      "wireframes": ["home-1", "home-2", "home-3"]
    }
  ]
}
```

### Wireframe Definitions (`src/data/wireframes.json`)
```json
{
  "wireframes": {
    "home-1": {
      "name": "Classic Hotel Homepage",
      "sections": ["HeroSection", "RoomsSection", "AmenitiesSection", "ReviewsSection", "ContactSection"],
      "layout": "single-column",
      "tags": ["classic", "traditional", "business"]
    },
    "home-2": {
      "name": "Modern Resort Homepage",
      "sections": ["HeroSection", "GallerySection", "RoomsSection", "BookingSection"],
      "layout": "grid-layout",
      "tags": ["modern", "resort", "luxury"]
    }
  }
}
```

## File Naming Conventions

### Component Files
- **React Components:** PascalCase (`HeroSection.tsx`)
- **Utility Functions:** camelCase (`formatPrice.ts`)
- **Type Definitions:** PascalCase (`HotelTypes.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Directory Structure
- **Components:** PascalCase directories (`components/sections/`)
- **Utilities:** camelCase directories (`lib/utils/`)
- **Pages:** lowercase with hyphens (`app/book-now/`)

## Import/Export Patterns

### Barrel Exports
```typescript
// components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card } from './card';
export { Modal } from './modal';
```

### Component Imports
```typescript
// Preferred import pattern
import { Button, Input, Card } from '@/components/ui';
import { HeroSection, RoomsSection } from '@/components/sections';
import { cn } from '@/lib/utils';
```

## Build Output Structure

### Generated Site Build
```
out/                               # Next.js static export
├── _next/
│   ├── static/
│   └── chunks/
├── index.html                     # Home page
├── rooms/
│   ├── index.html
│   └── deluxe-suite/
│       └── index.html
├── gallery/
│   └── index.html
├── about/
│   └── index.html
├── contact/
│   └── index.html
└── booking/
    └── index.html
```

---

*This source tree structure supports scalable development, clear separation of concerns, and efficient LLM-based generation workflows.*