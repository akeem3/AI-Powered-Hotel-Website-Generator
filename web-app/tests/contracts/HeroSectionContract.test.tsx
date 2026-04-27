import { HeroSectionContract } from '../../lib/contracts/hero.contract';
import { testContractPerformance, testContractValidation } from './contract-test-utils';

describe('HeroSection Contract Validation', () => {
  const validConfig = {
    title: 'Welcome to The Sterling Executive',
    headline: 'Experience Luxury and Comfort',
    subtitle: 'Test Hotel',
    background: 'solid' as const
  };

  const invalidConfigs = [
    { title: 123, background: 'invalid' }, // Invalid types
    { title: '', background: 'solid' }, // Empty title
    { headline: 'Test' }, // Missing required title
    { title: 'Test', headline: '' }, // Empty headline
    { title: 'Test', headline: 'Valid', background: 'invalid' }, // Invalid background
    { title: 'a'.repeat(201), headline: 'Valid' }, // Title too long (> 200 for multi-language)
    { title: 'Valid', headline: 'a'.repeat(501) }, // Headline too long (> 500 for multi-language)
    { title: 'Valid', headline: 'Valid', tagline: 'a'.repeat(401) }, // Tagline too long (> 400 for multi-language)
    { title: 'Valid', headline: 'Valid', description: 'a'.repeat(801) }, // Description too long (> 800 for multi-language)
  ];

  describe('Contract Validation Tests', () => {
    it('should validate valid configuration', () => {
      testContractValidation(HeroSectionContract, validConfig, invalidConfigs);
    });

    it('should validate configuration with optional fields', () => {
      const configWithOptionals = {
        ...validConfig,
        tagline: 'Luxury Redefined',
        description: 'Experience the finest hospitality',
        primaryCTA: {
          text: 'Book Now',
          href: '/booking',
          ariaLabel: 'Book your stay'
        },
        secondaryCTA: {
          text: 'View Rooms',
          href: '/rooms',
          ariaLabel: 'View available rooms'
        },
        background: 'gradient' as const,
        className: 'custom-hero-class'
      };

      const result = HeroSectionContract.safeParse(configWithOptionals);
      expect(result.success).toBe(true);
    });

    it('should validate minimal configuration', () => {
      const minimalConfig = {
        title: 'Simple Hotel',
        headline: 'Simple Experience'
      };

      const result = HeroSectionContract.safeParse(minimalConfig);
      expect(result.success).toBe(true);
    });

    it('should validate configuration with only primary CTA', () => {
      const configWithPrimaryCTA = {
        title: 'Hotel Name',
        headline: 'Tagline',
        primaryCTA: {
          text: 'Book Now',
          href: '/booking'
        }
      };

      const result = HeroSectionContract.safeParse(configWithPrimaryCTA);
      expect(result.success).toBe(true);
    });

    it('should validate configuration with only secondary CTA', () => {
      const configWithSecondaryCTA = {
        title: 'Hotel Name',
        headline: 'Tagline',
        secondaryCTA: {
          text: 'Learn More',
          href: '/about'
        }
      };

      const result = HeroSectionContract.safeParse(configWithSecondaryCTA);
      expect(result.success).toBe(true);
    });
  });

  describe('Contract Performance Tests', () => {
    it('should validate under performance threshold', () => {
      testContractPerformance(HeroSectionContract, validConfig, 5);
    });

    it('should validate complex configuration under performance threshold', () => {
      const complexConfig = {
        title: 'The Sterling Executive Hotel',
        headline: 'Where Business Meets Boutique Excellence',
        tagline: 'Experience unparalleled luxury and service',
        subtitle: 'A premier destination for discerning travelers',
        description: 'Discover a world of refined elegance and personalized service at our award-winning hotel, where every detail is crafted to exceed your expectations.',
        primaryCTA: {
          text: 'Reserve Your Stay',
          href: '/booking',
          ariaLabel: 'Reserve your room now'
        },
        secondaryCTA: {
          text: 'Explore Amenities',
          href: '/amenities',
          ariaLabel: 'Explore hotel amenities and services'
        },
        background: 'gradient' as const,
        className: 'hero-section executive-hero custom-styling'
      };

      testContractPerformance(HeroSectionContract, complexConfig, 5);
    });
  });

  describe('Invalid Data Tests', () => {
    it('should reject missing required fields', () => {
      const invalidConfigs = [
        {}, // Missing all required fields
        { title: 'Test' }, // Missing headline
        { headline: 'Test' }, // Missing title
      ];

      invalidConfigs.forEach((config, index) => {
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    it('should reject invalid CTA configurations', () => {
      const invalidCTAConfigs = [
        {
          title: 'Test Hotel',
          headline: 'Test Tagline',
          primaryCTA: {
            // Missing text and href
          }
        },
        {
          title: 'Test Hotel',
          headline: 'Test Tagline',
          primaryCTA: {
            text: '', // Empty text
            href: '/booking'
          }
        },
        {
          title: 'Test Hotel',
          headline: 'Test Tagline',
          primaryCTA: {
            text: 'Book Now',
            href: '' // Empty href
          }
        },
        {
          title: 'Test Hotel',
          headline: 'Test Tagline',
          primaryCTA: {
            text: 'a'.repeat(51), // Text too long
            href: '/booking'
          }
        },
        {
          title: 'Test Hotel',
          headline: 'Test Tagline',
          primaryCTA: {
            text: 'Book Now',
            href: 'a'.repeat(201) // Href too long
          }
        }
      ];

      invalidCTAConfigs.forEach((config) => {
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    it('should reject invalid background values', () => {
      const invalidBackgroundConfigs = [
        {
          title: 'Test Hotel',
          headline: 'Test Tagline',
          background: 'invalid' as any
        },
        {
          title: 'Test Hotel',
          headline: 'Test Tagline',
          background: 123 as any
        }
      ];

      invalidBackgroundConfigs.forEach((config) => {
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Default Values Tests', () => {
    it('should provide correct default values', () => {
      const minimalConfig = {
        title: 'Test Hotel',
        headline: 'Test Tagline'
      };

      const result = HeroSectionContract.safeParse(minimalConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.background).toBe('solid'); // Default value
        expect(result.data.primaryCTA).toBeUndefined();
        expect(result.data.secondaryCTA).toBeUndefined();
        expect(result.data.subtitle).toBeUndefined();
        expect(result.data.description).toBeUndefined();
        expect(result.data.tagline).toBeUndefined();
        expect(result.data.className).toBeUndefined();
      }
    });
  });

  describe('Type Safety Tests', () => {
    it('should maintain type safety for valid data', () => {
      const result = HeroSectionContract.safeParse(validConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(typeof result.data.title).toBe('string');
        expect(typeof result.data.headline).toBe('string');
        expect(typeof result.data.background).toBe('string');
      }
    });

    it('should accept valid background types', () => {
      const solidConfig = { ...validConfig, background: 'solid' as const };
      const gradientConfig = { ...validConfig, background: 'gradient' as const };

      const solidResult = HeroSectionContract.safeParse(solidConfig);
      const gradientResult = HeroSectionContract.safeParse(gradientConfig);

      expect(solidResult.success).toBe(true);
      expect(gradientResult.success).toBe(true);

      if (solidResult.success && gradientResult.success) {
        expect(solidResult.data.background).toBe('solid');
        expect(gradientResult.data.background).toBe('gradient');
      }
    });
  });

  /**
   * Phase 7: Story 17.1 Contract Layout Enum Validation Tests
   *
   * Verifies that the updated HeroSectionContract accepts the new layout values
   * and rejects the deprecated 'fullscreen' layout value.
   *
   * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.1
   */
  describe('Story 17.1: Layout Enum Validation', () => {
    describe('Valid layout values should pass validation', () => {
      it('should accept centered layout', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'centered' as const,
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.layout).toBe('centered');
        }
      });

      it('should accept split layout', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'split' as const,
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.layout).toBe('split');
        }
      });

      it('should accept minimal layout', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'minimal' as const,
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.layout).toBe('minimal');
        }
      });
    });

    describe('Deprecated layout value should fail validation', () => {
      it('should reject fullscreen layout with medium height', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'fullscreen' as any,
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
        expect(result.error?.issues.length).toBeGreaterThan(0);
      });

      it('should reject fullscreen layout with fullscreen height', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'fullscreen' as any,
            style: 'modern',
            overlay: 'none',
            height: 'fullscreen'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
        expect(result.error?.issues.length).toBeGreaterThan(0);
      });
    });

    describe('Invalid layout values should fail validation', () => {
      it('should reject carousel layout', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'carousel' as any,
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
      });

      it('should reject video layout', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'video' as any,
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
      });

      it('should reject numeric layout', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 123 as any,
            style: 'modern',
            overlay: 'none',
            height: 'medium'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });

    describe('All variant dimension enums should be validated', () => {
      it('should validate style enum values', () => {
        const validStyles = ['modern', 'classic', 'minimal', 'bold', 'elegant'] as const;
        validStyles.forEach((style) => {
          const config = {
            title: 'Test Hotel',
            headline: 'Test Headline',
            variant: { style }
          };
          const result = HeroSectionContract.safeParse(config);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.variant?.style).toBe(style);
          }
        });
      });

      it('should reject invalid style value', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: { style: 'future-style' as any }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
      });

      it('should validate overlay enum values', () => {
        const validOverlays = ['none', 'light', 'dark', 'gradient'] as const;
        validOverlays.forEach((overlay) => {
          const config = {
            title: 'Test Hotel',
            headline: 'Test Headline',
            variant: { overlay }
          };
          const result = HeroSectionContract.safeParse(config);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.variant?.overlay).toBe(overlay);
          }
        });
      });

      it('should reject invalid overlay value', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: { overlay: 'strong' as any }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
      });

      it('should validate height enum values', () => {
        const validHeights = ['small', 'medium', 'large', 'fullscreen'] as const;
        validHeights.forEach((height) => {
          const config = {
            title: 'Test Hotel',
            headline: 'Test Headline',
            variant: { height }
          };
          const result = HeroSectionContract.safeParse(config);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.variant?.height).toBe(height);
          }
        });
      });

      it('should reject invalid height value', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: { height: 'extra-large' as any }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });

    describe('Combined variant validation should work correctly', () => {
      it('should validate centered layout with elegant style', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'centered',
            style: 'elegant',
            overlay: 'gradient',
            height: 'fullscreen'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.layout).toBe('centered');
          expect(result.data.variant?.style).toBe('elegant');
          expect(result.data.variant?.overlay).toBe('gradient');
          expect(result.data.variant?.height).toBe('fullscreen');
        }
      });

      it('should validate split layout with modern style', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'split',
            style: 'modern',
            overlay: 'none',
            height: 'large'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.layout).toBe('split');
          expect(result.data.variant?.style).toBe('modern');
          expect(result.data.variant?.overlay).toBe('none');
          expect(result.data.variant?.height).toBe('large');
        }
      });

      it('should validate minimal layout with minimal style', () => {
        const config = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          variant: {
            layout: 'minimal',
            style: 'minimal',
            overlay: 'none',
            height: 'small'
          }
        };
        const result = HeroSectionContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.layout).toBe('minimal');
          expect(result.data.variant?.style).toBe('minimal');
          expect(result.data.variant?.overlay).toBe('none');
          expect(result.data.variant?.height).toBe('small');
        }
      });
    });
  });
});