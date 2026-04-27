/**
 * Rooms Listing Page (Multi-Language)
 *
 * This page displays all available rooms at `/{lang}/rooms`.
 * Uses Static Site Generation (SSG) via generateStaticParams to
 * build rooms pages for all available languages.
 *
 * Story 24.3: Rooms listing page with full room display.
 *
 * Route Pattern: /{lang}/rooms
 * Example: /en/rooms, /th/rooms, /tr/rooms, /ru/rooms
 *
 * Features:
 * - All active rooms rendered via mapCmsToRooms() without limit
 * - Page title: "Rooms & Suites | {hotel.name}"
 * - Back link to /{lang}
 * - JSON-LD ItemList structured data for SEO
 * - ISR revalidation at 3600 seconds
 *
 * @module app/[lang]/rooms/page
 */

import Link from 'next/link';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { getRoomsPageData } from '@/lib/loaders/hotel-page';
import { generateRoomSlugs } from '@/lib/loaders/room-slug';
import { getOgImageUrl } from '@/lib/metadata/hotel-metadata';
import { SITE_URL } from '@/lib/metadata/hotel-metadata';
import { buildPageCanonicalUrl } from '@/lib/metadata/hotel-metadata';
import { buildPageHreflangUrls } from '@/lib/metadata/hotel-metadata';
import { buildRoomsItemListJsonLd } from '@/lib/metadata/hotel-metadata';
import { getExtendedLocaleCode } from '@/lib/metadata/hotel-metadata';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import RoomCard from '@/components/blocks/RoomCard';
import BookingWidget from '@/components/blocks/BookingWidget';
import type { Metadata } from 'next';

// Re-export types for convenience
import type { RoomForItemList } from '@/lib/metadata/hotel-metadata';

/**
 * Return type for generateStaticParams
 */
type RoomsPageParams = {
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
 * generateStaticParams for Rooms Listing Page
 *
 * Generates one entry per available language for SSG build.
 * Follows the same pattern as app/[lang]/page.tsx.
 *
 * @returns Array of { lang } objects for SSG
 */
export async function generateStaticParams(): Promise<RoomsPageParams> {
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

  const params: RoomsPageParams = languages.map((lang) => ({ lang }));

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: Rooms Listing Static Generation                    │');
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
 * generateMetadata for Rooms Listing Page
 *
 * Generates comprehensive metadata including:
 * - AC1: Page Title format "Rooms & Suites | {hotel.name}"
 * - AC2: Canonical URL {SITE_URL}/{lang}/rooms
 * - AC3: Hreflang links for all available languages at /{availableLang}/rooms
 * - AC4: Open Graph tags with type "website"
 *
 * @param params - Page params with language code
 * @returns Next.js Metadata object
 */
export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params;

  // Fetch rooms page data (includes hotel info)
  const roomsPageData = await getRoomsPageData(process.env.HOTEL_ID!, lang);
  const { hotel, availableLanguages } = roomsPageData;

  // Build site URL (remove trailing slash for consistency)
  const baseUrl = SITE_URL.replace(/\/$/, '');

  // AC1: Page Title - "Rooms & Suites | {hotel.name}"
  const metaTitle = `Rooms & Suites | ${hotel.name}`;

  // AC2: Meta Description
  const metaDescription = `Explore all available rooms and suites at ${hotel.name}. Find the perfect accommodation for your stay.`;

  // AC2: Canonical URL - {SITE_URL}/{lang}/rooms
  const canonicalUrl = buildPageCanonicalUrl(baseUrl, lang, 'rooms');

  // AC3: Hreflang URLs for all available languages
  const hreflangUrls = buildPageHreflangUrls(baseUrl, 'rooms', availableLanguages);

  // AC3: Open Graph image URL
  const ogImageUrl = getOgImageUrl(baseUrl, roomsPageData.images);

  // AC3: Open Graph tags with type "website"
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

    // AC3: Open Graph tags with type "website"
    openGraph,

    // Additional metadata
    keywords: `${hotel.name}, rooms, suites, accommodation, booking`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * Rooms Listing Page Component
 *
 * Story 24.3: Displays all available rooms with:
 * - All rooms via mapCmsToRooms() without limit
 * - Back link to /{lang}
 * - Room cards (detail page links added in Story 24.4 Phase 4)
 * - JSON-LD ItemList structured data
 *
 * @param params - Page params with language code
 * @returns Rooms listing page component
 */
export default async function RoomsListingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Fetch rooms page data (all rooms, no limit)
  const roomsPageData = await getRoomsPageData(process.env.HOTEL_ID!, lang);
  const { hotel, rooms, availableLanguages, images } = roomsPageData;

  // Build site URL for structured data
  const siteUrl = SITE_URL.replace(/\/$/, '');

  // Generate room slugs for ItemList and future detail page links
  const hotelData = await getHotelFull(process.env.HOTEL_ID!);
  const slugToRoomMap = generateRoomSlugs(hotelData.rooms);

  // Prepare room data for ItemList JSON-LD
  const roomsForItemList: RoomForItemList[] = rooms.rooms.map((room) => {
    const slug = Array.from(slugToRoomMap.entries()).find(([_, roomData]) => roomData.id === room.id)?.[0];

    return {
      id: room.id,
      name: room.name,
      slug: slug || room.id,
      description: room.description,
      image: room.image,
    };
  });

  // ============================================
  // JSON-LD STRUCTURED DATA (Story 24.3 AC4)
  // ============================================
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, 'rooms');
  const ogImageUrl = getOgImageUrl(siteUrl, images);

  // Build ItemList JSON-LD structured data
  const roomsJsonLd = buildRoomsItemListJsonLd(
    roomsForItemList,
    siteUrl,
    lang,
    `Rooms & Suites - ${hotel.name}`,
    `Browse all available rooms and suites at ${hotel.name}. Find your perfect accommodation.`
  );

  return (
    <>
      {/* AC4: JSON-LD ItemList Structured Data for SEO (Story 24.3) */}
      <JsonLdScript jsonLd={roomsJsonLd} />

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

            {/* Main Heading - AC: "Rooms & Suites | {hotel.name}" is in metadata, display is simplified */}
            <h1 className="text-size-display font-display text-brand-primary mb-gap-card">
              Rooms & Suites
            </h1>

            {/* Gold Underline Accent */}
            <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

            {/* Description */}
            <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of comfort and elegance in our thoughtfully designed rooms
              and suites. Each accommodation is crafted to ensure your stay is both relaxing and
              memorable.
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

        {/* ===== BOOKING WIDGET ===== */}
        {/* Booking widget for searching and booking rooms */}
        <section className="w-full max-w-screen-xl mx-auto p-container pb-section">
          <BookingWidget
            variant="desktop"
            theme="light"
            defaultValues={{
              checkIn: undefined,
              checkOut: undefined,
              adults: 2,
              children: 0,
              rooms: 1,
            }}
          />
        </section>

        {/* ===== ROOMS GRID ===== */}
        {/* Story 24.3 Phase 4: Room cards wrapped in Links to detail pages */}
        {/* AC: All active rooms render via mapCmsToRooms() without limit */}
        {/* AC: Each room card links to /{lang}/rooms/{room-slug} */}
        <section id="rooms" className="w-full max-w-screen-xl mx-auto p-container pb-section">
          <h2 className="sr-only">Rooms & Suites</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-section">
            {rooms.rooms.map((room) => {
              // Find the slug for this room
              const slug = Array.from(slugToRoomMap.entries()).find(
                ([_, roomData]) => roomData.id === room.id
              )?.[0];

              // Build detail page URL
              const detailPageUrl = slug ? `/${lang}/rooms/${slug}` : null;

              // Render room card with or without link based on slug availability
              return detailPageUrl ? (
                <Link
                  key={room.id}
                  href={detailPageUrl}
                  className="block group hover:scale-[1.02] transition-transform duration-standard"
                  aria-label={`View details for ${room.name}`}
                >
                  <RoomCard {...room} variant="detailed" />
                </Link>
              ) : (
                <div key={room.id} className="opacity-60">
                  <RoomCard {...room} variant="detailed" />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
