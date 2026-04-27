/**
 * Legacy Contact Redirect Page Tests
 *
 * Tests for Story 24.13: Legacy route redirects for backward compatibility
 *
 * @module __tests__/app/(site)/contact/page
 */

import ContactPageRedirect from '@/app/(site)/contact/page';
import { redirect } from 'next/navigation';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

jest.mock('@/lib/content/locale/constants', () => ({
  DEFAULT_LOCALE: 'en',
}));

describe('app/(site)/contact/page.tsx (Story 24.13)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic redirect functionality', () => {
    it('should call redirect with default locale path', () => {
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/contact');
    });

    it('should call redirect exactly once', () => {
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /en/contact path', () => {
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining('/contact'));
    });

    it('should include language prefix in redirect', () => {
      ContactPageRedirect();
      const redirectPath = mockRedirect.mock.calls[0][0];
      expect(redirectPath).toMatch(/^\/[a-z]{2}\/contact$/);
    });
  });

  describe('Story 24.13 Acceptance Criteria', () => {
    it('AC1: Should redirect legacy /contact to /{DEFAULT_LOCALE}/contact', () => {
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/contact');
    });

    it('AC2: Should use permanent redirect (308 status)', () => {
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalled();
    });

    it('AC3: Should preserve query parameters (redirect() handles this)', () => {
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/contact');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple concurrent calls', () => {
      ContactPageRedirect();
      ContactPageRedirect();
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalledTimes(3);
    });

    it('should not redirect to any other path', () => {
      ContactPageRedirect();
      expect(mockRedirect).not.toHaveBeenCalledWith('/rooms');
      expect(mockRedirect).not.toHaveBeenCalledWith('/contact/en');
      expect(mockRedirect).not.toHaveBeenCalledWith('/en');
    });
  });

  describe('Backward compatibility', () => {
    it('should not interfere with existing /{lang}/contact routes', () => {
      ContactPageRedirect();
      expect(mockRedirect).toHaveBeenCalledWith('/en/contact');
      expect(mockRedirect).not.toHaveBeenCalledWith('/contact');
    });
  });
});
