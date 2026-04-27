/**
 * Border radius enum values for type safety.
 * Local definition since Epic 20 schema is not yet complete.
 */
type BorderRadiusStyle = 'sharp' | 'subtle' | 'rounded' | 'pill';

/**
 * Border radius CSS variable values for a given style.
 * Maps each radius token to its CSS value string.
 */
interface BorderRadiusVariableValues {
  '--radius-sm': string;
  '--radius-md': string;
  '--radius-lg': string;
  '--radius-xl': string;
  '--radius-2xl': string;
  '--radius-full': string;
}

/**
 * Map border radius style to CSS variable values.
 *
 * Story 20.5: Token Pipeline Integration
 *
 * Converts the border radius enum from HotelDesignTokens into CSS variable
 * values for border radius tokens. Values are specified in pixels for precision,
 * matching the design system specifications.
 *
 * Radius styles:
 * - sharp: 0-2px - minimal rounding, modern (urban-tech, design-art archetypes)
 * - subtle: 4-8px - gentle rounding, balanced (default for most archetypes)
 * - rounded: 12-16px - full rounding, friendly (family-resort, wellness-spa archetypes)
 * - pill: 9999px - completely round, playful (boutique-editorial, coastal-resort archetypes)
 *
 * Note: --radius-full is always 9999px (completely round) regardless of style,
 * as it's used for circular elements like avatars and pill buttons.
 *
 * @param borderRadius - The border radius style enum value
 * @returns CSS variable name to value mapping for radius tokens
 *
 * @example
 * const radiusVars = mapBorderRadius('sharp');
 * // Returns: { '--radius-sm': '0', '--radius-md': '2px', '--radius-lg': '2px', ... }
 *
 * // Apply to DOM:
 * Object.entries(radiusVars).forEach(([varName, value]) => {
 *   root.style.setProperty(varName, value);
 * });
 */
export function mapBorderRadius(borderRadius: BorderRadiusStyle): BorderRadiusVariableValues {
  // Define border radius configurations for each style
  // Values specified in pixels for design precision
  const radiusConfigs: Record<BorderRadiusStyle, BorderRadiusVariableValues> = {
    'sharp': {
      '--radius-sm': '0',
      '--radius-md': '2px',
      '--radius-lg': '2px',
      '--radius-xl': '4px',
      '--radius-2xl': '6px',
      '--radius-full': '9999px',
    },
    'subtle': {
      '--radius-sm': '4px',
      '--radius-md': '8px',
      '--radius-lg': '8px',
      '--radius-xl': '12px',
      '--radius-2xl': '16px',
      '--radius-full': '9999px',
    },
    'rounded': {
      '--radius-sm': '8px',
      '--radius-md': '12px',
      '--radius-lg': '16px',
      '--radius-xl': '20px',
      '--radius-2xl': '24px',
      '--radius-full': '9999px',
    },
    'pill': {
      '--radius-sm': '12px',
      '--radius-md': '9999px',
      '--radius-lg': '9999px',
      '--radius-xl': '9999px',
      '--radius-2xl': '9999px',
      '--radius-full': '9999px',
    },
  };

  return radiusConfigs[borderRadius];
}

/**
 * Get all available border radius styles.
 * Useful for validation and testing.
 *
 * @returns Array of all valid border radius enum values
 */
export function getBorderRadiusStyles(): BorderRadiusStyle[] {
  return ['sharp', 'subtle', 'rounded', 'pill'];
}

/**
 * Check if a given value is a valid border radius style.
 *
 * @param value - Value to check
 * @returns True if the value is a valid border radius style
 */
export function isValidBorderRadiusStyle(value: string): value is BorderRadiusStyle {
  return getBorderRadiusStyles().includes(value as BorderRadiusStyle);
}
