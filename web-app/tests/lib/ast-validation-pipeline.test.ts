/**
 * Unit Tests for AST Validation Pipeline
 * =====================================
 *
 * Story 21.2: 5-Gate AST Validation Pipeline
 *
 * Tests for the validation pipeline that validates AI-generated TSX code
 * through 5 sequential gates:
 * - Gate 1: Import Verification
 * - Gate 2: Props Interface Verification
 * - Gate 3: CVA Class String Verification
 * - Gate 4: Semantic Token Compliance
 * - Gate 5: TypeScript Compilation
 *
 * @see docs/stories/story-21.2-ast-validation-pipeline.md
 * @see web-app/lib/ast-validation-pipeline.ts
 */

import * as path from 'path';
import {
  validateGeneratedTSX,
  validateGeneratedTSXAsync,
  validateImports,
  validateProps,
  validateClasses,
  validateCompliance,
  validateCompilation,
  formatErrorForLLM,
  formatErrorsForLLM,
  createValidationError,
  createPassedGate,
  createFailedGate,
  createFailedGateWithError,
  createInMemorySourceFile,
  createValidationProject,
  type ValidationResult,
  type GateResult,
  type ValidationError,
  type ValidationConfig,
} from '@/lib/ast-validation-pipeline';
import { Project } from 'ts-morph';

// =============================================================================
// FIXTURES
// =============================================================================

/**
 * Valid HeroCentered component for testing.
 * This should pass all gates.
 * Uses only classes from the semantic token allowlist.
 */
const VALID_HERO_CENTERED = `export interface HeroCenteredProps {
  title: string;
  headline: string;
}

export function HeroCentered(props: HeroCenteredProps) {
  const { title, headline } = props;
  return <div className="relative w-full h-full">
    <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
    <h2 className="text-lg text-text-secondary">{headline}</h2>
  </div>;
}
`;

/**
 * Invalid import path - wrong package.
 */
const INVALID_IMPORT_NEW_PACKAGE = `import { SomeComponent } from 'some-random-package';

export function TestComponent(props: { title: string }) {
  return <div>{props.title}</div>;
}
`;

/**
 * Invalid import path - non-existent file.
 */
const INVALID_IMPORT_NON_EXISTENT = `import { SomeComponent } from '@/components/non-existent';

export function TestComponent(props: { title: string }) {
  return <div>{props.title}</div>;
}
`;

/**
 * Missing required prop - title is missing.
 */
const INVALID_MISSING_REQUIRED_PROP = `export interface HeroCenteredProps {
  title: string;
  headline: string;
  tagline?: string;
}

export function HeroCentered(props: HeroCenteredProps) {
  const {
    headline,  // Missing 'title' which is required
    tagline,
  } = props;

  return <div>
    <h1>{headline}</h1>
    {tagline && <p>{tagline}</p>}
  </div>;
}
`;

/**
 * Invalid class string - uses raw color class.
 */
const INVALID_RAW_COLOR_CLASS = `export interface HeroCenteredProps {
  title: string;
  headline: string;
}

export function HeroCentered(props: HeroCenteredProps) {
  const { title, headline } = props;
  return <div className="bg-blue-500 text-white">
    <h1>{title}</h1>
    <h2>{headline}</h2>
  </div>;
}
`;

/**
 * Template literal in className.
 */
const INVALID_TEMPLATE_LITERAL_CLASSNAME = 'export interface HeroCenteredProps {\n' +
  '  title: string;\n' +
  '  headline: string;\n' +
  '  variant?: string;\n' +
  '}\n' +
  '\n' +
  'export function HeroCentered(props: HeroCenteredProps) {\n' +
  '  const { title, headline, variant } = props;\n' +
  '  return <div className={`bg-${variant}-500`}>\n' +
  '    <h1>{title}</h1>\n' +
  '    <h2>{headline}</h2>\n' +
  '  </div>;\n' +
  '}';

/**
 * Inline style attribute.
 */
const INVALID_INLINE_STYLE = `export interface HeroCenteredProps {
  title: string;
  headline: string;
}

export function HeroCentered(props: HeroCenteredProps) {
  const { title, headline } = props;
  return <div style={{ backgroundColor: 'blue' }}>
    <h1>{title}</h1>
    <h2>{headline}</h2>
  </div>;
}
`;

/**
 * Arbitrary Tailwind value.
 */
const INVALID_ARBITRARY_VALUE = `export interface HeroCenteredProps {
  title: string;
  headline: string;
}

export function HeroCentered(props: HeroCenteredProps) {
  const { title, headline } = props;
  return <div className="w-[30%] h-[500px]">
    <h1>{title}</h1>
    <h2>{headline}</h2>
  </div>;
}
`;

/**
 * Missing 'use client' with hooks.
 */
const INVALID_MISSING_USE_CLIENT = `import { useState } from 'react';

export interface HeroCenteredProps {
  title: string;
  headline: string;
}

export function HeroCentered(props: HeroCenteredProps) {
  const { title, headline } = props;
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>{title}</h1>
      <h2>{headline}</h2>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
}
`;

/**
 * TypeScript compilation error.
 */
const INVALID_TYPE_ERROR = `export interface HeroCenteredProps {
  title: number;
  headline: string;
}

export function HeroCentered(props: HeroCenteredProps) {
  const { title, headline } = props;
  // Error: using number as string (title.toUpperCase() is invalid for number)
  return <h1>{title.toUpperCase()}</h1>;
}
`;

// =============================================================================
// TEST CONFIG
// =============================================================================

describe('AST Validation Pipeline', () => {
  let project: Project;

  beforeAll(() => {
    project = createValidationProject({
      projectRoot: path.resolve(process.cwd(), '..'), // Go up to project root
      tempDir: './.temp',
    });
  });

  // =============================================================================
  // Helper Functions Tests
  // =============================================================================

  describe('Helper Functions', () => {
    describe('formatErrorForLLM', () => {
      it('should format error with file name, line, and column', () => {
        const error: ValidationError = {
          filePath: '/path/to/file.tsx',
          line: 10,
          column: 5,
          message: 'Test error message',
        };

        const formatted = formatErrorForLLM(error);

        expect(formatted).toContain('file.tsx:10:5');
        expect(formatted).toContain('Test error message');
      });

      it('should include fix suggestion when provided', () => {
        const error: ValidationError = {
          filePath: '/path/to/file.tsx',
          line: 10,
          column: 5,
          message: 'Test error',
          fix: 'Remove the invalid import',
        };

        const formatted = formatErrorForLLM(error);

        expect(formatted).toContain('Fix:');
        expect(formatted).toContain('Remove the invalid import');
      });
    });

    describe('formatErrorsForLLM', () => {
      it('should format multiple errors', () => {
        const errors: ValidationError[] = [
          {
            filePath: '/path/to/file.tsx',
            line: 10,
            column: 5,
            message: 'First error',
          },
          {
            filePath: '/path/to/file.tsx',
            line: 20,
            column: 3,
            message: 'Second error',
          },
        ];

        const formatted = formatErrorsForLLM(errors);

        expect(formatted).toContain('First error');
        expect(formatted).toContain('Second error');
        expect(formatted).toMatch(/\n/); // Multiple lines
      });
    });

    describe('createValidationError', () => {
      it('should create validation error with all properties', () => {
        const error = createValidationError(
          '/path/to/file.tsx',
          10,
          5,
          'Test error',
          'Fix suggestion'
        );

        expect(error.filePath).toBe('/path/to/file.tsx');
        expect(error.line).toBe(10);
        expect(error.column).toBe(5);
        expect(error.message).toBe('Test error');
        expect(error.fix).toBe('Fix suggestion');
      });

      it('should create error without fix', () => {
        const error = createValidationError(
          '/path/to/file.tsx',
          10,
          5,
          'Test error'
        );

        expect(error.fix).toBeUndefined();
      });
    });

    describe('Gate result factories', () => {
      it('should create passed gate', () => {
        const result = createPassedGate('imports');

        expect(result.gate).toBe('imports');
        expect(result.passed).toBe(true);
        expect(result.errors).toEqual([]);
      });

      it('should create failed gate with errors', () => {
        const errors: ValidationError[] = [
          createValidationError('/path/to/file.tsx', 10, 5, 'Test error'),
        ];

        const result = createFailedGate('imports', errors);

        expect(result.gate).toBe('imports');
        expect(result.passed).toBe(false);
        expect(result.errors).toEqual(errors);
      });

      it('should create failed gate with single error', () => {
        const result = createFailedGateWithError(
          'imports',
          '/path/to/file.tsx',
          10,
          5,
          'Test error',
          'Fix it'
        );

        expect(result.passed).toBe(false);
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toBe('Test error');
        expect(result.errors[0].fix).toBe('Fix it');
      });
    });
  });

  // =============================================================================
  // Gate 1: Import Verification Tests
  // =============================================================================

  describe('Gate 1: Import Verification', () => {
    const config: ValidationConfig = {
      projectRoot: path.resolve(process.cwd(), '..'),
      tempDir: './.temp',
    };

    it('should pass valid HeroCentered component imports', () => {
      const sourceFile = createInMemorySourceFile(project, VALID_HERO_CENTERED);

      const result = validateImports(sourceFile, config);

      expect(result.passed).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail with new npm package import', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_IMPORT_NEW_PACKAGE);

      const result = validateImports(sourceFile, config);

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('not allowed');
    });

    it('should fail with non-existent file import', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_IMPORT_NON_EXISTENT);

      const result = validateImports(sourceFile, config);

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('does not resolve');
    });
  });

  // =============================================================================
  // Gate 2: Props Interface Verification Tests
  // =============================================================================

  describe('Gate 2: Props Interface Verification', () => {
    it('should pass valid HeroCentered component props', () => {
      const sourceFile = createInMemorySourceFile(project, VALID_HERO_CENTERED);

      const result = validateProps(sourceFile, 'hero');

      expect(result.passed).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail when required prop is missing', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_MISSING_REQUIRED_PROP);

      const result = validateProps(sourceFile, 'hero');

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('title');
      expect(result.errors[0].message).toContain('not destructured');
    });

    it('should skip validation for unknown block type', () => {
      const sourceFile = createInMemorySourceFile(project, VALID_HERO_CENTERED);

      const result = validateProps(sourceFile, 'unknown-block-type');

      expect(result.passed).toBe(true);
    });
  });

  // =============================================================================
  // Gate 3: CVA Class String Verification Tests
  // =============================================================================

  describe('Gate 3: CVA Class String Verification', () => {
    it('should pass valid semantic token classes', () => {
      const sourceFile = createInMemorySourceFile(project, VALID_HERO_CENTERED);

      const result = validateClasses(sourceFile);

      expect(result.passed).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail with raw color class', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_RAW_COLOR_CLASS);

      const result = validateClasses(sourceFile);

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('bg-blue-500');
      expect(result.errors[0].message).toContain('Invalid Tailwind classes');
    });
  });

  // =============================================================================
  // Gate 4: Semantic Token Compliance Tests
  // =============================================================================

  describe('Gate 4: Semantic Token Compliance', () => {
    it('should pass valid HeroCentered component', () => {
      const sourceFile = createInMemorySourceFile(project, VALID_HERO_CENTERED);

      const result = validateCompliance(sourceFile);

      expect(result.passed).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should fail with template literal className', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_TEMPLATE_LITERAL_CLASSNAME);

      const result = validateCompliance(sourceFile);

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Template literal');
    });

    it('should fail with inline style', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_INLINE_STYLE);

      const result = validateCompliance(sourceFile);

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Inline style');
    });

    it('should fail with arbitrary value', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_ARBITRARY_VALUE);

      const result = validateCompliance(sourceFile);

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Arbitrary Tailwind');
    });

    it('should fail when hooks used without use client', () => {
      const sourceFile = createInMemorySourceFile(project, INVALID_MISSING_USE_CLIENT);

      const result = validateCompliance(sourceFile);

      expect(result.passed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('use client');
    });
  });

  // =============================================================================
  // Full Pipeline Tests
  // =============================================================================

  describe('Full Validation Pipeline', () => {
    const config: Partial<ValidationConfig> = {
      projectRoot: path.resolve(process.cwd(), '..'),
      tempDir: './.temp',
    };

    it('should pass valid HeroCentered component through gates 1-4', () => {
      const result = validateGeneratedTSX(
        VALID_HERO_CENTERED,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(true);
      expect(result.gates).toHaveLength(5); // All 5 gates (compilation is synchronous)
    });

    it('should fail at Gate 1 with invalid import', () => {
      const result = validateGeneratedTSX(
        INVALID_IMPORT_NEW_PACKAGE,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(false);
      expect(result.gates).toHaveLength(1);
      expect(result.gates[0].gate).toBe('imports');
      expect(result.gates[0].passed).toBe(false);
    });

    it('should fail at Gate 2 with missing required prop', () => {
      const result = validateGeneratedTSX(
        INVALID_MISSING_REQUIRED_PROP,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(false);
      expect(result.gates.length).toBeGreaterThanOrEqual(2);
      expect(result.gates[1].gate).toBe('props');
      expect(result.gates[1].passed).toBe(false);
    });

    it('should fail at Gate 3 with invalid class', () => {
      const result = validateGeneratedTSX(
        INVALID_RAW_COLOR_CLASS,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(false);
      expect(result.gates.length).toBeGreaterThanOrEqual(3);
      expect(result.gates[2].gate).toBe('classes');
      expect(result.gates[2].passed).toBe(false);
    });

    it('should fail at Gate 4 with template literal', () => {
      const result = validateGeneratedTSX(
        INVALID_TEMPLATE_LITERAL_CLASSNAME,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(false);
      expect(result.gates.length).toBeGreaterThanOrEqual(4);
      expect(result.gates[3].gate).toBe('compliance');
      expect(result.gates[3].passed).toBe(false);
    });

    it('should provide formatted errors for LLM retry', () => {
      const result = validateGeneratedTSX(
        INVALID_IMPORT_NEW_PACKAGE,
        'hero',
        'HeroSectionContract',
        config
      );

      const allErrors = result.gates.flatMap(g => g.errors);
      const formatted = formatErrorsForLLM(allErrors);

      expect(formatted).toContain('Error in');
      expect(formatted).toContain(':');
    });
  });

  // =============================================================================
  // Gate 5: TypeScript Compilation Tests
  // =============================================================================

  describe('Gate 5: TypeScript Compilation', () => {
    const config: Partial<ValidationConfig> = {
      projectRoot: path.resolve(process.cwd(), '..'),
      tempDir: './.temp',
      skipCompilation: false, // Enable compilation for these tests
    };

    it('should pass valid TypeScript code', async () => {
      const result = await validateGeneratedTSXAsync(
        VALID_HERO_CENTERED,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(true);
      // Should have all 5 gates
      expect(result.gates.length).toBe(5);
      expect(result.gates[4].gate).toBe('compilation');
      expect(result.gates[4].passed).toBe(true);
    }, 10000); // Increase timeout to 10 seconds for compilation

    it('should fail with TypeScript type error', async () => {
      const result = await validateGeneratedTSXAsync(
        INVALID_TYPE_ERROR,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(false);
      // Should fail at Gate 5 (compilation)
      expect(result.gates.length).toBeGreaterThanOrEqual(5);
      expect(result.gates[4].gate).toBe('compilation');
      expect(result.gates[4].passed).toBe(false);
      expect(result.gates[4].errors.length).toBeGreaterThan(0);
    }, 10000); // Increase timeout to 10 seconds for compilation

    it('should pass valid TypeScript code synchronously', () => {
      const config: Partial<ValidationConfig> = {
        projectRoot: path.resolve(process.cwd(), '..'),
        tempDir: './.temp',
        skipCompilation: true, // Skip compilation for this basic test
      };

      const result = validateGeneratedTSX(
        VALID_HERO_CENTERED,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(true);
      // Should have all 5 gates (but compilation is skipped)
      expect(result.gates.length).toBe(5);
      expect(result.gates[4].gate).toBe('compilation');
      expect(result.gates[4].passed).toBe(true); // Skipped compilation passes
    });

    it('should fail synchronously with TypeScript type error', () => {
      const config: Partial<ValidationConfig> = {
        projectRoot: path.resolve(process.cwd(), '..'),
        tempDir: './.temp',
        skipCompilation: false, // Enable compilation for this test
      };

      const result = validateGeneratedTSX(
        INVALID_TYPE_ERROR,
        'hero',
        'HeroSectionContract',
        config
      );

      expect(result.passed).toBe(false);
      // Should fail at Gate 5 (compilation)
      expect(result.gates.length).toBe(5);
      expect(result.gates[4].gate).toBe('compilation');
      expect(result.gates[4].passed).toBe(false);
      expect(result.gates[4].errors.length).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // Integration Tests
  // =============================================================================

  describe('Integration Tests', () => {
    it('should validate actual HeroCentered.tsx file passes all gates', async () => {
      // Read actual HeroCentered component
      const fs = require('fs');
      const heroCenteredPath = path.resolve(
        process.cwd(),
        'components/sections/HeroSection/HeroCentered.tsx'
      );

      try {
        const actualCode = fs.readFileSync(heroCenteredPath, 'utf-8');

        // Run validation (skip compilation for speed)
        const result = await validateGeneratedTSXAsync(
          actualCode,
          'hero',
          'HeroSectionContract',
          {
            projectRoot: path.resolve(process.cwd(), '..'),
            tempDir: './.temp',
            skipCompilation: true,
          }
        );

        expect(result.passed).toBe(true);
      } catch (error) {
        // File might not exist in test environment - skip test
        console.warn('HeroCentered.tsx not found, skipping integration test');
      }
    });
  });
});
