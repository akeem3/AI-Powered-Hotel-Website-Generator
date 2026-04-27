import { WorkflowState } from '../state/types';

/**
 * CostMonitor Service
 *
 * Tracks accumulated costs for the website generation workflow and enforces
 * budget constraints at various checkpoints.
 *
 * Requirements:
 * - Track running total of costs
 * - Track per-agent/step costs
 * - Enforce budget limits per stage
 * - Provide cost estimates
 */
export class CostMonitor {
  /**
   * Get the total budget limit from environment variables or default to 2.00.
   */
  public static get TOTAL_BUDGET(): number {
    return Number(process.env.MAX_GENERATION_COST) || 2.00;
  }

  /**
   * Budget limits in USD.
   * Scaled proportionally to the total budget.
   */
  private static get BUDGET_LIMITS() {
    const total = this.TOTAL_BUDGET;
    return {
      TOTAL: total,
      COMPONENT: total * 0.2, // 20%
      STYLING: total * 0.4,   // 40% (cumulative)
      CONTENT: total * 0.8,   // 80% (cumulative)
      ASSEMBLY: total * 0.9,   // 90% (cumulative)
    };
  }

  /**
   * Per-step budget allocations for individual agents.
   * Scaled proportionally to the total budget.
   */
  private static get STEP_BUDGETS(): Record<string, number> {
    const total = this.TOTAL_BUDGET;
    return {
      'ArchetypeClassifier': total * 0.05, // 5% - Story 20.2
      'TokenGenerator': total * 0.03,      // 3% - Story 20.3 (medium prompt, structured output)
      'ComponentSelector': total * 0.17,    // 17% (adjusted from 20%)
      'StylingAgent': total * 0.17,         // 17% (adjusted from 20%)
      'ContentGenerator': total * 0.4,     // 40%
      'AssemblyAgent': total * 0.1,         // 10%
      'QualityValidator': total * 0.08,     // 8% (adjusted from 10%)
    };
  }

  /**
   * Stage-based cumulative budget checkpoints.
   * Maps agent names to the cumulative budget limit AFTER that agent completes.
   */
  private static get STAGE_CHECKPOINTS(): Record<string, number> {
    const total = this.TOTAL_BUDGET;
    return {
      'ArchetypeClassifier': total * 0.05, // 5% - Story 20.2
      'TokenGenerator': total * 0.08,       // 8% cumulative (5% + 3%) - Story 20.3
      'ComponentSelector': total * 0.25,    // 25% cumulative (8% + 17%)
      'StylingAgent': total * 0.42,         // 42% cumulative (25% + 17%)
      'ContentGenerator': total * 0.82,     // 82% cumulative (42% + 40%)
      'AssemblyAgent': total * 0.92,        // 92% cumulative (82% + 10%)
      'QualityValidator': total,            // 100% cumulative (92% + 8%)
    };
  }

  /**
   * Emergency stop flag - when set, all budget checks will fail.
   * This is a class-level flag for testing and emergency shutdown scenarios.
   */
  private emergencyStop = false;

  /**
   * Estimate cost for a given model and token usage.
   * Useful for "shouldUseAdvancedModel" logic.
   *
   * @param model Model identifier
   * @param inputTokens Estimated input tokens
   * @param outputTokens Estimated output tokens
   */
  public estimateCost(model: string, inputTokens: number, outputTokens: number): number {
    // Placeholder pricing - ideally fetched from a config or live source
    // Prices in USD per 1K tokens
    const prices: Record<string, { input: number; output: number }> = {
      'moonshotai/kimi-k2': { input: 0.0001, output: 0.0004 },
      'anthropic/claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'openai/gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'default': { input: 0.0001, output: 0.0004 }, // Defaulting to Kimi K2 pricing
    };

    const pricing = prices[model] || prices['default'];
    
    return (
      (inputTokens / 1000) * pricing.input +
      (outputTokens / 1000) * pricing.output
    );
  }

  /**
   * Get the remaining budget.
   */
  public getRemainingBudget(state: WorkflowState): number {
    return CostMonitor.BUDGET_LIMITS.TOTAL - (state.totalCost || 0);
  }

  /**
   * Track a cost for a specific agent/step and accumulate to total.
   * Updates the state's stepCosts and totalCost.
   *
   * @param agentName The name of the agent (e.g., 'ComponentSelector', 'StylingAgent')
   * @param cost The cost incurred by this step
   * @param state The current workflow state (will be mutated)
   * @returns The updated total cost
   */
  public trackStepCost(agentName: string, cost: number, state: WorkflowState): number {
    // Initialize stepCosts if not present
    if (!state.stepCosts) {
      state.stepCosts = {};
    }

    // Initialize totalCost if not present
    if (state.totalCost === undefined || state.totalCost === null) {
      state.totalCost = 0;
    }

    // Accumulate cost for this step
    const previousCost = state.stepCosts[agentName] || 0;
    state.stepCosts[agentName] = previousCost + cost;

    // Accumulate to total
    state.totalCost += cost;

    // Update budget remaining
    state.budgetRemaining = this.getRemainingBudget(state);

    return state.totalCost;
  }

  /**
   * Get the cost incurred by a specific agent/step.
   *
   * @param agentName The name of the agent
   * @param state The current workflow state
   * @returns The cost for this step, or 0 if not found
   */
  public getStepCost(agentName: string, state: WorkflowState): number {
    return state.stepCosts?.[agentName] || 0;
  }

  /**
   * Get all step costs.
   *
   * @param state The current workflow state
   * @returns Record of agent names to their costs
   */
  public getAllStepCosts(state: WorkflowState): Record<string, number> {
    return state.stepCosts || {};
  }

  /**
   * Check if a specific step has exceeded its individual budget allocation.
   *
   * @param agentName The name of the agent
   * @param state The current workflow state
   * @returns true if the step exceeded its budget
   */
  public hasStepExceededBudget(agentName: string, state: WorkflowState): boolean {
    const stepCost = this.getStepCost(agentName, state);
    const stepBudget = CostMonitor.STEP_BUDGETS[agentName];

    if (stepBudget === undefined) {
      // Unknown agent - warn but don't enforce
      console.warn(`[CostMonitor] Unknown agent '${agentName}'. No budget check available.`);
      return false;
    }

    return stepCost > stepBudget;
  }

  /**
   * Get the budget allocation for a specific step.
   *
   * @param agentName The name of the agent
   * @returns The budget allocation, or null if unknown agent
   */
  public getStepBudget(agentName: string): number | null {
    return CostMonitor.STEP_BUDGETS[agentName] ?? null;
  }

  /**
   * Check if the workflow is within budget at a specific stage checkpoint.
   * This validates cumulative costs after an agent completes its work.
   *
   * @param agentName The agent that just completed
   * @param state The current workflow state
   * @throws Error if the stage checkpoint budget is exceeded
   */
  public checkStageCheckpoint(agentName: string, state: WorkflowState): void {
    const checkpoint = CostMonitor.STAGE_CHECKPOINTS[agentName];

    if (checkpoint === undefined) {
      // Unknown agent - use total budget as fallback
      console.warn(`[CostMonitor] No checkpoint defined for agent '${agentName}'. Using total budget check.`);
      this.checkBudget(state, `checkpoint-${agentName}`);
      return;
    }

    const currentCost = state.totalCost || 0;

    if (currentCost > checkpoint) {
      throw new Error(
        `Stage checkpoint budget exceeded after '${agentName}'. ` +
        `Current: $${currentCost.toFixed(4)}, Checkpoint Limit: $${checkpoint.toFixed(2)}`
      );
    }
  }

  /**
   * Get the cumulative budget limit for a specific stage checkpoint.
   *
   * @param agentName The agent name
   * @returns The checkpoint limit, or null if unknown agent
   */
  public getStageCheckpoint(agentName: string): number | null {
    return CostMonitor.STAGE_CHECKPOINTS[agentName] ?? null;
  }

  /**
   * Get all stage checkpoint limits.
   *
   * @returns Record of agent names to their checkpoint limits
   */
  public getAllStageCheckpoints(): Record<string, number> {
    return { ...CostMonitor.STAGE_CHECKPOINTS };
  }

  /**
   * Reset all cost tracking in the state.
   * Useful for testing and recovery scenarios.
   *
   * @param state The workflow state to reset
   */
  public reset(state: WorkflowState): void {
    state.totalCost = 0;
    state.stepCosts = {};
    state.budgetRemaining = CostMonitor.BUDGET_LIMITS.TOTAL;
  }

  /**
   * Activate emergency stop mode.
   * When active, all budget checks will throw errors immediately.
   * Useful for testing and emergency shutdown scenarios.
   */
  public activateEmergencyStop(): void {
    this.emergencyStop = true;
  }

  /**
   * Deactivate emergency stop mode.
   * Restores normal budget checking behavior.
   */
  public deactivateEmergencyStop(): void {
    this.emergencyStop = false;
  }

  /**
   * Check if emergency stop mode is active.
   */
  public isEmergencyStopActive(): boolean {
    return this.emergencyStop;
  }

  /**
   * Override checkBudget to respect emergency stop.
   * Throws immediately if emergency stop is active.
   */
  public checkBudget(state: WorkflowState, stage: string): boolean {
    if (this.emergencyStop) {
      throw new Error(`Emergency stop activated. Budget check failed at stage '${stage}'.`);
    }

    const currentCost = state.totalCost || 0;
    const limit = CostMonitor.BUDGET_LIMITS.TOTAL;

    if (currentCost > limit) {
      throw new Error(`Budget exceeded at stage '${stage}'. Current: $${currentCost.toFixed(4)}, Limit: $${limit.toFixed(2)}`);
    }

    return true;
  }
}
