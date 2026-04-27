/**
 * Visual Diversity Metric
 *
 * Story 22.1: Diversity Scoring Framework - Visual Dimension (30%)
 *
 * Measures visual diversity between hotel website configurations based on:
 * - OKLCH color hue distance (circular)
 * - Typography personality differences
 * - Spacing density differences
 * - Border radius differences
 *
 * @module lib/diversity/metrics/visual-metric
 */

import type { HomepageConfig } from '@/app/langgraph/agents/schemas';
import type { VisualMetrics, DesignTokens } from '../types';

/**
 * Extract design tokens from a homepage config
 *
 * Design tokens may be present in the config (from TokenGenerator agent, Epic 20).
 * This function extracts available token information for visual diversity scoring.
 *
 * @param config Homepage config to extract from
 * @returns Design tokens from the config
 */
export function extractDesignTokens(config: HomepageConfig): DesignTokens {
  const tokens: DesignTokens = {};

  // Check if designTokens are present in the config (from Epic 20 TokenGenerator)
  if ('designTokens' in config && config.designTokens) {
    const designTokens = config.designTokens;

    // Extract color scheme
    if ('colorScheme' in designTokens && designTokens.colorScheme) {
      const colorScheme = designTokens.colorScheme as any;
      if ('primaryHue' in colorScheme) tokens.primaryHue = colorScheme.primaryHue;
      if ('primaryChroma' in colorScheme) tokens.primaryChroma = colorScheme.primaryChroma;
      if ('primaryLightness' in colorScheme) tokens.primaryLightness = colorScheme.primaryLightness;
      if ('secondaryHue' in colorScheme) tokens.secondaryHue = colorScheme.secondaryHue;
    }

    // Extract typography
    if ('typography' in designTokens && designTokens.typography) {
      const typography = designTokens.typography as any;
      if ('headingPersonality' in typography) {
        tokens.typographyPersonality = typography.headingPersonality;
      }
    }

    // Extract spacing
    if ('spacing' in designTokens && designTokens.spacing) {
      const spacing = designTokens.spacing as any;
      if ('density' in spacing) {
        tokens.spacingDensity = spacing.density;
      }
    }

    // Extract border radius (nested object with style, or flat string for backwards compat)
    if ('borderRadius' in designTokens && designTokens.borderRadius !== undefined) {
      const br = designTokens.borderRadius as any;
      tokens.borderRadius = typeof br === 'object' && br.style ? String(br.style) : String(br);
    }
  }

  return tokens;
}

/**
 * Calculate circular hue distance between two OKLCH hue values
 *
 * OKLCH hue is circular (0-360 degrees), so we need to calculate
 * the shortest distance around the circle.
 *
 * @param hueA First hue value (0-360)
 * @param hueB Second hue value (0-360)
 * @returns Circular hue distance (0-180 degrees)
 */
export function calculateHueDistance(hueA: number, hueB: number): number {
  const diff = Math.abs(hueA - hueB);
  return Math.min(diff, 360 - diff);
}

/**
 * Normalize hue distance to 0-100 scale
 *
 * @param hueDistance Circular hue distance (0-180)
 * @returns Normalized distance (0-100)
 */
export function normalizeHueDistance(hueDistance: number): number {
  return (hueDistance / 180) * 100;
}

/**
 * Calculate typography personality difference
 *
 * @param personalityA First typography personality
 * @param personalityB Second typography personality
 * @returns Typography difference score (0-100)
 */
export function calculateTypographyDifference(
  personalityA: string | undefined,
  personalityB: string | undefined
): number {
  // If both are undefined, they're the same (no difference)
  if (!personalityA && !personalityB) {
    return 0;
  }
  // If only one is undefined, return neutral score (50)
  // This represents uncertainty when we only have partial data
  if (!personalityA || !personalityB) {
    return 50;
  }

  // Same personality = no difference
  if (personalityA === personalityB) {
    return 0;
  }

  // Define personality categories for grouping
  const serifPersonalities = new Set(['serif-elegant', 'serif-readable']);
  const sansPersonalities = new Set(['sans-modern', 'humanist-organic']);
  const displayPersonalities = new Set(['display-decorative', 'slab-strong']);

  const aIsSerif = serifPersonalities.has(personalityA);
  const bIsSerif = serifPersonalities.has(personalityB);
  const aIsSans = sansPersonalities.has(personalityA);
  const bIsSans = sansPersonalities.has(personalityB);
  const aIsDisplay = displayPersonalities.has(personalityA);
  const bIsDisplay = displayPersonalities.has(personalityB);

  // Same category = lower difference
  if ((aIsSerif && bIsSerif) || (aIsSans && bIsSans) || (aIsDisplay && bIsDisplay)) {
    return 30;
  }

  // Different categories = higher difference
  return 70;
}

/**
 * Calculate spacing density difference
 *
 * @param densityA First spacing density
 * @param densityB Second spacing density
 * @returns Spacing difference score (0-100)
 */
export function calculateSpacingDifference(
  densityA: string | undefined,
  densityB: string | undefined
): number {
  // If both are undefined, they're the same (no difference)
  if (!densityA && !densityB) {
    return 0;
  }
  // If only one is undefined, return neutral score (50)
  // This represents uncertainty when we only have partial data
  if (!densityA || !densityB) {
    return 50;
  }

  // Same density = no difference
  if (densityA === densityB) {
    return 0;
  }

  // Define density order
  const densityOrder = ['tight', 'comfortable', 'airy', 'spacious'];
  const indexA = densityOrder.indexOf(densityA);
  const indexB = densityOrder.indexOf(densityB);

  // If either is not in order, return high difference
  if (indexA === -1 || indexB === -1) {
    return 70;
  }

  // Calculate difference based on distance in order
  const maxDistance = densityOrder.length - 1;
  const distance = Math.abs(indexA - indexB);

  return (distance / maxDistance) * 100;
}

/**
 * Calculate border radius difference
 *
 * @param radiusA First border radius style
 * @param radiusB Second border radius style
 * @returns Border radius difference score (0-100)
 */
export function calculateBorderRadiusDifference(
  radiusA: string | undefined,
  radiusB: string | undefined
): number {
  // If both are undefined, they're the same (no difference)
  if (!radiusA && !radiusB) {
    return 0;
  }
  // If only one is undefined, return neutral score (50)
  // This represents uncertainty when we only have partial data
  if (!radiusA || !radiusB) {
    return 50;
  }

  // Same radius = no difference
  if (radiusA === radiusB) {
    return 0;
  }

  // Define radius order (sharp to pill)
  const radiusOrder = ['sharp', 'subtle', 'rounded', 'pill'];
  const indexA = radiusOrder.indexOf(radiusA);
  const indexB = radiusOrder.indexOf(radiusB);

  // If either is not in order, return high difference
  if (indexA === -1 || indexB === -1) {
    return 60;
  }

  // Calculate difference based on distance in order
  const maxDistance = radiusOrder.length - 1;
  const distance = Math.abs(indexA - indexB);

  return (distance / maxDistance) * 100;
}

/**
 * Calculate visual diversity metrics between two configs
 *
 * Combines individual visual metrics with internal weights:
 * - Hue distance (40%)
 * - Typography personality difference (25%)
 * - Spacing density difference (20%)
 * - Border radius difference (15%)
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @returns Visual diversity metrics
 */
export function calculateVisualMetrics(
  configA: HomepageConfig,
  configB: HomepageConfig
): VisualMetrics {
  // Extract design tokens
  const tokensA = extractDesignTokens(configA);
  const tokensB = extractDesignTokens(configB);

  // Calculate hue distance (average of primary and secondary)
  let hueDistance = 50; // Default neutral score

  if (tokensA.primaryHue !== undefined && tokensB.primaryHue !== undefined) {
    const primaryHueDist = calculateHueDistance(tokensA.primaryHue, tokensB.primaryHue);
    hueDistance = normalizeHueDistance(primaryHueDist);

    // If we have secondary hues, average them
    if (tokensA.secondaryHue !== undefined && tokensB.secondaryHue !== undefined) {
      const secondaryHueDist = calculateHueDistance(tokensA.secondaryHue, tokensB.secondaryHue);
      const secondaryNormalized = normalizeHueDistance(secondaryHueDist);
      hueDistance = (hueDistance + secondaryNormalized) / 2;
    }
  }

  // Calculate typography difference
  const typographyDifference = calculateTypographyDifference(
    tokensA.typographyPersonality,
    tokensB.typographyPersonality
  );

  // Calculate spacing difference
  const spacingDifference = calculateSpacingDifference(
    tokensA.spacingDensity,
    tokensB.spacingDensity
  );

  // Calculate border radius difference
  const borderRadiusDifference = calculateBorderRadiusDifference(
    tokensA.borderRadius,
    tokensB.borderRadius
  );

  // Calculate aggregate visual score
  // Weights: Hue 40%, Typography 25%, Spacing 20%, Border Radius 15%
  const visualScore =
    hueDistance * 0.4 +
    typographyDifference * 0.25 +
    spacingDifference * 0.2 +
    borderRadiusDifference * 0.15;

  return {
    hueDistance,
    typographyDifference,
    spacingDifference,
    borderRadiusDifference,
    visualScore: Math.min(100, Math.max(0, visualScore)),
  };
}

/**
 * Calculate average visual diversity across all config pairs
 *
 * @param configs Array of homepage configs
 * @returns Average visual diversity score (0-100)
 */
export function calculateAverageVisualDiversity(configs: HomepageConfig[]): number {
  if (configs.length < 2) return 0;

  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < configs.length; i++) {
    for (let j = i + 1; j < configs.length; j++) {
      const metrics = calculateVisualMetrics(configs[i], configs[j]);
      totalScore += metrics.visualScore;
      pairCount++;
    }
  }

  return pairCount > 0 ? totalScore / pairCount : 0;
}

/**
 * Get color palette summary for a config
 *
 * Useful for reporting color information.
 *
 * @param config Homepage config to analyze
 * @returns Color palette summary
 */
export function getColorPaletteSummary(config: HomepageConfig): {
  primaryHue?: number;
  secondaryHue?: number;
  primaryDescription: string;
  secondaryDescription: string;
} {
  const tokens = extractDesignTokens(config);

  const hueToDescription = (hue: number): string => {
    if (hue < 30 || hue >= 330) return 'Red';
    if (hue < 60) return 'Orange/Yellow';
    if (hue < 90) return 'Yellow/Green';
    if (hue < 150) return 'Green';
    if (hue < 210) return 'Cyan/Teal';
    if (hue < 270) return 'Blue';
    if (hue < 300) return 'Purple/Magenta';
    return 'Pink/Red';
  };

  return {
    primaryHue: tokens.primaryHue,
    secondaryHue: tokens.secondaryHue,
    primaryDescription: tokens.primaryHue !== undefined
      ? hueToDescription(tokens.primaryHue)
      : 'Not specified',
    secondaryDescription: tokens.secondaryHue !== undefined
      ? hueToDescription(tokens.secondaryHue)
      : 'Not specified',
  };
}

/**
 * Check if two configs have significantly different color schemes
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @param threshold Hue distance threshold (default: 45 degrees = 25%)
 * @returns True if colors are significantly different
 */
export function hasSignificantlyDifferentColors(
  configA: HomepageConfig,
  configB: HomepageConfig,
  threshold: number = 45
): boolean {
  const tokensA = extractDesignTokens(configA);
  const tokensB = extractDesignTokens(configB);

  if (tokensA.primaryHue === undefined || tokensB.primaryHue === undefined) {
    return false;
  }

  const hueDist = calculateHueDistance(tokensA.primaryHue, tokensB.primaryHue);
  return hueDist > threshold;
}
