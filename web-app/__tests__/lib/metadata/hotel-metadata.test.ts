/**
 * Unit Tests for Hotel Metadata Utilities
 *
 * @module lib/metadata
 * @see ../hotel-metadata.ts
 */

import { describe, expect, it } from '@jest/globals';
import {
  getExtendedLocaleCode,
  buildCanonicalUrl,
  buildHreflangUrls,
  getOgImageUrl,
  buildHotelJsonLd,
  getSafeValue,
  serializeJsonLd,
  KNOWN_LOCALE_CODES,
  SITE_URL,
} from '@/lib/metadata/hotel-metadata';

// Mock data for testing
const mockHotel = {
  id: 'hotel-001',
  name: 'Test Hotel',
  slug: 'test-hotel',
  property_type: 'hotel' as const,
  star_rating: 4,
  status: 'active' as const,
  opening_year: null,
  address: '{"city":"Test City","country":"Test Country"}',
  is_template: false,
  has_override: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  parsedAddress: {
    city: 'Test City',
    country: 'Test Country',
    state: 'Test State',
    postal_code: '12345',
    street: '123 Test Street',
  },
};

const mockImages = [
  { id: 'img1', url: 'https://example.com/img1.jpg', hotel_id: 'hotel-001' },
  { id: 'img2', url: 'https://example.com/img2.jpg', hotel_id: 'hotel-001' },
];

const mockAvailableLanguages = ['en', 'th', 'ja'] as const;

describe('getExtendedLocaleCode', () => {
  it('should return correct extended locale code', () => {
    expect(getExtendedLocaleCode('en')).toBe('en-US');
    expect(getExtendedLocaleCode('th')).toBe('th-TH');
    expect(getExtendedLocaleCode('ja')).toBe('ja-JP');
    expect(getExtendedLocaleCode('ar')).toBe('ar-SA');
  });

  it('should return correct locale code for all supported locales', () => {
    // Test all defined locales
    Object.values(KNOWN_LOCALE_CODES).forEach((code) => {
      expect(code).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    });
  });
});

describe('buildCanonicalUrl', () => {
  beforeEach(() => {
    // Mock SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  });

  afterEach(() => {
    // Reset to avoid affecting other tests
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('should build correct canonical URL', () => {
    const url = buildCanonicalUrl('https://example.com', 'en', 'my-hotel');
    expect(url).toBe('https://example.com/en/hotels/my-hotel');
  });

  it('should handle trailing slash in baseUrl', () => {
    const url = buildCanonicalUrl('https://example.com/', 'en', 'my-hotel');
    expect(url).toBe('https://example.com/en/hotels/my-hotel');
  });

  it('should handle localhost fallback when SITE_URL is empty', () => {
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = '';
    const url = buildCanonicalUrl('', 'en', 'my-hotel');
    expect(url).toBe('/en/hotels/my-hotel');
    // Restore
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it('should properly encode URL parameters', () => {
    // Test that special characters are handled
    const url = buildCanonicalUrl('https://example.com', 'en', 'hotel with spaces');
    expect(url).toBe('https://example.com/en/hotels/hotel%20with%20spaces');
  });
});

describe('buildHreflangUrls', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it('should build hreflang URLs for all available languages', () => {
    const urls = buildHreflangUrls('https://example.com', 'test-hotel', [...mockAvailableLanguages]);

    expect(urls).toHaveProperty('en-US', 'https://example.com/en/hotels/test-hotel');
    expect(urls).toHaveProperty('th-TH', 'https://example.com/th/hotels/test-hotel');
    expect(urls).toHaveProperty('ja-JP', 'https://example.com/ja/hotels/test-hotel');
  });

  it('should handle empty languages array gracefully', () => {
    const urls = buildHreflangUrls('https://example.com', 'test-hotel', []);
    expect(urls).toEqual({});
  });
});

describe('getOgImageUrl', () => {
  it('should return undefined when images is null', () => {
    const result = getOgImageUrl('https://example.com', null);
    expect(result).toBeUndefined();
  });

  it('should return undefined when images array is empty', () => {
    const result = getOgImageUrl('https://example.com', []);
    expect(result).toBeUndefined();
  });

  it('should return image URL when images array has items', () => {
    const result = getOgImageUrl('https://example.com', mockImages);
    expect(result).toBe('https://example.com/images/img1');
  });

  it('should use first image ID for URL construction', () => {
    const result = getOgImageUrl('https://example.com', mockImages);
    expect(result).toContain('img1');
  });
});

describe('buildHotelJsonLd', () => {
  it('should build complete Hotel JSON-LD with all required fields', () => {
    const jsonLd = buildHotelJsonLd(
      mockHotel,
      'A test hotel with great amenities',
      'https://example.com/en/hotels/test-hotel'
    );

    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: 'Test Hotel',
      description: 'A test hotel with great amenities',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Test Street',
        addressLocality: 'Test City',
        addressRegion: 'Test State',
        postalCode: '12345',
        addressCountry: 'Test Country',
      },
      url: 'https://example.com/en/hotels/test-hotel',
      starRating: {
        '@type': 'Rating',
        ratingValue: 4,
      },
    });
  });

  it('should include starRating only when hotel has stars', () => {
    const hotelNoStars = { ...mockHotel, star_rating: 0 };
    const jsonLd = buildHotelJsonLd(
      hotelNoStars,
      'Test description',
      'https://example.com/en/hotels/test-hotel'
    );

    expect(jsonLd).not.toHaveProperty('starRating');
  });

  it('should include image when ogImage is provided', () => {
    const jsonLd = buildHotelJsonLd(
      mockHotel,
      'Test description',
      'https://example.com/en/hotels/test-hotel',
      'https://example.com/images/img1.jpg'
    );

    expect(jsonLd).toHaveProperty('image');
    expect(jsonLd.image).toBe('https://example.com/images/img1.jpg');
  });

  it('should omit image when ogImage is not provided', () => {
    const jsonLd = buildHotelJsonLd(
      mockHotel,
      'Test description',
      'https://example.com/en/hotels/test-hotel'
    );

    expect(jsonLd).not.toHaveProperty('image');
  });
});

describe('getSafeValue', () => {
  it('should return value when value is defined', () => {
    expect(getSafeValue('defined', 'fallback')).toBe('defined');
  });

  it('should return fallback when value is undefined', () => {
    expect(getSafeValue(undefined, 'fallback')).toBe('fallback');
  });

  it('should return fallback when value is null', () => {
    expect(getSafeValue(null, 'fallback')).toBe('fallback');
  });
});

describe('serializeJsonLd', () => {
  it('should serialize JSON-LD object to string', () => {
    const jsonLd: import('@/lib/metadata/hotel-metadata').HotelJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Hotel',
      name: 'Test Hotel',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Test City',
        addressCountry: 'Test Country',
      },
    };

    const result = serializeJsonLd(jsonLd);
    expect(typeof result).toBe('string');
    expect(result).toContain('"@context"');
    expect(result).toContain('"@type"');
  });
});

describe('KNOWN_LOCALE_CODES constant', () => {
  it('should have all required locale mappings', () => {
    const requiredLocales = ['en', 'es', 'fr', 'de', 'th', 'ja', 'ar'];

    requiredLocales.forEach((locale) => {
      expect(KNOWN_LOCALE_CODES).toHaveProperty(locale);
    });

    // Verify total count includes at least all required locales
    const localeCount = Object.keys(KNOWN_LOCALE_CODES).length;
    expect(localeCount).toBeGreaterThanOrEqual(requiredLocales.length);
  });

  it('should use correct BCP 47 format', () => {
    Object.values(KNOWN_LOCALE_CODES).forEach((code) => {
      // Format: language-REGION (e.g., en-US)
      expect(code).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
    });
  });

  it('should have ar-SA for Arabic locale', () => {
    expect(KNOWN_LOCALE_CODES.ar).toBe('ar-SA');
  });
});

describe('SITE_URL constant', () => {
  it('should be a string', () => {
    expect(typeof SITE_URL).toBe('string');
  });

  it('should be defined at module level from env', () => {
    // SITE_URL is evaluated once at module load from process.env.NEXT_PUBLIC_SITE_URL
    // Its value depends on the test environment setup
    expect(SITE_URL).toBeDefined();
  });
});
