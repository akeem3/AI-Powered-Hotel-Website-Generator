import type { z } from 'zod';
import type { ContactFormContract } from '@/lib/contracts/contact.contract';

// This automatically syncs with your Zod schema
export type ContactFormData = z.infer<typeof ContactFormContract>;

export interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
  className?: string;
}
