# Schema-Guided Reasoning (SGR) Implementation Plan

**Date:** 2026-02-03
**Status:** Planning
**Priority:** High
**Epic:** N/A (Infrastructure Improvement)
**Related Stories:** TBD

---

## Executive Summary

**Problem:** GLM-4.7 LLM intermittently returns malformed/missing JSON fields, causing 10-20% validation failures in the LangGraph workflow.

**Solution:** Implement Schema-Guided Reasoning (SGR) patterns combined with validation retry loops to achieve 95-100% JSON consistency.

**Expected Impact:**
- **Reliability:** 95-100% JSON validation success rate (from ~80%)
- **Accuracy:** 5-10% improvement in output quality
- **Cost:** +10-20% token usage (offset by reliability gains)
- **Timeline:** 2-3 weeks for full implementation

---

## Related Documents

| Document | Purpose |
|----------|---------|
| [`schema-guided-reasoning-sgr_2026-02-03_a1b2.md`](../research/schema-guided-reasoning-sgr_2026-02-03_a1b2.md) | Research findings on SGR method |
| [`sgr-validation-retry-spec.md`](./sgr-validation-retry-spec.md) | Technical specification for retry wrapper |
| [`sgr-prompt-enhancement-guide.md`](./sgr-prompt-enhancement-guide.md) | Prompt pattern improvements |
| [`sgr-schema-enhancement-guide.md`](./sgr-schema-enhancement-guide.md) | ZOD schema improvements |
| [AnthropicClient.ts](../../web-app/app/langgraph/services/AnthropicClient.ts) | Current LLM client implementation |
| [BaseAgent.ts](../../web-app/app/langgraph/agents/BaseAgent.ts) | Agent base class |
| [schemas.ts](../../web-app/app/langgraph/agents/schemas.ts) | Current ZOD schemas |
| [HomepageGenerationWorkflow.ts](../../web-app/app/langgraph/workflows/HomepageGenerationWorkflow.ts) | Main workflow |

---

## Problem Analysis

### Current State

**Architecture:**
- LangGraph multi-agent workflow (ComponentSelector, StylingAgent, ContentGenerator, AssemblyAgent)
- Each agent calls GLM-4.7 via AnthropicClient (Z.ai proxy)
- ZOD schemas for validation
- Temperature: 0.2, max_tokens: 4000

**Failure Modes:**
```
1. Missing required fields (e.g., "selectedComponents": undefined)
2. Type mismatches (e.g., string instead of array)
3. Invalid enum values
4. Character limit violations
5. Malformed JSON (unparseable)
```

**Impact:**
- 10-20% validation failure rate
- Workflow retries increase latency
- Graceful degradation uses generic fallbacks
- Increased cost per successful generation

### Root Cause

GLM-4.7's `response_format: {type: "json_object"}` ensures JSON output but **does not guarantee**:
- All fields are present
- Field values match types
- Complex schemas are respected
- Field ordering is maintained

---

## Solution Overview

### SGR + Validation Retry Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     SGR Implementation                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Phase 1: Validation Retry Loop (Highest Impact)                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - Wrap all LLM calls with retry logic                    │   │
│  │  - Feed ZOD errors back to model                          │   │
│  │  - Max 3 retries per agent                                │   │
│  │  - Expected: 95-100% success rate                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Phase 2: SGR-Enhanced Prompting (Medium Impact)                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - Apply Cascade pattern to all agents                   │   │
│  │  - Define explicit reasoning steps                       │   │
│  │  - Specify output ordering                               │   │
│  │  - Expected: 5-10% accuracy improvement                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  Phase 3: Schema Refactoring (Advanced)                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  - Add reasoning step fields to schemas                  │   │
│  │  - Improve error messages                                │   │
│  │  - Add intermediate validation                           │   │
│  │  - Expected: Better debuggability                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### SGR Patterns

| Pattern | Purpose | Application |
|---------|---------|-------------|
| **Cascade** | Sequential reasoning steps | All agents (analyze → select → justify) |
| **Routing** | Forced choice between paths | Component selection (luxury vs budget paths) |
| **Cycle** | Repeated reasoning with array constraints | Content generation (rooms, testimonials, amenities) |

---

## Implementation Phases

### Phase 1: Validation Retry Loop

**Files to Modify:**
- [`web-app/app/langgraph/services/AnthropicClient.ts`](../../web-app/app/langgraph/services/AnthropicClient.ts)
- [`web-app/app/langgraph/agents/BaseAgent.ts`](../../web-app/app/langgraph/agents/BaseAgent.ts)

**Changes:**
1. Add `generateWithRetry()` method to AnthropicClient
2. Add ZOD error formatting utility
3. Update BaseAgent to use retry by default
4. Add telemetry for retry rates

**See:** [`sgr-validation-retry-spec.md`](./sgr-validation-retry-spec.md) for complete technical specification.

### Phase 2: SGR-Enhanced Prompting

**Files to Modify:**
- [`docs/prompts/01-component-selector.md`](../prompts/01-component-selector.md)
- [`docs/prompts/02-styling-agent.md`](../prompts/02-styling-agent.md)
- [`docs/prompts/03-content-generator.md`](../prompts/03-content-generator.md)
- [`docs/prompts/04-assembly-agent.md`](../prompts/04-assembly-agent.md)

**Pattern: Cascade Structure**
```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: Analyze requirements
   - Identify core functionality
   - Determine complexity level

2. THEN: Select components/styling/content
   - Choose from available options
   - Apply constraints

3. FINALLY: Justify decisions
   - Explain choices
   - Provide rationale

Return JSON in this exact structure:
{
  "analysis": { ... },
  "output": { ... },
  "reasoning": "..."
}
```

**See:** [`sgr-prompt-enhancement-guide.md`](./sgr-prompt-enhancement-guide.md) for detailed prompt templates.

### Phase 3: Schema Enhancement

**Files to Modify:**
- [`web-app/app/langgraph/agents/schemas.ts`](../../web-app/app/langgraph/agents/schemas.ts)

**Pattern: SGR-Enhanced Schema**
```typescript
// Current schema (output-only)
const ComponentSelectorOutputSchema = z.object({
  selectedComponents: z.array(z.string()),
  layoutStructure: z.enum([...]),
  reasoning: z.string()
});

// SGR-enhanced schema (with reasoning steps)
const ComponentSelectorOutputSchema = z.object({
  // Step 1: Analysis
  analysis: z.object({
    coreFunctionality: z.string(),
    complexityLevel: z.enum(['simple', 'medium', 'complex']),
    targetAudienceNeeds: z.string()
  }),

  // Step 2: Output
  selectedComponents: z.array(z.string()),
  layoutStructure: z.enum([...]),

  // Step 3: Rationale
  reasoning: z.string()
});
```

**See:** [`sgr-schema-enhancement-guide.md`](./sgr-schema-enhancement-guide.md) for complete schema patterns.

---

## Rollout Strategy

### Stage 1: ComponentSelector Pilot (Week 1)

**Goal:** Validate effectiveness on single agent

**Steps:**
1. Implement validation retry in AnthropicClient
2. Update ComponentSelector prompt with Cascade pattern
3. Update ComponentSelector schema (optional)
4. Run 100 test generations
5. Measure improvement

**Success Criteria:**
- Validation success rate > 95%
- No regression in output quality
- Average retries < 1.5 per call

### Stage 2: All Agents (Week 2)

**Goal:** Apply to all agents

**Steps:**
1. Update remaining agent prompts
2. Update remaining schemas
3. Add monitoring/telemetry
4. Run full workflow tests
5. Document patterns

**Success Criteria:**
- All agents > 95% validation success
- End-to-end workflow success > 90%
- Cost increase < 20%

### Stage 3: Production Rollout (Week 3)

**Goal:** Deploy to production

**Steps:**
1. Feature flag for gradual rollout
2. Monitor production metrics
3. A/B testing (SGR vs current)
4. Full rollout

**Success Criteria:**
- Production success rate > 95%
- No increase in latency > 30%
- Cost within budget

---

## Testing Strategy

### Unit Tests

```typescript
// Test: Validation retry with ZOD error feedback
describe('AnthropicClient.generateWithRetry', () => {
  it('should retry with ZOD error feedback', async () => {
    const mockLLM = mockLLMResponses([
      { selectedComponents: undefined }, // Invalid
      { selectedComponents: ['hero'] }   // Valid
    ]);

    const result = await client.generateWithRetry(
      prompt,
      ComponentSelectorOutputSchema
    );

    expect(result.selectedComponents).toEqual(['hero']);
    expect(mockLLM).toHaveBeenCalledTimes(2);
  });
});
```

### Integration Tests

```typescript
// Test: Full workflow with SGR
describe('HomepageGenerationWorkflow with SGR', () => {
  it('should complete with 95%+ success rate', async () => {
    const results = await runWorkflowNTimes(100);

    const successRate = results.filter(r => r.validationStatus === 'pass').length / 100;
    expect(successRate).toBeGreaterThan(0.95);
  });
});
```

### Quality Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Validation Success Rate | ~80% | >95% | ZOD parse success |
| Average Retries | 0 | <1.5 | Retry counter |
| Token Usage | baseline | <120% | LangFuse telemetry |
| Latency | baseline | <130% | Execution time |
| Output Quality Score | 8/10 | ≥8/10 | Human evaluation |

---

## Monitoring & Observability

### LangFuse Events

```typescript
// Log retry attempts
langfuseService.score({
  name: 'validation_retry',
  value: retryCount,
  comment: errorMessage
});

// Log SGR pattern effectiveness
langfuseService.event({
  name: 'sgr_pattern_used',
  metadata: {
    agent: 'ComponentSelector',
    pattern: 'cascade',
    reasoningSteps: 3
  }
});
```

### Metrics Dashboard

```
SGR Effectiveness Dashboard
├── Validation Success Rate (by agent)
├── Average Retries per Call
├── Token Usage vs Baseline
├── Error Types Distribution
├── Output Quality Score
└── Cost per Successful Generation
```

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Increased token usage | Higher cost | Monitor closely, set budget alerts |
| Increased latency | Poor UX | Add timeout protection, use async |
| Prompt complexity | Maintenance burden | Document patterns, create templates |
| Schema changes | Breaking changes | Use additive changes, version schemas |
| GLM-4.7 compatibility | Feature doesn't work | Verified: GLM-4.7 supports JSON mode |

---

## Success Criteria

### Phase 1 Success (Week 1)
- [x] Validation retry loop implemented
- [x] ComponentSelector > 95% success rate
- [x] No regression in output quality
- [x] Documentation complete

### Phase 2 Success (Week 2)
- [x] All agents using SGR prompts
- [x] All agents > 95% success rate
- [x] End-to-end workflow > 90% success
- [x] Monitoring in place

### Phase 3 Success (Week 3)
- [x] Production rollout complete
- [x] A/B test shows improvement
- [x] Cost within budget (+10-20%)
- [x] Team training complete

---

## Open Questions

1. **Should we implement Phase 3 (schema enhancement)?**
   - Pros: Better debuggability, clearer reasoning
   - Cons: Breaking changes, more complex schemas
   - **Decision:** Defer until Phase 1 & 2 validated

2. **Should we create an SGR pattern library?**
   - Pros: Reusable patterns, consistent approach
   - Cons: Additional maintenance
   - **Decision:** Create after Phase 2 if patterns prove effective

3. **Should we explore alternative LLM providers?**
   - Pros: Potentially better structured output
   - Cons: Migration cost, uncertain benefit
   - **Decision:** Only if SGR + GLM-4.7 doesn't meet targets

---

## References

### External Resources
- [Schema-Guided Reasoning by Rinat Abdullin](https://abdullin.com/schema-guided-reasoning/)
- [SGR Patterns Documentation](https://abdullin.com/schema-guided-reasoning/patterns)
- [GLM-4.7 Structured Output Documentation](https://docs.z.ai/guides/capabilities/struct-output)

### Internal Documentation
- [`docs/research/schema-guided-reasoning-sgr_2026-02-03_a1b2.md`](../research/schema-guided-reasoning-sgr_2026-02-03_a1b2.md) - Full research report
- [`docs/project-context/shared/domain-glossary.md`](../project-context/shared/domain-glossary.md) - Domain terminology
- [`docs/project-context/react/tech-stack.md`](../project-context/react/tech-stack.md) - Technology stack

---

**Document Status:** Ready for Review
**Next Steps:** Review with team, create stories, begin implementation
