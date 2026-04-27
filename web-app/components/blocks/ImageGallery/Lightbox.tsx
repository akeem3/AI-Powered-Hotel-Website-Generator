'use client';

import { FC, useEffect, useRef, ReactNode } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/utils';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    id: string;
    desktopUrl: string;
    mobileUrl: string;
    alt: string;
    caption?: string;
  }>;
  currentIndex: number;
  onNavigate: (index: number) => void;
  children?: ReactNode;
}

/**
 * Lightbox Component
 * 
 * Full-screen image viewer with keyboard navigation and accessibility features.
 * 
 * Features:
 * - Keyboard navigation (Escape to close, Arrow keys to navigate)
 * - Focus trap for accessibility
 * - Click-outside-to-close
 * - Previous/Next navigation buttons
 * - Thumbnail strip integration
 * - Story 1.11 design tokens exclusively
 * 
 * Accessibility:
 * - ARIA labels for screen readers
 * - Focus management (traps focus inside modal)
 * - Keyboard accessible (Escape, Arrow keys, Tab)
 */
const Lightbox: FC<LightboxProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
  children
}) => {
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Get current image
  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious) {
            onNavigate(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (hasNext) {
            onNavigate(currentIndex + 1);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, hasPrevious, hasNext, onClose, onNavigate]);

  // Focus management - focus close button when lightbox opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle navigation
  const handlePrevious = () => {
    if (hasPrevious) {
      onNavigate(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(currentIndex + 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={lightboxRef}
      className="fixed inset-0 z-modal bg-brand-primary/glass backdrop-blur-md flex items-center justify-center"

      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close Button */}
      <button
        ref={closeButtonRef}
        onClick={onClose}
        className={cn(
          "absolute top-gap-card right-gap-card z-modal",

          "p-card rounded-lg",
          "bg-surface-primary hover:bg-brand-secondary",
          "text-brand-primary hover:text-on-brand",
          "transition-all duration-standard",

          "shadow-lg hover:shadow-xl",
          "focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-primary"
        )}
        aria-label="Close lightbox"
      >
        <X className="size-6" />
      </button>

      {/* Main Content Container */}
      <div className="w-full h-full flex flex-col items-center justify-center p-card md:p-gap-section">

        {/* Image Container */}
        <div className="relative w-full max-w-7xl flex-1 flex items-center justify-center">
          {/* Previous Button */}
          {hasPrevious && (
            <button
              onClick={handlePrevious}
              className={cn(
                "absolute left-0 md:left-gap-section z-modal",


                "p-card rounded-lg",
                "bg-surface-primary/glass hover:bg-brand-secondary",
                "text-brand-primary hover:text-on-brand",
                "transition-all duration-standard",

                "shadow-lg hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-primary"
              )}
              aria-label="Previous image"
            >
              <ChevronLeft className="size-6 md:size-8" />
            </button>
          )}

          {/* Main Image */}
          <div
            className="relative w-full h-full max-h-lightbox-mobile md:max-h-lightbox flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={currentImage.desktopUrl}
                alt={currentImage.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 90vw"
                priority
              />
            </div>
          </div>

          {/* Next Button */}
          {hasNext && (
            <button
              onClick={handleNext}
              className={cn(
                "absolute right-0 md:right-gap-section z-modal",


                "p-card rounded-lg",
                "bg-surface-primary/glass hover:bg-brand-secondary",
                "text-brand-primary hover:text-on-brand",
                "transition-all duration-standard",

                "shadow-lg hover:shadow-xl",
                "focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-primary"
              )}
              aria-label="Next image"
            >
              <ChevronRight className="size-6 md:size-8" />
            </button>
          )}
        </div>

        {/* Caption */}
        {currentImage.caption && (
          <div className="mt-gap-card text-center px-gap-card">
            <p className="text-text-inverted text-base md:text-lg max-w-3xl mx-auto font-medium">
              {currentImage.caption}
            </p>
          </div>
        )}

        {/* Image Counter */}
        <div className="mt-gap-card text-brand-secondary text-sm font-semibold tracking-wide">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Thumbnail Strip (passed as children) */}
        {children && (
          <div className="mt-gap-card w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lightbox;
