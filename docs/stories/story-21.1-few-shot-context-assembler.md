# Story 21.1: Few-Shot Context Assembler + Semantic Allowlist Integration

**Epic:** Epic 21 — Structural Variant Generation Research
**Phase:** Phase 1: Approach Discovery & Prototyping
**Status:** Draft
**Priority:** High (foundational infrastructure)

## User Story

**As a** researcher prototyping AI-assisted variant generation,
**I want** a context assembler that gathers sibling variant files, contracts, CVA definitions, and the semantic token allowlist,
**So that** the LLM generation prompt has all necessary context to produce structurally valid code.

## Business Value

Without proper few-shot context, an LLM cannot generate code that matches the project's patterns. This story ensures every generation prompt has complete sibling variant files, exact Zod contracts, and the allowlist of approved classes — providing the raw materials needed for AI-assisted structural variant generation.

## FR/NFR Coverage

- **FR7:** 4-Tier Component Architecture — router pattern, structural variants
- **FR8:** Component Registry — Zod contracts, CVA validation

## Acceptance Criteria

### Component Context Gathering

**Given** the context assembler is imported with a block directory path
**When** `gatherComponentContext(blockDir)` is called
**Then** it returns a formatted string containing 2-3 complete `.tsx` files from that directory
**And** it excludes `index.tsx` (router) and `.client.tsx` (client wrappers) from the results
**And** each sibling file is wrapped in delimiters: `=== EXISTING COMPONENT: {filename} ===\n{content}\n=== END ===`

### Contract Context Gathering

**Given** the context assembler is imported with a contract file path
**When** `gatherContractContext(contractPath)` is called
**Then** it returns the Zod contract file content wrapped in delimiters: `=== ZOD CONTRACT ===\n{content}\n=== END ===`

### Allowlist Context Gathering

**Given** the context assembler is imported
**When** `gatherAllowlistContext()` is called
**Then** it returns the `SEMANTIC_TOKEN_ALLOWLIST` as a newline-separated string wrapped in delimiters: `=== ALLOWED TAILWIND CLASSES ===\n{classes}\n=== END ===`

### Combined Prompt Assembly

**Given** all three context gatherers are called for the HeroSection block
**When** the results are combined into a single generation prompt
**Then** the prompt contains:
- 3 sibling variant files (HeroCentered.tsx, HeroSplit.tsx, HeroMinimal.tsx)
- The HeroSectionContract Zod schema
- The complete semantic token allowlist (~50-80 classes)
- No line numbers, no code snippets — only complete file contents

### Edge Cases

**Given** the context is used for a block with only 2 existing variants
**When** `gatherComponentContext()` is called
**Then** it returns both available variants (does not require 3)

## Technical Requirements

### New File: `web-app/lib/few-shot-context.ts`

Create a new file with the following functions:

```typescript
/**
 * Gather existing sibling component files as few-shot examples.
 * @param blockDir - Directory path to the block section
 * @returns Formatted string with sibling variant files
 */
export async function gatherComponentContext(blockDir: string): Promise<string>

/**
 * Gather the Zod contract as explicit prompt instructions.
 * @param contractPath - Path to the Zod contract file
 * @returns Formatted contract content
 */
export async function gatherContractContext(contractPath: string): Promise<string>

/**
 * Gather the semantic token allowlist for prompt constraints.
 * @returns Formatted allowlist content
 */
export async function gatherAllowlistContext(): Promise<string>
```

### Implementation Notes

- The context assembler uses pure function logic with no side effects
- File reading uses standard Node.js `fs.promises.readFile`
- Error handling: if a file doesn't exist, throw a clear error indicating which context is missing
- The output format (delimiter-wrapped sections) is designed for LLM prompt clarity
- No LLM calls in this story — only context preparation

## Codebase References

| Type | File | Reference | Notes |
|------|------|-----------|-------|
| **New File** | `web-app/lib/few-shot-context.ts` | `gatherComponentContext()`, `gatherContractContext()`, `gatherAllowlistContext()` | Create new file with context assembly functions |
| Use | `web-app/components/sections/HeroSection/HeroCentered.tsx` | Sibling variant | Example few-shot input |
| Use | `web-app/components/sections/HeroSection/HeroSplit.tsx` | Sibling variant | Example few-shot input |
| Use | `web-app/components/sections/HeroSection/HeroMinimal.tsx` | Sibling variant | Example few-shot input |
| Use | `web-app/lib/contracts/hero.contract.ts` | `HeroSectionContract` | Contract context input |
| Use | `web-app/lib/cva-variants.ts` | `heroVariants` | CVA definitions context input |
| Use | `web-app/lib/style-generation/tailwind-allowlist.ts` | `SEMANTIC_TOKEN_ALLOWLIST` | Allowlist context input (Epic 20 Story 20.7) |

## Dependencies

### Prerequisites

- **Epic 20 Story 20.7** must be complete (Semantic Token Allowlist created)
- **HeroSection** must have at least 2 structural variants (Epic 17 — complete)

### Blocks

- Blocked by: Epic 20 Story 20.7

## Testing Requirements

- Unit tests for each gather function
- Test with HeroSection (has 3 variants)
- Test with a block that has only 2 variants (edge case)
- Test file not found error handling
- Test delimiter formatting

## Definition of Done

- [ ] `web-app/lib/few-shot-context.ts` file created with all three functions
- [ ] All three gather functions return properly delimited content
- [ ] Sibling variant filtering excludes `index.tsx` and `.client.tsx` files
- [ ] Contract content is wrapped with ZOD CONTRACT delimiters
- [ ] Allowlist content is wrapped with ALLOWED TAILWIND CLASSES delimiters
- [ ] Error handling throws clear messages for missing files
- [ ] Unit tests pass for all functions
- [ ] Tested against HeroSection with 3 variants
- [ ] Tested against block with 2 variants (edge case)

## Relevant NFRs

- **NFR14:** Component Reusability — context assembler works for any block type with variants

---

**Story Points:** 5
**Estimated Duration:** 1-2 sessions
**Risk Level:** Low (pure function logic, no LLM integration)
