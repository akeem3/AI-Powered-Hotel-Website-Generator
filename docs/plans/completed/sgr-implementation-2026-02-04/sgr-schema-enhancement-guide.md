# SGR Schema Enhancement Guide

**Date:** 2026-02-03
**Component:** ZOD Schemas
**Priority:** Medium (Phase 3)
**Related File:** [`web-app/app/langgraph/agents/schemas.ts`](../../web-app/app/langgraph/agents/schemas.ts)

---

## Purpose

Enhance ZOD schemas to include explicit reasoning steps, improving debuggability and making the LLM's reasoning process visible and verifiable.

---

## Overview

### Current Schema Structure

Current schemas focus on **output only**:

```typescript
const ComponentSelectorOutputSchema = z.object({
  selectedComponents: z.array(z.string()),
  layoutStructure: z.enum([...]),
  emphasisComponents: z.array(z.string()),
  reasoning: z.string()
});
```

### SGR-Enhanced Schema Structure

SGR-enhanced schemas include **reasoning steps**:

```typescript
const ComponentSelectorOutputSchema = z.object({
  // Step 1: Analysis
  analysis: z.object({
    hotelType: z.string(),
    audienceNeeds: z.string(),
    brandAssessment: z.string()
  }),

  // Step 2: Output
  selectedComponents: z.array(z.string()),
  layoutStructure: z.enum([...]),
  emphasisComponents: z.array(z.string()),

  // Step 3: Rationale
  reasoning: z.string()
});
```

---

## Schema Enhancements

### 1. ComponentSelectorOutputSchema

**Current Schema:**
```typescript
export const ComponentSelectorOutputSchema = z.object({
  selectedComponents: z.array(z.enum([
    "hero", "navigation", "rooms", "gallery",
    "testimonials", "amenities", "booking", "contact"
  ])).min(5).max(8),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]),
  emphasisComponents: z.array(z.string()).max(3),
  reasoning: z.string().min(50).max(3000)
});
```

**SGR-Enhanced Schema:**
```typescript
/**
 * Step 1: Hotel Analysis
 * Explicit reasoning about hotel characteristics
 */
const HotelAnalysisSchema = z.object({
  hotelType: z.enum(["luxury", "budget", "boutique", "resort", "business"]),
  audienceNeeds: z.string().min(20).max(500).describe(
    "Description of what the target audience needs from a hotel website"
  ),
  brandAssessment: z.string().min(20).max(500).describe(
    "Assessment of how brand personality should influence component selection"
  ),
  specialConsiderations: z.string().max(300).optional().describe(
    "Any special considerations based on location or unique hotel features"
  )
});

/**
 * Step 2: Component Selection
 * The actual component selections
 */
const ComponentSelectionSchema = z.object({
  selectedComponents: z.array(z.enum([
    "hero", "navigation", "rooms", "gallery",
    "testimonials", "amenities", "booking", "contact"
  ])).min(5).max(8).describe(
    "5-8 components selected from the catalog. hero and navigation MUST be included."
  ),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]).describe(
    "single-column: Simple focused presentation | grid: Multiple options showcase | mixed: Premium layouts"
  ),
  emphasisComponents: z.array(z.string()).max(3).describe(
    "Up to 3 components for prominent placement, prioritized for conversion"
  )
});

/**
 * Step 3: Rationale
 * Explanation of choices
 */
const SelectionRationaleSchema = z.object({
  reasoning: z.string().min(50).max(3000).describe(
    "Explanation of component choices based on hotel type, audience, and brand personality"
  ),
  componentRationale: z.record(z.string(), z.string().min(20).max(300)).optional().describe(
    "Specific rationale for each selected component"
  )
});

/**
 * Complete ComponentSelector output with SGR reasoning steps
 */
export const ComponentSelectorOutputSchema = z.object({
  // Step 1: Analysis
  analysis: HotelAnalysisSchema,

  // Step 2: Selection
  selection: ComponentSelectionSchema,

  // Step 3: Rationale
  rationale: SelectionRationaleSchema
});

// For backward compatibility, provide a flattened view
export const ComponentSelectorOutputSchemaFlat = z.object({
  selectedComponents: z.array(z.enum([
    "hero", "navigation", "rooms", "gallery",
    "testimonials", "amenities", "booking", "contact"
  ])).min(5).max(8),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]),
  emphasisComponents: z.array(z.string()).max(3),
  reasoning: z.string().min(50).max(3000)
});
```

### 2. StylingAgentOutputSchema

**Current Schema:**
```typescript
export const StylingAgentOutputSchema = z.object({
  componentVariants: z.record(z.string(), z.object({
    // Variant definitions...
  }).passthrough()),
  reasoning: z.string().min(50).max(3000)
});
```

**SGR-Enhanced Schema:**
```typescript
/**
 * Step 1: Styling Analysis
 */
const StylingAnalysisSchema = z.object({
  hotelType: z.enum(["luxury", "budget", "boutique", "resort", "business"]),
  brandPersonality: z.enum(["elegant", "modern", "friendly", "professional", "adventurous"]),
  primaryStyleDirection: z.string().min(20).max(300).describe(
    "Overall style direction based on hotel type and brand personality"
  ),
  consistencyNotes: z.string().min(20).max(500).describe(
    "Notes on maintaining consistency across components"
  ),
  emphasisStrategy: z.string().max(300).optional().describe(
    "How emphasis components will receive visual weight"
  )
});

/**
 * Step 2: Variant Selection
 */
const VariantSelectionSchema = z.object({
  componentVariants: z.record(z.string(), z.object({
    // Hero Section variants
    style: z.enum(["modern", "classic", "minimal", "bold", "elegant"]).optional(),
    layout: z.enum(["centered", "split", "fullscreen"]).optional(),
    overlay: z.enum(["none", "light", "dark", "gradient"]).optional(),
    height: z.enum(["small", "medium", "large", "fullscreen"]).optional(),

    // Shared & Component Specific variants
    cardStyle: z.enum(["default", "minimal", "flat", "elevated"]).optional(),

    // Gallery variants
    galleryLayout: z.enum(["grid", "masonry", "carousel"]).optional(),
    gallerySpacing: z.enum(["tight", "normal", "loose"]).optional(),
    aspectRatio: z.enum(["square", "landscape", "portrait"]).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),

    // Testimonials variants
    testimonialsLayout: z.enum(["carousel", "grid", "featured"]).optional(),
    testimonialsColumns: z.union([z.literal(2), z.literal(3)]).optional(),

    // Amenities variants
    amenitiesLayout: z.enum(["grid", "list", "featured"]).optional(),
    amenitiesColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    iconSize: z.enum(["small", "medium", "large"]).optional(),
    iconStyle: z.enum(["default", "muted", "colored"]).optional(),

    // Navigation variants
    navStyle: z.enum(["transparent", "solid", "glass"]).optional(),
    navLayout: z.enum(["default", "compact", "tall"]).optional(),

    // Room Card variants
    roomCardStyle: z.enum(["detailed", "compact", "grid"]).optional(),
    imageHeight: z.enum(["default", "tall", "wide"]).optional(),

    // Booking Widget variants
    bookingStyle: z.enum(["desktop", "mobile"]).optional(),
    bookingTheme: z.enum(["light", "dark", "glass"]).optional(),

    // Contact Form variants
    contactStyle: z.enum(["default", "minimal", "floating"]).optional(),
    contactBackground: z.enum(["none", "brand", "muted"]).optional()
  }).passthrough())
});

/**
 * Step 3: Styling Rationale
 */
const StylingRationaleSchema = z.object({
  reasoning: z.string().min(50).max(3000).describe(
    "Explanation of variant choices based on hotel characteristics and brand personality"
  ),
  variantRationale: z.record(z.string(), z.string().min(20).max(300)).optional().describe(
    "Specific rationale for key variant choices"
  )
});

/**
 * Complete StylingAgent output with SGR reasoning steps
 */
export const StylingAgentOutputSchema = z.object({
  // Step 1: Analysis
  analysis: StylingAnalysisSchema,

  // Step 2: Selection
  variants: VariantSelectionSchema,

  // Step 3: Rationale
  rationale: StylingRationaleSchema
});
```

### 3. ContentGeneratorOutputSchema

**Current Schema:**
```typescript
export const ContentGeneratorOutputSchema = z.object({
  componentContent: z.record(z.string(), z.object({
    // Content fields...
  }).passthrough()),
  reasoning: z.string().min(50).max(3000)
});
```

**SGR-Enhanced Schema:**
```typescript
/**
 * Step 1: Content Strategy
 */
const ContentStrategySchema = z.object({
  brandTone: z.string().min(10).max(100).describe(
    "Tone description based on brand personality"
  ),
  targetAudience: z.string().min(10).max(100).describe(
    "Primary audience for content messaging"
  ),
  keyMessages: z.array(z.string().min(5).max(50)).min(3).max(5).describe(
    "3-5 key messages to emphasize throughout content"
  ),
  pricingStrategy: z.string().min(10).max(100).describe(
    "Pricing approach based on hotel type"
  ),
  vocabulary: z.array(z.string()).min(5).max(10).optional().describe(
    "Key vocabulary words to use based on brand personality"
  )
});

/**
 * Step 2: Component Content
 */
const ComponentContentSchema = z.object({
  componentContent: z.record(z.string(), z.object({
    // Hero Section Content
    title: z.string().min(1).max(100).optional(),
    tagline: z.string().max(200).optional(),
    subtitle: z.string().max(200).optional(),
    headline: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    primaryCTA: z.object({
      text: z.string().min(1).max(50),
      href: z.string().min(1).max(200),
      ariaLabel: z.string().optional()
    }).optional(),
    secondaryCTA: z.object({
      text: z.string().min(1).max(50),
      href: z.string().min(1).max(200),
      ariaLabel: z.string().optional()
    }).optional(),
    image: z.string().optional(),

    // Room Cards Content
    rooms: z.array(z.object({
      id: z.string(),
      name: z.string().min(1).max(100),
      type: z.string(),
      price: z.number().positive(),
      capacity: z.number().positive().max(10),
      amenities: z.array(z.string()).optional(),
      image: z.string().optional(),
      description: z.string().max(500).optional()
    })).optional(),

    // Testimonials Content
    testimonials: z.array(z.object({
      id: z.string(),
      customerName: z.string().min(2).max(50),
      customerTitle: z.string().max(50).optional(),
      rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
      quote: z.string().min(20).max(500),
      date: z.string().optional(),
      location: z.string().max(50).optional()
    })).optional(),

    // Amenities Content
    amenities: z.array(z.object({
      id: z.string(),
      name: z.string().min(2).max(30),
      description: z.string().max(100).optional(),
      icon: z.string().optional(),
      category: z.enum(["room", "hotel", "location", "services"]).optional()
    })).optional(),

    // Gallery Content
    images: z.array(z.object({
      id: z.string(),
      src: z.string(),
      alt: z.string().min(5).max(100),
      caption: z.string().max(200).optional()
    })).optional(),

    // Contact Form Content
    submitButtonText: z.string().min(5).max(30).optional(),
    successMessage: z.string().min(10).max(200).optional()
  }).passthrough())
});

/**
 * Step 3: Content Rationale
 */
const ContentRationaleSchema = z.object({
  reasoning: z.string().min(50).max(3000).describe(
    "Explanation of content choices based on hotel characteristics and brand personality"
  ),
  toneAlignment: z.string().min(20).max(500).describe(
    "How content aligns with brand personality"
  ),
  audienceFit: z.string().min(20).max(500).optional().describe(
    "How content addresses target audience needs"
  )
});

/**
 * Complete ContentGenerator output with SGR reasoning steps
 */
export const ContentGeneratorOutputSchema = z.object({
  // Step 1: Strategy
  strategy: ContentStrategySchema,

  // Step 2: Content
  content: ComponentContentSchema,

  // Step 3: Rationale
  rationale: ContentRationaleSchema
});
```

### 4. HomepageConfigSchema (Assembly Output)

**Current Schema:**
```typescript
export const HomepageConfigSchema = z.object({
  generationId: z.string().regex(/^[a-z-]+-v\d+$/),
  timestamp: z.string().datetime(),
  hotelParameters: HotelParametersSchema,
  components: z.array(z.object({
    type: z.enum([...]),
    variant: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    props: z.record(z.string(), z.any()),
    order: z.number().min(0)
  })).min(5).max(8),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]),
  emphasisComponents: z.array(z.string()).max(3),
  validationStatus: z.enum(["PASS", "WARNING", "FAIL"])
});
```

**SGR-Enhanced Schema:**
```typescript
/**
 * Step 1: Assembly Review
 */
const AssemblyReviewSchema = z.object({
  componentCount: z.number().min(5).max(8).describe(
    "Total number of components assembled"
  ),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]).describe(
    "Layout structure used for component ordering"
  ),
  emphasisComponents: z.array(z.string()).max(3).describe(
    "Components marked for emphasis"
  ),
  imagePlaceholderCount: z.number().describe(
    "Number of placeholder images generated"
  ),
  validationCheck: z.string().min(20).max(500).describe(
    "Summary of validation checks performed"
  ),
  assemblyNotes: z.string().max(500).optional().describe(
    "Any notes about the assembly process"
  )
});

/**
 * Complete Assembly output with SGR reasoning steps
 */
export const HomepageConfigSchema = z.object({
  // Step 1: Review
  review: AssemblyReviewSchema,

  // Step 2: Configuration
  generationId: z.string().regex(/^[a-z-]+-v\d+$/),
  timestamp: z.string().datetime(),
  hotelParameters: HotelParametersSchema,
  components: z.array(z.object({
    type: z.enum(["hero", "navigation", "rooms", "gallery", "testimonials", "amenities", "booking", "contact"]),
    variant: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    props: z.record(z.string(), z.any()),
    order: z.number().min(0)
  })).min(5).max(8),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]),
  emphasisComponents: z.array(z.string()).max(3),

  // Step 3: Validation
  validationStatus: z.enum(["PASS", "WARNING", "FAIL"]),
  validationErrors: z.array(z.string()).optional().describe(
    "List of validation errors if status is WARNING or FAIL"
  )
});
```

---

## Backward Compatibility Strategy

### Option 1: Parallel Schemas

Maintain both old and new schemas:

```typescript
// Old schema (for backward compatibility)
export const ComponentSelectorOutputSchemaLegacy = z.object({
  selectedComponents: z.array(z.string()),
  layoutStructure: z.enum([...]),
  emphasisComponents: z.array(z.string()),
  reasoning: z.string()
});

// New SGR-enhanced schema
export const ComponentSelectorOutputSchema = z.object({
  analysis: HotelAnalysisSchema,
  selection: ComponentSelectionSchema,
  rationale: SelectionRationaleSchema
});

// Utility to flatten new schema to old format
export function flattenComponentSelectorOutput(
  sgrOutput: z.infer<typeof ComponentSelectorOutputSchema>
): z.infer<typeof ComponentSelectorOutputSchemaLegacy> {
  return {
    selectedComponents: sgrOutput.selection.selectedComponents,
    layoutStructure: sgrOutput.selection.layoutStructure,
    emphasisComponents: sgrOutput.selection.emphasisComponents,
    reasoning: sgrOutput.rationale.reasoning
  };
}
```

### Option 2: Feature Flag

Use feature flag to switch between schemas:

```typescript
export function getComponentSelectorSchema() {
  if (process.env.FEATURE_SGR_SCHEMA === 'true') {
    return ComponentSelectorOutputSchemaSGREnhanced;
  }
  return ComponentSelectorOutputSchemaLegacy;
}
```

### Recommendation

**Use Option 1 (Parallel Schemas)** for gradual migration:
1. Implement new schemas alongside old ones
2. Update agents to use new schemas
3. Add transformation layer for downstream consumers
4. Deprecate old schemas after validation

---

## Implementation Checklist

### Schema Changes
- [ ] Create HotelAnalysisSchema
- [ ] Create StylingAnalysisSchema
- [ ] Create ContentStrategySchema
- [ ] Create AssemblyReviewSchema
- [ ] Update ComponentSelectorOutputSchema
- [ ] Update StylingAgentOutputSchema
- [ ] Update ContentGeneratorOutputSchema
- [ ] Update HomepageConfigSchema

### Agent Updates
- [ ] Update ComponentSelector to use new schema
- [ ] Update StylingAgent to use new schema
- [ ] Update ContentGenerator to use new schema
- [ ] Update AssemblyAgent to use new schema
- [ ] Add transformation utilities for backward compatibility

### Testing
- [ ] Update unit tests for new schemas
- [ ] Update integration tests
- [ ] Test backward compatibility layer
- [ ] Measure quality improvements

---

## Expected Impact

| Benefit | Impact |
|---------|--------|
| **Debuggability** | Reasoning steps visible in logs |
| **Quality** | +5-10% output quality improvement |
| **Transparency** | Clear audit trail of decisions |
| **Validation** | Earlier error detection (step-level) |
| **Maintenance** | Easier to understand failures |

---

**Status:** Ready for Implementation (Phase 3)
**Estimated Effort:** 3-4 days
**Dependencies:** Phase 1 (Validation Retry) and Phase 2 (Prompt Enhancement) should be implemented first
