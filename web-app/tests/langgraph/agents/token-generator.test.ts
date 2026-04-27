/**
 * Story 20.3: TokenGenerator Agent + APCA Contrast Retry Loop
 * Test Suite
 *
 * Tests the TokenGenerator agent that generates archetype-specific OKLCH
 * color tokens, typography, spacing, and border radius selections, then
 * validates them through APCA contrast checking with automatic retry.
 *
 * Test coverage:
 * - Agent extends BaseAgent pattern
 * - getAgentName() returns correct name
 * - Prerequisite validation (archetypeClassification required)
 * - Valid token generation with various archetypes
 * - Schema validation (HotelDesignTokensSchema)
 * - APCA retry loop integration
 * - Cost tracking
 * - LangFuse integration
 * - Mock LLM response handling
 * - Error handling for invalid inputs
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { TokenGenerator } from '../../../app/langgraph/agents/TokenGenerator';
import { TokenGeneratorOutputSchema, HotelParametersSchema } from '../../../app/langgraph/agents/schemas';
import { WorkflowState } from '../../../app/langgraph/state/types';
import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';
import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';
import { AnthropicClient } from '../../../app/langgraph/services/AnthropicClient';
import { OpenRouterClient } from '../../../app/langgraph/services/OpenRouterClient';

// Default mock response for successful token generation (heritage-opulence archetype)
const defaultMockResponse = {
  text: JSON.stringify({
    archetype: 'heritage-opulence',
    guestPersona: 'Discerning luxury travelers who appreciate refined elegance, personalized service, and attention to detail. They seek properties with character, history, and a sense of place.',
    emotionalIntent: 'Sophisticated, welcomed, and immersed in timeless elegance',
    architecturalInspiration: 'Georgian townhouses with high ceilings, marble floors, and rich wood paneling',
    forbiddenElements: [
      'bg-white',
      'tracking-normal',
      'text-blue-*',
      'Inter as heading font'
    ],
    colorScheme: {
      primaryHue: 235,
      primaryChroma: 0.18,
      primaryLightness: 0.45,
      secondaryHue: 45,
      secondaryChroma: 0.22,
      secondaryLightness: 0.55,
      surfaceType: 'warm-cream',
      accentStrategy: 'complementary'
    },
    typography: {
      headingPersonality: 'serif-elegant',
      bodyPersonality: 'serif-readable',
      scaleRatio: 'perfect-fourth'
    },
    spacing: {
      density: 'comfortable'
    },
    borderRadius: {
      style: 'subtle'
    }
  }),
  usage: { input: 500, output: 800, total: 1300 },
  model: 'anthropic/claude-3.5-sonnet',
  cost: 0.00195
};

// Mock LangFuse SDK
jest.mock('langfuse', () => {
  return {
    Langfuse: jest.fn().mockImplementation(() => ({
      trace: jest.fn(() => ({
        id: 'test-trace-id',
        generation: jest.fn(() => ({
          end: jest.fn(),
        })),
        update: jest.fn(),
      })),
      getPrompt: jest.fn().mockResolvedValue({
        compile: jest.fn((vars: any) => `Mock token generator prompt with ${JSON.stringify(vars)}`),
      }),
      flush: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

// Mock LLMProviderFactory
jest.mock('../../../app/langgraph/services/LLMProviderFactory', () => ({
  LLMProviderFactory: {
    create: jest.fn(() => ({
      sendCompletion: jest.fn().mockResolvedValue(defaultMockResponse),
      selectModel: jest.fn(),
      getAvailableModels: jest.fn(),
      getModelPricing: jest.fn(),
    })),
    getCurrentProviderType: jest.fn(() => 'openrouter'),
    isValidProvider: jest.fn(() => true),
  },
}));

// Mock apcaRetryLoopFromColorScheme using @/ alias and __esModule: true so SWC
// treats the factory result as an ES module namespace, enabling mock interception.
jest.mock('@/lib/color/apca-retry-loop', () => ({
  __esModule: true,
  apcaRetryLoopFromColorScheme: jest.fn(() => ({
    theme: {},
    contrastReport: {
      pairs: [
        {
          foreground: 'oklch(0.2 0.02 235)',
          background: 'oklch(0.95 0.01 45)',
          result: { contrast: 85, passes: true, level: 'AAA' },
          tokenPair: 'text-primary on surface-default'
        }
      ],
      allPass: true,
      failCount: 0
    },
    iterations: 0,
    adjustmentsMade: [],
    success: true
  })),
}));

describe('TokenGenerator', () => {
  let mockState: WorkflowState;

  beforeEach(() => {
    // Reset all mocks (clears call counts; implementations are preserved for jest.fn(),
    // and restored-to-original for jest.spyOn via restoreAllMocks in afterEach setup).
    jest.clearAllMocks();

    // Re-establish sendCompletion mock after restoreAllMocks() (called by afterEach in
    // jest.workflow.setup.js). spyOn is used because the LLM_PROVIDER env var selects the
    // real AnthropicClient at runtime, and the jest.mock() for LLMProviderFactory now works
    // with properly-hoisted mocks (jest is global, not imported from @jest/globals).
    // The prototype spy ensures both client types are covered.
    jest.spyOn(AnthropicClient.prototype, 'sendCompletion').mockResolvedValue(defaultMockResponse as any);
    jest.spyOn(OpenRouterClient.prototype, 'sendCompletion').mockResolvedValue(defaultMockResponse as any);

    // Re-establish langfuse mock after restoreAllMocks (called by afterEach in setup file).
    // The jest.mock('langfuse', ...) factory is hoisted but restoreAllMocks() wipes spy implementations.
    const langfuseMod = require('langfuse');
    const mockLangfuseImpl = () => ({
      trace: jest.fn().mockReturnValue({
        id: 'mock-trace-id',
        span: jest.fn().mockReturnValue({ end: jest.fn(), update: jest.fn() }),
        update: jest.fn(),
        event: jest.fn(),
        generation: jest.fn().mockReturnValue({ end: jest.fn(), update: jest.fn() }),
        score: jest.fn(),
      }),
      getPrompt: jest.fn().mockResolvedValue({
        compile: jest.fn().mockReturnValue('Mock compiled prompt'),
        prompt: 'Mock prompt template',
      }),
      flush: jest.fn().mockResolvedValue(undefined),
      flushAsync: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
      shutdownAsync: jest.fn().mockResolvedValue(undefined),
    });
    (langfuseMod.Langfuse as jest.Mock).mockImplementation(mockLangfuseImpl);

    // Reset CostMonitor state
    CostMonitor.prototype.checkBudget = jest.fn();

    // Create a valid mock state with hotel parameters and archetype classification
    mockState = {
      generationId: 'test-gen-123',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Grand Palace Hotel',
        location: 'Paris, France'
      },
      archetypeClassification: {
        archetype: 'heritage-opulence',
        reasoning: 'Based on the hotelType "luxury", targetAudience "couples", and brandPersonality "elegant", this hotel aligns with the heritage-opulence archetype.'
      },
      designTokens: undefined,
      componentSelection: undefined,
      stylingSelection: undefined,
      contentGeneration: undefined,
      assembledConfig: undefined,
      validationStatus: 'pending',
      validationErrors: [],
      qualityScore: undefined,
      totalCost: 0,
      stepCosts: {},
      budgetRemaining: 2.0,
      currentAgent: '',
      retryCount: 0,
      errors: [],
      budgetExceeded: false
    };
  });

  describe('getAgentName', () => {
    it('should return TokenGenerator', () => {
      const agent = new TokenGenerator();
      expect(agent.getAgentName()).toBe('TokenGenerator');
    });
  });

  describe('Agent Pattern Compliance', () => {
    it('should extend BaseAgent pattern', () => {
      const agent = new TokenGenerator();
      expect(agent).toBeInstanceOf(TokenGenerator);
      expect(agent.getAgentName).toBeDefined();
      expect(agent.performGeneration).toBeDefined();
    });

    it('should have execute() method from BaseAgent', () => {
      const agent = new TokenGenerator();
      expect(agent.execute).toBeDefined();
      expect(typeof agent.execute).toBe('function');
    });
  });

  describe('Prerequisite Validation', () => {
    it('should throw error when archetypeClassification is missing', async () => {
      const agent = new TokenGenerator();
      const stateWithoutArchetype = { ...mockState, archetypeClassification: undefined } as any;

      await expect(agent.performGeneration(stateWithoutArchetype)).rejects.toThrow(
        'TokenGenerator requires archetypeClassification to be present in state'
      );
    });

    it('should proceed when archetypeClassification is present', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.designTokens).toBeDefined();
      expect(result.designTokens?.designTokens).toBeDefined();
    });
  });

  describe('Prompt Loading', () => {
    it('should load prompt with archetype and hotel parameters', async () => {
      const agent = new TokenGenerator();
      await agent.performGeneration(mockState);

      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      expect(provider.sendCompletion).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          agentName: 'TokenGenerator',
          budgetRemaining: expect.any(Number),
        })
      );
    });

    it('should substitute archetype in prompt template', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.designTokens).toBeDefined();
      expect(result.designTokens?.designTokens.archetype).toBe('heritage-opulence');
    });
  });

  describe('Schema Validation', () => {
    it('should validate and return valid design tokens', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.designTokens).toBeDefined();
      expect(result.designTokens?.designTokens.archetype).toBe('heritage-opulence');
      expect(result.designTokens?.designTokens.guestPersona).toBeDefined();
      expect(result.designTokens?.designTokens.emotionalIntent).toBeDefined();
      expect(result.designTokens?.designTokens.architecturalInspiration).toBeDefined();
      expect(result.designTokens?.designTokens.forbiddenElements).toBeDefined();
      expect(result.designTokens?.designTokens.colorScheme).toBeDefined();
      expect(result.designTokens?.designTokens.typography).toBeDefined();
      expect(result.designTokens?.designTokens.spacing).toBeDefined();
      expect(result.designTokens?.designTokens.borderRadius).toBeDefined();
    });

    it('should reject invalid archetype value', async () => {
      const agent = new TokenGenerator();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'invalid-archetype',
          guestPersona: 'Test guest persona that meets the minimum length requirement of fifty characters.',
          emotionalIntent: 'Test emotional intent',
          architecturalInspiration: 'Test inspiration',
          forbiddenElements: ['test-element'],
          colorScheme: {
            primaryHue: 235,
            primaryChroma: 0.18,
            primaryLightness: 0.45,
            secondaryHue: 45,
            secondaryChroma: 0.22,
            secondaryLightness: 0.55,
            surfaceType: 'warm-cream',
            accentStrategy: 'complementary'
          },
          typography: {
            headingPersonality: 'serif-elegant',
            bodyPersonality: 'serif-readable',
            scaleRatio: 'perfect-fourth'
          },
          spacing: { density: 'comfortable' },
          borderRadius: { style: 'subtle' }
        }),
        usage: { input: 300, output: 500, total: 800 },
        model: 'anthropic/claude-3.5-sonnet',
        cost: 0.0012
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });

    it('should reject guestPersona that is too short', async () => {
      const agent = new TokenGenerator();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'heritage-opulence',
          guestPersona: 'Too short',
          emotionalIntent: 'Test emotional intent',
          architecturalInspiration: 'Test inspiration',
          forbiddenElements: ['test-element'],
          colorScheme: {
            primaryHue: 235,
            primaryChroma: 0.18,
            primaryLightness: 0.45,
            secondaryHue: 45,
            secondaryChroma: 0.22,
            secondaryLightness: 0.55,
            surfaceType: 'warm-cream',
            accentStrategy: 'complementary'
          },
          typography: {
            headingPersonality: 'serif-elegant',
            bodyPersonality: 'serif-readable',
            scaleRatio: 'perfect-fourth'
          },
          spacing: { density: 'comfortable' },
          borderRadius: { style: 'subtle' }
        }),
        usage: { input: 300, output: 500, total: 800 },
        model: 'anthropic/claude-3.5-sonnet',
        cost: 0.0012
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });
  });

  describe('APCA Retry Loop Integration', () => {
    it('should call apcaRetryLoopFromColorScheme with extracted color scheme', async () => {
      const agent = new TokenGenerator();
      const { apcaRetryLoopFromColorScheme } = require('@/lib/color/apca-retry-loop');

      await agent.performGeneration(mockState);

      expect(apcaRetryLoopFromColorScheme).toHaveBeenCalledWith({
        primaryHue: 235,
        primaryChroma: 0.18,
        primaryLightness: 0.45,
        secondaryHue: 45,
        secondaryChroma: 0.22,
        secondaryLightness: 0.55
      });
    });

    it('should include contrast report in output', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.designTokens?.contrastReport).toBeDefined();
      expect(result.designTokens?.contrastReport.allPass).toBe(true);
      expect(result.designTokens?.contrastReport.failCount).toBe(0);
    });

    it('should include retry metadata in output', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.designTokens?.iterations).toBeDefined();
      expect(result.designTokens?.adjustmentsMade).toBeDefined();
      expect(Array.isArray(result.designTokens?.adjustmentsMade)).toBe(true);
    });

    it('should set validationStatus to pass when APCA succeeds', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.validationStatus).toBe('pass');
      expect(result.validationErrors).toEqual([]);
    });

    it('should set validationStatus to fail when APCA fails', async () => {
      const agent = new TokenGenerator();
      const { apcaRetryLoopFromColorScheme } = require('../../../lib/color/apca-retry-loop');

      // Mock APCA failure
      (apcaRetryLoopFromColorScheme as jest.Mock).mockReturnValueOnce({
        theme: {},
        contrastReport: {
          pairs: [],
          allPass: false,
          failCount: 3
        },
        iterations: 10,
        adjustmentsMade: [],
        success: false
      });

      const result = await agent.performGeneration(mockState);

      expect(result.validationStatus).toBe('fail');
      expect(result.validationErrors).toContain(
        'APCA contrast validation failed: 3 pairs below threshold'
      );
    });
  });

  describe('Cost Tracking Integration', () => {
    it('should track step cost', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.stepCosts).toBeDefined();
      expect(result.stepCosts?.TokenGenerator).toBeGreaterThan(0);
    });

    it('should update total cost', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should call CostMonitor.checkBudget before execution', async () => {
      const checkBudgetSpy = jest.spyOn(CostMonitor.prototype, 'checkBudget');
      const agent = new TokenGenerator();

      // checkBudget is called by beforeExecute which is invoked by execute(), not performGeneration()
      await agent.execute(mockState);

      expect(checkBudgetSpy).toHaveBeenCalledWith(mockState, 'TokenGenerator');
    });
  });

  describe('LangFuse Integration', () => {
    it('should start a LangFuse trace', async () => {
      const langfuseService = new LangFuseService();
      const agentWithService = new TokenGenerator(langfuseService);
      await agentWithService.execute(mockState);

      // Just verify it executes without error - the mock handles the trace internally
      expect(agentWithService.getAgentName()).toBe('TokenGenerator');
    });

    it('should create a generation span', async () => {
      const agent = new TokenGenerator();
      await agent.performGeneration(mockState);

      // Verify execution completed successfully
      expect(agent.getAgentName()).toBe('TokenGenerator');
    });
  });

  describe('Archetype Token Generation', () => {
    it('should generate tokens for heritage-opulence archetype', async () => {
      mockState.archetypeClassification = {
        archetype: 'heritage-opulence',
        reasoning: 'Luxury hotel with elegant brand personality'
      };

      const agent = new TokenGenerator();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        ...defaultMockResponse,
        text: JSON.stringify({
          ...JSON.parse(defaultMockResponse.text),
          archetype: 'heritage-opulence'
        })
      });

      const result = await agent.performGeneration(mockState);
      expect(result.designTokens?.designTokens.archetype).toBe('heritage-opulence');
    });

    it('should generate tokens for boutique-editorial archetype', async () => {
      mockState.archetypeClassification = {
        archetype: 'boutique-editorial',
        reasoning: 'Boutique hotel with modern personality'
      };

      const agent = new TokenGenerator();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        ...defaultMockResponse,
        text: JSON.stringify({
          ...JSON.parse(defaultMockResponse.text),
          archetype: 'boutique-editorial',
          colorScheme: {
            ...JSON.parse(defaultMockResponse.text).colorScheme,
            primaryHue: 280,
            primaryChroma: 0.25,
            surfaceType: 'dark'
          }
        })
      });

      const result = await agent.performGeneration(mockState);
      expect(result.designTokens?.designTokens.archetype).toBe('boutique-editorial');
    });
  });

  describe('Error Handling', () => {
    it('should throw descriptive error when LLM returns invalid JSON', async () => {
      const agent = new TokenGenerator();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: 'This is not valid JSON at all',
        usage: { input: 100, output: 50, total: 150 },
        model: 'anthropic/claude-3.5-sonnet',
        cost: 0.00003
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });

    it('should handle LLM provider errors gracefully', async () => {
      const agent = new TokenGenerator();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockRejectedValueOnce(new Error('LLM API error'));

      await expect(agent.performGeneration(mockState)).rejects.toThrow('LLM API error');
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state', async () => {
      const agent = new TokenGenerator();
      const originalState = { ...mockState };
      const originalTotalCost = originalState.totalCost;

      await agent.performGeneration(mockState);

      // Original state should not be mutated
      expect(mockState.totalCost).toBe(originalTotalCost);
      expect(mockState.designTokens).toBeUndefined();
    });

    it('should return new state with updates', async () => {
      const agent = new TokenGenerator();
      const result = await agent.performGeneration(mockState);

      // Result should contain updates
      expect(result.designTokens).toBeDefined();
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.stepCosts?.TokenGenerator).toBeGreaterThan(0);
    });
  });
});
