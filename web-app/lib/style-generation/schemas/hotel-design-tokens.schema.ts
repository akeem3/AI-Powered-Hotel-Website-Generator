/**
 * Hotel Design Tokens Schema
 *
 * Story 20.1: HotelDesignTokens Schema + Archetype Token Map
 *
 * Complete Zod schema for AI-generated hotel design tokens.
 * Validates OKLCH color values, typography, spacing, and border radius
 * with SGR (Style Generation Reasoning) Cascade ordering.
 */

import { z } from 'zod';
import { ArchetypeSchema } from '../archetype-token-map';

/**
 * ColorScheme Schema - OKLCH color values
 */
export const ColorSchemeSchema = z.object({
  primaryHue: z.number().min(0).max(360),
  primaryChroma: z.number().min(0).max(0.4),
  primaryLightness: z.number().min(0.2).max(0.9),
  secondaryHue: z.number().min(0).max(360),
  secondaryChroma: z.number().min(0).max(0.4),
  secondaryLightness: z.number().min(0.2).max(0.9),
  surfaceType: z.enum([
    'warm-white', 'cool-white', 'bone-white', 'cream',
    'off-white', 'raw-linen', 'dark', 'near-black',
    'gallery-white', 'warm-cream', 'cool-grey'
  ]),
  accentStrategy: z.enum(['monochromatic', 'complementary', 'triadic', 'warm-neutral']),
});

export type ColorScheme = z.infer<typeof ColorSchemeSchema>;

/**
 * Typography Schema
 *
 * headingPersonality: 6 variants from typography-mapper.ts TYPOGRAPHY_MAP keys
 * bodyPersonality: 3 variants (subset suitable for body text)
 * scaleRatio: 4 variants from SCALE_RATIO_MULTIPLIERS
 */
export const TypographySchema = z.object({
  headingPersonality: z.enum([
    'serif-elegant', 'serif-readable', 'sans-modern',
    'display-decorative', 'slab-strong', 'humanist-organic'
  ]),
  bodyPersonality: z.enum(['sans-modern', 'serif-readable', 'humanist-organic']),
  scaleRatio: z.enum(['minor-third', 'major-third', 'perfect-fourth', 'golden-ratio']),
});

export type Typography = z.infer<typeof TypographySchema>;

/**
 * Spacing Schema
 *
 * density: 4 variants from spacing-mapper.ts
 */
export const SpacingSchema = z.object({
  density: z.enum(['tight', 'comfortable', 'airy', 'spacious']),
});

export type Spacing = z.infer<typeof SpacingSchema>;

/**
 * BorderRadius Schema
 *
 * style: 4 variants from border-radius-mapper.ts BORDER_RADIUS_MAP keys
 */
export const BorderRadiusSchema = z.object({
  style: z.enum(['sharp', 'subtle', 'rounded', 'pill']),
});

export type BorderRadius = z.infer<typeof BorderRadiusSchema>;

/**
 * SGR Cascade Schema - Style Generation Reasoning fields
 *
 * These reasoning fields MUST appear before style values in the LLM output.
 * This forces the LLM to think about guest persona, emotional intent, etc.
 * before making specific design choices, improving output quality.
 */
export const SGRCascadeSchema = z.object({
  archetype: ArchetypeSchema,
  guestPersona: z.string().min(50),
  emotionalIntent: z.string().min(20),
  architecturalInspiration: z.string().min(10),
  forbiddenElements: z.array(z.string()).min(2).max(5),
});

export type SGRCascade = z.infer<typeof SGRCascadeSchema>;

/**
 * Hotel Design Tokens Schema
 *
 * Full schema with SGR Cascade ordering:
 * 1. Archetype confirmation
 * 2. SGR reasoning fields (guestPersona, emotionalIntent, etc.)
 * 3. Color scheme (OKLCH)
 * 4. Typography
 * 5. Spacing
 * 6. Border radius
 */
export const HotelDesignTokensSchema = z.object({
  // 1. Archetype confirmation
  archetype: ArchetypeSchema,
  // 2. SGR reasoning fields
  guestPersona: z.string().min(50),
  emotionalIntent: z.string().min(20),
  architecturalInspiration: z.string().min(10),
  forbiddenElements: z.array(z.string()).min(2).max(5),
  // 3. Color scheme
  colorScheme: ColorSchemeSchema,
  // 4. Typography
  typography: TypographySchema,
  // 5. Spacing
  spacing: SpacingSchema,
  // 6. Border radius
  borderRadius: BorderRadiusSchema,
});

export type HotelDesignTokens = z.infer<typeof HotelDesignTokensSchema>;
