/**
 * Legacy Homepage Redirect Page
 *
 * Redirects legacy / path (without language prefix) to the default
 * language version /en.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * The Sterling Executive Blueprint homepage was originally at / but
 * lacked navigation. Redirecting to /{lang} ensures all users land on
 * a page with proper navigation and language-aware content.
 *
 * @module app/(site)/page
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy homepage - redirects to language-aware version
 *
 * This ensures visitors always see the navbar and have access to
 * the full navigation, regardless of whether they access the site
 * via the root path or a language-prefixed path.
 */
export default function HomePageRedirect() {
  redirect(`/${DEFAULT_LOCALE}`);
}
