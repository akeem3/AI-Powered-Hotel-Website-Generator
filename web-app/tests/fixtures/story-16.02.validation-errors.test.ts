/**
 * Unit Tests - Validation Error Handling
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.02
 * @trace reqs: AC6
 *
 * Why: Tests that unknown component types or invalid variants in fixtures
 * trigger validation errors. Verifies that the system properly rejects
 * invalid configurations and provides helpful error messages.
 *
 * Coverage:
 * - AC6: Unknown component types trigger validation errors
 * - AC6: Invalid variants trigger validation errors
 * - Invalid fixture files are rejected
 * - Error messages are helpful for debugging
 */

import { HomepageConfigSchema } from '@/app/langgraph/agents/schemas';
import { transformProps, filterSafeVariant } from '@/lib/propsTransformation';
import { COMPONENT_MAP } from '@/components/renderers/componentMap';

describe('Story 16.02 - Validation Error Handling (AC6)', () => {
  describe('Unknown component types trigger errors', () => {
    const validBaseConfig = {
      generationId: 'test-v1',
      timestamp: '2026-02-18T00:00:00.000Z',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris',
      },
      components: [],
      layoutStructure: 'single-column' as const,
      emphasisComponents: [],
      validationStatus: 'PASS' as const,
    };

    it('should reject unknown component type', () => {
      const invalidConfig = {
        ...validBaseConfig,
        components: [
          {
            type: 'unknown-component',
            variant: {},
            props: {},
            order: 0,
          },
        ],
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Error message lists valid options, doesn't include the invalid value
        expect(result.error.issues[0].message).toContain('Invalid option');
        expect(result.error.issues[0].message).toContain('expected one of');
      }
    });

    it('should reject component with invalid type (typo)', () => {
      const invalidConfig = {
        ...validBaseConfig,
        components: [
          {
            type: 'her0', // Typo of 'hero'
            variant: {},
            props: {},
            order: 0,
          },
        ],
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    it('should reject component with case-sensitive type mismatch', () => {
      const invalidConfig = {
        ...validBaseConfig,
        components: [
          {
            type: 'HERO', // Should be lowercase 'hero'
            variant: {},
            props: {},
            order: 0,
          },
        ],
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    it('should reject multiple unknown component types', () => {
      const invalidConfig = {
        ...validBaseConfig,
        components: [
          {
            type: 'unknown-1',
            variant: {},
            props: {},
            order: 0,
          },
          {
            type: 'unknown-2',
            variant: {},
            props: {},
            order: 1,
          },
        ],
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod stops at first error, so we just verify it fails
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Invalid variant values trigger errors', () => {
    it('should reject variant with non-primitive values', () => {
      const variantWithObject = {
        style: 'modern',
        nested: { // This should be filtered out
          deep: 'value',
        },
      };

      const result = filterSafeVariant(variantWithObject);

      // Non-primitive values should be filtered out
      expect(result).not.toEqual(variantWithObject);
      expect(result.nested).toBeUndefined();
    });

    it('should reject variant with dangerous keys', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const dangerousVariant = {
        style: 'modern',
        __proto__: { admin: true }, // Should be blocked
        constructor: { hack: true }, // Should be blocked
      };

      const result = filterSafeVariant(dangerousVariant);

      // Dangerous keys should be filtered out, result contains only safe keys
      expect(result).toBeDefined();
      expect(result.style).toBe('modern');

      // Verify security logging was called
      expect(consoleSpy).toHaveBeenCalled();
      const firstCallArgs = consoleSpy.mock.calls[0];
      expect(firstCallArgs[0]).toContain('[Security] BLOCKED dangerous variant key:');

      consoleSpy.mockRestore();
    });

    it('should reject variant with array values', () => {
      const variantWithArray = {
        style: 'modern',
        colors: ['red', 'blue'], // Arrays should be filtered
      };

      const result = filterSafeVariant(variantWithArray);

      // Array values should be filtered out
      expect(result.colors).toBeUndefined();
      expect(result.style).toBe('modern');
    });

    it('should reject variant with function values', () => {
      const variantWithFunction = {
        style: 'modern',
        onClick: () => {}, // Functions should be filtered
      };

      const result = filterSafeVariant(variantWithFunction);

      // Function values should be filtered out
      expect(result.onClick).toBeUndefined();
    });
  });

  describe('Invalid component count triggers errors', () => {
    const validBaseConfig = {
      generationId: 'test-v1',
      timestamp: '2026-02-18T00:00:00.000Z',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris',
      },
      layoutStructure: 'single-column' as const,
      emphasisComponents: [],
      validationStatus: 'PASS' as const,
    };

    it('should reject config with fewer than 5 components', () => {
      const invalidConfig = {
        ...validBaseConfig,
        components: [
          { type: 'hero' as const, variant: {}, props: {}, order: 0 },
          { type: 'navigation' as const, variant: {}, props: {}, order: 1 },
          { type: 'contact' as const, variant: {}, props: {}, order: 2 },
        ], // Only 3 components
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('5');
      }
    });

    it('should reject config with more than 12 components', () => {
      const invalidConfig = {
        ...validBaseConfig,
        components: [
          { type: 'navigation' as const, variant: {}, props: {}, order: 0 },
          { type: 'hero' as const, variant: {}, props: {}, order: 1 },
          { type: 'rooms' as const, variant: {}, props: {}, order: 2 },
          { type: 'gallery' as const, variant: {}, props: {}, order: 3 },
          { type: 'testimonials' as const, variant: {}, props: {}, order: 4 },
          { type: 'amenities' as const, variant: {}, props: {}, order: 5 },
          { type: 'booking' as const, variant: {}, props: {}, order: 6 },
          { type: 'contact' as const, variant: {}, props: {}, order: 7 },
          { type: 'about' as const, variant: {}, props: {}, order: 8 },
          { type: 'faq' as const, variant: {}, props: {}, order: 9 },
          { type: 'features' as const, variant: {}, props: {}, order: 10 },
          { type: 'footer' as const, variant: {}, props: {}, order: 11 },
          { type: 'hero' as const, variant: {}, props: {}, order: 12 }, // 13th component - exceeds max of 12
        ],
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('12');
      }
    });
  });

  describe('Invalid generationId format triggers errors', () => {
    const validBaseConfig = {
      timestamp: '2026-02-18T00:00:00.000Z',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris',
      },
      components: [
        { type: 'hero' as const, variant: {}, props: {}, order: 0 },
        { type: 'navigation' as const, variant: {}, props: {}, order: 1 },
        { type: 'contact' as const, variant: {}, props: {}, order: 2 },
        { type: 'rooms' as const, variant: {}, props: {}, order: 3 },
        { type: 'amenities' as const, variant: {}, props: {}, order: 4 },
      ],
      layoutStructure: 'single-column' as const,
      emphasisComponents: [],
      validationStatus: 'PASS' as const,
    };

    it('should reject generationId without version suffix', () => {
      const invalidConfig = {
        ...validBaseConfig,
        generationId: 'luxury-boutique', // Missing -v1 suffix
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    it('should reject generationId with invalid characters', () => {
      const invalidConfig = {
        ...validBaseConfig,
        generationId: 'luxury.boutique-v1', // Has dot instead of hyphen
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    it('should reject generationId with uppercase letters', () => {
      const invalidConfig = {
        ...validBaseConfig,
        generationId: 'Luxury-Boutique-V1', // Has uppercase
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    it('should reject generationId without hyphen separator', () => {
      const invalidConfig = {
        ...validBaseConfig,
        generationId: 'luxuryboutiquev1', // Missing hyphen before v1
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });

    it('should accept generationId starting with numbers', () => {
      const validConfig = {
        ...validBaseConfig,
        generationId: '1-hotel-south-beach-v1', // Hotel names starting with numbers (Story 22.2 fix)
      };

      const result = HomepageConfigSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
    });

    it('should accept generationId with numbers in prefix', () => {
      const validConfig = {
        ...validBaseConfig,
        generationId: '21c-museum-hotel-nashville-v1', // Hotel names with numbers (Story 22.2 fix)
      };

      const result = HomepageConfigSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
    });
  });

  describe('Invalid layoutStructure triggers errors', () => {
    const validBaseConfig = {
      generationId: 'test-v1',
      timestamp: '2026-02-18T00:00:00.000Z',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris',
      },
      components: [
        { type: 'hero' as const, variant: {}, props: {}, order: 0 },
        { type: 'navigation' as const, variant: {}, props: {}, order: 1 },
        { type: 'contact' as const, variant: {}, props: {}, order: 2 },
        { type: 'rooms' as const, variant: {}, props: {}, order: 3 },
        { type: 'amenities' as const, variant: {}, props: {}, order: 4 },
      ],
      emphasisComponents: [],
      validationStatus: 'PASS' as const,
    };

    it('should reject invalid layoutStructure value', () => {
      const invalidConfig = {
        ...validBaseConfig,
        layoutStructure: 'invalid-layout' as any,
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('single-column');
        expect(result.error.issues[0].message).toContain('grid');
        expect(result.error.issues[0].message).toContain('mixed');
      }
    });

    it('should reject layoutStructure with wrong case', () => {
      const invalidConfig = {
        ...validBaseConfig,
        layoutStructure: 'Single-Column' as any, // Should be lowercase
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });
  });

  describe('Invalid validationStatus triggers errors', () => {
    const validBaseConfig = {
      generationId: 'test-v1',
      timestamp: '2026-02-18T00:00:00.000Z',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris',
      },
      components: [
        { type: 'hero' as const, variant: {}, props: {}, order: 0 },
        { type: 'navigation' as const, variant: {}, props: {}, order: 1 },
        { type: 'contact' as const, variant: {}, props: {}, order: 2 },
        { type: 'rooms' as const, variant: {}, props: {}, order: 3 },
        { type: 'amenities' as const, variant: {}, props: {}, order: 4 },
      ],
      layoutStructure: 'single-column' as const,
      emphasisComponents: [],
    };

    it('should reject invalid validationStatus value', () => {
      const invalidConfig = {
        ...validBaseConfig,
        validationStatus: 'INVALID' as any,
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('PASS');
        expect(result.error.issues[0].message).toContain('WARNING');
        expect(result.error.issues[0].message).toContain('FAIL');
      }
    });
  });

  describe('Missing required fields trigger errors', () => {
    it('should reject config without generationId', () => {
      const invalidConfig = {
        timestamp: '2026-02-18T00:00:00.000Z',
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'Test Hotel',
          location: 'Paris',
        },
        components: [],
        layoutStructure: 'single-column' as const,
        emphasisComponents: [],
        validationStatus: 'PASS' as const,
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('generationId');
      }
    });

    it('should reject config without timestamp', () => {
      const invalidConfig = {
        generationId: 'test-v1',
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'Test Hotel',
          location: 'Paris',
        },
        components: [],
        layoutStructure: 'single-column' as const,
        emphasisComponents: [],
        validationStatus: 'PASS' as const,
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('timestamp');
      }
    });

    it('should reject config without hotelParameters', () => {
      const invalidConfig = {
        generationId: 'test-v1',
        timestamp: '2026-02-18T00:00:00.000Z',
        components: [],
        layoutStructure: 'single-column' as const,
        emphasisComponents: [],
        validationStatus: 'PASS' as const,
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('hotelParameters');
      }
    });
  });

  describe('Component order validation', () => {
    const validBaseConfig = {
      generationId: 'test-v1',
      timestamp: '2026-02-18T00:00:00.000Z',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris',
      },
      components: [],
      layoutStructure: 'single-column' as const,
      emphasisComponents: [],
      validationStatus: 'PASS' as const,
    };

    it('should reject component with negative order', () => {
      const invalidConfig = {
        ...validBaseConfig,
        components: [
          { type: 'hero' as const, variant: {}, props: {}, order: -1 },
        ],
      };

      const result = HomepageConfigSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });
  });

  describe('Props transformation error handling', () => {
    it('should throw on undefined props (current behavior)', () => {
      // Current implementation throws TypeError on undefined
      expect(() => {
        transformProps('hero', undefined);
      }).toThrow(TypeError);
    });

    it('should throw on null props (current behavior)', () => {
      // Current implementation throws TypeError on null
      expect(() => {
        transformProps('hero', null);
      }).toThrow(TypeError);
    });

    it('should handle empty props object', () => {
      expect(() => {
        const result = transformProps('hero', {});
        expect(result).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('Component mapping errors', () => {
    it('should return undefined for unknown component type', () => {
      const unknownComponent = COMPONENT_MAP['unknown-type' as keyof typeof COMPONENT_MAP];
      expect(unknownComponent).toBeUndefined();
    });

    it('should have mapping for all valid component types', () => {
      const validTypes = ['hero', 'navigation', 'rooms', 'gallery', 'testimonials', 'amenities', 'booking', 'contact'];

      validTypes.forEach((type) => {
        const Component = COMPONENT_MAP[type as keyof typeof COMPONENT_MAP];
        expect(Component).toBeDefined();
      });
    });
  });
});
