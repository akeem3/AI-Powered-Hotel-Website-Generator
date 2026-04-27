/**
 * CMS API Type Definitions
 *
 * TypeScript types matching the ET CMS Publishing API response schema.
 * These types are based on the live API response from the `/api/hotels/{id}/full` endpoint.
 *
 * @module lib/cms-api/types
 */

/**
 * Content variant types for different length descriptions
 *
 * Each language has 3 variants with different word counts:
 * - Concise: ~50 words (cards, previews, meta descriptions)
 * - Standard: ~100 words (standard page sections)
 * - Extended: ~150 words (hero sections, full descriptions)
 *
 * Maps to CMS content_type field values:
 * - brief_description → concise
 * - brand_story → standard
 * - detailed_description → extended
 */
export enum ContentVariant {
  CONCISE = 'brief_description',
  STANDARD = 'brand_story',
  EXTENDED = 'detailed_description',
}

/**
 * Content variant shorthand for type-safe selection
 */
export type ContentVariantType = 'concise' | 'standard' | 'extended';

/**
 * Hotel status values
 */
export type HotelStatus = 'active' | 'inactive' | 'draft' | 'archived';

/**
 * Property type classifications
 */
export type PropertyType = 'hotel' | 'resort' | 'hostel' | 'guesthouse' | 'villa' | 'apartment' | 'other';

/**
 * Address object parsed from JSON string
 *
 * The CMS stores address as a JSON string that needs to be parsed.
 * Not all fields are guaranteed to be present in the CMS response.
 *
 * Example from CMS:
 * {"city": "Unawatuna", "full": "Yaddehimulla Road, Unawatuna...", "country": "lk"}
 *
 * Note: state, street, and postal_code may not be present in all CMS responses.
 *
 * Index signature added to allow additional fields from CMS and to satisfy
 * Zod passthrough() compatibility in contracts.
 */
export interface CmsAddress {
  city: string;
  state?: string;  // May not be in CMS response
  street?: string; // May not be in CMS response (often in "full" field)
  country: string;
  postal_code?: string; // May not be in CMS response
  full?: string; // Full address string (present in CMS)
  [key: string]: unknown; // Index signature for additional fields from CMS
}

/**
 * Hotel main object from CMS API
 */
export interface CmsHotel {
  id: string; // UUID format
  name: string;
  slug: string; // URL-friendly identifier (e.g., "thaproban-beach-house")
  property_type: PropertyType;
  star_rating: number; // 1-5 stars
  status: HotelStatus;
  opening_year: number | null;
  address: string; // JSON string - parse to CmsAddress
  is_template: boolean;
  has_override: boolean;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

/**
 * Content item with language and variant
 *
 * Content is organized by language and has 3 length variants per language.
 * This is NOT a translation system - each language has its own 3 variants.
 *
 * Variant is determined by content_type field:
 * - brief_description: Concise variant (~50 words)
 * - brand_story: Standard variant (~100 words)
 * - detailed_description: Extended variant (~150 words)
 *
 * Title is a localized display string (e.g., "Hikayemiz", "Наша История")
 */
export interface CmsContent {
  id: string;
  hotel_id: string;
  content_type: ContentVariant; // 'brief_description' | 'brand_story' | 'detailed_description'
  title: string; // Localized display title (e.g., "Hikayemiz", "Наша История")
  content: string; // Marketing text (50-150 words)
  language: string; // ISO 639-1 code: "tr", "ru", "en", etc.
  status: string;
  sort_order: number;
  parent_content_id: string | null | undefined;
  has_override: boolean | undefined;
}

/**
 * Room information
 */
export interface CmsRoom {
  id: string;
  hotel_id: string;
  name: string;
  room_type: string; // Currently "standard", may vary in future
  capacity_adults: number;
  capacity_children: number;
  description: string;
  featured_image: string | null;
  status: string;
  sort_order: number;
  room_details: unknown; // Currently null in data, typed as unknown for flexibility
  has_override: boolean;
}

/**
 * Facility categories
 *
 * Facilities are grouped into ~15 categories for organized display.
 */
export type FacilityCategory =
  | 'room_amenity'
  | 'Activities'
  | 'Wellness'
  | 'Food & Drink'
  | 'Bathroom'
  | 'Outdoors'
  | 'Internet'
  | 'Parking'
  | 'Reception services'
  | 'Safety & security'
  | 'General'
  | 'Cleaning services'
  | 'Entertainment and family services'
  | 'Great for your stay';

/**
 * Facility/amenity information
 */
export interface CmsFacility {
  id: string;
  hotel_id: string;
  name: string;
  type: FacilityCategory;
  category: FacilityCategory; // Same as type field in current data
  available: boolean;
  sort_order: number;
  status: string;
  description: string | null;
  booking_required: boolean;
  featured_image: string | null;
  operating_hours: string | null;
  capacity: number | null;
  age_restrictions: string | null;
}

/**
 * Image data from CMS
 *
 * May return null if images collection has errors.
 * Check `_errors` array for "images" if this is null.
 */
export interface CmsImage {
  id: string;
  hotel_id: string;
  // Additional image fields would be here
  // Exact structure depends on CMS implementation
  [key: string]: unknown;
}

/**
 * Response metadata from CMS API
 */
export interface CmsMetadata {
  hotel_id: string;
  fetched_at: string; // ISO 8601 datetime
  processing_time_ms: number; // Response time in milliseconds
  collections_fetched: string[]; // List of collection names fetched
}

/**
 * Full hotel response from CMS API
 *
 * This is the complete response from GET /api/hotels/{hotel_id}/full
 * Contains all data needed for static site generation.
 */
export interface HotelFullResponse {
  hotel: CmsHotel;
  content: CmsContent[];
  rooms: CmsRoom[];
  facilities: CmsFacility[];
  images: CmsImage[] | null;
  _metadata: CmsMetadata;
  _errors: string[]; // Collection names that failed to fetch
}

/**
 * Health check response from CMS API
 *
 * Response from GET /cms/health
 */
export interface CmsHealthCheckResponse {
  status: 'ok' | 'error';
  directus: 'connected' | 'disconnected';
  database: 'connected' | 'disconnected';
  b2_storage: 'connected' | 'disconnected';
  release_id?: string;
  service_id?: string;
  checks?: Array<{
    name: string;
    status: 'pass' | 'fail';
    message?: string;
  }>;
}

/**
 * Server info response from CMS API
 *
 * Response from GET /server/info (mock server compatible)
 */
export interface CmsServerInfoResponse {
  data: {
    id: number;
    project_name: string;
    project_url: string | null;
    project_color: string | null;
    [key: string]: unknown;
  };
}

/**
 * Transformed hotel data for component consumption
 *
 * After parsing and transformation from raw CMS response.
 */
export interface TransformedHotelData {
  hotel: CmsHotel & {
    parsedAddress: CmsAddress;
  };
  contentByLanguage: Record<string, Record<ContentVariantType, string>>;
  rooms: CmsRoom[];
  facilitiesByCategory: Record<FacilityCategory, CmsFacility[]>;
  images: CmsImage[] | null;
  metadata: CmsMetadata;
  errors: string[];
}

/**
 * Parsed hotel with address already transformed
 */
export type HotelWithParsedAddress = CmsHotel & {
  parsedAddress: CmsAddress;
};

/**
 * API error response format
 */
export interface CmsErrorResponse {
  error: {
    code: number;
    message: string;
  };
}

/**
 * Facility groups for organized display
 *
 * Groups facilities by their category for easier component rendering.
 */
export type FacilityGroups = Record<FacilityCategory, CmsFacility[]>;

/**
 * Content lookup by language and variant
 *
 * Nested record structure for O(1) content lookups.
 */
export type ContentLookup = Record<string, Record<ContentVariantType, CmsContent>>;

/**
 * Retry configuration for API client
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  backoffMultiplier: 2, // Exponential backoff: 1s, 2s, 4s, ...
};

/**
 * API client configuration
 */
export interface CmsApiConfig {
  baseUrl: string;
  token: string;
  retry?: Partial<RetryConfig>;
  timeout?: number; // Request timeout in milliseconds
}
