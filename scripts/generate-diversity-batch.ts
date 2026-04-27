// Check for help flag BEFORE importing modules to avoid dependency issues
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Generate Diversity Batch

Usage:
  npx tsx scripts/generate-diversity-batch.ts [options]

Options:
  --output-dir <path>    Output directory (default: output/diversity-validation)
  --scale                Scale test mode (50 hotels instead of 12)
  --resume               Skip already-generated configs (resume interrupted runs)
  --cost-warning <amt>   Cost warning threshold in USD (default: 10.00)
  --help, -h             Show this help message

Modes:
  Default (Archetype):   12 hotel archetypes (Story 22.2)
  Scale Test (--scale):  50 hotel profiles (Story 22.5)

Examples:
  npx tsx scripts/generate-diversity-batch.ts
  npx tsx scripts/generate-diversity-batch.ts --scale --resume
  npx tsx scripts/generate-diversity-batch.ts --output-dir output/test-run
  `);
  process.exit(0);
}

/**
 * Generate Diversity Batch
 *
 * Story 22.2: Generate 12 Hotel Websites (One Per Archetype)
 * Story 22.5: Scale Test - Generate 50 Hotels
 * Story 25.6: Extended to generate multi-page WebsiteConfig output
 *
 * Batch generation script that iterates through hotel profiles
 * and generates hotel website configurations for each.
 *
 * ## Story 25.6: Multi-Page Generation
 *
 * The script now generates two output files for each hotel:
 *
 * 1. **homepage-config-{generationId}.json**: Original single-page configuration
 *    - Validated against HomepageConfigSchema
 *    - Contains all components for the homepage
 *    - Includes hotel parameters, design tokens, and metadata
 *
 * 2. **website-config-{generationId}.json**: Multi-page configuration
 *    - Validated against WebsiteConfigSchema
 *    - Contains `pages` field with 9 page types
 *    - Contains `source` field with original HomepageConfig
 *    - Content multiplied to realistic volumes per hotel type
 *
 * ## Content Multiplication
 *
 * Each hotel uses the `splitToPages()` and `multiplyContent()` utilities:
 *
 * - **splitToPages()**: Distribute HomepageConfig components across pages
 * - **multiplyContent()**: Expand content to realistic volumes
 * - Uses generationId as seed for deterministic output
 * - Volume config derived from hotel type:
 *   - Luxury: 8-15 rooms, 15-30 gallery images
 *   - Boutique: 6-12 rooms, 12-25 gallery images
 *   - Resort: 10-20 rooms, 25-50 gallery images
 *   - Business: 5-10 rooms, 10-20 gallery images
 *   - Budget: 3-8 rooms, 8-15 gallery images
 *
 * ## Fixture Copying
 *
 * In archetype mode (not scale test), website-config files are copied to:
 * - `web-app/fixtures/configs/{sanitizedName}-website-config.json`
 *
 * This allows preview route testing with multi-page configurations.
 *
 * ## Graceful Degradation
 *
 * If website-config generation fails, the script continues with
 * homepage-config output and logs a warning. This ensures backward
 * compatibility and prevents batch failures.
 *
 * ## Modes
 *
 * - **Archetype mode (default)**: 12 hotel archetypes
 * - **Scale test mode (--scale)**: 50 hotel profiles for scale testing
 *
 * ## Usage
 *
 * ```bash
 * npx tsx scripts/generate-diversity-batch.ts [--output-dir <path>] [--scale] [--resume]
 * ```
 *
 * ## Output Files
 *
 * For each hotel generated:
 * - `{outputDir}/homepage-config-{generationId}.json`: HomepageConfig
 * - `{outputDir}/website-config-{generationId}.json`: WebsiteConfig
 * - `{outputDir}/generation-summary.json`: Batch generation summary
 *
 * In archetype mode only:
 * - `web-app/fixtures/configs/{sanitizedName}-config.json`: HomepageConfig fixture
 * - `web-app/fixtures/configs/{sanitizedName}-website-config.json`: WebsiteConfig fixture
 *
 * @module scripts/generate-diversity-batch
 */

import { HomepageGenerationWorkflow } from '../web-app/app/langgraph/workflows/HomepageGenerationWorkflow';
import { HomepageConfigSchema } from '../web-app/app/langgraph/agents/schemas';
import { ARCHETYPE_PROFILES } from '../web-app/fixtures/diversity/archetype-profiles';
import { SCALE_TEST_PROFILES, getScaleTestProfilesWithMetadata } from '../web-app/fixtures/diversity/scale-test-profiles';
import * as fs from 'fs';
import * as path from 'path';

// Story 25.6: Multi-page generation utilities
import {
  splitToPages,
  multiplyContent,
  type WebsiteConfig,
  WebsiteConfigSchema,
} from '../web-app/lib/generation/split-to-pages';
import { type VolumeConfig, VOLUME_CONFIGS } from '../web-app/lib/generation/multiply-content';
import { type HotelType } from '../web-app/lib/generation/seed-bank';

/**
 * Sanitize hotel name for use in file paths
 *
 * @param hotelName Hotel name to sanitize
 * @returns Sanitized name
 */
function sanitizeHotelName(hotelName: string): string {
  return hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Load environment variables from web-app/.env
 * Works from both project root and web-app directory
 */
function loadEnvVars(): void {
  // Try multiple possible locations for the .env file
  const possiblePaths = [
    path.resolve(process.cwd(), 'web-app/.env'),      // From project root
    path.resolve(process.cwd(), '.env'),              // From web-app directory
    path.resolve(__dirname, '../web-app/.env'),       // Relative to script
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=')?.trim().replace(/^["']|["']$/g, '');
          if (key && value && !process.env[key]) process.env[key] = value;
        }
      });
      break; // Use first found .env file
    }
  }
}

/**
 * Check if a config file already exists for the given hotel
 *
 * @param parameters Hotel parameters
 * @param outputDir Output directory
 * @returns True if config file exists
 */
function configExists(parameters: HotelParameters, outputDir: string): boolean {
  const sanitizedName = sanitizeHotelName(parameters.hotelName);
  const files = fs.readdirSync(outputDir);
  return files.some((file) => file.startsWith(`homepage-config-${sanitizedName}`));
}

/**
 * Generate a single hotel configuration
 *
 * @param parameters Hotel parameters
 * @param outputDir Output directory
 * @param skipExisting Skip if config already exists
 * @returns Generation result
 */
async function generateHotelConfig(
  parameters: import('../web-app/app/langgraph/agents/schemas').HotelParameters,
  outputDir: string,
  skipExisting: boolean = false,
  batchContext?: { batchIndex: number; batchSize: number; previousArchetypes: string[] }
): Promise<{
  success: boolean;
  skipped: boolean;
  generationId: string;
  config?: import('../web-app/app/langgraph/agents/schemas').HomepageConfig;
  cost?: number;
  componentCount?: number;
  duration?: number;
  error?: string;
  errorDetails?: any;
}> {
  const sanitizedName = sanitizeHotelName(parameters.hotelName);

  // Check for existing config if resume mode is enabled
  if (skipExisting && configExists(parameters, outputDir)) {
    return {
      success: false,
      skipped: true,
      generationId: sanitizedName,
      error: 'Skipped (already exists)',
    };
  }

  const generationId = `${sanitizedName}-v${Date.now()}`;
  const startTime = Date.now();

  try {
    const workflow = new HomepageGenerationWorkflow();
    const result = await workflow.invoke({
      generationId,
      hotelParameters: parameters,
      ...(batchContext && {
        batchIndex: batchContext.batchIndex,
        batchSize: batchContext.batchSize,
        previousArchetypes: batchContext.previousArchetypes,
      }),
    });

    if (result.validationStatus === 'fail') {
      return {
        success: false,
        skipped: false,
        generationId,
        duration: ((Date.now() - startTime) / 1000),
        error: `Validation failed: ${result.validationErrors?.join(', ') || 'Unknown error'}`,
        errorDetails: result.validationErrors,
      };
    }

    const config = result.assembledConfig || result;

    // Validate against schema
    const validated = HomepageConfigSchema.parse(config);

    // Write to output directory
    const outputPath = path.join(outputDir, `homepage-config-${generationId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2));

    // Also copy to fixtures/configs for preview (only for archetype mode, not scale test)
    if (!skipExisting) {
      const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      const fixturePath = path.join(fixturesDir, `${sanitizedName}-config.json`);
      fs.writeFileSync(fixturePath, JSON.stringify(validated, null, 2));
    }

    // Story 25.6: Generate multi-page configuration (website-config)
    let websiteConfig: WebsiteConfig | undefined;
    try {
      // Step 1: Split HomepageConfig into WebsiteConfig
      websiteConfig = splitToPages(validated);

      // Step 2: Derive pipeline parameters
      const hotelType = validated.hotelParameters.hotelType as HotelType;
      const volumeConfig = VOLUME_CONFIGS[hotelType] || VOLUME_CONFIGS.luxury;
      const seed = generationId;

      // Step 3: Multiply content to realistic volumes
      websiteConfig = multiplyContent(websiteConfig, {
        volumeConfig,
        seed,
        hotelType,
        hotelName: parameters.hotelName,
      });

      // Step 4: Write website-config file to output directory
      const websiteConfigPath = path.join(outputDir, `website-config-${generationId}.json`);
      fs.writeFileSync(websiteConfigPath, JSON.stringify(websiteConfig, null, 2));

      // Step 5: Also copy website-config to fixtures (only for archetype mode, not scale test)
      if (!skipExisting) {
        const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');
        if (!fs.existsSync(fixturesDir)) {
          fs.mkdirSync(fixturesDir, { recursive: true });
        }
        const websiteConfigFixturePath = path.join(fixturesDir, `${sanitizedName}-website-config.json`);
        fs.writeFileSync(websiteConfigFixturePath, JSON.stringify(websiteConfig, null, 2));
      }

      console.log(`     WebsiteConfig: Generated (${websiteConfig.pages ? Object.keys(websiteConfig.pages).length : 0} pages)`);

    } catch (error: any) {
      // Graceful degradation: log error but don't fail the generation
      console.log(`     ⚠️  Warning: Failed to generate website-config: ${error.message}`);
      console.log(`     Continuing with homepage-config output...`);
    }

    return {
      success: true,
      skipped: false,
      generationId,
      config: validated,
      cost: result.totalCost,
      componentCount: validated.components?.length || 0,
      duration: ((Date.now() - startTime) / 1000),
    };
  } catch (error: any) {
    return {
      success: false,
      skipped: false,
      generationId,
      duration: ((Date.now() - startTime) / 1000),
      error: error.message || 'Unknown error',
      errorDetails: error,
    };
  }
}

/**
 * Main batch generation function
 */
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let outputDir = 'output/diversity-validation';
  let scaleMode = false;
  let resumeMode = false;
  let costWarningThreshold = 10.00; // Warn when approaching $10

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    } else if (args[i] === '--scale') {
      scaleMode = true;
    } else if (args[i] === '--resume') {
      resumeMode = true;
    } else if (args[i] === '--cost-warning' && args[i + 1]) {
      costWarningThreshold = parseFloat(args[i + 1]);
      i++;
    }
  }

  // Load environment variables
  loadEnvVars();

  // Ensure output directory exists
  const absoluteOutputDir = path.isAbsolute(outputDir)
    ? outputDir
    : path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(absoluteOutputDir)) {
    fs.mkdirSync(absoluteOutputDir, { recursive: true });
  }

  // Select profiles based on mode
  let profiles: Array<{ archetype?: string; parameters: HotelParameters }>;
  let modeName: string;

  if (scaleMode) {
    profiles = getScaleTestProfilesWithMetadata();
    modeName = 'Scale Test - 50 Hotels';
  } else {
    profiles = ARCHETYPE_PROFILES.map((p) => ({ archetype: p.archetype, parameters: p.parameters }));
    modeName = 'Archetype - 12 Hotels';
  }

  const totalProfiles = profiles.length;

  // Count existing configs if in resume mode
  let skippedCount = 0;
  if (resumeMode) {
    for (const profile of profiles) {
      if (configExists(profile.parameters, absoluteOutputDir)) {
        skippedCount++;
      }
    }
  }

  const profilesToGenerate = resumeMode ? totalProfiles - skippedCount : totalProfiles;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log(`║     ${modeName.padEnd(54)} ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Output directory: ${absoluteOutputDir}`);
  console.log(`Total profiles: ${totalProfiles}`);
  if (resumeMode) {
    console.log(`Already exists: ${skippedCount} (will skip)`);
    console.log(`To generate: ${profilesToGenerate}`);
  }
  console.log(`Resume mode: ${resumeMode ? 'ON' : 'OFF'}`);
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');

  const results: Array<{
    archetype?: string;
    hotelName: string;
    success: boolean;
    skipped?: boolean;
    generationId?: string;
    cost?: number;
    componentCount?: number;
    duration?: number;
    error?: string;
    errorDetails?: any;
  }> = [];

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;
  const previousArchetypes: string[] = [];
  const errors: Array<{
    hotelName: string;
    archetype?: string;
    error: string;
    errorDetails: any;
  }> = [];

  // Track start time
  const batchStartTime = Date.now();

  // Generate each hotel sequentially
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const index = i + 1;
    const progress = ((index / profiles.length) * 100).toFixed(1);

    console.log(`\n[${index}/${profiles.length}] [${progress}%] Generating: ${profile.archetype || 'Unknown'}`);
    console.log(`  Hotel: ${profile.parameters.hotelName}`);
    console.log(`  Type: ${profile.parameters.hotelType}, Audience: ${profile.parameters.targetAudience}`);

    const result = await generateHotelConfig(
      profile.parameters,
      absoluteOutputDir,
      resumeMode,
      { batchIndex: i, batchSize: profiles.length, previousArchetypes: [...previousArchetypes] }
    );

    if (result.skipped) {
      skippedCount++;
      console.log(`  ⏭️  Skipped (already exists)`);
      results.push({
        archetype: profile.archetype,
        hotelName: profile.parameters.hotelName,
        success: false,
        skipped: true,
        generationId: result.generationId,
      });
      continue;
    }

    if (result.success) {
      successCount++;
      totalCost += result.cost || 0;
      if (profile.archetype) {
        previousArchetypes.push(profile.archetype);
      }

      console.log(`  ✅ Success (${result.duration?.toFixed(2)}s)`);
      console.log(`     ID: ${result.generationId}`);
      console.log(`     Cost: $${(result.cost || 0).toFixed(4)}`);
      console.log(`     Components: ${result.componentCount}`);

      // Check cost warning threshold
      if (totalCost >= costWarningThreshold) {
        console.log(`  ⚠️  WARNING: Total cost $${totalCost.toFixed(2)} exceeds threshold of $${costWarningThreshold.toFixed(2)}`);
      }

      results.push({
        archetype: profile.archetype,
        hotelName: profile.parameters.hotelName,
        success: true,
        generationId: result.generationId,
        cost: result.cost,
        componentCount: result.componentCount,
        duration: result.duration,
      });
    } else {
      failCount++;
      console.log(`  ❌ Failed (${result.duration?.toFixed(2)}s)`);
      console.log(`     Error: ${result.error}`);

      errors.push({
        hotelName: profile.parameters.hotelName,
        archetype: profile.archetype,
        error: result.error || 'Unknown error',
        errorDetails: result.errorDetails,
      });

      results.push({
        archetype: profile.archetype,
        hotelName: profile.parameters.hotelName,
        success: false,
        generationId: result.generationId,
        error: result.error,
        errorDetails: result.errorDetails,
        duration: result.duration,
      });
    }
  }

  const totalDuration = ((Date.now() - batchStartTime) / 1000).toFixed(2);

  // Write generation summary
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('\n📊 Generation Summary');
  console.log('');
  console.log(`Total profiles: ${totalProfiles}`);
  console.log(`Skipped (exists): ${skippedCount}`);
  console.log(`Generated: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Success rate: ${((successCount / profilesToGenerate) * 100).toFixed(1)}%`);
  console.log(`Total duration: ${totalDuration}s`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);
  console.log(`Average cost per generation: $${profilesToGenerate > 0 ? (totalCost / profilesToGenerate).toFixed(4) : '0.0000'}`);
  console.log(`Average duration per generation: ${profilesToGenerate > 0 ? (parseFloat(totalDuration) / profilesToGenerate).toFixed(2) : '0.00'}s`);
  console.log('');

  if (errors.length > 0) {
    console.log('❌ Failed Generations:');
    for (const error of errors) {
      console.log(`  - ${error.hotelName} (${error.archetype || 'Unknown'}): ${error.error}`);
    }
    console.log('');
  }

  // Write summary to file
  const summaryPath = path.join(absoluteOutputDir, 'generation-summary.json');
  const summaryData = {
    timestamp: new Date().toISOString(),
    mode: scaleMode ? 'scale-test' : 'archetype',
    outputDirectory: absoluteOutputDir,
    resumeMode,
    totalProfiles,
    skippedCount,
    profilesToGenerate,
    successCount,
    failCount,
    successRate: profilesToGenerate > 0 ? (successCount / profilesToGenerate) * 100 : 0,
    totalDuration,
    totalCost,
    averageCost: profilesToGenerate > 0 ? totalCost / profilesToGenerate : 0,
    averageDuration: profilesToGenerate > 0 ? parseFloat(totalDuration) / profilesToGenerate : 0,
    results,
    errors,
  };

  fs.writeFileSync(summaryPath, JSON.stringify(summaryData, null, 2));

  console.log(`Summary saved to: ${summaryPath}`);
  console.log('');

  // Exit with error code if any failures (excluding skipped)
  if (failCount > 0) {
    console.error('⚠️  Some generations failed. Please check the errors above.');
    console.error(`Run with --resume to skip existing configs and retry failed generations.`);
    process.exit(1);
  }

  console.log('✅ All generations completed successfully!');
  console.log(`\nGenerated configs saved to: ${absoluteOutputDir}`);
  if (!scaleMode) {
    console.log(`Preview fixtures saved to: web-app/fixtures/configs/`);
  }
}

main().catch((error) => {
  console.error('\n💥 Fatal Error during batch generation:');
  console.error(error);
  process.exit(1);
});
