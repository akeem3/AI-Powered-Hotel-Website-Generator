/**
 * FooterClassic Component
 *
 * Story 19.1: Footer Block - FooterClassic Sub-Component
 *
 * Multi-column footer layout with link columns, contact info, and social icons.
 *
 * Layout Structure (3-4 columns on desktop, stacked on mobile):
 * - Column 1: Hotel name + address + phone + email
 * - Column 2-3: Navigation link groups (split by category)
 * - Column 4: Social media icons (horizontal row)
 * - Bottom bar: Copyright text with full-width border-top separator
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/blocks/Footer/FooterClassic
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { FooterContract, type FooterConfig } from '@/lib/contracts/footer.contract';

// Import Lucide icons for social media
import { Facebook, Instagram, Twitter, MapPin, Globe, Linkedin } from 'lucide-react';

/**
 * Social icon component mapping
 * Maps platform names to Lucide icon components
 *
 * Note: lucide-react doesn't have a Tripadvisor icon, so we use MapPin
 * as a location-based alternative for the tripadvisor platform.
 */
const SOCIAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  tripadvisor: MapPin, // Using MapPin as location-based alternative
  google: Globe,
  linkedin: Linkedin
} as const;

/**
 * Social Link Component
 *
 * Renders a single social media link with icon and proper accessibility.
 * Uses aria-label on the link and aria-hidden on the icon (WCAG 2.1 AA).
 *
 * @param platform - Social platform name
 * @param url - Social media URL
 */
function SocialLink({ platform, url }: { platform: string; url: string }) {
  const Icon = SOCIAL_ICONS[platform];

  if (!Icon) {
    console.warn(`[FooterClassic] Unknown social platform: ${platform}`);
    return null;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Visit us on ${platform}`}
      className={cn(
        "inline-flex items-center justify-center w-10 h-10 rounded-full",
        "bg-white/10 text-white",
        "hover:bg-brand-secondary hover:text-brand-primary",
        "focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:ring-offset-2 focus:ring-offset-brand-primary",
        "transition-all duration-200"
      )}
    >
      <Icon aria-hidden="true" className="w-5 h-5" />
    </a>
  );
}

/**
 * Footer Classic CVA Variants
 *
 * Scoped CVA for FooterClassic styling variations.
 * Uses ONLY semantic design tokens.
 */
const footerClassicCva = cva(
  // Base classes - Dark blue background with white text
  "w-full border-t border-white/10 bg-brand-primary text-white",
  {
    variants: {
      columns: {
        3: "grid-cols-1 md:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-4"
      }
    },
    defaultVariants: {
      columns: 4
    }
  }
);

/**
 * FooterClassic Component Props
 *
 * Extends FooterConfig with additional variant options
 */
export interface FooterClassicProps extends FooterConfig {
  /**
   * Number of columns (3 or 4)
   * Default: 4
   */
  columns?: 3 | 4;

  /**
   * Background theme variant
   * Default: 'muted'
   */
  background?: 'muted' | 'brand-primary' | 'surface-elevated' | 'surface-primary';
}

/**
 * Navigation Link Group Component
 *
 * Groups navigation links by category for column display
 */
function NavigationLinkGroup({
  links,
  title
}: {
  links: Array<{ label: string; href: string }>;
  title?: string;
}) {
  if (!links || links.length === 0) return null;

  return (
    <div className="flex flex-col gap-gap-card">
      {title && (
        <h3 className="text-brand-secondary text-size-body font-semibold uppercase tracking-wide pb-gap-card/2 border-b border-white/20">
          {title}
        </h3>
      )}
      <ul className="flex flex-col gap-2">
        {links.map((link, index) => (
          <li key={index}>
            <a
              href={link.href}
              className={cn(
                "text-white hover:text-brand-secondary",
                "transition-colors duration-200",
                "text-size-body leading-relaxed"
              )}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * FooterClassic Component
 *
 * Multi-column footer with hotel info, navigation links, social icons, and copyright.
 *
 * @example
 * ```tsx
 * <FooterClassic
 *   hotelName="Grand Hotel"
 *   address="123 Main St, City, Country"
 *   phone="+1-555-0123"
 *   email="contact@grandhotel.com"
 *   socialLinks={[
 *     { platform: 'facebook', url: 'https://facebook.com/grandhotel' },
 *     { platform: 'instagram', url: 'https://instagram.com/grandhotel' }
 *   ]}
 *   navigationLinks={[
 *     { label: 'About Us', href: '/about' },
 *     { label: 'Contact', href: '/contact' }
 *   ]}
 *   copyright="© 2026 Grand Hotel. All rights reserved."
 *   columns={4}
 *   background="muted"
 * />
 * ```
 */
export default function FooterClassic(rawProps: FooterClassicProps) {
  // Validate props against contract
  const props = validateInDev(FooterContract, rawProps, 'FooterClassic');

  const {
    hotelName,
    address,
    phone,
    email,
    socialLinks,
    navigationLinks,
    copyright,
    className,
    columns = 4,
    background = 'muted'
  } = props;

  // Build CVA variant props
  const variantProps = {
    columns: columns as VariantProps<typeof footerClassicCva>['columns']
  };

  // Generate current year for copyright if not provided
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${hotelName}. All rights reserved.`;
  const displayCopyright = copyright || defaultCopyright;

  // Split navigation links into groups (simple split: first half to column 2, second half to column 3)
  const navLinksMidpoint = navigationLinks ? Math.ceil(navigationLinks.length / 2) : 0;
  const navLinksGroup1 = navigationLinks?.slice(0, navLinksMidpoint) || [];
  const navLinksGroup2 = navigationLinks?.slice(navLinksMidpoint) || [];

  return (
    <footer
      className={cn(
        footerClassicCva(variantProps),
        className
      )}
      role="contentinfo"
    >
      {/* Main content - Grid layout with max-width container */}
      <div className="max-w-6xl mx-auto px-container py-section">
        <div className={cn(
          "grid gap-gap-section",
          columns === 3 ? "md:grid-cols-3" : "md:grid-cols-4"
        )}>
          {/* Column 1: Hotel Info */}
          <div className="flex flex-col gap-gap-card">
            <h2 className="text-white text-size-h3 font-semibold tracking-wide">{hotelName}</h2>
            {address && (
              <address className="not-italic text-white/90 text-size-body leading-relaxed">
                {address}
              </address>
            )}
            {(phone || email) && (
              <div className="flex flex-col gap-2 text-size-body">
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="text-white/90 hover:text-brand-secondary transition-colors duration-200"
                  >
                    {phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="text-white/90 hover:text-brand-secondary transition-colors duration-200"
                  >
                    {email}
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Column 2: Navigation Links Group 1 */}
          {navLinksGroup1.length > 0 && (
            <NavigationLinkGroup links={navLinksGroup1} title="Quick Links" />
          )}

          {/* Column 3: Navigation Links Group 2 */}
          {navLinksGroup2.length > 0 && (
            <NavigationLinkGroup links={navLinksGroup2} title="Explore" />
          )}

          {/* Column 4: Social Media Icons */}
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex flex-col gap-gap-card">
              <h3 className="text-brand-secondary text-size-body font-semibold uppercase tracking-wide pb-gap-card/2 border-b border-white/20">
                Follow Us
              </h3>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, index) => (
                  <SocialLink
                    key={index}
                    platform={link.platform}
                    url={link.url}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: Copyright */}
      <div className="border-t border-white/10 py-card px-container">
        <p className="text-center text-sm text-white/70">
          {displayCopyright}
        </p>
      </div>
    </footer>
  );
}
