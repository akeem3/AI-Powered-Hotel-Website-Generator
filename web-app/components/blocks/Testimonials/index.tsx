/**
 * Testimonials Server Component
 *
 * Displays customer testimonials in various layouts (grid, carousel, featured).
 * This is a Server Component that receives all data as props.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * All data fetching happens server-side via parent components.
 *
 * Layouts:
 * - grid: Server Component (TestimonialGrid) - static grid display
 * - carousel: Client Component (TestimonialCarousel) - interactive carousel
 * - featured: Client Component (TestimonialFeatured) - featured display
 *
 * @module components/blocks/Testimonials
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { TestimonialsContract, type TestimonialsConfig } from '@/lib/contracts/testimonials.contract';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';
import { cn } from '@/lib/utils/utils';

import TestimonialCarousel from './TestimonialCarousel';
import TestimonialFeatured from './TestimonialFeatured';
import TestimonialGrid from './TestimonialGrid';

/**
 * Extended props for Testimonials component
 *
 * Extends the base TestimonialsConfig with optional heading/subheading overrides.
 */
export interface TestimonialsProps extends TestimonialsConfig {
  /** Section heading override (optional) */
  heading?: string;
  /** Section subheading override (optional) */
  subheading?: string;
}

/**
 * Testimonials Server Component
 *
 * Renders the testimonials section with all data provided as props.
 * No client-side data fetching - data comes from parent Server Component.
 *
 * Data Flow:
 * 1. Parent Server Component (page.tsx) fetches data via getHotelPageData()
 * 2. Data is passed as props to Testimonials
 * 3. Testimonials routes to appropriate layout component:
 *    - grid → Server Component (static display)
 *    - carousel → Client Component (interactive carousel)
 *    - featured → Client Component (featured display)
 *
 * @component
 * @example
 * ```tsx
 * // Server Component usage
 * <Testimonials
 *   testimonials={reviews}
 *   variant={{ layout: 'grid', columns: 3 }}
 *   heading="Guest Reviews"
 *   subheading="What our guests say about us"
 * />
 * ```
 */
export function Testimonials(rawProps: TestimonialsProps) {
  // Validate props against contract
  // Note: We extract heading/subheading before validation since they're not in the contract
  const { heading: headingProp, subheading: subheadingProp, ...baseProps } = rawProps;
  const props = validateInDev(TestimonialsContract, baseProps, 'Testimonials');

  const { testimonials, variant, showDate = false, showLocation = false, className } = props;
  const { layout = 'grid', columns = 3, cardStyle = 'default' } = variant || {};

  // Resolve heading with fallback chain (props > default)
  const resolvedHeading = headingProp ?? CONTENT_DEFAULTS.testimonials.heading;

  // Resolve subheading with fallback chain (props > default)
  const resolvedSubheading = subheadingProp ?? CONTENT_DEFAULTS.testimonials.subheading;

  // Return null if no testimonials provided
  if (!testimonials?.length) {
    return null;
  }

  const renderLayout = () => {
    switch (layout) {
      case 'carousel':
        return (
          <TestimonialCarousel
            testimonials={testimonials.slice(0, 5)}
            cardStyle={cardStyle}
            className="w-full"
          />
        );
      case 'featured':
        return (
          <TestimonialFeatured
            testimonials={testimonials}
            showDate={showDate}
            showLocation={showLocation}
            cardStyle={cardStyle}
            className="mx-auto max-w-5xl"
          />
        );
      case 'grid':
      default:
        return (
          <TestimonialGrid
            testimonials={testimonials}
            columns={columns}
            showDate={showDate}
            showLocation={showLocation}
            cardStyle={cardStyle}
          />
        );
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Section Header with Premium Styling - matching Gallery/Rooms pattern */}
      <div className="text-center mb-gap-card md:mb-gap-card">
        {/* Gold Accent Bar */}
        <div className="flex items-center justify-center mb-gap-card">
          <div className="h-divider w-divider-sm bg-brand-secondary"></div>
          <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
          <div className="h-divider w-divider-sm bg-brand-secondary"></div>
        </div>

        {/* Main Heading */}
        <h2 className="mb-gap-card font-display text-size-h2 text-brand-primary">
          {resolvedHeading}
        </h2>

        {/* Gold Underline Accent */}
        <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

        {/* Description */}
        <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
          {resolvedSubheading}
        </p>
      </div>

      {renderLayout()}
    </div>
  );
}

export default Testimonials;
