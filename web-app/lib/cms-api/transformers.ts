/**
 * CMS API Data Transformers
 *
 * Transforms raw CMS API responses into component-ready structures.
 * Handles content variant selection, facility grouping, and data normalization.
 *
 * @module lib/cms-api/transformers
 */

import type {
  HotelFullResponse,
  CmsHotel,
  CmsContent,
  CmsRoom,
  CmsFacility,
  CmsImage,
  CmsAddress,
  ContentVariantType,
  FacilityCategory,
  TransformedHotelData,
  HotelWithParsedAddress,
  FacilityGroups,
  ContentLookup,
} from './types';
import { ContentVariant } from './types';
import { parseAddressString } from './schemas';

/**
 * Content variant type mapping
 *
 * Maps CMS content_type values to our internal ContentVariantType.
 * Used for efficient lookups when selecting content.
 */
const CONTENT_VARIANT_MAP: Record<ContentVariant, ContentVariantType> = {
  [ContentVariant.CONCISE]: 'concise',      // brief_description → concise
  [ContentVariant.STANDARD]: 'standard',    // brand_story → standard
  [ContentVariant.EXTENDED]: 'extended',    // detailed_description → extended
} as const;

/**
 * Reverse mapping from internal type to CMS content_type
 */
const VARIANT_TYPE_TO_CONTENT_TYPE: Record<ContentVariantType, ContentVariant> = {
  concise: ContentVariant.CONCISE,
  standard: ContentVariant.STANDARD,
  extended: ContentVariant.EXTENDED,
} as const;

/**
 * Get CMS content_type from internal variant type
 *
 * @param variant - Internal variant type
 * @returns CMS content_type enum value
 */
export function getVariantContentType(variant: ContentVariantType): ContentVariant {
  return VARIANT_TYPE_TO_CONTENT_TYPE[variant];
}

/**
 * Get content variant type from CMS content_type
 *
 * @param contentType - CMS content_type string or enum value
 * @returns Internal variant type or undefined if not found
 */
export function getVariantType(contentType: string): ContentVariantType | undefined {
  // Handle both enum values and plain strings
  return CONTENT_VARIANT_MAP[contentType as ContentVariant];
}

/**
 * Get a specific content variant for a language
 *
 * Selects content by language and variant with fallback chain:
 * 1. Requested variant in requested language
 * 2. Standard variant in requested language
 * 3. Concise variant in requested language
 * 4. Extended variant in requested language
 * 5. Requested variant in English (fallback language)
 * 6. Standard variant in English
 * 7. First available content
 * 8. Empty string (no content available)
 *
 * @param content - Array of content items from CMS
 * @param language - ISO 639-1 language code (e.g., 'en', 'th', 'ja')
 * @param variant - Content variant type to select
 * @returns Content string or empty fallback
 *
 * @example
 * ```ts
 * const description = getContentVariant(
 *   cmsData.content,
 *   'th',
 *   'extended'
 * );
 * ```
 */
export function getContentVariant(
  content: CmsContent[],
  language: string,
  variant: ContentVariantType
): string {
  if (!content || content.length === 0) {
    return '';
  }

  const variantContentType = getVariantContentType(variant);

  // Helper to find content by language and content_type
  const findContent = (lang: string, contentType: ContentVariant): CmsContent | undefined => {
    return content.find(
      (c) => c.language === lang && c.content_type === contentType && c.status === 'published'
    );
  };

  // Helper to find any content by language
  const findAnyContentInLanguage = (lang: string): CmsContent | undefined => {
    return content.find(
      (c) => c.language === lang && c.status === 'published'
    );
  };

  // Helper to get content text from item or fallback
  const getTextOrFallback = (item: CmsContent | undefined): string => {
    return item?.content || '';
  };

  // Fallback chain: try different variants in requested language
  const variantsToTry: ContentVariant[] = [
    variantContentType,
    ContentVariant.STANDARD,
    ContentVariant.CONCISE,
    ContentVariant.EXTENDED,
  ];

  for (const contentType of variantsToTry) {
    const item = findContent(language, contentType);
    if (item && item.content) {
      return item.content;
    }
  }

  // Fallback to English if requested language is not English
  if (language !== 'en') {
    for (const contentType of variantsToTry) {
      const item = findContent('en', contentType);
      if (item && item.content) {
        return item.content;
      }
    }

    // Last resort: any English content
    const anyEnglish = findAnyContentInLanguage('en');
    if (anyEnglish && anyEnglish.content) {
      return anyEnglish.content;
    }
  }

  // Final fallback: any available content
  const firstAvailable = findAnyContentInLanguage(language);
  if (firstAvailable && firstAvailable.content) {
    return firstAvailable.content;
  }

  const anyEnglish = findAnyContentInLanguage('en');
  if (anyEnglish && anyEnglish.content) {
    return anyEnglish.content;
  }

  // No content available
  return '';
}

/**
 * Get content variant with metadata
 *
 * Returns both the content text and metadata about which variant
 * and language was actually returned (useful for debugging).
 *
 * @param content - Array of content items from CMS
 * @param language - ISO 639-1 language code
 * @param variant - Content variant type to select
 * @returns Content text with metadata
 */
export function getContentVariantWithMetadata(
  content: CmsContent[],
  language: string,
  variant: ContentVariantType
): { content: string; language: string; variant: ContentVariantType; wasFallback: boolean } {
  if (!content || content.length === 0) {
    return { content: '', language: 'en', variant: 'standard', wasFallback: true };
  }

  const variantContentType = getVariantContentType(variant);

  // Try to find exact match
  const exactMatch = content.find(
    (c) => c.language === language && c.content_type === variantContentType && c.status === 'published'
  );

  if (exactMatch) {
    return {
      content: exactMatch.content,
      language: exactMatch.language,
      variant: CONTENT_VARIANT_MAP[exactMatch.content_type as ContentVariant] || 'standard',
      wasFallback: false,
    };
  }

  // Fallback: get content and determine what we actually got
  const fallbackContent = getContentVariant(content, language, variant);

  // Try to identify what we actually got
  const fallbackItem = content.find(c => c.content === fallbackContent);

  return {
    content: fallbackContent,
    language: fallbackItem?.language || language,
    variant: fallbackItem ? (CONTENT_VARIANT_MAP[fallbackItem.content_type as ContentVariant] || 'standard') : 'standard',
    wasFallback: true,
  };
}

/**
 * Build content lookup table
 *
 * Creates a nested record structure for O(1) content lookups:
 * Record<language, Record<variantType, contentItem>>
 *
 * @param content - Array of content items from CMS
 * @returns Nested lookup table
 */
export function buildContentLookup(content: CmsContent[]): ContentLookup {
  const lookup: ContentLookup = {};

  for (const item of content) {
    // Content items use 'published' status in actual CMS
    if (item.status !== 'published') continue;

    const { language, content_type } = item;
    const variantType = CONTENT_VARIANT_MAP[content_type as ContentVariant];

    if (!variantType) continue; // Skip unknown variants

    if (!lookup[language]) {
      lookup[language] = {} as Record<ContentVariantType, CmsContent>;
    }

    lookup[language][variantType] = item;
  }

  return lookup;
}

/**
 * Get available languages from content array
 *
 * Extracts unique language codes from content items.
 * Note: Actual CMS uses 'published' status for content items.
 *
 * @param content - Array of content items from CMS
 * @returns Array of unique language codes
 *
 * @example
 * ```ts
 * const languages = getAvailableLanguages(cmsData.content);
 * // ['tr', 'ru', 'en']
 * ```
 */
export function getAvailableLanguages(content: CmsContent[]): string[] {
  if (!content || content.length === 0) {
    return [];
  }

  const languages = new Set<string>();
  for (const item of content) {
    // Content items use 'published' status in actual CMS
    if (item.status === 'published') {
      languages.add(item.language);
    }
  }

  return Array.from(languages).sort();
}

/**
 * Group facilities by category
 *
 * Groups facilities into categories for organized display.
 * Filters to only available facilities and sorts by sort_order.
 *
 * @param facilities - Array of facilities from CMS
 * @param filterAvailable - Whether to filter to available only (default: true)
 * @returns Record of category to facilities array
 *
 * @example
 * ```ts
 * const grouped = groupFacilitiesByCategory(cmsData.facilities);
 * // {
 * //   'Wellness': [{ name: 'Spa', ... }],
 * //   'Activities': [{ name: 'Beach', ... }],
 * //   ...
 * // }
 * ```
 */
export function groupFacilitiesByCategory(
  facilities: CmsFacility[],
  filterAvailable: boolean = true
): FacilityGroups {
  const grouped: Partial<FacilityGroups> = {};

  for (const facility of facilities) {
    // Skip unavailable if filtering
    if (filterAvailable && !facility.available) {
      continue;
    }

    const category = facility.category || facility.type;

    if (!grouped[category]) {
      grouped[category] = [];
    }

    grouped[category]!.push(facility);
  }

  // Sort each category's facilities by sort_order
  for (const category of Object.keys(grouped) as FacilityCategory[]) {
    const facilities = grouped[category];
    if (facilities) {
      facilities.sort((a, b) => a.sort_order - b.sort_order);
    }
  }

  return grouped as FacilityGroups;
}

/**
 * Get facilities by category with metadata
 *
 * Returns grouped facilities with additional metadata like
 * count per category and whether category has available items.
 *
 * @param facilities - Array of facilities from CMS
 * @returns Grouped facilities with metadata
 */
export function getFacilitiesByCategoryWithMetadata(
  facilities: CmsFacility[]
): { groups: FacilityGroups; metadata: Record<FacilityCategory, { count: number; hasAvailable: boolean }> } {
  const groups = groupFacilitiesByCategory(facilities, false);
  const metadata: Partial<Record<FacilityCategory, { count: number; hasAvailable: boolean }>> = {};

  for (const [category, items] of Object.entries(groups)) {
    const availableCount = items.filter((f) => f.available).length;
    metadata[category as FacilityCategory] = {
      count: items.length,
      hasAvailable: availableCount > 0,
    };
  }

  return { groups, metadata: metadata as Record<FacilityCategory, { count: number; hasAvailable: boolean }> };
}

/**
 * Get available rooms
 *
 * Filters rooms by status and sorts by sort_order.
 *
 * @param rooms - Array of rooms from CMS
 * @param status - Status to filter by (default: 'available')
 * @returns Filtered and sorted rooms array
 *
 * @example
 * ```ts
 * const rooms = getAvailableRooms(cmsData.rooms);
 * ```
 */
export function getAvailableRooms(
  rooms: CmsRoom[],
  status: string = 'available'
): CmsRoom[] {
  if (!rooms || rooms.length === 0) {
    return [];
  }

  return rooms
    .filter((room) => room.status === status)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/**
 * Group rooms by type
 *
 * Groups rooms by their room_type field for organized display.
 *
 * @param rooms - Array of rooms from CMS
 * @param filterAvailable - Whether to filter to available only (default: true)
 * @returns Record of room type to rooms array
 */
export function groupRoomsByType(
  rooms: CmsRoom[],
  filterAvailable: boolean = true
): Record<string, CmsRoom[]> {
  const grouped: Record<string, CmsRoom[]> = {};

  for (const room of rooms) {
    // Skip unavailable if filtering
    if (filterAvailable && room.status !== 'available') {
      continue;
    }

    const type = room.room_type || 'standard';

    if (!grouped[type]) {
      grouped[type] = [];
    }

    grouped[type].push(room);
  }

  // Sort each group by sort_order
  for (const type in grouped) {
    grouped[type].sort((a, b) => a.sort_order - b.sort_order);
  }

  return grouped;
}

/**
 * Transform hotel data
 *
 * Main transformation function that normalizes the full CMS response
 * into a component-ready structure with parsed address and organized data.
 *
 * @param raw - Raw hotel full response from CMS API
 * @returns Transformed hotel data ready for component consumption
 *
 * @example
 * ```ts
 * const transformed = transformHotelData(cmsResponse);
 * console.log(transformed.hotel.parsedAddress.city);
 * console.log(transformed.contentByLanguage['en']['extended']);
 * ```
 */
export function transformHotelData(
  raw: HotelFullResponse
): TransformedHotelData {
  // Parse address
  let parsedAddress: CmsAddress;
  try {
    parsedAddress = parseAddressString(raw.hotel.address);
  } catch (error) {
    console.error(`Failed to parse address for hotel ${raw.hotel.id}:`, error);
    // Provide default address to prevent crashes
    parsedAddress = {
      city: 'Unknown',
      state: '',
      street: '',
      country: '',
      postal_code: '',
    };
  }

  // Create hotel with parsed address
  const hotel: HotelWithParsedAddress = {
    ...raw.hotel,
    parsedAddress,
  };

  // Build content lookup by language and variant
  const contentByLanguage: Record<string, Record<ContentVariantType, string>> = {};
  const contentLookup = buildContentLookup(raw.content);

  for (const [language, variants] of Object.entries(contentLookup)) {
    contentByLanguage[language] = {
      concise: variants.concise?.content || '',
      standard: variants.standard?.content || '',
      extended: variants.extended?.content || '',
    };
  }

  // Get available rooms
  const rooms = getAvailableRooms(raw.rooms);

  // Group facilities by category
  const facilitiesByCategory = groupFacilitiesByCategory(raw.facilities);

  // Handle images (may be null)
  const images = raw.images || [];

  return {
    hotel,
    contentByLanguage,
    rooms,
    facilitiesByCategory,
    images,
    metadata: raw._metadata,
    errors: raw._errors,
  };
}

/**
 * Get content for a specific component use case
 *
 * Convenience function that selects the appropriate variant
 * based on common component patterns.
 *
 * @param content - Array of content items from CMS
 * @param language - ISO 639-1 language code
 * @param useCase - Component use case
 * @returns Content string or empty fallback
 *
 * @example
 * ```ts
 * // Hero section needs extended description
 * const heroText = getContentForUseCase(content, 'en', 'hero');
 *
 * // Card needs concise description
 * const cardText = getContentForUseCase(content, 'en', 'card');
 * ```
 */
export function getContentForUseCase(
  content: CmsContent[],
  language: string,
  useCase: 'hero' | 'section' | 'card' | 'meta' | 'og'
): string {
  const variantMap: Record<typeof useCase, ContentVariantType> = {
    hero: 'extended',
    section: 'standard',
    card: 'concise',
    meta: 'concise',
    og: 'concise',
  };

  const variant = variantMap[useCase];
  return getContentVariant(content, language, variant);
}

/**
 * Validate hotel data completeness
 *
 * Checks if the transformed hotel data has all required fields
 * for proper rendering. Useful for build-time validation.
 *
 * @param data - Transformed hotel data
 * @returns Validation result with errors if any
 */
export function validateHotelDataCompleteness(
  data: TransformedHotelData
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check hotel
  if (!data.hotel) {
    errors.push('Missing hotel data');
  } else {
    if (!data.hotel.name) errors.push('Missing hotel name');
    if (!data.hotel.slug) errors.push('Missing hotel slug');
    if (!data.hotel.parsedAddress) errors.push('Missing parsed address');
  }

  // Check content
  if (!data.contentByLanguage || Object.keys(data.contentByLanguage).length === 0) {
    errors.push('No content available for any language');
  }

  // Check rooms
  if (!data.rooms || data.rooms.length === 0) {
    errors.push('No rooms available');
  }

  // Check facilities
  if (!data.facilitiesByCategory || Object.keys(data.facilitiesByCategory).length === 0) {
    errors.push('No facilities available');
  }

  // Check for critical errors from API
  if (data.errors && data.errors.length > 0) {
    if (data.errors.includes('content')) {
      errors.push('Content collection failed to fetch');
    }
    if (data.errors.includes('rooms')) {
      errors.push('Rooms collection failed to fetch');
    }
    if (data.errors.includes('facilities')) {
      errors.push('Facilities collection failed to fetch');
    }
    if (data.errors.includes('images')) {
      // Images are optional, so just warn
      console.warn('Images collection failed to fetch (non-critical)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Extract SEO metadata from hotel data
 *
 * Convenience function to extract common SEO fields
 * from transformed hotel data.
 *
 * @param data - Transformed hotel data
 * @param language - Language code for content selection
 * @returns SEO metadata object
 */
export function extractSeoMetadata(
  data: TransformedHotelData,
  language: string
): {
  title: string;
  description: string;
  ogImage: string | null;
  address: string;
} {
  const { hotel } = data;

  // Build title: "Hotel Name | City, Country"
  const title = `${hotel.name} | ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}`;

  // Get concise variant for meta description from transformed data
  const languageContent = data.contentByLanguage[language];
  const description = languageContent?.concise || '';

  // Get first image for OG
  const ogImage = data.images && data.images.length > 0
    ? data.images[0].id // In real implementation, this would be the full URL
    : null;

  // Build address string
  const address = `${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}`;

  return {
    title,
    description,
    ogImage,
    address,
  };
}
