# Typography Migration Plan: Remaining Components

> **Plan Status:** COMPLETED (2026-02-12)
>
> **Context:** Epic 15 (Stories 15.1-15.5) established the semantic typography token system and migrated most components. Stories A-G from this plan were completed during Epic 15. Story H (homepage + hotel page) was the final migration, completed 2026-02-12.
>
> **Result:** Zero `text-fluid-*` class usages remain in any component, page, or test file. The deprecated CSS custom properties have been removed from `globals.css`.

---

## Audit Summary

**Total `text-fluid-*` instances remaining:** 48 across 17 files (+ 6 test assertion updates)

| Component | File | Instances | Complexity |
|-----------|------|-----------|------------|
| TestimonialCard | `blocks/Testimonials/TestimonialCard.tsx` | 6 | Low |
| TestimonialFeatured | `blocks/Testimonials/TestimonialFeatured.tsx` | 5 | Low |
| Testimonials (index) | `blocks/Testimonials/index.tsx` | 2 | Low |
| AmenityCard | `blocks/Amenities/AmenityCard.tsx` | 3 | Low |
| AmenitiesFeatured | `blocks/Amenities/AmenitiesFeatured.tsx` | 2 | Low |
| Amenities (index) | `blocks/Amenities/index.tsx` | 2 | Low |
| ContactHeader | `sections/ContactHeader/index.tsx` | 2 | Low |
| ContactInfo | `sections/ContactInfo/index.tsx` | 2 | Low |
| ContactForm | `sections/ContactForm/index.tsx` | 2 | Low |
| RoomsHeader | `sections/RoomsHeader/index.tsx` | 3 | Low |
| BookingWidgetDesktop | `blocks/BookingWidget/BookingWidgetDesktop.tsx` | 2 | Low |
| BookingWidgetMobile | `blocks/BookingWidget/BookingWidgetMobile.tsx` | 1 | Low |
| NavigationDesktop | `blocks/Navigation/NavigationDesktop.tsx` | 2 | Low |
| NavigationMobile | `blocks/Navigation/NavigationMobile.tsx` | 2 | Low |
| LanguageSelector | `blocks/LanguageSelector/index.tsx` | 4 | Low |
| GalleryGrid | `blocks/ImageGallery/GalleryGrid.tsx` | 4 | Low |
| **Home Page** | **`app/page.tsx`** | **4** | **Low** |

**Test files with `text-fluid-*` assertions (will break when components migrate):**

| Test File | Instances | Relates To |
|-----------|-----------|------------|
| `tests/pages/Contact.test.tsx` | 2 | Story C |
| `tests/responsive/Navigation.responsive.test.tsx` | 4 | Story F |

---

## Token Mapping Reference

Established by Stories 15.2/15.4/15.5, this is the canonical mapping:

| Old Class | Semantic Token | Range | Semantic Role |
|-----------|---------------|-------|---------------|
| `text-fluid-3xl` / `text-fluid-2xl` | `text-size-display` | 36px-60px | Hero titles, page display headings |
| `text-fluid-xl` | `text-size-h1` | 24px-36px | Page headings (h1) |
| `text-fluid-lg` | `text-size-h2` | 20px-28px | Section headings (h2), subsection titles |
| `text-fluid-base` | `text-size-body` | 16px-18px | Body text, descriptions, paragraphs |
| `text-fluid-sm` | `text-size-caption` | 14px-16px | Labels, metadata, small text |

**Context-sensitive mappings** (depends on semantic role, not just size):

| Old Class | Context | Maps To |
|-----------|---------|---------|
| `text-fluid-lg` | Subsection heading (h3) | `text-size-h3` (18px-22px) |
| `text-fluid-lg` | Emphasized body text | `text-size-body-large` (18px-20px) |
| `text-fluid-base` | Form title / widget heading | `text-size-h3` (18px-22px) |
| `text-fluid-sm` | Overline / tiny metadata | `text-size-overline` (12px-14px) |

---

## Migration Stories

### Story A: Migrate Testimonials Components

**Files:**
- `web-app/components/blocks/Testimonials/TestimonialCard.tsx`
- `web-app/components/blocks/Testimonials/TestimonialFeatured.tsx`
- `web-app/components/blocks/Testimonials/index.tsx`

**Mapping (13 instances):**

**TestimonialCard.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 48 | `text-fluid-sm` (avatar initials) | `text-size-caption` | Small label text |
| 55 | `text-fluid-base` (customer name) | `text-size-body` | Name is body-level text |
| 59 | `text-fluid-sm` (customer title) | `text-size-caption` | Secondary metadata |
| 66 | `text-fluid-sm` (quote blockquote) | `text-size-caption` | Quote body text at card level |
| 68 | `text-fluid-xl` (decorative quote mark) | `text-size-h1` | Decorative glyph, large display |
| 79 | `text-fluid-sm` (footer date/location) | `text-size-caption` | Metadata text |

**TestimonialFeatured.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 96 | `text-fluid-lg` (avatar initials) | `text-size-body-large` | Larger initials in featured view |
| 107 | `text-fluid-lg` (customer name) | `text-size-body-large` | Featured name is emphasized |
| 109 | `text-fluid-base` (customer title) | `text-size-body` | Body-level subtitle |
| 120 | `text-fluid-base` / `md:text-fluid-lg` | `text-size-body` / `md:text-size-body-large` | Quote scales up on desktop |
| 125 | `text-fluid-sm` (date/location) | `text-size-caption` | Metadata text |

**Testimonials/index.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 153 | `text-fluid-2xl` (section heading h2) | `text-size-display` | Top-level section heading |
| 161 | `text-fluid-lg` (subheading) | `text-size-body-large` | Emphasized description text |

**Tests to update:**
- Snapshot tests referencing `text-fluid-*` classes in Testimonials

---

### Story B: Migrate Amenities Components

**Files:**
- `web-app/components/blocks/Amenities/AmenityCard.tsx`
- `web-app/components/blocks/Amenities/AmenitiesFeatured.tsx`
- `web-app/components/blocks/Amenities/index.tsx`

**Mapping (7 instances):**

**AmenityCard.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 43 | `text-fluid-lg` (amenity name) | `text-size-h3` | Card title is a subsection heading |
| 45 | `text-fluid-sm` (category badge) | `text-size-overline` | Tiny uppercase label |
| 53 | `text-fluid-sm` (description) | `text-size-caption` | Secondary descriptive text |

**AmenitiesFeatured.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 111 | `text-fluid-lg` (amenity name h3) | `text-size-h3` | Subsection heading |
| 116 | `text-fluid-sm` (description) | `text-size-caption` | Secondary descriptive text |

**Amenities/index.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 169 | `text-fluid-2xl` (section heading h2) | `text-size-display` | Top-level section heading |
| 176 | `text-fluid-base` (subheading) | `text-size-body` | Body paragraph text |

**Tests to update:**
- Snapshot tests for Amenities components

---

### Story C: Migrate Contact Page Components

**Files:**
- `web-app/components/sections/ContactHeader/index.tsx`
- `web-app/components/sections/ContactInfo/index.tsx`
- `web-app/components/sections/ContactForm/index.tsx`

**Mapping (6 instances):**

**ContactHeader/index.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 10 | `text-fluid-2xl` (h1 page title) | `text-size-display` | Page display heading |
| 15 | `text-fluid-base` (description) | `text-size-body` | Body paragraph |

**ContactInfo/index.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 11 | `text-fluid-lg` (h2 section title) | `text-size-h2` | Section heading |
| 17 | `text-fluid-base` (h3 hotel name) | `text-size-h3` | Subsection heading |

**ContactForm/index.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 106 | `text-fluid-lg` (h2 form title) | `text-size-h2` | Section heading |
| 264 | `text-fluid-base` (submit button) | `text-size-body` | Button text |

**Tests to update:**
- Contact page test snapshots (`web-app/tests/pages/Contact.test.tsx`)
- **Test assertions to fix:** Lines 215, 223 in `Contact.test.tsx` assert `text-fluid-2xl` — update to `text-size-display`

---

### Story D: Migrate RoomsHeader Component

**File:**
- `web-app/components/sections/RoomsHeader/index.tsx`

**Mapping (3 instances):**

| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 26 | `text-fluid-sm` (subtitle) | `text-size-overline` | Uppercase small label above title |
| 29 | `text-fluid-2xl` (h1 page title) | `text-size-display` | Page display heading |
| 31 | `text-fluid-base` (description) | `text-size-body` | Body paragraph |

**Tests to update:**
- Rooms page test snapshots (`web-app/tests/pages/Rooms.test.tsx`)

---

### Story E: Migrate BookingWidget Components

**Files:**
- `web-app/components/blocks/BookingWidget/BookingWidgetDesktop.tsx`
- `web-app/components/blocks/BookingWidget/BookingWidgetMobile.tsx`

**Mapping (3 instances):**

**BookingWidgetDesktop.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 80 | `text-fluid-lg` (h3 widget title) | `text-size-h3` | Widget subsection heading |
| 206 | `text-fluid-sm` (status message) | `text-size-caption` | Small feedback text |

**BookingWidgetMobile.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 210 | `text-fluid-sm` (status message) | `text-size-caption` | Small feedback text |

**Tests to update:**
- BookingWidget test snapshots if they exist

---

### Story F: Migrate Navigation Components

**Files:**
- `web-app/components/blocks/Navigation/NavigationDesktop.tsx`
- `web-app/components/blocks/Navigation/NavigationMobile.tsx`

**Mapping (4 instances):**

**NavigationDesktop.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 49 | `text-fluid-sm` (logo "SE" initials) | `text-size-caption` | Small badge text |
| 52 | `text-fluid-lg` (logo brand name) | `text-size-h3` | Brand name is a prominent heading-level element |

**NavigationMobile.tsx:**
| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 39 | `text-fluid-sm` (logo "SE" initials) | `text-size-caption` | Small badge text |
| 42 | `text-fluid-base` (logo brand name) | `text-size-body` | Brand name at mobile size |

**Tests to update:**
- Navigation test snapshots (`web-app/tests/components/navigation/Navigation.test.tsx`)
- Responsive navigation tests (`web-app/tests/responsive/Navigation.responsive.test.tsx`)
- **Test assertions to fix:** Lines 547, 554-556 in `Navigation.responsive.test.tsx` assert `text-fluid-base` / `text-fluid-lg` — update to `text-size-body` / `text-size-h3`

---

### Story G: Migrate LanguageSelector and GalleryGrid

**Files:**
- `web-app/components/blocks/LanguageSelector/index.tsx`
- `web-app/components/blocks/ImageGallery/GalleryGrid.tsx`

**Mapping - LanguageSelector (4 instances):**

| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 33 | `text-fluid-sm` (sm size class) | `text-size-caption` | Small variant |
| 34 | `text-fluid-base` (md size class) | `text-size-body` | Medium variant |
| 35 | `text-fluid-lg` (lg size class) | `text-size-body-large` | Large variant |
| 78 | `text-fluid-lg` (flag emoji size) | `text-size-body-large` | Emoji display size |

**Mapping - GalleryGrid (4 instances):**

| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 124 | `text-fluid-sm` (featured badge) | `text-size-overline` | Uppercase badge label |
| 173 | `text-fluid-sm` (hover caption) | `text-size-caption` | Image caption text |
| 191 | `text-fluid-sm` (static caption) | `text-size-caption` | Image caption text |
| 201 | `text-fluid-sm` (image count) | `text-size-caption` | Metadata text |

**Tests to update:**
- GalleryGrid test snapshots if they exist

---

### Story H: Migrate Home Page

**File:**
- `web-app/app/page.tsx`

**Mapping (4 instances):**

| Line | Current | Replacement | Rationale |
|------|---------|-------------|-----------|
| 60 | `text-fluid-2xl` (h2 section heading) | `text-size-display` | Top-level section heading |
| 68 | `text-fluid-base` (section description) | `text-size-body` | Body paragraph |
| 100 | `text-fluid-2xl` (h2 section heading) | `text-size-display` | Top-level section heading |
| 108 | `text-fluid-base` (section description) | `text-size-body` | Body paragraph |

**Tests to update:**
- Home page test snapshots if they exist

---

## Implementation Order

Recommended sequence (by dependency/risk):

1. **Story D: RoomsHeader** - Smallest, 1 file, 3 changes. Good warmup.
2. **Story H: Home Page** - 1 file, 4 changes. High-visibility but simple.
3. **Story C: Contact Page** - 3 files, 6 changes + 2 test assertion fixes. Self-contained page.
4. **Story E: BookingWidget** - 2 files, 3 changes. Isolated widget.
5. **Story F: Navigation** - 2 files, 4 changes + 4 test assertion fixes. High-visibility, test carefully.
6. **Story A: Testimonials** - 3 files, 13 changes. Largest migration.
7. **Story B: Amenities** - 3 files, 7 changes. Second-largest.
8. **Story G: LanguageSelector + GalleryGrid** - 2 files, 8 changes. Mixed components.

**Total effort:** 48 class replacements across 17 files + 6 test assertion updates. Each story is independently shippable.

---

## Post-Migration Cleanup

After all stories are complete:

1. **Remove deprecated `text-fluid-*` tokens** from `globals.css` lines 121-126 (`--font-size-fluid-sm` through `--font-size-fluid-3xl`).
2. **Run full grep** to verify zero remaining `text-fluid-` references in `web-app/components/` and `web-app/app/`.
3. **Update Storybook** `Typography.stories.tsx` to note migration is complete.
4. **Run full test suite** to confirm no regressions.

---

## Acceptance Criteria (per story)

- [x] All `text-fluid-*` classes in target files replaced with semantic `text-size-*` tokens
- [x] No visual regressions (fluid scaling still works 375px-768px)
- [x] All affected snapshot tests updated
- [x] Related test files pass
