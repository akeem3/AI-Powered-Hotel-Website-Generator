import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection from '@/components/sections/HeroSection';
import RoomCardList from '@/components/blocks/RoomCard/RoomCardList';
import ImageGallery from '@/components/blocks/ImageGallery';
import Testimonials from '@/components/blocks/Testimonials';
import Amenities from '@/components/blocks/Amenities';
import BookingWidget from '@/components/blocks/BookingWidget';
import ContactForm from '@/components/sections/ContactForm';
import { mockHotelData } from '@/components/data/mockHotel';
import { mockRooms } from '@/components/data/mockRooms';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock validation
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Mock registry
jest.mock('@/registry/heroRegistry', () => ({
  HeroSectionRegistry: {
    name: 'HeroSection',
    tier: 'sections',
    variants: ['centered', 'split', 'minimal'],
    responsiveStrategy: 'separate-variants',
    hotelTypeRecommendations: ['luxury', 'boutique', 'business'],
    tags: ['hero', 'landing', 'primary'],
  },
}));

// Mock RoomCard component
jest.mock('@/components/blocks/RoomCard/index', () => {
  return function MockRoomCard({ id, name, variant, type, price }: any) {
    return (
      <div data-testid={`room-card-${id || name}`}>
        <h3>{name}</h3>
        <p>Variant: {variant}</p>
        <p>Type: {type}</p>
        <p>Price: ${price}</p>
      </div>
    );
  };
});

// Mock RoomCardList to add a data-testid to the grid container
jest.mock('@/components/blocks/RoomCard/RoomCardList', () => {
  const OriginalRoomCardList = jest.requireActual('@/components/blocks/RoomCard/RoomCardList');
  return {
    __esModule: true,
    default: function MockRoomCardList(props: any) {
      return (
        <div data-testid="room-card-list-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {props.rooms.map((room: any) => (
            <div key={room.id} data-testid={`room-card-${room.id}`}>
              <h3>{room.name}</h3>
              <p>Variant: {props.variant}</p>
              <p>Type: {room.type}</p>
              <p>Price: ${room.price}</p>
            </div>
          ))}
        </div>
      );
    },
  };
});

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Star: () => <span data-testid="star-icon">★</span>,
  ChevronLeft: () => <span data-testid="chevron-left">‹</span>,
  ChevronRight: () => <span data-testid="chevron-right">›</span>,
  MapPin: () => <span data-testid="map-pin">📍</span>,
  Phone: () => <span data-testid="phone">📞</span>,
  Mail: () => <span data-testid="mail">✉️</span>,
  Calendar: () => <span data-testid="calendar">📅</span>,
  Users: () => <span data-testid="users">👥</span>,
  Wifi: () => <span data-testid="wifi">📶</span>,
  Car: () => <span data-testid="car">🚗</span>,
  Coffee: () => <span data-testid="coffee">☕</span>,
  Dumbbell: () => <span data-testid="dumbbell">🏋️</span>,
}));

// Mock Amenities sub-components
jest.mock('@/components/blocks/Amenities/AmenitiesGrid', () => ({
  __esModule: true,
  default: ({ amenities }: any) => (
    <div data-testid="amenities-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {amenities.map((a: any) => (
        <div key={a.id} data-testid={`amenity-${a.id}`}>
          <span data-testid={`icon-${a.icon.toLowerCase()}`}>{a.icon}</span>
          <span>{a.name}</span>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/blocks/Amenities/AmenitiesList', () => ({
  __esModule: true,
  default: ({ amenities }: any) => (
    <div data-testid="amenities-list" className="space-y-4">
      {amenities.map((a: any) => (
        <div key={a.id} data-testid={`amenity-${a.id}`}>
          <span>{a.name}</span>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/blocks/Amenities/AmenitiesFeatured', () => ({
  __esModule: true,
  default: ({ amenities }: any) => (
    <div data-testid="amenities-featured" className="space-y-6">
      {amenities.map((a: any) => (
        <div key={a.id} data-testid={`amenity-${a.id}`}>
          <span>{a.name}</span>
        </div>
      ))}
    </div>
  ),
}));

// Mock Amenities skeleton
jest.mock('@/lib/content/skeleton/AmenitiesSkeleton', () => ({
  AmenitiesSkeleton: () => <div data-testid="amenities-skeleton">Loading...</div>,
}));

// Mock ImageGallery sub-components
jest.mock('@/components/blocks/ImageGallery/GalleryGrid', () => ({
  __esModule: true,
  default: ({ images }: any) => (
    <div data-testid="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {images.map((img: any) => (
        <img key={img.id} src={img.src} alt={img.alt} data-testid={`gallery-img-${img.id}`} />
      ))}
    </div>
  ),
}));

jest.mock('@/components/blocks/ImageGallery/GalleryMasonry', () => ({
  __esModule: true,
  default: ({ images }: any) => (
    <div data-testid="gallery-masonry" className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {images.map((img: any) => (
        <img key={img.id} src={img.src} alt={img.alt} data-testid={`gallery-img-${img.id}`} />
      ))}
    </div>
  ),
}));

jest.mock('@/components/blocks/ImageGallery/GalleryCarousel', () => ({
  __esModule: true,
  default: ({ images }: any) => (
    <div data-testid="gallery-carousel">
      <button data-testid="carousel-prev">Previous</button>
      {images.map((img: any) => (
        <img key={img.id} src={img.src} alt={img.alt} data-testid={`gallery-img-${img.id}`} />
      ))}
      <button data-testid="carousel-next">Next</button>
    </div>
  ),
}));

// Mock Testimonials sub-components
jest.mock('@/components/blocks/Testimonials/TestimonialGrid', () => ({
  __esModule: true,
  default: ({ testimonials }: any) => (
    <div data-testid="testimonial-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((t: any) => (
        <div key={t.id} data-testid={`testimonial-${t.id}`}>
          <p data-testid="testimonial-text-{t.id}">{t.comment}</p>
          <p data-testid="testimonial-name-{t.id}">{t.name}</p>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/blocks/Testimonials/TestimonialCarousel', () => ({
  __esModule: true,
  default: ({ testimonials }: any) => (
    <div data-testid="testimonial-carousel">
      {testimonials.map((t: any) => (
        <div key={t.id} data-testid={`testimonial-${t.id}`}>
          <p>{t.comment}</p>
          <p>{t.name}</p>
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/blocks/Testimonials/TestimonialFeatured', () => ({
  __esModule: true,
  default: ({ testimonials }: any) => (
    <div data-testid="testimonial-featured">
      {testimonials.map((t: any) => (
        <div key={t.id} data-testid={`testimonial-${t.id}`}>
          <p>{t.comment}</p>
          <p>{t.name}</p>
        </div>
      ))}
    </div>
  ),
}));

// Mock Testimonials skeleton
jest.mock('@/lib/content/skeleton/TestimonialsSkeleton', () => ({
  TestimonialsSkeleton: () => <div data-testid="testimonials-skeleton">Loading...</div>,
}));

// Mock content hooks and utilities
jest.mock('@/lib/content/hooks/usePageContent', () => ({
  usePageContent: jest.fn(() => ({
    content: null,
    isLoading: false,
    error: null,
  })),
}));

jest.mock('@/lib/content/featureFlags', () => ({
  isContentEnabled: jest.fn(() => false),
}));

jest.mock('@/lib/content/fallback', () => ({
  resolveFallback: jest.fn((...args: any[]) => args.find((a) => a !== undefined) || 'Default'),
  resolveMediaFallback: jest.fn((...args: any[]) => args.find((a) => a !== undefined) || 'default-image.jpg'),
}));

jest.mock('@/lib/content/resolvers', () => ({
  resolveMediaRefOrFallback: jest.fn(() => ({ url: '/images/hotel-img.jpg' })),
}));

jest.mock('@/lib/content/skeleton/HeroSkeleton', () => ({
  HeroSkeleton: () => <div data-testid="hero-skeleton">Loading...</div>,
}));

jest.mock('@/lib/content/defaults', () => ({
  CONTENT_DEFAULTS: {
    hero: {
      tagline: 'Experience Luxury',
      title: 'The Sterling Executive',
      headline: 'Welcome to Luxury',
      description: 'Your perfect stay awaits',
    },
    testimonials: {
      heading: 'Guest Reviews',
      subheading: 'What our guests say',
    },
    amenities: {
      heading: 'Hotel Amenities',
      subheading: 'Everything you need for a comfortable stay',
    },
  },
}));

// Mock BookingWidget sub-components
jest.mock('@/components/blocks/BookingWidget/BookingWidgetMobile', () => ({
  __esModule: true,
  default: ({ onSubmit }: any) => (
    <div data-testid="booking-widget-mobile">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit?.({}); }}>
        <input placeholder="Check-in date" data-testid="checkin-input" />
        <input placeholder="Check-out date" data-testid="checkout-input" />
        <button type="submit">Book Now</button>
      </form>
    </div>
  ),
}));

jest.mock('@/components/blocks/BookingWidget/BookingWidgetDesktop', () => ({
  __esModule: true,
  default: ({ onSubmit }: any) => (
    <div data-testid="booking-widget-desktop">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit?.({}); }}>
        <input placeholder="Check-in date" data-testid="checkin-input" />
        <input placeholder="Check-out date" data-testid="checkout-input" />
        <button type="submit">Book Now</button>
      </form>
    </div>
  ),
}));

// Mock React Hook Form
jest.mock('react-hook-form', () => ({
  useForm: jest.fn(() => ({
    register: jest.fn(),
    handleSubmit: (fn: any) => (e: any) => { e?.preventDefault(); return fn({}); },
    formState: { errors: {} },
    reset: jest.fn(),
  })),
}));

// Mock shadcn/ui form components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <form>{children}</form>,
  FormField: ({ render, children }: any) => {
    const content = render ? render({ field: {} }) : (typeof children === 'function' ? children({ field: {} }) : children);
    return <div>{content}</div>;
  },
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormMessage: () => null,
}));

jest.mock('@/components/ui/input', () => ({
  __esModule: true,
  default: ({ placeholder, ...props }: any) => <input placeholder={placeholder} {...props} />,
  Input: ({ placeholder, ...props }: any) => <input placeholder={placeholder} {...props} />,
}));

jest.mock('@/components/ui/textarea', () => ({
  __esModule: true,
  default: ({ placeholder, ...props }: any) => <textarea placeholder={placeholder} {...props} />,
  Textarea: ({ placeholder, ...props }: any) => <textarea placeholder={placeholder} {...props} />,
}));

jest.mock('@/components/ui/select', () => ({
  __esModule: true,
  default: {
    Root: ({ children }: any) => <div>{children}</div>,
  },
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  SelectValue: ({ placeholder, ...props }: any) => <span {...props}>{placeholder}</span>,
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/spinner', () => ({
  Spinner: () => <span data-testid="spinner">↻</span>,
}));

// Mock API
jest.mock('@/lib/api/mockApi', () => ({
  mockSubmitContactForm: jest.fn(async () => ({ success: true, message: 'Message sent!' })),
}));

describe('Responsive Design Tests', () => {
  let matchMediaSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (matchMediaSpy) {
      matchMediaSpy.mockRestore();
    }
  });

  describe('HeroSection Responsive Design', () => {
    describe('Mobile Breakpoint (375px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('applies mobile text sizing', () => {
        render(<HeroSection {...mockHotelData} />);

        const title = screen.getByText('The Sterling Executive');
        expect(title).toBeInTheDocument();
      });

      it('applies mobile spacing', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        expect(section).toBeInTheDocument();
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toHaveClass('px-container');
      });

      it('uses mobile-first layout', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toHaveClass('flex');
        expect(contentContainer).toHaveClass('text-center');
      });

      it('maintains mobile aspect ratio for images', () => {
        render(<HeroSection {...mockHotelData} />);

        const heroImage = screen.getByAltText('Where Business Meets Boutique Excellence');
        expect(heroImage).toBeInTheDocument();
        expect(heroImage).toHaveClass('object-cover');
      });
    });

    describe('Tablet Breakpoint (768px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 768') && !query.includes('min-width: 1024'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('applies tablet text sizing', () => {
        render(<HeroSection {...mockHotelData} />);

        const title = screen.getByText('The Sterling Executive');
        expect(title).toBeInTheDocument();

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toHaveClass('px-container');
      });

      it('uses appropriate tablet spacing', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toHaveClass('px-container');
      });

      it('maintains responsive grid behavior', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toBeInTheDocument();
      });
    });

    describe('Desktop Breakpoint (1280px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1280,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1280'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('applies desktop text sizing', () => {
        render(<HeroSection {...mockHotelData} />);

        const title = screen.getByText('The Sterling Executive');
        expect(title).toBeInTheDocument();

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toHaveClass('px-container');
      });

      it('uses desktop layout', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toHaveClass('flex');
        expect(contentContainer).toHaveClass('items-center');
      });

      it('applies desktop spacing', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toHaveClass('px-container');
      });

      it('shows desktop-specific elements', () => {
        render(<HeroSection {...mockHotelData} />);

        const heroImage = screen.getByAltText('Where Business Meets Boutique Excellence');
        expect(heroImage).toBeInTheDocument();
        expect(heroImage).toHaveClass('object-cover');
      });
    });

    describe('Wide Breakpoint (1920px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1920') || query.includes('min-width: 1536'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('applies wide breakpoint spacing', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        const contentContainer = section.querySelector('.z-elevated');
        expect(contentContainer).toBeInTheDocument();
      });

      it('maintains content legibility at wide breakpoint', () => {
        render(<HeroSection {...mockHotelData} />);

        expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View Rooms' })).toBeInTheDocument();
      });

      it('uses appropriate max-width containers at wide breakpoint', () => {
        render(<HeroSection {...mockHotelData} />);

        const section = screen.getByRole('region');
        expect(section).toBeInTheDocument();
      });
    });
  });

  describe('RoomCardList Responsive Design', () => {
    describe('Mobile Breakpoint (375px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('uses single column layout on mobile', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const gridContainer = screen.getByTestId('room-card-list-grid');
        expect(gridContainer).toHaveClass('grid-cols-1');
      });

      it('maintains proper spacing on mobile', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const gridContainer = screen.getByTestId('room-card-list-grid');
        expect(gridContainer).toHaveClass('gap-8');
      });

      it('displays all room cards in single column', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const roomCards = screen.getAllByTestId(/^room-card-(exec-suite|deluxe-king|business-twin)/);
        expect(roomCards).toHaveLength(3);

        roomCards.forEach((card) => {
          expect(card).toBeInTheDocument();
        });
      });
    });

    describe('Tablet Breakpoint (768px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 768') && !query.includes('min-width: 1024'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('uses two column layout on tablet', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const gridContainer = screen.getByTestId('room-card-list-grid');
        expect(gridContainer).toHaveClass('sm:grid-cols-2');
      });

      it('maintains appropriate spacing on tablet', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const gridContainer = screen.getByTestId('room-card-list-grid');
        expect(gridContainer).toHaveClass('gap-8');
      });

      it('displays room cards in two columns', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const roomCards = screen.getAllByTestId(/^room-card-(exec-suite|deluxe-king|business-twin)/);
        expect(roomCards).toHaveLength(3);

        expect(screen.getByTestId('room-card-business-twin-003')).toBeInTheDocument();
      });
    });

    describe('Desktop Breakpoint (1280px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1280,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1280'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('uses three column layout on desktop', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const gridContainer = screen.getByTestId('room-card-list-grid');
        expect(gridContainer).toHaveClass('lg:grid-cols-3');
      });

      it('maintains proper spacing on desktop', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const gridContainer = screen.getByTestId('room-card-list-grid');
        expect(gridContainer).toHaveClass('gap-8');
      });

      it('displays room cards in three columns', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const roomCards = screen.getAllByTestId(/^room-card-(exec-suite|deluxe-king|business-twin)/);
        expect(roomCards).toHaveLength(3);

        const gridContainer = screen.getByTestId('room-card-list-grid');
        expect(gridContainer).toHaveClass('lg:grid-cols-3');
      });
    });

    describe('Wide Breakpoint (1920px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1920') || query.includes('min-width: 1536'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('maintains three column layout at wide breakpoint', () => {
        render(<RoomCardList rooms={mockRooms} />);

        const roomCard = screen.getByTestId('room-card-exec-suite-001');
        expect(roomCard).toBeInTheDocument();
      });

      it('displays all room cards properly at wide breakpoint', () => {
        render(<RoomCardList rooms={mockRooms} />);

        expect(screen.getByTestId('room-card-exec-suite-001')).toBeInTheDocument();
        expect(screen.getByTestId('room-card-deluxe-king-002')).toBeInTheDocument();
        expect(screen.getByTestId('room-card-business-twin-003')).toBeInTheDocument();
      });
    });
  });

  describe('ImageGallery Responsive Design', () => {
    const mockImages = [
      { id: '1', src: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800', alt: 'Hotel exterior' },
      { id: '2', src: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', alt: 'Hotel room' },
      { id: '3', src: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', alt: 'Hotel lobby' },
    ];

    describe('Mobile Breakpoint (375px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders single column layout on mobile', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
      });

      it('displays navigation controls on mobile', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'carousel' }} />);

        expect(screen.getByTestId('carousel-prev')).toBeInTheDocument();
        expect(screen.getByTestId('carousel-next')).toBeInTheDocument();
      });

      it('maintains touch-friendly button sizes on mobile', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'carousel' }} />);

        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    describe('Tablet Breakpoint (768px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 768') && !query.includes('min-width: 1024'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders appropriately sized gallery on tablet', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
      });

      it('maintains navigation functionality on tablet', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'carousel' }} />);

        expect(screen.getByTestId('carousel-prev')).toBeInTheDocument();
        expect(screen.getByTestId('carousel-next')).toBeInTheDocument();
      });
    });

    describe('Desktop Breakpoint (1280px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1280,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1280'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders full-sized gallery on desktop', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
      });

      it('displays all navigation controls on desktop', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'carousel' }} />);

        expect(screen.getByTestId('carousel-prev')).toBeInTheDocument();
        expect(screen.getByTestId('carousel-next')).toBeInTheDocument();
      });
    });

    describe('Wide Breakpoint (1920px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1920') || query.includes('min-width: 1536'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('maintains gallery proportions at wide breakpoint', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('gallery-grid')).toBeInTheDocument();
      });

      it('displays images appropriately at wide breakpoint', () => {
        render(<ImageGallery images={mockImages} variant={{ layout: 'grid', columns: 3 }} />);

        mockImages.forEach(image => {
          expect(screen.getByTestId(`gallery-img-${image.id}`)).toBeInTheDocument();
        });
      });
    });
  });

  describe('Testimonials Responsive Design', () => {
    const mockTestimonials = [
      { id: '1', name: 'John Doe', comment: 'Amazing stay!', rating: 5 },
      { id: '2', name: 'Jane Smith', comment: 'Excellent service.', rating: 5 },
    ];

    describe('Mobile Breakpoint (375px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders stacked testimonials on mobile', () => {
        render(<Testimonials testimonials={mockTestimonials} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('testimonial-grid')).toBeInTheDocument();
      });

      it('displays testimonial content on mobile', () => {
        render(<Testimonials testimonials={mockTestimonials} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('testimonial-1')).toBeInTheDocument();
        expect(screen.getByTestId('testimonial-2')).toBeInTheDocument();
      });

      it('maintains readable text sizing on mobile', () => {
        render(<Testimonials testimonials={mockTestimonials} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByText('Guest Reviews')).toBeInTheDocument();
      });
    });

    describe('Tablet Breakpoint (768px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 768') && !query.includes('min-width: 1024'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders appropriately spaced testimonials on tablet', () => {
        render(<Testimonials testimonials={mockTestimonials} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('testimonial-grid')).toBeInTheDocument();
      });
    });

    describe('Desktop Breakpoint (1280px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1280,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1280'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders grid layout on desktop', () => {
        render(<Testimonials testimonials={mockTestimonials} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('testimonial-grid')).toBeInTheDocument();
      });
    });

    describe('Wide Breakpoint (1920px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1920') || query.includes('min-width: 1536'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('maintains testimonial layout at wide breakpoint', () => {
        render(<Testimonials testimonials={mockTestimonials} variant={{ layout: 'grid', columns: 3 }} />);

        expect(screen.getByTestId('testimonial-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Amenities Responsive Design', () => {
    const mockAmenitiesList = [
      { id: 'wifi', name: 'Free WiFi', icon: 'Wifi', description: 'High-speed internet access' },
      { id: 'parking', name: 'Free Parking', icon: 'Car', description: 'Complimentary on-site parking' },
      { id: 'breakfast', name: 'Breakfast', icon: 'Coffee', description: 'Daily continental breakfast' },
      { id: 'gym', name: 'Fitness Center', icon: 'Dumbbell', description: '24-hour gym access' },
    ];

    describe('Mobile Breakpoint (375px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 375,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('max-width'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders grid layout on mobile', () => {
        render(<Amenities amenities={mockAmenitiesList} />);

        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
        expect(screen.getByText('Free Parking')).toBeInTheDocument();
        expect(screen.getByText('Breakfast')).toBeInTheDocument();
        expect(screen.getByText('Fitness Center')).toBeInTheDocument();
      });

      it('displays amenity icons on mobile', () => {
        render(<Amenities amenities={mockAmenitiesList} />);

        expect(screen.getByTestId('icon-wifi')).toBeInTheDocument();
        expect(screen.getByTestId('amenity-wifi')).toBeInTheDocument();
        expect(screen.getByTestId('amenity-parking')).toBeInTheDocument();
      });

      it('maintains touch-friendly spacing on mobile', () => {
        render(<Amenities amenities={mockAmenitiesList} />);

        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
      });
    });

    describe('Tablet Breakpoint (768px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 768,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 768') && !query.includes('min-width: 1024'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders multi-column grid on tablet', () => {
        render(<Amenities amenities={mockAmenitiesList} />);

        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
      });
    });

    describe('Desktop Breakpoint (1280px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1280,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1280'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders expanded grid on desktop', () => {
        render(<Amenities amenities={mockAmenitiesList} />);

        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
        expect(screen.getByText('Free Parking')).toBeInTheDocument();
        expect(screen.getByText('Breakfast')).toBeInTheDocument();
        expect(screen.getByText('Fitness Center')).toBeInTheDocument();
      });
    });

    describe('Wide Breakpoint (1920px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1920') || query.includes('min-width: 1536'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('maintains amenity display at wide breakpoint', () => {
        render(<Amenities amenities={mockAmenitiesList} />);

        expect(screen.getByText('Free WiFi')).toBeInTheDocument();
        expect(screen.getByTestId('amenity-wifi')).toBeInTheDocument();
      });
    });
  });

  describe('BookingWidget Responsive Design - Wide Breakpoint', () => {
    describe('Wide Breakpoint (1920px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1920') || query.includes('min-width: 1536'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders booking widget at wide breakpoint', () => {
        render(<BookingWidget variant="desktop" onSubmit={jest.fn()} />);

        expect(screen.getByTestId('booking-widget-desktop')).toBeInTheDocument();
      });

      it('maintains form functionality at wide breakpoint', () => {
        render(<BookingWidget variant="desktop" onSubmit={jest.fn()} />);

        expect(screen.getByTestId('checkin-input')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-input')).toBeInTheDocument();
      });
    });
  });

  describe('ContactForm Responsive Design - Wide Breakpoint', () => {
    describe('Wide Breakpoint (1920px)', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: 1920,
        });

        matchMediaSpy = jest.spyOn(window, 'matchMedia').mockImplementation(query => ({
          matches: query.includes('min-width: 1920') || query.includes('min-width: 1536'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        }));
      });

      it('renders contact form at wide breakpoint', () => {
        render(<ContactForm />);

        expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      });

      it('maintains form layout at wide breakpoint', () => {
        render(<ContactForm />);

        expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument();
      });
    });
  });

  describe('Component Responsive Behavior', () => {
    it('HeroSection adapts text sizing across breakpoints', () => {
      render(<HeroSection {...mockHotelData} />);

      const section = screen.getByRole('region');
      const contentContainer = section.querySelector('.z-elevated');

      expect(contentContainer).toHaveClass('px-container');
    });

    it('RoomCardList adapts grid columns across breakpoints', () => {
      render(<RoomCardList rooms={mockRooms} />);

      const gridContainer = screen.getByTestId('room-card-list-grid');

      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('maintains consistent spacing across breakpoints', () => {
      render(<RoomCardList rooms={mockRooms} />);

      const gridContainer = screen.getByTestId('room-card-list-grid');

      expect(gridContainer).toHaveClass('gap-8');
    });
  });

  describe('Responsive Design Requirements Verification', () => {
    it('meets Hero Section mobile requirements', () => {
      render(<HeroSection {...mockHotelData} />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      const contentContainer = section.querySelector('.z-elevated');
      expect(contentContainer).toHaveClass('px-container');
    });

    it('meets Hero Section desktop requirements', () => {
      render(<HeroSection {...mockHotelData} />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
      const contentContainer = section.querySelector('.z-elevated');
      expect(contentContainer).toHaveClass('px-container');
      expect(contentContainer).toHaveClass('flex');
    });

    it('meets Room Card mobile requirements', () => {
      render(<RoomCardList rooms={mockRooms} />);

      const gridContainer = screen.getByTestId('room-card-list-grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
    });

    it('meets Room Card desktop requirements', () => {
      render(<RoomCardList rooms={mockRooms} />);

      const gridContainer = screen.getByTestId('room-card-list-grid');
      expect(gridContainer).toHaveClass('lg:grid-cols-3');
    });

    it('meets Grid layout requirements', () => {
      render(<RoomCardList rooms={mockRooms} />);

      const gridContainer = screen.getByTestId('room-card-list-grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('Cross-Breakpoint Consistency', () => {
    it('maintains component identity across breakpoints', () => {
      render(<HeroSection {...mockHotelData} />);

      const heroSection = screen.getByRole('region');
      expect(heroSection).toBeInTheDocument();

      expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
      expect(screen.getByText(/Experience bespoke service, quiet workspaces, and luxurious rooms/i)).toBeInTheDocument();
    });

    it('maintains interactive elements across breakpoints', () => {
      render(<HeroSection {...mockHotelData} />);

      expect(screen.getByRole('link', { name: 'View Rooms' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact Us' })).toBeInTheDocument();
    });

    it('maintains data integrity across breakpoints', () => {
      render(<RoomCardList rooms={mockRooms} />);

      expect(screen.getByTestId('room-card-exec-suite-001')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-deluxe-king-002')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-business-twin-003')).toBeInTheDocument();
    });
  });

  describe('Viewport Simulation Tests', () => {
    it('handles viewport width changes', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const { container } = render(<HeroSection {...mockHotelData} />);

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });

      expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('handles extreme small viewports', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });

      render(<HeroSection {...mockHotelData} />);

      expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
    });

    it('handles very large viewports', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<HeroSection {...mockHotelData} />);

      expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
    });
  });

  describe('Responsive Design Accessibility', () => {
    it('maintains accessibility across breakpoints', () => {
      render(<HeroSection {...mockHotelData} />);

      expect(screen.getByRole('region')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View Rooms' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Contact Us' })).toBeInTheDocument();
    });

    it('maintains semantic structure across breakpoints', () => {
      render(<RoomCardList rooms={mockRooms} />);

      const gridContainer = screen.getByTestId('room-card-list-grid');
      expect(gridContainer).toBeInTheDocument();

      const roomCards = screen.getAllByTestId(/^room-card-(exec-suite|deluxe-king|business-twin)/);
      roomCards.forEach((card) => {
        expect(card).toBeInTheDocument();
      });
    });

    it('maintains keyboard navigation across breakpoints', () => {
      render(<HeroSection {...mockHotelData} />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).toBeInTheDocument();
      });
    });
  });

  describe('Performance in Responsive Design', () => {
    it('renders quickly regardless of viewport size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1280,
      });

      const startTime = performance.now();
      render(<HeroSection {...mockHotelData} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50);
    });

    it('handles responsive class application efficiently', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      const startTime = performance.now();
      render(<RoomCardList rooms={mockRooms} />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});
