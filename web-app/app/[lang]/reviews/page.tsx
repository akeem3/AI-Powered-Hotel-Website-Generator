/**
 * Reviews Page (Multi-Language)
 *
 * This page displays all guest reviews at `/{lang}/reviews`.
 * Uses Static Site Generation (SSG) via generateStaticParams to build reviews pages
 * for all available languages.
 *
 * Story 24.7: Reviews page with Testimonials component.
 *
 * Route Pattern: /{lang}/reviews
 * Example: /en/reviews, /th/reviews, /tr/reviews
 *
 * Features:
 * - All guest reviews via Testimonials component with mockTestimonials data
 * - Back link to /{lang}
 * - ISR revalidation at 3600 seconds
 *
 * PRD GAP: The CMS currently has no reviews/testimonials collection.
 * This page uses mockTestimonials data until a future epic adds CMS reviews integration.
 *
 * @module app/[lang]/reviews/page
 */

import Link from 'next/link';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { SITE_URL, getExtendedLocaleCode } from '@/lib/metadata/hotel-metadata';
import { buildPageCanonicalUrl, buildPageHreflangUrls, getOgImageUrl, buildReviewsAggregateJsonLd } from '@/lib/metadata/hotel-metadata';
import Testimonials from '@/components/blocks/Testimonials';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import { mockTestimonials } from '@/components/data/mockTestimonials';
import type { Metadata } from 'next';

/**
 * Return type for generateStaticParams
 */
type ReviewsPageParams = {
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
 * generateStaticParams for Reviews Page
 *
 * Generates one entry per available language for SSG build.
 * Follows the same pattern as app/[lang]/page.tsx and other sub-pages.
 *
 * @returns Array of { lang } objects for SSG
 */
export async function generateStaticParams(): Promise<ReviewsPageParams> {
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

  const params: ReviewsPageParams = languages.map((lang) => ({ lang }));

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: Reviews Static Generation                           │');
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
 * generateMetadata for Reviews Page
 *
 * Generates comprehensive metadata including:
 * - AC1: Page title format "Guest Reviews | {hotel.name}"
 * - AC2: Canonical URL {SITE_URL}/{lang}/reviews
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

  // AC1: Page Title - "Guest Reviews | {hotel.name}"
  const metaTitle = `Guest Reviews | ${hotel.name}`;

  // AC2: Meta Description
  const metaDescription = `Read authentic guest reviews and testimonials for ${hotel.name}. See what our guests have to say about their stay.`;

  // AC2: Canonical URL - {SITE_URL}/{lang}/reviews
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, 'reviews');

  // AC3: Hreflang URLs for all available languages
  const hreflangUrls = buildPageHreflangUrls(siteUrl, 'reviews', availableLanguages);

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
    keywords: `${hotel.name}, guest reviews, testimonials, ratings, feedback`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * Reviews Page Component
 *
 * Story 24.7: Displays all guest reviews with:
 * - Testimonials component with all available reviews from mockTestimonials
 * - Back link to /{lang}
 * - Empty state if no reviews available
 *
 * @param params - Page params with language code
 * @returns Reviews page component
 */
export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Fetch hotel data for hotel name in page content
  const hotelData = await getHotelFull(process.env.HOTEL_ID!);
  const { hotel } = hotelData;

  // Use mockTestimonials data (PRD GAP: CMS has no reviews collection)
  const reviews = mockTestimonials;

  // Calculate average rating for display (if reviews exist)
  const hasReviews = reviews.length > 0;
  const averageRating = hasReviews
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  // Build site URL for structured data
  const siteUrl = SITE_URL.replace(/\/$/, '');

  // ============================================
  // JSON-LD STRUCTURED DATA (Story 24.7 AC6)
  // ============================================
  // Transform mockTestimonials to ReviewJsonLdInput format
  const reviewsForJsonLd = reviews.map((review) => ({
    authorName: review.customerName,
    rating: review.rating,
    reviewBody: review.quote,
    datePublished: review.date,
  }));

  // Build AggregateRating JSON-LD structured data
  const reviewsJsonLd = buildReviewsAggregateJsonLd(reviewsForJsonLd, hotel.name);

  return (
    <>
      {/* AC6: JSON-LD AggregateRating Structured Data for SEO (Story 24.7) */}
      {reviewsJsonLd && <JsonLdScript jsonLd={reviewsJsonLd} />}

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

          {/* AC: Page Title - "Guest Reviews | {hotel.name}" is in metadata, display is simplified */}
          <h1 className="text-size-display font-display text-brand-primary mb-gap-card">
            Guest Reviews
          </h1>

          {/* Gold Underline Accent */}
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

          {/* Description with average rating */}
          <div className="max-w-3xl mx-auto leading-relaxed">
            <p className="text-size-body text-text-secondary mb-gap-card">
              Read authentic reviews from guests who have experienced our hospitality firsthand.
              Their stories reflect our commitment to exceptional service and memorable stays.
            </p>
            {hasReviews && (
              <p className="text-size-body-large text-brand-primary font-semibold">
                Rated {averageRating.toFixed(1)}/5 by {reviews.length} guests
              </p>
            )}
          </div>
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

      {/* ===== REVIEWS SECTION ===== */}
      {/* AC: Testimonials block renders with all available reviews */}
      {hasReviews ? (
        <section id="reviews" className="w-full">
          <Testimonials
            testimonials={reviews}
            variant={{
              layout: 'grid',
              columns: 3,
              cardStyle: 'default',
            }}
            heading="What Our Guests Say"
            subheading="Authentic experiences from our valued guests"
            showDate={true}
            showLocation={true}
          />
        </section>
      ) : (
        /* ===== EMPTY STATE ===== */
        /* If no reviews available, show message */
        <section className="w-full max-w-screen-xl mx-auto p-container pb-section">
          <div className="text-center py-section">
            <p className="text-text-muted italic">
              No reviews available at the moment. Please check back soon.
            </p>
          </div>
        </section>
      )}
    </main>
    </>
  );
}
