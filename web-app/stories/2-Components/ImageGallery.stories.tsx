import type { Meta, StoryObj } from '@storybook/react-vite';
import ImageGallery from '@/components/blocks/ImageGallery';

const meta: Meta<typeof ImageGallery> = {
  title: 'Components/Blocks/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**ImageGallery Component**

The ImageGallery displays hotel images in three layout variants: grid, masonry, and carousel.
Each layout supports configurable spacing, aspect ratios, and card styles.

## CVA Variants

- **layout**: grid (flexible columns), masonry (pinterest-style), carousel (horizontal scroll)
- **spacing**: tight (2-3 gap), normal (4-6 gap), loose (6-8 gap)
- **aspectRatio**: square (1:1), landscape (4:3), portrait (3:4)
- **columns**: 2 (1→2), 3 (1→2→3), 4 (2→3→4)
- **cardStyle**: default (elevated with hover), minimal (flat), flat (bordered), elevated (shadow + hover)

## Design Tokens Used

- Backgrounds: bg-surface-elevated, bg-surface-primary
- Borders: border-border-default, border-brand-secondary, border-transparent
- Shadows: shadow-card, shadow-card-hover, shadow-xl, shadow-2xl
- Spacing: gap-2 through gap-8
- Transitions: hover:shadow-lg, hover:-translate-y-1, hover:-translate-y-2
        `,
      },
    },
  },
  argTypes: {
    images: {
      control: 'object',
      description: 'Array of image objects with id, desktopUrl, mobileUrl, and alt properties',
    },
    variant: {
      control: 'object',
      description: 'CVA variant configuration (layout, spacing, aspectRatio, columns, cardStyle)',
    },
    enableLightbox: {
      control: 'boolean',
      description: 'Enable lightbox when clicking images',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImageGallery>;

// =============================================================================
// MOCK DATA
// =============================================================================

const mockImages = [
  {
    id: '1',
    desktopUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
    alt: 'Hotel Exterior - Modern architecture with grand entrance',
  },
  {
    id: '2',
    desktopUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    alt: 'Deluxe Room - King bed with city view',
  },
  {
    id: '3',
    desktopUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
    alt: 'Infinity Pool - Rooftop pool with panoramic views',
  },
  {
    id: '4',
    desktopUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    alt: 'Fine Dining Restaurant - Elegant atmosphere with candlelight',
  },
  {
    id: '5',
    desktopUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    alt: 'Luxury Spa - Relaxation treatment room',
  },
  {
    id: '6',
    desktopUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    alt: 'Fitness Center - Modern gym equipment',
  },
  {
    id: '7',
    desktopUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    alt: 'Hotel Lobby - Grand entrance with chandelier',
  },
  {
    id: '8',
    desktopUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80',
    alt: 'Presidential Suite - Living area with panoramic windows',
  },
  {
    id: '9',
    desktopUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80',
    alt: 'Garden Terrace - Outdoor seating with lush greenery',
  },
];

const mockImagesPortrait = [
  {
    id: '1',
    desktopUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80',
    alt: 'Hotel Exterior',
  },
  {
    id: '2',
    desktopUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80',
    alt: 'Deluxe Room',
  },
  {
    id: '3',
    desktopUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
    alt: 'Infinity Pool',
  },
  {
    id: '4',
    desktopUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
    alt: 'Fine Dining',
  },
  {
    id: '5',
    desktopUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80',
    alt: 'Luxury Spa',
  },
  {
    id: '6',
    desktopUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
    mobileUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600&q=80',
    alt: 'Fitness Center',
  },
];

// =============================================================================
// STORIES
// =============================================================================

export const DefaultGallery: Story = {
  name: 'Default Gallery',

  parameters: {
    docs: {
      description: {
        story: 'Default grid layout with 3 columns, normal spacing, landscape aspect ratio, and default card style with hover elevation.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'grid',
      spacing: 'normal',
      aspectRatio: 'landscape',
      columns: 3,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const MasonryLayout: Story = {
  name: 'Masonry Layout',

  parameters: {
    docs: {
      description: {
        story: 'Pinterest-style masonry layout with 4 columns and responsive stacking. Images of varying heights are arranged in a visually balanced waterfall pattern.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'masonry',
      spacing: 'normal',
      aspectRatio: 'landscape',
      columns: 4,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const CarouselLayout: Story = {
  name: 'Carousel Layout',

  parameters: {
    docs: {
      description: {
        story: 'Horizontal scrolling carousel with snap points. Users can swipe or scroll through images horizontally. Great for mobile-first experiences.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'carousel',
      spacing: 'normal',
      aspectRatio: 'landscape',
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const MinimalCards: Story = {
  name: 'Minimal Card Style',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with minimal card style - no shadows, no borders, flat background for a clean, understated look.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'grid',
      spacing: 'normal',
      aspectRatio: 'landscape',
      columns: 3,
      cardStyle: 'minimal',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ElevatedCards: Story = {
  name: 'Elevated Card Style',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with elevated card style - strong shadows, brand border accent, and dramatic hover animation with lift effect.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'grid',
      spacing: 'normal',
      aspectRatio: 'landscape',
      columns: 3,
      cardStyle: 'elevated',
    },
    enableLightbox: true,
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

export const ResponsiveGrid: Story = {
  name: '📱 Responsive Grid (Mobile/Tablet/Desktop)',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout demonstrating responsive behavior: 1 column on mobile, 2 on tablet, 3 on desktop. Use viewport addon to switch between sizes.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'grid',
      spacing: 'normal',
      aspectRatio: 'landscape',
      columns: 3,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ResponsiveMasonry: Story = {
  name: '📱 Responsive Masonry',

  parameters: {
    docs: {
      description: {
        story: 'Masonry layout with responsive columns: 1→2→4 across breakpoints. Use viewport addon to see the layout adapt.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'masonry',
      spacing: 'normal',
      aspectRatio: 'landscape',
      columns: 4,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const PortraitAspect: Story = {
  name: 'Portrait Aspect Ratio',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with portrait (3:4) aspect ratio. Ideal for vertical photos like room interiors and portraits.',
      },
    }
  },

  args: {
    images: mockImagesPortrait,
    variant: {
      layout: 'grid',
      spacing: 'normal',
      aspectRatio: 'portrait',
      columns: 3,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const SquareAspect: Story = {
  name: 'Square Aspect Ratio',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with square (1:1) aspect ratio. Perfect for Instagram-style galleries and consistent thumbnail displays.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'grid',
      spacing: 'normal',
      aspectRatio: 'square',
      columns: 3,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const TightSpacing: Story = {
  name: 'Tight Spacing',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with tight spacing (2-3 gap) for a more compact, dense gallery appearance.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'grid',
      spacing: 'tight',
      aspectRatio: 'landscape',
      columns: 3,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const LooseSpacing: Story = {
  name: 'Loose Spacing',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with loose spacing (6-8 gap) for a more spacious, breathable gallery appearance.',
      },
    }
  },

  args: {
    images: mockImages,
    variant: {
      layout: 'grid',
      spacing: 'loose',
      aspectRatio: 'landscape',
      columns: 3,
      cardStyle: 'default',
    },
    enableLightbox: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};
