// web-app/components/registry/entries.ts
import { registerComponent } from './index';

registerComponent({
  name: 'HeroSection',
  tier: 'sections',
  variants: ['centered', 'split', 'minimal'],
  responsiveStrategy: 'separate-variants',
  hotelTypeRecommendations: ['luxury', 'boutique', 'business'],
  tags: ['hero', 'landing', 'primary'],
  path: '@/components/sections/HeroSection',
});

registerComponent({
  name: 'RoomCard',
  tier: 'blocks',
  variants: ['compact', 'detailed', 'grid'],
  responsiveStrategy: 'responsive-utilities',
  hotelTypeRecommendations: ['luxury', 'boutique', 'business', 'resort'],
  tags: ['room', 'booking', 'comparison'],
  path: '@/components/blocks/RoomCard',
});

// BookingWidget registration
registerComponent({
  name: 'BookingWidget',
  tier: 'blocks',
  variants: ['mobile', 'desktop'],
  responsiveStrategy: 'separate-variants',
  hotelTypeRecommendations: ['luxury', 'boutique', 'business', 'resort'],
  tags: ['booking', 'conversion', 'essential'],
  path: '@/components/blocks/BookingWidget',
});

registerComponent({
  name: 'RoomsPage',
  tier: 'sections', // treat as a page/section for discovery
  variants: ['default'],
  responsiveStrategy: 'responsive-utilities',
  hotelTypeRecommendations: ['luxury', 'boutique', 'business'],
  tags: ['rooms', 'page', 'grid', 'booking'],
  path: '@/app/rooms/page', // optional: path to page
  description: 'Rooms page displaying available rooms and booking widget',
});
