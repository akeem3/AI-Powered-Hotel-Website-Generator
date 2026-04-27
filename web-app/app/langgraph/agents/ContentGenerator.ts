import { BaseAgent } from './BaseAgent';
import { WorkflowState, ContentJsonOutput } from '../state/types';
import {
  ContentGeneratorOutputSchema,
  ContentGeneratorOutput
} from './schemas';
import { HomepageContentSchema, MediaManifestSchema } from '@/lib/content/schemas';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';

/**
 * CDN base URL for asset delivery.
 * Configurable via NEXT_PUBLIC_CDN_BASE_URL environment variable.
 * @default 'https://cdn.hotelwebsites.ai'
 */
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || 'https://cdn.hotelwebsites.ai';

/**
 * Default blurhash for placeholder images.
 * In production, blurhash should be pre-computed during image upload.
 * @see https://blurha.sh/ for generation
 */
const PLACEHOLDER_BLURHASH = 'L6Pj0^jE.8WB~qof9FWBIUayRjWB';

/**
 * ContentGenerator Agent
 *
 * Responsible for generating brand-aligned textual content for all selected
 * hotel homepage components based on hotel parameters, component selection,
 * and styling variants.
 *
 * ## Story 11.6: JSON Content Generation
 *
 * This agent now generates structured JSON content files for runtime updates:
 *
 * ### Locale Generation (Story 11.6, Prompt 4)
 *
 * **Current Implementation:** English only (locale: 'en')
 *
 * **Rationale:**
 * - Budget allocation: $0.80 (40% of $2.00 total workflow budget)
 * - Generating 4 locales (en, es, fr, de) would cost ~4x = ~$3.20
 * - Exceeds total budget, not economically viable for batch generation
 *
 * **Future Implementation (Epic 13):**
 * - Epic 13 will integrate DeepL API for automated translations
 * - Translation will be a post-processing step after English content generation
 * - Architecture supports extending to localizedContent: Record<Locale, HomepageContent>
 * - No breaking changes required - additive enhancement only
 *
 * **Output Structure (Ready for Multi-Locale):**
 * - homepageContentJson: Currently returns English content
 * - Future: Could return { en: HomepageContent, es: HomepageContent, ... }
 * - Media manifest is locale-agnostic (same across all languages)
 *
 * **Cost Tracking:**
 * - English generation: ~$0.20 (within $0.80 allocation)
 * - Epic 13 translation cost: Separate budget allocation, tracked in LangFuse
 *
 * @see docs/stories/prompts/story-11.6-langgraph-integration.md (Prompt 4)
 * @see docs/epics/epic-11.content_json-content-system_ready_2026-01-14.md
 */
export class ContentGenerator extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('ContentGenerator', langfuseService, costMonitor);
  }

  /**
   * Get the name of this agent.
   */
  getAgentName(): string {
    return 'ContentGenerator';
  }

  /**
   * Main execution logic for the ContentGenerator.
   * 
   * @param state - The current workflow state
   * @returns Partial state update
   */
  async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    // Input validation
    this.validateInputs(state);

    // Prompt loading & substitution via Langfuse
    const toneGuidance = this.getToneMapping(state.hotelParameters!.brandPersonality);

    // Strip 'reasoning' fields to reduce prompt size and focus LLM on data
    const { reasoning: selection_r, ...cleanSelection } = state.componentSelection!;
    const { reasoning: styling_r, ...cleanVariants } = state.stylingSelection!;

    const prompt = await this.loadPrompt('content-generator', {
      ...state.hotelParameters!,
      toneGuidance,
      agent1Output: cleanSelection,
      agent2Output: cleanVariants
    });

    // Call OpenRouter with intelligent routing and retries
    // Note: maxTokens increased from 3000 to 8000 to accommodate multi-component JSON responses
    // (9 components × ~500-700 tokens each = ~4500-6300 tokens minimum)
    const response = await this.openRouterClient.sendCompletion(
      [{ role: 'user', content: prompt }],
      {
        agentName: this.agentName,
        budgetRemaining: state.budgetRemaining ?? CostMonitor.TOTAL_BUDGET,
        maxTokens: 8000
      }
    );

    // Extract and validate JSON from response
    try {
      const jsonContent = this.extractJson(response.text);
      const validated = ContentGeneratorOutputSchema.parse(jsonContent);

      // Additional content constraint validation (AC4/AC5)
      this.validateContentConstraints(validated);

      // NEW for Story 11.6: Generate JSON content files and media manifest
      const homepageContentJson = this.generateHomepageContentJson(state, validated);
      const mediaManifestJson = this.generateMediaManifest(state);

      // Validate JSON content against schemas
      const validatedHomepage = homepageContentJson ?
        HomepageContentSchema.parse(homepageContentJson) : null;
      const validatedManifest = mediaManifestJson ?
        MediaManifestSchema.parse(mediaManifestJson) : null;

      // Log validation results
      if (process.env.NODE_ENV === 'development') {
        if (validatedHomepage) {
          console.log(`[${this.agentName}] Generated homepageContentJson for hotel: ${state.hotelParameters?.hotelName}`);
        }
        if (validatedManifest) {
          console.log(`[${this.agentName}] Generated mediaManifest with ${Object.keys(validatedManifest.assets || {}).length} asset groups`);
        }
      }

      const stateUpdate = this.updateStepCost(response.cost);

      // Story 11.6: Populate contentJson for file output (Prompt 5)
      // This convenience field makes JSON content accessible for file writing
      const contentJson: ContentJsonOutput | undefined = (validatedHomepage && validatedManifest) ? {
        homepage: validatedHomepage,
        localizedHomepage: {}, // Epic 13: Add es, fr, de translations here
        mediaManifest: validatedManifest
      } : undefined;

      return {
        ...stateUpdate,
        contentGeneration: {
          ...validated,
          homepageContentJson: validatedHomepage || undefined,
          mediaManifestJson: validatedManifest || undefined,
        },
        contentJson, // Story 11.6: Added for file output integration
        validationStatus: 'pass',
        validationErrors: [],
        usage: response.usage,
        model: response.model
      };
    } catch (error: any) {
      console.error(`[${this.agentName}] Failed to parse or validate LLM output:`, error.message);
      throw new Error(`${this.agentName} output validation failed: ${error.message}`);
    }
  }

  /**
   * Validates that all required inputs are present in the state.
   */
  private validateInputs(state: WorkflowState): void {
    if (!state.hotelParameters) {
      throw new Error('[ContentGenerator] Missing required input: hotelParameters');
    }
    if (!state.componentSelection) {
      throw new Error('[ContentGenerator] Missing required input: componentSelection');
    }
    if (!state.stylingSelection) {
      throw new Error('[ContentGenerator] Missing required input: stylingSelection');
    }
  }

  /**
   * Maps brand personality to specific tone and vocabulary guidelines.
   * Ensures AC2 compliance.
   */
  private getToneMapping(personality: string): string {
    const mappings: Record<string, string> = {
      elegant: "Tone: Sophisticated, refined, exclusive. Vocabulary: 'Excellence', 'Curated', 'Bespoke', 'Unparalleled', 'Luxurious'. Focus: Premium experience, attention to detail.",
      modern: "Tone: Clean, innovative, forward-thinking. Vocabulary: 'Discover', 'Experience', 'Innovative', 'Seamless', 'Curated'. Focus: Unique design, contemporary comfort.",
      friendly: "Tone: Warm, welcoming, approachable. Vocabulary: 'Welcome', 'Comfort', 'Home', 'Perfect', 'Friendly'. Focus: Value for money, comfort, family-friendly.",
      professional: "Tone: Efficient, trustworthy, competent. Vocabulary: 'Efficiency', 'Productivity', 'Professional', 'Convenient', 'Premier'. Focus: Business needs, efficiency, reliability.",
      adventurous: "Tone: Exciting, energetic, experiential. Vocabulary: 'Adventure', 'Discover', 'Explore', 'Unforgettable', 'Thrilling'. Focus: Experiences, activities, unique adventures."
    };

    return mappings[personality] || mappings.modern;
  }

  /**
   * Validates content length constraints per AC4/AC5.
   * Enforces specific character limits for all component types.
   */
  private validateContentConstraints(output: ContentGeneratorOutput): void {
    const content = output.componentContent;
    
    // Limits based on Story 7.5 AC and Epic 2 ZOD schemas
    const LIMITS = {
      hero: { title: { min: 10, max: 60 }, description: { max: 500 } },
      testimonial: { quote: { min: 20, max: 500 }, name: { min: 2, max: 50 } },
      amenity: { name: { min: 2, max: 30 }, description: { max: 100 } },
      room: { name: { min: 1, max: 100 }, description: { min: 50, max: 500 } },
      gallery: { alt: { min: 5, max: 100 } },
      contact: { title: { min: 10, max: 100 }, subtitle: { min: 20, max: 200 } }
    };

    for (const [compId, data] of Object.entries(content)) {
      if (compId === 'hero') {
        const headline = data.headline || data.title;
        if (headline && (headline.length < LIMITS.hero.title.min || headline.length > LIMITS.hero.title.max)) {
          throw new Error(`Hero heading/title must be between ${LIMITS.hero.title.min} and ${LIMITS.hero.title.max} characters`);
        }
        if (data.description && data.description.length > LIMITS.hero.description.max) {
          throw new Error(`Hero description must be max ${LIMITS.hero.description.max} characters`);
        }
      }
      
      if (data.testimonials) {
        for (const t of data.testimonials) {
          if (t.quote.length < LIMITS.testimonial.quote.min || t.quote.length > LIMITS.testimonial.quote.max) {
            throw new Error(`Testimonial quote must be between ${LIMITS.testimonial.quote.min} and ${LIMITS.testimonial.quote.max} characters`);
          }
          if (t.customerName.length < LIMITS.testimonial.name.min || t.customerName.length > LIMITS.testimonial.name.max) {
            throw new Error(`Testimonial customer name must be between ${LIMITS.testimonial.name.min} and ${LIMITS.testimonial.name.max} characters`);
          }
        }
      }

      if (data.rooms) {
        for (const r of data.rooms) {
          if (r.name.length < LIMITS.room.name.min || r.name.length > LIMITS.room.name.max) {
            throw new Error(`Room name must be between ${LIMITS.room.name.min} and ${LIMITS.room.name.max} characters`);
          }
          if (r.description && (r.description.length < LIMITS.room.description.min || r.description.length > LIMITS.room.description.max)) {
            throw new Error(`Room description must be between ${LIMITS.room.description.min} and ${LIMITS.room.description.max} characters`);
          }
        }
      }

      if (data.amenities) {
        for (const a of data.amenities) {
          if (a.name.length < LIMITS.amenity.name.min || a.name.length > LIMITS.amenity.name.max) {
            throw new Error(`Amenity name must be between ${LIMITS.amenity.name.min} and ${LIMITS.amenity.name.max} characters`);
          }
          if (a.description && a.description.length > LIMITS.amenity.description.max) {
            throw new Error(`Amenity description must be max ${LIMITS.amenity.description.max} characters`);
          }
        }
      }

      if (data.images) {
        for (const img of data.images) {
          if (img.alt.length < LIMITS.gallery.alt.min || img.alt.length > LIMITS.gallery.alt.max) {
            throw new Error(`Gallery alt text must be between ${LIMITS.gallery.alt.min} and ${LIMITS.gallery.alt.max} characters`);
          }
        }
      }

      // Contact form constraints (title/subtitle already validated by ZOD if present, but good to be explicit)
      if (compId === 'contact') {
        if (data.title && (data.title.length < LIMITS.contact.title.min || data.title.length > LIMITS.contact.title.max)) {
          throw new Error(`Contact title must be between ${LIMITS.contact.title.min} and ${LIMITS.contact.title.max} characters`);
        }
        if (data.subtitle && (data.subtitle.length < LIMITS.contact.subtitle.min || data.subtitle.length > LIMITS.contact.subtitle.max)) {
          throw new Error(`Contact subtitle must be between ${LIMITS.contact.subtitle.min} and ${LIMITS.contact.subtitle.max} characters`);
        }
      }
    }
  }

  /**
   * Generates homepage content JSON in HomepageContentSchema format.
   * Converts the componentContent output to structured JSON format.
   *
   * **Locale Support (Story 11.6, Prompt 4):**
   * - Currently generates English content only (locale: 'en')
   * - Epic 13 will add translateContent() function for es, fr, de locales
   * - Extension point: After generating English content, call translation API
   * - Output structure: Can be extended to return Record<Locale, HomepageContent>
   *
   * **Future Enhancement (Epic 13):**
   * ```typescript
   * // Extension point for multi-locale support
   * const englishContent = this.generateHomepageContentJson(state, validated);
   * const localizedContent: Record<Locale, HomepageContent> = {
   *   en: englishContent,
   *   es: await this.translateContent(englishContent, 'es'),
   *   fr: await this.translateContent(englishContent, 'fr'),
   *   de: await this.translateContent(englishContent, 'de'),
   * };
   * ```
   *
   * @param state - The current workflow state
   * @param validated - The validated ContentGeneratorOutput
   * @returns HomepageContent object matching HomepageContentSchema (English only)
   *
   * @example
   * // Input: validated.componentContent.hero
   * // Output: { meta: {...}, hero: {...}, sections: {...}, navigation: {...} }
   */
  private generateHomepageContentJson(
    state: WorkflowState,
    validated: ContentGeneratorOutput
  ): Record<string, any> | null {
    if (!state.hotelParameters) {
      return null;
    }

    const hotelName = state.hotelParameters.hotelName;
    const location = state.hotelParameters.location;
    const sanitizedName = hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Extract hero content from componentContent
    const heroContent = validated.componentContent['hero'] || {};
    const contactContent = validated.componentContent['contact'] || {};
    const testimonialsContent = validated.componentContent['testimonials'] || {};
    const amenitiesContent = validated.componentContent['amenities'] || {};

    // Build navigation content from selected components
    const navigationContent = this.buildNavigationContent(state);

    // Build sections content based on selected components
    const sectionsContent: Record<string, any> = {};

    // Add amenities section if selected
    if (amenitiesContent.amenities && amenitiesContent.amenities.length > 0) {
      sectionsContent.amenities = {
        heading: 'World-Class Amenities',
        subheading: 'Everything you need for a perfect stay'
      };
    }

    // Add testimonials section if selected
    if (testimonialsContent.testimonials && testimonialsContent.testimonials.length > 0) {
      sectionsContent.testimonials = {
        heading: 'What Our Guests Say',
        subheading: 'Read reviews from our satisfied customers'
      };
    }

    // Add contact section
    sectionsContent.contact = {
      title: contactContent.title || 'Contact Us',
      fields: {
        name: { label: 'Full Name', placeholder: 'Enter your name' },
        email: { label: 'Email Address', placeholder: 'your.email@example.com' },
        phone: { label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
        subject: {
          label: 'Subject',
          placeholder: 'How can we help you?',
          options: {
            reservations: 'Reservations',
            inquiry: 'General Inquiry',
            feedback: 'Feedback',
            complaint: 'Complaint',
            other: 'Other'
          }
        },
        message: { label: 'Message', placeholder: 'Type your message here...' }
      },
      submitButton: {
        text: contactContent.submitButtonText || 'Send Message',
        loadingText: 'Sending...'
      },
      messages: {
        success: contactContent.successMessage || 'Thank you for your message! We will respond within 24 hours.',
        error: 'Sorry, there was an error sending your message. Please try again.'
      }
    };

    // Build footer content
    const footerContent = {
      copyright: `© ${new Date().getFullYear()} ${hotelName}. All rights reserved.`
    };

    // Return structured HomepageContent
    return {
      meta: {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        hotelId: sanitizedName,
        locale: 'en'
      },
      hero: {
        tagline: heroContent.tagline || 'Experience Luxury',
        title: hotelName,
        headline: heroContent.headline || `${hotelName} - Excellence Awaits`,
        description: heroContent.description || `Experience world-class hospitality at ${hotelName} in ${location}.`,
        backgroundImage: '@media:homepage.hero',
        primaryCTA: heroContent.primaryCTA || {
          text: 'Book Your Stay',
          href: '/booking',
          ariaLabel: `Book your stay at ${hotelName}`
        },
        secondaryCTA: heroContent.secondaryCTA || {
          text: 'Explore Rooms',
          href: '/rooms',
          ariaLabel: `Explore our room options at ${hotelName}`
        },
        imageAlt: heroContent.image || `Beautiful view of ${hotelName}`
      },
      navigation: navigationContent,
      sections: sectionsContent,
      footer: footerContent
    };
  }

  /**
   * Builds navigation content from selected components.
   */
  private buildNavigationContent(state: WorkflowState): Record<string, any> {
    const components = state.componentSelection?.selectedComponents || [];

    // Build links array from selected components
    const links = [];
    if (components.includes('rooms')) links.push({ href: '/rooms', label: 'Rooms' });
    if (components.includes('amenities')) links.push({ href: '/amenities', label: 'Amenities' });
    if (components.includes('testimonials')) links.push({ href: '/testimonials', label: 'Reviews' });
    if (components.includes('contact')) links.push({ href: '/contact', label: 'Contact' });
    if (components.includes('booking')) links.push({ href: '/booking', label: 'Book Now' });

    return {
      links,
      logo: {
        ariaLabel: `${state.hotelParameters?.hotelName || 'Hotel'} - Home`,
        text: state.hotelParameters?.hotelName?.substring(0, 3).toUpperCase() || 'HTL',
        initials: state.hotelParameters?.hotelName?.substring(0, 3).toUpperCase() || 'HTL'
      },
      cta: {
        text: 'Book Now'
      }
    };
  }

  /**
   * Generates media manifest JSON in MediaManifestSchema format.
   *
   * @param state - The current workflow state
   * @returns MediaManifest object matching MediaManifestSchema
   *
   * @example
   * // Returns:
   * {
   *   cdn: { baseUrl: "https://cdn.hotelwebsites.ai" },
   *   assets: { homepage: { hero: { id, path, alt, blurhash } } }
   * }
   */
  private generateMediaManifest(state: WorkflowState): Record<string, any> {
    const sanitizedName = state.hotelParameters?.hotelName?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'hotel';

    return {
      cdn: {
        baseUrl: CDN_BASE_URL,
        transformPath: '/cdn-cgi/image'
      },
      assets: {
        homepage: {
          hero: {
            id: 'hero-placeholder',
            path: `/${sanitizedName}/hero.webp`,
            mobilePath: `/${sanitizedName}/hero-mobile.webp`,
            alt: `${state.hotelParameters?.hotelName} hero image`,
            blurhash: PLACEHOLDER_BLURHASH, // Pre-computed during image upload
            width: 1920,
            height: 1080
          }
        }
      }
    };
  }

  /**
   * Validates blurhash format (basic validation).
   *
   * @param hash - The blurhash string to validate
   * @returns true if valid format
   *
   * @example
   * isValidBlurhash('L6Pj0^jE.8WB~qof9FWBIUayRjWB') // true
   * isValidBlurhash('abc') // false (too short)
   */
  private isValidBlurhash(hash: string): boolean {
    // Blurhash must be at least 6 characters
    return typeof hash === 'string' && hash.length >= 6;
  }
}
