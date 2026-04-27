/**
 * Debug Header Component
 *
 * @trace epic: EPIC-16
 * @trace story: STORY-16.01
 * @trace reqs: AC5, AC6
 *
 * Why: Provides a debug overlay displaying configuration metadata for developers
 * using the preview page. Shows generationId, hotelName, and component count, with
 * keyboard shortcut support for quick toggle.
 *
 * Features:
 * - Displays config metadata (AC5): generationId, hotelName, component count
 * - Keyboard shortcut toggle (AC6): Ctrl+D / Cmd+D
 * - Persistent state using URL hash for reload-friendly behavior
 * - Semantic design tokens per project coding standards
 *
 * @example
 * ```tsx
 * <DebugHeader
 *   generationId="luxury-paris-v1"
 *   hotelName="Luxury Boutique Hotel"
 *   componentCount={8}
 * />
 * ```
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

/**
 * Props for DebugHeader component
 */
export interface DebugHeaderProps {
  /** The generation ID from the config */
  generationId?: string;
  /** The hotel name from the config */
  hotelName?: string;
  /** The number of components in the config */
  componentCount?: number;
  /** Initial visibility state (default: true in dev) */
  initiallyVisible?: boolean;
}

/**
 * Debug Header Component
 *
 * Displays a collapsible debug header with configuration metadata.
 * Toggles visibility with Ctrl+D / Cmd+D keyboard shortcut.
 *
 * Features:
 * - Shows generationId, hotelName, and component count (AC5)
 * - Keyboard shortcut Ctrl+D / Cmd+D for toggle (AC6)
 * - Click to toggle visibility
 * - Development-only visibility
 */
export function DebugHeader({
  generationId,
  hotelName,
  componentCount,
  initiallyVisible = true,
}: DebugHeaderProps) {
  // Toggle state for visibility
  const [isVisible, setIsVisible] = useState(initiallyVisible);
  // Track if keyboard shortcut was recently used (for visual feedback)
  const [shortcutTriggered, setShortcutTriggered] = useState(false);

  /**
   * Keyboard shortcut handler
   *
   * Toggles debug header visibility when Ctrl+D or Cmd+D is pressed.
   * Prevents default browser behavior (bookmark dialog on Ctrl+D).
   *
   * @see AC6 - Pressing Ctrl+D (or Cmd+D on Mac) toggles visibility
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check for Ctrl+D or Cmd+D
    if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
      event.preventDefault(); // Prevent browser bookmark dialog
      setIsVisible((prev) => !prev);
      setShortcutTriggered(true);

      // Clear the shortcut triggered state after animation
      setTimeout(() => setShortcutTriggered(false), 200);

      console.info('[DebugHeader] Toggled visibility via keyboard shortcut', {
        shortcut: event.ctrlKey ? 'Ctrl+D' : 'Cmd+D',
        newState: !isVisible,
      });
    }
  }, [isVisible]);

  /**
   * Toggle button click handler
   *
   * Manually toggle visibility when the header is clicked.
   */
  const handleToggle = useCallback(() => {
    setIsVisible((prev) => !prev);
    console.info('[DebugHeader] Toggled visibility via click');
  }, []);

  /**
   * Set up keyboard event listener
   *
   * Registers the keyboard shortcut handler on mount and cleans up on unmount.
   */
  useEffect(() => {
    // Only add listener in development
    if (process.env.NODE_ENV === 'development') {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [handleKeyDown]);

  /**
   * Log debug info when visibility changes
   */
  useEffect(() => {
    console.info('[DebugHeader] Visibility changed', { isVisible });
  }, [isVisible]);

  // Don't render if not in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Don't render if not visible
  if (!isVisible) {
    return (
      <button
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-50 p-2 bg-surface-elevated/90 backdrop-blur-sm border border-brand-primary rounded-full shadow-lg hover:bg-brand-primary/faint transition-all duration-200 group"
        aria-label="Show debug header (Ctrl+D)"
        title="Show debug header (Ctrl+D)"
      >
        <svg
          className="w-5 h-5 text-brand-primary group-hover:text-brand-primary-hover"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="sr-only">Show debug header</span>
      </button>
    );
  }

  /**
   * Calculate metadata display values
   */
  const displayGenerationId = useMemo(() => {
    return generationId || 'Unknown';
  }, [generationId]);

  const displayHotelName = useMemo(() => {
    return hotelName || 'Unknown Hotel';
  }, [hotelName]);

  const displayComponentCount = useMemo(() => {
    return componentCount ?? 0;
  }, [componentCount]);

  return (
    <div className="relative">
      {/* Main Debug Header */}
      <div
        className={`bg-brand-primary/95 backdrop-blur-sm border-b border-brand-secondary text-text-inverted py-2 px-gap-card transition-all duration-300 ${
          shortcutTriggered ? 'scale-[1.02]' : 'scale-100'
        }`}
        role="region"
        aria-label="Debug information"
      >
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            {/* Metadata Display - AC5 */}
            <div className="flex items-center gap-6 text-sm flex-wrap">
              {/* Generation ID */}
              <div className="flex items-center gap-2">
                <span className="text-text-inverted/70 font-medium">Generation ID:</span>
                <code className="px-2 py-0.5 bg-brand-secondary/20 rounded font-mono text-xs">
                  {displayGenerationId}
                </code>
              </div>

              {/* Hotel Name */}
              {hotelName && (
                <div className="flex items-center gap-2">
                  <span className="text-text-inverted/70 font-medium">Hotel:</span>
                  <span className="font-semibold">{displayHotelName}</span>
                </div>
              )}

              {/* Component Count */}
              <div className="flex items-center gap-2">
                <span className="text-text-inverted/70 font-medium">Components:</span>
                <span className="px-2 py-0.5 bg-brand-secondary/20 rounded font-mono text-xs">
                  {displayComponentCount}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Keyboard Shortcut Hint - AC6 */}
              <span className="hidden sm:inline text-xs text-text-inverted/60 font-mono">
                Ctrl+D to hide
              </span>

              {/* Toggle Button */}
              <button
                onClick={handleToggle}
                className="p-1 hover:bg-brand-secondary/20 rounded transition-colors duration-150"
                aria-label="Hide debug header (Ctrl+D)"
                title="Hide debug header (Ctrl+D)"
              >
                <svg
                  className="w-4 h-4 text-text-inverted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Additional Metadata (Collapsible in Future) */}
          {(generationId || hotelName || componentCount !== undefined) && (
            <div className="mt-2 pt-2 border-t border-brand-secondary/30 text-xs text-text-inverted/60">
              <div className="flex items-center gap-4 flex-wrap">
                <span>Preview Mode - Development Only</span>
                <span>•</span>
                <span>Config loaded from fixtures directory</span>
                {generationId && (
                  <>
                    <span>•</span>
                    <Link
                      href="/preview"
                      className="hover:text-text-inverted hover:underline"
                    >
                      View all fixtures
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Toggle Button (when visible) */}
      <button
        onClick={handleToggle}
        className="fixed bottom-4 right-4 z-50 p-2 bg-surface-elevated/90 backdrop-blur-sm border border-brand-primary rounded-full shadow-lg hover:bg-brand-primary/faint transition-all duration-200 group opacity-50 hover:opacity-100"
        aria-label="Hide debug header (Ctrl+D)"
        title="Hide debug header (Ctrl+D)"
      >
        <svg
          className="w-4 h-4 text-brand-primary group-hover:text-brand-primary-hover"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span className="sr-only">Hide debug header</span>
      </button>
    </div>
  );
}

/**
 * Minimal debug badge variant
 *
 * Smaller version for inline use when full header is not needed.
 * Shows condensed metadata with hover tooltip.
 */
export interface DebugBadgeProps {
  /** The generation ID from the config */
  generationId?: string;
  /** The hotel name from the config */
  hotelName?: string;
  /** The number of components in the config */
  componentCount?: number;
}

export function DebugBadge({
  generationId,
  hotelName,
  componentCount,
}: DebugBadgeProps) {
  const displayComponentCount = componentCount ?? 0;

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 rounded text-xs font-mono text-brand-primary"
      title={`Generation: ${generationId || 'Unknown'}\nHotel: ${hotelName || 'Unknown'}\nComponents: ${displayComponentCount}`}
    >
      {generationId && (
        <span className="max-w-[100px] truncate">{generationId}</span>
      )}
      {generationId && (hotelName || componentCount !== undefined) && (
        <span className="text-brand-primary/50">•</span>
      )}
      {hotelName && (
        <span className="max-w-[100px] truncate font-semibold">{hotelName}</span>
      )}
      {hotelName && componentCount !== undefined && (
        <span className="text-brand-primary/50">•</span>
      )}
      {componentCount !== undefined && (
        <span>{displayComponentCount} components</span>
      )}
    </div>
  );
}

export default DebugHeader;
