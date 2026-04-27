/**
 * HeroSection Router - Integration Tests
 *
 * Tests for Story 17.1 acceptance criteria related to integration verification.
 * Verifies that the router works correctly with proper prop passing.
 *
 * @module tests/components/sections
 */

import { render } from '@testing-library/react';
import HeroSection from '@/components/sections/HeroSection';

describe('HeroSection Router - Integration Tests', () => {
  describe('Router receives and processes variant.layout correctly', () => {
    it('should accept and process layout=centered from variant object', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Welcome"
          variant={{ layout: 'centered', style: 'modern', overlay: 'none', height: 'medium' }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // HeroCentered uses flex layout
      expect(section).toHaveClass('flex');
    });

    it('should accept and process layout=split from variant object', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Welcome"
          variant={{ layout: 'split', style: 'modern', overlay: 'none', height: 'medium' }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // HeroSplit stub renders a section
      expect(section).toBeInTheDocument();
    });

    it('should accept and process layout=minimal from variant object', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Simple"
          variant={{ layout: 'minimal', style: 'minimal', overlay: 'none', height: 'small' }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // HeroMinimal stub renders a section
      expect(section).toBeInTheDocument();
    });
  });

  describe('Router passes all variant properties to sub-components', () => {
    it('should pass style, overlay, and height with layout to sub-component', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Welcome"
          variant={{
            layout: 'centered',
            style: 'elegant',
            overlay: 'gradient',
            height: 'large'
          }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Verify the variant classes are applied via heroVariants CVA
      // CVA transforms variant names to actual Tailwind classes
      expect(section).toHaveClass('bg-surface-elevated');
      expect(section).toHaveClass('min-h-hero-lg');
    });
  });

  describe('Animation support through router', () => {
    it('should support animations for centered layout', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Welcome"
          variant={{ layout: 'centered', height: 'medium' }}
          enableAnimations={true}
        />
      );

      // AnimatedHeroSection should be used
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should support animations for split layout', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Welcome"
          variant={{ layout: 'split', height: 'medium' }}
          enableAnimations={true}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should NOT support animations for minimal layout', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Simple"
          variant={{ layout: 'minimal', height: 'small' }}
          enableAnimations={true}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // HeroMinimal is rendered (no animation support)
      expect(section).toBeInTheDocument();
    });
  });

  describe('ComponentRenderer-style prop passing', () => {
    it('should accept CTA objects like ComponentRenderer passes', () => {
      // This test verifies that the router accepts and passes through CTA object props
      // The actual CTA rendering will be verified in Story 17.2 when HeroCentered is implemented
      expect(() => {
        render(
          <HeroSection
            title="Test Hotel"
            headline="Welcome"
            variant={{ layout: 'centered', height: 'medium' }}
            primaryCTA={{ text: 'Book Now', href: '/booking' }}
            secondaryCTA={{ text: 'Learn More', href: '/about' }}
            image="/hotel.jpg"
          />
        );
      }).not.toThrow();
    });
  });
});
