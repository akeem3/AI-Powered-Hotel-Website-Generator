/**
 * About Section Server Component - Router Architecture
 *
 * Story 19.2: About / Hotel Story Block (3 Structural Variants)
 *
 * This component delegates to structurally distinct sub-components based on
 * variant.layout, following the router pattern established by HeroSection (Story 17.1)
 * and Footer (Story 19.1).
 *
 * LAYOUT DELEGATION:
 * - layout="side-by-side" (default): Delegates to AboutSideBySide (two-column layout
 *   with image + text side by side, imagePosition controls column order)
 * - layout="timeline": Delegates to AboutTimeline (vertical timeline with hotel
 *   history milestones, alternating left/right entries)
 * - layout="full-width": Delegates to AboutFullWidth (full-width background image
 *   with text overlay, secondary hero style)
 *
 * BACKWARD COMPATIBILITY:
 * - Unknown layout values fall back to side-by-side without throwing errors
 * - All existing fixtures and usages continue to work without modification
 *
 * HYBRID ARCHITECTURE:
 * - Server Component for content rendering (SEO-friendly, no client-side JavaScript)
 * - All 3 sub-components (AboutSideBySide, AboutTimeline, AboutFullWidth) are server components
 * - No client-side interactivity required for About section
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 *
 * @module components/sections/About
 * @see docs/epics/epic-19.diversity_extended-block-library_planning_2026-02-27.md Story 19.2
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { AboutContract, type AboutConfig } from '@/lib/contracts/about.contract';

import AboutSideBySide from './AboutSideBySide';
import AboutTimeline from './AboutTimeline';
import AboutFullWidth from './AboutFullWidth';

/**
 * About component props
 *
 * Matches AboutConfig with all properties.
 */
export interface AboutProps extends AboutConfig {}

/**
 * Resolves the layout value with defaults and validation
 * @param layout - The layout value from variant
 * @returns Resolved layout value (side-by-side | timeline | full-width)
 */
function resolveLayout(
  layout?: 'side-by-side' | 'timeline' | 'full-width'
): 'side-by-side' | 'timeline' | 'full-width' {
  // Default to side-by-side if no layout specified
  const defaultLayout: 'side-by-side' | 'timeline' | 'full-width' = 'side-by-side';
  const inputLayout = layout ?? defaultLayout;

  // Unknown layout values fall back to side-by-side
  if (!['side-by-side', 'timeline', 'full-width'].includes(inputLayout)) {
    return defaultLayout;
  }

  // Valid layout, return as-is
  return inputLayout;
}

/**
 * About Server Component (Router)
 *
 * Renders the about section with all content provided as props.
 * Routes to appropriate layout variant based on variant.layout.
 *
 * Data Flow:
 * 1. Parent component passes About props
 * 2. About router validates props using AboutContract
 * 3. Router resolves layout with backward compatibility
 * 4. Layout delegation router switches to appropriate sub-component
 * 5. Sub-component renders with all props passed through
 *
 * @component
 * @example
 * ```tsx
 * // Side-by-side layout (default, two-column)
 * <About
 *   heading="Our Story"
 *   content="Founded in 1892, our hotel has been welcoming guests..."
 *   image="/images/about-hotel.jpg"
 *   variant={{ layout: 'side-by-side', imagePosition: 'right' }}
 *   highlights={[
 *     { label: 'Founded', value: '1892' },
 *     { label: 'Rooms', value: '45' }
 *   ]}
 * />
 *
 * // Timeline layout (vertical timeline)
 * <About
 *   heading="Our History"
 *   content="Over 130 years of hospitality excellence..."
 *   variant={{ layout: 'timeline' }}
 *   highlights={[
 *     { label: '1892', value: 'Hotel founded by John Sterling' },
 *     { label: '1950', value: 'Major renovation and expansion' }
 *   ]}
 * />
 *
 * // Full-width layout (secondary hero style)
 * <About
 *   heading="Welcome to Paradise"
 *   content="Experience luxury like never before..."
 *   image="/images/about-hero.jpg"
 *   variant={{ layout: 'full-width', overlay: 'gradient' }}
 *   highlights={[
 *     { label: 'Founded', value: '1892' },
 *     { label: 'Awards', value: '15+' }
 *   ]}
 * />
 * ```
 */
export default function About(rawProps: AboutProps) {
  // Validate props against contract
  const props = validateInDev(AboutContract, rawProps, 'About');

  // Extract variant and layout
  const { variant } = props;
  const layout = variant?.layout;

  // Resolve layout with backward compatibility
  const resolvedLayout = resolveLayout(layout);

  // Build resolved props for sub-components
  // All sub-components accept AboutConfig and handle their own styling
  const resolvedProps = {
    ...props,
    variant: {
      ...variant,
      layout: resolvedLayout
    }
  };

  // Layout delegation router
  // Routes to appropriate sub-component based on resolved layout
  switch (resolvedLayout) {
    case 'timeline':
      return <AboutTimeline {...resolvedProps} />;

    case 'full-width':
      return <AboutFullWidth {...resolvedProps} />;

    case 'side-by-side':
    default:
      return <AboutSideBySide {...resolvedProps} />;
  }
}

// Export sub-components for external use
export { default as AboutSideBySide } from './AboutSideBySide';
export { default as AboutTimeline } from './AboutTimeline';
export { default as AboutFullWidth } from './AboutFullWidth';

// Export types for external use
// Note: AboutProps is already exported as an interface above (line 45)
export type { AboutSideBySideProps } from './AboutSideBySide';
export type { AboutTimelineProps } from './AboutTimeline';
export type { AboutFullWidthProps } from './AboutFullWidth';
