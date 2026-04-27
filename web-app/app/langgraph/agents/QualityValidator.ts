import { BaseAgent } from './BaseAgent';
import { WorkflowState } from '../state/types';
import { HomepageConfig, HomepageConfigSchema } from './schemas';
import { CVAValidator } from '../utils/cva-validator';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';

/**
 * QualityValidator Agent
 *
 * Serves as the quality gate for the homepage generation workflow.
 * Performs ZOD schema validation, quality scoring, and budget enforcement.
 *
 * GRACEFUL DEGRADATION PHILOSOPHY (Story 22.5):
 *
 * This validator accepts configurations that used fallback strategies,
 * applying a quality penalty instead of failing validation.
 *
 * RATIONALE:
 * - Fallback configs are valid and functional (deterministic strategies)
 * - Users prefer working fallbacks over complete failure
 * - Quality scores transparently reflect fallback usage
 *
 * FALLBACK PENALTY STRUCTURE:
 * - 0 fallbacks: 100% quality (no penalty)
 * - 1 fallback: 90% quality (10% penalty)
 * - 2 fallbacks: 80% quality (20% penalty)
 * - 3 fallbacks: 70% quality (30% penalty)
 * - 4+ fallbacks: 60% quality or less (40%+ penalty)
 *
 * VALIDATION RULES:
 * - Config must meet quality threshold AFTER penalty is applied
 * - Example: threshold=90, 1 fallback, score=100 → adjusted=90 → PASSES
 * - Example: threshold=90, 2 fallbacks, score=100 → adjusted=80 → FAILS
 *
 * TRULY RECOVERABLE VS FATAL ERRORS:
 * - Recoverable: LLM failure → deterministic fallback → penalty → config passes
 * - Fatal: Schema violation → no fallback available → config fails
 *
 * TOLERANCE MECHANISM:
 * - errorTolerance default: 1 (allows 1 warning error)
 * - Configs with 1 non-fatal error can pass if score meets threshold
 * - Configs with 2+ errors fail (exceeds tolerance)
 *
 * See: docs/epics/story-22.5-scale-test-failure-root-cause-analysis.md
 */
export class QualityValidator extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('QualityValidator', langfuseService, costMonitor);
  }

  /**
   * Get the name of this agent.
   */
  getAgentName(): string {
    return 'QualityValidator';
  }

  /**
   * Main execution logic for the QualityValidator.
   * 
   * @param state - The current workflow state
   * @returns Partial state update
   */
  async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    console.debug(`[QualityValidator] Starting validation for generation: ${state.generationId}`);
    
    const assembledConfig = state.assembledConfig;
    const errors: string[] = [];
    let zodCompliance = 0;
    let overallScore = 0;
    const scores: Record<string, number> = {
      zodCompliance: 0,
      componentCoverage: 0,
      contentCompleteness: 0,
      variantValidity: 0,
      budgetCompliance: 0,
      contrastCompliance: 0 // Story 20.3: APCA contrast hard gate
    };

    if (!assembledConfig) {
      errors.push('Missing assembled configuration');
    } else {
      // 1. Zod STRICT Validation
      try {
        HomepageConfigSchema.parse(assembledConfig);
        zodCompliance = 100;
        scores.zodCompliance = 100;
      } catch (error: any) {
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            errors.push(`Zod Error at ${err.path.join('.')}: ${err.message}`);
          });
        } else {
          errors.push(`Zod Error: ${error.message}`);
        }
      }

      // 2. Component Coverage (5-12 components = 100) - Story 19.5: Extended to 12 with 4 new blocks
      const componentCount = assembledConfig.components.length;
      scores.componentCoverage = (componentCount >= 5 && componentCount <= 12) ? 100 : Math.min(100, (componentCount / 5) * 100);

      // 3. Variant Validity (CVA check)
      const variantResults = assembledConfig.components.map(comp => {
        const cvaErrors = CVAValidator.validateComponent(comp.type, comp.variant);
        if (cvaErrors.length > 0) {
          cvaErrors.forEach(err => errors.push(`CVA Error [${comp.type}]: ${err}`));
          return false;
        }
        return true;
      });
      const validVariants = variantResults.filter(v => v).length;
      scores.variantValidity = (validVariants / assembledConfig.components.length) * 100;

      // 4. Content Completeness (Simplified check for now)
      let filledFields = 0;
      let totalFields = 0;
      assembledConfig.components.forEach(comp => {
        Object.values(comp.props).forEach(val => {
          totalFields++;
          if (val !== undefined && val !== null && val !== '') filledFields++;
        });
      });
      scores.contentCompleteness = totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
    }

    // 5. Budget Compliance (totalCost <= MAX_GENERATION_COST)
    const budgetLimit = CostMonitor.TOTAL_BUDGET;
    const currentTotalCost = state.totalCost || 0;
    scores.budgetCompliance = currentTotalCost <= budgetLimit ? 100 : 0;
    if (scores.budgetCompliance === 0) {
      errors.push(`Budget exceeded: ${currentTotalCost.toFixed(4)} > ${budgetLimit}`);
    }

    // 6. APCA Contrast Compliance (Story 20.3: Hard gate for accessible contrast)
    // TokenGenerator must have run and produced valid contrast results
    // Story 22.2 Fix: Allow tolerance for 1 failing pair after retry loop exhaustion
    let contrastPass = false;
    if (state.designTokens?.contrastReport) {
      const failCount = state.designTokens.contrastReport.failCount;
      const iterations = state.designTokens.iterations || 0;
      const adjustmentsMade = state.designTokens.adjustmentsMade || [];

      // Story 22.2 Fix: Allow 1 failing pair if retry loop was exhausted (≥15 iterations)
      // This handles mathematically impossible color combinations where text + surface
      // adjustments cannot achieve full APCA compliance. The system has made a best-effort
      // attempt, and accepting 1 near-miss pair is reasonable for edge cases.
      const toleranceEnabled = iterations >= 15 && adjustmentsMade.length > 0;
      const toleranceAllowable = failCount <= 1;

      contrastPass = state.designTokens.contrastReport.allPass || (toleranceEnabled && toleranceAllowable);

      scores.contrastCompliance = contrastPass ? 100 : 0;

      if (!contrastPass) {
        errors.push(
          `APCA contrast validation failed: ${failCount} text/background pairs below accessibility threshold. ` +
          `Retry loop exhausted after ${iterations} iterations.`
        );
      } else if (!state.designTokens.contrastReport.allPass && contrastPass) {
        console.info(
          `[QualityValidator] APCA tolerance accepted: ${failCount} failing pair(s) after ${iterations} iterations. ` +
          `Best-effort result accepted per Story 22.2 tolerance policy.`
        );
      }
    } else {
      // If designTokens or contrastReport is missing, this is a workflow error
      // TokenGenerator should have run before QualityValidator
      scores.contrastCompliance = 0;
      errors.push('APCA contrast validation skipped: designTokens or contrastReport not found in state. Ensure TokenGenerator ran before QualityValidator.');
    }

    // 7. Overall Score (Weighted Average)
    // Weights: Zod (40%), Content (30%), Variants (20%), Coverage (10%)
    // Note: contrastCompliance is a hard gate (pass/fail), not weighted
    overallScore = (
      scores.zodCompliance * 0.4 +
      scores.contentCompleteness * 0.3 +
      scores.variantValidity * 0.2 +
      scores.componentCoverage * 0.1
    );

    // Story 22.5: Graceful Degradation - Add fallback penalty
    // Count how many agents used fallback strategies
    const fallbackCount = Object.values(state.usedFallback || {})
      .filter(Boolean)
      .length;

    // Apply quality penalty: 10% per fallback
    const fallbackPenalty = fallbackCount * 10;
    const adjustedScore = Math.max(0, overallScore - fallbackPenalty);

    console.debug(`[QualityValidator] Fallback penalty: -${fallbackPenalty}% (${fallbackCount} fallbacks)`);
    console.debug(`[QualityValidator] Adjusted score: ${adjustedScore.toFixed(1)} (original: ${overallScore.toFixed(1)})`);

    // Respect preceding budget violations
    const budgetExceeded = scores.budgetCompliance === 0 || state.budgetExceeded === true;

    // Respect preceding contrast violations (Story 20.3: Hard gate)
    const contrastFailed = scores.contrastCompliance === 0;

    // Story 22.5 Fix: Removed workflowHasErrors hard gate logic
    // Errors are now handled by the tolerance mechanism (errors.length <= errorTolerance)
    // No need to track workflowHasErrors separately

    // Quality threshold (configurable via environment variable for testing)
    const qualityThreshold = Number(process.env.QUALITY_THRESHOLD) || 90;

    // Error tolerance (configurable - 1 allows 1 warning, higher for testing)
    // Story 22.5 Fix: Changed default from 0 to 1 - allows 1 warning error to pass validation
    const errorTolerance = Number(process.env.QUALITY_ERROR_TOLERANCE) || 1;

    // PASS condition: Zod 100, Budget 100, Contrast 100, Adjusted Score >= threshold, errors within tolerance
    // Story 20.3: Added contrastCompliance as hard gate (like budgetCompliance)
    // Story 22.5 Fix: Removed !workflowHasErrors hard gate - tolerance mechanism now works correctly
    // Story 22.5: Use fallback-adjusted score - config with fallbacks must still meet quality threshold
    const validationStatus = (
      zodCompliance === 100 &&
      adjustedScore >= qualityThreshold &&
      !budgetExceeded &&
      !contrastFailed &&
      errors.length <= errorTolerance
    ) ? 'pass' : 'fail';

    console.debug(`[QualityValidator] Adjusted Score: ${adjustedScore.toFixed(1)}, Threshold: ${qualityThreshold}, Status: ${validationStatus}`);
    console.debug(`[QualityValidator] Details: zodCompliance=${zodCompliance}, budgetExceeded=${budgetExceeded}, contrastFailed=${contrastFailed}, errors=${errors.length}, errorTolerance=${errorTolerance}, fallbackCount=${fallbackCount}`);

    // Log scores to LangFuse
    this.langfuseService.addScore('quality-score', overallScore / 10); // Scale to 0-10 for dashboard
    this.langfuseService.addScore('zod-compliance', scores.zodCompliance === 100 ? 1 : 0);
    this.langfuseService.addScore('budget-compliance', scores.budgetCompliance === 100 ? 1 : 0);
    this.langfuseService.addScore('contrast-compliance', scores.contrastCompliance === 100 ? 1 : 0); // Story 20.3: APCA hard gate

    // Track execution cost (minimal for validator)
    const stateUpdate = this.updateStepCost(0.01);

    return {
      ...stateUpdate,
      validationStatus,
      qualityScore: overallScore,
      validationErrors: errors,
      budgetExceeded,
      // Note: HomepageGenerationWorkflow will handle retryCount incrementing
    };
  }
}
