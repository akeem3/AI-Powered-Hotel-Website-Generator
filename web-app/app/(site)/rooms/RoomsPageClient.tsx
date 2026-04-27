'use client';

import React, { useRef, useState } from 'react';
import RoomsGrid from '@/components/sections/RoomsGrid';
import ClientBookingWrapper from '@/lib/utils/ClientBookingWrapper';
import { RoomsHeaderProps, RoomCardProps } from '@/types/room';

/**
 * RoomsPageClient
 * ----------------
 * Client-side wrapper for the Rooms page:
 * - Manages selected room ID (when "Book Now" is clicked)
 * - Scrolls to booking widget smoothly
 * - Prefills the booking form with selected room
 */
export default function RoomsPageClient({
  header,
  rooms,
  showBookingWidget = true,
}: {
  header: RoomsHeaderProps;
  rooms: RoomCardProps[];
  showBookingWidget?: boolean;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const bookingRef = useRef<HTMLDivElement | null>(null);

  const handleBookNow = (roomId: string) => {
    setSelectedRoomId(roomId);
    // Smoothly scroll to booking section
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="min-h-screen bg-surface-primary text-text-primary pb-gap-section md:pb-0">
      {/* Page Header */}
      <div className="max-w-6xl mx-auto p-container py-gap-section text-center space-y-4">
        <h1 className="text-3xl md:text-5xl font-display text-brand-primary mb-gap-card">{header.title}</h1>
        <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto rounded-full" />
        {header.subtitle && <h2 className="text-xl font-medium text-brand-secondary mb-gap-card">{header.subtitle}</h2>}
        {header.description && (
          <p className="text-text-secondary max-w-3xl mx-auto text-lg leading-relaxed">{header.description}</p>
        )}
      </div>

      {/* Booking Widget */}
      {showBookingWidget && (
        <div ref={bookingRef} className="max-w-6xl mx-auto p-container py-gap-card">
          <ClientBookingWrapper className="mb-gap-section" defaultValues={{ roomId: selectedRoomId}} />
        </div>
      )}

      {/* Rooms Grid */}
      <RoomsGrid rooms={rooms} variant="grid" onBookNow={handleBookNow} />
    </main>
  );
}
