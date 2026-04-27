import React from 'react';
import { render, renderHook, act } from '@testing-library/react';
import { ContentProvider, useContentContext } from '@/lib/content/ContentProvider';

describe('ContentProvider', () => {
  it('should provide hotelId, locale, and contentBaseUrl to children', () => {
    const TestComponent = () => {
      const { hotelId, locale, contentBaseUrl } = useContentContext();
      return (
        <div>
          <span data-testid="hotel-id">{hotelId}</span>
          <span data-testid="locale">{locale}</span>
          <span data-testid="base-url">{contentBaseUrl}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <ContentProvider hotelId="hotel-sterling-123" defaultLocale="fr">
        <TestComponent />
      </ContentProvider>
    );

    expect(getByTestId('hotel-id').textContent).toBe('hotel-sterling-123');
    expect(getByTestId('locale').textContent).toBe('fr');
    expect(getByTestId('base-url').textContent).toBe('/content/hotel-sterling-123');
  });

  it('should support changing locale', () => {
    const TestComponent = () => {
      const { locale, setLocale } = useContentContext();
      return (
        <div>
          <span data-testid="locale">{locale}</span>
          <button data-testid="change-btn" onClick={() => setLocale('es')}>Change</button>
        </div>
      );
    };

    const { getByTestId } = render(
      <ContentProvider hotelId="hotel-123">
        <TestComponent />
      </ContentProvider>
    );

    expect(getByTestId('locale').textContent).toBe('en');

    const btn = getByTestId('change-btn');
    act(() => {
      btn.click();
    });

    expect(getByTestId('locale').textContent).toBe('es');
  });

  it('should throw error when used outside of provider', () => {
    // Suppress console.error for this test as we expect an error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      renderHook(() => useContentContext());
    }).toThrow('useContentContext must be used within a ContentProvider');
    
    consoleSpy.mockRestore();
  });
});
