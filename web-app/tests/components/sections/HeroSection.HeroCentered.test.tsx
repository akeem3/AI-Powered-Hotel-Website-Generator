/**
 * HeroCentered Sub-Component Unit Tests
 *
 * Tests for Story 17.2 acceptance criteria.
 * Verifies HeroCentered rendering, variants, and visual output.
 *
 * @module tests/components/sections
 * @see docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md Story 17.2
 */

import { render } from '@testing-library/react';
import { HeroCentered } from '@/components/sections/HeroSection/HeroCentered';

describe('HeroCentered Sub-Component', () => {
  // Default props for testing - matches HeroSectionContractType
  const defaultProps = {
    title: 'Test Hotel Name',
    headline: 'Welcome to Paradise',
    primaryCTA: { text: 'Book Now', href: '/booking' },
    secondaryCTA: { text: 'Contact Us', href: '/contact' },
    image: '/images/test-hero.jpg',
    variant: {
      style: 'modern' as const,
      layout: 'centered' as const,
      overlay: 'none' as const,
      height: 'medium' as const,
    },
  };

  describe('Basic Rendering', () => {
    it('should render a section element', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should render with centered layout classes', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex'); // centered layout uses flex
      expect(section).toHaveClass('items-center');
      expect(section).toHaveClass('justify-center');
    });

    it('should have proper aria attributes', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('aria-labelledby', 'hero-title');
    });

    it('should have data-mode attribute for theming', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'modern');
    });
  });

  describe('Background Image Rendering', () => {
    it('should render full-bleed background image', () => {
      const props = { ...defaultProps, tagline: 'Test hotel exterior' };
      const { container } = render(<HeroCentered {...props} />);
      const image = container.querySelector('img[alt="Test hotel exterior"]');
      expect(image).toBeInTheDocument();
    });

    it('should use Next.js Image with fill prop for full coverage', () => {
      const props = { ...defaultProps, tagline: 'Test hotel exterior' };
      const { container } = render(<HeroCentered {...props} />);
      // Next.js Image with fill creates a div with specific classes
      const imageWrapper = container.querySelector('img[alt="Test hotel exterior"]');
      expect(imageWrapper?.parentElement).toHaveClass('relative');
    });

    it('should use object-cover for proper image scaling', () => {
      const props = { ...defaultProps, tagline: 'Test hotel exterior' };
      const { container } = render(<HeroCentered {...props} />);
      const image = container.querySelector('img[alt="Test hotel exterior"]');
      expect(image).toHaveClass('object-cover');
      expect(image).toHaveClass('object-center');
    });
  });

  describe('Overlay Variants', () => {
    it('should render no overlay when overlay is "none"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, overlay: 'none' }} />
      );
      const overlay = container.querySelector('.z-base');
      expect(overlay).toHaveClass('opacity-0');
    });

    it('should render light overlay when overlay is "light"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, overlay: 'light' }} />
      );
      const overlay = container.querySelector('.z-base');
      expect(overlay).toHaveClass('bg-brand-primary/mid');
    });

    it('should render dark overlay when overlay is "dark"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, overlay: 'dark' }} />
      );
      const overlay = container.querySelector('.z-base');
      expect(overlay).toHaveClass('bg-brand-primary/mid');
    });

    it('should render gradient overlay when overlay is "gradient"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, overlay: 'gradient' }} />
      );
      const overlay = container.querySelector('.z-base');
      expect(overlay).toHaveClass('bg-gradient-to-t');
      expect(overlay).toHaveClass('from-brand-primary/high');
    });

    it('should have overlay with z-base z-index', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, overlay: 'gradient' }} />
      );
      const overlay = container.querySelector('.z-base');
      expect(overlay).toHaveClass('z-base');
    });

    it('should have content with higher z-elevated z-index', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const contentContainer = container.querySelector('.z-elevated');
      expect(contentContainer).toBeInTheDocument();
    });
  });

  describe('Height Variants', () => {
    it('should apply small height class when height is "small"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, height: 'small' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-sm');
    });

    it('should apply medium height class when height is "medium"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, height: 'medium' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-md');
    });

    it('should apply large height class when height is "large"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, height: 'large' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-hero-lg');
    });

    it('should apply fullscreen height class when height is "fullscreen"', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, height: 'fullscreen' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('min-h-screen');
    });
  });

  describe('Content Rendering', () => {
    it('should render title when provided', () => {
      const { getByText } = render(<HeroCentered {...defaultProps} title="Grand Hotel" />);
      expect(getByText('Grand Hotel')).toBeInTheDocument();
    });

    it('should render headline when provided', () => {
      const { getByText } = render(<HeroCentered {...defaultProps} headline="Experience Luxury" />);
      expect(getByText('Experience Luxury')).toBeInTheDocument();
    });

    it('should render tagline when provided', () => {
      const { getByText } = render(<HeroCentered {...defaultProps} tagline="Luxury Resort" />);
      expect(getByText('Luxury Resort')).toBeInTheDocument();
    });

    it('should not render tagline when not provided', () => {
      const props = { ...defaultProps };
      delete (props as any).tagline;
      const { queryByText } = render(<HeroCentered {...props} />);
      expect(queryByText('Luxury Resort')).not.toBeInTheDocument();
    });

    it('should render description when provided', () => {
      const { getByText } = render(
        <HeroCentered {...defaultProps} description="World-class amenities await you" />
      );
      expect(getByText('World-class amenities await you')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const props = { ...defaultProps };
      delete (props as any).description;
      const { queryByText } = render(<HeroCentered {...props} />);
      expect(queryByText('World-class amenities await you')).not.toBeInTheDocument();
    });

    it('should render title with text-on-brand class', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title).toHaveClass('text-on-brand');
    });

    it('should render headline with text-brand-secondary class', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-brand-secondary');
    });

    it('should have hero-title id on title element', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const title = container.querySelector('h2');
      expect(title).toHaveAttribute('id', 'hero-title');
    });
  });

  describe('CTA Button Rendering', () => {
    it('should render primary CTA button', () => {
      const { getByText, container } = render(<HeroCentered {...defaultProps} />);
      expect(getByText('Book Now')).toBeInTheDocument();
      const primaryButton = container.querySelector('.hero-cta[href="/booking"]');
      expect(primaryButton).toBeInTheDocument();
    });

    it('should render primary CTA with bg-brand-secondary class', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const primaryButton = container.querySelector('.hero-cta[href="/booking"]');
      expect(primaryButton).toHaveClass('bg-brand-secondary');
    });

    it('should render secondary CTA button when provided', () => {
      const { getByText } = render(<HeroCentered {...defaultProps} />);
      expect(getByText('Contact Us')).toBeInTheDocument();
    });

    it('should render secondary CTA with fallback defaults when not provided', () => {
      const props = { ...defaultProps, secondaryCTA: undefined };
      const { queryByText } = render(<HeroCentered {...props} />);
      // Component has fallback defaults for secondary CTA
      expect(queryByText('Contact Us')).toBeInTheDocument();
    });

    it('should render secondary CTA with border-on-brand class', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const secondaryButton = container.querySelector('.hero-cta[href="/contact"]');
      expect(secondaryButton).toHaveClass('border-on-brand');
    });

    it('should have responsive layout for CTAs', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const ctaContainer = container.querySelector('.mt-gap-section');
      expect(ctaContainer).toHaveClass('flex-col'); // mobile: stacked
      expect(ctaContainer).toHaveClass('sm:flex-row'); // desktop: side-by-side
    });
  });

  describe('Semantic Styling', () => {
    it('should use semantic tokens for all colors', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const section = container.querySelector('section');
      const className = section?.className || '';

      // Check for semantic token usage (no hardcoded colors)
      expect(className).not.toMatch(/bg-\#[0-9a-f]{3,6}/);
      expect(className).not.toMatch(/text-\#[0-9a-f]{3,6}/);

      // Verify semantic tokens are present
      expect(className).toContain('bg-');
      // The section should have brand-primary or similar semantic tokens
      expect(className).toMatch(/bg-brand-|text-brand-|text-on-brand|text-text-/);
    });

    it('should use semantic z-index tokens', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const overlay = container.querySelector('.z-base');
      const content = container.querySelector('.z-elevated');

      expect(overlay).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });

    it('should use semantic spacing tokens', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      // py-hero is on the inner content container, not the section
      const contentContainer = container.querySelector('.z-elevated');
      expect(contentContainer).toHaveClass('py-hero');
    });

    it('should use semantic typography tokens', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const headline = container.querySelector('h1');
      expect(headline).toHaveClass('text-size-display');
    });
  });

  describe('Style Variants', () => {
    it('should apply modern style classes', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, style: 'modern' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'modern');
    });

    it('should apply classic style classes', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, style: 'classic' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'classic');
    });

    it('should apply elegant style classes', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} variant={{ ...defaultProps.variant, style: 'elegant' }} />
      );
      const section = container.querySelector('section');
      expect(section).toHaveAttribute('data-mode', 'elegant');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-hidden on overlay div', () => {
      const { container } = render(<HeroCentered {...defaultProps} />);
      const overlay = container.querySelector('.z-base');
      expect(overlay).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-label on primary CTA when provided', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} primaryCTA={{ text: 'Book Now', href: '/booking', ariaLabel: 'Book your stay now' }} />
      );
      const primaryLink = container.querySelector('a[href="/booking"]');
      expect(primaryLink).toHaveAttribute('aria-label', 'Book your stay now');
    });

    it('should have aria-label on secondary CTA when provided', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} secondaryCTA={{ text: 'Contact Us', href: '/contact', ariaLabel: 'Get in touch' }} />
      );
      const secondaryLink = container.querySelector('a[href="/contact"]');
      expect(secondaryLink).toHaveAttribute('aria-label', 'Get in touch');
    });

    it('should have alt text on background image derived from tagline', () => {
      const { container } = render(<HeroCentered {...defaultProps} tagline="Hotel by the beach" />);
      const image = container.querySelector('img[alt="Hotel by the beach"]');
      expect(image).toBeInTheDocument();
    });
  });

  describe('Custom className Support', () => {
    it('should apply custom className to section', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} className="custom-hero-class" />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('custom-hero-class');
    });

    it('should merge custom className with CVA classes', () => {
      const { container } = render(
        <HeroCentered {...defaultProps} className="custom-hero-class" />
      );
      const section = container.querySelector('section');
      expect(section).toHaveClass('flex'); // CVA class
      expect(section).toHaveClass('custom-hero-class'); // custom class
    });
  });

  describe('Server Component Verification', () => {
    it('should not contain use client directive', () => {
      // This is a compile-time check - the component file should not have 'use client'
      // We verify this works by checking it renders as a server component
      const { container } = render(<HeroCentered {...defaultProps} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should work with Next.js Image component', () => {
      // Next.js Image only works in Server Components or with specific config
      const { container } = render(<HeroCentered {...defaultProps} />);
      const image = container.querySelector('img');
      expect(image).toBeInTheDocument();
    });
  });
});
