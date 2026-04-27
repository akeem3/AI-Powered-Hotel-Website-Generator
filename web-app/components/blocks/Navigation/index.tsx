'use client';

import { NavigationClassic } from './NavigationClassic';
import { NavigationCompact } from './NavigationCompact';
import { NavigationExtended } from './NavigationExtended';
import { navigationVariants } from '@/lib/cva-variants';
import { NavigationContract, type NavigationConfig } from '@/lib/contracts/navigation.contract';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';

/**
 * Extended props type that includes currentLang (not part of NavigationContract)
 *
 * currentLang is extracted from rawProps before contract validation
 * and passed directly to sub-components for i18n link prefixing
 */
interface NavigationExtendedProps extends NavigationConfig {
  /** Current locale code for link prefixing (e.g., 'en', 'th', 'zh') */
  currentLang?: string;
}

export default function Navigation(rawProps: NavigationConfig) {
  // Extract currentLang from rawProps before validation (not part of contract)
  const { currentLang, ...contractProps } = rawProps as NavigationExtendedProps;

  const props = validateInDev(NavigationContract, contractProps, 'Navigation');
  const { variant, className } = props;

  const layout = variant?.layout ?? 'classic';

  // Backward compatibility: map legacy values to classic
  // Note: 'compact' was a legacy height-only value, now it's a structural layout
  // We can't distinguish legacy 'compact' from new 'compact', so assume new intent
  // Cast layout to string for legacy value comparison (backward compatibility)
  const effectiveLayout =
    (layout as string) === 'default' ? 'classic' :
    (layout as string) === 'tall' ? 'classic' :
    layout;

  // Common props to pass to all sub-components
  const commonProps = {
    ...props,
    currentLang, // Pass currentLang to sub-components for i18n
  };

  // Router: delegate to sub-component based on layout
  switch (effectiveLayout) {
    case 'compact':
      return <NavigationCompact {...commonProps} className={className} />;
    case 'extended':
      return <NavigationExtended {...commonProps} className={className} />;
    case 'classic':
    default:
      return <NavigationClassic {...commonProps} className={className} />;
  }
}

// Export sub-components for testing and direct use
export { NavigationClassic } from './NavigationClassic';
export { NavigationCompact } from './NavigationCompact';
export { NavigationExtended } from './NavigationExtended';
