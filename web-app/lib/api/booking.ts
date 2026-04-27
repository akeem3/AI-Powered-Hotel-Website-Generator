// lib/api/bookings.ts
import { BookingDataContract } from '@/lib/contracts/booking.contract';
import { mockCheckAvailability } from '@/lib/api/mockApi';

export async function checkRoomAvailability(formData: unknown) {
  const validation = BookingDataContract.safeParse(formData);

  if (!validation.success) {
    console.error('[Booking Validation Error]', validation.error.issues);
    throw new Error('Invalid booking data — please check inputs');
  }

  const payload = validation.data;

  // 🔄 Use mock API instead of real fetch
  const result = await mockCheckAvailability(payload);

  return result;
}
