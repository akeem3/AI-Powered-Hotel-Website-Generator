'use client';

import { useHotelTheme } from '@/lib/hooks/useHotelTheme';
import type { HotelDesignTokens } from '@/lib/style-generation/schemas/hotel-design-tokens.schema';

/**
 * ThemeApplier - Client component that applies design tokens as CSS variables.
 *
 * Bridges the Server Component preview page to the client-side useHotelTheme hook.
 * Accepts designTokens from the HomepageConfig and applies colors, typography,
 * spacing, and border radius to :root via CSS custom properties.
 *
 * @param hotelId - Unique identifier for the hotel (used for data-theme attribute)
 * @param designTokens - Optional HotelDesignTokens from the generated config
 * @param children - Child components to render
 */
export function ThemeApplier({
  hotelId,
  designTokens,
  children,
}: {
  hotelId: string;
  designTokens?: HotelDesignTokens;
  children: React.ReactNode;
}) {
  // Always call hook unconditionally (React Rules of Hooks).
  // useHotelTheme already guards with `if (!theme) return;` internally.
  useHotelTheme(hotelId, designTokens as HotelDesignTokens);
  return <>{children}</>;
}
