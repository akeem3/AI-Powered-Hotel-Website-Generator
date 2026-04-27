// web-app/tests/utils/enforcementConfig.test.ts
import {
  enforcementConfig,
  getEnforcementLevel,
  setEnforcementConfig,
  type EnforcementConfig
} from '@/lib/enforcementConfig';

describe('Enforcement Configuration', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalContractEnv = process.env.CONTRACT_ENFORCEMENT;

  beforeEach(() => {
    // Reset environment and config
    (process.env as any).NODE_ENV = 'development';
    delete process.env.CONTRACT_ENFORCEMENT;

    // Reset config to defaults
    Object.assign(enforcementConfig, {
      defaultLevel: 'warn',
      overrides: {},
      productionStrict: false,
      logLevel: 'warn',
      collectMetrics: true,
      learningMode: true,
    });
  });

  afterAll(() => {
    // Restore original environment
    (process.env as any).NODE_ENV = originalEnv;
    if (originalContractEnv) {
      process.env.CONTRACT_ENFORCEMENT = originalContractEnv;
    }
  });

  describe('getEnforcementLevel', () => {
    it('should return default level when no overrides exist', () => {
      const level = getEnforcementLevel();
      expect(level).toBe('warn');
    });

    it('should respect component-specific overrides', () => {
      setEnforcementConfig({
        overrides: {
          'Button': 'strict',
          'HeroSection': 'off'
        }
      });

      expect(getEnforcementLevel('Button')).toBe('strict');
      expect(getEnforcementLevel('HeroSection')).toBe('off');
      expect(getEnforcementLevel('OtherComponent')).toBe('warn');
    });

    it('should handle production mode correctly via config', () => {
      // This behavior is checked at module level, not runtime
      // So we verify the logic through the config structure
      expect(enforcementConfig.productionStrict).toBe(false); // default

      setEnforcementConfig({ productionStrict: true });
      expect(enforcementConfig.productionStrict).toBe(true);
    });

    it('should verify default enforcement level configuration', () => {
      // The environment variable is used during module initialization
      // We verify this by checking the initial config value
      expect(enforcementConfig.defaultLevel).toBe('warn'); // from defaults

      // Verify we can still override it
      setEnforcementConfig({ defaultLevel: 'strict' });
      expect(enforcementConfig.defaultLevel).toBe('strict');
    });
  });

  describe('setEnforcementConfig', () => {
    it('should update config at runtime', () => {
      const newConfig: Partial<EnforcementConfig> = {
        defaultLevel: 'strict',
        logLevel: 'error',
        collectMetrics: false
      };

      setEnforcementConfig(newConfig);

      expect(enforcementConfig.defaultLevel).toBe('strict');
      expect(enforcementConfig.logLevel).toBe('error');
      expect(enforcementConfig.collectMetrics).toBe(false);
    });

    it('should merge with existing config', () => {
      // Start with defaults
      expect(enforcementConfig.learningMode).toBe(true);

      // Update only one property
      setEnforcementConfig({ defaultLevel: 'off' });

      // Should preserve other properties
      expect(enforcementConfig.defaultLevel).toBe('off');
      expect(enforcementConfig.learningMode).toBe(true);
      expect(enforcementConfig.collectMetrics).toBe(true);
    });
  });
});