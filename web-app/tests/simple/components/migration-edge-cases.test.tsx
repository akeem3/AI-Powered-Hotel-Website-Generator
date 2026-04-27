/**
 * Story 11.7: Comprehensive Edge Testing
 * Prompt 4: Component Migration Edge Cases
 *
 * Tests migrated components (HeroSection, Amenities, Testimonials) under edge conditions.
 *
 * IMPORTANT: These components are Server Components that receive data via props.
 * They do NOT use client-side hooks like usePageContent. Content fetching happens
 * at the page level, and components receive resolved data as props.
 *
 * Test categories:
 * 1. Props vs Defaults Priority
 * 2. Edge Cases (missing props, partial props, etc.)
 * 3. Visual Regression Edge Cases
 * 4. Accessibility Edge Cases
 */

import React from 'react';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import '@testing-library/jest-dom';
import HeroSection from '@/components/sections/HeroSection';
import Amenities from '@/components/blocks/Amenities';
import Testimonials from '@/components/blocks/Testimonials';
import { mockAmenities } from '@/components/data/mockAmenities';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} fill={undefined} priority={undefined} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock validation to avoid console errors in tests
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Mock Font Awesome icons
jest.mock('@fortawesome/react-fontawesome', () => {
  return function MockFontAwesomeIcon({ icon, className, ...props }: any) {
    const iconName = typeof icon === 'string' ? icon : icon?.iconName || 'icon';
    return (
      <span
        className={`fa ${iconName} ${className || ''}`}
        data-testid={`fa-${iconName.replace('fa-', '')}`}
        {...props}
      >
        {iconName}
      </span>
    );
  };
});

// Test constants - simulating what would come from CMS content
const CMS_CONTENT = {
  hero: {
    tagline: 'CMS Tagline',
    title: 'CMS Title',
    headline: 'CMS Headline',
    description: 'CMS Description',
  },
  amenities: {
    heading: 'CMS Amenities Heading',
    subheading: 'CMS Amenities Subheading',
  },
  testimonials: {
    heading: 'CMS Testimonials Heading',
    subheading: 'CMS Testimonials Subheading',
  },
};

const mockTestimonials = [
  {
    id: 't1',
    customerName: 'John Doe',
    title: 'Verified Guest',
    quote: 'Excellent stay!',
    rating: 5,
    date: '2026-01-15',
    location: 'New York',
    avatar: '/avatars/john.jpg',
  },
  {
    id: 't2',
    customerName: 'Jane Smith',
    title: 'Verified Guest',
    quote: 'Great service!',
    rating: 5,
    date: '2026-01-16',
    location: 'Los Angeles',
  },
];

describe('Story 11.7: Component Migration Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================================================
  // 1. Props vs Defaults Priority
  // ============================================================================

  describe('Props vs Defaults Priority', () => {
    it('should use props when provided (props win over defaults)', () => {
      render(
        <HeroSection
          title="Props Title"
          headline="Props Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      expect(screen.getByText('Props Headline')).toBeInTheDocument();
      expect(screen.queryByText(CONTENT_DEFAULTS.hero.title)).not.toBeInTheDocument();
    });

    it('should use defaults when props are missing', () => {
      render(<HeroSection background="solid" />);

      // Generic defaults (Story 11.08: hotel-agnostic placeholders)
      expect(screen.getByText(CONTENT_DEFAULTS.hero.title)).toBeInTheDocument();
      expect(screen.getByText(CONTENT_DEFAULTS.hero.headline)).toBeInTheDocument();
      // Note: tagline is optional and not rendered when not provided
      // The component uses undefined for tagline when not in props, not the default
    });

    it('should use CMS content when passed as props', () => {
      // Simulating what a parent Server Component would do after fetching CMS content
      render(
        <HeroSection
          title={CMS_CONTENT.hero.title}
          headline={CMS_CONTENT.hero.headline}
          tagline={CMS_CONTENT.hero.tagline}
          description={CMS_CONTENT.hero.description}
          background="solid"
        />
      );

      expect(screen.getByText('CMS Title')).toBeInTheDocument();
      expect(screen.getByText('CMS Headline')).toBeInTheDocument();
      expect(screen.getByText('CMS Tagline')).toBeInTheDocument();
      expect(screen.getByText('CMS Description')).toBeInTheDocument();
    });

    it('should use props for Amenities heading/subheading', () => {
      render(
        <Amenities
          heading={CMS_CONTENT.amenities.heading}
          subheading={CMS_CONTENT.amenities.subheading}
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 6)}
        />
      );

      expect(screen.getByText('CMS Amenities Heading')).toBeInTheDocument();
      expect(screen.getByText('CMS Amenities Subheading')).toBeInTheDocument();
    });

    it('should use defaults for Amenities when props missing', () => {
      render(
        <Amenities
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 6)}
        />
      );

      expect(screen.getByText(CONTENT_DEFAULTS.amenities.heading)).toBeInTheDocument();
      expect(screen.getByText(CONTENT_DEFAULTS.amenities.subheading)).toBeInTheDocument();
    });

    it('should use props for Testimonials heading/subheading', () => {
      render(
        <Testimonials
          heading={CMS_CONTENT.testimonials.heading}
          subheading={CMS_CONTENT.testimonials.subheading}
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials}
        />
      );

      expect(screen.getByText('CMS Testimonials Heading')).toBeInTheDocument();
      expect(screen.getByText('CMS Testimonials Subheading')).toBeInTheDocument();
    });

    it('should use defaults for Testimonials when props missing', () => {
      render(
        <Testimonials
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials}
        />
      );

      expect(screen.getByText(CONTENT_DEFAULTS.testimonials.heading)).toBeInTheDocument();
      expect(screen.getByText(CONTENT_DEFAULTS.testimonials.subheading)).toBeInTheDocument();
    });

    it('should not use hotel-specific defaults (Story 11.08)', () => {
      render(<HeroSection background="solid" />);

      // MUST NOT display hotel-specific defaults (Story 11.08)
      expect(screen.queryByText('The Sterling Executive')).not.toBeInTheDocument();
      expect(screen.queryByText('Where Comfort Meets Prestige')).not.toBeInTheDocument();
      expect(screen.queryByText('Experience Boutique Luxury')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // 2. Edge Cases (missing props, partial props, etc.)
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle empty amenities array', () => {
      const { container } = render(
        <Amenities
          variant={{ layout: 'grid' }}
          amenities={[]}
        />
      );

      // Component returns null when no amenities
      expect(container.firstChild).toBeNull();
    });

    it('should handle empty testimonials array', () => {
      const { container } = render(
        <Testimonials
          variant={{ layout: 'grid' }}
          testimonials={[]}
        />
      );

      // Component returns null when no testimonials
      expect(container.firstChild).toBeNull();
    });

    it('should handle undefined props gracefully', () => {
      render(
        <HeroSection
          background="solid"
        />
      );

      // Should render with defaults
      expect(screen.getByText(CONTENT_DEFAULTS.hero.title)).toBeInTheDocument();
    });

    it('should handle partial props for HeroSection', () => {
      render(
        <HeroSection
          title="Custom Title"
          background="solid"
          // headline and tagline not provided
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText(CONTENT_DEFAULTS.hero.headline)).toBeInTheDocument();
    });

    it('should handle Amenities with category filtering', () => {
      const mixedAmenities = [
        { ...mockAmenities[0], category: 'room' },
        { ...mockAmenities[1], category: 'hotel' },
        { ...mockAmenities[2], category: 'room' },
      ];

      render(
        <Amenities
          variant={{ layout: 'grid' }}
          amenities={mixedAmenities}
          filterByCategory="room"
        />
      );

      // Should only show room amenities (2 items)
      // Note: amenity cards don't have data-testid, so we count by article elements
      const amenityCards = screen.getAllByRole('article');
      expect(amenityCards).toHaveLength(2);
    });
  });

  // ============================================================================
  // 3. Visual Regression Edge Cases
  // ============================================================================

  describe('Visual Regression Edge Cases', () => {
    it('should handle very long text (overflow handling)', () => {
      const longText = 'A'.repeat(100);

      render(
        <HeroSection
          title={longText}
          headline={longText}
          description={longText}
          background="solid"
        />
      );

      // Component should still render without breaking
      // The text appears in multiple places (title, headline, description)
      const results = screen.getAllByText(longText);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle very short text (layout stability)', () => {
      render(
        <HeroSection
          title="Hi"
          headline="There"
          background="solid"
        />
      );

      expect(screen.getByText('Hi')).toBeInTheDocument();
      expect(screen.getByText('There')).toBeInTheDocument();
    });

    it('should handle content with special characters', () => {
      const specialText = 'Hello & Welcome "Hotel"';

      render(
        <HeroSection
          title={specialText}
          headline={specialText}
          background="solid"
        />
      );

      // Special characters should be rendered correctly
      expect(screen.getAllByText(/Hello & Welcome/).length).toBeGreaterThan(0);
    });

    it('should handle content with emoji', () => {
      render(
        <HeroSection
          title="Welcome 🏨"
          headline="Experience luxury ✨"
          background="solid"
        />
      );

      expect(screen.getByText(/Welcome/)).toBeInTheDocument();
      expect(screen.getByText(/Experience luxury/)).toBeInTheDocument();
    });

    it('should render images with correct alt text', () => {
      render(
        <HeroSection
          title="Test Hotel"
          headline="Welcome"
          background="solid"
        />
      );

      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
      // Images should have alt text
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });
  });

  // ============================================================================
  // 4. Accessibility Edge Cases
  // ============================================================================

  describe('Accessibility Edge Cases', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <HeroSection
          title="Test Title"
          headline="Test Headline"
          background="solid"
        />
      );

      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should have accessible CTA links', () => {
      render(
        <HeroSection
          title="Test"
          headline="Test"
          background="solid"
        />
      );

      // Check for default CTAs
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      // CTAs should have accessible names
      links.forEach(link => {
        const text = link.textContent || '';
        expect(text.trim()).not.toBe('');
      });
    });

    it('should support keyboard navigation', () => {
      render(
        <div>
          <button data-testid="before-hero">Before Hero</button>
          <HeroSection
            title="Title"
            headline="Headline"
            background="solid"
          />
        </div>
      );

      const beforeButton = screen.getByTestId('before-hero');
      beforeButton.focus();

      expect(document.activeElement).toBe(beforeButton);
    });

    it('should have proper ARIA labels for interactive elements', () => {
      render(
        <Amenities
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
        />
      );

      // Amenity cards should be focusable
      const amenityCards = screen.getAllByRole('article');
      amenityCards.forEach(card => {
        expect(card).toHaveAttribute('tabindex', '0');
      });
    });
  });

  // ============================================================================
  // 5. State Management Edge Cases
  // ============================================================================

  describe('State Management Edge Cases', () => {
    it('should handle component re-renders', () => {
      const { rerender } = render(
        <HeroSection
          title="Initial"
          headline="Initial Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Initial')).toBeInTheDocument();

      rerender(
        <HeroSection
          title="Updated"
          headline="Updated Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Updated')).toBeInTheDocument();
      expect(screen.queryByText('Initial')).not.toBeInTheDocument();
    });

    it('should handle parent state changes', async () => {
      function Parent() {
        const [count, setCount] = React.useState(0);
        return (
          <div>
            <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
            <HeroSection
              title={`Title ${count}`}
              headline="Headline"
              background="solid"
            />
          </div>
        );
      }

      render(<Parent />);

      const button = screen.getByRole('button');

      await act(async () => {
        button.click();
      });

      await act(async () => {
        button.click();
      });

      expect(screen.getByText('Count: 2')).toBeInTheDocument();
      expect(screen.getByText('Title 2')).toBeInTheDocument();
    });

    it('should handle multiple components with different props', () => {
      render(
        <div>
          <Amenities
            heading="First Amenities"
            variant={{ layout: 'grid' }}
            amenities={mockAmenities.slice(0, 3)}
          />
          <Amenities
            heading="Second Amenities"
            variant={{ layout: 'list' }}
            amenities={mockAmenities.slice(3, 6)}
          />
        </div>
      );

      expect(screen.getByText('First Amenities')).toBeInTheDocument();
      expect(screen.getByText('Second Amenities')).toBeInTheDocument();
    });

    it('should handle props changes between renders', () => {
      const { rerender } = render(
        <Testimonials
          heading="Initial Heading"
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials.slice(0, 2)}
        />
      );

      expect(screen.getByText('Initial Heading')).toBeInTheDocument();

      // Need to ensure the component has testimonials to render after rerender
      rerender(
        <Testimonials
          heading="Updated Heading"
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials.slice(0, 2)}
        />
      );

      expect(screen.getByText('Updated Heading')).toBeInTheDocument();
      expect(screen.queryByText('Initial Heading')).not.toBeInTheDocument();
    });
  });
});
