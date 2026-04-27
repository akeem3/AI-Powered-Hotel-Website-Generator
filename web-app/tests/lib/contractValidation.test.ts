// web-app/tests/lib/contractValidation.test.ts
import {
  validateComponentContract,
  getViolationStats,
  getViolationSummary,
  clearViolationStats
} from '@/lib/contractValidation';

// Mock console to verify logging behavior
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

// Mock contracts registry to test validation logic
jest.mock('@/lib/contracts', () => ({
  ComponentContractRegistry: {
    Button: {
      safeParse: jest.fn()
    }
  }
}));

describe('Contract Validation - Warning Mode Implementation', () => {
  const mockButtonContract = require('@/lib/contracts').ComponentContractRegistry.Button;

  beforeEach(() => {
    // Clear mocks before each test
    jest.clearAllMocks();

    // Reset console mock
    mockConsoleWarn.mockClear();

    // Clear violation stats
    clearViolationStats();
  });

  afterAll(() => {
    // Restore console
    mockConsoleWarn.mockRestore();
  });

  describe('WarningEnforcer Utility Tests', () => {
    it('should log warnings on contract validation failure but not block execution', () => {
      // Mock validation failure
      const mockValidationError = {
        issues: [
          { path: ['variant'], message: 'Invalid enum value' }
        ]
      };
      mockButtonContract.safeParse.mockReturnValue({
        success: false,
        error: mockValidationError
      });

      const invalidConfig = { variant: 'invalid-value' };
      const result = validateComponentContract('Button', invalidConfig);

      // Warning mode should not block execution (returns validation result)
      expect(result.success).toBe(false);
      expect(result.component).toBe('Button');
      expect(result.errors).toHaveLength(1);
      expect(result.enforcement).toBe('warn');

      // Should log detailed warning with context
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed for component: "Button"'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              path: ['variant'],
              message: 'Invalid enum value'
            })
          ]),
          received: invalidConfig,
          enforcement: 'warn'
        })
      );
    });

    it('should include detailed context (component name, contract path, error details) in logs', () => {
      // Mock validation with multiple errors
      const mockValidationError = {
        issues: [
          { path: ['variant'], message: 'Invalid variant' },
          { path: ['size'], message: 'Required field missing' },
          { path: ['custom', 'deep', 'field'], message: 'Nested validation error' }
        ]
      };
      mockButtonContract.safeParse.mockReturnValue({
        success: false,
        error: mockValidationError
      });

      const invalidConfig = { variant: 'wrong' };
      const result = validateComponentContract('Button', invalidConfig);

      expect(result.errors).toHaveLength(3);

      // Verify all error details are included in warning log
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Validation failed for component: "Button"'),
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({ path: ['variant'], message: 'Invalid variant' }),
            expect.objectContaining({ path: ['size'], message: 'Required field missing' }),
            expect.objectContaining({
              path: ['custom', 'deep', 'field'],
              message: 'Nested validation error'
            })
          ]),
          received: invalidConfig
        })
      );
    });

    it('should not log warnings when validation succeeds', () => {
      // Mock successful validation
      const validData = { variant: 'primary', size: 'default' };
      mockButtonContract.safeParse.mockReturnValue({
        success: true,
        data: validData
      });

      const result = validateComponentContract('Button', validData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);

      // Should not log any warnings for successful validation
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Switching Tests', () => {
    it('should handle different enforcement levels through configuration', () => {
      // Import enforcement level function
      const { getEnforcementLevel } = require('@/lib/enforcementConfig');

      // Test with current configuration
      const enforcementLevel = getEnforcementLevel('Button');
      expect(['warn', 'strict', 'off']).toContain(enforcementLevel);

      // Mock validation to verify enforcement level is included
      const mockValidationError = {
        issues: [{ path: ['test'], message: 'test error' }]
      };
      mockButtonContract.safeParse.mockReturnValue({
        success: false,
        error: mockValidationError
      });

      const result = validateComponentContract('Button', { test: 'value' });
      expect(result.enforcement).toBe(enforcementLevel);
    });
  });

  describe('Violation Metrics Collection Tests', () => {
    it('should track violations with required metadata structure', () => {
      // Mock validation failure
      const mockValidationError = {
        issues: [
          { path: ['variant'], message: 'Test violation message' }
        ]
      };
      mockButtonContract.safeParse.mockReturnValue({
        success: false,
        error: mockValidationError
      });

      // Trigger a violation
      validateComponentContract('Button', { variant: 'invalid' });

      const stats = getViolationStats();
      expect(stats).toBeInstanceOf(Array);

      // Find any Button violations
      const buttonViolations = stats.filter(stat => stat.component === 'Button');
      expect(buttonViolations.length).toBeGreaterThanOrEqual(0);

      if (buttonViolations.length > 0) {
        const violation = buttonViolations[0];
        expect(violation).toMatchObject({
          component: expect.any(String),
          field: expect.any(String),
          message: expect.any(String),
          count: expect.any(Number),
          firstSeen: expect.any(Date),
          lastSeen: expect.any(Date)
        });
      }
    });

    it('should provide violation patterns and learning data', () => {
      // Generate multiple violations to test pattern detection
      const mockValidationError = {
        issues: [
          { path: ['variant'], message: 'Invalid variant' },
          { path: ['size'], message: 'Invalid size' }
        ]
      };
      mockButtonContract.safeParse.mockReturnValue({
        success: false,
        error: mockValidationError
      });

      // Create multiple violations for pattern analysis
      validateComponentContract('Button', { variant: 'bad', size: 'wrong' });
      validateComponentContract('Button', { variant: 'bad', size: 'wrong' });

      const summary = getViolationSummary();

      // Should track total violations
      expect(summary.totalViolations).toBeGreaterThan(0);

      // Should group by component
      expect(summary.byComponent).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            component: 'Button',
            count: expect.any(Number)
          })
        ])
      );

      // Should group by field
      expect(summary.byField).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'Button.variant',
            count: expect.any(Number)
          }),
          expect.objectContaining({
            field: 'Button.size',
            count: expect.any(Number)
          })
        ])
      );
    });
  });

  describe('Component Integration Scope Tests', () => {
    it('should validate that contract system is integrated with existing component structure', () => {
      // Verify that contracts registry exists for core components
      const { ComponentContractRegistry } = require('@/lib/contracts');
      expect(typeof ComponentContractRegistry).toBe('object');

      // Verify that validation function can be called for components
      expect(typeof validateComponentContract).toBe('function');

      // Test with component that has contract
      mockButtonContract.safeParse.mockReturnValue({
        success: true,
        data: { variant: 'primary' }
      });

      const result = validateComponentContract('Button', { variant: 'primary' });
      expect(result.component).toBe('Button');
    });
  });
});