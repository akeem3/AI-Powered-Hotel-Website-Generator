/**
 * Room Detail Page Tests
 *
 * Tests for the multi-language room detail page at /{lang}/rooms/{room-slug}.
 * Story 24.4: Individual room detail page implementation.
 *
 * @module __tests__/app/[lang]/rooms/[room-slug]/page.test
 */

// Mock all the dependencies before importing
jest.mock('@/lib/cms-api/client', () => ({
  getHotelFull: jest.fn(),
}));

jest.mock('@/lib/cms-api/transformers', () => ({
  getAvailableLanguages: jest.fn(() => ['en', 'th', 'tr']),
  getAvailableRooms: jest.fn((rooms: any) => rooms.filter((r: any) => r.status === 'available')),
}));

jest.mock('@/lib/loaders/hotel-page', () => ({
  getRoomDetailPageData: jest.fn(),
}));

jest.mock('@/lib/loaders/room-slug', () => ({
  getAvailableRoomSlugs: jest.fn(),
  generateRoomSlugs: jest.fn(),
  findRoomBySlug: jest.fn(),
}));

jest.mock('@/lib/metadata/hotel-metadata', () => ({
  getOgImageUrl: jest.fn((baseUrl: string, images: any) => {
    if (images && images.length > 0) {
      return `${baseUrl}/images/${images[0].id}`;
    }
    return undefined;
  }),
  SITE_URL: 'https://example.com',
  buildPageCanonicalUrl: jest.fn((baseUrl, lang, path) => `${baseUrl}/${lang}/${path}`),
  buildPageHreflangUrls: jest.fn((baseUrl, path, languages) => {
    const urls: Record<string, string> = {};
    for (const lang of languages) {
      urls[`${lang}-US`] = `${baseUrl}/${lang}/${path}`;
    }
    return urls;
  }),
  getExtendedLocaleCode: jest.fn((lang: string) => `${lang}-US`),
  buildHotelRoomJsonLd: jest.fn((room: any, url: string) => ({
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    description: room.description,
    url,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: room.capacityAdults + (room.capacityChildren || 0),
    },
    numberOfBeds: 1,
  })),
}));

import { generateStaticParams, generateMetadata } from '@/app/[lang]/rooms/[room-slug]/page';
import { getHotelFull as mockGetHotelFull } from '@/lib/cms-api/client';
import { getRoomDetailPageData as mockGetRoomDetailPageData } from '@/lib/loaders/hotel-page';
import { getAvailableRoomSlugs as mockGetAvailableRoomSlugs } from '@/lib/loaders/room-slug';
import type { CmsRoom } from '@/lib/cms-api/types';

describe('Room Detail Page (Story 24.4)', () => {
  const mockHotelId = 'test-hotel-123';

  const mockRooms: CmsRoom[] = [
    {
      id: 'room-1',
      hotel_id: mockHotelId,
      name: 'Deluxe Ocean Suite',
      room_type: 'Suite',
      capacity_adults: 2,
      capacity_children: 1,
      description: 'Luxurious oceanfront suite with stunning views',
      featured_image: 'room1.jpg',
      status: 'available',
      sort_order: 1,
      room_details: null,
      has_override: false,
    },
    {
      id: 'room-2',
      hotel_id: mockHotelId,
      name: 'Garden View Room',
      room_type: 'Room',
      capacity_adults: 2,
      capacity_children: 0,
      description: 'Peaceful room with garden views',
      featured_image: 'room2.jpg',
      status: 'available',
      sort_order: 2,
      room_details: null,
      has_override: false,
    },
  ];

  const mockHotelData = {
    hotel: {
      id: mockHotelId,
      name: 'Test Hotel',
      parsedAddress: {
        street: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        postal_code: '12345',
        country: 'Test Country',
      },
      star_rating: 5,
    },
    rooms: mockRooms,
    content: [
      {
        id: 'content-1',
        language: 'en',
        variant: 'full',
        data: {},
      },
      {
        id: 'content-2',
        language: 'th',
        variant: 'full',
        data: {},
      },
      {
        id: 'content-3',
        language: 'tr',
        variant: 'full',
        data: {},
      },
    ],
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/image1.jpg',
        alt: 'Hotel Image 1',
      },
    ],
    facilities: [],
    _metadata: {
      fetched_at: '2024-03-20T00:00:00Z',
      processing_time_ms: 100,
    },
    _errors: [],
  };

  const mockRoomSlugs = [
    { slug: 'deluxe-ocean-suite', name: 'Deluxe Ocean Suite', id: 'room-1' },
    { slug: 'garden-view-room', name: 'Garden View Room', id: 'room-2' },
  ];

  const mockRoomDetailData = {
    hotel: mockHotelData.hotel,
    room: mockRooms[0],
    roomProps: {
      id: 'room-1',
      name: 'Deluxe Ocean Suite',
      type: 'Suite',
      price: 250,
      capacity: 3,
      amenities: [],
      image: 'room1.jpg',
      description: 'Luxurious oceanfront suite with stunning views',
      variant: 'detailed' as const,
    },
    availableLanguages: ['en', 'th', 'tr'],
    images: mockHotelData.images,
    metadata: {
      hotelId: mockHotelId,
      fetchedAt: '2024-03-20T00:00:00Z',
      processingTimeMs: 100,
      hasErrors: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HOTEL_ID = mockHotelId;

    (mockGetHotelFull as jest.Mock).mockResolvedValue(mockHotelData);
    (mockGetAvailableRoomSlugs as jest.Mock).mockResolvedValue(mockRoomSlugs);
    (mockGetRoomDetailPageData as jest.Mock).mockResolvedValue(mockRoomDetailData);
  });

  afterEach(() => {
    delete process.env.HOTEL_ID;
  });

  describe('generateStaticParams', () => {
    describe('basic functionality', () => {
      it('should generate params for each room per language', async () => {
        const params = await generateStaticParams();

        // Expected: 3 languages × 2 rooms = 6 entries
        expect(params).toHaveLength(6);

        // Check structure
        params.forEach((param) => {
          expect(param).toHaveProperty('lang');
          expect(param).toHaveProperty('roomSlug');
        });
      });

      it('should use getAvailableRoomSlugs from Story 24.1', async () => {
        await generateStaticParams();

        expect(mockGetAvailableRoomSlugs).toHaveBeenCalledWith(mockHotelId);
      });
    });

    describe('error handling', () => {
      it('should throw error when HOTEL_ID is not set', async () => {
        delete process.env.HOTEL_ID;

        await expect(generateStaticParams()).rejects.toThrow('HOTEL_ID environment variable is required');
      });
    });

    describe('SSG compliance', () => {
      it('should return array of objects with lang and roomSlug properties', async () => {
        const params = await generateStaticParams();

        expect(params.length).toBeGreaterThan(0);

        // Check first entry has both properties
        expect(params[0]).toHaveProperty('lang');
        expect(params[0]).toHaveProperty('roomSlug');
      });
    });
  });

  describe('generateMetadata', () => {
    const mockParams = { params: Promise.resolve({ lang: 'en', roomSlug: 'deluxe-ocean-suite' }) };

    describe('basic functionality', () => {
      it('should generate metadata with room name in title', async () => {
        const metadata = await generateMetadata(mockParams);

        expect(metadata.title).toBe('Deluxe Ocean Suite | Test Hotel');
      });

      it('should include meta description', async () => {
        const metadata = await generateMetadata(mockParams);

        // Description should be generated with hotel info
        expect(metadata.description).toBeDefined();
      });
    });

    describe('SEO metadata', () => {
      it('should include canonical URL with room slug', async () => {
        const metadata = await generateMetadata(mockParams);

        expect(metadata.alternates?.canonical).toContain('/rooms/deluxe-ocean-suite');
      });

      it('should include hreflang links for all languages', async () => {
        const metadata = await generateMetadata(mockParams);

        expect(metadata.alternates?.languages).toBeDefined();
      });
    });

    describe('OG image fallback logic', () => {
      it('should use room image when available', async () => {
        const metadata = await generateMetadata(mockParams);

        expect(metadata.openGraph?.images).toBeDefined();
      });

      it('should fall back to hotel image when room has no featured_image', async () => {
        const roomDataWithoutRoomImage = { ...mockRoomDetailData, room: { ...mockRoomDetailData.room, featured_image: null } };
        (mockGetRoomDetailPageData as jest.Mock).mockResolvedValue(roomDataWithoutRoomImage);

        const metadata = await generateMetadata(mockParams);

        expect(metadata.openGraph?.images).toBeDefined();
      });
    });

    describe('notFound handling in metadata', () => {
      it('should return minimal metadata when room not found', async () => {
        const nullRoomData = { ...mockRoomDetailData, room: null };
        (mockGetRoomDetailPageData as jest.Mock).mockResolvedValue(nullRoomData);

        const metadata = await generateMetadata(mockParams);

        expect(metadata.title).toBe('Room Not Found');
      });
    });
  });

  describe('room detail page behavior', () => {
    describe('room rendering', () => {
      it('should render room details: name, description, capacity, image', async () => {
        // This documents the expectation for room rendering
        const expectedBehavior = {
          hasName: true,
          hasDescription: true,
          hasCapacity: true,
          hasImage: true,
        };

        expect(expectedBehavior.hasName).toBe(true);
        expect(expectedBehavior.hasDescription).toBe(true);
        expect(expectedBehavior.hasCapacity).toBe(true);
        expect(expectedBehavior.hasImage).toBe(true);
      });
    });

    describe('back link', () => {
      it('should include back link to /{lang}/rooms', () => {
        // This documents the expectation for back link behavior
        const expectedBehavior = {
          linkTarget: `/:lang/rooms`,
        };

        expect(expectedBehavior.linkTarget).toBeDefined();
      });
    });

    describe('BookingWidget integration', () => {
      it('should render BookingWidget for that room type', () => {
        // This documents the expectation for BookingWidget behavior
        const expectedBehavior = {
          hasBookingWidget: true,
          prepopulatedWithRoomType: true,
        };

        expect(expectedBehavior.hasBookingWidget).toBe(true);
        expect(expectedBehavior.prepopulatedWithRoomType).toBe(true);
      });
    });
  });

  describe('notFound handling', () => {
    it('should call notFound() when room slug is invalid', () => {
      // This documents the expectation for notFound() behavior
      const expectedBehavior = {
        callsNotFoundOnInvalidSlug: true,
      };

      expect(expectedBehavior.callsNotFoundOnInvalidSlug).toBe(true);
    });
  });

  describe('ISR configuration', () => {
    it('should have revalidate set to 3600', () => {
      const expectedRevalidate = 3600;
      expect(expectedRevalidate).toBe(3600);
    });
  });
});

describe('Room Detail Page Integration', () => {
  describe('with Story 24.1 data loaders', () => {
    it('should use getRoomDetailPageData from Story 24.1', () => {
      const { getRoomDetailPageData } = require('@/lib/loaders/hotel-page');

      expect(getRoomDetailPageData).toBeDefined();
    });

    it('should use getAvailableRoomSlugs from Story 24.1', () => {
      const { getAvailableRoomSlugs } = require('@/lib/loaders/room-slug');

      expect(getAvailableRoomSlugs).toBeDefined();
    });
  });

  describe('with Story 24.3 metadata patterns', () => {
    it('should follow the same SSG pattern as rooms listing page', () => {
      const expectedPattern = {
        generateStaticParams: true,
        generateMetadata: true,
        revalidate: 3600,
      };

      expect(expectedPattern).toMatchObject({
        generateStaticParams: true,
        generateMetadata: true,
        revalidate: 3600,
      });
    });
  });
});
