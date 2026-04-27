/**
 * Legacy Contact Redirect Page
 *
 * Redirects legacy /contact path (without language prefix) to the default
 * language version /en/contact.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module app/(site)/contact
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy contact page - redirects to language-aware version
 */
export default function ContactPageRedirect() {
  redirect(`/${DEFAULT_LOCALE}/contact`);
}
