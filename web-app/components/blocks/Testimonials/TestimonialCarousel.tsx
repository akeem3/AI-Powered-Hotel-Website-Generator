'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils/utils';
import { testimonialsVariants } from '@/lib/cva-variants';
import type { Testimonial } from '@/types/testimonial';

import TestimonialCard from './TestimonialCard';

const AUTOPLAY_INTERVAL = 8000;

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  className?: string;
  autoplay?: boolean;
  autoplayInterval?: number;
  cardStyle?: 'default' | 'minimal' | 'elevated';
}

export const TestimonialCarousel: FC<TestimonialCarouselProps> = ({
  testimonials,
  className,
  autoplay = false,
  autoplayInterval = AUTOPLAY_INTERVAL,
  cardStyle = 'default',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cache for child dimensions to avoid layout thrashing during scroll
  const childrenDimsRef = useRef<Array<{ center: number }>>([]);
  const tickingRef = useRef(false);

  const total = testimonials.length;

  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const child = container.children[index] as HTMLElement | undefined;
    if (child) {
      // Scroll to center the selected item
      const containerWidth = container.clientWidth;
      const childWidth = child.clientWidth;
      const scrollLeft = child.offsetLeft - (containerWidth - childWidth) / 2;
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, []);

  const updateIndex = useCallback(
    (nextIndex: number) => {
      const normalized = (nextIndex + total) % total;
      setActiveIndex(normalized);
      scrollToIndex(normalized);
    },
    [scrollToIndex, total]
  );

  const handlePrev = useCallback(() => updateIndex(activeIndex - 1), [activeIndex, updateIndex]);
  const handleNext = useCallback(() => updateIndex(activeIndex + 1), [activeIndex, updateIndex]);

  useEffect(() => {
    if (!autoplay || total <= 1) {
      return;
    }
    const timer = setInterval(() => {
      updateIndex(activeIndex + 1);
    }, autoplayInterval);
    return () => clearInterval(timer);
  }, [activeIndex, autoplay, autoplayInterval, total, updateIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Update cached dimensions on mount and resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateChildrenDims = () => {
      childrenDimsRef.current = Array.from(container.children).map((child) => {
        const childElement = child as HTMLElement;
        return {
          center: childElement.offsetLeft + childElement.clientWidth / 2,
        };
      });
    };

    updateChildrenDims();

    // Use ResizeObserver to keep dimensions updated
    const resizeObserver = new ResizeObserver(() => {
      updateChildrenDims();
    });

    // Observe container and all children
    resizeObserver.observe(container);
    Array.from(container.children).forEach(child => resizeObserver.observe(child));

    return () => resizeObserver.disconnect();
  }, [testimonials]); // Re-run if testimonials list changes

  // Handle manual scroll to update active index
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container || tickingRef.current) return;

    tickingRef.current = true;

    requestAnimationFrame(() => {
      if (!containerRef.current) {
        tickingRef.current = false;
        return;
      }

      const center = containerRef.current.scrollLeft + containerRef.current.clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;

      // Use cached dimensions instead of reading from DOM
      const dims = childrenDimsRef.current;
      
      for (let i = 0; i < dims.length; i++) {
        const distance = Math.abs(center - dims[i].center);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }

      setActiveIndex((prevIndex) => {
        if (closestIndex !== prevIndex) {
          return closestIndex;
        }
        return prevIndex;
      });

      tickingRef.current = false;
    });
  }, []);

  return (
    <div className={cn(
      testimonialsVariants({ layout: 'carousel', cardStyle }),
      'relative py-gap-section',
      className
    )}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory gap-gap-card overflow-x-auto scroll-smooth focus:outline-none scrollbar-hide p-container pb-gap-section pt-gap-card [scrollbar-width:none] [-ms-overflow-style:none]"
        tabIndex={0}
        aria-live="polite"
      >
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className={cn(
              "w-testimonial-card-sm md:w-testimonial-card-md lg:w-testimonial-card-lg snap-center shrink-0 transition-opacity duration-standard",
              index === activeIndex ? "opacity-100" : "opacity-high hover:opacity-100"
            )}
            aria-hidden={index !== activeIndex}
          >
            <TestimonialCard testimonial={testimonial} showDate={true} showLocation={true} />
          </div>
        ))}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous testimonial"
            className="absolute left-0 md:left-gap-section top-1/2 -translate-y-1/2 z-sticky rounded-full bg-surface-primary border border-brand-secondary/subtle text-brand-primary shadow-lg hover:shadow-xl hover:bg-brand-primary hover:text-on-brand transition-all p-3 focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 hidden md:flex items-center justify-center"

          >
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next testimonial"
            className="absolute right-0 md:right-gap-section top-1/2 -translate-y-1/2 z-sticky rounded-full bg-surface-primary border border-brand-secondary/subtle text-brand-primary shadow-lg hover:shadow-xl hover:bg-brand-primary hover:text-on-brand transition-all p-3 focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:ring-offset-2 hidden md:flex items-center justify-center"

          >
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-gap-card flex items-center justify-center gap-gap-card">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                type="button"
                onClick={() => updateIndex(index)}
                className={cn(
                  'h-2 rounded-full transition-all duration-standard',
                  index === activeIndex
                    ? 'w-8 bg-brand-secondary'
                    : 'w-2 bg-brand-secondary/mid hover:bg-brand-secondary/mid'
                )}
                aria-label={`Show testimonial ${index + 1} of ${total}`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TestimonialCarousel;
