import { BookingWidgetContract, BookingDataContract } from '../../lib/contracts/booking.contract';
import { testContractPerformance, testContractValidation } from './contract-test-utils';

describe('BookingWidget Contract Validation', () => {
  const validWidgetConfig = {
    variant: 'mobile' as const,
    className: 'booking-widget-custom',
    onSubmit: jest.fn(),
    defaultValues: {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 2,
      children: 0,
      rooms: 1
    }
  };

  const invalidWidgetConfigs = [
    { variant: 'invalid' as any }, // Invalid variant
    { className: 123 as any }, // Invalid className type
    { defaultValues: 'not-object' as any }, // Invalid defaultValues type
    {
      defaultValues: {
        checkIn: '2025-11-15', // Should be Date
        adults: 2
      }
    },
    {
      defaultValues: {
        checkIn: new Date(),
        adults: 0 // Below minimum
      }
    },
    {
      defaultValues: {
        checkIn: new Date(),
        adults: 11 // Above maximum
      }
    }
  ];

  const validBookingData = {
    checkIn: new Date('2025-11-15'),
    checkOut: new Date('2025-11-17'),
    adults: 2,
    children: 0,
    rooms: 1,
    roomType: 'Deluxe',
    specialRequests: 'Late check-in please'
  };

  const invalidBookingData = [
    {
      checkIn: '2025-11-15', // String instead of Date
      checkOut: new Date('2025-11-17'),
      adults: 2,
      children: 0,
      rooms: 1
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-10'), // Before check-in
      adults: 2,
      children: 0,
      rooms: 1
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-15'), // Same date
      adults: 2,
      children: 0,
      rooms: 1
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 0, // Below minimum
      children: 0,
      rooms: 1
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 11, // Above maximum
      children: 0,
      rooms: 1
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 2,
      children: -1, // Negative
      rooms: 1
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 2,
      children: 11, // Above maximum
      rooms: 1
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 2,
      children: 0,
      rooms: 0 // Below minimum
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 2,
      children: 0,
      rooms: 6 // Above maximum
    },
    {
      checkIn: new Date('2025-11-15'),
      checkOut: new Date('2025-11-17'),
      adults: 2,
      children: 0,
      rooms: 1,
      specialRequests: 'a'.repeat(501) // Too long
    }
  ];

  describe('BookingWidget Contract Tests', () => {
    it('should validate valid widget configuration', () => {
      testContractValidation(BookingWidgetContract, validWidgetConfig, invalidWidgetConfigs);
    });

    it('should validate minimal widget configuration', () => {
      const minimalConfig = {};

      const result = BookingWidgetContract.safeParse(minimalConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.variant).toBeUndefined();
        expect(result.data.className).toBeUndefined();
        expect(result.data.onSubmit).toBeUndefined();
        expect(result.data.defaultValues).toBeUndefined();
      }
    });

    it('should validate configuration without optional fields', () => {
      const configWithoutOptionals = {
        variant: 'desktop' as const
      };

      const result = BookingWidgetContract.safeParse(configWithoutOptionals);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.variant).toBe('desktop');
        expect(result.data.className).toBeUndefined();
        expect(result.data.onSubmit).toBeUndefined();
        expect(result.data.defaultValues).toBeUndefined();
      }
    });

    it('should accept both mobile and desktop variants', () => {
      const mobileConfig = { variant: 'mobile' as const };
      const desktopConfig = { variant: 'desktop' as const };

      const mobileResult = BookingWidgetContract.safeParse(mobileConfig);
      const desktopResult = BookingWidgetContract.safeParse(desktopConfig);

      expect(mobileResult.success).toBe(true);
      expect(desktopResult.success).toBe(true);

      if (mobileResult.success && desktopResult.success) {
        expect(mobileResult.data.variant).toBe('mobile');
        expect(desktopResult.data.variant).toBe('desktop');
      }
    });

    it('should accept function handlers', () => {
      const configWithHandlers = {
        onSubmit: jest.fn(),
        onRoomChange: jest.fn(),
        onDateChange: jest.fn()
      };

      const result = BookingWidgetContract.safeParse(configWithHandlers);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(typeof result.data.onSubmit).toBe('function');
      }
    });
  });

  describe('BookingWidget Performance Tests', () => {
    it('should validate under performance threshold', () => {
      testContractPerformance(BookingWidgetContract, validWidgetConfig, 5);
    });

    it('should validate complex widget configuration under performance threshold', () => {
      const complexConfig = {
        variant: 'desktop' as const,
        className: 'booking-widget executive-suite featured premium custom-styling',
        onSubmit: jest.fn(),
        onRoomChange: jest.fn(),
        onDateChange: jest.fn(),
        onGuestChange: jest.fn(),
        defaultValues: {
          checkIn: new Date('2025-12-20'),
          checkOut: new Date('2025-12-25'),
          adults: 4,
          children: 2,
          rooms: 2,
          roomType: 'Executive Suite'
        }
      };

      testContractPerformance(BookingWidgetContract, complexConfig, 10); // Complex configs need more time
    });
  });

  describe('BookingDataContract Tests', () => {
    it('should validate valid booking data', () => {
      testContractValidation(BookingDataContract, validBookingData, invalidBookingData);
    });

    it('should validate minimal booking data', () => {
      const minimalData = {
        checkIn: new Date('2025-11-15'),
        checkOut: new Date('2025-11-17'),
        adults: 1,
        children: 0,
        rooms: 1
      };

      const result = BookingDataContract.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should accept boundary values', () => {
      const boundaryData = {
        checkIn: new Date('2025-11-15'),
        checkOut: new Date('2025-11-16'),
        adults: 10, // Maximum
        children: 10, // Maximum
        rooms: 5, // Maximum
        specialRequests: 'a'.repeat(500) // Maximum length
      };

      const result = BookingDataContract.safeParse(boundaryData);
      expect(result.success).toBe(true);
    });
  });

  describe('Date Validation Tests', () => {
    it('should reject check-out before check-in', () => {
      const invalidDateData = {
        checkIn: new Date('2025-11-20'),
        checkOut: new Date('2025-11-15'), // Before check-in
        adults: 2,
        children: 0,
        rooms: 1
      };

      const result = BookingDataContract.safeParse(invalidDateData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Check-out date must be after check-in date');
        expect(result.error.issues[0].path).toEqual(['checkOut']);
      }
    });

    it('should reject check-out equal to check-in', () => {
      const sameDate = new Date('2025-11-15');
      const invalidDateData = {
        checkIn: sameDate,
        checkOut: sameDate, // Same date
        adults: 2,
        children: 0,
        rooms: 1
      };

      const result = BookingDataContract.safeParse(invalidDateData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Check-out date must be after check-in date');
        expect(result.error.issues[0].path).toEqual(['checkOut']);
      }
    });

    it('should accept valid date range', () => {
      const validDateData = {
        checkIn: new Date('2025-11-15'),
        checkOut: new Date('2025-11-20'), // 5 days later
        adults: 2,
        children: 0,
        rooms: 1
      };

      const result = BookingDataContract.safeParse(validDateData);
      expect(result.success).toBe(true);
    });
  });

  describe('Guest Count Validation Tests', () => {
    it('should validate guest count boundaries', () => {
      const invalidCounts = [
        { adults: 0, children: 0, rooms: 1 }, // adults too low
        { adults: 11, children: 0, rooms: 1 }, // adults too high
        { adults: 2, children: -1, rooms: 1 }, // children negative
        { adults: 2, children: 11, rooms: 1 }, // children too high
        { adults: 2, children: 0, rooms: 0 }, // rooms too low
        { adults: 2, children: 0, rooms: 6 }, // rooms too high
      ];

      invalidCounts.forEach((counts) => {
        const invalidData = {
          checkIn: new Date('2025-11-15'),
          checkOut: new Date('2025-11-17'),
          ...counts
        };

        const result = BookingDataContract.safeParse(invalidData);
        expect(result.success).toBe(false);
      });
    });

    it('should accept valid guest count combinations', () => {
      const validCounts = [
        { adults: 1, children: 0, rooms: 1 }, // Minimum
        { adults: 10, children: 0, rooms: 1 }, // Max adults
        { adults: 1, children: 10, rooms: 1 }, // Max children
        { adults: 5, children: 5, rooms: 3 }, // Mixed
        { adults: 2, children: 8, rooms: 5 }, // Max rooms
      ];

      validCounts.forEach((counts) => {
        const validData = {
          checkIn: new Date('2025-11-15'),
          checkOut: new Date('2025-11-17'),
          ...counts
        };

        const result = BookingDataContract.safeParse(validData);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Optional Fields Tests', () => {
    it('should accept booking data without optional fields', () => {
      const dataWithoutOptionals = {
        checkIn: new Date('2025-11-15'),
        checkOut: new Date('2025-11-17'),
        adults: 2,
        children: 0,
        rooms: 1
      };

      const result = BookingDataContract.safeParse(dataWithoutOptionals);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.roomType).toBeUndefined();
        expect(result.data.specialRequests).toBeUndefined();
      }
    });

    it('should accept booking data with optional fields', () => {
      const dataWithOptionals = {
        checkIn: new Date('2025-11-15'),
        checkOut: new Date('2025-11-17'),
        adults: 2,
        children: 0,
        rooms: 1,
        roomType: 'Executive Suite',
        specialRequests: 'Late check-in requested, ground floor preferred'
      };

      const result = BookingDataContract.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.roomType).toBe('Executive Suite');
        expect(result.data.specialRequests).toBe('Late check-in requested, ground floor preferred');
      }
    });
  });

  describe('Default Values Tests for Widget', () => {
    it('should handle partial default values', () => {
      const partialDefaults = {
        defaultValues: {
          adults: 2,
          rooms: 1
        }
      };

      const result = BookingWidgetContract.safeParse(partialDefaults);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.defaultValues?.adults).toBe(2);
        expect(result.data.defaultValues?.rooms).toBe(1);
        expect(result.data.defaultValues?.checkIn).toBeUndefined();
        expect(result.data.defaultValues?.checkOut).toBeUndefined();
        expect(result.data.defaultValues?.children).toBeUndefined();
      }
    });

    it('should validate default values structure', () => {
      const configWithDefaults = {
        defaultValues: {
          checkIn: new Date('2025-11-15'),
          checkOut: new Date('2025-11-17'),
          adults: 2,
          children: 1,
          rooms: 1
        }
      };

      const result = BookingWidgetContract.safeParse(configWithDefaults);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.defaultValues?.checkIn).toBeInstanceOf(Date);
        expect(result.data.defaultValues?.checkOut).toBeInstanceOf(Date);
        expect(typeof result.data.defaultValues?.adults).toBe('number');
        expect(typeof result.data.defaultValues?.children).toBe('number');
        expect(typeof result.data.defaultValues?.rooms).toBe('number');
      }
    });
  });
});