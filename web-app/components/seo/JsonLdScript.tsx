/**
 * JSON-LD Script Component
 *
 * Server component for injecting JSON-LD structured data into Next.js pages.
 * Renders a <script> tag with type="application/ld+json".
 *
 * Used for Google Rich Results (Schema.org markup).
 *
 * @module components/seo/JsonLdScript
 */

import type { HotelJsonLd } from '@/lib/metadata/hotel-metadata';
import { safeJsonStringify } from '@/lib/utils/json-serialization';

interface JsonLdScriptProps {
  /** JSON-LD structured data object */
  jsonLd: HotelJsonLd | Record<string, unknown>;
}

/**
 * JSON-LD Script Component
 *
 * Renders JSON-LD markup in a script tag for SEO.
 *
 * @param jsonLd - The JSON-LD object to serialize
 *
 * @example
 * <JsonLdScript jsonLd={hotelJsonLd} />
 *
 * Renders:
 * <script type="application/ld+json">
 *   {"@context":"https://schema.org","@type":"Hotel",...}
 * </script>
 */
export function JsonLdScript({ jsonLd }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonStringify(jsonLd),
      }}
    />
  );
}
