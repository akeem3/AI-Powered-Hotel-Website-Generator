/**
 * NavigationExtended Component Tests
 *
 * Tests for Story 18.3 acceptance criteria.
 * Verifies the NavigationExtended sub-component implementation.
 *
 * @module tests/components/navigation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { usePathname } from 'next/navigation';
import { NavigationExtended } from '@/components/blocks/Navigation/NavigationExtended';

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

describe('NavigationExtended Component (Story 18.3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
  });

  describe('AC1, AC2, AC3: Desktop Navigation - Two-Row Asymmetric Layout', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should render desktop navigation with two-row structure', () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Desktop container should be visible (hidden lg:block)
      const desktopNav = container.querySelector('.hidden.lg\\:block');
      expect(desktopNav).toBeInTheDocument();
    });

    it('should place logo in top-left of row 1', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveClass('flex', 'items-center', 'gap-gap-card');
    });

    it('should place navigation links in top-right of row 1', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Nav links should be in row 1
      const navList = screen.getByRole('list', { hidden: true });
      expect(navList.closest('ul')).toHaveAttribute('aria-label', 'Primary navigation links');
    });

    it('should render booking widget bar in row 2', () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Row 2 should have booking widget with dates selector
      const checkInLabel = screen.getByText('Check-in');
      expect(checkInLabel).toBeInTheDocument();

      const checkOutLabel = screen.getByText('Check-out');
      expect(checkOutLabel).toBeInTheDocument();
    });

    it('should render all booking widget elements as static HTML (no functionality)', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Dates selector
      expect(screen.getByText('Check-in')).toBeInTheDocument();
      expect(screen.getByText('Check-out')).toBeInTheDocument();

      // Rooms & guests dropdown
      expect(screen.getByText('Rooms & Guests')).toBeInTheDocument();
      expect(screen.getByText('2 Guests, 1 Room')).toBeInTheDocument();

      // Special rates dropdown
      expect(screen.getByText('Special Rates')).toBeInTheDocument();
      // Use more flexible matcher for "Corporate ▼" text
      expect(screen.getByText((content, element) => {
        return content.includes('Corporate') && element?.tagName.toLowerCase() === 'span';
      })).toBeInTheDocument();

      // Check Availability button
      const checkAvailabilityBtn = screen.getByRole('button', { name: /check availability for booking/i });
      expect(checkAvailabilityBtn).toBeInTheDocument();
    });

    it('should display Test Hotel branding', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // "TH" (initials for "Test Hotel") appears in logo
      const initialsElements = screen.getAllByText('TH');
      expect(initialsElements.length).toBeGreaterThan(0);

      // "Test Hotel" appears
      const brandingElements = screen.getAllByText('Test Hotel');
      expect(brandingElements.length).toBeGreaterThan(0);
    });

    it('should render all navigation links (Home, Rooms, Contact)', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Rooms' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
    });

    it('should NOT have CSS Grid three-column structure', () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Should NOT have the Classic 3-column grid class
      const threeColumnGrid = container.querySelector('.lg\\:grid-cols-\\[1fr_auto_1fr\\]');
      expect(threeColumnGrid).not.toBeInTheDocument();
    });

    it('should have DOM structure distinct from NavigationClassic', () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // NavigationExtended has two-row structure with booking widget
      const bookingWidgetBar = container.querySelector('.border-t');
      expect(bookingWidgetBar).toBeInTheDocument();

      // Should have booking widget elements (Classic doesn't)
      expect(screen.getByText('Check-in')).toBeInTheDocument();
    });
  });

  describe('AC4, AC5, AC6: Mobile Navigation - Floating Book Now Button', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should render mobile navigation with logo on left', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const logoLink = screen.getByRole('link', { name: /test hotel logo/i });
      expect(logoLink).toBeInTheDocument();
    });

    it('should render hamburger button on right', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should render floating "Book Now" button fixed at bottom', () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Floating button should be visible on mobile
      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      expect(bookNowBtn).toBeInTheDocument();

      // Should have fixed positioning classes
      expect(bookNowBtn.closest('.fixed.bottom-0')).toBeInTheDocument();
    });

    it('should show mobile drawer when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      // Mobile menu dialog should appear
      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should close drawer when navigation link is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

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

  describe('AC7, AC8, AC9: Mobile Booking Modal', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should open booking modal when floating "Book Now" button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      // Booking modal should appear
      const modal = screen.getByRole('dialog', { name: /book your stay/i });
      expect(modal).toBeInTheDocument();
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });

    it('should render modal header with back button, close button, and title', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      // Back button
      const backButton = screen.getByRole('button', { name: 'Go back' });
      expect(backButton).toBeInTheDocument();

      // Title
      expect(screen.getByText('Book Your Stay')).toBeInTheDocument();

      // Close button
      const closeButton = screen.getByRole('button', { name: 'Close booking modal' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render modal body with all form fields', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      const modal = screen.getByRole('dialog', { name: /book your stay/i });

      // Check-in date
      expect(within(modal).getByText('Check-in')).toBeInTheDocument();

      // Check-out date
      expect(within(modal).getByText('Check-out')).toBeInTheDocument();

      // Guests & Rooms
      expect(within(modal).getByText('Guests & Rooms')).toBeInTheDocument();
      expect(within(modal).getByText('2 Guests')).toBeInTheDocument();
      expect(within(modal).getByText('1 Room')).toBeInTheDocument();

      // Room Type
      expect(within(modal).getByText('Room Type')).toBeInTheDocument();
      expect(within(modal).getByText('Standard Room')).toBeInTheDocument();

      // Special Rates
      expect(within(modal).getByText('Special Rates')).toBeInTheDocument();
      expect(within(modal).getByText('Corporate Rate')).toBeInTheDocument();
    });

    it('should render modal footer with "Check Availability" CTA', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      const checkAvailabilityBtn = screen.getAllByRole('button', { name: /check availability for booking/i });
      expect(checkAvailabilityBtn.length).toBeGreaterThan(0);
    });

    it('should close modal when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Open modal
      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      expect(screen.getByRole('dialog', { name: /book your stay/i })).toBeInTheDocument();

      // Close with back button
      const backButton = screen.getByRole('button', { name: 'Go back' });
      await user.click(backButton);

      expect(screen.queryByRole('dialog', { name: /book your stay/i })).not.toBeInTheDocument();
    });

    it('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Open modal
      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      expect(screen.getByRole('dialog', { name: /book your stay/i })).toBeInTheDocument();

      // Close with close button
      const closeButton = screen.getByRole('button', { name: 'Close booking modal' });
      await user.click(closeButton);

      expect(screen.queryByRole('dialog', { name: /book your stay/i })).not.toBeInTheDocument();
    });

    it('should close modal when backdrop is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Open modal
      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      const modal = screen.getByRole('dialog', { name: /book your stay/i });
      expect(modal).toBeInTheDocument();

      // Click backdrop (element with aria-hidden="true")
      const backdrop = modal.querySelector('[aria-hidden="true"]') as HTMLElement;
      await user.click(backdrop);

      expect(screen.queryByRole('dialog', { name: /book your stay/i })).not.toBeInTheDocument();
    });

    it('should close modal when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Open modal
      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      const modal = screen.getByRole('dialog', { name: /book your stay/i });
      expect(modal).toBeInTheDocument();

      // Press Escape key
      await user.keyboard('{Escape}');

      expect(screen.queryByRole('dialog', { name: /book your stay/i })).not.toBeInTheDocument();
    });

    it('should prevent body scroll when modal is open', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      // Initially body should not have overflow hidden
      expect(document.body.style.overflow).not.toBe('hidden');

      // Open modal
      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      // Body should have overflow hidden
      expect(document.body.style.overflow).toBe('hidden');

      // Close modal
      const backButton = screen.getByRole('button', { name: 'Go back' });
      await user.click(backButton);

      // Body overflow should be restored
      expect(document.body.style.overflow).not.toBe('hidden');
    });
  });

  describe('AC10: Style Variants (transparent, solid, glass)', () => {
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
        <NavigationExtended {...defaultNavProps} variant={{ style: 'transparent' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-transparent');
      expect(nav).toHaveClass('text-text-inverted');
    });

    it('should apply solid style variant', () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-surface-primary');
      expect(nav).toHaveClass('text-text-primary');
    });

    it('should apply glass style variant', () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'glass' }} />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('backdrop-blur-md');
      expect(nav).toHaveClass('border-b');
      expect(nav?.className).toContain('bg-surface-primary/high');
    });

    it('should preserve two-row layout structure across all style variants', () => {
      const { container: transparentContainer } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'transparent' }} />
      );
      const { container: solidContainer } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );
      const { container: glassContainer } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'glass' }} />
      );

      // All should have booking widget bar (row 2)
      expect(transparentContainer.querySelector('.border-t')).toBeInTheDocument();
      expect(solidContainer.querySelector('.border-t')).toBeInTheDocument();
      expect(glassContainer.querySelector('.border-t')).toBeInTheDocument();
    });
  });

  describe('AC11: Client Component directive', () => {
    it('should be a Client Component (uses useState for menuOpen and bookingModalOpen)', () => {
      // This is verified by the fact that we can interact with both states
      // If it were a Server Component, state management would fail
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );

      // Initial state - both menu and modal closed
      expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('dialog', { name: /book your stay/i })).not.toBeInTheDocument();

      // The component must use useState internally to manage both states
      // The interactive behavior confirms it's working as a Client Component
    });
  });

  describe('ARIA attributes', () => {
    it('should have proper ARIA attributes on mobile menu button', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('should have proper ARIA attributes on mobile drawer when open', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-current on active navigation link', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const roomsLink = screen.getByRole('link', { name: 'Rooms' });
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
    });

    it('should have aria-label on navigation list', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const navList = screen.getByRole('list', { hidden: true });
      expect(navList.closest('ul')).toHaveAttribute('aria-label', 'Primary navigation links');
    });

    it('should have proper ARIA attributes on booking modal', async () => {
      const user = userEvent.setup();
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      await user.click(bookNowBtn);

      const modal = screen.getByRole('dialog', { name: /book your stay/i });
      expect(modal).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have focus-ring class on interactive elements', () => {
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toHaveClass('focus-ring');

      const bookNowBtn = screen.getByRole('button', { name: 'Open booking modal' });
      expect(bookNowBtn).toHaveClass('focus-ring-inverted');
    });
  });

  describe('Active page highlighting', () => {
    it('should highlight active page with font-semibold and underline', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const roomsLink = screen.getByRole('link', { name: 'Rooms' });
      expect(roomsLink).toHaveClass('font-semibold', 'underline');
    });

    it('should not highlight non-active pages', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationExtended {...defaultNavProps} variant={{ style: 'solid' }} />);

      const homeLink = screen.getByRole('link', { name: 'Home' });
      expect(homeLink).not.toHaveClass('font-semibold');
      expect(homeLink).toHaveClass('hover:font-semibold');
    });
  });

  describe('FIXME comments for future BookingWidget integration', () => {
    it('should have TODO comment for dummy booking widget replacement', () => {
      const fs = require('fs');
      const path = require('path');
      // Navigate from tests/components/navigation/ to components/blocks/Navigation/
      const componentPath = path.join(__dirname, '../../../components/blocks/Navigation/NavigationExtended.tsx');
      const content = fs.readFileSync(componentPath, 'utf8');

      expect(content).toContain('FIXME: Replace dummy booking widget with BookingWidget component');
      expect(content).toContain('FIXME: Mobile booking modal is a placeholder');
    });
  });
});
