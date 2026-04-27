import { FC } from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/utils';
import type { Amenity, AmenityCardProps, AmenityCategory } from '@/types/amenity';

// Re-export types for backwards compatibility
export type { Amenity, AmenityCategory };

const categoryLabel: Record<AmenityCategory, string> = {
  room: 'Room',
  hotel: 'Hotel',
  location: 'Location',
  services: 'Services',
};

export const AmenityCard: FC<AmenityCardProps> = ({ amenity, showCategory = false, className }) => {
  // Dynamically get the icon component
  const IconComponent = (LucideIcons[amenity.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.HelpCircle;

  return (
    <article
      className={cn(
        'amenity-card group flex h-full min-h-36 flex-col rounded-2xl p-card text-left transition-all duration-standard hover:-translate-y-1 focus-ring',
        amenity.featured && 'border-brand-secondary/mid bg-brand-primary/wash',
        className
      )}
      tabIndex={0}
    >
      <div className="flex items-start gap-gap-card">
        <div className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors duration-standard",

          amenity.featured 
            ? "bg-brand-secondary text-on-brand shadow-md" 
            : "bg-surface-secondary text-brand-primary group-hover:bg-brand-primary group-hover:text-on-brand"
        )}>
          <IconComponent className="size-6" strokeWidth={1.5} />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-gap-card">
            <p className="text-size-h3 font-semibold text-text-primary truncate">{amenity.name}</p>
            {showCategory && (
              <span className="shrink-0 rounded-full bg-surface-secondary px-3 py-1 text-size-overline font-medium uppercase tracking-wide text-text-secondary">
                {categoryLabel[amenity.category]}
              </span>

            )}
          </div>
          
          {amenity.description && (
            <p className="mt-gap-card text-size-caption leading-relaxed text-text-secondary line-clamp-2 group-hover:text-text-primary transition-colors">
              {amenity.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default AmenityCard;
