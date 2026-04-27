---
type: story
id: "19.5"
status: completed
priority: high
epic_number: 19
story_number: 5
created_at: "2026-03-03T00:00:00Z"
updated_at: "2026-03-06T00:00:00Z"
created_by: developer
updated_by: developer
depends_on: ["19.1", "19.2", "19.3", "19.4"]
tags: [langfuse, prompts, integration, phase-4]
---

# Story 19.5: Langfuse Prompt Updates

## The "Why" (Rationale)
To support the newly created blocks (Footer, About, FAQ, Features) in the generation pipeline, the AI agents' prompts need to be updated. This ensures that the `ComponentSelector`, `StylingAgent`, `ContentGenerator`, `AssemblyAgent`, and `QualityValidator` are aware of the new components, their variants, and content requirements, allowing them to be correctly selected, styled, and populated.

## The "What" (Description)
Update the Langfuse prompts for the five LangGraph agents to include the new component types (`footer`, `about`, `faq`, `features`). This includes updating the available components list, providing recommendations based on hotel type, adding variant options, specifying content generation rules, and defining assembly instructions (variant field mappings and component ordering).

## The "How" (Acceptance Criteria)
- [x] **Component-Selector Prompt:** Added `about`, `faq`, `features`, `footer` to available components. Added component recommendations by hotel type. Updated output schema and minimum required components.
- [x] **Styling-Agent Prompt:** Added Footer variant options (`footerLayout`). Added About variant options (`aboutLayout`, `aboutImagePosition`, `aboutOverlay`, `aboutTextAlign`).
- [x] **ContentGenerator Prompt:** Added content generation instructions for Footer and About components (FAQ and Features were already present).
- [x] **Assembly-Agent Prompt:** Added variant field mapping for Footer and About (and verified FAQ/Features). Updated component ordering.
- [x] **Quality-Validator Prompt:** Added validation instructions for the new blocks (referencing contracts and constraints).

## The "Where" (Impact Analysis)

*   **Reference Files:**
    *   `web-app/app/langgraph/agents/schemas.ts`
    *   `web-app/app/langgraph/utils/cva-validator.ts`
    *   `web-app/lib/contracts/footer.contract.ts`
    *   `web-app/lib/contracts/about.contract.ts`
    *   `web-app/lib/contracts/faq.contract.ts`
    *   `web-app/lib/contracts/features.contract.ts`