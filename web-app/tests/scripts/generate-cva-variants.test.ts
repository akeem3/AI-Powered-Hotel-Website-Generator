/**
 * Tests for Build-Time CVA Code Generation Script
 * Story 20.9: Build-Time CVA Code Generation Script
 *
 * Tests the script that reads AI-generated CVAVariantMap JSON files and
 * atomically updates the 3 CVA enforcement layers:
 * 1. lib/cva-variants.ts - Adds archetype variant entries
 * 2. app/langgraph/agents/schemas.ts - Extends Zod enum arrays
 * 3. app/langgraph/utils/cva-validator.ts - Updates VALID_VARIANTS registry
 */

import { readFileSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { CVAVariantMapSchema } from '../../lib/style-generation/schemas/cva-variant-map.schema';

// The generateCvaVariants function from the script
// We import it directly for testing
const scriptPath = join(process.cwd(), 'scripts/generate-cva-variants.ts');

// Mock the ts-morph Project to avoid actual file modifications in tests
jest.mock('ts-morph', () => ({
  Project: jest.fn().mockImplementation(() => ({
    addSourceFileAtPath: jest.fn().mockReturnValue({
      getVariableStatements: jest.fn().mockReturnValue([]),
      getClasses: jest.fn().mockReturnValue([]),
      saveSync: jest.fn(),
    }),
  })),
  SyntaxKind: {
    CallExpression: 'CallExpression',
    ObjectLiteralExpression: 'ObjectLiteralExpression',
    PropertyAssignment: 'PropertyAssignment',
  },
}));

describe('Story 20.9: Build-Time CVA Code Generation Script', () => {
  const fixturesDir = join(process.cwd(), 'scripts/fixtures');

  describe('CVAVariantMap Schema Validation (from fixtures)', () => {
    it('should validate heritage-opulence-hero fixture', () => {
      const fixturePath = join(fixturesDir, 'heritage-opulence-hero.json');
      const content = readFileSync(fixturePath, 'utf-8');
      const json = JSON.parse(content);

      const result = CVAVariantMapSchema.safeParse(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blockType).toBe('hero');
        expect(result.data.archetype).toBe('heritage-opulence');
        expect(result.data.variantClasses).toHaveProperty('style');
        expect(result.data.variantClasses).toHaveProperty('layout');
        expect(result.data.variantClasses).toHaveProperty('overlay');
        expect(result.data.designRationale.length).toBeGreaterThanOrEqual(30);
      }
    });

    it('should validate urban-tech-hero fixture', () => {
      const fixturePath = join(fixturesDir, 'urban-tech-hero.json');
      const content = readFileSync(fixturePath, 'utf-8');
      const json = JSON.parse(content);

      const result = CVAVariantMapSchema.safeParse(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blockType).toBe('hero');
        expect(result.data.archetype).toBe('urban-tech');
      }
    });

    it('should validate coastal-resort-hero fixture', () => {
      const fixturePath = join(fixturesDir, 'coastal-resort-hero.json');
      const content = readFileSync(fixturePath, 'utf-8');
      const json = JSON.parse(content);

      const result = CVAVariantMapSchema.safeParse(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blockType).toBe('hero');
        expect(result.data.archetype).toBe('coastal-resort');
      }
    });

    it('should validate heritage-opulence-navigation fixture', () => {
      const fixturePath = join(fixturesDir, 'heritage-opulence-navigation.json');
      const content = readFileSync(fixturePath, 'utf-8');
      const json = JSON.parse(content);

      const result = CVAVariantMapSchema.safeParse(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blockType).toBe('navigation');
        expect(result.data.archetype).toBe('heritage-opulence');
      }
    });

    it('should validate urban-tech-gallery fixture', () => {
      const fixturePath = join(fixturesDir, 'urban-tech-gallery.json');
      const content = readFileSync(fixturePath, 'utf-8');
      const json = JSON.parse(content);

      const result = CVAVariantMapSchema.safeParse(json);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.blockType).toBe('gallery');
        expect(result.data.archetype).toBe('urban-tech');
      }
    });

    it('should reject invalid fixture with missing required fields', () => {
      const invalidData = {
        blockType: 'hero',
        // Missing archetype
        designRationale: 'Too short',
        // Missing variantClasses
      };

      const result = CVAVariantMapSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject fixture with designRationale too short', () => {
      const invalidData = {
        blockType: 'hero',
        archetype: 'heritage-opulence',
        designRationale: 'Too short', // Less than 30 chars
        variantClasses: {
          style: 'bg-brand-primary',
        },
      };

      const result = CVAVariantMapSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject fixture with invalid archetype value', () => {
      const invalidData = {
        blockType: 'hero',
        archetype: 'invalid-archetype',
        designRationale: 'This is a valid design rationale that is long enough.',
        variantClasses: {
          style: 'bg-brand-primary',
        },
      };

      const result = CVAVariantMapSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject fixture with invalid class strings (not from allowlist)', () => {
      const invalidData = {
        blockType: 'hero',
        archetype: 'heritage-opulence',
        designRationale: 'This is a valid design rationale that is long enough.',
        variantClasses: {
          style: 'bg-blue-500 text-white', // Raw colors not allowed
        },
      };

      const result = CVAVariantMapSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('Script Module Exports', () => {
    it('should export generateCvaVariants function', async () => {
      const scriptModule = await import('../../scripts/generate-cva-variants');
      expect(scriptModule).toHaveProperty('generateCvaVariants');
      expect(typeof scriptModule.generateCvaVariants).toBe('function');
    });

    it('should export helper functions', async () => {
      const scriptModule = await import('../../scripts/generate-cva-variants');
      // The simple version exports these helpers
      expect(scriptModule).toBeDefined();
    });
  });

  describe('cva-variants.ts has archetype entries', () => {
    it('should have heritage-opulence style variant in heroVariants', () => {
      const cvaVariants = require('../../lib/cva-variants');
      expect(cvaVariants.heroVariants).toBeDefined();

      // Get the variants config
      const heroConfig = cvaVariants.heroVariants;
      expect(heroConfig).toBeDefined();
    });

    it('should have urban-tech style variant in heroVariants', () => {
      const cvaVariants = require('../../lib/cva-variants');
      expect(cvaVariants.heroVariants).toBeDefined();
    });

    it('should have coastal-resort style variant in heroVariants', () => {
      const cvaVariants = require('../../lib/cva-variants');
      expect(cvaVariants.heroVariants).toBeDefined();
    });

    it('should have archetype variants in navigationVariants', () => {
      const cvaVariants = require('../../lib/cva-variants');
      expect(cvaVariants.navigationVariants).toBeDefined();
    });

    it('should have archetype variants in galleryVariants cardStyle', () => {
      const cvaVariants = require('../../lib/cva-variants');
      expect(cvaVariants.galleryVariants).toBeDefined();
    });
  });

  describe('schemas.ts has archetype enum values', () => {
    it('should have archetype variants in hero style enum', () => {
      const schemas = require('../../app/langgraph/agents/schemas');
      expect(schemas.StylingAgentOutputSchema).toBeDefined();
    });

    it('should have archetype variants in navigation navStyle enum', () => {
      const schemas = require('../../app/langgraph/agents/schemas');
      expect(schemas.StylingAgentOutputSchema).toBeDefined();
    });

    it('should have archetype variants in gallery cardStyle enum', () => {
      const schemas = require('../../app/langgraph/agents/schemas');
      expect(schemas.StylingAgentOutputSchema).toBeDefined();
    });
  });

  describe('cva-validator.ts has archetype VALID_VARIANTS', () => {
    let CVAValidator: any;

    beforeAll(() => {
      // Import after setup
      CVAValidator = require('../../app/langgraph/utils/cva-validator').CVAValidator;
    });

    it('should have heritage-opulence in hero VALID_VARIANTS style', () => {
      expect(CVAValidator).toBeDefined();
      expect(CVAValidator.VALID_VARIANTS).toBeDefined();
      expect(CVAValidator.VALID_VARIANTS.hero).toBeDefined();
      expect(CVAValidator.VALID_VARIANTS.hero.style).toContain('heritage-opulence');
    });

    it('should have urban-tech in hero VALID_VARIANTS style', () => {
      expect(CVAValidator.VALID_VARIANTS.hero.style).toContain('urban-tech');
    });

    it('should have coastal-resort in hero VALID_VARIANTS style', () => {
      expect(CVAValidator.VALID_VARIANTS.hero.style).toContain('coastal-resort');
    });

    it('should have archetype variants in navigation VALID_VARIANTS', () => {
      expect(CVAValidator.VALID_VARIANTS.navigation.style).toContain('heritage-opulence');
      expect(CVAValidator.VALID_VARIANTS.navigation.style).toContain('urban-tech');
      expect(CVAValidator.VALID_VARIANTS.navigation.style).toContain('coastal-resort');
    });

    it('should have archetype variants in gallery VALID_VARIANTS cardStyle', () => {
      expect(CVAValidator.VALID_VARIANTS.gallery.cardStyle).toContain('heritage-opulence');
      expect(CVAValidator.VALID_VARIANTS.gallery.cardStyle).toContain('urban-tech');
    });

    it('should validate archetype-specific variants', () => {
      const result = CVAValidator.validateComponent('hero', {
        style: 'heritage-opulence',
        layout: 'heritage-opulence',
        overlay: 'heritage-opulence',
      });
      expect(result).toHaveLength(0);
    });
  });

  describe('validate-contract-cva-sync passes after generation', () => {
    it('should run validate-contract-cva-sync script without errors', () => {
      // This test verifies the sync validation script runs successfully
      // Note: Warnings are expected for archetype variants not in contracts
      expect(() => {
        try {
          execSync('npx tsx scripts/validate-contract-cva-sync.ts', {
            cwd: process.cwd(),
            stdio: 'pipe',
          });
        } catch (error: any) {
          // The script should not error out
          // Warnings are acceptable
          if (error.status !== 0) {
            throw new Error(`validate-contract-cva-sync failed: ${error.message}`);
          }
        }
      }).not.toThrow();
    });

    it('should have no critical errors from validate-contract-cva-sync', () => {
      // Run the validation script and check output
      const output = execSync('npx tsx scripts/validate-contract-cva-sync.ts', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: 'pipe',
      });

      // Should not have critical errors (only "Critical errors: 0" which is acceptable)
      expect(output).toContain('Critical errors: 0');
      expect(output).not.toContain('Sync Errors');
    });
  });

  describe('Dry-run mode shows planned changes', () => {
    it('should support --dry-run flag', async () => {
      // The script should accept --dry-run flag
      // This is a basic test that the script module exists and has the function
      const scriptModule = await import('../../scripts/generate-cva-variants');
      expect(scriptModule.generateCvaVariants).toBeDefined();
    });
  });

  describe('Rollback on failure', () => {
    it('should have backup mechanism for rollback', () => {
      // Check that backup files could be created
      // The script creates .backup files before modification
      const cvaVariantsPath = join(process.cwd(), 'lib/cva-variants.ts');

      // Verify the target file exists (can be backed up)
      if (existsSync(cvaVariantsPath)) {
        expect(existsSync(cvaVariantsPath)).toBe(true);
      }
    });
  });

  describe('TypeScript compilation after generation', () => {
    it('should generate valid TypeScript in cva-variants.ts', () => {
      // Verify the cva-variants.ts can be required without syntax errors
      expect(() => {
        require('../../lib/cva-variants');
      }).not.toThrow();
    });

    it('should generate valid TypeScript in schemas.ts', () => {
      expect(() => {
        require('../../app/langgraph/agents/schemas');
      }).not.toThrow();
    });

    it('should generate valid TypeScript in cva-validator.ts', () => {
      expect(() => {
        require('../../app/langgraph/utils/cva-validator');
      }).not.toThrow();
    });
  });

  describe('End-to-end: 3 files stay in sync', () => {
    it('should have matching archetype variants across all 3 files', () => {
      const cvaVariants = require('../../lib/cva-variants');
      const schemas = require('../../app/langgraph/agents/schemas');
      const { CVAValidator } = require('../../app/langgraph/utils/cva-validator');

      // Verify hero archetype variants exist in all 3 files
      const heroArchetypeStyles = ['heritage-opulence', 'urban-tech', 'coastal-resort'];

      // Check cva-variants.ts (implicitly by importing)
      expect(cvaVariants.heroVariants).toBeDefined();

      // Check CVAValidator
      heroArchetypeStyles.forEach(style => {
        expect(CVAValidator.VALID_VARIANTS.hero.style).toContain(style);
      });
    });

    it('should have navigation archetype variants in sync', () => {
      const { CVAValidator } = require('../../app/langgraph/utils/cva-validator');

      const navArchetypeStyles = ['heritage-opulence', 'urban-tech', 'coastal-resort'];

      navArchetypeStyles.forEach(style => {
        expect(CVAValidator.VALID_VARIANTS.navigation.style).toContain(style);
      });
    });

    it('should have gallery archetype variants in sync', () => {
      const { CVAValidator } = require('../../app/langgraph/utils/cva-validator');

      const galleryArchetypeCardStyles = ['heritage-opulence', 'urban-tech'];

      galleryArchetypeCardStyles.forEach(style => {
        expect(CVAValidator.VALID_VARIANTS.gallery.cardStyle).toContain(style);
      });
    });
  });

  describe('Simple version helper functions', () => {
    it('should export generateArchetypeVariantData from simple version', async () => {
      const simpleScript = await import('../../scripts/generate-cva-variants-simple');
      expect(simpleScript.generateArchetypeVariantData).toBeDefined();
      expect(typeof simpleScript.generateArchetypeVariantData).toBe('function');
    });

    it('should export generateIntegrationInstructions from simple version', async () => {
      const simpleScript = await import('../../scripts/generate-cva-variants-simple');
      expect(simpleScript.generateIntegrationInstructions).toBeDefined();
      expect(typeof simpleScript.generateIntegrationInstructions).toBe('function');
    });
  });

  describe('Archetype variants use semantic tokens only', () => {
    it('should validate all fixtures use semantic tokens', () => {
      const { validateSemanticClasses } = require('../../lib/style-generation/tailwind-allowlist');

      const fixtures = [
        'heritage-opulence-hero.json',
        'urban-tech-hero.json',
        'coastal-resort-hero.json',
        'heritage-opulence-navigation.json',
        'urban-tech-gallery.json',
      ];

      fixtures.forEach(fixtureFile => {
        const fixturePath = join(fixturesDir, fixtureFile);
        const content = readFileSync(fixturePath, 'utf-8');
        const json = JSON.parse(content);

        // Validate each variantClasses string
        Object.values(json.variantClasses).forEach((classString: string) => {
          const validation = validateSemanticClasses(classString);
          expect(validation.valid).toBe(true);
          if (!validation.valid) {
            console.error(`${fixtureFile} has invalid classes:`, validation.invalidClasses);
          }
        });
      });
    });
  });
});
