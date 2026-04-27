/**
 * Story 17.5: HomepageConfigSchema Validation Script
 *
 * Validates that all three fixtures pass the HomepageConfigSchema
 * Zod validation.
 */

import { HomepageConfigSchema } from '../app/langgraph/agents/schemas';
import { readFileSync } from 'fs';
import { join } from 'path';

console.log('=== Story 17.5: HomepageConfigSchema Validation ===');
console.log('');

const fixtures = [
  'luxury-boutique',
  'budget-hostel',
  'business-hotel'
];

let allValid = true;

for (const fixture of fixtures) {
  try {
    const content = readFileSync(join(process.cwd(), 'fixtures', 'configs', fixture + '.json'), 'utf8');
    const parsed = JSON.parse(content);
    const result = HomepageConfigSchema.safeParse(parsed);

    if (result.success) {
      console.log('✅ ' + fixture + ': PASS');
    } else {
      console.log('❌ ' + fixture + ': FAIL');
      console.log('   Errors:', JSON.stringify(result.error.errors, null, 2));
      allValid = false;
    }
  } catch (error) {
    console.log('❌ ' + fixture + ': ERROR - ' + (error as Error).message);
    allValid = false;
  }
}

console.log('');
if (allValid) {
  console.log('✅ All fixtures passed HomepageConfigSchema validation!');
  process.exit(0);
} else {
  console.log('❌ Some fixtures failed validation');
  process.exit(1);
}
