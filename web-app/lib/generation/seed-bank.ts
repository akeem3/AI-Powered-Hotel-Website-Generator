/**
 * Content Seed Bank
 *
 * @module lib/generation/seed-bank
 *
 * Story 25.2: Content Seed Bank
 *
 * Provides static data fragments for deterministic content multiplication.
 * Used by `multiplyContent()` to expand LLM-generated templates into realistic,
 * varied content without additional LLM calls.
 *
 * ## Architecture
 *
 * - Pure static data: no runtime logic or side effects
 * - TypeScript module (not JSON) for build-time type validation
 * - Type-safe: all entries match ContentGeneratorOutputSchema sub-schemas
 * - Deterministic: same seed always produces same output
 *
 * ## Usage Pattern
 *
 * ```ts
 * import {
 *   ROOM_NAME_FRAGMENTS,
 *   PRICE_RANGES,
 *   CAPACITY_PATTERNS,
 *   AMENITY_ENTRIES,
 *   GUEST_NAMES,
 *   QUOTE_TEMPLATES,
 *   GALLERY_PLACEHOLDERS,
 *   FAQ_TEMPLATES
 * } from '@/lib/generation/seed-bank';
 *
 * // multiplyContent() uses these to expand content
 * const expandedRooms = multiplyContent(config, volumeConfig, seed);
 * ```
 *
 * ## Determinism Algorithm
 *
 * Story 25.3's `multiplyContent()` will use a hash-based selection algorithm:
 * 1. Hash the seed string to a numeric value
 * 2. Use hash modulo array length to select fragments
 * 3. Deterministic: same seed → same hash → same selections
 *
 * This ensures reproducibility while maintaining variety across runs.
 *
 * ## Data Organization
 *
 * - **Room Fragments**: Adjectives + nouns for 5 hotel types
 * - **Price Ranges**: Min/max per hotel type (luxury > budget)
 * - **Capacity Patterns**: Guest capacity ranges per hotel type
 * - **Amenities**: 50+ entries across 4 categories
 * - **Testimonials**: 30+ names + 30+ quote templates
 * - **Gallery**: 20+ CDN path templates
 * - **FAQs**: 30+ Q/A pairs (6 per hotel type)
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Hotel type enum
 *
 * Matches HotelParametersSchema in ContentGeneratorOutputSchema.
 */
export type HotelType = 'luxury' | 'boutique' | 'resort' | 'business' | 'budget';

/**
 * Room name fragment type
 *
 * Indicates whether a fragment is an adjective (descriptive) or noun (room type).
 * Used by multiplyContent() to combine fragments into full room names.
 */
export type FragmentType = 'adjective' | 'noun';

/**
 * Amenity category enum
 *
 * Matches the amenity category schema in ContentGeneratorOutputSchema.
 */
export type AmenityCategory = 'room' | 'hotel' | 'location' | 'services';

/**
 * Room name fragment
 *
 * A building block for generating room names. Fragments are combined
 * by multiplyContent() to create unique room names while maintaining
 * hotel type consistency.
 *
 * @example
 * ```ts
 * const luxuryAdjective: RoomNameFragment = {
 *   text: 'Presidential',
 *   hotelTypes: ['luxury'],
 *   type: 'adjective'
 * };
 *
 * const roomType: RoomNameFragment = {
 *   text: 'Suite',
 *   hotelTypes: ['luxury', 'boutique', 'resort', 'business', 'budget'],
 *   type: 'noun'
 * };
 * ```
 */
export interface RoomNameFragment {
  /** The fragment text (e.g., "Presidential", "Suite", "Ocean") */
  text: string;
  /** Which hotel types this fragment applies to */
  hotelTypes: HotelType[];
  /** Whether this is an adjective or noun fragment */
  type: FragmentType;
}

/**
 * Price range
 *
 * Minimum and maximum nightly rate for a room type.
 * Used by multiplyContent() to generate varied pricing within realistic bounds.
 */
export interface PriceRange {
  /** Minimum nightly rate */
  min: number;
  /** Maximum nightly rate */
  max: number;
}

/**
 * Capacity pattern
 *
 * Guest capacity range expressed as [min, max].
 * Represents common occupancy patterns per hotel type.
 */
export type CapacityPattern = [number, number];

/**
 * Amenity entry
 *
 * Represents a single amenity with its category and optional icon.
 * Matches the amenity schema in ContentGeneratorOutputSchema exactly.
 *
 * @example
 * ```ts
 * const poolAmenity: AmenityEntry = {
 *   name: 'Swimming Pool',
 *   category: 'hotel',
 *   icon: 'pool'
 * };
 * ```
 */
export interface AmenityEntry {
  /** Amenity display name (2-30 chars per schema) */
  name: string;
  /** Amenity category for grouping */
  category: AmenityCategory;
  /** Optional icon name for UI rendering */
  icon?: string;
}

/**
 * Guest name
 *
 * A realistic guest name for testimonial generation.
 * Must be 2-50 characters per ContentGeneratorOutputSchema.
 */
export type GuestName = string;

/**
 * Quote template
 *
 * A testimonial quote template with placeholders for dynamic content.
 * Must be 20-500 characters per ContentGeneratorOutputSchema.
 *
 * Templates may use placeholders like {hotel} or {feature} that
 * multiplyContent() can replace with hotel-specific values.
 */
export type QuoteTemplate = string;

/**
 * Gallery placeholder entry
 *
 * CDN path template for gallery image generation.
 * The src template uses placeholders that multiplyContent() fills deterministically.
 *
 * @example
 * ```ts
 * const placeholder: GalleryPlaceholder = {
 *   srcTemplate: '/assets/hotel/{sanitizedName}/gallery/{index}.webp',
 *   altTemplate: '{hotelName} {viewType} view',
 *   captionTemplate: 'Beautiful {viewType} at {hotelName}'
 * };
 * ```
 */
export interface GalleryPlaceholder {
  /** CDN path template with placeholder variables */
  srcTemplate: string;
  /** Alt text template (5-100 chars per schema) */
  altTemplate: string;
  /** Optional caption template */
  captionTemplate?: string;
}

/**
 * FAQ template
 *
 * Question and answer template for FAQ generation.
 * Templates are tagged with applicable hotel types for targeted usage.
 *
 * Length constraints per ContentGeneratorOutputSchema:
 * - question: 1-200 characters
 * - answer: 1-2000 characters
 *
 * @example
 * ```ts
 * const faq: FAQTemplate = {
 *   question: 'What time is check-in?',
 *   answer: 'Check-in is at 3:00 PM. Early check-in may be available upon request.',
 *   hotelTypes: ['business', 'budget']
 * };
 * ```
 */
export interface FAQTemplate {
  /** FAQ question text */
  question: string;
  /** FAQ answer text */
  answer: string;
  /** Which hotel types this FAQ applies to */
  hotelTypes: HotelType[];
}

// ============================================================================
// SEED BANK CONSTANTS
// ============================================================================

/**
 * Room name fragments
 *
 * Building blocks for generating realistic room names.
 * Organized by hotel type affinity with adjective and noun fragments.
 *
 * ## Fragment Categories
 *
 * **Luxury Fragments**: Premium, high-end descriptors (Presidential, Royal, Imperial)
 * **Boutique Fragments**: Unique, curated descriptors (Artisan, Designer, Chic)
 * **Resort Fragments**: Location-based descriptors (Tropical, Oceanfront, Cliffside)
 * **Business Fragments**: Professional descriptors (Executive, Corporate, Conference)
 * **Budget Fragments**: Value-oriented descriptors (Smart, Value, Economy)
 *
 * ## Usage
 *
 * multiplyContent() combines fragments: [adjective] + [noun] = room name
 * Example: "Presidential" + "Suite" = "Presidential Suite"
 *
 * ## Count
 *
 * - Luxury: 15 adjectives + 10 nouns = 25 fragments
 * - Boutique: 10 adjectives + 10 nouns = 20 fragments
 * - Resort: 12 adjectives + 10 nouns = 22 fragments
 * - Business: 10 adjectives + 10 nouns = 20 fragments
 * - Budget: 10 adjectives + 10 nouns = 20 fragments
 * - Total: 107 fragments covering all hotel types
 */
export const ROOM_NAME_FRAGMENTS: RoomNameFragment[] = [
  // === LUXURY ADJECTIVES (15) ===
  { text: 'Presidential', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Royal', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Imperial', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Executive', hotelTypes: ['luxury', 'business'], type: 'adjective' },
  { text: 'Penthouse', hotelTypes: ['luxury', 'boutique'], type: 'adjective' },
  { text: 'Grand', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Premium', hotelTypes: ['luxury', 'boutique'], type: 'adjective' },
  { text: 'Elite', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Signature', hotelTypes: ['luxury', 'boutique'], type: 'adjective' },
  { text: 'Crown', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Regal', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Majestic', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Opulent', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Elegant', hotelTypes: ['luxury', 'boutique'], type: 'adjective' },
  { text: 'Lavish', hotelTypes: ['luxury'], type: 'adjective' },
  { text: 'Sophisticated', hotelTypes: ['luxury'], type: 'adjective' },

  // === BOUTIQUE ADJECTIVES (10) ===
  { text: 'Artisan', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Curated', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Designer', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Chic', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Urban', hotelTypes: ['boutique', 'business'], type: 'adjective' },
  { text: 'Local', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Unique', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Intimate', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Bespoke', hotelTypes: ['boutique'], type: 'adjective' },
  { text: 'Handcrafted', hotelTypes: ['boutique'], type: 'adjective' },

  // === RESORT ADJECTIVES (12) ===
  { text: 'Tropical', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Oceanfront', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Cliffside', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Beachfront', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Lagoon', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Island', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Coastal', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Sunset', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Sunrise', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Garden', hotelTypes: ['resort', 'boutique'], type: 'adjective' },
  { text: 'Breezy', hotelTypes: ['resort'], type: 'adjective' },
  { text: 'Paradise', hotelTypes: ['resort'], type: 'adjective' },

  // === BUSINESS ADJECTIVES (10) ===
  { text: 'Corporate', hotelTypes: ['business'], type: 'adjective' },
  { text: 'Conference', hotelTypes: ['business'], type: 'adjective' },
  { text: 'Professional', hotelTypes: ['business'], type: 'adjective' },
  { text: 'Standard', hotelTypes: ['business'], type: 'adjective' },
  { text: 'Classic', hotelTypes: ['business', 'boutique'], type: 'adjective' },
  { text: 'Efficient', hotelTypes: ['business', 'budget'], type: 'adjective' },
  { text: 'Smart', hotelTypes: ['business', 'budget'], type: 'adjective' },
  { text: 'Modern', hotelTypes: ['business', 'boutique'], type: 'adjective' },
  { text: 'Central', hotelTypes: ['business'], type: 'adjective' },
  { text: 'Prime', hotelTypes: ['business'], type: 'adjective' },

  // === BUDGET ADJECTIVES (10) ===
  { text: 'Value', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Economy', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Essential', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Simple', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Cozy', hotelTypes: ['budget', 'boutique'], type: 'adjective' },
  { text: 'Comfy', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Friendly', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Affordable', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Practical', hotelTypes: ['budget'], type: 'adjective' },
  { text: 'Smart', hotelTypes: ['budget', 'business'], type: 'adjective' },

  // === ROOM TYPE NOUNS (10) - applies to all hotel types ===
  { text: 'Suite', hotelTypes: ['luxury', 'boutique', 'resort', 'business', 'budget'], type: 'noun' },
  { text: 'Room', hotelTypes: ['luxury', 'boutique', 'resort', 'business', 'budget'], type: 'noun' },
  { text: 'Studio', hotelTypes: ['boutique', 'business', 'budget'], type: 'noun' },
  { text: 'Villa', hotelTypes: ['luxury', 'resort', 'boutique'], type: 'noun' },
  { text: 'Cottage', hotelTypes: ['resort', 'boutique'], type: 'noun' },
  { text: 'Cabin', hotelTypes: ['resort', 'budget'], type: 'noun' },
  { text: 'Apartment', hotelTypes: ['boutique', 'business', 'budget'], type: 'noun' },
  { text: 'Loft', hotelTypes: ['boutique', 'business'], type: 'noun' },
  { text: 'Bungalow', hotelTypes: ['resort'], type: 'noun' },
  { text: 'Penthouse', hotelTypes: ['luxury', 'boutique'], type: 'noun' },
];

/**
 * Price ranges per hotel type
 *
 * Realistic nightly rate ranges for each hotel category.
 * Luxury has the highest rates, budget has the lowest.
 *
 * ## Validation
 *
 * - Luxury min ($200) > Budget max ($150) ✓
 * - Resort min ($250) is highest (resorts are premium)
 * - All ranges have reasonable spread for variety
 *
 * ## Usage
 *
 * multiplyContent() generates random prices within these ranges:
 * ```ts
 * const price = getRandomInRange(PRICE_RANGES[hotelType]);
 * ```
 */
export const PRICE_RANGES: Record<HotelType, PriceRange> = {
  luxury: { min: 200, max: 500 },
  boutique: { min: 150, max: 300 },
  resort: { min: 250, max: 600 },
  business: { min: 100, max: 300 },
  budget: { min: 50, max: 150 },
};

/**
 * Capacity patterns per hotel type
 *
 * Guest capacity ranges for each hotel category.
 * Each pattern is a [min, max] tuple representing occupancy limits.
 *
 * ## Pattern Breakdown
 *
 * **Luxury**: Intimate settings (1-2, 2-4) - premium, private experience
 * **Boutique**: Similar to luxury with some family options
 * **Resort**: Family-friendly (2-4, 4-6) - larger groups, vacations
 * **Business**: Solo and small group (1-2, 2-4) - business travelers
 * **Budget**: Similar to business - value-conscious travelers
 *
 * ## Usage
 *
 * multiplyContent() assigns capacities to rooms:
 * ```ts
 * const capacity = getRandomPattern(CAPACITY_PATTERNS[hotelType]);
 * ```
 */
export const CAPACITY_PATTERNS: Record<HotelType, CapacityPattern[]> = {
  luxury: [
    [1, 2], // Intimate couples
    [2, 4], // Small families
    [2, 3], // Small groups
    [1, 1], // Solo travelers
  ],
  boutique: [
    [1, 2],
    [2, 3],
    [1, 1],
    [2, 4], // Family option
  ],
  resort: [
    [2, 4], // Families
    [4, 6], // Larger groups
    [2, 3], // Couples
    [6, 8], // Multi-family
  ],
  business: [
    [1, 2], // Solo/business partner
    [2, 4], // Small meetings
    [1, 1], // Solo
    [2, 3], // Team
  ],
  budget: [
    [1, 2],
    [2, 4],
    [1, 1],
    [2, 3],
  ],
};

/**
 * Amenity entries
 *
 * 52 amenity entries across 4 categories.
 * Each entry has a name, category, and optional icon.
 *
 * ## Category Breakdown
 *
 * **Room** (12): In-room amenities guests expect
 * **Hotel** (12): Property-wide facilities
 * **Location** (12): Surrounding area features
 * **Services** (16): Guest services and conveniences
 *
 * ## Icon Naming
 *
 * Icons use descriptive names (not file paths) for flexibility.
 * Icon rendering is handled by the component layer.
 *
 * @example
 * ```ts
 * const pool = AMENITY_ENTRIES.find(a => a.name === 'Swimming Pool');
 * // { name: 'Swimming Pool', category: 'hotel', icon: 'pool' }
 * ```
 */
export const AMENITY_ENTRIES: AmenityEntry[] = [
  // === ROOM AMENITIES (12) ===
  { name: 'WiFi', category: 'room', icon: 'wifi' },
  { name: 'Smart TV', category: 'room', icon: 'tv' },
  { name: 'Mini Bar', category: 'room', icon: 'bar' },
  { name: 'In-Room Safe', category: 'room', icon: 'safe' },
  { name: 'Air Conditioning', category: 'room', icon: 'ac' },
  { name: 'Coffee Maker', category: 'room', icon: 'coffee' },
  { name: 'Bathrobes', category: 'room', icon: 'robe' },
  { name: 'Slippers', category: 'room', icon: 'slippers' },
  { name: 'Iron & Ironing Board', category: 'room', icon: 'iron' },
  { name: 'Hair Dryer', category: 'room', icon: 'hairdryer' },
  { name: 'Work Desk', category: 'room', icon: 'desk' },
  { name: 'Blackout Curtains', category: 'room', icon: 'curtains' },

  // === HOTEL AMENITIES (12) ===
  { name: 'Swimming Pool', category: 'hotel', icon: 'pool' },
  { name: 'Fitness Center', category: 'hotel', icon: 'gym' },
  { name: 'Spa & Wellness', category: 'hotel', icon: 'spa' },
  { name: 'On-Site Restaurant', category: 'hotel', icon: 'restaurant' },
  { name: 'Bar & Lounge', category: 'hotel', icon: 'bar' },
  { name: 'Room Service', category: 'hotel', icon: 'roomservice' },
  { name: 'Concierge', category: 'hotel', icon: 'concierge' },
  { name: 'Valet Parking', category: 'hotel', icon: 'parking' },
  { name: 'Business Center', category: 'hotel', icon: 'business' },
  { name: 'Meeting Rooms', category: 'hotel', icon: 'meeting' },
  { name: 'Laundry Service', category: 'hotel', icon: 'laundry' },
  { name: 'Dry Cleaning', category: 'hotel', icon: 'dryclean' },

  // === LOCATION AMENITIES (12) ===
  { name: 'Beach Access', category: 'location', icon: 'beach' },
  { name: 'Golf Course', category: 'location', icon: 'golf' },
  { name: 'Tennis Courts', category: 'location', icon: 'tennis' },
  { name: 'Ski Storage', category: 'location', icon: 'ski' },
  { name: 'Bike Rental', category: 'location', icon: 'bike' },
  { name: 'Hiking Trails', category: 'location', icon: 'hiking' },
  { name: 'Water Sports', category: 'location', icon: 'watersports' },
  { name: 'Marina Access', category: 'location', icon: 'marina' },
  { name: 'Gardens', category: 'location', icon: 'garden' },
  { name: 'Terrace', category: 'location', icon: 'terrace' },
  { name: 'Courtyard', category: 'location', icon: 'courtyard' },
  { name: 'Rooftop Deck', category: 'location', icon: 'rooftop' },

  // === SERVICES (16) ===
  { name: 'Airport Shuttle', category: 'services', icon: 'shuttle' },
  { name: 'Car Rental', category: 'services', icon: 'car' },
  { name: 'Tour Desk', category: 'services', icon: 'tour' },
  { name: 'Ticket Booking', category: 'services', icon: 'ticket' },
  { name: 'Currency Exchange', category: 'services', icon: 'exchange' },
  { name: 'ATM On-Site', category: 'services', icon: 'atm' },
  { name: 'Doctor On Call', category: 'services', icon: 'doctor' },
  { name: 'Babysitting Service', category: 'services', icon: 'baby' },
  { name: 'Pet Friendly', category: 'services', icon: 'pet' },
  { name: 'Designated Smoking Area', category: 'services', icon: 'smoking' },
  { name: 'Non-Smoking Rooms', category: 'services', icon: 'nosmoking' },
  { name: 'Accessibility Features', category: 'services', icon: 'accessibility' },
  { name: 'Elevators', category: 'services', icon: 'elevator' },
  { name: '24-Hour Front Desk', category: 'services', icon: 'frontdesk' },
  { name: 'Daily Housekeeping', category: 'services', icon: 'housekeeping' },
  { name: 'Luggage Storage', category: 'services', icon: 'luggage' },
];

/**
 * Guest names for testimonials
 *
 * 30 realistic guest names covering various regions and demographics.
 * All names are 2-50 characters per ContentGeneratorOutputSchema.
 *
 * ## Diversity
 *
 * - North American names
 * - European names
 * - Asian names
 * - Mixed international names
 * - Professional and casual styles
 *
 * ## Usage
 *
 * multiplyContent() assigns names to testimonials:
 * ```ts
 * const name = GUEST_NAMES[Math.floor(hash) % GUEST_NAMES.length];
 * ```
 */
export const GUEST_NAMES: GuestName[] = [
  'Sarah Mitchell',
  'James Wilson',
  'Maria Garcia',
  'David Chen',
  'Emma Thompson',
  'Michael Brown',
  'Sophie Dubois',
  'Hans Mueller',
  'Aiko Tanaka',
  'Carlos Rodriguez',
  'Anna Kowalski',
  'Giovanni Rossi',
  'Priya Sharma',
  'Sven Johansson',
  'Olivia Patterson',
  'Robert Taylor',
  'Isabella Costa',
  'Yuki Tanaka',
  'Mohammed Hassan',
  'Charlotte Williams',
  'Thomas Anderson',
  'Elena Volkov',
  'Liam O\'Connor',
  'Chloe Beaumont',
  'Ahmed Al-Fayed',
  'Jessica Lee',
  'William Davis',
  'Sophie Martin',
  'Lucas Silva',
  'Emma Johnson',
  'Alexander Petrov',
];

/**
 * Quote templates for testimonials
 *
 * 30 testimonial quote templates covering various sentiment patterns.
 * All quotes are 20-500 characters per ContentGeneratorOutputSchema.
 *
 * ## Template Categories
 *
 * **Exceptional Service** (8): Praises staff, service, attention to detail
 * **Beautiful Location** (6): Views, surroundings, ambiance
 * **Great Amenities** (5): Pool, spa, rooms, facilities
 * **Business Travel** (4): WiFi, business center, meetings
 * **Family Experience** (4): Kid-friendly, activities, space
 * **Value Proposition** (3): Worth every penny, great rates
 *
 * ## Usage
 *
 * multiplyContent() fills placeholders and assigns to testimonials:
 * ```ts
 * const quote = QUOTE_TEMPLATES[Math.floor(hash) % QUOTE_TEMPLATES.length]
 *   .replace('{hotel}', hotelName)
 *   .replace('{feature}', feature);
 * ```
 */
export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  // === EXCEPTIONAL SERVICE (8) ===
  'The staff went above and beyond to make our stay unforgettable. Every request was handled with a smile.',
  'Impeccable service from check-in to check-out. The attention to detail is remarkable.',
  'The concierge team anticipated our every need. True luxury hospitality.',
  'Every staff member we encountered was professional, courteous, and eager to help.',
  'The personalized service made us feel like VIP guests throughout our stay.',
  'Exceptional housekeeping and turndown service. The room was always pristine.',
  'The front desk team was incredibly helpful with local recommendations and reservations.',
  'Outstanding service! The staff remembered our preferences from the moment we arrived.',

  // === BEAUTIFUL LOCATION (6) ===
  'The location is absolutely stunning. Woke up to breathtaking views every morning.',
  'Perfect location! Walking distance to everything we wanted to see and do.',
  'The {hotel} is ideally situated. Beautiful surroundings and easy access to local attractions.',
  'We loved the {viewType} views from our room. Absolutely picturesque.',
  'The {hotel} is a hidden gem. Tucked away yet convenient to everything.',
  'Beautifully landscaped grounds. The {feature} was the highlight of our stay.',

  // === GREAT AMENITIES (5) ===
  'The {feature} exceeded our expectations. Clean, modern, and well-maintained.',
  'Spent most of our time at the {feature}. It was absolutely perfect for our family.',
  'The rooms are spacious and beautifully appointed. The {feature} was a nice touch.',
  'The amenities here are top-notch. The {feature} was the highlight of our stay.',
  'Incredibly comfortable beds and luxurious linens. We slept so well!',

  // === BUSINESS TRAVEL (4) ===
  'Excellent business hotel. Reliable WiFi, great business center, and quiet work spaces.',
  'Perfect for our business trip. The meeting facilities were professional and well-equipped.',
  'The {hotel} understands business travelers. Efficient service and great workspace.',
  'Productive stay thanks to the reliable internet and comfortable business facilities.',

  // === FAMILY EXPERIENCE (4) ===
  'Our family had a wonderful time. The kids loved the {feature} and activities.',
  'Spacious rooms and family-friendly amenities made our vacation stress-free.',
  'The {hotel} catered to families perfectly. Safe, clean, and lots of fun for the kids.',
  'Great location for families. Plenty of space and activities for children of all ages.',

  // === VALUE PROPOSITION (3) ===
  'Excellent value for the quality and service we received. Would definitely return.',
  'Worth every penny. The {hotel} exceeded our expectations in every way.',
  'Great rates for such a high-quality experience. We felt like we got a bargain.',
];

/**
 * Gallery placeholder entries
 *
 * 20 CDN path templates for gallery image generation.
 * All alt templates are 5-100 characters per ContentGeneratorOutputSchema.
 *
 * ## Template Placeholders
 *
 * - `{sanitizedName}`: Hotel name sanitized for URLs (kebab-case)
 * - `{index}`: Sequential image index (1-based)
 * - `{hotelName}`: Full hotel name
 * - `{viewType}`: Type of view (ocean view, lobby, etc.)
 * - `{areaType}`: Hotel area (pool, garden, etc.)
 * - `{feature}`: Specific feature or amenity
 *
 * ## Usage
 *
 * multiplyContent() generates gallery entries deterministically:
 * ```ts
 * const galleryEntry = {
 *   id: `gallery-${index}`,
 *   src: placeholder.srcTemplate
 *     .replace('{sanitizedName}', sanitizedName)
 *     .replace('{index}', index.toString()),
 *   alt: placeholder.altTemplate
 *     .replace('{hotelName}', hotelName)
 *     .replace('{viewType}', viewType),
 *   caption: placeholder.captionTemplate?.replace('{hotelName}', hotelName)
 * };
 * ```
 */
export const GALLERY_PLACEHOLDERS: GalleryPlaceholder[] = [
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/lobby-entrance.webp',
    altTemplate: '{hotelName} lobby entrance area',
    captionTemplate: 'Welcome to {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/rooms-exterior.webp',
    altTemplate: '{hotelName} rooms building exterior',
    captionTemplate: 'Our comfortable rooms at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/pool-area.webp',
    altTemplate: '{hotelName} swimming pool area',
    captionTemplate: 'Relax by the pool at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/beach-ocean.webp',
    altTemplate: '{hotelName} beachfront ocean view',
    captionTemplate: 'Stunning ocean views at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/gardens.webp',
    altTemplate: '{hotelName} tropical gardens',
    captionTemplate: 'Beautiful gardens at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/restaurant-dining.webp',
    altTemplate: '{hotelName} on-site restaurant',
    captionTemplate: 'Fine dining at {hotelName} restaurant',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/spa-wellness.webp',
    altTemplate: '{hotelName} spa and wellness center',
    captionTemplate: 'Rejuvenate at {hotelName} spa',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/fitness-center.webp',
    altTemplate: '{hotelName} fitness center and gym',
    captionTemplate: 'Stay active at {hotelName} fitness center',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/bar-lounge.webp',
    altTemplate: '{hotelName} bar and lounge area',
    captionTemplate: 'Unwind at the {hotelName} bar',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/terrace.webp',
    altTemplate: '{hotelName} outdoor terrace seating',
    captionTemplate: 'Al fresco dining on the {hotelName} terrace',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/courtyard.webp',
    altTemplate: '{hotelName} interior courtyard',
    captionTemplate: 'Peaceful courtyard at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/rooftop-deck.webp',
    altTemplate: '{hotelName} rooftop deck with views',
    captionTemplate: 'Panoramic views from {hotelName} rooftop',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/meeting-room.webp',
    altTemplate: '{hotelName} meeting room or conference space',
    captionTemplate: 'Business facilities at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/conference-room.webp',
    altTemplate: '{hotelName} conference center',
    captionTemplate: 'Host your event at {hotelName} conference center',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/main-entrance.webp',
    altTemplate: '{hotelName} main entrance facade',
    captionTemplate: 'Welcome to {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/hotel-facade.webp',
    altTemplate: '{hotelName} building exterior',
    captionTemplate: 'Beautiful architecture at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/garden-view-room.webp',
    altTemplate: '{hotelName} room with garden view',
    captionTemplate: 'Peaceful garden views at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/ocean-view-suite.webp',
    altTemplate: '{hotelName} suite with ocean view',
    captionTemplate: 'Breathtaking ocean views at {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/city-view.webp',
    altTemplate: '{hotelName} city skyline view',
    captionTemplate: 'City views from {hotelName}',
  },
  {
    srcTemplate: '/assets/hotel/{sanitizedName}/gallery/reception-desk.webp',
    altTemplate: '{hotelName} reception and check-in area',
    captionTemplate: 'Welcome at {hotelName} reception',
  },
];

/**
 * FAQ templates per hotel type
 *
 * 30 FAQ question/answer templates (6 per hotel type).
 * All questions are 1-200 characters and answers are 1-2000 characters per schema.
 *
 * ## Hotel Type Specialization
 *
 * **Luxury** (6): Premium services, exclusivity, fine dining
 * **Boutique** (6): Unique design, personalized service, local flavor
 * **Resort** (6): Beach/pool, activities, family programs
 * **Business** (6): Business center, meetings, WiFi, efficiency
 * **Budget** (6): Value, nearby attractions, public transport, parking
 *
 * ## Usage
 *
 * multiplyContent() filters FAQs by hotel type and fills placeholders:
 * ```ts
 * const hotelFAQs = FAQ_TEMPLATES.filter(faq =>
 *   faq.hotelTypes.includes(hotelType)
 * );
 * ```
 */
export const FAQ_TEMPLATES: FAQTemplate[] = [
  // === LUXURY FAQS (6) ===
  {
    question: 'What exclusive services are available for luxury guests?',
    answer: 'Luxury guests enjoy personalized butler service, private check-in/out, and access to our exclusive rooftop lounge. Our concierge can arrange private yacht charters, helicopter transfers, and exclusive dining experiences.',
    hotelTypes: ['luxury'],
  },
  {
    question: 'Is the spa included in my room rate?',
    answer: 'Our luxury spa access is complimentary for all guests. Premium treatments and private spa suites are available for an additional charge. Reservations are recommended for weekend appointments.',
    hotelTypes: ['luxury'],
  },
  {
    question: 'What dining options are available?',
    answer: 'We feature two award-winning restaurants: our signature fine dining restaurant with Michelin-starred cuisine, and a casual bistro for breakfast and lunch. In-room dining is available 24/7.',
    hotelTypes: ['luxury'],
  },
  {
    question: 'Can you arrange airport transfers?',
    answer: 'We offer luxury airport transfers in our premium vehicle fleet, including Mercedes S-Class sedans and first-class sprinter vans. Our chauffeur service tracks your flight to ensure timely pickup.',
    hotelTypes: ['luxury'],
  },
  {
    question: 'Are there any exclusive amenities for suite guests?',
    answer: 'Suite guests enjoy exclusive access to our executive lounge, complimentary evening turndown service, priority reservations for all hotel facilities, and a dedicated personal assistant during your stay.',
    hotelTypes: ['luxury'],
  },
  {
    question: 'What makes your hotel different from other luxury properties?',
    answer: 'Our commitment to personalized service sets us apart. With a guest-to-staff ratio of 2:1, we anticipate your needs before you do. Every suite is uniquely designed with original artwork and custom furnishings.',
    hotelTypes: ['luxury'],
  },

  // === BOUTIQUE FAQS (6) ===
  {
    question: 'What makes your property unique?',
    answer: 'Our hotel is housed in a beautifully restored historic building from 1924, featuring original architectural details combined with contemporary design. Each of our 40 rooms is individually decorated with original artwork from local artists.',
    hotelTypes: ['boutique'],
  },
  {
    question: 'Do you offer local experiences?',
    answer: 'Yes! We partner with local artisans, chefs, and guides to offer authentic neighborhood experiences. Join our morning coffee crawl, evening food tour, or private gallery walk with our curator.',
    hotelTypes: ['boutique'],
  },
  {
    question: 'How personalized is your service?',
    answer: 'As a boutique property, we pride ourselves on knowing every guest by name. Our team provides personalized recommendations for local dining, shopping, and cultural experiences tailored to your interests.',
    hotelTypes: ['boutique'],
  },
  {
    question: 'Are there curated amenities in the rooms?',
    answer: 'Each room features curated amenities like premium Nespresso machines, bespoke bathroom products from local perfumers, original artwork, and custom-designed furniture you won\'t find anywhere else.',
    hotelTypes: ['boutique'],
  },
  {
    question: 'What dining options do you offer?',
    answer: 'Our intimate restaurant seats just 40 and features a seasonally changing menu highlighting local, organic ingredients. Our chef creates unique tasting menus that tell the story of our region.',
    hotelTypes: ['boutique'],
  },
  {
    question: 'Is this property suitable for romantic getaways?',
    answer: 'Absolutely! We specialize in romantic escapes with packages including champagne on arrival, couples massages, private dining on our terrace, and curated romantic experiences in the neighborhood.',
    hotelTypes: ['boutique'],
  },

  // === RESORT FAQS (6) ===
  {
    question: 'How far is the beach from the hotel?',
    answer: 'We have direct beach access via our private boardwalk. Beach chairs, umbrellas, and towel service are complimentary for all guests. Our beach attendants will set up your preferred spot upon request.',
    hotelTypes: ['resort'],
  },
  {
    question: 'What activities are available for children?',
    answer: 'Our Kids Club offers supervised activities for ages 4-12 from 9 AM to 5 PM daily. We have three pools (including a kids\' pool with water features), a game room, playground, and scheduled family activities.',
    hotelTypes: ['resort'],
  },
  {
    question: 'Do you offer all-inclusive packages?',
    answer: 'Yes, we offer all-inclusive options that include all meals, unlimited beverages at our five bars, unlimited non-motorized water sports, resort activities, and nightly entertainment. Premium packages also include spa credits and excursions.',
    hotelTypes: ['resort'],
  },
  {
    question: 'What water sports equipment is available?',
    answer: 'Complimentary non-motorized equipment includes kayaks, paddleboards, snorkel gear, and sailboats. Motorized water sports are available for an additional charge. Our water sports center provides lessons and equipment orientation.',
    hotelTypes: ['resort'],
  },
  {
    question: 'What are the pool hours?',
    answer: 'Our main pool and children\'s pool are open from 7 AM to 10 PM. The adults-only quiet pool is open from 6 AM to 11 PM. Pool towels and complimentary fruit-infused water are provided at all pools.',
    hotelTypes: ['resort'],
  },
  {
    question: 'Is there a dress code for restaurants?',
    answer: 'Breakfast and lunch are casual. For dinner, we request resort elegant attire for our main restaurant. Our casual restaurants allow casual dress. Beachwear is welcome at our poolside bars and grill.',
    hotelTypes: ['resort'],
  },

  // === BUSINESS FAQS (6) ===
  {
    question: 'What business facilities do you offer?',
    answer: 'Our business center features 24/7 access to computers, printing, and high-speed WiFi. We have six meeting rooms equipped with the latest AV technology, video conferencing capabilities, and catering available for all events.',
    hotelTypes: ['business'],
  },
  {
    question: 'How fast is your internet connection?',
    answer: 'We offer gigabit WiFi throughout the property with dedicated bandwidth for business guests. Upload speeds are 100+ Mbps and download speeds are 500+ Mbps. All rooms have ethernet cables available upon request.',
    hotelTypes: ['business'],
  },
  {
    question: 'Can you host corporate events?',
    answer: 'Yes, we specialize in corporate events, board meetings, and conferences. Our largest meeting room seats 200 theater-style or 150 classroom-style. We provide dedicated event coordinators, custom catering, and AV support.',
    hotelTypes: ['business'],
  },
  {
    question: 'What are your check-in/check-out times for business travelers?',
    answer: 'Standard check-in is 3 PM and check-out is 11 AM. We offer early check-in at 10 AM and late check-out until 2 PM for business travelers, subject to availability. Express checkout is available for quick departures.',
    hotelTypes: ['business'],
  },
  {
    question: 'Is parking available?',
    answer: 'We offer complimentary self-parking in our covered garage. EV charging stations are available on a first-come, first-served basis. Valet parking is available for an additional fee with in-and-out privileges.',
    hotelTypes: ['business'],
  },
  {
    question: 'Do you offer day rates for business meetings?',
    answer: 'Yes, we offer competitive day meeting packages that include use of our business center, meeting room rental, refreshments, and lunch packages. Half-day and full-day rates are available with advance reservation.',
    hotelTypes: ['business'],
  },

  // === BUDGET FAQS (6) ===
  {
    question: 'Are there any additional fees I should know about?',
    answer: 'Our rates include all standard amenities with no hidden fees. Optional services like parking and breakfast packages are available for a small additional charge. We believe in transparent, upfront pricing.',
    hotelTypes: ['budget'],
  },
  {
    question: 'How can I get to the city center from here?',
    answer: 'We are conveniently located just two blocks from the metro station. Bus stops for routes to downtown are right in front of our hotel. City center is a 15-minute ride by public transit.',
    hotelTypes: ['budget'],
  },
  {
    question: 'What breakfast options are available?',
    answer: 'We offer a continental breakfast buffet for a small additional charge, featuring fresh coffee, pastries, fruit, yogurt, and cereal. There are several cafes and breakfast spots within a block of the hotel.',
    hotelTypes: ['budget'],
  },
  {
    question: 'Is there parking available?',
    answer: 'We offer free parking in our adjacent lot on a first-come, first-served basis. Street parking is also available on the surrounding streets with no time restrictions in our zone.',
    hotelTypes: ['budget'],
  },
  {
    question: 'What amenities are included in my room?',
    answer: 'All rooms include free high-speed WiFi, flat-screen TV with premium channels, mini-fridge, microwave, coffee maker, iron and ironing board, hair dryer, and premium bedding. Housekeeping keeps everything spotless.',
    hotelTypes: ['budget'],
  },
  {
    question: 'How can I get to the airport from your hotel?',
    answer: 'The airport shuttle bus stops one block from our hotel every 30 minutes. Ride share pickup is at the main entrance. We can also arrange affordable taxi or shuttle service with 24-hour advance notice.',
    hotelTypes: ['budget'],
  },
];

// ============================================================================
// INDEXES AND HELPER TYPES
// ============================================================================

/**
 * Count of room name fragments per hotel type
 *
 * Useful for validation and testing to ensure sufficient coverage.
 * Counts include type-specific fragments plus shared fragments (nouns and shared adjectives).
 */
export const ROOM_FRAGMENT_COUNTS: Record<HotelType, number> = {
  luxury: 26,  // 16 luxury-specific + 5 shared with boutique + 1 shared with business + 10 shared nouns
  boutique: 23,  // 8 boutique-specific + 5 shared with luxury + 3 shared with business/budget + 10 shared nouns
  resort: 22,  // 12 resort-specific + 1 shared with boutique + 10 shared nouns
  business: 22, // 8 business-specific + 1 shared with luxury + 3 shared with boutique + 1 shared with budget + 10 shared nouns
  budget: 21,  // 9 budget-specific + 1 shared with business + 1 shared with boutique + 10 shared nouns
};

/**
 * Count of FAQ templates per hotel type
 *
 * Useful for validation and testing to ensure sufficient coverage.
 */
export const FAQ_COUNTS: Record<HotelType, number> = {
  luxury: 6,
  boutique: 6,
  resort: 6,
  business: 6,
  budget: 6,
};
