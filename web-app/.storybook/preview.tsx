import type { Preview } from '@storybook/react-vite';
import '../app/globals.css'; // Import design tokens (includes default colors in @layer theme)
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import React, { useEffect } from 'react';

/**
 * Storybook Theme Sync Decorator
 *
 * Ensures Storybook theme switching works correctly with the CSS default colors.
 *
 * Color values come from @layer theme in globals.css, avoiding duplication.
 * The CSS defaults are the same as the generated palette, so Storybook displays
 * the same colors as production without redundant JavaScript color generation.
 *
 * This decorator:
 * - Sets data-theme attribute for consistency with production
 * - Provides structure for future dynamic palette testing if needed
 */
const withThemeSync = (StoryFn: () => React.JSX.Element) => {
  useEffect(() => {
    // Set theme attribute for consistency with production behavior
    const root = document.documentElement;
    root.setAttribute('data-theme', 'storybook-default');

    // Cleanup function
    return () => {
      root.removeAttribute('data-theme');
    };
  }, []);

  return <StoryFn />;
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    viewport: {
      options: {
        mobile: { name: 'Mobile (375px)', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet (768px)', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop (1280px)', styles: { width: '1280px', height: '900px' } },
        wide: { name: 'Wide (1920px)', styles: { width: '1920px', height: '1080px' } },
      }
    },
    // Chromatic viewport capture strategy
    // Default: All stories capture at desktop (1280px) - keeps snapshot count low
    // To capture multiple viewports for a story, add chromatic parameter:
    // chromatic: { viewports: [375, 768, 1280, 1920] }
    // See docs/chromatic-baseline-strategy.md for details
    chromatic: {
      // Global default: capture at desktop only
      // This keeps us within Chromatic free tier (5,000 snapshots/month)
      // Current: 82 stories × 1 viewport = 82 snapshots per build
      // With multi-viewport: 82 × 4 = 328 snapshots (still acceptable)
      viewports: [1280],
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Getting Started', 'Atoms', 'Blocks', 'Sections', 'Layouts', '*'],
      },
    },
  },

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light mode' },
          { value: 'dark', icon: 'moon', title: 'Dark mode' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    withThemeSync, // Sync theme attributes (colors come from CSS defaults)
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-mode',
    }),
  ],

  initialGlobals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export default preview;
