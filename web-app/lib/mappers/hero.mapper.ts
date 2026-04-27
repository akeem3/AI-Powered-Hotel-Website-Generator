/**
 * Hero Section Data Mapper
 *
 * Transforms raw CMS data into HeroSection component props.
 * Uses strictly typed interfaces inferred from Zod contracts.
 *
 * @module lib/mappers/hero.mapper
 */

import type { HeroSectionContractType } from '@/lib/contracts/hero.contract';
import type {
  HotelFullResponse,
  CmsHotel,
  CmsAddress,
} from '@/lib/cms-api/types';
import { getContentForUseCase } from '@/lib/cms-api/transformers';

/**
 * Input parameters for hero mapper
 */
export interface MapCmsToHeroInput {
  /** Full hotel data from CMS API */
  hotelData: HotelFullResponse & { hotel: CmsHotel & { parsedAddress: CmsAddress } };
  /** Language code for content selection */
  lang: string;
  /** Site URL for building image URLs */
  siteUrl?: string;
}

/**
 * Map CMS data to HeroSection component props
 *
 * Transforms raw CMS hotel data into strictly typed HeroSection props.
 * Includes fallback logic for missing content variants.
 *
 * Content Variant Mapping:
 * - headline → Extended variant (longest description)
 * - tagline → Standard variant (medium description)
 * - description → Concise variant (shortest description)
 *
 * Image Handling:
 * - Uses first available image from CMS
 * - Falls back to placeholder if no images available
 *
 * CTA Handling:
 * - Primary CTA: Links to rooms section
 * - Secondary CTA: Links to contact page (language-aware)
 *
 * @param input - Mapper input parameters
 * @returns HeroSection component props
 *
 * @example
 * ```ts
 * const heroProps = mapCmsToHero({
 *   hotelData: cmsResponse,
 *   lang: 'ru',
 *   siteUrl: 'https://example.com'
 * });
 * ```
 */
export function mapCmsToHero(input: MapCmsToHeroInput): HeroSectionContractType {
  const { hotelData, lang, siteUrl = 'http://localhost:3000' } = input;
  const { hotel, content, images } = hotelData;

  // Extract content variants with fallback chain
  const headline = getContentForUseCase(content, lang, 'hero'); // Extended
  const tagline = getContentForUseCase(content, lang, 'section'); // Standard
  const description = getContentForUseCase(content, lang, 'card'); // Concise

  // Build hero image URL
  const baseUrl = siteUrl.replace(/\/$/, '');
  const hasImages = images && images.length > 0;
  const image = hasImages
    ? `${baseUrl}/images/${images[0].id}`
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80';

  // Build hero props
  const heroProps: HeroSectionContractType = {
    variant: {
      style: 'modern',
      layout: 'centered',
      overlay: 'gradient',
      height: 'medium',
    },
    title: hotel.name,
    headline: headline || `Welcome to ${hotel.name}`,
    tagline: tagline || undefined,
    description: description || undefined,
    image,
    background: 'image',
    primaryCTA: {
      text: 'View Rooms',
      href: '#rooms',
      ariaLabel: `View rooms at ${hotel.name}`,
    },
    secondaryCTA: {
      text: 'Contact Us',
      href: `/${lang}/contact`,
      ariaLabel: `Contact ${hotel.name}`,
    },
  };

  return heroProps;
}
