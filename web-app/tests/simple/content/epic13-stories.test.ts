/**
 * Tests for Epic 13 Stories 13.5.1, 13.5.2, 13.5.3
 *
 * @trace epic: EPIC-13
 * @trace story: STORY-13.5.1, STORY-13.5.2, STORY-13.5.3
 */

import {
  isContentEnabled,
  ComponentType,
} from '@/lib/content/featureFlags';
import {
  flushFallbackEventsToLangfuse,
  logFallbackUsage,
  getFallbackUsageBuffer,
  clearFallbackUsageBuffer,
} from '@/lib/content/defaults';
import {
  logContentLoadError,
  logContentLoadSuccess,
  createLoadTimer,
  ContentLoadError,
  ContentLoadSuccess,
} from '@/lib/content/contentLogger';

describe('Story 13.5.1: Enable Content System by Default in Production', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    // Clear all environment variables
    delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM;
    delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO;
    delete process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT;
  });

  describe('isContentEnabled() default behavior', () => {
    it('returns true in production when no env vars are set', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM;
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO;
      delete process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT;

      const result = isContentEnabled('hero');

      expect(result).toBe(true);
    });

    it('returns false in development when no env vars are set', () => {
      process.env.NODE_ENV = 'development';
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM;
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO;
      delete process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT;

      const result = isContentEnabled('hero');

      expect(result).toBe(false);
    });

    it('returns false in test environment when no env vars are set', () => {
      process.env.NODE_ENV = 'test';
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM;
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO;
      delete process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT;

      const result = isContentEnabled('hero');

      expect(result).toBe(false);
    });

    it('prop override still takes highest priority in production', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM;

      const resultDisabled = isContentEnabled('hero', false);
      const resultEnabled = isContentEnabled('hero', true);

      expect(resultDisabled).toBe(false);
      expect(resultEnabled).toBe(true);
    });

    it('component-specific env var overrides default production behavior', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'false';

      const result = isContentEnabled('hero');

      expect(result).toBe(false);
    });

    it('global master switch overrides default production behavior', () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'false';

      const result = isContentEnabled('hero');

      expect(result).toBe(false);
    });

    it('works for all component types', () => {
      process.env.NODE_ENV = 'production';
      delete process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM;

      const components: ComponentType[] = ['hero', 'amenities', 'testimonials'];
      const results = components.map((component) => isContentEnabled(component));

      expect(results).toEqual([true, true, true]);
    });
  });
});

describe('Story 13.5.2: Add Monitoring for Fallback Usage', () => {
  beforeEach(() => {
    clearFallbackUsageBuffer();
  });

  describe('flushFallbackEventsToLangfuse()', () => {
    it('does nothing when no events in buffer', () => {
      const mockTrace = {
        event: jest.fn(),
      };

      flushFallbackEventsToLangfuse(mockTrace);

      expect(mockTrace.event).not.toHaveBeenCalled();
    });

    it('does nothing when langfuseTrace is undefined', () => {
      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');

      // Should not throw
      flushFallbackEventsToLangfuse(undefined);

      // Buffer should still have events (not cleared)
      expect(getFallbackUsageBuffer().length).toBe(1);
    });

    it('sends grouped events to LangFuse', () => {
      const mockTrace = {
        event: jest.fn(),
      };

      // Log multiple events
      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');
      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-456');
      logFallbackUsage('AmenitiesSection', 'heading', 'props', 'hotel-123');

      flushFallbackEventsToLangfuse(mockTrace);

      // Should have called event twice (two unique component_field combinations)
      expect(mockTrace.event).toHaveBeenCalledTimes(2);

      // Check HeroSection_title event
      expect(mockTrace.event).toHaveBeenCalledWith({
        name: 'fallback_usage',
        input: {
          key: 'HeroSection_title',
          count: 2,
          sources: ['default'],
          hotelIds: ['hotel-123', 'hotel-456'],
        },
      });

      // Check AmenitiesSection_heading event
      expect(mockTrace.event).toHaveBeenCalledWith({
        name: 'fallback_usage',
        input: {
          key: 'AmenitiesSection_heading',
          count: 1,
          sources: ['props'],
          hotelIds: ['hotel-123'],
        },
      });
    });

    it('clears buffer after flushing', () => {
      const mockTrace = {
        event: jest.fn(),
      };

      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');
      expect(getFallbackUsageBuffer().length).toBe(1);

      flushFallbackEventsToLangfuse(mockTrace);

      expect(getFallbackUsageBuffer().length).toBe(0);
    });

    it('deduplicates sources and hotelIds', () => {
      const mockTrace = {
        event: jest.fn(),
      };

      // Same component/field, same hotel, different sources
      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');
      logFallbackUsage('HeroSection', 'title', 'props', 'hotel-123');
      logFallbackUsage('HeroSection', 'title', 'content', 'hotel-123');

      flushFallbackEventsToLangfuse(mockTrace);

      expect(mockTrace.event).toHaveBeenCalledWith({
        name: 'fallback_usage',
        input: {
          key: 'HeroSection_title',
          count: 3,
          sources: ['default', 'props', 'content'],
          hotelIds: ['hotel-123'],
        },
      });
    });

    it('handles events with undefined hotelId', () => {
      const mockTrace = {
        event: jest.fn(),
      };

      logFallbackUsage('HeroSection', 'title', 'default');
      logFallbackUsage('HeroSection', 'title', 'default', 'hotel-123');

      flushFallbackEventsToLangfuse(mockTrace);

      expect(mockTrace.event).toHaveBeenCalledWith({
        name: 'fallback_usage',
        input: {
          key: 'HeroSection_title',
          count: 2,
          sources: ['default'],
          hotelIds: [undefined, 'hotel-123'],
        },
      });
    });
  });
});

describe('Story 13.5.3: Add Content Loading Failure Logging', () => {
  const originalEnv = process.env.NODE_ENV;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleDebugSpy.mockRestore();
  });

  describe('logContentLoadError()', () => {
    it('logs structured JSON in production', () => {
      process.env.NODE_ENV = 'production';

      const error: ContentLoadError = {
        type: 'network',
        message: 'Failed to fetch content.json',
        url: 'https://cdn.example.com/hotel-123/content.json',
        statusCode: 404,
        hotelId: 'hotel-123',
        component: 'HeroSection',
        retryCount: 3,
        duration: 5000,
      };

      logContentLoadError(error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);

      expect(loggedData).toMatchObject({
        level: 'error',
        category: 'content_loading',
        type: 'network',
        message: 'Failed to fetch content.json',
        url: 'https://cdn.example.com/hotel-123/content.json',
        statusCode: 404,
        hotelId: 'hotel-123',
        component: 'HeroSection',
        retryCount: 3,
        duration: 5000,
      });
      expect(loggedData.timestamp).toBeDefined();
    });

    it('logs human-readable format in development', () => {
      process.env.NODE_ENV = 'development';

      const error: ContentLoadError = {
        type: 'parse',
        message: 'Invalid JSON format',
        url: 'https://cdn.example.com/hotel-123/content.json',
        statusCode: 200,
        hotelId: 'hotel-123',
        component: 'HeroSection',
      };

      logContentLoadError(error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy.mock.calls[0][0]).toBe(
        '[Content Load Error] parse: Invalid JSON format'
      );
      expect(consoleErrorSpy.mock.calls[0][1]).toMatchObject({
        url: 'https://cdn.example.com/hotel-123/content.json',
        statusCode: 200,
        hotelId: 'hotel-123',
        component: 'HeroSection',
        retryCount: undefined,
        duration: undefined,
      });
    });

    it('handles all error types', () => {
      process.env.NODE_ENV = 'production';

      const errorTypes: ContentLoadError['type'][] = [
        'network',
        'parse',
        'validation',
        'timeout',
        'unknown',
      ];

      errorTypes.forEach((type) => {
        consoleErrorSpy.mockClear();
        logContentLoadError({
          type,
          message: `Error of type ${type}`,
        });

        const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
        expect(loggedData.type).toBe(type);
      });
    });

    it('handles minimal error data', () => {
      process.env.NODE_ENV = 'production';

      const error: ContentLoadError = {
        type: 'unknown',
        message: 'Something went wrong',
      };

      logContentLoadError(error);

      const loggedData = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
      expect(loggedData).toMatchObject({
        level: 'error',
        category: 'content_loading',
        type: 'unknown',
        message: 'Something went wrong',
      });
    });
  });

  describe('logContentLoadSuccess()', () => {
    it('logs slow loads (>1s) as warnings in production', () => {
      process.env.NODE_ENV = 'production';

      const metrics: ContentLoadSuccess = {
        hotelId: 'hotel-123',
        component: 'HeroSection',
        url: 'https://cdn.example.com/hotel-123/content.json',
        duration: 1500,
        cached: false,
      };

      logContentLoadSuccess(metrics);

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedData = JSON.parse(consoleWarnSpy.mock.calls[0][0]);

      expect(loggedData).toMatchObject({
        level: 'warn',
        category: 'content_loading_slow',
        hotelId: 'hotel-123',
        component: 'HeroSection',
        url: 'https://cdn.example.com/hotel-123/content.json',
        duration: 1500,
        cached: false,
      });
    });

    it('does not log fast loads in production', () => {
      process.env.NODE_ENV = 'production';

      const metrics: ContentLoadSuccess = {
        hotelId: 'hotel-123',
        component: 'HeroSection',
        duration: 350,
        cached: true,
      };

      logContentLoadSuccess(metrics);

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleDebugSpy).not.toHaveBeenCalled();
    });

    it('logs all loads in development', () => {
      process.env.NODE_ENV = 'development';

      const metrics: ContentLoadSuccess = {
        hotelId: 'hotel-123',
        component: 'HeroSection',
        duration: 350,
        cached: false,
      };

      logContentLoadSuccess(metrics);

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      expect(consoleDebugSpy.mock.calls[0][0]).toBe(
        '[Content Load Success] HeroSection'
      );
      expect(consoleDebugSpy.mock.calls[0][1]).toMatchObject({
        hotelId: 'hotel-123',
        duration: '350ms',
        cached: false,
      });
    });

    it('handles cached loads', () => {
      process.env.NODE_ENV = 'development';

      const metrics: ContentLoadSuccess = {
        hotelId: 'hotel-123',
        component: 'AmenitiesSection',
        duration: 50,
        cached: true,
      };

      logContentLoadSuccess(metrics);

      expect(consoleDebugSpy.mock.calls[0][1]).toMatchObject({
        hotelId: 'hotel-123',
        duration: '50ms',
        cached: true,
      });
    });
  });

  describe('createLoadTimer()', () => {
    it('measures elapsed time correctly', () => {
      const timer = createLoadTimer();

      // Wait a bit
      const start = Date.now();
      while (Date.now() - start < 50) {
        // Busy wait
      }

      const duration = timer.getDuration();

      // Should be at least 50ms
      expect(duration).toBeGreaterThanOrEqual(50);
      // Should be less than 200ms (reasonable upper bound)
      expect(duration).toBeLessThan(200);
    });

    it('returns increasing durations on multiple calls', () => {
      const timer = createLoadTimer();

      const duration1 = timer.getDuration();

      // Wait a bit
      const start = Date.now();
      while (Date.now() - start < 20) {
        // Busy wait
      }

      const duration2 = timer.getDuration();

      expect(duration2).toBeGreaterThan(duration1);
    });

    it('can be used in typical async workflow', async () => {
      const timer = createLoadTimer();

      // Simulate async operation (15ms to account for timing variance)
      await new Promise((resolve) => setTimeout(resolve, 15));

      const duration = timer.getDuration();

      // Allow small timing variance (10ms instead of 15ms threshold)
      expect(duration).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Integration: Timer with logging', () => {
    it('works together in typical usage pattern', () => {
      process.env.NODE_ENV = 'development';

      const timer = createLoadTimer();

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 30) {
        // Busy wait
      }

      const duration = timer.getDuration();

      // Log success
      logContentLoadSuccess({
        hotelId: 'hotel-123',
        component: 'HeroSection',
        url: 'https://cdn.example.com/hotel-123/content.json',
        duration,
        cached: false,
      });

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
      const loggedData = consoleDebugSpy.mock.calls[0][1];
      expect(loggedData.duration).toMatch(/\d+ms/);
    });
  });
});
