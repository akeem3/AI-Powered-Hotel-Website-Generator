// Component type definitions for LLM-driven generation
// Sourced from:
// - web-app/app/langgraph/agents/schemas.ts (Agent I/O schemas)
// - web-app/lib/content/schemas/ (Content schemas)
// - web-app/types/ (Component interfaces)

export interface HotelParameters {
  hotelType: "luxury" | "budget" | "boutique" | "resort" | "business";
  targetAudience: "business" | "leisure" | "family" | "couples" | "backpackers";
  brandPersonality: "elegant" | "modern" | "friendly" | "professional" | "adventurous";
  hotelName: string;
  location: string;
}

export interface ComponentSelectorOutput {
  selectedComponents: ("hero" | "navigation" | "rooms" | "gallery" | "testimonials" | "amenities" | "booking" | "contact")[];
  layoutStructure: "single-column" | "grid" | "mixed";
  emphasisComponents: string[];
  reasoning: string;
}

export interface StylingAgentOutput {
  componentVariants: Record<string, {
    // Hero Section variants
    style?: "modern" | "classic" | "minimal" | "bold" | "elegant";
    layout?: "centered" | "split" | "fullscreen";
    overlay?: "none" | "light" | "dark" | "gradient";
    height?: "small" | "medium" | "large" | "fullscreen";

    // Shared & Component Specific variants
    cardStyle?: "default" | "minimal" | "flat" | "elevated";

    // Gallery variants
    galleryLayout?: "grid" | "masonry" | "carousel";
    gallerySpacing?: "tight" | "normal" | "loose";
    aspectRatio?: "square" | "landscape" | "portrait";
    columns?: 2 | 3 | 4;

    // Testimonials variants
    testimonialsLayout?: "carousel" | "grid" | "featured";
    testimonialsColumns?: 2 | 3;

    // Amenities variants
    amenitiesLayout?: "grid" | "list" | "featured";
    amenitiesColumns?: 2 | 3 | 4;
    iconSize?: "small" | "medium" | "large";
    iconStyle?: "default" | "muted" | "colored";

    // Navigation variants
    navStyle?: "transparent" | "solid" | "glass";
    navLayout?: "default" | "compact" | "tall";

    // Room Card variants
    roomCardStyle?: "detailed" | "compact" | "grid";
    imageHeight?: "default" | "tall" | "wide";

    // Booking Widget variants
    bookingStyle?: "desktop" | "mobile";
    bookingTheme?: "light" | "dark" | "glass";

    // Contact Form variants
    contactStyle?: "default" | "minimal" | "floating";
    contactBackground?: "none" | "brand" | "muted";

    [key: string]: any; // passthrough
  }>;
  reasoning: string;
}

export interface ContentGeneratorOutput {
  // NOTE: This reflects the raw output from the ContentGenerator agent.
  // Properties like 'image' are transformed into 'backgroundImage' + 'mediaManifest'
  // during the assembly process to match the HeroContent schema below.
  componentContent: Record<string, {
    // Hero Section Content
    title?: string;
    tagline?: string;
    subtitle?: string;
    headline?: string;
    description?: string;
    primaryCTA?: {
      text: string;
      href: string;
      ariaLabel?: string;
    };
    secondaryCTA?: {
      text: string;
      href: string;
      ariaLabel?: string;
    };
    image?: string;

    // Room Cards Content
    rooms?: {
      id: string;
      name: string;
      type: string;
      price: number;
      capacity: number;
      amenities?: string[];
      image?: string;
      description?: string;
    }[];

    // Testimonials Content
    testimonials?: {
      id: string;
      customerName: string;
      customerTitle?: string;
      rating: 1 | 2 | 3 | 4 | 5;
      quote: string;
      date?: string;
      location?: string;
    }[];

    // Amenities Content
    amenities?: {
      id: string;
      name: string;
      description?: string;
      icon?: string;
      category?: "room" | "hotel" | "location" | "services";
    }[];

    // Gallery Content
    images?: {
      id: string;
      src: string;
      alt: string;
      caption?: string;
    }[];

    // Contact Form Content
    submitButtonText?: string;
    successMessage?: string;

    [key: string]: any; // passthrough
  }>;

  homepageContentJson?: HomepageContent;
  mediaManifestJson?: MediaManifest;
  reasoning: string;
}

export interface HomepageConfig {
  generationId: string;
  timestamp: string;
  hotelParameters: HotelParameters;
  components: {
    type: "hero" | "navigation" | "rooms" | "gallery" | "testimonials" | "amenities" | "booking" | "contact";
    variant: Record<string, string | number | boolean>;
    props: Record<string, any>;
    order: number;
  }[];
  layoutStructure: "single-column" | "grid" | "mixed";
  emphasisComponents: string[];
  validationStatus: "PASS" | "WARNING" | "FAIL";
}

// Content System Schemas (from web-app/lib/content/schemas/page-content.schema.ts)
// NOTE: These interfaces define the final structure consumed by the frontend components.

export interface ContentCTA {
  text: string;
  href: string;
  ariaLabel?: string;
}

export interface HeroContent {
  tagline?: string;
  title: string;
  headline: string;
  description?: string;
  primaryCTA?: ContentCTA;
  secondaryCTA?: ContentCTA;
  imageAlt?: string;
  backgroundImage?: string;
}

export interface SectionHeader {
  heading: string;
  subheading?: string;
}

export interface ContactContent {
  title: string;
  fields?: {
    name?: { label: string; placeholder: string };
    email?: { label: string; placeholder: string };
    phone?: { label: string; placeholder: string };
    subject?: { label: string; placeholder: string; options?: Record<string, string> };
    message?: { label: string; placeholder: string };
  };
  submitButton?: {
    text: string;
    loadingText?: string;
  };
  messages?: {
    success: string;
    error: string;
  };
}

export interface NavigationContent {
  links?: {
    href: string;
    label: string;
  }[];
  logo?: {
    ariaLabel?: string;
    text?: string;
    initials?: string;
  };
  cta?: {
    text: string;
  };
}

export interface HomepageContent {
  meta: {
    version: string;
    generatedAt: string;
    hotelId: string;
    locale: string;
  };
  navigation?: NavigationContent;
  hero: HeroContent;
  sections?: {
    amenities?: SectionHeader;
    testimonials?: SectionHeader;
    contact?: ContactContent;
  };
  footer?: {
    copyright?: string;
  };
  _mediaManifest?: any;
}

// Media Manifest Schemas (from web-app/lib/content/schemas/media-manifest.schema.ts)

export interface MediaAsset {
  id: string;
  path: string;
  mobilePath?: string;
  alt?: string;
  blurhash?: string;
  width?: number;
  height?: number;
}

export interface MediaManifest {
  cdn: {
    baseUrl: string;
    transformPath?: string;
  };
  assets: Record<string, Record<string, MediaAsset>>;
}
