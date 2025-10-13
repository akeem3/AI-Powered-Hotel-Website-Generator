# Coding Standards: LLM-Driven Hotel Website Generator

> **Version:** 1.0  
> **Last Updated:** 2025-01-19  
> **Applies To:** All generated sites and platform code

## Overview

This document defines coding standards for both the generation platform and the generated hotel websites to ensure consistency, maintainability, and performance.

## TypeScript Standards

### Type Safety
```typescript
// ✅ Good - Strict typing
interface HotelComponentProps {
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
}

// ❌ Bad - Any types
const componentProps: any = { ... };
```

### Component Interfaces
```typescript
// ✅ Required for all components
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  // ... specific props
}

export interface ComponentMetadata {
  name: string;
  category: 'primitive' | 'block' | 'section' | 'page';
  tags: string[];
  variants: string[];
}
```

## React/Next.js Standards

### Component Structure
```typescript
// ✅ Standard component template
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Props interface
}

const ComponentName: FC<ComponentNameProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={cn("base-classes", className)}>
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

### File Naming
- **Components:** PascalCase (`HeroSection.tsx`)
- **Utilities:** camelCase (`formatPrice.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Types:** PascalCase (`HotelTypes.ts`)

## Tailwind CSS Standards

### Class Organization
```typescript
// ✅ Logical grouping and responsive design
<div className={cn(
  // Layout
  "flex flex-col gap-6",
  // Spacing
  "p-6 md:p-8 lg:p-12",
  // Typography
  "text-center text-gray-900",
  // Background/borders
  "bg-white rounded-lg shadow-lg",
  // Responsive
  "md:flex-row md:text-left",
  // Custom classes
  className
)}>
```

### Custom Design Tokens
```typescript
// tailwind.config.js structure
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        accent: 'var(--color-accent)',
      },
      spacing: {
        'sp-1': '0.25rem',
        'sp-2': '0.5rem',
        // ... up to sp-8
      },
      fontFamily: {
        'h1': 'var(--font-h1)',
        'h2': 'var(--font-h2)',
        'body': 'var(--font-body)',
      }
    }
  }
}
```

## LangGraph Integration Standards

### Agent Implementation
```typescript
// ✅ Standard agent structure
import { StateGraph, END } from "@langchain/langgraph";

interface AgentState {
  input: HotelParameters;
  selectedComponents: ComponentSelection[];
  generatedCSS: string;
  errors: string[];
}

const createComponentSelectorAgent = () => {
  return new StateGraph<AgentState>({
    channels: {
      input: null,
      selectedComponents: null,
      generatedCSS: null,
      errors: null,
    }
  });
};
```

### Error Handling
```typescript
// ✅ Consistent error handling
try {
  const result = await llmCall(prompt);
  return { success: true, data: result };
} catch (error) {
  // Log to LangFuse
  await langfuse.trace({
    name: "component_selection_error",
    error: error.message,
    metadata: { hotelId, timestamp: Date.now() }
  });
  
  return { success: false, error: error.message };
}
```

## Component Library Standards

### Component Categories
```typescript
// Type definitions for component hierarchy
type ComponentCategory = 'primitive' | 'block' | 'section' | 'page';

interface ComponentManifest {
  name: string;
  path: string;
  category: ComponentCategory;
  props: Record<string, any>;
  tags: string[];
  variants: string[];
  backendIntegration?: 'directus' | 'effective-tours' | 'both';
}
```

### Backend Integration
```typescript
// ✅ Standardized API integration
import { useDirectus } from '@/hooks/useDirectus';
import { useEffectiveTours } from '@/hooks/useEffectiveTours';

const HotelRoomCard: FC<RoomCardProps> = ({ roomId }) => {
  const { data: roomData, loading } = useDirectus(`/rooms/${roomId}`);
  const { checkAvailability } = useEffectiveTours();
  
  // Component logic
};
```

## Performance Standards

### Code Splitting
```typescript
// ✅ Lazy loading for heavy components
import dynamic from 'next/dynamic';

const BookingCalendar = dynamic(() => import('./BookingCalendar'), {
  loading: () => <div>Loading calendar...</div>,
  ssr: false
});
```

### Image Optimization
```typescript
// ✅ Next.js Image component usage
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={altText}
  width={600}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  className="object-cover"
/>
```

## Testing Standards

### Component Testing
```typescript
// ✅ Standard test structure
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders with required props', () => {
    render(
      <HeroSection
        title="Test Hotel"
        subtitle="Amazing stay"
        ctaText="Book Now"
        ctaUrl="/booking"
      />
    );
    
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
    expect(screen.getByText('Book Now')).toBeInTheDocument();
  });
});
```

### Snapshot Testing
```typescript
// ✅ Snapshot tests for visual regression
import { render } from '@testing-library/react';
import { HeroSection } from './HeroSection';

it('matches snapshot', () => {
  const { container } = render(
    <HeroSection {...defaultProps} />
  );
  expect(container.firstChild).toMatchSnapshot();
});
```

## Documentation Standards

### Component Documentation
```typescript
/**
 * HeroSection - Main hero banner for hotel homepages
 * 
 * @param title - Main headline text
 * @param subtitle - Supporting text below title
 * @param ctaText - Call-to-action button text
 * @param ctaUrl - Call-to-action button URL
 * @param backgroundImage - Optional background image URL
 * 
 * @example
 * <HeroSection
 *   title="Luxury Mountain Resort"
 *   subtitle="Experience nature in comfort"
 *   ctaText="Book Your Stay"
 *   ctaUrl="/booking"
 * />
 */
```

## LangFuse Integration Standards

### Tracing
```typescript
// ✅ Consistent tracing pattern
import { langfuse } from '@/lib/langfuse';

const trace = langfuse.trace({
  name: "hotel_generation",
  input: hotelParameters,
  metadata: {
    version: "1.0",
    timestamp: Date.now()
  }
});

// Track costs and performance
trace.span({
  name: "component_selection",
  input: componentCriteria,
  output: selectedComponents
});
```

## Git Standards

### Commit Messages
```bash
# ✅ Conventional commits format
feat(components): add RoomCard component with booking integration
fix(langgraph): resolve state management in component selector
docs(architecture): update LangFuse integration guide
refactor(tailwind): consolidate design token usage
```

### Branch Naming
```bash
# ✅ Clear branch naming
feature/hero-section-component
fix/langgraph-error-handling
refactor/component-library-structure
docs/coding-standards
```

## Quality Gates

### Pre-commit Hooks
- **ESLint:** No errors allowed
- **TypeScript:** Strict type checking
- **Prettier:** Code formatting
- **Tests:** All tests must pass
- **Build:** Successful compilation required

### Code Review Requirements
- **Type Safety:** All props and returns typed
- **Performance:** Core Web Vitals impact assessed
- **Accessibility:** WCAG 2.1 AA compliance
- **Backend Integration:** Proper error handling
- **Documentation:** Clear component documentation

---

*These standards apply to all code within the LLM-Driven Hotel Website Generator platform and generated websites.*