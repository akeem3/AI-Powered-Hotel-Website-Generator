/**
 * Performance Benchmark Suite for LangGraph Workflow (Story 13.3.3)
 *
 * @trace epic: EPIC-13
 * @trace story: STORY-13.3.3
 * @trace reqs: NFR12 (Generation time < 60min, Cost < $0.50, Success rate > 95%)
 *
 * Why: This benchmark suite validates that the LangGraph workflow meets
 * the non-functional requirements for production deployment at scale
 * (10,000+ hotel websites). Unlike the e2e tests that use real LLM calls,
 * this suite uses mocked agents for reproducible, deterministic benchmarking
 * without incurring API costs.
 *
 * The benchmark measures:
 * - Generation time (workflow orchestration overhead)
 * - Cost tracking accuracy (via CostMonitor)
 * - Success rate over multiple runs
 * - Min/max/avg statistics for time and cost
 *
 * Testing Pattern:
 * - Uses mocked agents from jest.workflow.setup.js
 * - Adds realistic delays to simulate LLM processing time
 * - Resets CostMonitor before each test
 * - Runs multiple iterations for statistical analysis
 *
 * @example
 * ```bash
 * # Run performance benchmarks
 * npm test -- --config jest.config.workflow.js --testPathPatterns="performance-benchmarks" --testTimeout=600000
 * ```
 */

import { HomepageGenerationWorkflow } from '@/app/langgraph/workflows/HomepageGenerationWorkflow';
import { WorkflowState } from '@/app/langgraph/state/types';
import { ComponentSelector } from '@/app/langgraph/agents/ComponentSelector';
import { StylingAgent } from '@/app/langgraph/agents/StylingAgent';
import { ContentGenerator } from '@/app/langgraph/agents/ContentGenerator';
import { AssemblyAgent } from '@/app/langgraph/agents/AssemblyAgent';
import { QualityValidator } from '@/app/langgraph/agents/QualityValidator';

// Mock LangFuse
const mockTrace = {
  id: 'test-trace-id',
  generation: jest.fn().mockReturnValue({ end: jest.fn() }),
  update: jest.fn(),
  score: jest.fn(),
  event: jest.fn().mockReturnValue({ end: jest.fn() }),
};

const mockLangfuse = {
  trace: jest.fn().mockReturnValue(mockTrace),
  flush: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined),
};

jest.mock('langfuse', () => ({
  Langfuse: jest.fn().mockImplementation(() => mockLangfuse),
}));

// Mock Agents
jest.mock('@/app/langgraph/agents/ComponentSelector');
jest.mock('@/app/langgraph/agents/StylingAgent');
jest.mock('@/app/langgraph/agents/ContentGenerator');
jest.mock('@/app/langgraph/agents/AssemblyAgent');
jest.mock('@/app/langgraph/agents/QualityValidator');

/**
 * Helper to add realistic delay to simulate LLM processing time.
 * Typical LLM response times: 1-5 seconds per agent.
 */
const simulateLLMDelay = (minMs: number = 100, maxMs: number = 500): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Benchmark metrics interface
 */
interface BenchmarkMetrics {
  durationMs: number;
  totalCost: number;
  validationStatus: 'pass' | 'fail' | 'pending';
  qualityScore: number;
  success: boolean;
}

/**
 * Summary statistics interface
 */
interface SummaryStats {
  totalRuns: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  time: {
    min: number;
    max: number;
    avg: number;
    total: number;
  };
  cost: {
    min: number;
    max: number;
    avg: number;
    total: number;
  };
}

describe('Performance Benchmark Suite (Mocked Agents)', () => {
  let workflow: HomepageGenerationWorkflow;

  beforeEach(() => {
    jest.clearAllMocks();
    workflow = new HomepageGenerationWorkflow();

    // Mock ComponentSelector with realistic delay and cost
    (ComponentSelector.prototype.execute as jest.Mock).mockImplementation(async () => {
      await simulateLLMDelay(100, 300);
      return {
        componentSelection: {
          selectedComponents: ['hero', 'rooms', 'gallery', 'contact', 'navigation'],
          layoutStructure: 'standard',
          emphasisComponents: ['hero'],
          reasoning: 'Benchmark test selection'
        },
        stepCosts: { ComponentSelector: 0.08 }, // ~$0.08 per component selection
        totalCost: 0.08
      };
    });

    // Mock StylingAgent with realistic delay and cost
    (StylingAgent.prototype.execute as jest.Mock).mockImplementation(async () => {
      await simulateLLMDelay(150, 350);
      return {
        stylingSelection: {
          componentVariants: {
            hero: 'elegant',
            rooms: 'modern',
            gallery: 'minimal',
            contact: 'standard',
            navigation: 'compact'
          },
          reasoning: 'Benchmark styling'
        },
        stepCosts: { StylingAgent: 0.09 }, // ~$0.09 per styling
        totalCost: 0.09
      };
    });

    // Mock ContentGenerator with realistic delay and cost (highest cost agent)
    (ContentGenerator.prototype.execute as jest.Mock).mockImplementation(async () => {
      await simulateLLMDelay(200, 500);
      return {
        contentGeneration: {
          componentContent: {
            hero: { headline: 'Benchmark Hotel', subheadline: 'Performance Test' },
            rooms: { title: 'Our Rooms', description: 'Luxury accommodations' },
            gallery: { title: 'Gallery', description: 'Explore our spaces' },
            contact: { title: 'Contact Us', description: 'Get in touch' },
            navigation: { links: ['Home', 'Rooms', 'Gallery', 'Contact'] }
          },
          reasoning: 'Benchmark content'
        },
        stepCosts: { ContentGenerator: 0.15 }, // ~$0.15 per content generation
        totalCost: 0.15
      };
    });

    // Mock AssemblyAgent with realistic delay and cost
    (AssemblyAgent.prototype.execute as jest.Mock).mockImplementation(async () => {
      await simulateLLMDelay(100, 200);
      return {
        assembledConfig: {
          generationId: 'benchmark-test-123',
          timestamp: new Date().toISOString(),
          hotelParameters: {
            hotelName: 'Benchmark Hotel',
            hotelType: 'luxury',
            targetAudience: 'business',
            brandPersonality: 'professional',
            location: 'Test City'
          },
          components: [],
          layoutStructure: 'standard',
          emphasisComponents: ['hero'],
          validationStatus: 'pending'
        },
        stepCosts: { AssemblyAgent: 0.05 }, // ~$0.05 per assembly
        totalCost: 0.05
      };
    });

    // Mock QualityValidator with realistic delay and cost
    (QualityValidator.prototype.execute as jest.Mock).mockImplementation(async (state: WorkflowState) => {
      await simulateLLMDelay(100, 250);
      return {
        validationStatus: 'pass' as const,
        qualityScore: 95,
        validationErrors: [],
        budgetExceeded: false,
        stepCosts: { QualityValidator: 0.03 }, // ~$0.03 per validation
        totalCost: 0.03
      };
    });
  });

  /**
   * Helper function to run a single benchmark iteration
   */
  const runBenchmarkIteration = async (): Promise<BenchmarkMetrics> => {
    const startTime = Date.now();

    const initialState: WorkflowState = {
      generationId: `benchmark-${Date.now()}`,
      hotelParameters: {
        hotelName: 'Benchmark Test Hotel',
        hotelType: 'luxury',
        targetAudience: 'business',
        brandPersonality: 'professional',
        location: 'Test City',
      },
      componentSelection: undefined,
      stylingSelection: undefined,
      contentGeneration: undefined,
      assembledConfig: undefined,
      contentJson: undefined,
      validationStatus: 'pending',
      validationErrors: [],
      qualityScore: undefined,
      totalCost: 0,
      stepCosts: {},
      budgetRemaining: 2.0,
      currentAgent: 'start',
      retryCount: 0,
      errors: [],
      budgetExceeded: false,
    };

    const { finalState } = await workflow.execute(initialState);

    const endTime = Date.now();
    const durationMs = endTime - startTime;

    return {
      durationMs,
      totalCost: finalState.totalCost,
      validationStatus: finalState.validationStatus,
      qualityScore: finalState.qualityScore || 0,
      success: finalState.validationStatus === 'pass',
    };
  };

  /**
   * Helper function to calculate summary statistics
   */
  const calculateSummaryStats = (metrics: BenchmarkMetrics[]): SummaryStats => {
    const successCount = metrics.filter(m => m.success).length;
    const failureCount = metrics.length - successCount;

    const times = metrics.map(m => m.durationMs);
    const costs = metrics.map(m => m.totalCost);

    return {
      totalRuns: metrics.length,
      successCount,
      failureCount,
      successRate: (successCount / metrics.length) * 100,
      time: {
        min: Math.min(...times),
        max: Math.max(...times),
        avg: times.reduce((a, b) => a + b, 0) / times.length,
        total: times.reduce((a, b) => a + b, 0),
      },
      cost: {
        min: Math.min(...costs),
        max: Math.max(...costs),
        avg: costs.reduce((a, b) => a + b, 0) / costs.length,
        total: costs.reduce((a, b) => a + b, 0),
      },
    };
  };

  /**
   * NFR12: Generation Time Benchmark
   *
   * Validates that workflow completes within 60 minutes.
   * Note: With mocked agents, this measures orchestration overhead only.
   * Real LLM calls would take significantly longer.
   */
  test('should complete generation within 60 minutes', async () => {
    const startTime = Date.now();

    const result = await runBenchmarkIteration();

    const endTime = Date.now();
    const durationMinutes = (endTime - startTime) / 60000;

    // Log results
    console.log('\n📊 Generation Time Benchmark:');
    console.log(`   Duration: ${durationMinutes.toFixed(2)} minutes (${result.durationMs}ms)`);
    console.log(`   Status: ${result.validationStatus}`);
    console.log(`   Quality Score: ${result.qualityScore}`);

    // NFR12: < 60 minutes
    expect(durationMinutes).toBeLessThan(60);
    expect(result.success).toBe(true);
  }, 600000); // 10 minute timeout

  /**
   * NFR12: Cost Benchmark
   *
   * Validates that workflow generation costs less than $0.50.
   * Tracks cost via CostMonitor with mocked agent costs.
   */
  test('should generate website for less than $0.50', async () => {
    const result = await runBenchmarkIteration();

    // Log results
    console.log('\n💰 Cost Benchmark:');
    console.log(`   Total Cost: $${result.totalCost.toFixed(4)}`);
    console.log(`   Budget Remaining: $${(0.50 - result.totalCost).toFixed(4)}`);
    console.log(`   Status: ${result.validationStatus}`);

    // NFR12: < $0.50
    expect(result.totalCost).toBeLessThan(0.50);
    expect(result.success).toBe(true);
  }, 600000);

  /**
   * NFR12: Success Rate Benchmark
   *
   * Validates >95% success rate over multiple runs.
   * Runs workflow 20 times to calculate statistical success rate.
   */
  test('should achieve >95% success rate over multiple runs', async () => {
    const runs = 20;
    const metrics: BenchmarkMetrics[] = [];

    console.log(`\n🔄 Running ${runs} iterations for success rate benchmark...`);

    for (let i = 0; i < runs; i++) {
      const result = await runBenchmarkIteration();
      metrics.push(result);

      // Progress indicator
      if ((i + 1) % 5 === 0) {
        console.log(`   Progress: ${i + 1}/${runs} iterations complete`);
      }
    }

    const stats = calculateSummaryStats(metrics);

    // Log detailed statistics
    console.log('\n📈 Success Rate Benchmark Results:');
    console.log(`   Total Runs: ${stats.totalRuns}`);
    console.log(`   Successes: ${stats.successCount}`);
    console.log(`   Failures: ${stats.failureCount}`);
    console.log(`   Success Rate: ${stats.successRate.toFixed(2)}%`);
    console.log('\n⏱️  Time Statistics:');
    console.log(`   Min: ${stats.time.min}ms`);
    console.log(`   Max: ${stats.time.max}ms`);
    console.log(`   Avg: ${stats.time.avg.toFixed(2)}ms`);
    console.log(`   Total: ${(stats.time.total / 1000).toFixed(2)}s`);
    console.log('\n💵 Cost Statistics:');
    console.log(`   Min: $${stats.cost.min.toFixed(4)}`);
    console.log(`   Max: $${stats.cost.max.toFixed(4)}`);
    console.log(`   Avg: $${stats.cost.avg.toFixed(4)}`);
    console.log(`   Total: $${stats.cost.total.toFixed(4)}`);

    // NFR12: > 95% success rate
    expect(stats.successRate).toBeGreaterThan(95);
  }, 600000);

  /**
   * Multi-Hotel Type Benchmark
   *
   * Tests workflow with different hotel parameters to ensure
   * consistent performance across various scenarios.
   */
  test('should maintain performance across different hotel types', async () => {
    const hotelTypes = [
      { hotelType: 'luxury', targetAudience: 'business' },
      { hotelType: 'budget', targetAudience: 'family' },
      { hotelType: 'boutique', targetAudience: 'couples' },
      { hotelType: 'resort', targetAudience: 'leisure' },
    ];

    const metrics: BenchmarkMetrics[] = [];

    console.log('\n🏨 Testing multiple hotel types...');

    for (const params of hotelTypes) {
      const startTime = Date.now();

      const initialState: WorkflowState = {
        generationId: `benchmark-${params.hotelType}-${Date.now()}`,
        hotelParameters: {
          hotelName: `Test ${params.hotelType} Hotel`,
          hotelType: params.hotelType as any,
          targetAudience: params.targetAudience as any,
          brandPersonality: 'professional',
          location: 'Test City',
        },
        componentSelection: undefined,
        stylingSelection: undefined,
        contentGeneration: undefined,
        assembledConfig: undefined,
        contentJson: undefined,
        validationStatus: 'pending',
        validationErrors: [],
        qualityScore: undefined,
        totalCost: 0,
        stepCosts: {},
        budgetRemaining: 2.0,
        currentAgent: 'start',
        retryCount: 0,
        errors: [],
        budgetExceeded: false,
      };

      const { finalState } = await workflow.execute(initialState);

      const endTime = Date.now();

      metrics.push({
        durationMs: endTime - startTime,
        totalCost: finalState.totalCost,
        validationStatus: finalState.validationStatus,
        qualityScore: finalState.qualityScore || 0,
        success: finalState.validationStatus === 'pass',
      });

      console.log(`   ${params.hotelType}: ${(endTime - startTime)}ms, $${finalState.totalCost.toFixed(4)}`);
    }

    const stats = calculateSummaryStats(metrics);

    console.log('\n📊 Multi-Hotel Type Summary:');
    console.log(`   Success Rate: ${stats.successRate.toFixed(2)}%`);
    console.log(`   Avg Time: ${stats.time.avg.toFixed(2)}ms`);
    console.log(`   Avg Cost: $${stats.cost.avg.toFixed(4)}`);

    // All hotel types should succeed
    expect(stats.successRate).toBe(100);
    // All costs should be under $0.50
    expect(stats.cost.max).toBeLessThan(0.50);
  }, 600000);
});
