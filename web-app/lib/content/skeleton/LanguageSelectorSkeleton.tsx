/**
 * LanguageSelectorSkeleton Component
 *
 * Loading skeleton for the LanguageSelector component.
 * Displays placeholder UI while language options are being loaded.
 *
 * @module lib/content/skeleton
 */

import React from 'react';
import { cn } from '@/lib/utils/utils';

interface LanguageSelectorSkeletonProps {
  /** Number of language options to show */
  count?: number;
  /** Display style */
  style?: 'dropdown' | 'list' | 'inline';
  /** Additional className */
  className?: string;
}

/**
 * LanguageSelectorSkeleton Component
 *
 * Displays a loading skeleton matching the LanguageSelector structure.
 *
 * @component
 */
export function LanguageSelectorSkeleton({
  count = 3,
  style = 'inline',
  className,
}: LanguageSelectorSkeletonProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-gap-card animate-pulse',
        className
      )}
      aria-busy="true"
      aria-label="Loading language selector"
    >
      {/* Label skeleton */}
      <div className="h-4 w-16 bg-surface-secondary/60 rounded hidden sm:block" />

      {/* Language options skeletons */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-8 w-20 bg-surface-secondary rounded"
          aria-hidden="true"
        />
      ))}

      {/* Current language skeleton */}
      <div className="h-8 px-4 bg-brand-secondary/20 rounded flex items-center gap-2">
        <div className="h-4 w-4 bg-brand-secondary/40 rounded" />
      </div>
    </div>
  );
}

export default LanguageSelectorSkeleton;
