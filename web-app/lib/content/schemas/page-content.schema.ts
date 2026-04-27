import { z } from 'zod';

/**
 * Shared CTA schema for buttons and links
 */
const ContentCTASchema = z.object({
  /** Text to display on the button/link */
  text: z.string().min(1).max(50),
  /** URL or anchor path */
  href: z.string().min(1).max(200),
  /** Accessibility label */
  ariaLabel: z.string().optional(),
});

/**
 * Schema for Hero section specific content
 */
const HeroContentSchema = z.object({
  /** Small text displayed above the main title */
  tagline: z.string().max(200).optional(),
  /** The main name of the hotel/section */
  title: z.string().min(1).max(100),
  /** Large emphasized text headline */
  headline: z.string().min(1).max(200),
  /** Descriptive body text */
  description: z.string().max(500).optional(),
  /** Primary action button */
  primaryCTA: ContentCTASchema.optional(),
  /** Secondary action button */
  secondaryCTA: ContentCTASchema.optional(),
  /** Accessibility description for the background image */
  imageAlt: z.string().max(200).optional(),
  /** Reference to background image in media manifest (e.g., @media:homepage.hero) */
  backgroundImage: z.string().optional(),
});

/**
 * Schema for common section headers (Amenities, Testimonials, etc.)
 */
const SectionHeaderSchema = z.object({
  /** Section main title */
  heading: z.string().min(1).max(100),
  /** Section subtitle or intro text */
  subheading: z.string().max(300).optional(),
});

/**
 * Schema for contact form specific content and field labels
 */
const ContactContentSchema = z.object({
  /** Form title */
  title: z.string().min(1).max(100),
  /** Field labels and placeholders */
  fields: z.object({
    name: z.object({ label: z.string(), placeholder: z.string() }).optional(),
    email: z.object({ label: z.string(), placeholder: z.string() }).optional(),
    phone: z.object({ label: z.string(), placeholder: z.string() }).optional(),
    subject: z.object({ 
      label: z.string(), 
      placeholder: z.string(),
      options: z.record(z.string(), z.string()).optional() 
    }).optional(),
    message: z.object({ label: z.string(), placeholder: z.string() }).optional(),
  }).optional(),
  /** Submit button text and states */
  submitButton: z.object({
    text: z.string(),
    loadingText: z.string().optional(),
  }).optional(),
  /** Status messages for success/failure */
  messages: z.object({
    success: z.string(),
    error: z.string(),
  }).optional(),
});

/**
 * Schema for site navigation link content
 */
const NavigationContentSchema = z.object({
  /** Array of link objects for the main menu */
  links: z.array(z.object({
    href: z.string(),
    label: z.string(),
  })).optional(),
  /** Brand logo and related text */
  logo: z.object({
    ariaLabel: z.string().optional(),
    text: z.string().optional(),
    initials: z.string().max(4).optional(),
  }).optional(),
  /** Global Call to Action in navigation */
  cta: z.object({
    text: z.string(),
  }).optional(),
});

/**
 * Root schema for all homepage content
 */
export const HomepageContentSchema = z.object({
  /** Content system metadata */
  meta: z.object({
    /** Metadata schema version */
    version: z.string().default('1.0.0'),
    /** ISO timestamp of generation */
    generatedAt: z.string(),
    /** Associated hotel unique identifier */
    hotelId: z.string(),
    /** Content locale code (e.g., en, es) */
    locale: z.string(),
  }),
  /** Header navigation content */
  navigation: NavigationContentSchema.optional(),
  /** Hero section content */
  hero: HeroContentSchema,
  /** Dynamic homepage sections */
  sections: z.object({
    amenities: SectionHeaderSchema.optional(),
    testimonials: SectionHeaderSchema.optional(),
    contact: ContactContentSchema.optional(),
  }).optional(),
  /** Footer content */
  footer: z.object({
    copyright: z.string().optional(),
  }).optional(),
  /** Media manifest for @media: resolution (added by content system) */
  _mediaManifest: z.any().optional(),
});

export type HomepageContent = z.infer<typeof HomepageContentSchema>;
