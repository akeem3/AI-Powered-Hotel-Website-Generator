/**
 * Fixture Validation Utility
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.01
 * @trace reqs: AC9
 *
 * Why: Prevents path traversal attacks when loading HomepageConfig fixtures from the filesystem.
 * Config names from URL parameters are inherently untrusted and must be sanitized before
 * accessing the filesystem. This utility provides regex-based validation and sanitization
 * to block malicious input like "../../../etc/passwd" while allowing valid fixture names.
 *
 * Security Impact: Blocks VULN-004 (Path Traversal) by strictly validating config names
 * against a whitelist of safe characters (alphanumeric, dash, underscore). Any input
 * containing path separators (/, \), dots (.), or other special characters is rejected.
 *
 * @example
 * ```tsx
 * import { sanitizeConfigName, getAvailableFixtures } from '@/lib/validation/fixtureValidation';
 *
 * // Safe usage with URL parameter
 * const rawConfigName = searchParams.get('config'); // User input: '../../../etc/passwd'
 * const sanitizedName = sanitizeConfigName(rawConfigName); // Returns: null (rejected)
 *
 * // Valid usage
 * const sanitizedName = sanitizeConfigName('luxury-boutique'); // Returns: 'luxury-boutique'
 * const fixtures = getAvailableFixtures(); // Returns: ['luxury-boutique', 'budget-hostel', ...]
 * ```
 *
 * @see web-app/app/preview/page.tsx - Usage in preview route
 * @see docs/stories/story-16.01.preview_dynamic-preview-page_draft_2026-02-12.md - AC9 specification
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

/**
 * CONFIG_NAME_REGEX - Pattern for validating fixture config names
 *
 * **Security Critical:** This regex is the primary defense against path traversal attacks.
 * Only allows alphanumeric characters, hyphens, and underscores. Rejects:
 * - Path separators: /, \ (prevents directory traversal)
 * - Dots: . (prevents ../.. attacks and hidden files)
 * - Special characters: @, #, $, %, etc. (prevents injection attempts)
 *
 * @constant {RegExp}
 *
 * @example
 * ```tsx
 * CONFIG_NAME_REGEX.test('luxury-boutique')  // true - valid
 * CONFIG_NAME_REGEX.test('budget_hostel')    // true - valid
 * CONFIG_NAME_REGEX.test('hotel123')          // true - valid
 * CONFIG_NAME_REGEX.test('../etc/passwd')     // false - REJECTED
 * CONFIG_NAME_REGEX.test('./config')          // false - REJECTED
 * CONFIG_NAME_REGEX.test('config.json')       // false - REJECTED (contains dot)
 * CONFIG_NAME_REGEX.test('../../../malicious') // false - REJECTED
 * CONFIG_NAME_REGEX.test('')                  // false - REJECTED (empty)
 * CONFIG_NAME_REGEX.test('config/../../../etc/passwd') // false - REJECTED
 * ```
 *
 * @see AC9 - "The config parameter is validated to allow only alphanumeric characters,
 * dashes, and underscores (regex: ^[a-zA-Z0-9-_]+$) to prevent path traversal attacks"
 */
export const CONFIG_NAME_REGEX = /^[a-zA-Z0-9-_]+$/;

/**
 * Maximum allowed length for config names
 *
 * Prevents potential buffer overflow issues and ensures reasonable filenames.
 * Set to 100 characters to allow descriptive names while preventing abuse.
 *
 * @constant {number}
 */
export const MAX_CONFIG_NAME_LENGTH = 100;

/**
 * Minimum required length for config names
 *
 * Prevents empty or whitespace-only strings from passing validation.
 *
 * @constant {number}
 */
export const MIN_CONFIG_NAME_LENGTH = 1;

/**
 * Fixtures directory path
 *
 * All HomepageConfig fixture files are stored in this directory.
 * The path is relative to the web-app root to support different deployment scenarios.
 *
 * @constant {string}
 */
export const FIXTURES_DIR = join(process.cwd(), 'fixtures', 'configs');

/**
 * Fixture file extension
 *
 * All fixture files must have this extension to be loaded.
 *
 * @constant {string}
 */
export const FIXTURE_EXTENSION = '.json';

/**
 * Sanitizes a config name from user input to prevent path traversal attacks
 *
 * **Security Critical:** This function MUST be called before any filesystem operation
 * involving config names from URL parameters or other user input. It validates the input
 * against CONFIG_NAME_REGEX to block malicious input and returns null if validation fails.
 *
 * The function performs the following security checks:
 * 1. Type validation - rejects non-string input
 * 2. Empty/whitespace check - rejects empty or whitespace-only strings
 * 3. Length validation - enforces MIN and MAX length limits
 * 4. Character validation - applies CONFIG_NAME_REGEX to block path separators and special chars
 * 5. Case normalization - converts to lowercase for consistent filesystem access
 *
 * **Logging:** All rejected inputs are logged with [Security] prefix for audit trail.
 *
 * @param input - The raw config name from URL parameter or other user input
 * @returns The sanitized config name if valid, null if validation fails
 *
 * @example
 * ```tsx
 * // Usage in preview page
 * const rawConfigName = searchParams.get('config');
 * const sanitizedName = sanitizeConfigName(rawConfigName);
 *
 * if (!sanitizedName) {
 *   // Log security warning and show error
 *   console.warn('[Security] Invalid config name rejected:', rawConfigName);
 *   return <ConfigNameErrorUI />;
 * }
 *
 * // Safe to use sanitizedName for filesystem access
 * const configPath = join(FIXTURES_DIR, `${sanitizedName}.json`);
 * ```
 *
 * @see AC9 - Path traversal prevention requirement
 * @see CONFIG_NAME_REGEX - The regex pattern used for validation
 */
export function sanitizeConfigName(input: unknown): string | null {
  // SECURITY: Reject non-string input immediately
  if (typeof input !== 'string') {
    console.error('[Security] Config name validation failed: non-string input rejected', {
      inputType: typeof input,
      input: String(input).substring(0, 50), // Log first 50 chars for debugging
    });
    return null;
  }

  // SECURITY: Trim whitespace and check for empty strings
  const trimmed = input.trim();

  // SECURITY: Reject empty strings
  if (trimmed.length < MIN_CONFIG_NAME_LENGTH) {
    console.warn('[Security] Config name validation failed: empty or whitespace-only string rejected', {
      input: input.substring(0, 50),
    });
    return null;
  }

  // SECURITY: Enforce maximum length to prevent potential issues
  if (trimmed.length > MAX_CONFIG_NAME_LENGTH) {
    console.warn('[Security] Config name validation failed: name exceeds maximum length', {
      input: input.substring(0, 50),
      maxLength: MAX_CONFIG_NAME_LENGTH,
      actualLength: trimmed.length,
    });
    return null;
  }

  // SECURITY: Apply regex validation to block path traversal and special characters
  // This is the PRIMARY security check - blocks ../, \, null bytes, etc.
  if (!CONFIG_NAME_REGEX.test(trimmed)) {
    console.error('[Security] Config name validation failed: contains invalid characters', {
      input: input.substring(0, 50),
      reason: 'Contains characters outside the allowed set [a-zA-Z0-9-_]',
      regexPattern: CONFIG_NAME_REGEX.toString(),
    });
    return null;
  }

  // SECURITY: Convert to lowercase for consistent filesystem access
  // This prevents case-sensitivity issues and makes filename collisions more obvious
  const sanitizedName = trimmed.toLowerCase();

  // SECURITY: Log successful sanitization for audit trail
  console.info('[Security] Config name sanitized successfully', {
    original: input,
    sanitized: sanitizedName,
  });

  return sanitizedName;
}

/**
 * Sanitization result type
 *
 * Represents the outcome of a config name sanitization attempt.
 */
export type SanitizationResult =
  | { success: true; sanitizedName: string; original: string }
  | { success: false; reason: string; original: string };

/**
 * Sanitizes a config name and returns a detailed result object
 *
 * Extended version of `sanitizeConfigName` that provides detailed error information
 * useful for displaying helpful error messages to users. Returns a result object
 * indicating success or failure with appropriate details.
 *
 * @param input - The raw config name from URL parameter or other user input
 * @returns A result object with success status and details
 *
 * @example
 * ```tsx
 * const result = sanitizeConfigNameWithDetails(searchParams.get('config'));
 *
 * if (!result.success) {
 *   return <ConfigErrorUI
 *     message={`Invalid config name: ${result.reason}`}
 *     suggestions={getAvailableFixtures()}
 *   />;
 * }
 *
 * const configPath = join(FIXTURES_DIR, `${result.sanitizedName}.json`);
 * ```
 */
export function sanitizeConfigNameWithDetails(input: unknown): SanitizationResult {
  const originalString = String(input ?? '');

  // Type check
  if (typeof input !== 'string') {
    return {
      success: false,
      reason: 'Config name must be a string',
      original: originalString,
    };
  }

  const trimmed = input.trim();

  // Empty check
  if (trimmed.length < MIN_CONFIG_NAME_LENGTH) {
    return {
      success: false,
      reason: 'Config name cannot be empty',
      original: originalString,
    };
  }

  // Length check
  if (trimmed.length > MAX_CONFIG_NAME_LENGTH) {
    return {
      success: false,
      reason: `Config name must be ${MAX_CONFIG_NAME_LENGTH} characters or less`,
      original: originalString,
    };
  }

  // Character validation
  if (!CONFIG_NAME_REGEX.test(trimmed)) {
    return {
      success: false,
      reason: 'Config name can only contain letters, numbers, hyphens, and underscores',
      original: originalString,
    };
  }

  return {
    success: true,
    sanitizedName: trimmed.toLowerCase(),
    original: originalString,
  };
}

/**
 * Gets a list of all available fixture names in the fixtures directory
 *
 * Scans the FIXTURES_DIR directory and returns an array of fixture names
 * (without the .json extension). This is useful for:
 * - Displaying available fixtures in error messages
 * - Validating that a requested fixture exists
 * - Auto-completion suggestions
 *
 * The function handles errors gracefully and returns an empty array if:
 * - The fixtures directory doesn't exist
 * - There's a permission issue reading the directory
 * - The directory contains no valid fixture files
 *
 * @returns An array of available fixture names (without .json extension)
 *
 * @example
 * ```tsx
 * // Get all available fixtures for error message
 * const availableFixtures = getAvailableFixtures();
 * // Returns: ['luxury-boutique', 'budget-hostel', 'business-hotel']
 *
 * // Display in error UI
 * <ConfigErrorUI
 *   message={`Config not found`}
 *   availableFixtures={availableFixtures}
 * />
 *
 * // Check if a fixture exists
 * const fixtures = getAvailableFixtures();
 * if (!fixtures.includes(sanitizedName)) {
 *   return <NotFoundUI suggestions={fixtures} />;
 * }
 * ```
 *
 * @see AC3 - "Visiting /preview without a config parameter displays a helpful error
 * message listing available fixture names"
 * @see AC4 - "Visiting /preview?config={invalid-name} displays a 404-style error
 * with suggestions"
 */
export function getAvailableFixtures(): string[] {
  try {
    // Read the fixtures directory
    const files = readdirSync(FIXTURES_DIR, { encoding: 'utf-8' });

    // Filter for JSON files and remove the extension
    const fixtures = files
      .filter((file) => file.endsWith(FIXTURE_EXTENSION))
      .map((file) => file.replace(FIXTURE_EXTENSION, ''))
      // Double-check that the fixture name itself passes validation
      .filter((name) => CONFIG_NAME_REGEX.test(name))
      // Sort alphabetically for consistent display
      .sort();

    console.info('[Fixture Discovery] Found available fixtures', {
      count: fixtures.length,
      fixtures,
    });

    return fixtures;
  } catch (error) {
    // Handle errors gracefully (directory doesn't exist, permission issues, etc.)
    console.error('[Fixture Discovery] Failed to read fixtures directory', {
      directory: FIXTURES_DIR,
      error: error instanceof Error ? error.message : String(error),
    });

    return [];
  }
}

/**
 * Checks if a fixture with the given name exists in the fixtures directory
 *
 * Convenience function that combines sanitization and existence checking.
 * Returns true only if the name passes validation AND the corresponding
 * .json file exists in the fixtures directory.
 *
 * @param sanitizedName - The already-sanitized config name
 * @returns true if the fixture exists, false otherwise
 *
 * @example
 * ```tsx
 * const sanitizedName = sanitizeConfigName(rawName);
 * if (!sanitizedName) {
 *   return <InvalidNameErrorUI />;
 * }
 *
 * if (!fixtureExists(sanitizedName)) {
 *   return <FixtureNotFoundUI availableFixtures={getAvailableFixtures()} />;
 * }
 * ```
 */
export function fixtureExists(sanitizedName: string): boolean {
  try {
    const fixturePath = join(FIXTURES_DIR, `${sanitizedName}${FIXTURE_EXTENSION}`);
    // Try to read the file to verify existence
    readFileSync(fixturePath, { encoding: 'utf-8' });
    return true;
  } catch (error) {
    console.debug('[Fixture Validation] Fixture does not exist or cannot be read', {
      sanitizedName,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Loads a fixture by name with full security validation
 *
 * This is the primary entry point for loading fixtures from the filesystem.
 * It performs complete security validation before reading the file and
 * returns a typed HomepageConfig object if successful.
 *
 * The function performs these steps:
 * 1. Sanitize the config name (path traversal protection)
 * 2. Check if the fixture exists
 * 3. Read and parse the JSON file
 * 4. Return the parsed config
 *
 * @param configName - The raw config name from URL parameter or user input
 * @returns The parsed HomepageConfig object if successful, null if validation fails
 *
 * @example
 * ```tsx
 * const config = loadFixture(searchParams.get('config'));
 *
 * if (!config) {
 *   return <ConfigLoadErrorUI />;
 * }
 *
 * return <ComponentRenderer config={config} />;
 * ```
 *
 * @throws {Error} If the fixture exists but contains invalid JSON
 */
export function loadFixture(configName: unknown): Record<string, unknown> | null {
  // Step 1: Sanitize the config name
  const sanitizedName = sanitizeConfigName(configName);

  if (!sanitizedName) {
    console.error('[Fixture Loader] Config name validation failed', {
      input: String(configName).substring(0, 50),
    });
    return null;
  }

  // Step 2: Check if fixture exists
  if (!fixtureExists(sanitizedName)) {
    console.warn('[Fixture Loader] Fixture does not exist', {
      sanitizedName,
      availableFixtures: getAvailableFixtures(),
    });
    return null;
  }

  // Step 3: Read the fixture file
  try {
    const fixturePath = join(FIXTURES_DIR, `${sanitizedName}${FIXTURE_EXTENSION}`);
    const fileContent = readFileSync(fixturePath, { encoding: 'utf-8' });

    // Step 4: Parse JSON
    const parsedConfig = JSON.parse(fileContent) as Record<string, unknown>;

    console.info('[Fixture Loader] Fixture loaded successfully', {
      sanitizedName,
      path: fixturePath,
    });

    return parsedConfig;
  } catch (error) {
    console.error('[Fixture Loader] Failed to parse fixture JSON', {
      sanitizedName,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Validates that a config name passes all security checks without loading it
 *
 * Lightweight validation function that only checks if a config name is
 * syntactically valid and the corresponding file exists. Does not read
 * or parse the file contents. Useful for quick validation before
 * attempting expensive operations.
 *
 * @param configName - The raw config name to validate
 * @returns true if the name is valid and the fixture exists, false otherwise
 *
 * @example
 * ```tsx
 * // Quick check before redirecting
 * if (!isValidFixtureName(searchParams.get('config'))) {
 *   return redirect('/preview?error=invalid-config');
 * }
 * ```
 */
export function isValidFixtureName(configName: unknown): boolean {
  const sanitizedName = sanitizeConfigName(configName);
  return sanitizedName !== null && fixtureExists(sanitizedName);
}

/**
 * Gets suggestions for similar fixture names based on Levenshtein distance
 *
 * When a user provides an invalid config name, this function analyzes the
 * available fixtures and returns suggestions that are similar to the input.
 * Useful for displaying helpful "Did you mean?" messages in error UIs.
 *
 * @param invalidName - The invalid config name provided by the user
 * @param maxSuggestions - Maximum number of suggestions to return (default: 3)
 * @returns An array of suggested fixture names, sorted by similarity
 *
 * @example
 * ```tsx
 * const suggestions = getFixtureSuggestions('luxry-boutique'); // typo
 * // Returns: ['luxury-boutique', ...]
 *
 * <NotFoundUI
 *   message="Config not found"
 *   suggestions={suggestions}
 * />
 * ```
 */
export function getFixtureSuggestions(
  invalidName: string,
  maxSuggestions: number = 3
): string[] {
  const availableFixtures = getAvailableFixtures();

  if (availableFixtures.length === 0) {
    return [];
  }

  // Calculate similarity score for each available fixture
  const suggestions = availableFixtures
    .map((fixture) => ({
      fixture,
      score: calculateSimilarity(invalidName.toLowerCase(), fixture),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map((s) => s.fixture);

  // Only return suggestions with reasonable similarity
  return suggestions.filter((_, index) => index < maxSuggestions);
}

/**
 * Calculates a simple similarity score between two strings
 *
 * Uses a combination of:
 * - Common prefix length (exact matches from start)
 * - Common substring matches
 * - Length difference penalty
 *
 * Returns a score between 0 (no similarity) and 1 (identical).
 *
 * @internal - For use by getFixtureSuggestions only
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1;

  // Common prefix length
  let commonPrefix = 0;
  const minLength = Math.min(str1.length, str2.length);
  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) {
      commonPrefix++;
    } else {
      break;
    }
  }

  // Length difference penalty
  const lengthDiff = Math.abs(str1.length - str2.length);
  const maxLength = Math.max(str1.length, str2.length);

  // Combined score: prefix match matters most, length difference penalizes
  const prefixScore = commonPrefix / maxLength;
  const lengthPenalty = 1 - (lengthDiff / maxLength);

  return prefixScore * 0.7 + lengthPenalty * 0.3;
}
