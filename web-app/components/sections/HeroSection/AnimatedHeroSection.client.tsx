'use client';

/**
 * AnimatedHeroSection Client Component
 *
 * Full hero section with framer-motion animations enabled.
 * This is a Client Component that provides optional animations.
 *
 * IMPORTANT: This component should only be used when animations are desired.
 * For SEO-optimized static rendering, use HeroCentered/HeroSplit instead.
 *
 * PROPS FORMAT:
 * Accepts HeroSectionContractType format (CTA objects) for consistency
 * with other hero sub-components. CTA objects are transformed internally.
 *
 * @module components/sections/HeroSection/AnimatedHeroSection
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { heroVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';

/**
 * AnimatedHeroSection component props
 *
 * Accepts HeroSectionContractType format for consistency.
 * CTA objects are transformed to flattened format internally.
 */
interface AnimatedHeroSectionProps extends HeroSectionContractType {}

/**
 * AnimatedHeroSection Client Component
 *
 * Renders the hero section with framer-motion animations.
 * Receives contract props and transforms CTA objects internally.
 *
 * @param props - Hero section properties matching HeroSectionContract
 * @returns JSX element with animations
 */
export function AnimatedHeroSection({
  title,
  headline,
  tagline,
  description,
  primaryCTA,
  secondaryCTA,
  image,
  variant,
  className,
}: AnimatedHeroSectionProps) {
  const { layout = 'split', style = 'modern', overlay = 'none', height = 'medium' } = variant || {};

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
      className={cn(heroVariants({ style, layout, overlay, height }), className)}
      data-mode={style}
      aria-labelledby="hero-title"
    >
      <div className="relative w-full h-full rounded-none overflow-hidden">
        {/* Background image */}
        <Image
          src={resolvedImage}
          alt={resolvedAlt}
          fill
          priority
          className="object-cover object-center"
        />

        {/* Overlay div - applies CVA overlay variant classes */}
        <div
          className={cn(
            'absolute inset-0 z-base',
            overlay === 'light' && 'bg-brand-primary/mid',
            overlay === 'dark' && 'bg-brand-primary/mid',
            overlay === 'gradient' && 'bg-liner-to-t from-brand-primary/high to-transparent',
            overlay === 'none' && 'opacity-0',
          )}
          aria-hidden="true"
        />

        {/* Content container with higher z-index */}
        <div className="relative z-elevated max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between h-full py-hero px-container text-center lg:text-left gap-container">
          {/* Animated text content area */}
          <motion.div
            className="w-full lg:w-1/2 space-y-gap-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {tagline && (
              <p className="text-size-overline font-semibold uppercase tracking-wider text-brand-secondary">
                {tagline}
              </p>
            )}

            <h2 id="hero-title" className="text-on-brand text-size-body-large font-display">
              {title}
            </h2>

            <h1 className="text-brand-secondary text-size-display leading-tight font-display">
              {headline}
            </h1>

            {description && (
              <p className="mt-gap-card text-on-brand text-size-body max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                {description}
              </p>
            )}

            <div className="mt-gap-section flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-gap-card">
              <Button
                asChild
                className="hero-cta bg-brand-secondary text-on-brand hover:bg-brand-secondary-hover font-semibold rounded-lg transition-colors border-2 border-transparent"
              >
                <Link href={primaryCTAHref} aria-label={primaryCTAariaLabel || primaryCTAText}>
                  {primaryCTAText}
                </Link>
              </Button>

              <Button
                asChild
                className="hero-cta bg-transparent border-2 border-on-brand text-on-brand hover:bg-brand-secondary-hover hover:text-brand-primary hover:border-transparent font-semibold rounded-lg transition-colors"
              >
                <Link
                  href={secondaryCTAHref}
                  aria-label={secondaryCTAariaLabel || secondaryCTAText}
                >
                  {secondaryCTAText}
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Animated right side image asset (only for split layout) */}
          {layout === 'split' && (
            <motion.div
              className="hidden lg:flex w-full lg:w-1/2 justify-end"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              aria-hidden="true"
            >
              <div className="relative w-hero-asset-sm sm:w-hero-asset-md lg:w-hero-asset-lg aspect-4/3 rounded-2xl overflow-hidden shadow-card-hover">
                <Image src={resolvedImage} alt="" fill className="object-cover" />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
