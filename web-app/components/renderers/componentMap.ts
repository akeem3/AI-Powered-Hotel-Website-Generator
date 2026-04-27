/**
 * Component Map - Shared Component Mapping
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.01
 *
 * Why: Exports COMPONENT_MAP without 'use client' directive, allowing
 * Server Components (like /preview) to access component mappings.
 *
 * This file is intentionally NOT a client component. It only exports
 * a mapping object, which can be used in both Server and Client contexts.
 *
 * The ComponentRenderer still uses 'use client' for its rendering logic,
 * but the map itself is shared here.
 *
 * @example
 * ```tsx
 * import { COMPONENT_MAP, type ComponentType } from '@/components/renderers/componentMap';
 *
 * const Component = COMPONENT_MAP['hero']; // Returns HeroSection component
 * ```
 */

// Component imports
import Navigation from '@/components/blocks/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import RoomsGrid from '@/components/sections/RoomsGrid';
import ImageGallery from '@/components/blocks/ImageGallery';
import { Testimonials } from '@/components/blocks/Testimonials';
import { Amenities } from '@/components/blocks/Amenities';
import BookingWidget from '@/components/blocks/BookingWidget';
import ContactForm from '@/components/sections/ContactForm';

// Story 19.1: Footer Block (3 variants)
import Footer from '@/components/blocks/Footer';
// Story 19.2: About / Hotel Story Block (3 variants)
import About from '@/components/sections/About';
// Story 19.3: FAQ Block (2 variants)
import FAQ from '@/components/sections/FAQ';
// Story 19.4: Features / USP Block (2 variants)
import Features from '@/components/sections/Features';
// Issue #4: LinkButton for "View More" buttons in teaser sections
import LinkButton from '@/components/blocks/LinkButton';

/**
 * Type for all renderable components
 * Story 19.5: Extended to 12 components with 4 new blocks (Footer, About, FAQ, Features)
 * Issue #4: Added linkButton for "View More" buttons in teaser sections
 */
export type ComponentType =
  | 'navigation'
  | 'hero'
  | 'rooms'
  | 'gallery'
  | 'amenities'
  | 'testimonials'
  | 'booking'
  | 'contact'
  | 'footer'     // Story 19.1
  | 'about'      // Story 19.2
  | 'faq'        // Story 19.3
  | 'features'   // Story 19.4
  | 'linkButton'; // Issue #4

/**
 * React component type for component mapping
 */
type ReactComponentType = React.ComponentType<any>;

/**
 * Component type to React component mapping
 *
 * Maps the string type from HomepageConfig to the actual React component.
 * This export can be used in both Server and Client Components.
 * Story 19.5: Extended to 12 components with 4 new blocks.
 * Issue #4: Added linkButton for "View More" buttons in teaser sections.
 */
export const COMPONENT_MAP: Record<ComponentType, ReactComponentType> = {
  navigation: Navigation,
  hero: HeroSection,
  rooms: RoomsGrid,
  gallery: ImageGallery,
  amenities: Amenities,
  testimonials: Testimonials,
  booking: BookingWidget,
  contact: ContactForm,
  // Story 19.1: Footer Block
  footer: Footer,
  // Story 19.2: About / Hotel Story Block
  about: About,
  // Story 19.3: FAQ Block
  faq: FAQ,
  // Story 19.4: Features / USP Block
  features: Features,
  // Issue #4: LinkButton for "View More" buttons
  linkButton: LinkButton,
} as const;
