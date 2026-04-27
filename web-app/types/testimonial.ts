/**
 * Testimonial Component Types
 * 
 * Centralized type definitions for all testimonial-related components.
 * Used across Testimonials, TestimonialCard, TestimonialGrid, TestimonialCarousel, 
 * TestimonialFeatured, and StarRating components.
 */

// ============================================================================
// Core Data Types
// ============================================================================

export interface Testimonial {
  id: string;
  customerName: string;
  customerTitle?: string;
  avatarUrl?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  date?: string;
  location?: string;
}

// ============================================================================
// Star Rating Types
// ============================================================================

export type StarSize = 'sm' | 'md' | 'lg';

export interface StarRatingProps {
  rating: number;
  size?: StarSize;
  label?: string;
  className?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface TestimonialCardProps {
  testimonial: Testimonial;
  showDate?: boolean;
  showLocation?: boolean;
  className?: string;
}

export interface TestimonialGridProps {
  testimonials: Testimonial[];
  columns?: 2 | 3;
  showDate?: boolean;
  showLocation?: boolean;
  cardStyle?: 'default' | 'minimal' | 'elevated';
  className?: string;
}

export interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  className?: string;
  autoplay?: boolean;
  autoplayInterval?: number;
}

export interface TestimonialFeaturedProps {
  testimonials: Testimonial[];
  showDate?: boolean;
  showLocation?: boolean;
  className?: string;
}

export type TestimonialLayout = 'carousel' | 'grid' | 'featured';

export interface TestimonialsProps {
  testimonials: Testimonial[];
  layout?: TestimonialLayout;
  columns?: 2 | 3;
  showDate?: boolean;
  showLocation?: boolean;
  className?: string;
}

