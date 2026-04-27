/**
 * TDD Helper Utilities
 *
 * Helper functions and utilities to support the TDD workflow
 * for hotel website component development.
 */

import { render, RenderOptions, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { JSXElementConstructor } from 'react';

/**
 * Standard test render wrapper with common providers
 */
export const customRender = (ui: React.ReactElement, options?: RenderOptions) => {
  // Add any providers needed for your components
  // Example:
  // return render(
  //   <TranslationProvider>
  //     <BookingProvider>
  //       {ui}
  //     </BookingProvider>
  //   </TranslationProvider>,
  //   options
  // );

  return render(ui, options);
};

/**
 * User interaction helper with pre-configured userEvent
 */
export const createTestUser = () => userEvent.setup();

/**
 * Performance measurement utilities for TDD
 */
export class PerformanceTracker {
  private measurements: number[] = [];

  start() {
    return performance.now();
  }

  end(startTime: number): number {
    const duration = performance.now() - startTime;
    this.measurements.push(duration);
    return duration;
  }

  getAverage(): number {
    return this.measurements.reduce((a, b) => a + b, 0) / this.measurements.length;
  }

  getMeasurements(): number[] {
    return [...this.measurements];
  }

  reset() {
    this.measurements = [];
  }

  /**
   * Assert that performance is within acceptable limits
   */
  assertPerformance(maxAverageMs: number = 50, maxIndividualMs: number = 100) {
    const average = this.getAverage();
    const maxMeasured = Math.max(...this.measurements);

    expect(average).toBeLessThan(maxAverageMs);
    expect(maxMeasured).toBeLessThan(maxIndividualMs);
  }
}

/**
 * Mock data factory helpers for TDD
 */
export class MockDataFactory {
  static createMockDate(override?: Partial<Date>): Date {
    const defaultDate = new Date('2025-11-15T12:00:00Z');
    if (override) {
      return { ...defaultDate, ...override } as Date;
    }
    return defaultDate;
  }

  static createMockRoom(overrides = {}) {
    return {
      id: 'test-room-001',
      name: 'Test Deluxe Room',
      type: 'Deluxe',
      price: 250,
      capacity: 2,
      amenities: ['WiFi', 'TV', 'Mini Bar'],
      image: '/test-images/room.jpg',
      description: 'A comfortable test room',
      ...overrides,
    };
  }

  static createMockBookingData(overrides = {}) {
    return {
      checkIn: this.createMockDate(),
      checkOut: new Date('2025-11-17T12:00:00Z'),
      adults: 2,
      children: 0,
      rooms: 1,
      roomType: 'Deluxe',
      ...overrides,
    };
  }

  static createMockContactData(overrides = {}) {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      message: 'This is a test message',
      ...overrides,
    };
  }
}

/**
 * TDD Test Builder Pattern
 *
 * Helps build tests following the Red-Green-Refactor pattern
 */
export class TDDTestBuilder<TProps extends Record<string, unknown> = {}> {
  private Component: JSXElementConstructor<TProps>;
  private defaultProps: Partial<TProps>;
  private customRenderers: Array<(ui: React.ReactElement) => void> = [];

  constructor(component: JSXElementConstructor<TProps>, defaultProps: Partial<TProps> = {}) {
    this.Component = component;
    this.defaultProps = defaultProps;
  }

  /**
   * Add a custom renderer wrapper
   */
  withRenderer(renderer: (ui: React.ReactElement) => void) {
    this.customRenderers.push(renderer);
    return this;
  }

  /**
   * Render component with props and any custom renderers
   */
  render(props: Partial<TProps> = {}) {
    const finalProps = { ...this.defaultProps, ...props } as TProps;
    const element = React.createElement(this.Component, finalProps);

    if (this.customRenderers.length > 0) {
      this.customRenderers.forEach(renderer => renderer(element));
      return null; // Actual rendering handled by custom renderers
    }

    return customRender(element);
  }

  /**
   * Test that element is present in the DOM
   */
  expectElementPresent(getByFunction: () => HTMLElement) {
    const element = getByFunction();
    expect(element).toBeInTheDocument();
    return element;
  }

  /**
   * Test that element is not present in the DOM
   */
  expectElementAbsent(queryByFunction: () => HTMLElement | null) {
    const element = queryByFunction();
    expect(element).not.toBeInTheDocument();
  }

  /**
   * Test that text content is present
   */
  expectTextPresent(text: string) {
    expect(screen.getByText(text)).toBeInTheDocument();
  }

  /**
   * Test that element has specific attribute
   */
  expectAttribute(element: HTMLElement, attribute: string, value: string) {
    expect(element).toHaveAttribute(attribute, value);
  }
}

/**
 * Contract Testing Helper
 *
 * Helps test ZOD contract validation in TDD workflow
 */
export class ContractTester {
  /**
   * Test that valid data passes validation
   */
  static expectValid(contract: any, data: any) {
    const result = contract.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      return result.data;
    }
    return null;
  }

  /**
   * Test that invalid data fails validation
   */
  static expectInvalid(
    contract: any,
    data: any,
    expectedErrorCount?: number
  ): Array<{ message: string }> {
    const result = contract.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      if (expectedErrorCount) {
        expect(result.error.issues).toHaveLength(expectedErrorCount);
      }
      return result.error.issues as Array<{ message: string }>;
    }
    return [];
  }

  /**
   * Test specific error message
   */
  static expectErrorMessage(
    contract: any,
    data: any,
    expectedMessage: string | RegExp
  ) {
    const errors = this.expectInvalid(contract, data);
    const hasExpectedError = errors.some(error =>
      typeof expectedMessage === 'string'
        ? error.message.includes(expectedMessage)
        : expectedMessage.test(error.message)
    );
    expect(hasExpectedError).toBe(true);
  }
}

/**
 * Red-Green-Refactor Test Helper
 *
 * Provides utilities to explicitly follow TDD cycle
 */
export class TDDCycle {
  private testName: string;
  private phase: 'red' | 'green' | 'refactor' = 'red';

  constructor(testName: string) {
    this.testName = testName;
  }

  /**
   * Start Red phase - write failing test
   */
  red(description: string) {
    this.phase = 'red';
    console.log(`🔴 RED Phase: ${this.testName} - ${description}`);
  }

  /**
   * Start Green phase - make test pass
   */
  green(description: string) {
    this.phase = 'green';
    console.log(`🟢 GREEN Phase: ${this.testName} - ${description}`);
  }

  /**
   * Start Refactor phase - improve code
   */
  refactor(description: string) {
    this.phase = 'refactor';
    console.log(`🔵 REFACTOR Phase: ${this.testName} - ${description}`);
  }

  /**
   * Get current phase
   */
  getCurrentPhase() {
    return this.phase;
  }
}

/**
 * Accessibility Testing Helper for TDD
 */
export class AccessibilityTester {
  /**
   * Test component accessibility
   */
  static async testAccessibility(container: HTMLElement) {
    const { axe, toHaveNoViolations } = require('jest-axe');
    expect.extend(toHaveNoViolations);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
    return results;
  }

  /**
   * Test keyboard navigation
   */
  static async testKeyboardNavigation(
    user: ReturnType<typeof createTestUser>,
    selectors: string[]
  ) {
    // Test Tab navigation through all provided selectors
    for (const selector of selectors) {
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInTheDocument();
      if (focusedElement) {
        expect(focusedElement.matches(selector)).toBe(true);
      }
    }
  }

  /**
   * Test ARIA labels and roles
   */
  static testARIA(elements: Array<{
    selector: string;
    role?: string;
    label?: string;
    attributes?: Record<string, string>
  }>) {
    elements.forEach(({ selector, role, label, attributes }) => {
      const element = document.querySelector(selector);
      expect(element).toBeInTheDocument();
      if (!element) {
        throw new Error(`Element with selector '${selector}' not found in DOM`);
      }

      if (role) {
        expect(element).toHaveAttribute('role', role);
      }

      if (label) {
        expect(element).toHaveAttribute('aria-label', label);
      }

      if (attributes) {
        Object.entries(attributes).forEach(([attr, value]) => {
          expect(element).toHaveAttribute(attr, value);
        });
      }
    });
  }
}

/**
 * Responsive Testing Helper for TDD
 */
export class ResponsiveTester {
  /**
   * Test at different viewport sizes
   */
  static async testAtBreakpoints(
    testFn: (breakpoint: string) => void | Promise<void>,
    breakpoints = {
      mobile: 375,
      tablet: 768,
      desktop: 1024,
      wide: 1280
    }
  ) {
    for (const [name, width] of Object.entries(breakpoints)) {
      // Set viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });

      // Trigger resize event if needed
      window.dispatchEvent(new Event('resize'));

      // Run test at this breakpoint
      await testFn(name);
    }
  }

  /**
   * Expect element to be visible/hidden at breakpoint
   */
  static expectVisibility(selector: string, visible: boolean) {
      const element = document.querySelector(selector);
      expect(element).toBeInTheDocument();
      if (!element) {
        throw new Error(`Element with selector '${selector}' not found in DOM`);
      }

    const computedStyle = window.getComputedStyle(element);
    const isVisible = computedStyle.display !== 'none' &&
                     computedStyle.visibility !== 'hidden' &&
                     computedStyle.opacity !== '0';

    if (visible) {
      expect(isVisible).toBe(true);
    } else {
      expect(isVisible).toBe(false);
    }
  }
}

/**
 * Mock Service Helper for TDD
 */
export class MockService {
  private mocks: Map<string, jest.Mock> = new Map();

  /**
   * Register a mock service function
   */
  mock(serviceName: string, implementation?: jest.Mock) {
    const mockFn = implementation || jest.fn();
    this.mocks.set(serviceName, mockFn);
    return mockFn;
  }

  /**
   * Get a mock service function
   */
  get(serviceName: string): jest.Mock {
    const mock = this.mocks.get(serviceName);
    if (!mock) {
      throw new Error(`Mock service '${serviceName}' not found`);
    }
    return mock;
  }

  /**
   * Reset all mocks
   */
  resetAll() {
    this.mocks.forEach(mock => mock.mockReset());
  }

  /**
   * Clear all mocks
   */
  clearAll() {
    this.mocks.forEach(mock => mock.mockClear());
  }

  /**
   * Verify all mocks were called
   */
  verifyAllCalled() {
    this.mocks.forEach((mock, serviceName) => {
      expect(mock).toHaveBeenCalled();
    });
  }
}

// Export commonly used combinations
export const createTDDTestHelpers = () => ({
  render: customRender,
  user: createTestUser(),
  performance: new PerformanceTracker(),
  mockData: MockDataFactory,
  contract: ContractTester,
  tdd: (testName: string) => new TDDCycle(testName),
  accessibility: AccessibilityTester,
  responsive: ResponsiveTester,
  mockService: new MockService(),
});