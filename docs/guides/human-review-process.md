# Human Review Process for Generated Homepage Configurations

This document describes the human review process for validating generated homepage configurations to ensure quality standards are met.

## Purpose

To ensure that all generated homepage configurations meet quality benchmarks before being marked as production-ready. Each configuration must be reviewed by a human and achieve a quality score of ≥9.0.

---

## Review Criteria

A generated homepage configuration is evaluated on the following criteria:

| Criterion | Weight | Description | Passing Threshold |
|-----------|--------|-------------|-------------------|
| **Content Completeness** | 30% | All required sections are present and complete | 9/10 |
| **Content Quality** | 25% | Copy is grammatically correct, on-brand, and persuasive | 9/10 |
| **Visual Coherence** | 20% | Colors, fonts, and variants are harmonious | 9/10 |
| **Brand Alignment** | 15% | Matches hotel type, audience, and personality | 9/10 |
| **Technical Validity** | 10% | Valid JSON, correct schema, all fields present | 10/10 |

**Minimum Passing Score: 9.0/10**

---

## Review Process

### Step 1: Generate Configuration

Use the CLI script to generate a homepage configuration:

```bash
npx tsx scripts/generate-homepage.ts \
  --name "Example Hotel" \
  --type luxury \
  --audience couples \
  --personality elegant \
  --location "Paris, France"
```

This will create a configuration file in `output/homepage-config-[name]-[id].json`.

### Step 2: Review Content Completeness (30%)

Check that all required sections are present:

| Section | Required | Pass Criteria |
|---------|----------|---------------|
| Hero | ✅ | Headline, subheadline, CTA present |
| Navigation | ✅ | Logo, links, booking button present |
| Rooms/Rooms Grid | ✅ | Room cards with prices, descriptions |
| Amenities | ✅ | Icon + description for each amenity |
| Gallery | ✅ | At least 3 images present |
| Testimonials | ✅ | At least 2 testimonials with ratings |
| Booking Widget | ✅ | Date picker, guest counter, CTA present |
| Contact | ✅ | Address, phone, email present |
| Footer | ✅ | Links, copyright present |

**Scoring:** (Present Sections / Required Sections) × 30

### Step 3: Review Content Quality (25%)

Evaluate the generated copy for:

| Aspect | Evaluation Points |
|--------|------------------|
| **Grammar & Spelling** | No errors, proper punctuation |
| **Tone & Voice** | Matches brand personality (elegant, modern, friendly, etc.) |
| **Persuasiveness** | Compelling headlines, clear value propositions |
| **Accuracy** | Hotel name, location, details are correct |
| **Uniqueness** | Not generic copy; feels customized |

**Scoring:** 0-25 based on overall quality assessment

### Step 4: Review Visual Coherence (20%)

Evaluate the styling choices:

| Aspect | Evaluation Points |
|--------|------------------|
| **Color Harmony** | Primary/secondary colors work well together |
| **Typography** | Font pairings are readable and appropriate |
| **Variant Consistency** | All sections use compatible CVA variants |
| **Accessibility** | Sufficient contrast, readable text sizes |

**Scoring:** 0-20 based on visual assessment

### Step 5: Review Brand Alignment (15%)

Verify alignment with input parameters:

| Input | Verification |
|-------|--------------|
| `hotelType` | Layout and features match type (luxury, budget, boutique, resort, business) |
| `targetAudience` | Content speaks to audience (business, leisure, family, couples, backpackers) |
| `brandPersonality` | Style reflects personality (elegant, modern, friendly, professional, adventurous) |
| `location` | Location mentioned accurately in content |

**Scoring:** 0-15 based on alignment verification

### Step 6: Verify Technical Validity (10%)

Automated checks via Zod schema validation:

```bash
# Run validation script
npx tsx scripts/validate-config.ts --input output/homepage-config-[name]-[id].json
```

**Scoring:** 10/10 if valid, 0/10 if invalid (automatic)

---

## Scoring Worksheet

For each review, use this worksheet:

```
Configuration: [Hotel Name] - [Generation ID]
Reviewer: [Name]
Date: [Date]

--- Scoring ---

1. Content Completeness (30%): ___/30
   - Present Sections: ___/9
   - Score: ___/30

2. Content Quality (25%): ___/25
   - Grammar: ___/5
   - Tone: ___/5
   - Persuasiveness: ___/5
   - Accuracy: ___/5
   - Uniqueness: ___/5
   - Score: ___/25

3. Visual Coherence (20%): ___/20
   - Colors: ___/5
   - Typography: ___/5
   - Variants: ___/5
   - Accessibility: ___/5
   - Score: ___/20

4. Brand Alignment (15%): ___/15
   - Type: ___/4
   - Audience: ___/4
   - Personality: ___/4
   - Location: ___/3
   - Score: ___/15

5. Technical Validity (10%): ___/10
   - Valid JSON: ___/5
   - Schema Valid: ___/5
   - Score: ___/10

--- Total ---

Total Score: ___/100
Passing (≥9.0/10): [YES/NO]

--- Comments ---

[Detailed feedback for improvement if score < 9.0]

--- Decision ---

[ ] APPROVED - Ready for production
[ ] REJECTED - Requires regeneration with feedback
[ ] CONDITIONAL - Minor fixes needed, can be applied manually

Reviewer Signature: _________________
```

---

## Required Sample for Story 7.10

For **AC7** of Story 7.10, the following samples are required:

| # | Hotel Name | Type | Audience | Personality | Location | Quality Score | Status |
|---|------------|------|-----------|--------------|----------|---------------|--------|
| 1 | Grand Horizon Luxury Suites | luxury | business | professional | New York, NY | _ | Pending |
| 2 | Sunny Side Inn | budget | family | friendly | Orlando, FL | _ | Pending |
| 3 | The Secret Garden | boutique | couples | elegant | Kyoto, Japan | _ | Pending |
| 4 | TechHub Conference Hotel | business | business | modern | San Francisco, CA | _ | Pending |
| 5 | Blue Lagoon Paradise | resort | leisure | adventurous | Maldives | _ | Pending |

All 5 configurations must achieve a quality score of **≥9.0/10** to satisfy AC7.

---

## Retest Protocol

If a configuration scores below 9.0:

1. **Document Feedback**: Record specific issues in the review worksheet
2. **Regenerate**: Run the generation again with the same parameters
3. **Re-review**: Complete a full review of the new configuration
4. **Track**: Log both attempts and their scores for analysis

If 3 consecutive attempts fail, flag for prompt engineering review.

---

## Reviewer Training

All reviewers should:

1. **Complete Training**: Review the quality assessment rubric at `docs/validation/quality-assessment-rubric.md`
2. **Calibrate**: Review 3 sample configurations together as a group to align scoring
3. **Certify**: Pass a certification quiz with 5 test scenarios

---

## Output

After successful review, the configuration should be:

1. **Copied** to `output/production/homepage-config-[name]-[id].json`
2. **Logged** in the review tracker spreadsheet
3. **Tagged** with reviewer name and approval date

Example file naming:
```
output/production/homepage-config-grand-horizon-v1234567890-approved-2025-01-13.json
```
