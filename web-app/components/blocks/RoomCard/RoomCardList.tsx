/**
 * RoomCardList Server Component
 *
 * Displays a responsive grid of room cards.
 * SEO-critical content - rooms are rendered server-side for search engines.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 *
 * @module components/blocks/RoomCard
 */

import React from 'react';
import RoomCard from './index';
import type { RoomCardProps } from '@/types/room';
import { cn } from '@/lib/utils/utils';

/**
 * Props for RoomCardList component.
 */
export interface RoomCardListProps {
  /** Array of room data to display. Null/undefined is handled gracefully. */
  rooms: RoomCardProps[] | null;
  /** Room card variant to render */
  variant?: 'compact' | 'detailed' | 'grid';
  /** Optional callback when book now is clicked */
  onBookNow?: (roomId: string) => void;
  /** Optional callback when view details is clicked */
  onViewDetails?: (roomId: string) => void;
  /** Additional CSS classes for the grid container */
  className?: string;
}

/**
 * RoomCardList Server Component
 *
 * Renders a responsive grid of room cards.
 * All room content is server-rendered for SEO.
 *
 * @component
 * @example
 * ```tsx
 * import { RoomCardList } from '@/components/blocks/RoomCard';
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
 * <RoomCardList rooms={roomCards} variant="detailed" />
 * ```
 */
export default function RoomCardList({
  rooms,
  variant = 'detailed',
  onBookNow,
  onViewDetails,
  className,
}: RoomCardListProps): React.ReactElement {
  // Handle null/undefined rooms gracefully for error handling
  const safeRooms = rooms ?? [];

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8',
        className
      )}
    >
      {safeRooms.length === 0 ? (
        // Empty state
        <div className="col-span-full text-center py-section">
          <p className="text-text-muted italic">No rooms available at the moment.</p>
        </div>
      ) : (
        // Room cards
        safeRooms.map((room) => (
          <RoomCard
            key={room.id}
            {...room}
            variant={variant}
            onBookNow={onBookNow}
            onViewDetails={onViewDetails}
          />
        ))
      )}
    </div>
  );
}
