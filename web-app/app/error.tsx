'use client';

import { Button } from '@/components/ui/button';

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main
      role="main"
      className="flex flex-col items-center justify-center min-h-screen bg-surface-primary text-text-primary p-container text-center"
    >
      <h1 className="text-4xl mb-gap-card">Oops! Something went wrong</h1>
      <p className="text-status-error mb-gap-card max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>

      <Button onClick={() => reset()} aria-label="Try Again">
        Try Again
      </Button>
    </main>
  );
}
