/**
 * Content Loading Logger
 *
 * @trace epic: EPIC-13
 * @trace story: STORY-13.5.3
 *
 * Why: Provides structured logging for content system failures with different output
 * formats for development (human-readable) and production (JSON for log aggregation).
 * This enables monitoring content loading issues across 10,000+ hotel websites and
 * helps identify patterns in content delivery failures.
 *
 * Integrates with console (development) and can be extended for LangFuse (production).
 *
 * @example
 * ```tsx
 * import { logContentLoadError, createLoadTimer } from '@/lib/content/contentLogger';
 *
 * const timer = createLoadTimer();
 * try {
 *   const content = await fetchContent(url);
 *   logContentLoadSuccess({
 *     hotelId: 'hotel-123',
 *     component: 'HeroSection',
 *     url,
 *     duration: timer.getDuration(),
 *     cached: false,
 *   });
 * } catch (error) {
 *   logContentLoadError({
 *     type: 'network',
 *     message: error.message,
 *     url,
 *     hotelId: 'hotel-123',
 *     component: 'HeroSection',
 *     duration: timer.getDuration(),
 *   });
 * }
 * ```
 */

/**
 * Content loading error types.
 *
 * Categorizes failures for better monitoring and alerting.
 */
export type ContentLoadError = {
  /** Error category for filtering and alerting */
  type: 'network' | 'parse' | 'validation' | 'timeout' | 'unknown';
  /** Human-readable error message */
  message: string;
  /** URL that failed to load (if applicable) */
  url?: string;
  /** HTTP status code (if applicable) */
  statusCode?: number;
  /** Hotel ID for context */
  hotelId?: string;
  /** Component that failed to load content */
  component?: string;
  /** Number of retry attempts made */
  retryCount?: number;
  /** Time taken before failure (milliseconds) */
  duration?: number;
};

/**
 * Check if running in production environment.
 *
 * Extracted for testability.
 *
 * @returns true if NODE_ENV is 'production'
 */
const isProduction = (): boolean => process.env.NODE_ENV === 'production';

/**
 * Log content loading failure with structured data.
 *
 * In development: Logs human-readable error messages to console.
 * In production: Logs structured JSON for log aggregation systems.
 *
 * @param error - Structured error data with type, message, and context
 *
 * @example
 * ```tsx
 * logContentLoadError({
 *   type: 'network',
 *   message: 'Failed to fetch content.json',
 *   url: 'https://cdn.example.com/hotel-123/content.json',
 *   statusCode: 404,
 *   hotelId: 'hotel-123',
 *   component: 'HeroSection',
 *   retryCount: 3,
 *   duration: 5000,
 * });
 * ```
 */
export function logContentLoadError(error: ContentLoadError): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    category: 'content_loading',
    ...error,
  };

  if (isProduction()) {
    // Structured JSON logging for production (easy to parse by log aggregators)
    console.error(JSON.stringify(logEntry));
  } else {
    // Human-readable logging for development
    console.error(`[Content Load Error] ${error.type}: ${error.message}`, {
      url: error.url,
      statusCode: error.statusCode,
      hotelId: error.hotelId,
      component: error.component,
      retryCount: error.retryCount,
      duration: error.duration ? `${error.duration}ms` : undefined,
    });
  }
}

/**
 * Content load success metrics.
 *
 * Used to track successful loads and identify slow content delivery.
 */
export interface ContentLoadSuccess {
  /** Hotel ID */
  hotelId: string;
  /** Component that loaded content */
  component: string;
  /** URL that was loaded (if applicable) */
  url?: string;
  /** Load duration in milliseconds */
  duration: number;
  /** Whether content was served from cache */
  cached?: boolean;
}

/**
 * Log content loading success with timing metrics.
 *
 * In production: Only logs slow loads (>1s) as warnings.
 * In development: Logs all successful loads for debugging.
 *
 * @param metrics - Success metrics with timing and context
 *
 * @example
 * ```tsx
 * logContentLoadSuccess({
 *   hotelId: 'hotel-123',
 *   component: 'HeroSection',
 *   url: 'https://cdn.example.com/hotel-123/content.json',
 *   duration: 350,
 *   cached: false,
 * });
 * ```
 */
export function logContentLoadSuccess(metrics: ContentLoadSuccess): void {
  if (isProduction()) {
    // Only log successes in production if they're slow (>1s)
    if (metrics.duration > 1000) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          category: 'content_loading_slow',
          ...metrics,
        })
      );
    }
  }
  // In development, log all successful loads for debugging
  else {
    console.debug(`[Content Load Success] ${metrics.component}`, {
      hotelId: metrics.hotelId,
      duration: `${metrics.duration}ms`,
      cached: metrics.cached,
    });
  }
}

/**
 * Load timer for measuring content load duration.
 *
 * Used to track how long content loading takes for performance monitoring.
 */
export interface LoadTimer {
  /** Get elapsed time since timer creation in milliseconds */
  getDuration: () => number;
}

/**
 * Create a timer for measuring content load duration.
 *
 * Call this before starting a content load operation, then call
 * `getDuration()` after the operation completes to get the elapsed time.
 *
 * @returns Timer object with getDuration method
 *
 * @example
 * ```tsx
 * const timer = createLoadTimer();
 * await loadContent();
 * const duration = timer.getDuration(); // 350ms
 * ```
 */
export function createLoadTimer(): LoadTimer {
  const start = Date.now();
  return {
    getDuration: () => Date.now() - start,
  };
}
