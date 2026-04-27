---
type: story
id: "07.11-llm-generation-homepage-config-renderer-integration"
epic_number: "07"
story_number: "11"
status: closed
priority: high
tags: [epic-7, frontend, rendering, components, llm-generation, integration]
---

# Story: Homepage Config Renderer Integration

## 1. The "Why" (Rationale)
To bridge the gap between the LLM-generated JSON configuration and the existing React component system, allowing the generated homepages to be visualized and rendered as actual webpages.

## 2. The "What" (Description)
Implemented the `ComponentRenderer` layer that maps JSON config types to React components, handles variant and prop transformations, and provides a secure preview route.

## 3. The "How" (Acceptance Criteria)
- [x] `ComponentRenderer` created mapping 8 component types.
- [x] Variant application passes config variant object to CVA variants.
- [x] Props transformation utility transforms Hero content fields and validates URLs.
- [x] Component ordering renders components by `order` field.
- [x] Preview route (`/app/preview`) created with runtime validation.
- [x] Error handling for invalid configs and unknown types.
- [x] Unit tests for ComponentRenderer achieve >90% coverage.
- [x] Runtime validation uses `HomepageConfigSchema` with STRICT mode.
- [x] Security: URL validation rejects `javascript:`/`data:` protocols.
- [x] Preview route protected via force-static export and env gate.
- [x] Security test suite covers malicious inputs (XSS, prototype pollution).

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/lib/urlValidation.ts`
    *   `web-app/lib/propsTransformation.ts`
    *   `web-app/components/renderers/ComponentRenderer/index.tsx`
    *   `web-app/app/preview/page.tsx`
*   *Test Files:*
    *   `web-app/tests/components/renderers/ComponentRenderer/ComponentRenderer.test.tsx`
    *   `web-app/tests/components/renderers/ComponentRenderer/security.test.tsx`
*   *Reference Files:*
    *   `web-app/app/langgraph/agents/schemas.ts`
    *   `web-app/lib/cva-variants.ts`
    *   `web-app/lib/contracts/`
