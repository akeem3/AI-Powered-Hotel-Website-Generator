---
type: project-context
domain: testing-standards
language: react
version: 1.1.0
updated: 2026-03-31
applies_to: [dev-react, test-generator]
project: et-llm-websites
---

# Testing Standards - Hotel Website Generator

> **Purpose**: Define testing patterns for React components and LangGraph workflows.
> All code MUST include tests following these standards.
>
> **Debugging & Execution**: See `.claude/skills/test-debug/SKILL.md` for test running, debugging, root-cause analysis, and parallel fix dispatch patterns.

## Testing Stack

| Tool | Purpose |
|------|---------|
| Jest | Test runner, assertions |
| React Testing Library | Component testing |

---

## Test Configurations

| Config | Scope | Command |
|--------|-------|---------|
| `jest.config.ts` | Default — components, integration, pages, fixtures | `cd web-app && npx jest --no-coverage --forceExit` |
| `jest.config.simple.js` | Unit tests (excludes langgraph, e2e) | `cd web-app && npx jest --config jest.config.simple.js --no-coverage --forceExit` |
| `jest.config.workflow.js` | LangGraph agents + e2e (serial, 5min timeout) | `cd web-app && npx jest --config jest.config.workflow.js --testPathPatterns="..." --no-coverage --forceExit` |

### Running Tests
```bash
# Targeted (preferred — always start here)
cd web-app && npx jest --testPathPatterns="tests/path/to/file" --no-coverage --forceExit

# Full suite by config
cd web-app && npx jest --no-coverage --forceExit
cd web-app && npx jest --config jest.config.simple.js --no-coverage --forceExit

# Workflow — ALWAYS targeted, never full suite (serial execution, minutes per file)
cd web-app && npx jest --config jest.config.workflow.js --testPathPatterns="tests/langgraph/agents/ContentGenerator" --no-coverage --forceExit
```

---

## LangGraph Agent Testing

### Critical Pattern: Prototype Mocking

For LangGraph agents, use prototype mocking to intercept methods:

```typescript
import { InputAnalyzerAgent } from '@/lib/agents/input-analyzer';

describe('InputAnalyzerAgent', () => {
  let originalMethod: typeof InputAnalyzerAgent.prototype.analyze;

  beforeEach(() => {
    // Save original
    originalMethod = InputAnalyzerAgent.prototype.analyze;

    // Mock on prototype
    InputAnalyzerAgent.prototype.analyze = jest.fn().mockResolvedValue({
      hotelType: 'boutique',
      targetMarket: 'couples',
    });
  });

  afterEach(() => {
    // Restore original
    InputAnalyzerAgent.prototype.analyze = originalMethod;
  });

  it('analyzes hotel input correctly', async () => {
    const agent = new InputAnalyzerAgent();
    const result = await agent.analyze(mockHotelData);

    expect(result.hotelType).toBe('boutique');
    expect(InputAnalyzerAgent.prototype.analyze).toHaveBeenCalledWith(mockHotelData);
  });
});
```

### Cost Monitor Reset

**MANDATORY**: Always reset cost monitor in `beforeEach()`:

```typescript
import { costMonitor } from '@/lib/cost-monitor';

describe('WorkflowWithCostTracking', () => {
  beforeEach(() => {
    costMonitor.reset();  // ALWAYS reset
  });

  it('tracks costs correctly', async () => {
    await runWorkflow();

    expect(costMonitor.getTotalCost()).toBeLessThan(2.0);
  });
});
```

---

## Component Testing

### Basic Component Test
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoomCard } from '@/components/blocks/RoomCard';

describe('RoomCard', () => {
  const mockRoom = {
    id: '1',
    name: 'Deluxe Suite',
    price: 299,
    image: '/room.webp',
  };

  it('displays room name and price', () => {
    render(<RoomCard room={mockRoom} />);

    expect(screen.getByText('Deluxe Suite')).toBeInTheDocument();
    expect(screen.getByText('$299')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const handleSelect = jest.fn();
    const user = userEvent.setup();

    render(<RoomCard room={mockRoom} onSelect={handleSelect} />);
    await user.click(screen.getByRole('button'));

    expect(handleSelect).toHaveBeenCalledWith('1');
  });
});
```

### Section Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { HeroSection } from '@/components/sections/HeroSection';

describe('HeroSection', () => {
  const mockHero = {
    title: 'Welcome to Paradise',
    subtitle: 'Luxury awaits',
    imageDesktop: '/hero.webp',
    imageMobile: '/hero.m.webp',
  };

  it('renders responsive images correctly', () => {
    render(<HeroSection {...mockHero} />);

    // Check for picture element with sources
    const picture = screen.getByRole('img').closest('picture');
    expect(picture).toBeInTheDocument();
  });

  it('displays title and subtitle', () => {
    render(<HeroSection {...mockHero} />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Paradise');
    expect(screen.getByText('Luxury awaits')).toBeInTheDocument();
  });
});
```

---

## Workflow Testing

### Testing Workflow State
```typescript
import { createWorkflow } from '@/lib/workflow';
import { WorkflowState } from '@/types';

describe('WebsiteGenerationWorkflow', () => {
  let workflow: ReturnType<typeof createWorkflow>;

  beforeEach(() => {
    costMonitor.reset();
    workflow = createWorkflow();
  });

  it('initializes with correct state', () => {
    const state = workflow.getState();

    expect(state.currentAgent).toBe('input-analyzer');
    expect(state.totalCost).toBe(0);
    expect(state.errors).toHaveLength(0);
  });

  it('transitions through agents correctly', async () => {
    await workflow.step(); // input-analyzer
    expect(workflow.getState().currentAgent).toBe('component-selector');

    await workflow.step(); // component-selector
    expect(workflow.getState().currentAgent).toBe('styling-agent');
  });

  it('enforces budget limits', async () => {
    // Mock expensive operation
    jest.spyOn(costMonitor, 'addCost').mockImplementation(() => {
      costMonitor['_totalCost'] = 2.5; // Over budget
    });

    await expect(workflow.run()).rejects.toThrow('Budget exceeded');
  });
});
```

---

## Standard Component Mocks

These mocks are used in most component tests:

```typescript
// Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

// Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Contract Validation
jest.mock('@/lib/contracts/validate.dev', () => ({
  validateInDev: jest.fn((schema, value) => value),
}));

// Registry (example)
jest.mock('@/registry/roomRegistry', () => ({
  RoomCardRegistry: {
    name: 'RoomCard',
    tier: 'blocks',
    variants: ['compact', 'detailed', 'grid'],
  },
}));
```

### Test Setup Pattern
```typescript
describe('Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test cases...
});
```

---

## Mocking External Services

### LangFuse
```typescript
jest.mock('@/lib/langfuse', () => ({
  langfuseService: {
    executeGeneration: jest.fn(async (name, params, fn) => {
      const result = await fn();
      return { result, cost: 0.01 };
    }),
    trackCost: jest.fn(),
  },
}));
```

### OpenRouter/LLM
```typescript
jest.mock('@/lib/llm', () => ({
  generateCompletion: jest.fn().mockResolvedValue({
    content: '{"components": [], "styles": {}}',
    usage: { totalTokens: 100 },
  }),
}));
```

### External APIs
```typescript
jest.mock('@/lib/api/effective-tours', () => ({
  fetchHotelData: jest.fn().mockResolvedValue({
    id: 'hotel-1',
    name: 'Test Hotel',
    rooms: [],
  }),
}));
```

---

## Query Priority (React Testing Library)

Use queries in this order:

| Priority | Query | Use When |
|----------|-------|----------|
| 1 | `getByRole` | Interactive elements |
| 2 | `getByLabelText` | Form inputs |
| 3 | `getByText` | Non-interactive text |
| 4 | `getByTestId` | Last resort |

```typescript
// Preferred
screen.getByRole('button', { name: /book now/i });
screen.getByRole('heading', { level: 1 });

// Acceptable
screen.getByText(/welcome/i);

// Avoid (use only when necessary)
screen.getByTestId('room-card');
```

---

## Coverage Requirements

| Category | Minimum | Target |
|----------|---------|--------|
| Components | 60% | 80% |
| LangGraph Agents | 80% | 90% |
| Utilities | 80% | 95% |
| Workflow Logic | 90% | 100% |

### What to Test
- User interactions
- Conditional rendering
- Error states
- Loading states
- Agent transitions
- Cost calculations
- Validation logic

### What NOT to Test
- Implementation details
- Third-party library internals
- Static UI without logic
- Tailwind class names

---

## Test File Organization

```
web-app/tests/
├── components/          # Block & section component tests
│   ├── blocks/
│   └── preview/
├── pages/               # Page-level tests
├── integration/         # Cross-component integration
├── lib/                 # Utility & generation tests
│   └── generation/      # splitToPages, multiplyContent, seedBank
├── fixtures/            # Schema validation tests
├── langgraph/           # Agent tests (workflow config)
│   ├── agents/
│   └── services/
├── e2e/                 # End-to-end tests (workflow config)
├── performance/         # Render timing benchmarks
├── responsive/          # Breakpoint tests
├── accessibility/       # ARIA & semantic tests
├── contracts/           # Zod contract validation
└── scripts/             # CLI script tests
```

---

## Pre-Commit Checklist

Before marking a story complete:

- [ ] Targeted tests pass for changed files
- [ ] Full suite passes (`jest.config.simple.js` + default `jest.config.ts`)
- [ ] No skipped tests without documented reason
- [ ] Coverage meets thresholds
- [ ] Cost monitor reset in all tests with cost tracking
- [ ] Prototype mocking for LangGraph agents
- [ ] Performance/timing tests verified in isolation if flaky under full suite

> For debugging failures, see `.claude/skills/test-debug/SKILL.md`
