---
type: story
id: "14.8.sitemap-generation"
status: done
priority: medium
epic_number: 14
story_number: 8
created_at: "2026-02-10T13:35:00+08:00"
updated_at: "2026-02-12T00:00:00+08:00"
created_by: story-creator-v2
updated_by: qa (Quinn)
tags: [seo, sitemap, xml, next.js]
archival_date: 2026-02-12
---

# Story: Sitemap Generation for Per-Hotel Deployment

## 1. The "Why" (Rationale)
Each hotel deployment needs its own `sitemap.xml`. Since the `HOTEL_ID` and its content are known at build time, a static sitemap listing the homepage and subpages for all available languages is required to ensure search engines can discover all pages across all languages for the deployed hotel.

## 2. The "What" (Description)
Implementation of a static sitemap generation mechanism using Next.js 15 native APIs that runs at build time. It fetches hotel data and available languages to generate a compliant `sitemap.xml` that includes `hreflang` alternates for SEO optimization.

## 3. The "How" (Acceptance Criteria)
- [x] **AC1**: `app/sitemap.ts` implemented using Next.js 15 sitemap generation
- [x] **AC2**: Sitemap includes homepage URLs for all language variants
- [x] **AC3**: Sitemap includes hotel detail page URLs for all language variants
- [x] **AC4**: `lastmod` field populated using `hotel.updated_at` from CMS
- [x] **AC5**: `alternates` (hreflang) included in sitemap entries for each URL
- [x] **AC6**: `x-default` alternate link included (pointing to English)
- [x] **AC7**: Validated XML output format
- [x] **AC8**: Validated that it only contains URLs for the configured `HOTEL_ID`
- [x] **AC9**: Documentation added for sitemap submission

## 4. The "Where" (Impact Analysis)

### Implemented Files
- `web-app/app/sitemap.ts`

### Reference Files
- `web-app/lib/cms-api/client.ts`
- `web-app/lib/cms-api/transformers.ts`
- `web-app/lib/cms-api/types.ts`
- `web-app/lib/cms-api/schemas.ts`
