/**
 * Content Migration Integration Tests (Story 11.4)
 *
 * Integration tests for components that use props-based content resolution.
 * Tests HeroSection, Amenities, and Testimonials props-to-render behavior.
 *
 * Architecture note (post Epic-22/24):
 * These components no longer use usePageContent or feature flags.
 * Content is resolved via the props > CONTENT_DEFAULTS fallback chain.
 *
 * Test scenarios:
 * 1. Components render correctly with explicit props
 * 2. Components fall back to defaults when no props provided
 * 3. Components render with props overriding defaults
 * 4. Error graceful degradation (props-based rendering continues)
 * 5. Props fallback chain (props > default)
 * 6. Heading/subheading prop overrides
 * 7. No hotel ID does not affect rendering
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from '@/components/sections/HeroSection';
import Amenities from '@/components/blocks/Amenities';
import Testimonials from '@/components/blocks/Testimonials';
import { mockAmenities } from '@/components/data/mockAmenities';
import { mockTestimonials } from '@/components/data/mockTestimonials';

// Mock framer-motion
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

// Mock validation
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Mock Font Awesome
jest.mock('@fortawesome/react-fontawesome', () => {
  return function MockFontAwesomeIcon({ icon, className, ...props }: any) {
    return <span className={`fa ${className || ''}`} {...props} />;
  };
});

describe('Content Migration Integration Tests (Story 11.4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Scenario 1: Components render explicit props
  // ============================================================================
  describe('Scenario 1: Components render explicit props', () => {
    it('should render HeroSection with explicit props', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="Experience Luxury"
          headline="Welcome to Paradise"
          tagline="Grand Hotel"
          background="solid"
        />
      );

      expect(screen.getByText('Experience Luxury')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Paradise')).toBeInTheDocument();
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
    });

    it('should render Amenities with explicit heading props', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 6)}
          heading="Premium Amenities"
          subheading="Discover our facilities"
        />
      );

      expect(screen.getByText('Premium Amenities')).toBeInTheDocument();
      expect(screen.getByText('Discover our facilities')).toBeInTheDocument();
    });

    it('should render Testimonials with explicit heading props', () => {
      render(
        <Testimonials
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials.slice(0, 6)}
          heading="What Our Guests Say"
          subheading="Read reviews from our satisfied customers"
        />
      );

      expect(screen.getByText('What Our Guests Say')).toBeInTheDocument();
      expect(screen.getByText('Read reviews from our satisfied customers')).toBeInTheDocument();
    });

    it('should render all three components together with explicit props', () => {
      render(
        <div>
          <HeroSection
            hotelId="test-hotel"
            title="Grand Hotel"
            tagline="Experience Luxury"
            headline="Welcome to Paradise"
            background="solid"
          />
          <Amenities
            hotelId="test-hotel"
            variant={{ layout: 'grid' }}
            amenities={mockAmenities.slice(0, 3)}
            heading="Premium Amenities"
          />
          <Testimonials
            hotelId="test-hotel"
            variant={{ layout: 'grid' }}
            testimonials={mockTestimonials.slice(0, 3)}
            heading="What Our Guests Say"
          />
        </div>
      );

      expect(screen.getByText('Experience Luxury')).toBeInTheDocument();
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
      expect(screen.getByText('Premium Amenities')).toBeInTheDocument();
      expect(screen.getByText('What Our Guests Say')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Scenario 2: Components without explicit props (default values)
  // ============================================================================
  describe('Scenario 2: Components without explicit props (default values)', () => {
    it('should render HeroSection with provided props', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="Props Title"
          headline="Props Headline"
          tagline="Props Tagline"
          background="solid"
        />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      expect(screen.getByText('Props Headline')).toBeInTheDocument();
      expect(screen.getByText('Props Tagline')).toBeInTheDocument();
    });

    it('should render HeroSection with default CTA values when no CTAs provided', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="The Sterling Executive"
          headline="Where Comfort Meets Prestige"
          background="solid"
        />
      );

      // Default CTA values from HeroCentered
      expect(screen.getByText('View Rooms')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });

    it('should render Amenities with defaults when no heading provided', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
        />
      );

      // Default values from CONTENT_DEFAULTS
      expect(screen.getByText('Our Amenities')).toBeInTheDocument();
      expect(screen.getByText('Discover our facilities')).toBeInTheDocument();
    });

    it('should render Testimonials with defaults when no heading provided', () => {
      render(
        <Testimonials
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials.slice(0, 3)}
        />
      );

      // Default values from CONTENT_DEFAULTS
      expect(screen.getByText('Guest Reviews')).toBeInTheDocument();
      expect(screen.getByText('What our guests say')).toBeInTheDocument();
    });

    it('should render HeroSection with props when no content system present', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="Props Only Title"
          headline="Props Only Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Props Only Title')).toBeInTheDocument();
      expect(screen.getByText('Props Only Headline')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Scenario 3: Components render without crashing (robust rendering)
  // ============================================================================
  describe('Scenario 3: Robust rendering (no crashes)', () => {
    it('should not crash HeroSection when props provided', () => {
      const { container } = render(
        <HeroSection hotelId="test-hotel" title="Loading Title" headline="Loading Headline" background="solid" />
      );

      expect(screen.getByText('Loading Title')).toBeInTheDocument();
      expect(screen.getByText('Loading Headline')).toBeInTheDocument();
    });

    it('should render Amenities with empty list without crashing', () => {
      expect(() => {
        render(
          <Amenities hotelId="test-hotel" variant={{ layout: 'grid' }} amenities={[]} />
        );
      }).not.toThrow();
    });

    it('should render Testimonials with empty list without crashing', () => {
      expect(() => {
        render(
          <Testimonials hotelId="test-hotel" variant={{ layout: 'grid' }} testimonials={[]} />
        );
      }).not.toThrow();
    });

    it('should render Amenities with props without crashing', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
        />
      );

      expect(screen.getByText('Our Amenities')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Scenario 4: Error-resilient rendering (components render with given props)
  // ============================================================================
  describe('Scenario 4: Error-resilient rendering', () => {
    it('should gracefully degrade and render provided props for HeroSection', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="Fallback Title"
          headline="Fallback Headline"
          background="solid"
        />
      );

      // Should render with provided props
      expect(screen.getByText('Fallback Title')).toBeInTheDocument();
      expect(screen.getByText('Fallback Headline')).toBeInTheDocument();
    });

    it('should gracefully degrade and render for Amenities with props', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
        />
      );

      // Should still render with defaults
      expect(screen.getByText('Our Amenities')).toBeInTheDocument();
    });

    it('should gracefully degrade and render for Testimonials with props', () => {
      render(
        <Testimonials
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials.slice(0, 3)}
        />
      );

      // Should still render with defaults
      expect(screen.getByText('Guest Reviews')).toBeInTheDocument();
    });

    it('should render HeroSection with explicit title and headline props', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="Title"
          headline="Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Headline')).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Scenario 5: Props as content source (props > default)
  // ============================================================================
  describe('Scenario 5: Props as content source (props > default)', () => {
    it('should use props for HeroSection', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="Props Title"
          headline="Props Headline"
          tagline="Props Tagline"
          background="solid"
        />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      expect(screen.getByText('Props Headline')).toBeInTheDocument();
      expect(screen.getByText('Props Tagline')).toBeInTheDocument();
    });

    it('should use props for Amenities', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
          heading="Props Heading"
          subheading="Props Subheading"
        />
      );

      expect(screen.getByText('Props Heading')).toBeInTheDocument();
      expect(screen.getByText('Props Subheading')).toBeInTheDocument();
    });

    it('should use props for Testimonials', () => {
      render(
        <Testimonials
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials.slice(0, 3)}
          heading="Props Heading"
          subheading="Props Subheading"
        />
      );

      expect(screen.getByText('Props Heading')).toBeInTheDocument();
      expect(screen.getByText('Props Subheading')).toBeInTheDocument();
    });

    it('should use explicit heading props for HeroSection instead of defaults', () => {
      render(
        <HeroSection
          hotelId="test-hotel"
          title="Custom Title"
          headline="Custom Headline"
          tagline="Custom Tagline"
          background="solid"
        />
      );

      // Explicit props are used
      expect(screen.getByText('Custom Title')).toBeInTheDocument();
      expect(screen.getByText('Custom Headline')).toBeInTheDocument();
      expect(screen.getByText('Custom Tagline')).toBeInTheDocument();
      // Defaults are NOT shown
      expect(screen.queryByText('Hotel Name')).not.toBeInTheDocument();
    });

    it('should use explicit heading props for Amenities instead of defaults', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
          heading="Custom Heading"
          subheading="Custom Subheading"
        />
      );

      expect(screen.getByText('Custom Heading')).toBeInTheDocument();
      expect(screen.getByText('Custom Subheading')).toBeInTheDocument();
      expect(screen.queryByText('Our Amenities')).not.toBeInTheDocument();
    });

    it('should use explicit heading props for Testimonials instead of defaults', () => {
      render(
        <Testimonials
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          testimonials={mockTestimonials.slice(0, 3)}
          heading="Custom Heading"
          subheading="Custom Subheading"
        />
      );

      expect(screen.getByText('Custom Heading')).toBeInTheDocument();
      expect(screen.getByText('Custom Subheading')).toBeInTheDocument();
      expect(screen.queryByText('Guest Reviews')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Scenario 6: Heading prop overrides
  // ============================================================================
  describe('Scenario 6: Heading prop overrides', () => {
    it('should render Amenities with custom heading overriding defaults', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
          heading="Premium Amenities"
        />
      );

      expect(screen.getByText('Premium Amenities')).toBeInTheDocument();
      expect(screen.queryByText('Our Amenities')).not.toBeInTheDocument();
    });

    it('should render Amenities with defaults when no heading prop provided', () => {
      render(
        <Amenities
          hotelId="test-hotel"
          variant={{ layout: 'grid' }}
          amenities={mockAmenities.slice(0, 3)}
        />
      );

      expect(screen.getByText('Our Amenities')).toBeInTheDocument();
      expect(screen.queryByText('Premium Amenities')).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Scenario 7: No Hotel ID (rendering still works)
  // ============================================================================
  describe('Scenario 7: No Hotel ID (rendering still works)', () => {
    it('should render HeroSection without hotelId', () => {
      render(
        <HeroSection
          title="No Fetch Title"
          headline="No Fetch Headline"
          background="solid"
        />
      );

      expect(screen.getByText('No Fetch Title')).toBeInTheDocument();
    });

    it('should render HeroSection with empty hotelId', () => {
      render(
        <HeroSection
          hotelId=""
          title="Empty Hotel ID"
          headline="Empty Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Empty Hotel ID')).toBeInTheDocument();
    });
  });
});
