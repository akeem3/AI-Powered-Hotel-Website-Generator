# Component System Architecture

## Overview

The hotel website generator uses a 4-tier component system designed for LLM-driven generation and human maintenance.

## 4-Tier System

### Tier 1: Atoms
Basic HTML elements with minimal styling:
- Buttons, inputs, labels
- Text elements, links
- Icons, badges

**Location:** `/web-app/components/ui/`

### Tier 2: Molecules
Simple combinations of atoms:
- Form fields with labels
- Button groups
- Card headers

**Location:** `/web-app/components/base/`

### Tier 3: Organisms
Complex functional components:
- Navigation bars
- Booking widgets
- Room cards
- Image galleries

**Location:** `/web-app/components/hotel/`

### Tier 4: Templates (Multi-Page)
Page-level layouts composed via `splitToPages()` from `WebsiteConfig`:
- **Homepage** -- receives hero, booking, and teaser versions of sections (rooms limited to 3, gallery to 6, amenities to 8)
- **Rooms page** -- receives rooms components and full room listings
- **Gallery page** -- receives gallery components with all images
- **Contact page** -- receives contact form, map, and hotel info
- **About page** -- receives about/story sections
- **FAQ page** -- receives FAQ components

Navigation and Footer appear on **every page** automatically via `splitToPages()`.

`splitToPages()` maps section types to their target pages (e.g., `rooms` component to rooms page, `gallery` to gallery page) and generates homepage teasers with capped item counts for cross-linking.

**Location:** `/web-app/app/[lang]/` (multi-page routing with i18n support)

## Component Contracts

Each component must define:

### Props Interface
```typescript
interface ComponentProps {
  // Required props
  required: string;
  // Optional props with defaults
  optional?: string;
  // Variant props
  variant?: 'primary' | 'secondary';
  // Children
  children?: React.ReactNode;
}
```

### Variant Configuration
```typescript
const variants = cva(base, {
  variants: {
    variant: {
      primary: '...',
      secondary: '...',
    },
    size: {
      sm: '...',
      md: '...',
      lg: '...',
    },
  },
});
```

### Validation Schema
```typescript
const propsSchema = z.object({
  required: z.string(),
  optional: z.string().optional(),
  variant: z.enum(['primary', 'secondary']),
});
```

## Design System Integration

### Theme Access
```tsx
import { useHotelTheme } from '@/lib/hooks/useHotelTheme';

export function Component() {
  const { theme } = useHotelTheme();
  // Use theme.colors, theme.spacing, etc.
}
```

### Design Tokens
All components use design tokens from `/docs/design-system/design-tokens.md`:
- Colors from `useHotelTheme()`
- Spacing from Tailwind preset
- Typography from theme config
- Breakpoints from Tailwind config

## Component Standards

### File Structure
```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.test.tsx  # Tests
├── ComponentName.stories.tsx # Storybook stories
└── index.ts                # Exports
```

### Documentation Requirements
1. **Purpose**: What the component does
2. **Props**: Complete props table
3. **Variants**: All variant combinations
4. **Examples**: Usage examples
5. **Accessibility**: ARIA labels, keyboard nav
6. **Theming**: How theme affects appearance

### Testing Requirements
1. Unit tests for all props
2. Variant combination tests
3. Accessibility tests (a11y)
4. Theme variation tests
5. Contract tests (props schema)

## Related Documentation
- [Component Library](./component-library.md)
- [Backend Integration](./backend-integration.md)
- [Design Tokens](../../design-system/design-tokens.md)
- [Coding Standards](../guides/coding-standards.md)
