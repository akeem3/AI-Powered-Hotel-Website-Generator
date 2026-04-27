## 2025-05-23 - [Production Validation Overhead]
**Learning:** The helper `validateInDev` was running expensive Zod validation in production, despite its name implying development-only usage.
**Action:** When seeing `validateInDev` or similar dev-helpers, always verify they are actually disabled in production `process.env.NODE_ENV === 'production'`.
