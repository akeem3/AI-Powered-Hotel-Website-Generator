# Epic 22 Session Analysis & Epic 23 Merge Guide

**Date:** 2026-03-18
**Branch:** `Epic-22`
**Session scope:** Bug fixes, data-driven Navigation epic, fixture cleanup, test fixes

---

## 1. What Was Wrong with Epic 22

Epic 22 (E2E Diversity Validation) generated 12 hotel websites and ran visual comparisons. During visual testing, three bugs were discovered in the preview system, plus a fundamental architectural gap:

### Bug 1: Double Navigation
**Root cause:** Root `layout.tsx` rendered a hardcoded Sterling Executive `<Navigation />` on ALL routes. When preview loaded a hotel config that included its own navigation component, two navbars appeared.

### Bug 2: Ctrl+D Crash ("Rendered fewer hooks than expected")
**Root cause:** `ThemeApplier.tsx` called `useHotelTheme()` inside an `if (designTokens)` conditional, violating React's Rules of Hooks. Toggling the debug header caused React to re-render with a different hook count.

### Bug 3: "View all fixtures" showed error page
**Root cause:** The `NoConfigErrorUI` component displayed "No Configuration Specified" with an error icon when visiting `/preview` without a config parameter. This was confusing since it's actually the fixture listing page.

### Architectural Gap: Navigation was hardcoded
**Root cause:** Navigation was the only component in the entire system that ignored its config props. The LLM pipeline generated `brandName`, `links`, `ctaButton` — but all 3 variants (Classic, Compact, Extended) hardcoded "Sterling Executive", fixed links `[Home, Rooms, Contact]`, and a "Book" CTA. Every other component (Footer, Hero, Amenities, Testimonials, About, Features) was fully data-driven.

### Fixture Mess
- Duplicate fixtures: 9 `-config.json` files alongside newer `.json` versions
- Stale directory: `web-app/web-app/fixtures/` (33 old files in an accidental nested path)
- Navigation links used path-based hrefs (`/about`) which triggered the `[lang]` catch-all route error

---

## 2. What Was Fixed (All Changes)

### 2.1 Route Group Restructure (Fix Double Nav)

| File | Change |
|------|--------|
| `web-app/app/layout.tsx` | Stripped `NavigationProvider`, `Navigation`, `ContentProvider`. Now only renders `<html>`, `<body>`, font variables, `globals.css` |
| `web-app/app/(site)/layout.tsx` | **NEW.** Wraps Sterling Executive site routes with `ContentProvider` + `NavigationProvider` + `<Navigation>` with explicit props |
| `web-app/app/(site)/page.tsx` | **MOVED** from `app/page.tsx` |
| `web-app/app/(site)/contact/` | **MOVED** from `app/contact/` |
| `web-app/app/(site)/rooms/` | **MOVED** from `app/rooms/` |
| `web-app/app/(site)/test-hero/` | **MOVED** from `app/test-hero/` |

**How it works now:** The `(site)` route group (invisible in URL) provides the Sterling Executive branding. The `/preview` route sits outside this group — no Sterling nav, no Sterling providers. Each hotel's navigation renders from its own config props.

### 2.2 ThemeApplier Hook Fix

| File | Change |
|------|--------|
| `web-app/components/ThemeApplier.tsx` | Removed conditional `if (designTokens) { useHotelTheme(...) }`. Now always calls hook unconditionally. The hook's internal `if (!theme) return;` guard handles undefined safely. |

### 2.3 Preview Error UI Improvement

| File | Change |
|------|--------|
| `web-app/components/preview/PreviewErrorUI.tsx` | Changed `no-config` title from "No Configuration Specified" to "Available Fixtures". Replaced error icon (warning triangle) with neutral list icon. Changed text color from `text-status-error` to `text-brand-primary`. |

### 2.4 Data-Driven Navigation (New Epic)

#### NavigationContract expanded
| File | Change |
|------|--------|
| `web-app/lib/contracts/navigation.contract.ts` | Added `brandName` (required), `links[]` (required, 1-8 items), `ctaButton` (optional), `logoUrl` (optional). Added `navigationLinkSchema` and `navigationCtaSchema` sub-schemas. |

#### All 3 variants made data-driven
| File | Change |
|------|--------|
| `web-app/components/blocks/Navigation/NavigationClassic.tsx` | Replaced hardcoded "SE"/"Sterling Executive"/links/CTA with `brandName`, `links`, `ctaButton`, `logoUrl` from props. Added `getBrandInitials()` helper. Logo falls back to initials circle when no `logoUrl`. |
| `web-app/components/blocks/Navigation/NavigationCompact.tsx` | Same pattern as Classic. |
| `web-app/components/blocks/Navigation/NavigationExtended.tsx` | Same pattern as Classic. Extended variant's booking bar and mobile booking modal unchanged (static placeholders). |

#### Props transformation & security
| File | Change |
|------|--------|
| `web-app/lib/propsTransformation.ts` | Added `brandName`, `links`, `ctaButton`, `logoUrl` to navigation whitelist. Updated `transformNavigationProps()` to validate URLs in links array and ctaButton. Added `navStyle`→`style` / `navLayout`→`layout` mapping in `filterSafeVariant()`. |

#### LLM agent prompts updated
| File | Change |
|------|--------|
| `web-app/app/langgraph/agents/prompts/content-generator.md` | Added Navigation content section with `brandName`, `links`, `ctaButton` field definitions. Added `navigation` to output format JSON example. Updated links to use hash anchors (`#about` not `/about`). |
| `web-app/app/langgraph/agents/prompts/assembly-agent.md` | Updated navigation example: `navStyle`→`style`, `navLayout`→`layout`, added `brandName`/`links`/`ctaButton`. Links use hash anchors. |
| `web-app/app/langgraph/agents/prompts/styling-agent.md` | Updated navigation variant docs: `navStyle`→`style`, `navLayout`→`layout`. Updated output format example. |

### 2.5 Hash-Based Navigation Links

| File | Change |
|------|--------|
| `web-app/app/preview/page.tsx` | Each component now wrapped in `<div id={componentType}>` providing anchor targets for hash navigation (`#about`, `#rooms`, etc.) |
| All fixture JSONs | Converted navigation link hrefs from `/path` to `#hash` format |
| LLM prompts | Updated to instruct hash anchors for single-page hotel sites |

### 2.6 Fixture Cleanup

| Action | Files |
|--------|-------|
| Removed 9 old `-config.json` duplicates | `*-config.json` where a newer `*.json` existed |
| Removed `web-app/web-app/` accidental directory | 33 old config files in wrong path |
| Removed all fixtures except freshly generated one | 17 old fixtures cleared, only `the-pemberton-grand.json` remains |

### 2.7 Test Fixes

| File | Change |
|------|--------|
| `__tests__/lib/metadata/hotel-metadata.test.ts` | Fixed: `EXTENDED_LOCALE_CODES`→`KNOWN_LOCALE_CODES` import, added missing `CmsHotel` fields to mock, removed `as const` from `mockImages`, fixed `HotelJsonLd` missing fields |
| `web-app/lib/metadata/hotel-metadata.ts` | Exported `KNOWN_LOCALE_CODES` (was internal-only) |
| `tests/components/blocks/Amenities.test.tsx` | Removed Story 11.4 content integration tests (feature removed during Server Component refactor) |
| `tests/components/blocks/Testimonials.test.tsx` | Removed Story 11.4 content integration tests (same reason) |
| `tests/components/preview/PreviewErrorUI.test.tsx` | Updated expected title text to "Available Fixtures" |
| 5 Navigation test files | Added `defaultNavProps` with `brandName`/`links`/`ctaButton` to all render calls |
| 8 page test files | Updated imports from `@/app/page` to `@/app/(site)/page` (and rooms, contact) |

---

## 3. How the System Works Now

### Navigation rendering flow:

```
LLM Pipeline generates:
  { type: "navigation", variant: { style, layout }, props: { brandName, links, ctaButton } }
       ↓
HomepageConfigSchema validates (variant: any record, props: any record)
       ↓
Preview page passes through:
  transformProps('navigation', props)  →  URL validation on links/ctaButton
  filterSafeVariant(variant)           →  navStyle→style, navLayout→layout mapping
       ↓
SectionRenderer recognizes navigation as SELF_CONTAINED → renders directly
       ↓
Navigation/index.tsx validates against NavigationContract, routes by layout:
  classic  → NavigationClassic
  compact  → NavigationCompact
  extended → NavigationExtended
       ↓
Each variant renders brandName, links[], ctaButton from props
  - Logo: logoUrl image OR initials circle (getBrandInitials)
  - Links: props.links.map() (with optional currentLang prefix)
  - CTA: props.ctaButton?.text / href (conditionally rendered)
```

### Route structure:

```
app/
├── layout.tsx           ← html/body/fonts only (no nav, no providers)
├── (site)/              ← Route group (URL invisible)
│   ├── layout.tsx       ← Sterling nav + providers
│   ├── page.tsx         ← Sterling homepage (/)
│   ├── contact/         ← /contact
│   └── rooms/           ← /rooms
├── preview/             ← /preview (no Sterling branding)
│   └── page.tsx         ← Loads fixtures, renders hotel configs
├── [lang]/              ← CMS hotel pages (/en, /th, /ja)
└── api/                 ← API routes
```

---

## 4. Epic 23 Merge Conflict Analysis

### Epic 23 Scope (Spacing System Architecture Fix)

Epic 23 modifies 4 files:
1. `web-app/app/globals.css` — `@theme inline` spacing section + `@layer theme :root`
2. `web-app/lib/style-generation/spacing-mapper.ts` — rename keys to `-val` suffix
3. `web-app/tailwind.config.js` — fix duplicate spacing key
4. Spacing-related test files

### Conflict Risk Assessment

| Epic 23 File | Our Changes | Conflict Risk | Resolution |
|---|---|---|---|
| `globals.css` | **NOT modified** | **NONE** | Clean merge |
| `spacing-mapper.ts` | **NOT modified** | **NONE** | Clean merge |
| `tailwind.config.js` | **NOT modified** | **NONE** | Clean merge |
| `useHotelTheme.ts` | Minor change (linter-only, no logic) | **LOW** | Epic 23 says "no code changes needed" for this file. If both touch it, trivial resolution. |
| Spacing test files | **NOT modified** | **NONE** | Clean merge |

### Files With Zero Overlap

Epic 23 touches CSS/spacing infrastructure. Our session touched:
- Route structure (`layout.tsx`, `(site)/`)
- Navigation components and contract
- `propsTransformation.ts`
- Preview page
- LLM agent prompts
- Fixture JSON files
- Various test files (none spacing-related)

**These are completely disjoint codebases.** Epic 23 doesn't touch navigation, routing, prompts, or fixtures.

### Merge Strategy

1. **Merge order:** Either order works. No dependencies between them.
2. **Recommended:** Merge Epic 22 first (larger change set, more files), then Epic 23 (surgical CSS fix).
3. **After both merge:** Run `npm run build` and `npm test` to verify no interaction effects.
4. **One watch item:** Both epics touch files that affect preview rendering:
   - Epic 22: Navigation now data-driven (different nav per hotel)
   - Epic 23: Spacing tokens fixed (all hotels get corrected spacing)
   - These are complementary, not conflicting — preview will show both improvements.

### Post-Merge Verification

After merging both epics to `main`:
1. `npm run build` — verify no compilation errors
2. `npm test -- --config jest.config.simple.js` — fast test pass
3. `npm run dev` → `/preview?config=the-pemberton-grand`:
   - Navigation shows "The Pemberton Grand" branding (Epic 22)
   - Section spacing is 32-64px, not 48-80px (Epic 23)
   - Hash links scroll to sections
4. Regenerate a hotel to verify LLM pipeline produces correct navigation props

---

## 5. Files Changed Summary

**112 files changed: 706 insertions, 29,707 deletions**

| Category | Files | Net |
|----------|-------|-----|
| Route restructure | 7 | Moved 4 pages into `(site)/` |
| Navigation components | 4 | Made data-driven |
| Navigation contract | 1 | Expanded schema |
| Props transformation | 1 | Added nav whitelist + security |
| Preview page | 1 | Added hash anchor IDs |
| Preview error UI | 1 | Friendly "Available Fixtures" |
| ThemeApplier | 1 | Unconditional hook call |
| LLM agent prompts | 3 | Updated field names + examples |
| hotel-metadata source | 1 | Exported KNOWN_LOCALE_CODES |
| Fixture JSONs | 26 deleted, 1 remains | Cleanup to single fresh generation |
| Stale docs | 21 deleted | Old Epic 22 work notes, prompt backups |
| Stale `web-app/web-app/` | 33 deleted | Accidental nested directory |
| Test fixes | 16 | Import paths, required props, removed dead tests |
