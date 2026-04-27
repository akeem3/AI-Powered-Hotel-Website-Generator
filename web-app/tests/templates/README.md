# Test Templates Directory

This directory contains templates and patterns to support the TDD workflow for hotel website development.

## Files

- `component-test.template.tsx` - Comprehensive template for component tests
- `README.md` - This file explaining usage

## Usage

### Creating a New Component Test

1. Copy the component test template:
   ```bash
   cp tests/templates/component-test.template.tsx tests/components/[ComponentName].test.tsx
   ```

2. Replace all placeholders:
   - `[ComponentName]` with your actual component name
   - Update imports and props
   - Add specific test cases for your component

3. Remove the comment header from the copied file

### TDD Workflow with Templates

1. **Red Phase**: Copy template and write failing test first
2. **Green Phase**: Implement minimal code to make test pass
3. **Refactor Phase**: Improve code while keeping tests green

### Template Features

The component test template includes:

- **Rendering Tests**: Basic component rendering with props
- **User Interaction Tests**: Click, type, and form submission testing
- **State Management Tests**: Component state changes and lifecycle
- **Conditional Rendering**: Props-based conditional logic
- **Accessibility Tests**: axe-core integration and keyboard navigation
- **Responsive Tests**: Mobile and desktop viewport testing
- **Performance Tests**: Render time and re-render optimization
- **Error Handling**: Invalid props and async operation errors
- **Contract Validation**: ZOD schema testing
- **Integration Tests**: Parent component and context provider testing

## Helper Utilities

Use the TDD helpers from `tests/utils/tdd-helpers.tsx`:

```typescript
import { createTDDTestHelpers } from '../utils/tdd-helpers';

const { render, user, performance, mockData, contract, tdd } = createTDDTestHelpers();

describe('MyComponent', () => {
  it('should follow TDD cycle', () => {
    tdd('Component basic functionality');

    // Red phase
    tdd.red('Write failing test');
    render(<MyComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();

    // Green phase - implement component

    // Refactor phase - improve implementation
  });
});
```

## Best Practices

1. **Test First**: Always write the test before the implementation
2. **One Behavior Per Test**: Each test should verify one specific behavior
3. **Use Descriptive Names**: Test names should clearly describe what they test
4. **Mock External Dependencies**: Use mocks for APIs, services, and context
5. **Test User Behavior**: Test what users see and do, not implementation details
6. **Keep Tests Independent**: Tests should not depend on each other
7. **Use Custom Render**: Wrap components with necessary providers
8. **Test Accessibility**: Include accessibility tests for all components

## File Structure Example

```
tests/
├── components/
│   ├── HeroSection.test.tsx        # Copied from template
│   ├── BookingWidget.test.tsx      # Copied from template
│   └── RoomCard.test.tsx           # Copied from template
├── contracts/
│   └── *[Component]Contract.test.tsx  # Contract validation tests
├── integration/
│   └── *[Feature]Integration.test.tsx # Feature integration tests
├── templates/
│   ├── component-test.template.tsx # Template file
│   └── README.md                   # This file
└── utils/
    ├── test-utils.tsx              # Custom render functions
    ├── tdd-helpers.tsx             # TDD workflow helpers
    └── accessibility.ts            # Accessibility testing utilities
```

## Troubleshooting

### Template Placeholders Not Replaced

Make sure to replace all instances of:
- `[ComponentName]` with your actual component name
- `[ComponentPath]` with the path to your component
- Import statements with actual imports
- Default props with your component's actual props

### Tests Not Finding Elements

1. Ensure components are properly exported
2. Check that render functions include necessary providers
3. Verify data-testid attributes match test selectors
4. Use screen queries instead of container queries when possible

### Performance Tests Failing

1. Check if component has expensive operations in render
2. Look for unnecessary re-renders using React DevTools
3. Consider memoization for complex calculations
4. Adjust performance thresholds if unrealistic

---

For more detailed information about the TDD workflow, see `docs/testing/tdd-workflow.md`.