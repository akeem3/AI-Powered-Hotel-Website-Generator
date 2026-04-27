/**
 * Sitemap Generation Tests
 *
 * Tests for Story 14.8: Sitemap Generation
 * Tests for Story 24.12: Extended sitemap for all sub-pages
 *
 * @module __tests__/app/sitemap
 */

import sitemap, { dynamic } from '@/app/sitemap';
import type { MetadataRoute } from 'next';

// Mock the CMS API client
jest.mock('@/lib/cms-api', () => ({
  getHotelFull: jest.fn(),
}));

// Mock the transformers
jest.mock('@/lib/cms-api/transformers', () => ({
  getAvailableLanguages: jest.fn(),
}));

// Mock the room slug loader
jest.mock('@/lib/loaders/room-slug', () => ({
  getAvailableRoomSlugs: jest.fn(),
}));

// Mock metadata constants
jest.mock('@/lib/metadata', () => ({
  SITE_URL: 'https://example.com',
  getExtendedLocaleCode: (lang: string) => {
    const localeMap: Record<string, string> = {
      en: 'en-US',
      th: 'th-TH',
      tr: 'tr-TR',
      ru: 'ru-RU',
    };
    return localeMap[lang] || `${lang}-${lang.toUpperCase()}`;
  },
}));

import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { getAvailableRoomSlugs } from '@/lib/loaders/room-slug';

const mockGetHotelFull = getHotelFull as jest.MockedFunction<typeof getHotelFull>;
const mockGetAvailableLanguages = getAvailableLanguages as jest.MockedFunction<typeof getAvailableLanguages>;
const mockGetAvailableRoomSlugs = getAvailableRoomSlugs as jest.MockedFunction<typeof getAvailableRoomSlugs>;

describe('sitemap.ts (Story 14.8 & Story 24.12)', () => {
  const mockHotelData = {
    hotel: {
      id: 'hotel-123',
      name: 'Test Hotel',
      slug: 'test-hotel',
      updated_at: '2025-01-15T10:30:00Z',
    },
    content: [
      { lang: 'en', title: 'English Title' },
      { lang: 'th', title: 'Thai Title' },
      { lang: 'tr', title: 'Turkish Title' },
    ],
  };

  const mockRoomSlugs = [
    { slug: 'deluxe-ocean-suite', name: 'Deluxe Ocean Suite', id: 'room-1' },
    { slug: 'standard-room', name: 'Standard Room', id: 'room-2' },
    { slug: 'family-suite', name: 'Family Suite', id: 'room-3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock environment variable
    process.env.HOTEL_ID = 'hotel-123';

    // Mock getHotelFull to return test data
    mockGetHotelFull.mockResolvedValue(mockHotelData as any);

    // Mock getAvailableLanguages to return ['en', 'th', 'tr']
    mockGetAvailableLanguages.mockReturnValue(['en', 'th', 'tr']);

    // Mock getAvailableRoomSlugs to return room slugs
    mockGetAvailableRoomSlugs.mockResolvedValue(mockRoomSlugs);
  });

  describe('static generation configuration', () => {
    it('should have dynamic set to force-static', () => {
      expect(dynamic).toBe('force-static');
    });
  });

  describe('Story 14.8: Core sitemap functionality', () => {
    it('should throw error when HOTEL_ID is not configured', async () => {
      delete process.env.HOTEL_ID;

      await expect(sitemap()).rejects.toThrow('HOTEL_ID environment variable is required');
    });

    it('should fetch hotel data using HOTEL_ID from environment', async () => {
      await sitemap();

      expect(mockGetHotelFull).toHaveBeenCalledWith('hotel-123');
    });

    it('should extract available languages from content', async () => {
      await sitemap();

      expect(mockGetAvailableLanguages).toHaveBeenCalledWith(mockHotelData.content);
    });
  });

  describe('Story 24.12: Homepage entries (priority: 1.0, daily)', () => {
    it('should generate homepage entries for all languages', async () => {
      const result = await sitemap();

      const homepageEntries = result.filter((entry) => entry.url.match(/^https:\/\/example\.com\/[a-z]{2}$/));

      expect(homepageEntries).toHaveLength(3); // en, th, tr
    });

    it('should set homepage priority to 1.0', async () => {
      const result = await sitemap();

      const homepageEntry = result.find((entry) => entry.url === 'https://example.com/en');

      expect(homepageEntry?.priority).toBe(1.0);
    });

    it('should set homepage changeFrequency to daily', async () => {
      const result = await sitemap();

      const homepageEntry = result.find((entry) => entry.url === 'https://example.com/en');

      expect(homepageEntry?.changeFrequency).toBe('daily');
    });

    it('should include hreflang alternates for homepage', async () => {
      const result = await sitemap();

      const homepageEntry = result.find((entry) => entry.url === 'https://example.com/en');

      expect(homepageEntry?.alternates?.languages).toBeDefined();
      expect(homepageEntry?.alternates?.languages['en-US']).toBe('https://example.com/en');
      expect(homepageEntry?.alternates?.languages['th-TH']).toBe('https://example.com/th');
      expect(homepageEntry?.alternates?.languages['tr-TR']).toBe('https://example.com/tr');
    });

    it('should set x-default to first available language', async () => {
      const result = await sitemap();

      const homepageEntry = result.find((entry) => entry.url === 'https://example.com/en');

      expect(homepageEntry?.alternates?.languages['x-default']).toBe('https://example.com/en');
    });
  });

  describe('Story 24.12: Rooms listing page (priority: 0.9, weekly)', () => {
    it('should generate rooms listing entries for all languages', async () => {
      const result = await sitemap();

      const roomsEntries = result.filter((entry) => entry.url.match(/\/[a-z]{2}\/rooms$/) && !entry.url.match(/\/rooms\/[^/]+$/));

      expect(roomsEntries).toHaveLength(3); // en, th, tr
    });

    it('should set rooms listing priority to 0.9', async () => {
      const result = await sitemap();

      const roomsEntry = result.find((entry) => entry.url.endsWith('/en/rooms') && !entry.url.match(/\/rooms\/[^/]+$/));

      expect(roomsEntry?.priority).toBe(0.9);
    });

    it('should set rooms listing changeFrequency to weekly', async () => {
      const result = await sitemap();

      const roomsEntry = result.find((entry) => entry.url.endsWith('/en/rooms') && !entry.url.match(/\/rooms\/[^/]+$/));

      expect(roomsEntry?.changeFrequency).toBe('weekly');
    });

    it('should include hreflang alternates for rooms listing', async () => {
      const result = await sitemap();

      const roomsEntry = result.find((entry) => entry.url.endsWith('/en/rooms') && !entry.url.match(/\/rooms\/[^/]+$/));

      expect(roomsEntry?.alternates?.languages).toBeDefined();
      expect(roomsEntry?.alternates?.languages['en-US']).toBe('https://example.com/en/rooms');
      expect(roomsEntry?.alternates?.languages['th-TH']).toBe('https://example.com/th/rooms');
      expect(roomsEntry?.alternates?.languages['tr-TR']).toBe('https://example.com/tr/rooms');
    });
  });

  describe('Story 24.12: Room detail pages (priority: 0.8, monthly)', () => {
    it('should fetch available room slugs', async () => {
      await sitemap();

      expect(mockGetAvailableRoomSlugs).toHaveBeenCalledWith('hotel-123');
    });

    it('should generate room detail entries for all rooms and languages', async () => {
      const result = await sitemap();

      const roomDetailEntries = result.filter((entry) => entry.url.match(/\/[a-z]{2}\/rooms\/[^/]+$/));

      expect(roomDetailEntries).toHaveLength(9); // 3 rooms × 3 languages
    });

    it('should set room detail priority to 0.8', async () => {
      const result = await sitemap();

      const roomDetailEntry = result.find((entry) => entry.url.endsWith('/en/rooms/deluxe-ocean-suite'));

      expect(roomDetailEntry?.priority).toBe(0.8);
    });

    it('should set room detail changeFrequency to monthly', async () => {
      const result = await sitemap();

      const roomDetailEntry = result.find((entry) => entry.url.endsWith('/en/rooms/deluxe-ocean-suite'));

      expect(roomDetailEntry?.changeFrequency).toBe('monthly');
    });

    it('should include hreflang alternates for each room detail page', async () => {
      const result = await sitemap();

      const roomDetailEntry = result.find((entry) => entry.url.endsWith('/en/rooms/deluxe-ocean-suite'));

      expect(roomDetailEntry?.alternates?.languages).toBeDefined();
      expect(roomDetailEntry?.alternates?.languages['en-US']).toBe('https://example.com/en/rooms/deluxe-ocean-suite');
      expect(roomDetailEntry?.alternates?.languages['th-TH']).toBe('https://example.com/th/rooms/deluxe-ocean-suite');
      expect(roomDetailEntry?.alternates?.languages['tr-TR']).toBe('https://example.com/tr/rooms/deluxe-ocean-suite');
    });

    it('should handle empty room slugs array', async () => {
      mockGetAvailableRoomSlugs.mockResolvedValue([]);

      const result = await sitemap();

      const roomDetailEntries = result.filter((entry) => entry.url.match(/\/[a-z]{2}\/rooms\/[^/]+$/));

      expect(roomDetailEntries).toHaveLength(0);
    });
  });

  describe('Story 24.12: Sub-pages (priority: 0.7, monthly)', () => {
    const subPages = ['gallery', 'amenities', 'reviews', 'contact', 'about', 'faq'];

    it(`should generate entries for all ${subPages.length} sub-pages`, async () => {
      const result = await sitemap();

      for (const subPage of subPages) {
        const entries = result.filter((entry) => entry.url.match(new RegExp(`/[a-z]{2}/${subPage}$`)));

        expect(entries.length).toBeGreaterThan(0);
        expect(entries).toHaveLength(3); // 3 languages
      }
    });

    it('should set sub-page priority to 0.7', async () => {
      const result = await sitemap();

      const galleryEntry = result.find((entry) => entry.url.endsWith('/en/gallery'));

      expect(galleryEntry?.priority).toBe(0.7);
    });

    it('should set sub-page changeFrequency to monthly', async () => {
      const result = await sitemap();

      const amenitiesEntry = result.find((entry) => entry.url.endsWith('/en/amenities'));

      expect(amenitiesEntry?.changeFrequency).toBe('monthly');
    });

    it('should include hreflang alternates for sub-pages', async () => {
      const result = await sitemap();

      const reviewsEntry = result.find((entry) => entry.url.endsWith('/en/reviews'));

      expect(reviewsEntry?.alternates?.languages).toBeDefined();
      expect(reviewsEntry?.alternates?.languages['en-US']).toBe('https://example.com/en/reviews');
      expect(reviewsEntry?.alternates?.languages['th-TH']).toBe('https://example.com/th/reviews');
      expect(reviewsEntry?.alternates?.languages['tr-TR']).toBe('https://example.com/tr/reviews');
    });

    subPages.forEach((subPage) => {
      it(`should generate ${subPage} entries for all languages`, async () => {
        const result = await sitemap();

        const entries = result.filter((entry) => entry.url.match(new RegExp(`/[a-z]{2}/${subPage}$`)));

        expect(entries).toHaveLength(3); // 3 languages
      });
    });
  });

  describe('Story 14.8: Hotel detail pages (backward compatibility)', () => {
    it('should generate hotel detail entries for all languages', async () => {
      const result = await sitemap();

      const hotelDetailEntries = result.filter((entry) => entry.url.includes('/hotels/'));

      expect(hotelDetailEntries).toHaveLength(3); // en, th, tr
    });

    it('should set hotel detail priority to 0.7', async () => {
      const result = await sitemap();

      const hotelDetailEntry = result.find((entry) => entry.url.endsWith('/en/hotels/test-hotel'));

      expect(hotelDetailEntry?.priority).toBe(0.7);
    });

    it('should set hotel detail changeFrequency to monthly', async () => {
      const result = await sitemap();

      const hotelDetailEntry = result.find((entry) => entry.url.endsWith('/en/hotels/test-hotel'));

      expect(hotelDetailEntry?.changeFrequency).toBe('monthly');
    });

    it('should include hreflang alternates for hotel detail pages', async () => {
      const result = await sitemap();

      const hotelDetailEntry = result.find((entry) => entry.url.endsWith('/en/hotels/test-hotel'));

      expect(hotelDetailEntry?.alternates?.languages).toBeDefined();
      expect(hotelDetailEntry?.alternates?.languages['en-US']).toBe('https://example.com/en/hotels/test-hotel');
      expect(hotelDetailEntry?.alternates?.languages['th-TH']).toBe('https://example.com/th/hotels/test-hotel');
      expect(hotelDetailEntry?.alternates?.languages['tr-TR']).toBe('https://example.com/tr/hotels/test-hotel');
    });
  });

  describe('Combined sitemap structure', () => {
    it('should include all expected page types', async () => {
      const result = await sitemap();

      // Homepage entries (3 languages)
      const homepageEntries = result.filter((entry) => !entry.url.includes('/rooms') && !entry.url.includes('/hotels') && !entry.url.includes('/gallery') && !entry.url.includes('/amenities') && !entry.url.includes('/reviews') && !entry.url.includes('/contact') && !entry.url.includes('/about') && !entry.url.includes('/faq'));

      // Rooms listing entries (3 languages)
      const roomsListingEntries = result.filter((entry) => entry.url.match(/\/[a-z]{2}\/rooms$/) && !entry.url.match(/\/rooms\/[^/]+$/));

      // Room detail entries (3 rooms × 3 languages)
      const roomDetailEntries = result.filter((entry) => entry.url.match(/\/[a-z]{2}\/rooms\/[^/]+$/));

      // Sub-page entries (6 sub-pages × 3 languages)
      const subPageEntries = result.filter((entry) => entry.url.match(/\/[a-z]{2}\/(gallery|amenities|reviews|contact|about|faq)$/));

      // Hotel detail entries (3 languages)
      const hotelDetailEntries = result.filter((entry) => entry.url.includes('/hotels/'));

      expect(homepageEntries).toHaveLength(3);
      expect(roomsListingEntries).toHaveLength(3);
      expect(roomDetailEntries).toHaveLength(9);
      expect(subPageEntries).toHaveLength(18); // 6 × 3
      expect(hotelDetailEntries).toHaveLength(3);

      // Total entries
      expect(result).toHaveLength(36); // 3 + 3 + 9 + 18 + 3
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle single language CMS', async () => {
      mockGetAvailableLanguages.mockReturnValue(['en']);

      const result = await sitemap();

      expect(result).toHaveLength(12); // 1 + 1 + 3 + 6 + 1 = 12
    });

    it('should handle two language CMS', async () => {
      mockGetAvailableLanguages.mockReturnValue(['en', 'th']);

      const result = await sitemap();

      expect(result).toHaveLength(24); // 2 + 2 + 6 + 12 + 2 = 24
    });

    it('should use first language as x-default when English not available', async () => {
      mockGetAvailableLanguages.mockReturnValue(['th', 'tr']);

      const result = await sitemap();

      const homepageEntry = result.find((entry) => entry.url.endsWith('/th'));

      expect(homepageEntry?.alternates?.languages['x-default']).toBe('https://example.com/th');
    });

    it('should set lastModified from hotel.updated_at', async () => {
      const result = await sitemap();

      const lastModified = new Date('2025-01-15T10:30:00Z');

      result.forEach((entry) => {
        expect(entry.lastModified).toEqual(lastModified);
      });
    });
  });
});
