/**
 * CMS API Client
 *
 * Singleton REST API client for the ET CMS Publishing API.
 * Provides typed methods for fetching hotel data at build-time with
 * Bearer token authentication, retry logic, and error handling.
 *
 * @module lib/cms-api/client
 */

import {
  getCmsApiUrl,
  getCmsApiToken,
} from './env';
import type {
  HotelFullResponse,
  CmsHealthCheckResponse,
  CmsServerInfoResponse,
  RetryConfig,
  CmsHotel,
  CmsAddress,
} from './types';
import {
  validateHotelFullResponse,
  parseAddressString,
  isHotelFullResponse,
  isCmsErrorResponse,
} from './schemas';
import { DEFAULT_RETRY_CONFIG, DEFAULT_API_TIMEOUT } from './index';

/**
 * Sleep/delay utility for retry backoff
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 *
 * Formula: baseDelay * (2 ^ (attempt - 1))
 * Capped at maxDelay
 */
function calculateBackoff(attempt: number, config: RetryConfig): number {
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt - 1);
  return Math.min(exponentialDelay, config.maxDelayMs);
}

/**
 * CMS API Error class
 *
 * Custom error class for API-specific errors with additional context.
 */
export class CmsApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'CmsApiError';
  }
}

/**
 * Request configuration options
 */
interface RequestOptions {
  timeout?: number;
  retries?: Partial<RetryConfig>;
  signal?: AbortSignal;
}

/**
 * Internal fetch wrapper with retry logic
 *
 * @param endpoint - API endpoint path (e.g., '/api/hotels/123/full')
 * @param options - Request options
 * @returns Parsed JSON response
 */
async function fetchWithRetry<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const baseUrl = getCmsApiUrl();
  const token = getCmsApiToken();
  const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...options.retries };
  const timeout = options.timeout ?? DEFAULT_API_TIMEOUT;

  const url = `${baseUrl}${endpoint}`;
  const lastAttempt = retryConfig.maxAttempts;

  for (let attempt = 1; attempt <= lastAttempt; attempt++) {
    let controller: AbortController | undefined;

    try {
      // Create abort controller for timeout
      controller = new AbortController();
      const timeoutId = setTimeout(() => controller?.abort(), timeout);

      // Combine with external signal if provided
      if (options.signal) {
        options.signal.addEventListener('abort', () => controller?.abort());
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Use force-cache for SSG - data is cached at build time and reused
        cache: 'force-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        // Check if it's a CMS error response
        if (errorData && isCmsErrorResponse(errorData)) {
          throw new CmsApiError(
            errorData.error.message,
            response.status,
            endpoint,
            errorData
          );
        }

        // Generic HTTP error
        throw new CmsApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          endpoint
        );
      }

      // Parse and validate response
      const data = await response.json();
      return data as T;

    } catch (error) {
      // Don't retry if aborted
      if (error instanceof Error && error.name === 'AbortError') {
        if (controller && controller.signal.aborted) {
          throw new CmsApiError(
            `Request timeout after ${timeout}ms`,
            undefined,
            endpoint,
            error
          );
        }
        throw error; // Re-throw external abort
      }

      // Don't retry on authentication errors (401) or not found (404)
      if (error instanceof CmsApiError) {
        if (error.statusCode === 401 || error.statusCode === 404) {
          throw error;
        }
      }

      // Last attempt - throw the error
      if (attempt === lastAttempt) {
        if (error instanceof CmsApiError) {
          throw error;
        }
        throw new CmsApiError(
          `Failed to fetch ${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          undefined,
          endpoint,
          error
        );
      }

      // Calculate backoff and wait before retry
      const backoffDelay = calculateBackoff(attempt, retryConfig);
      console.warn(
        `[CMS API] Request to ${endpoint} failed (attempt ${attempt}/${lastAttempt}). ` +
        `Retrying in ${backoffDelay}ms... ` +
        `Error: ${error instanceof Error ? error.message : 'Unknown'}`
      );
      await sleep(backoffDelay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw new CmsApiError('Max retry attempts exceeded', undefined, endpoint);
}

/**
 * Get full hotel data from CMS API
 *
 * Fetches complete hotel information including content, rooms, facilities,
 * and images. Handles address parsing and error collection gracefully.
 *
 * @param hotelId - Hotel UUID
 * @param options - Request options
 * @returns Hotel full response with parsed address
 *
 * @example
 * ```ts
 * const data = await getHotelFull('09f207c1-695a-485a-9519-49f4ef03331f');
 * console.log(data.hotel.name); // "Thaproban Beach House"
 * console.log(data.hotel.parsedAddress.city); // "Unawatuna"
 * ```
 */
export async function getHotelFull(
  hotelId: string,
  options: RequestOptions = {}
): Promise<HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } }> {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(hotelId)) {
    throw new CmsApiError(
      `Invalid hotel ID format: ${hotelId}. Expected UUID format.`,
      400,
      `/api/hotels/${hotelId}/full`
    );
  }

  const endpoint = `/api/hotels/${hotelId}/full`;

  // Fetch with retry
  const rawResponse = await fetchWithRetry<HotelFullResponse>(endpoint, options);

  // Validate response structure
  if (!isHotelFullResponse(rawResponse)) {
    throw new CmsApiError(
      `Invalid response format from ${endpoint}`,
      undefined,
      endpoint
    );
  }

  // Log any collection errors
  if (rawResponse._errors && rawResponse._errors.length > 0) {
    console.warn(
      `[CMS API] Some collections failed to fetch for hotel ${hotelId}: ` +
      rawResponse._errors.join(', ')
    );
  }

  // Parse address from JSON string
  let parsedAddress: CmsAddress;
  try {
    parsedAddress = parseAddressString(rawResponse.hotel.address);
  } catch (error) {
    throw new CmsApiError(
      `Failed to parse address for hotel ${hotelId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      endpoint,
      error
    );
  }

  // Return response with parsed address
  return {
    ...rawResponse,
    hotel: {
      ...rawResponse.hotel,
      parsedAddress,
    },
  };
}

/**
 * Check CMS API health status
 *
 * Verifies connectivity to the CMS API and its dependencies (Directus, database, B2 storage).
 *
 * @param options - Request options
 * @returns Health check response
 *
 * @example
 * ```ts
 * const health = await checkCmsHealth();
 * if (health.status === 'ok') {
 *   console.log('CMS API is healthy');
 * }
 * ```
 */
export async function checkCmsHealth(
  options: RequestOptions = {}
): Promise<CmsHealthCheckResponse> {
  try {
    return await fetchWithRetry<CmsHealthCheckResponse>('/cms/health', {
      ...options,
      retries: { ...DEFAULT_RETRY_CONFIG, maxAttempts: 1 }, // Don't retry health checks
    });
  } catch (error) {
    // Return error status instead of throwing
    return {
      status: 'error',
      directus: 'disconnected',
      database: 'disconnected',
      b2_storage: 'disconnected',
    };
  }
}

/**
 * Get server information
 *
 * Fetches CMS server metadata (project name, URL, etc.).
 * Compatible with mock Directus server for development.
 *
 * @param options - Request options
 * @returns Server info response
 */
export async function getServerInfo(
  options: RequestOptions = {}
): Promise<CmsServerInfoResponse> {
  return fetchWithRetry<CmsServerInfoResponse>('/server/info', options);
}

/**
 * Test API connectivity
 *
 * Simple connectivity test that throws on failure.
 * Useful for verifying credentials and network access.
 *
 * @throws {CmsApiError} If API is unreachable
 *
 * @example
 * ```ts
 * try {
 *   await testApiConnectivity();
 *   console.log('CMS API is accessible');
 * } catch (error) {
 *   console.error('Cannot reach CMS API:', error);
 * }
 * ```
 */
export async function testApiConnectivity(): Promise<void> {
  const health = await checkCmsHealth({ retries: { maxAttempts: 1 } });

  if (health.status !== 'ok') {
    throw new CmsApiError(
      `CMS API health check failed. Status: ${health.status}, ` +
      `Directus: ${health.directus}, Database: ${health.database}`
    );
  }
}

/**
 * Build full API URL for an endpoint
 *
 * Utility function for constructing complete URLs.
 * Mostly used for logging and debugging.
 *
 * @param endpoint - API endpoint path
 * @returns Full URL
 */
export function buildApiUrl(endpoint: string): string {
  const baseUrl = getCmsApiUrl();
  return `${baseUrl}${endpoint}`;
}

/**
 * Get current API configuration
 *
 * Returns the current configuration (URL, hotel ID, etc.).
 * Useful for debugging and logging.
 *
 * @returns Current configuration object
 */
export function getApiConfig(): {
  baseUrl: string;
  hotelId: string;
  hasToken: boolean;
} {
  const baseUrl = getCmsApiUrl();
  const token = getCmsApiToken();
  const hotelId = process.env.HOTEL_ID || '';

  return {
    baseUrl,
    hotelId,
    hasToken: !!token,
  };
}

/**
 * CMS API Client singleton object
 *
 * Provides a clean API for all CMS operations.
 */
export const cmsApiClient = {
  getHotelFull,
  checkCmsHealth,
  getServerInfo,
  testApiConnectivity,
  buildApiUrl,
  getApiConfig,
} as const;
