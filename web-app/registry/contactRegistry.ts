// web-app/registry/contactRegistry.ts
import { registerComponent, debugRegistry } from './index';

debugRegistry();
// ContactForm registration
registerComponent({
  name: 'ContactForm',
  tier: 'blocks',
  variants: ['standard', 'compact', 'business'],
  responsiveStrategy: 'responsive-utilities',
  hotelTypeRecommendations: ['luxury', 'boutique', 'business'],
  tags: ['contact', 'lead-generation', 'essential'],
  path: '@/components/sections/ContactForm',
  contractPath: '@/lib/contracts/contact.contract', // optional if you use runtime validation
});

// ContactInfo registration
registerComponent({
  name: 'ContactInfo',
  tier: 'blocks',
  variants: ['standard', 'minimal', 'detailed'],
  responsiveStrategy: 'responsive-utilities',
  hotelTypeRecommendations: ['luxury', 'resort', 'business'],
  tags: ['contact', 'information', 'location', 'support'],
  path: '@/components/sections/ContactInfo',
});
