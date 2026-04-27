import React from 'react';
import { cn } from '@/lib/utils/utils';

interface TestimonialsSkeletonProps {
  /** Layout variant - matches Testimonials component */
  layout?: 'grid' | 'carousel' | 'featured';
  /** Number of testimonial cards to show in skeleton */
  itemCount?: number;
  /** Columns for grid layout */
  columns?: 2 | 3;
  /** Custom className for outer section */
  className?: string;
}

/**
 * Skeleton component for Testimonials section.
 * Matches the structure and styling of the Testimonials component.
 */
export function TestimonialsSkeleton({
  layout = 'grid',
  itemCount = 6,
  columns = 3,
  className,
}: TestimonialsSkeletonProps) {
  return (
    <div
      className={cn('w-full', className)}
      aria-busy="true"
      aria-label="Loading testimonials"
    >
      {/* Section Header */}
      <div className="text-center mb-gap-section">

        {/* Gold Accent Bar */}
        {/* Gold Accent Bar */}
        <div className="flex items-center justify-center mb-gap-card">
          <div className="h-divider w-divider-sm bg-surface-muted animate-pulse" aria-hidden="true" />
          <div className="h-divider-accent w-divider-sm mx-gap-card rounded-full bg-surface-muted animate-pulse" aria-hidden="true" />
          <div className="h-divider w-divider-sm bg-surface-muted animate-pulse" aria-hidden="true" />
        </div>

        {/* Heading skeleton */}
        <div className="h-fluid-xl w-1/2 mx-auto mb-gap-card bg-surface-muted animate-pulse rounded" aria-hidden="true" />

        {/* Gold Underline Accent */}
        <div className="w-divider-lg h-divider-accent bg-surface-muted animate-pulse mx-auto mb-gap-card" aria-hidden="true" />

        {/* Subheading skeleton */}
        <div className="h-6 w-3/4 mx-auto max-w-3xl bg-surface-muted animate-pulse rounded" aria-hidden="true" />
      </div>

      {/* Testimonial cards skeleton */}
      {layout === 'grid' && (
        <div
          className={cn(
            'grid gap-gap-card',

            columns === 2 && 'grid-cols-1 md:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {Array.from({ length: itemCount }).map((_, i) => (
            <div key={i} className="p-card rounded-2xl bg-surface-secondary animate-pulse" aria-hidden="true">

              {/* Avatar skeleton */}
              <div className="h-12 w-12 mb-card bg-surface-muted animate-pulse rounded-full" />
              {/* Name skeleton */}
              <div className="h-5 w-1/2 mb-card bg-surface-muted animate-pulse rounded" />
              {/* Title skeleton */}
              <div className="h-4 w-1/3 mb-card bg-surface-muted animate-pulse rounded" />
              {/* Stars skeleton */}
              <div className="flex gap-1 mb-card">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 w-4 bg-surface-muted animate-pulse rounded" />
                ))}
              </div>
              {/* Quote skeleton */}
              <div className="h-4 w-full mb-card bg-surface-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 mb-card bg-surface-muted animate-pulse rounded" />
              <div className="h-4 w-4/6 bg-surface-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}

      {layout === 'carousel' && (
        <div className="grid gap-gap-card grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(itemCount, 3) }).map((_, i) => (
            <div key={i} className="p-card rounded-2xl bg-surface-secondary animate-pulse" aria-hidden="true">

              {/* Avatar skeleton */}
              <div className="h-12 w-12 mb-card bg-surface-tertiary animate-pulse rounded-full" />
              {/* Name skeleton */}
              <div className="h-5 w-1/2 mb-card bg-surface-tertiary animate-pulse rounded" />
              {/* Title skeleton */}
              <div className="h-4 w-1/3 mb-card bg-surface-tertiary animate-pulse rounded" />
              {/* Stars skeleton */}
              <div className="flex gap-1 mb-card">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 w-4 bg-surface-tertiary animate-pulse rounded" />
                ))}
              </div>
              {/* Quote skeleton */}
              <div className="h-4 w-full mb-card bg-surface-tertiary animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-surface-tertiary animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}

      {layout === 'featured' && (
        <div className="max-w-5xl mx-auto space-y-gap-section">
          {Array.from({ length: Math.min(itemCount, 2) }).map((_, i) => (
            <div key={i} className="p-card rounded-2xl bg-surface-secondary animate-pulse" aria-hidden="true">

              <div className="flex gap-6">
                {/* Avatar skeleton */}
                <div className="h-16 w-16 bg-surface-tertiary animate-pulse rounded-full flex-shrink-0" />
                {/* Content skeleton */}
                <div className="flex-1">
                  {/* Name skeleton */}
                  <div className="h-6 w-1/3 mb-card bg-surface-tertiary animate-pulse rounded" />
                  {/* Title skeleton */}
                  <div className="h-4 w-1/4 mb-card bg-surface-tertiary animate-pulse rounded" />
                  {/* Stars skeleton */}
                  <div className="flex gap-1 mb-card">
                    {[...Array(5)].map((_, j) => (
                      <div key={j} className="h-4 w-4 bg-surface-tertiary animate-pulse rounded" />
                    ))}
                  </div>
                  {/* Quote skeleton */}
                  <div className="h-4 w-full mb-card bg-surface-tertiary animate-pulse rounded" />
                  <div className="h-4 w-5/6 mb-card bg-surface-tertiary animate-pulse rounded" />
                  <div className="h-4 w-4/6 bg-surface-tertiary animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
