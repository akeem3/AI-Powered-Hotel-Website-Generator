import React from 'react';
import { cn } from '@/lib/utils/utils';

export default function ContactHeader() {
  return (
    <section className="text-center p-container space-y-gap-card" aria-label="Contact page header">

      <div className="space-y-gap-card/2">

        <h1 id="contact-page-title" className="text-size-display font-display text-brand-primary">
          Contact Us
        </h1>
        <div className="w-divider-lg h-divider-accent bg-brand-secondary mx-auto rounded-full" />
      </div>
      <p className="text-text-secondary max-w-2xl mx-auto text-size-body leading-relaxed">
        Get in touch with The Sterling Executive team — we're here to assist you with bookings,
        events, and inquiries.
      </p>
    </section>
  );
}
