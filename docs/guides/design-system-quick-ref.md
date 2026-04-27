# Design System Quick Reference

## Storybook

```bash
npm run storybook        # Start (http://localhost:6006)
npm run build-storybook  # Build for production
npm run chromatic        # Visual regression
```

## Semantic Tokens

### Colors
| Token | Use |
|-------|-----|
| `brand-primary` | Primary actions, headers |
| `brand-secondary` | Secondary elements |
| `surface-primary` | Main backgrounds |
| `surface-elevated` | Cards, modals |
| `surface-muted` | Disabled states |
| `text-primary` | Main text |
| `text-secondary` | Subtle text |
| `text-inverted` | Text on dark backgrounds |

### Usage
```tsx
// CORRECT
<div className="bg-brand-primary text-text-inverted">

// FORBIDDEN (hardcoded)
<div className="bg-blue-900 text-white">
```

## CVA Variants

### Common Dimensions
| Dimension | Values |
|-----------|--------|
| `style` | modern, classic, minimal, bold, elegant |
| `layout` | centered, split, fullscreen, grid |
| `variant` | detailed, compact, grid, featured |
| `cardStyle` | default, minimal, flat, elevated |

### Usage
```tsx
import { heroVariants } from '@/lib/cva-variants';

<section className={heroVariants({ style: 'modern', layout: 'centered' })}>
```

## Component Tiers

| Tier | Examples | Complexity |
|------|----------|------------|
| **primitives** | Button, Input | Atomic |
| **blocks** | RoomCard, Navigation | Composed |
| **sections** | HeroSection, Gallery | Full-width |
| **pages** | HomePage | Complete |

## Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import Component from '@/components/blocks/Component';

const meta: Meta<typeof Component> = {
  title: 'Components/Blocks/Component',
  component: Component,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  args: { /* props */ },
};
```

## Responsive Breakpoints

| Name | Width | Tailwind |
|------|-------|----------|
| Mobile | 375px | (default) |
| Tablet | 768px | `md:` |
| Desktop | 1280px | `lg:` |
| Wide | 1920px | `2xl:` |

## File Locations

| Purpose | Location |
|---------|----------|
| CVA Variants | `web-app/lib/cva-variants.ts` |
| Design Tokens | `web-app/app/globals.css` |
| Contracts | `web-app/lib/contracts/` |
| Stories | `web-app/stories/` |
| Storybook Config | `web-app/.storybook/` |

---

*Print or bookmark this reference*

---

## Related Documentation

- [Component Architecture](./component-architecture.md) — Router pattern, contracts, validation
- [Component Inventory](./component-inventory.md) — All 12 components with variants
- [End-to-End Architecture](./end-to-end-architecture.md) — Full pipeline overview
- [Storybook Developer Manual](./storybook-manual.md)
- [Storybook MCP Integration Manual](./storybook-mcp-manual.md)

