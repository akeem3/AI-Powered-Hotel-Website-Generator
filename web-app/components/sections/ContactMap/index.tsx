/**
 * ContactMap Client Component with SSR Guard
 *
 * Displays an interactive map for hotel location.
 * Uses dynamic import with SSR guard for map libraries that don't support SSR.
 *
 * IMPORTANT: This is a Client Component only for map interactivity.
 * All location data should be passed as props from Server Component.
 *
 * @module components/sections/ContactMap
 */

'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { CmsAddress } from '@/lib/cms-api/types';
import { cn } from '@/lib/utils/utils';

/**
 * ContactMap component props
 */
export interface ContactMapProps {
  /** Hotel address for map display */
  address: CmsAddress;
  /** Optional latitude for map center */
  latitude?: number;
  /** Optional longitude for map center */
  longitude?: number;
  /** Map height in CSS units */
  height?: string;
  /** Additional className */
  className?: string;
  /** Zoom level for the map */
  zoom?: number;
}

/**
 * Map loading skeleton
 */
interface MapSkeletonProps {
  height?: string;
  className?: string;
}

function MapSkeleton({ height = '400px', className = '' }: MapSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-surface-muted rounded-xl animate-pulse flex items-center justify-center',
        className,
      )}
      style={{ '--map-height': height } as React.CSSProperties}
      // Use CSS custom property for dynamic height (Story 14.7: allows dynamic values without hardcoded styles)

      style-height="var(--map-height)"
      aria-label="Loading map"
    >
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-secondary border-r-transparent mb-4"></div>
        <p className="text-text-muted text-sm">Loading map...</p>
      </div>
    </div>
  );
}

/**
 * Fallback map display when map fails to load
 */
interface MapFallbackProps {
  address: CmsAddress;
  className?: string;
}

function MapFallback({ address, className = '' }: MapFallbackProps) {
  const addressString = [address.street, address.city, address.state, address.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      className={cn(
        'bg-surface-muted rounded-xl p-card flex items-center justify-center min-h-75',
        className,
      )}
      aria-label="Map unavailable"
    >
      <div className="text-center">
        <svg
          className="mx-auto h-16 w-16 text-text-muted mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-size-h3 font-semibold text-text-primary mb-2">Location</h3>
        <p className="text-text-secondary">{addressString}</p>
      </div>
    </div>
  );
}

/**
 * Actual map implementation (lazy loaded)
 *
 * This component will be dynamically imported with SSR disabled.
 * Replace with your actual map library implementation (Leaflet, Google Maps, etc.)
 *
 * @example With Leaflet:
 * ```tsx
 * import { MapContainer, TileLayer, Marker } from 'react-leaflet';
 * import 'leaflet/dist/leaflet.css';
 *
 * export function ContactMapImpl({ address, latitude, longitude, zoom }: ContactMapProps) {
 *   const position: [number, number] = [
 *     latitude ?? 0,
 *     longitude ?? 0,
 *   ];
 *
 *   return (
 *     <MapContainer
 *       center={position}
 *       zoom={zoom ?? 15}
 *       style={{ height: '100%', width: '100%' }}
 *     >
 *       <TileLayer
 *         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
 *         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
 *       />
 *       <Marker position={position}>
 *         <Popup>{address.street}, {address.city}</Popup>
 *       </Marker>
 *     </MapContainer>
 *   );
 * }
 * ```
 */
interface ContactMapImplProps extends ContactMapProps {}

function ContactMapImpl({ address, latitude, longitude, zoom = 15 }: ContactMapImplProps) {
  // TODO: Implement actual map using Leaflet, Google Maps, or other library
  // For now, showing a placeholder with location info

  const addressString = [address.street, address.city, address.state, address.country]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="w-full h-full flex items-center justify-center bg-surface-elevated rounded-xl">
      <div className="text-center p-card">
        <svg
          className="mx-auto h-20 w-20 text-brand-secondary mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <h3 className="text-size-h3 font-semibold text-text-primary mb-2">Interactive Map</h3>
        <p className="text-text-secondary mb-4">{addressString}</p>
        <p className="text-text-muted text-sm">
          Map integration coming soon. For map implementation, install your preferred map library
          (Leaflet, Google Maps, Mapbox) and update ContactMapImpl.
        </p>
      </div>
    </div>
  );
}

/**
 * Dynamic import of map implementation with SSR disabled
 *
 * This prevents the map library from being bundled on the server,
 * avoiding SSR issues with libraries that require browser APIs.
 */
const DynamicContactMap = dynamic(() => Promise.resolve(ContactMapImpl), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * ContactMap Client Component
 *
 * Main component that handles map display with SSR guard.
 * The map is dynamically imported with SSR disabled to prevent hydration issues.
 *
 * @component
 * @example
 * ```tsx
 * // In Server Component
 * import ContactMap from '@/components/sections/ContactMap';
 *
 * <ContactMap
 *   address={hotel.parsedAddress}
 *   latitude={6.0}  // Sri Lanka coordinates
 *   longitude={80.0}
 *   height="400px"
 *   zoom={15}
 * />
 * ```
 */
export default function ContactMap({
  address,
  latitude,
  longitude,
  height = '400px',
  className = '',
  zoom = 15,
}: ContactMapProps) {
  return (
    <section className={cn('w-full py-section', className)} aria-labelledby="contact-map-heading">
      <div className="mx-auto max-w-6xl p-container">
        {/* Section Header */}
        <div className="text-center mb-gap-section">
          <h2
            id="contact-map-heading"
            className="mb-gap-card font-display text-size-h2 text-brand-primary"
          >
            Our Location
          </h2>
          <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto"></div>
        </div>

        {/* Map Container */}
        <Suspense fallback={<MapSkeleton height={height} />}>
          <div
            className="rounded-xl overflow-hidden shadow-card border border-border-default"
            style={{ height }}
          >
            <DynamicContactMap
              address={address}
              latitude={latitude}
              longitude={longitude}
              zoom={zoom}
            />
          </div>
        </Suspense>

        {/* Address Text Below Map */}
        <div className="mt-gap-card text-center">
          <address className="not-italic text-text-secondary">
            <p>
              {address.street && <span className="block mb-gap-card/2">{address.street}</span>}
              <span>
                {[address.city, address.state, address.postal_code].filter(Boolean).join(', ')}
              </span>
              {address.country && <span className="block mt-gap-card/2">{address.country}</span>}
            </p>
          </address>
        </div>
      </div>
    </section>
  );
}
