'use client';

import React from 'react';

interface ContractErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

interface ContractErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ContractErrorBoundary extends React.Component<
  ContractErrorBoundaryProps,
  ContractErrorBoundaryState
> {
  constructor(props: ContractErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      componentStack: '',
    };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Ensure componentStack becomes a guaranteed string
    const safeStack = info.componentStack ?? '';

    this.setState({
      componentStack: safeStack,
    });

    // Optionally log to monitoring in the future
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Contract validation error caught by boundary:', {
        error,
        componentStack: safeStack,
      });
    }
  }

  render() {
    const { hasError, error, componentStack } = this.state;

    if (hasError) {
      // If custom fallback is provided
      if (this.props.fallback) return this.props.fallback;

      // Default friendly fallback (dev-friendly)
      return (
        <div className="p-4 border border-status-error rounded bg-status-error/10 text-status-error">
          <h2 className="font-semibold mb-card">A component failed contract validation.</h2>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="text-sm whitespace-pre-wrap">
              {error?.message}
              {'\n'}
              {componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ContractErrorBoundary;
