/**
 * Jest Workflow Configuration
 *
 * Purpose: LangGraph workflow testing with complex mocking and extended timeouts
 * Use Case: Multi-agent workflow testing, LLM integration tests, cost monitoring
 * Timeout: 120 seconds (extended for LLM operations)
 *
 * @version 1.0.0
 * @author Story 1.7 Implementation
 */

const nextJest = require('next/jest.js');

// Create Next.js Jest configuration
const createJestConfig = nextJest({
  dir: './',
});

// Workflow configuration optimized for LangGraph testing
const workflowConfig = {
  // Core test environment (inherited from main config)
  testEnvironment: 'jsdom',

  // Enable experimental VM modules for LangFuse ES module support
  // Required for LangFuse dynamic imports to work in Jest
  experimentalVmModules: true,

  // Extended timeout for LLM operations and complex workflows
  testTimeout: 300000, // 5 minutes for LLM operations (AC2 requirement)

  // Serial execution for workflow tests (prevents race conditions)
  maxWorkers: 1, // Run tests serially for state management

  // Module name mapping for path aliases (same as main config)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Custom setup file for workflow-specific requirements
  setupFilesAfterEnv: ['<rootDir>/jest.workflow.setup.js'],

  // Clear mocks between tests for isolation
  clearMocks: true,

  // Coverage configuration for workflow tests
  coverageProvider: 'v8',
  collectCoverage: false, // Disabled by default (workflow tests can be expensive)

  // Test file patterns for workflow and LangGraph tests
  testMatch: [
    // Consolidated LangGraph and Workflow tests
    '<rootDir>/tests/langgraph/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/tests/e2e/**/*.test.{js,jsx,ts,tsx}',
  ],


  // Test path ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/tests/simple/', // Exclude simple unit tests
    '<rootDir>/tests/utils/', // Exclude utility tests
  ],

  // Transform ignore patterns (same as main config)
  // Updated to handle ES modules from langfuse and related packages
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|langfuse|@langfuse))',
  ],

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Coverage collection when enabled
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'types/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{js,jsx,ts,tsx}',
    '!app/layout.tsx', // Exclude root layout
    '!middleware.ts', // Exclude middleware if exists
  ],

  // Coverage reporting (when enabled)
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'json', // Additional JSON for detailed analysis
  ],

  // Verbose output for better debugging in complex workflows
  verbose: true, // Enabled for detailed workflow debugging

  // Test results processor
  reporters: [
    'default', // Use default Jest reporter
  ],

  // Global test variables for workflow testing
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    },
  },

  // Test environment options for better LLM testing
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
    resources: 'usable',
    runScripts: 'dangerously',
  },

  // Mock patterns for LangGraph testing
  modulePathIgnorePatterns: ['<rootDir>/dist/'],

  // Error handling for workflow tests
  errorOnDeprecated: true,

  // Force exit after workflow tests (prevents hanging)
  forceExit: true,

  // Detect open handles that prevent test exit
  detectOpenHandles: true,

  // Detect leaks in workflow tests
  detectLeaks: false, // Disabled due to complex object graphs in workflows

  // Maximum number of concurrent test workers (reduced for stability)
  maxConcurrency: 1,

  // Note: Retry configuration handled at test level for flaky LLM tests

  // Test sequencing
  randomize: false, // Disable randomization for consistent workflow testing
};

// Export the configuration
module.exports = createJestConfig(workflowConfig);