import '@testing-library/jest-dom';

// Polyfill fetch for e2e tests that make real API calls
// Required for OpenRouterClient and other HTTP clients in test environment
if (typeof (global as any).fetch === 'undefined') {
  // Use native Node.js fetch (available in Node 18+)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch');
  (global as any).fetch = nodeFetch.default || nodeFetch;
  (global as any).Headers = nodeFetch.Headers;
  (global as any).Request = nodeFetch.Request;
  (global as any).Response = nodeFetch.Response;
}

// Polyfill TextEncoder and TextDecoder for LangGraph/LangChain compatibility
// These are required by LangGraph dependencies in Node.js/JSDOM environment
if (typeof (global as any).TextEncoder === 'undefined') {
  const { TextEncoder: NodeTextEncoder, TextDecoder: NodeTextDecoder } = require('util');
  (global as any).TextEncoder = NodeTextEncoder;
  (global as any).TextDecoder = NodeTextDecoder;
}

// Polyfill ReadableStream for LangGraph compatibility
if (typeof (global as any).ReadableStream === 'undefined') {
  const { ReadableStream: NodeReadableStream } = require('stream/web');
  (global as any).ReadableStream = NodeReadableStream as any;
}

// Enhanced window.location mock that handles assignment attempts gracefully
if (typeof window !== 'undefined') {
  const mockLocation = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    reload: jest.fn(),
    replace: jest.fn(),
    assign: jest.fn(),
  };

  // Create a proxy to intercept window.location assignment attempts
  // This prevents "Not implemented: navigation" errors from JSDOM
  try {
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });
  } catch (e) {
    // If defineProperty fails (JSDOM often has location non-configurable),
    // we still have the default JSDOM location mock, which is sufficient
    // Tests can still override window.location by using 'delete' followed by assignment
  }
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  root: Element | null = null;
  rootMargin: string = '0px';
  thresholds: ReadonlyArray<number> = [0];

  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock window.matchMedia safely (only if window is defined)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Mock next/navigation for router operations
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useParams: jest.fn(() => ({})),
}));

// Mock langfuse package to prevent ESM dynamic import errors in Jest
// E2E tests should focus on workflow behavior, not observability infrastructure
jest.mock('langfuse', () => {
  const mockTrace = {
    id: 'mock-trace-id',
    update: jest.fn(),
    generation: jest.fn(() => ({
      end: jest.fn(),
    })),
    score: jest.fn(),
    event: jest.fn(),
  };

  return {
    Langfuse: jest.fn().mockImplementation(() => ({
      trace: jest.fn(() => mockTrace),
      getPrompt: jest.fn().mockRejectedValue(new Error('Mock: Prompt not found')),
      flush: jest.fn().mockResolvedValue(undefined),
      shutdown: jest.fn().mockResolvedValue(undefined),
    })),
  };
});

// Suppress console warnings for specific known issues
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Convert args to string for checking
    const errorString = args.map(arg =>
      typeof arg === 'string' ? arg : String(arg)
    ).join(' ');

    // Suppress JSDOM navigation errors since we're mocking window.location and next/navigation
    if (errorString.includes('Not implemented: navigation')) {
      return;
    }
    // Suppress Next.js Image component warnings in React 19 + JSDOM (known compatibility issue)
    if ((errorString.includes('Received') && errorString.includes('non-boolean attribute') && errorString.includes('fill')) ||
        (errorString.includes('Received') && errorString.includes('non-boolean attribute') && errorString.includes('priority'))) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
