/**
 * CVA Variant Map Schema
 * ========================
 *
 * Story 20.8: CVAVariantMap Schema + CVAVariantAgent
 *
 * Zod schema for validating AI-generated CVA variant maps. This schema
 * ensures that archetype-specific Tailwind class strings conform to our
 * design system through semantic token allowlist validation.
 *
 * The variantClasses field uses a Zod refinement that validates every
 * class string against the SEMANTIC_TOKEN_ALLOWLIST from Story 20.7,
 * preventing hallucinated or arbitrary Tailwind utilities.
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 *
 * @module lib/style-generation/schemas/cva-variant-map.schema
 */

import { z } from 'zod';

// Import ArchetypeSchema from Story 20.1
import { ArchetypeSchema } from '../archetype-token-map';

// Import validateSemanticClasses from Story 20.7 for allowlist validation
import { validateSemanticClasses } from '../tailwind-allowlist';

/**
 * CVA Variant Class Strings
 *
 * A Record mapping CVA variant dimension names to Tailwind class strings.
 * Each key is a variant dimension (e.g., "style", "layout", "overlay")
 * and each value is a space-separated string of Tailwind classes.
 *
 * Examples:
 * - { style: "bg-brand-primary text-text-inverted", layout: "flex items-center" }
 * - { cardStyle: "bg-surface-elevated shadow-card rounded-xl" }
 *
 * All class strings are validated against the semantic token allowlist.
 */
export const CVAVariantClassesSchema = z
  .record(z.string(), z.string())
  .refine(
    (variantClasses) => {
      // Validate each class string in the record
      for (const [dimension, classString] of Object.entries(variantClasses)) {
        const validation = validateSemanticClasses(classString);
        if (!validation.valid) {
          console.warn(
            `[CVAVariantMapSchema] Invalid classes in variantClasses["${dimension}"]: ${validation.invalidClasses.join(', ')}`
          );
          return false;
        }
      }
      return true;
    },
    {
      message: 'All class strings must be from the semantic token allowlist defined in Story 20.7',
      path: ['variantClasses'],
    }
  )
  .describe('CVA variant dimension names mapped to Tailwind class strings (all classes must pass semantic allowlist validation)');

/**
 * CVA Variant Map
 *
 * Represents a complete CVA variant configuration for a specific block type
 * and archetype combination. Contains the block type, archetype, design rationale,
 * and variant class mappings.
 *
 * The design rationale field ensures the LLM explains WHY specific class
 * choices were made to express the archetype, preventing generic or mode-collapsed
 * outputs.
 *
 * Cost Target: ~$0.02-0.03 per archetype (8 blocks × class strings)
 * Cacheable: Yes - generate once per archetype, reuse for all hotels
 */
export const CVAVariantMapSchema = z
  .object({
    /**
     * Block Type
     *
     * The component/block type this variant map applies to.
     * Includes all 8 current blocks plus 4 blocks from Epic 19.
     */
    blockType: z.enum([
      'hero',
      'navigation',
      'gallery',
      'testimonials',
      'amenities',
      'rooms',
      'booking',
      'contact',
      'footer',
      'about',
      'faq',
      'features',
    ]).describe('The block/component type this variant map applies to'),

    /**
     * Archetype
     *
     * The hotel visual archetype this variant map is designed for.
     * Uses the shared ArchetypeSchema from Story 20.1 for consistency
     * across all schemas in Epic 20.
     */
    archetype: ArchetypeSchema.describe(
      'The hotel visual archetype this variant map expresses (one of 12)'
    ),

    /**
     * Design Rationale
     *
     * Explanation of WHY the specific class choices express the archetype.
     * This prevents generic filler and ensures thoughtful design decisions.
     *
     * Should reference:
     * - Archetype characteristics (typography, color, spacing, etc.)
     * - How each class choice reinforces the archetype's visual identity
     * - Specific design goals (e.g., "generous whitespace for quiet-luxury", "bold contrast for urban-tech")
     *
     * SGR Cascade Pattern: This field serves a similar purpose to the SGR
     * Cascade fields in HotelDesignTokensSchema - it forces the model to
     * commit to reasoning before generating class strings.
     */
    designRationale: z
      .string()
      .min(30, 'Design rationale must be at least 30 characters to ensure thoughtful consideration')
      .max(
        2000,
        'Design rationale must not exceed 2000 characters to maintain conciseness'
      )
      .describe(
        'Explanation of WHY the class choices express the archetype (min 30 chars, max 2000 chars)'
      ),

    /**
     * Variant Classes
     *
     * Record of CVA variant dimension names to Tailwind class strings.
     * All class strings are validated against the semantic token allowlist.
     *
     * Example for hero block with heritage-opulence archetype:
     * {
     *   style: "bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted",
     *   layout: "grid md:grid-cols-2 gap-hero items-center",
     *   overlay: "before:absolute before:inset-0 before:bg-brand-primary/60",
     *   height: "min-h-hero-md"
     * }
     *
     * The dimensions vary by block type but commonly include:
     * - hero: style, layout, overlay, height
     * - gallery: layout, spacing, aspectRatio, columns, cardStyle
     * - navigation: style, layout
     * - testimonials: layout, columns, cardStyle
     * - amenities: layout, columns, iconSize, iconStyle, cardStyle
     * - rooms: variant, imageHeight
     * - booking: variant, theme
     * - contact: style, background
     * - footer: layout
     * - about: layout, imagePosition, overlay, textAlign
     * - faq: layout
     * - features: layout, columns
     */
    variantClasses: CVAVariantClassesSchema.describe(
      'CVA variant dimension names mapped to Tailwind class strings (all classes validated against semantic allowlist)'
    ),
  })
  .describe('Complete CVA variant configuration for a block type and archetype combination');

/**
 * CVA Variant Map Output Type
 *
 * Inferred type from CVAVariantMapSchema. Use this for type annotations
 * throughout the codebase.
 */
export type CVAVariantMap = z.infer<typeof CVAVariantMapSchema>;

/**
 * CVAVariantMap with validation metadata (for agent output)
 *
 * Extends the base CVAVariantMap with additional fields that track
 * validation results and generation metadata. This is used as the
 * output schema for the CVAVariantAgent.
 */
export const CVAVariantAgentOutputSchema = z
  .object({
    /**
     * The generated CVA variant map
     */
    variantMap: CVAVariantMapSchema,

    /**
     * Validation errors (if any)
     *
     * Populated when allowlist validation fails. Used for graceful
     * degradation and error reporting in the workflow.
     */
    validationErrors: z
      .array(z.string())
      .optional()
      .describe('Validation errors from allowlist checking (if any)'),

    /**
     * Generation metadata
     */
    generatedAt: z
      .string()
      .optional()
      .describe('Timestamp of generation (ISO 8601 format)'),
    usage: z
      .any()
      .optional()
      .describe('LLM usage metadata from the generation call'),
    model: z
      .string()
      .optional()
      .describe('Model name used for generation'),
  })
  .describe('CVAVariantAgent output with validation metadata and generation details');

/**
 * CVAVariantAgent Output Type
 *
 * Inferred type from CVAVariantAgentOutputSchema.
 */
export type CVAVariantAgentOutput = z.infer<typeof CVAVariantAgentOutputSchema>;

/**
 * Block Type Enum
 *
 * Exported as a constant for use in tests and type guards.
 */
export const BLOCK_TYPE_VALUES = [
  'hero',
  'navigation',
  'gallery',
  'testimonials',
  'amenities',
  'rooms',
  'booking',
  'contact',
  'footer',
  'about',
  'faq',
  'features',
] as const;

/**
 * Block Type Enum Schema
 *
 * Zod enum for the 12 block types. Reusable for validation.
 */
export const BlockTypeEnum = z.enum(BLOCK_TYPE_VALUES);
