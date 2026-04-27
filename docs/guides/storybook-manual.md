# Storybook Developer & Management Manual

> **Source of Truth** for Storybook architecture, development workflows, and deployment strategies.
> **Scope:** `web-app` workspace.

---

## 1. Overview & Architecture

**Storybook** is our primary environment for developing, testing, and documenting UI components in isolation. It ensures that every component is built with reusability and accessibility in mind, independent of the main application logic.

### Directory Structure & Configuration

```
web-app/
├── .storybook/
│   ├── main.ts           # Config (Vite, Next.js mocks, Aliases)
│   ├── preview.tsx       # Global decorators, generated palette injection
│   └── manager.ts        # UI Configuration
├── stories/
│   ├── 0-Introduction/   # Onboarding docs
│   ├── 1-Design-System/  # Token verification & documentation
│   └── 2-Components/     # Component stories mirrored from components/
```

### Key Integration Points
-   **Styling**: Fully integrated with our Token-Based Color System (via `lib/color`) and CVA Variants (`lib/cva-variants.ts`).
-   **Theming**: `preview.tsx` injects generated CSS variables via `withGeneratedPalette`, mirroring the production `useHotelTheme` hook to ensure 100% color fidelity.
-   **Next.js Mocking**: `next/image` is mocked to behave like standard `<img>` tags (`.storybook/next-image-mock.tsx`) since Storybook runs on Vite.

---

## 2. Developer Guide

### Quick Start

```bash
cd web-app
npm run storybook
# Opens http://localhost:6006
```

### Writing Stories

We use **Component Story Format 3 (CSF3)**. Stories should be simple, declarative, and focused.

#### Basic Story Template
File: `web-app/stories/2-Components/Blocks/MyComponent.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import MyComponent from '@/components/blocks/MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'Components/Blocks/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  argTypes: {
    // Optional: Custom controls
    variant: { 
      control: 'select', 
      options: ['default', 'modern'] 
    }
  },
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    title: 'Component Title',
    isActive: true,
  },
};
```

#### Story with Variants (CVA)
When components use Class Variance Authority (CVA), expose variants clearly.

```tsx
export const Modern: Story = {
  args: {
    variant: { style: 'modern', layout: 'centered' },
  },
};

export const Luxury: Story = {
  args: {
    variant: { style: 'luxury', layout: 'split' },
  },
};
```

### Best Practices

1.  **Deterministic Data**: NEVER use `Date.now()` or `Math.random()` in args. Use fixed dates (`new Date('2026-01-01')`) to prevent flaky visual tests.
2.  **Semantic Tokens**: Start stories with meaningful names (`ModernCentered` vs `Variant1`).
3.  **One Concept per Story**: Don't cram every permutation into one story.
4.  **Theme Agnostic**: Do not hardcode colors in stories. Trust the palette system. Stories should look correct in both Light and Dark modes.

---

## 3. Deployment & Visual Testing

We use **Chromatic** for hosting and visual regression testing.

### Workflows

| Environment | Command | Trigger |
|-------------|---------|---------|
| **Local Dev** | `npm run storybook` | Manual |
| **Static Build** | `npm run build-storybook` | Manual (debugging) |
| **Production** | Auto-deployed via CI | Push to `main` |
| **Feature Preview** | Auto-deployed via CI | Push to `Epic-*` or PRs |

### Chromatic Strategy

-   **Main Branch**: Baseline implementation. "Auto-accept changes" is enabled (Source of Truth).
-   **Epic/Feature Branches**: Requires manual review.
    1.  **First Push**: Compares against `main`. All differences appear as "New".
    2.  **Subsequent Pushes**: Compares against the branch's previous build.
    3.  **PR to Main**: Compares branch head against `main`.

**Workflow:**
1.  Push code → CI runs Chromatic.
2.  Check PR status → Click "UI Tests" link.
3.  **Review**: Accept intended changes, Reject regressions.

### TurboSnap
TurboSnap (`onlyChanged: true`) is enabled to speed up builds by only snapshotting stories affected by git changes. Requires full git history in CI.

---

## 4. Advanced Concepts

### Theming System (Storybook vs Prod)

Storybook must mirror production theming exactly.

| Aspect | Storybook Implementation | Production Implementation |
|--------|--------------------------|---------------------------|
| **Palette Gen** | `withGeneratedPalette` decorator | `useHotelTheme` hook |
| **Variable Injection** | Styles injected into preview iframe head | Styles injected into `_app` or root layout |
| **Switching** | Toolbar toggle (`data-mode` attr) | App state (`data-mode` attr) |

**Key Mechanism**:
The `withGeneratedPalette` decorator in `preview.tsx` observes the `data-mode` attribute. When you switch themes in the Storybook toolbar, it recalculates the OKLCH values for semantic tokens (`--brand-primary-val`, etc.) effectively changing the theme instantly without page reloads.

### Troubleshooting

**Styles missing?**
-   Verify `globals.css` is imported in `preview.tsx`.
-   Verify `tailwind.config.js` includes the storybook directory in `content`.

**Flaky Tests?**
-   Check for dynamic IDs or timestamps.
-   If animation causes diffs, disable snapshots for that story: `parameters: { chromatic: { disableSnapshot: true } }`.

---

## 5. Resources

-   [Storybook MCP Integration](./storybook-mcp-manual.md)
-   [Semantic Color System](./semantic-color-system.md)
-   [Semantic Typography System](./semantic-typography-system.md)
-   [CVA Architecture](../architecture/CVA-ARCHITECTURE.md)
