import { BaseAgent } from './BaseAgent';
import { WorkflowState } from '../state/types';
import { ComponentSelectorOutputSchema, ComponentSelectorOutput, HotelParameters } from './schemas';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';

export class ComponentSelector extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('ComponentSelector', langfuseService, costMonitor);
  }

  getAgentName(): string {
    return 'ComponentSelector';
  }

  async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    const prompt = await this.loadPrompt('component-selector', state.hotelParameters);

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
      const validated = ComponentSelectorOutputSchema.parse(jsonContent);

      const stateUpdate = this.updateStepCost(response.cost);

      return {
        ...stateUpdate,
        componentSelection: validated,
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
}
