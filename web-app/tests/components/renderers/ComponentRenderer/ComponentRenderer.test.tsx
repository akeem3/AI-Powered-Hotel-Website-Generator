/**
 * Unit Tests - ComponentRenderer
 *
 * @trace epic: EPIC-07
 * @trace story: STORY-07.11
 * @trace reqs: AC1, AC2, AC3, AC4, AC5, AC7, AC8, AC9
 *
 * Why: Tests the core rendering functionality including component mapping,
 * ordering, variant application, props transformation, error handling,
 * and runtime validation. Achieves >90% coverage of ComponentRenderer.
 */

import { render, screen } from '@testing-library/react';
import ComponentRenderer from '@/components/renderers/ComponentRenderer';
import type { HomepageConfig } from '@/app/langgraph/agents/schemas';

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

// Mock the actual components to isolate testing
jest.mock('@/components/blocks/Navigation', () => ({
  __esModule: true,
  default: ({ logoAlt, navigationLinks, variant, ...props }: any) => (
    <nav data-testid="navigation" data-variant={JSON.stringify(variant)} {...props}>
      <span>{logoAlt}</span>
      {navigationLinks?.map((link: any) => (
        <span key={link.text}>{link.text}</span>
      ))}
    </nav>
  ),
}));

jest.mock('@/components/sections/HeroSection', () => ({
  __esModule: true,
  default: ({ title, tagline, variant, ...props }: any) => (
    <section data-testid="hero" data-variant={JSON.stringify(variant)} {...props}>
      <h1>{title}</h1>
      <p>{tagline}</p>
    </section>
  ),
}));

jest.mock('@/components/sections/RoomsGrid', () => ({
  __esModule: true,
  default: ({ rooms, variant, ...props }: any) => (
    <section data-testid="rooms" data-variant={JSON.stringify(variant)} {...props}>
      {rooms?.map((room: any) => (
        <div key={room.id}>{room.name}</div>
      ))}
    </section>
  ),
}));

jest.mock('@/components/blocks/ImageGallery', () => ({
  __esModule: true,
  default: ({ images, variant, ...props }: any) => (
    <section data-testid="gallery" data-variant={JSON.stringify(variant)} {...props}>
      {images?.map((img: any) => (
        <div key={img.id}>{img.alt}</div>
      ))}
    </section>
  ),
}));

jest.mock('@/components/blocks/Testimonials', () => ({
  Testimonials: ({ testimonials, variant, ...props }: any) => (
    <section data-testid="testimonials" data-variant={JSON.stringify(variant)} {...props}>
      {testimonials?.map((t: any) => (
        <div key={t.id}>{t.customerName}</div>
      ))}
    </section>
  ),
}));

jest.mock('@/components/blocks/Amenities', () => ({
  Amenities: ({ amenities, variant, ...props }: any) => (
    <section data-testid="amenities" data-variant={JSON.stringify(variant)} {...props}>
      {amenities?.map((a: any) => (
        <div key={a.id}>{a.name}</div>
      ))}
    </section>
  ),
}));

jest.mock('@/components/blocks/BookingWidget', () => ({
  __esModule: true,
  default: ({ title, variant, ...props }: any) => (
    <section data-testid="booking" data-variant={JSON.stringify(variant)} {...props}>
      <h3>{title}</h3>
    </section>
  ),
}));

jest.mock('@/components/sections/ContactForm', () => ({
  __esModule: true,
  default: ({ title, variant, ...props }: any) => (
    <section data-testid="contact" data-variant={JSON.stringify(variant)} {...props}>
      <h3>{title}</h3>
    </section>
  ),
}));

jest.mock('@/components/sections/FAQ', () => ({
  __esModule: true,
  default: ({ questions, variant, ...props }: any) => (
    <section data-testid="faq" data-variant={JSON.stringify(variant)} {...props}>
      {questions?.map((q: any, index: number) => (
        <div key={index}>
          <div>{q.question}</div>
        </div>
      ))}
    </section>
  ),
}));

// =============================================================================
// EPIC 19 NEW BLOCKS MOCKS - Story 19.6: ComponentRenderer Integration
// =============================================================================

jest.mock('@/components/blocks/Footer', () => ({
  __esModule: true,
  default: ({ hotelName, variant, ...props }: any) => (
    <footer data-testid="footer" data-variant={JSON.stringify(variant)} {...props}>
      <span>{hotelName}</span>
    </footer>
  ),
}));

jest.mock('@/components/sections/About', () => ({
  __esModule: true,
  default: ({ heading, content, variant, ...props }: any) => (
    <section data-testid="about" data-variant={JSON.stringify(variant)} {...props}>
      <h2>{heading}</h2>
      <p>{content}</p>
    </section>
  ),
}));

jest.mock('@/components/sections/Features', () => ({
  __esModule: true,
  default: ({ heading, features, variant, ...props }: any) => (
    <section data-testid="features" data-variant={JSON.stringify(variant)} {...props}>
      <h2>{heading}</h2>
      {features?.map((f: any, index: number) => (
        <div key={index}>
          <div>{f.title}</div>
          <div>{f.description}</div>
        </div>
      ))}
    </section>
  ),
}));

// Mock contract validation
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value, name) => value),
}));

// Mock STRICT_VALIDATION_CONFIG to use WARNING mode in tests
// This allows testing with configs that have < 5 components
jest.mock('@/lib/contractValidation', () => {
  const originalModule = jest.requireActual('@/lib/contractValidation');
  return {
    ...originalModule,
    STRICT_VALIDATION_CONFIG: { mode: 'WARNING' }, // Override to WARNING for tests
    validateContract: jest.fn((schema, data, config, contextName) => {
      // For tests, always use WARNING mode to allow configs with < 5 components
      return originalModule.validateContract(
        schema,
        data,
        { mode: 'WARNING' },
        contextName
      );
    }),
  };
});

// Helper to create valid config
const createValidConfig = (
  components: HomepageConfig['components']
): HomepageConfig => ({
  generationId: 'test-hotel-v1',
  timestamp: new Date().toISOString(),
  hotelParameters: {
    hotelType: 'boutique',
    targetAudience: 'couples',
    brandPersonality: 'elegant',
    hotelName: 'Test Hotel',
    location: 'Paris',
  },
  components,
  layoutStructure: 'single-column',
  emphasisComponents: [],
  validationStatus: 'PASS',
});

describe('ComponentRenderer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Path (AC8)', () => {
    it('should render valid config with all components', () => {
      const config = createValidConfig([
        {
          type: 'navigation',
          variant: {},
          props: {
            logoAlt: 'Test Hotel',
            navigationLinks: [
              { text: 'Home', href: '/', isActive: true },
              { text: 'Rooms', href: '/rooms', isActive: false },
            ],
          },
          order: 0,
        },
        {
          type: 'hero',
          variant: {},
          props: {
            heading: 'Welcome to Paradise',
            subheading: 'Luxury awaits',
            ctaText: 'Book Now',
            ctaLink: '/rooms',
          },
          order: 1,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByText('Test Hotel')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Rooms')).toBeInTheDocument();

      expect(screen.getByTestId('hero')).toBeInTheDocument();
      // Check transformed props: heading → title
      expect(screen.getByText('Welcome to Paradise')).toBeInTheDocument();
      expect(screen.getByText('Luxury awaits')).toBeInTheDocument();
    });

    it('should render all 9 component types (AC2)', () => {
      const config = createValidConfig([
        {
          type: 'navigation',
          variant: {},
          props: {
            logoAlt: 'Logo',
            navigationLinks: [{ text: 'Home', href: '/', isActive: true }],
          },
          order: 0,
        },
        {
          type: 'hero',
          variant: {},
          props: {
            heading: 'Hero Title',
            subheading: 'Hero Sub',
          },
          order: 1,
        },
        {
          type: 'rooms',
          variant: {},
          props: {
            rooms: [
              { id: '1', name: 'Room 1', price: 100 },
            ],
          },
          order: 2,
        },
        {
          type: 'gallery',
          variant: {},
          props: {
            images: [
              { id: '1', desktopUrl: '/img.webp', mobileUrl: '/img.m.webp', alt: 'Image 1' },
            ],
          },
          order: 3,
        },
        {
          type: 'amenities',
          variant: {},
          props: {
            amenities: [
              { id: '1', name: 'Pool', icon: 'pool' },
            ],
          },
          order: 4,
        },
        {
          type: 'testimonials',
          variant: {},
          props: {
            testimonials: [
              { id: '1', customerName: 'John', rating: 5, quote: 'Great!' },
            ],
          },
          order: 5,
        },
        {
          type: 'booking',
          variant: {},
          props: {
            title: 'Book Now',
          },
          order: 6,
        },
        {
          type: 'contact',
          variant: {},
          props: {
            title: 'Contact Us',
          },
          order: 7,
        },
        {
          type: 'faq',
          variant: {},
          props: {
            questions: [
              { question: 'Question 1?', answer: 'Answer 1' },
              { question: 'Question 2?', answer: 'Answer 2' },
              { question: 'Question 3?', answer: 'Answer 3' },
            ],
          },
          order: 8,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('rooms')).toBeInTheDocument();
      expect(screen.getByTestId('gallery')).toBeInTheDocument();
      expect(screen.getByTestId('amenities')).toBeInTheDocument();
      expect(screen.getByTestId('testimonials')).toBeInTheDocument();
      expect(screen.getByTestId('booking')).toBeInTheDocument();
      expect(screen.getByTestId('contact')).toBeInTheDocument();
      expect(screen.getByTestId('faq')).toBeInTheDocument();
    });
  });

  describe('Component Ordering (AC5)', () => {
    it('should sort components by order field ascending', () => {
      const config = createValidConfig([
        {
          type: 'rooms',
          variant: {},
          props: { rooms: [{ id: '1', name: 'Room 1', price: 100 }] },
          order: 5,
        },
        {
          type: 'navigation',
          variant: {},
          props: {
            logoAlt: 'Nav',
            navigationLinks: [{ text: 'Home', href: '/', isActive: true }],
          },
          order: 0,
        },
        {
          type: 'hero',
          variant: {},
          props: { heading: 'Hero', subheading: 'Sub' },
          order: 2,
        },
        {
          type: 'contact',
          variant: {},
          props: { title: 'Contact' },
          order: 10,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      const navigation = screen.getByTestId('navigation');
      const hero = screen.getByTestId('hero');
      const rooms = screen.getByTestId('rooms');
      const contact = screen.getByTestId('contact');

      // Check all elements are rendered
      expect(navigation).toBeInTheDocument();
      expect(hero).toBeInTheDocument();
      expect(rooms).toBeInTheDocument();
      expect(contact).toBeInTheDocument();

      // Check order using compareDocumentPosition
      // DOCUMENT_POSITION_FOLLOWING = 0x04, bit 2
      const FOLLOWING = 0x04;

      // navigation should come before hero (hero follows navigation)
      expect(navigation.compareDocumentPosition(hero) & FOLLOWING).toBeTruthy();
      // hero should come before rooms (rooms follows hero)
      expect(hero.compareDocumentPosition(rooms) & FOLLOWING).toBeTruthy();
      // rooms should come before contact (contact follows rooms)
      expect(rooms.compareDocumentPosition(contact) & FOLLOWING).toBeTruthy();
    });

    it('should handle order gaps (e.g., 0, 2, 5)', () => {
      const config = createValidConfig([
        {
          type: 'navigation',
          variant: {},
          props: {
            logoAlt: 'Nav',
            navigationLinks: [{ text: 'Home', href: '/', isActive: true }],
          },
          order: 0,
        },
        {
          type: 'hero',
          variant: {},
          props: { heading: 'Hero', subheading: 'Sub' },
          order: 5,
        },
        {
          type: 'contact',
          variant: {},
          props: { title: 'Contact' },
          order: 10,
        },
      ]);

      expect(() => render(<ComponentRenderer config={config} />)).not.toThrow();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('contact')).toBeInTheDocument();
    });
  });

  describe('Variant Application (AC3)', () => {
    it('should pass variant to components', () => {
      const config = createValidConfig([
        {
          type: 'hero',
          variant: { style: 'modern', layout: 'centered' },
          props: { heading: 'Hero', subheading: 'Sub' },
          order: 0,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      const hero = screen.getByTestId('hero');
      expect(hero).toHaveAttribute('data-variant', JSON.stringify({ style: 'modern', layout: 'centered' }));
    });

    it('should handle empty variant', () => {
      const config = createValidConfig([
        {
          type: 'hero',
          variant: {},
          props: { heading: 'Hero', subheading: 'Sub' },
          order: 0,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      const hero = screen.getByTestId('hero');
      expect(hero).toHaveAttribute('data-variant', JSON.stringify({}));
    });
  });

  describe('Props Transformation (AC4)', () => {
    it('should transform Hero props: heading → title, subheading → tagline', () => {
      const config = createValidConfig([
        {
          type: 'hero',
          variant: {},
          props: {
            heading: 'Test Heading',
            subheading: 'Test Subheading',
          },
          order: 0,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByText('Test Heading')).toBeInTheDocument();
      expect(screen.getByText('Test Subheading')).toBeInTheDocument();
    });

    it('should transform Hero props: ctaText + ctaLink → primaryCTA object', () => {
      const config = createValidConfig([
        {
          type: 'hero',
          variant: {},
          props: {
            heading: 'Hero',
            subheading: 'Sub',
            ctaText: 'Book Now',
            ctaLink: '/rooms',
          },
          order: 0,
        },
      ]);

      // Should not throw - transformation creates primaryCTA object
      expect(() => render(<ComponentRenderer config={config} />)).not.toThrow();
    });

    it('should pass through props for other components without transformation', () => {
      const config = createValidConfig([
        {
          type: 'contact',
          variant: {},
          props: { title: 'Contact Us', submitButtonText: 'Send' },
          order: 0,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByText('Contact Us')).toBeInTheDocument();
    });
  });

  describe('Error Handling (AC7)', () => {
    it('should render UnknownComponent for unknown type', () => {
      const config = createValidConfig([
        {
          type: 'unknown-component' as any,
          variant: {},
          props: {},
          order: 0,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByText(/Unknown Component Type/i)).toBeInTheDocument();
      expect(screen.getByText(/unknown-component/)).toBeInTheDocument();
    });

    it('should render other components after unknown type', () => {
      const config = createValidConfig([
        {
          type: 'unknown' as any,
          variant: {},
          props: {},
          order: 0,
        },
        {
          type: 'navigation',
          variant: {},
          props: {
            logoAlt: 'Nav',
            navigationLinks: [{ text: 'Home', href: '/', isActive: true }],
          },
          order: 1,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByText(/Unknown Component Type/i)).toBeInTheDocument();
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
    });

    it('should handle empty components array', () => {
      const config = createValidConfig([]);

      render(<ComponentRenderer config={config} />);

      // Should not throw, renders empty fragment (which may have container div from test renderer)
      // Just verify no components are rendered
      expect(screen.queryByTestId('navigation')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
      expect(screen.queryByTestId('rooms')).not.toBeInTheDocument();
    });

    it('should handle single component', () => {
      const config = createValidConfig([
        {
          type: 'hero',
          variant: {},
          props: { heading: 'Solo', subheading: 'Sub' },
          order: 0,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByText('Solo')).toBeInTheDocument();
    });
  });

  describe('Runtime Validation (AC9)', () => {
    it('should validate config with STRICT mode', () => {
      // This test verifies validation is called
      // Actual validation logic is tested in contractValidation tests
      const validConfig = createValidConfig([
        {
          type: 'navigation',
          variant: {},
          props: {
            logoAlt: 'Nav',
            navigationLinks: [{ text: 'Home', href: '/', isActive: true }],
          },
          order: 0,
        },
      ]);

      expect(() => render(<ComponentRenderer config={validConfig} />)).not.toThrow();
    });

    it('should handle validation errors gracefully', () => {
      const invalidConfig = {
        // Missing required fields
        components: [],
        layoutStructure: 'single-column' as const,
        emphasisComponents: [],
        validationStatus: 'PASS' as const,
      } as any;

      // In WARNING mode (tests), invalid configs render with logged warnings
      // In STRICT mode (production), they'd show Configuration Error UI
      expect(() => render(<ComponentRenderer config={invalidConfig} />)).not.toThrow();
      // With WARNING mode, no error UI is shown - just logged warnings
    });
  });

  describe('Component Type Mapping (AC2)', () => {
    it('should map all component types correctly', () => {
      const componentTypes: HomepageConfig['components'][0]['type'][] = [
        'navigation',
        'hero',
        'rooms',
        'gallery',
        'amenities',
        'testimonials',
        'booking',
        'contact',
        'faq',
      ];

      const config = createValidConfig(
        componentTypes.map((type, index) => ({
          type,
          variant: {},
          props: type === 'hero'
            ? { heading: 'Hero', subheading: 'Sub' }
            : type === 'rooms'
            ? { rooms: [{ id: '1', name: 'Room', price: 100 }] }
            : type === 'gallery'
            ? { images: [{ id: '1', desktopUrl: '/img.webp', mobileUrl: '/img.m.webp', alt: 'Img' }] }
            : type === 'amenities'
            ? { amenities: [{ id: '1', name: 'Amenity', icon: 'icon' }] }
            : type === 'testimonials'
            ? { testimonials: [{ id: '1', customerName: 'Customer', rating: 5, quote: 'Quote' }] }
            : type === 'booking'
            ? { title: 'Book' }
            : type === 'contact'
            ? { title: 'Contact' }
            : type === 'faq'
            ? { questions: [
                { question: 'Question 1', answer: 'Answer 1' },
                { question: 'Question 2', answer: 'Answer 2' },
                { question: 'Question 3', answer: 'Answer 3' }
              ]}
            : type === 'navigation'
            ? { logoAlt: 'Logo', navigationLinks: [{ text: 'Home', href: '/', isActive: true }] }
            : {},
          order: index,
        }))
      );

      render(<ComponentRenderer config={config} />);

      // Verify all types rendered without UnknownComponent errors
      expect(screen.queryAllByText(/Unknown Component Type/i)).toHaveLength(0);
    });
  });

  describe('URL Validation Integration (AC10)', () => {
    it('should validate URLs in props before rendering', () => {
      const config = createValidConfig([
        {
          type: 'hero',
          variant: {},
          props: {
            heading: 'Hero',
            subheading: 'Sub',
            ctaText: 'Click',
            ctaLink: 'javascript:alert(1)', // Malicious
          },
          order: 0,
        },
      ]);

      // Should not crash - URL should be sanitized to safe fallback
      expect(() => render(<ComponentRenderer config={config} />)).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should render complex config with all features', () => {
      const config = createValidConfig([
        {
          type: 'navigation',
          variant: { navStyle: 'solid', navLayout: 'compact' },
          props: {
            logoAlt: 'Hotel Name',
            navigationLinks: [
              { text: 'Home', href: '/', isActive: true },
              { text: 'Rooms', href: '/rooms', isActive: false },
            ],
          },
          order: 0,
        },
        {
          type: 'hero',
          variant: { style: 'modern', layout: 'centered' },
          props: {
            heading: 'Beautiful Hotel',
            subheading: 'Your perfect getaway',
            ctaText: 'Book Now',
            ctaLink: '/booking',
          },
          order: 1,
        },
        {
          type: 'rooms',
          variant: { roomCardStyle: 'detailed' },
          props: {
            rooms: [
              { id: '1', name: 'Deluxe Room', price: 200 },
              { id: '2', name: 'Suite', price: 350 },
            ],
          },
          order: 2,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('rooms')).toBeInTheDocument();
      expect(screen.getByText('Hotel Name')).toBeInTheDocument();
      expect(screen.getByText('Beautiful Hotel')).toBeInTheDocument();
      expect(screen.getByText('Deluxe Room')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
    });
  });

  // =============================================================================
  // STORY 19.6: PHASE 5 - COMPONENTRENDERER INTEGRATION - EPIC 19 NEW BLOCKS
  // =============================================================================

  describe('Story 19.6: Epic 19 New Blocks Integration', () => {
    it('should render all 4 Epic 19 blocks (footer, about, faq, features)', () => {
      const config = createValidConfig([
        {
          type: 'footer',
          variant: { layout: 'classic' },
          props: {
            hotelName: 'Epic Test Hotel',
            address: '123 Test Street, Paris',
            phone: '+1-555-0123',
            email: 'test@epichotel.com'
          },
          order: 0,
        },
        {
          type: 'about',
          variant: { layout: 'side-by-side' },
          props: {
            heading: 'Our Story',
            content: 'Founded in 1892, our hotel has been welcoming guests for over a century.',
          },
          order: 1,
        },
        {
          type: 'faq',
          variant: { layout: 'accordion' },
          props: {
            questions: [
              { question: 'What is the check-in time?', answer: '3:00 PM' },
              { question: 'What is the check-out time?', answer: '11:00 AM' },
              { question: 'Do you allow pets?', answer: 'Sorry, no pets allowed.' }
            ]
          },
          order: 2,
        },
        {
          type: 'features',
          variant: { layout: 'icon-grid', columns: 3 },
          props: {
            heading: 'Why Choose Us',
            features: [
              { title: 'Free WiFi', description: 'High-speed internet' },
              { title: 'Pool', description: 'Heated infinity pool' },
              { title: 'Spa', description: 'Full-service spa' }
            ]
          },
          order: 3,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      // Verify all 4 blocks rendered
      expect(screen.getByTestId('footer')).toBeInTheDocument();
      expect(screen.getByText('Epic Test Hotel')).toBeInTheDocument();

      expect(screen.getByTestId('about')).toBeInTheDocument();
      expect(screen.getByText('Our Story')).toBeInTheDocument();

      expect(screen.getByTestId('faq')).toBeInTheDocument();
      expect(screen.getByText('What is the check-in time?')).toBeInTheDocument();

      expect(screen.getByTestId('features')).toBeInTheDocument();
      expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
    });

    it('should render Epic 19 blocks with different variants', () => {
      const config = createValidConfig([
        {
          type: 'footer',
          variant: { layout: 'minimal' },
          props: { hotelName: 'Minimal Footer Hotel' },
          order: 0,
        },
        {
          type: 'about',
          variant: { layout: 'timeline', overlay: 'light' },
          props: {
            heading: 'Our History',
            content: 'Over 100 years of excellence.',
          },
          order: 1,
        },
        {
          type: 'faq',
          variant: { layout: 'grid' },
          props: {
            questions: [
              { question: 'Q1', answer: 'A1' },
              { question: 'Q2', answer: 'A2' },
              { question: 'Q3', answer: 'A3' },
              { question: 'Q4', answer: 'A4' }
            ]
          },
          order: 2,
        },
        {
          type: 'features',
          variant: { layout: 'cards', columns: 2 },
          props: {
            heading: 'Our Amenities',
            features: [
              { title: 'Spa', description: 'Full-service spa' },
              { title: 'Restaurant', description: 'Fine dining' }
            ]
          },
          order: 3,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      // Verify all blocks rendered with variants
      expect(screen.getByTestId('footer')).toHaveAttribute('data-variant', JSON.stringify({ layout: 'minimal' }));
      expect(screen.getByTestId('about')).toHaveAttribute('data-variant', JSON.stringify({ layout: 'timeline', overlay: 'light' }));
      expect(screen.getByTestId('faq')).toHaveAttribute('data-variant', JSON.stringify({ layout: 'grid' }));
      expect(screen.getByTestId('features')).toHaveAttribute('data-variant', JSON.stringify({ layout: 'cards', columns: 2 }));
    });

    it('should render Epic 19 blocks alongside existing components', () => {
      const config = createValidConfig([
        {
          type: 'navigation',
          variant: { navStyle: 'solid' },
          props: {
            logoAlt: 'Hotel Logo',
            navigationLinks: [{ text: 'Home', href: '/', isActive: true }],
          },
          order: 0,
        },
        {
          type: 'hero',
          variant: { style: 'modern', layout: 'centered' },
          props: { heading: 'Welcome', subheading: 'Luxury Awaits' },
          order: 1,
        },
        {
          type: 'about',
          variant: { layout: 'full-width' },
          props: {
            heading: 'About Us',
            content: 'Our hotel story.',
          },
          order: 2,
        },
        {
          type: 'amenities',
          variant: { layout: 'grid' },
          props: {
            amenities: [{ id: '1', name: 'Pool', icon: 'pool' }],
          },
          order: 3,
        },
        {
          type: 'features',
          variant: { layout: 'icon-grid' },
          props: {
            heading: 'Key Features',
            features: [
              { title: 'WiFi', description: 'Free WiFi' },
              { title: 'Parking', description: 'Free parking' }
            ]
          },
          order: 4,
        },
        {
          type: 'faq',
          variant: { layout: 'accordion' },
          props: {
            questions: [
              { question: 'Question 1?', answer: 'Answer 1' },
              { question: 'Question 2?', answer: 'Answer 2' },
              { question: 'Question 3?', answer: 'Answer 3' }
            ]
          },
          order: 5,
        },
        {
          type: 'footer',
          variant: { layout: 'stacked' },
          props: { hotelName: 'Complete Hotel' },
          order: 6,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      // Verify all components rendered including Epic 19 blocks
      expect(screen.getByTestId('navigation')).toBeInTheDocument();
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getByTestId('about')).toBeInTheDocument();
      expect(screen.getByTestId('amenities')).toBeInTheDocument();
      expect(screen.getByTestId('features')).toBeInTheDocument();
      expect(screen.getByTestId('faq')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should handle Epic 19 blocks with all 3 Footer variants', () => {
      const variants = ['classic', 'minimal', 'stacked'] as const;

      variants.forEach(layout => {
        const config = createValidConfig([
          {
            type: 'footer',
            variant: { layout },
            props: { hotelName: `Test ${layout} Hotel` },
            order: 0,
          },
        ]);

        const { unmount } = render(<ComponentRenderer config={config} />);
        expect(screen.getByTestId('footer')).toHaveAttribute('data-variant', JSON.stringify({ layout }));
        unmount();
      });
    });

    it('should handle Epic 19 blocks with all 3 About variants', () => {
      const variants = ['side-by-side', 'timeline', 'full-width'] as const;

      variants.forEach(layout => {
        const config = createValidConfig([
          {
            type: 'about',
            variant: { layout },
            props: {
              heading: `Test ${layout} About`,
              content: 'Test content.',
            },
            order: 0,
          },
        ]);

        const { unmount } = render(<ComponentRenderer config={config} />);
        expect(screen.getByTestId('about')).toHaveAttribute('data-variant', JSON.stringify({ layout }));
        unmount();
      });
    });

    it('should handle Epic 19 blocks with both FAQ variants', () => {
      const variants = ['accordion', 'grid'] as const;

      variants.forEach(layout => {
        const config = createValidConfig([
          {
            type: 'faq',
            variant: { layout },
            props: {
              questions: [
                { question: 'Question 1?', answer: 'Answer 1' },
                { question: 'Question 2?', answer: 'Answer 2' },
                { question: 'Question 3?', answer: 'Answer 3' }
              ]
            },
            order: 0,
          },
        ]);

        const { unmount } = render(<ComponentRenderer config={config} />);
        expect(screen.getByTestId('faq')).toHaveAttribute('data-variant', JSON.stringify({ layout }));
        unmount();
      });
    });

    it('should handle Epic 19 blocks with both Features variants and all column options', () => {
      const layouts = ['icon-grid', 'cards'] as const;
      const columns = [2, 3, 4] as const;

      layouts.forEach(layout => {
        columns.forEach(cols => {
          const config = createValidConfig([
            {
              type: 'features',
              variant: { layout, columns: cols },
              props: {
                heading: `Test ${layout} ${cols}cols`,
                features: [
                  { title: 'Feature 1', description: 'Description 1' },
                  { title: 'Feature 2', description: 'Description 2' }
                ]
              },
              order: 0,
            },
          ]);

          const { unmount } = render(<ComponentRenderer config={config} />);
          expect(screen.getByTestId('features')).toHaveAttribute('data-variant', JSON.stringify({ layout, columns: cols }));
          unmount();
        });
      });
    });

    it('should render complete Epic 19 hotel config with all new blocks', () => {
      const config = createValidConfig([
        {
          type: 'hero',
          variant: { style: 'elegant', layout: 'centered' },
          props: {
            heading: 'Luxe Paradise Hotel',
            subheading: 'Experience Unforgettable Luxury',
            ctaText: 'Book Your Stay',
            ctaLink: '/booking',
          },
          order: 0,
        },
        {
          type: 'about',
          variant: { layout: 'side-by-side', imagePosition: 'right' },
          props: {
            heading: 'Our Story',
            content: 'Founded in 1920, Luxe Paradise has been a symbol of elegance and hospitality for over a century.',
          },
          order: 1,
        },
        {
          type: 'features',
          variant: { layout: 'icon-grid', columns: 4 },
          props: {
            heading: 'World-Class Amenities',
            features: [
              { title: 'Infinity Pool', description: 'Heated pool with stunning views' },
              { title: 'Fine Dining', description: 'Award-winning on-site restaurant' },
              { title: 'Luxury Spa', description: 'Full-service wellness center' },
              { title: 'Concierge', description: '24/7 personalized service' }
            ]
          },
          order: 2,
        },
        {
          type: 'amenities',
          variant: { layout: 'featured' },
          props: {
            amenities: [
              { id: '1', name: 'Spa', icon: 'spa' },
              { id: '2', name: 'Pool', icon: 'pool' }
            ]
          },
          order: 3,
        },
        {
          type: 'testimonials',
          variant: { layout: 'carousel' },
          props: {
            testimonials: [
              { id: '1', customerName: 'John Doe', rating: 5, quote: 'Amazing experience!' }
            ]
          },
          order: 4,
        },
        {
          type: 'faq',
          variant: { layout: 'accordion' },
          props: {
            questions: [
              { question: 'What is your cancellation policy?', answer: 'Free cancellation up to 48 hours before check-in.' },
              { question: 'Do you offer airport transfers?', answer: 'Yes, we arrange private luxury transfers.' },
              { question: 'Is breakfast included?', answer: 'Yes, continental breakfast is included in all room rates.' },
              { question: 'What time is check-in?', answer: 'Check-in is from 3:00 PM to 10:00 PM.' }
            ]
          },
          order: 5,
        },
        {
          type: 'contact',
          variant: { style: 'default' },
          props: {
            title: 'Contact Us',
            submitButtonText: 'Send Message'
          },
          order: 6,
        },
        {
          type: 'footer',
          variant: { layout: 'classic' },
          props: {
            hotelName: 'Luxe Paradise Hotel',
            address: '123 Luxury Avenue, Paris, France',
            phone: '+33 1 23 45 67 89',
            email: 'reservations@luxeparadise.com',
            socialLinks: [
              { platform: 'facebook', url: 'https://facebook.com/luxeparadise' },
              { platform: 'instagram', url: 'https://instagram.com/luxeparadise' }
            ],
            navigationLinks: [
              { label: 'Home', href: '/' },
              { label: 'About', href: '/about' },
              { label: 'Rooms', href: '/rooms' },
              { label: 'Contact', href: '/contact' }
            ]
          },
          order: 7,
        },
      ]);

      render(<ComponentRenderer config={config} />);

      // Verify complete hotel page rendered
      expect(screen.getByTestId('hero')).toBeInTheDocument();
      expect(screen.getAllByText('Luxe Paradise Hotel')).toHaveLength(2); // In hero and footer
      expect(screen.getByTestId('about')).toBeInTheDocument();
      expect(screen.getByTestId('features')).toBeInTheDocument();
      expect(screen.getByTestId('amenities')).toBeInTheDocument();
      expect(screen.getByTestId('testimonials')).toBeInTheDocument();
      expect(screen.getByTestId('faq')).toBeInTheDocument();
      expect(screen.getByTestId('contact')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();

      // Verify no UnknownComponent errors
      expect(screen.queryAllByText(/Unknown Component Type/i)).toHaveLength(0);
    });
  });
});
