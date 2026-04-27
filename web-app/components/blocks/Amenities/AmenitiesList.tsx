import { FC } from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/utils';
import { amenitiesVariants } from '@/lib/cva-variants';
import type { Amenity } from '@/types/amenity';

interface AmenitiesListProps {
  amenities: Amenity[];
  iconSize?: 'small' | 'medium' | 'large';
  iconStyle?: 'default' | 'muted' | 'colored';
  cardStyle?: 'default' | 'minimal' | 'elevated';
  className?: string;
}

export const AmenitiesList: FC<AmenitiesListProps> = ({ 
  amenities, 
  iconSize = 'medium',
  iconStyle = 'default',
  cardStyle = 'default',
  className 
}) => {
  if (!amenities?.length) {
    return null;
  }

  return (
    <ul className={cn(
      amenitiesVariants({ layout: 'list', iconSize, iconStyle, cardStyle }),
      className
    )} role="list">
      {amenities.map((amenity) => {
        // Dynamically get the icon component
        const IconComponent = (LucideIcons[amenity.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.HelpCircle;

        return (
          <li
            key={amenity.id}
            className="amenity-list-item group flex items-center gap-gap-card rounded-xl px-gap-card py-3 md:py-2 transition-all duration-standard"

          >
            <div className="icon-wrapper flex shrink-0 items-center justify-center rounded-xl transition-all duration-standard">

              <IconComponent className="amenity-icon" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary group-hover:text-brand-primary transition-colors">{amenity.name}</p>
              {amenity.description && (
                <p className="mt-1 text-xs text-text-secondary line-clamp-1 group-hover:text-text-primary transition-colors">
                  {amenity.description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default AmenitiesList;
