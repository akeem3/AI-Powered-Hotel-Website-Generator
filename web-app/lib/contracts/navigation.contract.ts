import { z } from 'zod';

/**
 * Navigation link schema
 * Represents a single navigation link in the header
 */
export const navigationLinkSchema = z.object({
  label: z.string().min(1).max(50),
  href: z.string().min(1).max(200),
});

/**
 * Navigation CTA button schema
 * Optional call-to-action button (e.g., "Book Now")
 */
export const navigationCtaSchema = z.object({
  text: z.string().min(1).max(50),
  href: z.string().min(1).max(200),
});

/**
 * Navigation Contract
 *
 * Data-driven navigation component with 3 structural variants
 * (classic, compact, extended) and 3 visual styles (transparent, solid, glass).
 *
 * Follows the same contract pattern as FooterContract (Story 19.1).
 */
export const NavigationContract = z.object({
  variant: z.object({
    style: z.enum(['transparent', 'solid', 'glass']).optional(),
    layout: z.enum(['classic', 'compact', 'extended']).optional(),
  }).optional(),

  /** Hotel brand name displayed in the navigation */
  brandName: z.string().min(1).max(100),

  /** Navigation links (1-8 items) */
  links: z.array(navigationLinkSchema).min(1).max(8),

  /** Optional CTA button (e.g., "Book Now") */
  ctaButton: navigationCtaSchema.optional(),

  /** Optional logo image URL (falls back to initials from brandName) */
  logoUrl: z.string().max(500).optional(),

  className: z.string().optional(),
});

export type NavigationConfig = z.infer<typeof NavigationContract>;
