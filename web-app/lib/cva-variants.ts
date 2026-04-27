/**
 * CVA Variant Registry
 * =====================
 * Central source of truth for all component styling variants.
 * 
 * CRITICAL: This file MUST use ONLY semantic design tokens from Story 1.11.
 * Forbidden patterns: bg-blue-*, bg-gray-*, text-white, #hex values, etc.
 * Allowed patterns: bg-brand-primary, text-text-primary, bg-surface-primary, etc.
 * 
 * All variants are theme-aware and will automatically adapt when design tokens change.
 */

import { cva, type VariantProps } from 'class-variance-authority';

// =============================================================================
// HERO SECTION VARIANTS
// =============================================================================

/**
 * Hero Section Variants
 *
 * Controls the visual style and layout of the hero section component.
 * Story 2.2 AC2 requires CVA variants for Epic 1 components.
 *
 * Variant Dimensions:
 * - style: Visual theme (modern, classic, minimal, bold, elegant)
 * - layout: Content arrangement (centered, split, minimal)
 * - overlay: Background image overlay intensity
 * - height: Vertical height of hero section
 */
export const heroVariants = cva(
  // Base classes (always applied)
  "relative w-full overflow-hidden",
  {
    variants: {
      style: {
        modern: "bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted",
        classic: "bg-brand-secondary text-text-primary",
        minimal: "bg-surface-primary text-text-primary",
        bold: "bg-brand-primary text-text-inverted",
        elegant: "bg-surface-elevated text-text-primary border-b border-brand-secondary/subtle",
        // Story 20.10: Archetype-specific style variants
        "heritage-opulence": "bg-gradient-to-r from-brand-primary to-brand-primary/high text-text-inverted",
        "urban-tech": "bg-brand-primary text-text-inverted",
        "coastal-resort": "bg-surface-primary text-text-primary"
      },
      layout: {
        centered: "flex items-center justify-center text-center",
        split: "grid md:grid-cols-2 gap-hero items-center",
        minimal: "flex items-center justify-center",
        // Story 20.10: Archetype-specific layout variants
        "heritage-opulence": "grid md:grid-cols-2 gap-hero items-center",
        "urban-tech": "flex items-center justify-center text-center",
        "coastal-resort": "flex items-center justify-center text-center"
      },
      overlay: {
        none: "",
        light: "before:absolute before:inset-0 before:bg-brand-primary/30",
        dark: "before:absolute before:inset-0 before:bg-brand-primary/60",
        gradient: "before:absolute before:inset-0 before:bg-gradient-to-t before:from-brand-primary/70 before:to-transparent",
        // Story 20.10: Archetype-specific overlay variant
        "heritage-opulence": "before:absolute before:inset-0 before:bg-brand-primary/60"
      },
      height: {
        small: "min-h-hero-sm",
        medium: "min-h-hero-md",
        large: "min-h-hero-lg",
        fullscreen: "min-h-screen"
      }
    },
    compoundVariants: [
      {
        style: "minimal",
        overlay: ["dark", "gradient"],
        class: "text-text-primary" // Override for minimal + overlay
      },
      {
        layout: "centered",
        height: "fullscreen",
        class: "py-section" // Add padding for centered fullscreen
      },
      // CTA Button Scaling based on hero height
      {
        height: "small",
        class: "[&_.hero-cta]:px-6 [&_.hero-cta]:py-4 [&_.hero-cta]:text-sm [&_.hero-cta]:text-base [&_.hero-cta]:font-semibold"
      },
      {
        height: "medium",
        class: "[&_.hero-cta]:px-8 [&_.hero-cta]:py-6 [&_.hero-cta]:text-base [&_.hero-cta]:font-semibold [&_.hero-cta]:font-medium"
      },
      {
        height: "large",
        class: "[&_.hero-cta]:px-10 [&_.hero-cta]:py-7 [&_.hero-cta]:text-lg [&_.hero-cta]:font-semibold [&_.hero-cta]:font-medium"
      },
      {
        height: "fullscreen",
        class: "[&_.hero-cta]:px-12 [&_.hero-cta]:py-8 [&_.hero-cta]:text-xl [&_.hero-cta]:font-semibold [&_.hero-cta]:font-medium"
      },
      // WCAG Overlay Text Contrast: Dark overlay - switch dark text to light
      {
        style: ["minimal", "elegant"],
        overlay: "dark",
        class: "text-text-inverted"
      },
      // WCAG Overlay Text Contrast: Gradient overlay - switch dark text to light
      {
        style: ["minimal", "elegant"],
        overlay: "gradient",
        class: "text-text-inverted"
      },
      // WCAG Overlay Text Contrast: Light overlay - switch light text to dark
      {
        style: ["bold", "modern"],
        overlay: "light",
        class: "text-text-primary"
      }
    ],
    defaultVariants: {
      style: "modern",
      layout: "centered",
      overlay: "none",
      height: "medium"
    }
  }
);

// =============================================================================
// HERO SPLIT VARIANTS (Story 17.3)
// =============================================================================

/**
 * Hero Split Variants
 *
 * Scoped CVA variants specifically for HeroSplit sub-component.
 * HeroSplit has a structurally different layout (CSS Grid two-column)
 * from HeroCentered, so it uses its own scoped CVA for fine-grained control.
 *
 * Story 17.3: HeroSplit Sub-Component Implementation
 *
 * Variant Dimensions:
 * - imagePosition: Controls which column displays the image (left | right)
 * - textAlign: Controls text alignment within the text column (left | center)
 * - height: Controls the minimum height of the hero section (medium | large)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-blue-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, text-on-*
 */
export const heroSplitVariants = cva(
  // Base classes (always applied)
  // Grid layout: 2 columns on desktop, single column on mobile
  // Items vertically centered for proper alignment
  "grid md:grid-cols-2 gap-hero items-center w-full",
  {
    variants: {
      imagePosition: {
        // Image on right side (default), text on left
        right: "",
        // Image on left side, text on right
        // Uses order utilities to swap column positions visually
        left: "[&_.image-column]:order-1 [&_.text-column]:order-2",
      },
      textAlign: {
        // Text aligned left within the text column
        left: "[&_.text-column]:text-left [&_.text-column]:items-start",
        // Text centered within the text column
        center: "[&_.text-column]:text-center [&_.text-column]:items-center [&_.text-column]:justify-center",
      },
      height: {
        // Medium height - standard hero size
        medium: "min-h-hero-md",
        // Large height - more prominent hero
        large: "min-h-hero-lg",
      },
    },
    defaultVariants: {
      imagePosition: "right",
      textAlign: "left",
      height: "medium",
    },
  }
);

export type HeroSplitVariantProps = VariantProps<typeof heroSplitVariants>;

// =============================================================================
// HERO MINIMAL VARIANTS (Story 17.4)
// =============================================================================

/**
 * Hero Minimal Variants
 *
 * Scoped CVA variants specifically for HeroMinimal sub-component.
 * HeroMinimal has a structurally different layout (text-focused, no image)
 * from HeroCentered and HeroSplit, so it uses its own scoped CVA.
 *
 * Story 17.4: HeroMinimal Sub-Component Implementation
 *
 * Variant Dimensions:
 * - textAlign: Controls text alignment (left | center)
 * - height: Controls the minimum height of the hero section (small | medium)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-blue-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, text-on-*
 */
export const heroMinimalVariants = cva(
  // Base classes (always applied)
  // Flex layout for centering content vertically and horizontally
  "relative w-full flex items-center justify-center",
  {
    variants: {
      textAlign: {
        // Text aligned left
        left: "text-left",
        // Text centered
        center: "text-center",
      },
      height: {
        // Small height - compact hero
        small: "min-h-hero-sm",
        // Medium height - standard hero
        medium: "min-h-hero-md",
      },
    },
    defaultVariants: {
      textAlign: "left",
      height: "medium",
    },
  }
);

export type HeroMinimalVariantProps = VariantProps<typeof heroMinimalVariants>;

// =============================================================================
// IMAGE GALLERY VARIANTS
// =============================================================================

/**
 * Image Gallery Variants
 * 
 * Controls layout and styling for image gallery component.
 * Story 2.1 implements 3 layout variants: grid, masonry, carousel.
 * 
 * Variant Dimensions:
 * - layout: Grid system (grid, masonry, carousel)
 * - spacing: Gap between images
 * - aspectRatio: Image proportions
 * - columns: Number of columns (for grid layout)
 */
export const galleryVariants = cva(
  "w-full overflow-hidden",
  {
    variants: {
      layout: {
        grid: "grid",
        masonry: "block", // Masonry handled via columns
        carousel: "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
      },
      spacing: {
        tight: "gap-2 md:gap-3",
        normal: "gap-gap-card",
        loose: "gap-gap-section"
      },
      aspectRatio: {
        square: "[&_figure_.gallery-image-wrapper]:aspect-square",
        landscape: "[&_figure_.gallery-image-wrapper]:aspect-[4/3]",
        portrait: "[&_figure_.gallery-image-wrapper]:aspect-[3/4]"
      },
      columns: {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      },
      cardStyle: {
        default: "[&_figure]:bg-surface-elevated [&_figure]:shadow-card [&_figure]:border-2 [&_figure]:border-transparent [&_figure]:rounded-xl [&_figure]:overflow-hidden hover:[&_figure]:border-brand-secondary hover:[&_figure]:shadow-lg [&_figure]:transition-all [&_figure]:duration-300 [&_figure]:ease-out",
        minimal: "[&_figure]:bg-transparent [&_figure]:shadow-none [&_figure]:rounded-xl [&_figure]:overflow-hidden",
        flat: "[&_figure]:bg-surface-primary [&_figure]:border [&_figure]:border-border-default [&_figure]:shadow-sm [&_figure]:rounded-xl [&_figure]:overflow-hidden",
        elevated: "[&_figure]:bg-surface-elevated [&_figure]:shadow-xl [&_figure]:border-2 [&_figure]:border-brand-secondary/subtle [&_figure]:rounded-2xl [&_figure]:overflow-hidden hover:shadow-2xl transition-all duration-300",
        // Story 20.10: Archetype-specific cardStyle variants
        "heritage-opulence": "[&_figure]:bg-surface-elevated [&_figure]:shadow-xl [&_figure]:border-2 [&_figure]:border-brand-secondary/subtle [&_figure]:rounded-2xl [&_figure]:transition-all [&_figure]:duration-300 hover:[&_figure]:shadow-lg]",
        "urban-tech": "[&_figure]:bg-surface-primary [&_figure]:border [&_figure]:border-border-default [&_figure]:shadow-sm [&_figure]:rounded-xl"
      }
    },
    compoundVariants: [
      {
        layout: "masonry",
        columns: 2,
        class: "columns-1 sm:columns-2 space-y-4"
      },
      {
        layout: "masonry",
        columns: 3,
        class: "columns-1 sm:columns-2 lg:columns-3 space-y-4"
      },
      {
        layout: "masonry",
        columns: 4,
        class: "columns-2 sm:columns-3 lg:columns-4 space-y-4"
      },
      {
        layout: "carousel",
        spacing: "normal",
        class: "gap-5 py-8"
      },
      {
        layout: "carousel",
        spacing: "tight",
        class: "gap-3 py-8"
      },
      {
        layout: "carousel",
        spacing: "loose",
        class: "gap-8 py-8"
      }
    ],
    defaultVariants: {
      layout: "grid",
      spacing: "normal",
      aspectRatio: "landscape",
      columns: 3,
      cardStyle: "default"
    }
  }
);

// =============================================================================
// TYPE EXPORTS
// =============================================================================

/**
 * Variant Props Type Exports
 * 
 * These types are inferred from the CVA definitions above.
 * Use these in component props interfaces for type safety.
 * 
 * Example usage:
 * ```tsx
 * interface HeroSectionProps extends HeroVariantProps {
 *   heading: string;
 *   // ... other props
 * }
 * ```
 */
export type HeroVariantProps = VariantProps<typeof heroVariants>;
export type GalleryVariantProps = VariantProps<typeof galleryVariants>;

// =============================================================================
// NAVIGATION VARIANTS
// =============================================================================

export const navigationVariants = cva(
  "w-full z-nav transition-all duration-standard",
  {
    variants: {
      style: {
        transparent: "bg-transparent text-text-inverted",
        solid: "bg-surface-primary text-text-primary shadow-md",
        glass: "bg-surface-primary/high backdrop-blur-md text-text-primary border-b border-border-default",
        // Story 20.10: Archetype-specific style variants
        "heritage-opulence": "bg-surface-elevated text-text-primary shadow-md border-b border-border-default",
        "urban-tech": "bg-brand-primary text-text-inverted",
        "coastal-resort": "bg-surface-primary/high backdrop-blur-md text-text-primary border-b border-border-default"
      },
      layout: {
        classic: "h-20",
        compact: "h-nav-compact",
        extended: "h-nav-extended",
        default: "h-20", // Same as classic
        tall: "h-nav-extended", // Same as extended
        // Story 20.10: Archetype-specific layout variants
        "heritage-opulence": "h-20",
        "coastal-resort": "h-nav-classic"
      }
    },
    defaultVariants: {
      style: "solid",
      layout: "classic"
    }
  }
);

// =============================================================================
// NAVIGATION CLASSIC VARIANTS (Scoped for NavigationClassic component)
// =============================================================================

/**
 * Navigation Classic Variants
 *
 * Scoped CVA variants specifically for NavigationClassic sub-component.
 * Uses semantic design tokens only - no arbitrary values.
 *
 * Story 18.2: NavigationClassic Sub-Component Implementation
 */
export const navigationClassicVariants = cva(
  "w-full h-nav-classic z-nav transition-all duration-standard",
  {
    variants: {
      style: {
        transparent: "bg-transparent text-text-inverted",
        solid: "bg-surface-primary text-text-primary shadow-md",
        glass: "bg-surface-primary/high backdrop-blur-md text-text-primary border-b border-border-default"
      }
    },
    defaultVariants: {
      style: "solid"
    }
  }
);

export type NavigationVariantProps = VariantProps<typeof navigationVariants>;
export type NavigationClassicVariantProps = VariantProps<typeof navigationClassicVariants>;

// =============================================================================
// NAVIGATION COMPACT VARIANTS (Scoped for NavigationCompact component)
// =============================================================================

/**
 * Navigation Compact Variants
 *
 * Scoped CVA variants specifically for NavigationCompact sub-component.
 * NavigationCompact has a structurally different layout (single-row
 * centered-links with pill-style floating appearance) from NavigationClassic and
 * NavigationExtended, so it uses its own scoped CVA for fine-grained control.
 *
 * Story 18.4: NavigationCompact Sub-Component Implementation
 *
 * Variant Dimensions:
 * - style: Controls the visual theme (transparent | solid | glass)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-blue-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, text-on-*
 */
export const navigationCompactVariants = cva(
  // Base classes - Desktop: pill-style floating appearance | Mobile: no styling (handled by mobile container)
  "lg:my-4 lg:mx-auto lg:max-w-4xl lg:h-nav-compact lg:rounded-2xl lg:shadow-lg z-nav transition-all duration-standard",
  {
    variants: {
      style: {
        // Transparent style - for hero overlay placement
        transparent: "lg:bg-surface-primary/80 lg:backdrop-blur-sm lg:text-text-primary lg:border lg:border-border-default",
        // Solid style - default opaque background
        solid: "lg:bg-surface-primary lg:text-text-primary lg:shadow-md lg:border lg:border-border-default",
        // Glass style - glassmorphism effect with backdrop blur (slightly transparent)
        glass: "lg:bg-surface-primary/75 lg:backdrop-blur-md lg:text-text-primary lg:border lg:border-border-default lg:shadow-lg"
      }
    },
    defaultVariants: {
      style: "glass"
    }
  }
);

export type NavigationCompactVariantProps = VariantProps<typeof navigationCompactVariants>;

// =============================================================================
// NAVIGATION EXTENDED VARIANTS (Scoped for NavigationExtended component)
// =============================================================================

/**
 * Navigation Extended Variants
 *
 * Scoped CVA variants specifically for NavigationExtended sub-component.
 * NavigationExtended has a structurally different layout (two-row asymmetric
 * with integrated booking widget bar) from NavigationClassic and NavigationCompact,
 * so it uses its own scoped CVA for fine-grained control.
 *
 * Story 18.3: NavigationExtended Sub-Component Implementation
 *
 * Variant Dimensions:
 * - style: Controls the visual theme (transparent | solid | glass)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-blue-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, text-on-*
 */
export const navigationExtendedVariants = cva(
  // Base classes (always applied)
  "w-full z-nav transition-all duration-standard",
  {
    variants: {
      style: {
        // Transparent style - for hero overlay placement
        transparent: "bg-transparent text-text-inverted",
        // Solid style - default opaque background
        solid: "bg-surface-primary text-text-primary shadow-md",
        // Glass style - glassmorphism effect with backdrop blur
        glass: "bg-surface-primary/high backdrop-blur-md text-text-primary border-b border-border-default"
      }
    },
    defaultVariants: {
      style: "solid"
    }
  }
);

export type NavigationExtendedVariantProps = VariantProps<typeof navigationExtendedVariants>;

// =============================================================================
// ROOM CARD VARIANTS
// =============================================================================

export const roomCardVariants = cva(
  "group relative overflow-hidden rounded-2xl transition-all duration-300",
  {
    variants: {
      variant: {
        detailed: "bg-surface-primary shadow-card hover:shadow-card-hover border border-border-default",
        compact: "bg-surface-primary shadow-sm hover:shadow-md border border-border-default",
        grid: "bg-surface-elevated hover:bg-surface-primary border border-transparent hover:border-border-default"
      }
    },
    defaultVariants: {
      variant: "detailed"
    }
  }
);

export type RoomCardVariantProps = VariantProps<typeof roomCardVariants>;

// =============================================================================
// ROOM CARD IMAGE VARIANTS
// =============================================================================

export const roomCardImageVariants = cva(
  "relative w-full overflow-hidden",
  {
    variants: {
      height: {
        default: "aspect-video",
        tall: "aspect-[4/5]",
        wide: "aspect-[2/1]"
      }
    },
    defaultVariants: {
      height: "default"
    }
  }
);

export type RoomCardImageVariantProps = VariantProps<typeof roomCardImageVariants>;

// =============================================================================
// ROOM CARD BUTTON VARIANTS (AC3.3)
// =============================================================================

/**
 * Room Card Button Variants
 * AC3.3: Created to replace one-off button classes in RoomCardDetailed
 * Provides consistent styling for View Details and Book Now buttons
 */
export const roomCardButtonVariants = cva(
  'w-full px-4 py-2 rounded-lg font-medium transition-all duration-300',
  {
    variants: {
      variant: {
        outline: 'border-2 border-brand-primary/subtle text-brand-primary hover:border-brand-primary hover:bg-brand-primary-hover hover:text-on-brand',
        primary: 'bg-brand-primary text-on-brand hover:bg-brand-primary-hover hover:shadow-lg',
      }
    },
    defaultVariants: {
      variant: 'outline'
    }
  }
);

export type RoomCardButtonVariantProps = VariantProps<typeof roomCardButtonVariants>;

// =============================================================================
// BOOKING WIDGET VARIANTS
// =============================================================================

/**
 * Booking Widget Variants
 *
 * IMPORTANT: Background styling is handled by child components (BookingWidgetDesktop/Mobile)
 * which use semantic tokens (bg-surface-primary) that respond to the data-mode attribute.
 * This wrapper only provides text color theming to ensure text visibility.
 *
 * The data-mode attribute on the wrapper enables CSS variable cascade for nested components.
 * See: BookingWidget/index.tsx - wrapper div with data-mode={theme}
 */
export const bookingWidgetVariants = cva(
  "w-full transition-all duration-300",
  {
    variants: {
      variant: {
        // Layout/positioning only - backgrounds handled by child components
        desktop: "shadow-lg rounded-xl border border-border-default",
        mobile: "fixed bottom-0 left-0 right-0 border-t border-border-default z-40 shadow-lg"
      },
      theme: {
        // Text color theming - use text-primary (white in dark mode) for visibility
        // CRITICAL: text-text-inverted becomes dark (0 0% 3.9%) in dark mode, making text invisible
        light: "text-text-primary",  // Dark gray in light mode
        dark: "text-text-primary",   // White in dark mode (via data-mode CSS variable override)
        glass: "text-text-primary"
      }
    },
    defaultVariants: {
      variant: "desktop",
      theme: "light"
    }
  }
);

export type BookingWidgetVariantProps = VariantProps<typeof bookingWidgetVariants>;

// =============================================================================
// CONTACT FORM VARIANTS
// =============================================================================

export const contactFormVariants = cva(
  "w-full max-w-3xl mx-auto rounded-2xl p-6 sm:p-10 transition-all",
  {
    variants: {
      style: {
        default: "bg-surface-primary shadow-card border border-surface-secondary",
        minimal: "bg-transparent border-0 shadow-none p-0",
        floating: "bg-surface-primary shadow-xl -mt-20 relative z-10"
      },
      background: {
        none: "",
        brand: "bg-brand-primary/faint",
        muted: "bg-surface-muted"
      }
    },
    defaultVariants: {
      style: "default",
      background: "none"
    }
  }
);

export type ContactFormVariantProps = VariantProps<typeof contactFormVariants>;

// =============================================================================
// TESTIMONIALS VARIANTS
// =============================================================================

export const testimonialsVariants = cva(
  "w-full",
  {
    variants: {
      layout: {
        carousel: "relative overflow-hidden py-8",
        grid: "grid gap-gap-card",
        featured: "max-w-4xl mx-auto text-center"
      },
      columns: {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3"
      },
      cardStyle: {
        default: "[&_.testimonial-card]:bg-surface-primary [&_.testimonial-card]:border [&_.testimonial-card]:border-border-default [&_.testimonial-card]:shadow-sm",
        minimal: "[&_.testimonial-card]:bg-transparent [&_.testimonial-card]:border-0 [&_.testimonial-card]:shadow-none",
        elevated: "[&_.testimonial-card]:bg-surface-elevated [&_.testimonial-card]:shadow-card hover:[&_.testimonial-card]:shadow-card-hover"
      }
    },
    defaultVariants: {
      layout: "grid",
      columns: 3,
      cardStyle: "default"
    }
  }
);

export type TestimonialsVariantProps = VariantProps<typeof testimonialsVariants>;

// =============================================================================
// AMENITIES VARIANTS
// =============================================================================

export const amenitiesVariants = cva(
  "w-full",
  {
    variants: {
      layout: {
        grid: "grid gap-gap-card",
        list: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gap-card",
        featured: "flex flex-col md:flex-row md:flex-wrap justify-center gap-gap-card [&>article]:w-full [&>article]:md:w-[30%] [&>article]:md:max-w-amenity-card"
      },
      columns: {
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
      },
      iconSize: {
        small: "[&_.svg-inline--fa]:w-4 [&_.svg-inline--fa]:h-4 [&_.icon-wrapper]:w-8 [&_.icon-wrapper]:h-8 [&_.icon-wrapper]:p-2",
        medium: "[&_.svg-inline--fa]:w-5 [&_.svg-inline--fa]:h-5 [&_.icon-wrapper]:w-10 [&_.icon-wrapper]:h-10 [&_.icon-wrapper]:p-2.5",
        large: "[&_.svg-inline--fa]:w-8 [&_.svg-inline--fa]:h-8 [&_.icon-wrapper]:w-16 [&_.icon-wrapper]:h-16 [&_.icon-wrapper]:p-4"
      },
      iconStyle: {
        default: "[&_.icon-wrapper]:bg-brand-primary/wash [&_.icon-wrapper]:text-brand-primary group-hover:[&_.icon-wrapper]:bg-brand-primary group-hover:[&_.icon-wrapper]:text-on-brand",
        muted: "[&_.icon-wrapper]:bg-surface-muted [&_.icon-wrapper]:text-text-muted",
        colored: "[&_.icon-wrapper]:bg-brand-secondary/wash [&_.icon-wrapper]:text-brand-secondary"
      },
      cardStyle: {
        default: "[&_.amenity-card]:bg-surface-primary [&_.amenity-card]:border [&_.amenity-card]:border-border-default [&_.amenity-card]:shadow-sm [&_.amenity-list-item]:bg-transparent hover:[&_.amenity-list-item]:bg-surface-secondary/mid",
        minimal: "[&_.amenity-card]:bg-transparent [&_.amenity-card]:border-0 [&_.amenity-card]:shadow-none [&_.amenity-list-item]:bg-transparent",
        elevated: "[&_.amenity-card]:bg-surface-elevated [&_.amenity-card]:shadow-card hover:[&_.amenity-card]:shadow-card-hover hover:[&_.amenity-card]:-translate-y-1 [&_.amenity-card]:transition-all [&_.amenity-card]:duration-300 [&_.amenity-list-item]:bg-surface-elevated [&_.amenity-list-item]:shadow-sm hover:[&_.amenity-list-item]:shadow-md"
      }
    },
    defaultVariants: {
      layout: "grid",
      columns: 4,
      iconSize: "medium",
      iconStyle: "default",
      cardStyle: "default"
    }
  }
);

export type AmenitiesVariantProps = VariantProps<typeof amenitiesVariants>;

// =============================================================================
// FOOTER VARIANTS
// =============================================================================

/**
 * Footer Variants
 *
 * Story 19.1: Footer Block (3 Structural Variants)
 *
 * Controls the base styling and layout delegation for the Footer component.
 * The Footer router uses this CVA for base styles, then delegates to
 * scoped CVA functions for each sub-component variant.
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * Variant Dimensions:
 * - layout: Structural variant (classic, minimal, stacked)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values, hardcoded colors
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const footerVariants = cva(
  // Base classes (always applied)
  "w-full",
  {
    variants: {
      layout: {
        // Classic: Multi-column layout with all sections
        classic: "bg-surface-muted text-text-secondary border-t border-border-default",
        // Minimal: Single row with copyright + social icons only
        minimal: "bg-surface-primary text-text-secondary border-t border-border-default",
        // Stacked: Full-width stacked sections with optional newsletter
        stacked: "bg-surface-primary text-text-secondary border-t border-border-default"
      }
    },
    defaultVariants: {
      layout: "classic"
    }
  }
);

export type FooterVariantProps = VariantProps<typeof footerVariants>;

// =============================================================================
// FOOTER CLASSIC VARIANTS (Scoped for FooterClassic component)
// =============================================================================

/**
 * Footer Classic Variants
 *
 * Scoped CVA variants specifically for FooterClassic sub-component.
 * FooterClassic has a multi-column layout (3-4 columns on desktop,
 * stacked on mobile) with link columns, contact info, and social icons.
 *
 * Story 19.1: Footer Block - FooterClassic Sub-Component
 *
 * Variant Dimensions:
 * - columns: Number of columns (3 | 4)
 * - background: Background theme (muted | brand-primary | surface-elevated)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const footerClassicVariants = cva(
  // Base classes - Multi-column grid layout
  // Grid: 3-4 columns on desktop, single column on mobile
  "w-full grid gap-gap-section py-section-lg px-container",
  {
    variants: {
      columns: {
        // 3-column layout: Hotel info (2 cols) + Navigation + Social
        3: "grid-cols-1 md:grid-cols-3",
        // 4-column layout: Hotel info + 2 Navigation cols + Social
        4: "grid-cols-1 md:grid-cols-4"
      },
      background: {
        // Muted background for subtle appearance
        muted: "bg-surface-muted",
        // Brand primary background for branded footer
        "brand-primary": "bg-brand-primary text-text-inverted",
        // Elevated surface for card-like appearance
        "surface-elevated": "bg-surface-elevated"
      }
    },
    compoundVariants: [
      // Text color adjustment for brand-primary background
      {
        background: "brand-primary",
        class: "text-text-inverted [&_a]:hover:text-text-inverted/80"
      }
    ],
    defaultVariants: {
      columns: 4,
      background: "muted"
    }
  }
);

export type FooterClassicVariantProps = VariantProps<typeof footerClassicVariants>;

// =============================================================================
// FOOTER MINIMAL VARIANTS (Scoped for FooterMinimal component)
// =============================================================================

/**
 * Footer Minimal Variants
 *
 * Scoped CVA variants specifically for FooterMinimal sub-component.
 * FooterMinimal has a single-row flexbox layout with copyright text
 * and social media icons on the right.
 *
 * Story 19.1: Footer Block - FooterMinimal Sub-Component
 *
 * Variant Dimensions:
 * - align: Horizontal alignment (left | center)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const footerMinimalVariants = cva(
  // Base classes - Single-row flexbox layout
  "w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-section-md px-container border-t border-border-default",
  {
    variants: {
      align: {
        // Left-aligned content
        left: "sm:justify-start",
        // Centered content
        center: "sm:justify-center text-center"
      }
    },
    defaultVariants: {
      align: "left"
    }
  }
);

export type FooterMinimalVariantProps = VariantProps<typeof footerMinimalVariants>;

// =============================================================================
// FOOTER STACKED VARIANTS (Scoped for FooterStacked component)
// =============================================================================

/**
 * Footer Stacked Variants
 *
 * Scoped CVA variants specifically for FooterStacked sub-component.
 * FooterStacked has full-width vertically stacked sections including
 * optional newsletter signup, navigation links, address block, and copyright.
 *
 * Story 19.1: Footer Block - FooterStacked Sub-Component
 *
 * Variant Dimensions:
 * - newsletter: Include newsletter section (true | false)
 * - background: Base background theme (surface-primary | muted | brand-primary)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const footerStackedVariants = cva(
  // Base classes - Stacked sections layout
  "w-full flex flex-col",
  {
    variants: {
      newsletter: {
        // With newsletter section
        true: "",
        // Without newsletter section
        false: ""
      },
      background: {
        // Primary surface background
        "surface-primary": "bg-surface-primary text-text-secondary",
        // Muted background for subtle appearance
        muted: "bg-surface-muted text-text-secondary",
        // Brand primary background
        "brand-primary": "bg-brand-primary text-text-inverted"
      }
    },
    compoundVariants: [
      // Alternating background for newsletter section
      {
        newsletter: true,
        background: "surface-primary",
        class: "[&_.newsletter-section]:bg-surface-elevated [&_.newsletter-section]:text-text-primary"
      },
      {
        newsletter: true,
        background: "muted",
        class: "[&_.newsletter-section]:bg-surface-primary [&_.newsletter-section]:text-text-primary"
      },
      {
        newsletter: true,
        background: "brand-primary",
        class: "[&_.newsletter-section]:bg-brand-primary/high [&_.newsletter-section]:text-text-inverted"
      }
    ],
    defaultVariants: {
      newsletter: true,
      background: "surface-primary"
    }
  }
);

export type FooterStackedVariantProps = VariantProps<typeof footerStackedVariants>;

// =============================================================================
// ABOUT VARIANTS
// =============================================================================

/**
 * About Variants
 *
 * Story 19.2: About / Hotel Story Block (3 Structural Variants)
 *
 * Controls the base styling and layout delegation for the About component.
 * The About router uses this CVA for base styles, then delegates to
 * scoped CVA functions for each sub-component variant.
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * Variant Dimensions:
 * - layout: Structural variant (side-by-side, timeline, full-width)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values, hardcoded colors
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const aboutVariants = cva(
  // Base classes (always applied)
  "w-full",
  {
    variants: {
      layout: {
        // SideBySide: Two-column layout with image + text side by side
        "side-by-side": "bg-surface-primary text-text-primary",
        // Timeline: Vertical timeline with hotel history milestones
        "timeline": "bg-surface-primary text-text-primary",
        // FullWidth: Full-width background image with text overlay
        "full-width": "relative w-full overflow-hidden"
      }
    },
    defaultVariants: {
      layout: "side-by-side"
    }
  }
);

export type AboutVariantProps = VariantProps<typeof aboutVariants>;

// =============================================================================
// ABOUT SIDE-BY-SIDE VARIANTS (Scoped for AboutSideBySide component)
// =============================================================================

/**
 * About SideBySide Variants
 *
 * Scoped CVA variants specifically for AboutSideBySide sub-component.
 * AboutSideBySide has a two-column CSS Grid layout with image and text columns.
 *
 * Story 19.2: About Block - AboutSideBySide Sub-Component
 *
 * Variant Dimensions:
 * - imagePosition: Controls which column displays the image (left | right)
 * - textAlign: Controls text alignment within the text column (left | center)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const aboutSideBySideVariants = cva(
  // Base classes - Two-column grid layout
  // Grid: 2 columns on desktop, single column on mobile
  "grid md:grid-cols-2 gap-gap-section items-center w-full",
  {
    variants: {
      imagePosition: {
        // Image on right side (default), text on left
        right: "",
        // Image on left side, text on right
        // Uses order utilities to swap column positions visually
        left: "[&_.image-column]:order-1 [&_.text-column]:order-2"
      },
      textAlign: {
        // Text aligned left within the text column
        left: "[&_.text-column]:text-left",
        // Text centered within the text column
        center: "[&_.text-column]:text-center"
      }
    },
    defaultVariants: {
      imagePosition: "right",
      textAlign: "left"
    }
  }
);

export type AboutSideBySideVariantProps = VariantProps<typeof aboutSideBySideVariants>;

// =============================================================================
// ABOUT TIMELINE VARIANTS (Scoped for AboutTimeline component)
// =============================================================================

/**
 * About Timeline Variants
 *
 * Scoped CVA variants specifically for AboutTimeline sub-component.
 * AboutTimeline has a vertical timeline with center line and alternating entries.
 *
 * Story 19.2: About Block - AboutTimeline Sub-Component
 *
 * Variant Dimensions:
 * - entryAlignment: Controls how timeline entries align (alternating | left)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const aboutTimelineVariants = cva(
  // Base classes - Vertical timeline layout
  "w-full relative py-section-lg px-container",
  {
    variants: {
      entryAlignment: {
        // Entries alternate left/right on desktop, single column on mobile
        alternating: "",
        // All entries align to the left side
        left: ""
      }
    },
    defaultVariants: {
      entryAlignment: "alternating"
    }
  }
);

export type AboutTimelineVariantProps = VariantProps<typeof aboutTimelineVariants>;

// =============================================================================
// ABOUT FULL-WIDTH VARIANTS (Scoped for AboutFullWidth component)
// =============================================================================

/**
 * About FullWidth Variants
 *
 * Scoped CVA variants specifically for AboutFullWidth sub-component.
 * AboutFullWidth has a full-width background image with text overlay.
 *
 * Story 19.2: About Block - AboutFullWidth Sub-Component
 *
 * Variant Dimensions:
 * - overlay: Controls the overlay intensity for text readability
 * - textAlign: Controls text alignment (left | center)
 *
 * IMPORTANT: This CVA uses ONLY semantic tokens from the design system.
 * Forbidden: bg-gray-*, text-white, #hex values
 * Allowed: bg-brand-*, text-text-*, bg-surface-*, border-border-*
 */
export const aboutFullWidthVariants = cva(
  // Base classes - Full-width background image with overlay
  "relative w-full overflow-hidden",
  {
    variants: {
      overlay: {
        // No overlay (text directly on image)
        none: "",
        // Light overlay for better text readability
        light: "before:absolute before:inset-0 before:bg-brand-primary/30",
        // Dark overlay for better text readability
        dark: "before:absolute before:inset-0 before:bg-brand-primary/60",
        // Gradient overlay from bottom
        gradient: "before:absolute before:inset-0 before:bg-gradient-to-t before:from-brand-primary/70 before:to-transparent"
      },
      textAlign: {
        // Text aligned left
        left: "text-left",
        // Text centered
        center: "text-center"
      }
    },
    defaultVariants: {
      overlay: "gradient",
      textAlign: "center"
    }
  }
);

export type AboutFullWidthVariantProps = VariantProps<typeof aboutFullWidthVariants>;

// =============================================================================
// FAQ VARIANTS (Base for FAQ Section)
// =============================================================================

/**
 * FAQ Variants
 *
 * Story 19.3: FAQ Block - FAQ Section Router
 *
 * Base CVA variants for the FAQ section component.
 * The FAQ router delegates to FAQAccordion or FAQGrid based on layout.
 *
 * Variant Dimensions:
 * - layout: Controls which sub-component renders (accordion | grid)
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module lib/cva-variants
 */
export const faqVariants = cva(
  // Base classes (always applied)
  "w-full",
  {
    variants: {
      layout: {
        // Accordion: Expandable/collapsible FAQ items (default)
        "accordion": "w-full",
        // Grid: All Q&A pairs visible in a two-column grid layout
        "grid": "w-full"
      }
    },
    defaultVariants: {
      layout: "accordion"
    }
  }
);

export type FAQVariantProps = VariantProps<typeof faqVariants>;

// =============================================================================
// FEATURES VARIANTS (Base for Features/USP Section)
// =============================================================================

/**
 * Features Variants
 *
 * Story 19.4: Features / USP Block - Features Section Router
 *
 * Base CVA variants for the Features section component.
 * The Features router delegates to FeaturesIconGrid or FeaturesCards based on layout.
 *
 * Variant Dimensions:
 * - layout: Controls which sub-component renders (icon-grid | cards)
 * - columns: Controls grid column count on desktop (2 | 3 | 4)
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8, FR10
 *
 * @module lib/cva-variants
 */
export const featuresVariants = cva(
  // Base classes (always applied)
  "w-full",
  {
    variants: {
      layout: {
        // Icon grid: Compact icon-based grid layout (default)
        "icon-grid": "w-full",
        // Cards: Larger cards with optional images
        "cards": "w-full"
      },
      columns: {
        // 2 columns on desktop (good for cards with lots of content)
        2: "grid-cols-1 md:grid-cols-2",
        // 3 columns on desktop (balanced layout, default)
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        // 4 columns on desktop (compact, good for simple features)
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      }
    },
    defaultVariants: {
      layout: "icon-grid",
      columns: 3
    }
  }
);

export type FeaturesVariantProps = VariantProps<typeof featuresVariants>;
