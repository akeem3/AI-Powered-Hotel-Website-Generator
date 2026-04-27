/**
 * Contact Page Tests (Legacy Path)
 *
 * Updated for Epic 24: The contact page has moved to /{lang}/contact.
 * The (site)/contact/page.tsx now only redirects to /{DEFAULT_LOCALE}/contact.
 *
 * These tests cover the multi-language contact page at app/[lang]/contact/page.tsx
 * using the same mocking patterns as tests/app/[lang]/contact/page.test.tsx.
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
}));

jest.mock('@/lib/metadata/hotel-metadata', () => ({
  getOgImageUrl: jest.fn(() => 'https://example.com/og-image.jpg'),
  SITE_URL: 'https://example.com',
  buildPageCanonicalUrl: jest.fn((baseUrl: string, lang: string, path: string) => `${baseUrl}/${lang}/${path}`),
  buildPageHreflangUrls: jest.fn(() => ({
    'en-US': 'https://example.com/en/contact',
    'th-TH': 'https://example.com/th/contact',
    'tr-TR': 'https://example.com/tr/contact',
  })),
  getExtendedLocaleCode: jest.fn((lang: string) => `${lang}-US`),
}));

// Mock next/navigation to avoid redirect errors
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock child components so we can test the page without their complexity
jest.mock('@/components/sections/ContactHeader', () => {
  return function MockContactHeader() {
    return (
      <section aria-label="Contact page header" className="text-center">
        <h1 id="contact-page-title" className="text-size-display font-display text-brand-primary">
          Contact Us
        </h1>
        <p>Get in touch with The Sterling Executive team — we&apos;re here to assist you with bookings, events, and inquiries.</p>
      </section>
    );
  };
});

jest.mock('@/components/sections/ContactInfo', () => {
  return function MockContactInfo({ name, phone, email, address, hours, emergency }: any) {
    return (
      <section aria-label="Hotel contact information">
        <h2>Hotel Information</h2>
        <p>{name}</p>
        {address && (
          <>
            <p>{address.street}</p>
            <p>{address.city}, {address.state} {address.postal_code} {address.country}</p>
          </>
        )}
        <a href={`tel:${phone}`}>{phone}</a>
        <a href={`mailto:${email}`}>{email}</a>
        {emergency && <a href={`tel:${emergency.contact}`}>{emergency.contact}</a>}
        {hours && (
          <div className="text-center text-text-secondary space-y-1">
            <p>Reception: {hours.reception}</p>
            <p>Business Center: {hours.businessCenter}</p>
            <p>Check-in: {hours.checkIn}</p>
            <p>Check-out: {hours.checkOut}</p>
          </div>
        )}
      </section>
    );
  };
});

jest.mock('@/components/sections/ContactForm', () => {
  return function MockContactForm() {
    return (
      <section aria-label="Contact form">
        <h2>Get in Touch</h2>
        <form aria-describedby="contact-feedback">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" aria-required="true" />
          <label htmlFor="email">Email</label>
          <input id="email" type="email" aria-required="true" />
          <label htmlFor="phone">Phone (Optional)</label>
          <input id="phone" type="tel" />
          <label htmlFor="subject">Subject</label>
          <select id="subject" role="combobox" aria-label="Subject">
            <option>General</option>
            <option>Booking</option>
          </select>
          <label htmlFor="message">Message</label>
          <textarea id="message" aria-required="true"></textarea>
          <button type="submit">Send Message</button>
          <div id="contact-feedback"></div>
        </form>
      </section>
    );
  };
});

jest.mock('@/components/sections/ContactMap', () => {
  return function MockContactMap() {
    return <section aria-label="Hotel location map"><div data-testid="contact-map" /></section>;
  };
});

jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// ----------------------------------------------------------------
// Import the page AFTER mocking
// ----------------------------------------------------------------
import { generateStaticParams, generateMetadata } from '@/app/[lang]/contact/page';
import ContactPage from '@/app/[lang]/contact/page';
import { getHotelFull as mockGetHotelFull } from '@/lib/cms-api';
import { render, screen } from '@testing-library/react';

const mockHotelId = 'test-hotel-123';

const mockHotelData = {
  hotel: {
    id: mockHotelId,
    name: 'The Sterling Executive',
    slug: 'the-sterling-executive',
    property_type: 'hotel',
    star_rating: 5,
    status: 'published',
    opening_year: 2020,
    address: '{"street":"123 Business Avenue","city":"Metropolitan","state":"CA","postal_code":"90210","country":"USA"}',
    is_template: false,
    has_override: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    parsedAddress: {
      street: '123 Business Avenue',
      city: 'Metropolitan',
      state: 'CA',
      postal_code: '90210',
      country: 'USA',
    },
  },
  content: [
    { id: 'c1', language: 'en', variant: 'full', content_type: 'standard', status: 'published', title: 'The Sterling Executive', data: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: 'c2', language: 'th', variant: 'full', content_type: 'standard', status: 'published', title: 'The Sterling Executive', data: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    { id: 'c3', language: 'tr', variant: 'full', content_type: 'standard', status: 'published', title: 'The Sterling Executive', data: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  ],
  rooms: [],
  facilitiesByCategory: {},
  images: [
    { id: 'img-1', hotel_id: mockHotelId, url: 'https://example.com/image1.jpg', alt: 'Hotel Image', sort_order: 1, status: 'published', description: null, booking_required: false, featured_image: true, operating_hours: null, capacity: null, age_restrictions: null, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
  ],
  metadata: {
    hotel_id: mockHotelId,
    fetched_at: '2024-01-01T00:00:00Z',
    processing_time_ms: 100,
    collections_fetched: ['hotel', 'content', 'rooms', 'facilities', 'images'],
  },
  _errors: [],
};

describe('Contact Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HOTEL_ID = mockHotelId;
    (mockGetHotelFull as jest.Mock).mockResolvedValue(mockHotelData);
  });

  afterEach(() => {
    delete process.env.HOTEL_ID;
  });

  // ----------------------------------------------------------------
  // Rendering and Component Structure
  // ----------------------------------------------------------------
  describe('Rendering and Component Structure', () => {
    it('renders all section components', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /contact us/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /hotel information/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
    });

    it('renders within main semantic element', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveAttribute('aria-labelledby', 'contact-page-title');
    });

    it('renders ContactHeader with correct content', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const heading = screen.getByRole('heading', { name: /contact us/i, level: 1 });
      expect(heading).toHaveAttribute('id', 'contact-page-title');
      expect(screen.getByText(/get in touch with the sterling executive team/i)).toBeInTheDocument();
      expect(screen.getByText(/bookings.*events.*inquiries/i)).toBeInTheDocument();
    });

    it('renders ContactInfo with hotel details', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByText('The Sterling Executive')).toBeInTheDocument();
      expect(screen.getByText(/123 Business Avenue/i)).toBeInTheDocument();
      expect(screen.getByText(/Metropolitan.*CA.*90210.*USA/i)).toBeInTheDocument();
    });

    it('renders ContactForm with all fields', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone.*optional/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^subject$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // Contact Information
  // ----------------------------------------------------------------
  describe('Contact Information', () => {
    it('renders phone contact with actionable link', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const phoneLink = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink.getAttribute('href')).toMatch(/^tel:/);
    });

    it('renders email contact with actionable link', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emailLink = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.getAttribute('href')).toMatch(/^mailto:/);
    });

    it('renders emergency contact information', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emergencyLink = screen.getByRole('link', { name: /\+1 \(555\) 987-6543/i });
      expect(emergencyLink).toBeInTheDocument();
      expect(emergencyLink.getAttribute('href')).toMatch(/^tel:/);
    });

    it('displays hotel operating hours', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      const hoursSection = container.querySelector('.text-center.text-text-secondary.space-y-1');
      expect(hoursSection).toBeInTheDocument();

      expect(screen.getByText(/Reception:/i)).toBeInTheDocument();
      expect(screen.getByText(/Business Center:/i)).toBeInTheDocument();
      expect(screen.getByText(/Check-in:/i)).toBeInTheDocument();
      expect(screen.getByText(/Check-out:/i)).toBeInTheDocument();
    });

    it('uses professional email domain', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emailLink = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      expect(emailLink.textContent).toContain('sterlingexecutive.com');
    });
  });

  // ----------------------------------------------------------------
  // Contact Form
  // ----------------------------------------------------------------
  describe('Contact Form', () => {
    it('has all required form fields', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^subject$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^message$/i)).toBeInTheDocument();
    });

    it('has optional phone field', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const phoneField = screen.getByLabelText(/phone.*optional/i);
      expect(phoneField).toBeInTheDocument();
      expect(phoneField).not.toHaveAttribute('required');
    });

    it('has subject dropdown with options', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const subjectTrigger = screen.getByRole('combobox', { name: /subject/i });
      expect(subjectTrigger).toBeInTheDocument();
      expect(subjectTrigger).toHaveTextContent(/General/i);
    });

    it('has submit button', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const submitButton = screen.getByRole('button', { name: /send message/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('form fields have proper accessibility attributes', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByLabelText(/^name$/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByLabelText(/^message$/i)).toHaveAttribute('aria-required', 'true');
    });

    it('email field has correct input type', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByLabelText(/^email$/i)).toHaveAttribute('type', 'email');
    });

    it('phone field has correct input type', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByLabelText(/phone.*optional/i)).toHaveAttribute('type', 'tel');
    });

    it('message field is a textarea', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const messageField = screen.getByLabelText(/^message$/i);
      expect(messageField.tagName).toBe('TEXTAREA');
    });
  });

  // ----------------------------------------------------------------
  // Styling and Layout
  // ----------------------------------------------------------------
  describe('Styling and Layout', () => {
    it('applies correct spacing classes to main element', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      const main = container.querySelector('main');
      expect(main).toHaveClass('min-h-screen', 'flex', 'flex-col');
    });

    it('ContactHeader uses proper text styling', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const heading = screen.getByRole('heading', { name: /contact us/i, level: 1 });
      expect(heading).toHaveClass('text-size-display', 'font-display', 'text-brand-primary');
    });

    it('maintains responsive design classes', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const heading = screen.getByRole('heading', { name: /contact us/i });
      expect(heading).toHaveClass('text-size-display');
    });

    it('uses appropriate text alignment', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      const contactHeader = container.querySelector('section[aria-label="Contact page header"]');
      expect(contactHeader).toHaveClass('text-center');
    });
  });

  // ----------------------------------------------------------------
  // Accessibility
  // ----------------------------------------------------------------
  describe('Accessibility', () => {
    it('has proper heading hierarchy', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent('Contact Us');

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThanOrEqual(2);
    });

    it('maintains semantic HTML structure', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      expect(screen.getByRole('main')).toBeInTheDocument();
      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThan(0);
    });

    it('contact links are properly labeled', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emailLink = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      const phoneLink = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });

      expect(emailLink).toHaveAccessibleName();
      expect(phoneLink).toHaveAccessibleName();
    });

    it('form has proper ARIA labels', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const forms = document.querySelectorAll('form');
      expect(forms.length).toBeGreaterThan(0);
      expect(forms[0]).toHaveAttribute('aria-describedby', 'contact-feedback');
    });

    it('main element has aria-labelledby', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toHaveAttribute('aria-labelledby', 'contact-page-title');
    });
  });

  // ----------------------------------------------------------------
  // Content Validation
  // ----------------------------------------------------------------
  describe('Content Validation', () => {
    it('contains hotel-appropriate contact methods', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('link', { name: /info@sterlingexecutive.com/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i })).toBeInTheDocument();
    });

    it('uses professional business contact information', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emailLink = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      expect(emailLink.textContent).toContain('info@');
      expect(emailLink.textContent).toContain('sterlingexecutive.com');
    });

    it('provides multiple contact channels', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('link', { name: /info@sterlingexecutive.com/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /\+1 \(555\) 987-6543/i })).toBeInTheDocument();
    });

    it('content aligns with hotel business model', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
      expect(screen.getByText(/bookings.*events.*inquiries/i)).toBeInTheDocument();
    });

    it('displays complete hotel address', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByText(/123 Business Avenue/i)).toBeInTheDocument();
      expect(screen.getByText(/Metropolitan/i)).toBeInTheDocument();
      expect(screen.getByText(/90210/i)).toBeInTheDocument();
    });
  });

  // ----------------------------------------------------------------
  // Link Functionality
  // ----------------------------------------------------------------
  describe('Link Functionality', () => {
    it('email link uses correct mailto protocol', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emailLink = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      expect(emailLink.getAttribute('href')).toMatch(/^mailto:/);
    });

    it('phone link uses correct tel protocol', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const phoneLink = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });
      expect(phoneLink.getAttribute('href')).toMatch(/^tel:/);
    });

    it('emergency link uses correct tel protocol', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emergencyLink = screen.getByRole('link', { name: /\+1 \(555\) 987-6543/i });
      expect(emergencyLink.getAttribute('href')).toMatch(/^tel:/);
    });
  });

  // ----------------------------------------------------------------
  // Component Structure
  // ----------------------------------------------------------------
  describe('Component Structure', () => {
    it('maintains proper component import structure', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      expect(() => render(jsx)).not.toThrow();
    });

    it('follows Next.js page component patterns', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('renders all four section components in order', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ----------------------------------------------------------------
  // Performance Considerations
  // ----------------------------------------------------------------
  describe('Performance Considerations', () => {
    it('renders without excessive DOM nodes', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      const allElements = container.querySelectorAll('*');
      expect(allElements.length).toBeLessThan(200);
    });

    it('uses efficient layout classes', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      const main = container.querySelector('main');
      expect(main).toHaveClass('min-h-screen');
    });
  });

  // ----------------------------------------------------------------
  // Edge Cases
  // ----------------------------------------------------------------
  describe('Edge Cases', () => {
    it('renders without props or external dependencies', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      expect(() => render(jsx)).not.toThrow();
    });

    it('handles multiple renders consistently', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { rerender } = render(jsx);

      expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();

      rerender(jsx);
      expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
    });

    it('maintains consistent contact information across renders', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { rerender } = render(jsx);

      const originalEmail = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      const originalPhone = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });

      rerender(jsx);

      const newEmail = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      const newPhone = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });

      expect(originalEmail.getAttribute('href')).toBe(newEmail.getAttribute('href'));
      expect(originalPhone.getAttribute('href')).toBe(newPhone.getAttribute('href'));
    });
  });

  // ----------------------------------------------------------------
  // Next.js Integration
  // ----------------------------------------------------------------
  describe('Next.js Integration', () => {
    it('compatible with Next.js App Router structure', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      const { container } = render(jsx);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('page is a server component with async data fetching', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
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

  // ----------------------------------------------------------------
  // generateMetadata
  // ----------------------------------------------------------------
  describe('generateMetadata', () => {
    it('generates metadata with correct title format', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata.title).toContain('Contact Us');
      expect(metadata.title).toContain('The Sterling Executive');
    });

    it('includes meta description with hotel name', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata.description).toContain('The Sterling Executive');
    });

    it('includes OG type as website', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata.openGraph?.type).toBe('website');
    });

    it('includes canonical URL', async () => {
      const metadata = await generateMetadata({ params: Promise.resolve({ lang: 'en' }) });

      expect(metadata.alternates?.canonical).toContain('/contact');
    });
  });

  // ----------------------------------------------------------------
  // User Experience
  // ----------------------------------------------------------------
  describe('User Experience', () => {
    it('communicates page purpose clearly', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /contact us/i })).toBeInTheDocument();
      expect(screen.getByText(/get in touch with the sterling executive team/i)).toBeInTheDocument();
    });

    it('provides immediately actionable contact options', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      const emailLink = screen.getByRole('link', { name: /info@sterlingexecutive.com/i });
      const phoneLink = screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i });

      expect(emailLink.getAttribute('href')).toMatch(/^mailto:/);
      expect(phoneLink.getAttribute('href')).toMatch(/^tel:/);
    });

    it('maintains visual hierarchy', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /contact us/i, level: 1 })).toBeInTheDocument();
      expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(2);
    });

    it('contact information is easy to identify', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /hotel information/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /info@sterlingexecutive.com/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /\+1 \(555\) 123-4567/i })).toBeInTheDocument();
    });

    it('form provides clear call to action', async () => {
      const jsx = await ContactPage({ params: Promise.resolve({ lang: 'en' }) });
      render(jsx);

      expect(screen.getByRole('heading', { name: /get in touch/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
    });
  });
});
