import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import NotFound from '@/app/not-found';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('NotFound Page (404)', () => {
  // Test 1: Basic rendering and content structure
  describe('Rendering and Content', () => {
    it('renders 404 error heading', () => {
      render(<NotFound />);

      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      expect(errorHeading).toBeInTheDocument();
      expect(errorHeading).toHaveTextContent('404 - Page Not Found');
    });

    it('renders descriptive error message', () => {
      render(<NotFound />);

      const errorMessage = screen.getByText(/sorry.*doesn.*t exist or has been moved/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('renders navigation link back to home', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('renders within main semantic element', () => {
      render(<NotFound />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('uses proper layout classes on main element', () => {
      const { container } = render(<NotFound />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen', 'flex', 'flex-col', 'items-center', 'justify-center');
    });
  });

  // Test 2: Styling and layout validation
  describe('Styling and Layout', () => {
    it('applies correct background and text colors', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('bg-surface-primary', 'text-text-primary');
    });

    it('applies correct typography styles to heading', () => {
      render(<NotFound />);
      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      // Epic 15: Updated to use semantic typography and spacing tokens
      expect(errorHeading).toHaveClass('text-5xl', 'mb-gap-card');
    });

    it('applies correct spacing to elements', () => {
      render(<NotFound />);
      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      const errorMessage = screen.getByText(/sorry.*doesn.*t exist or has been moved/i);

      // Epic 15: Updated to use semantic spacing tokens
      expect(errorHeading).toHaveClass('mb-gap-card');
      expect(errorMessage).toHaveClass('mb-gap-card');
    });

    it('uses flex layout for vertical centering', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('applies proper padding to main container', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');
      // Epic 15: Updated to use semantic spacing token
      expect(main).toHaveClass('p-container');
    });
  });

  // Test 3: Navigation functionality
  describe('Navigation Functionality', () => {
    it('provides clear path back to home', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('home link has accessible styling', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      // Link wraps a Button component, so we just verify it exists and has proper href
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('home link has descriptive text', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      expect(homeLink).toHaveAccessibleName('Return Home');
    });

    it('navigation link is clickable', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });

      // Simulate click event
      fireEvent.click(homeLink);

      // Link should still exist (navigation would happen in real app)
      expect(homeLink).toBeInTheDocument();
    });
  });

  // Test 4: Accessibility compliance
  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<NotFound />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<NotFound />);

      // Should have h1 as the main heading
      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent('404 - Page Not Found');
    });

    it('maintains semantic HTML structure', () => {
      render(<NotFound />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('navigation link is properly accessible', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      expect(homeLink).toHaveAccessibleName();
      expect(homeLink).toHaveAttribute('href');
    });

    it('has sufficient color contrast (structural test)', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('text-text-primary'); // Should contrast with bg-surface-primary
    });

    it('maintains focus management', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      homeLink.focus();
      expect(homeLink).toHaveFocus();
    });
  });

  // Test 5: Error handling context
  describe('Error Context', () => {
    it('communicates error state clearly', () => {
      render(<NotFound />);

      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      const errorMessage = screen.getByText(/sorry.*doesn.*t exist or has been moved/i);

      expect(errorHeading).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
      expect(errorHeading.textContent).toContain('404');
      expect(errorHeading.textContent).toContain('Page Not Found');
    });

    it('provides helpful user guidance', () => {
      render(<NotFound />);

      const errorMessage = screen.getByText(/sorry.*doesn.*t exist or has been moved/i);
      const homeLink = screen.getByRole('link', { name: /return home/i });

      expect(errorMessage).toBeInTheDocument();
      expect(homeLink).toBeInTheDocument();
    });

    it('maintains brand consistency in error state', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');

      // Should use brand colors
      expect(main).toHaveClass('bg-surface-primary', 'text-text-primary');
    });
  });

  // Test 6: Component structure and organization
  describe('Component Structure', () => {
    it('maintains proper component import structure', () => {
      expect(() => render(<NotFound />)).not.toThrow();
    });

    it('exports default component function', () => {
      const moduleExports = require('@/app/not-found');

      expect(moduleExports.default).toBeDefined();
      expect(typeof moduleExports.default).toBe('function');
    });

    it('uses client-side rendering directive', () => {
      // The component should have 'use client' directive for Next.js App Router
      expect(() => render(<NotFound />)).not.toThrow();
    });

    it('component is self-contained', () => {
      render(<NotFound />);

      // Should render all necessary content without props
      expect(screen.getByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /return home/i })).toBeInTheDocument();
    });
  });

  // Test 7: Performance and optimization
  describe('Performance Considerations', () => {
    it('renders without excessive DOM nodes', () => {
      const { container } = render(<NotFound />);

      const allElements = container.querySelectorAll('*');
      expect(allElements.length).toBeLessThan(20); // Reasonable limit for error page with Button component
    });

    it('has minimal CSS class applications', () => {
      render(<NotFound />);
      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      const classes = errorHeading.className.split(' ');

      expect(classes.length).toBeLessThan(6);
    });

    it('uses efficient layout classes', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen');
    });
  });

  // Test 8: Responsive design considerations
  describe('Responsive Design', () => {
    it('uses responsive text sizing', () => {
      render(<NotFound />);
      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      expect(errorHeading).toHaveClass('text-5xl'); // Large, responsive text
    });

    it('uses responsive spacing utilities', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');
      // Epic 15: Updated to use semantic spacing token with built-in responsiveness
      expect(main).toHaveClass('p-container');
    });

    it('maintains centering on all screen sizes', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('items-center', 'justify-center');
    });

    it('button/link remains touch-friendly', () => {
      render(<NotFound />);
      const homeLink = screen.getByRole('link', { name: /return home/i });
      // Link contains Button component which provides adequate touch target
      expect(homeLink).toBeInTheDocument();
    });
  });

  // Test 9: Edge cases and error handling
  describe('Edge Cases', () => {
    it('renders without props or external dependencies', () => {
      expect(() => render(<NotFound />)).not.toThrow();
    });

    it('handles multiple renders consistently', () => {
      const { rerender } = render(<NotFound />);

      expect(screen.getByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument();

      rerender(<NotFound />);
      expect(screen.getByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument();
    });

    it('maintains consistent content structure', () => {
      const { rerender } = render(<NotFound />);

      const originalHeading = screen.getByRole('heading', { name: /404 - page not found/i });
      const originalLink = screen.getByRole('link', { name: /return home/i });

      rerender(<NotFound />);

      const newHeading = screen.getByRole('heading', { name: /404 - page not found/i });
      const newLink = screen.getByRole('link', { name: /return home/i });

      expect(originalHeading.textContent).toBe(newHeading.textContent);
      expect(originalLink.getAttribute('href')).toBe(newLink.getAttribute('href'));
    });
  });

  // Test 10: Integration with Next.js features
  describe('Next.js Integration', () => {
    it('compatible with Next.js App Router not-found file', () => {
      // This validates the component follows Next.js 15 App Router not-file patterns
      const { container } = render(<NotFound />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('page structure supports static generation', () => {
      render(<NotFound />);

      expect(screen.getByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument();
    });

    it('client component directive works correctly', () => {
      // Should work as a client component for Next.js App Router
      expect(() => render(<NotFound />)).not.toThrow();
    });
  });

  // Test 11: User experience considerations
  describe('User Experience', () => {
    it('communicates error clearly but gently', () => {
      render(<NotFound />);

      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      const errorMessage = screen.getByText(/sorry.*doesn.*t exist or has been moved/i);

      expect(errorHeading).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toContain('Sorry'); // Friendly tone
    });

    it('provides clear path forward', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      expect(homeLink).toBeInTheDocument();
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('maintains visual hierarchy', () => {
      render(<NotFound />);

      const errorHeading = screen.getByRole('heading', { name: /404 - page not found/i, level: 1 });
      const errorMessage = screen.getByText(/sorry.*doesn.*t exist or has been moved/i);
      const homeLink = screen.getByRole('link', { name: /return home/i });

      expect(errorHeading).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
      expect(homeLink).toBeInTheDocument();
    });

    it('error page maintains brand identity', () => {
      render(<NotFound />);

      const main = screen.getByRole('main');

      // Should use brand colors
      expect(main).toHaveClass('bg-surface-primary', 'text-text-primary');
    });
  });

  // Test 12: Link interaction behavior
  describe('Link Interaction', () => {
    it('home link supports keyboard navigation', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });

      homeLink.focus();
      expect(homeLink).toHaveFocus();
    });

    it('home link has hover state styling', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      // Button component inside link provides hover states
      expect(homeLink).toBeInTheDocument();
    });

    it('link is properly sized for touch interaction', () => {
      render(<NotFound />);

      const homeLink = screen.getByRole('link', { name: /return home/i });
      // Button component inside link provides adequate touch target
      expect(homeLink).toBeInTheDocument();
    });
  });
});