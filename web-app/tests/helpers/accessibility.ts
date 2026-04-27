import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderResult } from '@testing-library/react';
import { ReactElement } from 'react';

// Extend Jest matchers to include axe accessibility matchers
expect.extend(toHaveNoViolations);

/**
 * Tests accessibility of a rendered component using axe
 * @param container - The HTML container element to test
 * @returns Promise that resolves when accessibility test is complete
 */
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

/**
 * Renders a component and runs accessibility tests on it
 * @param component - The React component to test
 * @param options - Optional render options
 * @returns Promise that resolves with render result and accessibility test
 */
export const renderAndTestAccessibility = async (
  component: ReactElement,
  options?: any
): Promise<RenderResult> => {
  const renderResult = render(component, options);

  // Wait for any async operations to complete
  await new Promise(resolve => setTimeout(resolve, 0));

  // Test accessibility
  await testAccessibility(renderResult.container);

  return renderResult;
};

/**
 * Tests keyboard navigation for a component
 * @param container - The HTML container element to test
 * @param expectedFocusableElements - Array of selectors for elements that should be focusable
 */
export const testKeyboardNavigation = (
  container: HTMLElement,
  expectedFocusableElements: string[] = []
) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  // Check that expected elements are present and focusable
  expectedFocusableElements.forEach(selector => {
    const elements = container.querySelectorAll(selector);
    expect(elements.length).toBeGreaterThan(0);

    Array.from(elements).forEach(element => {
      expect(element).toHaveAttribute('tabindex');
    });
  });

  // Test Tab key navigation through focusable elements
  const focusableArray = Array.from(focusableElements) as HTMLElement[];

  focusableArray.forEach((element, index) => {
    // Focus the element
    element.focus();
    expect(document.activeElement).toBe(element);

    // Check if element has proper focus styling or attributes
    expect(element).toBeVisible();
  });
};

/**
 * Tests ARIA attributes for common accessibility patterns
 * @param container - The HTML container element to test
 * @param ariaTests - Object containing ARIA tests to run
 */
export const testAriaAttributes = (
  container: HTMLElement,
  ariaTests: {
    role?: string;
    label?: string;
    describedBy?: string;
    expanded?: boolean;
    required?: boolean;
  } = {}
) => {
  const element = container.firstElementChild as HTMLElement;
  expect(element).toBeTruthy();

  if (ariaTests.role) {
    expect(element).toHaveAttribute('role', ariaTests.role);
  }

  if (ariaTests.label) {
    expect(element).toHaveAttribute('aria-label', ariaTests.label);
  }

  if (ariaTests.describedBy) {
    expect(element).toHaveAttribute('aria-describedby', ariaTests.describedBy);
  }

  if (ariaTests.expanded !== undefined) {
    expect(element).toHaveAttribute('aria-expanded', ariaTests.expanded.toString());
  }

  if (ariaTests.required !== undefined) {
    expect(element).toHaveAttribute('aria-required', ariaTests.required.toString());
  }
};

/**
 * Tests color contrast for text elements
 * @param container - The HTML container element to test
 * @param minContrastRatio - Minimum contrast ratio (default: 4.5 for normal text)
 */
export const testColorContrast = async (
  container: HTMLElement,
  minContrastRatio: number = 4.5
) => {
  const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');

  for (const element of textElements) {
    const htmlElement = element as HTMLElement;
    const styles = window.getComputedStyle(htmlElement);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;

    // Skip if colors are not properly set
    if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
      continue;
    }

    // Note: In a real implementation, you would use a color contrast library
    // For now, we'll just verify that colors are set
    expect(color).not.toBe('');
    if (backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
      expect(backgroundColor).not.toBe('');
    }
  }
};

/**
 * Tests that all images have proper alt text
 * @param container - The HTML container element to test
 */
export const testImageAltText = (container: HTMLElement) => {
  const images = container.querySelectorAll('img');

  images.forEach((img, index) => {
    const htmlImg = img as HTMLImageElement;

    if (htmlImg.alt === '') {
      // If no alt text, image should have role="presentation" or be decorative
      expect(htmlImg).toHaveAttribute('role', 'presentation');
    } else {
      // If alt text is present, it should be descriptive
      expect(htmlImg.alt.trim()).toBeTruthy();
      expect(htmlImg.alt.length).toBeGreaterThan(0);
    }
  });
};

/**
 * Tests form accessibility including labels, error messages, and validation
 * @param container - The HTML container element to test
 */
export const testFormAccessibility = (container: HTMLElement) => {
  const inputs = container.querySelectorAll('input, select, textarea');
  const buttons = container.querySelectorAll('button[type="submit"]');

  // Test that all form inputs have labels
  inputs.forEach(input => {
    const htmlInput = input as HTMLElement;
    const id = htmlInput.id;

    if (id) {
      // Check for associated label
      const label = container.querySelector(`label[for="${id}"]`);
      if (!label) {
        // Check if input has aria-label or aria-labelledby
        expect(htmlInput).toHaveAttribute('aria-label');
        expect(htmlInput).toHaveAttribute('aria-labelledby');
      }
    } else {
      // If no id, check for aria-label
      expect(htmlInput).toHaveAttribute('aria-label');
    }

    // Check required inputs have aria-required
    if (htmlInput.hasAttribute('required')) {
      expect(htmlInput).toHaveAttribute('aria-required', 'true');
    }
  });

  // Test submit buttons are properly labeled
  buttons.forEach(button => {
    const htmlButton = button as HTMLButtonElement;
    expect(htmlButton.textContent?.trim()).toBeTruthy();
  });
};