/**
 * Contract-CVA Sync Validator
 * Story 12.5: Variant Consistency Validation
 *
 * Validates that contract schema enum values match CVA variant definitions.
 * Run: npx tsx web-app/scripts/validate-contract-cva-sync.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  component: string;
  dimension: string;
  contractValues: string[];
  cvaValues: string[];
  missingInContract: string[];
  missingInCva: string[];
}

// Extract variant values from CVA file
export function extractCVAVariants(filePath: string): Record<string, Record<string, string[]>> {
  const content = readFileSync(filePath, 'utf-8');
  const result: Record<string, Record<string, string[]>> = {};

  // Match each CVA export statement
  // Pattern: export const componentNameVariants = cva( ... );
  const variantExportRegex = /export const (\w+)Variants = cva\(([\s\S]*?\n)\);/g;

  let match;
  while ((match = variantExportRegex.exec(content)) !== null) {
    const [, componentName, fullBody] = match;

    // Find the variants block within the config object
    const variantsMatch = fullBody.match(/variants:\s*\{([\s\S]*?)\n\s*(?:compoundVariants:|defaultVariants:)/);
    if (!variantsMatch) continue;

    const variantsBlock = variantsMatch[1];
    result[componentName] = {};

    // Extract dimension blocks (e.g., style: { ... }, layout: { ... })
    const dimensionRegex = /(\w+):\s*\{([^}]+)\}/g;
    let dimMatch;
    while ((dimMatch = dimensionRegex.exec(variantsBlock)) !== null) {
      const [, dimension, valuesBlock] = dimMatch;

      // Extract variant keys from the dimension block
      // Match lines like: "    modern: "..." or "    "heritage-opulence": "..." or "    2: "..."
      // Exclude Tailwind classes like "md:" by ensuring there's a quote after the colon
      // Updated to handle archetype-keyed variants with hyphens (e.g., heritage-opulence)
      // This regex matches both quoted and unquoted keys
      const valueRegex = /^\s*(?:\"([^\"]+)\"|([a-zA-Z0-9-]+)):\s*\"/gm;
      const valueMatches = [...valuesBlock.matchAll(valueRegex)];
      const valueList = valueMatches.map(m => m[1] || m[2]);

      if (valueList.length > 0) {
        result[componentName][dimension] = valueList;
      }
    }
  }

  return result;
}

// Extract enum values from contract file
function extractContractEnums(filePath: string): Record<string, string[]> {
  const content = readFileSync(filePath, 'utf-8');
  const result: Record<string, string[]> = {};

  // Match z.enum patterns
  const enumRegex = /(\w+):\s*z\.enum\(\[(.*?)\]\)/g;

  let match;
  while ((match = enumRegex.exec(content)) !== null) {
    const [, dimension, valuesStr] = match;
    const values = [...valuesStr.matchAll(/'(\w+)'/g)].map(m => m[1]);
    result[dimension] = values;
  }

  return result;
}

function main() {
  const cvaFile = join(process.cwd(), 'lib/cva-variants.ts');
  const contractDir = join(process.cwd(), 'lib/contracts');

  console.log('🔍 Contract-CVA Sync Validation');
  console.log('================================\n');

  const cvaVariants = extractCVAVariants(cvaFile);
  const contractFiles = readdirSync(contractDir).filter(f => f.endsWith('.contract.ts'));

  const results: ValidationResult[] = [];
  let hasErrors = false;

  for (const file of contractFiles) {
    const contractPath = join(contractDir, file);
    const componentName = file.replace('.contract.ts', '');

    // Map contract filename to CVA component name
    const cvaComponentName = mapContractToCva(componentName);

    if (!cvaVariants[cvaComponentName]) {
      console.log(`⚠️  No CVA variants found for ${componentName} (looking for ${cvaComponentName}Variants)`);
      continue;
    }

    const contractEnums = extractContractEnums(contractPath);
    const cvaComponent = cvaVariants[cvaComponentName];

    for (const [dimension, cvaValues] of Object.entries(cvaComponent)) {
      const contractValues = contractEnums[dimension] || [];

      const missingInContract = cvaValues.filter(v => !contractValues.includes(v));
      const missingInCva = contractValues.filter(v => !cvaValues.includes(v));

      if (missingInContract.length > 0 || missingInCva.length > 0) {
        results.push({
          component: componentName,
          dimension,
          contractValues,
          cvaValues,
          missingInContract,
          missingInCva,
        });

        if (missingInCva.length > 0) {
          hasErrors = true; // Contract has values that don't exist in CVA - this is an error
        }
      }
    }
  }

  // Report results
  if (results.length === 0) {
    console.log('✅ All contract values match CVA variants\n');
  } else {
    console.log('📋 Sync Issues Found:\n');

    for (const result of results) {
      console.log(`Component: ${result.component}`);
      console.log(`  Dimension: ${result.dimension}`);

      if (result.missingInContract.length > 0) {
        console.log(`  ⚠️  Missing in contract: ${result.missingInContract.join(', ')}`);
        console.log(`     (Contract may be intentionally restrictive)`);
      }

      if (result.missingInCva.length > 0) {
        console.log(`  ❌ Missing in CVA: ${result.missingInCva.join(', ')}`);
        console.log(`     (Contract references non-existent variant!)`);
      }

      console.log('');
    }
  }

  // Summary
  console.log('=== Summary ===');
  console.log(`CVA components: ${Object.keys(cvaVariants).length}`);
  console.log(`Contracts checked: ${contractFiles.length}`);
  console.log(`Sync issues: ${results.length}`);
  console.log(`Critical errors: ${results.filter(r => r.missingInCva.length > 0).length}`);

  process.exit(hasErrors ? 1 : 0);
}

// Map contract filenames to CVA component names
function mapContractToCva(contractName: string): string {
  const mapping: Record<string, string> = {
    'hero': 'hero',
    'gallery': 'gallery',
    'navigation': 'navigation',
    'room': 'roomCard',
    'booking': 'bookingWidget',
    'contact': 'contactForm',
    'testimonials': 'testimonials',
    'amenities': 'amenities',
  };
  return mapping[contractName] || contractName;
}

main();
