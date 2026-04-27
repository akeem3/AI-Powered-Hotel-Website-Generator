import { z } from 'zod';

// =============================================================================
// FOOTER CONTRACT
// =============================================================================
//
// Story 19.1: Footer Block (3 Structural Variants)
//
// This contract defines the schema for the Footer component with three
// structural variants: Classic, Minimal, and Stacked.
//
// Epic 19: Extended Block Library (Footer, About, FAQ, Features)
// FR Coverage: FR7, FR8, FR10
//
// =============================================================================

/**
 * Social link platform enum
 * Defines supported social media platforms for footer social icons
 */
export const socialPlatformEnum = z.enum([
  'facebook',
  'instagram',
  'twitter',
  'tripadvisor',
  'google',
  'linkedin'
]);

/**
 * Social link schema
 * Represents a single social media link with platform and URL
 */
export const socialLinkSchema = z.object({
  platform: socialPlatformEnum,
  url: z.string().min(1).max(500)
});

/**
 * Navigation link schema
 * Represents a single navigation link in the footer
 */
export const navigationLinkSchema = z.object({
  label: z.string().min(1).max(50),
  href: z.string().min(1).max(200)
});

/**
 * Footer Contract
 *
 * Validates all Footer component props including variant selection,
 * hotel information, contact details, social links, and navigation links.
 *
 * Variant Layouts:
 * - 'classic': Multi-column layout with link columns, contact info, social icons
 * - 'minimal': Single-row layout (copyright + social icons only)
 * - 'stacked': Full-width vertically stacked sections with optional newsletter
 *
 * @example
 * ```tsx
 * const footerConfig: FooterConfig = {
 *   hotelName: 'Grand Hotel',
 *   address: '123 Main St, City, Country',
 *   phone: '+1-555-0123',
 *   email: 'contact@grandhotel.com',
 *   variant: {
 *     layout: 'classic'
 *   },
 *   socialLinks: [
 *     { platform: 'facebook', url: 'https://facebook.com/grandhotel' },
 *     { platform: 'instagram', url: 'https://instagram.com/grandhotel' }
 *   ],
 *   navigationLinks: [
 *     { label: 'About Us', href: '/about' },
 *     { label: 'Contact', href: '/contact' }
 *   ],
 *   copyright: `© ${new Date().getFullYear()} Grand Hotel. All rights reserved.`
 * };
 * ```
 */
export const FooterContract = z.object({
  /**
   * Variant configuration controlling layout and visual style
   * layout: 'classic' | 'minimal' | 'stacked'
   * - Classic: Multi-column with all sections (default)
   * - Minimal: Single row with copyright + social icons only
   * - Stacked: Full-width stacked sections with optional newsletter
   */
  variant: z.object({
    layout: z.enum(['classic', 'minimal', 'stacked']).optional()
  }).optional(),

  /**
   * Hotel name (required)
   * Displayed prominently in the footer
   */
  hotelName: z.string().min(1).max(100),

  /**
   * Physical address (optional)
   * Street address, city, country
   */
  address: z.string().max(200).optional(),

  /**
   * Phone number (optional)
   * Contact phone with optional country code
   */
  phone: z.string().max(30).optional(),

  /**
   * Email address (optional)
   * Contact email for inquiries
   */
  email: z.string().email().max(100).optional(),

  /**
   * Social media links (optional)
   * Array of social platform links with icons
   */
  socialLinks: z.array(socialLinkSchema).optional(),

  /**
   * Navigation links (optional)
   * Array of footer navigation links organized by category
   * Used by Classic and Stacked layouts
   */
  navigationLinks: z.array(navigationLinkSchema).optional(),

  /**
   * Copyright text (optional)
   * Legal/copyright notice
   * Defaults to `© {currentYear} {hotelName}. All rights reserved.` if not provided
   */
  copyright: z.string().max(200).optional(),

  /**
   * Number of grid columns (optional)
   * Controls the layout grid column count
   * Default: 4
   */
  columns: z.union([z.literal(3), z.literal(4)]).optional(),

  /**
   * Background theme variant (optional)
   * Controls the footer background appearance
   * - 'muted': Muted background
   * - 'brand-primary': Brand primary background
   * - 'surface-elevated': Elevated surface background
   * - 'surface-primary': Primary surface background
   */
  background: z.enum(['muted', 'brand-primary', 'surface-elevated', 'surface-primary']).optional(),

  /**
   * Horizontal alignment (optional)
   * Controls horizontal alignment for minimal footer variant
   * - 'left': Left-aligned content
   * - 'center': Center-aligned content
   */
  align: z.enum(['left', 'center']).optional(),

  /**
   * Include newsletter signup (optional)
   * Controls whether stacked footer includes newsletter section
   * Default: true
   */
  newsletter: z.boolean().optional(),

  /**
   * Additional CSS classes (optional)
   * For custom styling overrides
   */
  className: z.string().optional()
}).strict();

/**
 * Footer Config Type
 * Inferred from FooterContract for use in component props
 */
export type FooterConfig = z.infer<typeof FooterContract>;
