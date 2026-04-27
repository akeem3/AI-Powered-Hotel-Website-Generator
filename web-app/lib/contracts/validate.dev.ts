import type { ZodType } from 'zod';
import { validateContract, DEFAULT_VALIDATION_CONFIG } from '@/lib/contractValidation';

/**
 * Dev-safe Zod validation helper
 * -------------------------------------------------------------
 * Validates a value against a Zod schema.
 * 
 * DEPRECATED: Use `validateContract` from `@/lib/contractValidation` directly.
 * This function is kept for backward compatibility and wraps `validateContract`
 * with the default configuration (WARNING mode).
 * 
 * @param schema - The Zod schema to validate against
 * @param value - The value to validate
 * @param name - Optional label for the contract (for better console output)
 * @param options - Optional settings (ignored in new implementation)
 */
export function validateInDev<T>(
  schema: ZodType<T>,
  value: unknown,
  name = 'contract',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: { skipMockLogging?: boolean; isMock?: boolean }
): T {
  // ⚡ Bolt Optimization: Skip validation in production for performance
  if (process.env.NODE_ENV === 'production') {
    return value as T;
  }
  return validateContract(schema, value, DEFAULT_VALIDATION_CONFIG, name);
}

