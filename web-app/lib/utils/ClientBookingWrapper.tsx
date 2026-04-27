// lib/utils/ClientBookingWrapper.tsx
'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import BookingWidget from '@/components/blocks/BookingWidget';
import type { BookingData, BookingWidgetProps } from '@/types/booking';
import { mockBookRoom } from '@/lib/api/mockApi';

interface BookingContextType {
  prefillBookingWidget: (roomType: string) => void;
}

const BookingContext = createContext<BookingContextType | null>(null);

export function useBookingPrefill() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookingPrefill must be used within ClientBookingWrapper');
  return ctx;
}

export default function ClientBookingWrapper({
  className,
  defaultValues,
  children,
}: {
  className?: string;
  defaultValues?: BookingWidgetProps['defaultValues']; // supports partial booking data
  children?: React.ReactNode;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prefilledRoomType, setPrefilledRoomType] = useState(defaultValues?.roomType);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  const prefillBookingWidget = (roomType: string) => {
    setPrefilledRoomType(roomType);
    widgetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleBookingSubmit = async (bookingData: BookingData) => {
    try {
      setIsSubmitting(true);
      await mockBookRoom(bookingData);
      console.log('Booking successful:', bookingData);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BookingContext.Provider value={{ prefillBookingWidget }}>
      {children}
      <div ref={widgetRef} className="relative">
        <BookingWidget
          className={className}
          defaultValues={{ ...defaultValues, roomType: prefilledRoomType }}
          onSubmit={handleBookingSubmit}
        />
        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-primary/60 text-text-primary">
            <span className="animate-pulse">Processing booking...</span>
          </div>
        )}
      </div>
    </BookingContext.Provider>
  );
}
