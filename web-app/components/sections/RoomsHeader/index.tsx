'use client';

import React from 'react';
import type { RoomsHeaderProps } from '@/types/room';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { RoomsHeaderSchema } from '@/lib/contracts/room.contract';
import { cn } from '@/lib/utils/utils';

/*
  RoomsHeader
  - Page header for the Rooms page.
  - Displays title, optional subtitle and description.
  - Simple, semantic and accessible (h1 for main title).
*/
export default function RoomsHeader(rawProps: RoomsHeaderProps) {
  const {
    title = 'Our Luxury Rooms & Suites',
    subtitle = 'Experience comfort and elegance in our carefully designed accommodations.',
    description = 'Each room at The Sterling Executive is thoughtfully appointed with modern amenities and sophisticated furnishings to ensure your stay is both productive and relaxing.',
    className = '',
  } = validateInDev(RoomsHeaderSchema, rawProps, 'RoomsHeader');

  return (
    <header className={cn("max-w-6xl mx-auto p-hero text-center space-y-gap-card", className)}>

      <p className="text-size-overline font-semibold uppercase tracking-wide text-brand-secondary mb-card">
        {subtitle}
      </p>
      <h1 className="text-size-display font-display text-brand-primary mb-card">{title}</h1>
      <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto rounded-full" />
      <p className="text-size-body text-text-secondary max-w-3xl mx-auto leading-relaxed">{description}</p>
    </header>
  );
}

RoomsHeader.displayName = 'RoomsHeader';
