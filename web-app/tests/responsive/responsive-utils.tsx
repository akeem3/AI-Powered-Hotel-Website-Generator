import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Note: Using simple wrapper following existing test patterns
// TranslationProvider will be implemented in Epic 2 as mentioned in Story 1.7
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  // TODO: Replace with required providers when Epic 2 is implemented
  return <>{children}</>;
};

// Create a custom render function that includes providers
const customRender = (ui: ReactElement, options?: RenderOptions) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Viewport utility for responsive testing
export const setViewport = (width: number, height: number = 800) => {
  // Set innerWidth
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  // Set innerHeight
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Set outerWidth for consistency
  Object.defineProperty(window, 'outerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });

  // Set outerHeight for consistency
  Object.defineProperty(window, 'outerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });

  // Dispatch resize event to trigger responsive behaviors
  window.dispatchEvent(new Event('resize'));
};

// Mock matchMedia for Tailwind responsive utilities
export const mockMatchMedia = (width: number) => {
  // Create a fresh mock function
  const mockMatchMediaFn = jest.fn().mockImplementation((query) => {
    // Parse media query to determine if it matches
    const matches =
      (query.includes('min-width: 768px') && width >= 768) ||
      (query.includes('min-width: 640px') && width >= 640) ||
      (query.includes('min-width: 1024px') && width >= 1024) ||
      (query.includes('min-width: 1280px') && width >= 1280) ||
      (query.includes('min-width: 1536px') && width >= 1536) ||
      (query.includes('max-width: 767px') && width <= 767) ||
      (query.includes('max-width: 639px') && width <= 639) ||
      (query.includes('max-width: 1023px') && width <= 1023) ||
      (query.includes('max-width: 1279px') && width <= 1279) ||
      (query.includes('max-width: 1535px') && width <= 1535);

    return {
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    };
  });

  // Check if matchMedia already exists and update it
  // This prevents "Cannot redefine property" errors
  if ((window as any).matchMedia) {
    // If matchMedia exists, just replace the implementation
    // by directly assigning to the existing property
    (window as any).matchMedia = mockMatchMediaFn;
  } else {
    // If matchMedia doesn't exist, define it
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: mockMatchMediaFn,
    });
  }
};

// Responsive breakpoint testing utility
type ResponsiveBreakpoint = {
  width: number;
  name: string;
  expectedElements?: string[];
};

export const testResponsiveBreakpoints = async (
  Component: React.ComponentType<any>,
  props: any,
  options?: {
    breakpoints?: ResponsiveBreakpoint[];
    height?: number;
    skipMountCheck?: boolean;
  }
) => {
  const defaultBreakpoints: ResponsiveBreakpoint[] = [
    { width: 375, name: 'mobile' },
    { width: 768, name: 'tablet' },
    { width: 1280, name: 'desktop' },
  ];

  const breakpoints = options?.breakpoints || defaultBreakpoints;
  const height = options?.height || 800;
  const skipMountCheck = options?.skipMountCheck || false;

  const results = [];

  for (const { width, name, expectedElements } of breakpoints) {
    // Set viewport
    setViewport(width, height);
    mockMatchMedia(width);

    try {
      const { container, unmount } = customRender(<Component {...props} />);

      // Basic mount check
      if (!skipMountCheck) {
        expect(container.firstChild).toBeInTheDocument();
      }

      // Check for expected elements if provided
      if (expectedElements) {
        for (const elementSelector of expectedElements) {
          const element = container.querySelector(elementSelector);
          expect(element).toBeInTheDocument();
        }
      }

      // Log success
      console.log(
        `✅ ${Component.displayName || Component.name} renders correctly on ${name} (${width}px)`
      );

      results.push({
        breakpoint: name,
        width,
        success: true,
        error: null,
      });

      // Clean up
      unmount();
    } catch (error) {
      console.error(
        `❌ ${Component.displayName || Component.name} failed on ${name} (${width}px):`,
        error
      );

      results.push({
        breakpoint: name,
        width,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      // Re-throw the error to fail the test
      throw error;
    }
  }

  return results;
};

// Component variant testing for mobile/desktop
export const testComponentVariants = async (
  Component: React.ComponentType<any>,
  mobileProps: any,
  desktopProps: any,
  options?: {
    mobileBreakpoint?: number;
    desktopBreakpoint?: number;
    mobileSelectors?: string[];
    desktopSelectors?: string[];
  }
) => {
  const mobileBreakpoint = options?.mobileBreakpoint || 375;
  const desktopBreakpoint = options?.desktopBreakpoint || 1280;
  const mobileSelectors = options?.mobileSelectors || [];
  const desktopSelectors = options?.desktopSelectors || [];

  const results = [];

  // Test mobile variant
  try {
    setViewport(mobileBreakpoint);
    mockMatchMedia(mobileBreakpoint);

    const { container: mobileContainer, unmount: unmountMobile } = customRender(
      <Component {...mobileProps} />
    );

    expect(mobileContainer.firstChild).toBeInTheDocument();

    // Check mobile-specific selectors
    for (const selector of mobileSelectors) {
      const element = mobileContainer.querySelector(selector);
      expect(element).toBeInTheDocument();
    }

    console.log(`✅ ${Component.displayName || Component.name} mobile variant works correctly`);

    results.push({
      variant: 'mobile',
      success: true,
      error: null,
    });

    unmountMobile();
  } catch (error) {
    console.error(`❌ ${Component.displayName || Component.name} mobile variant failed:`, error);

    results.push({
      variant: 'mobile',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }

  // Test desktop variant
  try {
    setViewport(desktopBreakpoint);
    mockMatchMedia(desktopBreakpoint);

    const { container: desktopContainer, unmount: unmountDesktop } = customRender(
      <Component {...desktopProps} />
    );

    expect(desktopContainer.firstChild).toBeInTheDocument();

    // Check desktop-specific selectors
    for (const selector of desktopSelectors) {
      const element = desktopContainer.querySelector(selector);
      expect(element).toBeInTheDocument();
    }

    console.log(`✅ ${Component.displayName || Component.name} desktop variant works correctly`);

    results.push({
      variant: 'desktop',
      success: true,
      error: null,
    });

    unmountDesktop();
  } catch (error) {
    console.error(`❌ ${Component.displayName || Component.name} desktop variant failed:`, error);

    results.push({
      variant: 'desktop',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }

  return results;
};

// Performance testing across viewports
export const testPerformanceAcrossViewports = async (
  Component: React.ComponentType<any>,
  props: any,
  options?: {
    viewports?: number[];
    maxRenderTime?: number;
    iterations?: number;
  }
) => {
  const viewports = options?.viewports || [375, 768, 1280];
  const maxRenderTime = options?.maxRenderTime || 50; // 50ms default
  const iterations = options?.iterations || 5;

  const results = [];

  for (const width of viewports) {
    setViewport(width);
    mockMatchMedia(width);

    const times = [];

    // Run multiple iterations for more accurate measurements
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();

      const { unmount } = customRender(<Component {...props} />);

      const endTime = performance.now();
      times.push(endTime - startTime);

      unmount();
    }

    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);

    expect(averageTime).toBeLessThan(maxRenderTime);

    console.log(
      `📊 ${
        Component.displayName || Component.name
      } performance at ${width}px: avg ${averageTime.toFixed(2)}ms (min: ${minTime.toFixed(
        2
      )}ms, max: ${maxTime.toFixed(2)}ms)`
    );

    results.push({
      width,
      averageTime,
      maxTime,
      minTime,
      times,
      withinThreshold: averageTime < maxRenderTime,
    });
  }

  return results;
};

// ResizeObserver mock for responsive components
export const mockResizeObserver = () => {
  global.ResizeObserver = class ResizeObserver {
    constructor(cb: any) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
};

// IntersectionObserver mock for responsive components
export const mockIntersectionObserver = () => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null;
    readonly rootMargin: string;
    readonly thresholds: ReadonlyArray<number>;
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.root = options?.root ?? null;
      this.rootMargin = options?.rootMargin ?? '0px';
      const threshold = options?.threshold ?? 0;
      this.thresholds = Array.isArray(threshold) ? threshold : [threshold];
    }
    observe(_: Element): void {}
    unobserve(_: Element): void {}
    disconnect(): void {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  global.IntersectionObserver = MockIntersectionObserver as unknown as {
    new (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ): IntersectionObserver;
  };
};

// Setup common mocks for responsive testing
export const setupResponsiveMocks = () => {
  mockResizeObserver();
  mockIntersectionObserver();
};

// Responsive breakpoint configuration
export const BREAKPOINTS = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
  wide: 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// Helper to get breakpoint width
export const getBreakpointWidth = (breakpoint: BreakpointKey) => BREAKPOINTS[breakpoint];

// Helper to test if viewport matches breakpoint
export const isViewportAtLeast = (width: number, breakpoint: BreakpointKey) => {
  return width >= BREAKPOINTS[breakpoint];
};

// Helper to test if viewport is at most breakpoint
export const isViewportAtMost = (width: number, breakpoint: BreakpointKey) => {
  return width <= BREAKPOINTS[breakpoint];
};

// Re-export everything from testing-library/react
export * from '@testing-library/react';
export { customRender as render, customRender };
