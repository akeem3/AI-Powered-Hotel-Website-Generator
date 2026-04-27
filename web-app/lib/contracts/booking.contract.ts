// web-app/lib/contracts/booking.contract.ts
import { z } from 'zod';

// Booking data payload
export const BookingDataContract = z
  .object({
    checkIn: z.instanceof(Date, { message: 'checkIn must be a Date' }),
    checkOut: z.instanceof(Date, { message: 'checkOut must be a Date' }),
    adults: z.number().int().min(1).max(10),
    children: z.number().int().min(0).max(10),
    rooms: z.number().int().min(1).max(5),
    roomType: z.string().optional(),
    specialRequests: z.string().max(500).optional(),
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  });

export type BookingData = z.infer<typeof BookingDataContract>;

// BookingWidget props contract
const BookingWidgetDefaultValuesSchema = z
  .object({
    checkIn: z.instanceof(Date).optional(),
    checkOut: z.instanceof(Date).optional(),
    adults: z.number().int().min(1).max(10).optional(),
    children: z.number().int().min(0).max(10).optional(),
    rooms: z.number().int().min(1).max(5).optional(),
    roomType: z.string().optional(),
    specialRequests: z.string().max(500).optional(),
  })
  .refine(
    (value) => {
      if (!value.checkIn || !value.checkOut) {
        return true;
      }
      return value.checkOut > value.checkIn;
    },
    {
      message: 'Default check-out date must be after check-in date',
      path: ['checkOut'],
    }
  );

export const BookingWidgetContract = z.object({
  variant: z.enum(['mobile', 'desktop']).optional(),
  theme: z.enum(['light', 'dark', 'glass']).optional(),
  className: z.string().optional(),
  onSubmit: z.custom<(...args: unknown[]) => void>().optional(),
  onRoomChange: z.custom<(...args: unknown[]) => void>().optional(),
  onDateChange: z.custom<(...args: unknown[]) => void>().optional(),
  onGuestChange: z.custom<(...args: unknown[]) => void>().optional(),
  defaultValues: BookingWidgetDefaultValuesSchema.optional(),
});

export type BookingWidgetContractType = z.infer<typeof BookingWidgetContract>;
