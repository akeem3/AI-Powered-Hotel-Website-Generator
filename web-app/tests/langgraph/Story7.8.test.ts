import { HomepageGenerationWorkflow } from '@/app/langgraph/workflows/HomepageGenerationWorkflow';
import { WorkflowState } from '@/app/langgraph/state/types';
import { ComponentSelector } from '@/app/langgraph/agents/ComponentSelector';
import { StylingAgent } from '@/app/langgraph/agents/StylingAgent';
import { ContentGenerator } from '@/app/langgraph/agents/ContentGenerator';
import { AssemblyAgent } from '@/app/langgraph/agents/AssemblyAgent';
import { QualityValidator } from '@/app/langgraph/agents/QualityValidator';

// Mock LangFuse
const mockTrace = {
  id: 'test-trace-id',
  generation: jest.fn().mockReturnValue({ end: jest.fn() }),
  update: jest.fn(),
  score: jest.fn(),
  event: jest.fn(),
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

describe('Story 7.8: Workflow Orchestration & Edge Routing', () => {
  let workflow: HomepageGenerationWorkflow;
  const hotelParameters = {
    hotelName: 'Grand Plaza',
    hotelType: 'luxury' as const,
    targetAudience: 'couples' as const,
    brandPersonality: 'elegant' as const,
    location: 'New York'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    workflow = new HomepageGenerationWorkflow();
    
    // Default mock behavior - success path
    (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({
      componentSelection: { selectedComponents: ['hero'], layoutStructure: 'standard', emphasisComponents: [], reasoning: 'test' },
      stepCosts: { ComponentSelector: 0.1 },
      totalCost: 0.1
    });
    (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
      stylingSelection: { componentVariants: {}, reasoning: 'test' },
      stepCosts: { StylingAgent: 0.1 },
      totalCost: 0.1
    });
    (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
      contentGeneration: { componentContent: {}, reasoning: 'test' },
      stepCosts: { ContentGenerator: 0.1 },
      totalCost: 0.1
    });
    (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
      assembledConfig: { 
        generationId: 'luxury-couples-v1',
        timestamp: new Date().toISOString(),
        hotelParameters: hotelParameters,
        components: [
          { type: 'navigation', variant: {}, props: {}, order: 0 },
          { type: 'hero', variant: {}, props: {}, order: 1 },
          { type: 'rooms', variant: {}, props: {}, order: 2 },
          { type: 'gallery', variant: {}, props: {}, order: 3 },
          { type: 'contact', variant: {}, props: {}, order: 4 },
        ],
        layoutStructure: 'mixed',
        emphasisComponents: [],
        validationStatus: 'PASS'
      },
      stepCosts: { AssemblyAgent: 0.1 },
      totalCost: 0.1
    });
    
    (QualityValidator.prototype.execute as jest.Mock).mockImplementation((state: WorkflowState) => {
      const hasErrors = (state.errors || []).length > 0;
      const budgetExceeded = state.budgetExceeded === true || (state.totalCost || 0) > 2.0;
      
      return Promise.resolve({
        validationStatus: (hasErrors || budgetExceeded) ? 'fail' : 'pass',
        qualityScore: (hasErrors || budgetExceeded) ? 50 : 95,
        validationErrors: hasErrors ? ['Mock Error'] : [],
        budgetExceeded,
        stepCosts: { QualityValidator: 0.01 },
        totalCost: 0.01
      });
    });
  });

  describe('AC6: invoke() method', () => {
    test('should execute full success path via invoke()', async () => {
      const result = await workflow.invoke({
        generationId: 'gen-success-1',
        hotelParameters
      });

      expect(result.validationStatus).toBe('pass');
      expect(result.budgetExceeded).toBe(false);
      expect(result.totalCost).toBeCloseTo(0.41, 2);
      expect(mockTrace.update).toHaveBeenCalled();
      expect(mockLangfuse.flush).toHaveBeenCalled();
    });
  });

  describe('Budget Checkpoints', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should terminate if budget exceeded after ComponentSelector', async () => {
      (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({
        componentSelection: {},
        totalCost: 0.5, // > 0.40 limit
        stepCosts: { ComponentSelector: 0.5 }
      });

      const invokePromise = workflow.invoke({
        generationId: 'gen-budget-1',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.budgetExceeded).toBe(true);
      // It should still move to QualityValidator? 
      // Actually in our graph, it flows sequentially. 
      // The budget check sets budgetExceeded: true, then it goes to next node.
      // The QualityValidator check is the one that routes to END if budgetExceeded is true.
      expect(result.validationStatus).toBe('fail'); // Assuming QualityValidator fails it
    });

    test('should terminate if budget exceeded after StylingAgent', async () => {
      (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
        stylingSelection: {},
        totalCost: 1.0, // > 0.80 limit
        stepCosts: { StylingAgent: 0.9 }
      });

      const invokePromise = workflow.invoke({
        generationId: 'gen-budget-2',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.budgetExceeded).toBe(true);
      expect(result.validationStatus).toBe('fail');
    });

    test('should terminate if budget exceeded after ContentGenerator', async () => {
      (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
        contentGeneration: {},
        totalCost: 1.7, // > 1.60 limit
        stepCosts: { ContentGenerator: 1.5 }
      });

      const invokePromise = workflow.invoke({
        generationId: 'gen-budget-3',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.budgetExceeded).toBe(true);
      expect(result.validationStatus).toBe('fail');
    });

    test('should terminate if budget exceeded after AssemblyAgent', async () => {
      (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
        assembledConfig: {},
        totalCost: 1.9, // > 1.80 limit
        stepCosts: { AssemblyAgent: 1.8 }
      });

      const invokePromise = workflow.invoke({
        generationId: 'gen-budget-4',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.budgetExceeded).toBe(true);
      expect(result.validationStatus).toBe('fail');
    });
  });

  describe('Retry Routing', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should retry if validation fails and then succeed', async () => {
      let validatorCalls = 0;
      (QualityValidator.prototype.execute as jest.Mock).mockImplementation(() => {
        validatorCalls++;
        if (validatorCalls === 1) {
          return Promise.resolve({
            validationStatus: 'fail',
            qualityScore: 70,
            validationErrors: ['test error'],
            budgetExceeded: false,
            stepCosts: { QualityValidator: 0.01 },
            totalCost: 0.01
          });
        }
        return Promise.resolve({
          validationStatus: 'pass',
          qualityScore: 95,
          validationErrors: [],
          budgetExceeded: false,
          stepCosts: { QualityValidator: 0.01 },
          totalCost: 0.01
        });
      });

      const invokePromise = workflow.invoke({
        generationId: 'gen-retry-1',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.validationStatus).toBe('pass');
      expect(result.retryCount).toBe(1);
      expect(validatorCalls).toBe(2);
    });

    test('should terminate after 3 retries', async () => {
      (QualityValidator.prototype.execute as jest.Mock).mockResolvedValue({
        validationStatus: 'fail',
        qualityScore: 50,
        validationErrors: ['always fail'],
        budgetExceeded: false,
        stepCosts: { QualityValidator: 0.01 },
        totalCost: 0.01
      });

      const invokePromise = workflow.invoke({
        generationId: 'gen-max-retry-1',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.retryCount).toBe(3);
      expect(result.validationStatus).toBe('fail');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should catch and log agent exceptions', async () => {
      (ComponentSelector.prototype.execute as jest.Mock).mockRejectedValue(new Error('LLM Down'));

      const invokePromise = workflow.invoke({
        generationId: 'gen-error-1',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.validationStatus).toBe('fail');
      expect(result.errors).toContainEqual({ agent: 'ComponentSelector', error: 'LLM Down' });
      expect(mockTrace.event).toHaveBeenCalledWith(expect.objectContaining({
        name: 'error'
      }));
    });

    test('should catch StylingAgent exceptions', async () => {
      (StylingAgent.prototype.execute as jest.Mock).mockRejectedValue(new Error('Styling LLM Failed'));

      const invokePromise = workflow.invoke({
        generationId: 'gen-error-styling',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.validationStatus).toBe('fail');
      expect(result.errors).toContainEqual({ agent: 'StylingAgent', error: 'Styling LLM Failed' });
    });

    test('should catch ContentGenerator exceptions', async () => {
      (ContentGenerator.prototype.execute as jest.Mock).mockRejectedValue(new Error('Content LLM Failed'));

      const invokePromise = workflow.invoke({
        generationId: 'gen-error-content',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.validationStatus).toBe('fail');
      expect(result.errors).toContainEqual({ agent: 'ContentGenerator', error: 'Content LLM Failed' });
    });

    test('should catch AssemblyAgent exceptions', async () => {
      (AssemblyAgent.prototype.execute as jest.Mock).mockRejectedValue(new Error('Assembly Failed'));

      const invokePromise = workflow.invoke({
        generationId: 'gen-error-assembly',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.validationStatus).toBe('fail');
      expect(result.errors).toContainEqual({ agent: 'AssemblyAgent', error: 'Assembly Failed' });
    });

    test('should catch QualityValidator exceptions', async () => {
      (QualityValidator.prototype.execute as jest.Mock).mockRejectedValue(new Error('Validation Failed'));

      const invokePromise = workflow.invoke({
        generationId: 'gen-error-validator',
        hotelParameters
      });

      await jest.runAllTimersAsync();

      const result = await invokePromise;

      expect(result.validationStatus).toBe('fail');
      expect(result.errors).toContainEqual({ agent: 'QualityValidator', error: 'Validation Failed' });
    });
  });

  describe('Additional Methods', () => {
    test('execute() method should return finalState and checkpointId', async () => {
      const initialState: WorkflowState = {
        generationId: 'gen-exec-1',
        hotelParameters,
        totalCost: 0,
        stepCosts: {},
        budgetRemaining: 2.0,
        retryCount: 0,
        validationStatus: 'pending',
        validationErrors: [],
        errors: [],
        budgetExceeded: false,
      } as unknown as WorkflowState;

      const result = await workflow.execute(initialState);

      expect(result).toHaveProperty('finalState');
      expect(result).toHaveProperty('checkpointId');
      expect(result.finalState.validationStatus).toBe('pass');
      expect(typeof result.checkpointId).toBe('string');
    });

    test('executeStream() method should yield node and workflow events', async () => {
      const initialState: WorkflowState = {
        generationId: 'gen-stream-1',
        hotelParameters,
        totalCost: 0,
        stepCosts: {},
        budgetRemaining: 2.0,
        retryCount: 0,
        validationStatus: 'pending',
        validationErrors: [],
        errors: [],
        budgetExceeded: false,
      } as unknown as WorkflowState;

      const events = [];
      for await (const event of workflow.executeStream(initialState)) {
        events.push(event);
      }

      // Should have 5 node_start events, 5 node_complete events, and 1 workflow_complete event
      expect(events.length).toBe(11);

      // Check first node_start event
      expect(events[0].type).toBe('node_start');
      expect(events[0].node).toBe('componentSelector');

      // Check last event is workflow_complete
      expect(events[events.length - 1].type).toBe('workflow_complete');
      expect(events[events.length - 1].checkpointId).toContain('final');
    });

    test('getStats() method should return workflow statistics', () => {
      const stats = workflow.getStats();

      expect(stats).toHaveProperty('nodeCount');
      expect(stats).toHaveProperty('persistenceStats');
      expect(stats.nodeCount).toBe(5);
      expect(typeof stats.persistenceStats).toBe('object');
    });
  });
});
