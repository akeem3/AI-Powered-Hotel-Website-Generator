# Cycle 3 Decision & Execution Plan

**Epic 22 Story 22.4 - LangGraph Agent Prompt Tuning**
**Date:** March 15, 2026

---

## Decision: PROCEED TO CYCLE 3

**Status:** ✅ **APPROVED**

### Rationale

| Factor | Assessment | Weight |
|--------|------------|--------|
| Cycle 2 completely failed targets (0/4 dimensions) | Critical | High |
| Visual diversity completely static (20.0% across all cycles) | Critical | High |
| Only +0.2% improvement from Cycle 1 | Critical | High |
| Assembly failures increased (25% failure rate) | Concerning | Medium |
| Cycle 3 is final opportunity (max 3 cycles allowed) | Constraint | High |
| No architectural changes attempted yet | Opportunity | Medium |

**Overall Decision:** Proceed to Cycle 3 with **maximum intervention** strategy.

---

## Cycle 3 Strategy: Maximum Intervention

### Objective
Achieve **minimum 40% overall diversity** (vs. 32.7% Cycle 2 baseline)
**Stretch goal:** 50% overall diversity

### Success Criteria
| Metric | Cycle 2 | Cycle 3 Target | Minimum Acceptable |
|--------|---------|---------------|-------------------|
| Overall | 32.7% | 50% | 40% |
| Structural | 31.7% | 45% | 38% |
| Thematic | 46.9% | 60% | 50% |
| Visual | 20.0% | 35% | 28% |
| Mode Collapse | 39.7% | <25% | <30% |

---

## Cycle 3 Prompt Changes

### ComponentSelector

**KEEP (Effective):**
- Minimum 9 components
- Component rotation by archetype (12 unique sets)
- EXCLUDE rules per archetype

**REMOVE (Causing Failures):**
- Uniqueness fingerprint check (causing assembly failures)

**ADD (New):**
- Per-archetype random component selection bias
- Forced unique component per generation
- Component diversity score bonus in selection

**Expected Impact:** +5-8% structural diversity

### StylingAgent

**REMOVE (Ineffective):**
- Variant quota system (ignored by model)
- "Choose LEAST Common" instruction (ignored by model)
- Forbidden variant combinations (ineffective)

**KEEP (Effective):**
- High entropy mode ("unpredictable, diverse, distinct, creative")

**ADD (New):**
- Archetype-specific FORBIDDEN variant lists
- Cross-archetype variant diversity bonus
- Variant entropy scoring

**Expected Impact:** +5-7% thematic diversity

### ContentGenerator

**KEEP:**
- Pre-generation uniqueness checklist
- CTA rotation (8 booking + 5 secondary)

**REMOVE:**
- Differentiation from previous generations (not measured)

**ADD (New):**
- Forbidden headline patterns per archetype
- Unique vocabulary requirements

**Expected Impact:** +2-3% thematic diversity

### TokenGenerator (NEW CRITICAL INTERVENTION)

**REMOVE:**
- Deterministic color palette generation

**ADD (New):**
- Hue distance minimum constraints (15° between primary colors)
- Color temperature randomization (warm/cool bias by archetype)
- Typography pairing diversity (5 unique pairings per archetype)
- Spacing scale variation (3 scale options per archetype)
- Border radius diversity (forced variation per generation)

**Expected Impact:** +10-15% visual diversity (from static 20.0%)

---

## Execution Plan

### Phase 1: Prompt Updates (30 min)
1. Update ComponentSelector prompt
2. Update StylingAgent prompt
3. Update ContentGenerator prompt
4. **CRITICAL:** Update TokenGenerator prompt

### Phase 2: Migration to Langfuse (15 min)
1. Copy updated prompts to Langfuse
2. Version as "cycle3"
3. Verify all 4 prompts deployed

### Phase 3: Regeneration (2 hours)
1. Run `generate-diversity-batch.ts` with cycle3 output dir
2. Target: 12/12 successful generations
3. Budget: Max $0.20 total cost

### Phase 4: Analysis (30 min)
1. Generate diversity report
2. Calculate scores
3. Generate comparison report

### Phase 5: Final Decision (15 min)
1. Assess against success criteria
2. Decide: Acceptable OR Document gaps
3. Complete Story 22.4

---

## Risk Mitigation

### Risk 1: Assembly Failures Continue
**Mitigation:** Removed uniqueness fingerprint check from ComponentSelector

### Risk 2: Visual Diversity Remains Static
**Mitigation:** Direct TokenGenerator intervention with randomization

### Risk 3: Model Compliance Issues
**Mitigation:** Simplified prompts (removed conflicting directives)

### Risk 4: Cost Overrun
**Mitigation:** Abort generation after $0.25 total spend

---

## Success Path vs. Failure Path

### If Cycle 3 Succeeds (≥40% overall diversity):
1. Document successful techniques
2. Update baseline for future generations
3. Complete Story 22.4 as SUCCESS
4. Recommend prompt patterns for production

### If Cycle 3 Fails (<40% overall diversity):
1. Document all techniques attempted (3 cycles)
2. Identify fundamental architectural gaps
3. Recommend non-prompt interventions:
   - Multi-step generation with diversity validation
   - Ensemble generation techniques
   - Post-hoc diversity injection
4. Complete Story 22.4 with recommendations

---

## Timeline

| Phase | Duration | Start Time | End Time |
|-------|----------|------------|----------|
| Prompt Updates | 30 min | Immediate | +30 min |
| Langfuse Migration | 15 min | +30 min | +45 min |
| Regeneration | 2 hours | +45 min | +2h 45min |
| Analysis | 30 min | +2h 45min | +3h 15min |
| Final Decision | 15 min | +3h 15min | +3h 30min |

**Total Time:** 3.5 hours

---

## Next Actions

1. ✅ Decision made: Proceed to Cycle 3
2. ⏳ Create Cycle 3 prompt update files
3. ⏳ Migrate prompts to Langfuse
4. ⏳ Execute Cycle 3 regeneration
5. ⏳ Generate final comparison report
6. ⏳ Complete Story 22.4

---

**End of Cycle 3 Decision Document**

*Ready to execute Cycle 3 maximum intervention plan.*
