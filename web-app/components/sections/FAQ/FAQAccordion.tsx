'use client';

/**
 * FAQAccordion Component
 *
 * Story 19.3: FAQ Block - FAQAccordion Sub-Component
 *
 * Expandable/collapsible FAQ items with one question visible at a time.
 * Uses shadcn/ui Accordion primitive (Radix UI) with full keyboard navigation
 * and accessibility support built-in.
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/sections/FAQ/FAQAccordion
 */

import React from 'react';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { FAQContract, type FAQConfig } from '@/lib/contracts/faq.contract';
import { cn } from '@/lib/utils/utils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

/**
 * FAQAccordion Component Props
 *
 * Extends FAQConfig for type safety.
 */
export interface FAQAccordionProps extends FAQConfig {}

/**
 * FAQAccordion Component
 *
 * Expandable/collapsible FAQ items with single-open mode.
 * One question visible at a time for focused reading experience.
 *
 * Features:
 * - Single-open mode (one item expanded at a time)
 * - Full keyboard navigation (Enter/Space to toggle, Arrow keys to navigate)
 * - Screen reader compatible (ARIA attributes from Radix UI)
 * - Entire header clickable (not just icon)
 * - Smooth expand/collapse animations
 *
 * @example
 * ```tsx
 * <FAQAccordion
 *   heading="Frequently Asked Questions"
 *   questions={[
 *     { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 24 hours before check-in.' },
 *     { question: 'Do you offer parking?', answer: 'Yes, we have free on-site parking available.' }
 *   ]}
 * />
 * ```
 */
export default function FAQAccordion(rawProps: FAQAccordionProps) {
  // Validate props against contract
  const props = validateInDev(FAQContract, rawProps, 'FAQAccordion');

  const { heading, questions, className } = props;

  return (
    <section
      className={cn('w-full py-section', className)}
      aria-labelledby="faq-heading"
    >
      <div className="max-w-4xl mx-auto p-container">
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

        {/* Accordion with single-open mode */}
        <Accordion
          type="single"
          collapsible
          className="w-full"
        >
          {questions.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-border-default last:border-0"
            >
              <AccordionTrigger className="py-card text-text-primary text-size-body font-semibold text-left hover:text-brand-secondary transition-colors data-[state=open]:text-brand-secondary">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-text-secondary text-size-body leading-relaxed pb-card">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/**
 * Export type for external use
 * Note: FAQAccordionProps is already exported as an interface above (line 34)
 */
