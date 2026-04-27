// lib/contracts/contact.contract.ts
import { z } from 'zod';

const NAME_REGEX = /^[\p{L}\p{M}\s'.-]+$/u;
const PHONE_ALLOWED_CHARS = /^[+()\d\s-]+$/;

export const ContactFormContract = z.object({
  name: z
    .string()
    .refine((value) => value.trim().length >= 2, {
      message: 'Name must be at least 2 characters',
    })
    .max(100, 'Name must be 100 characters or fewer')
    .refine((value) => NAME_REGEX.test(value), {
      message: 'Name may only include letters, spaces, apostrophes, and hyphens',
    }),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .refine((value) => value.trim().length > 0, {
      message: 'Phone number cannot be empty',
    })
    .max(25, 'Phone number must be at most 25 characters')
    .regex(PHONE_ALLOWED_CHARS, 'Invalid phone number format')
    .refine((value) => !value.includes('--') && !value.includes('  '), {
      message: 'Phone number contains invalid repeated separators',
    })
    .refine((value) => {
      const openParens = (value.match(/\(/g) || []).length;
      const closeParens = (value.match(/\)/g) || []).length;
      return openParens === closeParens;
    }, { message: 'Phone number has unbalanced parentheses' })
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 12) {
        return false;
      }

      const normalized = value.trim();
      if (normalized.startsWith('+1')) {
        const groups = normalized
          .replace(/[()]/g, '')
          .split(/[\s-]+/)
          .filter(Boolean);
        const lastGroup = groups[groups.length - 1];
        if (!lastGroup || lastGroup.replace(/\D/g, '').length !== 4) {
          return false;
        }
      }

      return true;
    }, { message: 'Phone number must contain between 10 and 12 digits with valid country formatting' })
    .optional(),
  subject: z.enum(['General', 'Booking', 'Business', 'Events']),
  message: z
    .string()
    .refine((value) => value.trim().length >= 10, {
      message: 'Message must be at least 10 characters',
    })
    .max(1000, 'Message too long (max 1000 characters)'),
});

export type ContactFormData = z.infer<typeof ContactFormContract>;

/**
 * Variant configuration for ContactForm.
 *
 * Supports two dimensions:
 * - style: Visual presentation (default, minimal, floating)
 * - background: Background treatment (none, brand, muted)
 *
 * @trace story: 7.12
 * @trace reqs: AC4.1
 */
const ContactFormVariantSchema = z.object({
  style: z.enum(['default', 'minimal', 'floating']).optional(),
  background: z.enum(['none', 'brand', 'muted']).optional(),
}).optional();

export const ContactFormPropsSchema = z.object({
  variant: ContactFormVariantSchema,
  className: z.string().optional(),
  onSuccess: z.custom<() => void>().optional(),
});

export type ContactFormProps = z.infer<typeof ContactFormPropsSchema>;
