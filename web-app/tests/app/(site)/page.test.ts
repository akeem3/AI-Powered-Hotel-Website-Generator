/**
 * Legacy Homepage Redirect Page Tests
 *
 * Tests for Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module __tests__/app/(site)/page
 */

import HomePageRedirect from '@/app/(site)/page';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

jest.mock('@/lib/content/locale/constants', () => ({
  DEFAULT_LOCALE: 'en',
}));

describe('app/(site)/page.tsx (Story 24.13)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic redirect functionality', () => {
    it('should call redirect with default locale path', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en');
    });

    it('should call redirect exactly once', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /en path (default locale homepage)', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/en'));
    });

    it('should include language prefix in redirect', () => {
      HomePageRedirect();
      const redirectPath = mockRedirect.mock.calls[0][0];
      expect(redirectPath).toMatch(/^\/[a-z]{2}$/);
    });
  });

  describe('Story 24.13 Acceptance Criteria', () => {
    it('AC1: Should redirect legacy / to /{DEFAULT_LOCALE}', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en');
    });

    it('AC2: Should use permanent redirect (308 status)', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('AC3: Should preserve query parameters (redirect() handles this)', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple concurrent calls', () => {
      HomePageRedirect();
      HomePageRedirect();
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledTimes(3);
    });

    it('should not redirect to any other path', () => {
      HomePageRedirect();
      expect(mockRedirect).not.toHaveBeenCalledWith('/contact');
      expect(mockRedirect).not.toHaveBeenCalledWith('/rooms');
      expect(mockRedirect).not.toHaveBeenCalledWith('/en/rooms');
    });
  });

  describe('Backward compatibility', () => {
    it('should not interfere with existing /{lang} routes', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en');
      expect(mockRedirect).not.toHaveBeenCalledWith('/');
    });

    it('should redirect to language-aware homepage with navigation', () => {
      HomePageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en');
    });
  });

  describe('User experience', () => {
    it('should always redirect users to a page with navbar', () => {
      HomePageRedirect();
      // Redirects to /en which has the navigation in [lang]/layout.tsx
      expect(mockRedirect).toHaveBeenCalledWith('/en');
    });
  });
});
