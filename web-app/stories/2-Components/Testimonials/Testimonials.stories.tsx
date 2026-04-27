import type { Meta, StoryObj } from '@storybook/react-vite';
import { Testimonials } from '@/components/blocks/Testimonials';

const meta: Meta<typeof Testimonials> = {
  title: 'Components/Blocks/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**Testimonials Component**

Display customer testimonials in three layout variants: grid, carousel, and featured. Supports configurable
columns, card styles, and optional metadata display (dates, locations). Perfect for building social proof.

## CVA Variants

- **layout**: grid (responsive columns), carousel (horizontal scroll), featured (single centered)
- **columns**: 2 (1→2), 3 (1→2→3) - for grid layout
- **cardStyle**: default (border + shadow), minimal (flat), elevated (strong shadow + hover)

## Design Tokens Used

- Backgrounds: bg-surface-primary, bg-surface-elevated
- Text: text-brand-primary, text-text-secondary, text-text-muted
- Borders: border-border-default, border-brand-secondary
- Shadows: shadow-sm, shadow-card, shadow-card-hover
- Spacing: gap-6, gap-8, p-6, p-8
- Transitions: hover:shadow-card-hover, transition-all, duration-500

## Section Styling

All stories include the premium section header with:
- Gold accent bars (decorative dividers)
- Main heading in brand primary
- Gold underline accent
- Optional subheading

## Features

- Star rating display (1-5 stars)
- Avatar/image support with fallbacks
- Date and location metadata (optional)
- Carousel navigation (arrows + keyboard)
- Autoplay support (carousel only)
- Responsive grid breakpoints
        `,
      },
    },
  },
  argTypes: {
    testimonials: {
      control: 'object',
      description: 'Array of testimonial objects',
    },
    variant: {
      control: 'object',
      description: 'CVA variant configuration (layout, columns, cardStyle)',
    },
    showDate: {
      control: 'boolean',
      description: 'Show testimonial date',
    },
    showLocation: {
      control: 'boolean',
      description: 'Show testimonial location',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Testimonials>;

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTestimonials = [
  {
    id: '1',
    customerName: 'Sarah Johnson',
    rating: 5 as const,
    quote: 'Exceptional service and stunning views. The staff went above and beyond to make our stay memorable. Will definitely return!',
    customerTitle: 'Business Traveler',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    date: '2026-01-10',
    location: 'New York, USA',
  },
  {
    id: '2',
    customerName: 'Michael Chen',
    rating: 5 as const,
    quote: 'The perfect getaway. Beautiful rooms, delicious food, and the spa was incredible. Highly recommend the ocean view suite!',
    customerTitle: 'Vacation Guest',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    date: '2026-01-05',
    location: 'San Francisco, USA',
  },
  {
    id: '3',
    customerName: 'Emily Williams',
    rating: 5 as const,
    quote: 'We celebrated our 10th anniversary here and it was magical. The attention to detail was outstanding. True luxury!',
    customerTitle: 'Anniversary Celebration',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    date: '2025-12-28',
    location: 'Chicago, USA',
  },
  {
    id: '4',
    customerName: 'David Martinez',
    rating: 5 as const,
    quote: 'Impeccable service from check-in to check-out. The concierge arranged amazing local experiences for our family.',
    customerTitle: 'Family Vacation',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    date: '2025-12-20',
    location: 'Miami, USA',
  },
  {
    id: '5',
    customerName: 'Jessica Thompson',
    rating: 5 as const,
    quote: 'Best hotel experience I\'ve ever had. The amenities are top-notch and the staff treats you like family.',
    customerTitle: 'Solo Traveler',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    date: '2025-12-15',
    location: 'Seattle, USA',
  },
  {
    id: '6',
    customerName: 'Robert Kim',
    rating: 5 as const,
    quote: 'The business facilities exceeded my expectations. Fast WiFi, great meeting rooms, and excellent catering.',
    customerTitle: 'Conference Attendee',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    date: '2025-12-10',
    location: 'Boston, USA',
  },
];

// =============================================================================
// STORIES
// =============================================================================

export const Grid3Column: Story = {
  name: 'Grid (3 Columns)',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with 3 columns. Responsive: 1 column on mobile, 2 on tablet, 3 on desktop. Cards have border, shadow, and subtle hover elevation.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials,
    variant: {
      layout: 'grid',
      columns: 3,
      cardStyle: 'default',
    },
    showDate: true,
    showLocation: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Grid2Column: Story = {
  name: 'Grid (2 Columns)',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with 2 columns for larger, more prominent cards. Responsive: 1 column on mobile, 2 on tablet and desktop. Good for featured testimonials.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials.slice(0, 4),
    variant: {
      layout: 'grid',
      columns: 2,
      cardStyle: 'default',
    },
    showDate: true,
    showLocation: true,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Carousel: Story = {
  name: 'Carousel Layout',

  parameters: {
    docs: {
      description: {
        story: 'Horizontal scrolling carousel with snap points. Use mouse wheel, swipe on mobile, or drag to navigate. Dots indicate position. Optional autoplay available.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials,
    variant: {
      layout: 'carousel',
      cardStyle: 'default',
    },
    showDate: true,
    showLocation: false,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Featured: Story = {
  name: 'Featured Layout',

  parameters: {
    docs: {
      description: {
        story: 'Single centered testimonial with navigation arrows. Cycles through testimonials with prev/next buttons. Best for highlighting one review at a time with full context.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials,
    variant: {
      layout: 'featured',
      cardStyle: 'default',
    },
    showDate: true,
    showLocation: true,
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
        story: 'Grid layout with elevated card style. Strong shadows, dramatic hover lift effect, and enhanced presence. Great for premium feel.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials.slice(0, 6),
    variant: {
      layout: 'grid',
      columns: 3,
      cardStyle: 'elevated',
    },
    showDate: true,
    showLocation: false,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

// =============================================================================
// ADDITIONAL VARIANTS
// =============================================================================

export const MinimalCards: Story = {
  name: 'Minimal Card Style',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout with minimal card style. No borders or shadows, flat background. Clean, understated look for modern aesthetics.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials.slice(0, 6),
    variant: {
      layout: 'grid',
      columns: 3,
      cardStyle: 'minimal',
    },
    showDate: false,
    showLocation: false,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const MobileGrid: Story = {
  name: '📱 Mobile View (375px)',

  parameters: {
    docs: {
      description: {
        story: 'Grid layout at mobile viewport (375px). Shows single column layout with full-width cards. Touch-friendly spacing and readable text sizes.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials.slice(0, 3),
    variant: {
      layout: 'grid',
      columns: 3,
      cardStyle: 'default',
    },
    showDate: true,
    showLocation: false,
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};

export const WithoutMetadata: Story = {
  name: 'Grid Without Metadata',

  parameters: {
    docs: {
      description: {
        story: 'Clean grid layout without dates and locations. Focuses on the quote, author, title, and rating only. Minimal clutter approach.',
      },
    }
  },

  args: {
    testimonials: mockTestimonials.slice(0, 6),
    variant: {
      layout: 'grid',
      columns: 3,
      cardStyle: 'default',
    },
    showDate: false,
    showLocation: false,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};
