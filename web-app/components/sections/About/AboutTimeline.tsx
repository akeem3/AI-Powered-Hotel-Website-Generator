/**
 * AboutTimeline Component
 *
 * Story 19.2: About Block - AboutTimeline Sub-Component
 *
 * Vertical timeline with center line and alternating left/right entries.
 * Single column on mobile, alternating on desktop.
 * Timeline entries derived from highlights array (label = year, value = milestone).
 * Falls back to content block if highlights empty.
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module components/sections/About/AboutTimeline
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { AboutContract, type AboutConfig } from '@/lib/contracts/about.contract';
import { aboutTimelineVariants } from '@/lib/cva-variants';

/**
 * AboutTimeline Component Props
 *
 * Extends AboutConfig for type safety.
 */
export interface AboutTimelineProps extends AboutConfig {}

/**
 * Timeline Entry Component
 *
 * Renders a single timeline entry with year/label and description.
 */
function TimelineEntry({
  label,
  value,
  index,
  isAlternating
}: {
  label: string;
  value: string;
  index: number;
  isAlternating: boolean;
}) {
  // Alternating layout: even indices on left, odd on right
  const isLeft = isAlternating ? index % 2 === 0 : true;

  return (
    <div className={cn(
      "relative flex items-start gap-gap-card md:gap-gap-section",
      // Mobile: always left-aligned
      "md:flex-row",
      // Desktop: alternating layout
      isAlternating && isLeft ? "md:flex-row" : "md:flex-row-reverse"
    )}>
      {/* Timeline dot container - positioned absolutely */}
      <div className={cn(
        "absolute top-0 w-4 h-4 rounded-full bg-brand-primary border-4 border-surface-primary z-10 hidden md:block",
        // Position dot on center line
        "left-1/2 -translate-x-1/2"
      )}>
        <span className="sr-only">Timeline point</span>
      </div>

      {/* Mobile timeline dot */}
      <div className="absolute left-1.5 top-0 w-3 h-3 rounded-full bg-brand-primary border-2 border-surface-primary z-10 md:hidden" />

      {/* Content side */}
      <div className={cn(
        "flex-1",
        // Desktop alignment based on position
        isAlternating && isLeft ? "md:text-right md:pr-8" : "md:text-left md:pl-8",
        // Mobile: always left-aligned with padding for dot (using container token for ~16-32px)
        "pl-container md:pl-0"
      )}>
        {/* Year/Label */}
        <time className="text-brand-secondary font-bold text-size-body-large inline-block mb-2">
          {label}
        </time>

        {/* Description */}
        <p className="text-text-secondary text-size-body leading-relaxed">
          {value}
        </p>
      </div>

      {/* Empty side for alternating layout on desktop */}
      {isAlternating && (
        <div className="hidden md:block md:flex-1" />
      )}
    </div>
  );
}

/**
 * AboutTimeline Component
 *
 * Vertical timeline with hotel history milestones.
 *
 * @example
 * ```tsx
 * <AboutTimeline
 *   heading="Our History"
 *   content="Over 130 years of hospitality excellence..."
 *   highlights={[
 *     { label: '1892', value: 'Hotel founded by John Sterling' },
 *     { label: '1950', value: 'Major renovation and expansion' }
 *   ]}
 * />
 * ```
 */
export default function AboutTimeline(rawProps: AboutTimelineProps) {
  // Validate props against contract
  const props = validateInDev(AboutContract, rawProps, 'AboutTimeline');

  const {
    heading,
    content,
    highlights,
    className,
    variant
  } = props;

  // Destructure variant with defaults
  const { layout } = variant || {};
  const entryAlignment = layout === 'timeline' ? 'alternating' : 'alternating';

  // Build CVA variant props
  const variantProps = {
    entryAlignment: entryAlignment as VariantProps<typeof aboutTimelineVariants>['entryAlignment']
  };

  // Check if we have highlights to display as timeline
  const hasHighlights = highlights && highlights.length > 0;

  return (
    <section
      className={cn(aboutTimelineVariants(variantProps), className)}
      aria-labelledby="about-heading"
    >
      <div className="max-w-4xl mx-auto">
        {/* Gold Bar Header - Section heading pattern matching other sections */}
        <div className="text-center mb-gap-section">
          {/* Gold Accent Bar */}
          <div className="flex items-center justify-center mb-gap-card">
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
            <div className="size-1 mx-gap-card rounded-full bg-brand-secondary"></div>
            <div className="h-divider w-divider-sm bg-brand-secondary"></div>
          </div>

          <h2
            id="about-heading"
            className="mb-gap-card font-display text-size-h2 text-brand-primary leading-tight"
          >
            {heading}
          </h2>

          {/* Gold Underline Accent */}
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto"></div>
        </div>

        {/* Optional content intro */}
        {content && (
          <p className="text-text-secondary text-size-body leading-relaxed text-center max-w-2xl mx-auto mb-gap-section">
            {content}
          </p>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Center line (desktop only) */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-brand-secondary -translate-x-1/2" aria-hidden="true" />

          {/* Mobile left line */}
          <div className="md:hidden absolute left-1.5 top-0 bottom-0 w-px bg-border-default" aria-hidden="true" />

          {/* Timeline entries */}
          {hasHighlights ? (
            <div className="space-y-gap-section">
              {highlights.map((highlight, index) => (
                <TimelineEntry
                  key={index}
                  label={highlight.label}
                  value={highlight.value}
                  index={index}
                  isAlternating={entryAlignment === 'alternating'}
                />
              ))}
            </div>
          ) : (
            /* Fallback: content-only display if no highlights */
            <div className="text-center py-gap-section">
              <p className="text-text-muted text-size-body italic">
                No timeline milestones available.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
