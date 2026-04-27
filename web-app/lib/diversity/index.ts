/**
 * Diversity Scoring Module
 *
 * Story 22.1: Diversity Scoring Framework
 *
 * Exports all diversity scoring functionality.
 *
 * ## Quick Start
 *
 * ### Score Two Configs
 * ```typescript
 * import { scoreDiversity } from '@/lib/diversity';
 * const score = scoreDiversity(configA, configB); // 0-100
 * ```
 *
 * ### Generate Full Report
 * ```typescript
 * import { generateDiversityReport } from '@/lib/diversity';
 * const report = generateDiversityReport({
 *   configs: [
 *     { id: 'hotel-a', config: configA },
 *     { id: 'hotel-b', config: configB },
 *     // ... more configs
 *   ]
 * });
 * ```
 *
 * ### Interpret Scores
 * ```typescript
 * import { interpretDiversityScore } from '@/lib/diversity';
 * const interpretation = interpretDiversityScore(75);
 * // { level: 'Good', description: '...', color: 'yellow' }
 * ```
 *
 * ### Customize Weights
 * ```typescript
 * import { generateDiversityReport, DEFAULT_SCORING_CONFIG } from '@/lib/diversity';
 * const report = generateDiversityReport(input, {
 *   ...DEFAULT_SCORING_CONFIG,
 *   weights: { structural: 0.5, thematic: 0.3, visual: 0.2 }
 * });
 * ```
 *
 * ## Score Ranges
 * - 80-100: Excellent diversity (highly distinct)
 * - 60-79: Good diversity (acceptable variation)
 * - 40-59: Fair diversity (some similarities)
 * - 0-39: Poor diversity (mode collapse detected)
 *
 * @module lib/diversity
 */

// Types
export type {
  ComponentType,
  VariantDimension,
  StructuralMetrics,
  ThematicMetrics,
  VisualMetrics,
  PairwiseDiversity,
  DiversityReport,
  DiversityWeights,
  ScoringConfig,
  DesignTokens,
  DiversityScoringInput,
} from './types';

export { DEFAULT_SCORING_CONFIG } from './types';

// Main scorer
export {
  calculatePairwiseDiversity,
  generateDiversityMatrix,
  detectModeCollapse,
  calculatePerConfigStats,
  generateDiversityReport,
  scoreDiversity,
  interpretDiversityScore,
  exportDiversityReportToJson,
  exportDiversityReportToMarkdown,
  importDiversityReportFromJson,
  compareDiversityReports,
} from './diversity-scorer';

// Structural metrics
export {
  jaccardDistance,
  extractComponentTypes,
  calculateOrderingDifference,
  countLayoutVarieties,
  calculateLayoutVarietyScore,
  calculateStructuralMetrics,
  calculateAverageStructuralDiversity,
} from './metrics/structural-metric';

// Thematic metrics
export {
  extractVariantSelections,
  calculateVariantUniqueness,
  calculateVariantOverlapRatio,
  extractVariantDimensions,
  countUniqueDimensionValues,
  calculateThematicMetrics,
  calculateAverageThematicDiversity,
  getVariantUsageSummary,
  findMostSimilarVariants,
} from './metrics/thematic-metric';

// Visual metrics
export {
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
} from './metrics/visual-metric';
