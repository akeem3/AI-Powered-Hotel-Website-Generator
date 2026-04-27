import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const config: Config = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  clearMocks: true,
  coverageProvider: 'v8',

  // Exclude E2E tests - run with workflow config for serial execution
  testPathIgnorePatterns: [
    '<rootDir>/tests/simple/',
    '<rootDir>/tests/langgraph/',
    '<rootDir>/tests/e2e/',
  ],

  // Story 1.7 Coverage Thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },

  // Coverage collection configuration
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

  // Coverage reporting
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
  ],

  // Test patterns for main config (exclusions handled in testPathIgnorePatterns)
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,jsx,ts,tsx}',
  ],
};

export default createJestConfig(config);
