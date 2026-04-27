/**
 * Story 17.5: ComponentRenderer and Preview Integration Tests
 *
 * @trace epic: EPIC-17
 * @trace story: STORY-17.05
 * @trace reqs: AC4, AC5, AC6, AC7
 *
 * Why: Verifies that available fixtures have hero layouts and pass
 * HomepageConfigSchema validation.
 *
 * Note: As of Epic 25, the project ships a single canonical fixture
 * (the-pemberton-grand) with layout: "split" and height: "large".
 * The original luxury-boutique, budget-hostel, business-hotel fixtures
 * from Epic 16 have been superseded and are no longer present in
 * fixtures/configs/. Tests have been updated to use the available fixture.
 *
 * Coverage:
 * - AC4: the-pemberton-grand.json has a hero component with a defined layout
 * - AC7: the-pemberton-grand.json passes HomepageConfigSchema validation
 */

import { HomepageConfigSchema } from '@/app/langgraph/agents/schemas';
import { loadFixture } from '@/lib/validation/fixtureValidation';

// Canonical fixture available in the project
const CANONICAL_FIXTURE = 'the-pemberton-grand';

describe('Story 17.5: ComponentRenderer and Preview Integration', () => {
  describe('AC4: Available Fixture Has a Hero Component With a Layout', () => {
    it('AC4: the-pemberton-grand.json has a hero component with layout="split" and height="large"', () => {
      const loadedConfig = loadFixture(CANONICAL_FIXTURE);
      expect(loadedConfig).not.toBeNull();

      if (!loadedConfig) {
        throw new Error('Failed to load the-pemberton-grand fixture');
      }

      const heroComponent = (loadedConfig as any).components.find((c: any) => c.type === 'hero');
      expect(heroComponent).toBeDefined();
      expect(heroComponent.variant.layout).toBe('split');
      expect(heroComponent.variant.height).toBe('large');
    });

    it('AC5: hero component has a defined layout value', () => {
      const loadedConfig = loadFixture(CANONICAL_FIXTURE);
      expect(loadedConfig).not.toBeNull();

      if (!loadedConfig) {
        throw new Error('Failed to load the-pemberton-grand fixture');
      }

      const heroComponent = (loadedConfig as any).components.find((c: any) => c.type === 'hero');
      expect(heroComponent).toBeDefined();
      expect(heroComponent.variant.layout).toBeDefined();
      expect(typeof heroComponent.variant.layout).toBe('string');
    });

    it('AC6: hero component has a defined height value', () => {
      const loadedConfig = loadFixture(CANONICAL_FIXTURE);
      expect(loadedConfig).not.toBeNull();

      if (!loadedConfig) {
        throw new Error('Failed to load the-pemberton-grand fixture');
      }

      const heroComponent = (loadedConfig as any).components.find((c: any) => c.type === 'hero');
      expect(heroComponent).toBeDefined();
      expect(heroComponent.variant.height).toBeDefined();
      expect(typeof heroComponent.variant.height).toBe('string');
    });
  });

  describe('AC7: Fixture Passes HomepageConfigSchema Validation', () => {
    it('the-pemberton-grand.json passes HomepageConfigSchema validation', () => {
      const loadedConfig = loadFixture(CANONICAL_FIXTURE);
      expect(loadedConfig).not.toBeNull();

      if (!loadedConfig) {
        throw new Error('Failed to load the-pemberton-grand fixture');
      }

      const result = HomepageConfigSchema.safeParse(loadedConfig);
      expect(result.success).toBe(true);
    });

    it('fixture has all required top-level fields', () => {
      const loadedConfig = loadFixture(CANONICAL_FIXTURE);
      expect(loadedConfig).not.toBeNull();

      if (!loadedConfig) {
        throw new Error('Failed to load the-pemberton-grand fixture');
      }

      expect(loadedConfig).toHaveProperty('components');
      expect(Array.isArray((loadedConfig as any).components)).toBe(true);
    });

    it('fixture has at least one component', () => {
      const loadedConfig = loadFixture(CANONICAL_FIXTURE);
      expect(loadedConfig).not.toBeNull();

      if (!loadedConfig) {
        throw new Error('Failed to load the-pemberton-grand fixture');
      }

      expect((loadedConfig as any).components.length).toBeGreaterThan(0);
    });
  });

  describe('Story 17.5 Summary: Hero Layout Verified in Canonical Fixture', () => {
    it('verifies the canonical fixture has a hero with a non-empty layout string', () => {
      const config = loadFixture(CANONICAL_FIXTURE);

      expect(config).not.toBeNull();

      if (!config) {
        throw new Error('Failed to load fixture');
      }

      const hero = (config as any).components.find((c: any) => c.type === 'hero');

      expect(hero).toBeDefined();
      expect(hero.variant).toBeDefined();
      expect(hero.variant.layout).toBeTruthy();
      expect(hero.variant.layout).toBe('split');
    });
  });
});
