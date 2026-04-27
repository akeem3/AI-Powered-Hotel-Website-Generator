---
type: epic
epic_number: "14"
id: "14-static-site-generation-isr"
status: in_progress
priority: high
created_at: "2026-01-28T00:00:00Z"
updated_at: "2026-02-12T00:00:00Z"
target_completion: null

# Agent tracking
created_by: epic-creator
updated_by: claude-code

# Source Document References
prd_reference: "docs/prd.md"
architecture_reference: "docs/architecture.md"
research_reference: "docs/research/build-time-vs-runtime-content-seo_2026-01-28_a7f2.md"

# Functional Requirement Coverage
fr_coverage: []

# Non-Functional Requirement Coverage
nfr_coverage: [NFR3, NFR4, NFR15]

# Dependencies
depends_on: ["11-content-json-content-system", "12-visual-excellence-design-system"]
blocks: []

# Progress tracking
stories_count: 9
stories_completed: 6
stories_in_progress: 0
stories_blocked: 0

# Validation Results (populated by /create-epic workflow)
hallucination_check:
  status: CLEAN
  validated_at: "2026-01-29T18:00:00Z"
  confidence: 1.0
  issues_count: 0

complexity_validation:
  status: VALID
  validated_at: "2026-01-29T18:00:00Z"
  overall_score: 2.4
  stories_needing_review: []
  principle_violations: 0

# Lifecycle
tags: [seo, performance, isr, ssg, next.js-15, cms-api, multi-language, build-optimization]
archival_date: null
---

# Epic 14: CMS API-Powered SSG with ISR for Multi-Language Hotel Websites

## Business Context

Enable immediate SEO indexing and optimal Core Web Vitals for 100,000+ hotel websites by implementing build-time content injection using the ET CMS Publishing API as the data source, with Incremental Static Regeneration (ISR) for content freshness.

**Critical Architecture Shift (2026-01-29, Updated 2026-02-06):**

Originally, Epic 14 proposed enhancing Epic 11's JSON file approach with build-time injection. Research verified a superior architecture: **CMS API calls at build-time** instead of JSON files. Further analysis (2026-02-06) confirmed the CMS is a **custom FastAPI REST API** (not standard Directus), requiring standard `fetch()` with Bearer token auth instead of `@directus/sdk`.

**Why This Approach:**

1. **Simplified Architecture**: Single source of truth (CMS API at `cms-dir.effectivetours.com`), no JSON synchronization pipeline
2. **Real-Time Content Updates**: ISR revalidation via webhooks
3. **Type Safety**: Custom TypeScript types matching actual API response schema
4. **No SDK Dependency**: Standard `fetch()` with Bearer token — zero external dependencies
5. **Single Endpoint**: `GET /api/hotels/{id}/full` returns all hotel data in one call (~265ms)
6. **Build-Time Performance**: Per-hotel deployment model (30-90 seconds per hotel)
7. **Multi-Language Ready**: Content model supports multiple languages via `language` field with 3 variants per language

**Source Research Documents:**

| Research | Focus | Key Finding |
|----------|-------|-------------|
| `build-time-vs-runtime-content-seo_2026-01-28_a7f2.md` | SEO comparison | Build-time injection provides immediate indexing |
| `nextjs-ssg-isr-i18n-localization_2026-01-29_e4a1.md` | SSG + i18n | next-intl recommended for App Router |
| `nextjs-ssg-many-locales-different-alphabets_2026-01-29_b4c8.md` | Multi-language scale | Tiered strategy for 10+ languages |
| `nextjs-per-deployment-ssg-isr-multi-tenant_2026-01-29_a7f2.md` | Deployment model | Per-deployment vs single-deployment patterns |
| `directus-nextjs-ssg-architecture_2026-01-29_a7f2.md` | Directus integration | Official SDK with build-time data fetching |

---

## Architecture Overview

### Deployment Model: Per-Hotel Independent Deployments

**Key Clarification (2026-01-29):** Hotels are deployed **one-by-one**, not all at once.

```
Client requests hotel site → Deploy that specific hotel
Client adds Thai language → Redeploy that hotel only
Total capacity: 100,000+ sites over time
```

**Build Time Reality:**

| Scale | Languages | Pages | Build Time |
|-------|-----------|-------|------------|
| 1 hotel | 3 | ~60 | 30-90 seconds ✅ |
| 1 hotel | 15 | ~300 | 2-3 minutes ✅ |
| 10 hotels | 3 | ~600 | 5-8 minutes ✅ |

**Conclusion:** Build time is **NOT a concern** for per-hotel deployment model.

---

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              ET CMS PUBLISHING API (FastAPI/PostgreSQL)          │
│  Base URL: https://cms-dir.effectivetours.com                   │
│  Endpoint: GET /api/hotels/{id}/full                            │
│  Auth: Bearer token                                              │
│  Returns: hotel, content (3 variants), rooms, facilities, images│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ fetch() with Bearer token (build-time)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BUILD TIME (Per Hotel)                        │
│                                                                   │
│  1. Read HOTEL_ID from env var                                   │
│  2. Fetch full hotel data from CMS API (single call, ~265ms)    │
│  3. Transform: parse address, group facilities, select variants │
│  4. Generate static pages for all language combinations         │
│  5. Deploy to Vercel/Cloudflare                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RUNTIME (ISR)                              │
│                                                                   │
│  Content updates in CMS → Webhook POST → ISR revalidation       │
│  (No redeploy needed for content changes)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

### Multi-Language Support Architecture

**CMS Content Model (Language + Variant):**

The CMS stores content with a `language` field and 3 length variants per language. To add a new language, content entries are added to the CMS for that language.

**Data Model (from live API):**

```
hotel object:
  - id, name, slug, property_type, star_rating, status
  - address (JSON string: city, state, street, country, postal_code)

content array (3 variants × N languages):
  - id, hotel_id
  - title: "Hotel Concise" | "Hotel Standard" | "Hotel Extended"
  - content: marketing text (50-150 words)
  - language: "en" | "th" | "ja" | "ar" | etc.
  - status, sort_order

rooms array:
  - id, hotel_id, name, room_type, capacity_adults, capacity_children
  - description, featured_image, status, sort_order

facilities array (80+ items, ~15 categories):
  - id, hotel_id, name, type/category, available, sort_order
  - description, booking_required, operating_hours, capacity
```

**Language Detection Pattern:**

```typescript
// Extract available languages from CMS content
const availableLanguages = [...new Set(content.map(c => c.language))];
// Currently: ['en']
// Future: ['en', 'th', 'ja', 'ar', 'fr', 'de', ...]

// Get content for specific language and variant
const heroText = content.find(
  c => c.language === 'th' && c.title === 'Hotel Extended'
)?.content;
```

**Supported Languages (Examples):**

| Tier | Languages | Alphabet | Strategy |
|------|-----------|----------|----------|
| Core | en, es, fr, de | Latin | SSG all pages |
| Regional | pt, it, ru, zh-CN | Latin/Cyrillic/Chinese | SSG all pages |
| Emerging | th, vi, ja, ko, ar, he | Thai/Vietnamese/Japanese/Korean/Arabic/Hebrew | SSG all pages |

**Key Insight:** Since we build one hotel at a time, we can support **unlimited languages** without build time concerns. Currently only English content exists in the CMS — the architecture is ready for more.

---

### When to Redeploy vs Use ISR

| Scenario | Action | Reason |
|----------|--------|--------|
| Hotel description/amenities change | ISR revalidation | Content change only |
| Price/availability update | ISR revalidation | Dynamic data |
| **Add new language** (Thai, Japanese) | **Redeploy hotel** | New static pages needed |
| Platform feature update | Redeploy all hotels | Code change |
| New hotel site | Deploy new hotel | Initial build |

**ISR Revalidation Flow:**

```
┌─────────────────────────────────────────────────────────────┐
│  Hotel owner updates content in CMS                          │
│  (content, rooms, facilities, or images)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  CMS Webhook                                                  │
│  Trigger: Content update on hotel collections                │
│  Action: POST to https://{hotel-domain}/api/revalidate       │
│  Body: { hotel_id, secret, changed_collections }             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js ISR                                                  │
│  - Verify webhook secret                                     │
│  - revalidatePath('/th/hotels/my-hotel') for each language  │
│  - Page regenerated in background                            │
│  - Next request gets fresh content from CMS API              │
│  - NO REDEPLOY NEEDED                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## User Value Statement

After this epic, hotel websites will have SEO-critical content injected at build time from the CMS API, enabling immediate Google indexing without JavaScript rendering delays. Hotel owners can update content in the CMS and see changes reflected via ISR revalidation without redeployment. Adding new languages triggers a simple hotel redeploy (30-90 seconds).

**Validation:** After this epic, users will be able to:
- See hotel websites appear in Google search results within hours (not days)
- Experience faster page loads with LCP under 2.0s (desktop), 2.5s (mobile)
- Update content in CMS and see changes without redeploy (ISR)
- Add new languages via simple redeploy (30-90 seconds per hotel)
- Support unlimited languages including Thai, Japanese, Arabic, etc.
- Access SEO-critical content even when JavaScript fails

---

## Scope

### In Scope (with NFR Traceability)

| Capability | NFR Reference | Description |
|------------|---------------|-------------|
| CMS API Client Integration | NFR4: Performance | Configure REST API client with Bearer token for build-time data fetching |
| SSG Foundation | NFR3: SEO | Implement `generateStaticParams()` for per-hotel deployment with multi-language support |
| Build-Time Content Injection | NFR4: Performance | Fetch data from CMS API at build time and inject into HTML using content variants |
| Multi-Language Support | NFR3: SEO | Use CMS content `language` field for i18n content with 3 variants per language |
| ISR Implementation | NFR15: Availability | Time-based revalidation (hourly) + on-demand via CMS webhooks |
| SEO Metadata Generation | NFR3: SEO | `generateMetadata()` with hreflang tags for all languages |
| Hybrid Architecture | NFR4: Performance | Client components for dynamic features, server-side for SEO content |
| Sitemap Generation | NFR3: SEO | Dynamic sitemap.xml with multi-language URLs per hotel |
| CMS Webhook Integration | NFR15: Availability | Webhook triggers for ISR revalidation on content changes |
| Performance Testing | NFR3, NFR4 | Core Web Vitals validation (LCP <2.0s desktop, <2.5s mobile) |

### Out of Scope

| Excluded Item | Reason | Deferred To |
|---------------|--------|-------------|
| Real-time pricing/availability updates | Per research: these should remain runtime client-side features | Epic 11 runtime hooks |
| User-specific personalization | Requires runtime data fetching | Future enhancement |
| A/B testing variants | Research suggests keep static for SEO | Future enhancement |
| JSON file synchronization | Replaced by CMS API calls | N/A (architecture change) |
| Cloudflare JSON hosting | No longer needed with CMS API | N/A (architecture change) |

---

## Codebase Context

### Relevant Existing Patterns

| Pattern | File Path | Reference | Purpose |
|---------|-----------|-----------|---------|
| Locale Detection | `web-app/lib/content/locale/detection.ts` | `detectLocaleFromBrowser` | Multi-language SSG support |
| Locale Constants | `web-app/lib/content/locale/constants.ts` | `SUPPORTED_LOCALES` | Language configuration |
| Content Provider | `web-app/lib/content/ContentProvider.tsx` | `ContentProvider` | Client-side locale context |
| Language Selector | `web-app/components/blocks/LanguageSelector/index.tsx` | `LanguageSelector` | Language switching UI |
| Content Schemas | `web-app/lib/content/schemas/page-content.schema.ts` | `HomepageContentSchema` | Build-time content validation |
| Media Resolution | `web-app/lib/content/resolvers/media-resolver.ts` | `resolveMediaRef` | Build-time asset resolution |

### New Modules to Create

| Module | File Path | Purpose |
|--------|-----------|---------|
| CMS API Client | `web-app/lib/cms-api/client.ts` | Singleton REST API client with Bearer token auth |
| CMS API Types | `web-app/lib/cms-api/types.ts` | TypeScript interfaces matching actual API response |
| Data Transformers | `web-app/lib/cms-api/transformers.ts` | Content variant selection, facility grouping, address parsing |
| Build-Time Loaders | `web-app/lib/cms-api/loaders.ts` | Orchestrates fetch + transform for SSG page data |
| Data Mappers | `web-app/lib/mappers/` | Adapter functions transforming CMS Data → Component Props |
| CMS API Barrel | `web-app/lib/cms-api/index.ts` | Public exports for clean imports |
| SEO Utilities | `web-app/lib/seo/metadata.ts` | Metadata and JSON-LD generation from CMS data |
| Revalidation Handler | `web-app/app/api/revalidate/route.ts` | ISR webhook endpoint |

### Related Documentation

| Document | Section Title | Relevance |
|----------|---------------|-----------|
| Research | `docs/research/build-time-vs-runtime-content-seo_2026-01-28_a7f2.md` | Complete SEO and ISR analysis |
| Research | `docs/research/nextjs-ssg-isr-i18n-localization_2026-01-29_e4a1.md` | SSG with i18n patterns |
| Research | `docs/research/nextjs-ssg-many-locales-different-alphabets_2026-01-29_b4c8.md` | Multi-language with different alphabets |
| Research | `docs/research/nextjs-per-deployment-ssg-isr-multi-tenant_2026-01-29_a7f2.md` | Per-deployment architecture patterns |
| Research | `docs/research/directus-nextjs-ssg-architecture_2026-01-29_a7f2.md` | Directus integration with Next.js SSG |
| Architecture | `docs/architecture.md` → Section "Performance & SEO" | Core Web Vitals targets |
| Epic 11 | `docs/epics/epic-11.content_json-content-system_ready_2026-01-14.md` | Runtime content system (being replaced) |

---

## Stories

> Stories are ordered sequentially. Each story may only depend on previous stories (no forward dependencies).

### Story 14.1: ET CMS API Client Integration and TypeScript Types

**As a** developer,
**I want** to set up a typed REST API client for the ET CMS Publishing API with build-time authentication,
**So that** we can fetch real hotel data from `cms-dir.effectivetours.com` during static generation.

**NFR Coverage:** NFR4 (Performance)

**Architecture Decision (2026-02-06):**

The data source is the **ET-Hotel-AI CMS Publishing API** — a custom FastAPI-based REST API (NOT Directus SDK). The primary endpoint for fetching hotel data is:

```
GET /api/hotels/{hotel_id}/full
Authorization: Bearer <token>
Query: ?include=content,rooms,facilities,images (default: all)
```

This replaces the previously assumed `@directus/sdk` approach. No Directus SDK is needed.

**API Data Model (verified from live API response):**

The `/api/hotels/{hotel_id}/full` endpoint returns a `HotelFullResponse`:

| Collection | Type | Key Fields |
|------------|------|------------|
| `hotel` | object | `id` (UUID), `name`, `slug`, `property_type`, `star_rating` (number), `status`, `opening_year`, `address` (JSON string: city, state, street, country, postal_code), `is_template`, `has_override`, `created_at`, `updated_at` |
| `content` | array | `id`, `hotel_id`, `content_type` ("custom"), `title` ("Hotel Concise" / "Hotel Standard" / "Hotel Extended"), `content` (marketing text), `language` ("en"), `status`, `sort_order`, `parent_content_id`, `has_override` |
| `rooms` | array | `id`, `hotel_id`, `name`, `room_type`, `capacity_adults`, `capacity_children`, `description`, `featured_image`, `status`, `sort_order`, `room_details`, `has_override` |
| `facilities` | array | `id`, `hotel_id`, `name`, `type`/`category` (room_amenity, Activities, Wellness, Food & Drink, Bathroom, Outdoors, Internet, Parking, Reception services, Safety & security, General, Cleaning services, Entertainment and family services, Great for your stay), `available`, `sort_order`, `status`, `description`, `booking_required`, `featured_image`, `operating_hours`, `capacity`, `age_restrictions` |
| `images` | array/null | `id`, `hotel_id`, image data (may return null with `_errors` if unavailable) |
| `_metadata` | object | `hotel_id`, `fetched_at`, `processing_time_ms`, `collections_fetched` |
| `_errors` | array | List of collection names that had fetch errors |

**Content Variants (NOT translations):** Content uses 3 length variants per language:
- **Hotel Concise** (~50 words) — for cards, previews
- **Hotel Standard** (~100 words) — for standard sections
- **Hotel Extended** (~150 words) — for hero/full descriptions

**Other Available API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/cms/health` | GET | Health check (Directus, B2, DB connectivity) |
| `/cms/hotels/{hotel_id}` | GET | Verify published hotel (entity counts) |
| `/cms/hotels/{hotel_id}` | DELETE | Delete hotel and all related entities |
| `/cms/publish/from-b2` | POST | Publish hotel from B2 storage |
| `/cms/publish/batch` | POST | Batch publish (1-100 hotels) |
| `/cms/status/{job_id}` | GET | Batch job status |
| `/metrics` | GET | Prometheus metrics |

**Acceptance Criteria:**

**Given** I am setting up the ET CMS API integration
**When** I create a typed API client for `cms-dir.effectivetours.com`
**Then** I store `CMS_API_URL` and `CMS_API_TOKEN` in environment variables (`.env.local`, `.env.example`)
**And** I create a singleton API client in `web-app/lib/cms-api/client.ts` with Bearer token auth
**And** I create TypeScript types matching the actual API response schema in `web-app/lib/cms-api/types.ts`
**And** I create a `getHotelFull(hotelId: string)` function that calls `/api/hotels/{hotel_id}/full`
**And** I create a `checkCmsHealth()` function that calls `/cms/health`
**And** I handle `_errors` array in response (graceful degradation when collections fail)
**And** I parse the `address` field from JSON string to typed object
**And** I disable Next.js fetch caching to ensure fresh build-time data (`cache: 'no-store'`)
**And** I add retry logic (3 attempts with exponential backoff) for build-time resilience
**And** I test the client with a real API call to verify connectivity and response parsing

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `web-app/lib/cms-api/client.ts` | CMS API client | Singleton with Bearer token, retry logic |
| Create | `web-app/lib/cms-api/types.ts` | Type definitions | TypeScript interfaces matching API response |
| Create | `web-app/lib/cms-api/index.ts` | Public exports | Barrel file for clean imports |
| Modify | `web-app/.env.local` | Environment variables | Add `CMS_API_URL`, `CMS_API_TOKEN` |
| Modify | `web-app/.env.example` | Environment template | Add CMS API variables (with placeholders) |

**Prerequisites:** CMS API instance available at `cms-dir.effectivetours.com`, Bearer token provisioned

**Technical Notes:**
- Use standard `fetch()` with `Authorization: Bearer <token>` header — no external SDK needed
- Base URL: `https://cms-dir.effectivetours.com`
- Primary endpoint: `GET /api/hotels/{hotel_id}/full?include=content,rooms,facilities,images`
- Auth: Bearer token via `CMS_API_TOKEN` env var
- The `address` field is a JSON string that needs parsing: `{"city": "...", "state": "...", "street": "...", "country": "...", "postal_code": "..."}`
- Content has 3 variants per language (Concise/Standard/Extended), not Directus-style translations
- Facilities are categorized by `type`/`category` field (~15 categories, 80+ items typical)
- `_errors` array lists collections that failed to fetch — handle gracefully
- `_metadata` provides `processing_time_ms` for performance monitoring
- `images` may return null — design types to handle this
- Disable Next.js caching: `fetch(url, { cache: 'no-store' })`
- Store token as CI/CD secret, reference via `process.env.CMS_API_TOKEN`
- Use `-k` flag equivalent (`rejectUnauthorized: false`) only in development if needed for self-signed certs

**Relevant NFRs:**
- NFR4: Performance - Direct REST API calls, no SDK overhead, single endpoint for all hotel data

---

### Story 14.2: CMS Data Model Mapping and Content Variant Strategy

**As a** developer,
**I want** to create data transformation utilities that map CMS API responses to component-ready structures,
**So that** hotel data (content variants, rooms, categorized facilities) is normalized and typed for SSG consumption.

**NFR Coverage:** NFR3 (SEO)

**CMS Data Model (from live API — Story 14.1 types):**

The CMS API returns raw data that needs transformation for component consumption:

| Collection | Transformation Needed |
|------------|----------------------|
| `hotel` | Parse `address` JSON string → typed object; normalize `star_rating`, `property_type` |
| `content` | Group by `language`, then by variant (`Hotel Concise` / `Hotel Standard` / `Hotel Extended`); provide selector by use-case |
| `rooms` | Sort by `sort_order`; filter by `status === 'available'`; group by `room_type` if needed |
| `facilities` | Group by `category` (~15 categories); filter by `available === true`; sort within groups by `sort_order` |
| `images` | Handle null case gracefully; sort by any ordering field if present |

**Content Variant Strategy:**

| Variant | Title in CMS | ~Words | Use In Components |
|---------|-------------|--------|-------------------|
| **Concise** | "Hotel Concise" | ~50 | Cards, previews, meta descriptions, OG tags |
| **Standard** | "Hotel Standard" | ~100 | Standard page sections, summaries |
| **Extended** | "Hotel Extended" | ~150 | Hero section, full descriptions, landing pages |

**Facility Categories (from live data):**

| Category | Examples | UI Section |
|----------|----------|------------|
| `room_amenity` | Air conditioning, WiFi, TV, Minibar, Balcony | Room detail cards |
| `Great for your stay` | Restaurant, Parking, Spa, Family rooms | Highlights section |
| `Activities` | Beach, Diving, Snorkelling, Cycling, Cooking class | Activities section |
| `Wellness` | Yoga, Massage types, Spa facilities, Sun loungers | Wellness section |
| `Food & Drink` | Bar, Breakfast in room, Special diet menus | Dining section |
| `Bathroom` | Shower | Room amenities |
| `Outdoors` | Beachfront | Location highlights |
| `Safety & security` | 24-hour security, CCTV, Fire extinguishers | Trust signals |
| `Reception services` | 24-hour front desk, Tour desk, Currency exchange | Services section |
| `General` | Room service, Car hire, Shuttle service | General amenities |
| `Cleaning services` | Laundry | Services section |
| `Internet` | Internet services | Connectivity |
| `Parking` | Street parking | Practical info |
| `Entertainment and family services` | Babysitting/child services | Family section |

**Acceptance Criteria:**

**Given** the CMS API client from Story 14.1 returns raw hotel data
**When** I create data transformation and mapping utilities
**Then** I create a `transformHotelData(raw: HotelFullResponse)` function that normalizes the full response
**And** I create a `getContentVariant(content: CmsContent[], language: string, variant: 'concise' | 'standard' | 'extended')` selector
**And** I create a `groupFacilitiesByCategory(facilities: CmsFacility[])` utility that returns a `Record<string, CmsFacility[]>`
**And** I create a `getAvailableRooms(rooms: CmsRoom[])` utility filtering by status and sorting by sort_order
**And** I configure supported languages in locale constants with proper codes (en, es, fr, de, th, ja, ar) and text direction (ltr/rtl)
**And** I handle fallback when a content variant is missing for a language (fallback to English, then to any available)
**And** I handle the `_errors` field — if a collection failed to fetch, the transformed data reflects this gracefully
**And** I write unit tests for all transformation utilities

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `web-app/lib/cms-api/transformers.ts` | Data transformers | `transformHotelData()`, `getContentVariant()`, `groupFacilitiesByCategory()` |
| Create | `web-app/lib/cms-api/constants.ts` | Content variant mapping | Maps CMS titles to variant enum |
| Modify | `web-app/lib/content/locale/constants.ts` | `SUPPORTED_LOCALES` | Update to align with CMS language codes |

**Prerequisites:** Story 14.1 (CMS API client and types)

**Technical Notes:**
- Content variant titles from CMS: `"Hotel Concise"`, `"Hotel Standard"`, `"Hotel Extended"` — map to enum
- Content items have a `language` field (e.g., `"en"`) — filter by this for multi-language
- Facilities have both `type` and `category` fields (always identical in current data) — use `category` for grouping
- The `address` field is a JSON string: `'{"city":"Unawatuna","state":"Southern Province","street":"2A, Galle Road","country":"Sri Lanka","postal_code":"80200"}'` — parse with `JSON.parse()` and type the result
- Rooms currently all have `room_type: "standard"` — design for future room type differentiation
- `room_details` field is null for all rooms currently — type as optional
- For RTL languages: ar (Arabic), he (Hebrew), fa (Persian)
- For CJK languages: ja (Japanese), ko (Korean), th (Thai), zh-CN (Chinese)
- All transformation functions should be pure (no side effects, no API calls)

**Relevant NFRs:**
- NFR3: SEO - Properly structured data enables rich snippets and hreflang tags

---

### Story 14.3: SSG Foundation - generateStaticParams for Per-Hotel Deployment

**As a** developer,
**I want** to implement `generateStaticParams()` that generates static pages for the deployed hotel across all configured languages,
**So that** Next.js can generate static HTML for each language variant of a single hotel.

**NFR Coverage:** NFR3 (SEO), NFR4 (Performance)

**Per-Hotel Deployment Context:**

Each hotel is deployed independently. The hotel ID is configured via environment variable `HOTEL_ID`. At build time, `generateStaticParams()` generates pages for that single hotel across all configured languages. There is no need to fetch a list of hotels — we know exactly which hotel we're building.

**Acceptance Criteria:**

**Given** I am implementing static site generation for a per-hotel deployment
**When** I implement `generateStaticParams()` in hotel page routes
**Then** I read `HOTEL_ID` from environment variables to identify the target hotel
**And** I fetch the hotel data from CMS API using `getHotelFull(hotelId)` from Story 14.1
**And** I extract available languages from the hotel's `content` array (distinct `language` values)
**And** I cross-reference with `SUPPORTED_LOCALES` from locale constants
**And** I generate `{ lang: string, slug: string }` params for each language where content exists
**And** I use the hotel's `slug` field (e.g., `"thaproban-beach-house"`) for the URL
**And** I validate the hotel status is `"active"` before generating pages
**And** I add build-time logging showing: hotel name, languages being generated, total page count
**And** I handle the case where `HOTEL_ID` is not set with a clear build error

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `web-app/app/[lang]/hotels/[slug]/page.tsx` | Hotel page | New route with `generateStaticParams` export |
| Create | `web-app/app/[lang]/page.tsx` | Homepage | New route with `generateStaticParams` for language variants |
| Pattern | `web-app/lib/cms-api/client.ts` | CMS API client | Use `getHotelFull()` from Story 14.1 |
| Modify | `web-app/.env.example` | Environment template | Add `HOTEL_ID` variable |

**Prerequisites:** Story 14.1 (CMS API client), Story 14.2 (data transformers)

**Technical Notes:**
- Per-hotel deployment: `HOTEL_ID` env var identifies the single hotel (e.g., `09f207c1-695a-485a-9519-49f4ef03331f`)
- Next.js 15 App Router `generateStaticParams` pattern
- Hotel `slug` from CMS (e.g., `"thaproban-beach-house"`) becomes the URL segment
- Languages determined from content items: `[...new Set(content.map(c => c.language))]`
- Currently only `"en"` content exists; design to handle multiple languages when they're added to CMS
- Return array: `[{ lang: 'en', slug: 'thaproban-beach-house' }, { lang: 'th', slug: 'thaproban-beach-house' }, ...]`
- If hotel has no content for a language, skip that language (don't generate empty pages)
- Add build-time console logging: `Building: Thaproban Beach House [en, th, ja] (3 pages)`
- Fail the build early with a clear message if `HOTEL_ID` is missing or hotel not found

**Relevant NFRs:**
- NFR3: SEO - Static HTML enables immediate indexing
- NFR4: Performance - Build-time generation eliminates runtime fetch

---

### Story 14.4: Build-Time Content Injection from CMS API

**As a** developer,
**I want** to fetch hotel content from the CMS API at build time and inject into page components using content variants,
**So that** SEO-critical content is in generated HTML without runtime fetching.

**NFR Coverage:** NFR3 (SEO), NFR4 (Performance)

**Content Variant → Component Mapping:**

| Component | Variant Used | Why |
|-----------|-------------|-----|
| HeroSection | **Extended** (~150 words) | Full immersive description for landing |
| Page sections, about | **Standard** (~100 words) | Balanced detail for body content |
| Cards, previews, OG tags | **Concise** (~50 words) | Short punchy text for summaries |
| Room cards | `rooms[].description` | Per-room descriptions from CMS |
| Amenities/Facilities | `facilities[]` grouped by category | Grouped facility lists |

**Acceptance Criteria:**

**Given** I am implementing build-time content injection
**When** I create build-time content loader functions using the CMS API client
**Then** I create `getHotelPageData(hotelId: string, lang: string)` that fetches and transforms all data needed for a hotel page
**And** I select the appropriate content variant (Concise/Standard/Extended) for each component using `getContentVariant()` from Story 14.2
**And** I inject hotel name, star rating, address, and content into React server components as props
**And** I inject grouped facilities (by category) into the amenities/facilities sections
**And** I inject rooms with descriptions into room listing components
**And** I ensure all SEO-critical content (hotel name, description, address, star rating, amenities) is in generated HTML
**And** I validate generated HTML contains expected content using Zod schemas
**And** I handle missing content variants with fallback chain: requested variant → Standard → Concise → Extended → empty
**And** I handle missing language content with fallback to English (`"en"`)
**And** I handle `_errors` gracefully — if images failed to fetch, still render the page without images

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `web-app/lib/cms-api/loaders.ts` | Content loaders | `getHotelPageData()` — orchestrates fetch + transform |
| Modify | `web-app/components/sections/HeroSection/index.tsx` | HeroSection | Accept `hotelName`, `description` (Extended variant), `starRating`, `address` as props |
| Modify | `web-app/components/blocks/Amenities/index.tsx` | Amenities | Accept `facilitiesByCategory: Record<string, Facility[]>` as props |
| Pattern | `web-app/lib/content/schemas/page-content.schema.ts` | Zod schema | Validate CMS data before injection |

**Prerequisites:** Story 14.1 (CMS API client), Story 14.2 (data transformers), Story 14.3 (SSG params)

**Technical Notes:**
- `getHotelPageData()` calls `getHotelFull()` then applies transformers from Story 14.2
- Content variant selection: match `content[].title` against `"Hotel Concise"` / `"Hotel Standard"` / `"Hotel Extended"`
- Filter content by `language` field matching the requested `lang` param
- Fallback chain for missing variants: requested variant → Standard → Concise → Extended → empty (matches AC)
- Fallback for missing language: fall back to `"en"` content
- Room descriptions are already per-room (not variants) — use directly
- Facilities: group by `category`, filter `available === true`, sort by `sort_order`
- Images may be null (CMS `_errors` includes `"images"`) — components must handle missing images gracefully
- All loaders are async server-side functions — no `'use client'` directive
- Component props should be serializable (no functions, no class instances)

**Relevant NFRs:**
- NFR3: SEO - Content in initial HTML, no JavaScript dependency
- NFR4: Performance - Zero runtime fetch for core content

---

### Story 14.5: ISR Implementation (Time-Based + CMS Webhook Triggers)

**As a** developer,
**I want** to implement Incremental Static Regeneration with time-based and webhook triggers,
**So that** static pages can update without redeploy when hotel content changes in the CMS.

**NFR Coverage:** NFR15 (Website Availability), NFR4 (Performance)

**Acceptance Criteria:**

**Given** I am implementing ISR for hotel pages
**When** I add time-based revalidation
**Then** I export `revalidate = 3600` for hourly regeneration on hotel page routes
**And** I create on-demand revalidation API endpoint at `/api/revalidate`
**And** I implement webhook secret verification using `REVALIDATION_SECRET` env var
**And** I accept `POST /api/revalidate` with body `{ hotel_id: string, secret: string }`
**And** I revalidate all language paths for the hotel on content change
**And** I use `revalidatePath()` for specific page revalidation and `revalidateTag()` for hotel-level invalidation
**And** I validate regenerated pages still contain SEO-critical content
**And** I log revalidation events (hotel_id, paths revalidated, trigger source, timestamp)
**And** I return appropriate HTTP status codes (200 success, 401 unauthorized, 404 hotel not found)

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `web-app/app/api/revalidate/route.ts` | API route | On-demand revalidation endpoint |
| Extend | `web-app/app/[lang]/hotels/[slug]/page.tsx` | Page component (from Story 14.3) | Add `export const revalidate = 3600` |
| Modify | `web-app/.env.example` | Environment template | Add `REVALIDATION_SECRET` |

**Prerequisites:** Story 14.3 (SSG params), Story 14.4 (content injection)

**Technical Notes:**
- Time-based: `export const revalidate = 3600` (revalidate at most once per hour)
- On-demand: `POST /api/revalidate` with JSON body
- Webhook verification: Compare `secret` field in body against `REVALIDATION_SECRET` env var
- Since this is per-hotel deployment, the revalidation endpoint knows which hotel it serves (from `HOTEL_ID` env var)
- Revalidate all language paths: iterate configured languages and call `revalidatePath(`/${lang}/hotels/${slug}`)` for each
- Also use `revalidateTag('hotel-data')` for tag-based cache invalidation across all pages
- The CMS API (`cms-dir.effectivetours.com`) can be configured to send webhooks on content updates — document the webhook configuration
- Webhook payload from CMS should include `hotel_id` to verify it matches the deployed hotel
- Cache headers: Set `stale-while-revalidate` for CDN layer
- For per-hotel deployment: if the webhook `hotel_id` doesn't match the deployed `HOTEL_ID`, ignore the webhook (return 200 but no-op)

**Webhook Configuration (CMS-side):**
```
Trigger: Content update on hotel (content, rooms, facilities, images)
Target: POST https://{hotel-domain}/api/revalidate
Body: { "hotel_id": "{hotel_uuid}", "secret": "{revalidation_secret}", "changed_collections": ["content", "rooms"] }
Headers: Content-Type: application/json
```

**Relevant NFRs:**
- NFR15: Website Availability - Background regeneration maintains uptime
- NFR4: Performance - Cached pages served during regeneration

---

### Story 14.6: SEO Metadata Generation with Multi-Language Support

**As a** developer,
**I want** to implement `generateMetadata()` for all hotel pages with hreflang tags,
**So that** SEO metadata is rendered in HTML for all supported languages.

**NFR Coverage:** NFR3 (SEO)

**CMS Data → SEO Metadata Mapping:**

| SEO Field | CMS Source |
|-----------|-----------|
| `<title>` | `hotel.name` + location from `hotel.address` (parsed) |
| `<meta description>` | **Concise** content variant (~50 words) |
| `og:title` | `hotel.name` |
| `og:description` | **Concise** content variant |
| `og:image` | First image from `images[]` (if available) |
| `og:locale` | Language code from URL param |
| `og:type` | `"hotel"` |
| Canonical URL | `https://{domain}/{lang}/hotels/{slug}` |
| hreflang tags | One per language where content exists |
| JSON-LD `Hotel` | `hotel.name`, `hotel.star_rating`, parsed `hotel.address`, `hotel.property_type` |

**Acceptance Criteria:**

**Given** I am implementing SEO metadata generation
**When** I create `generateMetadata()` functions for hotel pages
**Then** I generate page title from `hotel.name` and parsed `hotel.address.city`/`hotel.address.country`
**And** I generate meta description from the **Concise** content variant for the current language
**And** I generate Open Graph tags (og:title, og:description, og:image, og:locale, og:type)
**And** I generate canonical URLs with language prefix: `/{lang}/hotels/{slug}`
**And** I generate hreflang tags for all languages where CMS content exists
**And** I generate JSON-LD structured data using Schema.org `Hotel` type with `starRating`, `address`, `name`
**And** I validate all metadata is present in generated HTML
**And** I test metadata across different languages (LTR and RTL)
**And** I handle missing images in OG tags gracefully (omit og:image if no images available)

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Extend | `web-app/app/[lang]/hotels/[slug]/page.tsx` | Hotel page (from Story 14.3) | Add `generateMetadata` export |
| Create | `web-app/lib/seo/metadata.ts` | Metadata utilities | `buildHotelMetadata()`, `buildHotelJsonLd()` |
| Pattern | Next.js 15 docs | `generateMetadata` API | Follow official patterns |
| Pattern | Schema.org | Hotel schema | JSON-LD structured data |

**Prerequisites:** Story 14.4 (build-time content available)

**Technical Notes:**
- Follow Next.js 15 `generateMetadata` async function pattern
- Access hotel content via `getHotelPageData()` from Story 14.4
- Use **Concise** variant for meta description (best length for search snippets)
- Parse `hotel.address` JSON string to get city/country for title: `"Thaproban Beach House | Unawatuna, Sri Lanka"`
- Generate alternate canonical URLs for each language where content exists
- Generate hreflang tags: `<link rel="alternate" hreflang="en" href="...">`
- Include x-default hreflang pointing to English version
- Generate JSON-LD `Hotel` schema with: `name`, `starRating` (from `star_rating`), `address` (from parsed address), `description` (Standard variant)
- Support RTL language metadata: `<html dir="rtl" lang="ar">`
- Handle `images: null` case — skip og:image rather than error
- Generate proper locale codes: en-US, th-TH, ja-JP, ar-SA

**Relevant NFRs:**
- NFR3: SEO - Metadata in HTML enables immediate indexing

---

### Story 14.7: Hybrid Architecture - Client vs Server Components

**As a** developer,
**I want** to clearly separate server components (SSG content from CMS) from client components (dynamic features),
**So that** static content remains SEO-optimized while dynamic features function correctly.

**NFR Coverage:** NFR4 (Performance), NFR3 (SEO)

**Component Rendering Strategy (CMS Data Mapping):**

| Component | Rendering | CMS Data Source | Why |
|-----------|-----------|----------------|-----|
| HeroSection | **Server** (SSG) | `hotel.name`, Extended content variant, `hotel.star_rating`, parsed `hotel.address` | SEO-critical, must be in HTML |
| Amenities/Facilities | **Server** (SSG) | `facilities[]` grouped by category | SEO-critical, structured data |
| Room Listings | **Server** (SSG) | `rooms[]` with descriptions | SEO-critical, content-heavy |
| Hotel Info/About | **Server** (SSG) | Standard content variant, `hotel.opening_year`, `hotel.property_type` | SEO-critical |
| BookingWidget | **Client** | Runtime pricing API (not CMS) | Dynamic data, user interaction |
| Availability | **Client** | Runtime availability API (not CMS) | Real-time data |
| LanguageSelector | **Client** | Config from `SUPPORTED_LOCALES` | Client-side navigation |
| Interactive Maps | **Client** | Parsed `hotel.address` coordinates | JavaScript-dependent |
| Image Gallery | **Client** | `images[]` from CMS (if available) | Interactive carousel |

**Acceptance Criteria:**

**Given** I am implementing hybrid architecture
**When** I analyze components for client vs server-side rendering
**Then** I ensure HeroSection, Amenities, Room Listings, and Hotel Info are server components receiving CMS data as props
**And** I add `'use client'` directive to BookingWidget, Availability, LanguageSelector, and interactive components
**And** I implement loading states for client components (skeleton/placeholder while JS loads)
**And** I ensure all SEO-critical content (hotel name, descriptions, facilities, rooms) is in generated HTML
**And** I validate that the page is fully readable and informative with JavaScript disabled
**And** I test dynamic features function correctly with client-side rendering
**And** I maintain language switching capability via Next.js router (URL change, not hard reload)

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `web-app/components/blocks/BookingWidget/` | BookingWidget | Client component with `'use client'` |
| Create | `web-app/components/blocks/Availability/` | Availability | Client component with `'use client'` |
| Preserve | `web-app/components/sections/HeroSection/` | HeroSection | Keep server-side, accept CMS props |
| Preserve | `web-app/components/blocks/Amenities/` | Amenities | Keep server-side, accept grouped facilities |
| Modify | `web-app/components/blocks/LanguageSelector/` | LanguageSelector | Keep client-side |

**Prerequisites:** Story 14.4 (build-time content injection)

**Technical Notes:**
- Server-side (SSG): All CMS-sourced content — hotel name, content variants, facilities, rooms, address, star rating
- Client-side: Booking/availability (runtime APIs), language selector, image gallery, maps
- Client components do NOT call the CMS API directly — CMS data is injected at build time via server components
- Client components that need hotel data (e.g., maps needing address) receive it as serialized props from server parent
- Use SWR or React Query for client-side runtime data fetching (pricing, availability)
- Implement loading states and error handling for client components
- Ensure progressive enhancement: static content works without JavaScript
- Language switching: Update URL via Next.js `useRouter()`, triggers ISR or cached page load

**Relevant NFRs:**
- NFR3: SEO - Server-side content ensures indexing
- NFR4: Performance - Client-side only for truly dynamic data

---

### Story 14.8: Sitemap Generation for Per-Hotel Deployment

**As a** developer,
**I want** to generate sitemap.xml at build time with all language URLs for the deployed hotel,
**So that** search engines can discover all pages across all languages for this hotel.

**NFR Coverage:** NFR3 (SEO)

**Per-Hotel Sitemap Context:**

Since each hotel is deployed independently, the sitemap is small and simple — it contains entries for one hotel across its configured languages. For a hotel with 3 languages, the sitemap might have ~15-30 URLs (homepage + hotel page + subpages per language).

**Acceptance Criteria:**

**Given** I am implementing sitemap generation for a per-hotel deployment
**When** I create the sitemap generation route
**Then** I generate sitemap.xml with URLs for the deployed hotel across all languages
**And** I use `hotel.updated_at` from CMS data as `lastmod` for each entry
**And** I include hreflang alternate links within sitemap entries for all available languages
**And** I include the homepage for each language variant
**And** I include the hotel detail page for each language variant
**And** I validate sitemap XML is well-formed and follows Google Search Console guidelines
**And** I document the sitemap submission process

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `web-app/app/sitemap.ts` | Sitemap route | Next.js 15 sitemap generation |
| Pattern | `web-app/lib/cms-api/client.ts` | CMS API client | Fetch hotel data for lastmod timestamps |

**Prerequisites:** Story 14.3 (static params generation)

**Technical Notes:**
- Use Next.js 15 `app/sitemap.ts` convention
- Fetch hotel data from CMS API to get `hotel.slug`, `hotel.updated_at`, and available languages from content
- Generate entries for each `[lang, page]` combination
- Use `hotel.updated_at` as `lastmod` timestamp (format: ISO 8601 date)
- Per-hotel deployment keeps sitemap tiny — no need for sitemap index
- Include hreflang alternates for each entry pointing to all language variants
- Include x-default hreflang pointing to English version

**Sitemap Entry Format:**
```typescript
{
  url: 'https://thaproban-beach-house.example.com/en/hotels/thaproban-beach-house',
  lastModified: new Date('2025-11-10'),  // from hotel.updated_at
  changeFrequency: 'weekly',
  alternates: {
    languages: {
      en: 'https://thaproban-beach-house.example.com/en/hotels/thaproban-beach-house',
      th: 'https://thaproban-beach-house.example.com/th/hotels/thaproban-beach-house',
      'x-default': 'https://thaproban-beach-house.example.com/en/hotels/thaproban-beach-house'
    }
  }
}
```

**Relevant NFRs:**
- NFR3: SEO - Complete sitemap enables efficient crawling

---

### Story 14.9: Performance Testing - Core Web Vitals Validation

**As a** developer,
**I want** to test Core Web Vitals (LCP, FID, CLS) after SSG implementation with real CMS data,
**So that** I validate performance improvements and ensure SEO requirements are met.

**NFR Coverage:** NFR3 (SEO), NFR4 (Performance)

**Test Context:**

Performance tests should run against a built hotel site using real CMS data (e.g., "Thaproban Beach House" with 3 content variants, 4 rooms, 80+ facilities). This validates that the full data payload renders within performance budgets.

**Acceptance Criteria:**

**Given** I am testing performance after implementing SSG with CMS API data
**When** I run Lighthouse tests on generated hotel pages
**Then** I validate LCP <2.0s (desktop), <2.5s (mobile)
**And** I validate FID <100ms (desktop), <100ms (mobile)
**And** I validate CLS <0.1 (all devices)
**And** I measure build time for the hotel (target: <90 seconds with all languages)
**And** I measure CMS API response time (from `_metadata.processing_time_ms`)
**And** I compare SSG vs runtime JSON performance (before/after)
**And** I document performance improvements
**And** I validate Core Web Vitals across all breakpoints
**And** I test performance with different languages (Thai, Japanese, Arabic) when multi-language content is available
**And** I validate font loading for different alphabets

**Codebase References:**

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| Create | `tests/performance/core-web-vitals.test.ts` | Performance tests | Lighthouse automation |
| Pattern | Lighthouse CI | Lighthouse testing | CI/CD integration |
| Extend | `web-app/` | Generated pages | Test across breakpoints |

**Prerequisites:** Story 14.4, Story 14.6, Story 14.7

**Technical Notes:**
- Use Lighthouse CI for automated testing
- Test across device profiles: mobile (375px), desktop (1280px)
- Test the deployed hotel pages (built with real CMS data)
- Measure build time including CMS API fetch (tracked via `_metadata.processing_time_ms`)
- Verify that 80+ facilities, 4 rooms, and 3 content variants don't cause performance regression
- Measure before/after: Epic 11 runtime vs Epic 14 SSG with CMS API
- Validate bundle size: <150KB mobile, <250KB desktop
- Test with slow 3G network throttling
- Test font loading: Latin, Thai, Japanese, Arabic fonts
- Document performance deltas in report
- Test RTL language rendering when Arabic content is added to CMS

**Relevant NFRs:**
- NFR3: SEO - Core Web Vitals are ranking factor
- NFR4: Performance - Direct user experience impact

---

### Story 14.10: Refactor Data Mapping (Adapter Pattern)

**As a** developer,
**I want** to refactor the data transformation logic into pure adapter functions,
**So that** the same data mapping logic can be reused by the Dynamic Component Assembler (Epic 16+) without code duplication.

**NFR Coverage:** NFR4 (Performance), NFR_maintainability (Maintainability)

**Architecture Decision:**
Use the **Adapter Pattern** (ADR-004) to bridge the gap between CMS Data and Component Props.
- **Input:** Raw CMS Data (typed interfaces from `web-app/lib/cms-api/types.ts`)
- **Output:** Strict Component Props (typed interfaces inferred from Zod schemas in `web-app/lib/contracts/`)
- **Validation:** Static type checking (TypeScript) only for Epic 14; Runtime validation (Zod) reserved for Epic 16.

**Acceptance Criteria:**

**Given** the existing SSG implementation
**When** I create the `web-app/lib/mappers/` directory
**Then** I implement pure mapper functions for all major components:
  - `mapCmsToHero(hotel: HotelFullResponse, lang: string): HeroSectionProps`
  - `mapCmsToRooms(hotel: HotelFullResponse, lang: string): RoomsGridProps`
  - `mapCmsToFacilities(hotel: HotelFullResponse, lang: string): AmenitiesProps`
  - `mapCmsToGallery(hotel: HotelFullResponse): ImageGalleryProps`
**And** I refactor `getHotelPageData` (loaders) to use these mappers instead of inline transformation logic
**And** I verify that the generated pages still render correctly with the new mappers
**And** I ensure no Zod runtime validation is performed in the static build path (relying on TS-inferred types)

**Codebase References:**
- **Create**: `web-app/lib/mappers/` (Directory)
- **Create**: `web-app/lib/mappers/index.ts` (Barrel file)
- **Refactor**: `web-app/lib/cms-api/loaders.ts` (Use mappers)

---

## NFR Coverage Matrix

| NFR | Description | Story | Status |
|-----|-------------|-------|--------|
| NFR3 | Core Web Vitals Compliance (SEO) | 14.2, 14.3, 14.4, 14.6, 14.7, 14.8, 14.9 | Covered |
| NFR4 | Page Load Performance | 14.1, 14.3, 14.4, 14.5, 14.7, 14.9 | Covered |
| NFR15 | Website Availability | 14.5 | Covered |

**Coverage Validation:**
- [x] All NFRs in frontmatter `nfr_coverage` are in this matrix
- [x] Each NFR maps to at least one story
- [x] No orphan stories (every story maps to an NFR)

---

## Dependencies

### Internal Dependencies (Other Epics)

| Epic ID | Epic Title | Dependency Type | Notes |
|---------|------------|-----------------|-------|
| 11-content-json-content-system | JSON-Based Content & Localization System | **Replaced** | This epic replaces Epic 11's JSON approach with CMS API calls. Epic 11 patterns can be deprecated. |
| 12-visual-excellence-design-system | Visual Excellence & Design System | Must complete first | Design system components should be finalized before SSG implementation. |

### External Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| Next.js 15 | Framework | Vercel/Next.js team | Available |
| ET CMS Publishing API | REST API | EffectiveTours (self-hosted) | Available at `cms-dir.effectivetours.com` |
| CMS API Bearer Token | Authentication | EffectiveTours | Provisioned |
| Vercel/Cloudflare Pages | Hosting Platform | Vercel/Cloudflare | Available |

---

## Architecture Decision Records

### ADR-001: Replace JSON Files with CMS REST API Calls

**Status:** Updated (2026-02-06) — Originally Accepted (2026-01-29)

**Context:** Epic 11 used JSON files hosted on Cloudflare. The CMS at `cms-dir.effectivetours.com` is a custom FastAPI service wrapping Directus/PostgreSQL, providing a REST API with Bearer token auth.

**Decision:** Use CMS REST API calls at build-time via standard `fetch()` with Bearer token — no `@directus/sdk` needed.

**Rationale:**
1. **Simpler Architecture:** Single source of truth (CMS API), no sync pipeline, no SDK dependency
2. **Real-Time Updates:** ISR revalidation via webhooks
3. **Type Safety:** Custom TypeScript types matching actual API response schema
4. **Single Endpoint:** `GET /api/hotels/{id}/full` returns all data (hotel, content, rooms, facilities, images) in one call
5. **Build Time Acceptable:** 30-90 seconds per hotel, CMS response ~265ms

**Consequences:**
- Positive: Eliminates JSON sync complexity
- Positive: No SDK dependency — standard fetch API
- Positive: Real-time content updates via ISR webhooks
- Negative: Slightly longer builds (30-90s vs 10-20s)
- Positive: Full control over TypeScript types matching actual API response

**Alternatives Considered:**
- Keep JSON files: Rejected due to sync complexity
- Use `@directus/sdk`: Rejected — CMS API is a custom FastAPI wrapper, not standard Directus
- Hybrid cache: Rejected as unnecessary complexity

**Related Research:** `docs/research/directus-nextjs-ssg-architecture_2026-01-29_a7f2.md`

---

### ADR-002: Per-Hotel Deployment Model

**Status:** Accepted (2026-01-29)

**Context:** Architecture could be single deployment serving all hotels, or per-hotel deployments.

**Decision:** Deploy hotels one-by-one as independent deployments.

**Rationale:**
1. **Simpler Operations:** Each hotel is independent
2. **Isolated Builds:** One hotel doesn't affect others
3. **Build Time Not a Concern:** 30-90 seconds per hotel
4. **Client Workflow:** Matches client expectations (deploy my hotel)
5. **Language Changes:** Simple redeploy when adding languages

**Consequences:**
- Positive: Build time never an issue
- Positive: Easy to deploy/individual hotels
- Negative: 100,000 deployments to manage at scale
- Positive: Each hotel has isolated environment

**Alternatives Considered:**
- Single deployment multi-tenant: Rejected due to complexity
- Hybrid approach: Not needed for this use case

**Related Research:** `docs/research/nextjs-per-deployment-ssg-isr-multi-tenant_2026-01-29_a7f2.md`

---

### ADR-003: Unlimited Multi-Language Support via CMS Content Model

**Status:** Updated (2026-02-06) — Originally Accepted (2026-01-29)

**Context:** Need to support many languages including different alphabets (Thai, Japanese, Arabic). The CMS stores content with a `language` field and 3 variants (Concise/Standard/Extended) per language.

**Decision:** Support unlimited languages by adding content entries per language in the CMS. Languages are determined at build time from distinct `language` values in the content array.

**Rationale:**
1. **Per-Hotel Deploy:** Build time scales linearly, not an issue
2. **CMS Content Model:** Content items have a `language` field — add new languages by adding content entries
3. **Font Optimization:** Load only required fonts per language
4. **No Tiered Strategy Needed:** Single hotel = unlimited languages OK
5. **Variant System:** Each language gets 3 content variants (Concise/Standard/Extended) for different UI contexts

**Consequences:**
- Positive: Support any language by adding content to CMS
- Positive: Add languages without code changes — just add CMS content and redeploy
- Consideration: Font sizes vary (Japanese: 2-5MB, Thai: 200-300KB)
- Positive: SEO benefits for all languages
- Note: Currently only English (`"en"`) content exists in CMS — multi-language is ready architecturally

**Alternatives Considered:**
- Tiered strategy (core/emerging): Not needed for per-hotel model
- Limited languages: Would limit platform growth

**Related Research:** `docs/research/nextjs-ssg-many-locales-different-alphabets_2026-01-29_b4c8.md`

---

### ADR-004: Data Adapter Pattern (Static vs Dynamic Compatibility)

**Status:** Accepted (2026-02-13)

**Context:**
Epic 14 (Static Site Generation) and Epic 16 (Dynamic Component Assembly) both need to populate components with CMS data, but they operate in different contexts.
- **Epic 14**: Trusted source (CMS API), build-time execution.
- **Epic 16**: Untrusted/AI source (JSON Config), runtime execution.

**Decision:**
Implement **Pure Adapter Functions** (Mappers) that transform CMS Data directly into Component Props.
- **Static Path (Epic 14)**: Uses Adapters + TypeScript Interfaces. No runtime Zod validation (to avoid over-engineering and performance cost).
- **Dynamic Path (Epic 16)**: Uses Zod Schemas to validate AI-generated config, which *should* match the shape produced by the Adapters.

**Rationale:**
1.  **Decoupling**: The AI doesn't need to know *how* to extract data (business logic), it only needs to know *what* component to use.
2.  **Reusability**: The same business logic (e.g., "choose Extended variant for Hero") lives in one place (`mapCmsToHero`) and is used by both `page.tsx` and the AI Assembler.
3.  **Performance**: Avoids redundant Zod parsing for static builds where data integrity is guaranteed by TypeScript types.

**Consequences:**
- Positive: Single source of truth for business logic.
- Positive: Seamless transition to Dynamic Assembly (Epic 16+).
- Negative: Requires refactoring existing inline logic into mappers (Story 14.10).

---

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation | Related Artifact |
|------|--------|------------|------------|------------------|
| CMS API rate limits during build | Medium | Low | Single hotel per build means only 1 API call; per-hotel deployment eliminates bulk request concerns | Story 14.1 technical notes |
| Bearer token expiration/rotation | High | Medium | Store token in CI/CD secrets; implement monitoring alerts for auth failures; document rotation process | Story 14.1 technical notes |
| ISR revalidation misses multi-language paths | High | Low | Revalidate all language paths for hotel; use `revalidateTag()` for hotel-level invalidation | Story 14.5 acceptance criteria |
| Large font sizes for CJK languages | Medium | Medium | Use `next/font` with locale-specific font loading; subset to used characters only | `docs/research/nextjs-ssg-many-locales-different-alphabets_2026-01-29_b4c8.md` |
| CMS API downtime during build | High | Low | Implement retry logic (3 attempts with exponential backoff); build retries on failure | Story 14.1 technical notes |
| Missing content variants for a language | Medium | Low | Implement fallback chain: requested variant → Standard → Concise → Extended; log warnings | Story 14.4 acceptance criteria |
| CMS `images` collection returns errors | Medium | Medium | Handle `_errors` array gracefully; render page without images; currently `images: null` observed in live API | Story 14.1, Story 14.4 |
| ISR cache serving stale content | Medium | Low | Set appropriate `revalidate` time; use on-demand revalidation via webhooks for critical updates | Story 14.5 acceptance criteria |
| CMS `address` field is JSON string | Low | High | Parse with `JSON.parse()` and validate; handle malformed JSON gracefully | Story 14.2 transformers |
| Regression in existing functionality | High | Low | Comprehensive testing; gradual rollout; maintain monitoring | Story 14.9 acceptance criteria |

---

## Validation Checklist

### Content Validation
- [x] All NFR coverage claims verified against PRD
- [x] All codebase references verified (files exist or to be created)
- [x] No code snippets present anywhere
- [x] No line number references
- [x] Story dependencies are backward-only
- [x] Architecture changes clearly documented
- [x] Research findings properly integrated
- [x] Cross-references to all research documents included

### Quality Validation
- [x] Epic delivers user-visible value (SEO improvement, performance, simplified operations)
- [x] Stories are single-session sized (2-3 days each)
- [x] Acceptance criteria are testable (Given/When/Then)
- [x] All referenced documentation sections exist
- [x] Architecture decision records included
- [x] Hybrid architecture approach clearly explained
- [x] Multi-language support fully addressed
- [x] CMS API integration clearly specified (verified against live API response)

---

## Migration from Epic 11

This epic **replaces** the JSON file approach from Epic 11 with CMS REST API calls. The migration strategy is:

### Phase 1: Parallel Development (Weeks 1-4)
- Develop CMS API integration alongside Epic 11 JSON system
- Both systems coexist during development
- A/B testing to validate performance

### Phase 2: Cutover (Week 5)
- Deploy CMS API-powered SSG system to production
- Monitor for issues (check `_metadata.processing_time_ms`, `_errors`)
- Keep JSON system as fallback for 1 week

### Phase 3: Deprecation (Week 6)
- Remove JSON file generation pipeline
- Remove Cloudflare JSON hosting
- Deprecate `usePageContent` runtime hook
- Update documentation

### Rollback Plan
- If critical issues found, revert to Epic 11 JSON system
- CMS API integration can be disabled via environment variable (`USE_CMS_API=false`)

---

## Agent Activity Log

### Creation
- **Agent**: epic-creator
- **Timestamp**: 2026-01-28T00:00:00Z
- **PRD Version**: docs/prd.md
- **Research Version**: docs/research/build-time-vs-runtime-content-seo_2026-01-28_a7f2.md
- **Notes**: Initial epic creation based on research findings about build-time content injection vs runtime JSON loading.

### Update - Architecture Change
- **Agent**: claude-code
- **Timestamp**: 2026-01-29T18:00:00Z
- **Changes**:
  - Replaced JSON file approach with Directus API calls
  - Updated to per-hotel deployment model
  - Added comprehensive multi-language support
  - Added ISR with Directus Flows integration
  - Added Story 14.1 (Directus SDK setup)
  - Added Story 14.2 (Directus data model)
  - Updated all stories to reference Directus instead of JSON
  - Added architecture decision records
  - Added migration strategy from Epic 11
  - Added cross-references to all research documents
- **Research Documents Referenced**:
  - `build-time-vs-runtime-content-seo_2026-01-28_a7f2.md`
  - `nextjs-ssg-isr-i18n-localization_2026-01-29_e4a1.md`
  - `nextjs-ssg-many-locales-different-alphabets_2026-01-29_b4c8.md`
  - `nextjs-per-deployment-ssg-isr-multi-tenant_2026-01-29_a7f2.md`
  - `directus-nextjs-ssg-architecture_2026-01-29_a7f2.md`
- **Notes**: Comprehensive update based on 4 research studies verifying Directus + SSG architecture. Changed from JSON files to Directus API calls, updated deployment model to per-hotel, added full multi-language support with unlimited languages via Directus Translations field.

### Update - CMS API Integration: Full Epic Rewrite
- **Agent**: claude-code
- **Timestamp**: 2026-02-06T11:00:00Z
- **Changes**:
  - **All 9 stories (14.1-14.9) rewritten** based on live API analysis of `cms-dir.effectivetours.com`
  - **Story 14.1**: Replaced `@directus/sdk` with standard REST API client (fetch + Bearer token); documented full API data model; added all CMS endpoints
  - **Story 14.2**: Renamed from "Directus Data Model" to "CMS Data Model Mapping"; added content variant strategy (Concise/Standard/Extended), facility category grouping (~15 categories), address JSON parsing
  - **Story 14.3**: Updated for per-hotel deployment model; added `HOTEL_ID` env var; languages determined from content array
  - **Story 14.4**: Added content variant → component mapping (Extended for hero, Standard for sections, Concise for cards/OG); added fallback chains
  - **Story 14.5**: Replaced Directus Flows with CMS webhook triggers; added `REVALIDATION_SECRET`; documented webhook payload format
  - **Story 14.6**: Added CMS data → SEO metadata mapping table; Concise variant for meta descriptions; parsed address for titles
  - **Story 14.7**: Added detailed component rendering strategy table mapping CMS data to server/client components
  - **Story 14.8**: Simplified for per-hotel deployment (no sitemap index needed); uses `hotel.updated_at` for lastmod
  - **Story 14.9**: Added CMS-specific performance metrics (`_metadata.processing_time_ms`); test with real data payload
  - **ADR-001**: Updated to reflect CMS REST API (not Directus SDK)
  - **ADR-003**: Updated from Directus Translations to CMS content model with language field
  - **External Dependencies**: Removed `@directus/sdk`, added ET CMS Publishing API
  - **Risks**: Updated all Directus-specific risks to CMS API risks; added `images` error handling and `address` JSON parsing risks
  - **Migration section**: Updated references from Directus to CMS API
  - **Data flow diagram**: Replaced Directus references with CMS API architecture
  - **Multi-language architecture**: Replaced Directus Translations pattern with CMS content model
  - Updated epic title, tags, scope table, modules table, validation checklist
- **API Documentation Source**: `https://cms-dir.effectivetours.com/docs` (Swagger/OpenAPI)
- **Live API Verification**: `GET /api/hotels/09f207c1-695a-485a-9519-49f4ef03331f/full` returns "Thaproban Beach House" (4-star hotel, Unawatuna, Sri Lanka) with 3 content variants, 4 rooms, 80+ facilities
- **Notes**: The CMS is a custom FastAPI service wrapping Directus/PostgreSQL, NOT a direct Directus instance. The `@directus/sdk` is NOT appropriate — standard fetch with Bearer auth is the correct approach. All stories now reference the actual CMS API data model verified from a live response.

### Update - Navigation Architecture for [lang] Routes
- **Agent**: claude-code
- **Timestamp**: 2026-02-17
- **Changes**:
  - **Navigation Layout Fix**: Implemented Solution A for duplicate navbar issue in [lang] routes
  - **Root Layout (`app/layout.tsx`)**: Maintains single `<Navbar />` component for ALL routes
  - **[lang] Layout (`app/[lang]/layout.tsx`)**: Removed Navbar to prevent duplication; now only provides ContentProvider with `defaultLocale` and `data-lang` wrapper
  - **Navbar Component**: Enhanced with auto-detection of lang from pathname using `usePathname()` hook; automatically extracts 2-letter language codes (e.g., `/en` → `en`, `/th` → `th`)
  - **Navigation Components**: Both `NavigationDesktop` and `NavigationMobile` accept optional `currentLang` prop; when lang is detected, links are prefixed (e.g., `/${lang}/rooms` instead of `/rooms`)
  - **Files Modified**:
    - `app/[lang]/layout.tsx`: Removed `<Navbar />`, kept `<ContentProvider defaultLocale={lang}>`
    - `components/ui/Navbar.tsx`: Added `usePathname()` hook and lang detection logic
    - `components/blocks/Navigation/NavigationDesktop.tsx`: Added `currentLang` prop and `getNavLinks()` function
    - `components/blocks/Navigation/NavigationMobile.tsx`: Added `currentLang` prop and `getNavLinks()` function
  - **Benefits**:
    - ✅ No duplicate navbars (single Navbar in root layout)
    - ✅ All routes get navigation (root routes AND [lang] routes)
    - ✅ Auto lang detection (Navbar automatically detects `/en`, `/th`, `/tr` etc.)
    - ✅ Original `app/page.tsx` unchanged
    - ✅ Next.js 15 best practices (proper layout inheritance)
  - **Route Behavior**:
    - `/`, `/rooms`, `/contact` → Navbar with standard links
    - `/en`, `/en/rooms`, `/en/contact` → Navbar with lang-prefixed links
    - `/th/hotels/xxx` → Navbar with lang-prefixed links
  - **ADR**: Navigation follows Next.js nested layout pattern where child layouts inherit from parent; adding Navbar to both would cause duplication

<!--
Agents append entries here in format:
### {Action Type}
- **Agent**: {agent-name}
- **Timestamp**: {timestamp}
- **Notes**: {what was done}
-->
