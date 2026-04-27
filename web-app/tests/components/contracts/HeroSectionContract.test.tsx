import { HeroSectionContract, HeroSectionContractType } from '@/lib/contracts/hero.contract';
import { RoomCardFlatSchema, RoomCardContractType } from '@/lib/contracts/room.contract';

describe('ZOD Contract Validation', () => {
  describe('HeroSection Contract', () => {
    const validHeroData: HeroSectionContractType = {
      title: 'The Sterling Executive',
      tagline: 'Where Business Meets Boutique Excellence',
      headline: 'Experience bespoke service',
      description: 'A luxurious stay',
      primaryCTA: {
        text: 'View Rooms',
        href: '/rooms',
        ariaLabel: 'View available rooms',
      },
      secondaryCTA: {
        text: 'Contact Us',
        href: '/contact',
        ariaLabel: 'Contact hotel staff',
      },
      background: 'solid',
      className: 'custom-class',
    };

    describe('Valid Data', () => {
      it('accepts complete valid hero data', () => {
        const result = HeroSectionContract.safeParse(validHeroData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe('The Sterling Executive');
          expect(result.data.headline).toBe('Experience bespoke service');
        }
      });

      it('accepts minimal required hero data', () => {
        const minimalData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
        };

        const result = HeroSectionContract.safeParse(minimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.title).toBe('Test Hotel');
          expect(result.data.headline).toBe('Test Headline');
        }
      });

      it('accepts hero data without optional fields', () => {
        const dataWithoutOptionals = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          background: 'gradient' as const,
        };

        const result = HeroSectionContract.safeParse(dataWithoutOptionals);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.background).toBe('gradient');
          expect(result.data.tagline).toBeUndefined();
          expect(result.data.description).toBeUndefined();
        }
      });

      it('accepts hero data with primary CTA only', () => {
        const dataWithPrimaryCTA = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          primaryCTA: {
            text: 'Book Now',
            href: '/booking',
          },
        };

        const result = HeroSectionContract.safeParse(dataWithPrimaryCTA);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.primaryCTA?.text).toBe('Book Now');
          expect(result.data.secondaryCTA).toBeUndefined();
        }
      });

      it('accepts hero data with secondary CTA only', () => {
        const dataWithSecondaryCTA = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          secondaryCTA: {
            text: 'Learn More',
            href: '/about',
          },
        };

        const result = HeroSectionContract.safeParse(dataWithSecondaryCTA);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.secondaryCTA?.text).toBe('Learn More');
          expect(result.data.primaryCTA).toBeUndefined();
        }
      });
    });

    describe('Invalid Data', () => {
      it('rejects data missing required title', () => {
        const invalidData = {
          headline: 'Test Headline',
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('title');
        }
      });

      it('rejects data missing required headline', () => {
        const invalidData = {
          title: 'Test Hotel',
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('headline');
        }
      });

      it('rejects title that exceeds maximum length', () => {
        const invalidData = {
          title: 'a'.repeat(201), // Exceeds 200 character limit
          headline: 'Test Headline',
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('title');
          expect(result.error.issues[0].message).toContain('Too big');
        }
      });

      it('rejects title that is empty string', () => {
        const invalidData = {
          title: '',
          headline: 'Test Headline',
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('title');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects headline that exceeds maximum length', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'a'.repeat(501), // Exceeds 500 character limit
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('headline');
          expect(result.error.issues[0].message).toContain('Too big');
        }
      });

      it('rejects headline that is empty string', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: '',
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('headline');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects tagline that exceeds maximum length', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          tagline: 'a'.repeat(401), // Exceeds 400 character limit
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('tagline');
          expect(result.error.issues[0].message).toContain('Too big');
        }
      });

      it('rejects description that exceeds maximum length', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          description: 'a'.repeat(801), // Exceeds 800 character limit
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('description');
          expect(result.error.issues[0].message).toContain('Too big');
        }
      });

      it('rejects primary CTA with missing text', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          primaryCTA: {
            href: '/rooms',
          } as any,
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('primaryCTA');
          expect(result.error.issues[0].path).toContain('text');
        }
      });

      it('rejects primary CTA with missing href', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          primaryCTA: {
            text: 'Book Now',
          } as any,
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('primaryCTA');
          expect(result.error.issues[0].path).toContain('href');
        }
      });

      it('rejects primary CTA with empty text', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          primaryCTA: {
            text: '',
            href: '/rooms',
          },
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('primaryCTA');
          expect(result.error.issues[0].path).toContain('text');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects primary CTA with empty href', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          primaryCTA: {
            text: 'Book Now',
            href: '',
          },
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('primaryCTA');
          expect(result.error.issues[0].path).toContain('href');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects invalid background type', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          background: 'invalid' as any,
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('background');
          expect(result.error.issues[0].message).toContain('Invalid');
        }
      });

      it('rejects non-string className', () => {
        const invalidData = {
          title: 'Test Hotel',
          headline: 'Test Headline',
          className: 123 as any,
        };

        const result = HeroSectionContract.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('className');
          expect(result.error.issues[0].message).toContain('expected string');
        }
      });
    });

    describe('Type Safety', () => {
      it('maintains type safety for valid data', () => {
        const result = HeroSectionContract.safeParse(validHeroData);
        expect(result.success).toBe(true);
        if (result.success) {
          // TypeScript should infer these types correctly
          const typedData: HeroSectionContractType = result.data;
          expect(typeof typedData.title).toBe('string');
          expect(typeof typedData.headline).toBe('string');
          expect(typeof typedData.background).toBe('string');
        }
      });

      it('provides correct default values', () => {
        const dataWithDefaults = {
          title: 'Test Hotel',
          headline: 'Test Headline',
        };

        const result = HeroSectionContract.safeParse(dataWithDefaults);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.background).toBe('solid'); // Default value
        }
      });
    });
  });

  describe('RoomCard Contract', () => {
    const validRoomData: RoomCardContractType = {
      id: 'room-001',
      name: 'Executive Suite',
      type: 'Suite',
      price: 350,
      capacity: 4,
      amenities: ['WiFi', 'Workspace', 'Mini Bar'],
      image: '/images/room.jpg',
      description: 'Spacious suite with city view',
      variant: 'detailed',
      className: 'custom-room-class',
    };

    describe('Valid Data', () => {
      it('accepts complete valid room data', () => {
        const result = RoomCardFlatSchema.safeParse(validRoomData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe('room-001');
          expect(result.data.name).toBe('Executive Suite');
          expect(result.data.price).toBe(350);
        }
      });

      it('accepts minimal required room data', () => {
        const minimalData = {
          id: 'room-002',
          name: 'Standard Room',
          type: 'Standard',
          price: 150,
          capacity: 2,
        };

        const result = RoomCardFlatSchema.safeParse(minimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.id).toBe('room-002');
          expect(result.data.name).toBe('Standard Room');
          expect(result.data.price).toBe(150);
          expect(result.data.amenities).toEqual([]); // Default empty array
        }
      });

      it('accepts room data without optional fields', () => {
        const dataWithoutOptionals = {
          id: 'room-003',
          name: 'Budget Room',
          type: 'Budget',
          price: 100,
          capacity: 1,
        };

        const result = RoomCardFlatSchema.safeParse(dataWithoutOptionals);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.image).toBeUndefined();
          expect(result.data.description).toBeUndefined();
          expect(result.data.variant).toBe('detailed'); // Default value
        }
      });

      it('accepts all variant types', () => {
        const variants = ['compact', 'detailed', 'grid'] as const;

        variants.forEach((variant) => {
          const dataWithVariant = {
            ...validRoomData,
            variant,
          };

          const result = RoomCardFlatSchema.safeParse(dataWithVariant);
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.variant).toBe(variant);
          }
        });
      });
    });

    describe('Invalid Data', () => {
      it('rejects data missing required id', () => {
        const invalidData = {
          name: 'Test Room',
          type: 'Standard',
          price: 150,
          capacity: 2,
        } as any;

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('id');
          expect(result.error.issues[0].message).toContain('Invalid input');
        }
      });

      it('rejects data with empty id', () => {
        const invalidData = {
          ...validRoomData,
          id: '',
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('id');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects data missing required name', () => {
        const invalidData = {
          id: 'room-001',
          type: 'Standard',
          price: 150,
          capacity: 2,
        } as any;

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('name');
          expect(result.error.issues[0].message).toContain('Invalid input');
        }
      });

      it('rejects data with empty name', () => {
        const invalidData = {
          ...validRoomData,
          name: '',
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('name');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects name that exceeds maximum length', () => {
        const invalidData = {
          ...validRoomData,
          name: 'a'.repeat(101), // Exceeds 100 character limit
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('name');
          expect(result.error.issues[0].message).toContain('Too big');
        }
      });

      it('rejects data missing required type', () => {
        const invalidData = {
          id: 'room-001',
          name: 'Test Room',
          price: 150,
          capacity: 2,
        } as any;

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('type');
          expect(result.error.issues[0].message).toContain('Invalid input');
        }
      });

      it('rejects data with empty type', () => {
        const invalidData = {
          ...validRoomData,
          type: '',
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('type');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects data with negative price', () => {
        const invalidData = {
          ...validRoomData,
          price: -50,
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('price');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects data with zero price', () => {
        const invalidData = {
          ...validRoomData,
          price: 0,
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('price');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects data with negative capacity', () => {
        const invalidData = {
          ...validRoomData,
          capacity: -1,
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('capacity');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects data with zero capacity', () => {
        const invalidData = {
          ...validRoomData,
          capacity: 0,
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('capacity');
          expect(result.error.issues[0].message).toContain('Too small');
        }
      });

      it('rejects data with capacity exceeding maximum', () => {
        const invalidData = {
          ...validRoomData,
          capacity: 11, // Exceeds maximum of 10
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('capacity');
          expect(result.error.issues[0].message).toContain('Too big');
        }
      });

      it('rejects data with invalid variant', () => {
        const invalidData = {
          ...validRoomData,
          variant: 'invalid' as any,
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('variant');
          expect(result.error.issues[0].message).toContain('Invalid');
        }
      });

      it('rejects description that exceeds maximum length', () => {
        const invalidData = {
          ...validRoomData,
          description: 'a'.repeat(501), // Exceeds 500 character limit
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('description');
          expect(result.error.issues[0].message).toContain('Too big');
        }
      });

      it('rejects non-string className', () => {
        const invalidData = {
          ...validRoomData,
          className: 123 as any,
        };

        const result = RoomCardFlatSchema.safeParse(invalidData);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('className');
          expect(result.error.issues[0].message).toContain('expected string');
        }
      });
    });

    describe('Edge Cases', () => {
      it('handles empty amenities array', () => {
        const dataWithEmptyAmenities = {
          ...validRoomData,
          amenities: [],
        };

        const result = RoomCardFlatSchema.safeParse(dataWithEmptyAmenities);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.amenities).toEqual([]);
        }
      });

      it('rejects null amenities', () => {
        const dataWithNullAmenities = {
          ...validRoomData,
          amenities: null as any,
        };

        const result = RoomCardFlatSchema.safeParse(dataWithNullAmenities);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].path).toContain('amenities');
          expect(result.error.issues[0].message).toContain('expected array, received null');
        }
      });

      it('handles undefined amenities as default empty array', () => {
        const dataWithUndefinedAmenities = {
          ...validRoomData,
          amenities: undefined,
        };

        const result = RoomCardFlatSchema.safeParse(dataWithUndefinedAmenities);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.amenities).toEqual([]);
        }
      });
    });

    describe('Type Safety', () => {
      it('maintains type safety for valid data', () => {
        const result = RoomCardFlatSchema.safeParse(validRoomData);
        expect(result.success).toBe(true);
        if (result.success) {
          const typedData: RoomCardContractType = result.data;
          expect(typeof typedData.id).toBe('string');
          expect(typeof typedData.name).toBe('string');
          expect(typeof typedData.price).toBe('number');
          expect(typeof typedData.capacity).toBe('number');
          expect(Array.isArray(typedData.amenities)).toBe(true);
        }
      });

      it('provides correct default values', () => {
        const minimalData = {
          id: 'room-001',
          name: 'Test Room',
          type: 'Standard',
          price: 150,
          capacity: 2,
        };

        const result = RoomCardFlatSchema.safeParse(minimalData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant).toBe('detailed'); // Default value
          expect(result.data.amenities).toEqual([]); // Default empty array
        }
      });
    });
  });
});