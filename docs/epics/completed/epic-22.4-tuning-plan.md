# Epic 22 Story 22.4: LangGraph Agent Prompt Tuning Plan

**Generated:** 2026-03-13
**Story:** 22.4 - LangGraph Agent Prompt Tuning
**Baseline Diversity Report:** diversity-report.json (Report ID: 4849a519-276e-4bd1-94ba-6c8b5472f161)

---

## Executive Summary

**Current State:** The diversity scoring framework (Story 22.1) has identified significant mode collapse across generated hotel configs. The overall diversity score of 30.6% is 49.4% below the 80% target, with 43 mode collapse pairs detected (55.1% of all comparisons).

**Objective:** Improve agent prompts to increase structural, thematic, and visual diversity through targeted prompt engineering using anti-mode-collapse techniques.

**Scope:** This plan covers Cycle 1 of prompt tuning, with a maximum of 3 cycles as specified in Story 22.4 acceptance criteria.

---

## Baseline Diversity Analysis

### Current Scores

| Dimension | Score | Target | Gap | Priority |
|-----------|-------|--------|-----|----------|
| **Overall** | 30.6% | 80% | -49.4% | HIGH |
| **Structural** | 28.3% | 60%* | -31.7% | HIGH |
| **Thematic** | 44.1% | 60%* | -15.9% | MEDIUM |
| **Visual** | 20.0% | 60%* | -40.0% | HIGH |

*Note: Per-dimension targets are derived from the 80% overall target with proportional weighting.

### Mode Collapse Analysis

**Total Mode Collapse Pairs:** 43 (pairs with <30% diversity / >70% similarity)
**Mode Collapse Rate:** 55.1% of all comparisons
**Threshold:** 30% diversity (70% similarity)

### Most Problematic Archetypes

| Archetype | Collision Count | Avg Diversity | Status |
|-----------|-----------------|---------------|--------|
| Design/Art Hotel | 29 | 28.9% | ⚠️ High Collisions |
| Quiet Luxury | 16 | 29.8% | ⚠️ High Collisions |
| Coastal Resort | 10 | 34.2% | ⚠️ Medium Collisions |
| Business Hotel | - | 24.1% | ⚠️ Low Diversity |
| Eco Lodge | - | 24.6% | ⚠️ Low Diversity |
| Family Resort | - | 30.0% | ⚠️ Low Diversity |
| Wellness/Spa | - | 32.1% | ⚠️ Low Diversity |

### Component Usage Analysis

**Overused Components (100% usage):**
- navigation
- hero
- booking
- footer

**Underused Components (<20% usage):**
- faq (15.8%)
- contact (15.8%)

**Moderately Used Components:**
- features (57.9%)
- about (78.9%)
- gallery (84.2%)
- rooms (84.2%)
- testimonials (84.2%)
- amenities (84.2%)

### Thematic Diversity Issues

**Variant Overlap Patterns:**
- Many configs use identical variant values for same components
- `uniqueStyleCount` often = 1 (no variety in hero style)
- `uniqueCardStyleCount` often = 1 (no variety in card styling)
- `variantOverlapRatio` often = 1.0 (complete variant overlap)

### Visual Diversity Issues

**Token Analysis:**
- Visual diversity score: 20.0% (lowest dimension)
- `hueDistance` often = 50 (minimal color variation)
- `typographyDifference` = 0 (no typography variation)
- `spacingDifference` = 0 (no spacing variation)
- `borderRadiusDifference` = 0 (no border radius variation)

**Root Cause:** Design tokens are not being generated with sufficient variation. This is expected as Epic 20 (AI-driven tokens) is not yet complete.

---

## Tuning Strategy

### Agent Prompt Modifications

The following agents will have their prompts updated in Langfuse:

1. **ComponentSelector** - Structural diversity improvements
2. **StylingAgent** - Thematic diversity improvements
3. **ContentGenerator** - Content diversity improvements

### Tuning Principles

Based on anti-mode-collapse techniques from `docs/plans/ai-driven-block-style-diversity-plan.md`:

1. **Archetype Assignment** - Each archetype gets distinct component preferences
2. **Persona Descriptions** - Each archetype has unique personality and vocabulary
3. **Anti-Default Instructions** - Explicit guidance to avoid standard/obvious choices
4. **Style Quotas** - Require minimum variety in component/variant selections
5. **Differentiation Prompts** - Explicit "uniqueness check" before finalizing

### Success Criteria for Cycle 1

| Metric | Baseline | Cycle 1 Target | Measurement |
|--------|----------|----------------|-------------|
| Overall Diversity | 30.6% | >50% | +19.4% minimum |
| Structural | 28.3% | >40% | +11.7% minimum |
| Thematic | 44.1% | >50% | +5.9% minimum |
| Visual | 20.0% | >35% | +15% minimum |
| Mode Collapse Pairs | 43 | <30 | -30% reduction |
| % Comparisons with Mode Collapse | 55.1% | <40% | -27% reduction |

---

## Phase 1: ComponentSelector Prompt Modifications

### Current Issues

1. Component selection patterns too similar across archetypes
2. Standard combination [hero + navigation + booking + footer] appears in all configs
3. Underutilized components (faq, contact) rarely selected
4. Minimum component count (5) encourages sameness

### Modifications

#### 1.1 Anti-Default Component Selection

**Current Prompt Section:**
```
**DECISION GUIDELINES:**
- **Luxury:** Include gallery, testimonials, amenities, about - emphasize quality and experience
- **Budget:** Focus on rooms, amenities, contact, faq - emphasize value and practical information
```

**New Addition:**
```
**ANTI-DEFAULT INSTRUCTIONS (CRITICAL FOR DIVERSITY):**

⚠️ **AVOID** standard component combinations that appear in every hotel:
- Do NOT use only [hero + navigation + booking + footer] - this is the DEFAULT pattern
- Do NOT repeat the same component set across different hotels of the same archetype

✅ **DO** create UNIQUE component fingerprints:
- Each regeneration of the same archetype should produce DIFFERENT component sets
- When uncertain, include 1-2 components from [about, features, faq, contact]
- Minimum 7 components total (not 5-6) to ensure variety

**DIFFERENTIATION CHECK:**
Before finalizing your component selection, ask:
"Would this component set be UNIQUE among 12 different hotels?"
If answer is NO, swap 1-2 components to create distinction.
```

#### 1.2 Archetype-Specific Component Requirements

**New Section to Add:**
```
**ARCHETYPE-SPECIFIC COMPONENT DIVERSITY:**

Each archetype has DISTINCT component requirements. Follow these exactly:

**Heritage Opulence:**
- ALWAYS include: about, testimonials, features
- VARY: [gallery, amenities] (choose 1-2)
- Minimum: 8 components

**Quiet Luxury:**
- ALWAYS include: about
- VARY between: [testimonials, features, amenities] (choose 2-3)
- Avoid: faq (too utilitarian)
- Minimum: 7 components

**Boutique Editorial:**
- ALWAYS include: gallery, features
- VARY: [about, testimonials] (choose 1-2)
- Minimum: 8 components

**Urban Tech-Forward:**
- ALWAYS include: features, contact
- VARY: [about, faq] (choose 1-2)
- Minimum: 7 components

**Coastal Resort:**
- ALWAYS include: amenities, gallery, testimonials
- VARY: [features, about] (choose 1-2)
- Minimum: 8 components

**Mountain/Wilderness:**
- ALWAYS include: features, about
- VARY: [testimonials, amenities] (choose 1-2)
- Minimum: 7 components

**Wellness/Spa:**
- ALWAYS include: about, amenities
- VARY: [features, testimonials] (choose 1-2)
- Minimum: 7 components

**Heritage Cultural:**
- ALWAYS include: about, testimonials, features
- VARY: [gallery, amenities] (choose 1-2)
- Minimum: 8 components

**Eco Lodge:**
- ALWAYS include: features, amenities
- VARY: [about, gallery] (choose 1-2)
- Minimum: 7 components

**Design/Art Hotel:**
- ALWAYS include: gallery, features
- VARY: [testimonials, about] (choose 1-2)
- Minimum: 8 components

**Family Resort:**
- ALWAYS include: amenities, features, faq
- VARY: [about, testimonials] (choose 1-2)
- Minimum: 8 components

**Business Hotel:**
- ALWAYS include: faq, features, contact
- VARY: [about, amenities] (choose 1-2)
- Minimum: 7 components
```

#### 1.3 Component "Forbidden Combinations"

**New Section to Add:**
```
**FORBIDDEN COMBINATIONS:**

❌ **Do NOT** select only required components:
- [hero + navigation + booking + footer] alone = FORBIDDEN
- Must include at least 3 optional components

❌ **Do NOT** skip the following components when archetype requires them:
- Heritage Opulence without about, testimonials, or features
- Business Hotel without faq
- Family Resort without amenities or faq

❌ **Do NOT** always select the same optional components:
- If you selected [about + features] last time, try [testimonials + gallery] this time
```

### Expected Impact: ComponentSelector

- **Structural Diversity:** +15-25% (from 28.3% to 40-50%)
- **Mode Collapse Reduction:** 20-30% fewer pairs
- **Component Variety:** Increased usage of faq, contact, features

---

## Phase 2: StylingAgent Prompt Modifications

### Current Issues

1. Variant choices too similar across archetypes
2. First option in variant lists selected too often (default bias)
3. Cross-archetype differentiation insufficient
4. CVA validation constraints limiting variety

### Modifications

#### 2.1 Anti-Default Variant Instructions

**New Section to Add:**
```
**ANTI-DEFAULT VARIANT INSTRUCTIONS (CRITICAL FOR DIVERSITY):**

⚠️ **AVOID** default/obvious variant choices:
- When 3+ variant options exist, do NOT always choose the first listed option
- Vary your choices to create visual DISTINCTIVENESS
- Apply "variant entropy" - introduce randomness into selection

**Variant Exploration Rule:**
When uncertain between 2 valid variant options:
- Choose the LESS COMMON option for diversity
- Prefer variant combinations that create visual differentiation
- Example: Instead of navStyle: 'solid' for everyone, vary: transparent/glass/solid

**DIFFERENTIATION CHECK:**
Before finalizing variants, ask:
"Would these variant choices look DISTINCT from other hotel archetypes?"
If answer is NO, introduce at least 1 unique variant choice.
```

#### 2.2 Archetype-Specific Variant "Personalities"

**New Section to Add:**
```
**ARCHETYPE-SPECIFIC VARIANT PERSONAS:**

Each archetype has a DISTINCT variant personality. Follow these for unique styling:

**Heritage Opulence:**
- Prefer: elegant style, dark/gradient overlay
- VARY: height (large/fullscreen), layout (split/centered)
- Card style: elevated (not default/flat)
- Avoid: minimal style, none overlay

**Quiet Luxury:**
- Prefer: elegant or minimal style
- VARY: overlay (none/light - NOT dark/gradient), spacing (normal/loose)
- Card style: minimal or flat (NOT elevated)
- Layout preference: side-by-side or timeline (for about)

**Boutique Editorial:**
- Prefer: bold or modern style
- VARY: cardStyle (flat/elevated for distinction), layout (split/offset)
- Overlay: gradient or dark (high contrast)
- Gallery: prefer carousel or masonry (not standard grid)

**Urban Tech-Forward:**
- Prefer: bold or modern style
- VARY: overlay (none/dark), spacing (tight - NOT normal/loose)
- Card style: flat or minimal
- Layout: centered or minimal (clean, efficient)

**Coastal Resort:**
- Prefer: modern or minimal style
- VARY: overlay (none or light - NEVER dark/gradient), spacing (normal/loose)
- Gallery: carousel or masonry (airy feel)
- Height: large or fullscreen (expansive)

**Mountain/Wilderness:**
- Prefer: minimal style
- VARY: overlay (none or light - warm tones), cardStyle (flat/minimal)
- Layout: split or centered (cozy, not grand)
- Spacing: normal (not tight)

**Wellness/Spa:**
- Prefer: minimal or elegant style
- VARY: overlay (none or light), cardStyle (minimal/flat - soft feel)
- Spacing: loose (serene, not cramped)
- Border radius: rounded/soft variations when available

**Heritage Cultural:**
- Prefer: elegant or classic style
- VARY: overlay (dark/gradient), cardStyle (elevated - premium)
- Height: large or fullscreen (grandeur)
- Layout: centered or split (dignified)

**Eco Lodge:**
- Prefer: minimal style
- VARY: overlay (none), cardStyle (flat/minimal - natural)
- Layout: minimal or side-by-side (unpretentious)
- Spacing: normal or loose (organic feel)

**Design/Art Hotel:**
- Prefer: bold or modern style
- VARY: overlay (dark or gradient - dramatic), cardStyle (flat/elevated)
- Gallery: masonry (artistic arrangement)
- Height: medium or large (gallery-like presentation)

**Family Resort:**
- Prefer: modern or minimal style
- VARY: overlay (none/light - cheerful), cardStyle (elevated/rounded - friendly)
- Layout: centered or grid (easy to scan)
- Spacing: normal or loose (not cramped)

**Business Hotel:**
- Prefer: classic or modern style
- VARY: overlay (dark - professional), cardStyle (default/minimal)
- Layout: centered or grid (efficient)
- Spacing: tight or normal (business-like)
```

#### 2.3 Cross-Archetype Differentiation Rules

**New Section to Add:**
```
**CROSS-ARCHETYPE DIFFERENTIATION:**

Ensure YOUR variant choices would look DISTINCT from other archetypes:

**Navigation Style Distribution:**
- Heritage Opulence → solid or transparent
- Quiet Luxury → glass or transparent
- Boutique Editorial → glass
- Urban Tech-Forward → solid or transparent
- Coastal Resort → transparent or glass
- Mountain/Wilderness → transparent or solid
- Wellness/Spa → glass or transparent
- Heritage Cultural → solid
- Eco Lodge → transparent
- Design/Art Hotel → glass
- Family Resort → solid or glass
- Business Hotel → solid

**Gallery Layout Distribution:**
- Heritage Opulence → masonry (curated)
- Quiet Luxury → grid (orderly)
- Boutique Editorial → carousel or masonry
- Urban Tech-Forward → grid (efficient)
- Coastal Resort → carousel (dynamic)
- Mountain/Wilderness → masonry (organic)
- Wellness/Spa → masonry (serene)
- Heritage Cultural → grid or masonry
- Eco Lodge → masonry (natural)
- Design/Art Hotel → masonry (artistic)
- Family Resort → grid or carousel
- Business Hotel → grid (practical)

**Card Style Distribution:**
- Heritage Opulence → elevated (premium)
- Quiet Luxury → minimal or flat (subtle)
- Boutique Editorial → flat or elevated (distinctive)
- Urban Tech-Forward → flat or minimal (clean)
- Coastal Resort → elevated (resort feel)
- Mountain/Wilderness → flat or minimal (rustic)
- Wellness/Spa → minimal or flat (soft)
- Heritage Cultural → elevated (grand)
- Eco Lodge → flat (natural)
- Design/Art Hotel → flat or elevated (artistic)
- Family Resort → elevated (friendly)
- Business Hotel → default or minimal (professional)
```

#### 2.4 Variant Entropy Guidance

**New Section to Add:**
```
**VARIANT ENTROPY GUIDANCE:**

When multiple valid variant options exist, use this selection order:

**Style Variants (hero):**
- 1. bold, modern, elegant, classic, minimal (prefer first 3, avoid last 2)
- 2. VARY: don't always choose the same style for the same archetype

**Layout Variants:**
- 1. split, centered, minimal (prefer split for variety)
- 2. Avoid: always choosing "centered" as default

**Overlay Variants:**
- 1. light, gradient, dark, none (prefer light/gradient for diversity)
- 2. Avoid: always choosing "none" as default

**Gallery Layout:**
- 1. masonry, carousel, grid (prefer masonry for visual interest)
- 2. Avoid: always choosing "grid" as default

**Card Style:**
- 1. elevated, flat, minimal, default (prefer elevated/flat for distinction)
- 2. Avoid: always choosing "default"
```

### Expected Impact: StylingAgent

- **Thematic Diversity:** +10-15% (from 44.1% to 50-55%)
- **Mode Collapse Reduction:** 15-25% fewer pairs
- **Variant Variety:** Increased uniqueStyleCount, uniqueCardStyleCount

---

## Phase 3: ContentGenerator Prompt Modifications

### Current Issues

1. Content tone too generic across different hotel types
2. Vocabulary lacks archetype-specific character
3. Hotel descriptions sound similar regardless of archetype

### Modifications

#### 3.1 Archetype-Specific Tone Guidelines

**New Section to Add:**
```
**ARCHETYPE-SPECIFIC TONE & VOCABULARY:**

Each archetype requires DISTINCT tone and vocabulary. Use EXACTLY as specified:

**Heritage Opulence:**
- Tone: Grand, dignified, established
- Vocabulary: "Legacy", "Timeless", "Heritage", "Grandeur", "Estate", "Tradition", "Magnificent"
- Avoid: "modern", "trendy", "hip", "casual"
- Example: "A legacy of timeless elegance since 1925..."

**Quiet Luxury:**
- Tone: Refined, subtle, understated
- Vocabulary: "Refined", "Subtle", "Curated", "Essential", "Bespoke", "Discreet", "Intimate"
- Avoid: flashy claims, "luxury", "premium" (overused)
- Example: "Refined simplicity for the discerning traveler..."

**Boutique Editorial:**
- Tone: Chic, artistic, distinctive
- Vocabulary: "Curated", "Artful", "Distinctive", "Chic", "Visionary", "Eclectic", "Bespoke"
- Avoid: generic descriptors, "standard", "typical"
- Example: "An artfully curated sanctuary in the heart of the city..."

**Urban Tech-Forward:**
- Tone: Efficient, innovative, sleek
- Vocabulary: "Innovative", "Seamless", "Smart", "Connected", "Modern", "Streamlined", "Digital"
- Avoid: "cozy", "rustic", "traditional", "charm"
- Example: "A seamlessly connected urban sanctuary for the modern traveler..."

**Coastal Resort:**
- Tone: Serene, breezy, expansive
- Vocabulary: "Serenity", "Azure", "Breezy", "Coastal", "Horizon", "Shoreline", "Expansive"
- Avoid: urban terms, "bustling", "vibrant city"
- Example: "Where azure horizons meet pristine shorelines..."

**Mountain/Wilderness:**
- Tone: Rustic, authentic, tranquil
- Vocabulary: "Rustic", "Alpine", "Summit", "Wilderness", "Tranquil", "Untamed", "Panoramic"
- Avoid: luxury buzzwords, "elegant", "sophisticated"
- Example: "An alpine retreat where wilderness meets tranquility..."

**Wellness/Spa:**
- Tone: Serene, holistic, rejuvenating
- Vocabulary: "Rejuvenate", "Serene", "Holistic", "Bliss", "Sanctuary", "Restore", "Balance"
- Avoid: busy/active terms, "bustling", "energetic"
- Example: "A holistic sanctuary to restore mind, body, and spirit..."

**Heritage Cultural:**
- Tone: Rich, authentic, storied
- Vocabulary: "Cultural", "Authentic", "Storied", "Heritage", "Traditional", "Vibrant", "Local"
- Avoid: generic international terms
- Example: "Immerse yourself in our rich cultural heritage..."

**Eco Lodge:**
- Tone: Natural, sustainable, grounded
- Vocabulary: "Sustainable", "Natural", "Organic", "Eco-conscious", "Grounded", "Preserved", "Pure"
- Avoid: "luxury", "premium", "exclusive"
- Example: "Grounded in nature, designed for sustainability..."

**Design/Art Hotel:**
- Tone: Creative, bold, visionary
- Vocabulary: "Visionary", "Bold", "Creative", "Artistic", "Contemporary", "Avant-garde", "Curated"
- Avoid: "traditional", "classic", "heritage"
- Example: "A visionary canvas where art meets hospitality..."

**Family Resort:**
- Tone: Welcoming, fun, caring
- Vocabulary: "Adventure", "Memories", "Together", "Fun", "Friendly", "Spacious", "Safe"
- Avoid: "romantic", "intimate", "exclusive", "sophisticated"
- Example: "Create lasting family memories in our welcoming resort..."

**Business Hotel:**
- Tone: Professional, efficient, reliable
- Vocabulary: "Efficient", "Productive", "Professional", "Convenient", "Reliable", "Connected", "Premier"
- Avoid: "cozy", "intimate", "whimsical", "playful"
- Example: "Efficiency meets reliability for the productive business traveler..."
```

#### 3.2 Unique Content Fingerprint Directive

**New Section to Add:**
```
**UNIQUE CONTENT FINGERPRINT:**

Each archetype should have DISTINCT content voice - avoid generic hotel descriptions.

**Generic Phrases to AVOID:**
- "world-class hospitality"
- "unparalleled service"
- "exceptional experience"
- "luxury at its finest"
- "unforgettable moments"

**INSTEAD, use archetype-specific language:**

❌ Generic: "Experience world-class hospitality at our hotel."
✅ Heritage Opulence: "Experience a legacy of refined hospitality since 1925."
✅ Boutique Editorial: "Discover an artfully curated sanctuary in the heart of the city."
✅ Coastal Resort: "Experience the serenity of our coastal sanctuary."

**CONTENT DIFFERENTIATION CHECK:**
Before finalizing content, verify:
- Does this description sound UNIQUE to this archetype?
- Would a reader identify the archetype from the text alone?
- Are generic phrases replaced with archetype-specific language?
```

### Expected Impact: ContentGenerator

- **Content Diversity:** Qualitative improvement in uniqueness
- **Archetype Voice:** Distinct personality per archetype
- **Reduced Generic Language:** Fewer overused phrases

---

## Regeneration Strategy

### Test Set Selection

**Archetypes Prioritized for Cycle 1 (Lowest Diversity):**

1. **Business Hotel** (Marriott Marquis San Diego) - 24.1% avg diversity
2. **Eco Lodge** (1 Hotel South Beach) - 24.6% avg diversity
3. **Design/Art Hotel** (21c Museum Hotel Nashville) - 28.9% avg diversity
4. **Family Resort** (Club Med Punta Cana) - 30.0% avg diversity
5. **Wellness/Spa** (COMO Shambhala Estate) - 32.1% avg diversity

**Regeneration Plan:**
- Generate 2 configs per archetype (10 total)
- Use `generate-diversity-batch.ts` with profile-based regeneration
- Assess within-archetype diversity (how different are the 2 configs)

### Measurement Protocol

**Pre-Regeneration (Baseline):**
- Overall: 30.6%
- Structural: 28.3%
- Thematic: 44.1%
- Visual: 20.0%
- Mode Collapse Pairs: 43

**Post-Regeneration (Cycle 1):**
- Run `generate-diversity-report.ts` on new configs
- Compare scores to baseline
- Calculate improvement percentages
- Identify which dimension(s) still lag

**Success Criteria:**
- Overall: >50% (+19.4% minimum)
- Structural: >40% (+11.7% minimum)
- Thematic: >50% (+5.9% minimum)
- Visual: >35% (+15% minimum)
- Mode Collapse Pairs: <30 (-30% reduction)

---

## Fallback Strategy (If Targets Not Met)

### Cycle 2 Adjustments

If Cycle 1 targets are not met, consider:

**Structural (if <40%):**
- Add "component rotation" directive (cycle through underused components)
- Increase minimum component count from 7 to 8
- Add negative examples: "Here's what NOT to select..."

**Thematic (if <50%):**
- Increase temperature parameter for variant selection (0.7 → 0.85)
- Add "forbidden variant combinations" list
- Implement "variant budget" system (must use at least X% non-default variants)

**Visual (if <35%):**
- Note: Limited impact possible until Epic 20 complete
- Focus on prompt-level diversity (can't control token generation)
- Document as "blocked on Epic 20 completion"

### Cycle 3 Adjustments

If Cycle 2 targets are still not met, consider:

- More aggressive anti-default language
- Explicit "diversity quota" system
- Negative constraint enforcement
- Temperature parameter tuning (0.85 → 1.0)
- Consider architectural changes (outside Story 22.4 scope)

---

## Prompt Update Checklist

### ComponentSelector Prompt Update

- [ ] Add "ANTI-DEFAULT INSTRUCTIONS" section
- [ ] Add "ARCHETYPE-SPECIFIC COMPONENT DIVERSITY" section
- [ ] Add "FORBIDDEN COMBINATIONS" section
- [ ] Update examples to show diversity
- [ ] Test regeneration with updated prompt
- [ ] Validate against acceptance criteria

### StylingAgent Prompt Update

- [ ] Add "ANTI-DEFAULT VARIANT INSTRUCTIONS" section
- [ ] Add "ARCHETYPE-SPECIFIC VARIANT PERSONAS" section
- [ ] Add "CROSS-ARCHETYPE DIFFERENTIATION" section
- [ ] Add "VARIANT ENTROPY GUIDANCE" section
- [ ] Test regeneration with updated prompt
- [ ] Validate CVA compliance maintained

### ContentGenerator Prompt Update

- [ ] Add "ARCHETYPE-SPECIFIC TONE & VOCABULARY" section
- [ ] Add "UNIQUE CONTENT FINGERPRINT" section
- [ ] Update toneGuidance mapping with archetype-specific tones
- [ ] Test regeneration with updated prompt
- [ ] Validate content quality maintained

---

## Documentation Requirements

### After Cycle 1

1. **Create before/after comparison report** at `output/diversity-validation/tuning-cycle-1-report.md`
2. **Document prompt changes** in epic document Story 22.4 Dev Agent Record
3. **Update diversity report** with new scores
4. **Create recommendations** for Cycle 2 (if needed)

### Prompt Changelog Format

```markdown
## Prompt Changelog - Cycle 1

### ComponentSelector
**Changed:** Added anti-default instructions section
**Rationale:** Reduce mode collapse by avoiding standard component combinations
**Expected Impact:** +15-25% structural diversity
**Actual Impact:** [To be filled after Cycle 1]

### StylingAgent
**Changed:** Added archetype-specific variant personalities
**Rationale:** Increase cross-archetype differentiation
**Expected Impact:** +10-15% thematic diversity
**Actual Impact:** [To be filled after Cycle 1]

### ContentGenerator
**Changed:** Added archetype-specific tone guidelines
**Rationale:** Create distinct content voices per archetype
**Expected Impact:** Qualitative content diversity improvement
**Actual Impact:** [To be filled after Cycle 1]
```

---

## Timeline

| Phase | Task | Estimated Time |
|-------|------|----------------|
| Phase 1 | Analyze report, create tuning plan | 1 hour |
| Phase 2 | Update ComponentSelector prompt | 1 hour |
| Phase 3 | Update StylingAgent prompt | 1 hour |
| Phase 4 | Update ContentGenerator prompt | 1 hour |
| Phase 5 | Regenerate configs and validate | 2 hours |
| Phase 6 | Create comparison report | 1 hour |
| **Total** | **Cycle 1 Implementation** | **7 hours** |

---

## Appendix: Reference Data

### Mode Collapse Pairs (<30% diversity)

From diversity-report.json, the 43 mode collapse pairs include:

| Config A | Config B | Score | Archetypes |
|----------|----------|-------|------------|
| 1-hotel-south-beach-v1 | marriott-marquis-san-diego-v1 | 8.44% | Eco Lodge ↔ Business |
| explora-atacama-v1 | one-only-le-saint-geran-v1 | 9.00% | Mountain/Wilderness ↔ Coastal |
| 1-hotel-south-beach-v1 | 21c-museum-hotel-nashville-v1 | 11.00% | Eco Lodge ↔ Design/Art |
| 21c-museum-hotel-nashville-v1 | marriott-marquis-san-diego-v1 | 13.40% | Design/Art ↔ Business |
| haus-minima-boutique-v1 | one-only-le-saint-geran-v1 | 13.60% | Quiet Luxury ↔ Coastal |
| ... | ... | ... | ... |

*(Full list in diversity-report.json)*

### Archetype Profile Mapping

From `web-app/fixtures/diversity/archetype-profiles.ts`:

| Archetype | Hotel Type | Target Audience | Brand Personality |
|-----------|------------|-----------------|-------------------|
| Heritage Opulence | luxury | couples | elegant |
| Quiet Luxury | luxury | couples | elegant |
| Boutique Editorial | boutique | leisure | modern |
| Urban Tech-Forward | boutique | business | modern |
| Coastal Resort | resort | couples | elegant |
| Mountain/Wilderness | resort | couples | adventurous |
| Wellness/Spa | resort | couples | elegant |
| Heritage Cultural | luxury | business | elegant |
| Eco Lodge | resort | couples | adventurous |
| Design/Art Hotel | boutique | leisure | modern |
| Family Resort | resort | family | friendly |
| Business Hotel | business | business | professional |

---

**End of Tuning Plan**

*This document serves as the blueprint for Story 22.4 Cycle 1 prompt tuning implementation.*
