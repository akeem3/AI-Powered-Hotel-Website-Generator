/**
 * RoomCard Hybrid Component
 *
 * Server Component that composes content display with optional Client Component
 * for interactive buttons. Follows Next.js 15 Server/Client Component architecture.
 *
 * IMPORTANT: This is a Server Component - do not add 'use client' directive.
 * Interactive elements are handled by separate Client Component children.
 *
 * @module components/blocks/RoomCard
 */

import { validateInDev } from '@/lib/contracts/validate.dev';
import { RoomCardFlatSchema } from '@/lib/contracts/room.contract';
import type { RoomCardProps } from '@/types/room';

import { RoomCardContent } from './RoomCardContent';
import RoomCardDetailedHybrid from './RoomCardDetailedHybrid';
import { RoomCardCompact } from './RoomCardCompactServer';
import { RoomCardGrid } from './RoomCardGridServer';

/**
 * RoomCard component props
 */
export interface RoomCardServerProps extends RoomCardProps {}

/**
 * RoomCard Server Component
 *
 * Routes to appropriate variant based on props.
 * - 'detailed': Uses hybrid architecture (Server content + Client buttons if callbacks provided)
 * - 'compact': Pure Server Component
 * - 'grid': Pure Server Component
 *
 * Data Flow:
 * 1. Parent Server Component passes room data as props
 * 2. RoomCard routes to appropriate variant
 * 3. Content is server-rendered for SEO
 * 4. Buttons are optional Client Components only when callbacks provided
 *
 * @component
 * @example
 * ```tsx
 * // Server Component usage (no interactivity)
 * <RoomCard
 *   id="room-1"
 *   name="Deluxe Room"
 *   type="Deluxe"
 *   price={199}
 *   capacity={2}
 *   amenities={["WiFi", "AC", "TV"]}
 *   image="/rooms/deluxe.jpg"
 *   variant="detailed"
 * />
 *
 * // With interactive buttons (requires Client Component wrapper)
 * <RoomCard
 *   {...roomData}
 *   onBookNow={(id) => console.log('Book:', id)}
 *   onViewDetails={(id) => console.log('View:', id)}
 * />
 * ```
 */
export default function RoomCard(rawProps: RoomCardServerProps) {
  // Validate props against contract
  const props = validateInDev(RoomCardFlatSchema, rawProps, 'RoomCard');
  const { variant = 'detailed', onBookNow, onViewDetails } = props;

  // For detailed variant with callbacks, use hybrid architecture
  if (variant === 'detailed' && (onBookNow || onViewDetails)) {
    return <RoomCardDetailedHybrid {...props} />;
  }

  // For detailed variant without callbacks, use Server Component content only
  if (variant === 'detailed') {
    return <RoomCardContent {...props} includeButtonPlaceholder={false} />;
  }

  // For compact variant, use Server Component
  if (variant === 'compact') {
    return <RoomCardCompact {...props} />;
  }

  // For grid variant, use Server Component
  return <RoomCardGrid {...props} />;
}

// Note: RoomCardServerProps is already exported at line 25
