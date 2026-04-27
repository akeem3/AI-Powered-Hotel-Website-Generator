/**
 * Legacy About Redirect Page
 *
 * Redirects legacy /about path (without language prefix) to the default
 * language version /en/about.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module app/(site)/about
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy about page - redirects to language-aware version
 */
export default function AboutPageRedirect() {
  redirect(`/${DEFAULT_LOCALE}/about`);
}
