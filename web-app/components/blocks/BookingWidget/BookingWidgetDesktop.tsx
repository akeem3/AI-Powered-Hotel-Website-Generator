'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { BookingWidgetVariantProps, BookingData } from '@/types/booking';
import { BookingDataContract } from '@/lib/contracts/booking.contract';
import { checkRoomAvailability } from '@/lib/api/booking'; // ⬅️ mock availability API

export default function BookingWidgetDesktop({
  onSubmit,
  defaultValues,
}: BookingWidgetVariantProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(defaultValues?.checkIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(defaultValues?.checkOut);
  const [adults, setAdults] = useState<number>(defaultValues?.adults || 1);
  const [children, setChildren] = useState<number>(defaultValues?.children || 0);
  const [rooms, setRooms] = useState<number>(defaultValues?.rooms || 1);
  const [roomType, setRoomType] = useState<string>('Standard');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!checkIn || !checkOut) {
      setStatus('⚠️ Please select both check-in and check-out dates.');
      return;
    }

    const booking: BookingData = {
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      roomType,
      specialRequests,
    };

    const validation = BookingDataContract.safeParse(booking);
    if (!validation.success) {
      console.error('[Booking Validation Error]', validation.error.issues);
      setStatus('⚠️ Please fill in all required fields correctly.');
      return;
    }

    try {
      const result = await checkRoomAvailability(validation.data);

      if (result.available) {
        setStatus('✅ Room is available for your selected dates!');
        console.log('✅ Room is available:', result);
        onSubmit?.(validation.data);
      } else {
        setStatus('❌ Room not available for those dates.');
        console.warn('❌ Room not available:', result.message);
      }
    } catch (error) {
      console.error('Availability check failed:', error);
      setStatus('❌ Could not check availability. Please try again.');
    }
  };

  return (
    // Container uses semantic tokens that respond to data-mode attribute set by parent
    // Note: Padding p-6 is duplicated from CVA variant to maintain spacing when variant changes
    <div className="p-container bg-surface-primary rounded-2xl shadow-md border border-border-default max-w-lg w-full mx-auto">
      <h3 className="text-size-h3 font-semibold mb-gap-card text-text-primary">Book Your Stay</h3>

      {/* --- Dates --- */}
      <div className="grid grid-cols-2 gap-gap-card mb-gap-card">
        {/* Check-in */}
        <div className="flex flex-col gap-gap-card">
          <Label id="desktop-check-in-label" htmlFor="desktop-check-in">
            Check-in
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="desktop-check-in"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                aria-labelledby="desktop-check-in-label"
                aria-required="true"
              >
                <CalendarIcon className="mr-gap-card size-4" />
                {checkIn ? format(checkIn, 'PPP') : <span>Pick date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-surface-primary border-border-default" align="start">
              <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Check-out */}
        <div className="flex flex-col gap-gap-card">
          <Label id="desktop-check-out-label" htmlFor="desktop-check-out">
            Check-out
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="desktop-check-out"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                aria-labelledby="desktop-check-out-label"
                aria-required="true"
              >
                <CalendarIcon className="mr-gap-card size-4" />
                {checkOut ? format(checkOut, 'PPP') : <span>Pick date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-surface-primary border-border-default" align="start">
              <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* --- Guests & Rooms --- */}
      <div className="grid grid-cols-3 gap-gap-card mb-gap-card">
        <div>
          <Label htmlFor="adults">Adults</Label>
          <Input
            id="adults"
            type="number"
            min={1}
            value={adults}
            onChange={(e) => setAdults(+e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="children">Children</Label>
          <Input
            id="children"
            type="number"
            min={0}
            value={children}
            onChange={(e) => setChildren(+e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rooms">Rooms</Label>
          <Input
            id="rooms"
            type="number"
            min={1}
            value={rooms}
            onChange={(e) => setRooms(+e.target.value)}
          />
        </div>
      </div>

      {/* --- Room Type --- */}
      <div className="mb-gap-card">
        <Label id="desktop-room-type-label" htmlFor="desktop-room-type">
          Room Type
        </Label>
        <Select value={roomType} onValueChange={setRoomType}>
          <SelectTrigger
            id="desktop-room-type"
            className="w-full"
            aria-labelledby="desktop-room-type-label"
          >
            <SelectValue placeholder="Select a room type" />
          </SelectTrigger>
          <SelectContent className="bg-surface-primary border-border-default">
            <SelectItem value="Standard">Standard</SelectItem>
            <SelectItem value="Deluxe">Deluxe</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* --- Special Requests --- */}
      <div className="mb-gap-card">
        <Label htmlFor="desktop-special-requests">Special Requests</Label>
        <Textarea
          id="desktop-special-requests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          placeholder="Any preferences or extra notes?"
          className="resize-none"
        />
      </div>

      {/* --- Submit --- */}
      <Button className="w-full" onClick={handleSubmit}>
        Book Now
      </Button>

      {/* --- Status Message --- */}
      {status && <p className="mt-gap-card text-size-caption text-center text-text-muted">{status}</p>}
    </div>
  );
}
