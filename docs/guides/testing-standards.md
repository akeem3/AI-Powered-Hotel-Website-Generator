# Testing Standards

## Overview

This document defines the testing standards and requirements for the hotel website generation system.

## Testing Pyramid

```
           E2E Tests
          /          \
     Integration     Chromatic
    /                    \
 Unit Tests              Contract Tests
```

## Test Requirements

### Unit Tests (Vitest)
- 80% minimum code coverage
- Test all utility functions
- Mock external dependencies
- Fast execution (< 5 seconds total)

### Integration Tests
- Test component interactions
- Validate data flow
- Test hooks and providers
- Include edge cases

### Contract Tests
- Validate component props API
- Test CVA variant combinations
- Verify ZOD schema enforcement
- Document breaking changes

### E2E Tests (Playwright)
- Critical user flows only
- Cross-browser validation
- Performance regression checks
- Accessibility testing

### Visual Regression (Chromatic)
- All component variants
- Responsive breakpoints
- Dark mode variants
- Theme variations

## Testing Commands

```bash
# Run all tests
npm test

# Unit tests with coverage
npm test -- --coverage

# Integration tests
npm test -- --config jest.config.integration.js

# E2E tests
npm run test:e2e

# Chromatic
npm run chromatic
```

## Related Documentation
- [Project Context - Testing Standards](../../project-context/react/testing-standards.md)
- [Coding Standards](./coding-standards.md)
