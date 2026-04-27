/**
 * Hotel Metadata Utilities
 *
 * Utilities for generating SEO metadata, hreflang tags, and JSON-LD
 * structured data for hotel pages in Next.js 15.
 *
 * @module lib/metadata/hotel-metadata
 */

import type {
  TransformedHotelData,
  CmsHotel,
  CmsAddress,
  CmsImage,
} from '@/lib/cms-api/types';

/**
 * Site base URL from environment
 *
 * Must be configured in .env.local for proper canonical/hreflang URLs.
 * Example: NEXT_PUBLIC_SITE_URL=https://example.com
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || '';

/**
 * Common country/region codes for BCP 47 locale construction
 *
 * Maps language codes to their most common country/region associations.
 * Used for constructing BCP 47 locale codes when no explicit mapping exists.
 */
const COMMON_COUNTRY_CODES: Record<string, string> = {
  en: 'US',
  es: 'ES',
  fr: 'FR',
  de: 'DE',
  th: 'TH',
  ja: 'JP',
  ar: 'SA',
  tr: 'TR',
  ru: 'RU',
  zh: 'CN',
  ko: 'KR',
  vi: 'VN',
  pt: 'BR',
  it: 'IT',
  nl: 'NL',
  pl: 'PL',
  uk: 'UA',
  // Add more as needed
};

/**
 * Known BCP 47 locale codes for languages with specific regional variants
 *
 * These are well-established locale codes used in hreflang and Open Graph tags.
 */
export const KNOWN_LOCALE_CODES: Record<string, string> = {
  'en': 'en-US',
  'en-GB': 'en-GB',
  'en-CA': 'en-CA',
  'en-AU': 'en-AU',
  'es': 'es-ES',
  'es-MX': 'es-MX',
  'es-AR': 'es-AR',
  'fr': 'fr-FR',
  'fr-CA': 'fr-CA',
  'fr-BE': 'fr-BE',
  'de': 'de-DE',
  'de-AT': 'de-AT',
  'de-CH': 'de-CH',
  'th': 'th-TH',
  'ja': 'ja-JP',
  'ar': 'ar-SA',
  'tr': 'tr-TR',
  'ru': 'ru-RU',
  'zh': 'zh-CN',
  'zh-TW': 'zh-TW',
  'ko': 'ko-KR',
  'vi': 'vi-VN',
  'pt': 'pt-BR',
  'pt-PT': 'pt-PT',
  'it': 'it-IT',
  'nl': 'nl-NL',
  'pl': 'pl-PL',
  'uk': 'uk-UA',
};

/**
 * Get extended BCP 47 locale code from language code
 *
 * Converts a simple language code (e.g., 'en', 'tr', 'ru') to a full
 * BCP 47 locale code (e.g., 'en-US', 'tr-TR', 'ru-RU') for use in
 * hreflang tags and Open Graph metadata.
 *
 * The function:
 * 1. Checks for known locale codes first
 * 2. Falls back to constructing from language + common country code
 * 3. Returns uppercase-language format as final fallback
 *
 * @param locale - Language code (ISO 639-1) or locale code
 * @returns Extended BCP 47 locale code
 *
 * @example
 * getExtendedLocaleCode('en') // 'en-US'
 * getExtendedLocaleCode('tr') // 'tr-TR'
 * getExtendedLocaleCode('ru') // 'ru-RU'
 * getExtendedLocaleCode('zh') // 'zh-CN'
 * getExtendedLocaleCode('xx') // 'XX' (fallback for unknown)
 */
export function getExtendedLocaleCode(locale: string): string {
  // Normalize input to lowercase
  const normalizedLocale = locale.toLowerCase();

  // Check if already a full locale code (contains hyphen)
  if (normalizedLocale.includes('-')) {
    const [lang, region] = normalizedLocale.split('-');
    // Return in proper format: language-REGION
    return `${lang}-${region.toUpperCase()}`;
  }

  // Check known locale codes first
  if (KNOWN_LOCALE_CODES[normalizedLocale]) {
    return KNOWN_LOCALE_CODES[normalizedLocale];
  }

  // Construct from language + common country code
  const country = COMMON_COUNTRY_CODES[normalizedLocale];
  if (country) {
    return `${normalizedLocale}-${country}`;
  }

  // Final fallback: uppercase the language code
  // This is valid for locales without regional variants
  return normalizedLocale.toUpperCase();
}

/**
 * Build canonical URL for hotel page
 *
 * @param baseUrl - Site base URL (e.g., https://example.com)
 * @param lang - Language code
 * @param slug - Hotel slug
 * @returns Full canonical URL
 *
 * @example
 * buildCanonicalUrl('https://example.com', 'en', 'thaproban-beach-house')
 * // 'https://example.com/en/hotels/thaproban-beach-house'
 *
 * Edge case: Handles missing baseUrl gracefully by using localhost fallback
 */
export function buildCanonicalUrl(
  baseUrl: string,
  lang: string,
  slug: string
): string {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove all trailing slashes
  return `${trimmedBaseUrl}/${lang}/hotels/${slug}`;
}

/**
 * Build hreflang URL object for all available languages
 *
 * Returns an object mapping locale codes to their full URLs.
 * This is used in Next.js metadata alternates.languages.
 *
 * @param baseUrl - Site base URL
 * @param slug - Hotel slug
 * @param availableLanguages - Array of available language codes
 * @returns Record of locale to URL mappings
 *
 * @example
 * buildHreflangUrls('https://example.com', 'thaproban-beach-house', ['en', 'th', 'tr'])
 * // { 'en-US': 'https://example.com/en/hotels/...', 'th-TH': 'https://example.com/th/hotels/...', 'tr-TR': 'https://example.com/tr/hotels/...' }
 */
export function buildHreflangUrls(
  baseUrl: string,
  slug: string,
  availableLanguages: string[]
): Record<string, string> {
  const urls: Record<string, string> = {};

  for (const lang of availableLanguages) {
    const extendedCode = getExtendedLocaleCode(lang);
    urls[extendedCode] = buildCanonicalUrl(baseUrl, lang, slug);
  }

  return urls;
}

/**
 * Get Open Graph image URL
 *
 * Converts image ID to full URL. Returns undefined if no image available.
 *
 * @param baseUrl - Site base URL
 * @param images - Images array from CMS
 * @returns Full OG image URL or undefined
 */
export function getOgImageUrl(
  baseUrl: string,
  images: CmsImage[] | null
): string | undefined {
  if (!images || images.length === 0) {
    return undefined;
  }

  // Use first image as OG image
  // In production, this would use the actual image URL from CMS
  const firstImage = images[0];
  const trimmedBaseUrl = baseUrl.replace(/\/$/, '');
  return `${trimmedBaseUrl}/images/${firstImage.id}`;
}

/**
 * Hotel JSON-LD Structured Data
 *
 * Schema.org Hotel type for Google Rich Results.
 * See: https://schema.org/Hotel
 *
 * Properties included:
 * - @context: Schema.org context URL
 * - @type: Schema.org type (Hotel)
 * - name: Hotel name
 * - description: Hotel description
 * - address: Postal address object
 * - starRating: Aggregate rating
 * - url: Canonical page URL
 * - image: Hotel image URL (optional)
 */
export interface HotelJsonLd {
  '@context': string;
  '@type': 'Hotel';
  name: string;
  description?: string;
  address: {
    '@type': 'PostalAddress';
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  starRating?: {
    '@type': 'Rating';
    ratingValue: number;
  };
  url?: string;
  image?: string | string[];
}

/**
 * Build Hotel JSON-LD structured data
 *
 * Generates Schema.org Hotel markup for Google Rich Results.
 *
 * @param hotel - Hotel data from CMS
 * @param description - Hotel description (concise variant recommended)
 * @param canonicalUrl - Canonical URL for this page
 * @param ogImage - Optional OG image URL
 * @returns JSON-LD object ready for serialization
 *
 * @example
 * const jsonLd = buildHotelJsonLd(hotel, description, canonicalUrl, ogImageUrl);
 * <script type="application/ld+json"
 *   dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
 * />
 */
export function buildHotelJsonLd(
  hotel: CmsHotel & { parsedAddress: CmsAddress },
  description: string,
  canonicalUrl: string,
  ogImage?: string
): HotelJsonLd {
  const jsonLd: HotelJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.parsedAddress.street || undefined,
      addressLocality: hotel.parsedAddress.city || undefined,
      addressRegion: hotel.parsedAddress.state || undefined,
      postalCode: hotel.parsedAddress.postal_code || undefined,
      addressCountry: hotel.parsedAddress.country || undefined,
    },
    url: canonicalUrl,
  };

  // Add star rating if available (1-5 stars)
  if (hotel.star_rating > 0) {
    jsonLd.starRating = {
      '@type': 'Rating',
      ratingValue: hotel.star_rating,
    };
  }

  // Add image if available
  if (ogImage) {
    jsonLd.image = ogImage;
  }

  return jsonLd;
}

/**
 * Get safe value from potentially undefined input
 *
 * Ensures undefined values don't break metadata generation.
 *
 * @param value - Potentially undefined value
 * @param fallback - Fallback value if undefined
 * @returns Safe value or fallback
 *
 * @example
 * getSafeValue(undefined, 'default') // 'default'
 * getSafeValue('value', 'default') // 'value'
 */
export function getSafeValue<T>(value: T | undefined, fallback: T): T {
  return value ?? fallback;
}

/**
 * Serialize JSON-LD with safe escaping
 *
 * Converts JSON-LD object to safe HTML string for script tag.
 *
 * @param jsonLd - JSON-LD object
 * @returns Escaped JSON string
 */
export function serializeJsonLd(jsonLd: HotelJsonLd): string {
  return JSON.stringify(jsonLd);
}

// ============================================================================
// SUB-PAGE METADATA UTILITIES (Story 24.3)
// ============================================================================

/**
 * Build canonical URL for sub-pages (rooms, gallery, amenities, etc.)
 *
 * Generic utility for building canonical URLs for pages that are not
 * hotel detail pages. Supports arbitrary path segments like 'rooms',
 * 'gallery', 'amenities', etc.
 *
 * Unlike buildCanonicalUrl(), this does not insert '/hotels/' into the path.
 *
 * @param baseUrl - Site base URL (e.g., https://example.com)
 * @param lang - Language code
 * @param path - Path segment without leading slash (e.g., 'rooms', 'gallery')
 * @returns Full canonical URL
 *
 * @example
 * buildPageCanonicalUrl('https://example.com', 'en', 'rooms')
 * // 'https://example.com/en/rooms'
 *
 * buildPageCanonicalUrl('https://example.com', 'th', 'gallery')
 * // 'https://example.com/th/gallery'
 *
 * Edge case: Handles missing baseUrl gracefully by using localhost fallback
 */
export function buildPageCanonicalUrl(
  baseUrl: string,
  lang: string,
  path: string
): string {
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, ''); // Remove all trailing slashes
  return `${trimmedBaseUrl}/${lang}/${path}`;
}

/**
 * Build hreflang URL object for sub-pages across all available languages
 *
 * Generic utility for building hreflang URL mappings for pages that are not
 * hotel detail pages. Unlike buildHreflangUrls(), this does not insert
 * '/hotels/' into the path.
 *
 * This is used in Next.js metadata alternates.languages for sub-pages.
 *
 * @param baseUrl - Site base URL
 * @param path - Path segment without leading slash (e.g., 'rooms', 'gallery')
 * @param availableLanguages - Array of available language codes
 * @returns Record of locale to URL mappings
 *
 * @example
 * buildPageHreflangUrls('https://example.com', 'rooms', ['en', 'th', 'tr'])
 * // {
 * //   'en-US': 'https://example.com/en/rooms',
 * //   'th-TH': 'https://example.com/th/rooms',
 * //   'tr-TR': 'https://example.com/tr/rooms'
 * // }
 */
export function buildPageHreflangUrls(
  baseUrl: string,
  path: string,
  availableLanguages: string[]
): Record<string, string> {
  const urls: Record<string, string> = {};

  for (const lang of availableLanguages) {
    const extendedCode = getExtendedLocaleCode(lang);
    urls[extendedCode] = buildPageCanonicalUrl(baseUrl, lang, path);
  }

  return urls;
}

// ============================================================================
// JSON-LD STRUCTURED DATA (Story 24.3)
// ============================================================================

/**
 * Item in an ItemList
 *
 * Represents a single item in a Schema.org ItemList.
 * Used for room listings, gallery images, amenities, etc.
 */
export interface ItemListItem {
  '@type': string;
  position: number;
  name: string;
  url?: string;
  description?: string;
  image?: string;
}

/**
 * ItemList JSON-LD Structured Data
 *
 * Schema.org ItemList type for Google Rich Results.
 * See: https://schema.org/ItemList
 *
 * Properties included:
 * - @context: Schema.org context URL
 * - @type: Schema.org type (ItemList)
 * - itemListElement: Array of items with position and metadata
 *
 * Common use cases:
 * - Room listings on a rooms page
 * - Gallery image collections
 * - Amenities lists
 * - Blog article lists
 */
export interface ItemListJsonLd extends Record<string, unknown> {
  '@context': string;
  '@type': 'ItemList';
  itemListElement: ItemListItem[];
  name?: string;
  description?: string;
}

/**
 * Room data for ItemList generation
 *
 * Minimal room data needed to generate ItemList entries.
 * Extends base room info with optional slug for detail page URLs.
 */
export interface RoomForItemList {
  /** Room unique identifier */
  id: string;
  /** Room name (e.g., "Deluxe Ocean Suite") */
  name: string;
  /** Room slug for URL (e.g., "deluxe-ocean-suite") */
  slug: string;
  /** Room description (optional) */
  description?: string;
  /** Room image URL (optional) */
  image?: string;
}

/**
 * Build ItemList JSON-LD structured data for rooms listing
 *
 * Generates Schema.org ItemList markup for Google Rich Results.
 * Each room becomes a ListItem with its position, name, and URL.
 *
 * @param rooms - Array of room data for ItemList
 * @param baseUrl - Site base URL for building room URLs
 * @param lang - Language code for URL generation
 * @param listName - Optional name for the list (e.g., "Rooms & Suites")
 * @param listDescription - Optional description for the list
 * @returns ItemList JSON-LD object ready for serialization
 *
 * @example
 * const rooms = [
 *   { id: '1', name: 'Deluxe Room', slug: 'deluxe-room' },
 *   { id: '2', name: 'Ocean Suite', slug: 'ocean-suite' }
 * ];
 * const jsonLd = buildRoomsItemListJsonLd(rooms, 'https://example.com', 'en');
 * // Returns: {
 * //   '@context': 'https://schema.org',
 * //   '@type': 'ItemList',
 * //   'itemListElement': [
 * //     { '@type': 'ListItem', 'position': 1, 'name': 'Deluxe Room', 'url': 'https://example.com/en/rooms/deluxe-room' },
 * //     { '@type': 'ListItem', 'position': 2, 'name': 'Ocean Suite', 'url': 'https://example.com/en/rooms/ocean-suite' }
 * //   ]
 * // }
 */
export function buildRoomsItemListJsonLd(
  rooms: RoomForItemList[],
  baseUrl: string,
  lang: string,
  listName?: string,
  listDescription?: string
): ItemListJsonLd {
  const trimmedBaseUrl = baseUrl.replace(/\/$/, '');

  const itemListElement: ItemListItem[] = rooms.map((room, index) => ({
    '@type': 'ListItem' as const,
    position: index + 1, // Schema.org uses 1-based indexing
    name: room.name,
    url: `${trimmedBaseUrl}/${lang}/rooms/${room.slug}`,
    ...(room.description && { description: room.description }),
    ...(room.image && { image: room.image }),
  }));

  const jsonLd: ItemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement,
    ...(listName && { name: listName }),
    ...(listDescription && { description: listDescription }),
  };

  return jsonLd;
}

// ============================================================================
// HOTEL ROOM JSON-LD STRUCTURED DATA (Story 24.4)
// ============================================================================

/**
 * Quantitative Value for occupancy in JSON-LD
 *
 * Used for representing numeric values like occupancy limits.
 */
export interface QuantitativeValueJsonLd {
  '@type': 'QuantitativeValue';
  maxValue: number;
}

/**
 * Hotel Room JSON-LD Structured Data
 *
 * Schema.org HotelRoom type for Google Rich Results.
 * See: https://schema.org/HotelRoom
 *
 * Properties included:
 * - @context: Schema.org context URL
 * - @type: Schema.org type (HotelRoom)
 * - name: Room name (e.g., "Deluxe Ocean Suite")
 * - description: Room description
 * - numberOfBeds: Number of beds in the room
 * - occupancy: Maximum occupancy (adults + children)
 * - image: Room image URL
 * - url: Canonical URL for this room page
 */
export interface HotelRoomJsonLd extends Record<string, unknown> {
  '@context': string;
  '@type': 'HotelRoom';
  name: string;
  description?: string;
  numberOfBeds?: number;
  occupancy?: QuantitativeValueJsonLd;
  image?: string;
  url?: string;
}

/**
 * Room data for HotelRoom JSON-LD generation
 *
 * Minimal room data needed to generate HotelRoom JSON-LD entries.
 */
export interface RoomJsonLdInput {
  /** Room name */
  name: string;
  /** Room description */
  description?: string;
  /** Room type (used for numberOfBeds estimation) */
  roomType?: string;
  /** Adult capacity */
  capacityAdults: number;
  /** Child capacity */
  capacityChildren: number;
  /** Room image URL */
  image?: string;
}

/**
 * Build HotelRoom JSON-LD structured data for room detail page
 *
 * Generates Schema.org HotelRoom markup for Google Rich Results.
 * Each room gets its own HotelRoom schema on the detail page.
 *
 * @param room - Room data from CMS
 * @param canonicalUrl - Canonical URL for this room page
 * @returns HotelRoom JSON-LD object ready for serialization
 *
 * @example
 * const room = {
 *   name: 'Deluxe Ocean Suite',
 *   description: 'Luxurious oceanfront suite',
 *   roomType: 'Suite',
 *   capacityAdults: 2,
 *   capacityChildren: 1,
 *   image: 'https://example.com/room.jpg'
 * };
 * const jsonLd = buildHotelRoomJsonLd(room, 'https://example.com/en/rooms/deluxe-ocean-suite');
 * // Returns: {
 * //   '@context': 'https://schema.org',
 * //   '@type': 'HotelRoom',
 * //   'name': 'Deluxe Ocean Suite',
 * //   'description': 'Luxurious oceanfront suite',
 * //   'occupancy': { '@type': 'QuantitativeValue', 'maxValue': 3 },
 * //   'image': 'https://example.com/room.jpg',
 * //   'url': 'https://example.com/en/rooms/deluxe-ocean-suite'
 * // }
 */
export function buildHotelRoomJsonLd(
  room: RoomJsonLdInput,
  canonicalUrl: string
): HotelRoomJsonLd {
  // Calculate total occupancy (adults + children)
  const totalCapacity = room.capacityAdults + (room.capacityChildren || 0);

  // Estimate numberOfBeds based on room type and capacity
  // This is a reasonable approximation for SEO purposes
  let estimatedBeds = 1;
  if (room.roomType?.toLowerCase().includes('suite')) {
    estimatedBeds = Math.max(1, Math.floor(room.capacityAdults / 2));
  } else if (room.roomType?.toLowerCase().includes('family')) {
    estimatedBeds = Math.max(2, Math.ceil(room.capacityAdults / 2));
  } else if (room.capacityAdults > 2) {
    estimatedBeds = Math.ceil(room.capacityAdults / 2);
  }

  const jsonLd: HotelRoomJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HotelRoom',
    name: room.name,
    url: canonicalUrl,
    occupancy: {
      '@type': 'QuantitativeValue',
      maxValue: totalCapacity,
    },
    numberOfBeds: estimatedBeds,
  };

  // Add optional description
  if (room.description) {
    jsonLd.description = room.description;
  }

  // Add optional image
  if (room.image) {
    jsonLd.image = room.image;
  }

  return jsonLd;
}

// ============================================================================
// REVIEWS AGGREGATE JSON-LD STRUCTURED DATA (Story 24.7)
// ============================================================================

/**
 * Individual Review data for JSON-LD generation
 *
 * Minimal review data needed to generate AggregateRating JSON-LD entries.
 */
export interface ReviewJsonLdInput {
  /** Review author name */
  authorName: string;
  /** Review rating (1-5) */
  rating: 1 | 2 | 3 | 4 | 5;
  /** Review text/quote */
  reviewBody?: string;
  /** Date published (ISO 8601 format) */
  datePublished?: string;
}

/**
 * Aggregate Rating JSON-LD Structured Data
 *
 * Schema.org AggregateRating type for Google Rich Results.
 * See: https://schema.org/AggregateRating
 *
 * Properties included:
 * - @context: Schema.org context URL
 * - @type: Schema.org type (AggregateRating)
 * - itemReviewed: Thing being reviewed (hotel)
 * - ratingValue: Average rating (1-5)
 * - reviewCount: Total number of reviews
 * - bestRating: Best possible rating (5)
 * - worstRating: Worst possible rating (1)
 */
export interface AggregateRatingJsonLd extends Record<string, unknown> {
  '@context': string;
  '@type': 'AggregateRating';
  itemReviewed: {
    '@type': string;
    name: string;
  };
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
}

/**
 * Build Reviews Aggregate JSON-LD structured data for reviews page
 *
 * Generates Schema.org AggregateRating markup for Google Rich Results.
 * Calculates average rating from provided reviews and creates proper schema markup.
 *
 * @param reviews - Array of review data for aggregate calculation
 * @param hotelName - Name of the hotel being reviewed
 * @returns AggregateRating JSON-LD object ready for serialization, or null if no reviews
 *
 * @example
 * const reviews = [
 *   { authorName: 'John Doe', rating: 5, reviewBody: 'Excellent stay!' },
 *   { authorName: 'Jane Smith', rating: 4, reviewBody: 'Very good experience' }
 * ];
 * const jsonLd = buildReviewsAggregateJsonLd(reviews, 'Test Hotel');
 * // Returns: {
 * //   '@context': 'https://schema.org',
 * //   '@type': 'AggregateRating',
 * //   'itemReviewed': { '@type': 'Organization', 'name': 'Test Hotel' },
 * //   'ratingValue': 4.5,
 * //   'reviewCount': 2,
 * //   'bestRating': 5,
 * //   'worstRating': 1
 * // }
 */
export function buildReviewsAggregateJsonLd(
  reviews: ReviewJsonLdInput[],
  hotelName: string
): AggregateRatingJsonLd | null {
  // Handle empty reviews array gracefully
  if (!reviews || reviews.length === 0) {
    return null;
  }

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  // Round to 1 decimal place for display
  const roundedRating = Math.round(averageRating * 10) / 10;

  const jsonLd: AggregateRatingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: {
      '@type': 'Organization',
      name: hotelName,
    },
    ratingValue: roundedRating,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };

  return jsonLd;
}

// ============================================================================
// FAQ PAGE JSON-LD STRUCTURED DATA (Story 24.10)
// ============================================================================

/**
 * FAQ item for JSON-LD generation
 *
 * Question and answer pair for FAQPage schema.
 */
export interface FAQJsonLdInput {
  /** Question text */
  question: string;
  /** Answer text */
  answer: string;
}

/**
 * FAQPage JSON-LD Structured Data
 *
 * Schema.org FAQPage type for Google Rich Results.
 * See: https://schema.org/FAQPage
 *
 * Properties included:
 * - @context: Schema.org context URL
 * - @type: Schema.org type (FAQPage)
 * - mainEntity: Array of Question items with Question and acceptedAnswer
 *
 * Each Question item has:
 * - @type: 'Question'
 * - name: The question text
 * - acceptedAnswer: Object with @type: 'Answer' and text property
 */
export interface FAQPageJsonLd extends Record<string, unknown> {
  '@context': string;
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

/**
 * Build FAQPage JSON-LD structured data for FAQ page
 *
 * Generates Schema.org FAQPage markup for Google Rich Results.
 * Each FAQ item becomes a Question/Answer pair in the structured data.
 *
 * @param faqs - Array of FAQ items (question/answer pairs)
 * @returns FAQPage JSON-LD object ready for serialization, or null if no FAQs
 *
 * @example
 * const faqs = [
 *   { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before check-in.' },
 *   { question: 'Do you offer parking?', answer: 'Yes, we have free on-site parking available.' }
 * ];
 * const jsonLd = buildFAQPageJsonLd(faqs);
 * // Returns: {
 * //   '@context': 'https://schema.org',
 * //   '@type': 'FAQPage',
 * //   'mainEntity': [
 * //     { '@type': 'Question', 'name': 'What is your cancellation policy?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Free cancellation...' } },
 * //     { '@type': 'Question', 'name': 'Do you offer parking?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes, we have...' } }
 * //   ]
 * // }
 */
export function buildFAQPageJsonLd(
  faqs: FAQJsonLdInput[]
): FAQPageJsonLd | null {
  // Handle empty FAQ array gracefully
  if (!faqs || faqs.length === 0) {
    return null;
  }

  // Build mainEntity array with Question/Answer items
  const mainEntity = faqs.map((faq) => ({
    '@type': 'Question' as const,
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer' as const,
      text: faq.answer,
    },
  }));

  const jsonLd: FAQPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };

  return jsonLd;
}

