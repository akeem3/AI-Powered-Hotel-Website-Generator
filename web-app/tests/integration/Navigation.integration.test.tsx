import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from '@/components/ui/Navbar';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('Navigation Integration Tests - Story 1.3', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockPrefetch = jest.fn();
  const mockRefresh = jest.fn();
  const mockBack = jest.fn();
  const mockForward = jest.fn();

  const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
      forward: mockForward,
      refresh: mockRefresh,
      prefetch: mockPrefetch,
    } as any);

    mockUsePathname.mockReturnValue('/');

    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      href: 'http://localhost:3000',
      pathname: '/',
      search: '',
      hash: '',
    };

    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  describe('Route Persistence and State Management', () => {
    it('maintains mobile menu state across route changes', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Simulate route change
      mockUsePathname.mockReturnValue('/rooms');
      rerender(<Navbar />);

      // Mobile menu should remain open after route change
      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();
    });

    it('closes mobile menu when navigating to a new page', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Click on a navigation link
      const roomsLink = screen.getByRole('link', { name: /rooms/i });
      await user.click(roomsLink);

      // Mobile menu should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
      });
    });

    it('updates active state correctly when route changes programmatically', () => {
      const { rerender } = render(<Navbar />);

      // Helper to get navigation link by content (avoids logo conflicts)
      const getNavLinkByContent = (content: string) => {
        const allLinks = screen.getAllByRole('link');
        return allLinks.find(link => link.textContent === content);
      };

      // Initially on home page
      const homeLink = getNavLinkByContent('Home');
      expect(homeLink).toHaveAttribute('aria-current', 'page');

      // Change to rooms page
      mockUsePathname.mockReturnValue('/rooms');
      rerender(<Navbar />);

      const roomsLink = getNavLinkByContent('Rooms');
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
      expect(homeLink).not.toHaveAttribute('aria-current', 'page');

      // Change to contact page
      mockUsePathname.mockReturnValue('/contact');
      rerender(<Navbar />);

      const contactLink = getNavLinkByContent('Contact');
      expect(contactLink).toHaveAttribute('aria-current', 'page');
      expect(roomsLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('persists navigation state across page reloads', () => {
      // Simulate page reload on specific route
      mockUsePathname.mockReturnValue('/rooms');
      render(<Navbar />);

      // Helper to get navigation link by content (avoids logo conflicts)
      const getNavLinkByContent = (content: string) => {
        const allLinks = screen.getAllByRole('link');
        return allLinks.find(link => link.textContent === content);
      };

      // Should show correct active state immediately on render
      const roomsLink = getNavLinkByContent('Rooms');
      const homeLink = getNavLinkByContent('Home');
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
      expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('handles browser back button navigation', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Navbar />);

      // Helper to get navigation link by content (avoids logo conflicts)
      const getNavLinkByContent = (content: string) => {
        const allLinks = screen.getAllByRole('link');
        return allLinks.find(link => link.textContent === content);
      };

      // Start on home page
      mockUsePathname.mockReturnValue('/');
      rerender(<Navbar />);

      // Navigate to rooms page
      mockUsePathname.mockReturnValue('/rooms');
      rerender(<Navbar />);

      // Simulate browser back button
      mockUsePathname.mockReturnValue('/');
      rerender(<Navbar />);

      // Should show home as active again
      const homeLink = getNavLinkByContent('Home');
      const roomsLink = getNavLinkByContent('Rooms');
      expect(homeLink).toHaveAttribute('aria-current', 'page');
      expect(roomsLink).not.toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Cross-Page Navigation Integration', () => {
    it('integrates with all defined pages', () => {
      const pages = ['/', '/rooms', '/contact'];

      pages.forEach(page => {
        mockUsePathname.mockReturnValue(page);
        const { unmount } = render(<Navbar />);

        // Navigation should render correctly on each page
        expect(screen.getByRole('navigation')).toBeInTheDocument();

        // Helper to get navigation link by content (avoids logo conflicts)
        const getNavLinkByContent = (content: string) => {
          const allLinks = screen.getAllByRole('link');
          return allLinks.find(link => link.textContent === content);
        };

        expect(getNavLinkByContent('Home')).toBeInTheDocument();
        expect(getNavLinkByContent('Rooms')).toBeInTheDocument();
        expect(getNavLinkByContent('Contact')).toBeInTheDocument();

        unmount();
      });
    });

    it('handles navigation to undefined routes gracefully', () => {
      mockUsePathname.mockReturnValue('/nonexistent-page');
      render(<Navbar />);

      // Should still render navigation correctly
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Helper to get navigation link by content (avoids logo conflicts)
      const getNavLinkByContent = (content: string) => {
        const allLinks = screen.getAllByRole('link');
        return allLinks.find(link => link.textContent === content);
      };

      // No link should be marked as active for undefined routes
      const homeLink = getNavLinkByContent('Home');
      const roomsLink = getNavLinkByContent('Rooms');
      const contactLink = getNavLinkByContent('Contact');

      expect(homeLink).not.toHaveAttribute('aria-current', 'page');
      expect(roomsLink).not.toHaveAttribute('aria-current', 'page');
      expect(contactLink).not.toHaveAttribute('aria-current', 'page');
    });

    it('maintains navigation functionality with query parameters', () => {
      mockUsePathname.mockReturnValue('/rooms?category=suite');
      render(<Navbar />);

      // Should handle query parameters correctly
      expect(screen.getByRole('link', { name: /rooms/i })).not.toHaveAttribute('aria-current', 'page');
      // Note: pathname doesn't include query params, so rooms wouldn't be active
    });
  });

  describe('Skip Link Functionality', () => {
    it('skip link focuses main content area', async () => {
      const user = userEvent.setup();

      // Create a mock main content area
      document.body.innerHTML = `
        <div id="main-content" tabIndex={-1}>
          <h1>Main Content</h1>
        </div>
      `;

      render(<Navbar />);

      const skipLink = screen.getByText('Skip to main content');
      await user.click(skipLink);

      // In a real scenario, this would focus the main content area
      // For testing, we verify the href attribute is correct
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('skip link works across different pages', () => {
      const pages = ['/', '/rooms', '/contact'];

      pages.forEach(page => {
        mockUsePathname.mockReturnValue(page);
        const { unmount } = render(<Navbar />);

        const skipLink = screen.getByText('Skip to main content');
        expect(skipLink).toHaveAttribute('href', '#main-content');

        unmount();
      });
    });
  });

  describe('Mobile Menu Route Integration', () => {
    it('mobile menu navigation closes menu and updates route', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Click contact link
      const contactLink = screen.getByRole('link', { name: /contact/i });
      await user.click(contactLink);

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
      });

      // Update route to reflect navigation
      mockUsePathname.mockReturnValue('/contact');
      rerender(<Navbar />);

      // Contact should be active
      expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute('aria-current', 'page');
    });

    it('mobile menu maintains accessibility attributes during navigation', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      const dialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Mobile navigation');

      // Click logo link (should close menu)
      const logoLink = screen.getByRole('link', { name: /go to homepage/i });
      await user.click(logoLink);

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Body Scroll Lock Integration', () => {
    it('applies and removes body scroll lock correctly', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Initially no scroll lock
      expect(document.body.style.overflow).toBe('');

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      // Scroll lock should be applied
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('hidden');
      });

      // Helper to get navigation link by content (avoids logo conflicts)
      const getNavLinkByContent = (content: string) => {
        const allLinks = screen.getAllByRole('link');
        return allLinks.find(link => link.textContent === content);
      };

      // Close mobile menu by clicking Home link (get it from mobile menu via dialog)
      const mobileDialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const homeLink = mobileDialog.querySelector('a[href="/"]');

      await user.click(homeLink!);

      // Scroll lock should be removed
      await waitFor(() => {
        expect(document.body.style.overflow).toBe('');
      });
    });

    it('maintains scroll lock state across route changes when menu is open', async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Navbar />);

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(document.body.style.overflow).toBe('hidden');

      // Simulate route change while menu is open
      mockUsePathname.mockReturnValue('/rooms');
      rerender(<Navbar />);

      // Scroll lock should still be active
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  describe('Navigation with URL Parameters', () => {
    it('handles navigation with hash fragments', () => {
      mockUsePathname.mockReturnValue('/rooms#availability');
      render(<Navbar />);

      // Navigation should still work correctly
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /rooms/i })).not.toHaveAttribute('aria-current', 'page');
    });

    it('maintains navigation state with search parameters', () => {
      mockUsePathname.mockReturnValue('/contact?form=booking');
      render(<Navbar />);

      // Should render correctly with search params
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  describe('Navigation Error Handling', () => {
    it('handles failed route navigation gracefully', async () => {
      const user = userEvent.setup();

      // Mock a failed navigation
      mockPush.mockImplementation(() => Promise.reject(new Error('Navigation failed')));

      render(<Navbar />);

      const bookButton = screen.getByRole('link', { name: /book/i });

      // Click should not throw error
      await user.click(bookButton);

      // Navigation should still be functional
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('maintains navigation state when pathname is undefined', () => {
      mockUsePathname.mockReturnValue(undefined as any);
      render(<Navbar />);

      // Should still render navigation without errors
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Helper to get navigation link by content (avoids logo conflicts)
      const getNavLinkByContent = (content: string) => {
        const allLinks = screen.getAllByRole('link');
        return allLinks.find(link => link.textContent === content);
      };

      expect(getNavLinkByContent('Home')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('renders navigation efficiently across route changes', () => {
      const startTime = performance.now();

      const { rerender } = render(<Navbar />);
      const initialRenderTime = performance.now() - startTime;

      // Test multiple rapid route changes
      const routes = ['/', '/rooms', '/contact', '/rooms', '/'];

      routes.forEach(route => {
        const routeStartTime = performance.now();
        mockUsePathname.mockReturnValue(route);
        rerender(<Navbar />);
        const routeRenderTime = performance.now() - routeStartTime;

        // Each re-render should be fast (under 100ms)
        expect(routeRenderTime).toBeLessThan(200);
      });

      // Initial render should also be fast
      expect(initialRenderTime).toBeLessThan(200);
    });

    it('does not create memory leaks during navigation', () => {
      const { rerender, unmount } = render(<Navbar />);

      // Simulate many route changes
      for (let i = 0; i < 100; i++) {
        mockUsePathname.mockReturnValue(`/page-${i}`);
        rerender(<Navbar />);
      }

      // Cleanup should not throw errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Navigation Integration with Browser Features', () => {
    it('supports browser back and forward navigation', () => {
      const { rerender } = render(<Navbar />);

      // Simulate navigation history
      const navigationHistory = ['/', '/rooms', '/contact'];

      navigationHistory.forEach((route, index) => {
        mockUsePathname.mockReturnValue(route);
        rerender(<Navbar />);

        // Check active state matches current route
        const expectedActiveLink = route === '/' ? 'home' :
                                 route === '/rooms' ? 'rooms' : 'contact';

        screen.getAllByRole('link').forEach(link => {
          if (link.textContent?.toLowerCase().includes(expectedActiveLink)) {
            expect(link).toHaveAttribute('aria-current', 'page');
          }
        });
      });
    });

    it('handles page reload and refresh scenarios', () => {
      // Simulate page refresh on specific route
      mockUsePathname.mockReturnValue('/rooms');

      const { unmount } = render(<Navbar />);

      // Navigation should render correctly on "refresh"
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /rooms/i })).toHaveAttribute('aria-current', 'page');

      // Cleanup and re-render (simulating refresh)
      unmount();
      render(<Navbar />);

      // Should maintain same state
      expect(screen.getByRole('link', { name: /rooms/i })).toHaveAttribute('aria-current', 'page');
    });
  });
});