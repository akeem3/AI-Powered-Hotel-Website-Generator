/**
 * Hotel Info Section Data Mapper
 *
 * Transforms raw CMS data into HotelInfo component props.
 * Uses strictly typed interfaces inferred from Zod contracts.
 *
 * @module lib/mappers/hotel-info.mapper
 */

import type { HotelInfoContractType } from '@/lib/contracts/hotel-info.contract';
import type {
  HotelFullResponse,
  CmsHotel,
  CmsAddress,
} from '@/lib/cms-api/types';

/**
 * Input parameters for hotel info mapper
 */
export interface MapCmsToHotelInfoInput {
  /** Full hotel data from CMS API */
  hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } };
  /** Section heading (optional) */
  heading?: string;
}

/**
 * Map CMS data to HotelInfo component props
 *
 * Transforms raw CMS hotel data into strictly typed HotelInfo props.
 * Includes hotel name, star rating, address, and property type.
 *
 * @param input - Mapper input parameters
 * @returns HotelInfo component props
 *
 * @example
 * ```ts
 * const hotelInfoProps = mapCmsToHotelInfo({
 *   hotelData: cmsResponse,
 *   heading: 'About This Hotel'
 * });
 * ```
 */
export function mapCmsToHotelInfo(input: MapCmsToHotelInfoInput): HotelInfoContractType {
  const { hotelData, heading } = input;
  const { hotel } = hotelData;

  // Build hotel info props
  const hotelInfoProps: HotelInfoContractType = {
    hotel: {
      id: hotel.id,
      name: hotel.name,
      slug: hotel.slug,
      property_type: hotel.property_type,
      star_rating: hotel.star_rating,
      status: hotel.status,
      opening_year: hotel.opening_year,
      address: hotel.address, // Keep as JSON string
      is_template: hotel.is_template,
      has_override: hotel.has_override,
      created_at: hotel.created_at,
      updated_at: hotel.updated_at,
      parsedAddress: hotel.parsedAddress,
    },
    heading: heading || 'Hotel Information',
  };

  return hotelInfoProps;
}
