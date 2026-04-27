/**
 * LLM Provider Interface
 *
 * Abstracts LLM provider implementation details, allowing the workflow
 * to switch between OpenRouter, Anthropic, or other providers.
 */

export interface LLMOptions {
  agentName: string;
  budgetRemaining: number;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  text: string;
  output?: string; // Alias for LangfuseService compatibility
  usage: {
    input: number;
    output: number;
    total: number;
  };
  model: string;
  cost: number;
}

export interface LLMProvider {
  /**
   * Send a completion request to the LLM provider
   */
  sendCompletion(
    messages: Array<{ role: string; content: string }>,
    options: LLMOptions
  ): Promise<LLMResponse>;

  /**
   * Select the appropriate model based on task and budget
   */
  selectModel(task: string, budgetRemaining: number): string;

  /**
   * Get available models for this provider
   */
  getAvailableModels(): string[];

  /**
   * Get pricing info for a model (per 1K tokens)
   */
  getModelPricing(model: string): { input: number; output: number };
}
