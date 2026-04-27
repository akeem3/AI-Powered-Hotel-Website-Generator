/**
 * Tailwind Semantic Token Allowlist
 * ====================================
 *
 * Story 20.7: Semantic Token Allowlist for CVA Variant Validation
 *
 * A hand-curated Set<string> of ~330 semantic classes derived from
 * globals.css @theme definitions and all CVA variant usages. This is the
 * explicit allowlist that constrains AI-generated CVA class strings to our
 * design system tokens.
 *
 * IMPORTANT: This is NOT a comprehensive Tailwind class list — it is scoped
 * strictly to semantic design tokens that derive from @theme definitions.
 *
 * Categories:
 * - Backgrounds: Semantic color backgrounds (bg-brand-*, bg-surface-*, bg-transparent)
 * - Gradients: Gradient utilities (bg-gradient-*, from-*, to-*)
 * - Text: Semantic text colors (text-text-*, text-brand-*, text-on-*)
 * - Borders: Border utilities (border-*, border-border-*, border-brand-*)
 * - Layout: Core layout utilities (flex, grid, items-*, justify-*)
 * - Spacing: Gap and padding utilities (gap-*, p-*, px-*, py-*)
 * - Sizing: Width, height, and aspect ratio utilities (w-*, h-*, min-h-*, aspect-*)
 * - Effects: Shadows, rounded corners, backdrop blur (shadow-*, rounded-*, backdrop-blur-*)
 * - Transitions: Animation utilities (transition-*, duration-*, ease-*)
 * - Responsive: Breakpoint-specific utilities (md:*, lg:*, sm:*)
 * - Pseudo-elements: Before/after pseudo-element utilities (before:*)
 * - Element selectors: Child element targeting ([&_...] pattern for CVA compound variants)
 * - Positioning: Position utilities (relative, absolute, fixed, z-*)
 * - Overflow: Overflow utilities (overflow-*, snap-*)
 * - Typography: Font utilities (font-*)
 * - State: Hover and focus states (hover:*, focus:*)
 * - Other: Miscellaneous utilities (scrollbar-hide, group, order-*, columns-*, space-y-*)
 *
 * Maintenance:
 * - Update when globals.css @theme definitions change (rare — stable semantic names)
 * - Update when cva-variants.ts adds new class strings (verify 100% coverage)
 * - Source of truth: docs/epics/epic-20.diversity_ai-driven-design-token-cva-diversity_planning_2026-02-27.md
 *
 * @module lib/style-generation/tailwind-allowlist
 */

/**
 * Hand-curated allowlist of semantic Tailwind classes.
 *
 * This Set contains all valid semantic design token classes that can be used in
 * CVA variant definitions. Any class string not in this allowlist will be rejected
 * by validateSemanticClasses().
 *
 * The allowlist is organized by category for maintainability, but stored as a flat
 * Set for O(1) lookup performance during validation.
 *
 * Categories:
 * 1. Backgrounds (18 classes)
 * 2. Gradients (9 classes)
 * 3. Text colors (7 classes)
 * 4. Borders (13 classes)
 * 5. Layout utilities (7 classes)
 * 6. Spacing - gaps (8 classes)
 * 7. Spacing - padding (15 classes)
 * 8. Sizing - widths/heights (20+ classes)
 * 9. Effects - shadows (8 classes)
 * 10. Effects - rounded corners (5 classes)
 * 11. Effects - backdrop blur (3 classes)
 * 12. Transitions (5 classes)
 * 13. Responsive prefixes (3 prefixes)
 * 14. Pseudo-elements (7 classes)
 * 15. Element selectors ([&_...] pattern, 80+ classes)
 * 16. Positioning (6 classes)
 * 17. Overflow (4 classes)
 * 18. Typography (5 classes)
 * 19. State modifiers (2 prefixes)
 * 20. Other utilities (10 classes)
 *
 * Total: ~330 classes (including responsive/state variants and element selectors)
 */
export const SEMANTIC_TOKEN_ALLOWLIST = new Set<string>([
  // ==================================================================================
  // BACKGROUNDS (18 classes)
  // ==================================================================================
  'bg-brand-primary',
  'bg-brand-secondary',
  'bg-brand-primary-hover',
  'bg-brand-primary/high',
  'bg-brand-primary/30',
  'bg-brand-primary/60',
  'bg-brand-primary/70',
  'bg-brand-primary/75',
  'bg-brand-primary/80',
  'bg-brand-primary/faint',
  'bg-brand-primary/wash',
  'bg-brand-secondary/subtle',
  'bg-brand-secondary/wash',
  'bg-surface-primary',
  'bg-surface-primary/high',
  'bg-surface-elevated',
  'bg-surface-muted',
  'bg-surface-secondary',
  'bg-surface-secondary/mid',
  'bg-transparent',

  // ==================================================================================
  // GRADIENTS (9 classes)
  // ==================================================================================
  'bg-gradient-to-r',
  'bg-gradient-to-t',
  'bg-gradient-to-b',
  'bg-gradient-to-br',
  'from-brand-primary',
  'from-brand-primary/70',
  'to-brand-primary/high',
  'to-transparent',

  // ==================================================================================
  // TEXT COLORS (7 classes)
  // ==================================================================================
  'text-text-primary',
  'text-text-secondary',
  'text-text-inverted',
  'text-text-muted',
  'text-on-brand',
  'text-brand-primary',
  'text-brand-secondary',

  // ==================================================================================
  // BORDERS (13 classes)
  // ==================================================================================
  'border',
  'border-0',
  'border-2',
  'border-b',
  'border-b-2',
  'border-t',
  'border-border-default',
  'border-border-strong',
  'border-brand-primary',
  'border-brand-secondary',
  'border-brand-primary/subtle',
  'border-brand-secondary/subtle',
  'border-transparent',

  // ==================================================================================
  // LAYOUT UTILITIES (7 classes)
  // ==================================================================================
  'flex',
  'grid',
  'inline-grid',
  'flex-col',
  'flex-wrap',
  'items-center',
  'items-start',
  'justify-center',
  'justify-between',
  'text-center',
  'text-left',

  // ==================================================================================
  // SPACING - GAPS (8 classes)
  // ==================================================================================
  'gap-2',
  'gap-3',
  'gap-4',
  'gap-5',
  'gap-6',
  'gap-8',
  'gap-hero',
  'gap-gap-card',
  'gap-gap-section',

  // ==================================================================================
  // SPACING - PADDING (15 classes)
  // ==================================================================================
  'p-2',
  'p-2.5',
  'p-4',
  'p-6',
  'p-8',
  'p-10',
  'px-4',
  'px-6',
  'px-8',
  'px-10',
  'py-4',
  'py-6',
  'py-7',
  'py-8',
  'py-section',
  'py-section-md',
  'py-section-lg',
  'py-20',
  'px-container',

  // ==================================================================================
  // SIZING - WIDTHS (15+ classes)
  // ==================================================================================
  'w-full',
  'w-3',
  'w-4',
  'w-5',
  'w-6',
  'w-7',
  'w-8',
  'w-9',
  'w-10',
  'w-12',
  'w-16',
  'w-20',
  'w-24',
  'w-32',
  'w-64',
  'w-[30%]',
  'max-w-xs',
  'max-w-3xl',
  'max-w-4xl',
  'max-w-amenity-card',

  // ==================================================================================
  // SIZING - HEIGHTS (15+ classes)
  // ==================================================================================
  'h-full',
  'h-3',
  'h-4',
  'h-5',
  'h-6',
  'h-7',
  'h-8',
  'h-9',
  'h-10',
  'h-12',
  'h-14',
  'h-16',
  'h-20',
  'h-nav-classic',
  'h-nav-compact',
  'h-nav-extended',
  'min-h-hero-sm',
  'min-h-hero-md',
  'min-h-hero-lg',
  'min-h-screen',

  // ==================================================================================
  // SIZING - ASPECT RATIOS (6 classes)
  // ==================================================================================
  'aspect-video',
  'aspect-square',
  'aspect-[4/3]',
  'aspect-[3/4]',
  'aspect-[4/5]',
  'aspect-[2/1]',

  // ==================================================================================
  // EFFECTS - SHADOWS (8 classes)
  // ==================================================================================
  'shadow-sm',
  'shadow-md',
  'shadow-lg',
  'shadow-xl',
  'shadow-2xl',
  'shadow-card',
  'shadow-card-hover',

  // ==================================================================================
  // EFFECTS - ROUNDED CORNERS (5 classes)
  // ==================================================================================
  'rounded-lg',
  'rounded-xl',
  'rounded-2xl',
  'rounded-full',

  // ==================================================================================
  // EFFECTS - BACKDROP BLUR (3 classes)
  // ==================================================================================
  'backdrop-blur-sm',
  'backdrop-blur-md',

  // ==================================================================================
  // TRANSITIONS (5 classes)
  // ==================================================================================
  'transition-all',
  'duration-300',
  'duration-standard',
  'ease-out',
  'ease-standard',

  // ==================================================================================
  // RESPONSIVE PREFIXES (used with other utilities)
  // ==================================================================================
  // Note: These prefixes are combined with other classes (e.g., md:grid-cols-2)
  // The individual responsive-variant classes are listed in their respective categories

  // ==================================================================================
  // RESPONSIVE GRID COLUMNS (6 classes)
  // ==================================================================================
  'grid-cols-1',
  'md:grid-cols-2',
  'md:grid-cols-3',
  'md:grid-cols-4',
  'lg:grid-cols-3',
  'lg:grid-cols-4',
  'sm:columns-2',
  'sm:columns-3',
  'lg:columns-4',
  'columns-1',
  'columns-2',

  // ==================================================================================
  // RESPONSIVE OTHER (10+ classes)
  // ==================================================================================
  'sm:flex-row',
  'sm:justify-start',
  'sm:justify-center',
  'sm:columns-2',
  'sm:grid-cols-2',
  'sm:p-10',
  'md:gap-3',
  'md:w-[30%]',
  'md:max-w-amenity-card',
  'lg:my-4',
  'lg:mx-auto',
  'lg:max-w-4xl',
  'lg:h-nav-compact',
  'lg:rounded-2xl',
  'lg:shadow-lg',
  'lg:bg-surface-primary/80',
  'lg:bg-surface-primary/75',
  'lg:backdrop-blur-sm',
  'lg:backdrop-blur-md',
  'lg:text-text-primary',
  'lg:border',
  'lg:border-border-default',
  'lg:shadow-lg',
  'lg:shadow-md',
  'sm:text-center',
  'md:text-left',

  // ==================================================================================
  // PSEUDO-ELEMENTS (7 classes)
  // ==================================================================================
  'before:absolute',
  'before:inset-0',
  'before:bg-brand-primary/30',
  'before:bg-brand-primary/60',
  'before:bg-brand-primary/70',
  'before:bg-gradient-to-t',
  'before:from-brand-primary/70',
  'before:to-transparent',

  // ==================================================================================
  // POSITIONING (6 classes)
  // ==================================================================================
  'relative',
  'absolute',
  'fixed',
  'inset-0',
  'bottom-0',
  'left-0',
  'right-0',

  // ==================================================================================
  // Z-INDEX (4 classes)
  // ==================================================================================
  'z-nav',
  'z-10',
  'z-40',
  'z-base',

  // ==================================================================================
  // OVERFLOW (4 classes)
  // ==================================================================================
  'overflow-hidden',
  'overflow-x-auto',
  'snap-x',
  'snap-mandatory',

  // ==================================================================================
  // TYPOGRAPHY (5 classes)
  // ==================================================================================
  'font-semibold',
  'font-medium',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',

  // ==================================================================================
  // STATE MODIFIERS (used as prefixes with other utilities)
  // ==================================================================================
  // Note: Hover and focus variants are combined with other classes
  // Examples: hover:shadow-lg, hover:bg-surface-primary
  'hover:border-border-default',
  'hover:shadow-card-hover',
  'hover:shadow-lg',
  'hover:shadow-2xl',
  'hover:-translate-y-1',
  'hover:-translate-y-2',
  '-translate-y-1',
  '-translate-y-2',
  'hover:bg-surface-primary',
  'hover:bg-surface-secondary/mid',
  'hover:text-text-inverted/80',
  'hover:[&_figure]:border-brand-secondary',
  'hover:[&_figure]:shadow-lg',
  'hover:[&_figure]:-translate-y-1',
  'hover:shadow-2xl',
  'hover:[&_figure]:shadow-card-hover',
  'hover:[&_figure]:-translate-y-1',
  'hover:[&_amenity-list-item]:bg-surface-secondary/mid',
  'hover:[&_amenity-list-item]:shadow-md',
  'group-hover:[&_.icon-wrapper]:bg-brand-primary',
  'group-hover:[&_.icon-wrapper]:text-on-brand',

  // ==================================================================================
  // ELEMENT SELECTORS ([&_...] pattern for targeting child elements in CVA)
  // ==================================================================================
  // Hero CTA element selectors
  '[&_.hero-cta]:px-6',
  '[&_.hero-cta]:py-4',
  '[&_.hero-cta]:text-sm',
  '[&_.hero-cta]:text-base',
  '[&_.hero-cta]:font-semibold',
  '[&_.hero-cta]:px-8',
  '[&_.hero-cta]:py-6',
  '[&_.hero-cta]:font-medium',
  '[&_.hero-cta]:px-10',
  '[&_.hero-cta]:py-7',
  '[&_.hero-cta]:text-lg',
  '[&_.hero-cta]:px-12',
  '[&_.hero-cta]:py-8',
  '[&_.hero-cta]:text-xl',
  // Image/Text column selectors
  '[&_.image-column]:order-1',
  '[&_.text-column]:order-2',
  '[&_.text-column]:text-left',
  '[&_.text-column]:items-start',
  '[&_.text-column]:text-center',
  '[&_.text-column]:items-center',
  '[&_.text-column]:justify-center',
  // Gallery image wrapper selectors
  '[&_figure_.gallery-image-wrapper]:aspect-square',
  '[&_figure_.gallery-image-wrapper]:aspect-[4/3]',
  '[&_figure_.gallery-image-wrapper]:aspect-[3/4]',
  // Figure selectors (gallery cards)
  '[&_figure]:bg-surface-elevated',
  '[&_figure]:shadow-card',
  '[&_figure]:border-2',
  '[&_figure]:border-transparent',
  '[&_figure]:rounded-xl',
  '[&_figure]:overflow-hidden',
  '[&_figure]:bg-transparent',
  '[&_figure]:shadow-none',
  '[&_figure]:bg-surface-primary',
  '[&_figure]:border',
  '[&_figure]:border-border-default',
  '[&_figure]:shadow-sm',
  '[&_figure]:shadow-xl',
  '[&_figure]:border-brand-secondary/subtle',
  '[&_figure]:rounded-2xl',
  '[&_figure]:transition-all',
  '[&_figure]:duration-300',
  '[&_figure]:ease-out',
  // Testimonial card selectors
  '[&_.testimonial-card]:bg-surface-primary',
  '[&_.testimonial-card]:border',
  '[&_.testimonial-card]:border-border-default',
  '[&_.testimonial-card]:shadow-sm',
  '[&_.testimonial-card]:bg-transparent',
  '[&_.testimonial-card]:border-0',
  '[&_.testimonial-card]:shadow-none',
  '[&_.testimonial-card]:bg-surface-elevated',
  '[&_.testimonial-card]:shadow-card',
  'hover:[&_.testimonial-card]:shadow-card-hover',
  // SVG icon selectors
  '[&_.svg-inline--fa]:w-4',
  '[&_.svg-inline--fa]:h-4',
  '[&_.icon-wrapper]:w-8',
  '[&_.icon-wrapper]:h-8',
  '[&_.icon-wrapper]:p-2',
  '[&_.svg-inline--fa]:w-5',
  '[&_.svg-inline--fa]:h-5',
  '[&_.icon-wrapper]:w-10',
  '[&_.icon-wrapper]:h-10',
  '[&_.icon-wrapper]:p-2.5',
  '[&_.svg-inline--fa]:w-8',
  '[&_.svg-inline--fa]:h-8',
  '[&_.icon-wrapper]:w-16',
  '[&_.icon-wrapper]:h-16',
  '[&_.icon-wrapper]:p-4',
  '[&_.icon-wrapper]:bg-brand-primary/wash',
  '[&_.icon-wrapper]:text-brand-primary',
  '[&_.icon-wrapper]:bg-surface-muted',
  '[&_.icon-wrapper]:text-text-muted',
  '[&_.icon-wrapper]:bg-brand-secondary/wash',
  '[&_.icon-wrapper]:text-brand-secondary',
  // Amenity card selectors
  '[&_.amenity-card]:bg-surface-primary',
  '[&_.amenity-card]:border',
  '[&_.amenity-card]:border-border-default',
  '[&_.amenity-card]:shadow-sm',
  '[&_.amenity-list-item]:bg-transparent',
  '[&_.amenity-card]:bg-transparent',
  '[&_.amenity-card]:border-0',
  '[&_.amenity-card]:shadow-none',
  '[&_.amenity-card]:bg-surface-elevated',
  '[&_.amenity-card]:shadow-card',
  '[&_.amenity-card]:transition-all',
  '[&_.amenity-card]:duration-300',
  '[&_.amenity-list-item]:bg-surface-elevated',
  '[&_.amenity-list-item]:shadow-sm',
  // Newsletter section selectors
  '[&_.newsletter-section]:bg-surface-elevated',
  '[&_.newsletter-section]:text-text-primary',
  '[&_.newsletter-section]:bg-surface-primary',
  '[&_.newsletter-section]:bg-brand-primary/high',
  '[&_.newsletter-section]:text-text-inverted',
  // Link anchor selectors
  '[&_a]:hover:text-text-inverted/80',

  // ==================================================================================
  // OTHER UTILITIES (10 classes)
  // ==================================================================================
  'scrollbar-hide',
  'group',
  'order-1',
  'order-2',
  'space-y-4',
  'mx-auto',
  '-mt-20',
  'block',
  'border-t',
  'border-border-default',
]);

/**
 * Validates that a class string contains only semantic design token classes.
 *
 * This function parses a space-separated class string and validates each class
 * against the SEMANTIC_TOKEN_ALLOWLIST. Returns a validation result indicating
 * whether all classes are valid and listing any invalid classes found.
 *
 * @param classString - A space-separated string of Tailwind classes (e.g., "bg-brand-primary text-text-primary p-4")
 * @returns An object with:
 *   - valid: boolean - true if all classes are in the allowlist
 *   - invalidClasses: string[] - array of classes not in the allowlist (empty if valid)
 *
 * @example
 * ```ts
 * // Valid semantic classes
 * validateSemanticClasses("bg-brand-primary text-text-primary p-4")
 * // => { valid: true, invalidClasses: [] }
 *
 * // Invalid: raw color class
 * validateSemanticClasses("bg-blue-500 text-white")
 * // => { valid: false, invalidClasses: ["bg-blue-500", "text-white"] }
 *
 * // Invalid: arbitrary utility
 * validateSemanticClasses("bg-slate-100")
 * // => { valid: false, invalidClasses: ["bg-slate-100"] }
 *
 * // Empty string
 * validateSemanticClasses("")
 * // => { valid: true, invalidClasses: [] }
 * ```
 */
export function validateSemanticClasses(classString: string): {
  valid: boolean;
  invalidClasses: string[];
} {
  // Handle empty or whitespace-only strings
  if (!classString || classString.trim().length === 0) {
    return { valid: true, invalidClasses: [] };
  }

  // Split by whitespace and filter out empty strings
  const classes = classString.trim().split(/\s+/).filter(Boolean);

  // Check each class against the allowlist
  const invalidClasses: string[] = [];
  for (const cls of classes) {
    if (!SEMANTIC_TOKEN_ALLOWLIST.has(cls)) {
      invalidClasses.push(cls);
    }
  }

  return {
    valid: invalidClasses.length === 0,
    invalidClasses,
  };
}

/**
 * Type guard to check if a class string is valid.
 *
 * @param classString - A space-separated string of Tailwind classes
 * @returns true if all classes are in the allowlist, false otherwise
 *
 * @example
 * ```ts
 * if (isValidSemanticClassString("bg-brand-primary text-text-primary")) {
 *   // Safe to use in CVA variants
 * }
 * ```
 */
export function isValidSemanticClassString(classString: string): boolean {
  return validateSemanticClasses(classString).valid;
}

/**
 * Gets all invalid classes from a class string.
 *
 * @param classString - A space-separated string of Tailwind classes
 * @returns Array of invalid class names (empty if all valid)
 *
 * @example
 * ```ts
 * const invalid = getInvalidClasses("bg-brand-primary bg-blue-500 p-4");
 * // => ["bg-blue-500"]
 * ```
 */
export function getInvalidClasses(classString: string): string[] {
  return validateSemanticClasses(classString).invalidClasses;
}

/**
 * Checks if a single class is in the semantic allowlist.
 *
 * @param className - A single Tailwind class name
 * @returns true if the class is in the allowlist, false otherwise
 *
 * @example
 * ```ts
 * isAllowedClass("bg-brand-primary") // true
 * isAllowedClass("bg-blue-500")      // false
 * ```
 */
export function isAllowedClass(className: string): boolean {
  return SEMANTIC_TOKEN_ALLOWLIST.has(className);
}
