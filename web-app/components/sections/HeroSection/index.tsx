/**
 * HeroSection Server Component - Router Architecture
 *
 * Story 17.1: Hero Router Refactor - This component now delegates to structurally
 * distinct sub-components based on variant.layout, following the router pattern
 * established by RoomCard and ImageGallery.
 *
 * LAYOUT DELEGATION:
 * - layout="centered" (default): Delegates to HeroCentered (full-bleed background image with centered text)
 * - layout="split": Delegates to HeroSplit (CSS Grid two-column layout with text + image columns)
 * - layout="minimal": Delegates to HeroMinimal (typography-focused design, no full-bleed image)
 *
 * BACKWARD COMPATIBILITY:
 * - Legacy layout="fullscreen" values are automatically converted to layout="centered" + height="fullscreen"
 * - Unknown layout values fall back to centered without throwing errors
 * - All existing fixtures and usages continue to work without modification
 *
 * HYBRID ARCHITECTURE:
 * - Server Component for content rendering (SEO-friendly, no client-side JavaScript)
 * - Optional Client Component wrapper for animations (enableAnimations prop)
 * - All data fetching happens server-side via parent components
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 *
 * @module components/sections/HeroSection
 * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.1
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { HeroSectionContract, type HeroSectionContractType } from '@/lib/contracts/hero.contract';
import { HeroContent } from './HeroContent';
import { HeroCentered } from './HeroCentered';
import { HeroSplit } from './HeroSplit';
import { HeroMinimal } from './HeroMinimal';
import { AnimatedHeroSection } from './AnimatedHeroSection.client';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';

/**
 * HeroSection component props
 *
 * Extends the base contract with additional configuration options.
 */
/**
 * HeroSection component props
 *
 * Matches HeroSectionContract with all properties including animation options.
 */
export interface HeroSectionProps {
  /** Hero title */
  title?: string;
  /** Hero headline/tagline */
  headline?: string;
  /** Hero tagline */
  tagline?: string;
  /** Hero description */
  description?: string;
  /** Primary CTA */
  primaryCTA?: {
    text?: string;
    href?: string;
    ariaLabel?: string;
  };
  /** Secondary CTA */
  secondaryCTA?: {
    text?: string;
    href?: string;
    ariaLabel?: string;
  };
  /** Hero background image */
  image?: string;
  /** Background style */
  background?: 'solid' | 'gradient' | 'image';
  /** Hero variant */
  variant?: {
    style?: 'bold' | 'modern' | 'classic' | 'minimal' | 'elegant';
    layout?: 'split' | 'centered' | 'minimal';
    overlay?: 'none' | 'light' | 'dark' | 'gradient';
    height?: 'small' | 'medium' | 'large' | 'fullscreen';
  };
  /** Enable framer-motion animations (default: false for SEO) */
  enableAnimations?: boolean;
  /** Animation delay in seconds */
  animationDelay?: number;
  /** Additional className */
  className?: string;
  /** Content integration properties (Story 11.4 - pending full implementation) */
  hotelId?: string;
  enableContent?: boolean;
}

/**
 * HeroSection Server Component
 *
 * Renders the hero section with all content provided as props.
 * Animations are optional and handled by a separate Client Component.
 *
 * Data Flow:
 * 1. Parent Server Component (page.tsx) fetches data via getHotelPageData()
 * 2. Data is passed as props to HeroSection
 * 3. HeroSection resolves defaults and routes to appropriate layout variant
 * 4. Static version: Server Component only (HeroCentered/HeroSplit/HeroMinimal)
 * 5. Animated version: Client Component (AnimatedHeroSection for centered/split)
 *
 * @component
 * @example
 * ```tsx
 * // Server Component usage (recommended for SEO)
 * <HeroSection
 *   title="Hotel Name"
 *   headline="Welcome to Paradise"
 *   primaryCTAText="View Rooms"
 *   primaryCTAHref="/rooms"
 *   secondaryCTAText="Contact Us"
 *   secondaryCTAHref="/contact"
 *   image="/images/hero.jpg"
 *   variant={{ layout: 'centered', height: 'fullscreen' }}
 *   enableAnimations={false}  // Keep false for SEO
 * />
 * ```
 */

/**
 * Resolves the layout value with backward compatibility for legacy 'fullscreen'
 * @param layout - The layout value from variant
 * @param height - The height value from variant
 * @returns Object containing resolved layout and height
 */
function resolveLayoutWithBackwardCompatibility(
  layout?: 'centered' | 'split' | 'minimal' | 'fullscreen',
  height?: 'small' | 'medium' | 'large' | 'fullscreen'
): { resolvedLayout: 'centered' | 'split' | 'minimal'; resolvedHeight: 'small' | 'medium' | 'large' | 'fullscreen' } {
  // Default to centered if no layout specified
  const defaultLayout: 'centered' | 'split' | 'minimal' = 'centered';
  const inputLayout = layout ?? defaultLayout;

  // Legacy fallback: fullscreen layout → centered layout + fullscreen height
  if (inputLayout === 'fullscreen') {
    return {
      resolvedLayout: defaultLayout,
      resolvedHeight: 'fullscreen'
    };
  }

  // Unknown layout values fall back to centered
  if (!['centered', 'split', 'minimal'].includes(inputLayout)) {
    return {
      resolvedLayout: defaultLayout,
      resolvedHeight: height ?? 'medium'
    };
  }

  // Valid layout, return as-is with height fallback
  return {
    resolvedLayout: inputLayout,
    resolvedHeight: height ?? 'medium'
  };
}

export default function HeroSection(rawProps: HeroSectionProps) {
  // Validate props against contract
  const props = validateInDev(HeroSectionContract, rawProps, 'HeroSection');

  // Destructure with defaults
  const {
    title,
    tagline,
    headline,
    description,
    primaryCTA,
    secondaryCTA,
    image,
    background,
    variant,
    className,
    enableAnimations = false, // Default to false for SEO
    animationDelay = 0,
  } = props;

  // Resolve layout with backward compatibility for legacy 'fullscreen' value
  const { resolvedLayout, resolvedHeight } = resolveLayoutWithBackwardCompatibility(
    variant?.layout,
    variant?.height
  );

  // Build resolved variant object with corrected layout and height
  const resolvedVariant = {
    ...variant,
    layout: resolvedLayout,
    height: resolvedHeight
  };

  // Resolve text content with defaults
  const resolvedTitle = title ?? CONTENT_DEFAULTS.hero.title;
  const resolvedHeadline = headline ?? CONTENT_DEFAULTS.hero.headline;

  // Build contract props for sub-components
  // All sub-components (HeroCentered, HeroSplit, HeroMinimal) accept HeroSectionContractType
  // and handle their own CTA transformation internally
  const contractProps = {
    title: resolvedTitle,
    headline: resolvedHeadline,
    tagline,
    description,
    primaryCTA,
    secondaryCTA,
    image,
    background,
    variant: resolvedVariant,
    className,
    enableAnimations,
    animationDelay
  };

  // Layout delegation router
  // Routes to appropriate sub-component based on resolved layout
  switch (resolvedLayout) {
    case 'split':
      // HeroSplit supports animations (will use animated wrapper if enabled)
      return enableAnimations
        ? <AnimatedHeroSection {...contractProps} />
        : <HeroSplit {...contractProps} />;

    case 'minimal':
      // HeroMinimal does NOT support animations (typography-focused, no motion)
      return <HeroMinimal {...contractProps} />;

    case 'centered':
    default:
      // HeroCentered supports animations (will use animated wrapper if enabled)
      return enableAnimations
        ? <AnimatedHeroSection {...contractProps} />
        : <HeroCentered {...contractProps} />;
  }
}

// Export types for external use

// Export sub-components for external use
export { HeroContent } from './HeroContent';
export { HeroCentered } from './HeroCentered';
export { HeroSplit } from './HeroSplit';
export { HeroMinimal } from './HeroMinimal';
export { AnimatedHeroSection } from './AnimatedHeroSection.client';
