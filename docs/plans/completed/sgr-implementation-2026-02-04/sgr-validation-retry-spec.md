# SGR Validation Retry Wrapper - Technical Specification

**Date:** 2026-02-03
**Component:** AnthropicClient / BaseAgent
**Priority:** High (Phase 1)
**Dependencies:** None

---

## Purpose

Implement a validation retry loop that wraps all LLM calls, feeds ZOD validation errors back to the model, and achieves 95-100% JSON validation success rate.

---

## Related Documents

- [SGR Implementation Plan](./sgr-implementation-plan.md) - Overall implementation strategy
- [AnthropicClient.ts](../../web-app/app/langgraph/services/AnthropicClient.ts) - Current LLM client
- [BaseAgent.ts](../../web-app/app/langgraph/agents/BaseAgent.ts) - Agent base class
- [schemas.ts](../../web-app/app/langgraph/agents/schemas.ts) - ZOD schemas

---

## Architecture

### Current Flow (Without Retry)

```
┌────────────────┐
│   Agent        │
│  performGen    │
└────────┬───────┘
         │
         ▼
┌────────────────┐     ┌──────────────┐     ┌─────────────┐
│ AnthropicClient│────▶│   GLM-4.7    │────▶│   JSON      │
│  sendCompletion│     │              │     │  Response   │
└────────────────┘     └──────────────┘     └──────┬──────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │  ZOD.parse() │────▶ 80% success
                                              └──────────────┘
                                                      │
                                                      ▼ (20%)
                                              ┌──────────────┐
                                              │   THROW      │
                                              │   ERROR      │
                                              └──────────────┘
```

### New Flow (With Retry)

```
┌────────────────┐
│   Agent        │
│  performGen    │
└────────┬───────┘
         │
         ▼
┌────────────────┐     ┌──────────────┐     ┌─────────────┐
│ AnthropicClient│────▶│   GLM-4.7    │────▶│   JSON      │
│generateWithRetry│    │              │     │  Response   │
└────────┬───────┘     └──────────────┘     └──────┬──────┘
         │                                              │
         │                                              ▼
         │                                      ┌──────────────┐
         │                                      │  ZOD.parse() │────▶ 95%+ success
         │                                      └──────┬───────┘
         │                                              │
         │                                    ┌─────────┴─────────┐
         │                                    │                   │
         │                        (5% fail)   ▼                   ▼
         │                              ┌──────────┐        ┌──────────┐
                         ┌─────────────────┤ SUCCESS  │        │  THROW   │
                         │                 └──────────┘        └──────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  formatZodError │
                │  (add to prompt) │
                └────────┬─────────┘
                         │
                         ▼
                ┌─────────────────┐
                │   Retry (max 3) │
                └────────┬─────────┘
                         │
                         └──────────────────┐
                                             ▼
                                    (Repeat LLM call with error feedback)
```

---

## Implementation

### 1. AnthropicClient Changes

**File:** [`web-app/app/langgraph/services/AnthropicClient.ts`](../../web-app/app/langgraph/services/AnthropicClient.ts)

**Add new method:**

```typescript
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
```

### 2. BaseAgent Changes

**File:** [`web-app/app/langgraph/agents/BaseAgent.ts`](../../web-app/app/langgraph/agents/BaseAgent.ts)

**Add utility method for agents:**

```typescript
/**
 * Execute LLM generation with automatic validation retry.
 * Convenience method for agents to use generateWithRetry.
 *
 * @param prompt - The prompt to send to LLM
 * @param schema - ZOD schema for validation
 * @param options - LLM options
 * @returns Validated parsed response
 */
protected async generateWithRetry<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options?: Partial<LLMOptions>
): Promise<T> {
  return (this.llmProvider as AnthropicClient).generateWithRetry(
    [{ role: 'user', content: prompt }],
    schema,
    {
      agentName: this.agentName,
      budgetRemaining: 0, // Will be read from state in actual use
      temperature: options?.temperature ?? 0.2,
      maxTokens: options?.maxTokens ?? 4000
    }
  );
}
```

### 3. Agent Usage Examples

**ComponentSelector with retry:**

```typescript
// Before (current implementation)
async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState>> {
  const prompt = await this.loadPrompt('component-selector', state.hotelParameters);

  const response = await this.openRouterClient.sendCompletion(
    [{ role: 'user', content: prompt }],
    { agentName: this.agentName, budgetRemaining: state.budgetRemaining }
  );

  const jsonContent = this.extractJson(response.text);
  const validated = ComponentSelectorOutputSchema.parse(jsonContent);

  return { componentSelection: validated, ...this.updateStepCost(response.cost) };
}

// After (with retry)
async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState>> {
  const prompt = await this.loadPrompt('component-selector', state.hotelParameters);

  const validated = await this.generateWithRetry(
    prompt,
    ComponentSelectorOutputSchema,
    {
      agentName: this.agentName,
      budgetRemaining: state.budgetRemaining
    }
  );

  // Note: generateWithRetry doesn't return usage/cost, so we need to track separately
  // or extend the method to return metadata

  return { componentSelection: validated };
}
```

---

## Error Formatting

### ZOD Error Examples

**Example 1: Missing required field**
```
Validation errors:
  - selectedComponents: Required
```

**Example 2: Type mismatch**
```
Validation errors:
  - selectedComponents: Expected array, received undefined
  - layoutStructure: Invalid enum value. Expected 'single-column' | 'grid' | 'mixed', received 'invalid'
```

**Example 3: Array constraints**
```
Validation errors:
  - selectedComponents: Array must contain at least 5 elements
```

**Example 4: Character limits**
```
Validation errors:
  - reasoning: String must contain at least 50 character(s)
```

---

## Testing

### Unit Tests

```typescript
// File: web-app/app/langgraph/services/__tests__/AnthropicClient.test.ts

describe('AnthropicClient.generateWithRetry', () => {
  let client: AnthropicClient;
  let mockLLM: jest.Mock;

  beforeEach(() => {
    client = new AnthropicClient();
    mockLLM = jest.fn();
  });

  it('should succeed on first attempt with valid response', async () => {
    mockLLM.mockResolvedValueOnce({
      text: JSON.stringify({ selectedComponents: ['hero', 'rooms'] }),
      usage: { input: 100, output: 100, total: 200 },
      cost: 0.01
    });

    const result = await client.generateWithRetry(
      [{ role: 'user', content: 'test' }],
      ComponentSelectorOutputSchema,
      { agentName: 'test', budgetRemaining: 1 }
    );

    expect(result.selectedComponents).toEqual(['hero', 'rooms']);
    expect(mockLLM).toHaveBeenCalledTimes(1);
  });

  it('should retry with ZOD error feedback on validation failure', async () => {
    // First call: invalid response
    mockLLM.mockResolvedValueOnce({
      text: JSON.stringify({ selectedComponents: undefined }),
      usage: { input: 100, output: 100, total: 200 },
      cost: 0.01
    });

    // Second call: valid response
    mockLLM.mockResolvedValueOnce({
      text: JSON.stringify({ selectedComponents: ['hero', 'rooms'] }),
      usage: { input: 100, output: 100, total: 200 },
      cost: 0.01
    });

    const result = await client.generateWithRetry(
      [{ role: 'user', content: 'test' }],
      ComponentSelectorOutputSchema,
      { agentName: 'test', budgetRemaining: 1 }
    );

    expect(result.selectedComponents).toEqual(['hero', 'rooms']);
    expect(mockLLM).toHaveBeenCalledTimes(2);

    // Verify retry prompt included error feedback
    const secondCallPrompt = mockLLM.mock.calls[1][0][0].content;
    expect(secondCallPrompt).toContain('VALIDATION FAILED');
    expect(secondCallPrompt).toContain('selectedComponents: Required');
  });

  it('should throw after max retries exhausted', async () => {
    // All calls return invalid response
    mockLLM.mockResolvedValue({
      text: JSON.stringify({ selectedComponents: undefined }),
      usage: { input: 100, output: 100, total: 200 },
      cost: 0.01
    });

    await expect(
      client.generateWithRetry(
        [{ role: 'user', content: 'test' }],
        ComponentSelectorOutputSchema,
        { agentName: 'test', budgetRemaining: 1 },
        3 // maxRetries
      )
    ).rejects.toThrow('failed after 3 attempts');

    expect(mockLLM).toHaveBeenCalledTimes(3);
  });

  it('should apply exponential backoff between retries', async () => {
    mockLLM.mockResolvedValue({
      text: JSON.stringify({ selectedComponents: undefined }),
      usage: { input: 100, output: 100, total: 200 },
      cost: 0.01
    });

    const startTime = Date.now();
    await client.generateWithRetry(
      [{ role: 'user', content: 'test' }],
      ComponentSelectorOutputSchema,
      { agentName: 'test', budgetRemaining: 1 },
      3
    );
    const duration = Date.now() - startTime;

    // 3 calls = 2 retries with backoff: ~1s + ~2s = ~3s minimum
    expect(duration).toBeGreaterThan(2500);
  });
});
```

### Integration Tests

```typescript
// File: web-app/app/langgraph/agents/__tests__/ComponentSelector.test.ts

describe('ComponentSelector with validation retry', () => {
  it('should achieve 95%+ success rate over 100 runs', async () => {
    const agent = new ComponentSelector();
    const state: WorkflowState = {
      generationId: 'test-v1',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'business',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Test Location'
      }
    };

    const results = [];
    for (let i = 0; i < 100; i++) {
      try {
        const result = await agent.execute(state);
        results.push({ success: true, result });
      } catch (error) {
        results.push({ success: false, error });
      }
    }

    const successRate = results.filter(r => r.success).length / 100;
    expect(successRate).toBeGreaterThan(0.95);
  });
});
```

---

## Metrics & Monitoring

### LangFuse Events to Track

```typescript
// Success on retry
langfuseService.event({
  name: 'validation_retry_success',
  metadata: {
    agent: 'ComponentSelector',
    attempt: 2,
    errorType: 'missing_field'
  }
});

// Retry attempt
langfuseService.event({
  name: 'validation_retry_attempt',
  metadata: {
    agent: 'ComponentSelector',
    attempt: 1,
    errorMessage: 'selectedComponents: Required'
  }
});

// Final failure
langfuseService.logError('Validation failed after 3 retries', {
  agent: 'ComponentSelector',
  errors: ['selectedComponents: Required', 'layoutStructure: Invalid enum']
});
```

### Metrics Dashboard

```
Validation Retry Metrics
├── Retry Rate (by agent)
│   ├── ComponentSelector: 15%
│   ├── StylingAgent: 20%
│   ├── ContentGenerator: 25%
│   └── AssemblyAgent: 10%
├── Average Attempts per Success
│   ├── ComponentSelector: 1.2
│   ├── StylingAgent: 1.3
│   ├── ContentGenerator: 1.4
│   └── AssemblyAgent: 1.1
├── Error Type Distribution
│   ├── Missing required fields: 40%
│   ├── Type mismatches: 30%
│   ├── Invalid enum values: 20%
│   └── Character limit violations: 10%
└── Cost Impact
    ├── Additional tokens: +15%
    └── Additional cost: +12%
```

---

## Configuration

### Environment Variables

```bash
# Maximum retry attempts (default: 3)
SGR_MAX_RETRIES=3

# Enable/disable retry loop (default: true)
SGR_RETRY_ENABLED=true

# Exponential backoff base delay in ms (default: 1000)
SGR_BACKOFF_BASE_MS=1000

# Maximum backoff delay in ms (default: 5000)
SGR_BACKOFF_MAX_MS=5000
```

---

## Rollout Plan

### Stage 1: Development (Week 1)
1. Implement `generateWithRetry()` in AnthropicClient
2. Add utility method to BaseAgent
3. Write unit tests
4. Test locally with ComponentSelector

### Stage 2: Staging (Week 1)
1. Deploy to staging environment
2. Run 100 test generations
3. Measure improvement
4. Tune retry/backoff parameters

### Stage 3: Production (Week 2)
1. Feature flag for gradual rollout
2. Monitor production metrics
3. Gradually increase traffic
4. Full rollout

---

## Success Criteria

- [x] `generateWithRetry()` implemented in AnthropicClient
- [x] Unit tests passing with >90% coverage
- [x] Integration tests showing 95%+ success rate
- [x] LangFuse events for retry tracking
- [x] Cost increase <20%
- [x] Latency increase <30%

---

**Status:** Ready for Implementation
**Estimated Effort:** 2-3 days
**Dependencies:** None
