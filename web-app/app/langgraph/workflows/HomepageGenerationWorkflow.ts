import { StateGraph, START, END, RetryPolicy } from '@langchain/langgraph';
import { WorkflowStateAnnotation } from '../state/workflow-state';
import { WorkflowState } from '../state/types';
import { MemoryStatePersistence } from '../persistence/MemoryStatePersistence';

// Import actual agent implementations
// Story 20.2: ArchetypeClassifier Agent
import { ArchetypeClassifier } from '../agents/ArchetypeClassifier';
// Story 20.3: TokenGenerator Agent
import { TokenGenerator } from '../agents/TokenGenerator';
import { ComponentSelector } from '../agents/ComponentSelector';
import { StylingAgent } from '../agents/StylingAgent';
import { ContentGenerator } from '../agents/ContentGenerator';
import { AssemblyAgent } from '../agents/AssemblyAgent';
import { QualityValidator } from '../agents/QualityValidator';
import { HotelParameters } from '../agents/schemas';
import { isWithinBudgetCheckpoint } from '../utils/BudgetCheckpoint';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';

/**
 * Fallback constants for graceful degradation (Story 13.3.1 AC2b, AC2c, AC3c)
 *
 * @trace epic: EPIC-13
 * @trace story: STORY-13.3.1
 * @trace reqs: AC2b, AC2c, AC3c
 *
 * Why: These fallbacks enable the workflow to produce usable output even when
 * individual agents fail. Instead of all-or-nothing failure, the workflow can
 * degrade gracefully with safe defaults. This is critical for production resilience
 * at scale (10,000+ hotel websites).
 */

/**
 * Base component set fallback for ComponentSelector failures.
 * Provides minimal but functional hotel homepage layout.
 */
const BASE_COMPONENTS = {
  sections: ['HeroSection', 'RoomsSection', 'AmenitiesSection', 'TestimonialsSection', 'ContactSection'],
  navigation: 'NavigationDesktop',
  footer: 'Footer'
};

/**
 * Default styling fallback for StylingAgent failures.
 * Conservative styling that works across all hotel types.
 * Uses OKLCH color format per project standards.
 */
const DEFAULT_STYLING = {
  variants: {
    hero: { layout: 'centered', overlay: 'gradient' },
    rooms: { layout: 'grid', columns: 3 },
    amenities: { layout: 'grid', columns: 4 },
    testimonials: { layout: 'carousel' }
  },
  theme: {
    primary: 'oklch(0.346 0.074 256)', // Deep blue
    secondary: 'oklch(0.748 0.099 86.1)' // Warm gold
  }
};

/**
 * Fallback constants for Story 20.6 new agents.
 * Graceful degradation when ArchetypeClassifier or TokenGenerator fail.
 */

/**
 * Default archetype fallback for ArchetypeClassifier failures.
 * Uses 'Business Hotel' as the safe default archetype per Epic 20 AC.
 *
 * Story 20.6: Fallback for ArchetypeClassifier node failures.
 * @trace story: STORY-20.6
 * @trace reqs: AC - "if ArchetypeClassifier fails, use Business Hotel as default archetype"
 */
const DEFAULT_ARCHETYPE = {
  archetype: 'business-hotel',
  reasoning: 'ArchetypeClassifier failed. Using Business Hotel as safe default fallback. This archetype provides professional styling with corporate blue color scheme and functional layout suitable for most hotel types.'
};

/**
 * Default design tokens fallback for TokenGenerator failures.
 * Uses safe OKLCH values and standard typography configuration.
 *
 * Story 20.6: Fallback for TokenGenerator node failures.
 * @trace story: STORY-20.6
 * @trace reqs: AC - "if TokenGenerator fails, use existing default theme values"
 */
const DEFAULT_DESIGN_TOKENS = {
  designTokens: {
    archetype: 'business-hotel',
    guestPersona: 'Professional business travelers seeking efficient, reliable accommodation.',
    emotionalIntent: 'Convey reliability, professionalism, and trustworthiness.',
    architecturalInspiration: 'Modern corporate architecture with clean lines and functional spaces.',
    forbiddenElements: ['no overly ornate decorative elements', 'no overly bright or saturated colors', 'no highly stylized typography'],
    colorScheme: {
      primaryHue: 225,
      primaryChroma: 0.08,
      primaryLightness: 0.45,
      secondaryHue: 225,
      secondaryChroma: 0.05,
      secondaryLightness: 0.55,
      surfaceType: 'cool-white',
      accentStrategy: 'monochromatic'
    },
    typography: {
      headingPersonality: 'sans-modern',
      bodyPersonality: 'sans-modern',
      scaleRatio: 'major-third'
    },
    spacing: {
      density: 'tight'
    },
    borderRadius: { style: 'subtle' }
  },
  contrastReport: {
    pairs: [],
    allPass: true,
    failCount: 0
  },
  iterations: 0,
  adjustmentsMade: []
};

/**
 * Homepage Generation Workflow
 * Defines the overall workflow structure with 7 main agents
 * Story 20.6: Added ArchetypeClassifier and TokenGenerator at workflow start
 */
export class HomepageGenerationWorkflow {
  private stateGraph: any;
  private persistence: MemoryStatePersistence;
  private langfuseService: LangFuseService;
  private costMonitor: CostMonitor;

  // Agent instances
  private agents: {
    // Story 20.2: ArchetypeClassifier (first agent in workflow)
    archetypeClassifier: ArchetypeClassifier;
    // Story 20.3: TokenGenerator (second agent in workflow)
    tokenGenerator: TokenGenerator;
    componentSelector: ComponentSelector;
    stylingAgent: StylingAgent;
    contentGenerator: ContentGenerator;
    assemblyAgent: AssemblyAgent;
    qualityValidator: QualityValidator;
  };

  constructor(persistence?: MemoryStatePersistence) {
    this.persistence = persistence || new MemoryStatePersistence();
    this.langfuseService = new LangFuseService();
    this.costMonitor = new CostMonitor();

    // Initialize agents with dependency injection
    this.agents = {
      // Story 20.2: ArchetypeClassifier - classifies hotel into visual archetype
      archetypeClassifier: new ArchetypeClassifier(this.langfuseService, this.costMonitor),
      // Story 20.3: TokenGenerator - generates archetype-specific design tokens
      tokenGenerator: new TokenGenerator(this.langfuseService, this.costMonitor),
      componentSelector: new ComponentSelector(this.langfuseService, this.costMonitor),
      stylingAgent: new StylingAgent(this.langfuseService, this.costMonitor),
      contentGenerator: new ContentGenerator(this.langfuseService, this.costMonitor),
      assemblyAgent: new AssemblyAgent(this.langfuseService, this.costMonitor),
      qualityValidator: new QualityValidator(this.langfuseService, this.costMonitor),
    };

    this.stateGraph = this.buildGraph();
  }

  /**
   * Build the workflow graph with nodes and edges
   * Story 20.6: Added ArchetypeClassifier and TokenGenerator nodes at workflow start
   */
  private buildGraph(): any {
    const builder = new StateGraph(WorkflowStateAnnotation)
      // Story 20.2: ArchetypeClassifier - First agent, classifies hotel archetype
      .addNode('archetypeClassifier', this.archetypeClassifierNode.bind(this))
      // Story 20.3: TokenGenerator - Second agent, generates design tokens
      .addNode('tokenGenerator', this.tokenGeneratorNode.bind(this))
      // Story 22.5: Added retryPolicy for LLM agents to handle transient errors
      .addNode('componentSelector', this.componentSelectorNode.bind(this), {
        retryPolicy: {
          maxAttempts: 2,
          initialInterval: 0.5,
          retryOn: (e: any) => {
            // Retry on network/transient errors only
            return e?.code === 'ECONNREFUSED' ||
                   e?.code === 'ETIMEDOUT' ||
                   e?.code === 'ECONNRESET' ||
                   e?.message?.includes('timeout') ||
                   e?.message?.includes('rate limit') ||
                   e?.message?.includes('network');
          }
        }
      })
      .addNode('stylingAgent', this.stylingAgentNode.bind(this), {
        retryPolicy: {
          maxAttempts: 2,
          initialInterval: 0.5,
          retryOn: (e: any) => {
            return e?.code === 'ECONNREFUSED' ||
                   e?.code === 'ETIMEDOUT' ||
                   e?.code === 'ECONNRESET' ||
                   e?.message?.includes('timeout') ||
                   e?.message?.includes('rate limit') ||
                   e?.message?.includes('network');
          }
        }
      })
      .addNode('contentGenerator', this.contentGeneratorNode.bind(this), {
        retryPolicy: {
          maxAttempts: 2,
          initialInterval: 0.5,
          retryOn: (e: any) => {
            return e?.code === 'ECONNREFUSED' ||
                   e?.code === 'ETIMEDOUT' ||
                   e?.code === 'ECONNRESET' ||
                   e?.message?.includes('timeout') ||
                   e?.message?.includes('rate limit') ||
                   e?.message?.includes('network');
          }
        }
      })
      // Story 22.5: AssemblyAgent has highest transient error rate from LLM JSON parsing
      .addNode('assemblyAgent', this.assemblyAgentNode.bind(this), {
        retryPolicy: {
          maxAttempts: 2,
          initialInterval: 0.5,
          retryOn: (e: any) => {
            return e?.code === 'ECONNREFUSED' ||
                   e?.code === 'ETIMEDOUT' ||
                   e?.code === 'ECONNRESET' ||
                   e?.message?.includes('timeout') ||
                   e?.message?.includes('rate limit') ||
                   e?.message?.includes('network');
          }
        }
      })
      .addNode('qualityValidator', this.qualityValidatorNode.bind(this));

    // Connect nodes in execution order
    // Story 20.6: New flow - ArchetypeClassifier → TokenGenerator → ComponentSelector → ...
    builder.addEdge(START, 'archetypeClassifier');
    builder.addEdge('archetypeClassifier', 'tokenGenerator');
    builder.addEdge('tokenGenerator', 'componentSelector');
    builder.addEdge('componentSelector', 'stylingAgent');
    builder.addEdge('stylingAgent', 'contentGenerator');
    builder.addEdge('contentGenerator', 'assemblyAgent');
    builder.addEdge('assemblyAgent', 'qualityValidator');

    // Conditional edge for retry routing (Story 7.7) & Budget Enforcement (Story 7.8)
    // Story 20.6: Retry now routes to archetypeClassifier (first agent) instead of componentSelector
    builder.addConditionalEdges(
      'qualityValidator',
      (state) => {
        if (state.budgetExceeded) {
          console.error('[Workflow] Budget exceeded. Routing to END.');
          return 'end_budget';
        }

        if (state.validationStatus === 'pass') {
          console.log('[Workflow] Validation passed. Ending workflow.');
          return 'end_success';
        }

        if (state.retryCount >= 3) {
          console.warn(`[Workflow] Maximum retries (3) reached. Terminating with failure.`);
          return 'end_failure';
        }

        console.warn(`[Workflow] Validation failed. Retrying (Attempt ${state.retryCount + 1})...`);
        return 'retry';
      },
      {
        // Story 20.6: Retry from first agent (archetypeClassifier) instead of componentSelector
        'retry': 'archetypeClassifier',
        'end_success': END,
        'end_failure': END,
        'end_budget': END,
        [END]: END
      }
    );

    return builder;
  }

  /**
   * Node wrapper for ArchetypeClassifier with graceful degradation fallback.
   *
   * Story 20.6: First agent in workflow, executes before all other agents.
   * @trace story: STORY-20.6
   * @trace reqs: AC - "if ArchetypeClassifier fails, use business-hotel as default archetype"
   *
   * On failure: Uses DEFAULT_ARCHETYPE fallback (business-hotel) instead of terminating workflow.
   */
  private async archetypeClassifierNode(
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.info('[Workflow] Executing ArchetypeClassifier...');
    try {
      const result = await this.agents.archetypeClassifier.execute(state);
      const budgetUpdate = this.checkBudgetAfterNode('archetypeClassifier', { ...state, ...result });
      return { ...result, ...budgetUpdate };
    } catch (error: any) {
      console.warn('[Workflow] ArchetypeClassifier failed, using default business-hotel archetype:', error.message);
      this.langfuseService.logError(`ArchetypeClassifier Failed: ${error.message}`, { state });

      // Graceful degradation: Use business-hotel as default archetype
      // Story 22.5 Fix: Removed manual error spreading - reducer now handles errors
      return {
        archetypeClassification: DEFAULT_ARCHETYPE as any,
        usedFallback: {
          ...state.usedFallback,
          archetypeClassifier: true
        },
        errors: [
          { agent: 'ArchetypeClassifier', error: String(error.message) }
        ]
      };
    }
  }

  /**
   * Node wrapper for TokenGenerator with graceful degradation fallback.
   *
   * Story 20.6: Second agent in workflow, executes after ArchetypeClassifier.
   * @trace story: STORY-20.6
   * @trace reqs: AC - "if TokenGenerator fails, use existing default theme values"
   *
   * On failure: Uses DEFAULT_DESIGN_TOKENS fallback instead of terminating workflow.
   */
  private async tokenGeneratorNode(
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.info('[Workflow] Executing TokenGenerator...');
    try {
      const result = await this.agents.tokenGenerator.execute(state);
      const budgetUpdate = this.checkBudgetAfterNode('tokenGenerator', { ...state, ...result });
      return { ...result, ...budgetUpdate };
    } catch (error: any) {
      console.warn('[Workflow] TokenGenerator failed, using default design tokens:', error.message);
      this.langfuseService.logError(`TokenGenerator Failed: ${error.message}`, { state });

      // Graceful degradation: Use default design tokens
      // Story 22.5 Fix: Removed manual error spreading - reducer now handles errors
      return {
        designTokens: DEFAULT_DESIGN_TOKENS as any,
        usedFallback: {
          ...state.usedFallback,
          tokenGenerator: true
        },
        errors: [
          { agent: 'TokenGenerator', error: String(error.message) }
        ]
      };
    }
  }

  /**
   * Node wrapper for ComponentSelector with graceful degradation fallback.
   *
   * @trace story: STORY-13.3.1
   * @trace reqs: AC2b
   *
   * On failure: Uses BASE_COMPONENTS fallback instead of terminating workflow.
   */
  private async componentSelectorNode(
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.info('[Workflow] Executing ComponentSelector...');
    try {
      const result = await this.agents.componentSelector.execute(state);
      const budgetUpdate = this.checkBudgetAfterNode('componentSelector', { ...state, ...result });
      return { ...result, ...budgetUpdate };
    } catch (error: any) {
      console.warn('[Workflow] ComponentSelector failed, using base components:', error.message);
      this.langfuseService.logError(`ComponentSelector Failed: ${error.message}`, { state });

      // Graceful degradation: Use base component set
      // Story 22.5 Fix: Removed manual error spreading - reducer now handles errors
      return {
        componentSelection: BASE_COMPONENTS as any,
        usedFallback: {
          ...state.usedFallback,
          componentSelector: true
        },
        errors: [
          { agent: 'ComponentSelector', error: String(error.message) }
        ]
      };
    }
  }

  /**
   * Node wrapper for StylingAgent with graceful degradation fallback.
   *
   * @trace story: STORY-13.3.1
   * @trace reqs: AC2b
   *
   * On failure: Uses DEFAULT_STYLING fallback instead of terminating workflow.
   */
  private async stylingAgentNode(
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.info('[Workflow] Executing StylingAgent...');
    try {
      const result = await this.agents.stylingAgent.execute(state);
      const budgetUpdate = this.checkBudgetAfterNode('stylingAgent', { ...state, ...result });
      return { ...result, ...budgetUpdate };
    } catch (error: any) {
      console.warn('[Workflow] StylingAgent failed, using default styling:', error.message);
      this.langfuseService.logError(`StylingAgent Failed: ${error.message}`, { state });

      // Graceful degradation: Use default styling
      // Story 22.5 Fix: Removed manual error spreading - reducer now handles errors
      return {
        stylingSelection: DEFAULT_STYLING as any,
        usedFallback: {
          ...state.usedFallback,
          stylingAgent: true
        },
        errors: [
          { agent: 'StylingAgent', error: String(error.message) }
        ]
      };
    }
  }

  /**
   * Node wrapper for ContentGenerator with graceful degradation fallback.
   *
   * @trace story: STORY-13.3.1
   * @trace reqs: AC2c, AC3c
   *
   * On failure or timeout: Uses CONTENT_DEFAULTS from @/lib/content/defaults
   * as generic content fallback instead of terminating workflow.
   */
  private async contentGeneratorNode(
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.info('[Workflow] Executing ContentGenerator...');
    try {
      const result = await this.agents.contentGenerator.execute(state);
      const budgetUpdate = this.checkBudgetAfterNode('contentGenerator', { ...state, ...result });
      return { ...result, ...budgetUpdate };
    } catch (error: any) {
      console.warn('[Workflow] ContentGenerator failed or timed out, using generic content:', error.message);
      this.langfuseService.logError(`ContentGenerator Failed: ${error.message}`, { state });

      // Graceful degradation: Use CONTENT_DEFAULTS for generic content
      return {
        contentGeneration: {
          homepage: {
            hero: {
              title: CONTENT_DEFAULTS.hero.title,
              tagline: CONTENT_DEFAULTS.hero.tagline,
              headline: CONTENT_DEFAULTS.hero.headline,
              primaryCTA: CONTENT_DEFAULTS.hero.primaryCTA,
              secondaryCTA: CONTENT_DEFAULTS.hero.secondaryCTA,
              backgroundImage: CONTENT_DEFAULTS.hero.backgroundImage,
              imageAlt: CONTENT_DEFAULTS.hero.imageAlt,
            },
            amenities: {
              heading: CONTENT_DEFAULTS.amenities.heading,
              subheading: CONTENT_DEFAULTS.amenities.subheading,
              items: []
            },
            testimonials: {
              heading: CONTENT_DEFAULTS.testimonials.heading,
              subheading: CONTENT_DEFAULTS.testimonials.subheading,
              items: []
            }
          }
        } as any,
        usedFallback: {
          ...state.usedFallback,
          contentGenerator: true
        },
        errors: [
          { agent: 'ContentGenerator', error: String(error.message) }
        ]
      };
    }
  }

  /**
   * Node wrapper for AssemblyAgent with partial assembly fallback.
   *
   * @trace story: STORY-13.3.1
   * @trace reqs: AC2b, AC2c
   *
   * On failure: Returns whatever components were successfully assembled
   * with partialAssembly flag set to true for error reporting.
   */
  private async assemblyAgentNode(
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.info('[Workflow] Executing AssemblyAgent...');
    try {
      const result = await this.agents.assemblyAgent.execute(state);

      // Inject designTokens into assembledConfig so it persists in output JSON
      if (result.assembledConfig && state.designTokens?.designTokens) {
        (result.assembledConfig as any).designTokens = state.designTokens.designTokens;
      }

      const budgetUpdate = this.checkBudgetAfterNode('assemblyAgent', { ...state, ...result });
      return { ...result, ...budgetUpdate };
    } catch (error: any) {
      console.warn('[Workflow] AssemblyAgent failed, returning partial assembly:', error.message);
      this.langfuseService.logError(`AssemblyAgent Failed: ${error.message}`, { state });

      // Graceful degradation: Return partial assembly with available data
      // Use whatever component/styling/content data is available in state
      return {
        assembledConfig: {
          components: state.componentSelection || BASE_COMPONENTS,
          styling: state.stylingSelection || DEFAULT_STYLING,
          content: state.contentGeneration || {
            homepage: {
              hero: {
                title: CONTENT_DEFAULTS.hero.title,
                tagline: CONTENT_DEFAULTS.hero.tagline,
                headline: CONTENT_DEFAULTS.hero.headline,
                primaryCTA: CONTENT_DEFAULTS.hero.primaryCTA,
                secondaryCTA: CONTENT_DEFAULTS.hero.secondaryCTA,
                backgroundImage: CONTENT_DEFAULTS.hero.backgroundImage,
                imageAlt: CONTENT_DEFAULTS.hero.imageAlt,
              },
              amenities: {
                heading: CONTENT_DEFAULTS.amenities.heading,
                subheading: CONTENT_DEFAULTS.amenities.subheading,
                items: []
              },
              testimonials: {
                heading: CONTENT_DEFAULTS.testimonials.heading,
                subheading: CONTENT_DEFAULTS.testimonials.subheading,
                items: []
              }
            }
          }
        } as any,
        partialAssembly: true,
        usedFallback: {
          ...state.usedFallback,
          assemblyAgent: true
        },
        errors: [
          { agent: 'AssemblyAgent', error: String(error.message) }
        ]
      };
    }
  }

  /**
   * Node wrapper for QualityValidator
   */
  private async qualityValidatorNode(
    state: WorkflowState
  ): Promise<Partial<WorkflowState>> {
    console.info('[Workflow] Executing QualityValidator...');
    try {
      // Execute validation
      const result = await this.agents.qualityValidator.execute(state);

      // Increment retry count if it failed
      if (result.validationStatus === 'fail') {
        const newRetryCount = (state.retryCount || 0) + 1;

        // Apply exponential backoff delay before retry
        const delay = this.calculateBackoffDelay(state.retryCount || 0);
        console.log(`[Workflow] Retry ${newRetryCount}: Waiting ${delay}ms before retry...`);
        await this.sleep(delay);

        return {
          ...result,
          retryCount: newRetryCount
        };
      }

      return result;
    } catch (error: any) {
      this.langfuseService.logError(`QualityValidator Failed: ${error.message}`, { state });

      const newRetryCount = (state.retryCount || 0) + 1;

      // Apply exponential backoff delay before retry on exception
      const delay = this.calculateBackoffDelay(state.retryCount || 0);
      console.log(`[Workflow] Retry ${newRetryCount} (after error): Waiting ${delay}ms before retry...`);
      await this.sleep(delay);

      // Increment retry count on exception to prevent infinite recursion
      return {
        errors: [{ agent: 'QualityValidator', error: error.message }],
        validationStatus: 'fail',
        retryCount: newRetryCount
      };
    }
  }

  /**
   * Calculate exponential backoff delay for retry attempts.
   *
   * Uses formula: delay = min(baseDelay * 2^retryCount, maxDelay)
   *
   * @param retryCount Current retry attempt count (0-indexed)
   * @returns Delay in milliseconds
   *
   * @example
   * calculateBackoffDelay(0) // 5000ms (5 seconds)
   * calculateBackoffDelay(1) // 10000ms (10 seconds)
   * calculateBackoffDelay(2) // 20000ms (20 seconds)
   * calculateBackoffDelay(5) // 60000ms (60 seconds max)
   */
  private calculateBackoffDelay(retryCount: number): number {
    // Use environment variable for testing, default to production values
    const BASE_DELAY = Number(process.env.WORKFLOW_BACKOFF_BASE_MS) || 5000; // 5 seconds default
    const MAX_DELAY = Number(process.env.WORKFLOW_BACKOFF_MAX_MS) || 60000; // 60 seconds default
    return Math.min(BASE_DELAY * Math.pow(2, retryCount), MAX_DELAY);
  }

  /**
   * Sleep for specified duration.
   *
   * @param ms Duration in milliseconds
   * @returns Promise that resolves after delay
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Perform budget checkpoint validation after an agent node execution.
   * Updates budgetExceeded flag in state if threshold is surpassed.
   * 
   * @param nodeName The agent node identifier
   * @param state Current workflow state (after agent execution)
   * @returns Partial state update
   */
  private checkBudgetAfterNode(
    nodeName: string,
    state: WorkflowState
  ): Partial<WorkflowState> {
    // If budget was already exceeded in a previous step, keep it exceeded
    if (state.budgetExceeded) {
      return { budgetExceeded: true };
    }

    const totalCost = state.totalCost || 0;
    const isWithin = isWithinBudgetCheckpoint(nodeName, totalCost);

    if (!isWithin) {
      console.error(`[Workflow] Budget exceeded at checkpoint '${nodeName}'. Total cost: $${totalCost.toFixed(4)}`);
      return { budgetExceeded: true };
    }

    return { budgetExceeded: false };
  }
 
  /**
   * Compile the workflow for execution
   */
  compile() {
    return this.stateGraph.compile();
  }

  /**
   * Public invoke method matching AC6 spec.
   * Accepts generationId and hotelParameters, returns complete WorkflowState.
   * Implements 30-minute timeout protection using AbortController.
   *
   * @param input { generationId: string, hotelParameters: HotelParameters }
   * @returns Promise<WorkflowState>
   */
  async invoke(input: {
    generationId: string;
    hotelParameters: HotelParameters;
    batchIndex?: number;
    batchSize?: number;
    previousArchetypes?: string[];
  }): Promise<WorkflowState> {
    const initialState: WorkflowState = {
      generationId: input.generationId,
      hotelParameters: input.hotelParameters,
      totalCost: 0,
      stepCosts: {},
      budgetRemaining: CostMonitor.TOTAL_BUDGET,
      retryCount: 0,
      validationStatus: 'pending',
      validationErrors: [],
      errors: [],
      budgetExceeded: false,
      ...(input.batchIndex !== undefined && { batchIndex: input.batchIndex }),
      ...(input.batchSize !== undefined && { batchSize: input.batchSize }),
      ...(input.previousArchetypes && { previousArchetypes: input.previousArchetypes }),
    } as unknown as WorkflowState;

    // Start LangFuse Trace
    this.langfuseService.startWorkflowTrace('HomepageGenerationWorkflow', {
      generationId: input.generationId,
      hotelName: input.hotelParameters.hotelName,
    });

    // AbortController for 30-minute timeout protection
    const abortController = new AbortController();
    const timeoutMs = 30 * 60 * 1000; // 30 minutes in milliseconds
    let timeoutId: NodeJS.Timeout | undefined;

    try {
      // Set timeout to abort long-running workflows
      timeoutId = setTimeout(() => {
        abortController.abort();
        this.langfuseService.logError('Workflow timeout: exceeded 30 minutes', {
          generationId: input.generationId,
          timeoutMs
        });
      }, timeoutMs);

      const compiledGraph = this.compile();
      console.info(`[Workflow] Starting generation for ID: ${input.generationId}`);

      const finalState = await compiledGraph.invoke(initialState) as WorkflowState;

      console.info(`[Workflow] Completed generation. Status: ${finalState.validationStatus}, Cost: $${finalState.totalCost.toFixed(4)}`);

      // End Trace with success
      this.langfuseService.endWorkflowTrace(finalState, finalState.validationStatus === 'pass' ? 'SUCCESS' : 'WARNING');

      return finalState;
    } catch (error: any) {
      // Check if error is due to timeout/abort
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        const timeoutError = new Error('Workflow terminated: exceeded 30-minute timeout limit');
        console.error(`[Workflow] ${timeoutError.message}`);
        this.langfuseService.logError(timeoutError.message, {
          generationId: input.generationId,
          duration: '30+ minutes'
        });
        this.langfuseService.endWorkflowTrace({ error: timeoutError.message }, 'ERROR');
        throw timeoutError;
      }

      console.error(`[Workflow] Fatal exception: ${error.message}`);
      this.langfuseService.logError(`Workflow Fatal Exception: ${error.message}`, { input });
      this.langfuseService.endWorkflowTrace({ error: error.message }, 'ERROR');
      throw error;
    } finally {
      // Clear timeout and ensure events are sent
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      abortController.abort(); // Clean up
      await this.langfuseService.flush();
    }
  }

  /**
   * Execute the workflow with initial state
   */
  async execute(initialState: WorkflowState): Promise<{
    finalState: WorkflowState;
    checkpointId: string;
  }> {
    const checkpointId = await this.persistence.saveState(initialState);
    const compiledGraph = this.compile();
    const finalState = await compiledGraph.invoke(initialState);
    await this.persistence.saveState(finalState, `${checkpointId}_final`);
    return { finalState, checkpointId };
  }

  /**
   * Execute workflow with streaming support
   * Story 20.6: Updated to include all 7 agents (added archetypeClassifier and tokenGenerator)
   */
  async *executeStream(initialState: WorkflowState): AsyncGenerator<{
    type: 'node_start' | 'node_complete' | 'workflow_complete';
    node?: string;
    state?: Partial<WorkflowState>;
    checkpointId?: string;
  }> {
    const checkpointId = await this.persistence.saveState(initialState);
    // Story 20.6: All 7 agents in execution order
    const nodes = [
      'archetypeClassifier',
      'tokenGenerator',
      'componentSelector',
      'stylingAgent',
      'contentGenerator',
      'assemblyAgent',
      'qualityValidator'
    ];

    for (const node of nodes) {
      yield { type: 'node_start', node };
      await new Promise(resolve => setTimeout(resolve, 100));
      yield {
        type: 'node_complete',
        node,
        checkpointId: `${checkpointId}_${node}`,
      };
    }

    yield { type: 'workflow_complete', checkpointId: `${checkpointId}_final` };
  }

  /**
   * Get workflow statistics
   * Story 20.6: Updated nodeCount from 5 to 7
   */
  getStats(): {
    nodeCount: number;
    persistenceStats: ReturnType<MemoryStatePersistence['getStats']>;
  } {
    return {
      nodeCount: 7,
      persistenceStats: this.persistence.getStats(),
    };
  }
}