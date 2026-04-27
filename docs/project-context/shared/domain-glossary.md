---
type: project-context
domain: domain-glossary
language: shared
version: 1.0.0
updated: 2025-12-11
applies_to: [dev-react, all-agents]
project: et-llm-websites
---

# Domain Glossary - Hotel Website Generator

> **Purpose**: Define business terminology for the LLM-driven hotel website generation platform.
> All agents load this file to understand domain concepts.

## Core Concepts

### Website Generation
The process of automatically creating unique hotel websites using LLM-powered workflows.

| Term | Definition |
|------|------------|
| **Generation** | Single execution of the full workflow to produce one hotel website |
| **Generation ID** | UUID identifying a specific website generation run |
| **Budget** | Maximum cost allowed per generation (~$2/site target) |
| **Workflow** | LangGraph state machine orchestrating multi-agent generation |

### Component System

| Term | Definition |
|------|------------|
| **Primitive** | Base Shadcn/ui component (Button, Card, Input) |
| **Block** | Hotel-specific component built from primitives (RoomCard, AmenityBadge) |
| **Section** | Page region composed of blocks (HeroSection, RoomGallery) |
| **Page** | Complete website page composed of sections |

### 4-Tier Hierarchy
```
Primitives → Blocks → Sections → Pages
```

### Multi-Page Generation (Epics 24-25)

| Term | Definition |
|------|------------|
| **WebsiteConfig** | Top-level configuration wrapping `HomepageConfig` with a `pages` field that holds component arrays for each of the 9 page types |
| **Page Types** | The 9 supported pages: homepage, rooms, roomDetail, gallery, amenities, reviews, contact, about, faq |
| **splitToPages()** | Function (`lib/generation/split-to-pages.ts`) that distributes homepage components across multiple page types to produce per-page component arrays |
| **multiplyContent()** | Function (`lib/generation/multiply-content.ts`) that deterministically expands component content using the seed bank — zero LLM cost |
| **Content Seed Bank** | Deterministic library of content variations (`lib/generation/seed-bank.ts`) used by `multiplyContent()` to expand pages without LLM calls |
| **Page Distribution** | The process of mapping homepage sections to their target pages via `splitToPages()`, e.g., `RoomsSection` maps to the rooms page |
| **i18n Routing** | Multi-page routing under `app/[lang]/` (Epic 24) replacing the former `app/(site)/` layout; old routes are redirect stubs |

---

## Hotel Domain

### Hotel Types
| Type | Description | Target Market |
|------|-------------|---------------|
| **boutique** | Small, unique, design-focused | Couples, design enthusiasts |
| **resort** | Large, amenity-rich, destination | Families, leisure travelers |
| **business** | Urban, meeting-focused | Corporate travelers |
| **budget** | Affordable, essential amenities | Backpackers, budget travelers |
| **luxury** | Premium, exclusive services | High-end travelers |

### Guest Personas
| Persona | Characteristics | Priorities |
|---------|-----------------|------------|
| **leisure** | Vacation, relaxation | Amenities, location, aesthetics |
| **business** | Work travel | WiFi, workspace, efficiency |
| **family** | Traveling with children | Safety, space, activities |
| **couples** | Romantic getaway | Privacy, dining, ambiance |
| **adventure** | Activity-focused | Tours, equipment, guides |

### Room Types
| Type | Description |
|------|-------------|
| **standard** | Basic room with essential amenities |
| **deluxe** | Enhanced room with premium features |
| **suite** | Multi-room accommodation |
| **family** | Larger room for families |
| **accessible** | ADA-compliant room |

---

## LLM Orchestration

### Agents
| Agent | Role | Input | Output |
|-------|------|-------|--------|
| **InputAnalyzer** | Parse hotel data, identify characteristics | Raw hotel JSON | HotelProfile |
| **ComponentSelector** | Choose appropriate components | HotelProfile | ComponentList |
| **StylingAgent** | Generate Tailwind styles, color schemes | HotelProfile + Components | StyleConfig |
| **TranslationAgent** | Localize content via DeepL | Content + Languages | TranslatedContent |
| **AssemblyAgent** | Compose final React components | All outputs | ReactComponents |
| **QualityValidator** | Verify accessibility, performance | Assembled site | ValidationReport |
| **DeploymentAgent** | Deploy to CloudFlare | Validated site | DeploymentURL |

### Workflow States
| State | Description |
|-------|-------------|
| **initialized** | Workflow created, not started |
| **analyzing** | InputAnalyzer processing |
| **selecting** | ComponentSelector running |
| **styling** | StylingAgent generating |
| **translating** | TranslationAgent localizing |
| **assembling** | AssemblyAgent composing |
| **validating** | QualityValidator checking |
| **deploying** | DeploymentAgent publishing |
| **completed** | Successfully finished |
| **failed** | Error occurred |

---

## Cost Management

### Budget Tracking
| Metric | Description | Target |
|--------|-------------|--------|
| **totalCost** | Accumulated LLM API cost | < $2.00 |
| **tokenUsage** | Input + output tokens consumed | Varies |
| **modelCost** | Per-model breakdown | Tracked |

### Cost Control
- **LangFuse**: Observability platform tracking all LLM calls
- **Budget Enforcement**: Workflow halts if budget exceeded
- **Model Selection**: Choose optimal model for each agent task

---

## External Services

### APIs
| Service | Purpose | Rate Limits |
|---------|---------|-------------|
| **OpenRouter** | LLM API gateway | Per-key limits |
| **DeepL** | Translation API | 500k chars/month |
| **Effective Tours** | Hotel data source | Custom agreement |
| **BackBlaze B2** | Image storage | Unlimited |
| **CloudFlare** | CDN and deployment | Per-plan limits |

### Data Sources
| Source | Data Type |
|--------|-----------|
| **Directus CMS** | Hotel metadata, configurations |
| **Effective Tours API** | Hotel details, images, pricing |

---

## File Naming Conventions

### Images
| Format | Usage | Example |
|--------|-------|---------|
| `.webp` | Desktop images | `hero.webp` |
| `.m.webp` | Mobile images | `hero.m.webp` |

### Components
| Type | Convention | Example |
|------|------------|---------|
| Primitive | PascalCase | `Button.tsx` |
| Block | PascalCase + Block | `RoomCardBlock.tsx` |
| Section | PascalCase + Section | `HeroSection.tsx` |
| Page | lowercase-route | `index.tsx` |

---

## Color System

### Color System

| Term | Definition |
|------|-----------|
| OKLCH | Perceptually uniform color space used for all color definitions. Format: `oklch(L C H)` where L=lightness (0-1), C=chroma (0-0.4), H=hue (0-360) |
| Base Color | One of 2 required (primary, secondary) or 3 optional (accent, success, warning) OKLCH colors that seed the palette generator |
| Shade Scale | Auto-generated set of 13 lightness variants (50, 100, 200...900, 950) for each base color, produced by sine-wave chroma modulation |
| Semantic Token | CSS custom property with functional name (e.g., `--surface-default`, `--text-primary`) mapped from shade scale values |
| Palette Generation | Process of creating full shade scales + semantic tokens from 2-5 base OKLCH colors via the `culori` library |
| APCA Contrast | Advanced Perceptual Contrast Algorithm used for WCAG-compliant contrast validation between text and background colors |
| culori | JavaScript color library used for OKLCH parsing, palette generation, and color-space conversions |

---

## Responsive Design

### Breakpoint
| Name | Width | Usage |
|------|-------|-------|
| **mobile** | < 768px | Default styles (mobile-first) |
| **desktop** | ≥ 768px | `md:` Tailwind prefix |

### Strategy
- **Simple components**: Responsive Tailwind utilities
- **Complex components**: Separate mobile/desktop variants
- **Images**: Different files for mobile (`.m.webp`) and desktop (`.webp`)
