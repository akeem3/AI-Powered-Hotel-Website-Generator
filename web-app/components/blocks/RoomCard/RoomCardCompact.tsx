'use client';

import React from 'react';
import Image from 'next/image';
import type { RoomCardProps } from '@/types/room';
import { cn } from '@/lib/utils/utils';


export default function RoomCardCompact({
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
        'rounded-xl shadow-card bg-surface-primary overflow-hidden hover:shadow-card-hover hover:-translate-y-1 transition-transform',

        className
      )}
    >
      {image && (
        <Image
          src={image}
          alt={name}
          fill
          className="w-full h-image-card object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      )}
      <div className="p-card space-y-1">
        <h3 className="text-size-h3 font-semibold text-brand-primary font-display">{name}</h3>
        <p className="text-size-caption text-text-muted">{type}</p>
        <p className="text-brand-primary font-bold text-size-body-large tabular-nums">${price.toLocaleString()}</p>
        <p className="text-size-caption text-text-secondary">{capacity} guests</p>

        <ul className="flex flex-wrap gap-gap-card text-size-caption text-text-secondary mt-gap-card">
          {amenities.slice(0, 3).map((amenity, idx) => (
            <li key={idx} className={cn("bg-surface-secondary px-gap-card py-1 rounded-sm")}>
              {amenity}
            </li>
          ))}

        </ul>
      </div>
    </div>
  );
}

