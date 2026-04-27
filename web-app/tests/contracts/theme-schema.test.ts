import { HotelThemeSchema, HotelTheme } from '@/lib/validation/theme-schema';

describe('HotelThemeSchema', () => {
  const validTheme: HotelTheme = {
    colors: {
      brandPrimary: 'oklch(0.346 0.074 256)',
      brandSecondary: 'oklch(0.748 0.099 86.1)',
    },
    typography: {
      displayFont: 'Playfair Display, serif',
      bodyFont: 'Inter, sans-serif',
    },
  };

  describe('OKLCH validation', () => {
    it('should accept a valid theme with 2 OKLCH colors (minimum)', () => {
      const result = HotelThemeSchema.safeParse(validTheme);
      expect(result.success).toBe(true);
    });

    it('should accept theme with 3 OKLCH colors (brandAccent)', () => {
      const theme = {
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandAccent: 'oklch(0.65 0.12 50)',
        },
      };
      const result = HotelThemeSchema.safeParse(theme);
      expect(result.success).toBe(true);
    });

    it('should accept theme with 4 OKLCH colors', () => {
      const theme = {
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandAccent: 'oklch(0.65 0.12 50)',
          statusSuccess: 'oklch(0.448 0.108 150)',
        },
      };
      const result = HotelThemeSchema.safeParse(theme);
      expect(result.success).toBe(true);
    });

    it('should accept theme with all 5 OKLCH colors', () => {
      const theme = {
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandAccent: 'oklch(0.65 0.12 50)',
          statusSuccess: 'oklch(0.448 0.108 150)',
          statusError: 'oklch(0.577 0.215 27)',
        },
      };
      const result = HotelThemeSchema.safeParse(theme);
      expect(result.success).toBe(true);
    });

    it('should accept OKLCH values with different decimal precision', () => {
      const themes = [
        {
          ...validTheme,
          colors: {
            brandPrimary: 'oklch(0.5 0.1 180)',
            brandSecondary: 'oklch(0.7 0.2 90)',
          },
        },
        {
          ...validTheme,
          colors: {
            brandPrimary: 'oklch(0.555 0.123 230.5)',
            brandSecondary: 'oklch(0.999 0.001 0.1)',
          },
        },
        {
          ...validTheme,
          colors: {
            brandPrimary: 'oklch(0 0 0)',
            brandSecondary: 'oklch(1 0 0)',
          },
        },
      ];

      themes.forEach(theme => {
        const result = HotelThemeSchema.safeParse(theme);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('HSL rejection', () => {
    it('should reject HSL format strings', () => {
      const hslTheme = {
        ...validTheme,
        colors: {
          brandPrimary: '210 50% 45%',
          brandSecondary: '0 0% 95%',
        },
      };

      const result = HotelThemeSchema.safeParse(hslTheme);
      expect(result.success).toBe(false);
    });

    it('should reject mixed HSL and OKLCH', () => {
      const mixedTheme = {
        ...validTheme,
        colors: {
          brandPrimary: 'oklch(0.55 0.12 230)',
          brandSecondary: '210 50% 45%',
        },
      };

      const result = HotelThemeSchema.safeParse(mixedTheme);
      expect(result.success).toBe(false);
    });
  });

  describe('invalid format rejection', () => {
    it('should reject hex format', () => {
      const hexTheme = {
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandPrimary: '#1e3a5f',
        },
      };

      const result = HotelThemeSchema.safeParse(hexTheme);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Must be OKLCH format');
      }
    });

    it('should reject RGB format', () => {
      const rgbTheme = {
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandSecondary: 'rgb(201, 169, 97)',
        },
      };

      const result = HotelThemeSchema.safeParse(rgbTheme);
      expect(result.success).toBe(false);
    });

    it('should reject invalid OKLCH (missing components)', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandPrimary: 'oklch(0.5 0.1)',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty string colors', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandPrimary: '',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid optional color format', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        colors: {
          ...validTheme.colors,
          brandAccent: 'not-a-color',
        },
      });
      expect(result.success).toBe(false);
    });
  });

  describe('typography validation', () => {
    it('should reject theme with empty displayFont', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        typography: {
          displayFont: '',
          bodyFont: 'Inter, sans-serif',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should reject theme with empty bodyFont', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        typography: {
          displayFont: 'Playfair Display, serif',
          bodyFont: '',
        },
      });
      expect(result.success).toBe(false);
    });

    it('should accept various font formats', () => {
      const fontVariations = [
        'Montserrat, sans-serif',
        'Poppins, sans-serif',
        'Georgia, serif',
        'system-ui, sans-serif',
      ];

      fontVariations.forEach(displayFont => {
        const theme = {
          ...validTheme,
          typography: {
            displayFont,
            bodyFont: 'Inter, sans-serif',
          },
        };
        const result = HotelThemeSchema.safeParse(theme);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('required fields', () => {
    it('should reject theme missing colors property', () => {
      const result = HotelThemeSchema.safeParse({
        typography: validTheme.typography,
      });
      expect(result.success).toBe(false);
    });

    it('should reject theme missing typography property', () => {
      const result = HotelThemeSchema.safeParse({
        colors: validTheme.colors,
      });
      expect(result.success).toBe(false);
    });

    it('should reject theme with missing brandPrimary', () => {
      const result = HotelThemeSchema.safeParse({
        colors: {
          brandSecondary: validTheme.colors.brandSecondary,
        },
        typography: validTheme.typography,
      });
      expect(result.success).toBe(false);
    });

    it('should reject theme with missing brandSecondary', () => {
      const result = HotelThemeSchema.safeParse({
        colors: {
          brandPrimary: validTheme.colors.brandPrimary,
        },
        typography: validTheme.typography,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('type inference', () => {
    it('should correctly infer TypeScript type with required fields', () => {
      const theme: HotelTheme = validTheme;
      expect(theme.colors.brandPrimary).toBe('oklch(0.346 0.074 256)');
      expect(theme.typography.displayFont).toBe('Playfair Display, serif');
    });

    it('should correctly infer optional color fields', () => {
      const theme: HotelTheme = {
        colors: {
          brandPrimary: 'oklch(0.55 0.12 230)',
          brandSecondary: 'oklch(0.75 0.1 86)',
          brandAccent: 'oklch(0.65 0.12 50)',
        },
        typography: {
          displayFont: 'Playfair Display, serif',
          bodyFont: 'Inter, sans-serif',
        },
      };
      expect(theme.colors.brandAccent).toBe('oklch(0.65 0.12 50)');
      expect(theme.colors.statusSuccess).toBeUndefined();
    });

    it('should provide type safety after parsing', () => {
      const result = HotelThemeSchema.safeParse(validTheme);
      if (result.success) {
        const parsedTheme: HotelTheme = result.data;
        expect(typeof parsedTheme.colors.brandPrimary).toBe('string');
        expect(typeof parsedTheme.typography.displayFont).toBe('string');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle whitespace in font strings', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        typography: {
          displayFont: '  Playfair Display, serif  ',
          bodyFont: 'Inter, sans-serif',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept achromatic OKLCH (zero chroma)', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        colors: {
          brandPrimary: 'oklch(0.5 0 0)',
          brandSecondary: 'oklch(0.9 0 0)',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept boundary lightness values', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        colors: {
          brandPrimary: 'oklch(0 0 0)',
          brandSecondary: 'oklch(1 0 0)',
        },
      });
      expect(result.success).toBe(true);
    });

    it('should accept OKLCH with whitespace padding', () => {
      const result = HotelThemeSchema.safeParse({
        ...validTheme,
        colors: {
          brandPrimary: 'oklch( 0.55 0.12 230 )',
          brandSecondary: 'oklch(  0.75  0.1  86  )',
        },
      });
      expect(result.success).toBe(true);
    });
  });
});
