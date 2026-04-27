/**
 * Multi-Page Generation Utilities
 *
 * @module lib/generation/split-to-pages
 *
 * Story 25.1: WebsiteConfigSchema and splitToPages() Utility
 *
 * Provides $0-cost post-processing transformation from single-page HomepageConfig
 * to multi-page WebsiteConfig. This enables the LangGraph preview path to render
 * full multi-page websites without additional LLM calls.
 *
 * ## Architecture
 *
 * - Pure function design: same input always produces same output
 * - No LLM calls: deterministic transformation of existing data
 * - Additive only: HomepageConfigSchema is wrapped, not modified
 * - Component reusability: same component objects appear on multiple pages
 *
 * ## Page Types
 *
 * - homepage: Curated landing page with teaser content
 * - rooms: Full rooms listing page
 * - roomDetail: Individual room detail pages (map keyed by room slug)
 * - gallery: Full gallery page
 * - amenities: Full amenities page
 * - reviews: Guest reviews/testimonials page
 * - contact: Contact page
 * - about: About page
 * - faq: FAQ page
 *
 * @example
 * ```ts
 * import { splitToPages } from '@/lib/generation/split-to-pages';
 * import type { HomepageConfig } from '@/app/langgraph/agents/schemas';
 *
 * const homepageConfig: HomepageConfig = { ... };
 * const websiteConfig = splitToPages(homepageConfig);
 *
 * // Access pages
 * websiteConfig.pages.homepage.components;
 * websiteConfig.pages.rooms.components;
 * websiteConfig.pages.roomDetail['deluxe-suite'].components;
 * ```
 */

import { z } from 'zod';
import type { HomepageConfig } from '@/app/langgraph/agents/schemas';
import { HomepageConfigSchema } from '@/app/langgraph/agents/schemas';
import { SectionWrapperContract } from '@/lib/contracts/section-wrapper.contract';

/**
 * Component type from HomepageConfigSchema
 *
 * Represents a single component in the homepage configuration.
 * Used across all pages in WebsiteConfig.
 */
export interface Component {
  /** Component type identifier */
  type: ComponentType;
  /** Variant configuration (style, layout, etc.) */
  variant: Record<string, string | number | boolean>;
  /** Component props (content data) */
  props: Record<string, unknown>;
  /** Display order on the page */
  order: number;
  /** Optional section wrapper configuration (Story 18.5) */
  wrapper?: z.infer<typeof SectionWrapperContract>;
}

/**
 * Component type enum
 *
 * All possible component types that can appear in a HomepageConfig.
 * Matches the enum defined in HomepageConfigSchema.
 */
export type ComponentType =
  | 'hero'
  | 'navigation'
  | 'rooms'
  | 'gallery'
  | 'testimonials'
  | 'amenities'
  | 'booking'
  | 'contact'
  | 'about'
  | 'faq'
  | 'features'
  | 'footer'
  | 'linkButton'; // Added for Issue #4: View More buttons in preview mode

/**
 * Hash to page-based link mapping
 *
 * Maps single-page hash-based navigation links to multi-page routes.
 * This transformation is applied during splitToPages() to update navigation
 * components for the multi-page architecture.
 *
 * @example
 * ```ts
 * transformHashToPageLink("#about") // "/about"
 * transformHashToPageLink("#rooms") // "/rooms"
 * transformHashToPageLink("/existing-link") // "/existing-link" (unchanged)
 * ```
 */
const HASH_TO_PAGE_LINK_MAP: Record<string, string> = {
  '#about': '/about',
  '#rooms': '/rooms',
  '#amenities': '/amenities',
  '#gallery': '/gallery',
  '#booking': '/booking',
  '#contact': '/contact',
  '#reviews': '/reviews',
  '#faq': '/faq',
  // Legacy mappings (testimonials vs reviews)
  '#testimonials': '/reviews',
};

/**
 * Transform a hash-based link to a page-based link
 *
 * @param href - The original href (may be hash-based or already page-based)
 * @returns The transformed href (page-based if hash was mapped, otherwise unchanged)
 */
function transformHashToPageLink(href: string): string {
  // If already a page-based link (starts with /), return as-is
  if (href.startsWith('/')) {
    return href;
  }

  // If it's a hash link in our mapping, transform it
  if (href.startsWith('#') && HASH_TO_PAGE_LINK_MAP[href]) {
    return HASH_TO_PAGE_LINK_MAP[href];
  }

  // Otherwise return as-is (external links, anchors, etc.)
  return href;
}

/**
 * Transform navigation component links from hash-based to page-based
 *
 * Updates both the links array and ctaButton href if present.
 * This function creates a shallow copy of the component to avoid mutating
 * the original component object.
 *
 * @param component - The navigation component to transform
 * @returns A new navigation component with transformed links
 */
function transformNavigationLinks(component: Component): Component {
  if (component.type !== 'navigation') {
    return component;
  }

  // Transform links array
  const links = (component.props.links as Array<{ label: string; href: string }>) || [];
  const transformedLinks = links.map(link => ({
    ...link,
    href: transformHashToPageLink(link.href),
  }));

  // Transform ctaButton if present
  const ctaButton = component.props.ctaButton as { text: string; href: string } | undefined;
  const transformedCtaButton = ctaButton
    ? {
        ...ctaButton,
        href: transformHashToPageLink(ctaButton.href),
      }
    : undefined;

  // Return new component with transformed links
  return {
    ...component,
    props: {
      ...component.props,
      links: transformedLinks,
      ctaButton: transformedCtaButton,
    },
  };
}

/**
 * Create a LinkButton component for "View More" buttons
 *
 * Issue #4: Adds View More buttons to teaser sections in preview mode.
 * These buttons link from teaser sections to their full dedicated pages.
 *
 * @param text - Button text (e.g., "View Full Gallery")
 * @param href - Link destination (e.g., "/gallery")
 * @param ariaLabel - Accessibility label for the button
 * @param order - Display order in the component list
 * @returns A LinkButton component
 */
function createLinkButton(
  text: string,
  href: string,
  ariaLabel: string,
  order: number
): Component {
  return {
    type: 'linkButton',
    variant: { style: 'primary' },
    props: {
      text,
      href,
      ariaLabel,
      center: true,
    },
    order,
  };
}

/**
 * Page type enum
 *
 * All page types in the multi-page website architecture.
 * Matches the page structure established in Epic 24.
 */
export type PageType =
  | 'homepage'
  | 'rooms'
  | 'roomDetail'
  | 'gallery'
  | 'amenities'
  | 'reviews'
  | 'contact'
  | 'about'
  | 'faq';

/**
 * Page configuration
 *
 * Defines the structure of a single page in the website.
 * Contains an array of components and optional metadata.
 */
export interface PageConfig {
  /** Components to render on this page */
  components: Component[];
  /** Optional page title (for SEO) - populated by Story 25.4 pageMetadata */
  title?: string;
  /** Optional page description (for SEO) - populated by Story 25.4 pageMetadata */
  description?: string;
}

/**
 * Room detail page configuration
 *
 * Extends PageConfig with the original room data for reference.
 * Used for individual room detail pages keyed by room slug.
 */
export interface RoomDetailPageConfig extends PageConfig {
  /** Original room data from ContentGeneratorOutput */
  room: RoomData;
}

/**
 * Room data from ContentGeneratorOutput
 *
 * Subset of the room data structure needed for room detail pages.
 */
export interface RoomData {
  /** Room unique identifier */
  id: string;
  /** Room name */
  name: string;
  /** Room type/category */
  type: string;
  /** Nightly rate */
  price: number;
  /** Guest capacity */
  capacity: number;
  /** Optional room amenities */
  amenities?: string[];
  /** Optional featured image */
  image?: string;
  /** Optional room description */
  description?: string;
}

/**
 * Website configuration
 *
 * Multi-page website configuration wrapping the original HomepageConfig.
 * Provides page-level organization of components while preserving
 * the original single-page configuration as the source.
 */
export interface WebsiteConfig {
  /**
   * Page configurations keyed by page type
   *
   * - homepage: Curated landing page with teasers
   * - rooms: Full rooms listing
   * - roomDetail: Map of room slug → room detail page
   * - gallery, amenities, reviews, contact, about, faq: Dedicated pages
   */
  pages: {
    homepage: PageConfig;
    rooms: PageConfig;
    roomDetail: Record<string, RoomDetailPageConfig>;
    gallery: PageConfig;
    amenities: PageConfig;
    reviews: PageConfig;
    contact: PageConfig;
    about: PageConfig;
    faq: PageConfig;
  };
  /**
   * Original HomepageConfig (source)
   *
   * Preserves the complete single-page configuration.
   * Enables fallback to single-page rendering and full audit trail.
   */
  source: HomepageConfig;
}

/**
 * Component schema (Zod)
 *
 * Validates component structure matching HomepageConfigSchema.
 * Issue #4: Added 'linkButton' for View More buttons in teaser sections.
 */
const ComponentSchema: z.ZodType<Component> = z.object({
  type: z.enum([
    'hero',
    'navigation',
    'rooms',
    'gallery',
    'testimonials',
    'amenities',
    'booking',
    'contact',
    'about',
    'faq',
    'features',
    'footer',
    'linkButton', // Issue #4: Added for View More buttons
  ]),
  variant: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  props: z.record(z.string(), z.any()),
  order: z.number().min(0),
  wrapper: SectionWrapperContract.optional(),
}) as z.ZodType<Component>;

/**
 * Room data schema (Zod)
 *
 * Validates room data structure for room detail pages.
 */
const RoomDataSchema: z.ZodType<RoomData> = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  type: z.string(),
  price: z.number().positive(),
  capacity: z.number().positive().max(10),
  amenities: z.array(z.string()).optional(),
  image: z.string().optional(),
  description: z.string().max(500).optional(),
}) as z.ZodType<RoomData>;

/**
 * Page configuration schema (Zod)
 *
 * Validates page structure with components and optional metadata.
 */
export const PageConfigSchema: z.ZodType<PageConfig> = z.object({
  components: z.array(ComponentSchema),
  title: z.string().optional(),
  description: z.string().optional(),
});

/**
 * Room detail page configuration schema (Zod)
 *
 * Validates room detail page structure with room data.
 */
const RoomDetailPageConfigSchema: z.ZodType<RoomDetailPageConfig> = z.object({
  components: z.array(ComponentSchema),
  title: z.string().optional(),
  description: z.string().optional(),
  room: RoomDataSchema,
});

/**
 * Website configuration schema (Zod)
 *
 * Validates the complete multi-page website configuration.
 * Wraps HomepageConfig as the source field.
 *
 * ## Validation Rules
 *
 * - All 9 page keys must be present
 * - roomDetail must be a Record<string, RoomDetailPageConfig>
 * - source must be a valid HomepageConfig
 * - Uses .passthrough() to allow additional fields
 */
export const WebsiteConfigSchema: z.ZodType<WebsiteConfig> = z.object({
  pages: z.object({
    homepage: PageConfigSchema,
    rooms: PageConfigSchema,
    roomDetail: z.record(z.string(), RoomDetailPageConfigSchema),
    gallery: PageConfigSchema,
    amenities: PageConfigSchema,
    reviews: PageConfigSchema,
    contact: PageConfigSchema,
    about: PageConfigSchema,
    faq: PageConfigSchema,
  }),
  // Use the actual HomepageConfigSchema from agents/schemas.ts
  source: HomepageConfigSchema,
}).passthrough();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Slugify a string for URL-safe usage.
 *
 * Transforms a room name into a kebab-case, lowercase, URL-safe string
 * following the same convention as Epic 24 Story 24.1.
 *
 * ## Transformation Rules
 *
 * 1. Convert to lowercase
 * 2. Replace non-alphanumeric characters with hyphens
 * 3. Trim leading/trailing hyphens
 * 4. Collapse consecutive hyphens to single hyphen
 *
 * ## Deterministic
 *
 * Same input always produces same output. Critical for reproducibility
 * in room slug generation and testing.
 *
 * @param input - The string to slugify (typically a room name)
 * @returns The slugified string
 *
 * @example
 * ```ts
 * slugify('Deluxe Ocean Suite') // 'deluxe-ocean-suite'
 * slugify('The Grand Hotel & Spa') // 'the-grand-hotel-spa'
 * slugify('Room 123!') // 'room-123'
 * slugify('  Multiple   Spaces  ') // 'multiple-spaces'
 * ```
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Find components by type from a HomepageConfig.
 *
 * Filters the components array to return only components matching
 * the specified type. Returns an empty array if no matches found.
 *
 * ## Type Safety
 *
 * Uses the ComponentType union to ensure only valid component types
 * are requested at compile time.
 *
 * @param config - The HomepageConfig to search
 * @param type - The component type to filter by
 * @returns Array of components matching the type (empty array if none)
 *
 * @example
 * ```ts
 * const heroComponents = findComponentsByType(config, 'hero');
 * const roomComponents = findComponentsByType(config, 'rooms');
 * ```
 */
function findComponentsByType(
  config: HomepageConfig,
  type: ComponentType
): Component[] {
  return config.components.filter((component) => component.type === type);
}

/**
 * Limit components to a maximum count.
 *
 * Returns the first N components from the array. Handles edge cases:
 * - If count exceeds array length, returns entire array
 * - If array is empty, returns empty array
 * - If count is 0, returns empty array
 *
 * ## Use Case
 *
 * Used for homepage teaser content where we show limited items:
 * - Rooms: limited to 3 cards
 * - Gallery: limited to 6 images
 * - Amenities: limited to 8 items
 *
 * @param components - The components array to limit
 * @param count - Maximum number of components to return
 * @returns Array of at most `count` components
 *
 * @example
 * ```ts
 * const allRooms = findComponentsByType(config, 'rooms');
 * const teaserRooms = limitComponents(allRooms, 3); // First 3 rooms only
 * ```
 */
function limitComponents(components: Component[], count: number): Component[] {
  return components.slice(0, Math.max(0, count));
}

/**
 * Generate unique slugs for all rooms.
 *
 * Creates a mapping of room ID to slug, ensuring uniqueness by
 * appending numeric suffixes (-2, -3, etc.) when collisions occur.
 *
 * ## Algorithm
 *
 * 1. Generate base slug for each room using slugify()
 * 2. Track seen slugs in a Set for collision detection
 * 3. First occurrence of each slug keeps the base slug
 * 4. Subsequent collisions get -2, -3, etc. appended
 * 5. Returns Record<roomId, slug> mapping
 *
 * ## Deterministic
 *
 * Same input always produces same output. Slug suffixes are
 * assigned in array order, making collisions predictable.
 *
 * @param rooms - Array of room data from ContentGeneratorOutput
 * @returns Record mapping room ID to unique slug
 *
 * @example
 * ```ts
 * const rooms = [
 *   { id: 'r1', name: 'Deluxe Suite' },
 *   { id: 'r2', name: 'Deluxe Suite' },
 *   { id: 'r3', name: 'Garden View' }
 * ];
 * const slugs = generateRoomSlugs(rooms);
 * // { r1: 'deluxe-suite', r2: 'deluxe-suite-2', r3: 'garden-view' }
 * ```
 */
function generateRoomSlugs(rooms: RoomData[]): Record<string, string> {
  const slugs: Record<string, string> = {};
  const seen = new Map<string, number>(); // slug -> count

  for (const room of rooms) {
    const baseSlug = slugify(room.name);
    const count = seen.get(baseSlug) || 0;

    if (count === 0) {
      // First occurrence - use base slug
      slugs[room.id] = baseSlug;
    } else {
      // Collision - append suffix
      slugs[room.id] = `${baseSlug}-${count + 1}`;
    }

    seen.set(baseSlug, count + 1);
  }

  return slugs;
}

/**
 * Check if a component type is navigation or footer.
 *
 * Type guard to identify components that should appear on every page.
 * Navigation and footer are shared across all pages in the site.
 *
 * @param type - The component type to check
 * @returns true if the type is navigation or footer
 */
function isNavigationOrFooter(type: ComponentType): boolean {
  return type === 'navigation' || type === 'footer';
}

/**
 * Extract room data from components.
 *
 * Finds the rooms component and extracts the room data array.
 * Returns empty array if no rooms component exists.
 *
 * @param config - The HomepageConfig to extract from
 * @returns Array of room data
 */
function extractRoomData(config: HomepageConfig): RoomData[] {
  const roomsComponent = findComponentsByType(config, 'rooms').find(
    (c) => c.type === 'rooms'
  );

  if (!roomsComponent || !roomsComponent.props.rooms) {
    return [];
  }

  // Extract room data from component props
  const rooms = roomsComponent.props.rooms as Array<RoomData>;
  return rooms || [];
}

// ============================================================================
// CORE FUNCTION
// ============================================================================

/**
 * Transform HomepageConfig to WebsiteConfig.
 *
 * Distributes HomepageConfig components across multiple pages following
 * the multi-page architecture established in Epic 24. This is a pure,
 * deterministic function with no side effects.
 *
 * ## Content Distribution Rules
 *
 * ### Homepage Page (Teaser Content)
 * - Hero: full component
 * - Navigation: full component
 * - Rooms: limited to 3 cards
 * - Gallery: limited to 6 images
 * - Amenities: limited to 8 items
 * - Footer: full component
 * - Other components: included as-is
 *
 * ### Dedicated Pages (Full Content)
 * - rooms: all rooms component
 * - roomDetail: map by room slug (one page per room)
 * - gallery: all gallery images
 * - amenities: all amenities
 * - reviews: all testimonials (remapped from 'testimonials' type)
 * - contact: contact component
 * - about: about component
 * - faq: faq component
 *
 * ### Shared Components
 * - Navigation and footer appear on every page
 *
 * ## Empty Page Handling
 *
 * If a component type is missing from HomepageConfig, the corresponding
 * page still exists in the output but has an empty components array
 * (except navigation/footer which are added if present).
 *
 * @param config - The HomepageConfig to transform
 * @returns A WebsiteConfig with pages organized by type
 *
 * @example
 * ```ts
 * const config: HomepageConfig = {
 *   generationId: 'hotel-v1',
 *   timestamp: '2024-03-24T...',
 *   hotelParameters: { ... },
 *   components: [
 *     { type: 'hero', ... },
 *     { type: 'rooms', props: { rooms: [room1, room2, room3] }, ... },
 *     { type: 'testimonials', ... },
 *     ...
 *   ],
 *   ...
 * };
 *
 * const websiteConfig = splitToPages(config);
 *
 * // Access pages
 * websiteConfig.pages.homepage.components; // Hero + 3 rooms teaser + nav + footer
 * websiteConfig.pages.rooms.components; // Full rooms component
 * websiteConfig.pages.roomDetail['deluxe-ocean-suite'].components; // Room detail
 * ```
 */
export function splitToPages(config: HomepageConfig): WebsiteConfig {
  // Extract shared components (navigation and footer)
  const navigationComponents = findComponentsByType(config, 'navigation');
  // Transform navigation links from hash-based to page-based (Issue #2 fix)
  const transformedNavigationComponents = navigationComponents.map(transformNavigationLinks);
  const footerComponents = findComponentsByType(config, 'footer');
  const sharedComponents = [...transformedNavigationComponents, ...footerComponents];

  // Extract room data and generate slugs
  const roomData = extractRoomData(config);
  const roomSlugs = generateRoomSlugs(roomData);

  // Create room slug to room data mapping for detail pages
  const roomSlugToData = new Map<string, RoomData>();
  for (const room of roomData) {
    const slug = roomSlugs[room.id];
    if (slug) {
      roomSlugToData.set(slug, room);
    }
  }

  // ============================================================================
  // BUILD HOMEPAGE PAGE (with teaser content)
  // ============================================================================

  const homepageComponents: Component[] = [];

  // Add hero (full, if present)
  const heroComponents = findComponentsByType(config, 'hero');
  homepageComponents.push(...heroComponents);

  // Add navigation (always, if present)
  homepageComponents.push(...transformedNavigationComponents);

  // Add rooms (limited to 3 for teaser)
  const roomsComponents = findComponentsByType(config, 'rooms');
  const limitedRooms = limitComponents(roomsComponents, 3);
  homepageComponents.push(...limitedRooms);

  // Issue #4: Add "View All Rooms" button after rooms teaser
  if (roomsComponents.length > 0) {
    const maxOrder = Math.max(...homepageComponents.map(c => c.order));
    homepageComponents.push(
      createLinkButton('View All Rooms', '/rooms', 'View all rooms and suites', maxOrder + 1)
    );
  }

  // Add gallery (limited to 6 for teaser)
  const galleryComponents = findComponentsByType(config, 'gallery');
  const limitedGallery = limitComponents(galleryComponents, 6);
  homepageComponents.push(...limitedGallery);

  // Issue #4: Add "View Full Gallery" button after gallery teaser
  if (galleryComponents.length > 0) {
    const maxOrder = Math.max(...homepageComponents.map(c => c.order));
    homepageComponents.push(
      createLinkButton('View Full Gallery', '/gallery', 'View full photo gallery', maxOrder + 1)
    );
  }

  // Add amenities (limited to 8 for teaser)
  const amenitiesComponents = findComponentsByType(config, 'amenities');
  const limitedAmenities = limitComponents(amenitiesComponents, 8);
  homepageComponents.push(...limitedAmenities);

  // Issue #4: Add "View All Amenities" button after amenities teaser
  if (amenitiesComponents.length > 0) {
    const maxOrder = Math.max(...homepageComponents.map(c => c.order));
    homepageComponents.push(
      createLinkButton('View All Amenities', '/amenities', 'View all amenities and facilities', maxOrder + 1)
    );
  }

  // Add all other components as-is (booking, testimonials, contact, about, faq, features)
  const otherComponentTypes: ComponentType[] = [
    'booking',
    'testimonials',
    'contact',
    'about',
    'faq',
    'features',
  ];
  for (const type of otherComponentTypes) {
    const components = findComponentsByType(config, type);
    homepageComponents.push(...components);
  }

  // Add footer (always, if present)
  homepageComponents.push(...footerComponents);

  // Sort by order property
  homepageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // BUILD ROOMS PAGE (full content)
  // ============================================================================

  const roomsPageComponents: Component[] = [
    ...transformedNavigationComponents,
    ...roomsComponents,
    ...footerComponents,
  ];
  roomsPageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // BUILD ROOM DETAIL PAGES (one per room)
  // ============================================================================

  const roomDetailPages: Record<string, RoomDetailPageConfig> = {};

  for (const room of roomData) {
    const slug = roomSlugs[room.id];
    if (!slug) continue;

    // Create a rooms component for this specific room
    // The component props contain all rooms, but rendering will filter by slug
    const roomDetailComponents: Component[] = [
      ...transformedNavigationComponents,
      ...roomsComponents, // Full rooms component - renderer filters by slug
      ...footerComponents,
    ];
    roomDetailComponents.sort((a, b) => a.order - b.order);

    roomDetailPages[slug] = {
      components: roomDetailComponents,
      room,
    };
  }

  // ============================================================================
  // BUILD GALLERY PAGE (full content)
  // ============================================================================

  const galleryPageComponents: Component[] = [
    ...transformedNavigationComponents,
    ...galleryComponents,
    ...footerComponents,
  ];
  galleryPageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // BUILD AMENITIES PAGE (full content)
  // ============================================================================

  const amenitiesPageComponents: Component[] = [
    ...transformedNavigationComponents,
    ...amenitiesComponents,
    ...footerComponents,
  ];
  amenitiesPageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // BUILD REVIEWS PAGE (testimonials remapped)
  // ============================================================================

  const testimonialsComponents = findComponentsByType(config, 'testimonials');
  const reviewsPageComponents: Component[] = [
    ...transformedNavigationComponents,
    ...testimonialsComponents,
    ...footerComponents,
  ];
  reviewsPageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // BUILD CONTACT PAGE
  // ============================================================================

  const contactComponents = findComponentsByType(config, 'contact');
  const contactPageComponents: Component[] = [
    ...transformedNavigationComponents,
    ...contactComponents,
    ...footerComponents,
  ];
  contactPageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // BUILD ABOUT PAGE
  // ============================================================================

  const aboutComponents = findComponentsByType(config, 'about');
  const aboutPageComponents: Component[] = [
    ...transformedNavigationComponents,
    ...aboutComponents,
    ...footerComponents,
  ];
  aboutPageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // BUILD FAQ PAGE
  // ============================================================================

  const faqComponents = findComponentsByType(config, 'faq');
  const faqPageComponents: Component[] = [
    ...transformedNavigationComponents,
    ...faqComponents,
    ...footerComponents,
  ];
  faqPageComponents.sort((a, b) => a.order - b.order);

  // ============================================================================
  // CONSTRUCT WEBSITE CONFIG
  // ============================================================================

  return {
    pages: {
      homepage: {
        components: homepageComponents,
      },
      rooms: {
        components: roomsPageComponents,
      },
      roomDetail: roomDetailPages,
      gallery: {
        components: galleryPageComponents,
      },
      amenities: {
        components: amenitiesPageComponents,
      },
      reviews: {
        components: reviewsPageComponents,
      },
      contact: {
        components: contactPageComponents,
      },
      about: {
        components: aboutPageComponents,
      },
      faq: {
        components: faqPageComponents,
      },
    },
    source: config,
  };
}
