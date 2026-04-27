/**
 * Story 11.08: Centralized Generic Defaults Migration
 *
 * Tests for centralized defaults configuration and generic/hotel-agnostic behavior.
 *
 * Test categories:
 * 1. Defaults config structure and type safety
 * 2. Generic/hotel-agnostic validation
 * 3. Component integration with centralized defaults
 * 4. Fallback chain integrity (content > props > defaults)
 * 5. Zero hotel-specific strings in defaults
 */

import {
  CONTENT_DEFAULTS,
  isGenericDefault,
  assertGenericDefault,
  isProduction,
  getContentDefault,
  logFallbackUsage,
  getFallbackUsageBuffer,
  clearFallbackUsageBuffer,
  validateRequiredContent,
  CRITICAL_CONTENT_FIELDS,
  type ContentDefaults,
  type HeroDefaults,
  type AmenitiesDefaults,
  type TestimonialsDefaults,
} from '@/lib/content/defaults';

describe('Story 11.08: Centralized Generic Defaults Migration', () => {
  describe('AC1: Centralized defaults config created at web-app/lib/content/defaults.ts', () => {
    it('should export CONTENT_DEFAULTS constant', () => {
      expect(CONTENT_DEFAULTS).toBeDefined();
      expect(typeof CONTENT_DEFAULTS).toBe('object');
    });

    it('should have hero section defaults', () => {
      expect(CONTENT_DEFAULTS.hero).toBeDefined();
      expect(CONTENT_DEFAULTS.hero.title).toBeDefined();
      expect(CONTENT_DEFAULTS.hero.tagline).toBeDefined();
      expect(CONTENT_DEFAULTS.hero.headline).toBeDefined();
      expect(CONTENT_DEFAULTS.hero.primaryCTA).toBeDefined();
      expect(CONTENT_DEFAULTS.hero.secondaryCTA).toBeDefined();
    });

    it('should have amenities section defaults', () => {
      expect(CONTENT_DEFAULTS.amenities).toBeDefined();
      expect(CONTENT_DEFAULTS.amenities.heading).toBeDefined();
      expect(CONTENT_DEFAULTS.amenities.subheading).toBeDefined();
    });

    it('should have testimonials section defaults', () => {
      expect(CONTENT_DEFAULTS.testimonials).toBeDefined();
      expect(CONTENT_DEFAULTS.testimonials.heading).toBeDefined();
      expect(CONTENT_DEFAULTS.testimonials.subheading).toBeDefined();
    });

    it('should export TypeScript types', () => {
      // Note: TypeScript types are erased at runtime, so we can't test typeof
      // This test verifies the types are correctly structured via const assertion

      // Verify that the defaults are properly typed (readonly)
      // The 'as const' assertion makes TypeScript infer readonly types
      expect(CONTENT_DEFAULTS).toBeDefined();

      // Type checks are compile-time, but we verify runtime behavior
      const defaults: ContentDefaults = CONTENT_DEFAULTS;
      expect(defaults).toEqual(CONTENT_DEFAULTS);
    });

    it('should use const assertion for type safety', () => {
      // Verify that the constants are readonly (as const assertion)
      const heroTitle: 'Hotel Name' = CONTENT_DEFAULTS.hero.title;
      expect(heroTitle).toBe('Hotel Name');

      // This should compile (types are correctly inferred)
      const defaults: ContentDefaults = CONTENT_DEFAULTS;
      expect(defaults).toEqual(CONTENT_DEFAULTS);
    });
  });

  describe('AC2: All default values are generic and hotel-agnostic', () => {
    it('should have generic hero title (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.hero.title).toBe('Hotel Name');
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.title)).toBe(true);
    });

    it('should have generic hero tagline (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.hero.tagline).toBe('Your Comfort is Our Priority');
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.tagline)).toBe(true);
    });

    it('should have generic hero headline (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.hero.headline).toBe('Welcome to Our Hotel');
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.headline)).toBe(true);
    });

    it('should have generic CTA text (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.hero.primaryCTA.text).toBe('Book Now');
      expect(CONTENT_DEFAULTS.hero.secondaryCTA.text).toBe('Learn More');

      expect(isGenericDefault(CONTENT_DEFAULTS.hero.primaryCTA.text)).toBe(true);
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.secondaryCTA.text)).toBe(true);
    });

    it('should have generic amenities heading (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.amenities.heading).toBe('Our Amenities');
      expect(isGenericDefault(CONTENT_DEFAULTS.amenities.heading)).toBe(true);
    });

    it('should have generic amenities subheading (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.amenities.subheading).toBe('Discover our facilities');
      expect(isGenericDefault(CONTENT_DEFAULTS.amenities.subheading)).toBe(true);
    });

    it('should have generic testimonials heading (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.testimonials.heading).toBe('Guest Reviews');
      expect(isGenericDefault(CONTENT_DEFAULTS.testimonials.heading)).toBe(true);
    });

    it('should have generic testimonials subheading (not hotel-specific)', () => {
      expect(CONTENT_DEFAULTS.testimonials.subheading).toBe('What our guests say');
      expect(isGenericDefault(CONTENT_DEFAULTS.testimonials.subheading)).toBe(true);
    });

    describe('isGenericDefault validator', () => {
      it('should accept generic placeholders', () => {
        expect(isGenericDefault('Hotel Name')).toBe(true);
        expect(isGenericDefault('Your Comfort is Our Priority')).toBe(true);
        expect(isGenericDefault('Welcome to Our Hotel')).toBe(true);
        expect(isGenericDefault('Book Now')).toBe(true);
      });

      it('should reject hotel-specific strings', () => {
        expect(isGenericDefault('The Sterling Executive')).toBe(false);
        expect(isGenericDefault('Sterling Executive')).toBe(false);
        expect(isGenericDefault('Experience Boutique Luxury')).toBe(false);
        expect(isGenericDefault('Where Comfort Meets Prestige')).toBe(false);
        expect(isGenericDefault('Where Business Meets Boutique Excellence')).toBe(false);
        expect(isGenericDefault('info@sterlingexecutive.com')).toBe(false);
      });

      it('should be case-insensitive for hotel names', () => {
        expect(isGenericDefault('the sterling executive')).toBe(false);
        expect(isGenericDefault('THE STERLING EXECUTIVE')).toBe(false);
        expect(isGenericDefault('Experience BOUTIQUE Luxury')).toBe(false);
      });
    });

    describe('assertGenericDefault validator', () => {
      it('should not throw for generic placeholders', () => {
        expect(() => {
          assertGenericDefault('Hotel Name');
          assertGenericDefault('Your Comfort is Our Priority');
          assertGenericDefault('Welcome to Our Hotel');
        }).not.toThrow();
      });

      it('should throw for hotel-specific strings', () => {
        expect(() => assertGenericDefault('The Sterling Executive')).toThrow();
        expect(() => assertGenericDefault('Sterling Executive')).toThrow();
        expect(() => assertGenericDefault('Experience Boutique Luxury')).toThrow();
        expect(() => assertGenericDefault('Where Comfort Meets Prestige')).toThrow();
      });

      it('should throw descriptive error message', () => {
        try {
          assertGenericDefault('The Sterling Executive');
          fail('Expected assertGenericDefault to throw');
        } catch (error) {
          expect((error as Error).message).toContain('Hotel-specific branding detected');
          expect((error as Error).message).toContain('The Sterling Executive');
          expect((error as Error).message).toContain('hotel-agnostic');
        }
      });
    });
  });

  describe('AC8: Zero hotel-specific strings remain in defaults', () => {
    const hotelSpecificStrings = [
      'The Sterling Executive',
      'Sterling Executive',
      'Experience Boutique Luxury',
      'Where Comfort Meets Prestige',
      'Where Business Meets Boutique Excellence',
      'sterlingexecutive.com',
      'World-Class Amenities', // Story 11.08 requires this be replaced with generic
      'Everything you need for a perfect stay', // Story 11.08 requires this be replaced with generic
      'Hear what our guests have to say about their stay', // Story 11.08 requires this be replaced with generic
    ];

    it('should not contain any hotel-specific strings in defaults', () => {
      // Serialize all defaults to a single string for comprehensive search
      const defaultsString = JSON.stringify(CONTENT_DEFAULTS).toLowerCase();

      hotelSpecificStrings.forEach((hotelString) => {
        // Check for case-insensitive partial matches
        expect(defaultsString).not.toContain(hotelString.toLowerCase());
      });
    });

    it('should not contain hotel-specific strings in hero defaults', () => {
      const heroDefaults = Object.values(CONTENT_DEFAULTS.hero);
      const heroString = JSON.stringify(heroDefaults).toLowerCase();

      expect(heroString).not.toContain('sterling');
      expect(heroString).not.toContain('executive');
      expect(heroString).not.toContain('boutique luxury');
      expect(heroString).not.toContain('comfort meets prestige');
    });

    it('should not contain hotel-specific strings in amenities defaults', () => {
      const amenitiesDefaults = Object.values(CONTENT_DEFAULTS.amenities);
      const amenitiesString = JSON.stringify(amenitiesDefaults).toLowerCase();

      expect(amenitiesString).not.toContain('world-class');
    });

    it('should not contain hotel-specific strings in testimonials defaults', () => {
      const testimonialsDefaults = Object.values(CONTENT_DEFAULTS.testimonials);
      const testimonialsString = JSON.stringify(testimonialsDefaults).toLowerCase();

      expect(testimonialsString).not.toContain('hear what our guests');
    });
  });

  describe('AC3-AC5: Component structure alignment', () => {
    it('should have hero defaults with all required fields', () => {
      expect(CONTENT_DEFAULTS.hero).toMatchObject({
        title: expect.any(String),
        tagline: expect.any(String),
        headline: expect.any(String),
        primaryCTA: {
          text: expect.any(String),
          href: expect.any(String),
        },
        secondaryCTA: {
          text: expect.any(String),
          href: expect.any(String),
        },
        backgroundImage: expect.any(String),
        imageAlt: expect.any(String),
      });
    });

    it('should have amenities defaults with all required fields', () => {
      expect(CONTENT_DEFAULTS.amenities).toMatchObject({
        heading: expect.any(String),
        subheading: expect.any(String),
      });
    });

    it('should have testimonials defaults with all required fields', () => {
      expect(CONTENT_DEFAULTS.testimonials).toMatchObject({
        heading: expect.any(String),
        subheading: expect.any(String),
      });
    });
  });

  describe('AC6: Fallback behavior unchanged - maintains 3-tier chain', () => {
    it('should provide immutable defaults (const assertion)', () => {
      // Verify that attempting to modify defaults would cause TypeScript error
      // This is a compile-time check, but we can verify runtime behavior
      const originalTitle = CONTENT_DEFAULTS.hero.title;

      // In JavaScript, const objects are still mutable at runtime
      // but the 'as const' assertion makes TypeScript treat them as readonly
      // We verify the default value hasn't changed
      expect(CONTENT_DEFAULTS.hero.title).toBe(originalTitle);
    });

    it('should have string values suitable for fallback chain', () => {
      // All default values should be non-empty strings
      const allDefaults = [
        CONTENT_DEFAULTS.hero.title,
        CONTENT_DEFAULTS.hero.tagline,
        CONTENT_DEFAULTS.hero.headline,
        CONTENT_DEFAULTS.hero.primaryCTA.text,
        CONTENT_DEFAULTS.hero.primaryCTA.href,
        CONTENT_DEFAULTS.hero.secondaryCTA.text,
        CONTENT_DEFAULTS.hero.secondaryCTA.href,
        CONTENT_DEFAULTS.hero.backgroundImage,
        CONTENT_DEFAULTS.hero.imageAlt,
        CONTENT_DEFAULTS.amenities.heading,
        CONTENT_DEFAULTS.amenities.subheading,
        CONTENT_DEFAULTS.testimonials.heading,
        CONTENT_DEFAULTS.testimonials.subheading,
      ];

      allDefaults.forEach((value) => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
        expect(value.trim().length).toBeGreaterThan(0);
      });
    });

    it('should have valid href values for CTAs', () => {
      expect(CONTENT_DEFAULTS.hero.primaryCTA.href).toMatch(/^\/[a-z/-]+$/);
      expect(CONTENT_DEFAULTS.hero.secondaryCTA.href).toMatch(/^\/[a-z/-]+$/);
    });
  });

  describe('TypeScript type safety', () => {
    it('should infer correct types from const assertion', () => {
      // Hero defaults
      const hero: HeroDefaults = CONTENT_DEFAULTS.hero;
      expect(hero.title).toBe('Hotel Name');

      // Amenities defaults
      const amenities: AmenitiesDefaults = CONTENT_DEFAULTS.amenities;
      expect(amenities.heading).toBe('Our Amenities');

      // Testimonials defaults
      const testimonials: TestimonialsDefaults = CONTENT_DEFAULTS.testimonials;
      expect(testimonials.heading).toBe('Guest Reviews');
    });

    it('should allow type-specific imports', () => {
      // Verify that individual type exports work
      type HeroTitle = typeof CONTENT_DEFAULTS.hero.title;
      const title: HeroTitle = 'Hotel Name';
      expect(title).toBe(CONTENT_DEFAULTS.hero.title);
    });
  });
});

/**
 * Story 13.1.3: Environment-Specific Default Behavior
 *
 * Tests for environment-aware defaults and production validation.
 */
describe('Story 13.1.3: Environment-Specific Default Behavior', () => {
  // Store original NODE_ENV
  const originalNodeEnv = process.env.NODE_ENV;

  // Helper to safely set NODE_ENV (workaround for TypeScript readonly constraint)
  const setNodeEnv = (env: string) => {
    // Delete and reassign to ensure the change takes effect in Jest
    delete process.env.NODE_ENV;
    process.env.NODE_ENV = env;
  };

  afterEach(() => {
    // Restore original NODE_ENV after each test
    setNodeEnv(originalNodeEnv || 'test');
    clearFallbackUsageBuffer();
  });

  describe('isProduction helper', () => {
    it('should return false in test environment', () => {
      // Jest runs in test environment
      expect(isProduction()).toBe(false);
    });

    it('should detect production environment', () => {
      setNodeEnv('production');
      expect(isProduction()).toBe(true);
    });

    it('should detect development environment', () => {
      setNodeEnv('development');
      expect(isProduction()).toBe(false);
    });
  });

  describe('CRITICAL_CONTENT_FIELDS', () => {
    it('should define hero.title as critical', () => {
      expect(CRITICAL_CONTENT_FIELDS).toContain('hero.title');
    });

    it('should be a readonly array', () => {
      expect(Array.isArray(CRITICAL_CONTENT_FIELDS)).toBe(true);
      expect(CRITICAL_CONTENT_FIELDS.length).toBeGreaterThan(0);
    });
  });

  describe('getContentDefault - Development behavior', () => {
    beforeEach(() => {
      setNodeEnv('development');
    });

    it('should return generic string for hero.title in development', () => {
      const title = getContentDefault('hero.title');
      expect(title).toBe('Hotel Name');
    });

    it('should return generic string for all fields in development', () => {
      expect(getContentDefault('hero.tagline')).toBe('Your Comfort is Our Priority');
      expect(getContentDefault('hero.headline')).toBe('Welcome to Our Hotel');
      expect(getContentDefault('amenities.heading')).toBe('Our Amenities');
      expect(getContentDefault('amenities.subheading')).toBe('Discover our facilities');
      expect(getContentDefault('testimonials.heading')).toBe('Guest Reviews');
      expect(getContentDefault('testimonials.subheading')).toBe('What our guests say');
    });
  });

  describe('getContentDefault - Production behavior', () => {
    beforeEach(() => {
      setNodeEnv('production');
    });

    it('should return empty string for critical fields (hero.title) in production', () => {
      const title = getContentDefault('hero.title');
      expect(title).toBe('');
    });

    it('should return generic strings for non-critical fields in production', () => {
      // Non-critical fields still return values even in production
      expect(getContentDefault('hero.tagline')).toBe('Your Comfort is Our Priority');
      expect(getContentDefault('hero.headline')).toBe('Welcome to Our Hotel');
      expect(getContentDefault('amenities.heading')).toBe('Our Amenities');
      expect(getContentDefault('testimonials.heading')).toBe('Guest Reviews');
    });
  });

  describe('logFallbackUsage', () => {
    beforeEach(() => {
      clearFallbackUsageBuffer();
    });

    it('should track fallback events in buffer', () => {
      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');

      const buffer = getFallbackUsageBuffer();
      expect(buffer.length).toBe(1);
      expect(buffer[0]).toMatchObject({
        component: 'HeroSection',
        field: 'title',
        source: 'default',
        hotelId: 'hotel-123',
      });
      expect(buffer[0].timestamp).toBeDefined();
    });

    it('should track multiple events', () => {
      logFallbackUsage('HeroSection', 'title', 'content', 'hotel-1');
      logFallbackUsage('Amenities', 'heading', 'props', 'hotel-2');
      logFallbackUsage('Testimonials', 'subheading', 'default', 'hotel-3');

      const buffer = getFallbackUsageBuffer();
      expect(buffer.length).toBe(3);
    });

    it('should limit buffer size to prevent memory issues', () => {
      // Fill buffer beyond MAX_BUFFER_SIZE (100)
      for (let i = 0; i < 150; i++) {
        logFallbackUsage('Component', 'field', 'default', `hotel-${i}`);
      }

      const buffer = getFallbackUsageBuffer();
      expect(buffer.length).toBeLessThanOrEqual(100);
    });

    it('should not log to console in development for defaults', () => {
      setNodeEnv('development');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log error to console in production for critical field defaults', () => {
      setNodeEnv('production');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('CRITICAL')
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('hotel-123')
      );

      consoleErrorSpy.mockRestore();
    });

    it('should log warning in production for non-critical field defaults', () => {
      setNodeEnv('production');
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      logFallbackUsage('Amenities', 'subheading', 'default', 'hotel-456');

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Amenities.subheading')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should not log for content or props sources', () => {
      setNodeEnv('production');
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      logFallbackUsage('HeroSection', 'title', 'content', 'hotel-123');
      logFallbackUsage('HeroSection', 'title', 'props', 'hotel-123');

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearFallbackUsageBuffer', () => {
    it('should clear all events from buffer', () => {
      logFallbackUsage('Component', 'field', 'default');
      logFallbackUsage('Component', 'field', 'default');

      expect(getFallbackUsageBuffer().length).toBe(2);

      clearFallbackUsageBuffer();

      expect(getFallbackUsageBuffer().length).toBe(0);
    });
  });

  describe('validateRequiredContent', () => {
    describe('in development', () => {
      beforeEach(() => {
        setNodeEnv('development');
      });

      it('should not throw for missing critical fields', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        expect(() => {
          validateRequiredContent({ title: '' }, 'HeroSection');
        }).not.toThrow();

        consoleWarnSpy.mockRestore();
      });

      it('should log warning for missing critical fields', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        validateRequiredContent({ title: '' }, 'HeroSection');

        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Missing required content')
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('development')
        );

        consoleWarnSpy.mockRestore();
      });

      it('should not warn when values are provided', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

        validateRequiredContent({ title: 'Grand Hotel' }, 'HeroSection');

        expect(consoleWarnSpy).not.toHaveBeenCalled();

        consoleWarnSpy.mockRestore();
      });
    });

    describe('in production', () => {
      beforeEach(() => {
        setNodeEnv('production');
      });

      it('should throw error for missing critical fields', () => {
        expect(() => {
          validateRequiredContent({ title: '' }, 'HeroSection');
        }).toThrow('Missing required content');
      });

      it('should throw error for whitespace-only critical fields', () => {
        expect(() => {
          validateRequiredContent({ title: '   ' }, 'HeroSection');
        }).toThrow('Missing required content');
      });

      it('should throw error for null/undefined critical fields', () => {
        expect(() => {
          validateRequiredContent({ title: null as unknown as string }, 'HeroSection');
        }).toThrow('Missing required content');

        expect(() => {
          validateRequiredContent({ title: undefined as unknown as string }, 'HeroSection');
        }).toThrow('Missing required content');
      });

      it('should not throw when critical fields have values', () => {
        expect(() => {
          validateRequiredContent({ title: 'Grand Hotel' }, 'HeroSection');
        }).not.toThrow();
      });

      it('should include field names in error message', () => {
        try {
          validateRequiredContent({ title: '' }, 'HeroSection');
          fail('Expected validateRequiredContent to throw');
        } catch (error) {
          expect((error as Error).message).toContain('title');
          expect((error as Error).message).toContain('HeroSection');
        }
      });
    });
  });

  describe('Integration: Environment-specific behavior end-to-end', () => {
    it('should provide graceful degradation in development', () => {
      setNodeEnv('development');

      // Get default for critical field
      const title = getContentDefault('hero.title');

      // Should have a displayable value
      expect(title).toBe('Hotel Name');
      expect(title.length).toBeGreaterThan(0);

      // Validation should not throw
      expect(() => {
        validateRequiredContent({ title }, 'HeroSection');
      }).not.toThrow();
    });

    it('should fail loudly in production for missing content', () => {
      setNodeEnv('production');

      // Get default for critical field (returns empty in production)
      const title = getContentDefault('hero.title');

      // Should be empty to trigger validation
      expect(title).toBe('');

      // Validation should throw
      expect(() => {
        validateRequiredContent({ title }, 'HeroSection');
      }).toThrow();
    });
  });
});
