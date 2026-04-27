# SGR Implementation - Comprehensive Execution Prompt

**Copy and paste this entire prompt into Claude Code to begin parallel implementation of all SGR improvements.**

---

## CLAUDE CODE - EXECUTE THE FOLLOWING

You are implementing Schema-Guided Reasoning (SGR) improvements for the hotel website generator. Your goal is to achieve 95-100% JSON validation success rate (from ~80%).

### Implementation Documents Reference

All implementation details are in:
- `docs/plans/sgr-implementation-plan.md` - Overall strategy
- `docs/plans/sgr-validation-retry-spec.md` - Phase 1: Validation retry
- `docs/plans/sgr-prompt-enhancement-guide.md` - Phase 2: Prompt enhancement
- `docs/plans/sgr-quick-reference.md` - Quick reference

### Read All Planning Documents First

**CRITICAL: Before starting implementation, read ALL planning documents:**
1. Read `docs/plans/sgr-implementation-plan.md`
2. Read `docs/plans/sgr-validation-retry-spec.md`
3. Read `docs/plans/sgr-prompt-enhancement-guide.md`
4. Read `docs/research/schema-guided-reasoning-sgr_2026-02-03_a1b2.md`

### Implementation Strategy

You will implement **Phase 1 (Validation Retry) and Phase 2 (Prompt Enhancement)** in parallel using sub-agents:

```
PHASE 1: Validation Retry Wrapper (Highest Impact)
├── Sub-agent 1A: AnthropicClient implementation
├── Sub-agent 1B: BaseAgent implementation
└── Sub-agent 1C: Unit tests for retry logic

PHASE 2: Prompt Enhancement (Medium Impact)
├── Sub-agent 2A: ComponentSelector prompt
├── Sub-agent 2B: StylingAgent prompt
├── Sub-agent 2C: ContentGenerator prompt
└── Sub-agent 2D: AssemblyAgent prompt

VERIFICATION
├── Sub-agent 3A: Integration tests
└── Sub-agent 3B: End-to-end verification
```

---

## START PARALLEL IMPLEMENTATION

Invoke the following sub-agents **in parallel** using the Task tool:

### PARALLEL TASK GROUP 1: Phase 1 - Validation Retry Implementation

**Task 1A:** Implement `generateWithRetry()` in AnthropicClient
```
Invoke "dev-python" agent with:

File: web-app/app/langgraph/services/AnthropicClient.ts

Implement the generateWithRetry() method according to the specification in:
docs/plans/sgr-validation-retry-spec.md

Requirements:
1. Add generateWithRetry() public method
2. Add formatZodError() private method
3. Add buildRetryPrompt() private method
4. Implement retry loop with exponential backoff
5. Add LangFuse event logging for retries
6. Return validated parsed response

Do NOT modify existing sendCompletion() method.
Add new methods ONLY.

After implementation, run: npm test -- --testPathPattern=AnthropicClient
```

**Task 1B:** Add convenience method to BaseAgent
```
Invoke "dev-python" agent with:

File: web-app/app/langgraph/agents/BaseAgent.ts

Add a protected generateWithRetry() convenience method that wraps
the AnthropicClient.generateWithRetry() for easy use by agents.

Requirements:
1. Add protected generateWithRetry<T>() method
2. Accept prompt, schema, and options
3. Delegate to llmProvider.generateWithRetry()
4. Return validated result

Reference: docs/plans/sgr-validation-retry-spec.md section "BaseAgent Changes"

After implementation, verify file compiles: npx tsc --noEmit
```

**Task 1C:** Create unit tests for validation retry
```
Invoke "test-python" agent with:

Create: web-app/app/langgraph/services/__tests__/AnthropicClient.sgr.test.ts

Write comprehensive unit tests for generateWithRetry():

Test Cases:
1. Success on first attempt with valid response
2. Retry with ZOD error feedback on validation failure
3. Retry with JSON parse error feedback
4. Throw after max retries exhausted
5. Exponential backoff between retries
6. LangFuse events are logged correctly
7. formatZodError() formats various error types
8. buildRetryPrompt() includes error context

Use jest.mock() for AnthropicClient mocking.
Use ComponentSelectorOutputSchema as test schema.

After creating tests, run: npm test -- AnthropicClient.sgr
Ensure all tests pass.
```

### PARALLEL TASK GROUP 2: Phase 2 - Prompt Enhancement

**Task 2A:** Enhance ComponentSelector prompt with SGR Cascade pattern
```
Invoke "dev-python" agent with:

File: docs/prompts/01-component-selector.md

Apply SGR Cascade pattern according to:
docs/plans/sgr-prompt-enhancement-guide.md section "1. ComponentSelector"

Changes:
1. Replace "ANALYSIS INSTRUCTIONS" with Cascade pattern:
   - FIRST: Analyze the Hotel Profile
   - THEN: Select Components
   - THEN: Choose Layout Structure
   - THEN: Identify Emphasis Components
   - FINALLY: Justify Your Decisions

2. Update EXPECTED JSON OUTPUT FORMAT to include reasoning steps

3. Keep all existing examples, decision guidelines, constraints

4. Maintain backward compatibility with existing schema

After changes, verify prompt is valid markdown.
```

**Task 2B:** Enhance StylingAgent prompt with SGR Cascade pattern
```
Invoke "dev-python" agent with:

File: docs/prompts/02-styling-agent.md

Apply SGR Cascade pattern according to:
docs/plans/sgr-prompt-enhancement-guide.md section "2. StylingAgent"

Changes:
1. Replace "ANALYSIS INSTRUCTIONS" with Cascade pattern:
   - FIRST: Analyze Styling Requirements
   - THEN: Select Hero Variants
   - THEN: Select Navigation Variants
   - THEN: Select Content Component Variants
   - THEN: Select Action Component Variants
   - FINALLY: Verify Consistency

2. Update EXPECTED JSON OUTPUT FORMAT

3. Organize variant selection by component type

4. Add consistency verification step

After changes, verify prompt is valid markdown.
```

**Task 2C:** Enhance ContentGenerator prompt with SGR Cascade pattern
```
Invoke "dev-python" agent with:

File: docs/prompts/03-content-generator.md

Apply SGR Cascade pattern according to:
docs/plans/sgr-prompt-enhancement-guide.md section "3. ContentGenerator"

Changes:
1. Replace "ANALYSIS INSTRUCTIONS" with Cascade pattern:
   - FIRST: Establish Content Strategy
   - THEN: Generate Hero Content
   - THEN: Generate Room Content
   - THEN: Generate Testimonials
   - THEN: Generate Amenities
   - THEN: Generate Gallery Content
   - THEN: Generate Contact Form Content
   - FINALLY: Review and Refine

2. Update EXPECTED JSON OUTPUT FORMAT with contentStrategy

3. Add character limits for each content type

4. Maintain brand tone guidance

After changes, verify prompt is valid markdown.
```

**Task 2D:** Enhance AssemblyAgent prompt with SGR Routing + Cycle patterns
```
Invoke "dev-python" agent with:

File: docs/prompts/04-assembly-agent.md

Apply SGR Routing + Cycle patterns according to:
docs/plans/sgr-prompt-enhancement-guide.md section "4. AssemblyAgent"

Changes:
1. Replace "ANALYSIS INSTRUCTIONS" with structured sequence:
   - FIRST: Review All Inputs
   - THEN: Determine Component Order (Routing pattern)
   - THEN: Assemble Each Component (Cycle pattern)
   - THEN: Validate Completeness
   - FINALLY: Determine Validation Status

2. Update EXPECTED JSON OUTPUT FORMAT with assemblyReview

3. Add explicit "Repeat for ALL components" instruction

4. Add validation status determination logic

After changes, verify prompt is valid markdown.
```

### PARALLEL TASK GROUP 3: Verification & Testing

**Task 3A:** Create integration tests for SGR implementation
```
Invoke "test-python" agent with:

Create: web-app/app/langgraph/__tests__/sgr-integration.test.ts

Write integration tests for SGR implementation:

Test Cases:
1. ComponentSelector with retry achieves 95%+ success rate (50 runs)
2. StylingAgent with retry achieves 95%+ success rate (50 runs)
3. ContentGenerator with retry achieves 95%+ success rate (50 runs)
4. AssemblyAgent with retry achieves 95%+ success rate (50 runs)
5. Full workflow with SGR completes successfully (10 runs)

Use mock LLM responses to simulate various failure scenarios.
Measure and log validation success rates.

After creating tests, run: npm test -- sgr-integration
Ensure all tests pass.
```

**Task 3B:** End-to-end verification
```
Invoke "test-python" agent with:

Run comprehensive verification:

1. Check TypeScript compilation:
   npx tsc --noEmit

2. Run all AnthropicClient tests:
   npm test -- AnthropicClient

3. Run all SGR integration tests:
   npm test -- sgr

4. Verify no existing tests are broken:
   npm test -- --testPathPattern=langgraph

5. Check prompt files are valid:
   - Verify all 4 prompt files are readable
   - Verify markdown syntax is valid

Report:
- Pass/fail status for each verification step
- Any breaking changes to existing functionality
- Recommendations for fixes if needed
```

---

## EXECUTION SEQUENCE

### Step 1: Read Planning Documents (YOU MUST DO THIS FIRST)

```bash
# Read these files in order before starting implementation
Read docs/plans/sgr-implementation-plan.md
Read docs/plans/sgr-validation-retry-spec.md
Read docs/plans/sgr-prompt-enhancement-guide.md
Read docs/research/schema-guided-reasoning-sgr_2026-02-03_a1b2.md
```

### Step 2: Invoke Parallel Tasks (Phase 1 - Core Implementation)

Invoke these **6 tasks in parallel** using Task tool:

```
PARALLEL TASK INVOCATION:

Task("Implement AnthropicClient retry", "Task 1A prompt above", "dev-python")
Task("Add BaseAgent retry method", "Task 1B prompt above", "dev-python")
Task("Create AnthropicClient unit tests", "Task 1C prompt above", "test-python")
Task("Enhance ComponentSelector prompt", "Task 2A prompt above", "dev-python")
Task("Enhance StylingAgent prompt", "Task 2B prompt above", "dev-python")
Task("Enhance ContentGenerator prompt", "Task 2C prompt above", "dev-python")
```

### Step 3: Invoke Parallel Tasks (Phase 2 - Completion & Verification)

Wait for Step 2 to complete, then invoke these **4 tasks in parallel**:

```
PARALLEL TASK INVOCATION:

Task("Enhance AssemblyAgent prompt", "Task 2D prompt above", "dev-python")
Task("Create integration tests", "Task 3A prompt above", "test-python")
Task("Run end-to-end verification", "Task 3B prompt above", "test-python")
```

### Step 4: Final Verification

After all tasks complete, run final verification:

```bash
# 1. Full test suite
npm test

# 2. TypeScript compilation check
npx tsc --noEmit

# 3. Build verification
npm run build

# 4. Run workflow smoke test
npm test -- --testPathPattern=HomepageGenerationWorkflow
```

---

## SUCCESS CRITERIA

Implementation is complete when:

✅ Phase 1: Validation Retry
- [x] AnthropicClient.generateWithRetry() implemented
- [x] BaseAgent has convenience method
- [x] Unit tests pass (AnthropicClient.sgr.test.ts)
- [x] Error feedback formatting works
- [x] Exponential backoff implemented
- [x] LangFuse events logged

✅ Phase 2: Prompt Enhancement
- [x] ComponentSelector prompt uses Cascade pattern
- [x] StylingAgent prompt uses Cascade pattern
- [x] ContentGenerator prompt uses Cascade pattern
- [x] AssemblyAgent prompt uses Routing + Cycle patterns
- [x] All prompts are valid markdown

✅ Verification
- [x] TypeScript compilation passes
- [x] All unit tests pass
- [x] Integration tests pass
- [x] No existing tests broken
- [x] End-to-end workflow works

---

## OUTPUT FORMAT

After completing all tasks, provide a summary report:

```markdown
# SGR Implementation Summary

## Phase 1: Validation Retry Implementation
- AnthropicClient.generateWithRetry(): ✅/❌
- BaseAgent convenience method: ✅/❌
- Unit tests created: ✅/❌
- Tests passing: ✅/❌

## Phase 2: Prompt Enhancement
- ComponentSelector prompt: ✅/❌
- StylingAgent prompt: ✅/❌
- ContentGenerator prompt: ✅/❌
- AssemblyAgent prompt: ✅/❌

## Verification Results
- TypeScript compilation: ✅/❌
- Unit tests: ✅/❌ (X/Y passing)
- Integration tests: ✅/❌ (X/Y passing)
- Existing tests: ✅/❌ (no regressions)

## Files Modified
- web-app/app/langgraph/services/AnthropicClient.ts
- web-app/app/langgraph/agents/BaseAgent.ts
- docs/prompts/01-component-selector.md
- docs/prompts/02-styling-agent.md
- docs/prompts/03-content-generator.md
- docs/prompts/04-assembly-agent.md

## Files Created
- web-app/app/langgraph/services/__tests__/AnthropicClient.sgr.test.ts
- web-app/app/langgraph/__tests__/sgr-integration.test.ts

## Issues Found
[List any issues or recommendations]

## Next Steps
[Recommendations for testing, deployment, etc.]
```

---

## IMPORTANT NOTES

1. **Do NOT skip reading the planning documents first** - they contain critical context
2. **Run tasks in parallel where indicated** - this is faster and ensures independence
3. **Each task should be idempotent** - can be safely re-run if needed
4. **Tests must pass before considering implementation complete**
5. **No breaking changes to existing functionality** - verify this
6. **All code must follow existing project patterns** - check similar files

---

## ROLLBACK INSTRUCTIONS

If something goes wrong, rollback is simple:

```bash
# Reset modified files
git checkout web-app/app/langgraph/services/AnthropicClient.ts
git checkout web-app/app/langgraph/agents/BaseAgent.ts
git checkout docs/prompts/01-component-selector.md
git checkout docs/prompts/02-styling-agent.md
git checkout docs/prompts/03-content-generator.md
git checkout docs/prompts/04-assembly-agent.md

# Remove new test files
rm web-app/app/langgraph/services/__tests__/AnthropicClient.sgr.test.ts
rm web-app/app/langgraph/__tests__/sgr-integration.test.ts

# Verify rollback
npm test
```

---

**BEGIN IMPLEMENTATION NOW**

Start by reading all planning documents, then invoke parallel tasks as specified above.
