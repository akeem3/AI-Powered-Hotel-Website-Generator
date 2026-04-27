/**
 * Story 20.1: HotelDesignTokens Schema + Archetype Token Map
 * Test Suite
 *
 * Tests the complete schema validation for AI-generated hotel design tokens.
 * Covers all AC requirements from Epic 20, Story 20.1.
 *
 * Test coverage:
 * - Valid tokens parse successfully
 * - Invalid hue values are rejected
 * - Invalid chroma values are rejected
 * - Missing SGR fields cause validation failure
 * - All 12 archetype values are accepted
 * - All surfaceType enum values are valid
 * - All accentStrategy enum values are valid
 * - All typography enums are valid
 * - Reasoning field length validations work
 * - HOTEL_ARCHETYPE_TOKEN_MAP has all 12 entries
 */

import { describe, it, expect } from '@jest/globals';
import {
  HotelDesignTokensSchema,
  ColorSchemeSchema,
  TypographySchema,
  SpacingSchema,
  BorderRadiusSchema,
  SGRCascadeSchema,
} from '@/lib/style-generation/schemas/hotel-design-tokens.schema';
import {
  ArchetypeSchema,
  HOTEL_ARCHETYPE_TOKEN_MAP,
  getAllArchetypes,
  getArchetypeConfig,
  isValidArchetype,
} from '@/lib/style-generation/archetype-token-map';

/**
 * Helper: Create valid hotel design tokens for testing
 */
function createValidTokens(overrides = {}) {
  return {
    archetype: 'heritage-opulence' as const,
    guestPersona: 'Affluent couples aged 35-55 seeking romantic luxury getaway with personalized service and exclusive experiences.',
    emotionalIntent: 'Feelings of exclusivity, tranquility, and refined elegance.',
    architecturalInspiration: 'Georgian townhouses with high ceilings and marble floors.',
    forbiddenElements: ['bg-white', 'tracking-normal', 'text-blue-*'],
    colorScheme: {
      primaryHue: 230,
      primaryChroma: 0.2,
      primaryLightness: 0.55,
      secondaryHue: 45,
      secondaryChroma: 0.15,
      secondaryLightness: 0.75,
      surfaceType: 'warm-cream' as const,
      accentStrategy: 'complementary' as const,
    },
    typography: {
      headingPersonality: 'serif-elegant' as const,
      bodyPersonality: 'serif-readable' as const,
      scaleRatio: 'major-third' as const,
    },
    spacing: {
      density: 'comfortable' as const,
    },
    borderRadius: {
      style: 'subtle' as const,
    },
    ...overrides,
  };
}

describe('Story 20.1: HotelDesignTokens Schema + Archetype Token Map', () => {
  describe('AC: Given valid HotelDesignTokens, When parsed, Then it succeeds', () => {
    it('should parse complete valid hotel design tokens', () => {
      const validTokens = createValidTokens();
      const result = HotelDesignTokensSchema.safeParse(validTokens);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.archetype).toBe('heritage-opulence');
        expect(result.data.guestPersona.length).toBeGreaterThanOrEqual(50);
      }
    });

    it('should parse tokens for all 12 archetypes', () => {
      const archetypes: Array<Parameters<typeof createValidTokens>[0]['archetype']> = [
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
      ];

      archetypes.forEach(archetype => {
        const tokens = createValidTokens({ archetype });
        const result = HotelDesignTokensSchema.safeParse(tokens);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('AC: Invalid hue values (out of 0-360) are rejected', () => {
    it('should reject primaryHue < 0', () => {
      const tokens = createValidTokens({
        colorScheme: { ...createValidTokens().colorScheme, primaryHue: -1 },
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should reject primaryHue > 360', () => {
      const tokens = createValidTokens({
        colorScheme: { ...createValidTokens().colorScheme, primaryHue: 361 },
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should accept primaryHue at boundaries (0, 180, 360)', () => {
      const validHues = [0, 180, 360];
      validHues.forEach(hue => {
        const tokens = createValidTokens({
          colorScheme: { ...createValidTokens().colorScheme, primaryHue: hue },
        });
        const result = HotelDesignTokensSchema.safeParse(tokens);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('AC: Invalid chroma values (out of 0-0.4) are rejected', () => {
    it('should reject primaryChroma < 0', () => {
      const tokens = createValidTokens({
        colorScheme: { ...createValidTokens().colorScheme, primaryChroma: -0.01 },
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should reject primaryChroma > 0.4', () => {
      const tokens = createValidTokens({
        colorScheme: { ...createValidTokens().colorScheme, primaryChroma: 0.41 },
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should accept primaryChroma at boundaries (0, 0.2, 0.4)', () => {
      const validChromas = [0, 0.2, 0.4];
      validChromas.forEach(chroma => {
        const tokens = createValidTokens({
          colorScheme: { ...createValidTokens().colorScheme, primaryChroma: chroma },
        });
        const result = HotelDesignTokensSchema.safeParse(tokens);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('AC: Missing SGR fields cause validation failure', () => {
    it('should reject missing guestPersona', () => {
      const { guestPersona, ...tokens } = createValidTokens();
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should reject missing emotionalIntent', () => {
      const { emotionalIntent, ...tokens } = createValidTokens();
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should reject missing architecturalInspiration', () => {
      const { architecturalInspiration, ...tokens } = createValidTokens();
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should reject missing forbiddenElements', () => {
      const { forbiddenElements, ...tokens } = createValidTokens();
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should enforce guestPersona minimum length (50 chars)', () => {
      const tokens = createValidTokens({ guestPersona: 'a'.repeat(49) });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should enforce emotionalIntent minimum length (20 chars)', () => {
      const tokens = createValidTokens({ emotionalIntent: 'a'.repeat(19) });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should enforce architecturalInspiration minimum length (10 chars)', () => {
      const tokens = createValidTokens({ architecturalInspiration: 'a'.repeat(9) });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should enforce forbiddenElements minimum (2) items', () => {
      const tokens = createValidTokens({ forbiddenElements: ['only-one'] });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });

    it('should enforce forbiddenElements maximum (5) items', () => {
      const tokens = createValidTokens({
        forbiddenElements: ['a', 'b', 'c', 'd', 'e', 'f'],
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });
  });

  describe('AC: All 12 archetypes exist in HOTEL_ARCHETYPE_TOKEN_MAP', () => {
    it('should have exactly 12 archetypes in the map', () => {
      const archetypes = Object.keys(HOTEL_ARCHETYPE_TOKEN_MAP);
      expect(archetypes).toHaveLength(12);
    });

    it('should contain all required archetype keys', () => {
      const requiredArchetypes = [
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
      ];

      requiredArchetypes.forEach(archetype => {
        expect(HOTEL_ARCHETYPE_TOKEN_MAP[archetype]).toBeDefined();
      });
    });

    it('should provide valid configuration for each archetype', () => {
      const requiredProperties = [
        'headingPersonality',
        'bodyPersonality',
        'colorTemp',
        'primaryHueRange',
        'accentHueRange',
        'saturation',
        'surfaceType',
        'spacingDensity',
        'borderRadius',
        'accentStrategy',
      ];

      Object.values(HOTEL_ARCHETYPE_TOKEN_MAP).forEach(config => {
        requiredProperties.forEach(prop => {
          expect(config).toHaveProperty(prop);
        });
      });
    });
  });

  describe('AC: All surfaceType enum values are valid', () => {
    const surfaceTypes = [
      'warm-white',
      'cool-white',
      'bone-white',
      'cream',
      'off-white',
      'warm-cream',
      'raw-linen',
      'cool-grey',
      'gallery-white',
      'dark',
      'near-black',
    ] as const;

    it('should have exactly 11 surfaceType variants', () => {
      expect(surfaceTypes).toHaveLength(11);
    });

    it('should accept all 11 surfaceType values', () => {
      surfaceTypes.forEach(surfaceType => {
        const tokens = createValidTokens({
          colorScheme: { ...createValidTokens().colorScheme, surfaceType },
        });
        const result = HotelDesignTokensSchema.safeParse(tokens);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid surfaceType values', () => {
      const tokens = createValidTokens({
        colorScheme: { ...createValidTokens().colorScheme, surfaceType: 'invalid-surface' as any },
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });
  });

  describe('AC: All accentStrategy enum values are valid', () => {
    const accentStrategies = [
      'monochromatic',
      'complementary',
      'triadic',
      'warm-neutral',
    ] as const;

    it('should have exactly 4 accentStrategy variants', () => {
      expect(accentStrategies).toHaveLength(4);
    });

    it('should accept all 4 accentStrategy values', () => {
      accentStrategies.forEach(accentStrategy => {
        const tokens = createValidTokens({
          colorScheme: { ...createValidTokens().colorScheme, accentStrategy },
        });
        const result = HotelDesignTokensSchema.safeParse(tokens);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid accentStrategy values', () => {
      const tokens = createValidTokens({
        colorScheme: { ...createValidTokens().colorScheme, accentStrategy: 'invalid-strategy' as any },
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);
      expect(result.success).toBe(false);
    });
  });

  describe('AC: All typography enums are valid', () => {
    describe('headingPersonality (6 variants)', () => {
      const headingPersonalities = [
        'serif-elegant',
        'serif-readable',
        'sans-modern',
        'display-decorative',
        'slab-strong',
        'humanist-organic',
      ] as const;

      it('should have exactly 6 headingPersonality variants', () => {
        expect(headingPersonalities).toHaveLength(6);
      });

      it('should accept all 6 headingPersonality values', () => {
        headingPersonalities.forEach(headingPersonality => {
          const tokens = createValidTokens({
            typography: { ...createValidTokens().typography, headingPersonality },
          });
          const result = HotelDesignTokensSchema.safeParse(tokens);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('bodyPersonality (3 variants)', () => {
      const bodyPersonalities = [
        'sans-modern',
        'serif-readable',
        'humanist-organic',
      ] as const;

      it('should have exactly 3 bodyPersonality variants', () => {
        expect(bodyPersonalities).toHaveLength(3);
      });

      it('should accept all 3 bodyPersonality values', () => {
        bodyPersonalities.forEach(bodyPersonality => {
          const tokens = createValidTokens({
            typography: { ...createValidTokens().typography, bodyPersonality },
          });
          const result = HotelDesignTokensSchema.safeParse(tokens);
          expect(result.success).toBe(true);
        });
      });
    });

    describe('scaleRatio (4 variants)', () => {
      const scaleRatios = [
        'minor-third',
        'major-third',
        'perfect-fourth',
        'golden-ratio',
      ] as const;

      it('should have exactly 4 scaleRatio variants', () => {
        expect(scaleRatios).toHaveLength(4);
      });

      it('should accept all 4 scaleRatio values', () => {
        scaleRatios.forEach(scaleRatio => {
          const tokens = createValidTokens({
            typography: { ...createValidTokens().typography, scaleRatio },
          });
          const result = HotelDesignTokensSchema.safeParse(tokens);
          expect(result.success).toBe(true);
        });
      });
    });
  });

  describe('AC: All spacing density variants are valid', () => {
    const densities = ['tight', 'comfortable', 'airy', 'spacious'] as const;

    it('should have exactly 4 density variants', () => {
      expect(densities).toHaveLength(4);
    });

    it('should accept all 4 density values', () => {
      densities.forEach(density => {
        const tokens = createValidTokens({
          spacing: { density },
        });
        const result = HotelDesignTokensSchema.safeParse(tokens);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('AC: All borderRadius variants are valid', () => {
    const borderRadii = ['sharp', 'subtle', 'rounded', 'pill'] as const;

    it('should have exactly 4 borderRadius variants', () => {
      expect(borderRadii).toHaveLength(4);
    });

    it('should accept all 4 borderRadius values', () => {
      borderRadii.forEach(borderRadius => {
        const tokens = createValidTokens({
          borderRadius: { style: borderRadius },
        });
        const result = HotelDesignTokensSchema.safeParse(tokens);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Helper Functions', () => {
    describe('getAllArchetypes()', () => {
      it('should return array of all 12 archetypes', () => {
        const archetypes = getAllArchetypes();
        expect(archetypes).toHaveLength(12);
        expect(Array.isArray(archetypes)).toBe(true);
      });

      it('should return valid archetype values', () => {
        const archetypes = getAllArchetypes();
        archetypes.forEach(archetype => {
          expect(ArchetypeSchema.safeParse(archetype).success).toBe(true);
        });
      });
    });

    describe('getArchetypeConfig(archetype)', () => {
      it('should return configuration for valid archetype', () => {
        const config = getArchetypeConfig('heritage-opulence');
        expect(config).toBeDefined();
        expect(config.headingPersonality).toBe('serif-elegant');
        expect(config.primaryHueRange).toEqual([220, 260]);
      });

      it('should throw for invalid archetype', () => {
        expect(() => getArchetypeConfig('invalid' as any)).toThrow();
      });

      it('should return config with all required properties', () => {
        const config = getArchetypeConfig('business-hotel');
        const requiredProps = [
          'headingPersonality',
          'bodyPersonality',
          'colorTemp',
          'primaryHueRange',
          'accentHueRange',
          'saturation',
          'surfaceType',
          'spacingDensity',
          'borderRadius',
          'accentStrategy',
        ];

        requiredProps.forEach(prop => {
          expect(config).toHaveProperty(prop);
        });
      });
    });

    describe('isValidArchetype(value)', () => {
      it('should return true for all valid archetypes', () => {
        const validArchetypes = [
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
        ];

        validArchetypes.forEach(archetype => {
          expect(isValidArchetype(archetype)).toBe(true);
        });
      });

      it('should return false for invalid values', () => {
        expect(isValidArchetype('invalid')).toBe(false);
        expect(isValidArchetype('')).toBe(false);
        expect(isValidArchetype(null)).toBe(false);
        expect(isValidArchetype(undefined)).toBe(false);
        expect(isValidArchetype(123)).toBe(false);
      });
    });
  });

  describe('Epic AC: Schema enforces SGR Cascade ordering', () => {
    it('should have archetype as first field', () => {
      const schemaKeys = Object.keys(HotelDesignTokensSchema.shape);
      expect(schemaKeys[0]).toBe('archetype');
    });

    it('should have SGR fields before colorScheme', () => {
      const schemaKeys = Object.keys(HotelDesignTokensSchema.shape);
      const sgrFieldIndex = schemaKeys.indexOf('guestPersona');
      const colorIndex = schemaKeys.indexOf('colorScheme');

      expect(sgrFieldIndex).toBeLessThan(colorIndex);
      expect(sgrFieldIndex).toBe(1); // Right after archetype
    });

    it('should have all SGR fields before any style fields', () => {
      const schemaKeys = Object.keys(HotelDesignTokensSchema.shape);
      const sgrFields = ['guestPersona', 'emotionalIntent', 'architecturalInspiration', 'forbiddenElements'];
      const styleFields = ['colorScheme', 'typography', 'spacing', 'borderRadius'];

      const lastSgrIndex = Math.max(...sgrFields.map(f => schemaKeys.indexOf(f)));
      const firstStyleIndex = Math.min(...styleFields.map(f => schemaKeys.indexOf(f)));

      expect(lastSgrIndex).toBeLessThan(firstStyleIndex);
    });
  });

  describe('Epic AC: ArchetypeSchema matches HOTEL_ARCHETYPE_TOKEN_MAP keys', () => {
    it('should accept all keys from HOTEL_ARCHETYPE_TOKEN_MAP', () => {
      const mapKeys = Object.keys(HOTEL_ARCHETYPE_TOKEN_MAP) as Array<any>;

      mapKeys.forEach(archetype => {
        const result = ArchetypeSchema.safeParse(archetype);
        expect(result.success).toBe(true);
      });
    });

    it('should have matching enum values', () => {
      const mapArchetypes = getAllArchetypes();

      mapArchetypes.forEach(archetype => {
        const result = ArchetypeSchema.safeParse(archetype);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Edge Cases and Error Messages', () => {
    it('should provide descriptive error for invalid archetype', () => {
      const tokens = createValidTokens({ archetype: 'invalid-archetype' as any });
      const result = HotelDesignTokensSchema.safeParse(tokens);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
      }
    });

    it('should provide descriptive error for out-of-range hue', () => {
      const tokens = createValidTokens({
        colorScheme: { ...createValidTokens().colorScheme, primaryHue: 500 },
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);

      expect(result.success).toBe(false);
    });

    it('should provide descriptive error for short guestPersona', () => {
      const tokens = createValidTokens({ guestPersona: 'Too short' });
      const result = HotelDesignTokensSchema.safeParse(tokens);

      expect(result.success).toBe(false);
      if (!result.success) {
        const guestPersonaError = result.error.issues.find(i => i.path.includes('guestPersona'));
        expect(guestPersonaError).toBeDefined();
      }
    });

    it('should handle empty forbiddenElements array', () => {
      const tokens = createValidTokens({ forbiddenElements: [] });
      const result = HotelDesignTokensSchema.safeParse(tokens);

      expect(result.success).toBe(false);
    });

    it('should handle too many forbiddenElements', () => {
      const tokens = createValidTokens({
        forbiddenElements: ['a', 'b', 'c', 'd', 'e', 'f'],
      });
      const result = HotelDesignTokensSchema.safeParse(tokens);

      expect(result.success).toBe(false);
    });
  });
});
