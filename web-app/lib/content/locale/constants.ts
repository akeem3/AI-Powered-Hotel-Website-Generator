/**
 * Locale constants for the content localization system.
 *
 * These constants define the supported languages, their display names,
 * and configuration for the entire locale system.
 */

/**
 * All supported locale codes for the application.
 *
 * This array can be extended with additional language codes as needed.
 * The locale system is designed to be dynamic - languages are determined
 * from the actual CMS content, not limited to this hardcoded list.
 *
 * Common ISO 639-1 codes:
 * - en: English
 * - es: Spanish
 * - fr: French
 * - de: German
 * - th: Thai
 * - ja: Japanese
 * - ar: Arabic
 * - tr: Turkish
 * - ru: Russian
 * - zh: Chinese
 * - ko: Korean
 * - vi: Vietnamese
 * - pt: Portuguese
 * - it: Italian
 * - nl: Dutch
 * - pl: Polish
 * - uk: Ukrainian
 */
export const SUPPORTED_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'th',
  'ja',
  'ar',
  'tr',  // Turkish
  'ru',  // Russian
  'zh',  // Chinese
  'ko',  // Korean
  'vi',  // Vietnamese
  'pt',  // Portuguese
  'it',  // Italian
  'nl',  // Dutch
  'pl',  // Polish
  'uk',  // Ukrainian
] as const;

/**
 * Locale type derived from SUPPORTED_LOCALES.
 * Use this type for any function accepting locale codes.
 *
 * Note: This type represents known/declared locales. For dynamic locale
 * handling (e.g., languages from CMS), use `string` type instead.
 */
export type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * Default locale to use when no locale is detected or requested.
 */
export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Human-readable display names for each supported locale.
 * Used in UI components like the LanguageSelector.
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  th: 'Thai',
  ja: 'Japanese',
  ar: 'Arabic',
  tr: 'Turkish',
  ru: 'Russian',
  zh: 'Chinese',
  ko: 'Korean',
  vi: 'Vietnamese',
  pt: 'Portuguese',
  it: 'Italian',
  nl: 'Dutch',
  pl: 'Polish',
  uk: 'Ukrainian',
};

/**
 * Native language names (in the language itself).
 * Useful for displaying the language to native speakers.
 */
export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  th: 'ภาษาไทย',
  ja: '日本語',
  ar: 'العربية',
  tr: 'Türkçe',
  ru: 'Русский',
  zh: '中文',
  ko: '한국어',
  vi: 'Tiếng Việt',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  uk: 'Українська',
};

/**
 * ISO 639-1 language codes with region mappings.
 * Used for parsing browser language strings.
 */
export const LOCALE_CODES: Record<Locale, { iso639_1: string; regions: string[] }> = {
  en: { iso639_1: 'en', regions: ['US', 'GB', 'CA', 'AU', 'NZ'] },
  es: { iso639_1: 'es', regions: ['ES', 'MX', 'AR', 'CO', 'PE'] },
  fr: { iso639_1: 'fr', regions: ['FR', 'CA', 'BE', 'CH', 'LU'] },
  de: { iso639_1: 'de', regions: ['DE', 'AT', 'CH', 'LU', 'BE'] },
  th: { iso639_1: 'th', regions: ['TH'] },
  ja: { iso639_1: 'ja', regions: ['JP'] },
  ar: { iso639_1: 'ar', regions: ['SA', 'AE', 'EG', 'QA', 'KW', 'JO', 'LB', 'OM', 'BH', 'DZ', 'MA', 'TN', 'YE', 'SY', 'IQ', 'LY', 'SD', 'PS'] },
  tr: { iso639_1: 'tr', regions: ['TR'] },
  ru: { iso639_1: 'ru', regions: ['RU', 'BY', 'KZ', 'KG', 'UZ'] },
  zh: { iso639_1: 'zh', regions: ['CN', 'TW', 'HK', 'SG'] },
  ko: { iso639_1: 'ko', regions: ['KR', 'KP'] },
  vi: { iso639_1: 'vi', regions: ['VN'] },
  pt: { iso639_1: 'pt', regions: ['BR', 'PT'] },
  it: { iso639_1: 'it', regions: ['IT', 'CH', 'SM'] },
  nl: { iso639_1: 'nl', regions: ['NL', 'BE'] },
  pl: { iso639_1: 'pl', regions: ['PL'] },
  uk: { iso639_1: 'uk', regions: ['UA'] },
};

/**
 * localStorage key for persisting user's locale preference.
 */
export const LOCALE_STORAGE_KEY = 'hotel-locale';

/**
 * URL query parameter name for locale selection.
 * Example: ?lang=es
 */
export const LOCALE_URL_PARAM = 'lang';

/**
 * Validates if a string is a supported locale code.
 *
 * @param code - The string to validate
 * @returns True if the code is a supported locale
 *
 * @example
 * isSupportedLocale('en') // true
 * isSupportedLocale('jp') // false
 * isSupportedLocale('en-US') // false
 */
export function isSupportedLocale(code: string): code is Locale {
  return SUPPORTED_LOCALES.includes(code as Locale);
}

/**
 * Asserts that a value is a valid locale.
 * Throws a TypeError if validation fails.
 *
 * @param code - The value to validate
 * @throws TypeError if code is not a supported locale
 *
 * @example
 * assertLocale('en') // OK
 * assertLocale('jp') // throws TypeError
 */
export function assertLocale(code: string): asserts code is Locale {
  if (!isSupportedLocale(code)) {
    throw new TypeError(
      `Invalid locale "${code}". Must be one of: ${SUPPORTED_LOCALES.join(', ')}`
    );
  }
}
