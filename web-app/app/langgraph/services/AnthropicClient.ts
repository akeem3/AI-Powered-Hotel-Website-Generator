import { LLMProvider, LLMOptions, LLMResponse } from './LLMProvider';
import { z } from 'zod';

/**
 * AnthropicClient Service
 *
 * Provides a unified interface for interacting with Anthropic-compatible APIs.
 * Supports custom base URLs (e.g., Z.ai proxy) via ANTHROPIC_BASE_URL.
 *
 * Environment Variables:
 * - ANTHROPIC_BASE_URL: API endpoint (default: https://api.anthropic.com)
 * - ANTHROPIC_AUTH_TOKEN: API key/token for authentication
 * - ANTHROPIC_DEFAULT_MODEL: Default model to use
 * - ANTHROPIC_PRIMARY_MODEL: High-budget model
 * - ANTHROPIC_FALLBACK_MODEL: Medium-budget model
 * - ANTHROPIC_BUDGET_MODEL: Low-budget model
 *
 * @example
 * ```typescript
 * const client = new AnthropicClient();
 * const response = await client.sendCompletion(
 *   [{ role: 'user', content: 'Hello' }],
 *   { agentName: 'ComponentSelector', budgetRemaining: 2.0 }
 * );
 * console.log(response.text);
 * ```
 */
export class AnthropicClient implements LLMProvider {
  private readonly baseUrl: string;
  private readonly authToken: string;

  // Model identifiers - configurable via environment variables
  private readonly MODELS = {
    PRIMARY: process.env.ANTHROPIC_PRIMARY_MODEL || process.env.ANTHROPIC_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022',
    FALLBACK: process.env.ANTHROPIC_FALLBACK_MODEL || process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL || 'claude-3-haiku-20240307',
    BUDGET: process.env.ANTHROPIC_BUDGET_MODEL || process.env.ANTHROPIC_DEFAULT_HAIKU_MODEL || 'claude-3-haiku-20240307',
  };

  private langfuseService: any;
  private costMonitor: any;

  // Pricing table (per 1K tokens) - adjust based on your provider
  // Z.ai GLM models are very cost-effective
  private readonly PRICING: Record<string, { input: number; output: number }> = {
    'glm-4.7': { input: 0.0001, output: 0.0004 }, // Z.ai GLM 4.7 model
    'glm-4.6': { input: 0.0001, output: 0.0004 }, // Z.ai GLM 4.6 model
    'glm-4': { input: 0.0001, output: 0.0004 },
    'glm-4-flash': { input: 0.00005, output: 0.0002 },
    'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
    'default': { input: 0.0001, output: 0.0004 }, // Default to GLM pricing
  };

  constructor(langfuseService?: any, costMonitor?: any) {
    this.baseUrl = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com';
    this.authToken = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY || '';
    this.langfuseService = langfuseService;
    this.costMonitor = costMonitor;

    if (!this.authToken) {
      console.warn('[AnthropicClient] No ANTHROPIC_AUTH_TOKEN or ANTHROPIC_API_KEY found in environment');
    }
  }

  /**
   * Selects the appropriate model based on task requirements and remaining budget.
   * - High budget (>$1.00): Primary model
   * - Medium budget ($0.50-$1.00): Fallback model
   * - Low budget (<$0.50): Budget model
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
   * Sends a completion request to Anthropic-compatible API with automatic retries and fallback.
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
          const requestBody = {
            model: modelId,
            messages: this.formatMessages(messages),
            temperature: options.temperature ?? 0.2,
            top_p: options.topP ?? 0.95,
            max_tokens: options.maxTokens ?? 4000,
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
            console.warn(`[AnthropicClient] No LangfuseService available, executing without telemetry`);
            return await this._executeFetch(modelId, requestBody);
          }

        } catch (error: any) {
          lastError = error;
          attempts++;

          if (attempts <= maxRetries) {
            const delay = baseDelay * Math.pow(2, attempts - 1);
            console.warn(`[AnthropicClient] Attempt ${attempts} failed for ${modelId}, retrying in ${delay}ms...: ${error.message}`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      console.warn(`[AnthropicClient] ${modelId} failed. Routing to next fallback tier.`);
    }

    throw new Error(`Anthropic completion failed for all models. Last error: ${lastError?.message || lastError}`);
  }

  /**
   * Format messages for Anthropic API format
   * Anthropic uses a different message format than OpenAI
   */
  private formatMessages(messages: Array<{ role: string; content: string }>): Array<{ role: string; content: string }> {
    return messages.map(msg => ({
      role: msg.role === 'system' ? 'user' : msg.role, // Anthropic handles system differently
      content: msg.content,
    }));
  }

  /**
   * Extract system message from messages array
   */
  private extractSystemMessage(messages: Array<{ role: string; content: string }>): string | undefined {
    const systemMsg = messages.find(m => m.role === 'system');
    return systemMsg?.content;
  }

  /**
   * Internal method to execute the actual fetch request to Anthropic API
   */
  private async _executeFetch(
    modelId: string,
    requestBody: {
      model: string;
      messages: Array<{ role: string; content: string }>;
      temperature: number;
      top_p?: number;
      max_tokens: number;
    }
  ): Promise<LLMResponse> {
    const endpoint = `${this.baseUrl}/v1/messages`;

    // Extract system message if present
    const userSystemMessage = this.extractSystemMessage(requestBody.messages);
    const nonSystemMessages = requestBody.messages.filter(m => m.role !== 'system');

    // Default system prompt for JSON-focused responses
    const jsonSystemPrompt = `You are an AI assistant that ONLY responds with valid JSON.
CRITICAL RULES:
1. NEVER include markdown formatting, headers, or code blocks
2. NEVER include explanatory text before or after the JSON
3. Your ENTIRE response must be a single valid JSON object
4. Start your response with { and end with }
5. Do not wrap the JSON in \`\`\`json\`\`\` or any other formatting`;

    const anthropicBody: any = {
      model: requestBody.model,
      messages: nonSystemMessages,
      max_tokens: requestBody.max_tokens,
      temperature: requestBody.temperature,
      ...(requestBody.top_p !== undefined && { top_p: requestBody.top_p }),
    };

    // Combine default JSON system prompt with user's system message if present
    if (userSystemMessage) {
      anthropicBody.system = `${jsonSystemPrompt}\n\n${userSystemMessage}`;
    } else {
      anthropicBody.system = jsonSystemPrompt;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': this.authToken, // Some proxies use this header
      },
      body: JSON.stringify(anthropicBody),
      signal: AbortSignal.timeout(Math.max(Number(process.env.GENERATION_TIMEOUT_MS) || 0, 300000)), // Increased from 60s to 5min for GLM-4.7
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage: string;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorData.message || `HTTP error! status: ${response.status}`;
      } catch {
        errorMessage = errorText || `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();

    // Anthropic response format: { content: [{ type: 'text', text: '...' }], usage: {...} }
    const text = result.content?.[0]?.text || result.content?.[0]?.value || '';
    const usage = result.usage || { input_tokens: 0, output_tokens: 0 };

    const cost = this.calculateCost(modelId, usage.input_tokens, usage.output_tokens);

    return {
      text,
      output: text, // For LangfuseService compatibility
      usage: {
        input: usage.input_tokens,
        output: usage.output_tokens,
        total: usage.input_tokens + usage.output_tokens,
      },
      model: modelId,
      cost,
    };
  }

  /**
   * Generate with ZOD validation retry loop.
   * Feeds validation errors back to model for self-correction.
   *
   * @param messages - Message array for LLM
   * @param schema - ZOD schema to validate against
   * @param options - LLM options (temperature, maxTokens, etc.)
   * @param maxRetries - Maximum retry attempts (default: 3)
   * @returns Validated parsed response
   * @throws Error if all retries exhausted
   */
  public async generateWithRetry<T>(
    messages: Array<{ role: string; content: string }>,
    schema: z.ZodSchema<T>,
    options: LLMOptions,
    maxRetries: number = 3
  ): Promise<T> {
    let currentPrompt = messages[0]?.content || '';
    let lastError: any;
    let attemptNumber = 0;

    for (attemptNumber = 1; attemptNumber <= maxRetries; attemptNumber++) {
      try {
        // Call LLM with current prompt
        const response = await this.sendCompletion(
          [{ role: 'user', content: currentPrompt }],
          options
        );

        // Phase 1: Extract JSON from response
        const jsonContent = this.extractJson(response.text);

        // Phase 2: Validate against ZOD schema
        const validated = schema.parse(jsonContent);

        // Log success metrics
        if (attemptNumber > 1) {
          console.info(`[AnthropicClient] Validation succeeded on attempt ${attemptNumber}`);
          this.langfuseService?.event({
            name: 'validation_retry_success',
            metadata: { attempt: attemptNumber, agent: options.agentName }
          });
        }

        return validated;

      } catch (error: any) {
        lastError = error;

        // If this is the last attempt, throw
        if (attemptNumber >= maxRetries) {
          console.error(`[AnthropicClient] Validation failed after ${maxRetries} attempts`);
          this.langfuseService?.logError(
            `Validation failed after ${maxRetries} attempts: ${error.message}`,
            { lastError }
          );
          throw new Error(
            `LLM validation failed after ${maxRetries} attempts. ` +
            `Last error: ${error instanceof z.ZodError ? this.formatZodError(error) : error.message}`
          );
        }

        // Format error for retry
        const errorMessage = error instanceof z.ZodError
          ? this.formatZodError(error)
          : `JSON parsing error: ${error.message}`;

        console.warn(
          `[AnthropicClient] Attempt ${attemptNumber} failed: ${errorMessage}. Retrying...`
        );

        // Build retry prompt with error feedback
        currentPrompt = this.buildRetryPrompt(messages[0]?.content || '', errorMessage, attemptNumber);

        // Log retry event
        this.langfuseService?.event({
          name: 'validation_retry_attempt',
          metadata: {
            attempt: attemptNumber,
            agent: options.agentName,
            error: errorMessage
          }
        });

        // Exponential backoff before retry
        const backoffMs = Math.min(1000 * Math.pow(2, attemptNumber - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      }
    }

    // Should never reach here, but TypeScript needs it
    throw lastError;
  }

  /**
   * Extract JSON from LLM response (handling potential markdown code blocks)
   * Handles various formats: raw JSON, markdown code blocks, text with embedded JSON
   */
  private extractJson(text: string): any {
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
   * Format ZOD error into human-readable message for LLM.
   */
  private formatZodError(error: z.ZodError): string {
    const issues = error.issues.map(issue => {
      const path = issue.path.length > 0 ? issue.path.join('.') : 'root';
      return `${path}: ${issue.message}`;
    });

    return `Validation errors:\n${issues.map(e => `  - ${e}`).join('\n')}`;
  }

  /**
   * Build retry prompt with error feedback.
   */
  private buildRetryPrompt(
    originalPrompt: string,
    errorMessage: string,
    attemptNumber: number
  ): string {
    return `${originalPrompt}

---
⚠️ VALIDATION FAILED (Attempt ${attemptNumber})

Your previous response failed validation. Please fix these errors:

${errorMessage}

INSTRUCTIONS FOR RETRY:
1. Review the errors above carefully
2. Return ONLY a valid JSON object
3. Ensure ALL required fields are present
4. Match the exact types specified in the schema
5. Do NOT include any text outside the JSON object

Please try again with a corrected response.`;
  }

  public getModelPricing(model: string): { input: number; output: number } {
    return this.PRICING[model] || this.PRICING['default'];
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
