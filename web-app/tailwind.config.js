/**
 * Tailwind CSS Configuration for Hotel Website Generator
 *
 * DESIGN SYSTEM ARCHITECTURE:
 * --------------------------
 * Color tokens are defined in globals.css via @theme inline + OKLCH.
 * Tailwind v4 auto-generates color utility classes from @theme inline.
 * This config only defines non-color extensions (fonts, spacing, shadows, etc.)
 */

module.exports = {
  // [LLM-FIXED] Content paths - do not modify
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx,css}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './styles/**/*.{js,ts,jsx,tsx,css}',
    './types/**/*.{ts,tsx}',
    './tests/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],

  // [LLM-FIXED] Dark mode strategy
  darkMode: ['class', '[data-mode="dark"]'],

  theme: {
    // [LLM-FIXED] Container configuration
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '3rem',
      },
      screens: {
        sm: '100%',
        md: '768px',
        lg: '1280px',
        xl: '1280px', // Max width cap
      },
    },

    extend: {
      // [LLM-CUSTOMIZABLE] Font Families
      // Maps to CSS variables injected by the theme engine
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },

      // [LLM-CUSTOMIZABLE] Font Sizes with Fluid Scale
      // Uses clamp() for smooth scaling between viewports without media queries
      fontSize: {
        // Static scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],

        // Fluid responsive scale (Story 1.11) - DRASTIC REDUCTION FROM OVER-ENLARGED VALUES
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.2vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.95rem + 0.3vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.5vw, 1.5rem)',
        'fluid-xl': 'clamp(1.25rem, 1rem + 1vw, 2rem)',      // Max 32px
        'fluid-2xl': 'clamp(1.75rem, 1.5rem + 2vw, 3rem)',    // Max 48px
        'fluid-3xl': 'clamp(2.5rem, 2rem + 4vw, 4rem)',      // Max 64px
      },

      // [LLM-CUSTOMIZABLE] Shadows
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-md)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
      },

      // [LLM-CUSTOMIZABLE] Border Radius
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius-md)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },

      // [LLM-CUSTOMIZABLE] Component Sizes
      size: {
        avatar: 'var(--size-avatar)',
        dot: 'var(--size-dot)',
        'image-card': 'var(--size-image-card)',
      },

      // [LLM-CUSTOMIZABLE] Common Heights
      height: {
        3: 'var(--h-3)',
        4: 'var(--h-4)',
        5: 'var(--h-5)',
        6: 'var(--h-6)',
        7: 'var(--h-7)',
        8: 'var(--h-8)',
        9: 'var(--h-9)',
        10: 'var(--h-10)',
        12: 'var(--h-12)',
        14: 'var(--h-14)',
        16: 'var(--h-16)',
        // Navigation heights - semantic tokens for navigation component heights
        'nav-height': 'var(--h-nav-height)',
        'nav-classic': 'var(--h-nav-classic)',
        'nav-compact': 'var(--h-nav-compact)',
        'nav-extended': 'var(--h-nav-extended)',
      },

      // [LLM-CUSTOMIZABLE] Common Widths
      width: {
        3: 'var(--w-3)',
        4: 'var(--w-4)',
        5: 'var(--w-5)',
        6: 'var(--w-6)',
        8: 'var(--w-8)',
        10: 'var(--w-10)',
        12: 'var(--w-12)',
        16: 'var(--w-16)',
        20: 'var(--w-20)',
        24: 'var(--w-24)',
        32: 'var(--w-32)',
        64: 'var(--w-64)',
      },

      // [LLM-CUSTOMIZABLE] Max Widths
      maxWidth: {
        xs: 'var(--max-w-xs)',
        sm: 'var(--max-w-sm)',
        md: 'var(--max-w-md)',
        lg: 'var(--max-w-lg)',
        xl: 'var(--max-w-xl)',
        '2xl': 'var(--max-w-2xl)',
        '3xl': 'var(--max-w-3xl)',
        '4xl': 'var(--max-w-4xl)',
        '5xl': 'var(--max-w-5xl)',
        '6xl': 'var(--max-w-6xl)',
        '7xl': 'var(--max-w-7xl)',
      },

      // [LLM-CUSTOMIZABLE] Gap
      gap: {
        1: 'var(--gap-1)',
        2: 'var(--gap-2)',
        3: 'var(--gap-3)',
        4: 'var(--gap-4)',
        5: 'var(--gap-5)',
        6: 'var(--gap-6)',
        8: 'var(--gap-8)',
      },

      // [LLM-CUSTOMIZABLE] Space Y Utilities
      // Note: Semantic spacing tokens (section, container, card, hero, gap-card, gap-section)
      // are defined in app/globals.css via @theme inline - CSS is the canonical source
      // Story 23.3: Removed unused x-1/x-2 entries (dead code - referenced non-existent --space-x-* vars)
      spacing: {
        'y-1': 'var(--space-y-1)',
        'y-2': 'var(--space-y-2)',
      },

      // [LLM-CUSTOMIZABLE] Opacity Tokens
      opacity: {
        'faint': '0.05',
        'wash': '0.1',
        'subtle': '0.2',
        'soft': '0.3',
        'mid': '0.5',
        'high': '0.8',
        'strong': '0.9',
        'glass': '0.95',
      },

      // [LLM-CUSTOMIZABLE] Z-Index
      zIndex: {
        negative: 'var(--z-negative)',
        base: 'var(--z-base)',
        elevated: 'var(--z-elevated)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        nav: 'var(--z-nav)',
        modal: 'var(--z-modal)',
        popover: 'var(--z-popover)',
        toast: 'var(--z-toast)',
        max: 'var(--z-max)',
      },

      // [LLM-FIXED] Breakpoints
      screens: {
        sm: '375px',
        md: '768px',
        lg: '1280px',
        xl: '1440px',
      },
    },
  },

  plugins: [
    require("tailwindcss-animate"),
  ],

  // Story 20.10: Archetype variant safelist for JIT compilation
  // Ensures Tailwind includes all archetype-specific CVA variant classes
  safelist: [
    // Hero archetype style variant patterns
    'heritage-opulence',
    'urban-tech',
    'coastal-resort',

    // Complex variant combinations that JIT might miss
    'bg-gradient-to-r',
    'from-brand-primary',
    'to-brand-primary/high',
    'text-text-inverted',
    'text-text-primary',
    'bg-surface-primary',
    'bg-surface-elevated',
    'bg-brand-primary',
    'bg-surface-primary/high',
    'backdrop-blur-md',
    'shadow-md',
    'border-b',
    'border-border-default',

    // Layout variants
    'md:grid-cols-2',
    'gap-hero',
    'justify-center',
    'text-center',
    'h-20',
    'h-nav-classic',

    // Overlay variants
    'before:absolute',
    'before:inset-0',
    'before:bg-brand-primary/60',
    'before:bg-gradient-to-t',
    'before:from-brand-primary/70',
    'before:to-transparent',

    // Gallery cardStyle variant patterns
    '[&_figure]:bg-surface-elevated',
    '[&_figure]:shadow-xl',
    '[&_figure]:border-2',
    '[&_figure]:border-brand-secondary/subtle',
    '[&_figure]:rounded-2xl',
    '[&_figure]:transition-all',
    'hover:[&_figure]:shadow-lg',
    'hover:[&_figure]:-translate-y-1',
    '[&_figure]:bg-surface-primary',
    '[&_figure]:border',
    '[&_figure]:border-border-default',
    '[&_figure]:shadow-sm',
    '[&_figure]:rounded-xl',
  ],
};

