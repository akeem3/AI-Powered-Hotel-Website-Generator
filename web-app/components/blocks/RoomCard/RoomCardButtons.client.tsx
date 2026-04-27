'use client';

import { Button } from '@/components/ui/button';
import { roomCardButtonVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';

/**
 * RoomCardButtons Client Component
 *
 * Provides interactive buttons for room cards.
 * This is a Client Component only for button click handlers.
 *
 * @module components/blocks/RoomCard
 */

export interface RoomCardButtonsProps {
  /** Room ID for callbacks */
  roomId: string;
  /** Book Now callback */
  onBookNow?: (roomId: string) => void;
  /** View Details callback */
  onViewDetails?: (roomId: string) => void;
  /** Additional className */
  className?: string;
}

/**
 * RoomCardButtons Client Component
 *
 * Renders the interactive buttons for room cards.
 *
 * @component
 */
export function RoomCardButtons({
  roomId,
  onBookNow,
  onViewDetails,
  className = '',
}: RoomCardButtonsProps) {
  return (
    <div className={cn('grid grid-cols-2 gap-gap-card mt-gap-card', className)}>
      {/* View Details */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => onViewDetails?.(roomId)}
        className={roomCardButtonVariants({ variant: 'outline' })}
      >
        View Details
      </Button>

      {/* Book Now */}
      <Button
        type="button"
        onClick={() => onBookNow?.(roomId)}
        className={roomCardButtonVariants({ variant: 'primary' })}
      >
        Book Now
      </Button>
    </div>
  );
}

export default RoomCardButtons;
