import { CostMonitor } from '../../../app/langgraph/services/CostMonitor';
import { WorkflowState } from '../../../app/langgraph/state/types';

describe('CostMonitor', () => {
  let monitor: CostMonitor;
  let mockState: Partial<WorkflowState>;

  beforeEach(() => {
    monitor = new CostMonitor();
    mockState = {
      totalCost: 0,
      stepCosts: {},
      budgetRemaining: 2.00,
      generationId: 'test-gen-1',
      hotelParameters: {
        hotelType: 'luxury',
        targetAudience: 'couples',
        brandPersonality: 'elegant',
        hotelName: 'Test Hotel',
        location: 'Paris, France'
      },
      componentSelection: undefined,
      stylingSelection: undefined,
      contentGeneration: undefined,
      assembledConfig: undefined,
      validationStatus: 'pending',
      validationErrors: [],
      qualityScore: undefined,
      currentAgent: '',
      retryCount: 0,
      errors: [],
    };
  });

  describe('checkBudget', () => {
    it('should allow execution when within budget', () => {
      mockState.totalCost = 1.50;
      expect(() => monitor.checkBudget(mockState as WorkflowState, 'TestStage')).not.toThrow();
    });

    it('should throw error when budget is exceeded', () => {
      mockState.totalCost = 2.01;
      expect(() => monitor.checkBudget(mockState as WorkflowState, 'TestStage'))
        .toThrow(/Budget exceeded at stage 'TestStage'/);
    });

    it('should throw error with exact budget limit', () => {
      mockState.totalCost = 2.00;
      expect(() => monitor.checkBudget(mockState as WorkflowState, 'TestStage')).not.toThrow();
    });

    it('should handle undefined totalCost', () => {
      delete (mockState as any).totalCost;
      expect(() => monitor.checkBudget(mockState as WorkflowState, 'TestStage')).not.toThrow();
    });
  });

  describe('checkBudget - Emergency Stop', () => {
    it('should throw error when emergency stop is active', () => {
      monitor.activateEmergencyStop();
      mockState.totalCost = 0.50;

      expect(() => monitor.checkBudget(mockState as WorkflowState, 'TestStage'))
        .toThrow(/Emergency stop activated. Budget check failed at stage 'TestStage'/);
    });

    it('should allow execution when emergency stop is deactivated', () => {
      monitor.activateEmergencyStop();
      monitor.deactivateEmergencyStop();
      mockState.totalCost = 0.50;

      expect(() => monitor.checkBudget(mockState as WorkflowState, 'TestStage')).not.toThrow();
    });

    it('should check if emergency stop is active', () => {
      expect(monitor.isEmergencyStopActive()).toBe(false);

      monitor.activateEmergencyStop();
      expect(monitor.isEmergencyStopActive()).toBe(true);

      monitor.deactivateEmergencyStop();
      expect(monitor.isEmergencyStopActive()).toBe(false);
    });
  });

  describe('estimateCost', () => {
    it('should estimate costs for default model', () => {
      const cost = monitor.estimateCost('default', 1000, 1000);
      // Default pricing (Kimi K2): input 0.0001, output 0.0004
      // 1 * 0.0001 + 1 * 0.0004 = 0.0005
      expect(cost).toBeCloseTo(0.0005);
    });

    it('should estimate costs for components-model', () => {
      const cost = monitor.estimateCost('components-model', 1000, 1000);
      // components-model not in pricing table, uses default (Kimi K2): input 0.0001, output 0.0004
      // 1 * 0.0001 + 1 * 0.0004 = 0.0005
      expect(cost).toBeCloseTo(0.0005);
    });

    it('should estimate costs for unknown model (uses default)', () => {
      const cost = monitor.estimateCost('unknown-model', 2000, 3000);
      // Uses default (Kimi K2) pricing: input 0.0001, output 0.0004
      // 2 * 0.0001 + 3 * 0.0004 = 0.0014
      expect(cost).toBeCloseTo(0.0014);
    });

    it('should handle zero tokens', () => {
      const cost = monitor.estimateCost('default', 0, 0);
      expect(cost).toBe(0);
    });
  });

  describe('getRemainingBudget', () => {
    it('should calculate remaining budget correctly', () => {
      mockState.totalCost = 0.50;
      expect(monitor.getRemainingBudget(mockState as WorkflowState)).toBe(1.50);
    });

    it('should return full budget when no cost incurred', () => {
      mockState.totalCost = 0;
      expect(monitor.getRemainingBudget(mockState as WorkflowState)).toBe(2.00);
    });

    it('should return zero when budget is exhausted', () => {
      mockState.totalCost = 2.00;
      expect(monitor.getRemainingBudget(mockState as WorkflowState)).toBe(0);
    });

    it('should handle undefined totalCost', () => {
      delete (mockState as any).totalCost;
      expect(monitor.getRemainingBudget(mockState as WorkflowState)).toBe(2.00);
    });
  });

  describe('trackStepCost', () => {
    it('should track cost for a step and update total', () => {
      const newTotal = monitor.trackStepCost('ComponentSelector', 0.25, mockState as WorkflowState);

      expect(mockState.stepCosts!['ComponentSelector']).toBe(0.25);
      expect(mockState.totalCost).toBe(0.25);
      expect(mockState.budgetRemaining).toBe(1.75);
      expect(newTotal).toBe(0.25);
    });

    it('should accumulate costs for same step', () => {
      monitor.trackStepCost('ComponentSelector', 0.20, mockState as WorkflowState);
      monitor.trackStepCost('ComponentSelector', 0.15, mockState as WorkflowState);

      expect(mockState.stepCosts!['ComponentSelector']).toBe(0.35);
      expect(mockState.totalCost).toBe(0.35);
    });

    it('should track costs for multiple agents', () => {
      monitor.trackStepCost('ComponentSelector', 0.30, mockState as WorkflowState);
      monitor.trackStepCost('StylingAgent', 0.25, mockState as WorkflowState);
      monitor.trackStepCost('ContentGenerator', 0.50, mockState as WorkflowState);

      expect(mockState.stepCosts!['ComponentSelector']).toBe(0.30);
      expect(mockState.stepCosts!['StylingAgent']).toBe(0.25);
      expect(mockState.stepCosts!['ContentGenerator']).toBe(0.50);
      expect(mockState.totalCost).toBe(1.05);
    });

    it('should initialize stepCosts if not present', () => {
      delete (mockState as any).stepCosts;
      monitor.trackStepCost('ComponentSelector', 0.30, mockState as WorkflowState);

      expect(mockState.stepCosts).toEqual({ ComponentSelector: 0.30 });
    });

    it('should initialize totalCost if not present', () => {
      delete (mockState as any).totalCost;
      monitor.trackStepCost('ComponentSelector', 0.30, mockState as WorkflowState);

      expect(mockState.totalCost).toBe(0.30);
    });
  });

  describe('getStepCost', () => {
    beforeEach(() => {
      mockState.stepCosts = {
        'ComponentSelector': 0.30,
        'StylingAgent': 0.25,
      };
    });

    it('should get cost for existing step', () => {
      expect(monitor.getStepCost('ComponentSelector', mockState as WorkflowState)).toBe(0.30);
      expect(monitor.getStepCost('StylingAgent', mockState as WorkflowState)).toBe(0.25);
    });

    it('should return 0 for non-existent step', () => {
      expect(monitor.getStepCost('ContentGenerator', mockState as WorkflowState)).toBe(0);
    });

    it('should handle undefined stepCosts', () => {
      delete (mockState as any).stepCosts;
      expect(monitor.getStepCost('ComponentSelector', mockState as WorkflowState)).toBe(0);
    });
  });

  describe('getAllStepCosts', () => {
    it('should return all step costs', () => {
      mockState.stepCosts = {
        'ComponentSelector': 0.30,
        'StylingAgent': 0.25,
        'ContentGenerator': 0.50,
      };

      const costs = monitor.getAllStepCosts(mockState as WorkflowState);
      expect(costs).toEqual({
        'ComponentSelector': 0.30,
        'StylingAgent': 0.25,
        'ContentGenerator': 0.50,
      });
    });

    it('should return empty object when no step costs', () => {
      delete (mockState as any).stepCosts;
      expect(monitor.getAllStepCosts(mockState as WorkflowState)).toEqual({});
    });
  });

  describe('hasStepExceededBudget', () => {
    beforeEach(() => {
      mockState.stepCosts = {
        'ComponentSelector': 0.30,
        'StylingAgent': 0.45, // Exceeds 0.40 budget
      };
    });

    it('should return true when step exceeded budget', () => {
      expect(monitor.hasStepExceededBudget('StylingAgent', mockState as WorkflowState)).toBe(true);
    });

    it('should return false when step within budget', () => {
      expect(monitor.hasStepExceededBudget('ComponentSelector', mockState as WorkflowState)).toBe(false);
    });

    it('should return false for unknown agent', () => {
      expect(monitor.hasStepExceededBudget('UnknownAgent', mockState as WorkflowState)).toBe(false);
    });

    it('should return false for non-existent step', () => {
      expect(monitor.hasStepExceededBudget('ContentGenerator', mockState as WorkflowState)).toBe(false);
    });
  });

  describe('getStepBudget', () => {
    it('should return budget for known agents', () => {
      expect(monitor.getStepBudget('ComponentSelector')).toBe(0.40);
      expect(monitor.getStepBudget('StylingAgent')).toBe(0.40);
      expect(monitor.getStepBudget('ContentGenerator')).toBe(0.80);
      expect(monitor.getStepBudget('AssemblyAgent')).toBe(0.20);
      expect(monitor.getStepBudget('QualityValidator')).toBe(0.20);
    });

    it('should return null for unknown agent', () => {
      expect(monitor.getStepBudget('UnknownAgent')).toBeNull();
    });
  });

  describe('checkStageCheckpoint', () => {
    it('should pass when within checkpoint budget', () => {
      mockState.totalCost = 0.35;
      expect(() => monitor.checkStageCheckpoint('ComponentSelector', mockState as WorkflowState))
        .not.toThrow();
    });

    it('should pass when exactly at checkpoint budget', () => {
      mockState.totalCost = 0.40;
      expect(() => monitor.checkStageCheckpoint('ComponentSelector', mockState as WorkflowState))
        .not.toThrow();
    });

    it('should throw error when checkpoint budget exceeded', () => {
      mockState.totalCost = 0.45;
      expect(() => monitor.checkStageCheckpoint('ComponentSelector', mockState as WorkflowState))
        .toThrow(/Stage checkpoint budget exceeded after 'ComponentSelector'/);
    });

    it('should check StylingAgent checkpoint', () => {
      mockState.totalCost = 0.75;
      expect(() => monitor.checkStageCheckpoint('StylingAgent', mockState as WorkflowState))
        .not.toThrow();

      mockState.totalCost = 0.85;
      expect(() => monitor.checkStageCheckpoint('StylingAgent', mockState as WorkflowState))
        .toThrow(/Stage checkpoint budget exceeded after 'StylingAgent'/);
    });

    it('should check ContentGenerator checkpoint', () => {
      mockState.totalCost = 1.50;
      expect(() => monitor.checkStageCheckpoint('ContentGenerator', mockState as WorkflowState))
        .not.toThrow();

      mockState.totalCost = 1.70;
      expect(() => monitor.checkStageCheckpoint('ContentGenerator', mockState as WorkflowState))
        .toThrow(/Stage checkpoint budget exceeded after 'ContentGenerator'/);
    });

    it('should check AssemblyAgent checkpoint', () => {
      mockState.totalCost = 1.75;
      expect(() => monitor.checkStageCheckpoint('AssemblyAgent', mockState as WorkflowState))
        .not.toThrow();

      mockState.totalCost = 1.85;
      expect(() => monitor.checkStageCheckpoint('AssemblyAgent', mockState as WorkflowState))
        .toThrow(/Stage checkpoint budget exceeded after 'AssemblyAgent'/);
    });

    it('should check QualityValidator checkpoint (final)', () => {
      mockState.totalCost = 1.95;
      expect(() => monitor.checkStageCheckpoint('QualityValidator', mockState as WorkflowState))
        .not.toThrow();

      mockState.totalCost = 2.05;
      expect(() => monitor.checkStageCheckpoint('QualityValidator', mockState as WorkflowState))
        .toThrow(/Stage checkpoint budget exceeded after 'QualityValidator'/);
    });

    it('should handle undefined totalCost', () => {
      delete (mockState as any).totalCost;
      expect(() => monitor.checkStageCheckpoint('ComponentSelector', mockState as WorkflowState))
        .not.toThrow();
    });

    it('should fall back to total budget check for unknown agent', () => {
      mockState.totalCost = 1.50;
      expect(() => monitor.checkStageCheckpoint('UnknownAgent', mockState as WorkflowState))
        .not.toThrow();
    });
  });

  describe('getStageCheckpoint', () => {
    it('should return checkpoint for known agents', () => {
      expect(monitor.getStageCheckpoint('ComponentSelector')).toBe(0.40);
      expect(monitor.getStageCheckpoint('StylingAgent')).toBe(0.80);
      expect(monitor.getStageCheckpoint('ContentGenerator')).toBe(1.60);
      expect(monitor.getStageCheckpoint('AssemblyAgent')).toBe(1.80);
      expect(monitor.getStageCheckpoint('QualityValidator')).toBe(2.00);
    });

    it('should return null for unknown agent', () => {
      expect(monitor.getStageCheckpoint('UnknownAgent')).toBeNull();
    });
  });

  describe('getAllStageCheckpoints', () => {
    it('should return all checkpoint limits', () => {
      const checkpoints = monitor.getAllStageCheckpoints();

      expect(checkpoints).toEqual({
        'ComponentSelector': 0.40,
        'StylingAgent': 0.80,
        'ContentGenerator': 1.60,
        'AssemblyAgent': 1.80,
        'QualityValidator': 2.00,
      });
    });

    it('should return a copy (not reference)', () => {
      const checkpoints1 = monitor.getAllStageCheckpoints();
      const checkpoints2 = monitor.getAllStageCheckpoints();

      expect(checkpoints1).not.toBe(checkpoints2);
      expect(checkpoints1).toEqual(checkpoints2);
    });
  });

  describe('reset', () => {
    it('should reset all cost tracking', () => {
      mockState.totalCost = 1.50;
      mockState.stepCosts = { 'ComponentSelector': 0.30, 'StylingAgent': 0.25 };
      mockState.budgetRemaining = 0.50;

      monitor.reset(mockState as WorkflowState);

      expect(mockState.totalCost).toBe(0);
      expect(mockState.stepCosts).toEqual({});
      expect(mockState.budgetRemaining).toBe(2.00);
    });

    it('should reset state with partial data', () => {
      mockState.totalCost = 0.75;
      delete (mockState as any).stepCosts;

      monitor.reset(mockState as WorkflowState);

      expect(mockState.totalCost).toBe(0);
      expect(mockState.stepCosts).toEqual({});
      expect(mockState.budgetRemaining).toBe(2.00);
    });
  });

  describe('Integration Scenarios', () => {
    it('should track workflow through all stages within budget', () => {
      // ComponentSelector completes
      monitor.trackStepCost('ComponentSelector', 0.35, mockState as WorkflowState);
      monitor.checkStageCheckpoint('ComponentSelector', mockState as WorkflowState);
      expect(monitor.hasStepExceededBudget('ComponentSelector', mockState as WorkflowState)).toBe(false);

      // StylingAgent completes
      monitor.trackStepCost('StylingAgent', 0.35, mockState as WorkflowState);
      monitor.checkStageCheckpoint('StylingAgent', mockState as WorkflowState);
      expect(monitor.hasStepExceededBudget('StylingAgent', mockState as WorkflowState)).toBe(false);

      // ContentGenerator completes
      monitor.trackStepCost('ContentGenerator', 0.70, mockState as WorkflowState);
      monitor.checkStageCheckpoint('ContentGenerator', mockState as WorkflowState);
      expect(monitor.hasStepExceededBudget('ContentGenerator', mockState as WorkflowState)).toBe(false);

      // AssemblyAgent completes
      monitor.trackStepCost('AssemblyAgent', 0.15, mockState as WorkflowState);
      monitor.checkStageCheckpoint('AssemblyAgent', mockState as WorkflowState);
      expect(monitor.hasStepExceededBudget('AssemblyAgent', mockState as WorkflowState)).toBe(false);

      // QualityValidator completes
      monitor.trackStepCost('QualityValidator', 0.15, mockState as WorkflowState);
      monitor.checkStageCheckpoint('QualityValidator', mockState as WorkflowState);
      expect(monitor.hasStepExceededBudget('QualityValidator', mockState as WorkflowState)).toBe(false);

      // Final check
      expect(mockState.totalCost).toBeCloseTo(1.70, 4);
      expect(monitor.getRemainingBudget(mockState as WorkflowState)).toBeCloseTo(0.30, 4);
      expect(() => monitor.checkBudget(mockState as WorkflowState, 'Final')).not.toThrow();
    });

    it('should detect and stop when component selector exceeds budget', () => {
      monitor.trackStepCost('ComponentSelector', 0.45, mockState as WorkflowState);

      expect(monitor.hasStepExceededBudget('ComponentSelector', mockState as WorkflowState)).toBe(true);
      expect(() => monitor.checkStageCheckpoint('ComponentSelector', mockState as WorkflowState))
        .toThrow(/Stage checkpoint budget exceeded/);
    });

    it('should handle emergency stop during workflow', () => {
      monitor.trackStepCost('ComponentSelector', 0.30, mockState as WorkflowState);

      // Activate emergency stop
      monitor.activateEmergencyStop();

      expect(() => monitor.checkBudget(mockState as WorkflowState, 'StylingAgent'))
        .toThrow(/Emergency stop activated/);
    });
  });
});
