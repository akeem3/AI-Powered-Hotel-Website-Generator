/**
 * APCA Retry Loop Tests
 *
 * Tests for the APCA retry loop functionality that adjusts text lightness
 * to achieve passing contrast for both light and dark modes.
 */

import { describe, it, expect } from '@jest/globals';
import { calculateAPCA } from '@/lib/color/contrast-validator';
import { mapToLightTokens, mapToDarkTokens } from '@/lib/color/semantic-mapper';
import { generateFullPalettes, hotelDesignTokensToBaseColors } from '@/lib/color/palette-generator';
import { apcaRetryLoopFromColorScheme } from '@/lib/color/apca-retry-loop';
import type { HotelDesignTokens } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

describe('APCA Retry Loop', () => {
  const heritageOpulenceScheme = {
    primaryHue: 237,
    primaryChroma: 0.17,
    primaryLightness: 0.42,
    secondaryHue: 47,
    secondaryChroma: 0.21,
    secondaryLightness: 0.58,
  };

  describe('apcaRetryLoopFromColorScheme', () => {
    it('should achieve passing contrast within max iterations', () => {
      const result = apcaRetryLoopFromColorScheme(heritageOpulenceScheme);

      expect(result.success).toBe(true);
      expect(result.contrastReport.allPass).toBe(true);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.iterations).toBeLessThanOrEqual(15); // Story 22.2: Increased from 10 to 15
    });

    it('should track adjustments made during retry loop', () => {
      const result = apcaRetryLoopFromColorScheme(heritageOpulenceScheme);

      expect(result.adjustmentsMade).toBeDefined();
      expect(Array.isArray(result.adjustmentsMade)).toBe(true);

      if (result.iterations > 0) {
        expect(result.adjustmentsMade.length).toBeGreaterThan(0);

        const firstAdjustment = result.adjustmentsMade[0];
        expect(['textLightnessReduction', 'surfaceLightnessAdjustment']).toContain(firstAdjustment.field);
        expect(firstAdjustment.adjustment).toBeGreaterThan(0);
      }
    });

    it('should return a valid theme with passing contrast', () => {
      const result = apcaRetryLoopFromColorScheme(heritageOpulenceScheme);

      expect(result.theme).toBeDefined();
      expect(result.theme.light).toBeDefined();
      expect(result.theme.dark).toBeDefined();
      expect(result.theme.palettes).toBeDefined();
    });
  });

  describe('Light mode text lightness adjustment', () => {
    const testTokens: HotelDesignTokens = {
      archetype: 'heritage-opulence',
      guestPersona: 'Affluent travelers seeking traditional luxury',
      emotionalIntent: 'Refined sophistication and timeless elegance',
      architecturalInspiration: 'Georgian townhouses',
      forbiddenElements: ['bg-white', 'tracking-normal'],
      colorScheme: {
        primaryHue: 237,
        primaryChroma: 0.17,
        primaryLightness: 0.42,
        secondaryHue: 47,
        secondaryChroma: 0.21,
        secondaryLightness: 0.58,
        surfaceType: 'warm-cream',
        accentStrategy: 'complementary',
      },
      typography: {
        headingPersonality: 'serif-elegant',
        bodyPersonality: 'serif-readable',
        scaleRatio: 'perfect-fourth',
      },
      spacing: {
        density: 'comfortable',
      },
      borderRadius: {
        borderRadius: 'subtle',
      },
    };

    const baseColors = hotelDesignTokensToBaseColors(testTokens.colorScheme);
    const palettes = generateFullPalettes(baseColors);
    const surfaceDefault = 'oklch(0.93 0.02 50)';

    it('should reduce text-secondary lightness to increase contrast', () => {
      // Without reduction: should fail
      const tokensNoReduction = mapToLightTokens(palettes, baseColors, 'warm-cream', 0.0);
      const lcNoReduction = calculateAPCA(tokensNoReduction['text-secondary'], surfaceDefault);

      expect(lcNoReduction).toBeLessThan(60);

      // With reduction: should pass
      const tokensWithReduction = mapToLightTokens(palettes, baseColors, 'warm-cream', 0.2);
      const lcWithReduction = calculateAPCA(tokensWithReduction['text-secondary'], surfaceDefault);

      expect(lcWithReduction).toBeGreaterThanOrEqual(60);
    });

    it('should reduce text-muted lightness to increase contrast', () => {
      // Without reduction: should fail
      const tokensNoReduction = mapToLightTokens(palettes, baseColors, 'warm-cream', 0.0);
      const lcNoReduction = calculateAPCA(tokensNoReduction['text-muted'], surfaceDefault);

      expect(lcNoReduction).toBeLessThan(60);

      // With reduction: should pass
      const tokensWithReduction = mapToLightTokens(palettes, baseColors, 'warm-cream', 0.5);
      const lcWithReduction = calculateAPCA(tokensWithReduction['text-muted'], surfaceDefault);

      expect(lcWithReduction).toBeGreaterThanOrEqual(60);
    });
  });

  describe('Dark mode text lightness adjustment', () => {
    const testTokens: HotelDesignTokens = {
      archetype: 'heritage-opulence',
      guestPersona: 'Affluent travelers seeking traditional luxury',
      emotionalIntent: 'Refined sophistication and timeless elegance',
      architecturalInspiration: 'Georgian townhouses',
      forbiddenElements: ['bg-white', 'tracking-normal'],
      colorScheme: {
        primaryHue: 237,
        primaryChroma: 0.17,
        primaryLightness: 0.42,
        secondaryHue: 47,
        secondaryChroma: 0.21,
        secondaryLightness: 0.58,
        surfaceType: 'warm-cream',
        accentStrategy: 'complementary',
      },
      typography: {
        headingPersonality: 'serif-elegant',
        bodyPersonality: 'serif-readable',
        scaleRatio: 'perfect-fourth',
      },
      spacing: {
        density: 'comfortable',
      },
      borderRadius: {
        borderRadius: 'subtle',
      },
    };

    const baseColors = hotelDesignTokensToBaseColors(testTokens.colorScheme);
    const palettes = generateFullPalettes(baseColors);
    const darkSurfaceDefault = 'oklch(0.145 0 0)';

    it('should increase text-secondary lightness to increase contrast', () => {
      // Without reduction: should fail
      const tokensNoReduction = mapToDarkTokens(palettes, baseColors, undefined, 0.0);
      const lcNoReduction = calculateAPCA(tokensNoReduction['text-secondary'], darkSurfaceDefault);

      expect(lcNoReduction).toBeLessThan(60);

      // With reduction (which increases lightness for dark mode): should pass
      const tokensWithReduction = mapToDarkTokens(palettes, baseColors, undefined, 0.2);
      const lcWithReduction = calculateAPCA(tokensWithReduction['text-secondary'], darkSurfaceDefault);

      expect(lcWithReduction).toBeGreaterThanOrEqual(60);
    });
  });

  describe('Story 22.2: Surface adjustment fallback', () => {
    // This scheme simulates the "Design/Art Hotel" failure scenario:
    // Very high secondaryLightness (0.88) with a very light surface (warm-cream L=0.93)
    // Text-only adjustment cannot achieve sufficient contrast
    const impossibleColorScheme = {
      primaryHue: 265,
      primaryChroma: 0.18,
      primaryLightness: 0.35,
      secondaryHue: 265,
      secondaryChroma: 0.12,
      secondaryLightness: 0.88, // Too close to surface lightness
    };

    it('should apply surface adjustment fallback when text-only adjustment fails', () => {
      const result = apcaRetryLoopFromColorScheme(impossibleColorScheme, 15);

      // Should still attempt to fix the issue
      expect(result).toBeDefined();
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.adjustmentsMade).toBeDefined();
      expect(result.adjustmentsMade.length).toBeGreaterThan(0);

      // Check that both adjustment types were attempted
      const adjustmentFields = result.adjustmentsMade.map(a => a.field);
      expect(adjustmentFields).toContain('textLightnessReduction');

      // If text-only failed, surface adjustment should have been attempted
      if (!result.success) {
        console.log('Surface adjustment test: Best-effort result with', result.contrastReport.failCount, 'failures');
        expect(adjustmentFields).toContain('surfaceLightnessAdjustment');
      }
    });

    it('should track surface adjustment increments correctly', () => {
      const result = apcaRetryLoopFromColorScheme(impossibleColorScheme, 15);

      const surfaceAdjustments = result.adjustmentsMade.filter(a => a.field === 'surfaceLightnessAdjustment');
      if (surfaceAdjustments.length > 0) {
        surfaceAdjustments.forEach(adj => {
          expect(adj.adjustment).toBe(0.02);
          expect(adj.finalValue).toBeGreaterThan(adj.originalValue);
        });
      }
    });

    it('should return best-effort result even if both strategies fail', () => {
      const result = apcaRetryLoopFromColorScheme(impossibleColorScheme, 15);

      // Should always return a result, never throw
      expect(result).toBeDefined();
      expect(result.theme).toBeDefined();
      expect(result.contrastReport).toBeDefined();
      expect(result.iterations).toBeGreaterThan(0);

      // Success flag indicates whether passing contrast was achieved
      if (result.success) {
        expect(result.contrastReport.allPass).toBe(true);
      } else {
        // Best-effort: should have reduced failure count from original
        expect(result.contrastReport.failCount).toBeLessThan(10);
      }
    });
  });
});
