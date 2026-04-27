import { isContentEnabled, isAnyContentEnabled, getRolloutPercentage } from '@/lib/content/featureFlags';

describe('Content Feature Flags', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };

    // Mock sessionStorage
    const sessionStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; },
      };
    })();
    Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('isContentEnabled', () => {
    describe('default behavior', () => {
      it('should be disabled by default when no flags set', () => {
        expect(isContentEnabled('hero')).toBe(false);
        expect(isContentEnabled('amenities')).toBe(false);
        expect(isContentEnabled('testimonials')).toBe(false);
      });
    });

    describe('prop override', () => {
      it('should return true when prop override is true', () => {
        expect(isContentEnabled('hero', true)).toBe(true);
      });

      it('should return false when prop override is false', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'true';
        expect(isContentEnabled('hero', false)).toBe(false);
      });

      it('should ignore environment variables when prop override provided', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'false';
        expect(isContentEnabled('hero', true)).toBe(true);
      });
    });

    describe('component-specific flags', () => {
      it('should respect HERO component flag', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'true';
        expect(isContentEnabled('hero')).toBe(true);
      });

      it('should respect AMENITIES component flag', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_AMENITIES = 'true';
        expect(isContentEnabled('amenities')).toBe(true);
      });

      it('should respect TESTIMONIALS component flag', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_TESTIMONIALS = 'true';
        expect(isContentEnabled('testimonials')).toBe(true);
      });

      it('should treat any value other than "true" as false', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'false';
        expect(isContentEnabled('hero')).toBe(false);

        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = '1';
        expect(isContentEnabled('hero')).toBe(false);

        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'yes';
        expect(isContentEnabled('hero')).toBe(false);
      });

      it('should allow independent component flags', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'true';
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_AMENITIES = 'false';
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_TESTIMONIALS = 'true';

        expect(isContentEnabled('hero')).toBe(true);
        expect(isContentEnabled('amenities')).toBe(false);
        expect(isContentEnabled('testimonials')).toBe(true);
      });
    });

    describe('global master switch', () => {
      it('should enable all components when master switch is true', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'true';

        expect(isContentEnabled('hero')).toBe(true);
        expect(isContentEnabled('amenities')).toBe(true);
        expect(isContentEnabled('testimonials')).toBe(true);
      });

      it('should disable all components when master switch is false', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'false';

        expect(isContentEnabled('hero')).toBe(false);
        expect(isContentEnabled('amenities')).toBe(false);
        expect(isContentEnabled('testimonials')).toBe(false);
      });

      it('should allow component flag to override master switch', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'true';
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'false';

        expect(isContentEnabled('hero')).toBe(false);
        expect(isContentEnabled('amenities')).toBe(true);
      });
    });

    describe('rollout percentage', () => {
      it('should use rollout percentage when set', () => {
        process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = '100';
        // With 100% rollout, all users should be enabled
        expect(isContentEnabled('hero')).toBe(true);
      });

      it('should handle 0% rollout', () => {
        process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = '0';
        expect(isContentEnabled('hero')).toBe(false);
      });

      it('should be disabled when rollout is not a number', () => {
        process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = 'invalid';
        expect(isContentEnabled('hero')).toBe(false);
      });
    });

    describe('priority order', () => {
      it('should prioritize prop override over everything', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'false';
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'false';
        expect(isContentEnabled('hero', true)).toBe(true);
      });

      it('should prioritize component flag over master switch', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'true';
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'false';
        expect(isContentEnabled('hero')).toBe(true);
      });

      it('should prioritize master switch over rollout', () => {
        process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'false';
        process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = '100';
        expect(isContentEnabled('hero')).toBe(false);
      });

      it('should use rollout when nothing else set', () => {
        process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = '50';
        // Result depends on user bucket, just verify it doesn't crash
        const result = isContentEnabled('hero');
        expect(typeof result).toBe('boolean');
      });
    });
  });

  describe('isAnyContentEnabled', () => {
    it('should return false when all flags are false', () => {
      expect(isAnyContentEnabled()).toBe(false);
    });

    it('should return true when hero is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_CONTENT_HERO = 'true';
      expect(isAnyContentEnabled()).toBe(true);
    });

    it('should return true when amenities is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_CONTENT_AMENITIES = 'true';
      expect(isAnyContentEnabled()).toBe(true);
    });

    it('should return true when testimonials is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_CONTENT_TESTIMONIALS = 'true';
      expect(isAnyContentEnabled()).toBe(true);
    });

    it('should return true when master switch is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM = 'true';
      expect(isAnyContentEnabled()).toBe(true);
    });
  });

  describe('getRolloutPercentage', () => {
    it('should return 0 when not configured', () => {
      expect(getRolloutPercentage()).toBe(0);
    });

    it('should return the configured percentage', () => {
      process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = '50';
      expect(getRolloutPercentage()).toBe(50);
    });

    it('should clamp values to 0-100 range', () => {
      process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = '150';
      expect(getRolloutPercentage()).toBe(100);

      process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = '-10';
      expect(getRolloutPercentage()).toBe(0);
    });

    it('should return 0 for invalid values', () => {
      process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT = 'invalid';
      expect(getRolloutPercentage()).toBe(0);
    });
  });
});
