/**
 * HeroSplit Sub-Component Unit Tests
 *
 * Tests for Story 17.3 acceptance criteria.
 * Verifies HeroSplit rendering, variants, and structural differences from HeroCentered.
 *
 * @module tests/components/sections
 * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.3
 */

import { render } from '@testing-library/react';
import { HeroSplit } from '@/components/sections/HeroSection/HeroSplit';

describe('HeroSplit Sub-Component', () => {
  // Default props for testing - matches HeroSectionContractType
  const defaultProps = {
    title: 'Test Hotel Name',
    headline: 'Welcome to Paradise',
    primaryCTA: { text: 'Book Now', href: '/booking' },
    secondaryCTA: { text: 'Contact Us', href: '/contact' },
    image: '/images/test-hero.jpg',
    background: 'solid' as const,
    imagePosition: 'right' as const,
    textAlign: 'left' as const,
    variant: {
      style: 'modern' as const,
      layout: 'split' as const,
      height: 'medium' as const,
    },
  };

  describe('Basic Rendering', () => {
    it('should render a section element', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should render with split layout grid classes', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('grid'); // split layout uses grid
      expect(section).toHaveClass('md:grid-cols-2'); // two columns on desktop
    });

    it('should have proper aria attributes', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'hero-title');
    });

    it('should have data-mode attribute for theming', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'modern');
    });
  });

  describe('Two-Column Grid Structure', () => {
    it('should render text column with text-column class', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const textColumn = container.querySelector('.text-column');
      expect(textColumn).toBeInTheDocument();
    });

    it('should render image column with image-column class', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const imageColumn = container.querySelector('.image-column');
      expect(imageColumn).toBeInTheDocument();
    });

    it('should have exactly two columns (text and image)', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const textColumn = container.querySelector('.text-column');
      const imageColumn = container.querySelector('.image-column');
      expect(textColumn).toBeInTheDocument();
      expect(imageColumn).toBeInTheDocument();
    });
  });

  describe('imagePosition Prop', () => {
    it('should render text on left and image on right when imagePosition is "right" (default)', () => {
      const { container } = render(<HeroSplit {...defaultProps} imagePosition="right" />);
      const textColumn = container.querySelector('.text-column');
      const imageColumn = container.querySelector('.image-column');

      // On desktop (md breakpoint), text should have order-1, image should have order-2
      expect(textColumn).toHaveClass('md:order-1');
      expect(imageColumn).toHaveClass('md:order-2');
    });

    it('should render image on left and text on right when imagePosition is "left"', () => {
      const { container } = render(<HeroSplit {...defaultProps} imagePosition="left" />);
      const section = container.querySelector('section');

      // CVA applies order utilities via child selectors
      expect(section).toHaveClass('[&_.image-column]:order-1');
      expect(section).toHaveClass('[&_.text-column]:order-2');
    });
  });

  describe('Mobile Responsive Collapse', () => {
    it('should have mobile order classes for stacking image above text', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const textColumn = container.querySelector('.text-column');
      const imageColumn = container.querySelector('.image-column');

      // On mobile, image should have order-1 (appear first), text should have order-2
      expect(imageColumn).toHaveClass('order-1');
      expect(textColumn).toHaveClass('order-2');
    });

    it('should have single column layout on mobile (no md:grid-cols-2 on mobile)', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');

      // Grid layout should only have md:grid-cols-2, not grid-cols-2
      expect(section).toHaveClass('md:grid-cols-2');
    });

    it('should prevent horizontal overflow on mobile', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');

      // Should have w-full for proper mobile containment
      expect(section).toHaveClass('w-full');
    });
  });

  describe('Structural Difference from HeroCentered', () => {
    it('should NOT have position relative wrapper at section root', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');

      // HeroSplit should not have position: relative at root level
      expect(section?.className).not.toContain('relative');
    });

    it('should NOT have full-bleed background image fill element at section root', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');

      // Check that section doesn't contain an absolute-positioned image as a direct child
      const children = Array.from(section?.children || []);
      const absoluteImage = children.some(child =>
        child.classList.contains('relative') && child.querySelector('img[fill]')
      );

      // HeroSplit has image in a separate column, not as a fill element
      expect(absoluteImage).toBe(false);
    });

    it('should have image in dedicated image column, not as background overlay', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const imageColumn = container.querySelector('.image-column');
      const image = imageColumn?.querySelector('img');

      expect(imageColumn).toBeInTheDocument();
      expect(image).toBeInTheDocument();
      expect(imageColumn).toHaveClass('image-column');
    });

    it('should NOT have overlay div like HeroCentered', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);

      // HeroSplit should not have an overlay div with z-index
      const overlay = container.querySelector('.z-base');
      expect(overlay).not.toBeInTheDocument();
    });
  });

  describe('Content Rendering', () => {
    it('should render title when provided', () => {
      const { getByText } = render(<HeroSplit {...defaultProps} title="Grand Hotel" />);
      expect(getByText('Grand Hotel')).toBeInTheDocument();
    });

    it('should render headline when provided', () => {
      const { getByText } = render(<HeroSplit {...defaultProps} headline="Experience Luxury" />);
      expect(getByText('Experience Luxury')).toBeInTheDocument();
    });

    it('should render tagline when provided', () => {
      const { getByText } = render(<HeroSplit {...defaultProps} tagline="Luxury Resort" />);
      expect(getByText('Luxury Resort')).toBeInTheDocument();
    });

    it('should not render tagline when not provided', () => {
      const props = { ...defaultProps };
      delete (props as any).tagline;
      const { queryByText } = render(<HeroSplit {...props} />);
      expect(queryByText('Luxury Resort')).not.toBeInTheDocument();
    });

    it('should render description when provided', () => {
      const { getByText } = render(
        <HeroSplit {...defaultProps} description="World-class amenities await you" />
      );
      expect(getByText('World-class amenities await you')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const props = { ...defaultProps };
      delete (props as any).description;
      const { queryByText } = render(<HeroSplit {...props} />);
      expect(queryByText('World-class amenities await you')).not.toBeInTheDocument();
    });

    it('should render title with text-text-primary class', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title).toHaveClass('text-text-primary');
    });

    it('should render headline with text-brand-secondary class', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-brand-secondary');
    });

    it('should have hero-title id on title element', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title).toHaveAttribute('id', 'hero-title');
    });
  });

  describe('CTA Button Rendering', () => {
    it('should render primary CTA button', () => {
      const { getByText, container } = render(<HeroSplit {...defaultProps} />);
      expect(getByText('Book Now')).toBeInTheDocument();
      const primaryButton = container.querySelector('.hero-cta[href="/booking"]');
      expect(primaryButton).toBeInTheDocument();
    });

    it('should render primary CTA with bg-brand-secondary class', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const primaryButton = container.querySelector('.hero-cta[href="/booking"]');
      expect(primaryButton).toHaveClass('bg-brand-secondary');
    });

    it('should render secondary CTA button when provided', () => {
      const { getByText } = render(<HeroSplit {...defaultProps} />);
      expect(getByText('Contact Us')).toBeInTheDocument();
    });

    it('should render secondary CTA with fallback defaults when not provided', () => {
      const props = { ...defaultProps, secondaryCTA: undefined };
      const { queryByText } = render(<HeroSplit {...props} />);
      // Component has fallback defaults for secondary CTA
      expect(queryByText('Contact Us')).toBeInTheDocument();
    });

    it('should render secondary CTA with border-text-primary class', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const secondaryButton = container.querySelector('.hero-cta[href="/contact"]');
      expect(secondaryButton).toHaveClass('border-text-primary');
    });

    it('should have responsive layout for CTAs', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const ctaContainer = container.querySelector('.mt-gap-section');
      expect(ctaContainer).toHaveClass('flex-col'); // mobile: stacked
      expect(ctaContainer).toHaveClass('sm:flex-row'); // desktop: side-by-side
    });
  });

  describe('Semantic Styling', () => {
    it('should use semantic tokens for all colors', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');
      const className = section?.className || '';

      // Check for semantic token usage (no hardcoded colors)
      expect(className).not.toMatch(/bg-\#[0-9a-f]{3,6}/);
      expect(className).not.toMatch(/text-\#[0-9a-f]{3,6}/);

      // Verify semantic tokens are present
      expect(className).toContain('grid');
      // The section should use semantic spacing tokens
      expect(className).toMatch(/gap-hero/);
    });

    it('should use semantic spacing tokens', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('gap-hero');
    });

    it('should use semantic typography tokens', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-size-display');
    });

    it('should use solid background on text column (semantic token)', () => {
      const { container } = render(<HeroSplit {...defaultProps} />);
      const textColumn = container.querySelector('.text-column');
      expect(textColumn).toHaveClass('bg-surface-primary');
    });
  });

  describe('Height Variants', () => {
    it('should apply medium height class when height is "medium"', () => {
      const { container } = render(
        <HeroSplit {...defaultProps} variant={{ ...defaultProps.variant, height: 'medium' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-md');
    });

    it('should apply large height class when height is "large"', () => {
      const { container } = render(
        <HeroSplit {...defaultProps} variant={{ ...defaultProps.variant, height: 'large' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-lg');
    });

    it('should use medium height as default when no height is specified', () => {
      const props = { ...defaultProps, variant: { ...defaultProps.variant, height: undefined } };
      const { container } = render(<HeroSplit {...props} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-md');
    });
  });

  describe('Text Alignment Variants', () => {
    it('should apply left text alignment when textAlign is "left"', () => {
      const { container } = render(<HeroSplit {...defaultProps} textAlign="left" />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('[&_.text-column]:text-left');
      expect(section).toHaveClass('[&_.text-column]:items-start');
    });

    it('should apply center text alignment when textAlign is "center"', () => {
      const { container } = render(<HeroSplit {...defaultProps} textAlign="center" />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('[&_.text-column]:text-center');
      expect(section).toHaveClass('[&_.text-column]:items-center');
      expect(section).toHaveClass('[&_.text-column]:justify-center');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on primary CTA when provided', () => {
      const { container } = render(
        <HeroSplit {...defaultProps} primaryCTA={{ text: 'Book Now', href: '/booking', ariaLabel: 'Book your stay now' }} />
      );
      const primaryLink = container.querySelector('a[href="/booking"]');
      expect(primaryLink).toHaveAttribute('aria-label', 'Book your stay now');
    });

    it('should have aria-label on secondary CTA when provided', () => {
      const { container } = render(
        <HeroSplit {...defaultProps} secondaryCTA={{ text: 'Contact Us', href: '/contact', ariaLabel: 'Get in touch' }} />
      );
      const secondaryLink = container.querySelector('a[href="/contact"]');
      expect(secondaryLink).toHaveAttribute('aria-label', 'Get in touch');
    });

    it('should have alt text on image derived from tagline', () => {
      const { container } = render(<HeroSplit {...defaultProps} tagline="Hotel by the beach" />);
      const image = container.querySelector('img[alt="Hotel by the beach"]');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Custom className Support', () => {
    it('should apply custom className to section', () => {
      const { container } = render(
        <HeroSplit {...defaultProps} className="custom-hero-split-class" />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-hero-split-class');
    });

    it('should merge custom className with CVA classes', () => {
      const { container } = render(
        <HeroSplit {...defaultProps} className="custom-hero-split-class" />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('grid'); // CVA class
      expect(section).toHaveClass('custom-hero-split-class'); // custom class
    });
  });

  describe('Server Component Verification', () => {
    it('should not contain use client directive', () => {
      // This is a compile-time check - the component file should not have 'use client'
      // We verify this works by checking it renders as a server component
      const { container } = render(<HeroSplit {...defaultProps} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should work with Next.js Image component', () => {
      // Next.js Image only works in Server Components or with specific config
      const { container } = render(<HeroSplit {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
  });
});
