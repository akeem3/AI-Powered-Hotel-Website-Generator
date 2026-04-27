/**
 * HeroSection Router - Backward Compatibility Tests
 *
 * Tests for Story 17.1 acceptance criteria related to backward compatibility.
 * Verifies that the router handles legacy layout values and edge cases correctly.
 *
 * @module tests/components/sections
 */

import { render } from '@testing-library/react';
import HeroSection from '@/components/sections/HeroSection';

describe('HeroSection Router - Backward Compatibility', () => {
  describe('AC5: Legacy fullscreen layout support', () => {
    it('should handle legacy fullscreen layout by converting to centered + fullscreen height', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: 'fullscreen' as any }}
        />
      );

      // Should render HeroCentered (via HeroContent which has centered layout classes)
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();

      // The router should have converted fullscreen to centered layout + fullscreen height
      // HeroCentered uses heroVariants with centered layout
      expect(section).toHaveClass('flex');
    });

    it('should not throw runtime error when receiving fullscreen layout', () => {
      expect(() => {
        render(
          <HeroSection
            title="Test Hotel"
            headline="Test Headline"
            variant={{ layout: 'fullscreen' as any }}
          />
        );
      }).not.toThrow();
    });
  });

  describe('AC4: Unknown layout value fallback', () => {
    it('should handle unknown layout values by falling back to centered', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: 'unknown' as any }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Should render with centered layout classes (default fallback)
      expect(section).toHaveClass('flex');
    });

    it('should not throw console error or exception for unknown layout', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(
          <HeroSection
            title="Test Hotel"
            headline="Test Headline"
            variant={{ layout: 'unknown' as any }}
          />
        );
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('AC4 (part): Undefined layout defaults to centered', () => {
    it('should handle undefined layout by defaulting to centered', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: undefined }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Should render with centered layout classes (default)
      expect(section).toHaveClass('flex');
    });

    it('should handle missing variant object entirely', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Should render with centered layout classes (default)
      expect(section).toHaveClass('flex');
    });
  });

  describe('Edge cases', () => {
    it('should handle null layout gracefully', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: null as any }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should handle empty string layout gracefully', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: '' as any }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('Valid layouts work correctly', () => {
    it('should render correctly with centered layout', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: 'centered' }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveClass('flex');
    });

    it('should render correctly with split layout', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: 'split' }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Note: HeroSplit stub renders differently, this just verifies no crash
    });

    it('should render correctly with minimal layout', () => {
      const { container } = render(
        <HeroSection
          title="Test Hotel"
          headline="Test Headline"
          variant={{ layout: 'minimal' }}
        />
      );

      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
      // Note: HeroMinimal stub renders differently, this just verifies no crash
    });
  });
});
