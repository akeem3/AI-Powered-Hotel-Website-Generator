import React from 'react';
import { cn } from '@/lib/utils/utils';

interface HeroSkeletonProps {
  variant?: {
    layout?: 'centered' | 'split' | 'fullscreen';
    overlay?: 'none' | 'light' | 'dark' | 'gradient';
  };
  className?: string;
}

/**
 * Skeleton component for HeroSection.
 *
 * Matches the HeroSection layout structure:
 * - Full-width section with overlay
 * - Text content area (tagline, title, headline, description, CTAs)
 * - Optional right-side image (for split layout)
 * - Uses shimmer animation
 */
export function HeroSkeleton({ variant, className }: HeroSkeletonProps) {
  const layout = variant?.layout ?? 'split';
  const overlay = variant?.overlay ?? 'gradient';
  const isSplit = layout === 'split';
  const isCentered = layout === 'centered';

  return (
    <section
      className={cn(
        'relative w-full min-h-[500px] lg:min-h-[600px]',
        'rounded-none overflow-hidden',
        className
      )}
      aria-busy="true"
      aria-label="Loading hero content"
    >
      {/* Background skeleton with overlay */}
      <div className="absolute inset-0 bg-surface-secondary">
        {/* Overlay effect matching variant */}
        {overlay === 'dark' && (
          <div className="absolute inset-0 bg-brand-primary/mid" />
        )}
        {overlay === 'light' && (
          <div className="absolute inset-0 bg-brand-primary/soft" />
        )}
        {overlay === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/high to-transparent" />
        )}
      </div>

      {/* Content container */}
      <div
        className={cn(
          'relative z-elevated max-w-screen-xl mx-auto',

          'flex flex-col',
          isSplit ? 'lg:flex-row items-center justify-between' : 'items-center justify-center',
          'h-full py-hero px-container',
          'text-center lg:text-left gap-container'
        )}
      >
        {/* Text content area */}
        <div
          className={cn(
            'w-full space-y-4 sm:space-y-6',
            isSplit ? 'lg:w-1/2' : 'lg:w-2/3 max-w-4xl'
          )}
        >
          {/* Tagline skeleton */}
          <div className="h-4 w-32 bg-surface-muted/60 rounded animate-pulse mx-auto lg:mx-0" />

          {/* Title skeleton */}
          <div className="h-10 sm:h-12 w-3/4 bg-surface-muted/60 rounded animate-pulse mx-auto lg:mx-0" />

          {/* Headline skeleton */}
          <div className="h-12 sm:h-14 xl:h-16 w-full bg-surface-muted/60 rounded animate-pulse mx-auto lg:mx-0" />

          {/* Description skeleton (optional) */}
          <div className="h-6 w-full max-w-2xl bg-surface-muted/40 rounded animate-pulse mx-auto lg:mx-0 hidden sm:block" />

          {/* CTA buttons skeleton */}
          <div className="mt-gap-section flex flex-col sm:flex-row gap-gap-card mx-auto lg:mx-0">
            <div className="h-12 w-32 bg-surface-muted/60 rounded-lg animate-pulse" />
            <div className="h-12 w-32 bg-surface-muted/40 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Right side image skeleton (only for split layout) */}
        {isSplit && (
          <div className="hidden lg:flex lg:w-1/2 justify-end">
            <div className="relative w-hero-asset-sm sm:w-hero-asset-md lg:w-hero-asset-lg aspect-4/3 bg-surface-secondary/soft rounded-2xl animate-pulse" />
          </div>
        )}
      </div>
    </section>
  );
}
