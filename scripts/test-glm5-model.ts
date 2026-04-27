/**
 * Quick test to check GLM-5 model availability via Z.ai API.
 * Tests different model name variants to find the correct one.
 */

import * as fs from 'fs';
import * as path from 'path';

// Load env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eq = trimmed.indexOf('=');
      if (eq > 0) {
        const key = trimmed.substring(0, eq).trim();
        let val = trimmed.substring(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

const BASE_URL = process.env.ANTHROPIC_BASE_URL || 'https://api.z.ai/api/anthropic';
const AUTH_TOKEN = process.env.ANTHROPIC_AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error('ANTHROPIC_AUTH_TOKEN not set');
  process.exit(1);
}

const MODEL_CANDIDATES = [
  'glm-5',
  'glm5',
  'GLM-5',
  'glm-4.7',  // current working model for comparison
];

async function testModel(model: string): Promise<void> {
  const url = `${BASE_URL}/v1/messages`;
  const body = {
    model,
    max_tokens: 50,
    messages: [{ role: 'user', content: 'Reply with exactly: "Hello from " followed by your model name.' }],
  };

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AUTH_TOKEN!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json();

    if (resp.ok && data.content) {
      const text = data.content.map((c: any) => c.text).join('');
      console.log(`  ✅ ${model} — OK: "${text.trim()}"`);
      console.log(`     actual model: ${data.model || 'not reported'}`);
    } else {
      const errMsg = data.error?.message || JSON.stringify(data).substring(0, 200);
      console.log(`  ❌ ${model} — FAILED: ${errMsg}`);
    }
  } catch (err: any) {
    console.log(`  ❌ ${model} — ERROR: ${err.message}`);
  }
}

async function main() {
  console.log(`Testing models against: ${BASE_URL}\n`);

  for (const model of MODEL_CANDIDATES) {
    await testModel(model);
  }
}

main();
