/**
 * Minimal Animation Presets
 *
 * Simple, reusable Framer Motion animation configurations.
 * Story 12.4: Use existing Framer Motion patterns, no new library creation.
 */

import type { MotionProps } from "framer-motion";

/**
 * Subtle hover lift effect for cards
 * Use with: <motion.div {...hoverLift}>
 */
export const hoverLift: MotionProps = {
  whileHover: { y: -4, transition: { duration: 0.2, ease: "easeOut" } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

/**
 * Subtle scale effect for buttons
 * Use with: <motion.button {...hoverScale}>
 */
export const hoverScale: MotionProps = {
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } },
  whileTap: { scale: 0.98, transition: { duration: 0.1 } },
};

/**
 * Simple fade in animation
 * Use with: <motion.div {...fadeIn}>
 */
export const fadeIn: MotionProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3, ease: "easeOut" },
};

/**
 * Simple slide up animation
 * Use with: <motion.div {...slideUp}>
 */
export const slideUp: MotionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};
