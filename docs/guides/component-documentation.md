# Component Documentation Guide

## Overview

This guide explains how to document components for the hotel website generation system.

## Documentation Requirements

Every component must have:

### 1. JSDoc Comments

```typescript
/**
 * RoomCard - Displays hotel room information with booking CTA
 *
 * @param props - Component props
 * @param props.name - Room name (e.g., "Deluxe Ocean View")
 * @param props.price - Nightly rate in USD
 * @param props.variant - Visual style: "card" | "list" | "compact"
 * @param props.onBook - Callback when booking button clicked
 *
 * @example
 * ```tsx
 * <RoomCard
 *   name="Deluxe Suite"
 *   price={299}
 *   variant="card"
 *   onBook={() => router.push('/booking')}
 * />
 * ```
 */
export function RoomCard(props: RoomCardProps) {
  // ...
}
```

### 2. Props Interface

```typescript
interface RoomCardProps {
  /** Room display name */
  name: string;
  /** Base price per night in USD */
  price: number;
  /** Visual presentation style */
  variant?: 'card' | 'list' | 'compact';
  /** Booking action handler */
  onBook?: () => void;
  /** Optional room image URL */
  image?: string;
  /** Room amenities list */
  amenities?: string[];
}
```

### 3. Storybook Stories

```typescript
export default {
  title: 'Hotel/RoomCard',
  component: RoomCard,
} satisfies ComponentMeta<typeof RoomCard>;

export const Card = {
  args: {
    name: 'Deluxe Ocean View Suite',
    price: 299,
    variant: 'card',
    amenities: ['Ocean View', 'King Bed', 'Balcony'],
  },
};

export const List = {
  args: {
    ...Card.args,
    variant: 'list',
  },
};
```

### 4. Variant Documentation

```typescript
/**
 * VARIANTS
 *
 * "card" - Standard card layout with image on top
 *   - Mobile: Stacked vertical
 *   - Desktop: Image left, content right
 *
 * "list" - Compact list item for search results
 *   - Mobile: Horizontal scroll
 *   - Desktop: Row layout
 *
 * "compact" - Minimal card for comparison view
 *   - No image, text only
 *   - Amenities as icons only
 */
```

## Component README Template

Create a `README.md` in the component directory:

```markdown
# ComponentName

## Purpose
[Brief description of what this component does]

## Variants
| Variant | Description | Use Case |
|---------|-------------|----------|
| primary | [Description] | [When to use] |
| secondary | [Description] | [When to use] |

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| name | string | Yes | - | [Description] |
| variant | 'a' \| 'b' | No | 'a' | [Description] |

## Examples

### Basic Usage
\`\`\`tsx
<ComponentName name="Example" />
\`\`\`

### With All Props
\`\`\`tsx
<ComponentName
  name="Example"
  variant="primary"
  onAction={() => {}}
/>
\`\`\`

## Accessibility
- [ARIA attributes used]
- [Keyboard navigation support]
- [Screen reader behavior]

## Theming
- Uses `theme.colors.primary` for [element]
- Supports dark mode via `useHotelTheme()`
- Responsive breakpoints: [description]

## Related Components
- [RelatedComponent](./RelatedComponent.md)
- [ParentComponent](../parent/)

## Tests
- Unit: [test file path]
- Stories: [stories file path]
- E2E: [e2e test path]
```

## Documentation Checklist

Before considering a component documented:

- [ ] JSDoc comments on component
- [ ] Props interface with descriptions
- [ ] Storybook stories for all variants
- [ ] Variant documentation in comments
- [ ] Component README (if complex)
- [ ] Accessibility notes
- [ ] Theming information
- [ ] Usage examples
- [ ] Related component links
- [ ] Test file references

## Related Documentation
- [Component Architecture](./component-architecture.md) — Router pattern, contracts, CVA system
- [Component Inventory](./component-inventory.md) — All 12 components with variants
- [Design System Quick Reference](./design-system-quick-ref.md) — Tokens, tiers, breakpoints
- [Coding Standards](./coding-standards.md)
- [Storybook Developer Manual](./storybook-manual.md)
