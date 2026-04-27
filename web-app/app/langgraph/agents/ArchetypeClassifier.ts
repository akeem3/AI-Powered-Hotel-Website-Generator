import { BaseAgent } from './BaseAgent';
import { WorkflowState } from '../state/types';
import { ArchetypeClassifierOutputSchema, ArchetypeClassifierOutput, HotelParameters } from './schemas';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';

/**
 * ArchetypeClassifier Agent
 *
 * Story 20.2: ArchetypeClassifier Agent
 *
 * This agent classifies a hotel into one of 12 visual archetypes based on
 * hotel parameters (hotelType, targetAudience, brandPersonality).
 *
 * The classification uses the matrix defined in Epic 20, Section "The 12 Hotel Visual Archetypes".
 * For ambiguous inputs, the agent selects the best fit and names the runner-up
 * in the reasoning field.
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 *
 * Cost Target: ~$0.005 per classification (small prompt, small output)
 * Model Recommendation: Kimi K2 or equivalent (classification task, not generation)
 */
export class ArchetypeClassifier extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('ArchetypeClassifier', langfuseService, costMonitor);
  }

  getAgentName(): string {
    return 'ArchetypeClassifier';
  }

  async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    // Load the archetype classifier prompt with hotel parameters substitution
    const prompt = await this.loadPrompt('archetype-classifier', state.hotelParameters);

    // Call OpenRouter with intelligent routing and retries
    // Classification task - use smaller model for cost efficiency
    const response = await this.openRouterClient.sendCompletion(
      [{ role: 'user', content: prompt }],
      {
        agentName: this.agentName,
        budgetRemaining: state.budgetRemaining ?? CostMonitor.TOTAL_BUDGET,
      }
    );

    // Extract and validate JSON from response
    try {
      const jsonContent = this.extractJson(response.text);
      const validated = ArchetypeClassifierOutputSchema.parse(jsonContent);

      const stateUpdate = this.updateStepCost(response.cost);

      return {
        ...stateUpdate,
        archetypeClassification: validated,
        validationStatus: 'pass',
        validationErrors: [],
        usage: response.usage,
        model: response.model,
      };
    } catch (error: any) {
      console.error(`[${this.agentName}] Failed to parse or validate LLM output:`, error.message);
      throw new Error(`${this.agentName} output validation failed: ${error.message}`);
    }
  }
}
