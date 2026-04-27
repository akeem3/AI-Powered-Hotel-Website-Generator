import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

const meta: Meta = {
  title: 'Design System/Shadows & Borders',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**Shadows and Borders from Story 1.11**

This story documents all shadow and border radius tokens used for depth and visual hierarchy.

## Shadow Scale

- **shadow-sm**: \`0 1px 2px 0 rgb(0 0 0 / 0.05)\` - Subtle elevation
- **shadow-md**: \`0 4px 6px -1px rgb(0 0 0 / 0.1)\` - Medium elevation (default)
- **shadow-lg**: \`0 10px 15px -3px rgb(0 0 0 / 0.1)\` - Large elevation
- **shadow-card**: Alias for shadow-md - Card elevation
- **shadow-card-hover**: Alias for shadow-lg - Hover state elevation

## Border Radius Scale

- **rounded-sm**: \`0.25rem\` (4px) - Small radius
- **rounded-md**: \`0.5rem\` (8px) - Medium radius (default)
- **rounded-lg**: \`0.75rem\` (12px) - Large radius
- **rounded-xl**: \`1rem\` (16px) - Extra large radius
- **rounded-2xl**: \`1.5rem\` (24px) - 2X large radius
- **rounded-full**: \`9999px\` - Pill/circle shape
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Shadow showcase component with detailed information
const ShadowShowcase = ({
  shadow,
  label,
  description,
  value,
}: {
  shadow: string;
  label: string;
  description: string;
  value: string;
}) => (
  <div className="flex flex-col items-center p-6">
    <div className={`w-32 h-32 bg-surface-default border border-border-default ${shadow} flex items-center justify-center mb-4`}>
      <span className="text-text-secondary text-sm">Preview</span>
    </div>
    <p className="font-mono text-sm font-semibold text-text-primary">{label}</p>
    <p className="text-text-secondary text-xs text-center mt-1">{description}</p>
    <p className="text-text-muted text-xs font-mono mt-2">{value}</p>
  </div>
);

// Radius showcase component
const RadiusShowcase = ({
  radius,
  label,
  value,
  width = 'w-24',
}: {
  radius: string;
  label: string;
  value: string;
  width?: string;
}) => (
  <div className="flex flex-col items-center p-4">
    <div className={`${width} h-24 bg-surface-elevated border border-border-default ${radius} flex items-center justify-center mb-3`}>
      <span className="text-text-secondary text-xs">{label}</span>
    </div>
    <p className="font-mono text-xs text-text-muted">{value}</p>
  </div>
);

// Interactive card with hover transition
const HoverCard = ({
  shadow,
  radius,
  label,
}: {
  shadow: string;
  radius: string;
  label: string;
}) => (
  <div className={`p-6 bg-surface-default border border-border-default ${radius} ${shadow} transition-shadow duration-300 hover:shadow-card-hover cursor-pointer`}>
    <p className="font-mono text-sm text-text-primary mb-2">{label}</p>
    <p className="text-text-secondary text-sm">Hover to see shadow transition</p>
  </div>
);

export const ShadowsAndBorders: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-text-primary">Shadows & Borders</h2>
      <p className="text-text-secondary">
        Shadow and border radius tokens for creating depth, hierarchy, and visual interest.
      </p>

      {/* SHADOW SCALE */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Shadow Scale
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          Shadows provide depth and elevation. Use semantic shadow tokens for consistent visual hierarchy.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <ShadowShowcase
            shadow="shadow-sm"
            label="shadow-sm"
            description="Subtle elevation for buttons and small elements"
            value="0 1px 2px rgb(0 0 0 / 0.05)"
          />
          <ShadowShowcase
            shadow="shadow-md"
            label="shadow-md"
            description="Medium elevation for cards and panels"
            value="0 4px 6px rgb(0 0 0 / 0.1)"
          />
          <ShadowShowcase
            shadow="shadow-lg"
            label="shadow-lg"
            description="Large elevation for modals and dropdowns"
            value="0 10px 15px rgb(0 0 0 / 0.1)"
          />
          <ShadowShowcase
            shadow="shadow-card"
            label="shadow-card"
            description="Semantic token for card components"
            value="= shadow-md"
          />
          <ShadowShowcase
            shadow="shadow-card-hover"
            label="shadow-card-hover"
            description="Hover state for interactive cards"
            value="= shadow-lg"
          />
        </div>
      </section>

      {/* BORDER RADIUS SCALE */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Border Radius Scale
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          Border radius controls corner roundness. Use semantic tokens for consistent corner styling.
        </p>
        <div className="flex flex-wrap gap-6 items-end">
          <RadiusShowcase
            radius="rounded-sm"
            label="SM"
            value="0.25rem (4px)"
            width="w-20"
          />
          <RadiusShowcase
            radius="rounded-md"
            label="MD"
            value="0.5rem (8px)"
            width="w-24"
          />
          <RadiusShowcase
            radius="rounded-lg"
            label="LG"
            value="0.75rem (12px)"
            width="w-28"
          />
          <RadiusShowcase
            radius="rounded-xl"
            label="XL"
            value="1rem (16px)"
            width="w-32"
          />
          <RadiusShowcase
            radius="rounded-2xl"
            label="2XL"
            value="1.5rem (24px)"
            width="w-36"
          />
          <RadiusShowcase
            radius="rounded-full"
            label="Full"
            value="9999px"
            width="w-40"
          />
        </div>
      </section>

      {/* HOVER TRANSITIONS */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Hover Transitions
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          Cards should smoothly transition to elevated shadow state on hover for interactive feedback.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <HoverCard
            shadow="shadow-md"
            radius="rounded-lg"
            label="transition-shadow"
          />
          <HoverCard
            shadow="shadow-md"
            radius="rounded-xl"
            label="duration-300"
          />
          <HoverCard
            shadow="shadow-md"
            radius="rounded-2xl"
            label="hover:shadow-card-hover"
          />
        </div>
        <div className="mt-4 p-4 bg-surface-muted rounded-lg border border-border-default">
          <p className="font-mono text-sm text-text-primary mb-2">Implementation:</p>
          <pre className="text-text-secondary text-sm overflow-x-auto">
{`className="shadow-md rounded-lg transition-shadow duration-300 hover:shadow-card-hover"`}
          </pre>
        </div>
      </section>

      {/* COMBINED PATTERNS */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Combined Patterns
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          Common combinations of shadows, borders, and radius used across hotel components.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Card Pattern */}
          <div className="p-6 bg-surface-default rounded-lg border border-border-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-3">Card Pattern</h4>
            <div className="p-4 bg-surface-elevated rounded-lg border border-border-default shadow-md hover:shadow-card-hover transition-shadow duration-300">
              <p className="text-text-secondary text-sm mb-2">Room Card</p>
              <p className="text-text-muted text-xs">Deluxe King Room</p>
              <p className="text-text-primary font-semibold mt-2">$299/night</p>
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-mono text-xs text-text-muted">rounded-lg</p>
              <p className="font-mono text-xs text-text-muted">border border-border-default</p>
              <p className="font-mono text-xs text-text-muted">shadow-md</p>
              <p className="font-mono text-xs text-text-muted">hover:shadow-card-hover</p>
            </div>
          </div>

          {/* Input Pattern */}
          <div className="p-6 bg-surface-default rounded-lg border border-border-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-3">Input Pattern</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Check-in Date"
                className="w-full px-4 py-2 rounded-md border border-border-default bg-surface-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
              <input
                type="text"
                placeholder="Check-out Date"
                className="w-full px-4 py-2 rounded-md border border-border-default bg-surface-default text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-primary/50"
              />
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-mono text-xs text-text-muted">rounded-md</p>
              <p className="font-mono text-xs text-text-muted">border border-border-default</p>
              <p className="font-mono text-xs text-text-muted">focus:ring-2 focus:ring-brand-primary/50</p>
            </div>
          </div>

          {/* Button Pattern */}
          <div className="p-6 bg-surface-default rounded-lg border border-border-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-3">Button Pattern</h4>
            <div className="flex gap-3">
              <button className="px-6 py-2 rounded-md bg-brand-primary text-on-brand font-semibold hover:bg-brand-primary-hover transition-colors shadow-sm">
                Primary
              </button>
              <button className="px-6 py-2 rounded-md border border-border-default bg-surface-default text-text-primary font-semibold hover:bg-surface-elevated transition-colors">
                Secondary
              </button>
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-mono text-xs text-text-muted">rounded-md</p>
              <p className="font-mono text-xs text-text-muted">shadow-sm</p>
              <p className="font-mono text-xs text-text-muted">transition-colors</p>
            </div>
          </div>

          {/* Modal Pattern */}
          <div className="p-6 bg-surface-default rounded-lg border border-border-default">
            <h4 className="font-mono text-sm font-semibold text-text-primary mb-3">Modal Pattern</h4>
            <div className="p-4 bg-surface-default rounded-xl border border-border-default shadow-lg">
              <p className="text-text-primary font-semibold mb-2">Booking Confirmation</p>
              <p className="text-text-secondary text-sm">Your reservation has been confirmed.</p>
              <div className="mt-3 pt-3 border-t border-border-default">
                <button className="w-full px-4 py-2 rounded-md bg-brand-primary text-on-brand font-semibold">
                  Close
                </button>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <p className="font-mono text-xs text-text-muted">rounded-xl</p>
              <p className="font-mono text-xs text-text-muted">shadow-lg</p>
              <p className="font-mono text-xs text-text-muted">border border-border-default</p>
            </div>
          </div>
        </div>
      </section>

      {/* USAGE GUIDELINES */}
      <section className="mt-8 p-6 bg-surface-muted rounded-lg border border-border-default">
        <h4 className="text-lg font-semibold text-text-primary mb-2">Usage Guidelines</h4>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>
            <strong>Shadows:</strong> Use semantic tokens (shadow-card, shadow-card-hover) instead of
            arbitrary values for consistency.
          </li>
          <li>
            <strong>Border Radius:</strong> Match radius to context - smaller radius for inputs and buttons,
            larger radius for cards and modals.
          </li>
          <li>
            <strong>Hover States:</strong> Always include transition-shadow duration-300 for smooth elevation
            changes on interactive elements.
          </li>
          <li>
            <strong>Combined with Borders:</strong> Use shadows and borders together for subtle depth and
            clear boundaries.
          </li>
        </ul>
      </section>

      {/* ANTI-PATTERNS */}
      <section className="p-6 bg-status-error/10 rounded-lg border border-status-error/30">
        <h4 className="text-lg font-semibold text-text-primary mb-2">Anti-Patterns to Avoid</h4>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>
            <strong>❌ Don't use magic number shadows</strong> like{' '}
            <code className="bg-surface-default px-1 py-0.5 rounded text-text-primary">box-shadow: 0 3px 7px rgba(0,0,0,0.12)</code>
            - Use semantic tokens instead.
          </li>
          <li>
            <strong>❌ Don't mix radius systems</strong> - Use Tailwind radius classes consistently, not custom pixel values.
          </li>
          <li>
            <strong>❌ Don't omit hover transitions</strong> - Always add transition classes for smooth interactions.
          </li>
          <li>
            <strong>✅ Always use semantic shadow tokens</strong> (shadow-card, shadow-card-hover) for component elevation.
          </li>
        </ul>
      </section>
    </div>
  ),
};
