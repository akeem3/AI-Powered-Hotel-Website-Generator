/**
 * Hotel Metadata Utilities Tests
 *
 * Tests for sub-page metadata utilities and JSON-LD ItemList schema.
 * Story 24.3: Rooms listing page implementation.
 *
 * @module __tests__/lib/metadata/hotel-metadata.test
 */

import {
  buildPageCanonicalUrl,
  buildPageHreflangUrls,
  buildRoomsItemListJsonLd,
  buildHotelRoomJsonLd,
  buildReviewsAggregateJsonLd,
  buildFAQPageJsonLd,
  getExtendedLocaleCode,
  type ItemListJsonLd,
  type RoomForItemList,
  type ReviewJsonLdInput,
  type AggregateRatingJsonLd,
  type FAQJsonLdInput,
  type FAQPageJsonLd,
} from '@/lib/metadata/hotel-metadata';

describe('Sub-Page Metadata Utilities (Story 24.3)', () => {
  describe('buildPageCanonicalUrl', () => {
    const baseUrl = 'https://example.com';

    describe('basic functionality', () => {
      it('should build canonical URL for sub-page with language code', () => {
        expect(buildPageCanonicalUrl(baseUrl, 'en', 'rooms')).toBe('https://example.com/en/rooms');
      });

      it('should build canonical URL for different languages', () => {
        expect(buildPageCanonicalUrl(baseUrl, 'th', 'gallery')).toBe('https://example.com/th/gallery');
        expect(buildPageCanonicalUrl(baseUrl, 'tr', 'amenities')).toBe('https://example.com/tr/amenities');
        expect(buildPageCanonicalUrl(baseUrl, 'ru', 'about')).toBe('https://example.com/ru/about');
      });

      it('should build canonical URL for different paths', () => {
        expect(buildPageCanonicalUrl(baseUrl, 'en', 'contact')).toBe('https://example.com/en/contact');
        expect(buildPageCanonicalUrl(baseUrl, 'en', 'faq')).toBe('https://example.com/en/faq');
        expect(buildPageCanonicalUrl(baseUrl, 'en', 'testimonials')).toBe(
          'https://example.com/en/testimonials'
        );
      });
    });

    describe('edge cases', () => {
      it('should remove trailing slash from base URL', () => {
        expect(buildPageCanonicalUrl('https://example.com/', 'en', 'rooms')).toBe(
          'https://example.com/en/rooms'
        );
      });

      it('should handle multiple trailing slashes', () => {
        expect(buildPageCanonicalUrl('https://example.com///', 'en', 'rooms')).toBe(
          'https://example.com/en/rooms'
        );
      });

      it('should handle localhost URLs', () => {
        expect(buildPageCanonicalUrl('http://localhost:3000', 'en', 'rooms')).toBe(
          'http://localhost:3000/en/rooms'
        );
      });

      it('should preserve path segments as-is', () => {
        expect(buildPageCanonicalUrl(baseUrl, 'en', 'rooms/deluxe')).toBe(
          'https://example.com/en/rooms/deluxe'
        );
      });
    });

    describe('backward compatibility', () => {
      it('should not interfere with existing buildCanonicalUrl function', () => {
        // This test ensures the new function works alongside existing hotel detail page function
        expect(buildPageCanonicalUrl(baseUrl, 'en', 'rooms')).not.toContain('/hotels/');
        expect(buildPageCanonicalUrl(baseUrl, 'en', 'rooms')).toBe('https://example.com/en/rooms');
      });
    });
  });

  describe('buildPageHreflangUrls', () => {
    const baseUrl = 'https://example.com';
    const path = 'rooms';

    describe('basic functionality', () => {
      it('should build hreflang URLs for single language', () => {
        const result = buildPageHreflangUrls(baseUrl, path, ['en']);

        expect(result).toEqual({
          'en-US': 'https://example.com/en/rooms',
        });
      });

      it('should build hreflang URLs for multiple languages', () => {
        const result = buildPageHreflangUrls(baseUrl, path, ['en', 'th', 'tr']);

        expect(result).toEqual({
          'en-US': 'https://example.com/en/rooms',
          'th-TH': 'https://example.com/th/rooms',
          'tr-TR': 'https://example.com/tr/rooms',
        });
      });

      it('should build hreflang URLs for all available languages', () => {
        const languages = ['en', 'th', 'tr', 'ru', 'ja', 'de', 'fr'];
        const result = buildPageHreflangUrls(baseUrl, path, languages);

        expect(result).toMatchSnapshot();
      });
    });

    describe('different paths', () => {
      it('should build hreflang URLs for gallery path', () => {
        const result = buildPageHreflangUrls(baseUrl, 'gallery', ['en', 'th']);

        expect(result).toEqual({
          'en-US': 'https://example.com/en/gallery',
          'th-TH': 'https://example.com/th/gallery',
        });
      });

      it('should build hreflang URLs for amenities path', () => {
        const result = buildPageHreflangUrls(baseUrl, 'amenities', ['en', 'th', 'tr']);

        expect(result).toEqual({
          'en-US': 'https://example.com/en/amenities',
          'th-TH': 'https://example.com/th/amenities',
          'tr-TR': 'https://example.com/tr/amenities',
        });
      });
    });

    describe('edge cases', () => {
      it('should handle empty languages array', () => {
        const result = buildPageHreflangUrls(baseUrl, path, []);

        expect(result).toEqual({});
      });

      it('should remove trailing slash from base URL', () => {
        const result = buildPageHreflangUrls('https://example.com/', path, ['en']);

        expect(result).toEqual({
          'en-US': 'https://example.com/en/rooms',
        });
      });

      it('should use getExtendedLocaleCode for locale conversion', () => {
        const result = buildPageHreflangUrls(baseUrl, path, ['zh', 'pt', 'ko']);

        expect(result['zh-CN']).toBe('https://example.com/zh/rooms');
        expect(result['pt-BR']).toBe('https://example.com/pt/rooms');
        expect(result['ko-KR']).toBe('https://example.com/ko/rooms');
      });
    });

    describe('backward compatibility', () => {
      it('should not interfere with existing buildHreflangUrls function', () => {
        const result = buildPageHreflangUrls(baseUrl, path, ['en']);

        // Ensure it does NOT insert /hotels/ into the path
        expect(result['en-US']).not.toContain('/hotels/');
        expect(result['en-US']).toBe('https://example.com/en/rooms');
      });
    });
  });

  describe('buildRoomsItemListJsonLd', () => {
    const baseUrl = 'https://example.com';
    const lang = 'en';

    const mockRooms: RoomForItemList[] = [
      {
        id: 'room-1',
        name: 'Deluxe Ocean Suite',
        slug: 'deluxe-ocean-suite',
        description: 'Luxurious oceanfront suite',
        image: 'https://example.com/images/room1.jpg',
      },
      {
        id: 'room-2',
        name: 'Garden View Room',
        slug: 'garden-view-room',
        description: 'Peaceful room with garden views',
        image: 'https://example.com/images/room2.jpg',
      },
      {
        id: 'room-3',
        name: 'Mountain Suite',
        slug: 'mountain-suite',
        description: 'Stunning mountain views',
        image: 'https://example.com/images/room3.jpg',
      },
    ];

    describe('basic functionality', () => {
      it('should build ItemList JSON-LD structure', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        expect(result).toMatchObject({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          itemListElement: expect.any(Array),
        });
      });

      it('should include all rooms as ListItems', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        expect(result.itemListElement).toHaveLength(3);
        expect(result.itemListElement[0]).toMatchObject({
          '@type': 'ListItem',
          position: 1,
          name: 'Deluxe Ocean Suite',
          url: 'https://example.com/en/rooms/deluxe-ocean-suite',
        });
      });

      it('should use 1-based indexing for positions', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        expect(result.itemListElement[0].position).toBe(1);
        expect(result.itemListElement[1].position).toBe(2);
        expect(result.itemListElement[2].position).toBe(3);
      });

      it('should build correct URLs for each room', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        expect(result.itemListElement[0].url).toBe('https://example.com/en/rooms/deluxe-ocean-suite');
        expect(result.itemListElement[1].url).toBe('https://example.com/en/rooms/garden-view-room');
        expect(result.itemListElement[2].url).toBe('https://example.com/en/rooms/mountain-suite');
      });
    });

    describe('optional fields', () => {
      it('should include optional description when provided', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        expect(result.itemListElement[0].description).toBe('Luxurious oceanfront suite');
        expect(result.itemListElement[1].description).toBe('Peaceful room with garden views');
      });

      it('should include optional image when provided', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        expect(result.itemListElement[0].image).toBe('https://example.com/images/room1.jpg');
        expect(result.itemListElement[1].image).toBe('https://example.com/images/room2.jpg');
      });

      it('should handle rooms without optional fields', () => {
        const roomsWithoutOptional: RoomForItemList[] = [
          {
            id: 'room-1',
            name: 'Basic Room',
            slug: 'basic-room',
          },
        ];

        const result = buildRoomsItemListJsonLd(roomsWithoutOptional, baseUrl, lang);

        expect(result.itemListElement[0]).not.toHaveProperty('description');
        expect(result.itemListElement[0]).not.toHaveProperty('image');
      });

      it('should include list name when provided', () => {
        const result = buildRoomsItemListJsonLd(
          mockRooms,
          baseUrl,
          lang,
          'Rooms & Suites - Test Hotel'
        );

        expect(result.name).toBe('Rooms & Suites - Test Hotel');
      });

      it('should include list description when provided', () => {
        const result = buildRoomsItemListJsonLd(
          mockRooms,
          baseUrl,
          lang,
          undefined,
          'Browse our luxurious rooms'
        );

        expect(result.description).toBe('Browse our luxurious rooms');
      });
    });

    describe('edge cases', () => {
      it('should handle empty rooms array', () => {
        const result = buildRoomsItemListJsonLd([], baseUrl, lang);

        expect(result.itemListElement).toHaveLength(0);
      });

      it('should handle single room', () => {
        const singleRoom: RoomForItemList[] = [
          {
            id: 'room-1',
            name: 'Single Room',
            slug: 'single-room',
          },
        ];

        const result = buildRoomsItemListJsonLd(singleRoom, baseUrl, lang);

        expect(result.itemListElement).toHaveLength(1);
        expect(result.itemListElement[0].position).toBe(1);
      });

      it('should remove trailing slash from base URL', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, 'https://example.com/', lang);

        expect(result.itemListElement[0].url).toBe('https://example.com/en/rooms/deluxe-ocean-suite');
      });

      it('should handle different languages', () => {
        const resultTh = buildRoomsItemListJsonLd(mockRooms, baseUrl, 'th');
        const resultTr = buildRoomsItemListJsonLd(mockRooms, baseUrl, 'tr');

        expect(resultTh.itemListElement[0].url).toBe('https://example.com/th/rooms/deluxe-ocean-suite');
        expect(resultTr.itemListElement[0].url).toBe('https://example.com/tr/rooms/deluxe-ocean-suite');
      });
    });

    describe('Schema.org compliance', () => {
      it('should follow Schema.org ItemList structure', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        // Required properties
        expect(result).toHaveProperty('@context', 'https://schema.org');
        expect(result).toHaveProperty('@type', 'ItemList');
        expect(result).toHaveProperty('itemListElement');

        // Each ListItem should have required properties
        result.itemListElement.forEach((item) => {
          expect(item).toHaveProperty('@type', 'ListItem');
          expect(item).toHaveProperty('position');
          expect(item).toHaveProperty('name');
        });
      });

      it('should be serializable to JSON', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        expect(() => JSON.stringify(result)).not.toThrow();
        expect(JSON.parse(JSON.stringify(result))).toMatchObject({
          '@context': 'https://schema.org',
          '@type': 'ItemList',
        });
      });
    });

    describe('type compatibility', () => {
      it('should be compatible with Record<string, unknown>', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        // Should be assignable to Record<string, unknown>
        const record: Record<string, unknown> = result;

        expect(record['@context']).toBe('https://schema.org');
        expect(record['@type']).toBe('ItemList');
      });

      it('should work with JsonLdScript component', () => {
        const result = buildRoomsItemListJsonLd(mockRooms, baseUrl, lang);

        // Should have all properties needed for JsonLdScript
        expect(result).toHaveProperty('@context');
        expect(result).toHaveProperty('@type');
        expect(result).toHaveProperty('itemListElement');
      });
    });
  });
});

describe('Existing Metadata Functions (Backward Compatibility)', () => {
  describe('getExtendedLocaleCode', () => {
    it('should still work for all supported languages', () => {
      expect(getExtendedLocaleCode('en')).toBe('en-US');
      expect(getExtendedLocaleCode('th')).toBe('th-TH');
      expect(getExtendedLocaleCode('tr')).toBe('tr-TR');
      expect(getExtendedLocaleCode('ru')).toBe('ru-RU');
      expect(getExtendedLocaleCode('ja')).toBe('ja-JP');
    });
  });
});

// ============================================================================
// HOTEL ROOM JSON-LD TESTS (Story 24.4)
// ============================================================================

import {
  buildHotelRoomJsonLd,
  type HotelRoomJsonLd,
  type RoomJsonLdInput,
} from '@/lib/metadata/hotel-metadata';

describe('HotelRoom JSON-LD (Story 24.4)', () => {
  describe('buildHotelRoomJsonLd', () => {
    const mockCanonicalUrl = 'https://example.com/en/rooms/deluxe-ocean-suite';

    const mockRoomInput: RoomJsonLdInput = {
      name: 'Deluxe Ocean Suite',
      description: 'Luxurious oceanfront suite with stunning views',
      roomType: 'Suite',
      capacityAdults: 2,
      capacityChildren: 1,
      image: 'https://example.com/rooms/deluxe.jpg',
    };

    describe('basic functionality', () => {
      it('should build HotelRoom JSON-LD structure', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        expect(result).toMatchObject({
          '@context': 'https://schema.org',
          '@type': 'HotelRoom',
          name: 'Deluxe Ocean Suite',
          url: mockCanonicalUrl,
        });
      });

      it('should include occupancy with total capacity', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        expect(result.occupancy).toEqual({
          '@type': 'QuantitativeValue',
          maxValue: 3, // 2 adults + 1 child
        });
      });

      it('should estimate numberOfBeds based on room type', () => {
        const suiteRoom = { ...mockRoomInput, roomType: 'Suite', capacityAdults: 4 };
        const result = buildHotelRoomJsonLd(suiteRoom, mockCanonicalUrl);

        // Suite with 4 adults should estimate 2 beds
        expect(result.numberOfBeds).toBe(2);
      });

      it('should include optional description', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        expect(result.description).toBe('Luxurious oceanfront suite with stunning views');
      });

      it('should include optional image', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        expect(result.image).toBe('https://example.com/rooms/deluxe.jpg');
      });
    });

    describe('numberOfBeds estimation logic', () => {
      it('should estimate 1 bed for single occupancy rooms', () => {
        const singleRoom = { ...mockRoomInput, capacityAdults: 1, capacityChildren: 0 };
        const result = buildHotelRoomJsonLd(singleRoom, mockCanonicalUrl);

        expect(result.numberOfBeds).toBe(1);
      });

      it('should estimate beds for suite rooms', () => {
        const suiteRoom = { ...mockRoomInput, roomType: 'suite', capacityAdults: 2 };
        const result = buildHotelRoomJsonLd(suiteRoom, mockCanonicalUrl);

        // Suite with 2 adults: floor(2/2) = 1, max(1, 1) = 1
        expect(result.numberOfBeds).toBe(1);
      });

      it('should estimate more beds for family rooms', () => {
        const familyRoom = { ...mockRoomInput, roomType: 'family', capacityAdults: 2 };
        const result = buildHotelRoomJsonLd(familyRoom, mockCanonicalUrl);

        // Family room with 2 adults: ceil(2/2) = 1, max(2, 1) = 2
        expect(result.numberOfBeds).toBe(2);
      });

      it('should estimate beds for standard rooms with >2 adults', () => {
        const standardRoom = { ...mockRoomInput, roomType: 'standard', capacityAdults: 3 };
        const result = buildHotelRoomJsonLd(standardRoom, mockCanonicalUrl);

        // 3 adults: ceil(3/2) = 2
        expect(result.numberOfBeds).toBe(2);
      });

      it('should handle case-insensitive room type matching', () => {
        const suiteRoom = { ...mockRoomInput, roomType: 'DELUXE SUITE', capacityAdults: 2 };
        const result = buildHotelRoomJsonLd(suiteRoom, mockCanonicalUrl);

        expect(result.numberOfBeds).toBe(1);
      });
    });

    describe('occupancy calculation', () => {
      it('should sum adults and children for total occupancy', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        expect(result.occupancy?.maxValue).toBe(3);
      });

      it('should handle zero children', () => {
        const roomWithoutChildren = { ...mockRoomInput, capacityChildren: 0 };
        const result = buildHotelRoomJsonLd(roomWithoutChildren, mockCanonicalUrl);

        expect(result.occupancy?.maxValue).toBe(2);
      });

      it('should handle undefined children', () => {
        const roomWithUndefinedChildren: RoomJsonLdInput = {
          ...mockRoomInput,
          capacityChildren: undefined as unknown as number,
        };
        const result = buildHotelRoomJsonLd(roomWithUndefinedChildren, mockCanonicalUrl);

        expect(result.occupancy?.maxValue).toBe(2);
      });
    });

    describe('optional fields', () => {
      it('should handle missing description', () => {
        const roomWithoutDescription = { ...mockRoomInput, description: undefined };
        const result = buildHotelRoomJsonLd(roomWithoutDescription, mockCanonicalUrl);

        expect(result).not.toHaveProperty('description');
      });

      it('should handle missing image', () => {
        const roomWithoutImage = { ...mockRoomInput, image: undefined };
        const result = buildHotelRoomJsonLd(roomWithoutImage, mockCanonicalUrl);

        expect(result).not.toHaveProperty('image');
      });

      it('should handle missing room type', () => {
        const roomWithoutType = { ...mockRoomInput, roomType: undefined };
        const result = buildHotelRoomJsonLd(roomWithoutType, mockCanonicalUrl);

        // Should still generate valid JSON-LD
        expect(result).toHaveProperty('@type', 'HotelRoom');
        expect(result.numberOfBeds).toBe(1); // Default to 1 bed
      });
    });

    describe('Schema.org compliance', () => {
      it('should follow Schema.org HotelRoom structure', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        // Required properties
        expect(result).toHaveProperty('@context', 'https://schema.org');
        expect(result).toHaveProperty('@type', 'HotelRoom');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('url');
        expect(result).toHaveProperty('occupancy');
      });

      it('should have occupancy with QuantitativeValue structure', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        expect(result.occupancy).toMatchObject({
          '@type': 'QuantitativeValue',
          maxValue: expect.any(Number),
        });
      });

      it('should be serializable to JSON', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        expect(() => JSON.stringify(result)).not.toThrow();
        expect(JSON.parse(JSON.stringify(result))).toMatchObject({
          '@context': 'https://schema.org',
          '@type': 'HotelRoom',
        });
      });
    });

    describe('type compatibility', () => {
      it('should be compatible with Record<string, unknown>', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        // Should be assignable to Record<string, unknown>
        const record: Record<string, unknown> = result;

        expect(record['@context']).toBe('https://schema.org');
        expect(record['@type']).toBe('HotelRoom');
      });

      it('should work with JsonLdScript component', () => {
        const result = buildHotelRoomJsonLd(mockRoomInput, mockCanonicalUrl);

        // Should have all properties needed for JsonLdScript
        expect(result).toHaveProperty('@context');
        expect(result).toHaveProperty('@type');
        expect(result).toHaveProperty('name');
        expect(result).toHaveProperty('url');
      });
    });

    describe('edge cases', () => {
      it('should handle room with no children capacity', () => {
        const roomWithoutChildren = { ...mockRoomInput, capacityChildren: 0 };
        const result = buildHotelRoomJsonLd(roomWithoutChildren, mockCanonicalUrl);

        expect(result.occupancy?.maxValue).toBe(2);
      });

      it('should handle room with only children capacity', () => {
        const roomWithOnlyChildren = {
          ...mockRoomInput,
          capacityAdults: 0,
          capacityChildren: 3,
        };
        const result = buildHotelRoomJsonLd(roomWithOnlyChildren, mockCanonicalUrl);

        expect(result.occupancy?.maxValue).toBe(3);
      });

      it('should handle very large capacity rooms', () => {
        const largeRoom = { ...mockRoomInput, capacityAdults: 8, capacityChildren: 4 };
        const result = buildHotelRoomJsonLd(largeRoom, mockCanonicalUrl);

        expect(result.occupancy?.maxValue).toBe(12);
        expect(result.numberOfBeds).toBeGreaterThan(1);
      });
    });
  });
});

// ============================================================================
// REVIEWS AGGREGATE JSON-LD TESTS (Story 24.7)
// ============================================================================

describe('buildReviewsAggregateJsonLd (Story 24.7)', () => {
  const hotelName = 'Test Hotel';

  const mockReviews: ReviewJsonLdInput[] = [
    {
      authorName: 'John Doe',
      rating: 5,
      reviewBody: 'Excellent stay!',
      datePublished: '2024-01-15',
    },
    {
      authorName: 'Jane Smith',
      rating: 4,
      reviewBody: 'Very good experience',
      datePublished: '2024-01-10',
    },
    {
      authorName: 'Bob Johnson',
      rating: 5,
      reviewBody: 'Amazing hotel!',
      datePublished: '2024-01-05',
    },
  ];

  describe('basic functionality', () => {
    it('should calculate average rating correctly', () => {
      const result = buildReviewsAggregateJsonLd(mockReviews, hotelName);

      expect(result?.ratingValue).toBe(4.7); // (5 + 4 + 5) / 3 = 4.666... rounded to 4.7
    });

    it('should count reviews correctly', () => {
      const result = buildReviewsAggregateJsonLd(mockReviews, hotelName);

      expect(result?.reviewCount).toBe(3);
    });

    it('should include hotel name in itemReviewed', () => {
      const result = buildReviewsAggregateJsonLd(mockReviews, hotelName);

      expect(result?.itemReviewed).toEqual({
        '@type': 'Organization',
        name: hotelName,
      });
    });
  });

  describe('rating calculation', () => {
    it('should handle perfect 5-star ratings', () => {
      const fiveStarReviews: ReviewJsonLdInput[] = [
        { authorName: 'A', rating: 5 },
        { authorName: 'B', rating: 5 },
      ];
      const result = buildReviewsAggregateJsonLd(fiveStarReviews, hotelName);

      expect(result?.ratingValue).toBe(5);
    });

    it('should handle low ratings', () => {
      const lowReviews: ReviewJsonLdInput[] = [
        { authorName: 'A', rating: 1 },
        { authorName: 'B', rating: 2 },
      ];
      const result = buildReviewsAggregateJsonLd(lowReviews, hotelName);

      expect(result?.ratingValue).toBe(1.5);
    });

    it('should round to 1 decimal place', () => {
      const variedReviews: ReviewJsonLdInput[] = [
        { authorName: 'A', rating: 5 },
        { authorName: 'B', rating: 4 },
        { authorName: 'C', rating: 4 },
      ];
      const result = buildReviewsAggregateJsonLd(variedReviews, hotelName);

      // (5 + 4 + 4) / 3 = 4.333... should round to 4.3
      expect(result?.ratingValue).toBe(4.3);
    });

    it('should handle single review', () => {
      const singleReview: ReviewJsonLdInput[] = [
        { authorName: 'A', rating: 3 },
      ];
      const result = buildReviewsAggregateJsonLd(singleReview, hotelName);

      expect(result?.ratingValue).toBe(3);
      expect(result?.reviewCount).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should return null for empty array', () => {
      const result = buildReviewsAggregateJsonLd([], hotelName);

      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = buildReviewsAggregateJsonLd(undefined as unknown as ReviewJsonLdInput[], hotelName);

      expect(result).toBeNull();
    });

    it('should handle reviews without optional fields', () => {
      const minimalReviews: ReviewJsonLdInput[] = [
        { authorName: 'A', rating: 5 },
        { authorName: 'B', rating: 4 },
      ];
      const result = buildReviewsAggregateJsonLd(minimalReviews, hotelName);

      expect(result).toBeDefined();
      expect(result?.ratingValue).toBe(4.5);
    });
  });

  describe('Schema.org compliance', () => {
    it('should follow Schema.org AggregateRating structure', () => {
      const result = buildReviewsAggregateJsonLd(mockReviews, hotelName);

      expect(result).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'AggregateRating',
        itemReviewed: {
          '@type': 'Organization',
          name: hotelName,
        },
        ratingValue: expect.any(Number),
        reviewCount: expect.any(Number),
        bestRating: 5,
        worstRating: 1,
      });
    });

    it('should be serializable to JSON', () => {
      const result = buildReviewsAggregateJsonLd(mockReviews, hotelName);

      expect(() => JSON.stringify(result)).not.toThrow();
      const parsed = JSON.parse(JSON.stringify(result));
      expect(parsed).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'AggregateRating',
      });
    });
  });

  describe('type compatibility', () => {
    it('should be compatible with Record<string, unknown>', () => {
      const result = buildReviewsAggregateJsonLd(mockReviews, hotelName);

      if (result) {
        const record: Record<string, unknown> = result;
        expect(record['@context']).toBe('https://schema.org');
        expect(record['@type']).toBe('AggregateRating');
      }
    });

    it('should work with JsonLdScript component', () => {
      const result = buildReviewsAggregateJsonLd(mockReviews, hotelName);

      if (result) {
        expect(result).toHaveProperty('@context');
        expect(result).toHaveProperty('@type');
        expect(result).toHaveProperty('itemReviewed');
        expect(result).toHaveProperty('ratingValue');
        expect(result).toHaveProperty('reviewCount');
      }
    });
  });
});

// ============================================================================
// FAQ PAGE JSON-LD TESTS (Story 24.10)
// ============================================================================

describe('buildFAQPageJsonLd (Story 24.10)', () => {
  const mockFAQs: FAQJsonLdInput[] = [
    {
      question: 'What is your cancellation policy?',
      answer: 'Free cancellation up to 24 hours before check-in.',
    },
    {
      question: 'Do you offer parking?',
      answer: 'Yes, we have free on-site parking available.',
    },
    {
      question: 'Is breakfast included?',
      answer: 'Continental breakfast is included for all guests.',
    },
  ];

  describe('basic functionality', () => {
    it('should build FAQPage JSON-LD structure', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      expect(result).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: expect.any(Array),
      });
    });

    it('should include all FAQ items as mainEntity', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      expect(result?.mainEntity).toHaveLength(3);
      expect(result?.mainEntity?.[0]).toMatchObject({
        '@type': 'Question',
        name: 'What is your cancellation policy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Free cancellation up to 24 hours before check-in.',
        },
      });
    });

    it('should preserve question and answer text', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      expect(result?.mainEntity?.[1]).toMatchObject({
        '@type': 'Question',
        name: 'Do you offer parking?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we have free on-site parking available.',
        },
      });
    });
  });

  describe('edge cases', () => {
    it('should return null for empty array', () => {
      const result = buildFAQPageJsonLd([]);

      expect(result).toBeNull();
    });

    it('should return null for undefined input', () => {
      const result = buildFAQPageJsonLd(undefined as unknown as FAQJsonLdInput[]);

      expect(result).toBeNull();
    });

    it('should handle single FAQ item', () => {
      const singleFAQ: FAQJsonLdInput[] = [
        {
          question: 'Test question?',
          answer: 'Test answer.',
        },
      ];
      const result = buildFAQPageJsonLd(singleFAQ);

      expect(result?.mainEntity).toHaveLength(1);
      expect(result?.mainEntity?.[0]).toMatchObject({
        '@type': 'Question',
        name: 'Test question?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Test answer.',
        },
      });
    });

    it('should handle many FAQ items', () => {
      const manyFAQs: FAQJsonLdInput[] = Array.from({ length: 15 }, (_, i) => ({
        question: `Question ${i + 1}?`,
        answer: `Answer ${i + 1}.`,
      }));
      const result = buildFAQPageJsonLd(manyFAQs);

      expect(result?.mainEntity).toHaveLength(15);
    });
  });

  describe('Schema.org compliance', () => {
    it('should follow Schema.org FAQPage structure', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      expect(result).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: expect.arrayContaining([
          expect.objectContaining({
            '@type': 'Question',
            name: expect.any(String),
            acceptedAnswer: expect.objectContaining({
              '@type': 'Answer',
              text: expect.any(String),
            }),
          }),
        ]),
      });
    });

    it('should be serializable to JSON', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      expect(() => JSON.stringify(result)).not.toThrow();
      const parsed = JSON.parse(JSON.stringify(result));
      expect(parsed).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
      });
    });
  });

  describe('type compatibility', () => {
    it('should be compatible with Record<string, unknown>', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      if (result) {
        const record: Record<string, unknown> = result;
        expect(record['@context']).toBe('https://schema.org');
        expect(record['@type']).toBe('FAQPage');
      }
    });

    it('should work with JsonLdScript component', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      if (result) {
        expect(result).toHaveProperty('@context');
        expect(result).toHaveProperty('@type');
        expect(result).toHaveProperty('mainEntity');
      }
    });
  });

  describe('Google Rich Results compatibility', () => {
    it('should have correct structure for Google FAQ rich results', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      // Google requires @type: "Question" with name and acceptedAnswer
      const firstQuestion = result?.mainEntity?.[0];
      expect(firstQuestion).toHaveProperty('@type', 'Question');
      expect(firstQuestion).toHaveProperty('name');
      expect(firstQuestion).toHaveProperty('acceptedAnswer');

      // acceptedAnswer must have @type: "Answer" and text
      const answer = firstQuestion?.acceptedAnswer;
      expect(answer).toHaveProperty('@type', 'Answer');
      expect(answer).toHaveProperty('text');
    });

    it('should handle all FAQ items for rich results', () => {
      const result = buildFAQPageJsonLd(mockFAQs);

      result?.mainEntity?.forEach((item) => {
        expect(item).toHaveProperty('@type', 'Question');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('acceptedAnswer');
        expect(item.acceptedAnswer).toHaveProperty('@type', 'Answer');
        expect(item.acceptedAnswer).toHaveProperty('text');
      });
    });
  });
});
