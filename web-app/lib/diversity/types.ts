/**
 * Diversity Scoring Types
 *
 * Story 22.1: Diversity Scoring Framework
 *
 * Defines types for measuring structural, thematic, and visual diversity
 * between generated hotel website configurations.
 *
 * @module lib/diversity/types
 */

import type { HomepageConfig } from '@/app/langgraph/agents/schemas';

/**
 * Component type identifiers in the system
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
  | 'footer';

/**
 * CVA variant dimension identifiers
 *
 * These match the actual variant keys used in cva-variants.ts.
 * Since variant keys like 'style', 'layout', etc. are reused across components,
 * we use a union type of the actual dimension names from the CVA system.
 */
export type VariantDimension =
  // Hero variants (from heroVariants)
  | 'style' | 'layout' | 'overlay' | 'height'
  // Gallery variants (from galleryVariants)
  | 'spacing' | 'aspectRatio' | 'columns' | 'cardStyle'
  // Testimonials variants (from testimonialsVariants)
  // Navigation variants (from navigationVariants)
  // Amenities variants (from amenitiesVariants)
  | 'iconSize' | 'iconStyle'
  // Room card variants (from roomCardVariants)
  | 'variant' | 'imageHeight'
  // Booking widget variants (from bookingWidgetVariants)
  | 'theme'
  // Contact form variants (from contactFormVariants)
  | 'background'
  // About variants (from aboutVariants)
  | 'imagePosition' | 'textAlign'
  // Features variants (from featuresVariants)
  // FAQ variants (from faqVariants)
  // Footer variants (from footerVariants)
  ;

/**
 * Structural diversity metrics
 */
export interface StructuralMetrics {
  /**
   * Jaccard distance between component type sets
   * Range: 0-100, where 0 = identical sets, 100 = completely different
   */
  componentJaccardDistance: number;

  /**
   * Number of unique component types across configs
   */
  uniqueComponentCount: number;

  /**
   * Average difference in component ordering
   * Measures how differently components are arranged
   */
  orderingDifference: number;

  /**
   * Count of different layout structures used
   */
  layoutVariety: number;

  /**
   * Aggregate structural diversity score (0-100)
   */
  structuralScore: number;
}

/**
 * Thematic diversity metrics
 */
export interface ThematicMetrics {
  /**
   * Percentage of unique CVA variant selections
   * Range: 0-100, where 0 = all same variants, 100 = all different
   */
  variantUniqueness: number;

  /**
   * Variant overlap ratio between configs
   * Range: 0-1, where 0 = no overlap, 1 = complete overlap
   */
  variantOverlapRatio: number;

  /**
   * Count of unique variant dimensions used
   */
  uniqueVariantDimensions: number;

  /**
   * Count of distinct style variant values across configs
   */
  uniqueStyleCount: number;

  /**
   * Count of distinct layout variant values across configs
   */
  uniqueLayoutCount: number;

  /**
   * Count of distinct cardStyle variant values across configs
   */
  uniqueCardStyleCount: number;

  /**
   * Aggregate thematic diversity score (0-100)
   */
  thematicScore: number;
}

/**
 * Visual diversity metrics
 */
export interface VisualMetrics {
  /**
   * OKLCH hue distance (circular)
   * Range: 0-180 degrees
   */
  hueDistance: number;

  /**
   * Typography personality difference
   * Range: 0-100
   */
  typographyDifference: number;

  /**
   * Spacing density difference
   * Range: 0-100
   */
  spacingDifference: number;

  /**
   * Border radius difference
   * Range: 0-100
   */
  borderRadiusDifference: number;

  /**
   * Aggregate visual diversity score (0-100)
   */
  visualScore: number;
}

/**
 * Pairwise diversity comparison between two configs
 */
export interface PairwiseDiversity {
  /**
   * First config identifier (generation ID or hotel name)
   */
  configA: string;

  /**
   * Second config identifier
   */
  configB: string;

  /**
   * Structural metrics
   */
  structural: StructuralMetrics;

  /**
   * Thematic metrics
   */
  thematic: ThematicMetrics;

  /**
   * Visual metrics
   */
  visual: VisualMetrics;

  /**
   * Overall weighted diversity score (0-100)
   * Weights: Structural 40%, Thematic 30%, Visual 30%
   */
  overallScore: number;

  /**
   * Timestamp of comparison
   */
  timestamp: string;
}

/**
 * Aggregate diversity report for multiple configs
 */
export interface DiversityReport {
  /**
   * Report identifier
   */
  reportId: string;

  /**
   * Timestamp of report generation
   */
  timestamp: string;

  /**
   * Configs analyzed in this report
   */
  configsAnalyzed: string[];

  /**
   * All pairwise comparisons
   */
  pairwiseComparisons: PairwiseDiversity[];

  /**
   * Aggregate diversity scores
   */
  aggregateScores: {
    /**
     * Average structural diversity across all pairs
     */
    averageStructural: number;

    /**
     * Average thematic diversity across all pairs
     */
    averageThematic: number;

    /**
     * Average visual diversity across all pairs
     */
    averageVisual: number;

    /**
     * Overall weighted average diversity
     */
    overall: number;
  };

  /**
   * Diversity matrix (configId x configId)
   * Maps to overall scores for quick lookup
   */
  diversityMatrix: Record<string, Record<string, number>>;

  /**
   * Mode collapse detection
   */
  modeCollapsePairs: Array<{
    configA: string;
    configB: string;
    score: number;
    threshold: number;
  }>;

  /**
   * Per-config diversity statistics
   */
  perConfigStats: Record<string, {
    averageDiversity: number;
    mostSimilar: string;
    leastSimilar: string;
  }>;
}

/**
 * Scoring weights for diversity calculation
 */
export interface DiversityWeights {
  /**
   * Weight for structural diversity (default: 0.4)
   */
  structural: number;

  /**
   * Weight for thematic diversity (default: 0.3)
   */
  thematic: number;

  /**
   * Weight for visual diversity (default: 0.3)
   */
  visual: number;
}

/**
 * Scoring configuration
 */
export interface ScoringConfig {
  /**
   * Weights for each diversity dimension
   */
  weights: DiversityWeights;

  /**
   * Mode collapse threshold (default: 70)
   * Pairs with diversity scores BELOW this value are flagged as potential mode collapse
   * Low diversity score = high similarity = potential mode collapse
   */
  modeCollapseThreshold: number;

  /**
   * Whether to include visual metrics (requires design tokens)
   */
  includeVisualMetrics: boolean;
}

/**
 * Default scoring configuration
 */
export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  weights: {
    structural: 0.4,
    thematic: 0.3,
    visual: 0.3,
  },
  modeCollapseThreshold: 70,
  includeVisualMetrics: true,
};

/**
 * Design token information extracted from config
 * Used for visual diversity scoring
 */
export interface DesignTokens {
  /**
   * Primary color OKLCH hue (0-360)
   */
  primaryHue?: number;

  /**
   * Primary color OKLCH chroma (0-0.4)
   */
  primaryChroma?: number;

  /**
   * Primary color OKLCH lightness (0-1)
   */
  primaryLightness?: number;

  /**
   * Secondary color OKLCH hue (0-360)
   */
  secondaryHue?: number;

  /**
   * Typography personality
   */
  typographyPersonality?: string;

  /**
   * Spacing density
   */
  spacingDensity?: string;

  /**
   * Border radius style
   */
  borderRadius?: string;
}

/**
 * Input for diversity scoring
 */
export interface DiversityScoringInput {
  /**
   * Array of configs to analyze
   */
  configs: Array<{
    /**
     * Config identifier (generation ID or hotel name)
     */
    id: string;

    /**
     * Homepage config
     */
    config: HomepageConfig;
  }>;

  /**
   * Scoring configuration
   */
  config?: ScoringConfig;
}
