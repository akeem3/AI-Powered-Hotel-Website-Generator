import { HomepageContentSchema, MediaManifestSchema } from '@/lib/content/schemas';
import { z } from 'zod';

/**
 * Story 11.7: Comprehensive Edge Testing
 * Prompt 1: Schema Edge Cases
 *
 * Tests content schema validation with edge cases including:
 * - Empty/Null content
 * - Malformed JSON structure
 * - Boundary values
 * - Special characters (Unicode, emoji, HTML entities, injection patterns)
 * - Variable syntax edge cases
 * - Media reference edge cases
 * - Metadata edge cases
 */

describe('Story 11.7: Schema Edge Cases', () => {
  describe('HomepageContentSchema - Empty/Null Content', () => {
    it('should reject empty object', () => {
      const result = HomepageContentSchema.safeParse({});
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map(i => i.path.join('.'));
        expect(paths).toContain('meta');
        expect(paths).toContain('hero');
      }
    });

    it('should reject null values in required fields', () => {
      const invalidContent = {
        meta: null,
        hero: null,
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should reject undefined required fields', () => {
      const invalidContent = {
        // meta and hero missing
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should reject empty string where non-empty expected', () => {
      const invalidContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: '',  // Empty string, should fail min(1)
          headline: '',  // Empty string, should fail min(1)
        }
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.join('.') === 'hero.title')).toBe(true);
        expect(result.error.issues.some(i => i.path.join('.') === 'hero.headline')).toBe(true);
      }
    });
  });

  describe('HomepageContentSchema - Malformed JSON Structure', () => {
    it('should reject number where string expected', () => {
      const invalidContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 12345,  // Number instead of string
          headline: 'Test Headline'
        }
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should reject array where object expected', () => {
      const invalidContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: [],  // Array instead of object
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });

    it('should reject deeply nested invalid structure', () => {
      const invalidContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Test',
          primaryCTA: {
            text: 'Book',
            href: 12345,  // Invalid: number instead of string
          }
        }
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
    });
  });

  describe('HomepageContentSchema - Boundary Values', () => {
    it('should accept string at exactly min length', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'a',  // min(1) for title
          headline: 'abcdefghij',  // min(10) for headline
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept string at exactly max length', () => {
      const maxTitle = 'a'.repeat(100);
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: maxTitle,  // max(100)
          headline: 'Test Headline'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should reject string 1 char over max length', () => {
      const tooLongTitle = 'a'.repeat(101);
      const invalidContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: tooLongTitle,
          headline: 'Test Headline'
        }
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].code).toBe('too_big');
      }
    });

    it('should accept empty arrays for items', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Test Headline'
        },
        sections: {
          testimonials: {
            heading: 'Reviews',
            testimonials: []  // Empty array
          }
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept very large arrays (100+ items)', () => {
      const testimonials = Array.from({ length: 100 }, (_, i) => ({
        id: `t${i}`,
        customerName: `Customer ${i}`,
        quote: 'Great experience!'
      }));

      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Test Headline'
        },
        sections: {
          testimonials: {
            heading: 'Reviews',
            testimonials
          }
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });
  });

  describe('HomepageContentSchema - Special Characters', () => {
    it('should accept Unicode characters (Japanese)', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'ようこそ',
          headline: '日本語へようこそ'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept Unicode characters (Arabic)', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'مرحباً',
          headline: 'أهلاً بك في فندقنا'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept emoji in content', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Welcome 🏨 to our hotel',
          headline: 'Experience luxury ✨'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept HTML entities', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Hotel & Resort',
          headline: 'Stay < 5 minutes from beach'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept script tags in content (stored, not executed)', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: '<script>alert("xss")</script>',
          headline: 'Test Headline'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
      // Note: Execution prevention is handled during rendering, not schema validation
    });

    it('should accept SQL injection patterns as strings', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: "'; DROP TABLE users; --",
          headline: 'Test Headline'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
      // Note: SQL injection prevention is handled by parameterized queries
    });
  });

  describe('HomepageContentSchema - Variable Syntax Edge Cases', () => {
    it('should accept unmatched opening bracket', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: '{{hotelName',
          headline: 'Test'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept empty variable braces', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: '{{}}',
          headline: 'Test'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept nested variable braces', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: '{{hotel.{{key}}}}',
          headline: 'Test'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept special characters in variable syntax', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: '{{hotel-name}}',
          headline: 'Test'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });
  });

  describe('HomepageContentSchema - Media Reference Edge Cases', () => {
    it('should accept media reference with colon', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Welcome',
          backgroundImage: '@media:homepage.hero'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept empty media reference', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Welcome',
          backgroundImage: '@media:'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept non-existent media reference path', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Welcome',
          backgroundImage: '@media:nonexistent.asset'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept deeply nested media reference', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Welcome',
          backgroundImage: '@media:page.section.subsection.asset'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });
  });

  describe('HomepageContentSchema - Metadata Edge Cases', () => {
    it('should accept future date in generatedAt', () => {
      const futureDate = '2099-12-31T23:59:59Z';
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: futureDate,
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Welcome'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept any locale code format', () => {
      const validContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'xx-XX'  // Invalid but schema accepts any string
        },
        hero: {
          title: 'Test',
          headline: 'Welcome'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should accept any version format', () => {
      const validContent = {
        meta: {
          version: 'invalid-version',
          generatedAt: '2026-01-21T00:00:00Z',
          hotelId: 'test-hotel',
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Welcome'
        }
      };
      const result = HomepageContentSchema.safeParse(validContent);
      expect(result.success).toBe(true);
    });

    it('should reject missing hotelId in metadata', () => {
      const invalidContent = {
        meta: {
          version: '1.0.0',
          generatedAt: '2026-01-21T00:00:00Z',
          // hotelId missing
          locale: 'en'
        },
        hero: {
          title: 'Test',
          headline: 'Welcome'
        }
      };
      const result = HomepageContentSchema.safeParse(invalidContent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.join('.') === 'meta.hotelId')).toBe(true);
      }
    });
  });

  describe('MediaManifestSchema - Edge Cases', () => {
    it('should reject empty object', () => {
      const result = MediaManifestSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject invalid CDN URL', () => {
      const invalidManifest = {
        cdn: {
          baseUrl: 'not-a-valid-url',
          transformPath: '/cdn-cgi/image'
        },
        assets: {}
      };
      const result = MediaManifestSchema.safeParse(invalidManifest);
      expect(result.success).toBe(false);
    });

    it('should accept empty assets object', () => {
      const validManifest = {
        cdn: {
          baseUrl: 'https://cdn.example.com',
          transformPath: '/cdn-cgi/image'
        },
        assets: {}
      };
      const result = MediaManifestSchema.safeParse(validManifest);
      expect(result.success).toBe(true);
    });

    it('should accept numeric asset names', () => {
      const validManifest = {
        cdn: {
          baseUrl: 'https://cdn.example.com',
          transformPath: '/cdn-cgi/image'
        },
        assets: {
          homepage: {
            '123': {
              id: 'asset-123',
              path: '/hotel/image.webp',
              alt: 'Test'
            }
          }
        }
      };
      const result = MediaManifestSchema.safeParse(validManifest);
      expect(result.success).toBe(true);
    });

    it('should accept reserved characters in asset names', () => {
      const validManifest = {
        cdn: {
          baseUrl: 'https://cdn.example.com',
          transformPath: '/cdn-cgi/image'
        },
        assets: {
          homepage: {
            'asset?query=value': {
              id: 'asset-1',
              path: '/hotel/image.webp',
              alt: 'Test'
            }
          }
        }
      };
      const result = MediaManifestSchema.safeParse(validManifest);
      expect(result.success).toBe(true);
    });

    it('should accept blurhash with special characters', () => {
      const validManifest = {
        cdn: {
          baseUrl: 'https://cdn.example.com',
          transformPath: '/cdn-cgi/image'
        },
        assets: {
          homepage: {
            hero: {
              id: 'hero-001',
              path: '/hotel/hero.webp',
              alt: 'Hero',
              blurhash: 'L6Pj0^jE.AyE_3t7t7R**0o#DgR4'
            }
          }
        }
      };
      const result = MediaManifestSchema.safeParse(validManifest);
      expect(result.success).toBe(true);
    });
  });
});
