---
type: story
id: "07.09-openrouter-kimi-k2-integration"
epic_number: "07"
story_number: "09"
status: Done
priority: high
created_at: "2025-12-11T00:00:00Z"
updated_at: "2026-01-13T00:00:00Z"
tags: [openrouter, kimi-k2, llm-provider, cost-optimization, model-routing, epic-7]
---

# Story: OpenRouter & Kimi K2 Integration

## 1. The "Why" (Rationale)
To achieve the critical $2/site cost target by leveraging the Kimi K2 model ($0.0001/1K tokens) as the primary engine, offering 95% savings compared to premium models. This integration ensures financial viability while maintaining quality through an intelligent fallback system to Claude 3 Haiku and GPT-4o Mini when budget or availability requires it.

## 2. The "What" (Description)
Integration of OpenRouter as the unified model gateway using the TypeScript SDK. It implements a robust `OpenRouterClient` service with budget-aware routing logic: selecting Kimi K2 when budget is healthy, falling back to Haiku for quality/reliability, and GPT-4o Mini for strict budget adherence. It includes rate limiting, exponential backoff, and precise token usage tracking linked to the CostMonitor.

## 3. The "How" (Acceptance Criteria)
- [x] Install `@openrouter/typescript-sdk` and configure type definitions.
- [x] Create `OpenRouterClient` class with `sendCompletion`, `getAvailableModels`, `getModelPricing`.
- [x] Configure model tiers: Kimi K2 (Primary), Claude 3 Haiku (Fallback), GPT-4o Mini (Budget).
- [x] Implement `selectModel(task, budgetRemaining)` routing: >$1.00 → Kimi, $0.50-$1.00 → Haiku, <$0.50 → GPT-4o Mini.
- [x] Implement exponential backoff (max 2 retries) with automatic tier fallback.
- [x] Integrate token usage tracking with `CostMonitor` (prompt/completion tokens).
- [x] Configure environment variables (`OPENROUTER_API_KEY`, etc.) in `.env.example`.
- [x] Verify with integration tests confirming real API calls, timeout enforcement, and cost accuracy.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/services/OpenRouterClient.ts`
    *   `web-app/app/langgraph/workflows/HomepageGenerationWorkflow.ts`
    *   `web-app/app/langgraph/agents/BaseAgent.ts`
    *   `scripts/generate-homepage.ts`
    *   `web-app/.env.example`
    *   `web-app/jest.workflow.setup.js`
*   *Test Files:*
    *   `web-app/tests/langgraph/services/OpenRouterClient.test.ts`
    *   `web-app/tests/langgraph/services/OpenRouterClient.integration.test.ts`
*   *Reference Files:*
    *   `docs/research/langgraph-integration-research.md`
    *   `docs/02-architecture/langfuse-langgraph-integration.md`
