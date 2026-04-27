/**
 * Hotel Detail Page
 *
 * This page displays detailed information about a specific hotel
 * in a specific language. It uses Static Site Generation (SSG)
 * via generateStaticParams to build pages for all available languages.
 *
 * Route Pattern: /{lang}/hotels/{slug}
 * Example: /en/hotels/thaproban-beach-house
 *
 * Story 14.7: Hybrid Architecture - This page demonstrates the proper
 * separation of Server Components (SSG content from CMS) and Client
 * Components (dynamic features like BookingWidget, Maps, Gallery).
 *
 * @module app/[lang]/hotels/[slug]/page
 */

import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import {
  getHotelPageData,
  hasValidImages,
} from '@/lib/loaders/hotel-page';
import type { Metadata } from 'next';
import { getExtendedLocaleCode } from '@/lib/metadata';
import { JsonLdScript } from '@/components/seo/JsonLdScript';

// Server Components (SEO-critical content)
import HeroSection from '@/components/sections/HeroSection';
import { Amenities } from '@/components/blocks/Amenities';
import FeaturedRooms from '@/components/sections/RoomsGrid';
import HotelInfo from '@/components/sections/HotelInfo';
import ContactMap from '@/components/sections/ContactMap';

// Client Components (interactive features)
import BookingWidget from '@/components/blocks/BookingWidget';
import ImageGallery from '@/components/blocks/ImageGallery';
import { Testimonials } from '@/components/blocks/Testimonials';

/**
 * ISR Time-Based Revalidation
 *
 * Revalidates this page at most once per hour (3600 seconds).
 * Combined with on-demand revalidation via webhook (/api/revalidate).
 *
 * Story 14.5, AC1: Time-based ISR revalidation for hotel detail pages.
 *
 * This ensures:
 * - Content stays fresh with hourly checks
 * - Fast response times with cached static pages
 * - On-demand updates when CMS content changes (via webhook)
 */
export const revalidate = 3600;

/**
 * Return type for generateStaticParams
 *
 * Each object represents a single route with populated dynamic segments:
 * - lang: The language code (e.g., 'en', 'th', 'ja')
 * - slug: The hotel's URL slug (e.g., 'thaproban-beach-house')
 */
type HotelPageParams = {
  lang: string;
  slug: string;
}[];

/**
 * generateStaticParams for Hotel Detail Page
 *
 * This function runs at build time to generate static HTML for each
 * language variant of the deployed hotel. It follows the per-hotel
 * deployment model where HOTEL_ID identifies the single hotel being built.
 *
 * @returns Array of params objects, one for each language variant
 *
 * @throws Error if HOTEL_ID is missing or hotel is not active
 */
export async function generateStaticParams(): Promise<HotelPageParams> {
  const hotelId = process.env.HOTEL_ID!;

  if (!hotelId) {
    throw new Error(
      'SSG Build Error: HOTEL_ID environment variable is required.\n' +
        'Please add HOTEL_ID to your .env.local file.\n' +
        'Example: HOTEL_ID=09f207c1-695a-485a-9519-49f4ef03331f',
    );
  }

  const hotelData = await getHotelFull(hotelId);

  if (hotelData.hotel.status !== 'active') {
    throw new Error(
      `SSG Build Error: Hotel "${hotelData.hotel.name}" is not active.\n` +
        `Current status: ${hotelData.hotel.status}\n` +
        'Only active hotels can be built.',
    );
  }

  const languages = getAvailableLanguages(hotelData.content);

  if (languages.length === 0) {
    throw new Error(
      `SSG Build Error: Hotel "${hotelData.hotel.name}" has no available content.\n` +
      'At least one language with content is required for SSG.',
    );
  }

  const slug = hotelData.hotel.slug;

  const params: HotelPageParams = languages.map((lang) => ({
    lang,
    slug,
  }));

  // AC8: Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────┐');
  console.log('│  SSG: Hotel Page Static Generation                      │');
  console.log('└─────────────────────────────────────────┘');
  console.log(`  Hotel Name:    ${hotelData.hotel.name}`);
  console.log(`  Hotel ID:      ${hotelId}`);
  console.log(`  Hotel Slug:    ${slug}`);
  console.log(`  Star Rating:   ${hotelData.hotel.star_rating} ★`);
  console.log(`  Status:        ${hotelData.hotel.status}`);
  console.log(`  Languages:     ${languages.join(', ')}`);
  console.log(`  Total Pages:   ${params.length}`);
  console.log(`  Property Type: ${hotelData.hotel.property_type}`);
  console.log(
    `  Location:      ${hotelData.hotel.parsedAddress.city}, ${hotelData.hotel.parsedAddress.country}`,
  );
  console.log('───────────────────────────────────────────────────');
  console.log('');

  return params;
}

export async function generateMetadata(
  { params }: { params: Promise<{ lang: string; slug: string }> }
): Promise<Metadata> {
  const { lang, slug } = await params;

  // Fetch hotel page data using the loader (Story 14.4)
  const hotelPageData = await getHotelPageData(process.env.HOTEL_ID!, lang);

  // Destructure data for easier access
  const { hotel, hero, images, availableLanguages } = hotelPageData;

  // AC2: Page Title from hotel.name + Location
  const metaTitle = `${hotel.name} | ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}`;

  // AC3: Meta Description using Concise variant (hero.description is the concise variant)
  const metaDescription = hero.description || `Welcome to ${hotel.name}, located in ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}. Book your stay today.`;

  // AC4 & AC8: Open Graph tags with graceful image handling
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const baseUrl = siteUrl.replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}/${lang}/hotels/${slug}`;
  const ogImageUrl = images && images.length > 0
    ? `${baseUrl}/images/${images[0].id}`
    : undefined;

  // AC6: Build hreflang URLs for all available languages
  const hreflangUrls: Record<string, string> = {};
  for (const availableLang of availableLanguages) {
    const extendedLocale = getExtendedLocaleCode(availableLang);
    hreflangUrls[extendedLocale] = `${baseUrl}/${availableLang}/hotels/${slug}`;
  }

  // AC4: Open Graph tags
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

  // Add OG image if available (AC8: handle missing images gracefully)
  if (ogImageUrl) {
    openGraph.images = [{ url: ogImageUrl }];
    openGraph.siteName = hotel.name;
  }

  return {
    // AC2: Page Title from hotel.name + Location
    title: metaTitle,

    // AC3: Meta Description using Concise variant
    description: metaDescription,

    // AC5: Canonical URL
    alternates: {
      canonical: canonicalUrl,
      // AC6: Hreflang tags for all available languages
      languages: hreflangUrls,
    },

    // AC4: Open Graph tags
    openGraph,

    // Additional metadata
    keywords: `${hotel.name}, ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}, hotel, accommodation`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * Hotel Page Component
 *
 * Story 14.7: Hybrid Architecture Implementation
 *
 * Server Components (SEO Content):
 * - Navigation (Client Component - menu state)
 * - HeroSection (Server Component with optional Client animations)
 * - Amenities (Server Component)
 * - FeaturedRooms/RoomCard (Server Component content + optional Client buttons)
 * - HotelInfo (Server Component)
 * - Testimonials (Server Component content + optional Client carousel)
 * - ImageGallery (Client Component - lightbox interactions)
 * - BookingWidget (Client Component - form interactions)
 * - ContactMap (Client Component - map with SSR guard)
 *
 * Data Flow:
 * 1. Page fetches all data server-side via getHotelPageData()
 * 2. Data passed as props to Server Components (SEO content)
 * 3. Client Components receive minimal interactive props
 * 4. Server Components render initial HTML (SEO-optimized)
 * 5. Client Components hydrate for interactivity
 *
 * @param params - Route params (lang and slug from URL)
 */
export default async function HotelPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  // Fetch hotel page data using the loader (server-side)
  const hotelPageData = await getHotelPageData(process.env.HOTEL_ID!, lang);

  // Destructure data for easier access
  const { hotel, hero, amenities, rooms, gallery, images, availableLanguages } = hotelPageData;

  // AC7: Handle graceful image degradation - check if images are available
  const hasImages = hasValidImages(images);

  // Build JSON-LD structured data (AC7)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const baseUrl = siteUrl.replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}/${lang}/hotels/${slug}`;
  const ogImageUrl = hasImages ? `${baseUrl}/images/${images[0].id}` : undefined;

  // Use concise description for JSON-LD
  const jsonLdDescription = hero.description || `Welcome to ${hotel.name}, located in ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}`;

  // Get room cards from mapped props (ADR-004: using mapper output directly)
  const roomCards = rooms.rooms || [];

  // Build JSON-LD structured data
  const hotelJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: jsonLdDescription,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.parsedAddress.street || undefined,
      addressLocality: hotel.parsedAddress.city || undefined,
      addressRegion: hotel.parsedAddress.state || undefined,
      postalCode: hotel.parsedAddress.postal_code || undefined,
      addressCountry: hotel.parsedAddress.country || undefined,
    },
    url: canonicalUrl,
    ...(hotel.star_rating > 0 && {
      starRating: {
        '@type': 'Rating',
        ratingValue: hotel.star_rating,
      },
    }),
    ...(ogImageUrl && { image: ogImageUrl }),
  };

  // Map FacilityCategory to Amenity contract category
  // CMS categories include things like 'room_amenity', 'Activities', etc.
  // We need to map these to the contract's expected values: 'room', 'hotel', 'location', 'services'
  const categoryMap: Record<string, 'room' | 'hotel' | 'location' | 'services'> = {
    'room_amenity': 'room',
    'Activities': 'services',
    'Wellness': 'services',
    'Food & Drink': 'services',
    'Bathroom': 'room',
    'Outdoors': 'location',
    'Internet': 'services',
    'Parking': 'location',
    'Reception services': 'hotel',
    'Safety & security': 'hotel',
    'General': 'hotel',
    'Cleaning services': 'services',
    'Entertainment and family services': 'services',
    'Great for your stay': 'services',
  };

  // Use mapped props from mappers (ADR-004)
  // The mapper already transforms facilities to the correct format
  const amenitiesList = amenities.amenities || [];

  // Use mapped props from mappers (ADR-004)
  // The mapper already transforms images to the correct format
  const galleryImages = gallery.images || [];

  return (
    <>
      {/* AC7: JSON-LD Structured Data for SEO */}
      <JsonLdScript jsonLd={hotelJsonLd} />

      {/* Main hotel page content */}
      <main role="main" className="min-h-screen">
        {/* Story 14.7 AC1: HeroSection - Server Component (content) + optional Client (animations) */}
        <HeroSection
          title={hero.title}
          headline={hero.headline}
          tagline={hero.tagline}
          description={hero.description}
          primaryCTA={hero.primaryCTA}
          secondaryCTA={hero.secondaryCTA}
          image={hasImages ? ogImageUrl : undefined}
          background="solid"
          enableAnimations={false} // Keep false for SEO (Story 14.7 AC4)
          variant={{
            style: 'modern',
            layout: 'split',
            overlay: 'gradient',
            height: 'large',
          }}
        />

        {/* Story 14.7 AC1: Amenities - Server Component */}
        <Amenities
          amenities={amenitiesList}
          variant={{
            layout: 'grid',
            columns: 4,
            iconSize: 'medium',
            iconStyle: 'default',
            cardStyle: 'elevated',
          }}
          heading={`${hotel.name} Amenities`}
          subheading={`Discover our ${amenities.amenities.length || 0} facilities`}
        />

        {/* Story 14.7 AC1: RoomsGrid - Server Component with RoomCards */}
        <FeaturedRooms
          rooms={roomCards}
          variant="detailed"
          className="bg-surface-primary"
        />

        {/* Story 14.7 AC5: New HotelInfo Server Component */}
        <HotelInfo
          hotel={hotel}
          heading={`About ${hotel.name}`}
        />

        {/* Story 14.7 AC2: ImageGallery - Client Component (lightbox interactions) */}
        <ImageGallery
          images={galleryImages}
          variant={{
            layout: 'grid',
            columns: 3,
            aspectRatio: 'landscape',
            spacing: 'normal',
            cardStyle: 'elevated',
          }}
        />

        {/* Story 14.7 AC4: Testimonials - Server Component (content) + optional Client (carousel) */}
        <Testimonials
          testimonials={[
            {
              id: '1',
              customerName: 'Sarah Johnson',
              customerTitle: 'Verified Guest',
              avatarUrl: undefined,
              rating: 5,
              quote: 'Amazing stay! The room was spotless and the view was breathtaking. Will definitely come back.',
              date: '2024-01-15',
              location: hotel.parsedAddress.city,
            },
            {
              id: '2',
              customerName: 'Michael Chen',
              customerTitle: 'Verified Guest',
              avatarUrl: undefined,
              rating: 5,
              quote: 'Excellent service from check-in to check-out. The staff went above and beyond.',
              date: '2024-01-10',
              location: hotel.parsedAddress.city,
            },
            {
              id: '3',
              customerName: 'Emma Williams',
              customerTitle: 'Verified Guest',
              avatarUrl: undefined,
              rating: 4,
              quote: 'Beautiful property with great amenities. The location was perfect for our trip.',
              date: '2024-01-05',
              location: hotel.parsedAddress.city,
            },
          ]}
          variant={{ layout: 'grid', columns: 3, cardStyle: 'elevated' }}
          heading="Guest Reviews"
          subheading="What our guests say about us"
        />

        {/* Story 14.7 AC2: ContactMap - Client Component with SSR guard */}
        <ContactMap
          address={hotel.parsedAddress}
          latitude={6.0} // Sri Lanka coordinates (placeholder)
          longitude={80.0}
          height="medium"
          zoom={15}
        />

        {/* Story 14.7 AC2: BookingWidget - Client Component (form interactions) */}
        <section className="py-section bg-surface-muted">
          <div className="mx-auto max-w-4xl p-container">
            <h2 className="text-size-display font-display text-center text-brand-primary mb-gap-section">
              Book Your Stay
            </h2>
            <BookingWidget
              variant="desktop"
              theme="glass"
              defaultValues={{
                checkIn: undefined,
                checkOut: undefined,
                adults: 2,
              }}
            />
          </div>
        </section>
      </main>
    </>
  );
}
