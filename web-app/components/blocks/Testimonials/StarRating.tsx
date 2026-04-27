import { FC } from 'react';
import { Star } from 'lucide-react';

import { cn } from '@/lib/utils/utils';
import type { StarRatingProps, StarSize } from '@/types/testimonial';

// Re-export types for backwards compatibility
export type { StarRatingProps, StarSize };

const sizeMap: Record<StarSize, string> = {
  sm: 'size-5',
  md: 'size-6',
  lg: 'size-7',
};

const TOTAL_STARS = 5;

export const StarRating: FC<StarRatingProps> = ({ rating, size = 'md', label, className }) => {
  const normalized = Math.min(Math.max(rating, 0), TOTAL_STARS);
  const accessibleLabel = label ?? `${normalized} out of ${TOTAL_STARS} stars`;

  return (
    <div
      role="img"
      aria-label={accessibleLabel}
      className={cn('flex items-center gap-gap-card text-brand-secondary', className)}
    >
      <span className="sr-only">{accessibleLabel}</span>
      {Array.from({ length: TOTAL_STARS }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = normalized >= starValue;
        const isHalf = !isFilled && normalized > starValue - 1 && normalized < starValue;

        return (
          <span key={starValue} className="relative inline-flex">
            <Star
              aria-hidden="true"
              className={cn(
                'text-brand-secondary',
                sizeMap[size],
                isFilled && 'fill-current'
              )}
            />
            {isHalf && (
              <span
                aria-hidden="true"
                className="absolute inset-0 overflow-hidden text-brand-secondary [clip-path:inset(0_50%_0_0)]"
              >
                <Star className={cn('fill-current', sizeMap[size])} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
