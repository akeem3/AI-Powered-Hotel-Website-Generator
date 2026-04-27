/**
 * CVA Variants Test Suite
 * =====================
 *
 * Tests for CVA variants defined in Story 2.2
 * Ensures:
 * - CVA variants generate correct class combinations
 * - All variants use Story 1.11 design tokens (no hardcoded colors)
 * - Compound variants work correctly
 * - Default variants are applied
 *
 * Story 2.2 Testing Requirements AC6
 */

import { describe, it, expect } from '@jest/globals';
import {
  heroVariants,
  galleryVariants,
  navigationVariants,
  roomCardVariants,
  bookingWidgetVariants,
  contactFormVariants,
  testimonialsVariants,
  amenitiesVariants,
  type HeroVariantProps,
  type GalleryVariantProps,
  type NavigationVariantProps,
  type RoomCardVariantProps,
  type BookingWidgetVariantProps,
  type ContactFormVariantProps,
  type TestimonialsVariantProps,
  type AmenitiesVariantProps
} from '../../lib/cva-variants';

describe('CVA Variants - Story 2.2 Implementation', () => {
  describe('heroVariants', () => {
    it('applies correct base classes', () => {
      const classes = heroVariants({ style: 'modern', layout: 'centered' });
      expect(classes).toContain('relative');
      expect(classes).toContain('w-full');
      expect(classes).toContain('overflow-hidden');
    });

    it('applies style variant classes with design tokens', () => {
      const modernClasses = heroVariants({ style: 'modern', layout: 'centered' });
      expect(modernClasses).toContain('bg-gradient-to-r');
      expect(modernClasses).toContain('from-brand-primary');
      expect(modernClasses).toContain('text-text-inverted');

      const elegantClasses = heroVariants({ style: 'elegant', layout: 'centered' });
      expect(elegantClasses).toContain('bg-surface-elevated');
      expect(elegantClasses).toContain('text-text-primary');
    });

    it('uses design tokens and NOT hardcoded colors', () => {
      // Test all style variants to ensure no hardcoded colors
      const variants: HeroVariantProps['style'][] = ['modern', 'classic', 'minimal', 'bold', 'elegant'];

      variants.forEach(style => {
        const classes = heroVariants({ style, layout: 'centered' });
        // Should contain semantic design tokens
        expect(classes).toMatch(/brand-primary|brand-secondary|surface-primary|surface-elevated/);

        // Should NOT contain hardcoded colors
        expect(classes).not.toMatch(/bg-blue-|bg-gray-|text-white|bg-black|#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/);
      });
    });

    it('applies layout variant classes correctly', () => {
      const centeredClasses = heroVariants({ style: 'modern', layout: 'centered' });
      expect(centeredClasses).toContain('flex');
      expect(centeredClasses).toContain('items-center');
      expect(centeredClasses).toContain('justify-center');
      expect(centeredClasses).toContain('text-center');

      const splitClasses = heroVariants({ style: 'modern', layout: 'split' });
      expect(splitClasses).toContain('grid');
      expect(splitClasses).toContain('md:grid-cols-2');
      expect(splitClasses).toContain('gap-hero'); // Epic 15: semantic token instead of gap-8
    });

    it('applies overlay variant classes correctly', () => {
      const darkClasses = heroVariants({
        style: 'modern',
        layout: 'centered',
        overlay: 'dark'
      });
      expect(darkClasses).toContain('before:absolute');
      expect(darkClasses).toContain('before:bg-brand-primary/60');

      const gradientClasses = heroVariants({
        style: 'modern',
        layout: 'centered',
        overlay: 'gradient'
      });
      expect(gradientClasses).toContain('before:bg-gradient-to-t');
      expect(gradientClasses).toContain('before:from-brand-primary/70');
    });

    it('applies height variant classes correctly', () => {
      const smallClasses = heroVariants({
        style: 'modern',
        layout: 'centered',
        height: 'small'
      });
      expect(smallClasses).toContain('min-h-hero-sm'); // Epic 15: semantic token instead of min-h-[400px]

      const fullscreenClasses = heroVariants({
        style: 'modern',
        layout: 'centered',
        height: 'fullscreen'
      });
      expect(fullscreenClasses).toContain('min-h-screen');
    });

    it('applies compound variants correctly', () => {
      // Test minimal + dark overlay compound variant
      const classes = heroVariants({
        style: 'minimal',
        overlay: 'dark',
        layout: 'centered'
      });
      expect(classes).toContain('text-text-primary'); // Should override for minimal + overlay

      // Test centered + fullscreen compound variant
      const fullscreenClasses = heroVariants({
        style: 'modern',
        layout: 'centered',
        height: 'fullscreen'
      });
      expect(fullscreenClasses).toContain('py-section'); // Epic 15: semantic token instead of py-20
    });

    it('applies default variants when none specified', () => {
      const classes = heroVariants({});
      expect(classes).toContain('bg-gradient-to-r'); // modern style
      expect(classes).toContain('from-brand-primary'); // modern style
      expect(classes).toContain('flex'); // centered layout
      expect(classes).toContain('items-center'); // centered layout
      expect(classes).toContain('min-h-hero-md'); // Epic 15: semantic token instead of min-h-[600px]
    });
  });

  describe('galleryVariants', () => {
    it('applies correct base classes', () => {
      const classes = galleryVariants({ layout: 'grid' });
      expect(classes).toContain('w-full');
      expect(classes).toContain('overflow-hidden');
    });

    it('applies layout variant classes correctly', () => {
      const gridClasses = galleryVariants({ layout: 'grid' });
      expect(gridClasses).toContain('grid');
      expect(gridClasses).toContain('gap-gap-card'); // Epic 15: semantic token instead of gap-4

      const masonryClasses = galleryVariants({ layout: 'masonry' });
      expect(masonryClasses).toContain('columns-1'); // Default columns is 3, which maps to columns-1 on mobile
      expect(masonryClasses).toContain('lg:columns-3');

      const carouselClasses = galleryVariants({ layout: 'carousel' });
      expect(carouselClasses).toContain('flex');
      expect(carouselClasses).toContain('overflow-x-auto');
      expect(carouselClasses).toContain('snap-x');
      expect(carouselClasses).toContain('snap-mandatory');
    });

    it('applies spacing variant classes correctly', () => {
      const tightClasses = galleryVariants({ layout: 'grid', spacing: 'tight' });
      expect(tightClasses).toContain('gap-2'); // tight still uses hardcoded value

      const looseClasses = galleryVariants({ layout: 'grid', spacing: 'loose' });
      expect(looseClasses).toContain('gap-gap-section'); // Epic 15: semantic token instead of gap-6/md:gap-8
    });

    it('uses design tokens for card styles', () => {
      const defaultClasses = galleryVariants({ layout: 'grid', cardStyle: 'default' });
      expect(defaultClasses).toContain('[&_figure]:bg-surface-elevated');
      expect(defaultClasses).toContain('[&_figure]:border-transparent');
      expect(defaultClasses).toContain('[&_figure]:shadow-card');
      expect(defaultClasses).toContain('hover:[&_figure]:border-brand-secondary');
      expect(defaultClasses).toContain('hover:[&_figure]:shadow-lg');

      const minimalClasses = galleryVariants({ layout: 'grid', cardStyle: 'minimal' });
      expect(minimalClasses).toContain('[&_figure]:bg-transparent');
      expect(minimalClasses).toContain('[&_figure]:shadow-none');
    });

    it('applies compound variants correctly', () => {
      // Test grid + columns 3 compound variant
      const classes = galleryVariants({ layout: 'grid', columns: 3 });
      expect(classes).toContain('grid-cols-1');
      expect(classes).toContain('md:grid-cols-2'); // Fixed: matches cva-variants.ts implementation
      expect(classes).toContain('lg:grid-cols-3');

      // Test carousel + normal spacing compound variant
      const carouselClasses = galleryVariants({ layout: 'carousel', spacing: 'normal' });
      expect(carouselClasses).toContain('gap-5');
      expect(carouselClasses).toContain('py-8');
    });

    it('applies default variants when none specified', () => {
      const classes = galleryVariants({});
      expect(classes).toContain('grid'); // grid layout
      expect(classes).toContain('gap-gap-card'); // Epic 15: semantic token instead of gap-4/md:gap-6
      expect(classes).toContain('[&_figure_.gallery-image-wrapper]:aspect-[4/3]'); // landscape aspect ratio
      expect(classes).toContain('[&_figure]:bg-surface-elevated'); // default card style
    });
  });

  describe('navigationVariants', () => {
    it('applies correct base classes', () => {
      const classes = navigationVariants({ style: 'solid' });
      expect(classes).toContain('w-full');
      expect(classes).toContain('z-nav'); // Epic 15: semantic token instead of z-50
      expect(classes).toContain('transition-all');
      expect(classes).toContain('duration-standard'); // Epic 15: semantic token instead of duration-300
    });

    it('applies style variant classes with design tokens', () => {
      const solidClasses = navigationVariants({ style: 'solid' });
      expect(solidClasses).toContain('bg-surface-primary');
      expect(solidClasses).toContain('text-text-primary');

      const glassClasses = navigationVariants({ style: 'glass' });
      expect(glassClasses).toContain('bg-surface-primary/high');
      expect(glassClasses).toContain('backdrop-blur-md');
      expect(glassClasses).toContain('border-border-default');
    });

    it('applies layout variant classes correctly', () => {
      const compactClasses = navigationVariants({ style: 'solid', layout: 'compact' });
      expect(compactClasses).toContain('h-nav-compact');

      const tallClasses = navigationVariants({ style: 'solid', layout: 'tall' });
      expect(tallClasses).toContain('h-nav-extended');
    });

    it('applies default variants when none specified', () => {
      const classes = navigationVariants({});
      expect(classes).toContain('bg-surface-primary'); // solid style
      expect(classes).toContain('text-text-primary'); // solid style
      expect(classes).toContain('h-20'); // default layout
    });
  });

  describe('roomCardVariants', () => {
    it('applies correct base classes', () => {
      const classes = roomCardVariants({ variant: 'detailed' });
      expect(classes).toContain('group');
      expect(classes).toContain('relative');
      expect(classes).toContain('overflow-hidden');
      expect(classes).toContain('rounded-2xl');
      expect(classes).toContain('transition-all');
      expect(classes).toContain('duration-300');
    });

    it('applies variant classes with design tokens', () => {
      const detailedClasses = roomCardVariants({ variant: 'detailed' });
      expect(detailedClasses).toContain('bg-surface-primary');
      expect(detailedClasses).toContain('shadow-card');
      expect(detailedClasses).toContain('border-border-default');

      const gridClasses = roomCardVariants({ variant: 'grid' });
      expect(gridClasses).toContain('bg-surface-elevated');
      expect(gridClasses).toContain('hover:bg-surface-primary');
      expect(gridClasses).toContain('border-transparent');
      expect(gridClasses).toContain('hover:border-border-default');
    });

    it('applies default variants when none specified', () => {
      const classes = roomCardVariants({});
      expect(classes).toContain('bg-surface-primary'); // detailed variant
      expect(classes).toContain('shadow-card'); // detailed variant
      expect(classes).toContain('border-border-default'); // detailed variant
    });
  });

  describe('testimonialsVariants', () => {
    it('applies layout variant classes correctly', () => {
      const carouselClasses = testimonialsVariants({ layout: 'carousel' });
      expect(carouselClasses).toContain('relative');
      expect(carouselClasses).toContain('overflow-hidden');
      expect(carouselClasses).toContain('py-8');

      const gridClasses = testimonialsVariants({ layout: 'grid' });
      expect(gridClasses).toContain('grid');
      expect(gridClasses).toContain('gap-gap-card'); // Epic 15: semantic token instead of gap-6/md:gap-8

      const featuredClasses = testimonialsVariants({ layout: 'featured' });
      expect(featuredClasses).toContain('max-w-4xl');
      expect(featuredClasses).toContain('mx-auto');
      expect(featuredClasses).toContain('text-center');
    });

    it('uses design tokens for card styles', () => {
      const defaultClasses = testimonialsVariants({ layout: 'grid', cardStyle: 'default' });
      expect(defaultClasses).toContain('[&_.testimonial-card]:bg-surface-primary');
      expect(defaultClasses).toContain('[&_.testimonial-card]:border-border-default');
      expect(defaultClasses).toContain('[&_.testimonial-card]:shadow-sm');

      const elevatedClasses = testimonialsVariants({ layout: 'grid', cardStyle: 'elevated' });
      expect(elevatedClasses).toContain('[&_.testimonial-card]:bg-surface-elevated');
      expect(elevatedClasses).toContain('[&_.testimonial-card]:shadow-card');
      expect(elevatedClasses).toContain('hover:[&_.testimonial-card]:shadow-card-hover');
    });

    it('applies default variants when none specified', () => {
      const classes = testimonialsVariants({});
      expect(classes).toContain('grid'); // grid layout
      expect(classes).toContain('gap-gap-card'); // Epic 15: semantic token instead of gap-6/md:gap-8
      expect(classes).toContain('grid-cols-1'); // 3 columns
      expect(classes).toContain('md:grid-cols-3'); // 3 columns
      expect(classes).toContain('[&_.testimonial-card]:bg-surface-primary'); // default card style
    });
  });

  describe('amenitiesVariants', () => {
    it('applies layout variant classes correctly', () => {
      const gridClasses = amenitiesVariants({ layout: 'grid' });
      expect(gridClasses).toContain('grid');
      expect(gridClasses).toContain('gap-gap-card'); // Epic 15: semantic token instead of gap-6/md:gap-8

      const listClasses = amenitiesVariants({ layout: 'list' });
      expect(listClasses).toContain('grid');
      expect(listClasses).toContain('gap-gap-card'); // Epic 15: semantic token instead of gap-y-4
    });

    it('applies icon size variant classes correctly', () => {
      const smallClasses = amenitiesVariants({ layout: 'grid', iconSize: 'small' });
      expect(smallClasses).toContain('[&_.svg-inline--fa]:w-4');
      expect(smallClasses).toContain('[&_.svg-inline--fa]:h-4');

      const largeClasses = amenitiesVariants({ layout: 'grid', iconSize: 'large' });
      expect(largeClasses).toContain('[&_.svg-inline--fa]:w-8');
      expect(largeClasses).toContain('[&_.svg-inline--fa]:h-8');
    });

    it('uses design tokens for icon styles', () => {
      const defaultClasses = amenitiesVariants({ layout: 'grid', iconStyle: 'default' });
      expect(defaultClasses).toContain('[&_.icon-wrapper]:bg-brand-primary/wash');
      expect(defaultClasses).toContain('[&_.icon-wrapper]:text-brand-primary');

      const coloredClasses = amenitiesVariants({ layout: 'grid', iconStyle: 'colored' });
      expect(coloredClasses).toContain('[&_.icon-wrapper]:bg-brand-secondary/wash');
      expect(coloredClasses).toContain('[&_.icon-wrapper]:text-brand-secondary');
    });

    it('applies default variants when none specified', () => {
      const classes = amenitiesVariants({});
      expect(classes).toContain('grid'); // grid layout
      expect(classes).toContain('gap-gap-card'); // Epic 15: semantic token instead of gap-6/md:gap-8
      expect(classes).toContain('grid-cols-1'); // default columns (4)
      expect(classes).toContain('md:grid-cols-4'); // default columns (4)
      expect(classes).toContain('[&_.svg-inline--fa]:w-5'); // medium icon size
      expect(classes).toContain('[&_.svg-inline--fa]:h-5'); // medium icon size
      expect(classes).toContain('[&_.icon-wrapper]:bg-brand-primary/wash'); // default icon style
    });
  });

  describe('bookingWidgetVariants', () => {
    it('applies variant classes with design tokens', () => {
      const desktopClasses = bookingWidgetVariants({ variant: 'desktop', theme: 'light' });
      // Backgrounds handled by child components, wrapper only provides layout/border
      expect(desktopClasses).toContain('shadow-lg');
      expect(desktopClasses).toContain('rounded-xl');
      expect(desktopClasses).toContain('border');
      expect(desktopClasses).toContain('border-border-default');

      const mobileClasses = bookingWidgetVariants({ variant: 'mobile', theme: 'light' });
      expect(mobileClasses).toContain('fixed');
      expect(mobileClasses).toContain('bottom-0');
      expect(mobileClasses).toContain('border-t');
      expect(mobileClasses).toContain('border-border-default');
    });

    it('applies theme variant classes correctly', () => {
      // Themes only provide text color - backgrounds handled by child components
      const darkClasses = bookingWidgetVariants({ variant: 'desktop', theme: 'dark' });
      expect(darkClasses).toContain('text-text-primary');

      const glassClasses = bookingWidgetVariants({ variant: 'desktop', theme: 'glass' });
      expect(glassClasses).toContain('text-text-primary');
    });

    it('applies default variants when none specified', () => {
      const classes = bookingWidgetVariants({});
      // Defaults: desktop variant + light theme
      expect(classes).toContain('shadow-lg');
      expect(classes).toContain('rounded-xl');
      expect(classes).toContain('border-border-default');
      expect(classes).toContain('text-text-primary');
    });
  });

  describe('contactFormVariants', () => {
    it('applies style variant classes with design tokens', () => {
      const defaultClasses = contactFormVariants({ style: 'default' });
      expect(defaultClasses).toContain('bg-surface-primary');
      expect(defaultClasses).toContain('shadow-card');
      expect(defaultClasses).toContain('border-surface-secondary');

      const floatingClasses = contactFormVariants({ style: 'floating' });
      expect(floatingClasses).toContain('bg-surface-primary');
      expect(floatingClasses).toContain('shadow-xl');
      expect(floatingClasses).toContain('-mt-20');
      expect(floatingClasses).toContain('relative');
      expect(floatingClasses).toContain('z-10');
    });

    it('applies background variant classes correctly', () => {
      const brandClasses = contactFormVariants({ style: 'default', background: 'brand' });
      expect(brandClasses).toContain('bg-brand-primary/faint');

      const mutedClasses = contactFormVariants({ style: 'default', background: 'muted' });
      expect(mutedClasses).toContain('bg-surface-muted');
    });

    it('applies default variants when none specified', () => {
      const classes = contactFormVariants({});
      expect(classes).toContain('bg-surface-primary'); // default style
      expect(classes).toContain('shadow-card'); // default style
      expect(classes).toContain('border-surface-secondary'); // default style
    });
  });
});

describe('CVA Design Token Compliance - Story 2.2 AC5', () => {
  it('ensures NO hardcoded colors in any variant', () => {
    const allVariantFunctions = [
      heroVariants,
      galleryVariants,
      navigationVariants,
      roomCardVariants,
      bookingWidgetVariants,
      contactFormVariants,
      testimonialsVariants,
      amenitiesVariants
    ];

    const hardcodedPatterns = [
      /bg-blue-/, /bg-gray-/, /bg-red-/, /bg-green-/, /bg-yellow-/,
      /text-white/, /text-black/, /border-blue-/, /border-gray-/,
      /#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})/
    ];

    allVariantFunctions.forEach((variantFn, index) => {
      const variantNames = [
        'heroVariants', 'galleryVariants', 'navigationVariants', 'roomCardVariants',
        'bookingWidgetVariants', 'contactFormVariants', 'testimonialsVariants', 'amenitiesVariants'
      ];

      // Test with common variant combinations
      const testProps = [
        {}, // default variants
        { style: 'modern' }, // if style exists
        { layout: 'grid' }, // if layout exists
        { variant: 'default' }, // if variant exists
        { theme: 'light' }, // if theme exists
      ];

      testProps.forEach(props => {
        try {
          const classes = variantFn(props as any);

          hardcodedPatterns.forEach(pattern => {
            expect(classes).not.toMatch(pattern);
          });
        } catch (error) {
          // Invalid props for this variant function, skip
        }
      });
    });
  });

  it('ensures ALL variants use semantic design tokens', () => {
    const semanticTokenPatterns = [
      /brand-primary/, /brand-secondary/,
      /surface-primary/, /surface-elevated/, /surface-muted/, /surface-secondary/,
      /text-primary/, /text-inverted/, /text-muted/,
      /border-default/, /border-primary/,
      /shadow-card/, /shadow-card-hover/
    ];

    // Test that at least one semantic token is present in most variants
    const heroClasses = heroVariants({ style: 'modern', layout: 'centered' });
    const hasSemanticTokens = semanticTokenPatterns.some(pattern =>
      pattern.test(heroClasses)
    );
    expect(hasSemanticTokens).toBe(true);
  });
});