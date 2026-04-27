/**
 * Unit Tests - Fixture Schema Validation
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.02
 * @trace reqs: AC1, AC2, AC3, AC4
 *
 * Why: Tests that the fixture JSON files strictly adhere to HomepageConfigSchema.
 * Validates each fixture file against the schema to ensure they are valid
 * configurations for the preview page.
 *
 * Note: the-pemberton-grand.json is a HomepageConfig fixture (not WebsiteConfig).
 * The fixture uses the flat HomepageConfig format with generationId, components,
 * layoutStructure, etc. at the top level.
 *
 * Coverage:
 * - AC1: the-pemberton-grand.json validates against HomepageConfigSchema
 * - AC2: Fixtures have valid components array (5-12 components)
 * - AC3: Fixtures have valid hotelParameters
 * - AC4: All fixtures strictly adhere to the schema
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { HomepageConfigSchema } from '@/app/langgraph/agents/schemas';

// Helper to load and parse a fixture file
function loadFixtureFile(filename: string): unknown {
  const fixturePath = join(process.cwd(), 'fixtures', 'configs', filename);
  const fileContent = readFileSync(fixturePath, 'utf-8');
  return JSON.parse(fileContent);
}

describe('Story 16.02 - Fixture Schema Validation', () => {
  describe('AC1: the-pemberton-grand.json validates against HomepageConfigSchema', () => {
    let fixtureData: unknown;

    beforeAll(() => {
      fixtureData = loadFixtureFile('the-pemberton-grand.json');
    });

    it('should validate against HomepageConfigSchema', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);

      if (!result.success) {
        console.error('Validation errors:', result.error.format());
      }

      expect(result.success).toBe(true);
    });

    it('should have components array with valid count', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.components).toBeInstanceOf(Array);
        expect(result.data.components.length).toBeGreaterThanOrEqual(5);
        expect(result.data.components.length).toBeLessThanOrEqual(12);
      }
    });

    it('should have navigation component', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        const hasNav = result.data.components.some((c) => c.type === 'navigation');
        expect(hasNav).toBe(true);
      }
    });

    it('should have footer component', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        const hasFooter = result.data.components.some((c) => c.type === 'footer');
        expect(hasFooter).toBe(true);
      }
    });

    it('should have rooms component', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        const hasRooms = result.data.components.some((c) => c.type === 'rooms');
        expect(hasRooms).toBe(true);
      }
    });
  });

  describe('AC2: Fixture has valid hotelParameters', () => {
    let fixtureData: unknown;

    beforeAll(() => {
      fixtureData = loadFixtureFile('the-pemberton-grand.json');
    });

    it('should have valid hotelParameters', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.hotelParameters).toBeDefined();
        expect(result.data.hotelParameters.hotelType).toBe('luxury');
        expect(result.data.hotelParameters.hotelName).toBe('The Pemberton Grand');
      }
    });

    it('should have valid generationId format', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.generationId).toMatch(/^[a-z0-9-]+-v\d+$/);
      }
    });

    it('should have valid timestamp', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.timestamp).toBeDefined();
        const date = new Date(result.data.timestamp);
        expect(date.toISOString()).toBeTruthy();
      }
    });
  });

  describe('AC3: Components structure validation', () => {
    let fixtureData: unknown;

    beforeAll(() => {
      fixtureData = loadFixtureFile('the-pemberton-grand.json');
    });

    it('should have gallery component', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        const hasGallery = result.data.components.some((c) => c.type === 'gallery');
        expect(hasGallery).toBe(true);
      }
    });

    it('should have testimonials component', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        const hasTestimonials = result.data.components.some((c) => c.type === 'testimonials');
        expect(hasTestimonials).toBe(true);
      }
    });

    it('should have amenities component', () => {
      const result = HomepageConfigSchema.safeParse(fixtureData);
      expect(result.success).toBe(true);

      if (result.success) {
        const hasAmenities = result.data.components.some((c) => c.type === 'amenities');
        expect(hasAmenities).toBe(true);
      }
    });
  });

  describe('AC4: All fixtures strictly adhere to schema', () => {
    it('the-pemberton-grand should have validationStatus PASS', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.validationStatus).toBe('PASS');
      }
    });

    it('all fixtures should have valid layoutStructure enum values', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(['single-column', 'grid', 'mixed']).toContain(result.data.layoutStructure);
      }
    });

    it('all fixtures should have component count within reasonable bounds', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);
      if (result.success) {
        // The-pemberton-grand has 10 components (nav, hero, about, rooms, features, gallery, testimonials, amenities, booking, footer)
        expect(result.data.components.length).toBeGreaterThanOrEqual(5);
        expect(result.data.components.length).toBeLessThanOrEqual(12);
      }
    });

    it('all fixtures should have valid component type enums', () => {
      const validTypes = ['hero', 'navigation', 'rooms', 'gallery', 'testimonials', 'amenities', 'booking', 'contact', 'about', 'faq', 'features', 'footer'];
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.components.forEach((component) => {
          expect(validTypes).toContain(component.type);
        });
      }
    });
  });

  describe('Component order validation', () => {
    it('all fixtures should have sequential order values starting from 0', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);
      if (result.success) {
        const orders = result.data.components.map((c) => c.order).sort((a, b) => a - b);
        orders.forEach((order, index) => {
          expect(order).toBe(index);
        });
      }
    });
  });

  describe('Variant structure validation', () => {
    it('all fixtures should have variant objects with string/number/boolean values', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);
      if (result.success) {
        result.data.components.forEach((component) => {
          if (component.variant && typeof component.variant === 'object') {
            Object.values(component.variant).forEach((value) => {
              const isValid =
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean';
              expect(isValid).toBe(true);
            });
          }
        });
      }
    });
  });

  describe('Rooms component validation', () => {
    it('should have rooms component with room entries', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);

      if (result.success) {
        const roomsComponent = result.data.components.find((c) => c.type === 'rooms');
        expect(roomsComponent).toBeDefined();
        if (roomsComponent && roomsComponent.props && roomsComponent.props.rooms) {
          expect((roomsComponent.props.rooms as unknown[]).length).toBeGreaterThanOrEqual(4);
        }
      }
    });

    it('should have gallery component with images', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);

      if (result.success) {
        const galleryComponent = result.data.components.find((c) => c.type === 'gallery');
        expect(galleryComponent).toBeDefined();
        if (galleryComponent && galleryComponent.props && galleryComponent.props.images) {
          expect((galleryComponent.props.images as unknown[]).length).toBeGreaterThanOrEqual(9);
        }
      }
    });

    it('should have testimonials component with testimonials', () => {
      const fixtureData = loadFixtureFile('the-pemberton-grand.json');
      const result = HomepageConfigSchema.safeParse(fixtureData);

      expect(result.success).toBe(true);

      if (result.success) {
        const testimonialsComponent = result.data.components.find((c) => c.type === 'testimonials');
        expect(testimonialsComponent).toBeDefined();
        if (testimonialsComponent && testimonialsComponent.props && testimonialsComponent.props.testimonials) {
          expect((testimonialsComponent.props.testimonials as unknown[]).length).toBeGreaterThanOrEqual(4);
        }
      }
    });
  });
});
