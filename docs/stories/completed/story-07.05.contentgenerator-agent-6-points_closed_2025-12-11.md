---
type: story
id: "07.05-langgraph-contentgenerator-agent"
epic_number: "07"
story_number: "05"
status: closed
priority: high
tags: [langgraph, agent, content-generation, llm, epic-7]
---

# Story: ContentGenerator Agent Implementation

## 1. The "Why" (Rationale)
To produce compelling, brand-aligned textual content for hotel homepages that matches the hotel's personality and target audience, replacing placeholders with high-quality copy.

## 2. The "What" (Description)
Implemented the `ContentGenerator` agent which generates text content for all selected components, managing the largest budget allocation ($0.80) due to high token usage.

## 3. The "How" (Acceptance Criteria)
- [x] LangGraph node extends `BaseAgent` using `Annotation.Root` pattern.
- [x] Epic 2 prompt integrated with tone alignment based on `brandPersonality`.
- [x] Agent processes `HotelParameters`, `ComponentSelectorOutput`, and `StylingAgentOutput`.
- [x] Output conforms to `ContentGeneratorOutput` ZOD schema.
- [x] Content length constraints enforced per component type.
- [x] Cost tracking limits execution to $0.80 budget.
- [x] Retry logic implemented with exponential backoff.
- [x] Unit tests achieve >90% coverage using prototype mocking.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/agents/ContentGenerator.ts`
    *   `web-app/app/langgraph/agents/schemas.ts`
    *   `web-app/app/langgraph/agents/BaseAgent.ts`
*   *Test Files:*
    *   `web-app/tests/langgraph/agents/ContentGenerator.test.ts`
*   *Reference Files:*
    *   `docs/prompts/03-content-generator.md`
