/**
 * Amenities Section Data Mapper
 *
 * Transforms raw CMS data into Amenities component props.
 * Uses strictly typed interfaces inferred from Zod contracts.
 *
 * @module lib/mappers/amenities.mapper
 */

import type { AmenitiesConfig } from '@/lib/contracts/amenities.contract';
import type {
  HotelFullResponse,
  CmsHotel,
  CmsAddress,
  CmsFacility,
  FacilityCategory,
} from '@/lib/cms-api/types';
import { groupFacilitiesByCategory } from '@/lib/cms-api/transformers';

/**
 * Input parameters for amenities mapper
 */
export interface MapCmsToAmenitiesInput {
  /** Full hotel data from CMS API */
  hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } };
  /** Whether to limit to featured facilities only */
  featuredOnly?: boolean;
  /** Maximum number of amenities to include (optional, for previews) */
  limit?: number;
}

/**
 * Category mapping for Amenities component
 *
 * Maps CMS facility categories to contract's expected values.
 */
const CATEGORY_MAP: Record<FacilityCategory, 'room' | 'hotel' | 'location' | 'services'> = {
  'room_amenity': 'room',
  'Activities': 'services',
  'Wellness': 'services',
  'Food & Drink': 'services',
  'Bathroom': 'room',
  'Outdoors': 'location',
  'Internet': 'services',
  'Parking': 'location',
  'Reception services': 'hotel',
  'Safety & security': 'hotel',
  'General': 'hotel',
  'Cleaning services': 'services',
  'Entertainment and family services': 'services',
  'Great for your stay': 'services',
};

/**
 * Get the icon name for a facility category
 *
 * Returns a Lucide icon name for each category.
 * In production, this could be a mapping to actual icon components.
 */
function getCategoryIcon(category: FacilityCategory): string {
  const iconMap: Partial<Record<FacilityCategory, string>> = {
    'room_amenity': 'CircleCheck',
    'Activities': 'Activity',
    'Wellness': 'Spa',
    'Food & Drink': 'Utensils',
    'Bathroom': 'Bath',
    'Outdoors': 'TreePine',
    'Internet': 'Wifi',
    'Parking': 'Car',
    'Reception services': 'Bell',
    'Safety & security': 'Shield',
    'General': 'CircleCheck',
    'Cleaning services': 'Trash2',
    'Entertainment and family services': 'Gamepad2',
    'Great for your stay': 'Star',
  };
  return iconMap[category] || 'CircleCheck';
}

/**
 * Map CMS data to Amenities component props
 *
 * Transforms raw CMS facility data into strictly typed Amenities props.
 * Groups facilities by category and maps to component contract format.
 *
 * @param input - Mapper input parameters
 * @returns Amenities component props
 *
 * @example
 * ```ts
 * // Get all amenities
 * const amenitiesProps = mapCmsToAmenities({
 *   hotelData: cmsResponse,
 *   featuredOnly: false
 * });
 *
 * // Get homepage preview (first 8 amenities)
 * const previewProps = mapCmsToAmenities({
 *   hotelData: cmsResponse,
 *   limit: 8
 * });
 * ```
 */
export function mapCmsToAmenities(input: MapCmsToAmenitiesInput): AmenitiesConfig {
  const { hotelData, featuredOnly = false, limit } = input;
  const { facilities } = hotelData;

  // Group facilities by category
  const facilitiesByCategory = groupFacilitiesByCategory(facilities, true);

  // Transform facilities to Amenities contract format
  // Note: CmsFacility doesn't have a 'featured' property, so we include all available facilities
  const allAmenities = Object.entries(facilitiesByCategory).flatMap(([category, facilityList]) =>
    facilityList.map((facility) => ({
      id: facility.id,
      name: facility.name,
      description: facility.description || undefined,
      icon: getCategoryIcon(facility.category),
      category: CATEGORY_MAP[facility.category] || 'hotel',
      featured: false, // Default to false since CMS doesn't have this field
    }))
  );

  // Apply limit if specified (for homepage teasers)
  // Use !== undefined instead of just `limit` to handle limit: 0 correctly
  const amenitiesToShow = limit !== undefined ? allAmenities.slice(0, limit) : allAmenities;

  // Build amenities props
  const amenitiesProps: AmenitiesConfig = {
    variant: {
      layout: 'grid',
      columns: 4,
      iconSize: 'medium',
      iconStyle: 'default',
      cardStyle: 'default',
    },
    amenities: amenitiesToShow,
    showCategory: false,
  };

  return amenitiesProps;
}
