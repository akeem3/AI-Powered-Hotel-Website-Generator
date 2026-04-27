import React from 'react';
import { cn } from '@/lib/utils/utils';

interface HeadingSkeletonProps {
  level: 1 | 2 | 3 | 4;
  className?: string;
}

/**
 * Skeleton component for headings.
 * Sized appropriately for different heading levels.
 */
export function HeadingSkeleton({
  level,
  className,
}: HeadingSkeletonProps) {
  const sizeClasses = {
    1: 'h-12 w-3/4 mb-gap-section',
    2: 'h-9 w-1/2 mb-card',
    3: 'h-7 w-1/3 mb-card',
    4: 'h-6 w-1/4 mb-card',
  };

  return (
    <div
      className={cn(
        'bg-surface-tertiary animate-pulse rounded',
        sizeClasses[level],
        className
      )}
      aria-hidden="true"
    />
  );
}
