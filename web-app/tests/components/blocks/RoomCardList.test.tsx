import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoomCardList from '@/components/blocks/RoomCard/RoomCardList';
import { mockRooms } from '@/components/data/mockRooms';
import { RoomCardProps } from '@/types/room';

// Mock RoomCard component to simplify testing
jest.mock('@/components/blocks/RoomCard/index', () => {
  return function MockRoomCard(props: RoomCardProps) {
    const { variant = 'detailed' } = props;
    return (
      <div data-testid={`room-card-${props.id}`}>
        <h3>{props.name}</h3>
        <p>{props.type}</p>
        <p>${props.price}</p>
        <p>Capacity: {props.capacity}</p>
        <p>Variant: {variant}</p>
      </div>
    );
  };
});

describe('RoomCardList Component (Story 1.4 AC3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AC3: Core Functionality', () => {
    it('accepts array of room data', () => {
      render(<RoomCardList rooms={mockRooms} />);

      // Should render all rooms from the array
      expect(screen.getByTestId('room-card-exec-suite-001')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-deluxe-king-002')).toBeInTheDocument();
      expect(screen.getByTestId('room-card-business-twin-003')).toBeInTheDocument();
    });

    it('implements responsive grid layout', () => {
      const { container } = render(<RoomCardList rooms={mockRooms} />);

      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-8');
    });

    it('supports configurable room card variant', () => {
      render(<RoomCardList rooms={mockRooms} />);

      // Should pass variant="detailed" to RoomCard components (default)
      expect(screen.getAllByText('Variant: detailed')).toHaveLength(3);
    });

    it('handles empty room array state gracefully', () => {
      // Should render the grid container without crashing
      const { container } = render(<RoomCardList rooms={[]} />);
      const gridContainer = container.firstChild;
      expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3', 'gap-8');
      // Empty state renders a "No rooms available" message inside the grid
      expect(screen.getByText('No rooms available at the moment.')).toBeInTheDocument();
    });

    it('handles single room in array', () => {
      const singleRoom = [mockRooms[0]];

      render(<RoomCardList rooms={singleRoom} />);

      expect(screen.getByTestId('room-card-exec-suite-001')).toBeInTheDocument();
      expect(screen.queryByTestId('room-card-deluxe-king-002')).not.toBeInTheDocument();
    });
  });

  describe('Component Integration (from Story 1.4 mock data)', () => {
    it('works with mock rooms from Story 1.4', () => {
      render(<RoomCardList rooms={mockRooms} />);

      // Should display all room types from mock data
      expect(screen.getByText('Executive Suite')).toBeInTheDocument();
      expect(screen.getByText('Deluxe King Room')).toBeInTheDocument();
      expect(screen.getByText('Business Twin Room')).toBeInTheDocument();

      // Should display pricing from Story 1.4 requirements
      expect(screen.getByText('$350')).toBeInTheDocument(); // Executive Suite
      expect(screen.getByText('$225')).toBeInTheDocument(); // Deluxe King
      expect(screen.getByText('$195')).toBeInTheDocument(); // Business Twin
    });
  });
});