'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import { HomepageContent, HomepageContentSchema } from '../schemas';
import { UsePageContentReturn } from './types';
import { DEFAULT_LOCALE, type Locale } from '../locale';

/**
 * Fetcher function for SWR that handles locale fallback and validation
 */
async function fetchPageContent(
  url: string,
  fallbackUrl: string
): Promise<HomepageContent | null> {
  let response: Response;
  
  try {
    // Try primary URL (locale-specific)
    response = await fetch(url);
    
    // If 404, try fallback URL (default locale)
    if (!response.ok && response.status === 404) {
      response = await fetch(fallbackUrl);
    }
    
    // If still not ok, throw error
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    throw error;
  }
  
  // Parse JSON
  const data = await response.json();
  
  // Validate against schema
  const validationResult = HomepageContentSchema.safeParse(data);
  
  if (!validationResult.success) {
    // Log validation errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[usePageContent] Validation failed:', validationResult.error);
      console.error('[usePageContent] Invalid data:', data);
    }
    
    // Return null for graceful degradation
    return null;
  }
  
  return validationResult.data;
}

/**
 * Hook to fetch and cache page content with locale support
 *
 * @param hotelId - Unique hotel identifier (undefined to skip fetch)
 * @param pageId - Page identifier (e.g., "homepage")
 * @param locale - Optional locale code (e.g., "en", "es"). Defaults to "en"
 * @returns Content data with loading and error states
 */
export function usePageContent(
  hotelId: string | undefined,
  pageId: string,
  locale: Locale = DEFAULT_LOCALE
): UsePageContentReturn {
  // Early return if no hotelId provided - don't attempt fetch
  // This prevents unnecessary 404 errors when hotelId is not set
  if (!hotelId) {
    return {
      content: null,
      isLoading: false,
      isError: false,
      error: null,
      mutate: () => {},
    };
  }

  // Construct URLs
  const localeUrl = `/content/${hotelId}/pages/${pageId}/content.${locale}.json`;
  const fallbackUrl = `/content/${hotelId}/pages/${pageId}/content.json`;
  
  // Create SWR key that includes both URLs for proper caching
  // We use useMemo to ensure the key (which can be an array) is stable across renders
  const swrKey = useMemo(() => 
    locale === 'en' ? fallbackUrl : [localeUrl, fallbackUrl],
    [locale, fallbackUrl, localeUrl]
  );
  
  // Fetch with SWR
  const { data, error, isLoading, mutate } = useSWR(
    swrKey,
    () => fetchPageContent(localeUrl, fallbackUrl),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000, // 1 second
      shouldRetryOnError: true,
    }
  );
  
  return {
    content: data ?? null,
    isLoading,
    isError: !!error,
    error: error ?? null,
    mutate,
  };
}
