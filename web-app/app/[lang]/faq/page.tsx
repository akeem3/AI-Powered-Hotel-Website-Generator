/**
 * FAQ Page (Multi-Language)
 *
 * This page displays frequently asked questions at `/{lang}/faq`.
 * Uses Static Site Generation (SSG) via generateStaticParams to build FAQ pages
 * for all available languages.
 *
 * Story 24.10: FAQ page with Epic 19 FAQ block or list-based fallback.
 *
 * Route Pattern: /{lang}/faq
 * Example: /en/faq, /th/faq, /tr/faq
 *
 * Features:
 * - Epic 19 FAQ block if available (conditional rendering)
 * - List-based fallback if FAQ block not available
 * - Fallback FAQ items for when no CMS FAQ data exists
 * - JSON-LD FAQPage schema for Google Rich Results
 * - Back link to /{lang}
 * - ISR revalidation at 3600 seconds
 *
 * @module app/[lang]/faq/page
 */

import Link from 'next/link';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { SITE_URL, getExtendedLocaleCode, buildFAQPageJsonLd } from '@/lib/metadata/hotel-metadata';
import { buildPageCanonicalUrl, buildPageHreflangUrls, getOgImageUrl } from '@/lib/metadata/hotel-metadata';
import { getHotelPageData } from '@/lib/loaders/hotel-page';
import { JsonLdScript } from '@/components/seo/JsonLdScript';
import type { Metadata } from 'next';

/**
 * Return type for generateStaticParams
 */
type FAQPageParams = {
  lang: string;
}[];

/**
 * Fallback FAQ items for when CMS FAQ data is not available
 * Similar pattern to mockTestimonials in Story 24.7 (Reviews page)
 *
 * These are generic hotel FAQ items that work for any hotel.
 * When the CMS adds FAQ content, this can be replaced with CMS data.
 */
const fallbackFAQs = [
  {
    question: 'What is your check-in and check-out time?',
    answer: 'Standard check-in time is 3:00 PM and check-out time is 11:00 AM. Early check-in or late check-out may be available upon request. Please contact us in advance to check availability.',
  },
  {
    question: 'Is parking available at the hotel?',
    answer: 'Yes, we offer complimentary on-site parking for all guests. Our parking area is well-lit and monitored for your security. No reservation is required for parking.',
  },
  {
    question: 'Do you offer airport transportation?',
    answer: 'Airport shuttle service is available upon request. Please contact us at least 48 hours before your arrival with your flight details to arrange pickup. Additional charges may apply.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Free cancellation is available up to 24 hours before check-in. Cancellations made within 24 hours of check-in may be charged for the first night. Please refer to your booking confirmation for specific terms.',
  },
  {
    question: 'Are pets allowed at the hotel?',
    answer: 'We welcome pets in select rooms. Please contact us before booking to confirm availability and to discuss any pet-related policies. A pet fee may apply.',
  },
  {
    question: 'Is breakfast included in the room rate?',
    answer: 'Continental breakfast is included for all guests. Breakfast is served daily from 6:30 AM to 10:00 AM in our dining area. Special dietary requirements can be accommodated with advance notice.',
  },
  {
    question: 'Do you have Wi-Fi available?',
    answer: 'Complimentary high-speed Wi-Fi is available throughout the hotel, including all guest rooms and public areas. No password is required for guest access.',
  },
  {
    question: 'Can I request a specific room type or location?',
    answer: 'Room preferences are subject to availability at the time of check-in. While we cannot guarantee specific room assignments, we will do our best to accommodate your requests. Please contact us before your arrival to note any special requirements.',
  },
];

/**
 * ISR Time-Based Revalidation
 *
 * Revalidates this page at most once per hour (3600 seconds).
 * Combined with on-demand revalidation via webhook (/api/revalidate).
 */
export const revalidate = 3600;

/**
 * generateStaticParams for FAQ Page
 *
 * Generates one entry per available language for SSG build.
 * Follows the same pattern as app/[lang]/page.tsx and other sub-pages.
 *
 * @returns Array of { lang } objects for SSG
 */
export async function generateStaticParams(): Promise<FAQPageParams> {
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

  const params: FAQPageParams = languages.map((lang) => ({ lang }));

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: FAQ Static Generation                             │');
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
 * generateMetadata for FAQ Page
 *
 * Generates comprehensive metadata including:
 * - AC1: Page title format "FAQ | {hotel.name}"
 * - AC2: Canonical URL {SITE_URL}/{lang}/faq
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

  // AC1: Page Title - "FAQ | {hotel.name}"
  const metaTitle = `FAQ | ${hotel.name}`;

  // AC2: Meta Description
  const metaDescription = `Find answers to frequently asked questions about ${hotel.name}. Learn about our policies, amenities, and services to help plan your stay.`;

  // AC2: Canonical URL - {SITE_URL}/{lang}/faq
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, 'faq');

  // AC3: Hreflang URLs for all available languages
  const hreflangUrls = buildPageHreflangUrls(siteUrl, 'faq', availableLanguages);

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
    keywords: `${hotel.name}, FAQ, frequently asked questions, hotel policies, hotel information, help`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * FAQ Page Component
 *
 * Story 24.10: Displays frequently asked questions with:
 * - Epic 19 FAQ block if available (conditional rendering)
 * - List-based fallback if FAQ block not available
 * - Fallback FAQ items for when no CMS FAQ data exists
 * - JSON-LD FAQPage schema for Google Rich Results
 * - Back link to /{lang}
 *
 * @param params - Page params with language code
 * @returns FAQ page component
 */
export default async function FAQPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Fetch hotel page data
  const hotelPageData = await getHotelPageData(process.env.HOTEL_ID!, lang);
  const { hotel } = hotelPageData;

  // Attempt to dynamically import the FAQ block from Epic 19
  let FAQBlock: React.ComponentType<any> | null = null;
  try {
    const faqModule = await import('@/components/sections/FAQ');
    FAQBlock = faqModule.default;
  } catch {
    // FAQ block not found (Epic 19 not installed or file doesn't exist)
    // Will use list-based fallback
  }

  // Build JSON-LD FAQPage schema for Google Rich Results
  const faqJsonLd = buildFAQPageJsonLd(fallbackFAQs);

  return (
    <main
      role="main"
      data-mode="light"
      className="min-h-screen flex flex-col items-center justify-start bg-surface-primary text-text-primary"
    >
      {/* ===== JSON-LD STRUCTURED DATA ===== */}
      {/* AC: JSON-LD FAQPage schema for Google Rich Results */}
      {faqJsonLd && <JsonLdScript jsonLd={faqJsonLd} />}

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

          {/* AC: Page Title - "FAQ" is in metadata, display is simplified */}
          <h1 className="text-size-display font-display text-brand-primary mb-gap-card">
            Frequently Asked Questions
          </h1>

          {/* Gold Underline Accent */}
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto mb-gap-card"></div>

          {/* Description */}
          <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about {hotel.name}. Can't find what you're looking for?
            Contact us and we'll be happy to help.
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

      {/* ===== FAQ CONTENT ===== */}
      {FAQBlock ? (
        /* AC: Epic 19 FAQ block if available */
        <section id="faq" className="w-full">
          <FAQBlock
            heading="Common Questions"
            questions={fallbackFAQs}
            variant={{ layout: 'accordion' }}
          />
        </section>
      ) : (
        /* AC: List-based fallback if FAQ block not available */
        <section id="faq" className="w-full max-w-screen-xl mx-auto p-container pb-section">
          <div className="space-y-gap-card">
            {fallbackFAQs.map((item, index) => (
              <div
                key={index}
                className="bg-surface-elevated rounded-lg p-card border border-border-subtle hover:border-brand-secondary hover:shadow-md transition-all duration-200"
              >
                <h3 className="text-brand-primary text-size-body-large font-semibold mb-gap-card/2">
                  {item.question}
                </h3>
                <p className="text-text-secondary text-size-body leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
