/**
 * Jest Simple Configuration
 *
 * Purpose: Lightweight tests without complex mocking for rapid unit testing
 * Use Case: Simple component tests, utility function tests, quick validation
 * Timeout: 5 seconds (reduced from default 10 seconds)
 *
 * @version 1.0.0
 * @author Story 1.7 Implementation
 */

const nextJest = require('next/jest.js');

// Create Next.js Jest configuration
const createJestConfig = nextJest({
  dir: './',
});

// Simple configuration optimized for fast unit tests
const simpleConfig = {
  // Core test environment (inherited from main config)
  testEnvironment: 'jsdom',

  // Faster timeout for simple tests
  testTimeout: 5000,

  // Faster test runner for simple tests
  maxWorkers: '50%', // Use half of available CPU cores for speed

  // Module name mapping for path aliases (same as main config)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },

  // Use same setup file as main config for consistency
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Clear mocks between tests for isolation
  clearMocks: true,

  // Coverage configuration for simple tests
  coverageProvider: 'v8',
  collectCoverage: false, // Disabled by default for speed

  // Test file patterns for simple tests
  testMatch: [
    // Simple unit tests
    '<rootDir>/tests/simple/**/*.test.{js,jsx,ts,tsx}',
    // Utility function tests
    '<rootDir>/tests/utils/**/*.test.{js,jsx,ts,tsx}',
    // Contract validation tests (fast)
    '<rootDir>/tests/contracts/**/*.test.{js,jsx,ts,tsx}',
    // Hybrid architecture tests (Story 14.7)
    '<rootDir>/tests/hybrid-architecture/**/*.test.{js,jsx,ts,tsx}',
    // Lib tests including loaders and mappers
    '<rootDir>/tests/lib/**/*.test.{js,jsx,ts,tsx}',
    // Scripts tests (Story 20.9)
    '<rootDir>/tests/scripts/**/*.test.{js,jsx,ts,tsx}',
  ],

  // Test path ignore patterns
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/coverage/',
    '<rootDir>/tests/langgraph/', // Exclude complex workflow tests
    '<rootDir>/tests/integration/', // Exclude integration tests
    '<rootDir>/tests/accessibility/', // Exclude accessibility tests (slower)
  ],

  // Transform ignore patterns (same as main config)
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))',
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
  ],

  // Verbose output for better debugging
  verbose: false, // Set to true for detailed output

  // Test results processor (same as main config)
  reporters: [
    'default', // Use default Jest reporter
  ],
};

// Export the configuration
module.exports = createJestConfig(simpleConfig);