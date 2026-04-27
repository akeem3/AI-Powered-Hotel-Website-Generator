'use client';

import { useEffect } from 'react';
import type { HotelTheme } from '@/lib/validation/theme-schema';
import { generateFullTheme, mapShadesToCssVariables, mapDarkModeCssVariables, hotelDesignTokensToBaseColors } from '@/lib/color';
import { mapTypography } from '@/lib/style-generation/typography-mapper';
import { mapSpacingDensity } from '@/lib/style-generation/spacing-mapper';
import { mapBorderRadius } from '@/lib/style-generation/border-radius-mapper';
import type { HotelDesignTokens } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

/**
 * Apply a hotel theme to the document root.
 *
 * Generates a full palette from 2-5 OKLCH base colors, maps them to
 * semantic CSS variables, and applies them to :root. Dark mode overrides
 * are stored as data attributes for the dark mode selector to pick up.
 *
 * Story 20.4: Typography Mapper Integration
 * Story 20.5: Spacing and Border Radius Integration
 *
 * This hook now supports two theme formats:
 * 1. HotelTheme (legacy): { typography: { displayFont, bodyFont } }
 * 2. HotelDesignTokens (Story 20.1): {
 *    typography: { headingPersonality, bodyPersonality, scaleRatio },
 *    spacing: { density },
 *    borderRadius: { borderRadius }
 *  }
 *
 * The typography mapper (Story 20.4) converts personality tokens into
 * CSS variable declarations with font family, weights, and tracking.
 *
 * The spacing mapper (Story 20.5) converts density enum into responsive
 * clamp() values for spacing tokens.
 *
 * The border radius mapper (Story 20.5) converts borderRadius enum into
 * pixel values for radius tokens.
 *
 * @param hotelId - Unique identifier for the hotel
 * @param theme - Either legacy HotelTheme or new HotelDesignTokens
 */
export function useHotelTheme(hotelId: string, theme: HotelTheme | HotelDesignTokens) {
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;

    // Story 20.4: Detect theme type and convert colors if necessary
    let colorsForGeneration: HotelTheme['colors'];
    let isHotelDesignTokens = false;

    if ('typography' in theme && 'headingPersonality' in theme.typography) {
      // New HotelDesignTokens format (Story 20.1 + Story 20.4 + Story 20.5)
      isHotelDesignTokens = true;
      const tokens = theme as HotelDesignTokens;

      // Story 20.5: Use the color adapter function instead of inline conversion
      if (tokens.colorScheme) {
        colorsForGeneration = hotelDesignTokensToBaseColors(tokens.colorScheme);
      } else {
        // Fallback if colorScheme is missing
        colorsForGeneration = (theme as HotelTheme).colors;
      }
    } else {
      // Legacy HotelTheme format
      colorsForGeneration = (theme as HotelTheme).colors;
    }

    // Generate full palette from base colors
    const generatedTheme = generateFullTheme(colorsForGeneration);

    // Apply all light mode CSS variables (shades + semantic tokens)
    const lightVars = mapShadesToCssVariables(generatedTheme);
    const lightEntries = Object.entries(lightVars);
    for (const [varName, value] of lightEntries) {
      root.style.setProperty(varName, value);
    }

    // Store dark mode overrides as a JSON data attribute for the dark mode toggle
    const darkVars = mapDarkModeCssVariables(generatedTheme);
    const darkEntries = Object.entries(darkVars);
    root.dataset.darkThemeVars = JSON.stringify(darkVars);

    // Apply typography
    // Story 20.4: Detect theme type and apply fonts accordingly
    if ('typography' in theme && 'headingPersonality' in theme.typography) {
      // New HotelDesignTokens format (Story 20.1 + Story 20.4)
      // Use typography mapper to convert personalities to CSS variables
      const tokens = theme as HotelDesignTokens;
      const typographyDeclaration = mapTypography(tokens);

      // Apply font family CSS variables from typography mapper
      root.style.setProperty('--font-display', typographyDeclaration.headingFont);
      root.style.setProperty('--font-body', typographyDeclaration.bodyFont);

      // Store font weights and tracking as data attributes for use in components
      root.dataset.headingWeights = JSON.stringify(typographyDeclaration.headingWeights);
      root.dataset.bodyWeights = JSON.stringify(typographyDeclaration.bodyWeights);
      root.dataset.headingTracking = typographyDeclaration.headingTracking.toString();
      root.dataset.bodyTracking = typographyDeclaration.bodyTracking.toString();
      root.dataset.scaleRatio = typographyDeclaration.scaleRatio.toString();
    } else {
      // Legacy HotelTheme format
      // Direct font names from theme.typography
      const legacyTheme = theme as HotelTheme;
      root.style.setProperty('--font-display', legacyTheme.typography.displayFont);
      root.style.setProperty('--font-body', legacyTheme.typography.bodyFont);
    }

    // Story 20.5: Apply spacing and border radius for HotelDesignTokens format
    // These are applied AFTER color variables to ensure proper CSS cascade order
    if (isHotelDesignTokens) {
      const tokens = theme as HotelDesignTokens;

      // Apply spacing density mapper (if spacing exists)
      if ('spacing' in tokens && (tokens as any).spacing?.density !== undefined) {
        const spacingVars = mapSpacingDensity((tokens as any).spacing.density);
        for (const [varName, value] of Object.entries(spacingVars)) {
          root.style.setProperty(varName, value);
        }
      }

      // Apply border radius mapper (if borderRadius exists)
      if ('borderRadius' in tokens && (tokens as any).borderRadius?.style !== undefined) {
        const radiusVars = mapBorderRadius((tokens as any).borderRadius.style);
        for (const [varName, value] of Object.entries(radiusVars)) {
          root.style.setProperty(varName, value);
        }
      }
    }

    // Set theme attribute for potential specific overrides
    root.setAttribute('data-theme', `hotel-${hotelId}`);

    // Listen for dark mode changes and apply dark vars
    const applyDarkMode = () => {
      const isDark = root.getAttribute('data-mode') === 'dark' ||
                     root.getAttribute('data-theme') === 'dark';
      if (isDark) {
        for (const [varName, value] of darkEntries) {
          root.style.setProperty(varName, value);
        }
      } else {
        // Re-apply light mode vars
        for (const [varName, value] of lightEntries) {
          root.style.setProperty(varName, value);
        }
      }
    };

    // Observe data-mode attribute changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-mode' || mutation.attributeName === 'data-theme') {
          applyDarkMode();
        }
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ['data-mode', 'data-theme'] });

    return () => observer.disconnect();
  }, [hotelId, theme]);
}
