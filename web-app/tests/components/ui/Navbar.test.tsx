import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '@/components/ui/Navbar';
import '@testing-library/jest-dom';

// Mock Next.js hooks
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Navbar Component', () => {
  const mockUsePathname = jest.requireMock('next/navigation').usePathname;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Component renders correctly with all navigation links
  describe('Rendering', () => {
    it('renders all navigation links', () => {
      render(<Navbar />);

      // Get all links by name (there will be duplicates for mobile and desktop)
      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
      const contactLinks = screen.getAllByRole('link', { name: /contact/i });

      // Desktop link (hidden on mobile)
      expect(homeLinks[0]).toBeInTheDocument();
      expect(homeLinks[0]).toHaveAttribute('href', '/');

      expect(roomsLinks[0]).toBeInTheDocument();
      expect(roomsLinks[0]).toHaveAttribute('href', '/rooms');

      expect(contactLinks[0]).toBeInTheDocument();
      expect(contactLinks[0]).toHaveAttribute('href', '/contact');
    });

    it('renders hotel logo and branding', () => {
      render(<Navbar />);

      // There are two logo links (mobile and desktop)
      const logoLinks = screen.getAllByRole('link', { name: /go to homepage|sterling executive logo/i });
      expect(logoLinks.length).toBeGreaterThanOrEqual(1);
      expect(logoLinks[0]).toHaveAttribute('href', '/');

      // Get all instances of SE and Sterling Executive text
      const logoIcons = screen.getAllByText('SE');
      expect(logoIcons.length).toBeGreaterThanOrEqual(1);
      // Story 1.11: Updated to semantic tokens - logo uses brand-secondary
      expect(logoIcons[0]).toHaveClass('bg-brand-secondary');

      const brandNames = screen.getAllByText('Sterling Executive');
      expect(brandNames.length).toBeGreaterThanOrEqual(1);
    });

    it('renders mobile menu button', () => {
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveAttribute('aria-label', 'Open navigation menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
    });
  });

  // Test 2: Active link highlighting logic
  describe('Active Link States', () => {
    it('highlights home link when on homepage', () => {
      mockUsePathname.mockReturnValue('/');
      render(<Navbar />);

      // Get all Home links and find the one with active state
      const allLinks = screen.getAllByRole('link');
      const homeLink = allLinks.find(link =>
        link.textContent === 'Home' &&
        link.getAttribute('aria-current') === 'page'
      );

      expect(homeLink).toBeDefined();
      // Story 1.11: Updated to semantic tokens - active state uses underline + font-semibold
      expect(homeLink).toHaveClass('font-semibold', 'underline');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
    });

    it('highlights rooms link when on rooms page', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<Navbar />);

      const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
      // Story 1.11: Updated to semantic tokens
      expect(roomsLinks[0]).toHaveClass('font-semibold', 'underline');
      expect(roomsLinks[0]).toHaveAttribute('aria-current', 'page');

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      expect(homeLinks[0]).not.toHaveClass('font-semibold', 'underline');
      expect(homeLinks[0]).not.toHaveAttribute('aria-current');
    });

    it('highlights contact link when on contact page', () => {
      mockUsePathname.mockReturnValue('/contact');
      render(<Navbar />);

      const contactLinks = screen.getAllByRole('link', { name: /contact/i });
      // Story 1.11: Updated to semantic tokens
      expect(contactLinks[0]).toHaveClass('font-semibold', 'underline');
      expect(contactLinks[0]).toHaveAttribute('aria-current', 'page');
    });

    it('highlights correct link in mobile menu', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      // Get all rooms links (desktop + mobile)
      const mobileRoomsLinks = screen.getAllByRole('link', { name: /rooms/i });
      // The mobile menu link should also be highlighted
      // Story 1.11: Updated to semantic tokens - active state uses font-semibold + underline
      const mobileLink = mobileRoomsLinks.find(link =>
        link.className.includes('font-semibold') &&
        link.getAttribute('aria-current') === 'page'
      );
      expect(mobileLink).toBeDefined();
      expect(mobileLink).toHaveClass('font-semibold', 'underline');
      expect(mobileLink).toHaveAttribute('aria-current', 'page');
    });
  });

  // Test 3: Mobile menu functionality
  describe('Mobile Menu Functionality', () => {
    it('opens mobile menu when hamburger button is clicked', () => {
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(menuButton);

      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
      expect(menuButton).toHaveAttribute('aria-label', 'Close navigation menu');

      const mobileMenu = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(mobileMenu).toBeInTheDocument();
      expect(mobileMenu).toBeVisible();
    });

    it('closes mobile menu when close button (X) is clicked', () => {
      render(<Navbar />);

      // Open menu first
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      // Now close it
      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      fireEvent.click(closeButton);

      expect(closeButton).toHaveAttribute('aria-expanded', 'false');
      expect(closeButton).toHaveAttribute('aria-label', 'Open navigation menu');

      const mobileMenu = screen.queryByRole('dialog', { name: /mobile navigation/i });
      expect(mobileMenu).not.toBeInTheDocument();
    });

    it('closes mobile menu when navigation link is clicked', () => {
      render(<Navbar />);

      // Open menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      // Click on a navigation link in the mobile menu
      const mobileMenu = screen.getByRole('dialog', { name: /mobile navigation/i });
      const roomsLink = mobileMenu.querySelector('a[href="/rooms"]');
      expect(roomsLink).toBeInTheDocument();
      fireEvent.click(roomsLink!);

      // Menu should be closed
      const closedMenu = screen.queryByRole('dialog', { name: /mobile navigation/i });
      expect(closedMenu).not.toBeInTheDocument();
    });
  });

  // Test 4: Accessibility compliance
  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<Navbar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper ARIA roles and attributes', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation', { name: /primary site navigation/i });
      expect(nav).toBeInTheDocument();

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-controls', 'mobile-menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
      expect(menuButton).toHaveAttribute('aria-label');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });

      // Focus on menu button
      menuButton.focus();
      expect(menuButton).toHaveFocus();

      // Activate with Enter key
      await user.keyboard('{Enter}');
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Menu should be open
      const mobileMenu = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(mobileMenu).toBeInTheDocument();
    });

    it('maintains focus management in mobile menu', () => {
      render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      // The menu container should be a dialog
      const mobileMenu = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(mobileMenu).toHaveAttribute('aria-modal', 'true');
    });

    it('has proper heading hierarchy', () => {
      render(<Navbar />);

      // Navbar should not contain any headings to maintain proper hierarchy
      const headings = screen.queryAllByRole('heading');
      expect(headings).toHaveLength(0);
    });
  });

  // Test 5: Responsive behavior
  describe('Responsive Behavior', () => {
    it('shows desktop navigation on large screens', () => {
      // Mock window.innerWidth to simulate desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<Navbar />);

      // Desktop navigation is rendered but hidden on mobile
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Mobile menu button should still be present
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
    });
  });

  // Test 6: Icon rendering and states
  describe('Icon Rendering', () => {
    it('shows menu icon when menu is closed', () => {
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      const menuIcon = menuButton.querySelector('svg');
      expect(menuIcon).toBeInTheDocument();
    });

    it('shows close icon when menu is open', () => {
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      const closeIcon = closeButton.querySelector('svg');
      expect(closeIcon).toBeInTheDocument();
    });

    it('icons have proper aria-hidden attributes', () => {
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      const icon = menuButton.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  // Test 7: Navigation interaction
  describe('Navigation Interactions', () => {
    it('supports click events on navigation links', () => {
      render(<Navbar />);

      const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
      expect(roomsLinks[0]).toHaveAttribute('href', '/rooms');
    });

    it('logo link navigates to homepage', () => {
      render(<Navbar />);

      const logoLinks = screen.getAllByRole('link', { name: /go to homepage|sterling executive logo/i });
      expect(logoLinks[0]).toHaveAttribute('href', '/');
      expect(logoLinks[0]).toHaveAttribute('aria-label'); // Should have focus management
    });
  });

  // Test 8: CSS classes and styling
  describe('CSS Classes and Styling', () => {
    it('applies correct CSS classes to navigation container', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation');
      // Updated to match current implementation: w-full class on nav element
      expect(nav).toHaveClass('w-full');
    });

    it('applies hover states to navigation links', () => {
      render(<Navbar />);

      // Find the actual Home navigation link (not the logo)
      const allLinks = screen.getAllByRole('link');
      const homeLink = allLinks.find(link => link.textContent === 'Home');

      expect(homeLink).toBeDefined();
      // Updated to use semantic duration token from Epic 15
      expect(homeLink).toHaveClass('transition-all', 'duration-fast');
    });

    it('applies correct styling to mobile menu', () => {
      render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      const mobileMenu = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(mobileMenu).toHaveClass('bg-surface-primary', 'shadow-lg', 'rounded-b-lg', 'p-4');
    });
  });

  // Test 9: Edge cases and error handling
  describe('Edge Cases', () => {
    it('handles unknown pathname gracefully', () => {
      mockUsePathname.mockReturnValue('/unknown-page');
      render(<Navbar />);

      // No link should be marked as active
      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
      const contactLinks = screen.getAllByRole('link', { name: /contact/i });

      expect(homeLinks[0]).not.toHaveAttribute('aria-current', 'page');
      expect(roomsLinks[0]).not.toHaveAttribute('aria-current', 'page');
      expect(contactLinks[0]).not.toHaveAttribute('aria-current', 'page');
    });

    it('handles rapid menu open/close operations', () => {
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });

      // Rapid open/close (even number of clicks = closed, odd = open)
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);
      fireEvent.click(menuButton);

      // Should still work correctly (odd number of clicks = open)
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    });
  });

  // Test 10: Integration with user interactions
  describe('User Interaction Integration', () => {
    it('supports both click and keyboard activation of menu', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Tab to skip link first, then logo, then menu button
      await user.tab(); // Skip link
      await user.tab(); // Logo
      await user.tab(); // Menu button

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(document.activeElement).toBe(menuButton);

      // Test space key
      await user.keyboard('{ }');
      expect(menuButton).toHaveAttribute('aria-expanded', 'true');

      // Close it (the button should still be focused)
      await user.keyboard('{ }');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });

    it('maintains accessible focus patterns', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Tab through navigation elements
      await user.tab();
      // First element is skip link
      expect(document.activeElement?.getAttribute('href')).toBe('#main-content');

      await user.tab();
      // Second element is logo (mobile version)
      const logoLinks = screen.getAllByRole('link', { name: /go to homepage|sterling executive logo/i });
      expect(logoLinks.some(link => link === document.activeElement)).toBe(true);
    });
  });
});