import { HomepageGenerationWorkflow } from '../../app/langgraph/workflows/HomepageGenerationWorkflow';
import { WorkflowState } from '../../app/langgraph/state/types';
import { END } from '@langchain/langgraph';

// Mock all agents
jest.mock('../../app/langgraph/agents/ComponentSelector');
jest.mock('../../app/langgraph/agents/StylingAgent');
jest.mock('../../app/langgraph/agents/ContentGenerator');
jest.mock('../../app/langgraph/agents/AssemblyAgent');
jest.mock('../../app/langgraph/agents/QualityValidator');

// Mock LangFuse
const mockTrace = {
  id: 'test-trace-id',
  generation: jest.fn().mockReturnValue({ end: jest.fn() }),
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

import { ComponentSelector } from '../../app/langgraph/agents/ComponentSelector';
import { StylingAgent } from '../../app/langgraph/agents/StylingAgent';
import { ContentGenerator } from '../../app/langgraph/agents/ContentGenerator';
import { AssemblyAgent } from '../../app/langgraph/agents/AssemblyAgent';
import { QualityValidator } from '../../app/langgraph/agents/QualityValidator';

describe('Workflow Retry Integration', () => {
  let workflow: HomepageGenerationWorkflow;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock setTimeout to avoid delays in tests
    jest.useFakeTimers();

    workflow = new HomepageGenerationWorkflow();

    // Default success for preceding agents
    (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({});
    (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({});
    (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({});
    (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should retry from ComponentSelector when QualityValidator fails', async () => {
    // Failing first, then passing
    (QualityValidator.prototype.execute as jest.Mock)
      .mockResolvedValueOnce({ validationStatus: 'fail' })
      .mockResolvedValueOnce({ validationStatus: 'pass' });

    const initialState: WorkflowState = {
      generationId: 'test-gen',
      hotelParameters: { hotelName: 'Test' },
      retryCount: 0
    } as any;

    const executePromise = workflow.execute(initialState);

    // Fast-forward through retry delays
    await jest.runAllTimersAsync();

    const { finalState } = await executePromise;

    // Should have called all agents twice (except QualityValidator stopped after second)
    expect(ComponentSelector.prototype.execute).toHaveBeenCalledTimes(2);
    expect(QualityValidator.prototype.execute).toHaveBeenCalledTimes(2);
    expect(finalState.validationStatus).toBe('pass');
    expect(finalState.retryCount).toBe(1);
  });

  it('should terminate after 3 retries', async () => {
    // Always failing
    (QualityValidator.prototype.execute as jest.Mock).mockResolvedValue({ validationStatus: 'fail' });

    const initialState: WorkflowState = {
      generationId: 'test-gen',
      hotelParameters: { hotelName: 'Test' },
      retryCount: 0
    } as any;

    const executePromise = workflow.execute(initialState);

    // Fast-forward through retry delays
    await jest.runAllTimersAsync();

    const { finalState } = await executePromise;

    // Step 1: QV sees 0, fails -> returns retryCount: 1. ConditionalEdge sees 1. Routes to retry.
    // Step 2 (Retry 1): QV sees 1, fails -> returns retryCount: 2. ConditionalEdge sees 2. Routes to retry.
    // Step 3 (Retry 2): QV sees 2, fails -> returns retryCount: 3. ConditionalEdge sees 3. Routes to END.

    // So 3 attempts total (Initial + 2 retries) if we use >= 3.

    expect(QualityValidator.prototype.execute).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(finalState.retryCount).toBe(3);
    expect(finalState.validationStatus).toBe('fail');
  });
});
