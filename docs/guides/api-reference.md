# API Reference: Homepage Generation Workflow

This document provides a detailed reference for the `HomepageGenerationWorkflow` class, which orchestrates the multi-agent LLM pipeline for generating hotel websites.

## Overview

The workflow is implemented using **LangGraph** and consists of 5 sequential agents:
1.  **ComponentSelector**: Determines page sections.
2.  **StylingAgent**: Selects visual aesthetic and CVA variants.
3.  **ContentGenerator**: Writes copy and text.
4.  **AssemblyAgent**: Merges all outputs into a final configuration.
5.  **QualityValidator**: Enforces quality and budget constraints.

## Initialization

```typescript
import { HomepageGenerationWorkflow } from '@/app/langgraph/workflows/HomepageGenerationWorkflow';

const workflow = new HomepageGenerationWorkflow();
```

The constructor initializes all agents and the `CostMonitor` and `LangFuseService` dependencies automatically.

## `invoke()`

Executes the workflow with a single input payload. Matches the LangChain `Runnable` interface.

**Signature:**

```typescript
async invoke(input: {
  generationId: string;
  hotelParameters: HotelParameters;
}): Promise<WorkflowState>
```

**Parameters:**

| Param | Type | Description |
| :--- | :--- | :--- |
| `generationId` | `string` | Unique ID for tracing (e.g., "gen-123"). Used in LangFuse. |
| `hotelParameters` | `HotelParameters` | The user input defining the hotel. |

**Returns:**
A `Promise` resolving to the final `WorkflowState`.

---

## Input Schema: `HotelParameters`

The strict Zod schema definition for user input.

```typescript
interface HotelParameters {
  hotelName: string;
  hotelType: "luxury" | "budget" | "boutique" | "resort" | "business";
  targetAudience: "business" | "leisure" | "family" | "couples" | "backpackers";
  brandPersonality: "elegant" | "modern" | "friendly" | "professional" | "adventurous";
  location: string; 
}
```

## Output Schema: `HomepageConfig`

The final generated configuration object found in `state.assembledConfig`.

```typescript
interface HomepageConfig {
  generationId: string;
  timestamp: string;
  hotelParameters: HotelParameters;
  components: Array<{
    type: "hero" | "navigation" | "rooms" | "gallery" | "testimonials" | "amenities" | "booking" | "contact" | "footer" | "about" | "faq" | "features";
    variant: Record<string, string | number | boolean>;
    props: Record<string, any>;
    order: number;
  }>;
  layoutStructure: "single-column" | "grid" | "mixed";
  emphasisComponents: string[];
  validationStatus: "PASS" | "WARNING" | "FAIL";
}
```

## Error Handling

The workflow handles errors at two levels:

1.  **Agent Level**: If a specific agent fails, the `validationStatus` is set to 'fail' and `errors` array is populated.  The workflow *may* attempt to retry if configured (Story 7.7 logic).
2.  **Workflow Level**: Fatal errors (e.g., timeouts, missing API keys) typically throw an exception from `invoke()`.

**Common Return States:**

- **Success**: `validationStatus: 'pass'`, `assembledConfig` is present.
- **Validation Failure**: `validationStatus: 'fail'`, `validationErrors` contains Zod issues.
- **Budget Exceeded**: `budgetExceeded: true`, workflow terminates early.

---

## Retry Behavior

The workflow implements an intelligent retry mechanism to handle transient failures and validation issues.

### Retry Configuration

| Setting | Value | Description |
|---------|-------|-------------|
| **Max Retries** | 3 | Maximum number of retry attempts before terminating with failure |
| **Retry Trigger** | `validationStatus === 'fail'` | Any validation failure triggers a retry |
| **Retry Scope** | Full Workflow | On retry, the workflow restarts from `ComponentSelector` |

### Retry Logic Flow

```
QualityValidator
    ↓
Validation Status?
    ↓
┌─────────────────────────────────────────┐
│ PASS → END (success)                    │
│ Budget Exceeded → END (budget failure)  │
│ retryCount >= 3 → END (failure)         │
│ FAIL → Retry (increment retryCount)     │
└─────────────────────────────────────────┘
    ↓ (if retry)
Back to ComponentSelector
```

### Retry State Management

The workflow maintains a `retryCount` in the state:

```typescript
interface WorkflowState {
  retryCount: number;           // Current retry attempt (0-3)
  validationStatus: 'pass' | 'fail' | 'pending';
  errors: string[];             // Accumulated error messages
  validationErrors: any[];      // Zod validation errors
}
```

### Retry Behavior by Scenario

| Scenario | Retry Behavior | Final State |
|----------|---------------|-------------|
| **Transient API Error** | Retry from ComponentSelector | May recover on retry |
| **Budget Exceeded** | Immediate termination | No retry (fatal) |
| **Persistent Validation Failure** | Up to 3 retries | Failure if all 3 fail |
| **Quality Validator Exception** | Retry (increment count) | May recover on retry |

### Timeout Protection

For the complete list of component types and their variants, see [Component Inventory](./component-inventory.md).

The workflow has a **30-minute timeout** that applies regardless of retry count:

```typescript
const timeoutMs = 30 * 60 * 1000; // 30 minutes
```

If the timeout is exceeded, the workflow is aborted via `AbortController` and an error is thrown.

### Observability

Each retry attempt is logged and traced in **LangFuse**:

```typescript
this.langfuseService.logError(`Validation failed. Retrying (Attempt ${retryCount + 1})...`);
```

The trace includes:
- Total retry attempts
- Errors from each attempt
- Final validation status
- Total execution time

---
