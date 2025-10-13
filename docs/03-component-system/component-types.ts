// Component type definitions for LLM-driven generation

export interface ComponentManifest {
  componentLibrary: string;
  version: string;
  lastUpdated: string;
  primitives: PrimitiveComponent[];
  blocks: BlockComponent[];
  sections: SectionComponent[];
  wireframes: Record<string, Wireframe>;
  designTokens: DesignTokens;
}

export interface BaseComponent {
  name: string;
  path: string;
  props: Record<string, string>;
  tags: string[];
  variants: string[];
  hotelUseCases: string[];
}

export interface PrimitiveComponent extends BaseComponent {
  shadcnComponent: string;
}

export interface BlockComponent extends BaseComponent {
  basedOn: string[];
  backendIntegration?: 'directus' | 'effective-tours' | 'both';
}

export interface SectionComponent extends BaseComponent {
  basedOn: string[];
  wireframes: string[];
  backendIntegration?: 'directus' | 'effective-tours' | 'both';
}

export interface Wireframe {
  name: string;
  sections: string[];
  layout: string;
  tags: string[];
}

export interface DesignTokens {
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  shadows: Record<string, string>;
}

// Hotel-specific interfaces
export interface HotelParameters {
  hotelName: string;
  hotelType: 'luxury' | 'boutique' | 'business' | 'resort' | 'budget' | 'eco';
  location: string;
  vibe: 'modern' | 'classic' | 'rustic' | 'minimalist' | 'elegant' | 'casual';
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  customRequests?: string;
}

export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  maxGuests: number;
  size: number;
  availability: 'available' | 'limited' | 'unavailable';
}

export interface Review {
  id: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  review: string;
  date: string;
  roomType?: string;
  verified: boolean;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: 'amenity' | 'service' | 'facility';
}

export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  category: 'room' | 'facility' | 'dining' | 'exterior' | 'activity';
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  mapUrl?: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tripadvisor';
  url: string;
}

// LangGraph workflow interfaces
export interface ComponentSelection {
  componentName: string;
  variant: string;
  props: Record<string, string | number | boolean | null>;
  reasoning: string;
  confidence: number;
}

export interface SiteStructure {
  pages: PageStructure[];
  globalComponents: ComponentSelection[];
  designTokens: GeneratedDesignTokens;
}

export interface PageStructure {
  pageName: string;
  route: string;
  wireframe: string;
  sections: ComponentSelection[];
  seoMetadata: SEOMetadata;
}

export interface GeneratedDesignTokens {
  colors: {
    primary: string;
    primaryShades: Record<string, string>;
    secondary: string;
    secondaryShades: Record<string, string>;
    accent: string;
    accentShades: Record<string, string>;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSizes: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    image: string;
  };
  structuredData: Record<string, string | number | boolean | object | null>;
}

// Generation workflow types
export interface GenerationInput {
  hotelParameters: HotelParameters;
  wireframePreferences?: string[];
  componentPreferences?: string[];
  customStyling?: Partial<GeneratedDesignTokens>;
}

export interface GenerationOutput {
  siteStructure: SiteStructure;
  generatedFiles: GeneratedFile[];
  deploymentConfig: DeploymentConfig;
  qualityMetrics: QualityMetrics;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'config' | 'style';
}

export interface DeploymentConfig {
  siteName: string;
  domain?: string;
  cloudflareConfig: Record<string, string | number | boolean | null>;
  backblazeConfig: Record<string, string | number | boolean | null>;
  environmentVariables: Record<string, string>;
}

export interface QualityMetrics {
  lighthouseScore: number;
  accessibilityScore: number;
  performanceScore: number;
  seoScore: number;
  componentCount: number;
  generatedCSSLines: number;
  buildTime: number;
  totalCost: number;
}