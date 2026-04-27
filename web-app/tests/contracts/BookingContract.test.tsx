import { z } from 'zod';
import {
  BookingDataContract,
  BookingWidgetContract,
  type BookingData,
  type BookingWidgetContractType,
} from '@/lib/contracts/booking.contract';

describe('Booking Contract Validation - Story 1.5 Implementation', () => {
  describe('AC7: ZOD Contract Implementation for Booking System', () => {
    describe('BookingDataContract', () => {
      test('accepts valid booking data', () => {
        const validBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: 0,
          rooms: 1,
          roomType: 'Deluxe',
          specialRequests: 'Late check-in please',
        };

        const result = BookingDataContract.safeParse(validBookingData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validBookingData);
        }
      });

      test('accepts booking data without optional fields', () => {
        const minimalBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 1,
          children: 0,
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(minimalBookingData);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.roomType).toBeUndefined();
          expect(result.data.specialRequests).toBeUndefined();
        }
      });

      test('rejects invalid date types', () => {
        const invalidBookingData = {
          checkIn: '2024-06-15', // string instead of Date
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: 0,
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].message).toBe('checkIn must be a Date');
          expect(result.error.issues[0].path).toEqual(['checkIn']);
        }
      });

      test('rejects check-out date before check-in date', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-16'),
          checkOut: new Date('2024-06-15'), // Before check-in
          adults: 2,
          children: 0,
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].message).toBe('Check-out date must be after check-in date');
          expect(result.error.issues[0].path).toEqual(['checkOut']);
        }
      });

      test('rejects check-out date equal to check-in date', () => {
        const sameDate = new Date('2024-06-15');
        const invalidBookingData = {
          checkIn: sameDate,
          checkOut: sameDate, // Same date
          adults: 2,
          children: 0,
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].message).toBe('Check-out date must be after check-in date');
        }
      });

      test('rejects invalid adults count (too low)', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 0, // Below minimum of 1
          children: 0,
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['adults']);
        }
      });

      test('rejects invalid adults count (too high)', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 11, // Above maximum of 10
          children: 0,
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['adults']);
        }
      });

      test('rejects invalid children count (negative)', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: -1, // Negative value
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['children']);
        }
      });

      test('rejects invalid children count (too high)', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: 11, // Above maximum of 10
          rooms: 1,
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['children']);
        }
      });

      test('rejects invalid rooms count (too low)', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: 0,
          rooms: 0, // Below minimum of 1
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['rooms']);
        }
      });

      test('rejects invalid rooms count (too high)', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: 0,
          rooms: 6, // Above maximum of 5
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['rooms']);
        }
      });

      test('rejects special requests that are too long', () => {
        const invalidBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: 0,
          rooms: 1,
          specialRequests: 'a'.repeat(501), // 501 characters (over 500 limit)
        };

        const result = BookingDataContract.safeParse(invalidBookingData);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['specialRequests']);
        }
      });

      test('accepts special requests at maximum length', () => {
        const validBookingData = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2,
          children: 0,
          rooms: 1,
          specialRequests: 'a'.repeat(500), // Exactly 500 characters
        };

        const result = BookingDataContract.safeParse(validBookingData);

        expect(result.success).toBe(true);
      });

      test('accepts floating point numbers converted to integers', () => {
        const bookingDataWithFloats = {
          checkIn: new Date('2024-06-15'),
          checkOut: new Date('2024-06-16'),
          adults: 2.5, // Will be rejected as it's not an integer
          children: 0.5, // Will be rejected as it's not an integer
          rooms: 1.0, // Will be rejected as it's not an integer
        };

        const result = BookingDataContract.safeParse(bookingDataWithFloats);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    describe('BookingWidgetContract', () => {
      test('accepts valid widget props without optional fields', () => {
        const validWidgetProps = {};

        const result = BookingWidgetContract.safeParse(validWidgetProps);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant).toBeUndefined();
          expect(result.data.className).toBeUndefined();
          expect(result.data.onSubmit).toBeUndefined();
          expect(result.data.defaultValues).toBeUndefined();
        }
      });

      test('accepts valid widget props with all fields', () => {
        const validWidgetProps = {
          variant: 'mobile' as const,
          className: 'custom-class',
          onSubmit: jest.fn(),
          defaultValues: {
            checkIn: new Date('2024-06-15'),
            checkOut: new Date('2024-06-16'),
            adults: 2,
            children: 0,
            rooms: 1,
          },
        };

        const result = BookingWidgetContract.safeParse(validWidgetProps);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant).toBe('mobile');
          expect(result.data.className).toBe('custom-class');
          expect(typeof result.data.onSubmit).toBe('function');
          expect(result.data.defaultValues).toBeDefined();
        }
      });

      test('accepts desktop variant', () => {
        const desktopProps = {
          variant: 'desktop' as const,
        };

        const result = BookingWidgetContract.safeParse(desktopProps);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant).toBe('desktop');
        }
      });

      test('accepts mobile variant', () => {
        const mobileProps = {
          variant: 'mobile' as const,
        };

        const result = BookingWidgetContract.safeParse(mobileProps);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.variant).toBe('mobile');
        }
      });

      test('rejects invalid variant', () => {
        const invalidProps = {
          variant: 'tablet', // Not a valid variant
        };

        const result = BookingWidgetContract.safeParse(invalidProps);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['variant']);
        }
      });

      test('rejects invalid className type', () => {
        const invalidProps = {
          className: 123, // Should be string
        };

        const result = BookingWidgetContract.safeParse(invalidProps);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toHaveLength(1);
          expect(result.error.issues[0].path).toEqual(['className']);
        }
      });

      test('validates defaultValues with Date objects', () => {
        const propsWithDefaultValues = {
          defaultValues: {
            checkIn: new Date('2024-06-15'),
            checkOut: new Date('2024-06-16'),
            adults: 2,
            children: 0,
            rooms: 1,
          },
        };

        const result = BookingWidgetContract.safeParse(propsWithDefaultValues);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.defaultValues?.checkIn).toBeInstanceOf(Date);
          expect(result.data.defaultValues?.checkOut).toBeInstanceOf(Date);
        }
      });

      test('accepts partial defaultValues', () => {
        const partialDefaultValues = {
          defaultValues: {
            adults: 2,
            rooms: 1,
          },
        };

        const result = BookingWidgetContract.safeParse(partialDefaultValues);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.defaultValues?.adults).toBe(2);
          expect(result.data.defaultValues?.rooms).toBe(1);
          expect(result.data.defaultValues?.checkIn).toBeUndefined();
          expect(result.data.defaultValues?.checkOut).toBeUndefined();
          expect(result.data.defaultValues?.children).toBeUndefined();
        }
      });
    });

    describe('Type Safety', () => {
      test('BookingData type is correctly inferred', () => {
        const bookingData: BookingData = {
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000),
          adults: 2,
          children: 0,
          rooms: 1,
          roomType: 'Deluxe',
          specialRequests: 'Test request',
        };

        // This test verifies TypeScript types are working correctly
        expect(bookingData.checkIn).toBeInstanceOf(Date);
        expect(bookingData.adults).toBe(2);
      });

      test('BookingWidgetContractType is correctly inferred', () => {
        const widgetProps: BookingWidgetContractType = {
          variant: 'desktop',
          className: 'test-class',
          defaultValues: {
            adults: 2,
            rooms: 1,
          },
        };

        expect(widgetProps.variant).toBe('desktop');
        expect(widgetProps.className).toBe('test-class');
      });
    });

    describe('Edge Cases', () => {
      test('handles empty object', () => {
        const result = BookingDataContract.safeParse({});

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(4); // Multiple required fields missing
        }
      });

      test('handles null and undefined values', () => {
        const result = BookingDataContract.safeParse({
          checkIn: null,
          checkOut: undefined,
          adults: null,
          children: undefined,
          rooms: null,
        });

        expect(result.success).toBe(false);
      });

      test('accepts valid boundary values', () => {
        const boundaryValues = {
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 24 * 60 * 60 * 1000),
          adults: 10, // Maximum allowed
          children: 10, // Maximum allowed
          rooms: 5, // Maximum allowed
          specialRequests: '', // Empty string is valid
        };

        const result = BookingDataContract.safeParse(boundaryValues);

        expect(result.success).toBe(true);
      });
    });
  });
});