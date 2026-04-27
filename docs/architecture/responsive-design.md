# Responsive Design Strategy

## Overview

This document defines the responsive design approach for hotel websites across all device sizes.

## Breakpoints

Following Tailwind CSS default breakpoints:

```js
breakpoints: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px', // Extra large desktop
}
```

## Mobile-First Approach

All components are designed mobile-first:
1. Base styles: Mobile (< 640px)
2. `sm:` overrides: Mobile landscape
3. `md:` overrides: Tablet
4. `lg:` overrides: Desktop
5. `xl:` and `2xl:` overrides: Large screens

## Component Responsive Patterns

### Container Queries
Where appropriate, use container queries for component-level responsiveness:

```tsx
<div className="@container">
  <div className="@lg:text-xl">
    Responsive text based on container, not viewport
  </div>
</div>
```

### Fluid Typography
Use `clamp()` for smooth scaling:

```css
font-size: clamp(1rem, 2vw, 1.5rem);
```

### Responsive Images
- Use `next/image` for optimization
- Provide multiple sizes
- Implement lazy loading
- Support modern formats (WebP, AVIF)

## Testing Strategy

### Visual Regression
- Test all breakpoints in Chromatic
- Validate component variants at each size
- Check touch targets (minimum 44x44px)

### Accessibility
- Test with screen readers at mobile scale
- Validate keyboard navigation
- Check color contrast at all sizes
- Ensure readable text without zooming

## Related Documentation
- [Design Tokens](../../design-system/design-tokens.md)
- [Component Library](../../03-component-system/component-library.md)
- [Testing Standards](./testing-standards.md)
