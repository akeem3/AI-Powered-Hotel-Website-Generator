# Test TypeScript Errors Fix Plan

**Date:** 2026-03-18
**Total Errors:** 258 across 49 files
**Strategy:** 10 parallel `test-react` agents, grouped by error pattern and root cause

---

## Root Cause Analysis

All errors stem from **component/type refactoring without test updates**:

| Root Cause | Error Codes | Count | Description |
|-----------|-------------|-------|-------------|
| Missing required props after refactor | TS2741, TS2739 | 60 | `background` became required on HeroSection; `WorkflowState` gained new required fields |
| Type assignment mismatch | TS2322 | 80 | Props interfaces changed (flat -> nested variant, new types) |
| Argument type mismatch | TS2345 | 25 | Mock data shape doesn't match current function signatures |
| Read-only `process.env.NODE_ENV` | TS2540 | 24 | Direct assignment to read-only property |
| Possibly null/undefined | TS18047, TS18048 | 28 | Missing null checks on optional properties |
| Unknown properties on object literals | TS2353 | 10 | Schema changed, test mocks have stale fields |
| Missing/renamed exports | TS2339, TS2724 | 13 | Properties removed or renamed |
| Other | Various | 18 | One-off issues |

---

## Execution Plan: 10 Parallel Agents

### Pre-flight

Before launching agents, run this to capture the baseline:

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -c "error TS"
# Expected: 258
```

### Post-flight

After all agents complete, verify zero errors:

```bash
cd web-app && npx tsc --noEmit 2>&1 | grep -c "error TS"
# Expected: 0
```

Then run the test suite:

```bash
cd web-app && npm test 2>&1 | tail -20
```

---

## Agent 1: HeroSection.HeroCentered (47 errors)

**File:** `tests/components/sections/HeroSection.HeroCentered.test.tsx`
**Error:** TS2741 — `background` prop is missing from all test renders
**Root Cause:** `background` became required on `HeroSectionProps` after refactor

**Fix:** Add `background: 'image'` to the `defaultProps` object at the top of the test file. Every `render(<HeroSection {...defaultProps} .../>)` will inherit it. Verify the `HeroSectionProps` interface in `components/sections/HeroSection/index.tsx` to confirm the correct type.

```
Agent: test-react
Files: tests/components/sections/HeroSection.HeroCentered.test.tsx
       components/sections/HeroSection/index.tsx (read-only, for reference)
```

**Prompt:**
```
Fix all TypeScript errors in web-app/tests/components/sections/HeroSection.HeroCentered.test.tsx.

The error is TS2741: Property 'background' is missing. The HeroSection component now requires
a `background` prop of type 'gradient' | 'solid' | 'image'.

Read the HeroSection component's props interface first (check components/sections/HeroSection/),
then add `background: 'image'` to the defaultProps/baseProps object in the test file so all
renders inherit it. If there's no shared defaultProps, add it to each render call.

Do NOT modify the component. Only fix the test file. Do NOT run tests.
```

---

## Agent 2: WorkflowState Tests (25 errors across 8 files)

**Files:**
- `tests/langgraph/agents/AssemblyAgent.test.ts` (1)
- `tests/langgraph/agents/archetype-classifier.test.ts` (6)
- `tests/langgraph/agents/ComponentSelector.test.ts` (2)
- `tests/langgraph/agents/ContentGenerator.test.ts` (1)
- `tests/langgraph/agents/StylingAgent.test.ts` (1)
- `tests/langgraph/agents/token-generator.test.ts` (1)
- `tests/langgraph/HomepageGenerationWorkflow.test.ts` (1)
- `tests/langgraph/HomepageGenerationWorkflow.fallbacks.test.ts` (7)
- `tests/langgraph/performance-benchmarks.test.ts` (2)
- `tests/langgraph/generation-edge-cases.test.ts` (5)

**Errors:** TS2739 (missing properties), TS2741 (missing required), TS2322 (type mismatch), TS2339 (property doesn't exist)
**Root Cause:** `WorkflowState` type gained new required fields: `archetypeClassification`, `designTokens`, `contentJson`. Mock states in tests don't include them.

**Fix:** Read the current `WorkflowState` type definition, then add the missing fields to all mock state objects in these files.

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in the following test files in web-app/:

- tests/langgraph/agents/AssemblyAgent.test.ts
- tests/langgraph/agents/archetype-classifier.test.ts
- tests/langgraph/agents/ComponentSelector.test.ts
- tests/langgraph/agents/ContentGenerator.test.ts
- tests/langgraph/agents/StylingAgent.test.ts
- tests/langgraph/agents/token-generator.test.ts
- tests/langgraph/HomepageGenerationWorkflow.test.ts
- tests/langgraph/HomepageGenerationWorkflow.fallbacks.test.ts
- tests/langgraph/performance-benchmarks.test.ts
- tests/langgraph/generation-edge-cases.test.ts

Root cause: The WorkflowState type (find it in web-app/app/langgraph/) gained new required
fields (likely archetypeClassification, designTokens, contentJson). All mock WorkflowState
objects in these tests are missing them.

Steps:
1. Read the current WorkflowState type definition
2. Read each test file
3. Add the missing required fields with sensible mock values to every mock state object

Also fix any TS2322 (type mismatch), TS2345 (argument mismatch), or TS2339 (missing property)
errors in these files — they're related to the same refactoring.

Do NOT modify source code. Only fix test files. Do NOT run tests.
```

---

## Agent 3: NODE_ENV Read-Only (24 errors across 3 files)

**Files:**
- `tests/components/preview/DebugHeader.test.tsx` (5)
- `tests/simple/content/epic13-stories.test.ts` (18)
- `tests/simple/content/defaults.test.ts` (2 — includes TS2704 delete operator)

**Error:** TS2540 — Cannot assign to read-only property `NODE_ENV`
**Root Cause:** TypeScript strict mode makes `process.env.NODE_ENV` read-only

**Fix:** Replace all `process.env.NODE_ENV = 'value'` with `Object.defineProperty(process.env, 'NODE_ENV', { value: 'value', writable: true })`. For the `delete` operator in defaults.test.ts, use `Object.defineProperty(process.env, 'NODE_ENV', { value: undefined, writable: true })`.

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in these 3 test files in web-app/:

- tests/components/preview/DebugHeader.test.tsx (5 errors)
- tests/simple/content/epic13-stories.test.ts (18 errors)
- tests/simple/content/defaults.test.ts (2 errors)

All errors are TS2540: Cannot assign to 'NODE_ENV' because it is a read-only property.

Fix by replacing every `process.env.NODE_ENV = '...'` with:
  Object.defineProperty(process.env, 'NODE_ENV', { value: '...', writable: true });

For defaults.test.ts, also fix TS2704 (delete operator on read-only property) by replacing:
  delete process.env.NODE_ENV;
with:
  Object.defineProperty(process.env, 'NODE_ENV', { value: undefined, writable: true });

Read each file first. Do NOT modify source code. Do NOT run tests.
```

---

## Agent 4: ResponsiveDesign + Component Props (21+ errors across 5 files)

**Files:**
- `tests/responsive/ResponsiveDesign.test.tsx` (21)
- `tests/responsive/responsive-breakpoints.test.tsx` (1)
- `tests/components/sections/HeroMinimal.test.tsx` (1)
- `tests/components/sections/Features.test.tsx` (1)
- `tests/performance/TestimonialCarousel.perf.test.tsx` (1)

**Errors:** TS2322 — Type mismatches on component props (image format changed, BookingWidgetProps, HeroMinimalProps, etc.)
**Root Cause:** Component prop interfaces changed (e.g., gallery images now use `desktopUrl`/`mobileUrl` instead of `src`, Testimonial type changed, HeroMinimal removed stray props)

**Fix:** Read each component's current props interface, then update test mock data to match.

```
Agent: test-react
```

**Prompt:**
```
Fix TypeScript errors in these test files in web-app/:

- tests/responsive/ResponsiveDesign.test.tsx (21 errors)
  Error: Image type changed from { id, src, alt } to { id, desktopUrl, mobileUrl, alt, caption? }.
  Also BookingWidget props, Amenities props, Testimonials props may have changed.

- tests/responsive/responsive-breakpoints.test.tsx (1 error)
  Error: BookingWidgetProps doesn't accept hotelId.

- tests/components/sections/HeroMinimal.test.tsx (1 error)
  Error: HeroMinimalProps doesn't accept 'as' and 'const' props. Remove them.

- tests/components/sections/Features.test.tsx (1 error)
  Error: HTMLElement doesn't have 'alt'. Cast to HTMLImageElement.

- tests/performance/TestimonialCarousel.perf.test.tsx (1 error)
  Error: Testimonial type changed — mock data has wrong shape.

For each file:
1. Read the component's current props/types (find them in web-app/components/ or web-app/lib/)
2. Read the test file
3. Update mock data and test renders to match current interfaces

Do NOT modify source code. Only fix test files. Do NOT run tests.
```

---

## Agent 5: Content Migration + E2E Tests (24 errors across 2 files)

**Files:**
- `tests/integration/content-migration.test.tsx` (17)
- `tests/e2e/content-system.e2e.test.tsx` (7)

**Errors:** TS2322, TS2353 — Component props changed (Amenities/Testimonials lost `hotelId`, Testimonial type changed)
**Root Cause:** Same Server Component refactoring as Amenities/Testimonials — content integration props removed

**Fix:** Remove `hotelId` props from component renders, update mock Testimonial objects to match current type.

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in these test files in web-app/:

- tests/integration/content-migration.test.tsx (17 errors)
- tests/e2e/content-system.e2e.test.tsx (7 errors)

Root cause: Components (Amenities, Testimonials) were refactored to Server Components.
They no longer accept `hotelId` or `enableContent` props.

The Testimonial type also changed — check current type in:
  web-app/lib/contracts/testimonials.contract.ts or web-app/components/blocks/Testimonials/

Steps:
1. Read the current AmenitiesProps, TestimonialsProps, and Testimonial type definitions
2. Read each test file
3. Remove hotelId/enableContent props from renders
4. Update mock Testimonial data to match current type (e.g., field names/required fields)
5. Fix any TS2353 errors (unknown properties on object literals)

Do NOT modify source code. Only fix test files. Do NOT run tests.
```

---

## Agent 6: CVA Variant Agent + Archetype Tests (31 errors across 2 files)

**Files:**
- `tests/langgraph/agents/cva-variant-agent.test.ts` (19)
- `tests/scripts/archetype-variant-key-regex.test.ts` (12)

**Errors:** TS2345, TS2322, TS2739, TS18047
**Root Cause:** CVA variant agent mock setup uses wrong types; archetype regex test has unhandled null from `match()`

**Fix for cva-variant-agent:** Read `WorkflowState` and the cva-variant-agent to understand current types, fix mock state objects and function signatures.
**Fix for archetype-regex:** Add null checks after `.match()` calls.

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in these test files in web-app/:

- tests/langgraph/agents/cva-variant-agent.test.ts (19 errors)
  Errors: TS2345 (argument type mismatch for prompt template mock), TS2322 (type mismatch),
  TS2739 (missing WorkflowState properties)
  Read the CVA variant agent source and WorkflowState type first.

- tests/scripts/archetype-variant-key-regex.test.ts (12 errors)
  Error: TS18047 — 'match' is possibly null. All 12 errors are the same pattern.
  Fix: Add null checks after .match() calls, e.g.:
    const match = str.match(pattern);
    expect(match).not.toBeNull();
    // then access match![1] etc.

Read each file first. Do NOT modify source code. Only fix test files. Do NOT run tests.
```

---

## Agent 7: Story Integration Tests (17 errors across 4 files)

**Files:**
- `tests/integration/Story15Integration.test.tsx` (6)
- `tests/integration/Story14Integration.test.tsx` (2)
- `tests/integration/story-16.02.preview-integration.test.tsx` (8)
- `tests/integration/user-journeys.test.tsx` (1)

**Errors:** TS2347, TS2353, TS2322, TS18047, TS18046, TS2769
**Root Cause:** Various — `price` property removed from availability response, null checks missing, type mismatches

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in these test files in web-app/:

- tests/integration/Story15Integration.test.tsx (6 errors)
  TS2347: Untyped function calls may not accept type arguments — remove type arguments from
  function calls where the function isn't generic.
  TS2353: 'price' doesn't exist on MockAvailabilityResponse — remove price from mock objects
  or check current type.

- tests/integration/Story14Integration.test.tsx (2 errors)
  TS2322: Type 'number' not assignable to 'string' — fix the mock data field type.

- tests/integration/story-16.02.preview-integration.test.tsx (8 errors)
  TS18047/TS18046: 'fixtureData' possibly null, '.components' is unknown — add null assertions
  and type assertions.

- tests/integration/user-journeys.test.tsx (1 error)
  TS2769: No overload matches — check current component props and fix the render call.

Read each file and the relevant source types first. Do NOT modify source. Do NOT run tests.
```

---

## Agent 8: Style Generation + Design Tokens (10 errors across 4 files)

**Files:**
- `tests/style-generation/typography-mapper.test.ts` (3)
- `tests/style-generation/token-pipeline-integration.test.ts` (3)
- `tests/style-generation/hotel-design-tokens.test.ts` (2)
- `tests/lib/apca-retry-loop.test.ts` (2)

**Errors:** TS2322 (type mismatch), TS2353 (unknown property `borderRadius`), TS2339, TS7053
**Root Cause:** Design token schema changed — `borderRadius` field moved or renamed, typography personality type literals changed

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in these test files in web-app/:

- tests/style-generation/typography-mapper.test.ts (3 errors)
  TS2322: String not assignable to personality type. Read the current HeadingPersonality/
  BodyPersonality types from web-app/lib/style-generation/ and fix test values.

- tests/style-generation/token-pipeline-integration.test.ts (3 errors)
  TS2353: 'borderRadius' doesn't exist on the type. The schema changed — read current
  HotelDesignTokens schema from web-app/lib/style-generation/schemas/ and update test mocks.

- tests/style-generation/hotel-design-tokens.test.ts (2 errors)
  TS2339: 'archetype' doesn't exist on type. TS7053: Index expression issue.
  Read the current schema and fix property access.

- tests/lib/apca-retry-loop.test.ts (2 errors)
  TS2353: 'borderRadius' doesn't exist. Same schema change — update mock objects.

Read each source schema first. Do NOT modify source code. Only fix test files. Do NOT run tests.
```

---

## Agent 9: Contracts + Hydration + Migration Edge Cases (16 errors across 5 files)

**Files:**
- `tests/contracts/Phase3Verification.test.tsx` (5)
- `tests/contracts/UIComponentContracts.test.ts` (3)
- `tests/hybrid-architecture/hydration.test.tsx` (3)
- `tests/simple/components/migration-edge-cases.test.tsx` (5)
- `tests/fixtures/story-16.02.validation-errors.test.ts` (2)

**Errors:** TS18048, TS2339, TS1355, TS2322, TS2345
**Root Cause:** Optional chaining needed, type changes in Amenities/Testimonials, const assertion issues

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in these test files in web-app/:

- tests/contracts/Phase3Verification.test.tsx (5 errors)
  TS18048: 'result.error' possibly undefined — add null checks or optional chaining.

- tests/contracts/UIComponentContracts.test.ts (3 errors)
  TS1355: const assertion on invalid target — remove or fix the const assertion.
  TS18048: 'result.errors' possibly undefined — add null check.
  TS2339: 'displayName' doesn't exist on Mock — cast appropriately.

- tests/hybrid-architecture/hydration.test.tsx (3 errors)
  TS2322: AmenitiesProps mismatch — variant.layout must be a literal type, not string.
  Use 'grid' as const or cast.

- tests/simple/components/migration-edge-cases.test.tsx (5 errors)
  TS2322: Testimonial mock data shape doesn't match current type. Read the current
  Testimonial type and update mocks.

- tests/fixtures/story-16.02.validation-errors.test.ts (2 errors)
  TS2345: undefined not assignable — add type assertions or fix function arguments.

Read each source type first. Do NOT modify source code. Only fix test files. Do NOT run tests.
```

---

## Agent 10: Remaining Scattered Errors (13 errors across 9 files)

**Files:**
- `tests/langgraph/workflow-with-tokens.test.ts` (9)
- `tests/langgraph/ContentGenerator.production.test.ts` (2)
- `tests/langgraph/AnthropicClient.sgr.test.ts` (1)
- `tests/langgraph/agents/QualityValidator.test.ts` (1)
- `tests/lib/diversity/structural-metric.test.ts` (5)
- `tests/lib/diversity/thematic-metric.test.ts` (1)
- `tests/lib/diversity/diversity-scorer.test.ts` (1)
- `tests/scripts/generate-diversity-report.test.ts` (1)
- `tests/scripts/generate-diversity-batch.test.ts` (1)
- `tests/scripts/generate-cva-variants.test.ts` (1)
- `tests/e2e/verification.spec.ts` (2)
- `tests/pages/RoomsPage.test.tsx` (4)
- `tests/components/sections/RoomsGrid.test.tsx` (4)
- `__tests__/lib/metadata/index.test.ts` (1)

**Errors:** Mixed — TS2820 (wrong literal), TS2322, TS18048, TS2339, TS2459 (module export), TS2307 (missing module), TS7031, TS2578
**Root Cause:** Various one-off issues

```
Agent: test-react
```

**Prompt:**
```
Fix all TypeScript errors in these test files in web-app/:

1. tests/langgraph/workflow-with-tokens.test.ts (9 errors)
   TS2820: '"boutette-editorial"' not assignable — check current archetype literal union type.
   TS2322: string not assignable to borderRadius type.
   TS18048: possibly undefined on archetypeClassification.

2. tests/langgraph/ContentGenerator.production.test.ts (2 errors)
   TS2322: WorkflowState mock mismatch. TS18048: blurhash possibly undefined.

3. tests/langgraph/AnthropicClient.sgr.test.ts (1 error)
   TS2339: 'event' doesn't exist on LangFuseService — check current LangFuseService interface.

4. tests/langgraph/agents/QualityValidator.test.ts (1 error)
   TS2578: Unused @ts-expect-error — remove the directive.

5. tests/lib/diversity/structural-metric.test.ts (5 errors)
   TS2322: Component type literals don't match union type — check current component type union.

6. tests/lib/diversity/thematic-metric.test.ts (1 error)
   TS2322: Type mismatch on component config.

7. tests/lib/diversity/diversity-scorer.test.ts (1 error)
   TS2459: HomepageConfig not exported — use the correct export name from types module.

8. tests/scripts/generate-diversity-report.test.ts (1 error)
   TS18046: 'data' is unknown — add type assertion.

9. tests/scripts/generate-diversity-batch.test.ts (1 error)
   TS2339: 'config' doesn't exist — check current return type.

10. tests/scripts/generate-cva-variants.test.ts (1 error)
    TS2345: Callback argument type mismatch — fix forEach callback signature.

11. tests/e2e/verification.spec.ts (2 errors)
    TS2307: Cannot find @playwright/test. TS7031: implicit any.
    Add @ts-nocheck at top if Playwright is not installed, or add type annotations.

12. tests/pages/RoomsPage.test.tsx (4 errors)
    TS2322: Props shape mismatch — read current RoomsPage component props.

13. tests/components/sections/RoomsGrid.test.tsx (4 errors)
    TS2322/TS2769/TS2345: RoomCardProps changed — read current type and fix mock data.

14. __tests__/lib/metadata/index.test.ts (1 error)
    TS2724: EXTENDED_LOCALE_CODES not exported — change import to KNOWN_LOCALE_CODES
    (it was exported in the source during our previous fix).

For each file: read the relevant source types first, then fix the test.
Do NOT modify source code. Only fix test files. Do NOT run tests.
```

---

## Execution Command

Copy-paste this into a Claude Code conversation to launch all 10 agents in parallel:

```
Fix all 258 TypeScript test errors across the codebase by running the 10 agents defined
in docs/plans/test-ts-errors-fix-plan.md. Launch ALL 10 agents in parallel using the
test-react subagent type. Each agent's prompt is in the plan file under its section.
After all agents complete, run `npx tsc --noEmit` to verify zero errors.
```

---

## Error Count Verification Table

| Agent | Files | Errors | Pattern |
|-------|-------|--------|---------|
| 1 | 1 | 47 | HeroCentered missing `background` |
| 2 | 10 | 25 | WorkflowState missing fields |
| 3 | 3 | 24 | NODE_ENV read-only |
| 4 | 5 | 25 | Component props changed |
| 5 | 2 | 24 | Content integration removed |
| 6 | 2 | 31 | CVA + archetype regex null |
| 7 | 4 | 17 | Integration test mismatches |
| 8 | 4 | 10 | Design token schema changes |
| 9 | 5 | 16 | Contracts + hydration |
| 10 | 14 | 39 | Scattered one-offs |
| **Total** | **50** | **258** | |
