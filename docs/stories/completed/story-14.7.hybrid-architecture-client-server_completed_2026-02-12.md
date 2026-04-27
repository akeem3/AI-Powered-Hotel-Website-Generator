---
type: story
id: "14.7.hybrid-architecture-client-server"
status: done
priority: medium
epic_number: 14
story_number: 7
created_at: "2026-02-10T13:35:00+08:00"
updated_at: "2026-02-12T18:00:00+08:00"
created_by: story-creator-v2
updated_by: dev-agent
tags: [architecture, rsc, client-components, hydration, next.js, security, xss]
archival_date: 2026-02-12
---

# Story: Hybrid Architecture - Client vs Server Components

## 1. The "Why" (Rationale)
To ensure optimal SEO while supporting dynamic user interactions, the architecture must strictly separate server components (SSG content from CMS) from client components (dynamic features). This ensures critical content is indexable and interactive elements function correctly without hydration mismatches.

## 2. The "What" (Description)
Implementation of a hybrid architecture that enforces the boundary between Server and Client components. Server components are used for static content injection, while Client components are reserved for interactive features, marked with `'use client'`.

## 3. The "How" (Acceptance Criteria)
- [x] **AC1**: Server components identified (Hero, Amenities, RoomList, HotelInfo) - implemented to receive CMS props
- [x] **AC2**: Client components identified (BookingWidget, LanguageSelector, Maps, Gallery) - marked with `'use client'`
- [x] **AC4**: SEO-critical content verified to be in Server Components
- [x] **AC6**: Page functionality verified with JavaScript disabled (progressive enhancement)
- [x] **AC7**: Props serialization boundary verified (JSON-serializable data between Server/Client)

## 4. The "Where" (Impact Analysis)

### Implemented Files
- `web-app/components/sections/HeroSection/HeroContent.tsx`
- `web-app/components/blocks/Amenities/index.tsx`
- `web-app/components/blocks/RoomCard/RoomCardList.tsx`
- `web-app/components/sections/HotelInfo/index.tsx`
- `web-app/components/blocks/BookingWidget/index.tsx`
- `web-app/components/blocks/LanguageSelector/index.tsx`
- `web-app/components/sections/ContactMap/index.tsx`
- `web-app/components/blocks/ImageGallery/index.tsx`

### Test Files
- `web-app/tests/hybrid-architecture/seo-verification.test.tsx`
- `web-app/tests/hybrid-architecture/progressive-enhancement.test.tsx`
- `web-app/tests/hybrid-architecture/server-client-boundary.test.tsx`
- `web-app/tests/hybrid-architecture/hydration.test.tsx`
