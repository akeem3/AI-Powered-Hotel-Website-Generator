/**
 * RoomCardCompact Server Component
 *
 * Displays compact room card content.
 * This is a Server Component - no interactive elements.
 *
 * @module components/blocks/RoomCard
 */

import Image from 'next/image';
import { cn } from '@/lib/utils/utils';
import type { RoomCardProps } from '@/types/room';

export interface RoomCardCompactProps extends Omit<RoomCardProps, 'onBookNow' | 'onViewDetails'> {}

/**
 * RoomCardCompact Server Component
 *
 * @component
 */
export function RoomCardCompact({
  name,
  type,
  price,
  capacity,
  amenities,
  image,
  className = '',
}: RoomCardCompactProps) {
  return (
    <div className={cn('rounded-xl shadow-card bg-surface-primary overflow-hidden', className)}>
      {image && (
        <div className="relative w-full h-image-card">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-card space-y-1">
        <h3 className="text-size-h3 text-brand-primary font-display">{name}</h3>
        <p className="text-size-caption text-text-muted">{type}</p>
        <p className="text-brand-primary font-bold text-size-body-large tabular-nums">
          ${price.toLocaleString()}
        </p>
        <p className="text-size-caption text-text-secondary">{capacity} guests</p>

        <ul className="flex flex-wrap gap-gap-card text-size-caption text-text-secondary mt-gap-card">
          {(amenities ?? []).slice(0, 3).map((amenity, idx) => (
            <li key={idx} className="bg-surface-secondary px-gap-card py-1 rounded-sm">
              {amenity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default RoomCardCompact;
