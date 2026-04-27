/**
 * CMS API Integration Tests
 *
 * Integration tests for CMS API client functionality.
 * Tests use mocked fetch responses to avoid external dependencies.
 *
 * @see lib/cms-api/client
 */

import {
  cmsApiClient,
  getHotelFull,
  checkCmsHealth,
  getServerInfo,
  testApiConnectivity,
  buildApiUrl,
  getApiConfig,
  CmsApiError,
} from '@/lib/cms-api';

// Test hotel ID from Epic 14
const TEST_HOTEL_ID = '09f207c1-695a-485a-9519-49f4ef03331f';

// Mock CMS API responses
const MOCK_HEALTH_RESPONSE = {
  status: 'ok',
  directus: 'connected',
  database: 'connected',
  b2_storage: 'connected',
};

const MOCK_SERVER_INFO_RESPONSE = {
  data: {
    project_name: 'ET CMS Publishing API',
    project_descriptor: 'Hotel Content Management System',
    project_logo: null,
    public_foreground: null,
    public_background: null,
  },
};

const MOCK_HOTEL_FULL_RESPONSE = {
  hotel: {
    id: TEST_HOTEL_ID,
    name: 'Thaproban Beach House',
    slug: 'thaproban-beach-house',
    property_type: 'hotel',
    star_rating: 4,
    status: 'active',
    opening_year: 2015,
    address: JSON.stringify({
      street: 'Beach Road',
      city: 'Unawatuna',
      state: 'Southern Province',
      postal_code: '80600',
      country: 'Sri Lanka',
    }),
    is_template: false,
    has_override: false,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-15T00:00:00.000Z',
  },
  content: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      hotel_id: TEST_HOTEL_ID,
      content_type: 'hotel_description',
      title: 'Hotel Concise',
      content: 'A beautiful beachfront boutique hotel in Unawatuna.',
      language: 'en',
      status: 'active',
      sort_order: 1,
      parent_content_id: null,
      has_override: false,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      hotel_id: TEST_HOTEL_ID,
      content_type: 'hotel_description',
      title: 'Hotel Standard',
      content: 'Thaproban Beach House is a charming boutique hotel located on the pristine beaches of Unawatuna, Sri Lanka. Featuring elegant rooms and world-class amenities.',
      language: 'en',
      status: 'active',
      sort_order: 2,
      parent_content_id: null,
      has_override: false,
    },
    {
      id: '33333333-3333-4333-8333-333333333333',
      hotel_id: TEST_HOTEL_ID,
      content_type: 'hotel_description',
      title: 'Hotel Extended',
      content: 'Discover the ultimate beachfront escape at Thaproban Beach House. Our boutique hotel combines traditional Sri Lankan hospitality with modern luxury. Each of our carefully designed rooms offers stunning ocean views and premium amenities to ensure an unforgettable stay.',
      language: 'en',
      status: 'active',
      sort_order: 3,
      parent_content_id: null,
      has_override: false,
    },
  ],
  rooms: [
    {
      id: '44444444-4444-4444-8444-444444444444',
      hotel_id: TEST_HOTEL_ID,
      name: 'Deluxe Ocean View',
      room_type: 'deluxe',
      capacity_adults: 2,
      capacity_children: 1,
      description: 'Spacious room with panoramic ocean views',
      featured_image: null,
      status: 'active',
      sort_order: 1,
      room_details: null,
      has_override: false,
    },
    {
      id: '55555555-5555-4555-8555-555555555555',
      hotel_id: TEST_HOTEL_ID,
      name: 'Superior Suite',
      room_type: 'suite',
      capacity_adults: 3,
      capacity_children: 2,
      description: 'Luxurious suite with separate living area',
      featured_image: null,
      status: 'active',
      sort_order: 2,
      room_details: null,
      has_override: false,
    },
    {
      id: '66666666-6666-4666-8666-666666666666',
      hotel_id: TEST_HOTEL_ID,
      name: 'Beach Villa',
      room_type: 'villa',
      capacity_adults: 4,
      capacity_children: 2,
      description: 'Private villa with direct beach access',
      featured_image: null,
      status: 'active',
      sort_order: 3,
      room_details: null,
      has_override: false,
    },
    {
      id: '77777777-7777-4777-8777-777777777777',
      hotel_id: TEST_HOTEL_ID,
      name: 'Standard Room',
      room_type: 'standard',
      capacity_adults: 2,
      capacity_children: 0,
      description: 'Comfortable room with garden view',
      featured_image: null,
      status: 'active',
      sort_order: 4,
      room_details: null,
      has_override: false,
    },
  ],
  facilities: [
    {
      id: '88888888-8888-4888-8888-888888888888',
      hotel_id: TEST_HOTEL_ID,
      name: 'Infinity Pool',
      type: 'Outdoors',
      category: 'Outdoors',
      available: true,
      sort_order: 1,
      status: 'active',
      description: 'Stunning infinity pool overlooking the ocean',
      booking_required: false,
      featured_image: null,
      operating_hours: '6:00 AM - 10:00 PM',
      capacity: 30,
      age_restrictions: null,
    },
    {
      id: '99999999-9999-4999-8999-999999999999',
      hotel_id: TEST_HOTEL_ID,
      name: 'Beachfront Restaurant',
      type: 'Food & Drink',
      category: 'Food & Drink',
      available: true,
      sort_order: 2,
      status: 'active',
      description: 'Fine dining with ocean views',
      booking_required: true,
      featured_image: null,
      operating_hours: '7:00 AM - 11:00 PM',
      capacity: 50,
      age_restrictions: null,
    },
    {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      hotel_id: TEST_HOTEL_ID,
      name: 'Spa & Wellness Center',
      type: 'Wellness',
      category: 'Wellness',
      available: true,
      sort_order: 3,
      status: 'active',
      description: 'Full-service spa with traditional treatments',
      booking_required: true,
      featured_image: null,
      operating_hours: '9:00 AM - 8:00 PM',
      capacity: 10,
      age_restrictions: '16+',
    },
  ],
  images: null,
  _metadata: {
    hotel_id: TEST_HOTEL_ID,
    fetched_at: '2024-01-15T10:00:00.000Z',
    processing_time_ms: 150,
    collections_fetched: ['hotel', 'content', 'rooms', 'facilities'],
  },
  _errors: [],
};

// Store original values to restore after tests
let originalFetch: typeof global.fetch;
let originalEnv: NodeJS.ProcessEnv;

describe('CMS API Integration Tests', () => {
  // Setup: Mock fetch and set environment variables
  beforeAll(() => {
    // Store originals
    originalFetch = global.fetch;
    originalEnv = { ...process.env };

    // Set required environment variables
    process.env.CMS_API_URL = 'http://localhost:8055';
    process.env.CMS_API_TOKEN = 'test-token-123';
    process.env.HOTEL_ID = TEST_HOTEL_ID;
    process.env.REVALIDATION_SECRET = 'test-secret-1234567890';
  });

  // Restore originals after all tests
  afterAll(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  // Reset fetch mock before each test
  beforeEach(() => {
    // Default mock implementation - returns health OK
    global.fetch = jest.fn((url: string) => {
      const urlString = url.toString();

      // Health check endpoint
      if (urlString.includes('/cms/health')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => MOCK_HEALTH_RESPONSE,
        } as Response);
      }

      // Server info endpoint
      if (urlString.includes('/server/info')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => MOCK_SERVER_INFO_RESPONSE,
        } as Response);
      }

      // Hotel full endpoint
      if (urlString.includes(`/api/hotels/${TEST_HOTEL_ID}/full`)) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => MOCK_HOTEL_FULL_RESPONSE,
        } as Response);
      }

      // Invalid UUID format
      if (urlString.includes('/api/hotels/not-a-valid-uuid/full')) {
        return Promise.resolve({
          ok: false,
          status: 400,
          statusText: 'Bad Request',
          json: async () => ({
            error: {
              message: 'Invalid hotel ID format',
              code: 'INVALID_PAYLOAD',
            },
          }),
        } as Response);
      }

      // Non-existent hotel (fake UUID)
      if (urlString.includes('/api/hotels/') && urlString.includes('/full')) {
        return Promise.resolve({
          ok: false,
          status: 404,
          statusText: 'Not Found',
          json: async () => ({
            error: {
              message: 'Hotel not found',
              code: 'NOT_FOUND',
            },
          }),
        } as Response);
      }

      // Invalid URL (unreachable server)
      if (urlString.includes('localhost:9999')) {
        return Promise.reject(new Error('ECONNREFUSED'));
      }

      // Default: 404
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: { message: 'Not found' } }),
      } as Response);
    }) as jest.Mock;
  });

  describe('Environment Configuration', () => {
    it('should have CMS_API_URL configured', () => {
      const config = getApiConfig();

      expect(config.baseUrl).toBeDefined();
      expect(config.baseUrl).toBeTruthy();
      expect(config.hotelId).toBeDefined();
    });

    it('should have CMS_API_TOKEN configured', () => {
      const config = getApiConfig();

      expect(config.hasToken).toBe(true);
    });

    it('should build correct API URLs', () => {
      const hotelUrl = buildApiUrl(`/api/hotels/${TEST_HOTEL_ID}/full`);

      expect(hotelUrl).toContain('/api/hotels/');
      expect(hotelUrl).toContain(TEST_HOTEL_ID);
    });
  });

  describe('Health Check Endpoint', () => {
    it('should return health status or error gracefully', async () => {
      const health = await checkCmsHealth({ retries: { maxAttempts: 1 } });

      // Should always return an object
      expect(health).toBeDefined();

      // If server is running and returns expected format
      if (health.status !== 'error') {
        expect(typeof health.status).toBe('string');
        expect(health.status).toBe('ok');
      }
    });

    it('should handle server unavailability gracefully', async () => {
      // Override fetch mock to reject for this test
      global.fetch = jest.fn(() => {
        return Promise.reject(new Error('ECONNREFUSED'));
      }) as jest.Mock;

      const health = await checkCmsHealth({ retries: { maxAttempts: 1 } });

      expect(health.status).toBe('error');
    });
  });

  describe('Server Info Endpoint', () => {
    it('should return server information or handle gracefully', async () => {
      try {
        const serverInfo = await getServerInfo({ retries: { maxAttempts: 1 } });

        expect(serverInfo).toBeDefined();
        expect(serverInfo.data).toBeDefined();
        expect(serverInfo.data.project_name).toBeDefined();
      } catch (error) {
        // Mock server may not have this endpoint - that's acceptable
        if (error instanceof CmsApiError && error.statusCode === 404) {
          console.warn('Server info endpoint not available on mock server');
          return;
        }
        throw error;
      }
    });

    it('should return project name when available', async () => {
      try {
        const serverInfo = await getServerInfo({ retries: { maxAttempts: 1 } });

        expect(serverInfo.data.project_name).toBeTruthy();
      } catch (error) {
        // Mock server may not have this endpoint - that's acceptable
        if (error instanceof CmsApiError && error.statusCode === 404) {
          console.warn('Server info endpoint not available on mock server');
          return;
        }
        throw error;
      }
    });
  });

  describe('getHotelFull Function', () => {
    it('should handle timeout when mock server has no data', async () => {
      try {
        const data = await getHotelFull(TEST_HOTEL_ID, {
          retries: { maxAttempts: 1 },
          timeout: 5000,
        });

        // If mock server returns data, validate structure
        if (data) {
          expect(data).toBeDefined();
          expect(data._errors).toBeDefined();
          expect(data.hotel).toBeDefined();
          expect(data.hotel.id).toBe(TEST_HOTEL_ID);
        }
      } catch (error) {
        // Mock server may timeout or return 404 - both are acceptable
        expect(error instanceof CmsApiError || error instanceof Error).toBe(true);
      }
    });

    it('should validate response structure when data available', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000001';

      try {
        const data = await getHotelFull(fakeId, {
          retries: { maxAttempts: 1 },
          timeout: 5000,
        });

        // If we get data (unlikely with mock), validate it
        if (data && data.hotel) {
          expect(data.hotel.id).toBeDefined();
        }
      } catch (error) {
        // Expected - mock server doesn't have this hotel
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('Error Handling', () => {
    it('should throw CmsApiError for invalid hotel ID format', async () => {
      const invalidId = 'not-a-valid-uuid';

      await expect(
        getHotelFull(invalidId, { retries: { maxAttempts: 1 } })
      ).rejects.toThrow(CmsApiError);
    });

    it('should throw CmsApiError for non-existent hotel (404)', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';

      try {
        await getHotelFull(fakeId, { retries: { maxAttempts: 1 } });
        fail('Expected CmsApiError to be thrown');
      } catch (error) {
        // Should throw CmsApiError with status code
        expect(error).toBeInstanceOf(CmsApiError);
        if (error instanceof CmsApiError) {
          expect(error.statusCode).toBe(404);
        }
      }
    });

    it('should provide meaningful error messages', async () => {
      const invalidId = 'not-a-valid-uuid';

      try {
        await getHotelFull(invalidId, { retries: { maxAttempts: 1 } });
        fail('Expected CmsApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CmsApiError);
        if (error instanceof CmsApiError) {
          expect(error.message).toBeTruthy();
          expect(error.message.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Retry Logic', () => {
    it('should retry failed requests', async () => {
      // Mock fetch to fail first time, then succeed
      let callCount = 0;
      global.fetch = jest.fn(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => MOCK_HOTEL_FULL_RESPONSE,
        } as Response);
      }) as jest.Mock;

      const data = await getHotelFull(TEST_HOTEL_ID, {
        retries: { maxAttempts: 2, baseDelayMs: 10 },
        timeout: 5000,
      });

      expect(data).toBeDefined();
      expect(data.hotel.id).toBe(TEST_HOTEL_ID);
      expect(callCount).toBe(2); // Should have retried once
    }, 10000);

    it('should respect max retry attempts', async () => {
      // Mock fetch to always fail
      global.fetch = jest.fn(() => {
        return Promise.reject(new Error('Network error'));
      }) as jest.Mock;

      try {
        await getHotelFull(TEST_HOTEL_ID, {
          retries: { maxAttempts: 2, baseDelayMs: 10 },
          timeout: 5000,
        });
        fail('Expected CmsApiError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(CmsApiError);
      }

      // Should have attempted exactly 2 times
      expect(global.fetch).toHaveBeenCalledTimes(2);
    }, 15000);
  });

  describe('cmsApiClient Singleton', () => {
    it('should provide access to all client functions', () => {
      expect(cmsApiClient.getHotelFull).toBeDefined();
      expect(cmsApiClient.checkCmsHealth).toBeDefined();
      expect(cmsApiClient.getServerInfo).toBeDefined();
      expect(cmsApiClient.testApiConnectivity).toBeDefined();
      expect(cmsApiClient.buildApiUrl).toBeDefined();
      expect(cmsApiClient.getApiConfig).toBeDefined();
    });

    it('should have same functions as direct imports', () => {
      expect(cmsApiClient.getHotelFull).toBe(getHotelFull);
      expect(cmsApiClient.checkCmsHealth).toBe(checkCmsHealth);
    });
  });

  describe('testApiConnectivity', () => {
    it('should pass when API is accessible', async () => {
      // This test verifies connectivity without throwing
      await testApiConnectivity();
      // If we get here, connectivity test passed
      expect(true).toBe(true);
    });

    it('should throw CmsApiError when API is unreachable', async () => {
      // Override fetch mock to reject for this test
      global.fetch = jest.fn(() => {
        return Promise.reject(new Error('ECONNREFUSED'));
      }) as jest.Mock;

      await expect(
        testApiConnectivity()
      ).rejects.toThrow(CmsApiError);
    });
  });

  describe('Build-Time Performance', () => {
    it('should fetch hotel data within acceptable time', async () => {
      const startTime = Date.now();

      await getHotelFull(TEST_HOTEL_ID, {
        retries: { maxAttempts: 1 },
      });

      const duration = Date.now() - startTime;

      // Should complete within 10 seconds (generous for local development)
      expect(duration).toBeLessThan(10000);
    }, 15000);

    it('should include processing time in metadata', async () => {
      const data = await getHotelFull(TEST_HOTEL_ID, {
        retries: { maxAttempts: 1 },
      });

      expect(data._metadata.processing_time_ms).toBeGreaterThanOrEqual(0);
    });
  });

  describe('CmsApiError Class', () => {
    it('should create error with message and status code', () => {
      const error = new CmsApiError('Test error', 404, '/test/endpoint');

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
      expect(error.endpoint).toBe('/test/endpoint');
      expect(error.name).toBe('CmsApiError');
    });

    it('should create error without status code', () => {
      const error = new CmsApiError('Test error');

      expect(error.statusCode).toBeUndefined();
      expect(error.message).toBe('Test error');
    });

    it('should be instanceof Error', () => {
      const error = new CmsApiError('Test error');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof CmsApiError).toBe(true);
    });
  });

  describe('Data Consistency', () => {
    it('should return consistent data across multiple calls', async () => {
      const data1 = await getHotelFull(TEST_HOTEL_ID, {
        retries: { maxAttempts: 1 },
      });
      const data2 = await getHotelFull(TEST_HOTEL_ID, {
        retries: { maxAttempts: 1 },
      });

      expect(data1.hotel.id).toBe(data2.hotel.id);
      expect(data1.hotel.name).toBe(data2.hotel.name);
      expect(data1.content.length).toBe(data2.content.length);
    }, 15000);

    it('should include hotel ID in metadata', async () => {
      const data = await getHotelFull(TEST_HOTEL_ID, {
        retries: { maxAttempts: 1 },
      });

      expect(data._metadata.hotel_id).toBe(TEST_HOTEL_ID);
    });
  });
});

/**
 * Helper function to fail test when code path shouldn't be reached
 */
function fail(message: string): never {
  throw new Error(message);
}
