/**
 * Multi-Page Content Multiplication
 *
 * @module lib/generation/multiply-content
 *
 * Story 25.3: multiplyContent() Deterministic Cloner
 *
 * Provides $0-cost post-processing expansion of LLM-generated content templates
 * into realistic volumes per hotel type. Uses seeded deterministic algorithms
 * to ensure reproducibility while maintaining variety.
 *
 * ## Architecture
 *
 * - Pure function design: same inputs always produce same output
 * - No LLM calls: deterministic expansion of existing data
 * - Seed-based: uses generationId as seed for reproducibility
 * - Template preservation: never discards LLM-generated items
 *
 * ## Determinism Algorithm
 *
 * Story 25.3 uses a hash-based selection algorithm:
 * 1. Hash the seed string to a numeric value using Mulberry32 PRNG
 * 2. Use PRNG output modulo array length to select fragments
 * 3. Deterministic: same seed → same PRNG sequence → same selections
 *
 * This ensures reproducibility while maintaining variety across runs.
 *
 * ## Volume Ranges Per Hotel Type
 *
 * - **luxury**: 8-15 rooms, 10-18 amenities, 15-30 gallery, 8-15 testimonials, 6-10 FAQ
 * - **boutique**: 6-12 rooms, 8-15 amenities, 12-25 gallery, 6-12 testimonials, 6-10 FAQ
 * - **resort**: 10-20 rooms, 12-20 amenities, 25-50 gallery, 10-18 testimonials, 6-10 FAQ
 * - **business**: 5-10 rooms, 8-15 amenities, 10-20 gallery, 5-10 testimonials, 6-10 FAQ
 * - **budget**: 3-8 rooms, 5-10 amenities, 8-15 gallery, 3-8 testimonials, 5-8 FAQ
 *
 * ## Usage Pattern
 *
 * ```ts
 * import { multiplyContent } from '@/lib/generation/multiply-content';
 * import type { WebsiteConfig } from '@/lib/generation/split-to-pages';
 *
 * const websiteConfig: WebsiteConfig = splitToPages(homepageConfig);
 * const expanded = multiplyContent(
 *   websiteConfig,
 *   'luxury',  // hotel type
 *   'pemberton-grand-v1'  // seed (usually generationId)
 * );
 *
 * // Now has 8-15 rooms instead of 3 LLM-generated templates
 * expanded.pages.rooms.component.props.rooms.length; // 12 (example)
 * ```
 */

import type { WebsiteConfig, PageType, Component, RoomDetailPageConfig } from '@/lib/generation/split-to-pages';
import type { RoomData } from '@/lib/generation/split-to-pages';
import { slugify } from '@/lib/generation/split-to-pages';
import { WebsiteConfigSchema } from '@/lib/generation/split-to-pages';
import type {
  HotelType,
  RoomNameFragment,
  PriceRange,
  CapacityPattern,
  AmenityEntry,
  GuestName,
  QuoteTemplate,
  GalleryPlaceholder,
  FAQTemplate
} from '@/lib/generation/seed-bank';
import {
  PRICE_RANGES,
  CAPACITY_PATTERNS,
  ROOM_NAME_FRAGMENTS,
  AMENITY_ENTRIES,
  GUEST_NAMES,
  QUOTE_TEMPLATES,
  GALLERY_PLACEHOLDERS,
  FAQ_TEMPLATES
} from '@/lib/generation/seed-bank';

// Re-export slugify from split-to-pages for room slug generation
// We'll import it inline to avoid circular dependencies

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Volume range for a content type
 *
 * Represents minimum and maximum counts for content multiplication.
 * Used by multiplyContent to determine how many items to generate.
 *
 * @example
 * ```ts
 * const roomVolume: VolumeRange = { min: 8, max: 15 };
 * // Target volume: between 8 and 15 rooms
 * ```
 */
export interface VolumeRange {
  /** Minimum count for this content type */
  min: number;
  /** Maximum count for this content type */
  max: number;
}

/**
 * Volume configuration per hotel type
 *
 * Maps hotel types to their target content volumes.
 * Each hotel type has different volume ranges reflecting real-world inventory.
 *
 * ## Volume Rationale
 *
 * **Luxury**: Intimate, exclusive (8-15 rooms) - premium experience
 * **Boutique**: Small, curated (6-12 rooms) - unique properties
 * **Resort**: Family-friendly (10-20 rooms) - vacation destinations
 * **Business**: Efficient (5-10 rooms) - business traveler focus
 * **Budget**: Value-oriented (3-8 rooms) - smaller properties
 *
 * Gallery volumes vary by hotel type (resorts have extensive photo galleries).
 * Testimonials reflect review volume per category.
 *
 * @example
 * ```ts
 * const VOLUME_CONFIG: VolumeConfig = {
 *   luxury: {
 *     rooms: { min: 8, max: 15 },
 *     amenities: { min: 10, max: 18 },
 *     gallery: { min: 15, max: 30 },
 *     testimonials: { min: 8, max: 15 },
 *     faq: { min: 6, max: 10 }
 *   },
 *   // ... other hotel types
 * };
 * ```
 */
export interface VolumeConfig {
  /** Room count range */
  rooms: VolumeRange;
  /** Amenity count range */
  amenities: VolumeRange;
  /** Gallery image count range */
  gallery: VolumeRange;
  /** Testimonial count range */
  testimonials: VolumeRange;
  /** FAQ count range */
  faq: VolumeRange;
}

/**
 * Volume configuration mapping
 *
 * Authoritative volume ranges per hotel type.
 * These ranges define the target content volumes for multiplyContent().
 *
 * ## Source Authority
 *
 * Story 25.3 AC specifies:
 * - AC1: luxury hotels have 8-15 rooms
 * - AC6: resort galleries have 25-50 images
 * - AC7: budget testimonials have 3-8 reviews
 *
 * Other ranges are derived following these patterns.
 */
export const VOLUME_CONFIGS: Record<HotelType, VolumeConfig> = {
  luxury: {
    rooms: { min: 8, max: 15 },
    amenities: { min: 10, max: 18 },
    gallery: { min: 15, max: 30 },
    testimonials: { min: 8, max: 15 },
    faq: { min: 6, max: 10 }
  },
  boutique: {
    rooms: { min: 6, max: 12 },
    amenities: { min: 8, max: 15 },
    gallery: { min: 12, max: 25 },
    testimonials: { min: 6, max: 12 },
    faq: { min: 6, max: 10 }
  },
  resort: {
    rooms: { min: 10, max: 20 },
    amenities: { min: 12, max: 20 },
    gallery: { min: 25, max: 50 },
    testimonials: { min: 10, max: 18 },
    faq: { min: 6, max: 10 }
  },
  business: {
    rooms: { min: 5, max: 10 },
    amenities: { min: 8, max: 15 },
    gallery: { min: 10, max: 20 },
    testimonials: { min: 5, max: 10 },
    faq: { min: 6, max: 10 }
  },
  budget: {
    rooms: { min: 3, max: 8 },
    amenities: { min: 5, max: 10 },
    gallery: { min: 8, max: 15 },
    testimonials: { min: 3, max: 8 },
    faq: { min: 5, max: 8 }
  }
};

/**
 * Seeded pseudorandom number generator function type
 *
 * A deterministic PRNG that produces a sequence of random-looking numbers
 * based on an initial seed value. Same seed always produces same sequence.
 *
 * ## PRNG Algorithm Choice
 *
 * Story 25.3 uses **Mulberry32** - a simple, fast 32-bit PRNG:
 * - Adequate for non-cryptographic use
 * - Simple implementation (single function)
 * - Fast execution (bitwise operations)
 * - Widely used in game dev for procedural generation
 *
 * ## Usage Pattern
 *
 * ```ts
 * // Create PRNG from string seed
 * const rng = createSeededPRNG('my-generation-id');
 *
 * // Generate sequence of random numbers [0, 1)
 * const r1 = rng(); // 0.7235...
 * const r2 = rng(); // 0.1824...
 * const r3 = rng(); // 0.9156...
 *
 * // Same seed produces same sequence
 * const rng2 = createSeededPRNG('my-generation-id');
 * rng2(); // 0.7235... (same as r1)
 * ```
 */
export type SeededPRNG = () => number;

/**
 * Multiply content options
 *
 * Configuration options for the multiplyContent() function.
 * Simplifies parameter passing and enables future extensibility.
 *
 * @example
 * ```ts
 * const options: MultiplyContentOptions = {
 *   volumeConfig: VOLUME_CONFIGS['luxury'],
 *   seed: 'pemberton-grand-v1',
 *   hotelType: 'luxury',
 *   hotelName: 'The Pemberton Grand'
 * };
 *
 * const expanded = multiplyContent(config, options);
 * ```
 */
export interface MultiplyContentOptions {
  /** Volume configuration for target content ranges */
  volumeConfig: VolumeConfig;
  /** Seed string for deterministic output (usually generationId) */
  seed: string;
  /** Hotel type for fragment filtering */
  hotelType: HotelType;
  /** Hotel name for placeholder substitution */
  hotelName: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Create a seeded pseudorandom number generator
 *
 * Implements the **Mulberry32** algorithm - a fast, simple 32-bit PRNG.
 * Takes a string seed and returns a function that generates deterministic
 * random numbers in the range [0, 1).
 *
 * ## Algorithm
 *
 * Mulberry32 uses a 32-bit state and bitwise operations to generate
 * random-looking numbers. It's not cryptographically secure but is
 * perfectly adequate for procedural generation and testing.
 *
 * ## Determinism
 *
 * Same seed string always produces same number sequence:
 * ```ts
 * const rng1 = createSeededPRNG('seed');
 * const rng2 = createSeededPRNG('seed');
 * rng1(); // Always returns same value
 * rng2(); // Always returns same value as rng1()
 * ```
 *
 * @param seed - String seed for PRNG initialization
 * @returns PRNG function that returns numbers in [0, 1)
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('hotel-123-v1');
 * console.log(rng()); // 0.5234...
 * console.log(rng()); // 0.7812...
 * console.log(rng()); // 0.3456...
 * ```
 */
export function createSeededPRNG(seed: string): SeededPRNG {
  // Hash the seed string to a 32-bit integer using simple string hashing
  // This ensures different strings produce different PRNG sequences
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash | 0; // Convert to 32-bit integer
  }

  // Use absolute value to ensure positive state
  let state = Math.abs(hash);

  // Return Mulberry32 PRNG function with closure over mutable state
  // State is updated on each call to produce different values
  return (() => {
    state = state + 0x6D2B79F5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as SeededPRNG;
}

/**
 * Generate a random number within a range using seeded PRNG
 *
 * Returns a deterministic random number between min and max (inclusive).
 * Uses the provided PRNG to ensure reproducibility.
 *
 * @param rng - Seeded PRNG function
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random number between min and max
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const price = getRandomInRange(rng, 200, 500); // 347 (example)
 * ```
 */
export function getRandomInRange(rng: SeededPRNG, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * Select a random item from an array using seeded PRNG
 *
 * Returns a deterministic random selection from the array.
 * Uses the PRNG to ensure same seed produces same selection.
 *
 * @param rng - Seeded PRNG function
 * @param array - Array to select from
 * @returns Random item from the array
 * @throws Error if array is empty
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const name = getRandomItem(rng, GUEST_NAMES); // 'Sarah Mitchell'
 * ```
 */
export function getRandomItem<T>(rng: SeededPRNG, array: T[]): T {
  if (array.length === 0) {
    throw new Error('Cannot select from empty array');
  }
  const index = Math.floor(rng() * array.length);
  return array[index];
}

/**
 * Generate multiple random items from an array without duplicates
 *
 * Returns an array of unique random selections from the source array.
 * Useful for generating varied content while avoiding repetition.
 *
 * @param rng - Seeded PRNG function
 * @param array - Array to select from
 * @param count - Number of items to select
 * @returns Array of unique random items
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const amenities = getRandomItems(rng, AMENITY_ENTRIES, 5); // 5 unique amenities
 * ```
 */
export function getRandomItems<T>(rng: SeededPRNG, array: T[], count: number): T[] {
  const maxCount = Math.min(count, array.length);
  const selected: T[] = [];
  const available = [...array]; // Shallow copy

  for (let i = 0; i < maxCount; i++) {
    const index = Math.floor(rng() * available.length);
    selected.push(available[index]!);
    available.splice(index, 1); // Remove to prevent duplicates
  }

  return selected;
}

/**
 * Generate a room name using seed bank fragments
 *
 * Combines an adjective fragment with a noun fragment to create
 * a realistic room name for the given hotel type.
 *
 * ## Algorithm
 *
 * 1. Filter adjective fragments by hotel type
 * 2. Filter noun fragments (all types include room types)
 * 3. Select one adjective and one noun using seeded PRNG
 * 4. Combine as "{Adjective} {Noun}" (e.g., "Presidential Suite")
 *
 * ## Determinism
 *
 * Same PRNG state produces same fragment selections:
 * ```ts
 * const rng1 = createSeededPRNG('seed');
 * const rng2 = createSeededPRNG('seed');
 * generateRoomName(rng1, 'luxury'); // "Royal Suite"
 * generateRoomName(rng2, 'luxury'); // "Royal Suite" (same)
 * ```
 *
 * @param rng - Seeded PRNG function
 * @param hotelType - Hotel type for fragment filtering
 * @returns Generated room name
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const name = generateRoomName(rng, 'luxury'); // "Grand Suite"
 * ```
 */
export function generateRoomName(rng: SeededPRNG, hotelType: HotelType): string {
  // Filter adjective fragments by hotel type
  const adjectives = ROOM_NAME_FRAGMENTS.filter(
    fragment => fragment.type === 'adjective' && fragment.hotelTypes.includes(hotelType)
  );

  // Filter noun fragments (room types apply to all hotel types)
  const nouns = ROOM_NAME_FRAGMENTS.filter(
    fragment => fragment.type === 'noun'
  );

  // Select one adjective and one noun using seeded PRNG
  const adjective = getRandomItem(rng, adjectives);
  const noun = getRandomItem(rng, nouns);

  // Combine fragments: "{Adjective} {Noun}"
  return `${adjective.text} ${noun.text}`;
}

/**
 * Generate a unique room slug with collision detection
 *
 * Creates a URL-safe slug from a room name and ensures uniqueness
 * by appending numeric suffixes when collisions occur.
 *
 * ## Algorithm
 *
 * 1. Generate base slug using slugify() from split-to-pages
 * 2. Check if slug exists in existingSlugs Set
 * 3. If no collision, return base slug
 * 4. If collision, increment suffix counter and try again
 * 5. Return first unique slug found
 *
 * ## Determinism
 *
 * Collision detection is deterministic because suffix assignment
 * follows a predictable pattern (-2, -3, -4, etc.) based on
 * the order of calls with the same existingSlugs state.
 *
 * @param roomName - The room name to slugify
 * @param existingSlugs - Set of already-used slugs
 * @returns Unique slug (kebab-case, URL-safe)
 *
 * @example
 * ```ts
 * const existing = new Set(['deluxe-suite', 'ocean-view']);
 * generateRoomSlug('Deluxe Suite', existing); // 'deluxe-suite'
 * generateRoomSlug('Deluxe Suite', existing); // 'deluxe-suite-2'
 * ```
 */
export function generateRoomSlug(roomName: string, existingSlugs: Set<string>): string {
  // Generate base slug using imported slugify function
  const baseSlug = slugify(roomName);

  // If no collision, return base slug
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  // Collision detected - append numeric suffix
  let suffix = 2;
  let uniqueSlug: string;

  do {
    uniqueSlug = `${baseSlug}-${suffix}`;
    suffix++;
  } while (existingSlugs.has(uniqueSlug));

  return uniqueSlug;
}

/**
 * Multiply rooms to target volume
 *
 * Expands LLM-generated room templates to the target volume for the
 * hotel type. Never discards LLM-generated rooms; only adds new ones.
 *
 * ## Algorithm
 *
 * 1. Extract existing rooms from the rooms component
 * 2. Determine target count (random within volume range)
 * 3. If existing count >= target, return unchanged
 * 4. Otherwise, generate additional rooms:
 *    - Use generateRoomName() for realistic names
 *    - Use PRICE_RANGES for hotel-type pricing
 *    - Use CAPACITY_PATTERNS for guest capacity
 *    - Use generateRoomSlug() for unique URLs
 * 5. Return combined array (existing + generated)
 *
 * ## Template Preservation
 *
 * Per Story 25.3 AC1, LLM-generated rooms are never discarded.
 * The function preserves the first room template and derives variants.
 *
 * ## Determinism
 *
 * Same seed produces same rooms:
 * - Same target count (within range)
 * - Same room names (fragment selection)
 * - Same prices (within range)
 * - Same capacities (pattern selection)
 * - Same slugs (collision order)
 *
 * @param config - The WebsiteConfig to modify
 * @param volumeConfig - Volume configuration with room min/max range
 * @param rng - Seeded PRNG for deterministic generation
 * @param hotelType - Hotel type for fragment and pricing data
 * @returns Updated WebsiteConfig with multiplied rooms
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const expanded = multiplyRooms(config, VOLUME_CONFIGS['luxury'], rng, 'luxury');
 * // Now has 8-15 rooms instead of 3
 * ```
 */
export function multiplyRooms(
  config: WebsiteConfig,
  volumeConfig: VolumeConfig,
  rng: SeededPRNG,
  hotelType: HotelType
): WebsiteConfig {
  // Find the rooms component in the rooms page
  const roomsPage = config.pages.rooms;
  const roomsComponent = roomsPage.components.find(c => c.type === 'rooms');

  // If no rooms component, return unchanged (graceful handling)
  if (!roomsComponent || !roomsComponent.props.rooms) {
    return config;
  }

  const existingRooms = roomsComponent.props.rooms as RoomData[];
  const existingCount = existingRooms.length;

  // Determine target count (random within volume range)
  const targetCount = getRandomInRange(rng, volumeConfig.rooms.min, volumeConfig.rooms.max);

  // If already at or above target, return unchanged
  if (existingCount >= targetCount) {
    return config;
  }

  // Track existing slugs for collision detection
  const existingSlugs = new Set<string>();
  for (const room of existingRooms) {
    const slug = slugify(room.name);
    existingSlugs.add(slug);
  }

  // Generate additional rooms
  const additionalRooms: RoomData[] = [];
  const roomsToAdd = targetCount - existingCount;

  for (let i = 0; i < roomsToAdd; i++) {
    // Use the first room as a template for structure
    // Default room template for when existingRooms is empty
    const defaultRoomTemplate: RoomData = {
      id: 'room-default',
      name: 'Standard Room',
      type: 'Standard',
      price: PRICE_RANGES[hotelType].min,
      capacity: 2,
      amenities: [],
      image: '',
      description: ''
    };
    
    const templateRoom = existingRooms[0] || defaultRoomTemplate;

    // Generate room name using seed bank fragments
    const roomName = generateRoomName(rng, hotelType);

    // Generate unique slug with collision detection
    const roomSlug = generateRoomSlug(roomName, existingSlugs);
    existingSlugs.add(roomSlug);

    // Generate price within hotel type range
    const priceRange = PRICE_RANGES[hotelType];
    const price = getRandomInRange(rng, priceRange.min, priceRange.max);

    // Generate capacity from hotel type patterns
    const capacityPatterns = CAPACITY_PATTERNS[hotelType];
    const capacityPattern = getRandomItem(rng, capacityPatterns);
    const capacity = getRandomInRange(rng, capacityPattern[0], capacityPattern[1]);

    // Generate room ID (use slug as ID for consistency)
    const roomId = `room-${roomSlug}`;

    // Create new room object
    const newRoom: RoomData = {
      id: roomId,
      name: roomName,
      type: templateRoom.type || 'Standard', // Default to 'Standard' if not specified
      price,
      capacity,
      amenities: templateRoom.amenities || [], // Inherit amenities from template
      image: templateRoom.image, // Inherit image (placeholder)
      description: templateRoom.description // Inherit description pattern
    };

    additionalRooms.push(newRoom);
  }

  // Create new config with updated rooms (immutable pattern)
  const updatedRoomsComponent = {
    ...roomsComponent,
    props: {
      ...roomsComponent.props,
      rooms: [...existingRooms, ...additionalRooms]
    }
  };

  const updatedRoomsPage = {
    ...roomsPage,
    components: roomsPage.components.map(c =>
      c.type === 'rooms' ? updatedRoomsComponent : c
    )
  };


  // AC1: Create roomDetail page entries for ALL rooms (existing and new)
  // Follow the pattern from split-to-pages.ts for consistency
  const existingRoomDetailPages = config.pages.roomDetail;
  const newRoomDetailPages: Record<string, RoomDetailPageConfig> = { ...existingRoomDetailPages };
  
  // Get navigation and footer components for room detail pages
  const navigationComponents = updatedRoomsPage.components.filter(c => c.type === 'navigation');
  const footerComponents = updatedRoomsPage.components.filter(c => c.type === 'footer');
  
  // Create roomDetail pages for ALL rooms (both existing and new)
  const allRooms = [...existingRooms, ...additionalRooms];
  for (const room of allRooms) {
    const roomSlug = room.id.replace('room-', '');
  
    // Skip if already exists (idempotent)
    if (newRoomDetailPages[roomSlug]) {
      continue;
    }
  
    // Create room detail page components (same pattern as split-to-pages)
    const roomDetailComponents: Component[] = [
      ...navigationComponents,
      updatedRoomsComponent, // Full rooms component - renderer filters by slug
      ...footerComponents,
    ];
  
    roomDetailComponents.sort((a, b) => a.order - b.order);
  
    // Create the room detail page entry
    newRoomDetailPages[roomSlug] = {
      components: roomDetailComponents,
      room,
    };
  }

  return {
    ...config,
    pages: {
      ...config.pages,
      rooms: updatedRoomsPage,
      roomDetail: newRoomDetailPages  // AC1: Update roomDetail pages with new entries
    }
  };
}

/**
 * Multiply gallery images to target volume
 *
 * Expands LLM-generated gallery images to the target volume for the
 * hotel type. Uses CDN path templates from the seed bank.
 *
 * ## Algorithm
 *
 * 1. Extract existing images from the gallery component
 * 2. Determine target count (random within volume range)
 * 3. If existing count >= target, return unchanged
 * 4. Otherwise, generate additional images:
 *    - Select from GALLERY_PLACEHOLDERS
 *    - Fill template placeholders deterministically
 *    - Generate unique IDs for each image
 * 5. Return combined array (existing + generated)
 *
 * ## Placeholder Substitution
 *
 * Gallery placeholders use template variables:
 * - `{sanitizedName}`: Hotel name sanitized for URLs
 * - `{index}`: Sequential image index (1-based)
 * - `{hotelName}`: Full hotel name
 * - `{viewType}`: Type of view (ocean view, lobby, etc.)
 * - `{areaType}`: Hotel area (pool, garden, etc.)
 *
 * ## Determinism
 *
 * Same seed produces same gallery:
 * - Same target count (within range)
 * - Same placeholder selection order
 * - Same template substitutions
 *
 * @param config - The WebsiteConfig to modify
 * @param volumeConfig - Volume configuration with gallery min/max range
 * @param rng - Seeded PRNG for deterministic generation
 * @param hotelName - Hotel name for template substitution
 * @param sanitizedName - Sanitized hotel name for URLs
 * @returns Updated WebsiteConfig with multiplied gallery
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const expanded = multiplyGallery(
 *   config,
 *   VOLUME_CONFIGS['resort'],
 *   rng,
 *   'The Grand Resort',
 *   'the-grand-resort'
 * );
 * // Now has 25-50 gallery images instead of 6
 * ```
 */
export function multiplyGallery(
  config: WebsiteConfig,
  volumeConfig: VolumeConfig,
  rng: SeededPRNG,
  hotelName: string,
  sanitizedName: string
): WebsiteConfig {
  // Find the gallery component in the gallery page
  const galleryPage = config.pages.gallery;
  const galleryComponent = galleryPage.components.find(c => c.type === 'gallery');

  // If no gallery component, return unchanged (graceful handling)
  if (!galleryComponent || !galleryComponent.props.images) {
    return config;
  }

  const existingImages = galleryComponent.props.images as Array<{
    id: string;
    src: string;
    alt: string;
    caption?: string;
  }>;
  const existingCount = existingImages.length;

  // Determine target count (random within volume range)
  const targetCount = getRandomInRange(rng, volumeConfig.gallery.min, volumeConfig.gallery.max);

  // If already at or above target, return unchanged
  if (existingCount >= targetCount) {
    return config;
  }

  // Generate additional images using placeholders
  const additionalImages: Array<{
    id: string;
    src: string;
    alt: string;
    caption?: string;
  }> = [];
  const imagesToAdd = targetCount - existingCount;

  // Get next image index (1-based, continuing from existing)
  let nextIndex = existingCount + 1;

  for (let i = 0; i < imagesToAdd; i++) {
    // Select a placeholder deterministically
    const placeholder = getRandomItem(rng, GALLERY_PLACEHOLDERS);

    // Fill template placeholders
    const src = placeholder.srcTemplate
      .replace('{sanitizedName}', sanitizedName)
      .replace('{index}', nextIndex.toString());

    const alt = placeholder.altTemplate
      .replace('{hotelName}', hotelName)
      .replace('{index}', nextIndex.toString());

    const caption = placeholder.captionTemplate
      ?.replace('{hotelName}', hotelName)
      .replace('{index}', nextIndex.toString());

    // Generate unique ID
    const imageId = `gallery-${nextIndex}`;

    additionalImages.push({
      id: imageId,
      src,
      alt,
      caption
    });

    nextIndex++;
  }

  // Create new config with updated gallery (immutable pattern)
  const updatedGalleryComponent = {
    ...galleryComponent,
    props: {
      ...galleryComponent.props,
      images: [...existingImages, ...additionalImages]
    }
  };

  const updatedGalleryPage = {
    ...galleryPage,
    components: galleryPage.components.map(c =>
      c.type === 'gallery' ? updatedGalleryComponent : c
    )
  };

  return {
    ...config,
    pages: {
      ...config.pages,
      gallery: updatedGalleryPage
    }
  };
}

/**
 * Multiply testimonials to target volume
 *
 * Expands LLM-generated testimonials to the target volume for the
 * hotel type. Uses guest names and quote templates from the seed bank.
 *
 * ## Algorithm
 *
 * 1. Extract existing testimonials from the reviews page (testimonials component)
 * 2. Determine target count (random within volume range)
 * 3. If existing count >= target, return unchanged
 * 4. Otherwise, generate additional testimonials:
 *    - Select name from GUEST_NAMES
 *    - Select quote from QUOTE_TEMPLATES
 *    - Fill template placeholders ({hotel}, {feature}, {viewType})
 *    - Generate 4-5 star ratings (weighted toward 5)
 * 5. Return combined array (existing + generated)
 *
 * ## Placeholder Substitution
 *
 * Quote templates may use placeholders:
 * - `{hotel}`: Hotel name
 * - `{feature}`: Hotel feature or amenity
 * - `{viewType}`: Type of view (ocean, garden, city, etc.)
 *
 * ## Determinism
 *
 * Same seed produces same testimonials:
 * - Same target count (within range)
 * - Same name/quote selection order
 * - Same placeholder substitutions
 * - Same rating distribution
 *
 * @param config - The WebsiteConfig to modify
 * @param volumeConfig - Volume configuration with testimonials min/max range
 * @param rng - Seeded PRNG for deterministic generation
 * @param hotelName - Hotel name for template substitution
 * @returns Updated WebsiteConfig with multiplied testimonials
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const expanded = multiplyTestimonials(
 *   config,
 *   VOLUME_CONFIGS['luxury'],
 *   rng,
 *   'The Pemberton Grand'
 * );
 * // Now has 8-15 testimonials instead of 3
 * ```
 */
export function multiplyTestimonials(
  config: WebsiteConfig,
  volumeConfig: VolumeConfig,
  rng: SeededPRNG,
  hotelName: string
): WebsiteConfig {
  // Find the testimonials component in the reviews page
  const reviewsPage = config.pages.reviews;
  const testimonialsComponent = reviewsPage.components.find(c => c.type === 'testimonials');

  // If no testimonials component, return unchanged (graceful handling)
  if (!testimonialsComponent || !testimonialsComponent.props.testimonials) {
    return config;
  }

  const existingTestimonials = testimonialsComponent.props.testimonials as Array<{
    id: string;
    customerName: string;
    customerTitle?: string;
    rating: number;
    quote: string;
    date?: string;
    location?: string;
  }>;
  const existingCount = existingTestimonials.length;

  // Determine target count (random within volume range)
  const targetCount = getRandomInRange(rng, volumeConfig.testimonials.min, volumeConfig.testimonials.max);

  // If already at or above target, return unchanged
  if (existingCount >= targetCount) {
    return config;
  }

  // Feature/view types for template substitution
  const viewTypes = ['ocean view', 'garden view', 'city skyline', 'pool view', 'mountain view'];
  const features = ['swimming pool', 'spa', 'restaurant', 'concierge service', 'rooms', 'location'];

  // Generate additional testimonials
  const additionalTestimonials: Array<{
    id: string;
    customerName: string;
    customerTitle?: string;
    rating: number;
    quote: string;
    date?: string;
    location?: string;
  }> = [];
  const testimonialsToAdd = targetCount - existingCount;

  for (let i = 0; i < testimonialsToAdd; i++) {
    // Select guest name and quote template deterministically
    const guestName = getRandomItem(rng, GUEST_NAMES);
    const quoteTemplate = getRandomItem(rng, QUOTE_TEMPLATES);

    // Fill template placeholders
    const viewType = getRandomItem(rng, viewTypes);
    const feature = getRandomItem(rng, features);

    let quote = quoteTemplate
      .replace('{hotel}', hotelName)
      .replace('{viewType}', viewType)
      .replace('{feature}', feature);

    // Generate rating (weighted toward 5 stars)
    // 70% chance of 5 stars, 30% chance of 4 stars
    const rating = rng() > 0.3 ? 5 : 4;

    // Generate unique ID
    const testimonialId = `testimonial-${existingCount + i + 1}`;

    additionalTestimonials.push({
      id: testimonialId,
      customerName: guestName,
      rating,
      quote
    });
  }

  // Create new config with updated testimonials (immutable pattern)
  const updatedTestimonialsComponent = {
    ...testimonialsComponent,
    props: {
      ...testimonialsComponent.props,
      testimonials: [...existingTestimonials, ...additionalTestimonials]
    }
  };

  const updatedReviewsPage = {
    ...reviewsPage,
    components: reviewsPage.components.map(c =>
      c.type === 'testimonials' ? updatedTestimonialsComponent : c
    )
  };

  return {
    ...config,
    pages: {
      ...config.pages,
      reviews: updatedReviewsPage
    }
  };
}

/**
 * Multiply amenities to target volume
 *
 * Expands LLM-generated amenities to the target volume for the
 * hotel type. Uses amenity entries from the seed bank.
 *
 * ## Algorithm
 *
 * 1. Extract existing amenities from the amenities page
 * 2. Determine target count (random within volume range)
 * 3. If existing count >= target, return unchanged
 * 4. Otherwise, generate additional amenities:
 *    - Select from AMENITY_ENTRIES not already in existing
 *    - Prioritize by category balance
 *    - Generate unique IDs for each amenity
 * 5. Return combined array (existing + generated)
 *
 * ## Category Balance
 *
 * Amenity categories: room, hotel, location, services
 * The function attempts to maintain balance across categories
 * to provide a diverse amenity set.
 *
 * ## Determinism
 *
 * Same seed produces same amenities:
 * - Same target count (within range)
 * - Same amenity selection order
 * - Same category distribution
 *
 * @param config - The WebsiteConfig to modify
 * @param volumeConfig - Volume configuration with amenities min/max range
 * @param rng - Seeded PRNG for deterministic generation
 * @returns Updated WebsiteConfig with multiplied amenities
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const expanded = multiplyAmenities(
 *   config,
 *   VOLUME_CONFIGS['luxury'],
 *   rng
 * );
 * // Now has 10-18 amenities instead of 8
 * ```
 */
export function multiplyAmenities(
  config: WebsiteConfig,
  volumeConfig: VolumeConfig,
  rng: SeededPRNG
): WebsiteConfig {
  // Find the amenities component in the amenities page
  const amenitiesPage = config.pages.amenities;
  const amenitiesComponent = amenitiesPage.components.find(c => c.type === 'amenities');

  // If no amenities component, return unchanged (graceful handling)
  if (!amenitiesComponent || amenitiesComponent.props.amenities === undefined) {
    return config;
  }

  const existingAmenities = amenitiesComponent.props.amenities as Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    category?: string;
  }>;
  const existingCount = existingAmenities.length;

  // Determine target count (random within volume range)
  const targetCount = getRandomInRange(rng, volumeConfig.amenities.min, volumeConfig.amenities.max);

  // If already at or above target, return unchanged
  if (existingCount >= targetCount) {
    return config;
  }

  // Track existing amenity names to avoid duplicates
  const existingNames = new Set<string>();
  for (const amenity of existingAmenities) {
    existingNames.add(amenity.name);
  }

  // Filter seed bank to exclude existing amenities
  const availableAmenities = AMENITY_ENTRIES.filter(
    entry => !existingNames.has(entry.name)
  );

  // Generate additional amenities
  const additionalAmenities: Array<{
    id: string;
    name: string;
    description?: string;
    icon?: string;
    category?: string;
  }> = [];
  const amenitiesToAdd = targetCount - existingCount;

  for (let i = 0; i < amenitiesToAdd; i++) {
    // If we run out of available amenities, stop
    if (availableAmenities.length === 0) {
      break;
    }

    // Select amenity deterministically
    const amenityEntry = getRandomItem(rng, availableAmenities);

    // Remove from available to prevent duplicates
    const index = availableAmenities.indexOf(amenityEntry);
    if (index > -1) {
      availableAmenities.splice(index, 1);
    }

    // Generate unique ID
    const amenityId = `amenity-${existingCount + i + 1}`;

    additionalAmenities.push({
      id: amenityId,
      name: amenityEntry.name,
      category: amenityEntry.category,
      icon: amenityEntry.icon
    });
  }

  // Create new config with updated amenities (immutable pattern)
  const updatedAmenitiesComponent = {
    ...amenitiesComponent,
    props: {
      ...amenitiesComponent.props,
      amenities: [...existingAmenities, ...additionalAmenities]
    }
  };

  const updatedAmenitiesPage = {
    ...amenitiesPage,
    components: amenitiesPage.components.map(c =>
      c.type === 'amenities' ? updatedAmenitiesComponent : c
    )
  };

  return {
    ...config,
    pages: {
      ...config.pages,
      amenities: updatedAmenitiesPage
    }
  };
}

/**
 * Multiply FAQ to target volume
 *
 * Expands LLM-generated FAQ entries to the target volume for the
 * hotel type. Uses FAQ templates from the seed bank filtered by hotel type.
 *
 * ## Algorithm
 *
 * 1. Extract existing FAQs from the FAQ page
 * 2. Filter FAQ_TEMPLATES by hotel type
 * 3. Determine target count (random within volume range)
 * 4. If existing count >= target, return unchanged
 * 5. Otherwise, generate additional FAQs:
 *    - Select from filtered templates not already in existing
 *    - Preserve question/answer structure
 *    - Generate unique IDs for each FAQ
 * 6. Return combined array (existing + generated)
 *
 * ## Hotel Type Filtering
 *
 * FAQ templates are tagged with applicable hotel types.
 * The function only uses templates matching the target hotel type.
 * Each hotel type has 6 specialized FAQ templates.
 *
 * ## Determinism
 *
 * Same seed produces same FAQs:
 * - Same target count (within range)
 * - Same template selection order
 * - Same hotel type filtering
 *
 * @param config - The WebsiteConfig to modify
 * @param volumeConfig - Volume configuration with FAQ min/max range
 * @param rng - Seeded PRNG for deterministic generation
 * @param hotelType - Hotel type for template filtering
 * @returns Updated WebsiteConfig with multiplied FAQ
 *
 * @example
 * ```ts
 * const rng = createSeededPRNG('seed');
 * const expanded = multiplyFAQ(
 *   config,
 *   VOLUME_CONFIGS['luxury'],
 *   rng,
 *   'luxury'
 * );
 * // Now has 6-10 FAQs instead of 3
 * ```
 */
export function multiplyFAQ(
  config: WebsiteConfig,
  volumeConfig: VolumeConfig,
  rng: SeededPRNG,
  hotelType: HotelType
): WebsiteConfig {
  // Find the FAQ component in the FAQ page
  const faqPage = config.pages.faq;
  const faqComponent = faqPage.components.find(c => c.type === 'faq');

  // If no FAQ component, return unchanged (graceful handling)
  if (!faqComponent || !faqComponent.props.faqQuestions) {
    return config;
  }

  const existingFAQs = faqComponent.props.faqQuestions as Array<{
    question: string;
    answer: string;
  }>;
  const existingCount = existingFAQs.length;

  // Filter FAQ templates by hotel type
  const hotelTypeFAQs = FAQ_TEMPLATES.filter(
    template => template.hotelTypes.includes(hotelType)
  );

  // Determine target count (random within volume range)
  const targetCount = getRandomInRange(rng, volumeConfig.faq.min, volumeConfig.faq.max);

  // If already at or above target, return unchanged
  if (existingCount >= targetCount) {
    return config;
  }

  // Track existing questions to avoid duplicates
  const existingQuestions = new Set<string>();
  for (const faq of existingFAQs) {
    existingQuestions.add(faq.question);
  }

  // Filter templates to exclude existing FAQs
  const availableTemplates = hotelTypeFAQs.filter(
    template => !existingQuestions.has(template.question)
  );

  // Generate additional FAQs
  const additionalFAQs: Array<{
    question: string;
    answer: string;
  }> = [];
  const faqsToAdd = targetCount - existingCount;

  for (let i = 0; i < faqsToAdd; i++) {
    // If we run out of available templates, stop
    if (availableTemplates.length === 0) {
      break;
    }

    // Select FAQ template deterministically
    const faqTemplate = getRandomItem(rng, availableTemplates);

    // Remove from available to prevent duplicates
    const index = availableTemplates.indexOf(faqTemplate);
    if (index > -1) {
      availableTemplates.splice(index, 1);
    }

    additionalFAQs.push({
      question: faqTemplate.question,
      answer: faqTemplate.answer
    });
  }

  // Create new config with updated FAQs (immutable pattern)
  const updatedFAQComponent = {
    ...faqComponent,
    props: {
      ...faqComponent.props,
      faqQuestions: [...existingFAQs, ...additionalFAQs]
    }
  };

  const updatedFAQPage = {
    ...faqPage,
    components: faqPage.components.map(c =>
      c.type === 'faq' ? updatedFAQComponent : c
    )
  };

  return {
    ...config,
    pages: {
      ...config.pages,
      faq: updatedFAQPage
    }
  };
}

/**
 * Multiply content to target volumes
 *
 * Main orchestrator function that expands LLM-generated content templates
 * into realistic volumes per hotel type. This is the primary entry point
 * for Story 25.3 content multiplication.
 *
 * ## Algorithm
 *
 * 1. Create seeded PRNG from seed string
 * 2. Sanitize hotel name for URL templates
 * 3. Execute multiplication functions in order:
 *    - multiplyRooms: Expand room inventory
 *    - multiplyGallery: Expand gallery images
 *    - multiplyTestimonials: Expand guest reviews
 *    - multiplyAmenities: Expand amenity list
 *    - multiplyFAQ: Expand FAQ entries
 * 4. Return fully expanded WebsiteConfig
 *
 * ## Pure Function Guarantee
 *
 * This function is pure: same inputs always produce same output.
 * No side effects, no external state mutations.
 *
 * ## Determinism
 *
 * Same seed produces identical output:
 * ```ts
 * const seed = 'hotel-123-v1';
 * const result1 = multiplyContent(config, options);
 * const result2 = multiplyContent(config, options); // Same inputs
 * // result1 === result2 (deep equality)
 * ```
 *
 * ## Template Preservation
 *
 * Per Story 25.3 AC1, LLM-generated items are never discarded.
 * The function preserves all original content and only adds.
 *
 * @param config - The WebsiteConfig to expand
 * @param options - Multiplication options (volume, seed, hotel type, name)
 * @returns Expanded WebsiteConfig with multiplied content
 *
 * @example
 * ```ts
 * import { splitToPages } from '@/lib/generation/split-to-pages';
 * import { multiplyContent, VOLUME_CONFIGS } from '@/lib/generation/multiply-content';
 *
 * const homepageConfig = { ... };
 * const websiteConfig = splitToPages(homepageConfig);
 *
 * const expanded = multiplyContent(websiteConfig, {
 *   volumeConfig: VOLUME_CONFIGS['luxury'],
 *   seed: homepageConfig.generationId,
 *   hotelType: homepageConfig.hotelParameters.hotelType,
 *   hotelName: homepageConfig.hotelParameters.hotelName
 * });
 *
 * // Now has full content volumes
 * expanded.pages.rooms.component.props.rooms.length; // 8-15 rooms
 * expanded.pages.gallery.component.props.images.length; // 15-30 images
 * expanded.pages.reviews.component.props.testimonials.length; // 8-15 testimonials
 * ```
 */
export function multiplyContent(
  config: WebsiteConfig,
  options: MultiplyContentOptions
): WebsiteConfig {
  // Extract options for cleaner access
  const { volumeConfig, seed, hotelType, hotelName } = options;

  // Create seeded PRNG for deterministic generation
  const rng = createSeededPRNG(seed);

  // Sanitize hotel name for URL templates
  const sanitizedName = hotelName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

  // Execute multiplication functions in sequence
  // Each function receives the result of the previous one
  let result = config;

  result = multiplyRooms(result, volumeConfig, rng, hotelType);
  result = multiplyGallery(result, volumeConfig, rng, hotelName, sanitizedName);
  result = multiplyTestimonials(result, volumeConfig, rng, hotelName);
  result = multiplyAmenities(result, volumeConfig, rng);
  result = multiplyFAQ(result, volumeConfig, rng, hotelType);

  // AC7: Validate the result against WebsiteConfigSchema
  // This ensures the output structure is correct and all required fields are present
  const validationResult = WebsiteConfigSchema.safeParse(result);
  if (!validationResult.success) {
    // Format Zod error messages for debugging
    const errorMessages = validationResult.error.issues.map((issue) =>
      `${issue.path.join('.')}: ${issue.message}`
    ).join(', ');
    throw new Error(
      `multiplyContent() produced invalid WebsiteConfig: ${errorMessages}`
    );
  }

  return result;
}

/**
 * Convenience overload for multiplyContent
 *
 * Simplified function signature that uses default volume configs
 * and extracts metadata from the WebsiteConfig source.
 *
 * @param config - The WebsiteConfig to expand
 * @param seed - Seed string for deterministic generation
 * @returns Expanded WebsiteConfig with multiplied content
 *
 * @example
 * ```ts
 * const expanded = multiplyContentSimple(config, config.generationId);
 * ```
 */
export function multiplyContentSimple(
  config: WebsiteConfig,
  seed: string
): WebsiteConfig {
  // Extract hotel type and name from source config
  const hotelType = config.source.hotelParameters.hotelType as HotelType;
  const hotelName = config.source.hotelParameters.hotelName;
  const volumeConfig = VOLUME_CONFIGS[hotelType];

  return multiplyContent(config, {
    volumeConfig,
    seed,
    hotelType,
    hotelName
  });
}
