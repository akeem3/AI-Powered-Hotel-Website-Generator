/**
 * FooterStacked Component
 *
 * Story 19.1: Footer Block - FooterStacked Sub-Component
 *
 * Full-width stacked footer with optional newsletter signup, navigation links,
 * address block, and copyright section.
 *
 * Layout Structure (full-width vertically stacked sections):
 * - Section 1 (optional): Newsletter signup (heading + input + button)
 * - Section 2: Navigation links in horizontal/wrapped layout
 * - Section 3 (optional): Map placeholder or address block
 * - Section 4: Copyright + social icons row
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/blocks/Footer/FooterStacked
 */

'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { FooterContract, type FooterConfig } from '@/lib/contracts/footer.contract';

// Import Lucide icons for social media
import { Facebook, Instagram, Twitter, MapPin, Globe, Linkedin } from 'lucide-react';

// Import shadcn/ui components for newsletter form
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
    console.warn(`[FooterStacked] Unknown social platform: ${platform}`);
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
 * Footer Stacked CVA Variants
 *
 * Scoped CVA for FooterStacked styling variations.
 * Uses ONLY semantic design tokens.
 */
const footerStackedCva = cva(
  // Base classes - Stacked sections layout - Dark blue background
  "w-full flex flex-col border-t border-white/10 bg-brand-primary text-white",
  {
    variants: {
      newsletter: {
        true: "",
        false: ""
      }
    },
    compoundVariants: [
      // Newsletter section gets slightly lighter background
      {
        newsletter: true,
        class: "[&_.newsletter-section]:bg-white/5"
      }
    ],
    defaultVariants: {
      newsletter: true
    }
  }
);

/**
 * Newsletter Form Component
 *
 * Newsletter signup form with heading, input, and submit button.
 * Uses native form submission for simplicity.
 */
function NewsletterForm() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In a real implementation, this would submit to a newsletter service
    console.log('[FooterStacked] Newsletter signup submitted');
  };

  return (
    <section
      className="newsletter-section py-section-md px-container border-b border-white/10"
      aria-labelledby="newsletter-heading"
    >
      <div className="max-w-2xl mx-auto text-center">
        <h2
          id="newsletter-heading"
          className="text-brand-secondary text-size-h3 font-semibold tracking-wide mb-2"
        >
          Stay Updated
        </h2>
        <p className="text-white/90 mb-gap-card text-size-body leading-relaxed">
          Subscribe to our newsletter for exclusive offers and updates.
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder="Enter your email"
            required
            aria-label="Email address for newsletter"
            className="flex-1"
          />
          <Button
            type="submit"
            aria-label="Subscribe to newsletter"
            className="whitespace-nowrap"
          >
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}

/**
 * FooterStacked Component Props
 *
 * Extends FooterConfig with additional variant options
 */
export interface FooterStackedProps extends FooterConfig {
  /**
   * Include newsletter signup section
   * Default: true
   */
  newsletter?: boolean;

  /**
   * Background theme variant
   * Default: 'surface-primary'
   */
  background?: 'surface-primary' | 'muted' | 'brand-primary' | 'surface-elevated';
}

/**
 * FooterStacked Component
 *
 * Full-width stacked footer with optional newsletter, navigation links,
 * address block, and copyright section.
 *
 * @example
 * ```tsx
 * <FooterStacked
 *   hotelName="Grand Hotel"
 *   address="123 Main St, City, Country"
 *   phone="+1-555-0123"
 *   email="contact@grandhotel.com"
 *   socialLinks={[
 *     { platform: 'facebook', url: 'https://facebook.com/grandhotel' },
 *     { platform: 'instagram', url: 'https://instagram.com/grandhotel' }
 *   ]}
 *   navigationLinks={[
 *     { label: 'Home', href: '/' },
 *     { label: 'About', href: '/about' }
 *   ]}
 *   copyright="© 2026 Grand Hotel. All rights reserved."
 *   newsletter={true}
 *   background="surface-primary"
 * />
 * ```
 */
export default function FooterStacked(rawProps: FooterStackedProps) {
  // Validate props against contract
  const props = validateInDev(FooterContract, rawProps, 'FooterStacked');

  const {
    hotelName,
    address,
    phone,
    email,
    socialLinks,
    navigationLinks,
    copyright,
    className,
    newsletter = true,
    background = 'surface-primary'
  } = props;

  // Build CVA variant props
  const variantProps = {
    newsletter
  };

  // Generate current year for copyright if not provided
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${hotelName}. All rights reserved.`;
  const displayCopyright = copyright || defaultCopyright;

  return (
    <footer
      className={cn(
        footerStackedCva(variantProps),
        className
      )}
      role="contentinfo"
    >
      {/* Section 1: Newsletter Signup (optional) */}
      {newsletter && <NewsletterForm />}

      {/* Section 2: Navigation Links */}
      {navigationLinks && navigationLinks.length > 0 && (
        <section
          className="py-section-md px-container border-b border-white/10"
          aria-labelledby="nav-heading"
        >
          <h2 id="nav-heading" className="sr-only">
            Site Navigation
          </h2>
          <nav
            className={cn(
              "flex flex-wrap justify-center gap-6 md:gap-8",
              "max-w-6xl mx-auto"
            )}
            aria-label="Footer navigation"
          >
            {navigationLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={cn(
                  "text-white/90 hover:text-brand-secondary",
                  "transition-colors duration-200",
                  "text-size-body font-medium leading-relaxed"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </section>
      )}

      {/* Section 3: Address Block (optional) */}
      {(address || phone || email) && (
        <section
          className="py-section-md px-container border-b border-white/10"
          aria-labelledby="contact-heading"
        >
          <h2 id="contact-heading" className="sr-only">
            Contact Information
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
              {/* Hotel Name */}
              <h3 className="text-white text-size-h3 font-semibold tracking-wide">
                {hotelName}
              </h3>

              {/* Address */}
              {address && (
                <address className="not-italic text-white/90 text-size-body leading-relaxed">
                  {address}
                </address>
              )}

              {/* Phone and Email */}
              <div className="flex flex-wrap gap-6 text-size-body">
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
            </div>
          </div>
        </section>
      )}

      {/* Section 4: Copyright + Social Icons */}
      <section
        className="py-card px-container"
        aria-labelledby="copyright-heading"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p
            id="copyright-heading"
            className="text-sm text-white/70"
          >
            {displayCopyright}
          </p>

          {/* Social Media Icons */}
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
        </div>
      </section>
    </footer>
  );
}
