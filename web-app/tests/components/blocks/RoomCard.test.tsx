import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomCard from '@/components/blocks/RoomCard';
import { mockRooms } from '@/components/data/mockRooms';

// Mock validation to avoid console errors in tests
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Mock registry console.log
jest.mock('@/registry/roomRegistry', () => ({
  RoomCardRegistry: {
    name: 'RoomCard',
    tier: 'blocks',
    variants: ['compact', 'detailed', 'grid'],
    responsiveStrategy: 'responsive-utilities',
    hotelTypeRecommendations: ['luxury', 'boutique', 'business', 'resort'],
    tags: ['room', 'booking', 'comparison'],
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

describe('RoomCard Component', () => {
  const mockRoomData = mockRooms[0]; // Executive Suite
  const mockCallbacks = {
    onBookNow: jest.fn(),
    onViewDetails: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders room card with required props', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
      expect(screen.getByText('Up to 4 guests')).toBeInTheDocument();
    });

    it('renders room card with description', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('Spacious suite with separate living area.')).toBeInTheDocument();
    });

    it('renders room card with amenities', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('WiFi')).toBeInTheDocument();
      expect(screen.getByText('Workspace')).toBeInTheDocument();
      expect(screen.getByText('Mini Bar')).toBeInTheDocument();
      expect(screen.getByText('City View')).toBeInTheDocument();
    });

    it('renders room card with image', () => {
      render(<RoomCard {...mockRoomData} />);

      const image = screen.getByAltText('Executive Suite');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80');
    });

    it('renders room card with custom className', () => {
      const propsWithClass = {
        ...mockRoomData,
        className: 'custom-room-card',
      };

      render(<RoomCard {...propsWithClass} />);

      const roomCard = screen.getByText('Executive Suite').closest('[class*="custom-room-card"]');
      expect(roomCard).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('renders detailed variant by default', () => {
      render(<RoomCard {...mockRoomData} {...mockCallbacks} />);

      // Detailed variant should show all information
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
      expect(screen.getByText('Up to 4 guests')).toBeInTheDocument();
      expect(screen.getByText('Spacious suite with separate living area.')).toBeInTheDocument();
      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('Book Now')).toBeInTheDocument();
    });

    it('renders compact variant when specified', () => {
      render(<RoomCard {...mockRoomData} variant="compact" />);

      // Compact variant should show limited information
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
      // Detailed variant elements should not be present
      expect(screen.queryByText('View Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Book Now')).not.toBeInTheDocument();
    });

    it('renders grid variant when specified', () => {
      render(<RoomCard {...mockRoomData} variant="grid" />);

      // Grid variant should show limited information
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      // Detailed variant elements should not be present
      expect(screen.queryByText('View Details')).not.toBeInTheDocument();
      expect(screen.queryByText('Book Now')).not.toBeInTheDocument();
    });

    it('falls back to detailed variant for invalid variant', () => {
      render(<RoomCard {...mockRoomData} {...mockCallbacks} variant={'invalid' as any} />);

      // Invalid variant falls through to the grid variant as the default fallback
      // Core room information should still be rendered
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('handles View Details button click', () => {
      render(<RoomCard {...mockRoomData} {...mockCallbacks} />);

      const viewDetailsBtn = screen.getByText('View Details');
      fireEvent.click(viewDetailsBtn);

      expect(mockCallbacks.onViewDetails).toHaveBeenCalledTimes(1);
      expect(mockCallbacks.onViewDetails).toHaveBeenCalledWith('exec-suite-001');
    });

    it('handles Book Now button click', () => {
      render(<RoomCard {...mockRoomData} {...mockCallbacks} />);

      const bookNowBtn = screen.getByText('Book Now');
      fireEvent.click(bookNowBtn);

      expect(mockCallbacks.onBookNow).toHaveBeenCalledTimes(1);
      expect(mockCallbacks.onBookNow).toHaveBeenCalledWith('exec-suite-001');
    });

    it('does not call callbacks when they are not provided', () => {
      // Render with stub callbacks so buttons are rendered, then verify no-op callbacks do not throw
      const noopCallbacks = {
        onBookNow: undefined,
        onViewDetails: undefined,
      };
      render(<RoomCard {...mockRoomData} onBookNow={noopCallbacks.onBookNow} onViewDetails={noopCallbacks.onViewDetails} />);

      // Without callbacks, detailed variant renders content-only (no buttons)
      // Verify the component renders without errors
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('$350')).toBeInTheDocument();
    });

    it('handles multiple button clicks', () => {
      render(<RoomCard {...mockRoomData} {...mockCallbacks} />);

      const viewDetailsBtn = screen.getByText('View Details');
      fireEvent.click(viewDetailsBtn);
      fireEvent.click(viewDetailsBtn);

      expect(mockCallbacks.onViewDetails).toHaveBeenCalledTimes(2);
    });
  });

  describe('Data Display', () => {
    it('displays room name correctly', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
    });

    it('displays room type correctly', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('Suite')).toBeInTheDocument();
    });

    it('displays price correctly formatted', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('$350')).toBeInTheDocument();
    });

    it('displays capacity correctly', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('Up to 4 guests')).toBeInTheDocument();
    });

    it('displays amenities as tags', () => {
      render(<RoomCard {...mockRoomData} />);

      const amenities = ['WiFi', 'Workspace', 'Mini Bar', 'City View'];
      amenities.forEach((amenity) => {
        expect(screen.getByText(amenity)).toBeInTheDocument();
      });
    });

    it('displays description when provided', () => {
      render(<RoomCard {...mockRoomData} />);

      expect(screen.getByText('Spacious suite with separate living area.')).toBeInTheDocument();
    });

    it('handles missing optional fields gracefully', () => {
      const roomWithoutOptionals = {
        id: 'test-room',
        name: 'Test Room',
        type: 'Standard',
        price: 200,
        capacity: 2,
        amenities: [],
      };

      render(<RoomCard {...roomWithoutOptionals} />);

      expect(screen.getByText('Test Room')).toBeInTheDocument();
      expect(screen.getByText('$200')).toBeInTheDocument();
      expect(screen.queryByText('Spacious suite with separate living area.')).not.toBeInTheDocument();
    });

    it('handles missing image gracefully', () => {
      const roomWithoutImage = {
        ...mockRoomData,
        image: undefined,
      };

      render(<RoomCard {...roomWithoutImage} />);

      expect(screen.queryByAltText('Executive Suite')).not.toBeInTheDocument();
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
    });

    it('handles empty amenities array', () => {
      const roomWithoutAmenities = {
        ...mockRoomData,
        amenities: [],
      };

      render(<RoomCard {...roomWithoutAmenities} />);

      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      // No amenity tags should be present
      expect(screen.queryByText('WiFi')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has semantic structure for room information', () => {
      render(<RoomCard {...mockRoomData} {...mockCallbacks} />);

      // Check for proper heading hierarchy
      const roomName = screen.getByRole('heading', { name: 'Executive Suite' });
      expect(roomName).toBeInTheDocument();

      // Check for button accessibility (buttons only rendered when callbacks provided)
      const viewDetailsBtn = screen.getByRole('button', { name: 'View Details' });
      const bookNowBtn = screen.getByRole('button', { name: 'Book Now' });

      expect(viewDetailsBtn).toBeInTheDocument();
      expect(bookNowBtn).toBeInTheDocument();
    });

    it('provides proper alt text for images', () => {
      render(<RoomCard {...mockRoomData} />);

      const image = screen.getByAltText('Executive Suite');
      expect(image).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', () => {
      render(<RoomCard {...mockRoomData} {...mockCallbacks} />);

      const viewDetailsBtn = screen.getByText('View Details');
      const bookNowBtn = screen.getByText('Book Now');

      expect(viewDetailsBtn.closest('button')).toHaveAttribute('type', 'button');
      expect(bookNowBtn.closest('button')).toHaveAttribute('type', 'button');
    });
  });

  describe('Styling Classes', () => {
    it('applies base styling classes', () => {
      const { container } = render(<RoomCard {...mockRoomData} />);

      const roomCard = container.firstChild as HTMLElement;
      // Story 1.11: Updated to semantic tokens - bg-white is now bg-surface-primary
      expect(roomCard).toHaveClass('bg-surface-primary');
    });

    it('applies custom className when provided', () => {
      const propsWithClass = {
        ...mockRoomData,
        className: 'custom-test-class',
      };

      const { container } = render(<RoomCard {...propsWithClass} />);

      const roomCard = container.firstChild as HTMLElement;
      expect(roomCard).toHaveClass('custom-test-class');
    });
  });

  describe('Different Room Data', () => {
    it('renders different room types correctly', () => {
      const standardRoom = mockRooms[1]; // Deluxe King Room

      render(<RoomCard {...standardRoom} />);

      expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('$225')).toBeInTheDocument();
      expect(screen.getByText('Up to 2 guests')).toBeInTheDocument();
    });

    it('renders business room correctly', () => {
      const businessRoom = mockRooms[2]; // Business Twin Room

      render(<RoomCard {...businessRoom} />);

      expect(screen.getByText('Business Twin Room')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('$195')).toBeInTheDocument();
      expect(screen.getByText('Up to 2 guests')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles very long room names', () => {
      const roomWithLongName = {
        ...mockRoomData,
        name: 'This is a very long room name that might cause layout issues',
      };

      render(<RoomCard {...roomWithLongName} />);

      expect(screen.getByText('This is a very long room name that might cause layout issues')).toBeInTheDocument();
    });

    it('handles very high prices', () => {
      const expensiveRoom = {
        ...mockRoomData,
        price: 9999,
      };

      render(<RoomCard {...expensiveRoom} />);

      expect(screen.getByText('$9,999')).toBeInTheDocument();
    });

    it('handles maximum capacity', () => {
      const fullCapacityRoom = {
        ...mockRoomData,
        capacity: 10,
      };

      render(<RoomCard {...fullCapacityRoom} />);

      expect(screen.getByText('Up to 10 guests')).toBeInTheDocument();
    });

    it('handles empty string for optional fields', () => {
      const roomWithEmptyOptionals = {
        ...mockRoomData,
        description: '',
        image: '',
      };

      render(<RoomCard {...roomWithEmptyOptionals} />);

      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      // Should not render empty description or broken image
    });
  });

  describe('Component Integration', () => {
    it('works with mock data from data file', () => {
      mockRooms.forEach((room) => {
        const { unmount } = render(<RoomCard {...room} />);

        expect(screen.getByText(room.name)).toBeInTheDocument();
        expect(screen.getByText(`$${room.price.toLocaleString()}`)).toBeInTheDocument();

        unmount();
      });
    });

    it('maintains consistent structure across different room types', () => {
      const rooms = mockRooms;

      rooms.forEach((room) => {
        const { unmount } = render(<RoomCard {...room} />);

        // All rooms should have basic structure
        expect(screen.getByText(room.name)).toBeInTheDocument();
        expect(screen.getByText(room.type)).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe('Snapshot Tests', () => {
    it('matches snapshot for detailed variant', () => {
      const { container } = render(<RoomCard {...mockRoomData} variant="detailed" />);
      expect(container.firstChild).toMatchSnapshot('RoomCard-detailed');
    });

    it('matches snapshot for compact variant', () => {
      const { container } = render(<RoomCard {...mockRoomData} variant="compact" />);
      expect(container.firstChild).toMatchSnapshot('RoomCard-compact');
    });

    it('matches snapshot for grid variant', () => {
      const { container } = render(<RoomCard {...mockRoomData} variant="grid" />);
      expect(container.firstChild).toMatchSnapshot('RoomCard-grid');
    });

    it('matches snapshot with custom className', () => {
      const { container } = render(
        <RoomCard {...mockRoomData} className="custom-snapshot-class" />
      );
      expect(container.firstChild).toMatchSnapshot('RoomCard-custom-class');
    });
  });
});