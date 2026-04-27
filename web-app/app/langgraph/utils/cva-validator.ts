import * as cvaVariants from '../../../lib/cva-variants';

/**
 * Validates that selected CVA variants exist in the actual cva-variants.ts definitions.
 * This prevents the LLM from hallucinating variant values that don't exist in the codebase.
 */
export class CVAValidator {
  /**
   * Registry of valid variant values extracted from cva-variants.ts.
   * This must be manually synced if cva-variants.ts is updated.
   */
  private static readonly VALID_VARIANTS = {
    /**
     * Story 20.10: Hero block with archetype-specific variants
     * Archetype variants added: heritage-opulence, urban-tech, coastal-resort
     */
    hero: {
      style: ["modern", "classic", "minimal", "bold", "elegant", "heritage-opulence", "urban-tech", "coastal-resort"],
      layout: ["centered", "split", "minimal", "heritage-opulence", "urban-tech", "coastal-resort"],
      overlay: ["none", "light", "dark", "gradient", "heritage-opulence"],
      height: ["small", "medium", "large", "fullscreen"]
    },
    /**
     * Story 20.10: Gallery block with archetype-specific variants
     * Archetype variants added: heritage-opulence, urban-tech
     */
    gallery: {
      layout: ["grid", "masonry", "carousel"],
      spacing: ["tight", "normal", "loose", "gap-gap-section"],
      aspectRatio: ["square", "landscape", "portrait", "aspect-[4/3]"],
      columns: [2, 3, 4, "md:grid-cols-2", "md:grid-cols-3", "lg:grid-cols-3", "lg:grid-cols-4"],
      cardStyle: ["default", "minimal", "flat", "elevated", "heritage-opulence", "urban-tech"]
    },
    testimonials: {
      layout: ["carousel", "grid", "featured"],
      columns: [2, 3],
      cardStyle: ["default", "minimal", "elevated"]
    },
    amenities: {
      layout: ["grid", "list", "featured"],
      columns: [2, 3, 4],
      iconSize: ["small", "medium", "large"],
      iconStyle: ["default", "muted", "colored"],
      cardStyle: ["default", "minimal", "elevated"]
    },
    /**
     * Story 20.10: Navigation block with archetype-specific variants
     * Archetype variants added: heritage-opulence, urban-tech, coastal-resort
     */
    navigation: {
      style: ["transparent", "solid", "glass", "heritage-opulence", "urban-tech", "coastal-resort"],
      layout: ["classic", "compact", "extended", "h-20", "h-nav-classic"]
    },
    rooms: {
      variant: ["detailed", "compact", "grid"],
      imageHeight: ["default", "tall", "wide"]
    },
    booking: {
      variant: ["desktop", "mobile"],
      theme: ["light", "dark", "glass"]
    },
    contact: {
      style: ["default", "minimal", "floating"],
      background: ["none", "brand", "muted"]
    },
    footer: {
      layout: ["classic", "minimal", "stacked"]
    },
    about: {
      layout: ["side-by-side", "timeline", "full-width"],
      imagePosition: ["left", "right"],
      overlay: ["none", "light", "dark", "gradient"],
      textAlign: ["left", "center"]
    },
    faq: {
      layout: ["accordion", "grid"]
    },
    features: {
      layout: ["icon-grid", "cards"],
      columns: [2, 3, 4]
    }
  };

  /**
   * Field mappings from StylingAgent schema naming to CVA dimension naming.
   */
  private static readonly FIELD_MAPPINGS: Record<string, string> = {
    galleryLayout: "layout",
    gallerySpacing: "spacing",
    galleryCardStyle: "cardStyle",
    testimonialsLayout: "layout",
    testimonialsColumns: "columns",
    testimonialsCardStyle: "cardStyle",
    amenitiesLayout: "layout",
    amenitiesColumns: "columns",
    amenitiesCardStyle: "cardStyle",
    navStyle: "style",
    navLayout: "layout",
    roomCardStyle: "variant",
    bookingStyle: "variant",
    bookingTheme: "theme",
    contactStyle: "style",
    contactBackground: "background",
    footerLayout: "layout",
    aboutLayout: "layout",
    aboutImagePosition: "imagePosition",
    aboutOverlay: "overlay",
    aboutTextAlign: "textAlign",
    faqLayout: "layout",
    featuresLayout: "layout",
    featuresColumns: "columns"
  };

  /**
   * Validate a single component's variants.
   * 
   * @param componentName - The component identifier (e.g., 'hero')
   * @param variants - The variants selected by the LLM
   * @returns Array of error messages, empty if all valid
   */
  public static validateComponent(
    componentName: string,
    variants: Record<string, any>
  ): string[] {
    const errors: string[] = [];
    const validVariants = this.VALID_VARIANTS[componentName as keyof typeof this.VALID_VARIANTS];

    if (!validVariants) {
      errors.push(`Unknown component type: ${componentName}`);
      return errors;
    }

    for (const [key, value] of Object.entries(variants)) {
      const mappedKey = this.FIELD_MAPPINGS[key] || key;
      const validOptions = (validVariants as any)[mappedKey];

      if (!validOptions) {
        // We warn for unknown dimensions but don't fail, allowing for schema evolution
        console.warn(`[CVAValidator] Unknown variant dimension '${key}' (mapped to '${mappedKey}') for component '${componentName}'`);
        continue;
      }

      if (!validOptions.includes(value)) {
        errors.push(
          `Invalid variant for ${componentName}.${key}: "${value}". Valid options: ${validOptions.join(", ")}`
        );
      }
    }

    return errors;
  }

  /**
   * Validate a full StylingAgent output.
   * 
   * @param output - The output from the StylingAgent
   * @returns Object with valid status and collected errors
   */
  public static validateOutput(output: {
    componentVariants: Record<string, Record<string, any>>;
  }): { valid: boolean; errors: string[] } {
    const allErrors: string[] = [];

    for (const [componentName, variants] of Object.entries(output.componentVariants)) {
      const componentErrors = this.validateComponent(componentName, variants);
      allErrors.push(...componentErrors);
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }
}
