# Epic 19.5 Pipeline Analysis: Beyond Langfuse Prompts

**Date:** 2026-03-03
**Purpose:** Identify all code changes needed beyond Langfuse prompt updates

---

## Executive Summary

After thoroughly scanning Epic 7, all Story files, and the full implementation code, **3 critical code updates are still needed** beyond the Langfuse prompt updates you've completed.

**Status:**
- ✅ **Langfuse Prompts:** All 4 agents updated (component-selector, styling-agent, content-generator, assembly-agent)
- ✅ **Zod Schemas:** Already updated in Tasks 1-3 (schemas.ts)
- ✅ **ComponentRenderer:** Already updated in Task 1 (includes all 4 new blocks)
- ✅ **CVA Validator:** Already includes all 4 new blocks with variant options
- ✅ **AssemblyAgent Field Mappings:** Already updated in Task 4
- ✅ **AssemblyAgent Component Ordering:** Already updated in Task 8
- ✅ **QualityValidator Tests:** Already updated in Task 7
- ⚠️ **propsTransformation.ts:** **MISSING** - Needs update for 4 new blocks
- ⚠️ **QualityValidator Component Count:** **NEEDS UPDATE** - 5-8 → 5-12
- ⚠️ **Fixture Configs:** **PENDING** - Tasks 9 (update fixtures with new blocks)

---

## Detailed Analysis

### 1. ✅ What's Already Been Updated

| Component | File | Status | Details |
|-----------|------|--------|---------|
| **Schemas** | `web-app/app/langgraph/agents/schemas.ts` | ✅ Done | ComponentSelectorOutput, StylingAgentOutput, ContentGeneratorOutput, HomepageConfigSchema all include 4 new blocks |
| **ComponentRenderer** | `web-app/components/renderers/ComponentRenderer/index.tsx` | ✅ Done | COMPONENT_MAP includes all 4 new blocks |
| **CVAValidator** | `web-app/app/langgraph/utils/cva-validator.ts` | ✅ Done | VALID_VARIANTS and FIELD_MAPPINGS include all 4 new blocks |
| **AssemblyAgent** | `web-app/app/langgraph/agents/AssemblyAgent.ts` | ✅ Done | variantFieldMapping() includes all 4 new blocks; orderComponents() updated with new blocks |
| **QualityValidator Tests** | `web-app/tests/langgraph/agents/QualityValidator.test.ts` | ✅ Done | Test suite includes "Story 19.5: New Block Validation" |
| **Langfuse Prompts** | Langfuse Cloud | ✅ Done | All 4 agents updated |

---

### 2. ⚠️ What Still Needs Updating

## **CRITICAL: #1 - propsTransformation.ts**

**File:** `web-app/lib/propsTransformation.ts`

**Problem:** The `ALLOWED_PROP_KEYS` whitelist does NOT include the 4 new blocks. This means:
- When ComponentRenderer tries to render footer/about/faq/features, **all props will be filtered out**
- The components will receive **empty props objects**
- The website will **NOT render correctly** (or at all)

**What's Missing:**
```typescript
// These blocks are MISSING from ALLOWED_PROP_KEYS:
footer: new Set([...]),  // NOT PRESENT
about: new Set([...]),  // NOT PRESENT
faq: new Set([...]),    // NOT PRESENT
features: new Set([...]) // NOT PRESENT
```

**What Needs to Be Added:**

```typescript
// Add to ALLOWED_PROP_KEYS (around line 141):

footer: new Set([
  'hotelName',
  'address',
  'phone',
  'email',
  'socialLinks',
  'navigationLinks',
  'copyright',
  'className',
  'variant',
]),
about: new Set([
  'heading',
  'content',
  'image',
  'highlights',
  'className',
  'variant',
]),
faq: new Set([
  'heading',
  'questions',
  'className',
  'variant',
]),
features: new Set([
  'heading',
  'features',
  'className',
  'variant',
]),
```

**Transform Functions:** May need specific transform functions for:
- `transformFooterProps()` - minimal transformation needed
- `transformAboutProps()` - map `aboutHeading` → `heading`, `aboutContent` → `content`, etc.
- `transformFaqProps()` - map `faqHeading` → `heading`, `faqQuestions` → `questions`
- `transformFeaturesProps()` - map `featuresHeading` → `heading`

**Impact:** **CRITICAL** - Without this, the 4 new blocks cannot render properly

---

## **IMPORTANT: #2 - QualityValidator Component Count Check**

**File:** `web-app/app/langgraph/agents/QualityValidator.ts`

**Problem:** Line 66-67 checks for 5-8 components, but Epic 19.5 increased this to 5-12

**Current Code:**
```typescript
// Line 66-67
const componentCount = assembledConfig.components.length;
scores.componentCoverage = (componentCount >= 5 && componentCount <= 8) ? 100 : Math.min(100, (componentCount / 5) * 100);
```

**Needed Change:**
```typescript
// Update to 5-12 for Epic 19.5
const componentCount = assembledConfig.components.length;
scores.componentCoverage = (componentCount >= 5 && componentCount <= 12) ? 100 : Math.min(100, (componentCount / 5) * 100);
```

**Impact:** **HIGH** - Valid configs with 9-12 components (now possible with 4 new blocks) would be marked as low quality

---

## **PENDING: #3 - Fixture Config Updates**

**Location:** `web-app/fixtures/configs/*.json`

**Status:** Task 9 from Story 19.5

**What's Needed:**
Update the 3 fixture configs to include at least 1 new block type each:
- `luxury-boutique.json` - Add About + Footer
- `budget-hostel.json` - Add FAQ + Features
- `business-hotel.json` - Add About + FAQ

**Impact:** **MEDIUM** - Fixtures used for preview route testing; not blocking for pipeline execution

---

## 3. Epic 7 Pipeline Architecture Summary

### How the Pipeline Works:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      LANGRAPH WORKFLOW (Epic 7)                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  1. ComponentSelector (Story 7.3)                                    │
│     ↓ Selects 5-12 components (was 5-8)                              │
│                                                                       │
│  2. StylingAgent (Story 7.4)                                         │
│     ↓ Assigns CVA variants to each component                         │
│                                                                       │
│  3. ContentGenerator (Story 7.5)                                     │
│     ↓ Generates text content for each component                      │
│                                                                       │
│  4. AssemblyAgent (Story 7.6)                                        │
│     ↓ Assembles HomepageConfig JSON with ordering & mapping          │
│                                                                       │
│  5. QualityValidator (Story 7.7)                                     │
│     ↓ Validates config, scores quality, passes/fails                 │
│                                                                       │
│  Output: HomepageConfig JSON                                          │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    STORY 7.11: RENDER BRIDGE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  HomepageConfig JSON → ComponentRenderer → React Components          │
│                                                                       │
│  • Validates config with HomepageConfigSchema                         │
│  • Sorts components by 'order' field                                  │
│  • Maps component type → React component via COMPONENT_MAP            │
│  • Applies transformProps() and filterSafeVariant()                 │
│  • Renders final React tree                                           │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
                       Visual Website
                 (/preview?config={name})
```

---

## 4. Epic 19 New Blocks in Pipeline

### How Each Block Flows Through:

| Block | Story | Variants | Pipeline Status |
|-------|-------|----------|-----------------|
| **Footer** | 19.1 | classic, minimal, stacked | ✅ Complete in schema, CVA, AssemblyAgent |
| **About** | 19.2 | side-by-side, timeline, full-width | ✅ Complete in schema, CVA, AssemblyAgent |
| **FAQ** | 19.3 | accordion, grid | ✅ Complete in schema, CVA, AssemblyAgent |
| **Features** | 19.4 | icon-grid, cards | ✅ Complete in schema, CVA, AssemblyAgent |

---

## 5. Code-Level Trace: From Prompt to Rendering

### What Happens When LangGraph Runs:

1. **ComponentSelector** reads `component-selector` prompt from Langfuse
   - Returns: `selectedComponents: ['hero', 'navigation', 'about', 'footer', ...]`
   - ✅ Now includes 4 new blocks (prompt updated)

2. **StylingAgent** reads `styling-agent` prompt from Langfuse
   - Returns: `{ footer: { footerLayout: 'classic' }, about: { aboutLayout: 'side-by-side', ... } }`
   - ✅ Now includes 4 new blocks (prompt updated)

3. **ContentGenerator** reads `content-generator` prompt from Langfuse
   - Returns: `{ footer: { footerHotelName: '...', ... }, about: { aboutHeading: '...', ... } }`
   - ✅ Now includes 4 new blocks (prompt updated)

4. **AssemblyAgent** reads `assembly-agent` prompt from Langfuse
   - Assembles final HomepageConfig with:
     - `components[].type` - includes 'footer', 'about', 'faq', 'features'
     - `components[].variant` - mapped via `variantFieldMapping()` ✅ Already updated
     - `components[].order` - ordered via `orderComponents()` ✅ Already updated
   - ✅ Now includes 4 new blocks (prompt updated)

5. **QualityValidator** validates HomepageConfig
   - Zod validation ✅ Schemas already updated
   - CVA validation ✅ CVAValidator already includes new blocks
   - Component count check ⚠️ **NEEDS UPDATE** (5-8 → 5-12)

6. **ComponentRenderer** renders the config
   - Maps type → component via COMPONENT_MAP ✅ Already updated
   - Calls `filterSafeProps()` to sanitize props ⚠️ **MISSING** new blocks!
   - Calls `transformProps()` to map field names ⚠️ **MISSING** new blocks!
   - Renders React components

---

## 6. Action Items: What Still Needs Doing

### **Must Do (Blocking):**

1. **Update `propsTransformation.ts`:**
   - Add `footer`, `about`, `faq`, `features` to `ALLOWED_PROP_KEYS`
   - Add transform functions for new blocks
   - Add field name mappings (aboutHeading → heading, etc.)

2. **Update `QualityValidator.ts`:**
   - Change component count check from `<= 8` to `<= 12`

### **Should Do (Recommended):**

3. **Update Fixture Configs:**
   - Add new blocks to `luxury-boutique.json`
   - Add new blocks to `budget-hostel.json`
   - Add new blocks to `business-hotel.json`

4. **Run End-to-End Tests:**
   - Test pipeline with new blocks
   - Verify preview route renders new blocks correctly

---

## 7. Files to Modify Summary

| Priority | File | Changes | Lines |
|----------|------|---------|-------|
| **CRITICAL** | `web-app/lib/propsTransformation.ts` | Add 4 blocks to ALLOWED_PROP_KEYS + transform functions | ~50 |
| **HIGH** | `web-app/app/langgraph/agents/QualityValidator.ts` | Update component count 8→12 | 1 line |
| **MEDIUM** | `web-app/fixtures/configs/luxury-boutique.json` | Add About + Footer blocks | ~20 |
| **MEDIUM** | `web-app/fixtures/configs/budget-hostel.json` | Add FAQ + Features blocks | ~20 |
| **MEDIUM** | `web-app/fixtures/configs/business-hotel.json` | Add About + FAQ blocks | ~20 |

---

## 8. Test Plan After Updates

```bash
# 1. Run QualityValidator tests (should pass with new component count)
npm test -- --testPathPattern='QualityValidator'

# 2. Run component tests for new blocks (should pass)
npm test -- --testPathPattern='Footer|About|FAQ|Features'

# 3. Test preview route with new blocks
# Visit: http://localhost:3000/preview?config=luxury-boutique

# 4. Run full LangGraph pipeline test (Task 10)
npm test -- --testPathPattern='HomepageGeneration.e2e'
```

---

**Sources Referenced:**
- Epic 7 Documentation
- Stories 7.1-7.11
- Implementation files: schemas.ts, AssemblyAgent.ts, QualityValidator.ts, propsTransformation.ts, ComponentRenderer, cva-validator.ts
