# SGR Implementation - Quick Reference Card

**Date:** 2026-02-03
**Purpose:** Developer quick reference for Schema-Guided Reasoning implementation

---

## Documents Index

| Document | Purpose | Link |
|----------|---------|------|
| **Implementation Plan** | Overall strategy and timeline | [`sgr-implementation-plan.md`](./sgr-implementation-plan.md) |
| **Validation Retry Spec** | Technical spec for retry wrapper | [`sgr-validation-retry-spec.md`](./sgr-validation-retry-spec.md) |
| **Prompt Enhancement Guide** | SGR prompt patterns for all agents | [`sgr-prompt-enhancement-guide.md`](./sgr-prompt-enhancement-guide.md) |
| **Schema Enhancement Guide** | ZOD schema improvements | [`sgr-schema-enhancement-guide.md`](./sgr-schema-enhancement-guide.md) |
| **Research Report** | SGR research findings | [`../research/schema-guided-reasoning-sgr_2026-02-03_a1b2.md`](../research/schema-guided-reasoning-sgr_2026-02-03_a1b2.md) |

---

## TL;DR - What is SGR?

**Schema-Guided Reasoning** = Explicit reasoning steps + structured output

Instead of asking the LLM to "return JSON", we guide it through a specific reasoning sequence:

```
1. FIRST: Analyze X
2. THEN: Decide Y
3. FINALLY: Justify Z
```

Result: 95-100% JSON validation success (vs ~80% currently)

---

## Three SGR Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Cascade** | Sequential reasoning | Analyze → Select → Justify |
| **Routing** | Forced choice paths | Luxury path vs Budget path |
| **Cycle** | Repeated operations | Generate 5 room cards |

---

## Implementation Phases

### Phase 1: Validation Retry (Week 1)
**Highest impact, lowest effort**

**What:** Wrap LLM calls with retry loop that feeds ZOD errors back to model

**Where:** [`AnthropicClient.ts`](../../web-app/app/langgraph/services/AnthropicClient.ts)

**Expected:** 95-100% success rate

**Code:**
```typescript
const result = await anthropicClient.generateWithRetry(
  [{ role: 'user', content: prompt }],
  ComponentSelectorOutputSchema,
  { agentName: 'ComponentSelector', budgetRemaining: 1.0 }
);
```

### Phase 2: Prompt Enhancement (Week 2)
**Medium impact, low effort**

**What:** Apply Cascade pattern to all agent prompts

**Where:** [`docs/prompts/*.md`](../prompts/)

**Expected:** +5-10% accuracy improvement

**Template:**
```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: [Step Name]
   - [Sub-step 1]

2. THEN: [Step Name]
   - [Sub-step 1]

3. FINALLY: [Step Name]
   - [Sub-step 1]
```

### Phase 3: Schema Enhancement (Week 3+)
**Lower impact, higher effort**

**What:** Add reasoning steps to ZOD schemas

**Where:** [`schemas.ts`](../../web-app/app/langgraph/agents/schemas.ts)

**Expected:** Better debuggability

**Example:**
```typescript
// Before
const Schema = z.object({
  output: z.string(),
  reasoning: z.string()
});

// After
const Schema = z.object({
  analysis: z.object({ ... }),
  output: z.string(),
  rationale: z.object({ ... })
});
```

---

## File Changes Summary

### Phase 1 Files

| File | Changes | Lines |
|------|---------|-------|
| `AnthropicClient.ts` | Add `generateWithRetry()` | +80 |
| `BaseAgent.ts` | Add convenience method | +15 |
| `AnthropicClient.test.ts` | Add unit tests | +150 |

### Phase 2 Files

| File | Changes | Lines |
|------|---------|-------|
| `01-component-selector.md` | Add Cascade pattern | +30 |
| `02-styling-agent.md` | Add Cascade pattern | +40 |
| `03-content-generator.md` | Add Cascade pattern | +50 |
| `04-assembly-agent.md` | Add Routing + Cycle | +35 |

### Phase 3 Files

| File | Changes | Lines |
|------|---------|-------|
| `schemas.ts` | Add reasoning step schemas | +200 |
| `ComponentSelector.ts` | Use new schema | +10 |
| `StylingAgent.ts` | Use new schema | +10 |
| `ContentGenerator.ts` | Use new schema | +10 |
| `AssemblyAgent.ts` | Use new schema | +10 |

---

## Key Code Patterns

### Validation Retry Pattern

```typescript
// In AnthropicClient
public async generateWithRetry<T>(
  messages: Array<{ role: string; content: string }>,
  schema: z.ZodSchema<T>,
  options: LLMOptions,
  maxRetries = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await this.sendCompletion(messages, options);
      const jsonContent = this.extractJson(response.text);
      return schema.parse(jsonContent); // Success!
    } catch (error) {
      if (attempt === maxRetries) throw error;
      // Build retry prompt with error feedback
      messages[0].content += `\n\nError: ${this.formatZodError(error)}\nPlease fix.`;
    }
  }
}
```

### Cascade Prompt Pattern

```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: Analyze requirements
   - Identify core functionality
   - Determine complexity level

2. THEN: Select components
   - Choose from available options
   - Apply constraints

3. FINALLY: Justify decisions
   - Explain choices
   - Provide rationale
```

### SGR Schema Pattern

```typescript
const OutputSchema = z.object({
  // Step 1: Analysis
  analysis: z.object({
    field1: z.string(),
    field2: z.string()
  }),

  // Step 2: Output
  output: z.object({
    result: z.string()
  }),

  // Step 3: Rationale
  rationale: z.object({
    reasoning: z.string()
  })
});
```

---

## Testing Checklist

### Unit Tests
- [ ] `generateWithRetry()` succeeds on first attempt
- [ ] `generateWithRetry()` retries with error feedback
- [ ] `generateWithRetry()` throws after max retries
- [ ] `formatZodError()` formats errors correctly
- [ ] Backoff delay increases exponentially

### Integration Tests
- [ ] ComponentSelector > 95% success rate (100 runs)
- [ ] StylingAgent > 95% success rate (100 runs)
- [ ] ContentGenerator > 95% success rate (100 runs)
- [ ] AssemblyAgent > 95% success rate (100 runs)
- [ ] Full workflow > 90% success rate (50 runs)

### Quality Tests
- [ ] Output quality score ≥ 8/10
- [ ] No regression in functionality
- [ ] Cost increase < 20%
- [ ] Latency increase < 30%

---

## Rollout Strategy

### Stage 1: ComponentSelector Pilot
```bash
# Feature flag
export SGR_RETRY_ENABLED=true
export SGR_PROMPT_ENHANCED=component-selector

# Run 100 test generations
npm test -- ComponentSelector

# Verify >95% success rate
```

### Stage 2: All Agents
```bash
# Enable for all agents
export SGR_PROMPT_ENHANCED=all

# Run full workflow tests
npm test -- workflow

# Verify >90% end-to-end success
```

### Stage 3: Production
```bash
# Gradual rollout (10% -> 50% -> 100%)
export SGR_ROLLOUT_PERCENTAGE=10

# Monitor metrics
npm run observe:metrics
```

---

## Success Metrics

| Metric | Current | Target | How to Measure |
|--------|---------|--------|----------------|
| Validation Success | ~80% | >95% | ZOD parse success rate |
| Avg Retries per Call | 0 | <1.5 | Retry counter |
| Token Usage | baseline | <120% | LangFuse telemetry |
| Output Quality | 8/10 | ≥8/10 | Human evaluation |
| Cost per Generation | $2.00 | <$2.40 | Cost monitoring |

---

## Environment Variables

```bash
# Phase 1: Validation Retry
SGR_MAX_RETRIES=3
SGR_RETRY_ENABLED=true
SGR_BACKOFF_BASE_MS=1000
SGR_BACKOFF_MAX_MS=5000

# Phase 2: Prompt Enhancement
SGR_PROMPT_VERSION=sgr
SGR_CASCADE_ENABLED=true

# Phase 3: Schema Enhancement
SGR_SCHEMA_VERSION=v2
SGR_REASONING_STEPS=true

# Rollout Control
SGR_ROLLOUT_PERCENTAGE=100
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Infinite retries | Bad prompt or schema | Fix prompt/schema, check maxRetries |
| High token usage | Too many retries | Tune prompt, increase temperature |
| Slow generation | Exponential backoff | Reduce backoff times |
| Quality degradation | Poor error feedback | Improve formatZodError() |

---

## Quick Commands

```bash
# Run SGR tests
npm test -- sgr

# Run with SGR enabled
SGR_RETRY_ENABLED=true npm start

# Monitor SGR metrics
npm run observe:sgr

# Compare before/after
npm run compare:sgr

# Rollback SGR changes
npm run rollback:sgr
```

---

## Team Contacts

| Role | Name | Slack |
|------|------|-------|
| Lead Developer | TBD | @tbd |
| Backend Developer | TBD | @tbd |
| QA Engineer | TBD | @tbd |

---

## Related Research

- [Schema-Guided Reasoning by Rinat Abdullin](https://abdullin.com/schema-guided-reasoning/)
- [SGR Patterns Documentation](https://abdullin.com/schema-guided-reasoning/patterns)
- [GLM-4.7 Structured Output](https://docs.z.ai/guides/capabilities/struct-output)

---

**Last Updated:** 2026-02-03
**Status:** Ready for Implementation
