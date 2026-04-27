import { z } from 'zod';

// =============================================================================
// AMENITIES CONTRACT
// =============================================================================

export const AmenitiesContract = z.object({
  variant: z.object({
    layout: z.enum(['grid', 'list', 'featured']),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    iconSize: z.enum(['small', 'medium', 'large']).optional(),
    iconStyle: z.enum(['default', 'muted', 'colored']).optional(),
    cardStyle: z.enum(['default', 'minimal', 'elevated']).optional()
  }),
  amenities: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(2).max(60),
      description: z.string().max(200).optional(),
      icon: z.string(), // Font Awesome class or SVG path
      category: z.enum(['room', 'hotel', 'location', 'services']),
      featured: z.boolean().optional()
    })
  ).min(1), // Min 1 amenity, no upper limit to accommodate all hotel facilities
  showCategory: z.boolean().optional(),
  filterByCategory: z.enum(['room', 'hotel', 'location', 'services']).optional(),
  className: z.string().optional()
}).strict();

export type AmenitiesConfig = z.infer<typeof AmenitiesContract>;
