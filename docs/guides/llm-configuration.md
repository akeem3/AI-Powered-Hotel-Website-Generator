# LLM Configuration Settings

This document describes the environment variables and configuration settings that control the LLM orchestration system.

## Overview

The LLM service is configured primarily through environment variables. This system allows for flexibility across different deployment environments (development, staging, production) and enables easy model switching and budget management.

## Environment Variables

### Model Configuration

Control which models are used for different budget tiers.

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `PRIMARY_MODEL` | `moonshotai/kimi-k2` | High-performance model used when budget is healthy (> $1.00). |
| `FALLBACK_MODEL` | `anthropic/claude-3-haiku` | Mid-tier model used when budget is moderate ($0.50 - $1.00). |
| `BUDGET_MODEL` | `openai/gpt-4o-mini` | Low-cost model used when budget is tight (< $0.50). |
| `LLM_PROVIDER` | `openrouter` | Selects the LLM provider backend (`openrouter` or `anthropic`). |

### API Keys

Required credentials for external services.

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | Required for `openrouter` provider. |
| `ANTHROPIC_API_KEY` | Required for `anthropic` provider (if used directly). |
| `LANGFUSE_PUBLIC_KEY` | LangFuse project public key. |
| `LANGFUSE_SECRET_KEY` | LangFuse project secret key. |
| `LANGFUSE_BASE_URL` | LangFuse instance URL (e.g., `https://cloud.langfuse.com`). |

### Budget & Timeout

Control workflow constraints.

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `MAX_GENERATION_COST` | `2.00` | Maximum allowed cost (USD) per website generation workflow. **Note:** Model selection logic (`PRIMARY` vs `BUDGET` model) uses hardcoded thresholds ($1.00, $0.50) and does not currently scale dynamically with this variable. |
| `GENERATION_TIMEOUT_MS` | `60000` | Timeout for individual LLM requests (in milliseconds). |
| `WORKFLOW_BACKOFF_BASE_MS` | `5000` | Base delay for exponential backoff on workflow-level retries (e.g. Quality Validator loops). Does not affect LLM request retries. |
| `WORKFLOW_BACKOFF_MAX_MS` | `60000` | Maximum delay for exponential backoff on workflow-level retries. |

### Other

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `NEXT_PUBLIC_CDN_BASE_URL` | `https://cdn.hotelwebsites.ai` | Base URL for serving generated assets. |
| `NODE_ENV` | `development` | Environment mode (`development`, `production`, `test`). |

## Configuration Drift Warning

> **⚠️ Important Note on Docker Configuration:**
> The `docker-compose.yml` file defines several environment variables that differ from the application's actual configuration keys. This is a known discrepancy.
>
> | Docker Variable | Application Variable | Status |
> |-----------------|----------------------|--------|
> | `LLM_MODEL_PRIMARY` | `PRIMARY_MODEL` | Docker variable is **ignored** by application code. Use `PRIMARY_MODEL` in `.env`. |
> | `LLM_MODEL_FALLBACK` | `FALLBACK_MODEL` | Docker variable is **ignored**. Use `FALLBACK_MODEL`. |
> | `LLM_MODEL_BUDGET` | `BUDGET_MODEL` | Docker variable is **ignored**. Use `BUDGET_MODEL`. |
> | `LLM_TEMPERATURE` | (Hardcoded `0.7`) | **Ignored**. Application uses hardcoded defaults. |
> | `LLM_TOP_P` | (Default) | **Ignored**. |
> | `LLM_FREQUENCY_PENALTY` | (Default) | **Ignored**. |
> | `LLM_PRESENCE_PENALTY` | (Default) | **Ignored**. |
> | `LLM_MAX_RETRIES` | (Hardcoded `3`) | **Ignored**. |
> | `LLM_RETRY_DELAY` | (Hardcoded `1000`) | **Ignored**. |
>
> **Action:** When configuring the application, rely on the variables listed in the tables above (`PRIMARY_MODEL`, etc.) rather than the `LLM_*` prefixed variables found in `docker-compose.yml`, unless you are modifying the Docker entrypoint script to map them.

## Token Limits

Token limits are currently **hardcoded** within the individual Agent classes to ensure consistent performance and prevent context window overflows.

| Agent | Max Output Tokens | Source File |
|-------|-------------------|-------------|
| Component Selector | 2000/4000* | `ComponentSelector.ts` |
| Styling Agent | 2000/4000* | `StylingAgent.ts` |
| Content Generator | 3000 | `ContentGenerator.ts` |
| Assembly Agent | 4000 | `AssemblyAgent.ts` |
| Quality Validator | 1000 | `QualityValidator.ts` |

*\*Note: Limits may vary based on the specific model context window and provider implementation details (e.g. OpenRouter vs Anthropic).*

## Troubleshooting

### API Key Errors

**Symptoms:**
- `401 Unauthorized` errors in logs.
- "Missing API Key" exceptions.

**Solution:**
- Verify `.env` file exists and contains valid keys.
- Ensure environment variables are correctly loaded in the deployment environment (e.g., Vercel, Docker).

### Budget Exceeded

**Symptoms:**
- Workflow terminates with `End: Budget Exceeded`.
- `budgetExceeded: true` in final state.

**Solution:**
- Increase `MAX_GENERATION_COST` if appropriate.
- Check if expensive models are being used unexpectedly (e.g., fallback logic failing).
- Review token usage in LangFuse dashboard.

### Timeouts

**Symptoms:**
- `AbortError` or "Workflow terminated: exceeded 30-minute timeout limit".

**Solution:**
- Check for hanging LLM requests.
- Verify `GENERATION_TIMEOUT_MS` is sufficient for complex prompts.
- Inspect network connectivity to OpenRouter/LangFuse.
