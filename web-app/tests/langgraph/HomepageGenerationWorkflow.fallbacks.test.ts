/**
 * Tests for Homepage Generation Workflow Graceful Degradation Fallbacks
 *
 * @trace epic: EPIC-13
 * @trace story: STORY-13.3.1
 * @trace reqs: AC2b, AC2c, AC3c
 *
 * Why: Verifies that the workflow degrades gracefully when agents fail,
 * using fallback strategies instead of all-or-nothing termination.
 */

import { HomepageGenerationWorkflow } from '@/app/langgraph/workflows/HomepageGenerationWorkflow';
import { WorkflowState } from '../../app/langgraph/state/types';
import { ComponentSelector } from '../../app/langgraph/agents/ComponentSelector';
import { StylingAgent } from '../../app/langgraph/agents/StylingAgent';
import { ContentGenerator } from '../../app/langgraph/agents/ContentGenerator';
import { AssemblyAgent } from '../../app/langgraph/agents/AssemblyAgent';
import { QualityValidator } from '../../app/langgraph/agents/QualityValidator';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';

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

describe('HomepageGenerationWorkflow - Graceful Degradation Fallbacks', () => {
  let workflow: HomepageGenerationWorkflow;
  const mockInitialState: WorkflowState = {
    generationId: 'test-fallback-123',
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
    contentJson: undefined,
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

  beforeEach(() => {
    jest.clearAllMocks();
    workflow = new HomepageGenerationWorkflow();

    // Default: QualityValidator passes
    (QualityValidator.prototype.execute as jest.Mock).mockResolvedValue({
      validationStatus: 'pass',
      qualityScore: 80,
      validationErrors: [],
      stepCosts: { QualityValidator: 0.01 },
      totalCost: 0.01
    });
  });

  describe('AC2b: ComponentSelector Fallback', () => {
    test('should use BASE_COMPONENTS when ComponentSelector fails', async () => {
      // Mock ComponentSelector to fail
      (ComponentSelector.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('ComponentSelector LLM timeout')
      );

      // Other agents succeed
      (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
        stylingSelection: { theme: 'modern' },
        stepCosts: { StylingAgent: 0.01 },
        totalCost: 0.01
      });

      (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
        contentGeneration: { homepage: {} },
        stepCosts: { ContentGenerator: 0.01 },
        totalCost: 0.01
      });

      (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
        assembledConfig: { generationId: 'test', timestamp: new Date().toISOString() },
        stepCosts: { AssemblyAgent: 0.01 },
        totalCost: 0.01
      });

      const { finalState } = await workflow.execute(mockInitialState);

      // Should have base components fallback
      expect(finalState.componentSelection).toBeDefined();
      expect(finalState.componentSelection).toEqual({
        sections: ['HeroSection', 'RoomsSection', 'AmenitiesSection', 'TestimonialsSection', 'ContactSection'],
        navigation: 'NavigationDesktop',
        footer: 'Footer'
      });

      // Should track fallback usage
      expect(finalState.usedFallback).toBeDefined();
      expect(finalState.usedFallback?.componentSelector).toBe(true);

      // Should record error
      expect(finalState.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            agent: 'ComponentSelector',
            error: expect.stringContaining('ComponentSelector LLM timeout')
          })
        ])
      );

      // Workflow should complete successfully (not fail)
      expect(finalState.validationStatus).toBe('pass');
    });
  });

  describe('AC2b: StylingAgent Fallback', () => {
    test('should use DEFAULT_STYLING when StylingAgent fails', async () => {
      // ComponentSelector succeeds
      (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({
        componentSelection: { sections: ['HeroSection'] },
        stepCosts: { ComponentSelector: 0.01 },
        totalCost: 0.01
      });

      // Mock StylingAgent to fail
      (StylingAgent.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('StylingAgent API error')
      );

      // Other agents succeed
      (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
        contentGeneration: { homepage: {} },
        stepCosts: { ContentGenerator: 0.01 },
        totalCost: 0.01
      });

      (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
        assembledConfig: { generationId: 'test', timestamp: new Date().toISOString() },
        stepCosts: { AssemblyAgent: 0.01 },
        totalCost: 0.01
      });

      const { finalState } = await workflow.execute(mockInitialState);

      // Should have default styling fallback
      expect(finalState.stylingSelection).toBeDefined();
      expect(finalState.stylingSelection).toEqual({
        variants: {
          hero: { layout: 'centered', overlay: 'gradient' },
          rooms: { layout: 'grid', columns: 3 },
          amenities: { layout: 'grid', columns: 4 },
          testimonials: { layout: 'carousel' }
        },
        theme: {
          primary: 'oklch(0.346 0.074 256)',
          secondary: 'oklch(0.748 0.099 86.1)'
        }
      });

      // Should track fallback usage
      expect(finalState.usedFallback?.stylingAgent).toBe(true);

      // Should record error
      expect(finalState.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            agent: 'StylingAgent',
            error: expect.stringContaining('StylingAgent API error')
          })
        ])
      );

      // Workflow should complete successfully
      expect(finalState.validationStatus).toBe('pass');
    });
  });

  describe('AC2c, AC3c: ContentGenerator Fallback', () => {
    test('should use CONTENT_DEFAULTS when ContentGenerator fails', async () => {
      // ComponentSelector and StylingAgent succeed
      (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({
        componentSelection: { sections: ['HeroSection'] },
        stepCosts: { ComponentSelector: 0.01 },
        totalCost: 0.01
      });

      (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
        stylingSelection: { theme: 'modern' },
        stepCosts: { StylingAgent: 0.01 },
        totalCost: 0.01
      });

      // Mock ContentGenerator to fail
      (ContentGenerator.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('ContentGenerator timeout')
      );

      // AssemblyAgent succeeds
      (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
        assembledConfig: { generationId: 'test', timestamp: new Date().toISOString() },
        stepCosts: { AssemblyAgent: 0.01 },
        totalCost: 0.01
      });

      const { finalState } = await workflow.execute(mockInitialState);

      // Should have CONTENT_DEFAULTS fallback
      expect(finalState.contentGeneration).toBeDefined();
      expect(finalState.contentGeneration?.homepage).toBeDefined();
      expect(finalState.contentGeneration?.homepage.hero).toBeDefined();
      expect(finalState.contentGeneration?.homepage.hero.title).toBe(CONTENT_DEFAULTS.hero.title);
      expect(finalState.contentGeneration?.homepage.hero.tagline).toBe(CONTENT_DEFAULTS.hero.tagline);
      expect(finalState.contentGeneration?.homepage.amenities.heading).toBe(CONTENT_DEFAULTS.amenities.heading);
      expect(finalState.contentGeneration?.homepage.testimonials.heading).toBe(CONTENT_DEFAULTS.testimonials.heading);

      // Should track fallback usage
      expect(finalState.usedFallback?.contentGenerator).toBe(true);

      // Should record error
      expect(finalState.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            agent: 'ContentGenerator',
            error: expect.stringContaining('ContentGenerator timeout')
          })
        ])
      );

      // Workflow should complete successfully
      expect(finalState.validationStatus).toBe('pass');
    });
  });

  describe('AC2b, AC2c: AssemblyAgent Partial Assembly', () => {
    test('should return partial assembly when AssemblyAgent fails', async () => {
      // All preceding agents succeed
      (ComponentSelector.prototype.execute as jest.Mock).mockResolvedValue({
        componentSelection: { sections: ['HeroSection', 'RoomsSection'] },
        stepCosts: { ComponentSelector: 0.01 },
        totalCost: 0.01
      });

      (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
        stylingSelection: { theme: 'elegant' },
        stepCosts: { StylingAgent: 0.01 },
        totalCost: 0.01
      });

      (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
        contentGeneration: { homepage: { hero: { title: 'Test Hotel' } } },
        stepCosts: { ContentGenerator: 0.01 },
        totalCost: 0.01
      });

      // Mock AssemblyAgent to fail
      (AssemblyAgent.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('AssemblyAgent JSON serialization error')
      );

      const { finalState } = await workflow.execute(mockInitialState);

      // Should have partial assembly with available data
      expect(finalState.assembledConfig).toBeDefined();
      expect(finalState.partialAssembly).toBe(true);

      // Should track fallback usage
      expect(finalState.usedFallback?.assemblyAgent).toBe(true);

      // Should record error
      expect(finalState.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            agent: 'AssemblyAgent',
            error: expect.stringContaining('AssemblyAgent JSON serialization error')
          })
        ])
      );

      // Workflow should complete successfully (validator sees partial assembly)
      expect(finalState.validationStatus).toBe('pass');
    });
  });

  describe('Multiple Failures - Cascading Fallbacks', () => {
    test('should handle multiple agent failures with cascading fallbacks', async () => {
      // Mock ALL agents to fail
      (ComponentSelector.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('ComponentSelector failed')
      );

      (StylingAgent.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('StylingAgent failed')
      );

      (ContentGenerator.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('ContentGenerator failed')
      );

      (AssemblyAgent.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('AssemblyAgent failed')
      );

      const { finalState } = await workflow.execute(mockInitialState);

      // All fallbacks should be used
      expect(finalState.usedFallback?.componentSelector).toBe(true);
      expect(finalState.usedFallback?.stylingAgent).toBe(true);
      expect(finalState.usedFallback?.contentGenerator).toBe(true);
      expect(finalState.usedFallback?.assemblyAgent).toBe(true);

      // Should have all fallback values
      expect(finalState.componentSelection).toBeDefined();
      expect(finalState.stylingSelection).toBeDefined();
      expect(finalState.contentGeneration).toBeDefined();
      expect(finalState.assembledConfig).toBeDefined();

      // Should have partial assembly flag
      expect(finalState.partialAssembly).toBe(true);

      // Should record all errors (at least one per agent)
      expect(finalState.errors.length).toBeGreaterThanOrEqual(4);
      const errorAgents = finalState.errors.map((e: any) => e.agent);
      expect(errorAgents).toContain('ComponentSelector');
      expect(errorAgents).toContain('StylingAgent');
      expect(errorAgents).toContain('ContentGenerator');
      expect(errorAgents).toContain('AssemblyAgent');

      // Workflow should still complete (validator decides pass/fail)
      expect(finalState.validationStatus).toBe('pass');
    });
  });

  describe('Fallback Observability', () => {
    test('should log warnings when fallbacks are used', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock ComponentSelector to fail
      (ComponentSelector.prototype.execute as jest.Mock).mockRejectedValue(
        new Error('Test error')
      );

      // Other agents succeed
      (StylingAgent.prototype.execute as jest.Mock).mockResolvedValue({
        stylingSelection: { theme: 'modern' },
        stepCosts: { StylingAgent: 0.01 },
        totalCost: 0.01
      });

      (ContentGenerator.prototype.execute as jest.Mock).mockResolvedValue({
        contentGeneration: { homepage: {} },
        stepCosts: { ContentGenerator: 0.01 },
        totalCost: 0.01
      });

      (AssemblyAgent.prototype.execute as jest.Mock).mockResolvedValue({
        assembledConfig: { generationId: 'test', timestamp: new Date().toISOString() },
        stepCosts: { AssemblyAgent: 0.01 },
        totalCost: 0.01
      });

      await workflow.execute(mockInitialState);

      // Should have logged warning about fallback
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Workflow] ComponentSelector failed, using base components:'),
        expect.anything()
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
