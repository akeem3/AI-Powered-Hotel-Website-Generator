import React from 'react';
import { cn } from '@/lib/utils/utils';

interface RoomCardSkeletonProps {
  /** Variant matching RoomCard variants */
  variant?: 'detailed' | 'compact' | 'grid';
  /** Image height matching RoomCard image variants */
  imageHeight?: 'default' | 'tall' | 'wide';
  className?: string;
}

/**
 * Skeleton component for RoomCard.
 * Matches the RoomCardDetailed layout structure:
 * - Image placeholder with aspect ratio
 * - Title, type, description placeholders
 * - Price and capacity placeholders
 * - Button placeholders
 * Uses Tailwind's animate-pulse for loading state.
 * Story 12.4: AC4 - Create skeleton for RoomCard
 */
export function RoomCardSkeleton({
  variant = 'detailed',
  imageHeight = 'default',
  className,
}: RoomCardSkeletonProps) {
  const aspectRatioClasses = {
    default: 'aspect-video',
    tall: 'aspect-[4/5]',
    wide: 'aspect-[2/1]',
  };

  const isDetailed = variant === 'detailed';
  const isCompact = variant === 'compact';
  const isGrid = variant === 'grid';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-surface-primary border border-border-default animate-pulse',
        // Match roomCardVariants transition behavior
        'transition-all duration-slow',

        // Layout
        isDetailed && 'flex flex-col h-full',
        isGrid && 'bg-surface-elevated',
        className
      )}
      aria-busy="true"
      aria-label="Loading room card"
    >
      {/* Image placeholder */}
      <div className={cn(
        'relative w-full overflow-hidden bg-surface-secondary',
        aspectRatioClasses[imageHeight]
      )}>
        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-white/wash to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

      </div>

      {/* Content */}
      <div className={cn(
        'p-card flex flex-col gap-gap-card',
        isDetailed && 'flex grow',
        isGrid && 'p-card'
      )}>
        {/* Title and Type */}
        <div className={cn(isGrid && 'space-y-2')}>
          {/* Title */}
          <div className="h-6 w-3/4 bg-surface-secondary/60 rounded" />

          {/* Type */}
          <div className="h-4 w-1/2 bg-surface-secondary/40 rounded" />
        </div>

        {/* Description (only for detailed variant) */}
        {isDetailed && (
          <div className="space-y-2">
            <div className="h-4 w-full bg-surface-secondary/50 rounded" />
            <div className="h-4 w-2/3 bg-surface-secondary/50 rounded" />
          </div>
        )}

        {/* Amenity list placeholder (detailed only) */}
        {isDetailed && (
          <div className="py-gap-card border-t border-border-default">
            <div className="flex gap-2">
              <div className="h-5 w-5 bg-surface-secondary/40 rounded-full" />
              <div className="h-5 w-5 bg-surface-secondary/40 rounded-full" />
              <div className="h-5 w-5 bg-surface-secondary/40 rounded-full" />
            </div>
          </div>
        )}

        {/* Price and capacity */}
        <div className={cn(
          'py-gap-card border-t border-border-default flex justify-between items-end',
          isDetailed && 'mt-auto pt-gap-card'
        )}>
          {/* Price */}
          <div className="flex flex-col gap-1">
            <div className="h-3 w-16 bg-surface-secondary/40 rounded" />
            <div className="h-6 w-20 bg-surface-secondary/60 rounded" />
          </div>

          {/* Capacity */}
          <div className="h-7 w-24 bg-surface-secondary/40 rounded-md" />
        </div>

        {/* Buttons */}
        <div className={cn(
          'grid gap-gap-card',
          isDetailed && 'grid-cols-2 mt-gap-card',
          isGrid && 'grid-cols-1'
        )}>
          <div className="h-10 w-full bg-surface-secondary/50 rounded-lg" />
          {isDetailed && <div className="h-10 w-full bg-surface-secondary/50 rounded-lg" />}
        </div>
      </div>
    </article>
  );
}
