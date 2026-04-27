# Testing Infrastructure - Story 1.7

> **Status:** ✅ Completed
> **Version:** 1.0
> **Last Updated:** 2025-01-19

## Overview

This document provides comprehensive testing instructions for the LLM-Driven Hotel Website Generator platform, established as part of Story 1.7: Comprehensive Testing Infrastructure.

## Quick Start Commands

### Basic Test Commands

```bash
# Run all tests (main configuration)
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode for development
npm run test:watch

# Run CI-ready tests with coverage
npm run test:ci
```

### Configuration-Specific Commands

```bash
# Run simple configuration tests (lightweight, no complex mocking)
npm run test:simple

# Run workflow configuration tests (LangGraph workflows)
npm run test:workflow

# Run contract validation tests only
npm run test:contracts
```

### Component Testing Commands

```bash
# Test specific components
npm test -- --testPathPattern="HeroSection"
npm test -- --testPathPattern="RoomCard"
npm test -- --testPathPattern="BookingWidget"

# Test specific categories
npm test -- tests/components/ui/
npm test -- tests/components/blocks/
npm test -- tests/components/sections/
```

## Test Configuration Files

### Main Configuration (`jest.config.ts`)
- **Purpose:** Primary Jest configuration for most tests
- **Coverage Thresholds:** 80% lines, 70% branches, 70% functions
- **Environment:** jsdom
- **Test Pattern:** `tests/**/*.test.{js,jsx,ts,tsx}`

### Simple Configuration (`jest.config.simple.js`)
- **Purpose:** Lightweight tests without complex mocking
- **Timeout:** 5 seconds
- **Use Case:** Quick unit tests, utility functions

### Workflow Configuration (`jest.config.workflow.js`)
- **Purpose:** LangGraph workflow and agent testing
- **Test Pattern:** `tests/{langgraph,workflows,agents,llm,cost}/**/*.test.{js,jsx,ts,tsx}`
- **Special Features:** Prototype mocking, cost monitor state management

## Testing Patterns

### Component Testing Structure

```typescript
// Standard component test template
import { render, screen } from '../utils/test-utils';
import Component from './Component';

describe('Component', () => {
  const defaultProps = {
    // Required default props
  };

  it('renders with required props', () => {
    render(<Component {...defaultProps} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });

  it('handles accessibility requirements', async () => {
    const { container } = render(<Component {...defaultProps} />);
    expect(container).toBeAccessible();
  });
});
```

### Integration Testing Pattern

```typescript
// Integration test example
import { render, screen, fireEvent } from '../utils/test-utils';
import HomePage from '@/app/page';

describe('User Journey Integration', () => {
  it('should complete booking flow from homepage to rooms', async () => {
    render(<HomePage />);

    const viewRoomsCTA = screen.getByRole('link', { name: /view rooms/i });
    fireEvent.click(viewRoomsCTA);

    expect(screen.getByText(/our luxury rooms/i)).toBeInTheDocument();
  });
});
```

### Contract Testing Pattern

```typescript
// ZOD contract validation test
import { ComponentContract } from '@/lib/contracts/component.contract';

describe('Component Contract Validation', () => {
  it('should accept valid configuration', () => {
    const validConfig = { /* valid props */ };
    const result = ComponentContract.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should reject invalid configuration', () => {
    const invalidConfig = { /* invalid props */ };
    const result = ComponentContract.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});
```

### Performance Testing Pattern

```typescript
// Performance test example
import { measureRenderTime } from '../utils/performance-utils';

describe('Component Performance', () => {
  it('should render under performance threshold', async () => {
    const renderTime = await measureRenderTime(Component, props);
    expect(renderTime).toBeLessThan(50); // 50ms threshold
  });
});
```

## Mock Configuration

### Next.js Mocks

```typescript
// Mock Next.js components for testing
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, fill, ...props }: any) => <img {...props} />,
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
```

### LangGraph Agent Mocking

```typescript
// Prototype-based mocking for LangGraph agents
const { AgentName } = require('@/langgraph/agents/AgentName');
AgentName.prototype.methodName = jest.fn().mockResolvedValue(mockData);

// Cost monitor testing pattern
beforeEach(() => {
  costMonitor.reset(); // MUST reset between tests
});
```

## Coverage Requirements

### Current Coverage Thresholds
- **Statements:** 80%
- **Branches:** 70%
- **Functions:** 70%
- **Lines:** 80%

### Coverage Collection
- **Included:** `app/**/*.{js,jsx,ts,tsx}`, `components/**/*.{js,jsx,ts,tsx}`, `lib/**/*.{js,jsx,ts,tsx}`
- **Excluded:** `**/*.d.ts`, `**/*.stories.{js,jsx,ts,tsx}`, `app/layout.tsx`

### Coverage Report Generation
```bash
# Generate HTML coverage report
npm run test:coverage

# View coverage report in browser
open coverage/lcov-report/index.html
```

## Performance Budgets

### Component Performance Thresholds
- **Primitive Components:** 10ms
- **Block Components:** 30ms
- **Section Components:** 50ms
- **Page Components:** 100ms

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP):** 2.5s
- **First Input Delay (FID):** 100ms
- **Cumulative Layout Shift (CLS):** 0.1

## Accessibility Testing

### Axe-Core Integration
```typescript
// Accessibility test example
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('should be accessible', async () => {
  const { container } = render(<Component {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Keyboard Navigation Testing
```typescript
// Keyboard navigation test
it('should support keyboard navigation', () => {
  render(<Component />);
  const button = screen.getByRole('button');

  button.focus();
  expect(button).toHaveFocus();

  fireEvent.keyDown(button, { key: 'Enter' });
  // Test interaction
});
```

## CI/CD Integration

### Pre-commit Hooks
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --bail --passWithNoTests"
    ]
  }
}
```

### GitHub Actions Workflow
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
```

## Testing Checklist

### Before Committing ✅
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Contract validation tests pass
- [ ] Coverage thresholds met
- [ ] No new accessibility violations
- [ ] Performance budgets maintained
- [ ] Snapshots updated if needed

### Before Release ✅
- [ ] All Jest configurations working
- [ ] Coverage thresholds exceeded (90%+ preferred)
- [ ] Contract validation tests passing
- [ ] Performance tests under thresholds
- [ ] Responsive tests passing at all breakpoints
- [ ] Accessibility tests passing (axe-core)
- [ ] Build process completes successfully
- [ ] Documentation updated

## Troubleshooting

### Common Issues

**Jest Configuration Errors**
- Check file paths in jest.config.js
- Ensure moduleNameMapper matches your imports
- Verify testMatch patterns

**Mock Errors**
- Ensure mocks are properly configured in test setup
- Check for circular dependencies in mocks
- Verify Next.js and external library mocks

**Coverage Gaps**
- Identify uncovered lines in coverage report
- Add tests for edge cases and error conditions
- Consider if uncovered code is necessary

**Performance Test Failures**
- Check for synchronous operations in tests
- Verify mocking doesn't interfere with performance measurements
- Consider performance test environment differences

### Debug Commands

```bash
# Run specific test with verbose output
npm test -- --testPathPattern="specific-test" --verbose

# Run tests with Node.js inspector for debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Update snapshots automatically
npm test -- -u

# Run tests without cache
npm test -- --no-cache
```

## Additional Resources

### Documentation Links
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Axe Documentation](https://github.com/nickcolley/jest-axe)
- [Zod Schema Validation](https://zod.dev/)

### Internal Documentation
- [Component Contracts](../contracts/README.md)
- [Performance Testing Guidelines](../performance/README.md)
- [Integration Testing Patterns](../integration/README.md)