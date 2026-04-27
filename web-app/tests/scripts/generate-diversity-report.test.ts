/**
 * Generate Diversity Report Tests
 *
 * Story 22.3: Visual Comparison Matrix + Diversity Report
 *
 * Tests for the diversity report generation script including:
 * - CLI argument parsing
 * - Hotel to archetype mapping
 * - Config loading and enrichment
 * - Enhanced diversity report generation
 * - Markdown report generation
 * - Recommendations engine
 * - Integration tests for full workflow
 *
 * @module __tests__/scripts/generate-diversity-report.test
 */

import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// Test helpers
const PROJECT_ROOT = join(__dirname, '..', '..', '..');
const TEST_DIR = join(PROJECT_ROOT, 'output', 'test-diversity-report');
const FIXTURES_DIR = join(__dirname, '..', 'fixtures', 'diversity');

/**
 * Create a mock homepage config for testing
 */
function createMockHomepageConfig(
  generationId: string,
  hotelName: string,
  components: Array<{ type: string; variant?: Record<string, any> }>,
  designTokens?: any
): string {
  const config = {
    generationId,
    timestamp: '2024-01-01T00:00:00Z',
    hotelParameters: {
      hotelName,
      hotelType: 'luxury',
      targetAudience: 'couples',
      brandPersonality: 'elegant',
      location: 'Paris, France',
    },
    components: components.map((c, i) => ({
      type: c.type,
      variant: c.variant || {},
      props: {},
      order: i,
    })),
    layoutStructure: 'single-column',
    emphasisComponents: [],
    validationStatus: 'PASS',
    ...(designTokens && { designTokens }),
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Create a mock generation summary for testing
 */
function createMockGenerationSummary(): string {
  const summary = {
    timestamp: '2024-01-01T00:00:00Z',
    outputDirectory: 'test-output',
    totalProfiles: 3,
    successCount: 3,
    failCount: 0,
    totalCost: 0.03,
    averageCost: 0.01,
    results: [
      {
        archetype: 'Eco Lodge',
        hotelName: '1 Hotel South Beach',
        success: true,
        generationId: 'test-hotel-1',
        cost: 0.01,
        componentCount: 8,
      },
      {
        archetype: 'Business Hotel',
        hotelName: 'Marriott Marquis San Diego',
        success: true,
        generationId: 'test-hotel-2',
        cost: 0.01,
        componentCount: 9,
      },
      {
        archetype: 'Design/Art Hotel',
        hotelName: '21c Museum Hotel Nashville',
        success: true,
        generationId: 'test-hotel-3',
        cost: 0.01,
        componentCount: 7,
      },
    ],
  };

  return JSON.stringify(summary, null, 2);
}

/**
 * Setup test environment
 */
function setupTestEnvironment(): void {
  // Clean up any existing test directory
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }

  // Create test directory structure
  mkdirSync(TEST_DIR, { recursive: true });

  // Write test configs
  writeFileSync(
    join(TEST_DIR, 'homepage-config-test-hotel-1.json'),
    createMockHomepageConfig('test-hotel-1', '1 Hotel South Beach', [
      { type: 'navigation', variant: { navStyle: 'transparent' } },
      { type: 'hero', variant: { style: 'modern', layout: 'split' } },
      { type: 'booking', variant: { bookingStyle: 'desktop' } },
    ])
  );

  writeFileSync(
    join(TEST_DIR, 'homepage-config-test-hotel-2.json'),
    createMockHomepageConfig('test-hotel-2', 'Marriott Marquis San Diego', [
      { type: 'navigation', variant: { navStyle: 'solid' } },
      { type: 'hero', variant: { style: 'classic', layout: 'full' } },
      { type: 'rooms', variant: { roomCardStyle: 'detailed' } },
      { type: 'booking', variant: { bookingStyle: 'desktop' } },
    ])
  );

  writeFileSync(
    join(TEST_DIR, 'homepage-config-test-hotel-3.json'),
    createMockHomepageConfig('test-hotel-3', '21c Museum Hotel Nashville', [
      { type: 'navigation', variant: { navStyle: 'minimal' } },
      { type: 'hero', variant: { style: 'artistic', layout: 'offset' } },
      { type: 'gallery', variant: { layout: 'masonry' } },
      { type: 'booking', variant: { bookingStyle: 'desktop' } },
    ])
  );

  // Write generation summary
  writeFileSync(
    join(TEST_DIR, 'generation-summary.json'),
    createMockGenerationSummary()
  );
}

/**
 * Cleanup test environment
 */
function cleanupTestEnvironment(): void {
  if (existsSync(TEST_DIR)) {
    rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

describe('Story 22.3: Generate Diversity Report', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });

  afterAll(() => {
    cleanupTestEnvironment();
  });

  describe('Script Execution', () => {
    it('should execute the script successfully', () => {
      expect(() => {
        execSync(
          `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
          { cwd: PROJECT_ROOT, stdio: 'pipe' }
        );
      }).not.toThrow();
    });

    it('should generate both JSON and markdown reports', () => {
      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      expect(existsSync(join(TEST_DIR, 'diversity-report.json'))).toBe(true);
      expect(existsSync(join(TEST_DIR, 'DIVERSITY-REPORT.md'))).toBe(true);
    });

    it('should show help message with --help flag', () => {
      const output = execSync(
        `npx tsx scripts/generate-diversity-report.ts --help`,
        { cwd: PROJECT_ROOT, stdio: 'pipe', encoding: 'utf-8' }
      );

      expect(output).toContain('Generate Diversity Report');
      expect(output).toContain('--input-dir');
      expect(output).toContain('--output-dir');
      expect(output).toContain('--help');
    });
  });

  describe('JSON Report Output', () => {
    let jsonReport: any;

    beforeAll(() => {
      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      const reportPath = join(TEST_DIR, 'diversity-report.json');
      const reportContent = readFileSync(reportPath, 'utf-8');
      jsonReport = JSON.parse(reportContent);
    });

    it('should include report metadata', () => {
      expect(jsonReport).toHaveProperty('reportId');
      expect(jsonReport).toHaveProperty('timestamp');
      expect(jsonReport).toHaveProperty('configsAnalyzed');
      expect(jsonReport.configsAnalyzed).toEqual(['test-hotel-1', 'test-hotel-2', 'test-hotel-3']);
    });

    it('should include aggregate scores', () => {
      expect(jsonReport).toHaveProperty('aggregateScores');
      expect(jsonReport.aggregateScores).toHaveProperty('averageStructural');
      expect(jsonReport.aggregateScores).toHaveProperty('averageThematic');
      expect(jsonReport.aggregateScores).toHaveProperty('averageVisual');
      expect(jsonReport.aggregateScores).toHaveProperty('overall');

      // Scores should be between 0 and 100
      expect(jsonReport.aggregateScores.overall).toBeGreaterThanOrEqual(0);
      expect(jsonReport.aggregateScores.overall).toBeLessThanOrEqual(100);
    });

    it('should include diversity matrix', () => {
      expect(jsonReport).toHaveProperty('diversityMatrix');
      expect(jsonReport.diversityMatrix).toBeInstanceOf(Object);

      // Check that matrix is NxN where N is number of configs
      const configIds = jsonReport.configsAnalyzed;
      for (const configA of configIds) {
        expect(jsonReport.diversityMatrix[configA]).toBeDefined();
        for (const configB of configIds) {
          expect(jsonReport.diversityMatrix[configA][configB]).toBeDefined();
        }
      }

      // Self-comparisons should be 100
      for (const configId of configIds) {
        expect(jsonReport.diversityMatrix[configId][configId]).toBe(100);
      }
    });

    it('should include all pairwise comparisons', () => {
      expect(jsonReport).toHaveProperty('pairwiseComparisons');
      expect(jsonReport.pairwiseComparisons).toBeInstanceOf(Array);

      // With 3 configs, we should have 3 pairwise comparisons (3 choose 2 = 3)
      expect(jsonReport.pairwiseComparisons.length).toBe(3);

      // Each comparison should have required fields
      for (const comparison of jsonReport.pairwiseComparisons) {
        expect(comparison).toHaveProperty('configA');
        expect(comparison).toHaveProperty('configB');
        expect(comparison).toHaveProperty('overallScore');
        expect(comparison).toHaveProperty('structural');
        expect(comparison).toHaveProperty('thematic');
        expect(comparison).toHaveProperty('visual');
        expect(comparison).toHaveProperty('timestamp');

        // Structural scores
        expect(comparison.structural).toHaveProperty('score');
        expect(comparison.structural).toHaveProperty('componentJaccardDistance');
        expect(comparison.structural).toHaveProperty('uniqueComponentCount');
        expect(comparison.structural).toHaveProperty('orderingDifference');
        expect(comparison.structural).toHaveProperty('layoutVariety');

        // Thematic scores
        expect(comparison.thematic).toHaveProperty('score');
        expect(comparison.thematic).toHaveProperty('variantUniqueness');
        expect(comparison.thematic).toHaveProperty('variantOverlapRatio');
        expect(comparison.thematic).toHaveProperty('uniqueVariantDimensions');
        expect(comparison.thematic).toHaveProperty('uniqueStyleCount');
        expect(comparison.thematic).toHaveProperty('uniqueLayoutCount');
        expect(comparison.thematic).toHaveProperty('uniqueCardStyleCount');

        // Visual scores
        expect(comparison.visual).toHaveProperty('score');
        expect(comparison.visual).toHaveProperty('hueDistance');
        expect(comparison.visual).toHaveProperty('typographyDifference');
        expect(comparison.visual).toHaveProperty('spacingDifference');
        expect(comparison.visual).toHaveProperty('borderRadiusDifference');
      }
    });

    it('should include mode collapse detection', () => {
      expect(jsonReport).toHaveProperty('modeCollapsePairs');
      expect(jsonReport).toHaveProperty('modeCollapseThreshold');
      expect(jsonReport.modeCollapseThreshold).toBe(70);

      // Mode collapse pairs should be an array
      expect(Array.isArray(jsonReport.modeCollapsePairs)).toBe(true);
    });

    it('should include archetype breakdown', () => {
      expect(jsonReport).toHaveProperty('archetypeBreakdown');
      expect(jsonReport.archetypeBreakdown).toBeInstanceOf(Object);

      // Check that we have archetype data
      const archetypes = Object.keys(jsonReport.archetypeBreakdown);
      expect(archetypes.length).toBeGreaterThan(0);

      // Each archetype should have count and hotelNames
      for (const [archetype, data] of Object.entries(jsonReport.archetypeBreakdown)) {
        expect(data).toHaveProperty('count');
        expect(data).toHaveProperty('hotelNames');
        expect(data.hotelNames).toBeInstanceOf(Array);
      }
    });

    it('should include cost data', () => {
      expect(jsonReport).toHaveProperty('costData');
      expect(jsonReport.costData).toHaveProperty('totalCost');
      expect(jsonReport.costData).toHaveProperty('averageCost');
      expect(jsonReport.costData).toHaveProperty('perConfigCost');

      // Cost data should be numeric
      expect(typeof jsonReport.costData.totalCost).toBe('number');
      expect(typeof jsonReport.costData.averageCost).toBe('number');
    });

    it('should include config metadata', () => {
      expect(jsonReport).toHaveProperty('configMetadata');
      expect(jsonReport.configMetadata).toBeInstanceOf(Object);

      // Each config should have metadata
      for (const configId of jsonReport.configsAnalyzed) {
        expect(jsonReport.configMetadata[configId]).toBeDefined();
        expect(jsonReport.configMetadata[configId]).toHaveProperty('archetype');
        expect(jsonReport.configMetadata[configId]).toHaveProperty('hotelName');
      }
    });

    it('should include generation info', () => {
      expect(jsonReport).toHaveProperty('generationInfo');
      expect(jsonReport.generationInfo).toHaveProperty('totalConfigs');
      expect(jsonReport.generationInfo).toHaveProperty('totalArchetypes');
      expect(jsonReport.generationInfo).toHaveProperty('modeCollapsePairsCount');
      expect(jsonReport.generationInfo).toHaveProperty('targetScore');
      expect(jsonReport.generationInfo).toHaveProperty('meetsTarget');

      expect(jsonReport.generationInfo.totalConfigs).toBe(3);
      expect(jsonReport.generationInfo.targetScore).toBe(80);
    });
  });

  describe('Markdown Report Output', () => {
    let markdownReport: string;

    beforeAll(() => {
      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      const reportPath = join(TEST_DIR, 'DIVERSITY-REPORT.md');
      markdownReport = readFileSync(reportPath, 'utf-8');
    });

    it('should include executive summary', () => {
      expect(markdownReport).toContain('# Diversity Validation Report');
      expect(markdownReport).toContain('## Executive Summary');
      expect(markdownReport).toContain('### Overall Diversity Score');
      expect(markdownReport).toContain('### Dimension Breakdown');
      expect(markdownReport).toContain('### Assessment');
    });

    it('should include dimension breakdown table', () => {
      expect(markdownReport).toContain('| Dimension | Score | Weight |');
      expect(markdownReport).toContain('| Structural |');
      expect(markdownReport).toContain('| Thematic |');
      expect(markdownReport).toContain('| Visual |');
      expect(markdownReport).toContain('| **Overall** |');
    });

    it('should include aggregate diversity matrix', () => {
      expect(markdownReport).toContain('## Aggregate Diversity Matrix');
      expect(markdownReport).toContain('| Config A | Config B | Score | Assessment |');
    });

    it('should include per-archetype breakdown', () => {
      expect(markdownReport).toContain('## Per-Archetype Breakdown');
      expect(markdownReport).toContain('| Archetype | Count | Avg Diversity | Hotels |');
    });

    it('should include component selection analysis', () => {
      expect(markdownReport).toContain('## Component Selection Analysis');
      expect(markdownReport).toContain('| Component | Count | % of Configs |');
    });

    it('should include mode collapse detection', () => {
      expect(markdownReport).toContain('## Mode Collapse Detection');
      expect(markdownReport).toContain('**Threshold:** Pairs with diversity score <30% flagged');
      expect(markdownReport).toContain('**Total Mode Collapse Pairs:**');
    });

    it('should include cost data summary', () => {
      expect(markdownReport).toContain('## Generation Cost Summary');
      expect(markdownReport).toContain('**Total Cost:**');
      expect(markdownReport).toContain('**Average Cost per Generation:**');
      expect(markdownReport).toContain('### Cost Per Config');
    });

    it('should include recommendations section', () => {
      expect(markdownReport).toContain('## Recommendations');
      expect(markdownReport).toContain('### Summary');
    });

    it('should include report metadata', () => {
      expect(markdownReport).toContain('## Report Metadata');
      expect(markdownReport).toContain('- **Configs Analyzed:**');
      expect(markdownReport).toContain('- **Archetypes Represented:**');
      expect(markdownReport).toContain('- **Total Pairwise Comparisons:**');
      expect(markdownReport).toContain('- **Mode Collapse Threshold:**');
      expect(markdownReport).toContain('- **Target Score:**');
    });

    it('should have story attribution', () => {
      expect(markdownReport).toContain('Story 22.3: Visual Comparison Matrix + Diversity Report');
    });
  });

  describe('Recommendations Engine', () => {
    let markdownReport: string;

    beforeAll(() => {
      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      const reportPath = join(TEST_DIR, 'DIVERSITY-REPORT.md');
      markdownReport = readFileSync(reportPath, 'utf-8');
    });

    it('should generate recommendations by category', () => {
      // Should have category headers with emojis
      expect(markdownReport).toMatch(/### (🏗️ Structural|🎨 Thematic|🎭 Visual|🏛️ Archetype|📋 General)/);
    });

    it('should include priority badges', () => {
      // Should have priority badges
      expect(markdownReport).toMatch(/#### (🔴 HIGH|🟡 MEDIUM|🟢 LOW):/);
    });

    it('should include action items', () => {
      // Should have action items sections
      expect(markdownReport).toContain('**Action Items:**');
      // Should have bullet points (may have leading whitespace)
      expect(markdownReport).toMatch(/-\s+/);
    });

    it('should include expected impact statements', () => {
      expect(markdownReport).toContain('**Expected Impact:**');
    });

    it('should show affected archetypes when relevant', () => {
      // Check if there are affected archetype mentions (conditional, may not always appear)
      const hasAffectedArchetypes = markdownReport.includes('**Affected Archetypes:**');
      if (hasAffectedArchetypes) {
        expect(markdownReport).toMatch(/\*\*Affected Archetypes:\*\* .+/);
      }
    });

    it('should include summary with recommendation counts', () => {
      expect(markdownReport).toContain('### Summary');
      expect(markdownReport).toMatch(/- \*\*\d+\*\* high-priority/);
      expect(markdownReport).toMatch(/- \*\*\d+\*\* medium-priority/);
      expect(markdownReport).toMatch(/- \*\*\d+\*\* low-priority/);
    });
  });

  describe('Acceptance Criteria Validation', () => {
    let jsonReport: any;
    let markdownReport: string;

    beforeAll(() => {
      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      const jsonPath = join(TEST_DIR, 'diversity-report.json');
      jsonReport = JSON.parse(readFileSync(jsonPath, 'utf-8'));

      const mdPath = join(TEST_DIR, 'DIVERSITY-REPORT.md');
      markdownReport = readFileSync(mdPath, 'utf-8');
    });

    it('AC1: JSON report includes all pairwise scores', () => {
      expect(jsonReport.pairwiseComparisons).toBeDefined();
      expect(jsonReport.pairwiseComparisons.length).toBeGreaterThan(0);
    });

    it('AC2: JSON report includes aggregate diversity matrix', () => {
      expect(jsonReport.diversityMatrix).toBeDefined();
      expect(Object.keys(jsonReport.diversityMatrix).length).toBe(3);
    });

    it('AC3: JSON report includes per-archetype breakdown', () => {
      expect(jsonReport.archetypeBreakdown).toBeDefined();
      expect(Object.keys(jsonReport.archetypeBreakdown).length).toBeGreaterThan(0);
    });

    it('AC4: JSON report includes cost data from generation summary', () => {
      expect(jsonReport.costData).toBeDefined();
      expect(typeof jsonReport.costData.totalCost).toBe('number');
      expect(typeof jsonReport.costData.averageCost).toBe('number');
    });

    it('AC5: JSON report includes mode collapse pairs list', () => {
      expect(jsonReport.modeCollapsePairs).toBeDefined();
      expect(Array.isArray(jsonReport.modeCollapsePairs)).toBe(true);
    });

    it('AC6: Markdown report has executive summary', () => {
      expect(markdownReport).toContain('## Executive Summary');
      expect(markdownReport).toContain('### Overall Diversity Score');
    });

    it('AC7: Markdown report shows score comparison with >80% target', () => {
      expect(markdownReport).toContain('**Target Score:** 80%');
      expect(markdownReport).toMatch(/(MEETS TARGET|BELOW TARGET)/);
    });

    it('AC8: Markdown report has per-archetype breakdown section', () => {
      expect(markdownReport).toContain('## Per-Archetype Breakdown');
      expect(markdownReport).toContain('| Archetype | Count | Avg Diversity | Hotels |');
    });

    it('AC9: Markdown report has mode collapse section', () => {
      expect(markdownReport).toContain('## Mode Collapse Detection');
      expect(markdownReport).toContain('**Total Mode Collapse Pairs:**');
    });

    it('AC10: Markdown report has cost data summary', () => {
      expect(markdownReport).toContain('## Generation Cost Summary');
      expect(markdownReport).toContain('**Total Cost:**');
      expect(markdownReport).toContain('**Average Cost per Generation:**');
    });

    it('AC11: Markdown report has recommendations section', () => {
      expect(markdownReport).toContain('## Recommendations');
      expect(markdownReport).toContain('### Summary');
    });

    it('AC12: Markdown report includes component selection analysis', () => {
      expect(markdownReport).toContain('## Component Selection Analysis');
      expect(markdownReport).toContain('| Component | Count | % of Configs |');
    });

    it('AC13: Mode collapse uses >70% similarity threshold', () => {
      expect(markdownReport).toContain('similarity >70%');
      expect(jsonReport.modeCollapseThreshold).toBe(70);
    });

    it('AC14: Cost per generation shown', () => {
      expect(markdownReport).toContain('### Cost Per Config');
      expect(markdownReport).toMatch(/\$[\d.]+/);
    });

    it('AC15: Generated reports are valid and readable', () => {
      // JSON should parse without errors
      expect(() => JSON.parse(JSON.stringify(jsonReport))).not.toThrow();

      // Markdown should be valid string
      expect(typeof markdownReport).toBe('string');
      expect(markdownReport.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing input directory gracefully', () => {
      const nonExistentDir = join(TEST_DIR, 'does-not-exist');

      expect(() => {
        execSync(
          `npx tsx scripts/generate-diversity-report.ts --input-dir "${nonExistentDir}" --output-dir "${TEST_DIR}"`,
          { cwd: PROJECT_ROOT, stdio: 'pipe' }
        );
      }).toThrow();
    });

    it('should handle empty input directory', () => {
      const emptyDir = join(TEST_DIR, 'empty');
      mkdirSync(emptyDir, { recursive: true });

      expect(() => {
        execSync(
          `npx tsx scripts/generate-diversity-report.ts --input-dir "${emptyDir}" --output-dir "${TEST_DIR}"`,
          { cwd: PROJECT_ROOT, stdio: 'pipe' }
        );
      }).toThrow();

      rmSync(emptyDir, { recursive: true, force: true });
    });
  });

  describe('Hotel to Archetype Mapping', () => {
    it('should map known hotels to correct archetypes', () => {
      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      const jsonPath = join(TEST_DIR, 'diversity-report.json');
      const jsonReport = JSON.parse(readFileSync(jsonPath, 'utf-8'));

      // Check that configs were mapped to archetypes
      const metadata = jsonReport.configMetadata;
      const archetypes = Object.values(metadata).map((m: any) => m.archetype);

      // Should have Eco Lodge, Business Hotel, Design/Art Hotel
      expect(archetypes).toContain('Eco Lodge');
      expect(archetypes).toContain('Business Hotel');
      expect(archetypes).toContain('Design/Art Hotel');
    });
  });

  describe('Integration with Story 22.2 Generation', () => {
    it('should work with actual generation output format', () => {
      // This test verifies the script works with the actual format
      // produced by Story 22.2's generate-diversity-batch.ts

      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      const jsonPath = join(TEST_DIR, 'diversity-report.json');
      const jsonReport = JSON.parse(readFileSync(jsonPath, 'utf-8'));

      // Verify integration points
      expect(jsonReport.costData).toBeDefined();
      expect(jsonReport.archetypeBreakdown).toBeDefined();
      expect(jsonReport.configMetadata).toBeDefined();

      // Verify that configs are properly processed
      expect(jsonReport.configsAnalyzed.length).toBe(3);
    });
  });

  describe('CLI Argument Variations', () => {
    it('should accept short form flags', () => {
      expect(() => {
        execSync(
          `npx tsx scripts/generate-diversity-report.ts -i "${TEST_DIR}" -o "${TEST_DIR}"`,
          { cwd: PROJECT_ROOT, stdio: 'pipe' }
        );
      }).not.toThrow();
    });

    it('should work with relative paths', () => {
      // Use relative path to TEST_DIR (relative to PROJECT_ROOT)
      const relativeTestDir = 'output/test-diversity-report';
      expect(() => {
        execSync(
          `npx tsx scripts/generate-diversity-report.ts --input-dir output/test-diversity-report --output-dir output/test-diversity-report`,
          { cwd: PROJECT_ROOT, stdio: 'pipe' }
        );
      }).not.toThrow();
    });
  });

  describe('Report Quality', () => {
    let markdownReport: string;

    beforeAll(() => {
      execSync(
        `npx tsx scripts/generate-diversity-report.ts --input-dir "${TEST_DIR}" --output-dir "${TEST_DIR}"`,
        { cwd: PROJECT_ROOT, stdio: 'pipe' }
      );

      const reportPath = join(TEST_DIR, 'DIVERSITY-REPORT.md');
      markdownReport = readFileSync(reportPath, 'utf-8');
    });

    it('should use proper markdown formatting', () => {
      // Check for proper heading levels
      expect(markdownReport).toMatch(/^# /m); // H1
      expect(markdownReport).toMatch(/^## /m); // H2
      expect(markdownReport).toMatch(/^### /m); // H3
      expect(markdownReport).toMatch(/^#### /m); // H4

      // Check for horizontal rules
      expect(markdownReport).toContain('---');
    });

    it('should include visual indicators for scores', () => {
      // Progress bar
      expect(markdownReport).toMatch(/Progress: [█░]+/);

      // Status emojis
      expect(markdownReport).toMatch(/(✅|❌|🚨|⚠️)/);
    });

    it('should be well-structured and readable', () => {
      const lines = markdownReport.split('\n');

      // Should have multiple sections
      const sections = lines.filter(line => line.startsWith('## '));
      expect(sections.length).toBeGreaterThanOrEqual(5);

      // Should have tables
      const tables = lines.filter(line => line.includes('|'));
      expect(tables.length).toBeGreaterThan(10);
    });
  });
});
