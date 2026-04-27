import { QualityValidator } from '../../../app/langgraph/agents/QualityValidator';
import { WorkflowState } from '../../../app/langgraph/state/types';
import { HomepageConfig } from '../../../app/langgraph/agents/schemas';
import { LangFuseService } from '../../../app/langgraph/services/LangFuseService';

// Mock LangFuse
const mockGeneration = {
  end: jest.fn(),
};

const mockTrace = {
  id: 'test-trace-id',
  generation: jest.fn().mockReturnValue(mockGeneration),
  update: jest.fn(),
  score: jest.fn(),
};

const mockLangfuse = {
  trace: jest.fn().mockReturnValue(mockTrace),
  flush: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined),
};

jest.mock('langfuse', () => {
  return {
    Langfuse: jest.fn().mockImplementation(() => mockLangfuse),
  };
});

describe('QualityValidator', () => {
  let validator: QualityValidator;
  let mockLangFuseService: LangFuseService;

  beforeEach(() => {
    jest.clearAllMocks();
    validator = new QualityValidator();
    // BaseAgent initializes its own LangFuseService, we can access it if needed
    // but the mocks for 'langfuse' will handle the actual SDK calls.
    mockLangFuseService = (validator as any).langfuseService;
    
    // Ensure a trace is active for all tests to avoid console warnings
    mockLangFuseService.startWorkflowTrace('test-trace');
  });

  const createValidConfig = (): HomepageConfig => ({
    generationId: 'test-hotel-v1',
    timestamp: new Date().toISOString(),
    hotelParameters: {
      hotelType: 'luxury',
      targetAudience: 'business',
      brandPersonality: 'elegant',
      hotelName: 'Test Hotel',
      location: 'Paris, France'
    },
    components: [
      { type: 'navigation', variant: { style: 'solid' }, props: { title: 'Nav' }, order: 0 },
      { type: 'hero', variant: { style: 'elegant' }, props: { headline: 'Welcome' }, order: 1 },
      { type: 'rooms', variant: { variant: 'detailed' }, props: { rooms: [] }, order: 2 },
      { type: 'gallery', variant: { layout: 'grid' }, props: { images: [] }, order: 3 },
      { type: 'contact', variant: { style: 'default' }, props: { title: 'Contact' }, order: 4 }
    ],
    layoutStructure: 'single-column',
    emphasisComponents: ['hero'],
    validationStatus: 'PASS'
  });

  it('should pass for a valid configuration within budget', async () => {
    const state: WorkflowState = {
      generationId: 'test-gen',
      hotelParameters: createValidConfig().hotelParameters,
      assembledConfig: createValidConfig(),
      totalCost: 1.50,
      stepCosts: {},
      budgetRemaining: 0.50,
      currentAgent: 'AssemblyAgent',
      retryCount: 0,
      errors: [],
      validationStatus: 'pending',
      validationErrors: [],
      qualityScore: undefined,
      componentSelection: undefined,
      stylingSelection: undefined,
      contentGeneration: undefined,
    } as any;

    const result = await validator.performGeneration(state);

    expect(result.validationStatus).toBe('pass');
    expect(result.qualityScore).toBeGreaterThanOrEqual(90);
    expect(result.validationErrors).toHaveLength(0);
    
    // Verify scoring calls via the mockTrace
    expect(mockTrace.score).toHaveBeenCalledWith(expect.objectContaining({
      name: 'quality-score',
      value: expect.any(Number)
    }));
    expect(mockTrace.score).toHaveBeenCalledWith(expect.objectContaining({
      name: 'zod-compliance',
      value: 1
    }));
    expect(mockTrace.score).toHaveBeenCalledWith(expect.objectContaining({
      name: 'budget-compliance',
      value: 1
    }));
  });

  it('should fail if Zod validation fails', async () => {
    const invalidConfig = createValidConfig();
    (invalidConfig as any).components = []; // Too few components (min 5)

    const state: WorkflowState = {
      assembledConfig: invalidConfig,
      totalCost: 1.00
    } as any;

    const result = await validator.performGeneration(state);

    expect(result.validationStatus).toBe('fail');
    // Check if any error contains 'Zod Error'
    expect(result.validationErrors?.some(err => err.includes('Zod Error'))).toBe(true);
    expect(mockTrace.score).toHaveBeenCalledWith(expect.objectContaining({
      name: 'zod-compliance',
      value: 0
    }));
  });

  it('should fail if budget is exceeded', async () => {
    const state: WorkflowState = {
      assembledConfig: createValidConfig(),
      totalCost: 2.50
    } as any;

    const result = await validator.performGeneration(state);

    expect(result.validationStatus).toBe('fail');
    expect(result.validationErrors?.some(err => err.includes('Budget exceeded'))).toBe(true);
    expect(mockTrace.score).toHaveBeenCalledWith(expect.objectContaining({
      name: 'budget-compliance',
      value: 0
    }));
  });

  it('should fail if overall score is too low due to invalid variants', async () => {
    const config = createValidConfig();
    // Inject multiple invalid CVA variants to drop score below 90
    config.components[0].variant = { style: 'invalid' };
    config.components[1].variant = { style: 'invalid' };
    config.components[2].variant = { variant: 'invalid' };

    const state: WorkflowState = {
      assembledConfig: config,
      totalCost: 1.00
    } as any;

    const result = await validator.performGeneration(state);

    expect(result.validationStatus).toBe('fail');
    expect(result.validationErrors?.some(err => err.includes('CVA Error'))).toBe(true);
  });

  it('should handle missing assembledConfig gracefully', async () => {
    const state: WorkflowState = {
      assembledConfig: undefined,
      totalCost: 1.00
    } as any;

    const result = await validator.performGeneration(state);

    expect(result.validationStatus).toBe('fail');
    expect(result.validationErrors).toContain('Missing assembled configuration');
  });

  describe('Story 19.5: New Block Validation', () => {
    it('should validate configurations with footer, about, faq, and features blocks', async () => {
      const configWithNewBlocks: HomepageConfig = {
        generationId: 'test-hotel-v1',
        timestamp: new Date().toISOString(),
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'business',
          brandPersonality: 'elegant',
          hotelName: 'Test Hotel',
          location: 'Paris, France'
        },
        components: [
          { type: 'navigation', variant: { style: 'glass' }, props: {}, order: 0 },
          { type: 'hero', variant: { style: 'elegant' }, props: { headline: 'Welcome' }, order: 1 },
          { type: 'about', variant: { layout: 'side-by-side', imagePosition: 'right' }, props: { heading: 'Our Story', content: 'A wonderful hotel...' }, order: 2 },
          { type: 'rooms', variant: { variant: 'detailed' }, props: { rooms: [] }, order: 3 },
          { type: 'features', variant: { layout: 'cards', columns: 3 }, props: { heading: 'Why Choose Us', features: [] }, order: 4 },
          { type: 'faq', variant: { layout: 'accordion' }, props: { heading: 'FAQ', questions: [] }, order: 5 },
          { type: 'footer', variant: { layout: 'classic' }, props: { hotelName: 'Test Hotel' }, order: 6 }
        ],
        layoutStructure: 'single-column',
        emphasisComponents: ['hero', 'features'],
        validationStatus: 'PASS'
      };

      const state: WorkflowState = {
        generationId: 'test-gen',
        hotelParameters: configWithNewBlocks.hotelParameters,
        assembledConfig: configWithNewBlocks,
        totalCost: 1.50,
        stepCosts: {},
        budgetRemaining: 0.50,
        currentAgent: 'AssemblyAgent',
        retryCount: 0,
        errors: [],
        validationStatus: 'pending',
        validationErrors: [],
        qualityScore: undefined,
        componentSelection: undefined,
        stylingSelection: undefined,
        contentGeneration: undefined,
      } as any;

      const result = await validator.performGeneration(state);

      expect(result.validationStatus).toBe('pass');
      expect(result.qualityScore).toBeGreaterThanOrEqual(90);
      expect(result.validationErrors).toHaveLength(0);
    });

    it('should reject configurations with invalid variants for new blocks', async () => {
      const configWithInvalidVariants: HomepageConfig = {
        generationId: 'test-hotel-v1',
        timestamp: new Date().toISOString(),
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'business',
          brandPersonality: 'elegant',
          hotelName: 'Test Hotel',
          location: 'Paris, France'
        },
        components: [
          { type: 'navigation', variant: { style: 'glass' }, props: {}, order: 0 },
          { type: 'hero', variant: { style: 'elegant' }, props: { headline: 'Welcome' }, order: 1 },
          { type: 'footer', variant: { layout: 'invalid-layout' }, props: { hotelName: 'Test Hotel' }, order: 2 },
          { type: 'rooms', variant: { variant: 'detailed' }, props: { rooms: [] }, order: 3 },
          { type: 'contact', variant: { style: 'default' }, props: { title: 'Contact' }, order: 4 }
        ],
        layoutStructure: 'single-column',
        emphasisComponents: ['hero'],
        validationStatus: 'PASS'
      };

      const state: WorkflowState = {
        assembledConfig: configWithInvalidVariants,
        totalCost: 1.00
      } as any;

      const result = await validator.performGeneration(state);

      expect(result.validationStatus).toBe('fail');
      expect(result.validationErrors?.some(err => err.includes('CVA Error') && err.includes('footer'))).toBe(true);
    });

    it('should reject configurations with invalid component types (including new blocks)', async () => {
      const configWithInvalidType: HomepageConfig = {
        generationId: 'test-hotel-v1',
        timestamp: new Date().toISOString(),
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'business',
          brandPersonality: 'elegant',
          hotelName: 'Test Hotel',
          location: 'Paris, France'
        },
        components: [
          { type: 'navigation', variant: { style: 'glass' }, props: {}, order: 0 },
          { type: 'hero', variant: { style: 'elegant' }, props: { headline: 'Welcome' }, order: 1 },
          // @ts-expect-error - Testing invalid component type
          { type: 'invalid-block-type', variant: {}, props: {}, order: 2 },
        ] as any,
        layoutStructure: 'single-column',
        emphasisComponents: ['hero'],
        validationStatus: 'PASS'
      };

      const state: WorkflowState = {
        assembledConfig: configWithInvalidType,
        totalCost: 1.00
      } as any;

      const result = await validator.performGeneration(state);

      expect(result.validationStatus).toBe('fail');
      expect(result.validationErrors?.some(err => err.includes('Zod Error'))).toBe(true);
    });
  });
});
