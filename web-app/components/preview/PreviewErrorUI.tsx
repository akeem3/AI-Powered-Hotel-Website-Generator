/**
 * Preview Error UI Component
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.01
 * @trace reqs: AC3, AC4
 *
 * Why: Provides user-friendly error messages when the preview page cannot load
 * a requested configuration. Displays helpful information including available
 * fixture names and suggestions for common typos.
 *
 * Security: Uses semantic design tokens per project coding standards.
 * All user-facing text is properly escaped through React.
 *
 * @example
 * ```tsx
 * <PreviewErrorUI
 *   errorType="no-config"
 *   availableFixtures={['luxury-boutique', 'budget-hostel']}
 *   userInput="invalid-name"
 * />
 * ```
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Error types for preview page
 */
export type PreviewErrorType =
  | 'no-config' // AC3: No config parameter provided
  | 'invalid-name' // AC4: Config name contains invalid characters
  | 'not-found' // AC4: Config file does not exist
  | 'load-failed' // File exists but failed to load/parse
  | 'validation-failed'; // Schema validation failed

/**
 * Props for PreviewErrorUI component
 */
export interface PreviewErrorUIProps {
  /** The type of error that occurred */
  errorType: PreviewErrorType;
  /** List of available fixture names for error display */
  availableFixtures?: string[];
  /** The user's original input (for showing what was rejected) */
  userInput?: string;
  /** Suggested fixture names (for typos) */
  suggestions?: string[];
}

/**
 * Error message configurations
 *
 * Maps each error type to its title, description, and whether to show suggestions.
 */
const ERROR_CONFIGS: Record<
  PreviewErrorType,
  { title: string; description: string; showSuggestions: boolean }
> = {
  'no-config': {
    title: 'Available Fixtures',
    description: 'Select a configuration to preview, or add ?config=name to the URL.',
    showSuggestions: false,
  },
  'invalid-name': {
    title: 'Invalid Configuration Name',
    description: 'Config names can only contain letters, numbers, hyphens, and underscores.',
    showSuggestions: true,
  },
  'not-found': {
    title: 'Configuration Not Found',
    description: 'The requested configuration does not exist.',
    showSuggestions: true,
  },
  'load-failed': {
    title: 'Failed to Load Configuration',
    description: 'There was an error reading the configuration file.',
    showSuggestions: false,
  },
  'validation-failed': {
    title: 'Invalid Configuration',
    description: 'The configuration file contains invalid data.',
    showSuggestions: false,
  },
};

/**
 * Preview Error UI Component
 *
 * Displays user-friendly error messages with helpful information when the
 * preview page encounters issues loading a configuration.
 *
 * Features:
 * - Semantic design tokens for consistent styling
 * - Available fixtures list (AC3, AC4)
 * - Suggestions for typos (AC4)
 * - Link to return home
 */
export function PreviewErrorUI({
  errorType,
  availableFixtures = [],
  userInput,
  suggestions = [],
}: PreviewErrorUIProps) {
  const config = ERROR_CONFIGS[errorType];

  return (
    <main
      role="main"
      className="flex flex-col items-center justify-center min-h-screen bg-surface-primary text-text-primary p-container text-center"
    >
      {/* Icon */}
      <div className="mb-gap-card">
        {errorType === 'no-config' ? (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 border-2 border-brand-primary">
            <svg
              className="w-8 h-8 text-brand-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-status-error/wash border-2 border-status-error">
            <svg
              className="w-8 h-8 text-status-error"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className={`text-size-display font-display mb-gap-card ${errorType === 'no-config' ? 'text-brand-primary' : 'text-status-error'}`}>
        {config.title}
      </h1>

      {/* Error Description */}
      <p className="text-size-body text-text-secondary mb-gap-section max-w-2xl">
        {config.description}
      </p>

      {/* User Input Display (if provided) */}
      {userInput && (
        <div className="mb-gap-section">
          <p className="text-sm text-text-secondary mb-gap-card">Your input:</p>
          <code className="px-gap-card py-2 bg-surface-elevated border border-border-default rounded font-mono text-sm">
            {userInput}
          </code>
        </div>
      )}

      {/* Suggestions (if available) */}
      {config.showSuggestions && suggestions.length > 0 && (
        <div className="mb-gap-section">
          <p className="text-sm text-text-secondary mb-gap-card">
            Did you mean:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion}
                href={`/preview?config=${suggestion}`}
                className="inline-flex"
              >
                <Button variant="outline" size="sm">
                  {suggestion}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Available Fixtures List (AC3, AC4) */}
      {availableFixtures.length > 0 && (
        <div className="mb-gap-section max-w-2xl w-full">
          <p className="text-sm text-text-secondary mb-gap-card">
            Available configurations:
          </p>
          <div className="bg-surface-elevated border border-border-default rounded p-gap-card">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              {availableFixtures.map((fixture) => (
                <li key={fixture}>
                  <Link
                    href={`/preview?config=${fixture}`}
                    className="text-brand-primary hover:text-brand-primary-hover hover:underline inline-flex items-center gap-1"
                  >
                    <span className="font-mono">{fixture}</span>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Return Home Button */}
      <Link href="/" aria-label="Return to home page">
        <Button>Return Home</Button>
      </Link>

      {/* Development Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-gap-section max-w-2xl">
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-text-secondary hover:text-text-primary">
              Developer Information
            </summary>
            <div className="mt-gap-card p-gap-card bg-surface-secondary rounded text-sm">
              <p className="mb-gap-card">
                <strong>Error Type:</strong> {errorType}
              </p>
              {userInput && (
                <p className="mb-gap-card">
                  <strong>User Input:</strong> {userInput}
                </p>
              )}
              <p className="mb-gap-card">
                <strong>Available Fixtures:</strong> {availableFixtures.length} found
              </p>
              {suggestions.length > 0 && (
                <p className="mb-gap-card">
                  <strong>Suggestions:</strong> {suggestions.join(', ')}
                </p>
              )}
              <p className="text-xs text-text-muted">
                This error page is shown in development mode. In production, only
                the error message would be displayed.
              </p>
            </div>
          </details>
        </div>
      )}
    </main>
  );
}

/**
 * Convenience component for "no config parameter" error (AC3)
 *
 * @example
 * ```tsx
 * <NoConfigErrorUI availableFixtures={['luxury-boutique', 'budget-hostel']} />
 * ```
 */
export function NoConfigErrorUI({
  availableFixtures = [],
}: Pick<PreviewErrorUIProps, 'availableFixtures'>) {
  return <PreviewErrorUI errorType="no-config" availableFixtures={availableFixtures} />;
}

/**
 * Convenience component for "invalid config name" error (AC4)
 *
 * @example
 * ```tsx
 * <InvalidNameErrorUI
 *   userInput={rawConfigName}
 *   availableFixtures={['luxury-boutique', 'budget-hostel']}
 *   suggestions={['luxury-boutique']}
 * />
 * ```
 */
export function InvalidNameErrorUI({
  userInput,
  availableFixtures = [],
  suggestions = [],
}: Pick<PreviewErrorUIProps, 'userInput' | 'availableFixtures' | 'suggestions'>) {
  return (
    <PreviewErrorUI
      errorType="invalid-name"
      userInput={userInput}
      availableFixtures={availableFixtures}
      suggestions={suggestions}
    />
  );
}

/**
 * Convenience component for "config not found" error (AC4)
 *
 * @example
 * ```tsx
 * <ConfigNotFoundErrorUI
 *   userInput={sanitizedName}
 *   availableFixtures={['luxury-boutique', 'budget-hostel']}
 *   suggestions={['luxury-boutique']}
 * />
 * ```
 */
export function ConfigNotFoundErrorUI({
  userInput,
  availableFixtures = [],
  suggestions = [],
}: Pick<PreviewErrorUIProps, 'userInput' | 'availableFixtures' | 'suggestions'>) {
  return (
    <PreviewErrorUI
      errorType="not-found"
      userInput={userInput}
      availableFixtures={availableFixtures}
      suggestions={suggestions}
    />
  );
}

export default PreviewErrorUI;
