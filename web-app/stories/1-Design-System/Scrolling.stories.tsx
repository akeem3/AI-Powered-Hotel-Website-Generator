import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Design System/Scrolling',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**Scrolling Utilities & Patterns**

This story documents all scrolling-related utilities and patterns used across hotel websites.

## Scroll Utilities

- **grid-scroll**: Styled scrollbar with thin width and brand colors
- **scrollbar-hide**: Hides scrollbar while maintaining scroll functionality
- **scroll-smooth-behavior**: Enables smooth scrolling behavior
- **--height-scroll-container**: CSS variable for fixed-height scroll containers (600px)

## Common Use Cases

- **Data Grids**: Tables with horizontal scrolling
- **Cards with Overflow**: Content cards that scroll internally
- **Smooth Navigation**: Anchor links and scroll-to-top buttons
- **Hidden Scrollbars**: Clean UI with scrollable content

All scrolling utilities are defined in \`globals.css\` and use semantic design tokens.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj;

// Long content component for scroll demonstration
const LongContent = ({ paragraphs = 8 }: { paragraphs?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: paragraphs }).map((_, i) => (
      <div key={i} className="p-4 bg-surface-elevated rounded-lg border border-border-default">
        <h4 className="font-display text-text-primary mb-2">Content Section {i + 1}</h4>
        <p className="text-text-secondary text-sm">
          This is sample content to demonstrate scrolling behavior. In a real hotel website,
          this could be room descriptions, amenities lists, or booking policy details.
        </p>
        <p className="text-text-muted text-xs mt-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
          incididunt ut labore et dolore magna aliqua.
        </p>
      </div>
    ))}
  </div>
);

// Data table component for horizontal scroll demo
const DataTable = () => (
  <div className="w-full">
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-surface-muted border-b border-border-default">
          {['Room Type', 'Bed Config', 'Max Guests', 'Size', 'Price', 'View', 'Amenities', 'Availability'].map((header) => (
            <th key={header} className="p-3 text-left text-text-primary text-xs font-semibold whitespace-nowrap">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          ['Deluxe King', '1 King', '2', '45m²', '$299', 'City', 'WiFi, Mini Bar', 'Available'],
          ['Executive Suite', '1 King + Sofa', '3', '65m²', '$449', 'Ocean', 'All Inclusive', 'Limited'],
          ['Family Room', '2 Queen', '4', '55m²', '$349', 'Garden', 'Kitchenette', 'Available'],
          ['Penthouse', '1 King + Living', '2', '120m²', '$899', 'Panoramic', 'Butler Service', 'Sold Out'],
          ['Standard Twin', '2 Single', '2', '35m²', '$199', 'Courtyard', 'Basic', 'Available'],
        ].map((row, i) => (
          <tr key={i} className="border-b border-border-default hover:bg-surface-elevated">
            {row.map((cell, j) => (
              <td key={j} className="p-3 text-text-secondary text-sm whitespace-nowrap">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ScrollingUtilities: Story = {
  render: () => (
    <div className="p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Scrolling Utilities</h1>
        <p className="text-text-secondary">
          Complete guide to scrolling patterns and utilities used across hotel websites.
        </p>
      </div>

      {/* FIXED HEIGHT SCROLL CONTAINER */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Fixed Height Scroll Container</h2>
        <p className="text-text-secondary mb-4 text-sm">
          Use <code className="bg-surface-muted px-2 py-1 rounded text-text-primary">--height-scroll-container</code>{' '}
          for consistent scrollable content areas.
        </p>

        <div className="space-y-4">
          {/* With default scrollbar */}
          <div>
            <h4 className="font-mono text-sm text-text-primary mb-2">Default Scrollbar</h4>
            <div
              className="p-4 bg-surface-default rounded-lg border border-border-default scroll-container"
            >
              <LongContent paragraphs={10} />
            </div>
            <div className="mt-2 p-3 bg-surface-muted rounded text-xs font-mono text-text-muted">
              height: var(--height-scroll-container); overflow-y: auto;
            </div>
          </div>

          {/* With grid-scroll styled scrollbar */}
          <div>
            <h4 className="font-mono text-sm text-text-primary mb-2">Styled Scrollbar (grid-scroll)</h4>
            <div
              className="grid-scroll p-4 bg-surface-default rounded-lg border border-border-default scroll-container"
            >
              <LongContent paragraphs={10} />
            </div>
            <div className="mt-2 p-3 bg-surface-muted rounded text-xs font-mono text-text-muted">
              className="grid-scroll" + height: var(--height-scroll-container); overflow-y: auto;
            </div>
          </div>
        </div>
      </section>

      {/* HIDDEN SCROLLBAR */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Hidden Scrollbar</h2>
        <p className="text-text-secondary mb-4 text-sm">
          Use <code className="bg-surface-muted px-2 py-1 rounded text-text-primary">scrollbar-hide</code>{' '}
          to hide the scrollbar while maintaining scroll functionality.
        </p>

        <div className="space-y-4">
          {/* Vertical scroll hidden */}
          <div>
            <h4 className="font-mono text-sm text-text-primary mb-2">Vertical Scroll Hidden</h4>
            <div
              className="scrollbar-hide p-4 bg-surface-default rounded-lg border border-border-default scroll-container"
            >
              <LongContent paragraphs={10} />
            </div>
            <p className="text-text-muted text-xs mt-2">
              Scroll with mouse wheel or trackpad to see content
            </p>
          </div>

          {/* Horizontal scroll hidden */}
          <div>
            <h4 className="font-mono text-sm text-text-primary mb-2">Horizontal Scroll Hidden</h4>
            <div className="scrollbar-hide overflow-x-auto p-4 bg-surface-default rounded-lg border border-border-default">
              <div className="flex gap-4 w-max">
                {['Deluxe King', 'Executive Suite', 'Family Room', 'Penthouse', 'Standard Twin', 'Presidential Suite', 'Garden Villa'].map((room) => (
                  <div key={room} className="w-48 p-4 bg-surface-elevated rounded-lg border border-border-default">
                    <h5 className="font-semibold text-text-primary text-sm">{room}</h5>
                    <p className="text-text-muted text-xs mt-1">From $199/night</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-text-muted text-xs mt-2">
              Scroll horizontally with mouse wheel, trackpad, or swipe to see more rooms
            </p>
          </div>
        </div>
      </section>

      {/* HORIZONTAL SCROLL TABLE */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Horizontal Scroll Table</h2>
        <p className="text-text-secondary mb-4 text-sm">
          Data tables with many columns should scroll horizontally on smaller screens.
        </p>

        <div className="space-y-4">
          {/* With styled scrollbar */}
          <div>
            <h4 className="font-mono text-sm text-text-primary mb-2">Styled Horizontal Scroll</h4>
            <div className="grid-scroll overflow-x-auto rounded-lg border border-border-default">
              <DataTable />
            </div>
            <div className="mt-2 p-3 bg-surface-muted rounded text-xs font-mono text-text-muted">
              className="grid-scroll overflow-x-auto"
            </div>
          </div>

          {/* With hidden scrollbar */}
          <div>
            <h4 className="font-mono text-sm text-text-primary mb-2">Hidden Scrollbar Horizontal</h4>
            <div className="scrollbar-hide overflow-x-auto rounded-lg border border-border-default">
              <DataTable />
            </div>
            <div className="mt-2 p-3 bg-surface-muted rounded text-xs font-mono text-text-muted">
              className="scrollbar-hide overflow-x-auto"
            </div>
          </div>
        </div>
      </section>

      {/* SMOOTH SCROLL BEHAVIOR */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Smooth Scroll Behavior</h2>
        <p className="text-text-secondary mb-4 text-sm">
          Use <code className="bg-surface-muted px-2 py-1 rounded text-text-primary">scroll-smooth-behavior</code>{' '}
          for smooth scrolling to anchor links.
        </p>

        <div
          className="scroll-smooth-behavior scroll-container p-6 bg-surface-default rounded-lg border border-border-default"
        >
          <nav className="flex gap-4 mb-6 pb-4 border-b border-border-default">
            {['Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5'].map((section, i) => (
              <a
                key={section}
                href={`#section-${i + 1}`}
                className="text-sm text-text-secondary hover:text-brand-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(`section-${i + 1}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {section}
              </a>
            ))}
          </nav>

          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              id={`section-${i + 1}`}
              className="mb-6 p-4 bg-surface-elevated rounded-lg border border-border-default"
            >
              <h4 className="font-display text-text-primary mb-2">Section {i + 1}</h4>
              <p className="text-text-secondary text-sm">
                This is section {i + 1}. Click the links above to smoothly scroll between sections.
                This is useful for long content like hotel policies, room descriptions, or amenities lists.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 p-3 bg-surface-muted rounded text-xs font-mono text-text-muted">
          className="scroll-smooth-behavior" + scrollIntoView(&#123; behavior: 'smooth' &#125;)
        </div>
      </section>

      {/* BOTH DIRECTIONS SCROLL */}
      <section>
        <h2 className="text-2xl font-bold text-text-primary mb-4">Bidirectional Scroll</h2>
        <p className="text-text-secondary mb-4 text-sm">
          Content that scrolls in both directions (wide tables, large images, etc.).
        </p>

        <div
          className="grid-scroll p-4 bg-surface-default rounded-lg border border-border-default scroll-container-both"
        >
          <div className="grid grid-cols-[repeat(12,minmax(200px,1fr))] gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="p-3 bg-surface-elevated rounded border border-border-default min-w-[200px]">
                <p className="font-mono text-xs text-text-primary">Column {i + 1}</p>
                <p className="text-text-muted text-xs mt-1">Data cell content</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 p-3 bg-surface-muted rounded text-xs font-mono text-text-muted">
          overflow: auto (scrolls both vertically and horizontally)
        </div>
      </section>

      {/* USAGE GUIDELINES */}
      <section className="mt-8 p-6 bg-surface-muted rounded-lg border border-border-default">
        <h4 className="text-lg font-semibold text-text-primary mb-2">Usage Guidelines</h4>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>
            <strong>grid-scroll:</strong> Use for data grids, tables, and lists where visible scrollbars
            help users understand the content bounds.
          </li>
          <li>
            <strong>scrollbar-hide:</strong> Use for carousel-style content, card lists, or when a clean
            UI is preferred. Always maintain scroll functionality for accessibility.
          </li>
          <li>
            <strong>scroll-smooth-behavior:</strong> Use for anchor navigation, table of contents links,
            and any programmatic scrolling.
          </li>
          <li>
            <strong>--height-scroll-container:</strong> Use for consistent scrollable content areas
            (600px by default).
          </li>
          <li>
            <strong>Accessibility:</strong> Always ensure scrollable content is keyboard accessible
            and can be navigated with assistive technologies.
          </li>
        </ul>
      </section>

      {/* ANTI-PATTERNS */}
      <section className="p-6 bg-status-error/10 rounded-lg border border-status-error/30">
        <h4 className="text-lg font-semibold text-text-primary mb-2">Anti-Patterns to Avoid</h4>
        <ul className="space-y-2 text-text-secondary text-sm">
          <li>
            <strong>❌ Don't disable scrolling entirely</strong> - Users must be able to access all content.
          </li>
          <li>
            <strong>❌ Don't use arbitrary height values</strong> - Use{' '}
            <code className="bg-surface-default px-1 py-0.5 rounded text-text-primary">--height-scroll-container</code>{' '}
            for consistency.
          </li>
          <li>
            <strong>❌ Don't hide scrollbars without scroll indicators</strong> - Provide visual cues
            (shadows, truncated text, etc.) when scrollbars are hidden.
          </li>
          <li>
            <strong>✅ Always test scrolling on mobile</strong> - Touch interactions differ from mouse scrolling.
          </li>
        </ul>
      </section>
    </div>
  ),
};
