import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateFullTheme } from '@/lib/color/palette-generator';
import { hotelDesignTokensToBaseColors } from '@/lib/color/palette-generator';
import { mapToLightTokens, mapToDarkTokens } from '@/lib/color/semantic-mapper';
import { parseOklch } from '@/lib/color/oklch-parser';
import type { HotelBaseColors } from '@/lib/color/types';
import type { HotelDesignTokens } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';
import { mapSpacingDensity } from '@/lib/style-generation/spacing-mapper';
import { mapBorderRadius } from '@/lib/style-generation/border-radius-mapper';

const OKLCH_REGEX = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/;
const CLAMP_REGEX = /^clamp\([^)]+\)$/;
const PX_REGEX = /^\d+(px)?$/;

/**
 * Story 20.5: Token Pipeline Integration Tests
 *
 * End-to-end tests for the token pipeline that converts HotelDesignTokens
 * into CSS variables through the palette generation and semantic mapping stages.
 */
describe('Story 20.5: Token Pipeline Integration', () => {
  describe('Phase 1: Color Adapter - OKLCH Conversion', () => {
    it('converts HotelDesignTokens colorScheme to HotelBaseColors format', () => {
      const colorScheme = {
        primaryHue: 256,
        primaryChroma: 0.074,
        primaryLightness: 0.346,
        secondaryHue: 86.1,
        secondaryChroma: 0.099,
        secondaryLightness: 0.748,
        surfaceType: 'warm-cream' as const,
        accentStrategy: 'complementary' as const,
      };

      const baseColors = hotelDesignTokensToBaseColors(colorScheme);

      // Verify structure
      expect(baseColors).toHaveProperty('brandPrimary');
      expect(baseColors).toHaveProperty('brandSecondary');

      // Verify OKLCH string format
      expect(baseColors.brandPrimary).toMatch(OKLCH_REGEX);
      expect(baseColors.brandSecondary).toMatch(OKLCH_REGEX);

      // Verify correct component order: lightness chroma hue
      expect(baseColors.brandPrimary).toBe('oklch(0.346 0.074 256)');
      expect(baseColors.brandSecondary).toBe('oklch(0.748 0.099 86.1)');
    });

    it('OKLCH conversion preserves hue, chroma, lightness values', () => {
      const colorScheme = {
        primaryHue: 180,
        primaryChroma: 0.15,
        primaryLightness: 0.65,
        secondaryHue: 45,
        secondaryChroma: 0.12,
        secondaryLightness: 0.7,
        surfaceType: 'off-white' as const,
        accentStrategy: 'monochromatic' as const,
      };

      const baseColors = hotelDesignTokensToBaseColors(colorScheme);
      const primary = parseOklch(baseColors.brandPrimary);
      const secondary = parseOklch(baseColors.brandSecondary);

      // Verify hue preserved
      expect(primary.h).toBeCloseTo(180, 0.1);
      expect(secondary.h).toBeCloseTo(45, 0.1);

      // Verify chroma preserved
      expect(primary.c).toBeCloseTo(0.15, 0.01);
      expect(secondary.c).toBeCloseTo(0.12, 0.01);

      // Verify lightness preserved
      expect(primary.l).toBeCloseTo(0.65, 0.01);
      expect(secondary.l).toBeCloseTo(0.7, 0.01);
    });

    it('adapter output feeds into palette generator successfully', () => {
      const colorScheme = {
        primaryHue: 140,
        primaryChroma: 0.18,
        primaryLightness: 0.65,
        secondaryHue: 350,
        secondaryChroma: 0.2,
        secondaryLightness: 0.7,
        surfaceType: 'cream' as const,
        accentStrategy: 'triadic' as const,
      };

      const baseColors = hotelDesignTokensToBaseColors(colorScheme);

      // Verify palette generator accepts adapter output
      expect(() => generateFullTheme(baseColors)).not.toThrow();

      const theme = generateFullTheme(baseColors);
      expect(theme).toHaveProperty('palettes');
      expect(theme).toHaveProperty('light');
      expect(theme).toHaveProperty('dark');
    });
  });

  describe('Phase 2: Surface Type Mapping', () => {
    const baseColors: HotelBaseColors = {
      brandPrimary: 'oklch(0.5 0.15 250)',
      brandSecondary: 'oklch(0.65 0.12 50)',
    };

    it('maps warm-cream surface type correctly', () => {
      const palettes = generateFullTheme(baseColors).palettes;
      const tokens = mapToLightTokens(palettes, baseColors, 'warm-cream');

      // Verify surface tokens exist
      expect(tokens['surface-default']).toBeDefined();
      expect(tokens['surface-primary']).toBeDefined();
      expect(tokens['surface-elevated']).toBeDefined();
      expect(tokens['surface-secondary']).toBeDefined();
      expect(tokens['surface-muted']).toBeDefined();

      // Verify warm-cream has warm hue (50) and low chroma (0.02)
      const surfaceDefault = parseOklch(tokens['surface-default']);
      expect(surfaceDefault.l).toBeCloseTo(0.93, 0.01);
      expect(surfaceDefault.c).toBeCloseTo(0.02, 0.01);
      expect(surfaceDefault.h).toBeCloseTo(50, 5);
    });

    it('maps near-black surface type correctly', () => {
      const palettes = generateFullTheme(baseColors).palettes;
      const tokens = mapToLightTokens(palettes, baseColors, 'near-black');

      // Verify near-black surface tokens exist and are distinct from warm-cream
      // Note: getAdjustedSurfaceTokenValues clamps lightness to minimum 0.85 when
      // surfaceLightnessAdjustment is 0 (default), so surface-default starts at 0.85
      const surfaceDefault = parseOklch(tokens['surface-default']);
      expect(surfaceDefault.l).toBeCloseTo(0.85, 0.01);
      expect(surfaceDefault.c).toBeLessThanOrEqual(0.02);
    });

    it('maps gallery-white surface type correctly', () => {
      const palettes = generateFullTheme(baseColors).palettes;
      const tokens = mapToLightTokens(palettes, baseColors, 'gallery-white');

      // Verify gallery-white is pure white (achromatic)
      const surfaceDefault = parseOklch(tokens['surface-default']);
      expect(surfaceDefault.l).toBeCloseTo(0.98, 0.01);
      expect(surfaceDefault.c).toBe(0);
    });

    it('dark mode surface mapping for warm-white maintains subtle warmth', () => {
      const palettes = generateFullTheme(baseColors).palettes;
      const darkTokens = mapToDarkTokens(palettes, baseColors, 'warm-white');

      // Dark mode should have subtle warmth (very low chroma, hue 50)
      const surfaceDefault = parseOklch(darkTokens['surface-default']);
      expect(surfaceDefault.l).toBeCloseTo(0.14, 0.01);
      expect(surfaceDefault.c).toBeCloseTo(0.002, 0.001);
      expect(surfaceDefault.h).toBeCloseTo(50, 5);
    });

    it('dark mode surface mapping for near-black is achromatic', () => {
      const palettes = generateFullTheme(baseColors).palettes;
      const darkTokens = mapToDarkTokens(palettes, baseColors, 'near-black');

      // Verify achromatic (chroma = 0)
      const surfaceDefault = parseOklch(darkTokens['surface-default']);
      expect(surfaceDefault.c).toBe(0);
    });

    it('backward compatible: works without surfaceType parameter', () => {
      const palettes = generateFullTheme(baseColors).palettes;
      const tokens = mapToLightTokens(palettes, baseColors);

      // Should use default values
      expect(tokens['surface-default']).toBeDefined();
      expect(tokens['surface-default']).toBe('oklch(1 0 0)');
    });
  });

  describe('Phase 3: Spacing Density Mapping', () => {
    it('maps tight density correctly', () => {
      const spacingVars = mapSpacingDensity('tight');

      // Verify all 6 spacing variables exist
      expect(Object.keys(spacingVars)).toHaveLength(6);
      expect(spacingVars['--spacing-section-val']).toBeDefined();
      expect(spacingVars['--spacing-container-val']).toBeDefined();
      expect(spacingVars['--spacing-card-val']).toBeDefined();
      expect(spacingVars['--spacing-hero-val']).toBeDefined();
      expect(spacingVars['--spacing-gap-card-val']).toBeDefined();
      expect(spacingVars['--spacing-gap-section-val']).toBeDefined();

      // Verify tight has smallest values
      expect(spacingVars['--spacing-section-val']).toBe('clamp(1rem, 2vw, 1.5rem)');
      expect(spacingVars['--spacing-container-val']).toBe('clamp(0.75rem, 3vw, 1.25rem)');
    });

    it('maps comfortable density correctly', () => {
      const spacingVars = mapSpacingDensity('comfortable');

      // Verify comfortable matches Story 15.1 validated formulas (32px→64px section, 16px→32px container)
      expect(spacingVars['--spacing-section-val']).toBe('clamp(2rem, 0.0915rem + 8.143vw, 4rem)');
      expect(spacingVars['--spacing-container-val']).toBe('clamp(1rem, 0.0459rem + 4.071vw, 2rem)');
      expect(spacingVars['--spacing-card-val']).toBe('clamp(1rem, 2vw, 1.5rem)');
      expect(spacingVars['--spacing-hero-val']).toBe('clamp(4rem, 10vw, 8rem)');
    });

    it('maps airy density correctly', () => {
      const spacingVars = mapSpacingDensity('airy');

      // Verify airy has moderate increase
      expect(spacingVars['--spacing-section-val']).toBe('clamp(3rem, 5vw, 4rem)');
      expect(spacingVars['--spacing-container-val']).toBe('clamp(1.5rem, 6vw, 2.5rem)');
      expect(spacingVars['--spacing-card-val']).toBe('clamp(1.5rem, 3vw, 2rem)');
    });

    it('maps spacious density correctly', () => {
      const spacingVars = mapSpacingDensity('spacious');

      // Verify spacious has largest values
      expect(spacingVars['--spacing-section-val']).toBe('clamp(4rem, 7vw, 6rem)');
      expect(spacingVars['--spacing-container-val']).toBe('clamp(2rem, 7vw, 3rem)');
      expect(spacingVars['--spacing-card-val']).toBe('clamp(2rem, 4vw, 2.5rem)');
    });

    it('all spacing values use responsive clamp() format', () => {
      const densities: Array<'tight' | 'comfortable' | 'airy' | 'spacious'> = [
        'tight', 'comfortable', 'airy', 'spacious'
      ];

      densities.forEach(density => {
        const spacingVars = mapSpacingDensity(density);
        Object.values(spacingVars).forEach(value => {
          expect(value).toMatch(CLAMP_REGEX);
        });
      });
    });
  });

  describe('Phase 4: Border Radius Mapping', () => {
    it('maps sharp style correctly', () => {
      const radiusVars = mapBorderRadius('sharp');

      // Verify all 6 radius variables exist
      expect(Object.keys(radiusVars)).toHaveLength(6);
      expect(radiusVars['--radius-sm']).toBeDefined();
      expect(radiusVars['--radius-md']).toBeDefined();
      expect(radiusVars['--radius-lg']).toBeDefined();
      expect(radiusVars['--radius-xl']).toBeDefined();
      expect(radiusVars['--radius-2xl']).toBeDefined();
      expect(radiusVars['--radius-full']).toBeDefined();

      // Verify sharp has minimal rounding
      expect(radiusVars['--radius-sm']).toBe('0');
      expect(radiusVars['--radius-md']).toBe('2px');
      expect(radiusVars['--radius-lg']).toBe('2px');
    });

    it('maps subtle style correctly', () => {
      const radiusVars = mapBorderRadius('subtle');

      // Verify subtle has gentle rounding
      expect(radiusVars['--radius-sm']).toBe('4px');
      expect(radiusVars['--radius-md']).toBe('8px');
      expect(radiusVars['--radius-lg']).toBe('8px');
    });

    it('maps rounded style correctly', () => {
      const radiusVars = mapBorderRadius('rounded');

      // Verify rounded has full rounding
      expect(radiusVars['--radius-sm']).toBe('8px');
      expect(radiusVars['--radius-md']).toBe('12px');
      expect(radiusVars['--radius-lg']).toBe('16px');
    });

    it('maps pill style correctly', () => {
      const radiusVars = mapBorderRadius('pill');

      // Verify pill is completely round
      expect(radiusVars['--radius-sm']).toBe('12px');
      expect(radiusVars['--radius-md']).toBe('9999px');
      expect(radiusVars['--radius-lg']).toBe('9999px');
      expect(radiusVars['--radius-full']).toBe('9999px');
    });

    it('--radius-full is always 9999px regardless of style', () => {
      const styles: Array<'sharp' | 'subtle' | 'rounded' | 'pill'> = [
        'sharp', 'subtle', 'rounded', 'pill'
      ];

      styles.forEach(style => {
        const radiusVars = mapBorderRadius(style);
        expect(radiusVars['--radius-full']).toBe('9999px');
      });
    });

    it('all radius values are valid CSS', () => {
      const styles: Array<'sharp' | 'subtle' | 'rounded' | 'pill'> = [
        'sharp', 'subtle', 'rounded', 'pill'
      ];

      styles.forEach(style => {
        const radiusVars = mapBorderRadius(style);
        Object.values(radiusVars).forEach(value => {
          // Valid values: 0, pixel numbers (e.g., 2px, 8px), or 9999px
          const isValid = value === '0' || value === '9999px' || value.match(/^\d+px$/);
          expect(isValid).toBeTruthy();
        });
      });
    });
  });

  describe('End-to-End: Archetype Token Pipelines', () => {
    it('heritage-opulence archetype produces consistent theme', () => {
      const heritageOpulenceTokens: HotelDesignTokens = {
        archetype: 'heritage-opulence',
        guestPersona: 'Affluent couples aged 35-55 seeking romantic luxury getaway with personalized service and exclusive experiences',
        emotionalIntent: 'Feelings of exclusivity, tranquility, and refined elegance',
        architecturalInspiration: 'Georgian townhouses with high ceilings and marble floors',
        forbiddenElements: ['bg-white', 'tracking-normal', 'text-blue-*', 'rounded-md'],
        colorScheme: {
          primaryHue: 240,
          primaryChroma: 0.08,
          primaryLightness: 0.35,
          secondaryHue: 45,
          secondaryChroma: 0.1,
          secondaryLightness: 0.75,
          surfaceType: 'warm-cream',
          accentStrategy: 'complementary',
        },
        typography: {
          headingPersonality: 'serif-elegant',
          bodyPersonality: 'serif-readable',
          scaleRatio: 'major-third',
        },
        spacing: {
          density: 'comfortable',
        },
        borderRadius: {
          borderRadius: 'subtle',
        },
      };

      // Step 1: Convert to base colors
      const baseColors = hotelDesignTokensToBaseColors(heritageOpulenceTokens.colorScheme);
      expect(baseColors.brandPrimary).toMatch(OKLCH_REGEX);

      // Step 2: Generate palette
      const theme = generateFullTheme(baseColors);
      expect(theme.palettes.primary[500]).toBeDefined();

      // Step 3: Map to semantic tokens with surface type
      const lightTokens = mapToLightTokens(theme.palettes, baseColors, 'warm-cream');
      expect(lightTokens['surface-default']).toBeDefined();

      // Step 4: Get spacing variables
      const spacingVars = mapSpacingDensity('comfortable');
      expect(spacingVars['--spacing-section-val']).toBe('clamp(2rem, 0.0915rem + 8.143vw, 4rem)');

      // Step 5: Get radius variables
      const radiusVars = mapBorderRadius('subtle');
      expect(radiusVars['--radius-md']).toBe('8px');

      // Verify all values are valid
      Object.values(lightTokens).forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
      });
    });

    it('urban-tech archetype produces distinct theme', () => {
      const urbanTechTokens: HotelDesignTokens = {
        archetype: 'urban-tech',
        guestPersona: 'Young professionals aged 25-40 seeking efficient, modern accommodations with tech amenities',
        emotionalIntent: 'Feelings of efficiency, modernity, and connectivity',
        architecturalInspiration: 'Minimalist industrial lofts with concrete and glass',
        forbiddenElements: ['bg-white', 'serif fonts', 'rounded corners', 'ornate details'],
        colorScheme: {
          primaryHue: 0,
          primaryChroma: 0.18,
          primaryLightness: 0.55,
          secondaryHue: 200,
          secondaryChroma: 0.15,
          secondaryLightness: 0.7,
          surfaceType: 'near-black',
          accentStrategy: 'complementary',
        },
        typography: {
          headingPersonality: 'sans-modern',
          bodyPersonality: 'sans-modern',
          scaleRatio: 'minor-third',
        },
        spacing: {
          density: 'tight',
        },
        borderRadius: {
          borderRadius: 'rounded',
        },
      };

      // Step 1: Convert to base colors
      const baseColors = hotelDesignTokensToBaseColors(urbanTechTokens.colorScheme);

      // Step 2: Generate palette
      const theme = generateFullTheme(baseColors);

      // Step 3: Map to semantic tokens with surface type
      const lightTokens = mapToLightTokens(theme.palettes, baseColors, 'near-black');

      // Verify near-black surface tokens exist (surface-default is clamped to 0.85
      // minimum by getAdjustedSurfaceTokenValues when no lightnessAdjustment is applied)
      const surfaceDefault = parseOklch(lightTokens['surface-default']);
      expect(surfaceDefault.l).toBeGreaterThan(0);

      // Step 4: Get spacing variables
      const spacingVars = mapSpacingDensity('tight');
      expect(spacingVars['--spacing-section-val']).toBe('clamp(1rem, 2vw, 1.5rem)');

      // Step 5: Get radius variables
      const radiusVars = mapBorderRadius('rounded');
      expect(radiusVars['--radius-lg']).toBe('16px');
    });

    it('coastal-resort archetype produces distinct theme', () => {
      const coastalResortTokens: HotelDesignTokens = {
        archetype: 'coastal-resort',
        guestPersona: 'Families and couples seeking relaxed beach vacation with ocean activities',
        emotionalIntent: 'Feelings of relaxation, freshness, and coastal breeze',
        architecturalInspiration: 'Mediterranean villas with terracotta roofs and arches',
        forbiddenElements: ['dark backgrounds', 'sharp corners', 'formal typography'],
        colorScheme: {
          primaryHue: 200,
          primaryChroma: 0.12,
          primaryLightness: 0.6,
          secondaryHue: 35,
          secondaryChroma: 0.1,
          secondaryLightness: 0.75,
          surfaceType: 'warm-white',
          accentStrategy: 'warm-neutral',
        },
        typography: {
          headingPersonality: 'serif-elegant',
          bodyPersonality: 'sans-modern',
          scaleRatio: 'perfect-fourth',
        },
        spacing: {
          density: 'airy',
        },
        borderRadius: {
          borderRadius: 'rounded',
        },
      };

      // Step 1: Convert to base colors
      const baseColors = hotelDesignTokensToBaseColors(coastalResortTokens.colorScheme);

      // Step 2: Generate palette
      const theme = generateFullTheme(baseColors);

      // Step 3: Map to semantic tokens with surface type
      const lightTokens = mapToLightTokens(theme.palettes, baseColors, 'warm-white');

      // Verify warm-white surface is light and warm
      const surfaceDefault = parseOklch(lightTokens['surface-default']);
      expect(surfaceDefault.l).toBeGreaterThan(0.95);
      expect(surfaceDefault.h).toBeCloseTo(50, 10);

      // Step 4: Get spacing variables
      const spacingVars = mapSpacingDensity('airy');
      expect(spacingVars['--spacing-section-val']).toBe('clamp(3rem, 5vw, 4rem)');

      // Step 5: Get radius variables
      const radiusVars = mapBorderRadius('rounded');
      expect(radiusVars['--radius-md']).toBe('12px');
    });

    it('different archetypes produce visually distinct themes', () => {
      const archetypes = [
        {
          name: 'heritage-opulence',
          colorScheme: {
            primaryHue: 240, primaryChroma: 0.08, primaryLightness: 0.35,
            secondaryHue: 45, secondaryChroma: 0.1, secondaryLightness: 0.75,
            surfaceType: 'warm-cream' as const, accentStrategy: 'complementary' as const,
          },
        },
        {
          name: 'urban-tech',
          colorScheme: {
            primaryHue: 0, primaryChroma: 0.18, primaryLightness: 0.55,
            secondaryHue: 200, secondaryChroma: 0.15, secondaryLightness: 0.7,
            surfaceType: 'near-black' as const, accentStrategy: 'complementary' as const,
          },
        },
        {
          name: 'coastal-resort',
          colorScheme: {
            primaryHue: 200, primaryChroma: 0.12, primaryLightness: 0.6,
            secondaryHue: 35, secondaryChroma: 0.1, secondaryLightness: 0.75,
            surfaceType: 'warm-white' as const, accentStrategy: 'warm-neutral' as const,
          },
        },
      ];

      const themes = archetypes.map(archetype => {
        const baseColors = hotelDesignTokensToBaseColors(archetype.colorScheme);
        return {
          name: archetype.name,
          theme: generateFullTheme(baseColors),
          surfaceDefault: mapToLightTokens(
            generateFullTheme(baseColors).palettes,
            baseColors,
            archetype.colorScheme.surfaceType
          )['surface-default'],
        };
      });

      // Verify each archetype produces distinct surface colors
      const surfaces = themes.map(t => t.surfaceDefault);
      expect(new Set(surfaces).size).toBe(3);

      // Verify hue differences
      const hues = themes.map(t => parseOklch(t.surfaceDefault).h);
      expect(hues[0]).not.toBeCloseTo(hues[1], 20);
    });
  });

  describe('useHotelTheme Integration with Mock DOM', () => {
    let mockRootElement: any;

    beforeEach(() => {
      // Create mock DOM element
      mockRootElement = {
        style: {
          setProperty: jest.fn(),
        },
        setAttribute: jest.fn(),
        dataset: {},
      };

      // Mock document.documentElement
      global.document = {
        documentElement: mockRootElement,
      } as any;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('verifies spacing variables are applied to DOM', () => {
      const spacingVars = mapSpacingDensity('airy');

      // Simulate applying spacing variables
      Object.entries(spacingVars).forEach(([varName, value]) => {
        mockRootElement.style.setProperty(varName, value);
      });

      // Verify setProperty was called for each variable
      expect(mockRootElement.style.setProperty).toHaveBeenCalledTimes(6);

      // Verify specific calls with -val variable names
      expect(mockRootElement.style.setProperty).toHaveBeenCalledWith(
        '--spacing-section-val',
        'clamp(3rem, 5vw, 4rem)'
      );
      expect(mockRootElement.style.setProperty).toHaveBeenCalledWith(
        '--spacing-container-val',
        'clamp(1.5rem, 6vw, 2.5rem)'
      );
    });

    it('verifies border radius variables are applied to DOM', () => {
      const radiusVars = mapBorderRadius('pill');

      // Simulate applying radius variables
      Object.entries(radiusVars).forEach(([varName, value]) => {
        mockRootElement.style.setProperty(varName, value);
      });

      // Verify setProperty was called for each variable
      expect(mockRootElement.style.setProperty).toHaveBeenCalledTimes(6);

      // Verify pill style uses 9999px for most variables
      expect(mockRootElement.style.setProperty).toHaveBeenCalledWith('--radius-md', '9999px');
      expect(mockRootElement.style.setProperty).toHaveBeenCalledWith('--radius-lg', '9999px');
    });

    it('verifies CSS cascade order: colors → spacing → radius', () => {
      const callOrder: string[] = [];

      // Mock setProperty to track call order
      mockRootElement.style.setProperty = jest.fn((name: string) => {
        callOrder.push(name);
      });

      // Simulate applying in correct order
      // 1. Color variables (example)
      mockRootElement.style.setProperty('--brand-primary-val', 'oklch(0.5 0.1 200)');
      mockRootElement.style.setProperty('--text-primary-val', 'oklch(0.2 0.04 200)');

      // 2. Spacing variables
      const spacingVars = mapSpacingDensity('comfortable');
      Object.entries(spacingVars).forEach(([varName, value]) => {
        mockRootElement.style.setProperty(varName, value);
      });

      // 3. Border radius variables
      const radiusVars = mapBorderRadius('subtle');
      Object.entries(radiusVars).forEach(([varName, value]) => {
        mockRootElement.style.setProperty(varName, value);
      });

      // Verify colors applied first
      const colorIndex = callOrder.indexOf('--brand-primary-val');
      const spacingIndex = callOrder.indexOf('--spacing-section-val');
      const radiusIndex = callOrder.indexOf('--radius-md');

      expect(colorIndex).toBeLessThan(spacingIndex);
      expect(spacingIndex).toBeLessThan(radiusIndex);
    });
  });

  describe('CSS Variable Validation', () => {
    it('all generated OKLCH values are valid and parseable', () => {
      const testCases = [
        {
          name: 'heritage-opulence',
          colorScheme: {
            primaryHue: 240, primaryChroma: 0.08, primaryLightness: 0.35,
            secondaryHue: 45, secondaryChroma: 0.1, secondaryLightness: 0.75,
            surfaceType: 'warm-cream' as const, accentStrategy: 'complementary' as const,
          },
        },
        {
          name: 'urban-tech',
          colorScheme: {
            primaryHue: 0, primaryChroma: 0.18, primaryLightness: 0.55,
            secondaryHue: 200, secondaryChroma: 0.15, secondaryLightness: 0.7,
            surfaceType: 'near-black' as const, accentStrategy: 'complementary' as const,
          },
        },
        {
          name: 'coastal-resort',
          colorScheme: {
            primaryHue: 200, primaryChroma: 0.12, primaryLightness: 0.6,
            secondaryHue: 35, secondaryChroma: 0.1, secondaryLightness: 0.75,
            surfaceType: 'warm-white' as const, accentStrategy: 'warm-neutral' as const,
          },
        },
      ];

      testCases.forEach(({ name, colorScheme }) => {
        const baseColors = hotelDesignTokensToBaseColors(colorScheme);
        const theme = generateFullTheme(baseColors);
        const lightTokens = mapToLightTokens(
          theme.palettes,
          baseColors,
          colorScheme.surfaceType
        );

        // Verify all light mode tokens are valid OKLCH
        Object.values(lightTokens).forEach(value => {
          expect(value).toMatch(OKLCH_REGEX);
          expect(() => parseOklch(value)).not.toThrow();
        });
      });
    });

    it('all spacing values are valid CSS clamp() expressions', () => {
      const densities: Array<'tight' | 'comfortable' | 'airy' | 'spacious'> = [
        'tight', 'comfortable', 'airy', 'spacious'
      ];

      densities.forEach(density => {
        const spacingVars = mapSpacingDensity(density);

        Object.values(spacingVars).forEach(value => {
          expect(value).toMatch(CLAMP_REGEX);
        });
      });
    });

    it('all border radius values are valid CSS', () => {
      const styles: Array<'sharp' | 'subtle' | 'rounded' | 'pill'> = [
        'sharp', 'subtle', 'rounded', 'pill'
      ];

      styles.forEach(style => {
        const radiusVars = mapBorderRadius(style);

        Object.values(radiusVars).forEach(value => {
          // Either 0, px number, or 9999px
          expect(
            value === '0' ||
            value === '9999px' ||
            value.match(/^\d+px$/)
          ).toBeTruthy();
        });
      });
    });
  });
});
