/**
 * Content System Feature Flags
 *
 * Provides granular control over content system rollout per component.
 * Supports environment variables, prop overrides, and percentage-based canary deployment.
 */

export type ComponentType = 'hero' | 'amenities' | 'testimonials' | 'gallery' | 'rooms';

/**
 * Get consistent session-based user bucket (0-99) for rollout percentage
 *
 * Uses anonymous session ID to ensure consistent bucket assignment across sessions.
 */
function getUserBucket(): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  // Get or create session ID
  let sessionId = sessionStorage.getItem('content_bucket_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('content_bucket_id', sessionId);
  }

  // Simple hash to bucket (0-99)
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    const char = sessionId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 100;
}

/**
 * Check if content system is enabled for a specific component
 *
 * Priority order:
 * 1. Prop override (explicit enable/disable via props)
 * 2. Component-specific environment variable
 * 3. Global master switch
 * 4. Rollout percentage check
 * 5. Default: enabled in production, disabled in development
 *
 * @param component - The component to check
 * @param propOverride - Optional prop override (highest priority)
 * @returns true if content is enabled for the component
 *
 * @example
 * isContentEnabled('hero') // false by default
 * isContentEnabled('hero', true) // true (prop override)
 * isContentEnabled('amenities') // checks NEXT_PUBLIC_ENABLE_CONTENT_AMENITIES
 */
export function isContentEnabled(
  component: ComponentType,
  propOverride?: boolean
): boolean {
  // 1. Prop override (highest priority)
  if (propOverride !== undefined) {
    return propOverride;
  }

  // 2. Check component-specific environment variable
  const componentFlagKey = `NEXT_PUBLIC_ENABLE_CONTENT_${component.toUpperCase()}`;
  const componentFlag = process.env[componentFlagKey];
  if (componentFlag !== undefined) {
    return componentFlag === 'true';
  }

  // 3. Check global master switch
  const masterFlag = process.env.NEXT_PUBLIC_ENABLE_CONTENT_SYSTEM;
  if (masterFlag !== undefined) {
    return masterFlag === 'true';
  }

  // 4. Rollout percentage check
  const rolloutEnv = process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT;
  if (rolloutEnv) {
    const rollout = parseInt(rolloutEnv, 10);
    if (!isNaN(rollout) && rollout > 0) {
      const userBucket = getUserBucket();
      return userBucket < rollout;
    }
  }

  // 5. Default: enabled in production, disabled in development
  // In production, we want content system active by default
  // In development, disabled to allow testing without content
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction;
}

/**
 * Check if any component has content enabled
 *
 * Useful for determining if content hooks should be initialized at all.
 *
 * @returns true if content is enabled for any component
 */
export function isAnyContentEnabled(): boolean {
  return (
    isContentEnabled('hero') ||
    isContentEnabled('amenities') ||
    isContentEnabled('testimonials')
  );
}

/**
 * Get the current rollout percentage
 *
 * @returns number from 0-100, or 0 if not configured
 */
export function getRolloutPercentage(): number {
  const rollout = process.env.NEXT_PUBLIC_CONTENT_ROLLOUT_PERCENT;
  if (rollout) {
    const parsed = parseInt(rollout, 10);
    return isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
  }
  return 0;
}
