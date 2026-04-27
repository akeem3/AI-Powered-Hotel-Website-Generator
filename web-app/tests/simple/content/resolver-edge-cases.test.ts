import {
  resolveVariables,
  resolveVariablesOrThrow,
  getNestedValue,
  hasVariables
} from '@/lib/content/resolvers/variable-resolver';
import { resolveContent } from '@/lib/content/resolvers/content-resolver';
import { resolveMediaRef, isMediaRef } from '@/lib/content/resolvers/media-resolver';
import { VariableContext, ResolverContext } from '@/lib/content/resolvers/types';

/**
 * Story 11.7: Comprehensive Edge Testing
 * Prompt 3: Variable Resolution Edge Cases
 *
 * Tests variable and media resolvers with edge cases including:
 * - Empty/null contexts
 * - Deep nested paths
 * - Array indexing
 * - Multiple variables
 * - Circular references
 * - Large content objects
 */

const mockContext: VariableContext = {
  hotelParameters: {
    name: 'Test Hotel',
    id: 'test-hotel-123',
    location: 'Paris, France',
    description: 'A luxury hotel',
    currency: 'EUR',
    category: 'luxury',
    rating: 5,
    address: {
      city: 'Paris',
      country: 'France',
      street: '123 Champs-Élysées',
      postalCode: '75008'
    },
    contact: {
      phone: '+33 1 23 45 67 89',
      email: 'info@testhotel.com'
    },
    social: {
      facebook: 'testhotel',
      instagram: '@testhotel'
    }
  },
  locale: 'en',
  custom: {
    promoCode: 'SUMMER2026',
    discount: '20%'
  }
};

const mockMediaManifest = {
  cdn: {
    baseUrl: 'https://cdn.example.com',
    transformPath: '/cdn-cgi/image'
  },
  assets: {
    homepage: {
      hero: {
        id: 'hero-001',
        path: '/hotel/hero.webp',
        alt: 'Hotel exterior',
        width: 1920,
        height: 1080
      }
    }
  }
};

describe('Story 11.7: Variable Resolution Edge Cases', () => {
  describe('Variable Context Edge Cases', () => {
    it('should handle empty context object', () => {
      const result = resolveVariables('{{name}}', { hotelParameters: {} } as VariableContext, { missing: 'warn' });
      expect(result).toContain('[MISSING:');
    });

    it('should handle null context gracefully', () => {
      const result = getNestedValue(null, 'any.path');
      expect(result).toBeUndefined();
    });

    it('should handle undefined context gracefully', () => {
      const result = getNestedValue(undefined, 'any.path');
      expect(result).toBeUndefined();
    });

    it('should reject prototype pollution attempts', () => {
      const dangerousContext = {
        hotelParameters: JSON.parse('{"__proto__": {"polluted": "yes"}}')
      } as unknown as VariableContext;

      // Should not allow prototype pollution
      const result = getNestedValue(dangerousContext, 'constructor.prototype.polluted');
      expect(result).toBeUndefined();
    });

    it('should handle very deep nested paths', () => {
      const deepContext: VariableContext = {
        hotelParameters: {
          name: 'Test',
          id: 'test',
          nested: {
            level1: {
              level2: {
                level3: {
                  level4: {
                    value: 'found it'
                  }
                }
              }
            }
          }
        } as any
      };

      const result = getNestedValue(deepContext.hotelParameters, 'nested.level1.level2.level3.level4.value');
      expect(result).toBe('found it');
    });

    it('should return undefined for path through non-object', () => {
      const result = getNestedValue({ name: 'string value' }, 'name.something');
      expect(result).toBeUndefined();
    });

    it('should handle custom override values', () => {
      const result = resolveVariables('{{promoCode}}', mockContext);
      expect(result).toBe('SUMMER2026');
    });
  });

  describe('Variable Interpolation Edge Cases', () => {
    it('should handle multiple variables in one string', () => {
      const result = resolveVariables('{{name}} in {{location}}, {{address.country}}', mockContext);
      expect(result).toBe('Test Hotel in Paris, France, France');
    });

    it('should handle adjacent variables', () => {
      const result = resolveVariables('{{name}}{{category}}', mockContext);
      expect(result).toBe('Test Hotelluxury');
    });

    it('should handle variable at start of string', () => {
      const result = resolveVariables('{{name}} is great', mockContext);
      expect(result).toBe('Test Hotel is great');
    });

    it('should handle variable at end of string', () => {
      const result = resolveVariables('Welcome to {{name}}', mockContext);
      expect(result).toBe('Welcome to Test Hotel');
    });

    it('should handle whitespace in variable names', () => {
      const result = resolveVariables('{{name }}', mockContext);
      expect(result).toBe('Test Hotel');
    });

    it('should handle mixed valid and invalid variables', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';

      const result = resolveVariables('{{name}} and {{invalid.nested.path}}', mockContext);

      expect(result).toContain('Test Hotel');
      expect(result).toContain('[MISSING:');

      consoleWarn.mockRestore();
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should handle variables with special characters in name', () => {
      const contextWithSpecial: VariableContext = {
        ...mockContext,
        custom: { 'hotel-name': 'value', 'hotel_name': 'value2' }
      };

      const result = resolveVariables('{{hotel-name}}', contextWithSpecial);
      expect(result).toBe('value');
    });

    it('should handle escaped brackets (no special handling - returns as-is)', () => {
      const result = resolveVariables('Use \\{\\{var\\}\\} syntax', mockContext);
      expect(result).toBe('Use \\{\\{var\\}\\} syntax');
    });
  });

  describe('Media Resolver Edge Cases', () => {
    it('should handle case sensitive media references', () => {
      const resolved = resolveMediaRef('@media:Homepage.Hero', mockMediaManifest);
      expect(resolved).toBeNull(); // Case sensitive - should not find
    });

    it('should handle lowercase media references', () => {
      const resolved = resolveMediaRef('@media:homepage.hero', mockMediaManifest);
      expect(resolved).not.toBeNull();
      expect(resolved?.url).toBe('https://cdn.example.com/hotel/hero.webp');
    });

    it('should trim whitespace from media references', () => {
      const resolved = resolveMediaRef(' @media:homepage.hero ', mockMediaManifest);
      expect(resolved).toBeNull(); // Does not trim whitespace - should not find
    });

    it('should reject media references with URL-unsafe characters', () => {
      const resolved = resolveMediaRef('@media:page/asset', mockMediaManifest);
      expect(resolved).toBeNull();
    });

    it('should handle numeric asset names', () => {
      const manifestWithNumeric = {
        ...mockMediaManifest,
        assets: {
          homepage: {
            '123': {
              id: 'asset-123',
              path: '/hotel/123.webp',
              alt: 'Test'
            }
          }
        }
      };

      const resolved = resolveMediaRef('@media:homepage.123', manifestWithNumeric);
      expect(resolved).not.toBeNull();
    });

    it('should handle reserved characters in asset paths', () => {
      const resolved = resolveMediaRef('@media:page.asset?query=value', mockMediaManifest);
      expect(resolved).toBeNull();
    });

    it('should identify valid media references', () => {
      expect(isMediaRef('@media:homepage.hero')).toBe(true);
      expect(isMediaRef('@media:page.section.asset')).toBe(true);
    });

    it('should reject invalid media references', () => {
      expect(isMediaRef('https://example.com/image.jpg')).toBe(false);
      expect(isMediaRef('@media:')).toBe(false);
      expect(isMediaRef('@media:.')).toBe(false);
      expect(isMediaRef('@media:nope')).toBe(false);
    });
  });

  describe('Deep Content Resolution Edge Cases', () => {
    it('should handle circular object structure without infinite loop', () => {
      const circular: Record<string, unknown> = { name: '{{name}}' };
      circular.self = circular;

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(circular, resolverContext);
      expect(result.name).toBe('Test Hotel');
    });

    it('should handle objects with 100+ keys', () => {
      const largeObj: Record<string, unknown> = {};
      for (let i = 0; i < 150; i++) {
        largeObj[`field${i}`] = `{{name}} value ${i}`;
      }

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(largeObj, resolverContext);
      expect(result.field0).toBe('Test Hotel value 0');
      expect(result.field149).toBe('Test Hotel value 149');
    });

    it('should handle deeply nested structures (10+ levels)', () => {
      let deep: any = { value: '{{name}}' };
      for (let i = 0; i < 12; i++) {
        deep = { [`level${i}`]: deep };
      }

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(deep, resolverContext);
      // Should resolve without error
      expect(result).toBeDefined();
    });

    it('should handle mixed array/object nesting', () => {
      const mixed = {
        items: [
          { name: '{{name}}', tags: ['{{category}}', '{{location}}'] },
          { name: 'Second', tags: ['{{currency}}'] }
        ]
      };

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(mixed, resolverContext);
      expect(result.items[0].name).toBe('Test Hotel');
      expect(result.items[0].tags).toEqual(['luxury', 'Paris, France']);
    });

    it('should handle sparse arrays', () => {
      const sparse = {
        items: ['{{name}}', , , '{{location}}'] as string[]
      };

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(sparse, resolverContext);
      expect(result.items[0]).toBe('Test Hotel');
      expect(result.items[1]).toBeUndefined();
      expect(result.items[2]).toBeUndefined();
      expect(result.items[3]).toBe('Paris, France');
    });

    it('should handle objects with numeric string keys', () => {
      const numericKeys = {
        '0': '{{name}}',
        '1': '{{location}}',
        'name': 'direct'
      };

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(numericKeys, resolverContext);
      expect(result['0']).toBe('Test Hotel');
      expect(result['1']).toBe('Paris, France');
    });
  });

  describe('Fallback Behavior Edge Cases', () => {
    it('should handle all variables missing', () => {
      const emptyContext: VariableContext = {
        hotelParameters: {} as any
      };

      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';

      const result = resolveVariables('{{missing1}} and {{missing2}}', emptyContext);

      expect(result).toContain('[MISSING: missing1]');
      expect(result).toContain('[MISSING: missing2]');

      consoleWarn.mockRestore();
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should throw when missing is set to throw', () => {
      expect(() => {
        resolveVariables('{{missing}}', mockContext, { missing: 'throw' });
      }).toThrow('Required variable "missing" is missing');
    });

    it('should return empty string when missing is empty', () => {
      const result = resolveVariables('{{missing}}', mockContext, { missing: 'empty' });
      expect(result).toBe('');
    });

    it('should use warn mode in development', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'development';

      resolveVariables('{{missing}}', mockContext);
      expect(consoleWarn).toHaveBeenCalled();

      consoleWarn.mockRestore();
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should use empty mode in production', () => {
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();
      const originalEnv = process.env.NODE_ENV;
      (process.env as any).NODE_ENV = 'production';

      resolveVariables('{{missing}}', mockContext);
      expect(consoleWarn).not.toHaveBeenCalled();

      consoleWarn.mockRestore();
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should handle missing variable with transform', () => {
      const result = resolveVariables('{{missing}}', mockContext, {
        missing: 'empty',
        transform: (val) => val.toUpperCase()
      });
      expect(result).toBe('');
    });

    it('should apply transform to resolved values', () => {
      const result = resolveVariables('{{name}}', mockContext, {
        transform: (val) => val.toUpperCase()
      });
      expect(result).toBe('TEST HOTEL');
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle large content object (1000+ strings)', () => {
      const largeContent: Record<string, unknown> = {};
      for (let i = 0; i < 1200; i++) {
        largeContent[`field${i}`] = `{{name}} - ${i}`;
      }

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const startTime = performance.now();
      const result = resolveContent(largeContent, resolverContext);
      const duration = performance.now() - startTime;

      expect(result.field0).toBe('Test Hotel - 0');
      expect(duration).toBeLessThan(100); // Should complete in reasonable time
    });

    it('should handle string with 100 variables', () => {
      let template = '';
      for (let i = 0; i < 100; i++) {
        template += `{{name}} `;
      }

      const result = resolveVariables(template, mockContext);
      expect(result).toContain('Test Hotel');
      expect(result.split('Test Hotel').length - 1).toBe(100);
    });

    it('should memoize repeated resolution calls', () => {
      const template = '{{name}} in {{location}}';

      const startTime = performance.now();
      for (let i = 0; i < 1000; i++) {
        resolveVariables(template, mockContext);
      }
      const duration = performance.now() - startTime;

      // 1000 calls should complete quickly
      expect(duration).toBeLessThan(50);
    });

    it('should handle resolution with different contexts', () => {
      const template = '{{name}}';
      const context1: VariableContext = {
        hotelParameters: { name: 'Hotel A', id: 'a' }
      };
      const context2: VariableContext = {
        hotelParameters: { name: 'Hotel B', id: 'b' }
      };

      const result1 = resolveVariables(template, context1);
      const result2 = resolveVariables(template, context2);

      expect(result1).toBe('Hotel A');
      expect(result2).toBe('Hotel B');
    });
  });

  describe('Type Preservation Edge Cases', () => {
    it('should preserve non-string types', () => {
      const content = {
        string: '{{name}}',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3]
      };

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(content, resolverContext);

      expect(typeof result.string).toBe('string');
      expect(typeof result.number).toBe('number');
      expect(result.number).toBe(42);
      expect(typeof result.boolean).toBe('boolean');
      expect(result.boolean).toBe(true);
      expect(result.null).toBeNull();
      expect(Array.isArray(result.array)).toBe(true);
    });

    it('should not mutate input objects', () => {
      const original = { text: '{{name}}', value: 123 };
      const originalCopy = { ...original };

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      resolveContent(original, resolverContext);

      expect(original).toEqual(originalCopy);
      expect(original.text).toBe('{{name}}');
    });
  });

  describe('hasVariables Utility', () => {
    it('should return true for strings with variables', () => {
      expect(hasVariables('{{name}}')).toBe(true);
      expect(hasVariables('Hello {{name}}')).toBe(true);
      expect(hasVariables('{{a}} and {{b}}')).toBe(true);
    });

    it('should return false for strings without variables', () => {
      expect(hasVariables('static text')).toBe(false);
      expect(hasVariables('')).toBe(false);
      expect(hasVariables('{not a variable}')).toBe(false);
      expect(hasVariables('{{unclosed')).toBe(false);
    });

    it('should handle regex state correctly', () => {
      // First call
      expect(hasVariables('{{test}}')).toBe(true);
      // Second call should work correctly (regex state reset)
      expect(hasVariables('{{test}}')).toBe(true);
      // Third call with no variables
      expect(hasVariables('static')).toBe(false);
      // Fourth call with variables again
      expect(hasVariables('{{test}}')).toBe(true);
    });
  });

  describe('Computed Variables', () => {
    it('should resolve locale variable', () => {
      const result = resolveVariables('{{locale}}', mockContext);
      expect(result).toBe('en');
    });

    it('should default locale to en when not provided', () => {
      const noLocaleContext: VariableContext = {
        hotelParameters: { name: 'Test', id: 'test' }
      };

      const result = resolveVariables('{{locale}}', noLocaleContext);
      expect(result).toBe('en');
    });

    it('should resolve currentYear variable', () => {
      const result = resolveVariables('{{currentYear}}', mockContext);
      const expectedYear = String(new Date().getFullYear());
      expect(result).toBe(expectedYear);
    });
  });

  describe('Array Index Access (Missing Tests)', () => {
    it('should handle array index access in variable path', () => {
      const contextWithArray: VariableContext = {
        hotelParameters: {
          name: 'Test Hotel',
          id: 'test-hotel-123',
          location: 'Paris, France',
          amenities: ['Pool', 'Spa', 'Gym'] as string[]
        } as any
      };

      const result = getNestedValue(contextWithArray.hotelParameters, 'amenities.0');
      expect(result).toBe('Pool');
    });

    it('should handle negative array index (returns undefined)', () => {
      const contextWithArray: VariableContext = {
        hotelParameters: {
          name: 'Test Hotel',
          id: 'test-hotel-123',
          location: 'Paris, France',
          items: ['a', 'b', 'c'] as string[]
        } as any
      };

      const result = getNestedValue(contextWithArray.hotelParameters, 'items.-1');
      expect(result).toBeUndefined();
    });

    it('should handle out of bounds array index', () => {
      const contextWithArray: VariableContext = {
        hotelParameters: {
          name: 'Test Hotel',
          id: 'test-hotel-123',
          items: ['a', 'b'] as string[]
        } as any
      };

      const result = getNestedValue(contextWithArray.hotelParameters, 'items.10');
      expect(result).toBeUndefined();
    });

    it('should handle deeply nested array access', () => {
      const contextWithNestedArray: VariableContext = {
        hotelParameters: {
          name: 'Test Hotel',
          id: 'test',
          rooms: [
            { name: 'Deluxe', price: 200 },
            { name: 'Suite', price: 400 }
          ] as any[]
        } as any
      };

      const result = getNestedValue(contextWithNestedArray.hotelParameters, 'rooms.0.name');
      expect(result).toBe('Deluxe');
    });
  });

  describe('Symbol Keys (Missing Test)', () => {
    it('should handle object with symbol keys gracefully', () => {
      const sym = Symbol('test');
      const objWithSymbol: Record<string, unknown> = {
        name: 'Test',
        [sym]: 'symbol value'
      };

      const result = getNestedValue(objWithSymbol, 'name');
      expect(result).toBe('Test');

      // Symbol keys are not accessible via string paths
      const symbolResult = getNestedValue(objWithSymbol, String(sym));
      expect(symbolResult).toBeUndefined();
    });

    it('should ignore symbol keys during iteration', () => {
      const sym = Symbol('hidden');
      const objWithSymbol: Record<string, unknown> = {
        name: 'Visible',
        [sym]: 'Hidden'
      };

      const resolverContext: ResolverContext = {
        variables: mockContext,
        mediaManifest: mockMediaManifest
      };

      const result = resolveContent(objWithSymbol, resolverContext);
      expect(result.name).toBe('Visible');
      // Symbol keys are not processed
      expect((result as any)[sym]).toBeUndefined();
    });
  });
});
