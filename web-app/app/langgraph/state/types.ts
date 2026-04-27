// web-app/app/langgraph/state/types.ts

import { ArchetypeClassifierOutput, ComponentSelectorOutput, ContentGeneratorOutput, HomepageConfig, HotelParameters, StylingAgentOutput, TokenGeneratorOutput } from '../agents/schemas';
import { HomepageContent, MediaManifest } from '@/lib/content/schemas';
import { Locale } from '@/lib/content/locale';

/**
 * Content JSON output structure for file writing.
 * Extracted from state.contentGeneration for easier access.
 *
 * Used by scripts/generate-homepage.ts to write content files.
 */
export interface ContentJsonOutput {
  /** English homepage content */
  homepage: HomepageContent;
  /** Localized homepage content (Epic 13: currently empty, future: es, fr, de) */
  localizedHomepage: Partial<Record<Locale, HomepageContent>>;
  /** Media manifest (locale-agnostic, shared across all languages) */
  mediaManifest: MediaManifest;
}

export interface WorkflowState {
  // Input tracking
  generationId: string;
  hotelParameters: HotelParameters; // Typed with ZOD schema from Story 7.3

  // Progressive Agent Outputs
  archetypeClassification: ArchetypeClassifierOutput | undefined; // Story 20.2: Archetype classification
  designTokens: TokenGeneratorOutput | undefined; // Story 20.3: Generated design tokens with APCA validation
  componentSelection: ComponentSelectorOutput | undefined;
  stylingSelection: StylingAgentOutput | undefined;
  /**
   * Story 25.4: ContentGenerator output with pageMetadata
   * Includes optional pageMetadata field with SEO titles and descriptions
   * for each page type (rooms, gallery, amenities, reviews, contact, about, faq).
   * The pageMetadata field is optional for backward compatibility.
   */
  contentGeneration: ContentGeneratorOutput | undefined;
  assembledConfig: HomepageConfig | undefined;

  // Story 11.6: Content JSON for file output
  // Convenience field that extracts JSON content from contentGeneration
  // Populated by ContentGenerator, used by file output script
  contentJson: ContentJsonOutput | undefined;

  // Validation & Quality
  validationStatus: 'pending' | 'pass' | 'fail';
  validationErrors: string[];
  qualityScore: number | undefined;

  // Cost tracking (Accumulative)
  totalCost: number;
  stepCosts: Record<string, number>;
  budgetRemaining: number;
  budgetExceeded: boolean;

  // Workflow Control
  currentAgent: string;
  retryCount: number;
  errors: any[];

  // Story 13.3.1: Graceful Degradation (AC2b, AC2c, AC3c)
  // Tracks which agents used fallback strategies when they failed
  // Story 20.6: Added archetypeClassifier and tokenGenerator
  usedFallback?: Partial<Record<'componentSelector' | 'stylingAgent' | 'contentGenerator' | 'assemblyAgent' | 'archetypeClassifier' | 'tokenGenerator', boolean>>;
  // Indicates if AssemblyAgent completed partial assembly due to errors
  partialAssembly?: boolean;

  // Batch context for diversity (Epic 22 pipeline fix)
  batchIndex?: number;
  batchSize?: number;
  previousArchetypes?: string[];
}
