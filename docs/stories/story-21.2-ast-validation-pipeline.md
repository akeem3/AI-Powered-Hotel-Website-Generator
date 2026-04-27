# Story 21.2: 5-Gate AST Validation Pipeline

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 1: Approach Discovery & Prototyping
**Status:** Draft
**Priority:** High (foundational infrastructure)

## User Story

**As a** researcher prototyping AI-assisted variant generation,
**I want** a 5-gate validation pipeline that parses generated TSX, extracts props interface, validates class strings, checks banned patterns, and runs TypeScript compilation,
**So that** AI-generated code can be validated for correctness before human review.

## Business Value

AI-generated code may have defects: wrong imports, missing props, invalid classes, or compilation errors. This validation pipeline catches these issues through 5 sequential gates, providing actionable error feedback that can be fed back to the LLM for retry. This ensures only code that passes all gates reaches human review.

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Gate 1: Import Verification

**Given** a complete `.tsx` file string passed to `validateGeneratedTSX(code, blockType, contractType)`
**When** Gate 1 (Import Verification) executes
**Then** the code parses as valid TypeScript using ts-morph
**And** all import paths resolve to existing files in the project
**And** no new npm packages are imported (only imports seen in sibling variants are allowed)
**And** if imports fail, the gate returns `{ passed: false, gate: "imports", errors: [...] }`

### Gate 2: Props Interface Verification

**Given** the parsed AST from Gate 1
**When** Gate 2 (Props Interface Verification) executes
**Then** the component's props type is extracted from the AST
**And** it is compared against the expected Zod contract for the block type
**And** all required props are present in the destructured props object
**And** if props mismatch, the gate returns `{ passed: false, gate: "props", errors: [...] }`

### Gate 3: CVA Class String Verification

**Given** the parsed AST from Gate 1
**When** Gate 3 (CVA Class String Verification) executes
**Then** all string literals used in `className` or CVA `cva()` calls are extracted
**And** each class is split on whitespace and validated against `SEMANTIC_TOKEN_ALLOWLIST`
**And** if any class is not in the allowlist, the gate returns `{ passed: false, gate: "classes", errors: [...] }`

### Gate 4: Semantic Token Compliance

**Given** the parsed AST from Gate 1
**When** Gate 4 (Semantic Token Compliance) executes
**Then** the AST is checked for template literals in `className` attributes (pattern: `` `bg-${...}` ``)
**And** the AST is checked for inline `style={}` attributes
**And** the AST is checked for `'use client'` directive correctness (required only for components with hooks/events)
**And** if banned patterns are found, the gate returns `{ passed: false, gate: "compliance", errors: [...] }`

### Gate 5: TypeScript Compilation

**Given** the generated TSX code string
**When** Gate 5 (TypeScript Compilation) executes
**Then** the file is written to a temp location within the project: `web-app/.temp/generated-variant.tsx`
**And** `tsc --noEmit` is executed on the temp file
**And** compiler errors are parsed and formatted for LLM retry
**And** the temp file is cleaned up after validation
**And** if compilation fails, the gate returns `{ passed: false, gate: "compilation", errors: [...] }`

### Success Case

**Given** a generated TSX file that passes all 5 gates
**When** `validateGeneratedTSX()` is called
**Then** it returns `{ passed: true, gates: [...] }` with per-gate details

### Validation Tests

**Given** an existing hand-crafted variant (e.g., `HeroCentered.tsx`)
**When** validated through the 5-gate pipeline
**Then** all gates pass (the pipeline must not reject valid hand-crafted code)

### Error Detection Tests

**Given** a TSX file with specific defects
**When** validated through the 5-gate pipeline
**Then** each gate correctly identifies its specific error type:
- Wrong import path → Gate 1 fails
- Missing required prop → Gate 2 fails
- Raw color class (`bg-blue-500`) → Gate 3 fails
- Template literal in className → Gate 4 fails
- Type error → Gate 5 fails

## Technical Requirements

### New File: `web-app/lib/ast-validation-pipeline.ts`

Create a new file with the following structure:

```typescript
/**
 * Validates AI-generated TSX through 5 sequential gates.
 * @param code - Generated TSX file content
 * @param blockType - Type of block being validated (e.g., "hero")
 * @param contractType - Zod contract to validate against
 * @returns Validation result with per-gate details
 */
export function validateGeneratedTSX(
  code: string,
  blockType: string,
  contractType: string
): ValidationResult {
  // Gate 1: Import Verification
  // Gate 2: Props Interface Verification
  // Gate 3: CVA Class String Verification
  // Gate 4: Semantic Token Compliance
  // Gate 5: TypeScript Compilation
}

interface ValidationResult {
  passed: boolean;
  gates: GateResult[];
}

interface GateResult {
  gate: string;
  passed: boolean;
  errors?: string[];
}
```

### Implementation Notes

- ts-morph is used for AST parsing — it's the same library used elsewhere in the project for codegen
- Temp files are written to `web-app/.temp/` to avoid polluting the source tree
- Gate 5 runs `tsc --noEmit` which can be slow (~2-5 seconds) — this is acceptable for validation, not generation speed
- Error messages are formatted for LLM retry: file paths, line numbers, specific fix suggestions
- The validation pipeline is synchronous by design; async is not needed

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| **New File** | `web-app/lib/ast-validation-pipeline.ts` | `validateGeneratedTSX()`, gate functions | Create new file with 5-gate validation logic |
| Use | `web-app/lib/contracts/hero.contract.ts` | `HeroSectionContract` | Gate 2 expected props interface |
| Use | `web-app/lib/style-generation/tailwind-allowlist.ts` | `SEMANTIC_TOKEN_ALLOWLIST` | Gate 3 class validation |
| Use | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Valid variant | Test: should pass all gates |
| Pattern | `web-app/lib/validation/` | Existing validation patterns | Follow same error formatting |
| Dependency | `ts-morph` | npm package | AST parsing and manipulation |

## Dependencies

### Prerequisites

- **Story 21.1** (context assembler provides sibling files for reference)
- **Epic 20 Story 20.7** (Semantic Token Allowlist exists)

### Blocks

- Blocked by: Story 21.1, Epic 20 Story 20.7

## Testing Requirements

- Unit tests for each gate function
- Test valid variant passes all gates (HeroCentered.tsx)
- Test each gate fails with appropriate error:
  - Gate 1: wrong import path
  - Gate 2: missing required prop
  - Gate 3: raw color class
  - Gate 4: template literal className
  - Gate 5: type error
- Test temp file cleanup after Gate 5
- Test error message formatting for LLM retry

## Definition of Done

- [ ] `web-app/lib/ast-validation-pipeline.ts` file created with 5-gate validation logic
- [ ] All 5 gates implemented with correct validation logic
- [ ] ts-morph integration for AST parsing
- [ ] Semantic token allowlist validation in Gate 3
- [ ] Template literal detection in Gate 4
- [ ] TypeScript compilation check in Gate 5
- [ ] Temp file creation and cleanup in Gate 5
- [ ] Error messages formatted for LLM retry
- [ ] Valid hand-crafted variant (HeroCentered.tsx) passes all gates
- [ ] Each gate correctly identifies its specific error type
- [ ] Unit tests pass for all gates
- [ ] Integration test with full validation pipeline

## Relevant NFRs

- **NFR14:** Component Reusability — validation pipeline works for any block type

---

**Story Points:** 8
**Estimated Duration:** 2-3 sessions
**Risk Level:** Medium (AST parsing complexity, TypeScript compiler integration)
