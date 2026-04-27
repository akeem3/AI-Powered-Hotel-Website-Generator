# End-to-End Architecture Guide

> **Version:** 1.0
> **Last Updated:** 2026-03-06
> **Audience:** Developers, AI Agents
> **Scope:** How hotel parameters become a rendered website — the complete data flow.

---

## Overview

This guide explains the full pipeline from user input to rendered website. It connects the generation pipeline, configuration format, and React rendering system into one cohesive picture.

For specific subsystems, see:
- [API Reference](./api-reference.md) — Agent API details, retry behavior, error handling
- [LLM Website Generation Manual](./llm-website-generation-manual.md) — CLI usage, build scripts, deployment
- [Component Architecture](./component-architecture.md) — Router pattern, contracts, CVA variants
- [Component Inventory](./component-inventory.md) — All 12 components with variants

---

## Pipeline Stages

```
Hotel Parameters ──> LangGraph Agents ──> HomepageConfig JSON ──> React Rendering ──> Website
     (input)           (generation)           (artifact)            (hydration)       (output)
```

### Stage 1: Hotel Parameters (Input)

The pipeline starts with 5 parameters describing the hotel:

```typescript
interface HotelParameters {
  hotelName: string;      // "The Grand Azure"
  hotelType: "luxury" | "budget" | "boutique" | "resort" | "business";
  targetAudience: "business" | "leisure" | "family" | "couples" | "backpackers";
  brandPersonality: "elegant" | "modern" | "friendly" | "professional" | "adventurous";
  location: string;       // "Maldives"
}
```

These parameters are provided via CLI or programmatically. See [Generation Manual, Section 3](./llm-website-generation-manual.md#3-website-generation) for CLI usage.

### Stage 2: LangGraph Multi-Agent Pipeline (Generation)

Five agents execute sequentially, each transforming the state:

```
ComponentSelector → StylingAgent → ContentGenerator → AssemblyAgent → QualityValidator
```

| Agent | Input | Output | Purpose |
|-------|-------|--------|---------|
| **ComponentSelector** | Hotel params | `selectedComponents[]` | Picks 5-12 component types |
| **StylingAgent** | Selected components | `stylingOutput{}` | Assigns CVA variants per component |
| **ContentGenerator** | Hotel params + components | `contentOutput{}` | Writes copy, generates content |
| **AssemblyAgent** | All above | `assembledConfig{}` | Merges into final HomepageConfig |
| **QualityValidator** | Assembled config | `validationStatus` | Validates against Zod schemas |

Each agent fetches its prompt from **Langfuse Cloud** (label: `production`) and calls the LLM. See [API Reference](./api-reference.md) for retry behavior and error handling.

**Key files:**
- Agent implementations: `web-app/app/langgraph/agents/`
- Workflow orchestrator: `web-app/app/langgraph/workflows/HomepageGenerationWorkflow.ts`
- Langfuse service: `web-app/app/langgraph/services/LangFuseService.ts`
- Output schemas: `web-app/app/langgraph/agents/schemas.ts`

### Stage 3: HomepageConfig JSON (Artifact)

The pipeline outputs a JSON configuration file — the single artifact that defines the entire website:

```json
{
  "generationId": "grand-azure-v1",
  "timestamp": "2026-03-06T10:00:00Z",
  "hotelParameters": { "hotelName": "The Grand Azure", "hotelType": "luxury", ... },
  "components": [
    {
      "type": "navigation",
      "variant": { "style": "transparent", "layout": "classic" },
      "props": { "hotelName": "The Grand Azure", "navigationLinks": [...] },
      "order": 0
    },
    {
      "type": "hero",
      "variant": { "style": "modern", "layout": "centered", "overlay": "gradient" },
      "props": { "title": "Welcome to Paradise", "tagline": "...", "image": "..." },
      "order": 1
    },
    {
      "type": "footer",
      "variant": { "layout": "classic" },
      "props": { "hotelName": "The Grand Azure", "socialLinks": [...] },
      "order": 11
    }
  ]
}
```

Each entry in `components[]` has:
- **`type`** — Maps to a React component via `COMPONENT_MAP` (see Stage 4)
- **`variant`** — CVA variant dimensions controlling visual style and structure
- **`props`** — Content data passed as React props
- **`order`** — Render order (navigation first, footer last)

The config is validated against `HomepageConfigSchema` (Zod). See [Component Architecture](./component-architecture.md) for contract details.

### Stage 4: React Rendering (Hydration)

The config is consumed by the rendering pipeline, which maps each component entry to a React component:

```
HomepageConfig.components[] → COMPONENT_MAP[type] → SectionRenderer → React Component
```

**Step 4a: Component Resolution**

`COMPONENT_MAP` in `web-app/components/renderers/componentMap.ts` maps type strings to React components:

```typescript
const COMPONENT_MAP: Record<ComponentType, ReactComponentType> = {
  navigation: Navigation,
  hero: HeroSection,
  rooms: RoomsGrid,
  // ... 12 total components
  footer: Footer,     // Router → FooterClassic | FooterMinimal | FooterStacked
  about: About,       // Router → AboutSideBySide | AboutTimeline | AboutFullWidth
  faq: FAQ,           // Router → FAQAccordion | FAQGrid
  features: Features, // Router → FeaturesIconGrid | FeaturesCards
};
```

See [Component Inventory](./component-inventory.md) for the full list.

**Step 4b: Security Filtering**

Before props reach components, two security layers apply:

1. **`transformProps(type, props)`** — Whitelists allowed prop keys per component type, blocks prototype pollution (`__proto__`, `constructor`), validates URLs against `javascript:` injection
2. **`filterSafeVariant(variant)`** — Strips dangerous keys from variant objects

Source: `web-app/lib/propsTransformation.ts`

**Step 4c: Section Rendering**

The preview page (`web-app/app/preview/page.tsx`) iterates components, sorts by `order`, and renders each through `SectionRenderer`:

```tsx
{config.components
  .sort((a, b) => a.order - b.order)
  .map((componentConfig) => {
    const Component = COMPONENT_MAP[componentConfig.type];
    const safeProps = transformProps(componentConfig.type, componentConfig.props);
    const safeVariant = filterSafeVariant(componentConfig.variant);

    return (
      <SectionRenderer
        config={{ type, variant: safeVariant, props: safeProps, order }}
        Component={Component}
      />
    );
  })}
```

**Step 4d: Router Components**

Components with structural variants (Footer, About, FAQ, Features, Hero, ImageGallery) use the **router pattern**: the top-level component inspects `variant.layout` and delegates to the appropriate sub-component. See [Component Architecture — Router Pattern](./component-architecture.md#router-pattern) for details.

### Stage 5: Website Output

Two output modes are available:

| Mode | Command | Output | Use Case |
|------|---------|--------|----------|
| **Dev Preview** | `npm run dev` → `/preview?config=name` | Live Next.js page | Development, verification |
| **Static Export** | `scripts/build-from-config.sh` | `dist/{hotel}/` static HTML | Production deployment |

See [Generation Manual, Sections 4-5](./llm-website-generation-manual.md#4-building-the-website) for build and deployment details.

---

## Quick Start: Generate and Preview

```bash
# 1. Set environment variables
export $(grep -v '^#' web-app/.env | grep '=' | xargs)

# 2. Generate a config
npx tsx --tsconfig web-app/tsconfig.json scripts/generate-homepage.ts \
  --name "Seaside Resort" --type "boutique" --audience "couples" \
  --personality "elegant" --location "Santorini, Greece"

# 3. Copy to fixtures
cp output/latest-homepage-config.json web-app/fixtures/configs/seaside-resort.json

# 4. Preview
cd web-app && npm run dev
# Open: http://localhost:3000/preview?config=seaside-resort
```

---

## Data Flow Diagram

```
                    Langfuse Cloud
                    (prompt storage)
                         |
                         v
 Hotel Params ──> [ComponentSelector] ──> selectedComponents
                  [StylingAgent]      ──> variant assignments
                  [ContentGenerator]  ──> content/copy
                  [AssemblyAgent]     ──> HomepageConfig JSON
                  [QualityValidator]  ──> validation pass/fail
                         |
                         v
               HomepageConfig JSON
              (output/latest-*.json)
                         |
            ┌────────────┼────────────┐
            v            v            v
      Dev Preview   Fixture Copy   Static Build
    (npm run dev)   (fixtures/)   (build-from-config.sh)
            |            |            |
            v            v            v
     localhost:3000   /preview?    dist/{hotel}/
                     config=name   index.html
```

---

## Related Documentation

- [API Reference](./api-reference.md) — Agent API, schemas, retry/timeout behavior
- [LLM Website Generation Manual](./llm-website-generation-manual.md) — CLI, build, deploy
- [Component Architecture](./component-architecture.md) — Router pattern, contracts, validation
- [Component Inventory](./component-inventory.md) — All 12 components with variants
- [Design System Quick Reference](./design-system-quick-ref.md) — Tokens, CVA dimensions, tiers
- [LLM Configuration](./llm-configuration.md) — Environment variables, model selection
- [Troubleshooting](./troubleshooting.md) — Common failure modes and debugging
