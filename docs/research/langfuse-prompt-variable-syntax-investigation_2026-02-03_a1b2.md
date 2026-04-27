# Langfuse Prompt Variable Syntax Investigation

**Date:** 2026-02-03
**Analyzed By:** architect-research
**Confidence:** 95%

---

## Executive Summary

Investigation into Langfuse prompt variable syntax revealed a critical mismatch between local prompt files and the Langfuse SDK implementation. The prompt files use single brace syntax `{variable}` while Langfuse's `.compile()` method and the local fallback implementation expect double brace syntax `{{variable}}`. This mismatch causes variable substitution to fail, resulting in prompts being sent to LLMs with unreplaced placeholder variables.

**Recommendation:** Update all prompt files in `docs/prompts/` to use double brace syntax `{{variable}}` to match Langfuse's Handlebars-style template system.

---

## Analysis

### Context

The LangGraph workflow uses Langfuse for prompt management with local file fallback. The system is designed to:
1. First attempt to fetch prompts from Langfuse API
2. Fall back to local Markdown files if Langfuse is unavailable
3. Use variable substitution to customize prompts with hotel parameters

### Current Implementation

**Langfuse SDK Call** (`LangFuseService.ts` lines 176-184):
```typescript
const prompt = await this.langfuse.getPrompt(name, undefined, { label });
const stringifiedVariables = Object.entries(variables).reduce((acc, [key, value]) => {
  acc[key] = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
  return acc;
}, {} as Record<string, string>);
return prompt.compile(stringifiedVariables);
```

**Local Fallback** (`LangFuseService.ts` lines 218-223):
```typescript
for (const [key, value] of Object.entries(variables)) {
  const valStr = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
  content = content.replace(new RegExp(`{{${key}}}`, 'g'), () => valStr);
}
```

### Options Considered

| Option | Syntax | Langfuse Compatible | Fallback Works | Pros | Cons |
|--------|--------|-------------------|----------------|-------|-------|
| **Double Braces** | `{{variable}}` | ✅ Yes | ✅ Yes | Standard Handlebars, Langfuse native, consistent | Requires file updates |
| **Single Braces** | `{variable}` | ❌ No | ❌ No | No file changes needed | Not compatible with Langfuse |

### Evaluation Criteria

| Criteria | Double Braces `{{}}` | Single Braces `{}` |
|----------|---------------------|-------------------|
| **Langfuse Compatibility** | ✅ Native Handlebars support | ❌ Requires custom implementation |
| **Fallback Functionality** | ✅ Works as-is | ❌ Regex won't match |
| **Industry Standard** | ✅ Handlebars standard | ❌ Non-standard |
| **Implementation Effort** | ⚠️ Requires file updates | ✅ No changes needed |
| **Future Maintainability** | ✅ Well-documented pattern | ❌ Custom, non-standard |

### Codebase Analysis

**Prompt Files Using Single Braces** (INCORRECT):
- `/home/ric/et-llm-websites/docs/prompts/01-component-selector.md`
  - Lines 47-51: `"hotelType": "{hotelType}"`
  - Lines 48-51: Multiple `{variable}` occurrences

- `/home/ric/et-llm-websites/docs/prompts/02-styling-agent.md`
  - Lines 90-98: Multiple `{variable}` occurrences

- `/home/ric/et-llm-websites/docs/prompts/03-content-generator.md`
  - Lines 115-119: Multiple `{variable}` occurrences

- `/home/ric/et-llm-websites/docs/prompts/04-assembly-agent.md`
  - Lines 73-77: Multiple `{variable}` occurrences

**Langfuse SDK Version:**
```json
"langfuse": "^3.38.6"
```

**Expected Variable Substitution Example:**

Input to `getPrompt()`:
```typescript
{
  hotelType: "luxury",
  targetAudience: "business",
  brandPersonality: "professional",
  hotelName: "The Sterling Executive",
  location: "Downtown Financial District"
}
```

**Current Behavior (BROKEN):**
Prompt template with `{hotelType}` → Regex looks for `{{hotelType}}` → No match → Variable NOT replaced

**Expected Behavior (FIXED):**
Prompt template with `{{hotelType}}` → Regex matches `{{hotelType}}` → Variable replaced with `"luxury"`

### Risks

**Current State Risks:**
1. **Broken Variable Substitution:** All prompt variables remain as literal strings like `{hotelType}`
2. **LLM Confusion:** LLMs receive prompts with undefined placeholder variables
3. **Poor Quality Output:** LLMs cannot customize responses based on hotel parameters
4. **Silent Failure:** System may not detect that variables weren't replaced

**Migration Risks:**
1. **File Update Required:** Must update 4+ prompt files
2. **Testing Required:** Must verify variable substitution works after update
3. **Potential Langfuse Prompts:** If prompts exist in Langfuse dashboard, they may need updating too

---

## Recommendation

**Chosen Option:** Update all prompt files to use double brace syntax `{{variable}}`

**Rationale:**
1. **Langfuse Compatibility:** The `.compile()` method natively supports Handlebars `{{variable}}` syntax
2. **Fallback Consistency:** The fallback function already uses `{{${key}}}` regex pattern
3. **Industry Standard:** Handlebars is the de facto standard for template variable substitution
4. **Future Maintainability:** Using standard patterns reduces technical debt

**Migration Path:**

### Step 1: Update Prompt Files

For each variable in prompt files, change:
- `{hotelType}` → `{{hotelType}}`
- `{targetAudience}` → `{{targetAudience}}`
- `{brandPersonality}` → `{{brandPersonality}}`
- `{hotelName}` → `{{hotelName}}`
- `{location}` → `{{location}}`
- `{selectedComponents}` → `{{selectedComponents}}`
- `{layoutStructure}` → `{{layoutStructure}}`
- `{emphasisComponents}` → `{{emphasisComponents}}`
- `{componentVariants}` → `{{componentVariants}}`
- `{componentContent}` → `{{componentContent}}`
- `{agent1Output}` → `{{agent1Output}}`
- `{agent2Output}` → `{{agent2Output}}`
- `{componentSelection}` → `{{componentSelection}}`

Files to update:
1. `/home/ric/et-llm-websites/docs/prompts/01-component-selector.md`
2. `/home/ric/et-llm-websites/docs/prompts/02-styling-agent.md`
3. `/home/ric/et-llm-websites/docs/prompts/03-content-generator.md`
4. `/home/ric/et-llm-websites/docs/prompts/04-assembly-agent.md`
5. Any other prompt files in `docs/prompts/` with variables

### Step 2: Verify Langfuse Prompts (if they exist)

If prompts are defined in the Langfuse dashboard:
1. Check variable syntax in Langfuse UI
2. Update to use `{{variable}}` syntax if needed
3. Test with both Langfuse and local fallback

### Step 3: Test Variable Substitution

Run tests to verify variables are properly replaced:
```bash
npm test -- --config jest.config.workflow.js
```

Verify in logs that prompts contain actual values, not `{variable}` placeholders.

### Step 4: Monitor Langfuse Traces

After deployment, check Langfuse traces to confirm:
1. Prompts are fetched correctly
2. Variables are substituted
3. LLMs receive properly formatted prompts

---

## Technical Details

### Langfuse SDK `.compile()` Method

Langfuse v3.x uses Handlebars-style template syntax:

```typescript
const prompt = await langfuse.getPrompt('component-selector');
const compiled = prompt.compile({
  hotelType: 'luxury',
  targetAudience: 'business'
});
// Result: All {{hotelType}} and {{targetAudience}} replaced
```

### Fallback Implementation

The fallback correctly implements Handlebars-style matching:

```typescript
content.replace(new RegExp(`{{${key}}}`, 'g'), () => valStr);
```

This regex matches:
- `{{hotelType}}` ✅
- `{hotelType}` ❌ (single brace - won't match)

### Variable Stringification

The implementation correctly handles complex variables:

```typescript
const stringifiedVariables = Object.entries(variables).reduce((acc, [key, value]) => {
  acc[key] = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
  return acc;
}, {} as Record<string, string>);
```

This ensures objects like `selectedComponents` are properly JSON-serialized before substitution.

---

## Example Before/After

### Before (Current - BROKEN)

**Prompt file:**
```markdown
"hotelType": "{hotelType}",
"targetAudience": "{targetAudience}"
```

**After substitution:**
```markdown
"hotelType": "{hotelType}",  // NOT REPLACED!
"targetAudience": "{targetAudience}"  // NOT REPLACED!
```

**LLM receives:**
```json
{
  "hotelType": "{hotelType}",  // LLM confused - what is {hotelType}?
  "targetAudience": "{targetAudience}"
}
```

### After (FIXED)

**Prompt file:**
```markdown
"hotelType": "{{hotelType}}",
"targetAudience": "{{targetAudience}}"
```

**After substitution:**
```markdown
"hotelType": "luxury",
"targetAudience": "business"
```

**LLM receives:**
```json
{
  "hotelType": "luxury",
  "targetAudience": "business"
}
```

---

## References

- **LangfuseService implementation:** `/home/ric/et-llm-websites/web-app/app/langgraph/services/LangFuseService.ts`
- **Prompt files:** `/home/ric/et-llm-websites/docs/prompts/`
- **Agent implementation:** `/home/ric/et-llm-websites/web-app/app/langgraph/agents/`
- **Langfuse SDK:** `langfuse: ^3.38.6` (Handlebars template syntax)
- **Langfuse integration docs:** `/home/ric/et-llm-websites/docs/02-architecture/langfuse-langgraph-integration.md`

---

## Validation Checklist

After implementing the fix, verify:

- [ ] All prompt files use `{{variable}}` syntax
- [ ] Fallback function tests pass with double braces
- [ ] Langfuse API calls work (if prompts exist)
- [ ] LLM prompts in traces show substituted values
- [ ] No `{variable}` placeholders in actual LLM calls
- [ ] Workflow tests pass end-to-end
- [ ] Variable substitution works for complex objects (JSON stringified)

---

**Status:** ✅ COMPLETE - Ready for implementation
**Confidence:** 95%
**File:** `docs/research/langfuse-prompt-variable-syntax-investigation_2026-02-03_a1b2.md`
