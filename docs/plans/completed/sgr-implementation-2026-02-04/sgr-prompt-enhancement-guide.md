# SGR Prompt Enhancement Guide

**Date:** 2026-02-03
**Component:** Agent Prompts
**Priority:** High (Phase 2)
**Related Files:**
- [`docs/prompts/01-component-selector.md`](../prompts/01-component-selector.md)
- [`docs/prompts/02-styling-agent.md`](../prompts/02-styling-agent.md)
- [`docs/prompts/03-content-generator.md`](../prompts/03-content-generator.md)
- [`docs/prompts/04-assembly-agent.md`](../prompts/04-assembly-agent.md)

---

## Purpose

Apply Schema-Guided Reasoning (SGR) Cascade pattern to all agent prompts to improve JSON output consistency and quality by explicitly defining reasoning steps.

---

## SGR Cascade Pattern

### What is the Cascade Pattern?

The Cascade pattern forces the LLM to follow a predefined sequence of reasoning steps, ensuring:
1. **No skipped logic** - Each step must be completed before moving to the next
2. **Explicit reasoning** - Thinking process is made visible
3. **Order enforcement** - Output follows logical flow

### Structure

```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: [Step Name]
   - [Sub-step 1]
   - [Sub-step 2]

2. THEN: [Step Name]
   - [Sub-step 1]
   - [Sub-step 2]

3. FINALLY: [Step Name]
   - [Sub-step 1]
   - [Sub-step 2]

**OUTPUT REQUIREMENTS:**
Return JSON in this exact structure:
{
  "step1_output": { ... },
  "step2_output": { ... },
  "step3_output": { ... },
  "reasoning": "..."
}
```

---

## Agent-Specific Enhancements

### 1. ComponentSelector (Cascade Pattern)

**Current Prompt Structure:**
```markdown
**ANALYSIS INSTRUCTIONS:**
1. Analyze the hotel characteristics provided in INPUT DATA
2. Select 5-8 components from the COMPONENT CATALOG
3. Choose optimal layout structure
4. Identify up to 3 emphasis components
5. Provide reasoning explaining your choices
```

**SGR-Enhanced Prompt:**
```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: Analyze the Hotel Profile
   - Identify the hotel type (luxury, budget, boutique, resort, business)
   - Determine the primary target audience needs
   - Assess the brand personality (elegant, modern, friendly, professional, adventurous)
   - Note any special considerations based on location

2. THEN: Select Components
   - Review the COMPONENT CATALOG carefully
   - MUST include: "hero" and "navigation" (always required)
   - Select 3-6 additional components based on hotel type
   - Total components: 5-8 maximum
   - Ensure components align with target audience needs

3. THEN: Choose Layout Structure
   - "single-column": Best for simple, focused presentation (budget, boutique)
   - "grid": Good for showcasing multiple options (rooms, amenities, gallery)
   - "mixed": Premium layouts combining full-width and grid (luxury, resort)
   - Match layout complexity to brand personality

4. THEN: Identify Emphasis Components
   - Select up to 3 components for prominent placement
   - Priority: conversion-driving components (booking, rooms)
   - Consider emphasisComponents for visual hierarchy

5. FINALLY: Justify Your Decisions
   - Explain why each component was chosen
   - Connect choices to hotel type, audience, and brand personality
   - Describe how layout serves the user experience

**EXPECTED JSON OUTPUT FORMAT:**
```json
{
  "hotelAnalysis": {
    "hotelType": "luxury",
    "audienceNeeds": "Business executives require efficiency, premium amenities, and professional presentation",
    "brandAssessment": "Elegant and sophisticated, requiring refined styling"
  },
  "selectedComponents": ["hero", "navigation", "rooms", "gallery", "testimonials", "amenities", "booking"],
  "layoutStructure": "mixed",
  "emphasisComponents": ["hero", "rooms", "booking"],
  "reasoning": "Luxury business hotel requires visual proof (gallery), social proof (testimonials), and premium amenities display. Mixed layout creates sophisticated hierarchy. Emphasis on conversion-driving components."
}
```

**Key Improvements:**
- Explicit reasoning steps in order
- Hotel analysis made visible in output
- Clear decision criteria for each step
- Structured output matches reasoning flow
```

### 2. StylingAgent (Cascade Pattern)

**Current Prompt Structure:**
```markdown
**ANALYSIS INSTRUCTIONS:**
1. Analyze hotel type, target audience, and brand personality from INPUT DATA
2. Select variant combinations for EACH component
3. Ensure variants align with brand personality and hotel type
```

**SGR-Enhanced Prompt:**
```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: Analyze Styling Requirements
   - Review hotel type (luxury, budget, boutique, resort, business)
   - Assess brand personality styling implications
   - Note selectedComponents and layoutStructure
   - Identify emphasisComponents needing premium variants

2. THEN: Select Hero Variants
   - style: modern | classic | minimal | bold | elegant
   - layout: centered | split | fullscreen
   - overlay: none | light | dark | gradient
   - height: small | medium | large | fullscreen
   - Match to hotel type and brand personality

3. THEN: Select Navigation Variants
   - navStyle: transparent | solid | glass
   - navLayout: default | compact | tall
   - Ensure readability and accessibility

4. THEN: Select Content Component Variants
   For EACH component (rooms, gallery, testimonials, amenities):
   - Review available variants for that component
   - Select variants that match brand personality
   - Ensure consistency across related components
   - Apply premium variants to emphasisComponents

5. THEN: Select Action Component Variants
   For booking and contact forms:
   - Select variants that encourage conversion
   - Ensure accessibility and clarity
   - Match overall design language

6. FINALLY: Verify Consistency
   - All variants work together harmoniously
   - No conflicting styles (e.g., minimal + dark overlay)
   - Accessibility maintained (good contrast ratios)
   - EmphasisComponents receive appropriate visual weight

**EXPECTED JSON OUTPUT FORMAT:**
```json
{
  "stylingAnalysis": {
    "hotelType": "luxury",
    "brandPersonality": "elegant",
    "primaryStyleDirection": "Sophisticated with premium presentations",
    "consistencyNotes": "Dark overlays, elevated cards, refined spacing throughout"
  },
  "componentVariants": {
    "hero": {
      "style": "elegant",
      "layout": "split",
      "overlay": "dark",
      "height": "medium"
    },
    "navigation": {
      "navStyle": "glass",
      "navLayout": "default"
    },
    "gallery": {
      "galleryLayout": "masonry",
      "gallerySpacing": "normal",
      "aspectRatio": "landscape",
      "columns": 3
    },
    "rooms": {
      "roomCardStyle": "detailed",
      "imageHeight": "wide"
    },
    "testimonials": {
      "testimonialsLayout": "featured",
      "cardStyle": "elevated"
    },
    "amenities": {
      "amenitiesLayout": "featured",
      "amenitiesColumns": 3,
      "iconSize": "large",
      "iconStyle": "colored"
    },
    "booking": {
      "bookingStyle": "desktop",
      "bookingTheme": "glass"
    },
    "contact": {
      "contactStyle": "floating",
      "contactBackground": "muted"
    }
  },
  "reasoning": "Elegant luxury hotel requires sophisticated styling with dark overlays for premium feel. Featured layouts for testimonials and amenities create visual hierarchy. Glass navigation and booking maintain refined aesthetic."
}
```

**Key Improvements:**
- Component-by-component variant selection
- Consistency verification step
- Styling analysis visible in output
- Clear guidance for each component type
```

### 3. ContentGenerator (Cascade Pattern)

**Current Prompt Structure:**
```markdown
**ANALYSIS INSTRUCTIONS:**
1. Generate content for EACH component in selectedComponents
2. Content must match the brand personality
3. Content must align with hotel type and target audience
```

**SGR-Enhanced Prompt:**
```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: Establish Content Strategy
   - Review brand personality for tone and vocabulary
   - Note hotel type for appropriate pricing and amenities
   - Identify target audience for messaging focus
   - Review componentVariants for content length constraints

2. THEN: Generate Hero Content
   - title/headline: 10-60 characters, compelling and brand-aligned
   - tagline/subtitle: 20-150 characters, expands on value proposition
   - description: Up to 500 characters, sells the experience
   - primaryCTA: Action-oriented (e.g., "Book Now", "Reserve Your Suite")
   - secondaryCTA: Optional, for secondary actions
   - Match tone to brand personality (elegant/modern/friendly/professional/adventurous)

3. THEN: Generate Room Content
   - Generate 3-5 rooms with:
     - name: Descriptive, matches hotel type
     - price: Realistic for hotel type (luxury: $200-500, budget: $50-150)
     - capacity: 1-4 guests per room
     - amenities: 3-5 key features
     - description: 50-500 characters, highlights unique selling points
   - Ensure variety in room types and prices

4. THEN: Generate Testimonials
   - Generate 3-5 testimonials with:
     - customerName: Realistic names
     - customerTitle: Optional, adds credibility
     - rating: 4-5 stars (mostly 5)
     - quote: 20-500 characters, highlights hotel strengths
     - location: Optional, adds authenticity
   - Quotes should reflect target audience perspective

5. THEN: Generate Amenities
   - Generate 8-12 amenities across categories:
     - room: WiFi, Air Conditioning, Mini-bar, Safe, Workspace
     - hotel: Pool, Spa, Gym, Restaurant, Bar, Concierge
     - location: Beach Access, Shopping, Airport Shuttle, Parking
     - services: Room Service, Laundry, Business Center, Event Space
   - Ensure relevance to hotel type

6. THEN: Generate Gallery Content
   - Generate 6-9 images with:
     - alt: Descriptive alt text (5-100 characters)
     - caption: Optional context
     - id: Unique identifier
   - Images should showcase hotel strengths

7. THEN: Generate Contact Form Content
   - title: Professional and welcoming
   - subtitle: Encourages contact
   - submitButtonText: Action-oriented
   - successMessage: Confirmation text

8. FINALLY: Review and Refine
   - All character limits respected
   - Tone consistent across all content
   - Brand personality maintained throughout
   - CTAs are action-oriented and clear
   - Content drives bookings and engagement

**EXPECTED JSON OUTPUT FORMAT:**
```json
{
  "contentStrategy": {
    "brandTone": "Professional and elegant",
    "targetAudience": "Business executives",
    "keyMessages": ["Efficiency", "Premium service", "Convenience"],
    "pricingStrategy": "Premium ($200-500/night)"
  },
  "componentContent": {
    "hero": {
      "title": "The Sterling Executive",
      "headline": "Excellence in Every Detail",
      "tagline": "Where Business Meets Luxury",
      "description": "Sophisticated accommodations designed for the modern business executive.",
      "primaryCTA": {
        "text": "Reserve Your Suite",
        "href": "/rooms"
      },
      "secondaryCTA": {
        "text": "View Amenities",
        "href": "/amenities"
      }
    },
    "rooms": {
      "rooms": [
        {
          "id": "penthouse",
          "name": "Penthouse Suite",
          "type": "Penthouse",
          "price": 500,
          "capacity": 2,
          "amenities": ["Panoramic Views", "Butler Service", "Private Terrace", "Executive Lounge Access"],
          "description": "Ultimate luxury with breathtaking city views and personalized butler service."
        }
      ]
    },
    "testimonials": {
      "testimonials": [
        {
          "id": "t1",
          "customerName": "James Morrison",
          "customerTitle": "CEO, TechCorp",
          "rating": 5,
          "quote": "The Sterling Executive sets the standard for business accommodations. Impeccable service and attention to detail.",
          "location": "New York, NY"
        }
      ]
    },
    "amenities": {
      "amenities": [
        {
          "id": "spa",
          "name": "Rooftop Spa",
          "description": "Full service spa with panoramic views",
          "category": "hotel"
        }
      ]
    },
    "gallery": {
      "images": [
        {
          "id": "g1",
          "src": "placeholder",
          "alt": "Elegant lobby with marble flooring and modern art"
        }
      ]
    },
    "contact": {
      "title": "Contact Our Concierge",
      "submitButtonText": "Send Inquiry",
      "successMessage": "Thank you for your inquiry. Our concierge will respond within 24 hours."
    }
  },
  "reasoning": "Professional, elegant tone targeting business executives with emphasis on premium experience and exclusive amenities. Pricing reflects luxury positioning. Testimonials build credibility with peer endorsements."
}
```

**Key Improvements:**
- Content strategy established first
- Component-by-component content generation
- Character limits explicitly stated
- Brand tone guidance for each section
- Quality review step at end
```

### 4. AssemblyAgent (Routing Pattern)

**Current Prompt Structure:**
```markdown
**ANALYSIS INSTRUCTIONS:**
1. Merge all inputs into complete homepage JSON configuration
2. Ensure proper component ordering
3. Validate all components have required fields
```

**SGR-Enhanced Prompt (Routing + Cycle Pattern):**
```markdown
**ANALYSIS INSTRUCTIONS:**
Follow this EXACT sequence:

1. FIRST: Review All Inputs
   - Verify componentSelection has 5-8 components
   - Verify componentVariants has variants for all components
   - Verify componentContent has content for all components
   - Note layoutStructure and emphasisComponents

2. THEN: Determine Component Order
   Use layoutStructure to determine ordering:
   - Navigation: order 0 (always first)
   - Hero: order 1 (always second)
   - Content components: order 2-5
   - Action components: order 6-7

   For "single-column": Sequential vertical flow
   For "grid": 2-3 column sections
   For "mixed": Full-width + grid sections

3. THEN: Assemble Each Component
   For EACH component in selectedComponents:
   a. Get component type from selectedComponents
   b. Get variants from componentVariants
   c. Get content from componentContent
   d. Merge into complete component object
   e. Assign order based on step 2
   f. Generate placeholder image URLs if missing

   **Repeat for ALL 5-8 components**

4. THEN: Validate Completeness
   - All selectedComponents included
   - Each component has required fields
   - Image URLs follow .webp/.m.webp format
   - Component ordering is logical
   - EmphasisComponents properly marked
   - Total component count within limits (5-8)

5. FINALLY: Determine Validation Status
   - PASS: All required fields present, all images valid URLs, proper ordering
   - WARNING: Minor issues (missing optional fields, placeholder images)
   - FAIL: Missing required fields, invalid URLs, wrong component count

**EXPECTED JSON OUTPUT FORMAT:**
```json
{
  "assemblyReview": {
    "componentCount": 7,
    "layoutStructure": "mixed",
    "emphasisComponents": ["hero", "booking"],
    "imagePlaceholderCount": 5,
    "validationCheck": "All components present with required fields"
  },
  "generationId": "luxury-business-v1",
  "timestamp": "2025-12-05T10:30:00Z",
  "hotelParameters": {
    "hotelType": "luxury",
    "targetAudience": "business",
    "brandPersonality": "professional",
    "hotelName": "The Sterling Executive",
    "location": "Downtown Financial District"
  },
  "components": [
    {
      "type": "navigation",
      "variant": {
        "navStyle": "glass",
        "navLayout": "default"
      },
      "props": {
        "logoText": "The Sterling Executive",
        "navigationLinks": [
          { "text": "Rooms", "href": "/rooms" },
          { "text": "Amenities", "href": "/amenities" }
        ]
      },
      "order": 0
    },
    {
      "type": "hero",
      "variant": {
        "style": "elegant",
        "layout": "split",
        "overlay": "dark",
        "height": "medium"
      },
      "props": {
        "heading": "Excellence in Every Detail",
        "subheading": "Where Business Meets Luxury",
        "primaryCTA": "Reserve Your Suite"
      },
      "order": 1
    }
  ],
  "layoutStructure": "mixed",
  "emphasisComponents": ["hero", "booking"],
  "validationStatus": "PASS"
}
```

**Key Improvements:**
- Routing pattern: Different order strategies for different layouts
- Cycle pattern: Explicit "Repeat for ALL components" instruction
- Assembly review made visible
- Validation status determination as final step
```

---

## Implementation Checklist

### For Each Prompt File

- [ ] Add "Follow this EXACT sequence:" header
- [ ] Number steps with FIRST/THEN/FINALLY
- [ ] Add sub-bullets for each step
- [ ] Include "EXPECTED JSON OUTPUT FORMAT" section
- [ ] Add reasoning step to output schema (if not present)
- [ ] Update examples to match new structure

### File-Specific Changes

**01-component-selector.md:**
- [ ] Add hotelAnalysis to output schema
- [ ] Update ComponentSelectorOutputSchema in schemas.ts
- [ ] Add decision criteria for each step

**02-styling-agent.md:**
- [ ] Add stylingAnalysis to output schema
- [ ] Organize variant selection by component type
- [ ] Add consistency verification step

**03-content-generator.md:**
- [ ] Add contentStrategy to output schema
- [ ] Organize content generation by component
- [ ] Add review and refine step

**04-assembly-agent.md:**
- [ ] Add assemblyReview to output schema
- [ ] Add routing pattern for layout structures
- [ ] Add cycle pattern for component iteration

---

## Testing Strategy

### Before/After Comparison

```typescript
// Test: Prompt effectiveness
describe('SGR Prompt Enhancement', () => {
  it('should improve validation success rate', async () => {
    const oldPrompt = loadPrompt('component-selector-old');
    const newPrompt = loadPrompt('component-selector-sgr');

    const oldResults = await runPromptNTimes(oldPrompt, 100);
    const newResults = await runPromptNTimes(newPrompt, 100);

    const oldSuccessRate = oldResults.filter(r => r.valid).length / 100;
    const newSuccessRate = newResults.filter(r => r.valid).length / 100;

    expect(newSuccessRate).toBeGreaterThan(oldSuccessRate);
    expect(newSuccessRate).toBeGreaterThan(0.90);
  });
});
```

---

## Expected Impact

| Metric | Current | With SGR Prompts | Improvement |
|--------|---------|-----------------|-------------|
| Validation Success | ~80% | ~90% | +10% |
| Output Quality | 8/10 | 8.5/10 | +0.5 |
| Reasoning Visibility | Low | High | ✓ |
| Debuggability | Medium | High | ✓ |

---

**Status:** Ready for Implementation
**Estimated Effort:** 3-5 days
**Dependencies:** None
