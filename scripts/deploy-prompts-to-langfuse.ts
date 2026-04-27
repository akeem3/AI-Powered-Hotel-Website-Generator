/**
 * Deploy local prompt files to Langfuse with `production` label.
 *
 * Reads all .md files from web-app/app/langgraph/agents/prompts/
 * and creates a new prompt version in Langfuse for each one.
 *
 * Usage:
 *   cd web-app && NODE_PATH=./node_modules npx tsx ../scripts/deploy-prompts-to-langfuse.ts
 *
 * Environment variables required:
 *   LANGFUSE_SECRET_KEY, LANGFUSE_PUBLIC_KEY, LANGFUSE_BASE_URL (or LANGFUSE_HOST)
 */

import { Langfuse } from 'langfuse';
import * as fs from 'fs';
import * as path from 'path';

// Resolve prompts dir relative to this script (scripts/ is sibling of web-app/)
const PROMPTS_DIR = path.resolve(__dirname, '../web-app/app/langgraph/agents/prompts');

// When __dirname is unavailable (ESM), fall back to cwd-based resolution
const resolvedPromptsDir = fs.existsSync(PROMPTS_DIR)
  ? PROMPTS_DIR
  : path.resolve(process.cwd(), 'app/langgraph/agents/prompts');

async function main() {
  // Validate env vars
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_HOST || 'https://cloud.langfuse.com';

  if (!secretKey || !publicKey) {
    console.error('ERROR: LANGFUSE_SECRET_KEY and LANGFUSE_PUBLIC_KEY must be set');
    process.exit(1);
  }

  const langfuse = new Langfuse({ secretKey, publicKey, baseUrl });

  // Read all .md files from prompts directory
  const files = fs.readdirSync(resolvedPromptsDir).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    console.error(`ERROR: No .md files found in ${resolvedPromptsDir}`);
    process.exit(1);
  }

  console.log(`Found ${files.length} prompt files to deploy:\n`);

  const results: { name: string; status: 'success' | 'error'; error?: string }[] = [];

  for (const file of files) {
    const promptName = file.replace('.md', '');
    const filePath = path.join(resolvedPromptsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');

    try {
      await langfuse.createPrompt({
        name: promptName,
        prompt: content,
        type: 'text',
        labels: ['production'],
        commitMessage: `Deploy from local prompts (${new Date().toISOString()})`,
      });

      console.log(`  ✅ ${promptName} — deployed (${content.length} chars)`);
      results.push({ name: promptName, status: 'success' });
    } catch (error: any) {
      console.error(`  ❌ ${promptName} — FAILED: ${error.message}`);
      results.push({ name: promptName, status: 'error', error: error.message });
    }
  }

  // Flush pending events
  await langfuse.flush();

  // Summary
  const succeeded = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;

  console.log(`\n--- Deployment Summary ---`);
  console.log(`Total: ${results.length} | Success: ${succeeded} | Failed: ${failed}`);
  console.log(`Langfuse: ${baseUrl}`);

  if (failed > 0) {
    console.error('\nSome prompts failed to deploy. Check errors above.');
    process.exit(1);
  }

  console.log('\nAll prompts deployed with "production" label.');

  // Shutdown
  if (typeof (langfuse as any).shutdownAsync === 'function') {
    await (langfuse as any).shutdownAsync();
  } else if (typeof langfuse.shutdown === 'function') {
    await langfuse.shutdown();
  }
}

main().catch(err => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
