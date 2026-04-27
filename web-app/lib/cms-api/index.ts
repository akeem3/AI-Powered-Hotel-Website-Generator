/**
 * CMS API Public API Barrel
 *
 * Central exports for all CMS API functionality.
 * Import from this file for clean, type-safe access to CMS API features.
 *
 * @example
 * ```ts
 * import { getCmsApiEnv, getHotelFull } from '@/lib/cms-api';
 * import type { HotelFullResponse, CmsHotel } from '@/lib/cms-api';
 * ```
 *
 * @module lib/cms-api
 */

// ============================================================
// Environment Variables
// ============================================================
export {
  getCmsApiEnv,
  isCmsApiEnvConfigured,
  getCmsApiUrl,
  getCmsApiToken,
  getHotelId,
  getRevalidationSecret,
  type CmsApiEnv,
} from './env';

// ============================================================
// Types
// ============================================================
export type {
  // Main types
  HotelFullResponse,
  CmsHotel,
  CmsContent,
  CmsRoom,
  CmsFacility,
  CmsImage,
  CmsAddress,
  CmsMetadata,

  // Responses
  CmsHealthCheckResponse,
  CmsServerInfoResponse,
  CmsErrorResponse,

  // Transformed types
  TransformedHotelData,
  HotelWithParsedAddress,
  FacilityGroups,
  ContentLookup,

  // Enums and unions
  ContentVariantType,
  HotelStatus,
  PropertyType,
  FacilityCategory,

  // Configuration
  RetryConfig,
  CmsApiConfig,
} from './types';

// ============================================================
// Enums
// ============================================================
export { ContentVariant, DEFAULT_RETRY_CONFIG } from './types';

// ============================================================
// Zod Schemas
// ============================================================
export {
  // Schema objects
  HotelFullResponseSchema,
  CmsHotelSchema,
  CmsContentSchema,
  CmsRoomSchema,
  CmsFacilitySchema,
  CmsImageSchema,
  CmsMetadataSchema,
  CmsHealthCheckResponseSchema,
  CmsServerInfoResponseSchema,
  CmsErrorResponseSchema,

  // Validation functions
  parseAddressString,
  validateHotelFullResponse,
  safeValidateHotelFullResponse,
  validateHealthCheckResponse,

  // Type guards
  isHotelFullResponse,
  isCmsErrorResponse,
  isHealthCheckResponse,
} from './schemas';

// ============================================================
// Data Transformers
// ============================================================
export {
  getVariantContentType,
  getVariantType,
  getContentVariant,
  getContentVariantWithMetadata,
  buildContentLookup,
  getAvailableLanguages,
  groupFacilitiesByCategory,
  getFacilitiesByCategoryWithMetadata,
  getAvailableRooms,
  groupRoomsByType,
  transformHotelData,
  getContentForUseCase,
  validateHotelDataCompleteness,
  extractSeoMetadata,
} from './transformers';

// ============================================================
// CMS API Client
// ============================================================
export {
  cmsApiClient,
  getHotelFull,
  checkCmsHealth,
  getServerInfo,
  testApiConnectivity,
  buildApiUrl,
  getApiConfig,
  CmsApiError,
} from './client';

// ============================================================
// Constants
// ============================================================

/**
 * Default API timeout in milliseconds
 */
export const DEFAULT_API_TIMEOUT = 30000; // 30 seconds

/**
 * CMS API version
 */
export const CMS_API_VERSION = '1.0.0';

/**
 * Default headers for CMS API requests
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;
