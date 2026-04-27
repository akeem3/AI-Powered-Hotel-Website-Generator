# Cost Tracking with LangFuse

## Overview

LangFuse integration provides detailed cost tracking and observability for LLM operations in the hotel website generation workflow.

## Integration Architecture

### LangFuse Client Setup

The codebase uses a `LangFuseService` wrapper to manage traces and generations centrally.

```typescript
import { LangFuseService } from '../services/LangFuseService';

const langfuseService = new LangFuseService();
```

### Trace Management

Each generation workflow creates a trace automatically via the service:

```typescript
// Starts a trace for the workflow
this.langfuseService.startWorkflowTrace('HomepageGenerationWorkflow', {
  generationId: input.generationId,
  hotelName: input.hotelParameters.hotelName,
});
```

## Cost Metrics

### Tracked Metrics

1. **Token Usage**
   - Input tokens per agent
   - Output tokens per agent
   - Total tokens per workflow

2. **Cost Calculation**
   - Cost per 1M tokens (input/output)
   - Cost per agent execution
   - Total workflow cost

3. **Performance Metrics**
   - Latency per agent
   - Total workflow duration
   - Cache hit rates

### Cost Breakdown by Agent

*Estimates based on Primary Model (`moonshotai/kimi-k2`) pricing.*

| Agent | Avg Input Tokens | Avg Output Tokens | Est. Cost/Run |
|-------|------------------|-------------------|---------------|
| Component Selector | 2,500 | 800 | ~$0.0006 |
| Styling Agent | 3,200 | 1,500 | ~$0.0009 |
| Content Generator | 4,000 | 2,500 | ~$0.0014 |
| Assembly Agent | 6,000 | 3,000 | ~$0.0018 |
| Quality Validator | 5,000 | 1,000 | ~$0.0009 |
| **Total** | **20,700** | **8,800** | **~$0.0056** |

> **Note on Budget vs. Estimates:** The project enforces a **$2.00 hard budget cap** (`MAX_GENERATION_COST`) for safety, even though the estimated cost with the primary model is significantly lower (<$0.01). This large buffer accommodates potential retries, model fallbacks to more expensive providers (e.g., Claude 3 Haiku or GPT-4o), and future feature expansions.

## Usage Patterns

### Creating Spans (Internal)

The `LangFuseService` handles span creation internally within `executeGeneration`:

```typescript
// Example usage inside an agent
const result = await this.langfuseService.executeGeneration(
  this.agentName,
  observabilityInput,
  { model: 'moonshotai/kimi-k2' },
  async () => {
    // Perform LLM call
    return await this.openRouterClient.sendCompletion(...);
  }
);
```

### Scoring and Feedback

```typescript
// Score generation quality
this.langfuseService.addScore('quality-score', 85, 'Visual validation passed');
```

## Cost Optimization Strategies

### 1. Caching

Caching is implemented at the OpenRouter level or can be added to the `LangFuseService`.

### 2. Prompt Optimization

- Use system prompts efficiently
- Minimize context window usage
- Batch similar requests

### 3. Model Selection

The system uses intelligent routing based on remaining budget:

| Tier | Model | Rationale | Budget Threshold |
|------|-------|-----------|------------------|
| **Primary** | `moonshotai/kimi-k2` | Extremely cost-effective, good reasoning | > $1.00 |
| **Fallback** | `anthropic/claude-3-haiku` | Reliable, fast, moderate cost | $0.50 - $1.00 |
| **Budget** | `openai/gpt-4o-mini` | Low cost, reliable instruction following | < $0.50 |

## Monitoring and Alerts

### Dashboards

LangFuse provides dashboards for:
- Total costs over time
- Cost per hotel generated
- Agent performance comparison
- Error rates and debugging

### Budget Alerts

Budget enforcement is handled by `CostMonitor` within the workflow code, checking limits after each agent execution.

## Related Documentation
- [LangGraph Workflows](./langgraph-workflows.md)
- [LLM Integration](./llm-integration.md)
- [API Reference](./api-reference.md)
- [LangFuse Validation](./langfuse-validation.md)
