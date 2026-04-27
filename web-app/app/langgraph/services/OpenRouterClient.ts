import { CostMonitor } from './CostMonitor';
import { LLMProvider, LLMOptions, LLMResponse } from './LLMProvider';

/**
 * OpenRouterClient Service
 *
 * Provides a unified interface for interacting with LLMs via OpenRouter.
 * Implements intelligent routing, rate limiting with exponential backoff,
 * and automatic fallback between model tiers.
 *
 * @example
 * ```typescript
 * const client = new OpenRouterClient();
 * const response = await client.sendCompletion(
 *   [{ role: 'user', content: 'Hello' }],
 *   { agentName: 'ComponentSelector', budgetRemaining: 2.0 }
 * );
 * console.log(response.text);
 * ```
 */
export class OpenRouterClient implements LLMProvider {
  // Model identifiers
  private readonly MODELS = {
    PRIMARY: process.env.PRIMARY_MODEL || 'moonshotai/kimi-k2',
    FALLBACK: process.env.FALLBACK_MODEL || 'anthropic/claude-3-haiku',
    BUDGET: process.env.BUDGET_MODEL || 'openai/gpt-4o-mini',
  };

  private langfuseService: any;
  private costMonitor: any;

  constructor(langfuseService?: any, costMonitor?: any) {
    this.langfuseService = langfuseService;
    this.costMonitor = costMonitor;
  }

  // Pricing table (per 1K tokens)
  private readonly PRICING: Record<string, { input: number; output: number }> = {
    'moonshotai/kimi-k2': { input: 0.0001, output: 0.0004 },
    'anthropic/claude-3-haiku': { input: 0.00025, output: 0.00125 },
    'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  };

  /**
   * Selects the appropriate model based on task requirements and remaining budget.
   * Per Story 7.9 AC4:
   * - High budget (>$1.00): Primary (Kimi K2)
   * - Medium budget ($0.50-$1.00): Fallback (Claude 3 Haiku)
   * - Low budget (<$0.50): Budget Tier (GPT-4o Mini)
   */
  public selectModel(task: string, budgetRemaining: number): string {
    if (budgetRemaining > 1.00) {
      return this.MODELS.PRIMARY;
    } else if (budgetRemaining >= 0.50) {
      return this.MODELS.FALLBACK;
    } else {
      return this.MODELS.BUDGET;
    }
  }

  /**
   * Sends a completion request to OpenRouter with automatic retries and fallback.
   * Integrates with LangfuseService for observability and cost tracking.
   */
  public async sendCompletion(
    messages: Array<{ role: string; content: string }>,
    options: LLMOptions
  ): Promise<LLMResponse> {
    const initialModel = this.selectModel(options.agentName, options.budgetRemaining);
    const modelTiers = [initialModel, this.MODELS.FALLBACK, this.MODELS.BUDGET];
    const uniqueTiers = Array.from(new Set(modelTiers));

    let lastError: any;

    for (const modelId of uniqueTiers) {
      let attempts = 0;
      const maxRetries = 2;
      const baseDelay = 1000;

      while (attempts <= maxRetries) {
        try {
          // Prepare the request for telemetry
          const requestBody = {
            model: modelId,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? 2000,
          };

          // If LangfuseService is available, use it for observability
          if (this.langfuseService && this.langfuseService.executeGeneration) {
            return await this.langfuseService.executeGeneration(
              options.agentName,
              { messages, model: modelId, ...options },
              { model: modelId, temperature: requestBody.temperature, max_tokens: requestBody.max_tokens },
              async () => this._executeFetch(modelId, requestBody)
            );
          } else {
            // Fallback: Execute without Langfuse telemetry
            console.warn(`[OpenRouterClient] No LangfuseService available, executing without telemetry`);
            return await this._executeFetch(modelId, requestBody);
          }

        } catch (error: any) {
          lastError = error;
          attempts++;

          if (attempts <= maxRetries) {
            const delay = baseDelay * Math.pow(2, attempts - 1);
            console.warn(`[OpenRouterClient] Attempt ${attempts} failed for ${modelId}, retrying in ${delay}ms...: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      console.warn(`[OpenRouterClient] ${modelId} failed. Routing to next fallback tier.`);
    }

    throw new Error(`OpenRouter completion failed for all models. Last error: ${lastError?.message || lastError}`);
  }

  /**
   * Internal method to execute the actual fetch request to OpenRouter.
   * Separated to allow LangfuseService to wrap the call for telemetry.
   */
  private async _executeFetch(
    modelId: string,
    requestBody: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      temperature: number;
      max_tokens: number;
    }
  ): Promise<LLMResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://effective-tours.com',
        'X-Title': 'Hotel Website Generator',
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(Math.max(Number(process.env.GENERATION_TIMEOUT_MS) || 0, 60000)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const text = result.choices[0].message.content;
    const usage = result.usage; // { prompt_tokens, completion_tokens, total_tokens }

    const cost = this.calculateCost(modelId, usage.prompt_tokens, usage.completion_tokens);

    // Return in format expected by LangfuseService (with output field)
    return {
      text,
      output: text, // For LangfuseService.executeGeneration
      usage: {
        input: usage.prompt_tokens,
        output: usage.completion_tokens,
        total: usage.total_tokens
      },
      model: modelId,
      cost,
    };
  }

  public getModelPricing(model: string): { input: number; output: number } {
    return this.PRICING[model] || this.PRICING['moonshotai/kimi-k2'];
  }

  public getAvailableModels(): string[] {
    return Object.values(this.MODELS);
  }

  private calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const pricing = this.getModelPricing(model);
    return (
      (inputTokens / 1000) * pricing.input +
      (outputTokens / 1000) * pricing.output
    );
  }
}
