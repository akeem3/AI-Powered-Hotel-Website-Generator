/**
 * Budget Checkpoint Utility
 *
 * Defines the budget thresholds for each stage of the homepage generation workflow.
 * These thresholds are cumulative limits after each agent execution.
 *
 * Story 20.6: Added ArchetypeClassifier and TokenGenerator checkpoints at workflow start.
 * Aligned with CostMonitor.STAGE_CHECKPOINTS for consistent budget enforcement.
 */

import { CostMonitor } from '../services/CostMonitor';

export const BUDGET_CHECKPOINTS: Record<string, number> = {
  // Story 20.2: ArchetypeClassifier (classification task, small prompt)
  'archetypeClassifier': CostMonitor.TOTAL_BUDGET * 0.05, // 5%
  // Story 20.3: TokenGenerator (medium prompt, structured output, APCA validation)
  'tokenGenerator': CostMonitor.TOTAL_BUDGET * 0.08,      // 8% cumulative (5% + 3%)
  'componentSelector': CostMonitor.TOTAL_BUDGET * 0.25,    // 25% cumulative (8% + 17%)
  'stylingAgent': CostMonitor.TOTAL_BUDGET * 0.42,         // 42% cumulative (25% + 17%)
  'contentGenerator': CostMonitor.TOTAL_BUDGET * 0.82,     // 82% cumulative (42% + 40%)
  'assemblyAgent': CostMonitor.TOTAL_BUDGET * 0.92,        // 92% cumulative (82% + 10%)
  'qualityValidator': CostMonitor.TOTAL_BUDGET,            // 100% cumulative (92% + 8%)
};

/**
 * Validates if the total cost is within the budget checkpoint for a given node.
 * 
 * @param nodeName The name of the node that just finished execution
 * @param totalCost The cumulative total cost so far
 * @returns boolean true if within budget, false if exceeded
 */
export function isWithinBudgetCheckpoint(nodeName: string, totalCost: number): boolean {
  const checkpoint = BUDGET_CHECKPOINTS[nodeName];
  
  if (checkpoint === undefined) {
    // If no checkpoint defined, use the final total budget
    return totalCost <= BUDGET_CHECKPOINTS['qualityValidator'];
  }
  
  return totalCost <= checkpoint;
}
