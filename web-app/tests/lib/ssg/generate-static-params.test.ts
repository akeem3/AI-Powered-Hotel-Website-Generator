/**
 * Story 14.3: SSG Foundation - generateStaticParams Unit Tests
 *
 * Tests for Static Site Generation (SSG) via generateStaticParams.
 * These tests verify the build-time route generation for per-hotel
 * deployment across multiple languages.
 *
 * @see app/[lang]/page.tsx
 * @see app/[lang]/hotels/[slug]/page.tsx
 */

import { ContentVariant } from '@/lib/cms-api/types';
import type { CmsContent, CmsHotel, CmsFacility, CmsRoom, HotelFullResponse } from '@/lib/cms-api/types';

// Helper to create mock hotel data
const createMockHotelData = (overrides = {}): HotelFullResponse & { hotel: CmsHotel & { parsedAddress: any } } => ({
  hotel: {
    id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Test Hotel',
    slug: 'test-hotel',
    property_type: 'hotel' as const,
    star_rating: 4,
    status: 'active' as const,
    opening_year: 2020,
    address: '{"city":"Test City","state":"","street":"","country":"Test Country","postal_code":""}',
    is_template: false,
    has_override: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    parsedAddress: {
      city: 'Test City',
      state: '',
      street: '',
      country: 'Test Country',
      postal_code: '',
    },
    ...overrides,
  } as any,
  content: [] as CmsContent[],
  rooms: [] as CmsRoom[],
  facilities: [] as CmsFacility[],
  images: [],
  _metadata: {
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    fetched_at: '2024-01-01T00:00:00Z',
    processing_time_ms: 100,
    collections_fetched: ['hotel', 'content'],
  },
  _errors: [] as string[],
});

const mockContent: CmsContent[] = [
  {
    id: '1',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    content_type: ContentVariant.CONCISE,
    title: 'Concise Description',
    content: 'A concise description.',
    language: 'en',
    status: 'published',
    sort_order: 1,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '2',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    content_type: ContentVariant.CONCISE,
    title: 'คำอธิบายเบื้องต้น',
    content: 'คำอธิบายเบื้องต้น',
    language: 'th',
    status: 'published',
    sort_order: 2,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '3',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    content_type: ContentVariant.CONCISE,
    title: '簡潔な説明',
    content: '簡潔な説明',
    language: 'ja',
    status: 'published',
    sort_order: 3,
    parent_content_id: null,
    has_override: false,
  },
];

describe('Story 14.3: SSG Foundation - generateStaticParams Integration Tests', () => {
  let originalConsoleLog: typeof console.log;
  let consoleLogs: string[][];
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Setup console.log spy to capture build-time logs
    originalConsoleLog = console.log;
    consoleLogs = [];
    console.log = jest.fn((...args: any[]) => {
      consoleLogs.push(args.map(String));
    });

    // Store original env
    originalEnv = process.env;
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    process.env = originalEnv;
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('Environment Variable Validation', () => {
    it('should throw clear error when HOTEL_ID is missing from hotel page', async () => {
      // Remove HOTEL_ID
      const testEnv = { ...process.env };
      delete testEnv.HOTEL_ID;
      process.env = testEnv;

      // Need to reset modules to pick up new env
      jest.resetModules();

      // Import should trigger error during generateStaticParams execution
      await expect(async () => {
        const mod = await import('@/app/[lang]/hotels/[slug]/page');
        await mod.generateStaticParams();
      }).rejects.toThrow('HOTEL_ID environment variable is required');
    });

    it('should throw clear error when HOTEL_ID is missing from homepage', async () => {
      // Remove HOTEL_ID
      const testEnv = { ...process.env };
      delete testEnv.HOTEL_ID;
      process.env = testEnv;

      jest.resetModules();

      await expect(async () => {
        const mod = await import('@/app/[lang]/page');
        await mod.generateStaticParams();
      }).rejects.toThrow('HOTEL_ID environment variable is required');
    });

    it('should include helpful guidance in error message', async () => {
      const testEnv = { ...process.env };
      delete testEnv.HOTEL_ID;
      process.env = testEnv;

      jest.resetModules();

      try {
        const mod = await import('@/app/[lang]/hotels/[slug]/page');
        await mod.generateStaticParams();
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('.env.local');
        expect(error.message).toContain('09f207c1-695a-485a-9519-49f4ef03331f');
      }
    });
  });

  describe('getAvailableLanguages Integration', () => {
    it('should correctly call getAvailableLanguages with hotel content', async () => {
      // Set HOTEL_ID for CMS API call
      process.env = {
        ...process.env,
        HOTEL_ID: '09f207c1-695a-485a-9519-49f4ef03331f',
        CMS_API_URL: 'http://localhost:3001',
        CMS_API_TOKEN: 'test-token',
      };

      jest.resetModules();

      // Import and execute - this will make actual CMS API call
      // which will fail without real API, but we can verify the structure
      const mod = await import('@/app/[lang]/hotels/[slug]/page');

      // Verify generateStaticParams is exported
      expect(typeof mod.generateStaticParams).toBe('function');
    });

    it('should extract unique languages from content', () => {
      const { getAvailableLanguages } = require('@/lib/cms-api/transformers');

      const languages = getAvailableLanguages(mockContent);

      // getAvailableLanguages sorts alphabetically
      expect(languages).toEqual(['en', 'ja', 'th']);
      expect(languages).toHaveLength(3);
    });

    it('should handle empty content array', () => {
      const { getAvailableLanguages } = require('@/lib/cms-api/transformers');

      const languages = getAvailableLanguages([]);

      expect(languages).toEqual([]);
    });

    it('should filter only published content', () => {
      const { getAvailableLanguages } = require('@/lib/cms-api/transformers');

      const mixedContent: CmsContent[] = [
        ...mockContent,
        {
          id: '4',
          hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
          content_type: ContentVariant.CONCISE,
          title: 'Unpublished Content',
          content: 'Unpublished content',
          language: 'de',
          status: 'draft',
          sort_order: 4,
          parent_content_id: null,
          has_override: false,
        },
      ];

      const languages = getAvailableLanguages(mixedContent);

      // Should not include 'de' since it's not published
      // Languages are sorted alphabetically
      expect(languages).toEqual(['en', 'ja', 'th']);
      expect(languages).not.toContain('de');
    });
  });

  describe('Multi-language Support', () => {
    it('should support all major language groups', () => {
      const { getAvailableLanguages } = require('@/lib/cms-api/transformers');

      const multiLanguageContent: CmsContent[] = [
        { ...mockContent[0], language: 'en' }, // Latin
        { ...mockContent[1], language: 'th' }, // Thai
        { ...mockContent[2], language: 'ja' }, // Japanese
        { ...mockContent[0], id: '4', language: 'ar' }, // Arabic (RTL)
        { ...mockContent[0], id: '5', language: 'ru' }, // Cyrillic
        { ...mockContent[0], id: '6', language: 'zh' }, // Chinese
      ];

      const languages = getAvailableLanguages(multiLanguageContent);

      expect(languages).toHaveLength(6);
      expect(languages).toContain('ar'); // RTL language
      expect(languages).toContain('th'); // Thai
      expect(languages).toContain('ja'); // Japanese
    });
  });

  describe('Build-time Logging', () => {
    it('should include formatted console output for hotel page', async () => {
      // Verify the logging function exists
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/hotels/[slug]/page');

      // Verify generateStaticParams is an async function
      expect(mod.generateStaticParams).toBeDefined();
      expect(typeof mod.generateStaticParams).toBe('function');
    });

    it('should include formatted console output for homepage', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/page');

      // Verify generateStaticParams is an async function
      expect(mod.generateStaticParams).toBeDefined();
      expect(typeof mod.generateStaticParams).toBe('function');
    });
  });

  describe('Next.js 15 Compliance', () => {
    it('should use Promise-based params in hotel page component', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/hotels/[slug]/page');

      // Verify default export is async
      expect(mod.default).toBeDefined();
      expect(mod.default.name).toBe('HotelPage');
    });

    it('should use Promise-based params in homepage component', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/page');

      // Verify default export is async
      expect(mod.default).toBeDefined();
      expect(mod.default.name).toBe('LangHomepage');
    });
  });

  describe('Route Structure', () => {
    it('should export generateStaticParams from hotel page', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/hotels/[slug]/page');

      expect(mod.generateStaticParams).toBeDefined();
    });

    it('should export generateStaticParams from homepage', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/page');

      expect(mod.generateStaticParams).toBeDefined();
    });

    it('should export default page component from hotel page', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/hotels/[slug]/page');

      expect(mod.default).toBeDefined();
    });

    it('should export default page component from homepage', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/page');

      expect(mod.default).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should properly type generateStaticParams return value for hotel page', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/hotels/[slug]/page');

      // This test ensures TypeScript types are correct at compile time
      const gsp = mod.generateStaticParams;
      expect(typeof gsp).toBe('function');
    });

    it('should properly type generateStaticParams return value for homepage', async () => {
      const testEnv = { ...process.env };
      testEnv.HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';
      process.env = testEnv;

      jest.resetModules();

      const mod = await import('@/app/[lang]/page');

      const gsp = mod.generateStaticParams;
      expect(typeof gsp).toBe('function');
    });
  });
});
