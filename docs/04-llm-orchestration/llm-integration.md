# LLM Integration PRD: LangGraph Workflow System

> **Status:** Draft v2.0  
> **Last Updated:** 2025-01-19  
> **Based on:** [Project Brief](../brief.md) and [Component Library PRD](./component-library.md)

## PROJECT SCOPE BOUNDARIES

### IN SCOPE:
- LLM-driven website generation workflow
- Multi-agent orchestration with LangGraph
- Cost management within $5 budget constraint
- Translation integration via external service
- Quality validation and deployment automation

### OUT OF SCOPE:
- Post-generation LLM monitoring
- Content updates after delivery
- Ongoing model performance optimization
- Custom model training or fine-tuning
- User behavior analytics

## Overview

This document defines the detailed requirements for the LLM integration system using LangGraph workflows, LangFuse monitoring, and K2 model for cost-effective generation. The system orchestrates autonomous hotel website generation within a $5 budget constraint using DeepL for translation services.

## System Architecture

### LangGraph Multi-Agent Workflow

```
Input Parameters → Input Analyzer → Component Selector → Styling Agent
                                                            ↓
                   Translation Agent → Assembly Agent → Quality Validator
                                          ↓
                                    Deployment Agent
```

#### Agent Communication Protocol
```typescript
interface AgentState {
  // Input data
  hotelParameters: HotelParameters;
  generationId: string;
  
  // Workflow state
  currentStep: string;
  errors: string[];
  retryCount: number;
  
  // Cost management
  totalCost: number;
  budgetEnforcer: BudgetEnforcer;
  
  // Agent outputs
  inputAnalysis?: InputAnalysisResult;
  componentSelection?: ComponentSelectionResult;
  customStyling?: StylingResult;
  translationResults?: TranslationResults;
  generatedFiles?: GeneratedFile[];
  qualityMetrics?: QualityMetrics;
  deploymentConfig?: DeploymentConfig;
  
  // Monitoring
  trace: LangFuseTrace;
  stepTimings: Record<string, number>;
}
```

## Agent Specifications

### 1. Input Analyzer Agent (P0 - Critical)

#### Purpose
Analyze hotel parameters and provide strategic insights for website generation.

#### Input Requirements
```typescript
interface HotelParameters {
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
  targetAudience?: string[];
  specialFeatures?: string[];
}
```

#### Output Requirements
```typescript
interface InputAnalysisResult {
  hotelProfile: {
    category: string;
    target_audience: string[];
    unique_selling_points: string[];
    brand_personality: string[];
    competitive_positioning: string;
  };
  designDirection: {
    aesthetic: string;
    color_psychology: string;
    typography_style: string;
    layout_preference: string;
    imagery_style: string;
  };
  componentRequirements: {
    must_have_components: string[];
    recommended_components: string[];
    avoid_components: string[];
    special_features: string[];
  };
  wireframeRecommendations: string[];
  confidence: number;
}
```

#### LLM Configuration
- **Model:** Kimi K2 (cost optimization)
- **Temperature:** 0.3 (balanced creativity/consistency)
- **Max Tokens:** 1000
- **System Prompt:** Strategic hotel industry analysis framework
- **Estimated Cost:** $0.0002 per analysis

#### Quality Requirements
- **Confidence Score:** Minimum 0.8 for proceeding
- **Response Time:** <30 seconds
- **Error Handling:** Fallback analysis for edge cases
- **Validation:** Output schema validation with Zod

#### Prompt Engineering Strategy
```typescript
const systemPrompt = `You are an expert hotel industry analyst and UX strategist.

ANALYSIS FRAMEWORK:
1. Hotel Categorization & Market Positioning
2. Target Audience Identification & Personas
3. Brand Personality Assessment
4. Design Direction Recommendations
5. Component Requirements Analysis

HOTEL TYPE PSYCHOLOGY:
- Luxury: Exclusivity, sophistication, premium service
- Boutique: Uniqueness, character, personalized experience
- Business: Efficiency, professionalism, convenience
- Resort: Recreation, relaxation, comprehensive amenities
- Budget: Value, simplicity, essential services
- Eco: Sustainability, nature, environmental consciousness

OUTPUT FORMAT: Structured JSON with confidence scoring`;
```

### 2. Component Selector Agent (P0 - Critical)

#### Purpose
Select optimal Shadcn/ui components and wireframes based on analysis results.

#### Input Requirements
- InputAnalysisResult from previous agent
- Component manifest (components.json) with responsive specifications
- Available wireframes and variants (mobile + desktop layouts)
- Device usage statistics for target hotel audience
- Responsive breakpoint configuration (mobile <768px, desktop ≥768px)

#### Output Requirements
```typescript
interface ComponentSelectionResult {
  siteStructure: {
    pages: PageStructure[];
    globalComponents: ComponentSelection[];
    designTokens: GeneratedDesignTokens;
    responsiveConfig: ResponsiveConfiguration;
  };
  selectionReasoning: {
    wireframeChoice: string;
    mobileWireframeChoice: string;
    desktopWireframeChoice: string;
    componentChoices: Record<string, string>;
    variantChoices: Record<string, ResponsiveVariantChoice>;
    alternativeOptions: string[];
    devicePriorityReasoning: string;
  };
  totalComponents: number;
  confidence: number;
}

interface ResponsiveConfiguration {
  breakpoints: { mobile: string; desktop: string; };
  devicePriority: 'mobile-first' | 'desktop-first';
  componentStrategies: ComponentStrategy[];
}

interface ResponsiveVariantChoice {
  mobile: string;
  desktop: string;
  strategy: 'separate-variants' | 'responsive-utilities';
  reasoning: string;
}

interface ComponentStrategy {
  componentName: string;
  strategy: 'separate-variants' | 'responsive-utilities';
  mobileVariant?: string;
  desktopVariant?: string;
  responsiveClasses?: string[];
}

interface ComponentSelection {
  componentName: string;
  variant: string;
  props: Record<string, any>;
  reasoning: string;
  confidence: number;
}
```

#### LLM Configuration
- **Model:** Kimi K2
- **Temperature:** 0.2 (consistency prioritized)
- **Max Tokens:** 1500
- **Context:** Full component manifest + analysis
- **Estimated Cost:** $0.0003 per selection

#### Selection Logic Framework
```typescript
const componentSelectionRules = {
  // Base requirements for all hotels
  baseRequirements: {
    minSections: 3,
    maxSections: 8,
    requiredComponents: ['HeroSection', 'BookingSection', 'Navigation'],
    conversionOptimization: true,
    responsiveStrategy: 'mobile-first',
    breakpoint: '768px'
  },
  
  // Responsive component strategies
  componentStrategies: {
    'BookingWidget': 'separate-variants',    // Mobile: collapsible, Desktop: single form
    'Navigation': 'separate-variants',       // Mobile: hamburger, Desktop: horizontal
    'HeroSection': 'separate-variants',      // Mobile: stacked, Desktop: split
    'RoomCard': 'responsive-utilities',      // Single component with Tailwind utilities
    'TestimonialCard': 'responsive-utilities',
    'FeatureList': 'responsive-utilities',
    'ContactCard': 'responsive-utilities'
  },
  
  // Mobile-first decision criteria
  devicePriorityLogic: {
    // Hotel booking patterns: 70%+ mobile traffic
    mobilePriority: {
      layoutPreference: 'simple-stacked',
      navigationPreference: 'hamburger-menu',
      bookingPreference: 'step-by-step',
      contentPreference: 'scannable-chunks'
    },
    desktopEnhancements: {
      layoutPreference: 'rich-multi-column',
      navigationPreference: 'full-horizontal',
      bookingPreference: 'comprehensive-form',
      contentPreference: 'detailed-descriptions'
    }
  },
  
  // Hotel type specific responsive rules
  hotelTypeRules: {
    luxury: {
      preferredComponents: ['GallerySection', 'TestimonialsSection'],
      mobileVariants: { HeroSection: 'minimal', GallerySection: 'carousel' },
      desktopVariants: { HeroSection: 'video-bg', GallerySection: 'masonry' },
      responsiveImages: true // High-quality images with mobile optimization
    },
    business: {
      preferredComponents: ['FeaturesSection', 'ContactSection'],
      mobileVariants: { HeroSection: 'stacked', BookingWidget: 'collapsible' },
      desktopVariants: { HeroSection: 'split', BookingWidget: 'sidebar' },
      responsiveImages: false // Standard image optimization
    },
    resort: {
      preferredComponents: ['GallerySection', 'ActivitiesSection'],
      mobileVariants: { HeroSection: 'carousel', GallerySection: 'swipe' },
      desktopVariants: { HeroSection: 'video-bg', GallerySection: 'grid' },
      responsiveImages: true
    }
    // ... additional rules
  }
};
```

#### Validation Requirements
- Component existence validation against manifest
- Props schema validation
- Wireframe compatibility checking (mobile + desktop layouts)
- Responsive breakpoint validation
- Performance impact assessment (mobile + desktop)
- Touch target size validation (minimum 44px on mobile)
- Image variant availability check (.webp + .m.webp)
- Component strategy consistency validation

### 3. Styling Agent (P0 - Critical)

#### Purpose
Generate custom Tailwind CSS configuration and styling based on brand parameters.

#### Input Requirements
- ComponentSelectionResult
- Brand colors and design direction
- Hotel vibe and aesthetic preferences

#### Output Requirements
```typescript
interface StylingResult {
  tailwindConfig: {
    colors: ColorPalette;
    typography: TypographyConfig;
    spacing: SpacingConfig;
    borderRadius: BorderRadiusConfig;
    shadows: ShadowConfig;
  };
  customCSS: string;
  designTokens: {
    cssVariables: Record<string, string>;
    componentOverrides: Record<string, string>;
  };
  styleGuide: {
    colorUsage: string;
    typographyHierarchy: string;
    spacingSystem: string;
  };
}

interface ColorPalette {
  primary: ColorScale;
  secondary: ColorScale;
  accent: ColorScale;
  neutral: ColorScale;
  semantic: SemanticColors;
}
```

#### LLM Configuration
- **Model:** Kimi K2
- **Temperature:** 0.4 (creative styling)
- **Max Tokens:** 2000
- **Specialized Prompt:** CSS/design generation
- **Estimated Cost:** $0.0005 per styling

#### Color Psychology Framework
```typescript
const colorPsychology = {
  luxury: {
    primary: ['deep blues', 'rich purples', 'sophisticated blacks'],
    accent: ['gold', 'champagne', 'deep emerald'],
    mood: 'exclusivity, sophistication, premium quality'
  },
  boutique: {
    primary: ['warm neutrals', 'earthy tones', 'muted colors'],
    accent: ['terracotta', 'sage green', 'dusty rose'],
    mood: 'uniqueness, creativity, personal touch'
  }
  // ... additional mappings
};
```

#### Technical Requirements
- **CSS Variable Generation:** All colors as HSL custom properties
- **Responsive Typography:** Fluid typography scales
- **Component Theming:** Shadcn/ui compatible overrides
- **Performance:** Minimal CSS footprint (<50KB)

### 4. Translation Agent (P0 - Critical)

#### Purpose
Generate multi-language translation files using external translation service (DeepL API).

#### Input Requirements
- StylingResult from previous agent
- Target languages configuration
- Translatable content extracted from components

#### Output Requirements
```typescript
interface TranslationResults {
  supportedLanguages: string[];
  translationFiles: TranslationFile[];
  fallbackContent: Record<string, string>;
  translationMetrics: {
    totalStrings: number;
    translatedStrings: number;
    confidence: number;
  };
}

interface TranslationFile {
  language: string;
  backblazeUrl: string;
  fileContent: Record<string, string>;
  namespace: string;
  version: string;
}
```

#### External Service Integration
- **Translation Service:** DeepL API (professional tier)
- **Cost Model:** $20 per 1M characters (~$0.02 per language)
- **Quality:** Professional-grade translations
- **Rate Limits:** 500,000 characters/month free tier

#### Translation Strategy
```typescript
const translationStrategy = {
  extraction: {
    // Extract translatable strings from components
    uiElements: ['buttons', 'labels', 'placeholders', 'tooltips'],
    content: ['headings', 'descriptions', 'error_messages'],
    navigation: ['menu_items', 'breadcrumbs', 'links']
  },
  
  optimization: {
    // Batch translations to minimize API calls
    batchSize: 50, // strings per request
    caching: true, // Cache common translations
    fallback: 'en' // English hardcoded fallback
  },
  
  quality: {
    // Ensure translation quality
    contextual: true, // Provide context for accurate translation
    review: false, // Auto-translation only
    consistency: true // Maintain term consistency
  }
};
```

#### Cost Management
- **Budget Allocation:** $0.50 per generation (10% of total budget)
- **Optimization:** Batch requests, cache common phrases
- **Fallback:** Skip translation if budget exceeded

#### Technical Requirements
- **File Storage:** JSON files uploaded to BackBlaze
- **File Naming:** `translations-{language}-{version}.json`
- **Error Handling:** Graceful degradation to English
- **Performance:** Parallel translation requests

### 5. Assembly Agent (P1 - High)

#### Purpose
Generate complete Next.js application files based on component selections and styling.

#### Input Requirements
- ComponentSelectionResult
- StylingResult
- Component templates and configurations

#### Output Requirements
```typescript
interface AssemblyResult {
  generatedFiles: GeneratedFile[];
  fileStructure: FileStructure;
  buildConfig: BuildConfiguration;
  assetManifest: AssetManifest;
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'config' | 'style' | 'asset';
  dependencies: string[];
  size: number;
}
```

#### LLM Configuration
- **Model:** Kimi K2 (code generation optimized)
- **Temperature:** 0.1 (consistency critical)
- **Max Tokens:** 4000
- **Context:** Component library + styling
- **Estimated Cost:** $0.001 per assembly

#### Code Generation Templates
```typescript
const codeTemplates = {
  pageTemplate: `
import type { Metadata } from 'next';
import { {{componentImports}} } from '@/components';

export const metadata: Metadata = {{metadataObject}};

export default function {{pageName}}() {
  return (
    <main className="min-h-screen">
      {{componentComposition}}
    </main>
  );
}`,
  
  componentTemplate: `
import { {{shadcnImports}} } from '@/components/ui';
import { {{hotelImports}} } from '@/components/blocks';

interface {{componentName}}Props {
  {{propsInterface}}
}

export function {{componentName}}({{props}}: {{componentName}}Props) {
  return (
    {{componentJSX}}
  );
}`
};
```

#### Quality Requirements
- **Type Safety:** All generated code must be TypeScript compliant
- **ESLint Compliance:** Pass all configured linting rules
- **Performance:** Optimized imports and lazy loading
- **Accessibility:** ARIA attributes and semantic HTML

### 5. Quality Validator Agent (P1 - High)

#### Purpose
Validate generated output against quality standards and requirements.

#### Input Requirements
- AssemblyResult
- Generated file contents
- Quality benchmarks and thresholds

#### Output Requirements
```typescript
interface QualityMetrics {
  lighthouseScore: number;
  accessibilityScore: number;
  performanceScore: number;
  seoScore: number;
  responsiveQuality: {
    mobileScore: number;
    desktopScore: number;
    breakpointBehavior: number;
    touchTargetCompliance: number;
    imageOptimization: number;
  };
  codeQuality: {
    typeErrors: number;
    lintErrors: number;
    complexityScore: number;
    testCoverage: number;
  };
  componentValidation: {
    componentCount: number;
    missingComponents: string[];
    invalidProps: string[];
    responsiveVariantErrors: string[];
    imageVariantMissing: string[];
  };
  buildMetrics: {
    buildTime: number;
    bundleSize: number;
    assetsSize: number;
    mobileBundle: number;
    desktopBundle: number;
  };
}
```

#### LLM Configuration
- **Model:** Kimi K2
- **Temperature:** 0.1 (strict validation)
- **Max Tokens:** 1000
- **Focus:** Code review and quality assessment
- **Estimated Cost:** $0.0001 per validation

#### Validation Criteria
```typescript
const qualityThresholds = {
  performance: {
    lighthouseScore: 85,
    coreWebVitals: {
      lcp: 2500, // ms
      fid: 100,  // ms
      cls: 0.1   // score
    }
  },
  accessibility: {
    wcagLevel: 'AA',
    minimumScore: 95,
    requiredTests: ['keyboard', 'screenReader', 'colorContrast']
  },
  codeQuality: {
    maxTypeErrors: 0,
    maxLintErrors: 0,
    maxComplexity: 10,
    minTestCoverage: 80
  }
};
```

### 6. Deployment Agent (P1 - High)

#### Purpose
Handle site deployment to CloudFlare Pages with BackBlaze asset storage.

#### Input Requirements
- Validated site files
- Deployment configuration
- Environment variables

#### Output Requirements
```typescript
interface DeploymentResult {
  deploymentUrl: string;
  assetUrls: Record<string, string>;
  deploymentId: string;
  status: 'success' | 'failed' | 'pending';
  metrics: {
    buildTime: number;
    deployTime: number;
    totalAssets: number;
    cdnPropagation: number;
  };
  environmentConfig: EnvironmentConfig;
}
```

#### LLM Configuration
- **Model:** Kimi K2
- **Temperature:** 0.1 (deployment precision)
- **Max Tokens:** 500
- **Focus:** Configuration and deployment scripting
- **Estimated Cost:** $0.0001 per deployment

## Cost Management with LangFuse

### Budget Enforcement System

#### BudgetEnforcer Class
```typescript
class BudgetEnforcer {
  private maxBudget: number = 5.0;
  private currentCost: number = 0;
  private costBreakdown: Record<string, number> = {};
  
  addCost(agentName: string, cost: number): boolean {
    this.currentCost += cost;
    this.costBreakdown[agentName] = (this.costBreakdown[agentName] || 0) + cost;
    
    if (this.currentCost >= this.maxBudget) {
      this.triggerBudgetAlert();
      return false; // Stop workflow
    }
    
    return true; // Continue workflow
  }
  
  getRemainingBudget(): number {
    return Math.max(0, this.maxBudget - this.currentCost);
  }
}
```

#### Cost Tracking Per Agent (K2 Model + DeepL)
| Agent | Estimated Cost | Budget Allocation |
|-------|---------------|-------------------|
| Input Analyzer (K2) | $0.0002 | 0.004% |
| Component Selector (K2) | $0.0003 | 0.006% |
| Styling Agent (K2) | $0.0005 | 0.01% |
| Translation Agent (DeepL) | $0.02-0.10 | 0.4-2% |
| Assembly Agent (K2) | $0.001 | 0.02% |
| Quality Validator (K2) | $0.0001 | 0.002% |
| Deployment Agent (K2) | $0.0001 | 0.002% |
| **Base Total** | **$0.022-0.102** | **0.44-2.04%** |
| **Buffer/Retries** | **$4.898-4.978** | **97.96-99.56%** |

### LangFuse Integration

#### Trace Configuration
```typescript
const traceConfig = {
  name: 'hotel_generation',
  input: hotelParameters,
  metadata: {
    version: '1.0',
    maxBudget: 5.0,
    targetQuality: 'production'
  },
  tags: ['hotel-generation', 'automated']
};
```

#### Monitoring Metrics
- **Cost per generation:** Real-time tracking
- **Success rate:** Percentage of successful generations
- **Quality scores:** Average Lighthouse scores
- **Generation time:** End-to-end timing
- **Error rates:** Failures by agent type

## Error Handling & Recovery

### Retry Strategy
```typescript
interface RetryConfig {
  maxRetries: 3;
  backoffMultiplier: 2;
  initialDelay: 1000; // ms
  maxDelay: 30000; // ms
  retryableErrors: [
    'RATE_LIMIT_EXCEEDED',
    'TEMPORARY_SERVICE_ERROR',
    'NETWORK_TIMEOUT'
  ];
}
```

### Fallback Mechanisms
- **Component Selection:** Default to proven wireframes
- **Styling:** Fallback to brand color variations
- **Assembly:** Use template-based generation
- **Quality:** Accept lower thresholds with warnings

### Error Classification
```typescript
enum ErrorType {
  RECOVERABLE = 'recoverable',    // Retry possible
  FATAL = 'fatal',               // Stop workflow
  BUDGET_EXCEEDED = 'budget',    // Cost limit reached
  QUALITY_FAILED = 'quality',    // Below thresholds
  TIMEOUT = 'timeout'            // Time limit exceeded
}
```

## Performance Requirements

### Generation Timing
- **Total Generation Time:** <60 minutes
- **Agent Response Time:** <30 seconds each
- **Assembly Time:** <10 minutes
- **Deployment Time:** <5 minutes

### Throughput Requirements
- **Concurrent Generations:** 10-50 simultaneous
- **Daily Capacity:** 1000+ sites
- **Peak Load Handling:** 100 generations/hour

### Resource Management
- **Memory Usage:** <2GB per generation
- **CPU Usage:** Optimized for serverless functions
- **Storage:** Temporary files cleanup
- **Network:** Efficient API calls

## Testing Strategy

### Agent Unit Testing
```typescript
describe('InputAnalyzerAgent', () => {
  it('should analyze luxury hotel parameters correctly', async () => {
    const result = await inputAnalyzer.analyzeInput(luxuryHotelParams);
    expect(result.confidence).toBeGreaterThan(0.8);
    expect(result.componentRequirements.must_have_components)
      .toContain('GallerySection');
  });
});
```

### Integration Testing
- **Workflow End-to-End:** Complete generation cycles
- **Cost Validation:** Budget enforcement testing
- **Quality Assurance:** Generated site validation
- **Performance Testing:** Load testing with multiple generations

### Monitoring & Alerting
- **Cost Alerts:** Budget threshold warnings
- **Quality Alerts:** Below-threshold generations
- **Performance Alerts:** Response time degradation
- **Error Alerts:** High failure rates

## Security Considerations

### API Key Management
- **Secure Storage:** Environment variables only
- **Rotation:** Regular key rotation procedures
- **Access Control:** Principle of least privilege
- **Audit Logging:** All API calls tracked

### Generated Code Security
- **Input Sanitization:** Prevent code injection
- **Output Validation:** Safe code generation only
- **Dependency Scanning:** Security vulnerability checks
- **Content Security Policy:** Proper CSP headers

---

*This PRD defines the complete LLM integration system for autonomous hotel website generation. All agents must adhere to these specifications for successful workflow orchestration.*