// web-app/registry/roomRegistry.ts
import {
  RoomCardFlatSchema,
  RoomsHeaderSchema,
  RoomsGridSchema,
  RoomsPageSchema,
} from '@/lib/contracts/room.contract';

export const RoomCardRegistry = {
  name: 'RoomCard',
  tier: 'blocks',
  variants: ['compact', 'detailed', 'grid'],
  responsiveStrategy: 'responsive-utilities',
  hotelTypeRecommendations: ['luxury', 'boutique', 'business', 'resort'],
  tags: ['room', 'booking', 'comparison'],
  contract: RoomCardFlatSchema,
  path: '@/components/blocks/RoomCard',
};

export const RoomsHeaderRegistry = {
  name: 'RoomsHeader',
  tier: 'sections',
  variants: ['default'],
  responsiveStrategy: 'inherent',
  hotelTypeRecommendations: ['luxury', 'business', 'resort'],
  tags: ['rooms', 'header', 'intro'],
  contract: RoomsHeaderSchema,
  path: '@/components/sections/RoomsHeader',
};

export const RoomsGridRegistry = {
  name: 'RoomsGrid',
  tier: 'sections',
  variants: ['grid', 'compact', 'detailed'],
  responsiveStrategy: 'responsive-utilities',
  hotelTypeRecommendations: ['luxury', 'business', 'resort'],
  tags: ['rooms', 'grid', 'list'],
  contract: RoomsGridSchema,
  path: '@/components/sections/RoomsGrid',
};

export const RoomsPageRegistry = {
  name: 'RoomsPage',
  tier: 'pages',
  variants: ['default'],
  responsiveStrategy: 'responsive-utilities',
  hotelTypeRecommendations: ['luxury', 'business', 'boutique', 'resort'],
  tags: ['rooms', 'page', 'booking'],
  contract: RoomsPageSchema,
  path: '@/app/rooms/page',
};
