/**
 * Preview Route Constants
 *
 * @trace epic: EPIC-25
 * @trace story: STORY-25.5
 *
 * Why: Shared constants for preview route components. Separating constants
 * from the page component prevents circular dependencies between client
 * components (PageNavigation) and the server component (page.tsx).
 *
 * Issue: When PageNavigation (client component) imports from app/preview/page
 * (server component), Next.js treats the entire page as a client component,
 * causing fs module import errors.
 *
 * Solution: Export shared constants from this isolated module to break
 * the circular dependency.
 */

import { type PageType } from '@/lib/generation/split-to-pages';

/**
 * Valid page types for multi-page navigation
 *
 * Array of all valid page type values that can be passed via the `page` query parameter.
 * Used for validation and page navigation UI generation.
 *
 * @example
 * // Validate a page parameter
 * if (VALID_PAGE_TYPES.includes(pageParam)) {
 *   // Page is valid
 * }
 */
export const VALID_PAGE_TYPES: readonly PageType[] = [
  'homepage',
  'rooms',
  'roomDetail',
  'gallery',
  'amenities',
  'reviews',
  'contact',
  'about',
  'faq',
] as const;
