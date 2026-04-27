/**
 * Few-Shot Context Assembler
 * ==========================
 *
 * Story 21.1: Few-Shot Context Assembler + Semantic Allowlist Integration
 *
 * This module provides functions to gather context materials for AI-assisted
 * structural variant generation. It extracts:
 * - Sibling variant files (few-shot examples)
 * - Zod contract schemas (props interface definitions)
 * - Semantic token allowlist (approved Tailwind classes)
 *
 * All functions return delimiter-wrapped content designed for LLM prompt clarity.
 * The output format uses clear delimiters to separate different context sections.
 *
 * DESIGN DECISIONS:
 * - Accepts absolute paths only (caller has control over path construction)
 * - Uses async/await with fs.promises.readFile for async file reading
 * - Throws clear errors with file paths when files are not found
 * - No LLM calls in this module — only context preparation
 *
 * @module lib/few-shot-context
 * @see docs/stories/story-21.1-few-shot-context-assembler.md
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { SEMANTIC_TOKEN_ALLOWLIST } from './style-generation/tailwind-allowlist';

/**
 * Configuration constants for file filtering and delimiters
 */
const CONFIG = {
  /**
   * Files to exclude from sibling variant context
   * - index.tsx: Router component that delegates to variants
   * - .client.tsx: Client component wrappers for animations
   */
  EXCLUDED_FILES: ['index.tsx'],

  /**
   * File patterns to exclude (checked with endsWith)
   */
  EXCLUDED_PATTERNS: ['.client.tsx'] as const,

  /**
   * File extension to filter for sibling variants
   */
  VARIANT_EXTENSION: '.tsx' as const,

  /**
   * Minimum number of sibling variants to gather
   * (Will return fewer if directory has less than 3 variants)
   */
  MIN_VARIANTS: 2,
  MAX_VARIANTS: 3,
} as const;

/**
 * Delimiter strings for wrapping context sections
 * These clear markers help the LLM understand different context sections
 */
const DELIMITERS = {
  COMPONENT_START: (filename: string) => `=== EXISTING COMPONENT: ${filename} ===`,
  COMPONENT_END: '=== END ===',
  CONTRACT_START: '=== ZOD CONTRACT ===',
  CONTRACT_END: '=== END ===',
  ALLOWLIST_START: '=== ALLOWED TAILWIND CLASSES ===',
  ALLOWLIST_END: '=== END ===',
} as const;

/**
 * Error messages for missing files
 */
const ERRORS = {
  FILE_NOT_FOUND: (filePath: string) => `File not found: ${filePath}`,
  DIR_NOT_FOUND: (dirPath: string) => `Directory not found: ${dirPath}`,
  NO_VARIANTS_FOUND: (dirPath: string) => `No variant files found in: ${dirPath}`,
} as const;

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Gather existing sibling component files as few-shot examples.
 *
 * This function reads all .tsx files from a block directory (excluding
 * index.tsx and .client.tsx) and returns their complete contents wrapped
 * in delimiters for LLM prompt inclusion.
 *
 * @param blockDir - Absolute path to the block section directory
 *                    Example: "/path/to/web-app/components/sections/HeroSection"
 * @returns Formatted string with 2-3 sibling variant files wrapped in delimiters
 * @throws {Error} If directory doesn't exist or no variant files are found
 *
 * @example
 * ```ts
 * const heroContext = await gatherComponentContext(
 *   '/path/to/web-app/components/sections/HeroSection'
 * );
 * // Returns:
 * // === EXISTING COMPONENT: HeroCentered.tsx ===
 * // [complete file content]
 * // === END ===
 * // === EXISTING COMPONENT: HeroSplit.tsx ===
 * // [complete file content]
 * // === END ===
 * // === EXISTING COMPONENT: HeroMinimal.tsx ===
 * // [complete file content]
 * // === END ===
 * ```
 */
export async function gatherComponentContext(blockDir: string): Promise<string> {
  // Validate directory exists
  try {
    await fs.access(blockDir);
  } catch {
    throw new Error(ERRORS.DIR_NOT_FOUND(blockDir));
  }

  // Read all files in directory
  const allFiles = await fs.readdir(blockDir);

  // Filter for variant files: .tsx extension, not excluded
  const variantFiles = allFiles
    .filter(file => file.endsWith(CONFIG.VARIANT_EXTENSION))
    .filter(file => !isExcludedFile(file));

  // Validate we have at least MIN_VARIANTS
  if (variantFiles.length < CONFIG.MIN_VARIANTS) {
    throw new Error(
      `At least ${CONFIG.MIN_VARIANTS} variant file(s) required for few-shot context, ` +
      `but found ${variantFiles.length} in: ${blockDir}`
    );
  }

  // Sort files for consistent ordering (alphabetical)
  variantFiles.sort();

  // Take up to MAX_VARIANTS files
  const filesToGather = variantFiles.slice(0, CONFIG.MAX_VARIANTS);

  // Read each file and wrap with delimiters
  const contextSections: string[] = [];

  for (const filename of filesToGather) {
    const filePath = path.join(blockDir, filename);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      contextSections.push(
        DELIMITERS.COMPONENT_START(filename),
        content,
        DELIMITERS.COMPONENT_END
      );
    } catch (error) {
      throw new Error(ERRORS.FILE_NOT_FOUND(filePath));
    }
  }

  return contextSections.join('\n\n');
}

/**
 * Gather the Zod contract as explicit prompt instructions.
 *
 * This function reads a Zod contract file and returns its complete content
 * wrapped in delimiters. The contract defines the props interface that
 * generated variants must match exactly.
 *
 * @param contractPath - Absolute path to the Zod contract file
 *                       Example: "/path/to/web-app/lib/contracts/hero.contract.ts"
 * @returns Formatted contract content wrapped in delimiters
 * @throws {Error} If file doesn't exist
 *
 * @example
 * ```ts
 * const contractContext = await gatherContractContext(
 *   '/path/to/web-app/lib/contracts/hero.contract.ts'
 * );
 * // Returns:
 * // === ZOD CONTRACT ===
 * // import { z } from 'zod';
 * // export const HeroSectionContract = z.object({
 * //   variant: z.object({...}).optional(),
 * //   title: z.string().min(1).max(200),
 * //   ...
 * // });
 * // === END ===
 * ```
 */
export async function gatherContractContext(contractPath: string): Promise<string> {
  try {
    const content = await fs.readFile(contractPath, 'utf-8');
    return [
      DELIMITERS.CONTRACT_START,
      content,
      DELIMITERS.CONTRACT_END,
    ].join('\n');
  } catch (error) {
    throw new Error(ERRORS.FILE_NOT_FOUND(contractPath));
  }
}

/**
 * Gather the semantic token allowlist for prompt constraints.
 *
 * This function imports the SEMANTIC_TOKEN_ALLOWLIST (a Set of ~330
 * approved Tailwind classes) and returns it as a newline-separated string
 * wrapped in delimiters. This constrains AI generation to only use approved
 * semantic design tokens.
 *
 * @returns Formatted allowlist content with one class per line
 *
 * @example
 * ```ts
 * const allowlistContext = await gatherAllowlistContext();
 * // Returns:
 * // === ALLOWED TAILWIND CLASSES ===
 * // bg-brand-primary
 * // bg-brand-secondary
 * // text-text-primary
 * // ... (~330 classes total)
 * // === END ===
 * ```
 */
export async function gatherAllowlistContext(): Promise<string> {
  // Import the allowlist from Epic 20 Story 20.7
  // (imported at top of file: SEMANTIC_TOKEN_ALLOWLIST)

  // Convert Set to sorted array for consistent ordering
  const classes = Array.from(SEMANTIC_TOKEN_ALLOWLIST).sort();

  // Join with newlines and wrap with delimiters
  return [
    DELIMITERS.ALLOWLIST_START,
    classes.join('\n'),
    DELIMITERS.ALLOWLIST_END,
  ].join('\n');
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Resolve block path for convenience.
 *
 * This helper function constructs an absolute path to a block section
 * directory. Callers can use this instead of manually constructing paths,
 * or they can provide absolute paths directly to the gather functions.
 *
 * @param blockName - Name of the block section (e.g., "HeroSection", "FooterSection")
 * @returns Absolute path to the block directory
 *
 * @example
 * ```ts
 * const heroPath = resolveBlockPath('HeroSection');
 * // Returns: "/current/working/directory/web-app/components/sections/HeroSection"
 *
 * // Then use with gatherComponentContext:
 * const context = await gatherComponentContext(heroPath);
 * ```
 */
export function resolveBlockPath(blockName: string): string {
  // Start from current working directory
  const cwd = process.cwd();

  // Navigate to web-app/components/sections/{blockName}
  return path.join(cwd, 'web-app', 'components', 'sections', blockName);
}

/**
 * Check if a file should be excluded from sibling variant context.
 *
 * Files are excluded if they match any of the following:
 * - Exact filename match in EXCLUDED_FILES (e.g., "index.tsx")
 * - Ends with any pattern in EXCLUDED_PATTERNS (e.g., ".client.tsx")
 *
 * @param filename - Name of the file to check
 * @returns true if the file should be excluded, false otherwise
 *
 * @internal
 */
function isExcludedFile(filename: string): boolean {
  // Check exact filename matches
  if ((CONFIG.EXCLUDED_FILES as readonly string[]).includes(filename)) {
    return true;
  }

  // Check pattern matches (endswith)
  return CONFIG.EXCLUDED_PATTERNS.some(pattern =>
    filename.endsWith(pattern)
  );
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

/**
 * Context assembler function types
 * Exported for TypeScript consumers who want to type their usage
 */
export type ContextAssemblerFunction = typeof gatherComponentContext;
export type ContractAssemblerFunction = typeof gatherContractContext;
export type AllowlistAssemblerFunction = typeof gatherAllowlistContext;
