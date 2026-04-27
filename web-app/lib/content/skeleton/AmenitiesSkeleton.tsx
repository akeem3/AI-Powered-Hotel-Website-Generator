import React from 'react';
import { cn } from '@/lib/utils/utils';

interface AmenitiesSkeletonProps {
  /** Layout variant - matches Amenities component */
  layout?: 'grid' | 'list' | 'featured';
  /** Number of amenity items to show in skeleton */
  itemCount?: number;
  /** Columns for grid layout */
  columns?: 2 | 3 | 4;
  /** Custom className for outer section */
  className?: string;
}

/**
 * Skeleton component for Amenities section.
 * Matches the structure and styling of the Amenities component.
 */
export function AmenitiesSkeleton({
  layout = 'grid',
  itemCount = 6,
  columns = 4,
  className,
}: AmenitiesSkeletonProps) {
  return (
    <section
      className={cn('w-full py-section', className)}
      aria-busy="true"
      aria-label="Loading amenities"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Section header skeleton */}
        <div className="mb-gap-section text-center">
          {/* Gold Accent Bar skeleton */}
          <div className="flex items-center justify-center mb-gap-card">
            <div className="h-divider w-divider-sm bg-surface-tertiary animate-pulse" aria-hidden="true" />
            <div className="h-divider-accent w-divider-sm mx-gap-card rounded-full bg-surface-tertiary animate-pulse" aria-hidden="true" />
            <div className="h-divider w-divider-sm bg-surface-tertiary animate-pulse" aria-hidden="true" />
          </div>

          {/* Heading skeleton */}
          <div className="h-fluid-xl w-1/2 mx-auto mb-gap-card bg-surface-tertiary animate-pulse rounded" aria-hidden="true" />

          {/* Gold Underline Accent skeleton */}
          <div className="w-divider-lg h-divider-accent bg-surface-tertiary animate-pulse mx-auto mb-gap-card" aria-hidden="true" />

          {/* Subheading skeleton */}
          <div className="h-fluid-base w-3/4 mx-auto max-w-2xl bg-surface-tertiary animate-pulse rounded" aria-hidden="true" />
        </div>

        {/* Amenity items skeleton */}
        {layout === 'grid' && (
          <div
            className={cn(
              'grid gap-gap-card',
              columns === 2 && 'grid-cols-1 md:grid-cols-2',
              columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
              columns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            )}
          >
            {Array.from({ length: itemCount }).map((_, i) => (
              <div key={i} className="p-card rounded-2xl bg-surface-secondary animate-pulse" aria-hidden="true">
                {/* Icon skeleton */}
                <div className="h-10 w-10 mb-card bg-surface-tertiary animate-pulse rounded" />
                {/* Name skeleton */}
                <div className="h-5 w-3/4 mb-card bg-surface-tertiary animate-pulse rounded" />
                {/* Description skeleton */}
                <div className="h-4 w-full bg-surface-tertiary animate-pulse rounded" />
              </div>
            ))}
          </div>
        )}

        {layout === 'list' && (
          <div className="space-y-gap-card max-w-4xl mx-auto">
            {Array.from({ length: itemCount }).map((_, i) => (
              <div key={i} className="flex items-start gap-gap-card p-card rounded-2xl bg-surface-secondary animate-pulse" aria-hidden="true">
                {/* Icon skeleton */}
                <div className="h-8 w-8 bg-surface-tertiary animate-pulse rounded flex-shrink-0" />
                {/* Content skeleton */}
                <div className="flex-1">
                  <div className="h-5 w-1/2 mb-card bg-surface-tertiary animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-surface-tertiary animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {layout === 'featured' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-card">
            {Array.from({ length: Math.min(itemCount, 3) }).map((_, i) => (
              <div key={i} className="p-card rounded-2xl bg-surface-secondary animate-pulse" aria-hidden="true">
                {/* Icon skeleton */}
                <div className="h-16 w-16 mb-card bg-surface-tertiary animate-pulse rounded" />
                {/* Name skeleton */}
                <div className="h-7 w-3/4 mb-card bg-surface-tertiary animate-pulse rounded" />
                {/* Description skeleton */}
                <div className="h-4 w-full mb-card bg-surface-tertiary animate-pulse rounded" />
                <div className="h-4 w-2/3 bg-surface-tertiary animate-pulse rounded" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
