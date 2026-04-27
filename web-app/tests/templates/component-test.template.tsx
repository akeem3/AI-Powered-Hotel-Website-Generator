/**
 * Component Test Template
 *
 * Copy this template to create tests for new components.
 * Replace [ComponentName] with your actual component name.
 *
 * Usage:
 * 1. Copy this file: cp component-test.template.tsx [ComponentName].test.tsx
 * 2. Replace all [ComponentName] placeholders
 * 3. Update props and test cases as needed
 * 4. Remove this comment header
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { customRender } from '../utils/test-utils';
import { testAccessibility } from '../helpers/accessibility';

// Import the component you're testing
// import [ComponentName] from '../../../components/[ComponentPath]/[ComponentName]';

// Import contract for validation tests
// import { [ComponentName]Contract } from '../../../types/contracts';

// Import mock data factories
// import { createMock[ComponentName]Props } from '../factories/mockData';

// Extend Jest matchers for accessibility
expect.extend(toHaveNoViolations);

describe('[ComponentName]', () => {
  const defaultProps = {
    // Define your component's default props here
    // Example:
    // title: 'Test Title',
    // variant: 'default',
    // onAction: jest.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Reset cost monitor if testing LangGraph components
    // costMonitor?.reset();
  });

  describe('Rendering', () => {
    it('should render with required props', () => {
      customRender(<[ComponentName] {...defaultProps} />);

      // Add assertions for required content
      // Example:
      // expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should render with all optional props', () => {
      const allProps = {
        ...defaultProps,
        // Add all optional props here
        // subtitle: 'Test Subtitle',
        // disabled: false,
      };

      customRender(<[ComponentName] {...allProps} />);

      // Verify optional props are rendered
      // Example:
      // expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('should not render when not provided required props', () => {
      // Test component gracefully handles missing required props
      // This depends on your component's design
    });

    it('should apply custom className correctly', () => {
      const { container } = customRender(
        <[ComponentName] {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('User Interactions', () => {
    it('should handle user interactions correctly', async () => {
      const mockHandler = jest.fn();
      const user = userEvent.setup();

      customRender(
        <[ComponentName]
          {...defaultProps}
          // onAction={mockHandler}
        />
      );

      // Example interaction tests:
      // const button = screen.getByRole('button', { name: /submit/i });
      // await user.click(button);

      // expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard interactions', async () => {
      const user = userEvent.setup();

      customRender(<[ComponentName] {...defaultProps} />);

      // Example keyboard test:
      // const element = screen.getByRole('button');
      // await user.tab();
      // expect(element).toHaveFocus();

      // await user.keyboard('{Enter}');
      // expect(mockHandler).toHaveBeenCalled();
    });

    it('should handle form submissions correctly', async () => {
      // For form components
      const mockSubmit = jest.fn();
      const user = userEvent.setup();

      customRender(
        <[ComponentName]
          {...defaultProps}
          // onSubmit={mockSubmit}
        />
      );

      // Fill form fields
      // await user.type(screen.getByLabelText(/name/i), 'John Doe');
      // await user.type(screen.getByLabelText(/email/i), 'john@example.com');

      // Submit form
      // await user.click(screen.getByRole('button', { name: /submit/i }));

      // await waitFor(() => {
      //   expect(mockSubmit).toHaveBeenCalledWith({
      //     name: 'John Doe',
      //     email: 'john@example.com'
      //   });
      // });
    });
  });

  describe('State Management', () => {
    it('should update state correctly on user actions', async () => {
      const user = userEvent.setup();
      const { rerender } = customRender(<[ComponentName] {...defaultProps} />);

      // Test state changes
      // Example:
      // await user.click(screen.getByRole('button', { name: 'Toggle' }));
      // expect(screen.getByText('Content is visible')).toBeInTheDocument();

      // Test state persistence across re-renders
      // rerender(<[ComponentName] {...defaultProps} someNewProp="value" />);
      // expect(screen.getByText('Content is visible')).toBeInTheDocument();
    });

    it('should handle loading states correctly', () => {
      customRender(
        <[ComponentName]
          {...defaultProps}
          // loading={true}
        />
      );

      // Test loading state
      // expect(screen.getByRole('progressbar')).toBeInTheDocument();
      // expect(screen.queryByText('Submit')).not.toBeInTheDocument();
    });

    it('should handle error states correctly', () => {
      const errorMessage = 'Something went wrong';

      customRender(
        <[ComponentName]
          {...defaultProps}
          // error={errorMessage}
        />
      );

      // Test error state
      // expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render content conditionally based on props', () => {
      const { rerender } = customRender(
        <[ComponentName] {...defaultProps} showContent={false} />
      );

      // Test content is hidden
      // expect(screen.queryByText('Conditional Content')).not.toBeInTheDocument();

      rerender(<[ComponentName] {...defaultProps} showContent={true} />);

      // Test content is shown
      // expect(screen.getByText('Conditional Content')).toBeInTheDocument();
    });

    it('should render different variants correctly', () => {
      const { rerender } = customRender(
        <[ComponentName] {...defaultProps} variant="primary" />
      );

      // Test primary variant
      // expect(screen.getByRole('button')).toHaveClass('bg-blue-600');

      rerender(<[ComponentName] {...defaultProps} variant="secondary" />);

      // Test secondary variant
      // expect(screen.getByRole('button')).toHaveClass('bg-gray-600');
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', async () => {
      const { container } = customRender(<[ComponentName] {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      customRender(<[ComponentName] {...defaultProps} />);

      // Test Tab navigation through interactive elements
      // await user.tab();
      // Expect focus to be on first interactive element

      // await user.tab();
      // Expect focus to move to next interactive element
    });

    it('should have proper ARIA labels and roles', () => {
      customRender(<[ComponentName] {...defaultProps} />);

      // Test ARIA attributes
      // expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Submit form');
      // expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'heading-id');
    });

    it('should announce important changes to screen readers', async () => {
      const user = userEvent.setup();

      customRender(<[ComponentName] {...defaultProps} />);

      // Test that important state changes are announced
      // await user.click(screen.getByRole('button', { name: 'Load Data' }));
      // await waitFor(() => {
      //   expect(screen.getByRole('status')).toHaveTextContent('Data loaded successfully');
      // });
    });
  });

  describe('Responsive Behavior', () => {
    beforeEach(() => {
      // Reset viewport before each responsive test
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should render correctly on mobile devices', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = customRender(<[ComponentName] {...defaultProps} />);

      // Test mobile-specific behavior
      // expect(container.querySelector('.mobile-layout')).toBeInTheDocument();
      // expect(container.querySelector('.desktop-layout')).not.toBeInTheDocument();
    });

    it('should render correctly on desktop devices', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      const { container } = customRender(<[ComponentName] {...defaultProps} />);

      // Test desktop-specific behavior
      // expect(container.querySelector('.desktop-layout')).toBeInTheDocument();
      // expect(container.querySelector('.mobile-layout')).not.toBeInTheDocument();
    });

    it('should handle viewport changes correctly', () => {
      const { container, rerender } = customRender(<[ComponentName] {...defaultProps} />);

      // Start with desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      // Trigger resize event if component listens for it
      // window.dispatchEvent(new Event('resize'));

      // Test responsive changes
      // expect(container.querySelector('.mobile-layout')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render within performance budget', () => {
      const startTime = performance.now();

      customRender(<[ComponentName] {...defaultProps} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Component should render within 50ms
      expect(renderTime).toBeLessThan(50);
    });

    it('should not cause unnecessary re-renders', () => {
      const renderSpy = jest.fn();

      const TestComponent = () => {
        renderSpy();
        return <[ComponentName] {...defaultProps} />;
      };

      const { rerender } = customRender(<TestComponent />);

      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props should not cause re-render of component
      rerender(<TestComponent />);

      // Component should not re-render if props haven't changed
      // This depends on React.memo or similar optimizations
    });
  });

  describe('Error Handling', () => {
    it('should handle missing or invalid props gracefully', () => {
      // Test with missing required props (if applicable)
      // const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // expect(() =>
      //   customRender(<[ComponentName] />)
      // ).not.toThrow();

      // consoleSpy.mockRestore();
    });

    it('should handle async operations errors', async () => {
      // Test error handling in async operations
      const mockAsyncFunction = jest.fn().mockRejectedValue(new Error('API Error'));

      customRender(
        <[ComponentName]
          {...defaultProps}
          // asyncFunction={mockAsyncFunction}
        />
      );

      // Trigger async operation
      // await user.click(screen.getByRole('button', { name: 'Load Data' }));

      // await waitFor(() => {
      //   expect(screen.getByText('Failed to load data')).toBeInTheDocument();
      // });
    });
  });

  describe('Contract Validation', () => {
    it('should validate component configuration against ZOD schema', () => {
      const invalidConfig = {
        // Provide invalid config that violates your ZOD schema
        // title: 123, // Should be string
        // variant: 'invalid-variant',
      };

      const result = [ComponentName]Contract.safeParse(invalidConfig);
      expect(result.success).toBe(false);

      // Check specific validation errors
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Check for specific error messages
        // expect(result.error.issues[0].message).toContain('Expected string');
      }
    });

    it('should accept valid component configuration', () => {
      const validConfig = {
        ...defaultProps,
        // Provide valid config that satisfies your ZOD schema
      };

      const result = [ComponentName]Contract.safeParse(validConfig);
      expect(result.success).toBe(true);
    });

    it('should handle partial updates correctly', () => {
      const partialUpdate = {
        // Provide partial update that should be merged with defaults
        // title: 'Updated Title',
      };

      const result = [ComponentName]Contract.partial().safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should work correctly with parent components', () => {
      // Test integration with parent component
      const ParentComponent = () => (
        <div>
          <h1>Parent Component</h1>
          <[ComponentName] {...defaultProps} />
        </div>
      );

      customRender(<ParentComponent />);

      // Verify component works within parent context
      // expect(screen.getByText('Parent Component')).toBeInTheDocument();
      // expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should work correctly with context providers', () => {
      // Test integration with context providers
      const MockProvider = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="mock-provider-value">Provider Value</div>
      );

      customRender(
        <MockProvider>
          <[ComponentName] {...defaultProps} />
        </MockProvider>
      );

      // Verify component can access context
      // expect(screen.getByTestId('mock-provider-value')).toBeInTheDocument();
    });
  });
});

// Helper functions (add to test-utils.ts if reusable)

const createMockProps = (overrides = {}) => ({
  ...defaultProps,
  ...overrides,
});

const mockAsyncOperation = (shouldFail = false, delay = 100) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('Async operation failed'));
      } else {
        resolve({ success: true });
      }
    }, delay);
  });
};

// Test data factory (move to factories/mockData.ts for reuse)
export const createMock[ComponentName]Props = (overrides = {}) => ({
  ...defaultProps,
  ...overrides,
});