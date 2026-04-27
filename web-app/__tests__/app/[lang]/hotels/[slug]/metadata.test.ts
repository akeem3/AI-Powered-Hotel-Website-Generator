/**
 * Integration Tests for Hotel Page Metadata
 *
 * @module app/[lang]/hotels/[slug]
 * @see ./page.tsx
 */

import { render } from '@testing-library/react';
import { SITE_URL } from '@/lib/metadata/hotel-metadata';
import type { HotelFullResponse, CmsContent, CmsImage, CmsAddress } from '@/lib/cms-api/types';
import { ContentVariant } from '@/lib/cms-api/types';

// Valid UUID for testing
const TEST_HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SITE_URL: 'https://example.com',
  HOTEL_ID: TEST_HOTEL_ID,
} as const;

// Helper to create mock hotel data
const createMockHotelFullResponse = (
  overrides: Partial<HotelFullResponse> = {}
): HotelFullResponse & {
  hotel: {
    parsedAddress: CmsAddress;
  } & HotelFullResponse['hotel'];
} => ({
  hotel: {
    id: TEST_HOTEL_ID,
    name: 'Test Hotel',
    slug: 'test-hotel',
    property_type: 'hotel' as const,
    star_rating: 4,
    status: 'active' as const,
    opening_year: 2020,
    address: JSON.stringify({
      city: 'Test City',
      state: 'Test State',
      street: '123 Test Street',
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
      street: '123 Test Street',
      country: 'Test Country',
      postal_code: '12345',
    },
  },
  content: [],
  rooms: [],
  facilities: [],
  images: [],
  _metadata: {
    hotel_id: TEST_HOTEL_ID,
    fetched_at: '2024-01-01T00:00:00Z',
    processing_time_ms: 150,
    collections_fetched: ['hotel', 'content', 'rooms', 'facilities', 'images'],
  },
  _errors: [],
  ...overrides,
}) as any;

// Mock content with all variants
const mockContentAllVariants: CmsContent[] = [
  {
    id: '1',
    hotel_id: TEST_HOTEL_ID,
    content_type: ContentVariant.CONCISE,
    title: ContentVariant.CONCISE,
    content: 'A concise test description for metadata.',
    language: 'en',
    status: 'available',
    sort_order: 1,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '2',
    hotel_id: TEST_HOTEL_ID,
    content_type: ContentVariant.STANDARD,
    title: ContentVariant.STANDARD,
    content: 'Experience luxury at our beautiful test hotel with stunning views.',
    language: 'en',
    status: 'available',
    sort_order: 2,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '3',
    hotel_id: TEST_HOTEL_ID,
    content_type: ContentVariant.EXTENDED,
    title: ContentVariant.EXTENDED,
    content: 'Welcome to our award-winning test hotel. Nestled in the heart of Test City, our luxury hotel offers breathtaking views, world-class service, and exceptional comfort.',
    language: 'en',
    status: 'available',
    sort_order: 3,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '4',
    hotel_id: TEST_HOTEL_ID,
    content_type: ContentVariant.CONCISE,
    title: ContentVariant.CONCISE,
    content: 'ทดสอบโรงแรม',
    language: 'th',
    status: 'available',
    sort_order: 4,
    parent_content_id: null,
    has_override: false,
  },
];

// Mock images
const mockImages: CmsImage[] = [
  {
    id: 'img1',
    hotel_id: TEST_HOTEL_ID,
    url: 'https://example.com/img1.jpg',
    alt_text: 'Hotel exterior',
    category: 'exterior',
    sort_order: 1,
    is_featured: true,
    status: 'available',
  },
];

// Mock params
const mockParams = Promise.resolve({
  lang: 'en',
  slug: 'test-hotel',
});

describe('Hotel Page - generateMetadata', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = process.env;

    // Mock environment
    process.env = { ...process.env, ...mockEnv } as any;

    // Mock the CMS API client
    jest.doMock('@/lib/cms-api', () => ({
      getHotelFull: jest.fn().mockResolvedValue(
        createMockHotelFullResponse({
          content: mockContentAllVariants,
          images: mockImages,
        })
      ),
    }));
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('generateMetadata function', () => {
    it('should generate metadata object with all required fields', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      // Verify basic structure
      expect(metadata).toBeDefined();
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
      expect(metadata).toHaveProperty('alternates');
      expect(metadata).toHaveProperty('openGraph');
    });

    it('should generate title from hotel.name + location', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.title).toBe('Test Hotel | Test City, Test Country');
    });

    it('should generate meta description using concise variant', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata.description).toBe('A concise test description for metadata.');
    });

    it('should generate Open Graph tags', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      // Verify OpenGraph
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph).toHaveProperty('title');
      expect(metadata.openGraph).toHaveProperty('description');
      expect(metadata.openGraph).toHaveProperty('locale');
      expect(metadata.openGraph).toHaveProperty('type');
      expect(metadata.openGraph).toHaveProperty('url');
    });

    it('should generate canonical URL', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      // Verify canonical URL format: /{lang}/hotels/{slug}
      expect(metadata.alternates).toBeDefined();
      expect(metadata.alternates?.canonical).toBe('https://example.com/en/hotels/test-hotel');
    });

    it('should generate hreflang tags for all available languages', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      // Verify hreflang entries
      expect(metadata.alternates?.languages).toBeDefined();
      expect(metadata.alternates?.languages).toHaveProperty('en-US');
      expect(metadata.alternates?.languages).toHaveProperty('th-TH');
    });

    it('should omit og:image when images are null/empty', async () => {
      // Clear existing mocks and setup new one with empty images
      jest.resetModules();
      jest.doMock('@/lib/cms-api', () => ({
        getHotelFull: jest.fn().mockResolvedValue(
          createMockHotelFullResponse({
            content: mockContentAllVariants,
            images: null,
          })
        ),
      }));

      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      // Verify og:image is not present
      expect(metadata.openGraph?.images).toBeUndefined();
    });

    it('should include og:image when images are available', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      // Verify og:image is present
      expect(metadata.openGraph?.images).toBeDefined();
      expect(metadata.openGraph?.images).toEqual([{ url: 'https://example.com/images/img1' }]);
    });

    it('should generate keywords', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: mockParams });

      expect(metadata).toHaveProperty('keywords');
      expect(metadata.keywords).toContain('Test Hotel');
      expect(metadata.keywords).toContain('Test City');
    });
  });

  describe('Metadata values correctness', () => {
    it('should use correct locale code for English', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en', slug: 'test-hotel' }) });

      expect(metadata.openGraph?.locale).toBe('en-US');
    });

    it('should use correct locale code for Thai', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'th', slug: 'test-hotel' }) });

      expect(metadata.openGraph?.locale).toBe('th-TH');
    });

    it('should use correct locale code for Arabic', async () => {
      const { generateMetadata } = await import('@/app/[lang]/hotels/[slug]/page');
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'ar', slug: 'test-hotel' }) });

      expect(metadata.openGraph?.locale).toBe('ar-SA');
    });
  });
});
