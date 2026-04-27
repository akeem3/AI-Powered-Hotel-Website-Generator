import { VariableContext, ResolveVariablesOptions, ComputedVariable, SUPPORTED_COMPUTED_VARIABLES } from './types';

/** Regex for {{variable}} pattern - compiled once */
const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Check if template contains any variables
 *
 * @param template - String to check
 * @returns true if contains {{variable}} placeholders
 *
 * @example
 * hasVariables("Welcome to {{hotelName}}")  // => true
 * hasVariables("Static text only")          // => false
 */
export function hasVariables(template: string): boolean {
  // Reset regex state before testing
  VARIABLE_REGEX.lastIndex = 0;
  return VARIABLE_REGEX.test(template);
}

/**
 * Get nested value from object using dot notation path
 *
 * @param obj - Object to traverse
 * @param path - Dot notation path (e.g., "hotel.address.city")
 * @returns Found value or undefined
 *
 * @example
 * getNestedValue({ hotel: { address: { city: "NYC" } } }, "hotel.address.city")
 * // => "NYC"
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  const segments = path.split('.');
  let current: unknown = obj;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

/**
 * Resolve computed variables
 *
 * @param name - Computed variable name
 * @param context - Variable context
 * @returns Computed value
 */
function resolveComputedVariable(name: ComputedVariable, context: VariableContext): string {
  switch (name) {
    case 'locale':
      return context.locale ?? 'en';
    case 'currentYear':
      return String(new Date().getFullYear());
    default:
      return '';
  }
}

/**
 * Resolve a single variable value
 *
 * @param varName - Variable name (may include dot notation)
 * @param context - Resolution context
 * @param options - Resolution options
 * @returns Resolved value or fallback
 */
function resolveSingleVariable(
  varName: string,
  context: VariableContext,
  options: ResolveVariablesOptions
): string {
  const trimmedName = varName.trim();

  // Check computed variables first
  if (trimmedName in SUPPORTED_COMPUTED_VARIABLES) {
    return resolveComputedVariable(trimmedName as ComputedVariable, context);
  }

  // Check custom overrides
  if (context.custom && trimmedName in context.custom) {
    return String(context.custom[trimmedName]);
  }

  // Check hotel parameters (supports dot notation)
  const value = getNestedValue(context.hotelParameters, trimmedName);

  if (value === undefined || value === null) {
    // Handle missing variable based on options
    if (options.missing === 'throw') {
      throw new Error(`Required variable "${trimmedName}" is missing`);
    }

    if (options.missing === 'warn' || (options.missing === undefined && process.env.NODE_ENV === 'development')) {
      console.warn(`[resolveVariables] Missing variable: "${trimmedName}"`);
      return `[MISSING: ${trimmedName}]`;
    }

    return '';
  }

  return String(value);
}

/**
 * Resolve {{variable}} placeholders in template strings
 *
 * @param template - String containing {{variable}} placeholders
 * @param context - Resolution context with hotel parameters
 * @param options - Optional resolution configuration
 * @returns Resolved string with variables replaced
 *
 * @example
 * resolveVariables("Welcome to {{hotelName}}", context)
 * // => "Welcome to The Sterling Executive"
 *
 * @example
 * resolveVariables("{{hotel.address.city}}, {{hotel.address.country}}", context)
 * // => "New York, United States"
 *
 * @example
 * resolveVariables("© {{currentYear}} {{hotelName}}", context, { missing: 'throw' })
 * // => "© 2026 The Sterling Executive"
 */
export function resolveVariables(
  template: string,
  context: VariableContext,
  options: ResolveVariablesOptions = {}
): string {
  const {
    missing = process.env.NODE_ENV === 'development' ? 'warn' : 'empty',
    transform,
  } = options;

  // Fast path: no variables
  if (!hasVariables(template)) {
    return template;
  }

  // Reset regex for global matching
  VARIABLE_REGEX.lastIndex = 0;

  return template.replace(VARIABLE_REGEX, (_match, varName) => {
    let resolved = resolveSingleVariable(varName, context, { missing });

    // Apply transform if provided
    if (transform && resolved) {
      resolved = transform(resolved);
    }

    return resolved;
  });
}

/**
 * Resolve variables and throw if any are missing
 * Convenience function for validation scenarios
 *
 * @param template - String containing {{variable}} placeholders
 * @param context - Resolution context
 * @returns Resolved string
 * @throws Error if any variable is missing
 */
export function resolveVariablesOrThrow(
  template: string,
  context: VariableContext
): string {
  return resolveVariables(template, context, { missing: 'throw' });
}
