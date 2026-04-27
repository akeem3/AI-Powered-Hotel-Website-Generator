/**
 * HeroMinimal Server Component
 *
 * Typography-focused layout with no full-bleed background image.
 * This is the "minimal" variant of the HeroSection router architecture.
 *
 * STORY 17.4: HeroMinimal Sub-Component Implementation
 * A structurally distinct component from HeroCentered and HeroSplit.
 *
 * LAYOUT CHARACTERISTICS:
 * - No full-bleed background image (typography is the primary visual element)
 * - Large display-scale title using text-size-display semantic token
 * - Optional tagline with small-caps styling above title
 * - Subtle gradient or solid surface background using semantic surface tokens
 * - Single CTA only (primary, secondary CTA intentionally omitted)
 * - Height constrained to small or medium (large/fullscreen fall back to medium)
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * Animation support is handled by the router via AnimatedHeroSection wrapper.
 *
 * PROPS FORMAT:
 * This component extends HeroSectionContractType for consistency with
 * HeroCentered and HeroSplit. CTA objects are transformed internally.
 *
 * @module components/sections/HeroSection/HeroMinimal
 * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.4
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { heroMinimalVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';

/**
 * HeroMinimal component props
 *
 * Extends HeroSectionContractType for consistency with other hero sub-components.
 * All sub-components (HeroCentered, HeroSplit, HeroMinimal) use the same
 * contract format, and each handles its own CTA transformation internally.
 */
export interface HeroMinimalProps extends HeroSectionContractType {
  /** Text alignment within the content area (default: 'left') */
  textAlign?: 'left' | 'center';
}

/**
 * HeroMinimal Server Component
 *
 * Renders a typography-focused hero section with no background image.
 * This component produces a structurally distinct DOM from HeroCentered and HeroSplit.
 *
 * LAYOUT STRUCTURE:
 * ```
 * <section> (root with CVA classes including height variant)
 *   <div> (content container, centered)
 *     <tagline> (optional, small-caps styling)
 *     <title> (h2, secondary text color)
 *     <headline> (h1, text-size-display, primary visual element)
 *     <description> (optional p)
 *     <primary CTA button> (single CTA only, secondary omitted)
 *   </div>
 * </section>
 * ```
 *
 * HEIGHT VARIANTS (via CVA):
 * - small: min-h-hero-sm
 * - medium: min-h-hero-md (default)
 * - large: falls back to medium
 * - fullscreen: falls back to medium
 *
 * BACKGROUND OPTIONS:
 * - solid: bg-surface-primary (default, clean white/neutral background)
 * - gradient: Subtle gradient using semantic surface tokens
 * - image: Not supported for HeroMinimal (ignored, uses solid fallback)
 *
 * TEXT ALIGN VARIANTS:
 * - left: Text aligned left (default)
 * - center: Text centered
 *
 * SINGLE CTA CONSTRAINT:
 * - Only primary CTA is rendered
 * - Secondary CTA is intentionally omitted (design constraint per AC)
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
 * <HeroMinimal
 *   title="Budget Hotel"
 *   headline="Simple Comfort, Great Value"
 *   tagline="Stay Smart"
 *   description="Clean, comfortable rooms at affordable prices"
 *   primaryCTA={{ text: 'Book Now', href: '/booking' }}
 *   background="solid"
 *   variant={{ layout: 'minimal', height: 'small', style: 'minimal' }}
 * />
 * ```
 */
export function HeroMinimal(props: HeroMinimalProps) {
  const {
    title,
    headline,
    tagline,
    description,
    primaryCTA,
    secondaryCTA, // Accepted but intentionally not rendered per AC
    background,
    variant,
    className,
    textAlign = 'left',
  } = props;

  // Destructure variant with defaults
  const { style = 'minimal', height: inputHeight = 'medium' } = variant || {};

  // Resolve height: HeroMinimal only supports 'small' and 'medium'
  // 'large' and 'fullscreen' fall back to 'medium' for HeroMinimal
  const resolvedHeight: 'small' | 'medium' =
    inputHeight === 'small' ? 'small' : 'medium';

  // Determine background classes using semantic surface tokens
  // background='image' is not supported for HeroMinimal, falls back to solid
  const backgroundClasses = cn(
    background === 'gradient'
      ? 'bg-gradient-to-br from-surface-primary to-surface-elevated'
      : 'bg-surface-primary'
  );

  // Transform primary CTA object to individual props (internal transformation)
  const primaryCTAText = primaryCTA?.text ?? 'Book Now';
  const primaryCTAHref = primaryCTA?.href ?? '/booking';
  const primaryCTAariaLabel = primaryCTA?.ariaLabel ?? primaryCTAText;

  return (
    <section
      className={cn(
        heroMinimalVariants({ height: resolvedHeight, textAlign }),
        backgroundClasses,
        className
      )}
      data-mode={style}
      aria-labelledby="hero-title"
    >
      {/* Content container - centered vertically and horizontally */}
      <div className="w-full max-w-screen-xl mx-auto px-container py-hero">
        {/* Text content area - typography-focused layout */}
        <div className="space-y-gap-card max-w-3xl">
          {/* Optional tagline - small caps styling above title */}
          {tagline && (
            <p className="text-size-overline font-semibold uppercase tracking-wider text-brand-secondary">
              {tagline}
            </p>
          )}

          {/* Title - secondary text color for visual hierarchy */}
          <h2
            id="hero-title"
            className="text-text-primary text-size-body-large font-display"
          >
            {title}
          </h2>

          {/* Headline - main hero text with display-scale font size */}
          <h1 className="text-brand-secondary text-size-display leading-tight font-display">
            {headline}
          </h1>

          {/* Optional description - max width for readability */}
          {description && (
            <p className="mt-gap-card text-text-secondary text-size-body leading-relaxed">
              {description}
            </p>
          )}

          {/* Single CTA button - primary only, secondary intentionally omitted */}
          <div className="mt-gap-section">
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
            {/* Secondary CTA intentionally omitted per Story 17.4 AC */}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Export HeroMinimal as default for named imports
 */
export default HeroMinimal;
