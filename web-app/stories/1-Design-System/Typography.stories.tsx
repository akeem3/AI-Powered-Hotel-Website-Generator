import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Typography',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**Typography System - Epic 15: Algorithmic Design System**

This story documents the font families and semantic fluid typography tokens used across hotel websites.

## Font Families

- **Display Font**: Playfair Display (serif) - Used for headings and elegant typography
- **Body Font**: Inter (sans-serif) - Used for paragraphs, UI elements, and readability
- **Mono Font**: Fira Code (monospace) - Used for code and technical data

## Semantic Typography Tokens

All typography sizes follow the OKLCH color token pattern with \`-val\` suffix:
- \`text-size-display\`: 36px → 60px - Hero titles and large headings
- \`text-size-h1\`: 24px → 36px - Page headings
- \`text-size-h2\`: 20px → 28px - Section headings
- \`text-size-h3\`: 18px → 22px - Subsection headings
- \`text-size-body-large\`: 18px → 20px - Emphasized body text
- \`text-size-body\`: 16px → 18px - Default body text
- \`text-size-caption\`: 14px → 16px - Small labels and captions
- \`text-size-overline\`: 12px → 14px - Tiny text and metadata

Typography scales fluidly across viewports (375px → 768px) using CSS \`clamp()\` for optimal readability.

> **Migration Complete:** All components have been migrated from deprecated \`text-fluid-*\` classes to semantic \`text-size-*\` tokens. The old \`text-fluid-*\` CSS custom properties have been removed from \`globals.css\`.

## Typography Utilities (Story 15.3)

### Text Trim Utility
The \`text-trim\` class aligns text to its optical cap-height for perfect icon+text alignment:
- **Use case:** Navigation items, buttons with icons, flex containers with icon + text
- **Browser support:** Chrome 133+, Safari 18.2+ (native), Firefox (fallback)
- **Usage:** Add \`text-trim\` class to text element alongside icon

### Tabular Nums Utility
The \`tabular-nums\` class ensures numbers have equal width for price alignment:
- **Use case:** Price displays, tables with numeric data, currency formatting
- **Browser support:** All modern browsers
- **Usage:** Add \`tabular-nums\` class to price or numeric elements
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Font sample component for displaying font family usage
const FontSample = ({
  fontFamily,
  className,
  sample,
  usage,
}: {
  fontFamily: string;
  className: string;
  sample: string;
  usage: string;
}) => (
  <div className="mb-8 p-6 border border-border-default rounded-lg bg-surface-default">
    <p className="text-text-muted text-xs uppercase tracking-wide mb-3">{fontFamily}</p>
    <p className={className}>{sample}</p>
    <p className="text-text-secondary text-sm mt-2">{usage}</p>
  </div>
);

// Fluid type sample component for displaying responsive typography
const FluidTypeSample = ({
  className,
  label,
  minMax,
  sample,
}: {
  className: string;
  label: string;
  minMax: string;
  sample: string;
}) => (
  <div className="mb-6 border-b border-border-default pb-4">
    <p className={className}>{sample}</p>
    <div className="flex gap-4 mt-2 text-xs text-text-muted">
      <span className="font-mono">{label}</span>
      <span>{minMax}</span>
    </div>
  </div>
);

// Text trim sample component for demonstrating optical alignment
const TextTrimSample = ({
  withTrim,
  label,
}: {
  withTrim: boolean;
  label: string;
}) => (
  <div className="mb-6 flex items-center gap-3 p-4 border border-border-default rounded-lg bg-surface-default">
      <div className="size-8 flex items-center justify-center bg-brand-primary rounded text-on-brand text-xs">
        Icon
      </div>
      <span className={withTrim ? "text-trim" : ""}>
        {label}
      </span>
    </div>
);

// Tabular nums sample component for demonstrating number alignment
const TabularNumsSample = ({
  useTabular,
  prices,
}: {
  useTabular: boolean;
  prices: string[];
}) => (
  <div className="p-4 border border-border-default rounded-lg bg-surface-default">
    <table className="w-full text-sm">
      <tbody>
        {prices.map((price, index) => (
          <tr key={index} className="border-b border-border-default last:border-0">
            <td className="py-2 text-text-secondary">
              {index === 0 ? "Standard Room" : index === 1 ? "Deluxe Room" : "Suite"}
            </td>
            <td className={`py-2 text-right ${useTabular ? "tabular-nums" : ""}`}>
              {price}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const TypographySystem: Story = {
  render: () => (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-text-primary">Typography System</h2>
      <p className="text-text-secondary">
        Comprehensive typography scale and font family documentation from Story 1.11.
      </p>

      {/* FONT FAMILIES */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Font Families
        </h3>
        <div className="space-y-4">
          <FontSample
            fontFamily="Display Font"
            className="font-display text-2xl"
            sample="The Sterling Executive Hotel"
            usage="Headings, titles, and elegant typography. Use for H1-H6 and display text."
          />
          <FontSample
            fontFamily="Body Font"
            className="font-body text-base"
            sample="Experience luxury and comfort in every detail. Our dedicated staff ensures your stay is memorable."
            usage="Paragraphs, body text, UI elements, and interface components. Optimized for readability."
          />
          <FontSample
            fontFamily="Mono Font"
            className="font-mono text-sm"
            sample="const booking = { hotelId: 'stl-001', dates: '2024-03-15' };"
            usage="Code snippets, technical data, and numerical information. Fixed width for alignment."
          />
        </div>
      </section>

      {/* SEMANTIC TYPOGRAPHY SCALE */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Semantic Typography Scale
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          All semantic sizes use CSS <code>clamp()</code> for responsive scaling across 375px-768px viewports.
          Resize the browser or use the viewport addon to see the scale in action.
        </p>
        <div className="space-y-2">
          <FluidTypeSample
            className="font-display text-size-display"
            label="text-size-display"
            minMax="36px → 60px"
            sample="Display - Hero Title"
          />
          <FluidTypeSample
            className="font-display text-size-h1"
            label="text-size-h1"
            minMax="24px → 36px"
            sample="H1 - Page Heading"
          />
          <FluidTypeSample
            className="font-display text-size-h2"
            label="text-size-h2"
            minMax="20px → 28px"
            sample="H2 - Section Heading"
          />
          <FluidTypeSample
            className="font-display text-size-h3"
            label="text-size-h3"
            minMax="18px → 22px"
            sample="H3 - Subsection Heading"
          />
          <FluidTypeSample
            className="font-body text-size-body-large"
            label="text-size-body-large"
            minMax="18px → 20px"
            sample="Body Large - Emphasized paragraph text for important content"
          />
          <FluidTypeSample
            className="font-body text-size-body"
            label="text-size-body"
            minMax="16px → 18px"
            sample="Body - Default paragraph text for general content and descriptions"
          />
          <FluidTypeSample
            className="font-body text-size-caption"
            label="text-size-caption"
            minMax="14px → 16px"
            sample="Caption - Small labels and supporting text"
          />
          <FluidTypeSample
            className="font-body text-size-overline"
            label="text-size-overline"
            minMax="12px → 14px"
            sample="Overline - Tiny text for metadata and timestamps"
          />
        </div>
      </section>

      {/* HEADING HIERARCHY */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Heading Hierarchy
        </h3>
        <div className="space-y-4 p-6 bg-surface-elevated rounded-lg border border-border-default">
          <h1 className="font-display text-size-h1 text-text-primary mb-2">
            h1: The Sterling Executive Hotel
          </h1>
          <h2 className="font-display text-size-h2 text-text-primary mb-2">
            h2: Premium Amenities & Services
          </h2>
          <h3 className="font-display text-size-h3 text-text-primary mb-2">
            h3: Room Categories & Pricing
          </h3>
          <p className="font-body text-size-body text-text-secondary mb-2">
            Body: This is default paragraph text used for general content descriptions and information.
          </p>
          <p className="font-body text-size-caption text-text-muted">
            Caption: Small supporting text like image captions or help text.
          </p>
          <p className="text-text-secondary text-sm mt-4">
            <strong>Accessibility Note:</strong> Proper heading hierarchy ensures screen readers can navigate content.
            Always use headings in order (h1 → h2 → h3) and don't skip levels.
          </p>
        </div>
      </section>

      {/* TEXT TRIM UTILITY - Story 15.3 */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Text Trim Utility (Optical Alignment)
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          The <code>text-trim</code> utility aligns text to its optical cap-height instead of its line-height box.
          This is useful when combining icons with text in navigation items or buttons.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-surface-elevated rounded-lg border border-border-default">
            <p className="text-text-muted text-xs uppercase tracking-wide mb-3">Without text-trim</p>
            <TextTrimSample
              withTrim={false}
              label="Menu Item"
            />
            <p className="text-text-secondary text-xs mt-2">
              Icon centers to line-height box (includes invisible leading space)
            </p>
          </div>

          <div className="p-4 bg-surface-elevated rounded-lg border border-border-default">
            <p className="text-text-muted text-xs uppercase tracking-wide mb-3">With text-trim</p>
            <TextTrimSample
              withTrim={true}
              label="Menu Item"
            />
            <p className="text-text-secondary text-xs mt-2">
              Icon centers to visual cap-height (optically aligned)
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-surface-muted rounded-lg border border-border-default">
          <h5 className="font-semibold text-text-primary text-sm mb-2">Browser Support</h5>
          <ul className="text-text-secondary text-xs space-y-1">
            <li>• <strong>Chrome 133+, Safari 18.2+:</strong> Native <code>text-box-trim</code> support</li>
            <li>• <strong>Firefox:</strong> Fallback using <code>margin-block: calc(0.5cap - 0.5lh)</code></li>
            <li>• <strong>Edge 133+:</strong> Native <code>text-box-trim</code> support</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-surface-elevated rounded-lg border border-border-default">
          <h5 className="font-semibold text-text-primary text-sm mb-2">Usage Example</h5>
          <pre className="bg-surface-default p-3 rounded text-xs overflow-x-auto">
            <code>{`<div className="flex items-center gap-2">
  <Icon className="size-5" />
  <span className="text-trim">Menu Item</span>
</div>`}</code>
          </pre>
        </div>
      </section>

      {/* TABULAR NUMS UTILITY - Story 15.3 */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Tabular Nums Utility (Price Alignment)
        </h3>
        <p className="text-text-secondary mb-4 text-sm">
          The <code>tabular-nums</code> utility ensures all numbers have equal width, making price displays
          and numeric data align perfectly. This is essential for price lists, tables, and currency formatting.
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-surface-elevated rounded-lg border border-border-default">
            <p className="text-text-muted text-xs uppercase tracking-wide mb-3">Without tabular-nums</p>
            <TabularNumsSample
              useTabular={false}
              prices={["$1,234", "$999", "$1,500"]}
            />
            <p className="text-text-secondary text-xs mt-2">
              Numbers have variable width - misaligned in price column
            </p>
          </div>

          <div className="p-4 bg-surface-elevated rounded-lg border border-border-default">
            <p className="text-text-muted text-xs uppercase tracking-wide mb-3">With tabular-nums</p>
            <TabularNumsSample
              useTabular={true}
              prices={["$1,234", "$999", "$1,500"]}
            />
            <p className="text-text-secondary text-xs mt-2">
              Numbers have equal width - perfectly aligned price column
            </p>
          </div>
        </div>

        <div className="mt-4 p-4 bg-surface-muted rounded-lg border border-border-default">
          <h5 className="font-semibold text-text-primary text-sm mb-2">Use Cases</h5>
          <ul className="text-text-secondary text-xs space-y-1">
            <li>• <strong>Price displays:</strong> Room rates, packages, promotions</li>
            <li>• <strong>Data tables:</strong> Numeric columns with financial data</li>
            <li>• <strong>Currency formatting:</strong> Any monetary values</li>
            <li>• <strong>Timestamps:</strong> Time displays with numbers</li>
          </ul>
        </div>

        <div className="mt-4 p-4 bg-surface-elevated rounded-lg border border-border-default">
          <h5 className="font-semibold text-text-primary text-sm mb-2">Usage Example</h5>
          <pre className="bg-surface-default p-3 rounded text-xs overflow-x-auto">
            <code>{`<p className="text-size-body-large tabular-nums text-brand-primary">
  \${price.toLocaleString()}
</p>`}</code>
          </pre>
        </div>
      </section>

      {/* FONT PAIRING EXAMPLES */}
      <section>
        <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-default pb-2">
          Font Pairing Examples
        </h3>
        <div className="space-y-4">
          <div className="p-6 border border-border-default rounded-lg bg-surface-default">
            <h4 className="font-display text-size-h2 text-text-primary mb-2">
              Luxury Accommodations
            </h4>
            <p className="font-body text-size-body text-text-secondary">
              Experience our elegantly appointed rooms and suites, designed for both comfort and productivity.
              Each room features premium amenities and stunning views.
            </p>
            <p className="font-body text-size-caption text-text-muted mt-2">
              From $299 per night · Free cancellation up to 48 hours
            </p>
          </div>
          <div className="p-6 border border-border-default rounded-lg bg-brand-primary text-on-brand">
            <h4 className="font-display text-size-h3 mb-2">
              Book Your Stay
            </h4>
            <p className="font-body text-size-body opacity-90">
              Reserve your room today and enjoy exclusive member rates and complimentary upgrades.
            </p>
          </div>
        </div>
      </section>

      {/* USAGE GUIDELINES */}
      <section className="mt-8 p-6 bg-surface-muted rounded-lg border border-border-default">
        <h4 className="text-lg font-semibold text-text-primary mb-2">Usage Guidelines</h4>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>
            <strong>Display Font (Playfair Display):</strong> Use for headings (H1-H6), hotel name,
            section titles, and call-to-action text.
          </li>
          <li>
            <strong>Body Font (Inter):</strong> Use for paragraphs, descriptions, buttons, labels,
            and all UI components.
          </li>
          <li>
            <strong>Mono Font (Fira Code):</strong> Use for code snippets, prices, dates, and technical data.
          </li>
          <li>
            <strong>Semantic Tokens:</strong> Always use semantic classes (text-size-*) instead of fixed
            sizes. These follow the OKLCH color token pattern with <code>-val</code> suffix.
          </li>
          <li>
            <strong>Viewport Scaling:</strong> All semantic tokens use CSS <code>clamp()</code> to scale
            fluidly across 375px-768px viewports, ensuring optimal readability.
          </li>
        </ul>
      </section>

      {/* RESPONSIVE BEHAVIOR NOTE */}
      <section className="p-6 bg-surface-elevated rounded-lg border border-border-default">
        <h4 className="text-base font-semibold text-text-primary mb-2">📱 Responsive Behavior</h4>
        <p className="text-text-secondary text-sm">
          To see the fluid typography in action, use the viewport addon to switch between:
        </p>
        <ul className="text-text-secondary text-sm mt-2 space-y-1">
          <li>• Mobile (375px) - Text scales down for readability</li>
          <li>• Tablet (768px) - Text scales to medium size</li>
          <li>• Desktop (1280px) - Text reaches maximum size</li>
          <li>• Wide (1920px) - Text remains at maximum size for readability</li>
        </ul>
        <p className="text-text-muted text-xs mt-2">
          The clamp() function ensures smooth scaling between these viewport breakpoints.
        </p>
      </section>
    </div>
  ),
};
