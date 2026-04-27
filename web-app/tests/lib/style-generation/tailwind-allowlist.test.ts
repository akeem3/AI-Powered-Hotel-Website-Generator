/**
 * Story 20.7: Semantic Token Allowlist for CVA Variant Validation
 * Test Suite
 *
 * Tests the complete allowlist validation for AI-generated CVA class strings.
 * Covers all AC requirements from Epic 20, Story 20.7.
 *
 * Test coverage:
 * - Valid semantic classes from each category pass validation
 * - Raw color classes are rejected (bg-blue-*, text-red-*, etc.)
 * - Arbitrary Tailwind utilities are rejected (bg-slate-*, etc.)
 * - Multi-class string validation works correctly
 * - Empty string handling returns valid
 * - Compound class strings from existing CVA variants pass validation
 * - All classes from actual cva-variants.ts definitions pass
 * - Edge cases: whitespace, duplicates, mixed valid/invalid classes
 * - Helper functions: isValidSemanticClassString, getInvalidClasses, isAllowedClass
 */

import { describe, it, expect } from '@jest/globals';
import {
  SEMANTIC_TOKEN_ALLOWLIST,
  validateSemanticClasses,
  isValidSemanticClassString,
  getInvalidClasses,
  isAllowedClass,
} from '@/lib/style-generation/tailwind-allowlist';

/**
 * Test Suite: SEMANTIC_TOKEN_ALLOWLIST
 * ===========================
 * Tests the allowlist Set structure and size
 */
describe('SEMANTIC_TOKEN_ALLOWLIST', () => {
  it('should be a Set with approximately 330 classes', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST).toBeInstanceOf(Set);
    // Allow some flexibility as the exact count may vary slightly
    expect(SEMANTIC_TOKEN_ALLOWLIST.size).toBeGreaterThanOrEqual(300);
    expect(SEMANTIC_TOKEN_ALLOWLIST.size).toBeLessThanOrEqual(400);
  });

  it('should contain background classes from each category', () => {
    // Brand backgrounds
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('bg-brand-primary')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('bg-brand-secondary')).toBe(true);
    // Surface backgrounds
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('bg-surface-primary')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('bg-surface-elevated')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('bg-surface-muted')).toBe(true);
    // Transparent
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('bg-transparent')).toBe(true);
  });

  it('should contain gradient classes', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('bg-gradient-to-r')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('from-brand-primary')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('to-transparent')).toBe(true);
  });

  it('should contain text color classes', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('text-text-primary')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('text-text-secondary')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('text-text-inverted')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('text-brand-primary')).toBe(true);
  });

  it('should contain border classes', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('border')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('border-2')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('border-border-default')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('border-brand-primary')).toBe(true);
  });

  it('should contain layout utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('flex')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('grid')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('items-center')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('justify-center')).toBe(true);
  });

  it('should contain spacing utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('gap-4')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('p-6')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('px-4')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('py-8')).toBe(true);
  });

  it('should contain sizing utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('w-full')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('h-full')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('min-h-hero-md')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('aspect-video')).toBe(true);
  });

  it('should contain effect utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('shadow-md')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('rounded-xl')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('backdrop-blur-md')).toBe(true);
  });

  it('should contain transition utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('transition-all')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('duration-300')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('ease-out')).toBe(true);
  });

  it('should contain responsive utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('md:grid-cols-2')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('lg:grid-cols-3')).toBe(true);
  });

  it('should contain pseudo-element utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('before:absolute')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('before:inset-0')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('before:bg-brand-primary/30')).toBe(true);
  });

  it('should contain element selector utilities ([&_...] pattern)', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('[&_.hero-cta]:px-6')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('[&_figure]:bg-surface-elevated')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('[&_.testimonial-card]:shadow-sm')).toBe(true);
  });

  it('should contain state modifier utilities', () => {
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('hover:shadow-lg')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('hover:bg-surface-primary')).toBe(true);
    expect(SEMANTIC_TOKEN_ALLOWLIST.has('group-hover:[&_.icon-wrapper]:bg-brand-primary')).toBe(true);
  });
});

/**
 * Test Suite: validateSemanticClasses()
 * ===========================
 * Tests the main validation function
 */
describe('validateSemanticClasses()', () => {
  describe('Valid semantic classes should pass', () => {
    it('should accept valid background classes', () => {
      const result = validateSemanticClasses('bg-brand-primary bg-surface-primary');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid text color classes', () => {
      const result = validateSemanticClasses('text-text-primary text-brand-secondary');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid border classes', () => {
      const result = validateSemanticClasses('border border-2 border-border-default');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid layout utilities', () => {
      const result = validateSemanticClasses('flex grid items-center justify-center');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid spacing utilities', () => {
      const result = validateSemanticClasses('gap-4 p-6 px-4 py-8');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid sizing utilities', () => {
      const result = validateSemanticClasses('w-full h-full min-h-hero-md');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid effect utilities', () => {
      const result = validateSemanticClasses('shadow-md rounded-xl backdrop-blur-md');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid transition utilities', () => {
      const result = validateSemanticClasses('transition-all duration-300 ease-out');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid responsive utilities', () => {
      const result = validateSemanticClasses('md:grid-cols-2 lg:grid-cols-3');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid pseudo-element utilities', () => {
      const result = validateSemanticClasses('before:absolute before:inset-0 before:bg-brand-primary/30');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid element selector utilities', () => {
      const result = validateSemanticClasses('[&_.hero-cta]:px-6 [&_.hero-cta]:py-4');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept valid state modifier utilities', () => {
      const result = validateSemanticClasses('hover:shadow-lg hover:bg-surface-primary');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });
  });

  describe('Raw color classes should be rejected', () => {
    it('should reject bg-blue-* raw color classes', () => {
      const result = validateSemanticClasses('bg-blue-500 bg-blue-600');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('bg-blue-500');
      expect(result.invalidClasses).toContain('bg-blue-600');
    });

    it('should reject text-red-* raw color classes', () => {
      const result = validateSemanticClasses('text-red-600 text-red-700');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('text-red-600');
      expect(result.invalidClasses).toContain('text-red-700');
    });

    it('should reject text-white raw color class', () => {
      const result = validateSemanticClasses('text-white');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('text-white');
    });

    it('should reject text-black raw color class', () => {
      const result = validateSemanticClasses('text-black');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('text-black');
    });

    it('should reject bg-gray-* arbitrary utility classes', () => {
      const result = validateSemanticClasses('bg-gray-100 bg-gray-200');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('bg-gray-100');
      expect(result.invalidClasses).toContain('bg-gray-200');
    });

    it('should reject bg-slate-* arbitrary utility classes', () => {
      const result = validateSemanticClasses('bg-slate-50 bg-slate-800');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('bg-slate-50');
      expect(result.invalidClasses).toContain('bg-slate-800');
    });

    it('should reject text-emerald-* arbitrary utility classes', () => {
      const result = validateSemanticClasses('text-emerald-500 text-emerald-600');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('text-emerald-500');
      expect(result.invalidClasses).toContain('text-emerald-600');
    });
  });

  describe('Arbitrary Tailwind utilities should be rejected', () => {
    it('should reject arbitrary color utilities not in allowlist', () => {
      const result = validateSemanticClasses('bg-indigo-500 text-purple-600');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('bg-indigo-500');
      expect(result.invalidClasses).toContain('text-purple-600');
    });

    it('should reject arbitrary spacing utilities not in allowlist', () => {
      const result = validateSemanticClasses('gap-16 gap-20');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('gap-16');
      expect(result.invalidClasses).toContain('gap-20');
    });

    it('should reject arbitrary sizing utilities not in allowlist', () => {
      const result = validateSemanticClasses('w-128 h-128');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('w-128');
      expect(result.invalidClasses).toContain('h-128');
    });
  });

  describe('Multi-class string validation', () => {
    it('should validate multi-class string with all valid classes', () => {
      const result = validateSemanticClasses('bg-brand-primary text-text-primary p-4 rounded-lg');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should identify invalid classes in multi-class string', () => {
      const result = validateSemanticClasses('bg-brand-primary bg-blue-500 text-text-primary p-4');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toEqual(['bg-blue-500']);
    });

    it('should identify multiple invalid classes in multi-class string', () => {
      const result = validateSemanticClasses('bg-brand-primary bg-blue-500 text-white p-4 text-red-600');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('bg-blue-500');
      expect(result.invalidClasses).toContain('text-white');
      expect(result.invalidClasses).toContain('text-red-600');
    });

    it('should handle classes with arbitrary values', () => {
      const result = validateSemanticClasses('w-[30%] md:w-[30%]');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });
  });

  describe('Empty and whitespace handling', () => {
    it('should accept empty string', () => {
      const result = validateSemanticClasses('');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept whitespace-only string', () => {
      const result = validateSemanticClasses('   ');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept string with only tabs and newlines', () => {
      const result = validateSemanticClasses('  \t\n  ');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });
  });

  describe('Compound class strings from CVA variants', () => {
    it('should accept hero variant classes', () => {
      const result = validateSemanticClasses('bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept gallery card style classes', () => {
      const result = validateSemanticClasses('[&_figure]:bg-surface-elevated [&_figure]:shadow-card [&_figure]:border-2 [&_figure]:border-transparent [&_figure]:rounded-xl [&_figure]:overflow-hidden');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept testimonial card classes', () => {
      const result = validateSemanticClasses('[&_.testimonial-card]:bg-surface-primary [&_.testimonial-card]:border [&_.testimonial-card]:border-border-default [&_.testimonial-card]:shadow-sm');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept navigation variant classes', () => {
      const result = validateSemanticClasses('bg-surface-primary text-text-primary shadow-md border-b border-border-default');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should accept complex compound variant with hover states', () => {
      const result = validateSemanticClasses('hover:[&_figure]:border-brand-secondary hover:[&_figure]:shadow-lg hover:[&_figure]:-translate-y-1');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle duplicate classes (duplicates should not affect validation)', () => {
      const result = validateSemanticClasses('bg-brand-primary bg-brand-primary text-text-primary');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should handle classes with multiple spaces between them', () => {
      const result = validateSemanticClasses('bg-brand-primary    text-text-primary    p-4');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should handle leading and trailing whitespace', () => {
      const result = validateSemanticClasses('  bg-brand-primary text-text-primary p-4  ');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should handle mixed valid and invalid classes', () => {
      const result = validateSemanticClasses('bg-brand-primary bg-blue-500 text-text-primary text-white p-4');
      expect(result.valid).toBe(false);
      expect(result.invalidClasses).toContain('bg-blue-500');
      expect(result.invalidClasses).toContain('text-white');
    });

    it('should handle classes with opacity modifiers', () => {
      const result = validateSemanticClasses('bg-brand-primary/30 bg-brand-primary/60 bg-brand-primary/high');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });

    it('should handle responsive classes', () => {
      const result = validateSemanticClasses('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
      expect(result.valid).toBe(true);
      expect(result.invalidClasses).toEqual([]);
    });
  });
});

/**
 * Test Suite: Helper Functions
 * ===========================
 * Tests the convenience helper functions
 */
describe('Helper Functions', () => {
  describe('isValidSemanticClassString()', () => {
    it('should return true for valid class string', () => {
      expect(isValidSemanticClassString('bg-brand-primary text-text-primary')).toBe(true);
    });

    it('should return false for invalid class string', () => {
      expect(isValidSemanticClassString('bg-blue-500 text-white')).toBe(false);
    });

    it('should return true for empty string', () => {
      expect(isValidSemanticClassString('')).toBe(true);
    });

    it('should return true for whitespace-only string', () => {
      expect(isValidSemanticClassString('   ')).toBe(true);
    });
  });

  describe('getInvalidClasses()', () => {
    it('should return empty array for valid class string', () => {
      const result = getInvalidClasses('bg-brand-primary text-text-primary');
      expect(result).toEqual([]);
    });

    it('should return array of invalid classes for mixed string', () => {
      const result = getInvalidClasses('bg-brand-primary bg-blue-500 text-text-primary text-white');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
    });

    it('should return all invalid classes when all are invalid', () => {
      const result = getInvalidClasses('bg-blue-500 text-white bg-red-600');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
      expect(result).toContain('bg-red-600');
    });
  });

  describe('isAllowedClass()', () => {
    it('should return true for allowed class', () => {
      expect(isAllowedClass('bg-brand-primary')).toBe(true);
      expect(isAllowedClass('text-text-primary')).toBe(true);
      expect(isAllowedClass('border-2')).toBe(true);
    });

    it('should return false for disallowed class', () => {
      expect(isAllowedClass('bg-blue-500')).toBe(false);
      expect(isAllowedClass('text-white')).toBe(false);
      expect(isAllowedClass('invalid-class')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isAllowedClass('')).toBe(false);
    });

    it('should handle element selector classes', () => {
      expect(isAllowedClass('[&_.hero-cta]:px-6')).toBe(true);
      expect(isAllowedClass('[&_figure]:bg-surface-elevated')).toBe(true);
    });

    it('should handle responsive classes', () => {
      expect(isAllowedClass('md:grid-cols-2')).toBe(true);
      expect(isAllowedClass('lg:grid-cols-3')).toBe(true);
    });

    it('should handle pseudo-element classes', () => {
      expect(isAllowedClass('before:absolute')).toBe(true);
      expect(isAllowedClass('before:inset-0')).toBe(true);
    });

    it('should handle state modifier classes', () => {
      expect(isAllowedClass('hover:shadow-lg')).toBe(true);
      expect(isAllowedClass('hover:bg-surface-primary')).toBe(true);
    });
  });
});

/**
 * Test Suite: Real-world CVA Variant Examples
 * ===========================
 * Tests actual class strings from cva-variants.ts
 */
describe('Real-world CVA Variant Examples', () => {
  it('should validate hero variant: modern style', () => {
    const result = validateSemanticClasses('bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate hero variant: centered layout', () => {
    const result = validateSemanticClasses('flex items-center justify-center text-center');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate hero variant: dark overlay', () => {
    const result = validateSemanticClasses('before:absolute before:inset-0 before:bg-brand-primary/60');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate hero variant: gradient overlay', () => {
    const result = validateSemanticClasses('before:absolute before:inset-0 before:bg-gradient-to-t before:from-brand-primary/70 before:to-transparent');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate gallery variant: default card style', () => {
    const result = validateSemanticClasses('[&_figure]:bg-surface-elevated [&_figure]:shadow-card [&_figure]:border-2 [&_figure]:border-transparent [&_figure]:rounded-xl [&_figure]:overflow-hidden hover:[&_figure]:border-brand-secondary hover:[&_figure]:shadow-lg hover:[&_figure]:-translate-y-1 [&_figure]:transition-all [&_figure]:duration-300 [&_figure]:ease-out');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate navigation variant: glass style', () => {
    const result = validateSemanticClasses('bg-surface-primary/high backdrop-blur-md text-text-primary border-b border-border-default');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate navigation compact variant', () => {
    const result = validateSemanticClasses('lg:bg-surface-primary/80 lg:backdrop-blur-sm lg:text-text-primary lg:border lg:border-border-default');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate room card variant: detailed', () => {
    const result = validateSemanticClasses('bg-surface-primary shadow-card hover:shadow-card-hover border border-border-default');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate testimonial variant: elevated card style', () => {
    const result = validateSemanticClasses('[&_.testimonial-card]:bg-surface-elevated [&_.testimonial-card]:shadow-card hover:[&_.testimonial-card]:shadow-card-hover');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate amenity variant: default icon style', () => {
    const result = validateSemanticClasses('[&_.icon-wrapper]:bg-brand-primary/wash [&_.icon-wrapper]:text-brand-primary group-hover:[&_.icon-wrapper]:bg-brand-primary group-hover:[&_.icon-wrapper]:text-on-brand');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate footer variant: classic', () => {
    const result = validateSemanticClasses('bg-surface-muted text-text-secondary border-t border-border-default');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate about variant: side-by-side', () => {
    const result = validateSemanticClasses('grid md:grid-cols-2 gap-gap-section items-center w-full');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate FAQ variant: accordion', () => {
    const result = validateSemanticClasses('w-full');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });

  it('should validate features variant: icon grid with 3 columns', () => {
    const result = validateSemanticClasses('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
    expect(result.valid).toBe(true);
    expect(result.invalidClasses).toEqual([]);
  });
});
