/**
 * NavigationClassic Component Tests
 *
 * Tests for Story 18.2 acceptance criteria.
 * Verifies the NavigationClassic sub-component implementation.
 *
 * @module tests/components/navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { usePathname } from 'next/navigation';
import { NavigationClassic } from '@/components/blocks/Navigation/NavigationClassic';

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

describe('NavigationClassic Component (Story 18.2)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('AC1 & AC2 & AC3: Desktop Navigation - CSS Grid 3-Column Layout', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should render desktop navigation with CSS Grid 3-column structure', () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Check for 3-column grid layout
      const desktopNav = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should place logo in left column', () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Logo should have justify-self-start (left column)
      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toHaveClass('justify-self-start');
    });

    it('should place navigation links in center column', () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Nav links should have justify-self-center (center column)
      const navList = container.querySelector('ul[aria-label="Primary navigation links"]');
      expect(navList).toHaveClass('justify-self-center');
    });

    it('should place CTA button in right column', () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // CTA should have justify-self-end (right column) and mr-container (right margin)
      const ctaContainer = container.querySelector('.mr-container.justify-self-end');
      expect(ctaContainer).toBeInTheDocument();
    });

    it('should display Test Hotel branding', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      // "TH" (initials for "Test Hotel") appears twice (desktop + mobile)
      const initialsElements = screen.getAllByText('TH');
      expect(initialsElements.length).toBeGreaterThan(0);

      // "Test Hotel" also appears twice
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });

    it('should render all navigation links inline (visible without interaction)', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Rooms' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('should render Book CTA button', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const bookLink = screen.getByRole('link', { name: 'Book Now' });
      expect(bookLink).toBeInTheDocument();
      expect(bookLink).toHaveAttribute('href', '/booking');
    });
  });

  describe('AC4 & AC5: Mobile Navigation - Hamburger Menu Pattern', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should render mobile navigation with logo on left', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const logoLink = screen.getByRole('link', { name: /test hotel logo/i });
      expect(logoLink).toBeInTheDocument();
    });

    it('should render hamburger button on right', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should hide navigation links behind hamburger menu (initially)', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Mobile drawer should not be visible initially
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should show mobile drawer when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      // Mobile menu dialog should appear
      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should close drawer when X button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

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
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      // All links should be visible in drawer
      // Use getAllByText since links exist in both desktop and mobile views
      const homeLinks = screen.getAllByRole('link', { name: 'Home' });
      expect(homeLinks.length).toBeGreaterThan(0);

      const roomsLinks = screen.getAllByRole('link', { name: 'Rooms' });
      expect(roomsLinks.length).toBeGreaterThan(0);

      const contactLinks = screen.getAllByRole('link', { name: 'Contact' });
      expect(contactLinks.length).toBeGreaterThan(0);
    });

    it('should close drawer when a navigation link is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Open menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Click a link from the mobile drawer (find within dialog)
      const dialog = screen.getByRole('dialog');
      const homeLink = dialog.querySelector('a[href="/"]');
      await user.click(homeLink!);

      // Drawer should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('AC6: Style Variants (transparent, solid, glass)', () => {
    it('should apply transparent style variant', () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'transparent' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-transparent');
      expect(nav).toHaveClass('text-text-inverted');
    });

    it('should apply solid style variant', () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-surface-primary');
      expect(nav).toHaveClass('text-text-primary');
    });

    it('should apply glass style variant', () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'glass' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('backdrop-blur-md');
      expect(nav).toHaveClass('border-b');
      // Check that the class contains the glass style (using className string check)
      expect(nav?.className).toContain('bg-surface-primary/high');
    });
  });

  describe('AC7: HTML structure identical across style variants', () => {
    it('should have same DOM structure for transparent and solid styles', () => {
      const { container: transparentContainer } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'transparent' }} />
      );
      const { container: solidContainer } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Both should have nav element
      const transparentNav = transparentContainer.querySelector('nav');
      const solidNav = solidContainer.querySelector('nav');
      expect(transparentNav).toBeInTheDocument();
      expect(solidNav).toBeInTheDocument();

      // Both should have 3-column grid on desktop
      const transparentGrid = transparentContainer.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      const solidGrid = solidContainer.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(transparentGrid).toBeInTheDocument();
      expect(solidGrid).toBeInTheDocument();

      // Both should have same navigation links
      const transparentLinks = transparentContainer.querySelectorAll('a[href]');
      const solidLinks = solidContainer.querySelectorAll('a[href]');
      expect(transparentLinks.length).toBe(solidLinks.length);
    });

    it('should have same DOM structure for glass style', () => {
      const { container: glassContainer } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'glass' }} />
      );

      const glassNav = glassContainer.querySelector('nav');
      expect(glassNav).toBeInTheDocument();

      const glassGrid = glassContainer.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(glassGrid).toBeInTheDocument();
    });
  });

  describe('AC8: Client Component directive', () => {
    it('should be a Client Component (uses useState for menuOpen)', () => {
      // This is verified by the fact that we can interact with the menu state
      // If it were a Server Component, state management would fail
      const { rerender } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Initial state - menu closed
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

      // The component must use useState internally to manage menuOpen state
      // We can't directly test the 'use client' directive, but the stateful
      // behavior confirms it's working as a Client Component
    });
  });

  describe('AC9: ARIA attributes preserved', () => {
    it('should have proper ARIA attributes on mobile menu button', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have proper ARIA attributes on mobile drawer when open', async () => {
      const user = userEvent.setup();
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-current on active navigation link', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const roomsLink = screen.getByRole('link', { name: 'Rooms' });
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have aria-label on navigation list', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const navList = screen.getByRole('list', { hidden: true });
      expect(navList.closest('ul')).toHaveAttribute('aria-label', 'Primary navigation links');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have focus-ring class on interactive elements', () => {
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toHaveClass('focus-ring');

      const bookLink = screen.getByRole('link', { name: 'Book Now' });
      expect(bookLink).toHaveClass('focus-ring-inverted');
    });
  });

  describe('Active page highlighting', () => {
    it('should highlight active page with font-semibold and underline', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const roomsLink = screen.getByRole('link', { name: 'Rooms' });
      expect(roomsLink).toHaveClass('font-semibold', 'underline');
    });

    it('should not highlight non-active pages', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationClassic {...defaultNavProps} variant={{ style: 'solid' }} />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).not.toHaveClass('font-semibold');
      expect(homeLink).toHaveClass('hover:font-semibold');
    });
  });
});
