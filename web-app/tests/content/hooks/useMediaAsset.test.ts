import { renderHook, waitFor } from '@testing-library/react';
import { useMediaAsset } from '@/lib/content/hooks/useMediaAsset';
import { MediaManifestSchema } from '@/lib/content/schemas';
import sampleManifest from '@/lib/content/schemas/__tests__/fixtures/sample-media-manifest.json';

// Mock fetch globally
global.fetch = jest.fn();

// Mock SWR
jest.mock('swr', () => {
  return jest.fn((key, fetcher, config) => {
    const [data, setData] = require('react').useState(null);
    const [error, setError] = require('react').useState(null);
    const [isLoading, setIsLoading] = require('react').useState(true);

    require('react').useEffect(() => {
      if (fetcher) {
        fetcher(key)
          .then((result: any) => {
            setData(result);
            setIsLoading(false);
          })
          .catch((err: any) => {
            setError(err);
            setIsLoading(false);
          });
      }
    }, [key]);

    return {
      data,
      error,
      isLoading,
    };
  });
});

describe('useMediaAsset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should parse @media: reference and resolve asset', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleManifest,
    });

    const { result } = renderHook(() =>
      useMediaAsset('@media:homepage.hero', 'hotel-sterling-123')
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have resolved asset
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.url).toBe(
      'https://f000.backblazeb2.com/file/hotel-assets/hotel-sterling-123/hero.webp'
    );
    expect(result.current.mobileUrl).toBe(
      'https://f000.backblazeb2.com/file/hotel-assets/hotel-sterling-123/hero-mobile.webp'
    );
    expect(result.current.alt).toBe('The Sterling Executive Hotel Exterior');
    expect(result.current.blurhash).toBe('L6Pj0^jE.AyE_3t7t7R**0o#DgR4');
  });

  it('should handle invalid reference format', () => {
    const { result } = renderHook(() =>
      useMediaAsset('invalid-reference', 'hotel-sterling-123')
    );

    // Should return placeholder immediately
    expect(result.current.url).toBe(null);
    expect(result.current.mobileUrl).toBe(null);
    expect(result.current.alt).toBe('');
    expect(result.current.blurhash).toBe(null);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it('should handle missing page in manifest', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleManifest,
    });

    const { result } = renderHook(() =>
      useMediaAsset('@media:nonexistent.asset', 'hotel-sterling-123')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should return placeholder values
    expect(result.current.url).toBe(null);
    expect(result.current.mobileUrl).toBe(null);
    expect(result.current.alt).toBe('');
    expect(result.current.isError).toBe(false);
  });

  it('should handle missing asset in page', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleManifest,
    });

    const { result } = renderHook(() =>
      useMediaAsset('@media:homepage.nonexistent', 'hotel-sterling-123')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should return placeholder values
    expect(result.current.url).toBe(null);
    expect(result.current.alt).toBe('');
  });

  it('should handle manifest fetch error', async () => {
    const networkError = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() =>
      useMediaAsset('@media:homepage.hero', 'hotel-sterling-123')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have error state
    expect(result.current.isError).toBe(true);
    expect(result.current.url).toBe(null);
  });

  it('should handle asset without mobile path', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleManifest,
    });

    const { result } = renderHook(() =>
      useMediaAsset('@media:homepage.og-image', 'hotel-sterling-123')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have url but no mobileUrl
    expect(result.current.url).toBe(
      'https://f000.backblazeb2.com/file/hotel-assets/hotel-sterling-123/og-image.jpg'
    );
    expect(result.current.mobileUrl).toBe(null);
    expect(result.current.alt).toBe('The Sterling Executive social preview');
  });

  it('should construct correct manifest URL', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleManifest,
    });

    const { result } = renderHook(() =>
      useMediaAsset('@media:homepage.hero', 'hotel-123')
    );
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith('/content/hotel-123/media/manifest.json');
  });
});
