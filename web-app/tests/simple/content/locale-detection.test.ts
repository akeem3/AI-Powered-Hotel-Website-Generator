/**
 * Unit tests for locale detection utilities.
 */

import * as localeModule from '@/lib/content/locale';
import type { Locale } from '@/lib/content/locale';

// Mock store for localStorage
let store: Record<string, string> = {};

// Store original values for restoration
let originalLocalStorage: Storage | undefined;
let originalLocation: Location | undefined;

describe('Locale Detection', () => {
  beforeAll(() => {
    // Store original localStorage and location
    originalLocalStorage = window.localStorage;
    originalLocation = window.location;
  });

  beforeEach(() => {
    // Reset store
    store = {};

    // Mock localStorage
    const mockLocalStorage = {
      getItem: (key: string): string | null => store[key] ?? null,
      setItem: (key: string, value: string): void => {
        store[key] = value.toString();
      },
      removeItem: (key: string): void => {
        delete store[key];
      },
      clear: (): void => {
        store = {};
      },
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    // Mock window.location with full Location interface
    delete (window as any).location;
    (window as any).location = { search: '', href: 'http://localhost:3000' };
  });

  afterEach(() => {
    // Reset store
    store = {};

    // Restore original location
    delete (window as any).location;
    (window as any).location = originalLocation;
  });

  afterAll(() => {
    // Restore original localStorage
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('getLocaleFromUrl', () => {
    it('should extract locale from URL parameter', () => {
      expect(localeModule.getLocaleFromUrl(`?${localeModule.LOCALE_URL_PARAM}=es`)).toBe('es');
    });

    it('should return null for unsupported locale in URL', () => {
      expect(localeModule.getLocaleFromUrl(`?${localeModule.LOCALE_URL_PARAM}=jp`)).toBeNull();
    });

    it('should return null when no URL parameter present', () => {
      expect(localeModule.getLocaleFromUrl('')).toBeNull();
    });

    it('should handle URL with multiple parameters', () => {
      expect(localeModule.getLocaleFromUrl(`?foo=bar&${localeModule.LOCALE_URL_PARAM}=fr&baz=qux`)).toBe('fr');
    });

    it('should accept custom URL string', () => {
      expect(localeModule.getLocaleFromUrl(`?${localeModule.LOCALE_URL_PARAM}=de`)).toBe('de');
    });

    it('should handle invalid URL gracefully', () => {
      expect(localeModule.getLocaleFromUrl('not-a-url')).toBeNull();
    });
  });

  describe('getStoredLocale', () => {
    it('should return null when nothing is stored', () => {
      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should return stored locale', () => {
      store[localeModule.LOCALE_STORAGE_KEY] = 'es';
      expect(localeModule.getStoredLocale()).toBe('es');
    });

    it('should return null for invalid stored locale', () => {
      store[localeModule.LOCALE_STORAGE_KEY] = 'jp';
      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should return null when localStorage throws', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => {
            throw new Error('localStorage disabled');
          }),
        },
        writable: true,
        configurable: true,
      });
      expect(localeModule.getStoredLocale()).toBeNull();
    });
  });

  describe('setStoredLocale', () => {
    it('should store locale in localStorage', () => {
      localeModule.setStoredLocale('es');
      expect(store[localeModule.LOCALE_STORAGE_KEY]).toBe('es');
    });

    it('should store different locales', () => {
      localeModule.setStoredLocale('fr');
      expect(store[localeModule.LOCALE_STORAGE_KEY]).toBe('fr');

      localeModule.setStoredLocale('de');
      expect(store[localeModule.LOCALE_STORAGE_KEY]).toBe('de');
    });

    it('should not throw when localStorage is disabled', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          setItem: jest.fn(() => {
            throw new Error('localStorage disabled');
          }),
        },
        writable: true,
        configurable: true,
      });
      expect(() => localeModule.setStoredLocale('es')).not.toThrow();
    });
  });

  describe('clearStoredLocale', () => {
    it('should remove stored locale', () => {
      localeModule.setStoredLocale('es');
      expect(localeModule.getStoredLocale()).toBe('es');

      localeModule.clearStoredLocale();
      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should not throw when localStorage is disabled', () => {
      Object.defineProperty(window, 'localStorage', {
        value: {
          removeItem: jest.fn(() => {
            throw new Error('localStorage disabled');
          }),
        },
        writable: true,
        configurable: true,
      });
      expect(() => localeModule.clearStoredLocale()).not.toThrow();
    });
  });

  describe('parseNavigatorLanguage', () => {
    it('should parse language with region code', () => {
      expect(localeModule.parseNavigatorLanguage('es-ES')).toBe('es');
      expect(localeModule.parseNavigatorLanguage('en-US')).toBe('en');
      expect(localeModule.parseNavigatorLanguage('fr-FR')).toBe('fr');
      expect(localeModule.parseNavigatorLanguage('de-DE')).toBe('de');
    });

    it('should parse language without region code', () => {
      expect(localeModule.parseNavigatorLanguage('es')).toBe('es');
      expect(localeModule.parseNavigatorLanguage('en')).toBe('en');
    });

    it('should return null for unsupported languages', () => {
      expect(localeModule.parseNavigatorLanguage('jp-JP')).toBeNull();
      expect(localeModule.parseNavigatorLanguage('xx-XX')).toBeNull(); // 'xx' is not a supported locale
    });

    it('should handle lowercase input', () => {
      expect(localeModule.parseNavigatorLanguage('es-es')).toBe('es');
    });

    it('should handle uppercase input', () => {
      expect(localeModule.parseNavigatorLanguage('ES-ES')).toBe('es');
    });

    it('should return null for empty string', () => {
      expect(localeModule.parseNavigatorLanguage('')).toBeNull();
    });

    it('should handle multiple hyphens', () => {
      expect(localeModule.parseNavigatorLanguage('es-ES-latn')).toBe('es');
    });
  });

  describe('detectLocaleFromBrowser', () => {
    it('should detect from navigator.languages array', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          languages: ['es-ES', 'en-US'],
          language: 'en-US',
        },
        writable: true,
        configurable: true,
      });

      expect(localeModule.detectLocaleFromBrowser()).toBe('es');
    });

    it('should detect from navigator.language as fallback', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          languages: [],
          language: 'fr-FR',
        },
        writable: true,
        configurable: true,
      });

      expect(localeModule.detectLocaleFromBrowser()).toBe('fr');
    });

    it('should return null for unsupported browser language', () => {
      Object.defineProperty(window, 'navigator', {
        value: {
          languages: ['jp-JP'],
          language: 'jp-JP',
        },
        writable: true,
        configurable: true,
      });

      expect(localeModule.detectLocaleFromBrowser()).toBeNull();
    });

    it('should return null when navigator is undefined', () => {
      Object.defineProperty(window, 'navigator', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(localeModule.detectLocaleFromBrowser()).toBeNull();
    });
  });

  describe('detectLocale', () => {
    it('should prioritize localStorage over browser', () => {
      localeModule.setStoredLocale('de');
      Object.defineProperty(window, 'navigator', {
        value: { language: 'es-ES' },
        writable: true,
        configurable: true,
      });

      const result = localeModule.detectLocale();
      expect(result.locale).toBe('de');
      expect(result.source).toBe('storage');
    });

    it('should use browser language when no stored preference', () => {
      localeModule.clearStoredLocale();
      Object.defineProperty(window, 'navigator', {
        value: { language: 'fr-FR' },
        writable: true,
        configurable: true,
      });

      const result = localeModule.detectLocale();
      expect(result.locale).toBe('fr');
      expect(result.source).toBe('browser');
    });

    it('should fall back to default when no source matches', () => {
      localeModule.clearStoredLocale();
      Object.defineProperty(window, 'navigator', {
        value: { language: 'jp-JP' },
        writable: true,
        configurable: true,
      });

      const result = localeModule.detectLocale();
      expect(result.locale).toBe(localeModule.DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('should include correct source in result', () => {
      // Storage source
      localeModule.setStoredLocale('fr');
      Object.defineProperty(window, 'navigator', {
        value: { language: 'es-ES' },
        writable: true,
        configurable: true,
      });
      expect(localeModule.detectLocale().source).toBe('storage');

      // Browser source
      localeModule.clearStoredLocale();
      Object.defineProperty(window, 'navigator', {
        value: { language: 'de-DE' },
        writable: true,
        configurable: true,
      });
      expect(localeModule.detectLocale().source).toBe('browser');

      // Default source
      Object.defineProperty(window, 'navigator', {
        value: { language: 'jp-JP' },
        writable: true,
        configurable: true,
      });
      expect(localeModule.detectLocale().source).toBe('default');
    });
  });

  describe('getDetectedLocale', () => {
    it('should return just the locale code', () => {
      localeModule.setStoredLocale('es');

      const result = localeModule.getDetectedLocale();
      expect(result).toBe('es');
      expect(typeof result).toBe('string');
    });

    it('should fall back to default when no preference', () => {
      localeModule.clearStoredLocale();
      Object.defineProperty(window, 'navigator', {
        value: { language: 'jp-JP' },
        writable: true,
        configurable: true,
      });

      const result = localeModule.getDetectedLocale();
      expect(result).toMatch(/^(en|es|fr|de)$/);
    });
  });

  describe('isLocaleRTL', () => {
    it('should return false for all supported locales', () => {
      expect(localeModule.isLocaleRTL('en')).toBe(false);
      expect(localeModule.isLocaleRTL('es')).toBe(false);
      expect(localeModule.isLocaleRTL('fr')).toBe(false);
      expect(localeModule.isLocaleRTL('de')).toBe(false);
    });
  });

  describe('getLocaleDirection', () => {
    it('should return ltr for all supported locales', () => {
      expect(localeModule.getLocaleDirection('en')).toBe('ltr');
      expect(localeModule.getLocaleDirection('es')).toBe('ltr');
      expect(localeModule.getLocaleDirection('fr')).toBe('ltr');
      expect(localeModule.getLocaleDirection('de')).toBe('ltr');
    });
  });

  describe('isSupportedLocale', () => {
    it('should return true for supported locales', () => {
      expect(localeModule.isSupportedLocale('en')).toBe(true);
      expect(localeModule.isSupportedLocale('es')).toBe(true);
      expect(localeModule.isSupportedLocale('fr')).toBe(true);
      expect(localeModule.isSupportedLocale('de')).toBe(true);
    });

    it('should return false for unsupported locales', () => {
      expect(localeModule.isSupportedLocale('jp')).toBe(false);
      expect(localeModule.isSupportedLocale('xx')).toBe(false); // 'xx' is not a valid locale
      expect(localeModule.isSupportedLocale('')).toBe(false);
    });

    it('should act as type guard', () => {
      const maybeLocale: string = 'es';
      if (localeModule.isSupportedLocale(maybeLocale)) {
        // TypeScript should know this is a Locale
        const locale: Locale = maybeLocale;
        expect(locale).toBe('es');
      }
    });
  });

  describe('assertLocale', () => {
    it('should not throw for valid locales', () => {
      expect(() => localeModule.assertLocale('en')).not.toThrow();
      expect(() => localeModule.assertLocale('es')).not.toThrow();
      expect(() => localeModule.assertLocale('fr')).not.toThrow();
      expect(() => localeModule.assertLocale('de')).not.toThrow();
    });

    it('should throw TypeError for invalid locales', () => {
      expect(() => localeModule.assertLocale('jp')).toThrow(TypeError);
      expect(() => localeModule.assertLocale('xx')).toThrow(TypeError);
      expect(() => localeModule.assertLocale('')).toThrow(TypeError);
    });

    it('should include helpful error message', () => {
      expect(() => localeModule.assertLocale('jp')).toThrow(/Invalid locale.*jp/);
      expect(() => localeModule.assertLocale('jp')).toThrow(/en, es, fr, de/);
    });

    it('should act as type assertion', () => {
      const maybeLocale: string = 'es';
      localeModule.assertLocale(maybeLocale);
      // TypeScript should now know this is a Locale
      const locale: Locale = maybeLocale;
      expect(locale).toBe('es');
    });
  });
});
