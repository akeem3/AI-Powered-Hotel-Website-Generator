import { z } from 'zod';

// =============================================================================
// FEATURES CONTRACT
// =============================================================================
//
// Story 19.4: Features / USP Block (2 Structural Variants)
//
// This contract defines the schema for the Features component with two
// structural variants: IconGrid and Cards.
//
// Epic 19: Extended Block Library (Footer, About, FAQ, Features)
// FR Coverage: FR7, FR8, FR10
//
// =============================================================================

/**
 * Feature item schema
 * Represents a single feature/USP item with title, description, and optional icon/image
 * Used in both FeaturesIconGrid and FeaturesCards variants
 */
export const featureSchema = z.object({
  /**
   * Feature title
   * Short, descriptive heading for the feature (e.g., "24/7 Concierge Service")
   */
  title: z.string().min(2).max(100),

  /**
   * Feature description
   * Detailed description explaining the feature benefit (e.g., "Our dedicated team is available around the clock...")
   */
  description: z.string().min(10).max(500),

  /**
   * Icon name (optional)
   * Lucide icon name string for icon grid variant
   * Example: "ConciergeBell", "Wifi", "Car" etc.
   * If not provided, falls back to a default icon (Star or HelpCircle)
   */
  icon: z.string().optional(),

  /**
   * Image URL (optional)
   * Image URL for cards variant
   * If provided, renders image at top of card
   * If not provided, renders icon-only card
   */
  image: z.string().optional()
});

/**
 * Features Contract
 *
 * Validates all Features component props including variant selection,
 * optional heading, and features array.
 *
 * Variant Layouts:
 * - 'icon-grid': Grid of icon + title + description items (default)
 * - 'cards': Larger cards with optional image + title + description
 *
 * Column Options:
 * - 2: 2 columns on desktop (good for cards with lots of content)
 * - 3: 3 columns on desktop (default, balanced layout)
 * - 4: 4 columns on desktop (compact, good for simple features)
 *
 * @example
 * ```tsx
 * const featuresConfig: FeaturesConfig = {
 *   heading: 'Why Choose Us',
 *   features: [
 *     { title: 'Free WiFi', description: 'High-speed internet throughout the property', icon: 'Wifi' },
 *     { title: 'Pool & Spa', description: 'Relax in our heated pool and luxury spa', icon: 'Waves' },
 *     { title: 'Restaurant', description: 'On-site fine dining restaurant', icon: 'Utensils' }
 *   ],
 *   variant: { layout: 'icon-grid', columns: 3 }
 * };
 * ```
 */
export const FeaturesContract = z.object({
  /**
   * Variant configuration controlling layout and columns
   * layout: 'icon-grid' | 'cards'
   * - icon-grid: Compact icon-based grid (default)
   * - cards: Larger cards with optional images
   * columns: 2 | 3 | 4
   * - Controls grid column count on desktop
   */
  variant: z.object({
    layout: z.enum(['icon-grid', 'cards']).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional()
  }).optional(),

  /**
   * Section heading (optional)
   * Main title for the Features section
   * If not provided, the section wrapper may provide its own heading
   */
  heading: z.string().max(200).optional(),

  /**
   * Features array (required)
   * Array of feature items showcasing hotel USPs
   * Min 2 features to ensure meaningful content
   * Max 8 features to prevent visual clutter
   */
  features: z.array(featureSchema).min(2).max(8),

  /**
   * Additional CSS classes (optional)
   * For custom styling overrides
   */
  className: z.string().optional()
}).strict();

/**
 * Features Config Type
 * Inferred from FeaturesContract for use in component props
 */
export type FeaturesConfig = z.infer<typeof FeaturesContract>;
