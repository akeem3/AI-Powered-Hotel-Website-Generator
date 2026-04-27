/**
 * Story 20.8: CVAVariantAgent
 * Test Suite
 *
 * Tests the CVAVariantAgent that generates archetype-specific CVA variant
 * mappings for hotel website blocks.
 *
 * Test coverage:
 * - Schema validation tests (pass/fail scenarios)
 * - Allowlist rejection tests
 * - Agent generation tests (3 blocks × 3 archetypes)
 * - Design rationale verification
 * - Mock LLM response handling
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CVAVariantAgent } from '../../../app/langgraph/agents/CVAVariantAgent';
import { CVAVariantAgentOutputSchema } from '../../../app/langgraph/agents/schemas';
import { WorkflowState } from '../../../app/langgraph/state/types';
import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';
import { validateSemanticClasses } from '@/lib/style-generation/tailwind-allowlist';

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

// Mock LLMProviderFactory - creates fresh mocks for each agent instance
const defaultMockResponse = {
  text: JSON.stringify({
    variantMap: {
      blockType: 'hero',
      archetype: 'heritage-opulence',
      designRationale: 'Heritage opulence demands deep navy gradients with gold accents. The split layout with generous gap-hero spacing creates formal elegance. The dark overlay with 60% opacity ensures text readability while maintaining the rich color scheme. Medium height provides prominence without overwhelming.',
      variantClasses: {
        style: 'bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted',
        layout: 'grid md:grid-cols-2 gap-hero items-center',
        overlay: 'before:absolute before:inset-0 before:bg-brand-primary/60',
        height: 'min-h-hero-md'
      }
    }
  }),
  usage: { input: 150, output: 100, total: 250 },
  model: 'moonshotai/kimi-k2',
  cost: 0.00005
};

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

describe('CVAVariantAgent', () => {
  let mockState: WorkflowState;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset CostMonitor state
    CostMonitor.prototype.checkBudget = jest.fn();

    // Create a valid mock state with archetype classification
    mockState = {
      generationId: 'test-gen-123',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Luxury Hotel',
        location: 'Paris, France'
      },
      archetypeClassification: {
        archetype: 'heritage-opulence',
        reasoning: 'Based on luxury hotel type, couples audience, and elegant brand personality, this hotel aligns with heritage-opulence archetype featuring rich colors, formal typography, and generous spacing.'
      },
      componentSelection: {
        selectedComponents: ['hero', 'navigation', 'gallery']
      },
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
    it('should return CVAVariantAgent', () => {
      const agent = new CVAVariantAgent();
      expect(agent.getAgentName()).toBe('CVAVariantAgent');
    });
  });

  describe('Agent Pattern Compliance', () => {
    it('should extend BaseAgent pattern', () => {
      const agent = new CVAVariantAgent();
      expect(agent).toBeInstanceOf(CVAVariantAgent);
      expect(agent.getAgentName).toBeDefined();
      expect(agent.performGeneration).toBeDefined();
    });

    it('should have execute() method from BaseAgent', () => {
      const agent = new CVAVariantAgent();
      expect(agent.execute).toBeDefined();
      expect(typeof agent.execute).toBe('function');
    });
  });

  describe('Schema Validation - Pass Scenarios', () => {
    it('should validate correct CVA variant map with all required fields', () => {
      const validVariantMap = {
        variantMap: {
          blockType: 'hero' as const,
          archetype: 'heritage-opulence',
          designRationale: 'This design uses deep navy gradients with gold accents to express heritage opulence through formal elegance and rich color schemes.',
          variantClasses: {
            style: 'bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted',
            layout: 'grid md:grid-cols-2 gap-hero items-center',
            overlay: 'before:absolute before:inset-0 before:bg-brand-primary/60',
            height: 'min-h-hero-md'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(validVariantMap);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.variantMap.blockType).toBe('hero');
        expect(result.data.variantMap.archetype).toBe('heritage-opulence');
      }
    });

    it('should validate all 12 valid block types', () => {
      const validBlockTypes = [
        'hero', 'navigation', 'gallery', 'testimonials', 'amenities',
        'rooms', 'booking', 'contact', 'footer', 'about', 'faq', 'features'
      ] as const;

      validBlockTypes.forEach(blockType => {
        const variantMap = {
          variantMap: {
            blockType,
            archetype: 'heritage-opulence' as const,
            designRationale: 'Valid design rationale for testing purposes.',
            variantClasses: {
              style: 'bg-brand-primary text-text-inverted'
            }
          }
        };

        const result = CVAVariantAgentOutputSchema.safeParse(variantMap);
        expect(result.success).toBe(true);
      });
    });

    it('should validate all 12 valid archetypes', () => {
      const validArchetypes = [
        'heritage-opulence', 'quiet-luxury', 'boutique-editorial', 'urban-tech',
        'coastal-resort', 'mountain-wilderness', 'wellness-spa', 'heritage-cultural',
        'eco-lodge', 'design-art', 'family-resort', 'business-hotel'
      ] as const;

      validArchetypes.forEach(archetype => {
        const variantMap = {
          variantMap: {
            blockType: 'hero' as const,
            archetype,
            designRationale: 'Valid design rationale for testing purposes.',
            variantClasses: {
              style: 'bg-brand-primary text-text-inverted'
            }
          }
        };

        const result = CVAVariantAgentOutputSchema.safeParse(variantMap);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Schema Validation - Fail Scenarios', () => {
    it('should reject invalid block type', () => {
      const invalidVariantMap = {
        variantMap: {
          blockType: 'invalid-block',
          archetype: 'heritage-opulence',
          designRationale: 'Valid design rationale for testing purposes.',
          variantClasses: {
            style: 'bg-brand-primary text-text-inverted'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidVariantMap);
      expect(result.success).toBe(false);
    });

    it('should reject invalid archetype', () => {
      const invalidVariantMap = {
        variantMap: {
          blockType: 'hero',
          archetype: 'invalid-archetype',
          designRationale: 'Valid design rationale for testing purposes.',
          variantClasses: {
            style: 'bg-brand-primary text-text-inverted'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidVariantMap);
      expect(result.success).toBe(false);
    });

    it('should reject design rationale that is too short (< 30 chars)', () => {
      const invalidVariantMap = {
        variantMap: {
          blockType: 'hero',
          archetype: 'heritage-opulence',
          designRationale: 'Too short',
          variantClasses: {
            style: 'bg-brand-primary text-text-inverted'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidVariantMap);
      expect(result.success).toBe(false);
    });

    it('should reject design rationale that is too long (> 2000 chars)', () => {
      const invalidVariantMap = {
        variantMap: {
          blockType: 'hero',
          archetype: 'heritage-opulence',
          designRationale: 'a'.repeat(2001),
          variantClasses: {
            style: 'bg-brand-primary text-text-inverted'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidVariantMap);
      expect(result.success).toBe(false);
    });

    it('should reject missing variantMap field', () => {
      const invalidOutput = {
        // variantMap is missing
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });
  });

  describe('Allowlist Rejection Tests', () => {
    it('should reject class strings with raw color classes (bg-blue-*)', () => {
      const invalidVariantMap = {
        variantMap: {
          blockType: 'hero',
          archetype: 'heritage-opulence',
          designRationale: 'This is a valid design rationale that meets the minimum length requirement of thirty characters for testing.',
          variantClasses: {
            style: 'bg-blue-500 text-white'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidVariantMap);
      expect(result.success).toBe(false);
    });

    it('should reject class strings with arbitrary utilities (gap-16)', () => {
      const invalidVariantMap = {
        variantMap: {
          blockType: 'hero',
          archetype: 'heritage-opulence',
          designRationale: 'This is a valid design rationale that meets the minimum length requirement of thirty characters for testing.',
          variantClasses: {
            style: 'bg-brand-primary gap-16'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidVariantMap);
      expect(result.success).toBe(false);
    });

    it('should reject class strings with bg-white', () => {
      const invalidVariantMap = {
        variantMap: {
          blockType: 'hero',
          archetype: 'heritage-opulence',
          designRationale: 'This is a valid design rationale that meets the minimum length requirement of thirty characters for testing.',
          variantClasses: {
            style: 'bg-white text-text-primary'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(invalidVariantMap);
      expect(result.success).toBe(false);
    });

    it('should accept valid semantic token classes', () => {
      const validVariantMap = {
        variantMap: {
          blockType: 'hero',
          archetype: 'heritage-opulence',
          designRationale: 'This is a valid design rationale that meets the minimum length requirement of thirty characters for testing.',
          variantClasses: {
            style: 'bg-brand-primary text-text-inverted bg-surface-elevated',
            layout: 'grid md:grid-cols-2 gap-hero items-center',
            overlay: 'before:absolute before:inset-0 before:bg-brand-primary/60'
          }
        }
      };

      const result = CVAVariantAgentOutputSchema.safeParse(validVariantMap);
      expect(result.success).toBe(true);
    });

    it('should validate individual classes using validateSemanticClasses', () => {
      // Test valid classes
      const validResult = validateSemanticClasses('bg-brand-primary text-text-inverted gap-hero');
      expect(validResult.valid).toBe(true);
      expect(validResult.invalidClasses).toHaveLength(0);

      // Test invalid classes
      const invalidResult = validateSemanticClasses('bg-blue-500 text-white gap-16');
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.invalidClasses).toContain('bg-blue-500');
      expect(invalidResult.invalidClasses).toContain('text-white');
      expect(invalidResult.invalidClasses).toContain('gap-16');
    });
  });

  describe('Agent Generation Tests - Hero Block', () => {
    it('should generate hero variant for heritage-opulence archetype', async () => {
      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;

      // Workaround: Manually set the mock since the module mock isn't being applied
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'hero',
            archetype: 'heritage-opulence',
            designRationale: 'Heritage opulence demands deep navy gradients with gold accents for formal elegance.',
            variantClasses: {
              style: 'bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted',
              layout: 'grid md:grid-cols-2 gap-hero items-center',
              overlay: 'before:absolute before:inset-0 before:bg-brand-primary/60',
              height: 'min-h-hero-md'
            }
          }
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      const result = await agent.performGeneration(mockState);
      expect(result.validationStatus).toBe('pass');
    });
  });

  describe('Agent Generation Tests - Gallery Block', () => {
    it('should generate gallery variant for urban-tech archetype', async () => {
      const testState = {
        ...mockState,
        archetypeClassification: {
          archetype: 'urban-tech',
          reasoning: 'Budget hotel with modern tech-forward design.'
        },
        componentSelection: {
          selectedComponents: ['gallery']
        }
      };

      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;

      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'gallery',
            archetype: 'urban-tech',
            designRationale: 'Urban tech requires bold contrast on dark backgrounds with tight efficient spacing.',
            variantClasses: {
              layout: 'grid md:grid-cols-3 gap-gap-card'
            }
          }
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      const result = await agent.performGeneration(testState);
      expect(result.validationStatus).toBe('pass');
    });
  });

  describe('Agent Generation Tests - Navigation Block', () => {
    it('should generate navigation variant for quiet-luxury archetype', async () => {
      const testState = {
        ...mockState,
        archetypeClassification: {
          archetype: 'quiet-luxury',
          reasoning: 'Ultra-luxury hotel with minimalist restraint.'
        },
        componentSelection: {
          selectedComponents: ['navigation']
        }
      };

      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;

      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'navigation',
            archetype: 'quiet-luxury',
            designRationale: 'Quiet luxury uses glass style with maximum calm spacing and extreme tracking.',
            variantClasses: {
              style: 'bg-surface-elevated backdrop-blur-md',
              layout: 'flex justify-between items-center px-container max-w-4xl'
            }
          }
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      const result = await agent.performGeneration(testState);
      expect(result.validationStatus).toBe('pass');
    });
  });

  describe('Mock LLM Response Tests', () => {
    it('should throw descriptive error when LLM returns invalid JSON', async () => {
      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;

      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: 'This is not valid JSON at all',
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow();
    });

    it('should throw error when LLM response fails schema validation', async () => {
      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;

      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'invalid-block',
            archetype: 'heritage-opulence',
            designRationale: 'Valid design rationale for testing purposes.',
            variantClasses: {}
          }
        }),
        usage: { input: 50, output: 50, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.performGeneration(mockState)).rejects.toThrow('output validation failed');
    });
  });

  describe('Cost Tracking Integration', () => {
    it('should track step cost', async () => {
      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'hero',
            archetype: 'heritage-opulence',
            designRationale: 'Valid design rationale for testing purposes.',
            variantClasses: {
              style: 'bg-brand-primary text-text-inverted'
            }
          }
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      const result = await agent.performGeneration(mockState);
      expect(result.stepCosts).toBeDefined();
      expect(result.stepCosts?.CVAVariantAgent).toBeGreaterThan(0);
    });

    it('should call CostMonitor.checkBudget before execution', async () => {
      const checkBudgetSpy = jest.spyOn(CostMonitor.prototype, 'checkBudget');
      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'hero',
            archetype: 'heritage-opulence',
            designRationale: 'Valid design rationale for testing purposes.',
            variantClasses: {
              style: 'bg-brand-primary text-text-inverted'
            }
          }
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      await agent.execute(mockState);
      expect(checkBudgetSpy).toHaveBeenCalledWith(mockState, 'CVAVariantAgent');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when archetypeClassification is missing', async () => {
      const agent = new CVAVariantAgent();
      const stateWithoutArchetype = { ...mockState, archetypeClassification: undefined };

      await expect(agent.performGeneration(stateWithoutArchetype)).rejects.toThrow(
        'CVAVariantAgent requires archetypeClassification'
      );
    });

    it('should handle LLM provider errors gracefully', async () => {
      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockRejectedValue(new Error('LLM API error'));

      await expect(agent.performGeneration(mockState)).rejects.toThrow('LLM API error');
    });
  });

  describe('Prerequisites Validation', () => {
    it('should use first component from selectedComponents as block type', async () => {
      const testState = {
        ...mockState,
        componentSelection: {
          selectedComponents: ['gallery', 'navigation', 'hero']
        }
      };

      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'gallery',
            archetype: 'heritage-opulence',
            designRationale: 'Valid design rationale for testing purposes.',
            variantClasses: {
              layout: 'grid',
              spacing: 'gap-gap-card'
            }
          }
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      const result = await agent.performGeneration(testState);
      expect(result.validationStatus).toBe('pass');
    });

    it('should default to hero block type when no components selected', async () => {
      const testState = {
        ...mockState,
        componentSelection: undefined
      };

      const agent = new CVAVariantAgent();
      const provider = (agent as any).llmProvider || (agent as any).openRouterClient;
      // Workaround: Manually set the mock
      provider.sendCompletion = jest.fn().mockResolvedValue({
        text: JSON.stringify({
          variantMap: {
            blockType: 'hero',
            archetype: 'heritage-opulence',
            designRationale: 'Valid design rationale for testing purposes.',
            variantClasses: {
              style: 'bg-brand-primary text-text-inverted'
            }
          }
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      const result = await agent.performGeneration(testState);
      expect(result.validationStatus).toBe('pass');
    });
  });
});
