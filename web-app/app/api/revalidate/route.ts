/**
 * ISR Revalidation API Route
 *
 * Handles on-demand revalidation requests from CMS webhooks.
 * Verifies secret using constant-time comparison, then revalidates
 * all language paths for the hotel using revalidatePath and revalidateTag.
 *
 * Story 14.5: ISR Implementation
 * Route: POST /api/revalidate
 *
 * @module app/api/revalidate
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getRevalidationSecret, getHotelId } from '@/lib/cms-api/env';
import { getHotelFull } from '@/lib/cms-api/client';
import { getAvailableLanguages } from '@/lib/cms-api/transformers';

/**
 * Revalidation Request Body Schema
 *
 * Expected payload from CMS webhook:
 * - hotel_id: UUID of the hotel that was updated
 * - secret: Revalidation secret for authentication
 * - changed_collections: Array of collection names that changed (optional)
 */
export interface RevalidateRequest {
  hotel_id: string;
  secret: string;
  changed_collections?: string[];
}

/**
 * Revalidation Response
 *
 * Response returned to webhook caller:
 * - revalidated: true if revalidation was triggered
 * - hotel_id: The hotel ID that was revalidated
 * - paths: Array of paths that were revalidated
 * - timestamp: ISO timestamp of revalidation
 */
interface RevalidateResponse {
  revalidated: boolean;
  hotel_id: string;
  paths?: string[];
  timestamp: string;
}

/**
 * Error Response
 *
 * Standardized error response:
 * - error: Error message (generic, no secret leakage)
 * - code: Error code for client handling
 */
interface ErrorResponse {
  error: string;
  code: string;
}

/**
 * POST handler for ISR revalidation
 *
 * Process:
 * 1. Parse and validate request body
 * 2. Verify secret using constant-time comparison (AC3, AC10)
 * 3. Check if hotel_id matches deployed HOTEL_ID (AC5)
 * 4. Fetch available languages from CMS
 * 5. Call revalidatePath for each language (AC4)
 * 6. Call revalidateTag for hotel-level cache invalidation (AC6)
 * 7. Log revalidation event (AC8)
 * 8. Return appropriate response (AC7)
 *
 * Story 14.5 Acceptance Criteria:
 * - AC2: API route handles POST requests
 * - AC3: Constant-time secret verification
 * - AC4: RevalidatePath for all active languages
 * - AC5: Check hotel_id matches HOTEL_ID
 * - AC6: Implement revalidateTag
 * - AC7: Return 200/401/400 status codes
 * - AC8: Log revalidation events
 * - AC10: Use timingSafeEqual for secret comparison
 *
 * @param request - Next.js request object
 * @returns NextResponse with revalidation result or error
 */
export async function POST(request: NextRequest): Promise<NextResponse<RevalidateResponse | ErrorResponse>> {
  const timestamp = new Date().toISOString();

  try {
    // Parse request body
    let body: RevalidateRequest;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request body', code: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { hotel_id, secret, changed_collections } = body;

    // Validate required fields
    if (!hotel_id || typeof hotel_id !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing or invalid hotel_id', code: 'INVALID_HOTEL_ID' },
        { status: 400 }
      );
    }

    if (!secret || typeof secret !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing secret', code: 'MISSING_SECRET' },
        { status: 401 }
      );
    }

    // Get the revalidation secret and deployed hotel ID from environment
    const expectedSecret = getRevalidationSecret();
    const deployedHotelId = getHotelId();

    // AC3, AC10: Verify secret using constant-time comparison
    // This prevents timing attacks where attackers measure response times
    const isSecretValid = await constantTimeCompare(secret, expectedSecret);

    if (!isSecretValid) {
      // Log failed attempt (without exposing the secret)
      console.warn(
        `[ISR Revalidation] Failed authentication attempt at ${timestamp}`
      );

      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid request', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // AC5: Check if hotel_id matches the deployed hotel
    // In per-hotel deployment, ignore events for other hotels
    if (hotel_id !== deployedHotelId) {
      console.log(
        `[ISR Revalidation] Ignoring webhook for different hotel: ` +
        `webhook=${hotel_id}, deployed=${deployedHotelId}`
      );

      // Return 200 to satisfy CMS webhook delivery, but indicate no revalidation
      return NextResponse.json<RevalidateResponse>({
        revalidated: false,
        hotel_id: deployedHotelId,
        timestamp,
      });
    }

    // AC4, AC6: Revalidate paths and tags
    // Fetch hotel data to get available languages
    const hotelData = await getHotelFull(deployedHotelId);
    const languages = getAvailableLanguages(hotelData.content);
    const slug = hotelData.hotel.slug;

    // Collect paths to revalidate
    const revalidatedPaths: string[] = [];

    // Revalidate homepage for each language
    for (const lang of languages) {
      const homePath = `/${lang}`;
      revalidatePath(homePath);
      revalidatedPaths.push(homePath);
    }

    // Revalidate hotel detail page for each language
    for (const lang of languages) {
      const hotelPath = `/${lang}/hotels/${slug}`;
      revalidatePath(hotelPath);
      revalidatedPaths.push(hotelPath);
    }

    // AC6: Revalidate tag for hotel-level cache invalidation
    // This invalidates all data fetches tagged with this hotel ID
    revalidateTag(`hotel-${deployedHotelId}`);

    // AC8: Log revalidation event
    console.log(
      `[ISR Revalidation] Success at ${timestamp}\n` +
      `  Hotel ID: ${hotel_id}\n` +
      `  Languages: ${languages.join(', ')}\n` +
      `  Paths revalidated: ${revalidatedPaths.length}\n` +
      `  Changed collections: ${changed_collections?.join(', ') || 'none'}\n` +
      `  Tag: hotel-${deployedHotelId}`
    );

    // AC7: Return 200 OK with revalidation details
    return NextResponse.json<RevalidateResponse>({
      revalidated: true,
      hotel_id: deployedHotelId,
      paths: revalidatedPaths,
      timestamp,
    });

  } catch (error) {
    // Log error while preventing secret leakage
    console.error(
      `[ISR Revalidation] Error at ${timestamp}:`,
      error instanceof Error ? error.message : 'Unknown error'
    );

    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Constant-time string comparison
 *
 * Compares two strings in constant time to prevent timing attacks.
 * Uses Node.js crypto.timingSafeEqual() which requires Buffer inputs.
 *
 * This is critical for webhook secret verification - if we use regular
 * string equality (===), attackers can measure response times to
 * incrementally guess the secret value.
 *
 * Story 14.5, AC10: Use timingSafeEqual for secret comparison
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 *
 * @example
 * ```ts
 * const isValid = await constantTimeCompare(userProvided, actualSecret);
 * ```
 */
async function constantTimeCompare(a: string, b: string): Promise<boolean> {
  // Import crypto dynamically (Node.js built-in)
  const crypto = await import('crypto');

  // Convert strings to buffers
  const bufferA = Buffer.from(a, 'utf-8');
  const bufferB = Buffer.from(b, 'utf-8');

  // If lengths differ, they can't be equal (still do constant-time check
  // with zero-padded buffers to avoid leaking length information)
  if (bufferA.length !== bufferB.length) {
    const maxLen = Math.max(bufferA.length, bufferB.length);
    const paddedA = Buffer.alloc(maxLen, 0);
    const paddedB = Buffer.alloc(maxLen, 0);
    bufferA.copy(paddedA);
    bufferB.copy(paddedB);

    // Use timingSafeEqual with padded buffers
    // Return false regardless of result since we know they differ
    crypto.timingSafeEqual(paddedA, paddedB);
    return false;
  }

  // Use crypto.timingSafeEqual for constant-time comparison
  return crypto.timingSafeEqual(bufferA, bufferB);
}

/**
 * OPTIONS handler for CORS preflight requests
 *
 * Allows webhooks from CMS origin if CORS is needed.
 * Modify origin as needed for your CMS webhook configuration.
 *
 * @returns NextResponse with CORS headers
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
    },
  });
}
