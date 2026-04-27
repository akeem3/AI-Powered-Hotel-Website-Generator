'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/**
 * HeroAnimated Client Component
 *
 * Provides framer-motion animations for the Hero section.
 * This component wraps Server Component content to add optional animations.
 *
 * IMPORTANT: This is a Client Component only for animation purposes.
 * All content is rendered by Server Components and passed as children.
 *
 * @component
 * @example
 * ```tsx
 * <HeroAnimated>
 *   <HeroContent {...props} />
 * </HeroAnimated>
 * ```
 */
export interface HeroAnimatedProps {
  /** Content to animate (Server Component children) */
  children: ReactNode;
  /** Animation delay in seconds */
  delay?: number;
  /** Animation duration in seconds */
  duration?: number;
  /** Initial Y offset for animation */
  initialY?: number;
  /** Initial X offset for animation (for right-side image) */
  initialX?: number;
}

/**
 * Animation wrapper for hero text content
 *
 * Fades in and slides up from initial position.
 */
export function HeroAnimated({
  children,
  delay = 0,
  duration = 0.6,
  initialY = 20,
  initialX = 0,
}: HeroAnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initialY, x: initialX }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated container for hero text content
 *
 * Provides space-y layout and animation for text elements.
 */
export interface HeroAnimatedContentProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function HeroAnimatedContent({
  children,
  className = '',
  delay = 0,
}: HeroAnimatedContentProps) {
  return (
    <HeroAnimated delay={delay}>
      <div className={`space-y-gap-card ${className}`}>{children}</div>
    </HeroAnimated>
  );
}

/**
 * Animated wrapper for hero image asset
 *
 * Fades in and slides from right side.
 */
export interface HeroAnimatedAssetProps {
  children: ReactNode;
  className?: string;
}

export function HeroAnimatedAsset({
  children,
  className = '',
}: HeroAnimatedAssetProps) {
  return (
    <HeroAnimated delay={0.1} initialX={20}>
      <div className={className}>{children}</div>
    </HeroAnimated>
  );
}
