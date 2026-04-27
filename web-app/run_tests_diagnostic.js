const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Running QualityValidator and Workflow tests...');
  const output = execSync('npx jest "tests/langgraph/**/*.test.ts" -c jest.config.workflow.js --verbose', { encoding: 'utf-8', stdio: 'pipe' });
  fs.writeFileSync('test_output_full.txt', output, 'utf-8');
  console.log('Tests passed! Output saved to test_output_full.txt');
} catch (error) {
  console.error('Tests failed.');
  fs.writeFileSync('test_output_full.txt', error.stdout + '\n' + error.stderr, 'utf-8');
  console.log('Failure details saved to test_output_full.txt');
}
