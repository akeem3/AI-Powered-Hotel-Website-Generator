import type { Meta, StoryObj } from '@storybook/react-vite';
import Navigation from '@/components/blocks/Navigation';
import type { NavigationVariantProps } from '@/lib/cva-variants';

const meta: Meta<typeof Navigation> = {
  title: 'Components/Blocks/Navigation',
  component: Navigation,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
**Navigation Component**

The site navigation component with responsive desktop/mobile behavior. Features a logo, navigation links,
and booking CTA button. Automatically switches between desktop and mobile layouts based on viewport.

## CVA Variants

- **style**: solid (default background), transparent (overlays content), glass (backdrop blur)
- **layout**: default (80px height), compact (64px height), tall (96px height)

## Design Tokens Used

- Backgrounds: bg-surface-primary, bg-transparent, bg-surface-primary/high
- Text: text-brand-primary, text-text-primary, text-text-inverted
- Border: border-b, border-border-default
- Shadows: shadow-md
- Backdrop: backdrop-blur-md

## Responsive Behavior

- Desktop (≥1024px): Horizontal navigation with links and CTA button
- Mobile (<1024px): Hamburger menu with full-width drawer
- Transitions: Smooth fade-in for mobile drawer (200ms)
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'object',
      description: 'CVA variant configuration (style, layout)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Navigation>;

// =============================================================================
// MOCK DATA
// =============================================================================

// The Navigation component has built-in nav links, but for documentation purposes:
const mockNavItems = [
  { label: 'Home', href: '/' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Amenities', href: '/amenities' },
  { label: 'Dining', href: '/dining' },
  { label: 'Contact', href: '/contact' },
];

const mockLogo = {
  src: '/images/logo.svg',
  alt: 'Sterling Hotel',
};

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {
  name: 'Default (Solid)',

  parameters: {
    docs: {
      description: {
        story: 'Solid style with default layout (80px height). Standard navigation for most pages with white background and shadow.',
      },
    }
  },

  args: {
    variant: {
      style: 'solid',
      layout: 'classic',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Transparent: Story = {
  name: 'Transparent Overlay',

  parameters: {
    docs: {
      description: {
        story: 'Transparent style that overlays content (like hero images). Best used with a dark background for text visibility. Text appears in white/light color.',
      },
    },

    backgrounds: {
      default: 'dark',
    }
  },

  render: (args) => (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary to-brand-primary/80">
      <Navigation {...args} />
      <div className="pt-32 px-8">
        <h1 className="text-on-brand text-4xl font-display font-bold">
          Hero Section Content
        </h1>
        <p className="text-on-brand/80 text-lg mt-4">
          Transparent navigation overlays beautifully on hero backgrounds
        </p>
      </div>
    </div>
  ),

  args: {
    variant: {
      style: 'transparent',
      layout: 'classic',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Glass: Story = {
  name: 'Glass Morphism',

  parameters: {
    docs: {
      description: {
        story: 'Glass morphism style with backdrop blur effect. Modern aesthetic with semi-transparent background that subtly shows underlying content.',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-surface-muted">
      <Navigation {...args} />
      <div className="pt-32 px-8">
        <h1 className="text-text-primary text-4xl font-display font-bold">
          Modern Glass Effect
        </h1>
        <p className="text-text-secondary text-lg mt-4">
          Navigation with backdrop blur for a premium glass morphism look
        </p>
      </div>
    </div>
  ),

  args: {
    variant: {
      style: 'glass',
      layout: 'classic',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Compact: Story = {
  name: 'Compact Layout',

  parameters: {
    docs: {
      description: {
        story: 'Compact layout with reduced height (64px). Ideal for content-dense pages where vertical space is at a premium.',
      },
    }
  },

  args: {
    variant: {
      style: 'solid',
      layout: 'compact',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const MobileView: Story = {
  name: '📱 Mobile View (375px)',

  parameters: {
    docs: {
      description: {
        story: 'Navigation at mobile viewport (375px). Features hamburger menu icon that opens a full-width drawer with vertical navigation links. Tap the menu icon to toggle the drawer.',
      },
    }
  },

  args: {
    variant: {
      style: 'solid',
      layout: 'classic',
    },
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};

// =============================================================================
// ADDITIONAL VARIANTS
// =============================================================================

export const TallLayout: Story = {
  name: 'Tall Layout',

  parameters: {
    docs: {
      description: {
        story: 'Tall layout with increased height (96px). Provides more visual presence and breathing room for larger logos or additional navigation elements.',
      },
    }
  },

  args: {
    variant: {
      style: 'solid',
      layout: 'classic',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ResponsiveNavigation: Story = {
  name: '📱 Responsive (Mobile/Tablet/Desktop)',

  parameters: {
    docs: {
      description: {
        story: 'Navigation demonstrating responsive behavior across all viewport sizes. Use the viewport addon to switch between mobile (375px), tablet (768px), and desktop (1280px) to see the navigation adapt.',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen">
      <Navigation {...args} />
      <div className="pt-24 px-8 text-center">
        <h1 className="text-text-primary text-3xl font-display font-bold">
          Resize Viewport to Test Responsiveness
        </h1>
        <p className="text-text-secondary text-lg mt-4">
          Mobile: 375px → Tablet: 768px → Desktop: 1280px
        </p>
      </div>
    </div>
  ),

  args: {
    variant: {
      style: 'solid',
      layout: 'classic',
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};
