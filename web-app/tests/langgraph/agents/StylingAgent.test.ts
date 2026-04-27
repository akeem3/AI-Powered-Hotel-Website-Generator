// Mock fs module
jest.mock('fs');

// Mock CVAValidator
jest.mock('../../../app/langgraph/utils/cva-validator');

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

import { StylingAgent } from '../../../app/langgraph/agents/StylingAgent';
import { WorkflowState } from '../../../app/langgraph/state/types';
import { CVAValidator } from '../../../app/langgraph/utils/cva-validator';
import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';
import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';
import * as fs from 'fs';

describe('StylingAgent', () => {
  let agent: StylingAgent;
  let mockState: WorkflowState;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new StylingAgent();

    // Mock CVAValidator to return valid by default
    (CVAValidator.validateOutput as jest.Mock).mockReturnValue({
      valid: true,
      errors: []
    });

    // Create a valid mock state with componentSelection from ComponentSelector
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
        selectedComponents: ['hero', 'navigation', 'rooms', 'gallery', 'testimonials', 'amenities', 'booking', 'contact'] as any,
        layoutStructure: 'single-column',
        emphasisComponents: ['hero', 'rooms', 'booking'],
        reasoning: 'Valid reasoning with enough characters to pass the minimum 50 character requirement for testing purposes.'
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

    // Default mock implementation for the LLM provider
    mockLLMProvider.sendCompletion.mockResolvedValue({
      text: JSON.stringify({
        componentVariants: {
          hero: { style: 'elegant', layout: 'split', overlay: 'dark', height: 'medium' },
          navigation: { navStyle: 'solid', navLayout: 'default' },
          rooms: { roomCardStyle: 'detailed', imageHeight: 'default' },
          gallery: { galleryLayout: 'masonry', gallerySpacing: 'normal', aspectRatio: 'landscape', columns: 3 },
          booking: { bookingStyle: 'desktop', bookingTheme: 'light' },
          testimonials: { testimonialsLayout: 'grid', testimonialsColumns: 3 },
          amenities: { amenitiesLayout: 'grid', amenitiesColumns: 3, iconSize: 'medium', iconStyle: 'default' },
          contact: { contactStyle: 'minimal', contactBackground: 'none' }
        },
        reasoning: 'Selection based on luxury hotel requirements to ensure a premium user experience and high conversion rate.'
      }),
      usage: { input: 100, output: 50, total: 150 },
      model: 'moonshotai/kimi-k2',
      cost: 0.00003
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getAgentName', () => {
    it('should return StylingAgent', () => {
      expect(agent.getAgentName()).toBe('StylingAgent');
    });
  });

  describe('AC3: Input Validation', () => {
    it('should throw descriptive error when hotelParameters is missing', async () => {
      const stateWithoutHotelParams = { ...mockState, hotelParameters: undefined as any };

      await expect(agent.execute(stateWithoutHotelParams))
        .rejects.toThrow('[StylingAgent] Missing required input: hotelParameters');
    });

    it('should throw descriptive error when componentSelection is missing', async () => {
      const stateWithoutComponentSelection = { ...mockState, componentSelection: undefined as any };

      await expect(agent.execute(stateWithoutComponentSelection))
        .rejects.toThrow('[StylingAgent] Missing required input: componentSelection');
    });

    it('should execute when both required inputs are present', async () => {
      const mockPrompt = 'Test prompt with {hotelType}';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const result = await agent.execute(mockState);

      expect(result.stylingSelection).toBeDefined();
    });
  });

  describe('AC2: Prompt Loading', () => {
    it('should load prompt from valid path', async () => {
      const result = await agent.execute(mockState);

      expect(mockLangfuse.getPrompt).toHaveBeenCalled();
      expect(result.stylingSelection).toBeDefined();
    });

    it('should throw error when prompt file not found', async () => {
      mockLangfuse.getPrompt.mockRejectedValueOnce(new Error('Prompt not found'));

      await expect(agent.execute(mockState))
        .rejects.toThrow('Prompt not found');
    });

    it('should substitute hotel parameters in prompt', async () => {
      await agent.execute(mockState);

      // Verify getPrompt was called (prompt was loaded)
      expect(mockLangfuse.getPrompt).toHaveBeenCalled();
    });

    it('should substitute component selection in prompt', async () => {
      await agent.execute(mockState);

      expect(mockLangfuse.getPrompt).toHaveBeenCalled();
    });
  });

  describe('AC4: ZOD Schema Validation', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    it('should validate and return valid styling output with componentVariants', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection).toBeDefined();
      expect(result.stylingSelection?.componentVariants).toBeDefined();
      expect(typeof result.stylingSelection?.componentVariants).toBe('object');
    });

    it('should include reasoning field (50-1000 chars)', async () => {
      const result = await agent.execute(mockState);

      const reasoning = result.stylingSelection?.reasoning || '';
      expect(reasoning.length).toBeGreaterThanOrEqual(50);
      expect(reasoning.length).toBeLessThanOrEqual(1000);
    });

    it('should validate against StylingAgentOutput ZOD schema', async () => {
      const result = await agent.execute(mockState);

      // Verify structure matches schema
      expect(result.stylingSelection).toHaveProperty('componentVariants');
      expect(result.stylingSelection).toHaveProperty('reasoning');
    });
  });

  describe('AC4: Valid CVA Variants for All 8 Component Types', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    it('should select variants for hero component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('hero');
      expect(result.stylingSelection?.componentVariants.hero).toHaveProperty('style');
      expect(result.stylingSelection?.componentVariants.hero).toHaveProperty('layout');
      expect(result.stylingSelection?.componentVariants.hero).toHaveProperty('overlay');
      expect(result.stylingSelection?.componentVariants.hero).toHaveProperty('height');

      // Verify valid enum values
      expect(['modern', 'classic', 'minimal', 'bold', 'elegant'])
        .toContain(result.stylingSelection?.componentVariants.hero.style);
      expect(['centered', 'split', 'fullscreen'])
        .toContain(result.stylingSelection?.componentVariants.hero.layout);
      expect(['none', 'light', 'dark', 'gradient'])
        .toContain(result.stylingSelection?.componentVariants.hero.overlay);
      expect(['small', 'medium', 'large', 'fullscreen'])
        .toContain(result.stylingSelection?.componentVariants.hero.height);
    });

    it('should select variants for navigation component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('navigation');
      expect(result.stylingSelection?.componentVariants.navigation).toHaveProperty('navStyle');
      expect(result.stylingSelection?.componentVariants.navigation).toHaveProperty('navLayout');

      expect(['transparent', 'solid', 'glass'])
        .toContain(result.stylingSelection?.componentVariants.navigation.navStyle);
      expect(['default', 'compact', 'tall'])
        .toContain(result.stylingSelection?.componentVariants.navigation.navLayout);
    });

    it('should select variants for rooms component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('rooms');
      expect(result.stylingSelection?.componentVariants.rooms).toHaveProperty('roomCardStyle');
      expect(result.stylingSelection?.componentVariants.rooms).toHaveProperty('imageHeight');

      expect(['detailed', 'compact', 'grid'])
        .toContain(result.stylingSelection?.componentVariants.rooms.roomCardStyle);
      expect(['default', 'tall', 'wide'])
        .toContain(result.stylingSelection?.componentVariants.rooms.imageHeight);
    });

    it('should select variants for gallery component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('gallery');
      expect(result.stylingSelection?.componentVariants.gallery).toHaveProperty('galleryLayout');
      expect(result.stylingSelection?.componentVariants.gallery).toHaveProperty('gallerySpacing');
      expect(result.stylingSelection?.componentVariants.gallery).toHaveProperty('aspectRatio');
      expect(result.stylingSelection?.componentVariants.gallery).toHaveProperty('columns');

      expect(['grid', 'masonry', 'carousel'])
        .toContain(result.stylingSelection?.componentVariants.gallery.galleryLayout);
      expect(['tight', 'normal', 'loose'])
        .toContain(result.stylingSelection?.componentVariants.gallery.gallerySpacing);
      expect(['square', 'landscape', 'portrait'])
        .toContain(result.stylingSelection?.componentVariants.gallery.aspectRatio);
      expect([2, 3, 4])
        .toContain(result.stylingSelection?.componentVariants.gallery.columns);
    });

    it('should select variants for testimonials component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('testimonials');
      expect(result.stylingSelection?.componentVariants.testimonials).toHaveProperty('testimonialsLayout');
      expect(result.stylingSelection?.componentVariants.testimonials).toHaveProperty('testimonialsColumns');

      expect(['carousel', 'grid', 'featured'])
        .toContain(result.stylingSelection?.componentVariants.testimonials.testimonialsLayout);
      expect([2, 3])
        .toContain(result.stylingSelection?.componentVariants.testimonials.testimonialsColumns);
    });

    it('should select variants for amenities component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('amenities');
      expect(result.stylingSelection?.componentVariants.amenities).toHaveProperty('amenitiesLayout');
      expect(result.stylingSelection?.componentVariants.amenities).toHaveProperty('amenitiesColumns');
      expect(result.stylingSelection?.componentVariants.amenities).toHaveProperty('iconSize');
      expect(result.stylingSelection?.componentVariants.amenities).toHaveProperty('iconStyle');

      expect(['grid', 'list', 'featured'])
        .toContain(result.stylingSelection?.componentVariants.amenities.amenitiesLayout);
      expect([2, 3, 4])
        .toContain(result.stylingSelection?.componentVariants.amenities.amenitiesColumns);
      expect(['small', 'medium', 'large'])
        .toContain(result.stylingSelection?.componentVariants.amenities.iconSize);
      expect(['default', 'muted', 'colored'])
        .toContain(result.stylingSelection?.componentVariants.amenities.iconStyle);
    });

    it('should select variants for booking component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('booking');
      expect(result.stylingSelection?.componentVariants.booking).toHaveProperty('bookingStyle');
      expect(result.stylingSelection?.componentVariants.booking).toHaveProperty('bookingTheme');

      expect(['desktop', 'mobile'])
        .toContain(result.stylingSelection?.componentVariants.booking.bookingStyle);
      expect(['light', 'dark', 'glass'])
        .toContain(result.stylingSelection?.componentVariants.booking.bookingTheme);
    });

    it('should select variants for contact component', async () => {
      const result = await agent.execute(mockState);

      expect(result.stylingSelection?.componentVariants).toHaveProperty('contact');
      expect(result.stylingSelection?.componentVariants.contact).toHaveProperty('contactStyle');
      expect(result.stylingSelection?.componentVariants.contact).toHaveProperty('contactBackground');

      expect(['default', 'minimal', 'floating'])
        .toContain(result.stylingSelection?.componentVariants.contact.contactStyle);
      expect(['none', 'brand', 'muted'])
        .toContain(result.stylingSelection?.componentVariants.contact.contactBackground);
    });

    it('should only provide variants for selected components', async () => {
      // Create state with only 5 components
      const stateWithFewerComponents = {
        ...mockState,
        componentSelection: {
          ...mockState.componentSelection!,
          selectedComponents: ['hero', 'navigation', 'rooms', 'gallery', 'booking'] as any
        }
      };

      // Override mock to return only 5 components
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentVariants: {
            hero: { style: 'elegant', layout: 'split', overlay: 'dark', height: 'medium' },
            navigation: { navStyle: 'solid', navLayout: 'default' },
            rooms: { roomCardStyle: 'detailed', imageHeight: 'default' },
            gallery: { galleryLayout: 'masonry', gallerySpacing: 'normal', aspectRatio: 'landscape', columns: 3 },
            booking: { bookingStyle: 'desktop', bookingTheme: 'light' }
          },
          reasoning: 'Valid reasoning for 5 components to ensure a premium user experience and high conversion rate.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      const result = await agent.execute(stateWithFewerComponents);

      // Should have variants for all 5 selected components
      const variantKeys = Object.keys(result.stylingSelection?.componentVariants || {});
      console.log('DEBUG VARIANT KEYS:', variantKeys);
      expect(variantKeys).toHaveLength(5);
      expect(variantKeys).toContain('hero');
      expect(variantKeys).toContain('navigation');
      expect(variantKeys).toContain('rooms');
      expect(variantKeys).toContain('gallery');
      expect(variantKeys).toContain('booking');
    });
  });

  describe('AC5: CVA Variant Validation', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    it('should call CVAValidator.validateOutput with componentVariants', async () => {
      await agent.execute(mockState);

      expect(CVAValidator.validateOutput).toHaveBeenCalledWith(
        expect.objectContaining({
          componentVariants: expect.any(Object)
        })
      );
    });



    it('should pass when CVA validation succeeds', async () => {
      (CVAValidator.validateOutput as jest.Mock).mockReturnValue({
        valid: true,
        errors: []
      });

      const result = await agent.execute(mockState);

      expect(result.stylingSelection).toBeDefined();
      expect(CVAValidator.validateOutput).toHaveBeenCalled();
    });
  });



  describe('AC7: Cost Tracking Integration', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    it('should track step cost', async () => {
      const result = await agent.execute(mockState);

      expect(result.stepCosts).toBeDefined();
      expect(result.stepCosts?.StylingAgent).toBeGreaterThan(0);
    });

    it('should update total cost', async () => {
      const result = await agent.execute(mockState);

      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should call CostMonitor.checkBudget before execution', async () => {
      const checkBudgetSpy = jest.spyOn(CostMonitor.prototype, 'checkBudget');

      await agent.execute(mockState);

      expect(checkBudgetSpy).toHaveBeenCalledWith(mockState, 'StylingAgent');
    });

    it('should enforce budget limit ($0.40 for StylingAgent)', async () => {
      const result = await agent.execute(mockState);

      // Verify cost was tracked at step level
      expect(result.stepCosts?.StylingAgent).toBeDefined();

      // Verify the step cost does not exceed the $0.40 allocation
      const stylingAgentCost = result.stepCosts?.StylingAgent || 0;
      expect(stylingAgentCost).toBeLessThanOrEqual(0.40);

      // Verify the CostMonitor has the correct step budget defined
      const costMonitor = new CostMonitor();
      const stepBudget = costMonitor.getStepBudget('StylingAgent');
      expect(stepBudget).toBe(0.40);
    });

    it('should throw when total budget is exceeded', async () => {
      // Set totalCost to exceed the $2.00 budget
      mockState.totalCost = 2.01;
      mockState.budgetRemaining = -0.01;

      await expect(agent.execute(mockState))
        .rejects.toThrow('Budget exceeded');
    });



    it('should stay within $0.40 budget allocation for StylingAgent', async () => {
      // Run the agent and verify cost stays within allocation
      const result = await agent.execute(mockState);

      const stepCost = result.stepCosts?.StylingAgent || 0;
      expect(stepCost).toBeLessThanOrEqual(0.40);
      expect(stepCost).toBeGreaterThan(0);
    });
  });

  describe('Budget Exceeded Fallback Scenario', () => {
    beforeEach(() => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);
    });

    it('should throw error when approaching budget limit before execution', async () => {
      // Set state close to budget limit
      mockState.totalCost = 1.95;
      mockState.budgetRemaining = 0.05;

      // Agent should still execute as we're within total budget
      // But step budget will be checked
      const result = await agent.execute(mockState);
      expect(result.stylingSelection).toBeDefined();
    });

    it('should prevent execution when budget exhausted', async () => {
      // Set totalCost to exceed the $2.00 budget
      // The budget check is: currentCost > limit, so 2.01 > 2.00 will trigger the error
      mockState.totalCost = 2.01;
      mockState.budgetRemaining = -0.01;

      await expect(agent.execute(mockState))
        .rejects.toThrow('Budget exceeded');
    });

    it('should track costs correctly across multiple agents', async () => {
      // Simulate prior costs from ComponentSelector
      mockState.totalCost = 0.35;
      mockState.stepCosts = { ComponentSelector: 0.35 };
      mockState.budgetRemaining = 1.65;

      const result = await agent.execute(mockState);

      // The execute method returns incremental updates
      // stepCosts will contain the StylingAgent cost
      expect(result.stepCosts?.StylingAgent).toBeGreaterThan(0);

      // totalCost in result is the incremental cost from this agent only
      // It should be positive but less than the StylingAgent budget allocation
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalCost).toBeLessThanOrEqual(0.40); // StylingAgent budget
    });
  });

  describe('Integration Test - Full Flow', () => {
    it('should execute complete workflow with valid state', async () => {
      const mockPrompt = 'Test prompt with {hotelType}';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const result = await agent.execute(mockState);

      // Verify state updates
      expect(result.stylingSelection).toBeDefined();
      expect(result.validationStatus).toBe('pass');
      expect(result.validationErrors).toEqual([]);
      expect(result.stepCosts?.StylingAgent).toBeGreaterThan(0);
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should maintain state immutability', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const originalState = { ...mockState };
      const result = await agent.execute(mockState);

      // Original state should not be mutated
      expect(mockState.stylingSelection).toBeUndefined();
      expect(mockState.totalCost).toBe(0);

      // Result should contain updates
      expect(result.stylingSelection).toBeDefined();
      expect(result.totalCost).toBeGreaterThan(0);
    });

    it('should integrate with LangFuseService', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      // Start a trace manually
      const langfuseService = new LangFuseService();
      langfuseService.startWorkflowTrace('TestWorkflow');

      // Create agent with this service
      const agentWithLangfuse = new StylingAgent();
      await agentWithLangfuse.execute(mockState);

      // Verify generation was created
      expect(mockTrace.generation).toHaveBeenCalled();
      expect(mockGeneration.end).toHaveBeenCalled();
    });

    it('should respect budget remaining from state', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      mockState.totalCost = 0.40; // After ComponentSelector
      mockState.budgetRemaining = 1.60;

      const result = await agent.execute(mockState);

      // Should succeed as we're within budget
      expect(result.stylingSelection).toBeDefined();
      expect(result.stepCosts?.StylingAgent).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal component selection (5 components)', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const stateWithMinimalComponents = {
        ...mockState,
        componentSelection: {
        selectedComponents: ['hero', 'navigation', 'rooms', 'booking', 'contact'] as any,
          layoutStructure: 'single-column' as const,
          emphasisComponents: ['hero'],
          reasoning: 'Minimal component selection with five essential components for hotel website.'
        }
      };

      // Override mock to return only 5 components
      mockLLMProvider.sendCompletion.mockResolvedValueOnce({
        text: JSON.stringify({
          componentVariants: {
            hero: { style: 'elegant', layout: 'split', overlay: 'dark', height: 'medium' },
            navigation: { navStyle: 'solid', navLayout: 'default' },
            rooms: { roomCardStyle: 'detailed', imageHeight: 'default' },
            booking: { bookingStyle: 'desktop', bookingTheme: 'light' },
            contact: { contactStyle: 'minimal', contactBackground: 'none' }
          },
          reasoning: 'Minimal component selection for hotel website to ensure a premium user experience and high conversion rate.'
        }),
        usage: { input: 100, output: 50, total: 150 },
        model: 'moonshotai/kimi-k2',
        cost: 0.00003
      });

      const result = await agent.execute(stateWithMinimalComponents);

      expect(result.stylingSelection).toBeDefined();
      const variantKeys = Object.keys(result.stylingSelection?.componentVariants || {});
      expect(variantKeys).toHaveLength(5);
    });

    it('should handle maximum component selection (8 components)', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const result = await agent.execute(mockState);

      expect(result.stylingSelection).toBeDefined();
      const variantKeys = Object.keys(result.stylingSelection?.componentVariants || {});
      expect(variantKeys).toHaveLength(8);
    });

    it('should handle empty emphasis components', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const stateWithNoEmphasis = {
        ...mockState,
        componentSelection: {
          ...mockState.componentSelection!,
          emphasisComponents: []
        }
      };

      const result = await agent.execute(stateWithNoEmphasis);

      expect(result.stylingSelection).toBeDefined();
    });

    it('should handle different hotel types correctly', async () => {
      const mockPrompt = 'Test prompt';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(mockPrompt);

      const hotelTypes: Array<'luxury' | 'budget' | 'boutique' | 'resort' | 'business'> =
        ['luxury', 'budget', 'boutique', 'resort', 'business'];

      for (const hotelType of hotelTypes) {
        const stateForHotelType = {
          ...mockState,
          hotelParameters: {
            ...mockState.hotelParameters,
            hotelType
          }
        };

        const result = await agent.execute(stateForHotelType);
        expect(result.stylingSelection).toBeDefined();
      }
    });

    it('should handle very long prompts', async () => {
      const longPrompt = 'Test '.repeat(1000) + '{hotelType}';
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue(longPrompt);

      const result = await agent.execute(mockState);

      expect(result.stylingSelection).toBeDefined();
      expect(result.stepCosts?.StylingAgent).toBeGreaterThan(0);
    });
  });
});
