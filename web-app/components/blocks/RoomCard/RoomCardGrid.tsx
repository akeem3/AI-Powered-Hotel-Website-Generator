/**
 * RoomCardGrid Server Component
 *
 * Displays grid-style room card with image, name, type, price, capacity, and amenities.
 * SEO-critical content - all room details are rendered server-side.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 *
 * @module components/blocks/RoomCard
 */

import React from 'react';
import Image from 'next/image';
import type { RoomCardProps } from '@/types/room';
import { cn } from '@/lib/utils/utils';

/**
 * RoomCardGrid Server Component
 *
 * Displays a grid-style room card with all essential information.
 * All content is server-rendered for SEO.
 *
 * Story 14.7 AC4: Room content (name, type, price, amenities) is in initial HTML.
 *
 * @component
 */
export default function RoomCardGrid({
  name,
  type,
  price,
  capacity,
  amenities,
  image,
  className = '',
}: RoomCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-primary overflow-hidden shadow-card',
        className
      )}
    >
      {image && (
        <div className="relative w-full h-image-card">
          <Image src={image} alt={name} fill className="object-cover" />
        </div>
      )}
      <div className="p-card text-center space-y-2">
        <h3 className="text-size-h3 font-medium text-brand-primary">{name}</h3>
        <p className="text-size-caption text-text-muted">{type}</p>
        <p className="text-brand-primary font-bold text-size-body-large tabular-nums">${price.toLocaleString()}</p>
        <p className="text-size-caption text-text-secondary">{capacity} guests</p>

        {amenities && amenities.length > 0 && (
          <ul className="flex flex-wrap justify-center gap-gap-card text-size-caption text-text-secondary mt-gap-card">
            {amenities.slice(0, 3).map((amenity, idx) => (
              <li key={idx} className="bg-surface-secondary px-gap-card py-1 rounded">
                {amenity}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
