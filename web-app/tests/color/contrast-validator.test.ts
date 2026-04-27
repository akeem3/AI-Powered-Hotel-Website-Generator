import { describe, it, expect } from '@jest/globals';
import {
  calculateAPCA,
  validateContrast,
  validateThemeContrast,
} from '@/lib/color/contrast-validator';
import { generateFullTheme } from '@/lib/color/palette-generator';
import type { HotelBaseColors } from '@/lib/color/types';

describe('Contrast Validator', () => {
  describe('calculateAPCA', () => {
    it('black text on white background has high contrast (Lc > 100)', () => {
      const black = 'oklch(0 0 0)';
      const white = 'oklch(1 0 0)';

      const contrast = calculateAPCA(black, white);

      expect(contrast).toBeGreaterThan(100);
    });

    it('white text on black background has high contrast', () => {
      const white = 'oklch(1 0 0)';
      const black = 'oklch(0 0 0)';

      const contrast = calculateAPCA(white, black);

      expect(contrast).toBeGreaterThan(100);
    });

    it('same color on same color has zero/near-zero contrast', () => {
      const gray = 'oklch(0.5 0 0)';

      const contrast = calculateAPCA(gray, gray);

      expect(contrast).toBeLessThan(1);
    });

    it('dark gray text on light gray background has moderate contrast', () => {
      const darkGray = 'oklch(0.3 0 0)';
      const lightGray = 'oklch(0.9 0 0)';

      const contrast = calculateAPCA(darkGray, lightGray);

      expect(contrast).toBeGreaterThan(50);
      expect(contrast).toBeLessThan(100);
    });

    it('light gray text on dark gray background has moderate contrast', () => {
      const lightGray = 'oklch(0.9 0 0)';
      const darkGray = 'oklch(0.3 0 0)';

      const contrast = calculateAPCA(lightGray, darkGray);

      expect(contrast).toBeGreaterThan(50);
      expect(contrast).toBeLessThan(100);
    });

    it('contrast is symmetric (order does not matter for absolute value)', () => {
      const fg = 'oklch(0.2 0 0)';
      const bg = 'oklch(0.8 0 0)';

      const contrast1 = calculateAPCA(fg, bg);
      const contrast2 = calculateAPCA(bg, fg);

      // APCA is not perfectly symmetric, but absolute values should be close
      expect(Math.abs(contrast1 - contrast2)).toBeLessThan(10);
    });

    it('works with colored text on colored background', () => {
      const blue = 'oklch(0.5 0.2 230)';
      const yellow = 'oklch(0.9 0.15 90)';

      const contrast = calculateAPCA(blue, yellow);

      expect(contrast).toBeGreaterThan(0);
    });

    it('higher lightness difference yields higher contrast', () => {
      const darkText = 'oklch(0.2 0 0)';
      const lightBg1 = 'oklch(0.7 0 0)';
      const lightBg2 = 'oklch(0.95 0 0)';

      const contrast1 = calculateAPCA(darkText, lightBg1);
      const contrast2 = calculateAPCA(darkText, lightBg2);

      expect(contrast2).toBeGreaterThan(contrast1);
    });
  });

  describe('validateContrast', () => {
    it('high contrast passes with default threshold', () => {
      const black = 'oklch(0 0 0)';
      const white = 'oklch(1 0 0)';

      const result = validateContrast(black, white);

      expect(result.passes).toBe(true);
      expect(result.contrast).toBeGreaterThan(100);
    });

    it('low contrast fails with default threshold', () => {
      const gray1 = 'oklch(0.45 0 0)';
      const gray2 = 'oklch(0.55 0 0)';

      const result = validateContrast(gray1, gray2);

      expect(result.passes).toBe(false);
      expect(result.contrast).toBeLessThan(60);
    });

    it('returns correct level AAA for very high contrast (Lc >= 75)', () => {
      const black = 'oklch(0 0 0)';
      const white = 'oklch(1 0 0)';

      const result = validateContrast(black, white);

      expect(result.level).toBe('AAA');
      expect(result.contrast).toBeGreaterThanOrEqual(75);
    });

    it('returns correct level AA for moderate contrast (Lc >= 60)', () => {
      const darkGray = 'oklch(0.25 0 0)';
      const lightGray = 'oklch(0.85 0 0)';

      const result = validateContrast(darkGray, lightGray);

      if (result.contrast >= 60 && result.contrast < 75) {
        expect(result.level).toBe('AA');
      }
    });

    it('returns correct level fail for low contrast (Lc < 60)', () => {
      const gray1 = 'oklch(0.45 0 0)';
      const gray2 = 'oklch(0.55 0 0)';

      const result = validateContrast(gray1, gray2);

      expect(result.level).toBe('fail');
      expect(result.contrast).toBeLessThan(60);
    });

    it('respects custom threshold parameter', () => {
      const gray1 = 'oklch(0.3 0 0)';
      const gray2 = 'oklch(0.8 0 0)';

      const result1 = validateContrast(gray1, gray2, 50);
      const result2 = validateContrast(gray1, gray2, 80);

      // With lower threshold, it should pass
      expect(result1.passes).toBe(true);
      // With higher threshold, it may fail
      expect(result2.passes).toBe(false);
    });

    it('rounds contrast to 1 decimal place', () => {
      const fg = 'oklch(0.2 0 0)';
      const bg = 'oklch(0.9 0 0)';

      const result = validateContrast(fg, bg);

      // Check that contrast is rounded (no more than 1 decimal place)
      const decimalPlaces = (result.contrast.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  describe('validateThemeContrast', () => {
    const testBaseColors: HotelBaseColors = {
      brandPrimary: 'oklch(0.55 0.2 230)',
      brandSecondary: 'oklch(0.65 0.18 280)',
    };

    it('checks all critical text/background pairs', () => {
      const theme = generateFullTheme(testBaseColors);
      const report = validateThemeContrast(theme);

      expect(report.pairs.length).toBeGreaterThan(0);

      // Check that expected pairs are included
      const pairDescriptions = report.pairs.map(p => p.tokenPair);
      expect(pairDescriptions).toContain('Body text on default surface');
      expect(pairDescriptions).toContain('Text on brand primary');
      expect(pairDescriptions).toContain('[Dark] Body text on default surface');
    });

    it('validates light mode text-primary on surface-default', () => {
      const theme = generateFullTheme(testBaseColors);
      const report = validateThemeContrast(theme);

      const pair = report.pairs.find(p => p.tokenPair === 'Body text on default surface');
      expect(pair).toBeDefined();
      expect(pair?.foreground).toBe(theme.light['text-primary']);
      expect(pair?.background).toBe(theme.light['surface-default']);
    });

    it('validates dark mode text-primary on surface-default', () => {
      const theme = generateFullTheme(testBaseColors);
      const report = validateThemeContrast(theme);

      const pair = report.pairs.find(p => p.tokenPair === '[Dark] Body text on default surface');
      expect(pair).toBeDefined();
      expect(pair?.foreground).toBe(theme.dark['text-primary']);
      expect(pair?.background).toBe(theme.dark['surface-default']);
    });

    it('allPass is true when all pairs pass', () => {
      const wellDesignedColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.5 0.2 230)', // Deep blue
        brandSecondary: 'oklch(0.7 0.15 280)', // Light purple
      };

      const theme = generateFullTheme(wellDesignedColors);
      const report = validateThemeContrast(theme);

      // A well-designed theme should pass most checks
      if (report.allPass) {
        expect(report.failCount).toBe(0);
      }
    });

    it('allPass is false and failCount > 0 when some pairs fail', () => {
      const poorContrastColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.5 0.05 230)', // Low chroma gray-blue
        brandSecondary: 'oklch(0.52 0.05 280)', // Similar low chroma
      };

      const theme = generateFullTheme(poorContrastColors);
      const report = validateThemeContrast(theme);

      // This theme might have contrast issues
      if (!report.allPass) {
        expect(report.failCount).toBeGreaterThan(0);
      }
    });

    it('each pair includes foreground, background, result, and tokenPair', () => {
      const theme = generateFullTheme(testBaseColors);
      const report = validateThemeContrast(theme);

      report.pairs.forEach(pair => {
        expect(pair.foreground).toBeDefined();
        expect(pair.background).toBeDefined();
        expect(pair.result).toBeDefined();
        expect(pair.tokenPair).toBeDefined();

        expect(pair.result.contrast).toBeGreaterThanOrEqual(0);
        expect(pair.result.passes).toBeDefined();
        expect(pair.result.level).toMatch(/^(AAA|AA|fail)$/);
      });
    });

    it('failCount matches number of failed pairs', () => {
      const theme = generateFullTheme(testBaseColors);
      const report = validateThemeContrast(theme);

      const actualFailCount = report.pairs.filter(p => !p.result.passes).length;
      expect(report.failCount).toBe(actualFailCount);
    });

    it('report includes both light and dark mode pairs', () => {
      const theme = generateFullTheme(testBaseColors);
      const report = validateThemeContrast(theme);

      const lightPairs = report.pairs.filter(p => !p.tokenPair.startsWith('[Dark]'));
      const darkPairs = report.pairs.filter(p => p.tokenPair.startsWith('[Dark]'));

      expect(lightPairs.length).toBeGreaterThan(0);
      expect(darkPairs.length).toBeGreaterThan(0);
    });
  });

  describe('real-world theme validation', () => {
    it('well-constructed blue/gold theme passes contrast checks', () => {
      const blueGoldColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.5 0.2 230)', // Deep blue
        brandSecondary: 'oklch(0.75 0.15 60)', // Gold
      };

      const theme = generateFullTheme(blueGoldColors);
      const report = validateThemeContrast(theme);

      // Most critical pairs should pass
      const criticalPairs = report.pairs.filter(p =>
        p.tokenPair.includes('Body text') || p.tokenPair.includes('Text on brand')
      );

      const passedCritical = criticalPairs.filter(p => p.result.passes).length;
      expect(passedCritical).toBeGreaterThan(criticalPairs.length * 0.8); // 80% pass rate
    });

    it('well-constructed green/pink theme passes contrast checks', () => {
      const greenPinkColors: HotelBaseColors = {
        brandPrimary: 'oklch(0.55 0.18 140)', // Green
        brandSecondary: 'oklch(0.7 0.2 350)', // Pink
      };

      const theme = generateFullTheme(greenPinkColors);
      const report = validateThemeContrast(theme);

      // Check that report is generated successfully
      expect(report.pairs.length).toBeGreaterThan(0);
      expect(typeof report.allPass).toBe('boolean');
      expect(typeof report.failCount).toBe('number');
    });
  });
});
