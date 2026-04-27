# JSON-Based Content & Localization System - Implementation Proposal

> **📋 Plan Status: IMPLEMENTED (Epic 11 ✅ Complete) | Architecture Superseded by Epic 14**
>
> **This proposal was implemented as Epic 11 (✅ complete). Epic 14 now supersedes this architecture with Directus API at build-time.**
>
> **Epic 11 Status:** Fully implemented - Runtime JSON loading from CDN (7 stories complete)
> **Epic 14 Status:** New architectural direction - Build-time Directus API with SSG/ISR
>
> **This document remains valuable for:**
> - Understanding the implemented Epic 11 codebase
> - Learning the content patterns that informed Epic 14's design
> - Historical context of architectural evolution
>
> **Architectural Evolution:**
> - **Epic 11 (Implemented):** JSON files on CDN, runtime loading, SWR hooks
> - **Epic 14 (New Direction):** Directus CMS, build-time fetching, SSG/ISR
>
> **Current Architecture:** See [Epic 14](../epics/epic-14.static-site-generation_isr_ready_2026-01-28.md)
> **Research:** [Directus + Next.js SSG](../research/directus-nextjs-ssg-architecture_2026-01-29_a7f2.md)
>
> ---

## Executive Summary

Implement a JSON-based content management system that separates all text, media references, and configuration from React components. This enables runtime content updates without rebuilding 10,000+ hotel websites.

**Note:** This approach was replaced in favor of Directus API calls at build-time (see Epic 14).

---

## Current Architecture (What We Have)

Based on codebase exploration:

1. **LangGraph 5-Agent Pipeline** generates `HomepageConfig` JSON with:
   - `hotelParameters`, `components[]`, `variant`, `props`
   - Components receive content through typed props

2. **4-Tier Component System** with Zod validation:
   - Primitives → Blocks → Sections → Pages
   - All content flows through validated props

3. **Hard-coded content exists** in components:
   - Section headings: "World-Class Amenities", "Guest Reviews"
   - No i18n system implemented yet

4. **Deployment**: Cloudflare Pages + BackBlaze B2 for images

---

## Proposed Architecture

### Three-Layer Content Separation

```
Layer 1: /content/pages/          → Text content (titles, descriptions, buttons, meta)
Layer 2: /content/media/          → Media references (image IDs, video URLs)
Layer 3: /content/config/         → Site configuration (theme, features)
```

### JSON File Structure Per Hotel

```
/content/
├── {hotel-id}/
│   ├── pages/
│   │   ├── homepage.json         # Hero text, section headings, CTAs
│   │   ├── rooms.json            # Room names, descriptions, pricing copy
│   │   ├── contact.json          # Form labels, address, contact info
│   │   └── booking.json          # Booking flow text, confirmation messages
│   ├── media/
│   │   ├── homepage-media.json   # Image IDs, alt text, captions
│   │   ├── rooms-media.json      # Room gallery references
│   │   └── manifest.json         # Central media registry
│   ├── locales/
│   │   ├── en.json               # English overrides
│   │   ├── es.json               # Spanish
│   │   ├── fr.json               # French
│   │   └── de.json               # German
│   └── config/
│       ├── theme.json            # Brand colors, fonts
│       └── features.json         # Feature flags
```

### Page Content JSON Example (homepage.json)

```json
{
  "meta": {
    "title": "{{hotelName}} | Luxury Hotel in {{location}}",
    "description": "Experience world-class hospitality at {{hotelName}}",
    "ogImage": "@media:homepage.og-image"
  },
  "hero": {
    "headline": "Welcome to {{hotelName}}",
    "tagline": "Where luxury meets comfort",
    "primaryCTA": { "text": "Book Now", "ariaLabel": "Book your stay" },
    "secondaryCTA": { "text": "Explore Rooms", "ariaLabel": "View our rooms" }
  },
  "sections": {
    "amenities": {
      "heading": "World-Class Amenities",
      "subheading": "Everything you need for a perfect stay"
    },
    "testimonials": {
      "heading": "Guest Reviews",
      "subheading": "Hear what our guests say"
    }
  },
  "footer": {
    "copyright": "© 2026 {{hotelName}}. All rights reserved.",
    "privacyLink": { "text": "Privacy Policy", "href": "/privacy" }
  }
}
```

### Media Manifest JSON Example (manifest.json)

```json
{
  "cdn": {
    "baseUrl": "https://f000.backblazeb2.com/file/hotel-assets",
    "transformPath": "/cdn-cgi/image"
  },
  "assets": {
    "homepage": {
      "hero": {
        "id": "hero-001",
        "path": "/{{hotelId}}/hero.webp",
        "mobilePath": "/{{hotelId}}/hero.m.webp",
        "alt": "{{hotelName}} exterior view",
        "blurhash": "L6Pj0^jE.AyE_3t7t7R**0o#DgR4"
      },
      "og-image": {
        "id": "og-001",
        "path": "/{{hotelId}}/og.jpg",
        "alt": "{{hotelName}} social preview"
      }
    }
  }
}
```

---

## 5 Pros

| # | Advantage | Impact |
|---|-----------|--------|
| **1** | **Runtime Content Updates** - Update JSON on CDN, users see changes immediately without rebuild | Critical for 10,000+ sites - no rebuild needed |
| **2** | **Easy Localization** - Add new language by adding JSON file, no code changes | 4+ languages per hotel with field-level translations |
| **3** | **Content-Code Separation** - Non-developers can edit JSON without touching React | Reduces deployment risk, enables content teams |
| **4** | **Type-Safe with Zod** - Runtime validation catches errors before rendering | Maintains existing contract-based quality |
| **5** | **CDN Performance** - Cloudflare caches JSON globally, stale-while-revalidate pattern | Sub-100ms content delivery worldwide |

---

## 5 Cons

| # | Disadvantage | Mitigation |
|---|--------------|------------|
| **1** | **Initial Network Request** - Client must fetch JSON before rendering (vs bundled) | Use SWR with `staleTime`, show skeleton loaders, SSR initial load |
| **2** | **Schema Drift Risk** - JSON structure may diverge from component expectations | Strict Zod validation + CI checks on JSON files |
| **3** | **SEO Considerations** - Client-fetched content may not be indexed | Server-side render with initial JSON, hydrate with fresh |
| **4** | **Complexity Increase** - Additional abstraction layer to maintain | Clear documentation, generated TypeScript types |
| **5** | **Cache Invalidation** - Stale content if cache headers misconfigured | Standardized headers: `s-maxage=60, stale-while-revalidate=86400` |

---

## Recommended Tech Stack

Based on research findings:

| Component | Recommendation | Rationale |
|-----------|----------------|-----------|
| **Data Fetching** | SWR (4KB) | Lightweight, Next.js optimized, auto-revalidation |
| **Validation** | Zod (existing) | Already in project, runtime type safety |
| **Content Hosting** | Cloudflare Workers KV | <10ms reads, $0 egress, auto-caching |
| **Media Storage** | BackBlaze B2 + Cloudflare | $0 egress, existing infrastructure |
| **Localization** | next-intl patterns | 457B bundle, SSG-optimized |

---

## Reusable Solutions (Not Reinventing)

1. **SWR** - Vercel's data fetching library with caching
2. **Zod** - Already in project for validation
3. **next-intl patterns** - Namespace loading approach (adapt for content)
4. **Cloudflare Image Transformations** - Responsive images from single source
5. **BlurHash** - Compact image placeholders (20-30 bytes)

---

## Implementation Plan

### Phase 1: Content Schema & Types (2-3 days)
**Files to create:**
- `web-app/lib/content/schemas/page-content.schema.ts`
- `web-app/lib/content/schemas/media-manifest.schema.ts`
- `web-app/lib/content/types.ts`

**Tasks:**
1. Define Zod schemas for page content structure
2. Define Zod schemas for media manifest
3. Generate TypeScript types from schemas
4. Create content reference resolver (`@media:`, `{{variable}}`)

### Phase 2: Content Hooks (1-2 days)
**Files to create:**
- `web-app/lib/content/hooks/usePageContent.ts`
- `web-app/lib/content/hooks/useMediaAsset.ts`
- `web-app/lib/content/ContentProvider.tsx`

**Tasks:**
1. Create SWR-based `usePageContent(hotelId, pageId)` hook
2. Create `useMediaAsset(ref)` hook with responsive URL generation
3. Create ContentProvider for context-based access
4. Add skeleton loading states

### Phase 3: Component Migration (3-4 days)
**Files to modify:**
- `web-app/components/sections/HeroSection/`
- `web-app/components/blocks/Amenities/`
- `web-app/components/blocks/Testimonials/`
- All components with hardcoded text

**Tasks:**
1. Replace hardcoded strings with content hook calls
2. Add `contentKey` prop to components
3. Create loading/error states
4. Maintain backward compatibility (fallback to props)

### Phase 4: LangGraph Integration (2-3 days)
**Files to modify:**
- `web-app/app/langgraph/agents/ContentGenerator.ts`
- `web-app/app/langgraph/agents/AssemblyAgent.ts`
- `scripts/generate-homepage.ts`

**Tasks:**
1. Modify ContentGenerator to output page content JSON
2. Modify AssemblyAgent to output media manifest
3. Generate locale-specific content files
4. Update output structure to include `/content/` directory

### Phase 5: CDN Deployment (1-2 days)
**Tasks:**
1. Configure Cloudflare Workers KV for content storage
2. Set up content upload workflow (JSON → KV)
3. Configure cache headers and invalidation
4. Create content update API/script

---

## Critical Files to Modify

```
web-app/
├── lib/
│   ├── content/                     # NEW: Content system
│   │   ├── schemas/
│   │   │   ├── page-content.schema.ts
│   │   │   └── media-manifest.schema.ts
│   │   ├── hooks/
│   │   │   ├── usePageContent.ts
│   │   │   └── useMediaAsset.ts
│   │   ├── ContentProvider.tsx
│   │   ├── resolvers.ts             # @media:, {{var}} resolution
│   │   └── types.ts
│   └── contracts/                   # MODIFY: Add content contracts
├── components/
│   ├── sections/HeroSection/        # MODIFY: Use content hooks
│   ├── blocks/Amenities/            # MODIFY: Remove hardcoded text
│   └── blocks/Testimonials/         # MODIFY: Remove hardcoded text
└── app/
    ├── api/content/[...path]/       # NEW: Content API route
    └── langgraph/agents/            # MODIFY: Output content JSONs
```

---

## Verification Plan

### Unit Tests
```bash
npm test -- --testPathPattern="content"
```
- Test Zod schema validation
- Test content resolver functions
- Test SWR hooks with mock data

### Integration Tests
```bash
npm test -- --config jest.config.workflow.js
```
- Test LangGraph output includes content JSONs
- Test component rendering with content hooks

### E2E Verification
1. Generate a hotel website with new system
2. Verify content loads correctly on all pages
3. Update JSON on CDN, verify changes appear without rebuild
4. Test with 4 different locales
5. Run Lighthouse audit (target: >90 score)

### Manual Checklist
- [ ] All hardcoded strings removed from components
- [ ] JSON files validate against Zod schemas
- [ ] Content updates reflect within 60 seconds
- [ ] Skeleton loaders show during content fetch
- [ ] SEO meta tags render correctly (server-side)
- [ ] Images load with responsive srcset
- [ ] BlurHash placeholders display correctly

---

## Research Documents Created

1. `docs/research/nextjs-json-i18n_2026-01-14_a7d3.md` - i18n library comparison
2. `docs/research/ssg-dynamic-content-cloudflare_2026-01-14_1215.md` - CDN patterns
3. `docs/research/json-content-organization-hotel-websites_2026-01-14_a7c3.md` - JSON structure
4. `docs/research/json-content-loading-nextjs-runtime_2026-01-14_b8f2.md` - Runtime loading
5. `docs/research/media-asset-separation-cdn-patterns_2026-01-14_c4d8.md` - Media handling

---

## Estimated Effort

| Phase | Duration | Complexity |
|-------|----------|------------|
| Phase 1: Schemas & Types | 2-3 days | Medium |
| Phase 2: Content Hooks | 1-2 days | Low |
| Phase 3: Component Migration | 3-4 days | Medium-High |
| Phase 4: LangGraph Integration | 2-3 days | High |
| Phase 5: CDN Deployment | 1-2 days | Medium |
| **Total** | **9-14 days** | |

---

## User Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Locale Structure** | Per-page files | `homepage-en.json`, `homepage-es.json` - granular control per page |
| **Content Hosting** | Cloudflare Workers KV | <10ms reads, optimal for small JSON files |
| **Priority** | Homepage first | Validate approach before expanding to other pages |

---

## Revised File Structure (Per-Page Locales)

```
/content/{hotel-id}/
├── pages/
│   ├── homepage/
│   │   ├── content.json          # Default (English)
│   │   ├── content.es.json       # Spanish
│   │   ├── content.fr.json       # French
│   │   └── content.de.json       # German
│   ├── rooms/                    # Phase 2
│   ├── contact/                  # Phase 2
│   └── booking/                  # Phase 2
├── media/
│   └── manifest.json             # Central media registry
└── config/
    └── theme.json
```

---

## Revised Implementation (Homepage Focus)

### Phase 1: Homepage Content System
1. Create content schemas for homepage only
2. Build `usePageContent` hook with SWR
3. Migrate HeroSection, Amenities, Testimonials to use content hooks
4. Test with 4 locales (en, es, fr, de)

### Phase 2: Expand to Other Pages (After Validation)
1. Rooms page content migration
2. Contact page content migration
3. Booking page content migration

This reduces initial scope from 9-14 days to **5-7 days** for Phase 1.



● User approved Claude's plan
  ⎿  Plan saved to: ~/.claude/plans/greedy-leaping-avalanche.md · /plan to edit
     JSON-Based Content & Localization System - Implementation Proposal

     Executive Summary

     Implement a JSON-based content management system that separates all text, media references, and configuration from React components. This enables runtime content updates without rebuilding 10,000+ hotel websites.

     ---
     Current Architecture (What We Have)

     Based on codebase exploration:

     1. LangGraph 5-Agent Pipeline generates HomepageConfig JSON with:
       - hotelParameters, components[], variant, props
       - Components receive content through typed props
     2. 4-Tier Component System with Zod validation:
       - Primitives → Blocks → Sections → Pages
       - All content flows through validated props
     3. Hard-coded content exists in components:
       - Section headings: "World-Class Amenities", "Guest Reviews"
       - No i18n system implemented yet
     4. Deployment: Cloudflare Pages + BackBlaze B2 for images

     ---
     Proposed Architecture

     Three-Layer Content Separation

     Layer 1: /content/pages/          → Text content (titles, descriptions, buttons, meta)
     Layer 2: /content/media/          → Media references (image IDs, video URLs)
     Layer 3: /content/config/         → Site configuration (theme, features)

     JSON File Structure Per Hotel

     /content/
     ├── {hotel-id}/
     │   ├── pages/
     │   │   ├── homepage.json         # Hero text, section headings, CTAs
     │   │   ├── rooms.json            # Room names, descriptions, pricing copy
     │   │   ├── contact.json          # Form labels, address, contact info
     │   │   └── booking.json          # Booking flow text, confirmation messages
     │   ├── media/
     │   │   ├── homepage-media.json   # Image IDs, alt text, captions
     │   │   ├── rooms-media.json      # Room gallery references
     │   │   └── manifest.json         # Central media registry
     │   ├── locales/
     │   │   ├── en.json               # English overrides
     │   │   ├── es.json               # Spanish
     │   │   ├── fr.json               # French
     │   │   └── de.json               # German
     │   └── config/
     │       ├── theme.json            # Brand colors, fonts
     │       └── features.json         # Feature flags

     Page Content JSON Example (homepage.json)

     {
       "meta": {
         "title": "{{hotelName}} | Luxury Hotel in {{location}}",
         "description": "Experience world-class hospitality at {{hotelName}}",
         "ogImage": "@media:homepage.og-image"
       },
       "hero": {
         "headline": "Welcome to {{hotelName}}",
         "tagline": "Where luxury meets comfort",
         "primaryCTA": { "text": "Book Now", "ariaLabel": "Book your stay" },
         "secondaryCTA": { "text": "Explore Rooms", "ariaLabel": "View our rooms" }
       },
       "sections": {
         "amenities": {
           "heading": "World-Class Amenities",
           "subheading": "Everything you need for a perfect stay"
         },
         "testimonials": {
           "heading": "Guest Reviews",
           "subheading": "Hear what our guests say"
         }
       },
       "footer": {
         "copyright": "© 2026 {{hotelName}}. All rights reserved.",
         "privacyLink": { "text": "Privacy Policy", "href": "/privacy" }
       }
     }

     Media Manifest JSON Example (manifest.json)

     {
       "cdn": {
         "baseUrl": "https://f000.backblazeb2.com/file/hotel-assets",
         "transformPath": "/cdn-cgi/image"
       },
       "assets": {
         "homepage": {
           "hero": {
             "id": "hero-001",
             "path": "/{{hotelId}}/hero.webp",
             "mobilePath": "/{{hotelId}}/hero.m.webp",
             "alt": "{{hotelName}} exterior view",
             "blurhash": "L6Pj0^jE.AyE_3t7t7R**0o#DgR4"
           },
           "og-image": {
             "id": "og-001",
             "path": "/{{hotelId}}/og.jpg",
             "alt": "{{hotelName}} social preview"
           }
         }
       }
     }

     ---
     5 Pros
     ┌─────┬─────────────────────────────────────────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────┐
     │  #  │                                          Advantage                                          │                        Impact                        │
     ├─────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
     │ 1   │ Runtime Content Updates - Update JSON on CDN, users see changes immediately without rebuild │ Critical for 10,000+ sites - no rebuild needed       │
     ├─────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
     │ 2   │ Easy Localization - Add new language by adding JSON file, no code changes                   │ 4+ languages per hotel with field-level translations │
     ├─────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
     │ 3   │ Content-Code Separation - Non-developers can edit JSON without touching React               │ Reduces deployment risk, enables content teams       │
     ├─────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
     │ 4   │ Type-Safe with Zod - Runtime validation catches errors before rendering                     │ Maintains existing contract-based quality            │
     ├─────┼─────────────────────────────────────────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────┤
     │ 5   │ CDN Performance - Cloudflare caches JSON globally, stale-while-revalidate pattern           │ Sub-100ms content delivery worldwide                 │
     └─────┴─────────────────────────────────────────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┘
     ---
     5 Cons
     ┌─────┬────────────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────┐
     │  #  │                                  Disadvantage                                  │                           Mitigation                            │
     ├─────┼────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 1   │ Initial Network Request - Client must fetch JSON before rendering (vs bundled) │ Use SWR with staleTime, show skeleton loaders, SSR initial load │
     ├─────┼────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 2   │ Schema Drift Risk - JSON structure may diverge from component expectations     │ Strict Zod validation + CI checks on JSON files                 │
     ├─────┼────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 3   │ SEO Considerations - Client-fetched content may not be indexed                 │ Server-side render with initial JSON, hydrate with fresh        │
     ├─────┼────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 4   │ Complexity Increase - Additional abstraction layer to maintain                 │ Clear documentation, generated TypeScript types                 │
     ├─────┼────────────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────┤
     │ 5   │ Cache Invalidation - Stale content if cache headers misconfigured              │ Standardized headers: s-maxage=60, stale-while-revalidate=86400 │
     └─────┴────────────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────┘
     ---
     Recommended Tech Stack

     Based on research findings:
     ┌─────────────────┬───────────────────────────┬───────────────────────────────────────────────────┐
     │    Component    │      Recommendation       │                     Rationale                     │
     ├─────────────────┼───────────────────────────┼───────────────────────────────────────────────────┤
     │ Data Fetching   │ SWR (4KB)                 │ Lightweight, Next.js optimized, auto-revalidation │
     ├─────────────────┼───────────────────────────┼───────────────────────────────────────────────────┤
     │ Validation      │ Zod (existing)            │ Already in project, runtime type safety           │
     ├─────────────────┼───────────────────────────┼───────────────────────────────────────────────────┤
     │ Content Hosting │ Cloudflare Workers KV     │ <10ms reads, $0 egress, auto-caching              │
     ├─────────────────┼───────────────────────────┼───────────────────────────────────────────────────┤
     │ Media Storage   │ BackBlaze B2 + Cloudflare │ $0 egress, existing infrastructure                │
     ├─────────────────┼───────────────────────────┼───────────────────────────────────────────────────┤
     │ Localization    │ next-intl patterns        │ 457B bundle, SSG-optimized                        │
     └─────────────────┴───────────────────────────┴───────────────────────────────────────────────────┘
     ---
     Reusable Solutions (Not Reinventing)

     1. SWR - Vercel's data fetching library with caching
     2. Zod - Already in project for validation
     3. next-intl patterns - Namespace loading approach (adapt for content)
     4. Cloudflare Image Transformations - Responsive images from single source
     5. BlurHash - Compact image placeholders (20-30 bytes)

     ---
     Implementation Plan

     Phase 1: Content Schema & Types (2-3 days)

     Files to create:
     - web-app/lib/content/schemas/page-content.schema.ts
     - web-app/lib/content/schemas/media-manifest.schema.ts
     - web-app/lib/content/types.ts

     Tasks:
     1. Define Zod schemas for page content structure
     2. Define Zod schemas for media manifest
     3. Generate TypeScript types from schemas
     4. Create content reference resolver (@media:, {{variable}})

     Phase 2: Content Hooks (1-2 days)

     Files to create:
     - web-app/lib/content/hooks/usePageContent.ts
     - web-app/lib/content/hooks/useMediaAsset.ts
     - web-app/lib/content/ContentProvider.tsx

     Tasks:
     1. Create SWR-based usePageContent(hotelId, pageId) hook
     2. Create useMediaAsset(ref) hook with responsive URL generation
     3. Create ContentProvider for context-based access
     4. Add skeleton loading states

     Phase 3: Component Migration (3-4 days)

     Files to modify:
     - web-app/components/sections/HeroSection/
     - web-app/components/blocks/Amenities/
     - web-app/components/blocks/Testimonials/
     - All components with hardcoded text

     Tasks:
     1. Replace hardcoded strings with content hook calls
     2. Add contentKey prop to components
     3. Create loading/error states
     4. Maintain backward compatibility (fallback to props)

     Phase 4: LangGraph Integration (2-3 days)

     Files to modify:
     - web-app/app/langgraph/agents/ContentGenerator.ts
     - web-app/app/langgraph/agents/AssemblyAgent.ts
     - scripts/generate-homepage.ts

     Tasks:
     1. Modify ContentGenerator to output page content JSON
     2. Modify AssemblyAgent to output media manifest
     3. Generate locale-specific content files
     4. Update output structure to include /content/ directory

     Phase 5: CDN Deployment (1-2 days)

     Tasks:
     1. Configure Cloudflare Workers KV for content storage
     2. Set up content upload workflow (JSON → KV)
     3. Configure cache headers and invalidation
     4. Create content update API/script

     ---
     Critical Files to Modify

     web-app/
     ├── lib/
     │   ├── content/                     # NEW: Content system
     │   │   ├── schemas/
     │   │   │   ├── page-content.schema.ts
     │   │   │   └── media-manifest.schema.ts
     │   │   ├── hooks/
     │   │   │   ├── usePageContent.ts
     │   │   │   └── useMediaAsset.ts
     │   │   ├── ContentProvider.tsx
     │   │   ├── resolvers.ts             # @media:, {{var}} resolution
     │   │   └── types.ts
     │   └── contracts/                   # MODIFY: Add content contracts
     ├── components/
     │   ├── sections/HeroSection/        # MODIFY: Use content hooks
     │   ├── blocks/Amenities/            # MODIFY: Remove hardcoded text
     │   └── blocks/Testimonials/         # MODIFY: Remove hardcoded text
     └── app/
         ├── api/content/[...path]/       # NEW: Content API route
         └── langgraph/agents/            # MODIFY: Output content JSONs

     ---
     Verification Plan

     Unit Tests

     npm test -- --testPathPattern="content"
     - Test Zod schema validation
     - Test content resolver functions
     - Test SWR hooks with mock data

     Integration Tests

     npm test -- --config jest.config.workflow.js
     - Test LangGraph output includes content JSONs
     - Test component rendering with content hooks

     E2E Verification

     1. Generate a hotel website with new system
     2. Verify content loads correctly on all pages
     3. Update JSON on CDN, verify changes appear without rebuild
     4. Test with 4 different locales
     5. Run Lighthouse audit (target: >90 score)

     Manual Checklist

     - All hardcoded strings removed from components
     - JSON files validate against Zod schemas
     - Content updates reflect within 60 seconds
     - Skeleton loaders show during content fetch
     - SEO meta tags render correctly (server-side)
     - Images load with responsive srcset
     - BlurHash placeholders display correctly

     ---
     Research Documents Created

     1. docs/research/nextjs-json-i18n_2026-01-14_a7d3.md - i18n library comparison
     2. docs/research/ssg-dynamic-content-cloudflare_2026-01-14_1215.md - CDN patterns
     3. docs/research/json-content-organization-hotel-websites_2026-01-14_a7c3.md - JSON structure
     4. docs/research/json-content-loading-nextjs-runtime_2026-01-14_b8f2.md - Runtime loading
     5. docs/research/media-asset-separation-cdn-patterns_2026-01-14_c4d8.md - Media handling

     ---
     Estimated Effort
     ┌────────────────────────────────┬───────────┬─────────────┐
     │             Phase              │ Duration  │ Complexity  │
     ├────────────────────────────────┼───────────┼─────────────┤
     │ Phase 1: Schemas & Types       │ 2-3 days  │ Medium      │
     ├────────────────────────────────┼───────────┼─────────────┤
     │ Phase 2: Content Hooks         │ 1-2 days  │ Low         │
     ├────────────────────────────────┼───────────┼─────────────┤
     │ Phase 3: Component Migration   │ 3-4 days  │ Medium-High │
     ├────────────────────────────────┼───────────┼─────────────┤
     │ Phase 4: LangGraph Integration │ 2-3 days  │ High        │
     ├────────────────────────────────┼───────────┼─────────────┤
     │ Phase 5: CDN Deployment        │ 1-2 days  │ Medium      │
     ├────────────────────────────────┼───────────┼─────────────┤
     │ Total                          │ 9-14 days │             │
     └────────────────────────────────┴───────────┴─────────────┘
     ---
     User Decisions
     ┌──────────────────┬───────────────────────┬────────────────────────────────────────────────────────────────┐
     │     Decision     │        Choice         │                           Rationale                            │
     ├──────────────────┼───────────────────────┼────────────────────────────────────────────────────────────────┤
     │ Locale Structure │ Per-page files        │ homepage-en.json, homepage-es.json - granular control per page │
     ├──────────────────┼───────────────────────┼────────────────────────────────────────────────────────────────┤
     │ Content Hosting  │ Cloudflare Workers KV │ <10ms reads, optimal for small JSON files                      │
     ├──────────────────┼───────────────────────┼────────────────────────────────────────────────────────────────┤
     │ Priority         │ Homepage first        │ Validate approach before expanding to other pages              │
     └──────────────────┴───────────────────────┴────────────────────────────────────────────────────────────────┘
     ---
     Revised File Structure (Per-Page Locales)

     /content/{hotel-id}/
     ├── pages/
     │   ├── homepage/
     │   │   ├── content.json          # Default (English)
     │   │   ├── content.es.json       # Spanish
     │   │   ├── content.fr.json       # French
     │   │   └── content.de.json       # German
     │   ├── rooms/                    # Phase 2
     │   ├── contact/                  # Phase 2
     │   └── booking/                  # Phase 2
     ├── media/
     │   └── manifest.json             # Central media registry
     └── config/
         └── theme.json

     ---
     Revised Implementation (Homepage Focus)

     Phase 1: Homepage Content System

     1. Create content schemas for homepage only
     2. Build usePageContent hook with SWR
     3. Migrate HeroSection, Amenities, Testimonials to use content hooks
     4. Test with 4 locales (en, es, fr, de)

     Phase 2: Expand to Other Pages (After Validation)

     1. Rooms page content migration
     2. Contact page content migration
     3. Booking page content migration

     This reduces initial scope from 9-14 days to 5-7 days for Phase 1.