# Drift Report

## File: `docs/architecture/langgraph-workflows.md`
**Drift Detected:** `ComponentSelectorOutput` schema is missing specific enum values and constraints (`min(5).max(8)`). `HomepageConfig` schema is inconsistent with the code (`validationStatus` case mismatch, loose `components` structure). Styling Agent fallback description ("neutral colors") is slightly inaccurate compared to the code ("Deep Blue" and "Warm Gold").
**Action:** Update `ComponentSelectorOutput` and `HomepageConfig` schemas to match `web-app/app/langgraph/agents/schemas.ts`. Update Styling Agent fallback description to "Standard layout, default theme colors".

## File: `docs/guides/llm-website-generation-manual.md`
**Drift Detected:** The CLI parameter table lists invalid enum values for `--type`, `--audience`, and `--personality` (e.g., "families" instead of "family", "classic" instead of "elegant", "playful" instead of "friendly").
**Action:** Update the parameter table to use valid enum values from `HotelParametersSchema` in `web-app/app/langgraph/agents/schemas.ts`.
