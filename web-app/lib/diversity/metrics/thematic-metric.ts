/**
 * Thematic Diversity Metric
 *
 * Story 22.1: Diversity Scoring Framework - Thematic Dimension (30%)
 *
 * Measures thematic diversity between hotel website configurations based on:
 * - CVA variant selections per block
 * - Variant overlap ratio
 * - Variant dimension usage
 *
 * @module lib/diversity/metrics/thematic-metric
 */

import type { HomepageConfig } from '@/app/langgraph/agents/schemas';
import type { ThematicMetrics } from '../types';

/**
 * Extract all CVA variant selections from a config
 *
 * @param config Homepage config to extract from
 * @returns Map of component type to its variant selections
 */
export function extractVariantSelections(
  config: HomepageConfig
): Map<string, Record<string, string | number | boolean>> {
  const variants = new Map<string, Record<string, string | number | boolean>>();

  for (const component of config.components) {
    variants.set(component.type, component.variant);
  }

  return variants;
}

/**
 * Calculate variant uniqueness between two configs
 *
 * Measures what percentage of variant selections are unique (different).
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @returns Variant uniqueness percentage (0-100)
 */
export function calculateVariantUniqueness(
  configA: HomepageConfig,
  configB: HomepageConfig
): number {
  const variantsA = extractVariantSelections(configA);
  const variantsB = extractVariantSelections(configB);

  // Get all unique component types
  const allTypes = new Set([...variantsA.keys(), ...variantsB.keys()]);

  if (allTypes.size === 0) return 0;

  let differentCount = 0;
  let totalComparisons = 0;

  for (const type of allTypes) {
    const variantA = variantsA.get(type);
    const variantB = variantsB.get(type);

    // Only compare if both have this component type
    if (variantA && variantB) {
      // Compare each variant dimension
      const allKeys = new Set([...Object.keys(variantA), ...Object.keys(variantB)]);

      for (const key of allKeys) {
        const valueA = variantA[key];
        const valueB = variantB[key];

        totalComparisons++;

        if (valueA !== valueB) {
          differentCount++;
        }
      }
    }
  }

  if (totalComparisons === 0) return 0;

  return (differentCount / totalComparisons) * 100;
}

/**
 * Calculate variant overlap ratio between two configs
 *
 * Measures how much variant selections overlap.
 * Range: 0-1, where 0 = no overlap, 1 = complete overlap.
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @returns Variant overlap ratio (0-1)
 */
export function calculateVariantOverlapRatio(
  configA: HomepageConfig,
  configB: HomepageConfig
): number {
  const variantsA = extractVariantSelections(configA);
  const variantsB = extractVariantSelections(configB);

  // Get all unique component types
  const allTypes = new Set([...variantsA.keys(), ...variantsB.keys()]);

  if (allTypes.size === 0) return 0;

  let matchingCount = 0;
  let totalComparisons = 0;

  for (const type of allTypes) {
    const variantA = variantsA.get(type);
    const variantB = variantsB.get(type);

    // Only compare if both have this component type
    if (variantA && variantB) {
      // Compare each variant dimension
      const allKeys = new Set([...Object.keys(variantA), ...Object.keys(variantB)]);

      for (const key of allKeys) {
        const valueA = variantA[key];
        const valueB = variantB[key];

        totalComparisons++;

        if (valueA === valueB) {
          matchingCount++;
        }
      }
    }
  }

  if (totalComparisons === 0) return 0;

  return matchingCount / totalComparisons;
}

/**
 * Extract all unique variant dimensions used across configs
 *
 * @param configs Homepage configs to analyze
 * @returns Set of all variant dimension names used
 */
export function extractVariantDimensions(
  configs: HomepageConfig[]
): Set<string> {
  const dimensions = new Set<string>();

  for (const config of configs) {
    for (const component of config.components) {
      for (const key of Object.keys(component.variant)) {
        dimensions.add(key);
      }
    }
  }

  return dimensions;
}

/**
 * Count unique variant dimension values across configs
 *
 * @param configs Homepage configs to analyze
 * @param dimension Variant dimension to count
 * @returns Count of unique values for this dimension
 */
export function countUniqueDimensionValues(
  configs: HomepageConfig[],
  dimension: string
): number {
  const values = new Set<string | number | boolean>();

  for (const config of configs) {
    for (const component of config.components) {
      const value = component.variant[dimension];
      if (value !== undefined) {
        values.add(String(value));
      }
    }
  }

  return values.size;
}

/**
 * Calculate thematic diversity metrics between two configs
 *
 * Combines:
 * - Variant uniqueness (primary measure of diversity)
 * - Variant overlap ratio (inverse of uniqueness)
 * - Unique variant dimensions (contextual info)
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @param allConfigs All configs (for dimension context)
 * @returns Thematic diversity metrics
 */
export function calculateThematicMetrics(
  configA: HomepageConfig,
  configB: HomepageConfig,
  allConfigs: HomepageConfig[]
): ThematicMetrics {
  // Calculate variant uniqueness
  const variantUniqueness = calculateVariantUniqueness(configA, configB);

  // Calculate variant overlap ratio
  const variantOverlapRatio = calculateVariantOverlapRatio(configA, configB);

  // Get unique variant dimensions across all configs
  const allDimensions = extractVariantDimensions(allConfigs);
  const uniqueVariantDimensions = allDimensions.size;

  // Count distinct values for key variant dimensions
  // These correspond to the requirements: "how many distinct style, layout, cardStyle values"
  const uniqueStyleCount = countUniqueDimensionValues([configA, configB], 'style');
  const uniqueLayoutCount = countUniqueDimensionValues([configA, configB], 'layout');
  const uniqueCardStyleCount = countUniqueDimensionValues([configA, configB], 'cardStyle');

  // Calculate aggregate thematic score
  // Use variant uniqueness directly as it's the primary measure of diversity
  // Note: overlapInverse is redundant with variantUniqueness (both measure difference)
  const thematicScore = variantUniqueness;

  return {
    variantUniqueness,
    variantOverlapRatio,
    uniqueVariantDimensions,
    uniqueStyleCount,
    uniqueLayoutCount,
    uniqueCardStyleCount,
    thematicScore: Math.min(100, Math.max(0, thematicScore)),
  };
}

/**
 * Calculate average thematic diversity across all config pairs
 *
 * @param configs Array of homepage configs
 * @returns Average thematic diversity score (0-100)
 */
export function calculateAverageThematicDiversity(configs: HomepageConfig[]): number {
  if (configs.length < 2) return 0;

  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < configs.length; i++) {
    for (let j = i + 1; j < configs.length; j++) {
      const metrics = calculateThematicMetrics(configs[i], configs[j], configs);
      totalScore += metrics.thematicScore;
      pairCount++;
    }
  }

  return pairCount > 0 ? totalScore / pairCount : 0;
}

/**
 * Get variant usage summary for a config
 *
 * Useful for reporting which variants are being used.
 *
 * @param config Homepage config to analyze
 * @returns Map of component type to variant summary
 */
export function getVariantUsageSummary(
  config: HomepageConfig
): Map<string, Record<string, string>> {
  const summary = new Map<string, Record<string, string>>();

  for (const component of config.components) {
    const variantSummary: Record<string, string> = {};

    for (const [key, value] of Object.entries(component.variant)) {
      variantSummary[key] = String(value);
    }

    summary.set(component.type, variantSummary);
  }

  return summary;
}

/**
 * Find configs with most similar variant selections
 *
 * @param targetConfig Config to compare against
 * @param allConfigs All configs to search
 * @returns Array of [configId, overlapRatio] sorted by most similar
 */
export function findMostSimilarVariants(
  targetConfig: HomepageConfig,
  allConfigs: HomepageConfig[]
): Array<{ configId: string; overlapRatio: number }> {
  const similarities: Array<{ configId: string; overlapRatio: number }> = [];

  for (const config of allConfigs) {
    if (config === targetConfig) continue;

    const overlap = calculateVariantOverlapRatio(targetConfig, config);
    const configId = config.generationId || 'unknown';

    similarities.push({ configId, overlapRatio: overlap });
  }

  // Sort by overlap ratio descending (most similar first)
  similarities.sort((a, b) => b.overlapRatio - a.overlapRatio);

  return similarities;
}
