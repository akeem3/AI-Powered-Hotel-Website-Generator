'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ContactFormContract, ContactFormPropsSchema } from '@/lib/contracts/contact.contract';
import type { ContactFormData, ContactFormProps } from '@/lib/contracts/contact.contract';
import { validateInDev } from '@/lib/contracts/validate.dev';
import { mockSubmitContactForm } from '@/lib/api/mockApi';
import { contactFormVariants } from '@/lib/cva-variants';
import { cn } from '@/lib/utils/utils';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export default function ContactForm(rawProps: ContactFormProps) {
  const props = validateInDev(ContactFormPropsSchema, rawProps, 'ContactForm');
  const { variant, className, onSuccess } = props;

  // AC4.1: Extract variant properties with defaults
  const { style = 'default', background = 'none' } = variant || {};

  const form = useForm<ContactFormData>({
    resolver: zodResolver(ContactFormContract),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: 'General',
      message: '',
    },
    mode: 'onChange',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const topRef = useRef<HTMLHeadingElement | null>(null);
  const feedbackRef = useRef<HTMLParagraphElement | null>(null);

  // ----------------------------
  // Submission handler
  // ----------------------------
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setStatus('idle');
    setMessage('');

    const validated = validateInDev(ContactFormContract, data, 'ContactForm');
    console.log('Validated data:', validated);

    try {
      const result = await mockSubmitContactForm(validated);

      if (result.success) {
        setStatus('success');
        setMessage(result.message ?? 'Thank you! Your message has been sent.');
        form.reset();
        feedbackRef.current?.focus();
        onSuccess?.();
      } else {
        setStatus('error');
        setMessage(result.error ?? 'Something went wrong. Please try again.');
        feedbackRef.current?.focus();
      }
    } catch {
      setStatus('error');
      setMessage('Unexpected error occurred. Please try again.');
      feedbackRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <section
      aria-labelledby="contact-form-title"
      data-mode={style}
      className={cn(contactFormVariants({ style, background }), className)}
    >
      <div className="w-full max-w-3xl bg-surface-primary rounded-2xl shadow-card border border-border-default p-container">
        <h2
          id="contact-form-title"
          ref={topRef}
          className="text-size-h2 font-semibold text-brand-primary text-center mb-gap-section"
        >
          Get in Touch
        </h2>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-gap-card"
            aria-describedby="contact-feedback"
            noValidate
          >
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel htmlFor="name" className="text-text-secondary font-medium">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      aria-invalid={!!form.formState.errors.name}
                      aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
                      className="border-border-default focus-ring"
                      required
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="name-error" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel htmlFor="email" className="text-text-secondary font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      aria-invalid={!!form.formState.errors.email}
                      aria-describedby={form.formState.errors.email ? 'email-error' : undefined}
                      className="border-border-default focus-ring"
                      required
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="email-error" />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel htmlFor="phone" className="text-text-secondary font-medium">
                    Phone (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+234 801 234 5678"
                      aria-invalid={!!form.formState.errors.phone}
                      aria-describedby={form.formState.errors.phone ? 'phone-error' : undefined}
                      className="border-border-default focus-ring"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="phone-error" />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel htmlFor="subject" className="text-text-secondary font-medium">
                    Subject
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger
                        id="subject"
                        aria-invalid={!!form.formState.errors.subject}
                        aria-describedby={
                          form.formState.errors.subject ? 'subject-error' : undefined
                        }
                        className="border-border-default focus-ring"
                        aria-required="true"
                      >
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-surface-primary">
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Booking">Booking</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage id="subject-error" />
                </FormItem>
              )}
            />

            {/* Message */}
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel htmlFor="message" className="text-text-secondary font-medium">
                    Message
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="message"
                      placeholder="Write your message..."
                      aria-invalid={!!form.formState.errors.message}
                      aria-describedby={form.formState.errors.message ? 'message-error' : undefined}
                      className="min-h-32 border-border-default focus-ring"

                      required
                      aria-required="true"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="message-error" />
                </FormItem>
              )}
            />

            {/* Submit + Feedback */}
            <div className="col-span-1 md:col-span-2 flex flex-col items-center pt-gap-card">
              <Button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                variant="default"
                className="w-full sm:w-auto px-gap-section py-gap-card text-size-body"
              >
                {isSubmitting && <Spinner size="sm" className="mr-2" />}
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </Button>

              {status !== 'idle' && (
                <p
                  ref={feedbackRef}
                  id="contact-feedback"
                  tabIndex={-1}
                  role="status"
                  aria-live="polite"
                  className={cn(
                    'mt-gap-card font-medium text-center',
                    status === 'success' ? 'text-status-success' : 'text-status-error-strong'
                  )}
                >
                  {message}
                </p>
              )}
            </div>
          </form>
        </Form>
      </div>
    </section>
  );
}
