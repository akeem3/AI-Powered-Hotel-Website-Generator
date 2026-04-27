---
type: story
id: "14.10.data-adapter-pattern"
status: todo
priority: high
epic_number: 14
story_number: 10
created_at: "2026-02-13T17:00:00+08:00"
updated_at: "2026-02-13T17:00:00+08:00"
created_by: architect-agent
updated_by: hallucination-checker
depends_on:
  - docs/epics/epic-14.static-site-generation_isr_ready_2026-01-28.md
  - docs/stories/completed/story-14.4.ssg-build-time-content-injection_completed_2026-02-10.md
related_artifacts:
  - web-app/lib/contracts/index.ts
  - web-app/lib/cms-api/types.ts
acceptance_criteria_met: "0/6"
hallucination_check: passed
security_check: passed
test_coverage: pending
code_review_status: pending
tags: [architecture, design-pattern, adapters, data-mapping, maintainability, next.js]
archival_date: null

code_scout:
  status: pending
  scanned_at: null

pattern_research:
  status: pending
  researched_at: null
  libraries_analyzed: []
  patterns_injected: 0
  warnings_added: 0

---
# Story: Refactor Data Mapping (Adapter Pattern)

## User Story

**As a** developer
**I want** to refactor the data transformation logic into pure adapter functions
**So that** the same data mapping logic can be reused by the Dynamic Component Assembler (Epic 16+) without code duplication.

## Context

Epic 14 (Static Site Generation) and Epic 16 (Dynamic Component Assembly) both need to populate components with CMS data, but they operate in different contexts.
- **Epic 14**: Trusted source (CMS API), build-time execution.
- **Epic 16**: Untrusted/AI source (JSON Config), runtime execution.

This story introduces the **Adapter Pattern** to bridge this gap. We will create pure functions that transform raw CMS data into strictly typed component props.

**Epic Reference:** [Epic 14](../epics/epic-14.static-site-generation_isr_ready_2026-01-28.md)

## Acceptance Criteria

- [ ] **AC1**: Directory `web-app/lib/mappers/` created with `index.ts` barrel file.
- [ ] **AC2**: Pure mapper functions implemented for major components:
    - `mapCmsToHero(hotel: HotelFullResponse, lang: string): HeroSectionProps`
    - `mapCmsToRooms(hotel: HotelFullResponse, lang: string): RoomsGridProps`
    - `mapCmsToFacilities(hotel: HotelFullResponse, lang: string): AmenitiesProps`
    - `mapCmsToGallery(hotel: HotelFullResponse): ImageGalleryProps`
- [ ] **AC3**: Mappers use strictly typed interfaces (inferred from Zod schemas in `web-app/lib/contracts/`) as return types.
- [ ] **AC4**: `getHotelPageData` (loaders) refactored to use these mappers instead of inline transformation logic.
- [ ] **AC5**: Generated pages verified to render correctly (visual consistency check).
- [ ] **AC6**: No Zod runtime validation performed in the static build path (relying on TS-inferred types for performance).

## Technical Considerations

- **Pure Functions**: Mappers must be pure (deterministic, no side effects, no API calls).
- **Type Safety**: Use `z.infer<typeof ComponentSchema>` to ensure return types match component expectations exactly.
- **Fallback Logic**: Detailed fallback logic (e.g., "if Extended variant missing, try Standard") should live INSIDE these mappers, NOT in the component or loader.
- **Separation of Concerns**:
    - `loaders.ts`: Fetches data, coordinates async ops.
    - `mappers/*.ts`: Transforms data (sync).
    - `components/*.tsx`: Renders data.

## Security Considerations

- **XSS Prevention**: Since CMS data is considered a "Trusted Source" in this context, we are standardizing on passing it as plain text props. If any component requires rich text (HTML), it must be sanitized *before* being passed to the component, or the component must use a safe parser. The Mapper should generally pass raw strings, and the Component decides how to render.
- **Data Integrity**: The Mappers act as the **Corruption Anti-Layer** (ACL). They must ensure that even if the CMS returns partial/malformed data, the Component receives a valid Props object (using defaults/fallbacks) or the build fails gracefully. Never pass `undefined` to a required prop.

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Unit tests added for mapper functions (testing edge cases like missing variants)
- [ ] No regression in SSG build time or page rendering

## Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| Story 14.4: Content Injection | Internal | Complete |
| Zod Schemas (`lib/contracts`) | Internal | Complete |

## Out of Scope

- Implementing Zod validation inside the mappers (this is reserved for Epic 16 usage). Keep Mappers as pure data transformers.
