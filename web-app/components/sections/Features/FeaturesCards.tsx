/**
 * FeaturesCards Component
 *
 * Story 19.4: Features / USP Block - FeaturesCards Sub-Component
 *
 * Larger card-based layout showcasing features with optional images.
 * Uses shadcn/ui Card primitives with configurable column layout (2/3).
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/sections/Features/FeaturesCards
 */

import React from 'react';
import Image from 'next/image';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

import { validateInDev } from '@/lib/contracts/validate.dev';
import { FeaturesContract, type FeaturesConfig } from '@/lib/contracts/features.contract';
import { cn } from '@/lib/utils/utils';
import { Card, CardContent } from '@/components/ui/card';

/**
 * FeaturesCards Component Props
 *
 * Extends FeaturesConfig for type safety.
 */
export interface FeaturesCardsProps extends FeaturesConfig {}

/**
 * FeaturesCards Component
 *
 * Larger card-based layout for showcasing features with optional images.
 * Each card has an image area at the top (when image provided) and content
 * area with title and description below.
 *
 * Features:
 * - Configurable columns (2/3) for responsive layout (capped at 3 for image cards)
 * - Optional image rendering with Next.js Image component
 * - Icon fallback when no image provided
 * - Hover effects with elevation shadow
 * - Semantic tokens only (no hardcoded colors)
 * - Responsive: single column on mobile, configured columns on desktop
 * - Server component (no client-side interactivity)
 *
 * @example
 * ```tsx
 * <FeaturesCards
 *   heading="Our Premium Amenities"
 *   features={[
 *     {
 *       title: 'Infinity Pool',
 *       description: 'Stunning infinity pool overlooking the caldera with sunset views',
 *       image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
 *     },
 *     {
 *       title: 'Luxury Spa',
 *       description: 'Full-service spa with massage, sauna, and treatment rooms',
 *       image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80'
 *     }
 *   ]}
 *   variant={{ columns: 2 }}
 * />
 * ```
 */
export default function FeaturesCards(rawProps: FeaturesCardsProps) {
  // Validate props against contract
  const props = validateInDev(FeaturesContract, rawProps, 'FeaturesCards');

  const { heading, features, variant, className } = props;
  const { columns = 3 } = variant || {};

  // Determine responsive grid classes based on columns prop
  // Cards capped at 3 columns (4 would be too narrow for image cards)
  // Mobile: always 1 column, Desktop: use configured columns (2 or 3)
  const gridClasses = cn(
    'grid grid-cols-1 gap-gap-section',
    columns === 2 && 'md:grid-cols-2',
    columns === 3 && 'lg:grid-cols-3',
    columns === 4 && 'lg:grid-cols-3' // Cap at 3 for cards
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

        {/* Cards grid */}
        <div className={gridClasses}>
          {features.map((feature, index) => {
          // Dynamic icon lookup with fallback to Star icon (used when no image)
          const IconComponent = (LucideIcons[feature.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.Star;

          const hasImage = feature.image && feature.image.length > 0;

          return (
            <Card
              key={index}
              className={cn(
                'group flex flex-col h-full overflow-hidden transition-all duration-standard hover:shadow-xl hover:-translate-y-1',
                'bg-surface-primary border border-border-default rounded-2xl'
              )}
            >
              {/* Image area (top) */}
              {hasImage ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={feature.image!}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-standard group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ) : (
                /* Icon fallback when no image */
                <div className="flex items-center justify-center h-32 bg-surface-secondary">
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-brand-primary text-on-brand">
                    <IconComponent className="size-8" strokeWidth={1.5} aria-hidden="true" />
                  </div>
                </div>
              )}

              {/* Content area */}
              <CardContent className="flex flex-col gap-gap-card p-card flex-1">
                {/* Feature title */}
                <h3 className="text-text-primary text-size-h3 font-semibold leading-tight">
                  {feature.title}
                </h3>

                {/* Feature description */}
                <p className="text-text-secondary text-size-body leading-relaxed flex-1">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
        </div>
      </div>
    </section>
  );
}
