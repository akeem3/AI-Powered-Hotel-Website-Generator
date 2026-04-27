'use client';

import { FC, useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/utils';
import { galleryVariants } from '@/lib/cva-variants';
import Lightbox from './Lightbox';
import GalleryThumbnails from './GalleryThumbnails';

interface GalleryCarouselProps {
  images: Array<{
    id: string;
    desktopUrl: string;
    mobileUrl: string;
    alt: string;
    caption?: string;
  }>;
  aspectRatio?: 'square' | 'landscape' | 'portrait';
  spacing?: 'tight' | 'normal' | 'loose';
  cardStyle?: 'default' | 'minimal' | 'flat' | 'elevated';
  enableLightbox?: boolean;
  className?: string;
}

/**
 * GalleryCarousel Component
 * 
 * Premium horizontal carousel with navigation arrows and dot indicators.
 * Refactored to use centralized CVA variants for styling.
 */
const GalleryCarousel: FC<GalleryCarouselProps> = ({
  images,
  aspectRatio = 'landscape',
  spacing = 'normal',
  cardStyle = 'default',
  enableLightbox = true,
  className
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Spacing values in pixels for scroll calculations (must match CVA)
  // tight: gap-3 (12px), normal: gap-5 (20px), loose: gap-8 (32px)
  const spacingValues = {
    tight: 12,
    normal: 20,
    loose: 32
  };

  // Aspect ratio classes for inner container
  const aspectRatioClasses = {
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    portrait: 'aspect-[3/4]'
  };

  // Performance optimization: Cache card width to avoid DOM layout thrashing during scroll
  const [cachedCardWidth, setCachedCardWidth] = useState<number>(300);

  // Set up ResizeObserver to track width changes of the first card
  useEffect(() => {
    if (!carouselRef.current) return;

    const firstCard = carouselRef.current.querySelector('figure');
    if (!firstCard) return;

    // Initial measurement
    setCachedCardWidth(firstCard.offsetWidth || 300);

    let animationFrameId: number;
    const resizeObserver = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to debounce updates and avoid ResizeObserver loop errors
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        for (const entry of entries) {
          const newWidth = entry.borderBoxSize?.[0]?.inlineSize ?? (entry.target as HTMLElement).offsetWidth;
          if (newWidth) {
            setCachedCardWidth(newWidth);
          }
        }
      });
    });

    resizeObserver.observe(firstCard);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [images]); // Re-run if images change, in case the first card identity changes

  // Calculate scroll position for a given index
  const getScrollPosition = useCallback((index: number) => {
    const gapWidth = spacingValues[spacing];
    // Each card position = index * (cardWidth + gap)
    return index * (cachedCardWidth + gapWidth);
  }, [cachedCardWidth, spacing]);

  // Handle scroll to update active index
  const handleScroll = useCallback(() => {
    if (!carouselRef.current) return;
    
    const scrollLeft = carouselRef.current.scrollLeft;
    const gapWidth = spacingValues[spacing];
    const cardTotalWidth = cachedCardWidth + gapWidth;
    
    // Calculate which card is centered
    const newIndex = Math.round(scrollLeft / cardTotalWidth);
    const clampedIndex = Math.max(0, Math.min(newIndex, images.length - 1));
    
    if (clampedIndex !== activeIndex) {
      setActiveIndex(clampedIndex);
    }
  }, [images.length, activeIndex, cachedCardWidth, spacing]);

  // Scroll to specific index with smooth animation
  const scrollToIndex = useCallback((index: number) => {
    if (!carouselRef.current) return;
    
    const clampedIndex = Math.max(0, Math.min(index, images.length - 1));
    const scrollPosition = getScrollPosition(clampedIndex);
    
    carouselRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
    
    setActiveIndex(clampedIndex);
  }, [images.length, getScrollPosition]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, scrollToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Set up scroll listener with throttling
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    carousel.addEventListener('scroll', onScroll, { passive: true });
    return () => carousel.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  const handleImageClick = (index: number) => {
    if (enableLightbox) {
      setCurrentImageIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleLightboxNavigate = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <div className={cn("relative w-full", className)}>
        {/* Left Navigation Arrow */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={cn(
            "absolute left-gap-section md:left-gap-section top-1/2 -translate-y-1/2 z-sticky",

            "size-12 md:size-14 rounded-full",
            "bg-surface-primary/glass backdrop-blur-sm",
            "border-2 border-brand-secondary",
            "shadow-lg",
            "flex items-center justify-center",
            "transition-all duration-standard",
            "hover:bg-brand-secondary hover:text-surface-primary",
            "disabled:opacity-subtle disabled:cursor-not-allowed disabled:hover:bg-surface-primary/glass"
          )}
          aria-label="Previous image"
        >
          <svg className="size-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Navigation Arrow */}
        <button
          onClick={handleNext}
          disabled={activeIndex === images.length - 1}
          className={cn(
            "absolute right-gap-section md:right-gap-section top-1/2 -translate-y-1/2 z-sticky",

            "size-12 md:size-14 rounded-full",
            "bg-surface-primary/glass backdrop-blur-sm",
            "border-2 border-brand-secondary",
            "shadow-lg",
            "flex items-center justify-center",
            "transition-all duration-standard",
            "hover:bg-brand-secondary hover:text-surface-primary",
            "disabled:opacity-subtle disabled:cursor-not-allowed disabled:hover:bg-surface-primary/glass"
          )}
          aria-label="Next image"
        >
          <svg className="size-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className={cn(galleryVariants({ layout: 'carousel', spacing, cardStyle }), 'scroll-smooth-behavior')}
        >
          {images.map((image, index) => {
            const isActive = activeIndex === index;
            const isFirst = index === 0;
            const isLast = index === images.length - 1;
            
            return (
              <figure
                key={image.id}
                className={cn(
                  "relative flex-none group",
                  "carousel-card-width",
                  "overflow-hidden rounded-2xl",
                  "transition-all duration-standard ease-out",
                  "cursor-pointer",
                  isFirst && "ml-gap-card md:ml-gap-section",
                  isLast && "mr-gap-card md:mr-gap-section",
                  // Scale effect for active card
                  isActive ? "scale-100" : "scale-95 opacity-high"
                )}
                onClick={() => handleImageClick(index)}
              >
                {/* Image Container */}
                <div className={cn(
                  "gallery-image-wrapper relative w-full overflow-hidden",
                  aspectRatioClasses[aspectRatio]
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
                    sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 35vw"
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-t from-brand-primary/mid via-transparent to-transparent",
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
                      <svg className="size-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
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

                {/* Caption - Always visible at bottom */}
                {image.caption && (
                  <figcaption className={cn(
                    "p-card",
                    "bg-surface-elevated",
                    "border-t border-border-default"
                  )}>
                    <p className="text-sm text-text-secondary font-medium truncate">{image.caption}</p>
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center items-center gap-gap-card mt-gap-card">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={cn(
                "transition-all duration-standard",
                "rounded-full",
                index === activeIndex
                  ? "w-8 h-3 bg-brand-secondary" // Active: wide gold pill
                  : "size-3 bg-brand-primary/mid hover:bg-brand-primary/mid" // Inactive: small dot
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>

        {/* Image counter */}
        <div className="mt-gap-card text-center">
          <p className="text-sm text-text-muted">
            <span className="font-semibold text-brand-primary">{activeIndex + 1}</span>
            <span className="mx-gap-card">/</span>
            <span>{images.length}</span>
            <span className="mx-gap-card">•</span>
            <span className="text-brand-secondary">Use arrows or swipe to navigate</span>
          </p>
        </div>
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

export default GalleryCarousel;
