import { z } from 'zod';

// =============================================================================
// TESTIMONIALS CONTRACT
// =============================================================================

export const TestimonialsContract = z.object({
  variant: z.object({
    layout: z.enum(['carousel', 'grid', 'featured']),
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
    cardStyle: z.enum(['default', 'minimal', 'elevated']).optional()
  }),
  testimonials: z.array(
    z.object({
      id: z.string(),
      customerName: z.string().min(2).max(50),
      customerTitle: z.string().max(50).optional(),
      avatarUrl: z.string().url().optional(),
      rating: z.union([
        z.literal(1), 
        z.literal(2), 
        z.literal(3), 
        z.literal(4), 
        z.literal(5)
      ]),
      quote: z.string().min(20).max(500),
      date: z.string().optional(), // ISO date string expected
      location: z.string().max(50).optional()
    })
  ).min(1).max(10), // 1-10 testimonials
  showDate: z.boolean().optional(),
  showLocation: z.boolean().optional(),
  className: z.string().optional()
}).strict();

export type TestimonialsConfig = z.infer<typeof TestimonialsContract>;
