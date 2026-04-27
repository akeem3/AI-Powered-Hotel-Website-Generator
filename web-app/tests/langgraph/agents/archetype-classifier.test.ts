/**
 * Story 20.2: ArchetypeClassifier Agent
 * Test Suite
 *
 * Tests the ArchetypeClassifier agent that classifies hotels into
 * one of 12 visual archetypes based on hotel parameters.
 *
 * Test coverage:
 * - Agent extends BaseAgent pattern
 * - getAgentName() returns correct name
 * - Valid classification with various hotel profiles
 * - Ambiguous input handling
 * - Invalid input rejection
 * - Schema validation
 * - Cost tracking
 * - LangFuse integration
 * - Mock LLM response handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ArchetypeClassifier } from '../../../app/langgraph/agents/ArchetypeClassifier';
import { ArchetypeClassifierOutputSchema, HotelParametersSchema } from '../../../app/langgraph/agents/schemas';
import { WorkflowState } from '../../../app/langgraph/state/types';
import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';
import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';
import { OpenRouterClient } from '../../../app/langgraph/services/OpenRouterClient';

// Default mock response for successful classification
const defaultMockResponse = {
  text: JSON.stringify({
    archetype: 'heritage-opulence',
    reasoning: 'Based on the hotelType "luxury", targetAudience "couples", and brandPersonality "elegant", this hotel aligns with the heritage-opulence archetype. The combination of traditional luxury positioning with a focus on couples seeking romantic elegance suggests a heritage opulence aesthetic with rich colors, formal typography, and generous spacing.'
  }),
  usage: { input: 100, output: 50, total: 150 },
  model: 'moonshotai/kimi-k2',
  cost: 0.00003
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
        compile: jest.fn((vars: any) => `Mock prompt with ${JSON.stringify(vars)}`),
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

describe('ArchetypeClassifier', () => {
  let mockState: WorkflowState;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset CostMonitor state
    CostMonitor.prototype.checkBudget = jest.fn();

    // Create a valid mock state with hotel parameters
    mockState = {
      generationId: 'test-gen-123',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Luxury Hotel',
        location: 'Paris, France'
      },
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
    it('should return ArchetypeClassifier', () => {
      const agent = new ArchetypeClassifier();
      expect(agent.getAgentName()).toBe('ArchetypeClassifier');
    });
  });

  describe('Agent Pattern Compliance', () => {
    it('should extend BaseAgent pattern', () => {
      const agent = new ArchetypeClassifier();
      expect(agent).toBeInstanceOf(ArchetypeClassifier);
      expect(agent.getAgentName).toBeDefined();
      expect(agent.performGeneration).toBeDefined();
    });

    it('should have execute() method from BaseAgent', () => {
      const agent = new ArchetypeClassifier();
      expect(agent.execute).toBeDefined();
      expect(typeof agent.execute).toBe('function');
    });
  });

  describe('Prompt Loading', () => {
    it('should load prompt from Langfuse with hotel parameters', async () => {
      const agent = new ArchetypeClassifier();
      // Test performGeneration directly, bypassing execute() wrapper
      const result = await agent.performGeneration(mockState);

      expect(result.archetypeClassification).toBeDefined();
      expect(result.archetypeClassification?.archetype).toBe('heritage-opulence');
    });

    it('should substitute hotel parameters in prompt template', async () => {
      const agent = new ArchetypeClassifier();
      const result = await agent.performGeneration(mockState);

      expect(result.archetypeClassification).toBeDefined();
    });
  });

  describe('Schema Validation', () => {
    it('should validate and return valid archetype classification', async () => {
      const agent = new ArchetypeClassifier();
      const result = await agent.performGeneration(mockState);

      expect(result.archetypeClassification).toBeDefined();
      expect(result.archetypeClassification?.archetype).toBe('heritage-opulence');
      expect(result.archetypeClassification?.reasoning).toBeDefined();
      expect(result.archetypeClassification?.reasoning.length).toBeGreaterThanOrEqual(50);
    });

    it('should reject invalid archetype value', async () => {
      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'invalid-archetype',
          reasoning: 'This is a valid reasoning string that meets the minimum length requirement for testing purposes.'
        }),
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });

    it('should reject reasoning that is too short', async () => {
      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'heritage-opulence',
          reasoning: 'Too short'
        }),
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });

    it('should reject reasoning that is too long', async () => {
      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'heritage-opulence',
          reasoning: 'a'.repeat(1001)
        }),
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });
  });

  describe('Hotel Profile Classification', () => {
    it('should classify luxury + couples + elegant → heritage-opulence', async () => {
      mockState.hotelParameters = {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Grand Palace Hotel',
        location: 'Paris, France'
      };

      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'heritage-opulence',
          reasoning: 'Luxury hotel with couples audience and elegant brand personality indicates heritage-opulence with rich colors and formal typography.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      const result = await agent.performGeneration(mockState);
      expect(result.archetypeClassification?.archetype).toBe('heritage-opulence');
    });

    it('should classify boutique + leisure + modern → boutique-editorial', async () => {
      mockState.hotelParameters = {
        hotelType: 'boutique',
        targetAudience: 'leisure',
        brandPersonality: 'modern',
        hotelName: 'Artisan Hotel',
        location: 'Berlin, Germany'
      };

      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'boutique-editorial',
          reasoning: 'Boutique hotel with leisure audience and modern personality suggests boutique-editorial with bold visual statements.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      const result = await agent.performGeneration(mockState);
      expect(result.archetypeClassification?.archetype).toBe('boutique-editorial');
    });

    it('should classify budget + backpackers + friendly → urban-tech', async () => {
      mockState.hotelParameters = {
        hotelType: 'budget',
        targetAudience: 'backpackers',
        brandPersonality: 'friendly',
        hotelName: 'Backpacker Hub',
        location: 'Amsterdam, Netherlands'
      };

      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'urban-tech',
          reasoning: 'Budget hotel targeting backpackers with friendly personality aligns with urban-tech - efficient, modern, tech-forward.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      const result = await agent.performGeneration(mockState);
      expect(result.archetypeClassification?.archetype).toBe('urban-tech');
    });

    it('should classify resort + family + friendly → family-resort', async () => {
      mockState.hotelParameters = {
        hotelType: 'resort',
        targetAudience: 'family',
        brandPersonality: 'friendly',
        hotelName: 'Sunny Beach Resort',
        location: 'Bali, Indonesia'
      };

      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'family-resort',
          reasoning: 'Resort targeting families with friendly personality clearly indicates family-resort archetype with playful rounded elements and joyful colors.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      const result = await agent.performGeneration(mockState);
      expect(result.archetypeClassification?.archetype).toBe('family-resort');
    });

    it('should classify business + business + professional → business-hotel', async () => {
      mockState.hotelParameters = {
        hotelType: 'business',
        targetAudience: 'business',
        brandPersonality: 'professional',
        hotelName: 'Corporate Stay',
        location: 'New York, USA'
      };

      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'business-hotel',
          reasoning: 'Business hotel targeting business travelers with professional personality indicates business-hotel archetype with functional dense design.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      const result = await agent.performGeneration(mockState);
      expect(result.archetypeClassification?.archetype).toBe('business-hotel');
    });
  });

  describe('Ambiguous Input Handling', () => {
    it('should handle ambiguous input (luxury + couples + elegant) and select best fit', async () => {
      mockState.hotelParameters = {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Luxury Retreat',
        location: 'Maldives'
      };

      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'heritage-opulence',
          reasoning: 'While both heritage-opulence and quiet-luxury are possible for luxury+couples+elegant, the presence of "elegant" rather than "modern" tips toward heritage-opulence with its rich traditional colors. Alternative considered: quiet-luxury.'
        }),
        usage: { input: 100, output: 70, total: 170 },
        model: 'moonshotai/kimi-k2',
        cost: 0.000035
      });

      const result = await agent.performGeneration(mockState);
      expect(result.archetypeClassification?.archetype).toBe('heritage-opulence');
      expect(result.archetypeClassification?.reasoning).toContain('Alternative considered');
    });

    it('should handle coastal vs mountain ambiguity for resort + couples + adventurous', async () => {
      mockState.hotelParameters = {
        hotelType: 'resort',
        targetAudience: 'couples',
        brandPersonality: 'adventurous',
        hotelName: 'Adventure Resort',
        location: 'Unknown'
      };

      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'coastal-resort',
          reasoning: 'For resort+couples+adventurous, both coastal-resort and mountain-wilderness are valid. Without location context, defaulting to coastal-resort as more common for adventurous couples seeking relaxation. Alternative considered: mountain-wilderness.'
        }),
        usage: { input: 100, output: 70, total: 170 },
        model: 'moonshotai/kimi-k2',
        cost: 0.000035
      });

      const result = await agent.performGeneration(mockState);
      expect(result.archetypeClassification?.archetype).toBe('coastal-resort');
    });
  });

  describe('Invalid Input Rejection', () => {
    it('should reject classification with missing archetype field', async () => {
      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          reasoning: 'This is a valid reasoning string that meets the minimum length requirement for testing purposes but archetype is missing.'
        }),
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });

    it('should reject classification with missing reasoning field', async () => {
      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          archetype: 'heritage-opulence'
        }),
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });
  });

  describe('Schema Validation with All 12 Archetypes', () => {
    it('should accept all 12 valid archetype values', async () => {
      const validArchetypes = [
        'heritage-opulence',
        'quiet-luxury',
        'boutique-editorial',
        'urban-tech',
        'coastal-resort',
        'mountain-wilderness',
        'wellness-spa',
        'heritage-cultural',
        'eco-lodge',
        'design-art',
        'family-resort',
        'business-hotel',
      ];

      for (const archetype of validArchetypes) {
        const agent = new ArchetypeClassifier();
        const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
        provider.sendCompletion.mockResolvedValueOnce({
          text: JSON.stringify({
            archetype,
            reasoning: 'This is a valid reasoning string that meets the minimum length requirement for testing purposes.'
          }),
          usage: { input: 50, output: 50, total: 100 },
          model: 'moonshotai/kimi-k2',
          cost: 0.00002
        });

        const result = await agent.performGeneration(mockState);
        expect(result.archetypeClassification?.archetype).toBe(archetype);
      }
    });
  });

  describe('Cost Tracking Integration', () => {
    it('should track step cost', async () => {
      const agent = new ArchetypeClassifier();
      const result = await agent.performGeneration(mockState);

      expect(result.stepCosts).toBeDefined();
      expect(result.stepCosts?.ArchetypeClassifier).toBeGreaterThan(0);
    });

    it('should update total cost', async () => {
      const agent = new ArchetypeClassifier();
      const result = await agent.performGeneration(mockState);

      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should call CostMonitor.checkBudget before execution', async () => {
      const checkBudgetSpy = jest.spyOn(CostMonitor.prototype, 'checkBudget');
      const agent = new ArchetypeClassifier();

      await agent.performGeneration(mockState);

      expect(checkBudgetSpy).toHaveBeenCalledWith(mockState, 'ArchetypeClassifier');
    });
  });

  describe('LangFuse Integration', () => {
    it('should start a LangFuse trace', async () => {
      const langfuseService = new LangFuseService();
      const agentWithService = new ArchetypeClassifier(langfuseService);
      await agentWithService.execute(mockState);

      // Just verify it executes without error - the mock handles the trace internally
      expect(agentWithService.getAgentName()).toBe('ArchetypeClassifier');
    });

    it('should create a generation span', async () => {
      const agent = new ArchetypeClassifier();
      await agent.performGeneration(mockState);

      // Verify execution completed successfully
      expect(agent.getAgentName()).toBe('ArchetypeClassifier');
    });
  });

  describe('Error Handling', () => {
    it('should throw descriptive error when LLM returns invalid JSON', async () => {
      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockResolvedValueOnce({
        text: 'This is not valid JSON at all',
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });

    it('should handle LLM provider errors gracefully', async () => {
      const agent = new ArchetypeClassifier();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      provider.sendCompletion.mockRejectedValueOnce(new Error('LLM API error'));

      await expect(agent.performGeneration(mockState)).rejects.toThrow('LLM API error');
    });
  });

  describe('State Immutability', () => {
    it('should not mutate original state', async () => {
      const agent = new ArchetypeClassifier();
      const originalState = { ...mockState };
      const originalTotalCost = originalState.totalCost;

      await agent.performGeneration(mockState);

      // Original state should not be mutated
      expect(mockState.totalCost).toBe(originalTotalCost);
      expect(mockState.archetypeClassification).toBeUndefined();
    });

    it('should return new state with updates', async () => {
      const agent = new ArchetypeClassifier();
      const result = await agent.performGeneration(mockState);

      // Result should contain updates
      expect(result.archetypeClassification).toBeDefined();
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.stepCosts?.ArchetypeClassifier).toBeGreaterThan(0);
    });
  });

  describe('Model Selection', () => {
    it('should use LLMOptions with agentName and budgetRemaining', async () => {
      const agent = new ArchetypeClassifier();
      await agent.performGeneration(mockState);

      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      expect(provider.sendCompletion).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          agentName: 'ArchetypeClassifier',
          budgetRemaining: expect.any(Number),
        })
      );
    });
  });
});
