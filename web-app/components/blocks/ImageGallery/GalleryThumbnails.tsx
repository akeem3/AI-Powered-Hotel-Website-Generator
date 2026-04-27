'use client';

import { FC, useEffect, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/utils';

interface GalleryThumbnailsProps {
  images: Array<{
    id: string;
    desktopUrl: string;
    mobileUrl: string;
    alt: string;
    caption?: string;
  }>;
  currentIndex: number;
  onSelect: (index: number) => void;
}

/**
 * GalleryThumbnails Component
 * 
 * Horizontal scrollable thumbnail strip for lightbox navigation.
 * 
 * Features:
 * - Horizontal scroll with snap points
 * - Active thumbnail highlighting with Story 1.11 design tokens
 * - Auto-scroll to active thumbnail
 * - Responsive sizing (80×60px)
 * - Click to navigate
 * 
 * Accessibility:
 * - Keyboard accessible buttons
 * - ARIA labels for screen readers
 * - Focus management
 */
const GalleryThumbnails: FC<GalleryThumbnailsProps> = ({
  images,
  currentIndex,
  onSelect
}) => {
  const thumbnailRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active thumbnail when currentIndex changes
  useEffect(() => {
    const activeThumbnail = thumbnailRefs.current[currentIndex];
    if (activeThumbnail && containerRef.current) {
      activeThumbnail.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className="flex gap-gap-card overflow-x-auto snap-x snap-mandatory p-gap-card scrollbar-hide"
      role="tablist"
      aria-label="Image thumbnails"
    >
      {images.map((image, index) => {
        const isActive = index === currentIndex;

        return (
          <button
            key={image.id}
            ref={(el) => {
              thumbnailRefs.current[index] = el;
            }}
            onClick={() => onSelect(index)}
            className={cn(
              "flex-none snap-center",
              "relative w-20 h-15 rounded-md overflow-hidden",
              "transition-all duration-standard",
              "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
              isActive
                ? "ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-default scale-105"
                : "ring-2 ring-transparent opacity-high hover:opacity-100 hover:scale-105"
            )}
            role="tab"
            aria-selected={isActive}
            aria-label={`View image ${index + 1}: ${image.alt}`}
          >
            <Image
              src={image.mobileUrl}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
            
            {/* Active Indicator Overlay */}
            {isActive && (
              <div className="absolute inset-0 border-2 border-brand-primary rounded-md pointer-events-none" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default GalleryThumbnails;
