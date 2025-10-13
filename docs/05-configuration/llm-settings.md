# LLM Configuration Settings

This document describes the configurable LLM settings that control token limits, model selection, and generation parameters.

## Overview

The LLM service now uses a centralized configuration system that allows you to:
- Configure token limits for different operation types
- Override settings via environment variables
- Prevent response truncation issues
- Control costs and quality trade-offs

## Configuration File

Settings are defined in `src/lib/llm-config.ts` with the following structure:

```typescript
export interface LLMConfig {
  tokenLimits: TokenLimits;
  models: LLMModels;
  parameters: LLMParameters;
}
```

## Token Limits

### Default Values

| Operation Type | Default Tokens | Environment Variable | Description |
|----------------|----------------|---------------------|-------------|
| `default` | 1500 | `LLM_TOKENS_DEFAULT` | General text generation |
| `hotelAnalysis` | 2500 | `LLM_TOKENS_HOTEL_ANALYSIS` | Hotel analysis operations |
| `componentSelection` | 3500 | `LLM_TOKENS_COMPONENT_SELECTION` | Component selection (largest output) |
| `siteConfiguration` | 4000 | `LLM_TOKENS_SITE_CONFIG` | Website configuration generation |
| `qualityValidation` | 2000 | `LLM_TOKENS_QUALITY_VALIDATION` | Quality analysis and validation |
| `hotelContent` | 1000 | `LLM_TOKENS_HOTEL_CONTENT` | Legacy content generation |
| `test` | 100 | `LLM_TOKENS_TEST` | Test operations |

### Why These Limits?

The token limits were set based on:

1. **Preventing Truncation**: Previous limits caused `"finish_reason": "length"` errors
2. **JSON Response Size**: Structured outputs need more tokens than simple text
3. **Cost Control**: Higher limits for critical operations, lower for less important ones
4. **Model Capabilities**: Optimized for the kimi-k2 model used in Epic 3

## Model Configuration

| Model Type | Default Value | Environment Variable | Usage |
|------------|---------------|---------------------|-------|
| `primary` | `anthropic/claude-3.5-sonnet` | `LLM_MODEL_PRIMARY` | High-quality reasoning |
| `fallback` | `anthropic/claude-3-haiku` | `LLM_MODEL_FALLBACK` | Cost-efficient backup |
| `budget` | `openai/gpt-4o-mini` | `LLM_MODEL_BUDGET` | Ultra-low-cost operations |
| `sample` | `moonshotai/kimi-k2` | `LLM_MODEL_SAMPLE` | Sample workflow optimized |

## Generation Parameters

| Parameter | Default | Environment Variable | Range | Description |
|-----------|---------|---------------------|-------|-------------|
| `temperature` | 0.7 | `LLM_TEMPERATURE` | 0.0 - 2.0 | Creativity level |
| `topP` | 1.0 | `LLM_TOP_P` | 0.0 - 1.0 | Nucleus sampling |
| `frequencyPenalty` | 0.0 | `LLM_FREQUENCY_PENALTY` | -2.0 - 2.0 | Repetition reduction |
| `presencePenalty` | 0.0 | `LLM_PRESENCE_PENALTY` | -2.0 - 2.0 | Topic diversity |
| `maxRetries` | 3 | `LLM_MAX_RETRIES` | 1+ | Retry attempts |
| `retryDelay` | 1000 | `LLM_RETRY_DELAY` | 100+ | Base delay (ms) |

## Environment Variable Usage

### Setting Token Limits

```bash
# Increase component selection tokens to prevent truncation
export LLM_TOKENS_COMPONENT_SELECTION=4000

# Reduce test tokens for cost savings
export LLM_TOKENS_TEST=50
```

### Changing Models

```bash
# Use a different primary model
export LLM_MODEL_PRIMARY="anthropic/claude-3-opus"

# Change the sample workflow model
export LLM_MODEL_SAMPLE="openai/gpt-4"
```

### Tuning Parameters

```bash
# More creative generation
export LLM_TEMPERATURE=0.9

# More focused responses
export LLM_TOP_P=0.8

# Reduce repetition
export LLM_FREQUENCY_PENALTY=0.5
```

## Troubleshooting

### Response Truncation Issues

**Symptoms:**
- `"finish_reason": "length"` in OpenRouter logs
- Null outputs in LangFuse
- JSON parsing errors

**Solutions:**
1. Check OpenRouter logs for token usage
2. Increase the relevant token limit:
   ```bash
   export LLM_TOKENS_COMPONENT_SELECTION=5000
   ```
3. Restart the application

### Cost Control

**High Costs:**
- Reduce token limits for non-critical operations
- Switch to budget models for testing
- Use fallback models more frequently

**Low Quality:**
- Increase token limits for important operations
- Switch to primary models for critical tasks
- Adjust temperature and other parameters

### Configuration Validation

The configuration is automatically validated on startup. Check logs for:

```
[LLM Config] Configuration loaded successfully
[LLM Config] Token limits: { ... }
```

If validation fails, check:
1. All token limits are positive numbers
2. Model names are valid OpenRouter model IDs
3. Parameter values are within valid ranges

## Integration Examples

### Cost-Conscious Setup

```bash
export LLM_TOKENS_DEFAULT=1000
export LLM_TOKENS_HOTEL_ANALYSIS=2000
export LLM_TOKENS_COMPONENT_SELECTION=2500
export LLM_MODEL_PRIMARY="openai/gpt-4o-mini"
export LLM_MODEL_SAMPLE="openai/gpt-4o-mini"
```

### Quality-Focused Setup

```bash
export LLM_TOKENS_DEFAULT=2000
export LLM_TOKENS_HOTEL_ANALYSIS=3000
export LLM_TOKENS_COMPONENT_SELECTION=4500
export LLM_MODEL_PRIMARY="anthropic/claude-3.5-sonnet"
export LLM_MODEL_SAMPLE="anthropic/claude-3-haiku"
export LLM_TEMPERATURE=0.3
```

### Development/Testing Setup

```bash
export LLM_TOKENS_TEST=200
export LLM_MODEL_SAMPLE="openai/gpt-4o-mini"
export LLM_MAX_RETRIES=1
export LLM_RETRY_DELAY=500
```

## Best Practices

1. **Monitor OpenRouter Logs**: Watch for `finish_reason` patterns
2. **Track LangFuse Outputs**: Ensure null outputs are resolved
3. **Cost Analysis**: Use cost monitor to understand token usage patterns
4. **Gradual Tuning**: Adjust limits incrementally based on actual usage
5. **Environment-Specific**: Use different configs for dev/staging/prod

## Migration Notes

This configuration system replaces hardcoded values in the LLM service. No breaking changes to the API, but environment variables now take precedence over defaults.

**Previous Issue:**
```
"finish_reason": "length" → Truncated responses → Null LangFuse outputs
```

**Current Solution:**
```
Configurable limits → Complete responses → Proper LangFuse capture
```