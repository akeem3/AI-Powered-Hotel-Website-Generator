import { VariableContext, ResolveVariablesOptions, ResolverContext } from './types';
import { resolveVariables, hasVariables as hasVariablePlaceholder } from './variable-resolver';
import { isMediaRef, resolveMediaRef } from './media-resolver';

/**
 * Deep resolve all variables in content object
 *
 * Walks through entire object tree and resolves:
 * - {{variable}} placeholders in strings
 * - @media: references in strings
 *
 * @param content - Content object to resolve
 * @param context - Resolver context with variables and manifest
 * @param options - Optional variable resolution options
 * @returns New object with all variables resolved
 *
 * @example
 * const content = {
 *   hero: {
 *     headline: "Welcome to {{name}}",
 *     backgroundImage: "@media:homepage.hero"
 *   }
 * };
 * const resolved = resolveContent(content, context);
 * // => {
 * //   hero: {
 * //     headline: "Welcome to The Sterling Executive",
 *     backgroundImage: "https://cdn.../hero.webp"
 * //   }
 * // }
 */
export function resolveContent<T extends Record<string, unknown>>(
  content: T,
  context: ResolverContext,
  options: ResolveVariablesOptions = {}
): T {
  // Use a deep walk to resolve all values
  const resolved = deepResolveValue(content, context, options, [], new Set());
  return resolved as T;
}

/**
 * Recursively resolve a value
 *
 * @param value - Value to resolve
 * @param context - Resolver context
 * @param options - Resolution options
 * @param path - Current path for debugging (prevents circular refs)
 * @param visited - Set of visited object references for circular detection
 * @returns Resolved value
 */
function deepResolveValue(
  value: unknown,
  context: ResolverContext,
  options: ResolveVariablesOptions,
  path: string[],
  visited: Set<unknown>
): unknown {
  // Skip null/undefined
  if (value === null || value === undefined) {
    return value;
  }

  // Resolve strings
  if (typeof value === 'string') {
    return resolveStringValue(value, context, options, path);
  }

  // Resolve arrays recursively
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      deepResolveValue(item, context, options, [...path, String(index)], visited)
    );
  }

  // Resolve objects recursively with circular reference detection
  if (typeof value === 'object') {
    // Check for circular references
    if (visited.has(value)) {
      // Return the value as-is to prevent infinite recursion
      return value;
    }

    // Mark this object as visited
    visited.add(value);

    const resolved: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      resolved[key] = deepResolveValue(val, context, options, [...path, key], visited);
    }

    return resolved;
  }

  // Return primitives as-is (numbers, booleans, etc.)
  return value;
}

/**
 * Resolve a string value (handles both variables and media refs)
 */
function resolveStringValue(
  value: string,
  context: ResolverContext,
  options: ResolveVariablesOptions,
  path: string[]
): string {
  const originalValue = value;
  let resolved = value;

  // Resolve @media: references first (they don't contain {{variables}})
  if (isMediaRef(resolved)) {
    const mediaResolved = resolveMediaRef(resolved, context.mediaManifest);

    if (mediaResolved) {
      resolved = mediaResolved.url;

      // Notify debug callback if provided
      if (context.onResolve) {
        context.onResolve(path.join('.'), originalValue, resolved);
      }

      return resolved;
    }

    // Media reference not found - return original (will be handled by caller or show as broken)
    return originalValue;
  }

  // Resolve {{variable}} placeholders
  if (hasVariablePlaceholder(resolved)) {
    resolved = resolveVariables(resolved, context.variables, options);

    // Notify debug callback if provided and value changed
    if (context.onResolve && resolved !== originalValue) {
      context.onResolve(path.join('.'), originalValue, resolved);
    }
  }

  return resolved;
}

/**
 * Resolve content and validate result (throws if validation fails)
 *
 * @param content - Content object to resolve
 * @param context - Resolver context
 * @param schema - Zod schema to validate against
 * @returns Validated resolved content
 * @throws Error if resolution produces invalid content
 */
export function resolveContentAndValidate<T extends Record<string, unknown>, S>(
  content: T,
  context: ResolverContext,
  schema: { safeParse: (data: unknown) => { success: boolean; data?: S; error?: unknown } }
): S {
  const resolved = resolveContent(content, context, { missing: 'throw' });
  const result = schema.safeParse(resolved);

  if (!result.success || !result.data) {
    throw new Error(`Resolved content failed validation: ${result.error}`);
  }

  return result.data;
}
