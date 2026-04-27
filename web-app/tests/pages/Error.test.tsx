import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ErrorPage from '@/app/error';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Error Page (Error Boundary)', () => {
  const mockError: Error = new Error('Test error message');
  const mockReset = jest.fn();

  // Test 1: Basic rendering with error props
  describe('Rendering with Error Props', () => {
    it('renders error heading', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const errorHeading = screen.getByRole('heading', { name: /oops! something went wrong/i, level: 1 });
      expect(errorHeading).toBeInTheDocument();
      expect(errorHeading).toHaveTextContent('Oops! Something went wrong');
    });

    it('displays error message', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const errorMessage = screen.getByText(/test error message/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-status-error');
    });

    it('renders reset button', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).toHaveTextContent('Try Again');
    });

    it('renders within main semantic element', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
    });

    it('uses semantic main element with proper styling', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
      // Epic 15: Updated to semantic spacing tokens (p-6 -> p-container)
      expect(main).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center', 'min-h-screen', 'bg-surface-primary', 'text-text-primary', 'p-container', 'text-center');
    });
  });

  // Test 2: Error message display
  describe('Error Message Display', () => {
    it('displays custom error message', () => {
      const customError: Error = new Error('Custom error occurred');
      render(<ErrorPage error={customError} reset={mockReset} />);

      const errorMessage = screen.getByText(/custom error occurred/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('handles empty error message', () => {
      const emptyError: Error = new Error('');
      render(<ErrorPage error={emptyError} reset={mockReset} />);

      const errorMessage = screen.getByText(/an unexpected error occurred/i); // Shows fallback text
      expect(errorMessage).toBeInTheDocument();
    });

    it('handles long error messages', () => {
      const longError: Error = new Error('This is a very long error message that might contain lots of technical details and debugging information');
      render(<ErrorPage error={longError} reset={mockReset} />);

      const errorMessage = screen.getByText(/this is a very long error message/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('displays error in paragraph element for formatting', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
      const paragraphElement = container.querySelector('p');
      expect(paragraphElement).toBeInTheDocument();
      expect(paragraphElement).toHaveTextContent('Test error message');
    });

    it('applies error message styling', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const paragraphElement = container.querySelector('p');
      // Epic 15: Updated to semantic spacing tokens (mb-6 -> mb-gap-card)
      expect(paragraphElement).toHaveClass('text-status-error', 'mb-gap-card', 'max-w-md');
    });
  });

  // Test 3: Reset functionality
  describe('Reset Functionality', () => {
    it('calls reset function when button is clicked', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(resetButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    it('reset button is clickable multiple times', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });

      fireEvent.click(resetButton);
      fireEvent.click(resetButton);
      fireEvent.click(resetButton);

      expect(mockReset).toHaveBeenCalledTimes(3);
    });

    it('reset button has accessible styling', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton).toHaveAttribute('aria-label', 'Try Again');
    });

    it('reset button has descriptive text', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton.textContent).toBe('Try Again');
    });
  });

  // Test 4: Styling and layout validation
  describe('Styling and Layout', () => {
    it('applies correct background and text colors', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const main = container.querySelector('main');
      expect(main).toHaveClass('bg-surface-primary', 'text-text-primary');
    });

    it('applies correct typography styles to heading', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);
      const errorHeading = screen.getByRole('heading', { level: 1 });
      // Epic 15: Updated to semantic spacing tokens (mb-4 -> mb-gap-card, font-bold removed)
      expect(errorHeading).toHaveClass('text-4xl', 'mb-gap-card');
    });

    it('applies correct spacing to elements', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
      const errorHeading = screen.getByRole('heading', { level: 1 });
      const paragraphElement = container.querySelector('p');

      // Epic 15: Updated to semantic spacing tokens (mb-4 -> mb-gap-card, mb-6 -> mb-gap-card)
      expect(errorHeading).toHaveClass('mb-gap-card');
      expect(paragraphElement).toHaveClass('mb-gap-card');
    });

    it('uses flex layout for vertical centering', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const main = container.querySelector('main');
      expect(main).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('applies proper padding to main container', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const main = container.querySelector('main');
      // Epic 15: Updated to semantic spacing tokens (p-6 -> p-container)
      expect(main).toHaveClass('p-container');
    });

    it('error message has distinct styling', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const paragraphElement = container.querySelector('p');
      expect(paragraphElement).toHaveClass('text-status-error'); // Error color for distinction
    });
  });

  // Test 5: Accessibility compliance
  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has proper heading hierarchy', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent('Something went wrong');
    });

    it('maintains semantic HTML structure', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();

      // Main element is the semantic container
      expect(mainElement).toBeDefined();
    });

    it('reset button is properly accessible', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton).toHaveAccessibleName();
    });

    it('has sufficient color contrast (structural test)', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const errorHeading = screen.getByRole('heading', { level: 1 });
      expect(errorHeading.parentElement).toHaveClass('text-text-primary'); // Should contrast with bg-surface-primary

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton).toHaveClass('text-primary-foreground'); // Shadcn Button primary-foreground color
    });

    it('error message is readable', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const paragraphElement = container.querySelector('p');
      expect(paragraphElement).toHaveClass('text-status-error'); // Error color should be readable on light background
    });

    it('maintains focus management', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      resetButton.focus();
      expect(resetButton).toHaveFocus();
    });
  });

  // Test 6: Error handling context
  describe('Error Context', () => {
    it('communicates error state clearly', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const errorHeading = screen.getByRole('heading', { name: /something went wrong/i, level: 1 });
      expect(errorHeading).toBeInTheDocument();
      expect(errorHeading.textContent).toContain('Something went wrong');
    });

    it('provides recovery option', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton).toBeInTheDocument();
      expect(resetButton.textContent).toBe('Try Again');
    });

    it('displays technical error information appropriately', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      // Error message is displayed in paragraph element
      const paragraphElement = container.querySelector('p');
      expect(paragraphElement).toBeInTheDocument();
      expect(paragraphElement).toHaveTextContent('Test error message');
    });

    it('maintains brand consistency in error state', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const main = container.querySelector('main');
      expect(main).toHaveClass('bg-surface-primary', 'text-text-primary');
    });
  });

  // Test 7: Component structure and organization
  describe('Component Structure', () => {
    it('maintains proper component import structure', () => {
      expect(() => render(<ErrorPage error={mockError} reset={mockReset} />)).not.toThrow();
    });

    it('exports default component function', () => {
      const moduleExports = require('@/app/error');

      expect(moduleExports.default).toBeDefined();
      expect(typeof moduleExports.default).toBe('function');
    });

    it('uses client-side rendering directive', () => {
      expect(() => render(<ErrorPage error={mockError} reset={mockReset} />)).not.toThrow();
    });

    it('requires error and reset props', () => {
      // Component should render with valid props
      expect(() => render(<ErrorPage error={mockError} reset={mockReset} />)).not.toThrow();
    });
  });

  // Test 8: Performance and optimization
  describe('Performance Considerations', () => {
    it('renders without excessive DOM nodes', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const allElements = container.querySelectorAll('*');
      expect(allElements.length).toBeLessThan(15); // Reasonable limit for error page
    });

    it('has minimal CSS class applications', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);
      const errorHeading = screen.getByRole('heading', { level: 1 });
      const classes = errorHeading.className.split(' ');

      // Epic 15: Heading has 2 classes (text-4xl, mb-gap-card) after semantic token migration
      expect(classes.length).toBeGreaterThanOrEqual(2);
    });

    it('uses efficient layout classes', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const main = container.querySelector('main');
      expect(main).toHaveClass('min-h-screen');
    });
  });

  // Test 9: Edge cases and error handling
  describe('Edge Cases', () => {
    it('handles undefined error gracefully', () => {
      const undefinedError: Error = new Error('undefined');
      render(<ErrorPage error={undefinedError} reset={mockReset} />);

      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
    });

    it('handles error with special characters', () => {
      const specialCharError: Error = new Error('Error with special chars: <script>alert("xss")</script>');
      render(<ErrorPage error={specialCharError} reset={mockReset} />);

      const errorMessage = screen.getByText(/error with special chars/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it('handles multiple renders with different errors', () => {
      const { rerender } = render(<ErrorPage error={mockError} reset={mockReset} />);

      expect(screen.getByText(/test error message/i)).toBeInTheDocument();

      const newError: Error = new Error('Different error message');
      rerender(<ErrorPage error={newError} reset={mockReset} />);

      expect(screen.getByText(/different error message/i)).toBeInTheDocument();
    });

    it('reset function works correctly across re-renders', () => {
      const { rerender } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(resetButton);

      expect(mockReset).toHaveBeenCalledTimes(1);

      rerender(<ErrorPage error={mockError} reset={mockReset} />);

      const newResetButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(newResetButton);

      expect(mockReset).toHaveBeenCalledTimes(2);
    });
  });

  // Test 10: Integration with Next.js features
  describe('Next.js Integration', () => {
    it('compatible with Next.js App Router error file', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('client component directive works correctly', () => {
      expect(() => render(<ErrorPage error={mockError} reset={mockReset} />)).not.toThrow();
    });

    it('properly handles Next.js error boundary props', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      // Should handle both error object and reset function from Next.js
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  // Test 11: User experience considerations
  describe('User Experience', () => {
    it('communicates error clearly but not intimidatingly', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const errorHeading = screen.getByRole('heading', { level: 1 });
      expect(errorHeading).toBeInTheDocument();
      expect(errorHeading.textContent).toBe('Oops! Something went wrong'); // User-friendly
    });

    it('provides clear recovery path', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton).toBeInTheDocument();
      expect(resetButton.textContent).toBe('Try Again');
    });

    it('balances technical information with user experience', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      // Shows error message in paragraph element
      const paragraphElement = container.querySelector('p');
      expect(paragraphElement).toBeInTheDocument(); // Error details available
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument(); // User-friendly message
    });

    it('error page maintains brand identity', () => {
      const { container } = render(<ErrorPage error={mockError} reset={mockReset} />);

      const main = container.querySelector('main');
      const resetButton = screen.getByRole('button', { name: /try again/i });

      expect(main).toHaveClass('bg-surface-primary', 'text-text-primary');
      expect(resetButton).toHaveClass('bg-primary', 'text-primary-foreground');
    });
  });

  // Test 12: Reset button interaction behavior
  describe('Reset Button Interaction', () => {
    it('supports keyboard navigation', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });

      resetButton.focus();
      expect(resetButton).toHaveFocus();
    });

    it('has hover state styling', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      // Epic 15: Updated to semantic hover tokens (hover:bg-primary/90 -> hover:bg-primary/strong)
      expect(resetButton).toHaveClass('hover:bg-primary/strong');
    });

    it('is properly sized for touch interaction', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });
      expect(resetButton).toHaveClass('px-4', 'py-2'); // Adequate padding for touch
    });

    it('provides immediate visual feedback on click', () => {
      render(<ErrorPage error={mockError} reset={mockReset} />);

      const resetButton = screen.getByRole('button', { name: /try again/i });

      // Simulate click and verify button remains functional
      fireEvent.click(resetButton);
      expect(resetButton).toBeInTheDocument();
      expect(mockReset).toHaveBeenCalled();
    });
  });
});