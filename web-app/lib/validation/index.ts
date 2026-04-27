/**
 * Validation Utilities Index
 *
 * Exports all validation-related utilities for convenient importing.
 * Organized by purpose: security, schema, and input validation.
 */

// Fixture validation for Epic 16 - Dynamic Preview
export {
  sanitizeConfigName,
  sanitizeConfigNameWithDetails,
  getAvailableFixtures,
  fixtureExists,
  loadFixture,
  isValidFixtureName,
  getFixtureSuggestions,
  CONFIG_NAME_REGEX,
  MAX_CONFIG_NAME_LENGTH,
  MIN_CONFIG_NAME_LENGTH,
  FIXTURES_DIR,
  FIXTURE_EXTENSION,
  type SanitizationResult,
} from './fixtureValidation';

// Theme validation schemas
export {
  HotelThemeSchema,
  GeneratedThemeSchema,
  type HotelTheme,
  type GeneratedTheme,
} from './theme-schema';
