/**
 * CMS API Environment Variable Schema and Validation
 *
 * Provides runtime validation for CMS API environment variables using Zod.
 * Ensures all required configuration is present and valid before making API calls.
 *
 * @module lib/cms-api/env
 */

import { z } from 'zod';

/**
 * CMS API Environment Variables Schema
 *
 * Validates all CMS API related environment variables.
 * Throws detailed error messages if validation fails.
 */
export const CmsApiEnvSchema = z.object({
  // CMS API Base URL
  CMS_API_URL: z.string()
    .min(1, 'CMS_API_URL cannot be empty')
    .url('CMS_API_URL must be a valid URL')
    .describe('Base URL of the ET CMS Publishing API'),

  // CMS API Bearer Token
  CMS_API_TOKEN: z.string()
    .min(1, 'CMS_API_TOKEN cannot be empty')
    .describe('Bearer token for CMS API authentication'),

  // Hotel ID for per-hotel deployment
  HOTEL_ID: z.string()
    .uuid('HOTEL_ID must be a valid UUID')
    .describe('UUID of the hotel being deployed'),

  // ISR Revalidation Secret
  REVALIDATION_SECRET: z.string()
    .min(1, 'REVALIDATION_SECRET cannot be empty')
    .min(16, 'REVALIDATION_SECRET must be at least 16 characters for security')
    .describe('Secret for webhook-based ISR revalidation'),
});

/**
 * Type inference from schema
 */
export type CmsApiEnv = z.infer<typeof CmsApiEnvSchema>;

/**
 * Validate and return CMS API environment variables
 *
 * Parses and validates all CMS API environment variables.
 * Throws ZodError with detailed messages if validation fails.
 *
 * @throws {z.ZodError} If environment variables are invalid or missing
 * @returns Validated CMS API environment variables
 *
 * @example
 * ```ts
 * import { getCmsApiEnv } from '@/lib/cms-api/env';
 *
 * const env = getCmsApiEnv();
 * console.log(env.CMS_API_URL); // "https://cms-dir.effectivetours.com"
 * ```
 */
export function getCmsApiEnv(): CmsApiEnv {
  const env = {
    CMS_API_URL: process.env.CMS_API_URL,
    CMS_API_TOKEN: process.env.CMS_API_TOKEN,
    HOTEL_ID: process.env.HOTEL_ID,
    REVALIDATION_SECRET: process.env.REVALIDATION_SECRET,
  };

  const result = CmsApiEnvSchema.safeParse(env);

  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => {
      return `${issue.path.join('.')}: ${issue.message}`;
    }).join('\n  ');

    throw new Error(
      `CMS API environment variables validation failed:\n  ${formattedErrors}\n\n` +
      `Please check your .env.local file and ensure all required variables are set.\n` +
      `See .env.example for required variables and their formats.`
    );
  }

  return result.data;
}

/**
 * Check if CMS API environment is properly configured
 *
 * Returns true if all required environment variables are present and valid.
 * Does not throw - useful for conditional checks.
 *
 * @returns True if environment is properly configured
 */
export function isCmsApiEnvConfigured(): boolean {
  try {
    getCmsApiEnv();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get CMS API URL (convenience helper)
 *
 * @returns CMS API base URL
 * @throws If CMS_API_URL is not configured
 */
export function getCmsApiUrl(): string {
  const url = process.env.CMS_API_URL;

  if (!url) {
    throw new Error(
      'CMS_API_URL environment variable is not set. ' +
      'Please add it to your .env.local file.'
    );
  }

  try {
    new URL(url); // Validate URL format
  } catch {
    throw new Error(
      `CMS_API_URL "${url}" is not a valid URL. ` +
      `Please check your .env.local file.`
    );
  }

  return url;
}

/**
 * Get CMS API Token (convenience helper)
 *
 * @returns CMS API Bearer token
 * @throws If CMS_API_TOKEN is not configured
 */
export function getCmsApiToken(): string {
  const token = process.env.CMS_API_TOKEN;

  if (!token) {
    throw new Error(
      'CMS_API_TOKEN environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'Generate a token in CMS Admin → Settings → Tokens.'
    );
  }

  return token;
}

/**
 * Get Hotel ID (convenience helper)
 *
 * @returns Hotel UUID
 * @throws If HOTEL_ID is not configured
 */
export function getHotelId(): string {
  const hotelId = process.env.HOTEL_ID;

  if (!hotelId) {
    throw new Error(
      'HOTEL_ID environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'This should be the UUID of the hotel being deployed.'
    );
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(hotelId)) {
    throw new Error(
      `HOTEL_ID "${hotelId}" is not a valid UUID. ` +
      `Please check your .env.local file. ` +
      `Example: 09f207c1-695a-485a-9519-49f4ef03331f`
    );
  }

  return hotelId;
}

/**
 * Get Revalidation Secret (convenience helper)
 *
 * @returns ISR revalidation secret
 * @throws If REVALIDATION_SECRET is not configured
 */
export function getRevalidationSecret(): string {
  const secret = process.env.REVALIDATION_SECRET;

  if (!secret) {
    throw new Error(
      'REVALIDATION_SECRET environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'This should be a secure random string (min 16 characters).'
    );
  }

  if (secret.length < 16) {
    throw new Error(
      `REVALIDATION_SECRET must be at least 16 characters for security. ` +
      `Current length: ${secret.length}`
    );
  }

  return secret;
}
