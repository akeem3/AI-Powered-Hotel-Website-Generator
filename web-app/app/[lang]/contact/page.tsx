/**
 * Contact Page (Multi-Language)
 *
 * This page displays contact information at `/{lang}/contact`.
 * Uses Static Site Generation (SSG) via generateStaticParams to build contact pages
 * for all available languages.
 *
 * Story 24.8: Contact page with ContactHeader, ContactInfo, ContactForm, and ContactMap.
 * Uses CMS data (hotel.parsedAddress) instead of hardcoded constants.
 *
 * Route Pattern: /{lang}/contact
 * Example: /en/contact, /th/contact, /tr/contact
 *
 * Features:
 * - All contact sections (Header, Info, Form, Map)
 * - Address data from CMS (hotel.parsedAddress)
 * - Back link to /{lang}
 * - ISR revalidation at 3600 seconds
 *
 * NOTE: CMS currently provides parsedAddress but not phone/email/hours at hotel level.
 * Default values are used for these fields until CMS adds contact information metadata.
 *
 * @module app/[lang]/contact/page
 */

import Link from 'next/link';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { SITE_URL, getExtendedLocaleCode } from '@/lib/metadata/hotel-metadata';
import { buildPageCanonicalUrl, buildPageHreflangUrls, getOgImageUrl } from '@/lib/metadata/hotel-metadata';
import ContactHeader from '@/components/sections/ContactHeader';
import ContactInfo, { type ContactInfoAddress } from '@/components/sections/ContactInfo';
import ContactForm from '@/components/sections/ContactForm';
import ContactMap from '@/components/sections/ContactMap';
import type { CmsAddress } from '@/lib/cms-api/types';
import type { Metadata } from 'next';

/**
 * Return type for generateStaticParams
 */
type ContactPageParams = {
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
 * generateStaticParams for Contact Page
 *
 * Generates one entry per available language for SSG build.
 * Follows the same pattern as app/[lang]/page.tsx and other sub-pages.
 *
 * @returns Array of { lang } objects for SSG
 */
export async function generateStaticParams(): Promise<ContactPageParams> {
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

  const params: ContactPageParams = languages.map((lang) => ({ lang }));

  // Build-time logging for visibility
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│  SSG: Contact Static Generation                         │');
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
 * generateMetadata for Contact Page
 *
 * Generates comprehensive metadata including:
 * - AC1: Page title format "Contact Us | {hotel.name}"
 * - AC2: Canonical URL {SITE_URL}/{lang}/contact
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

  // AC1: Page Title - "Contact Us | {hotel.name}"
  const metaTitle = `Contact Us | ${hotel.name}`;

  // AC2: Meta Description
  const metaDescription = `Get in touch with ${hotel.name}. Contact our team for bookings, events, and inquiries. We're here to help make your stay memorable.`;

  // AC2: Canonical URL - {SITE_URL}/{lang}/contact
  const canonicalUrl = buildPageCanonicalUrl(siteUrl, lang, 'contact');

  // AC3: Hreflang URLs for all available languages
  const hreflangUrls = buildPageHreflangUrls(siteUrl, 'contact', availableLanguages);

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
    keywords: `${hotel.name}, contact, phone, email, address, booking, inquiry`,
    authors: [{ name: hotel.name }],
  };
}

/**
 * Contact Page Component
 *
 * Story 24.8: Displays contact page with:
 * - ContactHeader section
 * - ContactInfo section with CMS address data (hotel.parsedAddress)
 * - ContactForm with validation
 * - ContactMap with hotel location
 * - Back link to /{lang}
 *
 * @param params - Page params with language code
 * @returns Contact page component
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Fetch hotel data from CMS
  const hotelData = await getHotelFull(process.env.HOTEL_ID!);
  const { hotel, images } = hotelData;

  // Extract parsedAddress from CMS data
  const parsedAddress = hotel.parsedAddress;

  /**
   * NOTE: CMS currently provides parsedAddress but not phone/email/hours at hotel level.
   * Default values are used here. When CMS adds contact metadata, update these lines.
   *
   * TODO: Replace phone, email, hours with CMS data when available.
   * Fields to fetch from CMS: hotel.phone, hotel.email, hotel.hours, hotel.emergency
   */
  const contactInfoProps = {
    name: hotel.name,
    // TODO: Get from CMS: hotel.phone or hotel.contact.phone
    phone: '+1 (555) 123-4567',
    // TODO: Get from CMS: hotel.email or hotel.contact.email
    email: 'info@sterlingexecutive.com',
    // From CMS: hotel.parsedAddress
    address: parsedAddress as ContactInfoAddress,
    hours: {
      // TODO: Get from CMS: hotel.hours or hotel.operatingHours
      reception: '24/7',
      businessCenter: '24/7',
      checkIn: '3:00 PM',
      checkOut: '11:00 AM',
    },
    emergency: {
      // TODO: Get from CMS: hotel.emergency.phone
      contact: '+1 (555) 987-6543',
    },
  };

  return (
    <main
      role="main"
      aria-labelledby="contact-page-title"
      className="min-h-screen flex flex-col items-center justify-start p-container py-gap-section space-y-section"
    >
      {/* AC: ContactHeader component */}
      <ContactHeader />

      {/* AC: ContactInfo with CMS address data */}
      <ContactInfo {...contactInfoProps} />

      {/* AC: ContactForm with success focus management */}
      {/* Note: ContactForm is a Client Component but can be used in Server Component */}
      <ContactForm variant={{ style: 'default', background: 'none' }} />

      {/* AC: ContactMap with CMS address */}
      {/* Note: ContactMap is a Client Component for map interactivity */}
      <ContactMap address={parsedAddress} />

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
    </main>
  );
}
