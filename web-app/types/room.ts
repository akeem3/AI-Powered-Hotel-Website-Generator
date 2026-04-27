// web-app/types/room.ts

// types/room.ts

export interface RoomCardProps {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  amenities: string[];
  image?: string;
  description?: string;
  variant?: 'compact' | 'detailed' | 'grid';
  imageHeight?: 'default' | 'tall' | 'wide';
  onBookNow?: (roomId: string) => void;
  onViewDetails?: (roomId: string) => void;
  className?: string;
}

export interface RoomsHeaderProps {
  title?: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

export interface RoomsGridProps {
  rooms: RoomCardProps[];
  className?: string;
  variant?: 'compact' | 'detailed' | 'grid';
  onBookNow?: (roomId: string) => void;
}
