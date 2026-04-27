# Test Content Generator Prompt

## Test Scenario: Luxury Business Hotel

### Agent 1 Output (Component Selection):
```json
{
  "selectedComponents": ["hero", "navigation", "rooms", "gallery", "testimonials", "booking"],
  "layoutStructure": "mixed",
  "emphasisComponents": ["hero", "rooms", "booking"],
  "reasoning": "Luxury business hotel requires premium presentation with visual proof and social credibility"
}
```

### Agent 2 Output (Component Variants):
```json
{
  "componentVariants": {
    "hero": {
      "style": "elegant",
      "layout": "split",
      "overlay": "dark",
      "height": "medium"
    },
    "navigation": {
      "navStyle": "classic",
      "navLayout": "split"
    },
    "rooms": {
      "roomCardStyle": "detailed",
      "imageHeight": "large"
    },
    "gallery": {
      "galleryLayout": "masonry",
      "gallerySpacing": "normal",
      "aspectRatio": "landscape",
      "columns": 3
    },
    "testimonials": {
      "testimonialsLayout": "featured",
      "cardStyle": "elevated"
    },
    "booking": {
      "bookingStyle": "featured",
      "bookingTheme": "brand"
    }
  },
  "reasoning": "Selected elegant and professional variants to match luxury business hotel positioning"
}
```

### Hotel Parameters:
- Hotel Name: The Sterling Executive
- Type: luxury
- Target Audience: business
- Brand Personality: elegant
- Location: Financial District, New York

## Expected Output Structure:

The Content Generator should produce JSON with content for:
1. **hero** - Elegant headline, sophisticated tagline, premium-focused CTAs
2. **rooms** - 3-5 luxury rooms with business amenities, $300-500 pricing
3. **gallery** - 6-9 professional images with business-focused descriptions
4. **testimonials** - 3-5 testimonials from business professionals
5. **booking** - Not needed as it's handled by the BookingWidget component

## Validation Checklist:
- [ ] All selected components have content
- [ ] Character limits respected (title: 1-100, headline: 1-200, description: max 500)
- [ ] Room prices between $200-500 for luxury
- [ ] Testimonials have 4-5 star ratings
- [ ] CTAs are action-oriented ("Reserve Your Suite" not "Click Here")
- [ ] Brand personality consistent (elegant vocabulary)
- [ ] JSON structure matches ZOD schema