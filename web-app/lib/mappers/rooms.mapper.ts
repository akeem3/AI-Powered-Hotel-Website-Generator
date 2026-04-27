/**
 * Rooms Section Data Mapper
 *
 * Transforms raw CMS data into RoomsGrid component props.
 * Uses strictly typed interfaces inferred from Zod contracts.
 *
 * @module lib/mappers/rooms.mapper
 */

import type { RoomCardContractType } from '@/lib/contracts/room.contract';
import type { RoomsGridProps } from '@/types/room';
import type {
  HotelFullResponse,
  CmsHotel,
  CmsAddress,
  CmsRoom,
} from '@/lib/cms-api/types';
import { getAvailableRooms } from '@/lib/cms-api/transformers';

/**
 * Input parameters for rooms mapper
 */
export interface MapCmsToRoomsInput {
  /** Full hotel data from CMS API */
  hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } };
  /** Maximum number of rooms to include (optional, for previews) */
  limit?: number;
}

/**
 * Map CMS room data to RoomCard contract format
 *
 * Transforms a single CMS room into RoomCard props.
 * Includes placeholder price since CMS doesn't have pricing data.
 *
 * @param room - CMS room data
 * @param index - Index for generating unique prices (deterministic)
 * @returns RoomCard component props
 */
function mapRoomToCard(room: CmsRoom, index: number): RoomCardContractType {
  // Generate deterministic price from room data
  // In production, this would come from a pricing API
  const basePrice = 100 + (index * 50) % 400;

  return {
    id: room.id,
    name: room.name,
    type: room.room_type,
    price: basePrice,
    capacity: room.capacity_adults,
    amenities: [], // CMS doesn't have room-level amenities yet
    image: room.featured_image || undefined,
    description: room.description || undefined,
    variant: 'detailed',
    imageHeight: 'default',
  };
}

/**
 * Map CMS data to RoomsGrid component props
 *
 * Transforms raw CMS room data into strictly typed RoomsGrid props.
 * Filters available rooms and optionally limits the count.
 *
 * @param input - Mapper input parameters
 * @returns RoomsGrid component props
 *
 * @example
 * ```ts
 * // Get all rooms
 * const roomsProps = mapCmsToRooms({ hotelData: cmsResponse });
 *
 * // Get preview (first 3 rooms)
 * const previewProps = mapCmsToRooms({
 *   hotelData: cmsResponse,
 *   limit: 3
 * });
 * ```
 */
export function mapCmsToRooms(input: MapCmsToRoomsInput): RoomsGridProps {
  const { hotelData, limit } = input;

  // Get available rooms (filtered by status)
  const availableRooms = getAvailableRooms(hotelData.rooms);

  // Apply limit if specified
  const roomsToMap = limit ? availableRooms.slice(0, limit) : availableRooms;

  // Transform rooms to card format
  const rooms = roomsToMap.map((room, index) => mapRoomToCard(room, index));

  // Build rooms props - ensure rooms is always an array
  const roomsProps: RoomsGridProps = {
    rooms: rooms || [],  // Ensure rooms is never undefined
    variant: 'detailed',
  };

  return roomsProps;
}
