/**
 * HeroCentered Server Component
 *
 * Full-bleed background image with centered text overlay layout.
 * This is the "centered" variant of the HeroSection router architecture.
 *
 * STORY 17.2: HeroCentered Sub-Component Implementation
 * Extracted from HeroContent.tsx as a structurally distinct component.
 *
 * LAYOUT CHARACTERISTICS:
 * - Full-bleed background image covers the entire section width/height
 * - Overlay div (optional) provides contrast for text readability
 * - Content is centered horizontally and vertically over the image
 * - No split layout - this is the classic centered hero design
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * Animation support is handled by the router via AnimatedHeroSection wrapper.
 *
 * PROPS FORMAT:
 * This component extends HeroSectionContractType for consistency with
 * HeroSplit and HeroMinimal. CTA objects are transformed internally.
 *
 * @module components/sections/HeroSection/HeroCentered
 * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.2
 */

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { heroVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';

/**
 * HeroCentered component props
 *
 * Extends HeroSectionContractType for consistency with other hero sub-components.
 * All sub-components (HeroCentered, HeroSplit, HeroMinimal) use the same
 * contract format, and each handles its own CTA transformation internally.
 *
 * @interface HeroCenteredProps
 */
export interface HeroCenteredProps extends HeroSectionContractType {}

/**
 * HeroCentered Server Component
 *
 * Renders a full-bleed background image hero with centered text overlay.
 * This component produces a structurally distinct DOM from HeroSplit and HeroMinimal.
 *
 * LAYOUT STRUCTURE:
 * ```
 * <section> (root with CVA classes including height variant)
 *   <div> (relative wrapper for image + overlay)
 *     <Image fill /> (background image)
 *     <div> (overlay with opacity based on variant.overlay)
 *     <div> (content container with z-elevated, centered)
 *       <tagline> (optional)
 *       <title> (h2)
 *       <headline> (h1)
 *       <description> (optional p)
 *       <CTA buttons> (primary + secondary)
 * ```
 *
 * HEIGHT VARIANTS (via CVA):
 * - small: min-h-hero-sm
 * - medium: min-h-hero-md (default)
 * - large: min-h-hero-lg
 * - fullscreen: min-h-screen
 *
 * OVERLAY VARIANTS (via CVA):
 * - none: No overlay (opacity-0)
 * - light: bg-brand-primary/mid (50% opacity)
 * - dark: bg-brand-primary/mid (50% opacity)
 * - gradient: bg-gradient-to-t from-brand-primary/high to-transparent
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
 * <HeroCentered
 *   title="Grand Luxury Hotel"
 *   headline="Experience Elegance"
 *   tagline="Luxury Resort"
 *   description="World-class amenities await"
 *   primaryCTA={{ text: 'Book Now', href: '/booking' }}
 *   secondaryCTA={{ text: 'Contact Us', href: '/contact' }}
 *   image="/images/hero.jpg"
 *   variant={{ style: 'modern', layout: 'centered', overlay: 'gradient', height: 'fullscreen' }}
 * />
 * ```
 */
export function HeroCentered(props: HeroCenteredProps) {
  const {
    title,
    headline,
    tagline,
    description,
    primaryCTA,
    secondaryCTA,
    image,
    variant,
    className,
  } = props;

  // Destructure variant with defaults - only centered layout values are used
  const { style = 'modern', overlay = 'none', height = 'medium' } = variant || {};

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
      className={cn(heroVariants({ style, layout: 'centered', overlay, height }), className)}
      data-mode={style}
      aria-labelledby="hero-title"
    >
      <div className="relative w-full h-full rounded-none overflow-hidden">
        {/* Background Image - Full-bleed using Next.js Image fill */}
        <Image
          src={resolvedImage}
          alt={resolvedAlt}
          fill
          priority
          className="object-cover object-center"
        />

        {/* Overlay div - applies CVA overlay variant classes for contrast */}
        <div
          className={cn(
            'absolute inset-0 z-base',
            overlay === 'light' && 'bg-brand-primary/mid',
            overlay === 'dark' && 'bg-brand-primary/mid',
            overlay === 'gradient' && 'bg-gradient-to-t from-brand-primary/high to-transparent',
            overlay === 'none' && 'opacity-0',
          )}
          aria-hidden="true"
        />

        {/* Content container with higher z-index for visibility above overlay */}
        <div className="relative z-elevated max-w-screen-xl mx-auto flex items-center justify-center h-full py-hero px-container text-center">
          {/* Text content area - centered with spacing */}
          <div className="w-full space-y-gap-card">
            {/* Optional tagline - small caps styling */}
            {tagline && (
              <p className="text-size-overline font-semibold uppercase tracking-wider text-brand-secondary">
                {tagline}
              </p>
            )}

            {/* Title - secondary text color for brand accent */}
            <h2 id="hero-title" className="text-on-brand text-size-body-large font-display">
              {title}
            </h2>

            {/* Headline - main hero text with brand secondary color */}
            <h1 className="text-brand-secondary text-size-display leading-tight font-display">
              {headline}
            </h1>

            {/* Optional description - max width for readability */}
            {description && (
              <p className="mt-gap-card text-on-brand text-size-body max-w-2xl mx-auto leading-relaxed">
                {description}
              </p>
            )}

            {/* CTA buttons - stacked on mobile, side-by-side on larger screens */}
            <div className="mt-gap-section flex flex-col sm:flex-row justify-center gap-gap-card">
              {/* Primary CTA - filled button with brand secondary */}
              <Button
                asChild
                className="hero-cta bg-brand-secondary text-on-brand hover:bg-brand-secondary-hover hover:text-brand-primary font-semibold rounded-lg transition-colors border-2 border-transparent"
              >
                <Link href={primaryCTAHref} aria-label={primaryCTAariaLabel}>
                  {primaryCTAText}
                </Link>
              </Button>

              {/* Secondary CTA - outline button with on-brand text */}
              {secondaryCTAText && secondaryCTAHref && (
                <Button
                  asChild
                  className="hero-cta bg-transparent border-2 border-on-brand text-on-brand hover:bg-brand-secondary-hover hover:text-brand-primary hover:border-transparent font-semibold rounded-lg transition-colors"
                >
                  <Link href={secondaryCTAHref} aria-label={secondaryCTAariaLabel}>
                    {secondaryCTAText}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Export HeroCentered as default for named imports
 */
export default HeroCentered;
