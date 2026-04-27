import { describe, it, expect } from '@jest/globals';
import { parseOklch, toOklchString, normalizeOklch } from '@/lib/color/oklch-parser';
import type { OklchColor } from '@/lib/color/types';

describe('OKLCH Parser', () => {
  describe('parseOklch', () => {
    it('correctly parses valid OKLCH string with decimal values', () => {
      const result = parseOklch('oklch(0.55 0.12 230)');
      expect(result).toEqual({
        mode: 'oklch',
        l: 0.55,
        c: 0.12,
        h: 230,
      });
    });

    it('correctly parses black color', () => {
      const result = parseOklch('oklch(0 0 0)');
      expect(result).toEqual({
        mode: 'oklch',
        l: 0,
        c: 0,
        h: 0,
      });
    });

    it('correctly parses white color', () => {
      const result = parseOklch('oklch(1 0 0)');
      expect(result).toEqual({
        mode: 'oklch',
        l: 1,
        c: 0,
        h: 0,
      });
    });

    it('correctly parses mid-tone with high precision', () => {
      const result = parseOklch('oklch(0.5 0.3 180.5)');
      expect(result).toEqual({
        mode: 'oklch',
        l: 0.5,
        c: 0.3,
        h: 180.5,
      });
    });

    it('correctly parses string with extra whitespace', () => {
      const result = parseOklch('oklch(  0.65   0.15   90  )');
      expect(result).toEqual({
        mode: 'oklch',
        l: 0.65,
        c: 0.15,
        h: 90,
      });
    });

    it('throws on empty string', () => {
      expect(() => parseOklch('')).toThrow('Invalid OKLCH format');
    });

    it('throws on hex color format', () => {
      expect(() => parseOklch('#ff0000')).toThrow('Invalid OKLCH format');
    });

    it('throws on hsl format', () => {
      expect(() => parseOklch('hsl(120, 50%, 50%)')).toThrow('Invalid OKLCH format');
    });

    it('throws on rgb format', () => {
      expect(() => parseOklch('rgb(255, 0, 0)')).toThrow('Invalid OKLCH format');
    });

    it('throws on missing components', () => {
      expect(() => parseOklch('oklch(0.5 0.2)')).toThrow('Invalid OKLCH format');
    });

    it('throws on lightness greater than 1', () => {
      expect(() => parseOklch('oklch(1.5 0.2 180)')).toThrow('OKLCH lightness must be 0-1');
    });

    it('throws on negative lightness', () => {
      expect(() => parseOklch('oklch(-0.1 0.2 180)')).toThrow('Invalid OKLCH format');
    });

    it('throws on negative chroma', () => {
      expect(() => parseOklch('oklch(0.5 -0.1 180)')).toThrow('Invalid OKLCH format');
    });

    it('throws on non-numeric values', () => {
      expect(() => parseOklch('oklch(abc def ghi)')).toThrow('Invalid OKLCH format');
    });
  });

  describe('toOklchString', () => {
    it('serializes OklchColor to CSS string', () => {
      const color: OklchColor = { mode: 'oklch', l: 0.55, c: 0.12, h: 230 };
      const result = toOklchString(color);
      expect(result).toBe('oklch(0.55 0.12 230)');
    });

    it('rounds lightness to 3 decimals', () => {
      const color: OklchColor = { mode: 'oklch', l: 0.555555, c: 0.12, h: 230 };
      const result = toOklchString(color);
      expect(result).toBe('oklch(0.556 0.12 230)');
    });

    it('rounds chroma to 3 decimals', () => {
      const color: OklchColor = { mode: 'oklch', l: 0.55, c: 0.123456, h: 230 };
      const result = toOklchString(color);
      expect(result).toBe('oklch(0.55 0.123 230)');
    });

    it('rounds hue to 1 decimal', () => {
      const color: OklchColor = { mode: 'oklch', l: 0.55, c: 0.12, h: 230.456 };
      const result = toOklchString(color);
      expect(result).toBe('oklch(0.55 0.12 230.5)');
    });

    it('handles zero values correctly', () => {
      const color: OklchColor = { mode: 'oklch', l: 0, c: 0, h: 0 };
      const result = toOklchString(color);
      expect(result).toBe('oklch(0 0 0)');
    });

    it('handles maximum lightness correctly', () => {
      const color: OklchColor = { mode: 'oklch', l: 1, c: 0, h: 0 };
      const result = toOklchString(color);
      expect(result).toBe('oklch(1 0 0)');
    });
  });

  describe('normalizeOklch', () => {
    it('normalizes OKLCH string with rounding', () => {
      const input = 'oklch(0.555555 0.123456 230.789)';
      const result = normalizeOklch(input);
      expect(result).toBe('oklch(0.556 0.123 230.8)');
    });

    it('normalizes string with extra whitespace', () => {
      const input = 'oklch(  0.5   0.2   180  )';
      const result = normalizeOklch(input);
      expect(result).toBe('oklch(0.5 0.2 180)');
    });

    it('throws on invalid format', () => {
      expect(() => normalizeOklch('hsl(120, 50%, 50%)')).toThrow('Invalid OKLCH format');
    });
  });

  describe('roundtrip consistency', () => {
    it('parseOklch(toOklchString(color)) preserves values', () => {
      const original: OklchColor = { mode: 'oklch', l: 0.55, c: 0.12, h: 230 };
      const serialized = toOklchString(original);
      const parsed = parseOklch(serialized);

      expect(parsed.l).toBe(original.l);
      expect(parsed.c).toBe(original.c);
      expect(parsed.h).toBe(original.h);
    });

    it('roundtrip with rounding maintains acceptable precision', () => {
      const original: OklchColor = { mode: 'oklch', l: 0.555555, c: 0.123456, h: 230.789 };
      const serialized = toOklchString(original);
      const parsed = parseOklch(serialized);

      // Values should be rounded consistently
      expect(parsed.l).toBeCloseTo(0.556, 3);
      expect(parsed.c).toBeCloseTo(0.123, 3);
      expect(parsed.h).toBeCloseTo(230.8, 1);
    });

    it('multiple roundtrips converge to stable representation', () => {
      const original = 'oklch(0.555555 0.123456 230.789)';
      const firstNormalized = normalizeOklch(original);
      const secondNormalized = normalizeOklch(firstNormalized);
      const thirdNormalized = normalizeOklch(secondNormalized);

      expect(firstNormalized).toBe(secondNormalized);
      expect(secondNormalized).toBe(thirdNormalized);
    });
  });

  describe('edge cases', () => {
    it('handles very small lightness values', () => {
      const result = parseOklch('oklch(0.001 0.1 180)');
      expect(result.l).toBe(0.001);
    });

    it('handles very high chroma values', () => {
      const result = parseOklch('oklch(0.5 0.4 180)');
      expect(result.c).toBe(0.4);
    });

    it('handles hue at 360 degrees', () => {
      const result = parseOklch('oklch(0.5 0.2 360)');
      expect(result.h).toBe(360);
    });

    it('handles hue with decimal precision', () => {
      const result = parseOklch('oklch(0.5 0.2 123.456)');
      expect(result.h).toBe(123.456);
    });
  });
});
