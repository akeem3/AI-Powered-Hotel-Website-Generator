import { z } from 'zod';

// Import ArchetypeSchema from Story 20.1
import { ArchetypeSchema } from '@/lib/style-generation/archetype-token-map';

// Import content schemas from Story 11.1 for JSON content generation
import { HomepageContentSchema, MediaManifestSchema } from '@/lib/content/schemas';

// Import section wrapper contract from Story 18.5
import { SectionWrapperContract } from '@/lib/contracts/section-wrapper.contract';

// Import HotelDesignTokens from Story 20.1
import { HotelDesignTokensSchema, type HotelDesignTokens } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

// Import CVAVariantAgent from Story 20.8
import {
  CVAVariantAgentOutputSchema,
  type CVAVariantAgentOutput,
  type CVAVariantMap
} from '@/lib/style-generation/schemas/cva-variant-map.schema';

// Import ContrastReport from color module
import type { ContrastReport } from '@/lib/color/types';

// Import PageType from Story 25.1 for pageMetadata type definition
import type { PageType } from '@/lib/generation/split-to-pages';

export const HotelParametersSchema = z.object({
  hotelType: z.enum(["luxury", "budget", "boutique", "resort", "business"]),
  targetAudience: z.enum(["business", "leisure", "family", "couples", "backpackers"]),
  brandPersonality: z.enum(["elegant", "modern", "friendly", "professional", "adventurous"]),
  hotelName: z.string().min(1).max(100),
  location: z.string().min(5).max(200)
});

export type HotelParameters = z.infer<typeof HotelParametersSchema>;

/**
 * ArchetypeClassifier Output Schema
 *
 * Story 20.2: ArchetypeClassifier Agent
 *
 * The ArchetypeClassifier classifies a hotel into one of 12 visual archetypes
 * based on its hotel parameters (hotelType, targetAudience, brandPersonality).
 *
 * The classifier must provide reasoning explaining WHY this archetype was chosen,
 * including consideration of alternative archetypes for ambiguous inputs.
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 */
export const ArchetypeClassifierOutputSchema = z.object({
  /**
   * The classified hotel visual archetype
   * Uses shared ArchetypeSchema from Story 20.1 (DRY principle)
   */
  archetype: ArchetypeSchema.describe('The classified hotel visual archetype (one of 12)'),

  /**
   * Reasoning for the classification
   * Must explain WHY this archetype was chosen over alternatives
   * Minimum 50 characters to ensure thoughtful consideration
   */
  reasoning: z.string().min(50).max(1000).describe(
    'Explanation of why this archetype was chosen, including consideration of alternatives (min 50 chars, max 1000 chars)'
  ),
});

export type ArchetypeClassifierOutput = z.infer<typeof ArchetypeClassifierOutputSchema>;

/**
 * TokenGenerator Output Schema
 *
 * Story 20.3: TokenGenerator Agent + APCA Contrast Retry Loop
 *
 * The TokenGenerator generates archetype-specific OKLCH color tokens,
 * typography, spacing, and border radius selections, then validates
 * them through APCA contrast checking with automatic retry.
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 */
export const TokenGeneratorOutputSchema = z.object({
  /**
   * Generated design tokens with all archetype-specific selections
   * Includes OKLCH colors, typography, spacing, and border radius
   */
  designTokens: HotelDesignTokensSchema.describe('Generated hotel design tokens with OKLCH colors, typography, spacing, and border radius'),

  /**
   * APCA contrast validation report
   * Shows all text/background pair contrast results
   */
  contrastReport: z.object({
    pairs: z.array(z.object({
      foreground: z.string(),
      background: z.string(),
      result: z.object({
        contrast: z.number(),
        passes: z.boolean(),
        level: z.enum(['AAA', 'AA', 'fail']),
      }),
      tokenPair: z.string(),
    })),
    allPass: z.boolean(),
    failCount: z.number(),
  }).describe('APCA contrast validation results for all text/background pairs'),

  /**
   * Retry metadata - tracks APCA retry loop iterations
   * Story 22.2 Fix: Increased max from 10 to 15, added surfaceLightnessAdjustment field
   */
  iterations: z.number().min(0).max(20).default(0).describe('Number of retry iterations performed (max 15 for text, up to 3 for surface)'),
  adjustmentsMade: z.array(z.object({
    field: z.enum(['textLightnessReduction', 'surfaceLightnessAdjustment']),
    originalValue: z.number(),
    adjustment: z.number(), // ±0.05 for text, ±0.02 for surface
    finalValue: z.number(),
  })).describe('Lightness adjustments made during retry loop (Story 22.2: added surfaceLightnessAdjustment)'),
});

export type TokenGeneratorOutput = z.infer<typeof TokenGeneratorOutputSchema>;

// Re-export HotelDesignTokensSchema for TokenGenerator agent
export { HotelDesignTokensSchema } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

export const ComponentSelectorOutputSchema = z.object({
  selectedComponents: z.array(z.enum([
    "hero", "navigation", "rooms", "gallery",
    "testimonials", "amenities", "booking", "contact", "about", "faq", "features", "footer"
  ])).min(5).max(12),  // Story 19.5: Extended to 12 with 4 new blocks
  layoutStructure: z.enum(["single-column", "grid", "mixed"]),
  emphasisComponents: z.array(z.string()).max(3),
  reasoning: z.string().min(50).max(3000)
});

export type ComponentSelectorOutput = z.infer<typeof ComponentSelectorOutputSchema>;

export const StylingAgentOutputSchema = z.object({
  /**
   * Story 20.10: Optional archetype field for archetype-specific variant selection
   * When present, indicates which hotel visual archetype was used for variant selection
   * Uses shared ArchetypeSchema from Story 20.1 (DRY principle)
   */
  archetype: ArchetypeSchema.optional().describe('The hotel visual archetype used for variant selection (one of 12, optional)'),

  componentVariants: z.record(z.string(), z.object({
    // Hero Section variants (Story 20.10: Added archetype variants)
    style: z.enum(["modern", "classic", "minimal", "bold", "elegant", "heritage-opulence", "urban-tech", "coastal-resort"]).optional(),
    layout: z.enum(["centered", "split", "minimal", "heritage-opulence", "urban-tech", "coastal-resort"]).optional(),
    overlay: z.enum(["none", "light", "dark", "gradient", "heritage-opulence"]).optional(),
    height: z.enum(["small", "medium", "large", "fullscreen"]).optional(),

    // Shared & Component Specific variants (Story 20.10: Added archetype variants)
    cardStyle: z.enum(["default", "minimal", "flat", "elevated", "heritage-opulence", "urban-tech"]).optional(),

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

    // Navigation variants (Story 20.10: Added archetype variants)
    navStyle: z.enum(["transparent", "solid", "glass", "heritage-opulence", "urban-tech", "coastal-resort"]).optional(),
    navLayout: z.enum(["classic", "compact", "extended"]).optional(),
    
    // Room Card variants
    roomCardStyle: z.enum(["detailed", "compact", "grid"]).optional(),
    imageHeight: z.enum(["default", "tall", "wide"]).optional(),
    
    // Booking Widget variants
    bookingStyle: z.enum(["desktop", "mobile"]).optional(),
    bookingTheme: z.enum(["light", "dark", "glass"]).optional(),
    
    // Contact Form variants
    contactStyle: z.enum(["default", "minimal", "floating"]).optional(),
    contactBackground: z.enum(["none", "brand", "muted"]).optional(),

    // Footer variants
    footerLayout: z.enum(["classic", "minimal", "stacked"]).optional(),

    // About variants
    aboutLayout: z.enum(["side-by-side", "timeline", "full-width"]).optional(),
    aboutImagePosition: z.enum(["left", "right"]).optional(),
    aboutOverlay: z.enum(["none", "light", "dark", "gradient"]).optional(),
    aboutTextAlign: z.enum(["left", "center"]).optional(),

    // FAQ variants
    faqLayout: z.enum(["accordion", "grid"]).optional(),

    // Features variants
    featuresLayout: z.enum(["icon-grid", "cards"]).optional(),
    featuresColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional()
  }).passthrough()),
  reasoning: z.string().min(50).max(3000)
});

export type StylingAgentOutput = z.infer<typeof StylingAgentOutputSchema>;

/**
 * Page metadata for SEO
 *
 * Story 25.4: ContentGenerator pageMetadata Update
 *
 * Provides SEO metadata (title and description) for each page type
 * in the multi-page website configuration. Used by preview routes
 * and generation scripts to set accurate <title> and <meta description>.
 *
 * ## Page Types
 *
 * Excludes homepage (which uses hero section content).
 * Covers all other static page types: rooms, gallery, amenities, reviews, contact, about, faq.
 *
 * ## SEO Best Practices
 *
 * - Title: 50-60 characters for optimal search display
 * - Description: 100-160 characters for search engine snippets
 * - Hotel-specific content (not hardcoded)
 *
 * ## Example
 *
 * ```ts
 * const pageMetadata: PageMetadata = {
 *   rooms: {
 *     title: 'Luxury Rooms & Suites | The Pemberton Grand',
 *     description: 'Discover our collection of elegantly appointed rooms and suites...'
 *   },
 *   gallery: { ... },
 *   // ... other pages
 * };
 * ```
 *
 * @see docs/epics/epic-25.generation_multi-page-config_ready_2026-03-18.md Story 25.4
 */
export type PageMetadata = Partial<Record<Exclude<PageType, 'homepage' | 'roomDetail'>, {
  /**
   * SEO page title
   * Optimized for 50-60 characters to display fully in search results.
   * Should include hotel name and page-specific keywords.
   *
   * @example "Luxury Rooms & Suites | The Pemberton Grand" (47 chars)
   */
  title: string;

  /**
   * SEO meta description
   * Optimized for 100-160 characters for search engine snippets.
   * Should describe page content and include compelling call-to-action.
   *
   * @example "Discover our collection of elegantly appointed rooms and suites featuring premium amenities and breathtaking views. Book your stay today." (154 chars)
   */
  description: string;
}>>;

export const ContentGeneratorOutputSchema = z.object({
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
    successMessage: z.string().min(10).max(200).optional(),

    // FAQ Content
    faqHeading: z.string().max(200).optional(),
    questions: z.array(z.object({
      question: z.string().min(1).max(200),
      answer: z.string().min(1).max(2000)
    })).min(3).max(15).optional(),

    // Features Content
    featuresHeading: z.string().max(200).optional(),
    features: z.array(z.object({
      title: z.string().min(2).max(100),
      description: z.string().min(10).max(500),
      icon: z.string().optional(),
      image: z.string().optional()
    })).min(2).max(8).optional(),

    // Footer Content
    footerHotelName: z.string().min(1).max(100).optional(),
    footerAddress: z.string().max(200).optional(),
    footerPhone: z.string().max(30).optional(),
    footerEmail: z.string().email().max(100).optional(),
    footerSocialLinks: z.array(z.object({
      platform: z.enum(['facebook','instagram','twitter','tripadvisor','google','linkedin']),
      url: z.string().min(1).max(500)
    })).optional(),
    footerNavigationLinks: z.array(z.object({
      label: z.string().min(1).max(50),
      href: z.string().min(1).max(200)
    })).optional(),

    // About Content
    aboutHeading: z.string().min(1).max(200).optional(),
    aboutContent: z.string().min(1).max(5000).optional(),
    aboutImage: z.string().max(500).optional(),
    aboutHighlights: z.array(z.object({
      label: z.string().min(1).max(50),
      value: z.string().min(1).max(200)
    })).max(4).optional()
  }).passthrough()),

  // NEW for Story 11.6: JSON content files

  // English content (generated by ContentGenerator)
  homepageContentJson: HomepageContentSchema.optional(),

  // Media manifest (locale-agnostic, shared across all languages)
  mediaManifestJson: MediaManifestSchema.optional(),

  // Story 25.4: SEO metadata for each page type
  // Optional field for page-level SEO (title, description)
  // Additive, non-breaking change - existing configs parse unchanged
  // Used by preview routes and generation scripts for accurate meta tags
  pageMetadata: z.object({
    rooms: z.object({
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(160)
    }).optional(),
    gallery: z.object({
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(160)
    }).optional(),
    amenities: z.object({
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(160)
    }).optional(),
    reviews: z.object({
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(160)
    }).optional(),
    contact: z.object({
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(160)
    }).optional(),
    about: z.object({
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(160)
    }).optional(),
    faq: z.object({
      title: z.string().min(10).max(60),
      description: z.string().min(50).max(160)
    }).optional()
  }).optional().describe('SEO metadata for each page type (Story 25.4)'),

  // FUTURE: Epic 13 will add multi-locale support:
  // localizedContent: z.record(z.enum(['en', 'es', 'fr', 'de']), HomepageContentSchema).optional(),
  // Translation will be handled by DeepL API integration
  // Structure designed for additive enhancement - no breaking changes

  reasoning: z.string().min(50).max(3000)
});

export type ContentGeneratorOutput = z.infer<typeof ContentGeneratorOutputSchema>;

export const HomepageConfigSchema = z.object({
  generationId: z.string().regex(/^[a-z0-9-]+-v\d+$/),
  timestamp: z.string().datetime(),
  hotelParameters: HotelParametersSchema,
  components: z.array(z.object({
    type: z.enum(["hero", "navigation", "rooms", "gallery", "testimonials", "amenities", "booking", "contact", "about", "faq", "features", "footer"]),
    variant: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
    props: z.record(z.string(), z.any()),
    order: z.number().min(0),
    // Story 18.5: Optional section wrapper configuration
    // Enables per-component wrapper style (accent, simple, numbered, none)
    // Additive, non-breaking change - existing configs without wrapper field remain valid
    wrapper: SectionWrapperContract.optional()
  })).min(5).max(12),
  layoutStructure: z.enum(["single-column", "grid", "mixed"]),
  emphasisComponents: z.array(z.string()).max(3),
  validationStatus: z.enum(["PASS", "WARNING", "FAIL"]),
  // Story 20: Optional design tokens from TokenGenerator agent
  // Epic 20 dependency - only present when Epic 20 is complete
  // Additive, non-breaking change - allows diversity scoring to work with or without Epic 20
  designTokens: HotelDesignTokensSchema.optional().describe('AI-generated design tokens from TokenGenerator agent (Epic 20) - used for visual diversity scoring')
});

export type HomepageConfig = z.infer<typeof HomepageConfigSchema>;

// Re-export CVAVariantAgent types from Story 20.8 for convenience
export { CVAVariantAgentOutputSchema, type CVAVariantAgentOutput, type CVAVariantMap };
