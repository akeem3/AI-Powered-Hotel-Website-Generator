import { MediaManifest } from '../schemas';

/**
 * Variable resolution context
 */
export interface VariableContext {
  /** Hotel parameters from generation workflow */
  hotelParameters: {
    name: string;
    id: string;
    location?: string;
    description?: string;
    currency?: string;
    category?: string;
    rating?: number;
    address?: {
      city?: string;
      country?: string;
      street?: string;
      postalCode?: string;
    };
    contact?: {
      phone?: string;
      email?: string;
    };
    social?: {
      facebook?: string;
      instagram?: string;
    };
  };
  /** Current locale code */
  locale?: string;
  /** Custom override values */
  custom?: Record<string, unknown>;
}

/**
 * Supported computed variable names
 */
export const SUPPORTED_COMPUTED_VARIABLES = {
  locale: 'locale',
  currentYear: 'currentYear',
} as const;

export type ComputedVariable = keyof typeof SUPPORTED_COMPUTED_VARIABLES;

/**
 * Resolution options for variable interpolation
 */
export interface ResolveVariablesOptions {
  /** How to handle missing variables (default: 'warn' in dev, 'empty' in prod) */
  missing?: 'empty' | 'warn' | 'throw';
  /** Optional transform function for resolved values */
  transform?: (value: string) => string;
}

/**
 * Resolved media with full URLs
 */
export interface ResolvedMedia {
  /** Full desktop URL */
  url: string;
  /** Full mobile URL if available */
  mobileUrl: string | null;
  /** Alt text for accessibility */
  alt: string;
  /** BlurHash placeholder */
  blurhash: string | null;
  /** Natural dimensions */
  width: number | null;
  height: number | null;
}

/**
 * Combined resolver context
 */
export interface ResolverContext {
  /** Variable resolution context */
  variables: VariableContext;
  /** Media manifest for @media: resolution */
  mediaManifest: MediaManifest;
  /** Optional callback for debugging resolution */
  onResolve?: (path: string, from: string, to: string) => void;
}
