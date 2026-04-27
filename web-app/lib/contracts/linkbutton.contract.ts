import { z } from 'zod';

// =============================================================================
// LINKBUTTON CONTRACT
// =============================================================================
//
// Issue #4: LinkButton for "View More" functionality
//
// This contract defines the schema for the LinkButton component used
// to create "View More" buttons that link from teaser sections to
// their full dedicated pages.
//
// =============================================================================

/**
 * LinkButton Contract
 *
 * Validates all LinkButton component props including text, href,
 * ariaLabel, and optional styling.
 *
 * @example
 * ```tsx
 * const linkButtonConfig: LinkButtonConfig = {
 *   text: 'View Full Gallery',
 *   href: '/gallery',
 *   ariaLabel: 'View full photo gallery',
 *   center: true,
 *   variant: { style: 'primary' }
 * };
 * ```
 */
export const LinkButtonContract = z.object({
  /**
   * Button text (required)
   * The visible text on the button (e.g., "View All Rooms")
   */
  text: z.string().min(2).max(100),

  /**
   * Link destination (required)
   * The URL or path that the button links to
   */
  href: z.string().min(1).max(500),

  /**
   * Accessibility label (required)
   * ARIA label for screen readers describing the link destination
   */
  ariaLabel: z.string().min(2).max(200),

  /**
   * Center alignment (optional)
   * Whether to center the button within its container
   * Default: false
   */
  center: z.boolean().optional(),

  /**
   * Additional CSS classes (optional)
   * For custom styling overrides
   */
  className: z.string().optional(),

  /**
   * Variant configuration (optional)
   * Controls button styling
   * style: 'primary' | 'secondary' | etc.
   */
  variant: z.object({
    style: z.string().optional()
  }).optional()
}).strict();

/**
 * LinkButton Config Type
 * Inferred from LinkButtonContract for use in component props
 */
export type LinkButtonConfig = z.infer<typeof LinkButtonContract>;
