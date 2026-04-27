/**
 * Diversity Scorer Tests
 *
 * Story 22.1: Diversity Scoring Framework - Main Scorer
 *
 * Tests for the main diversity scoring functionality including:
 * - Pairwise diversity calculation
 * - Diversity matrix generation
 * - Mode collapse detection
 * - Report generation
 *
 * @module __tests__/lib/diversity/diversity-scorer.test
 */

import {
  calculatePairwiseDiversity,
  generateDiversityMatrix,
  detectModeCollapse,
  calculatePerConfigStats,
  generateDiversityReport,
  scoreDiversity,
  interpretDiversityScore,
  exportDiversityReportToMarkdown,
} from '@/lib/diversity/diversity-scorer';
import type { HomepageConfig, DiversityScoringInput } from '@/lib/diversity/types';
import { DEFAULT_SCORING_CONFIG } from '@/lib/diversity/types';

describe('Diversity Scorer', () => {
  const createMockConfig = (
    generationId: string,
    components: Array<{ type: string; variant?: Record<string, any> }>,
    designTokens?: any
  ): HomepageConfig => ({
    generationId,
    timestamp: '2024-01-01T00:00:00Z',
    hotelParameters: {
      hotelName: 'Test Hotel',
      hotelType: 'luxury' as const,
      targetAudience: 'couples' as const,
      brandPersonality: 'elegant' as const,
      location: 'Paris, France',
    },
    components: components.map((c) => ({
      type: c.type,
      variant: c.variant || {},
      props: {},
      order: 0,
    })),
    layoutStructure: 'single-column',
    emphasisComponents: [],
    validationStatus: 'PASS',
    ...(designTokens && { designTokens }),
  });

  describe('calculatePairwiseDiversity', () => {
    it('should calculate complete pairwise diversity', () => {
      const configA = createMockConfig('hotel-a', [
        { type: 'hero', variant: { style: 'modern' } },
        { type: 'navigation', variant: { style: 'solid' } },
      ]);
      const configB = createMockConfig('hotel-b', [
        { type: 'hero', variant: { style: 'classic' } },
        { type: 'gallery', variant: { layout: 'grid' } },
      ]);

      const result = calculatePairwiseDiversity(
        'hotel-a',
        'hotel-b',
        configA,
        configB,
        [configA, configB],
        DEFAULT_SCORING_CONFIG
      );

      expect(result).toHaveProperty('configA', 'hotel-a');
      expect(result).toHaveProperty('configB', 'hotel-b');
      expect(result).toHaveProperty('structural');
      expect(result).toHaveProperty('thematic');
      expect(result).toHaveProperty('visual');
      expect(result).toHaveProperty('overallScore');
      expect(result).toHaveProperty('timestamp');

      expect(result.structural.structuralScore).toBeGreaterThanOrEqual(0);
      expect(result.thematic.thematicScore).toBeGreaterThanOrEqual(0);
      expect(result.visual.visualScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });

    it('should apply custom weights', () => {
      const configA = createMockConfig('hotel-a', [{ type: 'hero' }]);
      const configB = createMockConfig('hotel-b', [{ type: 'hero' }]);

      const customConfig = {
        ...DEFAULT_SCORING_CONFIG,
        weights: { structural: 0.5, thematic: 0.5, visual: 0 },
      };

      const result = calculatePairwiseDiversity(
        'hotel-a',
        'hotel-b',
        configA,
        configB,
        [configA, configB],
        customConfig
      );

      // With visual weight 0, visual score is still calculated (20 from hueDistance default 50 * 0.4)
      expect(result.visual.visualScore).toBeCloseTo(20, 1);
    });

    it('should skip visual metrics when disabled', () => {
      const configA = createMockConfig('hotel-a', [{ type: 'hero' }]);
      const configB = createMockConfig('hotel-b', [{ type: 'hero' }]);

      const customConfig = {
        ...DEFAULT_SCORING_CONFIG,
        includeVisualMetrics: false,
      };

      const result = calculatePairwiseDiversity(
        'hotel-a',
        'hotel-b',
        configA,
        configB,
        [configA, configB],
        customConfig
      );

      expect(result.visual.visualScore).toBe(50); // Neutral when disabled
      expect(result.visual.hueDistance).toBe(0);
    });
  });

  describe('generateDiversityMatrix', () => {
    it('should create diversity matrix from comparisons', () => {
      const comparisons = [
        {
          configA: 'hotel-a',
          configB: 'hotel-b',
          structural: { structuralScore: 80 } as any,
          thematic: { thematicScore: 70 } as any,
          visual: { visualScore: 60 } as any,
          overallScore: 70,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          configA: 'hotel-a',
          configB: 'hotel-c',
          structural: { structuralScore: 50 } as any,
          thematic: { thematicScore: 40 } as any,
          visual: { visualScore: 30 } as any,
          overallScore: 40,
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      const matrix = generateDiversityMatrix(comparisons);

      expect(matrix['hotel-a']['hotel-a']).toBe(100); // Self-comparison
      expect(matrix['hotel-a']['hotel-b']).toBe(70);
      expect(matrix['hotel-b']['hotel-a']).toBe(70);
      expect(matrix['hotel-a']['hotel-c']).toBe(40);
      expect(matrix['hotel-c']['hotel-a']).toBe(40);
    });

    it('should handle empty comparisons', () => {
      const matrix = generateDiversityMatrix([]);
      expect(matrix).toEqual({});
    });
  });

  describe('detectModeCollapse', () => {
    it('should detect pairs with low diversity scores', () => {
      const comparisons = [
        {
          configA: 'hotel-a',
          configB: 'hotel-b',
          structural: { structuralScore: 100 } as any,
          thematic: { thematicScore: 100 } as any,
          visual: { visualScore: 100 } as any,
          overallScore: 85,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          configA: 'hotel-a',
          configB: 'hotel-c',
          structural: { structuralScore: 20 } as any,
          thematic: { thematicScore: 30 } as any,
          visual: { visualScore: 25 } as any,
          overallScore: 25,
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      // Threshold of 70 means score < 30 is mode collapse
      const result = detectModeCollapse(comparisons, 70);

      expect(result).toHaveLength(1);
      expect(result[0].configA).toBe('hotel-a');
      expect(result[0].configB).toBe('hotel-c');
      expect(result[0].score).toBe(25);
      expect(result[0].threshold).toBe(30);
    });

    it('should return empty array when no mode collapse', () => {
      const comparisons = [
        {
          configA: 'hotel-a',
          configB: 'hotel-b',
          structural: { structuralScore: 80 } as any,
          thematic: { thematicScore: 70 } as any,
          visual: { visualScore: 60 } as any,
          overallScore: 70,
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      const result = detectModeCollapse(comparisons, 70);
      expect(result).toHaveLength(0);
    });
  });

  describe('calculatePerConfigStats', () => {
    it('should calculate per-config statistics', () => {
      const comparisons = [
        {
          configA: 'hotel-a',
          configB: 'hotel-b',
          structural: { structuralScore: 20 } as any,
          thematic: { thematicScore: 30 } as any,
          visual: { visualScore: 25 } as any,
          overallScore: 25,
          timestamp: '2024-01-01T00:00:00Z',
        },
        {
          configA: 'hotel-a',
          configB: 'hotel-c',
          structural: { structuralScore: 80 } as any,
          thematic: { thematicScore: 70 } as any,
          visual: { visualScore: 60 } as any,
          overallScore: 70,
          timestamp: '2024-01-01T00:00:00Z',
        },
      ];

      const result = calculatePerConfigStats('hotel-a', comparisons);

      expect(result.averageDiversity).toBeCloseTo(47.5, 1); // (25 + 70) / 2
      expect(result.mostSimilar).toBe('hotel-b'); // Lower score = more similar
      expect(result.leastSimilar).toBe('hotel-c'); // Higher score = more different
    });

    it('should return N/A for configs with no comparisons', () => {
      const result = calculatePerConfigStats('hotel-a', []);

      expect(result.averageDiversity).toBe(50);
      expect(result.mostSimilar).toBe('N/A');
      expect(result.leastSimilar).toBe('N/A');
    });
  });

  describe('generateDiversityReport', () => {
    it('should generate complete diversity report', () => {
      const input: DiversityScoringInput = {
        configs: [
          {
            id: 'hotel-a',
            config: createMockConfig('hotel-a', [
              { type: 'hero', variant: { style: 'modern' } },
            ]),
          },
          {
            id: 'hotel-b',
            config: createMockConfig('hotel-b', [
              { type: 'hero', variant: { style: 'classic' } },
            ]),
          },
          {
            id: 'hotel-c',
            config: createMockConfig('hotel-c', [
              { type: 'hero', variant: { style: 'minimal' } },
            ]),
          },
        ],
      };

      const report = generateDiversityReport(input);

      expect(report).toHaveProperty('reportId');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('configsAnalyzed');
      expect(report).toHaveProperty('pairwiseComparisons');
      expect(report).toHaveProperty('aggregateScores');
      expect(report).toHaveProperty('diversityMatrix');
      expect(report).toHaveProperty('modeCollapsePairs');
      expect(report).toHaveProperty('perConfigStats');

      expect(report.configsAnalyzed).toEqual(['hotel-a', 'hotel-b', 'hotel-c']);
      expect(report.pairwiseComparisons).toHaveLength(3); // 3 pairs from 3 configs
      expect(report.pairwiseComparisons[0].overallScore).toBeGreaterThanOrEqual(0);
      expect(report.pairwiseComparisons[0].overallScore).toBeLessThanOrEqual(100);
    });

    it('should throw error for less than 2 configs', () => {
      const input: DiversityScoringInput = {
        configs: [
          {
            id: 'hotel-a',
            config: createMockConfig('hotel-a', [{ type: 'hero' }]),
          },
        ],
      };

      expect(() => generateDiversityReport(input)).toThrow(
        'At least 2 configs are required'
      );
    });

    it('should include per-config stats', () => {
      const input: DiversityScoringInput = {
        configs: [
          {
            id: 'hotel-a',
            config: createMockConfig('hotel-a', [{ type: 'hero' }]),
          },
          {
            id: 'hotel-b',
            config: createMockConfig('hotel-b', [{ type: 'hero' }]),
          },
        ],
      };

      const report = generateDiversityReport(input);

      expect(Object.keys(report.perConfigStats)).toContain('hotel-a');
      expect(Object.keys(report.perConfigStats)).toContain('hotel-b');
      expect(report.perConfigStats['hotel-a']).toHaveProperty('averageDiversity');
      expect(report.perConfigStats['hotel-a']).toHaveProperty('mostSimilar');
      expect(report.perConfigStats['hotel-a']).toHaveProperty('leastSimilar');
    });
  });

  describe('scoreDiversity', () => {
    it('should return overall diversity score for two configs', () => {
      const configA = createMockConfig('hotel-a', [
        { type: 'hero', variant: { style: 'modern' } },
      ]);
      const configB = createMockConfig('hotel-b', [
        { type: 'hero', variant: { style: 'classic' } },
      ]);

      const score = scoreDiversity(configA, configB);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('interpretDiversityScore', () => {
    it('should return excellent for high scores', () => {
      const result = interpretDiversityScore(85);

      expect(result.level).toBe('Excellent');
      expect(result.description).toBe('High diversity - configs are visually distinct');
      expect(result.color).toBe('green');
    });

    it('should return good for medium-high scores', () => {
      const result = interpretDiversityScore(70);

      expect(result.level).toBe('Good');
      expect(result.color).toBe('yellow');
    });

    it('should return fair for medium-low scores', () => {
      const result = interpretDiversityScore(50);

      expect(result.level).toBe('Fair');
      expect(result.color).toBe('orange');
    });

    it('should return poor for low scores', () => {
      const result = interpretDiversityScore(30);

      expect(result.level).toBe('Poor');
      expect(result.description).toContain('Mode collapse');
      expect(result.color).toBe('red');
    });
  });

  describe('exportDiversityReportToMarkdown', () => {
    it('should generate markdown report', () => {
      const mockReport: any = {
        reportId: 'test-report-id',
        timestamp: '2024-01-01T00:00:00Z',
        configsAnalyzed: ['hotel-a', 'hotel-b', 'hotel-c'],
        pairwiseComparisons: [],
        aggregateScores: {
          averageStructural: 75,
          averageThematic: 65,
          averageVisual: 55,
          overall: 68,
        },
        diversityMatrix: {},
        modeCollapsePairs: [],
        perConfigStats: {
          'hotel-a': {
            averageDiversity: 70,
            mostSimilar: 'hotel-b',
            leastSimilar: 'hotel-c',
          },
          'hotel-b': {
            averageDiversity: 65,
            mostSimilar: 'hotel-a',
            leastSimilar: 'hotel-c',
          },
          'hotel-c': {
            averageDiversity: 60,
            mostSimilar: 'hotel-b',
            leastSimilar: 'hotel-a',
          },
        },
      };

      const markdown = exportDiversityReportToMarkdown(mockReport);

      expect(markdown).toContain('# Diversity Validation Report');
      expect(markdown).toContain('test-report-id');
      expect(markdown).toContain('## Aggregate Diversity Scores');
      expect(markdown).toContain('| Structural | 75.0% |');
      expect(markdown).toContain('| Thematic | 65.0% |');
      expect(markdown).toContain('| Visual | 55.0% |');
      expect(markdown).toContain('| **Overall** | **68.0%** |');
      expect(markdown).toContain('## Mode Collapse Detection');
      expect(markdown).toContain('✅ No mode collapse detected.');
      expect(markdown).toContain('## Per-Config Diversity Statistics');
    });

    it('should show mode collapse warnings when present', () => {
      const mockReport: any = {
        reportId: 'test-report-id',
        timestamp: '2024-01-01T00:00:00Z',
        configsAnalyzed: ['hotel-a', 'hotel-b'],
        pairwiseComparisons: [],
        aggregateScores: { averageStructural: 30, averageThematic: 25, averageVisual: 20, overall: 25 },
        diversityMatrix: {},
        modeCollapsePairs: [
          { configA: 'hotel-a', configB: 'hotel-b', score: 25, threshold: 30 },
        ],
        perConfigStats: {},
      };

      const markdown = exportDiversityReportToMarkdown(mockReport);

      expect(markdown).toContain('⚠️ 1 potentially similar pair(s) detected:');
      expect(markdown).toContain('| hotel-a | hotel-b | 25.0% |');
    });
  });
});
