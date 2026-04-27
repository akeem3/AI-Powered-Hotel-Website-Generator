import { resolveMediaRef, resolveMediaRefOrFallback, resolveMediaRefOrThrow, isMediaRef } from '@/lib/content/resolvers/media-resolver';
import { MediaManifest } from '@/lib/content/schemas';

describe('isMediaRef', () => {
  it('should return true for valid media references', () => {
    expect(isMediaRef('@media:homepage.hero')).toBe(true);
    expect(isMediaRef('@media:rooms.gallery-1')).toBe(true);
    expect(isMediaRef('@media:test.123_asset')).toBe(true);
  });

  it('should return false for non-media references', () => {
    expect(isMediaRef('https://cdn.com/img.jpg')).toBe(false);
    expect(isMediaRef('/images/hotel-img.jpg')).toBe(false);
    expect(isMediaRef('media:homepage.hero')).toBe(false); // Missing @
    expect(isMediaRef('@media:homepage')).toBe(false); // Missing dot
    expect(isMediaRef('')).toBe(false);
    expect(isMediaRef('plain text')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isMediaRef('@media:')).toBe(false); // Missing page/asset
    expect(isMediaRef('@media:.hero')).toBe(false); // Missing page
    expect(isMediaRef('@media:homepage.')).toBe(false); // Missing asset
  });
});

describe('resolveMediaRef', () => {
  const createMockManifest = (): MediaManifest => ({
    cdn: {
      baseUrl: 'https://cdn.example.com',
      transformPath: '/cdn-cgi/image',
    },
    assets: {
      homepage: {
        hero: {
          id: 'hero-001',
          path: '/hotel-123/hero.webp',
          mobilePath: '/hotel-123/hero-mobile.webp',
          alt: 'Hotel exterior view',
          blurhash: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4',
          width: 1920,
          height: 1080,
        },
        'og-image': {
          id: 'og-001',
          path: '/hotel-123/og.jpg',
          alt: 'Social preview',
          width: 1200,
          height: 630,
        },
      },
      rooms: {
        'deluxe-suite': {
          id: 'room-001',
          path: '/hotel-123/rooms/deluxe-suite.webp',
          alt: 'Deluxe Suite',
          width: 1600,
          height: 1200,
        },
      },
    },
  });

  describe('valid reference resolution', () => {
    it('should resolve media reference with all fields', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRef('@media:homepage.hero', manifest);

      expect(result).toEqual({
        url: 'https://cdn.example.com/hotel-123/hero.webp',
        mobileUrl: 'https://cdn.example.com/hotel-123/hero-mobile.webp',
        alt: 'Hotel exterior view',
        blurhash: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4',
        width: 1920,
        height: 1080,
      });
    });

    it('should resolve media reference without mobile path', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRef('@media:homepage.og-image', manifest);

      expect(result).toEqual({
        url: 'https://cdn.example.com/hotel-123/og.jpg',
        mobileUrl: null,
        alt: 'Social preview',
        blurhash: null,
        width: 1200,
        height: 630,
      });
    });

    it('should resolve media reference with hyphens in asset name', () => {
      const manifest = createMockManifest();
      const result = resolveMediaRef('@media:rooms.deluxe-suite', manifest);

      expect(result).toEqual({
        url: 'https://cdn.example.com/hotel-123/rooms/deluxe-suite.webp',
        mobileUrl: null,
        alt: 'Deluxe Suite',
        blurhash: null,
        width: 1600,
        height: 1200,
      });
    });
  });

  describe('error handling - invalid format', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should return null for non-@media: strings', () => {
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = resolveMediaRef('https://other-cdn.com/img.jpg', manifest);
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should return null for invalid format', () => {
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = resolveMediaRef('@media:invalid-format', manifest);
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should warn in development for invalid format', () => {
      (process.env as any).NODE_ENV = 'development';
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      resolveMediaRef('invalid-ref', manifest);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid media reference format')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('error handling - missing assets', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('should return null when page not found', () => {
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = resolveMediaRef('@media:missingpage.hero', manifest);
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should return null when asset not found', () => {
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = resolveMediaRef('@media:homepage.missing', manifest);
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should warn in development for missing page', () => {
      (process.env as any).NODE_ENV = 'development';
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      resolveMediaRef('@media:missingpage.hero', manifest);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Page "missingpage" not found in manifest')
      );

      consoleSpy.mockRestore();
    });

    it('should warn in development for missing asset', () => {
      (process.env as any).NODE_ENV = 'development';
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      resolveMediaRef('@media:homepage.missing', manifest);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Asset "missing" not found in page "homepage"')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('null/undefined manifest handling', () => {
    it('should handle null manifest gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = resolveMediaRef('@media:homepage.hero', null as any);
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('empty/whitespace handling', () => {
    it('should return null for empty reference', () => {
      const manifest = createMockManifest();
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = resolveMediaRef('', manifest);
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('should handle whitespace in reference correctly', () => {
      const manifest = createMockManifest();
      // @media: references typically don't have spaces, but let's be safe
      const result = resolveMediaRef('@media: homepage.hero ', manifest);
      expect(result).toBeNull(); // Space makes it invalid format
    });
  });
});

describe('resolveMediaRefOrFallback', () => {
  const createMockManifest = (): MediaManifest => ({
    cdn: {
      baseUrl: 'https://cdn.example.com',
      transformPath: '/cdn-cgi/image',
    },
    assets: {
      homepage: {
        hero: {
          id: 'hero-001',
          path: '/hotel-123/hero.webp',
          alt: 'Hotel',
        },
      },
    },
  });

  it('should return resolved media when found', () => {
    const manifest = createMockManifest();
    const result = resolveMediaRefOrFallback('@media:homepage.hero', manifest);

    expect(result).toEqual({
      url: 'https://cdn.example.com/hotel-123/hero.webp',
      mobileUrl: null,
      alt: 'Hotel',
      blurhash: null,
      width: null,
      height: null,
    });
  });

  it('should return fallback when asset not found', () => {
    const manifest = createMockManifest();
    const result = resolveMediaRefOrFallback('@media:homepage.missing', manifest);

    expect(result).toEqual({
      url: '/images/hotel-img.jpg',
      mobileUrl: null,
      alt: '',
      blurhash: null,
      width: null,
      height: null,
    });
  });

  it('should return fallback when page not found', () => {
    const manifest = createMockManifest();
    const result = resolveMediaRefOrFallback('@media:missing.page', manifest);

    expect(result).toEqual({
      url: '/images/hotel-img.jpg',
      mobileUrl: null,
      alt: '',
      blurhash: null,
      width: null,
      height: null,
    });
  });

  it('should return fallback for invalid reference format', () => {
    const manifest = createMockManifest();
    const result = resolveMediaRefOrFallback('not-a-media-ref', manifest);

    expect(result).toEqual({
      url: '/images/hotel-img.jpg',
      mobileUrl: null,
      alt: '',
      blurhash: null,
      width: null,
      height: null,
    });
  });

  it('should use custom fallback URL when provided', () => {
    const manifest = createMockManifest();
    const customFallback = '/custom/fallback.jpg';
    const result = resolveMediaRefOrFallback(
      '@media:missing.asset',
      manifest,
      customFallback
    );

    expect(result.url).toBe(customFallback);
  });
});

describe('resolveMediaRefOrThrow', () => {
  const createMockManifest = (): MediaManifest => ({
    cdn: {
      baseUrl: 'https://cdn.example.com',
      transformPath: '/cdn-cgi/image',
    },
    assets: {
      homepage: {
        hero: {
          id: 'hero-001',
          path: '/hotel-123/hero.webp',
          alt: 'Hotel',
        },
      },
    },
  });

  it('should return resolved media when found', () => {
    const manifest = createMockManifest();
    const result = resolveMediaRefOrThrow('@media:homepage.hero', manifest);

    expect(result).toEqual({
      url: 'https://cdn.example.com/hotel-123/hero.webp',
      mobileUrl: null,
      alt: 'Hotel',
      blurhash: null,
      width: null,
      height: null,
    });
  });

  it('should throw error for invalid format', () => {
    const manifest = createMockManifest();

    expect(() => {
      resolveMediaRefOrThrow('invalid-ref', manifest);
    }).toThrow('Failed to resolve media reference: "invalid-ref"');
  });

  it('should throw error when page not found', () => {
    const manifest = createMockManifest();

    expect(() => {
      resolveMediaRefOrThrow('@media:missingpage.hero', manifest);
    }).toThrow('Failed to resolve media reference: "@media:missingpage.hero"');
  });

  it('should throw error when asset not found', () => {
    const manifest = createMockManifest();

    expect(() => {
      resolveMediaRefOrThrow('@media:homepage.missing', manifest);
    }).toThrow('Failed to resolve media reference: "@media:homepage.missing"');
  });

  it('should throw error with the reference in the message', () => {
    const manifest = createMockManifest();

    expect(() => {
      resolveMediaRefOrThrow('@media:test.asset', manifest);
    }).toThrow('Failed to resolve media reference: "@media:test.asset"');
  });
});
