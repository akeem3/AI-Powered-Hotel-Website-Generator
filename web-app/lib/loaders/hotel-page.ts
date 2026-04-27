/**
 * Hotel Page Data Loader
 *
 * Build-time data loader for hotel pages. Fetches hotel content from CMS API
 * and transforms it into component-ready props using data mappers (ADR-004).
 *
 * Uses React cache for memoization during build time.
 *
 * @module lib/loaders/hotel-page
 */

import { cache } from 'react';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import type {
  HotelFullResponse,
  CmsHotel,
  CmsAddress,
  CmsContent,
  CmsImage,
  CmsRoom,
} from '@/lib/cms-api/types';

// Import data mappers (ADR-004)
import {
  mapCmsToHero,
  mapCmsToAmenities,
  mapCmsToRooms,
  mapCmsToGallery,
  mapCmsToHotelInfo,
} from '@/lib/mappers';

// Import room slug utilities for room detail pages
import {
  findRoomBySlug,
  type RoomSlugInfo,
} from './room-slug';

/**
 * Combined page props for hotel page
 *
 * All data needed to render the hotel page at build time.
 * Structured for easy injection into component props.
 *
 * Mapped props follow ADR-004 Adapter Pattern.
 */
export interface HotelPageProps {
  /** Hotel basic information */
  hotel: CmsHotel & { parsedAddress: CmsAddress };

  /** Hero section props (mapped via mapCmsToHero) */
  hero: ReturnType<typeof import('@/lib/mappers').mapCmsToHero>;

  /** Amenities section props (mapped via mapCmsToAmenities) */
  amenities: ReturnType<typeof import('@/lib/mappers').mapCmsToAmenities>;

  /** Rooms section props (mapped via mapCmsToRooms) */
  rooms: ReturnType<typeof import('@/lib/mappers').mapCmsToRooms>;

  /** Gallery section props (mapped via mapCmsToGallery) */
  gallery: ReturnType<typeof import('@/lib/mappers').mapCmsToGallery>;

  /** Hotel info section props (mapped via mapCmsToHotelInfo) */
  hotelInfo: ReturnType<typeof import('@/lib/mappers').mapCmsToHotelInfo>;

  /** Raw content array for advanced use cases */
  content: CmsContent[];

  /** Images (may be null if CMS errors) */
  images: CmsImage[] | null;

  /** Available languages for this hotel */
  availableLanguages: string[];

  /** Metadata about the fetch */
  metadata: {
    hotelId: string;
    fetchedAt: string;
    processingTimeMs: number;
    hasErrors: boolean;
  };
}

/**
 * Rooms page data props
 *
 * Data needed to render the rooms listing page.
 * Returns all available rooms without limit.
 */
export interface RoomsPageProps {
  /** Hotel basic information */
  hotel: CmsHotel & { parsedAddress: CmsAddress };

  /** All rooms section props (mapped via mapCmsToRooms without limit) */
  rooms: ReturnType<typeof import('@/lib/mappers').mapCmsToRooms>;

  /** Available languages for this hotel */
  availableLanguages: string[];

  /** Images (may be null if CMS errors) */
  images: CmsImage[] | null;

  /** Metadata about the fetch */
  metadata: {
    hotelId: string;
    fetchedAt: string;
    processingTimeMs: number;
    hasErrors: boolean;
  };
}

/**
 * Room detail page data props
 *
 * Data needed to render a single room detail page.
 * Returns null if room slug is not found.
 */
export interface RoomDetailPageProps {
  /** Hotel basic information */
  hotel: CmsHotel & { parsedAddress: CmsAddress };

  /** Single room data or null if not found */
  room: CmsRoom | null;

  /** Room props mapped for component (null if room not found) */
  roomProps: ReturnType<typeof import('@/lib/mappers').mapCmsToRooms> | null;

  /** Available languages for this hotel */
  availableLanguages: string[];

  /** Images (may be null if CMS errors) */
  images: CmsImage[] | null;

  /** Metadata about the fetch */
  metadata: {
    hotelId: string;
    fetchedAt: string;
    processingTimeMs: number;
    hasErrors: boolean;
  };
}

/**
 * Gallery page data props
 *
 * Data needed to render the gallery page.
 * Returns all gallery images.
 */
export interface GalleryPageProps {
  /** Hotel basic information */
  hotel: CmsHotel & { parsedAddress: CmsAddress };

  /** Gallery section props (mapped via mapCmsToGallery) */
  gallery: ReturnType<typeof import('@/lib/mappers').mapCmsToGallery>;

  /** Available languages for this hotel */
  availableLanguages: string[];

  /** Metadata about the fetch */
  metadata: {
    hotelId: string;
    fetchedAt: string;
    processingTimeMs: number;
    hasErrors: boolean;
  };
}

/**
 * Amenities page data props
 *
 * Data needed to render the amenities page.
 * Returns all amenities grouped by category.
 */
export interface AmenitiesPageProps {
  /** Hotel basic information */
  hotel: CmsHotel & { parsedAddress: CmsAddress };

  /** Amenities section props (mapped via mapCmsToAmenities) */
  amenities: ReturnType<typeof import('@/lib/mappers').mapCmsToAmenities>;

  /** Metadata about the fetch */
  metadata: {
    hotelId: string;
    fetchedAt: string;
    processingTimeMs: number;
    hasErrors: boolean;
  };
}

/**
 * Hero and hotel data props
 *
 * Minimal data needed for homepage teaser composition.
 * Returns hotel metadata and hero section props.
 */
export interface HeroAndHotelDataProps {
  /** Hotel basic information */
  hotel: CmsHotel & { parsedAddress: CmsAddress };

  /** Hero section props (mapped via mapCmsToHero) */
  hero: ReturnType<typeof import('@/lib/mappers').mapCmsToHero>;

  /** Available languages for this hotel */
  availableLanguages: string[];

  /** Images (may be null if CMS errors) */
  images: CmsImage[] | null;

  /** Metadata about the fetch */
  metadata: {
    hotelId: string;
    fetchedAt: string;
    processingTimeMs: number;
    hasErrors: boolean;
  };
}

/**
 * Get hotel page data for build-time rendering
 *
 * This loader fetches hotel data from the CMS API and uses data mappers
 * to transform it into component-ready props.
 *
 * Data Mappers (ADR-004):
 * - mapCmsToHero: Transforms to HeroSection props
 * - mapCmsToAmenities: Transforms to Amenities props
 * - mapCmsToRooms: Transforms to RoomsGrid props
 * - mapCmsToGallery: Transforms to ImageGallery props
 * - mapCmsToHotelInfo: Transforms to HotelInfo props
 *
 * Each mapper:
 * - Is a pure function (deterministic, no side effects)
 * - Uses strictly typed interfaces (inferred from Zod contracts)
 * - Includes fallback logic for missing data
 * - Returns valid Props objects or fails gracefully
 *
 * Language Fallback:
 * - If requested language content is missing, falls back to English (en)
 * - Follows the 8-level fallback chain from getContentVariant()
 *
 * Image Handling:
 * - If images collection has errors, images will be null
 * - Components must handle null/undefined images gracefully
 *
 * @param hotelId - Hotel UUID
 * @param lang - Language code (e.g., 'en', 'th', 'ja')
 * @returns Hotel page props for component rendering
 * @throws {CmsApiError} If hotel cannot be fetched
 *
 * @example
 * ```ts
 * // In server component
 * const { lang, slug } = await params;
 * const data = await getHotelPageData(process.env.HOTEL_ID!, lang);
 * return <HotelPage {...data} />;
 * ```
 */
export const getHotelPageData = cache(async (
  hotelId: string,
  lang: string
): Promise<HotelPageProps> => {
  // Fetch full hotel data from CMS API
  const hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } } =
    await getHotelFull(hotelId);

  // Get available languages
  const availableLanguages = getAvailableLanguages(hotelData.content);

  // Check if there were any errors during fetch (for images, etc.)
  const hasErrors = hotelData._errors && hotelData._errors.length > 0;
  if (hasErrors) {
    console.warn(
      `[getHotelPageData] Hotel ${hotelId} had collection errors:`,
      hotelData._errors.join(', ')
    );
  }

  // Build site URL for image links
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Use data mappers to transform CMS data to component props
  // These are pure functions following ADR-004 Adapter Pattern
  const heroProps = mapCmsToHero({ hotelData, lang, siteUrl });
  const amenitiesProps = mapCmsToAmenities({ hotelData });
  const roomsProps = mapCmsToRooms({ hotelData });
  const galleryProps = mapCmsToGallery({ hotelData, siteUrl });
  const hotelInfoProps = mapCmsToHotelInfo({ hotelData });

  // Return complete page props with mapped data
  return {
    hotel: hotelData.hotel,
    hero: heroProps,
    amenities: amenitiesProps,
    rooms: roomsProps,
    gallery: galleryProps,
    hotelInfo: hotelInfoProps,
    content: hotelData.content,
    images: hotelData.images, // May be null if collection had errors
    availableLanguages,
    metadata: {
      hotelId,
      fetchedAt: hotelData._metadata.fetched_at,
      processingTimeMs: hotelData._metadata.processing_time_ms,
      hasErrors,
    },
  };
});

/**
 * Type guard to check if images data is valid
 *
 * Use this before rendering image-dependent components.
 *
 * @param images - Images array from loader
 * @returns true if images is a non-null array
 */
export function hasValidImages(images: CmsImage[] | null): images is CmsImage[] {
  return images !== null && Array.isArray(images) && images.length > 0;
}

// Re-export types from mappers for convenience
export type { HeroSectionContractType } from '@/lib/contracts/hero.contract';
export type { AmenitiesConfig } from '@/lib/contracts/amenities.contract';
export type { RoomsGridSchema } from '@/lib/contracts/room.contract';
export type { ImageGalleryConfig } from '@/lib/contracts/gallery.contract';
export type { HotelInfoContractType } from '@/lib/contracts/hotel-info.contract';

// ============================================================================
// SECTION-SPECIFIC DATA LOADERS (Story 24.1)
// ============================================================================

/**
 * Get rooms page data for build-time rendering
 *
 * Fetches only the rooms data needed for the rooms listing page.
 * All available rooms are returned without limit.
 *
 * @param hotelId - Hotel UUID
 * @param lang - Language code (e.g., 'en', 'th', 'ja')
 * @returns Rooms page props for component rendering
 * @throws {CmsApiError} If hotel cannot be fetched
 *
 * @example
 * ```ts
 * // In app/[lang]/rooms/page.tsx
 * const data = await getRoomsPageData(process.env.HOTEL_ID!, lang);
 * return <RoomsPage {...data} />;
 * ```
 */
export const getRoomsPageData = cache(async (
  hotelId: string,
  lang: string
): Promise<RoomsPageProps> => {
  // Fetch full hotel data from CMS API
  const hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } } =
    await getHotelFull(hotelId);

  // Get available languages
  const availableLanguages = getAvailableLanguages(hotelData.content);

  // Check if there were any errors during fetch
  const hasErrors = hotelData._errors && hotelData._errors.length > 0;
  if (hasErrors) {
    console.warn(
      `[getRoomsPageData] Hotel ${hotelId} had collection errors:`,
      hotelData._errors.join(', ')
    );
  }

  // Map rooms data (no limit - all available rooms)
  const roomsProps = mapCmsToRooms({ hotelData });

  return {
    hotel: hotelData.hotel,
    rooms: roomsProps,
    availableLanguages,
    images: hotelData.images,
    metadata: {
      hotelId,
      fetchedAt: hotelData._metadata.fetched_at,
      processingTimeMs: hotelData._metadata.processing_time_ms,
      hasErrors,
    },
  };
});

/**
 * Get room detail page data for build-time rendering
 *
 * Fetches data for a single room identified by its slug.
 * Returns null room if slug is not found.
 *
 * @param hotelId - Hotel UUID
 * @param lang - Language code (e.g., 'en', 'th', 'ja')
 * @param roomSlug - URL-safe room slug generated from room name
 * @returns Room detail page props, with null room if not found
 * @throws {CmsApiError} If hotel cannot be fetched
 *
 * @example
 * ```ts
 * // In app/[lang]/rooms/[roomSlug]/page.tsx
 * const { roomSlug } = await params;
 * const data = await getRoomDetailPageData(process.env.HOTEL_ID!, lang, roomSlug);
 * if (!data.room) {
 *   notFound();
 * }
 * return <RoomDetailPage {...data} />;
 * ```
 */
export const getRoomDetailPageData = cache(async (
  hotelId: string,
  lang: string,
  roomSlug: string
): Promise<RoomDetailPageProps> => {
  // Fetch full hotel data from CMS API
  const hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } } =
    await getHotelFull(hotelId);

  // Get available languages
  const availableLanguages = getAvailableLanguages(hotelData.content);

  // Check if there were any errors during fetch
  const hasErrors = hotelData._errors && hotelData._errors.length > 0;
  if (hasErrors) {
    console.warn(
      `[getRoomDetailPageData] Hotel ${hotelId} had collection errors:`,
      hotelData._errors.join(', ')
    );
  }

  // Find room by slug
  const room = findRoomBySlug(hotelData.rooms, roomSlug);

  if (!room) {
    // Room not found - return props with null room
    return {
      hotel: hotelData.hotel,
      room: null,
      roomProps: null,
      availableLanguages,
      images: hotelData.images,
      metadata: {
        hotelId,
        fetchedAt: hotelData._metadata.fetched_at,
        processingTimeMs: hotelData._metadata.processing_time_ms,
        hasErrors,
      },
    };
  }

  // Map single room to component props
  // Create a minimal hotelData object with just this room for the mapper
  const singleRoomHotelData = {
    ...hotelData,
    rooms: [room],
  };

  const roomProps = mapCmsToRooms({ hotelData: singleRoomHotelData });

  return {
    hotel: hotelData.hotel,
    room,
    roomProps,
    availableLanguages,
    images: hotelData.images,
    metadata: {
      hotelId,
      fetchedAt: hotelData._metadata.fetched_at,
      processingTimeMs: hotelData._metadata.processing_time_ms,
      hasErrors,
    },
  };
});

/**
 * Get gallery page data for build-time rendering
 *
 * Fetches only the gallery data needed for the gallery page.
 * All images are returned.
 *
 * @param hotelId - Hotel UUID
 * @param lang - Language code (e.g., 'en', 'th', 'ja')
 * @returns Gallery page props for component rendering
 * @throws {CmsApiError} If hotel cannot be fetched
 *
 * @example
 * ```ts
 * // In app/[lang]/gallery/page.tsx
 * const data = await getGalleryPageData(process.env.HOTEL_ID!, lang);
 * return <GalleryPage {...data} />;
 * ```
 */
export const getGalleryPageData = cache(async (
  hotelId: string,
  lang: string
): Promise<GalleryPageProps> => {
  // Fetch full hotel data from CMS API
  const hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } } =
    await getHotelFull(hotelId);

  // Get available languages
  const availableLanguages = getAvailableLanguages(hotelData.content);

  // Check if there were any errors during fetch
  const hasErrors = hotelData._errors && hotelData._errors.length > 0;
  if (hasErrors) {
    console.warn(
      `[getGalleryPageData] Hotel ${hotelId} had collection errors:`,
      hotelData._errors.join(', ')
    );
  }

  // Build site URL for image links
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Map gallery data
  const galleryProps = mapCmsToGallery({ hotelData, siteUrl });

  return {
    hotel: hotelData.hotel,
    gallery: galleryProps,
    availableLanguages,
    metadata: {
      hotelId,
      fetchedAt: hotelData._metadata.fetched_at,
      processingTimeMs: hotelData._metadata.processing_time_ms,
      hasErrors,
    },
  };
});

/**
 * Get amenities page data for build-time rendering
 *
 * Fetches only the amenities data needed for the amenities page.
 * All facilities grouped by category are returned.
 *
 * @param hotelId - Hotel UUID
 * @returns Amenities page props for component rendering
 * @throws {CmsApiError} If hotel cannot be fetched
 *
 * @example
 * ```ts
 * // In app/[lang]/amenities/page.tsx
 * const data = await getAmenitiesPageData(process.env.HOTEL_ID!);
 * return <AmenitiesPage {...data} />;
 * ```
 */
export const getAmenitiesPageData = cache(async (
  hotelId: string
): Promise<AmenitiesPageProps> => {
  // Fetch full hotel data from CMS API
  const hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } } =
    await getHotelFull(hotelId);

  // Check if there were any errors during fetch
  const hasErrors = hotelData._errors && hotelData._errors.length > 0;
  if (hasErrors) {
    console.warn(
      `[getAmenitiesPageData] Hotel ${hotelId} had collection errors:`,
      hotelData._errors.join(', ')
    );
  }

  // Map amenities data
  const amenitiesProps = mapCmsToAmenities({ hotelData });

  return {
    hotel: hotelData.hotel,
    amenities: amenitiesProps,
    metadata: {
      hotelId,
      fetchedAt: hotelData._metadata.fetched_at,
      processingTimeMs: hotelData._metadata.processing_time_ms,
      hasErrors,
    },
  };
});

/**
 * Get hero and hotel data for homepage teaser composition
 *
 * Fetches minimal data needed for homepage hero section and hotel metadata.
 * Used for curated landing page that shows teasers with "View All" links.
 *
 * @param hotelId - Hotel UUID
 * @param lang - Language code (e.g., 'en', 'th', 'ja')
 * @returns Hero and hotel data props for component rendering
 * @throws {CmsApiError} If hotel cannot be fetched
 *
 * @example
 * ```ts
 * // In app/[lang]/page.tsx (curated landing homepage)
 * const data = await getHeroAndHotelData(process.env.HOTEL_ID!, lang);
 * return <Homepage {...data} />;
 * ```
 */
export const getHeroAndHotelData = cache(async (
  hotelId: string,
  lang: string
): Promise<HeroAndHotelDataProps> => {
  // Fetch full hotel data from CMS API
  const hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } } =
    await getHotelFull(hotelId);

  // Get available languages
  const availableLanguages = getAvailableLanguages(hotelData.content);

  // Check if there were any errors during fetch
  const hasErrors = hotelData._errors && hotelData._errors.length > 0;
  if (hasErrors) {
    console.warn(
      `[getHeroAndHotelData] Hotel ${hotelId} had collection errors:`,
      hotelData._errors.join(', ')
    );
  }

  // Build site URL for image links
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Map hero data
  const heroProps = mapCmsToHero({ hotelData, lang, siteUrl });

  return {
    hotel: hotelData.hotel,
    hero: heroProps,
    availableLanguages,
    images: hotelData.images,
    metadata: {
      hotelId,
      fetchedAt: hotelData._metadata.fetched_at,
      processingTimeMs: hotelData._metadata.processing_time_ms,
      hasErrors,
    },
  };
});
