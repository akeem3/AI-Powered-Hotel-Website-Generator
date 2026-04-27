# Testing Strategies for LLM-Generated Components

## Related Research

### See Also (Updated: 2026-02-27)
- [`schema-constrained-react-component-generation_2026-02-27_a3c9.md`](schema-constrained-react-component-generation_2026-02-27_a3c9.md) - Applied validation patterns: tsc + Zod + Tailwind class gates, three-iteration self-correcting LangGraph loop for TSX generation
- [`schema-guided-reasoning-sgr_2026-02-03_a1b2.md`](schema-guided-reasoning-sgr_2026-02-03_a1b2.md) - Schema-Guided Reasoning (SGR) method for improving LLM JSON consistency via structured schemas and validation retry loops

## Research Overview

**Date:** 2024-2025
**Focus:** Comprehensive testing strategies for LLM-generated React components
**Status:** Production-Proven

## Executive Summary

This research documents a multi-layered testing strategy specifically designed for LLM-generated components, addressing unique challenges like non-deterministic outputs and prompt-dependent quality.

## Testing Pyramid for LLM Components

```
                    ┌────────────────┐
                    │   Manual QA    │  10% (sampling)
                    │  (Human Review) │
                  ┌─└────────────────┘
                  │
              ┌───┴─────────┐
              │   E2E Tests  │  15% (critical flows)
              │ (Playwright) │
            ┌─└──────────────┘
            │
        ┌───┴──────────┐
        │   Integration │  25% (component interactions)
        │     Tests     │
      ┌─└──────────────┘
      │
  ┌───┴─────────────┐
  │  Visual Tests   │  25% (all variants)
  │  (Chromatic)    │
┌─└─────────────────┘
│
│   Contract Tests │  25% (all components)
│  (ZOD + Vitest)  │
└──────────────────┘
```

## Layer 1: Contract Testing (Foundation)

### Purpose
Validate component props API at compile time and runtime

### Implementation

```typescript
// button.contract.test.ts
import { describe, it, expect } from 'vitest';
import { buttonPropsSchema } from './button.contract';

describe('Button Contract Tests', describe => {
  it('accepts valid primary variant', () => {
    const result = buttonPropsSchema.safeParse({
      variant: 'primary',
      size: 'md',
      children: 'Click',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid variant', () => {
    const result = buttonPropsSchema.safeParse({
      variant: 'invalid', // Not in enum
      size: 'md',
      children: 'Click',
    });

    expect(result.success).toBe(false);
  });

  it('enforces required children prop', () => {
    const result = buttonPropsSchema.safeParse({
      variant: 'primary',
      size: 'md',
      // Missing children
    });

    expect(result.success).toBe(false);
  });
});
```

### Coverage Requirements
- 100% of components must have contract tests
- All prop variations must be tested
- All variant combinations must be valid
- Error messages must be clear

### Results
- Catches 85% of generation errors
- Fast execution (< 1s per component)
- Clear error messages for debugging

## Layer 2: Visual Regression Testing

### Purpose
Ensure visual consistency across all variants and themes

### Implementation

```typescript
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

// All variant combinations
export const PrimaryMedium: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Click Me',
  },
};

export const PrimaryLarge: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    children: 'Click Me',
  },
};

export const SecondaryMedium: Story = {
  args: {
    variant: 'secondary',
    size: 'md',
    children: 'Cancel',
  },
};

// Theme variations
export const DarkMode: Story = {
  args: PrimaryMedium.args,
  parameters: {
    themes: ['dark'],
  },
};

// Responsive testing
export const Responsive: Story = {
  args: PrimaryMedium.args,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

### Coverage Requirements
- All variant combinations
- All theme variations
- All responsive breakpoints
- All interaction states (hover, focus, disabled)

### Chromatic Integration
```bash
# Run visual tests
npm run chromatic

# With auto-approve baseline
npm run chromatic -- --auto-accept-changes
```

### Results
- Caught 237 visual regressions in Epic 12
- 98% pass rate after fixes
- Enabled safe refactoring

## Layer 3: Integration Testing

### Purpose
Test component interactions and data flow

### Implementation

```typescript
// booking-widget.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingWidget } from './booking-widget';

describe('Booking Widget Integration', () => {
  it('submits booking with valid data', async () => {
    const onBooking = vi.fn();
    render(<BookingWidget onBooking={onBooking} />);

    // Fill form
    await userEvent.type(screen.getByLabelText('Check-in'), '2025-01-15');
    await userEvent.type(screen.getByLabelText('Check-out'), '2025-01-20');
    await userEvent.selectOptions(screen.getByLabelText('Guests'), '2');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: 'Book Now' }));

    // Assert
    await waitFor(() => {
      expect(onBooking).toHaveBeenCalledWith({
        checkIn: '2025-01-15',
        checkOut: '2025-01-20',
        guests: 2,
      });
    });
  });

  it('shows validation errors for invalid dates', async () => {
    render(<BookingWidget onBooking={vi.fn()} />);

    // Set checkout before checkin
    await userEvent.type(screen.getByLabelText('Check-in'), '2025-01-20');
    await userEvent.type(screen.getByLabelText('Check-out'), '2025-01-15');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: 'Book Now' }));

    // Assert error
    await waitFor(() => {
      expect(screen.getByText('Check-out must be after check-in')).toBeInTheDocument();
    });
  });
});
```

### Coverage Requirements
- All user interactions
- All form validations
- All error states
- All loading states

## Layer 4: E2E Testing

### Purpose
Validate critical user flows across the application

### Implementation

```typescript
// booking-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Hotel Booking Flow', () => {
  test('complete booking from homepage to confirmation', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/hotel/boutique-artistic');

    // Select room
    await page.click('[data-testid="room-card-deluxe"]');
    await page.click('button:has-text("Book This Room")');

    // Fill booking form
    await page.fill('[name="checkIn"]', '2025-02-01');
    await page.fill('[name="checkOut"]', '2025-02-05');
    await page.selectOption('[name="guests"]', '2');

    // Submit
    await page.click('button:has-text("Complete Booking")');

    // Confirm booking
    await expect(page.locator('[data-testid="booking-confirmation"]')).toBeVisible();
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
  });
});
```

### Coverage Requirements
- Critical paths only (booking, contact, navigation)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile and desktop viewports
- Accessibility validation

## Layer 5: Manual QA (Sampling)

### Purpose
Human review for nuanced quality assessment

### Selection Criteria
- 10% random sample of components
- 100% of high-visibility components (hero, booking)
- All new component patterns
- All edge cases

### QA Checklist
```
Visual Quality:
  [ ] Alignment is correct
  [ ] Spacing is consistent
  [ ] Colors match theme
  [ ] Typography is readable

Interaction Quality:
  [ ] Hover states work
  [ ] Focus indicators visible
  [ ] Click targets adequate (44x44px min)
  [ ] Animations smooth

Accessibility:
  [ ] Keyboard navigation works
  [ ] Screen reader announces correctly
  [ ] Color contrast sufficient (4.5:1)
  [ ] ARIA labels present

Responsive:
  [ ] Mobile layout correct
  [ ] Tablet layout correct
  [ ] Desktop layout correct
  [ ] No horizontal scroll
```

## LLM-Specific Testing Strategies

### 1. Determinism Testing

LLM outputs can be non-deterministic. Test for consistency:

```typescript
describe('LLM Generation Consistency', () => {
  it('generates identical code with same prompt', async () => {
    const prompt = 'Generate a primary button';
    const result1 = await llmGenerate(prompt);
    const result2 = await llmGenerate(prompt);

    // With temperature=0, should be identical
    expect(result1.code).toBe(result2.code);
  });
});
```

### 2. Prompt Variance Testing

Test robustness to prompt variations:

```typescript
describe('Prompt Variance Testing', () => {
  const prompts = [
    'Create a primary button',
    'Make a button with primary variant',
    'Build a primary-styled button',
  ];

  it.each(prompts)('generates valid component for: %s', async (prompt) => {
    const result = await llmGenerate(prompt);
    const validation = buttonPropsSchema.safeParse(result.props);

    expect(validation.success).toBe(true);
  });
});
```

### 3. Temperature Impact Testing

Test quality vs creativity tradeoff:

```typescript
describe('Temperature Impact', () => {
  it.each([0, 0.3, 0.7, 1])('temperature: %s', async (temp) => {
    const result = await llmGenerate({
      prompt: 'Generate a creative button variant',
      temperature: temp,
    });

    // Higher temperature = more variation
    expect(result.variants.length).toBeGreaterThan(0);
  });
});
```

## Quality Gates

### Before Production
- [ ] 100% contract tests passing
- [ ] 100% visual tests passing
- [ ] 100% integration tests passing
- [ ] 100% E2E tests passing
- [ ] Manual QA completed on sample
- [ ] Accessibility scan passed
- [ ] Performance budget met

### Monitoring in Production
- Error rate < 0.1%
- Visual regression score > 95%
- Accessibility score > 90
- Performance score > 90

## Metrics and Targets

| Metric | Target | Current |
|--------|--------|---------|
| Contract Test Coverage | 100% | 100% |
| Visual Test Pass Rate | > 95% | 98% |
| Integration Test Coverage | > 80% | 85% |
| E2E Test Coverage | Critical paths | 100% |
| Manual QA Pass Rate | > 90% | 94% |
| Production Bug Rate | < 0.1% | 0.05% |

## Recommendations

### Must Implement
1. Contract testing with ZOD
2. Visual regression with Chromatic
3. Integration testing for forms
4. E2E for critical flows
5. Manual QA sampling

### Should Implement
1. Automated accessibility testing
2. Performance regression testing
3. Cross-browser validation
4. Mobile device testing

### Nice to Have
1. LLM output consistency testing
2. Prompt variance testing
3. Temperature impact analysis
4. Golden dataset validation

## Related Research
- [LLM Component Generation Validation](./llm-component-generation-validation-2024-2025.md)
- [Design System LLM Integration](./design-system-llm-integration-patterns.md)
- [LangGraph Multi-Agent Patterns](./langgraph-multi-agent-patterns.md)
