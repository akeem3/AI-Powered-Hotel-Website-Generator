/**
 * HeroSplit Server Component
 *
 * CSS Grid two-column layout with text column and image column side-by-side.
 * This is the "split" variant of the HeroSection router architecture.
 *
 * STORY 17.3: HeroSplit Sub-Component Implementation
 * A structurally distinct component from HeroCentered and HeroMinimal.
 *
 * LAYOUT CHARACTERISTICS:
 * - Desktop: CSS Grid with 2 equal columns (text + image)
 * - Text column: Solid background (no image bleed-through)
 * - Image column: Full-height image with object-cover, no text overlay
 * - Mobile: Single column with image stacked above text
 * - No absolute positioning or full-bleed background image at section root
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * Animation support is handled by the router via AnimatedHeroSection wrapper.
 *
 * PROPS FORMAT:
 * This component extends HeroSectionContractType for consistency with
 * HeroCentered and HeroMinimal. CTA objects are transformed internally.
 *
 * @module components/sections/HeroSection/HeroSplit
 * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.3
 */

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { heroSplitVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';

/**
 * Extended props type for HeroSplit with split-specific options
 *
 * Extends HeroSectionContractType with imagePosition for column control.
 */
export interface HeroSplitProps extends HeroSectionContractType {
  /** Position of the image column (default: 'right') */
  imagePosition?: 'left' | 'right';
  /** Text alignment within the text column (default: 'left') */
  textAlign?: 'left' | 'center';
}

/**
 * HeroSplit Server Component
 *
 * Renders a two-column CSS Grid layout with text and image columns.
 * This component produces a structurally distinct DOM from HeroCentered.
 *
 * LAYOUT STRUCTURE (Desktop - md breakpoint and above):
 * ```
 * <section> (root with CSS Grid classes)
 *   <div class="text-column"> (solid background, contains text content)
 *     <tagline> (optional)
 *     <title> (h2)
 *     <headline> (h1)
 *     <description> (optional p)
 *     <CTA buttons> (primary + secondary)
 *   </div>
 *   <div class="image-column"> (relative wrapper for full-height image)
 *     <Image fill class="object-cover" />
 *   </div>
 * </section>
 * ```
 *
 * LAYOUT STRUCTURE (Mobile - below md breakpoint):
 * ```
 * <section> (single column stack)
 *   <div class="image-column"> (stacked first, order controlled by imagePosition)
 *     <Image fill />
 *   </div>
 *   <div class="text-column"> (stacked second)
 *     ...text content...
 *   </div>
 * </section>
 * ```
 *
 * HEIGHT VARIANTS (via CVA):
 * - medium: min-h-hero-md (default)
 * - large: min-h-hero-lg
 *
 * IMAGE POSITION VARIANTS:
 * - right: Text on left, image on right (default)
 * - left: Image on left, text on right (via order utilities)
 *
 * TEXT ALIGN VARIANTS:
 * - left: Text aligned left within text column (default)
 * - center: Text centered within text column
 *
 * ANIMATION SUPPORT:
 * When enableAnimations=true, the router wraps this component in AnimatedHeroSection
 * which adds framer-motion animations. This component remains a Server Component.
 *
 * @param props - Hero section properties matching HeroSectionContract
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <HeroSplit
 *   title="Business Hotel"
 *   headline="Your Home Away From Home"
 *   tagline="Executive Stay"
 *   description="Modern amenities for business travelers"
 *   primaryCTA={{ text: 'Book Now', href: '/booking' }}
 *   secondaryCTA={{ text: 'Learn More', href: '/about' }}
 *   image="/images/business-hotel.jpg"
 *   imagePosition="right"
 *   textAlign="left"
 *   variant={{ layout: 'split', height: 'large', style: 'modern' }}
 * />
 * ```
 */
export function HeroSplit(props: HeroSplitProps) {
  const {
    title,
    headline,
    tagline,
    description,
    primaryCTA,
    secondaryCTA,
    image,
    background,
    variant,
    className,
    imagePosition = 'right',
    textAlign = 'left',
  } = props;

  // Destructure variant with defaults
  const { style = 'modern', height: inputHeight = 'medium' } = variant || {};

  // Resolve height: HeroSplit only supports 'medium' and 'large'
  // 'small' and 'fullscreen' fall back to 'medium' for HeroSplit
  const resolvedHeight: 'medium' | 'large' =
    inputHeight === 'large' ? 'large' : 'medium';

  // Transform CTA objects to individual props (internal transformation)
  const primaryCTAText = primaryCTA?.text ?? 'View Rooms';
  const primaryCTAHref = primaryCTA?.href ?? '/rooms';
  const primaryCTAariaLabel = primaryCTA?.ariaLabel ?? primaryCTAText;

  const secondaryCTAText = secondaryCTA?.text ?? 'Contact Us';
  const secondaryCTAHref = secondaryCTA?.href ?? '/contact';
  const secondaryCTAariaLabel = secondaryCTA?.ariaLabel ?? secondaryCTAText;

  // Resolve image with fallback
  const resolvedImage = image ?? '/images/hotel-img.jpg';
  const resolvedAlt = tagline ?? 'Hotel exterior';

  return (
    <section
      className={cn(heroSplitVariants({ imagePosition, textAlign, height: resolvedHeight }), className)}
      data-mode={style}
      aria-labelledby="hero-title"
    >
      {/* Text Column - solid background, contains all text content and CTAs */}
      <div className="text-column order-2 md:order-1 bg-surface-primary p-container md:p-hero flex flex-col justify-center">
        {/* Text content area */}
        <div className="space-y-gap-card max-w-prose">
          {/* Optional tagline - small caps styling */}
          {tagline && (
            <p className="text-size-overline font-semibold uppercase tracking-wider text-brand-secondary">
              {tagline}
            </p>
          )}

          {/* Title - secondary text color for brand accent */}
          <h2
            id="hero-title"
            className="text-text-primary text-size-body-large font-display"
          >
            {title}
          </h2>

          {/* Headline - main hero text with brand secondary color */}
          <h1 className="text-brand-secondary text-size-display leading-tight font-display">
            {headline}
          </h1>

          {/* Optional description - max width for readability */}
          {description && (
            <p className="mt-gap-card text-text-secondary text-size-body leading-relaxed">
              {description}
            </p>
          )}

          {/* CTA buttons - stacked on mobile, side-by-side on larger screens */}
          <div className="mt-gap-section flex flex-col sm:flex-row gap-gap-card">
            {/* Primary CTA - filled button with brand secondary */}
            <Button
              asChild
              className="hero-cta bg-brand-secondary text-on-brand hover:bg-brand-secondary-hover hover:text-brand-primary font-semibold rounded-lg transition-colors border-2 border-transparent"
            >
              <Link
                href={primaryCTAHref}
                aria-label={primaryCTAariaLabel}
              >
                {primaryCTAText}
              </Link>
            </Button>

            {/* Secondary CTA - outline button with text-primary */}
            {secondaryCTAText && secondaryCTAHref && (
              <Button
                asChild
                className="hero-cta bg-transparent border-2 border-text-primary text-text-primary hover:bg-brand-secondary-hover hover:text-brand-primary hover:border-transparent font-semibold rounded-lg transition-colors"
              >
                <Link
                  href={secondaryCTAHref}
                  aria-label={secondaryCTAariaLabel}
                >
                  {secondaryCTAText}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Image Column - full-height image with object-cover, no text overlay */}
      <div className="image-column order-1 md:order-2 relative h-full min-h-hero-md md:min-h-0">
        <Image
          src={resolvedImage}
          alt={resolvedAlt}
          fill
          priority
          className="object-cover"
        />
      </div>
    </section>
  );
}

/**
 * Export HeroSplit as default for named imports
 */
export default HeroSplit;
