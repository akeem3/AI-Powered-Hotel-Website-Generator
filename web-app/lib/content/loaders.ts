/**
 * Server-Side Content Loaders
 *
 * These functions fetch content JSON files on the server side for use in
 * Server Components. They mirror the client-side usePageContent hook but
 * work in Node.js environment during SSR/SSG.
 *
 * Content JSON files are stored at: /public/content/{hotelId}/pages/{pageId}/content.{locale}.json
 *
 * @module lib/content/loaders
 */

import { HomepageContentSchema, type HomepageContent } from './schemas';
import { DEFAULT_LOCALE, type Locale } from './locale';

/**
 * Server-side loader for page content JSON
 *
 * Fetches content JSON files from the public directory. Used by Server Components
 * that need access to content system data without using client-side hooks.
 *
 * @param hotelId - Hotel unique identifier
 * @param pageId - Page identifier (e.g., "homepage")
 * @param locale - Locale code (e.g., "en", "es"). Defaults to "en"
 * @returns Content object or null if not found
 *
 * @example
 * ```tsx
 * // In a Server Component
 * import { getPageContent } from '@/lib/content/loaders';
 *
 * const content = await getPageContent('hotel-123', 'homepage', 'en');
 * const amenitiesHeading = content?.sections?.amenities?.heading;
 * ```
 */
export async function getPageContent(
  hotelId: string,
  pageId: string,
  locale: Locale = DEFAULT_LOCALE
): Promise<HomepageContent | null> {
  // Try locale-specific file first, then fallback to default
  const localeUrl = `/content/${hotelId}/pages/${pageId}/content.${locale}.json`;
  const fallbackUrl = `/content/${hotelId}/pages/${pageId}/content.json`;

  let data: unknown = null;
  let triedUrls: string[] = [];

  // Try locale-specific file first
  try {
    const localeResponse = await fetch(localeUrl);
    if (localeResponse.ok) {
      data = await localeResponse.json();
      triedUrls.push(localeUrl);
    }
  } catch {
    // Continue to fallback
  }

  // Try fallback file if locale-specific didn't work
  if (!data) {
    try {
      const fallbackResponse = await fetch(fallbackUrl);
      if (fallbackResponse.ok) {
        data = await fallbackResponse.json();
        triedUrls.push(fallbackUrl);
      }
    } catch {
      // Continue to null return
    }
  }

  // Return null if no data found
  if (!data) {
    return null;
  }

  // Validate against schema
  const validationResult = HomepageContentSchema.safeParse(data);

  if (!validationResult.success) {
    // Log validation errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[getPageContent] Validation failed:', validationResult.error);
      console.error('[getPageContent] Invalid data from:', triedUrls);
    }
    return null;
  }

  return validationResult.data;
}

/**
 * Get section content with graceful fallback to defaults
 *
 * Convenience function that extracts section content and falls back to
 * provided defaults if content is not available.
 *
 * @param hotelId - Hotel unique identifier
 * @param pageId - Page identifier
 * @param sectionKey - Section key (e.g., "amenities", "testimonials")
 * @param defaults - Default values to use if content not found
 * @param locale - Locale code
 * @returns Section content or defaults
 *
 * @example
 * ```tsx
 * const amenitiesSection = await getSectionContent(
 *   'hotel-123',
 *   'homepage',
 *   'amenities',
 *   { heading: 'Our Amenities', subheading: 'Discover our facilities' }
 * );
 * ```
 */
export async function getSectionContent<T extends Record<string, unknown>>(
  hotelId: string,
  pageId: string,
  sectionKey: 'amenities' | 'testimonials' | 'contact',
  defaults: T,
  locale: Locale = DEFAULT_LOCALE
): Promise<T> {
  const content = await getPageContent(hotelId, pageId, locale);

  if (!content?.sections?.[sectionKey]) {
    return defaults;
  }

  return (content.sections[sectionKey] as T) ?? defaults;
}
