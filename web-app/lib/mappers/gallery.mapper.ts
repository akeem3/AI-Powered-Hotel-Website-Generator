/**
 * Image Gallery Data Mapper
 *
 * Transforms raw CMS data into ImageGallery component props.
 * Uses strictly typed interfaces inferred from Zod contracts.
 *
 * @module lib/mappers/gallery.mapper
 */

import type { ImageGalleryConfig } from '@/lib/contracts/gallery.contract';
import type {
  HotelFullResponse,
  CmsHotel,
  CmsAddress,
  CmsImage,
} from '@/lib/cms-api/types';

/**
 * Input parameters for gallery mapper
 */
export interface MapCmsToGalleryInput {
  /** Full hotel data from CMS API */
  hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } };
  /** Site URL for building image URLs */
  siteUrl?: string;
  /** Maximum number of images to include (optional, for previews) */
  limit?: number;
}

/**
 * Map CMS data to ImageGallery component props
 *
 * Transforms raw CMS image data into strictly typed ImageGallery props.
 * Builds full URLs from image IDs and includes alt text.
 *
 * Image Handling:
 * - Uses CMS image IDs to build URLs
 * - Falls back to empty array if no images available
 * - Supports limiting image count for previews
 *
 * @param input - Mapper input parameters
 * @returns ImageGallery component props
 *
 * @example
 * ```ts
 * // Get all images
 * const galleryProps = mapCmsToGallery({
 *   hotelData: cmsResponse,
 *   siteUrl: 'https://example.com'
 * });
 *
 * // Get preview (first 6 images)
 * const previewProps = mapCmsToGallery({
 *   hotelData: cmsResponse,
 *   siteUrl: 'https://example.com',
 *   limit: 6
 * });
 * ```
 */
export function mapCmsToGallery(input: MapCmsToGalleryInput): ImageGalleryConfig {
  const { hotelData, siteUrl = 'http://localhost:3000', limit } = input;
  const { hotel, images } = hotelData;

  // Handle missing images gracefully
  if (!images || images.length === 0) {
    return {
      variant: {
        layout: 'masonry',
        spacing: 'normal',
        aspectRatio: 'landscape',
        cardStyle: 'default',
      },
      images: [],
      enableLightbox: true,
    };
  }

  // Build base URL
  const baseUrl = siteUrl.replace(/\/$/, '');

  // Apply limit if specified
  const imagesToMap = limit ? images.slice(0, limit) : images;

  // Transform images to gallery format
  const galleryImages = imagesToMap.map((img) => ({
    id: img.id,
    desktopUrl: `${baseUrl}/images/${img.id}`,
    mobileUrl: `${baseUrl}/images/${img.id}`,
    alt: `${hotel.name} - View`,
    caption: hotel.name,
  }));

  // Build gallery props
  const galleryProps: ImageGalleryConfig = {
    variant: {
      layout: 'masonry',
      spacing: 'normal',
      aspectRatio: 'landscape',
      cardStyle: 'default',
    },
    images: galleryImages,
    enableLightbox: true,
  };

  return galleryProps;
}
