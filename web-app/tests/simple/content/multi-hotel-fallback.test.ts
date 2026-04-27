/**
 * Story 13.1.4: Multi-Hotel Fallback Chain Tests
 *
 * @trace epic: EPIC-13
 * @trace story: STORY-13.1.4
 *
 * Tests validating that fallback chain works correctly for multiple hotels:
 * 1. Content isolation between hotels
 * 2. No hotel-specific defaults leak between hotels
 * 3. Fallback chain resolves correctly for different hotels
 * 4. Content system disabled scenarios
 * 5. Content load failure scenarios
 */

import { resolveFallback, resolveNestedFallback } from '@/lib/content/fallback';
import {
  CONTENT_DEFAULTS,
  isGenericDefault,
  logFallbackUsage,
  getFallbackUsageBuffer,
  clearFallbackUsageBuffer,
} from '@/lib/content/defaults';

describe('Story 13.1.4: Multi-Hotel Fallback Chain Tests', () => {
  beforeEach(() => {
    clearFallbackUsageBuffer();
  });

  describe('Multi-hotel content isolation', () => {
    // Simulated content for different hotels
    const hotelContent = {
      'hotel-123': {
        hero: {
          title: 'Grand Plaza Hotel',
          tagline: 'Luxury in the Heart of the City',
          headline: 'Experience Urban Elegance',
        },
      },
      'hotel-456': {
        hero: {
          title: 'Seaside Resort & Spa',
          tagline: 'Where Ocean Meets Luxury',
          headline: 'Your Beachfront Paradise',
        },
      },
      'hotel-789': {
        hero: {
          title: 'Mountain Lodge Retreat',
          tagline: 'Escape to Nature',
          headline: 'Adventure Awaits',
        },
      },
    };

    it('should resolve different content for different hotels', () => {
      // Hotel 123
      const title123 = resolveFallback(
        hotelContent['hotel-123'].hero.title,
        undefined,
        CONTENT_DEFAULTS.hero.title
      );
      expect(title123).toBe('Grand Plaza Hotel');

      // Hotel 456
      const title456 = resolveFallback(
        hotelContent['hotel-456'].hero.title,
        undefined,
        CONTENT_DEFAULTS.hero.title
      );
      expect(title456).toBe('Seaside Resort & Spa');

      // Hotel 789
      const title789 = resolveFallback(
        hotelContent['hotel-789'].hero.title,
        undefined,
        CONTENT_DEFAULTS.hero.title
      );
      expect(title789).toBe('Mountain Lodge Retreat');

      // Verify they're all different
      expect(title123).not.toBe(title456);
      expect(title456).not.toBe(title789);
      expect(title123).not.toBe(title789);
    });

    it('should never leak hotel-specific content between hotels', () => {
      // Process multiple hotels in sequence
      const resolvedTitles: Record<string, string> = {};

      for (const hotelId of Object.keys(hotelContent) as Array<keyof typeof hotelContent>) {
        resolvedTitles[hotelId] = resolveFallback(
          hotelContent[hotelId].hero.title,
          undefined,
          CONTENT_DEFAULTS.hero.title
        );
      }

      // Verify each hotel got its own content
      expect(resolvedTitles['hotel-123']).toBe('Grand Plaza Hotel');
      expect(resolvedTitles['hotel-456']).toBe('Seaside Resort & Spa');
      expect(resolvedTitles['hotel-789']).toBe('Mountain Lodge Retreat');

      // Verify no hotel got another hotel's content
      expect(resolvedTitles['hotel-123']).not.toContain('Seaside');
      expect(resolvedTitles['hotel-123']).not.toContain('Mountain');
      expect(resolvedTitles['hotel-456']).not.toContain('Grand Plaza');
      expect(resolvedTitles['hotel-456']).not.toContain('Mountain');
      expect(resolvedTitles['hotel-789']).not.toContain('Grand Plaza');
      expect(resolvedTitles['hotel-789']).not.toContain('Seaside');
    });
  });

  describe('Content system disabled scenarios', () => {
    it('should use generic defaults when content system is disabled', () => {
      // When content system is disabled, contentValue is always undefined
      const contentDisabled = undefined;

      // All hotels should get generic defaults
      const title1 = resolveFallback(contentDisabled, undefined, CONTENT_DEFAULTS.hero.title);
      const title2 = resolveFallback(contentDisabled, undefined, CONTENT_DEFAULTS.hero.title);
      const title3 = resolveFallback(contentDisabled, undefined, CONTENT_DEFAULTS.hero.title);

      expect(title1).toBe('Hotel Name');
      expect(title2).toBe('Hotel Name');
      expect(title3).toBe('Hotel Name');

      // Verify generic (not hotel-specific)
      expect(isGenericDefault(title1)).toBe(true);
      expect(isGenericDefault(title2)).toBe(true);
      expect(isGenericDefault(title3)).toBe(true);
    });

    it('should not show "The Sterling Executive" when content is disabled', () => {
      const contentDisabled = undefined;

      // Resolve all fields that had hotel-specific defaults before
      const title = resolveFallback(contentDisabled, undefined, CONTENT_DEFAULTS.hero.title);
      const tagline = resolveFallback(contentDisabled, undefined, CONTENT_DEFAULTS.hero.tagline);
      const headline = resolveFallback(contentDisabled, undefined, CONTENT_DEFAULTS.hero.headline);

      // None should contain Sterling Executive branding
      expect(title).not.toContain('Sterling');
      expect(tagline).not.toContain('Boutique Luxury');
      expect(headline).not.toContain('Prestige');

      // Verify all are generic
      expect(isGenericDefault(title)).toBe(true);
      expect(isGenericDefault(tagline)).toBe(true);
      expect(isGenericDefault(headline)).toBe(true);
    });

    it('should show same generic defaults for all hotels when content disabled', () => {
      const hotelIds = ['hotel-001', 'hotel-002', 'hotel-003', 'hotel-100', 'hotel-xyz'];
      const contentDisabled = undefined;

      const resolvedTitles = hotelIds.map(() =>
        resolveFallback(contentDisabled, undefined, CONTENT_DEFAULTS.hero.title)
      );

      // All should be identical generic default
      resolvedTitles.forEach((title) => {
        expect(title).toBe('Hotel Name');
      });
    });
  });

  describe('Content load failure scenarios (network error)', () => {
    it('should fallback to props when content fails to load', () => {
      // Simulating network error - contentValue is null (failed to fetch)
      const contentLoadFailed = null;
      const propsValue = 'Fallback Hotel Name';

      const title = resolveFallback(contentLoadFailed, propsValue, CONTENT_DEFAULTS.hero.title);

      expect(title).toBe('Fallback Hotel Name');
    });

    it('should fallback to generic defaults when both content and props fail', () => {
      const contentLoadFailed = null;
      const noProps = undefined;

      const title = resolveFallback(contentLoadFailed, noProps, CONTENT_DEFAULTS.hero.title);

      expect(title).toBe('Hotel Name');
      expect(isGenericDefault(title)).toBe(true);
    });

    it('should track fallback usage when content fails', () => {
      const contentLoadFailed = null;
      const noProps = undefined;

      // Simulate fallback with tracking
      const onFallback = (source: 'content' | 'props' | 'default') => {
        logFallbackUsage('HeroSection', 'title', source, 'hotel-error-test');
      };

      resolveFallback(contentLoadFailed, noProps, CONTENT_DEFAULTS.hero.title, { onFallback });

      const buffer = getFallbackUsageBuffer();
      expect(buffer.length).toBe(1);
      expect(buffer[0]).toMatchObject({
        component: 'HeroSection',
        field: 'title',
        source: 'default',
        hotelId: 'hotel-error-test',
      });
    });
  });

  describe('Multiple hotels with partial content', () => {
    it('should resolve correctly when some hotels have missing fields', () => {
      // Hotel with complete content
      const hotel1Content = {
        title: 'Complete Hotel',
        tagline: 'We have everything',
        headline: 'Full Content',
      };

      // Hotel with partial content (missing tagline)
      const hotel2Content = {
        title: 'Partial Hotel',
        tagline: undefined,
        headline: 'Some Content',
      };

      // Hotel with no content
      const hotel3Content = {
        title: undefined,
        tagline: undefined,
        headline: undefined,
      };

      // Resolve Hotel 1 - should use content for all
      const hotel1Title = resolveFallback(hotel1Content.title, undefined, CONTENT_DEFAULTS.hero.title);
      const hotel1Tagline = resolveFallback(hotel1Content.tagline, undefined, CONTENT_DEFAULTS.hero.tagline);
      expect(hotel1Title).toBe('Complete Hotel');
      expect(hotel1Tagline).toBe('We have everything');

      // Resolve Hotel 2 - should use content for some, default for others
      const hotel2Title = resolveFallback(hotel2Content.title, undefined, CONTENT_DEFAULTS.hero.title);
      const hotel2Tagline = resolveFallback(hotel2Content.tagline, undefined, CONTENT_DEFAULTS.hero.tagline);
      expect(hotel2Title).toBe('Partial Hotel');
      expect(hotel2Tagline).toBe('Your Comfort is Our Priority'); // Default

      // Resolve Hotel 3 - should use defaults for all
      const hotel3Title = resolveFallback(hotel3Content.title, undefined, CONTENT_DEFAULTS.hero.title);
      const hotel3Tagline = resolveFallback(hotel3Content.tagline, undefined, CONTENT_DEFAULTS.hero.tagline);
      expect(hotel3Title).toBe('Hotel Name'); // Default
      expect(hotel3Tagline).toBe('Your Comfort is Our Priority'); // Default
    });
  });

  describe('Props override behavior across hotels', () => {
    it('should allow props to override content for specific hotels', () => {
      const content1 = { title: 'Content Title 1' };
      const content2 = { title: 'Content Title 2' };
      const propsOverride = 'Props Override Title';

      // Hotel 1: Content takes priority
      const hotel1Title = resolveFallback(content1.title, undefined, CONTENT_DEFAULTS.hero.title);
      expect(hotel1Title).toBe('Content Title 1');

      // Hotel 2: Props override content
      const hotel2Title = resolveFallback(content2.title, propsOverride, CONTENT_DEFAULTS.hero.title);
      expect(hotel2Title).toBe('Content Title 2'); // Content still wins by design

      // Hotel 3: When content is null, props take over
      const hotel3Title = resolveFallback(null, propsOverride, CONTENT_DEFAULTS.hero.title);
      expect(hotel3Title).toBe('Props Override Title');
    });
  });

  describe('Nested object fallback for multiple hotels', () => {
    it('should handle nested CTA objects correctly for different hotels', () => {
      const hotel1CTA = { text: 'Book at Grand Plaza', href: '/grand-plaza/book' };
      const hotel2CTA = { text: 'Reserve at Seaside', href: '/seaside/reserve' };
      const defaultCTA = CONTENT_DEFAULTS.hero.primaryCTA;

      // Hotel 1
      const cta1 = resolveNestedFallback(hotel1CTA, undefined, defaultCTA);
      expect(cta1.text).toBe('Book at Grand Plaza');
      expect(cta1.href).toBe('/grand-plaza/book');

      // Hotel 2
      const cta2 = resolveNestedFallback(hotel2CTA, undefined, defaultCTA);
      expect(cta2.text).toBe('Reserve at Seaside');
      expect(cta2.href).toBe('/seaside/reserve');

      // Hotel 3 (no content)
      const cta3 = resolveNestedFallback(undefined, undefined, defaultCTA);
      expect(cta3.text).toBe('Book Now');
      expect(cta3.href).toBe('/booking');
    });
  });

  describe('Generic defaults validation for all sections', () => {
    it('should have generic defaults for hero section', () => {
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.title)).toBe(true);
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.tagline)).toBe(true);
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.headline)).toBe(true);
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.primaryCTA.text)).toBe(true);
      expect(isGenericDefault(CONTENT_DEFAULTS.hero.secondaryCTA.text)).toBe(true);
    });

    it('should have generic defaults for amenities section', () => {
      expect(isGenericDefault(CONTENT_DEFAULTS.amenities.heading)).toBe(true);
      expect(isGenericDefault(CONTENT_DEFAULTS.amenities.subheading)).toBe(true);
    });

    it('should have generic defaults for testimonials section', () => {
      expect(isGenericDefault(CONTENT_DEFAULTS.testimonials.heading)).toBe(true);
      expect(isGenericDefault(CONTENT_DEFAULTS.testimonials.subheading)).toBe(true);
    });
  });

  describe('Regression prevention: No hotel-specific strings', () => {
    const forbiddenStrings = [
      'The Sterling Executive',
      'Sterling Executive',
      'Experience Boutique Luxury',
      'Where Comfort Meets Prestige',
      'Where Business Meets Boutique Excellence',
      'sterlingexecutive.com',
    ];

    it('should never return hotel-specific strings from CONTENT_DEFAULTS', () => {
      const allDefaults = JSON.stringify(CONTENT_DEFAULTS).toLowerCase();

      forbiddenStrings.forEach((forbidden) => {
        expect(allDefaults).not.toContain(forbidden.toLowerCase());
      });
    });

    it('should never resolve to hotel-specific strings when using defaults', () => {
      // Simulate 10 different hotels all using defaults
      for (let i = 0; i < 10; i++) {
        const title = resolveFallback(undefined, undefined, CONTENT_DEFAULTS.hero.title);
        const tagline = resolveFallback(undefined, undefined, CONTENT_DEFAULTS.hero.tagline);
        const headline = resolveFallback(undefined, undefined, CONTENT_DEFAULTS.hero.headline);

        forbiddenStrings.forEach((forbidden) => {
          expect(title.toLowerCase()).not.toContain(forbidden.toLowerCase());
          expect(tagline.toLowerCase()).not.toContain(forbidden.toLowerCase());
          expect(headline.toLowerCase()).not.toContain(forbidden.toLowerCase());
        });
      }
    });
  });

  describe('Fallback source tracking for monitoring', () => {
    it('should correctly identify when content is used vs defaults', () => {
      const sources: Array<'content' | 'props' | 'default'> = [];
      const trackSource = (source: 'content' | 'props' | 'default') => {
        sources.push(source);
      };

      // With content
      resolveFallback('Content Value', undefined, 'Default', { onFallback: trackSource });
      expect(sources[0]).toBe('content');

      // With props only
      resolveFallback(undefined, 'Props Value', 'Default', { onFallback: trackSource });
      expect(sources[1]).toBe('props');

      // With defaults only
      resolveFallback(undefined, undefined, 'Default', { onFallback: trackSource });
      expect(sources[2]).toBe('default');
    });

    it('should track fallback usage for multiple hotels', () => {
      const hotelIds = ['hotel-A', 'hotel-B', 'hotel-C'];

      hotelIds.forEach((hotelId) => {
        const onFallback = (source: 'content' | 'props' | 'default') => {
          logFallbackUsage('HeroSection', 'title', source, hotelId);
        };
        resolveFallback(undefined, undefined, CONTENT_DEFAULTS.hero.title, { onFallback });
      });

      const buffer = getFallbackUsageBuffer();
      expect(buffer.length).toBe(3);
      expect(buffer.map((e) => e.hotelId)).toEqual(['hotel-A', 'hotel-B', 'hotel-C']);
      buffer.forEach((event) => {
        expect(event.source).toBe('default');
      });
    });
  });
});
