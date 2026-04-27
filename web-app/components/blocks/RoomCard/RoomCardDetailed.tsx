'use client';

import React from 'react';
import Image from 'next/image';
import type { RoomCardProps } from '@/types/room';
import AmenityList from './AmenityList';
import { Button } from '@/components/ui/button';

import { roomCardVariants, roomCardImageVariants, roomCardButtonVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';

export default function RoomCardDetailed({
  id,
  name,
  type,
  price,
  capacity,
  amenities,
  image,
  description,
  onBookNow,
  onViewDetails,
  className = '',
  imageHeight = 'default', // Default from schema/props
}: RoomCardProps) {
  return (
    <div
      className={cn(
        roomCardVariants({ variant: 'detailed' }),
        'flex flex-col h-full', // Ensure card takes full height in grid
        className
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
          <h3 className="text-size-h3 font-display font-bold text-brand-primary mb-gap-card">{name}</h3>
          <p className="text-size-caption text-brand-secondary font-medium uppercase tracking-wide">{type}</p>
        </div>

        {description && (
          <p className="text-text-secondary text-size-body leading-relaxed grow">{description}</p>
        )}

        <div className="py-gap-card border-t border-border-default">
          <AmenityList amenities={amenities} />
        </div>

        <div className="flex justify-between items-end mt-auto pt-gap-card border-t border-border-default">
          <div className="flex flex-col">
            <span className="text-size-caption text-text-muted uppercase tracking-wider">Starting from</span>
            <span className="text-size-body-large font-display font-bold text-brand-primary tabular-nums">
              ${price.toLocaleString()}
            </span>
          </div>
          <span className={cn("text-size-caption text-text-secondary bg-surface-muted px-gap-card py-1 rounded-lg")}>

            Up to {capacity} guests
          </span>
        </div>

        <div className="grid grid-cols-2 gap-gap-card mt-gap-card">
          {/* View Details - AC3.3: Now using CVA variant */}
          <Button
            type="button"
            variant="ghost"
            onClick={() => onViewDetails?.(id)}
            className={roomCardButtonVariants({ variant: 'outline' })}
          >
            View Details
          </Button>

          {/* Book Now - AC3.3: Now using CVA variant */}
          <Button
            type="button"
            onClick={() => onBookNow?.(id)}
            className={roomCardButtonVariants({ variant: 'primary' })}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
