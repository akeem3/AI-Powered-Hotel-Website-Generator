'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/utils';
import { LinkButtonContract, type LinkButtonConfig } from '@/lib/contracts/linkbutton.contract';
import { validateInDev } from '@/lib/contracts/validate.dev';

/**
 * LinkButton Component
 *
 * Issue #4: Renders a styled link button for "View More" functionality.
 * Used in teaser sections to link to full dedicated pages.
 *
 * @example
 * ```tsx
 * <LinkButton
 *   text="View Full Gallery"
 *   href="/gallery"
 *   ariaLabel="View full photo gallery"
 *   center
 * />
 * ```
 */

interface LinkButtonProps extends LinkButtonConfig {}

export function LinkButton(props: LinkButtonProps) {
  // Validate props against contract in development
  const validatedProps = validateInDev(LinkButtonContract, props, 'LinkButton');

  const { text, href, ariaLabel, center = false, className } = validatedProps;
  const wrapperClass = center ? 'mt-gap-card text-center' : 'mt-gap-card';

  return (
    <div className={wrapperClass}>
      <Link
        href={href}
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-surface-primary font-medium rounded-sm hover:bg-brand-primary/90 transition-colors duration-200 focus-ring',
          className
        )}
      >
        <span>{text}</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

export default LinkButton;
