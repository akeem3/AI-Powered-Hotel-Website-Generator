import Image from 'next/image';
import { FC } from 'react';

import { cn } from '@/lib/utils/utils';
import type { Testimonial, TestimonialCardProps } from '@/types/testimonial';

import StarRating from './StarRating';

// Re-export Testimonial for backwards compatibility
export type { Testimonial };

const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

export const TestimonialCard: FC<TestimonialCardProps> = ({
  testimonial,
  showDate = true,
  showLocation = true,
  className,
}) => {
  const { customerName, customerTitle, avatarUrl, rating, quote, date, location } = testimonial;
  const initials = getInitials(customerName);

  return (
    <article
      className={cn(
        'testimonial-card flex min-h-card-min flex-col gap-gap-card rounded-2xl p-card transition-all duration-standard hover:-translate-y-1',
        className,
      )}
    >
      <div className="flex items-start gap-gap-card">
        {avatarUrl ? (
          <div className="relative size-avatar overflow-hidden rounded-full border border-border-default shadow-sm shrink-0">
            <Image
              src={avatarUrl}
              alt={`${customerName} avatar`}
              fill
              sizes="48px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex size-avatar shrink-0 items-center justify-center rounded-full bg-brand-primary/wash text-size-caption font-semibold text-brand-primary border border-brand-primary/wash">
            {initials}
          </div>
        )}

        <div className="flex flex-1 flex-col gap-gap-card min-w-0">
          <div>
            <p className="text-size-body font-display text-text-primary truncate">
              {customerName}
            </p>
            {customerTitle && (
              <p className="text-size-caption text-text-secondary truncate">{customerTitle}</p>
            )}
          </div>
          <StarRating rating={rating} size="sm" />
        </div>
      </div>

      <blockquote className="flex-1 text-size-caption text-text-primary italic font-medium leading-relaxed relative">
        <span
          className="text-brand-secondary/subtle text-size-h1 absolute -top-gap-card -left-gap-card select-none"
          aria-hidden="true"
        >
          "
        </span>
        <p className="relative z-elevated pl-inline whitespace-normal wrap-break">
          &ldquo;{quote}&rdquo;
        </p>
      </blockquote>

      {(showDate || showLocation) && (date || location) && (
        <footer className="pt-gap-card mt-auto border-t border-border-default/mid text-size-caption text-text-secondary font-medium">
          <p className="flex flex-wrap gap-gap-card items-center">
            {showDate && date && <span>{date}</span>}
            {showLocation && location && (
              <>
                {showDate && date && (
                  <span className="size-dot rounded-full bg-brand-secondary/mid" aria-hidden="true" />
                )}
                <span>{location}</span>
              </>
            )}
          </p>
        </footer>
      )}
    </article>
  );
};

export default TestimonialCard;
