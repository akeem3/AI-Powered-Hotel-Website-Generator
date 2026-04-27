import { renderHook } from '@testing-library/react';
import type { HotelTheme } from '@/lib/validation/theme-schema';
import { useHotelTheme } from '@/lib/hooks/useHotelTheme';

// Mock the color library
jest.mock('@/lib/color', () => {
  const mockLightTokens = {
    'brand-primary': 'oklch(0.65 0.15 230)',
    'brand-primary-hover': 'oklch(0.57 0.15 230)',
    'brand-secondary': 'oklch(0.65 0.12 86)',
    'brand-secondary-hover': 'oklch(0.59 0.12 86)',
    'on-brand': 'oklch(1 0 0)',
    'brand-white': 'oklch(1 0 0)',
    'text-primary': 'oklch(0.32 0.05 230)',
    'text-secondary': 'oklch(0.57 0.08 230)',
    'text-muted': 'oklch(0.74 0.06 230)',
    'text-inverted': 'oklch(0.98 0.01 230)',
    'text-on-brand': 'oklch(1 0 0)',
    'surface-default': 'oklch(1 0 0)',
    'surface-primary': 'oklch(1 0 0)',
    'surface-elevated': 'oklch(0.98 0.01 230)',
    'surface-secondary': 'oklch(0.94 0.02 230)',
    'surface-muted': 'oklch(0.94 0.02 230)',
    'border-default': 'oklch(0.88 0.03 230)',
    'border-strong': 'oklch(0.74 0.06 230)',
    'status-success': 'oklch(0.57 0.12 150)',
    'status-warning': 'oklch(0.795 0.162 86)',
    'status-error': 'oklch(0.65 0.18 27)',
    'status-error-strong': 'oklch(0.47 0.15 27)',
    'status-info': 'oklch(0.588 0.139 230)',
    'interactive-primary': 'oklch(0.65 0.12 86)',
    'interactive-primary-hover': 'oklch(0.59 0.12 86)',
  };

  const mockDarkTokens = {
    'brand-primary': 'oklch(0.55 0.128 230)',
    'brand-secondary': 'oklch(0.78 0.102 86)',
    'on-brand': 'oklch(1 0 0)',
    'brand-white': 'oklch(1 0 0)',
    'text-primary': 'oklch(0.985 0 0)',
    'text-secondary': 'oklch(0.715 0 0)',
    'text-muted': 'oklch(0.556 0 0)',
    'text-inverted': 'oklch(0.145 0 0)',
    'text-on-brand': 'oklch(1 0 0)',
    'surface-default': 'oklch(0.24 0.02 230)',
    'surface-primary': 'oklch(0.24 0.02 230)',
    'surface-elevated': 'oklch(0.32 0.03 230)',
    'surface-secondary': 'oklch(0.32 0.03 230)',
    'surface-muted': 'oklch(0.39 0.04 230)',
    'border-default': 'oklch(0.39 0.04 230)',
    'border-strong': 'oklch(0.57 0.08 230)',
    'status-success': 'oklch(0.65 0.10 150)',
    'status-warning': 'oklch(0.85 0.14 86)',
    'status-error': 'oklch(0.65 0.17 27)',
    'status-error-strong': 'oklch(0.58 0.19 27)',
    'status-info': 'oklch(0.65 0.12 230)',
    'interactive-primary': 'oklch(0.78 0.102 86)',
    'interactive-primary-hover': 'oklch(0.72 0.102 86)',
    'brand-primary-hover': 'oklch(0.48 0.128 230)',
    'brand-secondary-hover': 'oklch(0.72 0.102 86)',
  };

  // Generate shade vars
  const shadeVars: Record<string, string> = {};
  const families = ['primary', 'secondary', 'accent', 'success', 'error'];
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  for (const family of families) {
    for (const step of steps) {
      shadeVars[`--${family}-${step}-val`] = `oklch(0.5 0.1 230)`;
    }
  }

  const lightVars = { ...shadeVars };
  for (const [key, value] of Object.entries(mockLightTokens)) {
    lightVars[`--${key}-val`] = value;
  }

  const darkVars: Record<string, string> = {};
  for (const [key, value] of Object.entries(mockDarkTokens)) {
    darkVars[`--${key}-val`] = value;
  }

  return {
    generateFullTheme: jest.fn().mockReturnValue({
      palettes: {},
      light: mockLightTokens,
      dark: mockDarkTokens,
    }),
    mapShadesToCssVariables: jest.fn().mockReturnValue(lightVars),
    mapDarkModeCssVariables: jest.fn().mockReturnValue(darkVars),
  };
});

// Mock document.documentElement methods
const mockSetProperty = jest.fn();
const mockSetAttribute = jest.fn();
const mockGetAttribute = jest.fn().mockReturnValue(null);
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: mockObserve,
  disconnect: mockDisconnect,
}));

Object.defineProperty(document, 'documentElement', {
  value: {
    style: {
      setProperty: mockSetProperty,
    },
    setAttribute: mockSetAttribute,
    getAttribute: mockGetAttribute,
    dataset: {},
  },
  writable: true,
});

describe('useHotelTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (document.documentElement as unknown as { dataset: Record<string, string> }).dataset = {};
  });

  const mockTheme: HotelTheme = {
    colors: {
      brandPrimary: 'oklch(0.55 0.12 230)',
      brandSecondary: 'oklch(0.95 0 0)',
    },
    typography: {
      displayFont: 'Playfair Display, serif',
      bodyFont: 'Inter, sans-serif',
    },
  };

  it('should generate and apply all CSS variables when theme is provided', () => {
    renderHook(() => useHotelTheme('test-hotel', mockTheme));

    // Should set many more vars than before (shade scales + semantic tokens)
    expect(mockSetProperty.mock.calls.length).toBeGreaterThan(10);
  });

  it('should apply semantic token variables', () => {
    renderHook(() => useHotelTheme('test-hotel', mockTheme));

    // Check key semantic tokens are set
    expect(mockSetProperty).toHaveBeenCalledWith('--brand-primary-val', expect.stringMatching(/oklch/));
    expect(mockSetProperty).toHaveBeenCalledWith('--text-primary-val', expect.stringMatching(/oklch/));
    expect(mockSetProperty).toHaveBeenCalledWith('--surface-default-val', expect.stringMatching(/oklch/));
    expect(mockSetProperty).toHaveBeenCalledWith('--border-default-val', expect.stringMatching(/oklch/));
    expect(mockSetProperty).toHaveBeenCalledWith('--status-error-val', expect.stringMatching(/oklch/));
  });

  it('should apply shade scale variables', () => {
    renderHook(() => useHotelTheme('test-hotel', mockTheme));

    // Check shade scales are set
    expect(mockSetProperty).toHaveBeenCalledWith('--primary-500-val', expect.any(String));
    expect(mockSetProperty).toHaveBeenCalledWith('--secondary-50-val', expect.any(String));
    expect(mockSetProperty).toHaveBeenCalledWith('--error-950-val', expect.any(String));
  });

  it('should apply typography variables', () => {
    renderHook(() => useHotelTheme('test-hotel', mockTheme));

    expect(mockSetProperty).toHaveBeenCalledWith('--font-display', 'Playfair Display, serif');
    expect(mockSetProperty).toHaveBeenCalledWith('--font-body', 'Inter, sans-serif');
  });

  it('should set data-theme attribute with hotel ID', () => {
    renderHook(() => useHotelTheme('sterling-hotel', mockTheme));

    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'hotel-sterling-hotel');
  });

  it('should store dark mode vars as data attribute', () => {
    renderHook(() => useHotelTheme('test-hotel', mockTheme));

    const dataset = (document.documentElement as unknown as { dataset: Record<string, string> }).dataset;
    expect(dataset.darkThemeVars).toBeDefined();
    const darkVars = JSON.parse(dataset.darkThemeVars);
    expect(darkVars['--brand-primary-val']).toMatch(/oklch/);
    expect(darkVars['--text-primary-val']).toMatch(/oklch/);
  });

  it('should set up MutationObserver for dark mode changes', () => {
    renderHook(() => useHotelTheme('test-hotel', mockTheme));

    expect(mockObserve).toHaveBeenCalledWith(
      document.documentElement,
      { attributes: true, attributeFilter: ['data-mode', 'data-theme'] }
    );
  });

  it('should not apply theme when theme is null', () => {
    renderHook(() => useHotelTheme('test-hotel', null as unknown as HotelTheme));

    expect(mockSetProperty).not.toHaveBeenCalled();
    expect(mockSetAttribute).not.toHaveBeenCalled();
  });

  it('should not apply theme when theme is undefined', () => {
    renderHook(() => useHotelTheme('test-hotel', undefined as unknown as HotelTheme));

    expect(mockSetProperty).not.toHaveBeenCalled();
    expect(mockSetAttribute).not.toHaveBeenCalled();
  });

  it('should disconnect observer on cleanup', () => {
    const { unmount } = renderHook(() => useHotelTheme('test-hotel', mockTheme));

    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('should reapply theme when hotelId changes', () => {
    const { rerender } = renderHook(
      ({ hotelId, theme }) => useHotelTheme(hotelId, theme),
      {
        initialProps: { hotelId: 'hotel-1', theme: mockTheme },
      }
    );

    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'hotel-hotel-1');

    rerender({ hotelId: 'hotel-2', theme: mockTheme });

    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'hotel-hotel-2');
  });

  it('should accept theme with optional colors', () => {
    const themeWith5Colors: HotelTheme = {
      colors: {
        brandPrimary: 'oklch(0.55 0.12 230)',
        brandSecondary: 'oklch(0.75 0.1 86)',
        brandAccent: 'oklch(0.65 0.12 50)',
        statusSuccess: 'oklch(0.448 0.108 150)',
        statusError: 'oklch(0.577 0.215 27)',
      },
      typography: {
        displayFont: 'Montserrat, sans-serif',
        bodyFont: 'Poppins, sans-serif',
      },
    };

    renderHook(() => useHotelTheme('test-hotel', themeWith5Colors));

    // Should still set all variables
    expect(mockSetProperty.mock.calls.length).toBeGreaterThan(10);
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'hotel-test-hotel');
  });
});
