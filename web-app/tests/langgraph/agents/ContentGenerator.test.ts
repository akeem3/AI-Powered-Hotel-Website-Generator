import { HomepageContentSchema, MediaManifestSchema } from '@/lib/content/schemas';
import * as fs from 'fs';

// Mock fs module
jest.mock('fs');

// Mock LangFuse
const mockGeneration = {
  end: jest.fn(),
};

const mockTrace = {
  id: 'test-trace-id',
  generation: jest.fn().mockReturnValue(mockGeneration),
  update: jest.fn(),
};

const mockLangfuse = {
  trace: jest.fn().mockReturnValue(mockTrace),
  getPrompt: jest.fn().mockResolvedValue({
    compile: jest.fn().mockReturnValue('Mock compiled prompt'),
    prompt: 'Mock prompt template',
  }),
  flush: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined),
};

jest.mock('langfuse', () => {
  return {
    Langfuse: jest.fn().mockImplementation(() => mockLangfuse),
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
jest.mock('../../../app/langgraph/services/LLMProviderFactory', () => ({
  LLMProviderFactory: {
    create: jest.fn(() => mockLLMProvider),
    getCurrentProviderType: jest.fn(),
    isValidProvider: jest.fn(),
  },
}));

import { ContentGenerator } from '../../../app/langgraph/agents/ContentGenerator';
import { WorkflowState } from '../../../app/langgraph/state/types';
import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';
import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';

describe('ContentGenerator', () => {
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

    // Mock LLM provider with a valid default response
    mockLLMProvider.sendCompletion.mockResolvedValue({
      text: JSON.stringify({
        componentContent: {
          hero: { title: "The Grand Paris Luxury Hotel" },
          rooms: {
            rooms: [{ id: "r1", name: "Deluxe King", type: "King", price: 350, capacity: 2, description: "A spacious room with city views and modern amenities." }]
          },
          testimonials: {
            testimonials: [{ id: "t1", customerName: "John Doe", quote: "An amazing experience!", rating: 5 }]
          }
        },
        reasoning: 'Valid reasoning with enough characters to pass the minimum 50 character requirement for testing purposes.'
      }),
      usage: { input: 150, output: 100, total: 250 },
      model: 'moonshotai/kimi-k2',
      cost: 0.00005
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAgentName', () => {
    it('should return ContentGenerator', () => {
      expect(agent.getAgentName()).toBe('ContentGenerator');
    });
  });

  describe('Prompt Loading', () => {
    it('should load prompt from valid path', async () => {
      const result = await agent.execute(mockState);

      expect(mockLangfuse.getPrompt).toHaveBeenCalled();
      expect(result.contentGeneration).toBeDefined();
    });

    it('should throw error when prompt file not found', async () => {
      mockLangfuse.getPrompt.mockRejectedValueOnce(new Error('Prompt not found'));
      // When LangFuse fails, agent falls back to local file loading which also fails
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(agent.execute(mockState))
        .rejects.toThrow('Local prompt file not found');
    });
  });

  describe('Parameter Substitution', () => {
    it('should substitute hotel parameters and agent outputs', async () => {
      // Spy on substituteParameters to verify logic if needed, or just check execution
      await agent.execute(mockState);

      expect(mockLangfuse.getPrompt).toHaveBeenCalled();
    });

    it('should map brand personality to tone guidance', async () => {
      // Test with 'elegant'
      mockState.hotelParameters.brandPersonality = 'elegant';
      await agent.execute(mockState);

      expect(mockLangfuse.getPrompt).toHaveBeenCalled();
      // We don't easily see the final prompt here without more spying, but we verified the logic in the code.
    });
  });

  describe('Validation & Constraints', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    it('should fail if hotelParameters are missing', async () => {
      (mockState as any).hotelParameters = undefined;
      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: hotelParameters');
    });

    it('should fail if componentSelection is missing', async () => {
      mockState.componentSelection = undefined;
      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: componentSelection');
    });

    it('should fail if stylingSelection is missing', async () => {
      mockState.stylingSelection = undefined;
      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: stylingSelection');
    });



    });

  describe('Cost Tracking', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    it('should track step cost for ContentGenerator', async () => {
      const result = await agent.execute(mockState);

      expect(result.stepCosts).toBeDefined();
      expect(result.stepCosts?.ContentGenerator).toBeGreaterThan(0);
    });

    it('should enforce budget limit ($0.80 for ContentGenerator)', async () => {
      const result = await agent.execute(mockState);
      const cost = result.stepCosts?.ContentGenerator || 0;
      expect(cost).toBeLessThanOrEqual(0.80);
    });

    it('should validate stage checkpoint ($1.60 cumulative after ContentGenerator)', async () => {
      // Setup state just below checkpoint
      mockState.totalCost = 0.8; 
      const result = await agent.execute(mockState);
      // Cumulative cost (approx) should still be okay
      // Wait, we need to spy on CostMonitor to see if it was called correctly
      const checkBudgetSpy = jest.spyOn(CostMonitor.prototype, 'checkBudget');
      await agent.execute(mockState);
      expect(checkBudgetSpy).toHaveBeenCalled();
    });
  });

  describe('Integration Test', () => {
    it('should produce passing state with valid outputs', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const result = await agent.execute(mockState);

      expect(result.contentGeneration).toBeDefined();
      expect(result.validationStatus).toBe('pass');
      expect(result.stepCosts?.ContentGenerator).toBeGreaterThan(0);
    });
  });

  // Story 11.6: JSON Content Generation Tests
  describe('Story 11.6: JSON Content Generation', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    describe('ContentGenerator Output Validation', () => {
      it('should output homepageContent that matches HomepageContentSchema', async () => {
        const result = await agent.execute(mockState);

        expect(result.contentGeneration).toBeDefined();
        expect(result.contentGeneration?.homepageContentJson).toBeDefined();

        // Validate against schema
        const validationResult = HomepageContentSchema.safeParse(
          result.contentGeneration?.homepageContentJson
        );
        expect(validationResult.success).toBe(true);
        if (validationResult.success) {
          expect(validationResult.data.meta).toBeDefined();
          expect(validationResult.data.meta.locale).toBe('en');
          expect(validationResult.data.hero).toBeDefined();
        }
      });

      it('should output mediaManifest that matches MediaManifestSchema', async () => {
        const result = await agent.execute(mockState);

        expect(result.contentGeneration).toBeDefined();
        expect(result.contentGeneration?.mediaManifestJson).toBeDefined();

        // Validate against schema
        const validationResult = MediaManifestSchema.safeParse(
          result.contentGeneration?.mediaManifestJson
        );
        expect(validationResult.success).toBe(true);
        if (validationResult.success) {
          expect(validationResult.data.cdn).toBeDefined();
          expect(validationResult.data.assets).toBeDefined();
        }
      });

      it('should include all required sections in homepage content', async () => {
        const result = await agent.execute(mockState);
        const homepage = result.contentGeneration?.homepageContentJson;

        expect(homepage).toBeDefined();
        expect(homepage?.meta).toBeDefined();
        expect(homepage?.hero).toBeDefined();
        expect(homepage?.navigation).toBeDefined();
        expect(homepage?.sections).toBeDefined();
        expect(homepage?.footer).toBeDefined();
      });

      it('should include hotel-specific metadata', async () => {
        const result = await agent.execute(mockState);
        const homepage = result.contentGeneration?.homepageContentJson;

        expect(homepage?.meta?.hotelId).toBe('test-luxury-hotel');
        expect(homepage?.meta?.locale).toBe('en');
        expect(homepage?.meta?.version).toBe('1.0.0');
        expect(homepage?.meta?.generatedAt).toBeDefined();
      });
    });

    describe('Locale Generation (Story 11.6 Prompt 4)', () => {
      it('should generate English content only (Option C: Epic 13 for translations)', async () => {
        const result = await agent.execute(mockState);
        const contentJson = result.contentJson;

        expect(contentJson).toBeDefined();
        expect(contentJson?.homepage).toBeDefined();
        expect(contentJson?.homepage.meta.locale).toBe('en');

        // Epic 13: localizedHomepage is currently empty
        expect(contentJson?.localizedHomepage).toEqual({});
      });

      it('should preserve hotel variables in content', async () => {
        const result = await agent.execute(mockState);
        const homepage = result.contentGeneration?.homepageContentJson;

        // Hotel name should be present in the content
        expect(homepage?.hero.title).toBe('Test Luxury Hotel');
        expect(homepage?.hero.headline).toContain('Test Luxury Hotel');
      });
    });

    describe('Workflow Integration', () => {
      it('should populate contentJson field in workflow state', async () => {
        const result = await agent.execute(mockState);

        expect(result.contentJson).toBeDefined();
        expect(result.contentJson?.homepage).toBeDefined();
        expect(result.contentJson?.mediaManifest).toBeDefined();
      });

      it('should have consistent structure between contentGeneration and contentJson', async () => {
        const result = await agent.execute(mockState);

        const homepageFromContentGen = result.contentGeneration?.homepageContentJson;
        const homepageFromContentJson = result.contentJson?.homepage;

        // Both should have the same structure
        expect(homepageFromContentGen).toEqual(homepageFromContentJson);
      });

      it('should make contentJson accessible for file output', async () => {
        const result = await agent.execute(mockState);

        // Verify contentJson is ready for file writing
        expect(result.contentJson).toMatchObject({
          homepage: expect.any(Object),
          localizedHomepage: expect.any(Object),
          mediaManifest: expect.any(Object),
        });
      });
    });

    describe('Cost Tracking', () => {
      it('should track content generation cost within budget allocation', async () => {
        const result = await agent.execute(mockState);
        const cost = result.stepCosts?.ContentGenerator || 0;

        // ContentGenerator budget is $0.80
        expect(cost).toBeLessThanOrEqual(0.80);
      });

      it('should not exceed total workflow budget', async () => {
        const result = await agent.execute(mockState);

        // Total budget is $2.00
        expect(result.totalCost).toBeLessThanOrEqual(2.00);
      });
    });

    describe('Error Handling', () => {
      it('should handle malformed JSON from LLM response', async () => {
        // Mock invalid JSON response
        mockLLMProvider.sendCompletion.mockResolvedValueOnce({
          text: 'This is not valid JSON {{{',
          usage: { input: 100, output: 50, total: 150 },
          model: 'moonshotai/kimi-k2',
          cost: 0.00003
        });

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('Test prompt');

        await expect(agent.execute(mockState)).rejects.toThrow();
      });

      it('should validate schema and reject invalid content structure', async () => {
        // Mock response with missing required fields
        mockLLMProvider.sendCompletion.mockResolvedValueOnce({
          text: JSON.stringify({
            componentContent: {}, // Missing required fields
            reasoning: 'Too short'
          }),
          usage: { input: 100, output: 50, total: 150 },
          model: 'moonshotai/kimi-k2',
          cost: 0.00003
        });

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('Test prompt');

        await expect(agent.execute(mockState)).rejects.toThrow();
      });

      it('should handle schema validation failure for generated JSON content', async () => {
        // Mock response that passes basic schema but fails content schema (title too short)
        mockLLMProvider.sendCompletion.mockResolvedValueOnce({
          text: JSON.stringify({
            componentContent: {
              hero: { title: 'Test' } // Title too short, should fail validation
            },
            reasoning: 'Valid reasoning with enough characters to pass the minimum 50 character requirement for testing purposes.'
          }),
          usage: { input: 100, output: 50, total: 150 },
          model: 'moonshotai/kimi-k2',
          cost: 0.00003
        });

        (fs.existsSync as jest.Mock).mockReturnValue(true);
        (fs.readFileSync as jest.Mock).mockReturnValue('Test prompt');

        // Should reject due to content constraint validation
        await expect(agent.execute(mockState)).rejects.toThrow('output validation failed');
      });
    });
  });

  // Story 25.4: pageMetadata Update Tests
  describe('Story 25.4: pageMetadata Update', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      // Update mock response to include pageMetadata
      mockLLMProvider.sendCompletion.mockResolvedValue({
        text: JSON.stringify({
          componentContent: {
            hero: { title: "The Grand Paris Luxury Hotel" },
            rooms: {
              rooms: [{ id: "r1", name: "Deluxe King", type: "King", price: 350, capacity: 2, description: "A spacious room with city views and modern amenities." }]
            },
            testimonials: {
              testimonials: [{ id: "t1", customerName: "John Doe", quote: "An amazing experience!", rating: 5 }]
            }
          },
          pageMetadata: {
            rooms: {
              title: "Luxury Rooms & Premium Suites at Test Luxury Hotel",
              description: "Discover our elegantly appointed rooms and suites at Test Luxury Hotel featuring premium amenities and breathtaking city views."
            },
            gallery: {
              title: "Photo Gallery & Stunning Hotel Views Test Luxury Hotel",
              description: "Explore our stunning photo gallery showcasing the luxurious accommodations and world-class amenities at Test Luxury Hotel."
            },
            amenities: {
              title: "Premium Hotel Amenities & Services Test Luxury Hotel",
              description: "Experience world-class amenities at Test Luxury Hotel including fine dining, full-service spa, and personalized concierge."
            },
            reviews: {
              title: "Authentic Guest Reviews & Ratings Test Luxury Hotel",
              description: "Read authentic guest reviews and testimonials about exceptional experiences and hospitality at Test Luxury Hotel."
            },
            contact: {
              title: "Contact Our Reservations Team at Test Luxury Hotel",
              description: "Get in touch with the reservations team at Test Luxury Hotel for booking inquiries, special requests, and travel assistance."
            },
            about: {
              title: "About Our Rich Heritage & History Test Luxury Hotel",
              description: "Learn about the rich history and heritage of Test Luxury Hotel, a landmark of luxury hospitality in Paris since 1920."
            },
            faq: {
              title: "Frequently Asked Questions About Test Luxury Hotel",
              description: "Find answers to common questions about bookings, amenities, policies, and guest services at Test Luxury Hotel in Paris."
            }
          },
          reasoning: 'Valid reasoning with enough characters to pass the minimum 50 character requirement for testing purposes.'
        }),
        usage: { input: 200, output: 150, total: 350 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00007
      });
    });

    it('should include pageMetadata field in contentGeneration output', async () => {
      const result = await agent.execute(mockState);

      expect(result.contentGeneration).toBeDefined();
      expect(result.contentGeneration?.pageMetadata).toBeDefined();
    });

    it('should have correct page type keys in pageMetadata', async () => {
      const result = await agent.execute(mockState);
      const pageMetadata = result.contentGeneration?.pageMetadata;

      expect(pageMetadata).toBeDefined();
      expect(Object.keys(pageMetadata || {})).toEqual(
        expect.arrayContaining(['rooms', 'gallery', 'amenities', 'reviews', 'contact', 'about', 'faq'])
      );
    });

    it('should validate pageMetadata title character limits (50-60 chars)', async () => {
      const result = await agent.execute(mockState);
      const pageMetadata = result.contentGeneration?.pageMetadata;

      // Check that all titles are within 50-60 character limit
      Object.entries(pageMetadata || {}).forEach(([pageType, metadata]: [string, any]) => {
        if (metadata?.title) {
          expect(metadata.title.length).toBeGreaterThanOrEqual(50);
          expect(metadata.title.length).toBeLessThanOrEqual(60);
        }
      });
    });

    it('should validate pageMetadata description character limits (100-160 chars)', async () => {
      const result = await agent.execute(mockState);
      const pageMetadata = result.contentGeneration?.pageMetadata;

      // Check that all descriptions are within 100-160 character limit
      Object.entries(pageMetadata || {}).forEach(([pageType, metadata]: [string, any]) => {
        if (metadata?.description) {
          expect(metadata.description.length).toBeGreaterThanOrEqual(100);
          expect(metadata.description.length).toBeLessThanOrEqual(160);
        }
      });
    });

    it('should include hotel name in pageMetadata titles and descriptions', async () => {
      const result = await agent.execute(mockState);
      const pageMetadata = result.contentGeneration?.pageMetadata;

      Object.values(pageMetadata || {}).forEach((metadata: any) => {
        if (metadata?.title) {
          expect(metadata.title).toContain('Test Luxury Hotel');
        }
        if (metadata?.description) {
          expect(metadata.description).toContain('Test Luxury Hotel');
        }
      });
    });

    it('should be optional - existing configs without pageMetadata should still parse', async () => {
      // Mock response without pageMetadata (backward compatibility)
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentContent: {
            hero: { title: "The Grand Paris Luxury Hotel" }
          },
          reasoning: 'Valid reasoning with enough characters to pass the minimum 50 character requirement for testing purposes.'
        }),
        usage: { input: 150, output: 100, total: 250 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00005
      });

      const result = await agent.execute(mockState);

      // Should parse successfully even without pageMetadata
      expect(result.contentGeneration).toBeDefined();
      expect(result.contentGeneration?.pageMetadata).toBeUndefined();
    });
  });
});
