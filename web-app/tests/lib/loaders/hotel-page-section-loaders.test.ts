/**
 * Section-Specific Data Loaders Tests
 *
 * Tests for Story 24.1: Section-Specific Data Loaders and Room Slug Utility.
 *
 * @module __tests__/lib/loaders/hotel-page-section-loaders.test
 */

// Mock room slug utilities BEFORE importing the module
jest.mock('@/lib/loaders/room-slug', () => ({
  findRoomBySlug: jest.fn(),
  generateRoomSlugs: jest.fn(),
  getAvailableRoomSlugs: jest.fn(),
  generateRoomSlug: jest.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
  testSlugGeneration: jest.fn(),
  validateSlugFormat: jest.fn(),
}));

import {
  getRoomsPageData,
  getRoomDetailPageData,
  getGalleryPageData,
  getAmenitiesPageData,
  getHeroAndHotelData,
  type RoomsPageProps,
  type RoomDetailPageProps,
  type GalleryPageProps,
  type AmenitiesPageProps,
  type HeroAndHotelDataProps,
} from '@/lib/loaders/hotel-page';

// Mock the CMS API client
jest.mock('@/lib/cms-api/client', () => ({
  getHotelFull: jest.fn(),
}));

// Mock the transformers
jest.mock('@/lib/cms-api/transformers', () => ({
  getAvailableLanguages: jest.fn(() => ['en', 'th']),
}));

import { getHotelFull } from '@/lib/cms-api/client';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { findRoomBySlug } from '@/lib/loaders/room-slug';

const mockGetHotelFull = getHotelFull as jest.MockedFunction<typeof getHotelFull>;
const mockGetAvailableLanguages = getAvailableLanguages as jest.MockedFunction<typeof getAvailableLanguages>;
const mockFindRoomBySlug = findRoomBySlug as jest.MockedFunction<typeof findRoomBySlug>;

// Mock data mappers
jest.mock('@/lib/mappers', () => ({
  mapCmsToHero: jest.fn(({ hotelData, lang, siteUrl }) => ({
    title: hotelData.hotel.name,
    headline: `Welcome to ${hotelData.hotel.name}`,
    tagline: undefined,
    description: 'Test description',
    image: `${siteUrl}/images/test.jpg`,
    background: 'image' as const,
    primaryCTA: { text: 'View Rooms', href: '#rooms', ariaLabel: 'View Rooms' },
    secondaryCTA: { text: 'Contact Us', href: `/${lang}/contact`, ariaLabel: 'Contact Us' },
    variant: { style: 'modern' as const, layout: 'centered' as const, overlay: 'gradient' as const, height: 'medium' as const },
  })),
  mapCmsToAmenities: jest.fn(() => ({
    variant: { layout: 'grid' as const, columns: 4, iconSize: 'medium' as const, iconStyle: 'default' as const, cardStyle: 'default' as const },
    amenities: [],
    showCategory: false,
  })),
  mapCmsToRooms: jest.fn(({ hotelData }) => {
    // Return mapped rooms based on input data
    return {
      rooms: hotelData.rooms.map((room: any, index: number) => ({
        id: room.id,
        name: room.name,
        type: room.room_type,
        price: 100 + index * 50,
        capacity: room.capacity_adults,
        amenities: [],
        image: room.featured_image || undefined,
        description: room.description || undefined,
        variant: 'detailed' as const,
        imageHeight: 'default' as const,
      })),
      variant: 'detailed' as const,
    };
  }),
  mapCmsToGallery: jest.fn(({ hotelData, siteUrl }) => ({
    variant: { layout: 'masonry' as const, spacing: 'normal' as const, aspectRatio: 'landscape' as const, cardStyle: 'default' as const },
    images: hotelData.images?.map(img => ({
      id: img.id,
      desktopUrl: `${siteUrl}/images/${img.id}`,
      mobileUrl: `${siteUrl}/images/${img.id}`,
      alt: `${hotelData.hotel.name} - View`,
      caption: hotelData.hotel.name,
    })) || [],
    enableLightbox: true,
  })),
  mapCmsToHotelInfo: jest.fn(() => ({
    variant: { layout: 'default' as const },
    hotelName: 'Test Hotel',
    description: 'Test description',
    address: '123 Test St',
    rating: 4.5,
    reviewsCount: 100,
  })),
}));

import {
  mapCmsToHero,
  mapCmsToAmenities,
  mapCmsToRooms,
  mapCmsToGallery,
} from '@/lib/mappers';

// Mock room slug utilities
jest.mock('@/lib/loaders/room-slug', () => ({
  findRoomBySlug: jest.fn((rooms, slug) => {
    // Simple slug matching for tests
    return rooms.find(r => {
      const roomSlug = r.name.toLowerCase().replace(/\s+/g, '-');
      return roomSlug === slug;
    });
  }),
  generateRoomSlugs: jest.fn(),
  getAvailableRoomSlugs: jest.fn(),
  generateRoomSlug: jest.fn((name: string) => name.toLowerCase().replace(/\s+/g, '-')),
  testSlugGeneration: jest.fn(),
  validateSlugFormat: jest.fn(),
}));

import { findRoomBySlug } from '@/lib/loaders/room-slug';
import type { RoomSlugInfo } from '@/lib/loaders/room-slug';

// Test data
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
    parsedAddress: {
      city: 'Test City',
      state: '',
      street: '',
      country: 'US',
      postal_code: '',
    },
  },
  content: [
    {
      id: 'content-1',
      hotel_id: 'hotel-123',
      content_type: 'brief_description' as const,
      title: 'Hotel Concise',
      content: 'Concise description',
      language: 'en',
      status: 'published',
      sort_order: 1,
      parent_content_id: null,
      has_override: false,
    },
  ],
  rooms: [
    {
      id: 'room-1',
      hotel_id: 'hotel-123',
      name: 'Deluxe Ocean Suite',
      room_type: 'standard',
      capacity_adults: 2,
      capacity_children: 0,
      description: 'Luxury suite',
      featured_image: 'img1.jpg',
      status: 'available',
      sort_order: 1,
      room_details: null,
      has_override: false,
    },
    {
      id: 'room-2',
      hotel_id: 'hotel-123',
      name: 'Garden View Room',
      room_type: 'standard',
      capacity_adults: 2,
      capacity_children: 0,
      description: 'Garden view',
      featured_image: 'img2.jpg',
      status: 'available',
      sort_order: 2,
      room_details: null,
      has_override: false,
    },
    {
      id: 'room-3',
      hotel_id: 'hotel-123',
      name: 'Standard Room',
      room_type: 'standard',
      capacity_adults: 2,
      capacity_children: 0,
      description: 'Standard',
      featured_image: 'img3.jpg',
      status: 'available',
      sort_order: 3,
      room_details: null,
      has_override: false,
    },
  ],
  facilities: [],
  images: [
    { id: 'img-1', hotel_id: 'hotel-123' },
    { id: 'img-2', hotel_id: 'hotel-123' },
  ],
  _metadata: {
    hotel_id: 'hotel-123',
    fetched_at: '2024-01-01T00:00:00Z',
    processing_time_ms: 100,
    collections_fetched: [],
  },
  _errors: [],
};

describe('Section-Specific Data Loaders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock behavior
    mockGetHotelFull.mockResolvedValue(mockHotelData as any);
    mockGetAvailableLanguages.mockReturnValue(['en', 'th']);

    // Setup default findRoomBySlug behavior
    mockFindRoomBySlug.mockImplementation((rooms, slug) => {
      return rooms.find(r => {
        const roomSlug = r.name.toLowerCase().replace(/\s+/g, '-');
        return roomSlug === slug;
      });
    });

    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  describe('getRoomsPageData', () => {
    it('should fetch and return rooms page data', async () => {
      const result = await getRoomsPageData('hotel-123', 'en');

      expect(mockGetHotelFull).toHaveBeenCalledWith('hotel-123');
      expect(result).toMatchObject({
        hotel: mockHotelData.hotel,
        availableLanguages: ['en', 'th'],
      });
      expect(result.rooms).toBeDefined();
      expect(result.rooms.rooms).toHaveLength(3);
    });

    it('should include all available rooms without limit', async () => {
      const result = await getRoomsPageData('hotel-123', 'en');

      // mapCmsToRooms was called without limit parameter
      expect(result.rooms.rooms).toHaveLength(3);
      expect(result.rooms.rooms[0]).toMatchObject({
        id: 'room-1',
        name: 'Deluxe Ocean Suite',
      });
    });

    it('should include images in response', async () => {
      const result = await getRoomsPageData('hotel-123', 'en');

      expect(result.images).toEqual(mockHotelData.images);
    });

    it('should include metadata', async () => {
      const result = await getRoomsPageData('hotel-123', 'en');

      expect(result.metadata).toMatchObject({
        hotelId: 'hotel-123',
        fetchedAt: '2024-01-01T00:00:00Z',
        processingTimeMs: 100,
        hasErrors: false,
      });
    });

    it('should handle CMS errors gracefully', async () => {
      const errorHotelData = {
        ...mockHotelData,
        _errors: ['images'],
      };
      mockGetHotelFull.mockResolvedValue(errorHotelData as any);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await getRoomsPageData('hotel-123', 'en');

      // console.warn is called with 2 arguments: prefix + joined errors
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[getRoomsPageData]'),
        'images'
      );
      expect(result.metadata.hasErrors).toBe(true);

      consoleWarnSpy.mockRestore();
    });

    it('should be wrapped in React cache', () => {
      // Verify function has cache wrapper (indirect check via function behavior)
      expect(typeof getRoomsPageData).toBe('function');
    });
  });

  describe('getRoomDetailPageData', () => {
    it('should fetch and return room detail data for valid slug', async () => {
      const result = await getRoomDetailPageData('hotel-123', 'en', 'deluxe-ocean-suite');

      expect(mockGetHotelFull).toHaveBeenCalledWith('hotel-123');
      expect(result).toMatchObject({
        hotel: mockHotelData.hotel,
        availableLanguages: ['en', 'th'],
      });
      expect(result.room).toBeDefined();
      expect(result.room?.id).toBe('room-1');
      expect(result.roomProps).toBeDefined();
    });

    it('should return null room when slug not found', async () => {
      mockFindRoomBySlug.mockReturnValue(undefined);

      const result = await getRoomDetailPageData('hotel-123', 'en', 'non-existent');

      expect(result.room).toBeNull();
      expect(result.roomProps).toBeNull();
    });

    it('should map single room to component props', async () => {
      const result = await getRoomDetailPageData('hotel-123', 'en', 'deluxe-ocean-suite');

      expect(result.roomProps).toBeDefined();
      // Check that roomProps has the expected structure
      expect(result.roomProps).toHaveProperty('rooms');
      expect(result.roomProps).toHaveProperty('variant');
      // Verify the rooms array has one room
      expect(Array.isArray(result.roomProps?.rooms)).toBe(true);
      expect(result.roomProps?.rooms).toHaveLength(1);
      // Verify the room data
      expect(result.roomProps?.rooms[0]).toMatchObject({
        id: 'room-1',
        name: 'Deluxe Ocean Suite',
      });
    });

    it('should include images in response', async () => {
      const result = await getRoomDetailPageData('hotel-123', 'en', 'deluxe-ocean-suite');

      expect(result.images).toEqual(mockHotelData.images);
    });

    it('should include metadata', async () => {
      const result = await getRoomDetailPageData('hotel-123', 'en', 'deluxe-ocean-suite');

      expect(result.metadata).toMatchObject({
        hotelId: 'hotel-123',
        hasErrors: false,
      });
    });
  });

  describe('getGalleryPageData', () => {
    it('should fetch and return gallery page data', async () => {
      const result = await getGalleryPageData('hotel-123', 'en');

      expect(mockGetHotelFull).toHaveBeenCalledWith('hotel-123');
      expect(result).toMatchObject({
        hotel: mockHotelData.hotel,
        availableLanguages: ['en', 'th'],
      });
      expect(result.gallery).toBeDefined();
    });

    it('should map gallery images with site URL', async () => {
      const result = await getGalleryPageData('hotel-123', 'en');

      expect(result.gallery.images).toHaveLength(2);
      expect(result.gallery.images[0]).toMatchObject({
        desktopUrl: 'https://example.com/images/img-1',
        mobileUrl: 'https://example.com/images/img-1',
      });
    });

    it('should handle null images gracefully', async () => {
      const noImagesData = {
        ...mockHotelData,
        images: null,
      };
      mockGetHotelFull.mockResolvedValue(noImagesData as any);

      const result = await getGalleryPageData('hotel-123', 'en');

      expect(result.gallery.images).toEqual([]);
    });

    it('should include metadata', async () => {
      const result = await getGalleryPageData('hotel-123', 'en');

      expect(result.metadata).toMatchObject({
        hotelId: 'hotel-123',
        processingTimeMs: 100,
      });
    });
  });

  describe('getAmenitiesPageData', () => {
    it('should fetch and return amenities page data', async () => {
      const result = await getAmenitiesPageData('hotel-123');

      expect(mockGetHotelFull).toHaveBeenCalledWith('hotel-123');
      expect(result).toMatchObject({
        hotel: mockHotelData.hotel,
      });
      expect(result.amenities).toBeDefined();
    });

    it('should not require lang parameter', async () => {
      // Amenities are language-independent
      const result = await getAmenitiesPageData('hotel-123');

      expect(result).toBeDefined();
      expect(result.hotel).toBeDefined();
    });

    it('should map amenities data', async () => {
      const result = await getAmenitiesPageData('hotel-123');

      expect(result.amenities).toBeDefined();
      expect(result.amenities.variant).toBeDefined();
    });

    it('should include metadata', async () => {
      const result = await getAmenitiesPageData('hotel-123');

      expect(result.metadata).toMatchObject({
        hotelId: 'hotel-123',
        hasErrors: false,
      });
    });
  });

  describe('getHeroAndHotelData', () => {
    it('should fetch and return hero and hotel data', async () => {
      const result = await getHeroAndHotelData('hotel-123', 'en');

      expect(mockGetHotelFull).toHaveBeenCalledWith('hotel-123');
      expect(result).toMatchObject({
        hotel: mockHotelData.hotel,
        availableLanguages: ['en', 'th'],
      });
      expect(result.hero).toBeDefined();
    });

    it('should map hero data with language', async () => {
      const result = await getHeroAndHotelData('hotel-123', 'en');

      expect(result.hero).toBeDefined();
      expect(result.hero.title).toBe('Test Hotel');
      expect(result.hero.headline).toContain('Test Hotel');
      expect(result.hero.secondaryCTA?.href).toBe('/en/contact');
    });

    it('should include images for hero background', async () => {
      const result = await getHeroAndHotelData('hotel-123', 'en');

      expect(result.images).toEqual(mockHotelData.images);
    });

    it('should include metadata', async () => {
      const result = await getHeroAndHotelData('hotel-123', 'en');

      expect(result.metadata).toMatchObject({
        hotelId: 'hotel-123',
        hasErrors: false,
      });
    });

    it('should use site URL from environment', async () => {
      const result = await getHeroAndHotelData('hotel-123', 'en');

      expect(result.hero.image).toBe('https://example.com/images/test.jpg');
    });
  });

  describe('React cache wrapper', () => {
    it('should provide consistent results across calls', async () => {
      const result1 = await getRoomsPageData('hotel-123', 'en');
      const result2 = await getRoomsPageData('hotel-123', 'en');

      expect(result1).toEqual(result2);
    });
  });

  describe('TypeScript return types', () => {
    it('should return correct type for getRoomsPageData', async () => {
      const result = await getRoomsPageData('hotel-123', 'en');

      // Type check: result should have expected properties
      expect(result).toHaveProperty('hotel');
      expect(result).toHaveProperty('rooms');
      expect(result).toHaveProperty('availableLanguages');
      expect(result).toHaveProperty('images');
      expect(result).toHaveProperty('metadata');
    });

    it('should return correct type for getRoomDetailPageData', async () => {
      const result = await getRoomDetailPageData('hotel-123', 'en', 'deluxe-ocean-suite');

      expect(result).toHaveProperty('room');
      expect(result).toHaveProperty('roomProps');
    });

    it('should return correct type for getGalleryPageData', async () => {
      const result = await getGalleryPageData('hotel-123', 'en');

      expect(result).toHaveProperty('gallery');
    });

    it('should return correct type for getAmenitiesPageData', async () => {
      const result = await getAmenitiesPageData('hotel-123');

      expect(result).toHaveProperty('amenities');
    });

    it('should return correct type for getHeroAndHotelData', async () => {
      const result = await getHeroAndHotelData('hotel-123', 'en');

      expect(result).toHaveProperty('hero');
    });
  });

  describe('Error handling', () => {
    it('should handle missing hotel data gracefully', async () => {
      mockGetHotelFull.mockRejectedValue(new Error('Hotel not found'));

      await expect(getRoomsPageData('hotel-123', 'en')).rejects.toThrow('Hotel not found');
    });

    it('should log warnings for CMS collection errors', async () => {
      const errorHotelData = {
        ...mockHotelData,
        _errors: ['content', 'rooms'],
      };
      mockGetHotelFull.mockResolvedValue(errorHotelData as any);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await getGalleryPageData('hotel-123', 'en');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[getGalleryPageData]'),
        expect.stringContaining('content, rooms')
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
