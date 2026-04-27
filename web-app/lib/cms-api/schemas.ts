/**
 * CMS API Zod Schemas
 *
 * Runtime validation schemas for CMS API responses using Zod.
 * Provides type-safe validation with detailed error messages.
 *
 * @module lib/cms-api/schemas
 */

import { z } from 'zod';
import type {
  HotelStatus,
  PropertyType,
  FacilityCategory,
} from './types';

/**
 * Hotel Status Schema
 */
export const HotelStatusSchema = z.enum([
  'active',
  'inactive',
  'draft',
  'archived',
] as const);

/**
 * Property Type Schema
 */
export const PropertyTypeSchema = z.enum([
  'hotel',
  'resort',
  'hostel',
  'guesthouse',
  'villa',
  'apartment',
  'other',
] as const);

/**
 * Address Schema (parsed from JSON string)
 *
 * Based on actual CMS response format:
 * {"city": "Unawatuna", "full": "Yaddehimulla Road, Unawatuna, 80000\\t Unawatuna, Sri Lanka", "country": "lk"}
 *
 * Note: CMS may not provide all address fields. Missing fields are optional.
 */
export const CmsAddressSchema = z.object({
  city: z.string().min(1, 'City cannot be empty'),
  state: z.string().optional(), // May not be in CMS response
  street: z.string().optional(), // May not be in CMS response (often in "full" field)
  country: z.string().min(1, 'Country cannot be empty'), // May be ISO code (e.g., "lk") or full name
  postal_code: z.string().optional(), // May not be in CMS response
  full: z.string().optional(), // Full address string (present in CMS)
});

/**
 * Facility Category Schema
 */
export const FacilityCategorySchema = z.enum([
  'room_amenity',
  'Activities',
  'Wellness',
  'Food & Drink',
  'Bathroom',
  'Outdoors',
  'Internet',
  'Parking',
  'Reception services',
  'Safety & security',
  'General',
  'Cleaning services',
  'Entertainment and family services',
  'Great for your stay',
] as const);

/**
 * Hotel Object Schema
 */
export const CmsHotelSchema = z.object({
  id: z.string().uuid('Hotel ID must be a valid UUID'),
  name: z.string().min(1, 'Hotel name cannot be empty'),
  slug: z.string().min(1, 'Hotel slug cannot be empty'),
  property_type: PropertyTypeSchema,
  star_rating: z.number().int().min(1).max(5).nullable(), // CMS returns null
  status: HotelStatusSchema,
  opening_year: z.number().int().positive().nullable(),
  address: z.string(), // JSON string - will be parsed separately
  is_template: z.boolean().nullable(), // May be null in some CMS responses
  has_override: z.boolean().nullable(), // May be null in some CMS responses
  created_at: z.string().datetime('Created at must be a valid ISO 8601 datetime'),
  updated_at: z.string().datetime('Updated at must be a valid ISO 8601 datetime'),
});

/**
 * Content Item Schema
 */
export const CmsContentSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  content_type: z.string(), // 'brand_story', 'brief_description', 'detailed_description'
  title: z.string(), // Localized display title (e.g., "Hikayemiz", "Наша История")
  content: z.string().min(1, 'Content cannot be empty'),
  language: z.string().min(2).max(5), // ISO 639-1: 2-5 characters
  status: z.string(), // 'published' in actual CMS (not 'available' or 'draft')
  sort_order: z.number().int(),
  parent_content_id: z.string().uuid().nullable().optional(), // Not present in current CMS response
  has_override: z.boolean().optional(), // Not present in current CMS response
});

/**
 * Room Schema
 */
export const CmsRoomSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  name: z.string().min(1, 'Room name cannot be empty'),
  room_type: z.string(),
  capacity_adults: z.number().int().min(0),
  capacity_children: z.number().int().min(0),
  description: z.string(),
  featured_image: z.string().url().nullable(),
  status: z.string(),
  sort_order: z.number().int(),
  room_details: z.unknown().nullable(),
  has_override: z.boolean(),
});

/**
 * Facility Schema
 */
export const CmsFacilitySchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
  name: z.string().min(1, 'Facility name cannot be empty'),
  type: FacilityCategorySchema,
  category: FacilityCategorySchema,
  available: z.boolean(),
  sort_order: z.number().int(),
  status: z.string(),
  description: z.string().nullable(),
  booking_required: z.boolean(),
  featured_image: z.string().url().nullable(),
  operating_hours: z.string().nullable(),
  capacity: z.number().int().nullable(),
  age_restrictions: z.string().nullable(),
});

/**
 * Image Schema (flexible to accommodate different image structures)
 */
export const CmsImageSchema = z.object({
  id: z.string().uuid(),
  hotel_id: z.string().uuid(),
}).passthrough(); // Allow additional fields

/**
 * Metadata Schema
 */
export const CmsMetadataSchema = z.object({
  hotel_id: z.string().uuid(),
  fetched_at: z.string().datetime(),
  processing_time_ms: z.number().nonnegative(),
  collections_fetched: z.array(z.string()),
});

/**
 * Full Hotel Response Schema
 *
 * Validates the complete response from GET /api/hotels/{hotel_id}/full
 */
export const HotelFullResponseSchema = z.object({
  hotel: CmsHotelSchema,
  content: z.array(CmsContentSchema),
  rooms: z.array(CmsRoomSchema),
  facilities: z.array(CmsFacilitySchema),
  images: z.array(CmsImageSchema).nullable(),
  _metadata: CmsMetadataSchema,
  _errors: z.array(z.string()).nullable(), // CMS returns null when no errors
});

/**
 * Health Check Response Schema
 */
export const CmsHealthCheckResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  directus: z.enum(['connected', 'disconnected']),
  database: z.enum(['connected', 'disconnected']),
  b2_storage: z.enum(['connected', 'disconnected']),
  release_id: z.string().optional(),
  service_id: z.string().optional(),
  checks: z.array(z.object({
    name: z.string(),
    status: z.enum(['pass', 'fail']),
    message: z.string().optional(),
  })).optional(),
});

/**
 * Server Info Response Schema (mock compatible)
 */
export const CmsServerInfoResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    project_name: z.string(),
    project_url: z.string().url().nullable(),
    project_color: z.string().nullable(),
  }).passthrough(),
});

/**
 * API Error Response Schema
 */
export const CmsErrorResponseSchema = z.object({
  error: z.object({
    code: z.number(),
    message: z.string(),
  }),
});

/**
 * Address JSON string parser
 *
 * Safely parses the address JSON string from CMS response.
 * Throws descriptive error if parsing fails.
 */
export function parseAddressString(addressString: string) {
  try {
    const parsed = JSON.parse(addressString);
    return CmsAddressSchema.parse(parsed);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid address format: ${error.issues.map((e) => e.message).join(', ')}`
      );
    }
    throw new Error(`Failed to parse address JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate hotel full response
 *
 * Validates and type-narrows the CMS API response.
 * Throws ZodError if validation fails.
 *
 * @param data - Raw response data from CMS API
 * @returns Validated HotelFullResponse
 */
export function validateHotelFullResponse(data: unknown) {
  return HotelFullResponseSchema.parse(data);
}

/**
 * Safe validation of hotel full response
 *
 * Returns result object with success status.
 * Does not throw - useful for error handling.
 *
 * @param data - Raw response data from CMS API
 * @returns ZodSafeParseResult with success status
 */
export function safeValidateHotelFullResponse(data: unknown) {
  return HotelFullResponseSchema.safeParse(data);
}

/**
 * Validate health check response
 *
 * @param data - Raw response data from health check endpoint
 * @returns Validated health check response
 */
export function validateHealthCheckResponse(data: unknown) {
  return CmsHealthCheckResponseSchema.parse(data);
}

/**
 * Type guards for runtime checking
 */

/**
 * Check if data is a valid hotel full response
 */
export function isHotelFullResponse(data: unknown): data is z.infer<typeof HotelFullResponseSchema> {
  return HotelFullResponseSchema.safeParse(data).success;
}

/**
 * Check if data is a CMS error response
 */
export function isCmsErrorResponse(data: unknown): data is z.infer<typeof CmsErrorResponseSchema> {
  return CmsErrorResponseSchema.safeParse(data).success;
}

/**
 * Check if data is a valid health check response
 */
export function isHealthCheckResponse(data: unknown): data is z.infer<typeof CmsHealthCheckResponseSchema> {
  return CmsHealthCheckResponseSchema.safeParse(data).success;
}
