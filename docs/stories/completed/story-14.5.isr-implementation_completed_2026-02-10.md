---
type: story
id: "14.5.isr-implementation"
status: done
priority: medium
epic_number: 14
story_number: 5
created_at: "2026-02-10T13:35:00+08:00"
updated_at: "2026-02-11T09:05:00+08:00"
created_by: story-creator-v2
updated_by: dev-agent-james
depends_on:
  - docs/epics/epic-14.static-site-generation_isr_ready_2026-01-28.md
  - docs/stories/story-14.4.ssg-build-time-content-injection_draft_2026-02-10.md
related_artifacts: []
acceptance_criteria_met: "10/10"
hallucination_check: passed
security_check: passed
test_coverage: complete
code_review_status: ready_for_review
tags: [isr, webhooks, revalidation, next.js, availability, security]
archival_date: null

code_scout:
  status: pending
  scanned_at: null

pattern_research:
  status: completed
  researched_at: "2026-02-10T14:05:00+08:00"
  libraries_analyzed:
    - "next@15.5.6"
  patterns_injected: 2
  warnings_added: 0
---

# Story: ISR Implementation (Time-Based + CMS Webhook Triggers)

## User Story

**As a** developer
**I want** to implement Incremental Static Regeneration with time-based and webhook triggers
**So that** static pages can update without redeploy when hotel content changes in the CMS

## Context

This story implements the "Freshness" aspect of our architecture. We use ISR (Incremental Static Regeneration) to update pages. Updates can be triggered by time (every hour) or explicitly via a webhook from the CMS when content is published.

**Epic Reference:** [Epic 14](../epics/epic-14.static-site-generation_isr_ready_2026-01-28.md)

## Acceptance Criteria

- [x] **AC1**: `export const revalidate = 3600` added to hotel page routes (1 hour default)
- [x] **AC2**: API route `/api/revalidate` implemented to handle POST requests
- [x] **AC3**: Webhook secret verification implemented matching `REVALIDATION_SECRET` env var (CRITICAL: Constant-time comparison)
- [x] **AC4**: Revalidation logic triggers `revalidatePath` for all active languages for the hotel (based on content)
- [x] **AC5**: Revalidation API checks `hotel_id` in body matches `HOTEL_ID` env var (ignores if mismatch)
- [x] **AC6**: Implements `revalidateTag` for hotel-level cache key invalidation
- [x] **AC7**: Returns 200 OK on success, 401 on invalid secret, 400 on bad request
- [x] **AC8**: Logs revalidation events (timestamp, hotelId, paths revalidated)
- [x] **AC9**: Tested with manual POST request to verify content update without full rebuild
- [x] **AC10**: Use `timingSafeEqual` for secret comparison to prevent timing attacks

## Technical Considerations

- **Security**: The secret is critical. Do not hardcode. Use `process.env.REVALIDATION_SECRET`. Use constant-time comparison (e.g., `crypto.timingSafeEqual`) to prevent timing attacks.
- **Per-Hotel Scope**: Since we have one deployment per hotel, the revalidate API only needs to worry about that one hotel. If the webhook sends an ID that doesn't match `HOTEL_ID`, it's an event for a different hotel - ignore it (or return 200 to satisfy CMS webhook delivery).
- **Path Revalidation**: We need to know which languages exist to revalidate `/en/hotels/...`, `/th/hotels/...`. If we can't easily know, we might assume configured locales or rely on tag-based revalidation if all data fetchers use tags.

## Pattern Research (Next.js 15)

### Required Patterns

**Revalidation APIs:**
- `revalidatePath(path, type)`: To purge specific pages.
- `revalidateTag(tag)`: To purge all data fetches tagged with `tag`.

**Tag-Based Revalidation Strategy:**
In your data fetcher (from Story 14.1/14.4), add tags:
```typescript
fetch(url, { next: { tags: [`hotel-${hotelId}`] } })
```
Then, in the webhook:
```typescript
revalidateTag(`hotel-${hotelId}`);
```
This is often more robust than calculating every single language path variation.

**Route Handler:**
Use App Router Route Handlers (`app/api/revalidate/route.ts`).
```typescript
export async function POST(request: NextRequest) {
  // ... verification logic
  return NextResponse.json({ revalidated: true });
}
```

### Anti-Patterns
- **Using Pages Router API Routes**: Do not place in `pages/api`. Use `app/api`.
- **Exposing Secret in Errors**: If validation fails, return generic "Invalid request", do not leak "Expected secret X".

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Story 14.4: Content Injection | Internal | Completed |
| REVALIDATION_SECRET | Configuration | Documented in .env.example |

## Out of Scope

- Setting up the webhook implementation in the CMS itself (assumed existing)

## Definition of Done

- [x] All acceptance criteria met
- [x] API endpoint tested with generic HTTP client
- [x] Secret verification unit tested
- [x] Revalidation logic verified

---

## Dev Agent Record

### Agent Model Used
- **Claude Opus 4.6** - claude-opus-4-6

### Completion Notes
- All 10 acceptance criteria implemented and tested
- 15 unit tests created for the revalidation API endpoint
- Full test suite passes: 1656 tests, 68 test suites
- Security implemented: constant-time string comparison using crypto.timingSafeEqual()
- Per-hotel deployment pattern followed

### File List

**Created:**
- `web-app/app/api/revalidate/route.ts` (280 lines) - ISR webhook endpoint
- `web-app/tests/lib/ssg/revalidate.test.ts` (444 lines) - Test suite

**Modified:**
- `web-app/app/[lang]/page.tsx` - Added `export const revalidate = 3600`
- `web-app/app/[lang]/hotels/[slug]/page.tsx` - Added `export const revalidate = 3600`

**Verified Existing:**
- `web-app/.env.example` - REVALIDATION_SECRET documented
- `web-app/lib/cms-api/env.ts` - getRevalidationSecret() helper function

### Change Log
- 2026-02-11: Implemented ISR revalidation API with constant-time secret verification
- 2026-02-11: Added time-based revalidation (3600s) to all page routes
- 2026-02-11: Created comprehensive test suite covering all acceptance criteria

---

## Agent Activity Log

### Creation
- **Agent**: story-creator-v2
- **Timestamp**: 2026-02-10T13:35:00+08:00
- **Notes**: Story created from Epic 14, Story 14.5 specification

### Update
- **Agent**: security-validator-v2
- **Timestamp**: 2026-02-10T13:50:00+08:00
- **Notes**: Added AC10 and updated technical considerations to enforce constant-time string comparison for the revalidation secret to mitigate timing attacks.

### Update
- **Agent**: pattern-researcher-v2
- **Timestamp**: 2026-02-10T14:05:00+08:00
- **Notes**: Injected Next.js 15 `revalidateTag` pattern for robust cache invalidation.

### Implementation
- **Agent**: dev-agent-james
- **Timestamp**: 2026-02-11T09:05:00+08:00
- **Notes**: Implemented ISR revalidation API with constant-time secret comparison. Added time-based revalidation to page routes. Created 15 unit tests. All acceptance criteria met. Status changed to Ready for Review.

---

## QA Results

### Review Date: 2026-02-11

### Reviewed By: Quinn (QA Agent)

### Review Summary
All 10 acceptance criteria verified and met. Implementation follows Next.js 15 ISR patterns correctly with proper security measures.

### Security Verification
- Constant-time comparison using `crypto.timingSafeEqual()` implemented correctly
- Generic error messages prevent secret leakage
- Secret not logged in error scenarios
- Per-hotel deployment pattern enforced

### Test Coverage
- 15 unit tests covering all acceptance criteria
- Full test suite: 1656/1656 tests passing
- Tests for secret verification, revalidation logic, response handling, and logging

### Gate Status

Gate: PASS → docs/qa/gates/14.5-isr-implementation.yml
