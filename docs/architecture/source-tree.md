# Source Tree Structure: LLM-Driven Hotel Website Generator

> **Status:** Production Ready ✅
> **Version:** 2.0
> **Last Updated:** 2026-03-31
> **Format:** Enhanced BMAD-Compatible Documentation
> **Structure:** Monorepo with clear separation of concerns

## PROJECT BOUNDARIES

### IN SCOPE:
- Complete platform source tree definition
- Component library structure and organization
- LangGraph workflow architecture
- Generated site template structure
- File naming and import/export conventions
- Build output structure

### OUT OF SCOPE:
- Individual component implementation details
- Database schema definitions
- CI/CD pipeline configurations
- Environment-specific deployment scripts

## Overview

This document defines the complete source tree structure for the LLM-Driven Hotel Website Generator platform, providing a comprehensive blueprint for both the generation platform and the template structure for generated sites. The structure is optimized for LLM-driven development with clear separation of concerns and standardized patterns.

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
│   ├── stories/                   # User stories
│   └── prompts/                   # LLM prompt templates
│
├── web-app/
│   ├── app/                       # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/                   # API routes
│   │   │   ├── generate/
│   │   │   ├── directus/
│   │   │   └── effective-tours/
│   │   ├── (site)/                # Legacy redirect stubs (→ /[lang]/)
│   │   ├── [lang]/                # i18n-ready multi-page routes (Epic 24)
│   │   │   ├── page.tsx           # Homepage
│   │   │   ├── rooms/
│   │   │   │   ├── page.tsx       # Rooms listing
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx   # Individual room detail
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── faq/
│   │   │   │   └── page.tsx
│   │   │   └── gallery/
│   │   │       └── page.tsx
│   │   ├── dashboard/             # Generation dashboard
│   │   └── langgraph/             # LangGraph workflows
│   │       ├── agents/
│   │       │   ├── InputAnalyzer.ts
│   │       │   ├── ComponentSelector.ts
│   │       │   ├── StylingAgent.ts
│   │       │   ├── AssemblyAgent.ts
│   │       │   ├── QualityValidator.ts
│   │       │   └── DeploymentAgent.ts
│   │       ├── workflows/
│   │       │   ├── GenerationWorkflow.ts
│   │       │   └── ValidationWorkflow.ts
│   │       └── utils/
│   │           ├── prompts.ts
│   │           └── state-management.ts
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
│   │   ├── directus.ts            # CMS: getHotelFull(), getRoomsPageData(), etc.
│   │   ├── effective-tours.ts
│   │   ├── storage.ts
│   │   └── generation/            # Multi-page config generation (Epic 25)
│   │       ├── split-to-pages.ts  # splitToPages() - distributes components across pages
│   │       ├── multiply-content.ts # multiplyContent() - expands content via seed bank
│   │       └── seed-bank.ts       # Deterministic content seed bank
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

### Primitive Components (`web-app/components/ui/`)
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

### Block Components (`web-app/components/blocks/`)
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

### Section Components (`web-app/components/sections/`)
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

### Agents (`web-app/app/langgraph/agents/`)
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

### Workflows (`web-app/app/langgraph/workflows/`)
```
workflows/
├── GenerationWorkflow.ts          # Main generation workflow
├── ValidationWorkflow.ts          # Quality validation workflow
├── DeploymentWorkflow.ts          # Deployment workflow
└── index.ts                       # Workflow exports
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