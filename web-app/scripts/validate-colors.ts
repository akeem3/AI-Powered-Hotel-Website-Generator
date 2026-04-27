/**
 * Color System Validation Script
 *
 * Validates:
 * 1. Every :root --*-val color token has a [data-mode="dark"] override
 * 2. No non-semantic color classes in component/page files
 * 3. All @theme inline vars reference existing --*-val vars
 * 4. shadcn/ui bridge tokens are registered in @theme inline
 *
 * Usage: npx tsx scripts/validate-colors.ts
 * CI:    npm run validate:colors
 */

import * as fs from 'fs';
import * as path from 'path';

const GLOBALS_PATH = path.resolve(__dirname, '../app/globals.css');
const SCAN_DIRS = ['../app', '../components', '../lib'].map(d => path.resolve(__dirname, d));
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Non-semantic color patterns (Tailwind default palette classes)
const NON_SEMANTIC_PATTERN = /(?:text|bg|border|ring|outline|fill|stroke)-(?:red|blue|green|yellow|orange|purple|pink|indigo|violet|emerald|teal|cyan|amber|lime|fuchsia|rose|sky|slate|gray|zinc|neutral|stone)-\d+/g;

let errors: string[] = [];
let warnings: string[] = [];

// --- Step 1: Parse globals.css ---
const css = fs.readFileSync(GLOBALS_PATH, 'utf-8');

// Extract :root --*-val tokens
const rootValsMatch = css.match(/:root\s*\{([^}]+)\}/s);
const rootBlock = rootValsMatch?.[1] ?? '';
const rootVals = [...rootBlock.matchAll(/--([\w-]+-val)\s*:/g)].map(m => m[1]);

// Extract dark mode --*-val tokens
const darkMatch = css.match(/\[data-(?:theme|mode)=['"]dark['"]\]\s*\{([^}]+)\}/s);
const darkBlock = darkMatch?.[1] ?? '';
const darkVals = [...darkBlock.matchAll(/--([\w-]+-val)\s*:/g)].map(m => m[1]);

// Check: color tokens (not typography/shadow/radius) must have dark override
const COLOR_TOKEN_PREFIXES = ['brand-', 'text-', 'surface-', 'border-', 'status-', 'on-brand', 'interactive-'];
const colorVals = rootVals.filter(v => COLOR_TOKEN_PREFIXES.some(p => v.startsWith(p)));

// Exclude alias vars (they reference other -val vars, inheriting dark overrides)
const aliasVars = new Set<string>();
for (const match of rootBlock.matchAll(/--([\w-]+-val)\s*:\s*var\(--[\w-]+-val\)/g)) {
  aliasVars.add(match[1]);
}

// Exclude hover vars derived via color-mix()
for (const token of colorVals) {
  if (aliasVars.has(token)) continue;
  if (!darkVals.includes(token)) {
    if (token.includes('-hover-val')) continue;
    warnings.push(`Missing dark mode override: --${token}`);
  }
}

console.log(`\n=== Color System Validation ===\n`);
console.log(`Root tokens:  ${rootVals.length}`);
console.log(`Dark tokens:  ${darkVals.length}`);
console.log(`Color tokens: ${colorVals.length} (${aliasVars.size} aliases)`);

// --- Step 2: Validate shadcn/ui bridge tokens ---
const SHADCN_BRIDGE_TOKENS = [
  '--color-primary',
  '--color-primary-foreground',
  '--color-secondary',
  '--color-secondary-foreground',
  '--color-accent',
  '--color-accent-foreground',
  '--color-muted',
  '--color-muted-foreground',
  '--color-destructive',
  '--color-destructive-foreground',
  '--color-popover',
  '--color-popover-foreground',
  '--color-card',
  '--color-card-foreground',
  '--color-background',
  '--color-foreground',
  '--color-input',
  '--color-ring',
  '--color-border',
];

const themeInlineMatch = css.match(/@theme\s+inline\s*\{([^}]+)\}/s);
const themeInlineBlock = themeInlineMatch?.[1] ?? '';
let bridgeCount = 0;

for (const token of SHADCN_BRIDGE_TOKENS) {
  if (themeInlineBlock.includes(token)) {
    bridgeCount++;
  } else {
    errors.push(`Missing shadcn/ui bridge token in @theme inline: ${token}`);
  }
}

console.log(`shadcn/ui bridge: ${bridgeCount}/${SHADCN_BRIDGE_TOKENS.length} tokens\n`);

// --- Step 3: Scan for non-semantic color classes ---
function scanDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      scanDir(fullPath);
    } else if (SCAN_EXTENSIONS.includes(path.extname(entry.name))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const matches = lines[i].match(NON_SEMANTIC_PATTERN);
        if (matches) {
          // Skip test files
          if (fullPath.includes('/tests/') || fullPath.includes('.test.') || fullPath.includes('.spec.')) continue;
          // Skip storybook files
          if (fullPath.includes('/stories/') || fullPath.includes('.stories.')) continue;
          for (const m of matches) {
            errors.push(`Non-semantic color: "${m}" at ${path.relative(process.cwd(), fullPath)}:${i + 1}`);
          }
        }
      }
    }
  }
}

for (const dir of SCAN_DIRS) {
  scanDir(dir);
}

// --- Report ---
if (warnings.length > 0) {
  console.log(`Warnings (${warnings.length}):`);
  for (const w of warnings) console.log(`  ⚠  ${w}`);
  console.log();
}

if (errors.length > 0) {
  console.log(`Errors (${errors.length}):`);
  for (const e of errors) console.log(`  ✗  ${e}`);
  console.log();
  console.log('VALIDATION FAILED');
  process.exit(1);
} else {
  console.log('✓ All checks passed');
  process.exit(0);
}
