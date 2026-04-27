// web-app/app/langgraph/state/workflow-state.ts
import { Annotation } from '@langchain/langgraph';
export type { WorkflowState } from './types';
import {
  totalCostReducer,
  stepCostsReducer,
  errorsReducer,
} from './state-reducers';

import { HomepageConfig } from '../agents/schemas';

/**
 * Reducers moved here to break circular dependencies with the state interface.
 */
// Reducers are imported from state-reducers.ts

/**
 * LangGraph Annotation Root definition.
 * Integrates the reducers to ensure correct state transitions (e.g., cost accumulation).
 */
export const WorkflowStateAnnotation = Annotation.Root({
  // Inputs (Default replace)
  generationId: Annotation<string>,
  hotelParameters: Annotation<any>,

  // Agent Outputs (Default replace)
  // Story 20.2: ArchetypeClassifier output
  archetypeClassification: Annotation<any | undefined>,
  // Story 20.3: TokenGenerator output
  designTokens: Annotation<any | undefined>,
  componentSelection: Annotation<any | undefined>,
  stylingSelection: Annotation<any | undefined>,
  contentGeneration: Annotation<any | undefined>,
  assembledConfig: Annotation<HomepageConfig | undefined>,

  // Quality & Validation
  validationStatus: Annotation<'pending' | 'pass' | 'fail'>,
  validationErrors: Annotation<string[]>({
    reducer: (existing, update) => update || [],
    default: () => [],
  }),
  qualityScore: Annotation<number | undefined>,

  // Cost Tracking (Accumulative)
  totalCost: Annotation<number>({
    reducer: totalCostReducer,
    default: () => 0,
  }),
  stepCosts: Annotation<Record<string, number>>({
    reducer: stepCostsReducer,
    default: () => ({}),
  }),
  budgetRemaining: Annotation<number>,
  budgetExceeded: Annotation<boolean>,
 
  // Workflow Control
  currentAgent: Annotation<string>,
  retryCount: Annotation<number>,
  errors: Annotation<any[]>({
    reducer: errorsReducer,
    default: () => [],
  }),

  // Story 13.3.1: Graceful Degradation Tracking
  // Tracks which agents used fallback strategies
  // Story 20.6: Added archetypeClassifier and tokenGenerator
  usedFallback: Annotation<Partial<Record<'componentSelector' | 'stylingAgent' | 'contentGenerator' | 'assemblyAgent' | 'archetypeClassifier' | 'tokenGenerator', boolean>> | undefined>({
    reducer: (existing, update) => ({ ...existing, ...update }),
    default: () => undefined,
  }),
  // Indicates if AssemblyAgent completed partial assembly
  partialAssembly: Annotation<boolean | undefined>({
    reducer: (_, update) => update,
    default: () => undefined,
  }),

  // Story 11.6: Content JSON for file output
  contentJson: Annotation<any | undefined>,
});
