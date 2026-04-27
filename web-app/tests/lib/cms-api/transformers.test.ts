/**
 * CMS API Transformers Unit Tests
 *
 * Tests for data transformation utilities.
 *
 * @see lib/cms-api/transformers
 */

import {
  getVariantType,
  getContentVariant,
  getContentVariantWithMetadata,
  buildContentLookup,
  getAvailableLanguages,
  groupFacilitiesByCategory,
  getFacilitiesByCategoryWithMetadata,
  getAvailableRooms,
  groupRoomsByType,
  transformHotelData,
  getContentForUseCase,
  validateHotelDataCompleteness,
  extractSeoMetadata,
} from '@/lib/cms-api/transformers';
import { ContentVariant } from '@/lib/cms-api/types';
import type { CmsContent, CmsFacility, CmsRoom } from '@/lib/cms-api/types';

// Mock data
const mockContent: CmsContent[] = [
  {
    id: '1',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    content_type: ContentVariant.CONCISE,
    title: 'Hotel Concise',
    content: 'A concise description of the hotel.',
    language: 'en',
    status: 'published',
    sort_order: 1,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '2',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    content_type: ContentVariant.STANDARD,
    title: 'Hotel Standard',
    content: 'A standard description of the hotel with more details.',
    language: 'en',
    status: 'published',
    sort_order: 2,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '3',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    content_type: ContentVariant.EXTENDED,
    title: 'Hotel Extended',
    content: 'An extended description of the hotel with comprehensive details about amenities, location, and services.',
    language: 'en',
    status: 'published',
    sort_order: 3,
    parent_content_id: null,
    has_override: false,
  },
  {
    id: '4',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    content_type: ContentVariant.CONCISE,
    title: 'Hotel Concise',
    content: 'โรงแรมสวยงามริมชายหาด',
    language: 'th',
    status: 'published',
    sort_order: 4,
    parent_content_id: null,
    has_override: false,
  },
];

const mockFacilities: CmsFacility[] = [
  {
    id: '1',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Beach',
    type: 'Activities',
    category: 'Activities',
    available: true,
    sort_order: 1,
    status: 'published',
    description: 'Private beach',
    booking_required: false,
    featured_image: null,
    operating_hours: null,
    capacity: null,
    age_restrictions: null,
  },
  {
    id: '2',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Spa',
    type: 'Wellness',
    category: 'Wellness',
    available: true,
    sort_order: 2,
    status: 'published',
    description: 'Full service spa',
    booking_required: true,
    featured_image: null,
    operating_hours: '9:00 - 18:00',
    capacity: null,
    age_restrictions: null,
  },
  {
    id: '3',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Closed Gym',
    type: 'Wellness',
    category: 'Wellness',
    available: false,
    sort_order: 3,
    status: 'unavailable',
    description: 'Under renovation',
    booking_required: false,
    featured_image: null,
    operating_hours: null,
    capacity: null,
    age_restrictions: null,
  },
];

const mockRooms: CmsRoom[] = [
  {
    id: '1',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Deluxe Room',
    room_type: 'standard',
    capacity_adults: 2,
    capacity_children: 1,
    description: 'Spacious room with ocean view',
    featured_image: null,
    status: 'available',
    sort_order: 1,
    room_details: null,
    has_override: false,
  },
  {
    id: '2',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Suite',
    room_type: 'suite',
    capacity_adults: 3,
    capacity_children: 2,
    description: 'Luxury suite with balcony',
    featured_image: null,
    status: 'available',
    sort_order: 2,
    room_details: null,
    has_override: false,
  },
  {
    id: '3',
    hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
    name: 'Maintenance Room',
    room_type: 'standard',
    capacity_adults: 2,
    capacity_children: 0,
    description: 'Under maintenance',
    featured_image: null,
    status: 'maintenance',
    sort_order: 3,
    room_details: null,
    has_override: false,
  },
];

describe('CMS API Transformers', () => {
  describe('getVariantType', () => {
    it('should return variant type for valid CMS content_type values', () => {
      expect(getVariantType(ContentVariant.CONCISE)).toBe('concise');
      expect(getVariantType(ContentVariant.STANDARD)).toBe('standard');
      expect(getVariantType(ContentVariant.EXTENDED)).toBe('extended');
    });

    it('should return undefined for invalid content_type values', () => {
      expect(getVariantType('Invalid Title')).toBeUndefined();
      expect(getVariantType('')).toBeUndefined();
    });
  });

  describe('getContentVariant', () => {
    it('should return correct content variant for language', () => {
      const result = getContentVariant(mockContent, 'en', 'concise');
      expect(result).toBe('A concise description of the hotel.');
    });

    it('should fallback to standard variant when requested variant not available', () => {
      const contentOnlyStandard: CmsContent[] = [
        {
          ...mockContent[1], // Standard variant
          title: ContentVariant.STANDARD,
        },
      ];
      const result = getContentVariant(contentOnlyStandard, 'en', 'concise');
      expect(result).toBe('A standard description of the hotel with more details.');
    });

    it('should fallback to English when requested language not available', () => {
      const result = getContentVariant(mockContent, 'ja', 'concise');
      expect(result).toBe('A concise description of the hotel.');
    });

    it('should return empty string when no content available', () => {
      const result = getContentVariant([], 'en', 'concise');
      expect(result).toBe('');
    });

    it('should return Thai content when requested', () => {
      const result = getContentVariant(mockContent, 'th', 'concise');
      expect(result).toBe('โรงแรมสวยงามริมชายหาด');
    });
  });

  describe('getContentVariantWithMetadata', () => {
    it('should return content with metadata when exact match found', () => {
      const result = getContentVariantWithMetadata(mockContent, 'en', 'concise');
      expect(result.content).toBe('A concise description of the hotel.');
      expect(result.language).toBe('en');
      expect(result.variant).toBe('concise');
      expect(result.wasFallback).toBe(false);
    });

    it('should indicate fallback when using different variant', () => {
      const contentOnlyExtended: CmsContent[] = [mockContent[2]]; // Only extended
      const result = getContentVariantWithMetadata(contentOnlyExtended, 'en', 'concise');
      expect(result.wasFallback).toBe(true);
    });
  });

  describe('buildContentLookup', () => {
    it('should create nested lookup structure', () => {
      const lookup = buildContentLookup(mockContent);

      expect(lookup['en']).toBeDefined();
      expect(lookup['en']['concise']).toBeDefined();
      expect(lookup['en']['concise']?.content).toBe('A concise description of the hotel.');
      expect(lookup['en']['standard']?.content).toBe('A standard description of the hotel with more details.');
      expect(lookup['en']['extended']?.content).toBe('An extended description of the hotel with comprehensive details about amenities, location, and services.');
    });

    it('should include Thai content in lookup', () => {
      const lookup = buildContentLookup(mockContent);

      expect(lookup['th']).toBeDefined();
      expect(lookup['th']['concise']).toBeDefined();
      expect(lookup['th']['concise']?.content).toBe('โรงแรมสวยงามริมชายหาด');
    });

    it('should skip unavailable content', () => {
      const contentWithUnavailable: CmsContent[] = [
        ...mockContent,
        {
          ...mockContent[0],
          status: 'unavailable',
          id: '999',
        },
      ];

      const lookup = buildContentLookup(contentWithUnavailable);

      // Count total items in lookup (should be 4 available, not 5)
      const totalCount = Object.values(lookup).reduce((sum, lang) => {
        return sum + Object.values(lang).length;
      }, 0);

      expect(totalCount).toBe(4); // Only available items
    });
  });

  describe('getAvailableLanguages', () => {
    it('should return unique language codes', () => {
      const languages = getAvailableLanguages(mockContent);
      expect(languages).toEqual(['en', 'th']);
    });

    it('should return empty array when no content', () => {
      const languages = getAvailableLanguages([]);
      expect(languages).toEqual([]);
    });

    it('should sort languages alphabetically', () => {
      const unsortedContent: CmsContent[] = [
        mockContent[3], // th
        mockContent[0], // en
      ];
      const languages = getAvailableLanguages(unsortedContent);
      expect(languages).toEqual(['en', 'th']);
    });
  });

  describe('groupFacilitiesByCategory', () => {
    it('should group facilities by category', () => {
      const grouped = groupFacilitiesByCategory(mockFacilities, false); // Include unavailable

      expect(grouped['Activities']).toBeDefined();
      expect(grouped['Wellness']).toBeDefined();
      expect(grouped['Activities']?.length).toBe(1);
      expect(grouped['Wellness']?.length).toBe(2); // Including unavailable
    });

    it('should filter available facilities when filterAvailable is true', () => {
      const grouped = groupFacilitiesByCategory(mockFacilities, true);

      expect(grouped['Wellness']?.length).toBe(1); // Only available
      expect(grouped['Wellness']?.[0].name).toBe('Spa'); // Not the closed one
    });

    it('should include all facilities when filterAvailable is false', () => {
      const grouped = groupFacilitiesByCategory(mockFacilities, false);

      expect(grouped['Wellness']?.length).toBe(2); // Both available and unavailable
    });

    it('should sort facilities within each category by sort_order', () => {
      const facilitiesOutOfOrder: CmsFacility[] = [
        mockFacilities[1], // sort_order: 2
        mockFacilities[0], // sort_order: 1
      ];

      const grouped = groupFacilitiesByCategory(facilitiesOutOfOrder);

      expect(grouped['Activities']?.[0].name).toBe('Beach'); // sort_order: 1
    });
  });

  describe('getFacilitiesByCategoryWithMetadata', () => {
    it('should return groups with count and availability metadata', () => {
      const result = getFacilitiesByCategoryWithMetadata(mockFacilities);

      expect(result.groups['Activities']).toBeDefined();
      expect(result.metadata['Activities']).toEqual({
        count: 1,
        hasAvailable: true,
      });

      expect(result.metadata['Wellness']).toEqual({
        count: 2,
        hasAvailable: true, // Has at least one available
      });
    });
  });

  describe('getAvailableRooms', () => {
    it('should return only available rooms sorted by sort_order', () => {
      const rooms = getAvailableRooms(mockRooms);

      expect(rooms.length).toBe(2); // Only available
      expect(rooms[0].name).toBe('Deluxe Room'); // sort_order: 1
      expect(rooms[1].name).toBe('Suite'); // sort_order: 2
    });

    it('should filter by custom status', () => {
      const rooms = getAvailableRooms(mockRooms, 'maintenance');

      expect(rooms.length).toBe(1);
      expect(rooms[0].name).toBe('Maintenance Room');
    });

    it('should return empty array when no rooms', () => {
      const rooms = getAvailableRooms([]);
      expect(rooms).toEqual([]);
    });
  });

  describe('groupRoomsByType', () => {
    it('should group rooms by type', () => {
      const grouped = groupRoomsByType(mockRooms);

      expect(grouped['standard']).toBeDefined();
      expect(grouped['suite']).toBeDefined();
      expect(grouped['standard']?.length).toBe(1);
      expect(grouped['suite']?.length).toBe(1);
    });

    it('should filter available rooms by default', () => {
      const grouped = groupRoomsByType(mockRooms);

      // standard has one available, one unavailable
      expect(grouped['standard']?.length).toBe(1); // Only available
    });
  });

  describe('getContentForUseCase', () => {
    it('should return extended variant for hero use case', () => {
      const content = getContentForUseCase(mockContent, 'en', 'hero');
      expect(content).toBe('An extended description of the hotel with comprehensive details about amenities, location, and services.');
    });

    it('should return standard variant for section use case', () => {
      const content = getContentForUseCase(mockContent, 'en', 'section');
      expect(content).toBe('A standard description of the hotel with more details.');
    });

    it('should return concise variant for card use case', () => {
      const content = getContentForUseCase(mockContent, 'en', 'card');
      expect(content).toBe('A concise description of the hotel.');
    });

    it('should return concise variant for meta and og use cases', () => {
      const meta = getContentForUseCase(mockContent, 'en', 'meta');
      const og = getContentForUseCase(mockContent, 'en', 'og');

      expect(meta).toBe('A concise description of the hotel.');
      expect(og).toBe('A concise description of the hotel.');
    });
  });

  describe('validateHotelDataCompleteness', () => {
    it('should validate complete hotel data', () => {
      const mockTransformedData = {
        hotel: {
          id: '09f207c1-695a-485a-9519-49f4ef03331f',
          name: 'Test Hotel',
          slug: 'test-hotel',
          property_type: 'hotel' as const,
          star_rating: 4,
          status: 'active' as const,
          opening_year: 2020,
          address: '{"city":"Test","state":"","street":"","country":"","postal_code":""}',
          is_template: false,
          has_override: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          parsedAddress: {
            city: 'Test',
            state: '',
            street: '',
            country: '',
            postal_code: '',
          },
        },
        contentByLanguage: {
          en: {
            concise: 'Test content',
            standard: 'Test content',
            extended: 'Test content',
          },
        } as Record<string, Record<'concise' | 'standard' | 'extended', string>>,
        rooms: mockRooms.slice(0, 1),
        facilitiesByCategory: {
          'Activities': [mockFacilities[0]],
        } as Record<string, typeof mockFacilities>,
        images: [],
        metadata: {
          hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
          fetched_at: '2024-01-01T00:00:00Z',
          processing_time_ms: 100,
          collections_fetched: ['hotel', 'content'],
        },
        errors: [] as string[],
      };

      const result = validateHotelDataCompleteness(mockTransformedData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should report missing hotel name', () => {
      const mockIncompleteData = {
        hotel: {
          id: '09f207c1-695a-485a-9519-49f4ef03331f',
          name: '', // Missing
          slug: 'test-hotel',
          property_type: 'hotel' as const,
          star_rating: 4,
          status: 'active' as const,
          opening_year: 2020,
          address: '{}',
          is_template: false,
          has_override: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          parsedAddress: {
            city: '',
            state: '',
            street: '',
            country: '',
            postal_code: '',
          },
        },
        contentByLanguage: {} as Record<string, Record<'concise' | 'standard' | 'extended', string>>,
        rooms: [],
        facilitiesByCategory: {} as Record<string, typeof mockFacilities>,
        images: null,
        metadata: {
          hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
          fetched_at: '2024-01-01T00:00:00Z',
          processing_time_ms: 100,
          collections_fetched: [],
        },
        errors: [] as string[],
      };

      const result = validateHotelDataCompleteness(mockIncompleteData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing hotel name');
    });

    it('should report content collection errors', () => {
      const mockWithErrors = {
        hotel: {
          id: '09f207c1-695a-485a-9519-49f4ef03331f',
          name: 'Test Hotel',
          slug: 'test-hotel',
          property_type: 'hotel' as const,
          star_rating: 4,
          status: 'active' as const,
          opening_year: 2020,
          address: '{}',
          is_template: false,
          has_override: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          parsedAddress: {
            city: '',
            state: '',
            street: '',
            country: '',
            postal_code: '',
          },
        },
        contentByLanguage: {} as Record<string, Record<'concise' | 'standard' | 'extended', string>>,
        rooms: [],
        facilitiesByCategory: {} as Record<string, typeof mockFacilities>,
        images: null,
        metadata: {
          hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
          fetched_at: '2024-01-01T00:00:00Z',
          processing_time_ms: 100,
          collections_fetched: [],
        },
        errors: ['content', 'rooms'] as string[],
      };

      const result = validateHotelDataCompleteness(mockWithErrors);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Content collection failed to fetch');
      expect(result.errors).toContain('Rooms collection failed to fetch');
    });
  });

  describe('extractSeoMetadata', () => {
    it('should extract SEO metadata from hotel data', () => {
      const mockTransformedData = {
        hotel: {
          id: '09f207c1-695a-485a-9519-49f4ef03331f',
          name: 'Grand Hotel',
          slug: 'grand-hotel',
          property_type: 'hotel' as const,
          star_rating: 5,
          status: 'active' as const,
          opening_year: 2020,
          address: '{"city":"Paris","state":"Île-de-France","street":"1 Rue de la Paix","country":"France","postal_code":"75002"}',
          is_template: false,
          has_override: false,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          parsedAddress: {
            city: 'Paris',
            state: 'Île-de-France',
            street: '1 Rue de la Paix',
            country: 'France',
            postal_code: '75002',
          },
        },
        contentByLanguage: {
          en: {
            concise: 'Luxury 5-star hotel in Paris',
            standard: 'Standard content',
            extended: 'Extended content',
          },
        } as Record<string, Record<'concise' | 'standard' | 'extended', string>>,
        rooms: [],
        facilitiesByCategory: {} as Record<string, typeof mockFacilities>,
        images: [{ id: 'image1', hotel_id: 'test' }],
        metadata: {
          hotel_id: '09f207c1-695a-485a-9519-49f4ef03331f',
          fetched_at: '2024-01-01T00:00:00Z',
          processing_time_ms: 100,
          collections_fetched: [],
        },
        errors: [] as string[],
      };

      const metadata = extractSeoMetadata(mockTransformedData, 'en');

      expect(metadata.title).toBe('Grand Hotel | Paris, France');
      expect(metadata.description).toBe('Luxury 5-star hotel in Paris');
      expect(metadata.ogImage).toBe('image1');
      expect(metadata.address).toBe('Paris, France');
    });
  });
});
