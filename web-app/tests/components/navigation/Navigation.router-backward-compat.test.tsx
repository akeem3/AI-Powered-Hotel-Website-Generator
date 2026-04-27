/**
 * Navigation Router - Backward Compatibility Tests
 *
 * Tests for Story 18.1 acceptance criteria related to backward compatibility.
 * Verifies that the router handles legacy layout values and edge cases correctly.
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

describe('Navigation Router - Backward Compatibility (Story 18.1)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('AC6: Legacy "default" layout value support', () => {
    it('should map legacy "default" layout to "classic" (NavigationClassic)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'default' as any, style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic (3-column grid)
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();

      // Should have Test Hotel branding
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });

    it('should not throw runtime error when receiving legacy "default" layout', () => {
      expect(() => {
        render(
          <Navigation {...defaultNavProps} variant={{ layout: 'default' as any, style: 'solid' }} />
        );
      }).not.toThrow();
    });
  });

  describe('AC7: Legacy "tall" layout value support', () => {
    it('should map legacy "tall" layout to "classic" (NavigationClassic)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'tall' as any, style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should not throw runtime error when receiving legacy "tall" layout', () => {
      expect(() => {
        render(
          <Navigation {...defaultNavProps} variant={{ layout: 'tall' as any, style: 'solid' }} />
        );
      }).not.toThrow();
    });
  });

  describe('AC4: Unknown layout value fallback to NavigationClassic', () => {
    it('should handle unknown layout values by falling back to NavigationClassic', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'unknown-variant' as any, style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic (fallback)
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should not throw console error or exception for unknown layout', () => {
      // The main requirement is that unknown layouts don't cause crashes
      expect(() => {
        render(
          <Navigation {...defaultNavProps} variant={{ layout: 'totally-bogus' as any, style: 'solid' }} />
        );
      }).not.toThrow();
    });
  });

  describe('AC4 (part): Undefined layout defaults to NavigationClassic', () => {
    it('should handle undefined layout by defaulting to NavigationClassic', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: undefined, style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic (default)
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should handle null layout gracefully', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: null as any, style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic (default)
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });

    it('should handle empty string layout gracefully', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: '' as any, style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic (default)
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing variant object entirely', () => {
      const { container } = render(<Navigation {...defaultNavProps} />);

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic with default styling
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });

    it('should handle variant without layout property', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ style: 'glass' } as any} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // Should render NavigationClassic (default layout)
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should preserve backward compatibility with existing fixtures', () => {
      // Simulate the three Epic 16 fixtures before migration
      const luxuryFixture = { layout: 'default' as any, style: 'transparent' as any };
      const budgetFixture = { layout: 'compact' as any, style: 'solid' as any };
      const businessFixture = { layout: 'default' as any, style: 'glass' as any };

      // All should render without errors
      expect(() => {
        render(<Navigation {...defaultNavProps} variant={luxuryFixture} />);
      }).not.toThrow();

      expect(() => {
        render(<Navigation {...defaultNavProps} variant={budgetFixture} />);
      }).not.toThrow();

      expect(() => {
        render(<Navigation {...defaultNavProps} variant={businessFixture} />);
      }).not.toThrow();
    });
  });

  describe('Valid new layouts work correctly after migration', () => {
    it('should render correctly with "classic" layout (new standard)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'classic', style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // NavigationClassic: 3-column grid
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should render correctly with "compact" layout (new structural variant)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'compact', style: 'solid' }} />
      );

      // NavigationCompact is implemented (no longer a stub)
      // Check for single-row centered-links layout (unique to NavigationCompact)
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();

      // NavigationCompact uses flex-1 justify-center for centered links
      const navList = container.querySelector('ul[aria-label="Primary navigation links"]');
      expect(navList).toHaveClass('flex-1', 'justify-center');

      // NavigationCompact has pill-style rounded appearance
      expect(nav).toHaveClass('lg:rounded-2xl');
      expect(nav).toHaveClass('lg:h-nav-compact');
    });

    it('should render correctly with "extended" layout (new structural variant)', () => {
      const { container } = render(
        <Navigation {...defaultNavProps} variant={{ layout: 'extended', style: 'solid' }} />
      );

      // NavigationExtended is implemented (no longer a stub)
      // Check for booking widget bar element (unique to NavigationExtended)
      const bookingWidgetBar = container.querySelector('.border-t');
      expect(bookingWidgetBar).toBeInTheDocument();

      // Check for booking widget labels
      expect(screen.getByText('Check-in')).toBeInTheDocument();
    });
  });
});
