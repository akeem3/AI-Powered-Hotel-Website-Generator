import { z } from 'zod';

// ------------------------------------------------------
// RoomCard Contract
// ------------------------------------------------------
export const RoomCardFlatSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.string().min(1),
  price: z.number().positive(),
  capacity: z.number().positive().max(10),
  amenities: z.array(z.string()).optional().default([]),
  image: z.string().optional(),
  description: z.string().max(500).optional(),
  variant: z.enum(['compact', 'detailed', 'grid']).default('detailed'),
  imageHeight: z.enum(['default', 'tall', 'wide']).optional(),
  // Optional callbacks - simplified to avoid TypeScript errors
  onBookNow: z.any().optional(),
  onViewDetails: z.any().optional(),
  className: z.string().optional(),
});

export type RoomCardContractType = z.infer<typeof RoomCardFlatSchema>;

// ------------------------------------------------------
// RoomsHeader Contract
// ------------------------------------------------------
export const RoomsHeaderSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  className: z.string().optional(),
});

export type RoomsHeaderContractType = z.infer<typeof RoomsHeaderSchema>;

// ------------------------------------------------------
// RoomsGrid Contract
// ------------------------------------------------------
export const RoomsGridSchema = z.object({
  rooms: z.array(RoomCardFlatSchema).optional(),
  className: z.string().optional(),
  variant: z.enum(['compact', 'detailed', 'grid']).optional(),
  onBookNow: z.any().optional(),
  onViewDetails: z.any().optional(),
});

// ------------------------------------------------------
// RoomsPage Contract
// ------------------------------------------------------
export const RoomsPageSchema = z.object({
  header: RoomsHeaderSchema.optional(),
  rooms: z.array(RoomCardFlatSchema).optional(),
  showBookingWidget: z.boolean().optional().default(true),
  className: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type RoomsPageContractType = z.infer<typeof RoomsPageSchema>;
