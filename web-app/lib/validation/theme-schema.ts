/**
 * Theme validation schemas
 *
 * Input schema: Hotels provide 2-5 OKLCH base colors + typography.
 * All semantic tokens (surfaces, text, borders, status, etc.) are
 * generated algorithmically by the palette generator — not validated here.
 */

import { z } from 'zod';

// OKLCH format regex: oklch(L C H) where L, C, H are numbers (decimals allowed)
const oklchRegex = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;

/**
 * Base theme schema — validates hotel input (2-5 OKLCH colors + typography).
 * Semantic tokens are derived by the palette generator, not provided by the hotel.
 */
export const HotelThemeSchema = z.object({
  colors: z.object({
    brandPrimary: z.string().regex(oklchRegex, 'Must be OKLCH format: oklch(L C H)'),
    brandSecondary: z.string().regex(oklchRegex, 'Must be OKLCH format: oklch(L C H)'),
    brandAccent: z.string().regex(oklchRegex, 'Must be OKLCH format: oklch(L C H)').optional(),
    statusSuccess: z.string().regex(oklchRegex, 'Must be OKLCH format: oklch(L C H)').optional(),
    statusError: z.string().regex(oklchRegex, 'Must be OKLCH format: oklch(L C H)').optional(),
  }),
  typography: z.object({
    displayFont: z.string().min(1),
    bodyFont: z.string().min(1),
  }),
});

/**
 * Generated theme output schema — validates the output of the palette generator.
 * All semantic tokens are OKLCH strings produced algorithmically.
 */
export const GeneratedThemeSchema = z.object({
  colors: z.object({
    brandPrimary: z.string().regex(oklchRegex),
    brandSecondary: z.string().regex(oklchRegex),
    brandPrimaryHover: z.string().regex(oklchRegex),
    brandSecondaryHover: z.string().regex(oklchRegex),
    onBrand: z.string().regex(oklchRegex),
    surfacePrimary: z.string().regex(oklchRegex),
    surfaceElevated: z.string().regex(oklchRegex),
    surfaceSecondary: z.string().regex(oklchRegex),
    surfaceMuted: z.string().regex(oklchRegex),
    textPrimary: z.string().regex(oklchRegex),
    textSecondary: z.string().regex(oklchRegex),
    textMuted: z.string().regex(oklchRegex),
    textInverted: z.string().regex(oklchRegex),
    borderDefault: z.string().regex(oklchRegex),
    borderStrong: z.string().regex(oklchRegex),
    statusSuccess: z.string().regex(oklchRegex),
    statusWarning: z.string().regex(oklchRegex),
    statusError: z.string().regex(oklchRegex),
    statusErrorStrong: z.string().regex(oklchRegex),
    statusInfo: z.string().regex(oklchRegex),
  }),
  typography: z.object({
    displayFont: z.string().min(1),
    bodyFont: z.string().min(1),
    monoFont: z.string().optional(),
  }),
  shadows: z.object({
    sm: z.string().optional(),
    md: z.string().optional(),
    lg: z.string().optional(),
    card: z.string().optional(),
    cardHover: z.string().optional(),
  }).optional(),
  radius: z.object({
    sm: z.string().optional(),
    md: z.string().optional(),
    lg: z.string().optional(),
    xl: z.string().optional(),
    '2xl': z.string().optional(),
  }).optional(),
});

export type HotelTheme = z.infer<typeof HotelThemeSchema>;
export type GeneratedTheme = z.infer<typeof GeneratedThemeSchema>;
