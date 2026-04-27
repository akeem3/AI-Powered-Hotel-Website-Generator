/**
 * Amenities Server Component
 *
 * Displays hotel amenities in various layouts (grid, list, featured).
 * This is a Server Component that receives all data as props.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * All data fetching happens server-side via parent components.
 *
 * Layouts:
 * - grid: Server Component (AmenitiesGrid) - static grid display
 * - list: Server Component (AmenitiesList) - static list display
 * - featured: Client Component (AmenitiesFeatured) - interactive carousel
 *
 * @module components/blocks/Amenities
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { AmenitiesContract, type AmenitiesConfig } from '@/lib/contracts/amenities.contract';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';
import { cn } from '@/lib/utils/utils';

import AmenitiesFeatured from './AmenitiesFeatured';
import AmenitiesGrid from './AmenitiesGrid';
import AmenitiesList from './AmenitiesList';

/**
 * Extended props for Amenities component
 *
 * Extends the base AmenitiesConfig with optional heading/subheading overrides.
 */
export interface AmenitiesProps extends AmenitiesConfig {
  /** Section heading override (optional) */
  heading?: string;
  /** Section subheading override (optional) */
  subheading?: string;
}

/**
 * Amenities Server Component
 *
 * Renders the amenities section with all data provided as props.
 * No client-side data fetching - data comes from parent Server Component.
 *
 * Data Flow:
 * 1. Parent Server Component (page.tsx) fetches data via getHotelPageData()
 * 2. Data is passed as props to Amenities
 * 3. Amenities routes to appropriate layout component:
 *    - grid/list → Server Components (static display)
 *    - featured → Client Component (interactive carousel)
 *
 * @component
 * @example
 * ```tsx
 * // Server Component usage
 * <Amenities
 *   amenities={facilities}
 *   variant={{ layout: 'grid', columns: 4 }}
 *   heading="Hotel Amenities"
 *   subheading="Everything you need for a comfortable stay"
 * />
 * ```
 */
export function Amenities(rawProps: AmenitiesProps) {
  // Validate props against contract
  // Note: We extract heading/subheading before validation since they're not in the contract
  const { heading: headingProp, subheading: subheadingProp, ...baseProps } = rawProps;
  const props = validateInDev(AmenitiesContract, baseProps, 'Amenities');

  const { amenities, variant, showCategory = false, filterByCategory, className } = props;
  const { layout = 'grid', columns = 4, iconSize = 'medium', iconStyle = 'default', cardStyle = 'default' } = variant || {};

  // Resolve heading with fallback chain (props > default)
  const resolvedHeading = headingProp ?? CONTENT_DEFAULTS.amenities.heading;

  // Resolve subheading with fallback chain (props > default)
  const resolvedSubheading = subheadingProp ?? CONTENT_DEFAULTS.amenities.subheading;

  // Return null if no amenities provided
  if (!amenities?.length) {
    return null;
  }

  // Category filtering logic
  const filteredAmenities = filterByCategory
    ? amenities.filter((a) => a.category === filterByCategory)
    : amenities;

  return (
    <section className={cn('w-full py-section', className)}>
      <div className="mx-auto max-w-7xl p-container">
        {/* Section header matching Testimonials pattern */}
        <div className="text-center mb-gap-card md:mb-gap-card">
          {/* Gold Accent Bar */}
          <div className="flex items-center justify-center mb-gap-card">
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
          </div>

          <h2 className="mb-gap-card font-display text-size-h2 text-brand-primary">
            {resolvedHeading}
          </h2>

          {/* Gold Underline Accent */}
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

          <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
            {resolvedSubheading}
          </p>
        </div>

        {showCategory && (
          <div className="mb-gap-section">
            {/* Category badges/tabs if enabled */}
            {/* TODO: Implement category filter UI when needed */}
          </div>
        )}

        {layout === 'grid' && (
          <AmenitiesGrid
            amenities={filteredAmenities}
            showCategory={showCategory}
            columns={columns}
            iconSize={iconSize}
            iconStyle={iconStyle}
            cardStyle={cardStyle}
          />
        )}
        {layout === 'list' && (
          <AmenitiesList
            amenities={filteredAmenities}
            iconSize={iconSize}
            iconStyle={iconStyle}
            cardStyle={cardStyle}
          />
        )}
        {layout === 'featured' && (
          <AmenitiesFeatured
            amenities={filteredAmenities}
            iconSize={iconSize}
            iconStyle={iconStyle}
            cardStyle={cardStyle}
          />
        )}
      </div>
    </section>
  );
}

export default Amenities;
