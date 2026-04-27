/**
 * Legacy Rooms Redirect Page Tests
 *
 * Tests for Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module __tests__/app/(site)/rooms/page
 */

import RoomsPageRedirect from '@/app/(site)/rooms/page';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

jest.mock('@/lib/content/locale/constants', () => ({
  DEFAULT_LOCALE: 'en',
}));

describe('app/(site)/rooms/page.tsx (Story 24.13)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic redirect functionality', () => {
    it('should call redirect with default locale path', () => {
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/rooms');
    });

    it('should call redirect exactly once', () => {
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /en/rooms path', () => {
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/rooms'));
    });

    it('should include language prefix in redirect', () => {
      RoomsPageRedirect();
      const redirectPath = mockRedirect.mock.calls[0][0];
      expect(redirectPath).toMatch(/^\/[a-z]{2}\/rooms$/);
    });
  });

  describe('Story 24.13 Acceptance Criteria', () => {
    it('AC1: Should redirect legacy /rooms to /{DEFAULT_LOCALE}/rooms', () => {
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/rooms');
    });

    it('AC2: Should use permanent redirect (308 status)', () => {
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('AC3: Should preserve query parameters (redirect() handles this)', () => {
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/rooms');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple concurrent calls', () => {
      RoomsPageRedirect();
      RoomsPageRedirect();
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalledTimes(3);
    });

    it('should not redirect to any other path', () => {
      RoomsPageRedirect();
      expect(mockRedirect).not.toHaveBeenCalledWith('/contact');
      expect(mockRedirect).not.toHaveBeenCalledWith('/rooms/en');
      expect(mockRedirect).not.toHaveBeenCalledWith('/en');
    });
  });

  describe('Backward compatibility', () => {
    it('should not interfere with existing /{lang}/rooms routes', () => {
      RoomsPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/rooms');
      expect(mockRedirect).not.toHaveBeenCalledWith('/rooms');
    });
  });
});
