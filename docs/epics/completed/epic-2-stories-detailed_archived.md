# Epic 2: Foundation Validation - Detailed Story Breakdown

> **Epic:** Foundation Validation & Prompt Development
> **Timeline:** 4 weeks (November 20 - December 18, 2025)
> **Stories:** 2.1 through 2.7 (37-47 story points - Story 2.2 increased from 8 to 10 points)

---

## Story 2.1: Add Gallery, Testimonials, and Amenities Components

**Story Points:** 8
**Duration:** 5-6 days
**Dependencies:** Epic 1 complete (Stories 1.10-1.11)

### User Story

**As a** hotel website visitor
**I want to** view hotel image galleries, guest testimonials, and amenity listings
**So that** I can make informed booking decisions based on visual content, social proof, and available facilities

### Business Value

Expands homepage component diversity to 8 components, providing sufficient variation for validation testing while covering essential hotel website elements (visual showcase, social proof, amenity discovery).

### ⚠️ Rationale for Multiple Layout Variants (Intentional Overengineering)

Story 2.1 implements **3 layout variants per component** (9 total variants across Gallery, Testimonials, Amenities). This is intentional overengineering for Epic 2's validation purposes:

**Why This is Necessary:**

1. **LLM Composition Testing**: Validates that LLM agents can assemble pages mixing different layout paradigms (grid + carousel + masonry on same page) without conflicts or degraded quality.

2. **ZOD Schema Robustness**: Tests whether ZOD schemas handle structurally different layouts (grid vs masonry vs carousel) with equal reliability. Schemas must validate component configurations regardless of layout complexity.

3. **AssemblyAgent Validation**: Epic 7's AssemblyAgent must compose complete pages from diverse layout patterns. This story proves the architecture supports compositional flexibility before automation.

4. **Real-World Variety Requirement**: Generated hotel websites need visual diversity beyond color/content variations. Layout variety (grid hotel A vs carousel hotel B) ensures each of 10,000+ sites feels unique.

5. **Epic 7 De-risking**: Building 9 layout variants now (4 weeks manual) prevents discovering composition issues during Epic 7 LangGraph automation (would cost 8-12 weeks to refactor).

**This is NOT feature completeness** - it's architectural validation through intentional stress testing of component composition patterns.

### Acceptance Criteria

#### Image Gallery Component

**Functional Requirements:**
- [ ] Display multiple images in responsive grid layout
- [ ] Support click-to-expand lightbox functionality
- [ ] Lazy load images for performance
- [ ] Handle both desktop (.webp) and mobile (.m.webp) image formats
- [ ] Provide thumbnail navigation in lightbox mode

**Layout Variants:**
- [ ] Grid layout (2×2 mobile, 3×3 desktop)
- [ ] Masonry layout (Pinterest-style, 2 columns mobile, 3 columns desktop)
- [ ] Carousel layout (horizontal scroll with snap points)

**Technical Requirements:**
- [ ] Component follows Epic 1 patterns (TypeScript, responsive, accessible)
- [ ] Props interface defined with clear types
- [ ] Unit tests covering all three layout variants
- [ ] Accessibility: keyboard navigation, ARIA labels, focus management
- [ ] Performance: Images lazy load, no layout shift (aspect ratio preserved)

**File Structure:**
```
web-app/components/blocks/ImageGallery/
├── index.tsx                 # Main component with variant selection
├── GalleryGrid.tsx          # Grid layout implementation
├── GalleryMasonry.tsx       # Masonry layout implementation
├── GalleryCarousel.tsx      # Carousel layout implementation
├── Lightbox.tsx             # Full-screen image viewer
├── GalleryThumbnails.tsx    # Thumbnail navigation
└── ImageGallery.test.tsx    # Unit tests
```

**Props Interface:**
```typescript
interface ImageGalleryProps {
  images: Array<{
    id: string;
    desktopUrl: string;      // .webp format
    mobileUrl: string;       // .m.webp format
    alt: string;
    caption?: string;
  }>;
  layout: 'grid' | 'masonry' | 'carousel';
  columns?: 2 | 3 | 4;       // Desktop column count
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  enableLightbox?: boolean;
  className?: string;
}
```

#### Testimonials Component

**Functional Requirements:**
- [ ] Display customer testimonials with avatar, name, rating, and quote
- [ ] Support 1-5 star rating display
- [ ] Handle optional customer photo/avatar
- [ ] Provide multiple layout options for different use cases

**Layout Variants:**
- [ ] Carousel layout (single featured testimonial, swipeable)
- [ ] Grid layout (2-column mobile, 3-column desktop)
- [ ] Featured layout (single large testimonial with emphasis)

**Technical Requirements:**
- [ ] Star rating component (reusable, accessible)
- [ ] Responsive text truncation for long quotes
- [ ] Avatar fallback (initials if no photo)
- [ ] Unit tests for all variants
- [ ] Accessibility: ARIA roles for testimonials, ratings

**File Structure:**
```
web-app/components/blocks/Testimonials/
├── index.tsx                    # Main component
├── TestimonialCard.tsx          # Single testimonial card
├── TestimonialCarousel.tsx      # Carousel variant
├── TestimonialGrid.tsx          # Grid variant
├── TestimonialFeatured.tsx      # Featured single variant
├── StarRating.tsx               # Reusable star rating
└── Testimonials.test.tsx        # Unit tests
```

**Props Interface:**
```typescript
interface Testimonial {
  id: string;
  customerName: string;
  customerTitle?: string;        // e.g., "Business Traveler"
  avatarUrl?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  date?: string;
  location?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  layout: 'carousel' | 'grid' | 'featured';
  columns?: 2 | 3;               // For grid layout
  showDate?: boolean;
  showLocation?: boolean;
  className?: string;
}
```

#### Amenities Component

**Functional Requirements:**
- [ ] Display hotel amenities with icons and descriptions
- [ ] Support categorization (Room, Hotel, Location, Services)
- [ ] Handle icon display (Font Awesome or custom SVG)
- [ ] Provide compact and detailed layout options

**Layout Variants:**
- [ ] Grid layout (icon + text, 2 columns mobile, 3-4 columns desktop)
- [ ] List layout (compact, icon + text horizontal)
- [ ] Featured layout (large icons, emphasis on premium amenities)

**Technical Requirements:**
- [ ] Icon system integration (Font Awesome recommended)
- [ ] Category filtering/grouping support
- [ ] Responsive icon sizing
- [ ] Unit tests for all variants
- [ ] Accessibility: ARIA labels for icons, semantic HTML

**File Structure:**
```
web-app/components/blocks/Amenities/
├── index.tsx                 # Main component
├── AmenityCard.tsx          # Single amenity display
├── AmenitiesGrid.tsx        # Grid layout
├── AmenitiesList.tsx        # List layout
├── AmenitiesFeatured.tsx    # Featured layout
└── Amenities.test.tsx       # Unit tests
```

**Props Interface:**
```typescript
interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon: string;                  // Font Awesome class or SVG path
  category: 'room' | 'hotel' | 'location' | 'services';
  featured?: boolean;
}

interface AmenitiesProps {
  amenities: Amenity[];
  layout: 'grid' | 'list' | 'featured';
  columns?: 2 | 3 | 4;          // For grid layout
  showCategory?: boolean;
  filterByCategory?: 'room' | 'hotel' | 'location' | 'services';
  className?: string;
}
```

### Testing Requirements

**Unit Tests (Jest + React Testing Library):**
- [ ] Gallery: All three layouts render correctly
- [ ] Gallery: Lightbox opens/closes on interaction
- [ ] Gallery: Lazy loading behavior verified
- [ ] Testimonials: All layouts render with correct data
- [ ] Testimonials: Star rating displays correctly (1-5 stars)
- [ ] Testimonials: Avatar fallback works when no photo
- [ ] Amenities: All layouts render with icons and text
- [ ] Amenities: Category filtering works correctly
- [ ] All components: Responsive behavior at 375px, 768px, 1280px
- [ ] All components: Accessibility tests pass (jest-axe)

**Integration Tests:**
- [ ] Components integrate with existing Navigation/Layout
- [ ] Components work with mock hotel data
- [ ] No console errors or warnings
- [ ] TypeScript compilation clean (zero errors)
- [ ] All 8 components render together on homepage without conflicts
- [ ] No CSS class collisions or z-index issues between components
- [ ] Total bundle size <150KB (mobile) with all 8 components loaded

**Performance Tests:**
- [ ] Gallery lazy loading verified (off-screen images load only when scrolling)
- [ ] Lighthouse score >90 maintained with new components added
- [ ] No CLS (Cumulative Layout Shift) from Gallery/Testimonials/Amenities
- [ ] Image aspect ratios preserved during lazy load (no layout shift)
- [ ] Carousel scroll performance smooth (60fps) on mobile devices

**Cross-Browser Tests:**
- [ ] Components render correctly in Chrome, Firefox, Safari
- [ ] Lightbox functionality works across all browsers
- [ ] Carousel snap points work in Safari (webkit-specific behavior)
- [ ] No visual regressions in Firefox (grid/flexbox differences)

### Definition of Done

- [ ] All 3 components implemented with all specified variants
- [ ] Props interfaces defined and documented
- [ ] Unit tests passing (100% coverage for component logic)
- [ ] Accessibility tests passing (WCAG 2.1 AA)
- [ ] Responsive behavior verified at all breakpoints
- [ ] Components render without errors on homepage
- [ ] TypeScript compilation successful
- [ ] Code review completed
- [ ] Merged to main branch

### Notes

- Reuse patterns from Epic 1 components (RoomCard, HeroSection)
- Leverage Shadcn/ui primitives where applicable
- Keep components simple - advanced features in later epics
- Focus on solid foundation, not feature completeness
- **Bonus (if time permits):** Footer component with multi-column layout

---

## Story 2.2: Define CVA Variants + ZOD Schemas for All Components

**Story Points:** 10
**Duration:** 6-7 days
**Dependencies:** Story 2.1 complete, **Story 1.11 (Centralized Tailwind Design System) complete**

### User Story

**As a** LLM generation system
**I want** type-safe component variants with runtime validation integrated with the centralized design system
**So that** generated components have consistent styling, predictable props, and use semantic design tokens

### Business Value

Establishes type-safe variant system (CVA) and runtime validation (ZOD) for all 8 components, **ensuring CVA variants use Story 1.11 design system tokens** to enable per-hotel theming without refactoring. Critical foundation for Epic 7 automation.

### ⚠️ CRITICAL DEPENDENCY: Story 1.11 Design System Integration

**This story MUST integrate with Story 1.11 Centralized Tailwind Design System.**

**Why This Integration is Non-Negotiable:**

1. **Prevents Parallel Styling System:** CVA variants that hardcode colors (e.g., `bg-blue-600`) create a separate styling system that bypasses Story 1.11's semantic tokens (`--color-primary`, `--color-secondary`, etc.). This defeats the purpose of having a centralized design system.

2. **Enables Per-Hotel Theming:** Epic 7's StylingAgent will customize hotel websites by modifying design tokens, not by regenerating CVA definitions. If CVA uses hardcoded colors, theming becomes impossible without complete refactoring.

3. **Validates Actual Production Architecture:** Epic 2's goal is to validate the foundation before scaling. Testing CVA variants that bypass Story 1.11 tokens means we're NOT validating the system that will generate 10,000+ sites.

4. **Prevents Costly Refactoring:** Hardcoded CVA variants now = forced refactoring in Epic 7. This violates the "validate early to prevent late-stage rework" principle (73% failure rate for unvalidated systems).

**Required Integration Pattern:**

```typescript
// ✅ CORRECT: Uses Story 1.11 design system tokens
const heroVariants = cva(
  "relative w-full",
  {
    variants: {
      style: {
        modern: "bg-primary text-primary-foreground",     // Semantic tokens
        classic: "bg-secondary text-secondary-foreground", // Semantic tokens
        minimal: "bg-background text-foreground",         // Semantic tokens
      }
    }
  }
);

// ❌ WRONG: Hardcoded values bypass design system
const heroVariants = cva(
  "relative w-full",
  {
    variants: {
      style: {
        modern: "bg-blue-600 text-white",   // Hardcoded (FORBIDDEN)
        classic: "bg-gray-900 text-white",  // Hardcoded (FORBIDDEN)
      }
    }
  }
);
```

**Validation Requirement:** All CVA variant definitions MUST be reviewed to ensure ZERO hardcoded color values (bg-blue-*, text-gray-*, etc.) and 100% use of semantic design tokens.

### Progressive Enforcement Strategy

**Epic 2 implements progressive contract enforcement to enable learning while ensuring quality gates:**

| Phase | Stories | Enforcement Level | Rationale |
|-------|---------|------------------|-----------|
| **Learning Phase** | 2.1-2.3 | **WARNING mode** | Allow schema violations to identify patterns, log warnings for analysis |
| **Validation Prep** | 2.4 (first half) | **WARNING mode** | Prompt iteration needs flexibility to experiment |
| **Validation Phase** | 2.4 (second half), 2.5 generation #5+ | **STRICT mode** | Enforce contracts to validate production readiness |
| **Production Ready** | 2.6-2.7 | **STRICT mode** | All outputs must pass validation for Epic 7 handoff |

**Implementation in Story 2.2:**
- CVA + ZOD schemas created with enforcement level configurable
- Default: WARNING mode for Stories 2.1-2.4 (learning)
- Switch to STRICT mode at Story 2.5 generation #5
- Document switch criteria in `web-app/lib/contractValidation.ts`

**Decision Point:** After 4 test generations in Story 2.5, review violation patterns and switch to STRICT mode for remaining 6+ generations.

### Acceptance Criteria

#### CVA Variant System Implementation

**Install Dependencies:**
- [ ] `npm install class-variance-authority`
- [ ] `npm install tailwind-merge` (for style conflict resolution)

**Create Centralized Variant Registry:**

**File:** `web-app/lib/cva-variants.ts`

```typescript
import { cva, type VariantProps } from "class-variance-authority";

// Hero Section Variants
// ⚠️ CRITICAL: All variants use Story 1.11 design system tokens
export const heroVariants = cva(
  // Base classes (always applied)
  "relative w-full overflow-hidden",
  {
    variants: {
      style: {
        modern: "bg-gradient-to-r from-primary to-primary/80",  // Design tokens
        classic: "bg-secondary text-secondary-foreground",       // Design tokens
        minimal: "bg-background text-foreground",               // Design tokens
        bold: "bg-accent text-accent-foreground",               // Design tokens
        elegant: "bg-card text-card-foreground"                 // Design tokens
      },
      layout: {
        centered: "flex items-center justify-center text-center",
        split: "grid md:grid-cols-2 gap-8 items-center",
        fullscreen: "min-h-screen flex items-center justify-center"
      },
      overlay: {
        none: "",
        light: "before:absolute before:inset-0 before:bg-background/20",
        dark: "before:absolute before:inset-0 before:bg-foreground/50",
        gradient: "before:absolute before:inset-0 before:bg-gradient-to-t before:from-foreground/70 before:to-transparent"
      },
      height: {
        small: "min-h-[400px]",
        medium: "min-h-[600px]",
        large: "min-h-[800px]",
        fullscreen: "min-h-screen"
      }
    },
    compoundVariants: [
      {
        style: "minimal",
        overlay: ["dark", "gradient"],
        class: "text-foreground" // Override text color for minimal + overlay (design token)
      },
      {
        layout: "centered",
        height: "fullscreen",
        class: "py-20" // Add padding for centered fullscreen
      }
    ],
    defaultVariants: {
      style: "modern",
      layout: "centered",
      overlay: "none",
      height: "medium"
    }
  }
);

// Navigation Variants
export const navigationVariants = cva(
  "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
  {
    variants: {
      layout: {
        horizontal: "flex items-center justify-between px-6 py-4",
        centered: "flex flex-col items-center py-4 px-6 md:flex-row",
        split: "flex items-center justify-between px-6 py-4"
      },
      transparency: {
        solid: "bg-background",
        translucent: "bg-background/80",
        transparent: "bg-transparent"
      },
      size: {
        compact: "h-14",
        normal: "h-16",
        large: "h-20"
      }
    },
    defaultVariants: {
      layout: "horizontal",
      transparency: "solid",
      size: "normal"
    }
  }
);

// Room Card Variants
export const roomCardVariants = cva(
  "rounded-lg overflow-hidden border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      presentation: {
        compact: "flex flex-col",
        detailed: "grid md:grid-cols-2 gap-4",
        featured: "flex flex-col md:flex-row gap-6 p-6"
      },
      imageRatio: {
        square: "aspect-square",
        landscape: "aspect-video",
        portrait: "aspect-[3/4]"
      },
      emphasis: {
        none: "",
        subtle: "border-primary/20",
        strong: "border-primary border-2 shadow-lg"
      }
    },
    defaultVariants: {
      presentation: "compact",
      imageRatio: "landscape",
      emphasis: "none"
    }
  }
);

// Gallery Variants (NEW)
export const galleryVariants = cva(
  "w-full overflow-hidden",
  {
    variants: {
      layout: {
        grid: "grid gap-4",
        masonry: "columns-2 md:columns-3 gap-4",
        carousel: "flex overflow-x-auto snap-x snap-mandatory"
      },
      spacing: {
        tight: "gap-2",
        normal: "gap-4",
        loose: "gap-6"
      },
      aspectRatio: {
        square: "[&_img]:aspect-square",
        landscape: "[&_img]:aspect-video",
        portrait: "[&_img]:aspect-[3/4]"
      },
      columns: {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-4"
      }
    },
    compoundVariants: [
      {
        layout: "grid",
        columns: 3,
        class: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      }
    ],
    defaultVariants: {
      layout: "grid",
      spacing: "normal",
      aspectRatio: "landscape",
      columns: 3
    }
  }
);

// Testimonials Variants (NEW)
export const testimonialsVariants = cva(
  "w-full",
  {
    variants: {
      layout: {
        carousel: "relative overflow-hidden",
        grid: "grid gap-6",
        featured: "max-w-4xl mx-auto"
      },
      columns: {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3"
      },
      cardStyle: {
        default: "[&_.testimonial-card]:bg-card [&_.testimonial-card]:border",
        minimal: "[&_.testimonial-card]:bg-transparent",
        elevated: "[&_.testimonial-card]:shadow-lg [&_.testimonial-card]:border-2"
      }
    },
    defaultVariants: {
      layout: "grid",
      columns: 2,
      cardStyle: "default"
    }
  }
);

// Amenities Variants (NEW)
export const amenitiesVariants = cva(
  "w-full",
  {
    variants: {
      layout: {
        grid: "grid gap-4",
        list: "flex flex-col gap-2",
        featured: "grid gap-8"
      },
      columns: {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-4"
      },
      iconSize: {
        small: "[&_.amenity-icon]:text-lg",
        medium: "[&_.amenity-icon]:text-2xl",
        large: "[&_.amenity-icon]:text-4xl"
      },
      iconStyle: {
        default: "[&_.amenity-icon]:text-primary",
        muted: "[&_.amenity-icon]:text-muted-foreground",
        colored: "[&_.amenity-icon]:text-accent"  // Design token, not hardcoded blue
      }
    },
    defaultVariants: {
      layout: "grid",
      columns: 3,
      iconSize: "medium",
      iconStyle: "default"
    }
  }
);

// Booking Widget, Contact Form variants (existing - enhance as needed)
// ... additional variant definitions

// Export all variant prop types
export type HeroVariantProps = VariantProps<typeof heroVariants>;
export type NavigationVariantProps = VariantProps<typeof navigationVariants>;
export type RoomCardVariantProps = VariantProps<typeof roomCardVariants>;
export type GalleryVariantProps = VariantProps<typeof galleryVariants>;
export type TestimonialsVariantProps = VariantProps<typeof testimonialsVariants>;
export type AmenitiesVariantProps = VariantProps<typeof amenitiesVariants>;
```

**Requirements:**
- [ ] CVA definitions created for all 8 components
- [ ] Each component has 3-5 variant options per dimension
- [ ] Compound variants defined where needed
- [ ] Default variants specified for all components
- [ ] Type exports for all variant props
- [ ] **CRITICAL: All CVA variants use Story 1.11 design tokens (ZERO hardcoded colors)**
- [ ] **Design token validation: grep CVA file for forbidden patterns (bg-blue-, bg-gray-, text-white, etc.)**

#### ZOD Schema Integration

**Update Contract Registry:** `web-app/lib/contracts/index.ts`

```typescript
import { z } from "zod";
import type {
  HeroVariantProps,
  GalleryVariantProps,
  TestimonialsVariantProps,
  AmenitiesVariantProps
} from "@/lib/cva-variants";

// Hero Section Contract (enhanced)
export const HeroSectionContract = z.object({
  variant: z.object({
    style: z.enum(["modern", "classic", "minimal", "bold", "elegant"]),
    layout: z.enum(["centered", "split", "fullscreen"]),
    overlay: z.enum(["none", "light", "dark", "gradient"]),
    height: z.enum(["small", "medium", "large", "fullscreen"]).optional()
  }),
  heading: z.string().min(10).max(60),
  subheading: z.string().min(20).max(150).optional(),
  ctaText: z.string().min(3).max(30),
  ctaLink: z.string().url().optional(),
  backgroundImage: z.object({
    desktop: z.string().url().endsWith('.webp'),
    mobile: z.string().url().endsWith('.m.webp')
  }),
  className: z.string().optional()
}).strict();

// Gallery Contract (NEW)
export const ImageGalleryContract = z.object({
  variant: z.object({
    layout: z.enum(["grid", "masonry", "carousel"]),
    spacing: z.enum(["tight", "normal", "loose"]).optional(),
    aspectRatio: z.enum(["square", "landscape", "portrait"]).optional(),
    columns: z.enum([2, 3, 4]).optional()
  }),
  images: z.array(
    z.object({
      id: z.string(),
      desktopUrl: z.string().url().endsWith('.webp'),
      mobileUrl: z.string().url().endsWith('.m.webp'),
      alt: z.string().min(5).max(100),
      caption: z.string().max(200).optional()
    })
  ).min(3).max(20), // 3-20 images
  enableLightbox: z.boolean().optional(),
  className: z.string().optional()
}).strict();

// Testimonials Contract (NEW)
export const TestimonialsContract = z.object({
  variant: z.object({
    layout: z.enum(["carousel", "grid", "featured"]),
    columns: z.enum([2, 3]).optional(),
    cardStyle: z.enum(["default", "minimal", "elevated"]).optional()
  }),
  testimonials: z.array(
    z.object({
      id: z.string(),
      customerName: z.string().min(2).max(50),
      customerTitle: z.string().max(50).optional(),
      avatarUrl: z.string().url().optional(),
      rating: z.enum([1, 2, 3, 4, 5]),
      quote: z.string().min(20).max(500),
      date: z.string().optional(), // ISO date
      location: z.string().max(50).optional()
    })
  ).min(1).max(10), // 1-10 testimonials
  showDate: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  className: z.string().optional()
}).strict();

// Amenities Contract (NEW)
export const AmenitiesContract = z.object({
  variant: z.object({
    layout: z.enum(["grid", "list", "featured"]),
    columns: z.enum([2, 3, 4]).optional(),
    iconSize: z.enum(["small", "medium", "large"]).optional(),
    iconStyle: z.enum(["default", "muted", "colored"]).optional()
  }),
  amenities: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(2).max(30),
      description: z.string().max(100).optional(),
      icon: z.string(), // Font Awesome class or SVG
      category: z.enum(["room", "hotel", "location", "services"]),
      featured: z.boolean().optional()
    })
  ).min(3).max(20), // 3-20 amenities
  showCategory: z.boolean().optional(),
  filterByCategory: z.enum(["room", "hotel", "location", "services"]).optional(),
  className: z.string().optional()
}).strict();

// Update Component Registry
export const ComponentContractRegistry = {
  // Existing
  heroSection: HeroSectionContract,
  navigation: NavigationContract,
  roomCard: RoomCardContract,
  bookingWidget: BookingWidgetContract,
  contactForm: ContactFormContract,

  // New
  imageGallery: ImageGalleryContract,
  testimonials: TestimonialsContract,
  amenities: AmenitiesContract
};

// Type exports
export type HeroSectionConfig = z.infer<typeof HeroSectionContract>;
export type ImageGalleryConfig = z.infer<typeof ImageGalleryContract>;
export type TestimonialsConfig = z.infer<typeof TestimonialsContract>;
export type AmenitiesConfig = z.infer<typeof AmenitiesContract>;
```

**Requirements:**
- [ ] ZOD schemas updated to reference CVA variant enums
- [ ] All variant options constrained by enums (no free-form strings)
- [ ] Content fields validated (min/max lengths, URL formats)
- [ ] Array lengths constrained (reasonable min/max)
- [ ] `.strict()` mode enabled (no unexpected props)
- [ ] Type exports for all component configs

#### Component Refactoring

**Update Components to Use CVA:**

Example pattern for each component:
```typescript
// components/blocks/ImageGallery/index.tsx
import { FC } from 'react';
import { galleryVariants, type GalleryVariantProps } from '@/lib/cva-variants';
import { ImageGalleryContract, type ImageGalleryConfig } from '@/lib/contracts';
import { cn } from '@/lib/utils';

interface ImageGalleryProps extends ImageGalleryConfig {
  // Props from ZOD schema
}

export const ImageGallery: FC<ImageGalleryProps> = ({
  variant,
  images,
  enableLightbox = true,
  className
}) => {
  // Validate props at runtime (optional in component, required in generation)
  // const validated = ImageGalleryContract.parse({ variant, images, enableLightbox });

  return (
    <div className={cn(galleryVariants(variant), className)}>
      {/* Component implementation */}
    </div>
  );
};
```

**Requirements:**
- [ ] All 8 components refactored to use CVA variants
- [ ] Props interfaces reference ZOD schema types
- [ ] `cn()` utility used for className merging
- [ ] Variant props destructured and passed to CVA
- [ ] No hardcoded Tailwind classes (all via CVA)

### Testing Requirements

**Unit Tests:**
- [ ] CVA variants generate correct class combinations
- [ ] ZOD schemas validate correct inputs
- [ ] ZOD schemas reject invalid inputs (enum violations, length violations)
- [ ] Component renders with all variant combinations
- [ ] TypeScript types correctly derived from ZOD schemas
- [ ] Validation performance <5ms per component (Story 1.9 requirement)

**Test Examples:**
```typescript
// tests/lib/cva-variants.test.ts
describe('heroVariants', () => {
  it('applies correct base classes', () => {
    const classes = heroVariants({ style: 'modern', layout: 'centered' });
    expect(classes).toContain('relative');
    expect(classes).toContain('w-full');
  });

  it('applies style variant classes', () => {
    const classes = heroVariants({ style: 'elegant', layout: 'centered' });
    expect(classes).toContain('bg-card'); // Design token, not hardcoded
  });

  it('applies compound variant classes', () => {
    const classes = heroVariants({
      style: 'minimal',
      overlay: 'dark',
      layout: 'centered'
    });
    expect(classes).toContain('text-foreground'); // Design token, not hardcoded
  });
});

// tests/lib/contracts.test.ts
describe('ImageGalleryContract', () => {
  it('validates correct gallery config', () => {
    const valid = {
      variant: { layout: 'grid', columns: 3 },
      images: [
        {
          id: '1',
          desktopUrl: 'https://example.com/image.webp',
          mobileUrl: 'https://example.com/image.m.webp',
          alt: 'Hotel lobby'
        }
      ]
    };
    expect(() => ImageGalleryContract.parse(valid)).not.toThrow();
  });

  it('rejects invalid layout enum', () => {
    const invalid = {
      variant: { layout: 'invalid' },
      images: [/* ... */]
    };
    expect(() => ImageGalleryContract.parse(invalid)).toThrow();
  });

  it('rejects wrong image format', () => {
    const invalid = {
      variant: { layout: 'grid' },
      images: [{
        id: '1',
        desktopUrl: 'https://example.com/image.jpg', // Wrong format
        mobileUrl: 'https://example.com/image.m.webp',
        alt: 'Image'
      }]
    };
    expect(() => ImageGalleryContract.parse(invalid)).toThrow();
  });
});
```

### Definition of Done

- [ ] CVA variant definitions created for all 8 components
- [ ] **CRITICAL: All CVA variants use Story 1.11 design system tokens (validated via grep for hardcoded colors)**
- [ ] ZOD schemas updated with CVA variant integration
- [ ] All components refactored to use CVA (no hardcoded classes)
- [ ] Component contracts registry updated
- [ ] TypeScript compilation clean (zero errors)
- [ ] All unit tests passing
- [ ] Validation performance <5ms per component
- [ ] **Design token integration verified: No bg-blue-*, bg-gray-*, text-white, or other hardcoded color values in CVA file**
- [ ] Documentation updated with variant options
- [ ] Code review completed (with focus on design system token usage)
- [ ] Merged to main branch

### Notes

- Follow Story 1.9 progressive enforcement pattern (warn → strict)
- Ensure backward compatibility with existing Epic 1 components
- CVA allows adding variants without breaking existing code
- **Cross-reference:** [Story 1.9 ZOD Infrastructure](./epic-1.core-structure.md#story-19)

---

## Story 2.3: Create Component Documentation + Golden Datasets

**Story Points:** 5
**Duration:** 3-4 days
**Dependencies:** Story 2.2 complete

### User Story

**As an** LLM generation agent
**I want** comprehensive component documentation with examples and constraints
**So that** I can generate valid component configurations without human intervention

### Business Value

Provides LLM-optimized documentation and test datasets that enable autonomous generation while establishing quality baselines for regression testing.

### Acceptance Criteria

#### Component Documentation Files

**Create Documentation for Each Component:**

**Location:** `docs/components/`

**File Structure:**
```
docs/components/
├── hero-section.md
├── navigation.md
├── room-cards.md
├── booking-widget.md
├── contact-form.md
├── image-gallery.md
├── testimonials.md
└── amenities.md
```

**Documentation Template:**

````markdown
# Component: [ComponentName]

## Purpose
[1-2 sentences describing component purpose and use case]

## Location
- **File:** `web-app/components/[path]/index.tsx`
- **Category:** Primitive | Block | Section

## Props Schema (ZOD)

```typescript
[Copy exact ZOD schema from contracts/index.ts]
```

## TypeScript Interface

```typescript
[Component props interface]
```

## CVA Variants

### Available Variants

| Variant Dimension | Options | Default | Description |
|-------------------|---------|---------|-------------|
| style | modern \| classic \| minimal | modern | Visual styling approach |
| layout | centered \| split | centered | Content layout pattern |
| ... | ... | ... | ... |

### Variant Combinations

**Recommended Combinations:**

| Hotel Type | Style | Layout | Overlay | Notes |
|------------|-------|--------|---------|-------|
| Luxury | elegant | split | dark | Premium feel with drama |
| Budget | minimal | centered | none | Clean, approachable |
| Boutique | modern | split | gradient | Trendy, artistic |
| Resort | bold | fullscreen | light | Immersive, adventurous |
| Business | classic | centered | dark | Professional, reliable |

**Avoid Combinations:**
- minimal + dark overlay (poor contrast)
- elegant + bold (conflicting styles)
- fullscreen + compact height (contradictory)

## LLM Selection Guidelines

### Decision Tree

```
IF hotelType === "luxury" THEN
  style = "elegant" | "classic"
  overlay = "dark" | "gradient"

IF targetAudience === "business" THEN
  layout = "centered" | "split"
  style = "professional" | "classic"

IF brandPersonality === "modern" THEN
  style = "modern" | "minimal"
  layout = "split" | "fullscreen"
```

### Content Guidelines

**Heading:**
- Length: 10-60 characters
- Tone: Match brand personality (formal vs casual)
- Focus: Hotel unique selling proposition
- Examples:
  - Luxury: "Excellence in Every Detail"
  - Budget: "Comfort That Fits Your Budget"
  - Boutique: "Where Art Meets Hospitality"

**Subheading:**
- Length: 20-150 characters (optional)
- Purpose: Expand on heading, add context
- Examples:
  - Luxury: "Experience world-class hospitality in the heart of downtown"
  - Budget: "Clean rooms, friendly service, unbeatable value"

**CTA Text:**
- Length: 3-30 characters
- Action-oriented verbs
- Examples:
  - Luxury: "Reserve Your Suite" | "Book Now"
  - Budget: "Check Availability" | "See Rooms"

## Examples

### Example 1: Luxury Business Hotel

```json
{
  "variant": {
    "style": "elegant",
    "layout": "split",
    "overlay": "dark",
    "height": "medium"
  },
  "heading": "Excellence in Every Detail",
  "subheading": "Experience world-class hospitality in the heart of the financial district",
  "ctaText": "Reserve Your Suite",
  "ctaLink": "/rooms",
  "backgroundImage": {
    "desktop": "https://cdn.example.com/hero-luxury.webp",
    "mobile": "https://cdn.example.com/hero-luxury.m.webp"
  }
}
```

### Example 2: Budget Family Hotel

[Additional examples for different hotel types]

## Constraints

### Technical Constraints
- Background images MUST be .webp format
- Mobile images MUST be .m.webp format
- Image dimensions: Desktop 1920×1080, Mobile 768×1024
- Component must work at 375px, 768px, 1280px breakpoints

### Content Constraints
- Heading: 10-60 characters (ZOD enforced)
- Subheading: 20-150 characters (ZOD enforced)
- CTA text: 3-30 characters (ZOD enforced)
- No HTML in text fields
- All URLs must be valid and accessible

### Performance Constraints
- Lazy load background images
- Provide aspect ratio to prevent layout shift
- Optimize images (WebP, compressed)
- Render time <50ms (p95)

## Accessibility Requirements

- Heading uses semantic HTML (`<h1>`)
- CTA button has clear focus state
- Background image has `alt` text (or is decorative)
- Keyboard navigable (Tab to CTA, Enter to activate)
- Screen reader announces heading and CTA text
- Color contrast ratio ≥4.5:1 (WCAG AA)

## Responsive Behavior

### Mobile (<768px)
- Heading font size: 2rem (32px)
- Layout: Stack vertically (even for split variant)
- Padding: 1rem horizontal
- Background image: Mobile .m.webp version

### Desktop (≥768px)
- Heading font size: 3rem (48px)
- Layout: Respect variant (split shows 2-column grid)
- Padding: 2rem horizontal
- Background image: Desktop .webp version

## Testing Guidelines

### Unit Tests
- Component renders with all variant combinations
- Props validate correctly via ZOD schema
- Invalid props throw validation errors
- Responsive classes apply at correct breakpoints

### Visual Regression
- Baseline snapshots for each variant
- Test at 375px, 768px, 1280px viewports
- Verify overlay rendering
- Check text contrast on backgrounds

### Integration Tests
- Component integrates with Navigation/Layout
- CTA link navigates correctly
- Background images load and display
- No console errors or warnings

## Common Pitfalls

1. **Invalid Image Format:** LLM generates .jpg/.png instead of .webp
   - **Fix:** Strictly enforce `.endsWith('.webp')` in ZOD schema

2. **Text Too Long:** Heading exceeds 60 characters
   - **Fix:** ZOD `.max(60)` constraint prevents this

3. **Poor Contrast:** Light text on light overlay
   - **Fix:** Use decision tree (minimal style → no/light overlay only)

4. **Missing Mobile Image:** Only desktop URL provided
   - **Fix:** ZOD schema requires both desktop and mobile URLs

## Version History

- **v1.0** (2025-11-20): Initial documentation created
- **v1.1** (TBD): Updates based on generation learnings

## Related Documentation

- [CVA Variants Registry](/web-app/lib/cva-variants.ts)
- [ZOD Contract Registry](/web-app/lib/contracts/index.ts)
- [Component Source Code](/web-app/components/blocks/HeroSection/)
- [Story 1.9: ZOD Infrastructure](../epics/epic-1.core-structure.md#story-19)
````

**Requirements:**
- [ ] Documentation created for all 8 components
- [ ] Each doc follows template structure
- [ ] Decision trees provided for LLM selection
- [ ] 3-5 examples per component (different hotel types)
- [ ] Constraints clearly documented
- [ ] Common pitfalls catalogued
- [ ] Cross-references to source code and architecture docs

**Cross-Reference Requirements:**

Each component documentation MUST include links to:
- [ ] **PRD Functional Requirement**: Link to relevant FR section (e.g., `FR3: Hero Section`, `FR4: Gallery System`)
- [ ] **Epic 1 Story**: If component created in Epic 1, link to original story (e.g., Story 1.4 for Hero)
- [ ] **ZOD Contract**: Direct link to schema definition in `/web-app/lib/contracts/index.ts`
- [ ] **CVA Variants**: Direct link to variant configuration in `/web-app/lib/cva-variants.ts`
- [ ] **Component Source**: Link to actual component file `/web-app/components/[path]/index.tsx`
- [ ] **Epic 7 Integration**: Brief note on how LangGraph agents will use this component
- [ ] **Story 1.11 Design System**: Link to design token usage (for color/spacing references)

**Example Cross-Reference Section:**
```markdown
## Related Documentation

**Architecture:**
- [PRD - FR3: Hero Section Component](/docs/prd.md#fr3-hero-section)
- [Story 1.4: Hero Section Implementation](/docs/epics/epic-1.core-structure.md#story-14)
- [Story 1.11: Tailwind Design System](/docs/epics/epic-1.core-structure.md#story-111)

**Implementation:**
- [ZOD Contract: HeroSectionContract](/web-app/lib/contracts/index.ts#L45-L78)
- [CVA Variants: heroVariants](/web-app/lib/cva-variants.ts#L12-L56)
- [Component Source Code](/web-app/components/sections/HeroSection/index.tsx)

**LLM Generation (Epic 7):**
- Used by: StylingAgent (variant selection), ContentGenerator (heading/CTA), AssemblyAgent (page composition)
- Prompt context: Requires hotelType, targetAudience, brandPersonality parameters
- Quality gates: ZOD validation, A11y check, responsive rendering test
```

#### Golden Datasets

**Create Test Datasets for Regression Testing:**

**Location:** `docs/components/golden-datasets/`

**File Format:** JSON

**Template:**

```json
{
  "datasetName": "hero-section-golden-v1",
  "component": "HeroSection",
  "contractSchema": "HeroSectionContract",
  "createdAt": "2025-11-20T00:00:00Z",
  "lastUpdated": "2025-11-20T00:00:00Z",
  "version": "1.0",
  "testCases": [
    {
      "id": "luxury-business-1",
      "description": "Elegant hero for luxury business hotel",
      "hotelContext": {
        "type": "luxury",
        "targetAudience": "business",
        "brandPersonality": "professional",
        "location": "downtown-financial-district"
      },
      "expectedOutput": {
        "variant": {
          "style": "elegant",
          "layout": "split",
          "overlay": "dark",
          "height": "medium"
        },
        "heading": "Excellence in Every Detail",
        "subheading": "Experience world-class hospitality in the heart of the financial district",
        "ctaText": "Reserve Your Suite",
        "ctaLink": "/rooms",
        "backgroundImage": {
          "desktop": "https://cdn.example.com/hero-luxury-business.webp",
          "mobile": "https://cdn.example.com/hero-luxury-business.m.webp"
        }
      },
      "qualityThresholds": {
        "relevanceScore": 0.90,
        "creativityScore": 0.70,
        "brandAlignmentScore": 0.95,
        "humanRating": 9
      },
      "validationRules": {
        "mustPassZOD": true,
        "mustMeetA11y": true,
        "mustRenderWithoutErrors": true
      }
    },
    {
      "id": "budget-family-1",
      "description": "Minimal hero for budget family hotel",
      "hotelContext": {
        "type": "budget",
        "targetAudience": "family",
        "brandPersonality": "friendly",
        "location": "suburban-near-attractions"
      },
      "expectedOutput": {
        "variant": {
          "style": "minimal",
          "layout": "centered",
          "overlay": "none",
          "height": "small"
        },
        "heading": "Comfort That Fits Your Budget",
        "subheading": "Clean rooms, friendly service, perfect for families exploring the city",
        "ctaText": "Check Availability",
        "ctaLink": "/rooms",
        "backgroundImage": {
          "desktop": "https://cdn.example.com/hero-budget-family.webp",
          "mobile": "https://cdn.example.com/hero-budget-family.m.webp"
        }
      },
      "qualityThresholds": {
        "relevanceScore": 0.85,
        "creativityScore": 0.60,
        "brandAlignmentScore": 0.90,
        "humanRating": 8
      }
    }
    // ... 3-5 test cases per component
  ],
  "notes": "Golden dataset for regression testing. Update when component schema changes."
}
```

**Requirements:**
- [ ] Golden datasets created for all 8 components
- [ ] 3-5 test cases per component
- [ ] Covers major hotel type variations (luxury, budget, boutique, resort, business)
- [ ] Includes quality thresholds for LLM-as-judge evaluation
- [ ] Includes hotel context (type, audience, personality)
- [ ] All test cases pass current ZOD schema validation

### Testing Requirements

**Documentation Validation:**
- [ ] All 8 component docs exist and follow template
- [ ] Decision trees are clear and actionable
- [ ] Examples are valid JSON (parseable)
- [ ] Cross-references link to existing files
- [ ] No broken internal links

**Golden Dataset Validation:**
- [ ] All 8 golden datasets exist
- [ ] Each test case passes ZOD schema validation
- [ ] Quality thresholds are reasonable (0.6-1.0 range)
- [ ] Hotel contexts cover diverse scenarios
- [ ] JSON is valid and parseable

**Integration Testing:**
- [ ] LLM can consume documentation (manual test with Claude)
- [ ] Documentation enables correct component selection
- [ ] Examples can be copy-pasted and work

### Definition of Done

- [ ] Component documentation created for all 8 components
- [ ] Golden datasets created for all 8 components
- [ ] All examples pass ZOD validation
- [ ] Documentation follows consistent template
- [ ] Cross-references verified
- [ ] Code review completed
- [ ] Committed to repository

### Notes

- Documentation is written FOR LLMs (clear, structured, examples-heavy)
- Golden datasets will be used in Story 2.5 for quality validation
- Update documentation as learnings emerge from generation testing
- **Cross-reference:** [Component System Architecture](/docs/03-component-system/architecture.md)

---

## Story 2.4: Develop Manual Generation Prompts (Claude Code Workflow)

**Story Points:** 8
**Duration:** 5-6 days
**Dependencies:** Story 2.3 complete

### User Story

**As a** developer using Claude Code
**I want** structured prompts for manual homepage generation
**So that** I can iteratively refine prompts before LangGraph automation

### Business Value

Creates production-ready prompt templates through manual iteration, establishing proven patterns before Epic 7 automation. Validates quality thresholds (85-90%) and architectural patterns early.

### 📝 **NOTE: Cost Tracking Deferred to Epic 7**

**Cost validation and LangFuse integration are NOT in scope for Epic 2.** This story focuses solely on prompt development and quality validation. All cost tracking, budget validation, and optimization will be implemented in Epic 7 when LangGraph automation is added.

**Removed from this story:**
- ❌ LangFuse cost tracking integration
- ❌ Token counting and cost calculation
- ❌ $2/site budget validation
- ❌ Cost optimization analysis

**Focus remains on:**
- ✅ Prompt template development
- ✅ Quality validation (85-90% threshold)
- ✅ Architectural pattern validation
- ✅ ZOD schema robustness testing

### Acceptance Criteria

#### Prompt Template Documentation

**Create Prompt Workflow Guide:**

**File:** `docs/prompts/manual-generation-workflow.md`

**Contents:**
[See Epic 2 deliverable #4 for full structure]

**Requirements:**
- [ ] 4-step manual workflow documented (Component Selection, Styling, Content Generation, Assembly)
- [ ] Input/output schemas defined for each step
- [ ] Prompt templates in copy-pasteable format
- [ ] Error handling guidance included
- [ ] Quality assessment criteria specified (not cost tracking)

#### Prompt Templates (LangGraph-Compatible Structure)

**Agent 1: Component Selector Prompt**

**File:** `docs/prompts/01-component-selector.md`

````markdown
# Agent 1: Component Selector

## Purpose
Select appropriate components for homepage based on hotel type, target audience, and brand personality.

## Input Schema

```typescript
const ComponentSelectorInput = z.object({
  hotelType: z.enum(["luxury", "budget", "boutique", "resort", "business"]),
  targetAudience: z.enum(["business", "leisure", "family", "couples", "backpackers"]),
  brandPersonality: z.enum(["elegant", "modern", "friendly", "professional", "adventurous"])
});
```

## Prompt Template

Copy this prompt to Claude Code, replacing {variables}:

---

You are a component selection expert for hotel websites. Your task is to select the optimal homepage components for a hotel based on its characteristics.

**Hotel Characteristics:**
- Type: {hotelType}
- Target Audience: {targetAudience}
- Brand Personality: {brandPersonality}

**Available Components:**
1. Hero Section - Prominent visual introduction with CTA
2. Navigation - Site navigation and branding
3. Room Cards - Room showcase with pricing
4. Image Gallery - Hotel/room photo collection
5. Testimonials - Customer reviews and ratings
6. Amenities - Hotel facilities and services
7. Booking Widget - Date/guest selection for booking
8. Contact Form - Contact information and inquiry form

**Your Task:**
1. Select 5-8 components for the homepage
2. Recommend layout structure (single-column, grid, or mixed)
3. Identify which components should be emphasized (prominent placement)
4. Explain your reasoning

**Output Format (JSON):**
```json
{
  "selectedComponents": ["hero", "navigation", ...],
  "layoutStructure": "single-column" | "grid" | "mixed",
  "emphasisComponents": ["hero", "booking"],
  "reasoning": "Explanation of choices..."
}
```

**Constraints:**
- MUST include: hero, navigation (always required)
- Should include: 3-6 additional components
- Total: 5-8 components maximum
- Consider user journey and conversion goals

---

## Output Schema

```typescript
const ComponentSelectorOutput = z.object({
  selectedComponents: z.array(z.enum([
    "hero", "navigation", "rooms", "gallery",
    "testimonials", "amenities", "booking", "contact"
  ])).min(5).max(8),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]),
  emphasisComponents: z.array(z.string()).max(3),
  reasoning: z.string().min(50).max(500)
});
```

## Validation

After receiving LLM output:

```typescript
import { ComponentSelectorOutput } from '@/docs/prompts/schemas';

const output = /* LLM response */;

try {
  const validated = ComponentSelectorOutput.parse(output);
  console.log('✅ Valid component selection:', validated);
} catch (error) {
  console.error('❌ Validation failed:', error.message);
  // Re-query LLM with error details
}
```

## Quality Tracking

Track validation success rate and iterate on prompts:

```typescript
// Simple tracking for Epic 2 (no cost tracking)
const generationLog = {
  timestamp: new Date(),
  input: { hotelType, targetAudience, brandPersonality },
  output: validated,
  validationPassed: true,
  qualityNotes: "Good component selection, appropriate for luxury business hotel"
};

// Save to local log file for analysis
```

## Expected Patterns

**Luxury + Business:**
- Components: hero, navigation, rooms, gallery, testimonials, amenities, booking
- Layout: Mixed (hero fullwidth, grid for rooms/amenities)
- Emphasis: hero, booking

**Budget + Family:**
- Components: hero, navigation, rooms, amenities, contact
- Layout: Single-column (simpler)
- Emphasis: rooms (price focus)

**Boutique + Couples:**
- Components: hero, navigation, gallery, rooms, testimonials, booking
- Layout: Grid (visual focus)
- Emphasis: gallery, hero

## Iteration Notes

Track failures and patterns:
- [ ] Iteration 1: Baseline prompt
- [ ] Iteration 2: [Refinements based on failures]
- [ ] Iteration 3: [Further refinements]
- [ ] Iteration 4: [Final tuning]
- [ ] Target: 3-5 iterations to achieve 85%+ quality
````

**Create Similar Templates For:**
- [ ] Agent 2: Styling Agent (`02-styling-agent.md`)
- [ ] Agent 3: Content Generator (`03-content-generator.md`)
- [ ] Agent 4: Assembly Agent (`04-assembly-agent.md`)

### Prompt Quality Criteria

**Each prompt template MUST include the following sections:**

1. **Role Definition**: Clear agent persona and responsibility
   - Example: "You are the ComponentSelector agent responsible for choosing optimal homepage components..."

2. **Input Schema**: Exact JSON structure with ZOD validation
   - Must be copy-pasteable TypeScript/ZOD code
   - Include all required and optional fields
   - Specify enums for constrained values

3. **Output Schema**: Expected JSON response format with ZOD validation
   - Must match what LangGraph nodes will expect in Epic 7
   - Include validation rules (min/max, enums, formats)
   - Specify error messages for failed validation

4. **Selection Heuristics**: Decision rules and logic patterns
   - IF/THEN conditions for common scenarios
   - Examples of good vs bad selections
   - Trade-offs and considerations

5. **Concrete Examples**: 2-3 complete input/output pairs
   - Cover diverse hotel types (luxury, budget, boutique)
   - Show successful generation patterns
   - Demonstrate edge cases

6. **Error Recovery Instructions**: What to do when generation fails
   - Common failure modes catalogued
   - Self-correction patterns
   - When to ask for clarification vs retry

**Success Criteria for Prompt Quality:**

- [ ] Prompts generate ZOD-compliant outputs **95%+ of time** (tracked manually)
- [ ] Prompts follow consistent structure across all 4 "agents"
- [ ] Prompts documented in LangGraph-compatible format (ready for Epic 7)
- [ ] Prompts tested with both Claude Haiku and Sonnet (note model differences)
- [ ] Error recovery patterns documented from actual failures

**Validation Workflow:**

```typescript
// After each LLM response, validate immediately
const result = await claude.generate(promptTemplate);

try {
  const validated = OutputSchema.parse(result);
  logSuccess({ iteration, validated, qualityNotes });
} catch (error) {
  logFailure({ iteration, error, llmResponse: result });
  // Refine prompt based on failure pattern
  // Re-test with updated prompt
}
```

**Iteration Target:** 3-5 prompt refinement cycles per agent to achieve 95% schema compliance and 85-90% quality threshold.

#### Execution Workflow Documentation

**File:** `docs/prompts/execution-guide.md`

```markdown
# Manual Generation Workflow - Execution Guide

## Prerequisites

1. Component documentation complete (Story 2.3) ✅
2. Golden datasets available for reference ✅
3. LangFuse API credentials configured ✅
4. Claude Code Pro/Enterprise access ✅

## Workflow Steps

### Step 1: Define Hotel Parameters

Create input JSON for the generation:

```json
{
  "generationId": "luxury-business-v1",
  "hotelType": "luxury",
  "targetAudience": "business",
  "brandPersonality": "professional",
  "hotelName": "The Sterling Executive",
  "location": "Downtown Financial District"
}
```

Save this as `generation-input.json` or keep in scratch file.

### Step 2: Execute Component Selection (Agent 1)

1. Open `docs/prompts/01-component-selector.md`
2. Copy prompt template
3. Replace {hotelType}, {targetAudience}, {brandPersonality} with actual values
4. Paste into Claude Code
5. Review output JSON
6. Validate with ComponentSelectorOutput schema
7. Save output to `step1-component-selection.json`
8. Note any quality issues or improvements needed

### Step 3: Execute Styling Agent (Agent 2)

1. Open `docs/prompts/02-styling-agent.md`
2. Copy prompt template
3. Include previous step output as context:
   - Input: Hotel parameters + selected components
   - Output: CVA variant selections for each component
4. Paste into Claude Code
5. Review output JSON
6. Validate with StylingAgentOutput schema
7. Save output to `step2-styling.json`
8. Note any quality issues or improvements needed

### Step 4: Execute Content Generator (Agent 3)

1. Open `docs/prompts/03-content-generator.md`
2. Include previous steps as context
3. Reference component documentation for content guidelines
4. Paste into Claude Code
5. Review generated content (headings, descriptions, etc.)
6. Validate with ContentGeneratorOutput schema
7. Save output to `step3-content.json`
8. Note any quality issues or improvements needed

### Step 5: Execute Assembly Agent (Agent 4)

1. Open `docs/prompts/04-assembly-agent.md`
2. Include ALL previous steps as context
3. Request final homepage configuration JSON
4. Paste into Claude Code
5. Review complete configuration
6. Validate with HomepageConfigSchema
7. Save output to `step4-homepage-complete.json`
8. Note any quality issues or improvements needed

### Step 6: Quality Review

1. Load configuration into development environment
2. Render homepage with generated config
3. Visual inspection at 375px, 768px, 1280px
4. Rate quality 1-10
5. Note any issues or improvements
6. Document in `generation-review.md`

### Step 7: Iteration (If Needed)

If quality score <8/10 or validation fails:

1. Identify failure mode (schema violation, poor content quality, etc.)
2. Refine relevant prompt template
3. Re-execute failed step
4. Document iteration in prompt template notes
5. Update quality tracking

Target: 3-5 iterations to achieve 85-90% quality

## Tracking Sheet

Create `generation-tracking.csv`:

```csv
GenerationID,HotelType,Audience,ComponentsCount,QualityScore,ValidationPassed,Issues,Iterations
luxury-business-v1,luxury,business,7,9,Yes,"None",1
budget-family-v1,budget,family,5,8,Yes,"Heading too long",2
...
```

## Success Criteria

- [ ] 10 homepage variations generated
- [ ] 9/10 rated ≥8/10 quality (85-90%)
- [ ] All pass ZOD validation
- [ ] Failure modes documented
- [ ] Prompt iteration patterns identified
```

**Requirements:**
- [ ] Execution guide documents complete workflow
- [ ] Quality review process specified
- [ ] Iteration guidance provided
- [ ] Tracking template created (quality-focused, not cost)

### Testing Requirements

**Prompt Validation:**
- [ ] All 4 prompt templates created
- [ ] Input/output schemas defined and documented
- [ ] Prompts are copy-pasteable (no markdown formatting issues)
- [ ] Examples included in each prompt

**Workflow Validation:**
- [ ] Execute workflow manually for 1 test case
- [ ] Verify each step produces valid JSON
- [ ] Confirm quality tracking works
- [ ] Validate output passes ZOD schemas
- [ ] Verify quality meets 8+ threshold

**Documentation Quality:**
- [ ] Prompts are clear and unambiguous
- [ ] Decision trees are actionable
- [ ] Error handling guidance included
- [ ] Quality criteria are well-defined

### Definition of Done

- [ ] 4 prompt templates created (Component Selection, Styling, Content, Assembly)
- [ ] Manual workflow documentation complete
- [ ] Input/output schemas defined for all steps
- [ ] Quality tracking process documented
- [ ] 1 test case executed successfully to validate workflow
- [ ] Prompts stored in version control
- [ ] Code review completed
- [ ] **NOTE: Cost tracking explicitly excluded from this story (deferred to Epic 7)**

### Notes

- Prompts MUST be structured for eventual LangGraph automation
- JSON input/output format critical for transition
- Track prompt iterations to measure refinement cycles
- Expected: 3-5 iterations per prompt to achieve production quality
- **Cross-reference:** [LangGraph Workflow Design](/docs/04-llm-orchestration/langgraph-workflows.md)

---

## Story 2.5: Generate 10 Homepage Variations + Quality Assessment

**Story Points:** 8
**Duration:** 5-6 days (includes iteration time)
**Dependencies:** Story 2.4 complete

### User Story

**As a** product team
**I want** 10+ validated homepage variations
**So that** I can confirm the generation system produces quality, diverse outputs meeting architectural validation goals

### Business Value

Validates end-to-end generation workflow with real outputs, proving quality thresholds and architectural patterns before Epic 7 automation investment.

### 📝 **NOTE: Cost Tracking Deferred to Epic 7**

**This story does NOT include cost tracking or budget validation.** Focus is on quality assessment, ZOD schema validation, and architectural pattern verification. Remove all cost-related tracking and analysis from this story.

### Acceptance Criteria

#### Homepage Generation Targets

**Generate 10+ Variations Covering:**

| Generation ID | Hotel Type | Target Audience | Brand Personality | Priority |
|--------------|------------|-----------------|-------------------|----------|
| luxury-business-v1 | luxury | business | professional | High |
| luxury-leisure-v1 | luxury | leisure | elegant | High |
| budget-family-v1 | budget | family | friendly | High |
| budget-backpackers-v1 | budget | backpackers | casual | Medium |
| boutique-couples-v1 | boutique | couples | romantic | High |
| boutique-artistic-v1 | boutique | leisure | modern | Medium |
| resort-adventure-v1 | resort | leisure | adventurous | High |
| resort-relaxation-v1 | resort | couples | elegant | Medium |
| business-corporate-v1 | business | business | professional | High |
| business-conference-v1 | business | business | modern | Medium |
| luxury-business-v2 | luxury | business | elegant | Low (variation test) |

**Requirements:**
- [ ] Minimum 10 generations completed
- [ ] Covers all 5 hotel types (luxury, budget, boutique, resort, business)
- [ ] Covers diverse audiences (business, leisure, family, couples, backpackers)
- [ ] Covers diverse brand personalities (professional, elegant, friendly, modern, adventurous)
- [ ] At least 1 variation test (same inputs, different outputs)

#### Generation Process

**For Each Variation:**

1. **Define Input Parameters**
   ```json
   {
     "generationId": "luxury-business-v1",
     "timestamp": "2025-12-01T10:30:00Z",
     "hotelType": "luxury",
     "targetAudience": "business",
     "brandPersonality": "professional",
     "hotelName": "The Sterling Executive",
     "location": "Downtown Financial District"
   }
   ```

2. **Execute 4-Step Workflow** (from Story 2.4)
   - Component Selection
   - Styling Selection
   - Content Generation
   - Assembly

3. **Validate Output**
   ```typescript
   // Validate against HomepageConfigSchema
   const result = HomepageConfigSchema.safeParse(generatedConfig);

   if (!result.success) {
     console.error('Validation failed:', result.error);
     // Document failure, iterate on prompts
   }
   ```

4. **Track Costs**
   ```typescript
   const costs = {
     componentSelection: 0.15,
     styling: 0.25,
     contentGeneration: 1.20,
     assembly: 0.25,
     total: 1.85
   };

   await langfuse.track('homepage_generation_complete', {
     generationId: 'luxury-business-v1',
     costs,
     totalTokens: { input: 3500, output: 1200 },
     model: 'claude-sonnet-4.5'
   });
   ```

5. **Quality Review**
   - Render in development environment
   - Visual inspection at 375px, 768px, 1280px
   - Rate overall quality (1-10)
   - Document issues/improvements

6. **Save Artifacts**
   ```
   docs/validation/generated-homepages/
   ├── luxury-business-v1/
   │   ├── input.json
   │   ├── step1-components.json
   │   ├── step2-styling.json
   │   ├── step3-content.json
   │   ├── step4-complete.json
   │   ├── quality-review.md
   │   └── screenshots/
   │       ├── mobile-375px.png
   │       ├── tablet-768px.png
   │       └── desktop-1280px.png
   └── [... other variations]
   ```

**Requirements:**
- [ ] All steps documented in generation artifact folders
- [ ] Costs tracked for every step
- [ ] Quality reviews completed
- [ ] Screenshots captured at 3 breakpoints

#### Quality Assessment Framework

**Create Assessment Rubric:**

**File:** `docs/validation/quality-assessment-rubric.md`

```markdown
# Homepage Generation Quality Assessment Rubric

## Scoring Dimensions (1-10 scale)

### 1. Contract Compliance (Pass/Fail + Score)
- **10:** Passes all ZOD validations, zero errors
- **7-9:** Passes with minor warnings (non-blocking)
- **4-6:** Fails some validations but fixable
- **1-3:** Major validation failures
- **0:** Cannot parse output

**Weight:** 30% (must pass to be production-ready)

### 2. Relevance to Hotel Type
- **10:** Perfect alignment with hotel type characteristics
- **7-9:** Strong alignment, minor inconsistencies
- **4-6:** Partially aligned, notable gaps
- **1-3:** Poor alignment, inappropriate choices
- **0:** Completely irrelevant

**Weight:** 25%

Examples:
- Luxury + elegant styling ✅ (10)
- Luxury + minimal styling ⚠️ (6-7, works but not optimal)
- Luxury + casual friendly tone ❌ (2-3, misaligned)

### 3. Content Quality
- **10:** Compelling, error-free, appropriate tone
- **7-9:** Good quality, minor improvements possible
- **4-6:** Acceptable but generic/formulaic
- **1-3:** Poor quality, errors, wrong tone
- **0:** Nonsensical or broken

**Weight:** 20%

Criteria:
- Grammar and spelling
- Tone match to brand personality
- Appropriate length (within constraints)
- Originality (not templated)
- Call-to-action effectiveness

### 4. Design System Compliance
- **10:** Perfect CVA variant usage, cohesive design
- **7-9:** Minor inconsistencies in variant choices
- **4-6:** Some poor variant combinations
- **1-3:** Conflicting styles, broken design
- **0:** Complete design failure

**Weight:** 15%

Criteria:
- Variant combinations follow guidelines
- Visual hierarchy clear
- Responsive behavior works
- No conflicting styles

### 5. Completeness
- **10:** All required components present and configured
- **7-9:** Minor missing optional elements
- **4-6:** Some required elements missing
- **1-3:** Major gaps in component selection
- **0:** Incomplete or broken configuration

**Weight:** 10%

## Overall Quality Score Calculation

```
Overall = (ContractCompliance × 0.30) +
          (Relevance × 0.25) +
          (ContentQuality × 0.20) +
          (DesignCompliance × 0.15) +
          (Completeness × 0.10)
```

## Production-Ready Threshold

**Target: 85-90% overall (8.5-9.0 score)**

- **9.0-10.0:** Excellent - Production ready, minimal edits
- **8.5-8.9:** Good - Production ready with minor tweaks
- **7.0-8.4:** Acceptable - Needs moderate refinement
- **<7.0:** Needs Improvement - Significant rework required

## Assessment Template

```markdown
# Quality Assessment: {generationId}

## Metadata
- Generation ID: luxury-business-v1
- Assessed By: [Reviewer Name]
- Date: 2025-12-01
- Environment: Development (local)

## Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| Contract Compliance | 10/10 | All ZOD validations pass ✅ |
| Relevance | 9/10 | Excellent hotel type alignment |
| Content Quality | 8/10 | Minor typo in subheading |
| Design Compliance | 9/10 | Perfect variant choices |
| Completeness | 10/10 | All components present |
| **Overall** | **9.0/10** | **Production Ready** ✅ |

## Detailed Feedback

### Strengths
- Perfect variant selection (elegant + split + dark overlay)
- Compelling heading: "Excellence in Every Detail"
- All required components included
- Responsive behavior works perfectly

### Issues
- Subheading typo: "hospitatlity" → "hospitality"
- CTA link points to /rooms (should be /booking)

### Recommendations
- Fix typo in content generation prompt
- Add URL validation for CTA links

## Cost Tracking
- Total Cost: $1.85
- Budget: $2.00
- Status: ✅ Under budget

## Screenshots
- Mobile (375px): ✅ Attached
- Tablet (768px): ✅ Attached
- Desktop (1280px): ✅ Attached

## Decision
- [x] Production Ready (≥8.5 score)
- [ ] Needs Minor Refinement (7.0-8.4)
- [ ] Needs Significant Rework (<7.0)

## Next Steps
- Fix typo via prompt refinement
- Re-generate to confirm fix
```
```

**Requirements:**
- [ ] Quality rubric documented
- [ ] Assessment template created
- [ ] Scoring weights defined
- [ ] Production-ready threshold specified (8.5-9.0)

#### Validation Metrics Tracking

**Create Tracking Dashboard:**

**File:** `docs/validation/generation-metrics.md`

```markdown
# Homepage Generation Metrics Dashboard

## Summary Statistics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total Generations | 10+ | 11 | ✅ |
| Contract Compliance | 100% | 100% (11/11) | ✅ |
| Quality Score Avg | 8.5-9.0 | 8.7 | ✅ |
| Production Ready | 90% (9/10) | 91% (10/11) | ✅ |
| Cost Per Homepage | <$2.00 | $1.82 avg | ✅ |
| Error Rate | <5% | 0% (0/11) | ✅ |

## Detailed Results

| ID | Hotel Type | Quality Score | Cost | Production Ready | Issues |
|----|------------|---------------|------|------------------|--------|
| luxury-business-v1 | luxury | 9.0 | $1.85 | ✅ | Typo in subheading |
| luxury-leisure-v1 | luxury | 8.8 | $1.95 | ✅ | None |
| budget-family-v1 | budget | 8.5 | $1.65 | ✅ | None |
| budget-backpackers-v1 | budget | 7.8 | $1.50 | ⚠️ | Generic content |
| boutique-couples-v1 | boutique | 9.2 | $1.90 | ✅ | None |
| boutique-artistic-v1 | boutique | 8.9 | $1.88 | ✅ | None |
| resort-adventure-v1 | resort | 8.6 | $1.75 | ✅ | None |
| resort-relaxation-v1 | resort | 9.1 | $1.92 | ✅ | None |
| business-corporate-v1 | business | 8.4 | $1.70 | ⚠️ | Needs refinement |
| business-conference-v1 | business | 8.7 | $1.80 | ✅ | None |
| luxury-business-v2 | luxury | 9.0 | $1.85 | ✅ | None (variation test) |

## Cost Breakdown

```
Average Cost: $1.82
Min Cost: $1.50 (budget-backpackers-v1)
Max Cost: $1.95 (luxury-leisure-v1)
Budget Variance: -$0.18 (9% under budget)

Cost by Step:
- Component Selection: $0.15 avg
- Styling: $0.25 avg
- Content Generation: $1.17 avg (highest variance)
- Assembly: $0.25 avg
```

## Quality Distribution

```
9.0-10.0 (Excellent):     5 generations (45%)
8.5-8.9 (Good):          4 generations (36%)
7.0-8.4 (Acceptable):    2 generations (18%)
<7.0 (Needs Work):       0 generations (0%)

Production Ready: 10/11 (91%)
```

## Failure Modes Identified

1. **Generic Content (budget-backpackers-v1)**
   - Issue: Content generator produced template-like text
   - Fix: Add "avoid clichés" instruction to content prompt
   - Status: Fixed in iteration 2

2. **Typo in Content (luxury-business-v1)**
   - Issue: "hospitatlity" typo
   - Fix: Request LLM to self-review for typos
   - Status: Fixed in subsequent generations

## Iteration Tracking

| Prompt | Initial Quality | Iteration 1 | Iteration 2 | Iteration 3 | Final |
|--------|----------------|-------------|-------------|-------------|-------|
| Component Selector | 8.5 | 8.8 | 9.0 | - | 9.0 |
| Styling Agent | 9.0 | - | - | - | 9.0 |
| Content Generator | 7.8 | 8.2 | 8.7 | 8.9 | 8.9 |
| Assembly Agent | 9.2 | - | - | - | 9.2 |

**Total Iterations:** 6 (across 4 prompts)
**Target:** 3-5 iterations per prompt ✅

## Key Learnings

### What Worked
✅ CVA variant system ensures design consistency
✅ ZOD schemas prevent invalid configurations (100% pass rate)
✅ Decision trees guide appropriate component selection
✅ Detailed examples in docs improve content quality

### What Needs Improvement
⚠️ Content generation prompt needs anti-cliché guidance
⚠️ Need self-review step for typos/grammar
⚠️ Cost variance high for content generation ($1.05-$1.30 range)

### Optimization Opportunities
💡 Prompt caching could reduce cost by 50-90% for repeated context
💡 Model routing (Haiku for styling, Sonnet for content) could save 30%
💡 Batch processing could save 50% for overnight generation

## Recommendations for Epic 7

1. **Implement prompt caching** - Biggest cost savings opportunity
2. **Add self-review step** - Catch typos/grammar automatically
3. **Use model routing** - Haiku for simple tasks, Sonnet for complex
4. **Add diversity scoring** - Ensure variations aren't too similar
5. **Automate quality assessment** - LLM-as-judge for faster feedback
```

**Requirements:**
- [ ] Metrics dashboard created
- [ ] All 10+ generations tracked
- [ ] Cost breakdown calculated
- [ ] Quality distribution analyzed
- [ ] Failure modes documented
- [ ] Learnings catalogued

### Testing Requirements

**Generation Validation:**
- [ ] All 10+ generations complete
- [ ] 100% pass ZOD contract validation
- [ ] 90%+ rated "production ready" (≥8.5 score)
- [ ] Average cost <$2.00
- [ ] Screenshots captured for all variations

**Quality Assessment:**
- [ ] All generations assessed using rubric
- [ ] Scores documented in tracking sheet
- [ ] Issues catalogued
- [ ] Recommendations documented

**Artifact Validation:**
- [ ] All generation folders complete (input, steps, review, screenshots)
- [ ] JSON files valid and parseable
- [ ] Quality reviews follow template
- [ ] Cost tracking complete

### Definition of Done

- [ ] 10+ homepage variations generated
- [ ] 100% contract compliance (all pass ZOD validation)
- [ ] 90%+ production ready (9/10+ score ≥8.5)
- [ ] Average cost <$2.00 validated
- [ ] Quality assessments completed for all variations
- [ ] Metrics dashboard created and populated
- [ ] Failure modes documented
- [ ] Key learnings captured
- [ ] Screenshots archived
- [ ] Artifacts committed to repository

### Notes

- This story validates the ENTIRE Epic 2 hypothesis
- Success here means Epic 7 automation is de-risked
- Expect 2-3 prompt iterations during this story
- Budget extra time for quality reviews (30-45min per variation)
- **Cross-reference:** [Cost Optimization Research](/docs/research/llm-cost-optimization-strategies-production-scale.md)

---

## Story 2.6: Prompt Refinement & Pattern Documentation

**Story Points:** 5
**Duration:** 3-4 days
**Dependencies:** Story 2.5 complete

### User Story

**As a** product team
**I want** refined prompts and documented generation patterns
**So that** Epic 7 LangGraph automation can leverage proven prompt templates

### Business Value

Consolidates learnings from 10+ homepage generations into production-ready prompt templates and pattern documentation, providing clear foundation for Epic 7 automation.

### 📝 **NOTE: Cost Tracking Removed from This Story**

**This story originally included "Cost Optimization" but is now focused purely on prompt quality and pattern documentation.** All cost-related analysis is deferred to Epic 7.

### Acceptance Criteria

#### Quality Analysis Report

**Create Comprehensive Quality Analysis:**

**File:** `docs/validation/quality-analysis-report.md`

**Requirements:**
- [ ] Quality breakdown by generation step (Component Selection, Styling, Content, Assembly)
- [ ] Prompt iteration analysis (which prompts needed refinement and why)
- [ ] Schema validation patterns (common failures and fixes)
- [ ] Quality variance analysis (consistency across hotel types)
- [ ] Pattern documentation for Epic 7

#### Prompt Optimization Strategies Document

**File:** `docs/validation/prompt-optimization-strategies.md`

```markdown
# Prompt Optimization Strategies

Based on analysis of 10+ homepage generations.

## Current State

**Average Quality:** 8.7/10 per homepage
**Target:** 8.5/10 (85-90% production-ready)
**Achievement:** ✅ Exceeds target
**Validation Pass Rate:** 100% (11/11 passed ZOD schemas)

## Identified Opportunities

### 1. Prompt Caching (Highest Impact)

**Potential Savings:** 50-90% on repeated context

**Implementation:**
- Cache component documentation across generations
- Cache hotel type guidelines
- Cache CVA variant definitions
- Cache ZOD schemas

**Example:**
```
Current (no caching):
- Input tokens: 3,500 per generation
- Cost: $0.0105 input + $0.06 output = $0.0705

With caching:
- Cached tokens: 2,500 (documentation, guidelines)
- Fresh tokens: 1,000 (hotel-specific)
- Cost: $0.0025 cached + $0.003 fresh + $0.06 output = $0.0655
- Savings: $0.005 per call × 4 steps = $0.02 per homepage
```

**Estimated Impact:** $0.20-0.40 savings per homepage
**ROI at 10,000 sites:** $2,000-4,000 savings

### 2. Model Routing (Medium Impact)

**Potential Savings:** 30-50% on simple tasks

**Strategy:**
- Use Haiku ($1/M in, $5/M out) for component selection and styling
- Use Sonnet ($3/M in, $15/M out) for content generation only
- Use Haiku for assembly (deterministic task)

**Example:**
```
Current (all Sonnet):
- Component Selection: $0.15
- Styling: $0.25
- Content: $1.20
- Assembly: $0.25
Total: $1.85

With routing:
- Component Selection (Haiku): $0.05
- Styling (Haiku): $0.08
- Content (Sonnet): $1.20
- Assembly (Haiku): $0.08
Total: $1.41
Savings: $0.44 (24%)
```

**Estimated Impact:** $0.40-0.60 savings per homepage
**ROI at 10,000 sites:** $4,000-6,000 savings

### 3. Prompt Compression (Low-Medium Impact)

**Potential Savings:** 10-20% token reduction

**Techniques:**
- Remove verbose examples, keep essential ones
- Use bullet points instead of paragraphs
- Compress decision trees to tables
- Remove redundant instructions

**Example:**
```
Current prompt (verbose):
"You are a component selection expert for hotel websites. Your task is to carefully analyze the hotel characteristics and select the most appropriate components that will best serve the target audience while maintaining brand consistency..." (2,000 tokens)

Compressed prompt:
"Select optimal homepage components for hotel.
Input: type, audience, personality
Output: 5-8 components (JSON)
Guidelines: [compressed decision tree]" (800 tokens)

Savings: 60% token reduction
```

**Estimated Impact:** $0.10-0.20 savings per homepage
**ROI at 10,000 sites:** $1,000-2,000 savings

### 4. Batch Processing (Low Impact, but enables scale)

**Potential Savings:** 50% API discount (OpenAI/Anthropic Batch APIs)

**Implementation:**
- Generate overnight for non-urgent sites
- Batch API processes 24h later with 50% discount
- Not applicable for real-time generation

**Estimated Impact:** $0.90 savings per homepage (if batched)
**ROI at 10,000 sites:** $9,000 savings (for overnight generation)

### 5. Output Length Control (Low Impact)

**Potential Savings:** 5-10% on output tokens

**Technique:**
- Specify max output length in prompts
- Request concise content (avoid verbosity)
- Limit examples in output

**Example:**
```
Current output (verbose):
- 1,200 output tokens
- Cost: $0.018

Controlled output:
- 900 output tokens
- Cost: $0.0135
- Savings: $0.0045 per step
```

**Estimated Impact:** $0.05-0.10 savings per homepage
**ROI at 10,000 sites:** $500-1,000 savings

## Prioritized Implementation Plan

### Phase 1: Quick Wins (Epic 2 Story 2.6)
1. ✅ Prompt compression - Implement immediately
2. ✅ Output length control - Add to prompts

**Expected Savings:** $0.15-0.30 per homepage
**Timeline:** 2-3 days

### Phase 2: Epic 7 (LangGraph Automation)
3. Implement prompt caching (requires API changes)
4. Implement model routing (Haiku/Sonnet logic)

**Expected Savings:** $0.60-1.00 per homepage
**Timeline:** Epic 7 Week 2

### Phase 3: Scale Optimization (Epic 8)
5. Batch processing for overnight generation

**Expected Savings:** $0.90 per homepage (batched only)
**Timeline:** Epic 8

## Target Cost Model

```
Current (optimized prompts): $1.70
After Epic 7 (caching + routing): $1.20
After Epic 8 (batching): $0.80 (overnight only)

Budget: $2.00 ✅
Headroom: $0.80 (40%)
```

## Monitoring & Validation

Track these metrics in Epic 7:
- Cost per step (component, styling, content, assembly)
- Token usage (input, output, cached)
- Model usage (Haiku vs Sonnet distribution)
- Quality impact (ensure optimizations don't degrade quality)

**Quality Threshold:** Must maintain ≥85% production-ready rate
```

**Requirements:**
- [ ] Optimization strategies documented
- [ ] Cost savings estimated for each strategy
- [ ] Implementation prioritized (Phase 1, 2, 3)
- [ ] ROI calculated for 10,000 sites
- [ ] Quality impact considered

#### Prompt Refinement

**Refine Prompts Based on Learnings:**

1. **Update Component Selector Prompt:**
   - Compress verbose instructions
   - Add output length limit
   - Incorporate failure mode fixes

2. **Update Content Generator Prompt:**
   - Add "avoid clichés" instruction
   - Add "self-review for typos" step
   - Reduce example verbosity
   - Specify max content lengths

3. **Document Changes:**
   ```markdown
   # Prompt Refinement Log

   ## Component Selector (v2.0)
   **Changes from v1.0:**
   - Compressed instructions (2,000 → 800 tokens, 60% reduction)
   - Added output length limit (max 200 tokens)
   - Clarified decision tree for boutique hotels

   **Impact:**
   - Cost: $0.15 → $0.08 (47% reduction)
   - Quality: 8.5 → 8.8 (+0.3, improved clarity)

   ## Content Generator (v2.1)
   **Changes from v2.0:**
   - Added anti-cliché instruction
   - Added self-review step for typos
   - Specified max content lengths (heading: 60 char, subheading: 150 char)

   **Impact:**
   - Cost: $1.20 → $1.15 (4% reduction)
   - Quality: 7.8 → 8.9 (+1.1, fewer typos/generic content)
   ```

**Requirements:**
- [ ] All 4 prompts reviewed and refined
- [ ] Token reduction achieved (10-20% target)
- [ ] Quality maintained or improved
- [ ] Changes documented in refinement log
- [ ] Updated prompts committed to repository

### Testing Requirements

**Cost Validation:**
- [ ] Re-generate 2-3 test cases with optimized prompts
- [ ] Measure cost reduction
- [ ] Verify quality maintained (≥8.5 score)
- [ ] Update metrics dashboard

**Optimization Validation:**
- [ ] Prompt compression tested (token count reduced)
- [ ] Output length control working (within limits)
- [ ] No quality degradation from optimization
- [ ] Cost savings validated

### Definition of Done

- [ ] Cost analysis report complete
- [ ] Optimization strategies documented and prioritized
- [ ] Prompts refined and optimized
- [ ] Token reduction achieved (10-20%)
- [ ] Cost savings validated (2-3 test cases)
- [ ] Quality maintained (≥8.5 score)
- [ ] Refinement log updated
- [ ] Recommendations for Epic 7 documented
- [ ] Code review completed

### Notes

- Focus on Phase 1 optimizations (prompt compression, output control)
- Phase 2-3 require Epic 7 infrastructure (defer for now)
- Ensure quality doesn't degrade - 85% threshold is mandatory
- **Cross-reference:** [Cost Optimization Research](/docs/research/llm-cost-optimization-strategies-production-scale.md)

---

## Story 2.7: Document Findings + Create Production Templates

**Story Points:** 3
**Duration:** 2-3 days
**Dependencies:** Story 2.6 complete

### User Story

**As an** Epic 7 development team
**I want** documented learnings and production-ready prompt templates
**So that** I can implement LangGraph automation efficiently

### Business Value

Captures all Epic 2 learnings in reusable format, ensuring Epic 7 team has validated patterns and avoids re-learning. Provides clean handoff between manual validation and automation.

### Acceptance Criteria

#### Epic 2 Summary Report

**Create Executive Summary:**

**File:** `docs/validation/epic-2-summary-report.md`

```markdown
# Epic 2: Foundation Validation - Summary Report

## Executive Summary

Epic 2 validated the component architecture and LLM generation approach before Epic 7 automation investment. **Result: SUCCESSFUL** - System achieves quality and cost targets.

**Key Findings:**
- ✅ $2/site budget achievable (avg $1.82, optimized to $1.70)
- ✅ 85-90% quality threshold exceeded (91% production-ready, avg score 8.7)
- ✅ 100% contract compliance (ZOD validation prevents errors)
- ✅ 3-5 prompt iterations sufficient (6 total across 4 prompts)
- ✅ CVA variant system ensures design consistency
- ✅ Manual workflow validates before automation

**Recommendation:** PROCEED to Epic 7 (LangGraph automation) with confidence.

## Metrics Achieved

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Homepage Variations | 10+ | 11 | ✅ Exceeded |
| Contract Compliance | 100% | 100% (11/11) | ✅ Met |
| Quality Score | 8.5-9.0 avg | 8.7 avg | ✅ Met |
| Production Ready Rate | 90% | 91% (10/11) | ✅ Exceeded |
| Cost Per Homepage | <$2.00 | $1.82 avg | ✅ Met |
| Error Rate | <5% | 0% | ✅ Exceeded |
| Prompt Iterations | 3-5 per prompt | 6 total (4 prompts) | ✅ Met |

**Conclusion:** All success criteria met or exceeded.

## Validated Patterns

### 1. CVA + ZOD Integration
**Pattern:** Type-safe variants + runtime validation
**Result:** 100% compliance rate, zero invalid configurations
**Recommendation:** Use this pattern for all future components

### 2. 4-Step Generation Workflow
**Pattern:** Component Selection → Styling → Content → Assembly
**Result:** Clear separation of concerns, modular prompts
**Recommendation:** Map directly to LangGraph nodes

### 3. Decision Trees for Component Selection
**Pattern:** Hotel type + audience + personality → component/variant choices
**Result:** Consistent, appropriate selections
**Recommendation:** Encode in LangGraph conditional edges

### 4. Golden Datasets for Regression
**Pattern:** Test cases with expected outputs and quality thresholds
**Result:** Baseline for prompt regression testing
**Recommendation:** Expand datasets in Epic 7, automate testing

### 5. Progressive Prompt Refinement
**Pattern:** Baseline → Identify failures → Refine → Validate
**Result:** 3-5 iterations achieve production quality
**Recommendation:** Build feedback loop into Epic 7

## Key Learnings

### What Worked Exceptionally Well

1. **ZOD Schemas Prevent Errors**
   - 100% compliance rate validates approach
   - Strict mode catches unexpected props
   - Validation performance <5ms (acceptable overhead)

2. **CVA Ensures Design Consistency**
   - No "random Tailwind classes" from LLM
   - Type-safe variant props
   - Compound variants handle complex interactions

3. **Decision Trees Guide LLM**
   - Clear guidelines → appropriate selections
   - Hotel type mapping works reliably
   - Variant combinations follow best practices

4. **Manual Workflow De-Risks Automation**
   - Iterative prompt refinement before coding
   - Cost model validated early
   - Quality baselines established

### What Needs Improvement

1. **Content Generation Verbosity**
   - Initial prompts too verbose (2,000 tokens)
   - Optimization reduced to 800 tokens (60% reduction)
   - Lesson: Start concise, add details only if needed

2. **Typo/Grammar Errors**
   - 2/11 generations had minor typos
   - Fixed with self-review instruction
   - Lesson: Add quality checkpoints in prompts

3. **Generic Content Risk**
   - Budget hotel generations tended toward clichés
   - Fixed with "avoid generic phrases" instruction
   - Lesson: Explicitly discourage template language

4. **Cost Variance**
   - Content generation: $1.05-$1.30 range (24% variance)
   - Caused by variable content lengths
   - Lesson: Control output length explicitly

### Failure Modes & Mitigations

| Failure Mode | Frequency | Mitigation | Status |
|-------------|-----------|------------|--------|
| Typos in content | 2/11 (18%) | Add self-review step | ✅ Fixed |
| Generic/cliché content | 1/11 (9%) | "Avoid clichés" instruction | ✅ Fixed |
| Invalid variant combo | 0/11 (0%) | ZOD enum constraints | ✅ Prevented |
| Missing components | 0/11 (0%) | Schema requires all fields | ✅ Prevented |
| Cost overrun | 0/11 (0%) | Token limits + monitoring | ✅ Prevented |

## Cost Optimization Findings

### Current State
- **Average Cost:** $1.82 per homepage
- **Optimized Cost:** $1.70 (prompt compression)
- **Budget:** $2.00
- **Headroom:** $0.30 (15%)

### Optimization Opportunities (Epic 7)
- **Prompt Caching:** $0.20-0.40 savings (50-90% on repeated context)
- **Model Routing:** $0.40-0.60 savings (Haiku for simple tasks)
- **Batch Processing:** $0.90 savings (overnight generation)

**Projected Cost (Epic 7):** $1.20 per homepage (40% reduction)
**At Scale (10,000 sites):** $12,000 vs $20,000 budget (40% under budget)

## Component Architecture Validation

### 8-Component Homepage
**Components:** Hero, Navigation, Rooms, Gallery, Testimonials, Amenities, Booking, Contact

**Validation Results:**
- ✅ Sufficient diversity for hotel types
- ✅ Covers essential user journeys
- ✅ Responsive at all breakpoints (375px, 768px, 1280px)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ Performance acceptable (<50ms render p95)

**Recommendation:** This component set is proven for homepage generation. Epic 4 can add interior pages with confidence.

### CVA Variant Coverage
- 3-5 variants per component dimension
- 20-30 total variant combinations per component
- Compound variants handle edge cases
- Default variants ensure safe fallbacks

**Validation:** LLM successfully navigates variant space with decision tree guidance.

## Quality Assessment Framework

### Rubric Effectiveness
- 5-dimension scoring (Contract, Relevance, Content, Design, Completeness)
- Weighted scoring aligns with priorities
- 8.5 threshold reliably identifies production-ready outputs
- Rubric is reproducible (multiple reviewers achieve ±0.2 score variance)

**Recommendation:** Automate scoring with LLM-as-judge in Epic 7.

### Production-Ready Definition
**Threshold:** ≥8.5/10 overall score

**Breakdown:**
- Contract Compliance: MUST pass (blocking)
- Relevance: ≥8.0 (strong hotel type alignment)
- Content Quality: ≥7.0 (acceptable with minor edits)
- Design Compliance: ≥8.0 (good variant choices)
- Completeness: ≥9.0 (all required components)

**Achieved:** 91% (10/11) production-ready rate ✅

## Recommendations for Epic 7

### High Priority (Week 1-2)

1. **Implement Prompt Caching**
   - Cache component documentation
   - Cache decision trees
   - **Impact:** 50-90% cost reduction on repeated context

2. **Build LangGraph Workflow**
   - Use validated prompts as node implementations
   - Map 4 manual steps to 4 LangGraph nodes
   - Implement state management (shared context)

3. **Automate Quality Validation**
   - ZOD validation after each node
   - Retry logic for validation failures
   - LLM-as-judge for quality scoring

### Medium Priority (Week 3-4)

4. **Implement Model Routing**
   - Haiku for component selection, styling, assembly
   - Sonnet for content generation
   - **Impact:** 30-50% cost reduction

5. **Expand Golden Datasets**
   - Add 10-20 more test cases per component
   - Automated regression testing
   - Continuous monitoring in production

### Low Priority (Epic 8)

6. **Batch Processing**
   - Implement for overnight generation
   - **Impact:** 50% cost reduction (batched sites)

7. **A/B Testing Framework**
   - Test prompt variations
   - Measure quality/cost trade-offs
   - Continuous optimization

## Artifacts Delivered

### Documentation
- ✅ Component documentation (8 files)
- ✅ Golden datasets (8 files, 40+ test cases)
- ✅ Prompt templates (4 agents)
- ✅ Manual workflow guide
- ✅ Quality assessment rubric
- ✅ Cost analysis report
- ✅ Optimization strategies

### Generated Outputs
- ✅ 11 homepage variations
- ✅ Quality assessments (11 reviews)
- ✅ Screenshots (33 images, 3 per variation)
- ✅ Cost tracking data

### Code Artifacts
- ✅ CVA variant registry (`lib/cva-variants.ts`)
- ✅ Updated ZOD contracts (`lib/contracts/index.ts`)
- ✅ 3 new components (Gallery, Testimonials, Amenities)
- ✅ Unit tests (100% coverage for new components)

## Conclusion

Epic 2 successfully validated the foundation for LLM-driven hotel website generation. All success criteria met or exceeded.

**Key Achievements:**
- ✅ $2/site budget validated (with 15% headroom)
- ✅ 85-90% quality threshold exceeded (91% production-ready)
- ✅ Component architecture proven scalable
- ✅ Prompt patterns established and optimized
- ✅ Cost optimization roadmap defined

**Risk Assessment:**
- **Technical Risk:** LOW - Architecture validated, patterns proven
- **Cost Risk:** LOW - Budget achieved with optimization headroom
- **Quality Risk:** LOW - 91% production-ready rate exceeds target
- **Timeline Risk:** MEDIUM - Epic 7 automation adds complexity

**Recommendation:** PROCEED to Epic 7 (LangGraph automation) with HIGH CONFIDENCE.

---

**Report Authors:** [Team Names]
**Date:** December 18, 2025
**Epic Status:** COMPLETE ✅
```

**Requirements:**
- [ ] Executive summary captures key findings
- [ ] Metrics table shows all targets vs actuals
- [ ] Validated patterns documented
- [ ] Key learnings captured (what worked, what didn't)
- [ ] Failure modes catalogued
- [ ] Recommendations for Epic 7 prioritized
- [ ] Artifacts inventory complete

#### Production Prompt Templates

**Package Prompts for Epic 7:**

**File:** `docs/prompts/production-templates/README.md`

```markdown
# Production Prompt Templates for Epic 7

This directory contains validated, production-ready prompt templates for LangGraph implementation.

## Template Structure

Each prompt template includes:
1. **Purpose** - What this agent does
2. **Input Schema** - ZOD schema for inputs
3. **Prompt Template** - Optimized prompt (v2.x)
4. **Output Schema** - ZOD schema for outputs
5. **Validation** - How to validate outputs
6. **Cost Tracking** - LangFuse integration points
7. **Error Handling** - Common failures and retries
8. **Examples** - 3-5 working examples

## Files

### Core Workflow Templates
- `01-component-selector-v2.md` - Component selection (optimized)
- `02-styling-agent-v2.md` - CVA variant selection (optimized)
- `03-content-generator-v2.md` - Content generation (optimized)
- `04-assembly-agent-v2.md` - Final assembly (optimized)

### Supporting Templates
- `self-review-prompt.md` - Quality self-review step
- `error-correction-prompt.md` - Self-correction for validation failures
- `llm-as-judge-prompt.md` - Quality scoring automation

### Schemas
- `workflow-schemas.ts` - All input/output ZOD schemas
- `workflow-state.ts` - LangGraph state type definitions

## Usage in LangGraph

### Node Implementation Pattern

```typescript
import { componentSelectorPrompt } from './production-templates/01-component-selector-v2.md';
import { ComponentSelectorInput, ComponentSelectorOutput } from './schemas';

const componentSelectorNode = async (state: WorkflowState) => {
  // 1. Extract inputs from state
  const input = ComponentSelectorInput.parse({
    hotelType: state.hotelParameters.type,
    targetAudience: state.hotelParameters.audience,
    brandPersonality: state.hotelParameters.personality
  });

  // 2. Execute LLM call with prompt template
  const result = await langfuseService.executeGeneration(
    'ComponentSelector',
    {
      prompt: componentSelectorPrompt,
      input,
      model: 'claude-haiku-4.5', // Model routing!
      maxTokens: 200 // Output length control
    },
    async () => llmCall(componentSelectorPrompt, input)
  );

  // 3. Validate output
  const validated = ComponentSelectorOutput.parse(result);

  // 4. Update state
  return {
    selectedComponents: validated.selectedComponents,
    layoutStructure: validated.layoutStructure,
    agentOutputs: {
      ...state.agentOutputs,
      componentSelector: validated
    }
  };
};
```

### Error Handling Pattern

```typescript
const componentSelectorNode = async (state: WorkflowState, retries = 0) => {
  try {
    const result = await llmCall(prompt, input);
    const validated = ComponentSelectorOutput.parse(result);
    return { selectedComponents: validated.selectedComponents };
  } catch (error) {
    if (retries < 3) {
      // Self-correction prompt
      const correctionPrompt = `Previous output failed validation: ${error.message}

      Please regenerate following the schema strictly.`;

      return await componentSelectorNode(state, retries + 1);
    } else {
      throw new Error(`Component selection failed after 3 retries: ${error.message}`);
    }
  }
};
```

## Optimization Features

### Prompt Caching (Epic 7 Week 2)

```typescript
// Mark cacheable sections with special tags (Anthropic-specific)
const cachedPrompt = `
<cacheable>
# Component Documentation
[All 8 component docs - 15,000 tokens]

# Decision Trees
[Hotel type → component mapping - 5,000 tokens]
</cacheable>

<variable>
Hotel Characteristics:
- Type: {hotelType}
- Audience: {targetAudience}
</variable>
`;

// 90% of prompt cached, only 10% fresh per call
// Cost: $0.003 cached + $0.003 fresh vs $0.06 uncached
```

### Model Routing (Epic 7 Week 3)

```typescript
const modelRouter = {
  componentSelector: 'claude-haiku-4.5', // Simple task
  stylingAgent: 'claude-haiku-4.5',      // Deterministic
  contentGenerator: 'claude-sonnet-4.5', // Creative task
  assemblyAgent: 'claude-haiku-4.5'      // Simple task
};

// Use router in node implementation
const model = modelRouter[agentName];
```

## Version History

- **v1.0** (2025-12-01): Initial prompts from Story 2.4
- **v2.0** (2025-12-10): Optimized prompts from Story 2.6
  - 60% token reduction (compression)
  - Output length limits added
  - Self-review step integrated
  - Anti-cliché instructions added

## Quality Metrics

| Prompt | Quality Score | Cost | Iterations |
|--------|---------------|------|------------|
| Component Selector v2 | 9.0 | $0.08 | 2 |
| Styling Agent v2 | 9.0 | $0.08 | 1 |
| Content Generator v2 | 8.9 | $1.15 | 3 |
| Assembly Agent v2 | 9.2 | $0.08 | 1 |

**Total:** 6 iterations, avg quality 9.0, avg cost $1.39 per homepage

## Testing

Golden datasets available in `docs/components/golden-datasets/` for regression testing.

Run validation:
```bash
npm run test:prompts  # Validates all prompts against golden datasets
```
```

**Requirements:**
- [ ] Production templates README created
- [ ] All 4 prompt templates packaged (v2.x optimized versions)
- [ ] LangGraph usage patterns documented
- [ ] Error handling patterns included
- [ ] Optimization features explained (caching, routing)
- [ ] Version history tracked
- [ ] Quality metrics documented

#### Handoff Documentation

**Create Epic 7 Handoff Guide:**

**File:** `docs/validation/epic-7-handoff.md`

```markdown
# Epic 2 → Epic 7 Handoff Guide

## Overview

Epic 2 validated the foundation. Epic 7 automates it. This guide ensures smooth transition.

## Validated Artifacts Ready for Epic 7

### Prompt Templates ✅
**Location:** `docs/prompts/production-templates/`
- All 4 agent prompts optimized and tested
- Input/output schemas defined
- Quality score: 9.0 avg
- Cost: $1.70 avg per homepage

**Action:** Use as LangGraph node implementations (copy-paste ready)

### Component Architecture ✅
**Location:** `web-app/components/blocks/`
- 8 components implemented with CVA variants
- ZOD contracts for all components
- Golden datasets for regression testing

**Action:** No changes needed, architecture validated

### Quality Framework ✅
**Location:** `docs/validation/quality-assessment-rubric.md`
- 5-dimension scoring rubric
- 8.5/10 production-ready threshold
- 91% production-ready rate achieved

**Action:** Implement LLM-as-judge automation

### Cost Model ✅
**Location:** `docs/validation/cost-analysis-report.md`
- $1.70 per homepage (optimized)
- $0.50-0.90 additional savings identified (caching, routing)
- Target: $1.20 per homepage in Epic 7

**Action:** Implement caching (Week 2), routing (Week 3)

## Implementation Roadmap for Epic 7

### Week 1: LangGraph Foundation
- [ ] Set up LangGraph project structure
- [ ] Define WorkflowState type (based on `workflow-state.ts`)
- [ ] Implement 4 nodes (Component Selector, Styling, Content, Assembly)
- [ ] Use production prompt templates directly
- [ ] Add ZOD validation after each node
- [ ] Implement basic error handling (retry 3x)

**Expected Output:** Working end-to-end workflow (1 homepage generation)

### Week 2: Quality & Caching
- [ ] Implement LLM-as-judge quality scoring
- [ ] Add prompt caching (Anthropic cache API)
- [ ] Implement self-review step (quality gate)
- [ ] Add visual regression testing (Playwright)

**Expected Output:** Automated quality validation, 50-90% cost reduction from caching

### Week 3: Optimization & Routing
- [ ] Implement model routing (Haiku/Sonnet decision logic)
- [ ] Optimize LangFuse tracking (all nodes logged)
- [ ] Add conditional edges (quality score < 7 → retry)
- [ ] Performance optimization (parallel where possible)

**Expected Output:** $1.20 per homepage cost, 85%+ automated quality score

### Week 4: Scale Testing
- [ ] Generate 100 homepage variations
- [ ] Validate quality distribution (target: 85% production-ready)
- [ ] Stress test workflow (concurrency, error rates)
- [ ] Cost validation at scale

**Expected Output:** Epic 7 complete, ready for Epic 8 (production deployment)

## Critical Success Factors

1. **Use Validated Prompts** - Don't rewrite from scratch, use Epic 2 templates
2. **Maintain ZOD Validation** - 100% compliance rate is non-negotiable
3. **Implement Caching Early** - Biggest cost savings (Week 2)
4. **Automate Quality Scoring** - LLM-as-judge replicates human review
5. **Track Costs Continuously** - LangFuse integration from Day 1

## Known Issues & Mitigations

| Issue | Epic 2 Finding | Epic 7 Mitigation |
|-------|----------------|-------------------|
| Typos in content | 18% frequency | Self-review step automated |
| Generic content | 9% frequency | Anti-cliché instruction enforced |
| Cost variance | $1.05-$1.30 range | Output length limits + caching |
| Manual QA bottleneck | 30-45min per variation | LLM-as-judge automation |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Automation breaks prompts | Low | High | Use templates verbatim, test thoroughly |
| Cost overrun at scale | Low | High | Implement caching Week 2, monitor continuously |
| Quality degradation | Medium | High | LLM-as-judge + human spot-checks (10% sample) |
| LangGraph complexity | Medium | Medium | Start simple, iterate (Week 1 baseline) |

## Contact & Questions

**Epic 2 Team:** [Names]
**Epic 7 Team:** [Names]

**Handoff Meeting:** [Date/Time]
**Q&A Session:** [Date/Time]

**Questions?** Reference Epic 2 documentation first, then contact team.

---

**Epic 2 Status:** COMPLETE ✅
**Epic 7 Status:** READY TO START 🚀
```

**Requirements:**
- [ ] Handoff guide created
- [ ] Validated artifacts catalogued
- [ ] Epic 7 roadmap outlined (4-week breakdown)
- [ ] Critical success factors highlighted
- [ ] Known issues documented with mitigations
- [ ] Risk assessment included

### Testing Requirements

**Documentation Validation:**
- [ ] All documentation files exist and are complete
- [ ] Cross-references link correctly
- [ ] No broken links or missing artifacts
- [ ] Formatting consistent across all docs

**Completeness Check:**
- [ ] Epic 2 summary report comprehensive
- [ ] Production templates packaged and ready
- [ ] Handoff guide actionable
- [ ] All learnings captured
- [ ] All artifacts inventoried

### Definition of Done

- [ ] Epic 2 summary report complete
- [ ] Production prompt templates packaged for Epic 7
- [ ] Epic 7 handoff guide created
- [ ] All learnings documented
- [ ] All artifacts committed to repository
- [ ] Handoff meeting scheduled with Epic 7 team
- [ ] Documentation reviewed and approved
- [ ] Epic 2 marked as COMPLETE in roadmap

### Notes

- This story is about knowledge transfer, not implementation
- Ensure Epic 7 team can start with ZERO Epic 2 context (docs are self-contained)
- Emphasize validated patterns - don't reinvent, reuse
- **Cross-reference:** [Epic 7 Planning](/docs/epics/epic-planning-roadmap.md#epic-7)

---

## Epic 2 Summary

**Total Story Points:** 35-45
**Timeline:** 4 weeks
**Dependencies:** Epic 1 complete

**Stories:**
1. 2.1: Add Gallery, Testimonials, Amenities (8 pts, 5-6 days)
2. 2.2: CVA Variants + ZOD Schemas (8 pts, 5-6 days)
3. 2.3: Component Docs + Golden Datasets (5 pts, 3-4 days)
4. 2.4: Manual Generation Prompts (8 pts, 5-6 days)
5. 2.5: Generate 10+ Variations (8 pts, 5-6 days)
6. 2.6: Cost Optimization (5 pts, 3-4 days)
7. 2.7: Document Findings (3 pts, 2-3 days)

**Success Criteria:**
- ✅ 100% ZOD compliance
- ✅ 85-90% quality (production-ready)
- ✅ <$2/site cost
- ✅ 10+ homepage variations
- ✅ Foundation validated for Epic 7

---

*Generated with architectural context from Epic 2 research and Epic 1 patterns*
