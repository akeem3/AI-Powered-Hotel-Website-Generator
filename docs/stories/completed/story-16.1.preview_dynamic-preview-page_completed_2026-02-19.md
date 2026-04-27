# Story 16.1: Dynamic Preview Page

> **Epic:** Epic 16 - Preview & Diversity Validation
> **Status:** Completed
> **Priority:** High
> **Story Points:** 5
> **Version:** 1.0
> **Completed:** 2026-02-19

## 1. The "Why" (Rationale)
The project required a way to visually verify that the component system can produce diverse website layouts without needing full build cycles or deployment. A dynamic preview route enables rapid iteration and testing of different `HomepageConfig` structures (fixtures) to confirm visual distinctiveness and system flexibility.

## 2. The "What" (Description)
**As a** developer
**I want** a `/preview` route that accepts a `config` query parameter (e.g., `?config=luxury-boutique`)
**So that** I can load specific JSON fixtures and render them dynamically using the `ComponentRenderer`, bypassing the need for database or API integration during development.

## 3. The "How" (Acceptance Criteria)
### AC1: Dynamic Fixture Loading
- [x] Implemented `/preview?config={name}` route to load fixtures from `web-app/fixtures/configs/`.
- [x] Validated that `config` parameter accepts only safe characters (alphanumeric, dashes, underscores) to prevent path traversal.
- [x] Handled 404 errors for missing configs with helpful UI suggestions.

### AC2: Security & Schema Validation
- [x] Enforced strict Zod schema validation using `HomepageConfigSchema`.
- [x] Implemented `STRICT_VALIDATION_CONFIG` to reject unsafe or unknown properties.
- [x] Applied `transformProps` and `filterSafeVariant` to sanitize component props before rendering.

### AC3: Debug Tools
- [x] Added a debug header overlay showing `generationId`, hotel name, and component count.
- [x] Implemented `Ctrl+D` (or `Cmd+D`) keyboard shortcut to toggle the debug overlay visibility.

### AC4: Rendering Integration
- [x] Integrated `ComponentRenderer` to render the component list defined in the config.
- [x] Ensured components are sorted by their `order` field.
- [x] Wrapped the preview page in the correct theme context (`<main data-mode="light">`).

## 4. The "Where" (Impact Analysis)
*   *Implemented Files:*
    *   `web-app/app/preview/page.tsx`
    *   `web-app/lib/validation/fixtureValidation.ts`
    *   `web-app/lib/validation/index.ts`
    *   `web-app/components/preview/DebugHeader.tsx`
    *   `web-app/components/preview/PreviewErrorUI.tsx`
    *   `web-app/components/preview/index.ts`
*   *Test Files:*
    *   `web-app/tests/lib/validation/fixtureValidation.test.ts`
    *   `web-app/tests/components/preview/DebugHeader.test.tsx`
    *   `web-app/tests/components/preview/PreviewErrorUI.test.tsx`
