'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main
      role="main"
      className="flex flex-col items-center justify-center min-h-screen bg-surface-primary text-text-primary p-container text-center"
    >
      <h1 className="text-5xl mb-gap-card">404 - Page Not Found</h1>
      <p className="mb-gap-card text-lg max-w-md">
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </p>

      <Link href="/" aria-label="Return Home">
        <Button>Return Home</Button>
      </Link>
    </main>
  );
}
