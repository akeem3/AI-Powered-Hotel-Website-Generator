import { LLMProvider } from './LLMProvider';
import { OpenRouterClient } from './OpenRouterClient';
import { AnthropicClient } from './AnthropicClient';

export type LLMProviderType = 'openrouter' | 'anthropic';

/**
 * Factory for creating LLM provider instances.
 *
 * Supports switching between providers via LLM_PROVIDER environment variable:
 * - 'openrouter' (default): Uses OpenRouter API
 * - 'anthropic': Uses Anthropic API (or compatible proxy like Z.ai)
 *
 * @example
 * ```typescript
 * // Uses LLM_PROVIDER env var
 * const provider = LLMProviderFactory.create();
 *
 * // Explicit provider selection
 * const anthropicProvider = LLMProviderFactory.create('anthropic');
 * ```
 */
export class LLMProviderFactory {
  /**
   * Create an LLM provider instance
   * @param providerType Optional provider type, defaults to LLM_PROVIDER env var or 'openrouter'
   * @param langfuseService Optional LangFuse service for observability
   * @param costMonitor Optional cost monitor service
   */
  static create(
    providerType?: LLMProviderType,
    langfuseService?: any,
    costMonitor?: any
  ): LLMProvider {
    const provider = providerType || (process.env.LLM_PROVIDER as LLMProviderType) || 'openrouter';

    switch (provider) {
      case 'anthropic':
        console.log('[LLMProviderFactory] Creating AnthropicClient');
        return new AnthropicClient(langfuseService, costMonitor);

      case 'openrouter':
      default:
        console.log('[LLMProviderFactory] Creating OpenRouterClient');
        return new OpenRouterClient(langfuseService, costMonitor);
    }
  }

  /**
   * Get the current provider type from environment
   */
  static getCurrentProviderType(): LLMProviderType {
    return (process.env.LLM_PROVIDER as LLMProviderType) || 'openrouter';
  }

  /**
   * Check if a provider type is valid
   */
  static isValidProvider(provider: string): provider is LLMProviderType {
    return ['openrouter', 'anthropic'].includes(provider);
  }
}
