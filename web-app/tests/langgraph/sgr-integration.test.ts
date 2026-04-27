/**
 * SGR Integration Tests
 *
 * Tests Schema-Guided Reasoning (SGR) implementation with validation retry.
 * Measures success rates for individual agents and full workflow.
 *
 * Trace:
 *   epic: EPIC-15
 *   story: STORY-15.04
 *
 * Test Cases:
 * 1. ComponentSelector with retry achieves 95%+ success rate (20 runs)
 * 2. StylingAgent with retry achieves 95%+ success rate (20 runs)
 * 3. ContentGenerator with retry achieves 95%+ success rate (20 runs)
 * 4. AssemblyAgent with retry achieves 95%+ success rate (20 runs)
 * 5. Full workflow with SGR completes successfully (10 runs)
 */

import { AnthropicClient } from '@/app/langgraph/services/AnthropicClient';
import { LangFuseService } from '@/app/langgraph/services/LangFuseService';
import { CostMonitor } from '@/app/langgraph/services/CostMonitor';
import { ComponentSelectorOutputSchema, StylingAgentOutputSchema, ContentGeneratorOutputSchema, HomepageConfigSchema } from '@/app/langgraph/agents/schemas';
import { z } from 'zod';

// Import node-fetch for restoring real fetch in tests
const nodeFetch = require('node-fetch');

// Create a helper function to make a mock fetch response in Anthropic format
function createMockAnthropicResponse(text: string, usage = { input_tokens: 500, output_tokens: 800 }, model = 'glm-4.7') {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      content: [{ type: 'text', text }],
      usage: { ...usage, cache_read_input_tokens: 0 },
      model,
    }),
    headers: new Map(),
  };
}

// Test data generators
const generateValidComponentSelectorOutput = () => ({
  selectedComponents: ['hero', 'navigation', 'rooms', 'testimonials', 'contact'],
  layoutStructure: 'mixed' as const,
  emphasisComponents: ['hero', 'rooms'],
  reasoning: 'Based on the luxury hotel type and couples target audience, I selected components that emphasize romance and premium experiences.'
});

const generateValidStylingAgentOutput = () => ({
  componentVariants: {
    hero: {
      style: 'elegant',
      layout: 'centered',
      overlay: 'dark',
      height: 'large'
    },
    navigation: {
      navStyle: 'glass',
      navLayout: 'default'
    },
    rooms: {
      roomCardStyle: 'detailed',
      imageHeight: 'tall'
    },
    testimonials: {
      testimonialsLayout: 'featured',
      testimonialsColumns: 2
    },
    contact: {
      contactStyle: 'minimal',
      contactBackground: 'muted'
    }
  },
  reasoning: 'Selected elegant variants with dark overlays for luxury positioning, using glass navigation for modern appeal.'
});

const generateValidContentGeneratorOutput = () => ({
  componentContent: {
    hero: {
      headline: 'Experience Paradise at The Grand Resort',
      description: 'Discover unparalleled luxury in the heart of the Maldives.',
      tagline: 'Where Dreams Meet Reality',
      primaryCTA: {
        text: 'Book Your Escape',
        href: '/booking',
        ariaLabel: 'Book your stay at The Grand Resort'
      },
      secondaryCTA: {
        text: 'Explore Rooms',
        href: '/rooms',
        ariaLabel: 'Explore our luxury rooms'
      }
    },
    'rooms-content': {
      rooms: [
        {
          id: 'room-1',
          name: 'Ocean Villa',
          type: 'Villa',
          price: 850,
          capacity: 2,
          amenities: ['Private Pool', 'Ocean View', 'Butler Service'],
          description: 'Wake up to breathtaking ocean views in our exclusive overwater villa.'
        }
      ]
    },
    'testimonials-content': {
      testimonials: [
        {
          id: 'test-1',
          customerName: 'Sarah Mitchell',
          customerTitle: 'Verified Guest',
          rating: 5,
          quote: 'An absolutely magical experience. The attention to detail was extraordinary.',
          date: '2024-01-15',
          location: 'New York, USA'
        }
      ]
    },
    contact: {
      submitButtonText: 'Send Inquiry',
      successMessage: 'Thank you for your interest. We will respond within 24 hours.'
    }
  },
  reasoning: 'Generated romantic, aspirational content targeting couples seeking luxury getaways.'
});

const generateValidAssemblyAgentOutput = () => ({
  generationId: 'grand-resort-v1',
  timestamp: new Date().toISOString(),
  hotelParameters: {
    hotelType: 'luxury' as const,
    targetAudience: 'couples' as const,
    brandPersonality: 'elegant' as const,
    hotelName: 'The Grand Resort',
    location: 'Maldives'
  },
  components: [
    {
      type: 'hero' as const,
      variant: { style: 'elegant', layout: 'centered' },
      props: {
        headline: 'Experience Paradise',
        description: 'Luxury awaits'
      },
      order: 0
    },
    {
      type: 'navigation' as const,
      variant: { style: 'glass', layout: 'default' },
      props: {},
      order: 1
    },
    {
      type: 'rooms' as const,
      variant: { style: 'detailed', height: 'tall' },
      props: {},
      order: 2
    },
    {
      type: 'gallery' as const,
      variant: { columns: 3 },
      props: {},
      order: 3
    },
    {
      type: 'testimonials' as const,
      variant: { layout: 'featured', columns: 2 },
      props: {},
      order: 4
    }
  ],
  layoutStructure: 'mixed' as const,
  emphasisComponents: ['hero'],
  validationStatus: 'PASS' as const
});

// Test utilities
interface TestResult {
  agentName: string;
  totalRuns: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  errors: string[];
  attemptsPerRun: number[];
}

function calculateSuccessRate(results: TestResult): number {
  return (results.successCount / results.totalRuns) * 100;
}

function logTestResults(results: TestResult): void {
  console.log(`\n=== ${results.agentName} SGR Integration Test Results ===`);
  console.log(`Total Runs: ${results.totalRuns}`);
  console.log(`Successes: ${results.successCount}`);
  console.log(`Failures: ${results.failureCount}`);
  console.log(`Success Rate: ${results.successRate.toFixed(2)}%`);
  console.log(`Average Attempts per Success: ${results.attemptsPerRun.length > 0 ? (results.attemptsPerRun.reduce((a, b) => a + b, 0) / results.attemptsPerRun.length).toFixed(2) : 'N/A'}`);
  if (results.errors.length > 0) {
    console.log(`Errors encountered:`);
    results.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
  }
  console.log('='.repeat(50));
}

// Log errors immediately during test execution for debugging
function logError(runNumber: number, error: any): void {
  console.error(`\n[ERROR] Run ${runNumber} failed:`, error.message);
  if (error.errors) {
    console.error(`Zod validation errors:`, JSON.stringify(error.errors, null, 2));
  }
}

describe('SGR Integration Tests', () => {
  let anthropicClient: AnthropicClient;
  let mockSendCompletion: jest.SpyInstance;

  beforeEach(() => {
    // Clear all mocks and timers to ensure clean state
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Create AnthropicClient without langfuse/costMonitor for cleaner tests
    anthropicClient = new AnthropicClient();

    // Mock sendCompletion directly instead of _executeFetch
    // This ensures the mock is properly applied to the public method
    mockSendCompletion = jest.spyOn(anthropicClient, 'sendCompletion');
  });

  afterEach(() => {
    // Restore the spy to prevent test suite interference
    // Note: Don't call jest.restoreAllMocks() here as it can cause issues
    mockSendCompletion.mockRestore();
  });

  describe('AnthropicClient.generateWithRetry - ComponentSelector Schema (20 runs)', () => {
    const RUNS = 20;
    const SUCCESS_THRESHOLD = 95;
    let results: TestResult;

    beforeAll(() => {
      results = {
        agentName: 'ComponentSelector',
        totalRuns: RUNS,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        errors: [],
        attemptsPerRun: []
      };
    });

    afterAll(() => {
      results.successRate = calculateSuccessRate(results);
      logTestResults(results);
    });

    test('should achieve 95%+ success rate with SGR retry', async () => {
      for (let i = 0; i < RUNS; i++) {
        const failureScenario = i % 5;

        // Setup mock responses based on attempt number
        let attemptCount = 0;
        mockSendCompletion.mockImplementation(async () => {
          attemptCount++;

          if (failureScenario === 0) {
            // First attempt fails with missing field
            if (attemptCount === 1) {
              return {
                text: JSON.stringify({
                  layoutStructure: 'mixed',
                  emphasisComponents: ['hero'],
                  reasoning: 'Test'
                  // Missing selectedComponents
                }),
                usage: { input: 500, output: 800, total: 1300 },
                model: 'claude-3-5-sonnet-20241022',
                cost: 0.01
              };
            }
          } else if (failureScenario === 1) {
            // Wrong type
            if (attemptCount === 1) {
              return {
                text: JSON.stringify({
                  selectedComponents: 'invalid', // Should be array
                  layoutStructure: 'mixed',
                  emphasisComponents: ['hero'],
                  reasoning: 'Test'
                }),
                usage: { input: 500, output: 800, total: 1300 },
                model: 'claude-3-5-sonnet-20241022',
                cost: 0.01
              };
            }
          } else if (failureScenario === 2) {
            // Missing reasoning - needs 2 attempts
            if (attemptCount <= 2) {
              return {
                text: JSON.stringify({
                  selectedComponents: ['hero', 'navigation', 'rooms'],
                  layoutStructure: 'mixed',
                  emphasisComponents: ['hero']
                  // Missing reasoning
                }),
                usage: { input: 500, output: 800, total: 1300 },
                model: 'claude-3-5-sonnet-20241022',
                cost: 0.01
              };
            }
          } else if (failureScenario === 3) {
            // Invalid enum value
            if (attemptCount === 1) {
              return {
                text: JSON.stringify({
                  selectedComponents: ['hero', 'navigation'],
                  layoutStructure: 'invalid-layout',
                  emphasisComponents: ['hero'],
                  reasoning: 'Test reasoning that is long enough to pass validation'
                }),
                usage: { input: 500, output: 800, total: 1300 },
                model: 'claude-3-5-sonnet-20241022',
                cost: 0.01
              };
            }
          }
          // Success case
          return {
            text: JSON.stringify(generateValidComponentSelectorOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          };
        });

        try {
          const result = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Test prompt' }],
            ComponentSelectorOutputSchema,
            {
              agentName: 'ComponentSelector',
              budgetRemaining: 2.0,
              temperature: 0.2,
              maxTokens: 4000
            },
            3 // maxRetries
          );

          expect(result).toBeDefined();
          expect(result.selectedComponents).toBeDefined();
          expect(Array.isArray(result.selectedComponents)).toBe(true);

          results.successCount++;
          results.attemptsPerRun.push(attemptCount);

        } catch (error: any) {
          results.failureCount++;
          results.errors.push(`Run ${i + 1}: ${error.message}`);
        }

        mockSendCompletion.mockReset();
      }

      results.successRate = calculateSuccessRate(results);
      expect(results.successRate).toBeGreaterThanOrEqual(SUCCESS_THRESHOLD);
      expect(results.successCount).toBeGreaterThanOrEqual(Math.floor(RUNS * SUCCESS_THRESHOLD / 100));

    }, 120000);
  });

  describe('AnthropicClient.generateWithRetry - StylingAgent Schema (20 runs)', () => {
    const RUNS = 20;
    const SUCCESS_THRESHOLD = 95;
    let results: TestResult;

    beforeAll(() => {
      results = {
        agentName: 'StylingAgent',
        totalRuns: RUNS,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        errors: [],
        attemptsPerRun: []
      };
    });

    afterAll(() => {
      results.successRate = calculateSuccessRate(results);
      logTestResults(results);
    });

    test('should achieve 95%+ success rate with SGR retry', async () => {
      for (let i = 0; i < RUNS; i++) {
        const failureScenario = i % 5;
        let attemptCount = 0;

        mockSendCompletion.mockImplementation(async () => {
          attemptCount++;

          if (failureScenario === 0) {
            if (attemptCount === 1) {
              return {
                text: JSON.stringify({
                  reasoning: 'Test'
                  // Missing componentVariants
                }),
                usage: { input: 500, output: 800, total: 1300 },
                model: 'claude-3-5-sonnet-20241022',
                cost: 0.01
              };
            }
          } else if (failureScenario === 1) {
            if (attemptCount === 1) {
              const invalid = generateValidStylingAgentOutput();
              (invalid as any).componentVariants.hero.style = 'invalid-style';
              return {
                text: JSON.stringify(invalid),
                usage: { input: 500, output: 800, total: 1300 },
                model: 'claude-3-5-sonnet-20241022',
                cost: 0.01
              };
            }
          } else if (failureScenario === 2) {
            if (attemptCount <= 2) {
              return {
                text: JSON.stringify({
                  componentVariants: {
                    hero: { style: 'elegant' }
                  }
                  // Missing reasoning
                }),
                usage: { input: 500, output: 800, total: 1300 },
                model: 'claude-3-5-sonnet-20241022',
                cost: 0.01
              };
            }
          }
          return {
            text: JSON.stringify(generateValidStylingAgentOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          };
        });

        try {
          const result = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Test prompt' }],
            StylingAgentOutputSchema,
            {
              agentName: 'StylingAgent',
              budgetRemaining: 1.5,
              temperature: 0.2,
              maxTokens: 4000
            },
            3
          );

          expect(result).toBeDefined();
          expect(result.componentVariants).toBeDefined();

          results.successCount++;
          results.attemptsPerRun.push(attemptCount);

        } catch (error: any) {
          results.failureCount++;
          results.errors.push(`Run ${i + 1}: ${error.message}`);
        }

        mockSendCompletion.mockReset();
      }

      results.successRate = calculateSuccessRate(results);
      expect(results.successRate).toBeGreaterThanOrEqual(SUCCESS_THRESHOLD);
      expect(results.successCount).toBeGreaterThanOrEqual(Math.floor(RUNS * SUCCESS_THRESHOLD / 100));

    }, 120000);
  });

  describe('AnthropicClient.generateWithRetry - ContentGenerator Schema (20 runs)', () => {
    const RUNS = 20;
    const SUCCESS_THRESHOLD = 95;
    let results: TestResult;

    beforeAll(() => {
      results = {
        agentName: 'ContentGenerator',
        totalRuns: RUNS,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        errors: [],
        attemptsPerRun: []
      };
    });

    afterAll(() => {
      results.successRate = calculateSuccessRate(results);
      logTestResults(results);
    });

    test('should achieve 95%+ success rate with SGR retry', async () => {
      for (let i = 0; i < RUNS; i++) {
        const failureScenario = i % 5;

        // Build response sequence for this run
        const responses: any[] = [];

        if (failureScenario === 0) {
          // First attempt fails with missing componentContent
          responses.push({
            text: JSON.stringify({
              reasoning: 'Test'
              // Missing componentContent
            }),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
        } else if (failureScenario === 1) {
          // First attempt fails with missing hero
          const invalid = generateValidContentGeneratorOutput();
          delete (invalid.componentContent as any).hero;
          responses.push({
            text: JSON.stringify(invalid),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
        } else if (failureScenario === 2) {
          // First two attempts fail with missing reasoning
          for (let j = 0; j < 2; j++) {
            responses.push({
              text: JSON.stringify({
                componentContent: {
                  hero: { headline: 'Test' }
                }
                // Missing reasoning
              }),
              usage: { input: 500, output: 800, total: 1300 },
              model: 'claude-3-5-sonnet-20241022',
              cost: 0.01
            });
          }
        }
        // Always add valid response at the end
        responses.push({
          text: JSON.stringify(generateValidContentGeneratorOutput()),
          usage: { input: 500, output: 800, total: 1300 },
          model: 'claude-3-5-sonnet-20241022',
          cost: 0.01
        });

        // Reset and set up mock with implementationOnce chain
        mockSendCompletion.mockReset();
        let callCount = 0;
        mockSendCompletion.mockImplementation(async () => {
          // If we have predefined responses, use them; otherwise return valid response
          if (callCount < responses.length) {
            return responses[callCount++];
          }
          return {
            text: JSON.stringify(generateValidContentGeneratorOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          };
        });

        try {
          const result = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Test prompt' }],
            ContentGeneratorOutputSchema,
            {
              agentName: 'ContentGenerator',
              budgetRemaining: 1.0,
              temperature: 0.2,
              maxTokens: 3000
            },
            3
          );

          expect(result).toBeDefined();
          expect(result.componentContent).toBeDefined();

          results.successCount++;
          results.attemptsPerRun.push(callCount);

        } catch (error: any) {
          logError(i + 1, error);
          results.failureCount++;
          results.errors.push(`Run ${i + 1}: ${error.message}`);
        }

        mockSendCompletion.mockReset();
      }

      results.successRate = calculateSuccessRate(results);
      expect(results.successRate).toBeGreaterThanOrEqual(SUCCESS_THRESHOLD);
      expect(results.successCount).toBeGreaterThanOrEqual(Math.floor(RUNS * SUCCESS_THRESHOLD / 100));

    }, 120000);
  });

  describe('AnthropicClient.generateWithRetry - AssemblyAgent Schema (20 runs)', () => {
    const RUNS = 20;
    const SUCCESS_THRESHOLD = 95;
    let results: TestResult;

    beforeAll(() => {
      results = {
        agentName: 'AssemblyAgent',
        totalRuns: RUNS,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        errors: [],
        attemptsPerRun: []
      };
    });

    afterAll(() => {
      results.successRate = calculateSuccessRate(results);
      logTestResults(results);
    });

    test('should achieve 95%+ success rate with SGR retry', async () => {
      for (let i = 0; i < RUNS; i++) {
        const failureScenario = i % 5;

        // Build response sequence for this run
        const responses: any[] = [];

        if (failureScenario === 0) {
          // First attempt fails with missing components
          const invalid = generateValidAssemblyAgentOutput();
          delete (invalid as any).components;
          responses.push({
            text: JSON.stringify(invalid),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
        } else if (failureScenario === 1) {
          // First attempt fails with invalid layoutStructure
          const invalid = generateValidAssemblyAgentOutput();
          (invalid as any).layoutStructure = 'invalid';
          responses.push({
            text: JSON.stringify(invalid),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
        } else if (failureScenario === 2) {
          // First two attempts fail with missing required fields
          for (let j = 0; j < 2; j++) {
            responses.push({
              text: JSON.stringify({
                generationId: 'test-v1',
                timestamp: new Date().toISOString(),
                hotelParameters: {
                  hotelType: 'luxury',
                  targetAudience: 'couples',
                  brandPersonality: 'elegant',
                  hotelName: 'Test',
                  location: 'Test'
                }
                // Missing components, layoutStructure, etc
              }),
              usage: { input: 500, output: 800, total: 1300 },
              model: 'claude-3-5-sonnet-20241022',
              cost: 0.01
            });
          }
        }
        // Always add valid response at the end
        responses.push({
          text: JSON.stringify(generateValidAssemblyAgentOutput()),
          usage: { input: 500, output: 800, total: 1300 },
          model: 'claude-3-5-sonnet-20241022',
          cost: 0.01
        });

        // Reset and set up mock
        mockSendCompletion.mockReset();
        let callCount = 0;
        mockSendCompletion.mockImplementation(async () => {
          if (callCount < responses.length) {
            return responses[callCount++];
          }
          return {
            text: JSON.stringify(generateValidAssemblyAgentOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          };
        });

        try {
          const result = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Test prompt' }],
            HomepageConfigSchema,
            {
              agentName: 'AssemblyAgent',
              budgetRemaining: 0.5,
              temperature: 0.2,
              maxTokens: 4000
            },
            3
          );

          expect(result).toBeDefined();
          expect(result.components).toBeDefined();

          results.successCount++;
          results.attemptsPerRun.push(callCount);

        } catch (error: any) {
          logError(i + 1, error);
          results.failureCount++;
          results.errors.push(`Run ${i + 1}: ${error.message}`);
        }

        mockSendCompletion.mockReset();
      }

      results.successRate = calculateSuccessRate(results);
      expect(results.successRate).toBeGreaterThanOrEqual(SUCCESS_THRESHOLD);
      expect(results.successCount).toBeGreaterThanOrEqual(Math.floor(RUNS * SUCCESS_THRESHOLD / 100));

    }, 120000);
  });

  describe('Full Workflow SGR Tests (10 runs)', () => {
    const RUNS = 10;
    let results: TestResult;

    beforeAll(() => {
      results = {
        agentName: 'FullWorkflow',
        totalRuns: RUNS,
        successCount: 0,
        failureCount: 0,
        successRate: 0,
        errors: [],
        attemptsPerRun: []
      };
    });

    afterAll(() => {
      results.successRate = calculateSuccessRate(results);
      logTestResults(results);
    });

    test('should complete full workflow successfully with SGR', async () => {
      for (let i = 0; i < RUNS; i++) {
        const failureScenario = i % 3;

        try {
          // Component Selector
          mockSendCompletion.mockReset();
          let csCallCount = 0;
          const csResponses: any[] = [];
          if (failureScenario === 0) {
            csResponses.push({
              text: JSON.stringify({
                layoutStructure: 'mixed',
                emphasisComponents: ['hero'],
                reasoning: 'Test'
              }),
              usage: { input: 500, output: 800, total: 1300 },
              model: 'claude-3-5-sonnet-20241022',
              cost: 0.01
            });
          }
          csResponses.push({
            text: JSON.stringify(generateValidComponentSelectorOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
          mockSendCompletion.mockImplementation(async () => csResponses[csCallCount++]);

          const componentResult = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Component selection prompt' }],
            ComponentSelectorOutputSchema,
            { agentName: 'ComponentSelector', budgetRemaining: 2.0 },
            3
          );
          expect(componentResult.selectedComponents).toBeDefined();
          const totalAttempts = csCallCount;

          // Styling Agent
          mockSendCompletion.mockReset();
          let saCallCount = 0;
          const saResponses: any[] = [];
          if (failureScenario === 1) {
            saResponses.push({
              text: JSON.stringify({
                reasoning: 'Test'
              }),
              usage: { input: 500, output: 800, total: 1300 },
              model: 'claude-3-5-sonnet-20241022',
              cost: 0.01
            });
          }
          saResponses.push({
            text: JSON.stringify(generateValidStylingAgentOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
          mockSendCompletion.mockImplementation(async () => saResponses[saCallCount++]);

          const stylingResult = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Styling prompt' }],
            StylingAgentOutputSchema,
            { agentName: 'StylingAgent', budgetRemaining: 1.5 },
            3
          );
          expect(stylingResult.componentVariants).toBeDefined();

          // Content Generator
          mockSendCompletion.mockReset();
          let cgCallCount = 0;
          const cgResponses: any[] = [];
          if (failureScenario === 2) {
            cgResponses.push({
              text: JSON.stringify({
                reasoning: 'Test'
              }),
              usage: { input: 500, output: 800, total: 1300 },
              model: 'claude-3-5-sonnet-20241022',
              cost: 0.01
            });
          }
          cgResponses.push({
            text: JSON.stringify(generateValidContentGeneratorOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
          mockSendCompletion.mockImplementation(async () => cgResponses[cgCallCount++]);

          const contentResult = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Content generation prompt' }],
            ContentGeneratorOutputSchema,
            { agentName: 'ContentGenerator', budgetRemaining: 1.0 },
            3
          );
          expect(contentResult.componentContent).toBeDefined();

          // Assembly Agent
          mockSendCompletion.mockReset();
          let aaCallCount = 0;
          const aaResponses: any[] = [];
          if (failureScenario === 0) {
            const invalid = generateValidAssemblyAgentOutput();
            delete (invalid as any).components;
            aaResponses.push({
              text: JSON.stringify(invalid),
              usage: { input: 500, output: 800, total: 1300 },
              model: 'claude-3-5-sonnet-20241022',
              cost: 0.01
            });
          }
          aaResponses.push({
            text: JSON.stringify(generateValidAssemblyAgentOutput()),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          });
          mockSendCompletion.mockImplementation(async () => aaResponses[aaCallCount++]);

          const assemblyResult = await anthropicClient.generateWithRetry(
            [{ role: 'user', content: 'Assembly prompt' }],
            HomepageConfigSchema,
            { agentName: 'AssemblyAgent', budgetRemaining: 0.5 },
            3
          );
          expect(assemblyResult.components).toBeDefined();

          results.successCount++;
          results.attemptsPerRun.push((totalAttempts + saCallCount + cgCallCount + aaCallCount) / 4);

        } catch (error: any) {
          results.failureCount++;
          results.errors.push(`Run ${i + 1}: ${error.message}`);
        }

        mockSendCompletion.mockReset();
      }

      results.successRate = calculateSuccessRate(results);
      expect(results.successRate).toBe(100);
      expect(results.successCount).toBe(RUNS);

    }, 120000);
  });

  describe('SGR Error Feedback and Retry Behavior', () => {
    test('should retry on validation failure and eventually succeed', async () => {
      let attemptCount = 0;

      mockSendCompletion.mockImplementation(async () => {
        attemptCount++;

        if (attemptCount === 1) {
          // First response fails validation
          return {
            text: JSON.stringify({
              selectedComponents: 'invalid', // Wrong type
              layoutStructure: 'mixed',
              emphasisComponents: ['hero'],
              reasoning: 'Test reasoning that is long enough to pass validation'
            }),
            usage: { input: 500, output: 800, total: 1300 },
            model: 'claude-3-5-sonnet-20241022',
            cost: 0.01
          };
        }

        // Second attempt succeeds
        return {
          text: JSON.stringify(generateValidComponentSelectorOutput()),
          usage: { input: 500, output: 800, total: 1300 },
          model: 'claude-3-5-sonnet-20241022',
          cost: 0.01
        };
      });

      const result = await anthropicClient.generateWithRetry(
        [{ role: 'user', content: 'Original prompt' }],
        ComponentSelectorOutputSchema,
        { agentName: 'ComponentSelector', budgetRemaining: 2.0 },
        3
      );

      // Should succeed on retry
      expect(result).toBeDefined();
      expect(result.selectedComponents).toBeDefined();
      expect(attemptCount).toBe(2); // Failed once, succeeded on retry
    });

    test('should respect maxRetries limit and throw error', async () => {
      let attemptCount = 0;

      mockSendCompletion.mockImplementation(async () => {
        attemptCount++;
        // Always return invalid response
        return {
          text: JSON.stringify({
            selectedComponents: 'invalid',
            layoutStructure: 'mixed',
            emphasisComponents: ['hero'],
            reasoning: 'Test reasoning that is long enough to pass validation'
          }),
          usage: { input: 500, output: 800, total: 1300 },
          model: 'claude-3-5-sonnet-20241022',
          cost: 0.01
        };
      });

      await expect(
        anthropicClient.generateWithRetry(
          [{ role: 'user', content: 'Test prompt' }],
          ComponentSelectorOutputSchema,
          { agentName: 'ComponentSelector', budgetRemaining: 2.0 },
          2 // Only 2 retries
        )
      ).rejects.toThrow(/validation failed/i);

      // Should have attempted exactly 2 times
      expect(attemptCount).toBe(2);
    });
  });
});
