/**
 * Typography Mapper
 *
 * Story 20.4: Typography Mapper
 *
 * Maps typography personality tokens into CSS font declarations with
 * font family CSS variables, font weights, and letter-spacing (tracking).
 *
 * This mapper enables runtime font selection based on archetype-specific
 * typography personalities defined in HotelDesignTokens.
 *
 * The pre-loaded font CSS variables are injected in layout.tsx (Story 20.4a).
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 */

import type { HotelDesignTokens } from './schemas/hotel-design-tokens.schema';

/**
 * Font stack configuration for a typography personality.
 *
 * Includes the CSS variable name for the font family, along with
 * recommended font weights and letter-spacing (tracking) values.
 */
export interface TypographyStack {
  /**
   * CSS variable name for the font family.
   * Must match one of the pre-loaded variables from layout.tsx.
   */
  fontFamily: string;

  /**
   * Recommended font weights for this personality.
   * Multiple ranges support different use cases (light, regular, bold).
   */
  weights: number[];

  /**
   * Letter-spacing (tracking) value in em units.
   * Positive values increase spacing, negative values decrease it.
   */
  tracking: number;

  /**
   * Font stretch/width (optional).
   * Some personalities use condensed or expanded variants.
   */
  stretch?: 'condensed' | 'normal' | 'expanded';
}

/**
 * Complete typography mapping for all personalities.
 *
 * Maps each heading and body personality to its corresponding:
 * - Font family CSS variable (from layout.tsx pre-loaded fonts)
 * - Font weights (appropriate range for the personality)
 * - Tracking (letter-spacing in em units)
 * - Optional stretch/width modifier
 */
export const TYPOGRAPHY_MAP: Record<string, TypographyStack> = {
  /**
   * Serif Elegant - Wide-set serif, all caps headings
   *
   * Visual Signals: Wide-set serif, all caps headings | Formal, traditional
   * Use for: Heritage opulence, Heritage cultural
   * Font: Cormorant Garamond (--font-serif-elegant)
   */
  'serif-elegant': {
    fontFamily: '--font-serif-elegant',
    weights: [300, 400, 500, 600, 700],
    tracking: 0.05, // Wide-set (5% of em)
  },

  /**
   * Serif Readable - Readable serif for body text
   *
   * Visual Signals: Readable serif | Legible, book-like
   * Use for: Body text in luxury/traditional contexts
   * Font: Libre Baskerville (--font-serif-readable)
   */
  'serif-readable': {
    fontFamily: '--font-serif-readable',
    weights: [400, 700],
    tracking: 0.01, // Slightly increased for readability
  },

  /**
   * Sans Modern - Modern sans-serif
   *
   * Visual Signals: Modern sans | Clean, functional
   * Use for: Urban tech, Business hotel, Contemporary luxury
   * Font: Inter (--font-sans-modern)
   */
  'sans-modern': {
    fontFamily: '--font-sans-modern',
    weights: [300, 400, 500, 600, 700],
    tracking: -0.01, // Slightly tight for modern look
  },

  /**
   * Display Decorative - Display fonts for headlines
   *
   * Visual Signals: Display fonts | Bold, statement-making
   * Use for: Boutique editorial, Design art, Hero headlines
   * Font: Space Grotesk (--font-display-decorative)
   */
  'display-decorative': {
    fontFamily: '--font-display-decorative',
    weights: [300, 400, 500, 600, 700],
    tracking: -0.02, // Tight for display headlines
  },

  /**
   * Slab Strong - Slab serif for impact
   *
   * Visual Signals: Slab serif | Rugged, strong, impactful
   * Use for: Mountain wilderness, Outdoor themes
   * Font: Roboto Slab (--font-slab-strong)
   */
  'slab-strong': {
    fontFamily: '--font-slab-strong',
    weights: [300, 400, 500, 700, 900],
    tracking: 0.02, // Slightly open for impact
  },

  /**
   * Humanist Organic - Humanist sans-serif
   *
   * Visual Signals: Humanist sans | Friendly, approachable
   * Use for: Wellness spa, Eco lodge, Family resort
   * Font: Source Sans 3 (--font-humanist-organic)
   */
  'humanist-organic': {
    fontFamily: '--font-humanist-organic',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    tracking: 0.0, // Neutral spacing
  },
};

/**
 * Typography declaration result.
 *
 * Contains CSS variable declarations for heading and body fonts,
 * along with their weight and tracking configurations.
 */
export interface TypographyDeclaration {
  /**
   * Heading font family CSS variable.
   * Applied to --font-display CSS variable.
   */
  headingFont: string;

  /**
   * Body font family CSS variable.
   * Applied to --font-body CSS variable.
   */
  bodyFont: string;

  /**
   * Heading font weights.
   * Array of valid weights for the heading personality.
   */
  headingWeights: number[];

  /**
   * Body font weights.
   * Array of valid weights for the body personality.
   */
  bodyWeights: number[];

  /**
   * Heading letter-spacing (tracking) in em units.
   */
  headingTracking: number;

  /**
   * Body letter-spacing (tracking) in em units.
   */
  bodyTracking: number;

  /**
   * Type scale ratio for heading size progression.
   * Used to calculate responsive heading sizes.
   */
  scaleRatio: number;
}

/**
 * Type scale ratio to numeric multiplier mapping.
 *
 * Maps the scale ratio enum values to their numeric multipliers
 * for calculating heading size progressions.
 */
const SCALE_RATIO_MULTIPLIERS: Record<string, number> = {
  'minor-third': 1.2,
  'major-third': 1.25,
  'perfect-fourth': 1.333,
  'golden-ratio': 1.618,
};

/**
 * Map typography personalities from HotelDesignTokens to CSS font declarations.
 *
 * This function processes the typography.headingPersonality and
 * typography.bodyPersonality from HotelDesignTokens and returns
 * CSS variable declarations ready for application via CSS custom properties.
 *
 * @param tokens - HotelDesignTokens containing typography personality selections
 * @returns TypographyDeclaration with CSS variables and font configurations
 *
 * @example
 * ```ts
 * const tokens: HotelDesignTokens = {
 *   typography: {
 *     headingPersonality: 'serif-elegant',
 *     bodyPersonality: 'sans-modern',
 *     scaleRatio: 'perfect-fourth'
 *   },
 *   // ... other token categories
 * };
 *
 * const declaration = mapTypography(tokens);
 * // {
 * //   headingFont: '--font-serif-elegant',
 * //   bodyFont: '--font-sans-modern',
 * //   headingWeights: [300, 400, 500, 600, 700],
 * //   bodyWeights: [300, 400, 500, 600, 700],
 * //   headingTracking: 0.05,
 * //   bodyTracking: -0.01,
 * //   scaleRatio: 1.333
 * // }
 * ```
 *
 * Usage in CSS:
 * ```css
 * h1, h2, h3, h4, h5, h6 {
 *   font-family: var(--heading-font);
 *   font-weight: var(--heading-weight);
 *   letter-spacing: var(--heading-tracking);
 * }
 *
 * body, p {
 *   font-family: var(--body-font);
 *   font-weight: var(--body-weight);
 *   letter-spacing: var(--body-tracking);
 * }
 * ```
 */
export function mapTypography(tokens: HotelDesignTokens): TypographyDeclaration {
  const { typography } = tokens;

  // Get heading personality configuration
  const headingStack = TYPOGRAPHY_MAP[typography.headingPersonality];
  if (!headingStack) {
    throw new Error(
      `Unknown heading personality: "${typography.headingPersonality}". ` +
      `Valid options: ${Object.keys(TYPOGRAPHY_MAP).join(', ')}`
    );
  }

  // Get body personality configuration
  const bodyStack = TYPOGRAPHY_MAP[typography.bodyPersonality];
  if (!bodyStack) {
    throw new Error(
      `Unknown body personality: "${typography.bodyPersonality}". ` +
      `Valid options: ${Object.keys(TYPOGRAPHY_MAP).join(', ')}`
    );
  }

  // Get scale ratio multiplier
  const scaleRatio = SCALE_RATIO_MULTIPLIERS[typography.scaleRatio];
  if (scaleRatio === undefined) {
    throw new Error(
      `Unknown scale ratio: "${typography.scaleRatio}". ` +
      `Valid options: ${Object.keys(SCALE_RATIO_MULTIPLIERS).join(', ')}`
    );
  }

  return {
    headingFont: headingStack.fontFamily,
    bodyFont: bodyStack.fontFamily,
    headingWeights: headingStack.weights,
    bodyWeights: bodyStack.weights,
    headingTracking: headingStack.tracking,
    bodyTracking: bodyStack.tracking,
    scaleRatio,
  };
}

/**
 * Get all available heading personalities.
 *
 * Useful for validation, UI selection, or documentation.
 *
 * @returns Array of all valid heading personality values
 */
export function getHeadingPersonalities(): string[] {
  return [
    'serif-elegant',
    'serif-readable',
    'sans-modern',
    'display-decorative',
    'slab-strong',
    'humanist-organic',
  ];
}

/**
 * Get all available body personalities.
 *
 * Useful for validation, UI selection, or documentation.
 *
 * @returns Array of all valid body personality values
 */
export function getBodyPersonalities(): string[] {
  return [
    'sans-modern',
    'serif-readable',
    'humanist-organic',
  ];
}

/**
 * Validate a typography personality value.
 *
 * @param personality - The personality string to validate
 * @param type - Either 'heading' or 'body'
 * @returns true if valid, false otherwise
 */
export function isValidTypographyPersonality(
  personality: string,
  type: 'heading' | 'body' = 'heading'
): boolean {
  const validPersonalities = type === 'heading'
    ? getHeadingPersonalities()
    : getBodyPersonalities();

  return validPersonalities.includes(personality);
}

/**
 * Get typography stack configuration for a personality.
 *
 * Returns the full stack configuration including font family,
 * weights, tracking, and stretch for the given personality.
 *
 * @param personality - The typography personality
 * @returns TypographyStack configuration or undefined if not found
 */
export function getTypographyStack(personality: string): TypographyStack | undefined {
  return TYPOGRAPHY_MAP[personality];
}
