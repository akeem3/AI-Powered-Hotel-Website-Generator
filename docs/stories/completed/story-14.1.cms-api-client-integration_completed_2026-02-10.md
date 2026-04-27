---
type: story
id: "14.1-cms-api-client-integration"
status: completed
priority: high
epic_number: 14
story_number: 01
created_at: "2026-01-29T10:00:00Z"
updated_at: "2026-02-10T00:00:00Z"
created_by: story-creator-v2
updated_by: claude-code
depends_on:
  - docs/epics/epic-14.static-site-generation_isr_ready_2026-01-28.md
  - docs/epics/epic-12-visual-excellence_design-system_storybook_needs-review_2025-01-14.md
related_artifacts:
  - web-app/lib/cms-api/client.ts
  - web-app/lib/cms-api/types.ts
  - web-app/lib/cms-api/schemas.ts
  - web-app/lib/cms-api/transformers.ts
  - web-app/lib/cms-api/env.ts
  - web-app/lib/cms-api/index.ts
  - web-app/.env.example
  - web-app/tests/lib/cms-api/transformers.test.ts
  - web-app/tests/integration/cms-api-connection.test.ts
acceptance_criteria_met: "10/10"
hallucination_check: passed
security_check: passed
test_coverage: complete
code_review_status: approved
tags: [cms-api, rest, build-time, infrastructure, authentication, typescript]
archival_date: null

code_scout:
  status: complete
  scanned_at: "2026-02-09T12:00:00Z"

verification:
  status: verified
  verified_at: "2026-02-10T00:00:00Z"
  verified_by: claude-code
  tests_passing: 59
  tests_skipped: 0
  tests_failed: 0
---

# Story: ET CMS API Client Integration and TypeScript Types

## Why (Rationale)
To enable static site generation (SSG) with real hotel data, we needed a robust, type-safe client for the ET CMS Publishing API. This replaces the initial plan to use the Directus SDK, as the architecture shifted to a custom FastAPI wrapper that exposes a simplified REST interface (`/api/hotels/{id}/full`) with Bearer token authentication. This client is the foundational data layer for all subsequent SSG and ISR implementation stories.

## What (Description)
We implemented a singleton API client `cmsApiClient` in `web-app/lib/cms-api/client.ts` that handles authentication, error management (including graceful handling of partial failures via `_errors`), and retry logic with exponential backoff. Corresponding TypeScript types and Zod schemas were created to ensure strict runtime validation of the API response. We also built data transformers to handle content variants (concise, standard, extended), facility grouping, and address parsing from JSON strings.

## How (Acceptance Criteria)
- [x] Store `CMS_API_URL` and `CMS_API_TOKEN` in environment variables (`.env.local`).
- [x] Create singleton API client with Bearer token authentication.
- [x] Create TypeScript types matching the API response schema.
- [x] Implement `getHotelFull(hotelId)` to fetch aggregated hotel data.
- [x] Implement `checkCmsHealth()` for connectivity verification.
- [x] Handle `_errors` array gracefully (logging warnings instead of crashing).
- [x] Parse `address` JSON string into a structured object.
- [x] Disable Next.js fetch caching (`cache: 'no-store'`) for build-time freshness.
- [x] Implement retry logic (3 attempts, exponential backoff) for resilience.
- [x] Verify connectivity with integration tests using mocked fetch.

## Where (Impact Analysis)
*Implemented Files:*
- `web-app/lib/cms-api/client.ts`
- `web-app/lib/cms-api/types.ts`
- `web-app/lib/cms-api/schemas.ts`
- `web-app/lib/cms-api/transformers.ts`
- `web-app/lib/cms-api/env.ts`
- `web-app/lib/cms-api/index.ts`

*Test Files:*
- `web-app/tests/lib/cms-api/transformers.test.ts`
- `web-app/tests/integration/cms-api-connection.test.ts`

*Reference Files:*
- `web-app/.env.example`
- `docs/epics/epic-14.static-site-generation_isr_ready_2026-01-28.md`
