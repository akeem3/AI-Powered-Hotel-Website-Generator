import { z } from 'zod';

// =============================================================================
// ABOUT CONTRACT
// =============================================================================
//
// Story 19.2: About / Hotel Story Block (3 Structural Variants)
//
// This contract defines the schema for the About component with three
// structural variants: SideBySide, Timeline, and FullWidth.
//
// Epic 19: Extended Block Library (Footer, About, FAQ, Features)
// FR Coverage: FR7, FR8, FR10
//
// =============================================================================

/**
 * Highlight item schema
 * Represents a single highlight/stat with label and value
 * Used for stat cards in AboutSideBySide and timeline entries in AboutTimeline
 */
export const highlightSchema = z.object({
  /**
   * Label for the highlight (e.g., "Founded", "Rooms", "Guests")
   * In AboutTimeline, this represents the year/label on one side
   */
  label: z.string().min(1).max(50),
  /**
   * Value for the highlight (e.g., "1892", "45", "500+")
   * In AboutTimeline, this represents the milestone description
   */
  value: z.string().min(1).max(200)
});

/**
 * About Contract
 *
 * Validates all About component props including variant selection,
 * heading, content, image, and highlights array.
 *
 * Variant Layouts:
 * - 'side-by-side': Two-column layout with image + text side by side
 * - 'timeline': Vertical timeline with hotel history milestones
 * - 'full-width': Full-width background image with text overlay (secondary hero style)
 *
 * Variant Image Position:
 * - 'left': Image appears on the left side (side-by-side layout)
 * - 'right': Image appears on the right side (side-by-side layout, default)
 *
 * @example
 * ```tsx
 * const aboutConfig: AboutConfig = {
 *   heading: 'Our Story',
 *   content: 'Founded in 1892, our hotel has been welcoming guests for over a century...',
 *   image: '/images/about-hotel.jpg',
 *   variant: {
 *     layout: 'side-by-side',
 *     imagePosition: 'right'
 *   },
 *   highlights: [
 *     { label: 'Founded', value: '1892' },
 *     { label: 'Rooms', value: '45' },
 *     { label: 'Awards', value: '15+' }
 *   ]
 * };
 * ```
 */
export const AboutContract = z.object({
  /**
   * Variant configuration controlling layout and visual style
   * layout: 'side-by-side' | 'timeline' | 'full-width'
   * - SideBySide: Two-column layout with image + text (default)
   * - Timeline: Vertical timeline with hotel history milestones
   * - FullWidth: Full-width background image with text overlay
   *
   * imagePosition: 'left' | 'right'
   * - Controls which side the image appears on (side-by-side layout only)
   * - right: Image on right side, text on left (default)
   * - left: Image on left side, text on right
   *
   * overlay: 'none' | 'light' | 'dark' | 'gradient'
   * - Controls the overlay style on full-width layout
   * - none: No overlay (text directly on image)
   * - light: Light overlay for better text readability
   * - dark: Dark overlay for better text readability
   * - gradient: Gradient overlay (default for full-width)
   *
   * textAlign: 'left' | 'center'
   * - Controls text alignment
   * - left: Left-aligned text (default for side-by-side)
   * - center: Center-aligned text (default for full-width and timeline)
   */
  variant: z.object({
    layout: z.enum(['side-by-side', 'timeline', 'full-width']).optional(),
    imagePosition: z.enum(['left', 'right']).optional(),
    overlay: z.enum(['none', 'light', 'dark', 'gradient']).optional(),
    textAlign: z.enum(['left', 'center']).optional()
  }).optional(),

  /**
   * Section heading (required)
   * Main title for the about section
   */
  heading: z.string().min(1).max(200),

  /**
   * About content (required)
   * Hotel story, history, or description
   * Plain text or markdown (paragraphs split by double newlines)
   */
  content: z.string().min(1).max(5000),

  /**
   * Background image URL (optional)
   * Used by AboutSideBySide and AboutFullWidth variants
   * AboutTimeline does not use the image field
   */
  image: z.string().max(500).optional(),

  /**
   * Highlights/Stats array (optional)
   * Array of label-value pairs for stat cards or timeline entries
   * Max 4 items to prevent visual clutter
   *
   * In AboutSideBySide: Renders as horizontal row of stat cards
   * In AboutTimeline: Renders as timeline entries (label = year, value = description)
   * In AboutFullWidth: Renders as stat cards in the overlay
   */
  highlights: z.array(highlightSchema).max(4).optional(),

  /**
   * Additional CSS classes (optional)
   * For custom styling overrides
   */
  className: z.string().optional()
}).strict();

/**
 * About Config Type
 * Inferred from AboutContract for use in component props
 */
export type AboutConfig = z.infer<typeof AboutContract>;
