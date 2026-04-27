/**
 * HeroContent Server Component
 *
 * Renders the static content of the hero section without any client-side features.
 * This component receives all resolved data as props and renders pure HTML.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * All interactivity (animations) is handled by wrapping in HeroAnimated.client.tsx
 *
 * @module components/sections/HeroSection/HeroContent
 */

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { heroVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';
import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';

/**
 * Resolved hero content props
 *
 * All content is pre-resolved before being passed to this component.
 * No client-side data fetching or resolution happens here.
 */
export interface HeroContentProps {
  /** Hotel name */
  title: string;
  /** Headline/tagline */
  headline: string;
  /** Short tagline (optional) */
  tagline?: string;
  /** Description text (optional) */
  description?: string;
  /** Primary CTA text */
  primaryCTAText: string;
  /** Primary CTA href */
  primaryCTAHref: string;
  /** Primary CTA aria-label */
  primaryCTAariaLabel?: string;
  /** Secondary CTA text */
  secondaryCTAText: string;
  /** Secondary CTA href */
  secondaryCTAHref: string;
  /** Secondary CTA aria-label */
  secondaryCTAariaLabel?: string;
  /** Background image URL */
  image: string;
  /** Image alt text */
  imageAlt: string;
  /** Style variant configuration */
  variant?: HeroSectionContractType['variant'];
  /** Additional className */
  className?: string;
}

/**
 * HeroContent Server Component
 *
 * Renders the hero section with all content provided as props.
 * This component is fully server-renderable and contains no client-side code.
 *
 * @param props - Resolved hero content props
 * @returns JSX element
 *
 * @example
 * ```tsx
 * <HeroContent
 *   title="Hotel Name"
 *   headline="Welcome to Paradise"
 *   tagline="Luxury Resort"
 *   description="Experience world-class amenities"
 *   primaryCTAText="View Rooms"
 *   primaryCTAHref="/rooms"
 *   secondaryCTAText="Contact Us"
 *   secondaryCTAHref="/contact"
 *   image="/images/hero.jpg"
 *   imageAlt="Hotel exterior view"
 *   variant={{ style: 'modern', layout: 'split', overlay: 'gradient', height: 'large' }}
 * />
 * ```
 */
export function HeroContent({
  title,
  headline,
  tagline,
  description,
  primaryCTAText,
  primaryCTAHref,
  primaryCTAariaLabel,
  secondaryCTAText,
  secondaryCTAHref,
  secondaryCTAariaLabel,
  image,
  imageAlt,
  variant,
  className,
}: HeroContentProps) {
  const { layout = 'split', style = 'modern', overlay = 'none', height = 'medium' } = variant || {};

  return (
    <section
      className={cn(heroVariants({ style, layout, overlay, height }), className)}
      data-mode={style}
      aria-labelledby="hero-title"
    >
      <div className="relative w-full h-full rounded-none overflow-hidden">
        {/* Background image */}
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
        />

        {/* Overlay div - applies CVA overlay variant classes */}
        <div
          className={cn(
            "absolute inset-0 z-base",
            overlay === 'light' && "bg-brand-primary/mid",
            overlay === 'dark' && "bg-brand-primary/mid",
            overlay === 'gradient' && "bg-liner-to-t from-brand-primary/high to-transparent",
            overlay === 'none' && "opacity-0"
          )}
          aria-hidden="true"
        />

        {/* Content container with higher z-index */}
        <div className="relative z-elevated max-w-screen-xl mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between h-full py-hero px-container text-center lg:text-left gap-container">

          {/* Text content area */}
          <div className="w-full lg:w-1/2 space-y-gap-card">
            {tagline && (
              <p className="text-size-overline font-semibold uppercase tracking-wider text-brand-secondary">
                {tagline}
              </p>
            )}

            <h2
              id="hero-title"
              className="text-on-brand text-size-body-large font-display"
            >
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
                <Link
                  href={primaryCTAHref}
                  aria-label={primaryCTAariaLabel || primaryCTAText}
                >
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
          </div>

          {/* Right side image asset (only for split layout) */}
          {layout === 'split' && (
            <div className="hidden lg:flex w-full lg:w-1/2 justify-end" aria-hidden="true">
              <div className="relative w-hero-asset-sm sm:w-hero-asset-md lg:w-hero-asset-lg aspect-4/3 rounded-2xl overflow-hidden shadow-card-hover">
                <Image src={image} alt="" fill className="object-cover" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
