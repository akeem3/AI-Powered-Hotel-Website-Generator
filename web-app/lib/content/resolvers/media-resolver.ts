import { MediaManifest, MediaAsset } from '../schemas';
import { ResolvedMedia } from './types';

/** Regex for @media: reference pattern */
const MEDIA_REF_REGEX = /^@media:(.+)\.(.+)$/;

/** Default fallback image (matches existing HeroSection pattern) */
const DEFAULT_FALLBACK_IMAGE = '/images/hotel-img.jpg';

/**
 * Check if string is a media reference
 *
 * @param value - String to check
 * @returns true if string starts with "@media:" and has valid format
 *
 * @example
 * isMediaRef("@media:homepage.hero")  // => true
 * isMediaRef("https://cdn.com/img.jpg") // => false
 */
export function isMediaRef(value: string): boolean {
  // Must start with @media:, have valid content, contain a dot, and not end with '.'
  const hasDot = value.substring(7).includes('.');
  return (
    value.startsWith('@media:') &&
    value.length > 8 &&
    hasDot &&
    !value.startsWith('@media:.') &&
    !value.endsWith('.')
  );
}

/**
 * Parse @media:page.asset reference
 *
 * @param ref - Media reference string
 * @returns Parsed {page, asset} or null if invalid
 *
 * @example
 * parseMediaRef("@media:homepage.hero")
 * // => { page: "homepage", asset: "hero" }
 */
function parseMediaRef(ref: string): { page: string; asset: string } | null {
  if (!isMediaRef(ref)) {
    return null;
  }

  const match = ref.match(MEDIA_REF_REGEX);
  if (!match) {
    return null;
  }

  const [, page, asset] = match;
  return { page, asset };
}

/**
 * Create fallback resolved media
 *
 * @param fallbackUrl - Optional fallback URL (defaults to hotel-img.jpg)
 * @returns Fallback resolved media object
 */
function createFallbackMedia(fallbackUrl: string = DEFAULT_FALLBACK_IMAGE): ResolvedMedia {
  return {
    url: fallbackUrl,
    mobileUrl: null,
    alt: '',
    blurhash: null,
    width: null,
    height: null,
  };
}

/**
 * Resolve @media:page.asset reference to full URLs
 *
 * Returns null if asset not found (caller decides fallback strategy)
 *
 * @param ref - Media reference string "@media:page.asset"
 * @param manifest - Media manifest containing asset definitions
 * @returns Resolved media with full CDN URLs, or null if not found
 *
 * @example
 * resolveMediaRef("@media:homepage.hero", manifest)
 * // => {
 * //   url: "https://cdn.../hotel-123/hero.webp",
 * //   mobileUrl: "https://cdn.../hotel-123/hero-mobile.webp",
 * //   alt: "Hotel exterior",
 * //   blurhash: "L6Pj0^j...",
 * //   width: 1920,
 * //   height: 1080
 * // }
 *
 * @example
 * resolveMediaRef("@media:nonexistent.missing", manifest)
 * // => null
 */
export function resolveMediaRef(
  ref: string,
  manifest: MediaManifest
): ResolvedMedia | null {
  // Handle null/undefined manifest
  if (!manifest) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[resolveMediaRef] Media manifest is null or undefined`);
    }
    return null;
  }

  // Parse reference
  const parsed = parseMediaRef(ref);
  if (!parsed) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[resolveMediaRef] Invalid media reference format: "${ref}"`);
    }
    return null;
  }

  // Lookup page in manifest
  const pageAssets = manifest.assets[parsed.page];
  if (!pageAssets) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[resolveMediaRef] Page "${parsed.page}" not found in manifest`);
    }
    return null;
  }

  // Lookup asset in page
  const asset = pageAssets[parsed.asset];
  if (!asset) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[resolveMediaRef] Asset "${parsed.asset}" not found in page "${parsed.page}"`);
    }
    return null;
  }

  // Construct full URLs
  const baseUrl = manifest.cdn.baseUrl;
  const url = `${baseUrl}${asset.path}`;
  const mobileUrl = asset.mobilePath ? `${baseUrl}${asset.mobilePath}` : null;

  return {
    url,
    mobileUrl,
    alt: asset.alt ?? '',
    blurhash: asset.blurhash ?? null,
    width: asset.width ?? null,
    height: asset.height ?? null,
  };
}

/**
 * Resolve media reference with automatic fallback
 *
 * @param ref - Media reference string
 * @param manifest - Media manifest
 * @param fallbackUrl - Optional fallback URL (defaults to hotel-img.jpg)
 * @returns Resolved media or fallback if not found
 *
 * @example
 * resolveMediaRefOrFallback("@media:homepage.hero", manifest)
 * // => ResolvedMedia { url: "https://...", ... }
 *
 * @example
 * resolveMediaRefOrFallback("@media:missing.asset", manifest)
 * // => ResolvedMedia { url: "/images/hotel-img.jpg", ... }
 */
export function resolveMediaRefOrFallback(
  ref: string,
  manifest: MediaManifest,
  fallbackUrl: string = DEFAULT_FALLBACK_IMAGE
): ResolvedMedia {
  const resolved = resolveMediaRef(ref, manifest);
  return resolved ?? createFallbackMedia(fallbackUrl);
}

/**
 * Resolve media reference and throw if not found
 * Convenience function for validation scenarios
 *
 * @param ref - Media reference string
 * @param manifest - Media manifest
 * @returns Resolved media
 * @throws Error if reference is invalid or asset not found
 */
export function resolveMediaRefOrThrow(
  ref: string,
  manifest: MediaManifest
): ResolvedMedia {
  const resolved = resolveMediaRef(ref, manifest);

  if (!resolved) {
    throw new Error(`Failed to resolve media reference: "${ref}"`);
  }

  return resolved;
}
