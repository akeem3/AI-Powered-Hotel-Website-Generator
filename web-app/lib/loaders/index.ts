/**
 * Data Loaders Index
 *
 * Barrel export file for all data loaders.
 * Provides clean imports for build-time data fetching functions.
 *
 * @module lib/loaders
 */

// Export all hotel page loaders
export {
  getHotelPageData,
  getRoomsPageData,
  getRoomDetailPageData,
  getGalleryPageData,
  getAmenitiesPageData,
  getHeroAndHotelData,
  hasValidImages,
} from './hotel-page';

// Export all room slug utilities
export {
  generateRoomSlug,
  generateRoomSlugs,
  getAvailableRoomSlugs,
  findRoomBySlug,
  testSlugGeneration,
  validateSlugFormat,
} from './room-slug';

// Export all loader return types
export type {
  HotelPageProps,
  RoomsPageProps,
  RoomDetailPageProps,
  GalleryPageProps,
  AmenitiesPageProps,
  HeroAndHotelDataProps,
} from './hotel-page';

// Export room slug types
export type {
  RoomSlugInfo,
} from './room-slug';

// Re-export contract types for convenience
export type { HeroSectionContractType } from '@/lib/contracts/hero.contract';
export type { AmenitiesConfig } from '@/lib/contracts/amenities.contract';
export type { RoomsGridSchema } from '@/lib/contracts/room.contract';
export type { ImageGalleryConfig } from '@/lib/contracts/gallery.contract';
export type { HotelInfoContractType } from '@/lib/contracts/hotel-info.contract';
