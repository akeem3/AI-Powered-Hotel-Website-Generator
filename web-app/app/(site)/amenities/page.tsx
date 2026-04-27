/**
 * Legacy Amenities Redirect Page
 *
 * Redirects legacy /amenities path (without language prefix) to the default
 * language version /en/amenities.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module app/(site)/amenities
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy amenities page - redirects to language-aware version
 */
export default function AmenitiesPageRedirect() {
  redirect(`/${DEFAULT_LOCALE}/amenities`);
}
