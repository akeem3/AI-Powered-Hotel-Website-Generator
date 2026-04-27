---
type: story
id: "07.02-infrastructure-langfuse-integration"
epic_number: "07"
story_number: "02"
status: CLOSED
priority: high
tags: [langfuse, observability, cost-tracking, llm, infrastructure]
---

# Story: LangFuse Integration & Cost Tracking

## 1. The "Why" (Rationale)
To enable observability and per-agent cost tracking for the LLM generation pipeline, allowing the platform to monitor usage and strictly enforce the $2/site budget constraint.

## 2. The "What" (Description)
Integrated LangFuse v3 SDK and implemented a reusable `CostMonitor` service that tracks cumulative costs against checkpoints, generating trace URLs for observability.

## 3. The "How" (Acceptance Criteria)
- [x] LangFuse SDK v3 configured with project credentials.
- [x] `LangFuseService` wrapper implemented with execution tracking methods.
- [x] Per-agent cost tracking implemented with `stepCosts` in workflow state.
- [x] Total cost accumulation with budget checkpoints ($0.40, $0.80, $1.60, $1.80, $2.00).
- [x] Budget enforcement pattern implemented to stop workflow if limit exceeded.
- [x] Trace URLs generated and logged with input/output visibility.
- [x] Unit tests achieve >90% coverage (90.48% combined).

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/services/LangFuseService.ts`
    *   `web-app/app/langgraph/services/CostMonitor.ts`
*   *Test Files:*
    *   `web-app/tests/langgraph/services/LangFuseService.test.ts`
    *   `web-app/tests/langgraph/services/CostMonitor.test.ts`
*   *Reference Files:*
    *   `docs/02-architecture/langfuse-langgraph-integration.md`
