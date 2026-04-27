import React from 'react';
import { render, renderHook, waitFor, act } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { 
  ContentProvider, 
  useContentContext, 
  usePageContent, 
  useMediaAsset 
} from '@/lib/content';

// Fixtures
import sampleContent from '@/lib/content/schemas/__tests__/fixtures/sample-homepage-content.json';
import sampleManifest from '@/lib/content/schemas/__tests__/fixtures/sample-media-manifest.json';

// Mock fetch
global.fetch = jest.fn();

/**
 * Wrapper for tests that provides ContentProvider and clears SWR cache
 */
const AllProviders = ({ children, hotelId = 'hotel-123', locale = 'en' }: any) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    <ContentProvider hotelId={hotelId} defaultLocale={locale}>
      {children}
    </ContentProvider>
  </SWRConfig>
);

describe('Content System Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ContentProvider', () => {
    it('provides context and handles locale switching', () => {
      const { result } = renderHook(() => useContentContext(), {
        wrapper: AllProviders,
      });

      expect(result.current.hotelId).toBe('hotel-123');
      expect(result.current.locale).toBe('en');
      expect(result.current.contentBaseUrl).toBe('/content/hotel-123');

      act(() => {
        result.current.setLocale('fr');
      });

      expect(result.current.locale).toBe('fr');
    });

    it('throws error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => renderHook(() => useContentContext())).toThrow();
      consoleSpy.mockRestore();
    });
  });

  describe('usePageContent', () => {
    it('fetches and validates content successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleContent,
      });

      const { result } = renderHook(() => usePageContent('hotel-123', 'homepage'), {
        wrapper: AllProviders,
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.content).not.toBeNull();
      expect(result.current.content?.hero.title).toBe('The Sterling Executive');
      expect(result.current.isError).toBe(false);
    });

    it('handles locale fallback on 404', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: false, status: 404 }) // fr version missing
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => sampleContent }); // fallback to default

      const { result } = renderHook(() => usePageContent('hotel-123', 'homepage', 'fr'), {
        wrapper: AllProviders,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.content).not.toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('returns null on validation failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ invalid: 'data' }),
      });

      const { result } = renderHook(() => usePageContent('hotel-123', 'homepage'), {
        wrapper: AllProviders,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.content).toBeNull();
    });

    it('handles network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

      const { result } = renderHook(() => usePageContent('hotel-123', 'homepage'), {
        wrapper: AllProviders,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isError).toBe(true);
    });
  });

  describe('useMediaAsset', () => {
    it('resolves @media references and constructs URLs', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleManifest,
      });

      const { result } = renderHook(() => useMediaAsset('@media:homepage.hero', 'hotel-123'), {
        wrapper: AllProviders,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.url).toContain('hero.webp');
      expect(result.current.mobileUrl).toContain('hero-mobile.webp');
      expect(result.current.alt).toBe('The Sterling Executive Hotel Exterior');
    });

    it('handles missing assets gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => sampleManifest,
      });

      const { result } = renderHook(() => useMediaAsset('@media:homepage.missing', 'hotel-123'), {
        wrapper: AllProviders,
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.url).toBeNull();
    });
  });

  describe('System Integration (Locale Switching Flow)', () => {
    it('re-fetches content when provider locale changes', async () => {
      // Setup: Primary content and French content (using different title)
      const frenchContent = {
        ...sampleContent,
        hero: { ...sampleContent.hero, title: 'Bienvenue' }
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => sampleContent }) // Initial call (en)
        .mockResolvedValueOnce({ ok: true, status: 200, json: async () => frenchContent }); // Second call (fr)

      const TestComponent = () => {
        const { locale, setLocale } = useContentContext();
        const { content, isLoading } = usePageContent('hotel-123', 'homepage', locale);

        if (isLoading) return <div data-testid="loading">Loading...</div>;
        return (
          <div>
            <div data-testid="title">{content?.hero.title}</div>
            <button data-testid="btn-fr" onClick={() => setLocale('fr')}>Switch to FR</button>
          </div>
        );
      };

      const { getByTestId } = render(
        <AllProviders>
          <TestComponent />
        </AllProviders>
      );

      // Verify initial state (en)
      await waitFor(() => expect(getByTestId('loading')).toBeTruthy(), { timeout: 1000 }).catch(() => {});
      await waitFor(() => expect(getByTestId('title').textContent).toBe('The Sterling Executive'));

      // Action: Switch locale
      const btn = getByTestId('btn-fr');
      act(() => {
        btn.click();
      });

      // Verify re-fetch occurred (fr)
      await waitFor(() => expect(getByTestId('title').textContent).toBe('Bienvenue'));
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenLastCalledWith(expect.stringContaining('content.fr.json'));
    });
  });
});
