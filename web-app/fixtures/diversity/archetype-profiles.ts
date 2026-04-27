/**
 * Archetype Hotel Profiles for Diversity Validation
 *
 * Story 22.2: Generate 12 Hotel Websites (One Per Archetype)
 *
 * Reusable hotel parameter profiles for the 12 visual archetypes defined
 * in the AI-Driven Block Style Diversity Plan.
 *
 * These profiles are used to generate diverse hotel websites for validation.
 *
 * @module web-app/fixtures/diversity/archetype-profiles
 */

import type { HotelParameters } from '@/app/langgraph/agents/schemas';

/**
 * The 12 Hotel Visual Archetypes
 *
 * Source: docs/plans/ai-driven-block-style-diversity-plan.md → Section 3
 */
export interface ArchetypeProfile {
  /**
   * Archetype name (one of 12 visual archetypes)
   */
  archetype: string;

  /**
   * Example hotel name for this archetype
   */
  exampleHotelName: string;

  /**
   * Hotel parameters for generation
   */
  parameters: HotelParameters;
}

/**
 * 12 Archetype Hotel Profiles
 *
 * Each profile represents a unique visual archetype with distinct
 * hotel parameters (type, audience, personality, location).
 */
export const ARCHETYPE_PROFILES: ArchetypeProfile[] = [
  {
    archetype: 'Heritage Opulence',
    exampleHotelName: 'The Pemberton Grand',
    parameters: {
      hotelName: 'The Pemberton Grand',
      hotelType: 'luxury',
      targetAudience: 'couples',
      brandPersonality: 'elegant',
      location: 'London, United Kingdom',
    },
  },
  {
    archetype: 'Quiet Luxury',
    exampleHotelName: 'Haus Minima',
    parameters: {
      hotelName: 'Haus Minima',
      hotelType: 'boutique',
      targetAudience: 'couples',
      brandPersonality: 'modern',
      location: 'Berlin, Germany',
    },
  },
  {
    archetype: 'Boutique Editorial',
    exampleHotelName: 'The Hoxton, Southwark',
    parameters: {
      hotelName: 'The Hoxton, Southwark',
      hotelType: 'boutique',
      targetAudience: 'leisure',
      brandPersonality: 'adventurous',
      location: 'London, United Kingdom',
    },
  },
  {
    archetype: 'Urban Tech-Forward',
    exampleHotelName: 'YOTELAIR Boston Logan',
    parameters: {
      hotelName: 'YOTELAIR Boston Logan',
      hotelType: 'business',
      targetAudience: 'business',
      brandPersonality: 'modern',
      location: 'Boston, Massachusetts, USA',
    },
  },
  {
    archetype: 'Coastal Resort',
    exampleHotelName: 'One&Only Le Saint-Geran',
    parameters: {
      hotelName: 'One&Only Le Saint-Geran',
      hotelType: 'resort',
      targetAudience: 'couples',
      brandPersonality: 'elegant',
      location: 'Bel Ombre, Mauritius',
    },
  },
  {
    archetype: 'Mountain/Wilderness',
    exampleHotelName: 'Explora Atacama',
    parameters: {
      hotelName: 'Explora Atacama',
      hotelType: 'luxury',
      targetAudience: 'leisure',
      brandPersonality: 'adventurous',
      location: 'San Pedro de Atacama, Chile',
    },
  },
  {
    archetype: 'Wellness/Spa',
    exampleHotelName: 'COMO Shambhala Estate',
    parameters: {
      hotelName: 'COMO Shambhala Estate',
      hotelType: 'luxury',
      targetAudience: 'leisure',
      brandPersonality: 'elegant',
      location: 'Ubud, Bali, Indonesia',
    },
  },
  {
    archetype: 'Heritage Cultural',
    exampleHotelName: 'Taj Palace, New Delhi',
    parameters: {
      hotelName: 'Taj Palace, New Delhi',
      hotelType: 'luxury',
      targetAudience: 'business',
      brandPersonality: 'elegant',
      location: 'New Delhi, India',
    },
  },
  {
    archetype: 'Eco Lodge',
    exampleHotelName: '1 Hotel South Beach',
    parameters: {
      hotelName: '1 Hotel South Beach',
      hotelType: 'boutique',
      targetAudience: 'leisure',
      brandPersonality: 'modern',
      location: 'Miami Beach, Florida, USA',
    },
  },
  {
    archetype: 'Design/Art Hotel',
    exampleHotelName: '21c Museum Hotel Nashville',
    parameters: {
      hotelName: '21c Museum Hotel Nashville',
      hotelType: 'boutique',
      targetAudience: 'leisure',
      brandPersonality: 'adventurous',
      location: 'Nashville, Tennessee, USA',
    },
  },
  {
    archetype: 'Family Resort',
    exampleHotelName: 'Club Med Punta Cana',
    parameters: {
      hotelName: 'Club Med Punta Cana',
      hotelType: 'resort',
      targetAudience: 'family',
      brandPersonality: 'friendly',
      location: 'Punta Cana, Dominican Republic',
    },
  },
  {
    archetype: 'Business Hotel',
    exampleHotelName: 'Marriott Marquis San Diego',
    parameters: {
      hotelName: 'Marriott Marquis San Diego',
      hotelType: 'business',
      targetAudience: 'business',
      brandPersonality: 'professional',
      location: 'San Diego, California, USA',
    },
  },
];

/**
 * Get an archetype profile by name
 *
 * @param archetype Archetype name
 * @returns Archetype profile or undefined
 */
export function getArchetypeProfile(archetype: string): ArchetypeProfile | undefined {
  return ARCHETYPE_PROFILES.find((p) => p.archetype === archetype);
}

/**
 * Get all archetype hotel parameters
 *
 * @returns Array of all hotel parameters
 */
export function getAllArchetypeParameters(): HotelParameters[] {
  return ARCHETYPE_PROFILES.map((p) => p.parameters);
}

/**
 * Get archetype name from hotel parameters
 *
 * @param parameters Hotel parameters
 * @returns Archetype name or unknown
 */
export function getArchetypeForParameters(parameters: HotelParameters): string {
  const profile = ARCHETYPE_PROFILES.find(
    (p) =>
      p.parameters.hotelType === parameters.hotelType &&
      p.parameters.targetAudience === parameters.targetAudience &&
      p.parameters.brandPersonality === parameters.brandPersonality
  );

  return profile?.archetype || 'unknown';
}
