// web-app/lib/enforcementConfig.ts
export type EnforcementLevel = 'off' | 'warn' | 'strict';
export type LogLevel = 'error' | 'warn' | 'info';

export interface EnforcementConfig {
  defaultLevel: EnforcementLevel;
  overrides?: Record<string, EnforcementLevel>;
  productionStrict?: boolean;

  // additional options for Story 1.10
  logLevel?: LogLevel;
  collectMetrics?: boolean; // track usage/validation results
  learningMode?: boolean; // soft validation mode
}

const env = process.env.NODE_ENV ?? 'development';

export const enforcementConfig: EnforcementConfig = {
  defaultLevel: (process.env.CONTRACT_ENFORCEMENT as EnforcementLevel) ?? 'warn',
  overrides: {},
  productionStrict: false,
  logLevel: 'warn',
  collectMetrics: true,
  learningMode: true,
};

/**
 * Get enforcement level for a specific component.
 */
export function getEnforcementLevel(componentName?: string): EnforcementLevel {
  if (env === 'production' && enforcementConfig.productionStrict) return 'strict';

  if (componentName && enforcementConfig.overrides && enforcementConfig.overrides[componentName]) {
    return enforcementConfig.overrides[componentName]!;
  }

  return enforcementConfig.defaultLevel;
}

/**
 * Update enforcement config at runtime.
 * Example: setEnforcementConfig({ defaultLevel: 'strict' });
 */
export function setEnforcementConfig(newConfig: Partial<EnforcementConfig>) {
  Object.assign(enforcementConfig, newConfig);
}
