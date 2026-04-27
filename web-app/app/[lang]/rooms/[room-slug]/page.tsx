/**
 * Room Detail Page (Multi-Language)
 *
 * This page displays detailed information for a specific room at `/{lang}/rooms/{room-slug}`.
 * Uses Static Site Generation (SSG) via generateStaticParams to build room detail pages
 * for all available rooms across all languages.
 *
 * Story 24.4: Individual room detail page with booking widget and SEO.
 *
 * Route Pattern: /{lang}/rooms/{room-slug}
 * Example: /en/rooms/deluxe-ocean-suite, /th/rooms/deluxe-ocean-suite
 *
 * Features:
 * - Room details: name, description, capacity, featured image
 * - BookingWidget pre-populated with room type
 * - Back link to /{lang}/rooms
 * - JSON-LD HotelRoom structured data for SEO
 * - ISR revalidation at 3600 seconds
 * - notFound() handling for invalid slugs
 *
 * @module app/[lang]/rooms/[room-slug]/page
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { getRoomDetailPageData } from '@/lib/loaders/hotel-page';
import { getAvailableRoomSlugs, findRoomBySlug } from '@/lib/loaders/room-slug';
import { getOgImageUrl, SITE_URL, getExtendedLocaleCode } from '@/lib/metadata/hotel-metadata';
import { buildPageCanonicalUrl, buildPageHreflangUrls } from '@/lib/metadata/hotel-metadata';
import { buildHotelRoomJsonLd } from '@/lib/metadata/hotel-metadata';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import BookingWidget from '@/components/blocks/BookingWidget';
import Image from 'next/image';
import type { Metadata } from 'next';

// Re-export types for convenience
import type { HotelRoomJsonLd } from '@/lib/metadata/hotel-metadata';

/**
 * Return type for generateStaticParams
 */
type RoomDetailPageParams = {
  lang: string;
  roomSlug: string;
}[];

/**
 * ISR Time-Based Revalidation
 *
 * Revalidates this page at most once per hour (3600 seconds).
 * Combined with on-demand revalidation via webhook (/api/revalidate).
 */
export const revalidate = 3600;

/**
 * generateStaticParams for Room Detail Page
 *
 * Generates one entry per room per language for SSG build.
 * Uses getAvailableRoomSlugs() from Story 24.1 to get all available rooms.
 *
 * @returns Array of { lang, roomSlug } objects for SSG
 */
export async function generateStaticParams(): Promise<RoomDetailPageParams> {
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

  // Get available room slugs from Story 24.1 utility
  const roomSlugs = await getAvailableRoomSlugs(hotelId);

  // Generate params for each room × each language combination
  const params: RoomDetailPageParams = [];

  for (const lang of languages) {
    for (const { slug } of roomSlugs) {
      params.push({ lang, roomSlug: slug });
    }
  }

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: Room Detail Static Generation                     │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log(`  Hotel Name:    ${hotelData.hotel.name}`);
  console.log(`  Hotel ID:      ${hotelId}`);
  console.log(`  Languages:     ${languages.join(', ')}`);
  console.log(`  Rooms:         ${roomSlugs.length}`);
  console.log(`  Total Pages:   ${params.length}`);
  console.log('───────────────────────────────────────────────────────────');
  console.log('');

  return params;
}

/**
 * generateMetadata for Room Detail Page
 *
 * Generates comprehensive metadata including:
 * - AC1: Page title format "{roomName} | {hotel.name}"
 * - AC2: Canonical URL {SITE_URL}/{lang}/rooms/{roomSlug}
 * - AC3: Hreflang links point to /{availableLang}/rooms/{roomSlug}
 * - AC4: OG image uses room's featured_image (fallback to hotel primary)
 *
 * @param params - Page params with language and room slug
 * @returns Next.js Metadata object
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; roomSlug: string }>;
}): Promise<Metadata> {
  const { lang, roomSlug } = await params;

  // Fetch room detail page data (includes null handling for invalid slugs)
  const roomPageData = await getRoomDetailPageData(process.env.HOTEL_ID!, lang, roomSlug);

  // If room not found, notFound() will be called in the page component
  // Return minimal metadata for consistency
  if (!roomPageData.room) {
    return {
      title: 'Room Not Found',
    };
  }

  const { hotel, room, availableLanguages, images } = roomPageData;

  // Build site URL (remove trailing slash for consistency)
  const siteUrl = SITE_URL.replace(/\/$/, '');

  // AC1: Page Title - "{roomName} | {hotel.name}"
  const metaTitle = `${room.name} | ${hotel.name}`;

  // AC2: Meta Description
  const metaDescription =
    room.description ||
    `Book your stay in our ${room.name}. ${hotel.name} offers comfortable accommodations for your perfect getaway.`;

  // AC2: Canonical URL - {SITE_URL}/{lang}/rooms/{roomSlug}
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, `rooms/${roomSlug}`);

  // AC3: Hreflang URLs for all available languages (with room slug)
  const hreflangUrls = buildPageHreflangUrls(siteUrl, `rooms/${roomSlug}`, availableLanguages);

  // AC4: OG image - room's featured_image (fallback to hotel primary)
  // Use room featured_image first, fall back to hotel images
  let ogImageUrl: string | undefined;

  if (room.featured_image) {
    // Build full URL from room featured_image path
    ogImageUrl = `${siteUrl}/images/${room.featured_image}`;
  } else if (images && images.length > 0) {
    // Use hotel's primary image as fallback
    ogImageUrl = getOgImageUrl(siteUrl, images);
  }

  // AC3: Open Graph tags
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

    // AC3: Open Graph tags
    openGraph,

    // Additional metadata
    keywords: `${room.name}, ${hotel.name}, room, booking, accommodation`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * Room Detail Page Component
 *
 * Story 24.4: Displays detailed room information with:
 * - Room details: name, description, capacity, featured image
 * - Back link to /{lang}/rooms
 * - BookingWidget for that room type
 * - JSON-LD HotelRoom structured data
 *
 * If room slug is invalid (returns null from getRoomDetailPageData),
 * calls notFound() to show 404 page.
 *
 * @param params - Page params with language and room slug
 * @returns Room detail page component or 404
 */
export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ lang: string; roomSlug: string }>;
}) {
  const { lang, roomSlug } = await params;

  // Fetch room detail page data (returns null room if slug invalid)
  const roomPageData = await getRoomDetailPageData(process.env.HOTEL_ID!, lang, roomSlug);

  // AC: Return notFound() if room slug does not match any active room
  if (!roomPageData.room) {
    notFound();
  }

  const { hotel, room, roomProps, availableLanguages, images } = roomPageData;

  // Build site URL for structured data
  const siteUrl = SITE_URL.replace(/\/$/, '');

  // ============================================
  // JSON-LD STRUCTURED DATA (Story 24.4)
  // ============================================
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, `rooms/${roomSlug}`);

  // AC4: OG image uses room's featured_image if available, fallback to hotel primary
  let roomImageUrl: string | undefined;
  if (room.featured_image) {
    roomImageUrl = `${siteUrl}/images/${room.featured_image}`;
  } else if (images && images.length > 0) {
    roomImageUrl = `${siteUrl}/images/${images[0].id}`;
  }

  // Build HotelRoom JSON-LD structured data
  const roomJsonLd: HotelRoomJsonLd = buildHotelRoomJsonLd(
    {
      name: room.name,
      description: room.description,
      roomType: room.room_type,
      capacityAdults: room.capacity_adults || 0,
      capacityChildren: room.capacity_children || 0,
      image: roomImageUrl,
    },
    canonicalUrl
  );

  return (
    <>
      {/* AC4: JSON-LD HotelRoom Structured Data for SEO (Story 24.4) */}
      <JsonLdScript jsonLd={roomJsonLd} />

      <main
        role="main"
        data-mode="light"
        className="min-h-screen flex flex-col items-center justify-start bg-surface-primary text-text-primary"
      >
        {/* ===== BACK LINK ===== */}
        {/* AC: Back link to /{lang}/rooms */}
        <div className="w-full max-w-screen-xl mx-auto p-container pt-section">
          <Link
            href={`/${lang}/rooms`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors duration-200"
            aria-label="Back to rooms listing"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to All Rooms</span>
          </Link>
        </div>

        {/* ===== ROOM HEADER ===== */}
        <section className="w-full max-w-screen-xl mx-auto p-container pb-section">
          {/* Section Header */}
          <div className="text-center mb-gap-section">
            {/* Gold Accent Bar */}
            <div className="flex items-center justify-center mb-gap-card">
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
              <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            </div>

            {/* AC: Room name renders */}
            <h1 className="text-size-display font-display text-brand-primary mb-gap-card">
              {room.name}
            </h1>

            {/* Gold Underline Accent */}
            <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

            {/* Room type badge */}
            <div className="inline-block">
              <span className="text-size-caption text-brand-secondary bg-surface-secondary/50 px-gap-card py-1 rounded-lg uppercase tracking-wide">
                {room.room_type}
              </span>
            </div>
          </div>
        </section>

        {/* ===== ROOM IMAGE ===== */}
        {/* AC: Room image renders (featured_image) */}
        {room.featured_image && (
          <section className="w-full max-w-screen-xl mx-auto px-container pb-section">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-md">
              <Image
                src={`/images/${room.featured_image}`}
                alt={room.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          </section>
        )}

        {/* ===== ROOM DETAILS ===== */}
        <section className="w-full max-w-screen-lg mx-auto p-container pb-section">
          <div className="grid md:grid-cols-3 gap-gap-section">
            {/* Left Column: Description */}
            <div className="md:col-span-2">
              <div className="bg-surface-secondary/mid rounded-lg p-gap-card">
                <h2 className="text-size-h2 font-display text-brand-primary mb-gap-card">
                  Room Details
                </h2>
                {/* AC: Room description renders */}
                {room.description ? (
                  <p className="text-text-secondary text-size-body leading-relaxed whitespace-pre-line">
                    {room.description}
                  </p>
                ) : (
                  <p className="text-text-muted italic">
                    No description available for this room type.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Capacity & Booking */}
            <div className="space-y-gap-section">
              {/* Capacity Information */}
              <div className="bg-surface-secondary/mid rounded-lg p-gap-card">
                <h3 className="text-size-h3 font-display text-brand-primary mb-gap-card">
                  Capacity
                </h3>
                {/* AC: Room capacity renders */}
                <div className="space-y-gap-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Adults</span>
                    <span className="text-text-primary font-medium">{room.capacity_adults || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Children</span>
                    <span className="text-text-primary font-medium">{room.capacity_children || 0}</span>
                  </div>
                  <div className="pt-gap-sm border-t border-border-default">
                    <div className="flex justify-between items-center">
                      <span className="text-brand-secondary font-medium">Total</span>
                      <span className="text-brand-primary font-display">
                        {(room.capacity_adults || 0) + (room.capacity_children || 0)} guests
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AC: BookingWidget is rendered for that room type */}
              <div className="bg-surface-primary rounded-lg shadow-md border border-border-default p-gap-card">
                <h3 className="text-size-h3 font-display text-brand-primary mb-gap-card text-center">
                  Book This Room
                </h3>
                <BookingWidget
                  defaultValues={{
                    roomType: room.room_type,
                  }}
                  theme="light"
                  variant="desktop"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
