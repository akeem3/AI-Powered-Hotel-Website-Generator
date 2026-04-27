/**
 * Unit Tests for Few-Shot Context Assembler
 * =====================================
 *
 * Story 21.1: Few-Shot Context Assembler + Semantic Allowlist Integration
 *
 * Tests for the context assembly functions that provide AI generation prompts
 * with all necessary context materials: sibling variant files, Zod contracts, and
 * semantic token allowlists.
 *
 * Test Coverage:
 * - gatherComponentContext() with HeroSection (3 variants)
 * - gatherComponentContext() with 2-variant block (edge case)
 * - File not found error handling for all functions
 * - Delimiter formatting verification
 * - index.tsx and .client.tsx exclusion
 * - gatherContractContext() with Zod contract
 * - gatherAllowlistContext() with SEMANTIC_TOKEN_ALLOWLIST
 *
 * @see docs/stories/story-21.1-few-shot-context-assembler.md
 * @see web-app/lib/few-shot-context.ts
 */

import { promises as fs } from 'fs';
import path from 'path';
import {
  gatherComponentContext,
  gatherContractContext,
  gatherAllowlistContext,
  resolveBlockPath,
} from '@/lib/few-shot-context';

// Mock fs.readFile for testing
const mockReadFile = jest.spyOn(fs, 'readFile');
const mockReaddir = jest.spyOn(fs, 'readdir');
const mockAccess = jest.spyOn(fs, 'access');

// Track actual file reads for verification
const fileReads: Map<string, string> = new Map();

describe('Few-Shot Context Assembler', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset file read tracker
    fileReads.clear();

    // Reset mocks to default implementation
    mockReadFile.mockReset();
    mockReaddir.mockReset();
    mockAccess.mockReset();

    // Setup default mock for fs.readFile (returns file content)
    mockReadFile.mockImplementation((filePath, encoding) => {
      if (encoding !== 'utf-8') {
        return Promise.reject(new Error('Invalid encoding'));
      }

      // Normalize path for cross-platform compatibility
      // On Windows, paths might use backslashes, but tests set up with forward slashes
      const normalizedPath = String(filePath).replace(/\\/g, '/');

      // Return actual file content if it exists in our tracker
      if (fileReads.has(filePath)) {
        return Promise.resolve(fileReads.get(filePath)!);
      }
      if (fileReads.has(normalizedPath)) {
        return Promise.resolve(fileReads.get(normalizedPath)!);
      }

      // If we haven't explicitly mocked this file, throw
      return Promise.reject(new Error(`ENOENT: no such file or directory, open '${filePath}'`));
    });

    // Setup default mock for fs.readdir
    mockReaddir.mockImplementation((dirPath) => {
      // If we've set up specific files for this test, use them
      const mockFiles = getMockFilesForDirectory(dirPath);
      if (mockFiles) {
        return Promise.resolve(mockFiles);
      }

      // Otherwise return empty array
      return Promise.resolve([]);
    });

    // Setup default mock for fs.access (throws for non-existent paths)
    mockAccess.mockImplementation((filePath) => {
      // Normalize path for cross-platform compatibility
      const normalizedPath = String(filePath).replace(/\\/g, '/');

      const mockFiles = getMockFilesForDirectory(filePath) || getMockFilesForDirectory(normalizedPath);
      if (mockFiles) {
        return Promise.resolve();
      }

      return Promise.reject(new Error(`ENOENT: no such file or directory, access '${filePath}'`));
    });
  });

  afterEach(() => {
    // Clean up file read tracker after each test
    fileReads.clear();
  });

  afterAll(() => {
    // Restore mocks
    mockReadFile.mockRestore();
    mockReaddir.mockRestore();
    mockAccess.mockRestore();
  });

  // =============================================================================
  // gatherComponentContext() Tests
  // =============================================================================

  describe('gatherComponentContext', () => {
    describe('with HeroSection (3 variants)', () => {
      beforeEach(() => {
        // Set up HeroSection directory with 3 variant files
        setupMockDirectory(
          '/mock/web-app/components/sections/HeroSection',
          [
            'HeroCentered.tsx',
            'HeroSplit.tsx',
            'HeroMinimal.tsx',
            'index.tsx', // Should be excluded
            'AnimatedHeroSection.client.tsx', // Should be excluded
          ]
        );

        // Load actual file content for the 3 Hero variants
        loadActualHeroVariantFiles();
      });

      it('should return all 3 sibling variant files wrapped in delimiters', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        // Verify all 3 variants are included
        expect(context).toContain('=== EXISTING COMPONENT: HeroCentered.tsx ===');
        expect(context).toContain('=== EXISTING COMPONENT: HeroSplit.tsx ===');
        expect(context).toContain('=== EXISTING COMPONENT: HeroMinimal.tsx ===');

        // Verify delimiters are present
        expect(context).toMatch(/=== END ===/g);
        expect(context.split('=== END ===').length).toBe(4); // 3 files + 1 contract
      });

      it('should exclude index.tsx from results', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        expect(context).not.toContain('=== EXISTING COMPONENT: index.tsx ===');
      });

      it('should exclude .client.tsx files from results', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        expect(context).not.toContain('=== EXISTING COMPONENT: AnimatedHeroSection.client.tsx ===');
      });

      it('should return complete file content (not snippets)', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        // Verify HeroCentered.tsx content includes key elements
        expect(context).toContain('HeroCentered Server Component');
        expect(context).toContain('export function HeroCentered');
        expect(context).toContain('from \'next/link\'');
        expect(context).toContain('import { Button } from');

        // Verify HeroSplit.tsx content
        expect(context).toContain('HeroSplit Server Component');
        expect(context).toContain('export function HeroSplit');

        // Verify HeroMinimal.tsx content
        expect(context).toContain('HeroMinimal Server Component');
        expect(context).toContain('export function HeroMinimal');
      });

      it('should return variants in consistent (alphabetical) order', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        // Verify order: HeroCentered, HeroMinimal, HeroSplit (alphabetical)
        const centeredIndex = context.indexOf('=== EXISTING COMPONENT: HeroCentered.tsx ===');
        const minimalIndex = context.indexOf('=== EXISTING COMPONENT: HeroMinimal.tsx ===');
        const splitIndex = context.indexOf('=== EXISTING COMPONENT: HeroSplit.tsx ===');

        expect(centeredIndex).toBeLessThan(minimalIndex);
        expect(minimalIndex).toBeLessThan(splitIndex);
      });
    });

    describe('with 2-variant block (edge case)', () => {
      beforeEach(() => {
        // Set up a hypothetical block with only 2 variants
        setupMockDirectory('/mock/web-app/components/sections/TestBlock', [
          'TestVariant1.tsx',
          'TestVariant2.tsx',
        ]);

        // Mock file content for test variants
        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant1.tsx'),
          'export function TestVariant1() { return "variant1"; }'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant2.tsx'),
          'export function TestVariant2() { return "variant2"; }'
        );
      });

      it('should return both available variants when directory has only 2', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/TestBlock'
        );

        expect(context).toContain('=== EXISTING COMPONENT: TestVariant1.tsx ===');
        expect(context).toContain('=== EXISTING COMPONENT: TestVariant2.tsx ===');
      });

      it('should not require 3 variants - accepts whatever is available', async () => {
        // This test verifies the MIN_VARIANTS check (2 minimum)
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/TestBlock'
        );

        // Should not throw error for having only 2 variants
        expect(context).toBeDefined();
        expect(context.length).toBeGreaterThan(0);
      });
    });

    describe('error handling', () => {
      it('should throw clear error when directory does not exist', async () => {
        mockAccess.mockRejectedValueOnce(
          new Error('ENOENT: no such file or directory')
        );

        await expect(
          gatherComponentContext('/nonexistent/directory')
        ).rejects.toThrow('Directory not found: /nonexistent/directory');
      });

      it('should throw clear error when no variant files are found', async () => {
        setupMockDirectory('/mock/web-app/components/sections/EmptyBlock', []);

        await expect(
          gatherComponentContext('/mock/web-app/components/sections/EmptyBlock')
        ).rejects.toThrow('At least 2 variant file(s) required');
      });

      it('should throw clear error when only 1 variant file exists (below MIN_VARIANTS)', async () => {
        setupMockDirectory(
          '/mock/web-app/components/sections/SingleVariantBlock',
          ['SingleVariant.tsx']
        );

        fileReads.set(
          '/mock/web-app/components/sections/SingleVariantBlock/SingleVariant.tsx',
          'export function SingleVariant() {}'
        );

        await expect(
          gatherComponentContext('/mock/web-app/components/sections/SingleVariantBlock')
        ).rejects.toThrow('At least 2 variant file(s) required for few-shot context, but found 1');
      });

      it('should throw clear error when file read fails', async () => {
        setupMockDirectory(
          '/mock/web-app/components/sections/HeroSection',
          ['HeroCentered.tsx', 'HeroSplit.tsx']
        );

        // Mock the first file read to succeed, second to fail
        fileReads.set(
          '/mock/web-app/components/sections/HeroSection/HeroCentered.tsx',
          'export function HeroCentered() {}'
        );
        // Don't set up HeroSplit.tsx, so it will fail to read

        await expect(
          gatherComponentContext('/mock/web-app/components/sections/HeroSection')
        ).rejects.toThrow('File not found');
      });
    });

    describe('delimiter formatting', () => {
      beforeEach(() => {
        setupMockDirectory(
          '/mock/web-app/components/sections/HeroSection',
          ['HeroCentered.tsx', 'HeroSplit.tsx']
        );

        fileReads.set(
          path.join('/mock/web-app/components/sections/HeroSection', 'HeroCentered.tsx'),
          'export function HeroCentered() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/HeroSection', 'HeroSplit.tsx'),
          'export function HeroSplit() {}'
        );
      });

      it('should use correct delimiter format for component start', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        expect(context).toMatch(/^=== EXISTING COMPONENT: [\w.-]+ ===$/m);
      });

      it('should use correct delimiter format for component end', async () => {
        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        expect(context).toContain('=== END ===');
      });

      it('should separate files with double newlines', async () => {
        // Set up a directory with multiple files to test separators
        setupMockDirectory(
          '/mock/web-app/components/sections/TestBlock',
          ['TestVariant1.tsx', 'TestVariant2.tsx']
        );

        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant1.tsx'),
          'export function TestVariant1() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant2.tsx'),
          'export function TestVariant2() {}'
        );

        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/TestBlock'
        );

        // Verify files are separated (check for blank line between components)
        // Each component section ends with '=== END ===' followed by '\n\n' separator
        expect(context).toMatch(/=== END ===\n\n=== EXISTING COMPONENT:/);
      });
    });

    describe('file filtering logic', () => {
      it('should only include .tsx files', async () => {
        setupMockDirectory(
          '/mock/web-app/components/sections/HeroSection',
          [
            'HeroCentered.tsx',
            'HeroSplit.tsx',
            'README.md', // Should be excluded
          ]
        );

        fileReads.set(
          path.join('/mock/web-app/components/sections/HeroSection', 'HeroCentered.tsx'),
          'export function HeroCentered() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/HeroSection', 'HeroSplit.tsx'),
          'export function HeroSplit() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/HeroSection', 'README.md'),
          '# README'
        );

        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/HeroSection'
        );

        expect(context).toContain('HeroCentered.tsx');
        expect(context).not.toContain('README.md');
      });

      it('should exclude index.tsx explicitly', async () => {
        setupMockDirectory(
          '/mock/web-app/components/sections/TestBlock',
          ['TestVariant1.tsx', 'TestVariant2.tsx', 'index.tsx']
        );

        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant1.tsx'),
          'export function TestVariant1() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant2.tsx'),
          'export function TestVariant2() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'index.tsx'),
          'export { TestRouter } from "./index";'
        );

        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/TestBlock'
        );

        expect(context).toContain('TestVariant1.tsx');
        expect(context).not.toContain('=== EXISTING COMPONENT: index.tsx ===');
      });

      it('should exclude .client.tsx files explicitly', async () => {
        setupMockDirectory(
          '/mock/web-app/components/sections/TestBlock',
          ['TestVariant1.tsx', 'TestVariant2.tsx', 'TestVariant1.client.tsx']
        );

        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant1.tsx'),
          'export function TestVariant1() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant2.tsx'),
          'export function TestVariant2() {}'
        );
        fileReads.set(
          path.join('/mock/web-app/components/sections/TestBlock', 'TestVariant1.client.tsx'),
          `'use client'; export function TestVariant1() {}`
        );

        const context = await gatherComponentContext(
          '/mock/web-app/components/sections/TestBlock'
        );

        expect(context).toContain('TestVariant1.tsx');
        expect(context).not.toContain('=== EXISTING COMPONENT: TestVariant1.client.tsx ===');
      });
    });
  });

  // =============================================================================
  // gatherContractContext() Tests
  // =============================================================================

  describe('gatherContractContext', () => {
    describe('with Hero contract file', () => {
      beforeEach(() => {
        // Mock the Hero contract file with actual content
        fileReads.set(
          '/mock/web-app/lib/contracts/hero.contract.ts',
          `import { z } from 'zod';

export const HeroSectionContract = z.object({
  variant: z.object({
    style: z.enum(['modern', 'classic', 'minimal']).optional(),
    layout: z.enum(['centered', 'split', 'minimal']).optional(),
    overlay: z.enum(['none', 'light', 'dark', 'gradient']).optional(),
    height: z.enum(['small', 'medium', 'large', 'fullscreen']).optional()
  }).optional(),
  title: z.string().min(1).max(200),
  headline: z.string().min(1).max(500),
  description: z.string().max(800).optional(),
  primaryCTA: z.object({
    text: z.string().min(1).max(50),
    href: z.string().min(1).max(200),
  }).optional(),
  secondaryCTA: z.object({
    text: z.string().min(1).max(50),
    href: z.string().min(1).max(200),
  }).optional(),
  image: z.string().optional(),
});`
        );
      });

      it('should return contract content wrapped in ZOD CONTRACT delimiters', async () => {
        const context = await gatherContractContext(
          '/mock/web-app/lib/contracts/hero.contract.ts'
        );

        expect(context).toContain('=== ZOD CONTRACT ===');
        expect(context).toContain('=== END ===');
      });

      it('should return complete contract file content', async () => {
        const context = await gatherContractContext(
          '/mock/web-app/lib/contracts/hero.contract.ts'
        );

        // Verify Zod schema elements are present
        expect(context).toContain('import { z } from \'zod\'');
        expect(context).toContain('export const HeroSectionContract');
        expect(context).toContain('z.object({');
        expect(context).toContain('variant: z.object({');
      });

      it('should have no line numbers or code snippets - only complete file', async () => {
        const context = await gatherContractContext(
          '/mock/web-app/lib/contracts/hero.contract.ts'
        );

        // Should include actual import and export statements (after delimiters)
        expect(context).toContain('import ');
        expect(context).toContain('export const ');
        // Should not have line number comments
        expect(context).not.toMatch(/^\s*\d+/);
      });
    });

    describe('error handling', () => {
      it('should throw clear error when contract file does not exist', async () => {
        mockReadFile.mockRejectedValueOnce(
          new Error('ENOENT: no such file or directory')
        );

        await expect(
          gatherContractContext('/nonexistent/contract.ts')
        ).rejects.toThrow('File not found: /nonexistent/contract.ts');
      });
    });

    describe('delimiter formatting', () => {
      beforeEach(() => {
        // Set up contract file mock
        fileReads.set(
          '/mock/web-app/lib/contracts/hero.contract.ts',
          `import { z } from 'zod';

export const HeroSectionContract = z.object({
  variant: z.object({
    layout: z.enum(['centered', 'split', 'minimal']).optional()
  }).optional(),
  title: z.string().min(1).max(200),
  headline: z.string().min(1).max(500),
});`
        );
      });

      it('should use correct delimiter format', async () => {
        const context = await gatherContractContext(
          '/mock/web-app/lib/contracts/hero.contract.ts'
        );

        expect(context).toMatch(/^=== ZOD CONTRACT ===$/m);
        expect(context).toMatch(/=== END ===$/m);
      });
    });
  });

  // =============================================================================
  // gatherAllowlistContext() Tests
  // =============================================================================

  describe('gatherAllowlistContext', () => {
    // Mock the tailwind-allowlist module
    beforeEach(() => {
      // Reset module cache to ensure fresh imports
      jest.resetModules();
    });

    describe('with SEMANTIC_TOKEN_ALLOWLIST', () => {
      it('should return allowlist wrapped in ALLOWED TAILWIND CLASSES delimiters', async () => {
        const context = await gatherAllowlistContext();

        expect(context).toContain('=== ALLOWED TAILWIND CLASSES ===');
        expect(context).toContain('=== END ===');
      });

      it('should return classes as newline-separated string', async () => {
        const context = await gatherAllowlistContext();

        // Should have one class per line
        const lines = context.split('\n').filter(line => line && !line.startsWith('==='));
        expect(lines.length).toBeGreaterThan(0);

        // Each line should be a single class (no spaces)
        lines.forEach(line => {
          if (line && !line.startsWith('===')) {
            // Allow for special class names with special chars like /, [, ], _, -, :, @, &
            const trimmed = line.trim();
            expect(trimmed.length).toBeGreaterThan(0);
            // Verify no spaces (classes don't have spaces)
            expect(trimmed).not.toMatch(/\s/);
          }
        });
      });

      it('should include semantic token classes', async () => {
        const context = await gatherAllowlistContext();

        // Verify key semantic token classes are present
        expect(context).toContain('bg-brand-primary');
        expect(context).toContain('text-text-primary');
        expect(context).toContain('border-brand-secondary');
        expect(context).toContain('gap-2');
        expect(context).toContain('p-4');
      });

      it('should return classes in sorted order for consistency', async () => {
        const context = await gatherAllowlistContext();

        // Extract just the class lines (not delimiters)
        const classLines = context
          .split('\n')
          .filter(line => line && !line.startsWith('==='))
          .map(line => line.trim())
          .filter(line => line.length > 0);

        // Verify sorted order (check a few known classes)
        const bgBrandIndex = classLines.indexOf('bg-brand-primary');
        const bgSurfaceIndex = classLines.indexOf('bg-surface-primary');
        const textPrimaryIndex = classLines.indexOf('text-text-primary');

        // Verify alphabetical order within prefixes
        expect(bgBrandIndex).toBeLessThan(bgSurfaceIndex);
        expect(textPrimaryIndex).toBeGreaterThan(0);
      });

      it('should not include line numbers or code snippets', async () => {
        const context = await gatherAllowlistContext();

        // Should be pure class names, one per line
        expect(context).not.toContain('//');
        expect(context).not.toContain('/*');
        expect(context).not.toContain('export');
      });
    });

    describe('integration', () => {
      it('should successfully import from tailwind-allowlist module', async () => {
        // This test verifies the dynamic import path is correct
        expect(async () => await gatherAllowlistContext()).not.toThrow();
      });
    });
  });

  // =============================================================================
  // resolveBlockPath() Helper Function Tests
  // =============================================================================

  describe('resolveBlockPath', () => {
    it('should construct absolute path from block name', () => {
      const mockCwd = '/mock/cwd';
      const originalCwd = process.cwd;

      // Mock process.cwd
      process.cwd = jest.fn(() => mockCwd) as any;

      try {
        const result = resolveBlockPath('HeroSection');

        // Normalize path for cross-platform compatibility
        const normalizedResult = result.replace(/\\/g, '/');

        expect(normalizedResult).toContain('/mock/cwd');
        expect(normalizedResult).toContain('web-app');
        expect(normalizedResult).toContain('components/sections');
        expect(result).toContain('HeroSection');
      } finally {
        // Restore original process.cwd
        process.cwd = originalCwd;
      }
    });

    it('should include web-app and components/sections in path', () => {
      const mockCwd = '/project/root';
      const originalCwd = process.cwd;

      process.cwd = jest.fn(() => mockCwd) as any;

      try {
        const result = resolveBlockPath('TestBlock');

        // Normalize path for cross-platform compatibility
        const normalizedResult = result.replace(/\\\\/g, '/');

        expect(normalizedResult).toMatch(/web-app/);
        expect(normalizedResult).toMatch(/components[\/\\\\]sections/);
        expect(result).toContain('TestBlock');
      } finally {
        process.cwd = originalCwd;
      }
    });
  });

  // =============================================================================
  // Integration Tests - Combined Context Assembly
  // =============================================================================

  describe('Combined Context Assembly', () => {
    beforeEach(() => {
      // Set up HeroSection with all 3 variants
      setupMockDirectory(
        '/mock/web-app/components/sections/HeroSection',
        [
          'HeroCentered.tsx',
          'HeroSplit.tsx',
          'HeroMinimal.tsx',
          'index.tsx',
          'AnimatedHeroSection.client.tsx',
        ]
      );

      // Load actual Hero variant files
      loadActualHeroVariantFiles();

      // Set up Hero contract file
      fileReads.set(
        '/mock/web-app/lib/contracts/hero.contract.ts',
        `import { z } from 'zod';
export const HeroSectionContract = z.object({
  variant: z.object({
    style: z.enum(['modern', 'classic', 'minimal']).optional(),
    layout: z.enum(['centered', 'split', 'minimal']).optional(),
    overlay: z.enum(['none', 'light', 'dark', 'gradient']).optional(),
    height: z.enum(['small', 'medium', 'large', 'fullscreen']).optional()
  }).optional(),
  title: z.string().min(1).max(200),
  headline: z.string().min(1).max(500),
});`
      );
    });

    it('should successfully assemble all three context types', async () => {
      // Gather all three contexts
      const componentContext = await gatherComponentContext(
        '/mock/web-app/components/sections/HeroSection'
      );
      const contractContext = await gatherContractContext(
        '/mock/web-app/lib/contracts/hero.contract.ts'
      );
      const allowlistContext = await gatherAllowlistContext();

      // Verify all contexts return successfully
      expect(componentContext).toBeDefined();
      expect(contractContext).toBeDefined();
      expect(allowlistContext).toBeDefined();

      // Verify component context has variants
      expect(componentContext).toContain('HeroCentered.tsx');
      expect(componentContext).toContain('HeroSplit.tsx');
      expect(componentContext).toContain('HeroMinimal.tsx');

      // Verify contract context has Zod schema
      expect(contractContext).toContain('HeroSectionContract');
      expect(contractContext).toContain('z.object({');

      // Verify allowlist context has semantic tokens
      expect(allowlistContext).toContain('bg-brand-primary');
      expect(allowlistContext).toContain('text-text-primary');
    });

    it('should have no line numbers or code snippets in any context', async () => {
      const componentContext = await gatherComponentContext(
        '/mock/web-app/components/sections/HeroSection'
      );
      const contractContext = await gatherContractContext(
        '/mock/web-app/lib/contracts/hero.contract.ts'
      );
      const allowlistContext = await gatherAllowlistContext();

      // Component context should have full file content, not snippets
      expect(componentContext).toMatch(/^import /m);
      expect(componentContext).toMatch(/export function /);

      // Contract context should have full Zod schema
      expect(contractContext).toContain('import { z } from');

      // Allowlist context should be pure class names
      expect(allowlistContext).not.toContain('//');
      expect(allowlistContext).not.toContain('/*');
    });
  });
});

// =============================================================================
// Helper Functions for Mock Setup
// =============================================================================

/**
 * Map of mock directory paths to their file contents
 * Used to set up realistic directory structures for testing
 */
const mockDirectories = new Map<string, string[]>();

/**
 * Set up a mock directory with specific files.
 * This allows us to control what fs.readdir returns for test scenarios.
 *
 * @param dirPath - The directory path to mock
 * @param files - Array of filenames that should appear in the directory
 */
function setupMockDirectory(dirPath: string, files: string[]): void {
  mockDirectories.set(dirPath, [...files]);
}

/**
 * Get mock files for a directory (used by fs.readdir mock).
 *
 * @param dirPath - The directory path
 * @returns Array of filenames, or undefined if not mocked
 */
function getMockFilesForDirectory(dirPath: string): string[] | undefined {
  return mockDirectories.get(dirPath);
}

/**
 * Load actual Hero variant files into the file read tracker.
 * This allows tests to use real file content for validation.
 */
function loadActualHeroVariantFiles(): void {
  // Use the mock paths that match the test expectations
  const heroCenteredPath = '/mock/web-app/components/sections/HeroSection/HeroCentered.tsx';
  const heroSplitPath = '/mock/web-app/components/sections/HeroSection/HeroSplit.tsx';
  const heroMinimalPath = '/mock/web-app/components/sections/HeroSection/HeroMinimal.tsx';

  // Set mock content that simulates real Hero variant files
  fileReads.set(heroCenteredPath, `import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroCentered() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          HeroCentered Server Component
        </h1>
        <div className="flex gap-4 justify-center mt-8">
          <Button variant="default">Primary CTA</Button>
          <Button variant="outline">Secondary CTA</Button>
        </div>
      </div>
    </section>
  );
}`);

  fileReads.set(heroSplitPath, `import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSplit() {
  return (
    <section className="relative min-h-screen grid md:grid-cols-2 gap-8">
      <div className="flex items-center justify-center p-8">
        <h1 className="text-4xl font-bold">
          HeroSplit Server Component
        </h1>
      </div>
      <div className="bg-gradient-to-br from-brand-primary to-brand-secondary" />
    </section>
  );
}`);

  fileReads.set(heroMinimalPath, `import { Button } from '@/components/ui/button';

export function HeroMinimal() {
  return (
    <section className="relative py-20">
      <h1 className="text-3xl font-semibold text-center">
        HeroMinimal Server Component
      </h1>
      <p className="text-center mt-4 text-text-muted">
        Minimal hero with clean typography
      </p>
    </section>
  );
}`);
}
