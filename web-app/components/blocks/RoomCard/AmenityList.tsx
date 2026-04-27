/**
 * AmenityList Server Component
 *
 * Displays a list of room amenities as tags.
 * SEO-critical content - amenities are rendered server-side.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 *
 * @module components/blocks/RoomCard
 */

import React from 'react';
import { cn } from '@/lib/utils/utils';

/**
 * AmenityList component props
 */
export interface AmenityListProps {
  /** Array of amenity names to display */
  amenities: string[];
  /** Additional className */
  className?: string;
}

/**
 * AmenityList Server Component
 *
 * Renders a list of amenity tags.
 * All content is server-rendered for SEO.
 *
 * @component
 */
export default function AmenityList({ amenities, className = '' }: AmenityListProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn('flex flex-wrap gap-gap-card text-size-caption text-text-muted', className)}
      role="list"
      aria-label="List of room amenities"
    >
      {amenities.map((item, idx) => (
        <li
          key={idx}
          className="bg-surface-secondary px-gap-card py-1 rounded-md"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
