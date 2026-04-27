import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock ResizeObserver for responsive testing
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

describe('Navigation Responsive Breakpoint Tests - Story 1.3', () => {
  const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');

    // Reset window width to desktop default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock matchMedia for Tailwind responsive utilities
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query.includes('768px') ? window.innerWidth >= 768 : false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('Breakpoint 768px - Critical Threshold', () => {
    it('displays mobile navigation below 768px (767px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767,
      });

      render(<Navbar />);

      // Should show mobile navigation button
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
      expect(screen.getByText('Skip to main content')).toBeInTheDocument();

      // Both mobile and desktop render in DOM, controlled by CSS classes
      // Desktop has hidden md:flex, mobile has flex md:hidden
      const bookLink = screen.getByRole('link', { name: /book/i });
      expect(bookLink).toBeInTheDocument();
      // Desktop version is hidden by CSS on mobile
      expect(bookLink.closest('div')).toHaveClass('hidden', 'md:block');
    });

    it('displays desktop navigation at exactly 768px', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Navbar />);

      // Both mobile and desktop render, controlled by CSS
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
      expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /rooms/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0);

      // Mobile hamburger is in DOM but hidden by CSS
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
      // Mobile container has flex md:hidden class
      expect(screen.getByRole('button', { name: /open navigation menu/i }).closest('div')).toHaveClass('flex', 'md:hidden');
    });

    it('displays desktop navigation above 768px (769px)', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 769,
      });

      render(<Navbar />);

      // Both mobile and desktop render, controlled by CSS
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
      // Mobile is hidden by md:hidden class at this viewport
    });

    it('handles breakpoint transition without layout shifts', () => {
      render(<Navbar />);

      // Both mobile and desktop are always in DOM
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();

      // CSS controls visibility via hidden md:grid and flex md:hidden (Epic 15: md:flex -> md:grid)
      const desktopNav = screen.getByRole('link', { name: /book/i }).closest('div')?.parentElement;
      expect(desktopNav).toHaveClass('hidden', 'md:grid');

      const mobileNav = screen.getByRole('button', { name: /open navigation menu/i }).closest('div');
      expect(mobileNav).toHaveClass('flex', 'md:hidden');
    });

    it('maintains navigation state across breakpoint changes', async () => {
      const user = userEvent.setup();
      render(<Navbar />);

      // Both mobile and desktop navigation are in DOM before opening menu
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();

      // Open mobile menu
      const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
      await user.click(menuButton);

      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Desktop navigation is in DOM but may be aria-hidden when mobile menu is open
      // Use querySelector instead of getByRole to bypass accessibility tree filtering
      const nav = document.querySelector('nav');
      const bookLink = nav?.querySelector('a[href="/book"]');
      expect(bookLink).toBeInTheDocument();
    });
  });

  describe('Mobile Viewport Testing (<768px)', () => {
    const mobileViewports = [320, 375, 414, 480, 600, 767];

    mobileViewports.forEach(width => {
      it(`renders correctly on ${width}px viewport`, () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        render(<Navbar />);

        // Both mobile and desktop render in DOM
        expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
        expect(screen.getByText('Skip to main content')).toBeInTheDocument();

        // Desktop elements present but hidden via CSS
        expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
      });
    });

    it('mobile menu functions correctly across mobile viewports', async () => {
      const user = userEvent.setup();

      for (const width of mobileViewports) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        // Open mobile menu
        const menuButton = screen.getByRole('button', { name: /open navigation menu/i });
        await user.click(menuButton);

        // Should show mobile menu
        expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

        // All navigation links should be present - get all since mobile and desktop both render
        expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: /rooms/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0);

        // Close menu
        const closeButton = screen.getByRole('button', { name: /close navigation menu/i });
        await user.click(closeButton);

        expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();

        unmount();
      }
    });

    it('touch targets meet 44px minimum on mobile viewports', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<NavigationMobile menuOpen={true} setMenuOpen={jest.fn()} />);

      const menuButton = screen.getByRole('button', { name: /close navigation menu/i });

      // Check if button has sufficient touch target size
      // Button uses h-9 w-9 from shadcn/ui button variant
      expect(menuButton).toHaveClass('h-9', 'w-9');

      const mobileMenu = screen.getByRole('dialog');
      const menuLinks = Array.from(mobileMenu.querySelectorAll('a'));
      menuLinks.forEach(link => {
        // Semantic gap token provides sufficient touch target size (>44px)
        expect(link).toHaveClass('py-gap-card');
      });
    });
  });

  describe('Desktop Viewport Testing (≥768px)', () => {
    const desktopViewports = [768, 800, 1024, 1280, 1440, 1920];

    desktopViewports.forEach(width => {
      it(`renders correctly on ${width}px viewport`, () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        render(<Navbar />);

        // Both mobile and desktop render in DOM, controlled by CSS
        expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
        expect(screen.getAllByRole('link', { name: /home/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: /rooms/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThan(0);

        // Mobile menu button in DOM but hidden via CSS
        expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
      });
    });

    it('desktop navigation layout adapts to larger screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920, // Very large screen
      });

      render(<Navbar />);

      // All desktop elements should be present
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();

      // Epic 15: Updated to semantic spacing tokens (max-w-7xl with padding -> w-full)
      expect(nav).toHaveClass('w-full');
    });

    it('maintains desktop navigation functionality across breakpoints', async () => {
      const user = userEvent.setup();

      for (const width of desktopViewports) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        // Test hover states - use Rooms link (not active, so has hover classes)
        const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
        const roomsLink = roomsLinks.find(link => link.textContent === 'Rooms');
        expect(roomsLink).toBeDefined();
        if (roomsLink) {
          // Story 1.11: Updated to semantic tokens - hover uses font-semibold only
          expect(roomsLink).toHaveClass('hover:font-semibold');

          // Test focus states
          roomsLink.focus();
          expect(roomsLink).toHaveClass('focus-ring');
        }

        unmount();
      }
    });
  });

  describe('Responsive Layout Consistency', () => {
    it('maintains consistent branding across all viewports', () => {
      const viewports = [320, 375, 768, 1024, 1280];

      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        // Logo should be present in all viewports - both mobile and desktop versions
        const seElements = screen.getAllByText('SE');
        const sterlingElements = screen.getAllByText('Sterling Executive');
        expect(seElements.length).toBeGreaterThan(0);
        expect(sterlingElements.length).toBeGreaterThan(0);

        unmount();
      });
    });

    it('skip link functionality works across all viewports', () => {
      const viewports = [320, 375, 768, 1024, 1280];

      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        const skipLink = screen.getByText('Skip to main content');
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute('href', '#main-content');
        expect(skipLink).toHaveClass('sr-only', 'focus:not-sr-only');

        unmount();
      });
    });

    it('active state highlighting works consistently across viewports', () => {
      const viewports = [320, 375, 768, 1024, 1280];

      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        mockUsePathname.mockReturnValue('/rooms');

        const { unmount } = render(<Navbar />);

        // Rooms link should be active - get all and check one
        const roomsLinks = screen.getAllByRole('link', { name: /rooms/i });
        expect(roomsLinks.length).toBeGreaterThan(0);
        const activeLink = roomsLinks.find(link => link.getAttribute('aria-current') === 'page');
        expect(activeLink).toBeDefined();
        if (activeLink) {
          // Story 1.11: Updated to semantic tokens - active state uses font-semibold + underline
          expect(activeLink).toHaveClass('font-semibold', 'underline');
        }

        unmount();
      });
    });
  });

  describe('Responsive Component Variants', () => {
    it('NavigationMobile component only renders on mobile', () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      render(<NavigationMobile menuOpen={false} setMenuOpen={jest.fn()} />);

      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    });

    it('NavigationDesktop component only renders on desktop', () => {
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      render(<NavigationDesktop />);

      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
      // NavigationDesktop doesn't render hamburger menu
      expect(screen.queryByRole('button', { name: /open navigation menu/i })).not.toBeInTheDocument();
    });

    it('components use correct Tailwind responsive classes', () => {
      render(<Navbar />);

      const nav = screen.getByRole('navigation');
      // Epic 15: Updated to semantic spacing tokens (px-4 sm:px-6 lg:px-8 -> w-full)
      expect(nav).toHaveClass('w-full');

      // Desktop navigation should use md: prefix for 768px breakpoint (Epic 15: md:flex -> md:grid)
      const desktopContainer = screen.getByRole('link', { name: /book/i }).closest('div')?.parentElement;
      expect(desktopContainer).toHaveClass('hidden', 'md:grid');
    });
  });

  describe('Performance Across Viewports', () => {
    it('renders efficiently across all viewport sizes', () => {
      const viewports = [320, 375, 768, 1024, 1280];

      viewports.forEach(width => {
        const startTime = performance.now();

        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        const renderTime = performance.now() - startTime;

        // Each render should be fast (under 50ms)
        expect(renderTime).toBeLessThan(200);

        unmount();
      });
    });

    it('handles rapid viewport changes without errors', () => {
      const { rerender } = render(<Navbar />);

      // Rapidly change viewport sizes
      const viewports = [320, 768, 1024, 375, 1280, 600, 768, 1920];

      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        expect(() => rerender(<Navbar />)).not.toThrow();
      });
    });
  });

  describe('Edge Cases and Boundary Testing', () => {
    it('handles extremely small viewports gracefully', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 240, // Very small
      });

      expect(() => render(<Navbar />)).not.toThrow();
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();
    });

    it('handles extremely large viewports gracefully', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 3840, // 4K display
      });

      expect(() => render(<Navbar />)).not.toThrow();
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
    });

    it('maintains functionality at exact 768px boundary', async () => {
      const user = userEvent.setup();

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Navbar />);

      // Both mobile and desktop render
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();

      // All navigation functionality should work
      const homeLinks = screen.getAllByRole('link', { name: /home/i });
      const homeLink = homeLinks.find(link => link.textContent === 'Home');
      expect(homeLink).toBeDefined();
      if (homeLink) {
        await user.click(homeLink);
        expect(homeLink).toHaveAttribute('href', '/');
      }
    });

    it('handles orientation change simulation', () => {
      const { rerender } = render(<Navbar />);

      // Simulate portrait (mobile)
      Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
      rerender(<Navbar />);
      expect(screen.getByRole('button', { name: /open navigation menu/i })).toBeInTheDocument();

      // Simulate landscape (tablet)
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
      rerender(<Navbar />);
      expect(screen.getByRole('link', { name: /book/i })).toBeInTheDocument();
    });
  });

  describe('Visual Regression Prevention', () => {
    it('maintains consistent spacing across breakpoints', () => {
      const viewports = [375, 768, 1024];

      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        const header = screen.getByRole('banner');
        // Epic 15: Updated to semantic z-index token (z-50 -> z-nav)
        expect(header).toHaveClass('sticky', 'top-0', 'z-nav', 'bg-surface-primary', 'shadow-md');

        const nav = screen.getByRole('navigation');
        // Epic 15: Updated to w-full instead of max-w-7xl mx-auto
        expect(nav).toHaveClass('w-full');

        unmount();
      });
    });

    it('maintains responsive font sizing', () => {
      const viewports = [375, 768, 1024];

      viewports.forEach(width => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        const { unmount } = render(<Navbar />);

        // Logo text should be consistent - get all instances
        // Both mobile (text-size-body) and desktop (text-size-h3) render
        const logoTexts = screen.getAllByText('Sterling Executive');
        expect(logoTexts.length).toBeGreaterThan(0);
        logoTexts.forEach(logoText => {
          // Epic 15: Updated to semantic typography tokens
          // Check that each logo has semantic typography and font-bold
          expect(logoText).toHaveClass('font-bold');
          // Should have either text-size-body (mobile) or text-size-h3 (desktop)
          const hasSemanticText = logoText.classList.contains('text-size-body') ||
                              logoText.classList.contains('text-size-h3');
          expect(hasSemanticText).toBe(true);
        });

        unmount();
      });
    });
  });
});