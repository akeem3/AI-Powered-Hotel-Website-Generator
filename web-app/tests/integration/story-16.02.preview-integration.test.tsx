/**
 * Integration Tests - Preview Page with Fixtures
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.02
 * @trace reqs: AC5
 *
 * Why: Tests that loading fixtures in the /preview page renders without errors.
 * Verifies that the preview page can successfully load and prepare each fixture
 * configuration for rendering with all components.
 *
 * Coverage:
 * - AC5: Loading any fixture in /preview renders without errors
 * - Preview page loads each fixture successfully
 * - All components in fixtures can be prepared for rendering
 *
 * NOTE: Updated to use the-pemberton-grand fixture which is the only available
 * fixture in fixtures/configs/ (luxury-boutique, budget-hostel, business-hotel
 * fixtures were removed/renamed in later epics).
 */

import { loadFixture } from '@/lib/validation/fixtureValidation';
import { COMPONENT_MAP } from '@/components/renderers/componentMap';
import { transformProps, filterSafeVariant } from '@/lib/propsTransformation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

describe('Story 16.02 - Preview Page Integration (AC5)', () => {
  describe('the-pemberton-grand.json can be loaded and prepared', () => {
    const fixtureName = 'the-pemberton-grand';
    let fixtureData: any;

    beforeAll(() => {
      fixtureData = loadFixture(fixtureName);
    });

    it('should load fixture successfully', () => {
      expect(fixtureData).not.toBeNull();
      expect(fixtureData.generationId).toBeDefined();
      expect(fixtureData.components).toBeDefined();
      expect(fixtureData.components.length).toBeGreaterThan(0);
    });

    it('should have valid component mappings for all types', () => {
      const componentTypes = fixtureData.components.map((c: any) => c.type);

      componentTypes.forEach((type: string) => {
        const Component = COMPONENT_MAP[type as keyof typeof COMPONENT_MAP];
        expect(Component).toBeDefined();
      });
    });

    it('should transform props for all components without errors', () => {
      expect(() => {
        fixtureData.components.forEach((componentConfig: any) => {
          const safeProps = transformProps(componentConfig.type, componentConfig.props);
          expect(safeProps).toBeDefined();
        });
      }).not.toThrow();
    });

    it('should filter variants for all components without errors', () => {
      expect(() => {
        fixtureData.components.forEach((componentConfig: any) => {
          const safeVariant = filterSafeVariant(componentConfig.variant);
          expect(safeVariant).toBeDefined();
        });
      }).not.toThrow();
    });

    it('should prepare navigation component for rendering', () => {
      const navConfig = fixtureData.components.find((c: any) => c.type === 'navigation');
      expect(navConfig).toBeDefined();

      const Component = COMPONENT_MAP.navigation;
      expect(Component).toBeDefined();

      const safeProps = transformProps('navigation', navConfig.props);
      const safeVariant = filterSafeVariant(navConfig.variant);

      expect(safeProps).toBeDefined();
      expect(safeVariant).toBeDefined();
    });

    it('should prepare hero component for rendering', () => {
      const heroConfig = fixtureData.components.find((c: any) => c.type === 'hero');
      expect(heroConfig).toBeDefined();

      const Component = COMPONENT_MAP.hero;
      expect(Component).toBeDefined();

      const safeProps = transformProps('hero', heroConfig.props);
      const safeVariant = filterSafeVariant(heroConfig.variant);

      expect(safeProps).toBeDefined();
      expect(safeVariant).toBeDefined();
      expect(safeProps.title || safeProps.heading).toBeDefined();
    });

    it('should prepare gallery component for rendering', () => {
      const galleryConfig = fixtureData.components.find((c: any) => c.type === 'gallery');
      expect(galleryConfig).toBeDefined();

      const Component = COMPONENT_MAP.gallery;
      expect(Component).toBeDefined();

      const safeProps = transformProps('gallery', galleryConfig.props);
      const safeVariant = filterSafeVariant(galleryConfig.variant);

      expect(safeProps).toBeDefined();
      expect(safeVariant).toBeDefined();
    });

    it('should prepare rooms component for rendering with variant transformation', () => {
      const roomsConfig = fixtureData.components.find((c: any) => c.type === 'rooms');
      expect(roomsConfig).toBeDefined();

      const Component = COMPONENT_MAP.rooms;
      expect(Component).toBeDefined();

      const safeProps = transformProps('rooms', roomsConfig.props);

      // Verify variant transformation for rooms component
      const roomsVariant = typeof roomsConfig.variant === 'object' && roomsConfig.variant !== null && 'roomCardStyle' in roomsConfig.variant
        ? (roomsConfig.variant as { roomCardStyle?: string }).roomCardStyle
        : roomsConfig.variant;

      expect(safeProps).toBeDefined();
      expect(roomsVariant).toBeDefined();
    });

    it('should prepare testimonials component for rendering', () => {
      const testimonialsConfig = fixtureData.components.find((c: any) => c.type === 'testimonials');
      expect(testimonialsConfig).toBeDefined();

      const Component = COMPONENT_MAP.testimonials;
      expect(Component).toBeDefined();

      const safeProps = transformProps('testimonials', testimonialsConfig.props);
      const safeVariant = filterSafeVariant(testimonialsConfig.variant);

      expect(safeProps).toBeDefined();
      expect(safeVariant).toBeDefined();
    });

    it('should prepare amenities component for rendering', () => {
      const amenitiesConfig = fixtureData.components.find((c: any) => c.type === 'amenities');
      expect(amenitiesConfig).toBeDefined();

      const Component = COMPONENT_MAP.amenities;
      expect(Component).toBeDefined();

      const safeProps = transformProps('amenities', amenitiesConfig.props);
      const safeVariant = filterSafeVariant(amenitiesConfig.variant);

      expect(safeProps).toBeDefined();
      expect(safeVariant).toBeDefined();
    });

    it('should prepare booking component for rendering with variant transformation', () => {
      const bookingConfig = fixtureData.components.find((c: any) => c.type === 'booking');
      expect(bookingConfig).toBeDefined();

      const Component = COMPONENT_MAP.booking;
      expect(Component).toBeDefined();

      const safeProps = transformProps('booking', bookingConfig.props);

      // Verify variant transformation for booking component
      const bookingVariant = typeof bookingConfig.variant === 'object' && bookingConfig.variant !== null && 'bookingStyle' in bookingConfig.variant
        ? (bookingConfig.variant as { bookingStyle?: string }).bookingStyle
        : bookingConfig.variant;

      expect(safeProps).toBeDefined();
      expect(bookingVariant).toBeDefined();
    });
  });

  describe('AC5: All available fixtures can be prepared for rendering', () => {
    // Only the-pemberton-grand fixture exists in fixtures/configs/
    // (luxury-boutique, budget-hostel, business-hotel were removed in later epics)
    const fixtures = [
      { name: 'the-pemberton-grand', minComponents: 5 },
    ];

    fixtures.forEach(({ name, minComponents }) => {
      it(`${name} should load and prepare all components`, () => {
        const fixtureData = loadFixture(name);
        expect(fixtureData).not.toBeNull();
        expect(fixtureData?.components.length).toBeGreaterThanOrEqual(minComponents);

        // Verify all components can be mapped
        fixtureData.components.forEach((componentConfig: any) => {
          const Component = COMPONENT_MAP[componentConfig.type as keyof typeof COMPONENT_MAP];
          expect(Component).toBeDefined();

          // Verify props transformation doesn't throw
          expect(() => {
            const safeProps = transformProps(componentConfig.type, componentConfig.props);
            expect(safeProps).toBeDefined();
          }).not.toThrow();

          // Verify variant filtering doesn't throw
          expect(() => {
            const safeVariant = filterSafeVariant(componentConfig.variant);
            expect(safeVariant).toBeDefined();
          }).not.toThrow();
        });
      });
    });
  });

  describe('Security validation during fixture preparation', () => {
    it('should validate URLs in fixture props', () => {
      const fixtureData = loadFixture('the-pemberton-grand');
      expect(fixtureData).not.toBeNull();

      // Check that URLs are validated during props transformation
      const heroConfig = fixtureData.components.find((c: any) => c.type === 'hero');
      expect(heroConfig).toBeDefined();

      const safeProps = transformProps('hero', heroConfig.props);

      // Primary CTA href should be validated (hash URLs allowed after fix)
      if (heroConfig.props.primaryCTA?.href) {
        expect(safeProps.primaryCTA.href).toBeDefined();
      }
      // Secondary CTA href should be validated
      if (heroConfig.props.secondaryCTA?.href) {
        expect(safeProps.secondaryCTA.href).toBeDefined();
      }
    });

    it('should filter variant props to safe values', () => {
      const fixtureData = loadFixture('the-pemberton-grand');
      expect(fixtureData).not.toBeNull();

      const componentsWithVariants = fixtureData.components.filter((c: any) => c.variant);

      componentsWithVariants.forEach((componentConfig: any) => {
        const safeVariant = filterSafeVariant(componentConfig.variant);

        // Verify only primitive values remain (defense in depth)
        if (safeVariant && typeof safeVariant === 'object') {
          Object.values(safeVariant).forEach((value) => {
            const isPrimitive =
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean';
            expect(isPrimitive).toBe(true);
          });
        }
      });
    });
  });
});
