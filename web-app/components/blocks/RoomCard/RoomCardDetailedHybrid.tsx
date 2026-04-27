/**
 * RoomCardDetailed Hybrid Component
 *
 * Composes Server Component content with Client Component buttons.
 * The main component is a Server Component with a Client wrapper for interactivity.
 *
 * @module components/blocks/RoomCard
 */

import { RoomCardContent } from './RoomCardContent';
import { RoomCardButtons } from './RoomCardButtons.client';
import type { RoomCardProps } from '@/types/room';

export interface RoomCardDetailedProps extends RoomCardProps {}

/**
 * RoomCardDetailed Hybrid Component
 *
 * Server Component for content with Client Component for buttons.
 *
 * @component
 */
export default function RoomCardDetailed({
  id,
  onBookNow,
  onViewDetails,
  ...contentProps
}: RoomCardDetailedProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Server Component for content */}
      <RoomCardContent {...contentProps} id={id} />

      {/* Client Component for interactive buttons */}
      {(onBookNow || onViewDetails) && (
        <div className="p-card pt-0">
          <RoomCardButtons
            roomId={id}
            onBookNow={onBookNow}
            onViewDetails={onViewDetails}
          />
        </div>
      )}
    </div>
  );
}
