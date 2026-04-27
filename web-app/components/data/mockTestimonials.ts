/**
 * Mock Testimonials Data
 *
 * Sample testimonial data for Testimonials component testing and development.
 * Includes 8 customer reviews from various traveler types.
 */

import type { Testimonial } from '@/types/testimonial';

export const mockTestimonials: Testimonial[] = [
  {
    id: 'testimonial-001',
    customerName: 'Sarah Johnson',
    customerTitle: 'Business Traveler',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    quote:
      'Exceptional service and perfect location for business meetings. The conference facilities are top-notch, and the staff went above and beyond to ensure our corporate event was a success. Highly recommend!',
    date: '2025-10-15',
    location: 'New York, NY',
  },
  {
    id: 'testimonial-002',
    customerName: 'Michael Chen',
    customerTitle: 'Leisure Traveler',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    quote:
      'The rooftop pool and bar exceeded all expectations. Stunning views, impeccable service, and the rooms are beautifully appointed. This is now my go-to hotel when visiting the city.',
    date: '2025-09-28',
    location: 'San Francisco, CA',
  },
  {
    id: 'testimonial-003',
    customerName: 'Emily Rodriguez',
    customerTitle: 'Family Vacation',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    rating: 4,
    quote:
      'Wonderful family-friendly hotel with spacious suites. The kids loved the pool, and we appreciated the connecting rooms. Staff was incredibly accommodating with our special requests. Will definitely return!',
    date: '2025-10-02',
    location: 'Miami, FL',
  },
  {
    id: 'testimonial-004',
    customerName: 'David Thompson',
    customerTitle: 'Weekend Getaway',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    rating: 5,
    quote:
      "Perfect romantic weekend escape. The spa treatments were divine, the restaurant's tasting menu was exceptional, and our suite had the most incredible city views. Worth every penny!",
    date: '2025-09-20',
    location: 'Chicago, IL',
  },
  {
    id: 'testimonial-005',
    customerName: 'Jennifer Park',
    customerTitle: 'Solo Traveler',
    avatarUrl: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    quote:
      'As a solo female traveler, I felt completely safe and welcomed. The concierge team provided excellent local recommendations, and the executive lounge was a great place to work and relax.',
    date: '2025-10-10',
    location: 'Seattle, WA',
  },
  {
    id: 'testimonial-006',
    customerName: 'Robert Williams',
    customerTitle: 'Business Traveler',
    avatarUrl: 'https://i.pravatar.cc/150?img=13',
    rating: 4,
    quote:
      'Excellent business hotel with reliable WiFi, comfortable workspaces, and a convenient location. The breakfast buffet was impressive, and the gym facilities helped me maintain my routine.',
    date: '2025-09-15',
    location: 'Boston, MA',
  },
  {
    id: 'testimonial-007',
    customerName: 'Amanda Foster',
    customerTitle: 'Anniversary Celebration',
    avatarUrl: 'https://i.pravatar.cc/150?img=10',
    rating: 5,
    quote:
      'Our 10th anniversary stay was absolutely magical. The hotel surprised us with champagne and chocolates, and the attention to detail throughout our stay was remarkable. Unforgettable experience!',
    date: '2025-10-05',
    location: 'Los Angeles, CA',
  },
  {
    id: 'testimonial-008',
    customerName: 'James Martinez',
    customerTitle: 'Extended Stay Guest',
    avatarUrl: 'https://i.pravatar.cc/150?img=14',
    rating: 5,
    quote:
      'Stayed for three weeks during a work project. The hotel felt like a home away from home. Housekeeping was excellent, the restaurant variety kept meals interesting, and the staff remembered my preferences.',
    date: '2025-09-01',
    location: 'Austin, TX',
  },
  {
    id: 'testimonial-009',
    customerName: 'Lisa Chang',
    customerTitle: 'Conference Attendee',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    rating: 4,
    quote: 'Great venue for our annual conference. The ballroom was well-equipped, catering was superb, and the staff handled our group of 200+ attendees flawlessly.',
    date: '2025-10-18',
    location: 'Denver, CO',
  },
  {
    id: 'testimonial-010',
    customerName: 'Thomas Wright',
    customerTitle: 'Leisure Traveler',
    avatarUrl: 'https://i.pravatar.cc/150?img=16',
    rating: 5,
    quote: 'The attention to detail is outstanding. From the turndown service to the personalized welcome note, every moment felt special. Truly a five-star experience.',
    date: '2025-10-12',
    location: 'Phoenix, AZ',
  },
];

// Export testimonials by rating for testing
export const fiveStarTestimonials = mockTestimonials.filter((t) => t.rating === 5);
export const fourStarTestimonials = mockTestimonials.filter((t) => t.rating === 4);
