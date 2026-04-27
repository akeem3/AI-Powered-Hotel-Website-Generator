/**
 * Story 25.1: WebsiteConfigSchema and splitToPages() Utility Tests
 *
 * Story 25.7: Test Updates for Multi-Page Generation
 *
 * Tests the splitToPages() function that transforms a single-page HomepageConfig
 * into a multi-page WebsiteConfig following Epic 24's multi-page architecture.
 */

import { splitToPages, WebsiteConfigSchema } from '@/lib/generation/split-to-pages';
import type { HomepageConfig } from '@/app/langgraph/agents/schemas';
import type { Component } from '@/lib/generation/split-to-pages';

describe('Story 25.1 - WebsiteConfigSchema and splitToPages()', () => {
  // ============================================================================
  // FIXTURES
  // ============================================================================

  /**
   * Creates a valid minimal HomepageConfig with 5 components (minimum allowed)
   */
  const createMinimalConfig = (): HomepageConfig => ({
    generationId: 'test-hotel-v1',
    timestamp: '2026-03-24T12:00:00Z',
    hotelParameters: {
      hotelType: 'luxury',
      targetAudience: 'leisure',
      brandPersonality: 'elegant',
      hotelName: 'Test Grand Hotel',
      location: 'Paris, France',
    },
    components: [
      {
        type: 'hero',
        variant: { style: 'classic' },
        props: { title: 'Welcome' },
        order: 0,
      },
      {
        type: 'navigation',
        variant: { layout: 'classic' },
        props: {},
        order: 1,
      },
      {
        type: 'rooms',
        variant: {},
        props: { rooms: [] },
        order: 2,
      },
      {
        type: 'footer',
        variant: {},
        props: {},
        order: 3,
      },
      {
        type: 'features',
        variant: {},
        props: {},
        order: 4,
      },
    ],
    layoutStructure: 'single-column',
    emphasisComponents: [],
    validationStatus: 'PASS',
  });

  /**
   * Creates a complete HomepageConfig with all 12 component types
   */
  const createFullConfig = (): HomepageConfig => ({
    generationId: 'test-full-v1',
    timestamp: '2026-03-24T12:00:00Z',
    hotelParameters: {
      hotelType: 'resort',
      targetAudience: 'family',
      brandPersonality: 'friendly',
      hotelName: 'Test Resort',
      location: 'Bali, Indonesia',
    },
    components: [
      {
        type: 'hero',
        variant: {},
        props: { title: 'Welcome to Paradise' },
        order: 0,
      },
      {
        type: 'navigation',
        variant: {},
        props: {},
        order: 1,
      },
      {
        type: 'rooms',
        variant: {},
        props: {
          rooms: [
            { id: 'room1', name: 'Deluxe Suite', type: 'suite', price: 500, capacity: 2 },
            { id: 'room2', name: 'Garden Villa', type: 'villa', price: 350, capacity: 4 },
            { id: 'room3', name: 'Ocean View', type: 'room', price: 200, capacity: 2 },
          ],
        },
        order: 2,
      },
      {
        type: 'gallery',
        variant: {},
        props: {
          images: [
            { id: 'img1', src: '/img1.jpg', alt: 'Pool' },
            { id: 'img2', src: '/img2.jpg', alt: 'Beach' },
            { id: 'img3', src: '/img3.jpg', alt: 'Garden' },
          ],
        },
        order: 3,
      },
      {
        type: 'testimonials',
        variant: {},
        props: {
          testimonials: [
            { id: 't1', customerName: 'John', rating: 5, quote: 'Amazing!' },
          ],
        },
        order: 4,
      },
      {
        type: 'amenities',
        variant: {},
        props: {
          amenities: [
            { id: 'a1', name: 'Pool', category: 'hotel' },
            { id: 'a2', name: 'Spa', category: 'services' },
            { id: 'a3', name: 'WiFi', category: 'room' },
            { id: 'a4', name: 'Gym', category: 'hotel' },
            { id: 'a5', name: 'Restaurant', category: 'services' },
          ],
        },
        order: 5,
      },
      {
        type: 'booking',
        variant: {},
        props: {},
        order: 6,
      },
      {
        type: 'contact',
        variant: {},
        props: {},
        order: 7,
      },
      {
        type: 'about',
        variant: {},
        props: {},
        order: 8,
      },
      {
        type: 'faq',
        variant: {},
        props: {},
        order: 9,
      },
      {
        type: 'features',
        variant: {},
        props: {},
        order: 10,
      },
      {
        type: 'footer',
        variant: {},
        props: {},
        order: 11,
      },
    ],
    layoutStructure: 'mixed',
    emphasisComponents: ['hero', 'rooms'],
    validationStatus: 'PASS',
  });

  /**
   * Creates a config without about and faq components (minimum 5 components)
   */
  const createConfigWithoutAboutFaq = (): HomepageConfig => ({
    generationId: 'test-missing-v1',
    timestamp: '2026-03-24T12:00:00Z',
    hotelParameters: {
      hotelType: 'business',
      targetAudience: 'business',
      brandPersonality: 'professional',
      hotelName: 'Test Business Hotel',
      location: 'New York, USA',
    },
    components: [
      { type: 'hero', variant: {}, props: {}, order: 0 },
      { type: 'navigation', variant: {}, props: {}, order: 1 },
      { type: 'rooms', variant: {}, props: { rooms: [] }, order: 2 },
      { type: 'features', variant: {}, props: {}, order: 3 },
      { type: 'footer', variant: {}, props: {}, order: 4 },
    ],
    layoutStructure: 'single-column',
    emphasisComponents: [],
    validationStatus: 'PASS',
  });

  /**
   * Creates a config with a single room
   */
  const createConfigWithOneRoom = (): HomepageConfig => ({
    generationId: 'test-one-room-v1',
    timestamp: '2026-03-24T12:00:00Z',
    hotelParameters: {
      hotelType: 'boutique',
      targetAudience: 'couples',
      brandPersonality: 'romantic',
      hotelName: 'Test Boutique',
      location: 'Santorini, Greece',
    },
    components: [
      { type: 'hero', variant: {}, props: {}, order: 0 },
      { type: 'navigation', variant: {}, props: {}, order: 1 },
      {
        type: 'rooms',
        variant: {},
        props: {
          rooms: [{ id: 'room1', name: 'Honeymoon Suite', type: 'suite', price: 400, capacity: 2 }],
        },
        order: 2,
      },
      { type: 'footer', variant: {}, props: {}, order: 3 },
    ],
    layoutStructure: 'single-column',
    emphasisComponents: [],
    validationStatus: 'PASS',
  });

  /**
   * Creates a config with 20 rooms (maximum realistic volume)
   */
  const createConfigWith20Rooms = (): HomepageConfig => {
    const rooms = Array.from({ length: 20 }, (_, i) => ({
      id: `room${i + 1}`,
      name: `Room Type ${i + 1}`,
      type: 'standard',
      price: 100 + i * 10,
      capacity: 2,
    }));

    return {
      generationId: 'test-20-rooms-v1',
      timestamp: '2026-03-24T12:00:00Z',
      hotelParameters: {
        hotelType: 'resort',
        targetAudience: 'family',
        brandPersonality: 'friendly',
        hotelName: 'Test Resort',
        location: 'Orlando, USA',
      },
      components: [
        { type: 'hero', variant: {}, props: {}, order: 0 },
        { type: 'navigation', variant: {}, props: {}, order: 1 },
        { type: 'rooms', variant: {}, props: { rooms }, order: 2 },
        { type: 'footer', variant: {}, props: {}, order: 3 },
      ],
      layoutStructure: 'single-column',
      emphasisComponents: [],
      validationStatus: 'PASS',
    };
  };

  // ============================================================================
  // ACCEPTANCE CRITERIA TESTS
  // ============================================================================

  describe('AC1: Config with all components - all pages populated', () => {
    it('should create all page types with appropriate components', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      // All page keys must exist
      expect(result.pages).toHaveProperty('homepage');
      expect(result.pages).toHaveProperty('rooms');
      expect(result.pages).toHaveProperty('roomDetail');
      expect(result.pages).toHaveProperty('gallery');
      expect(result.pages).toHaveProperty('amenities');
      expect(result.pages).toHaveProperty('reviews');
      expect(result.pages).toHaveProperty('contact');
      expect(result.pages).toHaveProperty('about');
      expect(result.pages).toHaveProperty('faq');
    });

    it('should populate homepage with teaser content (rooms limited to 3)', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      // Homepage should have navigation, hero, limited rooms
      const homepageRoomComponents = result.pages.homepage.components.filter(
        (c) => c.type === 'rooms'
      );
      expect(homepageRoomComponents).toHaveLength(1); // 1 rooms component
      // The rooms component props should have the rooms array
      expect(homepageRoomComponents[0].props.rooms).toHaveLength(3); // Limited to 3
    });

    it('should populate rooms page with full content', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const roomComponents = result.pages.rooms.components.filter(
        (c) => c.type === 'rooms'
      );
      expect(roomComponents).toHaveLength(1);
      // All rooms should be present (not limited)
      expect(roomComponents[0].props.rooms).toHaveLength(3);
    });

    it('should populate roomDetail pages - one per room', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      // Should have 3 room detail pages
      expect(Object.keys(result.pages.roomDetail)).toHaveLength(3);

      // Each room detail should have room data
      Object.values(result.pages.roomDetail).forEach((roomDetail) => {
        expect(roomDetail.room).toBeDefined();
        expect(roomDetail.room.id).toBeDefined();
        expect(roomDetail.room.name).toBeDefined();
      });
    });

    it('should populate gallery page with full content', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const galleryComponents = result.pages.gallery.components.filter(
        (c) => c.type === 'gallery'
      );
      expect(galleryComponents).toHaveLength(1);
    });

    it('should populate amenities page with full content', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const amenitiesComponents = result.pages.amenities.components.filter(
        (c) => c.type === 'amenities'
      );
      expect(amenitiesComponents).toHaveLength(1);
      expect(amenitiesComponents[0].props.amenities).toHaveLength(5);
    });

    it('should populate reviews page (testimonials remapped)', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const reviewsComponents = result.pages.reviews.components.filter(
        (c) => c.type === 'testimonials'
      );
      expect(reviewsComponents).toHaveLength(1);
    });

    it('should populate contact page', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const contactComponents = result.pages.contact.components.filter(
        (c) => c.type === 'contact'
      );
      expect(contactComponents).toHaveLength(1);
    });

    it('should populate about page', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const aboutComponents = result.pages.about.components.filter(
        (c) => c.type === 'about'
      );
      expect(aboutComponents).toHaveLength(1);
    });

    it('should populate faq page', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const faqComponents = result.pages.faq.components.filter(
        (c) => c.type === 'faq'
      );
      expect(faqComponents).toHaveLength(1);
    });
  });

  describe('AC2: Navigation and footer appear on every page', () => {
    it('should add navigation to all pages', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      // Check navigation is on each page
      const pages: (keyof typeof result.pages)[] = [
        'homepage',
        'rooms',
        'gallery',
        'amenities',
        'reviews',
        'contact',
        'about',
        'faq',
      ];

      pages.forEach((pageKey) => {
        const navComponents = result.pages[pageKey].components.filter(
          (c) => c.type === 'navigation'
        );
        expect(navComponents).toHaveLength(1);
      });
    });

    it('should add footer to all pages', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const pages: (keyof typeof result.pages)[] = [
        'homepage',
        'rooms',
        'gallery',
        'amenities',
        'reviews',
        'contact',
        'about',
        'faq',
      ];

      pages.forEach((pageKey) => {
        const footerComponents = result.pages[pageKey].components.filter(
          (c) => c.type === 'footer'
        );
        expect(footerComponents).toHaveLength(1);
      });
    });
  });

  describe('AC3: Homepage teaser limits', () => {
    it('should limit rooms teaser to 3 on homepage', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const homepageRoomComponents = result.pages.homepage.components.filter(
        (c) => c.type === 'rooms'
      );
      expect(homepageRoomComponents).toHaveLength(1);
      // Props should have rooms limited to 3
      expect(homepageRoomComponents[0].props.rooms?.length).toBeLessThanOrEqual(3);
    });

    it('should limit gallery teaser to 6 on homepage', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const homepageGalleryComponents = result.pages.homepage.components.filter(
        (c) => c.type === 'gallery'
      );
      expect(homepageGalleryComponents).toHaveLength(1);
      expect(homepageGalleryComponents[0].props.images?.length).toBeLessThanOrEqual(6);
    });

    it('should limit amenities teaser to 8 on homepage', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const homepageAmenitiesComponents = result.pages.homepage.components.filter(
        (c) => c.type === 'amenities'
      );
      expect(homepageAmenitiesComponents).toHaveLength(1);
      expect(homepageAmenitiesComponents[0].props.amenities?.length).toBeLessThanOrEqual(8);
    });
  });

  describe('AC4: Missing components create empty pages', () => {
    it('should create about page with only navigation and footer when about component is missing', () => {
      const config = createConfigWithoutAboutFaq();
      const result = splitToPages(config);

      expect(result.pages.about).toBeDefined();
      // Should have navigation and footer (shared components), but no about component
      const aboutComponents = result.pages.about.components.filter(
        (c) => c.type === 'about'
      );
      expect(aboutComponents).toHaveLength(0);
    });

    it('should create faq page with only navigation and footer when faq component is missing', () => {
      const config = createConfigWithoutAboutFaq();
      const result = splitToPages(config);

      expect(result.pages.faq).toBeDefined();
      // Should have navigation and footer, but no faq component
      const faqComponents = result.pages.faq.components.filter(
        (c) => c.type === 'faq'
      );
      expect(faqComponents).toHaveLength(0);
    });

    it('should create gallery page with only navigation and footer when gallery component is missing', () => {
      const config = createMinimalConfig();
      const result = splitToPages(config);

      expect(result.pages.gallery).toBeDefined();
      // Should have navigation and footer, but no gallery component
      const galleryComponents = result.pages.gallery.components.filter(
        (c) => c.type === 'gallery'
      );
      expect(galleryComponents).toHaveLength(0);
    });

    it('should create amenities page with only navigation and footer when amenities component is missing', () => {
      const config = createMinimalConfig();
      const result = splitToPages(config);

      expect(result.pages.amenities).toBeDefined();
      // Should have navigation and footer, but no amenities component
      const amenitiesComponents = result.pages.amenities.components.filter(
        (c) => c.type === 'amenities'
      );
      expect(amenitiesComponents).toHaveLength(0);
    });
  });

  // ============================================================================
  // STORY 25.7: EDGE CASE TESTS
  // ============================================================================

  describe('Edge Case: Minimum 5 components', () => {
    it('should create all pages even with only 5 components', () => {
      const config = createMinimalConfig();
      const result = splitToPages(config);

      // All 9 page keys must exist
      const expectedPages = [
        'homepage',
        'rooms',
        'roomDetail',
        'gallery',
        'amenities',
        'reviews',
        'contact',
        'about',
        'faq',
      ];

      expectedPages.forEach((pageKey) => {
        expect(result.pages).toHaveProperty(pageKey);
      });
    });

    it('should preserve navigation and footer from minimal config', () => {
      const config = createMinimalConfig();
      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.filter(
        (c) => c.type === 'navigation'
      );
      const homepageFooter = result.pages.homepage.components.filter(
        (c) => c.type === 'footer'
      );

      expect(homepageNav).toHaveLength(1);
      expect(homepageFooter).toHaveLength(1);
    });

    it('should validate against WebsiteConfigSchema with minimal config', () => {
      const config = createMinimalConfig();
      const result = splitToPages(config);

      const validationResult = WebsiteConfigSchema.safeParse(result);
      expect(validationResult.success).toBe(true);
    });
  });

  describe('Edge Case: Single room', () => {
    it('should create rooms page with 1 room card', () => {
      const config = createConfigWithOneRoom();
      const result = splitToPages(config);

      const roomComponents = result.pages.rooms.components.filter(
        (c) => c.type === 'rooms'
      );
      expect(roomComponents).toHaveLength(1);
      expect(roomComponents[0].props.rooms).toHaveLength(1);
    });

    it('should create 1 room detail page entry', () => {
      const config = createConfigWithOneRoom();
      const result = splitToPages(config);

      expect(Object.keys(result.pages.roomDetail)).toHaveLength(1);
      expect(result.pages.roomDetail['honeymoon-suite']).toBeDefined();
      expect(result.pages.roomDetail['honeymoon-suite'].room.name).toBe('Honeymoon Suite');
    });
  });

  describe('Edge Case: 20 rooms', () => {
    it('should create rooms page with 20 room cards', () => {
      const config = createConfigWith20Rooms();
      const result = splitToPages(config);

      const roomComponents = result.pages.rooms.components.filter(
        (c) => c.type === 'rooms'
      );
      expect(roomComponents).toHaveLength(1);
      expect(roomComponents[0].props.rooms).toHaveLength(20);
    });

    it('should create 20 room detail page entries', () => {
      const config = createConfigWith20Rooms();
      const result = splitToPages(config);

      expect(Object.keys(result.pages.roomDetail)).toHaveLength(20);

      // Verify each room detail has unique slug
      const slugs = Object.keys(result.pages.roomDetail);
      const uniqueSlugs = new Set(slugs);
      expect(uniqueSlugs.size).toBe(20);
    });

    it('should generate correct slugs for room names', () => {
      const config = createConfigWith20Rooms();
      const result = splitToPages(config);

      const slugs = Object.keys(result.pages.roomDetail);

      // First room should be "room-type-1"
      expect(slugs).toContain('room-type-1');
      expect(slugs).toContain('room-type-20');
    });
  });

  describe('Edge Case: 5 amenities', () => {
    it('should include all 5 amenities on amenities page', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const amenitiesComponents = result.pages.amenities.components.filter(
        (c) => c.type === 'amenities'
      );
      expect(amenitiesComponents).toHaveLength(1);
      expect(amenitiesComponents[0].props.amenities).toHaveLength(5);
    });
  });

  describe('Edge Case: 1 gallery image', () => {
    it('should include the image on gallery page', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const galleryComponents = result.pages.gallery.components.filter(
        (c) => c.type === 'gallery'
      );
      expect(galleryComponents).toHaveLength(1);
      expect(galleryComponents[0].props.images).toBeDefined();
    });
  });

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  describe('WebsiteConfigSchema Validation', () => {
    it('should validate full config output', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      const validationResult = WebsiteConfigSchema.safeParse(result);
      expect(validationResult.success).toBe(true);
    });

    it('should validate minimal config output', () => {
      const config = createMinimalConfig();
      const result = splitToPages(config);

      const validationResult = WebsiteConfigSchema.safeParse(result);
      expect(validationResult.success).toBe(true);
    });

    it('should validate config without about/faq output', () => {
      const config = createConfigWithoutAboutFaq();
      const result = splitToPages(config);

      const validationResult = WebsiteConfigSchema.safeParse(result);
      expect(validationResult.success).toBe(true);
    });

    it('should preserve source HomepageConfig', () => {
      const config = createFullConfig();
      const result = splitToPages(config);

      expect(result.source).toEqual(config);
      expect(result.source.generationId).toBe(config.generationId);
      expect(result.source.components).toHaveLength(config.components.length);
    });
  });

  // ============================================================================
  // PURE FUNCTION TESTS
  // ============================================================================

  describe('Pure function: determinism', () => {
    it('should return identical output for same input', () => {
      const config = createFullConfig();
      const result1 = splitToPages(config);
      const result2 = splitToPages(config);

      expect(result1).toEqual(result2);
    });

    it('should not mutate input config', () => {
      const config = createFullConfig();
      const originalComponentsLength = config.components.length;

      splitToPages(config);

      expect(config.components).toHaveLength(originalComponentsLength);
    });
  });

  // ============================================================================
  // ROOM SLUG GENERATION
  // ============================================================================

  describe('Room slug generation', () => {
    it('should generate kebab-case slugs from room names', () => {
      const config: HomepageConfig = {
        generationId: 'test-slugs-v1',
        timestamp: '2026-03-24T12:00:00Z',
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'leisure',
          brandPersonality: 'elegant',
          hotelName: 'Test Hotel',
          location: 'Paris',
        },
        components: [
          { type: 'hero', variant: {}, props: {}, order: 0 },
          { type: 'navigation', variant: {}, props: {}, order: 1 },
          {
            type: 'rooms',
            variant: {},
            props: {
              rooms: [
                { id: 'r1', name: 'Deluxe Ocean Suite', type: 'suite', price: 500, capacity: 2 },
                { id: 'r2', name: 'The Grand Hotel & Spa', type: 'suite', price: 600, capacity: 2 },
              ],
            },
            order: 2,
          },
          { type: 'footer', variant: {}, props: {}, order: 3 },
        ],
        layoutStructure: 'single-column',
        emphasisComponents: [],
        validationStatus: 'PASS',
      };

      const result = splitToPages(config);

      expect(result.pages.roomDetail).toHaveProperty('deluxe-ocean-suite');
      expect(result.pages.roomDetail).toHaveProperty('the-grand-hotel-spa');
    });

    it('should handle slug collisions with numeric suffixes', () => {
      const config: HomepageConfig = {
        generationId: 'test-collision-v1',
        timestamp: '2026-03-24T12:00:00Z',
        hotelParameters: {
          hotelType: 'budget',
          targetAudience: 'backpackers',
          brandPersonality: 'friendly',
          hotelName: 'Test Hostel',
          location: 'London',
        },
        components: [
          { type: 'hero', variant: {}, props: {}, order: 0 },
          { type: 'navigation', variant: {}, props: {}, order: 1 },
          {
            type: 'rooms',
            variant: {},
            props: {
              rooms: [
                { id: 'r1', name: 'Deluxe Room', type: 'room', price: 100, capacity: 2 },
                { id: 'r2', name: 'Deluxe Room', type: 'room', price: 100, capacity: 2 },
                { id: 'r3', name: 'Deluxe Room', type: 'room', price: 100, capacity: 2 },
              ],
            },
            order: 2,
          },
          { type: 'footer', variant: {}, props: {}, order: 3 },
        ],
        layoutStructure: 'single-column',
        emphasisComponents: [],
        validationStatus: 'PASS',
      };

      const result = splitToPages(config);

      // First occurrence keeps base slug
      expect(result.pages.roomDetail).toHaveProperty('deluxe-room');
      // Second occurrence gets -2 suffix
      expect(result.pages.roomDetail).toHaveProperty('deluxe-room-2');
      // Third occurrence gets -3 suffix
      expect(result.pages.roomDetail).toHaveProperty('deluxe-room-3');
    });
  });

  // ============================================================================
  // COMPONENT TYPE ENUM
  // ============================================================================

  describe('Component types', () => {
    it('should support all 12 component types', () => {
      const expectedTypes: (string)[] = [
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
      ];

      const config = createFullConfig();
      const result = splitToPages(config);

      // Check all types from source are present
      const sourceTypes = new Set(config.components.map((c) => c.type));
      expectedTypes.forEach((type) => {
        expect(sourceTypes).toContain(type);
      });
    });
  });

  // ============================================================================
  // ISSUE #2: NAVIGATION LINK TRANSFORMATION
  // ============================================================================

  describe('Issue #2: Navigation link transformation from hash-based to page-based', () => {
    /**
     * Creates a config with hash-based navigation links
     */
    const createConfigWithHashLinks = (): HomepageConfig => ({
      generationId: 'test-hash-links-v1',
      timestamp: '2026-03-26T12:00:00Z',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'leisure',
        brandPersonality: 'elegant',
        hotelName: 'Test Grand Hotel',
        location: 'Paris, France',
      },
      components: [
        {
          type: 'hero',
          variant: {},
          props: { title: 'Welcome' },
          order: 0,
        },
        {
          type: 'navigation',
          variant: { layout: 'classic' },
          props: {
            brandName: 'Test Grand Hotel',
            links: [
              { label: 'Our Story', href: '#about' },
              { label: 'Suites', href: '#rooms' },
              { label: 'Experiences', href: '#amenities' },
              { label: 'Gallery', href: '#gallery' },
              { label: 'Reservations', href: '#booking' },
            ],
            ctaButton: {
              text: 'Reserve',
              href: '#booking',
            },
          },
          order: 1,
        },
        {
          type: 'rooms',
          variant: {},
          props: {
            rooms: [{ id: 'room1', name: 'Deluxe Suite', type: 'suite', price: 500, capacity: 2 }],
          },
          order: 2,
        },
        {
          type: 'footer',
          variant: {},
          props: {},
          order: 3,
        },
        {
          type: 'features',
          variant: {},
          props: {},
          order: 4,
        },
      ],
      layoutStructure: 'single-column',
      emphasisComponents: [],
      validationStatus: 'PASS',
    });

    it('should transform #about hash link to /about page link', () => {
      const config = createConfigWithHashLinks();
      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav).toBeDefined();

      const aboutLink = homepageNav!.props.links?.find((l: { label: string; href: string }) => l.label === 'Our Story');
      expect(aboutLink?.href).toBe('/about');
    });

    it('should transform #rooms hash link to /rooms page link', () => {
      const config = createConfigWithHashLinks();
      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav).toBeDefined();

      const roomsLink = homepageNav!.props.links?.find((l: { label: string; href: string }) => l.label === 'Suites');
      expect(roomsLink?.href).toBe('/rooms');
    });

    it('should transform #amenities hash link to /amenities page link', () => {
      const config = createConfigWithHashLinks();
      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav).toBeDefined();

      const amenitiesLink = homepageNav!.props.links?.find((l: { label: string; href: string }) => l.label === 'Experiences');
      expect(amenitiesLink?.href).toBe('/amenities');
    });

    it('should transform #gallery hash link to /gallery page link', () => {
      const config = createConfigWithHashLinks();
      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav).toBeDefined();

      const galleryLink = homepageNav!.props.links?.find((l: { label: string; href: string }) => l.label === 'Gallery');
      expect(galleryLink?.href).toBe('/gallery');
    });

    it('should transform #booking hash link to /booking page link', () => {
      const config = createConfigWithHashLinks();
      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav).toBeDefined();

      const bookingLink = homepageNav!.props.links?.find((l: { label: string; href: string }) => l.label === 'Reservations');
      expect(bookingLink?.href).toBe('/booking');
    });

    it('should transform CTA button href from hash to page link', () => {
      const config = createConfigWithHashLinks();
      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav).toBeDefined();

      expect(homepageNav!.props.ctaButton?.href).toBe('/booking');
    });

    it('should preserve page-based links (links starting with /)', () => {
      const config: HomepageConfig = {
        generationId: 'test-page-links-v1',
        timestamp: '2026-03-26T12:00:00Z',
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'leisure',
          brandPersonality: 'elegant',
          hotelName: 'Test Grand Hotel',
          location: 'Paris, France',
        },
        components: [
          { type: 'hero', variant: {}, props: { title: 'Welcome' }, order: 0 },
          {
            type: 'navigation',
            variant: {},
            props: {
              brandName: 'Test Grand Hotel',
              links: [
                { label: 'About', href: '/about' },
                { label: 'Rooms', href: '/rooms' },
                { label: 'External', href: 'https://example.com' },
              ],
            },
            order: 1,
          },
          {
            type: 'rooms',
            variant: {},
            props: { rooms: [] },
            order: 2,
          },
          { type: 'footer', variant: {}, props: {}, order: 3 },
          { type: 'features', variant: {}, props: {}, order: 4 },
        ],
        layoutStructure: 'single-column',
        emphasisComponents: [],
        validationStatus: 'PASS',
      };

      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav).toBeDefined();

      expect(homepageNav!.props.links?.[0].href).toBe('/about');
      expect(homepageNav!.props.links?.[1].href).toBe('/rooms');
      expect(homepageNav!.props.links?.[2].href).toBe('https://example.com');
    });

    it('should apply transformation to all pages', () => {
      const config = createConfigWithHashLinks();
      const result = splitToPages(config);

      const pages: (keyof typeof result.pages)[] = ['homepage', 'rooms', 'gallery', 'amenities', 'reviews', 'contact', 'about', 'faq'];

      pages.forEach((pageKey) => {
        const nav = result.pages[pageKey].components.find((c) => c.type === 'navigation');
        expect(nav).toBeDefined();

        const aboutLink = nav!.props.links?.find((l: { label: string; href: string }) => l.label === 'Our Story');
        expect(aboutLink?.href).toBe('/about');
      });
    });

    it('should transform #testimonials to /reviews (legacy mapping)', () => {
      const config: HomepageConfig = {
        generationId: 'test-legacy-mapping-v1',
        timestamp: '2026-03-26T12:00:00Z',
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'leisure',
          brandPersonality: 'elegant',
          hotelName: 'Test Grand Hotel',
          location: 'Paris, France',
        },
        components: [
          { type: 'hero', variant: {}, props: { title: 'Welcome' }, order: 0 },
          {
            type: 'navigation',
            variant: {},
            props: {
              brandName: 'Test Grand Hotel',
              links: [{ label: 'Reviews', href: '#testimonials' }],
            },
            order: 1,
          },
          {
            type: 'rooms',
            variant: {},
            props: { rooms: [] },
            order: 2,
          },
          { type: 'footer', variant: {}, props: {}, order: 3 },
          { type: 'features', variant: {}, props: {}, order: 4 },
        ],
        layoutStructure: 'single-column',
        emphasisComponents: [],
        validationStatus: 'PASS',
      };

      const result = splitToPages(config);

      const homepageNav = result.pages.homepage.components.find((c) => c.type === 'navigation');
      expect(homepageNav!.props.links?.[0].href).toBe('/reviews');
    });

    it('should not mutate original config components', () => {
      const config = createConfigWithHashLinks();
      const originalNav = config.components.find((c) => c.type === 'navigation');

      splitToPages(config);

      // Original config should still have hash links
      expect(originalNav?.props.links?.[0].href).toBe('#about');
      expect(originalNav?.props.ctaButton?.href).toBe('#booking');
    });
  });
});
