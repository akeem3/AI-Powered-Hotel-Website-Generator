/**
 * Footer Block Server Component - Router Architecture
 *
 * Story 19.1: Footer Block Router - This component delegates to structurally
 * distinct sub-components based on variant.layout, following the router pattern
 * established by HeroSection (Story 17.1) and ImageGallery.
 *
 * LAYOUT DELEGATION:
 * - layout="classic" (default): Delegates to FooterClassic (multi-column layout
 *   with link columns, contact info, social icons, and copyright bar)
 * - layout="minimal": Delegates to FooterMinimal (single-row layout with
 *   copyright + social icons only)
 * - layout="stacked": Delegates to FooterStacked (full-width vertically stacked
 *   sections with optional newsletter, navigation, address, and copyright)
 *
 * BACKWARD COMPATIBILITY:
 * - Unknown layout values fall back to classic without throwing errors
 * - All existing fixtures and usages continue to work without modification
 *
 * HYBRID ARCHITECTURE:
 * - Server Component for content rendering (SEO-friendly, no client-side JavaScript)
 * - FooterMinimal and FooterClassic are server components
 * - FooterStacked is a client component ('use client') due to interactive newsletter form
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 *
 * @module components/blocks/Footer
 * @see docs/epics/epic-19.diversity_extended-block-library_planning_2026-02-27.md Story 19.1
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { FooterContract, type FooterConfig } from '@/lib/contracts/footer.contract';

import FooterClassic from './FooterClassic';
import FooterMinimal from './FooterMinimal';
import FooterStacked from './FooterStacked';

/**
 * Footer component props
 *
 * Matches FooterContract with all properties.
 */
export interface FooterProps extends FooterConfig {}

/**
 * Resolves the layout value with defaults and validation
 * @param layout - The layout value from variant
 * @returns Resolved layout value (classic | minimal | stacked)
 */
function resolveLayout(
  layout?: 'classic' | 'minimal' | 'stacked'
): 'classic' | 'minimal' | 'stacked' {
  // Default to classic if no layout specified
  const defaultLayout: 'classic' | 'minimal' | 'stacked' = 'classic';
  const inputLayout = layout ?? defaultLayout;

  // Unknown layout values fall back to classic
  if (!['classic', 'minimal', 'stacked'].includes(inputLayout)) {
    return defaultLayout;
  }

  // Valid layout, return as-is
  return inputLayout;
}

/**
 * Footer Server Component (Router)
 *
 * Renders the footer with all content provided as props.
 * Routes to appropriate layout variant based on variant.layout.
 *
 * Data Flow:
 * 1. Parent component passes Footer props
 * 2. Footer router validates props using FooterContract
 * 3. Router resolves layout with backward compatibility
 * 4. Layout delegation router switches to appropriate sub-component
 * 5. Sub-component renders with all props passed through
 *
 * @component
 * @example
 * ```tsx
 * // Classic layout (default, multi-column)
 * <Footer
 *   hotelName="Grand Hotel"
 *   address="123 Main St"
 *   phone="+1-555-0123"
 *   email="contact@grandhotel.com"
 *   variant={{ layout: 'classic' }}
 *   socialLinks={[{ platform: 'facebook', url: 'https://facebook.com/grandhotel' }]}
 *   navigationLinks={[{ label: 'About', href: '/about' }]}
 * />
 *
 * // Minimal layout (single row)
 * <Footer
 *   hotelName="Grand Hotel"
 *   variant={{ layout: 'minimal' }}
 *   socialLinks={[{ platform: 'instagram', url: 'https://instagram.com/grandhotel' }]}
 * />
 *
 * // Stacked layout (full-width stacked sections)
 * <Footer
 *   hotelName="Grand Hotel"
 *   variant={{ layout: 'stacked' }}
 *   newsletter={true}
 *   navigationLinks={[{ label: 'Home', href: '/' }]}
 * />
 * ```
 */
export default function Footer(rawProps: FooterProps) {
  // Validate props against contract
  const props = validateInDev(FooterContract, rawProps, 'Footer');

  // Extract variant and layout
  const { variant } = props;
  const layout = variant?.layout;

  // Resolve layout with backward compatibility
  const resolvedLayout = resolveLayout(layout);

  // Build resolved props for sub-components
  // All sub-components accept FooterConfig and handle their own styling
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
    case 'minimal':
      return <FooterMinimal {...resolvedProps} />;

    case 'stacked':
      return <FooterStacked {...resolvedProps} />;

    case 'classic':
    default:
      return <FooterClassic {...resolvedProps} />;
  }
}

// Export sub-components for external use
export { default as FooterClassic } from './FooterClassic';
export { default as FooterMinimal } from './FooterMinimal';
export { default as FooterStacked } from './FooterStacked';

// Export types for external use
// Note: FooterProps is already exported as an interface above (line 43)
export type { FooterClassicProps } from './FooterClassic';
export type { FooterMinimalProps } from './FooterMinimal';
export type { FooterStackedProps } from './FooterStacked';
