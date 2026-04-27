import type { Meta, StoryObj } from "@storybook/react-vite";
import { motion } from "framer-motion";
import {
  hoverLift,
  hoverScale,
  fadeIn,
  slideUp,
} from "@/lib/animation-presets";
import { Spinner } from "@/components/ui/spinner";

const meta: Meta = {
  title: "Design System/Animations",
  parameters: {
    docs: {
      description: {
        component: `
Animation patterns for the hotel design system.

**Philosophy:** Minimal, tasteful animations using existing Framer Motion library.
No complex orchestration - simple hover states and loading indicators.

**Implementation:**
- Hover states: Primarily CSS (via CVA) for performance
- Press feedback: Framer Motion \`whileTap\`
- Loading states: Tailwind \`animate-pulse\` and \`animate-spin\`
- Focus states: CSS \`focus-visible\` for accessibility
        `,
      },
    },
  },
};

export default meta;

/**
 * Hover Lift Animation
 * Used on cards and clickable containers
 */
export const HoverLift: StoryObj = {
  render: () => (
    <motion.div
      {...hoverLift}
      className="p-6 bg-surface-elevated rounded-xl shadow-card cursor-pointer"
    >
      <p className="text-text-primary">Hover over me to see the lift effect</p>
      <p className="text-text-secondary text-sm mt-2">
        Uses y: -4 translation on hover
      </p>
    </motion.div>
  ),
};

/**
 * Hover Scale Animation
 * Used on buttons and small interactive elements
 */
export const HoverScale: StoryObj = {
  render: () => (
    <motion.button
      {...hoverScale}
      className="px-6 py-3 bg-brand-primary text-on-brand rounded-lg"
    >
      Hover/Click me
    </motion.button>
  ),
};

/**
 * Loading Spinner
 * Used during form submissions and data loading
 */
export const LoadingSpinner: StoryObj = {
  render: () => (
    <div className="flex gap-8 items-center">
      <div className="text-center">
        <Spinner size="sm" className="text-brand-primary" />
        <p className="text-text-muted text-xs mt-2">Small</p>
      </div>
      <div className="text-center">
        <Spinner size="md" className="text-brand-primary" />
        <p className="text-text-muted text-xs mt-2">Medium</p>
      </div>
      <div className="text-center">
        <Spinner size="lg" className="text-brand-primary" />
        <p className="text-text-muted text-xs mt-2">Large</p>
      </div>
    </div>
  ),
};

/**
 * Skeleton Loading Pattern
 * Uses Tailwind's animate-pulse
 */
export const SkeletonPattern: StoryObj = {
  render: () => (
    <div className="p-6 bg-surface-primary rounded-xl border border-border-default">
      <div className="h-6 w-3/4 bg-surface-secondary rounded animate-pulse" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-full bg-surface-secondary/60 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-surface-secondary/60 rounded animate-pulse" />
      </div>
      <div className="mt-4 h-10 w-32 bg-surface-secondary rounded-lg animate-pulse" />
    </div>
  ),
};

/**
 * Focus Ring Pattern
 * WCAG AA compliant focus indicator
 */
export const FocusRing: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <p className="text-text-secondary text-sm">
        Tab through these elements to see focus rings:
      </p>
      <div className="flex gap-4">
        <button className="px-4 py-2 bg-brand-primary text-on-brand rounded-lg focus-ring">
          Button 1
        </button>
        <button className="px-4 py-2 bg-surface-elevated text-text-primary border border-border-default rounded-lg focus-ring">
          Button 2
        </button>
        <a
          href="#"
          className="px-4 py-2 text-brand-primary underline focus-ring rounded"
        >
          Link
        </a>
      </div>
    </div>
  ),
};
