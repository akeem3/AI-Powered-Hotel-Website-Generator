---
type: story
id: "07.06-langgraph-assemblyagent"
epic_number: "07"
story_number: "06"
status: Closed
priority: high
tags: [langgraph, agent, assembly, homepage-config, llm, epic-7]
---

# Story: AssemblyAgent Implementation

## 1. The "Why" (Rationale)
To compose all individual agent outputs into a single, validated `HomepageConfig` JSON structure that can be rendered by the frontend, ensuring proper component ordering and asset injection.

## 2. The "What" (Description)
Implemented the `AssemblyAgent` which aggregates outputs from Selector, Styling, and Content agents, orders components based on emphasis, injects image placeholders, and validates the final config.

## 3. The "How" (Acceptance Criteria)
- [x] LangGraph node extends `BaseAgent` using `Annotation.Root` pattern.
- [x] Agent processes outputs from all previous agents.
- [x] Output conforms to `HomepageConfigSchema` with proper ID formats.
- [x] Component ordering determined by `emphasisComponents` and logical flow.
- [x] BackBlaze B2 image placeholder URLs injected for all image components.
- [x] Cost tracking limits agent to $0.20 budget allocation.
- [x] ZOD validation against `HomepageConfigSchema` with retry logic.
- [x] Unit tests achieve >90% coverage.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/agents/AssemblyAgent.ts`
*   *Test Files:*
    *   `web-app/tests/langgraph/agents/AssemblyAgent.test.ts`
*   *Reference Files:*
    *   `docs/epics/epic-7-llm-generation.md`
