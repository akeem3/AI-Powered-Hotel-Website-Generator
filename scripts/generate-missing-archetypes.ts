/**
 * Generate Missing Archetype Configs
 *
 * Generates the 3 missing archetype configs for Story 22.2:
 * 1. Heritage Cultural (Taj Palace, New Delhi)
 * 2. Eco Lodge (1 Hotel South Beach)
 * 3. Design/Art Hotel (21c Museum Hotel Nashville)
 *
 * Usage:
 *   npx tsx scripts/generate-missing-archetypes.ts
 */

import { HomepageGenerationWorkflow } from '../web-app/app/langgraph/workflows/HomepageGenerationWorkflow';
import { HomepageConfigSchema } from '../web-app/app/langgraph/agents/schemas';
import { ARCHETYPE_PROFILES } from '../web-app/fixtures/diversity/archetype-profiles';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Sanitize hotel name for use in file paths
 */
function sanitizeHotelName(hotelName: string): string {
  return hotelName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Load environment variables from web-app/.env
 */
function loadEnvVars(): void {
  const possiblePaths = [
    path.resolve(process.cwd(), 'web-app/.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../web-app/.env'),
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
      break;
    }
  }
}

/**
 * Generate a single hotel configuration
 */
async function generateHotelConfig(
  parameters: import('../web-app/app/langgraph/agents/schemas').HotelParameters,
  outputDir: string
): Promise<{
  success: boolean;
  generationId: string;
  config?: import('../web-app/app/langgraph/agents/schemas').HomepageConfig;
  cost?: number;
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
    const validated = HomepageConfigSchema.parse(config);

    // Write to output directory
    const outputPath = path.join(outputDir, `homepage-config-${generationId}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(validated, null, 2));

    // Also copy to fixtures/configs for preview
    const fixturesDir = path.resolve(process.cwd(), 'web-app/fixtures/configs');
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
    };
  } catch (error: any) {
    return {
      success: false,
      generationId,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Main function to generate the 3 missing configs
 */
async function main() {
  // Load environment variables
  loadEnvVars();

  // Ensure output directory exists
  const outputDir = path.resolve(process.cwd(), 'output/diversity-validation');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // The 3 missing archetypes (indices 7, 8, 9 in ARCHETYPE_PROFILES)
  const missingArchetypes = [
    ARCHETYPE_PROFILES[7], // Heritage Cultural (Taj Palace)
    ARCHETYPE_PROFILES[8], // Eco Lodge (1 Hotel South Beach)
    ARCHETYPE_PROFILES[9], // Design/Art Hotel (21c Museum)
  ];

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Generating Missing Archetype Configs (3/12)              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`Output directory: ${outputDir}`);
  console.log(`Missing archetypes: ${missingArchetypes.length}`);
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
  for (let i = 0; i < missingArchetypes.length; i++) {
    const profile = missingArchetypes[i];
    const index = i + 1;

    console.log(`\n[${index}/${missingArchetypes.length}] Generating: ${profile.archetype}`);
    console.log(`  Hotel: ${profile.parameters.hotelName}`);
    console.log(`  Type: ${profile.parameters.hotelType}, Audience: ${profile.parameters.targetAudience}`);

    const startTime = Date.now();
    const result = await generateHotelConfig(profile.parameters, outputDir);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (result.success) {
      successCount++;
      totalCost += result.cost || 0;
      const componentCount = result.config?.components.length || 0;

      console.log(`  ✅ Success (${duration}s)`);
      console.log(`     ID: ${result.generationId}`);
      console.log(`     Cost: $${(result.cost || 0).toFixed(4)}`);
      console.log(`     Components: ${componentCount}`);

      results.push({
        archetype: profile.archetype,
        hotelName: profile.parameters.hotelName,
        success: true,
        generationId: result.generationId,
        cost: result.cost,
        componentCount,
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
      });
    }
  }

  // Write generation summary
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('\n📊 Generation Summary');
  console.log('');
  console.log(`Total generated: ${successCount}/${missingArchetypes.length}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total cost: $${totalCost.toFixed(4)}`);
  console.log(`Average cost per generation: $${(totalCost / missingArchetypes.length).toFixed(4)}`);
  console.log('');

  // Update summary file if it exists
  const summaryPath = path.join(outputDir, 'generation-summary.json');
  let existingSummary: any = null;
  if (fs.existsSync(summaryPath)) {
    try {
      existingSummary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
    } catch (e) {
      console.warn('Could not parse existing summary, creating new one');
    }
  }

  const updatedSummary = existingSummary ? {
    ...existingSummary,
    successCount: (existingSummary.successCount || 0) + successCount,
    failCount: (existingSummary.failCount || 0) + failCount,
    totalCost: (existingSummary.totalCost || 0) + totalCost,
    results: [...(existingSummary.results || []), ...results],
  } : {
    timestamp: new Date().toISOString(),
    outputDirectory: outputDir,
    totalProfiles: missingArchetypes.length,
    successCount,
    failCount,
    totalCost,
    averageCost: totalCost / missingArchetypes.length,
    results,
  };

  fs.writeFileSync(summaryPath, JSON.stringify(updatedSummary, null, 2));
  console.log(`Summary updated: ${summaryPath}`);
  console.log('');

  // Exit with error code if any failures
  if (failCount > 0) {
    console.error('⚠️  Some generations failed. Please check the errors above.');
    process.exit(1);
  }

  console.log('✅ All missing generations completed successfully!');
  console.log(`\nGenerated configs saved to: ${outputDir}`);
  console.log(`Preview fixtures saved to: web-app/fixtures/configs/`);
}

main().catch((error) => {
  console.error('\n💥 Fatal Error during batch generation:');
  console.error(error);
  process.exit(1);
});
