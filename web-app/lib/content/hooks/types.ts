/**
 * Type definitions for content loading hooks
 */

import { HomepageContent, MediaManifest, MediaAsset } from '../schemas';

/**
 * Return type for usePageContent hook
 */
export interface UsePageContentReturn {
  content: HomepageContent | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Return type for useMediaAsset hook
 */
export interface UseMediaAssetReturn {
  url: string | null;
  mobileUrl: string | null;
  alt: string;
  blurhash: string | null;
  isLoading: boolean;
  isError: boolean;
}
