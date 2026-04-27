/**
 * Room Slug Generation Utilities Tests
 *
 * @module __tests__/lib/loaders/room-slug.test
 */

import {
  generateRoomSlug,
  generateRoomSlugs,
  getAvailableRoomSlugs,
  findRoomBySlug,
  testSlugGeneration,
  validateSlugFormat,
  type RoomSlugInfo,
} from '@/lib/loaders/room-slug';
import type { CmsRoom } from '@/lib/cms-api/types';

// Mock the CMS API client
jest.mock('@/lib/cms-api/client', () => ({
  getHotelFull: jest.fn(),
}));

// Mock the transformers
jest.mock('@/lib/cms-api/transformers', () => ({
  getAvailableRooms: jest.fn((rooms) => rooms.filter((r: CmsRoom) => r.status === 'available')),
}));

import { getHotelFull } from '@/lib/cms-api/client';
import { getAvailableRooms } from '@/lib/cms-api/transformers';

const mockGetHotelFull = getHotelFull as jest.MockedFunction<typeof getHotelFull>;
const mockGetAvailableRooms = getAvailableRooms as jest.MockedFunction<typeof getAvailableRooms>;

describe('Room Slug Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateRoomSlug', () => {
    describe('basic functionality', () => {
      it('should convert simple room name to kebab-case', () => {
        expect(generateRoomSlug('Deluxe Ocean Suite')).toBe('deluxe-ocean-suite');
      });

      it('should convert to lowercase', () => {
        expect(generateRoomSlug('DELUXE SUITE')).toBe('deluxe-suite');
        expect(generateRoomSlug('MiXeD CaSe')).toBe('mixed-case');
      });

      it('should replace spaces with hyphens', () => {
        expect(generateRoomSlug('Master Bedroom King Bed')).toBe('master-bedroom-king-bed');
      });

      it('should remove special characters', () => {
        expect(generateRoomSlug('Room#1')).toBe('room-1');
        expect(generateRoomSlug('Deluxe!Suite')).toBe('deluxe-suite');
        expect(generateRoomSlug('Room@Hotel')).toBe('room-hotel');
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(generateRoomSlug('')).toBe('room');
      });

      it('should handle whitespace only', () => {
        expect(generateRoomSlug('   ')).toBe('room');
      });

      it('should trim leading/trailing spaces', () => {
        expect(generateRoomSlug('  Deluxe Room  ')).toBe('deluxe-room');
      });

      it('should handle multiple consecutive spaces', () => {
        expect(generateRoomSlug('Deluxe    Room')).toBe('deluxe-room');
      });

      it('should handle multiple consecutive hyphens', () => {
        expect(generateRoomSlug('Deluxe---Room')).toBe('deluxe-room');
      });

      it('should handle mixed spaces and hyphens', () => {
        expect(generateRoomSlug('Deluxe - Room')).toBe('deluxe-room');
        expect(generateRoomSlug('Deluxe  -  Room')).toBe('deluxe-room');
      });

      it('should trim leading hyphens', () => {
        expect(generateRoomSlug('-Deluxe Room')).toBe('deluxe-room');
        expect(generateRoomSlug('--Deluxe Room')).toBe('deluxe-room');
      });

      it('should trim trailing hyphens', () => {
        expect(generateRoomSlug('Deluxe Room-')).toBe('deluxe-room');
        expect(generateRoomSlug('Deluxe Room--')).toBe('deluxe-room');
      });

      it('should handle numbers', () => {
        expect(generateRoomSlug('Room 123')).toBe('room-123');
        expect(generateRoomSlug('123 Main Street')).toBe('123-main-street');
      });

      it('should handle special characters in middle', () => {
        expect(generateRoomSlug('Master Bedroom (King)')).toBe('master-bedroom-king');
        expect(generateRoomSlug('Suite with View!')).toBe('suite-with-view');
      });

      it('should return fallback for result that would be empty', () => {
        expect(generateRoomSlug('---')).toBe('room');
        expect(generateRoomSlug('!!!')).toBe('room');
      });
    });

    describe('deterministic behavior', () => {
      it('should produce same output for same input', () => {
        const input = 'Deluxe Ocean Suite';
        const result1 = generateRoomSlug(input);
        const result2 = generateRoomSlug(input);
        expect(result1).toBe(result2);
      });

      it('should handle multiple calls consistently', () => {
        const inputs = ['Deluxe Room', 'Garden View', 'Suite 123'];
        inputs.forEach((input) => {
          const result1 = generateRoomSlug(input);
          const result2 = generateRoomSlug(input);
          expect(result1).toBe(result2);
        });
      });
    });

    describe('real-world examples', () => {
      it('should handle hotel room names correctly', () => {
        expect(generateRoomSlug('Deluxe Ocean Suite')).toBe('deluxe-ocean-suite');
        expect(generateRoomSlug('Master Bedroom (King Bed)')).toBe('master-bedroom-king-bed');
        expect(generateRoomSlug('Garden View Room')).toBe('garden-view-room');
        expect(generateRoomSlug('Penthouse Suite')).toBe('penthouse-suite');
        expect(generateRoomSlug('Standard Double Room')).toBe('standard-double-room');
      });
    });
  });

  describe('generateRoomSlugs', () => {
    describe('collision handling', () => {
      it('should handle no collisions', () => {
        const rooms: CmsRoom[] = [
          { id: '1', name: 'Deluxe Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
          { id: '2', name: 'Garden View', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 2, room_details: null, has_override: false },
          { id: '3', name: 'Ocean Suite', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 3, room_details: null, has_override: false },
        ];

        const result = generateRoomSlugs(rooms);

        expect(result.size).toBe(3);
        expect(result.get('deluxe-room')).toBe(rooms[0]);
        expect(result.get('garden-view')).toBe(rooms[1]);
        expect(result.get('ocean-suite')).toBe(rooms[2]);
      });

      it('should handle two rooms with same name', () => {
        const rooms: CmsRoom[] = [
          { id: '1', name: 'Deluxe Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
          { id: '2', name: 'Deluxe Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 2, room_details: null, has_override: false },
        ];

        const result = generateRoomSlugs(rooms);

        expect(result.size).toBe(2);
        expect(result.get('deluxe-room')).toBe(rooms[0]); // First keeps base slug
        expect(result.get('deluxe-room-2')).toBe(rooms[1]); // Second gets -2
      });

      it('should handle three rooms with same name', () => {
        const rooms: CmsRoom[] = [
          { id: '1', name: 'Standard Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
          { id: '2', name: 'Standard Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 2, room_details: null, has_override: false },
          { id: '3', name: 'Standard Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 3, room_details: null, has_override: false },
        ];

        const result = generateRoomSlugs(rooms);

        expect(result.size).toBe(3);
        expect(result.get('standard-room')).toBe(rooms[0]);
        expect(result.get('standard-room-2')).toBe(rooms[1]);
        expect(result.get('standard-room-3')).toBe(rooms[2]);
      });

      it('should handle multiple collisions with different base slugs', () => {
        const rooms: CmsRoom[] = [
          { id: '1', name: 'Deluxe Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
          { id: '2', name: 'Garden View', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 2, room_details: null, has_override: false },
          { id: '3', name: 'Deluxe Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 3, room_details: null, has_override: false },
          { id: '4', name: 'Garden View', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 4, room_details: null, has_override: false },
        ];

        const result = generateRoomSlugs(rooms);

        expect(result.size).toBe(4);
        expect(result.get('deluxe-room')).toBe(rooms[0]);
        expect(result.get('garden-view')).toBe(rooms[1]);
        expect(result.get('deluxe-room-2')).toBe(rooms[2]); // Third room, second Deluxe
        expect(result.get('garden-view-2')).toBe(rooms[3]); // Fourth room, second Garden
      });
    });

    describe('empty and edge cases', () => {
      it('should handle empty array', () => {
        const result = generateRoomSlugs([]);
        expect(result.size).toBe(0);
      });

      it('should handle single room', () => {
        const rooms: CmsRoom[] = [
          { id: '1', name: 'Presidential Suite', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
        ];

        const result = generateRoomSlugs(rooms);

        expect(result.size).toBe(1);
        expect(result.get('presidential-suite')).toBe(rooms[0]);
      });
    });

    describe('map functionality', () => {
      it('should return a Map for O(1) lookups', () => {
        const rooms: CmsRoom[] = [
          { id: '1', name: 'Deluxe Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
        ];

        const result = generateRoomSlugs(rooms);

        expect(result).toBeInstanceOf(Map);
        expect(result.has('deluxe-room')).toBe(true);
        expect(result.get('deluxe-room')).toEqual(rooms[0]);
      });
    });
  });

  describe('getAvailableRoomSlugs', () => {
    const mockRooms: CmsRoom[] = [
      { id: 'room-1', name: 'Deluxe Ocean Suite', hotel_id: 'hotel-123', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: 'Luxury suite', featured_image: 'img1.jpg', status: 'available', sort_order: 1, room_details: null, has_override: false },
      { id: 'room-2', name: 'Garden View Room', hotel_id: 'hotel-123', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: 'Garden view', featured_image: 'img2.jpg', status: 'available', sort_order: 2, room_details: null, has_override: false },
      { id: 'room-3', name: 'Standard Room', hotel_id: 'hotel-123', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: 'Standard', featured_image: 'img3.jpg', status: 'available', sort_order: 3, room_details: null, has_override: false },
      // Unavailable room should be filtered out
      { id: 'room-4', name: 'Maintenance Room', hotel_id: 'hotel-123', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: 'Maintenance', featured_image: null, status: 'maintenance', sort_order: 4, room_details: null, has_override: false },
    ];

    const mockHotelData = {
      hotel: {
        id: 'hotel-123',
        name: 'Test Hotel',
        slug: 'test-hotel',
        property_type: 'hotel' as const,
        star_rating: 4,
        status: 'active' as const,
        opening_year: 2020,
        address: '{"city": "Test City", "country": "US"}',
        is_template: false,
        has_override: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      content: [],
      rooms: mockRooms,
      facilities: [],
      images: null,
      _metadata: {
        hotel_id: 'hotel-123',
        fetched_at: '2024-01-01T00:00:00Z',
        processing_time_ms: 100,
        collections_fetched: [],
      },
      _errors: [],
    };

    beforeEach(() => {
      mockGetHotelFull.mockResolvedValue(mockHotelData as any);
      mockGetAvailableRooms.mockImplementation((rooms) =>
        rooms.filter((r: CmsRoom) => r.status === 'available')
      );
    });

    it('should fetch hotel data and return room slugs', async () => {
      const result = await getAvailableRoomSlugs('hotel-123');

      expect(mockGetHotelFull).toHaveBeenCalledWith('hotel-123');
      expect(result).toHaveLength(3); // Only available rooms
    });

    it('should return correct slug info structure', async () => {
      const result = await getAvailableRoomSlugs('hotel-123');

      expect(result[0]).toMatchObject({
        slug: 'deluxe-ocean-suite',
        name: 'Deluxe Ocean Suite',
        id: 'room-1',
      });
    });

    it('should filter to available rooms only', async () => {
      const result = await getAvailableRoomSlugs('hotel-123');

      const slugs = result.map((r) => r.slug);
      expect(slugs).toContain('deluxe-ocean-suite');
      expect(slugs).toContain('garden-view-room');
      expect(slugs).toContain('standard-room');
      expect(slugs).not.toContain('maintenance-room'); // Should be filtered out
    });

    it('should return consistent results across multiple calls', async () => {
      // React cache() deduplicates calls within the same render cycle
      // In tests, we verify consistency rather than exact call count
      const result1 = await getAvailableRoomSlugs('hotel-123');
      const result2 = await getAvailableRoomSlugs('hotel-123');

      // Results should be identical
      expect(result1).toEqual(result2);
      // All expected fields should be present
      expect(result1).toHaveLength(3);
    });

    it('should handle empty rooms array', async () => {
      mockGetHotelFull.mockResolvedValue({
        ...mockHotelData,
        rooms: [],
      } as any);

      const result = await getAvailableRoomSlugs('hotel-123');

      expect(result).toEqual([]);
    });

    it('should handle collisions from API data', async () => {
      const collisionRooms: CmsRoom[] = [
        { id: 'room-1', name: 'Deluxe Room', hotel_id: 'hotel-123', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
        { id: 'room-2', name: 'Deluxe Room', hotel_id: 'hotel-123', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 2, room_details: null, has_override: false },
      ];

      mockGetHotelFull.mockResolvedValue({
        ...mockHotelData,
        rooms: collisionRooms,
      } as any);

      const result = await getAvailableRoomSlugs('hotel-123');

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('deluxe-room');
      expect(result[1].slug).toBe('deluxe-room-2');
    });
  });

  describe('findRoomBySlug', () => {
    const rooms: CmsRoom[] = [
      { id: '1', name: 'Deluxe Room', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 1, room_details: null, has_override: false },
      { id: '2', name: 'Garden View', hotel_id: 'h1', room_type: 'standard', capacity_adults: 2, capacity_children: 0, description: '', featured_image: null, status: 'available', sort_order: 2, room_details: null, has_override: false },
    ];

    it('should find room by slug', () => {
      const result = findRoomBySlug(rooms, 'deluxe-room');
      expect(result).toEqual(rooms[0]);
    });

    it('should return undefined for non-existent slug', () => {
      const result = findRoomBySlug(rooms, 'non-existent');
      expect(result).toBeUndefined();
    });

    it('should handle empty array', () => {
      const result = findRoomBySlug([], 'deluxe-room');
      expect(result).toBeUndefined();
    });
  });

  describe('testSlugGeneration', () => {
    it('should be an alias for generateRoomSlug', () => {
      const name = 'Deluxe Ocean Suite';
      expect(testSlugGeneration(name)).toBe(generateRoomSlug(name));
    });
  });

  describe('validateSlugFormat', () => {
    describe('valid slugs', () => {
      it('should accept simple lowercase slugs', () => {
        expect(validateSlugFormat('deluxe-room')).toBe(true);
        expect(validateSlugFormat('garden-view')).toBe(true);
      });

      it('should accept slugs with numbers', () => {
        expect(validateSlugFormat('room-123')).toBe(true);
        expect(validateSlugFormat('suite-2024')).toBe(true);
      });

      it('should accept single word slugs', () => {
        expect(validateSlugFormat('deluxe')).toBe(true);
        expect(validateSlugFormat('room')).toBe(true);
      });

      it('should accept multi-hyphen slugs', () => {
        expect(validateSlugFormat('deluxe-ocean-suite-view')).toBe(true);
      });
    });

    describe('invalid slugs', () => {
      it('should reject uppercase letters', () => {
        expect(validateSlugFormat('Deluxe-Room')).toBe(false);
        expect(validateSlugFormat('DELUXE-ROOM')).toBe(false);
        expect(validateSlugFormat('deluxe-Room')).toBe(false);
      });

      it('should reject leading hyphens', () => {
        expect(validateSlugFormat('-deluxe-room')).toBe(false);
        expect(validateSlugFormat('--deluxe-room')).toBe(false);
      });

      it('should reject trailing hyphens', () => {
        expect(validateSlugFormat('deluxe-room-')).toBe(false);
        expect(validateSlugFormat('deluxe-room--')).toBe(false);
      });

      it('should reject underscores', () => {
        expect(validateSlugFormat('deluxe_room')).toBe(false);
        expect(validateSlugFormat('deluxe_room_suite')).toBe(false);
      });

      it('should reject special characters', () => {
        expect(validateSlugFormat('deluxe.room')).toBe(false);
        expect(validateSlugFormat('deluxe!room')).toBe(false);
        expect(validateSlugFormat('deluxe@room')).toBe(false);
      });

      it('should reject empty string', () => {
        expect(validateSlugFormat('')).toBe(false);
      });

      it('should reject spaces', () => {
        expect(validateSlugFormat('deluxe room')).toBe(false);
        expect(validateSlugFormat('deluxe room')).toBe(false);
      });
    });
  });
});
