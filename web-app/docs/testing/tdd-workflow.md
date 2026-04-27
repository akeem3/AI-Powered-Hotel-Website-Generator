# TDD Workflow for Hotel Website

## Overview

This document outlines the Test-Driven Development (TDD) workflow for building hotel website components and features. Following this approach ensures high code quality, better design, and comprehensive test coverage.

## Red-Green-Refactor Cycle

### 1. Red: Write Failing Test

**Before writing any production code, write a test that fails.**

```typescript
// Example: Testing a new HeroSection feature
describe('HeroSection', () => {
  it('should display a promotional banner when promotion prop is provided', () => {
    const promotion = {
      title: 'Summer Sale',
      subtitle: 'Save 20% on all bookings',
      discount: '20%'
    };

    // This test will fail because the feature doesn't exist yet
    render(<HeroSection promotion={promotion} />);

    expect(screen.getByText('Summer Sale')).toBeInTheDocument();
    expect(screen.getByText('Save 20% on all bookings')).toBeInTheDocument();
    expect(screen.getByText('20% OFF')).toBeInTheDocument();
  });
});
```

**Key Principles:**
- Write the simplest possible test that captures the requirement
- Test should fail for the right reason (feature doesn't exist)
- Keep test focused on a single behavior

### 2. Green: Make Test Pass

**Write the minimum code needed to make the test pass.**

```typescript
// Minimal implementation to make the test pass
interface HeroSectionProps {
  // ... existing props
  promotion?: {
    title: string;
    subtitle: string;
    discount: string;
  };
}

const HeroSection: FC<HeroSectionProps> = ({ promotion, ...otherProps }) => {
  return (
    <section className="relative">
      {/* ... existing hero content */}

      {promotion && (
        <div className="absolute top-4 right-4 bg-red-600 text-white p-4 rounded-lg">
          <h3 className="font-bold">{promotion.title}</h3>
          <p className="text-sm">{promotion.subtitle}</p>
          <div className="text-xl font-bold mt-2">{promotion.discount} OFF</div>
        </div>
      )}
    </section>
  );
};
```

**Key Principles:**
- Write the simplest code that passes the test
- Don't worry about perfect implementation yet
- Focus on making the test green, not on optimization
- Avoid adding unnecessary features

### 3. Refactor: Improve Code

**Clean up and improve the code while keeping all tests green.**

```typescript
// Refactored implementation with better structure
const PromotionalBanner: FC<{ promotion: PromotionProps }> = ({ promotion }) => (
  <div className="absolute top-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg transform transition-transform hover:scale-105">
    <h3 className="font-bold text-lg">{promotion.title}</h3>
    <p className="text-sm opacity-90">{promotion.subtitle}</p>
    <div className="text-2xl font-bold mt-2">{promotion.discount} OFF</div>
  </div>
);

const HeroSection: FC<HeroSectionProps> = ({ promotion, ...otherProps }) => {
  return (
    <section className="relative">
      {/* ... existing hero content */}

      {promotion && <PromotionalBanner promotion={promotion} />}
    </section>
  );
};
```

**Key Principles:**
- All tests must remain green during refactoring
- Improve code structure, readability, and performance
- Extract reusable components and utilities
- Apply design patterns and best practices

## Test-First Examples

### Example 1: Component with ZOD Validation

```typescript
// 1. RED: Write failing test for validation
describe('BookingWidget Validation', () => {
  it('should reject invalid booking dates', () => {
    const invalidProps = {
      checkIn: '2025-11-10',
      checkOut: '2025-11-05', // Check-out before check-in
      guests: 2
    };

    const result = BookingWidgetContract.safeParse(invalidProps);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('after check-in');
  });
});

// 2. GREEN: Implement validation
const BookingWidgetContract = z.object({
  checkIn: z.string().transform(date => new Date(date)),
  checkOut: z.string().transform(date => new Date(date)),
  guests: z.number().min(1).max(10)
}).refine(data => data.checkOut > data.checkIn, {
  message: "Check-out date must be after check-in date",
  path: ["checkOut"]
});

// 3. REFACTOR: Add better error messages and validation helpers
const validateBookingDates = (checkIn: Date, checkOut: Date) => {
  if (checkOut <= checkIn) {
    throw new ValidationError("Check-out must be at least 1 day after check-in");
  }
  if (checkOut.getTime() - checkIn.getTime() > 30 * 24 * 60 * 60 * 1000) {
    throw new ValidationError("Maximum stay duration is 30 days");
  }
};
```

### Example 2: Responsive Component

```typescript
// 1. RED: Test responsive behavior
describe('RoomCard Responsive', () => {
  it('should display compact layout on mobile', () => {
    // Mock mobile viewport
    global.innerWidth = 375;

    const { container } = render(<RoomCard {...mockRoomProps} />);
    expect(container.querySelector('.room-card-mobile')).toBeInTheDocument();
    expect(container.querySelector('.room-card-desktop')).not.toBeInTheDocument();
  });

  it('should display full layout on desktop', () => {
    // Mock desktop viewport
    global.innerWidth = 1024;

    const { container } = render(<RoomCard {...mockRoomProps} />);
    expect(container.querySelector('.room-card-desktop')).toBeInTheDocument();
    expect(container.querySelector('.room-card-mobile')).not.toBeInTheDocument();
  });
});

// 2. GREEN: Implement responsive logic
const RoomCard: FC<RoomCardProps> = ({ room }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <RoomCardMobile room={room} /> : <RoomCardDesktop room={room} />;
};

// 3. REFACTOR: Use custom hook for better reusability
const useResponsive = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
};
```

### Example 3: Form Component with User Interaction

```typescript
// 1. RED: Test form submission and validation
describe('ContactForm', () => {
  it('should show validation errors for empty required fields', async () => {
    const { getByRole, getByText } = render(<ContactForm />);

    const submitButton = getByRole('button', { name: 'Send Message' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(getByText('Name is required')).toBeInTheDocument();
      expect(getByText('Email is required')).toBeInTheDocument();
      expect(getByText('Message is required')).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    const { getByRole, getByLabelText } = render(
      <ContactForm onSubmit={mockSubmit} />
    );

    fireEvent.change(getByLabelText('Name'), { target: { value: 'John Doe' } });
    fireEvent.change(getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(getByLabelText('Message'), { target: { value: 'Hello!' } });

    fireEvent.click(getByRole('button', { name: 'Send Message' }));

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello!'
      });
    });
  });
});

// 2. GREEN: Implement form with basic validation
// (Implementation would follow standard form patterns)

// 3. REFACTOR: Add real-time validation, better UX, accessibility improvements
```

## TDD Best Practices

### Before Writing Code

1. **Understand the requirement** - Clarify what needs to be built
2. **Identify test cases** - List all scenarios and edge cases
3. **Write the first test** - Start with the simplest case
4. **Ensure it fails** - Verify the test fails for the right reason

### During Implementation

1. **Make it pass** - Write minimal implementation
2. **Run tests frequently** - Keep the feedback loop short
3. **Refactor continuously** - Improve code while tests are green
4. **Add more tests** - Cover edge cases and error scenarios

### After Implementation

1. **Review code quality** - Ensure clean, readable code
2. **Check test coverage** - Verify adequate coverage of functionality
3. **Update documentation** - Document any new patterns or utilities
4. **Consider integration** - Think about how the code works with other components

## Common Pitfalls and Solutions

### Pitfall 1: Writing Too Much Code Before Testing

**Problem:** Writing large amounts of code before writing tests.
**Solution:** Follow the red-green-refactor cycle strictly. Write the test first, then implement.

### Pitfall 2: Testing Implementation Details

**Problem:** Tests that know too much about internal implementation.
**Solution:** Test behavior and outcomes, not implementation details.

```typescript
// Bad - Testing implementation
expect(component.internalState).toBe('loading');

// Good - Testing behavior
expect(getByRole('button', { name: 'Loading...' })).toBeInTheDocument();
```

### Pitfall 3: Skipping Refactoring

**Problem:** Moving to next feature without cleaning up code.
**Solution:** Always allocate time for refactoring before starting new features.

### Pitfall 4: Brittle Tests

**Problem:** Tests that break easily with minor changes.
**Solution:** Use stable selectors, avoid CSS classes, focus on user-facing elements.

```typescript
// Brittle
expect(container.querySelector('.submit-button__primary')).toBeInTheDocument();

// Robust
expect(getByRole('button', { name: 'Submit' })).toBeInTheDocument();
```

## Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run contract tests (used in pre-commit hooks)
npm run test:contracts

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- BookingWidget.test.tsx
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ZOD Validation](https://zod.dev/)
- [TDD Best Practices](https://martinfowler.com/articles/test-driven-development.html)

---

*This TDD workflow document is part of the hotel website testing infrastructure. Follow these patterns to maintain high code quality and comprehensive test coverage.*