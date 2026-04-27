/**
 * Locale detection and persistence utilities.
 *
 * This module provides functions for:
 * - Detecting locale from multiple sources (URL, localStorage, browser)
 * - Parsing browser language strings
 * - Persisting user locale preference
 *
 * Detection priority order:
 * 1. URL parameter (?lang=es)
 * 2. localStorage preference
 * 3. Browser language (navigator.language)
 * 4. Default locale (en)
 */

import { DEFAULT_LOCALE, isSupportedLocale, LOCALE_STORAGE_KEY, LOCALE_URL_PARAM, type Locale } from './constants';

/**
 * Result of locale detection with metadata about the source.
 */
export interface LocaleDetectionResult {
  /** The detected locale code */
  locale: Locale;
  /** Where this locale was detected from */
  source: 'url' | 'storage' | 'browser' | 'default';
}

/**
 * Extracts locale from URL query parameter.
 *
 * @param url - URL to parse (defaults to current window location)
 * @returns Locale if found and valid, null otherwise
 *
 * @example
 * // URL: https://example.com?lang=es
 * getLocaleFromUrl() // 'es'
 */
export function getLocaleFromUrl(url?: string): Locale | null {
  try {
    const urlString = url ?? (typeof window !== 'undefined' ? window.location.search : '');
    if (!urlString) return null;

    const searchParams = new URLSearchParams(urlString);
    const langParam = searchParams.get(LOCALE_URL_PARAM);

    if (langParam && isSupportedLocale(langParam)) {
      return langParam;
    }

    return null;
  } catch {
    // URL parsing can fail in various environments
    return null;
  }
}

/**
 * Retrieves stored locale preference from localStorage.
 *
 * @returns Stored locale if valid, null otherwise
 *
 * @example
 * setStoredLocale('es')
 * getStoredLocale() // 'es'
 */
export function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isSupportedLocale(stored)) {
      return stored;
    }
    return null;
  } catch {
    // localStorage might be disabled or unavailable
    return null;
  }
}

/**
 * Persists locale preference to localStorage.
 *
 * @param locale - Locale to store
 *
 * @example
 * setStoredLocale('es')
 * localStorage.getItem('hotel-locale') // 'es'
 */
export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Silently fail if localStorage is unavailable
    // This is expected in some environments (private browsing, etc.)
  }
}

/**
 * Clears stored locale preference from localStorage.
 *
 * @example
 * setStoredLocale('es')
 * clearStoredLocale()
 * getStoredLocale() // null
 */
export function clearStoredLocale(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Parses browser language string to extract supported locale.
 *
 * Handles various browser language formats:
 * - "es-ES" → "es"
 * - "en-US" → "en"
 * - "fr" → "fr"
 * - "de-AT" → "de"
 *
 * @param langString - Language string from navigator.language or navigator.languages
 * @returns Parsed locale if supported, null otherwise
 *
 * @example
 * parseNavigatorLanguage('es-ES') // 'es'
 * parseNavigatorLanguage('en-US') // 'en'
 * parseNavigatorLanguage('jp-JP') // null (not supported)
 */
export function parseNavigatorLanguage(langString: string): Locale | null {
  if (!langString) return null;

  // Extract the base language code (before hyphen)
  const baseCode = langString.split('-')[0].toLowerCase();

  if (isSupportedLocale(baseCode)) {
    return baseCode;
  }

  return null;
}

/**
 * Detects locale from browser's navigator.languages array.
 *
 * @returns First supported locale found, or null
 *
 * @example
 * // navigator.languages = ['es-ES', 'en-US']
 * detectLocaleFromBrowser() // 'es'
 */
export function detectLocaleFromBrowser(): Locale | null {
  if (typeof window === 'undefined' || !navigator) return null;

  // Check navigator.languages first (more accurate)
  if (navigator.languages) {
    for (const lang of navigator.languages) {
      const parsed = parseNavigatorLanguage(lang);
      if (parsed) return parsed;
    }
  }

  // Fall back to navigator.language
  if (navigator.language) {
    const parsed = parseNavigatorLanguage(navigator.language);
    if (parsed) return parsed;
  }

  return null;
}

/**
 * Detects the appropriate locale using the full priority chain.
 *
 * Priority order:
 * 1. URL parameter (?lang=es) - highest priority for user control
 * 2. localStorage preference - remembers user's choice
 * 3. Browser language - respects user's system settings
 * 4. Default locale (en) - fallback
 *
 * @returns Detection result with locale and source information
 *
 * @example
 * // URL: ?lang=es
 * detectLocale() // { locale: 'es', source: 'url' }
 *
 * @example
 * // No URL, localStorage has 'fr'
 * detectLocale() // { locale: 'fr', source: 'storage' }
 */
export function detectLocale(): LocaleDetectionResult {
  // 1. Check URL parameter first (allows explicit override)
  const urlLocale = getLocaleFromUrl();
  if (urlLocale) {
    return { locale: urlLocale, source: 'url' };
  }

  // 2. Check localStorage for saved preference
  const storedLocale = getStoredLocale();
  if (storedLocale) {
    return { locale: storedLocale, source: 'storage' };
  }

  // 3. Check browser language settings
  const browserLocale = detectLocaleFromBrowser();
  if (browserLocale) {
    return { locale: browserLocale, source: 'browser' };
  }

  // 4. Fall back to default
  return { locale: DEFAULT_LOCALE, source: 'default' };
}

/**
 * Convenience function that returns just the locale code
 * (without the source metadata).
 *
 * @returns Detected locale code
 *
 * @example
 * getDetectedLocale() // 'es'
 */
export function getDetectedLocale(): Locale {
  return detectLocale().locale;
}

/**
 * Checks if the given locale should use right-to-left (RTL) text direction.
 *
 * Supported RTL locales: Arabic (ar)
 *
 * @param locale - Locale to check
 * @returns true if RTL, false if LTR
 */
export function isLocaleRTL(locale: Locale): boolean {
  return ['ar'].includes(locale);
}

/**
 * Gets the text direction for a locale.
 *
 * @param locale - Locale to check
 * @returns 'rtl' or 'ltr'
 */
export function getLocaleDirection(locale: Locale): 'rtl' | 'ltr' {
  return isLocaleRTL(locale) ? 'rtl' : 'ltr';
}
