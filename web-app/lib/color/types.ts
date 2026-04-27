/** OKLCH color components */
export interface OklchColor {
  mode: 'oklch';
  l: number;  // Lightness 0-1
  c: number;  // Chroma 0-0.4+
  h: number;  // Hue 0-360
}

/** 11-step shade scale matching Tailwind convention */
export interface ShadeScale {
  50: string;   // L=0.98
  100: string;  // L=0.94
  200: string;  // L=0.88
  300: string;  // L=0.82
  400: string;  // L=0.74
  500: string;  // L=0.65
  600: string;  // L=0.57
  700: string;  // L=0.47
  800: string;  // L=0.39
  900: string;  // L=0.32
  950: string;  // L=0.24
}

export type ShadeStep = keyof ShadeScale;

/** Shade steps array for iteration */
export const SHADE_STEPS: ShadeStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

/**
 * Lightness values for each shade step.
 *
 * These are 2-decimal rounded values from research-backed lightness steps:
 * [97.78, 93.56, 88.11, 82.67, 74.22, 64.78, 57.33, 46.89, 39.44, 32, 23.78]
 *
 * Rounding makes the values more practical for production use while maintaining
 * perceptual uniformity. Deviations from research values are <1.2% and visually
 * imperceptible.
 *
 * Source: docs/research/oklch_culori_palette_generation_*.md
 */
export const SHADE_LIGHTNESS: Record<ShadeStep, number> = {
  50: 0.98,
  100: 0.94,
  200: 0.88,
  300: 0.82,
  400: 0.74,
  500: 0.65,
  600: 0.57,
  700: 0.47,
  800: 0.39,
  900: 0.32,
  950: 0.24,
};

/** Hotel base color input (2 required, 3 optional) */
export interface HotelBaseColors {
  brandPrimary: string;     // oklch(L C H)
  brandSecondary: string;   // oklch(L C H)
  brandAccent?: string;     // oklch(L C H) — default: complementary of primary
  statusSuccess?: string;   // oklch(L C H) — default: hue 150
  statusError?: string;     // oklch(L C H) — default: hue 27
}

/** Generated palettes for all color families */
export interface GeneratedPalettes {
  primary: ShadeScale;
  secondary: ShadeScale;
  accent: ShadeScale;
  success: ShadeScale;
  error: ShadeScale;
}

/** Full generated theme including light + dark semantic tokens */
export interface GeneratedTheme {
  palettes: GeneratedPalettes;
  light: SemanticTokens;
  dark: SemanticTokens;
}

/** Semantic token set (values are oklch strings) */
export interface SemanticTokens {
  // Brand
  'brand-primary': string;
  'brand-primary-hover': string;
  'brand-secondary': string;
  'brand-secondary-hover': string;
  'on-brand': string;
  'on-brand-secondary': string;
  'brand-white': string;

  // Text
  'text-primary': string;
  'text-secondary': string;
  'text-muted': string;
  'text-inverted': string;
  'text-on-brand': string;
  'text-on-brand-secondary': string;

  // Surface
  'surface-default': string;
  'surface-primary': string;
  'surface-elevated': string;
  'surface-secondary': string;
  'surface-muted': string;

  // Border
  'border-default': string;
  'border-strong': string;

  // Status
  'status-success': string;
  'status-warning': string;
  'status-error': string;
  'status-error-strong': string;
  'status-info': string;

  // Interactive
  'interactive-primary': string;
  'interactive-primary-hover': string;
}

/** APCA contrast result */
export interface ContrastResult {
  contrast: number;  // Lc value
  passes: boolean;   // Lc >= threshold
  level: 'AAA' | 'AA' | 'fail';
}

/** Full theme contrast report */
export interface ContrastReport {
  pairs: Array<{
    foreground: string;
    background: string;
    result: ContrastResult;
    tokenPair: string;
  }>;
  allPass: boolean;
  failCount: number;
}
