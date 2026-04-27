import type { OklchColor } from './types';

const OKLCH_REGEX = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/;

/**
 * Parse an oklch(L C H) CSS string into an OklchColor object.
 * Throws if the string is not valid OKLCH format.
 */
export function parseOklch(cssString: string): OklchColor {
  const match = cssString.trim().match(OKLCH_REGEX);
  if (!match) {
    throw new Error(`Invalid OKLCH format: "${cssString}". Expected: oklch(L C H)`);
  }

  const l = parseFloat(match[1]);
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);

  if (isNaN(l) || isNaN(c) || isNaN(h)) {
    throw new Error(`Invalid OKLCH values in: "${cssString}"`);
  }

  if (l < 0 || l > 1) {
    throw new Error(`OKLCH lightness must be 0-1, got: ${l}`);
  }
  if (c < 0) {
    throw new Error(`OKLCH chroma must be non-negative, got: ${c}`);
  }

  return { mode: 'oklch', l, c, h };
}

/**
 * Serialize an OklchColor to an oklch(L C H) CSS string.
 * Rounds values for clean output.
 */
export function toOklchString(color: OklchColor): string {
  const l = roundTo(color.l, 3);
  const c = roundTo(color.c, 3);
  const h = roundTo(color.h, 1);
  return `oklch(${l} ${c} ${h})`;
}

/**
 * Parse and re-serialize to normalize an OKLCH string.
 */
export function normalizeOklch(cssString: string): string {
  return toOklchString(parseOklch(cssString));
}

function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
