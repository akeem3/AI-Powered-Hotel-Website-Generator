/**
 * AboutSideBySide Component
 *
 * Story 19.2: About Block - AboutSideBySide Sub-Component
 *
 * Two-column layout with image + text side by side.
 * Image column uses object-cover, rounded corners, optional shadow.
 * Text column contains heading, content, and highlights as stat cards.
 * imagePosition prop controls which column gets the image.
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/sections/About/AboutSideBySide
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { AboutContract, type AboutConfig } from '@/lib/contracts/about.contract';
import { aboutSideBySideVariants } from '@/lib/cva-variants';
import Image from 'next/image';

/**
 * AboutSideBySide Component Props
 *
 * Extends AboutConfig for type safety.
 */
export interface AboutSideBySideProps extends AboutConfig {}

/**
 * Highlight Card Component
 *
 * Renders a single highlight/stat as a card with label and value.
 */
function HighlightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center p-card bg-surface-elevated rounded-lg border border-border-default">
      <dt className="text-sm font-medium text-text-secondary uppercase tracking-wide">{label}</dt>
      <dd className="text-2xl font-bold text-brand-primary mt-1">{value}</dd>
    </div>
  );
}

/**
 * AboutSideBySide Component
 *
 * Two-column layout with image + text side by side.
 *
 * @example
 * ```tsx
 * <AboutSideBySide
 *   heading="Our Story"
 *   content="Founded in 1892, our hotel has been welcoming guests..."
 *   image="/images/about-hotel.jpg"
 *   imagePosition="right"
 *   highlights={[
 *     { label: 'Founded', value: '1892' },
 *     { label: 'Rooms', value: '45' }
 *   ]}
 * />
 * ```
 */
export default function AboutSideBySide(rawProps: AboutSideBySideProps) {
  // Validate props against contract
  const props = validateInDev(AboutContract, rawProps, 'AboutSideBySide');

  const {
    heading,
    content,
    image,
    highlights,
    className,
    variant
  } = props;

  // Destructure variant with defaults
  const { imagePosition = 'right' } = variant || {};

  // Resolve image with fallback
  const resolvedImage = image || '/images/hotel-img.jpg';
  const resolvedAlt = heading || 'About our hotel';

  // Build CVA variant props
  const variantProps = {
    imagePosition: imagePosition as VariantProps<typeof aboutSideBySideVariants>['imagePosition'],
    textAlign: 'left' as VariantProps<typeof aboutSideBySideVariants>['textAlign']
  };

  // Split content into paragraphs (by double newlines)
  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <section
      className={cn('w-full grid md:grid-cols-2 gap-hero items-center', className)}
      aria-labelledby="about-heading"
    >
      {/* Image Column */}
      {image && (
        <div className="image-column order-1 md:order-2 relative h-full min-h-[300px] md:min-h-0">
          <Image
            src={resolvedImage}
            alt={resolvedAlt}
            fill
            className="object-cover rounded-xl shadow-lg"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}

      {/* Text Column */}
      <div className="text-column order-2 md:order-1 bg-surface-primary p-container md:p-hero flex flex-col justify-center">
        <div className="space-y-gap-card max-w-3xl">
          {/* Gold Bar Header - Section heading pattern matching other sections */}
          <div>
            {/* Gold Accent Bar */}
            <div className="flex items-center justify-center mb-gap-card">
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
              <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            </div>

            <h2
              id="about-heading"
              className="mb-gap-card font-display text-size-h2 text-brand-primary leading-tight text-center md:text-left"
            >
              {heading}
            </h2>

            {/* Gold Underline Accent - aligned left for split layout */}
            <div className="w-divider-lg h-divider-accent bg-brand-secondary mr-0 mb-gap-card"></div>
          </div>

          {/* Content Paragraphs */}
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-text-secondary text-size-body leading-relaxed">
              {paragraph}
            </p>
          ))}

          {/* Highlights as stat cards */}
          {highlights && highlights.length > 0 && (
            <div className="flex flex-wrap gap-gap-card mt-gap-section">
              {highlights.map((highlight, index) => (
                <HighlightCard
                  key={index}
                  label={highlight.label}
                  value={highlight.value}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
