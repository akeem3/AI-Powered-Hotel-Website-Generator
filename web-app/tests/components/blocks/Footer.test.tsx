/**
 * Footer Component Tests
 *
 * Story 19.1: Footer Block (3 Structural Variants)
 * Story 19.6: New Block Tests - Footer Contract, Router, and Sub-component Tests
 *
 * Test suites:
 * 1. Router delegation tests - each layout routes to correct sub-component
 * 2. Fallback tests - unknown layout defaults to FooterClassic
 * 3. Contract validation tests - accepts valid props, rejects missing hotelName, validates socialLinks platform enum
 * 4. Sub-component rendering tests - each renders required content with semantic tokens
 *
 * Epic 19: Extended Block Library (Footer, About, FAQ, Features)
 * FR Coverage: FR7, FR8
 *
 * @module tests/components/blocks/Footer.test
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/components/blocks/Footer';
import FooterClassic from '@/components/blocks/Footer/FooterClassic';
import FooterMinimal from '@/components/blocks/Footer/FooterMinimal';
import FooterStacked from '@/components/blocks/Footer/FooterStacked';
import { FooterContract, type FooterConfig } from '@/lib/contracts/footer.contract';

// =============================================================================
// MOCKS
// =============================================================================

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} fill={undefined} priority={undefined} />,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock validation to avoid console errors in tests
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Mock shadcn/ui components for FooterStacked newsletter form
jest.mock('@/components/ui/input', () => ({
  Input: ({ className, ...props }: any) => <input className={className} {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ className, children, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

// =============================================================================
// TEST FIXTURES
// =============================================================================

const validFooterProps: FooterConfig = {
  hotelName: 'Test Hotel',
  address: '123 Test Street, Test City',
  phone: '+1-555-0123',
  email: 'test@testhotel.com',
  variant: {
    layout: 'classic'
  },
  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com/testhotel' },
    { platform: 'instagram', url: 'https://instagram.com/testhotel' },
    { platform: 'twitter', url: 'https://twitter.com/testhotel' },
    { platform: 'tripadvisor', url: 'https://tripadvisor.com/testhotel' },
    { platform: 'google', url: 'https://google.com/testhotel' }
  ],
  navigationLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Rooms', href: '/rooms' },
    { label: 'Contact', href: '/contact' }
  ],
  copyright: '© 2026 Test Hotel. All rights reserved.'
};

// =============================================================================
// ROUTER DELEGATION TESTS
// =============================================================================

describe('Footer Router - Layout Delegation', () => {
  describe('AC1: Router delegates to FooterClassic for "classic" layout', () => {
    it('should render FooterClassic when layout is "classic"', () => {
      render(<Footer {...validFooterProps} variant={{ layout: 'classic' }} />);

      // FooterClassic renders a footer element with role="contentinfo"
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Check for classic layout indicators: max-width container with grid
      const gridContainer = footer.querySelector('.max-w-6xl');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer?.querySelector('.grid')).toBeInTheDocument();
    });

    it('should render FooterClassic when layout is not specified (default)', () => {
      const { variant, ...propsWithoutVariant } = validFooterProps;
      render(<Footer {...propsWithoutVariant} />);

      // Should default to FooterClassic
      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Check for classic layout indicators: max-width container with grid
      const gridContainer = footer.querySelector('.max-w-6xl');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer?.querySelector('.grid')).toBeInTheDocument();
    });
  });

  describe('AC2: Router delegates to FooterMinimal for "minimal" layout', () => {
    it('should render FooterMinimal when layout is "minimal"', () => {
      render(<Footer {...validFooterProps} variant={{ layout: 'minimal' }} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // FooterMinimal uses flexbox layout
      expect(footer).toHaveClass('flex');
    });
  });

  describe('AC3: Router delegates to FooterStacked for "stacked" layout', () => {
    it('should render FooterStacked when layout is "stacked"', () => {
      render(<Footer {...validFooterProps} variant={{ layout: 'stacked' }} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // FooterStacked uses flex-column layout
      expect(footer).toHaveClass('flex-col');
    });
  });

  describe('AC4: Unknown layout defaults to FooterClassic', () => {
    it('should render FooterClassic when layout is unknown', () => {
      render(<Footer {...validFooterProps} variant={{ layout: 'unknown' as any }} />);

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();

      // Should fall back to FooterClassic (grid layout with grid-cols- classes)
      expect(footer).toHaveClass('grid-cols-1');
      expect(footer).toHaveClass('md:grid-cols-4');
    });
  });
});

// =============================================================================
// CONTRACT VALIDATION TESTS
// =============================================================================

describe('Footer Contract - Validation', () => {
  describe('AC5: Accepts valid props', () => {
    it('should accept all valid required and optional props', () => {
      const result = FooterContract.safeParse(validFooterProps);
      expect(result.success).toBe(true);
    });

    it('should accept minimal valid props (only required hotelName)', () => {
      const minimalProps: FooterConfig = {
        hotelName: 'Test Hotel'
      };

      const result = FooterContract.safeParse(minimalProps);
      expect(result.success).toBe(true);
    });
  });

  describe('AC6: Rejects missing required hotelName', () => {
    it('should reject props without hotelName', () => {
      const invalidProps = {
        address: '123 Test Street'
        // Missing hotelName
      } as any;

      const result = FooterContract.safeParse(invalidProps);
      expect(result.success).toBe(false);
    });
  });

  describe('AC7: Validates socialLinks platform enum', () => {
    it('should accept all valid platform values', () => {
      const validPlatforms = ['facebook', 'instagram', 'twitter', 'tripadvisor', 'google', 'linkedin'];

      validPlatforms.forEach((platform) => {
        const props = {
          hotelName: 'Test Hotel',
          socialLinks: [
            { platform, url: 'https://example.com' }
          ]
        };

        const result = FooterContract.safeParse(props);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid platform values', () => {
      const invalidProps = {
        hotelName: 'Test Hotel',
        socialLinks: [
          { platform: 'tiktok', url: 'https://tiktok.com' } // Invalid platform
        ]
      } as any;

      const result = FooterContract.safeParse(invalidProps);
      expect(result.success).toBe(false);
    });
  });

  describe('AC8: Validates navigationLinks structure', () => {
    it('should accept valid navigationLinks with label and href', () => {
      const props = {
        hotelName: 'Test Hotel',
        navigationLinks: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' }
        ]
      };

      const result = FooterContract.safeParse(props);
      expect(result.success).toBe(true);
    });

    it('should reject navigationLinks without required fields', () => {
      const invalidProps = {
        hotelName: 'Test Hotel',
        navigationLinks: [
          { label: 'Home' } // Missing href
        ]
      } as any;

      const result = FooterContract.safeParse(invalidProps);
      expect(result.success).toBe(false);
    });
  });
});

// =============================================================================
// SUB-COMPONENT RENDERING TESTS
// =============================================================================

describe('FooterClassic - Sub-component Rendering', () => {
  describe('AC9: Renders hotel information', () => {
    it('should display hotel name in column 1', () => {
      render(<FooterClassic {...validFooterProps} />);

      expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    });

    it('should display address in address element', () => {
      render(<FooterClassic {...validFooterProps} />);

      const address = screen.getByText('123 Test Street, Test City');
      expect(address).toBeInTheDocument();
      expect(address.tagName).toBe('ADDRESS');
    });

    it('should display phone number as link', () => {
      render(<FooterClassic {...validFooterProps} />);

      const phoneLink = screen.getByText('+1-555-0123');
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink.tagName).toBe('A');
      expect(phoneLink).toHaveAttribute('href', 'tel:+1-555-0123');
    });

    it('should display email as link', () => {
      render(<FooterClassic {...validFooterProps} />);

      const emailLink = screen.getByText('test@testhotel.com');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.tagName).toBe('A');
      expect(emailLink).toHaveAttribute('href', 'mailto:test@testhotel.com');
    });
  });

  describe('AC10: Renders navigation links in groups', () => {
    it('should display all navigation links', () => {
      render(<FooterClassic {...validFooterProps} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Rooms')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('AC11: Renders social media icons with accessibility', () => {
    it('should display all social links', () => {
      render(<FooterClassic {...validFooterProps} />);

      // Check for social link aria-labels
      expect(screen.getByLabelText('Visit us on facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Visit us on instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('Visit us on twitter')).toBeInTheDocument();
    });
  });

  describe('AC12: Renders copyright in bottom bar', () => {
    it('should display custom copyright text', () => {
      render(<FooterClassic {...validFooterProps} />);

      expect(screen.getByText('© 2026 Test Hotel. All rights reserved.')).toBeInTheDocument();
    });

    it('should generate default copyright if not provided', () => {
      const { copyright, ...propsWithoutCopyright } = validFooterProps;
      render(<FooterClassic {...propsWithoutCopyright} />);

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} Test Hotel. All rights reserved.`)).toBeInTheDocument();
    });
  });

  describe('AC13: Applies semantic token CSS classes', () => {
    it('should use semantic design tokens (no hardcoded colors)', () => {
      const { container } = render(<FooterClassic {...validFooterProps} />);

      const footer = container.querySelector('footer');

      // Check for semantic tokens (dark blue background with white text)
      expect(footer).toHaveClass('bg-brand-primary');
      expect(footer).toHaveClass('text-white');

      // Check that no hardcoded color classes are present
      expect(footer?.className).not.toMatch(/bg-gray-/);
    });
  });
});

describe('FooterMinimal - Sub-component Rendering', () => {
  describe('AC14: Renders copyright and social icons only', () => {
    it('should display copyright text', () => {
      render(<FooterMinimal {...validFooterProps} />);

      expect(screen.getByText('© 2026 Test Hotel. All rights reserved.')).toBeInTheDocument();
    });

    it('should not display address or navigation links', () => {
      render(<FooterMinimal {...validFooterProps} />);

      // Should not render address element
      const address = screen.queryByText('123 Test Street, Test City');
      expect(address).not.toBeInTheDocument();

      // Should not render navigation section heading
      expect(screen.queryByText('Quick Links')).not.toBeInTheDocument();
    });

    it('should display social media icons', () => {
      render(<FooterMinimal {...validFooterProps} />);

      expect(screen.getByLabelText('Visit us on facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Visit us on instagram')).toBeInTheDocument();
    });
  });

  describe('AC15: Applies semantic token CSS classes', () => {
    it('should use semantic design tokens', () => {
      const { container } = render(<FooterMinimal {...validFooterProps} />);

      const footer = container.querySelector('footer');

      // Check for semantic tokens (dark blue background with white text)
      expect(footer).toHaveClass('bg-brand-primary');
      expect(footer).toHaveClass('text-white');
      expect(footer).toHaveClass('border-t');
    });
  });
});

describe('FooterStacked - Sub-component Rendering', () => {
  describe('AC16: Renders newsletter section by default', () => {
    it('should display newsletter heading', () => {
      render(<FooterStacked {...validFooterProps} />);

      expect(screen.getByText('Stay Updated')).toBeInTheDocument();
    });

    it('should display newsletter form with input and button', () => {
      render(<FooterStacked {...validFooterProps} />);

      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /subscribe/i })).toBeInTheDocument();
    });
  });

  describe('AC17: Renders navigation links horizontally', () => {
    it('should display navigation links in wrapped layout', () => {
      render(<FooterStacked {...validFooterProps} />);

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Rooms')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });
  });

  describe('AC18: Renders address section when contact info provided', () => {
    it('should display hotel name and address', () => {
      render(<FooterStacked {...validFooterProps} />);

      expect(screen.getByText('Test Hotel')).toBeInTheDocument();
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument();
    });

    it('should display phone and email as links', () => {
      render(<FooterStacked {...validFooterProps} />);

      const phoneLink = screen.getByText('+1-555-0123');
      expect(phoneLink).toBeInTheDocument();
      expect(phoneLink.tagName).toBe('A');

      const emailLink = screen.getByText('test@testhotel.com');
      expect(emailLink).toBeInTheDocument();
      expect(emailLink.tagName).toBe('A');
    });
  });

  describe('AC19: Renders copyright and social icons in bottom section', () => {
    it('should display copyright text', () => {
      render(<FooterStacked {...validFooterProps} />);

      expect(screen.getByText('© 2026 Test Hotel. All rights reserved.')).toBeInTheDocument();
    });

    it('should display social media icons', () => {
      render(<FooterStacked {...validFooterProps} />);

      expect(screen.getByLabelText('Visit us on facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Visit us on instagram')).toBeInTheDocument();
    });
  });

  describe('AC20: Applies semantic token CSS classes', () => {
    it('should use semantic design tokens', () => {
      const { container } = render(<FooterStacked {...validFooterProps} />);

      const footer = container.querySelector('footer');

      // Check for semantic tokens (footer always uses brand-primary background)
      expect(footer).toHaveClass('bg-brand-primary');
      expect(footer).toHaveClass('text-white');
      expect(footer).toHaveClass('border-t');
    });
  });

  describe('AC21: Newsletter section exists by default', () => {
    it('should render newsletter section with form', () => {
      const { container } = render(<FooterStacked {...validFooterProps} />);

      // The newsletter section should exist
      const newsletterSection = container.querySelector('.newsletter-section');
      expect(newsletterSection).toBeInTheDocument();
      expect(newsletterSection).toHaveClass('border-b');
    });
  });
});
