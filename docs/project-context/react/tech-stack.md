---
type: project-context
domain: tech-stack
language: react
version: 1.0.0
updated: 2025-12-11
applies_to: [dev-react]
project: et-llm-websites
---

# React/Next.js Technology Stack - Hotel Website Generator

> **Purpose**: Define all frontend technologies for hotel website generation.
> The dev-react agent uses this to generate compatible code.

## Core Framework

| Technology | Version | Notes |
|------------|---------|-------|
| React | 18.x | Functional components only |
| Next.js | 14.x | App Router |
| TypeScript | 5.0+ | Strict mode enabled |
| Node.js | 20.x LTS | Runtime |

### Next.js Configuration
- **Router**: App Router (`app/` directory)
- **Rendering**: Server Components by default
- **Client Components**: Only with `'use client'` directive
- **Output**: Static export for hotel sites

---

## Styling

| Technology | Version | Notes |
|------------|---------|-------|
| Tailwind CSS | 4.x | Utility-first |
| culori | 4.x | OKLCH color manipulation and palette generation |
| Shadcn/ui | Latest | Radix-based primitives |
| clsx | 2.x | Conditional classes |
| tailwind-merge | 2.x | Merge Tailwind classes |

### Responsive Design
- **Breakpoint**: 768px (single breakpoint)
- **Mobile**: Default styles (`<768px`)
- **Desktop**: `md:` prefix (`≥768px`)
- **Strategy**: Mobile-first

### Color System

The project uses a **unified OKLCH color system** with dynamic palette generation:

- **Color Format**: All colors are defined in OKLCH (`oklch(L C H)`) format
- **Palette Generation**: `culori` library generates shade scales (50-950) from base OKLCH colors using sine-wave chroma modulation
- **Semantic Tokens**: Base colors are mapped to 80+ semantic CSS custom properties via `useHotelTheme`
- **Contrast Validation**: APCA-based contrast measurement available (`contrast-validator.ts`) — currently test-only, not yet integrated into generation pipeline
- **Integration**: Tailwind v4 consumes CSS variables directly via `@theme inline` directive
- **Key Files**: `web-app/lib/color/` (palette engine), `web-app/lib/hooks/useHotelTheme.ts` (integration), `web-app/app/globals.css` (token definitions)

> **Important**: HEX and HSL color formats are NOT used in the implementation. All color values must be in OKLCH format.

### Component Styling
```typescript
import { cn } from '@/lib/utils';

// Always use cn() for conditional classes
<div className={cn(
  "base-classes",
  variant === 'primary' && "variant-classes",
  className
)} />
```

---

## Build & Development

| Tool | Version | Purpose |
|------|---------|---------|
| npm | 10.x | Package manager |
| Jest | 29.x | Unit/integration tests |
| ESLint | 8.x | Linting |
| Prettier | 3.x | Formatting |

### Commands
```bash
npm install           # Install dependencies
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm test              # Run Jest tests
npm test -- --config jest.config.workflow.js  # LangGraph tests
npm test -- --config jest.config.simple.js    # Lightweight tests
```

---

## Testing

| Tool | Purpose |
|------|---------|
| Jest | Test runner, assertions |
| React Testing Library | Component testing |

### Test Configurations
| Config | Purpose | Command |
|--------|---------|---------|
| `jest.config.js` | Default all tests | `npm test` |
| `jest.config.workflow.js` | LangGraph agent tests | `npm test -- --config jest.config.workflow.js` |
| `jest.config.simple.js` | Lightweight unit tests | `npm test -- --config jest.config.simple.js` |

### Critical Testing Patterns
```typescript
// LangGraph agent mocking - use prototype
Agent.prototype.method = jest.fn();

// Cost monitor - always reset
beforeEach(() => {
  costMonitor.reset();
});
```

---

## LLM Integration

| Technology | Version | Purpose |
|------------|---------|---------|
| LangGraph | 0.2+ | Multi-agent orchestration |
| LangFuse | 2.0+ | Cost tracking, observability |
| OpenRouter | - | LLM API gateway |
| Zod | 3.x | Schema validation |

### LLM Output Validation
```typescript
import { z } from 'zod';

// All LLM outputs must be validated with Zod
const OutputSchema = z.object({
  components: z.array(ComponentSchema),
  styles: StyleSchema,
});

const validated = OutputSchema.parse(llmOutput);
```

### Cost Tracking
```typescript
const result = await langfuseService.executeGeneration(
  'AgentName',
  { input, model, params },
  async () => llmCall()
);
```

---

## UI Components (4-Tier System)

### Tier 1: Primitives (Shadcn/ui)
Base components from Shadcn/ui library.
```
components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
└── ...
```

### Tier 2: Blocks
Hotel-specific components built from primitives.
```
components/blocks/
├── RoomCard.tsx
├── AmenityBadge.tsx
├── PriceDisplay.tsx
└── ...
```

### Tier 3: Sections
Page regions composed of blocks.
```
components/sections/
├── HeroSection.tsx
├── RoomGallery.tsx
├── AmenitiesGrid.tsx
└── ...
```

### Tier 4: Pages
Complete pages composed of sections.
```
app/
├── page.tsx           # Homepage
├── rooms/page.tsx     # Rooms listing
└── ...
```

---

## State Management

| Purpose | Approach |
|---------|----------|
| Generation State | LangGraph workflow state |
| UI State | React useState/useContext |
| Form State | React Hook Form + Zod |

### Workflow State
```typescript
interface WorkflowState {
  generationId: string;
  hotelParameters: GenerationInput;
  currentAgent: AgentType;
  agentOutputs: Record<AgentType, any>;
  budgetTracker: BudgetTracker;
  totalCost: number;
  errors: WorkflowError[];
}
```

---

## Environment Variables

### Required
```bash
# LLM Services
OPENROUTER_API_KEY=your-key
LANGFUSE_SECRET_KEY=your-key
LANGFUSE_PUBLIC_KEY=your-key
LANGFUSE_BASE_URL=https://cloud.langfuse.com

# Backend Services
DIRECTUS_URL=https://cms.example.com
DIRECTUS_TOKEN=your-token
EFFECTIVE_TOURS_API_KEY=your-key

# Storage
B2_ENDPOINT=https://s3.region.backblazeb2.com
B2_ACCESS_KEY_ID=your-key
B2_SECRET_ACCESS_KEY=your-secret
B2_BUCKET_NAME=your-bucket

# CloudFlare
CLOUDFLARE_API_TOKEN=your-token
CLOUDFLARE_ZONE_ID=your-zone
```

### Files
- `.env.local` - Local development (gitignored)
- `.env.example` - Template (committed)

---

## MUST NOT Use

- React class components
- Next.js Pages Router (`pages/` directory)
- `React.FC` type annotation
- `any` type in TypeScript
- CSS-in-JS (styled-components, emotion)
- moment.js (use date-fns if needed)

---

## Key Directories

```
web-app/
├── app/                # Next.js App Router
├── components/
│   ├── ui/            # Shadcn/ui primitives
│   ├── blocks/        # Hotel-specific blocks
│   └── sections/      # Page sections
├── lib/               # Utilities, LangGraph agents
├── types/             # TypeScript types
└── __tests__/         # Test files
```
