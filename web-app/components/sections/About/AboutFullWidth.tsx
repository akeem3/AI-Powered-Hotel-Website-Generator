/**
 * AboutFullWidth Component
 *
 * Story 19.2: About Block - AboutFullWidth Sub-Component
 *
 * Full-width background image with text overlay (secondary hero style).
 * Similar structure to HeroCentered but for about content.
 * Overlay uses configurable opacity for text readability.
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/sections/About/AboutFullWidth
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { AboutContract, type AboutConfig } from '@/lib/contracts/about.contract';
import { aboutFullWidthVariants } from '@/lib/cva-variants';
import Image from 'next/image';

/**
 * AboutFullWidth Component Props
 *
 * Extends AboutConfig for type safety.
 */
export interface AboutFullWidthProps extends AboutConfig {}

/**
 * Highlight Card Component (Full-Width variant)
 *
 * Renders a highlight/stat as a compact card for the overlay.
 */
function HighlightCardOverlay({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <dt className="text-sm font-medium text-text-inverted/80 uppercase tracking-wide">{label}</dt>
      <dd className="text-xl font-bold text-on-brand mt-1">{value}</dd>
    </div>
  );
}

/**
 * AboutFullWidth Component
 *
 * Full-width background image with text overlay.
 *
 * @example
 * ```tsx
 * <AboutFullWidth
 *   heading="Welcome to Paradise"
 *   content="Experience luxury like never before..."
 *   image="/images/about-hero.jpg"
 *   variant={{ overlay: 'gradient' }}
 *   highlights={[
 *     { label: 'Founded', value: '1892' },
 *     { label: 'Awards', value: '15+' }
 *   ]}
 * />
 * ```
 */
export default function AboutFullWidth(rawProps: AboutFullWidthProps) {
  // Validate props against contract
  const props = validateInDev(AboutContract, rawProps, 'AboutFullWidth');

  const {
    heading,
    content,
    image,
    highlights,
    className,
    variant
  } = props;

  // Destructure variant with defaults
  const { overlay = 'gradient', layout } = variant || {};

  // Resolve image with fallback
  const resolvedImage = image || '/images/hotel-img.jpg';
  const resolvedAlt = heading || 'About our hotel';

  // Build CVA variant props
  const variantProps = {
    overlay: overlay as VariantProps<typeof aboutFullWidthVariants>['overlay'],
    textAlign: 'center' as VariantProps<typeof aboutFullWidthVariants>['textAlign']
  };

  // Split content into paragraphs (by double newlines)
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <section
      className={cn(aboutFullWidthVariants(variantProps), className)}
      aria-labelledby="about-heading"
    >
      <div className="relative w-full h-full min-h-hero-lg rounded-none overflow-hidden">
        {/* Background Image - Full-bleed using Next.js Image fill */}
        <Image
          src={resolvedImage}
          alt={resolvedAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Overlay div - applies overlay classes for contrast (following HeroCentered pattern) */}
        <div
          className={cn(
            'absolute inset-0 z-base',
            overlay === 'light' && 'bg-brand-primary/soft',
            overlay === 'dark' && 'bg-brand-primary/mid',
            overlay === 'gradient' && 'bg-gradient-to-t from-brand-primary/high to-transparent',
            overlay === 'none' && 'opacity-0'
          )}
          aria-hidden="true"
        />

        {/* Content container with higher z-index for visibility above overlay */}
        <div className="relative z-elevated max-w-4xl mx-auto flex items-center justify-center h-full py-hero px-container text-center">
          {/* Text content area - centered with spacing */}
          <div className="w-full space-y-gap-card">
            {/* Heading */}
            <h2
              id="about-heading"
              className="text-on-brand text-size-h2 font-display leading-tight"
            >
              {heading}
            </h2>

            {/* Content Paragraphs */}
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-on-brand text-size-body max-w-2xl mx-auto leading-relaxed">
                {paragraph}
              </p>
            ))}

            {/* Highlights as stat cards in overlay */}
            {highlights && highlights.length > 0 && (
              <div className="flex flex-wrap justify-center gap-gap-card mt-gap-section">
                {highlights.map((highlight, index) => (
                  <HighlightCardOverlay
                    key={index}
                    label={highlight.label}
                    value={highlight.value}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
