import { RoomCardProps } from '@/types/room';

export const mockRooms: RoomCardProps[] = [
  {
    id: 'exec-suite-001',
    name: 'Executive Suite',
    type: 'Suite',
    price: 350,
    capacity: 4,
    amenities: ['WiFi', 'Workspace', 'Mini Bar', 'City View'],
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
    description: 'Spacious suite with separate living area.',
  },
  {
    id: 'deluxe-king-002',
    name: 'Deluxe King Room',
    type: 'Standard',
    price: 225,
    capacity: 2,
    amenities: ['WiFi', 'Workspace', 'Coffee Maker'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    description: 'Comfortable room with king-size bed.',
  },
  {
    id: 'business-twin-003',
    name: 'Business Twin Room',
    type: 'Standard',
    price: 195,
    capacity: 2,
    amenities: ['WiFi', 'Workspace', 'Desk'],
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    description: 'Perfect for business travelers.',
  },
];
