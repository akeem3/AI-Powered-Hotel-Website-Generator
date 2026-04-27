/**
 * Archetype Token Map
 *
 * Story 20.1: HotelDesignTokens Schema + Archetype Token Map
 *
 * Maps each of the 12 hotel visual archetypes to their token constraints.
 * These constraints guide the TokenGenerator LLM agent to produce
 * archetype-appropriate design tokens.
 *
 * Source: docs/plans/ai-driven-block-style-diversity-plan.md Section 3
 */

import { z } from 'zod';

/**
 * The 12 Hotel Visual Archetypes (kebab-case)
 */
export const ArchetypeSchema = z.enum([
  'heritage-opulence',
  'quiet-luxury',
  'boutique-editorial',
  'urban-tech',
  'coastal-resort',
  'mountain-wilderness',
  'wellness-spa',
  'heritage-cultural',
  'eco-lodge',
  'design-art',
  'family-resort',
  'business-hotel',
]);

export type Archetype = z.infer<typeof ArchetypeSchema>;

/**
 * Archetype token constraint configuration
 */
export interface ArchetypeTokenConfig {
  headingPersonality: string;
  bodyPersonality: string;
  colorTemp: string;
  primaryHueRange: [number, number];
  accentHueRange: [number, number];
  saturation: string;
  surfaceType: string;
  spacingDensity: string;
  borderRadius: string;
  accentStrategy: string;
}

/**
 * Archetype Token Map
 *
 * Maps each archetype to its visual token constraints for LLM guidance.
 */
export const HOTEL_ARCHETYPE_TOKEN_MAP: Record<Archetype, ArchetypeTokenConfig> = {
  'heritage-opulence': {
    headingPersonality: 'serif-elegant',
    bodyPersonality: 'serif-readable',
    colorTemp: 'warm',
    primaryHueRange: [220, 260],
    accentHueRange: [30, 60],
    saturation: 'medium',
    surfaceType: 'warm-cream',
    spacingDensity: 'spacious',
    borderRadius: 'subtle',
    accentStrategy: 'complementary',
  },
  'quiet-luxury': {
    headingPersonality: 'sans-modern',
    bodyPersonality: 'serif-readable',
    colorTemp: 'neutral',
    primaryHueRange: [0, 360],
    accentHueRange: [0, 360],
    saturation: 'low',
    surfaceType: 'gallery-white',
    spacingDensity: 'spacious',
    borderRadius: 'subtle',
    accentStrategy: 'monochromatic',
  },
  'boutique-editorial': {
    headingPersonality: 'display-decorative',
    bodyPersonality: 'sans-modern',
    colorTemp: 'cool',
    primaryHueRange: [0, 360],
    accentHueRange: [0, 360],
    saturation: 'high',
    surfaceType: 'cool-white',
    spacingDensity: 'airy',
    borderRadius: 'sharp',
    accentStrategy: 'triadic',
  },
  'urban-tech': {
    headingPersonality: 'sans-modern',
    bodyPersonality: 'sans-modern',
    colorTemp: 'cool',
    primaryHueRange: [200, 280],
    accentHueRange: [140, 200],
    saturation: 'medium',
    surfaceType: 'cool-grey',
    spacingDensity: 'tight',
    borderRadius: 'sharp',
    accentStrategy: 'monochromatic',
  },
  'coastal-resort': {
    headingPersonality: 'humanist-organic',
    bodyPersonality: 'humanist-organic',
    colorTemp: 'warm',
    primaryHueRange: [170, 220],
    accentHueRange: [30, 60],
    saturation: 'medium',
    surfaceType: 'warm-white',
    spacingDensity: 'airy',
    borderRadius: 'rounded',
    accentStrategy: 'complementary',
  },
  'mountain-wilderness': {
    headingPersonality: 'slab-strong',
    bodyPersonality: 'humanist-organic',
    colorTemp: 'warm',
    primaryHueRange: [80, 160],
    accentHueRange: [20, 50],
    saturation: 'medium-low',
    surfaceType: 'bone-white',
    spacingDensity: 'comfortable',
    borderRadius: 'subtle',
    accentStrategy: 'warm-neutral',
  },
  'wellness-spa': {
    headingPersonality: 'humanist-organic',
    bodyPersonality: 'humanist-organic',
    colorTemp: 'warm',
    primaryHueRange: [120, 180],
    accentHueRange: [30, 60],
    saturation: 'low',
    surfaceType: 'off-white',
    spacingDensity: 'airy',
    borderRadius: 'rounded',
    accentStrategy: 'monochromatic',
  },
  'heritage-cultural': {
    headingPersonality: 'serif-elegant',
    bodyPersonality: 'serif-readable',
    colorTemp: 'warm',
    primaryHueRange: [0, 40],
    accentHueRange: [30, 70],
    saturation: 'medium',
    surfaceType: 'raw-linen',
    spacingDensity: 'comfortable',
    borderRadius: 'subtle',
    accentStrategy: 'warm-neutral',
  },
  'eco-lodge': {
    headingPersonality: 'humanist-organic',
    bodyPersonality: 'humanist-organic',
    colorTemp: 'warm',
    primaryHueRange: [80, 150],
    accentHueRange: [30, 60],
    saturation: 'medium-low',
    surfaceType: 'cream',
    spacingDensity: 'comfortable',
    borderRadius: 'rounded',
    accentStrategy: 'warm-neutral',
  },
  'design-art': {
    headingPersonality: 'display-decorative',
    bodyPersonality: 'sans-modern',
    colorTemp: 'cool',
    primaryHueRange: [0, 360],
    accentHueRange: [0, 360],
    saturation: 'high',
    surfaceType: 'near-black',
    spacingDensity: 'airy',
    borderRadius: 'sharp',
    accentStrategy: 'triadic',
  },
  'family-resort': {
    headingPersonality: 'humanist-organic',
    bodyPersonality: 'humanist-organic',
    colorTemp: 'warm',
    primaryHueRange: [170, 230],
    accentHueRange: [30, 70],
    saturation: 'medium',
    surfaceType: 'warm-white',
    spacingDensity: 'comfortable',
    borderRadius: 'rounded',
    accentStrategy: 'complementary',
  },
  'business-hotel': {
    headingPersonality: 'sans-modern',
    bodyPersonality: 'sans-modern',
    colorTemp: 'cool',
    primaryHueRange: [210, 260],
    accentHueRange: [200, 240],
    saturation: 'medium-low',
    surfaceType: 'cool-white',
    spacingDensity: 'tight',
    borderRadius: 'subtle',
    accentStrategy: 'monochromatic',
  },
};

/**
 * Get all archetype values as an array
 */
export function getAllArchetypes(): Archetype[] {
  return Object.keys(HOTEL_ARCHETYPE_TOKEN_MAP) as Archetype[];
}

/**
 * Get the token configuration for a specific archetype
 * @throws Error if archetype is not valid
 */
export function getArchetypeConfig(archetype: Archetype): ArchetypeTokenConfig {
  const config = HOTEL_ARCHETYPE_TOKEN_MAP[archetype];
  if (!config) {
    throw new Error(`Invalid archetype: ${archetype}. Valid archetypes: ${getAllArchetypes().join(', ')}`);
  }
  return config;
}

/**
 * Check if a value is a valid archetype
 */
export function isValidArchetype(value: unknown): value is Archetype {
  return ArchetypeSchema.safeParse(value).success;
}
