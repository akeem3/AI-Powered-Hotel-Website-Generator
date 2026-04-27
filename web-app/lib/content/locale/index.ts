/**
 * Locale detection and management.
 *
 * This module provides utilities for:
 * - Detecting user's preferred language (URL, localStorage, browser)
 * - Managing locale state
 * - Validating locale codes
 *
 * @example
 * import { detectLocale, getStoredLocale, setStoredLocale } from '@/lib/content/locale';
 *
 * // Detect user's locale
 * const { locale, source } = detectLocale();
 *
 * // Get/set stored preference
 * const stored = getStoredLocale();
 * setStoredLocale('es');
 */

// Constants
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_NAMES,
  LOCALE_NATIVE_NAMES,
  LOCALE_CODES,
  LOCALE_STORAGE_KEY,
  LOCALE_URL_PARAM,
  isSupportedLocale,
  assertLocale,
} from './constants';

// Types
export type { Locale, LocaleDetectionResult } from './types';

// Detection and persistence
export {
  getLocaleFromUrl,
  getStoredLocale,
  setStoredLocale,
  clearStoredLocale,
  parseNavigatorLanguage,
  detectLocaleFromBrowser,
  detectLocale,
  getDetectedLocale,
  isLocaleRTL,
  getLocaleDirection,
} from './detection';
