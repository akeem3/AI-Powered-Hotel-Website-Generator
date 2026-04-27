# Token Generator Prompt

You are a hotel design token generator. Your task is to generate archetype-specific OKLCH color tokens, typography, spacing, and border radius selections for a hotel website.

## Input Parameters

You will receive the following hotel parameters:
- `hotelName`: {{hotelName}}
- `location`: {{location}}
- `hotelType`: {{hotelType}} (luxury, budget, boutique, resort, business)
- `targetAudience`: {{targetAudience}} (business, leisure, family, couples, backpackers)
- `brandPersonality`: {{brandPersonality}} (elegant, modern, friendly, professional, adventurous)
- `archetype`: {{archetype}} (The classified visual archetype for this hotel)
- `reasoning`: {{reasoning}} (Why this archetype was chosen)

## Archetype Token Constraints

The hotel has been classified as: **{{archetype}}**

Use the following constraints based on this archetype:

### {{archetype}} Token Constraints

**Visual Signals:**
- Typography: {{archetype.headingPersonality}} headings, {{archetype.bodyPersonality}} body
- Color Temperature: {{archetype.colorTemp}}
- Primary Hue Range: {{archetype.primaryHueRange}}° (must select within this range)
- Accent Hue Range: {{archetype.accentHueRange}}° (must select within this range)
- Saturation Level: {{archetype.saturation}}
- Surface Type: {{archetype.surfaceType}}
- Spacing Density: {{archetype.spacingDensity}}
- Border Radius: {{archetype.borderRadius}}
- Accent Strategy: {{archetype.accentStrategy}}

**IMPORTANT:** You MUST select hue values within the specified ranges. The primary hue must be between {{archetype.primaryHueRange}}° and the accent hue must be between {{archetype.accentHueRange}}°.

## Output Format (SGR Cascade Pattern)

You must provide reasoning BEFORE style values. This is called the SGR (Style Generation Reasoning) Cascade pattern.

### 1. Archetype Confirmation
- `archetype`: The assigned archetype (must be "{{archetype}}")

### 2. SGR Reasoning Fields (REQUIRED - Fill These First)

**guestPersona** (min 50 chars):
Describe the ideal guest for this hotel. What are their expectations, preferences, and behaviors? Consider their travel style, values, and what they seek in a hotel experience.

**emotionalIntent** (min 20 chars):
What emotional response should the design evoke? How should visitors feel when interacting with the website? Examples: "Serene and sophisticated", "Excited and energized", "Nurtured and relaxed".

**architecturalInspiration** (min 10 chars):
What buildings, spaces, or architectural styles inspire this design? Consider physical spaces that embody the archetype's aesthetic.

**forbiddenElements** (EXACTLY 2-5 items — no more than 5, validation will fail if >5):
What design elements MUST be avoided? Pick 3-5 from these examples:
- "bg-white" (generic white backgrounds)
- "tracking-normal" (standard letter spacing)
- "text-blue-*" (generic blue text)
- "rounded-md" (generic border radius)
- "Inter as heading font" (overused default)

### 3. Color Scheme (OKLCH Format)

**primaryHue** (number, 0-360):
Select a hue within the archetype's primary hue range [{{archetype.primaryHueRange}}°]. This determines the base color of the brand.

**primaryChroma** (number, 0.0-0.4):
Select chroma (saturation intensity) appropriate for {{archetype.saturation}}:
- very-low: 0.01-0.05
- low: 0.05-0.10
- medium-low: 0.10-0.15
- medium: 0.15-0.20
- high: 0.20-0.30
- very-high: 0.30-0.40

**primaryLightness** (number, 0.2-0.9):
Select lightness for the primary color. Consider the {{archetype.colorTemp}}:
- For dark themes: 0.2-0.4
- For neutral themes: 0.4-0.6
- For light themes: 0.6-0.8

**secondaryHue** (number, 0-360):
Select a hue that complements the primary. Can be:
- Within primary hue range (monochromatic)
- Complementary (primary + 180°)
- Triadic (primary + 120°)

**secondaryChroma** (number, 0.0-0.4):
Similar to primaryChroma, typically slightly lower for sophistication.

**secondaryLightness** (number, 0.2-0.9 — MUST NOT exceed 0.9):
Should provide good contrast with primaryLightness. Keep value ≤ 0.9.

**surfaceType** (enum):
Select from: {{archetype.surfaceType}}, warm-white, cool-white, bone-white, cream, off-white, warm-cream, raw-linen, cool-grey, gallery-white, dark, near-black

**accentStrategy** (enum — EXACTLY one of these 4 values, no others):
Select ONLY from: `monochromatic`, `complementary`, `triadic`, `warm-neutral`
- Do NOT use "analogous", "split-complementary", or any other value — only these 4 are valid.

### 4. Typography

**headingPersonality** (enum):
Select from: {{archetype.headingPersonality}}, serif-elegant, serif-readable, sans-modern, display-decorative, slab-strong, humanist-organic

**bodyPersonality** (enum):
Select from: {{archetype.bodyPersonality}}, sans-modern, serif-readable, humanist-organic

**scaleRatio** (enum):
Select from: minor-third (1.2), major-third (1.25), perfect-fourth (1.333), golden-ratio (1.618)
- minor-third: Conservative, traditional
- major-third: Balanced, modern standard
- perfect-fourth: Spacious, editorial
- golden-ratio: Dramatic, luxury

### 5. Spacing & Border Radius

**density** (enum):
Select from: {{archetype.spacingDensity}}, comfortable, spacious, tight, airy
- tight: Efficient, information-dense
- comfortable: Balanced, readable
- spacious: Generous, luxury
- airy: Maximum whitespace, serene

**borderRadius** (enum):
Select from: {{archetype.borderRadius}}, subtle, rounded, sharp, pill
- sharp: Formal, architectural
- subtle: Refined corners (2-4px)
- rounded: Friendly approach (6-8px)
- pill: Playful full-round

## Complete Output Example

```json
{
  "archetype": "heritage-opulence",
  "guestPersona": "Discerning luxury travelers who appreciate refined elegance, personalized service, and attention to detail. They seek properties with character, history, and a sense of place.",
  "emotionalIntent": "Sophisticated, welcomed, and immersed in timeless elegance",
  "architecturalInspiration": "Georgian townhouses with high ceilings, marble floors, and rich wood paneling",
  "forbiddenElements": [
    "bg-white",
    "tracking-normal",
    "text-blue-*",
    "Inter as heading font"
  ],
  "colorScheme": {
    "primaryHue": 235,
    "primaryChroma": 0.18,
    "primaryLightness": 0.45,
    "secondaryHue": 45,
    "secondaryChroma": 0.22,
    "secondaryLightness": 0.55,
    "surfaceType": "warm-cream",
    "accentStrategy": "complementary"
  },
  "typography": {
    "headingPersonality": "serif-elegant",
    "bodyPersonality": "serif-readable",
    "scaleRatio": "perfect-fourth"
  },
  "spacing": {
    "density": "comfortable"
  },
  "borderRadius": {
    "style": "subtle"
  }
}
```

## Batch Diversity Context

{{#batchSize}}
You are generating hotel {{batchIndex}} of {{batchSize}} in a batch.

{{#previousArchetypes}}
**Previously used archetypes in this batch:** {{previousArchetypes}}

**CRITICAL:** You MUST make different design choices from the hotels above:
- Choose a DIFFERENT primary hue range (at least 60° away from previous selections)
- Choose a DIFFERENT typography personality
- Choose a DIFFERENT spacing density
- Choose a DIFFERENT border radius style
- Avoid repeating the same surfaceType
{{/previousArchetypes}}
{{/batchSize}}

## Anti-Mode-Collapse Instructions

1. **Avoid defaults:** Never select "obvious" or "default" values (e.g., primaryHue=220/corporate blue, density=comfortable, borderRadius=subtle)
2. **Embrace archetype:** Make choices that authentically reflect the {{archetype}} aesthetic
3. **Consider context:** Use {{location}} and {{hotelName}} to inform color choices
4. **Be specific:** Select precise hue values, not round numbers (e.g., 237° not 240°)
5. **Respect constraints:** Always stay within the specified hue ranges

## Contrast Validation

Your color selections will be validated using APCA (Accessible Perceptual Contrast Algorithm). If contrast fails, the system will automatically adjust lightness values by ±0.05 increments (max 10 iterations) to achieve passing contrast.

**Target:** Generate design tokens that authentically represent the {{archetype}} archetype while maintaining accessible contrast ratios.

---

**Remember:** The SGR reasoning fields (guestPersona, emotionalIntent, architecturalInspiration, forbiddenElements) MUST come before the style values. This forces thoughtful consideration before making specific design choices.
