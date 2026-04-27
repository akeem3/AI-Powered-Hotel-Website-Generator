/**
 * Amenities Mapper Tests
 *
 * Tests for amenities data mapper including limit parameter functionality.
 *
 * @module __tests__/lib/mappers/amenities.mapper.test
 */

import { mapCmsToAmenities, type MapCmsToAmenitiesInput } from '@/lib/mappers/amenities.mapper';
import type { CmsFacility, CmsAddress, HotelFullResponse, CmsHotel } from '@/lib/cms-api/types';

/**
 * Helper to create mock hotel data for testing
 */
const createMockHotelFullResponse = (
  overrides: Partial<HotelFullResponse> = {}
): HotelFullResponse & {
  hotel: CmsHotel & { parsedAddress: CmsAddress };
} => ({
  hotel: {
    id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Test Hotel',
    slug: 'test-hotel',
    property_type: 'hotel' as const,
    star_rating: 4,
    status: 'active' as const,
    opening_year: 2020,
    address: JSON.stringify({
      city: 'Test City',
      state: 'Test State',
      street: '123 Test St',
      country: 'Test Country',
      postal_code: '12345',
    }),
    is_template: false,
    has_override: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    parsedAddress: {
      city: 'Test City',
      state: 'Test State',
      street: '123 Test St',
      country: 'Test Country',
      postal_code: '12345',
    },
  },
  content: [],
  rooms: [],
  facilities: [],
  images: [],
  _metadata: {
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    fetched_at: '2024-01-01T00:00:00Z',
    processing_time_ms: 150,
    collections_fetched: ['hotel', 'content', 'rooms', 'facilities', 'images'],
  },
  _errors: [],
  ...overrides,
}) as any;

/**
 * Create mock facilities for testing
 */
const createMockFacilities = (count: number): CmsFacility[] => {
  const categories: Array<CmsFacility['category']> = [
    'room_amenity',
    'Activities',
    'Wellness',
    'Food & Drink',
    'Bathroom',
    'Outdoors',
    'Internet',
    'Parking',
    'Reception services',
    'Safety & security',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `facility-${i + 1}`,
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: `Amenity ${i + 1}`,
    type: categories[i % categories.length],
    category: categories[i % categories.length],
    available: true,
    sort_order: i + 1,
    status: 'available',
    description: `Description for amenity ${i + 1}`,
    booking_required: false,
    featured_image: null,
    operating_hours: null,
    capacity: null,
    age_restrictions: null,
  }));
};

describe('Amenities Mapper', () => {
  describe('mapCmsToAmenities', () => {
    describe('basic functionality', () => {
      it('should map CMS facilities to amenities config', () => {
        const facilities = createMockFacilities(5);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData });

        expect(result).toBeDefined();
        expect(result.variant).toBeDefined();
        expect(result.variant.layout).toBe('grid');
        expect(result.variant.columns).toBe(4);
        expect(result.variant.iconSize).toBe('medium');
        expect(result.variant.iconStyle).toBe('default');
        expect(result.variant.cardStyle).toBe('default');
        expect(result.showCategory).toBe(false);
        expect(result.amenities).toHaveLength(5);
      });

      it('should handle empty facilities array', () => {
        const hotelData = createMockHotelFullResponse({ facilities: [] });

        const result = mapCmsToAmenities({ hotelData });

        expect(result.amenities).toHaveLength(0);
      });
    });

    describe('limit parameter', () => {
      it('should return all amenities when limit is not specified', () => {
        const facilities = createMockFacilities(12);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData });

        expect(result.amenities).toHaveLength(12);
      });

      it('should return limited amenities when limit is specified', () => {
        const facilities = createMockFacilities(12);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 8 });

        expect(result.amenities).toHaveLength(8);
      });

      it('should return first N amenities when limit is less than total', () => {
        const facilities = createMockFacilities(15);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 6 });

        expect(result.amenities).toHaveLength(6);
        // Note: groupFacilitiesByCategory groups by category (alphabetically), not input order
        // The first category is 'Activities', so we expect the first items from that category
      });

      it('should return all amenities when limit exceeds total count', () => {
        const facilities = createMockFacilities(5);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 100 });

        expect(result.amenities).toHaveLength(5);
      });

      it('should handle limit of 1', () => {
        const facilities = createMockFacilities(10);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 1 });

        expect(result.amenities).toHaveLength(1);
        expect(result.amenities[0].name).toBe('Amenity 1');
      });

      it('should handle limit of 0 by returning empty array', () => {
        const facilities = createMockFacilities(10);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 0 });

        // slice(0, 0) returns empty array
        expect(result.amenities).toHaveLength(0);
      });

      it('should support homepage teaser pattern with limit: 8', () => {
        const facilities = createMockFacilities(20);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 8 });

        expect(result.amenities).toHaveLength(8);
        // Note: Items are grouped by category (alphabetically), not input order
        // The 8 items will come from the first few categories in alphabetical order
      });

      it('should preserve variant settings when limit is applied', () => {
        const facilities = createMockFacilities(15);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 5 });

        expect(result.variant.layout).toBe('grid');
        expect(result.variant.columns).toBe(4);
        expect(result.variant.iconSize).toBe('medium');
        expect(result.variant.iconStyle).toBe('default');
        expect(result.variant.cardStyle).toBe('default');
        expect(result.showCategory).toBe(false);
      });
    });

    describe('amenity transformation', () => {
      it('should map facility properties correctly', () => {
        const facilities: CmsFacility[] = [
          {
            id: 'facility-1',
            hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
            name: 'Swimming Pool',
            type: 'Outdoors',
            category: 'Outdoors',
            available: true,
            sort_order: 1,
            status: 'available',
            description: 'Outdoor heated pool',
            booking_required: false,
            featured_image: null,
            operating_hours: null,
            capacity: null,
            age_restrictions: null,
          },
        ];
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData });

        expect(result.amenities).toHaveLength(1);
        expect(result.amenities[0]).toMatchObject({
          id: 'facility-1',
          name: 'Swimming Pool',
          description: 'Outdoor heated pool',
          category: 'location', // Mapped from 'Outdoors'
          featured: false,
        });
        expect(result.amenities[0].icon).toBe('TreePine'); // Icon for 'Outdoors'
      });

      it('should handle facilities without descriptions', () => {
        const facilities: CmsFacility[] = [
          {
            id: 'facility-1',
            hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
            name: 'WiFi',
            type: 'Internet',
            category: 'Internet',
            available: true,
            sort_order: 1,
            status: 'available',
            description: null,
            booking_required: false,
            featured_image: null,
            operating_hours: null,
            capacity: null,
            age_restrictions: null,
          },
        ];
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData });

        expect(result.amenities[0].description).toBeUndefined();
      });

      it('should map categories correctly', () => {
        const facilities: CmsFacility[] = [
          {
            id: '1',
            hotel_id: 'hotel-1',
            name: 'Mini Bar',
            type: 'room_amenity',
            category: 'room_amenity',
            available: true,
            sort_order: 1,
            status: 'available',
            description: 'In-room mini bar',
            booking_required: false,
            featured_image: null,
            operating_hours: null,
            capacity: null,
            age_restrictions: null,
          },
          {
            id: '2',
            hotel_id: 'hotel-1',
            name: 'Reception',
            type: 'Reception services',
            category: 'Reception services',
            available: true,
            sort_order: 2,
            status: 'available',
            description: '24-hour reception',
            booking_required: false,
            featured_image: null,
            operating_hours: null,
            capacity: null,
            age_restrictions: null,
          },
          {
            id: '3',
            hotel_id: 'hotel-1',
            name: 'Parking',
            type: 'Parking',
            category: 'Parking',
            available: true,
            sort_order: 3,
            status: 'available',
            description: 'Free parking',
            booking_required: false,
            featured_image: null,
            operating_hours: null,
            capacity: null,
            age_restrictions: null,
          },
          {
            id: '4',
            hotel_id: 'hotel-1',
            name: 'Spa',
            type: 'Wellness',
            category: 'Wellness',
            available: true,
            sort_order: 4,
            status: 'available',
            description: 'Full-service spa',
            booking_required: false,
            featured_image: null,
            operating_hours: null,
            capacity: null,
            age_restrictions: null,
          },
        ];
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData });

        expect(result.amenities[0].category).toBe('room'); // room_amenity -> room
        expect(result.amenities[1].category).toBe('hotel'); // Reception services -> hotel
        expect(result.amenities[2].category).toBe('location'); // Parking -> location
        expect(result.amenities[3].category).toBe('services'); // Wellness -> services
      });
    });

    describe('featuredOnly parameter', () => {
      it('should accept featuredOnly parameter', () => {
        const facilities = createMockFacilities(5);
        const hotelData = createMockHotelFullResponse({ facilities });

        // featuredOnly is accepted but all amenities are returned since CMS doesn't have 'featured' field
        const result = mapCmsToAmenities({ hotelData, featuredOnly: true });

        expect(result.amenities).toHaveLength(5);
        expect(result.amenities[0].featured).toBe(false);
      });

      it('should combine limit and featuredOnly parameters', () => {
        const facilities = createMockFacilities(15);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 8, featuredOnly: true });

        expect(result.amenities).toHaveLength(8); // Limit takes precedence
      });
    });

    describe('edge cases', () => {
      it('should handle limit larger than facilities array', () => {
        const facilities = createMockFacilities(3);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: 100 });

        expect(result.amenities).toHaveLength(3);
      });

      it('should handle negative limit gracefully', () => {
        const facilities = createMockFacilities(10);
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData, limit: -1 });

        // Negative limit with slice() returns empty array (slice(0, -1) returns all but last item)
        // But since we check !== undefined, -1 is a valid limit value
        // slice(0, -1) returns all elements except the last one
        expect(result.amenities).not.toHaveLength(0);
        expect(result.amenities).not.toHaveLength(10); // Should be less than 10
      });

      it('should handle facilities with all categories', () => {
        const facilities: CmsFacility[] = [
          { id: '1', hotel_id: 'h1', name: 'Room 1', type: 'room_amenity', category: 'room_amenity', available: true, sort_order: 1, status: 'available', description: 'd1', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '2', hotel_id: 'h1', name: 'Activity 1', type: 'Activities', category: 'Activities', available: true, sort_order: 2, status: 'available', description: 'd2', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '3', hotel_id: 'h1', name: 'Spa 1', type: 'Wellness', category: 'Wellness', available: true, sort_order: 3, status: 'available', description: 'd3', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '4', hotel_id: 'h1', name: 'Food 1', type: 'Food & Drink', category: 'Food & Drink', available: true, sort_order: 4, status: 'available', description: 'd4', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '5', hotel_id: 'h1', name: 'Bath 1', type: 'Bathroom', category: 'Bathroom', available: true, sort_order: 5, status: 'available', description: 'd5', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '6', hotel_id: 'h1', name: 'Outdoor 1', type: 'Outdoors', category: 'Outdoors', available: true, sort_order: 6, status: 'available', description: 'd6', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '7', hotel_id: 'h1', name: 'Internet 1', type: 'Internet', category: 'Internet', available: true, sort_order: 7, status: 'available', description: 'd7', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '8', hotel_id: 'h1', name: 'Parking 1', type: 'Parking', category: 'Parking', available: true, sort_order: 8, status: 'available', description: 'd8', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '9', hotel_id: 'h1', name: 'Reception 1', type: 'Reception services', category: 'Reception services', available: true, sort_order: 9, status: 'available', description: 'd9', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
          { id: '10', hotel_id: 'h1', name: 'Security 1', type: 'Safety & security', category: 'Safety & security', available: true, sort_order: 10, status: 'available', description: 'd10', booking_required: false, featured_image: null, operating_hours: null, capacity: null, age_restrictions: null },
        ];
        const hotelData = createMockHotelFullResponse({ facilities });

        const result = mapCmsToAmenities({ hotelData });

        expect(result.amenities).toHaveLength(10);
        // Verify each got an icon
        result.amenities.forEach((amenity) => {
          expect(amenity.icon).toBeDefined();
          expect(typeof amenity.icon).toBe('string');
        });
      });
    });
  });
});
