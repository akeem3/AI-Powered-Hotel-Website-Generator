import { RoomCardFlatSchema } from '../../lib/contracts/room.contract';
import { testContractPerformance, testContractValidation } from './contract-test-utils';

describe('RoomCard Contract Validation', () => {
  const validConfig = {
    id: 'room-001',
    name: 'Executive Suite',
    type: 'Suite',
    price: 350,
    capacity: 4,
    amenities: ['WiFi', 'Workspace', 'Mini Bar'],
    image: '/images/room.jpg',
    description: 'Spacious suite with city view',
    variant: 'detailed'
  };

  const invalidConfigs = [
    { id: 123, name: 'Test', type: 'Test', price: 100, capacity: 2 }, // Invalid id type
    { id: '', name: 'Test', type: 'Test', price: 100, capacity: 2 }, // Empty id
    { name: 'Test', type: 'Test', price: 100, capacity: 2 }, // Missing id
    { id: 'test', name: 123, type: 'Test', price: 100, capacity: 2 }, // Invalid name type
    { id: 'test', name: '', type: 'Test', price: 100, capacity: 2 }, // Empty name
    { id: 'test', name: 'Test', price: 100, capacity: 2 }, // Missing type
    { id: 'test', name: 'Test', type: '', price: 100, capacity: 2 }, // Empty type
    { id: 'test', name: 'Test', type: 'Test', price: -50, capacity: 2 }, // Negative price
    { id: 'test', name: 'Test', type: 'Test', price: 0, capacity: 2 }, // Zero price
    { id: 'test', name: 'Test', type: 'Test', price: 100, capacity: 0 }, // Zero capacity
    { id: 'test', name: 'Test', type: 'Test', price: 100, capacity: -1 }, // Negative capacity
    { id: 'test', name: 'Test', type: 'Test', price: 100, capacity: 11 }, // Capacity too high
    { id: 'test', name: 'a'.repeat(101), type: 'Test', price: 100, capacity: 2 }, // Name too long
  ];

  describe('Contract Validation Tests', () => {
    it('should validate valid configuration', () => {
      testContractValidation(RoomCardFlatSchema, validConfig, invalidConfigs);
    });

    it('should validate configuration with optional fields', () => {
      const configWithOptionals = {
        ...validConfig,
        description: 'Luxurious suite with panoramic city views, premium amenities, and personalized service.',
        className: 'room-card executive-suite featured',
        onBookNow: jest.fn(),
        onViewDetails: jest.fn()
      };

      const result = RoomCardFlatSchema.safeParse(configWithOptionals);
      expect(result.success).toBe(true);
    });

    it('should validate minimal configuration', () => {
      const minimalConfig = {
        id: 'room-002',
        name: 'Standard Room',
        type: 'Standard',
        price: 150,
        capacity: 2
      };

      const result = RoomCardFlatSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.amenities).toEqual([]); // Default empty array
        expect(result.data.variant).toBe('detailed'); // Default variant
      }
    });

    it('should validate configuration without optional fields', () => {
      const configWithoutOptionals = {
        id: 'room-003',
        name: 'Budget Room',
        type: 'Budget',
        price: 100,
        capacity: 1
      };

      const result = RoomCardFlatSchema.safeParse(configWithoutOptionals);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.image).toBeUndefined();
        expect(result.data.description).toBeUndefined();
        expect(result.data.className).toBeUndefined();
        expect(result.data.onBookNow).toBeUndefined();
        expect(result.data.onViewDetails).toBeUndefined();
      }
    });
  });

  describe('Contract Performance Tests', () => {
    it('should validate under performance threshold', () => {
      // Threshold doubled to 30ms to account for VM/WSL overhead variance
      testContractPerformance(RoomCardFlatSchema, validConfig, 30);
    });

    it('should validate complex configuration under performance threshold', () => {
      const complexConfig = {
        id: 'room-executive-penthouse-001',
        name: 'Presidential Penthouse Suite',
        type: 'Penthouse',
        price: 1250,
        capacity: 6,
        amenities: [
          'High-Speed WiFi',
          'Executive Workspace',
          'Mini Bar Premium',
          'Luxury Bathroom',
          'City View Balcony',
          'Smart TV',
          'Air Conditioning',
          'Room Service',
          'Safe Deposit Box',
          'Coffee Maker'
        ],
        image: '/images/presidential-suite.jpg',
        description: 'Experience unparalleled luxury in our presidential penthouse suite, featuring breathtaking panoramic city views, premium amenities, and exclusive personalized services.',
        variant: 'detailed' as const,
        className: 'room-card presidential-suite featured premium',
        onBookNow: jest.fn(),
        onViewDetails: jest.fn()
      };

      // Threshold doubled to 20ms to account for VM/WSL overhead variance
      testContractPerformance(RoomCardFlatSchema, complexConfig, 20);
    });
  });

  describe('Invalid Data Tests', () => {
    it('should reject configurations with missing required fields', () => {
      const incompleteConfigs = [
        {}, // Missing all required fields
        { id: 'test' }, // Missing name, type, price, capacity
        { id: 'test', name: 'Test' }, // Missing type, price, capacity
        { id: 'test', name: 'Test', type: 'Test' }, // Missing price, capacity
        { id: 'test', name: 'Test', type: 'Test', price: 100 }, // Missing capacity
      ];

      incompleteConfigs.forEach((config) => {
        const result = RoomCardFlatSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    it('should reject invalid variant values', () => {
      const invalidVariantConfigs = [
        { ...validConfig, variant: 'invalid' as any },
        { ...validConfig, variant: 123 as any },
        { ...validConfig, variant: null as any },
      ];

      invalidVariantConfigs.forEach((config) => {
        const result = RoomCardFlatSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });

    it('should reject invalid amenities', () => {
      const invalidAmenitiesConfigs = [
        { ...validConfig, amenities: 'not-an-array' as any },
        { ...validConfig, amenities: 123 as any },
        { ...validConfig, amenities: null as any },
        { ...validConfig, amenities: [1, 2, 3] as any }, // Array of numbers
        { ...validConfig, amenities: [{ name: 'test' }] as any }, // Array of objects
      ];

      invalidAmenitiesConfigs.forEach((config) => {
        const result = RoomCardFlatSchema.safeParse(config);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Variant Tests', () => {
    it('should accept all valid variant types', () => {
      const validVariants = ['compact', 'detailed', 'grid'] as const;

      validVariants.forEach((variant) => {
        const configWithVariant = {
          ...validConfig,
          variant
        };

        const result = RoomCardFlatSchema.safeParse(configWithVariant);
        expect(result.success).toBe(true);

        if (result.success) {
          expect(result.data.variant).toBe(variant);
        }
      });
    });
  });

  describe('Amenities Tests', () => {
    it('should handle empty amenities array', () => {
      const configWithEmptyAmenities = {
        ...validConfig,
        amenities: []
      };

      const result = RoomCardFlatSchema.safeParse(configWithEmptyAmenities);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.amenities).toEqual([]);
      }
    });

    it('should handle single amenity', () => {
      const configWithSingleAmenity = {
        ...validConfig,
        amenities: ['WiFi']
      };

      const result = RoomCardFlatSchema.safeParse(configWithSingleAmenity);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.amenities).toEqual(['WiFi']);
      }
    });

    it('should handle multiple amenities', () => {
      const configWithMultipleAmenities = {
        ...validConfig,
        amenities: ['WiFi', 'Workspace', 'Mini Bar', 'TV', 'Air Conditioning']
      };

      const result = RoomCardFlatSchema.safeParse(configWithMultipleAmenities);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.amenities).toHaveLength(5);
        expect(result.data.amenities).toContain('WiFi');
        expect(result.data.amenities).toContain('Workspace');
      }
    });
  });

  describe('Default Values Tests', () => {
    it('should provide correct default values', () => {
      const minimalConfig = {
        id: 'room-default-test',
        name: 'Test Room',
        type: 'Test Type',
        price: 200,
        capacity: 2
      };

      const result = RoomCardFlatSchema.safeParse(minimalConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.variant).toBe('detailed'); // Default variant
        expect(result.data.amenities).toEqual([]); // Default empty array
        expect(result.data.image).toBeUndefined();
        expect(result.data.description).toBeUndefined();
        expect(result.data.className).toBeUndefined();
      }
    });
  });

  describe('Type Safety Tests', () => {
    it('should maintain type safety for valid data', () => {
      const result = RoomCardFlatSchema.safeParse(validConfig);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(typeof result.data.id).toBe('string');
        expect(typeof result.data.name).toBe('string');
        expect(typeof result.data.type).toBe('string');
        expect(typeof result.data.price).toBe('number');
        expect(typeof result.data.capacity).toBe('number');
        expect(Array.isArray(result.data.amenities)).toBe(true);
        expect(typeof result.data.variant).toBe('string');
      }
    });

    it('should handle boundary values correctly', () => {
      const boundaryConfig = {
        id: 'boundary-test',
        name: 'B', // Single character
        type: 'B', // Single character
        price: 1, // Minimum positive
        capacity: 1, // Minimum positive
        amenities: [], // Empty array
        description: '', // Empty string
        className: '', // Empty string
      };

      const result = RoomCardFlatSchema.safeParse(boundaryConfig);
      expect(result.success).toBe(true);
    });

    it('should reject maximum boundary violations', () => {
      const maxBoundaryConfig = {
        ...validConfig,
        name: 'a'.repeat(101), // Exceeds max length
        capacity: 11, // Exceeds max capacity
        description: 'a'.repeat(501), // Exceeds max description length
      };

      const result = RoomCardFlatSchema.safeParse(maxBoundaryConfig);
      expect(result.success).toBe(false);
    });
  });
});