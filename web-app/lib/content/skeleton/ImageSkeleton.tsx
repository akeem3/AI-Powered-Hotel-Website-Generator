import React from 'react';
import { cn } from '@/lib/utils/utils';

interface ImageSkeletonProps {
  aspectRatio?: string;
  className?: string;
  blurhash?: string;
}

/**
 * Skeleton component for images.
 * Supports aspect ratio and can display a blurhash placeholder if provided.
 */
export function ImageSkeleton({
  aspectRatio = 'aspect-video',
  className,
  blurhash,
}: ImageSkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-tertiary animate-pulse rounded-lg',
        aspectRatio,
        className
      )}
      aria-hidden="true"
    >
      {/* If blurhash was provided, we could theoretically render it here, 
          but for a pure CSS skeleton, we use a gradient or pulsing color. 
          The blurhash implementation usually requires a canvas or specific library.
      */}
      {blurhash && (
        <div 
          className="absolute inset-0 opacity-20 bg-brand-primary/10"
          title="Loading with blurhash placeholder"
        />
      )}
      
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    </div>
  );
}
