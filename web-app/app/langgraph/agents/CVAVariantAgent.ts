import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { WorkflowState } from '../state/types';
// Import CVAVariantAgentOutputSchema from Story 20.8 schema
import { CVAVariantAgentOutputSchema, type CVAVariantAgentOutput } from '@/lib/style-generation/schemas/cva-variant-map.schema';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';

/**
 * CVAVariantAgent
 * Story 20.8: CVAVariantMap Schema + CVAVariantAgent
 *
 * This agent generates archetype-specific Tailwind class strings for each
 * CVA variant dimension. It ensures all classes conform to the semantic token
 * allowlist from Story 20.7, preventing hallucinated or arbitrary utilities.
 *
 * The agent:
 * 1. Uses the archetype from state.archetypeClassification for design guidance
 * 2. Receives the block type to generate variants for
 * 3. Generates CVA variant mappings via LLM using CVAVariantMapSchema
 * 4. Validates all class strings against the semantic token allowlist
 * 5. Returns CVAVariantAgentOutput with variantMap and generation metadata
 *
 * Cost Target: ~$0.02-0.03 per archetype (8 blocks × class strings)
 * Model Recommendation: Claude 3.5 Sonnet or equivalent (structured generation task)
 * Cacheable: Yes - generate once per archetype, reuse for all hotels
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 */
export class CVAVariantAgent extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('CVAVariantAgent', langfuseService, costMonitor);
  }

  getAgentName(): string {
    return 'CVAVariantAgent';
  }

  async performGeneration(
    state: WorkflowState
  ): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    // Verify prerequisite: archetypeClassification must exist
    if (!state.archetypeClassification) {
      throw new Error(
        'CVAVariantAgent requires archetypeClassification to be present in state. ' +
          'Ensure ArchetypeClassifier agent runs before CVAVariantAgent.'
      );
    }

    // For this agent, we generate a single variant map at a time.
    // In production, this would be called multiple times (once per block type per archetype)
    // or triggered as a separate build-time process.
    //
    // For workflow integration, we'll use the first component from selectedComponents
    // if available, otherwise default to 'hero' as an example.
    const blockType = state.componentSelection?.selectedComponents?.[0] || 'hero';

    // Prepare prompt variables with archetype and block type
    const promptVariables = {
      archetype: state.archetypeClassification.archetype,
      blockType: blockType,
      reasoning: state.archetypeClassification.reasoning,
    };

    // Load the CVA variant agent prompt with archetype and block type
    const prompt = await this.loadPrompt('cva-variant-agent', promptVariables);

    // Call LLM via provider with intelligent routing and retries
    // CVA variant generation task - use standard model for structured output
    const response = await this.openRouterClient.sendCompletion(
      [{ role: 'user', content: prompt }],
      {
        agentName: this.agentName,
        budgetRemaining: state.budgetRemaining ?? CostMonitor.TOTAL_BUDGET,
      }
    );

    // Extract and validate JSON from response
    let variantMap: z.infer<typeof CVAVariantAgentOutputSchema>;
    try {
      const jsonContent = this.extractJson(response.text);
      variantMap = CVAVariantAgentOutputSchema.parse(jsonContent);
    } catch (error: any) {
      console.error(`[${this.agentName}] Failed to parse or validate LLM output:`, error.message);
      throw new Error(`${this.agentName} output validation failed: ${error.message}`);
    }

    // Build state update with generation metadata
    // Note: The variant map is not stored in WorkflowState as this is a build-time
    // generation agent. In production, the variant maps would be persisted
    // separately and used by the build-time code generation script (Story 20.9).
    const stateUpdate = this.updateStepCost(response.cost);

    return {
      ...stateUpdate,
      usage: response.usage,
      model: response.model,
      validationStatus: 'pass',
      validationErrors: [],
    };
  }
}
