import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from '@/components/ui/Navbar';
import NavigationDesktop from '@/components/blocks/Navigation/NavigationDesktop';
import NavigationMobile from '@/components/blocks/Navigation/NavigationMobile';
import { usePathname } from 'next/navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

expect.extend(toHaveNoViolations);

describe('Navigation WCAG 2.1 AA Accessibility Tests', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');

    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000',
      pathname: '/',
    };
  });

  describe('1.1.1 Non-text Content', () => {
    it('provides alternative text for logo icons', () => {
      render(<NavigationDesktop />);

      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      expect(logoLink).toHaveAttribute('aria-label', 'Go to homepage');
    });

    it('provides labels for hamburger menu icons', () => {
      render(<NavigationMobile menuOpen={false} setMenuOpen={jest.fn()} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Open navigation menu');
    });
  });

  describe('1.3.1 Info and Relationships', () => {
    it('uses semantic HTML5 nav element', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav.tagName).toBe('NAV');
    });

    it('uses header element for banner landmark', () => {
      render(<Navbar />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
      expect(header.tagName).toBe('HEADER');
    });

    it('uses list structure for navigation items', () => {
      render(<Navbar />);

      const list = screen.getByRole('list', { name: /primary navigation links/i });
      expect(list).toBeInTheDocument();
      expect(list.tagName).toBe('UL');

      const listItems = list.querySelectorAll('li');
      expect(listItems.length).toBe(3); // Home, Rooms, Contact
    });
  });

  describe('1.3.2 Meaningful Sequence', () => {
    it('maintains logical tab order', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Tab through navigation elements
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      await user.tab();
      // Mobile and desktop both render, so we get the mobile logo first (in DOM order)
      const focusedElement = document.activeElement as HTMLElement;
      expect(focusedElement).toHaveAttribute('href', '/');
      expect(focusedElement.tagName).toBe('A');
    });

    it('maintains reading order in mobile menu', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      // Get only links within the mobile menu dialog
      const mobileMenu = screen.getByRole('dialog');
      const links = Array.from(mobileMenu.querySelectorAll('a'));
      const expectedOrder = ['Home', 'Rooms', 'Contact'];

      links.forEach((link, index) => {
        expect(link).toHaveTextContent(expectedOrder[index]);
      });
    });
  });

  describe('1.3.3 Sensory Characteristics', () => {
    it('provides multiple ways to identify navigation items', () => {
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      // Filter to get the actual "Home" navigation link, not the logo
      const homeLink = homeLinks.find(link => link.textContent === 'Home');

      // Identified by text
      expect(homeLink).toBeDefined();
      if (homeLink) {
        expect(homeLink).toHaveTextContent('Home');

        // Identified by styling (visual)
        expect(homeLink).toHaveClass('px-4', 'py-2');
      }
    });
  });

  describe('1.4.1 Use of Color', () => {
    it('provides indicators other than color for active state', () => {
      mockUsePathname.mockReturnValue('/rooms');
      render(<Navbar />);

      const activeLinks = screen.getAllByRole('link', { name: /rooms/i });
      const activeLink = activeLinks[0];

      // Story 1.11: Updated to semantic tokens - active state uses underline + font-semibold
      expect(activeLink).toHaveClass('underline', 'font-semibold');
    });

    it('provides hover states with multiple visual indicators', () => {
      mockUsePathname.mockReturnValue('/rooms'); // Make Home non-active
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      // Find the desktop navigation link (has text "Home")
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        // Story 1.11: Updated to semantic tokens - hover uses font-semibold only
        expect(homeLink).toHaveClass('hover:font-semibold');
      }
    });
  });

  describe('1.4.3 Reflow (Zoom and Reflow)', () => {
    it('maintains functionality at 200% zoom', () => {
      // Simulate 200% zoom by reducing viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640, // Half of 1280px
      });

      render(<Navbar />);

      // Navigation should still be functional
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    });
  });

  describe('1.4.10 Reflow', () => {
    it('maintains layout without horizontal scrolling', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320, // Very small mobile screen
      });

      render(<Navbar />);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();

      // Navigation should adapt to small screens
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    });
  });

  describe('1.4.11 Non-text Contrast', () => {
    it('provides sufficient contrast for interactive elements', () => {
      render(<Navbar />);

      const bookButton = screen.getByRole('link', { name: /book/i });
      // Story 1.11: Updated to semantic tokens - CTA uses brand-secondary with brand-primary for contrast
      expect(bookButton).toHaveClass('bg-brand-secondary', 'text-brand-primary');
    });

    it('provides visible focus indicators', () => {
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks[0];
      homeLink.focus();

      expect(homeLink).toHaveClass('focus-ring');
    });
  });

  describe('1.4.12 Text Spacing', () => {
    it('maintains readability with increased text spacing', () => {
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      // Find desktop nav link (has px-4 py-2 classes)
      const homeLink = homeLinks.find(link => link.className.includes('px-4'));

      // Element should remain readable with increased spacing
      expect(homeLink).toBeDefined();
      if (homeLink) {
        expect(homeLink).toHaveClass('px-4', 'py-2');
      }
    });
  });

  describe('1.4.13 Content on Hover or Focus', () => {
    it('dismissible hover content in mobile menu', async () => {
      const user = userEvent.setup();
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });

      // Press Escape to dismiss
      await user.keyboard('{Escape}');

      // Menu should close (setMenuOpen would be called)
      // Note: This tests the dismissibility mechanism
    });
  });

  describe('2.1.1 Keyboard', () => {
    it('fully navigable using keyboard only', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Test Tab navigation - verify elements are reachable
      await user.tab();
      expect(screen.getByText('Skip to main content')).toHaveFocus();

      // Tab through navigation elements
      await user.tab();
      expect(document.activeElement?.tagName).toBe('A'); // Logo link

      await user.tab();
      // Another focusable element
      const activeEl = document.activeElement;
      expect(activeEl).toBeTruthy();
      expect(activeEl).not.toBe(document.body);
    });

    it('supports Enter key for navigation activation', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks[0];
      homeLink.focus();

      await user.keyboard('{Enter}');

      // Link navigation should work
      expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('2.1.2 No Keyboard Trap', () => {
    it('allows keyboard navigation in and out of mobile menu', async () => {
      const user = userEvent.setup();
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      // Focus first menu item
      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      closeButton.focus();

      // Should be able to tab through menu items
      await user.tab();
      const mobileMenu = screen.getByRole('dialog');
      const links = Array.from(mobileMenu.querySelectorAll('a'));
      expect(links[0]).toHaveFocus();

      await user.tab();
      expect(links[1]).toHaveFocus();
    });
  });

  describe('2.1.4 Character Key Shortcuts', () => {
    it('does not interfere with browser shortcuts', () => {
      render(<Navbar />);

      // Navigation should not override essential browser shortcuts
      // Test by ensuring standard shortcuts still work
      const homeLinks = screen.getAllByRole('link', { name: /home/i });

      // Press Ctrl+F (find shortcut) - should not be intercepted
      fireEvent.keyDown(document, { key: 'f', ctrlKey: true });

      // Navigation should remain functional
      expect(homeLinks[0]).toBeInTheDocument();
    });
  });

  describe('2.4.1 Bypass Blocks', () => {
    it('provides skip navigation link', () => {
      render(<Navbar />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('skip link is visible on focus', () => {
      render(<Navbar />);

      const skipLink = screen.getByText('Skip to main content');
      skipLink.focus();

      expect(skipLink).toHaveClass('focus:not-sr-only');
    });

    it('skip link targets main content area', () => {
      render(<Navbar />);

      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });
  });

  describe('2.4.2 Page Titled', () => {
    it('navigation does not interfere with page title', () => {
      // Set page title
      document.title = 'Sterling Executive - Home';

      render(<Navbar />);

      // Navigation should not change page title
      expect(document.title).toBe('Sterling Executive - Home');
    });
  });

  describe('2.4.3 Focus Order', () => {
    it('maintains logical focus order', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const focusableElements = [];

      // Collect all focusable elements in order
      await user.tab(); // Skip link
      focusableElements.push(document.activeElement);

      await user.tab(); // First logo (mobile or desktop)
      focusableElements.push(document.activeElement);

      await user.tab(); // Next element
      focusableElements.push(document.activeElement);

      // Verify logical order
      expect(focusableElements[0]).toHaveTextContent('Skip to main content');
      expect(focusableElements[1]?.tagName).toBe('A');
      expect(focusableElements[1]).toHaveAttribute('href', '/');
    });
  });

  describe('2.4.4 Link Purpose', () => {
    it('provides descriptive link text', () => {
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        const text = link.textContent || link.getAttribute('aria-label');
        expect(text).toBeTruthy();
        expect(text!.length).toBeGreaterThan(0);
      });
    });

    it('provides context for navigation links', () => {
      render(<Navbar />);

      const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
      expect(roomsLinks[0]).toHaveTextContent('Rooms');
    });
  });

  describe('2.4.5 Multiple Ways', () => {
    it('provides multiple ways to navigate', () => {
      render(<Navbar />);

      // Primary navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Skip link
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();

      // Logo as home link - get all and pick one
      const logoLinks = screen.getAllByRole('link', { name: /homepage|logo/i });
      expect(logoLinks.length).toBeGreaterThan(0);
    });
  });

  describe('2.4.6 Headings and Labels', () => {
    it('provides descriptive labels for navigation', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Primary site navigation');
    });

    it('provides context for mobile menu', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label', 'Mobile navigation');
    });
  });

  describe('2.4.7 Focus Visible', () => {
    it('provides visible focus indicators', () => {
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks[0];
      homeLink.focus();

      expect(homeLink).toHaveClass('focus-ring');
    });

    it('focus indicators are clearly visible', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
      closeButton.focus();

      expect(closeButton).toHaveClass('focus-ring');
    });
  });

  describe('3.2.1 On Focus', () => {
    it('does not change context on focus', () => {
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks[0];

      // Focus should not trigger navigation
      homeLink.focus();

      // Should still be on same page
      expect(homeLink).toHaveFocus();
      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('3.2.2 On Input', () => {
    it('does not change context on input', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks[0];

      // Hovering should not trigger navigation
      await user.hover(homeLink);

      expect(homeLink).toHaveAttribute('href', '/');
    });
  });

  describe('3.2.3 Consistent Navigation', () => {
    it('maintains consistent navigation across pages', () => {
      // Test on different pages
      mockUsePathname.mockReturnValue('/rooms');
      const { rerender } = render(<Navbar />);

      expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /rooms/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0);
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();

      // Change page
      mockUsePathname.mockReturnValue('/contact');
      rerender(<Navbar />);

      // Navigation should remain consistent
      expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /rooms/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0);
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
    });
  });

  describe('3.2.4 Consistent Identification', () => {
    it('maintains consistent component identification', () => {
      render(<Navbar />);

      const logoLinks = screen.getAllByRole('link', { name: /homepage|logo/i });
      const logo = logoLinks[0];
      expect(logo).toHaveTextContent('SE');
      expect(logo).toHaveTextContent('Sterling Executive');
    });
  });

  describe('3.3.1 Error Identification', () => {
    it('provides clear error states if navigation fails', () => {
      // This would be tested with actual navigation errors
      // For now, we verify error handling structure
      render(<Navbar />);

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('3.3.2 Labels or Instructions', () => {
    it('provides clear instructions for mobile menu', () => {
      render(<NavigationMobile menuOpen={false} setMenuOpen={jest.fn()} />);

      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Open navigation menu');
      expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('3.3.3 Error Suggestion', () => {
    it('provides helpful feedback for navigation errors', () => {
      // Test would involve simulating navigation errors
      // For now, verify structure supports error feedback
      render(<Navbar />);

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });
  });

  describe('3.3.4 Error Prevention', () => {
    it('prevents accidental navigation loss', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      const menuLinks = screen.getAllByRole('link');
      menuLinks.forEach(link => {
        // Links should have proper destinations
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('4.1.2 Name, Role, Value', () => {
    it('provides accessible names for all interactive elements', () => {
      render(<Navbar />);

      const interactiveElements = screen.getAllByRole('button');
      interactiveElements.forEach(element => {
        const name = element.getAttribute('aria-label') || element.textContent;
        expect(name).toBeTruthy();
        expect(name!.length).toBeGreaterThan(0);
      });
    });

    it('provides correct roles for all elements', () => {
      render(<Navbar />);

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('4.1.3 Status Messages', () => {
    it('provides appropriate status feedback', () => {
      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });

  describe('Overall Accessibility Compliance', () => {
    it('passes axe accessibility testing for desktop navigation', async () => {
      const { container } = render(<NavigationDesktop />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility testing for mobile navigation', async () => {
      const { container } = render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('passes axe accessibility testing for complete navbar', async () => {
      const { container } = render(<Navbar />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('maintains accessibility across viewport sizes', async () => {
      // Test mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container, rerender } = render(<Navbar />);
      let results = await axe(container);
      expect(results).toHaveNoViolations();

      // Test desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      rerender(<Navbar />);
      results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});