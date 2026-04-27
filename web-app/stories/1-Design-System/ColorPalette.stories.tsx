'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import {
  generateFullTheme,
  validateThemeContrast,
  calculateAPCA,
  SHADE_STEPS,
  type HotelBaseColors,
  type GeneratedTheme,
  type ShadeStep,
} from '@/lib/color';
import { DEFAULT_BASE_COLORS } from './_demo-tokens';

const meta: Meta = {
  title: 'Design System/Color Palette',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**Dynamic OKLCH Color Palette Generator**

This story demonstrates the automated palette generation system that powers hotel website theming.
Hotels provide 2-5 base OKLCH colors, and the system generates complete 11-shade scales for all color families.

## Key Features

- **11-shade scales**: Tailwind-compatible (50-950) for each color family
- **OKLCH color space**: Perceptually uniform, gamut-safe colors
- **Light + Dark modes**: Automatic semantic token mapping
- **Contrast validation**: APCA-based accessibility checking
- **Interactive controls**: Adjust base colors and see live updates

## Architecture

Input (2-5 OKLCH base colors) → Generation (11 shades × 5 families) → Mapping (semantic tokens) → Application (Tailwind utilities)
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Color swatch component showing individual shade
// Note: Inline styles used here for dynamic color generation demo (design system exception)
interface ShadeSwatchProps {
  label: string;
  color: string;
  shade?: ShadeStep;
}

const ShadeSwatch = ({ label, color, shade }: ShadeSwatchProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 rounded-lg shadow-md border border-border-default"
        style={{ backgroundColor: color } as React.CSSProperties}
      />
      <div className="text-center">
        <p className="font-mono text-xs font-semibold text-text-primary">{label}</p>
        {shade && <p className="font-mono text-xs text-text-muted">{shade}</p>}
        <p className="font-mono text-xs text-text-secondary mt-1">{color}</p>
      </div>
    </div>
  );
};

// Full palette display for a single color family
interface PaletteRowProps {
  familyName: string;
  shades: Record<ShadeStep, string>;
}

const PaletteRow = ({ familyName, shades }: PaletteRowProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary capitalize">{familyName}</h3>
      <div className="grid grid-cols-11 gap-2">
        {SHADE_STEPS.map((step) => (
          <ShadeSwatch
            key={step}
            label={familyName}
            shade={step}
            color={shades[step]}
          />
        ))}
      </div>
    </div>
  );
};

// Theme mode preview component
// Note: Inline styles used for dynamic theme colors (design system demo exception)
// The colors are runtime-generated from palette generator, not semantic tokens
interface ThemeModePreviewProps {
  theme: GeneratedTheme;
}

const ThemeModePreview = ({ theme }: ThemeModePreviewProps) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const tokens = mode === 'light' ? theme.light : theme.dark;

  // Helper for dynamic color styles
  const getPreviewStyle = (backgroundColor?: string, borderColor?: string, color?: string): React.CSSProperties => ({
    ...(backgroundColor && { backgroundColor }),
    ...(borderColor && { borderColor }),
    ...(color && { color }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-semibold text-text-primary">Theme Mode Preview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('light')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'light'
                ? 'bg-brand-primary text-on-brand'
                : 'bg-surface-muted text-text-primary hover:bg-surface-secondary'
            }`}
          >
            Light Mode
          </button>
          <button
            onClick={() => setMode('dark')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'dark'
                ? 'bg-brand-primary text-on-brand'
                : 'bg-surface-muted text-text-primary hover:bg-surface-secondary'
            }`}
          >
            Dark Mode
          </button>
        </div>
      </div>

      <div
        className="p-8 rounded-lg border-2"
        style={getPreviewStyle(tokens['surface-default'], tokens['border-default'], tokens['text-primary'])}
      >
        <div className="space-y-6">
          {/* Header */}
          <div
            className="p-6 rounded-lg"
            style={getPreviewStyle(tokens['brand-primary'], undefined, tokens['text-on-brand'])}
          >
            <h1 className="text-2xl font-bold">Hotel Website Header</h1>
            <p className="text-sm opacity-90">Powered by dynamic OKLCH theming</p>
          </div>

          {/* Content card */}
          <div
            className="p-6 rounded-lg border"
            style={getPreviewStyle(tokens['surface-elevated'], tokens['border-default'])}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: tokens['text-primary'] } as React.CSSProperties}
            >
              Content Section
            </h2>
            <p style={{ color: tokens['text-secondary'] } as React.CSSProperties}>
              This is secondary text demonstrating the semantic token mapping.
            </p>
            <p className="text-sm mt-2" style={{ color: tokens['text-muted'] } as React.CSSProperties}>
              Muted text for less important information.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={getPreviewStyle(tokens['interactive-primary'], undefined, tokens['text-on-brand'])}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens['interactive-primary-hover'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens['interactive-primary'];
              }}
            >
              Primary Button
            </button>
            <button
              className="px-6 py-3 rounded-lg font-medium transition-colors"
              style={getPreviewStyle(tokens['brand-secondary'], undefined, tokens['text-on-brand'])}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens['brand-secondary-hover'];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens['brand-secondary'];
              }}
            >
              Secondary Button
            </button>
          </div>

          {/* Status indicators */}
          <div className="grid grid-cols-3 gap-4">
            {(['success', 'warning', 'error'] as const).map((status) => (
              <div
                key={status}
                className="p-4 rounded-lg"
                style={getPreviewStyle(tokens[`status-${status}`], undefined, tokens['text-on-brand'])}
              >
                <p className="font-medium capitalize">{status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Contrast validation panel
interface ContrastPanelProps {
  theme: GeneratedTheme;
}

const ContrastPanel = ({ theme }: ContrastPanelProps) => {
  const report = validateThemeContrast(theme);
  const lightPairs = report.pairs.filter((p) => !p.tokenPair.includes('[Dark]'));
  const darkPairs = report.pairs.filter((p) => p.tokenPair.includes('[Dark]'));

  const lightFailCount = lightPairs.filter(p => !p.result.passes).length;
  const darkFailCount = darkPairs.filter(p => !p.result.passes).length;

  const lightReport = {
    pairs: lightPairs,
    allPass: lightFailCount === 0,
    failCount: lightFailCount,
  };
  const darkReport = {
    pairs: darkPairs,
    allPass: darkFailCount === 0,
    failCount: darkFailCount,
  };

  const renderContrastRow = (
    pair: typeof lightReport.pairs[0],
    mode: 'light' | 'dark'
  ) => {
    const { tokenPair, foreground, background, result } = pair;
    const levelColor =
      result.level === 'AAA' ? 'text-status-success' :
      result.level === 'AA' ? 'text-status-warning' :
      'text-status-error';

    return (
      <div
        key={`${mode}-${tokenPair}`}
        className="flex items-center gap-4 p-3 border-b border-border-default last:border-b-0"
      >
        <div className="flex-1">
          <p className="font-mono text-sm font-medium text-text-primary">{tokenPair}</p>
          <p className="font-mono text-xs text-text-muted">
            {mode === 'light' ? '☀️' : '🌙'} {mode}
          </p>
        </div>
        <div className="flex gap-2">
          <div
            className="w-8 h-8 rounded border border-border-strong"
            style={{ backgroundColor: foreground }}
            title="Foreground"
          />
          <div
            className="w-8 h-8 rounded border border-border-strong"
            style={{ backgroundColor: background }}
            title="Background"
          />
        </div>
        <div className="text-right min-w-[100px]">
          <p className={`font-mono text-sm font-semibold ${levelColor}`}>
            Lc {result.contrast.toFixed(1)}
          </p>
          <p className={`text-xs ${levelColor}`}>{result.level}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Contrast Validation</h3>
      <p className="text-sm text-text-secondary">
        APCA contrast scores for key text/background pairs. AAA (Lc ≥ 75) is ideal, AA (Lc ≥ 60) is acceptable.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Light mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-text-secondary">☀️ Light Mode</h4>
            <span
              className={`text-sm font-medium ${
                lightReport.allPass ? 'text-status-success' : 'text-status-error'
              }`}
            >
              {lightReport.allPass ? '✓ All Pass' : `✗ ${lightReport.failCount} Fail`}
            </span>
          </div>
          <div className="bg-surface-primary rounded-lg border border-border-default overflow-hidden">
            {lightReport.pairs.map((pair) => renderContrastRow(pair, 'light'))}
          </div>
        </div>

        {/* Dark mode */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-text-secondary">🌙 Dark Mode</h4>
            <span
              className={`text-sm font-medium ${
                darkReport.allPass ? 'text-status-success' : 'text-status-error'
              }`}
            >
              {darkReport.allPass ? '✓ All Pass' : `✗ ${darkReport.failCount} Fail`}
            </span>
          </div>
          <div className="bg-surface-primary rounded-lg border border-border-default overflow-hidden">
            {darkReport.pairs.map((pair) => renderContrastRow(pair, 'dark'))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main story component with interactive controls
interface GeneratedPaletteProps {
  brandPrimary: string;
  brandSecondary: string;
  brandAccent?: string;
  statusSuccess?: string;
  statusError?: string;
}

const GeneratedPaletteStory = ({
  brandPrimary,
  brandSecondary,
  brandAccent,
  statusSuccess,
  statusError,
}: GeneratedPaletteProps) => {
  const baseColors: HotelBaseColors = {
    brandPrimary,
    brandSecondary,
    brandAccent,
    statusSuccess,
    statusError,
  };

  const theme = generateFullTheme(baseColors);

  return (
    <div className="p-8 space-y-12 bg-surface-muted">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          Dynamic OKLCH Palette Generator
        </h1>
        <p className="text-text-secondary">
          Adjust the base OKLCH colors below to see the generated shade scales update in real-time.
        </p>
      </div>

      {/* Generated Palettes */}
      <section className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-4">Generated Shade Scales</h2>
          <p className="text-sm text-text-secondary mb-6">
            Each color family generates an 11-shade scale (50-950) optimized for sRGB gamut and perceptual uniformity.
          </p>
        </div>
        <PaletteRow familyName="primary" shades={theme.palettes.primary} />
        <PaletteRow familyName="secondary" shades={theme.palettes.secondary} />
        <PaletteRow familyName="accent" shades={theme.palettes.accent} />
        <PaletteRow familyName="success" shades={theme.palettes.success} />
        <PaletteRow familyName="error" shades={theme.palettes.error} />
      </section>

      {/* Theme Mode Preview */}
      <section>
        <ThemeModePreview theme={theme} />
      </section>

      {/* Contrast Validation */}
      <section>
        <ContrastPanel theme={theme} />
      </section>

      {/* Architecture Explanation */}
      <section className="p-6 bg-surface-elevated rounded-lg border border-border-default">
        <h2 className="text-2xl font-bold text-text-primary mb-4">How It Works</h2>
        <div className="space-y-4 text-sm text-text-secondary">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-brand-primary/10 rounded-lg border border-brand-primary/30">
              <h3 className="font-semibold text-text-primary mb-2">1. Input</h3>
              <p className="text-text-secondary">
                Hotels provide 2-5 OKLCH base colors via config
              </p>
            </div>
            <div className="p-4 bg-status-success/10 rounded-lg border border-status-success/30">
              <h3 className="font-semibold text-text-primary mb-2">2. Generation</h3>
              <p className="text-text-secondary">
                11 shades per family via lightness distribution
              </p>
            </div>
            <div className="p-4 bg-brand-secondary/10 rounded-lg border border-brand-secondary/30">
              <h3 className="font-semibold text-text-primary mb-2">3. Mapping</h3>
              <p className="text-text-secondary">
                Shades mapped to semantic tokens (light + dark)
              </p>
            </div>
            <div className="p-4 bg-brand-accent/10 rounded-lg border border-brand-accent/30">
              <h3 className="font-semibold text-text-primary mb-2">4. Application</h3>
              <p className="text-text-secondary">
                Tokens applied via Tailwind utilities
              </p>
            </div>
          </div>

          <div className="p-4 bg-surface-muted rounded-lg">
            <h4 className="font-semibold text-text-primary mb-2">Key Benefits</h4>
            <ul className="space-y-1 text-text-secondary list-disc list-inside">
              <li>Hotels only configure 2-5 base colors, not 50+ tokens</li>
              <li>Automatic light/dark mode semantic token mapping</li>
              <li>OKLCH ensures perceptual uniformity and gamut safety</li>
              <li>APCA contrast measurement available (test-only, pipeline integration planned)</li>
              <li>shadcn/ui compatibility via semantic token bridge</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export const InteractivePalette: Story = {
  render: (args) => <GeneratedPaletteStory {...(args as GeneratedPaletteProps)} />,
  args: {
    brandPrimary: DEFAULT_BASE_COLORS.brandPrimary,
    brandSecondary: DEFAULT_BASE_COLORS.brandSecondary,
    brandAccent: DEFAULT_BASE_COLORS.brandAccent,
    statusSuccess: DEFAULT_BASE_COLORS.statusSuccess,
    statusError: DEFAULT_BASE_COLORS.statusError,
  },
  argTypes: {
    brandPrimary: {
      control: 'text',
      description: 'Primary brand color in OKLCH format (e.g., oklch(0.5 0.2 250))',
    },
    brandSecondary: {
      control: 'text',
      description: 'Secondary brand color in OKLCH format',
    },
    brandAccent: {
      control: 'text',
      description: 'Accent color (optional, defaults to complementary of primary)',
    },
    statusSuccess: {
      control: 'text',
      description: 'Success status color (optional, defaults to green hue 150)',
    },
    statusError: {
      control: 'text',
      description: 'Error status color (optional, defaults to red hue 27)',
    },
  },
};
