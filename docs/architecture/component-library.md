# Component Library Documentation: LLM-Driven Hotel Website Generator

> **Status:** Synchronized with Codebase
> **Last Updated:** 2025-06-21
> **Based on:** [Project Brief](../01-vision/project-brief.md) and [Shadcn/ui Integration](../../components.json)

## PROJECT SCOPE BOUNDARIES

### IN SCOPE:
- Component library development for website generation
- Multi-language support components
- GDPR compliance components
- Backend integration for read-only data access
- Static website generation and deployment

### OUT OF SCOPE:
- Post-generation website maintenance
- Content management after delivery  
- Ongoing performance monitoring
- Source code access for clients
- Custom development requests
- Payment processing (handled by Effective Tours)

## Overview

This document defines the detailed requirements for the hotel-specific component library built on Shadcn/ui primitives. The library enables LLM agents to autonomously select, configure, and style components for unique hotel websites.

## Content System Integration

All major components (`Sections` and `Blocks`) support the **Content System Integration** pattern. This allows components to be hydrated either via direct props (legacy/Storybook) or via the centralized content JSON system.

```typescript
// Standard Content Props Pattern
interface ContentProps {
  /** Content key for identifying component in content JSON */
  contentKey?: string;
  /** Hotel ID for fetching content */
  hotelId?: string;
  /** Override feature flag for this instance */
  enableContent?: boolean;
}
```

**Usage:**
- **Props Mode:** `<HeroSection title="My Hotel" />`
- **Content Mode:** `<HeroSection hotelId="hotel-123" contentKey="hero" />`
- **Hybrid Mode:** `<HeroSection hotelId="hotel-123" title="Override Title" />` (Props take precedence)

## Component Architecture

### 4-Tier Component System

```
Primitives (Shadcn/ui) → Blocks (Hotel-specific) → Sections (Page layouts) → Pages (Composed views)
```

#### Tier 1: Primitives (Shadcn/ui)
**Source:** Direct from Shadcn/ui library (`web-app/components/ui/`)
**Customization:** Styling via custom CSS variables + responsive utilities  
**Count:** 15+ components  
**Responsive Strategy:** Utility-first with Tailwind CSS breakpoints

#### Responsive Breakpoint System
```typescript
const breakpoints = {
  mobile: 'default',      // <768px (mobile-first approach)
  desktop: 'md:',         // ≥768px (tablets, laptops, desktops)
};

// Usage pattern in components
const responsiveClasses = "p-4 md:p-6 text-sm md:text-base grid-cols-1 md:grid-cols-2";
```

| Component | Priority | Hotel Use Cases | Variants |
|-----------|----------|-----------------|----------|
| Button | P0 | CTAs, booking, navigation | default, outline, secondary, ghost |
| Card | P0 | Room display, amenities, testimonials | default, elevated, outlined |
| Input | P0 | Booking forms, contact forms | default, error, success |
| Select | P0 | Room selection, guest count | default, multiple |
| Badge | P1 | Room types, amenities, status | default, secondary, outline |
| Textarea | P1 | Special requests, feedback | default, error |
| Dialog | P1 | Booking confirmation, image lightbox | default, fullscreen |
| Calendar | P1 | Date selection for bookings | default, range |
| Avatar | P2 | Customer testimonials | default, fallback |
| Tooltip | P2 | Amenity explanations | default, arrow |

#### Tier 2: Blocks (Hotel-specific Components)
**Source:** Custom components using Shadcn/ui primitives (`web-app/components/blocks/`)
**Customization:** Props, variants, and styling  
**Count:** 12-16 components (includes i18n and GDPR components)  

##### RoomCard (P0 - Critical)
```typescript
interface RoomCardProps {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  image?: string;
  description?: string;
  variant?: 'compact' | 'detailed' | 'grid';
  imageHeight?: 'default' | 'tall' | 'wide';
  onBookNow?: (roomId: string) => void;
  onViewDetails?: (roomId: string) => void;
  className?: string;
}
```

**Requirements:**
- **Responsive Design:** Adaptive layout based on `variant` prop.
- **Mobile Layout:** Stacked content, touch-friendly buttons.
- **Desktop Layout:** Flexible grid/list presentation.
- **Accessibility:** ARIA labels, keyboard navigation.
- **Performance:** Memoized components for rendering efficiency.

**Variants:**
- `compact`: Minimal info, small footprint (mobile, sidebar).
- `detailed`: Full information with amenities list (default).
- `grid`: Optimized for grid layouts (rooms page).

##### BookingWidget (P0 - Critical)
**Strategy:** Separate Mobile/Desktop Variants

```typescript
interface BookingWidgetProps {
  variant?: 'mobile' | 'desktop';
  theme?: 'light' | 'dark' | 'glass';
  className?: string;
  onSubmit?: (data: BookingData) => void;
  defaultValues?: {
    checkIn?: Date;
    checkOut?: Date;
    adults?: number;
    children?: number;
    rooms?: number;
    roomType?: string;
    roomId?: string;
    specialRequests?: string;
  };
}
```

##### TestimonialCard (P1 - High)
**Strategy:** Responsive Utilities

##### FeatureList (P1 - High)

##### ContactCard (P1 - High)

##### Navigation (P0 - Critical)
**Strategy:** Separate Mobile/Desktop Variants

##### LanguageSelector (P0 - Critical)

##### TranslationWrapper (P0 - Critical)

##### CookieConsent (P1 - High)

##### LegalPages (P1 - High)

#### Tier 3: Sections (Page Layout Components)
**Source:** Compositions of blocks and primitives (`web-app/components/sections/`)
**Customization:** Layout variants, content configuration  
**Count:** 6-8 sections  

##### HeroSection (P0 - Critical)
```typescript
// Note: subtitle property from Contract is ignored by component
interface HeroSectionProps extends Omit<HeroSectionContractType, 'subtitle'>, HeroSectionContentProps {}
```

##### RoomsSection (P0 - Critical)

##### GallerySection (P1 - High)

##### BookingSection (P0 - Critical)

#### Tier 4: Pages (Composed Views)
**Source:** `WebsiteConfig` wraps `HomepageConfig` with support for 9 page types. The `splitToPages()` function distributes components from the generation output to their target pages. Pages are rendered as Next.js routes under `web-app/app/[lang]/`.
**Note:** `WebsiteConfig` extends the single-page `HomepageConfig` into a multi-page structure where each page receives its relevant components.

##### HomePage (`app/[lang]/page.tsx`)
**Wireframe Options:**
- `classic`: HeroSection + RoomsSection + FeaturesSection + TestimonialsSection + ContactSection
- `modern`: HeroSection + GallerySection + RoomsSection + BookingSection
- `minimal`: HeroSection + BookingSection + TestimonialsSection + ContactSection

##### RoomsPage (`app/[lang]/rooms/page.tsx`)
**Wireframe Options:**
- `grid`: HeroSection + RoomsSection (grid layout)
- `list`: HeroSection + RoomsSection (list layout) + FilterSection

##### ContactPage (`app/[lang]/contact/page.tsx`)
**Wireframe Options:**
- `form`: ContactSection + MapSection
- `info`: ContactCard + DirectionsSection

##### AboutPage (`app/[lang]/about/page.tsx`)
- AboutSection + HotelInfo + TestimonialsSection

##### GalleryPage (`app/[lang]/gallery/page.tsx`)
- GallerySection (full image set)

##### FAQPage (`app/[lang]/faq/page.tsx`)
- FAQSection

## Component Selection Logic

### LLM Decision Framework

#### Input Analysis Mapping
```typescript
interface ComponentSelectionCriteria {
  hotelType: 'luxury' | 'boutique' | 'business' | 'resort' | 'budget' | 'eco';
  targetAudience: string[];
  primaryGoals: ('bookings' | 'brand-awareness' | 'information' | 'contact')[];
  contentAvailability: {
    rooms: number;
    amenities: number;
    testimonials: number;
    images: number;
  };
}
```

#### Selection Rules
```typescript
const componentSelectionRules = {
  // Required components for all hotel types
  required: ['HeroSection', 'BookingSection', 'ContactSection'],
  
  // Hotel type specific recommendations
  luxury: {
    recommended: ['GallerySection', 'TestimonialsSection', 'AmenitiesSection'],
    variants: { HeroSection: 'video', RoomsSection: 'featured' }
  },
  
  boutique: {
    recommended: ['AboutSection', 'TestimonialsSection'],
    variants: { HeroSection: 'split', RoomsSection: 'detailed' }
  },
  
  business: {
    recommended: ['FacilitiesSection', 'LocationSection'],
    variants: { HeroSection: 'minimal', BookingSection: 'simple' }
  },
  
  resort: {
    recommended: ['GallerySection', 'ActivitiesSection', 'DiningSection'],
    variants: { HeroSection: 'carousel', RoomsSection: 'grid-3' }
  }
};
```

## Technical Requirements

### Performance Standards
- **Core Web Vitals:** LCP <2.5s, FID <100ms, CLS <0.1
- **Bundle Size:** Each component <50KB gzipped
- **Loading:** Progressive enhancement, lazy loading
- **Caching:** Component-level caching strategies

### Accessibility Requirements
- **WCAG 2.1 AA Compliance:** All components must meet accessibility standards
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Readers:** Proper ARIA labels and descriptions
- **Color Contrast:** Minimum 4.5:1 ratio for text

### Browser Support
- **Modern Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Support:** iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement:** Graceful degradation for older browsers

### Testing Requirements
- **Unit Tests:** Jest + React Testing Library for all components
- **Visual Regression:** Storybook + Chromatic for visual testing
- **Accessibility Tests:** axe-core integration
- **Performance Tests:** Lighthouse CI integration

## Backend Integration Specifications

### Directus CMS Integration
```typescript
interface DirectusConfig {
  baseUrl: string;
  token: string;
  collections: {
    hotels: 'hotels';
    rooms: 'rooms';
    amenities: 'amenities';
    testimonials: 'testimonials';
    gallery: 'gallery_images';
  };
}
```

### Effective Tours API Integration
```typescript
interface EffectiveToursConfig {
  baseUrl: string;
  apiKey: string;
  endpoints: {
    availability: '/availability';
    pricing: '/pricing';
    booking: '/booking';
    cancellation: '/cancellation';
  };
}
```

## Quality Assurance

### Component Validation Checklist
- [ ] **Responsive Design:** Mobile (<768px) and Desktop (≥768px) layouts
- [ ] **Device-Specific Variants:** BookingWidget, Navigation, HeroSection work correctly
- [ ] **Responsive Images:** .m.webp switching functions properly on mobile
- [ ] **Touch Optimization:** 44px+ touch targets, gesture support
- [ ] **Breakpoint Behavior:** Smooth transitions at 768px breakpoint
- [ ] **Accessibility:** WCAG 2.1 AA compliance across all screen sizes
- [ ] **Performance:** Core Web Vitals met on mobile and desktop
- [ ] **Cross-browser compatibility:** Chrome, Firefox, Safari, Edge
- [ ] **Error handling and loading states**
- [ ] **Backend integration functionality**
- [ ] **LLM styling compatibility**
- [ ] **Documentation completeness**

### Responsive Testing Requirements
```typescript
const testViewports = {
  mobile: { width: 375, height: 667 },     // iPhone SE
  tablet: { width: 768, height: 1024 },    // iPad
  desktop: { width: 1280, height: 720 },   // Desktop
  large: { width: 1920, height: 1080 }     // Large Desktop
};

// Test scenarios for each component
const responsiveTests = [
  'Component renders correctly at all breakpoints',
  'Images switch to mobile versions below 768px',
  'Touch targets are minimum 44px on mobile',
  'Text remains readable across all screen sizes',
  'Navigation variants switch at breakpoint',
  'BookingWidget sections collapse properly on mobile',
  'Performance metrics meet targets on mobile'
];
```

### Acceptance Criteria
- All components pass automated testing suite
- Performance benchmarks met on test environments
- Accessibility audit results in 100% compliance
- Visual regression tests pass
- Backend integrations function correctly
- LLM agents can successfully configure components

## Implementation Phases

### Phase 1: Core Components (Week 1-2)
- RoomCard component with all variants
- BookingWidget with Effective Tours integration
- HeroSection with responsive variants
- Basic testing framework setup

### Phase 2: Content Components (Week 2-3)
- TestimonialCard with Directus integration
- FeatureList with icon management
- GallerySection with lightbox functionality
- ContactCard with map integration

### Phase 3: Page Compositions (Week 3-4)
- Complete page wireframes
- Section orchestration
- LLM integration testing
- Performance optimization

### Phase 4: Polish & Testing (Week 4)
- Comprehensive testing suite
- Accessibility audits
- Performance optimization
- Documentation completion

---

*This PRD serves as the detailed specification for component library development. All implementation should follow these requirements to ensure consistency with the LLM generation workflow.*
