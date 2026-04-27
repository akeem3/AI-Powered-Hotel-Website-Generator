/**
 * Content Fallback Utilities
 *
 * Provides utilities for resolving content values with multi-level fallback chains.
 * Ensures graceful degradation when content is unavailable.
 */

export type FallbackSource = 'content' | 'props' | 'default';

/**
 * Resolve content value with multi-level fallback
 *
 * Priority order:
 * 1. Content value (from JSON)
 * 2. Props value (from component props)
 * 3. Default value (hardcoded fallback)
 *
 * @param contentValue - Value from content JSON
 * @param propsValue - Value from component props
 * @param defaultValue - Hardcoded fallback value
 * @param options - Configuration options
 * @returns Resolved value
 *
 * @example
 * const title = resolveFallback(
 *   heroContent?.title,
 *   props.title,
 *   'The Sterling Executive'
 * );
 */
export function resolveFallback<T>(
  contentValue: T | undefined | null,
  propsValue: T | undefined | null,
  defaultValue: T,
  options: {
    /** Trim string values (only applies to strings) */
    trim?: boolean;
    /** Custom validation function */
    validate?: (value: T) => boolean;
    /** Callback when fallback occurs */
    onFallback?: (source: FallbackSource) => void;
  } = {}
): T {
  const { trim, validate, onFallback } = options;

  // Helper to check if value is empty (null, undefined, or whitespace-only string when trim enabled)
  const isEmpty = (value: T | undefined | null): boolean => {
    if (value === undefined || value === null) return true;
    if (trim && typeof value === 'string' && value.trim() === '') return true;
    return false;
  };

  // 1. Try content value
  if (!isEmpty(contentValue)) {
    if (validate && !validate(contentValue as T)) {
      // Content value failed validation, fall through to next
    } else {
      onFallback?.('content');
      return applyTrim(contentValue as T, trim);
    }
  }

  // 2. Try props value
  if (!isEmpty(propsValue)) {
    if (validate && !validate(propsValue as T)) {
      // Props value failed validation, fall through to next
    } else {
      onFallback?.('props');
      return applyTrim(propsValue as T, trim);
    }
  }

  // 3. Use default value (assumed to be valid)
  onFallback?.('default');
  return applyTrim(defaultValue, trim);
}

/**
 * Apply trim operation if value is a string and trim is enabled
 */
function applyTrim<T>(value: T, trim?: boolean): T {
  if (trim && typeof value === 'string') {
    return value.trim() as unknown as T;
  }
  return value;
}

/**
 * Resolve nested object value with fallback
 *
 * Useful for nested content like `hero.primaryCTA.text`
 *
 * @param contentValue - Nested object from content
 * @param propsValue - Nested object from props
 * @param defaultValue - Default nested object
 * @param keyPath - Key path for logging (e.g., 'hero.primaryCTA.text')
 * @param options - Configuration options
 * @returns Resolved nested object
 *
 * @example
 * const primaryCTA = resolveNestedFallback(
 *   heroContent?.primaryCTA,
 *   props.primaryCTA,
 *   { text: 'Book Now', href: '/booking' }
 * );
 */
export function resolveNestedFallback<T extends Record<string, unknown>>(
  contentValue: T | undefined | null,
  propsValue: T | undefined | null,
  defaultValue: T,
  keyPath?: string,
  options: {
    /** Callback when fallback occurs */
    onFallback?: (source: FallbackSource, keyPath: string) => void;
  } = {}
): T {
  const { onFallback } = options;

  // 1. Try content value
  if (contentValue && typeof contentValue === 'object') {
    onFallback?.('content', keyPath ?? '');
    return contentValue;
  }

  // 2. Try props value
  if (propsValue && typeof propsValue === 'object') {
    onFallback?.('props', keyPath ?? '');
    return propsValue;
  }

  // 3. Use default value
  onFallback?.('default', keyPath ?? '');
  return defaultValue;
}

/**
 * Merge content object with props, with props taking precedence
 *
 * @param contentObject - Object from content JSON
 * @param propsObject - Object from props
 * @returns Merged object
 *
 * @example
 * const mergedCTA = mergeWithProps(
 *   heroContent?.primaryCTA,
 *   props.primaryCTA
 * );
 */
export function mergeWithProps<T extends Record<string, unknown>>(
  contentObject: T | undefined | null,
  propsObject: Partial<T> | undefined | null
): T {
  if (!propsObject) {
    return contentObject ?? ({} as T);
  }

  if (!contentObject) {
    return propsObject as T;
  }

  return {
    ...contentObject,
    ...propsObject,
  };
}

/**
 * Resolve media reference with fallback
 *
 * Specialized fallback for media references that handles @media: syntax
 *
 * @param mediaRef - Media reference string (@media:page.asset) or URL
 * @param resolvedUrl - Resolved URL from media resolver
 * @param propsValue - Image URL from props
 * @param defaultValue - Default fallback URL
 * @param options - Configuration options
 * @returns Resolved media URL
 */
export function resolveMediaFallback(
  mediaRef: string | undefined | null,
  resolvedUrl: string | null | undefined,
  propsValue: string | undefined | null,
  defaultValue: string,
  options: {
    onFallback?: (source: FallbackSource) => void;
  } = {}
): string {
  const { onFallback } = options;

  // 1. Try resolved URL (from media resolver)
  if (resolvedUrl) {
    onFallback?.('content');
    return resolvedUrl;
  }

  // 2. Try props value
  if (propsValue) {
    onFallback?.('props');
    return propsValue;
  }

  // 3. Use default value
  onFallback?.('default');
  return defaultValue;
}
