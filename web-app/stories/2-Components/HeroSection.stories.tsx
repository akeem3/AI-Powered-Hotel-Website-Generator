import type { Meta, StoryObj } from '@storybook/react-vite';
import HeroSection from '@/components/sections/HeroSection';
import type { HeroVariantProps } from '@/lib/cva-variants';

const meta: Meta<typeof HeroSection> = {
  title: 'Components/Sections/HeroSection',
  component: HeroSection,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**HeroSection Component**

The HeroSection is the primary visual element at the top of hotel pages. It features a background image,
overlay options, and configurable content layout with call-to-action buttons.

## CVA Variants

- **style**: modern, classic, minimal, bold, elegant
- **layout**: centered, split, fullscreen
- **overlay**: none, light, dark, gradient
- **height**: small (400px), medium (600px), large (800px), fullscreen

## Design Tokens Used

- Backgrounds: bg-brand-primary, bg-brand-secondary, bg-surface-primary
- Text: text-on-brand, text-text-primary, text-brand-secondary
- Borders: border-brand-secondary, border-border-default
- Overlays: bg-brand-primary/30, bg-brand-primary/60
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'object',
      description: 'CVA variant configuration (style, layout, overlay, height)',
    },
    title: {
      control: 'text',
      description: 'Hotel name or title',
    },
    headline: {
      control: 'text',
      description: 'Main headline text',
    },
    tagline: {
      control: 'text',
      description: 'Small uppercase tagline above title',
    },
    description: {
      control: 'text',
      description: 'Optional description paragraph',
    },
  },
};

export default meta;
type Story = StoryObj<typeof HeroSection>;

// =============================================================================
// MOCK DATA
// =============================================================================

const mockHeroProps = {
  title: 'Grand Horizon Hotel',
  headline: 'Experience Luxury at Its Finest',
  tagline: 'Welcome to Paradise',
  description: 'Discover our award-winning hotel in the heart of the city, where elegance meets comfort and every detail is crafted for your ultimate relaxation.',
  primaryCTA: {
    text: 'Book Your Stay',
    href: '/booking',
    ariaLabel: 'Book your stay at Grand Horizon Hotel',
  },
  secondaryCTA: {
    text: 'Explore Rooms',
    href: '/rooms',
    ariaLabel: 'Explore our room options',
  },
  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80',
};

// =============================================================================
// STORIES
// =============================================================================

export const DefaultHero: Story = {
  name: 'Default Hero',

  parameters: {
    docs: {
      description: {
        story: 'Default state using modern style, centered layout, no overlay, and medium height.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'modern',
      layout: 'centered',
      overlay: 'none',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ModernCentered: Story = {
  name: 'Modern Centered',

  parameters: {
    docs: {
      description: {
        story: 'Modern gradient background with centered content layout.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'modern',
      layout: 'centered',
      overlay: 'none',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ClassicSplit: Story = {
  name: 'Classic Split',

  parameters: {
    docs: {
      description: {
        story: 'Classic brand secondary background with split layout (content left, image right on desktop).',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'classic',
      layout: 'split',
      overlay: 'none',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const MinimalFullscreen: Story = {
  name: 'Minimal Fullscreen',

  parameters: {
    docs: {
      description: {
        story: 'Minimal surface background with fullscreen height for immersive experience.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'minimal',
      layout: 'centered',
      overlay: 'none',
      height: 'fullscreen',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const BoldGradient: Story = {
  name: 'Bold with Gradient Overlay',

  parameters: {
    docs: {
      description: {
        story: 'Bold brand primary background with gradient overlay for enhanced text readability.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'bold',
      layout: 'centered',
      overlay: 'gradient',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ElegantSplit: Story = {
  name: 'Elegant Split',

  parameters: {
    docs: {
      description: {
        story: 'Elevated surface with border accent, using split layout.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'elegant',
      layout: 'split',
      overlay: 'none',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const DarkOverlay: Story = {
  name: 'Minimal with Dark Overlay',

  parameters: {
    docs: {
      description: {
        story: 'Minimal style with dark overlay (60% opacity) for strong text contrast on background images.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'minimal',
      layout: 'centered',
      overlay: 'dark',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const LightOverlay: Story = {
  name: 'Bold with Light Overlay',

  parameters: {
    docs: {
      description: {
        story: 'Bold style with light overlay (30% opacity) for subtle text enhancement.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'bold',
      layout: 'centered',
      overlay: 'light',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const SmallHeight: Story = {
  name: 'Modern Small Height',

  parameters: {
    docs: {
      description: {
        story: 'Modern style with small height (400px) for compact hero sections.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'modern',
      layout: 'centered',
      overlay: 'none',
      height: 'small',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const TallHeight: Story = {
  name: 'Classic Large Height',

  parameters: {
    docs: {
      description: {
        story: 'Classic style with large height (800px) for dramatic hero sections.',
      },
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'classic',
      layout: 'centered',
      overlay: 'none',
      height: 'large',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

// =============================================================================
// RESPONSIVE STORIES
// =============================================================================

export const ResponsiveDefault: Story = {
  name: '📱 Responsive (Mobile/Tablet/Desktop)',

  parameters: {
    docs: {
      description: {
        story: 'Default hero demonstrating responsive behavior across all viewport sizes. Use viewport addon to switch between mobile (375px), tablet (768px), and desktop (1280px).',
      },
    },

    // Chromatic: Capture at all 4 breakpoints for responsive testing
    chromatic: {
      viewports: [375, 768, 1280, 1920],
    }
  },

  args: {
    ...mockHeroProps,
    variant: {
      style: 'modern',
      layout: 'centered',
      overlay: 'none',
      height: 'medium',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};
