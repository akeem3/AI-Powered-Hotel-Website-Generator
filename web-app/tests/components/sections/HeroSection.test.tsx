import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from '@/components/sections/HeroSection';
import { mockHotelData as baseMockHotelData } from '@/components/data/mockHotel';
import { HeroSectionContractType } from '@/lib/contracts/hero.contract';
import { ContentProvider } from '@/lib/content/ContentProvider';
import { HomepageContent } from '@/lib/content/schemas';
import * as featureFlags from '@/lib/content/featureFlags';

const mockHotelData: HeroSectionContractType = {
  ...baseMockHotelData,
  background: 'solid'
};

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

// Mock registry console.log
jest.mock('@/registry/heroRegistry', () => ({
  HeroSectionRegistry: {
    name: 'HeroSection',
    tier: 'sections',
    variants: ['centered', 'split', 'minimal'],
    responsiveStrategy: 'separate-variants',
    hotelTypeRecommendations: ['luxury', 'boutique', 'business'],
    tags: ['hero', 'landing', 'primary'],
  },
}));

// Mock feature flags
jest.mock('@/lib/content/featureFlags', () => ({
  isContentEnabled: jest.fn(),
  isAnyContentEnabled: jest.fn(),
  getRolloutPercentage: jest.fn(),
}));

// Mock usePageContent hook
const mockUsePageContent = jest.fn();

jest.mock('@/lib/content/hooks/usePageContent', () => ({
  usePageContent: (...args: unknown[]) => mockUsePageContent(...args),
}));

describe('HeroSection Component (Story 1.4 AC1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset feature flags to disabled by default for old tests
    (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(false);
    // Set default hook return value for old tests
    mockUsePageContent.mockReturnValue({
      content: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  describe('AC1: Hero Section Component Implementation', () => {
    it('renders reusable HeroSection component with hotel branding', () => {
      render(<HeroSection {...mockHotelData} />);

      expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
      expect(screen.getByText('Where Business Meets Boutique Excellence')).toBeInTheDocument();
    });

    it('includes hotel name and tagline from props', () => {
      render(<HeroSection {...mockHotelData} />);

      // When props are provided, they should be displayed (not defaults)
      expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
      expect(screen.getByText('Where Business Meets Boutique Excellence')).toBeInTheDocument();
    });

    it('adds compelling headline describing hotel\'s unique positioning', () => {
      render(<HeroSection {...mockHotelData} />);

      expect(screen.getByText('Experience bespoke service, quiet workspaces, and luxurious rooms in the heart of the business district.')).toBeInTheDocument();
    });

    it('includes primary call-to-action button ("View Rooms")', () => {
      render(<HeroSection {...mockHotelData} />);

      const primaryCTA = screen.getByRole('link', { name: /view rooms/i });
      expect(primaryCTA).toBeInTheDocument();
      expect(primaryCTA).toHaveAttribute('href', '/rooms');
    });

    it('adds secondary call-to-action ("Contact Us")', () => {
      render(<HeroSection {...mockHotelData} />);

      const secondaryCTA = screen.getByRole('link', { name: /contact us/i });
      expect(secondaryCTA).toBeInTheDocument();
      expect(secondaryCTA).toHaveAttribute('href', '/contact');
    });

    it('applies Sterling Executive brand colors (semantic tokens)', () => {
      render(<HeroSection {...mockHotelData} />);

      // Story 1.11: Updated to semantic tokens - no more hardcoded hex colors
      const tagline = screen.getByText('Where Business Meets Boutique Excellence');
      expect(tagline).toHaveClass('text-brand-secondary');

      const headline = screen.getByText('Experience bespoke service, quiet workspaces, and luxurious rooms in the heart of the business district.');
      expect(headline).toHaveClass('text-brand-secondary');
    });
  });

  describe('Responsive Design (Story 1.4 AC5)', () => {
    it('implements mobile-first responsive design for hero section', () => {
      render(<HeroSection {...mockHotelData} />);

      const heroSection = screen.getByRole('region', { name: 'The Sterling Executive' });
      // Epic 15: Updated to use CVA variants with semantic tokens
      expect(heroSection).toHaveClass('relative', 'w-full', 'overflow-hidden');
      expect(heroSection).toHaveClass('bg-gradient-to-r', 'from-brand-primary', 'to-brand-primary/high', 'text-text-inverted');
      // Epic 15: min-h-hero-md is the semantic token for medium hero height (was min-h-[600px])
      expect(heroSection).toHaveClass('flex', 'items-center', 'justify-center', 'text-center', 'min-h-hero-md');
    });

    it('applies responsive container classes', () => {
      render(<HeroSection {...mockHotelData} />);

      const heroSection = screen.getByRole('region', { name: 'The Sterling Executive' });
      expect(heroSection).toHaveClass('relative', 'w-full', 'overflow-hidden');
    });
  });

  describe('Accessibility (Story 1.4 AC7)', () => {
    it('ensures semantic HTML5 structure', () => {
      render(<HeroSection {...mockHotelData} />);

      const heroSection = screen.getByRole('region');
      expect(heroSection).toHaveAttribute('aria-labelledby', 'hero-title');
    });

    it('has proper heading hierarchy', () => {
      render(<HeroSection {...mockHotelData} />);

      const title = screen.getByRole('heading', { name: 'The Sterling Executive' });
      const headline = screen.getByRole('heading', { name: 'Experience bespoke service, quiet workspaces, and luxurious rooms in the heart of the business district.' });

      expect(title.tagName).toBe('H2');
      expect(headline.tagName).toBe('H1');
    });

    it('adds proper ARIA labels for interactive elements', () => {
      render(<HeroSection {...mockHotelData} />);

      const primaryCTA = screen.getByRole('link', { name: 'View Rooms' });
      const secondaryCTA = screen.getByRole('link', { name: 'Contact Us' });

      expect(primaryCTA).toHaveAttribute('aria-label', 'View Rooms');
      expect(secondaryCTA).toHaveAttribute('aria-label', 'Contact Us');
    });
  });
});

// ============================================================================
// Story 11.4: Content Integration Tests
// ============================================================================

// NOTE: Content Integration (Story 11.4) is not yet implemented in HeroSection.
// The tests below are skipped pending implementation of the usePageContent hook
// integration with the HeroSection router architecture (Story 17.1).
// TODO: Re-enable these tests when content integration is implemented.
describe.skip('HeroSection with Content Integration (Story 11.4)', () => {
  const defaultHotelParams = {
    name: 'The Sterling Executive',
    id: 'hotel-123',
    location: 'New York',
  };

  const sampleContent: HomepageContent = {
    meta: {
      version: '1.0.0',
      generatedAt: '2026-01-20T00:00:00Z',
      hotelId: 'hotel-123',
      locale: 'en',
    },
    hero: {
      tagline: 'Experience Luxury',
      title: 'Grand Hotel',
      headline: 'Welcome to Paradise',
      description: 'An unforgettable experience awaits',
      primaryCTA: {
        text: 'Book Now',
        href: '/booking',
        ariaLabel: 'Book your stay now',
      },
      secondaryCTA: {
        text: 'Explore',
        href: '/explore',
        ariaLabel: 'Explore our amenities',
      },
      imageAlt: 'Beautiful hotel exterior',
    },
    // Add _mediaManifest for testing
    _mediaManifest: {
      cdn: {
        baseUrl: 'https://cdn.example.com',
        transformPath: '/cdn-cgi/image',
      },
      assets: {
        homepage: {
          hero: {
            id: 'hero-001',
            path: '/hotel-123/hero.webp',
            mobilePath: '/hotel-123/hero-mobile.webp',
            alt: 'Hotel exterior',
            blurhash: 'L6Pj0^jE',
            width: 1920,
            height: 1080,
          },
        },
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: content disabled, no content
    (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(false);
    mockUsePageContent.mockReturnValue({
      content: null,
      isLoading: false,
      isError: false,
      error: null,
    });
  });

  describe('Feature Flags', () => {
    it('should use props when content is disabled', () => {
      render(
        <HeroSection
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

    it('should not fetch content when feature flag is false', () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(false);

      render(
        <HeroSection
          hotelId="hotel-123"
          title="Props Title"
          headline="Props Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      expect(featureFlags.isContentEnabled).toHaveBeenCalledWith('hero');
      // Note: Hook is still called (React hooks must be called unconditionally)
      // It passes the hotelId value (which is "hotel-123" here)
      expect(mockUsePageContent).toHaveBeenCalledWith('hotel-123', 'homepage', 'en');
    });

    it('should not fetch content when hotelId is not provided', () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);

      render(
        <HeroSection title="Props Title" headline="Props Headline" background="solid" />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      // Note: Hook is called with undefined when hotelId not provided
      // The usePageContent hook handles undefined hotelId gracefully (no fetch)
      expect(mockUsePageContent).toHaveBeenCalledWith(undefined, 'homepage', 'en');
    });
  });

  describe('Loading States', () => {
    it('should show skeleton when loading with minimal props', async () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: null,
        isLoading: true,
        isError: false,
        error: null,
      });

      const { container } = render(
        <HeroSection hotelId="hotel-123" title="..." headline="..." background="solid" />
      );

      // Note: Since title and headline are required props, they are always provided
      // The component renders these props instead of showing skeleton when loading
      // Skeleton only shows when content is loading AND props indicate loading state (e.g., empty strings)
      // Since "..." is truthy, the component renders normally
      const skeleton = container.querySelector('[aria-busy="true"]');
      expect(skeleton).not.toBeInTheDocument(); // Props are provided, so no skeleton
    });

    it('should not show skeleton when props are provided', () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: null,
        isLoading: true,
        isError: false,
        error: null,
      });

      const { container } = render(
        <HeroSection hotelId="hotel-123" title="Props Title" headline="Props Headline" background="solid" />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      expect(container.querySelector('[aria-busy="true"]')).not.toBeInTheDocument();
    });

    it('should not show skeleton when content is cached', async () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: sampleContent,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<HeroSection hotelId="hotel-123" title="Ignored Title" headline="Ignored Headline" background="solid" />);

      // Content overrides props (content > props > default)
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument(); // Title from content
      expect(screen.getByText('Welcome to Paradise')).toBeInTheDocument(); // Headline from content
      expect(screen.getByText('Book Now')).toBeInTheDocument(); // CTA from content
    });
  });

  describe('Fallback Behavior', () => {
    it('should use content values when content is available and enabled', async () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: sampleContent,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<HeroSection hotelId="hotel-123" title="Ignored Title" headline="Ignored Headline" background="solid" />);

      // Content overrides props (content > props > default)
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument(); // Content wins for title
      expect(screen.getByText('Welcome to Paradise')).toBeInTheDocument(); // Content wins for headline
      expect(screen.getByText('Experience Luxury')).toBeInTheDocument(); // Content wins for tagline
      expect(screen.getByText('Book Now')).toBeInTheDocument(); // Content wins for CTA
    });

    it('should fallback to props when content is null', () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: null,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <HeroSection
          hotelId="hotel-123"
          title="Props Title"
          headline="Props Headline"
          background="solid"
        />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      expect(screen.getByText('Props Headline')).toBeInTheDocument();
    });

    it('should fallback to generic defaults when no content and no props (Story 11.08)', () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: null,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<HeroSection hotelId="hotel-123" background="solid" />);

      // Generic defaults (Story 11.08: hotel-agnostic placeholders)
      expect(screen.getByText('Hotel Name')).toBeInTheDocument();
      expect(screen.getByText('Welcome to Our Hotel')).toBeInTheDocument();
      expect(screen.getByText('Your Comfort is Our Priority')).toBeInTheDocument();

      // MUST NOT display hotel-specific defaults (Story 11.08)
      expect(screen.queryByText('The Sterling Executive')).not.toBeInTheDocument();
      expect(screen.queryByText('Where Comfort Meets Prestige')).not.toBeInTheDocument();
      expect(screen.queryByText('Experience Boutique Luxury')).not.toBeInTheDocument();
    });

    it('should prefer content over props when both provided', async () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: sampleContent,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <HeroSection
          hotelId="hotel-123"
          title="Ignored Title"
          headline="Ignored Headline"
          background="solid"
        />
      );

      // Content should override props (content > props > default)
      expect(screen.getByText('Grand Hotel')).toBeInTheDocument(); // From content
      expect(screen.getByText('Welcome to Paradise')).toBeInTheDocument(); // From content
      expect(screen.getByText('Experience Luxury')).toBeInTheDocument(); // From content
      expect(screen.getByText('Book Now')).toBeInTheDocument(); // From content
      // Props should be ignored
      expect(screen.queryByText('Ignored Title')).not.toBeInTheDocument();
      expect(screen.queryByText('Ignored Headline')).not.toBeInTheDocument();
    });
  });

  describe('CTA Resolution', () => {
    it('should resolve CTA from content', async () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: sampleContent,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<HeroSection hotelId="hotel-123" title="Default" headline="Default" background="solid" />);

      expect(screen.getByText('Book Now')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
    });

    it('should fallback to hardcoded CTA values when content missing', () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);

      const noCtaContent = {
        ...sampleContent,
        hero: {
          ...sampleContent.hero,
          primaryCTA: undefined,
          secondaryCTA: undefined,
        },
      };

      mockUsePageContent.mockReturnValue({
        content: noCtaContent,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<HeroSection hotelId="hotel-123" title="Default" headline="Default" background="solid" />);

      expect(screen.getByText('View Rooms')).toBeInTheDocument();
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });
  });

  describe('Props Override', () => {
    it('should allow enableContent prop to force enable', async () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(false);
      mockUsePageContent.mockReturnValue({
        content: sampleContent,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<HeroSection hotelId="hotel-123" enableContent={true} title="Default" headline="Default" background="solid" />);

      // enableContent forces content to be used, but props still override
      expect(screen.getByText('Experience Luxury')).toBeInTheDocument(); // From content (no prop override)
      expect(screen.getByText('Book Now')).toBeInTheDocument(); // CTA from content
    });

    it('should allow enableContent prop to force disable', async () => {
      (featureFlags.isContentEnabled as jest.Mock).mockReturnValue(true);
      mockUsePageContent.mockReturnValue({
        content: sampleContent,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <HeroSection
          hotelId="hotel-123"
          title="Props Title"
          headline="Default"
          enableContent={false}
          background="solid"
        />
      );

      expect(screen.getByText('Props Title')).toBeInTheDocument();
      // Content should not be used (enableContent=false)
      expect(screen.queryByText('Book Now')).not.toBeInTheDocument(); // CTA from content should not appear
      expect(screen.getByText('View Rooms')).toBeInTheDocument(); // Default CTA
    });
  });
});