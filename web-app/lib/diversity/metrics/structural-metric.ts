/**
 * Structural Diversity Metric
 *
 * Story 22.1: Diversity Scoring Framework - Structural Dimension (40%)
 *
 * Measures structural diversity between hotel website configurations based on:
 * - Component type selection (Jaccard distance)
 * - Component ordering differences
 * - Layout structure variety
 *
 * @module lib/diversity/metrics/structural-metric
 */

import type { HomepageConfig } from '@/app/langgraph/agents/schemas';
import type { StructuralMetrics } from '../types';

/**
 * Calculate Jaccard distance between two sets
 *
 * Jaccard distance = 1 - Jaccard similarity
 * Jaccard similarity = |A ∩ B| / |A ∪ B|
 *
 * @param setA First set of items
 * @param setB Second set of items
 * @returns Jaccard distance (0-1, where 0 = identical, 1 = completely different)
 */
export function jaccardDistance<T>(setA: Set<T>, setB: Set<T>): number {
  const intersection = new Set<T>();
  for (const item of setA) {
    if (setB.has(item)) {
      intersection.add(item);
    }
  }

  const union = new Set<T>([...setA, ...setB]);

  if (union.size === 0) return 0;

  const similarity = intersection.size / union.size;
  return 1 - similarity;
}

/**
 * Extract component types from a homepage config
 *
 * @param config Homepage config to extract from
 * @returns Set of component type identifiers
 */
export function extractComponentTypes(config: HomepageConfig): Set<string> {
  const types = new Set<string>();

  for (const component of config.components) {
    types.add(component.type);
  }

  return types;
}

/**
 * Calculate component ordering difference
 *
 * Measures how differently components are arranged between two configs.
 * Uses normalized position variance.
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @returns Ordering difference score (0-100)
 */
export function calculateOrderingDifference(
  configA: HomepageConfig,
  configB: HomepageConfig
): number {
  // Create a map of component types to their positions
  const positionsA = new Map<string, number>();
  const positionsB = new Map<string, number>();

  configA.components.forEach((comp, index) => {
    positionsA.set(comp.type, index);
  });

  configB.components.forEach((comp, index) => {
    positionsB.set(comp.type, index);
  });

  // Get all unique component types
  const allTypes = new Set([...positionsA.keys(), ...positionsB.keys()]);

  if (allTypes.size === 0) return 0;

  // Calculate position differences for common components
  let totalDifference = 0;
  let commonCount = 0;

  for (const type of allTypes) {
    const posA = positionsA.get(type);
    const posB = positionsB.get(type);

    // Only count components that exist in both configs
    if (posA !== undefined && posB !== undefined) {
      const maxComponents = Math.max(configA.components.length, configB.components.length);
      const normalizedDiff = Math.abs(posA - posB) / maxComponents;
      totalDifference += normalizedDiff;
      commonCount++;
    }
  }

  if (commonCount === 0) return 0;

  // Normalize to 0-100 scale
  const avgDifference = totalDifference / commonCount;
  return avgDifference * 100;
}

/**
 * Count unique layout structures across configs
 *
 * @param configs Homepage configs to analyze
 * @returns Count of unique layout structures
 */
export function countLayoutVarieties(configs: HomepageConfig[]): number {
  const layoutStructures = new Set<string>();

  for (const config of configs) {
    // Create a signature based on layout structure
    const layoutSignature = config.layoutStructure;
    layoutStructures.add(layoutSignature);
  }

  return layoutStructures.size;
}

/**
 * Calculate layout variety score between two configs
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @returns Layout variety score (0-100)
 */
export function calculateLayoutVarietyScore(
  configA: HomepageConfig,
  configB: HomepageConfig
): number {
  // Different layout structures = high diversity
  if (configA.layoutStructure !== configB.layoutStructure) {
    return 100;
  }

  // Same layout structure, check emphasis components
  const emphasisA = new Set(configA.emphasisComponents || []);
  const emphasisB = new Set(configB.emphasisComponents || []);

  // If both have no emphasis components, they are identical (score = 0)
  if (emphasisA.size === 0 && emphasisB.size === 0) {
    return 0;
  }

  // Calculate Jaccard distance for emphasis components
  const emphasisDistance = jaccardDistance(emphasisA, emphasisB);

  // Return score based on emphasis difference
  return emphasisDistance * 100;
}

/**
 * Calculate structural diversity metrics between two configs
 *
 * Combines:
 * - Component Jaccard distance
 * - Ordering difference
 * - Layout variety
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @param allConfigs All configs (for layout variety context)
 * @returns Structural diversity metrics
 */
export function calculateStructuralMetrics(
  configA: HomepageConfig,
  configB: HomepageConfig,
  allConfigs: HomepageConfig[]
): StructuralMetrics {
  // Extract component type sets
  const typesA = extractComponentTypes(configA);
  const typesB = extractComponentTypes(configB);

  // Calculate Jaccard distance
  const componentJaccardDistance = jaccardDistance(typesA, typesB) * 100;

  // Count unique component types
  const allTypes = new Set([...typesA, ...typesB]);
  const uniqueComponentCount = allTypes.size;

  // Calculate ordering difference
  const orderingDifference = calculateOrderingDifference(configA, configB);

  // Calculate layout variety
  const layoutVariety = calculateLayoutVarietyScore(configA, configB);

  // Calculate aggregate structural score
  // Weights: Jaccard 50%, Ordering 25%, Layout 25%
  const structuralScore =
    componentJaccardDistance * 0.5 +
    orderingDifference * 0.25 +
    layoutVariety * 0.25;

  return {
    componentJaccardDistance,
    uniqueComponentCount,
    orderingDifference,
    layoutVariety,
    structuralScore: Math.min(100, Math.max(0, structuralScore)),
  };
}

/**
 * Calculate average structural diversity across all config pairs
 *
 * @param configs Array of homepage configs
 * @returns Average structural diversity score (0-100)
 */
export function calculateAverageStructuralDiversity(configs: HomepageConfig[]): number {
  if (configs.length < 2) return 0;

  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < configs.length; i++) {
    for (let j = i + 1; j < configs.length; j++) {
      const metrics = calculateStructuralMetrics(configs[i], configs[j], configs);
      totalScore += metrics.structuralScore;
      pairCount++;
    }
  }

  return pairCount > 0 ? totalScore / pairCount : 0;
}
