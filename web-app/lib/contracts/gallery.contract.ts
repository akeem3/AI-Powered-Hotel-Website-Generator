import { z } from 'zod';

// =============================================================================
// IMAGE GALLERY CONTRACT
// =============================================================================

export const ImageGalleryContract = z.object({
  variant: z.object({
    layout: z.enum(['grid', 'masonry', 'carousel']),
    spacing: z.enum(['tight', 'normal', 'loose']).optional(),
    aspectRatio: z.enum(['square', 'landscape', 'portrait']).optional(),
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    // AC2.1: Added 'elevated' to cardStyle enum to match CVA definition
    cardStyle: z.enum(['default', 'minimal', 'flat', 'elevated']).optional()
  }),
  images: z.array(
    z.object({
      id: z.string(),
      desktopUrl: z.string().min(1), // Accept relative paths (/images/{id}) or full URLs
      mobileUrl: z.string().min(1), // Accept relative paths (/images/{id}) or full URLs
      alt: z.string().min(5).max(150), // Increased max for multi-language alt text
      caption: z.string().max(300).optional() // Increased max for multi-language captions
    })
  ).min(0), // Allow empty gallery (graceful degradation when no images)
  enableLightbox: z.boolean().optional(),
  className: z.string().optional()
}).strict();

export type ImageGalleryConfig = z.infer<typeof ImageGalleryContract>;
