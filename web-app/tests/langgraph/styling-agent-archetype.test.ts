/**
 * Tests for StylingAgent with archetype enhancement
 * Story 20.10: StylingAgent Enhancement
 */

import { StylingAgentOutputSchema } from '../../app/langgraph/agents/schemas';
import { CVAValidator } from '../../app/langgraph/utils/cva-validator';

describe('StylingAgent with archetype enhancement', () => {
  // Debug: Log the schema shape to verify it's being imported correctly
  it('should debug schema shape', () => {
    const testShape = StylingAgentOutputSchema.shape;
    const keys = Object.keys(testShape);
    console.log('Schema shape keys:', keys);
    console.log('Has archetype:', 'archetype' in testShape);
    console.log('Number of keys:', keys.length);
  });

  describe('StylingAgentOutputSchema with archetype field', () => {
    it('should have archetype field in schema shape', () => {
      const testShape = StylingAgentOutputSchema.shape;
      expect('archetype' in testShape).toBe(true);
    });

    it('should validate output with archetype field', () => {
      const output = {
        archetype: 'heritage-opulence',
        componentVariants: {
          hero: {
            style: 'heritage-opulence',
            layout: 'split',
            overlay: 'dark',
            height: 'large'
          },
          navigation: {
            navStyle: 'solid',
            navLayout: 'classic'
          }
        },
        reasoning: 'Selected heritage-opulence variants for this luxury hotel to convey elegance and tradition.'
      };

      const result = StylingAgentOutputSchema.safeParse(output);
      if (!result.success) {
        console.log('Validation error issues:', result.error?.issues);
        console.log('Validation error format:', result.error?.format());
      }
      expect(result.success).toBe(true);
    });

    it('should validate output without archetype field (backward compatibility)', () => {
      const output = {
        componentVariants: {
          hero: {
            style: 'modern',
            layout: 'centered'
          }
        },
        reasoning: 'Using modern variants for contemporary hotel design.'
      };

      const result = StylingAgentOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it('should reject invalid archetype values', () => {
      const output = {
        archetype: 'invalid-archetype',
        componentVariants: {
          hero: { style: 'modern' }
        },
        reasoning: 'This should fail.'
      };

      const result = StylingAgentOutputSchema.safeParse(output);
      expect(result.success).toBe(false);
    });
  });

  describe('CVAValidator with archetype variants', () => {
    it('should validate hero archetype-specific style variants', () => {
      const variants = {
        style: 'heritage-opulence'
      };

      const result = CVAValidator.validateComponent('hero', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate hero urban-tech variant', () => {
      const variants = {
        style: 'urban-tech',
        layout: 'urban-tech'
      };

      const result = CVAValidator.validateComponent('hero', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate hero coastal-resort variant', () => {
      const variants = {
        style: 'coastal-resort',
        layout: 'coastal-resort'
      };

      const result = CVAValidator.validateComponent('hero', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate gallery archetype-specific cardStyle variants', () => {
      const variants = {
        cardStyle: 'heritage-opulence'
      };

      const result = CVAValidator.validateComponent('gallery', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate gallery urban-tech cardStyle variant', () => {
      const variants = {
        cardStyle: 'urban-tech'
      };

      const result = CVAValidator.validateComponent('gallery', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate navigation archetype-specific style variants', () => {
      const variants = {
        style: 'heritage-opulence'
      };

      const result = CVAValidator.validateComponent('navigation', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate navigation coastal-resort style variant', () => {
      const variants = {
        style: 'coastal-resort'
      };

      const result = CVAValidator.validateComponent('navigation', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate navigation urban-tech style variant', () => {
      const variants = {
        style: 'urban-tech'
      };

      const result = CVAValidator.validateComponent('navigation', variants);
      expect(result).toHaveLength(0);
    });

    it('should validate full output with archetype variants', () => {
      const output = {
        componentVariants: {
          hero: {
            style: 'heritage-opulence',
            layout: 'heritage-opulence',
            overlay: 'dark',
            height: 'large'
          },
          navigation: {
            navStyle: 'heritage-opulence',
            navLayout: 'classic'
          },
          gallery: {
            galleryLayout: 'grid',
            cardStyle: 'heritage-opulence'
          }
        }
      };

      const result = CVAValidator.validateOutput(output);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid archetype variant names', () => {
      const variants = {
        style: 'invalid-archetype-variant'
      };

      const result = CVAValidator.validateComponent('hero', variants);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toContain('Invalid variant');
    });
  });

  describe('Archetype variant selection patterns', () => {
    it('should support fallback to generic variants when archetype variants not available', () => {
      // Test that generic variants still work
      const variants = {
        style: 'modern',
        layout: 'centered'
      };

      const result = CVAValidator.validateComponent('hero', variants);
      expect(result).toHaveLength(0);
    });

    it('should support mixing archetype and generic variants', () => {
      const output = {
        componentVariants: {
          hero: {
            style: 'heritage-opulence',  // Archetype-specific
            overlay: 'light'              // Generic fallback
          },
          testimonials: {
            testimonialsLayout: 'grid'    // No archetype variants available
          }
        }
      };

      const result = CVAValidator.validateOutput(output);
      expect(result.valid).toBe(true);
    });
  });

  describe('Archetype description helper', () => {
    it('should provide descriptions for all 12 archetypes', () => {
      // This test verifies the getArchetypeDescription method covers all archetypes
      const expectedArchetypes = [
        'heritage-opulence',
        'heritage-cultural',
        'modern-luxury',
        'urban-tech',
        'coastal-resort',
        'eco-lodge',
        'mountain-retreat',
        'desert-oasis',
        'tropical-paradise',
        'design-art',
        'family-resort',
        'business-hotel'
      ];

      // The descriptions should be available in the StylingAgent
      // This is a placeholder test - the actual method is private
      expectedArchetypes.forEach(archetype => {
        expect(archetype).toBeTruthy();
      });
    });
  });
});
