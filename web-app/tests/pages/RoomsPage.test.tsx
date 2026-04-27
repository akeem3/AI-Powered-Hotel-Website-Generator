/**
 * RoomsPage Tests - Story 1.5 Implementation
 *
 * Updated for Epic 24: The rooms page architecture changed to multi-language.
 * Tests the RoomsListingPage at app/[lang]/rooms/page.tsx.
 *
 * The old RoomsPageClient pattern (app/rooms/RoomsPageClient) no longer exists.
 * The page now uses getRoomsPageData loader and renders RoomCard components directly.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// ----------------------------------------------------------------
// Mock all dependencies BEFORE any imports
// ----------------------------------------------------------------

jest.mock('@/lib/cms-api', () => ({
  getHotelFull: jest.fn(),
}));

jest.mock('@/lib/cms-api/client', () => ({
  getHotelFull: jest.fn(),
}));

jest.mock('@/lib/cms-api/transformers', () => ({
  getAvailableLanguages: jest.fn(() => ['en', 'th', 'tr']),
  getAvailableRooms: jest.fn((rooms: any[]) => rooms),
}));

jest.mock('@/lib/loaders/hotel-page', () => ({
  getRoomsPageData: jest.fn(),
}));

jest.mock('@/lib/loaders/room-slug', () => ({
  generateRoomSlugs: jest.fn(),
  findRoomBySlug: jest.fn(),
}));

jest.mock('@/lib/metadata/hotel-metadata', () => ({
  getOgImageUrl: jest.fn(() => 'https://example.com/og-image.jpg'),
  SITE_URL: 'https://example.com',
  buildPageCanonicalUrl: jest.fn((baseUrl: string, lang: string, path: string) => `${baseUrl}/${lang}/${path}`),
  buildPageHreflangUrls: jest.fn(() => ({
    'en-US': 'https://example.com/en/rooms',
  })),
  getExtendedLocaleCode: jest.fn((lang: string) => `${lang}-US`),
  buildRoomsItemListJsonLd: jest.fn(() => ({ '@type': 'ItemList', itemListElement: [] })),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock BookingWidget so it renders a predictable test node
jest.mock('@/components/blocks/BookingWidget', () => {
  return function MockBookingWidget({ variant, defaultValues }: any) {
    return <div data-testid="booking-widget">Booking Widget</div>;
  };
});

// Mock RoomCard so it renders predictable headings/content
jest.mock('@/components/blocks/RoomCard', () => {
  return function MockRoomCard({ id, name, description, price, type }: any) {
    return (
      <div data-testid={`room-card-${id}`}>
        <h3>{name}</h3>
        {description && <p>{description}</p>}
        {price && <span>${price}/night</span>}
      </div>
    );
  };
});

jest.mock('@/components/seo/JsonLdScript', () => ({
  JsonLdScript: function MockJsonLdScript() {
    return null;
  },
}));

// ----------------------------------------------------------------
// Import page AFTER mocking
// ----------------------------------------------------------------
import RoomsPage from '@/app/[lang]/rooms/page';
import { getHotelFull as mockGetHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages as mockGetAvailableLanguages } from '@/lib/cms-api/transformers';
import { getRoomsPageData as mockGetRoomsPageData } from '@/lib/loaders/hotel-page';
import { generateRoomSlugs as mockGenerateRoomSlugs } from '@/lib/loaders/room-slug';

const mockHotelId = 'test-hotel-123';

// Default mock rooms matching the mockRooms.ts fixture data
const mockRoomsList = [
  {
    id: 'exec-suite-001',
    name: 'Executive Suite',
    room_type: 'Suite',
    capacity_adults: 4,
    status: 'available',
    sort_order: 1,
    featured_image: 'https://example.com/exec.jpg',
    description: 'Spacious suite with separate living area.',
  },
  {
    id: 'deluxe-king-002',
    name: 'Deluxe King Room',
    room_type: 'Standard',
    capacity_adults: 2,
    status: 'available',
    sort_order: 2,
    featured_image: 'https://example.com/deluxe.jpg',
    description: 'Comfortable room with king-size bed.',
  },
  {
    id: 'business-twin-003',
    name: 'Business Twin Room',
    room_type: 'Standard',
    capacity_adults: 2,
    status: 'available',
    sort_order: 3,
    featured_image: 'https://example.com/business.jpg',
    description: 'Perfect for business travelers.',
  },
];

const mockHotelData = {
  hotel: {
    id: mockHotelId,
    name: 'The Sterling Executive',
    slug: 'the-sterling-executive',
    property_type: 'hotel',
    star_rating: 5,
    status: 'published',
    parsedAddress: {
      street: '123 Business Ave',
      city: 'Metropolitan',
      state: 'CA',
      postal_code: '90210',
      country: 'USA',
    },
  },
  rooms: mockRoomsList,
  content: [
    { id: 'c1', language: 'en', variant: 'full', data: {} },
  ],
  images: [
    { id: 'img-1', url: 'https://example.com/image1.jpg', alt: 'Hotel Image' },
  ],
  facilities: [],
  _errors: [],
};

function buildMockRoomsPageData(rooms = mockRoomsList, hotel = mockHotelData.hotel) {
  return {
    hotel,
    rooms: {
      rooms: rooms.map((room) => ({
        id: room.id,
        name: room.name,
        type: room.room_type,
        price: 250,
        capacity: room.capacity_adults,
        amenities: ['WiFi', 'Workspace'],
        image: room.featured_image,
        description: room.description,
        variant: 'detailed' as const,
      })),
    },
    availableLanguages: ['en', 'th', 'tr'],
    images: mockHotelData.images,
    metadata: {
      hotelId: mockHotelId,
      fetchedAt: '2024-01-01T00:00:00Z',
      processingTimeMs: 100,
      hasErrors: false,
    },
  };
}

function buildMockSlugMap(rooms = mockRoomsList) {
  return new Map(
    rooms.map((room) => [
      room.name.toLowerCase().replace(/\s+/g, '-'),
      room,
    ])
  );
}

describe('RoomsPage - Story 1.5 Implementation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HOTEL_ID = mockHotelId;

    (mockGetHotelFull as jest.Mock).mockResolvedValue(mockHotelData);
    (mockGetAvailableLanguages as jest.Mock).mockReturnValue(['en', 'th', 'tr']);
    (mockGetRoomsPageData as jest.Mock).mockResolvedValue(buildMockRoomsPageData());
    (mockGenerateRoomSlugs as jest.Mock).mockReturnValue(buildMockSlugMap());
  });

  afterEach(() => {
    delete process.env.HOTEL_ID;
  });

  describe('AC3: Rooms Page Structure and Layout', () => {
    test('renders rooms page with default header content', async () => {
      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /rooms & suites/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByText(/comfort and elegance/i)).toBeInTheDocument();
    });

    test('includes booking widget by default', async () => {
      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByTestId('booking-widget')).toBeInTheDocument();
    });

    test('displays rooms grid with mock rooms', async () => {
      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      // All three rooms from mock data should be present
      expect(screen.getByRole('heading', { name: /executive suite/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /deluxe king room/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /business twin room/i })).toBeInTheDocument();
    });

    test('displays custom rooms when provided via loader', async () => {
      const customRooms = [
        {
          id: 'custom-room-1',
          name: 'Custom Deluxe Room',
          room_type: 'Deluxe',
          capacity_adults: 2,
          status: 'available',
          sort_order: 1,
          featured_image: '/custom-room.jpg',
          description: 'A custom room description',
        },
      ];

      (mockGetRoomsPageData as jest.Mock).mockResolvedValue(buildMockRoomsPageData(customRooms));
      (mockGenerateRoomSlugs as jest.Mock).mockReturnValue(buildMockSlugMap(customRooms));

      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: 'Custom Deluxe Room' })).toBeInTheDocument();
      expect(screen.getByText('A custom room description')).toBeInTheDocument();
    });
  });

  describe('Component Validation', () => {
    test('validates rooms page props in development', async () => {
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(consoleSpy).not.toHaveBeenCalledWith('[Validation Error]', expect.any(String));

      consoleSpy.mockRestore();
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic structure', async () => {
      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('provides descriptive content for screen readers', async () => {
      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /rooms & suites/i, level: 1 })).toBeInTheDocument();
    });
  });

  describe('Integration with Mock Data', () => {
    test('uses rooms data from loader when no custom rooms provided', async () => {
      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      // Rooms from the mock loader should all be present
      expect(screen.getByTestId('room-card-exec-suite-001')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-deluxe-king-002')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-business-twin-003')).toBeInTheDocument();
    });

    test('handles empty rooms array gracefully', async () => {
      (mockGetRoomsPageData as jest.Mock).mockResolvedValue(buildMockRoomsPageData([]));
      (mockGenerateRoomSlugs as jest.Mock).mockReturnValue(new Map());

      const jsx = await RoomsPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      // Page should still render without crashing
      expect(screen.getByRole('main')).toBeInTheDocument();
      // No room cards should be present
      expect(screen.queryByTestId('room-card-exec-suite-001')).not.toBeInTheDocument();
    });
  });
});
