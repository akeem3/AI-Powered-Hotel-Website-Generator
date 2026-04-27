import { CostMonitor } from '../../app/langgraph/services/CostMonitor';
import { isWithinBudgetCheckpoint } from '../../app/langgraph/utils/BudgetCheckpoint';
import { WorkflowState } from '../../app/langgraph/state/types';

/**
 * Budget Compliance Test Suite
 *
 * Requirement: Story 7.10 AC4
 * - Verify budget enforcement checkpoints halt generation when thresholds exceeded
 * - Checkpoint thresholds (based on TOTAL_BUDGET of $2.00):
 *   - $0.40 after ComponentSelector (20%)
 *   - $0.80 after StylingAgent (40%)
 *   - $1.60 after ContentGenerator (80%)
 *   - $1.80 after AssemblyAgent (90%)
 *   - $2.00 final (100%)
 *
 * These tests verify the checkpoint logic WITHOUT making real LLM calls.
 * They use CostMonitor directly to validate budget enforcement.
 */

describe('Budget Compliance Tests (No LLM Calls)', () => {
  let costMonitor: CostMonitor;
  let testState: WorkflowState;

  beforeEach(() => {
    costMonitor = new CostMonitor();
    testState = {
      generationId: 'test-generation',
      hotelParameters: {
        hotelName: 'Test Hotel',
        hotelType: 'luxury',
        targetAudience: 'business',
        brandPersonality: 'professional',
        location: 'Test City'
      },
      totalCost: 0,
      stepCosts: {},
      budgetRemaining: CostMonitor.TOTAL_BUDGET,
      retryCount: 0,
      validationStatus: 'pending',
      errors: [],
      budgetExceeded: false
    } as unknown as WorkflowState;
  });

  describe('Checkpoint Threshold Validation', () => {
    const TOTAL_BUDGET = CostMonitor.TOTAL_BUDGET;

    it('should have correct total budget of $2.00', () => {
      expect(TOTAL_BUDGET).toBe(2.00);
    });

    it('should enforce $0.40 checkpoint after ComponentSelector (20%)', () => {
      const checkpoint = costMonitor.getStageCheckpoint('ComponentSelector');
      expect(checkpoint).toBe(0.40); // 20% of $2.00

      // Test within budget
      expect(isWithinBudgetCheckpoint('componentSelector', 0.39)).toBe(true);

      // Test at exact limit
      expect(isWithinBudgetCheckpoint('componentSelector', 0.40)).toBe(true);

      // Test exceeded
      expect(isWithinBudgetCheckpoint('componentSelector', 0.41)).toBe(false);
    });

    it('should enforce $0.80 checkpoint after StylingAgent (40%)', () => {
      const checkpoint = costMonitor.getStageCheckpoint('StylingAgent');
      expect(checkpoint).toBe(0.80); // 40% of $2.00

      // Test within budget
      expect(isWithinBudgetCheckpoint('stylingAgent', 0.79)).toBe(true);

      // Test at exact limit
      expect(isWithinBudgetCheckpoint('stylingAgent', 0.80)).toBe(true);

      // Test exceeded
      expect(isWithinBudgetCheckpoint('stylingAgent', 0.81)).toBe(false);
    });

    it('should enforce $1.60 checkpoint after ContentGenerator (80%)', () => {
      const checkpoint = costMonitor.getStageCheckpoint('ContentGenerator');
      expect(checkpoint).toBe(1.60); // 80% of $2.00

      // Test within budget
      expect(isWithinBudgetCheckpoint('contentGenerator', 1.59)).toBe(true);

      // Test at exact limit
      expect(isWithinBudgetCheckpoint('contentGenerator', 1.60)).toBe(true);

      // Test exceeded
      expect(isWithinBudgetCheckpoint('contentGenerator', 1.61)).toBe(false);
    });

    it('should enforce $1.80 checkpoint after AssemblyAgent (90%)', () => {
      const checkpoint = costMonitor.getStageCheckpoint('AssemblyAgent');
      expect(checkpoint).toBe(1.80); // 90% of $2.00

      // Test within budget
      expect(isWithinBudgetCheckpoint('assemblyAgent', 1.79)).toBe(true);

      // Test at exact limit
      expect(isWithinBudgetCheckpoint('assemblyAgent', 1.80)).toBe(true);

      // Test exceeded
      expect(isWithinBudgetCheckpoint('assemblyAgent', 1.81)).toBe(false);
    });

    it('should enforce $2.00 final checkpoint (100%)', () => {
      const checkpoint = costMonitor.getStageCheckpoint('QualityValidator');
      expect(checkpoint).toBe(2.00); // 100% of $2.00

      // Test within budget
      expect(isWithinBudgetCheckpoint('qualityValidator', 1.99)).toBe(true);

      // Test at exact limit
      expect(isWithinBudgetCheckpoint('qualityValidator', 2.00)).toBe(true);

      // Test exceeded
      expect(isWithinBudgetCheckpoint('qualityValidator', 2.01)).toBe(false);
    });
  });

  describe('Stage Checkpoint Enforcement', () => {
    it('should throw error when ComponentSelector checkpoint exceeded', () => {
      testState.totalCost = 0.41; // Just over $0.40

      expect(() => {
        costMonitor.checkStageCheckpoint('ComponentSelector', testState);
      }).toThrow('Stage checkpoint budget exceeded');
    });

    it('should throw error when StylingAgent checkpoint exceeded', () => {
      testState.totalCost = 0.81; // Just over $0.80

      expect(() => {
        costMonitor.checkStageCheckpoint('StylingAgent', testState);
      }).toThrow('Stage checkpoint budget exceeded');
    });

    it('should throw error when ContentGenerator checkpoint exceeded', () => {
      testState.totalCost = 1.61; // Just over $1.60

      expect(() => {
        costMonitor.checkStageCheckpoint('ContentGenerator', testState);
      }).toThrow('Stage checkpoint budget exceeded');
    });

    it('should throw error when AssemblyAgent checkpoint exceeded', () => {
      testState.totalCost = 1.81; // Just over $1.80

      expect(() => {
        costMonitor.checkStageCheckpoint('AssemblyAgent', testState);
      }).toThrow('Stage checkpoint budget exceeded');
    });

    it('should throw error when final checkpoint exceeded', () => {
      testState.totalCost = 2.01; // Just over $2.00

      expect(() => {
        costMonitor.checkStageCheckpoint('QualityValidator', testState);
      }).toThrow('Stage checkpoint budget exceeded');
    });

    it('should NOT throw error when all checkpoints within limits', () => {
      // Simulate costs at each stage (within limits)
      testState.totalCost = 0.30;
      expect(() => costMonitor.checkStageCheckpoint('ComponentSelector', testState)).not.toThrow();

      testState.totalCost = 0.70;
      expect(() => costMonitor.checkStageCheckpoint('StylingAgent', testState)).not.toThrow();

      testState.totalCost = 1.50;
      expect(() => costMonitor.checkStageCheckpoint('ContentGenerator', testState)).not.toThrow();

      testState.totalCost = 1.70;
      expect(() => costMonitor.checkStageCheckpoint('AssemblyAgent', testState)).not.toThrow();

      testState.totalCost = 1.95;
      expect(() => costMonitor.checkStageCheckpoint('QualityValidator', testState)).not.toThrow();
    });
  });

  describe('Step Budget Allocations', () => {
    it('should have correct step budget allocations', () => {
      const componentBudget = costMonitor.getStepBudget('ComponentSelector');
      const stylingBudget = costMonitor.getStepBudget('StylingAgent');
      const contentBudget = costMonitor.getStepBudget('ContentGenerator');
      const assemblyBudget = costMonitor.getStepBudget('AssemblyAgent');
      const qualityBudget = costMonitor.getStepBudget('QualityValidator');

      // Step budgets are individual allocations (not cumulative)
      expect(componentBudget).toBe(0.40); // 20%
      expect(stylingBudget).toBe(0.40);   // 20%
      expect(contentBudget).toBe(0.80);   // 40%
      expect(assemblyBudget).toBe(0.20);  // 10%
      expect(qualityBudget).toBe(0.20);   // 10%
    });
  });

  describe('Cost Tracking', () => {
    it('should track step costs correctly', () => {
      costMonitor.trackStepCost('ComponentSelector', 0.20, testState);
      expect(testState.stepCosts!['ComponentSelector']).toBe(0.20);
      expect(testState.totalCost).toBe(0.20);

      costMonitor.trackStepCost('StylingAgent', 0.30, testState);
      expect(testState.stepCosts!['StylingAgent']).toBe(0.30);
      expect(testState.totalCost).toBe(0.50);

      costMonitor.trackStepCost('ContentGenerator', 0.80, testState);
      expect(testState.stepCosts!['ContentGenerator']).toBe(0.80);
      expect(testState.totalCost).toBe(1.30);
    });

    it('should update budget remaining correctly', () => {
      costMonitor.trackStepCost('ComponentSelector', 0.50, testState);
      expect(testState.budgetRemaining).toBe(1.50);

      costMonitor.trackStepCost('StylingAgent', 0.30, testState);
      expect(testState.budgetRemaining).toBe(1.20);
    });

    it('should detect step budget exceeded', () => {
      // Track cost exceeding step budget for ComponentSelector ($0.40)
      costMonitor.trackStepCost('ComponentSelector', 0.45, testState);

      expect(costMonitor.hasStepExceededBudget('ComponentSelector', testState)).toBe(true);
    });
  });

  describe('Emergency Stop', () => {
    it('should activate and deactivate emergency stop', () => {
      expect(costMonitor.isEmergencyStopActive()).toBe(false);

      costMonitor.activateEmergencyStop();
      expect(costMonitor.isEmergencyStopActive()).toBe(true);

      costMonitor.deactivateEmergencyStop();
      expect(costMonitor.isEmergencyStopActive()).toBe(false);
    });

    it('should throw error when emergency stop is active', () => {
      costMonitor.activateEmergencyStop();

      expect(() => {
        costMonitor.checkBudget(testState, 'test-stage');
      }).toThrow('Emergency stop activated');
    });

    it('should reset state correctly', () => {
      // Add some costs
      costMonitor.trackStepCost('ComponentSelector', 0.30, testState);
      costMonitor.trackStepCost('StylingAgent', 0.25, testState);
      testState.totalCost = 0.55;

      costMonitor.reset(testState);

      expect(testState.totalCost).toBe(0);
      expect(testState.stepCosts).toEqual({});
      expect(testState.budgetRemaining).toBe(CostMonitor.TOTAL_BUDGET);
    });
  });

  describe('All Stage Checkpoints', () => {
    it('should return all checkpoint limits', () => {
      const checkpoints = costMonitor.getAllStageCheckpoints();

      expect(checkpoints).toEqual({
        ComponentSelector: 0.40,
        StylingAgent: 0.80,
        ContentGenerator: 1.60,
        AssemblyAgent: 1.80,
        QualityValidator: 2.00
      });
    });
  });
});
