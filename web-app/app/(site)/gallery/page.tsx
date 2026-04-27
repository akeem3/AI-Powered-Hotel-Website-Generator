/**
 * Legacy Gallery Redirect Page
 *
 * Redirects legacy /gallery path (without language prefix) to the default
 * language version /en/gallery.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module app/(site)/gallery
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy gallery page - redirects to language-aware version
 */
export default function GalleryPageRedirect() {
  redirect(`/${DEFAULT_LOCALE}/gallery`);
}
