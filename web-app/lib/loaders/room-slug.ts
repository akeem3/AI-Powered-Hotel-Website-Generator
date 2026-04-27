/**
 * Room Slug Generation Utilities
 *
 * Generates URL-safe slugs from room names for use in dynamic routes.
 * Handles deterministic generation and collision detection.
 *
 * @module lib/loaders/room-slug
 */

import { cache } from 'react';
import type { CmsRoom } from '@/lib/cms-api/types';
import { getHotelFull } from '@/lib/cms-api/client';
import { getAvailableRooms } from '@/lib/cms-api/transformers';

/**
 * Room slug with metadata
 *
 * Used for SSG generateStaticParams() and slug lookups.
 */
export interface RoomSlugInfo {
  /** URL-safe slug generated from room name */
  slug: string;
  /** Original room name */
  name: string;
  /** Room UUID */
  id: string;
}

/**
 * Slug collision tracker
 *
 * Tracks how many times each base slug has been seen.
 */
type SlugCounter = Record<string, number>;

/**
 * Generate a URL-safe slug from a room name
 *
 * Converts room names to kebab-case format for use in URLs.
 * Rules:
 * - Convert to lowercase
 * - Replace non-alphanumeric characters with hyphens
 * - Replace multiple consecutive hyphens with single hyphen
 * - Trim leading/trailing hyphens
 * - Deterministic: same input always produces same output
 *
 * Examples:
 * - "Deluxe Ocean Suite" → "deluxe-ocean-suite"
 * - "Master Bedroom (King Bed)" → "master-bedroom-king-bed"
 * - "123 Main St." → "123-main-st"
 * - "  Extra  Spaces  " → "extra-spaces"
 * - "Room#1!@#" → "room-1"
 *
 * @param name - Room name to convert to slug
 * @returns URL-safe kebab-case slug
 *
 * @example
 * ```ts
 * const slug = generateRoomSlug("Deluxe Ocean Suite");
 * // Returns: "deluxe-ocean-suite"
 * ```
 */
export function generateRoomSlug(name: string): string {
  if (!name || name.trim().length === 0) {
    return 'room';
  }

  return name
    .toLowerCase()
    // Replace non-alphanumeric characters (except spaces and hyphens) with hyphen
    .replace(/[^a-z0-9\s-]/g, '-')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Handle edge case of empty result
    || 'room';
}

/**
 * Generate slugs for multiple rooms with collision handling
 *
 * Processes an array of rooms and generates unique slugs for each.
 * If two rooms produce the same slug, appends "-2", "-3", etc.
 * to subsequent occurrences.
 *
 * The first occurrence keeps the base slug. Second occurrence gets "-2",
 * third gets "-3", and so on.
 *
 * Examples:
 * - ["Deluxe Room", "Deluxe Suite"] → ["deluxe-room", "deluxe-suite"]
 * - ["Deluxe Room", "Deluxe Room"] → ["deluxe-room", "deluxe-room-2"]
 * - ["Deluxe Room", "Deluxe Room", "Deluxe Room"] → ["deluxe-room", "deluxe-room-2", "deluxe-room-3"]
 *
 * @param rooms - Array of CMS room objects
 * @returns Map of slug to room object for O(1) lookups
 *
 * @example
 * ```ts
 * const roomSlugs = generateRoomSlugs(cmsData.rooms);
 * // Returns: Map { "deluxe-ocean-suite" => CmsRoom, "garden-view" => CmsRoom, ... }
 *
 * const room = roomSlugs.get("deluxe-ocean-suite");
 * ```
 */
export function generateRoomSlugs(rooms: CmsRoom[]): Map<string, CmsRoom> {
  const slugMap = new Map<string, CmsRoom>();
  const slugCounter: SlugCounter = {};

  for (const room of rooms) {
    const baseSlug = generateRoomSlug(room.name);

    // Check if this slug has been seen before
    if (slugCounter[baseSlug] === undefined) {
      // First occurrence - use base slug
      slugCounter[baseSlug] = 1;
      slugMap.set(baseSlug, room);
    } else {
      // Subsequent occurrence - append counter
      slugCounter[baseSlug]++;
      const disambiguatedSlug = `${baseSlug}-${slugCounter[baseSlug]}`;
      slugMap.set(disambiguatedSlug, room);
    }
  }

  return slugMap;
}

/**
 * Get available room slugs for a hotel
 *
 * Fetches all available rooms for a hotel and generates their slugs.
 * Returns an array of slug info objects suitable for SSG generateStaticParams().
 *
 * This function is wrapped in React cache() for request deduplication.
 * Multiple calls in the same render cycle will only fetch once.
 *
 * Uses the existing getAvailableRooms() transformer which filters rooms
 * by status='available' and sorts by sort_order.
 *
 * @param hotelId - Hotel UUID
 * @returns Array of room slug info objects
 * @throws {CmsApiError} If hotel cannot be fetched
 *
 * @example
 * ```ts
 * // In generateStaticParams()
 * const roomSlugs = await getAvailableRoomSlugs(hotelId);
 * // Returns: [
 * //   { slug: "deluxe-ocean-suite", name: "Deluxe Ocean Suite", id: "123" },
 * //   { slug: "garden-view-room", name: "Garden View Room", id: "456" },
 * //   ...
 * // ]
 *
 * export const params = roomSlugs.map(({ slug }) => ({ roomSlug: slug }));
 * ```
 */
export const getAvailableRoomSlugs = cache(async (
  hotelId: string
): Promise<RoomSlugInfo[]> => {
  // Fetch full hotel data from CMS API
  const hotelData = await getHotelFull(hotelId);

  // Filter to available rooms only (using existing transformer)
  const availableRooms = getAvailableRooms(hotelData.rooms);

  // Generate slugs with collision handling
  const slugToRoomMap = generateRoomSlugs(availableRooms);

  // Convert map to array of slug info objects
  const roomSlugs: RoomSlugInfo[] = Array.from(slugToRoomMap.entries()).map(
    ([slug, room]) => ({
      slug,
      name: room.name,
      id: room.id,
    })
  );

  return roomSlugs;
});

/**
 * Find a room by slug from an array of rooms
 *
 * Utility function to lookup a room by its generated slug.
 * Useful for room detail pages where you need to find the matching room.
 *
 * @param rooms - Array of CMS room objects
 * @param slug - Slug to search for
 * @returns Matching room object or undefined if not found
 *
 * @example
 * ```ts
 * const room = findRoomBySlug(rooms, "deluxe-ocean-suite");
 * if (room) {
 *   console.log(room.name); // "Deluxe Ocean Suite"
 * }
 * ```
 */
export function findRoomBySlug(rooms: CmsRoom[], slug: string): CmsRoom | undefined {
  const slugMap = generateRoomSlugs(rooms);
  return slugMap.get(slug);
}

/**
 * Generate all possible slug variations for a room name
 *
 * Utility function for testing and debugging.
 * Shows what slug would be generated for a given name.
 *
 * @param name - Room name to test
 * @returns Generated slug
 *
 * @example
 * ```ts
 * // For testing collision handling
 * const slug1 = generateRoomSlug("Deluxe Room");
 * const slug2 = generateRoomSlug("Deluxe Room");
 * console.log(slug1); // "deluxe-room"
 * console.log(slug2); // "deluxe-room" (same - need collision handling)
 * ```
 */
export function testSlugGeneration(name: string): string {
  return generateRoomSlug(name);
}

/**
 * Validate a slug format
 *
 * Checks if a slug matches the expected format (lowercase alphanumeric
 * and hyphens only, no leading/trailing hyphens).
 *
 * @param slug - Slug to validate
 * @returns true if slug is valid format
 *
 * @example
 * ```ts
 * validateSlugFormat("deluxe-ocean-suite"); // true
 * validateSlugFormat("Deluxe-Ocean-Suite"); // false (uppercase)
 * validateSlugFormat("-deluxe-suite");      // false (leading hyphen)
 * validateSlugFormat("deluxe_suite");       // false (underscore)
 * ```
 */
export function validateSlugFormat(slug: string): boolean {
  // Valid slug: lowercase letters, numbers, hyphens, no leading/trailing hyphens
  const validSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return validSlugRegex.test(slug);
}
