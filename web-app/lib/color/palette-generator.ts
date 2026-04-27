import { clampChroma, displayable } from 'culori';
import { parseOklch, toOklchString } from './oklch-parser';
import { mapToLightTokens, mapToDarkTokens } from './semantic-mapper';
import type { ShadeScale, HotelBaseColors, GeneratedPalettes, GeneratedTheme } from './types';
import { SHADE_STEPS, SHADE_LIGHTNESS } from './types';
import type { ColorScheme } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

/**
 * Convert HotelDesignTokens ColorScheme to HotelBaseColors format.
 *
 * Story 20.5: Token Pipeline Integration
 *
 * The TokenGenerator agent (Story 20.3) produces HotelDesignTokens with
 * separate OKLCH component values (hue, chroma, lightness as numbers).
 * This adapter converts those numeric components into the OKLCH string
 * format required by the existing palette generation pipeline.
 *
 * Input: ColorScheme from HotelDesignTokensSchema
 *   - primaryHue, primaryChroma, primaryLightness (separate numbers)
 *   - secondaryHue, secondaryChroma, secondaryLightness (separate numbers)
 *
 * Output: HotelBaseColors for palette-generator.ts
 *   - brandPrimary: "oklch(L C H)" string format
 *   - brandSecondary: "oklch(L C H)" string format
 *
 * @param colorScheme - ColorScheme from HotelDesignTokens
 * @returns HotelBaseColors with OKLCH strings for palette generation
 *
 * @example
 * const tokens: ColorScheme = {
 *   primaryHue: 256,
 *   primaryChroma: 0.074,
 *   primaryLightness: 0.346,
 *   secondaryHue: 86.1,
 *   secondaryChroma: 0.099,
 *   secondaryLightness: 0.748,
 *   // ... other fields
 * };
 * const baseColors = hotelDesignTokensToBaseColors(tokens);
 * // Returns: { brandPrimary: "oklch(0.346 0.074 256)", brandSecondary: "oklch(0.748 0.099 86.1)" }
 */
export function hotelDesignTokensToBaseColors(colorScheme: ColorScheme): HotelBaseColors {
  // Construct OKLCH strings from separate component values
  // Format: oklch(lightness chroma hue)
  const brandPrimary = `oklch(${colorScheme.primaryLightness} ${colorScheme.primaryChroma} ${colorScheme.primaryHue})`;
  const brandSecondary = `oklch(${colorScheme.secondaryLightness} ${colorScheme.secondaryChroma} ${colorScheme.secondaryHue})`;

  return {
    brandPrimary,
    brandSecondary,
    // Optional colors can be added later if needed
    // For now, the palette generator will provide defaults
  };
}

/**
 * Generate an 11-step shade scale for a given base color.
 * Uses the base color's hue, distributes lightness across Tailwind steps,
 * and clamps chroma to remain within sRGB gamut.
 */
export function generateShadeScale(baseColor: string): ShadeScale {
  const base = parseOklch(baseColor);
  const hue = base.h;
  // Use the base color's chroma as reference, scale chroma by lightness
  // Chroma peaks at mid-lightness and falls off at extremes (sine-wave distribution)
  const baseChroma = base.c;

  const scale = {} as ShadeScale;

  for (const step of SHADE_STEPS) {
    const targetL = SHADE_LIGHTNESS[step];
    // Sine-wave chroma distribution: mimics human color perception
    // - Chroma peaks at mid-lightness (L=0.5) where colors appear most saturated
    // - Chroma falls off at extremes (very light/dark) where saturation is less perceptible
    // Formula: sin(L * π) creates a bell curve from 0 → 1 → 0 across lightness range
    const chromaFactor = Math.sin(targetL * Math.PI);
    const targetC = baseChroma * chromaFactor * 1.2; // 1.2x boost to keep mid-tones vivid

    // Create color and clamp to sRGB gamut
    const raw = { mode: 'oklch' as const, l: targetL, c: targetC, h: hue };
    const clamped = clampChroma(raw, 'oklch');

    // Verify displayable
    if (!displayable(clamped)) {
      // Fallback: reduce chroma until displayable
      const safe = clampChroma({ ...raw, c: targetC * 0.5 }, 'oklch');
      scale[step] = toOklchString({ mode: 'oklch', l: safe.l, c: safe.c, h: safe.h });
    } else {
      scale[step] = toOklchString({ mode: 'oklch', l: clamped.l, c: clamped.c, h: clamped.h });
    }
  }

  return scale;
}

/**
 * Generate palettes for all color families from hotel base colors.
 * Missing optional colors get sensible defaults.
 */
export function generateFullPalettes(baseColors: HotelBaseColors): GeneratedPalettes {
  const primary = parseOklch(baseColors.brandPrimary);

  // Default accent: complementary hue of primary (+180 degrees)
  const accentColor = baseColors.brandAccent ??
    toOklchString({ mode: 'oklch', l: 0.65, c: primary.c, h: (primary.h + 180) % 360 });

  // Default success: green hue 150
  const successColor = baseColors.statusSuccess ??
    toOklchString({ mode: 'oklch', l: 0.448, c: 0.108, h: 150 });

  // Default error: red hue 27
  const errorColor = baseColors.statusError ??
    toOklchString({ mode: 'oklch', l: 0.577, c: 0.215, h: 27 });

  return {
    primary: generateShadeScale(baseColors.brandPrimary),
    secondary: generateShadeScale(baseColors.brandSecondary),
    accent: generateShadeScale(accentColor),
    success: generateShadeScale(successColor),
    error: generateShadeScale(errorColor),
  };
}

/**
 * Generate the complete theme (palettes + light/dark semantic tokens).
 *
 * Story 20.3 Fix: Added textLightnessReduction parameter for APCA retry loop.
 * When contrast validation fails, the retry loop increases this value to adjust
 * text-secondary lightness for improved APCA contrast.
 *
 * Story 22.2 Fix: Added surfaceLightnessAdjustment parameter for fallback strategy.
 * When text-only adjustment fails, the retry loop adjusts surface lightness
 * to improve contrast with text.
 *
 * Root Cause Analysis (from actual APCA test data):
 * - Light mode text-primary: L=0.208 → PASSES (Lc 89.1 / 75) ✓
 * - Light mode text-secondary: L=0.554 → FAILS (Lc 56.2 / 60) ✗ (needs to be DARKER)
 * - Light mode text-muted: L=0.711 → FAILS (Lc 34.0 / 60) ✗ (needs to be DARKER)
 * - Dark mode text-secondary: L=0.715 → FAILS (Lc 54.0 / 60) ✗ (needs to be LIGHTER)
 *
 * Fix Strategy:
 * - Light mode: REDUCE text-secondary lightness (make darker) → HIGHER contrast
 * - Dark mode: INCREASE text-secondary lightness (make lighter) → HIGHER contrast
 * - Fallback: Darken surfaces slightly (reduce lightness by 0.02 increments) → HIGHER contrast
 *
 * @param baseColors - Hotel base colors (brandPrimary, brandSecondary, etc.)
 * @param textLightnessReduction - Amount to adjust text-secondary lightness (default: 0.0)
 * @param surfaceLightnessAdjustment - Amount to darken surface lightness (default: 0.0)
 * @returns Complete theme with palettes and semantic tokens
 */
export function generateFullTheme(
  baseColors: HotelBaseColors,
  textLightnessReduction: number = 0.0,
  surfaceLightnessAdjustment: number = 0.0
): GeneratedTheme {
  const palettes = generateFullPalettes(baseColors);

  return {
    palettes,
    light: mapToLightTokens(palettes, baseColors, undefined, textLightnessReduction, surfaceLightnessAdjustment),
    dark: mapToDarkTokens(palettes, baseColors, undefined, textLightnessReduction, surfaceLightnessAdjustment),
  };
}
