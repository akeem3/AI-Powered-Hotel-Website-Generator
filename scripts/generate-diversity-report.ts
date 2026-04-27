/**
 * Generate Diversity Report
 *
 * Story 22.3: Visual Comparison Matrix + Diversity Report
 *
 * Analyzes generated hotel website configurations and produces a comprehensive
 * diversity report with JSON and markdown outputs, including pairwise scores,
 * mode collapse detection, and improvement recommendations.
 *
 * Usage:
 *   npx tsx scripts/generate-diversity-report.ts [--input-dir <path>] [--output-dir <path>]
 *
 * @module scripts/generate-diversity-report
 */

import type { HomepageConfig } from '../web-app/app/langgraph/agents/schemas';
import { ARCHETYPE_PROFILES, getArchetypeForParameters } from '../web-app/fixtures/diversity/archetype-profiles';
import type {
  DiversityReport,
  DiversityScoringInput,
  PairwiseDiversity,
} from '../web-app/lib/diversity/types';
import {
  generateDiversityReport,
  generateDiversityMatrix,
  detectModeCollapse,
  calculatePerConfigStats,
  calculatePerConfigStatsAll,
} from '../web-app/lib/diversity/diversity-scorer';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generation summary structure from Story 22.2 batch generation
 */
interface GenerationSummary {
  timestamp: string;
  outputDirectory: string;
  totalProfiles: number;
  successCount: number;
  failCount: number;
  totalCost: number;
  averageCost: number;
  results: Array<{
    archetype: string;
    hotelName: string;
    success: boolean;
    generationId?: string;
    cost?: number;
    componentCount?: number;
    error?: string;
  }>;
}

/**
 * Loaded config with metadata
 */
interface LoadedConfig {
  id: string;
  config: HomepageConfig;
  archetype: string;
  hotelName: string;
  generationId?: string;
  cost?: number;
  componentCount?: number;
  timestamp?: string;
}

/**
 * CLI arguments for the report generator
 */
interface ReportArgs {
  inputDir: string;
  outputDir: string;
  sampleSize?: number;
  maxSimilarity?: number;
  scaleMode?: boolean;
}

/**
 * Parse command line arguments
 *
 * @returns Parsed CLI arguments
 */
function parseArgs(): ReportArgs {
  const args = process.argv.slice(2);
  const result: ReportArgs = {
    inputDir: 'web-app/output/diversity-validation',
    outputDir: 'output/diversity-validation',
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input-dir':
      case '-i':
        if (args[i + 1]) {
          result.inputDir = args[i + 1];
          i++;
        }
        break;
      case '--output-dir':
      case '-o':
        if (args[i + 1]) {
          result.outputDir = args[i + 1];
          i++;
        }
        break;
      case '--sample-size':
        if (args[i + 1]) {
          result.sampleSize = parseInt(args[i + 1], 10);
          i++;
        }
        break;
      case '--max-similarity':
        if (args[i + 1]) {
          result.maxSimilarity = parseFloat(args[i + 1]);
          i++;
        }
        break;
      case '--scale':
        result.scaleMode = true;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return result;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Generate Diversity Report - Story 22.3 / 22.5

USAGE:
  npx tsx scripts/generate-diversity-report.ts [OPTIONS]

OPTIONS:
  -i, --input-dir <path>     Input directory containing generated configs
                             Default: web-app/output/diversity-validation
  -o, --output-dir <path>    Output directory for reports
                             Default: output/diversity-validation
  --sample-size <n>          Number of pairwise comparisons to sample
                             Default: all pairs (use for scale test: 200)
  --max-similarity <pct>     Maximum allowed similarity (0-100)
                             Flags pairs exceeding this threshold (default: 85)
  --scale                    Scale test mode (equivalent to --sample-size 200)
  -h, --help                 Show this help message

DESCRIPTION:
  Analyzes generated hotel website configurations and produces a comprehensive
  diversity report including:
  - JSON report with pairwise diversity scores
  - Diversity matrix showing similarity scores
  - Markdown report with per-archetype breakdown
  - Mode collapse detection (>70% similarity threshold)
  - Similarity constraint validation (>85% flagged)
  - Cost data integration from generation summary

SCALE TEST MODE (Story 22.5):
  For large datasets (50+ configs), use sampling to reduce processing time:
  --sample-size 200 samples 200 random pairs (vs 1,225 full for 50 configs)
  --max-similarity 85 flags pairs with >85% similarity (uniqueness constraint)

EXAMPLES:
  npx tsx scripts/generate-diversity-report.ts
  npx tsx scripts/generate-diversity-report.ts --input-dir ./cycle3 --output-dir ./reports
  npx tsx scripts/generate-diversity-report.ts --scale --max-similarity 85
  npx tsx scripts/generate-diversity-report.ts --sample-size 100
`);
}

/**
 * Generate all possible pair combinations
 *
 * @param configs Array of configs
 * @returns Array of [indexA, indexB] pairs
 */
function generateAllPairs(configs: any[]): Array<[number, number]> {
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < configs.length; i++) {
    for (let j = i + 1; j < configs.length; j++) {
      pairs.push([i, j]);
    }
  }
  return pairs;
}

/**
 * Sample random pairs using Fisher-Yates shuffle
 *
 * @param configs Array of configs
 * @param sampleSize Number of pairs to sample
 * @returns Array of [indexA, indexB] pairs
 */
function samplePairs(configs: any[], sampleSize: number): Array<[number, number]> {
  const allPairs = generateAllPairs(configs);

  // If sample size is greater than or equal to total pairs, return all
  if (sampleSize >= allPairs.length) {
    return allPairs;
  }

  // Fisher-Yates shuffle to select random sample
  const shuffled = [...allPairs];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, sampleSize);
}

/**
 * Check similarity constraint (no two configs should have >X% similarity)
 *
 * @param comparisons Pairwise diversity comparisons
 * @param maxSimilarity Maximum allowed similarity (0-100, where 100 = identical)
 * @returns Array of pairs exceeding the similarity threshold
 */
function checkSimilarityConstraint(
  comparisons: import('../web-app/lib/diversity/types').PairwiseDiversity[],
  maxSimilarity: number
): Array<{
  configA: string;
  configB: string;
  similarity: number;
  constraint: number;
}> {
  const violations: Array<{
    configA: string;
    configB: string;
    similarity: number;
    constraint: number;
  }> = [];

  for (const comp of comparisons) {
    // Similarity = 100 - diversity score
    const similarity = 100 - comp.overallScore;
    if (similarity > maxSimilarity) {
      violations.push({
        configA: comp.configA,
        configB: comp.configB,
        similarity: Math.round(similarity * 10) / 10,
        constraint: maxSimilarity,
      });
    }
  }

  return violations;
}

/**
 * Calculate pairwise comparisons with optional sampling
 *
 * @param configs Loaded configs
 * @param sampleSize Optional sample size (undefined = all pairs)
 * @param onProgress Optional progress callback
 * @returns Pairwise diversity comparisons
 */
async function calculatePairwiseComparisons(
  configs: LoadedConfig[],
  sampleSize: number | undefined,
  onProgress?: (current: number, total: number) => void
): Promise<import('../web-app/lib/diversity/types').PairwiseDiversity[]> {
  const { calculatePairwiseDiversity } = await import('../web-app/lib/diversity/diversity-scorer');

  // Determine which pairs to compare
  const pairs = sampleSize !== undefined
    ? samplePairs(configs, sampleSize)
    : generateAllPairs(configs);

  const comparisons: import('../web-app/lib/diversity/types').PairwiseDiversity[] = [];
  const totalPairs = pairs.length;

  console.log(`\nCalculating ${totalPairs} pairwise comparisons...`);

  for (let i = 0; i < pairs.length; i++) {
    const [idxA, idxB] = pairs[i];
    const configA = configs[idxA];
    const configB = configs[idxB];

    const comparison = calculatePairwiseDiversity(
      configA.id,
      configB.id,
      configA.config,
      configB.config,
      configs.map((c) => c.config)
    );

    comparisons.push(comparison);

    // Progress reporting every 10% or every 10 pairs for small datasets
    const reportInterval = Math.max(10, Math.floor(totalPairs / 10));
    if ((i + 1) % reportInterval === 0 || i === pairs.length - 1) {
      const progress = ((i + 1) / totalPairs * 100).toFixed(1);
      console.log(`  Progress: ${i + 1}/${totalPairs} (${progress}%)`);
      if (onProgress) {
        onProgress(i + 1, totalPairs);
      }
    }
  }

  return comparisons;
}

/**
 * Resolve input directory to absolute path
 * Handles both relative and absolute paths, and tries multiple locations
 *
 * @param inputDir Input directory from CLI args
 * @returns Resolved absolute path
 */
function resolveInputDirectory(inputDir: string): string {
  // Try multiple possible locations for the input directory
  const possiblePaths = [
    path.resolve(process.cwd(), inputDir),           // From project root
    path.resolve(process.cwd(), 'web-app', inputDir), // web-app subdirectory
    path.resolve(__dirname, inputDir),               // Relative to script
  ];

  for (const resolvedPath of possiblePaths) {
    if (fs.existsSync(resolvedPath)) {
      return resolvedPath;
    }
  }

  // If none exist, return the first one (will error later if needed)
  return possiblePaths[0];
}

/**
 * Load generation summary from input directory
 *
 * @param inputDir Input directory path
 * @returns Generation summary or null if not found
 */
function loadGenerationSummary(inputDir: string): GenerationSummary | null {
  const summaryPath = path.join(inputDir, 'generation-summary.json');

  if (!fs.existsSync(summaryPath)) {
    console.warn(`⚠️  Generation summary not found at: ${summaryPath}`);
    console.warn('   Cost data will not be included in the report.');
    return null;
  }

  try {
    const content = fs.readFileSync(summaryPath, 'utf-8');
    const summary = JSON.parse(content) as GenerationSummary;
    console.log(`✓ Loaded generation summary: ${summary.successCount}/${summary.totalProfiles} successful`);
    return summary;
  } catch (error: any) {
    console.warn(`⚠️  Failed to parse generation summary: ${error.message}`);
    return null;
  }
}

/**
 * Map hotel name to archetype using ARCHETYPE_PROFILES
 *
 * Uses multiple matching strategies:
 * 1. Exact match on exampleHotelName
 * 2. Case-insensitive match on hotelName in parameters
 * 3. Partial match for hotel names with variations
 *
 * @param hotelName Hotel name from config
 * @returns Archetype name or 'unknown'
 */
function mapHotelToArchetype(hotelName: string): string {
  // Strategy 1: Exact match on exampleHotelName
  const exactMatch = ARCHETYPE_PROFILES.find(
    (profile) => profile.exampleHotelName === hotelName
  );
  if (exactMatch) {
    return exactMatch.archetype;
  }

  // Strategy 2: Case-insensitive match on parameters.hotelName
  const caseInsensitiveMatch = ARCHETYPE_PROFILES.find(
    (profile) => profile.parameters.hotelName.toLowerCase() === hotelName.toLowerCase()
  );
  if (caseInsensitiveMatch) {
    return caseInsensitiveMatch.archetype;
  }

  // Strategy 3: Partial match for variations (e.g., "The Pemberton Grand" vs "Pemberton Grand")
  const normalizedHotelName = hotelName.toLowerCase().replace(/^(the|hotel|resort)\s+/, '');
  const partialMatch = ARCHETYPE_PROFILES.find((profile) => {
    const profileName = profile.parameters.hotelName.toLowerCase().replace(/^(the|hotel|resort)\s+/, '');
    return profileName === normalizedHotelName || profileName.includes(normalizedHotelName);
  });
  if (partialMatch) {
    return partialMatch.archetype;
  }

  // Strategy 4: Try matching via hotel parameters if available
  // This would require the full config, but we can try to infer from known patterns
  const knownPatterns: Record<string, string> = {
    'pemberton': 'Heritage Opulence',
    'minima': 'Quiet Luxury',
    'hoxton': 'Boutique Editorial',
    'yotelair': 'Urban Tech-Forward',
    'one-only': 'Coastal Resort',
    'one & only': 'Coastal Resort',
    'explora': 'Mountain/Wilderness',
    'shambhala': 'Wellness/Spa',
    'como': 'Wellness/Spa',
    'taj': 'Heritage Cultural',
    '1 hotel': 'Eco Lodge',
    '21c': 'Design/Art Hotel',
    'club med': 'Family Resort',
    'marriott': 'Business Hotel',
  };

  const lowerHotelName = hotelName.toLowerCase();
  for (const [pattern, archetype] of Object.entries(knownPatterns)) {
    if (lowerHotelName.includes(pattern)) {
      return archetype;
    }
  }

  return 'unknown';
}

/**
 * Load all homepage configs from input directory
 *
 * Filters for files matching the pattern: homepage-config-*.json
 *
 * @param inputDir Input directory path
 * @returns Array of loaded configs with metadata
 */
function loadConfigs(inputDir: string): LoadedConfig[] {
  const files = fs.readdirSync(inputDir);
  const configFiles = files.filter((file) =>
    file.startsWith('homepage-config-') && file.endsWith('.json')
  );

  if (configFiles.length === 0) {
    throw new Error(`No homepage config files found in: ${inputDir}`);
  }

  console.log(`Found ${configFiles.length} config file(s)`);

  const loadedConfigs: LoadedConfig[] = [];
  const loadErrors: string[] = [];

  for (const file of configFiles) {
    const filePath = path.join(inputDir, file);

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const config = JSON.parse(content) as HomepageConfig;

      // Extract hotel name from config or file name
      const hotelName = config.hotelParameters?.hotelName ||
                       extractHotelNameFromFilename(file);

      // Map to archetype
      const archetype = mapHotelToArchetype(hotelName);

      // Extract generation ID if present
      const generationId = config.generationId ||
                          extractGenerationIdFromFilename(file);

      // Count components
      const componentCount = config.components?.length || 0;

      // Extract timestamp if present
      const timestamp = config.timestamp || undefined;

      loadedConfigs.push({
        id: generationId || file.replace('.json', ''),
        config,
        archetype,
        hotelName,
        generationId,
        componentCount,
        timestamp,
      });

      console.log(`  ✓ Loaded: ${hotelName} (${archetype})`);
    } catch (error: any) {
      const errorMsg = `Failed to load ${file}: ${error.message}`;
      loadErrors.push(errorMsg);
      console.warn(`  ✗ ${errorMsg}`);
    }
  }

  if (loadedConfigs.length === 0) {
    throw new Error('No valid configs could be loaded. Check file formats.');
  }

  if (loadErrors.length > 0) {
    console.warn(`\n⚠️  ${loadErrors.length} file(s) failed to load`);
  }

  return loadedConfigs;
}

/**
 * Extract hotel name from config filename
 *
 * @param filename Config filename (e.g., homepage-config-the-pemberton-grand-v123.json)
 * @returns Extracted hotel name
 */
function extractHotelNameFromFilename(filename: string): string {
  // Remove prefix and suffix
  const namePart = filename
    .replace('homepage-config-', '')
    .replace(/-v\d+\.json$/, '')
    .replace(/\.json$/, '');

  // Convert back to title case
  return namePart
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract generation ID from config filename
 *
 * @param filename Config filename
 * @returns Generation ID or undefined
 */
function extractGenerationIdFromFilename(filename: string): string | undefined {
  const match = filename.match(/homepage-config-(.+)\.json$/);
  return match ? match[1] : undefined;
}

/**
 * Enrich configs with cost data from generation summary
 *
 * @param configs Loaded configs
 * @param summary Generation summary (may be null)
 */
function enrichWithCostData(configs: LoadedConfig[], summary: GenerationSummary | null): void {
  if (!summary) {
    return;
  }

  // Create a map of hotel names to cost data
  const costMap = new Map<string, { cost?: number; componentCount?: number }>();

  for (const result of summary.results) {
    if (result.success && result.generationId) {
      costMap.set(result.generationId, {
        cost: result.cost,
        componentCount: result.componentCount,
      });
    }
    // Also map by hotel name for fallback
    costMap.set(result.hotelName.toLowerCase(), {
      cost: result.cost,
      componentCount: result.componentCount,
    });
  }

  // Apply cost data to configs
  for (const loadedConfig of configs) {
    // Try matching by generation ID first
    let costData = costMap.get(loadedConfig.generationId || '');

    // Fallback to hotel name matching
    if (!costData) {
      costData = costMap.get(loadedConfig.hotelName.toLowerCase());
    }

    if (costData) {
      if (costData.cost !== undefined && loadedConfig.cost === undefined) {
        loadedConfig.cost = costData.cost;
      }
      if (costData.componentCount !== undefined && loadedConfig.componentCount === undefined) {
        loadedConfig.componentCount = costData.componentCount;
      }
    }
  }
}

/**
 * Print summary of loaded configs
 *
 * @param configs Loaded configs
 * @param summary Generation summary
 */
function printLoadSummary(configs: LoadedConfig[], summary: GenerationSummary | null): void {
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('📊 Configs Loaded');
  console.log('');

  // Count by archetype
  const archetypeCounts: Record<string, number> = {};
  for (const config of configs) {
    archetypeCounts[config.archetype] = (archetypeCounts[config.archetype] || 0) + 1;
  }

  console.log('By Archetype:');
  for (const [archetype, count] of Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${archetype}: ${count}`);
  }

  console.log('');
  console.log(`Total configs: ${configs.length}`);

  if (summary) {
    console.log(`Total cost: $${summary.totalCost.toFixed(4)}`);
    console.log(`Average cost per generation: $${summary.averageCost.toFixed(4)}`);
  }

  console.log('──────────────────────────────────────────────────────────────');
}

/**
 * Enhanced diversity report with additional metadata
 */
interface EnhancedDiversityReport extends DiversityReport {
  /**
   * Per-archetype breakdown statistics
   */
  archetypeBreakdown: Record<string, {
    count: number;
    hotelNames: string[];
    averageDiversity?: number;
  }>;

  /**
   * Cost data from generation
   */
  costData?: {
    totalCost: number;
    averageCost: number;
    perConfigCost: Record<string, number>;
  };

  /**
   * Config metadata for reference
   */
  configMetadata: Record<string, {
    archetype: string;
    hotelName: string;
    generationId?: string;
    cost?: number;
    componentCount?: number;
  }>;

  /**
   * Similarity constraint violations (Story 22.5)
   */
  similarityConstraintViolations?: Array<{
    configA: string;
    configB: string;
    similarity: number;
    constraint: number;
  }>;

  /**
   * Sampling metadata (Story 22.5)
   */
  samplingInfo?: {
    totalPairs: number;
    sampledPairs: number;
    samplingRate: number;
  };
}

/**
 * Transform loaded configs into diversity scoring input format
 *
 * @param configs Loaded configs with metadata
 * @returns Diversity scoring input
 */
function transformToScoringInput(configs: LoadedConfig[]): DiversityScoringInput {
  return {
    configs: configs.map((loaded) => ({
      id: loaded.id,
      config: loaded.config,
    })),
  };
}

/**
 * Calculate per-archetype breakdown statistics
 *
 * @param configs Loaded configs
 * @param report Diversity report with pairwise comparisons
 * @returns Per-archetype breakdown
 */
function calculateArchetypeBreakdown(
  configs: LoadedConfig[],
  report: DiversityReport
): Record<string, {
  count: number;
  hotelNames: string[];
  averageDiversity?: number;
}> {
  const breakdown: Record<string, {
    count: number;
    hotelNames: string[];
    averageDiversity?: number;
  }> = {};

  // Group configs by archetype
  for (const config of configs) {
    const archetype = config.archetype;
    if (!breakdown[archetype]) {
      breakdown[archetype] = {
        count: 0,
        hotelNames: [],
      };
    }
    breakdown[archetype].count++;
    breakdown[archetype].hotelNames.push(config.hotelName);
  }

  // Calculate average diversity for each archetype
  for (const [archetype, data] of Object.entries(breakdown)) {
    // Find all pairwise comparisons involving configs from this archetype
    const archetypeConfigIds = configs
      .filter((c) => c.archetype === archetype)
      .map((c) => c.id);

    const relevantScores: number[] = [];

    for (const comparison of report.pairwiseComparisons) {
      // Only include comparisons where at least one config is from this archetype
      if (archetypeConfigIds.includes(comparison.configA) ||
          archetypeConfigIds.includes(comparison.configB)) {
        relevantScores.push(comparison.overallScore);
      }
    }

    // Calculate average
    if (relevantScores.length > 0) {
      data.averageDiversity = relevantScores.reduce((sum, score) => sum + score, 0) / relevantScores.length;
    }
  }

  return breakdown;
}

/**
 * Extract cost data from loaded configs
 *
 * @param configs Loaded configs
 * @returns Cost data summary
 */
function extractCostData(configs: LoadedConfig[]): {
  totalCost: number;
  averageCost: number;
  perConfigCost: Record<string, number>;
} {
  const perConfigCost: Record<string, number> = {};
  let totalCost = 0;
  let costCount = 0;

  for (const config of configs) {
    if (config.cost !== undefined) {
      perConfigCost[config.id] = config.cost;
      totalCost += config.cost;
      costCount++;
    }
  }

  const averageCost = costCount > 0 ? totalCost / costCount : 0;

  return {
    totalCost,
    averageCost,
    perConfigCost,
  };
}

/**
 * Build config metadata map
 *
 * @param configs Loaded configs
 * @returns Config metadata map
 */
function buildConfigMetadata(configs: LoadedConfig[]): Record<string, {
  archetype: string;
  hotelName: string;
  generationId?: string;
  cost?: number;
  componentCount?: number;
}> {
  const metadata: Record<string, {
    archetype: string;
    hotelName: string;
    generationId?: string;
    cost?: number;
    componentCount?: number;
  }> = {};

  for (const config of configs) {
    metadata[config.id] = {
      archetype: config.archetype,
      hotelName: config.hotelName,
      generationId: config.generationId,
      cost: config.cost,
      componentCount: config.componentCount,
    };
  }

  return metadata;
}

/**
 * Generate enhanced diversity report with archetype breakdown
 *
 * @param configs Loaded configs
 * @param modeCollapseThreshold Mode collapse detection threshold (default: 70)
 * @param sampleSize Optional sample size for pairwise comparisons
 * @param maxSimilarity Optional maximum similarity constraint
 * @returns Enhanced diversity report
 */
async function generateEnhancedDiversityReport(
  configs: LoadedConfig[],
  modeCollapseThreshold: number = 70,
  sampleSize?: number,
  maxSimilarity?: number
): Promise<EnhancedDiversityReport> {
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('Phase 2: Generating diversity scores...');
  console.log('');

  // Calculate pairwise comparisons with optional sampling
  const totalPairs = (configs.length * (configs.length - 1)) / 2;
  const useSampling = sampleSize !== undefined && sampleSize < totalPairs;

  if (useSampling) {
    console.log(`  Sampling: ${sampleSize} pairs from ${totalPairs} total (${((sampleSize / totalPairs) * 100).toFixed(1)}% of dataset)`);
  }

  const pairwiseComparisons = await calculatePairwiseComparisons(
    configs,
    sampleSize,
    (current, total) => {
      const progress = ((current / total) * 100).toFixed(1);
      process.stdout.write(`\r  Progress: ${current}/${total} (${progress}%)`);
      if (current === total) {
        process.stdout.write('\n');
      }
    }
  );

  console.log(`  ✓ Generated ${pairwiseComparisons.length} pairwise comparisons`);

  // Generate diversity matrix from comparisons
  const diversityMatrix = generateDiversityMatrix(pairwiseComparisons);
  console.log(`  ✓ Generated ${configs.length}×${configs.length} diversity matrix`);

  // Calculate aggregate scores
  const { calculateAggregateScores } = await import('../web-app/lib/diversity/diversity-scorer');
  const aggregateScores = calculateAggregateScores(pairwiseComparisons);

  // Calculate per-config stats
  const perConfigStats = calculatePerConfigStatsAll(configs, pairwiseComparisons);

  // Build base report
  const baseReport: DiversityReport = {
    reportId: `diversity-${Date.now()}`,
    timestamp: new Date().toISOString(),
    configsAnalyzed: configs.map((c) => c.id),
    pairwiseComparisons,
    diversityMatrix,
    aggregateScores,
    perConfigStats,
  };

  // Calculate archetype breakdown
  const archetypeBreakdown = calculateArchetypeBreakdown(configs, baseReport);
  console.log(`  ✓ Calculated breakdown for ${Object.keys(archetypeBreakdown).length} archetypes`);

  // Extract cost data
  const costData = extractCostData(configs);
  console.log(`  ✓ Extracted cost data ($${costData.totalCost.toFixed(4)} total)`);

  // Build config metadata
  const configMetadata = buildConfigMetadata(configs);

  // Detect mode collapse with custom threshold
  const modeCollapsePairs = detectModeCollapse(pairwiseComparisons, modeCollapseThreshold);
  console.log(`  ✓ Detected ${modeCollapsePairs.length} potential mode collapse pair(s)`);

  // Check similarity constraint if specified
  let similarityConstraintViolations: Array<{
    configA: string;
    configB: string;
    similarity: number;
    constraint: number;
  }> = [];

  if (maxSimilarity !== undefined) {
    similarityConstraintViolations = checkSimilarityConstraint(pairwiseComparisons, maxSimilarity);
    console.log(`  ✓ Checked similarity constraint (>${maxSimilarity}%): ${similarityConstraintViolations.length} violation(s)`);
  }

  // Build sampling info if using sampling
  let samplingInfo: {
    totalPairs: number;
    sampledPairs: number;
    samplingRate: number;
  } | undefined;

  if (useSampling) {
    samplingInfo = {
      totalPairs,
      sampledPairs: pairwiseComparisons.length,
      samplingRate: (pairwiseComparisons.length / totalPairs) * 100,
    };
    console.log(`  ✓ Sampling info: ${samplingInfo.sampledPairs}/${samplingInfo.totalPairs} pairs (${samplingInfo.samplingRate.toFixed(1)}%)`);
  }

  // Combine into enhanced report
  const enhancedReport: EnhancedDiversityReport = {
    ...baseReport,
    modeCollapsePairs,
    archetypeBreakdown,
    costData,
    configMetadata,
    similarityConstraintViolations,
    samplingInfo,
  };

  console.log('');
  console.log('Aggregate Scores:');
  console.log(`  Structural: ${aggregateScores.averageStructural.toFixed(1)}%`);
  console.log(`  Thematic:  ${aggregateScores.averageThematic.toFixed(1)}%`);
  console.log(`  Visual:    ${aggregateScores.averageVisual.toFixed(1)}%`);
  console.log(`  Overall:   ${aggregateScores.overall.toFixed(1)}%`);

  return enhancedReport;
}

/**
 * Export enhanced diversity report to JSON file
 *
 * Includes all required data from Story 22.3:
 * - All pairwise scores from diversity scorer
 * - Aggregate diversity matrix
 * - Per-archetype breakdown with component/variant/token information
 * - Cost data from generation summary
 * - Mode collapse pairs list
 *
 * @param report Enhanced diversity report
 * @param outputPath Output file path
 */
async function exportDiversityReportToJson(
  report: EnhancedDiversityReport,
  outputPath: string
): Promise<void> {
  const reportForExport = {
    // Report metadata
    reportId: report.reportId,
    timestamp: report.timestamp,
    configsAnalyzed: report.configsAnalyzed,

    // Aggregate scores
    aggregateScores: report.aggregateScores,

    // Diversity matrix (NxN where N = number of configs)
    diversityMatrix: report.diversityMatrix,

    // All pairwise comparisons
    pairwiseComparisons: report.pairwiseComparisons.map(comp => ({
      configA: comp.configA,
      configB: comp.configB,
      overallScore: comp.overallScore,
      structural: {
        score: comp.structural.structuralScore,
        componentJaccardDistance: comp.structural.componentJaccardDistance,
        uniqueComponentCount: comp.structural.uniqueComponentCount,
        orderingDifference: comp.structural.orderingDifference,
        layoutVariety: comp.structural.layoutVariety,
      },
      thematic: {
        score: comp.thematic.thematicScore,
        variantUniqueness: comp.thematic.variantUniqueness,
        variantOverlapRatio: comp.thematic.variantOverlapRatio,
        uniqueVariantDimensions: comp.thematic.uniqueVariantDimensions,
        uniqueStyleCount: comp.thematic.uniqueStyleCount,
        uniqueLayoutCount: comp.thematic.uniqueLayoutCount,
        uniqueCardStyleCount: comp.thematic.uniqueCardStyleCount,
      },
      visual: {
        score: comp.visual.visualScore,
        hueDistance: comp.visual.hueDistance,
        typographyDifference: comp.visual.typographyDifference,
        spacingDifference: comp.visual.spacingDifference,
        borderRadiusDifference: comp.visual.borderRadiusDifference,
      },
      timestamp: comp.timestamp,
    })),

    // Mode collapse detection
    modeCollapsePairs: report.modeCollapsePairs,
    modeCollapseThreshold: 70, // From story requirements

    // Per-archetype breakdown with detailed statistics
    archetypeBreakdown: report.archetypeBreakdown,

    // Config metadata for reference
    configMetadata: report.configMetadata,

    // Cost data from generation summary
    costData: report.costData,

    // Per-config statistics
    perConfigStats: report.perConfigStats,

    // Generation info
    generationInfo: {
      totalConfigs: report.configsAnalyzed.length,
      totalArchetypes: Object.keys(report.archetypeBreakdown).length,
      modeCollapsePairsCount: report.modeCollapsePairs.length,
      targetScore: 80, // From story requirements
      meetsTarget: report.aggregateScores.overall >= 80,
    },
  };

  await fs.promises.writeFile(outputPath, JSON.stringify(reportForExport, null, 2));
}

/**
 * Generate comprehensive markdown diversity report
 *
 * Story 22.3: Visual Comparison Matrix + Diversity Report
 *
 * Produces human-readable markdown report with:
 * - Overall diversity score with target (>80%) comparison
 * - Per-archetype breakdown (component selection, variant choices)
 * - Mode collapse pairs section (>70% similarity flagged)
 * - Cost data summary from generation summary
 * - Recommendations section for improvement
 *
 * @param report Enhanced diversity report
 * @param configs Loaded configs for reference
 * @param recommendations Optional recommendations array
 * @returns Markdown string
 */
function generateMarkdownReport(
  report: EnhancedDiversityReport,
  configs: LoadedConfig[],
  recommendations?: Recommendation[]
): string {
  const lines: string[] = [];

  // Header
  lines.push('# Diversity Validation Report');
  lines.push('');
  lines.push(`**Report ID:** ${report.reportId}`);
  lines.push(`**Generated:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('### Overall Diversity Score');
  lines.push('');

  const overallScore = report.aggregateScores.overall;
  const targetScore = 80;
  const meetsTarget = overallScore >= targetScore;

  lines.push(`**Overall Diversity Score:** ${overallScore.toFixed(1)}%`);
  lines.push(`**Target Score:** ${targetScore}%`);
  lines.push(`**Status:** ${meetsTarget ? '✅ **MEETS TARGET**' : '❌ **BELOW TARGET**'}`);
  lines.push('');

  // Score bar visualization
  const barLength = Math.round(overallScore / 5);
  const bar = '█'.repeat(barLength) + '░'.repeat(20 - barLength);
  lines.push(`Progress: ${bar} ${overallScore.toFixed(1)}%`);
  lines.push('');

  // Dimension breakdown
  lines.push('### Dimension Breakdown');
  lines.push('');
  lines.push('| Dimension | Score | Weight |');
  lines.push('|-----------|-------|--------|');
  lines.push(`| Structural | ${report.aggregateScores.averageStructural.toFixed(1)}% | 40% |`);
  lines.push(`| Thematic | ${report.aggregateScores.averageThematic.toFixed(1)}% | 30% |`);
  lines.push(`| Visual | ${report.aggregateScores.averageVisual.toFixed(1)}% | 30% |`);
  lines.push('| | | |');
  lines.push(`| **Overall** | **${overallScore.toFixed(1)}%** | 100% |`);
  lines.push('');

  // Interpretation
  lines.push('### Assessment');
  lines.push('');
  if (overallScore >= 80) {
    lines.push('✅ **Excellent Diversity** - High diversity across all dimensions.');
  } else if (overallScore >= 60) {
    lines.push('⚠️ **Good Diversity** - Acceptable variation but room for improvement.');
  } else if (overallScore >= 40) {
    lines.push('❌ **Fair Diversity** - Some similarities detected. Prompt tuning recommended.');
  } else {
    lines.push('🚨 **Poor Diversity** - Mode collapse detected. Immediate action required.');
  }
  lines.push('');

  lines.push('---');
  lines.push('');

  // Aggregate Diversity Matrix (sample)
  lines.push('## Aggregate Diversity Matrix');
  lines.push('');
  lines.push(`Showing ${report.configsAnalyzed.length}×${report.configsAnalyzed.length} similarity matrix. Full matrix available in JSON report.`);
  lines.push('');
  lines.push('| Config A | Config B | Score | Assessment |');
  lines.push('|----------|----------|-------|------------|');

  // Show top 10 most similar pairs for mode collapse section reference
  const sortedPairs = [...report.pairwiseComparisons]
    .sort((a, b) => a.overallScore - b.overallScore)
    .slice(0, 10);

  for (const pair of sortedPairs) {
    const assessment = pair.overallScore < 30 ? '🔴 Very Similar' :
                       pair.overallScore < 50 ? '🟡 Similar' :
                       pair.overallScore < 70 ? '🟢 Distinct' :
                       '🟢 Very Distinct';
    const configAName = formatConfigId(pair.configA, report.configMetadata);
    const configBName = formatConfigId(pair.configB, report.configMetadata);
    lines.push(`| ${configAName} | ${configBName} | ${pair.overallScore.toFixed(1)}% | ${assessment} |`);
  }
  lines.push('');
  lines.push('*Table shows 10 most similar pairs. See JSON report for complete matrix.*');
  lines.push('');

  lines.push('---');
  lines.push('');

  // Per-Archetype Breakdown
  lines.push('## Per-Archetype Breakdown');
  lines.push('');
  lines.push('Detailed analysis of diversity by hotel visual archetype.');
  lines.push('');

  // Sort archetypes by average diversity (ascending - worst first)
  const sortedArchetypes = Object.entries(report.archetypeBreakdown)
    .sort((a, b) => (a[1].averageDiversity || 0) - (b[1].averageDiversity || 0));

  lines.push('| Archetype | Count | Avg Diversity | Hotels |');
  lines.push('|-----------|-------|---------------|-------|');

  for (const [archetype, data] of sortedArchetypes) {
    const hotels = data.hotelNames.map((h, i) => `${i + 1}. ${h}`).join(', ');
    const avgDiversity = data.averageDiversity !== undefined
      ? `${data.averageDiversity.toFixed(1)}%`
      : 'N/A';
    const assessment = data.averageDiversity !== undefined && data.averageDiversity < 40
      ? '⚠️'
      : data.averageDiversity !== undefined && data.averageDiversity < 60
      ? '🟡'
      : '✅';
    lines.push(`| ${assessment} ${archetype} | ${data.count} | ${avgDiversity} | ${hotels.substring(0, 60)}... |`);
  }
  lines.push('');

  lines.push('---');
  lines.push('');

  // Component Selection Analysis
  lines.push('## Component Selection Analysis');
  lines.push('');
  lines.push('Analysis of structural diversity across all generated configs.');
  lines.push('');

  // Get unique components from all configs
  const componentStats = new Map<string, number>();
  for (const loaded of configs) {
    for (const component of loaded.config.components) {
      const key = `${component.type}`;
      componentStats.set(key, (componentStats.get(key) || 0) + 1);
    }
  }

  lines.push('| Component | Count | % of Configs |');
  lines.push('|-----------|-------|--------------|');
  const sortedComponents = Array.from(componentStats.entries()).sort((a, b) => b[1] - a[1]);
  for (const [component, count] of sortedComponents) {
    const percentage = ((count / configs.length) * 100).toFixed(1);
    lines.push(`| ${component} | ${count} | ${percentage}% |`);
  }
  lines.push('');

  lines.push('---');
  lines.push('');

  // Mode Collapse Detection
  lines.push('## Mode Collapse Detection');
  lines.push('');
  lines.push(`**Threshold:** Pairs with diversity score <30% flagged (similarity >70%)`);
  lines.push('');
  lines.push(`**Total Mode Collapse Pairs:** ${report.modeCollapsePairs.length}`);
  lines.push('');

  if (report.modeCollapsePairs.length === 0) {
    lines.push('✅ **No mode collapse detected.** All configs are sufficiently diverse.');
  } else {
    const collapsePercentage = ((report.modeCollapsePairs.length / report.pairwiseComparisons.length) * 100).toFixed(1);
    lines.push(`⚠️ **${collapsePercentage}%** of comparisons show potential mode collapse.`);
    lines.push('');
    lines.push('### Most Similar Pairs (Requires Attention)');
    lines.push('');
    lines.push('| Config A | Config B | Score | Archetypes |');
    lines.push('|----------|----------|-------|------------|');

    // Show top 20 most similar pairs
    const mostSimilar = [...report.modeCollapsePairs]
      .sort((a, b) => a.score - b.score)
      .slice(0, 20);

    for (const pair of mostSimilar) {
      const metaA = report.configMetadata[pair.configA];
      const metaB = report.configMetadata[pair.configB];
      const archetypeA = metaA?.archetype || 'Unknown';
      const archetypeB = metaB?.archetype || 'Unknown';
      const configAName = formatConfigId(pair.configA, report.configMetadata);
      const configBName = formatConfigId(pair.configB, report.configMetadata);
      lines.push(`| ${configAName} | ${configBName} | ${pair.score.toFixed(1)}% | ${archetypeA} ↔ ${archetypeB} |`);
    }
  }
  lines.push('');

  lines.push('---');
  lines.push('');

  // Cost Data Summary
  if (report.costData) {
    lines.push('## Generation Cost Summary');
    lines.push('');
    lines.push('Cost data from batch generation (Story 22.2).');
    lines.push('');
    lines.push(`**Total Cost:** $${report.costData.totalCost.toFixed(4)}`);
    lines.push(`**Average Cost per Generation:** $${report.costData.averageCost.toFixed(4)}`);
    lines.push(`**Total Generations:** ${configs.length}`);
    lines.push('');
    lines.push('### Cost Per Config');
    lines.push('');
    lines.push('| Config | Cost |');
    lines.push('|--------|------|');

    // Sort by cost (descending)
    const sortedByCost = Object.entries(report.costData.perConfigCost)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15); // Top 15 most expensive

    for (const [configId, cost] of sortedByCost) {
      const configName = formatConfigId(configId, report.configMetadata);
      lines.push(`| ${configName} | $${cost.toFixed(4)} |`);
    }
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  // Recommendations section (Phase 5)
  lines.push('## Recommendations');
  lines.push('');

  if (recommendations && recommendations.length > 0) {
    // Group recommendations by category
    const byCategory: Record<string, Recommendation[]> = {
      structural: [],
      thematic: [],
      visual: [],
      archetype: [],
      general: [],
    };

    for (const rec of recommendations) {
      byCategory[rec.category].push(rec);
    }

    // Display recommendations by category with priority badges
    const categoryOrder: Array<keyof typeof byCategory> = ['structural', 'thematic', 'visual', 'archetype', 'general'];
    const categoryNames: Record<string, string> = {
      structural: '🏗️ Structural',
      thematic: '🎨 Thematic',
      visual: '🎭 Visual',
      archetype: '🏛️ Archetype',
      general: '📋 General',
    };

    for (const category of categoryOrder) {
      const categoryRecs = byCategory[category];
      if (categoryRecs.length === 0) continue;

      lines.push(`### ${categoryNames[category]}`);
      lines.push('');

      for (const rec of categoryRecs) {
        const priorityBadge = rec.priority === 'high' ? '🔴 HIGH' :
                             rec.priority === 'medium' ? '🟡 MEDIUM' :
                             '🟢 LOW';
        lines.push(`#### ${priorityBadge}: ${rec.title}`);
        lines.push('');
        lines.push(rec.description);
        lines.push('');

        if (rec.affectedArchetypes && rec.affectedArchetypes.length > 0) {
          lines.push(`**Affected Archetypes:** ${rec.affectedArchetypes.join(', ')}`);
          lines.push('');
        }

        lines.push('**Action Items:**');
        for (const item of rec.actionItems) {
          lines.push(`- ${item}`);
        }
        lines.push('');

        if (rec.expectedImpact) {
          lines.push(`**Expected Impact:** ${rec.expectedImpact}`);
          lines.push('');
        }
      }
    }

    // Summary
    lines.push('---');
    lines.push('');
    lines.push('### Summary');
    lines.push('');
    const highCount = recommendations.filter(r => r.priority === 'high').length;
    const mediumCount = recommendations.filter(r => r.priority === 'medium').length;
    const lowCount = recommendations.filter(r => r.priority === 'low').length;

    lines.push(`- **${highCount}** high-priority recommendation(s)`);
    lines.push(`- **${mediumCount}** medium-priority recommendation(s)`);
    lines.push(`- **${lowCount}** low-priority recommendation(s)`);
    lines.push('');
  } else {
    // Fallback to basic recommendations if none provided
    lines.push('*Detailed recommendations will be generated in Phase 5*');
    lines.push('');
    lines.push('### Initial Observations');
    lines.push('');

    if (overallScore < targetScore) {
      const gap = targetScore - overallScore;
      lines.push(`1. **Overall score is ${gap.toFixed(1)}% below target (${targetScore}%).**`);
      lines.push('');

      if (report.aggregateScores.averageStructural < 40) {
        lines.push('2. **Structural diversity is low.** Consider:');
        lines.push('   - Reviewing ComponentSelector prompt to encourage more varied component selection');
        lines.push('   - Increasing emphasisComponents diversity in archetype profiles');
      }

      if (report.aggregateScores.averageThematic < 40) {
        lines.push('3. **Thematic diversity is low.** Consider:');
        lines.push('   - Updating StylingAgent prompt with anti-default instructions');
        lines.push('   - Adding archetype-specific CVA variant guidance');
      }

      if (report.aggregateScores.averageVisual < 40) {
        lines.push('4. **Visual diversity is low.** Consider:');
        lines.push('   - Reviewing TokenGenerator prompt for more varied color palettes');
        lines.push('   - Ensuring Epic 20 AI-driven tokens are properly configured');
      }

      if (report.modeCollapsePairs.length > 0) {
        lines.push(`5. **${report.modeCollapsePairs.length} mode collapse pairs detected.**`);
        lines.push('   - Focus prompt tuning efforts on archetypes with most collisions');
      }
    } else {
      lines.push('✅ **All targets met!** System is producing diverse configurations.');
    }
  }

  lines.push('');
  lines.push('---');
  lines.push('');

  // Footer
  lines.push('## Report Metadata');
  lines.push('');
  lines.push(`- **Configs Analyzed:** ${report.configsAnalyzed.length}`);
  lines.push(`- **Archetypes Represented:** ${Object.keys(report.archetypeBreakdown).length}`);
  lines.push(`- **Total Pairwise Comparisons:** ${report.pairwiseComparisons.length}`);
  lines.push(`- **Mode Collapse Threshold:** 30% diversity (70% similarity)`);
  lines.push(`- **Target Score:** ${targetScore}%`);
  lines.push(`- **Generation Date:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('*Report generated by Story 22.3: Visual Comparison Matrix + Diversity Report*');

  return lines.join('\n');
}

/**
 * Format config ID for display in reports
 * Shows archetype and hotel name instead of raw ID
 *
 * @param configId Config ID from report
 * @param metadata Config metadata map
 * @returns Formatted display name
 */
function formatConfigId(configId: string, metadata: Record<string, {
  archetype: string;
  hotelName: string;
  generationId?: string;
  cost?: number;
  componentCount?: number;
}>): string {
  const meta = metadata[configId];
  if (!meta) {
    return configId;
  }

  // Extract a short version of the hotel name
  const shortName = meta.hotelName.length > 25
    ? meta.hotelName.substring(0, 25) + '...'
    : meta.hotelName;

  return `${shortName} (${meta.archetype})`;
}

/**
 * Recommendation structure for improvement suggestions
 */
interface Recommendation {
  category: 'structural' | 'thematic' | 'visual' | 'archetype' | 'general';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  affectedArchetypes?: string[];
  expectedImpact?: string;
}

/**
 * Get all archetypes with low diversity scores
 *
 * @param report Enhanced diversity report
 * @param threshold Diversity threshold (default: 40%)
 * @returns Array of archetype names with low diversity
 */
function getAllArchetypesWithLowDiversity(
  report: EnhancedDiversityReport,
  threshold: number = 40
): string[] {
  const lowArchetypes: string[] = [];

  for (const [archetype, data] of Object.entries(report.archetypeBreakdown)) {
    if (data.averageDiversity !== undefined && data.averageDiversity < threshold) {
      lowArchetypes.push(archetype);
    }
  }

  return lowArchetypes.sort();
}

/**
 * Analyze component usage patterns across configs
 *
 * @param configs Loaded configs
 * @returns Component usage analysis
 */
function analyzeComponentUsage(configs: LoadedConfig[]): {
  mostCommon: { component: string; count: number; percentage: number }[];
  leastCommon: { component: string; count: number; percentage: number }[];
  allComponents: Set<string>;
} {
  const componentCounts = new Map<string, number>();
  const allComponents = new Set<string>();

  for (const loaded of configs) {
    for (const component of loaded.config.components) {
      const key = component.type;
      allComponents.add(key);
      componentCounts.set(key, (componentCounts.get(key) || 0) + 1);
    }
  }

  const usage = Array.from(componentCounts.entries()).map(([component, count]) => ({
    component,
    count,
    percentage: (count / configs.length) * 100,
  }));

  return {
    mostCommon: usage.sort((a, b) => b.count - a.count).slice(0, 5),
    leastCommon: usage.sort((a, b) => a.count - b.count).slice(0, 5),
    allComponents,
  };
}

/**
 * Analyze variant usage patterns across configs
 *
 * @param configs Loaded configs
 * @returns Variant usage analysis
 */
function analyzeVariantUsage(configs: LoadedConfig[]): {
  variantCounts: Map<string, number>;
  diversityScores: { component: string; uniqueVariants: number; totalVariants: number }[];
} {
  const variantCounts = new Map<string, number>();
  const componentVariants = new Map<string, Set<string>>();

  for (const loaded of configs) {
    for (const component of loaded.config.components) {
      const componentType = component.type;
      const variant = JSON.stringify(component.variant);
      const variantKey = `${componentType}:${variant}`;

      variantCounts.set(variantKey, (variantCounts.get(variantKey) || 0) + 1);

      if (!componentVariants.has(componentType)) {
        componentVariants.set(componentType, new Set());
      }
      componentVariants.get(componentType)!.add(variant);
    }
  }

  const diversityScores = Array.from(componentVariants.entries()).map(([component, variants]) => ({
    component,
    uniqueVariants: variants.size,
    totalVariants: configs.length,
  }));

  return {
    variantCounts,
    diversityScores,
  };
}

/**
 * Analyze mode collapse by archetype
 *
 * @param report Enhanced diversity report
 * @returns Mode collapse analysis by archetype
 */
function analyzeModeCollapseByArchetype(
  report: EnhancedDiversityReport
): {
  archetypeCollisions: Map<string, number>;
  mostProblematicArchetypes: { archetype: string; collisionCount: number }[];
  crossArchetypeCollisions: number;
  sameArchetypeCollisions: number;
} {
  const archetypeCollisions = new Map<string, number>();
  let crossArchetypeCollisions = 0;
  let sameArchetypeCollisions = 0;

  for (const pair of report.modeCollapsePairs) {
    const metaA = report.configMetadata[pair.configA];
    const metaB = report.configMetadata[pair.configB];

    if (!metaA || !metaB) continue;

    const archetypeA = metaA.archetype;
    const archetypeB = metaB.archetype;

    // Count collisions for each archetype
    archetypeCollisions.set(archetypeA, (archetypeCollisions.get(archetypeA) || 0) + 1);
    archetypeCollisions.set(archetypeB, (archetypeCollisions.get(archetypeB) || 0) + 1);

    // Track cross vs same archetype collisions
    if (archetypeA === archetypeB) {
      sameArchetypeCollisions++;
    } else {
      crossArchetypeCollisions++;
    }
  }

  const mostProblematicArchetypes = Array.from(archetypeCollisions.entries())
    .map(([archetype, collisionCount]) => ({ archetype, collisionCount }))
    .sort((a, b) => b.collisionCount - a.collisionCount)
    .slice(0, 5);

  return {
    archetypeCollisions,
    mostProblematicArchetypes,
    crossArchetypeCollisions,
    sameArchetypeCollisions,
  };
}

/**
 * Generate actionable recommendations based on diversity report
 *
 * @param report Enhanced diversity report
 * @param configs Loaded configs
 * @returns Array of recommendations
 */
function generateRecommendations(
  report: EnhancedDiversityReport,
  configs: LoadedConfig[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const overallScore = report.aggregateScores.overall;
  const targetScore = 80;

  // === General Assessment ===
  if (overallScore >= targetScore) {
    recommendations.push({
      category: 'general',
      priority: 'low',
      title: 'All Diversity Targets Met',
      description: 'The system is producing configurations with excellent diversity across all dimensions.',
      actionItems: [
        'Continue monitoring diversity metrics in future generations',
        'Consider increasing the target score to push for even greater diversity',
        'Document current prompt strategies for future reference',
      ],
      expectedImpact: 'Maintain current high diversity standards',
    });
    return recommendations; // Return early if all targets met
  }

  // === Structural Diversity Recommendations ===
  const structuralScore = report.aggregateScores.averageStructural;
  if (structuralScore < 40) {
    const componentAnalysis = analyzeComponentUsage(configs);

    recommendations.push({
      category: 'structural',
      priority: 'high',
      title: 'Increase Structural Component Diversity',
      description: `Structural diversity is at ${structuralScore.toFixed(1)}%, below the 40% threshold. Configs are using similar component structures.`,
      actionItems: [
        'Review ComponentSelector agent prompt to encourage more varied component selection',
        'Increase emphasisComponents diversity weights in archetype profiles',
        'Add anti-default language: "Avoid standard component combinations, explore unique layouts"',
        componentAnalysis.mostCommon.length > 0
          ? `Most overused components: ${componentAnalysis.mostCommon.map(c => c.component).join(', ')}`
          : 'Analyze component usage patterns in generated configs',
        'Consider adding weighted randomization to component selection',
      ],
      expectedImpact: 'Increase structural diversity by 15-25%',
    });

    // Check if certain components are underutilized
    const underutilized = componentAnalysis.leastCommon.filter(c => c.percentage < 30);
    if (underutilized.length > 0) {
      recommendations.push({
        category: 'structural',
        priority: 'medium',
        title: 'Utilize Underrepresented Components',
        description: 'Several components are significantly underutilized across generated configs.',
        actionItems: [
          `Underutilized components: ${underutilized.map(c => c.component).join(', ')}`,
          'Add specific prompts to encourage usage of these components',
          'Review archetype profiles to ensure these components are included where appropriate',
          'Consider component-specific boost weights in selection logic',
        ],
        expectedImpact: 'Increase component variety by 10-15%',
      });
    }
  } else if (structuralScore < 60) {
    recommendations.push({
      category: 'structural',
      priority: 'medium',
      title: 'Improve Structural Diversity',
      description: `Structural diversity is moderate (${structuralScore.toFixed(1)}%) but below target. Some improvement needed.`,
      actionItems: [
        'Review component selection patterns for subtle biases',
        'Add minor randomization to component ordering',
        'Encourage variant exploration in prompt engineering',
      ],
      expectedImpact: 'Increase structural diversity by 5-10%',
    });
  }

  // === Thematic Diversity Recommendations ===
  const thematicScore = report.aggregateScores.averageThematic;
  if (thematicScore < 40) {
    const variantAnalysis = analyzeVariantUsage(configs);
    const lowDiversityComponents = variantAnalysis.diversityScores
      .filter(d => (d.uniqueVariants / d.totalVariants) < 0.5)
      .map(d => d.component);

    recommendations.push({
      category: 'thematic',
      priority: 'high',
      title: 'Enhance Thematic Variant Diversity',
      description: `Thematic diversity is at ${thematicScore.toFixed(1)}%, below the 40% threshold. Configs are using similar variant choices.`,
      actionItems: [
        'Update StylingAgent prompt with stronger anti-default instructions',
        'Add archetype-specific CVA variant guidance to profiles',
        lowDiversityComponents.length > 0
          ? `Components with low variant diversity: ${lowDiversityComponents.join(', ')}`
          : 'Analyze variant usage patterns across all components',
        'Implement variant exploration bonus in selection scoring',
        'Add "variant exploration" prompts to encourage unique combinations',
      ],
      expectedImpact: 'Increase thematic diversity by 15-25%',
    });
  } else if (thematicScore < 60) {
    recommendations.push({
      category: 'thematic',
      priority: 'medium',
      title: 'Improve Thematic Variant Selection',
      description: `Thematic diversity is moderate (${thematicScore.toFixed(1)}%) but below target.`,
      actionItems: [
        'Review variant selection logic for subtle patterns',
        'Add entropy-based variant randomization',
        'Encourage cross-archetype variant exploration',
      ],
      expectedImpact: 'Increase thematic diversity by 5-10%',
    });
  }

  // === Visual Diversity Recommendations ===
  const visualScore = report.aggregateScores.averageVisual;
  if (visualScore < 40) {
    recommendations.push({
      category: 'visual',
      priority: 'high',
      title: 'Boost Visual Token Diversity',
      description: `Visual diversity is at ${visualScore.toFixed(1)}%, below the 40% threshold. Configs have similar visual tokens.`,
      actionItems: [
        'Review TokenGenerator prompt for more varied color palette generation',
        'Ensure Epic 20 AI-driven tokens are properly configured and utilized',
        'Add hue distance constraints to palette generation',
        'Increase color temperature variation across generations',
        'Add typography pairing diversity to prompt instructions',
        'Implement spacing scale randomization',
      ],
      expectedImpact: 'Increase visual diversity by 15-25%',
    });
  } else if (visualScore < 60) {
    recommendations.push({
      category: 'visual',
      priority: 'medium',
      title: 'Improve Visual Token Variation',
      description: `Visual diversity is moderate (${visualScore.toFixed(1)}%) but below target.`,
      actionItems: [
        'Review color palette generation for subtle biases',
        'Add small randomization to spacing scales',
        'Encourage typography exploration within brand constraints',
      ],
      expectedImpact: 'Increase visual diversity by 5-10%',
    });
  }

  // === Mode Collapse Recommendations ===
  if (report.modeCollapsePairs.length > 0) {
    const modeCollapseAnalysis = analyzeModeCollapseByArchetype(report);
    const collapsePercentage = ((report.modeCollapsePairs.length / report.pairwiseComparisons.length) * 100);

    recommendations.push({
      category: 'general',
      priority: 'high',
      title: 'Address Mode Collapse',
      description: `${report.modeCollapsePairs.length} mode collapse pairs detected (${collapsePercentage.toFixed(1)}% of comparisons). Configs are too similar.`,
      actionItems: [
        `Most problematic archetypes: ${modeCollapseAnalysis.mostProblematicArchetypes
          .slice(0, 3)
          .map(a => `${a.archetype} (${a.collisionCount} collisions)`)
          .join(', ')}`,
        'Focus prompt tuning efforts on archetypes with most collisions',
        modeCollapseAnalysis.sameArchetypeCollisions > 0
          ? `Add within-archetype variation: ${modeCollapseAnalysis.sameArchetypeCollisions} same-archetype collisions detected`
          : '',
        modeCollapseAnalysis.crossArchetypeCollisions > modeCollapseAnalysis.sameArchetypeCollisions
          ? 'Primary issue is cross-archetype similarity - strengthen archetype differentiation'
          : 'Primary issue is within-archetype repetition - add generation randomness',
        'Consider increasing temperature parameters for archetype-specific agents',
        'Add explicit "differentiation" prompts to emphasize uniqueness',
      ],
      expectedImpact: 'Reduce mode collapse by 30-50%',
    });

    // Specific archetype-focused recommendations
    const lowDiversityArchetypes = getAllArchetypesWithLowDiversity(report, 40);
    if (lowDiversityArchetypes.length > 0) {
      recommendations.push({
        category: 'archetype',
        priority: 'high',
        title: 'Improve Low-Diversity Archetypes',
        description: `Several archetypes have diversity scores below 40%.`,
        actionItems: [
          `Low-diversity archetypes: ${lowDiversityArchetypes.join(', ')}`,
          'Review archetype profiles for these types - check emphasisComponents',
          'Add archetype-specific variant constraints to increase differentiation',
          'Consider archetype "personality" injection into prompts',
        ],
        affectedArchetypes: lowDiversityArchetypes,
        expectedImpact: 'Increase archetype diversity by 10-20%',
      });
    }
  }

  // === Archetype-Specific Recommendations ===
  const archetypeBreakdown = report.archetypeBreakdown;
  const singleConfigArchetypes = Object.entries(archetypeBreakdown)
    .filter(([_, data]) => data.count === 1)
    .map(([archetype]) => archetype);

  if (singleConfigArchetypes.length > 0) {
    recommendations.push({
      category: 'archetype',
      priority: 'medium',
      title: 'Validate Single-Config Archetypes',
      description: `${singleConfigArchetypes.length} archetype(s) have only one configuration generated, preventing diversity assessment.`,
      actionItems: [
        `Archetypes needing validation: ${singleConfigArchetypes.join(', ')}`,
        'Generate additional configs for these archetypes to assess diversity',
        'Ensure archetype profiles have sufficient variation potential',
      ],
      affectedArchetypes: singleConfigArchetypes,
      expectedImpact: 'Enable accurate diversity assessment for all archetypes',
    });
  }

  // === Cost Optimization ===
  if (report.costData) {
    const avgCost = report.costData.averageCost;
    if (avgCost > 0.02) {
      recommendations.push({
        category: 'general',
        priority: 'low',
        title: 'Optimize Generation Costs',
        description: `Average generation cost is $${avgCost.toFixed(4)}, above the $0.02 target.`,
        actionItems: [
          'Review token usage in generation prompts',
          'Consider prompt optimization to reduce tokens',
          'Evaluate if caching can reduce redundant generations',
        ],
        expectedImpact: 'Reduce average cost per generation',
      });
    }
  }

  // === Overall Gap Recommendation ===
  const scoreGap = targetScore - overallScore;
  if (scoreGap > 20) {
    recommendations.push({
      category: 'general',
      priority: 'high',
      title: 'Close Large Diversity Gap',
      description: `Overall score is ${scoreGap.toFixed(1)}% below the ${targetScore}% target. Significant improvements needed across all dimensions.`,
      actionItems: [
        'Prioritize high-priority recommendations above',
        'Consider iterative prompt tuning with validation after each change',
        'Implement A/B testing for prompt variations',
        'Set up continuous diversity monitoring in generation pipeline',
      ],
      expectedImpact: 'Close diversity gap to meet target score',
    });
  }

  // Sort recommendations by priority (high -> medium -> low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommendations;
}

/**
 * Export markdown report to file
 *
 * @param report Enhanced diversity report
 * @param configs Loaded configs
 * @param outputPath Output file path
 */
async function exportMarkdownReportToFile(
  report: EnhancedDiversityReport,
  configs: LoadedConfig[],
  outputPath: string
): Promise<void> {
  const markdown = generateMarkdownReport(report, configs);
  await fs.promises.writeFile(outputPath, markdown);
}

/**
 * Main report generation function
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Diversity Report Generation - Story 22.3               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Parse CLI arguments
  const args = parseArgs();

  // Resolve input directory
  const inputDir = resolveInputDirectory(args.inputDir);
  console.log(`Input directory: ${inputDir}`);

  // Resolve output directory
  const outputDir = path.isAbsolute(args.outputDir)
    ? args.outputDir
    : path.resolve(process.cwd(), args.outputDir);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  console.log(`Output directory: ${outputDir}`);
  console.log('');

  console.log('──────────────────────────────────────────────────────────────');
  console.log('Loading configs and data...');
  console.log('');

  // Load generation summary
  const summary = loadGenerationSummary(inputDir);

  // Load configs
  const configs = loadConfigs(inputDir);

  // Enrich with cost data
  enrichWithCostData(configs, summary);

  // Print summary
  printLoadSummary(configs, summary);

  console.log('');
  console.log('✓ Phase 1 complete: Data loading finished');

  // Phase 2: Generate diversity scores
  const modeCollapseThreshold = 70; // Default from story requirements
  const scaleMode = args.scaleMode || false;
  const sampleSize = scaleMode ? 200 : args.sampleSize;
  const maxSimilarity = args.maxSimilarity || (scaleMode ? 85 : undefined);

  if (scaleMode) {
    console.log(`Running in scale test mode: --sample-size 200 --max-similarity 85`);
  } else if (sampleSize !== undefined) {
    console.log(`Using custom sample size: ${sampleSize}`);
  }
  if (maxSimilarity !== undefined) {
    console.log(`Similarity constraint: max ${maxSimilarity}%`);
  }

  const enhancedReport = await generateEnhancedDiversityReport(
    configs,
    modeCollapseThreshold,
    sampleSize,
    maxSimilarity
  );

  console.log('');
  console.log('✓ Phase 2 complete: Core diversity scoring finished');

  // Phase 3: Export JSON report
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('Phase 3: Exporting JSON report...');
  console.log('');

  const jsonReportPath = path.join(outputDir, 'diversity-report.json');
  await exportDiversityReportToJson(enhancedReport, jsonReportPath);
  console.log(`  ✓ JSON report exported to: ${jsonReportPath}`);

  console.log('');
  console.log('📊 Report Summary:');
  console.log(`  Total configs analyzed: ${enhancedReport.configsAnalyzed.length}`);
  console.log(`  Total archetypes: ${Object.keys(enhancedReport.archetypeBreakdown).length}`);
  console.log(`  Overall diversity score: ${enhancedReport.aggregateScores.overall.toFixed(1)}%`);
  console.log(`  Mode collapse pairs: ${enhancedReport.modeCollapsePairs.length}`);

  if (enhancedReport.samplingInfo) {
    console.log(`  Sampling: ${enhancedReport.samplingInfo.sampledPairs}/${enhancedReport.samplingInfo.totalPairs} pairs (${enhancedReport.samplingInfo.samplingRate.toFixed(1)}%)`);
  }

  if (enhancedReport.similarityConstraintViolations !== undefined) {
    const constraint = enhancedReport.similarityConstraintViolations[0]?.constraint || 85;
    console.log(`  Similarity constraint (>${constraint}%): ${enhancedReport.similarityConstraintViolations.length} violation(s)`);
  }

  console.log(`  Target score (>80%): ${enhancedReport.aggregateScores.overall >= 80 ? '✓ MET' : '✗ NOT MET'}`);

  console.log('');
  console.log('✓ Phase 3 complete: JSON report export finished');

  // Phase 4: Generate markdown report
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('Phase 4: Generating markdown report...');
  console.log('');

  const markdownReportPath = path.join(outputDir, 'DIVERSITY-REPORT.md');
  await exportMarkdownReportToFile(enhancedReport, configs, markdownReportPath);
  console.log(`  ✓ Markdown report exported to: ${markdownReportPath}`);

  console.log('');
  console.log('✓ Phase 4 complete: Markdown report generation finished');

  // Phase 5: Generate recommendations
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');
  console.log('Phase 5: Generating recommendations...');
  console.log('');

  const recommendations = generateRecommendations(enhancedReport, configs);
  console.log(`  ✓ Generated ${recommendations.length} recommendation(s)`);

  const highPriority = recommendations.filter(r => r.priority === 'high').length;
  const mediumPriority = recommendations.filter(r => r.priority === 'medium').length;
  const lowPriority = recommendations.filter(r => r.priority === 'low').length;

  console.log(`    - High priority: ${highPriority}`);
  console.log(`    - Medium priority: ${mediumPriority}`);
  console.log(`    - Low priority: ${lowPriority}`);

  // Regenerate markdown report with recommendations
  console.log('');
  console.log('  Updating markdown report with recommendations...');
  const markdownWithRecommendations = generateMarkdownReport(enhancedReport, configs, recommendations);
  await fs.promises.writeFile(markdownReportPath, markdownWithRecommendations);
  console.log(`  ✓ Markdown report updated with recommendations`);

  console.log('');
  console.log('✓ Phase 5 complete: Recommendations generation finished');
  console.log('');
}

main().catch((error) => {
  console.error('\n💥 Fatal Error during report generation:');
  console.error(error);
  process.exit(1);
});
