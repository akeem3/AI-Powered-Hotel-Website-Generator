import { z } from 'zod';

/**
 * Individual media asset definition
 */
const MediaAssetSchema = z.object({
  /** Unique identifier for the asset */
  id: z.string(),
  /** Main path to the asset (e.g., /hotel-123/hero.webp) */
  path: z.string(),
  /** Optimized path for mobile devices */
  mobilePath: z.string().optional(),
  /** Alt text for accessibility */
  alt: z.string().max(200).optional(),
  /** BlurHash for loading placeholder */
  blurhash: z.string().optional(),
  /** Natural width of the asset */
  width: z.number().optional(),
  /** Natural height of the asset */
  height: z.number().optional(),
});

/**
 * Media manifest schema for asset references
 * 
 * Used to resolve @media: reference syntax in content JSONs
 */
export const MediaManifestSchema = z.object({
  /** CDN configuration for asset resolution */
  cdn: z.object({
    /** Base URL for all assets (e.g., https://cdn.example.com) */
    baseUrl: z.string().url(),
    /** Path prefix for transformations (Cloudflare, etc.) */
    transformPath: z.string().optional(),
  }),
  /** 
   * Assets grouped by page/context 
   * Example: assets: { "homepage": { "hero": { ... } } }
   * Resolves @media:homepage.hero
   */
  assets: z.record(z.string(), z.record(z.string(), MediaAssetSchema)),
});

export type MediaManifest = z.infer<typeof MediaManifestSchema>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
