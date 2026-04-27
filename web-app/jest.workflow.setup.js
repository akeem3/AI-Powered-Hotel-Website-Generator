/**
 * Jest Workflow Setup
 *
 * Purpose: Setup file for LangGraph workflow testing with cost monitoring
 * Features: Cost monitoring reset, LLM service mocks, state management
 *
 * @version 1.0.0
 * @author Story 1.7 Implementation
 */

// CRITICAL: Mock LangFuse BEFORE any imports to avoid dynamic import errors
// LangFuse uses dynamic imports which are incompatible with Jest's CommonJS mode
jest.mock('langfuse', () => {
  const mockImplementation = () => ({
    trace: jest.fn().mockReturnValue({
      id: 'mock-trace-id',
      span: jest.fn().mockReturnValue({
        end: jest.fn(),
        update: jest.fn(),
      }),
      update: jest.fn(),
      event: jest.fn(),
      generation: jest.fn().mockReturnValue({
        end: jest.fn(),
        update: jest.fn(),
      }),
      score: jest.fn(),
    }),
    getPrompt: jest.fn().mockResolvedValue({
      compile: jest.fn().mockReturnValue('Mock compiled prompt'),
      prompt: 'Mock prompt template',
    }),
    flush: jest.fn().mockResolvedValue(undefined),
    flushAsync: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn().mockResolvedValue(undefined),
    shutdownAsync: jest.fn().mockResolvedValue(undefined),
  });
  return {
    Langfuse: jest.fn().mockImplementation(mockImplementation),
    LangFuse: jest.fn().mockImplementation(mockImplementation),
  };
});

// Import standard testing library setup
require('@testing-library/jest-dom');

// Add TextEncoder and TextDecoder globals for LangGraph/LangChain compatibility in JSDOM
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Add ReadableStream global
const { ReadableStream } = require('stream/web');
global.ReadableStream = ReadableStream;



// Mock cost monitoring for workflow tests
const mockCostMonitor = {
  reset: jest.fn(),
  getTotalCost: jest.fn().mockReturnValue(0),
  trackCost: jest.fn(),
  activateEmergencyStop: jest.fn(),
  isEmergencyStopActive: jest.fn().mockReturnValue(false),
  getUsage: jest.fn().mockReturnValue({
    totalTokens: 0,
    totalCost: 0,
    modelUsage: {}
  })
};

// Mock LangGraph agents for workflow testing
const mockLangGraphAgents = {
  InputAnalyzer: jest.fn().mockImplementation(() => ({
    analyzeInput: jest.fn().mockResolvedValue({
      hotelProfile: { category: 'resort' },
      confidence: 0.8,
      metadata: { cost: 0.5 }
    })
  })),

  ComponentSelector: jest.fn().mockImplementation(() => ({
    selectComponents: jest.fn().mockResolvedValue([
      { name: 'HeroSection', variant: 'centered' },
      { name: 'RoomCard', variant: 'detailed' }
    ])
  })),

  StylingAgent: jest.fn().mockImplementation(() => ({
    generateStyling: jest.fn().mockResolvedValue({
      css: '/* Generated CSS */',
      tokens: { primary: 'oklch(0.346 0.074 256)' }
    })
  })),

  AssemblyAgent: jest.fn().mockImplementation(() => ({
    assembleComponents: jest.fn().mockResolvedValue({
      html: '<html>Generated page</html>',
      components: ['HeroSection', 'RoomCard']
    })
  })),

  QualityValidator: jest.fn().mockImplementation(() => ({
    validateOutput: jest.fn().mockResolvedValue({
      score: 0.9,
      issues: [],
      passed: true
    })
  }))
};

// Mock LLM service for workflow testing
const mockLLMService = {
  generateCompletion: jest.fn().mockResolvedValue({
    content: 'Generated content',
    usage: { totalTokens: 300, promptTokens: 100, completionTokens: 200 },
    cost: 0.01
  }),

  analyzeInput: jest.fn().mockResolvedValue({
    analysis: 'Input analysis',
    confidence: 0.85
  }),

  validateQuality: jest.fn().mockResolvedValue({
    isValid: true,
    score: 0.9,
    feedback: []
  })
};

// Mock LangFuse integration for workflow testing
const mockLangFuse = {
  trace: jest.fn().mockReturnValue({
    span: jest.fn(),
    update: jest.fn(),
  }),

  flush: jest.fn().mockResolvedValue(undefined),
};

// Global setup before all workflow tests
beforeAll(() => {
  // Set up global mocks
  global.console = {
    ...console,
    // Suppress console.log in tests unless explicitly needed
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };

  // Mock fetch API for LLM calls
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      choices: [{ message: { content: 'Mock LLM response' } }],
      usage: { total_tokens: 100 }
    }),
    headers: new Map(),
    status: 200,
    statusText: 'OK',
  });
});

// Setup before each workflow test
beforeEach(() => {
  // Reset all mocks
  jest.clearAllMocks();

  // Reset cost monitor (critical for workflow tests)
  mockCostMonitor.reset();

  // Reset LangFuse mocks
  mockLangFuse.trace.mockClear();

  // Set default mock return values
  mockCostMonitor.getTotalCost.mockReturnValue(0);
  mockCostMonitor.isEmergencyStopActive.mockReturnValue(false);

  // Mock LangGraph prototype methods (required pattern from CLAUDE.md)
  if (mockLangGraphAgents.InputAnalyzer.prototype) {
    mockLangGraphAgents.InputAnalyzer.prototype.analyzeInput = jest.fn()
      .mockResolvedValue({
        hotelProfile: { category: 'resort' },
        confidence: 0.8,
        metadata: { cost: 0.5 }
      });
  }

  if (mockLangGraphAgents.ComponentSelector.prototype) {
    mockLangGraphAgents.ComponentSelector.prototype.selectComponents = jest.fn()
      .mockResolvedValue([
        { name: 'HeroSection', variant: 'centered' },
        { name: 'RoomCard', variant: 'detailed' }
      ]);
  }

  if (mockLangGraphAgents.QualityValidator.prototype) {
    mockLangGraphAgents.QualityValidator.prototype.validateOutput = jest.fn()
      .mockResolvedValue({
        score: 0.9,
        issues: [],
        passed: true
      });
  }
});

// Cleanup after each workflow test
afterEach(() => {
  // Cleanup any side effects
  jest.restoreAllMocks();

  // Reset fetch mock only if it's a jest mock (has mockClear method)
  // Integration tests may restore real fetch which won't have mockClear
  if (global.fetch && typeof global.fetch.mockClear === 'function') {
    global.fetch.mockClear();
  }
});

// Global cleanup after all workflow tests
afterAll(() => {
  // Restore original console
  global.console = require('console');
});

// Export mocks for use in test files
module.exports = {
  mockCostMonitor,
  mockLangGraphAgents,
  mockLLMService,
  mockLangFuse,
};