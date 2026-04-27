/**
 * Diversity Scorer
 *
 * Story 22.1: Diversity Scoring Framework
 *
 * Main entry point for diversity scoring. Combines structural, thematic, and visual
 * metrics to produce comprehensive diversity reports.
 *
 * @module lib/diversity/diversity-scorer
 */

import { v4 as uuidv4 } from 'uuid';
import type { HomepageConfig } from '@/app/langgraph/agents/schemas';
import type {
  DiversityReport,
  DiversityScoringInput,
  PairwiseDiversity,
  ScoringConfig,
} from './types';
import { DEFAULT_SCORING_CONFIG } from './types';
import {
  calculateStructuralMetrics,
  calculateAverageStructuralDiversity,
} from './metrics/structural-metric';
import {
  calculateThematicMetrics,
  calculateAverageThematicDiversity,
} from './metrics/thematic-metric';
import {
  calculateVisualMetrics,
  calculateAverageVisualDiversity,
} from './metrics/visual-metric';

/**
 * Calculate pairwise diversity between two configs
 *
 * @param configIdA Identifier for first config
 * @param configIdB Identifier for second config
 * @param configA First homepage config
 * @param configB Second homepage config
 * @param allConfigs All configs (for context)
 * @param config Scoring configuration
 * @returns Pairwise diversity comparison
 */
export function calculatePairwiseDiversity(
  configIdA: string,
  configIdB: string,
  configA: HomepageConfig,
  configB: HomepageConfig,
  allConfigs: HomepageConfig[],
  scoringConfig: ScoringConfig = DEFAULT_SCORING_CONFIG
): PairwiseDiversity {
  // Calculate structural metrics (always)
  const structural = calculateStructuralMetrics(configA, configB, allConfigs);

  // Calculate thematic metrics (always)
  const thematic = calculateThematicMetrics(configA, configB, allConfigs);

  // Calculate visual metrics (optional, requires design tokens)
  const visual = scoringConfig.includeVisualMetrics
    ? calculateVisualMetrics(configA, configB)
    : {
        hueDistance: 0,
        typographyDifference: 0,
        spacingDifference: 0,
        borderRadiusDifference: 0,
        visualScore: 50, // Neutral score when disabled
      };

  // Calculate overall weighted score
  const overallScore =
    structural.structuralScore * scoringConfig.weights.structural +
    thematic.thematicScore * scoringConfig.weights.thematic +
    visual.visualScore * scoringConfig.weights.visual;

  return {
    configA: configIdA,
    configB: configIdB,
    structural,
    thematic,
    visual,
    overallScore: Math.min(100, Math.max(0, overallScore)),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate diversity matrix from pairwise comparisons
 *
 * @param comparisons Pairwise diversity comparisons
 * @returns Diversity matrix (configId -> configId -> score)
 */
export function generateDiversityMatrix(
  comparisons: PairwiseDiversity[]
): Record<string, Record<string, number>> {
  const matrix: Record<string, Record<string, number>> = {};
  const allConfigIds = new Set<string>();

  // Collect all config IDs
  for (const comp of comparisons) {
    allConfigIds.add(comp.configA);
    allConfigIds.add(comp.configB);
  }

  // Initialize matrix with diagonal (self-comparison = 100)
  for (const id of allConfigIds) {
    matrix[id] = { [id]: 100 };
  }

  // Fill in pairwise scores
  for (const comp of comparisons) {
    matrix[comp.configA][comp.configB] = comp.overallScore;
    matrix[comp.configB][comp.configA] = comp.overallScore;
  }

  return matrix;
}

/**
 * Detect mode collapse pairs
 *
 * Mode collapse = configs that are too similar (above threshold)
 *
 * @param comparisons Pairwise diversity comparisons
 * @param threshold Similarity threshold (default: 70 means >70% similarity = collapse)
 * @returns Array of mode collapse pairs
 */
export function detectModeCollapse(
  comparisons: PairwiseDiversity[],
  threshold: number = 70
): Array<{ configA: string; configB: string; score: number; threshold: number }> {
  // Mode collapse = low diversity score = high similarity
  // Score is 0-100 where 100 = most diverse
  // So mode collapse is when score < (100 - threshold)
  // Or equivalently, when (100 - score) > threshold
  const modeCollapseThreshold = 100 - threshold;

  return comparisons
    .filter((comp) => comp.overallScore < modeCollapseThreshold)
    .map((comp) => ({
      configA: comp.configA,
      configB: comp.configB,
      score: comp.overallScore,
      threshold: modeCollapseThreshold,
    }));
}

/**
 * Calculate aggregate diversity scores from pairwise comparisons
 *
 * Computes average structural, thematic, and visual diversity across all comparisons.
 *
 * @param comparisons Pairwise diversity comparisons
 * @returns Aggregate scores
 */
export function calculateAggregateScores(comparisons: PairwiseDiversity[]): {
  averageStructural: number;
  averageThematic: number;
  averageVisual: number;
  overall: number;
} {
  if (comparisons.length === 0) {
    return {
      averageStructural: 50,
      averageThematic: 50,
      averageVisual: 50,
      overall: 50,
    };
  }

  const totalStructural = comparisons.reduce(
    (sum, comp) => sum + comp.structural.structuralScore,
    0
  );
  const totalThematic = comparisons.reduce(
    (sum, comp) => sum + comp.thematic.thematicScore,
    0
  );
  const totalVisual = comparisons.reduce(
    (sum, comp) => sum + comp.visual.visualScore,
    0
  );
  const totalOverall = comparisons.reduce(
    (sum, comp) => sum + comp.overallScore,
    0
  );

  const count = comparisons.length;
  return {
    averageStructural: totalStructural / count,
    averageThematic: totalThematic / count,
    averageVisual: totalVisual / count,
    overall: totalOverall / count,
  };
}

/**
 * Calculate per-config diversity statistics (for all configs)
 *
 * @param configs All configs with metadata
 * @param comparisons All pairwise comparisons
 * @returns Per-config statistics for all configs
 */
export function calculatePerConfigStatsAll(
  configs: Array<{ id: string; config: HomepageConfig }>,
  comparisons: PairwiseDiversity[]
): Record<string, {
  averageDiversity: number;
  mostSimilar: string;
  leastSimilar: string;
}> {
  const stats: Record<string, {
    averageDiversity: number;
    mostSimilar: string;
    leastSimilar: string;
  }> = {};

  for (const { id } of configs) {
    stats[id] = calculatePerConfigStats(id, comparisons);
  }

  return stats;
}

/**
 * Calculate per-config diversity statistics
 *
 * @param configId Config to calculate stats for
 * @param comparisons All pairwise comparisons
 * @returns Per-config statistics
 */
export function calculatePerConfigStats(
  configId: string,
  comparisons: PairwiseDiversity[]
): { averageDiversity: number; mostSimilar: string; leastSimilar: string } {
  // Find all comparisons involving this config
  const relevantComparisons = comparisons.filter(
    (comp) => comp.configA === configId || comp.configB === configId
  );

  if (relevantComparisons.length === 0) {
    return { averageDiversity: 50, mostSimilar: 'N/A', leastSimilar: 'N/A' };
  }

  // Calculate average diversity
  const totalDiversity = relevantComparisons.reduce(
    (sum, comp) => sum + comp.overallScore,
    0
  );
  const averageDiversity = totalDiversity / relevantComparisons.length;

  // Find most and least similar
  let mostSimilar = relevantComparisons[0];
  let leastSimilar = relevantComparisons[0];

  for (const comp of relevantComparisons) {
    if (comp.overallScore < mostSimilar.overallScore) {
      mostSimilar = comp;
    }
    if (comp.overallScore > leastSimilar.overallScore) {
      leastSimilar = comp;
    }
  }

  return {
    averageDiversity,
    mostSimilar:
      mostSimilar.configA === configId ? mostSimilar.configB : mostSimilar.configA,
    leastSimilar:
      leastSimilar.configA === configId ? leastSimilar.configB : leastSimilar.configA,
  };
}

/**
 * Generate comprehensive diversity report
 *
 * @param input Diversity scoring input
 * @returns Complete diversity report
 */
export function generateDiversityReport(input: DiversityScoringInput): DiversityReport {
  const config = input.config || DEFAULT_SCORING_CONFIG;
  const configs = input.configs;

  if (configs.length < 2) {
    throw new Error('At least 2 configs are required for diversity scoring');
  }

  // Extract raw configs and IDs
  const configMap = new Map<string, HomepageConfig>();
  const configIds: string[] = [];

  for (const item of configs) {
    configMap.set(item.id, item.config);
    configIds.push(item.id);
  }

  const rawConfigs = Array.from(configMap.values());

  // Calculate all pairwise comparisons
  // Performance note: For N configs, generates N*(N-1)/2 comparisons
  // For 50 hotels (Story 22.5), this equals 1,225 comparisons
  // Consider sampling for very large batches (100+ configs)
  const pairwiseComparisons: PairwiseDiversity[] = [];

  for (let i = 0; i < rawConfigs.length; i++) {
    for (let j = i + 1; j < rawConfigs.length; j++) {
      const comparison = calculatePairwiseDiversity(
        configIds[i],
        configIds[j],
        rawConfigs[i],
        rawConfigs[j],
        rawConfigs,
        config
      );
      pairwiseComparisons.push(comparison);
    }
  }

  // Calculate aggregate scores
  const averageStructural = calculateAverageStructuralDiversity(rawConfigs);
  const averageThematic = calculateAverageThematicDiversity(rawConfigs);
  const averageVisual = calculateAverageVisualDiversity(rawConfigs);
  const overall =
    averageStructural * config.weights.structural +
    averageThematic * config.weights.thematic +
    averageVisual * config.weights.visual;

  // Generate diversity matrix
  const diversityMatrix = generateDiversityMatrix(pairwiseComparisons);

  // Detect mode collapse
  const modeCollapsePairs = detectModeCollapse(
    pairwiseComparisons,
    config.modeCollapseThreshold
  );

  // Calculate per-config stats
  const perConfigStats: Record<string, {
    averageDiversity: number;
    mostSimilar: string;
    leastSimilar: string;
  }> = {};

  for (const configId of configIds) {
    perConfigStats[configId] = calculatePerConfigStats(
      configId,
      pairwiseComparisons
    );
  }

  return {
    reportId: uuidv4(),
    timestamp: new Date().toISOString(),
    configsAnalyzed: configIds,
    pairwiseComparisons,
    aggregateScores: {
      averageStructural,
      averageThematic,
      averageVisual,
      overall: Math.min(100, Math.max(0, overall)),
    },
    diversityMatrix,
    modeCollapsePairs,
    perConfigStats,
  };
}

/**
 * Score diversity between two configs
 *
 * Convenience function for simple pairwise scoring.
 *
 * @param configA First homepage config
 * @param configB Second homepage config
 * @param config Scoring configuration
 * @returns Overall diversity score (0-100)
 */
export function scoreDiversity(
  configA: HomepageConfig,
  configB: HomepageConfig,
  scoringConfig: ScoringConfig = DEFAULT_SCORING_CONFIG
): number {
  const comparison = calculatePairwiseDiversity(
    'A',
    'B',
    configA,
    configB,
    [configA, configB],
    scoringConfig
  );
  return comparison.overallScore;
}

/**
 * Get diversity score interpretation
 *
 * @param score Diversity score (0-100)
 * @returns Human-readable interpretation
 */
export function interpretDiversityScore(score: number): {
  level: string;
  description: string;
  color: string;
} {
  if (score >= 80) {
    return {
      level: 'Excellent',
      description: 'High diversity - configs are visually distinct',
      color: 'green',
    };
  }
  if (score >= 60) {
    return {
      level: 'Good',
      description: 'Moderate diversity - acceptable variation',
      color: 'yellow',
    };
  }
  if (score >= 40) {
    return {
      level: 'Fair',
      description: 'Low diversity - some similarities detected',
      color: 'orange',
    };
  }
  return {
    level: 'Poor',
    description: 'Mode collapse detected - configs are very similar',
    color: 'red',
  };
}

/**
 * Export diversity report to JSON file
 *
 * @param report Diversity report to export
 * @param outputPath File path to write to
 */
export async function exportDiversityReportToJson(
  report: DiversityReport,
  outputPath: string
): Promise<void> {
  const fs = await import('fs/promises');
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
}

/**
 * Export diversity report summary to markdown
 *
 * @param report Diversity report to export
 * @returns Markdown string
 */
export function exportDiversityReportToMarkdown(report: DiversityReport): string {
  const lines: string[] = [];

  lines.push('# Diversity Validation Report');
  lines.push('');
  lines.push(`**Report ID:** ${report.reportId}`);
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');

  // Aggregate scores
  lines.push('## Aggregate Diversity Scores');
  lines.push('');
  lines.push('| Dimension | Score |');
  lines.push('|-----------|-------|');
  lines.push(
    `| Structural | ${report.aggregateScores.averageStructural.toFixed(1)}% |`
  );
  lines.push(
    `| Thematic | ${report.aggregateScores.averageThematic.toFixed(1)}% |`
  );
  lines.push(
    `| Visual | ${report.aggregateScores.averageVisual.toFixed(1)}% |`
  );
  lines.push('| | |');
  lines.push(
    `| **Overall** | **${report.aggregateScores.overall.toFixed(1)}%** |`
  );
  lines.push('');

  // Interpretation
  const interpretation = interpretDiversityScore(report.aggregateScores.overall);
  lines.push('**Assessment:** ' + interpretation.level);
  lines.push('**Description:** ' + interpretation.description);
  lines.push('');

  // Mode collapse detection
  lines.push('## Mode Collapse Detection');
  lines.push('');
  if (report.modeCollapsePairs.length === 0) {
    lines.push('✅ No mode collapse detected.');
  } else {
    lines.push(`⚠️ ${report.modeCollapsePairs.length} potentially similar pair(s) detected:`);
    lines.push('');
    lines.push('| Config A | Config B | Score |');
    lines.push('|----------|----------|-------|');
    for (const pair of report.modeCollapsePairs) {
      lines.push(
        `| ${pair.configA} | ${pair.configB} | ${pair.score.toFixed(1)}% |`
      );
    }
  }
  lines.push('');

  // Per-config stats
  lines.push('## Per-Config Diversity Statistics');
  lines.push('');
  lines.push('| Config | Avg Diversity | Most Similar | Least Similar |');
  lines.push('|--------|---------------|--------------|---------------|');
  for (const [configId, stats] of Object.entries(report.perConfigStats)) {
    lines.push(
      `| ${configId} | ${stats.averageDiversity.toFixed(1)}% | ${stats.mostSimilar} | ${stats.leastSimilar} |`
    );
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * Import diversity report from JSON file
 *
 * Loads a previously exported diversity report from disk.
 *
 * @param filePath File path to the JSON report
 * @returns Parsed diversity report
 */
export async function importDiversityReportFromJson(
  filePath: string
): Promise<DiversityReport> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as DiversityReport;
}

/**
 * Compare two diversity reports
 *
 * Compares two diversity reports to show changes in diversity over time.
 * Useful for tracking improvement after prompt tuning.
 *
 * @param reportA First diversity report (earlier)
 * @param reportB Second diversity report (later)
 * @returns Comparison summary
 */
export function compareDiversityReports(
  reportA: DiversityReport,
  reportB: DiversityReport
): {
  overallChange: number;
  structuralChange: number;
  thematicChange: number;
  visualChange: number;
  improved: boolean;
} {
  const overallChange = reportB.aggregateScores.overall - reportA.aggregateScores.overall;
  const structuralChange = reportB.aggregateScores.averageStructural - reportA.aggregateScores.averageStructural;
  const thematicChange = reportB.aggregateScores.averageThematic - reportA.aggregateScores.averageThematic;
  const visualChange = reportB.aggregateScores.averageVisual - reportA.aggregateScores.averageVisual;

  return {
    overallChange,
    structuralChange,
    thematicChange,
    visualChange,
    improved: overallChange > 0,
  };
}
