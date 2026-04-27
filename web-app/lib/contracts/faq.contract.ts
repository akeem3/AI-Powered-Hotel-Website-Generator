import { z } from 'zod';

// =============================================================================
// FAQ CONTRACT
// =============================================================================
//
// Story 19.3: FAQ Block (2 Structural Variants)
//
// This contract defines the schema for the FAQ component with two
// structural variants: Accordion and Grid.
//
// Epic 19: Extended Block Library (Footer, About, FAQ, Features)
// FR Coverage: FR7, FR8, FR10
//
// =============================================================================

/**
 * Question item schema
 * Represents a single FAQ question-answer pair
 * Used in both FAQAccordion and FAQGrid variants
 */
export const questionSchema = z.object({
  /**
   * The question text
   * Should be clear and concise (e.g., "What is your cancellation policy?")
   */
  question: z.string().min(1).max(200),
  /**
   * The answer text
   * Detailed response to the question
   */
  answer: z.string().min(1).max(2000)
});

/**
 * FAQ Contract
 *
 * Validates all FAQ component props including variant selection,
 * optional heading, and questions array.
 *
 * Variant Layouts:
 * - 'accordion': Expandable/collapsible FAQ items (one visible at a time)
 * - 'grid': All Q&A pairs visible in a two-column grid layout
 *
 * @example
 * ```tsx
 * const faqConfig: FAQConfig = {
 *   heading: 'Frequently Asked Questions',
 *   questions: [
 *     { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before check-in.' },
 *     { question: 'Do you offer parking?', answer: 'Yes, we have free on-site parking available.' },
 *     { question: 'Is breakfast included?', answer: 'Continental breakfast is included for all guests.' }
 *   ],
 *   variant: { layout: 'accordion' }
 * };
 * ```
 */
export const FAQContract = z.object({
  /**
   * Variant configuration controlling layout
   * layout: 'accordion' | 'grid'
   * - accordion: Expandable accordion with one question visible at a time (default)
   * - grid: All Q&A pairs visible in a two-column grid
   */
  variant: z.object({
    layout: z.enum(['accordion', 'grid']).optional()
  }).optional(),

  /**
   * Section heading (optional)
   * Main title for the FAQ section
   * If not provided, the section wrapper may provide its own heading
   */
  heading: z.string().max(200).optional(),

  /**
   * Questions array (required)
   * Array of question-answer pairs
   * Min 3 questions to ensure meaningful content
   * Max 15 questions to prevent visual clutter
   */
  questions: z.array(questionSchema).min(3).max(15),

  /**
   * Additional CSS classes (optional)
   * For custom styling overrides
   */
  className: z.string().optional()
}).strict();

/**
 * FAQ Config Type
 * Inferred from FAQContract for use in component props
 */
export type FAQConfig = z.infer<typeof FAQContract>;
