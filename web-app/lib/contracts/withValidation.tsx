'use client';

import React from 'react';
import { ValidationResult } from '@/types/validation';
import { validateComponentContract } from '../contractValidation';

type WithContractValidationOptions = {
  strict?: boolean;
};

/**
 * Higher Order Component to wrap any React component with runtime contract validation.
 * Logs warnings in development, throws errors in strict mode.
 */
export function withValidation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string,
  options: WithContractValidationOptions = {}
) {
  const ValidatedComponent = (props: P) => {
    const { strict = false } = options;

    const validation: ValidationResult = validateComponentContract(componentName, props);

    const errorMessages = validation.errors?.map((e) => e.message) ?? [];

    if (!validation.success) {
      if (strict) {
        throw new Error(`[ContractViolation:${componentName}] ${errorMessages.join('\n')}`);
      } else if (process.env.NODE_ENV !== 'production') {
        console.warn(`[ContractWarning:${componentName}]`, errorMessages);
      }
    }

    return <WrappedComponent {...props} />;
  };

  ValidatedComponent.displayName = `WithValidation(${getDisplayName(WrappedComponent)})`;

  return ValidatedComponent;
}

/**
 * Safely derive a component display name without using `any`.
 */
function getDisplayName<P>(Component: React.ComponentType<P>): string {
  return Component.displayName || Component.name || 'Component';
}





