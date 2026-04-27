/**
 * AST Validation Pipeline for AI-Generated TSX
 * ============================================
 *
 * Story 21.2: 5-Gate AST Validation Pipeline
 *
 * This module provides a 5-gate validation pipeline for AI-generated TSX code.
 * Each gate validates a specific aspect of the generated code:
 *
 * - Gate 1: Import Verification - Validates import paths and package usage
 * - Gate 2: Props Interface Verification - Validates props against Zod contract
 * - Gate 3: CVA Class String Verification - Validates classes against allowlist
 * - Gate 4: Semantic Token Compliance - Checks for banned patterns
 * - Gate 5: TypeScript Compilation - Runs tsc --noEmit
 *
 * DESIGN DECISIONS:
 * - Uses ts-morph for AST parsing (already in project for codegen)
 * - Synchronous validation by design (no async needed)
 * - Stops at first gate failure (fail-fast approach)
 * - Error messages formatted for LLM retry feedback
 * - Temp files written to web-app/.temp/ for compilation check
 *
 * @module lib/ast-validation-pipeline
 * @see docs/stories/story-21.2-ast-validation-pipeline.md
 */

import { Project, type SourceFile, SyntaxKind } from 'ts-morph';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SEMANTIC_TOKEN_ALLOWLIST } from './style-generation/tailwind-allowlist';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Result of a single gate validation.
 */
export interface GateResult {
  /** Gate identifier: 'imports' | 'props' | 'classes' | 'compliance' | 'compilation' */
  gate: GateType;
  /** Whether this gate passed validation */
  passed: boolean;
  /** Error messages if validation failed (empty array if passed) */
  errors: ValidationError[];
}

/**
 * Validation result for the complete 5-gate pipeline.
 */
export interface ValidationResult {
  /** Whether all gates passed (true) or any gate failed (false) */
  passed: boolean;
  /** Results from each gate that was executed (stops at first failure) */
  gates: GateResult[];
}

/**
 * Type of validation gate.
 */
export type GateType = 'imports' | 'props' | 'classes' | 'compliance' | 'compilation';

/**
 * Validation error with details for LLM retry.
 */
export interface ValidationError {
  /** File path where the error occurred */
  filePath: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Error message describing the issue */
  message: string;
  /** Suggested fix for the error */
  fix?: string;
}

/**
 * Configuration for the validation pipeline.
 */
export interface ValidationConfig {
  /** Root directory of the project (for resolving import paths) */
  projectRoot: string;
  /** Temp directory for compilation artifacts */
  tempDir: string;
  /** Whether to skip TypeScript compilation (useful for faster testing) */
  skipCompilation?: boolean;
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Default configuration for the validation pipeline.
 */
const DEFAULT_CONFIG: ValidationConfig = {
  projectRoot: process.cwd(),
  tempDir: path.join(process.cwd(), 'web-app', '.temp'),
  skipCompilation: false,
};

/**
 * Banned patterns that should not appear in generated code.
 */
const BANNED_PATTERNS = {
  /** Template literals in className (e.g., `bg-${variant}`) */
  TEMPLATE_LITERAL_CLASSNAME: 'Template literal in className is not allowed - use static class strings only',
  /** Inline style attributes */
  INLINE_STYLE: 'Inline style attributes are not allowed - use semantic tokens',
  /** Arbitrary values (e.g., w-[30%]) */
  ARBITRARY_VALUE: 'Arbitrary Tailwind values are not allowed - use semantic tokens',
} as const;

/**
 * Import patterns that are allowed (seen in sibling variants).
 */
const ALLOWED_IMPORT_PATTERNS = [
  // Next.js imports
  /^next\/link$/,
  /^next\/image$/,
  // Project imports (@/ alias)
  /^@\//,
  // Standard React imports
  /^react$/,
  // Local relative imports
  /^\.\.?\//,
] as const;

// =============================================================================
// ERROR FORMATTING
// =============================================================================

/**
 * Format a validation error for LLM retry.
 *
 * @param error - The validation error to format
 * @returns Formatted error string
 * @example
 * ```ts
 * formatErrorForLLM({
 *   filePath: '/path/to/file.tsx',
 *   line: 10,
 *   column: 5,
 *   message: 'Missing required prop: title'
 * });
 * // Returns: "Error in file.tsx:10:5 - Missing required prop: title"
 * ```
 */
export function formatErrorForLLM(error: ValidationError): string {
  const fileName = path.basename(error.filePath);
  const fix = error.fix ? `\n  Fix: ${error.fix}` : '';
  return `Error in ${fileName}:${error.line}:${error.column} - ${error.message}${fix}`;
}

/**
 * Format multiple validation errors for LLM retry.
 *
 * @param errors - Array of validation errors
 * @returns Formatted error string with one error per line
 */
export function formatErrorsForLLM(errors: ValidationError[]): string {
  return errors.map(formatErrorForLLM).join('\n');
}

/**
 * Create a validation error.
 *
 * @param filePath - File path where error occurred
 * @param line - Line number (1-indexed)
 * @param column - Column number (1-indexed)
 * @param message - Error message
 * @param fix - Suggested fix (optional)
 * @returns Validation error object
 */
export function createValidationError(
  filePath: string,
  line: number,
  column: number,
  message: string,
  fix?: string
): ValidationError {
  return {
    filePath,
    line,
    column,
    message,
    fix,
  };
}

// =============================================================================
// TEMP FILE MANAGEMENT
// =============================================================================

/**
 * Ensure the temp directory exists.
 *
 * @param tempDir - Path to temp directory
 * @throws {Error} If directory cannot be created
 */
export async function ensureTempDir(tempDir: string): Promise<void> {
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }
}

/**
 * Write a temp file for validation.
 *
 * @param tempDir - Temp directory path
 * @param content - File content to write
 * @returns Path to the created temp file
 * @throws {Error} If file cannot be written
 */
export async function writeTempFile(tempDir: string, content: string): Promise<string> {
  await ensureTempDir(tempDir);
  const tempFilePath = path.join(tempDir, 'generated-variant.tsx');
  await fs.writeFile(tempFilePath, content, 'utf-8');
  return tempFilePath;
}

/**
 * Clean up a temp file.
 *
 * @param filePath - Path to temp file to delete
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // Ignore errors - temp file cleanup is best-effort
    console.warn(`Warning: Could not cleanup temp file: ${filePath}`);
  }
}

/**
 * Write a temp file for validation (synchronous version).
 *
 * @param tempDir - Temp directory path
 * @param content - File content to write
 * @returns Path to the created temp file
 * @throws {Error} If file cannot be written
 */
export function writeTempFileSync(tempDir: string, content: string): string {
  const fsSync = require('fs');
  ensureTempDirSync(tempDir);
  const tempFilePath = path.join(tempDir, 'generated-variant.tsx');
  fsSync.writeFileSync(tempFilePath, content, 'utf-8');
  return tempFilePath;
}

/**
 * Ensure the temp directory exists (synchronous version).
 *
 * @param tempDir - Path to temp directory
 */
function ensureTempDirSync(tempDir: string): void {
  const fsSync = require('fs');
  try {
    fsSync.accessSync(tempDir);
  } catch {
    fsSync.mkdirSync(tempDir, { recursive: true });
  }
}

/**
 * Clean up a temp file (synchronous version).
 *
 * @param filePath - Path to temp file to delete
 */
export function cleanupTempFileSync(filePath: string): void {
  const fsSync = require('fs');
  try {
    fsSync.unlinkSync(filePath);
  } catch (error) {
    // Ignore errors - temp file cleanup is best-effort
    console.warn(`Warning: Could not cleanup temp file: ${filePath}`);
  }
}

// =============================================================================
// TS-MORPH PROJECT SETUP
// =============================================================================

/**
 * Create a ts-morph Project for AST parsing.
 *
 * @param config - Validation configuration
 * @returns Configured ts-morph Project
 */
export function createValidationProject(config: ValidationConfig): Project {
  // Determine the tsconfig path - handle both cases where projectRoot includes web-app or not
  let tsConfigPath: string;
  if (config.projectRoot.endsWith('web-app')) {
    tsConfigPath = path.join(config.projectRoot, 'tsconfig.json');
  } else {
    tsConfigPath = path.join(config.projectRoot, 'web-app', 'tsconfig.json');
  }

  return new Project({
    skipAddingFilesFromTsConfig: false,
    compilerOptions: {
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
      strict: true,
    },
    tsConfigFilePath: tsConfigPath,
  });
}

/**
 * Create an in-memory SourceFile from TSX code.
 *
 * @param project - ts-morph Project
 * @param code - TSX code string
 * @param fileName - Virtual file name (for error messages)
 * @returns SourceFile object
 */
export function createInMemorySourceFile(
  project: Project,
  code: string,
  fileName: string = 'generated-variant.tsx'
): SourceFile {
  // Create a unique in-memory source file using a timestamp counter
  // This avoids conflicts when multiple tests use the same file name
  const uniqueId = Math.random().toString(36).substring(2, 8);
  const uniqueFileName = `${uniqueId}-${fileName}`;
  return project.createSourceFile(uniqueFileName, code);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get line and column number from a Node's position.
 *
 * @param sourceFile - SourceFile containing the node
 * @param pos - Character position in the source
 * @returns Object with line and column (1-indexed)
 */
export function getLineAndColumn(sourceFile: SourceFile, pos: number): { line: number; column: number } {
  const lineAndColumn = sourceFile.getLineAndColumnAtPos(pos);
  return {
    line: lineAndColumn.line + 1, // ts-morph returns 0-indexed, we want 1-indexed
    column: lineAndColumn.column + 1,
  };
}

/**
 * Check if an import path is allowed.
 *
 * @param importPath - Import path to check
 * @returns true if import is allowed, false otherwise
 */
export function isAllowedImport(importPath: string): boolean {
  return ALLOWED_IMPORT_PATTERNS.some(pattern => pattern.test(importPath));
}

/**
 * Check if a class string contains only allowed semantic tokens.
 *
 * @param classString - Space-separated class string
 * @returns true if all classes are in the allowlist, false otherwise
 */
export function areClassesAllowed(classString: string): boolean {
  const classes = classString.trim().split(/\s+/);
  return classes.every(cls => SEMANTIC_TOKEN_ALLOWLIST.has(cls));
}

/**
 * Get invalid classes from a class string.
 *
 * @param classString - Space-separated class string
 * @returns Array of invalid class names
 */
export function getInvalidClasses(classString: string): string[] {
  const classes = classString.trim().split(/\s+/).filter(c => c.length > 0);
  return classes.filter(cls => !SEMANTIC_TOKEN_ALLOWLIST.has(cls));
}

// =============================================================================
// GATE 1: IMPORT VERIFICATION
// =============================================================================

/**
 * Gate 1: Import Verification
 *
 * Validates that:
 * - All import paths are valid (resolve to existing files)
 * - No new npm packages are imported (only allowed patterns)
 *
 * @param sourceFile - Parsed SourceFile from ts-morph
 * @param config - Validation configuration
 * @returns GateResult with import validation outcome
 */
export function validateImports(sourceFile: SourceFile, config: ValidationConfig): GateResult {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Get all import declarations
  const importDeclarations = sourceFile.getImportDeclarations();

  for (const importDecl of importDeclarations) {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();
    const importPos = getLineAndColumn(sourceFile, importDecl.getStart());

    // Check 1: Import path matches allowed patterns
    if (!isAllowedImport(moduleSpecifier)) {
      const pos = getLineAndColumn(sourceFile, importDecl.getStart());
      errors.push(createValidationError(
        fileName,
        pos.line,
        pos.column,
        `Import "${moduleSpecifier}" is not allowed. Only imports from @/, next/, relative paths, and react are permitted.`,
        `Remove the import or use an allowed import pattern.`
      ));
      continue; // Skip to next import if pattern is invalid
    }

    // Check 2: For relative imports, verify the file exists
    if (moduleSpecifier.startsWith('.') || moduleSpecifier.startsWith('@/')) {
      const resolvedPath = resolveImportPath(moduleSpecifier, fileName, config);
      if (resolvedPath && !fileExists(resolvedPath, config)) {
        const pos = getLineAndColumn(sourceFile, importDecl.getStart());
        errors.push(createValidationError(
          fileName,
          pos.line,
          pos.column,
          `Import "${moduleSpecifier}" does not resolve to an existing file.`,
          `Verify the file path is correct or remove the unused import.`
        ));
      }
    }
  }

  if (errors.length > 0) {
    return createFailedGate('imports', errors);
  }

  return createPassedGate('imports');
}

/**
 * Resolve an import path to an absolute file system path.
 *
 * @param moduleSpecifier - Import path from source code
 * @param sourceFilePath - Path of the file containing the import
 * @param config - Validation configuration
 * @returns Resolved absolute path, or null if not a file import
 */
function resolveImportPath(
  moduleSpecifier: string,
  sourceFilePath: string,
  config: ValidationConfig
): string | null {
  // Handle @/ alias imports
  if (moduleSpecifier.startsWith('@/')) {
    const relativePath = moduleSpecifier.slice(2); // Remove '@/'
    return path.join(config.projectRoot, 'web-app', relativePath);
  }

  // Handle relative imports
  if (moduleSpecifier.startsWith('.')) {
    const sourceDir = path.dirname(sourceFilePath);
    return path.resolve(sourceDir, moduleSpecifier);
  }

  // Package imports (next, react, etc.) - return null for file system check
  return null;
}

/**
 * Check if a file exists at the given path.
 *
 * @param filePath - Absolute path to check
 * @param config - Validation configuration
 * @returns true if file exists, false otherwise
 */
function fileExists(filePath: string, config: ValidationConfig): boolean {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(config.projectRoot, filePath);

    // Check for .ts, .tsx, .js, .jsx extensions
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    for (const ext of extensions) {
      const pathWithExt = absolutePath.endsWith(ext)
        ? absolutePath
        : absolutePath + ext;

      const { existsSync } = require('fs');
      if (existsSync(pathWithExt)) {
        return true;
      }
    }

    // Check for index files
    for (const ext of extensions) {
      const indexPath = path.join(absolutePath, `index${ext}`);
      const { existsSync } = require('fs');
      if (existsSync(indexPath)) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

// =============================================================================
// GATE 2: PROPS INTERFACE VERIFICATION
// =============================================================================

/**
 * Zod contract type definitions for each block type.
 * This maps block types to their required prop fields.
 */
const BLOCK_CONTRACTS: Record<string, { required: string[]; optional: string[] }> = {
  hero: {
    required: ['title', 'headline'],
    optional: ['tagline', 'subtitle', 'description', 'primaryCTA', 'secondaryCTA', 'image', 'background', 'variant', 'className', 'enableAnimations', 'animationDelay', 'hotelId', 'enableContent'],
  },
  // Add other block types as needed
} as const;

/**
 * Gate 2: Props Interface Verification
 *
 * Validates that:
 * - The component's props type matches the expected Zod contract
 * - All required props from the contract are present
 *
 * @param sourceFile - Parsed SourceFile from ts-morph
 * @param blockType - Type of block (e.g., 'hero')
 * @returns GateResult with props validation outcome
 */
export function validateProps(sourceFile: SourceFile, blockType: string): GateResult {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();
  const contract = BLOCK_CONTRACTS[blockType];

  if (!contract) {
    // Unknown block type - skip validation but warn
    return createPassedGate('props');
  }

  // Get the function declaration
  const declarations = sourceFile.getFunctions();
  const componentFunction = declarations.find(fn => fn.isExported());

  if (!componentFunction) {
    return createFailedGateWithError(
      'props',
      fileName,
      1,
      1,
      'No exported function found. Component must export a function.',
      'Export a function component.'
    );
  }

  // Get the props parameter
  const propsParameter = componentFunction.getParameters()[0];
  if (!propsParameter) {
    return createFailedGateWithError(
      'props',
      fileName,
      componentFunction.getStartLineNumber(),
      1,
      'Component has no props parameter. Props must be defined.',
      'Add a props parameter matching the contract.'
    );
  }

  // Get the props type
  const propsType = propsParameter.getType();
  const propsTypeName = propsType.getText();
  const pos = getLineAndColumn(sourceFile, propsParameter.getStart());

  // Check if props type extends the contract
  // For simplicity, we check if it references the contract type
  if (!propsTypeName.includes('Contract') && !propsTypeName.includes('Props')) {
    errors.push(createValidationError(
      fileName,
      pos.line,
      pos.column,
      `Props type "${propsTypeName}" does not extend the contract type. Expected type to include "Contract" or "Props".`,
      'Ensure props type extends the appropriate contract type (e.g., HeroSectionContractType).'
    ));
  }

  // Check if required props are destructured from props parameter
  const functionBody = componentFunction.getBody();
  if (!functionBody) {
    return createFailedGateWithError(
      'props',
      fileName,
      pos.line,
      pos.column,
      'Component function has no body.',
      'Add a function body with proper implementation.'
    );
  }

  // Get all destructured properties from props
  const destructuredProps = extractDestructuredProps(functionBody.getText());
  const bodyPos = getLineAndColumn(sourceFile, functionBody.getStart());

  // Validate required props are destructured
  for (const requiredProp of contract.required) {
    if (!destructuredProps.includes(requiredProp)) {
      errors.push(createValidationError(
        fileName,
        bodyPos.line,
        bodyPos.column,
        `Required prop "${requiredProp}" is not destructured from props. All required props must be destructured.`,
        `Add "${requiredProp}" to the props destructuring.`
      ));
    }
  }

  if (errors.length > 0) {
    return createFailedGate('props', errors);
  }

  return createPassedGate('props');
}

/**
 * Extract destructured property names from function body text.
 *
 * @param bodyText - Function body source code
 * @returns Array of destructured property names
 */
function extractDestructuredProps(bodyText: string): string[] {
  const destructuredProps: string[] = [];

  // Match destructuring patterns like: const { prop1, prop2 } = props;
  // or: const { prop1, prop2, ...rest } = props;
  const destructuringRegex = /const\s*\{([^}]+)\}\s*=\s*props\s*;/g;
  let match;

  while ((match = destructuringRegex.exec(bodyText)) !== null) {
    const propsBlock = match[1];
    // Split on comma and extract property names
    const properties = propsBlock.split(',').map(p => p.trim());
    for (const prop of properties) {
      // Handle spread operator: ...rest
      if (prop.startsWith('...')) continue;
      // Handle default values: prop = defaultValue
      const propName = prop.split('=')[0].trim();
      // Handle nested destructuring: { nested } (skip for now)
      if (propName && !propName.includes('{')) {
        destructuredProps.push(propName);
      }
    }
  }

  return destructuredProps;
}

// =============================================================================
// GATE 3: CVA CLASS STRING VERIFICATION
// =============================================================================

/**
 * Gate 3: CVA Class String Verification
 *
 * Validates that:
 * - All className attribute string literals contain only allowed semantic tokens
 * - All CVA cva() call string literals contain only allowed semantic tokens
 *
 * @param sourceFile - Parsed SourceFile from ts-morph
 * @returns GateResult with class validation outcome
 */
export function validateClasses(sourceFile: SourceFile): GateResult {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Get all JSX elements in the file
  const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  const jsxOpeningElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);

  // Combine both types of elements
  const allElements = [...jsxElements, ...jsxOpeningElements];

  for (const element of allElements) {
    // Check className attributes
    const classNameAttribute = element.getAttribute('className');
    if (classNameAttribute) {
      const classErrors = validateClassNameAttribute(classNameAttribute, sourceFile);
      errors.push(...classErrors);
    }

    // Check class attributes (alternative to className)
    const classAttribute = element.getAttribute('class');
    if (classAttribute) {
      const classErrors = validateClassNameAttribute(classAttribute, sourceFile);
      errors.push(...classErrors);
    }
  }

  // Check CVA cva() calls
  const cvaCalls = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression);
  for (const call of cvaCalls) {
    if (call.getExpression().getText() === 'cva') {
      const cvaErrors = validateCvaCall(call, sourceFile);
      errors.push(...cvaErrors);
    }
  }

  if (errors.length > 0) {
    return createFailedGate('classes', errors);
  }

  return createPassedGate('classes');
}

/**
 * Validate a className attribute value.
 *
 * @param attribute - JSX attribute to validate
 * @param sourceFile - SourceFile for position info
 * @returns Array of validation errors (empty if valid)
 */
function validateClassNameAttribute(
  attribute: any,
  sourceFile: SourceFile
): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Get the attribute value
  const initializer = attribute.getInitializer();
  if (!initializer) return errors;

  const pos = getLineAndColumn(sourceFile, attribute.getStart());

  // Handle JSX expression wrapper (common in JSX attributes)
  const expression = initializer.getKind() === SyntaxKind.JsxExpression
    ? initializer.getExpression()
    : initializer;

  // Handle string literals
  if (expression && expression.getKind() === SyntaxKind.StringLiteral) {
    const classString = expression.getLiteralValue();
    const invalidClasses = getInvalidClasses(classString);

    if (invalidClasses.length > 0) {
      errors.push(createValidationError(
        fileName,
        pos.line,
        pos.column,
        `Invalid Tailwind classes found: ${invalidClasses.join(', ')}. Only semantic tokens from the allowlist are permitted.`,
        `Replace with allowed semantic tokens or use the cn() utility for dynamic classes.`
      ));
    }
  }
  // Note: Template literals are handled by Gate 4 (Semantic Token Compliance)
  // We skip them here to avoid duplicate errors

  return errors;
}

/**
 * Validate a CVA cva() call.
 *
 * @param call - Call expression to validate
 * @param sourceFile - SourceFile for position info
 * @returns Array of validation errors (empty if valid)
 */
function validateCvaCall(call: any, sourceFile: SourceFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();
  const pos = getLineAndColumn(sourceFile, call.getStart());

  // Get the arguments passed to cva()
  const args = call.getArguments();

  for (const arg of args) {
    // Check object argument (common in CVA)
    if (arg.getKindName() === 'ObjectLiteralExpression') {
      const properties = arg.getProperties();

      for (const prop of properties) {
        const value = prop.getInitializer();
        if (!value) continue;

        // Check if value is a string literal (base classes)
        if (value.getKindName() === 'StringLiteral') {
          const classString = value.getLiteralValue();
          const invalidClasses = getInvalidClasses(classString);

          if (invalidClasses.length > 0) {
            errors.push(createValidationError(
              fileName,
              pos.line,
              pos.column,
              `Invalid Tailwind classes in cva() call: ${invalidClasses.join(', ')}.`,
              'Replace with allowed semantic tokens.'
            ));
          }
        }
        // Check array of classes
        else if (value.getKindName() === 'ArrayLiteralExpression') {
          const elements = value.getElements();
          for (const element of elements) {
            if (element.getKindName() === 'StringLiteral') {
              const classString = element.getLiteralValue();
              const invalidClasses = getInvalidClasses(classString);

              if (invalidClasses.length > 0) {
                errors.push(createValidationError(
                  fileName,
                  pos.line,
                  pos.column,
                  `Invalid Tailwind classes in cva() array: ${invalidClasses.join(', ')}.`,
                  'Replace with allowed semantic tokens.'
                ));
              }
            }
          }
        }
      }
    }
  }

  return errors;
}

// =============================================================================
// GATE 4: SEMANTIC TOKEN COMPLIANCE
// =============================================================================

/**
 * Gate 4: Semantic Token Compliance
 *
 * Validates that:
 * - No template literals in className attributes (pattern: `bg-${variant}`)
 * - No inline style={} attributes
 * - 'use client' directive is used correctly (only when needed)
 *
 * @param sourceFile - Parsed SourceFile from ts-morph
 * @returns GateResult with compliance validation outcome
 */
export function validateCompliance(sourceFile: SourceFile): GateResult {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Check 1: Template literals in className
  const templateLiteralErrors = checkTemplateLiteralsInClassName(sourceFile);
  errors.push(...templateLiteralErrors);

  // Check 2: Inline style attributes
  const styleErrors = checkInlineStyleAttributes(sourceFile);
  errors.push(...styleErrors);

  // Check 3: 'use client' directive correctness
  const useClientErrors = checkUseClientDirective(sourceFile);
  errors.push(...useClientErrors);

  // Check 4: Arbitrary Tailwind values (e.g., w-[30%], h-[500px])
  const arbitraryValueErrors = checkArbitraryValues(sourceFile);
  errors.push(...arbitraryValueErrors);

  if (errors.length > 0) {
    return createFailedGate('compliance', errors);
  }

  return createPassedGate('compliance');
}

/**
 * Check for template literals in className attributes.
 *
 * @param sourceFile - SourceFile to check
 * @returns Array of validation errors
 */
function checkTemplateLiteralsInClassName(sourceFile: SourceFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Get all JSX elements
  const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  const jsxOpeningElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  const allElements = [...jsxElements, ...jsxOpeningElements];

  for (const element of allElements) {
    const classNameAttribute = element.getAttribute('className');
    if (!classNameAttribute) continue;

    // getAttribute returns JsxAttributeLike (union of JsxAttribute | JsxSpreadAttribute)
    // We need to check the kind before calling methods that only exist on JsxAttribute
    if (classNameAttribute.getKindName() !== 'JsxAttribute') {
      continue;
    }

    // Now we can safely cast to JsxAttribute
    const jsxClosingElementAttribute = classNameAttribute as any;
    const initializer = jsxClosingElementAttribute.getInitializer();
    if (!initializer) continue;

    const pos = getLineAndColumn(sourceFile, classNameAttribute.getStart());

    // Check for template expressions
    // Note: Template literals in JSX are wrapped in JsxExpression
    const expression = initializer.getKind() === SyntaxKind.JsxExpression
      ? initializer.getExpression()
      : initializer;

    if (expression && (expression.getKind() === SyntaxKind.TemplateExpression ||
        expression.getKind() === SyntaxKind.NoSubstitutionTemplateLiteral)) {
      errors.push(createValidationError(
        fileName,
        pos.line,
        pos.column,
        BANNED_PATTERNS.TEMPLATE_LITERAL_CLASSNAME,
        'Use static class strings combined with cn() utility for conditional classes.'
      ));
    }
  }

  return errors;
}

/**
 * Check for inline style attributes.
 *
 * @param sourceFile - SourceFile to check
 * @returns Array of validation errors
 */
function checkInlineStyleAttributes(sourceFile: SourceFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Get all JSX elements
  const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  const jsxOpeningElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  const allElements = [...jsxElements, ...jsxOpeningElements];

  for (const element of allElements) {
    const styleAttribute = element.getAttribute('style');
    if (!styleAttribute) continue;

    const pos = getLineAndColumn(sourceFile, styleAttribute.getStart());

    errors.push(createValidationError(
      fileName,
      pos.line,
      pos.column,
      BANNED_PATTERNS.INLINE_STYLE,
      'Use semantic token classes instead of inline styles.'
    ));
  }

  return errors;
}

/**
 * Check 'use client' directive correctness.
 *
 * @param sourceFile - SourceFile to check
 * @returns Array of validation errors
 */
function checkUseClientDirective(sourceFile: SourceFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Check if file has 'use client' directive
  const hasUseClient = sourceFile.getStatements().some(stmt => {
    const text = stmt.getText();
    return text.includes("'use client'") || text.includes('"use client"');
  });

  if (!hasUseClient) {
    // No 'use client' directive - check if component uses hooks/events
    const usesHooks = checkIfComponentUsesHooks(sourceFile);
    const usesEvents = checkIfComponentUsesEvents(sourceFile);

    if (usesHooks || usesEvents) {
      // Component needs 'use client' but doesn't have it
      const pos = { line: 1, column: 1 };
      errors.push(createValidationError(
        fileName,
        pos.line,
        pos.column,
        `Component uses ${usesHooks ? 'React hooks' : 'event handlers'} but is missing 'use client' directive.`,
        'Add "use client"; directive at the top of the file.'
      ));
    }
  }

  return errors;
}

/**
 * Check if component uses React hooks.
 *
 * @param sourceFile - SourceFile to check
 * @returns true if hooks are detected
 */
function checkIfComponentUsesHooks(sourceFile: SourceFile): boolean {
  const text = sourceFile.getFullText();

  // Common React hooks
  const hooks = [
    'useState', 'useEffect', 'useCallback', 'useMemo', 'useRef',
    'useContext', 'useReducer', 'useLayoutEffect', 'useImperativeHandle',
    'useId', 'useSyncExternalStore', 'useTransition', 'useDeferredValue',
  ];

  return hooks.some(hook =>
    new RegExp(`\\b${hook}\\s*\\(`).test(text)
  );
}

/**
 * Check if component uses event handlers.
 *
 * @param sourceFile - SourceFile to check
 * @returns true if event handlers are detected
 */
function checkIfComponentUsesEvents(sourceFile: SourceFile): boolean {
  const text = sourceFile.getFullText();

  // Common event handler patterns
  const eventPatterns = [
    /onClick\s*=/,
    /onSubmit\s*=/,
    /onChange\s*=/,
    /on[A-Z][a-z]+\s*=/, // Any on* event handler
  ];

  return eventPatterns.some(pattern => pattern.test(text));
}

/**
 * Check for arbitrary Tailwind values (e.g., w-[30%], h-[500px]).
 *
 * @param sourceFile - SourceFile to check
 * @returns Array of validation errors
 */
function checkArbitraryValues(sourceFile: SourceFile): ValidationError[] {
  const errors: ValidationError[] = [];
  const fileName = sourceFile.getFilePath();

  // Get all JSX elements
  const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
  const jsxOpeningElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement);
  const allElements = [...jsxElements, ...jsxOpeningElements];

  for (const element of allElements) {
    // Check all attributes for arbitrary values
    const attributes = element.getAttributes();

    for (const attr of attributes) {
      // Skip spread attributes (they don't have names or initializers in the same way)
      if (attr.getKindName() === 'JsxSpreadAttribute') {
        continue;
      }

      // getAttributes returns JsxAttributeLike (union of JsxAttribute | JsxSpreadAttribute)
      // We need to check the kind before calling methods that only exist on JsxAttribute
      if (attr.getKindName() !== 'JsxAttribute') {
        continue;
      }

      // Now we can safely cast to JsxAttribute
      const jsxAttribute = attr as any;

      // Get attribute name using correct ts-morph API
      const attrName = jsxAttribute.getNameNode().getText();
      const initializer = jsxAttribute.getInitializer();

      if (!initializer) continue;

      // Get the string value
      let value = '';
      if (initializer.getKind() === SyntaxKind.StringLiteral) {
        value = initializer.getLiteralValue();
      } else if (initializer.getKind() === SyntaxKind.TemplateExpression) {
        // Skip template expressions (handled by Gate 3)
        continue;
      } else {
        continue;
      }

      // Check for arbitrary value pattern: class-[value]
      const arbitraryValuePattern = /\w+-\[[^\]]+\]/g;
      const matches = value.match(arbitraryValuePattern);

      if (matches) {
        const pos = getLineAndColumn(sourceFile, attr.getStart());
        errors.push(createValidationError(
          fileName,
          pos.line,
          pos.column,
          `Arbitrary Tailwind values found: ${matches.join(', ')}. ${BANNED_PATTERNS.ARBITRARY_VALUE}`,
          'Replace with predefined semantic tokens from the allowlist.'
        ));
      }
    }
  }

  return errors;
}

// =============================================================================
// GATE 5: TYPESCRIPT COMPILATION
// =============================================================================

/**
 * Gate 5: TypeScript Compilation
 *
 * Validates that:
 * - The generated TSX code compiles without errors
 * - All type annotations are correct
 * - No missing imports or type errors
 *
 * @param code - Generated TSX code string
 * @param config - Validation configuration
 * @returns GateResult with compilation validation outcome
 */
export function validateCompilation(
  code: string,
  config: ValidationConfig
): GateResult {
  const fileName = 'generated-variant.tsx';
  const errors: ValidationError[] = [];
  let tempFilePath: string | null = null;

  try {
    // Skip compilation if configured (for faster testing)
    if (config.skipCompilation) {
      return createPassedGate('compilation');
    }

    // Add type references to the code for proper JSX type checking
    // This ensures the temp file has access to JSX type definitions
    const codeWithTypes = `/// <reference types="react" />
${code}`;

    // Write temp file
    tempFilePath = writeTempFileSync(config.tempDir, codeWithTypes);

    // Run TypeScript compiler (synchronous)
    const tscErrors = runTypeScriptCompilerSync(tempFilePath, config);

    if (tscErrors.length > 0) {
      errors.push(...tscErrors);
    }

    if (errors.length > 0) {
      return createFailedGate('compilation', errors);
    }

    return createPassedGate('compilation');
  } finally {
    // Always cleanup temp file
    if (tempFilePath) {
      cleanupTempFileSync(tempFilePath);
    }
  }
}

/**
 * Gate 5: TypeScript Compilation (Async version for non-blocking operation)
 *
 * Async version of Gate 5 that doesn't block the event loop.
 * Use this for performance-sensitive scenarios.
 *
 * @param code - Generated TSX code string
 * @param config - Validation configuration
 * @returns GateResult with compilation validation outcome
 */
export async function validateCompilationAsync(
  code: string,
  config: ValidationConfig
): Promise<GateResult> {
  const fileName = 'generated-variant.tsx';
  const errors: ValidationError[] = [];
  let tempFilePath: string | null = null;

  try {
    // Skip compilation if configured (for faster testing)
    if (config.skipCompilation) {
      return createPassedGate('compilation');
    }

    // Add type references to the code for proper JSX type checking
    // This ensures the temp file has access to JSX type definitions
    const codeWithTypes = `/// <reference types="react" />
${code}`;

    // Write temp file
    tempFilePath = await writeTempFile(config.tempDir, codeWithTypes);

    // Run TypeScript compiler (async)
    const tscErrors = await runTypeScriptCompilerAsync(tempFilePath, config);

    if (tscErrors.length > 0) {
      errors.push(...tscErrors);
    }

    if (errors.length > 0) {
      return createFailedGate('compilation', errors);
    }

    return createPassedGate('compilation');
  } finally {
    // Always cleanup temp file
    if (tempFilePath) {
      await cleanupTempFile(tempFilePath);
    }
  }
}

/**
 * Run TypeScript compiler on a file and parse errors.
 *
 * @param filePath - Path to file to compile
 * @param config - Validation configuration
 * @returns Array of compilation errors (empty if successful)
 */
async function runTypeScriptCompiler(
  filePath: string,
  config: ValidationConfig
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  try {
    // Use child_process to run tsc
    const { execSync } = require('child_process');

    // Run tsc --noEmit on the specific file
    const tscPath = path.join(config.projectRoot, 'web-app', 'node_modules', '.bin', 'tsc');
    const tsconfigPath = path.join(config.projectRoot, 'web-app', 'tsconfig.json');

    const command = `"${tscPath}" --noEmit --pretty false "${filePath}"`;

    try {
      const output = execSync(command, {
        cwd: path.join(config.projectRoot, 'web-app'),
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // No output means compilation succeeded
      return [];
    } catch (error: any) {
      // tsc returns non-zero exit code on errors
      const stderr = error.stderr || error.stdout || '';
      const parsedErrors = parseTypeScriptErrors(stderr, filePath);
      return parsedErrors;
    }
  } catch (error: any) {
    // If tsc itself fails to run, return a generic error
    return [{
      filePath,
      line: 1,
      column: 1,
      message: `TypeScript compiler error: ${error.message}`,
      fix: 'Ensure TypeScript is installed and tsconfig.json is valid.',
    }];
  }
}

/**
 * Parse TypeScript compiler errors into ValidationError format.
 *
 * @param tscOutput - Raw output from tsc
 * @param filePath - Path to the compiled file
 * @returns Array of parsed validation errors
 */
function parseTypeScriptErrors(tscOutput: string, filePath: string): ValidationError[] {
  const errors: ValidationError[] = [];

  // tsc error format: file.ts(line,column): error TScode: message
  const errorPattern = /([^(]+)\((\d+),(\d+)\):\s+error\s+TS\d+:\s+(.+)/g;
  let match;

  while ((match = errorPattern.exec(tscOutput)) !== null) {
    const [, file, line, column, message] = match;
    errors.push({
      filePath: file.trim(),
      line: parseInt(line, 10),
      column: parseInt(column, 10),
      message: message.trim(),
      fix: 'Fix the TypeScript error shown above.',
    });
  }

  // If no structured errors found but output exists, return a generic error
  if (errors.length === 0 && tscOutput.trim().length > 0) {
    errors.push({
      filePath,
      line: 1,
      column: 1,
      message: `TypeScript compilation failed: ${tscOutput.split('\n')[0]}`,
      fix: 'Review the generated code for syntax or type errors.',
    });
  }

  return errors;
}

/**
 * Run TypeScript compiler on a file and parse errors (synchronous version).
 *
 * @param filePath - Path to file to compile
 * @param config - Validation configuration
 * @returns Array of compilation errors (empty if successful)
 */
function runTypeScriptCompilerSync(
  filePath: string,
  config: ValidationConfig
): ValidationError[] {
  const errors: ValidationError[] = [];

  try {
    // Use child_process to run tsc synchronously
    const { execSync } = require('child_process');
    const fsSync = require('fs');

    // Create a temporary tsconfig.json for validation
    // This includes our target file and preserves jsx settings from the main tsconfig
    const webAppDir = path.join(config.projectRoot, 'web-app');
    const mainTsconfigPath = path.join(webAppDir, 'tsconfig.json');
    const tempTsconfigPath = path.join(config.tempDir, 'tsconfig.validation.json');

    // Read the main tsconfig.json
    let mainTsconfig: any = {};
    try {
      const tsconfigContent = fsSync.readFileSync(mainTsconfigPath, 'utf-8');
      mainTsconfig = JSON.parse(tsconfigContent);
    } catch (error) {
      // If we can't read the main tsconfig, use minimal settings
      mainTsconfig = {
        compilerOptions: {
          jsx: 'preserve',
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
          moduleResolution: 'bundler',
        },
      };
    }

    // Resolve the file path to an absolute path
    const absoluteFilePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(webAppDir, filePath);

    // Create a validation tsconfig that includes only our target file
    // Use absolute path and clear exclude to avoid conflicts
    const validationTsconfig = {
      compilerOptions: {
        ...mainTsconfig.compilerOptions,
        noEmit: true,
      },
      include: [absoluteFilePath],
      // Don't inherit exclude to avoid excluding our temp file
      exclude: [],
    };

    // Write the temporary tsconfig.json
    fsSync.writeFileSync(tempTsconfigPath, JSON.stringify(validationTsconfig, null, 2), 'utf-8');

    try {
      // Run tsc with the temporary tsconfig
      const command = `npx tsc --project "${tempTsconfigPath}" --pretty false`;

      const output = execSync(command, {
        cwd: webAppDir,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // No output means compilation succeeded
      return [];
    } catch (error: any) {
      // tsc returns non-zero exit code on errors
      const stderr = error.stderr || error.stdout || '';
      const parsedErrors = parseTypeScriptErrors(stderr, filePath);
      return parsedErrors;
    } finally {
      // Clean up the temporary tsconfig.json
      try {
        fsSync.unlinkSync(tempTsconfigPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  } catch (error: any) {
    // If tsc itself fails to run, return a generic error
    return [{
      filePath,
      line: 1,
      column: 1,
      message: `TypeScript compiler error: ${error.message}`,
      fix: 'Ensure TypeScript is installed and tsconfig.json is valid.',
    }];
  }
}

/**
 * Run TypeScript compiler on a file and parse errors (async version).
 *
 * @param filePath - Path to file to compile
 * @param config - Validation configuration
 * @returns Array of compilation errors (empty if successful)
 */
async function runTypeScriptCompilerAsync(
  filePath: string,
  config: ValidationConfig
): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  try {
    // Use child_process to run tsc asynchronously
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);

    // Create a temporary tsconfig.json for validation
    // This includes our target file and preserves jsx settings from the main tsconfig
    const webAppDir = path.join(config.projectRoot, 'web-app');
    const mainTsconfigPath = path.join(webAppDir, 'tsconfig.json');
    const tempTsconfigPath = path.join(config.tempDir, 'tsconfig.validation.json');

    // Read the main tsconfig.json
    let mainTsconfig: any = {};
    try {
      const tsconfigContent = await fs.readFile(mainTsconfigPath, 'utf-8');
      mainTsconfig = JSON.parse(tsconfigContent);
    } catch (error) {
      // If we can't read the main tsconfig, use minimal settings
      mainTsconfig = {
        compilerOptions: {
          jsx: 'preserve',
          esModuleInterop: true,
          strict: true,
          skipLibCheck: true,
          moduleResolution: 'bundler',
        },
      };
    }

    // Resolve the file path to an absolute path
    const absoluteFilePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(webAppDir, filePath);

    // Create a validation tsconfig that includes only our target file
    // Use absolute path and clear exclude to avoid conflicts
    const validationTsconfig = {
      compilerOptions: {
        ...mainTsconfig.compilerOptions,
        noEmit: true,
      },
      include: [absoluteFilePath],
      // Don't inherit exclude to avoid excluding our temp file
      exclude: [],
    };

    // Write the temporary tsconfig.json
    await fs.writeFile(tempTsconfigPath, JSON.stringify(validationTsconfig, null, 2), 'utf-8');

    try {
      // Run tsc with the temporary tsconfig
      const command = `npx tsc --project "${tempTsconfigPath}" --pretty false`;

      const output = await execAsync(command, {
        cwd: webAppDir,
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // No output means compilation succeeded
      return [];
    } catch (error: any) {
      // tsc returns non-zero exit code on errors
      const stderr = error.stderr || error.stdout || '';
      const parsedErrors = parseTypeScriptErrors(stderr, filePath);
      return parsedErrors;
    } finally {
      // Clean up the temporary tsconfig.json
      try {
        await fs.unlink(tempTsconfigPath);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }
  } catch (error: any) {
    // If tsc itself fails to run, return a generic error
    return [{
      filePath,
      line: 1,
      column: 1,
      message: `TypeScript compiler error: ${error.message}`,
      fix: 'Ensure TypeScript is installed and tsconfig.json is valid.',
    }];
  }
}

// =============================================================================
// MAIN VALIDATION FUNCTION
// =============================================================================

/**
 * Validate AI-generated TSX through the 5-gate pipeline.
 *
 * This is the main entry point for validation. It runs each gate sequentially
 * and stops at the first failure (fail-fast approach).
 *
 * @param code - Generated TSX file content
 * @param blockType - Type of block being validated (e.g., 'hero')
 * @param contractType - Zod contract to validate against (for future use)
 * @param config - Validation configuration (optional)
 * @returns Validation result with per-gate details
 *
 * @example
 * ```ts
 * const result = validateGeneratedTSX(
 *   generatedCode,
 *   'hero',
 *   'HeroSectionContract'
 * );
 *
 * if (result.passed) {
 *   console.log('All gates passed!');
 * } else {
 *   console.log('Validation failed at gate:', result.gates.find(g => !g.passed)?.gate);
 *   console.log('Errors:', formatErrorsForLLM(result.gates.flatMap(g => g.errors)));
 * }
 * ```
 */
export function validateGeneratedTSX(
  code: string,
  blockType: string,
  contractType: string,
  config?: Partial<ValidationConfig>
): ValidationResult {
  // Merge config with defaults
  const finalConfig: ValidationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  const gates: GateResult[] = [];

  // Create ts-morph project
  const project = createValidationProject(finalConfig);
  let sourceFile: SourceFile | null = null;

  try {
    // Create in-memory source file
    sourceFile = createInMemorySourceFile(project, code);

    // Gate 1: Import Verification
    const gate1Result = validateImports(sourceFile, finalConfig);
    gates.push(gate1Result);
    if (!gate1Result.passed) {
      return { passed: false, gates };
    }

    // Gate 2: Props Interface Verification
    const gate2Result = validateProps(sourceFile, blockType);
    gates.push(gate2Result);
    if (!gate2Result.passed) {
      return { passed: false, gates };
    }

    // Gate 3: CVA Class String Verification
    const gate3Result = validateClasses(sourceFile);
    gates.push(gate3Result);
    if (!gate3Result.passed) {
      return { passed: false, gates };
    }

    // Gate 4: Semantic Token Compliance
    const gate4Result = validateCompliance(sourceFile);
    gates.push(gate4Result);
    if (!gate4Result.passed) {
      return { passed: false, gates };
    }

    // Gate 5: TypeScript Compilation (synchronous - blocks during execution)
    const gate5Result = validateCompilation(code, finalConfig);
    gates.push(gate5Result);
    if (!gate5Result.passed) {
      return { passed: false, gates };
    }

    // All gates passed
    return {
      passed: true,
      gates,
    };
  } finally {
    // Clean up in-memory source file
    if (sourceFile) {
      try {
        sourceFile.forget();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

/**
 * Validate AI-generated TSX through all 5 gates (non-blocking async version).
 *
 * This is an async version that doesn't block the event loop during Gate 5 compilation.
 * Use this for performance-sensitive scenarios where blocking is unacceptable.
 *
 * Note: The main validateGeneratedTSX() function is synchronous and includes all 5 gates.
 * This async version is provided for convenience when non-blocking behavior is preferred.
 *
 * @param code - Generated TSX file content
 * @param blockType - Type of block being validated (e.g., 'hero')
 * @param contractType - Zod contract to validate against
 * @param config - Validation configuration (optional)
 * @returns Validation result with all 5 gates executed
 */
export async function validateGeneratedTSXAsync(
  code: string,
  blockType: string,
  contractType: string,
  config?: Partial<ValidationConfig>
): Promise<ValidationResult> {
  // Merge config with defaults
  const finalConfig: ValidationConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  // Run gates 1-5 synchronously
  const syncResult = validateGeneratedTSX(code, blockType, contractType, config);

  if (!syncResult.passed && syncResult.gates.length < 5) {
    // If failed before gate 5, return early
    return syncResult;
  }

  // If gate 5 passed, we're done
  if (syncResult.passed) {
    return syncResult;
  }

  // If gate 5 failed, check if we want to retry with async compilation
  const lastGate = syncResult.gates[syncResult.gates.length - 1];
  if (lastGate.gate === 'compilation' && !lastGate.passed) {
    // Gate 5 failed - run async compilation and replace the result
    const gate5Result = await validateCompilationAsync(code, finalConfig);

    // Replace the last gate (compilation) with the async result
    syncResult.gates[syncResult.gates.length - 1] = gate5Result;

    if (!gate5Result.passed) {
      return { passed: false, gates: syncResult.gates };
    }

    return { passed: true, gates: syncResult.gates };
  }

  return syncResult;
}

// =============================================================================
// GATE RESULT FACTORIES
// =============================================================================

/**
 * Create a successful gate result.
 *
 * @param gate - Gate type
 * @returns GateResult with passed=true
 */
export function createPassedGate(gate: GateType): GateResult {
  return {
    gate,
    passed: true,
    errors: [],
  };
}

/**
 * Create a failed gate result.
 *
 * @param gate - Gate type
 * @param errors - Array of validation errors
 * @returns GateResult with passed=false
 */
export function createFailedGate(gate: GateType, errors: ValidationError[]): GateResult {
  return {
    gate,
    passed: false,
    errors,
  };
}

/**
 * Create a failed gate result with a single error.
 *
 * @param gate - Gate type
 * @param filePath - File path where error occurred
 * @param line - Line number
 * @param column - Column number
 * @param message - Error message
 * @param fix - Suggested fix (optional)
 * @returns GateResult with passed=false
 */
export function createFailedGateWithError(
  gate: GateType,
  filePath: string,
  line: number,
  column: number,
  message: string,
  fix?: string
): GateResult {
  return {
    gate,
    passed: false,
    errors: [createValidationError(filePath, line, column, message, fix)],
  };
}
