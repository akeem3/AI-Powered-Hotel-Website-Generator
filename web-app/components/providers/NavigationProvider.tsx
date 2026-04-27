'use client';

import { createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { NavigationConfig } from '@/lib/contracts/navigation.contract';

/**
 * Navigation Provider Context Value
 *
 * Contains the navigation variant configuration, detected locale, and preview mode.
 * The locale is auto-detected from the URL pathname when not explicitly provided.
 */
interface NavigationContextValue {
  /** Navigation variant configuration (style, layout) */
  variant: NavigationConfig['variant'];
  /** Detected or provided locale code (e.g., 'en', 'th', 'zh') */
  currentLang?: string;
  /** Whether the current route is in preview mode (/preview) */
  isPreview?: boolean;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

/**
 * NavigationProvider Props
 *
 * @param variant - Navigation variant configuration (style, layout)
 * @param currentLang - Explicit locale code (optional, auto-detected from URL if not provided)
 * @param children - Child components to receive navigation context
 */
export interface NavigationProviderProps {
  variant?: NavigationConfig['variant'];
  currentLang?: string;
  children: React.ReactNode;
}

/**
 * Navigation Provider Component
 *
 * Provides navigation configuration, locale detection, and preview mode to child components.
 *
 * URL Detection Logic (preserved from Navbar.tsx):
 * - Extracts 2-letter locale code from pathname first segment
 * - Example: /en/rooms → detectedLang = 'en'
 * - Example: /th/hotels/xyz → detectedLang = 'th'
 * - Example: /rooms → detectedLang = undefined
 * - Example: /preview → isPreview = true
 *
 * @example
 * ```tsx
 * // With explicit locale
 * <NavigationProvider variant={{ style: 'solid', layout: 'classic' }} currentLang="en">
 *   <Navigation />
 * </NavigationProvider>
 *
 * // With auto-detection from URL
 * <NavigationProvider variant={{ style: 'solid', layout: 'classic' }}>
 *   <Navigation />
 * </NavigationProvider>
 * ```
 */
export function NavigationProvider({
  variant = { style: 'solid', layout: 'classic' },
  currentLang: currentLangProp,
  children,
}: NavigationProviderProps) {
  const pathname = usePathname();

  // Auto-detect lang from pathname if not explicitly provided
  // This preserves the exact detection logic from the original Navbar.tsx component
  const detectedLang = currentLangProp || (() => {
    const segments = pathname.split('/');
    // Check if first segment is a supported locale (2-letter code)
    if (segments.length > 1 && segments[1] && /^[a-z]{2}$/.test(segments[1])) {
      return segments[1];
    }
    return undefined;
  })();

  // Detect preview mode - pathname starts with /preview
  const isPreview = pathname?.startsWith('/preview') || false;

  const value: NavigationContextValue = {
    variant,
    currentLang: detectedLang,
    isPreview,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Hook to access navigation configuration context
 *
 * @returns Navigation context value with variant, currentLang, and isPreview
 *
 * @example
 * ```tsx
 * const { variant, currentLang, isPreview } = useNavigationConfig();
 * ```
 */
export function useNavigationConfig(): NavigationContextValue {
  const context = useContext(NavigationContext);

  // Provide sensible defaults when used outside of a NavigationProvider
  // This allows for backwards compatibility and testing without the provider
  if (!context) {
    return {
      variant: { style: 'solid', layout: 'classic' },
      currentLang: undefined,
      isPreview: false,
    };
  }

  return context;
}
