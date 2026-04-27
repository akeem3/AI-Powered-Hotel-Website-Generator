# HeroSection Component

Router component that delegates to structurally distinct hero sub-components based on `variant.layout`.

## Architecture (Story 17.1)

**Router Pattern**: This component follows the same delegation pattern as `RoomCard` and `ImageGallery` - it validates props and routes to the appropriate sub-component based on the `variant.layout` property.

## Sub-Components

| Component | Layout | Status | Description |
|-----------|--------|--------|-------------|
| `HeroCentered` | `layout: "centered"` | ✅ Implemented (delegates to HeroContent) | Full-bleed background image with centered text overlay. Classic hero layout. |
| `HeroSplit` | `layout: "split"` | 🚧 Stub (Story 17.3) | CSS Grid two-column layout with text column and image column side-by-side. |
| `HeroMinimal` | `layout: "minimal"` | 🚧 Stub (Story 17.4) | Typography-focused design with no full-bleed background image. |

## Layout Values

### Current (Story 17.1)
- `centered` - Full-bleed centered layout (default)
- `split` - Two-column grid layout
- `minimal` - Typography-focused minimal layout

### Deprecated
- `fullscreen` - **Deprecated**. Use `layout: "centered"` + `height: "fullscreen"` instead.

The router automatically converts legacy `fullscreen` layouts to `centered` with `height: "fullscreen"` for backward compatibility.

## Backward Compatibility

- ✅ Legacy `layout: "fullscreen"` values are automatically converted
- ✅ Unknown layout values fall back to `centered` without errors
- ✅ All existing fixtures continue to work without modification

## Animation Support

- `HeroCentered`: Supports animations via `AnimatedHeroSection` client wrapper
- `HeroSplit`: Will support animations (pending Story 17.3)
- `HeroMinimal`: Does NOT support animations (typography-focused, no motion)

## Examples

```tsx
// Centered layout with fullscreen height
<HeroSection
  title="Grand Luxury Hotel"
  headline="Experience Elegance"
  variant={{ layout: 'centered', height: 'fullscreen' }}
  image="https://example.com/hero.jpg"
  primaryCTA={{ text: 'Book Now', href: '/booking' }}
/>

// Split layout for business hotels
<HeroSection
  title="Business Hotel"
  headline="Stay Productive"
  variant={{ layout: 'split', style: 'modern' }}
  primaryCTA={{ text: 'Book Now', href: '/booking' }}
/>

// Minimal layout for budget hotels
<HeroSection
  title="Budget Stay"
  headline="Simple. Clean. Affordable."
  variant={{ layout: 'minimal', style: 'minimal' }}
  primaryCTA={{ text: 'Check Availability', href: '/booking' }}
/>

// Legacy fullscreen (automatically converted)
<HeroSection
  title="The Azure Boutique"
  variant={{ layout: 'fullscreen' as any }} // Converts to centered + fullscreen height
  image="https://example.com/hero.jpg"
/>
```

## File Structure

```
HeroSection/
├── index.tsx                      # Router component (validates & delegates)
├── HeroCentered.tsx               # Centered layout (delegates to HeroContent)
├── HeroSplit.tsx                  # Split layout (STUB - Story 17.3)
├── HeroMinimal.tsx                # Minimal layout (STUB - Story 17.4)
├── HeroContent.tsx                # Original hero content (used by HeroCentered)
├── AnimatedHeroSection.client.tsx # Animation wrapper (client component)
└── README.md                      # This file
```

## Epic Reference

- **Epic 17**: Hero Section Structural Variants
- **Story 17.1**: Hero Router Refactor (✅ Complete)
- **Story 17.2**: HeroCentered Sub-Component (✅ Complete)
- **Story 17.3**: HeroSplit Sub-Component (✅ Complete)
- **Story 17.4**: HeroMinimal Sub-Component (✅ Complete)
- **Story 17.5**: Fixture Integration (✅ Complete)
- **Story 17.6**: Hero Variant Tests (✅ Complete)

See: `docs/epics/epic-17.diversity_hero-structural-variants_done_2026-02-27.md`
