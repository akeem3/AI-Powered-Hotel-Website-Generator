// types/booking.ts
// Shared TypeScript interfaces for the booking system

export interface BookingData {
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  rooms: number;
  roomType?: string;
  specialRequests?: string;
  // 👇 New optional field to track which room was selected
  roomId?: string;
}

export interface BookingWidgetProps {
  variant?: 'mobile' | 'desktop';
  theme?: 'light' | 'dark' | 'glass';
  onSubmit?: (bookingData: BookingData) => void;
  className?: string;
  defaultValues?: {
    checkIn?: Date;
    checkOut?: Date;
    adults?: number;
    children?: number;
    rooms?: number;
    // 👇 Add roomId support here too (for default prefill)
    roomId?: string;
    roomType?: string;
  };
}

export type BookingWidgetVariantProps = Pick<BookingWidgetProps, 'onSubmit' | 'defaultValues'>;
