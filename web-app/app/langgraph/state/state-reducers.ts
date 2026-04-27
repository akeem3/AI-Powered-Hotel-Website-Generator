// web-app/app/langgraph/state/state-reducers.ts
import { WorkflowState } from './types';

/**
 * Reducer for total cost - accumulates costs
 */
export const totalCostReducer = (
  existing: WorkflowState['totalCost'],
  update: WorkflowState['totalCost']
): WorkflowState['totalCost'] => {
  return (existing || 0) + (update || 0);
};

/**
 * Reducer for step costs - merges cost records
 */
export const stepCostsReducer = (
  existing: WorkflowState['stepCosts'],
  update: WorkflowState['stepCosts']
): WorkflowState['stepCosts'] => {
  return {
    ...(existing || {}),
    ...(update || {}),
  };
};

/**
 * Reducer for workflow errors - replaces errors for retry scenarios
 *
 * Story 22.5 Fix: Changed from accumulate to replace mode.
 * Each retry should start fresh with new errors, not accumulate previous errors.
 * This prevents error count from growing: 1 → 2 → 3 across retries.
 *
 * The reducer now replaces the errors array instead of appending to it,
 * ensuring that each retry attempt has a clean error state.
 */
export const errorsReducer = (
  existing: WorkflowState['errors'],
  update: WorkflowState['errors']
): WorkflowState['errors'] => {
  // REPLACE instead of ACCUMULATE for retry scenarios
  // Each retry should start fresh, not accumulate previous errors
  return update || [];
};

/**
 * Default reducers for simple fields (replace logic)
 */
export const replaceReducer = <T>(existing: T, update: T): T => update;
