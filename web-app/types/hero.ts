import { z } from 'zod';

export const ctaSchema = z.object({
  text: z.string(),
  href: z.string(),
  ariaLabel: z.string().optional(),
});

export const heroSectionSchema = z.object({
  title: z.string(),
  tagline: z.string().optional(),
  subtitle: z.string().optional(), // ✅ ensure included
  headline: z.string(),
  description: z.string().optional(),
  primaryCTA: ctaSchema.optional(),
  secondaryCTA: ctaSchema.optional(),
  background: z.enum(['solid', 'gradient', 'image']).default('solid'),
  className: z.string().optional(),
});

export type HeroSectionProps = z.infer<typeof heroSectionSchema>;
