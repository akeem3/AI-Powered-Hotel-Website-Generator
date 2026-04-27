/**
 * Language-Specific Homepage (Curated Landing)
 *
 * This page serves as a curated landing page for a specific language variant.
 * It uses Static Site Generation (SSG) via generateStaticParams to
 * build homepages for all available languages.
 *
 * Story 24.2: Homepage refactored to curated landing with teaser sections
 * and "View All" links to dedicated pages.
 *
 * Route Pattern: /{lang}
 * Example: /en, /th, /tr, /ru
 *
 * Teaser sections:
 * - Hero: Full fidelity (unchanged)
 * - Gallery: First 6 images + "View Full Gallery" link
 * - Rooms: First 3 rooms + "View All Rooms" link
 * - Testimonials: Full section (kept for social proof)
 * - Amenities: First 8 amenities + "View All Amenities" link
 *
 * @module app/[lang]/page
 */

import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { getHeroAndHotelData } from '@/lib/loaders/hotel-page';
import { mapCmsToRooms } from '@/lib/mappers/rooms.mapper';
import { mapCmsToGallery } from '@/lib/mappers/gallery.mapper';
import { mapCmsToAmenities } from '@/lib/mappers/amenities.mapper';
import { hasValidImages } from '@/lib/loaders/hotel-page';
import { getSectionContent } from '@/lib/content/loaders';
import { CONTENT_DEFAULTS } from '@/lib/content/defaults';
import type { Locale } from '@/lib/content/locale';
import type { Metadata } from 'next';
import { getExtendedLocaleCode, buildHotelJsonLd, getOgImageUrl, SITE_URL } from '@/lib/metadata';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import Link from 'next/link';

// Server Components (SEO-critical content)
import HeroSection from '@/components/sections/HeroSection';
import { Amenities } from '@/components/blocks/Amenities';
import FeaturedRooms from '@/components/sections/RoomsGrid';

// Client Components (interactive features)
import ImageGallery from '@/components/blocks/ImageGallery';
import { Testimonials } from '@/components/blocks/Testimonials';
import { mockTestimonials } from '@/components/data/mockTestimonials';

/**
 * Return type for generateStaticParams
 */
type HomepageParams = {
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
 * generateStaticParams for Homepage
 */
export async function generateStaticParams(): Promise<HomepageParams> {
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

  const params: HomepageParams = languages.map((lang) => ({ lang }));

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: Homepage Static Generation                        │');
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
 * generateMetadata for Homepage (Curated Landing)
 *
 * Story 14.6: SEO Metadata Generation for multi-language homepages.
 * Story 24.2: Metadata unchanged from original homepage.
 *
 * Generates comprehensive metadata including:
 * - AC1: Page Title (hotel.name | city, country)
 * - AC2: Meta Description (concise variant)
 * - AC3: Open Graph tags (locale, type, url, images)
 * - AC4: Canonical URL
 * - AC5: Hreflang tags (all available languages)
 * - AC6: JSON-LD Structured Data (Hotel schema)
 */
export async function generateMetadata(
  { params }: { params: Promise<{ lang: string }> }
): Promise<Metadata> {
  const { lang } = await params;

  // Fetch hero and hotel data for homepage (Story 24.1)
  const heroAndHotelData = await getHeroAndHotelData(process.env.HOTEL_ID!, lang);

  // Destructure data for easier access
  const { hotel, hero, images, availableLanguages } = heroAndHotelData;

  // AC1: Page Title from hotel.name + Location
  const metaTitle = `${hotel.name} | ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}`;

  // AC2: Meta Description using Concise variant (hero.description is the concise variant)
  const metaDescription = hero.description || `Welcome to ${hotel.name}, located in ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}. Book your stay today.`;

  // Build site URL (remove trailing slash for consistency)
  const baseUrl = SITE_URL.replace(/\/$/, '');

  // AC4: Canonical URL for homepage
  const canonicalUrl = `${baseUrl}/${lang}`;

  // AC3: Open Graph image URL with graceful handling
  const ogImageUrl = getOgImageUrl(baseUrl, images);

  // AC5: Build hreflang URLs for all available languages
  const hreflangUrls: Record<string, string> = {};
  for (const availableLang of availableLanguages) {
    const extendedLocale = getExtendedLocaleCode(availableLang);
    hreflangUrls[extendedLocale] = `${baseUrl}/${availableLang}`;
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

  // Add OG image if available (AC3: handle missing images gracefully)
  if (ogImageUrl) {
    openGraph.images = [{ url: ogImageUrl }];
    openGraph.siteName = hotel.name;
  }

  return {
    // AC1: Page Title
    title: metaTitle,

    // AC2: Meta Description
    description: metaDescription,

    // AC4: Canonical URL
    alternates: {
      canonical: canonicalUrl,
      // AC5: Hreflang tags for all available languages
      languages: hreflangUrls,
    },

    // AC3: Open Graph tags
    openGraph,

    // Additional metadata
    keywords: `${hotel.name}, ${hotel.parsedAddress.city}, ${hotel.parsedAddress.country}, hotel, accommodation`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * Language-Specific Homepage Component (Curated Landing)
 *
 * Story 24.2: Homepage refactored to curated landing with teaser sections
 *
 * Shows:
 * - Hero: Full fidelity (unchanged)
 * - Gallery teaser: First 6 images + "View Full Gallery" link
 * - Rooms teaser: First 3 rooms + "View All Rooms" link
 * - Testimonials: Full section (kept for social proof)
 * - Amenities teaser: First 8 amenities + "View All Amenities" link
 *
 * Data is fetched via section-specific loaders and mappers with limits.
 */
export default async function LangHomepage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  // Fetch hero and hotel data for homepage (Story 24.1)
  const heroAndHotelData = await getHeroAndHotelData(process.env.HOTEL_ID!, lang);
  const { hotel, hero, images } = heroAndHotelData;

  // Fetch full hotel data for mappers (we need the raw data to apply limits)
  const hotelData = await getHotelFull(process.env.HOTEL_ID!);
  const siteUrl = SITE_URL.replace(/\/$/, '');

  // Create teaser sections with limits (Story 24.2)
  const roomsTeaser = mapCmsToRooms({ hotelData, limit: 3 });
  const galleryTeaser = mapCmsToGallery({ hotelData, siteUrl, limit: 6 });
  const amenitiesTeaser = mapCmsToAmenities({ hotelData, limit: 8 });

  // Fetch content JSON for section headings (amenities, testimonials, etc.)
  // Falls back to CONTENT_DEFAULTS if content JSON is not available
  const amenitiesSectionContent = await getSectionContent(
    process.env.HOTEL_ID!,
    'homepage',
    'amenities',
    {
      heading: CONTENT_DEFAULTS.amenities.heading,
      subheading: CONTENT_DEFAULTS.amenities.subheading,
    },
    lang as Locale
  );

  // Handle graceful image degradation
  const hasImages = hasValidImages(images);

  // ============================================
  // JSON-LD STRUCTURED DATA (Story 14.6 AC7)
  // ============================================
  const canonicalUrl = `${siteUrl}/${lang}`;
  const ogImageUrl = getOgImageUrl(siteUrl, images);

  // Build Hotel JSON-LD structured data
  const hotelJsonLd = buildHotelJsonLd(
    hotel,
    hero.description || `Welcome to ${hotel.name} in ${hotel.parsedAddress.city}.`,
    canonicalUrl,
    ogImageUrl
  );

  return (
    <>
      {/* AC7: JSON-LD Structured Data for SEO (Story 14.6) */}
      <JsonLdScript jsonLd={hotelJsonLd} />

      <main
        role="main"
        data-mode="light"
        className="min-h-screen flex flex-col items-center justify-start bg-surface-primary text-text-primary"
      >
        {/* ===== HERO SECTION ===== */}
        {/* Full fidelity, unchanged */}
        <section className="w-full text-center">
          <HeroSection {...hero} />
        </section>

        {/* ===== IMAGE GALLERY TEASER SECTION ===== */}
        {/* Story 24.2: First 6 images + "View Full Gallery" link */}
        {hasImages && galleryTeaser.images.length > 0 && (
          <section
            id="gallery"
            className="w-full bg-liner-to-b from-surface-primary via-surface-secondary to-surface-primary py-section"
          >
            <div className="max-w-screen-xl mx-auto p-container">
              {/* Section Header with Premium Styling */}
              <div className="text-center mb-gap-section">
                {/* Gold Accent Bar */}
                <div className="flex items-center justify-center mb-gap-card">
                  <div className="h-divider w-divider-sm bg-brand-secondary"></div>
                  <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
                  <div className="h-divider w-divider-sm bg-brand-secondary"></div>
                </div>

                {/* Main Heading */}
                <h2 className="text-size-h2 font-display text-brand-primary mb-gap-card">
                  Explore Our Hotel
                </h2>

                {/* Gold Underline Accent */}
                <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

                {/* Description */}
                <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
                  Discover our luxurious facilities, elegant rooms, and premium amenities designed for
                  the discerning traveler
                </p>
              </div>

              {/* Gallery Component - teaser with first 6 images */}
              <ImageGallery {...galleryTeaser} />

              {/* "View Full Gallery" Link Button */}
              <div className="mt-gap-card text-center">
                <Link
                  href={`/${lang}/gallery`}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-surface-primary font-medium rounded-sm hover:bg-brand-primary/90 transition-colors duration-200"
                  aria-label="View full photo gallery"
                >
                  <span>View Full Gallery</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ===== ROOMS TEASER SECTION ===== */}
        {/* Story 24.2: First 3 rooms + "View All Rooms" link */}
        <section id="rooms" className="w-full max-w-screen-xl mx-auto p-container py-section">
          {/* Section Header with Premium Styling */}
          <div className="text-center mb-gap-section">
            {/* Gold Accent Bar */}
            <div className="flex items-center justify-center mb-gap-card">
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
              <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            </div>

            {/* Main Heading */}
            <h2 className="text-size-h2 font-display text-brand-primary mb-gap-card">
              Luxurious Accommodations
            </h2>

            {/* Gold Underline Accent */}
            <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

            {/* Description */}
            <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Experience the perfect blend of comfort and elegance in our thoughtfully designed rooms
              and suites
            </p>
          </div>

          {/* Rooms Component - teaser with first 3 rooms */}
          <FeaturedRooms {...roomsTeaser} />

          {/* "View All Rooms" Link Button */}
          <div className="mt-gap-card text-center">
            <Link
              href={`/${lang}/rooms`}
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-surface-primary font-medium rounded-sm hover:bg-brand-primary/90 transition-colors duration-200"
              aria-label="View all rooms and suites"
            >
              <span>View All Rooms</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ===== TESTIMONIALS SECTION ===== */}
        {/* Full section kept for social proof (unchanged) */}
        <section
          id="testimonials"
          className="w-full bg-liner-to-b from-surface-primary via-surface-secondary to-surface-primary py-section"
        >
          <div className="max-w-screen-xl mx-auto p-container">
            <Testimonials
              variant={{
                layout: 'grid',
                cardStyle: 'elevated',
              }}
              testimonials={mockTestimonials}
              showDate={true}
              showLocation={true}
              className="max-w-5xl mx-auto"
            />
          </div>
        </section>

        {/* ===== AMENITIES TEASER SECTION ===== */}
        {/* Story 24.2: First 8 amenities + "View All Amenities" link */}
        <section id="amenities" className="w-full py-section bg-surface-secondary/mid">
          <div className="max-w-screen-xl mx-auto p-container">
            {/* Amenities Component - teaser with first 8 amenities */}
            {/* Component renders header from Content JSON (with fallback to defaults) */}
            <Amenities
              {...amenitiesTeaser}
              heading={amenitiesSectionContent.heading}
              subheading={amenitiesSectionContent.subheading}
            />

            {/* "View All Amenities" Link Button */}
            <div className="mt-gap-card text-center">
              <Link
                href={`/${lang}/amenities`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-surface-primary font-medium rounded-sm hover:bg-brand-primary/90 transition-colors duration-200"
                aria-label="View all amenities and facilities"
              >
                <span>View All Amenities</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
