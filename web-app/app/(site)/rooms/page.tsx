/**
 * Legacy Rooms Redirect Page
 *
 * Redirects legacy /rooms path (without language prefix) to the default
 * language version /en/rooms.
 *
 * Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module app/(site)/rooms
 */

import { redirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/content/locale/constants';

/**
 * Legacy rooms page - redirects to language-aware version
 */
export default function RoomsPageRedirect() {
  redirect(`/${DEFAULT_LOCALE}/rooms`);
}
