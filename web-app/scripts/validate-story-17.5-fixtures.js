/**
 * Story 17.5 Fixture Validation Script
 *
 * Validates that all three Epic 16 fixtures have been updated
 * with the correct hero layout values.
 */

const fs = require('fs');
const path = require('path');

console.log('=== Story 17.5: Fixture Validation ===');
console.log('');

const fixtures = [
  {
    name: 'luxury-boutique',
    file: 'fixtures/configs/luxury-boutique.json',
    expectedLayout: 'centered',
    expectedHeight: 'fullscreen'
  },
  {
    name: 'budget-hostel',
    file: 'fixtures/configs/budget-hostel.json',
    expectedLayout: 'minimal',
    expectedHeight: 'small'
  },
  {
    name: 'business-hotel',
    file: 'fixtures/configs/business-hotel.json',
    expectedLayout: 'split',
    expectedHeight: 'medium'
  }
];

let allPassed = true;

fixtures.forEach(fixture => {
  try {
    const filePath = path.join(__dirname, '..', fixture.file);
    const content = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(content);

    // Find hero component
    const heroComponent = config.components.find(c => c.type === 'hero');

    if (!heroComponent) {
      console.log('❌ ' + fixture.name + ': No hero component found');
      allPassed = false;
      return;
    }

    const actualLayout = heroComponent.variant.layout;
    const actualHeight = heroComponent.variant.height;

    const layoutMatch = actualLayout === fixture.expectedLayout ? '✅' : '❌';
    const heightMatch = actualHeight === fixture.expectedHeight ? '✅' : '❌';

    console.log(fixture.name + ':');
    console.log('  Layout: "' + actualLayout + '" (expected: "' + fixture.expectedLayout + '") ' + layoutMatch);
    console.log('  Height: "' + actualHeight + '" (expected: "' + fixture.expectedHeight + '") ' + heightMatch);
    console.log('');

    if (actualLayout !== fixture.expectedLayout || actualHeight !== fixture.expectedHeight) {
      allPassed = false;
    }
  } catch (error) {
    console.log('❌ ' + fixture.name + ': ' + error.message);
    allPassed = false;
  }
});

console.log('=====================================');
if (allPassed) {
  console.log('✅ All fixtures validated successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Start dev server: npm run dev');
  console.log('2. Visit preview URLs to verify visual output');
  console.log('   - http://localhost:3000/preview?config=luxury-boutique');
  console.log('   - http://localhost:3000/preview?config=budget-hostel');
  console.log('   - http://localhost:3000/preview?config=business-hotel');
  process.exit(0);
} else {
  console.log('❌ Some fixtures failed validation');
  process.exit(1);
}
