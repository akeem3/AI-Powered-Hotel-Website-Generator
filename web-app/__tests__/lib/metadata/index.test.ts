/**
 * Unit Tests for Hotel Metadata Index
 *
 * @module lib/metadata
 * @see ./hotel-metadata.test.ts
 */

import { describe, expect, it, beforeEach, afterEach } from '@jest/globals';

// Import all utilities from the index to ensure they're exported
import {
  SITE_URL,
  getExtendedLocaleCode,
  buildCanonicalUrl,
  buildHreflangUrls,
  getOgImageUrl,
  buildHotelJsonLd,
  getSafeValue,
  serializeJsonLd,
  EXTENDED_LOCALE_CODES,
} from '@/lib/metadata/hotel-metadata';

describe('hotel-metadata index exports', () => {
  // Verify all exported functions are available
  it('should export SITE_URL constant', () => {
    expect(SITE_URL).toBeDefined();
    expect(typeof SITE_URL).toBe('string');
  });

  it('should export getExtendedLocaleCode function', () => {
    expect(getExtendedLocaleCode).toBeDefined();
    expect(typeof getExtendedLocaleCode).toBe('function');
  });

  it('should export buildCanonicalUrl function', () => {
    expect(buildCanonicalUrl).toBeDefined();
    expect(typeof buildCanonicalUrl).toBe('function');
  });

  it('should export buildHreflangUrls function', () => {
    expect(buildHreflangUrls).toBeDefined();
    expect(typeof buildHreflangUrls).toBe('function');
  });

  it('should export getOgImageUrl function', () => {
    expect(getOgImageUrl).toBeDefined();
    expect(typeof getOgImageUrl).toBe('function');
  });

  it('should export buildHotelJsonLd function', () => {
    expect(buildHotelJsonLd).toBeDefined();
    expect(typeof buildHotelJsonLd).toBe('function');
  });

  it('should export getSafeValue function', () => {
    expect(getSafeValue).toBeDefined();
    expect(typeof getSafeValue).toBe('function');
  });

  it('should export serializeJsonLd function', () => {
    expect(serializeJsonLd).toBeDefined();
    expect(typeof serializeJsonLd).toBe('function');
  });

  it('should export EXTENDED_LOCALE_CODES constant', () => {
    expect(EXTENDED_LOCALE_CODES).toBeDefined();
    expect(typeof EXTENDED_LOCALE_CODES).toBe('object');
    // Verify all required locales are present
    const requiredLocales = ['en', 'es', 'fr', 'de', 'th', 'ja', 'ar'];
    requiredLocales.forEach((locale) => {
      expect(EXTENDED_LOCALE_CODES).toHaveProperty(locale);
    });
  });
});
