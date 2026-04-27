import { HomepageGenerationWorkflow } from '@/app/langgraph/workflows/HomepageGenerationWorkflow';
import { WorkflowState } from '../../app/langgraph/state/types';
import { ComponentSelector } from '../../app/langgraph/agents/ComponentSelector';
import { StylingAgent } from '../../app/langgraph/agents/StylingAgent';
import { ContentGenerator } from '../../app/langgraph/agents/ContentGenerator';
import { AssemblyAgent } from '../../app/langgraph/agents/AssemblyAgent';
import { QualityValidator } from '../../app/langgraph/agents/QualityValidator';

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

describe('HomepageGenerationWorkflow', () => {
  let workflow: HomepageGenerationWorkflow;

  beforeEach(() => {
    jest.clearAllMocks();
    workflow = new HomepageGenerationWorkflow();

    // Mock agent responses for successful execution
    (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({
      componentSelection: {
        selectedComponents: ['hero', 'rooms', 'gallery', 'contact', 'navigation'],
        layoutStructure: 'standard',
        emphasisComponents: ['hero'],
        reasoning: 'Test selection'
      },
      stepCosts: { ComponentSelector: 0.01 },
      totalCost: 0.01
    });

    (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
      stylingSelection: {
        componentVariants: {
          hero: 'elegant',
          rooms: 'modern',
          gallery: 'minimal',
          contact: 'standard',
          navigation: 'compact'
        },
        reasoning: 'Test styling'
      },
      stepCosts: { StylingAgent: 0.01 },
      totalCost: 0.01
    });

    (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
      contentGeneration: {
        componentContent: {
          hero: { headline: 'Welcome', subheadline: 'Luxury Awaits' },
          rooms: { title: 'Our Rooms', description: 'Luxury accommodations' },
          gallery: { title: 'Gallery', description: 'Explore our spaces' },
          contact: { title: 'Contact Us', description: 'Get in touch' },
          navigation: { links: ['Home', 'Rooms', 'Gallery', 'Contact'] }
        },
        reasoning: 'Test content'
      },
      stepCosts: { ContentGenerator: 0.01 },
      totalCost: 0.01
    });

    (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
      assembledConfig: {
        generationId: 'test-gen-123',
        timestamp: new Date().toISOString(),
        hotelParameters: {
          hotelName: 'Test Hotel',
          hotelType: 'luxury',
          targetAudience: 'business',
          brandPersonality: 'professional',
          location: 'Paris, France'
        },
        components: [],
        layoutStructure: 'standard',
        emphasisComponents: ['hero'],
        validationStatus: 'pending'
      },
      stepCosts: { AssemblyAgent: 0.01 },
      totalCost: 0.01
    });

    (QualityValidator.prototype.execute as jest.Mock).mockImplementation((state: WorkflowState) => {
      return Promise.resolve({
        validationStatus: 'pass',
        qualityScore: 95,
        validationErrors: [],
        budgetExceeded: false,
        stepCosts: { QualityValidator: 0.01 },
        totalCost: 0.01
      });
    });
  });

  test('should compile successfully', () => {
    const compiled = workflow.compile();
    expect(compiled).toBeDefined();
    expect(typeof compiled.invoke).toBe('function');
  });

  test('should execute placeholder workflow and accumulate results', async () => {
    const initialState: WorkflowState = {
      generationId: 'test-gen-123',
      hotelParameters: {
        hotelName: 'Test Hotel',
        hotelType: 'luxury',
        targetAudience: 'business',
        brandPersonality: 'professional',
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
      budgetRemaining: 1.0,
      currentAgent: 'start',
      retryCount: 0,
      errors: [],
      budgetExceeded: false,
    };

    const { finalState } = await workflow.execute(initialState);

    // Verify sequential execution results
    expect(finalState.componentSelection).toBeDefined();
    expect(finalState.stylingSelection).toBeDefined();
    expect(finalState.contentGeneration).toBeDefined();
    expect(finalState.assembledConfig).toBeDefined();
    expect(finalState.validationStatus).toBe('pass');

    // Verify cost accumulation (BUG FIX VERIFICATION)
    expect(finalState.totalCost).toBeGreaterThan(0);
    expect(Object.keys(finalState.stepCosts).length).toBe(5);

    // Verify that totalCost is the sum of individual step costs
    const summedCost = Object.values(finalState.stepCosts).reduce((a, b) => a + b, 0);
    expect(finalState.totalCost).toBeCloseTo(summedCost, 5);
  }, 30000);
});
