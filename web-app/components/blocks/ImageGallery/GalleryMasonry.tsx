'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/utils';
import { galleryVariants } from '@/lib/cva-variants';
import Lightbox from './Lightbox';
import GalleryThumbnails from './GalleryThumbnails';

interface GalleryMasonryProps {
  images: Array<{
    id: string;
    desktopUrl: string;
    mobileUrl: string;
    alt: string;
    caption?: string;
  }>;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  columns?: 2 | 3 | 4;
  spacing?: 'tight' | 'normal' | 'loose';
  cardStyle?: 'default' | 'minimal' | 'flat' | 'elevated';
  enableLightbox?: boolean;
  className?: string;
}

/**
 * GalleryMasonry Component
 * 
 * True Pinterest-style masonry layout with varying image heights.
 * Refactored to use centralized CVA variants for styling.
 */
const GalleryMasonry: FC<GalleryMasonryProps> = ({
  images,
  columns = 3, // Default to 3 cols for masonry standard
  spacing = 'normal',
  cardStyle = 'default',
  enableLightbox = true,
  className
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    if (enableLightbox) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleLightboxNavigate = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Define varying aspect ratios for true masonry effect
  // Pattern: tall, wide, square, tall, wide, square... with some variation
  const getAspectRatio = (index: number): string => {
    const patterns = [
      '!aspect-[3/4]',   // 0: tall portrait
      '!aspect-[4/3]',   // 1: landscape
      '!aspect-square',  // 2: square
      '!aspect-[4/5]',   // 3: portrait
      '!aspect-[16/10]', // 4: wide landscape
      '!aspect-[3/4]',   // 5: tall portrait
    ];
    return patterns[index % patterns.length];
  };

  return (
    <>
      <div 
        className={cn(
          galleryVariants({ layout: 'masonry', columns, spacing, cardStyle }),
          // Override aspect ratio CVA because Masonry handles it per-item
          "[&_figure_div]:aspect-auto", 
          className
        )}
      >
        {images.map((image, index) => {
          return (
            <figure
              key={image.id}
              className={cn(
                "relative break-inside-avoid mb-gap-card group cursor-pointer"
              )}
              onClick={() => handleImageClick(index)}
            >
              {/* Image Container with varying heights */}
              <div className={cn(
                "gallery-image-wrapper relative w-full overflow-hidden",
                getAspectRatio(index)
              )}>
                <Image
                  src={image.desktopUrl}
                  alt={image.alt}
                  fill
                  className={cn(
                    "object-cover",
                    "transition-transform duration-emphasis ease-out",
                    "group-hover:scale-110"
                  )}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  loading="lazy"
                />
                
                {/* Gradient Overlay - Elegant navy fade */}
                <div className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-t from-brand-primary/mid via-brand-primary/subtle to-transparent",
                  "opacity-0 transition-opacity duration-standard",
                  "group-hover:opacity-100"
                )} />
                
                {/* View indicator on hover */}
                <div className={cn(
                  "absolute inset-0 flex items-center justify-center",
                  "opacity-0 transition-all duration-standard",
                  "group-hover:opacity-100"
                )}>
                  <div className={cn(
                    "size-icon-overlay rounded-full",
                    "bg-surface-primary/strong backdrop-blur-sm",
                    "flex items-center justify-center",
                    "border-2 border-brand-secondary",
                    "shadow-lg",
                    "transform scale-75 transition-transform duration-standard",
                    "group-hover:scale-100"
                  )}>
                    <svg 
                      className="size-6 text-brand-primary" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Accessible button overlay */}
                {enableLightbox && (
                  <button
                    className="absolute inset-0 w-full h-full bg-transparent cursor-pointer"
                    aria-label={`View ${image.alt} in full screen`}
                  >
                    <span className="sr-only">Open lightbox for {image.alt}</span>
                  </button>
                )}
              </div>

              {/* Caption - Elegant bottom bar */}
              {image.caption && (
                <figcaption className={cn(
                  "absolute bottom-0 left-0 right-0",
                  "p-card pt-8",
                  "bg-gradient-to-t from-brand-primary/glass to-transparent",
                  "text-text-inverted",
                  "transform transition-transform duration-standard",
                  "translate-y-full group-hover:translate-y-0"
                )}>
                  <p className="text-sm font-medium">{image.caption}</p>
                </figcaption>
              )}

              {/* Always visible caption for non-hover caption display - hidden on hover */}
              {image.caption && (
                <div className="p-card bg-surface-elevated border-t border-border-default group-hover:opacity-0 transition-opacity duration-standard">
                  <p className="text-sm text-text-secondary font-medium truncate">{image.caption}</p>
                </div>
              )}
            </figure>
          );
        })}
      </div>

      {/* Image count indicator */}
      <div className="mt-gap-card text-center">
        <p className="text-sm text-text-muted">
          Showing <span className="font-semibold text-brand-primary">{images.length}</span> images 
          <span className="mx-gap-card">•</span>
          <span className="text-brand-secondary">Click any image to view full screen</span>
        </p>
      </div>

      {/* Lightbox Component with Thumbnails */}
      {enableLightbox && (
        <Lightbox
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          images={images}
          currentIndex={currentImageIndex}
          onNavigate={handleLightboxNavigate}
        >
          <GalleryThumbnails
            images={images}
            currentIndex={currentImageIndex}
            onSelect={handleLightboxNavigate}
          />
        </Lightbox>
      )}
    </>
  );
};

export default GalleryMasonry;
