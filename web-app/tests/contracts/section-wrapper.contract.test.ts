/**
 * SectionWrapperContract Validation Tests - Story 18.5
 *
 * Tests for Zod validation of the SectionWrapperContract schema.
 * Validates all wrapper styles, field constraints, and error cases.
 *
 * @trace epic: EPIC-18
 * @trace story: STORY-18.5
 */

import { SectionWrapperContract, type SectionWrapperConfig } from '@/lib/contracts/section-wrapper.contract';
import { HomepageConfigSchema } from '@/app/langgraph/agents/schemas';

describe('SectionWrapperContract - Zod Validation', () => {
  describe('Valid wrapper configurations', () => {
    it('should validate wrapper with style="accent"', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'Test Title',
        description: 'Test Description'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.style).toBe('accent');
        expect(result.data.title).toBe('Test Title');
        expect(result.data.description).toBe('Test Description');
      }
    });

    it('should validate wrapper with style="simple"', () => {
      const wrapper = {
        style: 'simple' as const,
        title: 'Simple Title'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.style).toBe('simple');
        expect(result.data.title).toBe('Simple Title');
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should validate wrapper with style="numbered"', () => {
      const wrapper = {
        style: 'numbered' as const,
        title: '01. Numbered Title',
        description: 'Numbered description'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.style).toBe('numbered');
        expect(result.data.title).toBe('01. Numbered Title');
      }
    });

    it('should validate wrapper with style="none" (no title required)', () => {
      const wrapper = {
        style: 'none' as const
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.style).toBe('none');
        expect(result.data.title).toBeUndefined();
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should validate wrapper with title only (no description)', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'Title Only'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Title Only');
        expect(result.data.description).toBeUndefined();
      }
    });
  });

  describe('Title field validation', () => {
    it('should accept title with minimum length (1 character)', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'A'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
    });

    it('should accept title with maximum length (200 characters)', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'A'.repeat(200)
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
    });

    it('should reject title with 0 characters (empty string)', () => {
      const wrapper = {
        style: 'accent' as const,
        title: ''
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(false);
    });

    it('should reject title exceeding 200 characters', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'A'.repeat(201)
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(false);
    });
  });

  describe('Description field validation', () => {
    it('should accept description with maximum length (500 characters)', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'Test',
        description: 'A'.repeat(500)
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(true);
    });

    it('should reject description exceeding 500 characters', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'Test',
        description: 'A'.repeat(501)
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(false);
    });
  });

  describe('Style field validation', () => {
    it('should reject invalid style value', () => {
      const wrapper = {
        style: 'invalid-style',
        title: 'Test'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(false);
    });

    it('should reject numeric style value', () => {
      const wrapper = {
        style: 123,
        title: 'Test'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(false);
    });

    it('should reject null style value', () => {
      const wrapper = {
        style: null,
        title: 'Test'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      expect(result.success).toBe(false);
    });
  });

  describe('Type safety and inference', () => {
    it('should correctly infer SectionWrapperConfig type', () => {
      const wrapper: SectionWrapperConfig = {
        style: 'accent',
        title: 'Test Title',
        description: 'Test Description'
      };

      // Should compile without errors
      expect(wrapper.style).toBe('accent');
      expect(wrapper.title).toBe('Test Title');
    });

    it('should only accept valid style values in typed code', () => {
      // This test verifies TypeScript compilation
      const validStyles: Array<'accent' | 'simple' | 'numbered' | 'none'> = ['accent', 'simple', 'numbered', 'none'];
      expect(validStyles).toHaveLength(4);
    });
  });
});

describe('HomepageConfigSchema - Wrapper Field Integration', () => {
  describe('Backward compatibility', () => {
    it('should validate config without wrapper field (existing fixtures)', () => {
      const config = {
        generationId: 'test-v1',
        timestamp: '2026-02-27T00:00:00Z',
        hotelParameters: {
          hotelType: 'luxury' as const,
          targetAudience: 'couples' as const,
          brandPersonality: 'elegant' as const,
          hotelName: 'Test Hotel',
          location: 'Test Location'
        },
        components: [
          {
            type: 'navigation' as const,
            variant: { style: 'solid' },
            props: {},
            order: 0
            // No wrapper field
          },
          {
            type: 'hero' as const,
            variant: { style: 'modern' },
            props: { title: 'Test', headline: 'Test' },
            order: 1
            // No wrapper field
          },
          {
            type: 'gallery' as const,
            variant: { layout: 'masonry' },
            props: { images: [] },
            order: 2
            // No wrapper field
          },
          {
            type: 'rooms' as const,
            variant: { roomCardStyle: 'detailed' },
            props: { rooms: [] },
            order: 3
            // No wrapper field
          },
          {
            type: 'contact' as const,
            variant: { contactStyle: 'default' },
            props: {},
            order: 4
            // No wrapper field
          }
        ],
        layoutStructure: 'single-column' as const,
        emphasisComponents: [],
        validationStatus: 'PASS' as const
      };

      const result = HomepageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('New wrapper field validation', () => {
    it('should validate config with wrapper field on components', () => {
      const config = {
        generationId: 'test-v2',
        timestamp: '2026-02-27T00:00:00Z',
        hotelParameters: {
          hotelType: 'luxury' as const,
          targetAudience: 'couples' as const,
          brandPersonality: 'elegant' as const,
          hotelName: 'Test Hotel',
          location: 'Test Location'
        },
        components: [
          {
            type: 'navigation' as const,
            variant: { style: 'solid' },
            props: {},
            order: 0,
            wrapper: { style: 'none' }
          },
          {
            type: 'hero' as const,
            variant: { style: 'modern' },
            props: { title: 'Test', headline: 'Test' },
            order: 1,
            wrapper: { style: 'none' }
          },
          {
            type: 'gallery' as const,
            variant: { layout: 'masonry' },
            props: { images: [] },
            order: 2,
            wrapper: {
              style: 'accent',
              title: 'Gallery Title',
              description: 'Gallery Description'
            }
          },
          {
            type: 'rooms' as const,
            variant: { roomCardStyle: 'detailed' },
            props: { rooms: [] },
            order: 3,
            wrapper: {
              style: 'simple',
              title: 'Our Rooms'
            }
          },
          {
            type: 'contact' as const,
            variant: { contactStyle: 'default' },
            props: {},
            order: 4,
            wrapper: { style: 'none' }
          }
        ],
        layoutStructure: 'single-column' as const,
        emphasisComponents: [],
        validationStatus: 'PASS' as const
      };

      const result = HomepageConfigSchema.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should reject config with invalid wrapper style', () => {
      const config = {
        generationId: 'test-invalid',
        timestamp: '2026-02-27T00:00:00Z',
        hotelParameters: {
          hotelType: 'luxury' as const,
          targetAudience: 'couples' as const,
          brandPersonality: 'elegant' as const,
          hotelName: 'Test Hotel',
          location: 'Test Location'
        },
        components: [
          {
            type: 'navigation' as const,
            variant: { style: 'solid' },
            props: {},
            order: 0,
            wrapper: {
              style: 'invalid-style',
              title: 'Test'
            }
          },
          {
            type: 'hero' as const,
            variant: { style: 'modern' },
            props: { title: 'Test', headline: 'Test' },
            order: 1
          },
          {
            type: 'gallery' as const,
            variant: { layout: 'masonry' },
            props: { images: [] },
            order: 2
          },
          {
            type: 'rooms' as const,
            variant: { roomCardStyle: 'detailed' },
            props: { rooms: [] },
            order: 3
          },
          {
            type: 'contact' as const,
            variant: { contactStyle: 'default' },
            props: {},
            order: 4
          }
        ],
        layoutStructure: 'single-column' as const,
        emphasisComponents: [],
        validationStatus: 'PASS' as const
      };

      const result = HomepageConfigSchema.safeParse(config);
      expect(result.success).toBe(false);
    });
  });

  describe('Prototype pollution protection', () => {
    it('should strip unknown properties like __proto__ from wrapper', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'Test',
        __proto__: { admin: true }
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      // Zod strips unknown properties, so this should succeed but without the custom __proto__
      expect(result.success).toBe(true);
      if (result.success) {
        // The result data should only have the defined properties
        expect(Object.keys(result.data)).toEqual(['style', 'title']);
        expect(result.data.style).toBe('accent');
        expect(result.data.title).toBe('Test');
      }
    });

    it('should strip unknown properties like constructor from wrapper', () => {
      const wrapper = {
        style: 'accent' as const,
        title: 'Test',
        constructor: 'malicious'
      };

      const result = SectionWrapperContract.safeParse(wrapper);
      // Zod strips unknown properties
      expect(result.success).toBe(true);
      if (result.success) {
        // The result data should only have the defined properties
        expect(Object.keys(result.data)).toEqual(['style', 'title']);
        expect(result.data.style).toBe('accent');
        expect(result.data.title).toBe('Test');
      }
    });
  });

  describe('All wrapper styles in HomepageConfigSchema', () => {
    const wrapperStyles: Array<'accent' | 'simple' | 'numbered' | 'none'> = ['accent', 'simple', 'numbered', 'none'];

    wrapperStyles.forEach((style) => {
      it(`should validate HomepageConfig with wrapper.style="${style}"`, () => {
        const config = {
          generationId: `test-${style}-v1`, // Must match regex /^[a-z0-9-]+-v\d+$/
          timestamp: '2026-02-27T00:00:00Z',
          hotelParameters: {
            hotelType: 'luxury' as const,
            targetAudience: 'couples' as const,
            brandPersonality: 'elegant' as const,
            hotelName: 'Test Hotel',
            location: 'Test Location'
          },
          components: [
            {
              type: 'navigation' as const,
              variant: { style: 'solid' },
              props: {},
              order: 0,
              wrapper: { style: style as 'accent' | 'simple' | 'numbered' | 'none' }
            },
            {
              type: 'hero' as const,
              variant: { style: 'modern' },
              props: { title: 'Test', headline: 'Test' },
              order: 1,
              wrapper: { style: style as 'accent' | 'simple' | 'numbered' | 'none' }
            },
            {
              type: 'gallery' as const,
              variant: { layout: 'masonry' },
              props: { images: [] },
              order: 2,
              wrapper: { style: style as 'accent' | 'simple' | 'numbered' | 'none', title: 'Gallery' }
            },
            {
              type: 'rooms' as const,
              variant: { roomCardStyle: 'detailed' },
              props: { rooms: [] },
              order: 3,
              wrapper: { style: style as 'accent' | 'simple' | 'numbered' | 'none', title: 'Rooms' }
            },
            {
              type: 'contact' as const,
              variant: { contactStyle: 'default' },
              props: {},
              order: 4,
              wrapper: { style: style as 'accent' | 'simple' | 'numbered' | 'none' }
            }
          ],
          layoutStructure: 'single-column' as const,
          emphasisComponents: [],
          validationStatus: 'PASS' as const
        };

        const result = HomepageConfigSchema.safeParse(config);
        expect(result.success).toBe(true);
      });
    });
  });
});
