---
type: story
id: "25.1-websiteconfig-schema-split-to-pages"
status: completed
priority: high
epic_number: 25
story_number: 01
created_at: "2026-03-24T12:00:00Z"
updated_at: "2026-03-24T12:00:00Z"
created_by: dev
updated_by: dev
depends_on:
  - docs/epics/epic-24.routing_multi-page-i18n_ready_2026-03-18.md
related_artifacts:
  - web-app/lib/generation/split-to-pages.ts
  - web-app/tests/lib/generation/split-to-pages.test.ts
  - docs/qa/gates/25.1-websiteconfig-schema-split-to-pages.yml
acceptance_criteria_met: "10/10"
hallucination_check: passed
security_check: passed
test_coverage: complete
code_review_status: approved
tags: [generation, multi-page, config, schema, langgraph, testing]
archival_date: null

code_scout:
  status: complete
  scanned_at: "2026-03-24T12:00:00Z"

verification:
  status: verified
  verified_at: "2026-03-24T12:00:00Z"
  verified_by: James (Dev)
  tests_passing: 38
  tests_skipped: 0
  tests_failed: 0
---

# Story: WebsiteConfigSchema and splitToPages() Utility

## Why (Rationale)
To enable the LangGraph preview path to render full multi-page websites without additional LLM calls, we needed a $0-cost post-processing transformation from single-page HomepageConfig to multi-page WebsiteConfig. This pure function distributes components across pages following Epic 24's multi-page architecture, allowing downstream rendering code to access any page by name without custom distribution logic.

## What (Description)
We implemented `WebsiteConfigSchema` and `splitToPages()` function in `web-app/lib/generation/split-to-pages.ts`. The schema wraps `HomepageConfigSchema` as the `source` field and adds a `pages` object with keys for each page type (homepage, rooms, roomDetail, gallery, amenities, reviews, contact, about, faq). The `splitToPages()` function is a pure, deterministic function that:
- Distributes HomepageConfig components across multiple pages
- Creates homepage with teaser content (rooms limited to 3, gallery limited to 6, amenities limited to 8)
- Creates dedicated pages with full content for rooms, gallery, amenities, reviews, contact, about, and faq
- Generates room detail pages keyed by room slug with collision handling
- Adds navigation and footer components to every page
- Creates empty pages for missing component types

## How (Acceptance Criteria)
- [x] `WebsiteConfigSchema` wraps `HomepageConfigSchema` as `source` field
- [x] `splitToPages()` returns `WebsiteConfig` with `pages` field containing all page type keys
- [x] Homepage page contains hero, navigation, footer, and teasers (rooms limited to 3, gallery limited to 6, amenities limited to 8)
- [x] Rooms page contains the full rooms component
- [x] Gallery page contains the full gallery component
- [x] Amenities page contains the full amenities component
- [x] Reviews page contains the full testimonials component
- [x] Contact page contains the contact component
- [x] About page contains the about component
- [x] FAQ page contains the faq component
- [x] Navigation and footer components appear on every page
- [x] If a component type is absent from source, its page exists with empty components array (except navigation/footer)
- [x] Config with 5 components (minimum) creates all pages correctly
- [x] Result validates against `WebsiteConfigSchema`
- [x] Room slugs are kebab-case, lowercase, URL-safe with collision handling (-2, -3 suffixes)
- [x] Function is pure (same input → same output, no side effects)

## Where (Impact Analysis)
*Implementation Files:*
- `web-app/lib/generation/split-to-pages.ts` (763 lines)

*Test Files:*
- `web-app/tests/lib/generation/split-to-pages.test.ts` (38 tests, all passing)

*QA Gate:*
- `docs/qa/gates/25.1-websiteconfig-schema-split-to-pages.yml` (PASS)

## Test Results
✅ 38/38 tests passing covering:
- Config with all components (12) - all pages populated
- Config with minimum components (5) - empty pages created correctly
- Config with missing components - pages created with only navigation/footer
- Single room vs 20 rooms edge cases
- Room slug generation with collision handling
- Schema validation for all config types
- Pure function determinism
- Navigation/footer on every page

## Notes
- Fixed HomepageConfigSchema import to use actual schema from `@/app/langgraph/agents/schemas` rather than redefining it
- Test fixtures updated to have minimum 5 components per HomepageConfigSchema requirements
- Room slug generation follows Epic 24 Story 24.1 convention
