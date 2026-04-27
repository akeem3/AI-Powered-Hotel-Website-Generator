/**
 * SectionRenderer - Intelligent Section Wrapping Component
 *
 * @trace epic: EPIC-16, EPIC-18
 * @trace story: STORY-16.02, STORY-18.5
 * @trace reqs: Section wrapping for preview page, Configurable wrapper styles
 *
 * Why: ComponentRenderer outputs raw components without section wrappers,
 * causing components to appear "in a mess" on the preview page. This component
 * intelligently adds section wrappers only to components that need them.
 *
 * Story 18.5 Evolution: Now supports configurable wrapper styles (accent, simple,
 * numbered, none) via optional wrapper field in ComponentConfig. This enables
 * per-component wrapper configuration for different hotel types while maintaining
 * backward compatibility with existing configs.
 *
 * Component Self-Containment Analysis:
 *
 * | Component | Self-Contained | Wrapper Needed | Wrapper Type |
 * |-----------|----------------|----------------|--------------|
 * | hero | ✅ Yes | ❌ No | Has own <section> with full styling |
 * | navigation | ✅ Yes | ❌ No | Has <nav> tag (but may need fixed positioning) |
 * | rooms | ⚠️ Partial | ✅ Yes | Has <section> with container, but only sr-only heading |
 * | gallery | ❌ No | ✅ Yes | Only <div>, needs full wrapper (section + container + header) |
 * | testimonials | ⚠️ Partial | ✅ Yes | Has gold accent header, but no <section>/container/padding |
 * | amenities | ✅ Yes | ❌ No | Fully self-contained (section + container + gold accent header) |
 * | booking | ❌ No | ✅ Yes | Only <div>, needs full wrapper (section + container + header) |
 * | contact | ✅ Yes | ❌ No | Has <section> with internal styling and heading |
 *
 * IMPORTANT: Does NOT modify gold accent patterns in Amenities/Testimonials.
 * Those components retain their internal gold accent headers unchanged.
 *
 * @example
 * ```tsx
 * <SectionRenderer
 *   config={{
 *     type: "gallery",
 *     variant: { layout: 'masonry', columns: 3 },
 *     props: { images: [...] },
 *     order: 2,
 *     wrapper: { style: 'accent', title: 'Explore Our Hotel' }
 *   }}
 *   Component={ImageGallery}
 * />
 * ```
 */

import type { ReactElement, ComponentType } from 'react';

// Component imports for type checking
import HeroSection from '@/components/sections/HeroSection';
import Navigation from '@/components/blocks/Navigation';
import RoomsGrid from '@/components/sections/RoomsGrid';
import ImageGallery from '@/components/blocks/ImageGallery';
import { Testimonials } from '@/components/blocks/Testimonials';
import { Amenities } from '@/components/blocks/Amenities';
import BookingWidget from '@/components/blocks/BookingWidget';
import ContactForm from '@/components/sections/ContactForm';

// Story 18.5: Import section wrapper contract type
import type { SectionWrapperConfig } from '@/lib/contracts/section-wrapper.contract';

/**
 * Type for all renderable components
 */
type SectionComponentType =
  | 'hero'
  | 'navigation'
  | 'rooms'
  | 'gallery'
  | 'testimonials'
  | 'amenities'
  | 'booking'
  | 'contact';

/**
 * Props for a single component to render
 *
 * Story 18.5: Added optional `wrapper` field for configurable section wrapper styles.
 * This enables per-component wrapper configuration via HomepageConfig.
 */
export interface ComponentConfig {
  /** Component type */
  type: SectionComponentType | string;
  /** Variant configuration */
  variant?: Record<string, string | number | boolean> | Record<string, unknown>;
  /** Component props */
  props: Record<string, unknown>;
  /** Order for sorting */
  order: number;
  /** Story 18.5: Optional section wrapper configuration */
  wrapper?: SectionWrapperConfig;
}

/**
 * Props for SectionRenderer
 *
 * Story 18.5: ComponentConfig now includes optional wrapper field.
 */
export interface SectionRendererProps {
  /** Component configuration to render */
  config: ComponentConfig;
  /** The React component to render */
  Component: ComponentType<any>;
}

/**
 * Components that are FULLY self-contained (no wrapper needed)
 *
 * These components have their own <section> tags, proper containers,
 * padding, and headers. They render correctly without any wrapper.
 */
const SELF_CONTAINED_COMPONENTS: Set<SectionComponentType> = new Set([
  'hero',
  'navigation',
  'amenities',
  'contact',
]);

/**
 * Components that have SECTION but need HEADER wrapper
 *
 * These components have <section> tags with containers, but only
 * sr-only headings. They need the gold accent header wrapper.
 */
const NEEDS_HEADER_WRAPPER: Set<SectionComponentType> = new Set(['rooms']);

/**
 * Components that need FULL wrapper
 *
 * These components have NO section tag, NO container, NO padding.
 * They need complete wrapper with section, container, and gold accent header.
 */
const NEEDS_FULL_WRAPPER: Set<SectionComponentType> = new Set([
  'gallery',
  'testimonials',
  'booking',
]);

/**
 * Generates the gold accent header JSX
 *
 * This is the standard header pattern used throughout app/page.tsx.
 * Note: We use this for components that NEED the header, but we do NOT
 * modify the gold accent patterns inside components that already have them
 * (like Amenities and Testimonials - those keep their internal headers).
 *
 * Story 18.5: Used when wrapper.style === 'accent'
 *
 * @param title - Section heading
 * @param description - Section description (optional)
 */
function GoldAccentHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}): ReactElement {
  return (
    <div className="text-center mb-gap-section">
      {/* Gold Accent Bar */}
      <div className="flex items-center justify-center mb-gap-card">
        <div className="h-divider w-divider-sm bg-brand-secondary"></div>
        <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
        <div className="h-divider w-divider-sm bg-brand-secondary"></div>
      </div>

      {/* Main Heading */}
      <h2 className="text-size-h2 font-display text-brand-primary mb-gap-card">{title}</h2>

      {/* Gold Underline Accent */}
      <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

      {/* Description */}
      {description && (
        <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * Story 18.5: Simple Header Component
 *
 * Plain heading with optional subheading, no decorative elements.
 * Used for minimalist or budget-friendly hotel designs.
 *
 * Semantic tokens only:
 * - text-size-h2: Display heading size
 * - font-display: Display font family
 * - text-brand-primary: Primary brand color
 * - text-text-secondary: Secondary text color
 *
 * @param title - Section heading
 * @param description - Section description/subheading (optional)
 */
function SimpleHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}): ReactElement {
  return (
    <div className="mb-gap-section">
      {/* Plain heading - no decorative elements */}
      <h2 className="text-size-h2 font-display text-brand-primary mb-gap-card">{title}</h2>

      {/* Optional description */}
      {description && <p className="text-size-body text-text-secondary max-w-3xl">{description}</p>}
    </div>
  );
}

/**
 * Story 18.5: Numbered Header Component
 *
 * Numbered badge (01, 02, 03) alongside heading for progressive sections.
 * Used for business hotels or structured layouts.
 *
 * The sectionIndex is passed from the parent to determine the number.
 * Numbers are zero-indexed and formatted as two digits (01, 02, etc.).
 *
 * Semantic tokens only:
 * - text-size-h2: Display heading size
 * - font-display: Display font family
 * - text-brand-primary: Primary brand color
 * - text-brand-secondary: Secondary brand color (gold accent for badge)
 * - bg-brand-secondary/wash: Background wash for badge
 *
 * @param title - Section heading
 * @param description - Section description/subheading (optional)
 * @param sectionIndex - Sequential index of this section (0-based)
 */
function NumberedHeader({
  title,
  description,
  sectionIndex,
}: {
  title: string;
  description?: string;
  sectionIndex: number;
}): ReactElement {
  // Format as two-digit number (01, 02, 03, etc.)
  const displayNumber = String(sectionIndex + 1).padStart(2, '0');

  return (
    <div className="mb-gap-section">
      {/* Numbered badge with heading */}
      <div className="flex items-center gap-gap-card mb-gap-card">
        {/* Numbered Badge */}
        <div className="shrink-0">
          <span className="text-size-heading font-display text-brand-secondary bg-brand-secondary/wash px-3 py-1 rounded-md">
            {displayNumber}
          </span>
        </div>

        {/* Main Heading */}
        <h2 className="text-size-h2 font-display text-brand-primary">{title}</h2>
      </div>

      {/* Optional description */}
      {description && (
        <p className="text-size-body text-text-secondary max-w-3xl ml-16">{description}</p>
      )}
    </div>
  );
}

/**
 * Story 18.5: Helper function to render content based on wrapper style
 *
 * @param wrapper - The wrapper configuration
 * @param title - Default title to use if not provided in wrapper
 * @param description - Default description to use if not provided in wrapper
 * @param children - The component content to wrap
 * @param sectionIndex - The sequential index for numbered headers (optional)
 */
function renderWithWrapperStyle(
  wrapper: SectionWrapperConfig,
  title: string,
  description: string | undefined,
  children: ReactElement,
  sectionIndex?: number,
): ReactElement {
  const wrapperTitle = wrapper.title || title;
  const wrapperDescription = wrapper.description || description;

  switch (wrapper.style) {
    case 'accent':
      return (
        <>
          <GoldAccentHeader title={wrapperTitle} description={wrapperDescription} />
          {children}
        </>
      );

    case 'simple':
      return (
        <>
          <SimpleHeader title={wrapperTitle} description={wrapperDescription} />
          {children}
        </>
      );

    case 'numbered':
      return (
        <>
          <NumberedHeader
            title={wrapperTitle}
            description={wrapperDescription}
            sectionIndex={sectionIndex ?? 0}
          />
          {children}
        </>
      );

    case 'none':
      // No wrapper - render children directly
      return children;

    default:
      // Fallback to accent if somehow an invalid style gets through validation
      return (
        <>
          <GoldAccentHeader title={wrapperTitle} description={wrapperDescription} />
          {children}
        </>
      );
  }
}

/**
 * Section Renderer Component
 *
 * Story 18.5 Evolution:
 * - If config.wrapper is provided, uses configurable wrapper styles (accent, simple, numbered, none)
 * - If config.wrapper is NOT provided, maintains backward compatibility with existing behavior
 *
 * Intelligently wraps components based on their self-containment and optional wrapper config.
 * Components that are fully self-contained render directly.
 * Components that need wrappers get appropriate section wrapping based on config.
 */
export default function SectionRenderer({ config, Component }: SectionRendererProps): ReactElement {
  const { type, variant, props, wrapper } = config;
  const typeString = String(type);

  // ==========================================================================
  // Story 18.5: NEW WRAPPER LOGIC
  // If wrapper config is provided, branch on wrapper.style
  // ==========================================================================
  if (wrapper) {
    // For self-contained components, wrapper.style === 'none' renders directly
    // Other wrapper styles override self-containment and wrap the component
    if (SELF_CONTAINED_COMPONENTS.has(typeString as SectionComponentType)) {
      if (wrapper.style === 'none') {
        return <Component variant={variant} {...props} />;
      }
      // Even self-contained components can be wrapped if explicitly configured
      return (
        <section className="w-full max-w-screen-xl mx-auto p-container py-section">
          {renderWithWrapperStyle(
            wrapper,
            String(type).charAt(0).toUpperCase() + String(type).slice(1), // Capitalized type as default title
            undefined,
            <Component variant={variant} {...props} />,
          )}
        </section>
      );
    }

    // =========================================================================
    // NON-SELF-CONTAINED COMPONENTS WITH WRAPPER CONFIG
    // =========================================================================

    // GALLERY component with wrapper config
    if (typeString === 'gallery') {
      return (
        <section className="w-full bg-liner-to-b from-surface-primary via-surface-secondary to-surface-primary py-section">
          <div className="max-w-screen-xl mx-auto p-container">
            {renderWithWrapperStyle(
              wrapper,
              'Explore Our Hotel',
              'Discover our luxurious facilities, elegant rooms, and premium amenities',
              <Component variant={variant} {...props} />,
            )}
          </div>
        </section>
      );
    }

    // ROOMS component with wrapper config
    if (typeString === 'rooms') {
      // Transform variant object to string for RoomsGrid
      const roomsVariant =
        typeof variant === 'object' && variant !== null && 'roomCardStyle' in variant
          ? (variant as { roomCardStyle?: string }).roomCardStyle
          : variant;

      return (
        <section className="w-full max-w-screen-xl mx-auto p-container py-section">
          {renderWithWrapperStyle(
            wrapper,
            'Luxurious Accommodations',
            'Experience the perfect blend of comfort and elegance in our thoughtfully designed rooms',
            <Component variant={roomsVariant} {...props} />,
          )}
        </section>
      );
    }

    // TESTIMONIALS component with wrapper config
    // Note: Testimonials has its own internal gold accent header
    // We only add section wrapper, do not duplicate header
    if (typeString === 'testimonials') {
      return (
        <section className="w-full bg-liner-to-b from-surface-primary via-surface-secondary to-surface-primary py-section">
          <div className="max-w-screen-xl mx-auto p-container">
            <Component variant={variant} {...props} />
          </div>
        </section>
      );
    }

    // BOOKING component with wrapper config
    if (typeString === 'booking') {
      // Transform variant object to string for BookingWidget
      const bookingVariant =
        typeof variant === 'object' && variant !== null && 'bookingStyle' in variant
          ? (variant as { bookingStyle?: string }).bookingStyle
          : variant;

      return (
        <section className="w-full bg-surface-secondary py-section">
          <div className="max-w-screen-xl mx-auto p-container">
            {renderWithWrapperStyle(
              wrapper,
              'Book Your Stay',
              'Reserve your room today and enjoy our best available rates',
              <Component variant={bookingVariant} {...props} />,
            )}
          </div>
        </section>
      );
    }
  }

  // ==========================================================================
  // BACKWARD COMPATIBILITY: No wrapper field provided
  // Uses the original Epic 16 behavior
  // ==========================================================================

  /**
   * FULLY SELF-CONTAINED components render directly
   * These have their own sections, containers, padding, and headers
   */
  if (SELF_CONTAINED_COMPONENTS.has(typeString as SectionComponentType)) {
    return <Component variant={variant} {...props} />;
  }

  /**
   * GALLERY component - needs FULL wrapper
   * Has NO section, NO container, NO padding, NO header
   */
  if (typeString === 'gallery') {
    return (
      <section className="w-full bg-liner-to-b from-surface-primary via-surface-secondary to-surface-primary py-section">
        <div className="max-w-screen-xl mx-auto p-container">
          <GoldAccentHeader
            title="Explore Our Hotel"
            description="Discover our luxurious facilities, elegant rooms, and premium amenities designed for the discerning traveler"
          />
          <Component variant={variant} {...props} />
        </div>
      </section>
    );
  }

  /**
   * ROOMS component - needs HEADER wrapper only
   * Has <section> with container, but only sr-only heading
   *
   * VARIANT TRANSFORM: HomepageConfigSchema defines variant as an object
   * with roomCardStyle property, but RoomsGrid expects a string.
   * Extract roomCardStyle value and pass it as the variant string.
   */
  if (typeString === 'rooms') {
    // Transform variant object to string for RoomsGrid
    const roomsVariant =
      typeof variant === 'object' && variant !== null && 'roomCardStyle' in variant
        ? (variant as { roomCardStyle?: string }).roomCardStyle
        : variant;

    return (
      <section className="w-full max-w-screen-xl mx-auto p-container py-section">
        <GoldAccentHeader
          title="Luxurious Accommodations"
          description="Experience the perfect blend of comfort and elegance in our thoughtfully designed rooms and suites"
        />
        <Component variant={roomsVariant} {...props} />
      </section>
    );
  }

  /**
   * TESTIMONIALS component - needs SECTION wrapper
   * Has gold accent header internally, but NO section/container/padding
   * We add the section wrapper but do NOT modify its internal header
   */
  if (typeString === 'testimonials') {
    return (
      <section className="w-full bg-liner-to-b from-surface-primary via-surface-secondary to-surface-primary py-section">
        <div className="max-w-screen-xl mx-auto p-container">
          <Component variant={variant} {...props} />
        </div>
      </section>
    );
  }

  /**
   * BOOKING component - needs FULL wrapper
   * Has NO section, NO container, NO padding, NO header
   *
   * VARIANT TRANSFORM: HomepageConfigSchema defines variant as an object
   * with bookingStyle property, but BookingWidget expects a string.
   * Extract bookingStyle value and pass it as the variant string.
   */
  if (typeString === 'booking') {
    // Transform variant object to string for BookingWidget
    const bookingVariant =
      typeof variant === 'object' && variant !== null && 'bookingStyle' in variant
        ? (variant as { bookingStyle?: string }).bookingStyle
        : variant;

    return (
      <section className="w-full bg-surface-secondary py-section">
        <div className="max-w-screen-xl mx-auto p-container">
          <GoldAccentHeader
            title="Book Your Stay"
            description="Reserve your room today and enjoy our best available rates"
          />
          <Component variant={bookingVariant} {...props} />
        </div>
      </section>
    );
  }

  /**
   * FALLBACK - Should never happen with valid component types
   * Render directly if type is somehow not recognized
   */
  return <Component variant={variant} {...props} />;
}
