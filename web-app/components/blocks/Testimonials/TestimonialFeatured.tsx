'use client';

import { FC, useState, useCallback } from 'react';

import { cn } from '@/lib/utils/utils';
import { testimonialsVariants } from '@/lib/cva-variants';
import type { Testimonial } from '@/types/testimonial';

import StarRating from './StarRating';

interface TestimonialFeaturedProps {
  testimonials: Testimonial[];
  showDate?: boolean;
  showLocation?: boolean;
  cardStyle?: 'default' | 'minimal' | 'elevated';
  className?: string;
}

export const TestimonialFeatured: FC<TestimonialFeaturedProps> = ({
  testimonials,
  showDate = true,
  showLocation = true,
  cardStyle = 'default',
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const featured = testimonials[currentIndex];

  if (!featured) {
    return null;
  }

  return (
    <section className={cn('w-full py-section', className)}>
      <div className="mx-auto max-w-7xl p-container">
        <div className={testimonialsVariants({ layout: 'featured', cardStyle })}>
          <article
            className={cn(
              'testimonial-card relative flex min-h-96 items-center overflow-hidden rounded-2xl p-card transition-all duration-standard ease-in-out',

              className
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/faint via-transparent to-brand-primary/wash" />
            
            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-gap-card top-1/2 -translate-y-1/2 z-sticky p-2 rounded-full bg-surface-primary/high text-brand-primary hover:bg-brand-primary hover:text-on-brand transition-all shadow-sm"

                  aria-label="Previous testimonial"
                >
                  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-gap-card top-1/2 -translate-y-1/2 z-sticky p-2 rounded-full bg-surface-primary/high text-brand-primary hover:bg-brand-primary hover:text-on-brand transition-all shadow-sm"

                  aria-label="Next testimonial"
                >
                  <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            <div className="relative z-elevated flex flex-col gap-gap-section md:flex-row md:items-center p-container">

              <div className="flex flex-col items-center gap-gap-card text-center md:w-1/3 shrink-0">
                {featured.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={featured.avatarUrl}
                    src={featured.avatarUrl}
                    alt={`${featured.customerName} avatar`}
                    className="size-20 rounded-full border-4 border-brand-primary/subtle object-cover animate-in fade-in zoom-in duration-standard"
                    loading="lazy"
                  />
                ) : (
                  <div 
                    key={featured.customerName}
                    className="flex size-20 items-center justify-center rounded-full border-4 border-brand-primary/subtle bg-brand-primary/wash text-size-body-large font-semibold text-brand-primary animate-in fade-in zoom-in duration-standard"
                  >
                    {featured.customerName
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-size-body-large font-bold text-text-primary animate-in fade-in slide-in-from-bottom-2 duration-standard delay-100">{featured.customerName}</p>
                  {featured.customerTitle && (
                    <p className="text-size-body text-text-secondary animate-in fade-in slide-in-from-bottom-2 duration-standard delay-150">{featured.customerTitle}</p>
                  )}
                </div>
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-standard delay-200">
                    <StarRating rating={featured.rating} size="lg" />
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <blockquote 
                    key={featured.id}
                    className="text-size-body font-medium leading-relaxed text-text-primary md:text-size-body-large animate-in fade-in slide-in-from-right-4 duration-standard"
                >
                  &ldquo;{featured.quote}&rdquo;
                </blockquote>
                {(showDate || showLocation) && (featured.date || featured.location) && (
                  <p className="mt-gap-section text-size-caption text-text-secondary animate-in fade-in slide-in-from-right-4 duration-standard delay-100">
                    {showDate && featured.date && <span>{featured.date}</span>}
                    {showDate && showLocation && featured.date && featured.location && (
                      <span aria-hidden="true" className="mx-gap-card">
                        •
                      </span>
                    )}
                    {showLocation && featured.location && <span>{featured.location}</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Indicators */}
            {testimonials.length > 1 && (
                <div className="absolute bottom-gap-card left-1/2 -translate-x-1/2 flex gap-gap-card z-sticky">

                {testimonials.map((_, idx) => (
                    <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                        "size-2 rounded-full transition-all",
                        idx === currentIndex ? "bg-brand-primary w-4" : "bg-brand-primary/subtle hover:bg-brand-primary/mid"

                    )}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    />
                ))}
                </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
};

export default TestimonialFeatured;
