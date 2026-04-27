/**
 * Language Segment Layout
 *
 * This layout wraps all pages under the [lang] dynamic segment.
 * It provides navigation, language context, and wraps children with ContentProvider.
 *
 * Story 24.11: Navigation Extension with All Sub-Page Links
 * Story 24.13: Legacy redirect stubs for backward compatibility
 *
 * Features:
 * - Navigation component with all 8 links (Home, Rooms, Gallery, Amenities, Reviews, Contact, About, FAQ)
 * - Navigation links are auto-prefixed with currentLang
 * - ContentProvider provides language context and hotel ID
 * - Footer with classic variant on all pages
 * - Accessibility skip link for navigation
 *
 * Route Pattern: /{lang}
 * Example: /en, /th, /tr, /ru
 *
 * @module app/[lang]/layout
 */

import { NavigationProvider } from '@/components/providers/NavigationProvider';
import Navigation from '@/components/blocks/Navigation';
import Footer from '@/components/blocks/Footer';
import { ContentProvider } from '@/lib/content';
import type { Locale } from '@/lib/content/locale';

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  return (
    <div data-lang={lang} className="flex min-h-screen flex-col">
      <NavigationProvider
        variant={{ style: 'solid', layout: 'classic' }}
        currentLang={lang}
      >
        {/* Accessibility: Skip Navigation Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only absolute top-gap-card/2 left-gap-card/2 bg-brand-secondary text-text-inverted px-gap-card py-2 rounded-xl z-nav focus-ring"
        >
          Skip to main content
        </a>

        {/* Epic 18/24.11 Navigation with all 8 sub-page links */}
        <header className="sticky top-0 z-nav" role="banner">
          <Navigation
            brandName="Sterling Executive"
            links={[
              { label: 'Home', href: '/' },
              { label: 'Rooms', href: '/rooms' },
              { label: 'Gallery', href: '/gallery' },
              { label: 'Amenities', href: '/amenities' },
              { label: 'Reviews', href: '/reviews' },
              { label: 'Contact', href: '/contact' },
              { label: 'About', href: '/about' },
              { label: 'FAQ', href: '/faq' },
            ]}
            ctaButton={{ text: 'Book', href: '/book' }}
            variant={{ style: 'solid', layout: 'classic' }}
          />
        </header>

        {/* Main Content with ContentProvider */}
        <ContentProvider hotelId={process.env.HOTEL_ID || 'hotel-sterling-123'} defaultLocale={lang as Locale}>
          <main id="main-content" className="flex-1">
            {children}
          </main>
        </ContentProvider>

        {/* Footer with classic variant */}
        <Footer
          hotelName="Sterling Executive"
          variant={{ layout: 'classic' }}
          socialLinks={[
            { platform: 'facebook', url: 'https://facebook.com/sterlingexecutive' },
            { platform: 'instagram', url: 'https://instagram.com/sterlingexecutive' },
          ]}
          navigationLinks={[
            { label: 'Home', href: '/' },
            { label: 'Rooms', href: '/rooms' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Amenities', href: '/amenities' },
            { label: 'Reviews', href: '/reviews' },
            { label: 'Contact', href: '/contact' },
          ]}
        />
      </NavigationProvider>
    </div>
  );
}
