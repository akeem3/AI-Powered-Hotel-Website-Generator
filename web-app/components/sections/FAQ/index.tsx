/**
 * FAQ Section Server Component - Router Architecture
 *
 * Story 19.3: FAQ Block (2 Structural Variants)
 *
 * This component delegates to structurally distinct sub-components based on
 * variant.layout, following the router pattern established by HeroSection (Story 17.1),
 * About (Story 19.2), and Footer (Story 19.1).
 *
 * LAYOUT DELEGATION:
 * - layout="accordion" (default): Delegates to FAQAccordion (expandable/collapsible
 *   FAQ items with one question visible at a time, client-side interactivity)
 * - layout="grid": Delegates to FAQGrid (all Q&A pairs visible in a two-column
 *   grid layout, server component with no interactivity)
 *
 * BACKWARD COMPATIBILITY:
 * - Unknown layout values fall back to accordion without throwing errors
 * - All existing fixtures and usages continue to work without modification
 *
 * HYBRID ARCHITECTURE:
 * - Router is a Server Component for content rendering (SEO-friendly)
 * - FAQAccordion is a Client Component ('use client' directive for interactivity)
 * - FAQGrid is a Server Component (no interactivity required)
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * The FAQAccordion sub-component will have its own 'use client' directive.
 *
 * @module components/sections/FAQ
 * @see docs/epics/epic-19.diversity_extended-block-library_planning_2026-02-27.md Story 19.3
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { FAQContract, type FAQConfig } from '@/lib/contracts/faq.contract';

import FAQAccordion from './FAQAccordion';
import FAQGrid from './FAQGrid';

/**
 * FAQ component props
 *
 * Matches FAQConfig with all properties.
 */
export interface FAQProps extends FAQConfig {}

/**
 * Resolves the layout value with defaults and validation
 * @param layout - The layout value from variant
 * @returns Resolved layout value (accordion | grid)
 */
function resolveLayout(
  layout?: 'accordion' | 'grid'
): 'accordion' | 'grid' {
  // Default to accordion if no layout specified
  const defaultLayout: 'accordion' | 'grid' = 'accordion';
  const inputLayout = layout ?? defaultLayout;

  // Unknown layout values fall back to accordion
  if (!['accordion', 'grid'].includes(inputLayout)) {
    return defaultLayout;
  }

  // Valid layout, return as-is
  return inputLayout;
}

/**
 * FAQ Server Component (Router)
 *
 * Renders the FAQ section with all content provided as props.
 * Routes to appropriate layout variant based on variant.layout.
 *
 * Data Flow:
 * 1. Parent component passes FAQ props
 * 2. FAQ router validates props using FAQContract
 * 3. Router resolves layout with backward compatibility
 * 4. Layout delegation router switches to appropriate sub-component
 * 5. Sub-component renders with all props passed through
 *
 * @component
 * @example
 * ```tsx
 * // Accordion layout (default, expandable/collapsible)
 * <FAQ
 *   heading="Frequently Asked Questions"
 *   questions={[
 *     { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before check-in.' },
 *     { question: 'Do you offer parking?', answer: 'Yes, we have free on-site parking available.' }
 *   ]}
 *   variant={{ layout: 'accordion' }}
 * />
 *
 * // Grid layout (all questions visible)
 * <FAQ
 *   heading="Frequently Asked Questions"
 *   questions={[
 *     { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before check-in.' },
 *     { question: 'Do you offer parking?', answer: 'Yes, we have free on-site parking available.' }
 *   ]}
 *   variant={{ layout: 'grid' }}
 * />
 * ```
 */
export default function FAQ(rawProps: FAQProps) {
  // Validate props against contract
  const props = validateInDev(FAQContract, rawProps, 'FAQ');

  // Extract variant and layout
  const { variant } = props;
  const layout = variant?.layout;

  // Resolve layout with backward compatibility
  const resolvedLayout = resolveLayout(layout);

  // Build resolved props for sub-components
  // All sub-components accept FAQConfig and handle their own styling
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
    case 'grid':
      return <FAQGrid {...resolvedProps} />;

    case 'accordion':
    default:
      return <FAQAccordion {...resolvedProps} />;
  }
}

// Export sub-components for external use
export { default as FAQAccordion } from './FAQAccordion';
export { default as FAQGrid } from './FAQGrid';

// Export types for external use
export type { FAQAccordionProps } from './FAQAccordion';
export type { FAQGridProps } from './FAQGrid';
