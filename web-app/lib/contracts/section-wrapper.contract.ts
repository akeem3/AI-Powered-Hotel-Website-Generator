/**
 * Section Wrapper Contract
 *
 * @trace epic: EPIC-18
 * @trace story: STORY-18.5
 * @trace reqs: FR7, FR8
 *
 * Why: Defines the Zod schema for configurable section wrapper styles.
 * Enables per-component wrapper configuration via HomepageConfig, allowing
 * different hotel types to have distinct section header treatments.
 *
 * Wrapper Styles:
 * - accent: Gold accent bar pattern (current GoldAccentHeader behavior)
 * - simple: Plain heading with optional subheading, no decorative elements
 * - numbered: Numbered badge (01, 02) alongside heading for progressive sections
 * - none: No wrapper markup - component renders directly
 *
 * @example
 * ```tsx
 * import { SectionWrapperContract, type SectionWrapperConfig } from '@/lib/contracts/section-wrapper.contract';
 *
 * const wrapperConfig: SectionWrapperConfig = {
 *   style: 'accent',
 *   title: 'Explore Our Hotel',
 *   description: 'Discover our luxurious facilities'
 * };
 * ```
 */

import { z } from 'zod';

/**
 * Section Wrapper Contract
 *
 * Zod schema for section wrapper configuration.
 * Validates wrapper style enum and optional title/description fields.
 */
export const SectionWrapperContract = z.object({
  /**
   * Wrapper style variant
   * - accent: Gold accent bars with decorative elements (luxury feel)
   * - simple: Clean heading only (minimal, budget-friendly)
   * - numbered: Progressive numbered badge (business, structured)
   * - none: No wrapper at all (component renders directly)
   */
  style: z.enum(['accent', 'simple', 'numbered', 'none']),

  /**
   * Section heading title
   * Required for accent, simple, and numbered styles.
   * Ignored when style is 'none'.
   */
  title: z.string().min(1).max(200).optional(),

  /**
   * Section description/subheading
   * Optional text displayed below the main heading.
   * Only used for accent style currently.
   */
  description: z.string().max(500).optional(),
});

/**
 * Inferred TypeScript type from SectionWrapperContract
 *
 * Use this type for wrapper configuration objects throughout the codebase.
 *
 * @example
 * ```tsx
 * const wrapper: SectionWrapperConfig = {
 *   style: 'accent',
 *   title: 'Our Amenities',
 *   description: 'Everything you need for a perfect stay'
 * };
 * ```
 */
export type SectionWrapperConfig = z.infer<typeof SectionWrapperContract>;
