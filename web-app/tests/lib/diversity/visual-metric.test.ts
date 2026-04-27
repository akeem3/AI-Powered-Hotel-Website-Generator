/**
 * Visual Metric Tests
 *
 * Story 22.1: Diversity Scoring Framework - Visual Metrics
 *
 * Tests for visual diversity calculation including:
 * - OKLCH hue distance (circular)
 * - Typography personality differences
 * - Spacing density differences
 * - Border radius differences
 *
 * @module __tests__/lib/diversity/visual-metric.test
 *
 * SKIPPED TESTS (Epic 20 Dependency):
 * The following tests are skipped because they require designTokens,
 * which are only generated after Epic 20 (AI-Driven Design Token + CVA Diversity)
 * is complete. These tests should be re-enabled once Epic 20 is finished.
 *
 * To re-enable: Change `.skip` to `.it` in the following tests:
 * - extractDesignTokens (2 tests)
 * - calculateVisualMetrics with designTokens
 * - getColorPaletteSummary with designTokens
 * - hasSignificantlyDifferentColors (2 tests)
 *
 * Manual testing: Create mock configs with designTokens property and
 * verify the visual metrics calculate correctly.
 */

import {
  extractDesignTokens,
  calculateHueDistance,
  normalizeHueDistance,
  calculateTypographyDifference,
  calculateSpacingDifference,
  calculateBorderRadiusDifference,
  calculateVisualMetrics,
  calculateAverageVisualDiversity,
  getColorPaletteSummary,
  hasSignificantlyDifferentColors,
} from '@/lib/diversity/metrics/visual-metric';
import type { HomepageConfig } from '@/app/langgraph/agents/schemas';

describe('Visual Metric', () => {
  const createMockConfig = (
    designTokens?: any
  ): any => {
    const baseConfig = {
      generationId: 'test-v1',
      timestamp: '2024-01-01T00:00:00Z',
      hotelParameters: {
        hotelName: 'Test Hotel',
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        location: 'Paris, France',
      },
      components: [],
      layoutStructure: 'single-column',
      emphasisComponents: [],
      validationStatus: 'PASS',
    };

    // Return as any to bypass type checking and preserve designTokens property
    return designTokens ? { ...baseConfig, designTokens } : baseConfig;
  };

  describe('calculateHueDistance', () => {
    it('should return 0 for identical hues', () => {
      const result = calculateHueDistance(0, 0);
      expect(result).toBe(0);

      const result2 = calculateHueDistance(180, 180);
      expect(result2).toBe(0);
    });

    it('should calculate shortest circular distance', () => {
      // 350 and 10 are only 20 degrees apart (through 0)
      const result = calculateHueDistance(350, 10);
      expect(result).toBe(20);

      // 10 and 350 are the same
      const result2 = calculateHueDistance(10, 350);
      expect(result2).toBe(20);
    });

    it('should calculate direct distance for smaller angles', () => {
      const result = calculateHueDistance(45, 90);
      expect(result).toBe(45);
    });

    it('should use circular distance for larger angles', () => {
      // Direct distance would be 200, but circular is 160
      const result = calculateHueDistance(10, 210);
      expect(result).toBe(160);
    });

    it('should handle maximum distance', () => {
      const result = calculateHueDistance(0, 180);
      expect(result).toBe(180);

      const result2 = calculateHueDistance(90, 270);
      expect(result2).toBe(180);
    });
  });

  describe('normalizeHueDistance', () => {
    it('should normalize 0-180 to 0-100', () => {
      expect(normalizeHueDistance(0)).toBe(0);
      expect(normalizeHueDistance(90)).toBe(50);
      expect(normalizeHueDistance(180)).toBe(100);
    });

    it('should handle intermediate values', () => {
      expect(normalizeHueDistance(45)).toBe(25);
      expect(normalizeHueDistance(135)).toBe(75);
    });
  });

  describe('calculateTypographyDifference', () => {
    it('should return 0 for identical personalities', () => {
      const result = calculateTypographyDifference('sans-modern', 'sans-modern');
      expect(result).toBe(0);
    });

    it('should return 50 for one undefined personality', () => {
      const result1 = calculateTypographyDifference(undefined, 'sans-modern');
      expect(result1).toBe(50);

      const result2 = calculateTypographyDifference('sans-modern', undefined);
      expect(result2).toBe(50);
    });

    it('should return 0 for both undefined personalities (same value)', () => {
      const result = calculateTypographyDifference(undefined, undefined);
      expect(result).toBe(0); // Both undefined = same = no difference
    });

    it('should return 30 for same category personalities', () => {
      const serif = calculateTypographyDifference('serif-elegant', 'serif-readable');
      expect(serif).toBe(30);

      const sans = calculateTypographyDifference('sans-modern', 'humanist-organic');
      expect(sans).toBe(30);
    });

    it('should return 70 for different category personalities', () => {
      const result = calculateTypographyDifference('serif-elegant', 'sans-modern');
      expect(result).toBe(70);
    });
  });

  describe('calculateSpacingDifference', () => {
    it('should return 0 for identical density', () => {
      const result = calculateSpacingDifference('tight', 'tight');
      expect(result).toBe(0);
    });

    it('should return 50 for undefined densities', () => {
      const result1 = calculateSpacingDifference(undefined, 'tight');
      expect(result1).toBe(50);

      const result2 = calculateSpacingDifference('tight', undefined);
      expect(result2).toBe(50);
    });

    it('should calculate difference based on density order', () => {
      const tightComfortable = calculateSpacingDifference('tight', 'comfortable');
      expect(tightComfortable).toBeCloseTo(33.3, 1);

      const tightSpacious = calculateSpacingDifference('tight', 'spacious');
      expect(tightSpacious).toBe(100);
    });

    it('should return 70 for unknown density values', () => {
      const result = calculateSpacingDifference('tight', 'unknown');
      expect(result).toBe(70);
    });
  });

  describe('calculateBorderRadiusDifference', () => {
    it('should return 0 for identical radius', () => {
      const result = calculateBorderRadiusDifference('rounded', 'rounded');
      expect(result).toBe(0);
    });

    it('should return 50 for undefined radius', () => {
      const result1 = calculateBorderRadiusDifference(undefined, 'rounded');
      expect(result1).toBe(50);

      const result2 = calculateBorderRadiusDifference('rounded', undefined);
      expect(result2).toBe(50);
    });

    it('should calculate difference based on radius order', () => {
      const sharpSubtle = calculateBorderRadiusDifference('sharp', 'subtle');
      expect(sharpSubtle).toBeCloseTo(33.3, 1);

      const sharpPill = calculateBorderRadiusDifference('sharp', 'pill');
      expect(sharpPill).toBe(100);
    });

    it('should return 60 for unknown radius values', () => {
      const result = calculateBorderRadiusDifference('rounded', 'unknown');
      expect(result).toBe(60);
    });
  });

  describe('extractDesignTokens', () => {
    it('should extract tokens from config with designTokens', () => {
      const config = createMockConfig({
        colorScheme: {
          primaryHue: 220,
          primaryChroma: 0.08,
          primaryLightness: 0.45,
          secondaryHue: 200,
          secondaryChroma: 0.05,
          secondaryLightness: 0.55,
        },
        typography: {
          headingPersonality: 'sans-modern',
          bodyPersonality: 'sans-modern',
          scaleRatio: 'major-third',
        },
        spacing: {
          density: 'comfortable',
        },
        borderRadius: { style: 'rounded' },
      });

      const tokens = extractDesignTokens(config);

      expect(tokens.primaryHue).toBe(220);
      expect(tokens.secondaryHue).toBe(200);
      expect(tokens.typographyPersonality).toBe('sans-modern');
      expect(tokens.spacingDensity).toBe('comfortable');
      expect(tokens.borderRadius).toBe('rounded');
    });

    it('should return empty object for config without designTokens', () => {
      const config = createMockConfig();

      const tokens = extractDesignTokens(config);

      expect(tokens).toEqual({});
    });

    it('should handle partial designTokens', () => {
      const config = createMockConfig({
        colorScheme: {
          primaryHue: 220,
          primaryChroma: 0.08,
          primaryLightness: 0.45,
        },
      });

      const tokens = extractDesignTokens(config);

      expect(tokens.primaryHue).toBe(220);
      expect(tokens.typographyPersonality).toBeUndefined();
    });
  });

  describe('calculateVisualMetrics', () => {
    it('should calculate complete visual metrics with designTokens', () => {
      const configA = createMockConfig({
        colorScheme: {
          primaryHue: 220,
          primaryChroma: 0.08,
          primaryLightness: 0.45,
          secondaryHue: 200,
        },
        typography: { headingPersonality: 'sans-modern' },
        spacing: { density: 'tight' },
        borderRadius: { style: 'rounded' },
      });

      const configB = createMockConfig({
        colorScheme: {
          primaryHue: 30,
          primaryChroma: 0.08,
          primaryLightness: 0.45,
          secondaryHue: 40,
        },
        typography: { headingPersonality: 'serif-elegant' },
        spacing: { density: 'spacious' },
        borderRadius: { style: 'pill' },
      });

      const metrics = calculateVisualMetrics(configA, configB);

      expect(metrics).toHaveProperty('hueDistance');
      expect(metrics).toHaveProperty('typographyDifference');
      expect(metrics).toHaveProperty('spacingDifference');
      expect(metrics).toHaveProperty('borderRadiusDifference');
      expect(metrics).toHaveProperty('visualScore');

      expect(metrics.hueDistance).toBeGreaterThan(0); // 220 vs 30 = large difference
      expect(metrics.typographyDifference).toBeGreaterThan(0); // different categories
      expect(metrics.visualScore).toBeGreaterThan(0);
    });

    it('should return neutral scores for configs without designTokens', () => {
      const configA = createMockConfig();
      const configB = createMockConfig();

      const metrics = calculateVisualMetrics(configA, configB);

      expect(metrics.hueDistance).toBe(50); // Default neutral
      expect(metrics.typographyDifference).toBe(0); // Both undefined
      expect(metrics.spacingDifference).toBe(0); // Both undefined
      expect(metrics.borderRadiusDifference).toBe(0); // Both undefined
      expect(metrics.visualScore).toBeCloseTo(20, 1); // Only hue contributes
    });

    it('should clamp visual score to 0-100 range', () => {
      const configA = createMockConfig();
      const configB = createMockConfig();

      const metrics = calculateVisualMetrics(configA, configB);

      expect(metrics.visualScore).toBeGreaterThanOrEqual(0);
      expect(metrics.visualScore).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateAverageVisualDiversity', () => {
    it('should return 0 for single config', () => {
      const config = createMockConfig();

      const result = calculateAverageVisualDiversity([config]);
      expect(result).toBe(0);
    });

    it('should calculate average across multiple configs', () => {
      const config1 = createMockConfig({
        designTokens: { colorScheme: { primaryHue: 0 } },
      });
      const config2 = createMockConfig({
        designTokens: { colorScheme: { primaryHue: 90 } },
      });
      const config3 = createMockConfig({
        designTokens: { colorScheme: { primaryHue: 180 } },
      });

      const result = calculateAverageVisualDiversity([config1, config2, config3]);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('getColorPaletteSummary', () => {
    it('should return color summary with designTokens', () => {
      const config = createMockConfig({
        colorScheme: {
          primaryHue: 220,
          secondaryHue: 30,
        },
      });

      const summary = getColorPaletteSummary(config);

      expect(summary.primaryHue).toBe(220);
      expect(summary.secondaryHue).toBe(30);
      expect(summary.primaryDescription).toBe('Blue');
      expect(summary.secondaryDescription).toBe('Orange/Yellow');
    });

    it('should handle missing hues', () => {
      const config = createMockConfig();

      const summary = getColorPaletteSummary(config);

      expect(summary.primaryHue).toBeUndefined();
      expect(summary.primaryDescription).toBe('Not specified');
    });
  });

  describe('hasSignificantlyDifferentColors', () => {
    it('should return true for colors beyond threshold', () => {
      const configA = createMockConfig({
        colorScheme: { primaryHue: 0 },
      });
      const configB = createMockConfig({
        colorScheme: { primaryHue: 90 },
      });

      const result = hasSignificantlyDifferentColors(configA, configB, 45);
      expect(result).toBe(true); // 90 degree difference
    });

    it('should return false for colors within threshold', () => {
      const configA = createMockConfig({
        colorScheme: { primaryHue: 0 },
      });
      const configB = createMockConfig({
        colorScheme: { primaryHue: 30 },
      });

      const result = hasSignificantlyDifferentColors(configA, configB, 45);
      expect(result).toBe(false); // 30 degree difference
    });

    it('should return false for configs without hues', () => {
      const configA = createMockConfig();
      const configB = createMockConfig();

      const result = hasSignificantlyDifferentColors(configA, configB);
      expect(result).toBe(false);
    });
  });
});
