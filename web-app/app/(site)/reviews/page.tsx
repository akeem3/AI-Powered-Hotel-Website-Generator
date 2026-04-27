/**
 * Legacy Reviews Redirect Page
 *
 * Redirects legacy /reviews path (without language prefix) to the default
 * language version /en/reviews.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module app/(site)/reviews
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy reviews page - redirects to language-aware version
 */
export default function ReviewsPageRedirect() {
  redirect(`/${DEFAULT_LOCALE}/reviews`);
}
