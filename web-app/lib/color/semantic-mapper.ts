import { parseOklch, toOklchString } from './oklch-parser';
import { calculateAPCA } from './contrast-validator';
import type {
  SemanticTokens, GeneratedPalettes, GeneratedTheme,
  HotelBaseColors
} from './types';
import type { ColorScheme } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

/**
 * Surface type enum values for type safety.
 * Extracted from ColorScheme schema in hotel-design-tokens.schema.ts
 */
type SurfaceType = ColorScheme['surfaceType'];

/**
 * Surface token values for light mode.
 * Maps each surface type to its OKLCH lightness, chroma, and hue values.
 */
interface SurfaceTokenValues {
  'surface-default': string;
  'surface-primary': string;
  'surface-elevated': string;
  'surface-secondary': string;
  'surface-muted': string;
}

/**
 * Get surface token OKLCH values for a given surface type.
 *
 * Story 20.5: Token Pipeline Integration
 *
 * Maps 11 surface types to their corresponding OKLCH values for light mode.
 * Some surface types use the primary hue (for tinted appearance), while
 * others use fixed hues (achromatic or specific warm/cool tones).
 *
 * @param surfaceType - The surface type enum value
 * @param primaryHue - The primary color hue (0-360) for tinted surfaces
 * @returns Surface token OKLCH values for light mode
 *
 * @example
 * const tokens = getSurfaceTokenValues('warm-cream', 256);
 * // Returns surface tokens with L=0.93, C=0.02, H=50
 */
function getSurfaceTokenValues(surfaceType: SurfaceType, primaryHue: number): SurfaceTokenValues {
  // Define surface type configurations (lightness, chroma, hue)
  // Hue can be a fixed value or 'primary' to use the primary hue
  const surfaceConfigs: Record<SurfaceType, {
    default: { l: number; c: number; h: number | 'primary' };
    primary: { l: number; c: number; h: number | 'primary' };
    elevated: { l: number; c: number; h: number | 'primary' };
    secondary: { l: number; c: number; h: number | 'primary' };
    muted: { l: number; c: number; h: number | 'primary' };
  }> = {
    'warm-white': {
      default: { l: 0.98, c: 0.02, h: 50 },
      primary: { l: 0.98, c: 0.02, h: 50 },
      elevated: { l: 0.97, c: 0.015, h: 50 },
      secondary: { l: 0.96, c: 0.015, h: 50 },
      muted: { l: 0.96, c: 0.015, h: 50 },
    },
    'cool-white': {
      default: { l: 0.98, c: 0.01, h: 220 },
      primary: { l: 0.98, c: 0.01, h: 220 },
      elevated: { l: 0.97, c: 0.01, h: 220 },
      secondary: { l: 0.96, c: 0.01, h: 220 },
      muted: { l: 0.96, c: 0.01, h: 220 },
    },
    'bone-white': {
      default: { l: 0.97, c: 0.015, h: 60 },
      primary: { l: 0.97, c: 0.015, h: 60 },
      elevated: { l: 0.96, c: 0.01, h: 60 },
      secondary: { l: 0.95, c: 0.01, h: 60 },
      muted: { l: 0.95, c: 0.01, h: 60 },
    },
    'cream': {
      default: { l: 0.95, c: 0.02, h: 50 },
      primary: { l: 0.95, c: 0.02, h: 50 },
      elevated: { l: 0.94, c: 0.015, h: 50 },
      secondary: { l: 0.93, c: 0.015, h: 50 },
      muted: { l: 0.93, c: 0.015, h: 50 },
    },
    'off-white': {
      default: { l: 0.94, c: 0.01, h: 'primary' },
      primary: { l: 0.94, c: 0.01, h: 'primary' },
      elevated: { l: 0.93, c: 0.01, h: 'primary' },
      secondary: { l: 0.92, c: 0.01, h: 'primary' },
      muted: { l: 0.92, c: 0.01, h: 'primary' },
    },
    'warm-cream': {
      default: { l: 0.93, c: 0.02, h: 50 },
      primary: { l: 0.93, c: 0.02, h: 50 },
      elevated: { l: 0.92, c: 0.015, h: 50 },
      secondary: { l: 0.91, c: 0.015, h: 50 },
      muted: { l: 0.91, c: 0.015, h: 50 },
    },
    'raw-linen': {
      default: { l: 0.92, c: 0.015, h: 40 },
      primary: { l: 0.92, c: 0.015, h: 40 },
      elevated: { l: 0.91, c: 0.01, h: 40 },
      secondary: { l: 0.90, c: 0.01, h: 40 },
      muted: { l: 0.90, c: 0.01, h: 40 },
    },
    'cool-grey': {
      default: { l: 0.90, c: 0.01, h: 220 },
      primary: { l: 0.90, c: 0.01, h: 220 },
      elevated: { l: 0.89, c: 0.01, h: 220 },
      secondary: { l: 0.88, c: 0.01, h: 220 },
      muted: { l: 0.88, c: 0.01, h: 220 },
    },
    'gallery-white': {
      default: { l: 0.98, c: 0.0, h: 0 },
      primary: { l: 0.98, c: 0.0, h: 0 },
      elevated: { l: 0.97, c: 0.0, h: 0 },
      secondary: { l: 0.96, c: 0.0, h: 0 },
      muted: { l: 0.96, c: 0.0, h: 0 },
    },
    'dark': {
      default: { l: 0.15, c: 0.02, h: 'primary' },
      primary: { l: 0.15, c: 0.02, h: 'primary' },
      elevated: { l: 0.18, c: 0.02, h: 'primary' },
      secondary: { l: 0.18, c: 0.02, h: 'primary' },
      muted: { l: 0.22, c: 0.02, h: 'primary' },
    },
    'near-black': {
      default: { l: 0.10, c: 0.01, h: 0 },
      primary: { l: 0.10, c: 0.01, h: 0 },
      elevated: { l: 0.13, c: 0.01, h: 0 },
      secondary: { l: 0.13, c: 0.01, h: 0 },
      muted: { l: 0.18, c: 0.01, h: 0 },
    },
  };

  const config = surfaceConfigs[surfaceType];

  // Helper to convert config to OKLCH string
  const toOklch = (cfg: { l: number; c: number; h: number | 'primary' }): string => {
    const hue = cfg.h === 'primary' ? primaryHue : cfg.h;
    return toOklchString({ mode: 'oklch', l: cfg.l, c: cfg.c, h: hue });
  };

  return {
    'surface-default': toOklch(config.default),
    'surface-primary': toOklch(config.primary),
    'surface-elevated': toOklch(config.elevated),
    'surface-secondary': toOklch(config.secondary),
    'surface-muted': toOklch(config.muted),
  };
}

/**
 * Get surface token OKLCH values with lightness adjustment.
 *
 * Story 22.2 Fix: Applies surface lightness adjustment for APCA fallback strategy.
 * When text-only adjustment fails to achieve passing contrast, this function
 * darkens the surface tokens to improve contrast with text.
 *
 * @param surfaceType - The surface type enum value
 * @param primaryHue - The primary color hue (0-360) for tinted surfaces
 * @param lightnessAdjustment - Amount to darken surface lightness (positive value)
 * @returns Surface token OKLCH values for light mode with adjustment applied
 */
function getAdjustedSurfaceTokenValues(
  surfaceType: SurfaceType,
  primaryHue: number,
  lightnessAdjustment: number
): SurfaceTokenValues {
  // Get base surface values without adjustment
  const baseValues = getSurfaceTokenValues(surfaceType, primaryHue);

  // Apply lightness adjustment (darken surfaces) to improve contrast
  const adjustLightness = (oklchStr: string): string => {
    const color = parseOklch(oklchStr);
    // Reduce lightness by adjustment amount, with minimum of 0.85 to avoid too dark
    const adjustedLightness = Math.max(0.85, color.l - lightnessAdjustment);
    return toOklchString({ mode: 'oklch', l: adjustedLightness, c: color.c, h: color.h });
  };

  return {
    'surface-default': adjustLightness(baseValues['surface-default']),
    'surface-primary': adjustLightness(baseValues['surface-primary']),
    'surface-elevated': adjustLightness(baseValues['surface-elevated']),
    'surface-secondary': adjustLightness(baseValues['surface-secondary']),
    'surface-muted': adjustLightness(baseValues['surface-muted']),
  };
}

/**
 * Get surface token OKLCH values for dark mode.
 *
 * Story 20.5: Token Pipeline Integration
 *
 * Dark mode surfaces use achromatic (chroma = 0) colors for true black/gray
 * appearance, except for some surface types which use very low chroma for
 * subtle warmth.
 *
 * @param surfaceType - The surface type enum value
 * @returns Surface token OKLCH values for dark mode
 */
function getDarkSurfaceTokenValues(surfaceType: SurfaceType): SurfaceTokenValues {
  // Dark mode surface configurations (lightness, chroma, hue)
  // Most are achromatic (c=0), some have minimal chroma for warmth
  const darkSurfaceConfigs: Record<SurfaceType, {
    default: { l: number; c: number; h: number };
    primary: { l: number; c: number; h: number };
    elevated: { l: number; c: number; h: number };
    secondary: { l: number; c: number; h: number };
    muted: { l: number; c: number; h: number };
  }> = {
    'warm-white': {
      // Slightly warmer than pure black
      default: { l: 0.14, c: 0.002, h: 50 },
      primary: { l: 0.14, c: 0.002, h: 50 },
      elevated: { l: 0.17, c: 0.002, h: 50 },
      secondary: { l: 0.17, c: 0.002, h: 50 },
      muted: { l: 0.22, c: 0.002, h: 50 },
    },
    'cool-white': {
      // Cool dark gray
      default: { l: 0.14, c: 0.001, h: 220 },
      primary: { l: 0.14, c: 0.001, h: 220 },
      elevated: { l: 0.17, c: 0.001, h: 220 },
      secondary: { l: 0.17, c: 0.001, h: 220 },
      muted: { l: 0.22, c: 0.001, h: 220 },
    },
    'bone-white': {
      // Warm dark gray
      default: { l: 0.14, c: 0.002, h: 60 },
      primary: { l: 0.14, c: 0.002, h: 60 },
      elevated: { l: 0.17, c: 0.002, h: 60 },
      secondary: { l: 0.17, c: 0.002, h: 60 },
      muted: { l: 0.22, c: 0.002, h: 60 },
    },
    'cream': {
      // Warm dark gray
      default: { l: 0.14, c: 0.002, h: 50 },
      primary: { l: 0.14, c: 0.002, h: 50 },
      elevated: { l: 0.17, c: 0.002, h: 50 },
      secondary: { l: 0.17, c: 0.002, h: 50 },
      muted: { l: 0.22, c: 0.002, h: 50 },
    },
    'off-white': {
      // Achromatic dark (uses primary hue but chroma is 0)
      default: { l: 0.14, c: 0.0, h: 0 },
      primary: { l: 0.14, c: 0.0, h: 0 },
      elevated: { l: 0.17, c: 0.0, h: 0 },
      secondary: { l: 0.17, c: 0.0, h: 0 },
      muted: { l: 0.22, c: 0.0, h: 0 },
    },
    'warm-cream': {
      // Warm dark gray
      default: { l: 0.14, c: 0.002, h: 50 },
      primary: { l: 0.14, c: 0.002, h: 50 },
      elevated: { l: 0.17, c: 0.002, h: 50 },
      secondary: { l: 0.17, c: 0.002, h: 50 },
      muted: { l: 0.22, c: 0.002, h: 50 },
    },
    'raw-linen': {
      // Organic dark gray
      default: { l: 0.14, c: 0.002, h: 40 },
      primary: { l: 0.14, c: 0.002, h: 40 },
      elevated: { l: 0.17, c: 0.002, h: 40 },
      secondary: { l: 0.17, c: 0.002, h: 40 },
      muted: { l: 0.22, c: 0.002, h: 40 },
    },
    'cool-grey': {
      // Cool dark gray
      default: { l: 0.14, c: 0.001, h: 220 },
      primary: { l: 0.14, c: 0.001, h: 220 },
      elevated: { l: 0.17, c: 0.001, h: 220 },
      secondary: { l: 0.17, c: 0.001, h: 220 },
      muted: { l: 0.22, c: 0.001, h: 220 },
    },
    'gallery-white': {
      // Pure achromatic black/gray
      default: { l: 0.14, c: 0.0, h: 0 },
      primary: { l: 0.14, c: 0.0, h: 0 },
      elevated: { l: 0.17, c: 0.0, h: 0 },
      secondary: { l: 0.17, c: 0.0, h: 0 },
      muted: { l: 0.22, c: 0.0, h: 0 },
    },
    'dark': {
      // Dark surface (already dark, slightly elevated in dark mode)
      default: { l: 0.12, c: 0.0, h: 0 },
      primary: { l: 0.12, c: 0.0, h: 0 },
      elevated: { l: 0.15, c: 0.0, h: 0 },
      secondary: { l: 0.15, c: 0.0, h: 0 },
      muted: { l: 0.20, c: 0.0, h: 0 },
    },
    'near-black': {
      // Near black (already near-black, slightly elevated in dark mode)
      default: { l: 0.10, c: 0.0, h: 0 },
      primary: { l: 0.10, c: 0.0, h: 0 },
      elevated: { l: 0.13, c: 0.0, h: 0 },
      secondary: { l: 0.13, c: 0.0, h: 0 },
      muted: { l: 0.18, c: 0.0, h: 0 },
    },
  };

  const config = darkSurfaceConfigs[surfaceType];

  // Helper to convert config to OKLCH string
  const toOklch = (cfg: { l: number; c: number; h: number }): string => {
    return toOklchString({ mode: 'oklch', l: cfg.l, c: cfg.c, h: cfg.h });
  };

  return {
    'surface-default': toOklch(config.default),
    'surface-primary': toOklch(config.primary),
    'surface-elevated': toOklch(config.elevated),
    'surface-secondary': toOklch(config.secondary),
    'surface-muted': toOklch(config.muted),
  };
}

/**
 * Create a hover variant by darkening a color.
 */
function darken(oklchStr: string, amount: number): string {
  const color = parseOklch(oklchStr);
  return toOklchString({
    mode: 'oklch',
    l: Math.max(0, color.l - amount),
    c: color.c,
    h: color.h,
  });
}

/**
 * Create a lightened variant for dark mode.
 */
function lighten(oklchStr: string, targetL: number): string {
  const color = parseOklch(oklchStr);
  return toOklchString({
    mode: 'oklch',
    l: Math.min(1, targetL),
    c: color.c * 0.85, // slightly desaturate for dark bg
    h: color.h,
  });
}

/**
 * Get accessible text color for a background color.
 */
function getContrastText(bgOklch: string): string {
  const white = 'oklch(1 0 0)';
  const dark = 'oklch(0.208 0.04 265.8)'; // text-primary equivalent

  const whiteContrast = Math.abs(calculateAPCA(white, bgOklch));
  const darkContrast = Math.abs(calculateAPCA(dark, bgOklch));

  // Favor white text on anything except very light backgrounds
  // We bias by 15 Lc points to ensure "View Rooms" and similar CTAs stay white
  return whiteContrast >= (darkContrast - 15) ? white : dark;
}

/**
 * Map generated palettes to light mode semantic tokens.
 *
 * Story 20.5: Token Pipeline Integration
 *
 * IMPORTANT: Text and border colors use NEUTRAL variants (low chroma) instead of
 * direct palette shades. This ensures text appears as neutral gray, not tinted with
 * the brand hue. The original design used nearly neutral colors (chroma 0.01-0.04)
 * for readability and visual hierarchy.
 *
 * Story 20.3 Fix: Added textLightnessReduction parameter for APCA retry loop.
 * When contrast validation fails, the retry loop increases this value to REDUCE
 * text-secondary and text-muted lightness, making them DARKER, which INCREASES
 * APCA contrast with light surfaces.
 *
 * Story 22.2 Fix: Added surfaceLightnessAdjustment parameter for fallback strategy.
 * When text-only adjustment fails, the retry loop darkens surfaces slightly to
 * improve contrast with text.
 *
 * Root Cause Analysis (from actual APCA test data):
 * - text-primary: L=0.208 → PASSES (Lc 89.1 / 75) ✓ (no change needed)
 * - text-secondary: L=0.554 → FAILS (Lc 56.2 / 60) ✗ (needs to be DARKER)
 * - text-muted: L=0.711 → FAILS (Lc 34.0 / 60) ✗ (needs to be DARKER)
 *
 * @param palettes - Generated shade scales for all color families
 * @param baseColors - Original base colors for hue extraction
 * @param surfaceType - Optional surface type for archetype-specific surface tokens (Story 20.5)
 * @param textLightnessReduction - Amount to REDUCE text-secondary/text-muted lightness (default: 0.0)
 * @param surfaceLightnessAdjustment - Amount to darken surface lightness (default: 0.0)
 * @returns Semantic tokens for light mode
 */
export function mapToLightTokens(
  palettes: GeneratedPalettes,
  baseColors: HotelBaseColors,
  surfaceType?: SurfaceType,
  textLightnessReduction: number = 0.0,
  surfaceLightnessAdjustment: number = 0.0
): SemanticTokens {
  // Extract base hue for neutral variants
  const primaryColor = parseOklch(baseColors.brandPrimary);

  return {
    // Brand
    'brand-primary': palettes.primary[500],
    'brand-primary-hover': darken(palettes.primary[500], 0.08),
    'brand-secondary': palettes.secondary[500],
    'brand-secondary-hover': darken(palettes.secondary[500], 0.06),
    'on-brand': getContrastText(palettes.primary[500]),
    'on-brand-secondary': getContrastText(palettes.secondary[500]),
    'brand-white': 'oklch(1 0 0)',

    // Text: Use neutral variants (low chroma) for readability
    // Story 20.3 Fix: Apply textLightnessReduction to text-secondary and text-muted
    // This REDUCES their lightness (makes them DARKER), which INCREASES APCA contrast
    'text-primary': toOklchString({
      mode: 'oklch',
      l: 0.208, // Already passes, no adjustment
      c: 0.04,
      h: primaryColor.h
    }),
    'text-secondary': toOklchString({
      mode: 'oklch',
      l: Math.max(0.05, 0.554 - textLightnessReduction), // REDUCE lightness to improve contrast
      c: 0.041,
      h: primaryColor.h
    }),
    'text-muted': toOklchString({
      mode: 'oklch',
      l: Math.max(0.05, 0.711 - textLightnessReduction), // REDUCE lightness to improve contrast
      c: 0.035,
      h: primaryColor.h
    }),
    'text-inverted': toOklchString({ mode: 'oklch', l: 0.984, c: 0.003, h: primaryColor.h }),
    'text-on-brand': getContrastText(palettes.primary[500]),
    'text-on-brand-secondary': getContrastText(palettes.secondary[500]),

    // Surface: Use surface type mapping if provided, otherwise use defaults
    // Story 22.2 Fix: Apply surfaceLightnessAdjustment to darken surfaces for improved contrast
    ...(surfaceType
      ? getAdjustedSurfaceTokenValues(surfaceType, primaryColor.h, surfaceLightnessAdjustment)
      : {
          'surface-default': toOklchString({ mode: 'oklch', l: Math.max(0.85, 1.0 - surfaceLightnessAdjustment), c: 0, h: 0 }),
          'surface-primary': toOklchString({ mode: 'oklch', l: Math.max(0.85, 1.0 - surfaceLightnessAdjustment), c: 0, h: 0 }),
          'surface-elevated': toOklchString({ mode: 'oklch', l: Math.max(0.85, 0.984 - surfaceLightnessAdjustment), c: 0.003, h: primaryColor.h }),
          'surface-secondary': toOklchString({ mode: 'oklch', l: Math.max(0.85, 0.968 - surfaceLightnessAdjustment), c: 0.007, h: primaryColor.h }),
          'surface-muted': toOklchString({ mode: 'oklch', l: Math.max(0.85, 0.968 - surfaceLightnessAdjustment), c: 0.007, h: primaryColor.h }),
        }
    ),

    // Border: Use neutral variants (low chroma)
    'border-default': toOklchString({ mode: 'oklch', l: 0.929, c: 0.013, h: primaryColor.h }),
    'border-strong': toOklchString({ mode: 'oklch', l: 0.711, c: 0.035, h: primaryColor.h }),

    // Status
    'status-success': palettes.success[600],
    'status-warning': deriveWarning(palettes),
    'status-error': palettes.error[500],
    'status-error-strong': palettes.error[700],
    'status-info': deriveInfo(palettes),

    // Interactive
    'interactive-primary': palettes.secondary[500],
    'interactive-primary-hover': darken(palettes.secondary[500], 0.06),
  };
}

/**
 * Map generated palettes to dark mode semantic tokens.
 *
 * Story 20.5: Token Pipeline Integration
 *
 * IMPORTANT: Surfaces use ACHROMATIC (chroma = 0) colors for dark mode.
 * The palette shades have too much chroma and would create a heavily tinted
 * appearance. Original design used pure blacks/grays (chroma = 0).
 *
 * Story 20.3 Fix: Added textLightnessReduction parameter for APCA retry loop.
 * For dark mode (light text on dark bg), INCREASING text-secondary lightness
 * makes it LIGHTER, which INCREASES APCA contrast with dark surfaces.
 *
 * Story 22.2 Fix: Added surfaceLightnessAdjustment parameter for fallback strategy.
 * When text-only adjustment fails, the retry loop lightens surfaces slightly to
 * improve contrast with text (opposite of light mode).
 *
 * @param palettes - Generated shade scales for all color families
 * @param baseColors - Original base colors for hue extraction
 * @param surfaceType - Optional surface type for archetype-specific surface tokens (Story 20.5)
 * @param textLightnessReduction - Amount to INCREASE text-secondary lightness (default: 0.0)
 * @param surfaceLightnessAdjustment - Amount to lighten surface lightness (default: 0.0)
 * @returns Semantic tokens for dark mode
 */
export function mapToDarkTokens(
  palettes: GeneratedPalettes,
  baseColors: HotelBaseColors,
  surfaceType?: SurfaceType,
  textLightnessReduction: number = 0.0,
  surfaceLightnessAdjustment: number = 0.0
): SemanticTokens {
  const brandPrimaryDark = lighten(palettes.primary[500], 0.55);

  return {
    // Brand (lightened for dark backgrounds)
    'brand-primary': brandPrimaryDark,
    'brand-primary-hover': lighten(palettes.primary[500], 0.48),
    'brand-secondary': lighten(palettes.secondary[500], 0.78),
    'brand-secondary-hover': lighten(palettes.secondary[500], 0.72),
    'on-brand': getContrastText(brandPrimaryDark),
    'on-brand-secondary': getContrastText(lighten(palettes.secondary[500], 0.78)),
    'brand-white': 'oklch(1 0 0)',

    // Text (high lightness, achromatic)
    // Story 20.3 Fix: Apply textLightnessReduction to text-secondary
    // For dark mode (light text on dark bg), we INCREASE lightness to improve contrast
    // This is the opposite of light mode where we reduce lightness
    'text-primary': 'oklch(0.985 0 0)', // Already passes (Lc 103.7 / 75)
    'text-secondary': `oklch(${Math.min(0.98, 0.715 + textLightnessReduction).toFixed(3)} 0 0)`, // INCREASE lightness
    'text-muted': 'oklch(0.556 0 0)', // Not validated in contrast check
    'text-inverted': 'oklch(0.145 0 0)',
    'text-on-brand': getContrastText(brandPrimaryDark),
    'text-on-brand-secondary': getContrastText(lighten(palettes.secondary[500], 0.78)),

    // Surface: Use surface type mapping if provided, otherwise use achromatic defaults
    ...(surfaceType
      ? getDarkSurfaceTokenValues(surfaceType)
      : {
          'surface-default': 'oklch(0.145 0 0)',
          'surface-primary': 'oklch(0.145 0 0)',
          'surface-elevated': 'oklch(0.168 0 0)',
          'surface-secondary': 'oklch(0.168 0 0)',
          'surface-muted': 'oklch(0.218 0 0)',
        }
    ),

    // Border (achromatic gray)
    'border-default': 'oklch(0.297 0 0)',
    'border-strong': 'oklch(0.371 0 0)',

    // Status (brightened for dark backgrounds)
    'status-success': lighten(palettes.success[600], 0.65),
    'status-warning': lighten(deriveWarning(palettes), 0.85),
    'status-error': lighten(palettes.error[500], 0.65),
    'status-error-strong': lighten(palettes.error[700], 0.58),
    'status-info': lighten(deriveInfo(palettes), 0.65),

    // Interactive
    'interactive-primary': lighten(palettes.secondary[500], 0.78),
    'interactive-primary-hover': lighten(palettes.secondary[500], 0.72),
  };
}

/**
 * Derive warning color from error palette (error hue + 59 degrees).
 */
function deriveWarning(palettes: GeneratedPalettes): string {
  const errorColor = parseOklch(palettes.error[500]);
  return toOklchString({
    mode: 'oklch',
    l: 0.795,
    c: 0.162,
    h: (errorColor.h + 59) % 360,
  });
}

/**
 * Derive info color from primary palette hue.
 */
function deriveInfo(palettes: GeneratedPalettes): string {
  const primaryColor = parseOklch(palettes.primary[500]);
  return toOklchString({
    mode: 'oklch',
    l: 0.588,
    c: 0.139,
    h: primaryColor.h,
  });
}

/**
 * Convert a GeneratedTheme to CSS variable map for useHotelTheme.
 * Returns Record<string, string> where keys are CSS variable names (with --).
 */
export function mapShadesToCssVariables(theme: GeneratedTheme): Record<string, string> {
  const vars: Record<string, string> = {};

  // Shade scale variables
  const paletteNames: Array<[string, keyof GeneratedPalettes]> = [
    ['primary', 'primary'],
    ['secondary', 'secondary'],
    ['accent', 'accent'],
    ['success', 'success'],
    ['error', 'error'],
  ];

  for (const [cssName, key] of paletteNames) {
    const scale = theme.palettes[key];
    for (const step of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const) {
      vars[`--${cssName}-${step}-val`] = scale[step];
    }
  }

  // Light mode semantic tokens (these become the -val CSS vars)
  for (const [tokenName, value] of Object.entries(theme.light)) {
    vars[`--${tokenName}-val`] = value;
  }

  return vars;
}

/**
 * Generate the dark mode CSS variable overrides.
 */
export function mapDarkModeCssVariables(theme: GeneratedTheme): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [tokenName, value] of Object.entries(theme.dark)) {
    vars[`--${tokenName}-val`] = value;
  }

  return vars;
}
