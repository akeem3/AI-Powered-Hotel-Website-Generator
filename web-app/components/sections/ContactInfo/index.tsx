/**
 * ContactInfo Server Component
 *
 * Displays hotel contact information including name, phone, email, address, hours, and emergency contact.
 * This is a Server Component that receives all data as props from the parent page component.
 *
 * Story 24.8: Refactored to accept props instead of using hardcoded constants.
 * Now uses CMS data (hotel.parsedAddress) passed from the Contact page.
 *
 * IMPORTANT: This is now a Server Component - removed 'use client' directive.
 * All data is passed as props from the parent Server Component.
 *
 * @module components/sections/ContactInfo
 */

import type { CmsAddress } from '@/lib/cms-api/types';

/**
 * Address shape for ContactInfo component
 * Combines CMS CmsAddress with postal_code field for flexibility
 */
export interface ContactInfoAddress {
  street?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

/**
 * Hours information for ContactInfo component
 */
export interface ContactInfoHours {
  reception: string;
  businessCenter: string;
  checkIn: string;
  checkOut: string;
}

/**
 * Emergency contact information (optional)
 */
export interface ContactInfoEmergency {
  contact: string;
}

/**
 * ContactInfo component props
 *
 * All contact data is passed as props from the parent Server Component.
 * The parent Contact page extracts this data from CMS (hotel.parsedAddress, etc.)
 */
export interface ContactInfoProps {
  /** Hotel name */
  name: string;
  /** Contact phone number */
  phone: string;
  /** Contact email address */
  email: string;
  /** Hotel address */
  address: ContactInfoAddress;
  /** Operating hours */
  hours: ContactInfoHours;
  /** Optional emergency contact */
  emergency?: ContactInfoEmergency;
}

/**
 * ContactInfo Server Component
 *
 * Renders hotel contact information with all data provided as props.
 * No client-side data fetching - data comes from parent Server Component.
 *
 * Data Flow:
 * 1. Parent Contact page (Server Component) fetches data via getHotelPageData()
 * 2. Parent extracts name, phone, email, address, hours from hotel data
 * 3. Parent passes ContactInfoProps to this component
 * 4. ContactInfo renders the information server-side
 *
 * @component
 * @example
 * ```tsx
 * // Server Component usage in Contact page
 * <ContactInfo
 *   name={hotel.name}
 *   phone={hotel.phone}
 *   email={hotel.email}
 *   address={hotel.parsedAddress}
 *   hours={{
 *     reception: '24/7',
 *     businessCenter: '24/7',
 *     checkIn: '3:00 PM',
 *     checkOut: '11:00 AM'
 *   }}
 *   emergency={{ contact: '+1 (555) 987-6543' }}
 * />
 * ```
 */
export default function ContactInfo({ name, phone, email, address, hours, emergency }: ContactInfoProps) {
  return (
    <section className="w-full max-w-3xl mx-auto p-section">
      <h2 className="text-size-h2 font-display font-bold text-center mb-gap-section text-brand-primary">Hotel Information</h2>

      <div className="bg-surface-primary shadow-card rounded-2xl p-container space-y-gap-card">

        {/* Hotel Name and Address */}
        <div className="text-center space-y-1">
          <h3 className="text-size-h3 font-display font-semibold text-brand-primary">{name}</h3>
          <p className="text-text-secondary">
            {address.street && `${address.street}, `}{address.city}
            {address.state && `, ${address.state}`}
            {address.postal_code && ` ${address.postal_code}`}
            {`, ${address.country}`}
          </p>
        </div>

        {/* Contact Details */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-gap-card text-text-secondary">
          <p>
            📞{' '}
            <a href={`tel:${phone}`} className="text-brand-secondary hover:underline">
              {phone}
            </a>
          </p>
          <p>
            ✉️{' '}
            <a href={`mailto:${email}`} className="text-brand-secondary hover:underline">
              {email}
            </a>
          </p>
          {emergency && (
            <p>
              🚨 Emergency:{' '}
              <a href={`tel:${emergency.contact}`} className="text-status-error hover:underline">
                {emergency.contact}
              </a>
            </p>
          )}
        </div>

        {/* Hours */}
        <div className="text-center text-text-secondary space-y-1">
          <p>
            🕒 <span className="font-medium">Reception:</span> {hours.reception}
          </p>
          <p>
            💼 <span className="font-medium">Business Center:</span> {hours.businessCenter}
          </p>
          <p>
            🛏️ <span className="font-medium">Check-in:</span> {hours.checkIn} |{' '}
            <span className="font-medium">Check-out:</span> {hours.checkOut}
          </p>
        </div>
      </div>
    </section>
  );
}
