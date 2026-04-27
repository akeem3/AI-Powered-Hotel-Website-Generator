import type { Meta, StoryObj } from '@storybook/react-vite';
import BookingWidget from '@/components/blocks/BookingWidget';
import type { BookingWidgetVariantProps } from '@/lib/cva-variants';

const meta: Meta<typeof BookingWidget> = {
  title: 'Components/Blocks/BookingWidget',
  component: BookingWidget,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `
**BookingWidget Component**

Hotel booking form with date selection, guest count, and room configuration. Automatically switches between
desktop (card) and mobile (fixed bottom drawer) layouts based on viewport or variant prop.

## CVA Variants

- **variant**: desktop (card layout, standard), mobile (fixed to bottom of screen)
- **theme**: light (default surface), dark (brand primary background), glass (backdrop blur)

## Design Tokens Used

- Backgrounds: bg-surface-primary, bg-brand-primary, bg-surface-primary/strong
- Text: text-text-primary, text-text-inverted, text-on-brand
- Borders: border-border-default, border-on-brand/subtle
- Shadows: shadow-lg, shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]
- Border Radius: rounded-xl, rounded-2xl

## Form Fields

- Check-in Date (required, with calendar picker)
- Check-out Date (required, with calendar picker)
- Adults (number input, default: 1)
- Children (number input, default: 0)
- Rooms (number input, default: 1)
- Room Type (select: Standard, Deluxe, Suite)
- Special Requests (textarea, optional)

## Accessibility Notes

- All form inputs have associated labels
- Calendar popovers are keyboard accessible
- Form validation provides clear error messages
- Mobile accordion is collapsible for reduced screen clutter
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['desktop', 'mobile'],
      description: 'Layout variant (desktop or mobile)',
    },
    theme: {
      control: 'select',
      options: ['light', 'dark', 'glass'],
      description: 'Theme variant (light, dark, or glass)',
    },
    defaultValues: {
      control: 'object',
      description: 'Default form values (checkIn, checkOut, adults, children, rooms)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof BookingWidget>;

// =============================================================================
// MOCK DATA
// =============================================================================

const mockBookingDefaults = {
  checkIn: new Date('2026-02-15'),
  checkOut: new Date('2026-02-18'),
  adults: 2,
  children: 0,
  rooms: 1,
};

const handleSubmit = (data: unknown) => {
  console.log('Booking submitted:', data);
  alert('Booking submitted! Check console for details.');
};

// =============================================================================
// STORIES
// =============================================================================

export const DesktopDefault: Story = {
  name: 'Desktop (Light Theme)',

  parameters: {
    docs: {
      description: {
        story: 'Desktop variant with light theme. Standard card layout with shadow and border. Shows all form fields: date pickers, guest counts, and room selection.',
      },
    }
  },

  args: {
    variant: 'desktop',
    theme: 'light',
    defaultValues: mockBookingDefaults,
    onSubmit: handleSubmit,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const DesktopDark: Story = {
  name: 'Desktop (Dark Theme)',

  parameters: {
    docs: {
      description: {
        story: 'Desktop variant with dark theme. Brand primary background with light text for high contrast. Maintains all form functionality with inverted color scheme.',
      },
    }
  },

  args: {
    variant: 'desktop',
    theme: 'dark',
    defaultValues: mockBookingDefaults,
    onSubmit: handleSubmit,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const DesktopGlass: Story = {
  name: 'Desktop (Glass Theme)',

  parameters: {
    docs: {
      description: {
        story: 'Desktop variant with glass theme. Backdrop blur effect with semi-transparent background. Modern aesthetic that subtly shows underlying content.',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-surface-muted p-8">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Glass Theme Booking Widget
        </h2>
        <BookingWidget {...args} />
      </div>
    </div>
  ),

  args: {
    variant: 'desktop',
    theme: 'glass',
    defaultValues: mockBookingDefaults,
    onSubmit: handleSubmit,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const MobileSticky: Story = {
  name: '📱 Mobile View - Fixed Bottom (375px)',

  parameters: {
    docs: {
      description: {
        story: 'Mobile variant with fixed positioning at bottom of screen. Uses accordion layout to collapse/expand form sections. Shadow appears above widget to separate from page content. Type variants at mobile (375px).',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen bg-surface-muted p-4 pb-32">
      <h2 className="text-xl font-bold text-text-primary mb-4">
        Page Content
      </h2>
      <p className="text-text-secondary mb-4">
        Scroll down to see the mobile booking widget fixed at the bottom.
      </p>
      <p className="text-text-secondary">
        The widget stays fixed while scrolling, making booking always accessible.
      </p>
      <BookingWidget {...args} />
    </div>
  ),

  args: {
    variant: 'mobile',
    theme: 'light',
    defaultValues: mockBookingDefaults,
    onSubmit: handleSubmit,
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};

export const WithFormState: Story = {
  name: 'With Form Interaction',

  parameters: {
    docs: {
      description: {
        story: 'Desktop widget with simulated form interaction. Select dates, adjust guest counts, and click Check Availability to see validation and success states. Form data is logged to console.',
      },
    }
  },

  args: {
    variant: 'desktop',
    theme: 'light',
    defaultValues: mockBookingDefaults,
    onSubmit: (data) => {
      console.log('=== Booking Data ===');
      console.log('Check-in:', data.checkIn?.toLocaleDateString());
      console.log('Check-out:', data.checkOut?.toLocaleDateString());
      console.log('Guests:', data.adults, 'adults,', data.children, 'children');
      console.log('Rooms:', data.rooms);
      alert(`Booking for ${data.adults + data.children} guests from ${data.checkIn?.toLocaleDateString()} to ${data.checkOut?.toLocaleDateString()}`);
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

export const ResponsiveBooking: Story = {
  name: '📱 Responsive (Auto-switch)',

  parameters: {
    docs: {
      description: {
        story: 'Booking widget with automatic responsive switching. No variant prop provided - widget detects viewport and switches between desktop (≥768px) and mobile (<768px). Use viewport addon to test.',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen bg-surface-muted p-8">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          Responsive Booking Widget
        </h2>
        <p className="text-text-secondary mb-4">
          Resize viewport to see automatic layout switching:
        </p>
        <ul className="text-text-secondary list-disc list-inside mb-6 space-y-1">
          <li>Mobile (375px): Fixed bottom drawer</li>
          <li>Tablet (768px): Desktop card</li>
          <li>Desktop (1280px): Desktop card</li>
        </ul>
        <BookingWidget {...args} />
      </div>
    </div>
  ),

  args: {
    theme: 'light',
    defaultValues: mockBookingDefaults,
    onSubmit: handleSubmit,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const DarkThemeMobile: Story = {
  name: 'Mobile (Dark Theme)',

  parameters: {
    docs: {
      description: {
        story: 'Mobile variant with dark theme. Brand primary background with light text. Fixed to bottom with dark styling throughout.',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen bg-surface-muted p-4 pb-32">
      <h2 className="text-xl font-bold text-text-primary mb-4">
        Dark Theme Mobile
      </h2>
      <p className="text-text-secondary">
        Mobile widget with dark background and light text.
      </p>
      <BookingWidget {...args} />
    </div>
  ),

  args: {
    variant: 'mobile',
    theme: 'dark',
    defaultValues: mockBookingDefaults,
    onSubmit: handleSubmit,
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};
