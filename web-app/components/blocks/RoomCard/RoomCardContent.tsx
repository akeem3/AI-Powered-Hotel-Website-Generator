/**
 * RoomCardContent Server Component
 *
 * Displays room card content without interactive buttons.
 * This is a Server Component that receives all data as props.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * Interactive buttons should be added via Client Component wrapper.
 *
 * @module components/blocks/RoomCard
 */

import Image from 'next/image';
import { roomCardVariants, roomCardImageVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';
import type { RoomCardProps } from '@/types/room';
import AmenityList from './AmenityList';

/**
 * RoomCardContent component props
 *
 * Same as RoomCardProps but without callbacks.
 */
export interface RoomCardContentProps extends Omit<RoomCardProps, 'onBookNow' | 'onViewDetails'> {
  /** Include empty button container for layout consistency */
  includeButtonPlaceholder?: boolean;
}

/**
 * RoomCardContent Server Component
 *
 * Renders the room card content without interactive buttons.
 * Used as the base for all RoomCard variants.
 *
 * @component
 */
export function RoomCardContent({
  id,
  name,
  type,
  price,
  capacity,
  amenities,
  image,
  description,
  className = '',
  imageHeight = 'default',
  includeButtonPlaceholder = false,
}: RoomCardContentProps) {
  return (
    <div
      className={cn(
        roomCardVariants({ variant: 'detailed' }),
        'flex flex-col h-full', // Ensure card takes full height in grid
        className,
      )}
    >
      {image && (
        <div className={roomCardImageVariants({ height: imageHeight })}>
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-standard group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
          {/* Navy Overlay on Hover */}
          <div className="absolute inset-0 bg-brand-primary/0 group-hover:bg-brand-primary/wash transition-all duration-standard"></div>
        </div>
      )}

      <div className="p-card flex flex-col gap-gap-card grow">
        <div>
          <h3 className="text-size-h3 font-display text-brand-primary mb-gap-card">{name}</h3>
          <p className="text-size-caption text-brand-secondary font-medium uppercase tracking-wide">
            {type}
          </p>
        </div>

        {description && (
          <p className="text-text-secondary text-size-body leading-relaxed grow">{description}</p>
        )}

        <div className="py-gap-card border-t border-border-default">
          <AmenityList amenities={amenities} />
        </div>

        <div className="flex justify-between items-end mt-auto pt-gap-card border-t border-border-default">
          <div className="flex flex-col">
            <span className="text-size-caption text-text-muted uppercase tracking-wider">
              Starting from
            </span>
            <span className="text-size-body-large font-display text-brand-primary tabular-nums">
              ${price.toLocaleString()}
            </span>
          </div>
          <span className="text-size-caption text-text-secondary bg-surface-muted px-gap-card py-1 rounded-lg">
            Up to {capacity} guests
          </span>
        </div>

        {includeButtonPlaceholder && (
          <div className="grid grid-cols-2 gap-gap-card mt-gap-card" aria-hidden="true">
            {/* Placeholder for buttons - will be replaced by Client Component */}
            <div className="h-10 border border-border-default rounded-lg bg-surface-muted" />
            <div className="h-10 border border-border-default rounded-lg bg-surface-muted" />
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomCardContent;
