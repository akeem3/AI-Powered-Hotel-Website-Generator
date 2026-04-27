/**
 * FooterMinimal Component
 *
 * Story 19.1: Footer Block - FooterMinimal Sub-Component
 *
 * Minimal single-row footer with copyright text and social icons only.
 * No navigation links, no address, no contact info.
 *
 * Layout Structure:
 * - Left: Copyright text
 * - Right: Social media icon row
 * - Single-row flexbox layout (centered on mobile)
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/blocks/Footer/FooterMinimal
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
    console.warn(`[FooterMinimal] Unknown social platform: ${platform}`);
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
 * Footer Minimal CVA Variants
 *
 * Scoped CVA for FooterMinimal styling variations.
 * Uses ONLY semantic design tokens.
 */
const footerMinimalCva = cva(
  // Base classes - Single-row flexbox with border top - Dark blue background
  "w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-brand-primary text-white",
  {
    variants: {
      align: {
        left: "sm:justify-start px-container",
        center: "sm:justify-center text-center px-container"
      }
    },
    defaultVariants: {
      align: "left"
    }
  }
);

/**
 * FooterMinimal Component Props
 *
 * Extends FooterConfig with additional variant options
 */
export interface FooterMinimalProps extends FooterConfig {
  /**
   * Horizontal alignment
   * Default: 'left'
   */
  align?: 'left' | 'center';

  /**
   * Background theme variant
   * Default: 'surface-primary'
   */
  background?: 'surface-primary' | 'muted' | 'brand-primary' | 'surface-elevated';
}

/**
 * FooterMinimal Component
 *
 * Minimal single-row footer with copyright and social icons only.
 *
 * @example
 * ```tsx
 * <FooterMinimal
 *   hotelName="Grand Hotel"
 *   socialLinks={[
 *     { platform: 'facebook', url: 'https://facebook.com/grandhotel' },
 *     { platform: 'instagram', url: 'https://instagram.com/grandhotel' }
 *   ]}
 *   copyright="© 2026 Grand Hotel. All rights reserved."
 *   align="left"
 *   background="surface-primary"
 * />
 * ```
 */
export default function FooterMinimal(rawProps: FooterMinimalProps) {
  // Validate props against contract
  const props = validateInDev(FooterContract, rawProps, 'FooterMinimal');

  const {
    hotelName,
    socialLinks,
    copyright,
    className,
    align = 'left',
    background = 'surface-primary'
  } = props;

  // Build CVA variant props
  const variantProps = {
    align: align as VariantProps<typeof footerMinimalCva>['align']
  };

  // Generate current year for copyright if not provided
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${hotelName}. All rights reserved.`;
  const displayCopyright = copyright || defaultCopyright;

  return (
    <footer
      className={cn(
        footerMinimalCva(variantProps),
        "py-card",
        className
      )}
      role="contentinfo"
    >
      {/* Left: Copyright text */}
      <p className="text-sm text-white/70">
        {displayCopyright}
      </p>

      {/* Right: Social media icons */}
      {socialLinks && socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {socialLinks.map((link, index) => (
            <SocialLink
              key={index}
              platform={link.platform}
              url={link.url}
            />
          ))}
        </div>
      )}
    </footer>
  );
}
