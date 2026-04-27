import { describe, it, expect } from '@jest/globals';
import { generateFullTheme } from '@/lib/color/palette-generator';
import { mapShadesToCssVariables, mapDarkModeCssVariables } from '@/lib/color/semantic-mapper';
import { validateThemeContrast } from '@/lib/color/contrast-validator';
import { parseOklch } from '@/lib/color/oklch-parser';
import { SHADE_STEPS } from '@/lib/color/types';
import type { HotelBaseColors } from '@/lib/color/types';

const OKLCH_REGEX = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/;

describe('Color Library Integration', () => {
  describe('Full Pipeline: generateFullTheme', () => {
    it('blue/gold theme produces complete theme', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)', // Blue
        brandSecondary: 'oklch(0.75 0.15 60)', // Gold
      };

      const theme = generateFullTheme(baseColors);

      // Check structure
      expect(theme).toHaveProperty('palettes');
      expect(theme).toHaveProperty('light');
      expect(theme).toHaveProperty('dark');

      // Check palettes
      expect(theme.palettes).toHaveProperty('primary');
      expect(theme.palettes).toHaveProperty('secondary');
      expect(theme.palettes).toHaveProperty('accent');
      expect(theme.palettes).toHaveProperty('success');
      expect(theme.palettes).toHaveProperty('error');

      // Check semantic tokens
      expect(Object.keys(theme.light).length).toBeGreaterThanOrEqual(25);
      expect(Object.keys(theme.dark).length).toBeGreaterThanOrEqual(25);
    });

    it('purple/orange theme produces complete theme', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.6 0.22 290)', // Purple
        brandSecondary: 'oklch(0.7 0.18 40)', // Orange
      };

      const theme = generateFullTheme(baseColors);

      // Check all palettes exist and have 11 shades
      SHADE_STEPS.forEach(step => {
        expect(theme.palettes.primary[step]).toBeDefined();
        expect(theme.palettes.secondary[step]).toBeDefined();
        expect(theme.palettes.accent[step]).toBeDefined();
        expect(theme.palettes.success[step]).toBeDefined();
        expect(theme.palettes.error[step]).toBeDefined();
      });

      // Verify colors are purple/orange
      const primaryColor = parseOklch(theme.palettes.primary[500]);
      const secondaryColor = parseOklch(theme.palettes.secondary[500]);

      expect(primaryColor.h).toBeCloseTo(290, 5);
      expect(secondaryColor.h).toBeCloseTo(40, 5);
    });

    it('green/pink theme produces complete theme', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.65 0.18 140)', // Green
        brandSecondary: 'oklch(0.7 0.2 350)', // Pink
      };

      const theme = generateFullTheme(baseColors);

      // Check essential semantic tokens exist
      expect(theme.light['brand-primary']).toBeDefined();
      expect(theme.light['text-primary']).toBeDefined();
      expect(theme.light['surface-default']).toBeDefined();

      expect(theme.dark['brand-primary']).toBeDefined();
      expect(theme.dark['text-primary']).toBeDefined();
      expect(theme.dark['surface-default']).toBeDefined();
    });
  });

  describe('Theme Validity: All OKLCH Values', () => {
    const themes = [
      {
        name: 'Blue/Gold',
        colors: { brandPrimary: 'oklch(0.55 0.2 230)', brandSecondary: 'oklch(0.75 0.15 60)' },
      },
      {
        name: 'Purple/Orange',
        colors: { brandPrimary: 'oklch(0.6 0.22 290)', brandSecondary: 'oklch(0.7 0.18 40)' },
      },
      {
        name: 'Green/Pink',
        colors: { brandPrimary: 'oklch(0.65 0.18 140)', brandSecondary: 'oklch(0.7 0.2 350)' },
      },
    ];

    themes.forEach(({ name, colors }) => {
      it(`${name} theme has valid OKLCH values in all palettes`, () => {
        const theme = generateFullTheme(colors);

        // Check all palette values
        Object.values(theme.palettes).forEach(palette => {
          SHADE_STEPS.forEach(step => {
            const color = palette[step];
            expect(color).toMatch(OKLCH_REGEX);
            expect(() => parseOklch(color)).not.toThrow();
          });
        });
      });

      it(`${name} theme has valid OKLCH values in light mode tokens`, () => {
        const theme = generateFullTheme(colors);

        Object.values(theme.light).forEach(color => {
          expect(color).toMatch(OKLCH_REGEX);
          expect(() => parseOklch(color)).not.toThrow();
        });
      });

      it(`${name} theme has valid OKLCH values in dark mode tokens`, () => {
        const theme = generateFullTheme(colors);

        Object.values(theme.dark).forEach(color => {
          expect(color).toMatch(OKLCH_REGEX);
          expect(() => parseOklch(color)).not.toThrow();
        });
      });
    });
  });

  describe('Theme Contrast Validation', () => {
    const themes = [
      {
        name: 'Blue/Gold',
        colors: { brandPrimary: 'oklch(0.55 0.2 230)', brandSecondary: 'oklch(0.75 0.15 60)' },
      },
      {
        name: 'Purple/Orange',
        colors: { brandPrimary: 'oklch(0.6 0.22 290)', brandSecondary: 'oklch(0.7 0.18 40)' },
      },
      {
        name: 'Green/Pink',
        colors: { brandPrimary: 'oklch(0.65 0.18 140)', brandSecondary: 'oklch(0.7 0.2 350)' },
      },
    ];

    themes.forEach(({ name, colors }) => {
      it(`${name} theme passes contrast validation`, () => {
        const theme = generateFullTheme(colors);
        const report = validateThemeContrast(theme);

        // Report should be generated
        expect(report.pairs.length).toBeGreaterThan(0);

        // At least 70% of pairs should pass for a well-constructed theme
        const passRate = (report.pairs.length - report.failCount) / report.pairs.length;
        expect(passRate).toBeGreaterThanOrEqual(0.7);
      });
    });
  });

  describe('CSS Variable Mapping', () => {
    const baseColors: HotelBaseColors = {
      brandPrimary: 'oklch(0.55 0.2 230)',
      brandSecondary: 'oklch(0.75 0.15 60)',
    };

    it('CSS variable map has expected count (55+ shade vars + 25+ semantic vars)', () => {
      const theme = generateFullTheme(baseColors);
      const cssVars = mapShadesToCssVariables(theme);

      // 5 color families × 11 shades = 55 shade variables
      // 25 semantic tokens = 25 semantic variables
      // Total = 80 variables
      expect(Object.keys(cssVars).length).toBeGreaterThanOrEqual(80);
    });

    it('CSS variable map includes all shade steps for primary', () => {
      const theme = generateFullTheme(baseColors);
      const cssVars = mapShadesToCssVariables(theme);

      SHADE_STEPS.forEach(step => {
        expect(cssVars[`--primary-${step}-val`]).toBeDefined();
        expect(cssVars[`--primary-${step}-val`]).toMatch(OKLCH_REGEX);
      });
    });

    it('CSS variable map includes all shade steps for secondary', () => {
      const theme = generateFullTheme(baseColors);
      const cssVars = mapShadesToCssVariables(theme);

      SHADE_STEPS.forEach(step => {
        expect(cssVars[`--secondary-${step}-val`]).toBeDefined();
        expect(cssVars[`--secondary-${step}-val`]).toMatch(OKLCH_REGEX);
      });
    });

    it('CSS variable map includes semantic tokens', () => {
      const theme = generateFullTheme(baseColors);
      const cssVars = mapShadesToCssVariables(theme);

      // Brand tokens
      expect(cssVars['--brand-primary-val']).toBe(theme.light['brand-primary']);
      expect(cssVars['--brand-secondary-val']).toBe(theme.light['brand-secondary']);

      // Text tokens
      expect(cssVars['--text-primary-val']).toBe(theme.light['text-primary']);
      expect(cssVars['--text-secondary-val']).toBe(theme.light['text-secondary']);

      // Surface tokens
      expect(cssVars['--surface-default-val']).toBe(theme.light['surface-default']);
      expect(cssVars['--surface-elevated-val']).toBe(theme.light['surface-elevated']);
    });

    it('dark mode CSS variable map has 25+ entries', () => {
      const theme = generateFullTheme(baseColors);
      const darkVars = mapDarkModeCssVariables(theme);

      expect(Object.keys(darkVars).length).toBeGreaterThanOrEqual(25);
    });

    it('dark mode CSS variables override semantic tokens', () => {
      const theme = generateFullTheme(baseColors);
      const darkVars = mapDarkModeCssVariables(theme);

      // Brand tokens
      expect(darkVars['--brand-primary-val']).toBe(theme.dark['brand-primary']);

      // Text tokens
      expect(darkVars['--text-primary-val']).toBe(theme.dark['text-primary']);

      // Surface tokens
      expect(darkVars['--surface-default-val']).toBe(theme.dark['surface-default']);
    });

    it('all CSS variable names start with --', () => {
      const theme = generateFullTheme(baseColors);
      const cssVars = mapShadesToCssVariables(theme);
      const darkVars = mapDarkModeCssVariables(theme);

      Object.keys(cssVars).forEach(key => {
        expect(key).toMatch(/^--/);
      });

      Object.keys(darkVars).forEach(key => {
        expect(key).toMatch(/^--/);
      });
    });

    it('all CSS variable names end with -val', () => {
      const theme = generateFullTheme(baseColors);
      const cssVars = mapShadesToCssVariables(theme);
      const darkVars = mapDarkModeCssVariables(theme);

      Object.keys(cssVars).forEach(key => {
        expect(key).toMatch(/-val$/);
      });

      Object.keys(darkVars).forEach(key => {
        expect(key).toMatch(/-val$/);
      });
    });
  });

  describe('End-to-End Theme Generation', () => {
    it('complete workflow: input -> theme -> CSS vars -> validation', () => {
      // Step 1: Define base colors
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.75 0.15 60)',
      };

      // Step 2: Generate full theme
      const theme = generateFullTheme(baseColors);
      expect(theme).toBeDefined();

      // Step 3: Map to CSS variables
      const cssVars = mapShadesToCssVariables(theme);
      const darkVars = mapDarkModeCssVariables(theme);

      expect(Object.keys(cssVars).length).toBeGreaterThan(0);
      expect(Object.keys(darkVars).length).toBeGreaterThan(0);

      // Step 4: Validate contrast
      const contrastReport = validateThemeContrast(theme);
      expect(contrastReport).toBeDefined();
      expect(contrastReport.pairs.length).toBeGreaterThan(0);

      // Step 5: Verify all values are valid OKLCH
      Object.values(cssVars).forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
      });

      Object.values(darkVars).forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
      });
    });

    it('theme generation is deterministic', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.75 0.15 60)',
      };

      const theme1 = generateFullTheme(baseColors);
      const theme2 = generateFullTheme(baseColors);

      // Check palettes are identical
      expect(theme1.palettes).toEqual(theme2.palettes);

      // Check light mode tokens are identical
      expect(theme1.light).toEqual(theme2.light);

      // Check dark mode tokens are identical
      expect(theme1.dark).toEqual(theme2.dark);
    });

    it('minimal input produces complete usable theme', () => {
      const minimalColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.5 0.2 200)',
        brandSecondary: 'oklch(0.6 0.15 300)',
      };

      const theme = generateFullTheme(minimalColors);

      // Verify completeness
      expect(Object.keys(theme.palettes)).toHaveLength(5);
      expect(Object.keys(theme.light).length).toBeGreaterThanOrEqual(25);
      expect(Object.keys(theme.dark).length).toBeGreaterThanOrEqual(25);

      // Verify CSS vars can be generated
      const cssVars = mapShadesToCssVariables(theme);
      expect(Object.keys(cssVars).length).toBeGreaterThanOrEqual(80);

      // Verify contrast can be validated
      const report = validateThemeContrast(theme);
      expect(report.pairs.length).toBeGreaterThan(0);
    });

    it('different input colors produce different themes', () => {
      const blueGold: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.75 0.15 60)',
      };

      const greenPink: HotelBaseColors = {
        brandPrimary: 'oklch(0.65 0.18 140)',
        brandSecondary: 'oklch(0.7 0.2 350)',
      };

      const theme1 = generateFullTheme(blueGold);
      const theme2 = generateFullTheme(greenPink);

      // Themes should be different
      expect(theme1.palettes.primary[500]).not.toBe(theme2.palettes.primary[500]);
      expect(theme1.light['brand-primary']).not.toBe(theme2.light['brand-primary']);
    });
  });
});
