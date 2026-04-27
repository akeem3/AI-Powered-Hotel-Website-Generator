/**
 * HotelInfo Server Component
 *
 * Displays hotel information including name, star rating, address,
 * property type, and other details. This is a Server Component that
 * receives all data as props.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * All data fetching happens server-side via parent components.
 *
 * @module components/sections/HotelInfo
 */

import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { HotelInfoContract, type HotelInfoContractType } from '@/lib/contracts/hotel-info.contract';
import { Star } from 'lucide-react';

/**
 * HotelInfo component props
 *
 * Extends the contract with additional properties if needed.
 */
export interface HotelInfoProps extends HotelInfoContractType {}

/**
 * Format property type for display
 */
function formatPropertyType(type: string): string {
  const typeMap: Record<string, string> = {
    hotel: 'Hotel',
    resort: 'Resort',
    hostel: 'Hostel',
    guesthouse: 'Guest House',
    villa: 'Villa',
    apartment: 'Apartment',
    other: 'Property',
  };
  return typeMap[type] || type;
}

/**
 * HotelInfo Server Component
 *
 * Renders the hotel information section with all data provided as props.
 * No client-side data fetching - data comes from parent Server Component.
 *
 * Data Flow:
 * 1. Parent Server Component (page.tsx) fetches data via getHotelPageData()
 * 2. Hotel data is passed as props to HotelInfo
 * 3. HotelInfo renders the information server-side
 *
 * @component
 * @example
 * ```tsx
 * // Server Component usage
 * <HotelInfo
 *   hotel={hotelData}
 *   heading="About This Hotel"
 * />
 * ```
 */
export function HotelInfo(rawProps: HotelInfoProps) {
  // Validate props against contract
  const props = validateInDev(HotelInfoContract, rawProps, 'HotelInfo');

  const { hotel, heading = 'Hotel Information', className } = props;
  const { name, star_rating, property_type, parsedAddress, opening_year } = hotel;

  // Build address parts
  const addressParts = [
    parsedAddress.street,
    parsedAddress.city,
    parsedAddress.state,
    parsedAddress.postal_code,
    parsedAddress.country,
  ].filter(Boolean);

  const addressString = addressParts.join(', ');

  return (
    <section className={cn('w-full py-section', className)} aria-labelledby="hotel-info-heading">
      <div className="mx-auto max-w-4xl p-container">
        {/* Section Header */}
        <div className="text-center mb-gap-section">
          {/* Gold Accent Bar */}
          <div className="flex items-center justify-center mb-gap-card">
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
          </div>

          <h2
            id="hotel-info-heading"
            className="mb-gap-card font-display text-size-h2 text-brand-primary"
          >
            {heading}
          </h2>

          {/* Gold Underline Accent */}
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto"></div>
        </div>

        {/* Hotel Information Card */}
        <div className="bg-surface-primary shadow-card rounded-2xl p-card border border-border-default">
          {/* Hotel Name and Star Rating */}
          <div className="text-center mb-gap-card pb-gap-card border-b border-border-default">
            <h3 className="text-size-h2 font-display text-text-primary mb-gap-card">{name}</h3>

            {/* Star Rating */}
            {star_rating && star_rating > 0 && (
              <div className="flex items-center justify-center gap-gap-card text-brand-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      'size-6',
                      index < star_rating ? 'fill-current' : 'text-border-default',
                    )}
                    aria-hidden="true"
                  />
                ))}
                <span className="sr-only">{star_rating} out of 5 stars</span>
              </div>
            )}

            {/* Property Type Badge */}
            <div className="mt-gap-card">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-brand-primary/faint text-brand-secondary text-size-caption font-medium">
                {formatPropertyType(property_type)}
              </span>
            </div>
          </div>

          {/* Address */}
          <div className="mb-gap-card">
            <h4 className="text-size-body font-semibold text-text-primary mb-gap-card flex items-center gap-gap-card">
              <span className="size-dot rounded-full bg-brand-secondary"></span>
              Address
            </h4>
            <address className="not-italic text-text-secondary leading-relaxed pl-5">
              {addressString}
            </address>
          </div>

          {/* Opening Year */}
          {opening_year && (
            <div className="mb-gap-card">
              <h4 className="text-size-body font-semibold text-text-primary mb-gap-card flex items-center gap-gap-card">
                <span className="size-dot rounded-full bg-brand-secondary"></span>
                Established
              </h4>
              <p className="text-text-secondary pl-5">Since {opening_year}</p>
            </div>
          )}

          {/* Property Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gap-card pt-gap-card border-t border-border-default">
            {/* Property Type */}
            <div>
              <h4 className="text-size-body font-semibold text-text-primary mb-gap-card flex items-center gap-gap-card">
                <span className="size-dot rounded-full bg-brand-secondary"></span>
                Property Type
              </h4>
              <p className="text-text-secondary pl-5">{formatPropertyType(property_type)}</p>
            </div>

            {/* Star Rating Text */}
            {star_rating && star_rating > 0 && (
              <div>
                <h4 className="text-size-body font-semibold text-text-primary mb-gap-card flex items-center gap-gap-card">
                  <span className="size-dot rounded-full bg-brand-secondary"></span>
                  Rating
                </h4>
                <p className="text-text-secondary pl-5">
                  {star_rating} {star_rating === 1 ? 'Star' : 'Stars'} Rating
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HotelInfo;
