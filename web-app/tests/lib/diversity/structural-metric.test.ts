/**
 * Structural Metric Tests
 *
 * Story 22.1: Diversity Scoring Framework - Structural Metrics
 *
 * Tests for structural diversity calculation including:
 * - Jaccard distance for component sets
 * - Component ordering differences
 * - Layout variety scoring
 *
 * @module __tests__/lib/diversity/structural-metric.test
 */

import {
  jaccardDistance,
  extractComponentTypes,
  calculateOrderingDifference,
  calculateLayoutVarietyScore,
  calculateStructuralMetrics,
  calculateAverageStructuralDiversity,
} from '@/lib/diversity/metrics/structural-metric';
import type { HomepageConfig } from '@/app/langgraph/agents/schemas';

describe('Structural Metric', () => {
  describe('jaccardDistance', () => {
    it('should return 0 for identical sets', () => {
      const setA = new Set(['hero', 'navigation', 'rooms']);
      const setB = new Set(['hero', 'navigation', 'rooms']);

      const result = jaccardDistance(setA, setB);
      expect(result).toBe(0);
    });

    it('should return 1 for completely different sets', () => {
      const setA = new Set(['hero', 'navigation']);
      const setB = new Set(['rooms', 'gallery']);

      const result = jaccardDistance(setA, setB);
      expect(result).toBe(1);
    });

    it('should return 0.67 for partially overlapping sets', () => {
      const setA = new Set(['hero', 'navigation', 'rooms']);
      const setB = new Set(['hero', 'gallery', 'testimonials']);

      // Intersection: {hero} = 1
      // Union: {hero, navigation, rooms, gallery, testimonials} = 5
      // Jaccard similarity = 1/5 = 0.2
      // Jaccard distance = 1 - 0.2 = 0.8

      const result = jaccardDistance(setA, setB);
      expect(result).toBeCloseTo(0.8, 1);
    });

    it('should handle empty sets', () => {
      const setA = new Set<string>();
      const setB = new Set<string>();

      const result = jaccardDistance(setA, setB);
      expect(result).toBe(0);
    });
  });

  describe('extractComponentTypes', () => {
    const mockConfig: HomepageConfig = {
      generationId: 'test-v1',
      timestamp: '2024-01-01T00:00:00Z',
      hotelParameters: {
        hotelName: 'Test Hotel',
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        location: 'Paris, France',
      },
      components: [
        { type: 'hero', variant: {}, props: {}, order: 0 },
        { type: 'navigation', variant: {}, props: {}, order: 1 },
        { type: 'rooms', variant: {}, props: {}, order: 2 },
      ],
      layoutStructure: 'single-column',
      emphasisComponents: ['hero'],
      validationStatus: 'PASS',
    };

    it('should extract component types from config', () => {
      const types = extractComponentTypes(mockConfig);

      expect(types).toEqual(new Set(['hero', 'navigation', 'rooms']));
    });

    it('should handle empty component list', () => {
      const emptyConfig: HomepageConfig = {
        ...mockConfig,
        components: [],
      };

      const types = extractComponentTypes(emptyConfig);
      expect(types.size).toBe(0);
    });
  });

  describe('calculateOrderingDifference', () => {
    const createConfig = (components: Array<{ type: string; order: number }>): HomepageConfig => ({
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
        variant: {},
        props: {},
        order: c.order,
      })),
      layoutStructure: 'single-column',
      emphasisComponents: [],
      validationStatus: 'PASS',
    });

    it('should return 0 for identical ordering', () => {
      const configA = createConfig([
        { type: 'hero', order: 0 },
        { type: 'navigation', order: 1 },
        { type: 'rooms', order: 2 },
      ]);
      const configB = createConfig([
        { type: 'hero', order: 0 },
        { type: 'navigation', order: 1 },
        { type: 'rooms', order: 2 },
      ]);

      const result = calculateOrderingDifference(configA, configB);
      expect(result).toBe(0);
    });

    it('should return high score for reversed ordering', () => {
      const configA = createConfig([
        { type: 'hero', order: 0 },
        { type: 'navigation', order: 1 },
        { type: 'rooms', order: 2 },
      ]);
      const configB = createConfig([
        { type: 'rooms', order: 0 },
        { type: 'navigation', order: 1 },
        { type: 'hero', order: 2 },
      ]);

      const result = calculateOrderingDifference(configA, configB);
      expect(result).toBeGreaterThan(40); // Reversed components give ~44% difference
    });

    it('should handle different component sets', () => {
      const configA = createConfig([
        { type: 'hero', order: 0 },
        { type: 'rooms', order: 1 },
      ]);
      const configB = createConfig([
        { type: 'gallery', order: 0 },
        { type: 'testimonials', order: 1 },
      ]);

      const result = calculateOrderingDifference(configA, configB);
      expect(result).toBe(0); // No common components
    });
  });

  describe('calculateLayoutVarietyScore', () => {
    const createConfig = (
      layoutStructure: string,
      emphasisComponents: string[] = []
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
      components: [],
      layoutStructure,
      emphasisComponents,
      validationStatus: 'PASS',
    });

    it('should return 100 for different layout structures', () => {
      const configA = createConfig('single-column');
      const configB = createConfig('grid');

      const result = calculateLayoutVarietyScore(configA, configB);
      expect(result).toBe(100);
    });

    it('should return 0 for same layout structure and emphasis', () => {
      const configA = createConfig('single-column', ['hero']);
      const configB = createConfig('single-column', ['hero']);

      const result = calculateLayoutVarietyScore(configA, configB);
      expect(result).toBe(0);
    });

    it('should return intermediate score for different emphasis', () => {
      const configA = createConfig('single-column', ['hero']);
      const configB = createConfig('single-column', ['rooms']);

      const result = calculateLayoutVarietyScore(configA, configB);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateStructuralMetrics', () => {
    const createConfig = (
      components: Array<{ type: string; order: number }>,
      layoutStructure: string = 'single-column'
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
        variant: {},
        props: {},
        order: c.order,
      })),
      layoutStructure,
      emphasisComponents: [],
      validationStatus: 'PASS',
    });

    it('should calculate complete structural metrics', () => {
      const configA = createConfig([
        { type: 'hero', order: 0 },
        { type: 'navigation', order: 1 },
        { type: 'rooms', order: 2 },
      ]);
      const configB = createConfig([
        { type: 'hero', order: 0 },
        { type: 'gallery', order: 1 },
        { type: 'testimonials', order: 2 },
      ]);

      const metrics = calculateStructuralMetrics(configA, configB, [
        configA,
        configB,
      ]);

      expect(metrics).toHaveProperty('componentJaccardDistance');
      expect(metrics).toHaveProperty('uniqueComponentCount');
      expect(metrics).toHaveProperty('orderingDifference');
      expect(metrics).toHaveProperty('layoutVariety');
      expect(metrics).toHaveProperty('structuralScore');

      expect(metrics.componentJaccardDistance).toBeGreaterThan(0);
      expect(metrics.uniqueComponentCount).toBe(5); // hero, navigation, rooms, gallery, testimonials
      expect(metrics.structuralScore).toBeGreaterThanOrEqual(0);
      expect(metrics.structuralScore).toBeLessThanOrEqual(100);
    });

    it('should clamp structural score to 0-100 range', () => {
      const configA = createConfig([{ type: 'hero', order: 0 }]);
      const configB = createConfig([{ type: 'rooms', order: 0 }]);

      const metrics = calculateStructuralMetrics(configA, configB, [
        configA,
        configB,
      ]);

      expect(metrics.structuralScore).toBeGreaterThanOrEqual(0);
      expect(metrics.structuralScore).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateAverageStructuralDiversity', () => {
    const createConfig = (
      components: Array<{ type: string; order: number }>
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
        variant: {},
        props: {},
        order: c.order,
      })),
      layoutStructure: 'single-column',
      emphasisComponents: [],
      validationStatus: 'PASS',
    });

    it('should return 0 for single config', () => {
      const config = createConfig([{ type: 'hero', order: 0 }]);

      const result = calculateAverageStructuralDiversity([config]);
      expect(result).toBe(0);
    });

    it('should calculate average across multiple configs', () => {
      const config1 = createConfig([
        { type: 'hero', order: 0 },
        { type: 'navigation', order: 1 },
      ]);
      const config2 = createConfig([
        { type: 'hero', order: 0 },
        { type: 'gallery', order: 1 },
      ]);
      const config3 = createConfig([
        { type: 'rooms', order: 0 },
        { type: 'testimonials', order: 1 },
      ]);

      const result = calculateAverageStructuralDiversity([config1, config2, config3]);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });
});
