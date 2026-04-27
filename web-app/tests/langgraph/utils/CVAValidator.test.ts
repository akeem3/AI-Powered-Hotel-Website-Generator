/**
 * CVA Validator Test Suite
 * =========================
 *
 * Story 19.6: New Block Tests - CVA Validation for Epic 19 Blocks
 *
 * Tests for CVAValidator class that validates variant choices against VALID_VARIANTS registry.
 * Ensures:
 * - CVAValidator validates all 4 new Epic 19 blocks (Footer, About, FAQ, Features)
 * - Valid variant values pass validation
 * - Invalid variant values return appropriate errors
 * - Field mappings work correctly for StylingAgent schema naming
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8
 *
 * @module tests/langgraph/utils/CVAValidator.test
 */

import { describe, it, expect } from '@jest/globals';
import { CVAValidator } from '@/app/langgraph/utils/cva-validator';

describe('CVAValidator - Story 19.6: Epic 19 New Blocks', () => {
  // =============================================================================
  // PHASE 4: CVA VALIDATION TESTS - FOOTER BLOCK
  // =============================================================================

  describe('Footer Block - CVA Validation', () => {
    describe('AC1: Valid variant values pass validation', () => {
      it('should accept "classic" layout', () => {
        const errors = CVAValidator.validateComponent('footer', { layout: 'classic' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "minimal" layout', () => {
        const errors = CVAValidator.validateComponent('footer', { layout: 'minimal' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "stacked" layout', () => {
        const errors = CVAValidator.validateComponent('footer', { layout: 'stacked' });
        expect(errors).toHaveLength(0);
      });

      it('should accept empty variants object', () => {
        const errors = CVAValidator.validateComponent('footer', {});
        expect(errors).toHaveLength(0);
      });
    });

    describe('AC2: Invalid variant values return errors', () => {
      it('should reject invalid layout value', () => {
        const errors = CVAValidator.validateComponent('footer', { layout: 'invalid' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for footer.layout');
        expect(errors[0]).toContain('classic, minimal, stacked');
      });

      it('should reject unknown layout values', () => {
        const errors = CVAValidator.validateComponent('footer', { layout: 'centered' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for footer.layout');
      });

      it('should handle multiple invalid variants', () => {
        const errors = CVAValidator.validateComponent('footer', {
          layout: 'invalid',
          unknownVariant: 'also-invalid'
        });
        expect(errors.length).toBeGreaterThan(0);
      });
    });

    describe('AC3: Field mappings work for StylingAgent naming', () => {
      it('should map footerLayout field to layout dimension', () => {
        const errors = CVAValidator.validateComponent('footer', { footerLayout: 'classic' });
        expect(errors).toHaveLength(0);
      });

      it('should validate footerLayout with correct values', () => {
        const errors = CVAValidator.validateComponent('footer', { footerLayout: 'minimal' });
        expect(errors).toHaveLength(0);
      });

      it('should reject invalid footerLayout values', () => {
        const errors = CVAValidator.validateComponent('footer', { footerLayout: 'invalid' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for footer.footerLayout');
      });
    });
  });

  // =============================================================================
  // PHASE 4: CVA VALIDATION TESTS - ABOUT BLOCK
  // =============================================================================

  describe('About Block - CVA Validation', () => {
    describe('AC1: Valid variant values pass validation', () => {
      it('should accept "side-by-side" layout', () => {
        const errors = CVAValidator.validateComponent('about', { layout: 'side-by-side' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "timeline" layout', () => {
        const errors = CVAValidator.validateComponent('about', { layout: 'timeline' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "full-width" layout', () => {
        const errors = CVAValidator.validateComponent('about', { layout: 'full-width' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "left" imagePosition', () => {
        const errors = CVAValidator.validateComponent('about', { imagePosition: 'left' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "right" imagePosition', () => {
        const errors = CVAValidator.validateComponent('about', { imagePosition: 'right' });
        expect(errors).toHaveLength(0);
      });

      it('should accept overlay variant options', () => {
        const overlays = ['none', 'light', 'dark', 'gradient'] as const;
        overlays.forEach(overlay => {
          const errors = CVAValidator.validateComponent('about', { overlay });
          expect(errors).toHaveLength(0);
        });
      });

      it('should accept textAlign variant options', () => {
        const errors = CVAValidator.validateComponent('about', { textAlign: 'left' });
        expect(errors).toHaveLength(0);

        const errors2 = CVAValidator.validateComponent('about', { textAlign: 'center' });
        expect(errors2).toHaveLength(0);
      });
    });

    describe('AC2: Invalid variant values return errors', () => {
      it('should reject invalid layout value', () => {
        const errors = CVAValidator.validateComponent('about', { layout: 'invalid' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for about.layout');
        expect(errors[0]).toContain('side-by-side, timeline, full-width');
      });

      it('should reject invalid imagePosition value', () => {
        const errors = CVAValidator.validateComponent('about', { imagePosition: 'center' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for about.imagePosition');
        expect(errors[0]).toContain('left, right');
      });

      it('should reject invalid overlay value', () => {
        const errors = CVAValidator.validateComponent('about', { overlay: 'invalid' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for about.overlay');
      });

      it('should reject invalid textAlign value', () => {
        const errors = CVAValidator.validateComponent('about', { textAlign: 'right' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for about.textAlign');
      });
    });

    describe('AC3: Field mappings work for StylingAgent naming', () => {
      it('should map aboutLayout field to layout dimension', () => {
        const errors = CVAValidator.validateComponent('about', { aboutLayout: 'side-by-side' });
        expect(errors).toHaveLength(0);
      });

      it('should map aboutImagePosition field to imagePosition dimension', () => {
        const errors = CVAValidator.validateComponent('about', { aboutImagePosition: 'right' });
        expect(errors).toHaveLength(0);
      });

      it('should map aboutOverlay field to overlay dimension', () => {
        const errors = CVAValidator.validateComponent('about', { aboutOverlay: 'gradient' });
        expect(errors).toHaveLength(0);
      });

      it('should map aboutTextAlign field to textAlign dimension', () => {
        const errors = CVAValidator.validateComponent('about', { aboutTextAlign: 'center' });
        expect(errors).toHaveLength(0);
      });
    });
  });

  // =============================================================================
  // PHASE 4: CVA VALIDATION TESTS - FAQ BLOCK
  // =============================================================================

  describe('FAQ Block - CVA Validation', () => {
    describe('AC1: Valid variant values pass validation', () => {
      it('should accept "accordion" layout', () => {
        const errors = CVAValidator.validateComponent('faq', { layout: 'accordion' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "grid" layout', () => {
        const errors = CVAValidator.validateComponent('faq', { layout: 'grid' });
        expect(errors).toHaveLength(0);
      });

      it('should accept empty variants object', () => {
        const errors = CVAValidator.validateComponent('faq', {});
        expect(errors).toHaveLength(0);
      });
    });

    describe('AC2: Invalid variant values return errors', () => {
      it('should reject invalid layout value', () => {
        const errors = CVAValidator.validateComponent('faq', { layout: 'carousel' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for faq.layout');
        expect(errors[0]).toContain('accordion, grid');
      });

      it('should reject unknown layout values', () => {
        const errors = CVAValidator.validateComponent('faq', { layout: 'list' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for faq.layout');
      });
    });

    describe('AC3: Field mappings work for StylingAgent naming', () => {
      it('should map faqLayout field to layout dimension', () => {
        const errors = CVAValidator.validateComponent('faq', { faqLayout: 'accordion' });
        expect(errors).toHaveLength(0);
      });

      it('should validate faqLayout with correct values', () => {
        const errors = CVAValidator.validateComponent('faq', { faqLayout: 'grid' });
        expect(errors).toHaveLength(0);
      });

      it('should reject invalid faqLayout values', () => {
        const errors = CVAValidator.validateComponent('faq', { faqLayout: 'invalid' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for faq.faqLayout');
      });
    });
  });

  // =============================================================================
  // PHASE 4: CVA VALIDATION TESTS - FEATURES BLOCK
  // =============================================================================

  describe('Features Block - CVA Validation', () => {
    describe('AC1: Valid variant values pass validation', () => {
      it('should accept "icon-grid" layout', () => {
        const errors = CVAValidator.validateComponent('features', { layout: 'icon-grid' });
        expect(errors).toHaveLength(0);
      });

      it('should accept "cards" layout', () => {
        const errors = CVAValidator.validateComponent('features', { layout: 'cards' });
        expect(errors).toHaveLength(0);
      });

      it('should accept 2 columns', () => {
        const errors = CVAValidator.validateComponent('features', { columns: 2 });
        expect(errors).toHaveLength(0);
      });

      it('should accept 3 columns', () => {
        const errors = CVAValidator.validateComponent('features', { columns: 3 });
        expect(errors).toHaveLength(0);
      });

      it('should accept 4 columns', () => {
        const errors = CVAValidator.validateComponent('features', { columns: 4 });
        expect(errors).toHaveLength(0);
      });

      it('should accept combined layout and columns', () => {
        const errors = CVAValidator.validateComponent('features', {
          layout: 'icon-grid',
          columns: 3
        });
        expect(errors).toHaveLength(0);
      });
    });

    describe('AC2: Invalid variant values return errors', () => {
      it('should reject invalid layout value', () => {
        const errors = CVAValidator.validateComponent('features', { layout: 'list' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for features.layout');
        expect(errors[0]).toContain('icon-grid, cards');
      });

      it('should reject invalid columns value (string)', () => {
        const errors = CVAValidator.validateComponent('features', { columns: '1' as any });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for features.columns');
        expect(errors[0]).toContain('2, 3, 4');
      });

      it('should reject invalid columns value (number out of range)', () => {
        const errors = CVAValidator.validateComponent('features', { columns: 5 });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for features.columns');
      });

      it('should handle multiple invalid variants', () => {
        const errors = CVAValidator.validateComponent('features', {
          layout: 'invalid',
          columns: 1
        });
        expect(errors.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('AC3: Field mappings work for StylingAgent naming', () => {
      it('should map featuresLayout field to layout dimension', () => {
        const errors = CVAValidator.validateComponent('features', { featuresLayout: 'cards' });
        expect(errors).toHaveLength(0);
      });

      it('should map featuresColumns field to columns dimension', () => {
        const errors = CVAValidator.validateComponent('features', { featuresColumns: 4 });
        expect(errors).toHaveLength(0);
      });

      it('should validate featuresLayout with correct values', () => {
        const errors = CVAValidator.validateComponent('features', { featuresLayout: 'icon-grid' });
        expect(errors).toHaveLength(0);
      });

      it('should reject invalid featuresLayout values', () => {
        const errors = CVAValidator.validateComponent('features', { featuresLayout: 'invalid' });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for features.featuresLayout');
      });

      it('should reject invalid featuresColumns values', () => {
        const errors = CVAValidator.validateComponent('features', { featuresColumns: 1 });
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0]).toContain('Invalid variant for features.featuresColumns');
      });
    });
  });

  // =============================================================================
  // INTEGRATION TESTS: validateOutput with all Epic 19 blocks
  // =============================================================================

  describe('CVAValidator - Integration: All Epic 19 Blocks', () => {
    it('should validate all 4 Epic 19 blocks with valid variants', () => {
      const output = {
        componentVariants: {
          footer: { layout: 'classic' },
          about: { layout: 'side-by-side', imagePosition: 'right' },
          faq: { layout: 'accordion' },
          features: { layout: 'icon-grid', columns: 3 }
        }
      };

      const result = CVAValidator.validateOutput(output);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should collect errors from all Epic 19 blocks when invalid', () => {
      const output = {
        componentVariants: {
          footer: { layout: 'invalid' },
          about: { layout: 'wrong' },
          faq: { layout: 'bad' },
          features: { layout: 'terrible' }
        }
      };

      const result = CVAValidator.validateOutput(output);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(4);
    });

    it('should handle mixed valid and invalid Epic 19 blocks', () => {
      const output = {
        componentVariants: {
          footer: { layout: 'classic' },
          about: { layout: 'invalid' },
          faq: { layout: 'grid' },
          features: { layout: 'wrong' }
        }
      };

      const result = CVAValidator.validateOutput(output);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(2);
    });

    it('should validate Epic 19 blocks alongside existing blocks', () => {
      const output = {
        componentVariants: {
          hero: { style: 'modern', layout: 'centered' },
          gallery: { layout: 'grid', spacing: 'normal' },
          footer: { layout: 'minimal' },
          about: { layout: 'timeline' },
          faq: { layout: 'accordion' },
          features: { layout: 'cards', columns: 2 }
        }
      };

      const result = CVAValidator.validateOutput(output);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // =============================================================================
  // EDGE CASES
  // =============================================================================

  describe('CVAValidator - Edge Cases', () => {
    it('should handle empty componentVariants object', () => {
      const result = CVAValidator.validateOutput({ componentVariants: {} });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unknown component type', () => {
      const errors = CVAValidator.validateComponent('unknown-component', { layout: 'classic' });
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('Unknown component type');
    });

    it('should handle unknown variant dimensions gracefully (warning only)', () => {
      // Unknown dimensions should log warnings but not fail validation
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const errors = CVAValidator.validateComponent('footer', {
        layout: 'classic',
        unknownDimension: 'some-value'
      });
      expect(errors).toHaveLength(0); // Should not fail for unknown dimensions
      expect(consoleWarnSpy).toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
    });

    it('should validate all Epic 19 StylingAgent field mappings', () => {
      const output = {
        componentVariants: {
          footer: { footerLayout: 'stacked' },
          about: { aboutLayout: 'full-width', aboutImagePosition: 'left', aboutOverlay: 'light' },
          faq: { faqLayout: 'grid' },
          features: { featuresLayout: 'icon-grid', featuresColumns: 4 }
        }
      };

      const result = CVAValidator.validateOutput(output);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});
