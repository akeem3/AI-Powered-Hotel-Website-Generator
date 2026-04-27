'use client';

import { FC, useMemo, useState, useCallback, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/utils';
import { amenitiesVariants } from '@/lib/cva-variants';
import type { Amenity } from '@/types/amenity';

interface AmenitiesFeaturedProps {
  amenities: Amenity[];
  iconSize?: 'small' | 'medium' | 'large';
  iconStyle?: 'default' | 'muted' | 'colored';
  cardStyle?: 'default' | 'minimal' | 'elevated';
  className?: string;
}

const ITEMS_PER_PAGE = 3;

export const AmenitiesFeatured: FC<AmenitiesFeaturedProps> = ({ 
  amenities, 
  iconSize = 'large',
  iconStyle = 'default',
  cardStyle = 'elevated',
  className 
}) => {
  const [startIndex, setStartIndex] = useState(0);

  const featuredAmenities = useMemo(() => {
    return amenities.filter((amenity) => amenity.featured === true);
  }, [amenities]);

  const visibleAmenities = useMemo(() => {
    // Show a slice of items. Handle wrapping if needed, but simple slicing is safer for grid.
    // If we reach near end, show the last ITEMS_PER_PAGE items.
    // Actually, simple pagination:
    return featuredAmenities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [featuredAmenities, startIndex]);

  const hasNext = startIndex + ITEMS_PER_PAGE < featuredAmenities.length;
  const hasPrev = startIndex > 0;

  const handleNext = useCallback(() => {
    if (hasNext) {
      setStartIndex((prev) => prev + 1); // Scroll by 1 for smoother feel? Or by 3? Let's do 1 for "carousel" feel.
      // Doing 1 allows user to see [1,2,3], then [2,3,4].
    } else {
        // Loop back to start
        setStartIndex(0);
    }
  }, [hasNext]);

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      setStartIndex((prev) => prev - 1);
    } else {
        // Loop to end
        setStartIndex(Math.max(0, featuredAmenities.length - ITEMS_PER_PAGE));
    }
  }, [hasPrev, featuredAmenities.length]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  if (!featuredAmenities.length) {
    return null;
  }

  // If we have fewer than 3 items, just showing them is fine.
  // If we have > 3, we show navigation.

  const showNavigation = featuredAmenities.length > ITEMS_PER_PAGE;

  return (
    <div className="relative w-full">
        <div className={cn(
        amenitiesVariants({ layout: 'featured', iconSize, iconStyle, cardStyle }),
        className
        )}>
        {visibleAmenities.map((amenity) => {
            const IconComponent = (LucideIcons[amenity.icon as keyof typeof LucideIcons] as LucideIcon) || LucideIcons.HelpCircle;
            
            return (
                <article
                key={amenity.id}
                className="amenity-card group relative flex flex-col items-center rounded-2xl p-card text-center animate-in fade-in zoom-in duration-standard"
                tabIndex={0}
                >
                {/* Subtle gradient background overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-transparent to-brand-primary/faint opacity-0 transition-opacity duration-standard group-hover:opacity-100" />
                
                <div className="icon-wrapper relative mb-gap-card flex items-center justify-center rounded-2xl transition-all duration-standard group-hover:scale-110 group-hover:shadow-lg">
                    <IconComponent className="amenity-icon" strokeWidth={1.5} />
                </div>
                
                <h3 className="relative mb-gap-card text-size-h3 font-display font-semibold text-text-primary group-hover:text-brand-primary transition-colors">
                    {amenity.name}
                </h3>
                
                {amenity.description && (
                    <p className="relative text-size-caption leading-relaxed text-text-secondary group-hover:text-text-primary transition-colors duration-standard">
                    {amenity.description}
                    </p>
                )}
                </article>
            );
        })}
        </div>
        
        {showNavigation && (
            <div className="mt-gap-section flex justify-center gap-gap-card">
               <button
                  onClick={handlePrev}
                  className="p-3 rounded-full bg-surface-primary/high text-brand-primary hover:bg-brand-primary hover:text-on-brand transition-all shadow-sm border border-brand-primary/wash"
                  aria-label="Previous amenities"
                >
                  <LucideIcons.ChevronLeft className="size-6" />
               </button>
               <button
                  onClick={handleNext}
                  className="p-3 rounded-full bg-surface-primary/high text-brand-primary hover:bg-brand-primary hover:text-on-brand transition-all shadow-sm border border-brand-primary/wash"
                  aria-label="Next amenities"
                >
                  <LucideIcons.ChevronRight className="size-6" />
               </button>
            </div>
        )}
    </div>
  );
};

export default AmenitiesFeatured;
