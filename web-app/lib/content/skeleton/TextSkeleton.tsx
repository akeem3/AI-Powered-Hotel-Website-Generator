import React from 'react';
import { cn } from '@/lib/utils/utils';

interface TextSkeletonProps {
  lines?: number;
  width?: 'full' | 'medium' | 'short';
  className?: string;
}

/**
 * Skeleton component for body text.
 * Generates multiple lines of pulsing placeholders.
 */
export function TextSkeleton({
  lines = 3,
  width = 'full',
  className,
}: TextSkeletonProps) {
  const widthClasses = {
    full: 'w-full',
    medium: 'w-2/3',
    short: 'w-1/3',
  };

  return (
    <div className={cn('space-y-3 py-1', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 bg-surface-tertiary animate-pulse rounded',
            i === lines - 1 && lines > 1 ? 'w-4/5' : widthClasses[width]
          )}
        />
      ))}
    </div>
  );
}
