// contracts/index.ts
// ------------------------------------------------------
// Central export + registry of ALL Zod contracts
// Used by runtime validation utilities
// ------------------------------------------------------

import { z } from 'zod';

// New component contracts
import { ImageGalleryContract } from './gallery.contract';
import { TestimonialsContract } from './testimonials.contract';
import { AmenitiesContract } from './amenities.contract';
import { NavigationContract } from './navigation.contract';
import { FooterContract } from './footer.contract';
import { AboutContract } from './about.contract';
import { FAQContract } from './faq.contract';
import { FeaturesContract } from './features.contract';

// Existing contracts
import { BookingDataContract, BookingWidgetContract } from './booking.contract';
import { ContactFormContract } from './contact.contract';
import { HeroSectionContract } from './hero.contract';
import {
  RoomCardFlatSchema,
  RoomsHeaderSchema,
  RoomsGridSchema,
  RoomsPageSchema,
} from './room.contract';

import { UIComponentContracts } from './component-contracts';

// Export inferred config types for new contracts
export type ImageGalleryConfig = z.infer<typeof ImageGalleryContract>;
export type TestimonialsConfig = z.infer<typeof TestimonialsContract>;
export type AmenitiesConfig = z.infer<typeof AmenitiesContract>;
export type FooterConfig = z.infer<typeof FooterContract>;
export type AboutConfig = z.infer<typeof AboutContract>;
export type FAQConfig = z.infer<typeof FAQContract>;
export type FeaturesConfig = z.infer<typeof FeaturesContract>;

// Export other contracts for external use
export {
  BookingDataContract,
  BookingWidgetContract,
  ContactFormContract,
  HeroSectionContract,
  NavigationContract,
  ImageGalleryContract,
  TestimonialsContract,
  AmenitiesContract,
  FooterContract,
  AboutContract,
  FAQContract,
  FeaturesContract,
  RoomCardFlatSchema,
  RoomsHeaderSchema,
  RoomsGridSchema,
  RoomsPageSchema,
};

// Component Contract Registry
export const ComponentContractRegistry = {
  // Booking
  bookingData: BookingDataContract,
  bookingWidget: BookingWidgetContract,

  // Contact
  contactForm: ContactFormContract,

  // Hero
  heroSection: HeroSectionContract,

  // New component contracts
  imageGallery: ImageGalleryContract,
  testimonials: TestimonialsContract,
  amenities: AmenitiesContract,
  navigation: NavigationContract,
  footer: FooterContract,
  about: AboutContract,
  faq: FAQContract,
  features: FeaturesContract,

  // Rooms
  roomCard: RoomCardFlatSchema,
  roomsHeader: RoomsHeaderSchema,
  roomsGrid: RoomsGridSchema,
  roomsPage: RoomsPageSchema,

  // UI Component Contracts (empty until defined)
  ...UIComponentContracts,
};

// Infer valid keys automatically
export type ComponentContractName = keyof typeof ComponentContractRegistry;

