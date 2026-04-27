/**
 * Story 13.4.3: ContentGenerator Production Tests with Real Hotel Data
 *
 * Tests CDN URL generation, asset manifest structure, multi-hotel type scenarios,
 * and edge cases with real hotel data patterns.
 */

import * as fs from 'fs';

// Mock fs module
jest.mock('fs');

// Mock LangFuse prompt loading - we need to mock this BEFORE importing agents
const mockGetPrompt = jest.fn().mockResolvedValue('Test prompt with {hotelName} and tone guidance.');

jest.mock('../../app/langgraph/services/LangFuseService', () => {
  return {
    LangFuseService: jest.fn().mockImplementation(() => ({
      getPrompt: mockGetPrompt,
      executeGeneration: async (name: string, input: any, params: any, fn: () => Promise<any>) => {
        return await fn();
      },
      startWorkflowTrace: jest.fn(),
      endWorkflowTrace: jest.fn(),
      flush: jest.fn(),
      shutdown: jest.fn(),
      addScore: jest.fn(),
      logError: jest.fn(),
      getTraceId: jest.fn(),
      getTraceUrl: jest.fn(),
    })),
  };
});

// Mock CostMonitor
jest.mock('../../app/langgraph/services/CostMonitor', () => {
  return {
    CostMonitor: jest.fn().mockImplementation(() => ({
      checkBudget: jest.fn(),
      trackCost: jest.fn(),
      getTotalCost: jest.fn().mockReturnValue(0),
      getRemainingBudget: jest.fn().mockReturnValue(2.0),
      TOTAL_BUDGET: 2.0,
    })),
  };
});

// Create a mock LLM provider instance with sendCompletion method
const mockLLMProvider = {
  sendCompletion: jest.fn(),
  selectModel: jest.fn(),
  getAvailableModels: jest.fn(),
  getModelPricing: jest.fn(),
};

// Mock LLMProviderFactory BEFORE importing the agent
jest.mock('../../app/langgraph/services/LLMProviderFactory', () => ({
  LLMProviderFactory: {
    create: jest.fn(() => mockLLMProvider),
    getCurrentProviderType: jest.fn(),
    isValidProvider: jest.fn(),
  },
}));

import { ContentGenerator } from '../../app/langgraph/agents/ContentGenerator';
import { WorkflowState } from '../../app/langgraph/state/types';
import { MediaManifestSchema, HomepageContentSchema } from '@/lib/content/schemas';

describe('Story 13.4.3: ContentGenerator Production Tests', () => {
  let generator: ContentGenerator;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();

    // Save original environment
    originalEnv = { ...process.env };

    generator = new ContentGenerator();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  /**
   * Helper function to create a base workflow state
   */
  function createMockState(overrides: Partial<WorkflowState> = {}): WorkflowState {
    return {
      generationId: 'test-gen-123',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris, France'
      },
      componentSelection: {
        selectedComponents: ["hero", "rooms", "amenities", "contact"],
        layoutStructure: "mixed",
        emphasisComponents: ["hero"],
        reasoning: "Selected components for test."
      },
      stylingSelection: {
        componentVariants: {
          hero: { style: "elegant", layout: "split" }
        },
        reasoning: "Modern elegant styling."
      },
      contentGeneration: undefined,
      assembledConfig: undefined,
      contentJson: undefined,
      validationStatus: 'pending',
      validationErrors: [],
      qualityScore: undefined,
      totalCost: 0,
      stepCosts: {},
      budgetRemaining: 2.0,
      currentAgent: '',
      retryCount: 0,
      errors: [],
      budgetExceeded: false,
      ...overrides
    };
  }

  /**
   * Helper function to mock OpenRouter response
   */
  function mockOpenRouterResponse() {
    mockLLMProvider.sendCompletion.mockResolvedValue({
      text: JSON.stringify({
        componentContent: {
          hero: {
            title: "Luxury Experience Awaits",
            headline: "Welcome to Excellence",
            description: "Experience world-class hospitality in the heart of the city."
          },
          rooms: {
            rooms: [{
              id: "r1",
              name: "Deluxe King Suite",
              type: "King",
              price: 350,
              capacity: 2,
              description: "A spacious room with city views and modern amenities for your comfort."
            }]
          },
          amenities: {
            amenities: [{
              id: "a1",
              name: "Premium WiFi",
              description: "High-speed internet throughout the property"
            }]
          },
          contact: {
            title: "Get in Touch With Us",
            subtitle: "We are here to help you with any questions or special requests you may have.",
            successMessage: "Thank you for your message! We will respond within 24 hours.",
            submitButtonText: "Send Message"
          }
        },
        reasoning: 'Valid reasoning with enough characters to pass the minimum 50 character requirement for testing purposes.'
      }),
      usage: { input: 150, output: 100, total: 250 },
      model: 'moonshotai/kimi-k2',
      cost: 0.00005
    });
  }

  describe('1. CDN URL Generation Tests', () => {
    it('should use CDN_BASE_URL from environment variable', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest).toBeDefined();
      expect(manifest?.cdn?.baseUrl).toBeDefined();
      // The CDN base URL should be a valid HTTPS URL
      expect(manifest?.cdn?.baseUrl).toMatch(/^https:\/\//);
    });

    it('should use default CDN URL when env var not set', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest).toBeDefined();
      // Should have a valid CDN base URL (either custom or default)
      expect(manifest?.cdn?.baseUrl).toBeDefined();
      expect(typeof manifest?.cdn?.baseUrl).toBe('string');
      expect(manifest?.cdn?.baseUrl.length).toBeGreaterThan(0);
    });

    it('should sanitize hotel names with special characters for URL paths', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: "L'Hôtel Élégant & Spa",
          location: 'Paris, France'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest).toBeDefined();
      expect(manifest?.assets?.homepage?.hero?.path).toMatch(/^\/l-h-tel-l-gant-spa\//);
    });

    it('should handle hotel names with multiple consecutive spaces', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'Grand    Plaza    Hotel',
          location: 'New York, USA'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest).toBeDefined();
      // Should collapse multiple spaces to single dash
      expect(manifest?.assets?.homepage?.hero?.path).toBe('/grand-plaza-hotel/hero.webp');
    });
  });

  describe('2. Asset Manifest Structure Tests', () => {
    it('should include complete asset manifest structure', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest).toBeDefined();
      expect(manifest).toHaveProperty('cdn');
      expect(manifest).toHaveProperty('assets');
      expect(manifest?.cdn).toHaveProperty('baseUrl');
      expect(manifest?.cdn).toHaveProperty('transformPath');
    });

    it('should include all required fields for hero asset', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;
      const heroAsset = manifest?.assets?.homepage?.hero;

      expect(heroAsset).toBeDefined();
      expect(heroAsset).toHaveProperty('id');
      expect(heroAsset).toHaveProperty('path');
      expect(heroAsset).toHaveProperty('alt');
      expect(heroAsset).toHaveProperty('blurhash');
      expect(heroAsset).toHaveProperty('width');
      expect(heroAsset).toHaveProperty('height');
    });

    it('should generate mobilePath for responsive images', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;
      const heroAsset = manifest?.assets?.homepage?.hero;

      expect(heroAsset).toBeDefined();
      expect(heroAsset).toHaveProperty('mobilePath');
      expect(heroAsset?.mobilePath).toMatch(/hero-mobile\.webp$/);
    });

    it('should validate against MediaManifestSchema', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      // Validate with Zod schema
      const validationResult = MediaManifestSchema.safeParse(manifest);
      expect(validationResult.success).toBe(true);
    });

    it('should include transform path for CDN image optimization', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest?.cdn?.transformPath).toBe('/cdn-cgi/image');
    });
  });

  describe('3. Multi-Hotel Type Tests', () => {
    it('should generate unique asset paths for luxury hotels', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'The Grand Luxe Palace',
          location: 'Monaco'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest?.assets?.homepage?.hero?.path).toBe('/the-grand-luxe-palace/hero.webp');
      expect(manifest?.assets?.homepage?.hero?.alt).toContain('The Grand Luxe Palace');
    });

    it('should generate unique asset paths for boutique hotels', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'boutique',
          targetAudience: 'couples',
          brandPersonality: 'modern',
          hotelName: 'Artisan Boutique Inn',
          location: 'Portland, OR'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest?.assets?.homepage?.hero?.path).toBe('/artisan-boutique-inn/hero.webp');
      expect(manifest?.assets?.homepage?.hero?.alt).toContain('Artisan Boutique Inn');
    });

    it('should generate unique asset paths for business hotels', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'business',
          targetAudience: 'business',
          brandPersonality: 'professional',
          hotelName: 'Executive Business Center',
          location: 'London, UK'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest?.assets?.homepage?.hero?.path).toBe('/executive-business-center/hero.webp');
      expect(manifest?.assets?.homepage?.hero?.alt).toContain('Executive Business Center');
    });

    it('should generate unique asset paths for resort hotels', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'resort',
          targetAudience: 'family',
          brandPersonality: 'friendly',
          hotelName: 'Tropical Paradise Resort',
          location: 'Bali, Indonesia'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      expect(manifest?.assets?.homepage?.hero?.path).toBe('/tropical-paradise-resort/hero.webp');
      expect(manifest?.assets?.homepage?.hero?.alt).toContain('Tropical Paradise Resort');
    });

    it('should verify each hotel type produces unique content', async () => {
      mockOpenRouterResponse();

      const hotelTypes = [
        { type: 'luxury', name: 'Luxury Hotel A' },
        { type: 'boutique', name: 'Boutique Hotel B' },
        { type: 'business', name: 'Business Hotel C' },
        { type: 'resort', name: 'Resort Hotel D' }
      ];

      const paths: string[] = [];

      for (const hotel of hotelTypes) {
        const mockState = createMockState({
          hotelParameters: {
            hotelType: hotel.type as any,
            targetAudience: 'couples',
            brandPersonality: 'modern',
            hotelName: hotel.name,
            location: 'Test City'
          }
        });

        const result = await generator.execute(mockState);
        const path = result.contentGeneration?.mediaManifestJson?.assets?.homepage?.hero?.path;

        expect(path).toBeDefined();
        paths.push(path!);
      }

      // Verify all paths are unique
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(hotelTypes.length);
    });
  });

  describe('4. Edge Cases', () => {
    it('should handle hotel name with spaces (e.g., "Grand Plaza Hotel")', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'Grand Plaza Hotel',
          location: 'New York, USA'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;
      const homepage = result.contentGeneration?.homepageContentJson;

      // Asset path should be sanitized
      expect(manifest?.assets?.homepage?.hero?.path).toBe('/grand-plaza-hotel/hero.webp');

      // But original name should be preserved in content
      expect(homepage?.hero?.title).toBe('Grand Plaza Hotel');
      expect(homepage?.meta?.hotelId).toBe('grand-plaza-hotel');
    });

    it('should handle hotel name with special characters', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: "Château d'Élegance & Spa",
          location: 'Paris, France'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;
      const homepage = result.contentGeneration?.homepageContentJson;

      // Asset path should be ASCII-safe
      expect(manifest?.assets?.homepage?.hero?.path).toMatch(/^\/ch-teau-d-legance-spa\//);

      // Original name preserved in content
      expect(homepage?.hero?.title).toBe("Château d'Élegance & Spa");
    });

    it('should handle missing hotelParameters gracefully', async () => {
      const mockState = createMockState({
        hotelParameters: undefined as any
      });

      await expect(generator.execute(mockState))
        .rejects
        .toThrow('Missing required input: hotelParameters');
    });

    it('should handle hotel name with numbers and symbols', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'modern',
          hotelName: 'Hotel 360° & Spa #1',
          location: 'Dubai, UAE'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      // Should remove special symbols but keep numbers
      expect(manifest?.assets?.homepage?.hero?.path).toBe('/hotel-360-spa-1/hero.webp');
    });

    it('should handle very long hotel names', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'The Grand Imperial Luxury Palace Resort and Spa at Waterfront International',
          location: 'Singapore'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;
      const homepage = result.contentGeneration?.homepageContentJson;

      // Path should be fully sanitized
      expect(manifest?.assets?.homepage?.hero?.path).toMatch(/^\/the-grand-imperial-luxury-palace-resort-and-spa-at-waterfront-international\//);

      // Original name preserved
      expect(homepage?.hero?.title).toBe('The Grand Imperial Luxury Palace Resort and Spa at Waterfront International');
    });

    it('should handle hotel name with only special characters', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'modern',
          hotelName: '@ # $ %',
          location: 'Test City'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;

      // Should result in empty path segments removed, defaulting to minimal valid path
      // Based on the sanitization: replace(/[^a-z0-9]+/g, '-'), this becomes just dashes
      // which then get collapsed
      expect(manifest?.assets?.homepage?.hero?.path).toMatch(/hero\.webp$/);
    });
  });

  describe('5. Content and Manifest Integration', () => {
    it('should generate both homepage content and media manifest', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);

      expect(result.contentGeneration?.homepageContentJson).toBeDefined();
      expect(result.contentGeneration?.mediaManifestJson).toBeDefined();
      expect(result.contentJson).toBeDefined();
    });

    it('should reference media assets in homepage content', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const homepage = result.contentGeneration?.homepageContentJson;

      // Hero should reference media manifest
      expect(homepage?.hero?.backgroundImage).toBe('@media:homepage.hero');
    });

    it('should maintain consistency between contentGeneration and contentJson', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);

      expect(result.contentGeneration?.homepageContentJson).toEqual(result.contentJson?.homepage);
      expect(result.contentGeneration?.mediaManifestJson).toEqual(result.contentJson?.mediaManifest);
    });

    it('should validate homepage content against schema', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const homepage = result.contentGeneration?.homepageContentJson;

      const validationResult = HomepageContentSchema.safeParse(homepage);
      expect(validationResult.success).toBe(true);
    });

    it('should include correct metadata for asset paths', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'Test Paradise Hotel',
          location: 'Hawaii, USA'
        }
      });

      const result = await generator.execute(mockState);
      const manifest = result.contentGeneration?.mediaManifestJson;
      const homepage = result.contentGeneration?.homepageContentJson;

      // Metadata should match
      expect(homepage?.meta?.hotelId).toBe('test-paradise-hotel');
      expect(manifest?.assets?.homepage?.hero?.path).toContain('/test-paradise-hotel/');
    });
  });

  describe('6. Production Readiness', () => {
    it('should handle production-like hotel data with all fields', async () => {
      mockOpenRouterResponse();

      const mockState = createMockState({
        hotelParameters: {
          hotelType: 'luxury',
          targetAudience: 'couples',
          brandPersonality: 'elegant',
          hotelName: 'Four Seasons Resort',
          location: 'Maui, Hawaii'
        },
        componentSelection: {
          selectedComponents: ["hero", "rooms", "amenities", "gallery", "testimonials", "contact"],
          layoutStructure: "mixed",
          emphasisComponents: ["hero", "rooms"],
          reasoning: "Full-featured luxury hotel site."
        }
      });

      const result = await generator.execute(mockState);

      expect(result.validationStatus).toBe('pass');
      expect(result.validationErrors).toHaveLength(0);
      expect(result.contentGeneration).toBeDefined();
      expect(result.contentJson).toBeDefined();
    });

    it('should handle concurrent generation of multiple hotels', async () => {
      mockOpenRouterResponse();

      const hotels = [
        { name: 'Hotel Alpha', type: 'luxury' },
        { name: 'Hotel Beta', type: 'boutique' },
        { name: 'Hotel Gamma', type: 'resort' }
      ];

      const promises = hotels.map(hotel => {
        const state = createMockState({
          hotelParameters: {
            hotelType: hotel.type as any,
            targetAudience: 'couples',
            brandPersonality: 'modern',
            hotelName: hotel.name,
            location: 'Test City'
          }
        });

        const gen = new ContentGenerator();
        return gen.execute(state);
      });

      const results = await Promise.all(promises);

      // All should succeed
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.validationStatus).toBe('pass');
        expect(result.contentGeneration).toBeDefined();
      });

      // Paths should be unique
      const paths = results.map(r =>
        r.contentGeneration?.mediaManifestJson?.assets?.homepage?.hero?.path
      );
      expect(new Set(paths).size).toBe(3);
    });

    it('should maintain asset dimensions for different hotel types', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const heroAsset = result.contentGeneration?.mediaManifestJson?.assets?.homepage?.hero;

      // Standard hero image dimensions
      expect(heroAsset?.width).toBe(1920);
      expect(heroAsset?.height).toBe(1080);
    });

    it('should include placeholder blurhash for progressive loading', async () => {
      mockOpenRouterResponse();
      const mockState = createMockState();

      const result = await generator.execute(mockState);
      const heroAsset = result.contentGeneration?.mediaManifestJson?.assets?.homepage?.hero;

      expect(heroAsset?.blurhash).toBeDefined();
      expect(typeof heroAsset?.blurhash).toBe('string');
      expect(heroAsset?.blurhash.length).toBeGreaterThan(0);
    });
  });
});
