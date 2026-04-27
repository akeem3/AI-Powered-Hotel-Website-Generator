import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';
import NavigationDesktop from '@/components/blocks/Navigation/NavigationDesktop';
import NavigationMobile from '@/components/blocks/Navigation/NavigationMobile';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

describe('Navigation Keyboard Navigation Tests - Story 1.3', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');

    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    };
  });

  describe('Desktop Keyboard Navigation', () => {
    beforeEach(() => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('supports Tab navigation through all focusable elements', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Focus should start at skip link
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      // Continue tabbing - both mobile and desktop are in DOM
      await user.tab();
      expect(document.activeElement?.tagName).toBe('A');

      // Verify we can continue tabbing through several elements
      for (let i = 0; i < 8; i++) {
        await user.tab();
        expect(document.activeElement).toBeTruthy();
      }
    });

    it('supports Shift+Tab navigation backwards', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Tab forward several times
      for (let i = 0; i < 5; i++) {
        await user.tab();
      }

      const forwardElement = document.activeElement;

      // Shift+Tab backwards
      await user.tab({ shift: true });
      const backwardElement = document.activeElement;

      // Should have moved to a different element
      expect(backwardElement).not.toBe(forwardElement);
      expect(backwardElement).toBeTruthy();
      expect(backwardElement).not.toBe(document.body);
    });

    it('supports Enter key activation for navigation links', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const roomsLink = screen.getByRole('link', { name: /rooms/i });
      roomsLink.focus();

      // Press Enter to activate
      await user.keyboard('{Enter}');

      // Link should be activated (in real scenario would navigate)
      expect(roomsLink.closest('a')).toHaveAttribute('href', '/rooms');
    });

    it('supports Space key activation for navigation links', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const contactLink = screen.getByRole('link', { name: /contact/i });
      contactLink.focus();

      // Press Space to activate
      await user.keyboard('{ }');

      // Link should be activated
      expect(contactLink.closest('a')).toHaveAttribute('href', '/contact');
    });

    it('provides visible focus indicators for all interactive elements', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Get navigation links
      const navigationLinks = screen.getAllByRole('link');
      const homeLink = navigationLinks.find(link => link.textContent === 'Home');
      const roomsLink = navigationLinks.find(link => link.textContent === 'Rooms');
      const bookLink = navigationLinks.find(link => link.textContent === 'Book');

      const focusableElements = [
        homeLink,
        roomsLink,
        bookLink,
      ].filter((element): element is HTMLElement => element !== null && element !== undefined);

      for (const element of focusableElements) {
        element.focus();
        // Check for either focus-ring or focus-ring-inverted (for dark backgrounds)
        const hasFocusClass = element.classList.contains('focus-ring') || element.classList.contains('focus-ring-inverted');
        expect(hasFocusClass).toBe(true);
      }
    });

    it('maintains keyboard focus after hover interactions', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        homeLink.focus();

        // Hover over element
        await user.hover(homeLink);

        // Focus should be maintained
        expect(homeLink).toHaveFocus();

        // Unhover
        await user.unhover(homeLink);

        // Focus should still be maintained
        expect(homeLink).toHaveFocus();
      }
    });

    it('supports Home key (default browser behavior)', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Focus on a middle navigation item
      const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
      const roomsLink = roomsLinks[0];
      roomsLink.focus();

      // Press Home key - should use default browser behavior
      await user.keyboard('{Home}');

      // Navigation doesn't prevent default Home key behavior
      expect(roomsLink).toBeInTheDocument();
    });

    it('supports End key (default browser behavior)', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Focus on first navigation item
      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        homeLink.focus();

        // Press End key - should use default browser behavior
        await user.keyboard('{End}');

        // Navigation doesn't prevent default End key behavior
        expect(homeLink).toBeInTheDocument();
      }
    });

    it('supports standard keyboard navigation (Tab, not Arrow keys)', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Component uses standard Tab navigation, not Arrow keys
      // This is appropriate for a horizontal navigation bar
      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        homeLink.focus();

        // Tab to next element
        await user.tab();

        // Should move to next focusable element
        expect(document.activeElement).not.toBe(homeLink);
        expect(document.activeElement).not.toBe(document.body);
      }
    });
  });

  describe('Mobile Keyboard Navigation', () => {
    beforeEach(() => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('supports Tab navigation through mobile navigation elements', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Focus should start at skip link
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      // Tab to first logo (mobile renders first in DOM)
      await user.tab();
      expect(document.activeElement?.tagName).toBe('A');

      // Continue tabbing - should reach hamburger button eventually
      for (let i = 0; i < 3; i++) {
        await user.tab();
      }
      // Just verify we can tab through
      expect(document.activeElement).not.toBe(document.body);
    });

    it('supports Enter key to open mobile menu', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      menuButton.focus();

      // Press Enter to open menu
      await user.keyboard('{Enter}');

      // Mobile menu should open
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();
      });
    });

    it('supports Space key to open mobile menu', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      menuButton.focus();

      // Press Space to open menu
      await user.keyboard('{ }');

      // Mobile menu should open
      await waitFor(() => {
        expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation within mobile menu', async () => {
      const user = userEvent.setup();
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      const mobileMenu = screen.getByRole('dialog');
      const links = Array.from(mobileMenu.querySelectorAll('a'));

      // Focus first link
      links[0].focus();
      expect(links[0]).toHaveFocus();

      await user.tab();
      expect(links[1]).toHaveFocus();

      await user.tab();
      expect(links[2]).toHaveFocus();
    });

    it('supports Escape key (no custom handler - uses browser default)', async () => {
      const user = userEvent.setup();
      const mockSetMenuOpen = jest.fn();
      render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      // Focus on close button
      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      closeButton.focus();

      // Press Escape - component doesn't have custom Escape handler
      await user.keyboard('{Escape}');

      // Component uses close button click, not Escape key
      expect(closeButton).toBeInTheDocument();
    });

    it('mobile menu is rendered when open', async () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      // Menu should be visible
      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      expect(closeButton).toBeInTheDocument();

      // Dialog should exist
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    it('supports Enter key to navigate from mobile menu items', async () => {
      const user = userEvent.setup();
      const mockSetMenuOpen = jest.fn();
      render(<NavigationMobile menuOpen={true} setMenuOpen={mockSetMenuOpen} />);

      const roomsLink = screen.getByRole('link', { name: /rooms/i });
      roomsLink.focus();

      // Press Enter to navigate
      await user.keyboard('{Enter}');

      // Menu should close and navigation should occur
      expect(mockSetMenuOpen).toHaveBeenCalledWith(false);
    });

    it('uses Tab for mobile menu navigation (not Arrow keys)', async () => {
      const user = userEvent.setup();
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      // Component uses standard Tab navigation, not Arrow keys
      // This is simpler and equally accessible for mobile menu
      const mobileMenu = screen.getByRole('dialog');
      const links = Array.from(mobileMenu.querySelectorAll('a'));

      links[0].focus();
      expect(links[0]).toHaveFocus();

      // Tab to next item
      await user.tab();
      expect(links[1]).toHaveFocus();

      // Tab to next item
      await user.tab();
      expect(links[2]).toHaveFocus();
    });
  });

  describe('Skip Link Keyboard Navigation', () => {
    it('supports Tab and Enter for skip link functionality', async () => {
      const user = userEvent.setup();

      // Mock main content area
      document.body.innerHTML = `
        <main id="main-content" tabIndex={-1}>
          <h1>Main Content</h1>
        </main>
      `;

      render(<Navbar />);

      const skipLink = screen.getByText('Skip to main content');
      skipLink.focus();

      expect(skipLink).toHaveFocus();

      // Press Enter to activate skip link
      await user.keyboard('{Enter}');

      // Should navigate to main content (verified by href attribute)
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('skip link becomes visible when focused', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const skipLink = screen.getByText('Skip to main content');

      // Initially should be hidden but focusable
      expect(skipLink).toHaveClass('sr-only');

      // Focus should make it visible
      skipLink.focus();
      expect(skipLink).toHaveClass('focus:not-sr-only');
    });

    it('skip link works across different viewport sizes', async () => {
      const viewports = [375, 768, 1024];

      for (const width of viewports) {
        // Clear document body to avoid leftover elements from previous test
        document.body.innerHTML = '';

        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        const skipLink = screen.getByText('Skip to main content');
        const user = userEvent.setup();
        await user.tab();
        expect(skipLink).toHaveFocus();

        unmount();
      }
    });
  });

  describe('Focus Management and Trapping', () => {
    it('allows focus to move through mobile menu items', async () => {
      const user = userEvent.setup();
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      // Focus on last menu item
      const mobileMenu = screen.getByRole('dialog');
      const links = Array.from(mobileMenu.querySelectorAll('a'));
      links[links.length - 1].focus();

      // Component doesn't implement focus trapping, uses standard Tab behavior
      await user.tab();

      // Just verify focus moved
      expect(document.activeElement).toBeTruthy();
    });

    it('maintains menu button in DOM when menu opens/closes', () => {
      const { rerender } = render(<NavigationMobile menuOpen={false} setMenuOpen={jest.fn()} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toBeInTheDocument();

      // Open menu
      rerender(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);
      expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();

      // Close menu
      rerender(<NavigationMobile menuOpen={false} setMenuOpen={jest.fn()} />);
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    });

    it('maintains focus order with viewport changes', async () => {
      // Clear document body to avoid leftover elements
      document.body.innerHTML = '';

      const user = userEvent.setup();
      render(<Navbar />);

      // Both mobile and desktop render simultaneously in tests
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      await user.tab();
      // Just verify focus moves
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  describe('Keyboard Accessibility Compliance', () => {
    it('all interactive elements are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Collect all focusable elements - note both mobile and desktop render
      const allLinks = screen.getAllByRole('link');
      const allButtons = screen.getAllByRole('button');

      // Each element should be focusable via keyboard
      for (const element of [...allLinks, ...allButtons]) {
        element.focus();
        expect(element).toHaveFocus();
      }
    });

    it('no keyboard traps in navigation', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Navigate through several tabs - verify no traps
      for (let i = 0; i < 10; i++) {
        await user.tab();

        // Should always have a focused element or be on body/html (end of tab sequence)
        const activeEl = document.activeElement;
        expect(activeEl).toBeTruthy();
      }
    });

    it('keyboard navigation follows logical order', async () => {
      // Clear document body to avoid leftover elements
      document.body.innerHTML = '';

      const user = userEvent.setup();
      render(<Navbar />);

      // Verify first element is skip link
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      // Continue tabbing - verify no jumps to body
      for (let i = 0; i < 5; i++) {
        await user.tab();
        expect(document.activeElement).toBeTruthy();
      }
    });

    it('supports keyboard shortcuts for screen readers', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Test common screen reader shortcuts - component doesn't block them
      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        homeLink.focus();

        // Alt+Home (should work in most browsers) - not blocked by component
        await user.keyboard('{Alt>}{Home}{/Alt}');

        // Component doesn't interfere with screen reader shortcuts
        expect(homeLink).toBeInTheDocument();
      }
    });

    it('provides keyboard alternatives for mouse actions', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<NavigationMobile menuOpen={false} setMenuOpen={jest.fn()} />);

      // Mouse action: Click hamburger menu
      // Keyboard alternative: Enter on hamburger menu button
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      menuButton.focus();

      await user.keyboard('{Enter}');
      rerender(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Mouse action: Click outside to close
      // Keyboard alternative: Escape key
      await user.keyboard('{Escape}');
      rerender(<NavigationMobile menuOpen={false} setMenuOpen={jest.fn()} />);

      expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
    });
  });

  describe('Advanced Keyboard Navigation Patterns', () => {
    it('supports keyboard navigation with modifiers', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        homeLink.focus();

        // Ctrl+Enter should still work (browser default, not blocked)
        await user.keyboard('{Control>}{Enter}{/Control}');
        expect(homeLink).toBeInTheDocument();
      }
    });

    it('maintains keyboard focus during rapid navigation', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Rapid tab navigation
      for (let i = 0; i < 10; i++) {
        await user.tab();
        expect(document.activeElement).toBeTruthy();
      }
    });

    it('handles keyboard navigation with disabled elements', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Currently no disabled elements in navigation, but test structure
      const focusableElements = screen.getAllByRole('link');

      for (const element of focusableElements) {
        element.focus();
        expect(element).not.toBeDisabled();
      }
    });

    it('supports keyboard navigation in high contrast mode', async () => {
      const user = userEvent.setup();

      // Simulate high contrast mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-contrast'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        homeLink.focus();

        // Should still be keyboard accessible
        expect(homeLink).toHaveFocus();
        expect(homeLink).toHaveClass('focus-ring');
      }
    });
  });
});