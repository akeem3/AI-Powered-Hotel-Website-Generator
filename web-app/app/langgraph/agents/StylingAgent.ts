import { BaseAgent } from './BaseAgent';
import { WorkflowState } from '../state/types';
import { 
  StylingAgentOutputSchema, 
  StylingAgentOutput, 
  HotelParameters,
  ComponentSelectorOutput 
} from './schemas';
import { CVAValidator } from '../utils/cva-validator';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';

export class StylingAgent extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('StylingAgent', langfuseService, costMonitor);
  }

  /**
   * Get the name of this agent.
   */
  getAgentName(): string {
    return 'StylingAgent';
  }

  /**
   * Main execution logic for the StylingAgent.
   *
   * Story 20.10: Enhanced to accept archetype from state and use it for variant selection
   *
   * @param state - The current workflow state
   * @returns Partial state update
   */
  async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    if (!state.hotelParameters) {
      throw new Error('[StylingAgent] Missing required input: hotelParameters');
    }
    if (!state.componentSelection) {
      throw new Error('[StylingAgent] Missing required input: componentSelection');
    }

    // Story 20.10: Extract archetype from state if available (from ArchetypeClassifier)
    const archetype = state.archetypeClassification?.archetype;

    // Build prompt context with hotel parameters, component selection, and archetype
    const promptContext: Record<string, any> = {
      ...state.hotelParameters,
      ...state.componentSelection,
    };

    // Add archetype to prompt context if available
    if (archetype) {
      promptContext.archetype = archetype;
      promptContext.archetypeDescription = this.getArchetypeDescription(archetype);
    }

    const prompt = await this.loadPrompt('styling-agent', promptContext);

    // Call OpenRouter with intelligent routing and retries
    const response = await this.openRouterClient.sendCompletion(
      [{ role: 'user', content: prompt }],
      { 
        agentName: this.agentName, 
        budgetRemaining: state.budgetRemaining ?? CostMonitor.TOTAL_BUDGET
      }
    );

    // Extract and validate JSON from response
    try {
      const jsonContent = this.extractJson(response.text);
      const validated = StylingAgentOutputSchema.parse(jsonContent);

      // CVA Logic Validation (AC5)
      const cvaValidation = CVAValidator.validateOutput(validated);
      if (!cvaValidation.valid) {
        throw new Error(
          `Invalid CVA variants detected:\n${cvaValidation.errors.join('\n')}`
        );
      }

      const stateUpdate = this.updateStepCost(response.cost);

      return {
        ...stateUpdate,
        stylingSelection: validated,
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
   * Story 20.10: Get archetype description for prompt context
   * Provides the LLM with detailed guidance on variant selection for each archetype
   *
   * @param archetype - The hotel visual archetype
   * @returns Description string for prompt context
   */
  private getArchetypeDescription(archetype: string): string {
    const archetypeDescriptions: Record<string, string> = {
      'heritage-opulence': 'Luxury traditional hotel with rich navy/burgundy colors, gold accents, serif elegant typography. Prefer "elegant", "classic" variants. Use elevated card styles, sophisticated layouts.',
      'quiet-luxury': 'Understated luxury with refined materials, neutral palette, and exceptional attention to detail. Prefer "minimal", "elegant" variants with sophisticated layouts.',
      'boutique-editorial': 'Fashion-forward boutique with bold typography, high contrast, editorial layout aesthetic. Prefer "bold", "modern" variants with dramatic styling.',
      'urban-tech': 'Bold tech-forward hotel with dark backgrounds, geometric sans typography, tight spacing. Prefer "bold", "modern" variants with compact layouts.',
      'coastal-resort': 'Beach resort with ocean blue tones, sand accents, airy spacious layouts. Prefer "modern" variants with light overlay and spacious layouts.',
      'mountain-wilderness': 'Rustic mountain lodge with forest greens, stone textures, cozy atmosphere. Prefer "minimal" variants with warm overlay and natural materials.',
      'wellness-spa': 'Serene wellness retreat with soft natural tones, rounded shapes, organic textures. Prefer "minimal" variants with soft overlay and rounded styling.',
      'heritage-cultural': 'Cultural heritage hotel with warm-rich tones, elegant typography. Prefer "elegant", "classic" variants with sophisticated styling.',
      'eco-lodge': 'Nature-focused lodge with leaf greens, raw linens, organic feel. Prefer "minimal" variants with flat card styles and natural layouts.',
      'design-art': 'Art gallery aesthetic with dramatic contrasts, one bold accent color. Prefer "bold" variants with minimalist styling and strong accents.',
      'family-resort': 'Family-friendly with turquoise, coral, pill shapes, welcoming atmosphere. Prefer "modern" variants with rounded, bright styling.',
      'business-hotel': 'Corporate hotel with monochromatic blue, tight efficient spacing. Prefer "modern" variants with compact, professional layouts.',
    };

    return archetypeDescriptions[archetype] || `Archetype: ${archetype}. Use appropriate variant selections based on the archetype.`;
  }
}
