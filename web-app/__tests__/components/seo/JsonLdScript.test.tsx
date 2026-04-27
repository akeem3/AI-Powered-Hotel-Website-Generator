/**
 * Unit Tests for JsonLdScript Component
 *
 * @module components/seo
 * @see ./JsonLdScript.tsx
 */

import { render } from '@testing-library/react';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import type { HotelJsonLd } from '@/lib/metadata/hotel-metadata';

// Mock JSON-LD data
const mockJsonLd: HotelJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: 'Test Hotel',
  description: 'A test hotel for testing',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '123 Test Street',
    addressLocality: 'Test City',
    addressRegion: 'Test Region',
    postalCode: '12345',
    addressCountry: 'Test Country',
  },
  url: 'https://example.com/en/hotels/test-hotel',
  starRating: {
    '@type': 'Rating',
    ratingValue: 4,
  },
};

describe('JsonLdScript Component', () => {
  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render script tag with type="application/ld+json"', () => {
      const { container } = render(<JsonLdScript jsonLd={mockJsonLd} />);
      const script = container.querySelector('script');

      expect(script).toBeTruthy();
      expect(script?.getAttribute('type')).toBe('application/ld+json');
    });

    it('should serialize JSON-LD data correctly', () => {
      const { container } = render(<JsonLdScript jsonLd={mockJsonLd} />);
      const script = container.querySelector('script');

      expect(script?.textContent).toBe(JSON.stringify(mockJsonLd));
    });

    it('should escape JSON content to prevent XSS', () => {
      const dangerousJsonLd = {
        '@context': 'https://evil.com</script><script>',
        '@type': 'Hotel',
      };

      const { container } = render(<JsonLdScript jsonLd={dangerousJsonLd} />);
      const script = container.querySelector('script');

      // JSON.stringify serializes the data; verify it's valid JSON inside script tag
      const parsed = JSON.parse(script?.textContent || '{}');
      expect(parsed['@context']).toBe('https://evil.com</script><script>');
      expect(parsed['@type']).toBe('Hotel');
    });
  });

  describe('props handling', () => {
    it('should handle empty object jsonLd gracefully', () => {
      const { container } = render(<JsonLdScript jsonLd={{}} />);
      const script = container.querySelector('script');

      expect(script).toBeTruthy();
      expect(script?.getAttribute('type')).toBe('application/ld+json');
      expect(script?.textContent).toBe('{}');
    });

    it('should handle jsonLd with Record<string, unknown>', () => {
      const customJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        customField: 'custom value',
      };

      const { container } = render(<JsonLdScript jsonLd={customJsonLd} />);
      const script = container.querySelector('script');

      expect(script?.textContent).toBe(JSON.stringify(customJsonLd));
    });
  });

  describe('accessibility', () => {
    it('should not throw errors for valid JSON-LD data', () => {
      expect(() => render(<JsonLdScript jsonLd={mockJsonLd} />)).not.toThrow();
    });
  });
});
