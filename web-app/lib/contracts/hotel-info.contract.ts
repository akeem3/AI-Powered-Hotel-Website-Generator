import { z } from 'zod';

/**
 * HotelInfo Contract
 *
 * Validates props for the HotelInfo component.
 * This component displays hotel information including name, star rating,
 * address, property type, and opening year.
 */

/**
 * Address schema for hotel info
 */
export const addressSchema = z.object({
  city: z.string().min(1),
  state: z.string().min(1).optional(),  // Made optional to match CMS data
  street: z.string().min(1).optional(), // Made optional to match CMS data
  country: z.string().min(1),
  postal_code: z.string().min(1).optional(), // Made optional to match CMS data
}).passthrough(); // Allow additional fields like 'full'

/**
 * Hotel data schema for HotelInfo component
 */
export const hotelDataSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  property_type: z.enum(['hotel', 'resort', 'hostel', 'guesthouse', 'villa', 'apartment', 'other']),
  star_rating: z.number().int().min(0).max(5).nullable(), // Made nullable to match CMS data (can be null)
  status: z.enum(['active', 'inactive', 'draft', 'archived']),
  opening_year: z.number().int().min(1800).max(2100).optional().nullable(),
  address: z.string(), // JSON string
  is_template: z.boolean(),
  has_override: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  parsedAddress: addressSchema,
});

/**
 * HotelInfo component contract
 */
export const HotelInfoContract = z.object({
  hotel: hotelDataSchema,
  heading: z.string().min(1).max(100).optional(),
  className: z.string().optional(),
}).strict();

export type HotelInfoContractType = z.infer<typeof HotelInfoContract>;
