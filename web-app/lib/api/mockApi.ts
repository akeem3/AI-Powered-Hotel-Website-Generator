// lib/mockApi.ts
import { BookingData } from '@/types/booking';
import { ContactFormData } from '@/lib/contracts/contact.contract';

type MockBookingResponse =
  | { success: true; bookingId: number }
  | { success: false; error: string };

type MockAvailabilityResponse = {
  available: boolean;
  message: string;
  roomsAvailable: number;
};

// --- existing function ---
export async function mockBookRoom(bookingData: BookingData): Promise<MockBookingResponse> {
  console.log('📦 Mock booking received:', bookingData);
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const isSuccess = Math.random() > 0.2;
  if (isSuccess) {
    return { success: true, bookingId: Math.floor(Math.random() * 10000) };
  } else {
    return { success: false, error: 'Room unavailable' };
  }
}

// --- new function ---
export async function mockCheckAvailability(bookingData: BookingData): Promise<MockAvailabilityResponse> {
  console.log('🔍 Checking mock availability for:', bookingData);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock logic (you can enhance later)
  const isAvailable = Math.random() > 0.3;

  if (isAvailable) {
    return {
      available: true,
      message: 'Room available for selected dates',
      roomsAvailable: Math.floor(Math.random() * 3) + 1,
    };
  } else {
    return {
      available: false,
      message: 'Room not available for those dates',
      roomsAvailable: 0,
    };
  }
}

// --- new function for contact form ---
export async function mockSubmitContactForm(
  data: ContactFormData
): Promise<{ success: boolean; message: string; error?: string }> {
  console.log('📬 Mock contact form received:', data);
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const isSuccess = Math.random() > 0.2;
  if (isSuccess) {
    return { success: true, message: 'Thank you! Your message has been sent successfully.' };
  } else {
    return { success: false, message: '', error: 'Something went wrong. Please try again.' };
  }
}
