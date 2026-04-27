/**
 * Amenity Component Types
 *
 * Centralized type definitions for all amenity-related components.
 * Used across Amenities, AmenityCard, AmenitiesGrid, AmenitiesList,
 * and AmenitiesFeatured components.
 */

// ============================================================================
// Core Data Types
// ============================================================================

export type AmenityCategory = 'room' | 'hotel' | 'location' | 'services';

export interface Amenity {
  id: string;
  name: string;
  description?: string;
  icon: string; // Font Awesome class (e.g., "fa-wifi")
  category: AmenityCategory;
  featured?: boolean;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AmenityCardProps {
  amenity: Amenity;
  showCategory?: boolean;
  className?: string;
}

export interface AmenitiesGridProps {
  amenities: Amenity[];
  columns?: 2 | 3 | 4;
  showCategory?: boolean;
  className?: string;
}

export interface AmenitiesListProps {
  amenities: Amenity[];
  className?: string;
}

export interface AmenitiesFeaturedProps {
  amenities: Amenity[];
  className?: string;
}

export type AmenitiesLayout = 'grid' | 'list' | 'featured';

export interface AmenitiesProps {
  amenities: Amenity[];
  layout?: AmenitiesLayout;
  columns?: 2 | 3 | 4;
  showCategory?: boolean;
  filterByCategory?: AmenityCategory;
  className?: string;
}
