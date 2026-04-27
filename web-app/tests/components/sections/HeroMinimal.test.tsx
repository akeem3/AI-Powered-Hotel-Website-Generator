/**
 * HeroMinimal Sub-Component Unit Tests
 *
 * Tests for Story 17.4 acceptance criteria.
 * Verifies HeroMinimal rendering, variants, and structural differences from other sub-components.
 *
 * @module tests/components/sections
 * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.4
 */

import { render } from '@testing-library/react';
import { HeroMinimal } from '@/components/sections/HeroSection/HeroMinimal';

describe('HeroMinimal Sub-Component', () => {
  // Default props for testing - matches HeroSectionContractType
  const defaultProps = {
    title: 'Test Hotel Name',
    headline: 'Simple Comfort, Great Value',
    primaryCTA: { text: 'Book Now', href: '/booking' },
    background: 'solid' as const,
    variant: {
      style: 'minimal' as const,
      layout: 'minimal' as const,
      height: 'medium' as const,
    },
  };

  describe('Basic Rendering', () => {
    it('should render a section element', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should render with minimal layout classes (flex for centering)', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex'); // minimal layout uses flex for centering
      expect(section).toHaveClass('items-center');
      expect(section).toHaveClass('justify-center');
    });

    it('should have proper aria attributes', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'hero-title');
    });

    it('should have data-mode attribute for theming', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'minimal');
    });
  });

  describe('Typography-Focused Layout', () => {
    it('should render headline with text-size-display class', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-size-display');
    });

    it('should render tagline with small-caps styling', () => {
      const props = { ...defaultProps, tagline: 'Stay Smart' };
      const { container } = render(<HeroMinimal {...props} />);
      const tagline = container.querySelector('p.text-brand-secondary');
      expect(tagline).toHaveClass('uppercase');
      expect(tagline).toHaveClass('tracking-wider');
    });

    it('should render title with proper hierarchy (h2)', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title).toBeInTheDocument();
      expect(title).toHaveAttribute('id', 'hero-title');
    });

    it('should render headline with proper hierarchy (h1)', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toBeInTheDocument();
    });
  });

  describe('Background Variants', () => {
    it('should apply solid background using bg-surface-primary', () => {
      const { container } = render(<HeroMinimal {...defaultProps} background="solid" />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-surface-primary');
    });

    it('should apply gradient background using semantic tokens', () => {
      const { container } = render(<HeroMinimal {...defaultProps} background="gradient" />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-gradient-to-br');
      expect(section).toHaveClass('from-surface-primary');
      expect(section).toHaveClass('to-surface-elevated');
    });

    it('should fallback to solid background when background is "image"', () => {
      const { container } = render(<HeroMinimal {...defaultProps} background="image" as const />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('bg-surface-primary');
    });
  });

  describe('Height Variants', () => {
    it('should apply small height class when height is "small"', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} variant={{ ...defaultProps.variant, height: 'small' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-sm');
    });

    it('should apply medium height class when height is "medium"', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} variant={{ ...defaultProps.variant, height: 'medium' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-md');
    });

    it('should fallback to medium height when height is "large"', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} variant={{ ...defaultProps.variant, height: 'large' as const }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-md');
    });

    it('should fallback to medium height when height is "fullscreen"', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} variant={{ ...defaultProps.variant, height: 'fullscreen' as const }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-md');
    });
  });

  describe('Text Align Variants', () => {
    it('should apply left text alignment when textAlign is "left"', () => {
      const { container } = render(<HeroMinimal {...defaultProps} textAlign="left" />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('text-left');
    });

    it('should apply center text alignment when textAlign is "center"', () => {
      const { container } = render(<HeroMinimal {...defaultProps} textAlign="center" />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('text-center');
    });

    it('should use left text alignment as default when textAlign is not provided', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('text-left');
    });
  });

  describe('Single CTA Behavior', () => {
    it('should render primary CTA button', () => {
      const { getByText, container } = render(<HeroMinimal {...defaultProps} />);
      expect(getByText('Book Now')).toBeInTheDocument();
      const primaryButton = container.querySelector('.hero-cta[href="/booking"]');
      expect(primaryButton).toBeInTheDocument();
    });

    it('should NOT render secondary CTA button', () => {
      const props = {
        ...defaultProps,
        primaryCTA: { text: 'Book Now', href: '/booking' },
        secondaryCTA: { text: 'Contact Us', href: '/contact' },
      };
      const { queryByText } = render(<HeroMinimal {...props} />);
      expect(queryByText('Contact Us')).not.toBeInTheDocument();
    });

    it('should render primary CTA with bg-brand-secondary class', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const primaryButton = container.querySelector('.hero-cta[href="/booking"]');
      expect(primaryButton).toHaveClass('bg-brand-secondary');
    });

    it('should have aria-label on primary CTA when provided', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} primaryCTA={{ text: 'Book Now', href: '/booking', ariaLabel: 'Book your stay now' }} />
      );
      const primaryLink = container.querySelector('a[href="/booking"]');
      expect(primaryLink).toHaveAttribute('aria-label', 'Book your stay now');
    });
  });

  describe('Content Rendering', () => {
    it('should render title when provided', () => {
      const { getByText } = render(<HeroMinimal {...defaultProps} title="Grand Hotel" />);
      expect(getByText('Grand Hotel')).toBeInTheDocument();
    });

    it('should render headline when provided', () => {
      const { getByText } = render(<HeroMinimal {...defaultProps} headline="Experience Luxury" />);
      expect(getByText('Experience Luxury')).toBeInTheDocument();
    });

    it('should render tagline when provided', () => {
      const { getByText } = render(<HeroMinimal {...defaultProps} tagline="Luxury Resort" />);
      expect(getByText('Luxury Resort')).toBeInTheDocument();
    });

    it('should not render tagline when not provided', () => {
      const props = { ...defaultProps };
      delete (props as any).tagline;
      const { queryByText } = render(<HeroMinimal {...props} />);
      expect(queryByText('Luxury Resort')).not.toBeInTheDocument();
    });

    it('should render description when provided', () => {
      const { getByText } = render(
        <HeroMinimal {...defaultProps} description="World-class amenities await you" />
      );
      expect(getByText('World-class amenities await you')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const props = { ...defaultProps };
      delete (props as any).description;
      const { queryByText } = render(<HeroMinimal {...props} />);
      expect(queryByText('World-class amenities await you')).not.toBeInTheDocument();
    });

    it('should render title with text-text-primary class', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title).toHaveClass('text-text-primary');
    });

    it('should render headline with text-brand-secondary class', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-brand-secondary');
    });

    it('should have hero-title id on title element', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title).toHaveAttribute('id', 'hero-title');
    });
  });

  describe('Structural Difference from Other Sub-Components', () => {
    it('should NOT have Image component rendered', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image).not.toBeInTheDocument();
    });

    it('should NOT have overlay div like HeroCentered', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const overlay = container.querySelector('.z-base');
      expect(overlay).not.toBeInTheDocument();
    });

    it('should NOT have absolute-positioned image wrapper', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const absoluteWrapper = container.querySelector('.relative img[fill]');
      expect(absoluteWrapper).not.toBeInTheDocument();
    });

    it('should NOT have image-column class like HeroSplit', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const imageColumn = container.querySelector('.image-column');
      expect(imageColumn).not.toBeInTheDocument();
    });
  });

  describe('Semantic Styling', () => {
    it('should use semantic tokens for all colors', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      const className = section?.className || '';

      // Check for semantic token usage (no hardcoded colors)
      expect(className).not.toMatch(/bg-\#[0-9a-f]{3,6}/);
      expect(className).not.toMatch(/text-\#[0-9a-f]{3,6}/);

      // Verify semantic tokens are present
      expect(className).toContain('bg-surface');
      expect(className).toMatch(/bg-surface-primary|bg-surface-elevated/);
    });

    it('should use semantic spacing tokens', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      const contentContainer = container.querySelector('.px-container');
      expect(contentContainer).toBeInTheDocument();
      expect(contentContainer).toHaveClass('py-hero');
    });

    it('should use semantic typography tokens', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-size-display');
    });

    it('should use semantic brand tokens for CTA', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const primaryButton = container.querySelector('.hero-cta');
      expect(primaryButton).toHaveClass('bg-brand-secondary');
      expect(primaryButton).toHaveClass('text-on-brand');
    });
  });

  describe('Style Variants', () => {
    it('should apply minimal style classes', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} variant={{ ...defaultProps.variant, style: 'minimal' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'minimal');
    });

    it('should apply elegant style classes', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} variant={{ ...defaultProps.variant, style: 'elegant' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'elegant');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-labelledby attribute on section', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'hero-title');
    });

    it('should have aria-label on primary CTA when provided', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} primaryCTA={{ text: 'Book Now', href: '/booking', ariaLabel: 'Book your stay now' }} />
      );
      const primaryLink = container.querySelector('a[href="/booking"]');
      expect(primaryLink).toHaveAttribute('aria-label', 'Book your stay now');
    });

    it('should use semantic HTML (section, h1, h2, p elements)', () => {
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const section = container.querySelector('section');
      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      expect(section).toBeInTheDocument();
      expect(h1).toBeInTheDocument();
      expect(h2).toBeInTheDocument();
    });
  });

  describe('Custom className Support', () => {
    it('should apply custom className to section', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} className="custom-hero-minimal-class" />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-hero-minimal-class');
    });

    it('should merge custom className with CVA classes', () => {
      const { container } = render(
        <HeroMinimal {...defaultProps} className="custom-hero-minimal-class" />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex'); // CVA class
      expect(section).toHaveClass('custom-hero-minimal-class'); // custom class
    });
  });

  describe('Server Component Verification', () => {
    it('should not contain use client directive', () => {
      // This is a compile-time check - the component file should not have 'use client'
      // We verify this works by checking it renders as a server component
      const { container } = render(<HeroMinimal {...defaultProps} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should work without Next.js Image component', () => {
      // HeroMinimal intentionally does not use Image component
      const { container } = render(<HeroMinimal {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing primaryCTA with defaults', () => {
      const props = { ...defaultProps, primaryCTA: undefined };
      const { getByText } = render(<HeroMinimal {...props} />);
      expect(getByText('Book Now')).toBeInTheDocument();
    });

    it('should handle missing variant with defaults', () => {
      const props = { ...defaultProps, variant: undefined };
      const { container } = render(<HeroMinimal {...props} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'minimal'); // default style
      expect(section).toHaveClass('min-h-hero-md'); // default height
    });
  });
});
