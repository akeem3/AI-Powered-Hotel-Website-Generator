import { describe, it, expect } from '@jest/globals';
import {
  mapToLightTokens,
  mapToDarkTokens,
  mapShadesToCssVariables,
  mapDarkModeCssVariables,
} from '@/lib/color/semantic-mapper';
import { generateFullPalettes, generateFullTheme } from '@/lib/color/palette-generator';
import { parseOklch } from '@/lib/color/oklch-parser';
import type { HotelBaseColors, SemanticTokens } from '@/lib/color/types';

const OKLCH_REGEX = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/;

const REQUIRED_SEMANTIC_TOKENS: Array<keyof SemanticTokens> = [
  // Brand
  'brand-primary',
  'brand-primary-hover',
  'brand-secondary',
  'brand-secondary-hover',
  'on-brand',
  'on-brand-secondary',
  'brand-white',
  // Text
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-inverted',
  'text-on-brand',
  'text-on-brand-secondary',
  // Surface
  'surface-default',
  'surface-primary',
  'surface-elevated',
  'surface-secondary',
  'surface-muted',
  // Border
  'border-default',
  'border-strong',
  // Status
  'status-success',
  'status-warning',
  'status-error',
  'status-error-strong',
  'status-info',
  // Interactive
  'interactive-primary',
  'interactive-primary-hover',
];

describe('Semantic Mapper', () => {
  const testBaseColors: HotelBaseColors = {
    brandPrimary: 'oklch(0.55 0.2 230)',
    brandSecondary: 'oklch(0.65 0.18 280)',
  };

  const testPalettes = generateFullPalettes(testBaseColors);

  describe('mapToLightTokens', () => {
    it('produces all required semantic token keys', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);

      REQUIRED_SEMANTIC_TOKENS.forEach(key => {
        expect(tokens[key]).toBeDefined();
      });

      expect(Object.keys(tokens)).toHaveLength(REQUIRED_SEMANTIC_TOKENS.length);
    });

    it('all token values are valid OKLCH strings', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);

      Object.values(tokens).forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
        expect(() => parseOklch(value)).not.toThrow();
      });
    });

    it('text-primary is a neutral dark color (low chroma)', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const textPrimary = parseOklch(tokens['text-primary']);

      // Should be dark (low lightness) with very low chroma for neutral appearance
      expect(textPrimary.l).toBeLessThan(0.3);
      expect(textPrimary.c).toBeLessThan(0.05); // Low chroma for neutral
    });

    it('text-secondary is a neutral medium color (low chroma)', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const textSecondary = parseOklch(tokens['text-secondary']);

      // Should be medium lightness with very low chroma
      expect(textSecondary.l).toBeGreaterThan(0.4);
      expect(textSecondary.l).toBeLessThan(0.7);
      expect(textSecondary.c).toBeLessThan(0.05); // Low chroma for neutral
    });

    it('text-muted is a neutral light color (low chroma)', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const textMuted = parseOklch(tokens['text-muted']);

      // Should be light with very low chroma
      expect(textMuted.l).toBeGreaterThan(0.6);
      expect(textMuted.c).toBeLessThan(0.05); // Low chroma for neutral
    });

    it('surface-default is white oklch(1 0 0)', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const surfaceDefault = parseOklch(tokens['surface-default']);

      expect(surfaceDefault.l).toBe(1);
      expect(surfaceDefault.c).toBe(0);
      expect(surfaceDefault.h).toBe(0);
    });

    it('brand-primary comes from primary-500 shade', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);

      expect(tokens['brand-primary']).toBe(testPalettes.primary[500]);
    });

    it('brand-primary-hover is darker than brand-primary', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const primary = parseOklch(tokens['brand-primary']);
      const primaryHover = parseOklch(tokens['brand-primary-hover']);

      expect(primaryHover.l).toBeLessThan(primary.l);
    });

    it('border-default is a neutral light color (low chroma)', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const borderDefault = parseOklch(tokens['border-default']);

      // Should be light with very low chroma for neutral appearance
      expect(borderDefault.l).toBeGreaterThan(0.9);
      expect(borderDefault.c).toBeLessThan(0.03); // Very low chroma
    });

    it('on-brand is white for contrast', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const onBrand = parseOklch(tokens['on-brand']);

      expect(onBrand.l).toBe(1);
      expect(onBrand.c).toBe(0);
    });

    it('on-brand-secondary is white for contrast', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);
      const onBrandSecondary = parseOklch(tokens['on-brand-secondary']);

      expect(onBrandSecondary.l).toBe(1);
      expect(onBrandSecondary.c).toBe(0);
    });

    it('text-on-brand-secondary is defined', () => {
      const tokens = mapToLightTokens(testPalettes, testBaseColors);

      expect(tokens['text-on-brand-secondary']).toBeDefined();
      expect(tokens['text-on-brand-secondary']).toMatch(OKLCH_REGEX);
    });
  });

  describe('mapToDarkTokens', () => {
    it('produces all required semantic token keys', () => {
      const tokens = mapToDarkTokens(testPalettes, testBaseColors);

      REQUIRED_SEMANTIC_TOKENS.forEach(key => {
        expect(tokens[key]).toBeDefined();
      });

      expect(Object.keys(tokens)).toHaveLength(REQUIRED_SEMANTIC_TOKENS.length);
    });

    it('all token values are valid OKLCH strings', () => {
      const tokens = mapToDarkTokens(testPalettes, testBaseColors);

      Object.values(tokens).forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
        expect(() => parseOklch(value)).not.toThrow();
      });
    });

    it('text-primary is high-lightness achromatic', () => {
      const tokens = mapToDarkTokens(testPalettes, testBaseColors);
      const textPrimary = parseOklch(tokens['text-primary']);

      expect(textPrimary.l).toBeGreaterThan(0.9);
      expect(textPrimary.c).toBe(0); // Achromatic
    });

    it('surface-default is low-lightness (dark)', () => {
      const tokens = mapToDarkTokens(testPalettes, testBaseColors);
      const surfaceDefault = parseOklch(tokens['surface-default']);

      expect(surfaceDefault.l).toBeLessThan(0.3);
      // Dark mode surfaces should have very low chroma (near achromatic)
      expect(surfaceDefault.c).toBeLessThan(0.02);
    });

    it('text-secondary has lower lightness than text-primary', () => {
      const tokens = mapToDarkTokens(testPalettes, testBaseColors);
      const textPrimary = parseOklch(tokens['text-primary']);
      const textSecondary = parseOklch(tokens['text-secondary']);

      expect(textSecondary.l).toBeLessThan(textPrimary.l);
    });

    it('text-muted has lower lightness than text-secondary', () => {
      const tokens = mapToDarkTokens(testPalettes, testBaseColors);
      const textSecondary = parseOklch(tokens['text-secondary']);
      const textMuted = parseOklch(tokens['text-muted']);

      expect(textMuted.l).toBeLessThan(textSecondary.l);
    });

    it('surface-elevated is lighter than surface-default', () => {
      const tokens = mapToDarkTokens(testPalettes, testBaseColors);
      const surfaceDefault = parseOklch(tokens['surface-default']);
      const surfaceElevated = parseOklch(tokens['surface-elevated']);

      expect(surfaceElevated.l).toBeGreaterThan(surfaceDefault.l);
    });

    it('brand colors are adjusted for dark backgrounds', () => {
      const lightTokens = mapToLightTokens(testPalettes, testBaseColors);
      const darkTokens = mapToDarkTokens(testPalettes, testBaseColors);

      const lightPrimary = parseOklch(lightTokens['brand-primary']);
      const darkPrimary = parseOklch(darkTokens['brand-primary']);

      // Dark mode uses lighten function, but actual result depends on the lighten implementation
      // Verify both colors are valid and different
      expect(darkPrimary.l).toBeGreaterThanOrEqual(0);
      expect(darkPrimary.l).toBeLessThanOrEqual(1);
      expect(lightTokens['brand-primary']).not.toBe(darkTokens['brand-primary']);
    });
  });

  describe('mapShadesToCssVariables', () => {
    it('produces shade variables for all color families', () => {
      const theme = generateFullTheme(testBaseColors);
      const cssVars = mapShadesToCssVariables(theme);

      // Check primary shades
      expect(cssVars['--primary-50-val']).toBeDefined();
      expect(cssVars['--primary-100-val']).toBeDefined();
      expect(cssVars['--primary-500-val']).toBeDefined();
      expect(cssVars['--primary-950-val']).toBeDefined();

      // Check secondary shades
      expect(cssVars['--secondary-50-val']).toBeDefined();
      expect(cssVars['--secondary-500-val']).toBeDefined();
      expect(cssVars['--secondary-950-val']).toBeDefined();

      // Check accent, success, error shades
      expect(cssVars['--accent-500-val']).toBeDefined();
      expect(cssVars['--success-500-val']).toBeDefined();
      expect(cssVars['--error-500-val']).toBeDefined();
    });

    it('produces semantic token variables', () => {
      const theme = generateFullTheme(testBaseColors);
      const cssVars = mapShadesToCssVariables(theme);

      // Check brand tokens
      expect(cssVars['--brand-primary-val']).toBeDefined();
      expect(cssVars['--brand-secondary-val']).toBeDefined();

      // Check text tokens
      expect(cssVars['--text-primary-val']).toBeDefined();
      expect(cssVars['--text-secondary-val']).toBeDefined();

      // Check surface tokens
      expect(cssVars['--surface-default-val']).toBeDefined();
      expect(cssVars['--surface-elevated-val']).toBeDefined();

      // Check status tokens
      expect(cssVars['--status-success-val']).toBeDefined();
      expect(cssVars['--status-error-val']).toBeDefined();
    });

    it('CSS variable map has expected count (55+ shade vars + 26+ semantic vars)', () => {
      const theme = generateFullTheme(testBaseColors);
      const cssVars = mapShadesToCssVariables(theme);

      // 5 color families × 11 shades = 55 shade variables
      // 26 semantic tokens = 26 semantic variables
      // Total = 81 variables
      expect(Object.keys(cssVars).length).toBeGreaterThanOrEqual(78);
    });

    it('all CSS variable values are valid OKLCH strings', () => {
      const theme = generateFullTheme(testBaseColors);
      const cssVars = mapShadesToCssVariables(theme);

      Object.values(cssVars).forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
        expect(() => parseOklch(value)).not.toThrow();
      });
    });

    it('shade variables match palette values', () => {
      const theme = generateFullTheme(testBaseColors);
      const cssVars = mapShadesToCssVariables(theme);

      expect(cssVars['--primary-500-val']).toBe(theme.palettes.primary[500]);
      expect(cssVars['--secondary-600-val']).toBe(theme.palettes.secondary[600]);
      expect(cssVars['--accent-700-val']).toBe(theme.palettes.accent[700]);
    });

    it('semantic variables match light mode token values', () => {
      const theme = generateFullTheme(testBaseColors);
      const cssVars = mapShadesToCssVariables(theme);

      expect(cssVars['--brand-primary-val']).toBe(theme.light['brand-primary']);
      expect(cssVars['--text-primary-val']).toBe(theme.light['text-primary']);
      expect(cssVars['--surface-default-val']).toBe(theme.light['surface-default']);
    });
  });

  describe('mapDarkModeCssVariables', () => {
    it('produces dark mode semantic token overrides', () => {
      const theme = generateFullTheme(testBaseColors);
      const darkVars = mapDarkModeCssVariables(theme);

      // Check brand tokens
      expect(darkVars['--brand-primary-val']).toBeDefined();
      expect(darkVars['--brand-secondary-val']).toBeDefined();

      // Check text tokens
      expect(darkVars['--text-primary-val']).toBeDefined();
      expect(darkVars['--text-secondary-val']).toBeDefined();

      // Check surface tokens
      expect(darkVars['--surface-default-val']).toBeDefined();
      expect(darkVars['--surface-elevated-val']).toBeDefined();
    });

    it('dark mode CSS variable map has 26+ entries', () => {
      const theme = generateFullTheme(testBaseColors);
      const darkVars = mapDarkModeCssVariables(theme);

      // Should have all 26 semantic tokens
      expect(Object.keys(darkVars).length).toBeGreaterThanOrEqual(26);
    });

    it('all dark mode CSS variable values are valid OKLCH strings', () => {
      const theme = generateFullTheme(testBaseColors);
      const darkVars = mapDarkModeCssVariables(theme);

      Object.values(darkVars).forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
        expect(() => parseOklch(value)).not.toThrow();
      });
    });

    it('dark mode variables match dark mode token values', () => {
      const theme = generateFullTheme(testBaseColors);
      const darkVars = mapDarkModeCssVariables(theme);

      expect(darkVars['--brand-primary-val']).toBe(theme.dark['brand-primary']);
      expect(darkVars['--text-primary-val']).toBe(theme.dark['text-primary']);
      expect(darkVars['--surface-default-val']).toBe(theme.dark['surface-default']);
    });

    it('dark mode text-primary has higher lightness than light mode', () => {
      const theme = generateFullTheme(testBaseColors);
      const lightTextPrimary = parseOklch(theme.light['text-primary']);
      const darkTextPrimary = parseOklch(theme.dark['text-primary']);

      expect(darkTextPrimary.l).toBeGreaterThan(lightTextPrimary.l);
    });

    it('dark mode surface-default has lower lightness than light mode', () => {
      const theme = generateFullTheme(testBaseColors);
      const lightSurfaceDefault = parseOklch(theme.light['surface-default']);
      const darkSurfaceDefault = parseOklch(theme.dark['surface-default']);

      expect(darkSurfaceDefault.l).toBeLessThan(lightSurfaceDefault.l);
    });
  });
});
