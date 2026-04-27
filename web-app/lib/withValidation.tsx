// web-app/lib/contracts/withValidation.tsx
'use client';

import React from 'react';
import { validateComponentContract, getViolationStats } from './contractValidation';
import { getEnforcementLevel } from './enforcementConfig';
import type { ValidationResult } from '@/types/validation';

type WithContractValidationOptions = {
  strict?: boolean; // optionally override enforcement per wrapper
};

/**
 * Higher Order Component to wrap any React component with runtime contract validation.
 * Respects global enforcement settings. In 'warn' mode logs warnings and tracks metrics.
 */
export function withValidation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  options: WithContractValidationOptions = {}
) {
  const ValidatedComponent: React.FC<P> = (props) => {
    // Determine effective enforcement level: wrapper option overrides global
    const globalLevel = getEnforcementLevel(componentName);
    const effectiveStrict = options.strict ?? globalLevel === 'strict';

    // Run validation and collect metrics/warnings
    const validation: ValidationResult = validateComponentContract(componentName, props);

    // If in strict mode and validation fails, throw
    if (!validation.success && effectiveStrict) {
      throw new Error(
        `[ContractViolation:${componentName}] ${validation.errors
          ?.map((e) => e.message)
          .join('\n')}`
      );
    }

    // In warn mode (default), display console warnings
    if (!validation.success && globalLevel === 'warn') {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[ContractWarning:${componentName}]`, validation.errors);
      }
    }

    return <WrappedComponent {...props} />;
  };

  ValidatedComponent.displayName = `WithValidation(${getDisplayName(WrappedComponent)})`;

  return ValidatedComponent;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getDisplayName(Component: React.ComponentType<any>) {
  return Component.displayName || Component.name || 'Component';
}

// Optional: log enforcement on app start in dev
if (process.env.NODE_ENV !== 'production') {
  console.info(
    '🔧 Contract Validation: Enforcement enabled. Current component levels:',
    getViolationStats()
  );
}
