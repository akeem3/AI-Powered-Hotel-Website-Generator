# The Sterling Executive Hotel Website Product Requirements Document (PRD)

> **Project:** LLM-Driven Hotel Website Generator - Reference Implementation
> **Status:** Ready for Development
> **Version:** 2.1
> **Last Updated:** 2026-03-25
> **Development Timeline:** 2 Weeks

## Executive Summary

The Sterling Executive is a **reference implementation** for an LLM-driven hotel website generation platform capable of producing 10,000+ unique **multi-page** hotel websites at ~$2 per site. This project demonstrates the complete feature set, component architecture, and technical infrastructure required for autonomous LLM-based website generation.

While building a single hotel website (Sterling Executive - a premium hybrid boutique + business hotel), this project incorporates ALL features necessary for LLM agents to select, configure, and assemble thousands of unique variations. The platform generates multi-page websites (homepage, rooms, dining, etc.) from a single LLM generation pass: `splitToPages()` and `multiplyContent()` expand the initial WebsiteConfig into full page sets as zero-cost post-processing steps. Features that may appear over-engineered for a single site (component manifests, extensive responsive specifications, multi-agent orchestration infrastructure) are **essential** for enabling LLM-driven mass generation.

**Primary Objectives:**
- Create a production-ready hotel website achieving 3% booking conversion rate
- Demonstrate complete 4-tier component architecture for LLM selection
- Implement responsive design framework with mobile/desktop variants
- Establish LangGraph multi-agent generation workflow infrastructure
- Validate cost-efficient generation (~$0.10 actual cost with Kimi K2 model)

## Reference Implementation Context

### Purpose: Template for 10,000+ Unique Websites

This is **not** a standalone hotel website project. The Sterling Executive serves as a reference implementation demonstrating every feature, component, pattern, and integration that the LLM generation platform will use to create thousands of unique hotel websites automatically.

### Why Features May Seem Over-Engineered

**For One Website:** Many features (component manifests, extensive variant specifications, responsive strategy documentation) appear unnecessarily complex.

**For LLM Generation at Scale:** These same features are **strictly required**:

- **Component Manifest System** → Enables LLM agents to discover and select from 20+ pre-built components
- **Responsive Design Specifications** → Teaches LLMs when to use separate variants vs. responsive utilities
- **4-Tier Architecture** → Provides hierarchical component selection strategy
- **Extensive Testing Infrastructure** → Validates LLM-generated configurations work correctly
- **Backend Integration Patterns** → Ensures all generated sites connect to Directus CMS and Effective Tours API
- **LangGraph Agent Infrastructure** → Powers autonomous generation workflow with cost monitoring
- **Multiple Component Variants** → Allows LLMs to create visual uniqueness from standardized components

### Key Innovation: Selection, Not Generation

**LLM agents DO NOT generate code.** They:
1. Analyze hotel parameters (type, vibe, location, brand colors)
2. **Select** appropriate components from the manifest
3. **Configure** component properties and relationships
4. **Generate** custom Tailwind CSS styling for uniqueness
5. **Validate** output meets quality standards
6. **Assemble** complete Next.js application

This reference implementation must demonstrate EVERY component, integration, and pattern LLMs will use.

### Documentation References

- **Component Specifications:** See `/docs/03-component-system/component-library.md` for complete 4-tier component details
- **LLM Orchestration:** See `/docs/04-llm-orchestration/llm-integration.md` for LangGraph workflow specifications
- **Technical Architecture:** See `/docs/02-architecture/technical-architecture.md` for infrastructure details
- **Project Vision:** See `/docs/01-vision/project-brief.md` for business context and scale economics

## Goals and Background Context

### Goals

- **Primary:** Achieve 3% booking conversion rate through optimized user journey and seamless Effective Tours integration
- **Secondary:** Generate 10 qualified corporate inquiries monthly through prominent business amenities showcase
- **Strategic:** Create reference implementation demonstrating all features for LLM-driven generation platform
- **Technical:** Deliver Core Web Vitals compliance (>90 Lighthouse score) with complete component library
- **Platform:** Establish responsive design framework (mobile <768px, desktop ≥768px) for LLM agent selection
- **Generation:** Validate LangGraph multi-agent workflow with cost monitoring under $2 per site generation

### Background Context

The Sterling Executive represents a flagship hybrid boutique + business hotel concept targeting corporate executives and discerning business travelers. This project delivers a premium commercial hotel website while serving as the **reference implementation** for an LLM-driven generation platform.

**The Generation Platform Challenge:**
Traditional hotel website development costs $5,000-$20,000 per site with 2-4 week timelines. Generating 10,000 unique websites traditionally would cost $50M-$200M and require years of development. The platform solves this through:

1. **Pre-built Component Library** (20+ components across 4 tiers)
2. **LLM-Based Selection** (agents choose and configure, not generate code)
3. **Automated Styling** (custom Tailwind CSS per hotel brand)
4. **Cost Optimization** (Kimi K2 model achieves ~$0.10 per generation)
5. **Quality Validation** (automated testing ensures performance)

This reference implementation must include ALL infrastructure, patterns, and features the generation platform requires, even if they appear over-engineered for a single website.

### Change Log

| Date       | Version | Description                                                              | Author   |
| ---------- | ------- | ------------------------------------------------------------------------ | -------- |
| 2026-03-25 | 2.1     | Updated to reflect multi-page generation (Epic 24: routing at `app/[lang]/`, Epic 25: `splitToPages()` + `multiplyContent()` in WebsiteConfig) | PM Agent |
| 2025-10-17 | 2.0     | Major update: Added reference implementation context, component library specifications, LLM generation system requirements, responsive design framework, LangGraph infrastructure | PM Agent |
| 2025-10-16 | 1.0     | Initial PRD creation based on hotel concept and tech stack documentation | PM Agent |

## User Research & Personas

### Primary Persona: Business Executive

**Demographics:**

- Age: 35-65 years
- Income: $150,000+ annual income
- Occupation: C-level executives, senior managers, consultants
- Travel Frequency: 8+ business trips per year

**Needs & Expectations:**

- Reliable high-speed internet (1 Gbps throughout property)
- Efficient check-in/check-out process
- Quiet work spaces and meeting facilities
- Airport transportation and logistics support
- 24/7 business center access
- Corporate billing and expense management

**Pain Points:**

- Inconsistent Wi-Fi quality in hotels
- Complicated booking processes
- Limited meeting room availability
- Poor business travel expense tracking
- Lack of workspace in hotel rooms

### Secondary Persona: Boutique Hotel Seeker

**Demographics:**

- Age: 30-55 years
- Income: $100,000+ annual income
- Occupation: Professionals who value unique experiences
- Travel Style: Blends business with leisure

**Needs & Expectations:**

- Unique, memorable experiences
- Personalized service and attention to detail
- Local culture and art integration
- High-quality dining options
- Wellness and relaxation facilities

**Pain Points:**

- Generic hotel experiences
- Poor design aesthetics
- Lack of local character
- Impersonal service
- Limited unique amenities

**Note:** These personas represent END USERS of generated hotel websites, not operators of the generation platform. The reference implementation must serve these users while demonstrating all generation-enabling features.

## Product Goals & Success Metrics

### Primary Business Objectives

**1. Booking Conversion Rate (Priority: 1)**

- **Target:** 3% conversion rate from site visit to Effective Tours booking
- **Measurement:** Track redirects to Effective Tours booking platform
- **Success Threshold:** >3% conversion within 30 days of launch

**2. Corporate Lead Generation (Priority: 2)**

- **Target:** 10 qualified business inquiries monthly
- **Measurement:** Contact form submissions from businesses
- **Success Threshold:** >10 qualified leads within first month

**3. Reference Implementation Validation (Priority: 1)**

- **Target:** Demonstrate ALL features required for LLM-driven generation platform
- **Measurement:** Component manifest completeness, responsive design validation, LangGraph workflow functionality
- **Success Threshold:** 100% of generation-enabling features implemented and tested

**4. Generation System Performance (Priority: 1)**

- **Target:** Validate generation workflow under $2 per site with 95%+ success rate
- **Measurement:** LangFuse cost tracking, generation completion rate
- **Success Threshold:** Actual generation cost <$0.50, success rate >95%

### User Experience Metrics

- **Page Load Performance:** Core Web Vitals compliance (LCP <2.5s, FID <100ms, CLS <0.1)
- **Mobile Usability:** 98+ usability score across devices (<768px mobile, ≥768px desktop)
- **User Engagement:** Time on site >2 minutes, bounce rate <40%
- **Booking Funnel Completion:** Track users from site visit to booking confirmation
- **Responsive Quality:** Validate separate component variants and responsive utilities work correctly

### Technical Metrics

- **Uptime:** 99.5%+ website availability
- **Performance:** Lighthouse score >90 across all categories
- **API Reliability:** <1% error rate for Effective Tours and Directus CMS integrations
- **Component Quality:** All 20+ components pass accessibility, performance, and responsive tests
- **Generation Validation:** LangGraph agents successfully select and configure components

### Generation System Metrics

- **Cost per Generation:** <$2.00 target ($0.10 actual with Kimi K2) — includes multi-page expansion via `splitToPages()` + `multiplyContent()` at $0 additional LLM cost
- **Generation Time:** <60 minutes per complete multi-page website
- **Success Rate:** >95% successful generations without manual intervention
- **Quality Score:** >90 average Lighthouse score for generated sites
- **Component Reusability:** 100% of components work across all hotel types

## Feature Requirements

### Functional Requirements (FR)

#### Core Website Pages & Navigation

**FR1: Homepage with Hero Section and Booking Integration**
- Professional hero section with responsive image variants (.webp desktop, .m.webp mobile)
- Integrated booking widget with device-specific variants (collapsible mobile, single-form desktop)
- Business amenities showcase using FeatureList component
- Featured room highlights using RoomCard component (4 variants: compact, detailed, featured, grid)
- Corporate testimonials using TestimonialCard component

**FR2: Rooms Page with Advanced Listing and Filtering**
- Detailed room listings using RoomsSection component (5 layouts: grid-2, grid-3, grid-4, carousel, list)
- Room filtering by price, amenities, capacity
- Room sorting options (price, popularity, availability)
- Image galleries with lightbox functionality
- Real-time availability checking via Effective Tours API
- Room comparison tool for business travelers

**FR3: Contact Page with Business Inquiry Integration**
- Business inquiry form using ContactCard component (3 variants: simple, detailed, with-map)
- Meeting room booking request system
- Interactive map with transportation information
- Airport shuttle scheduling
- 24/7 business center contact information

**FR4: Gallery Section with Professional Photography**
- GallerySection component (4 layouts: grid, masonry, carousel, justified)
- Category filtering (rooms, facilities, amenities, exterior)
- Lightbox modal with navigation
- Lazy loading with progressive enhancement
- Responsive image variants (.webp, .m.webp)

**FR5: Navigation with Responsive Variants**
- Navigation component with device-specific implementations:
  - **Mobile (<768px):** Hamburger menu with slide-out drawer
  - **Desktop (≥768px):** Full horizontal navigation bar
- Touch-optimized mobile interactions (44px+ touch targets)
- Smooth animations and transitions
- Logo integration with responsive sizing
- CTA button highlighting

**FR6: Multi-Language Support with Translation System**
- LanguageSelector component (4 variants: dropdown, flags, text, compact)
- Next.js i18n routing (/en/, /es/, /fr/, /de/)
- TranslationWrapper context provider
- DeepL API integration for professional translations
- BackBlaze B2 storage for translation JSON files
- Fallback to English for missing translations
- SEO optimization (hreflang tags, language-specific sitemaps)

#### Component Library & Responsive Design System

**FR7: 4-Tier Component Architecture**
- **Tier 1 - Primitives (Shadcn/ui):** Button, Card, Input, Select, Badge, Textarea, Dialog, Calendar, Avatar, Tooltip
- **Tier 2 - Blocks:** RoomCard, BookingWidget, TestimonialCard, FeatureList, ContactCard, LanguageSelector, TranslationWrapper, CookieConsent, LegalPages
- **Tier 3 - Sections:** HeroSection, RoomsSection, GallerySection, BookingSection, TestimonialsSection, AmenitiesSection, ContactSection
- **Tier 4 - Pages:** Complete page compositions with all sections

**FR8: Component Registry System with Formal Contracts**
- **Component Registry** (centralized source of truth) with metadata:
  - Component names, paths, and descriptions
  - Available variants and their use cases
  - **Formal ZOD Contracts** for runtime validation:
    ```typescript
    const ComponentContract = z.object({
      name: z.string(),
      props: z.record(z.any()),
      variants: z.array(z.string()),
      responsiveStrategy: z.enum(['separate-variants', 'responsive-utilities']),
      hotelTypeRecommendations: z.array(z.string()),
      backendIntegration: z.object({
        required: z.array(z.string()),
        optional: z.array(z.string())
      })
    });
    ```
  - Responsive strategies (separate-variants vs responsive-utilities)
  - Hotel type recommendations (luxury, boutique, business, resort)
  - Backend integration requirements
  - Performance characteristics
- **Component Manifest** (LLM-consumable format):
  - Registry data optimized for LLM discovery
  - JSON Schema for configuration validation
  - Metadata for selection heuristics
  - Cost-benefit analysis for component variants
- **Contract Validation System:**
  - Runtime validation of component configurations
  - Schema compilation for LLM consumption
  - Type-safe component instantiation
  - Error handling for invalid configurations
- Enables LLM agents to discover and select appropriate components
- Version control for component updates and contract evolution
- Progressive enforcement strategy (warning mode → strict mode)

**FR9: Responsive Design Framework (768px Breakpoint)**
- **Mobile-First Approach:** Default styles for <768px
- **Desktop Enhancements:** `md:` prefix for ≥768px
- **Two Component Strategies:**
  1. **Separate Variants** (Complex Components):
     - BookingWidget: Collapsible sections (mobile) vs single form (desktop)
     - Navigation: Hamburger menu (mobile) vs horizontal bar (desktop)
     - HeroSection: Stacked layout (mobile) vs split/carousel (desktop)
  2. **Responsive Utilities** (Simple Components):
     - RoomCard: `flex-col md:flex-row`, `p-4 md:p-6`
     - TestimonialCard: Responsive padding, text sizes, layouts
- **Image Optimization:**
  - Desktop: `.webp` format (full resolution)
  - Mobile: `.m.webp` format (optimized for smaller screens)
  - Automatic switching via `<picture>` element at 768px breakpoint
- **Touch Optimization:** 44px+ touch targets for mobile
- **Testing Requirements:** Validate at 375px (mobile), 768px (tablet), 1280px (desktop)

**FR10: Component Variant Specifications**

**BookingWidget:**
- Mobile Variant: 5 collapsible sections (Dates, Guests & Rooms, Room Preferences, Special Requests, Book Now)
- Desktop Variant: Single-form layout or sidebar layout
- Real-time availability checking
- Form validation with Zod schemas
- Price calculation and display
- Touch-optimized mobile interactions
- Loading states and error handling

**RoomCard:**
- **Compact Variant:** Minimal info for mobile, small footprint
- **Detailed Variant:** Full information with amenities list for desktop
- **Featured Variant:** Highlight styling for homepage hero
- **Grid Variant:** Optimized for grid layouts on rooms page
- Responsive images (.webp, .m.webp)
- CTA button with booking integration
- Availability status indicator

**HeroSection:**
- **Centered Variant:** Classic centered layout with background image
- **Split Variant:** Split layout with image and content
- **Minimal Variant:** Clean text-focused design for business hotels
- **Video Variant:** Background video with controls
- **Carousel Variant:** Multiple hero images with navigation
- Responsive text sizing
- Mobile/desktop specific layouts
- Booking widget integration option

**TestimonialCard:**
- **Simple Variant:** Basic review display
- **Detailed Variant:** Full testimonial with rating and verification
- **Featured Variant:** Enhanced styling for homepage
- Avatar images with responsive variants (.m.webp for mobile)
- Star ratings and verification badges
- Responsive layouts (stacked mobile, horizontal desktop)

#### Booking System Integration

**FR11: Advanced Booking Widget with Responsive Variants**
- Date picker with check-in/check-out selection
- Guest count and room quantity selectors
- Real-time availability checking via Effective Tours API
- Dynamic price calculation based on dates/guests
- Form validation with Zod schemas
- Device-specific implementations:
  - Mobile: Touch-optimized collapsible sections
  - Desktop: Single-form or sidebar layout
- Loading states with skeleton UI
- Error handling with user-friendly messages
- Booking redirect with parameter passing

**FR12: Effective Tours API Integration**
- Real-time availability checking endpoint
- Booking redirect URL construction
- No direct payment processing (redirect-based booking)
- Request deduplication and caching (30-60 seconds)
- Timeout handling (60s availability, 120s bookings)
- Retry logic with exponential backoff
- Error handling with fallback messaging

#### Content Management & Backend Integration

**FR13: Directus CMS Integration**
- **Required Collections:**
  - Hotels: Hotel details, location, brand colors, contact info
  - Rooms: Room types, pricing, amenities, images, availability
  - Amenities: Hotel and room amenities with icons and categories
  - Testimonials: Customer reviews, ratings, verification status
  - Gallery Images: Photo galleries with metadata and categorization
- Read-only API access for frontend
- GraphQL + REST endpoints
- JWT token authentication
- 5-15 minute content caching
- Request batching and optimization
- Error handling with graceful degradation
- React Query hooks: `useHotel`, `useHotelRooms`, `useTestimonials`, `useGallery`

**FR14: BackBlaze B2 Storage Integration**
- Translation JSON file storage
- Content and asset hosting
- Responsive image variants (.webp, .m.webp)
- Gallery manifest files
- Hotel-specific content data
- S3-compatible API integration
- Public read access for generated sites
- CDN integration for performance

#### LLM Generation System

**FR15: LangGraph Multi-Agent Workflow**

The reference implementation must support a complete LangGraph workflow with 6 specialized agents. While implementation details are in `/docs/04-llm-orchestration/`, the PRD specifies requirements:

**1. InputAnalyzer Agent**
- **Purpose:** Analyzes hotel parameters and provides strategic insights
- **Inputs:** Hotel name, type (luxury/boutique/business/resort/budget/eco), location, vibe, brand colors, custom requests
- **Outputs:** Hotel profile, design direction, component requirements, wireframe recommendations, confidence score
- **Model:** Kimi K2 (Temperature: 0.3, Max Tokens: 1000)
- **Cost Target:** ~$0.0002 per analysis
- **Success Criteria:** Confidence ≥0.8, analysis completed <30 seconds

**2. ComponentSelector Agent**
- **Purpose:** Selects optimal components and wireframes from manifest
- **Inputs:** InputAnalysisResult, component manifest (components.json), available wireframes, responsive configuration
- **Outputs:** Site structure (pages, components, design tokens), responsive configuration, selection reasoning, device priority strategy
- **Model:** Kimi K2 (Temperature: 0.2, Max Tokens: 1500)
- **Cost Target:** ~$0.0003 per selection
- **Success Criteria:** 8-10 components selected, responsive strategies defined, confidence ≥0.8

**3. StylingAgent**
- **Purpose:** Generates custom Tailwind CSS configuration and styling
- **Inputs:** ComponentSelectionResult, brand colors, design direction, hotel vibe
- **Outputs:** Tailwind config (colors, typography, spacing, shadows), custom CSS, CSS variables, style guide
- **Model:** Kimi K2 (Temperature: 0.4, Max Tokens: 2000)
- **Cost Target:** ~$0.0005 per styling
- **Success Criteria:** Valid Tailwind config, unique visual identity, <50KB CSS footprint

**4. TranslationAgent**
- **Purpose:** Generates multi-language translation files
- **Service:** DeepL API (professional tier)
- **Inputs:** StylingResult, target languages (EN, ES, FR, DE), translatable content
- **Outputs:** Translation files (JSON format), BackBlaze B2 URLs, fallback content, translation metrics
- **Cost Target:** ~$0.02-$0.10 per language
- **Success Criteria:** All UI strings translated, stored on BackBlaze B2, fallback to English functional

**5. AssemblyAgent**
- **Purpose:** Generates complete Next.js application files
- **Inputs:** ComponentSelectionResult, StylingResult, component templates
- **Outputs:** Generated files (components, pages, config, styles), file structure, build config, asset manifest
- **Model:** Kimi K2 (Temperature: 0.1, Max Tokens: 4000)
- **Cost Target:** ~$0.001 per assembly
- **Success Criteria:** Valid Next.js app, all files generated, build succeeds, <10 minutes processing

**6. QualityValidator Agent**
- **Purpose:** Validates generated output against quality standards
- **Inputs:** AssemblyResult, generated files, quality benchmarks
- **Outputs:** Quality metrics (Lighthouse score, accessibility, performance, responsive quality, code quality, component validation, build metrics)
- **Model:** Kimi K2 (Temperature: 0.1, Max Tokens: 1000)
- **Cost Target:** ~$0.0001 per validation
- **Success Criteria:** Lighthouse ≥85, 0 type errors, 0 lint errors, Core Web Vitals compliance

**Agent Communication & Workflow:**
- LangGraph state management for workflow coordination
- Sequential execution with error recovery
- Timeout protection (30 minutes max total)
- Retry logic with exponential backoff (max 3 attempts)
- Step-wise error isolation
- Graceful degradation with fallbacks

**Generation Input Parameters:**
```typescript
interface HotelParameters {
  hotelName: string;
  hotelType: 'luxury' | 'boutique' | 'business' | 'resort' | 'budget' | 'eco';
  location: string;
  vibe: 'modern' | 'classic' | 'rustic' | 'minimalist' | 'elegant' | 'casual';
  brandColors: { primary: string; secondary: string; accent: string; };
  customRequests?: string;
  targetAudience?: string[];
  specialFeatures?: string[];
}
```

#### LLM Infrastructure & Observability

**FR16: LangFuse Integration (Observability)**
- **Trace-Level Workflow Visibility:** Complete workflow monitoring from input to deployment
- **Generation Tracking:** Individual LLM call monitoring with input/output capture
- **Cost Attribution:** Per-agent cost tracking and breakdown
- **Performance Metrics:** Response times, token usage, efficiency monitoring
- **Error Tracking:** Failure detection, recovery monitoring, debugging support
- **Trace URLs:** Shareable URLs for workflow debugging and analysis
- **Real-Time Dashboard:** Live cost tracking, budget monitoring, performance insights
- **Alert System:** Notifications for budget overruns, failures, performance degradation

**FR17: Cost Monitoring System**
- **Budget Target:** $2.00 per website generation (actual ~$0.10 with Kimi K2)
- **Budget Allocation:**
  - InputAnalyzer: $0.50 (25%)
  - ComponentSelector: $0.75 (37.5%)
  - ConfigurationGenerator: $0.50 (25%)
  - QualityValidator: $0.25 (12.5%)
- **Emergency Stop Mechanism:** Automatic workflow termination at $4.90 threshold
- **Real-Time Tracking:** Per-step cost accumulation and monitoring
- **Model Pricing Database:** Per 1K token pricing for all supported models
- **Cost Reporting:** Detailed breakdown per agent and per generation
- **Budget Recommendations:** Model selection based on remaining budget

**FR18: OpenRouter API Integration**
- **LLM Provider Abstraction:** Unified interface for multiple LLM providers
- **Model Support:** Anthropic Claude, OpenAI GPT, Kimi K2, etc.
- **Retry Mechanism:** Exponential backoff with max 3 attempts
- **Model Fallback:** Automatic fallback to cheaper models on primary failure
- **Structured Response Parsing:** JSON output validation and error handling
- **Budget-Aware Selection:** Choose model based on remaining budget and task complexity
- **Cost Tracking Integration:** Automatic cost calculation per request

**FR19: Generation Workflow Orchestration**
- **Workflow Steps:** Input Analysis → Component Selection → Styling → Translation → Assembly → Validation
- **State Management:** LangGraph state machine with typed workflow state
- **Error Handling:** Per-step error isolation with recovery strategies
- **Timeout Protection:** 30-minute max workflow duration
- **Progress Tracking:** Real-time workflow progress monitoring
- **Workflow Resumption:** Ability to resume from last successful step on failure
- **Parallel Execution:** Translation generation can run parallel to other steps

**Component Selection Logic:**
```typescript
const componentSelectionRules = {
  baseRequirements: {
    minSections: 3,
    maxSections: 8,
    requiredComponents: ['HeroSection', 'BookingSection', 'Navigation'],
    conversionOptimization: true,
    responsiveStrategy: 'mobile-first',
    breakpoint: '768px'
  },
  hotelTypeRules: {
    luxury: {
      preferredComponents: ['GallerySection', 'TestimonialsSection'],
      mobileVariants: { HeroSection: 'minimal', GallerySection: 'carousel' },
      desktopVariants: { HeroSection: 'video-bg', GallerySection: 'masonry' },
      responsiveImages: true
    },
    boutique: {
      preferredComponents: ['AboutSection', 'TestimonialsSection'],
      mobileVariants: { HeroSection: 'stacked', RoomCard: 'compact' },
      desktopVariants: { HeroSection: 'split', RoomCard: 'detailed' }
    },
    business: {
      preferredComponents: ['FacilitiesSection', 'LocationSection'],
      mobileVariants: { HeroSection: 'minimal', BookingSection: 'simple' },
      desktopVariants: { HeroSection: 'centered', BookingSection: 'sidebar' }
    }
  }
};
```

**FR20: Progressive Contract Enforcement Strategy**

**Phase 1 - Warning Mode (Week 1):**
- Log validation warnings for invalid component configurations
- Allow graceful degradation for non-critical contract violations
- Detailed error messages for debugging LLM outputs
- Cost tracking includes validation overhead
- Performance monitoring for validation impact
- Learning mode: Collect data on common violation patterns

**Phase 2 - Strict Mode (Week 2):**
- Block generation on contract validation failures
- Zero-tolerance approach to component configuration errors
- Enhanced error recovery with automatic fallbacks
- Mandatory contract validation before deployment
- Emergency override capability for critical situations
- Performance optimization for validation pipeline

**Enforcement Mechanisms:**
- Runtime validation during component instantiation
- Pre-generation schema compilation for LLM consumption
- Post-generation validation with detailed reporting
- Cost monitoring includes validation performance
- Automated rollback on validation failures
- Progressive logging levels for debugging

**Rationale:** Balances development velocity with component reliability, ensuring LLM-generated configurations meet quality standards while maintaining 2-week timeline. The phased approach allows the system to learn from early violations before enforcing strict compliance.

#### Compliance & Legal

**FR22: GDPR/CCPA Compliance with Granular Cookie Consent**
- CookieConsent component (4 variants: banner, modal, corner, inline)
- Granular cookie categories: Necessary, Functional, Analytics, Marketing
- Consent choices persistence in LocalStorage
- Audit trail for compliance records
- GDPR Article 7 full implementation
- CCPA compliance for California residents

**FR23: Privacy Policy and Terms of Service**
- LegalPages component with auto-generated templates
- Privacy Policy with GDPR/CCPA compliance
- Terms of Service with jurisdiction-specific clauses
- Multi-language support for international hotels
- Schema markup for search engines
- Print-optimized layouts
- Version control with update notifications

**FR24: Security Headers and HTTPS Enforcement**
- HTTPS enforcement for all connections (MANDATORY)
- Content Security Policy headers for XSS protection
- X-Frame-Options, X-Content-Type-Options headers
- CORS configuration for API access
- JWT token-based authentication for CMS

### Non-Functional Requirements (NFR)

#### Performance

**NFR1: Core Web Vitals Compliance (Responsive-Aware)**

**Mobile (<768px):**
- LCP: <3000ms
- FID: <100ms
- CLS: <0.1
- Lighthouse Performance: >85
- Bundle size: <150KB initial JS, <40KB CSS

**Desktop (≥768px):**
- LCP: <2000ms
- FID: <50ms
- CLS: <0.05
- Lighthouse Performance: >95
- Bundle size: <250KB initial JS, <60KB CSS

**NFR2: Lighthouse Score Requirements**
- Performance: >90 (mobile >85, desktop >95)
- Accessibility: >95 (WCAG 2.1 AA compliance)
- Best Practices: >90
- SEO: >95

**NFR3: Bundle Size and Optimization**
- Initial JavaScript: <150KB mobile, <250KB desktop
- CSS bundle: <40KB mobile, <60KB desktop
- Component-level code splitting
- Tree shaking for unused code
- Image optimization (.webp, .m.webp)

**NFR4: Page Load Performance**
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Total Blocking Time: <200ms

#### Security & Compliance

**NFR5: Security Framework**
- HTTPS enforcement (MANDATORY)
- Content Security Policy headers (REQUIRED)
- JWT token-based API access
- Zod schema validation for all inputs
- Security headers: X-Frame-Options, X-Content-Type-Options

**NFR6: Privacy Compliance**
- GDPR Article 7 full implementation
- CCPA compliance
- Granular cookie consent (REQUIRED)
- Read-only data access, no PII storage
- Consent audit trail

#### Usability & Accessibility

**NFR7: WCAG 2.1 AA Compliance**
- Screen reader compatibility with ARIA labels
- Keyboard navigation for all interactions
- Color contrast ratios 4.5:1 for text
- Focus indicators and logical tab order
- Alt text for all images

**NFR8: Responsive Design Standards**
- Mobile-first approach (<768px default)
- Desktop enhancements (≥768px `md:` prefix)
- 44px minimum touch targets for mobile
- Touch-optimized interactions
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

#### Component System Quality

**NFR9: Component Manifest Completeness**
- All 20+ components documented in manifest
- Props schemas defined with TypeScript
- Responsive strategies specified per component
- Variant availability documented
- Hotel type recommendations included
- Backend integration requirements specified

**NFR10: Responsive Design Validation**
- All components tested at 375px, 768px, 1280px breakpoints
- Separate variants work correctly (BookingWidget, Navigation, HeroSection)
- Responsive utilities function properly (RoomCard, TestimonialCard)
- Image variants (.webp, .m.webp) switch at 768px
- Touch targets ≥44px on mobile

**NFR11: Backend Integration Reliability**
- Directus CMS: <1% error rate, 5-15 minute caching
- Effective Tours API: <1% error rate, retry logic, timeout handling
- BackBlaze B2: 99.9% availability, CDN integration
- DeepL API: Professional-grade translations, fallback to English

#### LLM Generation System Quality

**NFR12: Generation System Performance**
- Generation time: <60 minutes per complete website
- Success rate: >95% without manual intervention
- Cost per generation: <$2.00 (target <$0.50)
- Quality score: >90 average Lighthouse for generated sites

**NFR13: LangFuse Observability Requirements**
- 100% of LLM calls tracked with trace IDs
- Real-time cost monitoring with 1-second refresh
- Trace URLs generated for all workflows
- Performance metrics captured per agent
- Error tracking with stack traces
- Budget enforcement with emergency stops

**NFR14: Component Reusability**
- 100% of components work across all hotel types
- All responsive strategies validated
- Backend integrations functional in all configurations
- Styling customization works without breaking layouts
- Translations apply correctly to all components

#### Reliability & Monitoring

**NFR15: Website Availability**
- 99.5%+ uptime
- CloudFlare CDN for global delivery
- Automated health checks
- Real-time alerting for downtime

**NFR16: API Error Handling**
- <1% error rate for third-party integrations
- Retry logic with exponential backoff
- Graceful degradation for API failures
- User-friendly error messages
- Error tracking with Sentry (optional)

**NFR17: Performance Monitoring**
- Real-time Core Web Vitals tracking
- Automated performance regression detection
- Weekly performance reports
- Lighthouse CI integration

## User Experience & Design Requirements

### Overall UX Vision

Create a sophisticated, professional website that seamlessly blends business functionality with boutique luxury aesthetics while demonstrating the complete component library and responsive design framework for LLM-driven generation. Every interaction should:

1. Serve the Sterling Executive Hotel's dual business/boutique positioning
2. Demonstrate responsive design patterns (separate variants vs utilities)
3. Showcase component variant diversity for LLM selection
4. Validate backend integration patterns
5. Prove performance standards at all breakpoints

The reference implementation must feel like a premium hotel website while including all infrastructure needed for mass generation.

### Key Interaction Paradigms

**Mobile Experience (<768px):**

- Hamburger menu with smooth slide-out drawer navigation
- Single-column stacked layouts with optimal readability
- Touch-optimized booking widget with 5 collapsible sections
- Simplified room cards with essential information (compact variant)
- Swipeable image galleries with lightbox functionality
- 44px+ touch targets for all interactive elements
- Mobile-optimized images (.m.webp format)
- Gestures: swipe for galleries, tap to expand sections

**Desktop Experience (≥768px):**

- Full horizontal navigation menu with dropdown submenus
- Multi-column layouts showcasing professional photography
- Single-form booking widget or sidebar layout
- Advanced room filtering and comparison tools
- Detailed room cards with full amenities (detailed variant)
- Hover states, keyboard navigation, micro-animations
- Enhanced interactions leveraging larger screen real estate
- Desktop-optimized images (.webp format)

**Responsive Design Demonstration:**

This reference implementation must clearly demonstrate when to use:
1. **Separate Component Variants** (BookingWidget, Navigation, HeroSection)
2. **Responsive Utilities** (RoomCard, TestimonialCard, FeatureList)

LLM agents will learn from these patterns to make appropriate responsive design decisions.

### Core Screens and Views

**Homepage:**

- HeroSection component (demonstrate multiple variants: centered for Sterling Executive)
- Integrated booking widget with responsive variants
- Featured room highlights using RoomCard components (featured variant)
- Business traveler testimonials (TestimonialCard simple variant)
- Corporate client logos and trust indicators
- FeatureList component for amenities showcase
- CTA sections for meeting room booking

**Rooms Page:**

- RoomsSection component with grid-3 layout for desktop, grid-2 for mobile
- Detailed room listings using RoomCard detailed variant
- Filtering system (price, amenities, capacity)
- Sorting options (price, popularity, availability)
- GallerySection component for room images
- Real-time availability display
- Booking widget integration

**Contact Page:**

- ContactCard component with with-map variant
- Business inquiry form with validation
- Meeting room booking form
- Interactive map integration
- Airport shuttle information
- 24/7 business center details

**Gallery Page:**

- GallerySection component (demonstrate masonry layout)
- Category filtering (rooms, facilities, amenities, exterior)
- Lightbox modal with navigation
- Lazy loading demonstration
- Responsive image handling

### Accessibility: WCAG 2.1 AA

- Screen reader compatibility with proper ARIA labels
- Keyboard navigation support for all interactive elements
- Sufficient color contrast ratios (4.5:1 for normal text)
- Focus indicators and logical tab order
- Alt text for all images and descriptive links
- Touch target size ≥44px on mobile
- Semantic HTML structure
- Skip navigation links

### Branding

**Color Palette:**

- Primary: #1e3a5f (Deep corporate blue - professionalism, trust)
- Secondary: #c9a961 (Gold accent - luxury, boutique warmth)
- Accent: #2c5282 (Medium blue - CTAs, engagement)
- Neutral: #f8fafc (Light backgrounds), #0f172a (Text, dark elements)

> **Implementation Note:** These brand colors are specified in hex for readability. The technical implementation uses OKLCH format exclusively (e.g., `oklch(0.346 0.074 256)`). Full palette shades are auto-generated. See `docs/design-system/design-tokens.md`.

**Typography:**

- Headings: Playfair Display (modern serif for boutique elegance)
- Body Text: Inter (clean sans-serif for business readability)
- UI Elements: System fonts for performance and consistency
- Accent Text: Sterling Gold (#c9a961) for CTAs and important information

**Design Direction:**

- Modern sophistication with warm boutique touches
- Clean, spacious layouts with ample white space
- Professional architectural photography with warm, inviting lighting
- Clear information hierarchy with business-critical information prominent

**Note:** LLM StylingAgent will generate custom Tailwind configurations for each hotel based on brand colors, but Sterling Executive demonstrates the baseline aesthetic quality expected.

### Target Device and Platforms: Web Responsive

- Mobile-first approach (<768px mobile, ≥768px desktop)
- Single breakpoint strategy for simplicity
- Progressive enhancement for larger screens
- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Optimized for both touch and mouse interactions
- Responsive image variants (.webp, .m.webp)

## Technical Requirements

### Core Technology Stack

**Frontend Framework:**

- Next.js 14+ with App Router for modern React development
- TypeScript 5.0+ in strict mode for type safety
- Static Site Generation (SSG) + Client-side hydration
- Tailwind CSS 3.4+ with custom configuration per hotel
- Export mode for static hosting

**UI Components:**

- Shadcn/ui as base component library
- Radix UI primitives for accessibility
- Lucide React for consistent icon system
- Class Variance Authority for component variants
- 4-tier component architecture (Primitives → Blocks → Sections → Pages)

**State Management:**

- React Query (@tanstack/react-query) for server state management
- Zustand for client-side state (UI state, form state, preferences)
- LocalStorage persistence for user preferences
- TypeScript integration for type safety

**Forms & Validation:**

- React Hook Form for form management
- Zod schema validation for runtime type safety
- Custom validation patterns for booking forms
- Error handling with user-friendly messages

### Backend Integration

**Content Management System:**

- Directus CMS 12.0+ for dynamic content management
- Read-only API for frontend Next.js application
- GraphQL + REST for content retrieval
- 5-15 minute cache for content optimization
- JWT tokens for secure content fetching
- Required collections: hotels, rooms, amenities, testimonials, gallery_images
- Request batching and optimization
- Error handling with graceful degradation

**Booking System:**

- Effective Tours API for availability and booking
- Real-time availability checking endpoint
- Booking redirect URL construction
- No direct payment processing on website
- Timeout handling (60s availability, 120s bookings)
- Retry logic with exponential backoff
- Request deduplication and caching (30-60 seconds)
- Error handling with fallback messaging

**Storage & Assets:**

- BackBlaze B2 for translation files and content
- S3-compatible API integration
- Public read access for generated sites
- CDN integration for performance
- Responsive image variants (.webp, .m.webp)
- Gallery manifest files
- Hotel-specific content data

**Translation Service:**

- DeepL API (professional tier) for translations
- Batch translation processing (50 strings per request)
- Translation caching for common strings
- BackBlaze B2 storage for JSON files
- Fallback to English hardcoded translations
- Cost tracking (~$0.02-$0.10 per language)

### LLM Orchestration Stack

**LangGraph 0.2+ (Multi-Agent Workflows)**
- State machine management for workflow coordination
- Agent communication protocols
- Error recovery and retry mechanisms
- Sequential execution with timeout protection
- Workflow state persistence
- Step-wise error isolation
- Graceful degradation with fallbacks

**LangFuse 2.0+ (Observability & Cost Tracking)**
- Real-time cost tracking per LLM call
- Trace-level workflow visibility
- Generation tracking with input/output capture
- Performance metrics monitoring (response times, token usage)
- Error tracking and recovery monitoring
- Trace URLs for debugging and analysis
- Budget enforcement with emergency stops ($4.90 threshold)
- Alert system for budget overruns and failures

**OpenRouter API (LLM Provider Abstraction)**
- Primary model: Kimi K2 (~$0.002 per generation)
- Fallback models: Claude 3.5 Sonnet, Claude 3 Haiku, GPT-4o-mini
- Intelligent model selection based on budget
- Retry with exponential backoff (max 3 attempts)
- Model fallback on failure
- Structured response parsing with validation
- Cost calculation per request
- Timeout handling (30 seconds per agent)

**Cost Monitoring System:**
- Real-time cost accumulation per step
- Budget allocation tracking ($0.50, $0.75, $0.50, $0.25 per agent)
- Model pricing database (per 1K tokens)
- Emergency stop mechanism at $4.90
- Cost reporting and breakdown
- Budget-based model recommendations

### Security & Compliance Framework

**Security Requirements:**

- HTTPS enforcement for all connections (MANDATORY)
- Content Security Policy headers for XSS protection (REQUIRED)
- JWT token-based API access for CMS
- Zod schema validation for all inputs
- Security headers: X-Frame-Options, X-Content-Type-Options
- CORS configuration for API access

**Privacy & Compliance (REQUIRED):**

- GDPR Compliance: Full GDPR Article 7 implementation
- CCPA Compliance: California Consumer Privacy Act compliance
- Granular cookie consent system with 4 categories
- Read-only data access, no PII storage
- Consent audit trail for compliance records
- Auto-generated legal documentation

**Required Compliance Components:**

- CookieConsent: Granular consent management (4 variants)
- LegalPages: Privacy Policy, Terms of Service templates
- DataProcessing: Transparent data processing information
- AuditTrail: Consent logging system

### Performance & SEO

**Performance Targets:**

- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Lighthouse Score: >90 across all categories (>85 mobile, >95 desktop)
- Bundle Size: <150KB initial JS (mobile), <250KB (desktop)
- CSS Bundle: <40KB (mobile), <60KB (desktop)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Total Blocking Time: <200ms

**Performance Optimization:**

- Next.js Image component with automatic optimization
- Responsive image variants (.webp, .m.webp)
- Code splitting per route
- Tree shaking for unused code
- Lazy loading for below-fold content
- CSS optimization and minification
- Bundle analysis for size monitoring

**SEO Optimization:**

- Schema Markup: Structured data for hotels, rooms, reviews
- Meta Tags: Proper meta tags and Open Graph
- URL Structure: SEO-friendly with proper routing
- Sitemaps: XML sitemaps with multi-language support
- Hreflang Tags: Language-specific SEO
- Local SEO: Google Business Profile integration

### Multi-language Support

**Internationalization Setup:**

- Next.js i18n routing configuration
- URL structure: /en/, /es/, /fr/, /de/ routes
- Browser language detection with fallback
- JSON translation files for content
- DeepL API for professional translations
- BackBlaze B2 storage for translation files

**Required Translation Components:**

- LanguageSelector: Multi-language component (4 variants: dropdown, flags, text, compact)
- TranslationWrapper: React context provider for i18n
- Translation loading: Dynamic JSON loading from BackBlaze
- Fallback Strategy: English hardcoded fallback
- SEO Optimization: Hreflang tags, language-specific sitemaps
- Performance: Lazy loading of translation files

**Translation File Structure:**
```typescript
interface TranslationFile {
  metadata: {
    language: string;
    version: string;
    generatedAt: string;
    totalStrings: number;
  };
  ui: {
    navigation: Record<string, string>;
    buttons: Record<string, string>;
    forms: Record<string, string>;
    errors: Record<string, string>;
  };
  content: {
    headings: Record<string, string>;
    descriptions: Record<string, string>;
    amenities: Record<string, string>;
  };
}
```

### Deployment & Infrastructure

**Hosting Platform:**

- CloudFlare Pages for static site hosting
- CloudFlare CDN for global content delivery
- Custom domain with SSL certificates
- Automatic deployment from Git repository
- Production, staging, development environments
- Environment variable management

**Build Configuration:**

- Next.js static export mode
- Image optimization pipeline (.webp, .m.webp generation)
- CSS compilation and optimization
- Bundle size optimization with code splitting
- Asset optimization (images, fonts)
- Source maps for debugging

**Wrangler Configuration:**
```yaml
name: "sterling-executive"
compatibility_date: "2023-12-01"
pages_build_output_dir: "out"
env.production: { NODE_ENV: "production" }
```

**Monitoring & Analytics:**

- LangFuse: LLM workflow monitoring and cost tracking
- Sentry: Error monitoring (optional)
- Vercel Analytics: Performance monitoring (optional)
- CloudFlare Analytics: Traffic and health monitoring
- Google Analytics: User analytics (optional)
- Lighthouse CI: Automated performance testing

## Test-Driven Development (TDD) Requirements

### Testing Philosophy

This reference implementation follows Test-Driven Development where tests validate not only the Sterling Executive website but also the patterns and infrastructure needed for LLM-driven generation. Tests must cover:

1. **Component Functionality** - All 20+ components work correctly
2. **Responsive Behavior** - Separate variants and responsive utilities function properly
3. **Backend Integration** - Directus CMS and Effective Tours API integration
4. **LangGraph Agents** - Multi-agent workflow with cost monitoring
5. **Generation Infrastructure** - LangFuse tracking, OpenRouter integration, cost monitoring
6. **LLM Composition Testing** - Validation of component contracts through prompts:
   - Test component manifest against ZOD schemas
   - Validate LLM-generated configurations against contract rules
   - Test prompt engineering for component selection
   - Verify error recovery for invalid configurations
   - Test progressive enforcement mechanisms (warning → strict mode)

### Testing Architecture

**Testing Pyramid Structure:**

- **Unit Tests (70%):** Fast, isolated tests for components, utilities, and agent logic
- **Integration Tests (20%):** Tests for API integrations, component interactions, workflow steps
- **End-to-End Tests (10%):** Critical user journeys and generation workflow validation

### Test Configuration Files

**Multiple Jest Configurations:**
- **jest.config.js** - Main Next.js configuration with jsdom environment
- **jest.config.workflow.js** - LangGraph workflow tests with extended timeouts (10s)
- **jest.config.single.js** - Individual test execution for debugging
- **jest.config.simple.js** - Lightweight tests without complex mocking

**Critical Configuration:**
```typescript
{
  testEnvironment: "jest-environment-jsdom",
  testTimeout: 10000,
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"]
}
```

### Unit Testing Requirements

**Frontend Component Testing:**

- **React Component Testing:** All 20+ components with comprehensive tests
  - Jest + React Testing Library for behavior validation
  - Test user interactions, state changes, props rendering
  - Validate accessibility attributes (ARIA labels, roles)
  - Test responsive behavior at breakpoints (375px, 768px, 1280px)
  - Test component variants (BookingWidget mobile/desktop, RoomCard compact/detailed/featured/grid)
  - Test error states and edge cases
  - Test loading states with skeleton UI

**Responsive Design Testing:**

- **Separate Variant Testing:**
  - BookingWidget: Test collapsible sections (mobile) vs single form (desktop)
  - Navigation: Test hamburger menu (mobile) vs horizontal bar (desktop)
  - HeroSection: Test stacked layout (mobile) vs split/carousel (desktop)
- **Responsive Utility Testing:**
  - RoomCard: Validate `flex-col` (mobile) vs `md:flex-row` (desktop)
  - TestimonialCard: Test responsive padding, text sizes
- **Image Variant Testing:**
  - Validate `.webp` (desktop) vs `.m.webp` (mobile) switching at 768px
  - Test `<picture>` element source selection

**Business Logic Testing:**

- **Utility Functions:** All helper functions with unit tests
- **State Management:** Zustand stores with test coverage for mutations
- **API Data Processing:** Data transformation and validation
- **Form Validation:** All Zod schemas with dedicated tests
- **Component Selection Logic:** Test hotel type recommendations

### Integration Testing Requirements

**API Integration Testing:**

- **Directus CMS Integration:**
  - Mock API responses with MSW
  - Test data fetching, caching (5-15 minutes), error handling
  - Validate React Query hooks (useHotel, useHotelRooms, useTestimonials, useGallery)
  - Test loading states and retry logic
- **Effective Tours API Integration:**
  - Mock availability checking and booking redirection
  - Test error handling for API failures
  - Validate URL construction and parameter passing
  - Test timeout handling (60s, 120s)
  - Test retry logic with exponential backoff

**LangGraph Agent Testing (CRITICAL PATTERNS):**

**1. Prototype-Based Mocking (REQUIRED):**
```typescript
// ✅ CORRECT - Prototype mocking for class-based agents
const { InputAnalyzerAgent } = require('@/langgraph/agents/InputAnalyzer');
InputAnalyzerAgent.prototype.analyzeInput = jest.fn().mockResolvedValue(mockData);

// ❌ WRONG - Instance mocking doesn't work
mockInputAnalyzer.analyzeInput.mockResolvedValue(mockData);
```

**2. Cost Monitor State Management (CRITICAL):**
```typescript
beforeEach(() => {
  jest.clearAllMocks();
  costMonitor.reset(); // MUST reset - clears costs AND emergency stops
});

// Test emergency stops AFTER reset
InputAnalyzerAgent.prototype.analyzeInput = jest.fn().mockImplementation(() => {
  costMonitor.activateEmergencyStop(); // Activate after reset
  return Promise.resolve(mockData);
});
```

**3. Floating-Point Precision:**
```typescript
// Use toBeCloseTo for cost comparisons
expect(result.totalCost).toBeCloseTo(1.5, 4);
```

**4. Workflow Error Testing:**
```typescript
// Trigger specific errors by returning null
ConfigurationGeneratorAgent.prototype.generateConfiguration = jest.fn()
  .mockResolvedValue(null); // Triggers 'Configuration required for validation'
```

**5. LLM Service Mocking:**
```typescript
llmService.generateQualityValidation = jest.fn().mockResolvedValue({
  structured: mockValidation,
  cost: 0.1,
  usage: { totalTokens: 300 },
  model: 'anthropic/claude-3-haiku'
});
```

**Component Integration Testing:**

- **Page-Level Testing:** Complete pages with all sub-components
- **Navigation Testing:** Routing and navigation between pages
- **State Integration:** Component state sharing and updates
- **Responsive Integration:** Test components together at different breakpoints
- **Backend Integration:** Test components with real data structures

### End-to-End Testing Requirements

**Critical User Journey Testing:**

- **Booking Flow:** Homepage → Room selection → Booking widget → Effective Tours redirect
- **Room Browsing:** Rooms page → Filtering → Sorting → Room details → Gallery
- **Contact Forms:** Contact page → Form fill → Validation → Submission
- **Mobile Experience:** Critical journeys on mobile devices (<768px)
- **Accessibility Journey:** Screen reader and keyboard navigation paths
- **Multi-Language:** Language selection → Content translation → SEO validation

**LangGraph Workflow Testing:**

- **Complete Generation Workflow:**
  - Input parameters → InputAnalyzer → ComponentSelector → StylingAgent → TranslationAgent → AssemblyAgent → QualityValidator
  - Validate state management between agents
  - Test error recovery and retry logic
  - Validate cost tracking and budget enforcement
  - Test emergency stop mechanism
  - Validate LangFuse trace generation
- **Cost Monitor Testing:**
  - Real-time cost accumulation
  - Budget threshold enforcement ($4.90)
  - Emergency stop activation
  - Cost reporting accuracy
- **Model Fallback Testing:**
  - Primary model failure → fallback to cheaper model
  - Retry logic with exponential backoff
  - Timeout handling

**Cross-Browser Testing:**

- **Browser Matrix:** Chrome, Firefox, Safari, Edge (latest versions)
- **Device Testing:** Desktop, tablet, mobile viewports
- **Responsive Testing:** Validate at 375px, 768px, 1280px breakpoints
- **Progressive Enhancement:** Test fallback behaviors

**Performance Testing:**

- **Core Web Vitals:** Automated Lighthouse CI testing
  - Mobile: LCP <3s, FID <100ms, CLS <0.1
  - Desktop: LCP <2s, FID <50ms, CLS <0.05
- **Bundle Performance:** JavaScript and CSS bundle size monitoring
- **Image Optimization:** Validate .webp and .m.webp variants load correctly
- **API Performance:** Response time monitoring for Directus and Effective Tours

### Test Environment Setup

**Development Environment:**

- **Local Testing:** Jest with hot reload for rapid feedback
- **Coverage Reporting:** Real-time coverage with 80%+ target
- **Pre-commit Hooks:** Automated test execution before commits
- **Test Watchers:** Continuous test execution during development

**Continuous Integration:**

- **Automated Testing:** All tests run on every pull request
- **Parallel Execution:** Test suite optimized for CI/CD
- **Coverage Gates:** Minimum 80% statement, 70% branch coverage enforced
- **Performance Regression:** Lighthouse CI on each build
- **Workflow Testing:** LangGraph workflow validation in CI

**Test Data Management:**

- **Mock Data:** Consistent fixtures for all test scenarios
- **Component Manifest:** Test manifest with all component metadata
- **Hotel Parameters:** Sample inputs for all hotel types
- **API Responses:** Mock Directus CMS and Effective Tours responses
- **Translation Files:** Sample JSON files for i18n testing

### Specific Test Requirements

**Component Testing Standards:**

- **Accessibility Testing:** All components pass axe-core tests
- **Responsive Testing:** Components tested at 375px, 768px, 1280px
- **Error Boundary Testing:** Error handling and recovery
- **Loading State Testing:** Skeleton UI and loading indicators
- **Variant Testing:** All component variants tested (compact, detailed, featured, grid)

**Form Testing Requirements:**

- **Validation Logic:** All Zod schemas tested
- **User Input Testing:** Keyboard and mouse interactions
- **Submission Flow:** End-to-end form submission with API mocking
- **Error Handling:** Form error display and recovery
- **Booking Widget:** Test both mobile and desktop variants

**LangGraph Agent Testing Requirements:**

- **Agent Unit Tests:** Each agent tested independently with mocked dependencies
- **Workflow Integration Tests:** Full workflow with all agents
- **Cost Tracking Tests:** Validate LangFuse integration and cost accumulation
- **Error Recovery Tests:** Test retry logic and fallback mechanisms
- **State Management Tests:** Validate workflow state transitions
- **Budget Enforcement Tests:** Emergency stop activation at $4.90

### Performance Testing Standards

**Core Web Vitals Testing:**

- **Lighthouse Integration:** Automated testing in CI/CD
- **Performance Budgets:** Enforce budgets for all metrics
- **Regression Testing:** Detect performance degradation
- **Optimization Validation:** Test effectiveness of optimizations

**Bundle Testing:**

- **Bundle Analysis:** Size impact of new features
- **Code Splitting:** Validate route-based splitting
- **Tree Shaking:** Test unused code elimination
- **Asset Optimization:** Image and font optimization

### Quality Assurance Requirements

**Code Coverage Standards:**

- **Minimum Coverage:** 80% statement, 70% branch coverage
- **Critical Path Coverage:** 100% for booking flows and generation workflow
- **Error Path Coverage:** All error handling paths tested
- **Edge Case Coverage:** Boundary conditions and unusual inputs
- **LangGraph Coverage:** >90% for all agent and workflow code

**Test Quality Standards:**

- **Test Isolation:** Independent and repeatable tests
- **Clear Descriptions:** Descriptive test names
- **Arrange-Act-Assert:** Structured test pattern
- **Test Documentation:** Complex scenarios documented

**Regression Testing:**

- **Automated Regression:** Full suite on each release
- **Visual Regression:** UI component snapshot testing
- **Performance Regression:** Lighthouse score monitoring
- **API Regression:** Backend integration validation

### Testing Tools and Framework

**Core Testing Stack:**

- **Jest 29.7+:** Primary testing framework
- **React Testing Library:** Component testing with user-centric approach
- **Playwright:** End-to-end testing for critical journeys
- **MSW (Mock Service Worker):** API mocking for offline testing
- **Testing Library User Event:** Realistic user interaction simulation

**Performance Testing Tools:**

- **Lighthouse CI:** Automated performance testing
- **Web Vitals Library:** Core Web Vitals measurement
- **Bundle Analyzer:** Bundle size analysis (@next/bundle-analyzer)
- **Performance Profiling:** Runtime performance measurement

**Accessibility Testing Tools:**

- **axe-core:** Automated accessibility testing
- **Screen Reader Testing:** VoiceOver and NVDA workflows
- **Keyboard Navigation Testing:** Comprehensive interaction testing

**LangGraph Testing Tools:**

- **Jest Mocking:** Prototype-based agent mocking
- **Cost Monitor Utilities:** Test utilities for cost tracking
- **LangFuse Mock:** Mocked observability for testing
- **Workflow Fixtures:** Reusable workflow test data

### Success Criteria for Testing

**Development Milestones:**

- **Feature Completion:** All tests passing before integration
- **Release Readiness:** 100% critical path coverage, 80%+ overall
- **Performance Targets:** Core Web Vitals within ranges
- **Accessibility Compliance:** All axe-core tests passing
- **LangGraph Validation:** All workflow tests passing with cost monitoring

**Quality Metrics:**

- **Test Execution Time:** Full suite under 5 minutes
- **Test Reliability:** <1% flaky test rate
- **Coverage Maintenance:** No coverage regression
- **Performance Stability:** No performance regressions
- **Workflow Reliability:** >95% generation success rate in tests

## Assumptions & Constraints

### Technical Assumptions

**API Integration Availability:**

- Effective Tours API provides real-time availability and booking redirection
- Directus CMS pre-configured with required collections
- BackBlaze B2 provides reliable storage for translations and content
- DeepL API provides professional-grade translations
- OpenRouter API provides stable access to Kimi K2 and fallback models

**LLM Generation Assumptions:**

- Kimi K2 model maintains ~$0.002 per generation cost
- LangFuse observability platform remains available
- Component manifest remains comprehensive and up-to-date
- Generated websites can be deployed to CloudFlare Pages
- Cost monitoring can enforce $2 budget limit

**Performance Requirements:**

- CloudFlare CDN handles global content distribution
- Image optimization achieves Core Web Vitals targets
- Bundle size optimization meets specified targets
- Responsive image variants (.webp, .m.webp) improve mobile performance

### Business Constraints

**Timeline Constraints:**

- 2-week development timeline is fixed
- MVP launch requires core functionality complete
- Reference implementation must demonstrate ALL generation features
- Post-launch support resources limited initially

**Resource Limitations:**

- Professional photography needs sourcing
- Content writing requires business input
- Legal templates need GDPR/CCPA customization
- LangGraph agent development requires LLM expertise

**Scale Constraints:**

- Reference implementation is one website demonstrating generation capability
- Future scale to 10,000+ websites depends on this foundation
- Component library must be extensible for future hotel types
- Infrastructure must support autonomous generation workflow

### Dependencies & External Factors

**Third-Party Services:**

- Effective Tours API availability and reliability
- Directus CMS performance and uptime
- CloudFlare services for hosting and CDN
- DeepL API for translations
- OpenRouter API for LLM access
- LangFuse for observability and cost tracking
- BackBlaze B2 for storage

**Content Dependencies:**

- Professional hotel photography acquisition
- Room descriptions and amenity details (Directus CMS)
- Testimonial gathering and verification (Directus CMS)
- Legal page customization and review
- Translation quality validation

**Generation Platform Dependencies:**

- Component manifest completeness
- LangGraph agent development and testing
- LangFuse integration and cost monitoring
- Responsive design pattern documentation
- Backend integration pattern validation

### Risk Mitigation Strategies

**Technical Risks:**

- Implement fallback strategies for API failures
- Continuous performance monitoring and optimization
- Comprehensive testing across devices and breakpoints
- Image optimization and responsive variant strategy
- LangGraph error recovery and retry mechanisms
- Cost monitor emergency stops

**Business Risks:**

- Thorough Effective Tours integration testing
- Regular content updates and validation
- User feedback collection and iteration
- Competitive analysis and feature updates
- Generation workflow validation before scale

**Generation Platform Risks:**

- Component manifest validation and version control
- LLM model fallback strategies (Kimi K2 → Claude 3 Haiku)
- Cost tracking accuracy with LangFuse
- Quality validation for generated sites
- Responsive design pattern documentation

## Success Criteria

### Definition of Done for Each Feature

**Core Website Completion:**

- All pages implemented with responsive variants
- All 20+ components functional with variants
- Backend integrations tested (Directus CMS, Effective Tours API)
- Responsive design working at all breakpoints (375px, 768px, 1280px)
- Core Web Vitals compliance achieved
- Accessibility (WCAG 2.1 AA) validated
- Multi-language support functional with translations

**Component Library Completion:**

- Component manifest complete with metadata
- All 4 tiers documented (Primitives, Blocks, Sections, Pages)
- Responsive strategies specified per component
- Variant specifications documented
- Backend integration patterns validated
- Props schemas defined with TypeScript
- Tests passing for all components

**LLM Generation System Completion:**

- All 6 LangGraph agents implemented and tested
- LangFuse integration functional with cost tracking
- OpenRouter integration with Kimi K2 model
- Cost monitoring with emergency stops at $4.90
- Generation workflow completes in <60 minutes
- Quality validation achieves >90 Lighthouse score
- Component selection logic functional

**Testing Completion:**

- 80%+ statement coverage, 70%+ branch coverage
- All critical paths tested (booking, generation workflow)
- Responsive design tests passing at breakpoints
- LangGraph agent tests using prototype mocking
- Cost monitor tests with proper reset in beforeEach
- Performance tests (Lighthouse CI) passing
- Accessibility tests (axe-core) passing

### Quality Gates and Review Criteria

**Performance Quality Gates:**

- Lighthouse score >90 (>85 mobile, >95 desktop)
- Core Web Vitals within target ranges
- Bundle size limits met (<150KB mobile, <250KB desktop)
- Page load times under thresholds (<1.5s FCP, <3s TTI)
- Image optimization working (.webp, .m.webp)

**Component Quality Gates:**

- All components pass accessibility tests
- Responsive variants work at breakpoints
- Backend integrations functional
- Props validation with Zod schemas
- Documentation complete in manifest

**Generation System Quality Gates:**

- LangFuse tracking 100% of LLM calls
- Cost per generation <$2.00 (target <$0.50)
- Generation success rate >95%
- Quality validation scores >90 average
- Emergency stops functional at $4.90

**User Experience Quality Gates:**

- Mobile usability score 98+
- Accessibility compliance verified (WCAG 2.1 AA)
- Responsive design working across devices
- Touch interactions optimized (44px+ targets)
- Cross-browser compatibility confirmed

### Launch Readiness Checklist

**Technical Readiness:**

- [ ] All functionality tested across devices and browsers
- [ ] Performance optimization completed (Core Web Vitals)
- [ ] Security audit and compliance verification (GDPR/CCPA)
- [ ] Error handling and edge cases covered
- [ ] Monitoring configured (LangFuse, CloudFlare, optional Sentry)
- [ ] Component manifest complete and validated
- [ ] LangGraph workflow tested with cost monitoring
- [ ] Responsive design validated at breakpoints
- [ ] Backend integrations tested (Directus, Effective Tours, BackBlaze, DeepL)

**Content Readiness:**

- [ ] Professional photography uploaded and optimized
- [ ] Room descriptions and amenities detailed (Directus CMS)
- [ ] Testimonials verified (Directus CMS)
- [ ] Legal pages customized and reviewed
- [ ] SEO meta tags and structured data implemented
- [ ] Translations generated and stored on BackBlaze B2
- [ ] Component manifest documentation complete

**Generation System Readiness:**

- [ ] All 6 LangGraph agents functional
- [ ] LangFuse cost tracking verified
- [ ] OpenRouter integration tested
- [ ] Cost monitoring with emergency stops validated
- [ ] Generation workflow end-to-end test passed
- [ ] Component selection logic validated
- [ ] Quality validation functional
- [ ] Responsive design pattern documentation complete

**Business Readiness:**

- [ ] Booking conversion tracking verified
- [ ] Corporate inquiry forms tested
- [ ] Analytics and goals configured
- [ ] Stakeholder approval obtained
- [ ] Post-launch support plan defined
- [ ] Reference implementation validated for generation platform

### User Acceptance Testing Requirements

**Functional Testing:**

- Booking flow from selection to Effective Tours redirect
- Room browsing, filtering, and comparison
- Contact form submission and confirmation
- Mobile responsiveness and touch interactions
- Content loading from Directus CMS
- Multi-language functionality
- Component variant switching (BookingWidget, Navigation, HeroSection)

**Generation System Testing:**

- Complete LangGraph workflow execution
- Cost tracking accuracy with LangFuse
- Component selection from manifest
- Responsive design strategy application
- Quality validation metrics
- Emergency stop mechanism
- Generation time under 60 minutes

**Performance Testing:**

- Core Web Vitals measurement across devices
- Lighthouse audit completion (>90 score)
- Load testing for projected traffic
- Responsive image variant loading (.webp, .m.webp)
- API response times (Directus CMS, Effective Tours)

**Compliance Testing:**

- GDPR/CCPA consent flow verification
- Accessibility testing with screen readers (WCAG 2.1 AA)
- Security headers and HTTPS enforcement
- Legal page functionality and linking
- Directus CMS data security verification

## Risk Assessment & Mitigation

### Technical Risks

**Third-Party API Dependencies**

- **Risk:** Effective Tours API downtime or rate limiting
- **Impact:** High - booking functionality unavailable
- **Mitigation:** Fallback messaging, cached availability, retry with exponential backoff

**LLM Model Availability**

- **Risk:** Kimi K2 model unavailable or cost increase
- **Impact:** High - affects generation cost and timeline
- **Mitigation:** Model fallback (Claude 3 Haiku, GPT-4o-mini), cost monitoring, budget alerts

**Performance Optimization Challenges**

- **Risk:** Core Web Vitals targets not achievable
- **Impact:** Medium - affects UX and SEO
- **Mitigation:** Continuous monitoring, image optimization (.webp, .m.webp), bundle analysis, lazy loading

**Responsive Design Complexity**

- **Risk:** Inconsistent behavior across breakpoints
- **Impact:** Medium - affects mobile users and generation quality
- **Mitigation:** Comprehensive testing at 375px, 768px, 1280px, separate variant strategy documented

**LangGraph Workflow Failures**

- **Risk:** Agent failures or state management issues
- **Impact:** High - affects generation success rate
- **Mitigation:** Error recovery, retry logic, timeout protection, comprehensive testing

### Business Risks

**Booking Flow Disruptions**

- **Risk:** Integration issues with Effective Tours
- **Impact:** Critical - affects primary business objective
- **Mitigation:** Thorough integration testing, monitoring, backup communication

**Content Quality and Accuracy**

- **Risk:** Outdated or inaccurate hotel information
- **Impact:** Medium - affects user trust
- **Mitigation:** Regular content reviews via Directus CMS, automated validation, user feedback

**Generation Cost Overruns**

- **Risk:** Actual generation cost exceeds $2 budget
- **Impact:** High - affects platform economics
- **Mitigation:** Real-time cost monitoring with LangFuse, emergency stops at $4.90, model fallback

**Component Reusability Issues**

- **Risk:** Components don't work across all hotel types
- **Impact:** High - limits generation flexibility
- **Mitigation:** Comprehensive variant testing, manifest validation, hotel type testing

### Operational Risks

**Post-Launch Support Limitations**

- **Risk:** Insufficient resources for maintenance
- **Impact:** Medium - affects long-term success
- **Mitigation:** Clear support plan, automated monitoring, documentation

**Security and Compliance Maintenance**

- **Risk:** Security vulnerabilities or compliance issues
- **Impact:** High - legal and reputational consequences
- **Mitigation:** Regular security audits, compliance monitoring (GDPR/CCPA), update processes

**Scale Readiness**

- **Risk:** Infrastructure can't support 10,000+ website generation
- **Impact:** High - affects platform viability
- **Mitigation:** Performance testing, CloudFlare scalability, BackBlaze storage validation

### Monitoring and Response Procedures

**Performance Monitoring:**

- Real-time Core Web Vitals tracking
- Automated alerting for performance degradation
- Weekly performance reports and optimization recommendations
- Lighthouse CI on each build

**Generation System Monitoring:**

- LangFuse real-time cost tracking
- Generation success rate monitoring (>95% target)
- Workflow failure detection and alerting
- Emergency stop activation tracking

**Error Monitoring:**

- Automated error tracking with Sentry (optional)
- User error reporting mechanisms
- Rapid response for critical issues
- LangGraph workflow error logging

**Business Metrics Monitoring:**

- Booking conversion rate tracking
- Corporate lead generation monitoring
- User engagement analytics
- Generation cost per site tracking

## Success Metrics & KPIs

### Primary Business Metrics

**Booking Conversion Rate**

- **Target:** 3% conversion from site visit to Effective Tours booking
- **Measurement:** Google Analytics with Enhanced Ecommerce
- **Frequency:** Daily monitoring, weekly analysis
- **Success Threshold:** >3% within 30 days of launch

**Corporate Lead Generation**

- **Target:** 10 qualified business inquiries monthly
- **Measurement:** Contact form submissions with qualification
- **Frequency:** Weekly monitoring, monthly analysis
- **Success Threshold:** >10 qualified leads in first month

**Reference Implementation Validation**

- **Target:** 100% of generation-enabling features implemented
- **Measurement:** Component manifest completeness, responsive design validation, LangGraph functionality
- **Frequency:** Continuous during development
- **Success Threshold:** All features implemented and tested

### Generation System Metrics

**Cost per Generation**

- **Target:** <$2.00 per website (actual ~$0.10 with Kimi K2)
- **Measurement:** LangFuse cost tracking per generation
- **Frequency:** Real-time per generation
- **Success Threshold:** Average cost <$0.50

**Generation Success Rate**

- **Target:** >95% successful generations without manual intervention
- **Measurement:** LangGraph workflow completion rate
- **Frequency:** Per generation, weekly analysis
- **Success Threshold:** >95% success rate

**Generation Time**

- **Target:** <60 minutes per complete website
- **Measurement:** Workflow start to completion time
- **Frequency:** Per generation
- **Success Threshold:** Average <45 minutes

**Quality Score**

- **Target:** >90 average Lighthouse score for generated sites
- **Measurement:** Automated Lighthouse testing
- **Frequency:** Per generation validation
- **Success Threshold:** >90% of sites achieve >90 score

### User Experience Metrics

**Page Load Performance**

- **Target:** Core Web Vitals compliance (LCP <2.5s, FID <100ms, CLS <0.1)
- **Measurement:** Google PageSpeed Insights, Web Vitals library
- **Frequency:** Real-time monitoring, weekly reports
- **Success Threshold:** >90 Lighthouse score maintained

**Mobile Usability**

- **Target:** 98+ mobile usability score
- **Measurement:** Google Search Console, device testing
- **Frequency:** Bi-weekly testing, monthly analysis
- **Success Threshold:** Consistent 98+ score

**Responsive Quality**

- **Target:** All components work correctly at breakpoints
- **Measurement:** Automated testing at 375px, 768px, 1280px
- **Frequency:** Every build via CI/CD
- **Success Threshold:** 100% component tests passing

**User Engagement**

- **Target:** Average session duration >2 minutes, bounce rate <40%
- **Measurement:** Google Analytics behavior reports
- **Frequency:** Weekly monitoring, monthly deep-dive
- **Success Threshold:** Engagement metrics meeting targets

### Technical Metrics

**Website Availability**

- **Target:** 99.5%+ uptime
- **Measurement:** CloudFlare Analytics, uptime monitoring
- **Frequency:** Real-time monitoring, monthly reports
- **Success Threshold:** <0.5% downtime monthly

**API Performance**

- **Target:** <1% error rate for third-party integrations
- **Measurement:** API monitoring, error tracking
- **Frequency:** Real-time monitoring, weekly analysis
- **Success Threshold:** Consistent API reliability for Directus, Effective Tours, BackBlaze, DeepL

**Component Quality**

- **Target:** All 20+ components pass quality gates
- **Measurement:** Automated testing, accessibility validation
- **Frequency:** Every build
- **Success Threshold:** 100% components passing tests

**LangFuse Observability**

- **Target:** 100% of LLM calls tracked with traces
- **Measurement:** LangFuse trace coverage
- **Frequency:** Real-time per generation
- **Success Threshold:** No missing traces

### Analytics & Reporting Structure

**Daily Reports:**

- Website traffic and user engagement
- Booking conversion funnels
- Error rates and performance issues
- Form submissions and lead generation
- Generation attempts (if applicable)

**Weekly Reports:**

- Performance trends and optimization opportunities
- User behavior analysis and insights
- Component usage patterns
- Generation system performance (if applicable)
- Cost tracking analysis

**Monthly Reports:**

- Business objective progress against targets
- ROI analysis and revenue impact
- User satisfaction and feedback summary
- Generation economics analysis (cost per site)
- Strategic recommendations for improvements

**Quarterly Reviews:**

- Overall business performance assessment
- Market position and competitive analysis
- Technology stack and performance optimization
- Strategic planning for feature enhancements
- Generation platform readiness for scale

---

## Conclusion

This PRD provides a comprehensive foundation for developing The Sterling Executive hotel website as a **reference implementation** for an LLM-driven generation platform capable of producing 10,000+ unique hotel websites at ~$2 per site.

### Dual Purpose Achievement

**As a Hotel Website:**
- Premium business + boutique hybrid targeting corporate executives
- 3% booking conversion rate through optimized UX and Effective Tours integration
- 10+ qualified corporate inquiries monthly
- Core Web Vitals compliance and exceptional performance

**As a Reference Implementation:**
- Complete 4-tier component architecture (20+ components)
- Responsive design framework with mobile/desktop variants
- LangGraph multi-agent workflow with 6 specialized agents
- LangFuse cost tracking and budget enforcement (<$2 per generation)
- Component manifest system for LLM agent selection
- Comprehensive testing infrastructure for generation validation

### Critical Success Factors

1. **Component Library Completeness:** All 20+ components implemented with variants, responsive specifications, and formal ZOD contracts
2. **Responsive Design Framework:** Clear patterns for separate variants vs responsive utilities, validated at breakpoints
3. **LangGraph Workflow:** 6 agents functional with cost monitoring, emergency stops, and >95% success rate
4. **Backend Integration:** Directus CMS, Effective Tours API, BackBlaze B2, DeepL API all functional
5. **Testing Infrastructure:** Prototype mocking for agents, cost monitor reset patterns, LLM composition testing, comprehensive coverage
6. **Documentation Quality:** Component registry, responsive strategies, backend patterns, contract schemas all documented for LLM learning
7. **Contract Validation:** Progressive enforcement working with warning → strict mode transitions
8. **Generation Reliability:** >98% success rate with contract validation vs >95% without

### Timeline and Execution with Contract Implementation

The 2-week development timeline demands focused execution while maintaining reference implementation quality. Features that may seem over-engineered for one website are **essential** for enabling LLM-driven generation at scale.

**Cost-Benefit Analysis of Upfront Contracts:**
- **Cost:** ~1 additional week development time for contract implementation
- **Benefit:** 50% reduction in generation failures and debugging time
- **Benefit:** Enables safe scaling to 10,000+ websites without manual intervention
- **Benefit:** Eliminates need for costly refactoring in future epics
- **ROI:** 10x return through reduced maintenance and generation reliability

**Contract Implementation Schedule:**
- **Week 1:** Component registry + basic ZOD contracts + warning mode
- **Week 2:** Strict mode enforcement + comprehensive testing + launch

### Path to Scale

This reference implementation establishes the foundation for:
- **10,000+ unique multi-page websites** generated autonomously
- **$0.10-$0.50 actual cost** per generation (vs $2.00 budget), multi-page expansion adds $0 LLM cost
- **<60 minutes** generation time per complete multi-page site
- **>95% success rate** without manual intervention
- **>90 Lighthouse score** average quality maintained

Regular monitoring, LangFuse observability, and iterative improvements will validate the generation platform's viability while delivering a premium hotel website for Sterling Executive.

**Document Status:** Ready for Development
**Next Steps:** Architecture review, component library development, LangGraph agent implementation, comprehensive testing

---

**References:**
- Component Specifications: `/docs/03-component-system/component-library.md`
- LLM Orchestration: `/docs/04-llm-orchestration/llm-integration.md`
- Technical Architecture: `/docs/02-architecture/technical-architecture.md`
- Project Vision: `/docs/01-vision/project-brief.md`
