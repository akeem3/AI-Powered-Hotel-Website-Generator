import { renderHook, waitFor } from '@testing-library/react';
import { usePageContent } from '@/lib/content/hooks/usePageContent';
import { HomepageContentSchema } from '@/lib/content/schemas';
import sampleContent from '@/lib/content/schemas/__tests__/fixtures/sample-homepage-content.json';

// Mock fetch globally
global.fetch = jest.fn();

// Mock SWR to avoid actual network calls in tests
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
      mutate: jest.fn(),
    };
  });
});

describe('usePageContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and validate content successfully', async () => {
    // Mock successful fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleContent,
    });

    const { result } = renderHook(() =>
      usePageContent('hotel-sterling-123', 'homepage', 'en')
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.content).toBe(null);

    // Wait for fetch to complete
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have content
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.content).not.toBe(null);
    expect(result.current.content?.hero.title).toBe('The Sterling Executive');
  });

  it('should handle locale fallback on 404', async () => {
    // Mock 404 for locale-specific, then success for fallback
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleContent,
      });

    const { result } = renderHook(() =>
      usePageContent('hotel-sterling-123', 'homepage', 'es')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have fallen back to default content
    expect(result.current.content).not.toBe(null);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should return null content on validation failure', async () => {
    const invalidContent = {
      meta: {
        version: '1.0.0',
        // Missing required fields
      },
      hero: {
        // Missing required fields
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => invalidContent,
    });

    const { result } = renderHook(() =>
      usePageContent('hotel-sterling-123', 'homepage', 'en')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should return null for graceful degradation
    expect(result.current.content).toBe(null);
    expect(result.current.isError).toBe(false); // Not an error, just invalid
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network error');
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    const { result } = renderHook(() =>
      usePageContent('hotel-sterling-123', 'homepage', 'en')
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have error state
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe(networkError);
    expect(result.current.content).toBe(null);
  });

  it('should construct correct URLs', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => sampleContent,
    });

    const { result } = renderHook(() =>
      usePageContent('hotel-123', 'homepage', 'fr')
    );
    
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith(
      '/content/hotel-123/pages/homepage/content.fr.json'
    );
  });
});
