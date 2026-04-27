/**
 * BookingWidgetSkeleton Component
 *
 * Loading skeleton for the BookingWidget component.
 * Displays placeholder UI while booking data is being fetched.
 *
 * @module lib/content/skeleton
 */

import React from 'react';
import { cn } from '@/lib/utils/utils';

interface BookingWidgetSkeletonProps {
  /** Variant matching BookingWidget (mobile or desktop) */
  variant?: 'mobile' | 'desktop';
  /** Theme matching BookingWidget */
  theme?: 'light' | 'dark' | 'glass';
  /** Additional className */
  className?: string;
}

/**
 * BookingWidgetSkeleton Component
 *
 * Displays a loading skeleton matching the BookingWidget structure.
 * - Form fields (check-in, check-out, guests)
 * - Search/Book button
 * - Uses shimmer animation
 *
 * @component
 */
export function BookingWidgetSkeleton({
  variant = 'desktop',
  theme = 'light',
  className,
}: BookingWidgetSkeletonProps) {
  // Theme classes for the container
  const themeClasses = {
    light: 'bg-surface-primary border border-border-default',
    dark: 'bg-brand-primary border border-brand-primary/30',
    glass: 'bg-surface-primary/80 backdrop-blur-md border border-border-default/50',
  };

  const isDesktop = variant === 'desktop';

  return (
    <div
      className={cn(
        'rounded-2xl p-card shadow-card animate-pulse',
        themeClasses[theme],
        className
      )}
      aria-busy="true"
      aria-label="Loading booking widget"
    >
      {/* Section Header */}
      <div className="mb-gap-card">
        <div className="h-6 w-32 bg-surface-secondary rounded mb-2" />
        <div className="h-4 w-48 bg-surface-secondary/60 rounded" />
      </div>

      {/* Form Fields */}
      <div className={cn(
        'flex gap-gap-card',
        isDesktop ? 'flex-row' : 'flex-col'
      )}>
        {/* Check-in Field */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-16 bg-surface-secondary/60 rounded" />
          <div className="h-10 w-full bg-surface-secondary rounded" />
        </div>

        {/* Check-out Field */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-16 bg-surface-secondary/60 rounded" />
          <div className="h-10 w-full bg-surface-secondary rounded" />
        </div>

        {/* Guests Field */}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-12 bg-surface-secondary/60 rounded" />
          <div className="h-10 w-full bg-surface-secondary rounded" />
        </div>
      </div>

      {/* Book Button */}
      <div className="mt-gap-card">
        <div className="h-12 w-full bg-brand-secondary/30 rounded-lg" />
      </div>

      {/* Additional info (for desktop) */}
      {isDesktop && (
        <div className="mt-gap-card pt-gap-card border-t border-border-default/50">
          <div className="h-3 w-full bg-surface-secondary/40 rounded" />
          <div className="h-3 w-3/4 bg-surface-secondary/30 rounded mt-2" />
        </div>
      )}
    </div>
  );
}

export default BookingWidgetSkeleton;
