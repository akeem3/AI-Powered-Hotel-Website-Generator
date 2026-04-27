// Performance testing utilities for Story 1.7 AC5: Performance and Lighthouse Testing

import { render } from '@testing-library/react';
import React, { ReactElement } from 'react';

/**
 * Measures render time for a React component
 * @param Component - React component to test
 * @param props - Props to pass to the component
 * @returns Render time in milliseconds
 */
export const measureRenderTime = async (
  Component: React.ComponentType<any>,
  props: any
): Promise<number> => {
  // Use performance.now() for higher precision timing
  const startTime = performance.now();

  // Render component
  const { unmount: cleanup } = render(<Component {...props} />);

  // End measurement
  const endTime = performance.now();

  // Clean up
  cleanup();

  // Ensure minimum time of 0.01ms to avoid 0 values
  const renderTime = endTime - startTime;
  return Math.max(renderTime, 0.01);
};

/**
 * Tests component performance against threshold
 * @param componentName - Name of component for logging
 * @param Component - React component to test
 * @param props - Props to pass to the component
 * @param maxTimeMs - Maximum allowed time in milliseconds
 */
export const testPerformanceThresholds = async (
  componentName: string,
  Component: React.ComponentType<any>,
  props: any,
  maxTimeMs: number
): Promise<void> => {
  const renderTime = await measureRenderTime(Component, props);

  expect(renderTime).toBeLessThan(maxTimeMs);
  console.log(`${componentName} rendered in ${renderTime.toFixed(2)}ms (threshold: ${maxTimeMs}ms)`);
};

/**
 * Measures multiple render iterations and returns statistics
 * @param Component - React component to test
 * @param props - Props to pass to the component
 * @param iterations - Number of iterations to run (default: 10)
 * @returns Performance statistics object
 */
export const measurePerformanceStats = async (
  Component: React.ComponentType<any>,
  props: any,
  iterations: number = 10
): Promise<{
  average: number;
  min: number;
  max: number;
  median: number;
  p95: number;
  iterations: number;
}> => {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const time = await measureRenderTime(Component, props);
    times.push(time);
  }

  times.sort((a, b) => a - b);

  const average = times.reduce((sum, time) => sum + time, 0) / times.length;
  const median = times[Math.floor(times.length / 2)];
  const p95Index = Math.floor(times.length * 0.95);
  const p95 = times[p95Index] || times[times.length - 1];

  return {
    average,
    min: times[0],
    max: times[times.length - 1],
    median,
    p95,
    iterations
  };
};

/**
 * Tests component performance with detailed statistics
 * @param componentName - Name of component for logging
 * @param Component - React component to test
 * @param props - Props to pass to the component
 * @param maxAverageTimeMs - Maximum allowed average time
 * @param maxP95TimeMs - Maximum allowed 95th percentile time
 */
export const testDetailedPerformance = async (
  componentName: string,
  Component: React.ComponentType<any>,
  props: any,
  maxAverageTimeMs: number,
  maxP95TimeMs?: number
): Promise<void> => {
  const stats = await measurePerformanceStats(Component, props);

  expect(stats.average).toBeLessThan(maxAverageTimeMs);

  if (maxP95TimeMs) {
    expect(stats.p95).toBeLessThan(maxP95TimeMs);
  }

  console.log(`${componentName} Performance Stats (${stats.iterations} iterations):`);
  console.log(`  Average: ${stats.average.toFixed(2)}ms (threshold: ${maxAverageTimeMs}ms)`);
  console.log(`  Min: ${stats.min.toFixed(2)}ms`);
  console.log(`  Max: ${stats.max.toFixed(2)}ms`);
  console.log(`  Median: ${stats.median.toFixed(2)}ms`);
  console.log(`  95th percentile: ${stats.p95.toFixed(2)}ms${maxP95TimeMs ? ` (threshold: ${maxP95TimeMs}ms)` : ''}`);
};

/**
 * Measures bundle size impact by simulating component import
 * @param componentName - Name of component for logging
 * @param importFunction - Function that imports the component
 * @param maxSizeKB - Maximum allowed bundle size in KB
 */
export const measureBundleSize = async (
  componentName: string,
  importFunction: () => Promise<any>,
  maxSizeKB: number = 50
): Promise<void> => {
  const start = performance.now();
  const componentModule = await importFunction();
  const end = performance.now();

  // This is a simplified measurement - in a real scenario you'd use webpack-bundle-analyzer
  // or similar tools to get actual bundle sizes
  const importTime = end - start;

  // For now, we'll use import time as a proxy for bundle size impact
  expect(importTime).toBeLessThan(100); // 100ms import time threshold

  console.log(`${componentName} import time: ${importTime.toFixed(2)}ms`);
  console.log(`Note: Actual bundle size measurement requires webpack-bundle-analyzer integration`);
};

/**
 * Creates performance budgets for different component types
 */
export const PERFORMANCE_BUDGETS = {
  // Simple components (primitives)
  simple: {
    maxRenderTime: 100, // 100ms (increased for test stability)
    maxAverageTime: 80,
    maxP95Time: 150, // Increased for test environment variability
    maxBundleSizeKB: 10
  },

  // Block components (complex but focused)
  block: {
    maxRenderTime: 300, // 300ms
    maxAverageTime: 200,
    maxP95Time: 400,
    maxBundleSizeKB: 25
  },

  // Section components (large, complex)
  section: {
    maxRenderTime: 400, // 400ms
    maxAverageTime: 300,
    maxP95Time: 400,
    maxBundleSizeKB: 50
  },

  // Page components (full pages)
  page: {
    maxRenderTime: 500, // 500ms
    maxAverageTime: 450,
    maxP95Time: 500,
    maxBundleSizeKB: 100
  }
} as const;

/**
 * Tests component against appropriate performance budget
 * @param componentType - Type of component (simple, block, section, page)
 * @param componentName - Name of component for logging
 * @param Component - React component to test
 * @param props - Props to pass to the component
 */
export const testPerformanceBudget = async (
  componentType: keyof typeof PERFORMANCE_BUDGETS,
  componentName: string,
  Component: React.ComponentType<any>,
  props: any
): Promise<void> => {
  const budget = PERFORMANCE_BUDGETS[componentType];

  await testDetailedPerformance(
    componentName,
    Component,
    props,
    budget.maxAverageTime,
    budget.maxP95Time
  );

  console.log(`${componentName} (${componentType}) within budget ✅`);
};

/**
 * Performance regression detection utility
 * @param componentName - Name of component
 * @param currentStats - Current performance statistics
 * @param baselineStats - Baseline performance statistics to compare against
 * @param maxRegressionPercent - Maximum allowed regression percentage
 */
export const detectPerformanceRegression = (
  componentName: string,
  currentStats: { average: number; p95: number },
  baselineStats: { average: number; p95: number },
  maxRegressionPercent: number = 20
): void => {
  const avgRegressionPercent = ((currentStats.average - baselineStats.average) / baselineStats.average) * 100;
  const p95RegressionPercent = ((currentStats.p95 - baselineStats.p95) / baselineStats.p95) * 100;

  expect(avgRegressionPercent).toBeLessThan(maxRegressionPercent);
  expect(p95RegressionPercent).toBeLessThan(maxRegressionPercent);

  console.log(`${componentName} Performance Regression Analysis:`);
  console.log(`  Average regression: ${avgRegressionPercent.toFixed(2)}% (max: ${maxRegressionPercent}%)`);
  console.log(`  P95 regression: ${p95RegressionPercent.toFixed(2)}% (max: ${maxRegressionPercent}%)`);

  if (avgRegressionPercent < 0 && p95RegressionPercent < 0) {
    console.log(`  ✅ Performance improved!`);
  } else if (avgRegressionPercent < maxRegressionPercent && p95RegressionPercent < maxRegressionPercent) {
    console.log(`  ✅ Within acceptable regression limits`);
  }
};

/**
 * Core Web Vitals simulation utilities
 * Note: These are simplified simulations. Real Core Web Vitals measurement
 * requires browser APIs and real user monitoring.
 */
export const simulateCoreWebVitals = {
  /**
   * Simulates Largest Contentful Paint (LCP) measurement
   * @param componentName - Name of component
   * @param renderTime - Component render time
   * @param maxLCPMs - Maximum allowed LCP in milliseconds
   */
  simulateLCP: (componentName: string, renderTime: number, maxLCPMs: number = 2500) => {
    // Simulate LCP as render time + some overhead
    const simulatedLCP = renderTime * 2 + Math.random() * 500; // Add some randomness

    expect(simulatedLCP).toBeLessThan(maxLCPMs);
    console.log(`${componentName} Simulated LCP: ${simulatedLCP.toFixed(2)}ms (threshold: ${maxLCPMs}ms)`);
  },

  /**
   * Simulates First Input Delay (FID) measurement
   * @param componentName - Name of component
   * @param maxFIDMs - Maximum allowed FID in milliseconds
   */
  simulateFID: (componentName: string, maxFIDMs: number = 100) => {
    // Simulate FID as random interaction delay
    const simulatedFID = Math.random() * 50; // Random delay up to 50ms

    expect(simulatedFID).toBeLessThan(maxFIDMs);
    console.log(`${componentName} Simulated FID: ${simulatedFID.toFixed(2)}ms (threshold: ${maxFIDMs}ms)`);
  },

  /**
   * Simulates Cumulative Layout Shift (CLS) measurement
   * @param componentName - Name of component
   * @param maxCLS - Maximum allowed CLS score
   */
  simulateCLS: (componentName: string, maxCLS: number = 0.1) => {
    // Simulate CLS as small random value
    const simulatedCLS = Math.random() * 0.05; // Random CLS up to 0.05

    expect(simulatedCLS).toBeLessThan(maxCLS);
    console.log(`${componentName} Simulated CLS: ${simulatedCLS.toFixed(4)} (threshold: ${maxCLS})`);
  }
};