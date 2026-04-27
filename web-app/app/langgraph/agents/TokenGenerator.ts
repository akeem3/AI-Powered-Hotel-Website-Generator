import { z } from 'zod';
import { BaseAgent } from './BaseAgent';
import { WorkflowState } from '../state/types';
import { TokenGeneratorOutputSchema, TokenGeneratorOutput, HotelDesignTokensSchema } from './schemas';
import { LangFuseService } from '../services/LangFuseService';
import { CostMonitor } from '../services/CostMonitor';
import { apcaRetryLoopFromColorScheme } from '@/lib/color/apca-retry-loop';

/**
 * TokenGenerator Agent
 *
 * Story 20.3: TokenGenerator Agent + APCA Contrast Retry Loop
 *
 * This agent generates archetype-specific OKLCH color tokens, typography,
 * spacing, and border radius selections, then validates them through
 * APCA contrast checking with automatic retry.
 *
 * The agent:
 * 1. Uses the archetype from state.archetypeClassification for token constraints
 * 2. Generates design tokens via LLM using HotelDesignTokensSchema
 * 3. Extracts color scheme components (primaryHue, primaryChroma, primaryLightness, etc.)
 * 4. Runs APCA retry loop to validate and adjust contrast if needed
 * 5. Returns TokenGeneratorOutput with designTokens, contrastReport, iterations, adjustmentsMade
 *
 * Cost Target: ~$0.01-0.02 per generation (medium prompt, structured output)
 * Model Recommendation: Claude 3.5 Sonnet or equivalent (structured generation task)
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 */
export class TokenGenerator extends BaseAgent {
  constructor(langfuseService?: LangFuseService, costMonitor?: CostMonitor) {
    super('TokenGenerator', langfuseService, costMonitor);
  }

  getAgentName(): string {
    return 'TokenGenerator';
  }

  async performGeneration(state: WorkflowState): Promise<Partial<WorkflowState> & { usage?: any; model?: string }> {
    // Verify prerequisite: archetypeClassification must exist
    if (!state.archetypeClassification) {
      throw new Error(
        'TokenGenerator requires archetypeClassification to be present in state. ' +
        'Ensure ArchetypeClassifier agent runs before TokenGenerator.'
      );
    }

    // Prepare prompt variables with archetype and hotel parameters
    const promptVariables: Record<string, any> = {
      ...state.hotelParameters,
      archetype: state.archetypeClassification.archetype,
      reasoning: state.archetypeClassification.reasoning,
    };

    // Add batch context for diversity when available
    if (state.batchSize !== undefined && state.batchSize > 1) {
      promptVariables.batchIndex = state.batchIndex;
      promptVariables.batchSize = state.batchSize;
      promptVariables.previousArchetypes = state.previousArchetypes;
    }

    // Load the token generator prompt with archetype and hotel parameters
    const prompt = await this.loadPrompt('token-generator', promptVariables);

    // Call OpenRouter with intelligent routing and retries
    // Token generation task - use standard model for structured output
    const response = await this.openRouterClient.sendCompletion(
      [{ role: 'user', content: prompt }],
      {
        agentName: this.agentName,
        budgetRemaining: state.budgetRemaining ?? CostMonitor.TOTAL_BUDGET,
        temperature: 0.95,
      }
    );

    // Extract and validate JSON from response
    let validatedTokens: z.infer<typeof HotelDesignTokensSchema>;
    try {
      const jsonContent = this.extractJson(response.text);
      validatedTokens = HotelDesignTokensSchema.parse(jsonContent);
    } catch (error: any) {
      console.error(`[${this.agentName}] Failed to parse or validate LLM output:`, error.message);
      throw new Error(`${this.agentName} output validation failed: ${error.message}`);
    }

    // Extract color scheme components for APCA retry loop
    const colorScheme = {
      primaryHue: validatedTokens.colorScheme?.primaryHue ?? 0,
      primaryChroma: validatedTokens.colorScheme?.primaryChroma ?? 0,
      primaryLightness: validatedTokens.colorScheme?.primaryLightness ?? 0,
      secondaryHue: validatedTokens.colorScheme?.secondaryHue ?? 0,
      secondaryChroma: validatedTokens.colorScheme?.secondaryChroma ?? 0,
      secondaryLightness: validatedTokens.colorScheme?.secondaryLightness ?? 0,
    };

    // Run APCA retry loop to validate and adjust contrast if needed
    const apcaResult = apcaRetryLoopFromColorScheme(colorScheme);

    // Check if retry loop achieved passing contrast
    if (!apcaResult.success) {
      console.warn(
        `[${this.agentName}] APCA retry loop did not achieve passing contrast after ${apcaResult.iterations} iterations. ` +
        `Failures: ${apcaResult.contrastReport.failCount}`
      );
      // Continue with best-effort result - do not fail the entire generation
    }

    // Build TokenGeneratorOutput
    const tokenGeneratorOutput: TokenGeneratorOutput = {
      designTokens: validatedTokens,
      contrastReport: apcaResult.contrastReport,
      iterations: apcaResult.iterations,
      adjustmentsMade: apcaResult.adjustmentsMade,
    };

    const stateUpdate = this.updateStepCost(response.cost);

    return {
      ...stateUpdate,
      designTokens: tokenGeneratorOutput,
      validationStatus: apcaResult.success ? 'pass' : 'fail',
      validationErrors: apcaResult.success ? [] : [
        `APCA contrast validation failed: ${apcaResult.contrastReport.failCount} pairs below threshold`
      ],
      usage: response.usage,
      model: response.model,
    };
  }
}
