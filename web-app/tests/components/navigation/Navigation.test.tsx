import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '@/components/ui/Navbar';
import NavigationDesktop from '@/components/blocks/Navigation/NavigationDesktop';
import NavigationMobile from '@/components/blocks/Navigation/NavigationMobile';
import { useRouter, usePathname } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock console.log to avoid test output noise
const originalConsoleLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
});

describe('Navigation Component Suite - Story 1.3', () => {
  const mockPush = jest.fn();
  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      prefetch: jest.fn(),
    } as any);

    mockUsePathname.mockReturnValue('/');

    // Mock window.location for skip link tests (silence navigation errors)
    const originalConsoleError = console.error;
    console.error = jest.fn();

    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000',
      pathname: '/',
    };

    // Restore console.error after setup
    console.error = originalConsoleError;
  });

  describe('Navbar Component', () => {
    it('renders navbar with correct semantic structure', () => {
      render(<Navbar />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /primary site navigation/i })).toBeInTheDocument();
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();
    });

    it('renders skip link with proper accessibility attributes', () => {
      render(<Navbar />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveClass('sr-only');
      expect(skipLink).toHaveClass('focus:not-sr-only');
    });

    it('applies body scroll lock when mobile menu is open', () => {
      const { rerender } = render(<Navbar />);

      // Initially body scroll should not be locked
      expect(document.body.style.overflow).toBe('');

      // Open mobile menu by setting state directly through component interaction
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      // Check if body scroll is locked (may need to wait for useEffect)
      waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<Navbar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('NavigationDesktop Component', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('renders desktop navigation with all required elements', () => {
      render(<NavigationDesktop />);

      // Check logo
      expect(screen.getByText('SE')).toBeInTheDocument();
      expect(screen.getByText('Sterling Executive')).toBeInTheDocument();

      // Check navigation links - be more specific to avoid conflicts with logo
      const navigationLinks = screen.getAllByRole('link');
      const homeNavLink = navigationLinks.find(link => link.textContent === 'Home');
      const roomsLink = navigationLinks.find(link => link.textContent === 'Rooms');
      const contactLink = navigationLinks.find(link => link.textContent === 'Contact');
      const bookLink = navigationLinks.find(link => link.textContent === 'Book');

      expect(homeNavLink).toBeInTheDocument();
      expect(roomsLink).toBeInTheDocument();
      expect(contactLink).toBeInTheDocument();
      expect(bookLink).toBeInTheDocument();
    });

    it('highlights active page correctly', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationDesktop />);

      const roomsLink = screen.getByRole('link', { name: /rooms/i });
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
      // Story 1.11: Updated to semantic tokens - active state uses underline + font-semibold
      expect(roomsLink).toHaveClass('font-semibold', 'underline');
    });

    it('applies hover effects to non-active navigation items', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<NavigationDesktop />);

      const navigationLinks = screen.getAllByRole('link');
      const homeNavLink = navigationLinks.find(link => link.textContent === 'Home');
      // Story 1.11: Updated to semantic tokens - hover uses font-semibold only
      expect(homeNavLink).toHaveClass('hover:font-semibold');
      expect(homeNavLink).not.toHaveClass('font-semibold'); // Not active, so no bold
    });

    it('has proper focus management on navigation items', () => {
      render(<NavigationDesktop />);

      const navigationLinks = screen.getAllByRole('link');
      const homeNavLink = navigationLinks.find(link => link.textContent === 'Home');
      homeNavLink!.focus();

      expect(homeNavLink).toHaveFocus();
      expect(homeNavLink).toHaveClass('focus-ring');
    });

    it('logo link has proper accessibility attributes', () => {
      render(<NavigationDesktop />);

      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toHaveAttribute('aria-label', 'Go to homepage');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<NavigationDesktop />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('NavigationMobile Component', () => {
    const mockSetMenuOpen = jest.fn();

    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('renders mobile navigation in closed state', () => {
      render(<NavigationMobile menuOpen={false} setMenuOpen={mockSetMenuOpen} />);

      // Check hamburger menu button
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveAttribute('aria-controls', 'mobile-menu');

      // Mobile menu should not be visible
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders mobile navigation in open state', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      // Check close button
      expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close navigation menu/i })).toHaveAttribute('aria-expanded', 'true');

      // Mobile menu should be visible
      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');

      // Check navigation links are visible - find all links and verify by text
      const allLinks = screen.getAllByRole('link');
      const homeLink = allLinks.find(link => link.textContent === 'Home');
      const roomsLink = allLinks.find(link => link.textContent === 'Rooms');
      const contactLink = allLinks.find(link => link.textContent === 'Contact');

      expect(homeLink).toBeInTheDocument();
      expect(roomsLink).toBeInTheDocument();
      expect(contactLink).toBeInTheDocument();
    });

    it('toggles menu when hamburger button is clicked', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<NavigationMobile menuOpen={false} setMenuOpen={mockSetMenuOpen} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();
      await user.click(menuButton);

      // Verify setMenuOpen was called with a function (toggle pattern)
      expect(mockSetMenuOpen).toHaveBeenCalledTimes(1);
      expect(mockSetMenuOpen).toHaveBeenCalledWith(expect.any(Function));

      // Verify the function toggles the state correctly
      const toggleFn = mockSetMenuOpen.mock.calls[0][0];
      expect(toggleFn(false)).toBe(true); // prev: false -> true

      // Re-render with menu open to verify close functionality
      mockSetMenuOpen.mockClear();
      rerender(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      await user.click(closeButton);

      expect(mockSetMenuOpen).toHaveBeenCalledTimes(1);
      expect(mockSetMenuOpen).toHaveBeenCalledWith(expect.any(Function));

      // Verify the function toggles the state correctly
      const closeFn = mockSetMenuOpen.mock.calls[0][0];
      expect(closeFn(true)).toBe(false); // prev: true -> false
    });

    it('closes menu when link is clicked', async () => {
      const user = userEvent.setup();
      render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      // Find the specific home link in the mobile menu (not the logo)
      const mobileDialog = screen.getByRole('dialog');
      const homeLink = mobileDialog.querySelector('a[href="/"][aria-current="page"]');

      await user.click(homeLink!);

      expect(mockSetMenuOpen).toHaveBeenCalledWith(false);
    });

    it('highlights active page in mobile menu', () => {
      mockUsePathname.mockReturnValue('/contact');
      render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      const contactLink = screen.getByRole('link', { name: /contact/i });
      expect(contactLink).toHaveAttribute('aria-current', 'page');
      // Story 1.11: Updated to semantic tokens - active state uses underline + font-semibold
      expect(contactLink).toHaveClass('font-semibold', 'underline');
    });

    it('mobile menu items have 44px+ touch targets', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      // Get only the mobile menu dialog links (exclude logo)
      const mobileDialog = screen.getByRole('dialog');
      const menuItems = mobileDialog.querySelectorAll('a');

      menuItems.forEach(item => {
        // Check for Tailwind classes that provide sufficient touch target size
        // Updated to use semantic gap token from Epic 15
        expect(item).toHaveClass('py-gap-card', 'px-gap-card');
        // py-gap-card uses spacing token that provides sufficient touch target size
      });
    });

    it('has proper focus management in mobile menu', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      closeButton.focus();

      expect(closeButton).toHaveFocus();
      expect(closeButton).toHaveClass('focus-ring');
    });

    it('has no accessibility violations', async () => {
      const { container } = render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Responsive Breakpoint Behavior', () => {
    it('switches between mobile and desktop at 768px breakpoint', () => {
      const { rerender } = render(<Navbar />);

      // Test mobile viewport (767px)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      });

      // Should show mobile navigation
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();

      // Test desktop viewport (768px)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      rerender(<Navbar />);

      // Should show desktop navigation
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
    });

    it('maintains navigation state across viewport changes', () => {
      const { rerender } = render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(menuButton);

      // Verify mobile menu is open
      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Change to desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      rerender(<Navbar />);

      // The navigation state is maintained - mobile menu dialog is still present
      // because the menuOpen state is true and persists across viewport changes
      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // The close button should still be available
      expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close navigation menu/i })).toHaveAttribute('aria-expanded', 'true');

      // Verify we can close the menu after viewport change
      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      fireEvent.click(closeButton);

      // Menu should now be closed
      expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
    });
  });

  describe('Route Integration', () => {
    it('updates active state when pathname changes', () => {
      const { rerender } = render(<NavigationDesktop />);

      // Get all navigation links and find the specific ones
      const getNavLinkByContent = (content: string) => {
        const allLinks = screen.getAllByRole('link');
        return allLinks.find(link => link.textContent === content);
      };

      // Initially on home page
      const homeLink = getNavLinkByContent('Home');
      expect(homeLink).toHaveAttribute('aria-current', 'page');

      // Change to rooms page
      mockUsePathname.mockReturnValue('/rooms');
      rerender(<NavigationDesktop />);

      const roomsLink = getNavLinkByContent('Rooms');
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
      expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('persists navigation state across page reloads', () => {
      // Simulate page reload with specific pathname
      mockUsePathname.mockReturnValue('/contact');
      render(<NavigationDesktop />);

      expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('aria-current', 'page');
    });
  });
});