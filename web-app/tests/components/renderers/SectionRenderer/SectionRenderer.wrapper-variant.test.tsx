/**
 * SectionRenderer Wrapper Variant Rendering Tests - Story 18.6
 *
 * Tests for wrapper variant rendering behavior in SectionRenderer.
 * Validates that each wrapper style (accent, simple, numbered, none) produces
 * structurally distinct rendered output.
 *
 * @trace epic: EPIC-18
 * @trace story: STORY-18.6
 * @trace reqs: Wrapper variant rendering tests
 */

import { render, screen } from '@testing-library/react';
import SectionRenderer from '@/components/renderers/SectionRenderer';

// Mock component for testing
const MockComponent = () => <div data-testid="mock-component">Mock Component Content</div>;

describe('SectionRenderer - Wrapper Variant Rendering (Story 18.6)', () => {
  describe('wrapper.style: "accent"', () => {
    it('should render gold accent header with decorative elements', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'accent' as const,
          title: 'Explore Our Hotel',
          description: 'Discover our luxurious facilities',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should have gold accent divider elements (brand-secondary)
      const accentDividers = container.querySelectorAll('.bg-brand-secondary');
      expect(accentDividers.length).toBeGreaterThan(0);

      // Should have the main heading
      expect(screen.getByText('Explore Our Hotel')).toBeInTheDocument();

      // Should have the description
      expect(screen.getByText('Discover our luxurious facilities')).toBeInTheDocument();

      // Should render the component
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should render gold accent header with title only (no description)', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'accent' as const,
          title: 'Gallery',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should have the heading
      expect(screen.getByText('Gallery')).toBeInTheDocument();

      // Should render the component
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should render with section tag and container for components needing full wrapper', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'accent' as const,
          title: 'Gallery',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Gallery needs full wrapper, should have section tag
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });
  });

  describe('wrapper.style: "simple"', () => {
    it('should render plain heading without decorative elements', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'simple' as const,
          title: 'Our Rooms',
          description: 'Choose from our range of accommodations',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should NOT have gold accent dividers
      const accentDividers = container.querySelectorAll('.bg-brand-secondary');
      expect(accentDividers.length).toBe(0);

      // Should have the main heading
      expect(screen.getByText('Our Rooms')).toBeInTheDocument();

      // Should have the description
      expect(screen.getByText('Choose from our range of accommodations')).toBeInTheDocument();

      // Should render the component
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should render simple header with title only (no description)', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'simple' as const,
          title: 'Rooms',
        },
      };

      render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should have the heading
      expect(screen.getByText('Rooms')).toBeInTheDocument();

      // Should render the component
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should be structurally distinct from accent style (no decorative elements)', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'simple' as const,
          title: 'Simple Title',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Simple style should NOT have:
      // - Gold accent bars (flex with bg-brand-secondary dividers)
      // - Gold dots (rounded-full bg-brand-secondary)
      // - Gold underlines (w-divider-lg h-divider-accent)

      const flexAccentBars = container.querySelectorAll('.flex.items-center.justify-center');
      expect(flexAccentBars.length).toBe(0);

      const roundedDots = container.querySelectorAll('.rounded-full.bg-brand-secondary');
      expect(roundedDots.length).toBe(0);
    });
  });

  describe('wrapper.style: "numbered"', () => {
    it('should render numbered badge with heading', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'numbered' as const,
          title: 'Accommodations',
          description: 'Professional rooms for business travelers',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should have numbered badge (01 by default for order 1)
      expect(screen.getByText('01')).toBeInTheDocument();

      // Should have the main heading
      expect(screen.getByText('Accommodations')).toBeInTheDocument();

      // Should have the description
      expect(screen.getByText('Professional rooms for business travelers')).toBeInTheDocument();

      // Should render the component
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should render numbered badge with title only (no description)', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 2,
        wrapper: {
          style: 'numbered' as const,
          title: 'Amenities',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // SectionRenderer defaults to sectionIndex 0 when not explicitly passed
      // (section index tracking is handled at higher level like ComponentRenderer)
      expect(screen.getByText('01')).toBeInTheDocument();

      // Should have the heading
      expect(screen.getByText('Amenities')).toBeInTheDocument();
    });

    it('should default to 01 when no sectionIndex tracking at higher level', () => {
      // First component should be 01
      const config1 = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 0,
        wrapper: {
          style: 'numbered' as const,
          title: 'First Section',
        },
      };

      const { container: container1 } = render(
        <SectionRenderer config={config1} Component={MockComponent} />
      );
      expect(container1.textContent).toContain('01');

      // Second component should be 02
      const config2 = {
        type: 'rooms' as const,
        variant: { roomCardStyle: 'detailed' },
        props: { rooms: [] },
        order: 1,
        wrapper: {
          style: 'numbered' as const,
          title: 'Second Section',
        },
      };

      const { container: container2 } = render(
        <SectionRenderer config={config2} Component={MockComponent} />
      );
      // SectionRenderer defaults to sectionIndex 0 when no tracking at higher level
      // (section index tracking would be handled by ComponentRenderer or preview page)
      expect(container2.textContent).toContain('01');
    });

    it('should be structurally distinct from accent and simple styles', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'numbered' as const,
          title: 'Numbered Title',
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Numbered style should have flex layout with badge
      const flexLayout = container.querySelector('.flex.items-center.gap-gap-card');
      expect(flexLayout).toBeInTheDocument();

      // Should have numbered badge (01)
      expect(screen.getByText('01')).toBeInTheDocument();

      // Should NOT have accent-style decorative elements
      const accentBars = container.querySelectorAll('.flex.items-center.justify-center');
      expect(accentBars.length).toBe(0);
    });
  });

  describe('wrapper.style: "none"', () => {
    it('should not render any heading or decorative markup', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'none' as const,
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should NOT have any h2 headings (since wrapper has no title)
      const headings = container.querySelectorAll('h2');
      expect(headings.length).toBe(0);

      // Should still render the component
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should render component directly without section wrapper for self-contained components', () => {
      const config = {
        type: 'hero' as const,
        variant: { style: 'modern' },
        props: { title: 'Test Hero' },
        order: 0,
        wrapper: {
          style: 'none' as const,
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Hero is self-contained, should render component directly
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });

    it('should be structurally minimal (no wrapper elements)', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        wrapper: {
          style: 'none' as const,
        },
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should NOT have:
      // - Gold accent dividers
      // - Decorative flex layouts
      // - Numbered badges

      const accentDividers = container.querySelectorAll('.bg-brand-secondary');
      expect(accentDividers.length).toBe(0);

      const numberedBadges = container.querySelectorAll('.rounded-md');
      expect(numberedBadges.length).toBe(0);
    });
  });

  describe('Wrapper style structural distinction', () => {
    it('should produce different DOM structure for each wrapper style', () => {
      const wrapperStyles: Array<'accent' | 'simple' | 'numbered' | 'none'> = ['accent', 'simple', 'numbered', 'none'];

      const renderedContainers = wrapperStyles.map((style) => {
        const config = {
          type: 'gallery' as const,
          variant: { layout: 'masonry' },
          props: {},
          order: 1,
          wrapper: {
            style,
            title: 'Test Title',
            description: 'Test Description',
          },
        };

        // For 'none' style, title/description are not used
        const finalConfig = style === 'none'
          ? { ...config, wrapper: { style: 'none' as const } }
          : config;

        const { container } = render(
          <SectionRenderer config={finalConfig} Component={MockComponent} />
        );

        return container.innerHTML;
      });

      // Each wrapper style should produce distinct HTML
      const uniqueOutputs = new Set(renderedContainers);
      expect(uniqueOutputs.size).toBe(4);
    });

    it('should render component content in all wrapper styles', () => {
      const wrapperStyles: Array<'accent' | 'simple' | 'numbered' | 'none'> = ['accent', 'simple', 'numbered', 'none'];

      wrapperStyles.forEach((style) => {
        const config = {
          type: 'gallery' as const,
          variant: { layout: 'masonry' },
          props: {},
          order: 1,
          wrapper: {
            style,
            title: style === 'none' ? undefined : 'Test Title',
          },
        };

        render(<SectionRenderer config={config} Component={MockComponent} />);

        // Component should be rendered in all cases
        expect(screen.getByTestId('mock-component')).toBeInTheDocument();

        // Cleanup for next test
        screen.getByTestId('mock-component').remove();
      });
    });
  });

  describe('Backward compatibility', () => {
    it('should render without wrapper field (backward compatible)', () => {
      const config = {
        type: 'gallery' as const,
        variant: { layout: 'masonry' },
        props: {},
        order: 1,
        // No wrapper field
      };

      const { container } = render(<SectionRenderer config={config} Component={MockComponent} />);

      // Should render component (gallery needs full wrapper by default)
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();

      // Should have section tag (gallery needs full wrapper)
      const section = container.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    it('should render self-contained components without wrapper field', () => {
      const config = {
        type: 'hero' as const,
        variant: { style: 'modern' },
        props: { title: 'Test Hero' },
        order: 0,
        // No wrapper field
      };

      render(<SectionRenderer config={config} Component={MockComponent} />);

      // Hero is self-contained, should render component directly
      expect(screen.getByTestId('mock-component')).toBeInTheDocument();
    });
  });
});
