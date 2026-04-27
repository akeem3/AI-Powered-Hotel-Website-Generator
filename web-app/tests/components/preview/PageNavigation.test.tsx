/**
 * Story 25.5: PageNavigation Component Tests
 *
 * Unit tests for the PageNavigation component used in multi-page preview.
 */

import { render, screen } from '@testing-library/react';
import { PageNavigation, PageBadge } from '@/components/preview/PageNavigation';

// Mock environment variables
const ORIGINAL_ENV = process.env;

describe('Story 25.5: PageNavigation Component', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPreviewEnabled = process.env.PREVIEW_ENABLED;

  beforeEach(() => {
    jest.clearAllMocks();
    (process.env as any).NODE_ENV = 'development';
    (process.env as any).PREVIEW_ENABLED = 'true';
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    (process.env as any).PREVIEW_ENABLED = originalPreviewEnabled;
  });

  describe('Page Tabs Display', () => {
    it('should display all page types except roomDetail as clickable tabs', () => {
      const { getByText, queryByText } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      // Should display all page type tabs
      expect(getByText('Home')).toBeInTheDocument();
      expect(getByText('Rooms')).toBeInTheDocument();
      expect(getByText('Gallery')).toBeInTheDocument();
      expect(getByText('Amenities')).toBeInTheDocument();
      expect(getByText('Reviews')).toBeInTheDocument();
      expect(getByText('Contact')).toBeInTheDocument();
      expect(getByText('About')).toBeInTheDocument();
      expect(getByText('FAQ')).toBeInTheDocument();

      // Should NOT display roomDetail in main navigation
      expect(queryByText('Room Details')).not.toBeInTheDocument();
    });

    it('should highlight current page as active', () => {
      const { getByText } = render(
        <PageNavigation
          currentPage="rooms"
          configName="test-hotel"
        />
      );

      const roomsLink = getByText('Rooms').closest('a');
      expect(roomsLink).toHaveClass('bg-brand-primary');
      expect(roomsLink).toHaveClass('text-text-inverted');
    });

    it('should not highlight non-current pages', () => {
      const { getByText } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      const roomsLink = getByText('Rooms').closest('a');
      expect(roomsLink).not.toHaveClass('bg-brand-primary');
      expect(roomsLink).toHaveClass('bg-surface-primary');
    });
  });

  describe('Navigation Links', () => {
    it('should generate correct query parameter links for each page type', () => {
      const { getByText } = render(
        <PageNavigation
          currentPage="homepage"
          configName="pemberton-grand"
        />
      );

      expect(getByText('Home').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=homepage');
      expect(getByText('Rooms').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=rooms');
      expect(getByText('Gallery').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=gallery');
      expect(getByText('Amenities').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=amenities');
      expect(getByText('Reviews').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=reviews');
      expect(getByText('Contact').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=contact');
      expect(getByText('About').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=about');
      expect(getByText('FAQ').closest('a')).toHaveAttribute('href', '/preview?config=pemberton-grand&page=faq');
    });

    it('should preserve config name in links with special characters', () => {
      const { getByText } = render(
        <PageNavigation
          currentPage="homepage"
          configName="the-luxury-boutique-hotel"
        />
      );

      expect(getByText('Home').closest('a')).toHaveAttribute(
        'href',
        '/preview?config=the-luxury-boutique-hotel&page=homepage'
      );
    });
  });

  describe('Room Detail Pages', () => {
    it('should show nested list of available rooms when current page is roomDetail', () => {
      const availableRoomSlugs = ['deluxe-suite', 'ocean-view', 'garden-room', 'penthouse'];

      const { getByText, getAllByRole } = render(
        <PageNavigation
          currentPage="roomDetail"
          configName="test-hotel"
          availableRoomSlugs={availableRoomSlugs}
        />
      );

      // Should show "Available Rooms" heading
      expect(getByText('Available Rooms')).toBeInTheDocument();

      // Should show all room slugs as links
      expect(getByText('deluxe-suite')).toBeInTheDocument();
      expect(getByText('ocean-view')).toBeInTheDocument();
      expect(getByText('garden-room')).toBeInTheDocument();
      expect(getByText('penthouse')).toBeInTheDocument();

      // Should have 4 room links
      const roomLinks = getAllByRole('link').filter(link =>
        availableRoomSlugs.some(slug => link.getAttribute('href')?.includes(`room=${slug}`))
      );
      expect(roomLinks).toHaveLength(4);
    });

    it('should generate correct links for room detail pages', () => {
      const { getByText } = render(
        <PageNavigation
          currentPage="roomDetail"
          configName="test-hotel"
          availableRoomSlugs={['deluxe-suite', 'ocean-view']}
        />
      );

      expect(getByText('deluxe-suite').closest('a')).toHaveAttribute(
        'href',
        '/preview?config=test-hotel&page=roomDetail&room=deluxe-suite'
      );
      expect(getByText('ocean-view').closest('a')).toHaveAttribute(
        'href',
        '/preview?config=test-hotel&page=roomDetail&room=ocean-view'
      );
    });

    it('should not show room list when current page is not roomDetail', () => {
      const { queryByText } = render(
        <PageNavigation
          currentPage="rooms"
          configName="test-hotel"
          availableRoomSlugs={['deluxe-suite', 'ocean-view']}
        />
      );

      // Should NOT show "Available Rooms" section
      expect(queryByText('Available Rooms')).not.toBeInTheDocument();
      expect(queryByText('deluxe-suite')).not.toBeInTheDocument();
    });

    it('should handle empty availableRoomSlugs array', () => {
      const { queryByText } = render(
        <PageNavigation
          currentPage="roomDetail"
          configName="test-hotel"
          availableRoomSlugs={[]}
        />
      );

      // Should NOT show "Available Rooms" when array is empty (length > 0 check)
      expect(queryByText('Available Rooms')).not.toBeInTheDocument();
      expect(queryByText('deluxe-suite')).not.toBeInTheDocument();
    });
  });

  describe('Environment Gate', () => {
    it('should render in development mode', () => {
      // NODE_ENV is already set to 'development' in the outer beforeEach
      const { getByText } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      expect(getByText('Home')).toBeInTheDocument();
    });

    it('should render when PREVIEW_ENABLED is true', () => {
      (process.env as any).NODE_ENV = 'production';
      (process.env as any).PREVIEW_ENABLED = 'true';

      const { getByText } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      expect(getByText('Home')).toBeInTheDocument();

      // Reset for next tests
      (process.env as any).NODE_ENV = 'development';
    });

    it('should not render in production when PREVIEW_ENABLED is false', () => {
      (process.env as any).NODE_ENV = 'production';
      (process.env as any).PREVIEW_ENABLED = 'false';

      const { container } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      // Should return null (render nothing)
      expect(container.firstChild).toBe(null);

      // Reset for next tests
      (process.env as any).NODE_ENV = 'development';
      (process.env as any).PREVIEW_ENABLED = 'true';
    });
  });

  describe('Styling and Layout', () => {
    it('should use semantic design tokens for styling', () => {
      const { container } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('border-b');
      expect(nav).toHaveClass('border-border-subtle');
      expect(nav).toHaveClass('bg-surface-elevated');
    });

    it('should have sticky positioning for easy access', () => {
      const { container } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('sticky');
      expect(nav).toHaveClass('top-0');
    });

    it('should have proper ARIA attributes for accessibility', () => {
      const { container } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      const nav = container.querySelector('nav');
      expect(nav).toHaveAttribute('aria-label', 'Page navigation');
    });

    it('should mark current page with aria-current', () => {
      const { getByText } = render(
        <PageNavigation
          currentPage="rooms"
          configName="test-hotel"
        />
      );

      const roomsLink = getByText('Rooms').closest('a');
      expect(roomsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('Responsive Design', () => {
    it('should have horizontal scroll on mobile', () => {
      const { container } = render(
        <PageNavigation
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      const scrollContainer = container.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });
});

describe('Story 25.5: PageBadge Component', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalPreviewEnabled = process.env.PREVIEW_ENABLED;

  beforeEach(() => {
    jest.clearAllMocks();
    (process.env as any).NODE_ENV = 'development';
    (process.env as any).PREVIEW_ENABLED = 'true';
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    (process.env as any).PREVIEW_ENABLED = originalPreviewEnabled;
  });

  describe('Rendering', () => {
    it('should render with current page name', () => {
      const { getByText } = render(
        <PageBadge
          currentPage="rooms"
          configName="test-hotel"
        />
      );

      expect(getByText('Rooms')).toBeInTheDocument();
    });

    it('should include link to all pages', () => {
      const { getByText } = render(
        <PageBadge
          currentPage="rooms"
          configName="test-hotel"
        />
      );

      expect(getByText('All Pages')).toBeInTheDocument();
      const allPagesLink = getByText('All Pages').closest('a');
      expect(allPagesLink).toHaveAttribute('href', '/preview?config=test-hotel&page=homepage');
    });

    it('should display correct page names for each page type', () => {
      const { getByText: getByTextWithMarkup } = render(
        <PageBadge
          currentPage="gallery"
          configName="test-hotel"
        />
      );

      expect(getByTextWithMarkup('Gallery')).toBeInTheDocument();
    });
  });

  describe('Environment Gate', () => {
    it('should not render in production when PREVIEW_ENABLED is false', () => {
      (process.env as any).NODE_ENV = 'production';
      (process.env as any).PREVIEW_ENABLED = 'false';

      const { container } = render(
        <PageBadge
          currentPage="homepage"
          configName="test-hotel"
        />
      );

      expect(container.firstChild).toBe(null);

      // Reset for next tests
      (process.env as any).NODE_ENV = 'development';
      (process.env as any).PREVIEW_ENABLED = 'true';
    });
  });
});
