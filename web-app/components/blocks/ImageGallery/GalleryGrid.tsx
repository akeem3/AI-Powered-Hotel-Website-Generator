'use client';

import { FC, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/utils';
import { galleryVariants } from '@/lib/cva-variants';
import Lightbox from './Lightbox';
import GalleryThumbnails from './GalleryThumbnails';

interface GalleryGridProps {
  images: Array<{
    id: string;
    desktopUrl: string;
    mobileUrl: string;
    alt: string;
    caption?: string;
  }>;
  columns?: 2 | 3 | 4;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  spacing?: 'tight' | 'normal' | 'loose';
  cardStyle?: 'default' | 'minimal' | 'flat' | 'elevated';
  enableLightbox?: boolean;
  className?: string;
}

/**
 * GalleryGrid Component
 * 
 * Premium uniform grid layout with optional featured first image.
 * Refactored to use centralized CVA variants for styling.
 */
const GalleryGrid: FC<GalleryGridProps> = ({
  images,
  columns = 3,
  aspectRatio = 'landscape',
  spacing = 'normal',
  cardStyle = 'default',
  enableLightbox = true,
  className
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Responsive sizes attribute for Next.js Image optimization
  const imageSizes = {
    2: '(max-width: 640px) 100vw, 50vw',
    3: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    4: '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
  }[columns];

  const handleImageClick = (index: number) => {
    if (enableLightbox) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleLightboxNavigate = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Determine if we should feature the first image (for 3+ columns and 4+ images)
  const showFeaturedFirst = columns >= 3 && images.length >= 4;

  return (
    <>
      <div
        className={cn(
          galleryVariants({ layout: 'grid', columns, spacing, aspectRatio, cardStyle }),
          // Override CVA aspect-ratio selector - applied directly on wrapper
          "[&_figure_.gallery-image-wrapper]:aspect-auto",
          className
        )}
      >
        {images.map((image, index) => {
          const isFeatured = showFeaturedFirst && index === 0;
          
          return (
            <figure
              key={image.id}
              className={cn(
                "relative cursor-pointer group",
                isFeatured && "sm:col-span-2 sm:row-span-2"
              )}
              onClick={() => handleImageClick(index)}
            >
              {/* Image Container - Aspect ratio applied directly */}
              <div className={cn(
                "gallery-image-wrapper relative w-full overflow-hidden",
                aspectRatio === 'square' && "aspect-square",
                aspectRatio === 'landscape' && "aspect-[4/3]",
                aspectRatio === 'portrait' && "aspect-[3/4]"
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
                  sizes={imageSizes}
                  loading="lazy"
                />
                
                {/* Gradient Overlay - Navy fade on hover */}
                <div className={cn(
                  "absolute inset-0",
                  "bg-gradient-to-t from-brand-primary/high via-brand-primary/subtle to-transparent",
                  "opacity-0 transition-opacity duration-standard",
                  "group-hover:opacity-100"
                )} />

                {/* Featured badge for first image */}
                {isFeatured && (
                  <div className="absolute top-gap-card left-gap-card z-elevated">


                    <span className={cn(
                      "px-gap-card py-1 rounded-full",

                      "bg-brand-secondary text-brand-primary",
                      "text-size-overline font-semibold uppercase tracking-wider",
                      "shadow-md"
                    )}>
                      Featured
                    </span>
                  </div>
                )}
                
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

                {/* Caption overlay at bottom */}
                {image.caption && (
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0",
                    "p-card pt-gap-section/2",

                    "bg-gradient-to-t from-brand-primary/glass to-transparent",
                    "transform transition-transform duration-standard",
                    "translate-y-full group-hover:translate-y-0"
                  )}>
                    <p className="text-size-caption font-medium text-text-inverted">{image.caption}</p>
                  </div>
                )}

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

              {/* Static caption below image when not hovering - hidden on hover via group-hover pattern */}
              {image.caption && (
                <div className="p-container bg-surface-elevated border-t border-border-default group-hover:opacity-0 transition-opacity duration-standard">
                  <p className="text-size-caption text-text-secondary font-medium truncate">{image.caption}</p>
                </div>
              )}
            </figure>
          );
        })}
      </div>

      {/* Image count indicator */}
      <div className="mt-gap-card text-center">
        <p className="text-size-caption text-text-muted">
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

export default GalleryGrid;
