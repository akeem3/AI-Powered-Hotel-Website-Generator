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

import { AssemblyAgent } from '../../../app/langgraph/agents/AssemblyAgent';
import { WorkflowState } from '../../../app/langgraph/state/types';
import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';
import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';

describe('AssemblyAgent', () => {
  let agent: AssemblyAgent;
  let mockState: WorkflowState;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new AssemblyAgent();

    // Create a valid mock state with all upstream inputs
    mockState = {
      generationId: 'test-gen-123',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'business',
        brandPersonality: 'professional',
        hotelName: 'Test Hotel',
        location: 'Test City'
      },
      componentSelection: {
        selectedComponents: ['navigation', 'hero', 'rooms', 'gallery', 'booking'],
        layoutStructure: 'mixed',
        emphasisComponents: ['rooms', 'booking'],
        reasoning: 'Test selection'
      },
      stylingSelection: {
        componentVariants: {
          hero: { style: 'modern', layout: 'split' },
          rooms: { roomCardStyle: 'detailed' }
        },
        reasoning: 'Test styling'
      },
      contentGeneration: {
        componentContent: {
          hero: { title: 'Welcome to Test Hotel' },
          rooms: { 
            rooms: [{ 
              id: '1', 
              name: 'Deluxe Room', 
              type: 'King', 
              price: 250, 
              capacity: 2 
            }] 
          }
        },
        reasoning: 'Test content generation for assembly verification.'
      },
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

    // Mock LLM provider with a valid default response
    mockLLMProvider.sendCompletion.mockResolvedValue({
      text: JSON.stringify({
        generationId: 'luxury-business-v1',
        timestamp: new Date().toISOString(),
        hotelParameters: mockState.hotelParameters,
        components: [
          {
            type: 'hero',
            variant: { style: 'elegant', layout: 'split', overlay: 'dark', height: 'medium' },
            props: { title: 'The Grand Paris' },
            order: 0
          },
          {
            type: 'navigation',
            variant: { navStyle: 'solid', navLayout: 'default' },
            props: { links: ['Home', 'Rooms'] },
            order: 1
          },
          {
            type: 'rooms',
            variant: { roomCardStyle: 'detailed', imageHeight: 'default' },
            props: { title: 'Luxury Rooms' },
            order: 2
          },
          {
            type: 'gallery',
            variant: { galleryLayout: 'masonry', gallerySpacing: 'normal', aspectRatio: 'landscape', columns: 3 },
            props: { images: [] },
            order: 3
          },
          {
            type: 'booking',
            variant: { bookingStyle: 'desktop', bookingTheme: 'light' },
            props: { cta: 'Book Now' },
            order: 4
          }
        ],
        layoutStructure: 'mixed',
        emphasisComponents: ['rooms', 'booking'],
        validationStatus: "PASS"
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
    it('should return AssemblyAgent', () => {
      expect(agent.getAgentName()).toBe('AssemblyAgent');
    });
  });

  describe('Input Validation', () => {
    it('should throw error if hotelParameters is missing', async () => {
      mockState.hotelParameters = undefined as any;
      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: hotelParameters');
    });

    it('should throw error if componentSelection is missing', async () => {
      mockState.componentSelection = undefined as any;
      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: componentSelection');
    });

    it('should throw error if stylingSelection is missing', async () => {
      mockState.stylingSelection = undefined as any;
      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: stylingSelection');
    });

    it('should throw error if contentGeneration is missing', async () => {
      mockState.contentGeneration = undefined as any;
      await expect(agent.execute(mockState)).rejects.toThrow('Missing required input: contentGeneration');
    });
  });

  describe('Component Ordering Logic', () => {
    it('should correctly order components with emphasis priority', () => {
      const selected = ['hero', 'navigation', 'rooms', 'gallery', 'booking'];
      const emphasis = ['gallery', 'booking'];
      
      const ordered = (agent as any).orderComponents(selected, emphasis);
      
      expect(ordered[0]).toBe('navigation');
      expect(ordered[1]).toBe('hero');
      expect(ordered[2]).toBe('gallery'); // First emphasized
      expect(ordered[3]).toBe('booking'); // Second emphasized
      expect(ordered[4]).toBe('rooms');   // Remaining
    });

    it('should handle emphasis components that are already at top positions', () => {
      const selected = ['hero', 'navigation', 'rooms'];
      const emphasis = ['hero', 'rooms'];
      
      const ordered = (agent as any).orderComponents(selected, emphasis);
      
      expect(ordered[0]).toBe('navigation');
      expect(ordered[1]).toBe('hero');
      expect(ordered[2]).toBe('rooms');
    });
  });

  describe('Variant Field Mapping', () => {
    it('should map gallery variants correctly', () => {
      const raw = { galleryLayout: 'masonry', gallerySpacing: 'tight' };
      const mapped = (agent as any).variantFieldMapping('gallery', raw);
      expect(mapped.layout).toBe('masonry');
      expect(mapped.spacing).toBe('tight');
    });

    it('should map navigation variants correctly', () => {
      const raw = { navStyle: 'solid', navLayout: 'compact' };
      const mapped = (agent as any).variantFieldMapping('navigation', raw);
      expect(mapped.style).toBe('solid');
      expect(mapped.layout).toBe('compact');
    });

    it('should return original if no mapping exists', () => {
      const raw = { foo: 'bar' };
      const mapped = (agent as any).variantFieldMapping('unknown', raw);
      expect(mapped).toEqual(raw);
    });
  });

  describe('Image Placeholder Injection', () => {
    it('should inject hero image if missing', () => {
      const props = { title: 'Hello' };
      const injected = (agent as any).injectImagePlaceholders('hero', props, 'Test Hotel');
      expect(injected.image).toContain('backblazeb2.com');
      expect(injected.image).toContain('hero');
      expect(injected.image).toContain('.webp');
    });

    it('should inject gallery images URLs if missing with .webp extension', () => {
      const props = { images: [{ alt: 'Img 1' }, { alt: 'Img 2' }] };
      const injected = (agent as any).injectImagePlaceholders('gallery', props, 'Test Hotel');
      expect(injected.images[0].desktopUrl).toContain('gallery-1.webp');
      expect(injected.images[0].mobileUrl).toContain('gallery-1.m.webp');
      expect(injected.images[1].desktopUrl).toContain('gallery-2.webp');
    });
  });



  describe('Cost Tracking', () => {
    beforeEach(() => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readFileSync as jest.Mock).mockReturnValue('Mock Prompt');
    });

    it('should track step cost and respect budget ($0.20)', async () => {
      const result = await agent.execute(mockState);

      expect(result.stepCosts?.AssemblyAgent).toBeDefined();

      // Get the actual step budget from CostMonitor (based on TOTAL_BUDGET)
      const costMonitor = new CostMonitor();
      const expectedStepBudget = costMonitor.getStepBudget('AssemblyAgent');

      // Verify the step cost is within the allocated budget
      expect(result.stepCosts?.AssemblyAgent).toBeLessThanOrEqual(expectedStepBudget ?? 0.20);

      // Verify the step budget is 10% of total budget
      expect(expectedStepBudget).toBe(CostMonitor.TOTAL_BUDGET * 0.1);
    });
  });
});
