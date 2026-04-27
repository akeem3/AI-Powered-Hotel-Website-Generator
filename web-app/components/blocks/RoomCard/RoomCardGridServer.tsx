/**
 * RoomCardGrid Server Component
 *
 * Displays grid room card content.
 * This is a Server Component - no interactive elements.
 *
 * @module components/blocks/RoomCard
 */

import Image from 'next/image';
import { cn } from '@/lib/utils/utils';
import type { RoomCardProps } from '@/types/room';

export interface RoomCardGridProps extends Omit<RoomCardProps, 'onBookNow' | 'onViewDetails'> {}

/**
 * RoomCardGrid Server Component
 *
 * @component
 */
export function RoomCardGrid({
  name,
  type,
  price,
  capacity,
  amenities,
  image,
  className = '',
}: RoomCardGridProps) {
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

        <ul className="flex flex-wrap justify-center gap-gap-card text-size-caption text-text-secondary mt-gap-card">
          {amenities.slice(0, 3).map((amenity, idx) => (
            <li key={idx} className="bg-surface-secondary px-gap-card py-1 rounded">
              {amenity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RoomCardGrid;
