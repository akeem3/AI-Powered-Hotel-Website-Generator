import { render, screen } from '../utils/test-utils';
import { createMockRoom, createMockBookingData } from '../factories/mockData';

// Simple test to verify our test utilities work
describe('Test Infrastructure Verification', () => {
  it('should render a simple component with our custom render', () => {
    const TestComponent = () => <div data-testid="test">Test Component</div>;
    render(<TestComponent />);
    expect(screen.getByTestId('test')).toBeInTheDocument();
  });

  it('should create mock room data', () => {
    const room = createMockRoom();
    expect(room.id).toBe('test-room-001');
    expect(room.name).toBe('Test Executive Suite');
    expect(room.price).toBe(350);
  });

  it('should create mock booking data', () => {
    const booking = createMockBookingData();
    expect(booking.adults).toBe(2);
    expect(booking.rooms).toBe(1);
    expect(booking.checkIn).toBeInstanceOf(Date);
  });

  it('should accept overrides in mock data', () => {
    const room = createMockRoom({ name: 'Custom Room', price: 500 });
    expect(room.name).toBe('Custom Room');
    expect(room.price).toBe(500);
    expect(room.id).toBe('test-room-001'); // Should keep default
  });
});