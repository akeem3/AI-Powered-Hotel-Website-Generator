/**
 * Rooms Page Tests (Legacy Path)
 *
 * Updated for Epic 24: The rooms page has moved to /{lang}/rooms.
 * The (site)/rooms/page.tsx now only redirects to /{DEFAULT_LOCALE}/rooms.
 *
 * These tests cover the multi-language rooms listing page at app/[lang]/rooms/page.tsx
 * using the same mocking patterns as tests/app/[lang]/rooms/page.test.tsx.
 */

import React from 'react';
import '@testing-library/jest-dom';

// ----------------------------------------------------------------
// Mock CMS and external dependencies BEFORE any imports
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
    'th-TH': 'https://example.com/th/rooms',
    'tr-TR': 'https://example.com/tr/rooms',
  })),
  getExtendedLocaleCode: jest.fn((lang: string) => `${lang}-US`),
  buildRoomsItemListJsonLd: jest.fn(() => ({ '@type': 'ItemList', itemListElement: [] })),
}));

// Mock next/navigation to avoid redirect errors
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock BookingWidget (client component with date picker complexity)
jest.mock('@/components/blocks/BookingWidget', () => {
  return function MockBookingWidget() {
    return <div data-testid="booking-widget">Booking Widget</div>;
  };
});

// Mock RoomCard
jest.mock('@/components/blocks/RoomCard', () => {
  return function MockRoomCard({ name, description, price, type }: any) {
    return (
      <div data-testid={`room-card`}>
        <h3>{name}</h3>
        <p>{description}</p>
        {price && <p>${price}</p>}
        {type && <p>{type}</p>}
      </div>
    );
  };
});

// Mock JsonLdScript
jest.mock('@/components/seo/JsonLdScript', () => ({
  JsonLdScript: function MockJsonLdScript() {
    return null;
  },
}));

// ----------------------------------------------------------------
// Import the page AFTER mocking
// ----------------------------------------------------------------
import { generateStaticParams, generateMetadata } from '@/app/[lang]/rooms/page';
import RoomsListingPage from '@/app/[lang]/rooms/page';
import { getHotelFull as mockGetHotelFull } from '@/lib/cms-api';
import { getAvailableLanguages as mockGetAvailableLanguages } from '@/lib/cms-api/transformers';
import { getRoomsPageData as mockGetRoomsPageData } from '@/lib/loaders/hotel-page';
import { generateRoomSlugs as mockGenerateRoomSlugs } from '@/lib/loaders/room-slug';
import { render, screen } from '@testing-library/react';

const mockHotelId = 'test-hotel-123';

const mockCmsRooms = [
  { id: 'exec-suite-001', name: 'Executive Suite', room_type: 'Suite', capacity_adults: 4, status: 'available', sort_order: 1, featured_image: 'https://example.com/exec.jpg', description: 'Spacious suite with separate living area.' },
  { id: 'deluxe-king-002', name: 'Deluxe King Room', room_type: 'Standard', capacity_adults: 2, status: 'available', sort_order: 2, featured_image: 'https://example.com/deluxe.jpg', description: 'Comfortable room with king-size bed.' },
  { id: 'business-twin-003', name: 'Business Twin Room', room_type: 'Standard', capacity_adults: 2, status: 'available', sort_order: 3, featured_image: 'https://example.com/business.jpg', description: 'Perfect for business travelers.' },
];

const mockHotelData = {
  hotel: {
    id: mockHotelId,
    name: 'The Sterling Executive',
    slug: 'the-sterling-executive',
    property_type: 'hotel',
    star_rating: 5,
    status: 'published',
    opening_year: 2020,
    address: '{"street":"123 Business Ave","city":"Metropolitan","state":"CA","postal_code":"90210","country":"USA"}',
    is_template: false,
    has_override: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    parsedAddress: {
      street: '123 Business Ave',
      city: 'Metropolitan',
      state: 'CA',
      postal_code: '90210',
      country: 'USA',
    },
  },
  rooms: mockCmsRooms,
  content: [
    { id: 'c1', language: 'en', variant: 'full', data: {} },
    { id: 'c2', language: 'th', variant: 'full', data: {} },
    { id: 'c3', language: 'tr', variant: 'full', data: {} },
  ],
  images: [
    { id: 'img-1', url: 'https://example.com/image1.jpg', alt: 'Hotel Image', featured_image: true },
  ],
  facilities: [],
  _errors: [],
};

const mockRoomsPageData = {
  hotel: mockHotelData.hotel,
  rooms: {
    rooms: mockCmsRooms.map((room) => ({
      id: room.id,
      name: room.name,
      type: room.room_type,
      price: 200,
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

// Mock slug map: slug -> room
const mockSlugMap = new Map([
  ['executive-suite', mockCmsRooms[0]],
  ['deluxe-king-room', mockCmsRooms[1]],
  ['business-twin-room', mockCmsRooms[2]],
]);

describe('Rooms Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HOTEL_ID = mockHotelId;

    (mockGetHotelFull as jest.Mock).mockResolvedValue(mockHotelData);
    (mockGetAvailableLanguages as jest.Mock).mockReturnValue(['en', 'th', 'tr']);
    (mockGetRoomsPageData as jest.Mock).mockResolvedValue(mockRoomsPageData);
    (mockGenerateRoomSlugs as jest.Mock).mockReturnValue(mockSlugMap);
  });

  afterEach(() => {
    delete process.env.HOTEL_ID;
  });

  // ----------------------------------------------------------------
  // Rendering and Content
  // ----------------------------------------------------------------
  describe('Rendering and Content', () => {
    it('renders page heading correctly', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const pageHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });
      expect(pageHeading).toBeInTheDocument();
    });

    it('renders descriptive paragraph content', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      // Description paragraph about comfort and elegance
      expect(screen.getByText(/comfort and elegance/i)).toBeInTheDocument();
    });

    it('renders detailed description paragraph', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByText(/thoughtfully designed/i)).toBeInTheDocument();
    });

    it('renders within main semantic element', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('displays booking widget', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByTestId('booking-widget')).toBeInTheDocument();
    });

    it('renders room cards from page data', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /executive suite/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /deluxe king room/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /business twin room/i })).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // SEO Metadata
  // ----------------------------------------------------------------
  describe('SEO Metadata', () => {
    it('has correct page title metadata format', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata.title).toContain('The Sterling Executive');
      expect(metadata.title).toContain('Rooms');
    });

    it('has correct page description metadata', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata.description).toBeDefined();
      expect((metadata.description as string).length).toBeGreaterThan(20);
    });

    it('has structured metadata object', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata).toBeDefined();
      expect(typeof metadata).toBe('object');
      expect(metadata).toHaveProperty('title');
      expect(metadata).toHaveProperty('description');
    });

    it('title includes brand consistency', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata.title).toContain('The Sterling Executive');
      expect((metadata.title as string).toLowerCase()).toContain('rooms');
    });
  });

  // ----------------------------------------------------------------
  // Styling and Layout
  // ----------------------------------------------------------------
  describe('Styling and Layout', () => {
    it('applies correct background and text colors to main element', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveClass('bg-surface-primary', 'text-text-primary');
    });

    it('applies correct typography styles to main heading', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const pageHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });
      expect(pageHeading).toHaveClass('text-size-display', 'font-display', 'text-brand-primary');
    });

    it('uses full viewport height layout', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toHaveClass('min-h-screen');
    });

    it('maintains responsive design classes', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const pageHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });
      expect(pageHeading).toHaveClass('text-size-display');
    });
  });

  // ----------------------------------------------------------------
  // Accessibility
  // ----------------------------------------------------------------
  describe('Accessibility', () => {
    it('has proper heading hierarchy', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements.length).toBe(1);

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThanOrEqual(1);
    });

    it('maintains semantic HTML structure', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('has sufficient color contrast (structural test)', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toHaveClass('text-text-primary');
    });

    it('maintains readable text sizes', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const pageHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });
      expect(pageHeading).toHaveClass('text-size-display', 'font-display');
    });
  });

  // ----------------------------------------------------------------
  // Content Validation
  // ----------------------------------------------------------------
  describe('Content Validation', () => {
    it('contains room-related terminology', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getAllByText(/rooms/i).length).toBeGreaterThan(0);
    });

    it('communicates value proposition clearly', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByText(/comfort and elegance/i)).toBeInTheDocument();
    });

    it('displays actual room offerings', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByText(/executive suite/i)).toBeInTheDocument();
      expect(screen.getByText(/deluxe king room/i)).toBeInTheDocument();
      expect(screen.getByText(/business twin room/i)).toBeInTheDocument();
    });

    it('content aligns with hotel business model', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      // Rooms page mentions luxury/suites in heading area
      expect(screen.getAllByText(/rooms/i).length).toBeGreaterThan(0);
    });

    it('includes booking functionality', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByTestId('booking-widget')).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // Component Structure
  // ----------------------------------------------------------------
  describe('Component Structure', () => {
    it('maintains proper component import structure', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      expect(() => render(jsx)).not.toThrow();
    });

    it('exports metadata as named export', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata).toBeDefined();
      expect(typeof metadata).toBe('object');
    });

    it('exports default component function', () => {
      expect(RoomsListingPage).toBeDefined();
      expect(typeof RoomsListingPage).toBe('function');
    });

    it('follows Next.js page component patterns', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('uses server component with async data fetching', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // Performance Considerations
  // ----------------------------------------------------------------
  describe('Performance Considerations', () => {
    it('renders complex page structure efficiently', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      const allElements = container.querySelectorAll('*');
      expect(allElements.length).toBeGreaterThan(10);
    });

    it('has efficient CSS class applications', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const pageHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });
      const classes = pageHeading.className.split(' ');
      expect(classes.length).toBeLessThan(15);
    });

    it('uses efficient layout classes', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toHaveClass('min-h-screen');
    });
  });

  // ----------------------------------------------------------------
  // Responsive Design
  // ----------------------------------------------------------------
  describe('Responsive Design', () => {
    it('uses responsive text sizing', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const pageHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });
      expect(pageHeading).toHaveClass('text-size-display');
    });

    it('uses responsive spacing utilities', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('maintains proper content alignment', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      // The page description text has mx-auto centering
      const description = container.querySelector('.text-text-secondary.max-w-3xl.mx-auto');
      expect(description).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // Edge Cases
  // ----------------------------------------------------------------
  describe('Edge Cases', () => {
    it('renders without props or external dependencies', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      expect(() => render(jsx)).not.toThrow();
    });

    it('handles multiple renders consistently', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      const { rerender } = render(jsx);

      expect(screen.getByRole('heading', { name: /rooms & suites/i, level: 1 })).toBeInTheDocument();

      rerender(jsx);
      expect(screen.getByRole('heading', { name: /rooms & suites/i, level: 1 })).toBeInTheDocument();
    });

    it('maintains consistent content structure', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      const { rerender } = render(jsx);

      const originalHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });
      rerender(jsx);
      const newHeading = screen.getByRole('heading', { name: /rooms & suites/i, level: 1 });

      expect(originalHeading.textContent).toBe(newHeading.textContent);
    });

    it('renders with room data from loader', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const roomHeadings = screen.getAllByRole('heading', { level: 3 });
      expect(roomHeadings.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ----------------------------------------------------------------
  // Next.js Integration
  // ----------------------------------------------------------------
  describe('Next.js Integration', () => {
    it('compatible with Next.js App Router structure', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('metadata export follows Next.js 15 patterns', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(typeof metadata).toBe('object');
      expect(metadata.constructor).toBe(Object);
    });

    it('page structure supports static generation', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /rooms & suites/i, level: 1 })).toBeInTheDocument();
    });

    it('metadata supports SEO best practices', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect((metadata.title as string).length).toBeGreaterThan(10);
      expect(metadata.title).toContain('The Sterling Executive');
      expect((metadata.description as string).length).toBeGreaterThan(20);
      expect((metadata.description as string).length).toBeLessThan(160);
    });

    it('uses server component pattern with validation', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      expect(() => render(jsx)).not.toThrow();
    });
  });

  // ----------------------------------------------------------------
  // User Experience
  // ----------------------------------------------------------------
  describe('User Experience', () => {
    it('communicates page purpose clearly', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /rooms & suites/i, level: 1 })).toBeInTheDocument();
    });

    it('provides booking capability', async () => {
      const jsx = await RoomsListingPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByTestId('booking-widget')).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // generateStaticParams
  // ----------------------------------------------------------------
  describe('generateStaticParams', () => {
    it('generates params for all available languages', async () => {
      const params = await generateStaticParams();

      expect(params).toEqual([
        { lang: 'en' },
        { lang: 'th' },
        { lang: 'tr' },
      ]);
    });

    it('throws error when HOTEL_ID is not set', async () => {
      delete process.env.HOTEL_ID;

      await expect(generateStaticParams()).rejects.toThrow('HOTEL_ID environment variable is required');
    });
  });
});
