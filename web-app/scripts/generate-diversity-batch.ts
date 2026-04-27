/**
 * Load environment variables before ANY imports
 * This must be at the very top of the file, before any ES6 imports
 */

import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env FIRST
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=')?.trim().replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// NOW we can safely import modules that depend on environment variables
// Script is in web-app/scripts/, so we need ../ to get to web-app/app/
import { HomepageGenerationWorkflow } from '../app/langgraph/workflows/HomepageGenerationWorkflow';
import { HomepageConfigSchema } from '../app/langgraph/agents/schemas';
import { ARCHETYPE_PROFILES } from '../fixtures/diversity/archetype-profiles';

function sanitizeHotelName(hotelName: string): string {
  return hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function generateHotelConfig(
  parameters: any,
  outputDir: string
): Promise<{
  success: boolean;
  generationId: string;
  config?: any;
  cost?: number;
  componentCount?: number;
  error?: string;
}> {
  const sanitizedName = sanitizeHotelName(parameters.hotelName);
  const generationId = `${sanitizedName}-v${Date.now()}`;

  try {
    const workflow = new HomepageGenerationWorkflow();
    const result = await workflow.invoke({
      generationId,
      hotelParameters: parameters,
    });

    if (result.validationStatus === 'fail') {
      return {
        success: false,
        generationId,
        error: `Validation failed: ${result.validationErrors?.join(', ') || 'Unknown error'}`,
      };
    }

    const config = result.assembledConfig || result;

    // Validate against schema
    const validated = HomepageConfigSchema.parse(config);

    // Write to output directory
    const outputPath = path.join(outputDir, `homepage-config-${generationId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2));

    // Also copy to fixtures/configs for preview
    const fixturesDir = path.resolve(process.cwd(), 'fixtures/configs');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    const fixturePath = path.join(fixturesDir, `${sanitizedName}-config.json`);
    fs.writeFileSync(fixturePath, JSON.stringify(validated, null, 2));

    return {
      success: true,
      generationId,
      config: validated,
      cost: result.totalCost,
      componentCount: validated.components?.length || 0,
    };
  } catch (error: any) {
    return {
      success: false,
      generationId,
      error: error.message || 'Unknown error',
    };
  }
}

async function main() {
  const args = process.argv.slice(2);
  let outputDir = 'output/diversity-validation';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output-dir' && args[i + 1]) {
      outputDir = args[i + 1];
      i++;
    }
  }

  // Ensure output directory exists
  const absoluteOutputDir = path.isAbsolute(outputDir)
    ? outputDir
    : path.resolve(process.cwd(), outputDir);
  if (!fs.existsSync(absoluteOutputDir)) {
    fs.mkdirSync(absoluteOutputDir, { recursive: true });
  }

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Diversity Batch Generation - 12 Hotel Archetypes        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Output directory: ${absoluteOutputDir}`);
  console.log(`Total profiles to generate: ${ARCHETYPE_PROFILES.length}`);
  console.log('');
  console.log('──────────────────────────────────────────────────────────────');

  const results: Array<{
    archetype: string;
    hotelName: string;
    success: boolean;
    generationId?: string;
    cost?: number;
    componentCount?: number;
    error?: string;
  }> = [];

  let totalCost = 0;
  let successCount = 0;
  let failCount = 0;

  // Generate each hotel sequentially
  for (let i = 0; i < ARCHETYPE_PROFILES.length; i++) {
    const profile = ARCHETYPE_PROFILES[i];
    const index = i + 1;

    console.log(`\n[${index}/${ARCHETYPE_PROFILES.length}] Generating: ${profile.archetype}`);
    console.log(`  Hotel: ${profile.parameters.hotelName}`);
    console.log(`  Type: ${profile.parameters.hotelType}, Audience: ${profile.parameters.targetAudience}`);

    const startTime = Date.now();

    const result = await generateHotelConfig(profile.parameters, absoluteOutputDir);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success) {
      successCount++;
      totalCost += result.cost || 0;

      console.log(`  ✅ Success (${duration}s)`);
      console.log(`     ID: ${result.generationId}`);
      console.log(`     Cost: $${(result.cost || 0).toFixed(4)}`);
      console.log(`     Components: ${result.componentCount}`);

      results.push({
        archetype: profile.archetype,
        hotelName: profile.parameters.hotelName,
        success: true,
        generationId: result.generationId,
        cost: result.cost,
        componentCount: result.componentCount,
        generationTime: duration,
        validationStatus: 'PASS',
      });
    } else {
      failCount++;
      console.log(`  ❌ Failed (${duration}s)`);
      console.log(`     Error: ${result.error}`);

      results.push({
        archetype: profile.archetype,
        hotelName: profile.parameters.hotelName,
        success: false,
        error: result.error,
        generationTime: duration,
        validationStatus: 'FAIL',
      });
    }
  }

  // Write generation summary
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('\n📊 Generation Summary');
  console.log('');
  console.log(`Total generated: ${successCount}/${ARCHETYPE_PROFILES.length}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);
  console.log(`Average cost per generation: $${(totalCost / ARCHETYPE_PROFILES.length).toFixed(4)}`);
  console.log('');

  // Write summary to file
  const summaryPath = path.join(absoluteOutputDir, 'generation-summary.json');
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        outputDirectory: absoluteOutputDir,
        totalProfiles: ARCHETYPE_PROFILES.length,
        successCount,
        failCount,
        totalCost,
        averageCost: totalCost / ARCHETYPE_PROFILES.length,
        results,
      },
      null,
      2
    )
  );

  console.log(`Summary saved to: ${summaryPath}`);
  console.log('');

  // Exit with error code if any failures
  if (failCount > 0) {
    console.error('⚠️  Some generations failed. Please check the errors above.');
    process.exit(1);
  }

  console.log('✅ All generations completed successfully!');
  console.log(`\nGenerated configs saved to: ${absoluteOutputDir}`);
  console.log(`Preview fixtures saved to: fixtures/configs/`);
}

main().catch((error) => {
  console.error('\n💥 Fatal Error during batch generation:');
  console.error(error);
  process.exit(1);
});
