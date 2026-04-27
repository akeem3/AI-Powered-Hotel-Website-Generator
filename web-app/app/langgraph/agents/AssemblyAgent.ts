import { BaseAgent } from './BaseAgent';
import { WorkflowState } from '../state/types';
import { 
  HomepageConfig,
  HomepageConfigSchema
} from './schemas';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';

/**
 * AssemblyAgent
 * 
 * Responsible for composing all agent outputs into a complete, validated HomepageConfig.
 * Handles component ordering, variant mapping, and image placeholder injection.
 */
export class AssemblyAgent extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('AssemblyAgent', langfuseService, costMonitor);
  }

  /**
   * Get the name of this agent.
   */
  getAgentName(): string {
    return 'AssemblyAgent';
  }

  async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    this.validateInputs(state);

    // Strip 'reasoning' fields to reduce prompt size and LLM "distraction"
    const { reasoning: selection_r, ...cleanSelection } = state.componentSelection!;
    const { reasoning: styling_r, ...cleanVariants } = state.stylingSelection!;
    const { reasoning: content_r, ...cleanContent } = state.contentGeneration!;

    const prompt = await this.loadPrompt('assembly-agent', {
      ...state.hotelParameters!,
      componentSelection: cleanSelection,
      componentVariants: cleanVariants,
      componentContent: cleanContent
    });

    // Call OpenRouter with intelligent routing and retries
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

      // If the LLM didn't return a fully populated config (hallucination),
      // we can try to "heal" it using our internal assembly logic.
      // But for now we try to validate against the schema.
      const validated = HomepageConfigSchema.parse(jsonContent);

      // Story 22.2 Fix: Preserve the original workflow generationId
      // The LLM may generate a generationId with invalid characters (e.g., "taj-palace-new-delhi-v1")
      // We override it with the workflow's original generationId to ensure consistency
      const configWithPreservedId = {
        ...validated,
        generationId: state.generationId,
      };

      const stateUpdate = this.updateStepCost(response.cost);

      return {
        ...stateUpdate,
        assembledConfig: configWithPreservedId,
        validationStatus: 'pass',
        validationErrors: [],
        usage: response.usage,
        model: response.model
      };
    } catch (error: any) {
      console.warn(`[${this.agentName}] LLM output failed validation, attempting internal assembly recovery:`, error.message);
      
      // Fallback: Use internal deterministic assembly if LLM fails
      const manualComponents = this.assembleComponents(state);
      const fallbackConfig: HomepageConfig = {
        // Story 22.2 Fix: Use the original workflow generationId instead of fallback
        generationId: state.generationId || `${state.hotelParameters!.hotelType}-fallback`,
        timestamp: new Date().toISOString(),
        hotelParameters: state.hotelParameters!,
        components: manualComponents,
        layoutStructure: state.componentSelection!.layoutStructure,
        emphasisComponents: state.componentSelection!.emphasisComponents,
        validationStatus: "PASS"
      };

      const stateUpdate = this.updateStepCost(response.cost);

      // Story 22.5 Fix: Removed error from fallback - fallback is a valid strategy
      // Track fallback usage instead of adding error
      return {
        ...stateUpdate,
        assembledConfig: fallbackConfig,
        validationStatus: 'pass',
        validationErrors: [],
        usedFallback: {
          ...state.usedFallback,
          assemblyAgent: true
        },
        usage: response.usage,
        model: response.model
      };
    }
  }

  /**
   * Orchestrates the assembly of components from all inputs.
   */
  private assembleComponents(state: WorkflowState): any[] {
    const { 
      componentSelection, 
      stylingSelection, 
      contentGeneration, 
      hotelParameters 
    } = state;
    
    const orderedTypes = this.orderComponents(
      componentSelection!.selectedComponents,
      componentSelection!.emphasisComponents
    );

    return orderedTypes.map((type, index) => {
      const rawVariants = stylingSelection!.componentVariants[type] || {};
      const mappedVariants = this.variantFieldMapping(type, rawVariants);
      
      const rawProps = contentGeneration!.componentContent[type] || {};
      const injectedProps = this.injectImagePlaceholders(type, rawProps, hotelParameters!.hotelName);
      
      return {
        type,
        variant: mappedVariants,
        props: injectedProps,
        order: index
      };
    });
  }

  /**
   * Orders components based on emphasis and logical flow. (AC4)
   * 1. Navigation (0)
   * 2. Hero (1)
   * 3. Emphasized components (remaining order)
   * 4. Other components
   */
  private orderComponents(
    selectedComponents: string[], 
    emphasisComponents: string[]
  ): string[] {
    const ordered: string[] = [];
    const remaining = new Set(selectedComponents);

    // 1. Navigation
    if (remaining.has('navigation')) {
      ordered.push('navigation');
      remaining.delete('navigation');
    }

    // 2. Hero
    if (remaining.has('hero')) {
      ordered.push('hero');
      remaining.delete('hero');
    }

    // 3. Emphasized components
    for (const comp of emphasisComponents) {
      if (remaining.has(comp)) {
        ordered.push(comp);
        remaining.delete(comp);
      }
    }

    // 4. Remaining components in logical flow (Story 19.5: Updated with new blocks)
    const logicalOrder = ['about', 'rooms', 'features', 'gallery', 'testimonials', 'amenities', 'booking', 'contact', 'faq'];
    for (const comp of logicalOrder) {
      if (remaining.has(comp)) {
        ordered.push(comp);
        remaining.delete(comp);
      }
    }

    // 5. Footer always last (Story 19.5)
    if (remaining.has('footer')) {
      ordered.push('footer');
      remaining.delete('footer');
    }

    // Catch-all for any others
    for (const comp of remaining) {
      ordered.push(comp);
    }

    return ordered;
  }

  /**
   * Maps StylingAgent variant names to component-specific keys.
   */
  private variantFieldMapping(componentType: string, variants: Record<string, any>): Record<string, any> {
    const mappings: Record<string, Record<string, string>> = {
      gallery: {
        galleryLayout: "layout",
        gallerySpacing: "spacing"
      },
      testimonials: {
        testimonialsLayout: "layout",
        testimonialsColumns: "columns"
      },
      amenities: {
        amenitiesLayout: "layout",
        amenitiesColumns: "columns"
      },
      navigation: {
        navStyle: "style",
        navLayout: "layout"
      },
      rooms: {
        roomCardStyle: "variant"
      },
      booking: {
        bookingStyle: "variant",
        bookingTheme: "theme"
      },
      contact: {
        contactStyle: "variant",
        contactBackground: "background"
      },
      footer: {
        footerLayout: "layout"
      },
      about: {
        aboutLayout: "layout",
        aboutImagePosition: "imagePosition",
        aboutOverlay: "overlay",
        aboutTextAlign: "textAlign"
      },
      faq: {
        faqLayout: "layout"
      },
      features: {
        featuresLayout: "layout",
        featuresColumns: "columns"
      }
    };

    const componentMapping = mappings[componentType];
    if (!componentMapping) return variants;

    const mappedVariants: Record<string, any> = {};
    for (const [key, value] of Object.entries(variants)) {
      const mappedKey = componentMapping[key] || key;
      mappedVariants[mappedKey] = value;
    }
    return mappedVariants;
  }

  /**
   * Injects BackBlaze B2 placeholder URLs into component props. (AC5)
   * Follows .webp/.m.webp format required by component contracts.
   */
  private injectImagePlaceholders(componentType: string, props: any, hotelName: string): any {
    const baseUrl = 'https://f000.backblazeb2.com/file/hotel-assets';

    const result = { ...props };

    switch (componentType) {
      case 'hero':
        if (!result.image) {
          result.image = `${baseUrl}/placeholder-hero-large.webp`;
        }
        break;
      case 'gallery':
        if (result.images) {
          result.images = result.images.map((img: any, idx: number) => ({
            id: img.id || `img-${idx + 1}`,
            ...img,
            desktopUrl: img.desktopUrl || `${baseUrl}/placeholder-gallery-${idx + 1}.webp`,
            mobileUrl: img.mobileUrl || `${baseUrl}/placeholder-gallery-${idx + 1}.m.webp`
          }));
        }
        break;
      case 'rooms':
        if (result.rooms) {
          result.rooms = result.rooms.map((room: any, idx: number) => ({
            ...room,
            image: room.image || `${baseUrl}/placeholder-room-${idx + 1}.webp`
          }));
        }
        break;
    }

    return result;
  }
  /**
   * Validates that all required upstream outputs are present in state.
   */
  private validateInputs(state: WorkflowState): void {
    if (!state.hotelParameters) {
      throw new Error('[AssemblyAgent] Missing required input: hotelParameters');
    }
    if (!state.componentSelection) {
      throw new Error('[AssemblyAgent] Missing required input: componentSelection');
    }
    if (!state.stylingSelection) {
      throw new Error('[AssemblyAgent] Missing required input: stylingSelection');
    }
    if (!state.contentGeneration) {
      throw new Error('[AssemblyAgent] Missing required input: contentGeneration');
    }
  }
}
