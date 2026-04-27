import React from 'react';
import { cn } from '@/lib/utils/utils';

interface ButtonSkeletonProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Skeleton component for buttons.
 * Matches common button dimensions in the project.
 */
export function ButtonSkeleton({
  size = 'md',
  className,
}: ButtonSkeletonProps) {
  const sizeClasses = {
    sm: 'h-9 w-24',
    md: 'h-11 w-32',
    lg: 'h-14 w-40',
  };

  return (
    <div
      className={cn(
        'bg-surface-tertiary animate-pulse rounded-md',
        sizeClasses[size],
        className
      )}
      aria-hidden="true"
    />
  );
}
