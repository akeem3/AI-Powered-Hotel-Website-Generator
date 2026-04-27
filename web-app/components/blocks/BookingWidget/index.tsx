// web-app/components/blocks/BookingWidget/index.tsx
'use client';

import React, { useEffect, useState } from 'react';
import BookingWidgetMobile from './BookingWidgetMobile';
import BookingWidgetDesktop from './BookingWidgetDesktop';
import type { BookingWidgetProps, BookingData } from '@/types/booking';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { BookingWidgetContract, BookingDataContract } from '@/lib/contracts/booking.contract';
import { BookingWidgetRegistry } from '@/registry/bookingRegistry';

/*
  BookingWidget (wrapper)
  - Chooses mobile or desktop implementation based on `variant` prop (if provided)
    else falls back to checking window width (client-only).
  - Validates incoming props in development using validateInDev (non-throwing).
  - Performs final BookingData validation on submit using BookingDataContract.
  - Calls provided onSubmit callback when validation passes.
*/

if (process.env.NODE_ENV === 'development') {
  console.info('[Registry]', BookingWidgetRegistry.name, BookingWidgetRegistry);
}

import { bookingWidgetVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';

// ... (imports remain same)

export default function BookingWidget(rawProps: BookingWidgetProps) {
  // Validate widget props in development only (safe, non-throwing)
  const props = validateInDev(
    BookingWidgetContract,
    rawProps,
    'BookingWidget'
  ) as BookingWidgetProps;

  const { variant: variantProp, theme, defaultValues, className, onSubmit } = props;

  // client-only: responsive fallback if user didn't pass variant prop
  const [variant, setVariant] = useState<'mobile' | 'desktop'>(() => variantProp ?? 'desktop');

  useEffect(() => {
    // if variant was not explicitly provided, determine by window width
    if (variantProp) return;
    const mql = window.matchMedia('(max-width: 767px)');
    const apply = () => setVariant(mql.matches ? 'mobile' : 'desktop');
    apply();
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, [variantProp]);

  // Submit handler used by both variants.
  const handleSubmit = (data: BookingData) => {
    // Validate booking payload before calling onSubmit
    const validation = BookingDataContract.safeParse(data);
    if (!validation.success) {
      // In dev we log full error; production flow can show minimal message
      console.error('[Booking Validation Error]', validation.error.issues);
      // Optionally you could surface validation errors to UI via an event or callback
      return;
    }
    // call onSubmit if provided (note: this is client-side)
    onSubmit?.(validation.data);
  };

  // Render chosen variant and pass down handlers and defaultValues.
  // CRITICAL: Set data-mode attribute to enable CSS variable cascade for theme-aware semantic tokens
  // This follows the established pattern used in Storybook (see .storybook/preview.ts)
  // Enables nested components using bg-surface-primary, text-text-primary, etc. to respond to theme
  return (
    <div
      className={cn(bookingWidgetVariants({ variant, theme }), className)}
      data-mode={theme}
    >
      {variant === 'mobile' ? (
        <BookingWidgetMobile defaultValues={defaultValues} onSubmit={handleSubmit} />
      ) : (
        <BookingWidgetDesktop defaultValues={defaultValues} onSubmit={handleSubmit} />
      )}
    </div>
  );
}
