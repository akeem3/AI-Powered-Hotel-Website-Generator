import { HomepageGenerationWorkflow } from '../../app/langgraph/workflows/HomepageGenerationWorkflow';
import { HotelParameters } from '../../app/langgraph/agents/schemas';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from web-app/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Performance Benchmark Test Suite for Homepage Generation Workflow
 *
 * Requirement: Story 7.10 AC3
 * - Measure and log total generation time
 * - Measure per-agent execution time
 * - Track token usage per agent
 * - Track cost breakdown per agent
 *
 * These tests use REAL LLM calls and measure actual performance metrics.
 * Results are saved to output/performance-benchmarks.json for analysis.
 *
 * WARNING: These tests incur actual costs. Run sparingly.
 *
 * To run these tests, set the environment variable:
 *   RUN_E2E_TESTS=true npm test -- --config jest.config.workflow.js
 */

interface BenchmarkResult {
  scenario: string;
  timestamp: string;
  hotelParameters: HotelParameters;
  metrics: {
    totalTimeMs: number;
    totalCost: number;
    validationStatus: string;
    qualityScore?: number;
    perAgent: Array<{
      agentName: string;
      estimatedTimeMs: number;
      estimatedCost: number;
    }>;
  };
}

/**
 * Performance Benchmark E2E Tests
 *
 * These tests make REAL LLM API calls and will incur actual costs.
 * Tests use AnthropicClient (Z.ai) for GLM-4.7 model.
 */
const hasRequiredKeys = process.env.ANTHROPIC_AUTH_TOKEN && process.env.ANTHROPIC_AUTH_TOKEN.length > 0;
const describeIfKeys = hasRequiredKeys ? describe : describe.skip;

if (!hasRequiredKeys) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ Skipping Performance Benchmark tests: ANTHROPIC_AUTH_TOKEN not set');
}

describeIfKeys('Performance Benchmark Tests (Real LLM)', () => {
  jest.setTimeout(300000); // 5 minutes per test

  const benchmarkResults: BenchmarkResult[] = [];
  const outputDir = path.resolve(process.cwd(), 'output');

  beforeAll(() => {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Save benchmark results to JSON file
    const benchmarkPath = path.join(outputDir, 'performance-benchmarks.json');
    fs.writeFileSync(benchmarkPath, JSON.stringify(benchmarkResults, null, 2));
    console.log(`\n📊 Benchmark results saved to: ${benchmarkPath}`);

    // Print summary table
    console.log('\n📊 Performance Benchmark Summary:');
    console.log('─'.repeat(100));
    console.log('| Scenario | Total Time (s) | Total Cost ($) | Quality Score | Status |');
    console.log('─'.repeat(100));
    benchmarkResults.forEach(r => {
      const timeSec = (r.metrics.totalTimeMs / 1000).toFixed(2);
      const cost = r.metrics.totalCost.toFixed(4);
      const quality = r.metrics.qualityScore?.toFixed(1) ?? 'N/A';
      console.log(`| ${r.scenario.padEnd(22)} | ${timeSec.padStart(13)} | ${cost.padStart(13)} | ${quality.padStart(12)} | ${r.metrics.validationStatus.padEnd(6)} |`);
    });
    console.log('─'.repeat(100));
  });

  const runBenchmark = async (
    scenario: string,
    params: HotelParameters
  ): Promise<BenchmarkResult> => {
    const workflow = new HomepageGenerationWorkflow();
    const generationId = `benchmark-${scenario.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    console.log(`\n🚀 Starting Benchmark: ${scenario}`);
    console.log(`Generation ID: ${generationId}`);

    const startTime = Date.now();

    const result = await workflow.invoke({
      generationId,
      hotelParameters: params
    });

    const endTime = Date.now();
    const totalTimeMs = endTime - startTime;

    // Extract per-agent costs from stepCosts if available
    const perAgentMetrics = Object.entries(result.stepCosts || {}).map(([agentName, cost]) => ({
      agentName,
      estimatedTimeMs: Math.round((cost as number) / (result.totalCost || 1) * totalTimeMs),
      estimatedCost: cost as number
    }));

    const benchmarkResult: BenchmarkResult = {
      scenario,
      timestamp: new Date().toISOString(),
      hotelParameters: params,
      metrics: {
        totalTimeMs,
        totalCost: result.totalCost || 0,
        validationStatus: result.validationStatus,
        qualityScore: result.qualityScore,
        perAgent: perAgentMetrics
      }
    };

    console.log(`✅ Benchmark Complete:`);
    console.log(`   Total Time: ${(totalTimeMs / 1000).toFixed(2)}s`);
    console.log(`   Total Cost: $${(result.totalCost || 0).toFixed(4)}`);
    console.log(`   Quality Score: ${result.qualityScore ?? 'N/A'}`);
    console.log(`   Status: ${result.validationStatus}`);

    if (perAgentMetrics.length > 0) {
      console.log(`   Per-Agent Breakdown:`);
      perAgentMetrics.forEach(m => {
        console.log(`     - ${m.agentName}: ${m.estimatedCost.toFixed(4)} (${m.estimatedTimeMs}ms)`);
      });
    }

    benchmarkResults.push(benchmarkResult);

    // Verify performance constraints
    expect(totalTimeMs).toBeLessThan(300000); // < 5 minutes (AC2)
    expect(result.totalCost).toBeLessThan(2.00); // < $2.00 (AC2)

    return benchmarkResult;
  };

  it('Benchmark 1: Luxury/Business', async () => {
    await runBenchmark('Luxury-Business', {
      hotelName: "Grand Horizon Luxury Suites",
      hotelType: "luxury",
      targetAudience: "business",
      brandPersonality: "professional",
      location: "New York, NY"
    });
  });

  it('Benchmark 2: Budget/Family', async () => {
    await runBenchmark('Budget-Family', {
      hotelName: "Sunny Side Inn",
      hotelType: "budget",
      targetAudience: "family",
      brandPersonality: "friendly",
      location: "Orlando, FL"
    });
  });

  it('Benchmark 3: Boutique/Couples', async () => {
    await runBenchmark('Boutique-Couples', {
      hotelName: "The Secret Garden",
      hotelType: "boutique",
      targetAudience: "couples",
      brandPersonality: "elegant",
      location: "Kyoto, Japan"
    });
  });

  it('Benchmark 4: Business/Corporate', async () => {
    await runBenchmark('Business-Corporate', {
      hotelName: "TechHub Conference Hotel",
      hotelType: "business",
      targetAudience: "business",
      brandPersonality: "modern",
      location: "San Francisco, CA"
    });
  });

  it('Benchmark 5: Resort/Leisure', async () => {
    await runBenchmark('Resort-Leisure', {
      hotelName: "Blue Lagoon Paradise",
      hotelType: "resort",
      targetAudience: "leisure",
      brandPersonality: "adventurous",
      location: "Maldives"
    });
  });
});
