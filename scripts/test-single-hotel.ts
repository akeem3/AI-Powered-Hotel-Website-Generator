/**
 * Test single hotel generation to verify pipeline works end-to-end.
 *
 * Usage:
 *   cd web-app && NODE_PATH=./node_modules npx tsx ../scripts/test-single-hotel.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Load env vars from web-app/.env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex > 0) {
        const key = trimmed.substring(0, eqIndex).trim();
        let value = trimmed.substring(eqIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  });
}

import { HomepageGenerationWorkflow } from '../web-app/app/langgraph/workflows/HomepageGenerationWorkflow';

async function main() {
  const hotelParams = {
    hotelName: 'The Pemberton Grand',
    hotelType: 'luxury' as const,
    targetAudience: 'couples' as const,
    brandPersonality: 'elegant' as const,
    location: 'London, United Kingdom',
  };

  console.log('=== Single Hotel Generation Test ===');
  console.log(`Hotel: ${hotelParams.hotelName}`);
  console.log(`Type: ${hotelParams.hotelType}, Audience: ${hotelParams.targetAudience}`);
  console.log('');

  const workflow = new HomepageGenerationWorkflow();
  const generationId = `pemberton-grand-test-v${Date.now()}`;
  const startTime = Date.now();

  try {
    const result = await workflow.invoke({
      generationId,
      hotelParameters: hotelParams,
    });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`\n=== Result (${elapsed}s) ===`);
    console.log(`Status: ${result.validationStatus}`);
    console.log(`Errors: ${result.validationErrors?.length ?? 0}`);
    console.log(`Cost: $${result.totalCost?.toFixed(4) ?? 'N/A'}`);
    console.log(`Fallbacks used: ${JSON.stringify(result.usedFallback ?? {})}`);

    if (result.assembledConfig) {
      console.log(`Components: ${result.assembledConfig.components?.length ?? 0}`);
      console.log(`Layout: ${result.assembledConfig.layoutStructure}`);
      console.log(`Validation: ${result.assembledConfig.validationStatus}`);
    }

    if (result.validationErrors && result.validationErrors.length > 0) {
      console.log('\nValidation Errors:');
      result.validationErrors.forEach((e: string, i: number) => console.log(`  ${i + 1}. ${e}`));
    }

    if (result.errors && result.errors.length > 0) {
      console.log('\nWorkflow Errors:');
      result.errors.forEach((e: string, i: number) => console.log(`  ${i + 1}. ${e}`));
    }

    // Save output
    const outDir = path.resolve(process.cwd(), '../output/single-hotel-test');
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, 'result.json');
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`\nOutput saved: ${outFile}`);

    // Exit with error code if failed
    if (result.validationStatus === 'fail') {
      process.exit(1);
    }
  } catch (error: any) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.error(`\n=== FAILED (${elapsed}s) ===`);
    console.error(error.message);
    process.exit(1);
  }
}

main();
