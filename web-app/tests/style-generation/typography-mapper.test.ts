/**
 * Story 20.4: Typography Mapper
 * Test Suite
 *
 * Tests the typography mapper that converts typography personality tokens
 * into CSS font declarations with font family CSS variables, font weights,
 * and letter-spacing (tracking) values.
 *
 * Test coverage:
 * - TYPOGRAPHY_MAP completeness (all 6 personalities)
 * - mapTypography() function with valid inputs
 * - Font family CSS variable mapping
 * - Font weight configurations
 * - Tracking (letter-spacing) values
 * - Scale ratio mapping
 * - Error handling for invalid personalities
 * - Helper functions (getHeadingPersonalities, getBodyPersonalities, etc.)
 * - Integration with pre-loaded font CSS variables
 */

import { describe, it, expect } from '@jest/globals';
import {
  TYPOGRAPHY_MAP,
  mapTypography,
  getHeadingPersonalities,
  getBodyPersonalities,
  isValidTypographyPersonality,
  getTypographyStack,
} from '@/lib/style-generation/typography-mapper';
import type { HotelDesignTokens } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

// Mock HotelDesignTokens for testing
const createMockTokens = (headingPersonality: string, bodyPersonality: string, scaleRatio: string): HotelDesignTokens => ({
  archetype: 'heritage-opulence',
  guestPersona: 'Test guest persona that meets the minimum length requirement of fifty characters for validation purposes.',
  emotionalIntent: 'Test emotional intent',
  architecturalInspiration: 'Test inspiration',
  forbiddenElements: ['test-element'],
  colorScheme: {
    primaryHue: 235,
    primaryChroma: 0.18,
    primaryLightness: 0.45,
    secondaryHue: 45,
    secondaryChroma: 0.22,
    secondaryLightness: 0.55,
    surfaceType: 'warm-cream',
    accentStrategy: 'complementary',
  },
  typography: {
    headingPersonality,
    bodyPersonality,
    scaleRatio,
  },
  spacing: {
    density: 'comfortable',
  },
  borderRadius: {
    style: 'subtle',
  },
});

describe('Story 20.4: Typography Mapper', () => {
  describe('TYPOGRAPHY_MAP Completeness', () => {
    it('should have entries for all 6 heading personalities', () => {
      const personalities = Object.keys(TYPOGRAPHY_MAP);

      expect(personalities).toContain('serif-elegant');
      expect(personalities).toContain('serif-readable');
      expect(personalities).toContain('sans-modern');
      expect(personalities).toContain('display-decorative');
      expect(personalities).toContain('slab-strong');
      expect(personalities).toContain('humanist-organic');

      expect(personalities.length).toBe(6);
    });

    it('should include all 3 body personalities', () => {
      const personalities = Object.keys(TYPOGRAPHY_MAP);

      expect(personalities).toContain('sans-modern');
      expect(personalities).toContain('serif-readable');
      expect(personalities).toContain('humanist-organic');
    });

    it('should have required properties for each personality', () => {
      Object.values(TYPOGRAPHY_MAP).forEach(stack => {
        expect(stack).toHaveProperty('fontFamily');
        expect(stack).toHaveProperty('weights');
        expect(stack).toHaveProperty('tracking');

        expect(typeof stack.fontFamily).toBe('string');
        expect(Array.isArray(stack.weights)).toBe(true);
        expect(typeof stack.tracking).toBe('number');
      });
    });
  });

  describe('Font Family CSS Variable Mapping', () => {
    it('should map serif-elegant to --font-serif-elegant', () => {
      const stack = TYPOGRAPHY_MAP['serif-elegant'];
      expect(stack.fontFamily).toBe('--font-serif-elegant');
    });

    it('should map serif-readable to --font-serif-readable', () => {
      const stack = TYPOGRAPHY_MAP['serif-readable'];
      expect(stack.fontFamily).toBe('--font-serif-readable');
    });

    it('should map sans-modern to --font-sans-modern', () => {
      const stack = TYPOGRAPHY_MAP['sans-modern'];
      expect(stack.fontFamily).toBe('--font-sans-modern');
    });

    it('should map display-decorative to --font-display-decorative', () => {
      const stack = TYPOGRAPHY_MAP['display-decorative'];
      expect(stack.fontFamily).toBe('--font-display-decorative');
    });

    it('should map slab-strong to --font-slab-strong', () => {
      const stack = TYPOGRAPHY_MAP['slab-strong'];
      expect(stack.fontFamily).toBe('--font-slab-strong');
    });

    it('should map humanist-organic to --font-humanist-organic', () => {
      const stack = TYPOGRAPHY_MAP['humanist-organic'];
      expect(stack.fontFamily).toBe('--font-humanist-organic');
    });

    it('should use correct CSS variable format for all fonts', () => {
      Object.values(TYPOGRAPHY_MAP).forEach(stack => {
        expect(stack.fontFamily).toMatch(/^--font-[a-z-]+$/);
      });
    });
  });

  describe('Font Weight Configurations', () => {
    it('should configure appropriate weights for serif-elegant', () => {
      const stack = TYPOGRAPHY_MAP['serif-elegant'];
      expect(stack.weights).toEqual([300, 400, 500, 600, 700]);
    });

    it('should configure appropriate weights for serif-readable', () => {
      const stack = TYPOGRAPHY_MAP['serif-readable'];
      expect(stack.weights).toEqual([400, 700]);
    });

    it('should configure appropriate weights for sans-modern', () => {
      const stack = TYPOGRAPHY_MAP['sans-modern'];
      expect(stack.weights).toEqual([300, 400, 500, 600, 700]);
    });

    it('should configure appropriate weights for display-decorative', () => {
      const stack = TYPOGRAPHY_MAP['display-decorative'];
      expect(stack.weights).toEqual([300, 400, 500, 600, 700]);
    });

    it('should configure appropriate weights for slab-strong', () => {
      const stack = TYPOGRAPHY_MAP['slab-strong'];
      expect(stack.weights).toEqual([300, 400, 500, 700, 900]);
    });

    it('should configure appropriate weights for humanist-organic', () => {
      const stack = TYPOGRAPHY_MAP['humanist-organic'];
      expect(stack.weights).toEqual([200, 300, 400, 500, 600, 700, 800, 900]);
    });

    it('should have at least 2 weights for each personality', () => {
      Object.values(TYPOGRAPHY_MAP).forEach(stack => {
        expect(stack.weights.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Tracking (Letter-Spacing) Values', () => {
    it('should set positive tracking for serif-elegant (wide-set)', () => {
      const stack = TYPOGRAPHY_MAP['serif-elegant'];
      expect(stack.tracking).toBeGreaterThan(0);
      expect(stack.tracking).toBe(0.05); // 5% of em
    });

    it('should set slightly positive tracking for serif-readable', () => {
      const stack = TYPOGRAPHY_MAP['serif-readable'];
      expect(stack.tracking).toBe(0.01);
    });

    it('should set negative tracking for sans-modern (tight)', () => {
      const stack = TYPOGRAPHY_MAP['sans-modern'];
      expect(stack.tracking).toBeLessThan(0);
      expect(stack.tracking).toBe(-0.01);
    });

    it('should set negative tracking for display-decorative', () => {
      const stack = TYPOGRAPHY_MAP['display-decorative'];
      expect(stack.tracking).toBeLessThan(0);
      expect(stack.tracking).toBe(-0.02);
    });

    it('should set positive tracking for slab-strong', () => {
      const stack = TYPOGRAPHY_MAP['slab-strong'];
      expect(stack.tracking).toBeGreaterThan(0);
      expect(stack.tracking).toBe(0.02);
    });

    it('should set neutral tracking for humanist-organic', () => {
      const stack = TYPOGRAPHY_MAP['humanist-organic'];
      expect(stack.tracking).toBe(0);
    });

    it('should have tracking values in reasonable range (-0.05 to 0.1)', () => {
      Object.values(TYPOGRAPHY_MAP).forEach(stack => {
        expect(stack.tracking).toBeGreaterThanOrEqual(-0.05);
        expect(stack.tracking).toBeLessThanOrEqual(0.1);
      });
    });
  });

  describe('mapTypography Function', () => {
    it('should map heritage-opulence typography correctly', () => {
      const tokens = createMockTokens('serif-elegant', 'serif-readable', 'perfect-fourth');
      const result = mapTypography(tokens);

      expect(result.headingFont).toBe('--font-serif-elegant');
      expect(result.bodyFont).toBe('--font-serif-readable');
      expect(result.headingWeights).toEqual([300, 400, 500, 600, 700]);
      expect(result.bodyWeights).toEqual([400, 700]);
      expect(result.headingTracking).toBe(0.05);
      expect(result.bodyTracking).toBe(0.01);
      expect(result.scaleRatio).toBe(1.333);
    });

    it('should map urban-tech typography correctly', () => {
      const tokens = createMockTokens('sans-modern', 'sans-modern', 'major-third');
      const result = mapTypography(tokens);

      expect(result.headingFont).toBe('--font-sans-modern');
      expect(result.bodyFont).toBe('--font-sans-modern');
      expect(result.headingWeights).toEqual([300, 400, 500, 600, 700]);
      expect(result.bodyWeights).toEqual([300, 400, 500, 600, 700]);
      expect(result.headingTracking).toBe(-0.01);
      expect(result.bodyTracking).toBe(-0.01);
      expect(result.scaleRatio).toBe(1.25);
    });

    it('should map boutique-editorial typography correctly', () => {
      const tokens = createMockTokens('display-decorative', 'sans-modern', 'golden-ratio');
      const result = mapTypography(tokens);

      expect(result.headingFont).toBe('--font-display-decorative');
      expect(result.bodyFont).toBe('--font-sans-modern');
      expect(result.headingTracking).toBe(-0.02);
      expect(result.scaleRatio).toBe(1.618);
    });

    it('should map mountain-wilderness typography correctly', () => {
      const tokens = createMockTokens('slab-strong', 'sans-modern', 'minor-third');
      const result = mapTypography(tokens);

      expect(result.headingFont).toBe('--font-slab-strong');
      expect(result.headingWeights).toEqual([300, 400, 500, 700, 900]);
      expect(result.headingTracking).toBe(0.02);
      expect(result.scaleRatio).toBe(1.2);
    });

    it('should map wellness-spa typography correctly', () => {
      const tokens = createMockTokens('humanist-organic', 'humanist-organic', 'perfect-fourth');
      const result = mapTypography(tokens);

      expect(result.headingFont).toBe('--font-humanist-organic');
      expect(result.bodyFont).toBe('--font-humanist-organic');
      expect(result.headingTracking).toBe(0);
      expect(result.bodyTracking).toBe(0);
      expect(result.scaleRatio).toBe(1.333);
    });
  });

  describe('Scale Ratio Mapping', () => {
    it('should map minor-third to 1.2', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'minor-third');
      const result = mapTypography(tokens);
      expect(result.scaleRatio).toBe(1.2);
    });

    it('should map major-third to 1.25', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'major-third');
      const result = mapTypography(tokens);
      expect(result.scaleRatio).toBe(1.25);
    });

    it('should map perfect-fourth to 1.333', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'perfect-fourth');
      const result = mapTypography(tokens);
      expect(result.scaleRatio).toBe(1.333);
    });

    it('should map golden-ratio to 1.618', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'golden-ratio');
      const result = mapTypography(tokens);
      expect(result.scaleRatio).toBe(1.618);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unknown heading personality', () => {
      const tokens = createMockTokens('unknown-personality' as any, 'sans-modern', 'major-third');

      expect(() => mapTypography(tokens)).toThrow(
        'Unknown heading personality: "unknown-personality"'
      );
    });

    it('should throw error for unknown body personality', () => {
      const tokens = createMockTokens('serif-elegant', 'unknown-personality' as any, 'major-third');

      expect(() => mapTypography(tokens)).toThrow(
        'Unknown body personality: "unknown-personality"'
      );
    });

    it('should throw error for unknown scale ratio', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'unknown-ratio' as any);

      expect(() => mapTypography(tokens)).toThrow(
        'Unknown scale ratio: "unknown-ratio"'
      );
    });

    it('should include list of valid options in error messages', () => {
      const tokens = createMockTokens('invalid' as any, 'sans-modern', 'major-third');

      try {
        mapTypography(tokens);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Valid options:');
      }
    });
  });

  describe('Helper Functions', () => {
    describe('getHeadingPersonalities', () => {
      it('should return all 6 heading personalities', () => {
        const personalities = getHeadingPersonalities();

        expect(personalities).toHaveLength(6);
        expect(personalities).toContain('serif-elegant');
        expect(personalities).toContain('serif-readable');
        expect(personalities).toContain('sans-modern');
        expect(personalities).toContain('display-decorative');
        expect(personalities).toContain('slab-strong');
        expect(personalities).toContain('humanist-organic');
      });

      it('should return array of strings', () => {
        const personalities = getHeadingPersonalities();

        expect(Array.isArray(personalities)).toBe(true);
        personalities.forEach(p => {
          expect(typeof p).toBe('string');
        });
      });
    });

    describe('getBodyPersonalities', () => {
      it('should return all 3 body personalities', () => {
        const personalities = getBodyPersonalities();

        expect(personalities).toHaveLength(3);
        expect(personalities).toContain('sans-modern');
        expect(personalities).toContain('serif-readable');
        expect(personalities).toContain('humanist-organic');
      });

      it('should return array of strings', () => {
        const personalities = getBodyPersonalities();

        expect(Array.isArray(personalities)).toBe(true);
        personalities.forEach(p => {
          expect(typeof p).toBe('string');
        });
      });
    });

    describe('isValidTypographyPersonality', () => {
      it('should validate all heading personalities', () => {
        getHeadingPersonalities().forEach(personality => {
          expect(isValidTypographyPersonality(personality, 'heading')).toBe(true);
        });
      });

      it('should validate all body personalities', () => {
        getBodyPersonalities().forEach(personality => {
          expect(isValidTypographyPersonality(personality, 'body')).toBe(true);
        });
      });

      it('should reject invalid heading personalities', () => {
        expect(isValidTypographyPersonality('invalid', 'heading')).toBe(false);
        expect(isValidTypographyPersonality('serif-elegant', 'body')).toBe(false);
      });

      it('should reject invalid body personalities', () => {
        expect(isValidTypographyPersonality('invalid', 'body')).toBe(false);
        expect(isValidTypographyPersonality('slab-strong', 'body')).toBe(false);
      });

      it('should default to heading type check', () => {
        expect(isValidTypographyPersonality('serif-elegant')).toBe(true);
        expect(isValidTypographyPersonality('sans-modern')).toBe(true);
        expect(isValidTypographyPersonality('slab-strong', 'heading')).toBe(true);
        expect(isValidTypographyPersonality('slab-strong', 'body')).toBe(false);
      });
    });

    describe('getTypographyStack', () => {
      it('should return stack configuration for valid personality', () => {
        const stack = getTypographyStack('serif-elegant');

        expect(stack).toBeDefined();
        expect(stack?.fontFamily).toBe('--font-serif-elegant');
        expect(stack?.weights).toEqual([300, 400, 500, 600, 700]);
        expect(stack?.tracking).toBe(0.05);
      });

      it('should return undefined for invalid personality', () => {
        const stack = getTypographyStack('invalid-personality');
        expect(stack).toBeUndefined();
      });

      it('should work for all 6 personalities', () => {
        getHeadingPersonalities().forEach(personality => {
          const stack = getTypographyStack(personality);
          expect(stack).toBeDefined();
          expect(stack?.fontFamily).toMatch(/^--font-/);
        });
      });
    });
  });

  describe('Integration with Font Injection (Story 20.4a)', () => {
    it('should use CSS variables that match pre-loaded fonts', () => {
      const fontVariables = Object.values(TYPOGRAPHY_MAP).map(stack => stack.fontFamily);

      // CSS variables from layout.tsx (Story 20.4a)
      const expectedVariables = [
        '--font-serif-elegant',
        '--font-serif-readable',
        '--font-sans-modern',
        '--font-display-decorative',
        '--font-slab-strong',
        '--font-humanist-organic',
      ];

      expectedVariables.forEach(variable => {
        expect(fontVariables).toContain(variable);
      });
    });

    it('should have consistent personality mappings across mapper and font injection', () => {
      const personalities = Object.keys(TYPOGRAPHY_MAP);

      personalities.forEach(personality => {
        const stack = TYPOGRAPHY_MAP[personality];
        // Font variable should reference the pre-loaded font from layout.tsx
        expect(stack.fontFamily).toMatch(/^--font-/);
        expect(stack.fontFamily).toContain('--font-');
      });
    });
  });

  describe('TypographyDeclaration Interface', () => {
    it('should return complete declaration with all required fields', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'perfect-fourth');
      const result = mapTypography(tokens);

      expect(result).toHaveProperty('headingFont');
      expect(result).toHaveProperty('bodyFont');
      expect(result).toHaveProperty('headingWeights');
      expect(result).toHaveProperty('bodyWeights');
      expect(result).toHaveProperty('headingTracking');
      expect(result).toHaveProperty('bodyTracking');
      expect(result).toHaveProperty('scaleRatio');
    });

    it('should return correct types for all fields', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'perfect-fourth');
      const result = mapTypography(tokens);

      expect(typeof result.headingFont).toBe('string');
      expect(typeof result.bodyFont).toBe('string');
      expect(Array.isArray(result.headingWeights)).toBe(true);
      expect(Array.isArray(result.bodyWeights)).toBe(true);
      expect(typeof result.headingTracking).toBe('number');
      expect(typeof result.bodyTracking).toBe('number');
      expect(typeof result.scaleRatio).toBe('number');
    });

    it('should return font weights as numbers', () => {
      const tokens = createMockTokens('serif-elegant', 'sans-modern', 'perfect-fourth');
      const result = mapTypography(tokens);

      result.headingWeights.forEach(weight => {
        expect(typeof weight).toBe('number');
        expect(weight).toBeGreaterThan(0);
        expect(weight).toBeLessThanOrEqual(999);
      });

      result.bodyWeights.forEach(weight => {
        expect(typeof weight).toBe('number');
        expect(weight).toBeGreaterThan(0);
        expect(weight).toBeLessThanOrEqual(999);
      });
    });
  });

  describe('All Archetype Combinations', () => {
    const archetypeCombinations = [
      {
        archetype: 'heritage-opulence',
        heading: 'serif-elegant',
        body: 'serif-readable',
        scaleRatio: 'perfect-fourth',
      },
      {
        archetype: 'quiet-luxury',
        heading: 'serif-elegant',
        body: 'sans-modern',
        scaleRatio: 'major-third',
      },
      {
        archetype: 'boutique-editorial',
        heading: 'display-decorative',
        body: 'sans-modern',
        scaleRatio: 'golden-ratio',
      },
      {
        archetype: 'urban-tech',
        heading: 'sans-modern',
        body: 'sans-modern',
        scaleRatio: 'minor-third',
      },
      {
        archetype: 'coastal-resort',
        heading: 'serif-elegant',
        body: 'sans-modern',
        scaleRatio: 'perfect-fourth',
      },
      {
        archetype: 'mountain-wilderness',
        heading: 'slab-strong',
        body: 'sans-modern',
        scaleRatio: 'major-third',
      },
      {
        archetype: 'wellness-spa',
        heading: 'sans-modern',
        body: 'humanist-organic',
        scaleRatio: 'perfect-fourth',
      },
      {
        archetype: 'heritage-cultural',
        heading: 'serif-elegant',
        body: 'serif-readable',
        scaleRatio: 'perfect-fourth',
      },
      {
        archetype: 'eco-lodge',
        heading: 'sans-modern',
        body: 'humanist-organic',
        scaleRatio: 'golden-ratio',
      },
      {
        archetype: 'design-art',
        heading: 'display-decorative',
        body: 'sans-modern',
        scaleRatio: 'golden-ratio',
      },
      {
        archetype: 'family-resort',
        heading: 'sans-modern',
        body: 'sans-modern',
        scaleRatio: 'major-third',
      },
      {
        archetype: 'business-hotel',
        heading: 'sans-modern',
        body: 'sans-modern',
        scaleRatio: 'minor-third',
      },
    ];

    archetypeCombinations.forEach(({ archetype, heading, body, scaleRatio }) => {
      it(`should map ${archetype} typography correctly`, () => {
        const tokens = createMockTokens(heading, body, scaleRatio);
        const result = mapTypography(tokens);

        expect(result.headingFont).toBeDefined();
        expect(result.bodyFont).toBeDefined();
        expect(result.headingWeights.length).toBeGreaterThan(0);
        expect(result.bodyWeights.length).toBeGreaterThan(0);
        expect(typeof result.headingTracking).toBe('number');
        expect(typeof result.bodyTracking).toBe('number');
        expect(result.scaleRatio).toBeGreaterThan(1);
      });
    });
  });
});
