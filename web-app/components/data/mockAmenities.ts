/**
 * Mock Amenities Data
 *
 * Sample amenity data for Amenities component testing and development.
 * Includes 20 amenities across 4 categories with Font Awesome icons.
 */

import type { Amenity } from '@/types/amenity';

export const mockAmenities: Amenity[] = [
  // Room Amenities
  {
    id: 'amenity-001',
    name: 'High-Speed WiFi',
    description: 'Complimentary fiber-optic internet throughout',
    icon: 'Wifi',
    category: 'room',
    featured: true,
  },
  {
    id: 'amenity-002',
    name: 'Smart TV',
    description: '55-inch 4K TV with streaming services',
    icon: 'Tv',
    category: 'room',
    featured: false,
  },
  {
    id: 'amenity-003',
    name: 'Premium Bedding',
    description: 'Luxury linens and pillow menu',
    icon: 'BedDouble',
    category: 'room',
    featured: true,
  },
  {
    id: 'amenity-004',
    name: 'Mini Bar',
    description: 'Stocked with premium beverages and snacks',
    icon: 'Wine',
    category: 'room',
    featured: false,
  },
  {
    id: 'amenity-005',
    name: 'Coffee Maker',
    description: 'Nespresso machine with complimentary pods',
    icon: 'Coffee',
    category: 'room',
    featured: false,
  },

  // Hotel Amenities
  {
    id: 'amenity-006',
    name: 'Rooftop Pool',
    description: 'Infinity pool with panoramic city views',
    icon: 'Waves',
    category: 'hotel',
    featured: true,
  },
  {
    id: 'amenity-007',
    name: 'Fitness Center',
    description: '24-hour gym with state-of-the-art equipment',
    icon: 'Dumbbell',
    category: 'hotel',
    featured: true,
  },
  {
    id: 'amenity-008',
    name: 'Full-Service Spa',
    description: 'Luxury spa with massage and treatments',
    icon: 'Sparkles',
    category: 'hotel',
    featured: true,
  },
  {
    id: 'amenity-009',
    name: 'Fine Dining',
    description: 'Award-winning restaurant and bar',
    icon: 'Utensils',
    category: 'hotel',
    featured: false,
  },
  {
    id: 'amenity-010',
    name: 'Business Center',
    description: 'Meeting rooms and conference facilities',
    icon: 'Briefcase',
    category: 'hotel',
    featured: false,
  },
  {
    id: 'amenity-011',
    name: 'Concierge Service',
    description: '24/7 personalized assistance',
    icon: 'Bell',
    category: 'hotel',
    featured: false,
  },

  // Location Amenities
  {
    id: 'amenity-012',
    name: 'Downtown Location',
    description: 'Walking distance to major attractions',
    icon: 'MapPin',
    category: 'location',
    featured: true,
  },
  {
    id: 'amenity-013',
    name: 'Airport Shuttle',
    description: 'Complimentary shuttle service',
    icon: 'Bus',
    category: 'location',
    featured: false,
  },
  {
    id: 'amenity-014',
    name: 'Valet Parking',
    description: 'Secure valet parking available',
    icon: 'Car',
    category: 'location',
    featured: false,
  },
  {
    id: 'amenity-015',
    name: 'Near Public Transit',
    description: 'Metro station within 2 blocks',
    icon: 'Train',
    category: 'location',
    featured: false,
  },

  // Service Amenities
  {
    id: 'amenity-016',
    name: '24-Hour Room Service',
    description: 'Full menu available anytime',
    icon: 'UtensilsCrossed',
    category: 'services',
    featured: false,
  },
  {
    id: 'amenity-017',
    name: 'Laundry Service',
    description: 'Same-day dry cleaning and pressing',
    icon: 'Shirt',
    category: 'services',
    featured: false,
  },
  {
    id: 'amenity-018',
    name: 'Pet Friendly',
    description: 'Pets welcome with special amenities',
    icon: 'Dog',
    category: 'services',
    featured: false,
  },
  {
    id: 'amenity-019',
    name: 'Multilingual Staff',
    description: 'Staff fluent in 8+ languages',
    icon: 'Languages',
    category: 'services',
    featured: false,
  },
  {
    id: 'amenity-020',
    name: 'Electric Vehicle Charging',
    description: 'Tesla and universal EV chargers',
    icon: 'Zap',
    category: 'services',
    featured: false,
  },
];

// Export amenities by category for testing
export const roomAmenities = mockAmenities.filter((a) => a.category === 'room');
export const hotelAmenities = mockAmenities.filter((a) => a.category === 'hotel');
export const locationAmenities = mockAmenities.filter((a) => a.category === 'location');
export const serviceAmenities = mockAmenities.filter((a) => a.category === 'services');
export const featuredAmenities = mockAmenities.filter((a) => a.featured);
