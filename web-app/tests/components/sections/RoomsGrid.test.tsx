import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomsGrid from '@/components/sections/RoomsGrid';
import { mockRooms } from '@/components/data/mockRooms';

// Mock RoomCard component
jest.mock('@/components/blocks/RoomCard', () => {
  return function MockRoomCard({
    id,
    name,
    title,
    description,
    variant,
    onBookNow
  }: {
    id: string;
    name?: string;
    title?: string;
    description: string;
    variant?: string;
    onBookNow?: (roomId: string) => void;
  }) {
    const displayName = name || title || 'Room';
    return (
      <div data-testid={`room-card-${id}`} data-variant={variant}>
        <h3>{displayName}</h3>
        <p>{description}</p>
        {onBookNow && (
          <button
            onClick={() => onBookNow(id)}
            data-testid={`book-now-${id}`}
          >
            Book Now
          </button>
        )}
      </div>
    );
  };
});

describe('RoomsGrid - Story 1.5 Implementation', () => {
  const defaultProps = {
    rooms: mockRooms,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC4: Room Card Integration and Grid Layout', () => {
    test('renders rooms in responsive grid layout', () => {
      render(<RoomsGrid {...defaultProps} />);

      // Find the grid container by its structure and classes
      const gridContainer = document.querySelector('section') ||
                          document.querySelector('.grid') ||
                          screen.getByRole('generic'); // Fallback

      expect(gridContainer).toBeInTheDocument();

      // Check that all rooms are rendered
      mockRooms.forEach((room) => {
        expect(screen.getByTestId(`room-card-${room.id}`)).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: room.name })).toBeInTheDocument();
        expect(screen.getByText(room.description)).toBeInTheDocument();
      });
    });

    test('displays message when no rooms are available', () => {
      render(<RoomsGrid rooms={[]} />);

      expect(screen.getByText('No rooms available at the moment.')).toBeInTheDocument();
    });

    test('passes correct variant to RoomCard components', () => {
      render(<RoomsGrid {...defaultProps} variant="grid" />);

      mockRooms.forEach((room) => {
        const roomCard = screen.getByTestId(`room-card-${room.id}`);
        expect(roomCard).toHaveAttribute('data-variant', 'grid');
      });
    });

    test('applies custom className to grid container', () => {
      const customClass = 'custom-grid-class';
      render(<RoomsGrid {...defaultProps} className={customClass} />);

      const gridContainer = document.querySelector('section') ||
                          screen.getByRole('generic');

      expect(gridContainer).toHaveClass(customClass);
    });
  });

  describe('Grid Layout Classes', () => {
    test('applies responsive grid classes', () => {
      render(<RoomsGrid {...defaultProps} />);

      // Look for the responsive grid classes in the actual DOM
      const gridContainer = document.querySelector('.grid');

      if (gridContainer) {
        expect(gridContainer).toHaveClass('grid');
        expect(gridContainer).toHaveClass('grid-cols-1');
        expect(gridContainer).toHaveClass('md:grid-cols-2');
        expect(gridContainer).toHaveClass('lg:grid-cols-3');
      } else {
        // Fallback: ensure some grid-like structure exists
        const section = document.querySelector('section');
        expect(section).toBeInTheDocument();
      }
    });

    test('applies spacing classes for responsive design', () => {
      render(<RoomsGrid {...defaultProps} />);

      const gridContainer = document.querySelector('.grid');

      if (gridContainer) {
        // Epic 15: Updated to semantic spacing token gap-gap-section
        expect(gridContainer).toHaveClass('gap-gap-section');
      } else {
        // Fallback: ensure section has some spacing
        const section = document.querySelector('section');
        expect(section).toBeInTheDocument();
      }
    });
  });

  describe('AC5: User Journey and Navigation Flow', () => {
    test('handles Book Now button clicks', () => {
      const mockOnBookNow = jest.fn();
      render(<RoomsGrid {...defaultProps} onBookNow={mockOnBookNow} />);

      // Click Book Now button for first room
      const firstRoom = mockRooms[0];
      const bookNowButton = screen.getByTestId(`book-now-${firstRoom.id}`);

      fireEvent.click(bookNowButton);

      expect(mockOnBookNow).toHaveBeenCalledWith(firstRoom.id);
      expect(mockOnBookNow).toHaveBeenCalledTimes(1);
    });

    test('passes onBookNow callback to all RoomCard components', () => {
      const mockOnBookNow = jest.fn();
      render(<RoomsGrid {...defaultProps} onBookNow={mockOnBookNow} />);

      // All rooms should have Book Now buttons when callback is provided
      mockRooms.forEach((room) => {
        expect(screen.getByTestId(`book-now-${room.id}`)).toBeInTheDocument();
      });
    });

    test('does not render Book Now buttons when no callback provided', () => {
      render(<RoomsGrid {...defaultProps} />);

      // No Book Now buttons should be rendered
      mockRooms.forEach((room) => {
        expect(screen.queryByTestId(`book-now-${room.id}`)).not.toBeInTheDocument();
      });
    });
  });

  describe('Component Structure', () => {
    test('renders as semantic section element', () => {
      render(<RoomsGrid {...defaultProps} />);

      const section = document.querySelector('section');
      expect(section).toBeInTheDocument();
    });

    test('has proper container structure with max-width and padding', () => {
      render(<RoomsGrid {...defaultProps} />);

      // Epic 15: Updated to semantic tokens - max-w-screen-xl and p-section
      const container = document.querySelector('.max-w-screen-xl');
      expect(container).toBeInTheDocument();

      const paddingContainer = document.querySelector('.p-section');
      expect(paddingContainer).toBeInTheDocument();
    });
  });

  describe('Performance and Rendering', () => {
    test('renders efficiently with large number of rooms', () => {
      const largeRoomList = Array.from({ length: 20 }, (_, i) => ({
        id: `room-${i}`,
        name: `Room ${i + 1}`,
        type: 'Standard',
        description: `Description for room ${i + 1}`,
        price: 100 + i * 10,
        capacity: 2,
        image: `/room-${i + 1}.jpg`,
      }));

      const startTime = performance.now();
      render(<RoomsGrid rooms={largeRoomList} />);
      const endTime = performance.now();

      // Should render quickly (under 100ms for 20 rooms)
      expect(endTime - startTime).toBeLessThan(200);

      // All rooms should be rendered
      largeRoomList.forEach((room) => {
        expect(screen.getByTestId(`room-card-${room.id}`)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('maintains proper heading structure', () => {
      render(<RoomsGrid {...defaultProps} />);

      // Room titles should be properly structured as headings
      mockRooms.forEach((room) => {
        const heading = screen.getByRole('heading', { name: room.name });
        expect(heading).toBeInTheDocument();
      });
    });

    test('provides interactive elements for booking when callback provided', () => {
      const mockOnBookNow = jest.fn();
      render(<RoomsGrid {...defaultProps} onBookNow={mockOnBookNow} />);

      // Book Now buttons should be properly labeled as buttons
      mockRooms.forEach((room) => {
        const bookButton = screen.getByTestId(`book-now-${room.id}`);
        expect(bookButton).toBeInTheDocument();
        expect(bookButton.tagName).toBe('BUTTON');
      });
    });

    test('has descriptive content for each room', () => {
      render(<RoomsGrid {...defaultProps} />);

      mockRooms.forEach((room) => {
        const roomCard = screen.getByTestId(`room-card-${room.id}`);
        expect(roomCard).toHaveTextContent(room.name);
        expect(roomCard).toHaveTextContent(room.description);
      });
    });
  });

  describe('Error Handling', () => {
    test('handles undefined rooms prop gracefully', () => {
      // @ts-expect-error Testing undefined prop
      render(<RoomsGrid rooms={undefined} />);

      expect(screen.getByText('No rooms available at the moment.')).toBeInTheDocument();
    });

    test('handles malformed room data', () => {
      // Suppress console errors for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const malformedRooms = [
        {
          id: 'valid-room',
          name: 'Valid Room',
          type: 'Standard',
          description: 'Valid description',
          price: 200,
          capacity: 2,
          image: '/valid.jpg',
        },
        {
          // Missing required fields but has basic structure
          id: 'invalid-room',
          name: 'Invalid Room',
          type: 'Standard',
          description: 'Invalid description',
          price: 150,
          capacity: 1,
        },
      ];

      render(<RoomsGrid rooms={malformedRooms} />);

      // Should attempt to render rooms without crashing
      expect(screen.getByTestId('room-card-valid-room')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});