// web-app/tests/performance/enforcementOverhead.test.ts
import { validateComponentContract } from '@/lib/contractValidation';

// Mock contracts registry for performance testing
jest.mock('@/lib/contracts', () => ({
  ComponentContractRegistry: {
    Button: {
      safeParse: jest.fn()
    }
  }
}));

describe('Performance Tests - Enforcement System', () => {
  const mockButtonContract = require('@/lib/contracts').ComponentContractRegistry.Button;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Enforcement Overhead Benchmark', () => {
    it('should add negligible overhead (<1ms per component) for enforcement checks', () => {
      // Mock successful validation (common case)
      mockButtonContract.safeParse.mockReturnValue({
        success: true,
        data: { variant: 'primary', size: 'default' }
      });

      const iterations = 1000;
      const configs = Array.from({ length: iterations }, (_, i) => ({
        variant: 'primary',
        size: 'default',
        'data-testid': `test-${i}` // Ensure each call is unique
      }));

      // Measure enforcement validation time
      const startTime = performance.now();

      configs.forEach(config => {
        validateComponentContract('Button', config);
      });

      const endTime = performance.now();
      const totalTimeMs = endTime - startTime;
      const avgTimePerValidation = totalTimeMs / iterations;

      console.log(`Performance Test Results:
      - Total validations: ${iterations}
      - Total time: ${totalTimeMs.toFixed(2)}ms
      - Average time per validation: ${avgTimePerValidation.toFixed(4)}ms
      - Target threshold: 1.0ms
      - Performance: ${avgTimePerValidation < 1.0 ? 'PASS' : 'FAIL'}`);

      // Performance requirement: <1ms per component
      expect(avgTimePerValidation).toBeLessThan(1.0);
    });

    it('should handle validation failures efficiently', () => {
      // Mock validation failure (should still be fast)
      mockButtonContract.safeParse.mockReturnValue({
        success: false,
        error: {
          issues: [
            { path: ['variant'], message: 'Invalid variant' },
            { path: ['size'], message: 'Invalid size' }
          ]
        }
      });

      const iterations = 100;
      const configs = Array.from({ length: iterations }, (_, i) => ({
        variant: 'invalid',
        size: 'wrong',
        'data-testid': `test-${i}`
      }));

      const startTime = performance.now();

      configs.forEach(config => {
        validateComponentContract('Button', config);
      });

      const endTime = performance.now();
      const totalTimeMs = endTime - startTime;
      const avgTimePerValidation = totalTimeMs / iterations;

      console.log(`Failure Validation Performance:
      - Total validations: ${iterations}
      - Total time: ${totalTimeMs.toFixed(2)}ms
      - Average time per validation: ${avgTimePerValidation.toFixed(4)}ms`);

      // Even error cases should be fast
      expect(avgTimePerValidation).toBeLessThan(5.0);
    });
  });
});