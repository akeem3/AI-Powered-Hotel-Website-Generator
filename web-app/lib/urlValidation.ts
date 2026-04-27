/**
 * URL Validation Utility
 *
 * @trace epic: EPIC-07
 * @trace story: STORY-07.11
 * @trace reqs: AC10, AC12
 *
 * Why: Prevents XSS attacks via malicious URL protocols (javascript:, data:, vbscript:).
 * Critical security layer that validates all href fields before rendering, protecting
 * against session hijacking and phishing attempts. Used by ComponentRenderer to
 * sanitize navigation links, CTA buttons, and image sources.
 *
 * Security Impact: Blocks VULN-001 from security scan - XSS via unsanitized href fields.
 *
 * @example
 * ```tsx
 * import { validateUrlField, isValidSafeUrl } from '@/lib/urlValidation';
 *
 * // Validate single URL
 * const safeUrl = validateUrlField(userInput, '/fallback');
 *
 * // Check if URL is safe
 * if (isValidSafeUrl(userInput)) {
 *   renderLink({ href: userInput });
 * }
 * ```
 */

import { z } from 'zod';

/**
 * Safe URL protocols whitelist
 *
 * Only these protocols are allowed for href/src fields.
 * Rejects dangerous protocols like javascript:, data:, vbscript:, file:.
 */
export const SAFE_URL_PROTOCOLS = ['http://', 'https://', '/', '#'] as const;

/**
 * Checks if a URL starts with a safe protocol.
 *
 * @param url - URL string to validate
 * @returns true if URL starts with allowed protocol (http, https, or relative path)
 *
 * @example
 * ```tsx
 * isValidSafeUrl('https://example.com');  // true
 * isValidSafeUrl('/rooms');               // true
 * isValidSafeUrl('javascript:alert(1)');  // false
 * isValidSafeUrl('data:text/html,...');   // false
 * ```
 */
export function isValidSafeUrl(url: string): boolean {
  if (typeof url !== 'string') {
    return false;
  }

  const trimmed = url.trim().toLowerCase();
  return SAFE_URL_PROTOCOLS.some((proto) => trimmed.startsWith(proto));
}

/**
 * Zod schema for safe URL validation
 *
 * Use this schema in contracts and schemas requiring href validation.
 * Refines string type to reject dangerous protocols.
 *
 * @example
 * ```tsx
 * const safeUrlSchema = z.string()
 *   .min(1)
 *   .max(2000)
 *   .refine(isValidSafeUrl, {
 *     message: 'URL must start with http://, https://, or / (relative path). ' +
 *              'Protocols like javascript:, data:, vbscript: are not allowed.'
 *   });
 * ```
 */
export const safeUrlSchema = z
  .string()
  .min(1)
  .max(2000)
  .refine(
    (url) => isValidSafeUrl(url),
    {
      message:
        'URL must start with http://, https://, or / (relative path). ' +
        'Protocols like javascript:, data:, vbscript: are not allowed.',
    }
  );

/**
 * Validates and sanitizes a URL, returning safe fallback if invalid.
 *
 * Logs security warnings when rejecting unsafe URLs. This prevents XSS
 * attacks via javascript: or data: protocols while allowing graceful degradation.
 *
 * @param url - URL to validate (can be any type)
 * @param fallback - Safe URL to return if validation fails (defaults to '/')
 * @returns Original URL if safe, fallback if unsafe or non-string
 *
 * @example
 * ```tsx
 * const safeHref = validateUrlField(props.href, '/rooms');
 * // Returns: '/rooms' if props.href was 'javascript:alert(1)'
 * ```
 */
export function validateUrlField(
  url: unknown,
  fallback: string = '/'
): string {
  if (typeof url !== 'string') {
    console.warn('[Security] URL validation: non-string value rejected');
    return fallback;
  }

  if (!isValidSafeUrl(url)) {
    console.error(`[Security] Unsafe URL rejected: ${url.substring(0, 50)}...`);
    return fallback;
  }

  return url;
}

/**
 * Field names that should be validated as URLs
 *
 * Used by validateAllUrls for recursive deep validation.
 */
const DEFAULT_HREF_FIELDS = [
  'href',
  'url',
  'src',
  'desktopUrl',
  'mobileUrl',
  'backgroundImage',
  'image',
  'logoSrc',
] as const;

/**
 * Keys that should be rejected during recursion to prevent prototype pollution
 */
const DANGEROUS_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
]);

/**
 * Recursively validates all href/url fields in an object
 *
 * Deep traverses objects and arrays, validating all URL fields against
 * the safe protocol whitelist. Prevents XSS via nested object properties.
 *
 * @param obj - Object to validate (can be nested structure)
 * @param hrefFields - Field names to validate as URLs
 * @returns New object with all URLs validated (original is not mutated)
 *
 * @example
 * ```tsx
 * const safeProps = validateAllUrls(componentConfig.props);
 * // Validates: props.primaryCTA.href, props.navigationLinks[].href, etc.
 * ```
 */
export function validateAllUrls<T extends Record<string, unknown>>(
  obj: T,
  hrefFields: readonly string[] = DEFAULT_HREF_FIELDS
): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const result = { ...obj };

  for (const [key, value] of Object.entries(result)) {
    // Validate URL fields
    if (hrefFields.includes(key as any) && typeof value === 'string') {
      (result as Record<string, unknown>)[key] = validateUrlField(value);
    }
    // Recurse into nested objects
    else if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      // Reject prototype pollution attempts - check against dangerous keys
      !DANGEROUS_KEYS.has(key)
    ) {
      (result as Record<string, unknown>)[key] = validateAllUrls(
        value as Record<string, unknown>,
        hrefFields
      );
    }
    // Recurse into arrays
    else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'object' && item !== null
          ? validateAllUrls(item as Record<string, unknown>, hrefFields)
          : item
      );
    }
  }

  return result;
}
