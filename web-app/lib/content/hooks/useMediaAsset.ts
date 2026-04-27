'use client';

import useSWR from 'swr';
import { MediaManifest, MediaManifestSchema } from '../schemas';
import { UseMediaAssetReturn } from './types';

/**
 * Parse @media: reference syntax
 * @param ref - Reference string in format "@media:page.asset"
 * @returns Parsed page and asset names, or null if invalid
 */
function parseMediaReference(ref: string): { page: string; asset: string } | null {
  // Check if reference starts with @media:
  if (!ref.startsWith('@media:')) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[useMediaAsset] Invalid reference format: "${ref}". Expected "@media:page.asset"`);
    }
    return null;
  }

  // Remove @media: prefix
  const path = ref.substring(7); // "@media:".length === 7

  // Split by dot to get page and asset
  const parts = path.split('.');
  if (parts.length !== 2) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[useMediaAsset] Invalid reference format: "${ref}". Expected "@media:page.asset"`);
    }
    return null;
  }

  const [page, asset] = parts;
  
  if (!page || !asset) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[useMediaAsset] Empty page or asset in reference: "${ref}"`);
    }
    return null;
  }

  return { page, asset };
}

/**
 * Fetcher function for media manifest
 */
async function fetchMediaManifest(url: string): Promise<MediaManifest | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch media manifest: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate against schema
    const validationResult = MediaManifestSchema.safeParse(data);

    if (!validationResult.success) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useMediaAsset] Media manifest validation failed:', validationResult.error);
        console.error('[useMediaAsset] Invalid manifest data:', data);
      }
      return null;
    }

    return validationResult.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Hook to resolve @media: references to full CDN URLs
 * 
 * @param ref - Media reference in format "@media:page.asset" (e.g., "@media:homepage.hero")
 * @param hotelId - Hotel identifier for fetching the media manifest
 * @returns Media asset data with URLs and metadata
 * 
 * @example
 * ```tsx
 * const { url, mobileUrl, alt, blurhash, isLoading } = useMediaAsset(
 *   '@media:homepage.hero',
 *   'hotel-123'
 * );
 * 
 * if (isLoading) return <ImageSkeleton blurhash={blurhash} />;
 * if (!url) return <PlaceholderImage />;
 * 
 * return (
 *   <picture>
 *     {mobileUrl && <source media="(max-width: 768px)" srcSet={mobileUrl} />}
 *     <img src={url} alt={alt} />
 *   </picture>
 * );
 * ```
 */
export function useMediaAsset(
  ref: string,
  hotelId: string
): UseMediaAssetReturn {
  // Parse the reference
  const parsed = parseMediaReference(ref);

  // Construct manifest URL
  const manifestUrl = `/content/${hotelId}/media/manifest.json`;

  // Fetch manifest with SWR
  const { data: manifest, error, isLoading } = useSWR(
    manifestUrl,
    fetchMediaManifest,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 60 seconds - longer for static manifests
      errorRetryCount: 3,
      errorRetryInterval: 2000, // 2 seconds
      shouldRetryOnError: true,
    }
  );

  // If parsing failed, return placeholder values
  if (!parsed) {
    return {
      url: null,
      mobileUrl: null,
      alt: '',
      blurhash: null,
      isLoading: false,
      isError: false,
    };
  }

  // If still loading, return loading state
  if (isLoading) {
    return {
      url: null,
      mobileUrl: null,
      alt: '',
      blurhash: null,
      isLoading: true,
      isError: false,
    };
  }

  // If error fetching manifest, return error state
  if (error || !manifest) {
    return {
      url: null,
      mobileUrl: null,
      alt: '',
      blurhash: null,
      isLoading: false,
      isError: !!error,
    };
  }

  // Look up asset in manifest
  const pageAssets = manifest.assets[parsed.page];
  if (!pageAssets) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[useMediaAsset] Page "${parsed.page}" not found in manifest`);
    }
    return {
      url: null,
      mobileUrl: null,
      alt: '',
      blurhash: null,
      isLoading: false,
      isError: false,
    };
  }

  const asset = pageAssets[parsed.asset];
  if (!asset) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[useMediaAsset] Asset "${parsed.asset}" not found in page "${parsed.page}"`);
    }
    return {
      url: null,
      mobileUrl: null,
      alt: '',
      blurhash: null,
      isLoading: false,
      isError: false,
    };
  }

  // Construct full URLs
  const baseUrl = manifest.cdn.baseUrl;
  const url = `${baseUrl}${asset.path}`;
  const mobileUrl = asset.mobilePath ? `${baseUrl}${asset.mobilePath}` : null;

  return {
    url,
    mobileUrl,
    alt: asset.alt || '',
    blurhash: asset.blurhash || null,
    isLoading: false,
    isError: false,
  };
}
