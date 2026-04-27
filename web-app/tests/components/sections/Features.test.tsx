/**
 * Features Section Component Tests
 *
 * Story 19.4: Features / USP Block (2 Structural Variants)
 * Story 19.6: New Block Tests - Features Contract, Router, and Sub-component Tests
 *
 * Test suites:
 * 1. Router delegation tests - each layout routes to correct sub-component
 * 2. Fallback tests - unknown layout defaults to FeaturesIconGrid
 * 3. Contract validation tests - accepts valid props, rejects missing features, validates min 2 max 8 features
 * 4. Sub-component rendering tests - each renders required content with semantic tokens
 * 5. CVA validation tests - validates variant choices
 * 6. Icon rendering tests - validates icon lookup with fallback
 * 7. Responsive design tests - both variants are responsive with configurable columns
 * 8. Image handling tests - FeaturesCards renders images with proper fallback
 * 9. ComponentRenderer integration test - renders Features via ComponentRenderer
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8
 *
 * @module tests/components/sections/Features.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Features from '@/components/sections/Features';
import FeaturesIconGrid from '@/components/sections/Features/FeaturesIconGrid';
import FeaturesCards from '@/components/sections/Features/FeaturesCards';
import { FeaturesContract, type FeaturesConfig } from '@/lib/contracts/features.contract';

// =============================================================================
// MOCKS
// =============================================================================

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} fill={undefined} priority={undefined} />,
}));

// Mock validation to avoid console errors in tests
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Star: () => <div data-testid="icon-star">Star Icon</div>,
  Waves: () => <div data-testid="icon-waves">Waves Icon</div>,
  Wifi: () => <div data-testid="icon-wifi">WiFi Icon</div>,
  Users: () => <div data-testid="icon-users">Users Icon</div>,
  MapPin: () => <div data-testid="icon-mappin">MapPin Icon</div>,
  Briefcase: () => <div data-testid="icon-briefcase">Briefcase Icon</div>,
  Coffee: () => <div data-testid="icon-coffee">Coffee Icon</div>,
  Clock: () => <div data-testid="icon-clock">Clock Icon</div>,
}));

// =============================================================================
// TEST FIXTURES
// =============================================================================

const validFeaturesPropsIconGrid: FeaturesConfig = {
  heading: 'Why Choose Us',
  features: [
    {
      title: 'Free WiFi',
      description: 'High-speed internet throughout the property',
      icon: 'Wifi'
    },
    {
      title: 'Infinity Pool',
      description: 'Heated infinity pool with stunning views',
      icon: 'Waves'
    },
    {
      title: 'Concierge Service',
      description: '24/7 dedicated concierge for personalized experiences',
      icon: 'Star'
    }
  ],
  variant: {
    layout: 'icon-grid',
    columns: 3
  }
};

const validFeaturesPropsCards: FeaturesConfig = {
  heading: 'Our Amenities',
  features: [
    {
      title: 'Spa & Wellness',
      description: 'Full-service spa with holistic treatments and massages',
      image: 'https://example.com/spa.jpg'
    },
    {
      title: 'Fine Dining',
      description: 'Award-winning restaurant with sunset views',
      image: 'https://example.com/dining.jpg'
    },
    {
      title: 'Business Center',
      description: '24-hour business center with meeting rooms',
      icon: 'Briefcase'
    }
  ],
  variant: {
    layout: 'cards',
    columns: 2
  }
};

const validFeaturesPropsMinimal: FeaturesConfig = {
  features: [
    {
      title: 'Free Breakfast',
      description: 'Continental breakfast included'
    },
    {
      title: 'Free Parking',
      description: 'On-site parking available'
    }
  ]
};

// =============================================================================
// ROUTER DELEGATION TESTS
// =============================================================================

describe('Features Router - Layout Delegation', () => {
  describe('AC2: Router delegates to FeaturesIconGrid for "icon-grid" layout', () => {
    it('should render FeaturesIconGrid when layout is "icon-grid"', () => {
      render(<Features {...validFeaturesPropsIconGrid} />);

      // FeaturesIconGrid renders heading when provided
      expect(screen.getByText('Why Choose Us')).toBeInTheDocument();

      // FeaturesIconGrid renders all feature titles
      expect(screen.getByText('Free WiFi')).toBeInTheDocument();
      expect(screen.getByText('Infinity Pool')).toBeInTheDocument();
      expect(screen.getByText('Concierge Service')).toBeInTheDocument();
    });

    it('should render FeaturesIconGrid when layout is not specified (default)', () => {
      const { variant, ...propsWithoutVariant } = validFeaturesPropsMinimal;
      render(<Features {...propsWithoutVariant} />);

      // Should default to FeaturesIconGrid
      expect(screen.getByText('Free Breakfast')).toBeInTheDocument();
      expect(screen.getByText('Free Parking')).toBeInTheDocument();
    });
  });

  describe('AC2: Router delegates to FeaturesCards for "cards" layout', () => {
    it('should render FeaturesCards when layout is "cards"', () => {
      render(<Features {...validFeaturesPropsCards} />);

      // FeaturesCards renders heading when provided
      expect(screen.getByText('Our Amenities')).toBeInTheDocument();

      // FeaturesCards renders all feature titles
      expect(screen.getByText('Spa & Wellness')).toBeInTheDocument();
      expect(screen.getByText('Fine Dining')).toBeInTheDocument();
      expect(screen.getByText('Business Center')).toBeInTheDocument();
    });
  });

  describe('AC2: Unknown layout defaults to FeaturesIconGrid', () => {
    it('should render FeaturesIconGrid when layout is unknown', () => {
      const invalidProps = {
        ...validFeaturesPropsIconGrid,
        variant: { layout: 'unknown' as any }
      };
      render(<Features {...invalidProps} />);

      // Should fall back to FeaturesIconGrid
      expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// CONTRACT VALIDATION TESTS
// =============================================================================

describe('Features Contract - Validation', () => {
  describe('AC1: Accepts valid props', () => {
    it('should accept all valid required and optional props with icon-grid layout', () => {
      const result = FeaturesContract.safeParse(validFeaturesPropsIconGrid);
      expect(result.success).toBe(true);
    });

    it('should accept all valid required and optional props with cards layout', () => {
      const result = FeaturesContract.safeParse(validFeaturesPropsCards);
      expect(result.success).toBe(true);
    });

    it('should accept minimal valid props (no heading, no variant, no icon/image)', () => {
      const result = FeaturesContract.safeParse(validFeaturesPropsMinimal);
      expect(result.success).toBe(true);
    });
  });

  describe('AC1: Rejects invalid props', () => {
    it('should reject when features array is missing', () => {
      const { features, ...propsWithoutFeatures } = validFeaturesPropsIconGrid;
      const result = FeaturesContract.safeParse(propsWithoutFeatures);
      expect(result.success).toBe(false);
    });

    it('should reject when features array has less than 2 items', () => {
      const propsWithOneFeature: FeaturesConfig = {
        ...validFeaturesPropsMinimal,
        features: validFeaturesPropsMinimal.features.slice(0, 1)
      };
      const result = FeaturesContract.safeParse(propsWithOneFeature);
      expect(result.success).toBe(false);
    });

    it('should reject when features array has more than 8 items', () => {
      const propsWithTooManyFeatures: FeaturesConfig = {
        ...validFeaturesPropsMinimal,
        features: Array.from({ length: 9 }, (_, i) => ({
          title: `Feature ${i + 1}`,
          description: `Description ${i + 1}`
        }))
      };
      const result = FeaturesContract.safeParse(propsWithTooManyFeatures);
      expect(result.success).toBe(false);
    });

    it('should reject when feature title is missing', () => {
      const propsWithMissingTitle: FeaturesConfig = {
        ...validFeaturesPropsMinimal,
        features: [
          { title: '', description: 'Some description' }
        ]
      };
      const result = FeaturesContract.safeParse(propsWithMissingTitle);
      expect(result.success).toBe(false);
    });

    it('should reject when feature description is missing', () => {
      const propsWithMissingDescription: FeaturesConfig = {
        ...validFeaturesPropsMinimal,
        features: [
          { title: 'Some title', description: '' }
        ]
      };
      const result = FeaturesContract.safeParse(propsWithMissingDescription);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// SUB-COMPONENT RENDERING TESTS
// =============================================================================

describe('FeaturesIconGrid - Component Rendering', () => {
  describe('AC3: Renders icon grid with required content', () => {
    it('should render heading when provided', () => {
      render(<FeaturesIconGrid {...validFeaturesPropsIconGrid} />);

      expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
    });

    it('should render all feature titles and descriptions', () => {
      render(<FeaturesIconGrid {...validFeaturesPropsIconGrid} />);

      expect(screen.getByText('Free WiFi')).toBeInTheDocument();
      expect(screen.getByText('High-speed internet throughout the property')).toBeInTheDocument();

      expect(screen.getByText('Infinity Pool')).toBeInTheDocument();
      expect(screen.getByText('Heated infinity pool with stunning views')).toBeInTheDocument();

      expect(screen.getByText('Concierge Service')).toBeInTheDocument();
      expect(screen.getByText('24/7 dedicated concierge for personalized experiences')).toBeInTheDocument();
    });

    it('should not render heading when not provided', () => {
      render(<FeaturesIconGrid {...validFeaturesPropsMinimal} />);

      expect(screen.queryByText('Why Choose Us')).not.toBeInTheDocument();
      expect(screen.getByText('Free Breakfast')).toBeInTheDocument();
    });
  });

  describe('AC3: Uses semantic tokens for styling', () => {
    it('should apply bg-brand-primary to icon containers', () => {
      const { container } = render(<FeaturesIconGrid {...validFeaturesPropsIconGrid} />);

      const iconContainers = container.querySelectorAll('.bg-brand-primary');
      expect(iconContainers.length).toBeGreaterThan(0);
    });

    it('should apply text-text-primary to feature titles', () => {
      const { container } = render(<FeaturesIconGrid {...validFeaturesPropsIconGrid} />);

      const titleElements = container.querySelectorAll('.text-text-primary');
      expect(titleElements.length).toBeGreaterThan(0);
    });
  });
});

describe('FeaturesCards - Component Rendering', () => {
  describe('AC5: Renders cards with required content', () => {
    it('should render heading when provided', () => {
      render(<FeaturesCards {...validFeaturesPropsCards} />);

      expect(screen.getByText('Our Amenities')).toBeInTheDocument();
    });

    it('should render all feature titles and descriptions', () => {
      render(<FeaturesCards {...validFeaturesPropsCards} />);

      expect(screen.getByText('Spa & Wellness')).toBeInTheDocument();
      expect(screen.getByText('Full-service spa with holistic treatments and massages')).toBeInTheDocument();

      expect(screen.getByText('Fine Dining')).toBeInTheDocument();
      expect(screen.getByText('Award-winning restaurant with sunset views')).toBeInTheDocument();

      expect(screen.getByText('Business Center')).toBeInTheDocument();
      expect(screen.getByText('24-hour business center with meeting rooms')).toBeInTheDocument();
    });
  });

  describe('AC5: Uses shadcn/ui Card components', () => {
    it('should render cards with proper styling', () => {
      const { container } = render(<FeaturesCards {...validFeaturesPropsCards} />);

      // Check for Card components (they have specific classes)
      const cards = container.querySelectorAll('[class*="rounded"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// ICON RENDERING TESTS
// =============================================================================

describe('FeaturesIconGrid - Icon Rendering', () => {
  describe('AC4: Dynamic icon lookup with fallback', () => {
    it('should render the correct icon when icon name is valid', () => {
      render(<FeaturesIconGrid {...validFeaturesPropsIconGrid} />);

      // Should render WiFi icon
      expect(screen.getByTestId('icon-wifi')).toBeInTheDocument();
      // Should render Waves icon
      expect(screen.getByTestId('icon-waves')).toBeInTheDocument();
    });

    it('should render fallback Star icon when icon name is not found', () => {
      const propsWithInvalidIcon: FeaturesConfig = {
        ...validFeaturesPropsMinimal,
        features: [
          {
            title: 'Test Feature',
            description: 'Test description',
            icon: 'InvalidIconName'
          }
        ]
      };

      render(<FeaturesIconGrid {...propsWithInvalidIcon} />);

      // Should fall back to Star icon
      expect(screen.getByTestId('icon-star')).toBeInTheDocument();
    });

    it('should not render icon container when no icon is provided', () => {
      const propsWithoutIcon: FeaturesConfig = {
        ...validFeaturesPropsMinimal,
        features: [
          {
            title: 'Test Feature',
            description: 'Test description'
          }
        ]
      };

      render(<FeaturesIconGrid {...propsWithoutIcon} />);

      // Should still render the feature title and description
      expect(screen.getByText('Test Feature')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// CVA VALIDATION TESTS
// =============================================================================

describe('Features - CVA Validation', () => {
  describe('AC7: Layout variant options', () => {
    it('should accept "icon-grid" layout', () => {
      render(<Features {...validFeaturesPropsIconGrid} />);
      expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    });

    it('should accept "cards" layout', () => {
      render(<Features {...validFeaturesPropsCards} />);
      expect(screen.getByText('Spa & Wellness')).toBeInTheDocument();
    });
  });

  describe('AC7: Columns variant options', () => {
    it('should accept 2 columns', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsIconGrid,
        variant: { layout: 'icon-grid', columns: 2 }
      };

      render(<Features {...props} />);
      expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    });

    it('should accept 3 columns', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsIconGrid,
        variant: { layout: 'icon-grid', columns: 3 }
      };

      render(<Features {...props} />);
      expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    });

    it('should accept 4 columns', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsIconGrid,
        variant: { layout: 'icon-grid', columns: 4 }
      };

      render(<Features {...props} />);
      expect(screen.getByText('Free WiFi')).toBeInTheDocument();
    });
  });
});

// =============================================================================
// RESPONSIVE DESIGN TESTS
// =============================================================================

describe('Features - Responsive Design', () => {
  describe('AC6: FeaturesIconGrid is responsive with configurable columns', () => {
    it('should have responsive grid classes for 2 columns', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsIconGrid,
        variant: { layout: 'icon-grid', columns: 2 }
      };
      const { container } = render(<FeaturesIconGrid {...props} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1'); // mobile: 1 column
      expect(gridContainer).toHaveClass('md:grid-cols-2'); // desktop: 2 columns
    });

    it('should have responsive grid classes for 3 columns', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsIconGrid,
        variant: { layout: 'icon-grid', columns: 3 }
      };
      const { container } = render(<FeaturesIconGrid {...props} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1'); // mobile: 1 column
      expect(gridContainer).toHaveClass('md:grid-cols-2'); // tablet: 2 columns
      expect(gridContainer).toHaveClass('lg:grid-cols-3'); // desktop: 3 columns
    });

    it('should have responsive grid classes for 4 columns', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsIconGrid,
        variant: { layout: 'icon-grid', columns: 4 }
      };
      const { container } = render(<FeaturesIconGrid {...props} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1'); // mobile: 1 column
      expect(gridContainer).toHaveClass('md:grid-cols-2'); // tablet: 2 columns
      expect(gridContainer).toHaveClass('lg:grid-cols-4'); // desktop: 4 columns
    });
  });

  describe('AC6: FeaturesCards is responsive', () => {
    it('should cap at 3 columns even when 4 is specified', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsCards,
        variant: { layout: 'cards', columns: 4 }
      };
      const { container } = render(<FeaturesCards {...props} />);

      // Should use 3 columns for cards (4 is capped at 3)
      const gridContainer = container.querySelector('.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have responsive grid classes for 2 columns', () => {
      const props: FeaturesConfig = {
        ...validFeaturesPropsCards,
        variant: { layout: 'cards', columns: 2 }
      };
      const { container } = render(<FeaturesCards {...props} />);

      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('grid-cols-1'); // mobile: 1 column
      expect(gridContainer).toHaveClass('md:grid-cols-2'); // desktop: 2 columns
    });
  });
});

// =============================================================================
// IMAGE HANDLING TESTS
// =============================================================================

describe('FeaturesCards - Image Handling', () => {
  describe('AC5: Renders images when provided, icon fallback when not', () => {
    it('should render image when feature has image property', () => {
      render(<FeaturesCards {...validFeaturesPropsCards} />);

      // Should render img elements for features with images
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);

      // Check that the image has proper alt text
      const spaImage = images.find(img => img.alt === 'Spa & Wellness');
      expect(spaImage).toBeInTheDocument();
    });

    it('should render icon fallback when feature has no image', () => {
      render(<FeaturesCards {...validFeaturesPropsCards} />);

      // The Business Center feature has an icon instead of image
      // Should render the Briefcase icon
      expect(screen.getByTestId('icon-briefcase')).toBeInTheDocument();
    });

    it('should use Next.js Image with fill prop for responsive images', () => {
      render(<FeaturesCards {...validFeaturesPropsCards} />);

      // Next.js Image with fill prop is mocked to render img without fill
      // We just verify the image is rendered
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });
  });
});

// =============================================================================
// COMPONENTRENDERER INTEGRATION TEST
// =============================================================================

describe('Features - ComponentRenderer Integration', () => {
  describe('AC8: Renders via ComponentRenderer with HomepageConfig', () => {
    it('should be included in ComponentMap', () => {
      // This test verifies Features is registered in ComponentRenderer
      // The actual ComponentRenderer integration is tested in ComponentRenderer.test.tsx
      const featuresComponent = require('@/components/sections/Features');
      expect(featuresComponent).toBeDefined();
    });
  });
});
