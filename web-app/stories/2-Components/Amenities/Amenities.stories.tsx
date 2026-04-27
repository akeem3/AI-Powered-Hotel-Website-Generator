import type { Meta, StoryObj } from '@storybook/react-vite';
import { Amenities } from '@/components/blocks/Amenities';

const meta: Meta<typeof Amenities> = {
  title: 'Components/Blocks/Amenities',
  component: Amenities,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Amenities Component**

Display hotel amenities and facilities in three layout variants: grid, list, and featured. Supports
configurable columns, icon sizes, icon styles, and card styles. Icons are rendered using Lucide React.

## CVA Variants

- **layout**: grid (responsive columns), list (compact rows), featured (highlighted cards with navigation)
- **columns**: 2 (1→2), 3 (1→2→3), 4 (1→2→3→4) - for grid layout
- **iconSize**: small (16px), medium (20px), large (32px)
- **iconStyle**: default (brand wash), muted (gray), colored (brand secondary wash)
- **cardStyle**: default (border + shadow), minimal (flat), elevated (strong shadow + hover lift)

## Design Tokens Used

- Backgrounds: bg-brand-primary/wash, bg-surface-muted, bg-surface-elevated
- Text: text-brand-primary, text-text-primary, text-text-secondary, text-text-muted
- Icons: text-brand-primary, text-text-muted, text-brand-secondary
- Borders: border-border-default, border-brand-secondary/subtle
- Shadows: shadow-sm, shadow-card, shadow-card-hover, shadow-xl
- Spacing: gap-6, gap-8, p-2, p-2.5, p-4
- Transitions: hover:shadow-card-hover, hover:-translate-y-1, transition-all, duration-300

## Icon System

Icons are rendered dynamically using Lucide React icon names. Common icons include:
- wifi, spa, dumbbell, swimming-pool, utensils, concierge-bell, car, shuttle-van
- coffee, tv, wind, snowflake, briefcase, heart, star, shield

## Section Styling

All stories include the premium section header with:
- Gold accent bars (decorative dividers)
- Main heading in brand primary
- Gold underline accent
- Optional subheading

## Features

- Dynamic icon rendering from Lucide React
- Category badges (optional)
- Featured amenities highlighting
- Description text support
- Responsive grid breakpoints
- Keyboard navigation (featured layout)
        `,
      },
    },
  },
  argTypes: {
    amenities: {
      control: 'object',
      description: 'Array of amenity objects',
    },
    variant: {
      control: 'object',
      description: 'CVA variant configuration (layout, columns, iconSize, iconStyle, cardStyle)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Amenities>;

// =============================================================================
// MOCK DATA
// =============================================================================

const mockAmenities = [
  { id: '1', name: 'Free WiFi', icon: 'wifi', description: 'High-speed internet throughout', category: 'hotel' as const },
  { id: '2', name: 'Spa & Wellness', icon: 'sparkles', description: 'Full-service spa facilities', category: 'services' as const },
  { id: '3', name: 'Fitness Center', icon: 'dumbbell', description: '24/7 gym access', category: 'hotel' as const },
  { id: '4', name: 'Swimming Pool', icon: 'waves', description: 'Heated rooftop pool', category: 'hotel' as const, featured: true },
  { id: '5', name: 'Restaurant', icon: 'utensils', description: 'Fine dining on-site', category: 'services' as const },
  { id: '6', name: 'Room Service', icon: 'bell', description: '24-hour room service', category: 'services' as const },
  { id: '7', name: 'Parking', icon: 'car', description: 'Valet and self-parking', category: 'location' as const },
  { id: '8', name: 'Airport Shuttle', icon: 'bus', description: 'Complimentary transfers', category: 'location' as const, featured: true },
  { id: '9', name: 'Coffee Bar', icon: 'coffee', description: 'Artisan coffee available', category: 'services' as const, featured: true },
];

// =============================================================================
// STORIES
// =============================================================================

export const Grid4Column: Story = {
  name: 'Grid (4 Columns)',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with 4 columns (default). Responsive: 1→2→3→4 across breakpoints. Cards have border, shadow, and hover elevation. Medium icons with brand wash style.',
      },
    }
  },

  args: {
    amenities: mockAmenities,
    variant: {
      layout: 'grid' as const,
      columns: 4 as const,
      iconSize: 'medium' as const,
      iconStyle: 'default' as const,
      cardStyle: 'default' as const,
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Grid3Column: Story = {
  name: 'Grid (3 Columns)',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with 3 columns for larger, more prominent amenity cards. Responsive: 1→2→3 across breakpoints. Good for emphasizing each amenity.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 6),
    variant: {
      layout: 'grid' as const,
      columns: 3 as const,
      iconSize: 'medium' as const,
      iconStyle: 'default' as const,
      cardStyle: 'default' as const,
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ListLayout: Story = {
  name: 'List Layout',

  parameters: {
    docs: {
      description: {
        story: 'Compact list layout for space-efficient display. Horizontal rows with icon, name, and optional description. Great for sidebars or tight spaces.',
      },
    }
  },

  args: {
    amenities: mockAmenities,
    variant: {
      layout: 'list' as const,
      iconSize: 'medium' as const,
      iconStyle: 'default' as const,
      cardStyle: 'default' as const,
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const FeaturedLayout: Story = {
  name: 'Featured Layout',

  parameters: {
    docs: {
      description: {
        story: 'Featured layout highlighting special amenities with navigation. Shows 3 large elevated cards at a time with prev/next arrows. Large icons, prominent descriptions. Keyboard navigation supported.',
      },
    }
  },

  args: {
    amenities: mockAmenities,
    variant: {
      layout: 'featured' as const,
      iconSize: 'large' as const,
      iconStyle: 'default' as const,
      cardStyle: 'elevated' as const,
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ElevatedLargeIcons: Story = {
  name: 'Elevated + Large Icons',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with elevated card style and large icon size. Strong shadows, dramatic hover lift, and 32px icons for high visual impact.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 8),
    variant: {
      layout: 'grid' as const,
      columns: 4 as const,
      iconSize: 'large' as const,
      iconStyle: 'default' as const,
      cardStyle: 'elevated' as const,
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
// ICON STYLE VARIANTS
// =============================================================================

export const MutedIcons: Story = {
  name: 'Muted Icon Style',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with muted icon style. Gray backgrounds and muted text for subtle, understated appearance. Good for secondary sections.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 8),
    variant: {
      layout: 'grid' as const,
      columns: 4 as const,
      iconSize: 'medium' as const,
      iconStyle: 'muted' as const,
      cardStyle: 'default' as const,
    },
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const ColoredIcons: Story = {
  name: 'Colored Icon Style',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with colored icon style. Brand secondary wash for vibrant, brand-aligned appearance. Eye-catching and energetic.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 8),
    variant: {
      layout: 'grid' as const,
      columns: 4 as const,
      iconSize: 'medium' as const,
      iconStyle: 'colored' as const,
      cardStyle: 'default' as const,
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
// ICON SIZE VARIANTS
// =============================================================================

export const SmallIcons: Story = {
  name: 'Small Icon Size',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with small icon size (16px icons). Compact appearance for content-dense layouts. 4-column grid maintains readability.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 8),
    variant: {
      layout: 'grid' as const,
      columns: 4 as const,
      iconSize: 'small' as const,
      iconStyle: 'default' as const,
      cardStyle: 'default' as const,
    },
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
        story: 'Grid layout with minimal card style. No borders or shadows, flat background for clean modern look. Subtle hover state on text.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 8),
    variant: {
      layout: 'grid' as const,
      columns: 4 as const,
      iconSize: 'medium' as const,
      iconStyle: 'default' as const,
      cardStyle: 'minimal' as const,
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

export const MobileGrid: Story = {
  name: '📱 Mobile View (375px)',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout at mobile viewport (375px). Shows 1-column layout with full-width cards. Icons and text remain readable at small sizes.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 4),
    variant: {
      layout: 'grid' as const,
      columns: 4 as const,
      iconSize: 'medium' as const,
      iconStyle: 'default' as const,
      cardStyle: 'default' as const,
    },
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};

export const MobileList: Story = {
  name: '📱 Mobile List View (375px)',

  parameters: {
    docs: {
      description: {
        story: 'List layout at mobile viewport (375px). Compact horizontal rows optimized for touch. Icons remain clearly tappable.',
      },
    }
  },

  args: {
    amenities: mockAmenities.slice(0, 5),
    variant: {
      layout: 'list' as const,
      iconSize: 'medium' as const,
      iconStyle: 'default' as const,
      cardStyle: 'default' as const,
    },
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};
