// web-app/types/validation.ts
import type { ZodError } from 'zod';
import type { EnforcementLevel } from '@/lib/enforcementConfig';

export interface ValidationIssue {
  path: string[];
  message: string;
}

export interface ValidationResult {
  component: string;
  success: boolean;
  data?: unknown;
  errors?: ValidationIssue[];
  rawError?: ZodError;
  warned?: boolean;
  enforcement?: EnforcementLevel;
}
