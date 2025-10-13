# Component Library PRD: LLM-Driven Hotel Website Generator

> **Status:** Draft v2.0  
> **Last Updated:** 2025-01-19  
> **Based on:** [Project Brief](../brief.md) and [Shadcn/ui Integration](../../components.json)

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

## Component Architecture

### 4-Tier Component System

```
Primitives (Shadcn/ui) → Blocks (Hotel-specific) → Sections (Page layouts) → Pages (Complete views)
```

#### Tier 1: Primitives (Shadcn/ui)
**Source:** Direct from Shadcn/ui library  
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
**Source:** Custom components using Shadcn/ui primitives  
**Customization:** Props, variants, and styling  
**Count:** 12-16 components (includes i18n and GDPR components)  

##### RoomCard (P0 - Critical)
```typescript
interface RoomCardProps {
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  mobileImageUrl?: string;    // .m.webp version for mobile
  amenities: string[];
  maxGuests: number;
  size?: number;
  availability: 'available' | 'limited' | 'unavailable';
  ctaText?: string;
  onBookClick?: () => void;
  variant?: 'compact' | 'detailed' | 'featured' | 'grid';
  responsiveLayout?: {
    mobile: 'stacked' | 'card';
    desktop: 'horizontal' | 'grid';
  };
}
```

**Requirements:**
- **Responsive Design:** Mobile-first with utility classes (flex-col md:flex-row)
- **Mobile Layout:** Stacked content, smaller images, touch-friendly buttons
- **Desktop Layout:** Horizontal/grid layouts, larger images, hover states
- **Responsive Images:** Auto-switch to .m.webp on mobile (<768px)
- **Accessibility:** ARIA labels, keyboard navigation, screen reader support
- **Performance:** Lazy loading for images, optimized rendering
- **Backend Integration:** Directus CMS data binding
- **Booking Integration:** Effective Tours API connection
- **Customization:** LLM-generated styling via CSS variables

**Variants:**
- `compact`: Minimal info, small footprint (mobile, sidebar)
- `detailed`: Full information with amenities list (desktop, featured)
- `featured`: Highlight variant with enhanced styling (homepage hero)
- `grid`: Optimized for grid layouts (rooms page)

**Technical Specifications:**
- Base Components: Card, Button, Badge, Avatar (for rating)
- Image Optimization: Next.js Image component with WebP support
- Animation: Hover effects, loading states
- Error Handling: Fallback for missing images, unavailable rooms

##### BookingWidget (P0 - Critical)
**Strategy:** Separate Mobile/Desktop Variants

```typescript
interface BookingWidgetProps {
  hotelId: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  guests?: number;
  rooms?: number;
  deviceType: 'mobile' | 'desktop';
  variant?: {
    mobile: 'collapsible-sections' | 'wizard';
    desktop: 'single-form' | 'sidebar';
  };
  onBookingComplete?: (booking: BookingResult) => void;
  availabilityCheck?: boolean;
  priceDisplay?: boolean;
}

// Mobile variant with collapsible sections
interface MobileBookingSection {
  section: 'dates' | 'guests' | 'rooms' | 'requests' | 'summary';
  title: string;
  isExpanded: boolean;
  isCompleted: boolean;
}
```

**Requirements:**
- **Mobile Behavior:** 5 collapsible sections (Dates, Guests & Rooms, Room Preferences, Special Requests, Book Now)
- **Desktop Behavior:** Single form with all fields visible, sidebar layout option
- **Real-time Availability:** Integration with Effective Tours API
- **Form Validation:** Zod schema validation with error handling
- **Date Management:** React Day Picker integration
- **Price Calculation:** Dynamic pricing based on dates/guests
- **Responsive Detection:** Automatic device type detection (<768px = mobile)
- **Touch Optimization:** Large touch targets, swipe gestures for mobile
- **Loading States:** Skeleton loading during API calls
- **Redirect Integration:** Construct Effective Tours booking URL with parameters

##### TestimonialCard (P1 - High)
**Strategy:** Responsive Utilities

```typescript
interface TestimonialCardProps {
  customerName: string;
  customerAvatar?: string;
  mobileAvatar?: string;        // .m.webp version for mobile
  rating: number;
  review: string;
  date: string;
  roomType?: string;
  verified?: boolean;
  variant?: 'simple' | 'detailed' | 'featured';
  responsiveLayout?: {
    mobile: 'stacked' | 'compact';
    desktop: 'horizontal' | 'card';
  };
}
```

**Requirements:**
- **Mobile Layout:** Stacked content, smaller avatars, shortened reviews
- **Desktop Layout:** Horizontal/card layouts, full reviews, hover effects
- **Responsive Images:** Auto-switch to .m.webp for avatars on mobile
- **Trust Indicators:** Verified badges, star ratings
- **Content Management:** Directus CMS integration
- **Responsive Utilities:** p-4 md:p-6, text-sm md:text-base, flex-col md:flex-row
- **Rich Content:** Support for longer reviews with read-more functionality

##### FeatureList (P1 - High)
```typescript
interface FeatureListProps {
  features: Feature[];
  layout?: 'grid' | 'list' | 'carousel';
  showIcons?: boolean;
  iconSet?: 'lucide' | 'custom';
  variant?: 'minimal' | 'detailed' | 'cards';
  maxItems?: number;
}

interface Feature {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category: 'amenity' | 'service' | 'facility';
  priority?: number;
}
```

**Requirements:**
- **Icon Management:** Lucide icons with fallback system
- **Categorization:** Grouping by amenity types
- **Responsive Layouts:** Grid, list, and carousel views
- **Accessibility:** Proper heading hierarchy and descriptions

##### ContactCard (P1 - High)
```typescript
interface ContactCardProps {
  phone: string;
  email: string;
  address: ContactAddress;
  mapUrl?: string;
  socialLinks?: SocialLink[];
  showMap?: boolean;
  variant?: 'simple' | 'detailed' | 'with-map';
}
```

**Requirements:**
- **Contact Methods:** Click-to-call, mailto links
- **Map Integration:** Embedded Google Maps or similar
- **Social Media:** Icon links to social platforms
- **Schema Markup:** Structured data for SEO

##### Navigation (P0 - Critical)
**Strategy:** Separate Mobile/Desktop Variants

```typescript
interface NavigationProps {
  items: NavigationItem[];
  hotelLogo: string;
  deviceType: 'mobile' | 'desktop';
  variant: {
    mobile: 'hamburger' | 'bottom-tabs';
    desktop: 'horizontal' | 'mega-menu';
  };
  currentPath: string;
  onNavigate: (path: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  isCTA?: boolean; // Special styling for booking/contact buttons
}
```

**Requirements:**
- **Mobile Behavior:** Hamburger menu (3-line icon) with slide-out drawer
- **Desktop Behavior:** Full horizontal menu bar with hover states
- **Responsive Detection:** Automatic variant switching at 768px breakpoint
- **Touch Optimization:** Large touch targets (44px minimum) for mobile
- **Animation:** Smooth slide transitions, hover effects
- **Accessibility:** ARIA navigation, keyboard support, focus management
- **Logo Integration:** Responsive logo sizing and positioning
- **CTA Highlighting:** Special styling for booking/contact buttons

**Mobile Specifications:**
- Hamburger icon: 24x24px, top-right position
- Slide-out drawer: Full-height overlay with menu items
- Menu items: Large touch targets, icon + text layout
- Close behavior: Tap outside, swipe, or close button

**Desktop Specifications:**
- Horizontal layout: Logo left, menu items center, CTA buttons right
- Hover states: Underline animations, dropdown for submenus
- Sticky behavior: Option for sticky navigation on scroll

##### LanguageSelector (P0 - Critical)
```typescript
interface LanguageSelectorProps {
  currentLocale: string;
  availableLocales: LocaleConfig[];
  variant?: 'dropdown' | 'flags' | 'text' | 'compact';
  showFlag?: boolean;
  showNativeName?: boolean;
  position?: 'header' | 'footer' | 'sidebar' | 'floating';
  onLanguageChange?: (locale: string) => void;
}

interface LocaleConfig {
  code: string; // 'en', 'es', 'fr'
  name: string; // 'English', 'Español', 'Français'
  nativeName: string; // 'English', 'Español', 'Français'
  flag: string; // Flag emoji or icon
  translationUrl: string; // BackBlaze JSON URL
}
```

**Requirements:**
- **URL Routing:** Integration with Next.js i18n routing (/en/, /es/)
- **Translation Loading:** Dynamic JSON loading from BackBlaze
- **Fallback Strategy:** English hardcoded fallback when JSON unavailable
- **SEO Optimization:** Hreflang tags, language-specific sitemaps
- **Accessibility:** ARIA labels, keyboard navigation
- **Performance:** Lazy loading of translation files

**Variants:**
- `dropdown`: Traditional dropdown selector (header navigation)
- `flags`: Flag icons with labels (international audience)
- `text`: Text-only links (minimal design)
- `compact`: Mobile-optimized compact view

##### TranslationWrapper (P0 - Critical)
```typescript
interface TranslationWrapperProps {
  children: React.ReactNode;
  fallbackLocale: string;
  translationKeys: Record<string, string>;
  namespace?: string;
  debug?: boolean;
}

interface TranslationContextValue {
  t: (key: string, fallback?: string) => string;
  locale: string;
  isLoading: boolean;
  isError: boolean;
}
```

**Requirements:**
- **Context Provider:** React Context for translation state
- **Key Resolution:** Nested key support (e.g., 'booking.form.submit')
- **Fallback Strategy:** English text when translation missing
- **Error Handling:** Graceful degradation for failed translations
- **Performance:** Memoization of translation functions

##### CookieConsent (P1 - High)
```typescript
interface CookieConsentProps {
  complianceRegion: 'GDPR' | 'CCPA' | 'GLOBAL';
  categories: CookieCategory[];
  variant?: 'banner' | 'modal' | 'corner' | 'inline';
  position?: 'top' | 'bottom' | 'center';
  customization: {
    colors: ColorPalette;
    borderRadius: string;
    typography: string;
  };
  onConsentChange?: (consent: ConsentChoices) => void;
}

interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  purposes: string[];
  cookies: CookieInfo[];
}

interface ConsentChoices {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
}
```

**Requirements:**
- **Legal Compliance:** GDPR Article 7, CCPA compliance
- **Cookie Management:** Integration with consent management platform
- **Granular Control:** Category-specific consent options
- **Persistent Storage:** LocalStorage for consent preferences
- **Audit Trail:** Consent logging for compliance records

##### LegalPages (P1 - High)
```typescript
interface PrivacyPolicyProps {
  hotelName: string;
  contactInfo: ContactInfo;
  jurisdiction: string;
  dataProcessingTypes: DataProcessingType[];
  thirdPartyServices: ThirdPartyService[];
  lastUpdated: string;
  complianceFramework: 'GDPR' | 'CCPA' | 'GLOBAL';
}

interface TermsOfServiceProps {
  hotelName: string;
  contactInfo: ContactInfo;
  jurisdiction: string;
  bookingProvider: 'effective_tours';
  cancellationPolicy: string;
  liabilityLimitations: string[];
  lastUpdated: string;
}

interface DataProcessingType {
  purpose: string;
  dataTypes: string[];
  retention: string;
  legalBasis: string;
}
```

**Requirements:**
- **Legal Accuracy:** Template-based generation with jurisdiction-specific clauses
- **Auto-Update:** Version control with update notifications
- **Multi-Language:** Translation support for international hotels
- **Schema Markup:** Structured data for search engines
- **Print Optimization:** Printer-friendly layouts

#### Tier 3: Sections (Page Layout Components)
**Source:** Compositions of blocks and primitives  
**Customization:** Layout variants, content configuration  
**Count:** 6-8 sections  

##### HeroSection (P0 - Critical)
**Strategy:** Separate Mobile/Desktop Variants

```typescript
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  ctaText: string;
  ctaUrl: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  backgroundImage?: string;
  mobileBackgroundImage?: string;  // .m.webp version for mobile
  backgroundVideo?: string;
  overlayOpacity?: number;
  deviceType: 'mobile' | 'desktop';
  variant: {
    mobile: 'stacked' | 'minimal' | 'card-overlay';
    desktop: 'split' | 'centered' | 'video-bg' | 'carousel';
  };
  bookingWidget?: boolean;
  responsiveText?: {
    mobile: { title: string; subtitle?: string; };
    desktop: { title: string; subtitle?: string; };
  };
}
```

**Requirements:**
- **Mobile Behavior:** Single column stacked layout, shorter text, large CTAs
- **Desktop Behavior:** Split/multi-column layouts, full text, advanced animations
- **Responsive Images:** Auto-switch to .m.webp on mobile, optimized aspect ratios
- **Visual Impact:** High-quality background images/videos
- **Conversion Optimization:** Clear CTAs, booking integration
- **Performance:** Optimized media loading, Core Web Vitals
- **Touch Optimization:** Large touch targets (44px+) for mobile CTAs
- **Accessibility:** Proper heading hierarchy, alt text, contrast ratios

**Variants:**
- `centered`: Classic centered layout with background
- `split`: Split layout with image and content
- `minimal`: Clean text-focused design
- `video`: Background video with controls
- `carousel`: Multiple hero images with navigation

##### RoomsSection (P0 - Critical)
```typescript
interface RoomsSectionProps {
  title: string;
  subtitle?: string;
  rooms: Room[];
  layout?: 'grid-2' | 'grid-3' | 'grid-4' | 'carousel' | 'list';
  showFilters?: boolean;
  filterOptions?: FilterOption[];
  maxRooms?: number;
  showMoreButton?: boolean;
  sortOptions?: SortOption[];
}
```

**Requirements:**
- **Data Management:** Directus CMS integration for room data
- **Filtering System:** Price, amenities, capacity filters
- **Sorting Options:** Price, popularity, availability
- **Pagination:** Load more functionality
- **Performance:** Virtual scrolling for large datasets

##### GallerySection (P1 - High)
```typescript
interface GallerySectionProps {
  title: string;
  images: GalleryImage[];
  layout?: 'grid' | 'masonry' | 'carousel' | 'justified';
  showThumbnails?: boolean;
  enableLightbox?: boolean;
  categories?: string[];
  showCategoryFilter?: boolean;
  lazyLoading?: boolean;
}
```

**Requirements:**
- **Image Optimization:** Next.js Image with multiple formats
- **Lightbox Functionality:** Modal gallery with navigation
- **Category Filtering:** Interactive category selection
- **Performance:** Lazy loading, progressive enhancement

##### BookingSection (P0 - Critical)
```typescript
interface BookingSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  promotionalText?: string;
  widget: BookingWidgetProps;
  testimonials?: TestimonialCard[];
  trustIndicators?: TrustIndicator[];
  variant?: 'simple' | 'featured' | 'with-testimonials' | 'split';
}
```

**Requirements:**
- **Conversion Focus:** Optimized for booking completion
- **Trust Building:** Customer testimonials, security badges
- **A/B Testing:** Multiple variant support
- **Analytics Integration:** Conversion tracking

#### Tier 4: Pages (Complete Views)
**Source:** Compositions of sections  
**Customization:** Wireframe selection, section ordering  
**Count:** 5-7 page types  

##### HomePage
**Wireframe Options:**
- `classic`: HeroSection + RoomsSection + FeaturesSection + TestimonialsSection + ContactSection
- `modern`: HeroSection + GallerySection + RoomsSection + BookingSection
- `minimal`: HeroSection + BookingSection + TestimonialsSection + ContactSection

##### RoomsPage
**Wireframe Options:**
- `grid`: HeroSection + RoomsSection (grid layout)
- `list`: HeroSection + RoomsSection (list layout) + FilterSection

##### ContactPage
**Wireframe Options:**
- `form`: ContactSection + MapSection
- `info`: ContactCard + DirectionsSection

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