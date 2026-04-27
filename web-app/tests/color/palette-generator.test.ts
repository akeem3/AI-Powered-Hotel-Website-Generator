import { describe, it, expect } from '@jest/globals';
import { generateShadeScale, generateFullPalettes, generateFullTheme } from '@/lib/color/palette-generator';
import { parseOklch } from '@/lib/color/oklch-parser';
import { SHADE_STEPS } from '@/lib/color/types';
import type { HotelBaseColors } from '@/lib/color/types';

const OKLCH_REGEX = /^oklch\([\d.]+ [\d.]+ [\d.]+\)$/;

describe('Palette Generator', () => {
  describe('generateShadeScale', () => {
    it('produces all 11 steps (50-950)', () => {
      const baseColor = 'oklch(0.65 0.2 230)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        expect(scale[step]).toBeDefined();
      });

      expect(Object.keys(scale)).toHaveLength(11);
    });

    it('all generated colors are valid OKLCH strings', () => {
      const baseColor = 'oklch(0.65 0.2 230)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        expect(scale[step]).toMatch(OKLCH_REGEX);
        expect(() => parseOklch(scale[step])).not.toThrow();
      });
    });

    it('shade scale has monotonically decreasing lightness (50=lightest, 950=darkest)', () => {
      const baseColor = 'oklch(0.65 0.2 230)';
      const scale = generateShadeScale(baseColor);

      const lightnesses = SHADE_STEPS.map(step => parseOklch(scale[step]).l);

      for (let i = 1; i < lightnesses.length; i++) {
        expect(lightnesses[i]).toBeLessThan(lightnesses[i - 1]);
      }

      // Verify extremes
      const lightest = parseOklch(scale[50]).l;
      const darkest = parseOklch(scale[950]).l;
      expect(lightest).toBeGreaterThan(0.9);
      expect(darkest).toBeLessThan(0.3);
    });

    it('works for hue 0 (red)', () => {
      const baseColor = 'oklch(0.65 0.2 0)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.h).toBeCloseTo(0, 1);
      });
    });

    it('works for hue 90 (yellow-green)', () => {
      const baseColor = 'oklch(0.65 0.2 90)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.h).toBeCloseTo(90, 1);
      });
    });

    it('works for hue 180 (cyan)', () => {
      const baseColor = 'oklch(0.65 0.2 180)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.h).toBeCloseTo(180, 1);
      });
    });

    it('works for hue 270 (purple)', () => {
      const baseColor = 'oklch(0.65 0.2 270)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.h).toBeCloseTo(270, 1);
      });
    });

    it('works for hue 360 (red, wraps to 0)', () => {
      const baseColor = 'oklch(0.65 0.2 360)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        // Should be close to 0 or 360 (same hue)
        expect(color.h % 360).toBeCloseTo(0, 1);
      });
    });

    it('works for chroma 0 (gray)', () => {
      const baseColor = 'oklch(0.65 0 0)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.c).toBeGreaterThanOrEqual(0);
        expect(color.c).toBeLessThan(0.1); // Should remain very low chroma
      });
    });

    it('works for chroma 0.1 (subtle color)', () => {
      const baseColor = 'oklch(0.65 0.1 230)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.c).toBeGreaterThanOrEqual(0);
      });
    });

    it('works for chroma 0.2 (moderate color)', () => {
      const baseColor = 'oklch(0.65 0.2 230)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.c).toBeGreaterThanOrEqual(0);
      });
    });

    it('works for chroma 0.3 (vivid color)', () => {
      const baseColor = 'oklch(0.65 0.3 230)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.c).toBeGreaterThanOrEqual(0);
      });
    });

    it('all generated colors are displayable in sRGB (reasonable lightness)', () => {
      const baseColor = 'oklch(0.65 0.2 230)';
      const scale = generateShadeScale(baseColor);

      SHADE_STEPS.forEach(step => {
        const color = parseOklch(scale[step]);
        expect(color.l).toBeGreaterThanOrEqual(0);
        expect(color.l).toBeLessThanOrEqual(1);
        expect(color.c).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('generateFullPalettes', () => {
    it('works with only 2 required colors', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
      };

      const palettes = generateFullPalettes(baseColors);

      expect(palettes.primary).toBeDefined();
      expect(palettes.secondary).toBeDefined();
      expect(palettes.accent).toBeDefined();
      expect(palettes.success).toBeDefined();
      expect(palettes.error).toBeDefined();

      // Check all palettes have 11 steps
      expect(Object.keys(palettes.primary)).toHaveLength(11);
      expect(Object.keys(palettes.secondary)).toHaveLength(11);
      expect(Object.keys(palettes.accent)).toHaveLength(11);
      expect(Object.keys(palettes.success)).toHaveLength(11);
      expect(Object.keys(palettes.error)).toHaveLength(11);
    });

    it('works with all 5 colors provided', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
        brandAccent: 'oklch(0.7 0.15 50)',
        statusSuccess: 'oklch(0.6 0.15 150)',
        statusError: 'oklch(0.6 0.2 27)',
      };

      const palettes = generateFullPalettes(baseColors);

      expect(palettes.primary).toBeDefined();
      expect(palettes.secondary).toBeDefined();
      expect(palettes.accent).toBeDefined();
      expect(palettes.success).toBeDefined();
      expect(palettes.error).toBeDefined();

      // Verify custom success hue is used
      const successColor = parseOklch(palettes.success[500]);
      expect(successColor.h).toBeCloseTo(150, 1);

      // Verify custom error hue is used
      const errorColor = parseOklch(palettes.error[500]);
      expect(errorColor.h).toBeCloseTo(27, 0);
    });

    it('default accent is complementary hue (+180 degrees)', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
      };

      const palettes = generateFullPalettes(baseColors);
      const primaryColor = parseOklch(baseColors.brandPrimary);
      const accentColor = parseOklch(palettes.accent[500]);

      const expectedHue = (primaryColor.h + 180) % 360;
      expect(accentColor.h).toBeCloseTo(expectedHue, 1);
    });

    it('default success has hue near 150', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
      };

      const palettes = generateFullPalettes(baseColors);
      const successColor = parseOklch(palettes.success[500]);

      expect(successColor.h).toBeCloseTo(150, 5);
    });

    it('default error has hue near 27', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
      };

      const palettes = generateFullPalettes(baseColors);
      const errorColor = parseOklch(palettes.error[500]);

      expect(errorColor.h).toBeCloseTo(27, 5);
    });

    it('all palette values are valid OKLCH strings', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
      };

      const palettes = generateFullPalettes(baseColors);

      const allPaletteValues = [
        ...Object.values(palettes.primary),
        ...Object.values(palettes.secondary),
        ...Object.values(palettes.accent),
        ...Object.values(palettes.success),
        ...Object.values(palettes.error),
      ];

      allPaletteValues.forEach(value => {
        expect(value).toMatch(OKLCH_REGEX);
        expect(() => parseOklch(value)).not.toThrow();
      });
    });
  });

  describe('generateFullTheme', () => {
    it('generates complete theme with blue/gold colors', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)', // Blue
        brandSecondary: 'oklch(0.75 0.15 60)', // Gold
      };

      const theme = generateFullTheme(baseColors);

      expect(theme.palettes).toBeDefined();
      expect(theme.light).toBeDefined();
      expect(theme.dark).toBeDefined();

      expect(Object.keys(theme.palettes)).toHaveLength(5);
      expect(Object.keys(theme.light).length).toBeGreaterThan(20);
      expect(Object.keys(theme.dark).length).toBeGreaterThan(20);
    });

    it('generates complete theme with purple/orange colors', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.6 0.22 290)', // Purple
        brandSecondary: 'oklch(0.7 0.18 40)', // Orange
      };

      const theme = generateFullTheme(baseColors);

      expect(theme.palettes).toBeDefined();
      expect(theme.light).toBeDefined();
      expect(theme.dark).toBeDefined();
    });

    it('generates complete theme with green/pink colors', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.65 0.18 140)', // Green
        brandSecondary: 'oklch(0.7 0.2 350)', // Pink
      };

      const theme = generateFullTheme(baseColors);

      expect(theme.palettes).toBeDefined();
      expect(theme.light).toBeDefined();
      expect(theme.dark).toBeDefined();
    });

    it('all generated themes have valid OKLCH values throughout', () => {
      const themes = [
        { brandPrimary: 'oklch(0.55 0.2 230)', brandSecondary: 'oklch(0.75 0.15 60)' },
        { brandPrimary: 'oklch(0.6 0.22 290)', brandSecondary: 'oklch(0.7 0.18 40)' },
        { brandPrimary: 'oklch(0.65 0.18 140)', brandSecondary: 'oklch(0.7 0.2 350)' },
      ];

      themes.forEach(baseColors => {
        const theme = generateFullTheme(baseColors);

        // Check all palette values
        Object.values(theme.palettes).forEach(palette => {
          Object.values(palette).forEach((color: unknown) => {
            expect(color).toMatch(OKLCH_REGEX);
            expect(() => parseOklch(color as string)).not.toThrow();
          });
        });

        // Check all light mode tokens
        Object.values(theme.light).forEach(color => {
          expect(color).toMatch(OKLCH_REGEX);
          expect(() => parseOklch(color)).not.toThrow();
        });

        // Check all dark mode tokens
        Object.values(theme.dark).forEach(color => {
          expect(color).toMatch(OKLCH_REGEX);
          expect(() => parseOklch(color)).not.toThrow();
        });
      });
    });
  });

  describe('palette consistency', () => {
    it('primary palette preserves hue across all shades', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
      };

      const palettes = generateFullPalettes(baseColors);
      const primaryHue = parseOklch(baseColors.brandPrimary).h;

      SHADE_STEPS.forEach(step => {
        const shadeColor = parseOklch(palettes.primary[step]);
        expect(shadeColor.h).toBeCloseTo(primaryHue, 1);
      });
    });

    it('secondary palette preserves hue across all shades', () => {
      const baseColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.2 230)',
        brandSecondary: 'oklch(0.65 0.18 280)',
      };

      const palettes = generateFullPalettes(baseColors);
      const secondaryHue = parseOklch(baseColors.brandSecondary).h;

      SHADE_STEPS.forEach(step => {
        const shadeColor = parseOklch(palettes.secondary[step]);
        expect(shadeColor.h).toBeCloseTo(secondaryHue, 1);
      });
    });
  });
});
