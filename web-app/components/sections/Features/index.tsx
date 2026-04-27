/**
 * Features Section Server Component - Router Architecture
 *
 * Story 19.4: Features / USP Block (2 Structural Variants)
 *
 * This component delegates to structurally distinct sub-components based on
 * variant.layout, following the router pattern established by HeroSection (Story 17.1),
 * About (Story 19.2), and FAQ (Story 19.3).
 *
 * LAYOUT DELEGATION:
 * - layout="icon-grid" (default): Delegates to FeaturesIconGrid (compact icon-based
 *   grid with configurable columns)
 * - layout="cards": Delegates to FeaturesCards (larger cards with optional images)
 *
 * BACKWARD COMPATIBILITY:
 * - Unknown layout values fall back to icon-grid without throwing errors
 * - All existing fixtures and usages continue to work without modification
 *
 * HYBRID ARCHITECTURE:
 * - Router is a Server Component for content rendering (SEO-friendly)
 * - Both FeaturesIconGrid and FeaturesCards are Server Components (no interactivity required)
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 *
 * @module components/sections/Features
 * @see docs/epics/epic-19.diversity_extended-block-library_planning_2026-02-27.md Story 19.4
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { FeaturesContract, type FeaturesConfig } from '@/lib/contracts/features.contract';

import FeaturesIconGrid from './FeaturesIconGrid';
import FeaturesCards from './FeaturesCards';

/**
 * Features component props
 *
 * Matches FeaturesConfig with all properties.
 */
export interface FeaturesProps extends FeaturesConfig {}

/**
 * Resolves the layout value with defaults and validation
 * @param layout - The layout value from variant
 * @returns Resolved layout value (icon-grid | cards)
 */
function resolveLayout(
  layout?: 'icon-grid' | 'cards'
): 'icon-grid' | 'cards' {
  // Default to icon-grid if no layout specified
  const defaultLayout: 'icon-grid' | 'cards' = 'icon-grid';
  const inputLayout = layout ?? defaultLayout;

  // Unknown layout values fall back to icon-grid
  if (!['icon-grid', 'cards'].includes(inputLayout)) {
    return defaultLayout;
  }

  // Valid layout, return as-is
  return inputLayout;
}

/**
 * Features Server Component (Router)
 *
 * Renders the Features section with all content provided as props.
 * Routes to appropriate layout variant based on variant.layout.
 *
 * Data Flow:
 * 1. Parent component passes Features props
 * 2. Features router validates props using FeaturesContract
 * 3. Router resolves layout with backward compatibility
 * 4. Layout delegation router switches to appropriate sub-component
 * 5. Sub-component renders with all props passed through
 *
 * @component
 * @example
 * ```tsx
 * // Icon grid layout (default, compact icon-based)
 * <Features
 *   heading="Why Choose Us"
 *   features={[
 *     { title: 'Free WiFi', description: 'High-speed internet throughout', icon: 'Wifi' },
 *     { title: 'Pool & Spa', description: 'Heated pool and luxury spa', icon: 'Waves' }
 *   ]}
 *   variant={{ layout: 'icon-grid', columns: 3 }}
 * />
 *
 * // Cards layout (larger cards with images)
 * <Features
 *   heading="Our Amenities"
 *   features={[
 *     { title: 'Infinity Pool', description: 'Stunning views from our pool', image: '/pool.jpg' },
 *     { title: 'Fine Dining', description: 'Award-winning restaurant', image: '/dining.jpg' }
 *   ]}
 *   variant={{ layout: 'cards', columns: 2 }}
 * />
 * ```
 */
export default function Features(rawProps: FeaturesProps) {
  // Validate props against contract
  const props = validateInDev(FeaturesContract, rawProps, 'Features');

  // Extract variant and layout
  const { variant } = props;
  const layout = variant?.layout;

  // Resolve layout with backward compatibility
  const resolvedLayout = resolveLayout(layout);

  // Build resolved props for sub-components
  // All sub-components accept FeaturesConfig and handle their own styling
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
    case 'cards':
      return <FeaturesCards {...resolvedProps} />;

    case 'icon-grid':
    default:
      return <FeaturesIconGrid {...resolvedProps} />;
  }
}

// Export sub-components for external use
export { default as FeaturesIconGrid } from './FeaturesIconGrid';
export { default as FeaturesCards } from './FeaturesCards';

// Export types for external use
export type { FeaturesIconGridProps } from './FeaturesIconGrid';
export type { FeaturesCardsProps } from './FeaturesCards';
