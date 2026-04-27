---
type: story
id: "07.04-llm-styling-agent"
epic_number: "07"
story_number: "04"
status: closed
priority: high
tags: [epic-7, langgraph, styling-agent, cva-variants, llm-generation]
---

# Story: StylingAgent Implementation

## 1. The "Why" (Rationale)
To ensure generated hotel homepages have cohesive and type-appropriate visual styling by automating the selection of CVA variants based on hotel brand personality.

## 2. The "What" (Description)
Implemented the `StylingAgent` which applies appropriate CVA variants to selected components, validating selections against the codebase's variant registry.

## 3. The "How" (Acceptance Criteria)
- [x] LangGraph node implementation extends `BaseAgent`.
- [x] Epic 2 StylingAgent prompt integrated.
- [x] Input validation ensures `HotelParameters` and `ComponentSelectorOutput` are present.
- [x] Output matches `StylingAgentOutput` ZOD schema.
- [x] Design system token validation confirms selected variants exist in `cva-variants.ts`.
- [x] Prompt caching patterns implemented (deferred to Story 7.9).
- [x] Cost tracking integrates with $0.40 budget allocation.
- [x] Unit tests achieve >90% coverage with mock LLM responses.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/agents/StylingAgent.ts`
    *   `web-app/app/langgraph/agents/schemas.ts`
    *   `web-app/app/langgraph/utils/cva-validator.ts`
*   *Test Files:*
    *   `web-app/tests/langgraph/agents/StylingAgent.test.ts`
    *   `web-app/tests/contracts/BookingWidgetContract.test.tsx`
*   *Reference Files:*
    *   `docs/prompts/02-styling-agent.md`
    *   `web-app/lib/cva-variants.ts`
