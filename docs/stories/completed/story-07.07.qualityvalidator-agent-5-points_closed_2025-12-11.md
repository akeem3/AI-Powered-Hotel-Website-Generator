---
type: story
id: "07.07-langgraph-qualityvalidator-agent"
epic_number: "07"
story_number: "07"
status: Closed
priority: high
tags: [langgraph, agent, quality-validation, zod, epic-7]
---

# Story: QualityValidator Agent Implementation

## 1. The "Why" (Rationale)
To ensure only high-quality, schema-compliant homepage configurations are output by the system, acting as a final quality gate that triggers retries if standards aren't met.

## 2. The "What" (Description)
Implemented the `QualityValidator` conditional node that performs strict ZOD validation and quality scoring, routing back to the ComponentSelector for regeneration if the score is low or validation fails.

## 3. The "How" (Acceptance Criteria)
- [x] LangGraph conditional node implemented with PASS/FAIL routing.
- [x] Full `HomepageConfig` ZOD validation runs in STRICT mode.
- [x] Automated quality scoring rubric calculates component coverage, completeness, and validity.
- [x] PASS decision requires 100% ZOD compliance and >90 quality score.
- [x] Retry routing on FAIL increments retry count (max 3).
- [x] Quality metrics logged to LangFuse.
- [x] Budget validation checkpoint confirms total cost <= $2.00.
- [x] Unit tests achieve >90% coverage for validation rules and routing.

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/langgraph/agents/QualityValidator.ts`
    *   `web-app/app/langgraph/agents/schemas.ts`
    *   `web-app/app/langgraph/utils/cva-validator.ts`
    *   `web-app/app/langgraph/workflows/HomepageGenerationWorkflow.ts`
*   *Test Files:*
    *   `web-app/tests/langgraph/agents/QualityValidator.test.ts`
    *   `web-app/tests/langgraph/WorkflowRetry.test.ts`
    *   `web-app/tests/langgraph/HomepageGenerationWorkflow.test.ts`
*   *Reference Files:*
    *   `docs/research/langgraph-integration-research.md`
