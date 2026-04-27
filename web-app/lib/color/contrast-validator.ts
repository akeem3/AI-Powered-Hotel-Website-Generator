import { parse, converter } from 'culori';
import type { ContrastResult, ContrastReport, GeneratedTheme } from './types';

// Convert oklch to sRGB for luminance calculation
const toSrgb = converter('rgb');

// Debug: Track first APCA calculation to always log it
let apcaCallCount = 0;
let validationCount = 0;
const ALWAYS_LOG_FIRST = true;
const ALWAYS_LOG_FIRST_VALIDATION = true;

/**
 * Calculate APCA-like contrast (simplified Lc formula).
 * Returns absolute Lc value (0-108).
 * Positive = light text on dark bg, negative = dark text on light bg.
 * We return the absolute value.
 */
export function calculateAPCA(fgOklch: string, bgOklch: string): number {
  const fg = toSrgb(parse(fgOklch));
  const bg = toSrgb(parse(bgOklch));

  if (!fg || !bg) return 0;

  // Clamp RGB values to 0-1
  const fgR = clamp(fg.r);
  const fgG = clamp(fg.g);
  const fgB = clamp(fg.b);
  const bgR = clamp(bg.r);
  const bgG = clamp(bg.g);
  const bgB = clamp(bg.b);

  // sRGB to Y (luminance) using APCA coefficients
  const fgY = sRGBtoY(fgR, fgG, fgB);
  const bgY = sRGBtoY(bgR, bgG, bgB);

  // APCA Lc calculation (simplified Silver/SAPC method)
  const Lc = apcaContrast(fgY, bgY);
  return Math.abs(Lc);
}

/**
 * Validate contrast between a foreground and background color.
 * Threshold defaults to Lc 75 (APCA AAA level for body text).
 * Use Lc 60 for non-body text (AA level), Lc 45 for headlines.
 */
export function validateContrast(
  foreground: string,
  background: string,
  threshold: number = 75
): ContrastResult {
  const contrast = calculateAPCA(foreground, background);
  const level = contrast >= 75 ? 'AAA' : contrast >= 60 ? 'AA' : 'fail';

  return {
    contrast: Math.round(contrast * 10) / 10,
    passes: contrast >= threshold,
    level,
  };
}

/**
 * Validate all critical text/background pairs in a generated theme.
 * Uses appropriate APCA thresholds per pair type:
 * - Lc 75 (AAA): body text (text-primary, text-secondary on surfaces)
 * - Lc 60 (AA): non-body text (text-muted, on-brand)
 */
export function validateThemeContrast(theme: GeneratedTheme): ContrastReport {
  const pairs: ContrastReport['pairs'] = [];

  // Critical pairs to validate (light mode) with thresholds
  const lightPairs: Array<[string, string, string, number]> = [
    ['text-primary', 'surface-default', 'Body text on default surface', 75],
    ['text-secondary', 'surface-default', 'Secondary text on default surface', 60],
    ['text-muted', 'surface-default', 'Muted text on default surface', 60],
    ['on-brand', 'brand-primary', 'Text on brand primary', 60],
    ['on-brand', 'brand-secondary', 'Text on brand secondary', 60],
    ['text-primary', 'surface-elevated', 'Body text on elevated surface', 75],
    ['text-primary', 'surface-secondary', 'Body text on secondary surface', 75],
  ];

  for (const [fgToken, bgToken, description, threshold] of lightPairs) {
    const fg = theme.light[fgToken as keyof typeof theme.light];
    const bg = theme.light[bgToken as keyof typeof theme.light];
    if (fg && bg) {
      const result = validateContrast(fg, bg, threshold);
      pairs.push({ foreground: fg, background: bg, result, tokenPair: description });
    }
  }

  // Dark mode pairs with thresholds
  const darkPairs: Array<[string, string, string, number]> = [
    ['text-primary', 'surface-default', '[Dark] Body text on default surface', 75],
    ['text-secondary', 'surface-default', '[Dark] Secondary text on default surface', 60],
    ['on-brand', 'brand-primary', '[Dark] Text on brand primary', 60],
  ];

  for (const [fgToken, bgToken, description, threshold] of darkPairs) {
    const fg = theme.dark[fgToken as keyof typeof theme.dark];
    const bg = theme.dark[bgToken as keyof typeof theme.dark];
    if (fg && bg) {
      const result = validateContrast(fg, bg, threshold);
      pairs.push({ foreground: fg, background: bg, result, tokenPair: description });
    }
  }

  const failCount = pairs.filter(p => !p.result.passes).length;

  return {
    pairs,
    allPass: failCount === 0,
    failCount,
  };
}

// --- Internal APCA math ---

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Linearize sRGB channel */
function sRGBtoLin(channel: number): number {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** sRGB to Y (relative luminance) using APCA coefficients */
function sRGBtoY(r: number, g: number, b: number): number {
  return 0.2126729 * sRGBtoLin(r) + 0.7151522 * sRGBtoLin(g) + 0.0721750 * sRGBtoLin(b);
}

/** APCA contrast calculation (simplified) */
function apcaContrast(txtY: number, bgY: number): number {
  // Soft clamp
  const Ytxt = txtY > 0.022 ? txtY : txtY + Math.pow(0.022 - txtY, 1.414);
  const Ybg = bgY > 0.022 ? bgY : bgY + Math.pow(0.022 - bgY, 1.414);

  // SAPC contrast
  if (Ybg > Ytxt) {
    // Normal polarity (dark text on light bg)
    const SAPC = (Math.pow(Ybg, 0.56) - Math.pow(Ytxt, 0.57)) * 1.14;
    return SAPC < 0.1 ? 0 : (SAPC - 0.027) * 100;
  } else {
    // Reverse polarity (light text on dark bg)
    const SAPC = (Math.pow(Ybg, 0.65) - Math.pow(Ytxt, 0.62)) * 1.14;
    return SAPC > -0.1 ? 0 : (SAPC + 0.027) * 100;
  }
}
