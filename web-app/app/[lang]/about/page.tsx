/**
 * About Page (Multi-Language)
 *
 * This page displays the hotel's story at `/{lang}/about`.
 * Uses Static Site Generation (SSG) via generateStaticParams to build about pages
 * for all available languages.
 *
 * Story 24.9: About page with HotelInfo component or Epic 19 About block.
 *
 * Route Pattern: /{lang}/about
 * Example: /en/about, /th/about, /tr/about
 *
 * Features:
 * - Hotel description and history via mapCmsToHotelInfo()
 * - Epic 19 About block if available, otherwise HotelInfo fallback
 * - Extended description from getContentVariant()
 * - Back link to /{lang}
 * - ISR revalidation at 3600 seconds
 *
 * @module app/[lang]/about/page
 */

import Link from 'next/link';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { SITE_URL, getExtendedLocaleCode } from '@/lib/metadata/hotel-metadata';
import { buildPageCanonicalUrl, buildPageHreflangUrls, getOgImageUrl } from '@/lib/metadata/hotel-metadata';
import { getHotelPageData } from '@/lib/loaders/hotel-page';
import { mapCmsToHotelInfo } from '@/lib/mappers/hotel-info.mapper';
import { getContentVariant } from '@/lib/cms-api/transformers';
import HotelInfo from '@/components/sections/HotelInfo';
import type { Metadata } from 'next';

/**
 * Return type for generateStaticParams
 */
type AboutPageParams = {
  lang: string;
}[];

/**
 * ISR Time-Based Revalidation
 *
 * Revalidates this page at most once per hour (3600 seconds).
 * Combined with on-demand revalidation via webhook (/api/revalidate).
 */
export const revalidate = 3600;

/**
 * generateStaticParams for About Page
 *
 * Generates one entry per available language for SSG build.
 * Follows the same pattern as app/[lang]/page.tsx and other sub-pages.
 *
 * @returns Array of { lang } objects for SSG
 */
export async function generateStaticParams(): Promise<AboutPageParams> {
  const hotelId = process.env.HOTEL_ID;

  if (!hotelId) {
    throw new Error(
      'SSG Build Error: HOTEL_ID environment variable is required.\n' +
        'Please add HOTEL_ID to your .env.local file.\n' +
        'Example: HOTEL_ID=09f207c1-695a-485a-9519-49f4ef03331f',
    );
  }

  const hotelData = await getHotelFull(hotelId);
  const languages = getAvailableLanguages(hotelData.content);

  if (languages.length === 0) {
    throw new Error(
      `SSG Build Error: Hotel "${hotelData.hotel.name}" has no available content.\n` +
        'At least one language with content is required for SSG.',
    );
  }

  const params: AboutPageParams = languages.map((lang) => ({ lang }));

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: About Static Generation                           │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log(`  Hotel Name:    ${hotelData.hotel.name}`);
  console.log(`  Hotel ID:      ${hotelId}`);
  console.log(`  Languages:     ${languages.join(', ')}`);
  console.log(`  Total Pages:   ${params.length}`);
  console.log('───────────────────────────────────────────────────────────');
  console.log('');

  return params;
}

/**
 * generateMetadata for About Page
 *
 * Generates comprehensive metadata including:
 * - AC1: Page title format "About {hotel.name}"
 * - AC2: Canonical URL {SITE_URL}/{lang}/about
 * - AC3: Hreflang links for all available languages
 * - AC4: OG tags with type "website"
 *
 * @param params - Page params with language code
 * @returns Next.js Metadata object
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;

  // Fetch minimal hotel data for metadata
  const hotelData = await getHotelFull(process.env.HOTEL_ID!);
  const { hotel, images } = hotelData;
  const availableLanguages = getAvailableLanguages(hotelData.content);

  // Build site URL (remove trailing slash for consistency)
  const siteUrl = SITE_URL.replace(/\/$/, '');

  // AC1: Page Title - "About {hotel.name}"
  const metaTitle = `About ${hotel.name}`;

  // AC2: Meta Description
  const metaDescription = `Learn about ${hotel.name}'s story, history, and commitment to exceptional hospitality. Discover what makes our hotel special.`;

  // AC2: Canonical URL - {SITE_URL}/{lang}/about
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, 'about');

  // AC3: Hreflang URLs for all available languages
  const hreflangUrls = buildPageHreflangUrls(siteUrl, 'about', availableLanguages);

  // AC4: OG image URL
  const ogImageUrl = getOgImageUrl(siteUrl, images);

  // AC4: Open Graph tags with type "website"
  const openGraph: {
    title: string;
    description: string;
    locale: string;
    type: string;
    url: string;
    siteName?: string;
    images?: { url: string }[];
  } = {
    title: metaTitle,
    description: metaDescription,
    locale: getExtendedLocaleCode(lang),
    type: 'website',
    url: canonicalUrl,
  };

  // Add OG image if available
  if (ogImageUrl) {
    openGraph.images = [{ url: ogImageUrl }];
    openGraph.siteName = hotel.name;
  }

  return {
    // AC1: Page Title
    title: metaTitle,

    // AC2: Meta Description
    description: metaDescription,

    // AC2: Canonical URL
    alternates: {
      canonical: canonicalUrl,
      // AC3: Hreflang tags for all available languages
      languages: hreflangUrls,
    },

    // AC4: Open Graph tags with type "website"
    openGraph,

    // Additional metadata
    keywords: `${hotel.name}, about, history, story, our story, hotel information`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * About Page Component
 *
 * Story 24.9: Displays hotel story and history with:
 * - Epic 19 About block if available (conditional rendering)
 * - HotelInfo fallback if About block not available
 * - Extended description from getContentVariant()
 * - Back link to /{lang}
 *
 * @param params - Page params with language code
 * @returns About page component
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Fetch hotel page data
  const hotelPageData = await getHotelPageData(process.env.HOTEL_ID!, lang);
  const { hotel, content } = hotelPageData;

  // Get extended description content using getContentVariant()
  const extendedDescription = getContentVariant(content, lang, 'extended');

  // Map CMS data to HotelInfo props
  const hotelInfoProps = mapCmsToHotelInfo({
    hotelData: hotelPageData,
    heading: 'About Our Hotel',
  });

  // Attempt to dynamically import the About block from Epic 19
  let AboutBlock: React.ComponentType<any> | null = null;
  try {
    const aboutModule = await import('@/components/sections/About');
    AboutBlock = aboutModule.default;
  } catch {
    // About block not found (Epic 19 not installed or file doesn't exist)
    // Will use HotelInfo fallback
  }

  return (
    <main
      role="main"
      data-mode="light"
      className="min-h-screen flex flex-col items-center justify-start bg-surface-primary text-text-primary"
    >
      {/* ===== PAGE HEADER ===== */}
      <section className="w-full max-w-screen-xl mx-auto p-container py-section">
        {/* Section Header with Premium Styling */}
        <div className="text-center mb-gap-section">
          {/* Gold Accent Bar */}
          <div className="flex items-center justify-center mb-gap-card">
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
          </div>

          {/* AC: Page Title - "About {hotel.name}" is in metadata, display is simplified */}
          <h1 className="text-size-display font-display text-brand-primary mb-gap-card">
            About {hotel.name}
          </h1>

          {/* Gold Underline Accent */}
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

          {/* Description */}
          <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Discover our story, history, and commitment to exceptional hospitality.
            Experience the warmth and luxury that sets us apart.
          </p>
        </div>

        {/* Back Link - AC: Back link to /{lang} */}
        <div className="text-center">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors duration-200"
            aria-label="Back to homepage"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </section>

      {/* ===== ABOUT CONTENT ===== */}
      {AboutBlock && extendedDescription ? (
        /* AC: Epic 19 About block if available */
        <section id="about" className="w-full">
          <AboutBlock
            heading="Our Story"
            content={extendedDescription}
            image={hotelInfoProps.hotel.parsedAddress.street ? `/images/about-${hotel.slug}.jpg` : undefined}
            variant={{ layout: 'side-by-side', imagePosition: 'right' }}
            highlights={[
              { label: 'Established', value: hotel.opening_year?.toString() || 'N/A' },
              { label: 'Star Rating', value: `${hotel.star_rating} Stars` },
            ]}
          />
        </section>
      ) : (
        /* AC: HotelInfo fallback if About block not available */
        <HotelInfo {...hotelInfoProps} />
      )}

      {/* ===== EMPTY STATE ===== */}
      {/* If no description available, show message */}
      {!extendedDescription && (
        <section className="w-full max-w-screen-xl mx-auto p-container pb-section">
          <div className="text-center py-section">
            <p className="text-text-muted italic">
              No hotel description available at the moment. Please check back soon.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
