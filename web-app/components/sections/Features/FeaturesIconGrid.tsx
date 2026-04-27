/**
 * FeaturesIconGrid Component
 *
 * Story 19.4: Features / USP Block - FeaturesIconGrid Sub-Component
 *
 * Compact icon-based grid showcasing hotel features and USPs.
 * Uses lucide-react icons with configurable column layout (2/3/4).
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/sections/Features/FeaturesIconGrid
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

import { validateInDev } from '@/lib/contracts/validate.dev';
import { FeaturesContract, type FeaturesConfig } from '@/lib/contracts/features.contract';
import { cn } from '@/lib/utils/utils';

/**
 * FeaturesIconGrid Component Props
 *
 * Extends FeaturesConfig for type safety.
 */
export interface FeaturesIconGridProps extends FeaturesConfig {}

/**
 * FeaturesIconGrid Component
 *
 * Compact icon-based grid layout for showcasing features.
 * Icons are centered at the top of each cell, followed by bold title
 * and regular-weight description below.
 *
 * Features:
 * - Configurable columns (2/3/4) for responsive layout
 * - Dynamic icon lookup using lucide-react with fallback
 * - Semantic tokens only (no hardcoded colors)
 * - Responsive: single column on mobile, configured columns on desktop
 * - Server component (no client-side interactivity)
 *
 * @example
 * ```tsx
 * <FeaturesIconGrid
 *   heading="Why Choose Us"
 *   features={[
 *     { title: 'Free WiFi', description: 'High-speed internet throughout the property', icon: 'Wifi' },
 *     { title: 'Pool & Spa', description: 'Relax in our heated pool and luxury spa', icon: 'Waves' },
 *     { title: '24/7 Concierge', description: 'Our dedicated team is available around the clock', icon: 'ConciergeBell' }
 *   ]}
 *   variant={{ columns: 3 }}
 * />
 * ```
 */
export default function FeaturesIconGrid(rawProps: FeaturesIconGridProps) {
  // Validate props against contract
  const props = validateInDev(FeaturesContract, rawProps, 'FeaturesIconGrid');

  const { heading, features, variant, className } = props;
  const { columns = 3 } = variant || {};

  // Determine responsive grid classes based on columns prop
  // Mobile: always 1 column, Desktop: use configured columns
  const gridClasses = cn(
    'w-full',
    columns === 2 && 'grid grid-cols-1 md:grid-cols-2 gap-gap-section',
    columns === 3 && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-section',
    columns === 4 && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-section',
    className
  );

  return (
    <section
      className={cn('w-full py-section', className)}
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl p-container">
        {/* Section header matching Amenities pattern with gold accent bar */}
        {heading && (
          <div className="mb-gap-section text-center">
            {/* Gold Accent Bar */}
            <div className="flex items-center justify-center mb-gap-card">
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
              <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            </div>

            <h2
              id="features-heading"
              className="mb-gap-card font-display text-size-h2 text-brand-primary"
            >
              {heading}
            </h2>

            {/* Gold Underline Accent */}
            <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto"></div>
          </div>
        )}

        {/* Icon grid */}
        <div className={gridClasses}>
          {features.map((feature, index) => {
          // Dynamic icon lookup with fallback to Star icon
          const IconComponent = (LucideIcons[feature.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.Star;

          return (
            <div
              key={index}
              className="flex flex-col items-center text-center p-card"
            >
              {/* Icon container */}
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-on-brand mb-gap-card">
                <IconComponent className="size-8" strokeWidth={1.5} aria-hidden="true" />
              </div>

              {/* Feature title */}
              <h3 className="text-text-primary text-size-h3 font-semibold mb-gap-card/2">
                {feature.title}
              </h3>

              {/* Feature description */}
              <p className="text-text-secondary text-size-body leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
