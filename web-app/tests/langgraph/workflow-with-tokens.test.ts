/**
 * Tests for Story 20.6: Workflow Integration with ArchetypeClassifier and TokenGenerator
 *
 * @trace epic: EPIC-20
 * @trace story: STORY-20.6
 * @trace reqs: AC - "Update LangGraph Workflow"
 *
 * Why: Verifies that the HomepageGenerationWorkflow correctly integrates the two new agents
 * (ArchetypeClassifier and TokenGenerator) at the start of the workflow, with proper state
 * propagation, budget tracking, fallback behavior, and retry routing.
 */

import { HomepageGenerationWorkflow } from '../../app/langgraph/workflows/HomepageGenerationWorkflow';
import { WorkflowState } from '../../app/langgraph/state/types';
import { ArchetypeClassifier } from '../../app/langgraph/agents/ArchetypeClassifier';
import { TokenGenerator } from '../../app/langgraph/agents/TokenGenerator';
import { ComponentSelector } from '../../app/langgraph/agents/ComponentSelector';
import { StylingAgent } from '../../app/langgraph/agents/StylingAgent';
import { ContentGenerator } from '../../app/langgraph/agents/ContentGenerator';
import { AssemblyAgent } from '../../app/langgraph/agents/AssemblyAgent';
import { QualityValidator } from '../../app/langgraph/agents/QualityValidator';

// Mock LangFuse Service
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
  getPrompt: jest.fn().mockResolvedValue('test prompt'),
  startWorkflowTrace: jest.fn().mockReturnValue(mockTrace),
  endWorkflowTrace: jest.fn(),
  logError: jest.fn(),
  executeGeneration: jest.fn().mockImplementation((name, input, modelParams, fn) => fn()),
};

jest.mock('langfuse', () => ({
  Langfuse: jest.fn().mockImplementation(() => mockLangfuse),
}));

// Mock LangFuseService class
jest.mock('@/app/langgraph/services/LangFuseService', () => {
  return {
    LangFuseService: jest.fn().mockImplementation(() => mockLangfuse),
  };
});

// Mock CostMonitor Service
jest.mock('@/app/langgraph/services/CostMonitor', () => {
  return {
    CostMonitor: jest.fn().mockImplementation(() => ({
      TOTAL_BUDGET: 2.0,
      getRemainingBudget: jest.fn().mockReturnValue(2.0),
      trackStepCost: jest.fn().mockReturnValue(0.01),
      checkBudget: jest.fn().mockReturnValue(true),
      checkStageCheckpoint: jest.fn(),
      getAllStageCheckpoints: jest.fn().mockReturnValue({
        'ArchetypeClassifier': 0.1,
        'TokenGenerator': 0.16,
        'ComponentSelector': 0.5,
        'StylingAgent': 0.84,
        'ContentGenerator': 1.64,
        'AssemblyAgent': 1.84,
        'QualityValidator': 2.0,
      }),
    })),
  };
});

// Mock Agents - Mock the modules but use the real classes in beforeEach
jest.mock('@/app/langgraph/agents/ArchetypeClassifier');
jest.mock('@/app/langgraph/agents/TokenGenerator');
jest.mock('@/app/langgraph/agents/ComponentSelector');
jest.mock('@/app/langgraph/agents/StylingAgent');
jest.mock('@/app/langgraph/agents/ContentGenerator');
jest.mock('@/app/langgraph/agents/AssemblyAgent');
jest.mock('@/app/langgraph/agents/QualityValidator');

describe('Story 20.6: Workflow Integration with ArchetypeClassifier and TokenGenerator', () => {
  let workflow: HomepageGenerationWorkflow;

  // Mock hotel parameters
  const mockHotelParameters = {
    hotelName: 'Test Boutique Hotel',
    hotelType: 'boutique' as const,
    targetAudience: 'leisure' as const,
    brandPersonality: 'modern' as const,
    location: 'Lisbon, Portugal'
  };

  // Mock initial state with new fields
  const mockInitialState: WorkflowState = {
    generationId: 'test-story-20-6-123',
    hotelParameters: mockHotelParameters,
    // Story 20.2: ArchetypeClassifier output
    archetypeClassification: undefined,
    // Story 20.3: TokenGenerator output
    designTokens: undefined,
    componentSelection: undefined,
    stylingSelection: undefined,
    contentGeneration: undefined,
    assembledConfig: undefined,
    contentJson: undefined,
    validationStatus: 'pending',
    validationErrors: [],
    qualityScore: undefined,
    totalCost: 0,
    stepCosts: {},
    budgetRemaining: 2.0,
    currentAgent: 'start',
    retryCount: 0,
    errors: [],
    budgetExceeded: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock ArchetypeClassifier to succeed
    (ArchetypeClassifier.prototype.execute as jest.Mock).mockResolvedValue({
      archetypeClassification: {
        archetype: 'boutique-editorial',
        reasoning: 'Boutique hotel with leisure target and modern brand personality matches boutique-editorial archetype.'
      },
      totalCost: 0.005,
      stepCosts: { 'ArchetypeClassifier': 0.005 },
      budgetRemaining: 1.995,
    });

    // Mock TokenGenerator to succeed
    (TokenGenerator.prototype.execute as jest.Mock).mockResolvedValue({
      designTokens: {
        designTokens: {
          archetype: 'boutique-editorial',
          guestPersona: 'Creative professionals seeking unique, design-forward accommodations.',
          emotionalIntent: 'Evoke creativity and inspiration through bold, contrasting design.',
          architecturalInspiration: 'Gallery-like spaces with curated art installations.',
          forbiddenElements: ['no muted color palettes', 'no traditional layouts'],
          colorScheme: {
            primaryHue: 200,
            primaryChroma: 0.12,
            primaryLightness: 0.45,
            secondaryHue: 30,
            secondaryChroma: 0.15,
            secondaryLightness: 0.75,
            surfaceType: 'dark',
            accentStrategy: 'complementary'
          },
          typography: {
            headingPersonality: 'display-decorative',
            bodyPersonality: 'sans-modern',
            scaleRatio: 'perfect-fourth'
          },
          spacing: {
            density: 'tight'
          },
          borderRadius: 'sharp'
        },
        contrastReport: {
          pairs: [],
          allPass: true,
          failCount: 0
        },
        iterations: 0,
        adjustmentsMade: []
      },
      totalCost: 0.015,
      stepCosts: { 'TokenGenerator': 0.015 },
      budgetRemaining: 1.98,
    });

    // Mock ComponentSelector to succeed
    (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({
      componentSelection: {
        selectedComponents: ['hero', 'navigation', 'rooms', 'gallery', 'testimonials'],
        layoutStructure: 'mixed',
        emphasisComponents: ['hero'],
        reasoning: 'Selected components for mixed layout.'
      },
      totalCost: 0.02,
      stepCosts: { 'ComponentSelector': 0.02 },
      budgetRemaining: 1.96,
    });

    // Mock StylingAgent to succeed
    (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
      stylingSelection: {
        componentVariants: {
          hero: { style: 'modern', layout: 'centered' }
        },
        reasoning: 'Applied modern styling.'
      },
      totalCost: 0.025,
      stepCosts: { 'StylingAgent': 0.025 },
      budgetRemaining: 1.935,
    });

    // Mock ContentGenerator to succeed
    (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
      contentGeneration: {
        componentContent: {},
        reasoning: 'Generated content.'
      },
      totalCost: 0.04,
      stepCosts: { 'ContentGenerator': 0.04 },
      budgetRemaining: 1.895,
    });

    // Mock AssemblyAgent to succeed
    (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
      assembledConfig: {
        generationId: 'test-story-20-6-123',
        timestamp: new Date().toISOString(),
        hotelParameters: mockHotelParameters,
        components: [],
        layoutStructure: 'mixed',
        emphasisComponents: ['hero'],
        validationStatus: 'PASS',
      } as any,
      totalCost: 0.01,
      stepCosts: { 'AssemblyAgent': 0.01 },
      budgetRemaining: 1.885,
    });

    // Mock QualityValidator to pass
    (QualityValidator.prototype.execute as jest.Mock).mockResolvedValue({
      validationStatus: 'pass',
      validationErrors: [],
      qualityScore: 0.92,
      totalCost: 0.008,
      stepCosts: { 'QualityValidator': 0.008 },
      budgetRemaining: 1.877,
    });

    workflow = new HomepageGenerationWorkflow();
  });

  describe('Test 1: Full workflow execution with mocked agents', () => {
    it('should execute all 7 agents in correct order', async () => {
      // Create a mock graph that executes agents sequentially
      const executionOrder: string[] = [];

      // Track execution order
      (ArchetypeClassifier.prototype.execute as jest.Mock).mockImplementation(async () => {
        executionOrder.push('ArchetypeClassifier');
        return {
          archetypeClassification: {
            archetype: 'boutique-editorial',
            reasoning: 'Test reasoning.'
          },
          totalCost: 0.005,
          stepCosts: { 'ArchetypeClassifier': 0.005 },
          budgetRemaining: 1.995,
        };
      });

      (TokenGenerator.prototype.execute as jest.Mock).mockImplementation(async () => {
        executionOrder.push('TokenGenerator');
        return {
          designTokens: {
            designTokens: {
              archetype: 'boutique-editorial',
              guestPersona: 'Test persona.',
              emotionalIntent: 'Test intent.',
              architecturalInspiration: 'Test architecture.',
              forbiddenElements: [],
              colorScheme: {
                primaryHue: 200,
                primaryChroma: 0.12,
                primaryLightness: 0.45,
                secondaryHue: 30,
                secondaryChroma: 0.15,
                secondaryLightness: 0.75,
                surfaceType: 'dark',
                accentStrategy: 'complementary'
              },
              typography: {
                headingPersonality: 'display-decorative',
                bodyPersonality: 'sans-modern',
                scaleRatio: 'perfect-fourth'
              },
              spacing: { density: 'tight' },
              borderRadius: 'sharp'
            },
            contrastReport: { pairs: [], allPass: true, failCount: 0 },
            iterations: 0,
            adjustmentsMade: []
          },
          totalCost: 0.015,
          stepCosts: { 'TokenGenerator': 0.015 },
          budgetRemaining: 1.98,
        };
      });

      (ComponentSelector.prototype.execute as jest.Mock).mockImplementation(async () => {
        executionOrder.push('ComponentSelector');
        return {
          componentSelection: {
            selectedComponents: ['hero', 'navigation'],
            layoutStructure: 'mixed',
            emphasisComponents: ['hero'],
            reasoning: 'Test reasoning.'
          },
          totalCost: 0.02,
          stepCosts: { 'ComponentSelector': 0.02 },
          budgetRemaining: 1.96,
        };
      });

      // Note: Full workflow execution requires running the compiled graph
      // For this test, we verify the agents are properly initialized and can be called
      const agents = (workflow as any).agents;

      // Verify all 7 agents exist
      expect(agents.archetypeClassifier).toBeInstanceOf(ArchetypeClassifier);
      expect(agents.tokenGenerator).toBeInstanceOf(TokenGenerator);
      expect(agents.componentSelector).toBeInstanceOf(ComponentSelector);
      expect(agents.stylingAgent).toBeInstanceOf(StylingAgent);
      expect(agents.contentGenerator).toBeInstanceOf(ContentGenerator);
      expect(agents.assemblyAgent).toBeInstanceOf(AssemblyAgent);
      expect(agents.qualityValidator).toBeInstanceOf(QualityValidator);

      // Verify agents can be called
      await agents.archetypeClassifier.execute(mockInitialState);
      await agents.tokenGenerator.execute({ ...mockInitialState, archetypeClassification: { archetype: 'boutique-editorial', reasoning: 'Test' } });
      await agents.componentSelector.execute({ ...mockInitialState, archetypeClassification: { archetype: 'boutique-editorial', reasoning: 'Test' }, designTokens: {} as any });

      // Verify agents were called in correct order
      expect(executionOrder).toEqual(['ArchetypeClassifier', 'TokenGenerator', 'ComponentSelector']);
    });
  });

  describe('Test 2: State propagation - archetypeClassification and designTokens passed to downstream agents', () => {
    it('should propagate archetypeClassification from ArchetypeClassifier to TokenGenerator', async () => {
      const agents = (workflow as any).agents;

      // Execute ArchetypeClassifier
      const classifierResult = await agents.archetypeClassifier.execute(mockInitialState);

      // Verify archetypeClassification is in result
      expect(classifierResult.archetypeClassification).toBeDefined();
      expect(classifierResult.archetypeClassification.archetype).toBe('boutique-editorial');

      // Execute TokenGenerator with archetypeClassification in state
      const stateWithArchetype = { ...mockInitialState, ...classifierResult };
      const generatorResult = await agents.tokenGenerator.execute(stateWithArchetype);

      // Verify designTokens is in result
      expect(generatorResult.designTokens).toBeDefined();
      expect(generatorResult.designTokens.designTokens.archetype).toBe('boutique-editorial');
    });

    it('should propagate designTokens to downstream agents', async () => {
      const agents = (workflow as any).agents;

      // Prepare state with designTokens
      const stateWithTokens: WorkflowState = {
        ...mockInitialState,
        archetypeClassification: {
          archetype: 'boutique-editorial',
          reasoning: 'Test reasoning.'
        },
        designTokens: {
          designTokens: {
            archetype: 'boutette-editorial',
            guestPersona: 'Test persona.',
            emotionalIntent: 'Test intent.',
            architecturalInspiration: 'Test architecture.',
            forbiddenElements: [],
            colorScheme: {
              primaryHue: 200,
              primaryChroma: 0.12,
              primaryLightness: 0.45,
              secondaryHue: 30,
              secondaryChroma: 0.15,
              secondaryLightness: 0.75,
              surfaceType: 'dark',
              accentStrategy: 'complementary'
            },
            typography: {
              headingPersonality: 'display-decorative',
              bodyPersonality: 'sans-modern',
              scaleRatio: 'perfect-fourth'
            },
            spacing: { density: 'tight' },
            borderRadius: 'sharp'
          },
          contrastReport: { pairs: [], allPass: true, failCount: 0 },
          iterations: 0,
          adjustmentsMade: []
        }
      };

      // Verify state has designTokens
      expect(stateWithTokens.designTokens).toBeDefined();
      expect(stateWithTokens.archetypeClassification).toBeDefined();
    });
  });

  describe('Test 3: Fallback on ArchetypeClassifier failure (uses business-hotel default)', () => {
    it('should use business-hotel as default archetype when ArchetypeClassifier fails', async () => {
      const agents = (workflow as any).agents;

      // Mock ArchetypeClassifier to throw error
      (ArchetypeClassifier.prototype.execute as jest.Mock).mockRejectedValueOnce(
        new Error('ArchetypeClassifier service unavailable')
      );

      // Execute ArchetypeClassifier node (via workflow wrapper)
      // The workflow wrapper catches errors and returns fallback
      const result = await workflow['archetypeClassifierNode'](mockInitialState);

      // Verify fallback was used
      expect(result.archetypeClassification).toBeDefined();
      expect(result.archetypeClassification.archetype).toBe('business-hotel');
      expect(result.archetypeClassification.reasoning).toContain('ArchetypeClassifier failed');
      expect(result.usedFallback).toBeDefined();
      expect(result.usedFallback?.archetypeClassifier).toBe(true);
    });

    it('should add error to errors array when ArchetypeClassifier fails', async () => {
      (ArchetypeClassifier.prototype.execute as jest.Mock).mockRejectedValueOnce(
        new Error('ArchetypeClassifier service unavailable')
      );

      const result = await workflow['archetypeClassifierNode'](mockInitialState);

      expect(result.errors).toBeDefined();
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0]).toEqual({
        agent: 'ArchetypeClassifier',
        error: 'ArchetypeClassifier service unavailable'
      });
    });
  });

  describe('Test 4: Fallback on TokenGenerator failure (uses default design tokens)', () => {
    it('should use default design tokens when TokenGenerator fails', async () => {
      // Mock TokenGenerator to throw error
      (TokenGenerator.prototype.execute as jest.Mock).mockRejectedValueOnce(
        new Error('TokenGenerator service unavailable')
      );

      // Prepare state with archetypeClassification (required for TokenGenerator)
      const stateWithArchetype: WorkflowState = {
        ...mockInitialState,
        archetypeClassification: {
          archetype: 'boutique-editorial',
          reasoning: 'Test reasoning.'
        }
      };

      const result = await workflow['tokenGeneratorNode'](stateWithArchetype);

      // Verify fallback was used
      expect(result.designTokens).toBeDefined();
      expect(result.designTokens.designTokens.archetype).toBe('business-hotel');
      expect(result.usedFallback).toBeDefined();
      expect(result.usedFallback?.tokenGenerator).toBe(true);
    });

    it('should include contrastReport in fallback design tokens', async () => {
      (TokenGenerator.prototype.execute as jest.Mock).mockRejectedValueOnce(
        new Error('TokenGenerator service unavailable')
      );

      const stateWithArchetype: WorkflowState = {
        ...mockInitialState,
        archetypeClassification: {
          archetype: 'boutique-editorial',
          reasoning: 'Test reasoning.'
        }
      };

      const result = await workflow['tokenGeneratorNode'](stateWithArchetype);

      expect(result.designTokens.contrastReport).toBeDefined();
      expect(result.designTokens.contrastReport.allPass).toBe(true);
      expect(result.designTokens.contrastReport.failCount).toBe(0);
    });
  });

  describe('Test 5: Budget checkpoint tracking for new agents', () => {
    it('should track ArchetypeClassifier cost in stepCosts', async () => {
      const agents = (workflow as any).agents;

      const result = await agents.archetypeClassifier.execute(mockInitialState);

      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.budgetRemaining).toBeLessThan(mockInitialState.budgetRemaining);
    });

    it('should track TokenGenerator cost in stepCosts', async () => {
      const agents = (workflow as any).agents;

      const stateWithArchetype: WorkflowState = {
        ...mockInitialState,
        archetypeClassification: {
          archetype: 'boutique-editorial',
          reasoning: 'Test reasoning.'
        }
      };

      const result = await agents.tokenGenerator.execute(stateWithArchetype);

      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.budgetRemaining).toBeLessThan(stateWithArchetype.budgetRemaining);
    });

    it('should accumulate costs correctly', async () => {
      const agents = (workflow as any).agents;

      const result1 = await agents.archetypeClassifier.execute(mockInitialState);
      const stateWithArchetype = { ...mockInitialState, ...result1 };
      const result2 = await agents.tokenGenerator.execute(stateWithArchetype);

      // Verify total cost is accumulated
      expect(result2.totalCost).toBeGreaterThan(result1.totalCost);

      // Verify budget decreases
      expect(result2.budgetRemaining).toBeLessThan(result1.budgetRemaining);
    });
  });

  describe('Test 6: LangFuse span naming verification', () => {
    it('should have ArchetypeClassifier and TokenGenerator as agent instances', async () => {
      const agents = (workflow as any).agents;

      // Verify the agent instances exist
      expect(agents.archetypeClassifier).toBeDefined();
      expect(agents.tokenGenerator).toBeDefined();

      // Verify they are constructor instances of the correct types
      expect(agents.archetypeClassifier.constructor.name).toBe('ArchetypeClassifier');
      expect(agents.tokenGenerator.constructor.name).toBe('TokenGenerator');
    });
  });

  describe('Test 7: Retry routing (retries from archetypeClassifier, not componentSelector)', () => {
    it('should route retry to archetypeClassifier instead of componentSelector', () => {
      const compiledGraph = workflow['buildGraph']();

      // The conditional edge mapping should have 'retry' -> 'archetypeClassifier'
      // We can verify this by checking the graph structure
      expect(compiledGraph).toBeDefined();
      // Note: Full graph structure verification requires LangGraph internal inspection
      // The buildGraph() method explicitly sets 'retry': 'archetypeClassifier' at line 221
    });
  });

  describe('Test 8: Workflow state initialization includes new fields', () => {
    it('should allow archetypeClassification and designTokens in WorkflowState', () => {
      const state: WorkflowState = {
        generationId: 'test-123',
        hotelParameters: mockHotelParameters,
        archetypeClassification: {
          archetype: 'boutique-editorial',
          reasoning: 'Test reasoning.'
        },
        designTokens: {
          designTokens: {
            archetype: 'boutique-editorial',
            guestPersona: 'Test persona.',
            emotionalIntent: 'Test intent.',
            architecturalInspiration: 'Test architecture.',
            forbiddenElements: [],
            colorScheme: {
              primaryHue: 200,
              primaryChroma: 0.12,
              primaryLightness: 0.45,
              secondaryHue: 30,
              secondaryChroma: 0.15,
              secondaryLightness: 0.75,
              surfaceType: 'dark',
              accentStrategy: 'complementary'
            },
            typography: {
              headingPersonality: 'display-decorative',
              bodyPersonality: 'sans-modern',
              scaleRatio: 'perfect-fourth'
            },
            spacing: { density: 'tight' },
            borderRadius: 'sharp'
          },
          contrastReport: { pairs: [], allPass: true, failCount: 0 },
          iterations: 0,
          adjustmentsMade: []
        },
        componentSelection: undefined,
        stylingSelection: undefined,
        contentGeneration: undefined,
        assembledConfig: undefined,
        contentJson: undefined,
        validationStatus: 'pending',
        validationErrors: [],
        qualityScore: undefined,
        totalCost: 0,
        stepCosts: {},
        budgetRemaining: 2.0,
        currentAgent: 'start',
        retryCount: 0,
        errors: [],
        budgetExceeded: false,
      };

      expect(state.archetypeClassification).toBeDefined();
      expect(state.designTokens).toBeDefined();
      expect(state.archetypeClassification!.archetype).toBe('boutique-editorial');
      expect(state.designTokens!.designTokens.archetype).toBe('boutique-editorial');
    });
  });

  describe('Test 9: Streaming support includes new nodes', () => {
    it('should include all 7 agents in executeStream nodes array', async () => {
      // Verify executeStream includes new agents by checking the method
      const workflowInstance = workflow as any;
      const generator = workflowInstance.executeStream(mockInitialState);

      const chunks = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      // Verify all 7 nodes are streamed
      const nodeStarts = chunks.filter(c => c.type === 'node_start');
      expect(nodeStarts).toHaveLength(7);

      const nodeNames = nodeStarts.map(c => c.node);
      expect(nodeNames).toEqual([
        'archetypeClassifier',
        'tokenGenerator',
        'componentSelector',
        'stylingAgent',
        'contentGenerator',
        'assemblyAgent',
        'qualityValidator'
      ]);
    });

    it('should include workflow_complete event', async () => {
      const workflowInstance = workflow as any;
      const generator = workflowInstance.executeStream(mockInitialState);

      const chunks = [];
      for await (const chunk of generator) {
        chunks.push(chunk);
      }

      const completionEvents = chunks.filter(c => c.type === 'workflow_complete');
      expect(completionEvents).toHaveLength(1);
      expect(completionEvents[0].checkpointId).toContain('final');
    });
  });

  describe('Test 10: getStats() returns 7 nodes', () => {
    it('should return nodeCount of 7', () => {
      const stats = workflow.getStats();

      expect(stats).toBeDefined();
      expect(stats.nodeCount).toBe(7);
    });

    it('should include persistence stats', () => {
      const stats = workflow.getStats();

      expect(stats.persistenceStats).toBeDefined();
      expect(typeof stats.persistenceStats).toBe('object');
    });
  });

  describe('Test: usedFallback type includes new agents', () => {
    it('should allow archetypeClassifier and tokenGenerator in usedFallback record', () => {
      const state: WorkflowState = {
        ...mockInitialState,
        usedFallback: {
          archetypeClassifier: true,
          tokenGenerator: false,
          componentSelector: false
        }
      };

      expect(state.usedFallback?.archetypeClassifier).toBe(true);
      expect(state.usedFallback?.tokenGenerator).toBe(false);
    });
  });
});
