/**
 * FAQGrid Component
 *
 * Story 19.3: FAQ Block - FAQGrid Sub-Component
 *
 * All Q&A pairs visible in a two-column grid layout.
 * Server component with no interactivity - all content visible at once.
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/sections/FAQ/FAQGrid
 */

import React from 'react';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { FAQContract, type FAQConfig } from '@/lib/contracts/faq.contract';
import { cn } from '@/lib/utils/utils';

/**
 * FAQGrid Component Props
 *
 * Extends FAQConfig for type safety.
 */
export interface FAQGridProps extends FAQConfig {}

/**
 * FAQGrid Component
 *
 * All Q&A pairs visible in a two-column grid layout.
 * Server component with no interactivity required.
 *
 * Responsive Design:
 * - Desktop: 2-column grid
 * - Mobile: Single column (stacked)
 *
 * @example
 * ```tsx
 * <FAQGrid
 *   heading="Frequently Asked Questions"
 *   questions={[
 *     { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before check-in.' },
 *     { question: 'Do you offer parking?', answer: 'Yes, we have free on-site parking available.' }
 *   ]}
 * />
 * ```
 */
export default function FAQGrid(rawProps: FAQGridProps) {
  // Validate props against contract
  const props = validateInDev(FAQContract, rawProps, 'FAQGrid');

  const { heading, questions, className } = props;

  return (
    <section
      className={cn('w-full py-section', className)}
      aria-labelledby="faq-heading"
    >
      <div className="max-w-6xl mx-auto p-container">
        {/* Gold Bar Header - Section heading pattern matching other sections */}
        {heading && (
          <div className="text-center mb-gap-section">
            {/* Gold Accent Bar */}
            <div className="flex items-center justify-center mb-gap-card">
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
              <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
              <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            </div>

            <h2
              id="faq-heading"
              className="mb-gap-card font-display text-size-h2 text-brand-primary leading-tight"
            >
              {heading}
            </h2>

            {/* Gold Underline Accent */}
            <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto"></div>
          </div>
        )}

        {/* Two-column grid layout - responsive to single column on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gap-section">
          {questions.map((item, index) => (
            <div
              key={index}
              className="bg-surface-elevated rounded-lg p-card border border-border-subtle hover:border-brand-secondary hover:shadow-md transition-all duration-200"
            >
              {/* Question - bold/medium weight */}
              <h3 className="text-brand-primary text-size-body-large font-semibold mb-gap-card/2">
                {item.question}
              </h3>

              {/* Answer - regular weight */}
              <p className="text-text-secondary text-size-body leading-relaxed">
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
