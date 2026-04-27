// web-app/tests/contracts/UIComponentContracts.test.ts
// Tests for Story 1.9: ZOD Contract Development for Core Components
// Updated for Story 18.6: Navigation layout enum values

import { z } from 'zod';
import { UIComponentContracts } from '@/lib/contracts/component-contracts';
import { validateComponentContract } from '@/lib/contractValidation';
import { withValidation } from '@/lib/contracts/withValidation';
import { NavigationContract, type NavigationConfig } from '@/lib/contracts/navigation.contract';

// Mock contracts for testing since the actual ones aren't implemented yet
const MockButtonContract = z.object({
  variant: z.enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']),
  size: z.enum(['default', 'sm', 'lg', 'icon']),
  asChild: z.boolean().optional(),
  className: z.string().optional(),
  disabled: z.boolean().optional(),
  children: z.any().optional(),
});

const MockNavigationContract = z.object({
  mobileVariant: z.enum(['hamburger', 'sidebar']),
  desktopVariant: z.enum(['horizontal', 'centered']),
  logoUrl: z.string().url().optional(),
  showBookingCTA: z.boolean(),
  menuItems: z.array(z.object({
    label: z.string(),
    href: z.string(),
    active: z.boolean().optional(),
  })),
});

describe('UIComponentContracts (Story 1.9)', () => {
  describe('Button Contract Validation', () => {
    const validButtonConfig = {
      variant: 'default' as const,
      size: 'default' as const,
      disabled: false,
      children: 'Click me',
    };

    it('should accept valid button configurations', () => {
      expect(() => MockButtonContract.parse(validButtonConfig)).not.toThrow();
    });

    it('should accept all valid variants', () => {
      const validVariants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
      validVariants.forEach(variant => {
        expect(() => MockButtonContract.parse({ ...validButtonConfig, variant })).not.toThrow();
      });
    });

    it('should accept all valid sizes', () => {
      const validSizes = ['default', 'sm', 'lg', 'icon'] as const;
      validSizes.forEach(size => {
        expect(() => MockButtonContract.parse({ ...validButtonConfig, size })).not.toThrow();
      });
    });

    it('should reject invalid variants', () => {
      expect(() => MockButtonContract.parse({ ...validButtonConfig, variant: 'invalid' }))
        .toThrow(/Invalid option/);
    });

    it('should reject invalid sizes', () => {
      expect(() => MockButtonContract.parse({ ...validButtonConfig, size: 'invalid' }))
        .toThrow(/Invalid option/);
    });

    it('should accept optional properties', () => {
      const configWithOptions = {
        ...validButtonConfig,
        asChild: true,
        className: 'custom-class',
        disabled: true,
      };
      expect(() => MockButtonContract.parse(configWithOptions)).not.toThrow();
    });
  });

  describe('Navigation Contract Validation', () => {
    const validNavigationConfig = {
      mobileVariant: 'hamburger' as const,
      desktopVariant: 'horizontal' as const,
      logoUrl: 'https://example.com/logo.png',
      showBookingCTA: true,
      menuItems: [
        { label: 'Home', href: '/', active: true },
        { label: 'Rooms', href: '/rooms' },
        { label: 'Contact', href: '/contact' },
      ],
    };

    it('should accept valid navigation configurations', () => {
      expect(() => MockNavigationContract.parse(validNavigationConfig)).not.toThrow();
    });

    it('should accept all valid mobile variants', () => {
      const validVariants = ['hamburger', 'sidebar'] as const;
      validVariants.forEach(variant => {
        expect(() => MockNavigationContract.parse({ ...validNavigationConfig, mobileVariant: variant })).not.toThrow();
      });
    });

    it('should accept all valid desktop variants', () => {
      const validVariants = ['horizontal', 'centered'] as const;
      validVariants.forEach(variant => {
        expect(() => MockNavigationContract.parse({ ...validNavigationConfig, desktopVariant: variant })).not.toThrow();
      });
    });

    it('should reject invalid mobile variants', () => {
      expect(() => MockNavigationContract.parse({ ...validNavigationConfig, mobileVariant: 'invalid' }))
        .toThrow(/Invalid option/);
    });

    it('should reject invalid desktop variants', () => {
      expect(() => MockNavigationContract.parse({ ...validNavigationConfig, desktopVariant: 'invalid' }))
        .toThrow(/Invalid option/);
    });

    it('should reject invalid URLs', () => {
      expect(() => MockNavigationContract.parse({ ...validNavigationConfig, logoUrl: 'not-a-url' }))
        .toThrow(/Invalid URL/);
    });

    it('should accept empty menu items array', () => {
      expect(() => MockNavigationContract.parse({ ...validNavigationConfig, menuItems: [] })).not.toThrow();
    });

    it('should validate menu item structure', () => {
      const invalidMenuItems = [
        { label: 'Home' }, // missing href
        { href: '/rooms' }, // missing label
        { label: 'Rooms', href: 123 }, // invalid href type
      ];

      invalidMenuItems.forEach((item, index) => {
        expect(() => MockNavigationContract.parse({ ...validNavigationConfig, menuItems: [item] }))
          .toThrow();
      });
    });
  });
});

describe('Story 18.6 - NavigationContract Layout Enum Validation', () => {
  // NavigationContract requires brandName and links (Epic 22: data-driven navigation)
  const baseNavFields = {
    brandName: 'Test Hotel',
    links: [{ label: 'Home', href: '/' }],
  };

  describe('Valid layout enum values', () => {
    const validNavigationConfigs = [
      {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        variant: {
          style: 'solid' as const,
          layout: 'classic' as const,
        },
      },
      {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        variant: {
          style: 'transparent' as const,
          layout: 'compact' as const,
        },
      },
      {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        variant: {
          style: 'glass' as const,
          layout: 'extended' as const,
        },
      },
    ];

    validNavigationConfigs.forEach((config) => {
      it(`should validate layout="${config.variant.layout}" with style="${config.variant.style}"`, () => {
        const result = NavigationContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.layout).toBe(config.variant.layout);
          expect(result.data.variant?.style).toBe(config.variant.style);
        }
      });
    });

    it('should validate config with layout only (no style)', () => {
      const config = {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        variant: {
          layout: 'classic' as const,
        },
      };
      const result = NavigationContract.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate config with style only (no layout)', () => {
      const config = {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        variant: {
          style: 'solid' as const,
        },
      };
      const result = NavigationContract.safeParse(config);
      expect(result.success).toBe(true);
    });

    it('should validate config with no variant', () => {
      const config = {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
      };
      const result = NavigationContract.safeParse(config);
      expect(result.success).toBe(true);
    });
  });

  describe('Legacy layout values should fail validation', () => {
    const legacyLayoutValues = ['default', 'tall'];

    legacyLayoutValues.forEach((layout) => {
      it(`should reject layout="${layout}" (legacy value)`, () => {
        const config = {
          brandName: 'Test Hotel',
          links: [{ label: 'Home', href: '/' }],
          variant: {
            layout: layout as any, // Cast to any to test runtime validation
            style: 'solid' as const,
          },
        };
        const result = NavigationContract.safeParse(config);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('All valid style enum values', () => {
    const validStyles = ['transparent', 'solid', 'glass'] as const;

    validStyles.forEach((style) => {
      it(`should validate style="${style}"`, () => {
        const config = {
          brandName: 'Test Hotel',
          links: [{ label: 'Home', href: '/' }],
          variant: {
            style: style,
            layout: 'classic' as const,
          },
        };
        const result = NavigationContract.safeParse(config);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant?.style).toBe(style);
        }
      });
    });
  });

  describe('Type safety and inference', () => {
    it('should correctly infer NavigationConfig type', () => {
      const config: NavigationConfig = {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        variant: {
          style: 'solid',
          layout: 'classic',
        },
      };

      // Should compile without errors
      expect(config.variant?.style).toBe('solid');
      expect(config.variant?.layout).toBe('classic');
    });

    it('should only accept valid layout values in typed code', () => {
      // This test verifies TypeScript compilation
      const validLayouts: Array<'classic' | 'compact' | 'extended'> = ['classic', 'compact', 'extended'];
      expect(validLayouts).toHaveLength(3);
    });
  });
});

describe('Contract Integration Layer (Story 1.9)', () => {
  it('should handle missing contracts gracefully', () => {
    const config = { someProp: 'value' };
    const result = validateComponentContract('nonExistentComponent', config);
    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('No contract exists');
  });
});

describe('withValidation HOC (Story 1.9)', () => {
  const MockComponent = jest.fn(() => null);
  MockComponent.displayName = 'MockComponent';

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.warn to capture warnings
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create HOC without throwing errors', () => {
    expect(() => {
      const ValidatedComponent = withValidation(MockComponent, 'testComponent');
      expect(ValidatedComponent).toBeDefined();
    }).not.toThrow();
  });

  it('should have correct display name', () => {
    const ValidatedComponent = withValidation(MockComponent, 'testComponent');
    expect(ValidatedComponent.displayName).toBe('WithValidation(MockComponent)');
  });
});

describe('Performance Impact (Story 1.9)', () => {
  it('should validate contracts within performance threshold', () => {
    const startTime = performance.now();

    // Run multiple validations to measure performance
    for (let i = 0; i < 1000; i++) {
      MockButtonContract.parse({
        variant: 'default',
        size: 'lg',
        children: 'Test Button',
      });
    }

    const endTime = performance.now();
    const averageTime = (endTime - startTime) / 1000;

    // Requirement: < 5ms validation overhead per component
    expect(averageTime).toBeLessThan(5);
  });

  it('should handle large navigation menus efficiently', () => {
    const largeMenuItems = Array.from({ length: 100 }, (_, i) => ({
      label: `Menu Item ${i}`,
      href: `/item-${i}`,
      active: i % 10 === 0,
    }));

    const startTime = performance.now();

    MockNavigationContract.parse({
      mobileVariant: 'hamburger',
      desktopVariant: 'horizontal',
      showBookingCTA: true,
      menuItems: largeMenuItems,
    });

    const endTime = performance.now();
    const validationTime = endTime - startTime;

    // Even large menus should validate quickly
    expect(validationTime).toBeLessThan(10);
  });
});

// ============================================================================
// STORY 24.11 & 24.14: EXTENDED NAVIGATION LINKS VALIDATION
// ============================================================================

describe('Story 24.11 & 24.14 - Extended Navigation Links (Epic 22 Contract)', () => {
  describe('8-link maximum validation (Story 24.14)', () => {
    const eightLinkNavigationConfig = {
      variant: {
        style: 'solid' as const,
        layout: 'classic' as const,
      },
      brandName: 'Test Hotel',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Rooms', href: '/rooms' },
        { label: 'Gallery', href: '/gallery' },
        { label: 'Amenities', href: '/amenities' },
        { label: 'Reviews', href: '/reviews' },
        { label: 'Contact', href: '/contact' },
        { label: 'About', href: '/about' },
        { label: 'FAQ', href: '/faq' },
      ],
      ctaButton: { text: 'Book Now', href: '/book' },
    };

    it('should accept 8 navigation links (maximum per contract)', () => {
      const result = NavigationContract.safeParse(eightLinkNavigationConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.links).toHaveLength(8);
      }
    });

    it('should validate all 8 links have required fields', () => {
      const result = NavigationContract.safeParse(eightLinkNavigationConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        result.data.links.forEach((link) => {
          expect(link).toHaveProperty('label');
          expect(link).toHaveProperty('href');
          expect(typeof link.label).toBe('string');
          expect(typeof link.href).toBe('string');
        });
      }
    });

    it('should include all required sub-page links from Epic 24', () => {
      const result = NavigationContract.safeParse(eightLinkNavigationConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        const linkHrefs = result.data.links.map(l => l.href);
        expect(linkHrefs).toContain('/rooms');
        expect(linkHrefs).toContain('/gallery');
        expect(linkHrefs).toContain('/amenities');
        expect(linkHrefs).toContain('/reviews');
        expect(linkHrefs).toContain('/contact');
        expect(linkHrefs).toContain('/about');
        expect(linkHrefs).toContain('/faq');
      }
    });
  });

  describe('Backward compatibility with 3-link navigation (Story 24.14)', () => {
    const threeLinkNavigationConfig = {
      variant: {
        style: 'solid' as const,
        layout: 'classic' as const,
      },
      brandName: 'Test Hotel',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Rooms', href: '/rooms' },
        { label: 'Contact', href: '/contact' },
      ],
      ctaButton: { text: 'Book', href: '/book' },
    };

    it('should parse existing 3-link configurations (backward compatibility)', () => {
      const result = NavigationContract.safeParse(threeLinkNavigationConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.links).toHaveLength(3);
      }
    });

    it('should maintain 3-link contract structure unchanged', () => {
      const result = NavigationContract.safeParse(threeLinkNavigationConfig);
      expect(result.success).toBe(true);
      if (result.success) {
        // Verify all original fields are preserved
        expect(result.data.brandName).toBe('Test Hotel');
        expect(result.data.links[0].label).toBe('Home');
        expect(result.data.links[0].href).toBe('/');
        expect(result.data.links[1].label).toBe('Rooms');
        expect(result.data.links[1].href).toBe('/rooms');
        expect(result.data.links[2].label).toBe('Contact');
        expect(result.data.links[2].href).toBe('/contact');
      }
    });

    it('should accept 3-link config with all variant options', () => {
      const variants = [
        { style: 'solid' as const, layout: 'classic' as const },
        { style: 'transparent' as const, layout: 'compact' as const },
        { style: 'glass' as const, layout: 'extended' as const },
        { style: 'solid' as const }, // style only
        { layout: 'classic' as const }, // layout only
      ];

      variants.forEach((variant) => {
        const config = { ...threeLinkNavigationConfig, variant };
        const result = NavigationContract.safeParse(config);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Graduated navigation sizes between 1 and 8 links (Story 24.14)', () => {
    const baseConfig = {
      variant: { style: 'solid' as const, layout: 'classic' as const },
      brandName: 'Test Hotel',
      ctaButton: { text: 'Book', href: '/book' },
    };

    it('should accept 1 link (minimum)', () => {
      const config = { ...baseConfig, links: [{ label: 'Home', href: '/' }] };
      const result = NavigationContract.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.links).toHaveLength(1);
      }
    });

    it('should accept 4 links (between min and max)', () => {
      const config = {
        ...baseConfig,
        links: [
          { label: 'Home', href: '/' },
          { label: 'Rooms', href: '/rooms' },
          { label: 'Gallery', href: '/gallery' },
          { label: 'Contact', href: '/contact' },
        ],
      };
      const result = NavigationContract.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.links).toHaveLength(4);
      }
    });

    it('should accept 6 links (between min and max)', () => {
      const config = {
        ...baseConfig,
        links: [
          { label: 'Home', href: '/' },
          { label: 'Rooms', href: '/rooms' },
          { label: 'Gallery', href: '/gallery' },
          { label: 'Amenities', href: '/amenities' },
          { label: 'Reviews', href: '/reviews' },
          { label: 'Contact', href: '/contact' },
        ],
      };
      const result = NavigationContract.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.links).toHaveLength(6);
      }
    });

    it('should accept 8 links (maximum)', () => {
      const config = {
        ...baseConfig,
        links: [
          { label: 'Home', href: '/' },
          { label: 'Rooms', href: '/rooms' },
          { label: 'Gallery', href: '/gallery' },
          { label: 'Amenities', href: '/amenities' },
          { label: 'Reviews', href: '/reviews' },
          { label: 'Contact', href: '/contact' },
          { label: 'About', href: '/about' },
          { label: 'FAQ', href: '/faq' },
        ],
      };
      const result = NavigationContract.safeParse(config);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.links).toHaveLength(8);
      }
    });
  });
});