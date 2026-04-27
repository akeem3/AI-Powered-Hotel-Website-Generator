import type { Meta, StoryObj } from '@storybook/react-vite';
import ContactForm from '@/components/sections/ContactForm';
import type { ContactFormVariantProps } from '@/lib/cva-variants';

const meta: Meta<typeof ContactForm> = {
  title: 'Components/Sections/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
**ContactForm Component**

Contact form with validation, loading states, and success/error feedback. Supports three style variants
and three background options for flexible integration into different page contexts.

## CVA Variants

- **style**: default (card with shadow), minimal (no card styling), floating (-mt-20 overlap effect)
- **background**: none (transparent), brand (brand-primary/faint tint), muted (surface-muted tint)

## Design Tokens Used

- Backgrounds: bg-surface-primary, bg-brand-primary/faint, bg-surface-muted
- Text: text-brand-primary, text-text-secondary, text-text-muted
- Borders: border-surface-secondary, border-border-default, border-brand-secondary
- Focus: focus:border-brand-secondary, focus:ring-brand-secondary
- Shadows: shadow-card, shadow-xl (floating style)
- Border Radius: rounded-2xl

## Form Fields

- Name (required, text input)
- Email (required, email input)
- Phone (optional, tel input)
- Subject (required, select: General, Booking, Business, Events)
- Message (required, textarea, 150px min-height)
- Submit button with loading state

## States

- Idle: Form ready for input
- Submitting: Button shows spinner, "Sending…"
- Success: Green message, form resets
- Error: Red message, form remains populated
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: 'object',
      description: 'CVA variant configuration (style, background)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

// =============================================================================
// MOCK DATA
// =============================================================================

const handleSuccess = () => {
  console.log('Form submitted successfully');
};

// =============================================================================
// STORIES
// =============================================================================

export const Default: Story = {
  name: 'Default (No Background)',

  parameters: {
    docs: {
      description: {
        story: 'Default style with no background. Card-style form with shadow, border, and rounded corners. Best for standalone contact sections.',
      },
    }
  },

  args: {
    variant: {
      style: 'default',
      background: 'none',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Minimal: Story = {
  name: 'Minimal Style',

  parameters: {
    docs: {
      description: {
        story: 'Minimal style with no card styling - just the form fields. No border, shadow, or background. Ideal for embedded forms in existing layouts.',
      },
    }
  },

  args: {
    variant: {
      style: 'minimal',
      background: 'none',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const Floating: Story = {
  name: 'Floating Style',

  parameters: {
    docs: {
      description: {
        story: 'Floating style with -mt-20 negative margin, overlapping hero section content. Creates visual depth with elevated shadow. Position over hero background for effect.',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen">
      {/* Simulated Hero Section */}
      <div className="h-80 bg-gradient-to-br from-brand-primary to-brand-primary/70 flex items-center justify-center">
        <div className="text-center text-on-brand">
          <h1 className="text-4xl font-display font-bold mb-4">Contact Us</h1>
          <p className="text-lg opacity-90">We'd love to hear from you</p>
        </div>
      </div>
      {/* Floating Contact Form */}
      <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-10">
        <ContactForm {...args} />
      </div>
      {/* Extra content to show overlap effect */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-text-secondary text-center">
          The form above overlaps the hero section, creating a floating card effect.
        </p>
      </div>
    </div>
  ),

  args: {
    variant: {
      style: 'floating',
      background: 'none',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const WithBrandBackground: Story = {
  name: 'With Brand Background',

  parameters: {
    docs: {
      description: {
        story: 'Default style with brand background (brand-primary/faint tint). Subtle brand-colored background that complements the card form.',
      },
    }
  },

  args: {
    variant: {
      style: 'default',
      background: 'brand',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const WithMutedBackground: Story = {
  name: 'With Muted Background',

  parameters: {
    docs: {
      description: {
        story: 'Default style with muted background (surface-muted tint). Subtle gray background that provides contrast without overwhelming the form.',
      },
    }
  },

  args: {
    variant: {
      style: 'default',
      background: 'muted',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

// =============================================================================
// FORM STATES & INTERACTION
// =============================================================================

export const FormValidation: Story = {
  name: 'Form with Validation',

  parameters: {
    docs: {
      description: {
        story: 'Default form with validation enabled. Try submitting without filling fields to see error states. All required fields show validation messages.',
      },
    }
  },

  args: {
    variant: {
      style: 'default',
      background: 'none',
    },
    onSuccess: () => {
      alert('Form validation passed! Check console for data.');
    },
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
        story: 'Contact form at mobile viewport (375px). Form fields stack vertically with full width. Submit button is touch-friendly. Error messages are clearly visible.',
      },
    }
  },

  args: {
    variant: {
      style: 'default',
      background: 'none',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'mobile',
      isRotated: false
    }
  }
};

// =============================================================================
// COMBINATION STYLES
// =============================================================================

export const MinimalWithBrand: Story = {
  name: 'Minimal + Brand Background',

  parameters: {
    docs: {
      description: {
        story: 'Minimal style (no card) combined with brand background. Clean form fields with subtle brand-colored background.',
      },
    }
  },

  args: {
    variant: {
      style: 'minimal',
      background: 'brand',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};

export const FloatingWithMuted: Story = {
  name: 'Floating + Muted Background',

  parameters: {
    docs: {
      description: {
        story: 'Floating style (overlapping) with muted background. Elevated card over muted gray background for depth and contrast.',
      },
    }
  },

  render: (args) => (
    <div className="min-h-screen bg-surface-muted">
      {/* Simulated Hero Section */}
      <div className="h-80 bg-gradient-to-br from-brand-primary to-brand-primary/60 flex items-center justify-center">
        <div className="text-center text-on-brand">
          <h1 className="text-4xl font-display font-bold mb-4">Get In Touch</h1>
          <p className="text-lg opacity-90">Send us a message</p>
        </div>
      </div>
      {/* Floating Contact Form */}
      <div className="max-w-3xl mx-auto px-4 -mt-20 relative z-10">
        <ContactForm {...args} />
      </div>
    </div>
  ),

  args: {
    variant: {
      style: 'floating',
      background: 'muted',
    },
    onSuccess: handleSuccess,
  },

  globals: {
    viewport: {
      value: 'desktop',
      isRotated: false
    }
  }
};
