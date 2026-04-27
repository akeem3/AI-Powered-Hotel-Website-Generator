/**
 * APCA Retry Loop Utility
 *
 * Story 20.3: TokenGenerator Agent + APCA Contrast Retry Loop
 *
 * This utility implements a deterministic retry loop for APCA contrast validation.
 * When contrast validation fails, it adjusts text lightness values and retries
 * up to 10 times without re-invoking the LLM.
 *
 * Story 20.3 Fix (Complete):
 * Root Cause: Text colors have lightness values that don't pass APCA contrast
 * with their corresponding surfaces.
 *
 * Fix Strategy:
 * - textLightnessReduction parameter controls adjustment
 * - For light mode (dark text on light bg): REDUCE text lightness to INCREASE contrast
 *   - Example: text-secondary L=0.554 → L=0.354 → HIGHER APCA contrast
 * - For dark mode (light text on dark bg): INCREASE text lightness to INCREASE contrast
 *   - Example: text-secondary L=0.715 → L=0.915 → HIGHER APCA contrast
 *
 * Key Requirements:
 * - Max 10 iterations
 * - +0.05 textLightnessReduction increment per iteration
 * - Does NOT re-invoke LLM (deterministic adjustment only)
 * - Uses validateThemeContrast() from contrast-validator.ts
 * - Returns ContrastReport with retry metadata
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design_token-cva-diversity_planning_2026-02-27.md
 */

import type { ContrastReport, GeneratedTheme, HotelBaseColors } from './types';
import { validateThemeContrast } from './contrast-validator';
import { generateFullTheme } from './palette-generator';

/**
 * Color adjustment record
 * Tracks each adjustment made during the retry loop
 * Story 20.3 Fix: Tracks text lightness reduction
 * Story 22.2 Fix: Added surface lightness adjustment as fallback
 */
export interface ColorAdjustment {
  field: 'textLightnessReduction' | 'surfaceLightnessAdjustment';
  originalValue: number;
  adjustment: number;
  finalValue: number;
}

/**
 * APCA retry loop result
 * Contains the validated theme and retry metadata
 */
export interface ApcarRetryResult {
  /**
   * Final generated theme (may have adjusted lightness values)
   */
  theme: GeneratedTheme;

  /**
   * APCA contrast validation report
   */
  contrastReport: ContrastReport;

  /**
   * Number of retry iterations performed (0 = first attempt passed)
   */
  iterations: number;

  /**
   * Color adjustments made during retry loop (includes chroma adjustments)
   */
  adjustmentsMade: ColorAdjustment[];

  /**
   * Whether the retry loop achieved passing contrast
   */
  success: boolean;
}

/**
 * Convert OKLCH components to OKLCH string
 */
function toOklchString(l: number, c: number, h: number): string {
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Build HotelBaseColors from color scheme components
 * Used to convert HotelDesignTokens.colorScheme to HotelBaseColors format
 */
function buildHotelBaseColors(
  primaryHue: number,
  primaryChroma: number,
  primaryLightness: number,
  secondaryHue: number,
  secondaryChroma: number,
  secondaryLightness: number
): HotelBaseColors {
  return {
    brandPrimary: toOklchString(primaryLightness, primaryChroma, primaryHue),
    brandSecondary: toOklchString(secondaryLightness, secondaryChroma, secondaryHue),
    // accent, success, error will get defaults from generateFullTheme
  };
}

/**
 * Determine which lightness values to adjust based on contrast failures
 *
 * Strategy:
 * - If text-primary/surface-default pairs fail: adjust primaryLightness
 * - If on-brand/brand-primary pairs fail: adjust secondaryLightness
 * - If both fail: adjust both
 *
 * @param contrastReport - The contrast validation report
 * @returns Object indicating which fields to adjust
 */
function determineAdjustments(contrastReport: ContrastReport): {
  adjustPrimary: boolean;
  adjustSecondary: boolean;
} {
  const failedPairs = contrastReport.pairs.filter(p => !p.result.passes);

  // Check if failures are related to primary (surface/text) or secondary (brand) colors
  const primaryRelated = failedPairs.some(p =>
    p.tokenPair.includes('surface') ||
    p.tokenPair.includes('text-') ||
    p.tokenPair.includes('Body text')
  );

  const secondaryRelated = failedPairs.some(p =>
    p.tokenPair.includes('brand') ||
    p.tokenPair.includes('on-brand')
  );

  return {
    adjustPrimary: primaryRelated,
    adjustSecondary: secondaryRelated,
  };
}

/**
 * APCA Retry Loop
 *
 * Story 20.3 Fix: Iteratively adjusts text lightness to achieve passing APCA contrast.
 *
 * Story 22.2 Fix: Multi-strategy approach for impossible color combinations.
 * - Strategy 1: Text lightness adjustment (primary)
 * - Strategy 2: Surface lightness adjustment (fallback)
 *
 * Root Cause: Text colors have lightness values that don't pass APCA contrast
 * with their corresponding surfaces:
 * - Light mode: text-secondary (L=0.554) and text-muted (L=0.711) are too light
 * - Dark mode: text-secondary (L=0.715) is not light enough
 *
 * Fix Strategy:
 * - textLightnessReduction parameter controls adjustment
 * - For light mode: REDUCE text lightness (make darker) to INCREASE contrast
 * - For dark mode: INCREASE text lightness (make lighter) to INCREASE contrast
 * - Increment by 0.05 per iteration, max 15 iterations (increased from 10)
 * - If text-only adjustment fails, apply surface lightness adjustment as fallback
 *
 * @param baseColors - Initial hotel base colors (brandPrimary, brandSecondary, etc.)
 * @param initialPrimaryLightness - Starting primary lightness value (for tracking adjustments)
 * @param initialSecondaryLightness - Starting secondary lightness value (for tracking adjustments)
 * @param maxIterations - Maximum retry iterations (default: 15, increased from 10)
 * @returns ApcarRetryResult with final theme and retry metadata
 */
export function apcaRetryLoop(
  baseColors: HotelBaseColors,
  initialPrimaryLightness: number,
  initialSecondaryLightness: number,
  maxIterations: number = 15
): ApcarRetryResult {
  let currentPrimaryLightness = initialPrimaryLightness;
  let currentSecondaryLightness = initialSecondaryLightness;

  // Parse initial chroma values from baseColors
  const primaryMatch = baseColors.brandPrimary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  const secondaryMatch = baseColors.brandSecondary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);

  if (!primaryMatch || !secondaryMatch) {
    throw new Error('Failed to parse initial OKLCH color strings for retry loop');
  }

  let currentPrimaryChroma = parseFloat(primaryMatch[2]);
  let currentSecondaryChroma = parseFloat(secondaryMatch[2]);
  const primaryHue = parseFloat(primaryMatch[3]);
  const secondaryHue = parseFloat(secondaryMatch[3]);

  // Story 20.3 Fix: Text lightness adjustment for APCA contrast
  // Based on actual APCA test data:
  // - Light mode text-secondary: L=0.554 → Lc 56.2 (FAILS, needs ≥60)
  // - Light mode text-muted: L=0.711 → Lc 34.0 (FAILS, needs ≥60)
  // - Dark mode text-secondary: L=0.715 → Lc 54.0 (FAILS, needs ≥60)
  // Solution:
  // - Light mode: REDUCE lightness to make text DARKER, which INCREASES contrast
  // - Dark mode: INCREASE lightness to make text LIGHTER, which INCREASES contrast
  let textLightnessReduction = 0.0;

  // Story 22.2 Fix: Surface lightness adjustment as fallback strategy
  let surfaceLightnessAdjustment = 0.0;

  const adjustmentsMade: ColorAdjustment[] = [];
  let iterations = 0;
  let success = false;
  let theme: GeneratedTheme;
  let contrastReport: ContrastReport;

  // Initial attempt
  theme = generateFullTheme(baseColors, textLightnessReduction);
  contrastReport = validateThemeContrast(theme);

  if (contrastReport.allPass) {
    return {
      theme,
      contrastReport,
      iterations: 0,
      adjustmentsMade: [],
      success: true,
    };
  }

  // Phase 1: Text lightness adjustment (primary strategy)
  for (let i = 0; i < maxIterations; i++) {
    iterations++;

    // Story 20.3 Fix: INCREASE text lightness adjustment
    // - Light mode: Makes text-secondary and text-muted DARKER → HIGHER contrast
    // - Dark mode: Makes text-secondary LIGHTER → HIGHER contrast
    const originalValue = textLightnessReduction;
    textLightnessReduction = Math.min(0.5, textLightnessReduction + 0.05);

    adjustmentsMade.push({
      field: 'textLightnessReduction',
      originalValue,
      adjustment: 0.05,
      finalValue: textLightnessReduction,
    });

    // Regenerate theme with increased text lightness reduction
    theme = generateFullTheme(baseColors, textLightnessReduction);
    contrastReport = validateThemeContrast(theme);

    // Check if contrast now passes
    if (contrastReport.allPass) {
      success = true;
      break;
    }
  }

  // Phase 2: Surface lightness adjustment (fallback strategy)
  // Story 22.2 Fix: If text-only adjustment fails, try adjusting surface lightness
  // This handles mathematically impossible cases where text and surface are too close
  if (!success && textLightnessReduction >= 0.5) {
    console.warn(
      `[apcaRetryLoop] Text-only adjustment exhausted (${iterations} iterations). ` +
      `Applying fallback surface lightness adjustment.`
    );

    // Try up to 3 surface adjustments in increments of 0.02
    for (let j = 0; j < 3; j++) {
      iterations++;

      const originalValue = surfaceLightnessAdjustment;
      surfaceLightnessAdjustment += 0.02;

      adjustmentsMade.push({
        field: 'surfaceLightnessAdjustment',
        originalValue,
        adjustment: 0.02,
        finalValue: surfaceLightnessAdjustment,
      });

      // Regenerate theme with both adjustments
      // Story 22.2 Fix: Pass surfaceLightnessAdjustment to generateFullTheme
      // This properly darkens surface tokens via getAdjustedSurfaceTokenValues
      theme = generateFullTheme(baseColors, textLightnessReduction, surfaceLightnessAdjustment);
      contrastReport = validateThemeContrast(theme);

      if (contrastReport.allPass) {
        success = true;
        console.log(
          `[apcaRetryLoop] Fallback surface adjustment succeeded after ${j + 1} attempts.`
        );
        break;
      }
    }

    if (!success) {
      console.warn(
        `[apcaRetryLoop] Both text and surface adjustments exhausted. ` +
        `Returning best-effort result with ${contrastReport.failCount} failing pairs.`
      );
    }
  }

  return {
    theme,
    contrastReport,
    iterations,
    adjustmentsMade,
    success,
  };
}

/**
 * APCA Retry Loop from Color Scheme Components
 *
 * Convenience function that accepts color scheme components directly,
 * converts to HotelBaseColors, and runs the retry loop.
 *
 * Story 22.2 Fix: Increased default maxIterations from 10 to 15.
 *
 * @param colorScheme - Color scheme components from HotelDesignTokens
 * @param maxIterations - Maximum retry iterations (default: 15)
 * @returns ApcarRetryResult with final theme and retry metadata
 */
export function apcaRetryLoopFromColorScheme(
  colorScheme: {
    primaryHue: number;
    primaryChroma: number;
    primaryLightness: number;
    secondaryHue: number;
    secondaryChroma: number;
    secondaryLightness: number;
  },
  maxIterations: number = 15
): ApcarRetryResult {
  const baseColors = buildHotelBaseColors(
    colorScheme.primaryHue,
    colorScheme.primaryChroma,
    colorScheme.primaryLightness,
    colorScheme.secondaryHue,
    colorScheme.secondaryChroma,
    colorScheme.secondaryLightness
  );

  return apcaRetryLoop(
    baseColors,
    colorScheme.primaryLightness,
    colorScheme.secondaryLightness,
    maxIterations
  );
}
