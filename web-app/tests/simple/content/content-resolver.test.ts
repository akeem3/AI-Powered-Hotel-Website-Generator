import { resolveContent, resolveContentAndValidate } from '@/lib/content/resolvers/content-resolver';
import { HomepageContentSchema } from '@/lib/content/schemas';
import { ResolverContext } from '@/lib/content/resolvers/types';
import { z } from 'zod';

describe('resolveContent', () => {
  const createMockContext = (overrides: Partial<ResolverContext> = {}): ResolverContext => {
    const defaultContext: ResolverContext = {
      variables: {
        hotelParameters: {
          name: 'The Sterling Executive',
          id: 'hotel-123',
          location: 'New York',
          description: 'Luxury hotel',
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
              mobilePath: '/hotel-123/hero-mobile.webp',
              alt: 'Hotel exterior',
              blurhash: 'L6Pj0^jE',
              width: 1920,
              height: 1080,
            },
          },
        },
      },
    };

    // Deep merge variables if provided
    if (overrides.variables) {
      return {
        ...defaultContext,
        ...overrides,
        variables: {
          ...defaultContext.variables,
          ...overrides.variables,
          hotelParameters: {
            ...defaultContext.variables.hotelParameters,
            ...(overrides.variables.hotelParameters ?? {}),
          },
          custom: {
            ...defaultContext.variables.custom,
            ...(overrides.variables.custom ?? {}),
          },
        },
      };
    }

    return {
      ...defaultContext,
      ...overrides,
    };
  };

  describe('simple object resolution', () => {
    it('should resolve variables in string values', () => {
      const content = {
        title: 'Welcome to {{name}}',
        tagline: 'Located in {{location}}',
      };
      const context = createMockContext();
      const result = resolveContent(content, context);

      expect(result).toEqual({
        title: 'Welcome to The Sterling Executive',
        tagline: 'Located in New York',
      });
    });

    it('should resolve media references to URLs', () => {
      const content = {
        hero: {
          headline: 'Welcome',
          backgroundImage: '@media:homepage.hero',
        },
      };
      const context = createMockContext();
      const result = resolveContent(content, context);

      expect(result).toEqual({
        hero: {
          headline: 'Welcome',
          backgroundImage: 'https://cdn.example.com/hotel-123/hero.webp',
        },
      });
    });

    it('should preserve non-string values', () => {
      const content = {
        count: 42,
        active: true,
        rating: 4.5,
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        count: 42,
        active: true,
        rating: 4.5,
      });
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

    it('should return empty object for empty input', () => {
      const result = resolveContent({}, createMockContext());
      expect(result).toEqual({});
    });
  });

  describe('nested object resolution', () => {
    it('should resolve variables in nested objects', () => {
      const content = {
        meta: {
          title: '{{name}} | {{location}}',
        },
      };
      const context = createMockContext();
      const result = resolveContent(content, context);

      expect(result).toEqual({
        meta: {
          title: 'The Sterling Executive | New York',
        },
      });
    });

    it('should resolve variables at multiple nesting levels', () => {
      const content = {
        level1: {
          level2: {
            value: '{{location}}',
          },
        },
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        level1: {
          level2: {
            value: 'New York',
          },
        },
      });
    });

    it('should mix variables and media refs in nested objects', () => {
      const content = {
        sections: {
          hero: {
            title: '{{name}}',
            image: '@media:homepage.hero',
          },
        },
      };
      const context = createMockContext();
      const result = resolveContent(content, context);

      expect(result).toEqual({
        sections: {
          hero: {
            title: 'The Sterling Executive',
            image: 'https://cdn.example.com/hotel-123/hero.webp',
          },
        },
      });
    });
  });

  describe('array resolution', () => {
    it('should resolve arrays of primitives', () => {
      const content = {
        tags: ['{{location}}', 'Luxury', 'Hotel'],
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        tags: ['New York', 'Luxury', 'Hotel'],
      });
    });

    it('should resolve arrays of objects', () => {
      const content = {
        items: [
          { title: '{{name}}', value: 'first' },
          { title: '{{location}}', value: 'second' },
        ],
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        items: [
          { title: 'The Sterling Executive', value: 'first' },
          { title: 'New York', value: 'second' },
        ],
      });
    });

    it('should resolve nested arrays', () => {
      const content = {
        sections: [
          {
            title: '{{name}}',
            tags: ['{{location}}', '{{currency}}'],
          },
        ],
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        sections: [
          {
            title: 'The Sterling Executive',
            tags: ['New York', 'USD'],
          },
        ],
      });
    });

    it('should handle empty arrays', () => {
      const content = {
        items: [],
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        items: [],
      });
    });

    it('should handle arrays with null values', () => {
      const content = {
        items: [null, undefined, 'static'],
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        items: [null, undefined, 'static'],
      });
    });
  });

  describe('mixed content resolution', () => {
    it('should resolve complex real-world content structure', () => {
      const content = {
        hero: {
          headline: 'Welcome to {{name}}',
          subheading: 'Located in {{address.city}}, {{address.country}}',
          primaryCTA: { text: 'Book Now', href: '/booking' },
          secondaryCTA: { text: 'View Rooms', href: '/rooms' },
          backgroundImage: '@media:homepage.hero',
        },
        meta: {
          title: '{{name}} | {{location}}',
          description: 'Experience {{name}} in {{address.city}}',
          ogImage: '@media:homepage.hero',
        },
        sections: {
          amenities: {
            heading: 'World-Class Amenities',
            subheading: 'Everything you need',
          },
          testimonials: {
            heading: 'Guest Reviews',
          },
        },
        footer: {
          copyright: '© {{currentYear}} {{name}}. All rights reserved.',
        },
      };
      const context = createMockContext();
      const result = resolveContent(content, context);
      const year = new Date().getFullYear();

      expect(result).toEqual({
        hero: {
          headline: 'Welcome to The Sterling Executive',
          subheading: 'Located in New York, USA',
          primaryCTA: { text: 'Book Now', href: '/booking' },
          secondaryCTA: { text: 'View Rooms', href: '/rooms' },
          backgroundImage: 'https://cdn.example.com/hotel-123/hero.webp',
        },
        meta: {
          title: 'The Sterling Executive | New York',
          description: 'Experience The Sterling Executive in New York',
          ogImage: 'https://cdn.example.com/hotel-123/hero.webp',
        },
        sections: {
          amenities: {
            heading: 'World-Class Amenities',
            subheading: 'Everything you need',
          },
          testimonials: {
            heading: 'Guest Reviews',
          },
        },
        footer: {
          copyright: `© ${year} The Sterling Executive. All rights reserved.`,
        },
      });
    });
  });

  describe('missing variable handling', () => {
    it('should handle missing variables gracefully with empty fallback', () => {
      const content = {
        title: '{{missing}}',
      };
      const context = createMockContext();
      const result = resolveContent(content, context, { missing: 'empty' });

      expect(result).toEqual({
        title: '',
      });
    });

    it('should use [MISSING: varName] in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';

      try {
        const content = {
          title: '{{missing}}',
        };
        const context = createMockContext();
        const result = resolveContent(content, context);

        expect(result).toEqual({
          title: '[MISSING: missing]',
        });
      } finally {
        (process.env as any).NODE_ENV = originalEnv;
      }
    });

    it('should handle missing media references', () => {
      const content = {
        image: '@media:homepage.missing',
      };
      const context = createMockContext();
      const result = resolveContent(content, context);

      // Missing media refs return the original string (no resolution possible)
      expect(result).toEqual({
        image: '@media:homepage.missing',
      });
    });
  });

  describe('custom variables', () => {
    it('should resolve custom variables', () => {
      const content = {
        promo: '{{promoCode}}',
      };
      const context = createMockContext({
        variables: {
          hotelParameters: { name: 'Test', id: 'test' },
          custom: { promoCode: 'SAVE20' },
        },
      });
      const result = resolveContent(content, context);

      expect(result).toEqual({
        promo: 'SAVE20',
      });
    });

    it('should prioritize custom variables over hotelParameters', () => {
      const content = {
        title: '{{name}}',
      };
      const context = createMockContext({
        variables: {
          hotelParameters: {
            name: 'Hotel Name',
            id: 'test-id',
          },
          custom: { name: 'Custom Name' },
        },
      });
      const result = resolveContent(content, context);

      expect(result).toEqual({
        title: 'Custom Name',
      });
    });
  });

  describe('debug callback', () => {
    it('should call onResolve callback for each resolution', () => {
      const content = {
        hero: {
          title: '{{name}}',
          image: '@media:homepage.hero',
        },
      };
      const resolutions: { path: string; from: string; to: string }[] = [];
      const context = createMockContext();
      context.onResolve = (path, from, to) => {
        resolutions.push({ path, from, to });
      };

      resolveContent(content, context);

      expect(resolutions).toHaveLength(2);
      expect(resolutions[0]).toEqual({
        path: 'hero.title',
        from: '{{name}}',
        to: 'The Sterling Executive',
      });
      expect(resolutions[1]).toEqual({
        path: 'hero.image',
        from: '@media:homepage.hero',
        to: 'https://cdn.example.com/hotel-123/hero.webp',
      });
    });

    it('should not call onResolve for unchanged values', () => {
      const content = {
        static: 'static text',
        number: 42,
      };
      const context = createMockContext();
      const callback = jest.fn();
      context.onResolve = callback;

      resolveContent(content, context);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle circular references (visited set prevents infinite loop)', () => {
      // Create object with circular reference
      const content: Record<string, unknown> = {
        title: '{{name}}',
      };
      content.self = content; // Circular reference

      const context = createMockContext();
      const result = resolveContent(content, context);

      // Should resolve without infinite loop
      expect(result.title).toBe('The Sterling Executive');
      // Circular ref should be the same reference, not a clone
      expect(result.self).toBe(content);
    });

    it('should handle deeply nested structures', () => {
      const content = {
        level1: {
          level2: {
            level3: {
              level4: {
                value: '{{location}}',
              },
            },
          },
        },
      };
      const result = resolveContent(content, createMockContext());

      expect(result.level1.level2.level3.level4.value).toBe('New York');
    });

    it('should handle objects with many keys', () => {
      const content = {
        key1: '{{name}}',
        key2: '{{location}}',
        key3: 'static',
        key4: 42,
        key5: true,
        key6: null,
        key7: { nested: '{{currency}}' },
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        key1: 'The Sterling Executive',
        key2: 'New York',
        key3: 'static',
        key4: 42,
        key5: true,
        key6: null,
        key7: { nested: 'USD' },
      });
    });

    it('should handle strings with only whitespace', () => {
      const content = {
        empty: '',
        spaces: '   ',
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        empty: '',
        spaces: '   ',
      });
    });

    it('should handle special characters in strings', () => {
      const content = {
        special: '!@#$%^&*()',
        unicode: '你好世界 {{name}}',
      };
      const result = resolveContent(content, createMockContext());

      expect(result).toEqual({
        special: '!@#$%^&*()',
        unicode: '你好世界 The Sterling Executive',
      });
    });
  });

  describe('type safety', () => {
    it('should preserve input type', () => {
      interface TestType {
        title: string;
        count: number;
        active: boolean;
        items: Array<{ id: string }>;
      }

      const content: TestType = {
        title: '{{name}}',
        count: 42,
        active: true,
        items: [{ id: '1' }],
      };

      const result = resolveContent(content as unknown as Record<string, unknown>, createMockContext());

      // Type assertion to verify type is preserved
      const typedResult = result as unknown as TestType;
      expect(typedResult.title).toBe('The Sterling Executive');
      expect(typedResult.count).toBe(42);
      expect(typedResult.active).toBe(true);
      expect(typedResult.items).toEqual([{ id: '1' }]);
    });

    it('should handle optional fields', () => {
      interface TestType {
        required: string;
        optional?: string;
        nested?: {
          value?: string;
        };
      }

      const content: TestType = {
        required: '{{name}}',
        optional: '{{location}}',
        nested: {
          value: '{{currency}}',
        },
      };

      const result = resolveContent(content as unknown as Record<string, unknown>, createMockContext()) as unknown as TestType;

      expect(result.required).toBe('The Sterling Executive');
      expect(result.optional).toBe('New York');
      expect(result.nested?.value).toBe('USD');
    });
  });
});

describe('resolveContentAndValidate', () => {
  const createMockContext = (): ResolverContext => ({
    variables: {
      hotelParameters: {
        name: 'Test Hotel',
        id: 'test-123',
      },
    },
    mediaManifest: {
      cdn: { baseUrl: 'https://cdn.example.com' },
      assets: {},
    },
  });

  it('should validate resolved content against schema', () => {
    const content = {
      meta: {
        version: '1.0.0',
        generatedAt: '2026-01-20T00:00:00Z',
        hotelId: 'test-123',
        locale: 'en',
      },
      hero: {
        title: 'Test Hotel',
        headline: 'Test Headline',
      },
    };

    const context = createMockContext();
    const result = resolveContentAndValidate(content, context, HomepageContentSchema);

    expect(result).toBeDefined();
  });

  it('should throw error when validation fails', () => {
    const content = {
      meta: {
        // Missing required fields
        hotelId: 'test-123',
      },
      hero: {
        // Missing required fields
      },
    };

    const context = createMockContext();

    expect(() => {
      resolveContentAndValidate(content, context, HomepageContentSchema);
    }).toThrow();
  });

  it('should propagate validation errors', () => {
    const content = {
      meta: {
        version: '1.0.0',
        generatedAt: '2026-01-20T00:00:00Z',
        hotelId: 'test-123',
        locale: 'en',
      },
      hero: {
        title: 'x'.repeat(200), // Too long (max is 100)
        headline: 'Test',
      },
    };

    const context = createMockContext();

    expect(() => {
      resolveContentAndValidate(content, context, HomepageContentSchema);
    }).toThrow();
  });
});
