---
type: story
id: "07.08-workflow-orchestration-edge-routing"
epic_number: "07"
story_number: "08"
status: Done
priority: high
created_at: "2025-12-11T00:00:00Z"
updated_at: "2026-01-07T00:00:00Z"
tags: [langgraph, workflow, orchestration, edge-routing, state-graph, epic-7]
---

# Story: Workflow Orchestration & Edge Routing

## 1. The "Why" (Rationale)
To enable autonomous hotel homepage generation by orchestrating the entire multi-agent pipeline (ComponentSelector, Styling, Content, Assembly, Validator) into a cohesive unit. This ensures robust execution with automatic error recovery, budget enforcement ($2/site), and graceful degradation, preventing partial failures and runaway costs.

## 2. The "What" (Description)
A complete LangGraph StateGraph workflow that connects all 5 agents with directed edges for sequential execution and conditional edges for validation loops. It implements a retry mechanism (max 3 attempts) for failed validations and strictly enforces budget checkpoints after each step to terminate early if costs exceed thresholds.

## 3. The "How" (Acceptance Criteria)
- [x] Create `StateGraph` in `web-app/src/langgraph/workflows/HomepageGenerationWorkflow.ts` with 5 nodes.
- [x] Define linear edges: START → componentSelector → stylingAgent → contentGenerator → assemblyAgent → qualityValidator.
- [x] Implement conditional edges from QualityValidator: 'pass' → END, 'fail' → retry (componentSelector), 'budget_exceeded' → END.
- [x] Implement budget checkpoint validation after each agent ($0.40, $0.80, $1.60, $1.80, $2.00).
- [x] Implement retry counter (max 3 retries) and terminate with error if exceeded.
- [x] Expose `invoke()` method returning complete `WorkflowState` or error.
- [x] Implement graceful error handling catching exceptions, logging to LangFuse, and returning failure status.
- [x] Verify with >90% integration test coverage including all routing paths.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/workflows/HomepageGenerationWorkflow.ts`
*   *Test Files:*
    *   `web-app/tests/langgraph/Story7.8.test.ts`
*   *Reference Files:*
    *   `web-app/app/langgraph/agents/ComponentSelector.ts`
    *   `web-app/app/langgraph/agents/StylingAgent.ts`
    *   `web-app/app/langgraph/agents/ContentGenerator.ts`
    *   `web-app/app/langgraph/agents/AssemblyAgent.ts`
    *   `web-app/app/langgraph/agents/QualityValidator.ts`
    *   `web-app/app/langgraph/utils/BudgetCheckpoint.ts`
    *   `web-app/app/langgraph/services/LangFuseService.ts`
    *   `web-app/app/langgraph/services/CostMonitor.ts`
    *   `web-app/app/langgraph/state/workflow-state.ts`
    *   `web-app/app/langgraph/state/types.ts`
    *   `docs/research/langgraph-integration-research.md`
