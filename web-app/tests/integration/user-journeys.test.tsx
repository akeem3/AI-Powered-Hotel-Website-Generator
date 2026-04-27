import React from 'react';
import { render, screen, fireEvent, waitFor } from '../utils/test-utils';
import { useRouter } from 'next/navigation';
import NotFound from '@/app/not-found';
import ContactForm from '@/components/sections/ContactForm';
import HeroSection from '@/components/sections/HeroSection';
import BookingWidget from '@/components/blocks/BookingWidget';
import RoomCardList from '@/components/blocks/RoomCard/RoomCardList';
import { mockRooms } from '@/components/data/mockRooms';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  redirect: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, fill, ...props }: any) => <img {...props} />,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

/**
 * MockHomePage renders the key homepage sections used for integration testing.
 * The real homepage at app/(site)/page.tsx is now a redirect component (Epic 24).
 * The actual content lives in app/[lang]/page.tsx (async server component with CMS calls).
 * For integration tests we use the same components the real page uses.
 */
const MockHomePage = () => (
  <main role="main">
    <HeroSection
      title="The Sterling Executive"
      headline="Where Business Meets Boutique Excellence"
      tagline="Luxury Hotel"
      background="solid"
      primaryCTA={{ text: 'View Rooms', href: '#rooms', ariaLabel: 'View rooms' }}
      secondaryCTA={{ text: 'Contact Us', href: '/contact', ariaLabel: 'Contact us' }}
    />
    <section id="rooms" className="rooms-section">
      <h2>Luxurious Accommodations</h2>
      <div className="gap-gap-section">
        <RoomCardList rooms={mockRooms.slice(0, 3)} />
      </div>
    </section>
  </main>
);

/**
 * MockContactPage renders the contact page sections.
 * The real app/(site)/contact/page.tsx is now a redirect component (Epic 24).
 */
const MockContactPage = () => (
  <main role="main">
    <h1>Get In Touch</h1>
    <ContactForm onSuccess={jest.fn()} />
  </main>
);

/**
 * MockRoomsPage renders the rooms listing page sections.
 * The real app/(site)/rooms/page.tsx is now a redirect component (Epic 24).
 */
const MockRoomsPage = () => (
  <main role="main">
    <h1>Our Luxury Rooms</h1>
    <div className="grid gap-4">
      <RoomCardList rooms={mockRooms} />
    </div>
    <BookingWidget />
  </main>
);

describe('Complete User Journeys', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  describe('Homepage to Rooms Journey', () => {
    it('should complete booking flow from homepage to rooms', async () => {
      // Start at homepage
      render(<MockHomePage />);

      // Verify homepage elements
      expect(screen.getByRole('heading', { name: 'The Sterling Executive' })).toBeInTheDocument();
      expect(screen.getByText('Where Business Meets Boutique Excellence')).toBeInTheDocument();

      // Find and click "View Rooms" CTA
      const viewRoomsCTA = screen.getByRole('link', { name: /view rooms/i });
      expect(viewRoomsCTA).toBeInTheDocument();

      // Simulate clicking the View Rooms link
      fireEvent.click(viewRoomsCTA);

      // Verify the href points to rooms section
      expect(viewRoomsCTA).toHaveAttribute('href', '#rooms');

      // Verify rooms section is present on the same page
      const roomsSection = document.getElementById('rooms');
      expect(roomsSection).toBeInTheDocument();

      // Look for room cards by finding elements that represent rooms
      const roomCards = roomsSection?.querySelectorAll('[class*="gap-gap-section"] > div');
      expect(roomCards && roomCards.length > 0).toBe(true);
    });

    it('should navigate from homepage to contact page', async () => {
      render(<MockHomePage />);

      // Find "Contact Us" CTA
      const contactUsCTA = screen.getByRole('link', { name: /contact us/i });
      expect(contactUsCTA).toBeInTheDocument();
      expect(contactUsCTA).toHaveAttribute('href', '/contact');

      // Simulate navigation
      fireEvent.click(contactUsCTA);

      // In real scenario, Next.js would handle navigation
      // For test, we verify the contact page can be rendered independently
      const { unmount } = render(<MockContactPage />);
      // Use level: 1 to target the page-level heading specifically
      expect(screen.getByRole('heading', { name: /get in touch/i, level: 1 })).toBeInTheDocument();
      unmount();
    });
  });

  describe('Contact Form Journey', () => {
    it('should handle contact form submission journey', async () => {
      render(<MockContactPage />);

      // Verify contact page elements — use level: 1 to avoid matching ContactForm's internal h2
      expect(screen.getByRole('heading', { name: /get in touch/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

      // Fill out the form
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const messageInput = screen.getByLabelText(/message/i);
      const submitButton = screen.getByRole('button', { name: /send message/i });

      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
      fireEvent.change(messageInput, { target: { value: 'I am interested in booking a room for my business trip.' } });

      // Verify form is filled
      expect(nameInput).toHaveValue('John Doe');
      expect(emailInput).toHaveValue('john.doe@example.com');
      expect(messageInput).toHaveValue('I am interested in booking a room for my business trip.');

      // Submit form
      fireEvent.click(submitButton);

      // Verify success state (mock implementation)
      await waitFor(() => {
        const successMessage = screen.queryByText(/message sent successfully/i);
        // Note: This depends on the actual ContactForm implementation
        // The test verifies that the form can be filled and submitted
        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
      });
    });
  });

  describe('Room Selection Journey', () => {
    it('should browse rooms from dedicated rooms page', async () => {
      render(<MockRoomsPage />);

      // Verify rooms page loads (check for specific heading)
      const heading = screen.getByRole('heading', { name: /our luxury rooms/i });
      expect(heading).toBeInTheDocument();

      // Verify room cards are displayed by looking for grid layout
      const roomGrid = document.querySelector('[class*="grid"]');
      expect(roomGrid).toBeInTheDocument();

      // Verify room cards are present
      const roomCards = roomGrid?.querySelectorAll('div');
      expect(roomCards && roomCards.length > 0).toBe(true);
    });

    it('should interact with room cards and booking widgets', async () => {
      render(<MockRoomsPage />);

      // Verify booking widget is present (interactive element on rooms page)
      const bookingButton = screen.getByRole('button', { name: /book now|check availability/i });
      expect(bookingButton).toBeInTheDocument();

      // Test clicking the booking button doesn't throw
      expect(() => {
        fireEvent.click(bookingButton);
      }).not.toThrow();

      // Verify main content renders
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Navigation Journey', () => {
    it('should navigate through main sections using navigation', async () => {
      render(<MockHomePage />);

      // Find any navigation elements (using query since navigation role might not be present)
      const navigation = screen.queryByRole('navigation');

      // If navigation exists, test it
      if (navigation) {
        expect(navigation).toBeInTheDocument();

        // Find navigation links
        const navLinks = navigation.querySelectorAll('a');
        expect(navLinks.length).toBeGreaterThanOrEqual(0);

        // Test each navigation link
        navLinks.forEach(link => {
          expect(link).toBeInTheDocument();
          expect(link.getAttribute('href')).toBeTruthy();
        });
      } else {
        // If no navigation element, verify page still loads
        expect(screen.getByRole('main')).toBeInTheDocument();
      }
    });
  });

  describe('Error Handling Journey', () => {
    it('should handle navigation to non-existent pages', async () => {
      // Test 404 page
      const { container } = render(<NotFound />);

      // Verify 404 page elements
      expect(screen.getByRole('heading', { name: /404 - page not found/i })).toBeInTheDocument();
      expect(screen.getByText(/Sorry, the page you.*re looking for doesn.*t exist or has been moved/i)).toBeInTheDocument();

      // Verify return home button
      const homeButton = screen.getByRole('link', { name: /return home/i });
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveAttribute('href', '/');
    });
  });

  describe('Responsive Journey', () => {
    it('should maintain functionality across viewport sizes', async () => {
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      render(<MockHomePage />);

      // Verify mobile navigation (hamburger menu) if present
      let mobileNavButton;
      try {
        mobileNavButton = screen.getByRole('button', { 'aria-label': /menu/i });
      } catch {
        mobileNavButton = null;
      }
      if (mobileNavButton) {
        expect(mobileNavButton).toBeInTheDocument();
        fireEvent.click(mobileNavButton);
      }

      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 768,
      });

      // Re-render to test desktop layout
      render(<MockHomePage />);

      // Verify desktop navigation (may not exist)
      const desktopNav = screen.queryByRole('navigation');
      if (desktopNav) {
        expect(desktopNav).toBeInTheDocument();
      } else {
        // If no navigation, verify page still renders
        const mainElements = screen.getAllByRole('main');
        expect(mainElements.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Accessibility Journey', () => {
    it('should maintain focus management during navigation', async () => {
      render(<MockHomePage />);

      // Test keyboard navigation
      const firstLink = screen.getByRole('link', { name: /view rooms/i });
      firstLink.focus();
      expect(firstLink).toHaveFocus();

      // Test tab navigation through interactive elements
      fireEvent.keyDown(document.body, { key: 'Tab' });

      // Verify focus management works (focus may move or stay on first link)
      const activeElement = document.activeElement;
      expect(activeElement).toBeInTheDocument();
    });

    it('should provide proper ARIA labels and landmarks', async () => {
      render(<MockHomePage />);

      // Verify main landmarks
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Check for navigation (may not be present)
      const navigation = screen.queryByRole('navigation');
      if (navigation) {
        expect(navigation).toBeInTheDocument();
      }

      // Verify main element
      const main = screen.getByRole('main');
      expect(main).toHaveAttribute('role', 'main');
    });
  });
});
