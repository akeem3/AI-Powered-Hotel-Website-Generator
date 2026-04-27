/**
 * Centralized Generic Content Defaults
 *
 * @trace epic: EPIC-11, EPIC-13
 * @trace story: STORY-11.08, STORY-13.1.3
 * @trace reqs: AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8
 *
 * Why: These defaults are the final fallback tier in the 3-tier content resolution chain:
 * 1. Content JSON (from CDN, highest priority)
 * 2. Component Props (explicitly passed to component)
 * 3. Generic Defaults (this file, lowest priority)
 *
 * These defaults MUST be hotel-agnostic generic placeholders. They are used when:
 * - Content JSON is unavailable (network failure, CDN down, or content system disabled)
 * - Component props are not provided
 * - Content system is disabled via feature flag
 *
 * CRITICAL: Never use hotel-specific branding like "The Sterling Executive" in this file.
 * The platform supports 10,000+ unique hotel websites, and hardcoded defaults would
 * display the wrong branding on all other hotel sites when content is unavailable.
 *
 * Environment-Specific Behavior (Story 13.1.3):
 * - Development: Shows generic placeholders for graceful degradation
 * - Production: Critical fields (title) return empty string to trigger validation errors
 *   This ensures missing content is detected early rather than showing wrong branding
 *
 * @see web-app/lib/content/fallback.ts - Fallback resolution logic
 * @see web-app/lib/content/featureFlags.ts - Content enable/disable system
 */

/**
 * Check if we're in production environment.
 * Extracted for testability.
 */
export const isProduction = (): boolean => process.env.NODE_ENV === 'production';

/**
 * Centralized generic content defaults for all components.
 *
 * Uses const assertion for type safety and immutability.
 *
 * @example
 * ```tsx
 * import { CONTENT_DEFAULTS } from '@/lib/content/defaults';
 *
 * const title = resolveFallback(
 *   contentValue,
 *   propsValue,
 *   CONTENT_DEFAULTS.hero.title
 * );
 * ```
 */
export const CONTENT_DEFAULTS = {
  /** Hero section defaults */
  hero: {
    /** Generic hotel name placeholder - DO NOT use hotel-specific names */
    title: 'Hotel Name',
    /** Generic tagline placeholder */
    tagline: 'Your Comfort is Our Priority',
    /** Generic headline placeholder */
    headline: 'Welcome to Our Hotel',
    /** Generic primary CTA text */
    primaryCTA: {
      text: 'Book Now',
      href: '/booking',
    },
    /** Generic secondary CTA text */
    secondaryCTA: {
      text: 'Learn More',
      href: '/about',
    },
    /** Generic image placeholder */
    backgroundImage: '/images/hotel-img.jpg',
    /** Generic image alt text */
    imageAlt: 'Hotel exterior',
  },
  /** Amenities section defaults */
  amenities: {
    /** Generic amenities section heading */
    heading: 'Our Amenities',
    /** Generic amenities section subheading */
    subheading: 'Discover our facilities',
  },
  /** Testimonials section defaults */
  testimonials: {
    /** Generic testimonials section heading */
    heading: 'Guest Reviews',
    /** Generic testimonials section subheading */
    subheading: 'What our guests say',
  },
} as const;

/**
 * TypeScript type for content defaults.
 *
 * Derived from CONTENT_DEFAULTS const assertion.
 * Use this type for props that accept default values.
 *
 * @example
 * ```tsx
 * type Defaults = typeof CONTENT_DEFAULTS;
 * // or
 * import type { ContentDefaults } from '@/lib/content/defaults';
 * ```
 */
export type ContentDefaults = typeof CONTENT_DEFAULTS;

/**
 * Hero section defaults type.
 *
 * @example
 * ```tsx
 * import type { HeroDefaults } from '@/lib/content/defaults';
 *
 * const defaults: HeroDefaults = CONTENT_DEFAULTS.hero;
 * ```
 */
export type HeroDefaults = typeof CONTENT_DEFAULTS.hero;

/**
 * Amenities section defaults type.
 *
 * @example
 * ```tsx
 * import type { AmenitiesDefaults } from '@/lib/content/defaults';
 *
 * const defaults: AmenitiesDefaults = CONTENT_DEFAULTS.amenities;
 * ```
 */
export type AmenitiesDefaults = typeof CONTENT_DEFAULTS.amenities;

/**
 * Testimonials section defaults type.
 *
 * @example
 * ```tsx
 * import type { TestimonialsDefaults } from '@/lib/content/defaults';
 *
 * const defaults: TestimonialsDefaults = CONTENT_DEFAULTS.testimonials;
 * ```
 */
export type TestimonialsDefaults = typeof CONTENT_DEFAULTS.testimonials;

/**
 * Validates that a value is a hotel-agnostic generic placeholder.
 *
 * Use this to ensure new defaults don't accidentally include hotel-specific branding.
 *
 * @param value - Value to validate
 * @returns True if value is hotel-agnostic
 *
 * @example
 * ```tsx
 * if (!isGenericDefault('The Sterling Executive')) {
 *   throw new Error('Hotel-specific default detected!');
 * }
 * ```
 */
export function isGenericDefault(value: string): boolean {
  // List of known hotel-specific strings that MUST NOT appear in defaults
  const hotelSpecificStrings = [
    'The Sterling Executive',
    'Sterling Executive',
    'Experience Boutique Luxury',
    'Where Comfort Meets Prestige',
    'Where Business Meets Boutique Excellence',
    'sterlingexecutive.com',
  ];

  const lowerValue = value.toLowerCase();
  return !hotelSpecificStrings.some((str) =>
    lowerValue.includes(str.toLowerCase())
  );
}

/**
 * Asserts that a value is hotel-agnostic.
 * Throws an error if hotel-specific branding is detected.
 *
 * @param value - Value to validate
 * @throws Error if hotel-specific string detected
 *
 * @example
 * ```tsx
 * assertGenericDefault(CONTENT_DEFAULTS.hero.title); // OK
 * assertGenericDefault('The Sterling Executive'); // Throws Error
 * ```
 */
export function assertGenericDefault(value: string): asserts value is string {
  if (!isGenericDefault(value)) {
    throw new Error(
      `Hotel-specific branding detected in default value: "${value}". ` +
        'Defaults must be hotel-agnostic generic placeholders. ' +
        'See web-app/lib/content/defaults.ts for examples.'
    );
  }
}

/**
 * Critical fields that MUST have content in production.
 * These fields return empty string in production to trigger validation errors.
 */
export const CRITICAL_CONTENT_FIELDS = ['hero.title'] as const;

/**
 * Environment-aware content defaults.
 *
 * In development: Returns generic placeholders for graceful degradation
 * In production: Critical fields return empty string to trigger errors
 *
 * This ensures that missing content configuration is detected early in production
 * rather than silently displaying generic "Hotel Name" to customers.
 *
 * @example
 * ```tsx
 * import { getContentDefault } from '@/lib/content/defaults';
 *
 * // In development: returns 'Hotel Name'
 * // In production: returns '' (empty string triggers validation)
 * const title = getContentDefault('hero.title');
 * ```
 */
export function getContentDefault(
  field: 'hero.title' | 'hero.tagline' | 'hero.headline' | 'amenities.heading' | 'amenities.subheading' | 'testimonials.heading' | 'testimonials.subheading'
): string {
  const isCritical = CRITICAL_CONTENT_FIELDS.includes(field as typeof CRITICAL_CONTENT_FIELDS[number]);

  // In production, critical fields return empty to trigger validation errors
  if (isProduction() && isCritical) {
    return '';
  }

  // Return the static default value
  const [section, key] = field.split('.') as ['hero' | 'amenities' | 'testimonials', string];
  const sectionDefaults = CONTENT_DEFAULTS[section];
  return (sectionDefaults as Record<string, unknown>)[key] as string;
}

/**
 * Fallback usage tracking for monitoring.
 *
 * Tracks when defaults are used instead of content/props.
 * In production, logs warnings for critical fields to help detect content issues.
 */
interface FallbackUsageEvent {
  component: string;
  field: string;
  source: 'content' | 'props' | 'default';
  hotelId?: string;
  timestamp: number;
}

// In-memory buffer for fallback events (for testing and debugging)
let fallbackUsageBuffer: FallbackUsageEvent[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Log when a fallback occurs during content resolution.
 *
 * In production: Logs warning for critical fields using defaults
 * In development: Silent unless explicitly enabled
 *
 * @param component - Component name (e.g., 'HeroSection')
 * @param field - Field name (e.g., 'title')
 * @param source - Where the value came from ('content', 'props', 'default')
 * @param hotelId - Optional hotel ID for context
 *
 * @example
 * ```tsx
 * logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');
 * // In production: console.warn('[Content Fallback] HeroSection.title using default for hotel-123')
 * ```
 */
export function logFallbackUsage(
  component: string,
  field: string,
  source: 'content' | 'props' | 'default',
  hotelId?: string
): void {
  const event: FallbackUsageEvent = {
    component,
    field,
    source,
    hotelId,
    timestamp: Date.now(),
  };

  // Buffer events for potential aggregation/reporting
  fallbackUsageBuffer.push(event);
  if (fallbackUsageBuffer.length > MAX_BUFFER_SIZE) {
    fallbackUsageBuffer = fallbackUsageBuffer.slice(-MAX_BUFFER_SIZE);
  }

  // Only warn in production when defaults are used (indicates missing content)
  if (source === 'default' && isProduction()) {
    const fieldPath = `${component}.${field}`;
    const isCritical = CRITICAL_CONTENT_FIELDS.some(f => f.includes(field));
    const hotelContext = hotelId ? ` for hotel ${hotelId}` : '';

    if (isCritical) {
      console.error(
        `[Content Fallback] CRITICAL: ${fieldPath} using default${hotelContext}. ` +
        'This indicates missing content configuration. Please check content JSON.'
      );
    } else {
      console.warn(
        `[Content Fallback] ${fieldPath} using default${hotelContext}. ` +
        'Consider configuring this content in the content JSON.'
      );
    }
  }
}

/**
 * Get recent fallback usage events (for testing/debugging).
 *
 * @returns Array of recent fallback events
 */
export function getFallbackUsageBuffer(): readonly FallbackUsageEvent[] {
  return [...fallbackUsageBuffer];
}

/**
 * Clear the fallback usage buffer (for testing).
 */
export function clearFallbackUsageBuffer(): void {
  fallbackUsageBuffer = [];
}

/**
 * Flush fallback usage events to LangFuse for monitoring.
 * Call this periodically or at the end of a request cycle.
 *
 * @trace story: STORY-13.5.2
 *
 * Why: Aggregates fallback events and sends them to LangFuse for centralized monitoring.
 * Groups events by component+field to reduce noise. This enables tracking which content
 * fields are frequently falling back to defaults, helping identify content issues.
 *
 * @param langfuseTrace - Optional LangFuse trace to attach events to
 *
 * @example
 * ```tsx
 * import { langfuseTrace } from '@/lib/langfuse';
 * import { flushFallbackEventsToLangfuse } from '@/lib/content/defaults';
 *
 * // At end of request cycle
 * flushFallbackEventsToLangfuse(langfuseTrace);
 * ```
 */
export function flushFallbackEventsToLangfuse(langfuseTrace?: {
  event: (opts: { name: string; input?: unknown }) => void;
}): void {
  const events = getFallbackUsageBuffer();
  if (events.length === 0 || !langfuseTrace) return;

  // Group events by component_field for cleaner logging
  const grouped = events.reduce(
    (acc, event) => {
      const key = `${event.component}_${event.field}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    },
    {} as Record<string, FallbackUsageEvent[]>
  );

  Object.entries(grouped).forEach(([key, groupEvents]) => {
    langfuseTrace.event({
      name: 'fallback_usage',
      input: {
        key,
        count: groupEvents.length,
        sources: Array.from(new Set(groupEvents.map((e) => e.source))),
        hotelIds: Array.from(new Set(groupEvents.map((e) => e.hotelId))),
      },
    });
  });

  clearFallbackUsageBuffer();
}

/**
 * Validate that required content exists in production.
 *
 * Call this after content resolution to ensure critical fields have values.
 * In production, throws an error if critical fields are empty.
 * In development, logs a warning but allows rendering to continue.
 *
 * @param values - Object with field names and their resolved values
 * @param component - Component name for error context
 * @throws Error in production if critical fields are empty
 *
 * @example
 * ```tsx
 * validateRequiredContent({
 *   title: resolvedTitle,
 *   headline: resolvedHeadline,
 * }, 'HeroSection');
 * ```
 */
export function validateRequiredContent(
  values: Record<string, string | undefined | null>,
  component: string
): void {
  const missingCritical: string[] = [];

  for (const [field, value] of Object.entries(values)) {
    const fieldPath = `${component.toLowerCase()}.${field}`;
    const isCritical = CRITICAL_CONTENT_FIELDS.some(f => f.includes(field) || f === fieldPath);

    if (isCritical && (!value || value.trim() === '')) {
      missingCritical.push(field);
    }
  }

  if (missingCritical.length > 0) {
    const message =
      `[${component}] Missing required content for fields: ${missingCritical.join(', ')}. ` +
      'Content JSON must provide values for critical fields in production. ' +
      'Check that content is properly loaded and configured.';

    if (isProduction()) {
      throw new Error(message);
    } else {
      console.warn(message + ' (In development, rendering with generic placeholders)');
    }
  }
}
