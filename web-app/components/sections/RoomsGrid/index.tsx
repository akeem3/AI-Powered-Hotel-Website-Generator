/**
 * FeaturedRooms (RoomsGrid) Server Component
 *
 * Displays a responsive grid of room cards.
 * SEO-critical content - rooms are rendered server-side for search engines.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * Room cards can optionally include interactive booking buttons via Client Component children.
 *
 * @module components/sections/RoomsGrid
 */

import React from 'react';
import RoomCard from '@/components/blocks/RoomCard';
import type { RoomsGridProps } from '@/types/room';
import { cn } from '@/lib/utils/utils';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { RoomsGridSchema } from '@/lib/contracts/room.contract';

/**
 * FeaturedRooms component props
 *
 * Extends RoomsGridProps with optional content system props (for future use).
 */
interface FeaturedRoomsProps extends RoomsGridProps {
  /** Additional className */
  className?: string;
}

/**
 * FeaturedRooms Server Component
 *
 * Renders a responsive grid of room cards with SEO-critical content.
 * All room data is passed as props from parent Server Component.
 *
 * Story 14.7 AC4: SEO-critical content is server-rendered.
 * - Room names, descriptions, prices are in initial HTML
 * - Room cards are Server Components
 * - Optional booking buttons are Client Component children (when callbacks provided)
 *
 * @component
 * @example
 * ```tsx
 * // In Server Component (page.tsx)
 * import FeaturedRooms from '@/components/sections/RoomsGrid';
 *
 * const roomCards = rooms.map(room => ({
 *   id: room.id,
 *   name: room.name,
 *   type: room.room_type,
 *   price: 100,
 *   capacity: room.capacity_adults,
 *   amenities: [],
 *   image: room.featured_image,
 *   variant: 'detailed' as const,
 * }));
 *
 * <FeaturedRooms rooms={roomCards} variant="detailed" />
 * ```
 */
export default function FeaturedRooms(rawProps: FeaturedRoomsProps) {
  // Validate props against contract
  const props = validateInDev(RoomsGridSchema, rawProps, 'FeaturedRooms');

  const { rooms, className = '', variant = 'detailed', onBookNow } = props;

  // Handle empty state
  if (!rooms || rooms.length === 0) {
    return (
      <div className={cn('max-w-screen-xl mx-auto p-section text-center', className)}>
        <p className="text-text-muted italic">No rooms available at the moment.</p>
      </div>
    );
  }

  return (
    <section
      className={cn('max-w-screen-xl p-section', className)}
      aria-labelledby="rooms-heading"
    >
      <h2 id="rooms-heading" className="sr-only">Featured Rooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-section">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            {...room}
            variant={variant}
            onBookNow={onBookNow}
          />
        ))}
      </div>
    </section>
  );
}

FeaturedRooms.displayName = 'FeaturedRooms';
