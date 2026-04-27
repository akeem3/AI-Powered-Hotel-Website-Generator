import { HomepageContentSchema } from '../page-content.schema';
import sampleContent from './fixtures/sample-homepage-content.json';

describe('HomepageContentSchema', () => {
  it('should parse valid homepage content successfully', () => {
    const result = HomepageContentSchema.safeParse(sampleContent);
    expect(result.success).toBe(true);
  });

  it('should fail validation if required fields are missing', () => {
    const invalidContent = {
      meta: {
        version: "1.0.0",
        // missing generatedAt, hotelId, locale
      },
      hero: {
        title: "Missing fields"
        // missing headline
      }
    };
    const result = HomepageContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.map(i => i.path.join('.'));
      expect(issues).toContain('meta.generatedAt');
      expect(issues).toContain('meta.hotelId');
      expect(issues).toContain('meta.locale');
      expect(issues).toContain('hero.headline');
    }
  });

  it('should fail validation for invalid field types', () => {
    const invalidTypes = {
      ...sampleContent,
      hero: {
        ...sampleContent.hero,
        title: 123, // Should be string
      }
    };
    const result = HomepageContentSchema.safeParse(invalidTypes);
    expect(result.success).toBe(false);
  });

  it('should allow optional fields to be omitted', () => {
    const minimalContent = {
      meta: {
        generatedAt: "2026-01-19T18:00:00Z",
        hotelId: "hotel-123",
        locale: "en"
      },
      hero: {
        title: "Minimal Hero",
        headline: "Headline only"
      }
      // navigation, sections, footer are optional
    };
    const result = HomepageContentSchema.safeParse(minimalContent);
    expect(result.success).toBe(true);
  });

  it('should enforce string length constraints', () => {
    const tooLongHeroTitle = 'a'.repeat(101);
    const invalidContent = {
      ...sampleContent,
      hero: {
        ...sampleContent.hero,
        title: tooLongHeroTitle
      }
    };
    const result = HomepageContentSchema.safeParse(invalidContent);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].code).toBe('too_big');
    }
  });

  it('should validate metadata fields correctly', () => {
    const validMeta = {
      version: "2.0.0",
      generatedAt: "now",
      hotelId: "abc",
      locale: "fr"
    };
    const result = HomepageContentSchema.shape.meta.safeParse(validMeta);
    expect(result.success).toBe(true);
  });
});
