import { z } from 'zod';

export const ctaSchema = z.object({
  text: z.string().min(1).max(50),
  href: z.string().min(1).max(200),
  ariaLabel: z.string().optional(),
});

export const HeroSectionContract = z.object({
  variant: z.object({
    style: z.enum(['modern', 'classic', 'minimal', 'bold', 'elegant', 'heritage-opulence']).optional(),
    layout: z.enum(['centered', 'split', 'minimal']).optional(),
    overlay: z.enum(['none', 'light', 'dark', 'gradient']).optional(),
    height: z.enum(['small', 'medium', 'large', 'fullscreen']).optional()
  }).optional(),
  title: z.string().min(1).max(200),
  tagline: z.string().max(400).optional(),
  subtitle: z.string().max(400).optional(),
  headline: z.string().min(1).max(500),
  description: z.string().max(800).optional(),
  primaryCTA: ctaSchema.optional(),
  secondaryCTA: ctaSchema.optional(),
  image: z.string().optional(),
  background: z.enum(['solid', 'gradient', 'image']).default('solid'),
  className: z.string().optional(),
  // Animation properties for HeroSection
  enableAnimations: z.boolean().optional(),
  animationDelay: z.number().optional(),
  // Content integration properties (Story 11.4 - pending full implementation)
  hotelId: z.string().optional(),
  enableContent: z.boolean().optional(),
});

export type HeroSectionContractType = z.infer<typeof HeroSectionContract>;
