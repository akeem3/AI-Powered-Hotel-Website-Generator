# Hybrid Architecture Plan: Server vs Client Components

> **Story:** 14.7 - Hybrid Architecture - Client vs Server Components
> **Created:** 2026-02-11
> **Purpose:** Definitive reference for server/client component boundaries and refactoring strategy

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Component Classification](#component-classification)
3. [Current State Analysis](#current-state-analysis)
4. [Target Architecture](#target-architecture)
5. [Refactoring Strategy](#refactoring-strategy)
6. [Component-by-Component Plan](#component-by-component-plan)
7. [Data Flow Architecture](#data-flow-architecture)
8. [Composition Patterns](#composition-patterns)
9. [Acceptance Criteria Mapping](#acceptance-criteria-mapping)

---

## Executive Summary

### Problem Statement

Current implementation incorrectly marks content-displaying components as Client Components (`'use client'`), which:
- Reduces SEO effectiveness (content not in initial HTML)
- Increases client-side JavaScript bundle size
- Prevents proper SSG optimization
- Causes potential hydration mismatches

### Solution

Implement proper Server/Client component separation following Next.js 15 / React 19 patterns:
- **Server Components**: Static content from CMS (Hero, Amenities, RoomList, HotelInfo)
- **Client Components**: Interactive features (BookingWidget, Gallery, Maps, LanguageSelector)
- **Hybrid Components**: Server content with optional Client interactive wrappers

### Key Principles

1. **Server-First Default**: All components are Server Components by default
2. **Minimal Client Boundary**: Push interactivity to the leaves of the component tree
3. **Composition Pattern**: Use `children` prop to pass Server Components into Client slots
4. **Serializable Props Only**: Only JSON-serializable data crosses Server→Client boundary

---

## Component Classification

### Tier 4: Page Level (Server Components)

Since Epic 24, pages live under `app/[lang]/` with the `[lang]` parameter enabling i18n support:

```
app/[lang]/page.tsx                  # Homepage
app/[lang]/rooms/page.tsx            # Rooms listing
app/[lang]/rooms/[slug]/page.tsx     # Individual room detail
app/[lang]/contact/page.tsx          # Contact page
app/[lang]/about/page.tsx            # About page
app/[lang]/gallery/page.tsx          # Gallery page
app/[lang]/faq/page.tsx              # FAQ page
├── Type: Server Component (async function)
├── Data Source: getHotelFull() / getRoomsPageData() / etc. - server-side CMS fetch via Directus
├── Responsibility: Compose sections, fetch data, metadata generation
└── Status: ✅ CORRECT
```

Old `app/(site)/` routes are redirect stubs pointing to the new `app/[lang]/` paths.

### Tier 3: Sections

| Component | Current | Target | Reason | Status |
|-----------|---------|--------|--------|--------|
| **HeroSection** | Client | Hybrid (Server + Client wrapper) | Content from CMS, animations optional | 🔴 NEEDS FIX |
| **Amenities** | Client | Server | Static CMS content only | 🔴 NEEDS FIX |
| **RoomsGrid** | (check) | Server | Static room listing | 🟡 TO VERIFY |
| **ContactForm** | (check) | Server | Form with Client submit handler | 🟡 TO VERIFY |
| **ContactMap** | Missing | Client | Map interactions, doesn't support SSR | 🟢 TO CREATE |
| **Testimonials** | Client | Hybrid (Server + Client carousel) | Content from CMS, carousel optional | 🔴 NEEDS FIX |
| **GallerySection** | (check) | Client | Lightbox interactions | 🟡 TO VERIFY |

### Tier 2: Blocks

| Component | Current | Target | Reason | Status |
|-----------|---------|--------|--------|--------|
| **Navigation** | Client | Client | Menu state, mobile toggle | ✅ CORRECT |
| **BookingWidget** | Client | Client | Form interactions, validation | ✅ CORRECT |
| **ImageGallery** | Client | Client | Lightbox, carousel interactions | ✅ CORRECT |
| **LanguageSelector** | Client | Client | Locale switching with Link/Router | ✅ CORRECT |
| **RoomCard** | Client | Hybrid (Server + Client button) | Content from CMS, booking button interactive | 🔴 NEEDS FIX |
| **HotelInfo** | Missing | Server | Static hotel information | 🟢 TO CREATE |

### Tier 1: UI Primitives (Mostly Server-Friendly)

| Component | Current | Target | Reason | Status |
|-----------|---------|--------|--------|--------|
| **Button** | Server | Server | No interactivity (uses Link for navigation) | ✅ CORRECT |
| **Card** | Server | Server | Static content container | ✅ CORRECT |
| **Input** | Client | Client | Form input requires state | ✅ CORRECT |
| **Select** | Client | Client | Form input requires state | ✅ CORRECT |

---

## Current State Analysis

### Issue 1: Unnecessary Client Components

**Components incorrectly marked as Client:**

```tsx
// ❌ CURRENT: HeroSection is a Client Component
'use client';
export default function HeroSection(rawProps: HeroSectionProps) {
  const contentResult = usePageContent(hotelId, 'homepage', 'en'); // Client-side fetch!
  // ... framer-motion animations
}
```

**Problems:**
1. `usePageContent` hook requires `'use client'`
2. Framer Motion requires `'use client'`
3. Content not available for SEO (rendered client-side)
4. Larger JS bundle sent to browser

### Issue 2: Data Fetching on Client Side

**Current pattern (wrong):**
```
Server Component (page.tsx)
    └── Client Component (HeroSection)
            └── usePageContent() → Client-side CMS fetch ❌
```

**Correct pattern:**
```
Server Component (page.tsx)
    ├── getHotelPageData() → Server-side CMS fetch ✅
    └── Server Component (HeroSection) ← Receives data as props ✅
            └── Optional Client Wrapper (animations) ✅
```

### Issue 3: Missing Composition Pattern

Current implementation doesn't use the composition pattern for mixing Server and Client components.

---

## Target Architecture

### Data Flow: Server-Side Fetching

```
┌─────────────────────────────────────────────────────────────────┐
│ PAGE: Server Component                                          │
│ app/[lang]/page.tsx          → getHotelFull(hotelId, lang)      │
│ app/[lang]/rooms/page.tsx    → getRoomsPageData(hotelId, lang)  │
│ app/[lang]/contact/page.tsx  → getContactPageData(hotelId, lang)│
│ app/[lang]/gallery/page.tsx  → getGalleryPageData(hotelId, lang)│
│ app/[lang]/about/page.tsx    → getAboutPageData(hotelId, lang)  │
│                                                                 │
│ 1. Fetch page-specific data via CMS functions (Directus)        │
│ 2. Pass data as props to sections                               │
│ 3. Generate metadata for SEO                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ SECTIONS: Server Components (receive props)                     │
│                                                                 │
│ <HeroSection {...heroData} />                                   │
│ <Amenities facilities={facilities} />                           │
│ <RoomCardList rooms={rooms} />                                  │
│ <HotelInfo hotel={hotel} />                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ INTERACTIVE: Client Components (optional wrappers)              │
│                                                                 │
│ <AnimatedWrapper>                                              │
│   <HeroContent />  ← Still Server Component!                   │
│ </AnimatedWrapper>                                             │
│                                                                 │
│ <ClientCarousel>                                               │
│   <TestimonialCards /> ← Server Components as children!        │
│ </ClientCarousel>                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy (Target)

```
page.tsx (Server)
│
├── JsonLdScript (Server) - SEO structured data
│
├── HeroSection (Server)
│   └── [optional] HeroAnimated (Client) - framer-motion wrapper
│
├── Amenities (Server) - Pure content display
│
├── RoomsGrid (Server)
│   └── RoomCard (Server)
│       └── RoomBookingButton (Client) - only the button is interactive
│
├── HotelInfo (Server) - NEW component
│
├── Testimonials (Server)
│   └── [optional] TestimonialCarousel (Client) - carousel wrapper
│
├── ImageGallery (Client) - Lightbox requires interactivity
│
├── BookingWidget (Client) - Form interactions
│
├── ContactMap (Client) - Map with SSR guard
│
└── Navigation (Client) - Menu state
```

---

## Refactoring Strategy

### Pattern 1: Pure Server Component Conversion

**For components with NO interactivity:**

**Before:**
```tsx
'use client';  // ❌ Unnecessary
export default function Amenities({ amenities, variant }) {
  const contentResult = usePageContent(...);  // ❌ Client fetch
  return <section>{amenities.map(...)}</section>;
}
```

**After:**
```tsx
// No 'use client' directive ✅
export default function Amenities({ amenities, variant }) {
  // Data received as props from parent Server Component ✅
  return <section>{amenities.map(...)}</section>;
}
```

### Pattern 2: Hybrid Server + Optional Client Wrapper

**For components with OPTIONAL interactivity:**

**Structure:**
```
HeroSection.server.tsx (or just HeroSection.tsx)
├── Renders content server-side
├── Accepts `enableAnimations?: boolean` prop
└── Conditionally wraps in HeroAnimated.client.tsx
```

**Implementation:**
```tsx
// HeroSection.tsx - Server Component
import { HeroAnimated } from './HeroAnimated';

type HeroSectionProps = {
  title: string;
  headline: string;
  enableAnimations?: boolean;
};

export default function HeroSection({ title, headline, enableAnimations = false }: HeroSectionProps) {
  const content = (
    <section>
      <h1>{title}</h1>
      <p>{headline}</p>
    </section>
  );

  if (enableAnimations) {
    return <HeroAnimated>{content}</HeroAnimated>;
  }

  return content;
}
```

```tsx
// HeroAnimated.tsx - Client Component
'use client';
import { motion } from 'framer-motion';

export function HeroAnimated({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
```

### Pattern 3: Composition with Children Slot

**For interactive containers with server-rendered content:**

```tsx
// TestimonialCarousel.client.tsx - Client Component
'use client';
import { useState } from 'react';

export function TestimonialCarousel({ children }: { children: React.ReactNode }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="carousel">
      {childrenArray[currentIndex]}
      <button onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}>Prev</button>
      <button onClick={() => setCurrentIndex((i) => Math.min(childrenArray.length - 1, i + 1))}>Next</button>
    </div>
  );
}
```

```tsx
// Testimonials.tsx - Server Component
import { TestimonialCarousel } from './TestimonialCarousel';
import { TestimonialCard } from './TestimonialCard';

export default function Testimonials({ testimonials, enableCarousel = false }: TestimonialsProps) {
  const cards = testimonials.map(t => <TestimonialCard key={t.id} {...t} />);

  if (enableCarousel) {
    return <TestimonialCarousel>{cards}</TestimonialCarousel>;
  }

  return <div className="grid">{cards}</div>;
}
```

### Pattern 4: SSR Guard for Third-Party Libraries

**For libraries that don't support SSR (e.g., Leaflet maps):**

```tsx
// ContactMap.client.tsx
'use client';

import dynamic from 'next/dynamic';

// Lazy load with SSR disabled
const Map = dynamic(() => import('./MapImpl'), { ssr: false });

export function ContactMap(props: MapProps) {
  return <Map {...props} />;
}
```

---

## Component-by-Component Plan

### HeroSection (Phase 2)

**Current:** Client Component with framer-motion + usePageContent
**Target:** Server Component with optional Client animation wrapper

**Steps:**
1. Remove `'use client'` from main HeroSection component
2. Remove `usePageContent` hook (data comes from props)
3. Extract framer-motion logic to `HeroAnimated.client.tsx`
4. Add `enableAnimations?: boolean` prop
5. Use composition: wrap content in `HeroAnimated` when enabled

**Files:**
- `components/sections/HeroSection/index.tsx` → Server Component
- `components/sections/HeroSection/HeroAnimated.client.tsx` → New Client wrapper

### Amenities (Phase 3)

**Current:** Client Component with usePageContent
**Target:** Pure Server Component

**Steps:**
1. Remove `'use client'` directive
2. Remove `usePageContent` hook
3. Remove all loading skeleton logic (not needed for Server Component)
4. Data received as props from parent
5. Keep layout routing (grid/list/featured) - this is just conditional rendering

**Files:**
- `components/blocks/Amenities/index.tsx` → Convert to Server Component

### Testimonials (Phase 4)

**Current:** Client Component with usePageContent
**Target:** Server Component with optional Client carousel wrapper

**Steps:**
1. Remove `'use client'` from main Testimonials component
2. Remove `usePageContent` hook
3. Move carousel logic to `TestimonialCarousel.client.tsx`
4. Use composition pattern with children prop
5. Keep grid layout as default (server-rendered)

**Files:**
- `components/blocks/Testimonials/index.tsx` → Convert to Server Component
- `components/blocks/Testimonials/TestimonialCarousel.client.tsx` → Ensure proper boundary

### HotelInfo (Phase 5)

**Current:** Does not exist
**Target:** New Server Component

**Content to Display:**
- Hotel name and description
- Address (parsed from CMS)
- Contact information (phone, email)
- Check-in/check-out times
- Policies (if available)

**Files:**
- `components/sections/HotelInfo/index.tsx` → New Server Component

---

## Data Flow Architecture

### Before Refactoring

```
Request → page.tsx (Server)
         ↓
         Pass empty/minimal props
         ↓
         Client Component (HeroSection)
         ↓
         usePageContent() → Client-side API call ❌
         ↓
         Render content (not in initial HTML)
```

### After Refactoring

```
Request → page.tsx (Server)
         ↓
         getHotelPageData() → Server-side API call ✅
         ↓
         Pass complete data as props
         ↓
         Server Component (HeroSection)
         ↓
         Render content (included in initial HTML) ✅
         ↓
         [Optional] Client wrapper for animations
```

---

## Composition Patterns

### Pattern Catalog

| Pattern | Use Case | Server | Client | Example |
|---------|----------|--------|--------|---------|
| **Pure Server** | Static content only | ✅ | ❌ | Amenities |
| **Pure Client** | Interactive only | ❌ | ✅ | BookingWidget |
| **Hybrid (Wrapper)** | Content + optional animations | ✅ | ✅ wrapper | HeroSection |
| **Slot Composition** | Interactive container | ✅ children | ✅ container | TestimonialCarousel |
| **SSR Guard** | Third-party lib | ❌ | ✅ with `ssr: false` | ContactMap |

### Composition Examples

#### Example 1: Hero Section with Optional Animations

```tsx
// Server Component receives data from page
<HeroSection
  title={hero.title}
  headline={hero.headline}
  description={hero.description}
  enableAnimations={false}  // Production: false for SEO
>
  {/* CTAs are Server Components using Link */}
  <Button asChild>
    <Link href="/rooms">View Rooms</Link>
  </Button>
</HeroSection>
```

#### Example 2: Testimonials with Carousel

```tsx
// Server Component
<Testimonials
  testimonials={testimonials}
  layout="carousel"  // Enables client-side carousel
>
  {/* Each testimonial card is a Server Component */}
</Testimonials>
```

---

## Acceptance Criteria Mapping

### AC1: Server Components Identified

| Component | Phase | Evidence |
|-----------|-------|----------|
| Hero | 2 | No `'use client'`, receives props, content in HTML |
| Amenities | 3 | No `'use client'`, receives props |
| RoomList | 6 | No `'use client'`, cards are Server Components |
| HotelInfo | 5 | New Server Component |

### AC2: Client Components Marked

| Component | Evidence |
|-----------|----------|
| BookingWidget | Has `'use client'`, form interactions |
| Availability | Part of BookingWidget |
| LanguageSelector | Has `'use client'`, Link/Router navigation |
| Maps | Has `'use client'`, SSR guard |
| Gallery | Has `'use client'`, lightbox interactions |

### AC3: Loading States

Client Components will show loading states while:
- Booking widget fetches prices
- Gallery images load
- Map tiles load

### AC4: SEO Content in Server Components

Verification method:
```bash
curl http://localhost:3000/en/hotels/thaproban-beach-house | grep -o "<h1>.*</h1>"
# Should show hotel name in HTML
```

### AC5: Interactive Features Work

- Maps: Interactive, zoom, pan
- Language switching: Uses Link, soft navigation
- Gallery: Lightbox opens, carousel works

### AC6: JavaScript Disabled

Test method:
```bash
# Disable JS in browser
# Navigate to hotel page
# Verify: Content visible, booking shows "Call to book" link
```

### AC7: TypeScript Interfaces

All props crossing Server→Client boundary must be:
- Primitive types (string, number, boolean)
- Arrays of primitives
- Objects with primitive values
- NOT: Functions, class instances, Date objects

### AC8: Language Switching

Uses Next.js Link component:
```tsx
<Link href={`/en/hotels/${slug}`} locale="en">
  English
</Link>
```

### AC9: XSS Sanitization

- CMS content: Trusted (internal source)
- User-generated content: If added, use DOMPurify or React's built-in escaping
- Avoid: `dangerouslySetInnerHTML`

---

## Implementation Checklist

### Phase 1: Analysis & Architecture Planning
- [x] Document current component classification
- [x] Identify server/client boundaries
- [x] Plan refactoring strategy
- [x] Create composition pattern catalog

### Phase 2: HeroSection Hybrid
- [ ] Create HeroAnimated.client.tsx wrapper
- [ ] Convert HeroSection to Server Component
- [ ] Remove usePageContent hook
- [ ] Add enableAnimations prop
- [ ] Update contracts

### Phase 3: Amenities Server
- [ ] Remove 'use client' directive
- [ ] Remove usePageContent hook
- [ ] Remove skeleton loading (not needed)
- [ ] Update data flow to use props

### Phase 4: Testimonials Hybrid
- [ ] Verify TestimonialCarousel is Client Component
- [ ] Convert Testimonials to Server Component
- [ ] Remove usePageContent hook
- [ ] Use composition with carousel wrapper
- [ ] Update contracts

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] No hydration errors in console
- [ ] "View Source" shows content
- [ ] "Inspect Element" shows widgets working
- [ ] TypeScript compilation passes
- [ ] Tests pass (if applicable)

---

**Document Version:** 1.0.0
**Author:** Architecture Analysis
**Last Updated:** 2026-02-11

---

_🤖 Generated with [Claude Code](https://claude.com/claude-code)_
