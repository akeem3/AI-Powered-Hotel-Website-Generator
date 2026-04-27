# Troubleshooting Guide: Homepage Generation Workflow

This guide covers common issues encountered during the LLM homepage generation process and how to resolve them.

## Common Failure Modes

### 1. API Rate Limits (429 Errors)
**Symptoms**:
- Workflow fails abruptly.
- LangFuse logs show "429 Too Many Requests" from OpenRouter or Kimi provider.

**Resolution**:
- **Check OpenRouter Credits**: Ensure your account has sufficient balance.
- **Backoff Strategy**: The `OpenRouterClient` has built-in exponential backoff, but sustained load may still trigger limits. Wait 60 seconds and try again.

### 2. Budget Exceeded
**Symptoms**:
- Workflow terminates successfully but `assembledConfig` is missing.
- `budgetExceeded: true` in the final state.
- Logs show "Budget exceeded at checkpoint...".

**Resolution**:
- **Agent Tuning**: The prompts may be generating too many tokens. Check `ContentGenerator` usage in LangFuse.
- **Limit Context**: Reduce the number of sections requested by `ComponentSelector` if consistent failures occur.
- **Model Switch**: Ensure you are using the correct cost-effective model (Kimi k2) as configured in `OpenRouterClient`.

### 3. Validity Check Failures (Budget/Structure)
**Symptoms**:
- `validationStatus: 'fail'`.
- `validationErrors` contains messages like "Section count mismatch" or "Missing hero section".

**Resolution**:
- **Retry Logic**: The workflow automatically retries up to 3 times.
- **Prompt Refinement**: If validation fails persistently, the LLM may be misunderstanding constraints.
    - Check the `systemPrompt` for `ComponentSelector` or `StructureAgent`.
    - Ensure strict adherence to Zod schemas in the prompts.

### 4. Timeout Errors (Total Duration > 5 mins)
**Symptoms**:
- Workflow runs for exactly 5 minutes (or 30 mins defaults) then throws a Timeout Error.
- E2E tests fail with "Async callback was not invoked within the 300000ms timeout".

**Resolution**:
- **Network Latency**: Check internet connection stability.
- **Model Latency**: Large models can be slow. Confirm `Kimi` performance on OpenRouter status page.
- **Reduce Complexity**: Generating 8 sections with long copy takes time. Try targeting fewer sections for quicker feedback.

## Debugging with LangFuse

LangFuse is the primary tool for detailed inspection.

1.  **Access Dashboard**: Go to your LangFuse project URL.
2.  **Filter Traces**: Search by `generationId` or filter by `Name = "HomepageGenerationWorkflow"`.
3.  **Inspect Spans**:
    - Click into a trace to see the waterfall view.
    - **Red Bars**: Indicate failed steps. Click to see the specific error message and stack trace.
    - **Agent Inputs/Outputs**: You can see exactly what JSON was sent to and received from the LLM.
4.  **Cost Analysis**:
    - Check the "Total Cost" tag on the trace.
    - Compare against the $2.00 limit.
