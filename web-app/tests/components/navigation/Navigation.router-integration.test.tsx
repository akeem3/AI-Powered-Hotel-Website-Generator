/**
 * Navigation Router - Integration Tests
 *
 * Tests for Story 18.1 acceptance criteria related to router delegation.
 * Verifies that the router delegates to the correct sub-component based on variant.layout.
 *
 * @module tests/components/navigation
 */

import { render, screen, cleanup } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/blocks/Navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const defaultNavProps = {
  brandName: 'Test Hotel',
  links: [
    { label: 'Home', href: '/' },
    { label: 'Rooms', href: '/rooms' },
    { label: 'Contact', href: '/contact' },
  ],
  ctaButton: { text: 'Book Now', href: '/booking' },
};

// Cleanup after each test
afterEach(() => {
  cleanup();
});

describe('Navigation Router - Integration Tests (Story 18.1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('AC1: Router delegates to NavigationClassic for layout: "classic"', () => {
    it('should render NavigationClassic when layout is "classic"', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // NavigationClassic uses CSS Grid 3-column layout on desktop
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();

      // Should have the Test Hotel branding (appears twice - desktop + mobile)
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });

    it('should pass all props to NavigationClassic', () => {
      const { container } = render(
        <Navigation
          {...defaultNavProps}
          variant={{ layout: 'classic', style: 'glass' }}
          className="custom-nav-class"
        />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-nav-class');

      // Glass style should be applied via navigationClassicVariants CVA
      expect(nav).toHaveClass('backdrop-blur-md');
    });
  });

  describe('AC2: Router delegates to NavigationCompact for layout: "compact"', () => {
    it('should render NavigationCompact when layout is "compact"', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'compact', style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // NavigationCompact uses single-row centered-links layout (flex-1 justify-center)
      const navList = container.querySelector('ul[aria-label="Primary navigation links"]');
      expect(navList).toBeInTheDocument();
      expect(navList).toHaveClass('flex-1', 'justify-center');

      // Should have pill-style rounded appearance
      expect(nav).toHaveClass('lg:rounded-2xl');
      expect(nav).toHaveClass('lg:h-nav-compact');
    });

    it('should pass className prop to NavigationCompact', () => {
      const { container } = render(
        <Navigation
          {...defaultNavProps}
          variant={{ layout: 'compact', style: 'solid' }}
          className="compact-nav"
        />
      );

      const nav = container.querySelector('.compact-nav');
      expect(nav).toBeInTheDocument();
    });

    it('should NOT have CSS Grid three-column structure (distinct from Classic)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'compact', style: 'solid' }} />
      );

      // NavigationCompact does NOT use Classic's 3-column grid
      const threeColumnGrid = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(threeColumnGrid).not.toBeInTheDocument();
    });

    it('should NOT have two-row structure with booking widget (distinct from Extended)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'compact', style: 'solid' }} />
      );

      // NavigationCompact does NOT have Extended's booking widget row
      const bookingWidgetBar = container.querySelector('.border-t');
      expect(bookingWidgetBar).not.toBeInTheDocument();
    });
  });

  describe('AC3: Router delegates to NavigationExtended for layout: "extended"', () => {
    it('should render NavigationExtended when layout is "extended"', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'extended', style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // NavigationExtended uses two-row layout with booking widget bar
      const bookingWidgetBar = container.querySelector('.border-t');
      expect(bookingWidgetBar).toBeInTheDocument();

      // Should have booking widget elements (Check-in, Check-out labels)
      expect(screen.getByText('Check-in')).toBeInTheDocument();
      expect(screen.getByText('Check-out')).toBeInTheDocument();
    });

    it('should pass className prop to NavigationExtended', () => {
      const { container } = render(
        <Navigation
          {...defaultNavProps}
          variant={{ layout: 'extended', style: 'solid' }}
          className="extended-nav"
        />
      );

      const nav = container.querySelector('.extended-nav');
      expect(nav).toBeInTheDocument();
    });

    it('should NOT have CSS Grid three-column structure (distinct from Classic)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'extended', style: 'solid' }} />
      );

      // NavigationExtended does NOT use Classic's 3-column grid
      const threeColumnGrid = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(threeColumnGrid).not.toBeInTheDocument();
    });
  });

  describe('AC4: Router delegates correctly when no layout is provided', () => {
    it('should default to NavigationClassic when layout is undefined', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic (3-column grid)
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should default to NavigationClassic when variant is missing entirely', () => {
      const { container } = render(<Navigation {...defaultNavProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Style variant propagation through router', () => {
    it('should apply transparent style through router to NavigationClassic', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'transparent' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-transparent');
    });

    it('should apply solid style through router to NavigationClassic', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-surface-primary');
    });

    it('should apply glass style through router to NavigationClassic', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'glass' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('backdrop-blur-md');
    });
  });

  describe('Router does not throw errors', () => {
    it('should not throw when rendering with all valid layouts', () => {
      expect(() => {
        const { unmount } = render(<Navigation {...defaultNavProps} variant={{ layout: 'classic' }} />);
        unmount();
      }).not.toThrow();

      expect(() => {
        const { unmount } = render(<Navigation {...defaultNavProps} variant={{ layout: 'compact' }} />);
        unmount();
      }).not.toThrow();

      expect(() => {
        const { unmount } = render(<Navigation {...defaultNavProps} variant={{ layout: 'extended' }} />);
        unmount();
      }).not.toThrow();
    });

    it('should not throw when rendering with all valid styles', () => {
      expect(() => {
        const { unmount } = render(<Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'transparent' }} />);
        unmount();
      }).not.toThrow();

      expect(() => {
        const { unmount } = render(<Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'solid' }} />);
        unmount();
      }).not.toThrow();

      expect(() => {
        const { unmount } = render(<Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'glass' }} />);
        unmount();
      }).not.toThrow();
    });
  });
});
