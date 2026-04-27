/**
 * Legacy FAQ Redirect Page
 *
 * Redirects legacy /faq path (without language prefix) to the default
 * language version /en/faq.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module app/(site)/faq
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy FAQ page - redirects to language-aware version
 */
export default function FaqPageRedirect() {
  redirect(`/${DEFAULT_LOCALE}/faq`);
}
