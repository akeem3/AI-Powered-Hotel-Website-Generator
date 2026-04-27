/**
 * Integration tests for locale switching functionality.
 *
 * Tests the complete flow from locale detection through content loading
 * to UI updates.
 */

import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as localeModule from '@/lib/content/locale';
import { ContentProvider, useContentContext, useLocale } from '@/lib/content/ContentProvider';
import { usePageContent } from '@/lib/content';
import { LanguageSelector } from '@/components/blocks/LanguageSelector';

// Mock fetch for content loading
const mockContent = {
  meta: {
    version: '1.0.0',
    generatedAt: '2026-01-20T00:00:00Z',
    hotelId: 'test-hotel',
    locale: 'en',
  },
  hero: {
    tagline: 'Test Tagline',
    title: 'Test Title',
    headline: 'Test Headline',
    description: 'Test Description',
  },
};

const mockContentEs = {
  ...mockContent,
  meta: { ...mockContent.meta, locale: 'es' },
  hero: { ...mockContent.hero, headline: 'Español Headline' },
};

const mockContentFr = {
  ...mockContent,
  meta: { ...mockContent.meta, locale: 'fr' },
  hero: { ...mockContent.hero, headline: 'Français Headline' },
};

const mockContentDe = {
  ...mockContent,
  meta: { ...mockContent.meta, locale: 'de' },
  hero: { ...mockContent.hero, headline: 'Deutsch Headline' },
};

// Helper component to test locale hook
function TestComponent() {
  const { locale, setLocale, localeName } = useLocale();

  return (
    <div>
      <span data-testid="current-locale">{locale}</span>
      <span data-testid="locale-name">{localeName}</span>
      <button onClick={() => setLocale('es' as any)}>Switch to Spanish</button>
      <button onClick={() => setLocale('fr' as any)}>Switch to French</button>
      <button onClick={() => setLocale('de' as any)}>Switch to German</button>
    </div>
  );
}

describe('Locale Integration', () => {
  let originalLocalStorage: Storage | undefined;
  let originalLocation: Location | undefined;

  beforeAll(() => {
    originalLocalStorage = window.localStorage;
    originalLocation = window.location;

    // Mock fetch globally
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockContent),
      } as Response)
    ) as jest.Mock;
  });

  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();

    // Reset fetch mock to default behavior
    (global.fetch as jest.Mock).mockReset();
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockContent),
      } as Response)
    );

    // Mock window.location
    delete (window as any).location;
    (window as any).location = { search: '', href: 'http://localhost:3000' };

    // Reset navigator
    Object.defineProperty(window, 'navigator', {
      value: {
        language: 'en-US',
        languages: ['en-US'],
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // Restore original location
    if (originalLocation) {
      (window as any).location = originalLocation;
    }
  });

  afterAll(() => {
    if (originalLocalStorage) {
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      });
    }
  });

  describe('ContentProvider locale integration', () => {
    it('should detect and initialize locale on mount', () => {
      // Clear any stored locale to force detection
      localStorage.clear();

      // Set browser language to Spanish
      Object.defineProperty(window, 'navigator', {
        value: { language: 'es-ES', languages: ['es-ES'] },
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useContentContext(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
        ),
      });

      // Should detect 'es' from browser
      expect(result.current.locale).toBe('es');
    });

    it('should use defaultLocale when provided', () => {
      const { result } = renderHook(() => useContentContext(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel" defaultLocale="fr">
            {children}
          </ContentProvider>
        ),
      });

      expect(result.current.locale).toBe('fr');
    });

    it('should update document lang attribute when locale changes', () => {
      const { result } = renderHook(() => useContentContext(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
        ),
      });

      expect(document.documentElement.lang).toBe('en');

      act(() => {
        result.current.setLocale('es');
      });

      expect(document.documentElement.lang).toBe('es');
    });

    it('should provide all available locales', () => {
      const { result } = renderHook(() => useContentContext(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
        ),
      });

      // Check that core locales are included (SUPPORTED_LOCALES has many more)
      expect(result.current.availableLocales).toContain('en');
      expect(result.current.availableLocales).toContain('es');
      expect(result.current.availableLocales).toContain('fr');
      expect(result.current.availableLocales).toContain('de');
    });
  });

  describe('useLocale hook integration', () => {
    it('should provide locale functionality', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
        ),
      });

      expect(result.current.locale).toBeDefined();
      expect(result.current.setLocale).toBeInstanceOf(Function);
      // Check that core locales are included (SUPPORTED_LOCALES has many more)
      expect(result.current.availableLocales).toContain('en');
      expect(result.current.availableLocales).toContain('es');
      expect(result.current.availableLocales).toContain('fr');
      expect(result.current.availableLocales).toContain('de');
      expect(result.current.localeName).toBeDefined();
    });

    it('should persist locale to localStorage when changed', () => {
      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
        ),
      });

      act(() => {
        result.current.setLocale('fr');
      });

      expect(localStorage.getItem('hotel-locale')).toBe('fr');
    });

    it('should load persisted locale on mount', () => {
      // Set stored locale before mounting
      localStorage.setItem('hotel-locale', 'de');

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
        ),
      });

      expect(result.current.locale).toBe('de');
    });
  });

  describe('LanguageSelector component integration', () => {
    it('should render all available locales', () => {
      const { getByText, getByLabelText } = render(
        <ContentProvider hotelId="test-hotel">
          <LanguageSelector variant="text" />
        </ContentProvider>
      );

      expect(getByText('EN')).toBeInTheDocument();
      expect(getByText('ES')).toBeInTheDocument();
      expect(getByText('FR')).toBeInTheDocument();
      expect(getByText('DE')).toBeInTheDocument();
    });

    it('should highlight current locale', () => {
      const { getByText, getAllByRole } = render(
        <ContentProvider hotelId="test-hotel" defaultLocale="es">
          <LanguageSelector variant="text" />
        </ContentProvider>
      );

      // Get all buttons - ES should have a different class
      const buttons = getAllByRole('button');
      const esButton = buttons.find((btn) => btn.textContent === 'ES');

      expect(esButton).toHaveClass('font-semibold');
    });

    it('should change locale when button clicked', () => {
      const { getByText } = render(
        <ContentProvider hotelId="test-hotel">
          <TestComponent />
        </ContentProvider>
      );

      const spanishButton = getByText('Switch to Spanish');

      fireEvent.click(spanishButton);

      const localeDisplay = screen.getByTestId('current-locale');
      expect(localeDisplay.textContent).toBe('es');
    });
  });

  describe('Content loading with locale', () => {
    it('should load locale-specific content', async () => {
      // Mock fetch to return Spanish content
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockContentEs,
      } as Response);

      const { result } = renderHook(
        () => usePageContent('test-hotel', 'homepage', 'es'),
        {
          wrapper: ({ children }) => (
            <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
          ),
        }
      );

      // Wait for async state update
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.content?.hero?.headline).toBe('Español Headline');
    });

    it('should fall back to default locale when locale file not found', async () => {
      // Mock fetch to fail for French, succeed for English
      // Using a different locale (fr) to avoid SWR cache from previous test
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          // First call for content.fr.json - 404
          return Promise.resolve({
            ok: false,
            status: 404,
          } as Response);
        }
        // Second call for content.json - success
        return Promise.resolve({
          ok: true,
          json: async () => mockContent,
        } as Response);
      });

      const { result } = renderHook(
        () => usePageContent('test-hotel', 'homepage', 'fr'),
        {
          wrapper: ({ children }) => (
            <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
          ),
        }
      );

      // Wait for async state updates
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Should fall back to English content
      expect(result.current.content?.hero?.headline).toBe('Test Headline');
    });
  });

  describe('End-to-end locale switching', () => {
    it('should complete full locale switch flow', async () => {
      // Start with English locale
      localStorage.setItem('hotel-locale', 'en');

      const { result } = renderHook(() => useLocale(), {
        wrapper: ({ children }) => (
          <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
        ),
      });

      expect(result.current.locale).toBe('en');

      // Change locale to German (using 'de' to avoid SWR cache from previous test which used 'fr')
      act(() => {
        result.current.setLocale('de');
      });

      // Verify locale changed
      expect(result.current.locale).toBe('de');
      expect(localStorage.getItem('hotel-locale')).toBe('de');

      // Verify document lang updated
      expect(document.documentElement.lang).toBe('de');

      // Mock fetch for German content
      (global.fetch as jest.Mock).mockReset();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockContentDe,
      } as Response);

      // Mock fetch for content with German locale
      const { result: contentResult } = renderHook(
        () => usePageContent('test-hotel', 'homepage', 'de'),
        {
          wrapper: ({ children }) => (
            <ContentProvider hotelId="test-hotel">{children}</ContentProvider>
          ),
        }
      );

      // Wait for content to load
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(contentResult.current.content?.hero?.headline).toBe('Deutsch Headline');
    });
  });
});
