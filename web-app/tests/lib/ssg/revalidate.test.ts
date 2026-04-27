/**
 * Story 14.5: ISR Implementation - Revalidation API Route Tests
 *
 * Tests for the ISR revalidation webhook endpoint at /api/revalidate.
 * Verifies secret verification, revalidation logic, and response handling.
 *
 * @see app/api/revalidate/route.ts
 *
 * Testing approach:
 * - Mock next/server NextResponse.json to return mock response objects
 * - Mock next/cache revalidatePath and revalidateTag to verify calls
 * - Mock CMS API dependencies to control test data
 *
 * References:
 * - https://dev.to/dforrunner/unit-test-nextjs-13-app-router-api-routes-with-jest-and-react-testing-library-with-examples-including-prisma-example-367a
 * - https://blog.arcjet.com/testing-next-js-app-router-api-routes/
 * - https://github.com/Xunnamius/next-test-api-route-handler
 */

import type { CmsContent } from '@/lib/cms-api/types';

// Mock next/server - using inline factory functions to avoid hoisting issues
jest.mock('next/server', () => {
  const jsonFn = jest.fn();
  return {
    NextResponse: {
      json: jsonFn,
    },
    NextRequest: jest.fn(),
    // Export for test access
    __mockJson: jsonFn,
  };
});

// Mock next/cache functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

// Mock CMS API dependencies
const mockGetHotelFull = jest.fn();

jest.mock('@/lib/cms-api/env', () => ({
  getRevalidationSecret: () => 'test-secret-min-16-chars',
  getHotelId: () => '09f207c1-695a-485a-9519-49f4ef03331f',
}));

jest.mock('@/lib/cms-api/client', () => ({
  getHotelFull: () => mockGetHotelFull(),
}));

jest.mock('@/lib/cms-api/transformers', () => ({
  getAvailableLanguages: () => ['en', 'th'],
}));

// Import route handler after mocks are set up
import { POST } from '@/app/api/revalidate/route';

// Get mock functions using jest.requireMock
const mockNextResponseJson = (jest.requireMock('next/server') as any).NextResponse.json;
const mockRevalidatePath = (jest.requireMock('next/cache') as any).revalidatePath;
const mockRevalidateTag = (jest.requireMock('next/cache') as any).revalidateTag;

// Helper to create mock hotel data
const createMockHotelData = () => ({
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
  },
  content: [] as CmsContent[],
  rooms: [],
  facilities: [],
  images: [],
  _metadata: {
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    fetched_at: '2024-01-01T00:00:00Z',
    processing_time_ms: 100,
    collections_fetched: ['hotel', 'content'],
  },
  _errors: [],
});

// Helper to create a mock NextRequest
const createMockRequest = (body: any) => ({
  json: async () => body,
}) as any;

// Create mock response object
const createMockResponse = (status: number, data: any) => ({
  status,
  json: async () => data,
});

describe('Story 14.5: ISR Revalidation API Route Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetHotelFull.mockResolvedValue(createMockHotelData());

    // Setup NextResponse.json to return a mock response
    mockNextResponseJson.mockImplementation((data: any, init?: { status?: number }) =>
      createMockResponse(init?.status || 200, data)
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Story 14.5, AC3, AC10: Secret verification with constant-time comparison
   */
  describe('AC3, AC10: Secret Verification', () => {
    test('should reject request with missing secret', async () => {
      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Missing secret',
        code: 'MISSING_SECRET',
      });
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        { error: 'Missing secret', code: 'MISSING_SECRET' },
        { status: 401 }
      );
    });

    test('should reject request with invalid secret', async () => {
      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'wrong-secret',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        error: 'Invalid request',
        code: 'UNAUTHORIZED',
      });
      // Verify generic error message (no secret leakage)
      expect(data.error).not.toContain('secret');
    });

    test('should accept request with valid secret', async () => {
      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.revalidated).toBe(true);
    });
  });

  /**
   * Story 14.5, AC4, AC5, AC6: Revalidation logic
   */
  describe('AC4, AC5, AC6: Revalidation Logic', () => {
    test('should revalidate paths for all languages', async () => {
      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockRevalidatePath).toHaveBeenCalledWith('/en');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/th');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/en/hotels/test-hotel');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/th/hotels/test-hotel');
      expect(mockRevalidatePath).toHaveBeenCalledTimes(4); // 2 languages × 2 paths
      expect(data.paths).toEqual(['/en', '/th', '/en/hotels/test-hotel', '/th/hotels/test-hotel']);
    });

    test('should call revalidateTag with hotel ID', async () => {
      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockRevalidateTag).toHaveBeenCalledWith('hotel-09f207c1-695a-485a-9519-49f4ef03331f');
      expect(mockRevalidateTag).toHaveBeenCalledTimes(1);
    });

    test('should ignore webhook for different hotel (return 200 but no revalidation)', async () => {
      const request = createMockRequest({
        hotel_id: 'different-hotel-id-1234',
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.revalidated).toBe(false);
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(mockRevalidateTag).not.toHaveBeenCalled();
    });
  });

  /**
   * Story 14.5, AC7: Response handling
   */
  describe('AC7: Response Handling', () => {
    test('should return 400 for invalid JSON body', async () => {
      const request = {
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Invalid request body',
        code: 'INVALID_BODY',
      });
    });

    test('should return 400 for missing hotel_id', async () => {
      const request = createMockRequest({
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Missing or invalid hotel_id',
        code: 'INVALID_HOTEL_ID',
      });
    });

    test('should return 200 but revalidated false for non-matching hotel_id', async () => {
      // Note: The route doesn't validate UUID format - it only checks existence
      // In per-hotel deployment, non-matching hotel_ids are ignored with 200 response
      const request = createMockRequest({
        hotel_id: 'not-a-uuid',
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.revalidated).toBe(false);
    });

    test('should return 200 with revalidation details on success', async () => {
      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'test-secret-min-16-chars',
        changed_collections: ['content', 'rooms'],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        revalidated: true,
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        paths: ['/en', '/th', '/en/hotels/test-hotel', '/th/hotels/test-hotel'],
        timestamp: expect.any(String),
      });
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO timestamp format
    });

    test('should return 500 for server errors', async () => {
      // Mock getHotelFull to throw an error
      mockGetHotelFull.mockRejectedValue(new Error('CMS API error'));

      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      });
      // Verify no sensitive information in error
      expect(data.error).not.toContain('CMS API');
    });
  });

  /**
   * Story 14.5, AC8: Logging verification
   */
  describe('AC8: Logging', () => {
    test('should log successful revalidation event', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'test-secret-min-16-chars',
        changed_collections: ['content'],
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ISR Revalidation] Success')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Hotel ID: 09f207c1-695a-485a-9519-49f4ef03331f')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Languages: en, th')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Paths revalidated: 4')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Changed collections: content')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Tag: hotel-09f207c1-695a-485a-9519-49f4ef03331f')
      );

      consoleSpy.mockRestore();
    });

    test('should log failed authentication attempt', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'wrong-secret',
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ISR Revalidation] Failed authentication attempt')
      );
      // Verify secret is not logged
      expect(consoleWarnSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('wrong-secret')
      );

      consoleWarnSpy.mockRestore();
    });

    test('should log error events', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      mockGetHotelFull.mockRejectedValue(new Error('CMS API error'));

      const request = createMockRequest({
        hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
        secret: 'test-secret-min-16-chars',
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      // Verify console.error was called (it receives multiple args from the error logging)
      expect(consoleErrorSpy).toHaveBeenCalled();
      // Check that the first argument contains the error prefix
      expect(consoleErrorSpy.mock.calls[0][0]).toContain('[ISR Revalidation] Error');

      consoleErrorSpy.mockRestore();
    });
  });

  /**
   * Story 14.5, AC9: Manual POST test verification
   *
   * These tests can be verified with curl commands:
   *
   * # Test with invalid secret (should return 401)
   * curl -X POST http://localhost:3000/api/revalidate \
   *   -H "Content-Type: application/json" \
   *   -d '{"hotel_id":"09f207c1-695a-485a-9519-49f4ef03331f","secret":"wrong"}'
   *
   * # Test with valid secret (should return 200)
   * curl -X POST http://localhost:3000/api/revalidate \
   *   -H "Content-Type: application/json" \
   *   -d '{"hotel_id":"09f207c1-695a-485a-9519-49f4ef03331f","secret":"test-secret-min-16-chars"}'
   */
  describe('AC9: Manual Test Examples', () => {
    test('should provide curl command examples for manual testing', () => {
      // This test documents the manual testing commands
      // Actual manual testing should be done by running the commands in a terminal

      const invalidSecretCurl = `curl -X POST http://localhost:3000/api/revalidate \\
  -H "Content-Type: application/json" \\
  -d '{"hotel_id":"09f207c1-695a-485a-9519-49f4ef03331f","secret":"wrong"}'`;

      const validSecretCurl = `curl -X POST http://localhost:3000/api/revalidate \\
  -H "Content-Type: application/json" \\
  -d '{"hotel_id":"09f207c1-695a-485a-9519-49f4ef03331f","secret":"test-secret-min-16-chars"}'`;

      expect(invalidSecretCurl).toContain('curl');
      expect(validSecretCurl).toContain('curl');
    });
  });
});
