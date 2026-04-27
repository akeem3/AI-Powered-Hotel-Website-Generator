'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { BookingWidgetVariantProps, BookingData } from '@/types/booking';
import { BookingDataContract } from '@/lib/contracts/booking.contract';
import { checkRoomAvailability } from '@/lib/api/booking';

export default function BookingWidgetMobile({
  onSubmit,
  defaultValues,
}: BookingWidgetVariantProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(defaultValues?.checkIn);
  const [checkOut, setCheckOut] = useState<Date | undefined>(defaultValues?.checkOut);
  const [adults, setAdults] = useState<number>(defaultValues?.adults || 1);
  const [children, setChildren] = useState<number>(defaultValues?.children || 0);
  const [rooms, setRooms] = useState<number>(defaultValues?.rooms || 1);
  const [roomType, setRoomType] = useState<string>('Standard');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    // ✅ Ensure both dates are selected
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
    };

    // ✅ Validate with Zod schema
    const validation = BookingDataContract.safeParse(booking);
    if (!validation.success) {
      console.error('[Booking Validation Error]', validation.error.issues);
      setStatus('⚠️ Please fill all required fields correctly.');
      return;
    }

    try {
      // ✅ Mock API check for availability
      const result = await checkRoomAvailability(validation.data);

      if (result.available) {
        setStatus('✅ Room is available!');
        console.log('✅ Room is available:', result);
        onSubmit?.(validation.data);
      } else {
        setStatus('❌ Room not available for selected dates.');
        console.warn('❌ Room not available:', result.message);
      }
    } catch (error) {
      console.error('Availability check failed:', error);
      setStatus('❌ Could not check availability. Try again later.');
    }
  };

  return (
    // Container uses semantic tokens that respond to data-mode attribute set by parent
    // Note: Padding p-4 is duplicated from CVA variant to maintain spacing when variant changes
    <div className="p-container bg-surface-primary rounded-2xl">

      <Accordion type="single" collapsible className="w-full">
        {/* --- 1. Dates Section --- */}
        <AccordionItem value="dates">
          <AccordionTrigger>Select Dates</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-gap-card py-2">
              <div className="flex items-center gap-gap-card">
                <Label id="mobile-check-in-label" htmlFor="mobile-check-in">
                  Check-in
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="mobile-check-in"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      aria-labelledby="mobile-check-in-label"
                      aria-required="true"
                    >
                      <CalendarIcon className="mr-gap-card size-4" />
                      {checkIn ? format(checkIn, 'PPP') : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-surface-primary border-border-default">
                    <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-gap-card">
                <Label id="mobile-check-out-label" htmlFor="mobile-check-out">
                  Check-out
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="mobile-check-out"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      aria-labelledby="mobile-check-out-label"
                      aria-required="true"
                    >
                      <CalendarIcon className="mr-gap-card size-4" />
                      {checkOut ? format(checkOut, 'PPP') : <span>Pick date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 bg-surface-primary border-border-default">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* --- 2. Guests & Rooms --- */}
        <AccordionItem value="guests">
          <AccordionTrigger>Guests & Rooms</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-gap-card py-2">
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
          </AccordionContent>
        </AccordionItem>

        {/* --- 3. Room Type --- */}
        <AccordionItem value="roomType">
          <AccordionTrigger>Room Type</AccordionTrigger>
          <AccordionContent>
            <Select value={roomType} onValueChange={setRoomType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a room type" />
              </SelectTrigger>
              <SelectContent className="bg-surface-primary border-border-default">
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Deluxe">Deluxe</SelectItem>
                <SelectItem value="Executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* --- 4. Submit --- */}
      <Button className="w-full mt-gap-card" onClick={handleSubmit}>
        Book Now
      </Button>

      {/* --- Status --- */}
      {status && <p className="mt-gap-card text-size-caption text-center text-text-muted">{status}</p>}
    </div>
  );
}
