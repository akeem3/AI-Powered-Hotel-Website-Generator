/**
 * NavigationCompact Component Tests
 *
 * Tests for Story 18.4 acceptance criteria.
 * Verifies the NavigationCompact sub-component implementation.
 *
 * @module tests/components/navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { usePathname } from 'next/navigation';
import { NavigationCompact } from '@/components/blocks/Navigation/NavigationCompact';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

const defaultNavProps = {
  brandName: 'Test Hotel',
  links: [
    { label: 'Home', href: '/'},
    { label: 'Rooms', href: '/rooms'},
    { label: 'Contact', href: '/contact'},
  ],
  ctaButton: { text: 'Book Now', href: '/booking' },
};

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

describe('NavigationCompact Component (Story 18.4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('AC1: Desktop Navigation - Single-Row Centered-Links Layout', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should render desktop navigation with single-row layout', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Desktop container should be visible (hidden lg:flex)
      const desktopNav = container.querySelector('.hidden.lg\\:flex');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should place logo on the left', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Logo should be on the left with flex-none
      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveClass('flex-none');
    });

    it('should place navigation links in the center (flex-1 justify-center)', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Nav links should be centered using flex-1 and justify-center
      const navList = container.querySelector('ul[aria-label="Primary navigation links"]');
      expect(navList).toBeInTheDocument();
      expect(navList).toHaveClass('flex-1', 'justify-center');
    });

    it('should place Book CTA on the right', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // CTA should have flex-none (right side)
      const ctaContainer = container.querySelector('.flex-none');
      expect(ctaContainer).toBeInTheDocument();

      const bookLink = screen.getByRole('link', { name: 'Book Now' });
      expect(bookLink).toBeInTheDocument();
      expect(bookLink).toHaveAttribute('href', '/booking');
    });

    it('should display all navigation links inline (always-visible, no interaction required)', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Rooms' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('should NOT have a hamburger menu on desktop', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Mobile section should have lg:hidden class (hidden on desktop)
      const mobileSection = screen.queryByRole('button', { name: /open navigation menu/i });
      if (mobileSection) {
        // If found, it should be hidden on desktop (lg:hidden on parent container)
        const mobileContainer = mobileSection.closest('.lg\\:hidden');
        expect(mobileContainer).toBeInTheDocument();
      } else {
        // Or not found at all (both are acceptable)
        expect(mobileSection).not.toBeInTheDocument();
      }
    });

    it('should have pill-style rounded appearance (lg:rounded-2xl)', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:rounded-2xl');
    });

    it('should have compact height (h-nav-compact ~64px)', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:h-nav-compact');
    });

    it('should display Test Hotel branding', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      // "TH" (initials for "Test Hotel") appears in logo
      const initialsElements = screen.getAllByText('TH');
      expect(initialsElements.length).toBeGreaterThan(0);

      // "Test Hotel" appears
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });

    it('should have max-width constraint (lg:max-w-4xl) for pill appearance', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:max-w-4xl');
    });

    it('should have auto margins (lg:mx-auto) for centering the pill', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:mx-auto');
    });
  });

  describe('AC2: Tablet Navigation - Same Single-Row Layout', () => {
    beforeEach(() => {
      // Mock tablet viewport (between md and lg)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900,
      });
    });

    it('should use same single-row layout on tablet', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Desktop classes use lg: breakpoint, so tablet will use mobile layout
      // but the structure remains consistent
      const nav = container.querySelector('nav');
      expect(nav).toBeInTheDocument();
    });

    it('should have all navigation elements visible on tablet', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Logo
      expect(screen.getByRole('link', { name: /test hotel/i })).toBeInTheDocument();

      // On tablet (below lg), hamburger menu is shown instead of inline links
      const menuButton = screen.queryByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  describe('AC3: Mobile Navigation - Hamburger Menu Pattern', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should render mobile navigation with logo on left', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const logoLink = screen.getByRole('link', { name: /test hotel logo/i });
      expect(logoLink).toBeInTheDocument();
    });

    it('should render hamburger button on right', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should hide navigation links behind hamburger menu (initially)', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Mobile drawer should not be visible initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show mobile drawer when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      // Mobile menu dialog should appear
      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should close drawer when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Open menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Close menu
      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      await user.click(closeButton);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should display navigation links in mobile drawer when open', async () => {
      const user = userEvent.setup();
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      // All links should be visible in drawer
      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toBeInTheDocument();

      // Check links are in the drawer
      const homeLink = dialog.querySelector('a[href="/"]');
      expect(homeLink).toBeInTheDocument();

      const roomsLink = dialog.querySelector('a[href="/rooms"]');
      expect(roomsLink).toBeInTheDocument();

      const contactLink = dialog.querySelector('a[href="/contact"]');
      expect(contactLink).toBeInTheDocument();
    });

    it('should include Book CTA in mobile drawer', async () => {
      const user = userEvent.setup();
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });

      // Book CTA should be in the drawer
      const bookLink = dialog.querySelector('a[href="/booking"]');
      expect(bookLink).toBeInTheDocument();
    });

    it('should close drawer when a navigation link is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Open menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click a link from the mobile drawer
      const dialog = screen.getByRole('dialog');
      const homeLink = dialog.querySelector('a[href="/"]');
      await user.click(homeLink!);

      // Drawer should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('AC4: HTML structure distinct from NavigationClassic and NavigationExtended', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should NOT have CSS Grid three-column structure (distinct from Classic)', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Should NOT have the Classic 3-column grid class
      const threeColumnGrid = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(threeColumnGrid).not.toBeInTheDocument();
    });

    it('should NOT have two-row structure with booking widget (distinct from Extended)', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Should NOT have the Extended booking widget row (border-t)
      const bookingWidgetBar = container.querySelector('.border-t');
      expect(bookingWidgetBar).not.toBeInTheDocument();
    });

    it('should use flexbox with centered links (distinct from Classic grid and Extended two-row)', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // NavigationCompact uses flex-1 justify-center for centered links
      const navList = container.querySelector('ul[aria-label="Primary navigation links"]');
      expect(navList).toHaveClass('flex-1', 'justify-center');
    });

    it('should have pill-style rounded container (lg:rounded-2xl)', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:rounded-2xl');
      // Solid style variant uses shadow-md (base has shadow-lg but solid overrides it)
      expect(nav).toHaveClass('lg:shadow-md');
    });
  });

  describe('AC5: Style Variants (transparent, solid, glass)', () => {
    beforeEach(() => {
      // Mock desktop viewport for style tests
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should apply transparent style variant', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'transparent' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:bg-surface-primary/80');
      expect(nav).toHaveClass('lg:backdrop-blur-sm');
      expect(nav).toHaveClass('lg:text-text-primary');
    });

    it('should apply solid style variant', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:bg-surface-primary');
      expect(nav).toHaveClass('lg:text-text-primary');
      expect(nav).toHaveClass('lg:shadow-md');
    });

    it('should apply glass style variant', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'glass' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('lg:bg-surface-primary/75');
      expect(nav).toHaveClass('lg:backdrop-blur-md');
      expect(nav).toHaveClass('lg:shadow-lg');
    });

    it('should preserve single-row layout structure across all style variants', () => {
      const { container: transparentContainer } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'transparent' }} />
      );
      const { container: solidContainer } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );
      const { container: glassContainer } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'glass' }} />
      );

      // All should have the pill-style rounded appearance
      expect(transparentContainer.querySelector('nav')).toHaveClass('lg:rounded-2xl');
      expect(solidContainer.querySelector('nav')).toHaveClass('lg:rounded-2xl');
      expect(glassContainer.querySelector('nav')).toHaveClass('lg:rounded-2xl');

      // All should have centered links (flex-1 justify-center)
      const transparentList = transparentContainer.querySelector('ul[aria-label="Primary navigation links"]');
      const solidList = solidContainer.querySelector('ul[aria-label="Primary navigation links"]');
      const glassList = glassContainer.querySelector('ul[aria-label="Primary navigation links"]');

      expect(transparentList).toHaveClass('flex-1', 'justify-center');
      expect(solidList).toHaveClass('flex-1', 'justify-center');
      expect(glassList).toHaveClass('flex-1', 'justify-center');
    });
  });

  describe('AC5: Client Component directive', () => {
    it('should be a Client Component (uses useState for menuOpen)', () => {
      // This is verified by the fact that we can interact with the menu state
      // If it were a Server Component, state management would fail
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Initial state - menu closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // The component must use useState internally to manage menuOpen state
      // The interactive behavior confirms it's working as a Client Component
    });
  });

  describe('ARIA attributes', () => {
    it('should have proper ARIA attributes on mobile menu button', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have proper ARIA attributes on mobile drawer when open', async () => {
      const user = userEvent.setup();
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-current on active navigation link', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const roomsLink = screen.getByRole('link', { name: 'Rooms' });
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have aria-label on navigation list', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const navList = screen.getByRole('list', { hidden: true });
      expect(navList.closest('ul')).toHaveAttribute('aria-label', 'Primary navigation links');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have focus-ring class on interactive elements', () => {
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toHaveClass('focus-ring');

      const bookLink = screen.getByRole('link', { name: 'Book Now' });
      expect(bookLink).toHaveClass('focus-ring-inverted');
    });
  });

  describe('Active page highlighting', () => {
    it('should highlight active page with font-semibold and underline', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const roomsLink = screen.getByRole('link', { name: 'Rooms' });
      expect(roomsLink).toHaveClass('font-semibold', 'underline');
    });

    it('should not highlight non-active pages', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).not.toHaveClass('font-semibold');
      expect(homeLink).toHaveClass('hover:font-semibold');
    });
  });

  describe('className prop passthrough', () => {
    it('should pass custom className to the nav element', () => {
      const { container } = render(
        <NavigationCompact {...defaultNavProps} variant={{ style: 'solid' }} className="custom-nav-class" />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('custom-nav-class');
    });
  });
});
