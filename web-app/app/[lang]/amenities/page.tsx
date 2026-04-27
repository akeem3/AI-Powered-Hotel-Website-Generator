/**
 * Amenities Page (Multi-Language)
 *
 * This page displays all hotel amenities at `/{lang}/amenities`.
 * Uses Static Site Generation (SSG) via generateStaticParams to build amenities pages
 * for all available languages.
 *
 * Story 24.6: Amenities page with Amenities component grouped by category.
 *
 * Route Pattern: /{lang}/amenities
 * Example: /en/amenities, /th/amenities, /tr/amenities
 *
 * Features:
 * - All amenities via mapCmsToAmenities() grouped by category
 * - Back link to /{lang}
 * - ISR revalidation at 3600 seconds
 *
 * @module app/[lang]/amenities/page
 */

import Link from 'next/link';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { getAmenitiesPageData } from '@/lib/loaders/hotel-page';
import { getHeroAndHotelData } from '@/lib/loaders/hotel-page';
import { SITE_URL, getExtendedLocaleCode } from '@/lib/metadata/hotel-metadata';
import { buildPageCanonicalUrl, buildPageHreflangUrls, getOgImageUrl } from '@/lib/metadata/hotel-metadata';
import Amenities from '@/components/blocks/Amenities';
import type { Metadata } from 'next';

/**
 * Return type for generateStaticParams
 */
type AmenitiesPageParams = {
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
 * generateStaticParams for Amenities Page
 *
 * Generates one entry per available language for SSG build.
 * Follows the same pattern as app/[lang]/page.tsx and other sub-pages.
 *
 * @returns Array of { lang } objects for SSG
 */
export async function generateStaticParams(): Promise<AmenitiesPageParams> {
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

  const params: AmenitiesPageParams = languages.map((lang) => ({ lang }));

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: Amenities Static Generation                        │');
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
 * generateMetadata for Amenities Page
 *
 * Generates comprehensive metadata including:
 * - AC1: Page title format "Amenities & Facilities | {hotel.name}"
 * - AC2: Canonical URL {SITE_URL}/{lang}/amenities
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

  // Fetch hero and hotel data for metadata (includes availableLanguages and images)
  const heroAndHotelData = await getHeroAndHotelData(process.env.HOTEL_ID!, lang);
  const { hotel, availableLanguages, images } = heroAndHotelData;

  // Build site URL (remove trailing slash for consistency)
  const siteUrl = SITE_URL.replace(/\/$/, '');

  // AC1: Page Title - "Amenities & Facilities | {hotel.name}"
  const metaTitle = `Amenities & Facilities | ${hotel.name}`;

  // AC2: Meta Description
  const metaDescription = `Discover all the amenities and facilities available at ${hotel.name}. From comfortable rooms to excellent services, we have everything you need.`;

  // AC2: Canonical URL - {SITE_URL}/{lang}/amenities
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, 'amenities');

  // AC3: Hreflang URLs for all available languages
  const hreflangUrls = buildPageHreflangUrls(siteUrl, 'amenities', availableLanguages);

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
    keywords: `${hotel.name}, amenities, facilities, services, features`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * Amenities Page Component
 *
 * Story 24.6: Displays all hotel amenities with:
 * - All amenities via mapCmsToAmenities() grouped by category
 * - Back link to /{lang}
 *
 * @param params - Page params with language code
 * @returns Amenities page component
 */
export default async function AmenitiesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Fetch amenities page data (all amenities via mapCmsToAmenities())
  const amenitiesPageData = await getAmenitiesPageData(process.env.HOTEL_ID!);
  const { hotel, amenities } = amenitiesPageData;

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

          {/* AC: Page Title - "Amenities & Facilities | {hotel.name}" is in metadata */}
          <h1 className="text-size-display font-display text-brand-primary mb-gap-card">
            Amenities & Facilities
          </h1>

          {/* Gold Underline Accent */}
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

          {/* Description */}
          <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Experience our extensive range of amenities designed to make your stay comfortable and
            memorable. From modern facilities to attentive services, we have everything you need.
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

      {/* ===== AMENITIES SECTION ===== */}
      {/* AC: All amenities render via mapCmsToAmenities() grouped by category */}
      <section id="amenities" className="w-full">
        <Amenities
          {...amenities}
          heading="Hotel Amenities"
          subheading="Everything you need for a comfortable stay"
          showCategory={true}
        />
      </section>

      {/* ===== EMPTY STATE ===== */}
      {/* If no amenities available, show message */}
      {(!amenities || amenities.length === 0) && (
        <section className="w-full max-w-screen-xl mx-auto p-container pb-section">
          <div className="text-center py-section">
            <p className="text-text-muted italic">
              No amenities information available at the moment. Please check back soon.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
