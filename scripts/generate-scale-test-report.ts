/**
 * Generate Scale Test Report
 *
 * Story 22.5: Scale Test - Generate 50 Hotels
 *
 * Analyzes scale test results and produces a comprehensive report with:
 * - Success rate analysis (target: ≥94%)
 * - Cost analysis (target: <$0.20 per generation)
 * - Diversity score comparison vs baseline (target: >75%)
 * - Uniqueness constraint validation (≤85% similarity)
 * - Production scale recommendations (10,000+ hotels)
 *
 * Usage:
 *   npx tsx scripts/generate-scale-test-report.ts --input-dir <path>
 *
 * @module scripts/generate-scale-test-report
 */

// Check for help flag BEFORE importing modules
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Generate Scale Test Report - Story 22.5

USAGE:
  npx tsx scripts/generate-scale-test-report.ts [OPTIONS]

OPTIONS:
  -i, --input-dir <path>    Input directory containing scale test results
                             Default: output/diversity-validation/scale-test
  -o, --output-dir <path>   Output directory for report
                             Default: output/diversity-validation/scale-test
  --baseline <path>         Baseline directory for comparison
                             Default: output/diversity-validation (baseline)
  -h, --help               Show this help message

DESCRIPTION:
  Analyzes scale test results and produces a comprehensive report including:
  - Executive summary with key metrics
  - Success rate analysis (target: ≥94% or 47/50 hotels)
  - Cost analysis (target: <$0.20 per generation)
  - Diversity score comparison (target: >75% vs baseline)
  - Uniqueness constraint validation (≤85% similarity)
  - Generation time analysis
  - Failure analysis and recommendations
  - Production scale extrapolation (10,000+ hotels)

EXAMPLES:
  npx tsx scripts/generate-scale-test-report.ts --input-dir ./cycle3
  npx tsx scripts/generate-scale-test-report.ts --baseline ./baseline
  `);
  process.exit(0);
}

import * as fs from 'fs';
import * as path from 'path';

/**
 * Generation summary structure
 */
interface GenerationSummary {
  timestamp: string;
  mode: string;
  outputDirectory: string;
  resumeMode: boolean;
  totalProfiles: number;
  skippedCount: number;
  profilesToGenerate: number;
  successCount: number;
  failCount: number;
  successRate: number;
  totalDuration: number;
  totalCost: number;
  averageCost: number;
  averageDuration: number;
  results: Array<{
    archetype?: string;
    hotelName: string;
    success: boolean;
    skipped?: boolean;
    generationId?: string;
    cost?: number;
    componentCount?: number;
    duration?: number;
    error?: string;
    errorDetails?: any;
  }>;
  errors: Array<{
    hotelName: string;
    archetype?: string;
    error: string;
    errorDetails: any;
  }>;
}

/**
 * Diversity report structure
 */
interface DiversityReport {
  reportId: string;
  timestamp: string;
  configsAnalyzed: string[];
  aggregateScores: {
    overall: number;
    averageStructural: number;
    averageThematic: number;
    averageVisual: number;
  };
  pairwiseComparisons: Array<{
    configA: string;
    configB: string;
    overallScore: number;
  }>;
  similarityConstraintViolations?: Array<{
    configA: string;
    configB: string;
    similarity: number;
    constraint: number;
  }>;
  samplingInfo?: {
    totalPairs: number;
    sampledPairs: number;
    samplingRate: number;
  };
}

/**
 * Baseline diversity data for comparison
 */
interface BaselineData {
  overall: number;
  structural: number;
  thematic: number;
  visual: number;
  date?: string;
}

/**
 * Scale test acceptance criteria
 */
interface AcceptanceCriteria {
  successRate: {
    target: number;
    threshold: number;
    actual: number;
    met: boolean;
  };
  costPerGeneration: {
    target: number;
    threshold: number;
    actual: number;
    met: boolean;
  };
  diversityScore: {
    target: number;
    baseline: number;
    actual: number;
    met: boolean;
  };
  uniquenessConstraint: {
    maxSimilarity: number;
    actual: number;
    met: boolean;
  };
}

/**
 * Scale test report
 */
interface ScaleTestReport {
  timestamp: string;
  inputDirectory: string;
  baselineDirectory?: string;

  // Generation summary
  generationSummary: GenerationSummary;

  // Diversity results
  diversityReport: DiversityReport;

  // Baseline comparison
  baselineComparison?: BaselineData;

  // Acceptance criteria status
  acceptanceCriteria: AcceptanceCriteria;

  // Recommendations
  recommendations: Array<{
    category: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }>;

  // Production extrapolation
  productionExtrapolation: {
    targetHotels: number;
    estimatedCost: number;
    estimatedTime: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

/**
 * CLI arguments
 */
interface ReportArgs {
  inputDir: string;
  outputDir: string;
  baselineDir?: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): ReportArgs {
  const args = process.argv.slice(2);
  const result: ReportArgs = {
    inputDir: 'output/diversity-validation/scale-test',
    outputDir: 'output/diversity-validation/scale-test',
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
      case '--baseline':
        if (args[i + 1]) {
          result.baselineDir = args[i + 1];
          i++;
        }
        break;
    }
  }

  return result;
}

/**
 * Load generation summary from scale test
 */
function loadGenerationSummary(inputDir: string): GenerationSummary {
  const summaryPath = path.join(inputDir, 'generation-summary.json');
  if (!fs.existsSync(summaryPath)) {
    throw new Error(`Generation summary not found: ${summaryPath}`);
  }

  const content = fs.readFileSync(summaryPath, 'utf-8');
  return JSON.parse(content) as GenerationSummary;
}

/**
 * Load diversity report from scale test
 */
function loadDiversityReport(inputDir: string): DiversityReport {
  const reportPath = path.join(inputDir, 'diversity-report.json');
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Diversity report not found: ${reportPath}`);
  }

  const content = fs.readFileSync(reportPath, 'utf-8');
  return JSON.parse(content) as DiversityReport;
}

/**
 * Load baseline diversity data
 */
function loadBaselineData(baselineDir: string): BaselineData {
  const reportPath = path.join(baselineDir, 'diversity-report.json');
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Baseline diversity report not found: ${reportPath}`);
  }

  const content = fs.readFileSync(reportPath, 'utf-8');
  const report = JSON.parse(content) as { aggregateScores: any };

  return {
    overall: report.aggregateScores.overall,
    structural: report.aggregateScores.averageStructural,
    thematic: report.aggregateScores.averageThematic,
    visual: report.aggregateScores.averageVisual,
  };
}

/**
 * Evaluate acceptance criteria
 */
function evaluateAcceptanceCriteria(
  generationSummary: GenerationSummary,
  diversityReport: DiversityReport,
  baselineData?: BaselineData
): AcceptanceCriteria {
  // Success rate: ≥94% (47/50)
  const successRateTarget = 94;
  const successRateThreshold = 94;
  const successRateActual = generationSummary.successRate;
  const successRateMet = successRateActual >= successRateThreshold;

  // Cost per generation: <$0.20
  const costTarget = 0.20;
  const costThreshold = 0.20;
  const costActual = generationSummary.averageCost;
  const costMet = costActual <= costThreshold;

  // Diversity score: >75% vs baseline
  const diversityTarget = 75;
  const diversityBaseline = baselineData?.overall || 30.6;
  const diversityActual = diversityReport.aggregateScores.overall;
  const diversityMet = diversityActual >= diversityTarget;

  // Uniqueness constraint: ≤85% similarity
  const maxSimilarity = 85;
  const violations = diversityReport.similarityConstraintViolations || [];
  const uniquenessMet = violations.length === 0;

  return {
    successRate: {
      target: successRateTarget,
      threshold: successRateThreshold,
      actual: successRateActual,
      met: successRateMet,
    },
    costPerGeneration: {
      target: costTarget,
      threshold: costThreshold,
      actual: costActual,
      met: costMet,
    },
    diversityScore: {
      target: diversityTarget,
      baseline: diversityBaseline,
      actual: diversityActual,
      met: diversityMet,
    },
    uniquenessConstraint: {
      maxSimilarity,
      actual: violations.length,
      met: uniquenessMet,
    },
  };
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(
  acceptanceCriteria: AcceptanceCriteria,
  generationSummary: GenerationSummary,
  diversityReport: DiversityReport
): Array<{
  category: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  action?: string;
}> {
  const recommendations: Array<{
    category: 'critical' | 'warning' | 'info';
    title: string;
    description: string;
    action?: string;
  }> = [];

  // Check success rate
  if (!acceptanceCriteria.successRate.met) {
    recommendations.push({
      category: 'critical',
      title: 'Success rate below threshold',
      description: `Success rate is ${acceptanceCriteria.successRate.actual.toFixed(1)}%, below the ${acceptanceCriteria.successRate.threshold}% threshold. ${generationSummary.failCount} generations failed.`,
      action: 'Review failure patterns and fix root causes before scaling to production.',
    });
  }

  // Check cost
  if (!acceptanceCriteria.costPerGeneration.met) {
    recommendations.push({
      category: 'critical',
      title: 'Cost per generation exceeds target',
      description: `Average cost is $${acceptanceCriteria.costPerGeneration.actual.toFixed(4)}, exceeding the $${acceptanceCriteria.costPerGeneration.target} target.`,
      action: 'Optimize prompt efficiency or increase target cost before production scale.',
    });
  } else if (acceptanceCriteria.costPerGeneration.actual > acceptanceCriteria.costPerGeneration.target * 0.9) {
    recommendations.push({
      category: 'warning',
      title: 'Cost approaching target',
      description: `Average cost is $${acceptanceCriteria.costPerGeneration.actual.toFixed(4)}, approaching the $${acceptanceCriteria.costPerGeneration.target} target.`,
      action: 'Monitor costs closely during production scale.',
    });
  }

  // Check diversity
  if (!acceptanceCriteria.diversityScore.met) {
    recommendations.push({
      category: 'critical',
      title: 'Diversity score below target',
      description: `Diversity score is ${acceptanceCriteria.diversityScore.actual.toFixed(1)}%, below the ${acceptanceCriteria.diversityScore.target}% target. Baseline was ${acceptanceCriteria.diversityScore.baseline.toFixed(1)}%.`,
      action: 'Implement Epic 22.6 architectural improvements before production scale.',
    });
  }

  // Check uniqueness constraint
  if (!acceptanceCriteria.uniquenessConstraint.met) {
    recommendations.push({
      category: 'critical',
      title: 'Similarity constraint violations detected',
      description: `${acceptanceCriteria.uniquenessConstraint.actual} pair(s) exceed ${acceptanceCriteria.uniquenessConstraint.maxSimilarity}% similarity threshold.`,
      action: 'Review and enhance uniqueness enforcement before production scale.',
    });
  }

  // Success rate recommendations
  if (acceptanceCriteria.successRate.met && acceptanceCriteria.successRate.actual >= 98) {
    recommendations.push({
      category: 'info',
      title: 'Excellent success rate',
      description: `Success rate of ${acceptanceCriteria.successRate.actual.toFixed(1)}% exceeds requirements.`,
    });
  }

  // Cost efficiency recommendations
  if (acceptanceCriteria.costPerGeneration.actual < acceptanceCriteria.costPerGeneration.target * 0.5) {
    recommendations.push({
      category: 'info',
      title: 'Excellent cost efficiency',
      description: `Average cost is $${acceptanceCriteria.costPerGeneration.actual.toFixed(4)}, well below the $${acceptanceCriteria.costPerGeneration.target} target.`,
    });
  }

  // Diversity recommendations
  if (acceptanceCriteria.diversityScore.actual >= acceptanceCriteria.diversityScore.target * 1.1) {
    recommendations.push({
      category: 'info',
      title: 'Excellent diversity achieved',
      description: `Diversity score of ${acceptanceCriteria.diversityScore.actual.toFixed(1)}% exceeds the ${acceptanceCriteria.diversityScore.target}% target by >10%.`,
    });
  }

  return recommendations;
}

/**
 * Calculate production extrapolation
 */
function calculateProductionExtrapolation(
  generationSummary: GenerationSummary
): {
  targetHotels: number;
  estimatedCost: number;
  estimatedTime: string;
  confidence: 'high' | 'medium' | 'low';
} {
  const targetHotels = 10000;
  const avgCost = generationSummary.averageCost;
  const avgDuration = generationSummary.averageDuration;

  const estimatedCost = targetHotels * avgCost;
  const estimatedSeconds = targetHotels * avgDuration;
  const estimatedHours = estimatedSeconds / 3600;
  const estimatedDays = estimatedHours / 24;

  let estimatedTime: string;
  if (estimatedDays > 1) {
    estimatedTime = `${estimatedDays.toFixed(1)} days`;
  } else if (estimatedHours > 1) {
    estimatedTime = `${estimatedHours.toFixed(1)} hours`;
  } else {
    estimatedTime = `${estimatedSeconds.toFixed(0)} seconds`;
  }

  // Confidence based on success rate and sample size
  let confidence: 'high' | 'medium' | 'low';
  if (generationSummary.successRate >= 98 && generationSummary.totalProfiles >= 50) {
    confidence = 'high';
  } else if (generationSummary.successRate >= 90) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return {
    targetHotels,
    estimatedCost,
    estimatedTime,
    confidence,
  };
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(report: ScaleTestReport): string {
  const lines: string[] = [];

  // Header
  lines.push('# Scale Test Report');
  lines.push('');
  lines.push(`**Story:** 22.5 - Scale Test: Generate 50 Hotels`);
  lines.push(`**Date:** ${new Date(report.timestamp).toISOString()}`);
  lines.push(`**Status:** ${Object.values(report.acceptanceCriteria).every(ac => ac.met) ? '✅ PASS' : '❌ FAIL'}`);
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push('### Key Metrics');
  lines.push('');
  lines.push('| Metric | Target | Actual | Status |');
  lines.push('|--------|--------|--------|--------|');
  lines.push(`| **Success Rate** | ≥${report.acceptanceCriteria.successRate.threshold}% | ${report.acceptanceCriteria.successRate.actual.toFixed(1)}% | ${report.acceptanceCriteria.successRate.met ? '✅ PASS' : '❌ FAIL'} |`);
  lines.push(`| **Cost per Generation** | <$${report.acceptanceCriteria.costPerGeneration.target} | $${report.acceptanceCriteria.costPerGeneration.actual.toFixed(4)} | ${report.acceptanceCriteria.costPerGeneration.met ? '✅ PASS' : '❌ FAIL'} |`);
  lines.push(`| **Diversity Score** | >${report.acceptanceCriteria.diversityScore.target}% | ${report.acceptanceCriteria.diversityScore.actual.toFixed(1)}% | ${report.acceptanceCriteria.diversityScore.met ? '✅ PASS' : '❌ FAIL'} |`);
  lines.push(`| **Similarity Violations** | 0 | ${report.acceptanceCriteria.uniquenessConstraint.actual} | ${report.acceptanceCriteria.uniquenessConstraint.met ? '✅ PASS' : '❌ FAIL'} |`);
  lines.push('');

  // Generation Summary
  lines.push('## Generation Summary');
  lines.push('');
  lines.push(`**Total Profiles:** ${report.generationSummary.totalProfiles}`);
  lines.push(`**Successful:** ${report.generationSummary.successCount}`);
  lines.push(`**Failed:** ${report.generationSummary.failCount}`);
  lines.push(`**Skipped:** ${report.generationSummary.skippedCount || 0}`);
  lines.push('');
  lines.push(`**Total Duration:** ${Number(report.generationSummary.totalDuration).toFixed(2)}s`);
  lines.push(`**Average Duration:** ${report.generationSummary.averageDuration.toFixed(2)}s per generation`);
  lines.push('');
  lines.push(`**Total Cost:** $${report.generationSummary.totalCost.toFixed(4)}`);
  lines.push(`**Average Cost:** $${report.generationSummary.averageCost.toFixed(4)} per generation`);
  lines.push('');

  // Diversity Analysis
  lines.push('## Diversity Analysis');
  lines.push('');
  lines.push(`**Overall Diversity:** ${report.diversityReport.aggregateScores.overall.toFixed(1)}%`);
  lines.push(`- Structural: ${report.diversityReport.aggregateScores.averageStructural.toFixed(1)}%`);
  lines.push(`- Thematic: ${report.diversityReport.aggregateScores.averageThematic.toFixed(1)}%`);
  lines.push(`- Visual: ${report.diversityReport.aggregateScores.averageVisual.toFixed(1)}%`);
  lines.push('');

  if (report.baselineComparison) {
    lines.push('### Baseline Comparison');
    lines.push('');
    lines.push('| Dimension | Baseline | Scale Test | Delta |');
    lines.push('|-----------|----------|------------|-------|');
    lines.push(`| Overall | ${report.baselineComparison.overall.toFixed(1)}% | ${report.diversityReport.aggregateScores.overall.toFixed(1)}% | ${(report.diversityReport.aggregateScores.overall - report.baselineComparison.overall).toFixed(1)}% |`);
    lines.push(`| Structural | ${report.baselineComparison.structural.toFixed(1)}% | ${report.diversityReport.aggregateScores.averageStructural.toFixed(1)}% | ${(report.diversityReport.aggregateScores.averageStructural - report.baselineComparison.structural).toFixed(1)}% |`);
    lines.push(`| Thematic | ${report.baselineComparison.thematic.toFixed(1)}% | ${report.diversityReport.aggregateScores.averageThematic.toFixed(1)}% | ${(report.diversityReport.aggregateScores.averageThematic - report.baselineComparison.thematic).toFixed(1)}% |`);
    lines.push(`| Visual | ${report.baselineComparison.visual.toFixed(1)}% | ${report.diversityReport.aggregateScores.averageVisual.toFixed(1)}% | ${(report.diversityReport.aggregateScores.averageVisual - report.baselineComparison.visual).toFixed(1)}% |`);
    lines.push('');
  }

  if (report.diversityReport.samplingInfo) {
    lines.push('### Sampling Information');
    lines.push('');
    lines.push(`**Total Pairs:** ${report.diversityReport.samplingInfo.totalPairs}`);
    lines.push(`**Sampled Pairs:** ${report.diversityReport.samplingInfo.sampledPairs}`);
    lines.push(`**Sampling Rate:** ${report.diversityReport.samplingInfo.samplingRate.toFixed(1)}%`);
    lines.push('');
  }

  // Similarity Constraint Violations
  if (report.acceptanceCriteria.uniquenessConstraint.actual > 0) {
    lines.push('### Similarity Constraint Violations');
    lines.push('');
    lines.push(`**Threshold:** >${report.acceptanceCriteria.uniquenessConstraint.maxSimilarity}% similarity`);
    lines.push(`**Violations:** ${report.acceptanceCriteria.uniquenessConstraint.actual} pair(s)`);
    lines.push('');

    const violations = report.diversityReport.similarityConstraintViolations || [];
    for (const violation of violations.slice(0, 10)) {
      lines.push(`- **${violation.configA}** ↔ **${violation.configB}**: ${violation.similarity}% similarity`);
    }

    if (violations.length > 10) {
      lines.push(`- ... and ${violations.length - 10} more`);
    }
    lines.push('');
  }

  // Failure Analysis
  if (report.generationSummary.failCount > 0) {
    lines.push('## Failure Analysis');
    lines.push('');

    const errors = report.generationSummary.errors;
    lines.push(`**Total Failures:** ${errors.length}`);
    lines.push('');

    // Group errors by type
    const errorTypes: Record<string, number> = {};
    for (const error of errors) {
      const errorType = error.error.split(':')[0] || 'unknown';
      errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
    }

    lines.push('### Failure Types');
    lines.push('');
    for (const [type, count] of Object.entries(errorTypes)) {
      lines.push(`- **${type}:** ${count}`);
    }
    lines.push('');

    lines.push('### Failed Hotels');
    lines.push('');
    for (const error of errors) {
      lines.push(`**${error.hotelName}** (${error.archetype || 'Unknown'}): ${error.error}`);
    }
    lines.push('');
  }

  // Recommendations
  lines.push('## Recommendations');
  lines.push('');

  for (const rec of report.recommendations) {
    const emoji = rec.category === 'critical' ? '❌' : rec.category === 'warning' ? '⚠️' : 'ℹ️';
    lines.push(`### ${emoji} ${rec.title}`);
    lines.push('');
    lines.push(rec.description);
    if (rec.action) {
      lines.push(`**Action:** ${rec.action}`);
    }
    lines.push('');
  }

  // Production Extrapolation
  lines.push('## Production Scale Extrapolation');
  lines.push('');
  lines.push(`**Target:** ${report.productionExtrapolation.targetHotels.toLocaleString()} hotels`);
  lines.push(`**Estimated Cost:** $${report.productionExtrapolation.estimatedCost.toFixed(2)}`);
  lines.push(`**Estimated Time:** ${report.productionExtrapolation.estimatedTime}`);
  lines.push(`**Confidence:** ${report.productionExtrapolation.confidence.toUpperCase()}`);
  lines.push('');

  // Footer
  lines.push('---');
  lines.push('');
  lines.push(`*Report generated: ${new Date().toISOString()}*`);
  lines.push(`*Input directory: ${report.inputDirectory}*`);

  return lines.join('\n');
}

/**
 * Main function
 */
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Scale Test Report Generation - Story 22.5          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');

  // Parse arguments
  const args = parseArgs();

  console.log(`Input directory: ${args.inputDir}`);
  if (args.baselineDir) {
    console.log(`Baseline directory: ${args.baselineDir}`);
  }
  console.log(`Output directory: ${args.outputDir}`);
  console.log('');

  // Load data
  console.log('Loading scale test data...');
  const generationSummary = loadGenerationSummary(args.inputDir);
  console.log(`  ✓ Loaded generation summary (${generationSummary.successCount}/${generationSummary.totalProfiles} successful)`);

  const diversityReport = loadDiversityReport(args.inputDir);
  console.log(`  ✓ Loaded diversity report (${diversityReport.configsAnalyzed.length} configs)`);

  let baselineData: BaselineData | undefined;
  if (args.baselineDir) {
    baselineData = loadBaselineData(args.baselineDir);
    console.log(`  ✓ Loaded baseline data (overall: ${baselineData.overall.toFixed(1)}%)`);
  }
  console.log('');

  // Evaluate acceptance criteria
  const acceptanceCriteria = evaluateAcceptanceCriteria(generationSummary, diversityReport, baselineData);

  // Generate recommendations
  const recommendations = generateRecommendations(acceptanceCriteria, generationSummary, diversityReport);

  // Calculate production extrapolation
  const productionExtrapolation = calculateProductionExtrapolation(generationSummary);

  // Build report
  const report: ScaleTestReport = {
    timestamp: new Date().toISOString(),
    inputDirectory: args.inputDir,
    baselineDirectory: args.baselineDir,
    generationSummary,
    diversityReport,
    baselineComparison: baselineData,
    acceptanceCriteria,
    recommendations,
    productionExtrapolation,
  };

  // Generate markdown
  const markdown = generateMarkdownReport(report);

  // Ensure output directory exists
  const absoluteOutputDir = path.isAbsolute(args.outputDir)
    ? args.outputDir
    : path.resolve(process.cwd(), args.outputDir);
  if (!fs.existsSync(absoluteOutputDir)) {
    fs.mkdirSync(absoluteOutputDir, { recursive: true });
  }

  // Write report
  const reportPath = path.join(absoluteOutputDir, 'SCALE-TEST-REPORT.md');
  fs.writeFileSync(reportPath, markdown, 'utf-8');
  console.log(`✅ Scale test report generated: ${reportPath}`);
  console.log('');

  // Print summary
  console.log('──────────────────────────────────────────────────────────────');
  console.log('');
  console.log('Scale Test Results Summary:');
  console.log('');
  console.log(`  Success Rate: ${acceptanceCriteria.successRate.met ? '✅ PASS' : '❌ FAIL'} (${acceptanceCriteria.successRate.actual.toFixed(1)}% vs ${acceptanceCriteria.successRate.threshold}% target)`);
  console.log(`  Cost: ${acceptanceCriteria.costPerGeneration.met ? '✅ PASS' : '❌ FAIL'} ($${acceptanceCriteria.costPerGeneration.actual.toFixed(4)} vs $${acceptanceCriteria.costPerGeneration.target} target)`);
  console.log(`  Diversity: ${acceptanceCriteria.diversityScore.met ? '✅ PASS' : '❌ FAIL'} (${acceptanceCriteria.diversityScore.actual.toFixed(1)}% vs ${acceptanceCriteria.diversityScore.target}% target)`);
  console.log(`  Uniqueness: ${acceptanceCriteria.uniquenessConstraint.met ? '✅ PASS' : '❌ FAIL'} (${acceptanceCriteria.uniquenessConstraint.actual} violations)`);
  console.log('');

  const allMet = Object.values(acceptanceCriteria).every(ac => ac.met);
  console.log(`Overall Status: ${allMet ? '✅ ALL CRITERIA MET' : '❌ SOME CRITERIA NOT MET'}`);
  console.log('');

  if (recommendations.length > 0) {
    console.log('Recommendations:');
    for (const rec of recommendations) {
      const emoji = rec.category === 'critical' ? '❌' : rec.category === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${emoji} ${rec.title}`);
    }
    console.log('');
  }

  console.log(`Production extrapolation for ${productionExtrapolation.targetHotels.toLocaleString()} hotels:`);
  console.log(`  Estimated cost: $${productionExtrapolation.estimatedCost.toFixed(2)}`);
  console.log(`  Estimated time: ${productionExtrapolation.estimatedTime}`);
  console.log(`  Confidence: ${productionExtrapolation.confidence.toUpperCase()}`);
}

main().catch((error) => {
  console.error('\n💥 Fatal Error:');
  console.error(error);
  process.exit(1);
});
