/**
 * Spacing density enum values for type safety.
 *
 * Story 23.1: Local definition since Epic 20 schema stub does not include spacing yet.
 * When Epic 20 is complete, this should use:
 * import type { Spacing } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';
 * type SpacingDensity = Spacing['density'];
 */
type SpacingDensity = 'tight' | 'comfortable' | 'airy' | 'spacious';

/**
 * Spacing CSS variable values for a given density.
 * Maps each spacing token to its CSS value string.
 *
 * Story 23.1: Uses -val suffix to match the color system pattern,
 * enabling runtime overrides via @theme inline + var() indirection.
 */
interface SpacingVariableValues {
  '--spacing-section-val': string;
  '--spacing-container-val': string;
  '--spacing-card-val': string;
  '--spacing-hero-val': string;
  '--spacing-gap-card-val': string;
  '--spacing-gap-section-val': string;
}

/**
 * Map spacing density to CSS variable values.
 *
 * Story 20.5: Token Pipeline Integration
 * Story 23.1: Updated to use -val suffix matching color system pattern
 *
 * Converts the spacing density enum from HotelDesignTokens into CSS variable
 * values for responsive spacing using clamp(). The clamp() function provides
 * fluid scaling between minimum and maximum values at different viewport widths.
 *
 * Density levels:
 * - tight: 16-24px - compact, efficient (urban-tech, business-hotel archetypes)
 * - comfortable: 32-64px - standard, balanced (default for most archetypes)
 * - airy: 48-64px - spacious, relaxed (coastal-resort, wellness-spa archetypes)
 * - spacious: 64-96px - maximum whitespace, luxury (heritage-opulence, quiet-luxury archetypes)
 *
 * All spacing tokens use responsive clamp() values:
 * - clamp(min, preferred, max) where preferred uses vw units for fluidity
 *
 * Story 23.1: The comfortable density now uses Story 15.1 validated formulas
 * that properly target the 375px-768px viewport range.
 *
 * @param density - The spacing density enum value
 * @returns CSS variable name to value mapping for spacing tokens
 *
 * @example
 * const spacingVars = mapSpacingDensity('tight');
 * // Returns: { '--spacing-section-val': 'clamp(1rem, 2vw, 1.5rem)', ... }
 *
 * // Apply to DOM:
 * Object.entries(spacingVars).forEach(([varName, value]) => {
 *   root.style.setProperty(varName, value);
 * });
 */
export function mapSpacingDensity(density: SpacingDensity): SpacingVariableValues {
  // Define spacing configurations for each density level
  // Values use clamp(min, preferred, max) for responsive fluidity
  const spacingConfigs: Record<SpacingDensity, SpacingVariableValues> = {
    'tight': {
      '--spacing-section-val': 'clamp(1rem, 2vw, 1.5rem)',
      '--spacing-container-val': 'clamp(0.75rem, 3vw, 1.25rem)',
      '--spacing-card-val': 'clamp(0.75rem, 1.5vw, 1rem)',
      '--spacing-hero-val': 'clamp(2rem, 6vw, 4rem)',
      '--spacing-gap-card-val': 'clamp(0.75rem, 1.25vw, 1.25rem)',
      '--spacing-gap-section-val': 'clamp(1rem, 3vw, 2rem)',
    },
    'comfortable': {
      '--spacing-section-val': 'clamp(2rem, 0.0915rem + 8.143vw, 4rem)',
      '--spacing-container-val': 'clamp(1rem, 0.0459rem + 4.071vw, 2rem)',
      '--spacing-card-val': 'clamp(1rem, 2vw, 1.5rem)',
      '--spacing-hero-val': 'clamp(4rem, 10vw, 8rem)',
      '--spacing-gap-card-val': 'clamp(1rem, 1.5vw, 2rem)',
      '--spacing-gap-section-val': 'clamp(2rem, 4vw, 4rem)',
    },
    'airy': {
      '--spacing-section-val': 'clamp(3rem, 5vw, 4rem)',
      '--spacing-container-val': 'clamp(1.5rem, 6vw, 2.5rem)',
      '--spacing-card-val': 'clamp(1.5rem, 3vw, 2rem)',
      '--spacing-hero-val': 'clamp(5rem, 12vw, 10rem)',
      '--spacing-gap-card-val': 'clamp(1.5rem, 2.5vw, 2.5rem)',
      '--spacing-gap-section-val': 'clamp(2.5rem, 5vw, 5rem)',
    },
    'spacious': {
      '--spacing-section-val': 'clamp(4rem, 7vw, 6rem)',
      '--spacing-container-val': 'clamp(2rem, 7vw, 3rem)',
      '--spacing-card-val': 'clamp(2rem, 4vw, 2.5rem)',
      '--spacing-hero-val': 'clamp(6rem, 14vw, 12rem)',
      '--spacing-gap-card-val': 'clamp(2rem, 3vw, 3rem)',
      '--spacing-gap-section-val': 'clamp(3rem, 6vw, 6rem)',
    },
  };

  return spacingConfigs[density];
}

/**
 * Get all available spacing density values.
 * Useful for validation and testing.
 *
 * @returns Array of all valid spacing density enum values
 */
export function getSpacingDensities(): SpacingDensity[] {
  return ['tight', 'comfortable', 'airy', 'spacious'];
}

/**
 * Check if a given value is a valid spacing density.
 *
 * @param value - Value to check
 * @returns True if the value is a valid spacing density
 */
export function isValidSpacingDensity(value: string): value is SpacingDensity {
  return getSpacingDensities().includes(value as SpacingDensity);
}
