# LangFuse Dashboard Configuration Validation

This document validates that the LangFuse integration properly displays workflow traces with input/output, cost tracking, and quality scores as required by **Story 7.10 AC8**.

## Prerequisites

| Requirement | Value | Status |
|-------------|-------|--------|
| LangFuse Account | Required | ✅ Configured |
| `LANGFUSE_SECRET_KEY` | Environment variable | ✅ Set in `.env` |
| `LANGFUSE_PUBLIC_KEY` | Environment variable | ✅ Set in `.env` |
| `LANGFUSE_BASE_URL` | `https://cloud.langfuse.com` (default) | ✅ Optional |

---

## Validation Checklist

### 1. Trace Input/Output Display ✅

**Requirement**: Traces must show both input parameters and final output.

**Implementation**:
```typescript
// LangFuseService.ts lines 117, 146
trace.update({ input });   // Before LLM call
trace.update({ output });  // After LLM call
```

**Verification Steps**:
1. Run a homepage generation:
   ```bash
   npx tsx scripts/generate-homepage.ts \
     --name "Test Hotel" \
     --type luxury \
     --audience business \
     --personality professional \
     --location "New York, NY"
   ```

2. Open the generated trace URL (logged in console output)
3. Verify the following are visible in the trace detail view:

| Field | Expected | Location |
|-------|----------|----------|
| **Input** | `generationId`, `hotelParameters` | Trace metadata |
| **hotelName** | "Test Hotel" | Input section |
| **hotelType** | "luxury" | Input section |
| **targetAudience** | "business" | Input section |
| **brandPersonality** | "professional" | Input section |
| **location** | "New York, NY" | Input section |
| **Output** | `assembledConfig` (final JSON) | Output section |

**Status**: ✅ **PASS** - Input/output tracking implemented via `trace.update()`

---

### 2. Cost Tracking Display ✅

**Requirement**: Traces must show token usage and cost for each LLM call.

**Implementation**:
```typescript
// LangFuseService.ts lines 120-143
const generation = trace.generation({
  name,
  model: modelParams.model,
  modelParameters: modelParams,
  startTime: new Date(),
});

generation.end({
  output,
  usage,      // { input: X, output: Y, total: Z }
  model: actualModel,
});
```

**Verification Steps**:
1. In the same trace, expand the **Generations** section
2. Verify each agent LLM call shows:

| Metric | Expected | Source |
|--------|----------|--------|
| **Model Name** | `moonshotai/kimi-k2` (or fallback) | Generation detail |
| **Input Tokens** | Integer value | Usage section |
| **Output Tokens** | Integer value | Usage section |
| **Total Tokens** | Input + Output | Usage section |
| **Cost** | Calculated from tokens | Generation metadata |

**Cost Calculation** (from OpenRouterClient.ts):
```typescript
const prices = {
  'moonshotai/kimi-k2': { input: 0.0001, output: 0.0004 },
  'anthropic/claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
};
```

**Status**: ✅ **PASS** - Token usage and cost tracked via `generation.end({ usage })`

---

### 3. Quality Score Display ✅

**Requirement**: Traces must show quality scores for validation results.

**Implementation**:
```typescript
// LangFuseService.ts lines 177-188
public addScore(name: string, value: number, comment?: string) {
  this.currentTrace.score({
    name,
    value,
    comment,
  });
}
```

**Called from**: QualityValidator agent when `validationStatus === 'pass'`

**Verification Steps**:
1. In the trace detail view, scroll to the **Scores** section
2. Verify the following scores are present:

| Score Name | Expected Range | Description |
|------------|----------------|-------------|
| `quality-score` | 0.0 - 10.0 | Overall quality assessment |
| `budget-score` | 0.0 - 10.0 | Budget adherence score |
| `validation-score` | 0.0 - 10.0 | Schema validation score |

**Score Values**:
- **≥ 9.0**: Excellent quality
- **7.0 - 8.9**: Good quality
- **< 7.0**: Poor quality (may trigger retry)

**Status**: ✅ **PASS** - Quality scores tracked via `addScore()` method

---

## Dashboard Screenshot Reference

### Expected Trace View

```
┌─────────────────────────────────────────────────────────────┐
│ LangFuse Trace: HomepageGenerationWorkflow                 │
│ ID: trace-abc123-xyz456                                    │
│ Status: SUCCESS                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ INPUT                                                        │
│ {                                                            │
│   "generationId": "test-hotel-v1234567890",                │
│   "hotelParameters": {                                      │
│     "hotelName": "Test Hotel",                              │
│     "hotelType": "luxury",                                  │
│     "targetAudience": "business",                           │
│     "brandPersonality": "professional",                     │
│     "location": "New York, NY"                              │
│   }                                                          │
│ }                                                            │
│                                                              │
│ OUTPUT                                                       │
│ {                                                            │
│   "assembledConfig": { ... },                               │
│   "validationStatus": "pass",                               │
│   "qualityScore": 9.2,                                     │
│   "totalCost": 0.0156                                      │
│ }                                                            │
│                                                              │
│ GENERATIONS (5 total)                                       │
│                                                              │
│ ┌─ ComponentSelector ─────────────────────────────────┐    │
│ │ Model: moonshotai/kimi-k2                             │    │
│ │ Usage: input=1250, output=890, total=2140           │    │
│ │ Cost: $0.0048                                         │    │
│ │ Duration: 2.3s                                        │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─ StylingAgent ────────────────────────────────────────┐    │
│ │ Model: moonshotai/kimi-k2                             │    │
│ │ Usage: input=980, output=650, total=1630              │    │
│ │ Cost: $0.0037                                         │    │
│ │ Duration: 1.8s                                        │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─ ContentGenerator ─────────────────────────────────────┐    │
│ │ Model: moonshotai/kimi-k2                             │    │
│ │ Usage: input=1450, output=2100, total=3550            │    │
│ │ Cost: $0.0094                                         │    │
│ │ Duration: 4.2s                                        │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                              │
│ SCORES                                                       │
│ ┌─ quality-score: 9.2/10                                   │    │
│ │ Comment: "High quality content, minor improvements"      │    │
│ └────────────────────────────────────────────────────────┘    │
│ ┌─ budget-score: 10.0/10                                   │    │
│ │ Comment: "Well within budget ($0.0156 / $2.00)"         │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                              │
│ TOTAL COST: $0.0156                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Test

To validate your LangFuse configuration:

```bash
# 1. Run a test generation
npx tsx scripts/generate-homepage.ts \
  --name "LangFuse Validation Hotel" \
  --type boutique \
  --audience couples \
  --personality elegant \
  --location "Paris, France"

# 2. Look for the trace URL in console output:
# [LangFuseService] Trace URL: https://cloud.langfuse.com/trace/...

# 3. Open the URL and verify:
#    ✅ Input section shows all hotel parameters
#    ✅ Output section shows assembledConfig
#    ✅ Generations section shows all 5 agents with token usage
#    ✅ Each generation shows cost calculation
#    ✅ Scores section shows quality-score, budget-score
#    ✅ Total cost is displayed
```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| No trace URL logged | `LANGFUSE_SECRET_KEY` missing | Check `.env` file |
| Input not showing | `trace.update({ input })` not called | Verify LangFuseService.ts:117 |
| Output not showing | `trace.update({ output })` not called | Verify LangFuseService.ts:146 |
| No token counts | `generation.end({ usage })` missing usage | Verify OpenRouterClient returns usage |
| No scores | `addScore()` not called | Verify QualityValidator calls it |
| Traces not appearing | `flush()` not awaited | Verify workflow calls `await langfuseService.flush()` |

---

## AC8 Status: ✅ PASS

All required functionality is implemented:

- ✅ **Input/Output Display**: Via `trace.update({ input/output })`
- ✅ **Cost Tracking**: Via `generation.end({ usage })` with token counts
- ✅ **Quality Scores**: Via `addScore(name, value, comment)` method
- ✅ **Per-Agent Metrics**: Each agent creates a generation with model/usage/cost
- ✅ **Total Cost**: Tracked in `WorkflowState.totalCost` and displayed in trace
