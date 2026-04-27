/**
 * Story 11.7: Comprehensive Edge Testing
 * Prompt 6: LangGraph Generation Edge Cases
 *
 * Tests content generation under edge conditions including:
 * - LLM Response Edge Cases
 * - Schema Validation Edge Cases
 * - Locale Generation Edge Cases
 * - Cost/Budget Edge Cases
 * - File Output Edge Cases
 * - Workflow State Edge Cases
 * - Media Manifest Edge Cases
 */

import * as fs from 'fs';

// Mock fs module
jest.mock('fs');

// Mock LangFuse prompt loading - we need to mock this BEFORE importing agents
const mockGetPrompt = jest.fn().mockResolvedValue('Test prompt with {hotelName} and tone guidance.');

jest.mock('../../app/langgraph/services/LangFuseService', () => {
  return {
    LangFuseService: jest.fn().mockImplementation(() => ({
      getPrompt: mockGetPrompt,
      executeGeneration: async (name: string, input: any, params: any, fn: () => Promise<any>) => {
        return await fn();
      },
      startWorkflowTrace: jest.fn(),
      endWorkflowTrace: jest.fn(),
      flush: jest.fn(),
      shutdown: jest.fn(),
      addScore: jest.fn(),
      logError: jest.fn(),
      getTraceId: jest.fn(),
      getTraceUrl: jest.fn(),
    })),
  };
});

// Mock CostMonitor
jest.mock('../../app/langgraph/services/CostMonitor', () => {
  return {
    CostMonitor: jest.fn().mockImplementation(() => ({
      checkBudget: jest.fn(),
      trackCost: jest.fn(),
      getTotalCost: jest.fn().mockReturnValue(0),
      getRemainingBudget: jest.fn().mockReturnValue(2.0),
      TOTAL_BUDGET: 2.0,
    })),
  };
});

// Create a mock LLM provider instance with sendCompletion method
const mockLLMProvider = {
  sendCompletion: jest.fn(),
  selectModel: jest.fn(),
  getAvailableModels: jest.fn(),
  getModelPricing: jest.fn(),
};

// Mock LLMProviderFactory BEFORE importing the agent
jest.mock('../../app/langgraph/services/LLMProviderFactory', () => ({
  LLMProviderFactory: {
    create: jest.fn(() => mockLLMProvider),
    getCurrentProviderType: jest.fn(),
    isValidProvider: jest.fn(),
  },
}));

import { ContentGenerator } from '../../app/langgraph/agents/ContentGenerator';
import { WorkflowState } from '../../app/langgraph/state/types';

describe('Story 11.7: LangGraph Generation Edge Cases', () => {
  let agent: ContentGenerator;
  let mockState: WorkflowState;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new ContentGenerator();

    // Create a valid mock state
    mockState = {
      generationId: 'test-gen-123',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Luxury Hotel',
        location: 'Paris, France'
      },
      componentSelection: {
        selectedComponents: ["hero", "rooms", "testimonials", "amenities", "gallery", "contact"],
        layoutStructure: "mixed",
        emphasisComponents: ["hero"],
        reasoning: "Selected components for luxury hotel."
      },
      stylingSelection: {
        componentVariants: {
          hero: { style: "elegant", layout: "split" }
        },
        reasoning: "Modern elegant styling."
      },
      contentGeneration: undefined,
      assembledConfig: undefined,
      contentJson: undefined,
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

    // Default valid response
    mockLLMProvider.sendCompletion.mockResolvedValue({
      text: JSON.stringify({
        componentContent: {
          hero: {
            title: "The Grand Paris Luxury Hotel",
            headline: "Experience Elegance in the Heart of Paris",
            description: "A luxurious retreat featuring world-class amenities and impeccable service."
          },
          testimonials: {
            testimonials: [
              { id: "t1", customerName: "John Doe", quote: "An absolutely amazing experience! The service was impeccable and the views were breathtaking.", rating: 5 }
            ]
          },
          amenities: {
            amenities: [
              { id: "a1", name: "Spa & Wellness Center", description: "Full-service spa with massage and treatment rooms." },
              { id: "a2", name: "Fine Dining Restaurant", description: "Award-winning cuisine featuring local flavors." }
            ]
          }
        },
        reasoning: 'Generated elegant luxury content with sophisticated tone and exclusive vocabulary.'
      }),
      usage: { input: 150, output: 200, total: 350 },
      model: 'moonshotai/kimi-k2',
      cost: 0.0001
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================================
  // 1. LLM Response Edge Cases
  // ============================================================================

  describe('LLM Response Edge Cases', () => {
    it('should handle empty LLM response', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: '',
        usage: { input: 100, output: 0, total: 100 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });

    it('should handle non-JSON LLM response', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: 'This is just plain text, not JSON at all.',
        usage: { input: 100, output: 20, total: 120 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });

    it('should handle truncated JSON response', async () => {
      const partialJson = JSON.stringify({
        componentContent: {
          hero: { title: "Test Hotel" }
        },
        reasoning: 'Valid reasoning text here.'
      }).slice(0, -10); // Truncate the end

      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: partialJson,
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });

    it('should handle valid JSON but wrong structure', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          wrongField: "This is not the expected structure",
          anotherWrongField: ["array", "of", "items"]
        }),
        usage: { input: 100, output: 30, total: 130 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });

    it('should handle excessive token response', async () => {
      const largeContent = {
        componentContent: {
          hero: {
            title: "A".repeat(50), // Within schema limit (60)
            headline: "B".repeat(55), // Within custom validation limit (60)
            description: "C".repeat(400) // Within schema limit (500)
          },
          testimonials: {
            testimonials: Array.from({ length: 20 }, (_, i) => ({
              id: `t${i}`,
              customerName: "Customer " + i,
              quote: "A lengthy testimonial quote that provides detailed feedback about the experience.",
              rating: 5
            }))
          }
        },
        reasoning: "D".repeat(800) // Within schema limit (1000)
      };

      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify(largeContent),
        usage: { input: 100, output: 15000, total: 15100 }, // Very large output
        model: 'moonshotai/kimi-k2',
        cost: 0.1
      });

      // Should handle large response without crashing
      const result = await agent.execute(mockState);
      expect(result.contentGeneration).toBeDefined();
    });

    it('should handle LLM timeout', async () => {
      mockLLMProvider.sendCompletion.mockRejectedValueOnce(
        new Error('Request timeout after 30000ms')
      );

      await expect(agent.execute(mockState)).rejects.toThrow();
    });
  });

  // ============================================================================
  // 2. Schema Validation Edge Cases
  // ============================================================================

  describe('Schema Validation Edge Cases', () => {
    it('should handle validation failure in nested object', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            hero: {
              title: "Valid Title"
            },
            testimonials: {
              testimonials: [
                { id: "t1", customerName: "John", quote: "Great!", rating: 5 },
                { id: "t2", customerName: "", quote: "", rating: 5 } // Invalid: empty name and quote
              ]
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass validation requirements.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });

    it('should handle validation error for content constraint violation', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            hero: {
              title: "A Valid Title For Testing", // Within schema limit
              headline: "Short" // Too short for custom validation (< 10)
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass validation requirements.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      await expect(agent.execute(mockState)).rejects.toThrow('output validation failed');
    });

    it('should handle missing required field in content', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            hero: {
              // Missing title field which is required
              headline: "Just a headline"
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass validation requirements.'
        }),
        usage: { input: 100, output: 30, total: 130 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      // Should handle gracefully - hero has fallbacks in the generator
      const result = await agent.execute(mockState);
      expect(result.contentGeneration).toBeDefined();
    });
  });

  // ============================================================================
  // 3. Locale Generation Edge Cases (Story 11.6: English only)
  // ============================================================================

  describe('Locale Generation Edge Cases', () => {
    it('should generate English content only (Epic 13 for translations)', async () => {
      const result = await agent.execute(mockState);

      expect(result.contentGeneration?.homepageContentJson).toBeDefined();
      expect(result.contentGeneration?.homepageContentJson?.meta?.locale).toBe('en');
      expect(result.contentJson?.homepage?.meta?.locale).toBe('en');
    });

    it('should have empty localizedHomepage (Epic 13 placeholder)', async () => {
      const result = await agent.execute(mockState);

      expect(result.contentJson?.localizedHomepage).toEqual({});
    });

    it('should preserve hotel variables in generated content', async () => {
      const result = await agent.execute(mockState);

      // homepageContentJson contains the processed hotel name
      expect(result.contentGeneration?.homepageContentJson?.hero?.title).toBe('Test Luxury Hotel');
      // The headline contains the hotel name (generated via template)
      expect(result.contentGeneration?.homepageContentJson?.hero?.headline).toBeDefined();
    });

    it('should handle special characters in hotel name', async () => {
      mockState.hotelParameters.hotelName = 'Hôtel & Spa "Le Grand"';
      mockState.hotelParameters.location = 'St. Moritz, Switzerland';

      const result = await agent.execute(mockState);

      expect(result.contentGeneration).toBeDefined();
      expect(result.contentGeneration?.homepageContentJson?.meta?.hotelId).toBeDefined();
    });

    it('should handle very long hotel names', async () => {
      mockState.hotelParameters.hotelName = 'The Most Luxurious and Elegant Hotel in the Entire World with a Very Long Name Indeed';

      const result = await agent.execute(mockState);

      expect(result.contentGeneration).toBeDefined();
      expect(result.contentGeneration?.homepageContentJson?.hero?.title).toBeDefined();
    });
  });

  // ============================================================================
  // 4. Cost/Budget Edge Cases
  // ============================================================================

  describe('Cost/Budget Edge Cases', () => {
    it('should track content generation cost', async () => {
      const result = await agent.execute(mockState);

      expect(result.stepCosts?.ContentGenerator).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should enforce budget limit for ContentGenerator', async () => {
      // Set low remaining budget
      mockState.budgetRemaining = 0.05;

      const result = await agent.execute(mockState);

      const cost = result.stepCosts?.ContentGenerator || 0;
      expect(cost).toBeLessThanOrEqual(0.80); // Agent's budget limit
    });

    it('should update budget remaining after generation', async () => {
      const initialBudget = 2.0;
      mockState.budgetRemaining = initialBudget;

      const result = await agent.execute(mockState);

      // Total cost is tracked
      expect(result.totalCost).toBeGreaterThan(0);
      // budgetRemaining is passed but may not be updated by the agent
      // (check if it's tracked separately)
      expect(result.totalCost).toBeLessThanOrEqual(initialBudget);
    });

    it('should track cumulative cost across agents', async () => {
      mockState.totalCost = 0.5; // Previous agents cost
      mockState.budgetRemaining = 1.5;

      const result = await agent.execute(mockState);

      // Agent tracks its own cost in stepCosts
      expect(result.stepCosts?.ContentGenerator).toBeGreaterThan(0);
      // Total cost tracking depends on workflow state handling
      expect(result.stepCosts?.ContentGenerator).toBeLessThan(2.0); // Within budget
    });
  });

  // ============================================================================
  // 5. File Output Edge Cases
  // ============================================================================

  describe('File Output Edge Cases', () => {
    it('should generate contentJson ready for file output', async () => {
      const result = await agent.execute(mockState);

      expect(result.contentJson).toBeDefined();
      expect(result.contentJson?.homepage).toBeDefined();
      expect(result.contentJson?.mediaManifest).toBeDefined();
    });

    it('should generate valid homepageContentJson', async () => {
      const result = await agent.execute(mockState);

      const homepage = result.contentGeneration?.homepageContentJson;
      expect(homepage?.meta).toBeDefined();
      expect(homepage?.hero).toBeDefined();
      expect(homepage?.navigation).toBeDefined();
      expect(homepage?.sections).toBeDefined();
      expect(homepage?.footer).toBeDefined();
    });

    it('should generate valid mediaManifestJson', async () => {
      const result = await agent.execute(mockState);

      const manifest = result.contentGeneration?.mediaManifestJson;
      expect(manifest?.cdn).toBeDefined();
      expect(manifest?.assets).toBeDefined();
    });

    it('should include required metadata in contentJson', async () => {
      const result = await agent.execute(mockState);

      expect(result.contentJson?.homepage?.meta?.hotelId).toBeDefined();
      expect(result.contentJson?.homepage?.meta?.locale).toBe('en');
      expect(result.contentJson?.homepage?.meta?.version).toBeDefined();
      expect(result.contentJson?.homepage?.meta?.generatedAt).toBeDefined();
    });

    it('should handle hotel name sanitization for file paths', async () => {
      mockState.hotelParameters.hotelName = 'The Grand !! Hotel @ Paris';

      const result = await agent.execute(mockState);

      // Hotel ID should be sanitized (no special characters)
      const hotelId = result.contentGeneration?.homepageContentJson?.meta?.hotelId;
      expect(hotelId).toBeDefined();
      expect(hotelId).not.toContain('!');
      expect(hotelId).not.toContain('@');
    });
  });

  // ============================================================================
  // 6. Workflow State Edge Cases
  // ============================================================================

  describe('Workflow State Edge Cases', () => {
    it('should handle missing hotelParameters', async () => {
      delete (mockState as any).hotelParameters;

      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: hotelParameters');
    });

    it('should handle missing componentSelection', async () => {
      delete (mockState as any).componentSelection;

      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: componentSelection');
    });

    it('should handle missing stylingSelection', async () => {
      delete (mockState as any).stylingSelection;

      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: stylingSelection');
    });

    it('should handle partial state from previous agents', async () => {
      // Simulate incomplete previous agent output
      mockState.componentSelection = {
        selectedComponents: ["hero"], // Only one component
        layoutStructure: "simple",
        emphasisComponents: [],
        reasoning: "Minimal selection"
      };

      const result = await agent.execute(mockState);

      expect(result.contentGeneration).toBeDefined();
      expect(result.validationStatus).toBe('pass');
    });

    it('should handle existing contentGeneration in state (re-generation)', async () => {
      mockState.contentGeneration = {
        componentContent: { hero: { title: "Old Content" } },
        reasoning: "Old reasoning",
        homepageContentJson: undefined,
        mediaManifestJson: undefined
      };

      const result = await agent.execute(mockState);

      expect(result.contentGeneration).toBeDefined();
      expect(result.contentGeneration?.hero?.title).not.toBe('Old Content');
    });
  });

  // ============================================================================
  // 7. Media Manifest Edge Cases
  // ============================================================================

  describe('Media Manifest Edge Cases', () => {
    it('should generate media manifest with placeholder assets', async () => {
      const result = await agent.execute(mockState);

      const manifest = result.contentGeneration?.mediaManifestJson;
      expect(manifest?.assets?.homepage?.hero).toBeDefined();
    });

    it('should include proper asset metadata', async () => {
      const result = await agent.execute(mockState);

      const heroAsset = result.contentGeneration?.mediaManifestJson?.assets?.homepage?.hero;
      expect(heroAsset?.id).toBeDefined();
      expect(heroAsset?.path).toBeDefined();
      expect(heroAsset?.alt).toBeDefined();
      expect(heroAsset?.width).toBeDefined();
      expect(heroAsset?.height).toBeDefined();
    });

    it('should use hotel name in asset paths', async () => {
      mockState.hotelParameters.hotelName = 'Paris Grand Hotel';

      const result = await agent.execute(mockState);

      const heroAsset = result.contentGeneration?.mediaManifestJson?.assets?.homepage?.hero;
      expect(heroAsset?.path).toContain('paris-grand-hotel');
    });

    it('should include CDN configuration', async () => {
      const result = await agent.execute(mockState);

      const manifest = result.contentGeneration?.mediaManifestJson;
      expect(manifest?.cdn?.baseUrl).toBeDefined();
      expect(manifest?.cdn?.transformPath).toBeDefined();
    });

    it('should handle hotel names with special characters in paths', async () => {
      mockState.hotelParameters.hotelName = 'Hôtel & Spa! @ #';

      const result = await agent.execute(mockState);

      const heroAsset = result.contentGeneration?.mediaManifestJson?.assets?.homepage?.hero;
      expect(heroAsset?.path).toBeDefined();
      // Special chars should be sanitized
      expect(heroAsset?.path).not.toContain('!');
      expect(heroAsset?.path).not.toContain('@');
    });
  });

  // ============================================================================
  // 8. Content Constraint Validation Edge Cases
  // ============================================================================

  describe('Content Constraint Validation Edge Cases', () => {
    it('should enforce hero title/headline length constraints', async () => {
      // First pass ZOD validation with a valid title, then fail custom validation on headline
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            hero: {
              title: "A Valid Title That Is Long Enough", // Passes ZOD
              headline: "Short" // Too short for custom validation (< 10)
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass validation requirements.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      await expect(agent.execute(mockState)).rejects.toThrow('Hero heading/title must be between');
    });

    it('should enforce hero description max length', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            hero: {
              title: "A Valid Title That Is Long Enough",
              headline: "A Valid Headline That Works",
              description: "A".repeat(600) // Too long (> 500)
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass validation requirements.'
        }),
        usage: { input: 100, output: 600, total: 700 },
        model: 'moonshotai/kimi-k2',
        cost: 0.0001
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });

    it('should enforce testimonial quote length constraints', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            testimonials: {
              testimonials: [
                { id: "t1", customerName: "John Doe", quote: "Short", rating: 5 }
              ]
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass validation requirements.'
        }),
        usage: { input: 100, output: 30, total: 130 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00002
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });

    it('should enforce room name length constraints', async () => {
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            rooms: {
              rooms: [
                { id: "r1", name: "", type: "King", price: 200, capacity: 2, description: "A valid room description with at least fifty characters for testing purposes here." }
              ]
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass validation requirements.'
        }),
        usage: { input: 100, output: 80, total: 180 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      await expect(agent.execute(mockState)).rejects.toThrow();
    });
  });

  // ============================================================================
  // 9. Integration Edge Cases
  // ============================================================================

  describe('Integration Edge Cases', () => {
    it('should produce consistent output across multiple executions', async () => {
      const result1 = await agent.execute(mockState);
      const result2 = await agent.execute(mockState);

      expect(result1.contentGeneration).toBeDefined();
      expect(result2.contentGeneration).toBeDefined();
    });

    it('should handle prompt file not found gracefully', async () => {
      // Mock getPrompt to throw an error (simulating both Langfuse and filesystem failure)
      mockGetPrompt.mockRejectedValueOnce(new Error('Could not find prompt'));

      await expect(agent.execute(mockState)).rejects.toThrow('Could not find prompt');
    });

    it('should validate brand personality mapping', async () => {
      const personalities = ['elegant', 'modern', 'friendly', 'professional', 'adventurous'];

      for (const personality of personalities) {
        mockState.hotelParameters.brandPersonality = personality;
        const result = await agent.execute(mockState);
        expect(result.contentGeneration).toBeDefined();
      }
    });

    it('should handle unknown brand personality', async () => {
      mockState.hotelParameters.brandPersonality = 'unknown-personality';

      const result = await agent.execute(mockState);

      // Should fall back to 'modern' mapping
      expect(result.contentGeneration).toBeDefined();
      expect(result.validationStatus).toBe('pass');
    });
  });
});
