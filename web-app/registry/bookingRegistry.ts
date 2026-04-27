// web-app/registry/bookingRegistry.ts
// Component registry metadata for BookingWidget.

import { BookingWidgetContract } from '@/lib/contracts/booking.contract';

// Basic metadata for registry; include contract schema for programmatic checks.
export const BookingWidgetRegistry = {
  name: 'BookingWidget',
  tier: 'blocks',
  variants: ['mobile', 'desktop'],
  responsiveStrategy: 'separate-variants',
  hotelTypeRecommendations: ['luxury', 'boutique', 'business', 'resort'],
  tags: ['booking', 'conversion', 'essential'],
  path: '@/components/blocks/BookingWidget',
  // attach the zod contract schema so registry consumers can validate shapes
  contract: BookingWidgetContract,
};
