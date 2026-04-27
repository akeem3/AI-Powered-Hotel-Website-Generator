import { ContentProvider } from '@/lib/content';

/**
 * Site Layout - Wraps Sterling Executive pages with ContentProvider.
 *
 * This route group layout applies to pages that need ContentProvider but NOT navigation.
 * Navigation is now provided by app/[lang]/layout.tsx for all language-prefixed pages.
 * This layout is used for legacy redirect stubs (rooms, contact) and the Sterling Executive homepage.
 *
 * @module app/(site)/layout
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ContentProvider hotelId={process.env.HOTEL_ID || 'hotel-sterling-123'}>
      {children}
    </ContentProvider>
  );
}
