import React from 'react';
import { cn } from '@/lib/utils/utils';

interface ImageGallerySkeletonProps {
  /** Layout variant matching ImageGallery */
  layout?: 'grid' | 'masonry' | 'carousel';
  /** Number of columns for grid layout */
  columns?: 2 | 3 | 4;
  /** Number of image placeholders to show */
  imageCount?: number;
  /** Aspect ratio for grid/masonry images */
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  className?: string;
}

/**
 * Skeleton component for ImageGallery.
 * Matches the ImageGallery layout structure:
 * - Grid: Responsive grid layout with columns
 * - Masonry: CSS columns layout
 * - Carousel: Horizontal scrolling flex layout
 * Uses Tailwind's animate-pulse for loading state.
 * Story 12.4: AC4 - Create skeleton for ImageGallery
 */
export function ImageGallerySkeleton({
  layout = 'grid',
  columns = 3,
  imageCount = 6,
  aspectRatio = 'landscape',
  className,
}: ImageGallerySkeletonProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]',
  };

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  };

  const masonryCols = {
    2: 'columns-1 sm:columns-2',
    3: 'columns-1 sm:columns-2 lg:columns-3',
    4: 'columns-2 sm:columns-3 lg:columns-4',
  };

  const carouselCount = Math.min(imageCount, 3);

  return (
    <div
      className={cn(
        'w-full overflow-hidden',
        layout === 'grid' && `grid ${gridCols[columns]} gap-gap-card`,
        layout === 'masonry' && `${masonryCols[columns]} space-y-gap-card`,
        layout === 'carousel' && 'flex gap-gap-card overflow-hidden py-gap-section',
        className
      )}
      aria-busy="true"
      aria-label="Loading gallery images"
    >
      {Array.from({ length: layout === 'carousel' ? carouselCount : imageCount }).map((_, i) => (
        <figure
          key={i}
          className={cn(
            // Base styles matching galleryVariants cardStyle
            'bg-surface-elevated rounded-2xl overflow-hidden',
            'border-2 border-transparent',
            'animate-pulse',
            // Layout-specific
            layout === 'masonry' && 'break-inside-avoid mb-gap-card'
          )}
          aria-hidden="true"
        >
          {/* Image placeholder */}
          <div className={cn(
            'relative w-full bg-surface-secondary',
            aspectRatioClasses[aspectRatio],
            layout === 'carousel' && 'flex-shrink-0 w-64'
          )}>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>

          {/* Caption placeholder (optional, for masonry/carousel) */}
          {(layout === 'masonry' || layout === 'carousel') && (
            <div className="p-card space-y-gap-card/2">
              <div className="h-fluid-base w-3/4 bg-surface-secondary/50 rounded" />
              <div className="h-fluid-sm w-1/2 bg-surface-secondary/40 rounded" />
            </div>
          )}
        </figure>
      ))}
    </div>
  );
}
