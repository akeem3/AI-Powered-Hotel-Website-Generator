/**
 * Validate CVA Variant Fixtures
 * =============================
 *
 * Validates that test fixture JSON files conform to the CVAVariantMapSchema.
 * Run: npx tsx scripts/validate-fixtures.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { CVAVariantMapSchema } from '../lib/style-generation/schemas/cva-variant-map.schema';

const fixturesDir = join(process.cwd(), 'scripts/fixtures');

function main() {
  console.log('🔍 Validating CVA Variant Fixtures');
  console.log('====================================\n');

  const fixtureFiles = readdirSync(fixturesDir).filter(f => f.endsWith('.json'));

  let validCount = 0;
  let invalidCount = 0;
  const errors: string[] = [];

  for (const file of fixtureFiles) {
    const filePath = join(fixturesDir, file);
    try {
      const content = readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);

      const result = CVAVariantMapSchema.safeParse(json);

      if (result.success) {
        console.log(`✅ ${file}: VALID`);
        console.log(`   Block: ${result.data.blockType}, Archetype: ${result.data.archetype}`);
        validCount++;
      } else {
        console.log(`❌ ${file}: INVALID`);
        result.error.errors.forEach((err) => {
          console.log(`   - ${err.path.join('.')}: ${err.message}`);
        });
        invalidCount++;
        errors.push(`${file}: ${result.error.errors.map(e => e.message).join(', ')}`);
      }
    } catch (error: any) {
      console.log(`❌ ${file}: PARSE ERROR - ${error.message}`);
      invalidCount++;
      errors.push(`${file}: ${error.message}`);
    }
    console.log('');
  }

  console.log('=== Summary ===');
  console.log(`Total fixtures: ${fixtureFiles.length}`);
  console.log(`Valid: ${validCount}`);
  console.log(`Invalid: ${invalidCount}`);

  if (invalidCount > 0) {
    console.log('\n❌ Validation failed!');
    process.exit(1);
  }

  console.log('\n✅ All fixtures are valid!');
  process.exit(0);
}

main();
