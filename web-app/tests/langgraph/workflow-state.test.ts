// web-app/tests/langgraph/workflow-state.test.ts
import { WorkflowState } from '../../app/langgraph/state/types';
import {
  totalCostReducer,
  stepCostsReducer,
  errorsReducer
} from '../../app/langgraph/state/state-reducers';
import { WorkflowStateAnnotation } from '../../app/langgraph/state/workflow-state';

describe('WorkflowState State Management', () => {
  describe('Reducers', () => {
    test('totalCostReducer should accumulate costs', () => {
      const existing = 10.5;
      const update = 5.25;
      expect(totalCostReducer(existing, update)).toBe(15.75);
    });

    test('totalCostReducer should handle initial cost', () => {
      expect(totalCostReducer(0, 5.0)).toBe(5.0);
    });

    test('stepCostsReducer should merge cost records', () => {
      const existing = { agent1: 10 };
      const update = { agent2: 20 };
      const result = stepCostsReducer(existing, update);
      expect(result).toEqual({ agent1: 10, agent2: 20 });
    });

    test('stepCostsReducer should overwrite individual agent costs if re-run', () => {
      const existing = { agent1: 10, agent2: 20 };
      const update = { agent1: 15 };
      const result = stepCostsReducer(existing, update);
      expect(result).toEqual({ agent1: 15, agent2: 20 });
    });

    test('errorsReducer should accumulate error messages', () => {
      const existing = ['error 1'];
      const update = ['error 2'];
      const result = errorsReducer(existing, update);
      expect(result).toEqual(['error 1', 'error 2']);
    });

    test('errorsReducer should handle initial error', () => {
      expect(errorsReducer([], ['first error'])).toEqual(['first error']);
    });
  });

  describe('WorkflowStateAnnotation', () => {
    test('should initialize with default values', () => {
      // In a real LangGraph setup, the Graph would handle this.
      // Here we verify the logic we've integrated.
      expect(totalCostReducer(undefined as any, 10)).toBe(10);
      expect(stepCostsReducer(undefined as any, { test: 1 })).toEqual({ test: 1 });
      expect(errorsReducer(undefined as any, ['err'])).toEqual(['err']);
    });
  });
});
