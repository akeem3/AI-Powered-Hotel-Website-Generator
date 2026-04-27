---
type: story
id: "07.03-langgraph-componentselector-agent"
epic_number: "07"
story_number: "03"
status: Closed
priority: high
tags: [langgraph, agent, component-selection, llm, epic-7]
---

# Story: ComponentSelector Agent Implementation

## 1. The "Why" (Rationale)
To enable the system to autonomously analyze hotel parameters and select the most appropriate homepage components, ensuring the generated site matches the hotel's brand and needs.

## 2. The "What" (Description)
Implemented the `ComponentSelector` agent as a LangGraph node that uses validated Epic 2 prompts to select 5-8 components, enforcing a $0.40 budget allocation.

## 3. The "How" (Acceptance Criteria)
- [x] LangGraph node created extending `BaseAgent` with proper typing.
- [x] Epic 2 ComponentSelector prompt integrated with parameter substitution.
- [x] Agent accepts `HotelParameters` and outputs `ComponentSelectorOutput`.
- [x] ZOD validation on output ensures schema compliance with retry logic.
- [x] Cost tracking integrated via `LangFuseService` with $0.40 budget.
- [x] Unit tests achieve >90% coverage using prototype mocking.
- [x] Integration test validates real LLM call (conditional).
- [x] Agent produces valid component selections (5-8 components).

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/agents/ComponentSelector.ts`
    *   `web-app/app/langgraph/agents/schemas.ts`
*   *Test Files:*
    *   `web-app/tests/langgraph/agents/ComponentSelector.test.ts`
*   *Reference Files:*
    *   `docs/prompts/manual-generation-workflow.md`
