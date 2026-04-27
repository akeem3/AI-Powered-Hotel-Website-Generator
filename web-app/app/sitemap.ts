/**
 * Sitemap Generation for Multi-Page Hotel Website
 *
 * Generates dynamic sitemap.xml for all language-specific pages
 * including homepage, sub-pages, and hotel detail page URLs.
 *
 * Story 14.8: Sitemap Generation
 * Story 24.12: Extended sitemap for all sub-pages
 *
 * Features:
 * - Homepage URLs for all available languages (/{lang})
 * - Sub-page URLs: rooms, gallery, amenities, reviews, contact, about, FAQ
 * - Room detail page URLs for all languages (/{lang}/rooms/{roomSlug})
 * - Hotel detail page URLs for all languages (/{lang}/hotels/{slug})
 * - lastmod timestamps from CMS updated_at field
 * - Proper priority values (homepage=1.0, rooms=0.9, room detail=0.8, others=0.7)
 * - Change frequencies (homepage=daily, rooms=weekly, others=monthly)
 * - alternates.languages for proper hreflang tags
 * - x-default pointing to first available language
 *
 * Route Pattern:
 * - Homepages: /{lang}
 * - Sub-pages: /{lang}/rooms, /{lang}/gallery, /{lang}/amenities, etc.
 * - Room details: /{lang}/rooms/{roomSlug}
 * - Hotel details: /{lang}/hotels/{slug}
 *
 * @module app/sitemap
 */

import type { MetadataRoute } from 'next';
import { getHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';
import { SITE_URL, getExtendedLocaleCode } from '@/lib/metadata';
import { getAvailableRoomSlugs } from '@/lib/loaders/room-slug';

// Force static generation for sitemap in static export mode
export const dynamic = 'force-static';

/**
 * Sitemap generator function
 *
 * This function runs at build time to generate sitemap.xml.
 * It fetches hotel data from CMS and builds URLs for all
 * language variants of homepage, sub-pages, and hotel detail pages.
 *
 * Story 14.8 Implementation:
 * - AC1: All homepage URLs included (/{lang})
 * - AC2: All hotel detail page URLs included (/{lang}/hotels/{slug})
 * - AC3: lastmod from hotel.updated_at
 * - AC4: alternates.languages for hreflang
 * - AC5: x-default points to first available language
 *
 * Story 24.12 Implementation:
 * - AC1: All sub-page URLs included (rooms, gallery, amenities, reviews, contact, about, FAQ)
 * - AC2: Room detail page URLs included (/{lang}/rooms/{roomSlug})
 * - AC3: Proper priority values (homepage=1.0, rooms=0.9, room detail=0.8, others=0.7)
 * - AC4: Change frequencies (homepage=daily, rooms=weekly, others=monthly)
 *
 * @returns Array of sitemap entries conforming to MetadataRoute.Sitemap
 *
 * @throws Error if HOTEL_ID is not configured
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Validate HOTEL_ID environment variable
  const hotelId = process.env.HOTEL_ID;

  if (!hotelId) {
    throw new Error(
      'Sitemap Generation Error: HOTEL_ID environment variable is required.\n' +
        'Please add HOTEL_ID to your .env.local file.\n' +
        'Example: HOTEL_ID=09f207c1-695a-485a-9519-49f4ef03331f',
    );
  }

  // Fetch hotel data from CMS API
  const hotelData = await getHotelFull(hotelId);

  // Extract hotel object and content array from response
  const hotel = hotelData.hotel;
  const content = hotelData.content;

  // Extract available languages from content array
  const languages = getAvailableLanguages(content);

  // Fetch available room slugs for room detail pages
  const roomSlugs = await getAvailableRoomSlugs(hotelId);

  // Build base URL from environment variable
  const baseUrl = SITE_URL;

  // Store hotel slug for URL construction
  const slug = hotel.slug;

  // ============================================================================
  // HOMEPAGE ENTRIES (priority: 1.0, changeFrequency: 'daily')
  // ============================================================================

  // Build alternates.languages object for all language variants
  // This creates the hreflang mappings for SEO
  const homepageAlternatesLanguages: Record<string, string> = {};
  for (const lang of languages) {
    const extendedLocale = getExtendedLocaleCode(lang);
    homepageAlternatesLanguages[extendedLocale] = `${baseUrl.replace(/\/$/, '')}/${lang}`;
  }

  // Add x-default pointing to the first available language
  // This tells search engines which language to use as default
  // Important: Use first available language from CMS, not hardcoded 'en'
  // (CMS may not have English content - e.g., only has 'tr' and 'ru')
  homepageAlternatesLanguages['x-default'] = `${baseUrl.replace(/\/$/, '')}/${languages[0]}`;

  // Create homepage sitemap entries for each language
  // Pattern: /{lang}
  const homepageEntries: MetadataRoute.Sitemap = languages.map((lang) => ({
    url: `${baseUrl.replace(/\/$/, '')}/${lang}`,
    lastModified: new Date(hotel.updated_at),
    changeFrequency: 'daily',
    priority: 1.0,
    alternates: {
      languages: homepageAlternatesLanguages,
    },
  }));

  // ============================================================================
  // ROOMS LISTING PAGE (priority: 0.9, changeFrequency: 'weekly')
  // ============================================================================

  // Build alternates.languages for rooms listing pages
  const roomsAlternatesLanguages: Record<string, string> = {};
  for (const lang of languages) {
    const extendedLocale = getExtendedLocaleCode(lang);
    roomsAlternatesLanguages[extendedLocale] = `${baseUrl.replace(/\/$/, '')}/${lang}/rooms`;
  }
  roomsAlternatesLanguages['x-default'] = `${baseUrl.replace(/\/$/, '')}/${languages[0]}/rooms`;

  const roomsEntries: MetadataRoute.Sitemap = languages.map((lang) => ({
    url: `${baseUrl.replace(/\/$/, '')}/${lang}/rooms`,
    lastModified: new Date(hotel.updated_at),
    changeFrequency: 'weekly',
    priority: 0.9,
    alternates: {
      languages: roomsAlternatesLanguages,
    },
  }));

  // ============================================================================
  // ROOM DETAIL PAGES (priority: 0.8, changeFrequency: 'monthly')
  // ============================================================================

  // Create sitemap entries for each room detail page in each language
  const roomDetailEntries: MetadataRoute.Sitemap = [];
  for (const roomSlug of roomSlugs) {
    // Build alternates.languages for this specific room detail page
    const roomDetailAlternatesLanguages: Record<string, string> = {};
    for (const lang of languages) {
      const extendedLocale = getExtendedLocaleCode(lang);
      roomDetailAlternatesLanguages[extendedLocale] = `${baseUrl.replace(/\/$/, '')}/${lang}/rooms/${roomSlug.slug}`;
    }
    roomDetailAlternatesLanguages['x-default'] = `${baseUrl.replace(/\/$/, '')}/${languages[0]}/rooms/${roomSlug.slug}`;

    for (const lang of languages) {
      roomDetailEntries.push({
        url: `${baseUrl.replace(/\/$/, '')}/${lang}/rooms/${roomSlug.slug}`,
        lastModified: new Date(hotel.updated_at),
        changeFrequency: 'monthly',
        priority: 0.8,
        alternates: {
          languages: roomDetailAlternatesLanguages,
        },
      });
    }
  }

  // ============================================================================
  // SUB-PAGES (priority: 0.7, changeFrequency: 'monthly')
  // ============================================================================

  // Define sub-pages to include in sitemap
  const subPages = ['gallery', 'amenities', 'reviews', 'contact', 'about', 'faq'] as const;

  // Create sitemap entries for each sub-page in each language
  const subPageEntries: MetadataRoute.Sitemap = [];
  for (const subPage of subPages) {
    // Build alternates.languages for this sub-page
    const subPageAlternatesLanguages: Record<string, string> = {};
    for (const lang of languages) {
      const extendedLocale = getExtendedLocaleCode(lang);
      subPageAlternatesLanguages[extendedLocale] = `${baseUrl.replace(/\/$/, '')}/${lang}/${subPage}`;
    }
    subPageAlternatesLanguages['x-default'] = `${baseUrl.replace(/\/$/, '')}/${languages[0]}/${subPage}`;

    for (const lang of languages) {
      subPageEntries.push({
        url: `${baseUrl.replace(/\/$/, '')}/${lang}/${subPage}`,
        lastModified: new Date(hotel.updated_at),
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates: {
          languages: subPageAlternatesLanguages,
        },
      });
    }
  }

  // ============================================================================
  // HOTEL DETAIL PAGES (legacy, maintained for backward compatibility)
  // ============================================================================

  // Build alternates.languages for hotel detail pages
  // Each detail page needs alternates pointing to all detail page variants
  const detailAlternatesLanguages: Record<string, string> = {};
  for (const lang of languages) {
    const extendedLocale = getExtendedLocaleCode(lang);
    detailAlternatesLanguages[extendedLocale] = `${baseUrl.replace(/\/$/, '')}/${lang}/hotels/${slug}`;
  }

  // Add x-default pointing to the first available language hotel detail page
  detailAlternatesLanguages['x-default'] = `${baseUrl.replace(/\/$/, '')}/${languages[0]}/hotels/${slug}`;

  // Create hotel detail page sitemap entries for each language
  // Pattern: /{lang}/hotels/{slug}
  const hotelDetailEntries: MetadataRoute.Sitemap = languages.map((lang) => ({
    url: `${baseUrl.replace(/\/$/, '')}/${lang}/hotels/${slug}`,
    lastModified: new Date(hotel.updated_at),
    changeFrequency: 'monthly',
    priority: 0.7,
    alternates: {
      languages: detailAlternatesLanguages,
    },
  }));

  // ============================================================================
  // COMBINE AND RETURN ALL SITEMAP ENTRIES
  // ============================================================================

  // Combine all sitemap entries and return
  // This includes: homepage, rooms listing, room details, sub-pages, and hotel detail pages
  return [
    ...homepageEntries,
    ...roomsEntries,
    ...roomDetailEntries,
    ...subPageEntries,
    ...hotelDetailEntries,
  ];
}
