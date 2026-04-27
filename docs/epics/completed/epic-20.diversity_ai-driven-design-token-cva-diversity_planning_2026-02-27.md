---
type: epic
epic_number: "20"
id: "20-diversity-ai-driven-design-token-cva-diversity"
status: completed
priority: high
created_at: "2026-02-27T00:00:00Z"
updated_at: "2026-03-10T00:00:00Z"
completed_at: "2026-03-10T00:00:00Z"
target_completion: null

created_by: epic-creator
updated_by: verification-review

prd_reference: "docs/architecture/prd.md"
architecture_reference: "docs/architecture/component-system-architecture.md"
plan_reference: "docs/plans/ai-driven-block-style-diversity-plan.md"
research_references:
  - "docs/research/hotel-design-archetype-taxonomy_2026-02-27_b5c2.md"
  - "docs/research/prompt-engineering-design-diversity_2026-02-27_c1d4.md"
  - "docs/research/llm-css-styling-variation-generation_2026-02-27_a3f1.md"
  - "docs/research/tailwind_v4_class_validation_api_2026-02-27_d9c1.md"
  - "docs/research/oklch_culori_palette_generation_2026-01-28_f4a2.md"

fr_coverage: [FR7, FR8, FR10, FR15]
nfr_coverage: [NFR1, NFR7, NFR12, NFR14]

depends_on: ["18-diversity-navigation-variants-section-wrappers"]
blocks: ["21-ai-structural-variant-generation", "22-e2e-diversity-validation"]

stories_count: 11
stories_completed: 11
stories_in_progress: 0
stories_blocked: 0

hallucination_check:
  status: PASSED
  validated_at: "2026-02-27T00:00:00Z"
  confidence: 0.95
  issues_count: 0
  notes: "All issues resolved: H001 (contrast-validator pair count corrected to 7 light mode), H002 (cva-variants.ts line count corrected to 578), C001 (VALID_VARIANTS private access noted in Story 20.9), C002 (APCA thresholds aligned with codebase: Lc 75/60). Cross-validated against codebase: all file references confirmed, QualityValidator weights verified (40/30/20/10 + budgetCompliance hard gate)."

complexity_validation:
  status: PASSED
  validated_at: "2026-02-27T00:00:00Z"
  overall_score: 2.4
  stories_needing_review: []
  principle_violations: 0
  notes: "All issues addressed: C001 (20.1 AC consolidated to 7 - approved), C004 (YAGNI blockType enum kept for practical reasons - approved), C006 (shared ArchetypeSchema added to 20.1 - approved), C009 (20.9 manual fallback + sync script compatibility note added). Dependency depth 5 architecturally inherent with 3 parallel tracks."

estimated_days: "10-14"
tags: [ai-diversity, design-tokens, archetype-classifier, token-generator, cva-expansion, oklch, apca-contrast, typography, font-injection, langgraph, styling-agent, layer-1, layer-2]
---

# Epic 20: AI-Driven Design Token + CVA Diversity

## High-Level Overview

This epic introduces AI-driven style generation to create visually distinct websites based on 12 hotel visual archetypes, breaking the single-path theming pipeline. It operates across two layers: Layer 1 for Design Tokens (OKLCH palettes, typography, spacing) and Layer 2 for CVA Variants (archetype-specific Tailwind classes), driving diverse aesthetic outputs while enforcing accessibility (APCA) and preserving build integrity.

## Global Rationale

With millions of structural combinations available, the system required aesthetic diversity to prevent mode-collapse and deliver unique visual identities. By injecting an AI layer that outputs validated styling data—not raw code—into existing pipelines (like the OKLCH token generator and CVA registries), the platform can affordably and deterministically produce thousands of distinct, accessible, archetype-aligned themes without modifying underlying components.

## Completed Stories

- **Story 20.1:** HotelDesignTokens Schema + Archetype Token Map
- **Story 20.2:** ArchetypeClassifier Agent
- **Story 20.3:** TokenGenerator Agent + APCA Contrast Retry Loop
- **Story 20.4a:** Font Injection Pipeline
- **Story 20.4:** Typography Mapper
- **Story 20.5:** Token Pipeline Integration
- **Story 20.6:** Update LangGraph Workflow
- **Story 20.7:** Semantic Token Allowlist
- **Story 20.8:** CVAVariantMap Schema + CVAVariantAgent
- **Story 20.9:** Build-Time CVA Code Generation Script
- **Story 20.10:** StylingAgent Enhancement