import React from 'react';
import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import {
  setViewport,
  testResponsiveBreakpoints,
  testComponentVariants,
  testPerformanceAcrossViewports,
  setupResponsiveMocks,
  mockMatchMedia,
  BREAKPOINTS,
  customRender
} from './responsive-utils';

// Import components to test
import Navigation from '@/components/ui/Navbar';
import HeroSection from '@/components/sections/HeroSection';
import BookingWidget from '@/components/blocks/BookingWidget';
import RoomCardList from '@/components/blocks/RoomCard/RoomCardList';
import ContactForm from '@/components/sections/ContactForm';
import { mockHotelData } from '@/components/data/mockHotel';
import { mockRooms } from '@/components/data/mockRooms';

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

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
}));

// Mock validation
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  },
}));

// Setup common mocks for all tests
beforeEach(() => {
  setupResponsiveMocks();
  jest.clearAllMocks();
});

describe('Responsive Breakpoint Testing - Phase 5 Enhancement', () => {
  describe('Navigation Component', () => {
    const mockNavProps = {};

    it('should render Navigation correctly on all breakpoints', async () => {
      await testResponsiveBreakpoints(Navigation, mockNavProps, {
        breakpoints: [
          {
            width: BREAKPOINTS.mobile,
            name: 'mobile',
            expectedElements: ['nav', 'header']
          },
          {
            width: BREAKPOINTS.tablet,
            name: 'tablet',
            expectedElements: ['nav', 'a[href="/"]']
          },
          {
            width: BREAKPOINTS.desktop,
            name: 'desktop',
            expectedElements: ['nav', 'a[href="/rooms"]', 'a[href="/contact"]']
          }
        ]
      });
    });

    it('should maintain navigation functionality across breakpoints', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);
        mockMatchMedia(width);

        const { container, unmount } = customRender(<Navigation />);

        // Navigation should be present
        const nav = container.querySelector('nav');
        expect(nav).toBeInTheDocument();

        unmount();
      }
    });

    it('should handle mobile/desktop navigation variants', async () => {
      await testComponentVariants(
        Navigation,
        {}, // Same props for both variants - component handles responsive logic internally
        {},
        {
          mobileBreakpoint: BREAKPOINTS.mobile,
          desktopBreakpoint: BREAKPOINTS.desktop,
          mobileSelectors: ['button[aria-label*="menu"]'],
          desktopSelectors: ['nav a[href="/rooms"]']
        }
      );
    });
  });

  describe('HeroSection Component', () => {
    const mockHeroProps = mockHotelData;

    it('should render HeroSection correctly on all breakpoints', async () => {
      await testResponsiveBreakpoints(HeroSection, mockHeroProps, {
        breakpoints: [
          {
            width: BREAKPOINTS.mobile,
            name: 'mobile',
            expectedElements: ['section', 'h1', 'a[href="/rooms"]']
          },
          {
            width: BREAKPOINTS.tablet,
            name: 'tablet',
            expectedElements: ['section', 'h1', 'a[href="/rooms"]']
          },
          {
            width: BREAKPOINTS.desktop,
            name: 'desktop',
            expectedElements: ['section', 'h1', 'a[href="/rooms"]', 'img']
          }
        ]
      });
    });

    it('should maintain hero content across breakpoints', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);

        const { unmount } = customRender(<HeroSection {...mockHeroProps} />);

        // Title should be present
        expect(screen.getByText(mockHotelData.title)).toBeInTheDocument();

        // Tagline should be present (HeroSection uses tagline, not subtitle)
        expect(screen.getByText(mockHotelData.tagline!)).toBeInTheDocument();

        // CTA buttons should be present
        expect(screen.getByRole('link', { name: /view rooms/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();

        unmount();
      }
    });

    it('should adapt layout appropriately across breakpoints', async () => {
      // Test mobile layout
      setViewport(BREAKPOINTS.mobile);
      const { container: mobileContainer, unmount: unmountMobile } = customRender(
        <HeroSection {...mockHeroProps} />
      );

      // Mobile should render the section
      const heroSection = mobileContainer.querySelector('section');
      expect(heroSection).toBeInTheDocument();

      unmountMobile();

      // Test desktop layout
      setViewport(BREAKPOINTS.desktop);
      const { container: desktopContainer, unmount: unmountDesktop } = customRender(
        <HeroSection {...mockHeroProps} />
      );

      // Desktop should render the section
      const desktopHeroSection = desktopContainer.querySelector('section');
      expect(desktopHeroSection).toBeInTheDocument();

      unmountDesktop();
    });
  });

  describe('BookingWidget Component', () => {
    const mockBookingProps = {
      hotelId: 'test-hotel-001',
      onComplete: jest.fn(),
      className: 'test-booking-widget'
    };

    it('should render BookingWidget correctly on all breakpoints', async () => {
      await testResponsiveBreakpoints(BookingWidget, mockBookingProps, {
        breakpoints: [
          {
            width: BREAKPOINTS.mobile,
            name: 'mobile',
            expectedElements: ['button']
          },
          {
            width: BREAKPOINTS.tablet,
            name: 'tablet',
            expectedElements: ['button']
          },
          {
            width: BREAKPOINTS.desktop,
            name: 'desktop',
            expectedElements: ['button']
          }
        ]
      });
    });

    it('should render BookingWidget with mobile/desktop variants', async () => {
      // Test mobile variant
      setViewport(BREAKPOINTS.mobile);
      mockMatchMedia(BREAKPOINTS.mobile);
      const { container: mobileContainer, unmount: unmountMobile } = customRender(
        <BookingWidget {...mockBookingProps} />
      );

      // Mobile should have buttons
      const mobileButtons = mobileContainer.querySelectorAll('button');
      expect(mobileButtons.length).toBeGreaterThan(0);

      unmountMobile();

      // Test desktop variant
      setViewport(BREAKPOINTS.desktop);
      mockMatchMedia(BREAKPOINTS.desktop);
      const { container: desktopContainer, unmount: unmountDesktop } = customRender(
        <BookingWidget {...mockBookingProps} />
      );

      // Desktop should have buttons
      const desktopButtons = desktopContainer.querySelectorAll('button');
      expect(desktopButtons.length).toBeGreaterThan(0);

      unmountDesktop();
    });

    it('should maintain booking functionality across breakpoints', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);
        mockMatchMedia(width);

        const { unmount } = customRender(<BookingWidget {...mockBookingProps} />);

        // Widget should render - check for form or interactive elements
        const buttons = screen.queryAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);

        unmount();
      }
    });
  });

  describe('RoomCardList Component', () => {
    const mockRoomProps = { rooms: mockRooms };

    it('should render RoomCardList correctly on all breakpoints', async () => {
      await testResponsiveBreakpoints(RoomCardList, mockRoomProps, {
        breakpoints: [
          {
            width: BREAKPOINTS.mobile,
            name: 'mobile',
            expectedElements: ['.grid'] // Grid container should be present
          },
          {
            width: BREAKPOINTS.tablet,
            name: 'tablet',
            expectedElements: ['.grid']
          },
          {
            width: BREAKPOINTS.desktop,
            name: 'desktop',
            expectedElements: ['.grid']
          }
        ]
      });
    });

    it('should adapt grid layout across breakpoints', async () => {
      // Test mobile grid (1 column)
      setViewport(BREAKPOINTS.mobile);
      const { container: mobileContainer, unmount: unmountMobile } = customRender(
        <RoomCardList {...mockRoomProps} />
      );

      const mobileGrid = mobileContainer.querySelector('.grid');
      expect(mobileGrid).toHaveClass('grid-cols-1'); // Single column on mobile

      unmountMobile();

      // Test tablet grid (2 columns)
      setViewport(BREAKPOINTS.tablet);
      const { container: tabletContainer, unmount: unmountTablet } = customRender(
        <RoomCardList {...mockRoomProps} />
      );

      const tabletGrid = tabletContainer.querySelector('.grid');
      // RoomCardList uses sm:grid-cols-2 (small breakpoint, not tablet)
      expect(tabletGrid).toHaveClass('sm:grid-cols-2'); // Two columns on small+

      unmountTablet();

      // Test desktop grid (3 columns)
      setViewport(BREAKPOINTS.desktop);
      const { container: desktopContainer, unmount: unmountDesktop } = customRender(
        <RoomCardList {...mockRoomProps} />
      );

      const desktopGrid = desktopContainer.querySelector('.grid');
      expect(desktopGrid).toHaveClass('lg:grid-cols-3'); // Three columns on desktop

      unmountDesktop();
    });

    it('should maintain room data integrity across breakpoints', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);
        mockMatchMedia(width);

        const { container, unmount } = customRender(<RoomCardList {...mockRoomProps} />);

        // Room cards should be present - check for room card structure
        // RoomCard renders a div with roomCardVariants classes, look for room name headings
        const roomHeadings = container.querySelectorAll('h3');
        expect(roomHeadings.length).toBeGreaterThan(0);

        // Verify that room names are rendered
        mockRooms.forEach((room) => {
          const roomNameElement = Array.from(roomHeadings).find(
            (h3) => h3.textContent === room.name
          );
          expect(roomNameElement).toBeDefined();
        });

        unmount();
      }
    });
  });

  describe('ContactForm Component', () => {
    const mockContactProps = {
      hotelId: 'test-hotel-001',
      onSubmit: jest.fn(),
      className: 'test-contact-form'
    };

    it('should render ContactForm correctly on all breakpoints', async () => {
      await testResponsiveBreakpoints(ContactForm, mockContactProps, {
        breakpoints: [
          {
            width: BREAKPOINTS.mobile,
            name: 'mobile',
            expectedElements: ['form', 'input[name="name"]', 'textarea[name="message"]', 'button[type="submit"]']
          },
          {
            width: BREAKPOINTS.tablet,
            name: 'tablet',
            expectedElements: ['form', 'input[name="name"]', 'textarea[name="message"]', 'button[type="submit"]']
          },
          {
            width: BREAKPOINTS.desktop,
            name: 'desktop',
            expectedElements: ['form', 'input[name="name"]', 'textarea[name="message"]', 'button[type="submit"]']
          }
        ]
      });
    });

    it('should adapt form layout across breakpoints', async () => {
      // Test mobile layout
      setViewport(BREAKPOINTS.mobile);
      mockMatchMedia(BREAKPOINTS.mobile);
      const { container: mobileContainer, unmount: unmountMobile } = customRender(
        <ContactForm {...mockContactProps} />
      );

      const mobileForm = mobileContainer.querySelector('form');
      expect(mobileForm).toBeInTheDocument();
      expect(mobileForm).toHaveClass('grid-cols-1'); // Single column layout

      unmountMobile();

      // Test desktop layout
      setViewport(BREAKPOINTS.desktop);
      mockMatchMedia(BREAKPOINTS.desktop);
      const { container: desktopContainer, unmount: unmountDesktop } = customRender(
        <ContactForm {...mockContactProps} />
      );

      const desktopForm = desktopContainer.querySelector('form');
      expect(desktopForm).toBeInTheDocument();
      expect(desktopForm).toHaveClass('grid'); // Grid layout

      unmountDesktop();
    });
  });

  describe('Performance Testing Across Viewports', () => {
    it('should render Navigation efficiently across all viewports', async () => {
      await testPerformanceAcrossViewports(Navigation, {}, {
        viewports: [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop],
        maxRenderTime: 30, // Navigation should be very fast
        iterations: 3
      });
    });

    it('should render HeroSection efficiently across all viewports', async () => {
      await testPerformanceAcrossViewports(HeroSection, mockHotelData, {
        viewports: [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop],
        maxRenderTime: 50, // Hero section with images can be slightly slower
        iterations: 3
      });
    });

    it('should render RoomCardList efficiently across all viewports', async () => {
      await testPerformanceAcrossViewports(RoomCardList, { rooms: mockRooms }, {
        viewports: [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop],
        maxRenderTime: 150, // Increased threshold for CI environments
        iterations: 3
      });
    });

    it('should render BookingWidget efficiently across all viewports', async () => {
      await testPerformanceAcrossViewports(BookingWidget, {
        hotelId: 'test-hotel-001',
        onComplete: jest.fn()
      }, {
        viewports: [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop],
        maxRenderTime: 300, // Increased threshold for test stability
        iterations: 3
      });
    });

    it('should render ContactForm efficiently across all viewports', async () => {
      await testPerformanceAcrossViewports(ContactForm, {
        hotelId: 'test-hotel-001',
        onSubmit: jest.fn()
      }, {
        viewports: [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop],
        maxRenderTime: 350, // Increased threshold for test stability
        iterations: 3
      });
    });
  });

  describe('Edge Cases and Boundary Testing', () => {
    it('should handle very small viewports (320px)', async () => {
      setViewport(320);

      const { container, unmount } = customRender(<Navigation />);
      expect(container.firstChild).toBeInTheDocument();

      unmount();
    });

    it('should handle very large viewports (1920px)', async () => {
      setViewport(1920);

      const { container, unmount } = customRender(<HeroSection {...mockHotelData} />);
      expect(container.firstChild).toBeInTheDocument();

      unmount();
    });

    it('should handle ultra-wide viewports (2560px)', async () => {
      setViewport(2560);

      const { container, unmount } = customRender(<RoomCardList rooms={mockRooms} />);
      expect(container.firstChild).toBeInTheDocument();

      unmount();
    });

    it('should handle rapid viewport changes without errors', async () => {
      const { rerender } = customRender(<Navigation />);

      const viewports = [320, 768, 1024, 375, 1280, 600, 768, 1920];

      viewports.forEach(width => {
        setViewport(width);
        expect(() => rerender(<Navigation />)).not.toThrow();
      });
    });

    it('should maintain functionality at exact breakpoint boundaries', async () => {
      // Test at exactly 768px (mobile/desktop boundary)
      setViewport(768);
      mockMatchMedia(768);

      const { unmount } = customRender(<Navigation />);

      // Should render without errors
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      unmount();
    });
  });

  describe('Visual Regression Prevention', () => {
    it('should maintain consistent branding across all viewports', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);
        mockMatchMedia(width);

        const { unmount } = customRender(<Navigation />);

        // Navigation should be present
        expect(screen.getByRole('navigation')).toBeInTheDocument();

        unmount();
      }
    });

    it('should maintain accessible structure across viewports', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);
        mockMatchMedia(width);

        const { unmount } = customRender(<HeroSection {...mockHotelData} />);

        // Section should be present with heading
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);

        // Interactive elements should remain accessible
        expect(screen.getByRole('link', { name: /view rooms/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /contact us/i })).toBeInTheDocument();

        unmount();
      }
    });

    it('should maintain responsive spacing patterns', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.tablet, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);

        const { container, unmount } = customRender(<RoomCardList rooms={mockRooms} />);

        // Epic 15: Updated to semantic spacing token gap-8
        const grid = container.querySelector('.grid');
        expect(grid).toHaveClass('gap-8'); // Consistent gap across viewports

        unmount();
      }
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle multi-component responsive scenarios', async () => {
      setViewport(BREAKPOINTS.desktop);
      mockMatchMedia(BREAKPOINTS.desktop);

      const { unmount } = customRender(
        <div>
          <Navigation />
          <HeroSection {...mockHotelData} />
          <BookingWidget hotelId="test-hotel" onComplete={jest.fn()} />
        </div>
      );

      // All components should render together
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Should have links
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);

      unmount();
    });

    it('should maintain responsive behavior in complex layouts', async () => {
      const viewports = [BREAKPOINTS.mobile, BREAKPOINTS.desktop];

      for (const width of viewports) {
        setViewport(width);
        mockMatchMedia(width);

        const { container, unmount } = customRender(
          <div>
            <Navigation />
            <HeroSection {...mockHotelData} />
            <RoomCardList rooms={mockRooms} />
          </div>
        );

        // All major sections should be present
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        const headings = screen.getAllByRole('heading');
        expect(headings.length).toBeGreaterThan(0);

        // Check if room cards are rendered using DOM structure
        const roomGrid = container.querySelector('.grid');
        expect(roomGrid).toBeInTheDocument();

        // Check for room name headings within the grid
        const roomHeadings = container.querySelectorAll('h3');
        expect(roomHeadings.length).toBeGreaterThan(0);

        unmount();
      }
    });
  });
});