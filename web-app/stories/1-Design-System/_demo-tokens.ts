/**
 * Shared demo tokens for Design System stories
 *
 * This file centralizes all hardcoded demo colors used across Storybook stories.
 * All values reference the design system's default palette from globals.css.
 */

// Default hotel base colors (matching ColorPalette.stories.tsx)
// These are the same values used in @layer theme :root in globals.css
export const DEFAULT_BASE_COLORS = {
  brandPrimary: 'oklch(0.346 0.074 256)',   // Deep blue (primary-700)
  brandSecondary: 'oklch(0.748 0.099 86.1)', // Gold (secondary-600)
  brandAccent: 'oklch(0.65 0.15 200)',      // Cyan (accent-600)
  statusSuccess: 'oklch(0.448 0.108 151.3)', // Green (success-700)
  statusError: 'oklch(0.577 0.215 27.3)',    // Red (error-700)
} as const;

// Semantic color classes for demo components
// These replace hardcoded bg-blue-*, text-gray-*, etc.

// Background colors for color-coded sections
export const DEMO_SECTION_COLORS = {
  input: 'bg-surface-elevated border-border-default',
  generation: 'bg-surface-elevated border-border-default',
  mapping: 'bg-surface-elevated border-border-default',
  application: 'bg-surface-elevated border-border-default',
  required: 'bg-status-error/10 border-status-error/30',
  optional: 'bg-brand-primary/10 border-brand-primary/30',
} as const;

// Status indicator colors
export const DEMO_STATUS_COLORS = {
  pass: 'text-status-success',
  fail: 'text-status-error',
  warning: 'text-status-warning',
} as const;

// Text colors (replacing text-gray-*)
export const DEMO_TEXT_COLORS = {
  primary: 'text-text-primary',
  secondary: 'text-text-secondary',
  muted: 'text-text-muted',
  inverted: 'text-text-inverted',
} as const;

// Border colors
export const DEMO_BORDER_COLORS = {
  default: 'border-border-default',
  strong: 'border-border-strong',
} as const;

// Common demo container styles
export const DEMO_CONTAINER_CLASS = 'p-6 bg-surface-primary rounded-lg border-border-default';
export const DEMO_CARD_CLASS = 'p-4 bg-surface-elevated rounded-lg border-border-default';

// Inline style alternatives (use these instead of style={{}})
// For dynamic sizing in demos
export const DEMO_SIZE_CLASSES = {
  square: 'w-32 h-32',
  circle: 'w-24 h-24 rounded-full',
  small: 'w-16 h-16',
  medium: 'w-24 h-24',
  large: 'w-32 h-32',
} as const;
