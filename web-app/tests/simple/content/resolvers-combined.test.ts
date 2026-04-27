import {
  resolveVariables,
  hasVariables,
  resolveVariablesOrThrow,
  getNestedValue,
} from '@/lib/content/resolvers/variable-resolver';
import {
  resolveMediaRef,
  isMediaRef,
  resolveMediaRefOrFallback,
} from '@/lib/content/resolvers/media-resolver';
import { resolveContent, resolveContentAndValidate } from '@/lib/content/resolvers/content-resolver';
import { VariableContext, ResolverContext } from '@/lib/content/resolvers/types';
import { HomepageContentSchema } from '@/lib/content/schemas';

describe('Variable Resolver', () => {
  const createMockContext = (): VariableContext => ({
    hotelParameters: {
      name: 'The Sterling Executive',
      id: 'hotel-123',
      location: 'New York',
      currency: 'USD',
      address: {
        city: 'New York',
        country: 'USA',
        street: '123 Main St',
        postalCode: '10001',
      },
      contact: {
        phone: '+1-555-0123',
        email: 'info@sterling.com',
      },
    },
    locale: 'en',
    custom: {},
  });

  describe('resolveVariables', () => {
    it('should resolve simple variable: "Hello {{name}}" → "Hello Hotel Name"', () => {
      const template = 'Hello {{name}}';
      const context = createMockContext();
      const result = resolveVariables(template, context);

      expect(result).toBe('Hello The Sterling Executive');
    });

    it('should resolve multiple variables: "{{name}} in {{location}}"', () => {
      const template = '{{name}} in {{location}}';
      const context = createMockContext();
      const result = resolveVariables(template, context);

      expect(result).toBe('The Sterling Executive in New York');
    });

    it('should resolve nested path with shorthand: "{{address.city}}"', () => {
      const template = 'City: {{address.city}}';
      const context = createMockContext();
      const result = resolveVariables(template, context);

      expect(result).toBe('City: New York');
    });

    it('should handle missing variable: "{{unknown}}" → "" or "[MISSING: unknown]"', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';

      try {
        const template = '{{unknown}}';
        const context = createMockContext();
        const result = resolveVariables(template, context);

        expect(result).toBe('[MISSING: unknown]');
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
      }
    });

    it('should return empty for missing variable in production', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';

      try {
        const template = '{{unknown}}';
        const context = createMockContext();
        const result = resolveVariables(template, context);

        expect(result).toBe('');
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
      }
    });

    it('should handle no variables: "Plain text" → "Plain text"', () => {
      const template = 'Plain text';
      const context = createMockContext();
      const result = resolveVariables(template, context);

      expect(result).toBe('Plain text');
    });

    it('should handle empty context gracefully', () => {
      const template = '{{name}}';
      const emptyContext: VariableContext = {
        hotelParameters: { name: '', id: '' },
      };
      const result = resolveVariables(template, emptyContext);

      expect(result).toBe('');
    });

    it('should resolve computed variable: {{locale}}', () => {
      const template = 'Locale: {{locale}}';
      const context = createMockContext();
      const result = resolveVariables(template, context);

      expect(result).toBe('Locale: en');
    });

    it('should resolve computed variable: {{currentYear}}', () => {
      const template = 'Year: {{currentYear}}';
      const context = createMockContext();
      const result = resolveVariables(template, context);
      const year = new Date().getFullYear();

      expect(result).toBe(`Year: ${year}`);
    });
  });

  describe('hasVariables', () => {
    it('should return true for strings with variables', () => {
      expect(hasVariables('Hello {{name}}')).toBe(true);
    });

    it('should return false for strings without variables', () => {
      expect(hasVariables('Plain text')).toBe(false);
    });
  });

  describe('getNestedValue', () => {
    it('should retrieve nested values using dot notation', () => {
      const obj = {
        hotel: {
          address: {
            city: 'New York',
          },
        },
      };

      expect(getNestedValue(obj, 'hotel.address.city')).toBe('New York');
    });

    it('should return undefined for missing paths', () => {
      const obj = { hotel: { name: 'Test' } };
      expect(getNestedValue(obj, 'hotel.missing.path')).toBeUndefined();
    });
  });
});

describe('Media Resolver', () => {
  const createMockManifest = () => ({
    cdn: {
      baseUrl: 'https://cdn.example.com',
      transformPath: '/cdn-cgi/image',
    },
    assets: {
      homepage: {
        hero: {
          id: 'hero-001',
          path: '/hotel-123/hero.webp',
          mobilePath: '/hotel-123/hero-mobile.webp',
          alt: 'Hotel exterior',
          blurhash: 'L6Pj0^jE',
          width: 1920,
          height: 1080,
        },
      },
    },
  });

  describe('isMediaRef', () => {
    it('should identify valid media references', () => {
      expect(isMediaRef('@media:homepage.hero')).toBe(true);
      expect(isMediaRef('@media:rooms.gallery-1')).toBe(true);
    });

    it('should reject invalid syntax: "not a ref"', () => {
      expect(isMediaRef('not a ref')).toBe(false);
      expect(isMediaRef('https://cdn.com/img.jpg')).toBe(false);
      expect(isMediaRef('@media:')).toBe(false);
    });
  });

  describe('resolveMediaRef', () => {
    it('should resolve valid reference: "@media:homepage.hero" → full URL', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRef('@media:homepage.hero', manifest);

      expect(result).toEqual({
        url: 'https://cdn.example.com/hotel-123/hero.webp',
        mobileUrl: 'https://cdn.example.com/hotel-123/hero-mobile.webp',
        alt: 'Hotel exterior',
        blurhash: 'L6Pj0^jE',
        width: 1920,
        height: 1080,
      });
    });

    it('should return null for invalid syntax: "not a ref"', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRef('not a ref', manifest);

      expect(result).toBeNull();
    });

    it('should return null for missing asset: "@media:homepage.missing"', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRef('@media:homepage.missing', manifest);

      expect(result).toBeNull();
    });

    it('should return mobile URL when available', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRef('@media:homepage.hero', manifest);

      expect(result?.mobileUrl).toBe('https://cdn.example.com/hotel-123/hero-mobile.webp');
    });

    it('should handle null mobileUrl when not available', () => {
      const manifest = {
        cdn: { baseUrl: 'https://cdn.example.com' },
        assets: {
          homepage: {
            logo: {
              id: 'logo-001',
              path: '/hotel-123/logo.png',
              alt: 'Hotel logo',
            },
          },
        },
      };
      const result = resolveMediaRef('@media:homepage.logo', manifest);

      expect(result).not.toBeNull();
      expect(result?.mobileUrl).toBeNull();
    });
  });

  describe('resolveMediaRefOrFallback', () => {
    it('should return fallback for missing asset', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRefOrFallback('@media:homepage.missing', manifest);

      expect(result).toEqual({
        url: '/images/hotel-img.jpg',
        mobileUrl: null,
        alt: '',
        blurhash: null,
        width: null,
        height: null,
      });
    });

    it('should use custom fallback URL', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRefOrFallback(
        '@media:homepage.missing',
        manifest,
        '/custom/fallback.jpg'
      );

      expect(result.url).toBe('/custom/fallback.jpg');
    });
  });
});

describe('Content Resolver', () => {
  const createMockContext = (): ResolverContext => ({
    variables: {
      hotelParameters: {
        name: 'The Sterling Executive',
        id: 'hotel-123',
        location: 'New York',
        currency: 'USD',
        address: {
          city: 'New York',
          country: 'USA',
        },
      },
      locale: 'en',
      custom: {},
    },
    mediaManifest: {
      cdn: {
        baseUrl: 'https://cdn.example.com',
        transformPath: '/cdn-cgi/image',
      },
      assets: {
        homepage: {
          hero: {
            id: 'hero-001',
            path: '/hotel-123/hero.webp',
            alt: 'Hotel exterior',
          },
        },
      },
    },
  });

  describe('resolveContent', () => {
    it('should resolve simple object with variables', () => {
      const content = {
        title: 'Welcome to {{name}}',
        location: 'Located in {{location}}',
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        title: 'Welcome to The Sterling Executive',
        location: 'Located in New York',
      });
    });

    it('should resolve nested object with mixed content', () => {
      const content = {
        hero: {
          headline: '{{name}}',
          subheading: '{{address.city}}, {{address.country}}',
          static: 'This stays the same',
        },
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        hero: {
          headline: 'The Sterling Executive',
          subheading: 'New York, USA',
          static: 'This stays the same',
        },
      });
    });

    it('should resolve array of objects', () => {
      const content = {
        items: [
          { title: '{{name}} - First', value: 1 },
          { title: '{{location}} - Second', value: 2 },
        ],
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        items: [
          { title: 'The Sterling Executive - First', value: 1 },
          { title: 'New York - Second', value: 2 },
        ],
      });
    });

    it('should resolve object with @media: references', () => {
      const content = {
        hero: {
          title: 'Welcome',
          backgroundImage: '@media:homepage.hero',
        },
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        hero: {
          title: 'Welcome',
          backgroundImage: 'https://cdn.example.com/hotel-123/hero.webp',
        },
      });
    });

    it('should resolve complex real-world content JSON', () => {
      const content = {
        meta: {
          title: '{{name}} | {{location}}',
          description: 'Experience luxury at {{name}} in {{address.city}}',
          ogImage: '@media:homepage.hero',
        },
        hero: {
          headline: 'Welcome to {{name}}',
          subheading: 'Located in {{address.city}}, {{address.country}}',
          backgroundImage: '@media:homepage.hero',
        },
        sections: {
          amenities: {
            heading: 'Amenities',
            items: [
              { name: 'Pool', icon: 'pool' },
              { name: 'Spa', icon: 'spa' },
            ],
          },
        },
        footer: {
          copyright: '© {{currentYear}} {{name}}. All rights reserved.',
        },
      };

      const result = resolveContent(content, createMockContext());
      const year = new Date().getFullYear();

      expect(result).toEqual({
        meta: {
          title: 'The Sterling Executive | New York',
          description: 'Experience luxury at The Sterling Executive in New York',
          ogImage: 'https://cdn.example.com/hotel-123/hero.webp',
        },
        hero: {
          headline: 'Welcome to The Sterling Executive',
          subheading: 'Located in New York, USA',
          backgroundImage: 'https://cdn.example.com/hotel-123/hero.webp',
        },
        sections: {
          amenities: {
            heading: 'Amenities',
            items: [
              { name: 'Pool', icon: 'pool' },
              { name: 'Spa', icon: 'spa' },
            ],
          },
        },
        footer: {
          copyright: `© ${year} The Sterling Executive. All rights reserved.`,
        },
      });
    });

    it('should preserve non-string values', () => {
      const content = {
        count: 42,
        active: true,
        rating: 4.5,
        name: '{{name}}',
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        count: 42,
        active: true,
        rating: 4.5,
        name: 'The Sterling Executive',
      });
    });

    it('should handle circular references', () => {
      const content: Record<string, unknown> = {
        title: '{{name}}',
      };
      content.self = content;

      const result = resolveContent(content, createMockContext());

      expect(result.title).toBe('The Sterling Executive');
      expect(result.self).toBe(content);
    });

    it('should handle null and undefined values', () => {
      const content = {
        nullValue: null,
        undefinedValue: undefined,
        name: '{{name}}',
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        nullValue: null,
        undefinedValue: undefined,
        name: 'The Sterling Executive',
      });
    });

    it('should support custom variables', () => {
      const content = {
        promo: '{{promoCode}}',
      };
      const context = createMockContext();
      context.variables.custom = { promoCode: 'SAVE20' };
      const result = resolveContent(content, context);

      expect(result).toEqual({
        promo: 'SAVE20',
      });
    });

    it('should prioritize custom variables over hotelParameters', () => {
      const content = {
        title: '{{name}}',
      };
      const context = createMockContext();
      context.variables.custom = { name: 'Custom Name' };
      const result = resolveContent(content, context);

      expect(result).toEqual({
        title: 'Custom Name',
      });
    });
  });

  describe('resolveContentAndValidate', () => {
    it('should validate resolved content against schema', () => {
      const content = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-20T00:00:00Z',
          hotelId: 'hotel-123',
          locale: 'en',
        },
        hero: {
          title: 'The Sterling Executive',
          headline: 'Test Headline',
        },
      };

      const result = resolveContentAndValidate(content, createMockContext(), HomepageContentSchema);

      expect(result).toBeDefined();
    });

    it('should throw error when validation fails', () => {
      const content = {
        meta: {
          hotelId: 'hotel-123',
        },
        hero: {},
      };

      expect(() => {
        resolveContentAndValidate(content, createMockContext(), HomepageContentSchema);
      }).toThrow();
    });
  });
});
