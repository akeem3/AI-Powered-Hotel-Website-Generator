/**
 * CVA Variant Code Generator (Simplified Version)
 * ================================================
 *
 * Story 20.9: Build-Time CVA Code Generation Script (Simplified)
 *
 * This script reads AI-generated CVAVariantMap JSON files and generates
 * archetype variant data that can be manually integrated into the 3 CVA
 * enforcement layers.
 *
 * Due to AST manipulation complexity, this version focuses on:
 * 1. Loading and validating CVAVariantMap JSON files
 * 2. Generating archetype variant data in a developer-friendly format
 * 3. Providing clear instructions for manual integration
 * 4. Creating a foundation for future full automation
 *
 * Usage:
 *   npx tsx scripts/generate-cva-variants-simple.ts [options]
 *
 * Options:
 *   --input <path>     Path to CVAVariantMap JSON file or fixtures directory
 *   --output <path>    Path to output file (default: scripts/cva-variants-output.txt)
 *
 * Source: Epic 20 - AI-Driven Design Token + CVA Diversity
 * Reference: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 *
 * @module scripts/generate-cva-variants-simple
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, relative, resolve } from 'path';
import { CVAVariantMapSchema, type CVAVariantMap } from '../lib/style-generation/schemas/cva-variant-map.schema';

// ==================================================================================
// CONFIGURATION
// ==================================================================================

interface Config {
  inputPath: string;
  outputPath: string;
  verbose: boolean;
  projectRoot: string;
}

// Target file paths (relative to project root)
const TARGET_FILES = {
  cvaVariants: 'lib/cva-variants.ts',
  schemas: 'app/langgraph/agents/schemas.ts',
  cvaValidator: 'app/langgraph/utils/cva-validator.ts',
} as const;

// ==================================================================================
// TYPES
// ==================================================================================

interface ArchetypeVariantData {
  blockType: string;
  archetype: string;
  variantClasses: Record<string, string>;
  designRationale: string;
}

interface GenerationOutput {
  timestamp: string;
  archetypeVariants: ArchetypeVariantData[];
  integrationInstructions: string[];
}

// ==================================================================================
// CLI ARGUMENT PARSING
// ==================================================================================

function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    inputPath: 'scripts/fixtures',
    outputPath: 'scripts/cva-variants-output.txt',
    verbose: false,
    projectRoot: process.cwd(),
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--input':
      case '-i':
        config.inputPath = args[++i];
        break;
      case '--output':
      case '-o':
        config.outputPath = args[++i];
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--help':
      case '-h':
        console.log(`
CVA Variant Code Generator (Simplified)
========================================

Usage: npx tsx scripts/generate-cva-variants-simple.ts [options]

Options:
  --input, -i <path>   Path to CVAVariantMap JSON file or fixtures directory
                       Default: scripts/fixtures
  --output, -o <path>  Path to output file (default: scripts/cva-variants-output.txt)
  --verbose, -v        Enable detailed logging
  --help, -h           Show this help message

Examples:
  npx tsx scripts/generate-cva-variants-simple.ts --input scripts/fixtures/heritage-opulence-hero.json
  npx tsx scripts/generate-cva-variants-simple.ts --input scripts/fixtures --verbose
        `);
        process.exit(0);
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          console.log('Use --help for usage information');
          process.exit(1);
        }
    }
  }

  return config;
}

// ==================================================================================
// LOGGING
// ==================================================================================

function log(config: Config, message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const prefix = {
    info: '📋',
    warn: '⚠️ ',
    error: '❌',
  }[level];

  if (config.verbose || level === 'error' || level === 'warn') {
    console.log(`${prefix} ${message}`);
  }
}

// ==================================================================================
// INPUT FILE HANDLING
// ==================================================================================

/**
 * Load CVAVariantMap data from a JSON file or directory of JSON files.
 */
function loadVariantMaps(config: Config): CVAVariantMap[] {
  const inputPath = resolve(config.projectRoot, config.inputPath);
  const variantMaps: CVAVariantMap[] = [];

  if (!existsSync(inputPath)) {
    throw new Error(`Input path does not exist: ${inputPath}`);
  }

  const stat = statSync(inputPath);

  if (stat.isFile()) {
    // Single file
    const content = readFileSync(inputPath, 'utf-8');
    const json = JSON.parse(content);
    const result = CVAVariantMapSchema.safeParse(json);

    if (!result.success) {
      throw new Error(
        `Invalid CVAVariantMap in ${inputPath}:\n${result.error.issues.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')}`
      );
    }

    variantMaps.push(result.data);
    log(config, `Loaded variant map: ${result.data.blockType} / ${result.data.archetype}`);
  } else if (stat.isDirectory()) {
    // Directory - load all JSON files
    const files = readdirSync(inputPath).filter(f => f.endsWith('.json'));

    if (files.length === 0) {
      throw new Error(`No JSON files found in directory: ${inputPath}`);
    }

    for (const file of files) {
      const filePath = join(inputPath, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const json = JSON.parse(content);
        const result = CVAVariantMapSchema.safeParse(json);

        if (!result.success) {
          log(config, `Skipping invalid file ${file}: ${result.error.issues.map(e => e.message).join(', ')}`, 'warn');
          continue;
        }

        variantMaps.push(result.data);
        log(config, `Loaded variant map: ${result.data.blockType} / ${result.data.archetype}`);
      } catch (error: any) {
        log(config, `Failed to load ${file}: ${error.message}`, 'warn');
      }
    }
  }

  if (variantMaps.length === 0) {
    throw new Error('No valid CVAVariantMap files found');
  }

  log(config, `Loaded ${variantMaps.length} variant map(s) total`);
  return variantMaps;
}

// ==================================================================================
// DATA GENERATION
// ==================================================================================

/**
 * Generate archetype variant data from CVAVariantMaps.
 */
function generateArchetypeVariantData(variantMaps: CVAVariantMap[]): ArchetypeVariantData[] {
  return variantMaps.map(map => ({
    blockType: map.blockType,
    archetype: map.archetype,
    variantClasses: map.variantClasses,
    designRationale: map.designRationale,
  }));
}

// ==================================================================================
// INTEGRATION INSTRUCTIONS GENERATION
// ==================================================================================

/**
 * Generate integration instructions for manual file updates.
 */
function generateIntegrationInstructions(data: ArchetypeVariantData[]): string[] {
  const instructions: string[] = [];

  // Group by block type
  const byBlockType = new Map<string, ArchetypeVariantData[]>();
  for (const item of data) {
    if (!byBlockType.has(item.blockType)) {
      byBlockType.set(item.blockType, []);
    }
    byBlockType.get(item.blockType)!.push(item);
  }

  instructions.push('# CVA Archetype Variant Integration Instructions');
  instructions.push('');
  instructions.push(`Generated: ${new Date().toISOString()}`);
  instructions.push('');
  instructions.push('This file contains archetype variant data that needs to be manually integrated');
  instructions.push('into the 3 CVA enforcement layers.');
  instructions.push('');
  instructions.push('## 1. lib/cva-variants.ts');
  instructions.push('');
  instructions.push('For each block type, add archetype variant entries to the variants object.');
  instructions.push('');
  instructions.push('Example for hero block with heritage-opulence archetype:');
  instructions.push('```typescript');
  instructions.push('// In heroVariants = cva(..., {');
  instructions.push('  variants: {');
  instructions.push('    style: {');
  instructions.push('      // ... existing variants ...');
  instructions.push('      "heritage-opulence": "bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted",');
  instructions.push('    },');
  instructions.push('    layout: {');
  instructions.push('      // ... existing variants ...');
  instructions.push('      "heritage-opulence": "grid md:grid-cols-2 gap-hero items-center",');
  instructions.push('    },');
  instructions.push('    // ... other dimensions ...');
  instructions.push('  }');
  instructions.push('})');
  instructions.push('```');
  instructions.push('');

  for (const [blockType, items] of byBlockType.entries()) {
    instructions.push(`### ${blockType} block`);
    instructions.push('');

    for (const item of items) {
      instructions.push(`#### ${item.archetype}`);
      instructions.push('');
      instructions.push(`**Design Rationale:** ${item.designRationale}`);
      instructions.push('');
      instructions.push('**Variant Classes:**');
      instructions.push('```typescript');
      for (const [dimension, classes] of Object.entries(item.variantClasses)) {
        instructions.push(`  ${dimension}: "${classes}",`);
      }
      instructions.push('```');
      instructions.push('');
    }
  }

  instructions.push('');
  instructions.push('## 2. app/langgraph/agents/schemas.ts');
  instructions.push('');
  instructions.push('Add archetype field to StylingAgentOutputSchema:');
  instructions.push('');
  instructions.push('```typescript');
  instructions.push('export const StylingAgentOutputSchema = z.object({');
  instructions.push('  // ... existing fields ...');
  instructions.push('  archetype: ArchetypeSchema.optional(), // Add this line');
  instructions.push('  // ... rest of schema ...');
  instructions.push('});');
  instructions.push('```');
  instructions.push('');

  instructions.push('## 3. app/langgraph/utils/cva-validator.ts');
  instructions.push('');
  instructions.push('For each block type and dimension, add archetype variant values to VALID_VARIANTS:');
  instructions.push('');
  instructions.push('Example for hero block style dimension:');
  instructions.push('```typescript');
  instructions.push('private static readonly VALID_VARIANTS = {');
  instructions.push('  // ... existing entries ...');
  instructions.push('  hero: {');
  instructions.push('    // ... existing dimensions ...');
  instructions.push('    style: {');
  instructions.push('      // ... existing variants ...');
  instructions.push('      "heritage-opulence": "heritage-opulence",');
  instructions.push('      "urban-tech": "urban-tech",');
  instructions.push('      "coastal-resort": "coastal-resort",');
  instructions.push('      // ... other archetypes ...');
  instructions.push('    },');
  instructions.push('  },');
  instructions.push('  // ... other blocks ...');
  instructions.push('};');
  instructions.push('```');
  instructions.push('');

  instructions.push('## 4. Validation');
  instructions.push('');
  instructions.push('After integration, run these commands to verify:');
  instructions.push('');
  instructions.push('```bash');
  instructions.push('# Validate CVA sync');
  instructions.push('npm run validate:contract-sync');
  instructions.push('');
  instructions.push('# Run tests');
  instructions.push('npm test');
  instructions.push('');
  instructions.push('# Build project');
  instructions.push('npm run build');
  instructions.push('```');
  instructions.push('');

  return instructions;
}

// ==================================================================================
// OUTPUT GENERATION
// ==================================================================================

/**
 * Generate the output file with archetype variant data and integration instructions.
 */
function generateOutput(config: Config, variantMaps: CVAVariantMap[]): void {
  const data = generateArchetypeVariantData(variantMaps);
  const instructions = generateIntegrationInstructions(data);

  const output: GenerationOutput = {
    timestamp: new Date().toISOString(),
    archetypeVariants: data,
    integrationInstructions: instructions,
  };

  // Write JSON data file
  const jsonOutputPath = resolve(config.projectRoot, config.outputPath.replace('.txt', '.json'));
  writeFileSync(jsonOutputPath, JSON.stringify(output, null, 2), 'utf-8');
  log(config, `Generated JSON output: ${relative(config.projectRoot, jsonOutputPath)}`);

  // Write human-readable instructions
  const txtOutputPath = resolve(config.projectRoot, config.outputPath);
  writeFileSync(txtOutputPath, instructions.join('\n'), 'utf-8');
  log(config, `Generated instructions: ${relative(config.projectRoot, txtOutputPath)}`);

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('GENERATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Generated archetype variant data for ${data.length} archetype/block combinations`);
  console.log('');
  console.log('Archetypes covered:');
  const archetypes = new Set(data.map(d => d.archetype));
  archetypes.forEach(a => console.log(`  - ${a}`));
  console.log('');
  console.log('Block types covered:');
  const blocks = new Set(data.map(d => d.blockType));
  blocks.forEach(b => console.log(`  - ${b}`));
  console.log('');
  console.log('Next steps:');
  console.log('  1. Review the generated output files');
  console.log(`  2. Follow the integration instructions in ${relative(config.projectRoot, txtOutputPath)}`);
  console.log('  3. Run validation commands after integration');
  console.log('='.repeat(60));
}

// ==================================================================================
// ENTRY POINT
// ==================================================================================

async function main() {
  const config = parseArgs();

  try {
    // Load variant maps
    const variantMaps = loadVariantMaps(config);

    // Generate output
    generateOutput(config, variantMaps);

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export { generateArchetypeVariantData, generateIntegrationInstructions };
