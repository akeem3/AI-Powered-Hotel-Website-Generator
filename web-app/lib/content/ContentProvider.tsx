'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { detectLocale, setStoredLocale, type Locale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from './locale';

/**
 * Context value for the content system
 */
export interface ContentContextValue {
  hotelId: string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  availableLocales: readonly Locale[];
  contentBaseUrl: string;
}

/**
 * Props for the ContentProvider
 */
export interface ContentProviderProps {
  hotelId: string;
  defaultLocale?: Locale;
  children: ReactNode;
}

const ContentContext = createContext<ContentContextValue | null>(null);

/**
 * Provider component for the content system.
 * Manages hotel identification and current language state.
 *
 * Locale detection priority:
 * 1. URL parameter (?lang=es)
 * 2. localStorage preference
 * 3. Browser language (navigator.language)
 * 4. Default locale (en)
 */
export function ContentProvider({
  hotelId,
  defaultLocale,
  children,
}: ContentProviderProps) {
  // Initialize locale on mount using detection logic
  const [locale, setLocaleState] = useState<Locale>(() => {
    // If defaultLocale is provided, use it; otherwise detect automatically
    if (defaultLocale && SUPPORTED_LOCALES.includes(defaultLocale)) {
      return defaultLocale;
    }
    return detectLocale().locale;
  });

  // Update localStorage and document when locale changes
  const setLocale = (newLocale: Locale) => {
    setStoredLocale(newLocale);
    setLocaleState(newLocale);
  };

  // Update document lang attribute when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  // Computed values
  const contentBaseUrl = useMemo(() => `/content/${hotelId}`, [hotelId]);

  // Memoize context value to prevent unnecessary re-renders of consumers
  const value = useMemo(
    () => ({
      hotelId,
      locale,
      setLocale,
      availableLocales: SUPPORTED_LOCALES,
      contentBaseUrl,
    }),
    [hotelId, locale, contentBaseUrl]
  );

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
}

/**
 * Hook to access the content context
 *
 * @throws Error if used outside of ContentProvider
 *
 * @example
 * const { locale, setLocale, availableLocales } = useContentContext();
 */
export function useContentContext(): ContentContextValue {
  const context = useContext(ContentContext);

  if (!context) {
    throw new Error('useContentContext must be used within a ContentProvider');
  }

  return context;
}

/**
 * Hook for locale-specific functionality.
 * Provides a convenient API for working with locales.
 *
 * @example
 * const { locale, setLocale, availableLocales } = useLocale();
 */
export function useLocale() {
  const { locale, setLocale, availableLocales } = useContentContext();

  return {
    locale,
    setLocale,
    availableLocales,
    /** Returns the current locale name in its native language */
    localeName: availableLocales.includes(locale as Locale)
      ? ({ en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch' } as Record<Locale, string>)[locale]
      : 'English',
    /** All supported locale codes */
    locales: availableLocales,
    /** Check if a given locale is the current one */
    isCurrentLocale: (checkLocale: Locale) => locale === checkLocale,
    /** Get the text direction for the current locale ('ltr' or 'rtl') */
    direction: 'ltr', // All supported locales are currently LTR
  };
}
