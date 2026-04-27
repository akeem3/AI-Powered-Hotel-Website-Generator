import { FC } from 'react';

import { cn } from '@/lib/utils/utils';
import { amenitiesVariants } from '@/lib/cva-variants';
import type { Amenity } from '@/types/amenity';

import AmenityCard from './AmenityCard';

interface AmenitiesGridProps {
  amenities: Amenity[];
  columns?: 2 | 3 | 4;
  showCategory?: boolean;
  iconSize?: 'small' | 'medium' | 'large';
  iconStyle?: 'default' | 'muted' | 'colored';
  cardStyle?: 'default' | 'minimal' | 'elevated';
  className?: string;
}

export const AmenitiesGrid: FC<AmenitiesGridProps> = ({
  amenities,
  columns = 4,
  showCategory = false,
  iconSize = 'medium',
  iconStyle = 'default',
  cardStyle = 'default',
  className,
}) => {
  // Enable scroll container when more than 16 amenities
  const enableScroll = amenities.length > 16;

  return (
    <div className={cn(
      amenitiesVariants({ layout: 'grid', columns, iconSize, iconStyle, cardStyle }),
      enableScroll && [
        "max-h-scroll-container",
        "overflow-y-auto",
        "scroll-smooth",
        "pr-gap-card",
        "grid-scroll",
      ],
      className
    )}>
      {amenities.map((amenity) => (
        <AmenityCard
          key={amenity.id}
          amenity={amenity}
          showCategory={showCategory}
          className="min-h-32"
        />
      ))}
    </div>
  );
};

export default AmenitiesGrid;
