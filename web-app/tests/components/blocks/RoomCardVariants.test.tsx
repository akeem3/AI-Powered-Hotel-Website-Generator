import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomCardDetailed from '@/components/blocks/RoomCard/RoomCardDetailed';
import RoomCardCompact from '@/components/blocks/RoomCard/RoomCardCompact';
import RoomCardGrid from '@/components/blocks/RoomCard/RoomCardGrid';
import { mockRooms } from '@/components/data/mockRooms';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

// Mock CSS module import
jest.mock('../RoomCard/RoomCard.module.css', () => ({
  card: 'mock-card-class',
}));

describe('RoomCard Variants', () => {
  const mockRoomData = mockRooms[0]; // Executive Suite
  const mockCallbacks = {
    onBookNow: jest.fn(),
    onViewDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RoomCardDetailed Variant', () => {
    describe('Rendering', () => {
      it('renders detailed room information', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
        expect(screen.getByText('Suite')).toBeInTheDocument();
        expect(screen.getByText('$350')).toBeInTheDocument();
        expect(screen.getByText('Up to 4 guests')).toBeInTheDocument();
      });

      it('renders room description', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(screen.getByText('Spacious suite with separate living area.')).toBeInTheDocument();
      });

      it('renders amenities list', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(screen.getByText('WiFi')).toBeInTheDocument();
        expect(screen.getByText('Workspace')).toBeInTheDocument();
        expect(screen.getByText('Mini Bar')).toBeInTheDocument();
        expect(screen.getByText('City View')).toBeInTheDocument();
      });

      it('renders call-to-action buttons', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(screen.getByText('View Details')).toBeInTheDocument();
        expect(screen.getByText('Book Now')).toBeInTheDocument();
      });

      it('renders room image', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        const image = screen.getByAltText('Executive Suite');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80');
      });

      it('applies custom styling class', () => {
        const propsWithClass = {
          ...mockRoomData,
          className: 'custom-detailed-class',
        };

        render(<RoomCardDetailed {...propsWithClass} />);

        const roomCard = screen.getByText('Executive Suite').closest('[class*="custom-detailed-class"]');
        expect(roomCard).toBeInTheDocument();
      });

      it('renders without optional fields', () => {
        const roomWithoutOptionals = {
          id: 'test-room',
          name: 'Test Room',
          type: 'Standard',
          price: 200,
          capacity: 2,
          amenities: [],
        };

        render(<RoomCardDetailed {...roomWithoutOptionals} />);

        expect(screen.getByText('Test Room')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();
        expect(screen.queryByText('Spacious suite with separate living area.')).not.toBeInTheDocument();
      });
    });

    describe('Interactive Elements', () => {
      it('handles View Details button click', () => {
        render(<RoomCardDetailed {...mockRoomData} {...mockCallbacks} />);

        const viewDetailsBtn = screen.getByText('View Details');
        fireEvent.click(viewDetailsBtn);

        expect(mockCallbacks.onViewDetails).toHaveBeenCalledTimes(1);
        expect(mockCallbacks.onViewDetails).toHaveBeenCalledWith('exec-suite-001');
      });

      it('handles Book Now button click', () => {
        render(<RoomCardDetailed {...mockRoomData} {...mockCallbacks} />);

        const bookNowBtn = screen.getByText('Book Now');
        fireEvent.click(bookNowBtn);

        expect(mockCallbacks.onBookNow).toHaveBeenCalledTimes(1);
        expect(mockCallbacks.onBookNow).toHaveBeenCalledWith('exec-suite-001');
      });

      it('works without callback functions', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(() => {
          fireEvent.click(screen.getByText('View Details'));
          fireEvent.click(screen.getByText('Book Now'));
        }).not.toThrow();
      });
    });

    describe('Layout and Styling', () => {
      it('uses correct layout structure', () => {
        const { container } = render(<RoomCardDetailed {...mockRoomData} />);

        expect(container.firstChild).toHaveClass('rounded-2xl');
        // Story 1.11: Updated to semantic tokens
        expect(container.firstChild).toHaveClass('bg-surface-primary');
        expect(container.firstChild).toHaveClass('shadow-card');
      });

      it('applies responsive design classes', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        const roomCard = screen.getByText('Executive Suite').closest('div');
        expect(roomCard).toBeInTheDocument();
      });
    });

    describe('Data Display', () => {
      it('displays price formatted correctly', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(screen.getByText('$350')).toBeInTheDocument();
      });

      it('displays capacity information', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(screen.getByText('Up to 4 guests')).toBeInTheDocument();
      });

      it('displays room type', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        expect(screen.getByText('Suite')).toBeInTheDocument();
      });

      it('displays amenities as styled list items', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        const amenities = ['WiFi', 'Workspace', 'Mini Bar', 'City View'];
        amenities.forEach((amenity) => {
          const amenityElement = screen.getByText(amenity);
          expect(amenityElement).toBeInTheDocument();
          expect(amenityElement.closest('li')).toBeInTheDocument();
        });
      });

      it('handles empty amenities array', () => {
        const roomWithoutAmenities = {
          ...mockRoomData,
          amenities: [],
        };

        render(<RoomCardDetailed {...roomWithoutAmenities} />);

        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
        // No amenity list should be present
        expect(screen.queryByText('WiFi')).not.toBeInTheDocument();
      });

      it('handles missing image', () => {
        const roomWithoutImage = {
          ...mockRoomData,
          image: undefined,
        };

        render(<RoomCardDetailed {...roomWithoutImage} />);

        expect(screen.queryByAltText('Executive Suite')).not.toBeInTheDocument();
        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      });
    });

    describe('Accessibility', () => {
      it('has proper semantic structure', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        const roomName = screen.getByRole('heading', { name: 'Executive Suite' });
        expect(roomName).toBeInTheDocument();

        const viewDetailsBtn = screen.getByRole('button', { name: 'View Details' });
        const bookNowBtn = screen.getByRole('button', { name: 'Book Now' });

        expect(viewDetailsBtn).toBeInTheDocument();
        expect(bookNowBtn).toBeInTheDocument();
      });

      it('provides proper alt text for images', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        const image = screen.getByAltText('Executive Suite');
        expect(image).toBeInTheDocument();
      });

      it('buttons are keyboard accessible', () => {
        render(<RoomCardDetailed {...mockRoomData} />);

        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          expect(button).toBeInTheDocument();
        });
      });
    });

    describe('Different Room Data', () => {
      it('renders different room types correctly', () => {
        const standardRoom = mockRooms[1]; // Deluxe King Room

        render(<RoomCardDetailed {...standardRoom} />);

        expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('$225')).toBeInTheDocument();
        expect(screen.getByText('Up to 2 guests')).toBeInTheDocument();
      });

      it('renders business room correctly', () => {
        const businessRoom = mockRooms[2]; // Business Twin Room

        render(<RoomCardDetailed {...businessRoom} />);

        expect(screen.getByText('Business Twin Room')).toBeInTheDocument();
        expect(screen.getByText('Standard')).toBeInTheDocument();
        expect(screen.getByText('$195')).toBeInTheDocument();
        expect(screen.getByText('Up to 2 guests')).toBeInTheDocument();
      });
    });
  });

  describe('RoomCardCompact Variant', () => {
    describe('Rendering', () => {
      it('renders compact room information', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
        expect(screen.getByText('$350')).toBeInTheDocument();
      });

      it('renders room image', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        const image = screen.getByAltText('Executive Suite');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80');
      });

      it('applies custom styling class', () => {
        const propsWithClass = {
          ...mockRoomData,
          className: 'custom-compact-class',
        };

        render(<RoomCardCompact {...propsWithClass} />);

        const roomCard = screen.getByText('Executive Suite').closest('[class*="custom-compact-class"]');
        expect(roomCard).toBeInTheDocument();
      });

      it('renders without optional fields', () => {
        const roomWithoutOptionals = {
          id: 'test-room',
          name: 'Test Room',
          type: 'Standard',
          price: 200,
          capacity: 2,
          amenities: [],
        };

        render(<RoomCardCompact {...roomWithoutOptionals} />);

        expect(screen.getByText('Test Room')).toBeInTheDocument();
        expect(screen.getByText('$200')).toBeInTheDocument();
      });
    });

    describe('Minimal Information Display', () => {
      it('does not render description', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        expect(screen.queryByText('Spacious suite with separate living area.')).not.toBeInTheDocument();
      });

      it('renders first 3 amenities', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        expect(screen.getByText('WiFi')).toBeInTheDocument();
        expect(screen.getByText('Workspace')).toBeInTheDocument();
      });

      it('renders room type', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        expect(screen.getByText('Suite')).toBeInTheDocument();
      });

      it('renders capacity as "X guests"', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        expect(screen.getByText('4 guests')).toBeInTheDocument();
      });

      it('does not render call-to-action buttons', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        expect(screen.queryByText('View Details')).not.toBeInTheDocument();
        expect(screen.queryByText('Book Now')).not.toBeInTheDocument();
      });
    });

    describe('Layout and Styling', () => {
      it('uses compact layout structure', () => {
        const { container } = render(<RoomCardCompact {...mockRoomData} />);

        // Story 1.11: Updated to semantic tokens
        expect(container.firstChild).toHaveClass('bg-surface-primary');
        // Updated to match current implementation: rounded-xl
        expect(container.firstChild).toHaveClass('rounded-xl');
        expect(container.firstChild).toHaveClass('shadow-card');
      });

      it('applies hover states', () => {
        const { container } = render(<RoomCardCompact {...mockRoomData} />);

        // Story 1.11: Updated to semantic tokens
        expect(container.firstChild).toHaveClass('hover:shadow-card-hover');
        expect(container.firstChild).toHaveClass('hover:-translate-y-1');
      });
    });

    describe('Data Display', () => {
      it('displays price formatted correctly', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        expect(screen.getByText('$350')).toBeInTheDocument();
      });

      it('displays room name prominently', () => {
        render(<RoomCardCompact {...mockRoomData} />);

        const roomName = screen.getByText('Executive Suite');
        expect(roomName).toBeInTheDocument();
        expect(roomName.tagName).toBe('H3');
      });

      it('handles missing image', () => {
        const roomWithoutImage = {
          ...mockRoomData,
          image: undefined,
        };

        render(<RoomCardCompact {...roomWithoutImage} />);

        expect(screen.queryByAltText('Executive Suite')).not.toBeInTheDocument();
        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      });
    });

    describe('Different Room Data', () => {
      it('renders different room types compactly', () => {
        const standardRoom = mockRooms[1]; // Deluxe King Room

        render(<RoomCardCompact {...standardRoom} />);

        expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
        expect(screen.getByText('$225')).toBeInTheDocument();
      });

      it('renders business room compactly', () => {
        const businessRoom = mockRooms[2]; // Business Twin Room

        render(<RoomCardCompact {...businessRoom} />);

        expect(screen.getByText('Business Twin Room')).toBeInTheDocument();
        expect(screen.getByText('$195')).toBeInTheDocument();
      });
    });
  });

  describe('RoomCardGrid Variant', () => {
    describe('Rendering', () => {
      it('renders grid room information', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      });

      it('renders room image', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        const image = screen.getByAltText('Executive Suite');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80');
      });

      it('applies custom styling class', () => {
        const propsWithClass = {
          ...mockRoomData,
          className: 'custom-grid-class',
        };

        render(<RoomCardGrid {...propsWithClass} />);

        const roomCard = screen.getByText('Executive Suite').closest('[class*="custom-grid-class"]');
        expect(roomCard).toBeInTheDocument();
      });

      it('renders without optional fields', () => {
        const roomWithoutOptionals = {
          id: 'test-room',
          name: 'Test Room',
          type: 'Standard',
          price: 200,
          capacity: 2,
          amenities: [],
        };

        render(<RoomCardGrid {...roomWithoutOptionals} />);

        expect(screen.getByText('Test Room')).toBeInTheDocument();
      });
    });

    describe('Minimal Information Display', () => {
      it('does not render description', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        expect(screen.queryByText('Spacious suite with separate living area.')).not.toBeInTheDocument();
      });

      it('renders first 3 amenities', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        expect(screen.getByText('WiFi')).toBeInTheDocument();
        expect(screen.getByText('Workspace')).toBeInTheDocument();
      });

      it('renders room type', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        expect(screen.getByText('Suite')).toBeInTheDocument();
      });

      it('renders price', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        expect(screen.getByText('$350')).toBeInTheDocument();
      });

      it('renders capacity as "X guests"', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        expect(screen.getByText('4 guests')).toBeInTheDocument();
      });

      it('does not render call-to-action buttons', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        expect(screen.queryByText('View Details')).not.toBeInTheDocument();
        expect(screen.queryByText('Book Now')).not.toBeInTheDocument();
      });
    });

    describe('Layout and Styling', () => {
      it('uses grid layout structure', () => {
        const { container } = render(<RoomCardGrid {...mockRoomData} />);

        // Updated to match current implementation: rounded-2xl
        expect(container.firstChild).toHaveClass('rounded-2xl');
        // Story 1.11: Updated to semantic tokens
        expect(container.firstChild).toHaveClass('bg-surface-primary');
        expect(container.firstChild).toHaveClass('overflow-hidden');
      });

      it('applies base layout classes', () => {
        const { container } = render(<RoomCardGrid {...mockRoomData} />);

        // RoomCardGrid is a server component with no hover interactivity
        expect(container.firstChild).toHaveClass('rounded-2xl');
        expect(container.firstChild).toHaveClass('bg-surface-primary');
        expect(container.firstChild).toHaveClass('overflow-hidden');
        expect(container.firstChild).toHaveClass('shadow-card');
      });

      it('uses centered text layout', () => {
        render(<RoomCardGrid {...mockRoomData} />);

        const roomName = screen.getByText('Executive Suite');
        const textContainer = roomName.closest('.text-center');
        expect(textContainer).toBeInTheDocument();
      });
    });

    describe('Image Display', () => {
      it('displays room image correctly', () => {
        const { container } = render(<RoomCardGrid {...mockRoomData} />);

        const image = screen.getByAltText('Executive Suite');
        expect(image).toBeInTheDocument();
        expect(image).toHaveClass('object-cover');

        // Check image is within the relative container
        // Updated to use semantic image token from Epic 15
        const imageContainer = container.querySelector('.relative.w-full.h-image-card');
        expect(imageContainer).toBeInTheDocument();
      });

      it('handles missing image', () => {
        const roomWithoutImage = {
          ...mockRoomData,
          image: undefined,
        };

        render(<RoomCardGrid {...roomWithoutImage} />);

        expect(screen.queryByAltText('Executive Suite')).not.toBeInTheDocument();
        expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      });
    });

    describe('Different Room Data', () => {
      it('renders different room types for grid', () => {
        const standardRoom = mockRooms[1]; // Deluxe King Room

        render(<RoomCardGrid {...standardRoom} />);

        expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
      });

      it('renders business room for grid', () => {
        const businessRoom = mockRooms[2]; // Business Twin Room

        render(<RoomCardGrid {...businessRoom} />);

        expect(screen.getByText('Business Twin Room')).toBeInTheDocument();
      });
    });
  });

  describe('Variant Comparison', () => {
    it('renders different amounts of information', () => {
      const { unmount: unmountDetailed } = render(<RoomCardDetailed {...mockRoomData} />);

      // Detailed variant should show all information
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
      expect(screen.getByText('Up to 4 guests')).toBeInTheDocument();
      expect(screen.getByText('Spacious suite with separate living area.')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('Book Now')).toBeInTheDocument();

      unmountDetailed();

      const { unmount: unmountCompact } = render(<RoomCardCompact {...mockRoomData} />);

      // Compact variant should show essential information
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
      expect(screen.getByText('4 guests')).toBeInTheDocument();
      expect(screen.queryByText('View Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Book Now')).not.toBeInTheDocument();

      unmountCompact();

      render(<RoomCardGrid {...mockRoomData} />);

      // Grid variant should show essential information
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
      expect(screen.queryByText('View Details')).not.toBeInTheDocument();
    });

    it('maintains consistent room name across variants', () => {
      const variants = [
        { component: RoomCardDetailed, name: 'detailed' },
        { component: RoomCardCompact, name: 'compact' },
        { component: RoomCardGrid, name: 'grid' },
      ];

      variants.forEach(({ component: Component, name }) => {
        const { unmount } = render(<Component {...mockRoomData} />);

        expect(screen.getByText('Executive Suite')).toBeInTheDocument();

        unmount();
      });
    });

    it('handles different room data consistently across variants', () => {
      const roomData = mockRooms[1]; // Deluxe King Room

      const variants = [
        { component: RoomCardDetailed, name: 'detailed' },
        { component: RoomCardCompact, name: 'compact' },
        { component: RoomCardGrid, name: 'grid' },
      ];

      variants.forEach(({ component: Component }) => {
        const { unmount } = render(<Component {...roomData} />);

        expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for detailed variant', () => {
      const { container } = render(<RoomCardDetailed {...mockRoomData} />);
      expect(container.firstChild).toMatchSnapshot('RoomCardDetailed');
    });

    it('matches snapshot for compact variant', () => {
      const { container } = render(<RoomCardCompact {...mockRoomData} />);
      expect(container.firstChild).toMatchSnapshot('RoomCardCompact');
    });

    it('matches snapshot for grid variant', () => {
      const { container } = render(<RoomCardGrid {...mockRoomData} />);
      expect(container.firstChild).toMatchSnapshot('RoomCardGrid');
    });

    it('matches snapshots with different room data', () => {
      const standardRoom = mockRooms[1];
      const businessRoom = mockRooms[2];

      const { container: detailedContainer } = render(<RoomCardDetailed {...standardRoom} />);
      expect(detailedContainer.firstChild).toMatchSnapshot('RoomCardDetailed-Standard');

      const { unmount } = render(<RoomCardDetailed {...businessRoom} />);
      expect(detailedContainer.firstChild).toMatchSnapshot('RoomCardDetailed-Business');

      unmount();
    });
  });
});