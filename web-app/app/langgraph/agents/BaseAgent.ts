import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { WorkflowState } from '../state/types';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';
import { LLMProvider, LLMOptions } from '../services/LLMProvider';
import { LLMProviderFactory } from '../services/LLMProviderFactory';
import { AnthropicClient } from '../services/AnthropicClient';

/**
 * Abstract base class for all LangGraph agents in the hotel website generation workflow.
 * Provides common lifecycle hooks and execution pattern for consistent agent behavior.
 *
 * Uses LLMProviderFactory to select between OpenRouter and Anthropic providers
 * based on the LLM_PROVIDER environment variable.
 */
export abstract class BaseAgent {
  protected agentName: string;
  protected langfuseService: LangFuseService;
  protected costMonitor: CostMonitor;
  protected llmProvider: LLMProvider;
  /** @deprecated Use llmProvider instead */
  protected openRouterClient: LLMProvider;

  constructor(
    agentName: string,
    langfuseService?: LangFuseService,
    costMonitor?: CostMonitor
  ) {
    this.agentName = agentName;
    // Use provided instance or create new default instance (singleton validation usually happens at app level)
    this.langfuseService = langfuseService || new LangFuseService();
    this.costMonitor = costMonitor || new CostMonitor();
    // Use factory to create provider based on LLM_PROVIDER env var
    this.llmProvider = LLMProviderFactory.create(undefined, this.langfuseService, this.costMonitor);
    // Backward compatibility alias
    this.openRouterClient = this.llmProvider;
  }

  /**
   * Get the name of this agent
   */
  abstract getAgentName(): string;

  /**
   * Perform the core generation work for this agent
   * Must be implemented by each concrete agent
   */
  abstract performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }>;

  /**
   * Execute the agent with full lifecycle hooks and observability
   * This method provides the standard execution pattern
   */
  async execute(state: WorkflowState): Promise<Partial<WorkflowState>> {
    // minimal metadata for the generation trace to avoid stringifying huge state objects
    const initialModelParams = {
      model: 'pending',
      agent: this.agentName,
    };

    const observabilityInput = {
      generationId: state.generationId,
      agent: this.agentName,
      retryCount: state.retryCount,
      budgetRemaining: state.budgetRemaining
    };

    return this.langfuseService.executeGeneration(
      this.agentName,
      observabilityInput, // Minimal input for trace visibility
      initialModelParams,
      async () => {
        try {
          // Hook: Before execution (Budget check)
          await this.beforeExecute(state);

          // Perform the actual generation
          const result = (await this.performGeneration(state)) as any;

          // Hook: After execution (Cleanup, additional logging)
          await this.afterExecute(state, result);

          return result;
        } catch (error) {
          // Hook: On error (Logging)
          await this.onError(state, error as Error);
          throw error;
        }
      }
    );
  }

  /**
   * Lifecycle hook called before agent execution
   * Checks budget constraints
   */
  protected async beforeExecute(state: WorkflowState): Promise<void> {
    console.debug(`[${this.agentName}] Starting execution`);
    
    // Check budget before proceeding
    // We pass the agent name as the stage
    this.costMonitor.checkBudget(state, this.agentName);
  }

  /**
   * Lifecycle hook called after successful agent execution
   */
  protected async afterExecute(
    state: WorkflowState,
    result: Partial<WorkflowState>
  ): Promise<void> {
    console.debug(`[${this.agentName}] Completed execution successfully`);
    // Future: Verify step costs were updated or generated
  }

  /**
   * Lifecycle hook called when agent execution fails
   */
  protected async onError(state: WorkflowState, error: Error): Promise<void> {
    console.error(`[${this.agentName}] Execution failed:`, error);
  }

  /**
   * Update the current agent field in state
   * Helper method for consistent state updates
   */
  protected setCurrentAgent(): Partial<WorkflowState> {
    return {
      currentAgent: this.agentName,
    };
  }

  /**
   * Add error to the errors array in state
   * Helper method for consistent error tracking
   */
  protected addError(error: string | Error): Partial<WorkflowState> {
    const errorMessage = error instanceof Error ? error.message : error;
    return {
      errors: [errorMessage], // Will be merged by reducer
    };
  }

  /**
   * Update cost tracking for this agent
   * Helper method for consistent cost tracking
   */
  protected updateStepCost(cost: number): Partial<WorkflowState> {
    return {
      stepCosts: {
        [this.agentName]: cost,
      },
      totalCost: cost, // Will be accumulated by reducer
    };
  }

  /**
   * Helper to extract JSON from LLM response (handling potential markdown code blocks)
   * Handles various formats: raw JSON, markdown code blocks, text with embedded JSON
   */
  protected extractJson(text: string): any {
    const trimmedText = text.trim();

    // Strategy 1: Try direct parse (ideal case)
    try {
      return JSON.parse(trimmedText);
    } catch {
      // Continue to other strategies
    }

    // Strategy 2: Extract from markdown code blocks (```json ... ``` or ``` ... ```)
    const codeBlockMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        // Continue to other strategies
      }
    }

    // Strategy 3: Find JSON object boundaries (first { to last })
    const firstBrace = trimmedText.indexOf('{');
    const lastBrace = trimmedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(trimmedText.substring(firstBrace, lastBrace + 1));
      } catch {
        // Continue to other strategies
      }
    }

    // Strategy 4: Find JSON array boundaries (first [ to last ])
    const firstBracket = trimmedText.indexOf('[');
    const lastBracket = trimmedText.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try {
        return JSON.parse(trimmedText.substring(firstBracket, lastBracket + 1));
      } catch {
        // Continue to error
      }
    }

    // All strategies failed - throw descriptive error
    const preview = trimmedText.substring(0, 100).replace(/\n/g, '\\n');
    throw new Error(`Unable to extract JSON from response. Preview: "${preview}..."`);
  }

  /**
   * Unified prompt loading method with Langfuse support and local fallback.
   *
   * @param name Name of the prompt to load
   * @param variables Variables for template substitution
   * @returns The fully rendered prompt string
   */
  protected async loadPrompt(name: string, variables: Record<string, any>): Promise<string> {
    try {
      return await this.langfuseService.getPrompt(name, variables);
    } catch (error: any) {
      // Fallback to local prompt file when Langfuse is unavailable
      console.warn(`[${this.agentName}] Langfuse prompt '${name}' unavailable, using local fallback: ${error.message}`);
      return this.loadLocalPrompt(name, variables);
    }
  }

  /**
   * Load a prompt from local .md file with Mustache-style variable substitution.
   * Used as fallback when Langfuse is unavailable.
   */
  private loadLocalPrompt(name: string, variables: Record<string, any>): string {
    const promptPath = path.resolve(__dirname, 'prompts', `${name}.md`);
    if (!fs.existsSync(promptPath)) {
      throw new Error(`Local prompt file not found: ${promptPath}`);
    }
    let template = fs.readFileSync(promptPath, 'utf-8');

    // Simple {{variable}} substitution
    for (const [key, value] of Object.entries(variables)) {
      const strValue = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      template = template.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), strValue);
    }
    return template;
  }

  /**
   * Execute LLM generation with automatic validation retry.
   * Convenience method for agents to use generateWithRetry.
   *
   * Trace:
   *   epic: EPIC-15
   *   story: STORY-15.04
   *   reqs: [AC1]
   *
   * @param prompt - The prompt to send to LLM
   * @param schema - ZOD schema for validation
   * @param options - LLM options (agentName, budgetRemaining, temperature, maxTokens)
   * @returns Validated parsed response
   * @throws Error if llmProvider is not an AnthropicClient instance
   */
  protected async generateWithRetry<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options?: Partial<LLMOptions>
  ): Promise<T> {
    // Type guard to check if llmProvider is an AnthropicClient
    if (!this.isAnthropicClient(this.llmProvider)) {
      throw new Error(
        `generateWithRetry() is only supported for AnthropicClient. ` +
        `Current provider type: ${this.llmProvider.constructor.name}`
      );
    }

    return this.llmProvider.generateWithRetry(
      [{ role: 'user', content: prompt }],
      schema,
      {
        agentName: this.agentName,
        budgetRemaining: options?.budgetRemaining ?? 0,
        temperature: options?.temperature ?? 0.2,
        maxTokens: options?.maxTokens ?? 4000,
      }
    );
  }

  /**
   * Type guard to check if an LLMProvider is an AnthropicClient.
   * AnthropicClient has the generateWithRetry method for validation retry.
   *
   * @param provider - The LLMProvider instance to check
   * @returns True if the provider is an AnthropicClient instance
   */
  private isAnthropicClient(provider: LLMProvider): provider is AnthropicClient {
    return (
      'generateWithRetry' in provider &&
      typeof (provider as any).generateWithRetry === 'function'
    );
  }
}