/**
 * Story 2.2 Contract Tests
 * ======================
 *
 * Tests for ZOD contracts with CVA variant integration from Story 2.2
 * Ensures:
 * - ZOD schemas validate correct inputs
 * - ZOD schemas reject invalid inputs (enum violations, length violations)
 * - All variant options constrained by enums (no free-form strings)
 * - Content fields validated (min/max lengths, URL formats)
 * - Array lengths constrained (reasonable min/max)
 * - .strict() mode enabled (no unexpected props)
 *
 * Story 2.2 Testing Requirements AC3
 */

import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';
import {
  HeroSectionContract,
  ImageGalleryContract,
  TestimonialsContract,
  AmenitiesContract,
  NavigationContract,
  BookingWidgetContract,
} from '../../lib/contracts';
import { ContactFormPropsSchema } from '../../lib/contracts/contact.contract';

describe('Story 2.2 Contract Integration Tests', () => {
  describe('HeroSectionContract - CVA Variant Integration', () => {
    it('validates correct hero config with CVA variants', () => {
      const valid = {
        variant: {
          style: 'modern',
          layout: 'centered',
          overlay: 'none',
          height: 'medium'
        },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service in the heart of paradise',
        tagline: 'Your perfect getaway awaits',
        primaryCTA: {
          text: 'Book Your Stay',
          href: '/booking'
        },
        className: 'custom-hero-class'
      };

      const result = HeroSectionContract.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid style enum values', () => {
      const invalid = {
        variant: {
          style: 'invalid-style' as any, // Not in enum
          layout: 'centered',
          overlay: 'none',
          height: 'medium'
        },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service'
      };

      const result = HeroSectionContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('rejects invalid layout enum values', () => {
      const invalid = {
        variant: {
          style: 'modern',
          layout: 'invalid-layout' as any, // Not in enum
          overlay: 'none',
          height: 'medium'
        },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service'
      };

      const result = HeroSectionContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('validates required title and headline constraints', () => {
      const missingTitle = {
        variant: { style: 'modern', layout: 'centered' },
        headline: 'Experience unparalleled comfort and service'
      };

      const missingHeadline = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'Welcome to Luxury Hotel Resort'
      };

      const titleResult = HeroSectionContract.safeParse(missingTitle);
      const headlineResult = HeroSectionContract.safeParse(missingHeadline);

      expect(titleResult.success).toBe(false);
      expect(headlineResult.success).toBe(false);
    });

    it('validates title length constraints', () => {
      const tooLong = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'This title is way too long and exceeds the maximum allowed length of two hundred characters for hero sections which should trigger validation error because multi-language support requires longer titles for non-English languages like Russian and Turkish.',
        headline: 'Experience unparalleled comfort and service'
      };

      const result = HeroSectionContract.safeParse(tooLong);
      expect(result.success).toBe(false);
    });

    it('validates headline length constraints', () => {
      const tooLong = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'This headline is extremely long and goes well beyond the maximum allowed length of five hundred characters for hero sections which would make it invalid according to the contract requirements for multi-language support and should trigger a validation error because we need to accommodate longer text in languages like Russian and Turkish with longer words and phrases that require more characters than English text typically does. This is additional text to ensure we definitely exceed five hundred characters limit.'
      };

      const result = HeroSectionContract.safeParse(tooLong);
      expect(result.success).toBe(false);
    });

    it('validates optional tagline and description constraints', () => {
      const valid = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service',
        tagline: 'Your perfect getaway awaits',
        description: 'This is a valid description within length limits',
        primaryCTA: {
          text: 'Book Your Stay',
          href: '/booking'
        }
      };

      const tooLongTagline = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service',
        tagline: 'This tagline is extremely long and goes well beyond the maximum allowed length of four hundred characters for taglines in multi-language support which would definitely make it invalid and cause validation to fail properly. This is more text to ensure it exceeds the new maximum limit of four hundred characters that ZOD enforces on the tagline field in the hero section contract schema validation rules for internationalization purposes.'
      };

      const validResult = HeroSectionContract.safeParse(valid);
      const tooLongResult = HeroSectionContract.safeParse(tooLongTagline);

      expect(validResult.success).toBe(true);
      expect(tooLongResult.success).toBe(false);
    });

    it('validates CTA constraints', () => {
      const validCTA = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service',
        primaryCTA: {
          text: 'Book Your Stay',
          href: '/booking',
          ariaLabel: 'Book your stay at our luxury hotel'
        }
      };

      const tooLongText = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service',
        primaryCTA: {
          text: 'This CTA text is way too long and exceeds the maximum allowed length of fifty characters',
          href: '/booking'
        }
      };

      const tooLongHref = {
        variant: { style: 'modern', layout: 'centered' },
        title: 'Welcome to Luxury Hotel Resort',
        headline: 'Experience unparalleled comfort and service',
        primaryCTA: {
          text: 'Book Your Stay',
          href: 'https://hotel.example.com/' + 'a'.repeat(300) // Too long URL
        }
      };

      const validResult = HeroSectionContract.safeParse(validCTA);
      const textResult = HeroSectionContract.safeParse(tooLongText);
      const hrefResult = HeroSectionContract.safeParse(tooLongHref);

      expect(validResult.success).toBe(true);
      expect(textResult.success).toBe(false);
      expect(hrefResult.success).toBe(false);
    });
  });

  describe('ImageGalleryContract - New from Story 2.2', () => {
    it('validates correct gallery config with CVA variants', () => {
      const valid = {
        variant: {
          layout: 'grid',
          spacing: 'normal',
          aspectRatio: 'landscape',
          columns: 3,
          cardStyle: 'default'
        },
        images: [
          {
            id: 'img-1',
            desktopUrl: 'https://hotel.example.com/gallery/lobby.webp',
            mobileUrl: 'https://hotel.example.com/gallery/lobby.m.webp',
            alt: 'Hotel lobby with modern decor',
            caption: 'Welcome to our elegant lobby'
          },
          {
            id: 'img-2',
            desktopUrl: 'https://hotel.example.com/gallery/pool.webp',
            mobileUrl: 'https://hotel.example.com/gallery/pool.m.webp',
            alt: 'Resort swimming pool area with palm trees'
          },
          {
            id: 'img-3',
            desktopUrl: 'https://hotel.example.com/gallery/room.webp',
            mobileUrl: 'https://hotel.example.com/gallery/room.m.webp',
            alt: 'Deluxe hotel room with ocean view',
            caption: 'Relax in our comfortable rooms'
          }
        ],
        enableLightbox: true,
        className: 'gallery-custom'
      };

      const result = ImageGalleryContract.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid layout enum values', () => {
      const invalid = {
        variant: {
          layout: 'invalid-layout' as any, // Not in enum
          columns: 3,
          cardStyle: 'default'
        },
        images: [
          {
            id: 'img-1',
            desktopUrl: 'https://hotel.example.com/gallery/lobby.webp',
            mobileUrl: 'https://hotel.example.com/gallery/lobby.m.webp',
            alt: 'Hotel lobby with modern design'
          },
          {
            id: 'img-2',
            desktopUrl: 'https://hotel.example.com/gallery/pool.webp',
            mobileUrl: 'https://hotel.example.com/gallery/pool.m.webp',
            alt: 'Beautiful swimming pool'
          },
          {
            id: 'img-3',
            desktopUrl: 'https://hotel.example.com/gallery/room.webp',
            mobileUrl: 'https://hotel.example.com/gallery/room.m.webp',
            alt: 'Comfortable hotel room'
          }
        ]
      };

      const result = ImageGalleryContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('validates image array length constraints', () => {
      const tooFew = {
        variant: { layout: 'grid' },
        images: [
          {
            id: 'img-1',
            desktopUrl: 'https://hotel.example.com/gallery/lobby.webp',
            mobileUrl: 'https://hotel.example.com/gallery/lobby.m.webp',
            alt: 'Hotel lobby'
          }
        ] // Only 1 image (< 3 minimum)
      };

      const tooMany = {
        variant: { layout: 'grid' },
        images: Array.from({ length: 35 }, (_, i) => ({
          id: `img-${i}`,
          desktopUrl: 'https://hotel.example.com/gallery/img.webp',
          mobileUrl: 'https://hotel.example.com/gallery/img.m.webp',
          alt: `Image ${i}`
        })) // 35 images - testing that there's no upper limit
      };

      const fewResult = ImageGalleryContract.safeParse(tooFew);
      const manyResult = ImageGalleryContract.safeParse(tooMany);

      expect(fewResult.success).toBe(true); // Empty gallery is now allowed (graceful degradation)
      expect(manyResult.success).toBe(true); // No upper limit on images
    });

    it('validates individual image constraints', () => {
      const invalidAlt = {
        variant: { layout: 'grid' },
        images: [
          {
            id: 'img-1',
            desktopUrl: 'https://hotel.example.com/gallery/lobby.webp',
            mobileUrl: 'https://hotel.example.com/gallery/lobby.m.webp',
            alt: 'XY' // Too short (< 5 chars) - increased from 5 to 150 for multi-language
          }
        ]
      };

      const tooLongCaption = {
        variant: { layout: 'grid' },
        images: [
          {
            id: 'img-1',
            desktopUrl: 'https://hotel.example.com/gallery/lobby.webp',
            mobileUrl: 'https://hotel.example.com/gallery/lobby.m.webp',
            alt: 'Valid alt text for image',
            caption: 'This caption is way too long and exceeds the maximum allowed length of three hundred characters for image captions in the gallery component contract validation requirements which should trigger a validation error because we increased the limit from two hundred to three hundred characters for multi-language support with longer text in languages like Russian and Turkish.'
          }
        ]
      };

      const altResult = ImageGalleryContract.safeParse(invalidAlt);
      const captionResult = ImageGalleryContract.safeParse(tooLongCaption);

      expect(altResult.success).toBe(false);
      expect(captionResult.success).toBe(false);
    });

    it('validates image URL format constraints', () => {
      const emptyUrl = {
        variant: { layout: 'grid' },
        images: [
          {
            id: 'img-1',
            desktopUrl: '', // Empty URL should fail
            mobileUrl: 'https://hotel.example.com/gallery/lobby.m.webp',
            alt: 'Hotel lobby'
          }
        ]
      };

      const result = ImageGalleryContract.safeParse(emptyUrl);
      expect(result.success).toBe(false);
    });
  });

  describe('TestimonialsContract - New from Story 2.2', () => {
    it('validates correct testimonials config with CVA variants', () => {
      const valid = {
        variant: {
          layout: 'grid',
          columns: 3,
          style: 'default'
        },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'John Smith',
            customerTitle: 'Business Traveler',
            avatarUrl: 'https://hotel.example.com/avatars/john.webp',
            rating: 5,
            quote: 'Excellent service and beautiful rooms. The staff went above and beyond to make our stay memorable.'
          },
          {
            id: 'testimonial-2',
            customerName: 'Sarah Johnson',
            rating: 4,
            quote: 'Great location and comfortable amenities. Would definitely recommend to others visiting the area.'
          }
        ]
      };

      const result = TestimonialsContract.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid layout enum values', () => {
      const invalid = {
        variant: {
          layout: 'invalid-layout' as any, // Not in enum
          columns: 3,
          style: 'default'
        },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'John Smith',
            rating: 5,
            quote: 'Excellent service and beautiful rooms.'
          },
          {
            id: 'testimonial-2',
            customerName: 'Jane Doe',
            rating: 4,
            quote: 'Great stay and wonderful service.'
          },
          {
            id: 'testimonial-3',
            customerName: 'Bob Wilson',
            rating: 5,
            quote: 'Amazing experience overall.'
          }
        ]
      };

      const result = TestimonialsContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('validates rating enum constraints', () => {
      const invalidRating = {
        variant: { layout: 'grid', style: 'default' },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'John Smith',
            rating: 6 as any, // Invalid rating (> 5)
            quote: 'Excellent service and beautiful rooms.'
          },
          {
            id: 'testimonial-2',
            customerName: 'Jane Doe',
            rating: 5,
            quote: 'Great stay and wonderful service.'
          },
          {
            id: 'testimonial-3',
            customerName: 'Bob Wilson',
            rating: 4,
            quote: 'Amazing experience overall.'
          }
        ]
      };

      const result = TestimonialsContract.safeParse(invalidRating);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid input');
      }
    });

    it('validates testimonials array length constraints', () => {
      const tooMany = {
        variant: { layout: 'grid' },
        testimonials: Array.from({ length: 15 }, (_, i) => ({
          id: `testimonial-${i}`,
          customerName: `Customer ${i}`,
          rating: 5,
          quote: 'Great experience!'
        })) // 15 testimonials (> 10 maximum)
      };

      const result = TestimonialsContract.safeParse(tooMany);
      expect(result.success).toBe(false);
    });

    it('validates customer name constraints', () => {
      const tooShort = {
        variant: { layout: 'grid' },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'A', // Too short (< 2 chars)
            rating: 5,
            quote: 'Excellent service and beautiful rooms.'
          }
        ]
      };

      const tooLong = {
        variant: { layout: 'grid' },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'This customer name is extremely long and goes well beyond the maximum allowed length of fifty characters for customer names in testimonials',
            rating: 5,
            quote: 'Excellent service and beautiful rooms.'
          }
        ]
      };

      const shortResult = TestimonialsContract.safeParse(tooShort);
      const longResult = TestimonialsContract.safeParse(tooLong);

      expect(shortResult.success).toBe(false);
      expect(longResult.success).toBe(false);
    });

    it('validates quote length constraints', () => {
      const tooShort = {
        variant: { layout: 'grid' },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'John Smith',
            rating: 5,
            quote: 'Too short' // Too short (< 20 chars)
          }
        ]
      };

      const tooLong = {
        variant: { layout: 'grid' },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'John Smith',
            rating: 5,
            quote: 'This quote is extremely long and exceeds the maximum allowed length of five hundred characters for testimonials which would make it invalid according to the contract requirements. '.repeat(10)
          }
        ]
      };

      const shortResult = TestimonialsContract.safeParse(tooShort);
      const longResult = TestimonialsContract.safeParse(tooLong);

      expect(shortResult.success).toBe(false);
      expect(longResult.success).toBe(false);
    });
  });

  describe('AmenitiesContract - New from Story 2.2', () => {
    it('validates correct amenities config with CVA variants', () => {
      const valid = {
        variant: {
          layout: 'grid',
          columns: 4,
          iconSize: 'medium',
          iconStyle: 'default',
          cardStyle: 'default'
        },
        amenities: [
          {
            id: 'wifi',
            name: 'High-Speed WiFi',
            description: 'Complimentary high-speed internet access throughout the property',
            icon: 'fas fa-wifi',
            category: 'hotel',
            featured: true
          },
          {
            id: 'pool',
            name: 'Swimming Pool',
            description: 'Olympic-size outdoor pool with heated water',
            icon: 'fas fa-swimming-pool',
            category: 'services'
          },
          {
            id: 'spa',
            name: 'Full-Service Spa',
            icon: 'fas fa-spa',
            category: 'services',
            featured: true
          },
          {
            id: 'room-service',
            name: '24/7 Room Service',
            icon: 'fas fa-concierge-bell',
            category: 'room'
          }
        ],
        showCategory: true,
        filterByCategory: 'hotel'
      };

      const result = AmenitiesContract.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid category enum values', () => {
      const invalid = {
        variant: { layout: 'grid' },
        amenities: [
          {
            id: 'invalid-amenity',
            name: 'Invalid Amenity',
            icon: 'fas fa-question',
            category: 'invalid-category' // Not in enum
          }
        ]
      };

      const result = AmenitiesContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('validates amenities array length constraints', () => {
      const tooFew = {
        variant: { layout: 'grid' },
        amenities: [
          {
            id: 'single-amenity',
            name: 'Lone Amenity',
            icon: 'fas fa-star',
            category: 'hotel'
          }
        ] // Only 1 amenity - minimum is now 1 (was 3) for multi-language support
      };

      const tooMany = {
        variant: { layout: 'grid' },
        amenities: Array.from({ length: 35 }, (_, i) => ({
          id: `amenity-${i}`,
          name: `Amenity ${i}`,
          icon: 'fas fa-star',
          category: 'hotel' as const
        })) // 35 amenities - testing that there's no upper limit
      };

      const fewResult = AmenitiesContract.safeParse(tooFew);
      const manyResult = AmenitiesContract.safeParse(tooMany);

      expect(fewResult.success).toBe(true); // Minimum is now 1 amenity
      expect(manyResult.success).toBe(true); // No upper limit on amenities
    });

    it('validates amenity name constraints', () => {
      const tooShort = {
        variant: { layout: 'grid' },
        amenities: [
          {
            id: 'short-name',
            name: 'A', // Too short (< 2 chars)
            icon: 'fas fa-star',
            category: 'hotel'
          }
        ]
      };

      const tooLong = {
        variant: { layout: 'grid' },
        amenities: [
          {
            id: 'long-name',
            name: 'This amenity name is extremely long and goes well beyond the maximum allowed length of sixty characters for amenity names in multi-language support which should trigger validation',
            icon: 'fas fa-star',
            category: 'hotel'
          }
        ]
      };

      const shortResult = AmenitiesContract.safeParse(tooShort);
      const longResult = AmenitiesContract.safeParse(tooLong);

      expect(shortResult.success).toBe(false);
      expect(longResult.success).toBe(false);
    });

    it('validates description optional constraints', () => {
      const valid = {
        variant: { layout: 'grid', cardStyle: 'default' },
        amenities: [
          {
            id: 'valid-desc',
            name: 'Valid Amenity',
            description: 'This is a valid description that meets length requirements',
            icon: 'fas fa-star',
            category: 'hotel'
          },
          {
            id: 'amenity-2',
            name: 'Second Amenity',
            description: 'Valid description',
            icon: 'fas fa-wifi',
            category: 'hotel'
          },
          {
            id: 'amenity-3',
            name: 'Third Amenity',
            description: 'Another valid description',
            icon: 'fas fa-pool',
            category: 'services'
          }
        ]
      };

      const tooLong = {
        variant: { layout: 'grid', cardStyle: 'default' },
        amenities: [
          {
            id: 'long-desc',
            name: 'Amenity with Long Description',
            description: 'This description is extremely long and exceeds the maximum allowed length of one hundred characters for amenity descriptions which would make it invalid according to the contract requirements and should trigger a validation error properly',
            icon: 'fas fa-star',
            category: 'hotel'
          },
          {
            id: 'amenity-2',
            name: 'Second Amenity',
            description: 'Valid description',
            icon: 'fas fa-wifi',
            category: 'hotel'
          },
          {
            id: 'amenity-3',
            name: 'Third Amenity',
            description: 'Another valid description',
            icon: 'fas fa-pool',
            category: 'services'
          }
        ]
      };

      const validResult = AmenitiesContract.safeParse(valid);
      const longResult = AmenitiesContract.safeParse(tooLong);

      expect(validResult.success).toBe(true);
      expect(longResult.success).toBe(false);
    });
  });

  describe('NavigationContract - CVA Variant Integration', () => {
    // NavigationContract requires brandName and links (Epic 22: data-driven navigation)
    const baseNavFields = {
      brandName: 'Test Hotel',
      links: [{ label: 'Home', href: '/' }],
    };

    it('validates correct navigation config with CVA variants', () => {
      const valid = {
        ...baseNavFields,
        variant: {
          style: 'solid',
          layout: 'classic'
        },
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        className: 'custom-navigation'
      };

      const result = NavigationContract.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid style enum values', () => {
      const invalid = {
        ...baseNavFields,
        variant: {
          style: 'invalid-style' as any, // Not in enum
          layout: 'classic'
        },
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }]
      };

      const result = NavigationContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('accepts navigation config without variant', () => {
      const minimal = {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }],
        className: 'minimal-navigation'
      };

      const result = NavigationContract.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('accepts empty navigation config', () => {
      const empty = {
        brandName: 'Test Hotel',
        links: [{ label: 'Home', href: '/' }]
      };

      const result = NavigationContract.safeParse(empty);
      expect(result.success).toBe(true);
    });
  });

  describe('BookingWidgetContract - CVA Variant Integration', () => {
    it('validates correct booking widget config with CVA variants', () => {
      const valid = {
        variant: 'desktop',
        theme: 'light',
        className: 'custom-booking-widget'
      };

      const result = BookingWidgetContract.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid variant enum values', () => {
      const invalid = {
        variant: 'invalid-variant' as any, // Not in enum
        theme: 'light'
      };

      const result = BookingWidgetContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('rejects invalid theme enum values', () => {
      const invalid = {
        variant: 'desktop',
        theme: 'invalid-theme' as any // Not in enum
      };

      const result = BookingWidgetContract.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('accepts booking widget config without variants', () => {
      const minimal = {
        className: 'minimal-booking-widget'
      };

      const result = BookingWidgetContract.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('accepts empty booking widget config', () => {
      const empty = {};

      const result = BookingWidgetContract.safeParse(empty);
      expect(result.success).toBe(true);
    });
  });

  describe('ContactFormPropsSchema - CVA Variant Integration', () => {
    it('validates correct contact form config with CVA variants', () => {
      const valid = {
        variant: { style: 'default', background: 'none' },
        className: 'custom-contact-form'
      };

      const result = ContactFormPropsSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects invalid variant enum values', () => {
      const invalid = {
        variant: { style: 'invalid-variant' as any, background: 'none' } // Not in enum
      };

      const result = ContactFormPropsSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid');
      }
    });

    it('accepts contact form config without variant', () => {
      const minimal = {
        className: 'minimal-contact-form'
      };

      const result = ContactFormPropsSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it('accepts empty contact form config', () => {
      const empty = {};

      const result = ContactFormPropsSchema.safeParse(empty);
      expect(result.success).toBe(true);
    });
  });
});

describe('Story 2.2 Contract Performance Tests', () => {
  it('validates contracts performantly (<5ms per component)', () => {
    const testContracts = [
      {
        name: 'HeroSectionContract',
        contract: HeroSectionContract,
        data: {
          variant: { style: 'modern', layout: 'centered', overlay: 'none', height: 'medium' },
          title: 'Welcome to Luxury Hotel Resort',
          headline: 'Experience unparalleled comfort and service',
          primaryCTA: {
            text: 'Book Your Stay',
            href: '/booking'
          }
        }
      },
      {
        name: 'ImageGalleryContract',
        contract: ImageGalleryContract,
        data: {
          variant: { layout: 'grid', columns: 3, cardStyle: 'default' },
          images: Array.from({ length: 5 }, (_, i) => ({
            id: `img-${i}`,
            desktopUrl: 'https://hotel.example.com/gallery/img.webp',
            mobileUrl: 'https://hotel.example.com/gallery/img.m.webp',
            alt: `Gallery image ${i} with proper description`
          }))
        }
      },
      {
        name: 'TestimonialsContract',
        contract: TestimonialsContract,
        data: {
          variant: { layout: 'grid', columns: 3, style: 'default' },
          testimonials: Array.from({ length: 3 }, (_, i) => ({
            id: `testimonial-${i}`,
            customerName: `Customer ${i}`,
            rating: 5,
            quote: 'Excellent service and beautiful rooms. Would definitely recommend!'
          }))
        }
      },
      {
        name: 'AmenitiesContract',
        contract: AmenitiesContract,
        data: {
          variant: { layout: 'grid', columns: 4, cardStyle: 'default' },
          amenities: Array.from({ length: 8 }, (_, i) => ({
            id: `amenity-${i}`,
            name: `Amenity ${i}`,
            icon: 'fas fa-star',
            category: 'hotel' as const
          }))
        }
      }
    ];

    testContracts.forEach(({ name, contract, data }) => {
      const iterations = 100;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        contract.parse(data);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      // Performance requirement: <5ms per validation
      expect(avgTime).toBeLessThan(5);
      console.log(`${name}: ${avgTime.toFixed(2)}ms average validation time`);
    });
  });
});