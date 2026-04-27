/**
 * Thematic Metric Tests
 *
 * Story 22.1: Diversity Scoring Framework - Thematic Metrics
 *
 * Tests for thematic diversity calculation including:
 * - CVA variant uniqueness
 * - Variant overlap ratio
 * - Variant dimension extraction
 *
 * @module __tests__/lib/diversity/thematic-metric.test
 */

import {
  extractVariantSelections,
  calculateVariantUniqueness,
  calculateVariantOverlapRatio,
  extractVariantDimensions,
  countUniqueDimensionValues,
  calculateThematicMetrics,
  calculateAverageThematicDiversity,
  getVariantUsageSummary,
  findMostSimilarVariants,
} from '@/lib/diversity/metrics/thematic-metric';
import type { HomepageConfig } from '@/app/langgraph/agents/schemas';

describe('Thematic Metric', () => {
  const createMockConfig = (
    components: Array<{
      type: string;
      variant: Record<string, string | number | boolean>;
    }>
  ): HomepageConfig => ({
    generationId: 'test-v1',
    timestamp: '2024-01-01T00:00:00Z',
    hotelParameters: {
      hotelName: 'Test Hotel',
      hotelType: 'luxury',
      targetAudience: 'couples',
      brandPersonality: 'elegant',
      location: 'Paris, France',
    },
    components: components.map((c) => ({
      type: c.type,
      variant: c.variant,
      props: {},
      order: 0,
    })),
    layoutStructure: 'single-column',
    emphasisComponents: [],
    validationStatus: 'PASS',
  });

  describe('extractVariantSelections', () => {
    it('should extract variant selections from config', () => {
      const config = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
        { type: 'navigation', variant: { style: 'solid', layout: 'classic' } },
      ]);

      const variants = extractVariantSelections(config);

      expect(variants.size).toBe(2);
      expect(variants.get('hero')).toEqual({ style: 'modern', layout: 'centered' });
      expect(variants.get('navigation')).toEqual({
        style: 'solid',
        layout: 'classic',
      });
    });

    it('should handle empty config', () => {
      const config = createMockConfig([]);

      const variants = extractVariantSelections(config);
      expect(variants.size).toBe(0);
    });
  });

  describe('calculateVariantUniqueness', () => {
    it('should return 0 for identical variants', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);
      const configB = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);

      const result = calculateVariantUniqueness(configA, configB);
      expect(result).toBe(0);
    });

    it('should return 100 for completely different variants', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);
      const configB = createMockConfig([
        { type: 'hero', variant: { style: 'classic', layout: 'split' } },
      ]);

      const result = calculateVariantUniqueness(configA, configB);
      expect(result).toBe(100);
    });

    it('should handle partial overlap', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered', height: 'medium' } },
      ]);
      const configB = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'split', height: 'large' } },
      ]);

      const result = calculateVariantUniqueness(configA, configB);
      expect(result).toBeCloseTo(66.7, 1); // 2 of 3 different
    });

    it('should handle different component types', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern' } },
      ]);
      const configB = createMockConfig([
        { type: 'navigation', variant: { style: 'solid' } },
      ]);

      const result = calculateVariantUniqueness(configA, configB);
      expect(result).toBe(0); // No common components to compare
    });
  });

  describe('calculateVariantOverlapRatio', () => {
    it('should return 1 for identical variants', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);
      const configB = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);

      const result = calculateVariantOverlapRatio(configA, configB);
      expect(result).toBe(1);
    });

    it('should return 0 for completely different variants', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);
      const configB = createMockConfig([
        { type: 'hero', variant: { style: 'classic', layout: 'split' } },
      ]);

      const result = calculateVariantOverlapRatio(configA, configB);
      expect(result).toBe(0);
    });

    it('should return 0.5 for partial overlap', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);
      const configB = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'split' } },
      ]);

      const result = calculateVariantOverlapRatio(configA, configB);
      expect(result).toBe(0.5); // 1 of 2 matches
    });
  });

  describe('extractVariantDimensions', () => {
    it('should extract all variant dimensions from configs', () => {
      const configs = [
        createMockConfig([
          { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
          { type: 'navigation', variant: { style: 'solid' } },
        ]),
        createMockConfig([
          { type: 'gallery', variant: { layout: 'grid', columns: 3 } },
        ]),
      ];

      const dimensions = extractVariantDimensions(configs);

      expect(dimensions).toContain('style');
      expect(dimensions).toContain('layout');
      expect(dimensions).toContain('columns');
    });

    it('should handle empty configs', () => {
      const configs = [createMockConfig([])];

      const dimensions = extractVariantDimensions(configs);
      expect(dimensions.size).toBe(0);
    });
  });

  describe('countUniqueDimensionValues', () => {
    it('should count unique values for a dimension', () => {
      const configs = [
        createMockConfig([
          { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
        ]),
        createMockConfig([
          { type: 'hero', variant: { style: 'classic', layout: 'centered' } },
        ]),
        createMockConfig([
          { type: 'hero', variant: { style: 'minimal', layout: 'split' } },
        ]),
      ];

      const styleCount = countUniqueDimensionValues(configs, 'style');
      const layoutCount = countUniqueDimensionValues(configs, 'layout');

      expect(styleCount).toBe(3); // modern, classic, minimal
      expect(layoutCount).toBe(2); // centered, split
    });

    it('should return 0 for unused dimension', () => {
      const configs = [
        createMockConfig([{ type: 'hero', variant: { style: 'modern' } }]),
      ];

      const count = countUniqueDimensionValues(configs, 'columns');
      expect(count).toBe(0);
    });
  });

  describe('calculateThematicMetrics', () => {
    it('should calculate complete thematic metrics', () => {
      const configA = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
      ]);
      const configB = createMockConfig([
        { type: 'hero', variant: { style: 'classic', layout: 'split' } },
      ]);

      const metrics = calculateThematicMetrics(configA, configB, [configA, configB]);

      expect(metrics).toHaveProperty('variantUniqueness');
      expect(metrics).toHaveProperty('variantOverlapRatio');
      expect(metrics).toHaveProperty('uniqueVariantDimensions');
      expect(metrics).toHaveProperty('thematicScore');

      expect(metrics.variantUniqueness).toBeGreaterThan(0);
      expect(metrics.variantOverlapRatio).toBeLessThan(1);
      expect(metrics.thematicScore).toBeGreaterThanOrEqual(0);
      expect(metrics.thematicScore).toBeLessThanOrEqual(100);
    });

    it('should clamp thematic score to 0-100 range', () => {
      const configA = createMockConfig([{ type: 'hero', variant: { style: 'modern' } }]);
      const configB = createMockConfig([{ type: 'hero', variant: { style: 'classic' } }]);

      const metrics = calculateThematicMetrics(configA, configB, [configA, configB]);

      expect(metrics.thematicScore).toBeGreaterThanOrEqual(0);
      expect(metrics.thematicScore).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateAverageThematicDiversity', () => {
    it('should return 0 for single config', () => {
      const config = createMockConfig([{ type: 'hero', variant: { style: 'modern' } }]);

      const result = calculateAverageThematicDiversity([config]);
      expect(result).toBe(0);
    });

    it('should calculate average across multiple configs', () => {
      const config1 = createMockConfig([{ type: 'hero', variant: { style: 'modern' } }]);
      const config2 = createMockConfig([{ type: 'hero', variant: { style: 'classic' } }]);
      const config3 = createMockConfig([{ type: 'hero', variant: { style: 'minimal' } }]);

      const result = calculateAverageThematicDiversity([config1, config2, config3]);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('getVariantUsageSummary', () => {
    it('should return variant summary for config', () => {
      const config = createMockConfig([
        { type: 'hero', variant: { style: 'modern', layout: 'centered' } },
        { type: 'navigation', variant: { style: 'solid', layout: 'classic' } },
      ]);

      const summary = getVariantUsageSummary(config);

      expect(summary.size).toBe(2);
      expect(summary.get('hero')).toEqual({ style: 'modern', layout: 'centered' });
      expect(summary.get('navigation')).toEqual({ style: 'solid', layout: 'classic' });
    });
  });

  describe('findMostSimilarVariants', () => {
    it('should find most similar config by variant overlap', () => {
      const targetConfig = createMockConfig([{ type: 'hero', variant: { style: 'modern' } }]);
      const similarConfig = createMockConfig([{ type: 'hero', variant: { style: 'modern' } }]);
      const differentConfig = createMockConfig([{ type: 'hero', variant: { style: 'classic' } }]);

      const result = findMostSimilarVariants(targetConfig, [
        targetConfig,
        similarConfig,
        differentConfig,
      ]);

      expect(result.length).toBe(2);
      expect(result[0].overlapRatio).toBeGreaterThan(result[1].overlapRatio);
    });

    it('should exclude target config from results', () => {
      const targetConfig = createMockConfig([{ type: 'hero', variant: { style: 'modern' } }]);

      const result = findMostSimilarVariants(targetConfig, [targetConfig]);

      expect(result.length).toBe(0);
    });
  });
});
