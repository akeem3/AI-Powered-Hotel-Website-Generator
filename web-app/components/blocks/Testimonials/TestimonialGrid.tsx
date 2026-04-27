import { FC } from 'react';

import { cn } from '@/lib/utils/utils';
import { testimonialsVariants } from '@/lib/cva-variants';
import type { Testimonial } from '@/types/testimonial';

import TestimonialCard from './TestimonialCard';

interface TestimonialGridProps {
  testimonials: Testimonial[];
  columns?: 2 | 3;
  showDate?: boolean;
  showLocation?: boolean;
  cardStyle?: 'default' | 'minimal' | 'elevated';
  className?: string;
}

export const TestimonialGrid: FC<TestimonialGridProps> = ({
  testimonials,
  columns = 3,
  showDate = true,
  showLocation = true,
  cardStyle = 'default',
  className,
}) => {
  // Enable scroll container when more than 9 testimonials
  const enableScroll = testimonials.length > 9;

  return (
    <div className={cn(
      testimonialsVariants({ layout: 'grid', columns, cardStyle }),
      enableScroll && [
        "max-h-scroll-container",
        "overflow-y-auto",
        "scroll-smooth",
        "pr-gap-card",
        "grid-scroll",
      ],
      className
    )}>
      {testimonials.map((testimonial) => (
        <TestimonialCard
          key={testimonial.id}
          testimonial={testimonial}
          showDate={showDate}
          showLocation={showLocation}
          className="h-full"
        />
      ))}
    </div>
  );
};

export default TestimonialGrid;
