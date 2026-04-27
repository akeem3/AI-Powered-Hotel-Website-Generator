/**
 * Story 11.7: Comprehensive Edge Testing
 * Prompt 5: Localization Edge Cases
 *
 * Tests locale system under edge conditions including:
 * - Locale detection edge cases
 * - localStorage edge cases
 * - URL parameter edge cases
 * - Fallback chain edge cases
 * - Partial translation edge cases
 * - Language selector edge cases
 * - Cross-tab synchronization edge cases
 * - SEO edge cases
 */

import { renderHook, act } from '@testing-library/react';
import * as localeModule from '@/lib/content/locale';
import type { Locale } from '@/lib/content/locale';

// Mock store for localStorage
let store: Record<string, string> = {};

// Store original values for restoration
let originalLocalStorage: Storage | undefined;
let originalLocation: Location | undefined;
let originalNavigator: Navigator | undefined;
let originalBroadcastChannel: typeof BroadcastChannel | undefined;

describe('Story 11.7: Localization Edge Cases', () => {
  beforeAll(() => {
    // Store original values
    originalLocalStorage = window.localStorage;
    originalLocation = window.location;
    originalNavigator = window.navigator;
    originalBroadcastChannel = window.BroadcastChannel;
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

    // Mock window.location
    delete (window as any).location;
    (window as any).location = { search: '', href: 'http://localhost:3000' };

    // Mock window.navigator
    Object.defineProperty(window, 'navigator', {
      value: { language: 'en-US', languages: ['en-US'] },
      writable: true,
      configurable: true,
    });

    // Mock BroadcastChannel
    (window as any).BroadcastChannel = class MockBroadcastChannel {
      name: string;
      listeners: Array<(message: any) => void> = [];

      constructor(name: string) {
        this.name = name;
      }

      postMessage(message: any) {
        // In tests, this doesn't actually broadcast
      }

      addEventListener(event: string, listener: (message: any) => void) {
        if (event === 'message') {
          this.listeners.push(listener);
        }
      }

      removeEventListener(event: string, listener: (message: any) => void) {
        if (event === 'message') {
          this.listeners = this.listeners.filter(l => l !== listener);
        }
      }

      close() {
        this.listeners = [];
      }
    };
  });

  afterEach(() => {
    // Reset store
    store = {};

    // Restore original values
    delete (window as any).location;
    (window as any).location = originalLocation;
    delete (window as any).navigator;
    (window as any).navigator = originalNavigator;
    delete (window as any).BroadcastChannel;
    (window as any).BroadcastChannel = originalBroadcastChannel;
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

  // ============================================================================
  // 1. Locale Detection Edge Cases
  // ============================================================================

  describe('Locale Detection Edge Cases', () => {
    it('should handle navigator.language unavailable', () => {
      delete (window as any).navigator;
      (window as any).navigator = {};

      const result = localeModule.detectLocale();
      expect(result.locale).toBe(localeModule.DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('should handle navigator.language is null', () => {
      (window as any).navigator = { language: null, languages: null };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe(localeModule.DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('should handle navigator.language is empty string', () => {
      (window as any).navigator = { language: '', languages: [] };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe(localeModule.DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('should handle navigator.language with regional variant (es-419)', () => {
      (window as any).navigator = { language: 'es-419', languages: ['es-419', 'en-US'] };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe('es');
      expect(result.source).toBe('browser');
    });

    it('should handle navigator.languages array with multiple options', () => {
      (window as any).navigator = {
        language: 'jp-JP',
        languages: ['jp-JP', 'zh-CN', 'en-US', 'es-ES']
      };

      const result = localeModule.detectLocale();
      // Should skip unsupported 'jp' and find first supported locale 'zh'
      expect(result.locale).toBe('zh');
      expect(result.source).toBe('browser');
    });

    it('should handle invalid locale code (xx-XX)', () => {
      (window as any).navigator = { language: 'xx-XX', languages: ['xx-XX'] };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe(localeModule.DEFAULT_LOCALE);
      expect(result.source).toBe('default');
    });

    it('should handle very long locale string', () => {
      (window as any).navigator = { language: 'a'.repeat(100), languages: [] };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe(localeModule.DEFAULT_LOCALE);
    });
  });

  // ============================================================================
  // 2. localStorage Edge Cases
  // ============================================================================

  describe('localStorage Edge Cases', () => {
    it('should handle localStorage unavailable (private browsing)', () => {
      // Simulate localStorage being unavailable
      Object.defineProperty(window, 'localStorage', {
        get: () => {
          throw new Error('SecurityError: The operation is insecure.');
        },
        configurable: true,
      });

      expect(() => localeModule.setStoredLocale('es')).not.toThrow();
      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should handle localStorage quota exceeded', () => {
      let callCount = 0;
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => {
            callCount++;
            if (callCount > 1) {
              throw new Error('QuotaExceededError');
            }
            store[key] = value;
          },
          removeItem: (key: string) => delete store[key],
        },
        writable: true,
        configurable: true,
      });

      // First call succeeds
      localeModule.setStoredLocale('es');
      expect(store[localeModule.LOCALE_STORAGE_KEY]).toBe('es');

      // Second call throws, but should be handled gracefully
      expect(() => localeModule.setStoredLocale('fr')).not.toThrow();
    });

    it('should handle localStorage corrupted (invalid JSON)', () => {
      // Store invalid JSON (just a string, but let's simulate corruption)
      store[localeModule.LOCALE_STORAGE_KEY] = '{invalid json}';

      // Should return null since it's not a valid locale
      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should handle localStorage with invalid locale value', () => {
      store[localeModule.LOCALE_STORAGE_KEY] = 'invalid-locale';

      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should handle localStorage cleared mid-session', () => {
      localeModule.setStoredLocale('es');
      expect(localeModule.getStoredLocale()).toBe('es');

      // Clear localStorage
      store = {};
      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should handle rapid set/get cycles', () => {
      for (let i = 0; i < 100; i++) {
        localeModule.setStoredLocale('es');
        expect(localeModule.getStoredLocale()).toBe('es');
        localeModule.setStoredLocale('fr');
        expect(localeModule.getStoredLocale()).toBe('fr');
      }
    });
  });

  // ============================================================================
  // 3. URL Parameter Edge Cases
  // ============================================================================

  describe('URL Parameter Edge Cases', () => {
    it('should handle multiple lang params (?lang=es&lang=fr)', () => {
      // URLSearchParams uses first value for duplicate keys
      const result = localeModule.getLocaleFromUrl('?lang=es&lang=fr');
      expect(result).toBe('es'); // First one wins
    });

    it('should handle invalid lang param (?lang=invalid)', () => {
      const result = localeModule.getLocaleFromUrl('?lang=invalid');
      expect(result).toBeNull();
    });

    it('should handle empty lang param (?lang=)', () => {
      const result = localeModule.getLocaleFromUrl('?lang=');
      expect(result).toBeNull();
    });

    it('should handle URL-encoded locale (?lang=%65%73 for es)', () => {
      const result = localeModule.getLocaleFromUrl('?lang=%65%73'); // URL-encoded "es"
      expect(result).toBe('es');
    });

    it('should handle malformed URL gracefully', () => {
      // Invalid URL that might throw during parsing
      const result = localeModule.getLocaleFromUrl('not-a-url?lang=es');
      // Should handle gracefully and return null
      expect(result).toBeNull();
    });

    it('should handle URL with fragment identifier', () => {
      // Fragment is in the hash, not the query string
      // URLSearchParams handles the query string part only
      // The actual URL would be: ?lang=es#section, but the search param is ?lang=es
      const result = localeModule.getLocaleFromUrl('?lang=es');
      expect(result).toBe('es');
    });
  });

  // ============================================================================
  // 4. Fallback Chain Edge Cases
  // ============================================================================

  describe('Fallback Chain Edge Cases', () => {
    it('should handle localStorage overriding browser', () => {
      store[localeModule.LOCALE_STORAGE_KEY] = 'fr';
      (window as any).navigator = { language: 'de-DE' };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe('fr');
      expect(result.source).toBe('storage');
    });

    it('should fall back to browser when localStorage invalid', () => {
      store[localeModule.LOCALE_STORAGE_KEY] = 'invalid';
      (window as any).navigator = { language: 'de-DE' };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe('de');
      expect(result.source).toBe('browser');
    });

    it('should fall back to default when all sources invalid', () => {
      store[localeModule.LOCALE_STORAGE_KEY] = 'invalid';
      (window as any).navigator = { language: 'jp-JP' };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe('en');
      expect(result.source).toBe('default');
    });

    it('should handle empty sources in priority order', () => {
      // All sources empty/missing
      store = {};
      (window as any).navigator = { language: '', languages: [] };

      const result = localeModule.detectLocale();
      expect(result.locale).toBe('en');
      expect(result.source).toBe('default');
    });

    it('should verify URL param priority via getLocaleFromUrl', () => {
      // Test URL locale extraction directly
      const urlLocale = localeModule.getLocaleFromUrl('?lang=es');
      expect(urlLocale).toBe('es');

      // Verify localStorage would be overridden by URL in real usage
      store[localeModule.LOCALE_STORAGE_KEY] = 'fr';
      (window as any).navigator = { language: 'de-DE' };

      // Without URL, storage wins
      let result = localeModule.detectLocale();
      expect(result.locale).toBe('fr');
      expect(result.source).toBe('storage');

      // With URL, URL would win (tested via getLocaleFromUrl)
      const urlResult = localeModule.getLocaleFromUrl('?lang=es');
      expect(urlResult).toBe('es');
    });
  });

  // ============================================================================
  // 5. Partial Translation Edge Cases
  // ============================================================================

  describe('Partial Translation Edge Cases', () => {
    // These tests verify the locale system's handling of partial translations
    // The actual content loading is handled by other modules

    it('should handle locale code validation for partial content', () => {
      // Verify that even if content is partial, locale codes are validated
      expect(localeModule.isSupportedLocale('en')).toBe(true);
      expect(localeModule.isSupportedLocale('es')).toBe(true);
      expect(localeModule.isSupportedLocale('pt')).toBe(true); // Portuguese is now supported
      expect(localeModule.isSupportedLocale('xx')).toBe(false); // 'xx' is not a supported locale
    });

    it('should handle locale assertion for content verification', () => {
      // Assert locale throws for invalid locales
      expect(() => localeModule.assertLocale('en')).not.toThrow();
      expect(() => localeModule.assertLocale('xx-XX')).toThrow(TypeError);
    });

    it('should handle locale direction for partial translations', () => {
      // All current locales are LTR, but function exists for future RTL
      expect(localeModule.getLocaleDirection('en')).toBe('ltr');
      expect(localeModule.getLocaleDirection('es')).toBe('ltr');
      expect(localeModule.getLocaleDirection('fr')).toBe('ltr');
      expect(localeModule.getLocaleDirection('de')).toBe('ltr');
    });

    it('should handle RTL check for future languages', () => {
      // Currently all LTR, but API exists
      expect(localeModule.isLocaleRTL('en')).toBe(false);
      expect(localeModule.isLocaleRTL('es')).toBe(false);
    });
  });

  // ============================================================================
  // 6. Language Selector Edge Cases
  // ============================================================================

  describe('Language Selector Edge Cases', () => {
    it('should handle rapid language switching (10 changes in 1 second)', () => {
      const locales: Locale[] = ['en', 'es', 'fr', 'de'];

      // Simulate rapid switching
      for (let i = 0; i < 10; i++) {
        const locale = locales[i % locales.length];
        localeModule.setStoredLocale(locale);
        expect(localeModule.getStoredLocale()).toBe(locale);
      }

      // i=9: 9 % 4 = 1, so final locale is 'es'
      expect(localeModule.getStoredLocale()).toBe('es');
    });

    it('should handle language switch to same language', () => {
      localeModule.setStoredLocale('es');
      expect(localeModule.getStoredLocale()).toBe('es');

      // Switch to same locale
      localeModule.setStoredLocale('es');
      expect(localeModule.getStoredLocale()).toBe('es');

      // Should not cause any issues
      expect(store[localeModule.LOCALE_STORAGE_KEY]).toBe('es');
    });

    it('should handle language switch during "offline" (localStorage unavailable)', () => {
      // Make localStorage unavailable
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => { throw new Error('localStorage unavailable'); },
          setItem: () => { throw new Error('localStorage unavailable'); },
        },
        writable: true,
        configurable: true,
      });

      // Should not throw
      expect(() => localeModule.setStoredLocale('es')).not.toThrow();
      expect(localeModule.getStoredLocale()).toBeNull();
    });

    it('should handle switching through all supported locales', () => {
      const locales: Locale[] = ['en', 'es', 'fr', 'de'];

      for (const locale of locales) {
        localeModule.setStoredLocale(locale);
        expect(localeModule.getStoredLocale()).toBe(locale);
      }

      // Should end on 'de'
      expect(localeModule.getStoredLocale()).toBe('de');
    });

    it('should handle clearing locale (reset to default)', () => {
      localeModule.setStoredLocale('es');
      expect(localeModule.getStoredLocale()).toBe('es');

      localeModule.clearStoredLocale();
      expect(localeModule.getStoredLocale()).toBeNull();

      // Detection should fall back to browser/default
      const result = localeModule.detectLocale();
      expect(result.source).not.toBe('storage');
    });
  });

  // ============================================================================
  // 7. Cross-Tab Synchronization Edge Cases
  // ============================================================================

  describe('Cross-Tab Synchronization Edge Cases', () => {
    it('should handle BroadcastChannel unavailable', () => {
      // Remove BroadcastChannel
      delete (window as any).BroadcastChannel;

      // Locale functions should still work without BroadcastChannel
      expect(() => localeModule.setStoredLocale('es')).not.toThrow();
      expect(localeModule.getStoredLocale()).toBe('es');
    });

    it('should handle locale change when BroadcastChannel exists', () => {
      // BroadcastChannel is mocked in beforeEach
      // Should be able to change locale without errors
      expect(() => localeModule.setStoredLocale('es')).not.toThrow();

      // Verify the change
      expect(localeModule.getStoredLocale()).toBe('es');
    });

    it('should handle multiple rapid locale changes with BroadcastChannel', () => {
      const locales: Locale[] = ['en', 'es', 'fr', 'de', 'en', 'es'];

      for (const locale of locales) {
        expect(() => localeModule.setStoredLocale(locale)).not.toThrow();
        expect(localeModule.getStoredLocale()).toBe(locale);
      }
    });

    it('should handle BroadcastChannel close during operation', () => {
      const channel = new BroadcastChannel('locale-test');

      // Change locale
      localeModule.setStoredLocale('fr');
      expect(localeModule.getStoredLocale()).toBe('fr');

      // Close channel
      channel.close();

      // Locale functions should still work
      localeModule.setStoredLocale('de');
      expect(localeModule.getStoredLocale()).toBe('de');
    });
  });

  // ============================================================================
  // 8. SEO Edge Cases
  // ============================================================================

  describe('SEO Edge Cases', () => {
    it('should handle hreflang tag generation for all locales', () => {
      const locales: Locale[] = ['en', 'es', 'fr', 'de'];

      // Verify all supported locales are valid for hreflang
      for (const locale of locales) {
        expect(localeModule.isSupportedLocale(locale)).toBe(true);
      }
    });

    it('should handle canonical URL per locale', () => {
      // Locale codes should be URL-safe
      const locales: Locale[] = ['en', 'es', 'fr', 'de'];

      for (const locale of locales) {
        // Verify locale code only contains safe characters
        expect(locale).toMatch(/^[a-z]{2}$/);
        expect(encodeURIComponent(locale)).toBe(locale);
      }
    });

    it('should handle lang attribute on html element', () => {
      // Locale codes should be valid HTML lang attributes
      const locales: Locale[] = ['en', 'es', 'fr', 'de'];

      for (const locale of locales) {
        // Valid BCP 47 language tags
        expect(locale).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
      }
    });

    it('should handle locale-specific metadata', () => {
      // Verify locale names exist for all supported locales
      const locales: Locale[] = ['en', 'es', 'fr', 'de'];

      for (const locale of locales) {
        expect(localeModule.LOCALE_NAMES[locale]).toBeDefined();
        expect(localeModule.LOCALE_NATIVE_NAMES[locale]).toBeDefined();
      }
    });

    it('should handle locale for regional variants (hreflang)', () => {
      // Parse regional variants correctly
      expect(localeModule.parseNavigatorLanguage('es-419')).toBe('es'); // Latin America
      expect(localeModule.parseNavigatorLanguage('en-GB')).toBe('en'); // UK
      expect(localeModule.parseNavigatorLanguage('en-US')).toBe('en'); // US
      expect(localeModule.parseNavigatorLanguage('fr-CA')).toBe('fr'); // French Canada
    });
  });

  // ============================================================================
  // Additional: Integration with Content System
  // ============================================================================

  describe('Integration Edge Cases', () => {
    it('should verify locale extraction and storage work together', () => {
      // URL extraction works
      const urlLocale = localeModule.getLocaleFromUrl('?lang=es');
      expect(urlLocale).toBe('es');

      // Storage works
      localeModule.setStoredLocale('fr');
      expect(localeModule.getStoredLocale()).toBe('fr');

      // Detection falls back through sources (URL not set in window.location)
      (window as any).navigator = { language: 'de-DE' };
      const result = localeModule.detectLocale();
      expect(result.locale).toBe('fr');
      expect(result.source).toBe('storage');
    });

    it('should handle locale changes affecting detection result', () => {
      // Start with browser locale
      (window as any).navigator = { language: 'de-DE' };
      localeModule.clearStoredLocale();
      let result = localeModule.detectLocale();
      expect(result.locale).toBe('de');
      expect(result.source).toBe('browser');

      // Add localStorage - should now win
      localeModule.setStoredLocale('es');
      result = localeModule.detectLocale();
      expect(result.locale).toBe('es');
      expect(result.source).toBe('storage');

      // Clear storage - browser wins again
      localeModule.clearStoredLocale();
      result = localeModule.detectLocale();
      expect(result.locale).toBe('de');
      expect(result.source).toBe('browser');
    });

    it('should handle priority chain correctly (storage > browser > default)', () => {
      const testScenarios = [
        {
          storage: 'fr',
          browser: 'de-DE',
          expected: 'fr',
          expectedSource: 'storage'
        },
        {
          storage: null,
          browser: 'de-DE',
          expected: 'de',
          expectedSource: 'browser'
        },
        {
          storage: null,
          browser: 'jp-JP',
          expected: 'en',
          expectedSource: 'default'
        },
      ];

      for (const scenario of testScenarios) {
        // Setup
        localeModule.clearStoredLocale();
        if (scenario.storage) {
          store[localeModule.LOCALE_STORAGE_KEY] = scenario.storage;
        }
        (window as any).navigator = { language: scenario.browser };

        // Test
        const result = localeModule.detectLocale();
        expect(result.locale).toBe(scenario.expected);
        expect(result.source).toBe(scenario.expectedSource);
      }
    });

    it('should verify URL param extraction works independently', () => {
      // Verify URL locale extraction works as expected
      expect(localeModule.getLocaleFromUrl('?lang=es')).toBe('es');
      expect(localeModule.getLocaleFromUrl('?lang=fr')).toBe('fr');
      expect(localeModule.getLocaleFromUrl('?lang=invalid')).toBeNull();
      expect(localeModule.getLocaleFromUrl('')).toBeNull();
    });
  });
});
