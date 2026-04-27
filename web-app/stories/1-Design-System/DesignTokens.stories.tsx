'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { DEFAULT_BASE_COLORS } from './_demo-tokens';

const meta: Meta = {
  title: 'Design System/Design Tokens',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**Design Tokens & Palette Generation Architecture**

This story documents the complete design token system and palette generation architecture for hotel websites.

## System Overview

The design system uses a **4-stage pipeline** to generate consistent, accessible color themes from minimal input:

1. **Input**: Hotels provide 2-5 OKLCH base colors
2. **Generation**: System generates 11-shade scales (50-950) for 5 color families
3. **Mapping**: Shades mapped to semantic tokens for light + dark modes
4. **Application**: Tokens applied via Tailwind utilities and CSS variables

## Key Benefits

- **Minimal Configuration**: Hotels configure 2-5 colors instead of 50+ tokens
- **Automatic Dark Mode**: Semantic tokens automatically adapt to light/dark
- **OKLCH Perceptual Uniformity**: Colors appear evenly spaced visually
- **Gamut Safety**: All colors clamped to sRGB display gamut
- **Accessibility Available**: APCA contrast measurement in contrast-validator.ts (test-only, pipeline integration planned)
- **shadcn/ui Compatible**: Semantic tokens bridge to shadcn/ui components

Navigate to the **Color Palette** story to see interactive examples.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Table component for semantic token mapping
interface SemanticMappingRowProps {
  tokenName: string;
  lightMode: string;
  darkMode: string;
  usage: string;
}

const SemanticMappingRow = ({ tokenName, lightMode, darkMode, usage }: SemanticMappingRowProps) => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 border-b border-border-default last:border-b-0 items-start">
      <div>
        <code className="font-mono text-sm font-semibold text-text-primary">{tokenName}</code>
      </div>
      <div>
        <code className="font-mono text-xs text-text-secondary">{lightMode}</code>
      </div>
      <div>
        <code className="font-mono text-xs text-text-secondary">{darkMode}</code>
      </div>
      <div>
        <p className="text-sm text-text-secondary">{usage}</p>
      </div>
    </div>
  );
};

// Architecture diagram component
const ArchitectureDiagram = () => {
  return (
    <div className="p-8 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-lg border border-border-default">
      <div className="space-y-8">
        {/* Stage 1: Input */}
        <div className="flex items-center gap-4">
          <div className="flex-1 p-6 bg-surface-primary rounded-lg shadow-md border-2 border-brand-primary">
            <h3 className="text-lg font-bold text-text-primary mb-2">1. Input</h3>
            <p className="text-sm text-text-secondary mb-4">Hotel provides 2-5 OKLCH base colors</p>
            <div className="space-y-2 font-mono text-xs text-text-secondary">
              <div className="p-2 bg-brand-primary/10 rounded">brandPrimary: {DEFAULT_BASE_COLORS.brandPrimary}</div>
              <div className="p-2 bg-brand-primary/10 rounded">brandSecondary: {DEFAULT_BASE_COLORS.brandSecondary}</div>
              <div className="p-2 bg-brand-primary/10 rounded opacity-60">brandAccent: (optional)</div>
              <div className="p-2 bg-brand-primary/10 rounded opacity-60">statusSuccess: (optional)</div>
              <div className="p-2 bg-brand-primary/10 rounded opacity-60">statusError: (optional)</div>
            </div>
          </div>
          <div className="text-3xl text-text-muted">→</div>
        </div>

        {/* Stage 2: Generation */}
        <div className="flex items-center gap-4">
          <div className="flex-1 p-6 bg-surface-primary rounded-lg shadow-md border-2 border-status-success">
            <h3 className="text-lg font-bold text-text-primary mb-2">2. Generation</h3>
            <p className="text-sm text-text-secondary mb-4">
              11 shades per family (50-950) via lightness distribution
            </p>
            <div className="space-y-2 font-mono text-xs text-text-secondary">
              <div className="p-2 bg-status-success/10 rounded">primary: ShadeScale (50...950)</div>
              <div className="p-2 bg-status-success/10 rounded">secondary: ShadeScale (50...950)</div>
              <div className="p-2 bg-status-success/10 rounded">accent: ShadeScale (50...950)</div>
              <div className="p-2 bg-status-success/10 rounded">success: ShadeScale (50...950)</div>
              <div className="p-2 bg-status-success/10 rounded">error: ShadeScale (50...950)</div>
            </div>
            <p className="text-xs text-text-secondary mt-3 italic">
              = 55 colors generated from 2-5 inputs
            </p>
          </div>
          <div className="text-3xl text-text-muted">→</div>
        </div>

        {/* Stage 3: Mapping */}
        <div className="flex items-center gap-4">
          <div className="flex-1 p-6 bg-surface-primary rounded-lg shadow-md border-2 border-brand-secondary">
            <h3 className="text-lg font-bold text-text-primary mb-2">3. Mapping</h3>
            <p className="text-sm text-text-secondary mb-4">
              Shades mapped to semantic tokens (light + dark)
            </p>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <p className="font-semibold text-text-primary">☀️ Light Mode</p>
                <div className="space-y-1 font-mono text-text-secondary">
                  <div className="p-2 bg-brand-secondary/10 rounded">brand-primary: primary-700</div>
                  <div className="p-2 bg-brand-secondary/10 rounded">text-primary: primary-900</div>
                  <div className="p-2 bg-brand-secondary/10 rounded">surface-default: primary-50</div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-text-primary">🌙 Dark Mode</p>
                <div className="space-y-1 font-mono text-text-secondary">
                  <div className="p-2 bg-brand-secondary/10 rounded">brand-primary: primary-400</div>
                  <div className="p-2 bg-brand-secondary/10 rounded">text-primary: primary-100</div>
                  <div className="p-2 bg-brand-secondary/10 rounded">surface-default: primary-950</div>
                </div>
              </div>
            </div>
          </div>
          <div className="text-3xl text-text-muted">→</div>
        </div>

        {/* Stage 4: Application */}
        <div className="flex-1 p-6 bg-surface-primary rounded-lg shadow-md border-2 border-brand-accent">
          <h3 className="text-lg font-bold text-text-primary mb-2">4. Application</h3>
          <p className="text-sm text-text-secondary mb-4">
            Tokens applied via Tailwind utilities and CSS variables
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-brand-accent/10 rounded border border-brand-accent/30">
              <p className="font-mono text-xs text-text-primary mb-1">Tailwind Utilities</p>
              <code className="text-xs text-text-secondary">
                className="bg-brand-primary text-on-brand"
              </code>
            </div>
            <div className="p-3 bg-brand-accent/10 rounded border border-brand-accent/30">
              <p className="font-mono text-xs text-text-primary mb-1">CSS Variables</p>
              <code className="text-xs text-text-secondary">
                var(--brand-primary-val) → dynamically generated
              </code>
            </div>
            <div className="p-3 bg-brand-accent/10 rounded border border-brand-accent/30">
              <p className="font-mono text-xs text-text-primary mb-1">Dark Mode Override</p>
              <code className="text-xs text-text-secondary">
                [data-mode="dark"] var(--brand-primary-val) → dynamically generated
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// shadcn/ui compatibility bridge explanation
const ShadcnCompatibilityBridge = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-text-primary">shadcn/ui Compatibility Bridge</h3>
      <p className="text-sm text-text-secondary">
        The semantic token mapping provides automatic compatibility with shadcn/ui components through aliasing.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* shadcn/ui expected tokens */}
        <div className="p-6 bg-surface-muted rounded-lg border border-border-default">
          <h4 className="font-semibold text-text-primary mb-4">shadcn/ui Expects</h4>
          <div className="space-y-2 font-mono text-xs text-text-secondary">
            <div className="p-2 bg-surface-primary rounded border border-border-default">--primary</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--primary-foreground</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--background</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--foreground</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--muted</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--border</div>
          </div>
        </div>

        {/* Our semantic tokens */}
        <div className="p-6 bg-brand-primary/10 rounded-lg border border-brand-primary/30">
          <h4 className="font-semibold text-text-primary mb-4">Our Semantic Tokens</h4>
          <div className="space-y-2 font-mono text-xs text-text-secondary">
            <div className="p-2 bg-surface-primary rounded border border-border-default">--brand-primary-val</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--text-on-brand-val</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--surface-default-val</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--text-primary-val</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--surface-muted-val</div>
            <div className="p-2 bg-surface-primary rounded border border-border-default">--border-default-val</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-status-success/10 rounded-lg border border-status-success/30">
        <h5 className="font-semibold text-text-primary mb-2">Bridge Implementation</h5>
        <pre className="text-xs text-text-secondary overflow-x-auto">
{`:root {
  /* shadcn/ui aliases → our semantic tokens */
  --primary: var(--brand-primary-val);
  --primary-foreground: var(--text-on-brand-val);
  --background: var(--surface-default-val);
  --foreground: var(--text-primary-val);
  --muted: var(--surface-muted-val);
  --border: var(--border-default-val);
}`}
        </pre>
      </div>

      <p className="text-sm text-text-secondary italic">
        This allows shadcn/ui components to work out-of-the-box while maintaining our semantic naming convention for custom components.
      </p>
    </div>
  );
};

export const Overview: Story = {
  render: () => (
    <div className="p-8 space-y-12 bg-surface-muted">
      {/* INTRODUCTION */}
      <section className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Design Tokens & Palette Generation
        </h1>
        <p className="text-lg text-text-secondary mb-6">
          The complete architecture powering hotel website theming with minimal configuration and maximum consistency.
        </p>
        <div className="p-6 bg-brand-primary/10 rounded-lg border border-brand-primary/30">
          <p className="text-sm text-text-primary">
            <strong>Core Principle:</strong> Hotels provide 2-5 OKLCH base colors. The system automatically generates
            55 shades across 5 color families, maps them to semantic tokens for light/dark modes, and validates
            accessibility via APCA contrast checking.
          </p>
        </div>
      </section>

      {/* ARCHITECTURE DIAGRAM */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Palette Generation Architecture</h2>
        <ArchitectureDiagram />
      </section>

      {/* SEMANTIC TOKEN MAPPING TABLE */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Semantic Token Mapping</h2>
        <p className="text-sm text-text-secondary mb-4">
          How generated shade scales map to semantic tokens for light and dark modes.
        </p>

        <div className="bg-surface-primary rounded-lg border border-border-default overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-surface-muted border-b border-border-strong font-semibold text-sm text-text-primary">
            <div>Token Name</div>
            <div>☀️ Light Mode</div>
            <div>🌙 Dark Mode</div>
            <div>Usage</div>
          </div>

          {/* Brand tokens */}
          <SemanticMappingRow
            tokenName="brand-primary"
            lightMode="primary-700"
            darkMode="primary-400"
            usage="Headers, buttons, primary CTAs"
          />
          <SemanticMappingRow
            tokenName="brand-primary-hover"
            lightMode="primary-800"
            darkMode="primary-300"
            usage="Hover state for primary brand elements"
          />
          <SemanticMappingRow
            tokenName="brand-secondary"
            lightMode="secondary-600"
            darkMode="secondary-400"
            usage="Secondary CTAs, accents"
          />
          <SemanticMappingRow
            tokenName="brand-secondary-hover"
            lightMode="secondary-700"
            darkMode="secondary-300"
            usage="Hover state for secondary brand elements"
          />

          {/* Text tokens */}
          <SemanticMappingRow
            tokenName="text-primary"
            lightMode="primary-900"
            darkMode="primary-100"
            usage="Headings, primary body text"
          />
          <SemanticMappingRow
            tokenName="text-secondary"
            lightMode="primary-700"
            darkMode="primary-300"
            usage="Supporting text, descriptions"
          />
          <SemanticMappingRow
            tokenName="text-muted"
            lightMode="primary-500"
            darkMode="primary-500"
            usage="Labels, captions, less emphasis"
          />
          <SemanticMappingRow
            tokenName="text-on-brand"
            lightMode="primary-50"
            darkMode="primary-50"
            usage="Text on brand color backgrounds"
          />

          {/* Surface tokens */}
          <SemanticMappingRow
            tokenName="surface-default"
            lightMode="primary-50"
            darkMode="primary-950"
            usage="Page backgrounds, default surfaces"
          />
          <SemanticMappingRow
            tokenName="surface-elevated"
            lightMode="white (oklch(1 0 0))"
            darkMode="primary-900"
            usage="Cards, modals, elevated elements"
          />
          <SemanticMappingRow
            tokenName="surface-muted"
            lightMode="primary-100"
            darkMode="primary-900"
            usage="Secondary backgrounds"
          />

          {/* Border tokens */}
          <SemanticMappingRow
            tokenName="border-default"
            lightMode="primary-200"
            darkMode="primary-800"
            usage="Default borders, dividers"
          />
          <SemanticMappingRow
            tokenName="border-strong"
            lightMode="primary-300"
            darkMode="primary-700"
            usage="Strong emphasis borders"
          />

          {/* Status tokens */}
          <SemanticMappingRow
            tokenName="status-success"
            lightMode="success-700"
            darkMode="success-400"
            usage="Success states, confirmations"
          />
          <SemanticMappingRow
            tokenName="status-error"
            lightMode="error-700"
            darkMode="error-400"
            usage="Error states, validation failures"
          />
        </div>

        <div className="mt-4 p-4 bg-brand-secondary/10 rounded-lg border border-brand-secondary/30">
          <p className="text-sm text-text-primary">
            <strong>Note:</strong> The actual shade used for each token is determined by the{' '}
            <code className="bg-surface-primary px-1 py-0.5 rounded">semantic-mapper.ts</code> module based on accessibility
            and visual hierarchy requirements.
          </p>
        </div>
      </section>

      {/* HOTEL BASE COLOR CONFIG */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Hotel Base Color Configuration</h2>
        <p className="text-sm text-text-secondary mb-4">
          Hotels configure their brand colors via a simple OKLCH config. Missing optional colors get sensible defaults.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Required */}
          <div className="p-6 bg-status-error/10 rounded-lg border border-status-error/30">
            <h3 className="font-semibold text-text-primary mb-4">Required (2 colors)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-surface-primary rounded border border-border-default">
                <div className="font-semibold text-text-primary mb-1">brandPrimary</div>
                <code className="text-text-secondary">oklch(0.346 0.074 256)</code>
                <p className="text-xs text-text-muted mt-1">Primary brand identity color</p>
              </div>
              <div className="p-3 bg-surface-primary rounded border border-border-default">
                <div className="font-semibold text-text-primary mb-1">brandSecondary</div>
                <code className="text-text-secondary">oklch(0.748 0.099 86.1)</code>
                <p className="text-xs text-text-muted mt-1">Secondary brand accent color</p>
              </div>
            </div>
          </div>

          {/* Optional */}
          <div className="p-6 bg-brand-primary/10 rounded-lg border border-brand-primary/30">
            <h3 className="font-semibold text-text-primary mb-4">Optional (3 colors)</h3>
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-surface-primary rounded border border-border-default">
                <div className="font-semibold text-text-primary mb-1">brandAccent</div>
                <code className="text-text-secondary">oklch(0.65 0.15 200)</code>
                <p className="text-xs text-text-muted mt-1">Defaults to complementary hue (+180°)</p>
              </div>
              <div className="p-3 bg-surface-primary rounded border border-border-default">
                <div className="font-semibold text-text-primary mb-1">statusSuccess</div>
                <code className="text-text-secondary">oklch(0.448 0.108 151.3)</code>
                <p className="text-xs text-text-muted mt-1">Defaults to green hue 150</p>
              </div>
              <div className="p-3 bg-surface-primary rounded border border-border-default">
                <div className="font-semibold text-text-primary mb-1">statusError</div>
                <code className="text-text-secondary">oklch(0.577 0.215 27.3)</code>
                <p className="text-xs text-text-muted mt-1">Defaults to red hue 27</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-status-success/10 rounded-lg border border-status-success/30">
          <h4 className="font-semibold text-text-primary mb-2">OKLCH Format</h4>
          <p className="text-sm text-text-secondary mb-2">
            <code className="bg-surface-primary px-1 py-0.5 rounded">oklch(L C H)</code> where:
          </p>
          <ul className="text-sm text-text-secondary space-y-1 list-disc list-inside ml-4">
            <li><strong>L</strong> (Lightness): 0-1 (0 = black, 1 = white)</li>
            <li><strong>C</strong> (Chroma): 0-0.4+ (0 = gray, higher = more vivid)</li>
            <li><strong>H</strong> (Hue): 0-360 degrees (color wheel angle)</li>
          </ul>
        </div>
      </section>

      {/* SHADCN COMPATIBILITY */}
      <section>
        <ShadcnCompatibilityBridge />
      </section>

      {/* KEY BENEFITS */}
      <section className="p-6 bg-gradient-to-br from-brand-primary/5 to-brand-accent/5 rounded-lg border border-border-default">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Key Benefits</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎨</span>
              <div>
                <h4 className="font-semibold text-text-primary">Minimal Configuration</h4>
                <p className="text-sm text-text-secondary">
                  Hotels configure 2-5 base colors instead of 50+ individual tokens
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌓</span>
              <div>
                <h4 className="font-semibold text-text-primary">Automatic Dark Mode</h4>
                <p className="text-sm text-text-secondary">
                  Semantic tokens automatically adapt to light/dark modes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">👁️</span>
              <div>
                <h4 className="font-semibold text-text-primary">Perceptual Uniformity</h4>
                <p className="text-sm text-text-secondary">
                  OKLCH ensures colors appear evenly spaced to human vision
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🖥️</span>
              <div>
                <h4 className="font-semibold text-text-primary">Gamut Safety</h4>
                <p className="text-sm text-text-secondary">
                  All colors clamped to sRGB display gamut for consistent rendering
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">♿</span>
              <div>
                <h4 className="font-semibold text-text-primary">Accessibility Available</h4>
                <p className="text-sm text-text-secondary">
                  APCA contrast measurement available in contrast-validator.ts (pipeline integration planned)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔌</span>
              <div>
                <h4 className="font-semibold text-text-primary">shadcn/ui Compatible</h4>
                <p className="text-sm text-text-secondary">
                  Semantic token bridge enables drop-in shadcn/ui component usage
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED DOCUMENTATION */}
      <section className="p-6 bg-surface-muted rounded-lg border border-border-default">
        <h2 className="text-xl font-bold text-text-primary mb-4">Related Documentation</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-text-primary mb-2">Stories</h4>
            <ul className="space-y-1 text-text-secondary">
              <li>• Story 1.11: Design Token Definitions</li>
              <li>• Story 12.1: Storybook Setup</li>
              <li>• Story 12.2: Design System Docs</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-2">API Reference</h4>
            <ul className="space-y-1 text-text-secondary">
              <li>• <code className="text-xs">lib/color/palette-generator.ts</code></li>
              <li>• <code className="text-xs">lib/color/semantic-mapper.ts</code></li>
              <li>• <code className="text-xs">lib/color/contrast-validator.ts</code></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-2">Interactive Examples</h4>
            <ul className="space-y-1 text-text-secondary">
              <li>• Color Palette Story (interactive hue picker)</li>
              <li>• Live theme mode previews</li>
              <li>• APCA contrast validation panel</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  ),
};
