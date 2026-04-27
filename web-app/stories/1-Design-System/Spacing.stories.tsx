import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Spacing',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**Spacing System from Story 1.11**

This story documents all spacing tokens used for consistent layout across hotel websites.

## Spacing Philosophy

All spacing uses **fluid responsive values** via \`clamp()\`:
- Automatically scales between viewports
- No manual breakpoint management needed
- Ensures optimal spacing at all screen sizes

## Semantic Spacing Tokens

- **p-section**: \`clamp(2rem, 5vw, 4rem)\` - Section-level padding
- **p-container**: \`clamp(1rem, 5vw, 2rem)\` - Container padding

Use these semantic tokens instead of fixed padding values for responsive layouts.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Spacing box component for visual demonstration
// Size to Tailwind class mapping (rem to w/h values)
const SIZE_CLASS_MAP: Record<string, string> = {
  '0.25rem': 'w-1 h-1',
  '0.5rem': 'w-2 h-2',
  '0.75rem': 'w-3 h-3',
  '1rem': 'w-4 h-4',
  '1.5rem': 'w-6 h-6',
  '2rem': 'w-8 h-8',
  '2.5rem': 'w-10 h-10',
  '3rem': 'w-12 h-12',
  '4rem': 'w-16 h-16',
  '5rem': 'w-20 h-20',
  '6rem': 'w-24 h-24',
};

const SpacingBox = ({
  size,
  label,
  description,
  useTailwind = false,
}: {
  size: string;
  label: string;
  description: string;
  useTailwind?: boolean;
}) => {
  const sizeClass = SIZE_CLASS_MAP[size] || 'w-4 h-4';
  return (
    <div className="flex items-center gap-4 mb-4">
      {useTailwind ? (
        <div className={`bg-brand-primary/30 rounded ${sizeClass}`} />
      ) : (
        <div className={`bg-brand-primary rounded ${sizeClass}`} />
      )}
      <div>
        <p className="font-mono text-sm text-text-primary">{label}</p>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>
    </div>
  );
};

// Container demo for showing padding in context
const ContainerDemo = ({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children: React.ReactNode;
}) => (
  <div className="border-2 border-brand-primary border-dashed p-2 mb-6 bg-surface-default">
    <p className="text-text-muted text-xs mb-2 font-mono">{label}</p>
    <p className="text-text-secondary text-sm mb-2">{className}</p>
    <div className={className}>{children}</div>
  </div>
);

export const SpacingSystem: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-text-primary">Spacing System</h2>
      <p className="text-text-secondary">
        Fluid spacing tokens for consistent, responsive layouts across all hotel websites.
      </p>

      {/* SECTION SPACING */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Section Spacing
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          <strong>p-section</strong> provides fluid section-level padding.
          Scales from 2rem (32px) on small screens to 4rem (64px) on large screens.
        </p>
        <ContainerDemo
          label="Semantic Token"
          className="p-section border border-border-default rounded-lg bg-surface-elevated"
        >
          <p className="text-text-secondary">
            This section uses <code className="bg-surface-muted px-1 py-0.5 rounded text-text-primary">p-section</code>{' '}
            for consistent section spacing across all page sections.
          </p>
        </ContainerDemo>
      </section>

      {/* CONTAINER SPACING */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Container Spacing
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          <strong>p-container</strong> provides fluid container padding.
          Scales from 1rem (16px) on small screens to 2rem (32px) on large screens.
        </p>
        <ContainerDemo
          label="Semantic Token"
          className="p-container border border-border-default rounded-lg bg-surface-muted"
        >
          <p className="text-text-secondary">
            Containers use <code className="bg-surface-default px-1 py-0.5 rounded text-text-primary">p-container</code>{' '}
            for content padding within max-width containers.
          </p>
        </ContainerDemo>
      </section>

      {/* STANDARD SPACING SCALE */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Standard Spacing Scale (Tailwind)
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          Tailwind's default spacing scale for consistent spacing throughout the UI.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <SpacingBox size="0.25rem" label="space-y-1" description="2px - Micro spacing" />
            <SpacingBox size="0.5rem" label="space-y-2" description="4px - Tight spacing" />
            <SpacingBox size="0.75rem" label="space-y-3" description="6px - Compact spacing" />
          </div>
          <div className="text-center">
            <SpacingBox size="1rem" label="space-y-4" description="8px - Base spacing" />
            <SpacingBox size="1.5rem" label="space-y-6" description="12px - Medium spacing" />
            <SpacingBox size="2rem" label="space-y-8" description="16px - Large spacing" />
          </div>
          <div className="text-center">
            <SpacingBox size="2.5rem" label="space-y-10" description="20px - XLarge spacing" />
            <SpacingBox size="3rem" label="space-y-12" description="24px - XXLarge spacing" />
            <SpacingBox size="4rem" label="space-y-16" description="32px - 2XLarge spacing" />
          </div>
          <div className="text-center">
            <SpacingBox size="5rem" label="space-y-20" description="40px - XXXLarge spacing" />
            <SpacingBox size="6rem" label="space-y-24" description="48px - XXXXLarge spacing" />
          </div>
        </div>
      </section>

      {/* COMMON SPACING PATTERNS */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Common Spacing Patterns
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          Frequently used spacing combinations in hotel components.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Gap patterns */}
          <div className="p-6 border border-border-default rounded-lg bg-surface-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-3">Gap Patterns (Grid)</h4>
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 h-8 bg-brand-primary/10 rounded"></div>
                <div className="flex-1 h-8 bg-brand-primary/10 rounded"></div>
              </div>
              <p className="font-mono text-xs text-text-muted">gap-4</p>
              <p className="text-text-secondary text-xs">Card grids, room lists</p>

              <div className="flex gap-6">
                <div className="flex-1 h-8 bg-brand-primary/10 rounded"></div>
                <div className="flex-1 h-8 bg-brand-primary/10 rounded"></div>
                <div className="flex-1 h-8 bg-brand-primary/10 rounded"></div>
              </div>
              <p className="font-mono text-xs text-text-muted">gap-6</p>
              <p className="text-text-secondary text-xs">Section content</p>

              <div className="flex gap-8">
                <div className="flex-1 h-8 bg-brand-primary/10 rounded"></div>
                <div className="flex-1 h-8 bg-brand-primary/10 rounded"></div>
              </div>
              <p className="font-mono text-xs text-text-muted">gap-8</p>
              <p className="text-text-secondary text-xs">Major sections</p>
            </div>
          </div>

          {/* Padding patterns */}
          <div className="p-6 border border-border-default rounded-lg bg-surface-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-3">Padding Patterns</h4>
            <div className="space-y-3">
              <div className="p-4 bg-surface-muted rounded border border-border-default">
                <p className="font-mono text-xs text-text-muted">p-4</p>
                <p className="text-text-secondary text-xs">Card padding</p>
              </div>
              <div className="p-6 bg-surface-elevated rounded-lg border border-border-default">
                <p className="font-mono text-xs text-text-muted">p-6</p>
                <p className="text-text-secondary text-xs">Section padding</p>
              </div>
              <div className="my-8 border-t border-border-default pt-4">
                <p className="font-mono text-xs text-text-muted">my-8</p>
                <p className="text-text-secondary text-xs">Vertical section rhythm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LAYOUT PATTERNS */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Layout Patterns
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          Standard layout patterns used across hotel website components.
        </p>
        <div className="space-y-4">
          {/* Max-width container */}
          <div className="p-6 border border-border-default rounded-lg bg-surface-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-2">
              max-w-7xl mx-auto
            </h4>
            <div className="max-w-7xl mx-auto bg-surface-muted p-4 rounded border border-border-default">
              <p className="text-text-secondary text-sm">
                Centered container with maximum width of 80rem (1280px).
                Used for main content areas.
              </p>
            </div>
          </div>

          {/* Responsive padding */}
          <div className="p-6 border border-border-default rounded-lg bg-surface-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-2">
              Responsive Padding
            </h4>
            <p className="text-text-secondary text-sm mb-3">
              Progressive padding based on viewport:
            </p>
            <div className="flex gap-4 text-xs font-mono text-text-muted">
              <span>px-4 (Mobile)</span>
              <span>→</span>
              <span>md:px-6 (Tablet)</span>
              <span>→</span>
              <span>lg:px-8 (Desktop)</span>
            </div>
            <div className="mt-3 p-4 bg-surface-muted rounded border border-border-default">
              <p className="text-text-secondary text-sm">
                This demonstrates responsive padding that increases on larger screens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ANTI-PATTERNS */}
      <section className="mt-8 p-6 bg-surface-muted rounded-lg border border-border-default">
        <h4 className="text-lg font-semibold text-text-primary mb-2">Anti-Patterns to Avoid</h4>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>
            <strong>❌ Don't use fixed padding values</strong> like <code className="bg-surface-default px-2 py-3 rounded text-text-primary">padding: 8px 12px</code>
            - Use semantic tokens instead: <code className="bg-surface-default px-2 py-3 rounded text-text-primary">p-container</code>
          </li>
          <li>
            <strong>❌ Don't use magic numbers for gaps</strong> like <code className="bg-surface-default px-2 py-3 rounded text-text-primary">gap: 37px</code>
            - Use Tailwind scale: <code className="bg-surface-default px-2 py-3 rounded text-text-primary">gap-4</code>
          </li>
          <li>
            <strong>❌ Don't mix spacing systems</strong> - Use either Tailwind classes OR semantic tokens, not both in the same context
          </li>
          <li>
            <strong>✅ Always use semantic spacing tokens</strong> (p-section, p-container) for layout-level padding
          </li>
        </ul>
      </section>

      {/* RESPONSIVE BEHAVIOR NOTE */}
      <section className="p-6 bg-surface-elevated rounded-lg border border-border-default">
        <h4 className="text-base font-semibold text-text-primary mb-2">📱 Responsive Behavior</h4>
        <p className="text-text-secondary text-sm">
          The <code>clamp()</code> function automatically calculates optimal spacing between the minimum (2rem),
          preferred (5vw), and maximum (4rem) values based on viewport width.
        </p>
        <p className="text-text-muted text-xs mt-2">
          <strong>Mobile (375px):</strong> ~2.2rem
          <strong>Tablet (768px):</strong> ~2.8rem
          <strong>Desktop (1280px):</strong> ~3.5rem
          <strong>Wide (1920px):</strong> ~4rem
        </p>
      </section>
    </div>
  ),
};
