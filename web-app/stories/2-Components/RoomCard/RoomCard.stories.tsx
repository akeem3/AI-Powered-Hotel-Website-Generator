import type { Meta, StoryObj } from '@storybook/react-vite';
import RoomCard from '@/components/blocks/RoomCard';
import type { RoomCardVariantProps, RoomCardImageVariantProps, RoomCardButtonVariantProps } from '@/lib/cva-variants';

const meta: Meta<typeof RoomCard> = {
  title: 'Components/Blocks/RoomCard',
  component: RoomCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**RoomCard Component**

Room cards display hotel room information with image, details, amenities, pricing, and booking buttons.
Three variants are available for different layout contexts: detailed (full info), compact (list view), and grid (minimal).

## CVA Variants

- **variant**: detailed (full card with all info), compact (condensed for lists), grid (minimal for grids)
- **imageHeight**: default (16:9 aspect), tall (4:5 portrait), wide (2:1 cinematic)
- **buttonVariant**: outline (brand border), primary (brand background)

## Design Tokens Used

- Backgrounds: bg-surface-primary, bg-surface-elevated, bg-surface-muted
- Text: text-brand-primary, text-brand-secondary, text-text-primary, text-text-secondary, text-text-muted
- Borders: border-border-default, border-brand-primary, border-brand-secondary
- Shadows: shadow-card, shadow-card-hover
- Spacing: gap-3, gap-4, p-4, p-6
- Transitions: hover:shadow-card-hover, hover:-translate-y-1, group-hover:scale-110

## Hover Interactions

- Detailed/Compact: Elevates with shadow and slight lift (-translate-y-1)
- Image: Subtle zoom effect (scale-110) with navy overlay
- Buttons: Color transition on hover
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['detailed', 'compact', 'grid'],
      description: 'Card variant (detailed, compact, grid)',
    },
    imageHeight: {
      control: 'select',
      options: ['default', 'tall', 'wide'],
      description: 'Image aspect ratio (detailed variant only)',
    },
    name: {
      control: 'text',
      description: 'Room name/title',
    },
    type: {
      control: 'text',
      description: 'Room type (e.g., Suite, Deluxe Room)',
    },
    price: {
      control: 'number',
      description: 'Price per night in USD',
    },
    capacity: {
      control: 'number',
      description: 'Maximum number of guests',
    },
    amenities: {
      control: 'object',
      description: 'Array of amenity strings',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoomCard>;

// =============================================================================
// MOCK DATA
// =============================================================================

const mockRoom = {
  id: 'deluxe-suite',
  name: 'Deluxe Ocean Suite',
  type: 'Premium Suite',
  description: 'Spacious suite with panoramic ocean views, private balcony, and premium amenities. Perfect for romantic getaways or special celebrations.',
  price: 450,
  currency: 'USD',
  perNight: true,
  image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  amenities: ['King bed', 'Ocean view', 'Private balcony', 'Mini bar', 'Room service', 'Coffee maker'],
  capacity: 2,
  size: '65 sq m',
};

const mockRoomCompact = {
  ...mockRoom,
  description: 'Luxury suite with stunning ocean views and premium amenities.',
};

// =============================================================================
// STORIES
// =============================================================================

export const Detailed: Story = {
  name: 'Detailed Card',

  parameters: {
    docs: {
      description: {
        story: 'Full-featured room card with image, description, amenity list, pricing, and dual action buttons (View Details, Book Now). Best for featured rooms or detailed listings.',
      },
    }
  },

  args: {
    ...mockRoom,
    variant: 'detailed',
    imageHeight: 'default',
    onViewDetails: (id) => console.log('View Details:', id),
    onBookNow: (id) => console.log('Book Now:', id),
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Compact: Story = {
  name: 'Compact Card',

  parameters: {
    docs: {
      description: {
        story: 'Condensed room card with essential info only. Ideal for list views and space-constrained layouts. Shows image, name, type, price, capacity, and top 3 amenities.',
      },
    }
  },

  args: {
    ...mockRoomCompact,
    variant: 'compact',
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Grid: Story = {
  name: 'Grid Card',

  parameters: {
    docs: {
      description: {
        story: 'Minimal room card for grid layouts. Centered text with image, name, type, price, capacity, and amenities. Best for 3-4 column grids showing many rooms.',
      },
    }
  },

  args: {
    ...mockRoom,
    variant: 'grid',
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const DetailedWithBooking: Story = {
  name: 'Detailed with Active Booking',

  parameters: {
    docs: {
      description: {
        story: 'Detailed card with interactive Book Now button. Both View Details (outline) and Book Now (primary) buttons use CVA variants for consistent styling. Click buttons to see console output.',
      },
    }
  },

  args: {
    ...mockRoom,
    variant: 'detailed',
    imageHeight: 'default',
    onViewDetails: (id) => alert(`View Details clicked for room: ${id}`),
    onBookNow: (id) => alert(`Book Now clicked for room: ${id}`),
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Mobile: Story = {
  name: '📱 Mobile View (375px)',

  parameters: {
    docs: {
      description: {
        story: 'Detailed variant at mobile viewport (375px). Card adapts responsively with full-width image, stacked content, and touch-friendly buttons. Amenities wrap gracefully.',
      },
    }
  },

  args: {
    ...mockRoom,
    variant: 'detailed',
    imageHeight: 'default',
    onViewDetails: (id) => console.log('View Details:', id),
    onBookNow: (id) => console.log('Book Now:', id),
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};

// =============================================================================
// IMAGE HEIGHT VARIANTS
// =============================================================================

export const TallImage: Story = {
  name: 'Tall Image Height',

  parameters: {
    docs: {
      description: {
        story: 'Detailed card with tall image aspect ratio (4:5). Creates a more vertical, portrait-style image area. Great for emphasizing room photos.',
      },
    }
  },

  args: {
    ...mockRoom,
    variant: 'detailed',
    imageHeight: 'tall',
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const WideImage: Story = {
  name: 'Wide Image Height',

  parameters: {
    docs: {
      description: {
        story: 'Detailed card with wide image aspect ratio (2:1). Creates a cinematic, panoramic image area. Ideal for showcasing wide room shots or views.',
      },
    }
  },

  args: {
    ...mockRoom,
    variant: 'detailed',
    imageHeight: 'wide',
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
  name: '📱 Responsive Grid',

  parameters: {
    docs: {
      description: {
        story: 'Multiple room cards in a responsive grid layout. Adapts from 1 column (mobile) to 2 (tablet) to 3 (desktop). Use viewport addon to test different screen sizes.',
      },
    },

    // Chromatic: Capture at all 4 breakpoints to test responsive grid
    chromatic: {
      viewports: [375, 768, 1280, 1920],
    }
  },

  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RoomCard {...mockRoom} id="room-1" variant="detailed" />
      <RoomCard {...mockRoom} id="room-2" name="Garden Villa" image="https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80" variant="detailed" />
      <RoomCard {...mockRoom} id="room-3" name="City View Suite" image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800?q=80" variant="detailed" />
    </div>
  ),

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};
