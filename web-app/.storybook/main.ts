import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  stories: [
    '../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)',
    '../stories/**/*.mdx',
  ],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-docs'
  ],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => prop.parent?.fileName !== '@storybook/react-vite',
    },
  },

  // Vite configuration for Next.js compatibility
  viteFinal: async (config) => {
    // Configure path aliases for @/ imports
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': resolve(__dirname, '..'),
      // Mock next/image for Storybook (use our mock instead of the real one)
      'next/image': resolve(__dirname, './next-image-mock.tsx'),
    };

    // Polyfill process.env for components that use it
    config.define = config.define || {};
    config.define['process.env.NODE_ENV'] = JSON.stringify('development');

    // Configure esbuild for JSX transformation
    config.esbuild = config.esbuild || {};
    config.esbuild.jsx = 'automatic';
    config.esbuild.jsxImportSource = 'react';

    // Add @vitejs/plugin-react to handle JSX properly
    const react = await import('@vitejs/plugin-react');
    config.plugins = config.plugins || [];
    config.plugins.push(react.default());

    // Add plugin to strip "use client" directives (must come after react plugin)
    config.plugins.push({
      name: 'strip-use-client',
      transform(code, id) {
        // Only process .tsx, .ts, .jsx, .js files
        if (/\.(tsx?|jsx?)$/.test(id)) {
          // Strip "use client" directive only at the start of the file
          // More precise regex to avoid affecting imports
          const useClientRegex = /^(?:\/\/.*\n|\/\*[\s\S]*?\*\/\s*|)\s*['"]use client['"];\s*\n?/;
          if (useClientRegex.test(code)) {
            return {
              code: code.replace(useClientRegex, ''),
              map: null,
            };
          }
        }
      },
    });

    return config;
  }
};


export default config;
